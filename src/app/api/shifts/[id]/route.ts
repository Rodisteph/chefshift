import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const shift = await prisma.shift.findUnique({
      where: { id: params.id },
      include: {
        horeca: { include: { horecaProfile: true } },
        chosenKok: { include: { kokProfile: true } },
        applications: {
          include: { kok: { include: { kokProfile: true } } },
          orderBy: { submittedAt: 'desc' },
        },
      },
    })

    if (!shift) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (session.user.role === 'HORECA' && shift.horecaId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ shift })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
