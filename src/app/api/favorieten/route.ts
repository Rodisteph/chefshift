import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET : liste des chefs favoris de l'horeca connectée
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'HORECA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const favs = await prisma.favoriteKok.findMany({
      where: { horecaId: session.user.id },
      select: { kokId: true },
    })
    return NextResponse.json({ kokIds: favs.map((f) => f.kokId) })
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
