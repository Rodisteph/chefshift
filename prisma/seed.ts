import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Sécurité : le seed contient des identifiants de démo (admin123, demo123) —
  // il ne doit JAMAIS tourner sur la base de production.
  if (process.env.NODE_ENV !== 'development') {
    console.error('Seed refusé : NODE_ENV doit valoir "development".')
    process.exit(1)
  }

  // Clear existing data
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.message.deleteMany()
  await prisma.review.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.application.deleteMany()
  await prisma.shift.deleteMany()
  await prisma.workExperience.deleteMany()
  await prisma.kokProfile.deleteMany()
  await prisma.horecaProfile.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Create Horeca user
  const horecaPassword = await bcrypt.hash('demo123', 12)
  const horeca = await prisma.user.create({
    data: {
      email: 'info@degoudenlepel.nl',
      password: horecaPassword,
      role: 'HORECA',
      name: 'De Gouden Lepel',
      emailVerified: new Date(),
      horecaProfile: {
        create: {
          companyName: 'De Gouden Lepel',
          kvkNumber: '12345678',
          vatNumber: 'NL001234567B01',
          street: 'Herengracht',
          houseNumber: '42',
          postalCode: '1015 BA',
          city: 'Amsterdam',
          province: 'Noord-Holland',
          horecaType: 'restaurant',
          kitchenTypes: ['frans', 'modern_europees'],
          description: 'Fine dining restaurant in hartje Amsterdam',
          averageScore: 4.8,
          reviewCount: 23,
        }
      }
    }
  })

  // Create Kok user
  const kokPassword = await bcrypt.hash('demo123', 12)
  const kok = await prisma.user.create({
    data: {
      email: 'mark@devrieskok.nl',
      password: kokPassword,
      role: 'KOK',
      name: 'Mark de Vries',
      emailVerified: new Date(),
      kokProfile: {
        create: {
          firstName: 'Mark',
          lastName: 'de Vries',
          kvkNumber: '87654321',
          city: 'Amsterdam',
          postalCode: '1017 CT',
          yearsExperience: 8,
          functions: ['chef_de_partie', 'sous_chef'],
          specialties: ['frans', 'italiaans', 'modern_europees'],
          hourlyRateMin: 38,
          hourlyRateMax: 50,
          haccpCertified: true,
          svhCertified: true,
          svhLevel: 'gevorderd',
          averageScore: 4.9,
          reviewCount: 23,
          profileComplete: true,
          workExperience: {
            create: [
              { function: 'sous_chef', companyName: 'De Gouden Lepel', location: 'Amsterdam', fromDate: new Date('2022-01-01'), toDate: new Date('2024-06-01'), description: 'Sous-chef in fine dining restaurant' },
              { function: 'chef_de_partie', companyName: 'Ciel Bleu', location: 'Amsterdam', fromDate: new Date('2019-03-01'), toDate: new Date('2021-12-31'), description: 'Chef de partie Franse keuken' },
              { function: 'hulpkok', companyName: 'Hotel Okura', location: 'Amsterdam', fromDate: new Date('2016-09-01'), toDate: new Date('2019-02-28'), description: 'Leerling kok, diverse stations' },
            ]
          }
        }
      }
    }
  })

  // Create Admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.create({
    data: {
      email: 'admin@chefshift.nl',
      password: adminPassword,
      role: 'ADMIN',
      name: 'Admin',
      emailVerified: new Date(),
    }
  })

  // Create shifts
  const shift1 = await prisma.shift.create({
    data: {
      horecaId: horeca.id,
      title: 'Chef de partie — Avond',
      function: 'chef_de_partie',
      kitchenType: 'frans',
      description: 'Chef de partie gezocht voor drukke zaterdagavond. Ervaring met Franse keuken vereist.',
      date: new Date('2026-07-21'),
      startTime: new Date('2026-07-21T17:00:00'),
      endTime: new Date('2026-07-21T23:00:00'),
      locationCity: 'Amsterdam',
      requiredExperience: 3,
      hourlyRate: 38,
      totalAmount: 228,
      status: 'OPEN',
      isUrgent: true,
    }
  })

  const shift2 = await prisma.shift.create({
    data: {
      horecaId: horeca.id,
      title: 'Zelfstandig werkend kok — Lunch',
      function: 'zelfstandig_werkend_kok',
      kitchenType: 'nederlands',
      description: 'Zelfstandig werkend kok voor lunchservice.',
      date: new Date('2026-07-23'),
      startTime: new Date('2026-07-23T11:00:00'),
      endTime: new Date('2026-07-23T15:00:00'),
      locationCity: 'Amsterdam',
      hourlyRate: 32,
      totalAmount: 128,
      status: 'OPEN',
    }
  })

  const shift3 = await prisma.shift.create({
    data: {
      horecaId: horeca.id,
      title: 'Sous-chef — Avond',
      function: 'sous_chef',
      kitchenType: 'frans',
      description: 'Sous-chef voor fine dining avondservice.',
      date: new Date('2026-07-25'),
      startTime: new Date('2026-07-25T16:00:00'),
      endTime: new Date('2026-07-26T00:00:00'),
      locationCity: 'Amsterdam',
      requiredExperience: 5,
      hourlyRate: 45,
      totalAmount: 360,
      status: 'CONFIRMED',
      chosenKokId: kok.id,
      confirmedAt: new Date(),
    }
  })

  // Create application
  await prisma.application.create({
    data: {
      shiftId: shift1.id,
      kokId: kok.id,
      message: 'Ik heb ruime ervaring met Franse keuken en ben beschikbaar!',
      status: 'PENDING',
    }
  })

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: kok.id,
      type: 'SHIFT_CONFIRMED',
      title: 'Shift bevestigd',
      message: 'Je bent gekozen voor Sous-chef bij De Gouden Lepel (Vr 25 juli)',
    }
  })

  await prisma.notification.create({
    data: {
      userId: kok.id,
      type: 'PAYMENT_RECEIVED',
      title: 'Betaling ontvangen',
      message: '€175,00 voor shift bij Visrestaurant Noord is uitbetaald',
    }
  })

  console.log('✅ Seed completed successfully!')
  console.log('📧 Horeca login: info@degoudenlepel.nl / demo123')
  console.log('👨‍🍳 Kok login: mark@devrieskok.nl / demo123')
  console.log('⚙️  Admin login: admin@chefshift.nl / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
