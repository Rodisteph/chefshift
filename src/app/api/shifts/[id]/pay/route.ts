import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'HORECA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }
    const stripe = new Stripe(key.trim())

    const shift = await prisma.shift.findUnique({
      where: { id: params.id },
      include: { invoice: true },
    })
    if (!shift || shift.horecaId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (shift.status !== 'CONFIRMED' && shift.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Shift not confirmed' }, { status: 400 })
    }
    if (shift.invoice?.status === 'PAID') {
      return NextResponse.json({ error: 'Already paid' }, { status: 400 })
    }

    // ===== Le shift doit être terminé avant le paiement =====
    const aujourdhui = new Date(new Date().toDateString())
    if (new Date(shift.date) >= aujourdhui) {
      return NextResponse.json({ error: 'Shift not finished yet' }, { status: 400 })
    }

    // ===== Calcul du montant =====
    const dureeMs = new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()
    const heures = Math.max(1, dureeMs / 3600000 - shift.breakMinutes / 60)
    const base = shift.totalAmount ?? shift.hourlyRate * heures
    const excl = Math.round(base * 100) / 100
    const vat = Math.round(excl * shift.vatRate) / 100
    const incl = Math.round((excl + vat) * 100) / 100
    const fee = Math.round(incl * 0.12 * 100) / 100
    const payout = Math.round((incl - fee) * 100) / 100

    // ===== Facture (une par shift) =====
    const invoice = await prisma.invoice.upsert({
      where: { shiftId: shift.id },
      create: {
        shiftId: shift.id,
        horecaId: session.user.id,
        amountExclVat: excl,
        vatAmount: vat,
        amountInclVat: incl,
        platformFee: fee,
        kokPayout: payout,
        status: 'PENDING',
        paymentProvider: 'stripe',
      },
      update: {
        amountExclVat: excl,
        vatAmount: vat,
        amountInclVat: incl,
        platformFee: fee,
        kokPayout: payout,
        paymentProvider: 'stripe',
      },
    })

    // ===== Session Stripe Checkout (iDEAL + carte) =====
    const origin = req.nextUrl.origin
    try {
      const checkout = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['ideal', 'card'],
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'eur',
              unit_amount: Math.round(incl * 100),
              product_data: {
                name: `ChefShift — ${shift.title}`,
                description: `${heures.toFixed(1)}u × €${shift.hourlyRate.toFixed(2)} + ${shift.vatRate}% btw`,
              },
            },
          },
        ],
        metadata: { shiftId: shift.id, invoiceId: invoice.id },
        success_url: `${origin}/shifts/${shift.id}?betaald=1`,
        cancel_url: `${origin}/shifts/${shift.id}`,
      })

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { paymentId: checkout.id, paymentUrl: checkout.url || '' },
      })

      return NextResponse.json({ url: checkout.url })
    } catch (stripeError: any) {
      return NextResponse.json(
        { error: `Stripe: ${stripeError?.message || 'unknown error'}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
