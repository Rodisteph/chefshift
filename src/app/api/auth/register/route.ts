import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, role, name, kvkNumber, companyName, firstName, lastName, source } = body

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role,
        name,
        ...(role === 'HORECA' ? {
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
