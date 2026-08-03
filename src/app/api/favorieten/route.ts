import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET : liste des chefs favoris de l'horeca connectée
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'HORECA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const favs = await prisma.favoriteKok.findMany({
      where: { horecaId: session.user.id },
      select: { kokId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    const kokIds = favs.map((f) => f.kokId)

    // ?detail=1 : profils complets, pour la page "Mijn koks".
    // Sans ce parametre on garde la reponse legere (juste les ids), utilisee
    // par l'etoile de la page shift.
    const url = new URL(_req.url)
    if (url.searchParams.get('detail') !== '1') {
      return NextResponse.json({ kokIds })
    }

    const koks = kokIds.length
      ? await prisma.user.findMany({
          where: { id: { in: kokIds } },
          select: {
            id: true,
            name: true,
            kokProfile: {
              select: {
                function: true,
                city: true,
                averageScore: true,
                reviewCount: true,
                hourlyRateMin: true,
                hourlyRateMax: true,
              },
            },
          },
        })
      : []

    // Nombre de shifts deja effectues ensemble : c'est ce qui justifie
    // qu'un kok soit dans la liste, plus que la date d'ajout.
    const samen = await prisma.shift.groupBy({
      by: ['chosenKokId'],
      where: { horecaId: session.user.id, chosenKokId: { in: kokIds.length ? kokIds : ['-'] } },
      _count: { _all: true },
    })
    const parKok = new Map(samen.map((r) => [r.chosenKokId, r._count._all]))

    const ordre = new Map<string, number>(kokIds.map((id, i) => [id, i]))
    const detail = koks
      .map((k) => ({ ...k, shiftsSamen: parKok.get(k.id) ?? 0 }))
      .sort((a, b) => (ordre.get(a.id) ?? 0) - (ordre.get(b.id) ?? 0))

    return NextResponse.json({ kokIds, koks: detail })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST : bascule un favori { kokId } -> { favorite: boolean }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'HORECA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json().catch(() => ({}))
    const kokId = body?.kokId
    if (!kokId || typeof kokId !== 'string') {
      return NextResponse.json({ error: 'kokId requis' }, { status: 400 })
    }
    const where = { horecaId_kokId: { horecaId: session.user.id, kokId } }
    const existant = await prisma.favoriteKok.findUnique({ where })
    if (existant) {
      await prisma.favoriteKok.delete({ where })
      return NextResponse.json({ favorite: false })
    }
    await prisma.favoriteKok.create({ data: { horecaId: session.user.id, kokId } })
    return NextResponse.json({ favorite: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
