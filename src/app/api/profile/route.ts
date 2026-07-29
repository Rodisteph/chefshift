import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Table banque auto-créée (pas de migration nécessaire)
async function ensureBankTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS kok_bank (
      kok_id TEXT PRIMARY KEY,
      iban TEXT,
      updated_at TIMESTAMP DEFAULT now()
    )
  `
}

// Table adresse facturation auto-créée (pas de migration nécessaire)
async function ensureAdresTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS kok_adres (
      kok_id TEXT PRIMARY KEY,
      straat TEXT,
      huisnummer TEXT,
      postcode TEXT,
      updated_at TIMESTAMP DEFAULT now()
    )
  `
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.kokProfile.findUnique({
      where: { userId: session.user.id },
      include: { workExperience: { orderBy: { fromDate: 'desc' } } },
    })

    let iban = ''
    if (profile) {
      await ensureBankTable()
      const rows: { iban: string }[] = await prisma.$queryRaw`
        SELECT iban FROM kok_bank WHERE kok_id = ${profile.id}
      `
      iban = rows[0]?.iban || ''
    }

    let adres = null
    if (profile) {
      await ensureAdresTable()
      const rowsA: { straat: string | null; huisnummer: string | null; postcode: string | null }[] = await prisma.$queryRaw`
        SELECT straat, huisnummer, postcode FROM kok_adres WHERE kok_id = ${profile.id}
      `
      adres = rowsA[0] || null
    }

    return NextResponse.json({ profile, iban, adres })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      firstName, lastName, dateOfBirth, city, yearsExperience,
      functions, specialties, description,
      haccpCertified, svhCertified, svhLevel,
      hourlyRateMin, hourlyRateMax,
      workExperience, iban, straat, huisnummer, postcode,
    } = body

    const data = {
      firstName: firstName || '',
      lastName: lastName || '',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      city: city || null,
      yearsExperience: yearsExperience != null ? parseInt(yearsExperience) : null,
      functions: functions || [],
      specialties: specialties || [],
      description: description || null,
      haccpCertified: !!haccpCertified,
      svhCertified: !!svhCertified,
      svhLevel: svhLevel || null,
      hourlyRateMin: hourlyRateMin != null && hourlyRateMin !== '' ? parseFloat(hourlyRateMin) : null,
      hourlyRateMax: hourlyRateMax != null && hourlyRateMax !== '' ? parseFloat(hourlyRateMax) : null,
      profileComplete: true,
    }

    const profile = await prisma.kokProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        kvkNumber: `AUTO-${session.user.id}`,
        ...data,
      },
      update: data,
    })

    // Remplacer l'historique complet
    await prisma.workExperience.deleteMany({ where: { kokId: profile.id } })
    if (Array.isArray(workExperience) && workExperience.length > 0) {
      await prisma.workExperience.createMany({
        data: workExperience
          .filter((w: any) => w.function && w.fromDate)
          .map((w: any) => ({
            kokId: profile.id,
            function: w.function,
            companyName: w.companyName || null,
            location: w.location || null,
            fromDate: new Date(w.fromDate),
            toDate: w.isCurrent || !w.toDate ? null : new Date(w.toDate),
            isCurrent: !!w.isCurrent,
            description: w.description || null,
          })),
      })
    }

    // ===== IBAN (table auto-créée) =====
    await ensureBankTable()
    const ibanPropre = (iban || '').replace(/\s+/g, ' ').trim()
    await prisma.$executeRaw`
      INSERT INTO kok_bank (kok_id, iban, updated_at)
      VALUES (${profile.id}, ${ibanPropre}, now())
      ON CONFLICT (kok_id) DO UPDATE SET iban = ${ibanPropre}, updated_at = now()
    `

    // ===== Adresse de facturation (table auto-créée) =====
    await ensureAdresTable()
    const straatPropre = (straat || '').trim()
    const huisnrPropre = (huisnummer || '').trim()
    const postcodePropre = (postcode || '').trim()
    await prisma.$executeRaw`
      INSERT INTO kok_adres (kok_id, straat, huisnummer, postcode, updated_at)
      VALUES (${profile.id}, ${straatPropre}, ${huisnrPropre}, ${postcodePropre}, now())
      ON CONFLICT (kok_id) DO UPDATE SET straat = ${straatPropre}, huisnummer = ${huisnrPropre}, postcode = ${postcodePropre}, updated_at = now()
    `

    const updated = await prisma.kokProfile.findUnique({
      where: { userId: session.user.id },
      include: { workExperience: { orderBy: { fromDate: 'desc' } } },
    })

    return NextResponse.json({ profile: updated, iban: ibanPropre })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
