import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const invoices = await prisma.invoice.findMany({
      where: {
        OR: [
          { horecaId: session.user.id },
          { shift: { chosenKokId: session.user.id } },
        ],
      },
      include: {
        shift: {
          include: {
            horeca: { include: { horecaProfile: true } },
            chosenKok: { include: { kokProfile: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ invoices })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
