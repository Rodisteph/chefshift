import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MIN_HOURLY_RATE } from '@/lib/constants'
import { euroNaarCenten, afrondenHalfUp } from '@/lib/factuur'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const shift = await prisma.shift.findUnique({
      where: { id: params.id },
      include: {
        horeca: { include: { horecaProfile: true } },
        chosenKok: { include: { kokProfile: true } },
        invoice: true,
        applications: {
          include: {
            kok: {
              include: {
                kokProfile: {
                  include: {
                    workExperience: { orderBy: { fromDate: 'desc' } },
                  },
                },
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    })

    if (!shift) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (session.user.role === 'HORECA' && shift.horecaId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Heure de fin déclarée / confirmée (table créée à la première déclaration)
    let eind = null
    try {
      const lignes: { reported_end: Date; confirmed_at: Date | null }[] = await prisma.$queryRaw`
        SELECT reported_end, confirmed_at FROM shift_end WHERE shift_id = ${params.id} LIMIT 1
      `
      if (lignes.length > 0) {
        eind = { reportedEnd: lignes[0].reported_end, confirmedAt: lignes[0].confirmed_at }
      }
    } catch {}

    return NextResponse.json({ shift: { ...shift, eind } })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT : modifier un shift (uniquement si ouvert et aucun chef choisi)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'HORECA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shift = await prisma.shift.findUnique({ where: { id: params.id } })
    if (!shift || shift.horecaId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (shift.status !== 'OPEN' || shift.chosenKokId) {
      return NextResponse.json({ error: 'Shift can no longer be edited' }, { status: 400 })
    }

    const body = await req.json()
    const { title, function: func, date, startTime, endTime, hourlyRate, locationStreet, locationPostal, locationCity, isUrgent } = body

    const rateEuro = Number(hourlyRate)
    if (!(rateEuro >= MIN_HOURLY_RATE)) {
      return NextResponse.json({ error: 'RATE_TOO_LOW', min: MIN_HOURLY_RATE }, { status: 400 })
    }

    // Heures "wall-clock" : stockées en composantes UTC, sans conversion de fuseau
    const start = new Date(`1970-01-01T${startTime}:00.000Z`)
    const end = new Date(`1970-01-01T${endTime}:00.000Z`)
    let durMin = (end.getUTCHours() * 60 + end.getUTCMinutes()) - (start.getUTCHours() * 60 + start.getUTCMinutes())
    if (durMin <= 0) durMin += 1440
    const hours = Math.max(0, durMin / 60 - 0.5)
    const rate = euroNaarCenten(rateEuro) // stockage en centimes
    const totalAmount = afrondenHalfUp(hours * rate)

    const updated = await prisma.shift.update({
      where: { id: params.id },
      data: {
        title,
        function: func || title,
        date: new Date(date),
        startTime: start,
        endTime: end,
        locationStreet: locationStreet || null,
        locationPostal: locationPostal || null,
        locationCity,
        hourlyRate: rate,
        totalAmount,
        isUrgent: !!isUrgent,
      },
    })

    return NextResponse.json({ shift: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
