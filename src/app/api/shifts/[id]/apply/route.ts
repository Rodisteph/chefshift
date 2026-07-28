import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emailNouvelleCandidature } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'KOK') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shiftId = params.id
    const body = await req.json()
    const { message, proposedRate } = body

    const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
    if (!shift || shift.status !== 'OPEN') {
      return NextResponse.json({ error: 'Shift not available' }, { status: 400 })
    }

    // On ne peut pas postuler à un shift dont la date est déjà passée
    const aujourdhui = new Date(new Date().toDateString())
    if (new Date(shift.date) < aujourdhui) {
      return NextResponse.json({ error: 'Shift date has passed' }, { status: 400 })
    }

    const existing = await prisma.application.findUnique({
      where: { shiftId_kokId: { shiftId, kokId: session.user.id } }
    })
    if (existing) {
      return NextResponse.json({ error: 'Already applied' }, { status: 400 })
    }

    const application = await prisma.application.create({
      data: { shiftId, kokId: session.user.id, message, proposedRate }
    })

    await prisma.notification.create({
      data: {
        userId: shift.horecaId,
        type: 'NEW_APPLICATION',
        title: 'Nieuwe kandidaat',
        message: `Iemand heeft gereageerd op: ${shift.title}`,
        shiftId,
      }
    })

    // Email à l'horeca : nouvelle candidature
    const [horeca, kok] = await Promise.all([
      prisma.user.findUnique({ where: { id: shift.horecaId } }),
      prisma.user.findUnique({ where: { id: session.user.id } }),
    ])
    if (horeca?.email) {
      await emailNouvelleCandidature(
        horeca.email,
        shiftId,
        shift.title,
        kok?.name || 'Een kok'
      )
    }

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
