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

// POST : l'horeca confirme l'heure de fin déclarée par le chef
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'HORECA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shift = await prisma.shift.findUnique({ where: { id: params.id } })
    if (!shift || shift.horecaId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (!shift.chosenKokId) {
      return NextResponse.json({ error: 'No chef chosen' }, { status: 400 })
    }

    await ensureTable()

    const lignes: { reported_end: Date; confirmed_at: Date | null }[] = await prisma.$queryRaw`
      SELECT reported_end, confirmed_at FROM shift_end WHERE shift_id = ${shift.id} LIMIT 1
    `
    if (lignes.length === 0) {
      return NextResponse.json({ error: 'No end time reported' }, { status: 400 })
    }
    if (lignes[0].confirmed_at) {
      return NextResponse.json({ error: 'Already confirmed' }, { status: 400 })
    }

    await prisma.$executeRaw`
      UPDATE shift_end SET confirmed_at = now() WHERE shift_id = ${shift.id}
    `

    const eindtijd = new Date(lignes[0].reported_end).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })

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
