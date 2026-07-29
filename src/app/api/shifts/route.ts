import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MIN_HOURLY_RATE } from '@/lib/constants'
import { euroNaarCenten, afrondenHalfUp } from '@/lib/factuur'
import { emailShiftVoorWhatsApp } from '@/lib/email'

const INCLUSIONS = {
  horeca: { include: { horecaProfile: true } },
  chosenKok: { include: { kokProfile: true } },
  invoice: { select: { status: true } },
  _count: { select: { applications: true } },
} as const

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const where: any = {}

    // ?passe=1 : shifts terminés (date passée) qui concernent l'utilisateur
    if (searchParams.get('passe') === '1') {
      const aujourdhui = new Date(new Date().toDateString())
      where.date = { lt: aujourdhui }
      if (session.user.role === 'HORECA') where.horecaId = session.user.id
      if (session.user.role === 'KOK') where.chosenKokId = session.user.id
      const shifts = await prisma.shift.findMany({
        where,
        include: INCLUSIONS,
        orderBy: [{ date: 'desc' }],
      })
      return NextResponse.json({ shifts })
    }

    if (session.user.role === 'HORECA') where.horecaId = session.user.id
    if (session.user.role === 'KOK') {
      // Shifts disponibles : ouverts ET dont la date n'est pas passée
      where.status = 'OPEN'
      where.date = { gte: new Date(new Date().toDateString()) }
    }
    if (searchParams.get('status')) where.status = searchParams.get('status')?.toUpperCase()

    const shifts = await prisma.shift.findMany({
      where,
      include: INCLUSIONS,
      orderBy: [{ isUrgent: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ shifts })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'HORECA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    const shift = await prisma.shift.create({
      data: {
        horecaId: session.user.id,
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
        isUrgent: isUrgent || false,
      },
    })

    // E-mail au propriétaire avec le message WhatsApp prêt à copier-coller (ne bloque jamais la création)
    try {
      const horeca = await prisma.horecaProfile.findUnique({ where: { userId: session.user.id } })
      await emailShiftVoorWhatsApp({
        shiftId: shift.id,
        titel: shift.title,
        functie: shift.function,
        datum: shift.date.toISOString().slice(0, 10),
        start: startTime,
        eind: endTime,
        tarief: rateEuro,
        stad: locationCity || '',
        bedrijf: horeca?.companyName || '',
        urgent: !!isUrgent,
      })
    } catch {}

    return NextResponse.json({ shift }, { status: 201 })
  } catch (error) {
    console.error('POST shift error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
