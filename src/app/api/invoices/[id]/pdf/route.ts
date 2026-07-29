import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function esc(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function eur(n: number): string {
  return `€ ${n.toFixed(2).replace('.', ',')}`
}

function datumNL(d: Date | string): string {
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

// GET /api/invoices/[id]/pdf : facture au format page imprimable (Ctrl+P → PDF)
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

  const jaar = new Date(inv.paidAt || inv.createdAt).getFullYear()
  const nummer = inv.invoiceNumber || `CS-${jaar}-${inv.id.slice(0, 6).toUpperCase()}`
  const totaal = inv.amountInclVat
  const excl = inv.amountExclVat
  const btw = inv.vatAmount
  const uurBasis = inv.shift.totalAmount ?? inv.amountInclVat
  const uren = inv.shift.hourlyRate > 0 ? uurBasis / inv.shift.hourlyRate : 0
  const hp = inv.shift.horeca.horecaProfile
  const kp = inv.shift.chosenKok?.kokProfile
  const kokNaam = kp ? `${kp.firstName || ''} ${kp.lastName || ''}`.trim() || 'Kok' : 'Kok'
  const start = new Date(inv.shift.startTime).toISOString().slice(11, 16)
  const eind = new Date(inv.shift.endTime).toISOString().slice(11, 16)
  const adres = [hp?.postalCode, hp?.city].filter(Boolean).join(' ')

  const html = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Factuur ${esc(nummer)} · ChefShift</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #e9ece4; color: #23281f; padding: 32px 16px; }
  .blad { max-width: 760px; margin: 0 auto; background: #fff; border-radius: 18px; padding: 48px 52px; box-shadow: 0 8px 30px rgba(35,40,31,.10); }
  .kop { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px; }
  .merk { display: flex; align-items: center; gap: 12px; }
  .tegel { width: 40px; height: 40px; border-radius: 11px; background: #5f7052; color: #fff; font-weight: 800; font-size: 22px; display: flex; align-items: center; justify-content: center; }
  .naam { font-size: 21px; font-weight: 800; }
  .naam b { color: #5f7052; }
  .sub { color: #6b7268; font-size: 12px; margin-top: 2px; }
  .fact-titel { text-align: right; }
  .fact-titel h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
  .fact-titel p { color: #4a5044; font-size: 13px; margin-top: 4px; }
  hr { border: none; border-top: 1px solid #dfe4d4; margin: 30px 0; }
  .blokken { display: flex; gap: 60px; flex-wrap: wrap; }
  .blok h3 { color: #5f7052; font-size: 10px; letter-spacing: 2px; margin-bottom: 8px; }
  .blok p { font-size: 13.5px; line-height: 1.7; color: #23281f; }
  table { width: 100%; border-collapse: collapse; margin-top: 34px; }
  thead td { background: #eef2e6; color: #4c5e42; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; padding: 10px 12px; }
  thead td:first-child { border-radius: 8px 0 0 8px; }
  thead td:last-child { border-radius: 0 8px 8px 0; }
  tbody td { padding: 14px 12px; font-size: 13.5px; border-bottom: 1px solid #f0f2ea; vertical-align: top; }
  .klein { color: #6b7268; font-size: 11.5px; margin-top: 4px; }
  .r { text-align: right; }
  .totalen { margin-left: auto; width: 260px; margin-top: 20px; font-size: 13.5px; }
  .totalen div { display: flex; justify-content: space-between; padding: 5px 0; color: #4a5044; }
  .totalen .tt { border-top: 1px solid #dfe4d4; margin-top: 8px; padding-top: 12px; font-weight: 800; font-size: 16px; color: #23281f; }
  .notitie { margin-top: 30px; background: #f6f7f2; border-radius: 10px; padding: 14px 16px; font-size: 12px; color: #6b7268; line-height: 1.6; }
  .voet { text-align: center; color: #9aa39b; font-size: 11px; margin-top: 40px; line-height: 1.7; }
  .acties { max-width: 760px; margin: 18px auto 0; text-align: center; }
  .knop { display: inline-block; background: #46553c; color: #fff; border: none; padding: 13px 28px; border-radius: 999px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: inherit; text-decoration: none; }
  @media print {
    body { background: #fff; padding: 0; }
    .blad { box-shadow: none; border-radius: 0; padding: 20px 8px; }
    .acties { display: none; }
  }
</style>
</head>
<body>
  <div class="blad">
    <div class="kop">
      <div class="merk">
        <span class="tegel">C</span>
        <div>
          <div class="naam">Chef<b>Shift</b></div>
          <div class="sub">www.chefshift.nl · info@chefshift.nl</div>
        </div>
      </div>
      <div class="fact-titel">
        <h1>FACTUUR</h1>
        <p>Nummer: <strong>${esc(nummer)}</strong></p>
        <p>Factuurdatum: ${datumNL(inv.paidAt || inv.createdAt)}</p>
        ${inv.paidAt ? `<p>Betaald op ${datumNL(inv.paidAt)} via iDEAL</p>` : ''}
      </div>
    </div>

    <hr>

    <div class="blokken">
      <div class="blok">
        <h3>VAN</h3>
        <p><strong>ChefShift</strong><br>info@chefshift.nl<br>www.chefshift.nl</p>
      </div>
      <div class="blok">
        <h3>AAN</h3>
        <p><strong>${esc(hp?.companyName || 'Horecazaak')}</strong>
        ${hp?.kvkNumber ? `<br>KvK: ${esc(hp.kvkNumber)}` : ''}
        ${adres ? `<br>${esc(adres)}` : ''}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <td>OMSCHRIJVING</td>
          <td class="r">UREN</td>
          <td class="r">TARIEF</td>
          <td class="r">BEDRAG</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${esc(inv.shift.title)}</strong>
            <div class="klein">${datumNL(inv.shift.date)} · ${start} - ${eind} · kok: ${esc(kokNaam)}</div>
          </td>
          <td class="r">${uren.toFixed(1).replace('.', ',')}</td>
          <td class="r">${eur(inv.shift.hourlyRate)}</td>
          <td class="r"><strong>${eur(totaal)}</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="totalen">
      <div><span>Subtotaal excl. btw</span><span>${eur(excl)}</span></div>
      <div><span>9% btw</span><span>${eur(btw)}</span></div>
      <div class="tt"><span>Totaal</span><span>${eur(totaal)}</span></div>
    </div>

    <div class="notitie">
      Uitbetaling aan de kok: <strong>${eur(inv.kokPayout)}</strong>. Dit bedrag wordt door ChefShift overgemaakt naar de kok na betaling van deze factuur.
    </div>

    <div class="voet">
      ChefShift · Het platform voor zzp-koks en horeca<br>
      Vragen over deze factuur? Mail info@chefshift.nl
    </div>
  </div>

  <div class="acties">
    <button class="knop" onclick="window.print()">Opslaan als PDF / Afdrukken</button>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
