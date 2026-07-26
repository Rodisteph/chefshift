import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emailShiftBevestigd } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'HORECA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shiftId = params.id
    const { kokId } = await req.json()

    const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
    if (!shift || shift.horecaId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updated = await prisma.shift.update({
      where: { id: shiftId },
      data: { status: 'CONFIRMED', chosenKokId: kokId, confirmedAt: new Date() }
    })

    await prisma.application.updateMany({
      where: { shiftId, kokId: { not: kokId } },
      data: { status: 'REJECTED' }
    })
    await prisma.application.updateMany({
      where: { shiftId, kokId },
      data: { status: 'ACCEPTED' }
    })

    await prisma.notification.create({
      data: {
        userId: kokId,
        type: 'SHIFT_CONFIRMED',
        title: 'Shift bevestigd!',
        message: `Je bent gekozen voor: ${shift.title}`,
        shiftId,
      }
    })

    // Email au chef : choisi pour le shift
    const kok = await prisma.user.findUnique({ where: { id: kokId } })
    if (kok?.email) {
      const datum = new Date(shift.date).toLocaleDateString('nl-NL', {
        weekday: 'long', day: 'numeric', month: 'long',
      })
      await emailShiftBevestigd(kok.email, shiftId, shift.title, datum)
    }

    return NextResponse.json({ shift: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
