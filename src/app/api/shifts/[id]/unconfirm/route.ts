import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Désélectionner le chef choisi — le shift redevient ouvert
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'ADMIN'
    if (!session || (session.user.role !== 'HORECA' && !isAdmin)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shift = await prisma.shift.findUnique({
      where: { id: params.id },
      include: { invoice: true },
    })
    if (!shift || (!isAdmin && shift.horecaId !== session.user.id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (shift.invoice?.status === 'PAID') {
      return NextResponse.json({ error: 'Already paid' }, { status: 400 })
    }
    // On ne peut plus désélectionner le chef à moins de 24 h du début du shift (sauf admin)
    if (!isAdmin) {
      const dateStr = new Date(shift.date).toISOString().slice(0, 10)
      const st = new Date(shift.startTime)
      const hh = String(st.getUTCHours()).padStart(2, '0')
      const mm = String(st.getUTCMinutes()).padStart(2, '0')
      const debut = new Date(`${dateStr}T${hh}:${mm}:00.000Z`).getTime()
      if (Date.now() >= debut - 24 * 3600 * 1000) {
        return NextResponse.json({ error: 'Too close to shift start' }, { status: 400 })
      }
    }

    const updated = await prisma.shift.update({
      where: { id: shift.id },
      data: { status: 'OPEN', chosenKokId: null, confirmedAt: null },
    })

    // Toutes les candidatures redeviennent en attente
    await prisma.application.updateMany({
      where: { shiftId: shift.id },
      data: { status: 'PENDING' },
    })

    // Supprimer la facture en attente éventuelle
    await prisma.invoice.deleteMany({
      where: { shiftId: shift.id, status: 'PENDING' },
    })

    return NextResponse.json({ shift: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
