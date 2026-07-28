import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verstuurPush } from '@/lib/push'
import { emailEindtijdBevestigd } from '@/lib/email'

async function ensureTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS shift_end (
      shift_id TEXT PRIMARY KEY,
      reported_end TIMESTAMP NOT NULL,
      reported_at TIMESTAMP DEFAULT now(),
      confirmed_at TIMESTAMP
    )
  `
}

// POST : l'horeca (ou un admin) confirme l'heure de fin.
// body optionnel { endTime: "HH:MM" } : permet au restaurant de saisir/corriger l'heure
// même si le chef ne l'a pas déclarée. Une fois confirmée, seule un compte admin peut modifier.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'ADMIN'
    if (!session?.user || (session.user.role !== 'HORECA' && !isAdmin)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shift = await prisma.shift.findUnique({ where: { id: params.id } })
    if (!shift || (!isAdmin && shift.horecaId !== session.user.id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (!shift.chosenKokId) {
      return NextResponse.json({ error: 'No chef chosen' }, { status: 400 })
    }

    await ensureTable()

    const body = await req.json().catch(() => ({}))
    const endTime = typeof body?.endTime === 'string' ? body.endTime : ''

    const lignes: { reported_end: Date; confirmed_at: Date | null }[] = await prisma.$queryRaw`
      SELECT reported_end, confirmed_at FROM shift_end WHERE shift_id = ${shift.id} LIMIT 1
    `
    // Une fois confirmée, plus de modification sauf pour un admin
    if (lignes.length > 0 && lignes[0].confirmed_at && !isAdmin) {
      return NextResponse.json({ error: 'Already confirmed' }, { status: 400 })
    }

    // Heure de fin finale : saisie fournie > heure déclarée par le chef > horaire prévu
    const debut = new Date(shift.startTime)
    const startMin = debut.getHours() * 60 + debut.getMinutes()
    let fin: Date
    if (/^\d{2}:\d{2}$/.test(endTime)) {
      const [h, m] = endTime.split(':').map(Number)
      fin = new Date(shift.date)
      fin.setHours(h, m, 0, 0)
      if (h * 60 + m < startMin) fin.setDate(fin.getDate() + 1)
    } else if (lignes.length > 0) {
      fin = new Date(lignes[0].reported_end)
    } else {
      const et = new Date(shift.endTime)
      fin = new Date(shift.date)
      fin.setHours(et.getHours(), et.getMinutes(), 0, 0)
      if (et.getHours() * 60 + et.getMinutes() <= startMin) fin.setDate(fin.getDate() + 1)
    }

    await prisma.$executeRaw`
      INSERT INTO shift_end (shift_id, reported_end, reported_at, confirmed_at)
      VALUES (${shift.id}, ${fin}, now(), now())
      ON CONFLICT (shift_id) DO UPDATE SET reported_end = ${fin}, confirmed_at = now()
    `

    const eindtijd = new Date(fin).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })

    // Email + push au chef
    const kok = await prisma.user.findUnique({ where: { id: shift.chosenKokId } })
    if (kok?.email) {
      await emailEindtijdBevestigd(kok.email, shift.id, shift.title, eindtijd)
    }
    await verstuurPush(
      shift.chosenKokId,
      'ChefShift',
      `Je eindtijd voor "${shift.title}" (${eindtijd}) is bevestigd.`,
      `/shifts/${shift.id}`
    )

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
