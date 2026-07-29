import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'HORECA') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const profile = await prisma.horecaProfile.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'HORECA') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      companyName, kvkNumber, vatNumber,
      street, houseNumber, postalCode, city, province,
      contactName, contactRole, website, description,
    } = body

    const companyPropre = (companyName || '').trim()
    const kvkPropre = (kvkNumber || '').trim()
    const postalPropre = (postalCode || '').trim()
    const cityPropre = (city || '').trim()

    // Champs obligatoires (identiques à l'inscription)
    const manquants: string[] = []
    if (!companyPropre) manquants.push('companyName')
    if (!kvkPropre) manquants.push('kvkNumber')
    if (!postalPropre) manquants.push('postalCode')
    if (!cityPropre) manquants.push('city')
    if (manquants.length > 0) {
      return NextResponse.json(
        { error: `Verplichte velden ontbreken: ${manquants.join(', ')}`, manquants },
        { status: 400 }
      )
    }

    const data = {
      companyName: companyPropre,
      kvkNumber: kvkPropre,
      vatNumber: (vatNumber || '').trim().toUpperCase() || null,
      street: (street || '').trim() || null,
      houseNumber: (houseNumber || '').trim() || null,
      postalCode: postalPropre,
      city: cityPropre,
      province: (province || '').trim() || null,
      contactName: (contactName || '').trim() || null,
      contactRole: (contactRole || '').trim() || null,
      website: (website || '').trim() || null,
      description: (description || '').trim() || null,
    }

    const profile = await prisma.horecaProfile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, ...data },
      update: data,
    })

    return NextResponse.json({ profile })
  } catch (error) {
    // Conflit d'unicité : le numéro KvK est déjà utilisé par un autre compte
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'KvK-nummer is al in gebruik door een ander account.', champ: 'kvkNumber' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
