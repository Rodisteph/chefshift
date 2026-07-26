import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Mois = { key: string; debut: Date }
type Ligne = { date: Date | null; montant: number }

function parMois(mois: Mois[], lignes: Ligne[]) {
  return mois.map((m) => ({
    key: m.key,
    value: Math.round(
      lignes
        .filter((l) => l.date && `${l.date.getFullYear()}-${String(l.date.getMonth() + 1).padStart(2, '0')}` === m.key)
        .reduce((acc, l) => acc + l.montant, 0) * 100
    ) / 100,
  }))
}

// Statistiques + séries mensuelles pour les graphiques du dashboard
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = session.user.id
    const role = session.user.role

    // Les 6 derniers mois (clés YYYY-MM)
    const mois: Mois[] = []
    const maintenant = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1)
      mois.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, debut: d })
    }
    const depuis = mois[0].debut

    if (role === 'HORECA' || role === 'ADMIN') {
      const [nbShifts, nbCandidatures, nbEmbauches, factures] = await Promise.all([
        prisma.shift.count({ where: { horecaId: userId } }),
        prisma.application.count({ where: { shift: { horecaId: userId } } }),
        prisma.shift.count({ where: { horecaId: userId, chosenKokId: { not: null } } }),
        prisma.invoice.findMany({
          where: { horecaId: userId, status: 'PAID', paidAt: { gte: depuis } },
          select: { paidAt: true, amountInclVat: true },
        }),
      ])
      const serie = parMois(mois, factures.map((f) => ({ date: f.paidAt, montant: f.amountInclVat })))
      return NextResponse.json({
        role,
        nbShifts,
        nbCandidatures,
        nbEmbauches,
        totalDepense: Math.round(factures.reduce((a, f) => a + f.amountInclVat, 0) * 100) / 100,
        serie,
      })
    }

    // ===== KOK =====
    const [nbCandidatures, nbAcceptees, paiements] = await Promise.all([
      prisma.application.count({ where: { kokId: userId } }),
      prisma.application.count({ where: { kokId: userId, status: 'ACCEPTED' } }),
      prisma.invoice.findMany({
        where: { status: 'PAID', paidAt: { gte: depuis }, shift: { chosenKokId: userId } },
        select: { paidAt: true, kokPayout: true },
      }),
    ])
    const serie = parMois(mois, paiements.map((f) => ({ date: f.paidAt, montant: f.kokPayout })))
    return NextResponse.json({
      role,
      nbCandidatures,
      nbAcceptees,
      totalGagne: Math.round(paiements.reduce((a, f) => a + f.kokPayout, 0) * 100) / 100,
      serie,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
