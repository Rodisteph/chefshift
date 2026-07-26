import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import webpush from 'web-push'

// Tables auto-créées : abonnements push + journal des rappels envoyés
async function ensureTables() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS kok_push (
      endpoint TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    )
  `
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS kok_reminder (
      shift_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      sent_at TIMESTAMP DEFAULT now(),
      PRIMARY KEY (shift_id, kind)
    )
  `
}

type Sub = { endpoint: string; p256dh: string; auth: string }

// GET : appelé par un minuteur externe (cron-job.org) toutes les 15 minutes
// Clé acceptée via header Authorization: Bearer <secret> OU via ?secret=<secret>
export async function GET(req: NextRequest) {
  try {
    const secret = (process.env.CRON_SECRET || '').trim()
    const headerOk = req.headers.get('authorization') === `Bearer ${secret}`
    const queryOk = req.nextUrl.searchParams.get('secret') === secret
    if (secret && !headerOk && !queryOk) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const priv = process.env.VAPID_PRIVATE_KEY
    if (!pub || !priv) {
      return NextResponse.json({ ok: false, reason: 'VAPID keys not configured' })
    }
    webpush.setVapidDetails('mailto:info@chefshift.nl', pub, priv)

    await ensureTables()

    const maintenant = Date.now()
    const heure = 3600 * 1000
    const fenetres = [
      { kind: 'H24', min: maintenant + 23.75 * heure, max: maintenant + 24.25 * heure, delai: '24 uur' },
      { kind: 'H2', min: maintenant + 1.75 * heure, max: maintenant + 2.25 * heure, delai: '2 uur' },
    ]

    let envoyes = 0
    const erreurs: string[] = []

    for (const f of fenetres) {
      const shifts = await prisma.shift.findMany({
        where: {
          status: 'CONFIRMED',
          chosenKokId: { not: null },
          startTime: { gte: new Date(f.min), lte: new Date(f.max) },
        },
      })

      for (const shift of shifts) {
        const deja: { shift_id: string }[] = await prisma.$queryRaw`
          SELECT shift_id FROM kok_reminder WHERE shift_id = ${shift.id} AND kind = ${f.kind} LIMIT 1
        `
        if (deja.length > 0) continue

        const subs: Sub[] = await prisma.$queryRaw`
          SELECT endpoint, p256dh, auth FROM kok_push WHERE user_id = ${shift.chosenKokId}
        `

        for (const s of subs) {
          try {
            await webpush.sendNotification(
              { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
              JSON.stringify({
                title: 'ChefShift',
                body: `Herinnering: je shift "${shift.title}" begint over ${f.delai}.`,
                url: '/dashboard',
              })
            )
            envoyes++
          } catch (e: any) {
            erreurs.push(e?.message || 'push error')
            // Abonnement mort : on le supprime
            if (e?.statusCode === 404 || e?.statusCode === 410) {
              await prisma.$executeRaw`DELETE FROM kok_push WHERE endpoint = ${s.endpoint}`
            }
          }
        }

        await prisma.$executeRaw`
          INSERT INTO kok_reminder (shift_id, kind, sent_at)
          VALUES (${shift.id}, ${f.kind}, now())
          ON CONFLICT DO NOTHING
        `
      }
    }

    return NextResponse.json({ ok: true, envoyes, erreurs: erreurs.slice(0, 5) })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
