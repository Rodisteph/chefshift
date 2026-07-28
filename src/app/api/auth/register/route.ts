import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { estAutorise } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  try {
    // Anti-abus : 10 inscriptions max par IP par heure
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'inconnu'
    if (!estAutorise(`register:${ip}`, 10, 3600_000)) {
      return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
    }

    const body = await req.json()
    const { email, password, role, name, kvkNumber, companyName, firstName, lastName, source } = body

    // ===== Validation d'entrée =====
    const emailPropre = typeof email === 'string' ? email.trim().toLowerCase() : ''
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailPropre)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password too short' }, { status: 400 })
    }

    // ===== Rôle : jamais accepté tel quel depuis le client (anti-escalade de privilèges) =====
    // Seuls KOK et HORECA peuvent être choisis à l'inscription ; ADMIN se fait uniquement côté base.
    const roleSecurise = role === 'HORECA' ? 'HORECA' : 'KOK'

    const existing = await prisma.user.findUnique({ where: { email: emailPropre } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email: emailPropre,
        password: hashed,
        role: roleSecurise,
        name,
        ...(roleSecurise === 'HORECA' ? {
          horecaProfile: { create: { companyName, kvkNumber, city: '', postalCode: '' } }
        } : {
          kokProfile: { create: { firstName: firstName || name, lastName: lastName || '', kvkNumber, city: '' } }
        })
      }
    })

    // Canal d'acquisition (comment l'utilisateur a connu ChefShift)
    if (source) {
      try {
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS user_source (
            user_id TEXT PRIMARY KEY,
            source TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT now()
          )
        `
        await prisma.$executeRaw`
          INSERT INTO user_source (user_id, source, created_at)
          VALUES (${user.id}, ${String(source)}, now())
          ON CONFLICT (user_id) DO UPDATE SET source = ${String(source)}
        `
      } catch {}
    }

    return NextResponse.json({ message: 'User created', userId: user.id }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
