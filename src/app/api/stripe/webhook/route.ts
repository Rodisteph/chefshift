import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailBetalingOntvangen } from '@/lib/email'
import Stripe from 'stripe'

// Stripe appelle cette route après un paiement réussi
export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!key || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const stripe = new Stripe(key)
  const signature = req.headers.get('stripe-signature') || ''
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object as Stripe.Checkout.Session
    const invoiceId = s.metadata?.invoiceId
    if (invoiceId) {
      try {
        // Numéro de facture officiel séquentiel : CS-2026-0001, CS-2026-0002...
        const jaar = new Date().getFullYear()
        const bestaand = await prisma.invoice.findUnique({ where: { id: invoiceId }, select: { invoiceNumber: true } })
        let invoiceNumber = bestaand?.invoiceNumber || null
        if (!invoiceNumber) {
          const aantal = await prisma.invoice.count({ where: { invoiceNumber: { not: null } } })
          invoiceNumber = `CS-${jaar}-${String(aantal + 1).padStart(4, '0')}`
        }

        const invoice = await prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: 'PAID', paidAt: new Date(), invoiceNumber },
          include: { shift: true },
        })
        if (invoice.shift.chosenKokId) {
          await prisma.notification.create({
            data: {
              userId: invoice.shift.chosenKokId,
              type: 'PAYMENT_RECEIVED',
              title: 'Betaling ontvangen',
              message: `De horeca heeft betaald voor: ${invoice.shift.title}`,
              shiftId: invoice.shiftId,
            },
          })

          // Email au chef : paiement reçu
          const kok = await prisma.user.findUnique({ where: { id: invoice.shift.chosenKokId } })
          if (kok?.email) {
            await emailBetalingOntvangen(kok.email, invoice.shift.title, invoice.kokPayout)
          }
        }
      } catch {}
    }
  }

  return NextResponse.json({ received: true })
}
