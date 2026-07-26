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

    return NextResponse.json({ profile, iban })
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
      workExperience, iban,
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
