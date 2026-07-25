import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, role, name, kvkNumber, companyName, firstName, lastName } = body

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

    return NextResponse.json({ message: 'User created', userId: user.id }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
