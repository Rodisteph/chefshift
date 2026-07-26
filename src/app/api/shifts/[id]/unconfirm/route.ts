import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Désélectionner le chef choisi — le shift redevient ouvert
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'HORECA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shift = await prisma.shift.findUnique({
      where: { id: params.id },
      include: { invoice: true },
    })
    if (!shift || shift.horecaId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (shift.invoice?.status === 'PAID') {
      return NextResponse.json({ error: 'Already paid' }, { status: 400 })
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
