import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PDFDocument from 'pdfkit'

function eur(n: number): string {
  return `€ ${n.toFixed(2).replace('.', ',')}`
}

function datumNL(d: Date | string): string {
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

// GET /api/invoices/[id]/pdf : téléchargement de la facture PDF
// Accès : la horecazaak de la facture, le kok choisi, ou un admin
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const inv = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      shift: {
        include: {
          horeca: { include: { horecaProfile: true } },
          chosenKok: { include: { kokProfile: true } },
        },
      },
    },
  })
  if (!inv) return new NextResponse('Factuur niet gevonden', { status: 404 })

  const toegang =
    inv.horecaId === session.user.id ||
    inv.shift.chosenKokId === session.user.id ||
    session.user.role === 'ADMIN'
  if (!toegang) return new NextResponse('Geen toegang', { status: 403 })

  // Données de la facture
  const jaar = new Date(inv.paidAt || inv.createdAt).getFullYear()
  const nummer = inv.invoiceNumber || `CS-${jaar}-${inv.id.slice(0, 6).toUpperCase()}`
  const totaal = inv.amount
  const excl = totaal / 1.09
  const btw = totaal - excl
  const uren = inv.shift.hourlyRate > 0 ? inv.shift.totalAmount / inv.shift.hourlyRate : 0
  const hp = inv.shift.horeca.horecaProfile
  const kp = inv.shift.chosenKok?.kokProfile
  const kokNaam = kp ? `${kp.firstName || ''} ${kp.lastName || ''}`.trim() || 'Kok' : 'Kok'
  const start = new Date(inv.shift.startTime).toISOString().slice(11, 16)
  const eind = new Date(inv.shift.endTime).toISOString().slice(11, 16)

  // Génération du PDF
  const doc = new PDFDocument({ size: 'A4', margin: 56 })
  const chunks: Buffer[] = []
  doc.on('data', (c: Buffer) => chunks.push(c))
  const klaar = new Promise<void>((resolve) => doc.on('end', () => resolve()))

  // En-tête marque
  doc.roundedRect(56, 56, 34, 34, 8).fill('#5f7052')
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(19).text('C', 56, 64, { width: 34, align: 'center' })
  doc.fillColor('#23281f').fontSize(20).text('Chef', 100, 64, { continued: true })
  doc.fillColor('#5f7052').text('Shift')
  doc.fillColor('#6b7268').font('Helvetica').fontSize(9).text('www.chefshift.nl  ·  info@chefshift.nl', 100, 88)

  doc.fillColor('#23281f').font('Helvetica-Bold').fontSize(24).text('FACTUUR', 340, 60, { width: 200, align: 'right' })
  doc.font('Helvetica').fontSize(10).fillColor('#4a5044')
  doc.text(`Nummer: ${nummer}`, 340, 92, { width: 200, align: 'right' })
  doc.text(`Factuurdatum: ${datumNL(inv.paidAt || inv.createdAt)}`, 340, 106, { width: 200, align: 'right' })
  if (inv.paidAt) {
    doc.text(`Betaald op ${datumNL(inv.paidAt)} via iDEAL`, 340, 120, { width: 200, align: 'right' })
  }

  // Blocs VAN / AAN
  doc.moveTo(56, 150).lineTo(539, 150).lineWidth(1).strokeColor('#dfe4d4').stroke()
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#5f7052').text('VAN', 56, 164)
  doc.font('Helvetica').fontSize(10.5).fillColor('#23281f')
  doc.text('ChefShift', 56, 180)
  doc.text('info@chefshift.nl', 56, 195)
  doc.text('www.chefshift.nl', 56, 210)

  doc.font('Helvetica-Bold').fontSize(9).fillColor('#5f7052').text('AAN', 320, 164)
  doc.font('Helvetica').fontSize(10.5).fillColor('#23281f')
  doc.text(hp?.companyName || 'Horecazaak', 320, 180)
  let ya = 195
  if (hp?.kvkNumber) {
    doc.text(`KvK: ${hp.kvkNumber}`, 320, ya)
    ya += 15
  }
  const adres = [hp?.postalCode, hp?.city].filter(Boolean).join(' ')
  if (adres) doc.text(adres, 320, ya)

  // Tableau de la prestation
  let y = 252
  doc.roundedRect(56, y, 483, 26, 6).fill('#eef2e6')
  doc.fillColor('#4c5e42').font('Helvetica-Bold').fontSize(9)
  doc.text('OMSCHRIJVING', 68, y + 8)
  doc.text('UREN', 330, y + 8, { width: 50, align: 'right' })
  doc.text('TARIEF', 394, y + 8, { width: 60, align: 'right' })
  doc.text('BEDRAG', 466, y + 8, { width: 61, align: 'right' })

  y += 38
  doc.fillColor('#23281f').font('Helvetica').fontSize(10.5)
  doc.text(inv.shift.title, 68, y, { width: 250 })
  doc.fillColor('#6b7268').fontSize(9)
  doc.text(`${datumNL(inv.shift.date)} · ${start} - ${eind} · kok: ${kokNaam}`, 68, y + 15, { width: 250 })
  doc.fillColor('#23281f').fontSize(10.5)
  doc.text(uren.toFixed(1).replace('.', ','), 330, y, { width: 50, align: 'right' })
  doc.text(eur(inv.shift.hourlyRate), 394, y, { width: 60, align: 'right' })
  doc.text(eur(totaal), 466, y, { width: 61, align: 'right' })

  // Totaux
  y = 340
  doc.moveTo(320, y).lineTo(539, y).lineWidth(1).strokeColor('#dfe4d4').stroke()
  y += 12
  doc.font('Helvetica').fontSize(10).fillColor('#4a5044')
  doc.text('Subtotaal excl. btw', 340, y, { width: 120 })
  doc.text(eur(excl), 466, y, { width: 61, align: 'right' })
  y += 16
  doc.text('9% btw', 340, y, { width: 120 })
  doc.text(eur(btw), 466, y, { width: 61, align: 'right' })
  y += 8
  doc.moveTo(340, y).lineTo(539, y).lineWidth(1).strokeColor('#dfe4d4').stroke()
  y += 12
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#23281f')
  doc.text('Totaal', 340, y, { width: 120 })
  doc.text(eur(totaal), 446, y, { width: 81, align: 'right' })

  // Note de payout (info)
  y += 40
  doc.font('Helvetica').fontSize(9).fillColor('#6b7268')
  doc.text(
    `Uitbetaling aan de kok: ${eur(inv.kokPayout)}. Dit bedrag wordt door ChefShift overgemaakt naar de kok na betaling van deze factuur.`,
    56, y, { width: 483 }
  )

  // Pied de page
  doc.fontSize(8.5).fillColor('#9aa39b')
  doc.text(
    'ChefShift · Het platform voor zzp-koks en horeca · Vragen over deze factuur? Mail info@chefshift.nl',
    56, 770, { width: 483, align: 'center' }
  )

  doc.end()
  await klaar

  return new NextResponse(Buffer.concat(chunks) as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="factuur-${nummer}.pdf"`,
    },
  })
}
