import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  berekenUrenMinuten, berekenBedragen, minutenVanTijd,
} from '@/lib/factuur'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const shiftId = params.id
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
    if (!shift) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (session.user.role === 'HORECA' && shift.horecaId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updated = await prisma.shift.update({
      where: { id: shiftId },
      data: { status: 'COMPLETED' }
    })

    // ===== Calcul en centimes entiers : heures dérivées des horaires (fin réelle si connue) =====
    const startMin = minutenVanTijd(shift.startTime)
    let endMin = minutenVanTijd(shift.endTime)
    try {
      const fins: { reported_end: Date }[] = await prisma.$queryRaw`
        SELECT reported_end FROM shift_end WHERE shift_id = ${shiftId} LIMIT 1
      `
      if (fins.length > 0) endMin = minutenVanTijd(fins[0].reported_end)
    } catch {}

    const urenMinuten = berekenUrenMinuten(startMin, endMin, shift.breakMinutes)
    const b = berekenBedragen(urenMinuten, shift.hourlyRate) // tarif déjà en centimes

    // Le numéro de facture n'est PAS attribué ici : il l'est au paiement (webhook Stripe),
    // de façon transactionnelle, sans trou dans la série.
    await prisma.invoice.upsert({
      where: { shiftId },
      create: {
        shiftId,
        horecaId: shift.horecaId,
        amountExclVat: b.exclCenten,
        vatAmount: b.btwCenten,
        amountInclVat: b.inclCenten,
        platformFee: b.commissieCenten,
        kokPayout: b.payoutCenten,
        status: 'PENDING',
      },
      update: {
        amountExclVat: b.exclCenten,
        vatAmount: b.btwCenten,
        amountInclVat: b.inclCenten,
        platformFee: b.commissieCenten,
        kokPayout: b.payoutCenten,
      },
    })

    if (shift.chosenKokId) {
      await prisma.notification.create({
        data: {
          userId: shift.chosenKokId,
          type: 'PAYMENT_RECEIVED',
          title: 'Shift voltooid',
          message: `Je shift "${shift.title}" is voltooid. Betaling volgt binnen 48 uur.`,
          shiftId,
        }
      })
    }

    return NextResponse.json({ shift: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
