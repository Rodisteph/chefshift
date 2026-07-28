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
    // On ne peut plus désélectionner le chef d'un shift passé (sauf admin)
    const aujourdhui = new Date(new Date().toDateString())
    if (!isAdmin && new Date(shift.date) < aujourdhui) {
      return NextResponse.json({ error: 'Shift already passed' }, { status: 400 })
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
