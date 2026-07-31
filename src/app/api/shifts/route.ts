import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { euroNaarCenten, afrondenHalfUp, berekenUrenMinuten, minutenVanTijd } from '@/lib/factuur'
import { MIN_HOURLY_RATE, STANDAARD_PAUZE_MIN } from '@/lib/constants'
import { emailShiftVoorWhatsApp } from '@/lib/email'

const INCLUSIONS = {
  horeca: { include: { horecaProfile: true } },
  chosenKok: { include: { kokProfile: true } },
  invoice: { select: { status: true } },
  _count: { select: { applications: true } },
} as const

// Ajoute l'eindtijd (table shift_end, sans relation dans le schéma) à chaque shift
async function avecEind<T extends { id: string }>(shifts: T[]) {
  const ids = shifts.map((s) => s.id)
  const fins = ids.length > 0
    ? await prisma.shiftEnd.findMany({ where: { shiftId: { in: ids } } })
    : []
  const parId = new Map(fins.map((f) => [f.shiftId, f]))
  return shifts.map((s) => {
    const f = parId.get(s.id)
    return { ...s, eind: f ? { reportedEnd: f.reportedEnd, confirmedAt: f.confirmedAt } : null }
  })
}

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
      return NextResponse.json({ shifts: await avecEind(shifts) })
    }

    // Vues dédiées du chef : ses shifts à venir, ses candidatures, ses shifts acceptés
    if (session.user.role === 'KOK') {
      const vue = searchParams.get('vue')
      const aujourdhui = new Date(new Date().toDateString())
      if (vue === 'avenir' || vue === 'acceptees') {
        where.chosenKokId = session.user.id
        if (vue === 'avenir') where.date = { gte: aujourdhui }
        const shifts = await prisma.shift.findMany({
          where,
          include: INCLUSIONS,
          orderBy: [{ date: vue === 'avenir' ? 'asc' : 'desc' }],
        })
        return NextResponse.json({ shifts: await avecEind(shifts) })
      }
      if (vue === 'candidatures') {
        where.applications = { some: { kokId: session.user.id } }
        where.date = { gte: aujourdhui }
        const shifts = await prisma.shift.findMany({
          where,
          include: INCLUSIONS,
          orderBy: [{ date: 'asc' }],
        })
        return NextResponse.json({ shifts: await avecEind(shifts) })
      }
    }

    // Vues dédiées de la horeca : shifts avec candidatures reçues, chefs engagés
    if (session.user.role === 'HORECA') {
      const vue = searchParams.get('vue')
      if (vue === 'candidatures' || vue === 'acceptees') {
        where.horecaId = session.user.id
        if (vue === 'candidatures') where.applications = { some: {} }
        if (vue === 'acceptees') where.chosenKokId = { not: null }
        const shifts = await prisma.shift.findMany({
          where,
          include: INCLUSIONS,
          orderBy: [{ date: 'desc' }],
        })
        return NextResponse.json({ shifts: await avecEind(shifts) })
      }
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

    return NextResponse.json({ shifts: await avecEind(shifts) })
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
    const { title, function: func, date, startTime, endTime, hourlyRate, locationStreet, locationPostal, locationCity, isUrgent, spoedtoeslagPct, breakMinutes } = body

    // Supplément d'urgence : uniquement 0, 10, 15 ou 20 (% du tarif de base)
    const pct = [0, 10, 15, 20].includes(Number(spoedtoeslagPct)) ? Number(spoedtoeslagPct) : 0

    const rateEuro = Number(hourlyRate)
    if (!(rateEuro >= MIN_HOURLY_RATE)) {
      return NextResponse.json({ error: 'RATE_TOO_LOW', min: MIN_HOURLY_RATE }, { status: 400 })
    }

    // Heures "wall-clock" : stockées en composantes UTC, sans conversion de fuseau
    const start = new Date(`1970-01-01T${startTime}:00.000Z`)
    const end = new Date(`1970-01-01T${endTime}:00.000Z`)
    const startMin = minutenVanTijd(start)
    const endMin = minutenVanTijd(end)
    // Pause : reprise du corps de requête si fournie, sinon le défaut métier.
    // Elle est persistée pour que la facture se base sur la même valeur.
    const pauzeMin = breakMinutes != null
      ? Math.max(0, Math.min(480, Math.round(Number(breakMinutes))))
      : STANDAARD_PAUZE_MIN
    // Même fonction que la facturation : minimum d'une heure inclus.
    // Un calcul inline divergent affichait 0,5 h sur un shift d'une heure.
    const hours = berekenUrenMinuten(startMin, endMin, pauzeMin) / 60
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
        breakMinutes: pauzeMin,
        isUrgent: !!isUrgent || pct > 0,
        spoedtoeslagPct: pct,
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
