import { prisma } from '@/lib/prisma'
import webpush from 'web-push'

// Table des abonnements push (auto-créée)
export async function ensurePushTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS kok_push (
      endpoint TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    )
  `
}

type Sub = { endpoint: string; p256dh: string; auth: string }

// Envoie une notification push à un utilisateur. Retourne le nombre envoyé.
export async function verstuurPush(userId: string, title: string, body: string, url: string): Promise<number> {
  const pub = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '').trim().replace(/=+$/, '')
  const priv = (process.env.VAPID_PRIVATE_KEY || '').trim().replace(/=+$/, '')
  if (!pub || !priv) return 0

  try {
    webpush.setVapidDetails('mailto:info@chefshift.nl', pub, priv)
    await ensurePushTable()
    const subs: Sub[] = await prisma.$queryRaw`
      SELECT endpoint, p256dh, auth FROM kok_push WHERE user_id = ${userId}
    `
    let envoyes = 0
    for (const s of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title, body, url })
        )
        envoyes++
      } catch (e: any) {
        if (e?.statusCode === 404 || e?.statusCode === 410) {
          await prisma.$executeRaw`DELETE FROM kok_push WHERE endpoint = ${s.endpoint}`
        }
      }
    }
    return envoyes
  } catch {
    return 0
  }
}
