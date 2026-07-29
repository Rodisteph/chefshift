import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

async function ensureStripeTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS kok_stripe (
      kok_id TEXT PRIMARY KEY,
      stripe_account_id TEXT,
      onboarded BOOLEAN DEFAULT FALSE,
      updated_at TIMESTAMP DEFAULT now()
    )
  `
}

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

    // ===== L'heure de fin doit être confirmée avant le paiement =====
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS shift_end (
          shift_id TEXT PRIMARY KEY,
          reported_end TIMESTAMP NOT NULL,
          reported_at TIMESTAMP DEFAULT now(),
          confirmed_at TIMESTAMP
        )`
    } catch {}
    const conf: { confirmed_at: Date | null }[] = await prisma.$queryRaw`
      SELECT confirmed_at FROM shift_end WHERE shift_id = ${shift.id} LIMIT 1
    `
    if (!conf.length || !conf[0].confirmed_at) {
      return NextResponse.json({ error: 'End time not confirmed yet' }, { status: 400 })
    }

    // ===== Heures "wall-clock" (composantes UTC), sans conversion de fuseau =====
    const st = new Date(shift.startTime)
    const startMin = st.getUTCHours() * 60 + st.getUTCMinutes()

    // ===== Fin réelle : heure déclarée/confirmée si elle existe, sinon fin prévue =====
    let endMin: number | null = null
    let finReelle = false
    try {
      const fins: { reported_end: Date }[] = await prisma.$queryRaw`
        SELECT reported_end FROM shift_end WHERE shift_id = ${shift.id} LIMIT 1
      `
      if (fins.length > 0) {
        const r = new Date(fins[0].reported_end)
        endMin = r.getUTCHours() * 60 + r.getUTCMinutes()
        finReelle = true
      }
    } catch {}
    if (endMin == null) {
      const et = new Date(shift.endTime)
      endMin = et.getUTCHours() * 60 + et.getUTCMinutes()
    }

    // ===== Calcul du montant sur les heures réellement travaillées =====
    let dureeMin = endMin - startMin
    if (dureeMin <= 0) dureeMin += 1440
    const heures = Math.max(1, dureeMin / 60 - shift.breakMinutes / 60)
    const excl = Math.round(shift.hourlyRate * heures * 100) / 100
    const vat = Math.round(excl * shift.vatRate) / 100
    const incl = Math.round((excl + vat) * 100) / 100
    // Commission plateforme : 15% du montant TTC
    const fee = Math.round(incl * 0.15 * 100) / 100
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

    // ===== Compte Stripe Connect du chef (s'il existe) =====
    await ensureStripeTable()
    let destination: string | null = null
    if (shift.chosenKokId) {
      const rows: { stripe_account_id: string }[] = await prisma.$queryRaw`
        SELECT stripe_account_id FROM kok_stripe WHERE kok_id = ${shift.chosenKokId} AND onboarded = true
      `
      destination = rows[0]?.stripe_account_id || null
    }

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
                name: `ChefShift: ${shift.title}`,
                description: `${heures.toFixed(1)}u × €${shift.hourlyRate.toFixed(2)} + ${shift.vatRate}% btw${finReelle ? ' (werkelijke eindtijd)' : ''}`,
              },
            },
          },
        ],
        // Si le chef est connecté : l'argent lui va directement, la commission reste sur la plateforme
        ...(destination
          ? {
              payment_intent_data: {
                application_fee_amount: Math.round(fee * 100),
                transfer_data: { destination },
              },
            }
          : {}),
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
