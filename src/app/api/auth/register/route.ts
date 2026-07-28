import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, role, name, kvkNumber, companyName, firstName, lastName } = body

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

    return NextResponse.json({ message: 'User created', userId: user.id }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
