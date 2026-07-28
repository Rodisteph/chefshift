import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    if (session.user.role === 'KOK') where.status = 'OPEN'
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

    const start = new Date(`${date}T${startTime}`)
    const end = new Date(`${date}T${endTime}`)
    const hours = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60) - 0.5)
    const totalAmount = hours * hourlyRate

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
        hourlyRate,
        totalAmount,
        isUrgent: isUrgent || false,
      },
    })

    return NextResponse.json({ shift }, { status: 201 })
  } catch (error) {
    console.error('POST shift error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
