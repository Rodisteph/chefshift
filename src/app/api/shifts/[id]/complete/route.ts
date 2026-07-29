import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const shiftId = params.id
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
    if (!shift) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (session.user.role === 'HORECA' && shift.horecaId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updated = await prisma.shift.update({
      where: { id: shiftId },
      data: { status: 'COMPLETED' }
    })

    // Commission plateforme : 15% du montant TTC
    const platformFee = (shift.totalAmount || 0) * 0.15
    const kokPayout = (shift.totalAmount || 0) - platformFee
    const vatAmount = (shift.totalAmount || 0) * (shift.vatRate / 100)
    const count = await prisma.invoice.count()

    await prisma.invoice.create({
      data: {
        shiftId,
        horecaId: shift.horecaId,
        amountExclVat: shift.totalAmount || 0,
        vatAmount,
        amountInclVat: (shift.totalAmount || 0) + vatAmount,
        platformFee,
        kokPayout,
        status: 'PENDING',
        invoiceNumber: `CHEF-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`,
      }
    })

    if (shift.chosenKokId) {
      await prisma.notification.create({
        data: {
          userId: shift.chosenKokId,
          type: 'PAYMENT_RECEIVED',
          title: 'Shift voltooid',
          message: `Je shift "${shift.title}" is voltooid. Betaling volgt binnen 48 uur.`,
          shiftId,
        }
      })
    }

    return NextResponse.json({ shift: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
