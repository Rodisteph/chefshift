import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [totalUsers, totalHoreca, totalKoks, totalShifts, totalInvoices, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'HORECA' } }),
      prisma.user.count({ where: { role: 'KOK' } }),
      prisma.shift.count(),
      prisma.invoice.count(),
      prisma.invoice.aggregate({ where: { status: 'PAID' }, _sum: { amountInclVat: true } }),
    ])

    const recentShifts = await prisma.shift.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        horeca: { include: { horecaProfile: true } },
        chosenKok: { include: { kokProfile: true } },
      },
    })

    return NextResponse.json({
      stats: { totalUsers, totalHoreca, totalKoks, totalShifts, totalInvoices, totalRevenue: revenue._sum.amountInclVat || 0 },
      recentShifts,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
