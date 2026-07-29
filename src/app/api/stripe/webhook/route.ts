import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailBetalingOntvangen } from '@/lib/email'
import { factuurNummer, commissieNummer } from '@/lib/factuur'
import Stripe from 'stripe'

// Tables de numérotation : séries continues, sans trou, attribuées en transaction
async function ensureNummerTables() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS kok_factuur_seq (
      kok_id TEXT NOT NULL,
      jaar INT NOT NULL,
      laatste_seq INT NOT NULL DEFAULT 0,
      PRIMARY KEY (kok_id, jaar)
    )`
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS platform_factuur_seq (
      jaar INT PRIMARY KEY,
      laatste_seq INT NOT NULL DEFAULT 0
    )`
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS commissie_factuur (
      invoice_id TEXT PRIMARY KEY,
      nummer TEXT NOT NULL,
      jaar INT NOT NULL,
      seq INT NOT NULL
    )`
}

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
        await ensureNummerTables()
        const jaar = new Date().getFullYear()

        // Transaction : passage en PAID + attribution des deux numéros de façon atomique
        const invoice = await prisma.$transaction(async (tx) => {
          const inv = await tx.invoice.update({
            where: { id: invoiceId },
            data: { status: 'PAID', paidAt: new Date() },
            include: { shift: true },
          })

          // Document A : série continue PAR CHEF, sans trou (CS-{année}-{chefId}-{seq:04d})
          if (!inv.invoiceNumber && inv.shift.chosenKokId) {
            const kokId = inv.shift.chosenKokId
            const rows: { laatste_seq: number }[] = await tx.$queryRaw`
              INSERT INTO kok_factuur_seq (kok_id, jaar, laatste_seq)
              VALUES (${kokId}, ${jaar}, 1)
              ON CONFLICT (kok_id, jaar)
              DO UPDATE SET laatste_seq = kok_factuur_seq.laatste_seq + 1
              RETURNING laatste_seq`
            const nummer = factuurNummer(jaar, kokId, rows[0].laatste_seq)
            await tx.invoice.update({ where: { id: inv.id }, data: { invoiceNumber: nummer } })
            inv.invoiceNumber = nummer
          }

          // Document B : série plateforme distincte (CM-{année}-{seq:04d})
          const bestaandB: { nummer: string }[] = await tx.$queryRaw`
            SELECT nummer FROM commissie_factuur WHERE invoice_id = ${inv.id} LIMIT 1`
          if (bestaandB.length === 0) {
            const rowsB: { laatste_seq: number }[] = await tx.$queryRaw`
              INSERT INTO platform_factuur_seq (jaar, laatste_seq)
              VALUES (${jaar}, 1)
              ON CONFLICT (jaar)
              DO UPDATE SET laatste_seq = platform_factuur_seq.laatste_seq + 1
              RETURNING laatste_seq`
            await tx.$executeRaw`
              INSERT INTO commissie_factuur (invoice_id, nummer, jaar, seq)
              VALUES (${inv.id}, ${commissieNummer(jaar, rowsB[0].laatste_seq)}, ${jaar}, ${rowsB[0].laatste_seq})
              ON CONFLICT (invoice_id) DO NOTHING`
          }

          return inv
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
