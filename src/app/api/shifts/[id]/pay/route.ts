import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  CHEF_VAT_RATE,
  berekenUrenMinuten, berekenBedragen,
  euroNaarCenten, centenNaarEuro, minutenVanTijd,
} from '@/lib/factuur'
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

    // ===== Heures dérivées des horaires (wall-clock UTC), fin réelle confirmée =====
    const startMin = minutenVanTijd(shift.startTime)
    let endMin: number | null = null
    let finReelle = false
    try {
      const fins: { reported_end: Date }[] = await prisma.$queryRaw`
        SELECT reported_end FROM shift_end WHERE shift_id = ${shift.id} LIMIT 1
      `
      if (fins.length > 0) {
        endMin = minutenVanTijd(fins[0].reported_end)
        finReelle = true
      }
    } catch {}
    if (endMin == null) {
      endMin = minutenVanTijd(shift.endTime)
    }

    // ===== Calcul en centimes entiers (TVA 21%, commission 15% du HT) =====
    const urenMinuten = berekenUrenMinuten(startMin, endMin, shift.breakMinutes)
    const b = berekenBedragen(urenMinuten, euroNaarCenten(shift.hourlyRate))
    const excl = centenNaarEuro(b.exclCenten)
    const vat = centenNaarEuro(b.btwCenten)
    const incl = centenNaarEuro(b.inclCenten)
    const fee = centenNaarEuro(b.commissieCenten)
    const payout = centenNaarEuro(b.payoutCenten)
    const heures = urenMinuten / 60

    // ===== Facture (une par shift) — le numéro est attribué au paiement (webhook) =====
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
              unit_amount: b.inclCenten,
              product_data: {
                name: `ChefShift: ${shift.title}`,
                description: `${heures.toFixed(1)}u × €${shift.hourlyRate.toFixed(2)} + ${CHEF_VAT_RATE}% btw${finReelle ? ' (werkelijke eindtijd)' : ''}`,
              },
            },
          },
        ],
        // Si le chef est connecté : l'argent lui va directement, la commission reste sur la plateforme
        ...(destination
          ? {
              payment_intent_data: {
                application_fee_amount: b.commissieCenten,
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
