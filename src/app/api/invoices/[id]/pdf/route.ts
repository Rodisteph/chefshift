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

function datum(d: Date | string, lang: 'nl' | 'en'): string {
  return new Date(d).toLocaleDateString(lang === 'en' ? 'en-GB' : 'nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

// GET /api/invoices/[id]/pdf[?lang=en] : facture au format page imprimable (Ctrl+P → PDF)
// Émise par ChefShift AU NOM ET POUR LE COMPTE du chef (zelf-facturatie, art. 6 AV)
// ChefShift est sous le régime KOR (art. 25 Wet OB) : pas de TVA sur la commission.
// Accès : la horecazaak de la facture, le kok choisi, ou un admin
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const lang: 'nl' | 'en' = req.nextUrl.searchParams.get('lang') === 'en' ? 'en' : 'nl'

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

  const T = {
    nl: {
      titel: 'FACTUUR',
      nummer: 'Nummer',
      factuurdatum: 'Factuurdatum',
      betaald: (d: string) => `Betaald op ${d} via iDEAL`,
      namens: 'Deze factuur wordt door ChefShift uitgereikt <strong>namens en voor rekening van de zelfstandige kok</strong> (zelf-facturatie, artikel 6 van de algemene voorwaarden). De prestatie is geleverd door de kok aan de opdrachtgever; ChefShift is uitsluitend bemiddelaar.',
      van: 'VAN (ZELFSTANDIGE)',
      aan: 'AAN (OPDRACHTGEVER)',
      kvk: 'KvK',
      btw_nr: 'Btw-nummer',
      omschrijving: 'OMSCHRIJVING',
      uren: 'UREN',
      tarief: 'TARIEF',
      bedrag: 'BEDRAG',
      subtotaal: 'Subtotaal excl. btw',
      btw: (r: number) => `${r}% btw`,
      totaal: 'Totaal',
      commissie: 'Bemiddelingscommissie ChefShift (15%)',
      uitbetaling: 'Uitbetaling aan de kok',
      kor: 'De commissie van ChefShift is vrijgesteld van omzetbelasting op grond van artikel 25 Wet op de omzetbelasting 1968 (kleineondernemersregeling).',
      notitie: 'De betaling van deze factuur is via het platform verlopen. De commissie van ChefShift is verrekend bij de uitbetaling; de kok ontvangt het restbedrag op zijn opgegeven rekeningnummer.',
      voet_1: 'ChefShift · Bemiddelingsplatform voor zzp-koks en horeca · www.chefshift.nl',
      voet_2: 'KvK 91547261 · btw-vrijgesteld o.g.v. art. 25 Wet OB (KOR) · Fred. Roeskestraat 90, 1076 ED Amsterdam',
      voet_3: 'Vragen over deze factuur? Mail info@chefshift.nl',
      knop: 'Opslaan als PDF / Afdrukken',
    },
    en: {
      titel: 'INVOICE',
      nummer: 'Number',
      factuurdatum: 'Invoice date',
      betaald: (d: string) => `Paid on ${d} via iDEAL`,
      namens: 'This invoice is issued by ChefShift <strong>in the name and on behalf of the freelance chef</strong> (self-billing, article 6 of the terms &amp; conditions). The service was provided by the chef to the client; ChefShift acts solely as intermediary.',
      van: 'FROM (FREELANCER)',
      aan: 'TO (CLIENT)',
      kvk: 'Chamber of Commerce',
      btw_nr: 'VAT number',
      omschrijving: 'DESCRIPTION',
      uren: 'HOURS',
      tarief: 'RATE',
      bedrag: 'AMOUNT',
      subtotaal: 'Subtotal excl. VAT',
      btw: (r: number) => `${r}% VAT`,
      totaal: 'Total',
      commissie: 'ChefShift intermediation commission (15%)',
      uitbetaling: 'Payout to the chef',
      kor: 'The ChefShift commission is exempt from VAT pursuant to article 25 of the Dutch VAT Act 1968 (small businesses scheme, KOR).',
      notitie: 'Payment of this invoice was processed via the platform. The ChefShift commission was deducted at payout; the chef receives the remaining amount in their registered bank account.',
      voet_1: 'ChefShift · Intermediation platform for freelance chefs and hospitality · www.chefshift.nl',
      voet_2: 'Chamber of Commerce 91547261 · VAT-exempt (art. 25 Dutch VAT Act, KOR) · Fred. Roeskestraat 90, 1076 ED Amsterdam, the Netherlands',
      voet_3: 'Questions about this invoice? Email info@chefshift.nl',
      knop: 'Save as PDF / Print',
    },
  }[lang]

  const jaar = new Date(inv.paidAt || inv.createdAt).getFullYear()
  const nummer = inv.invoiceNumber || `CS-${jaar}-${inv.id.slice(0, 6).toUpperCase()}`
  const totaal = inv.amountInclVat
  const excl = inv.amountExclVat
  const btw = inv.vatAmount
  const fee = inv.platformFee
  const uurBasis = inv.shift.totalAmount ?? inv.amountInclVat
  const uren = inv.shift.hourlyRate > 0 ? uurBasis / inv.shift.hourlyRate : 0
  const hp = inv.shift.horeca.horecaProfile
  const kp = inv.shift.chosenKok?.kokProfile
  const kokNaam = kp ? `${kp.firstName || ''} ${kp.lastName || ''}`.trim() || 'Kok' : 'Kok'
  const start = new Date(inv.shift.startTime).toISOString().slice(11, 16)
  const eind = new Date(inv.shift.endTime).toISOString().slice(11, 16)
  const adresHoreca = [hp?.postalCode, hp?.city].filter(Boolean).join(' ')
  const adresKok = [kp?.postalCode, kp?.city].filter(Boolean).join(' ')

  const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${lang === 'en' ? 'Invoice' : 'Factuur'} ${esc(nummer)} · ChefShift</title>
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
  .namens { margin-top: 18px; background: #eef2e6; border-radius: 10px; padding: 10px 14px; font-size: 12px; color: #4c5e42; line-height: 1.55; }
  hr { border: none; border-top: 1px solid #dfe4d4; margin: 26px 0; }
  .blokken { display: flex; gap: 60px; flex-wrap: wrap; }
  .blok h3 { color: #5f7052; font-size: 10px; letter-spacing: 2px; margin-bottom: 8px; }
  .blok p { font-size: 13.5px; line-height: 1.7; color: #23281f; }
  table { width: 100%; border-collapse: collapse; margin-top: 30px; }
  thead td { background: #eef2e6; color: #4c5e42; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; padding: 10px 12px; }
  thead td:first-child { border-radius: 8px 0 0 8px; }
  thead td:last-child { border-radius: 0 8px 8px 0; }
  tbody td { padding: 14px 12px; font-size: 13.5px; border-bottom: 1px solid #f0f2ea; vertical-align: top; }
  .klein { color: #6b7268; font-size: 11.5px; margin-top: 4px; }
  .r { text-align: right; }
  .totalen { margin-left: auto; width: 280px; margin-top: 20px; font-size: 13.5px; }
  .totalen div { display: flex; justify-content: space-between; padding: 5px 0; color: #4a5044; }
  .totalen .tt { border-top: 1px solid #dfe4d4; margin-top: 8px; padding-top: 12px; font-weight: 800; font-size: 16px; color: #23281f; }
  .commissie { margin-left: auto; width: 300px; margin-top: 14px; font-size: 12.5px; color: #6b7268; border-top: 1px dashed #dfe4d4; padding-top: 10px; }
  .commissie div { display: flex; justify-content: space-between; gap: 12px; padding: 3px 0; }
  .kor { margin-left: auto; width: 300px; margin-top: 8px; font-size: 11px; color: #9aa39b; line-height: 1.5; }
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
        <h1>${T.titel}</h1>
        <p>${T.nummer}: <strong>${esc(nummer)}</strong></p>
        <p>${T.factuurdatum}: ${datum(inv.paidAt || inv.createdAt, lang)}</p>
        ${inv.paidAt ? `<p>${T.betaald(datum(inv.paidAt, lang))}</p>` : ''}
      </div>
    </div>

    <div class="namens">
      ${T.namens}
    </div>

    <hr>

    <div class="blokken">
      <div class="blok">
        <h3>${T.van}</h3>
        <p><strong>${esc(kokNaam)}</strong>
        ${kp?.kvkNumber ? `<br>${T.kvk}: ${esc(kp.kvkNumber)}` : ''}
        ${kp?.vatNumber ? `<br>${T.btw_nr}: ${esc(kp.vatNumber)}` : ''}
        ${adresKok ? `<br>${esc(adresKok)}` : ''}</p>
      </div>
      <div class="blok">
        <h3>${T.aan}</h3>
        <p><strong>${esc(hp?.companyName || 'Horecazaak')}</strong>
        ${hp?.kvkNumber ? `<br>${T.kvk}: ${esc(hp.kvkNumber)}` : ''}
        ${adresHoreca ? `<br>${esc(adresHoreca)}` : ''}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <td>${T.omschrijving}</td>
          <td class="r">${T.uren}</td>
          <td class="r">${T.tarief}</td>
          <td class="r">${T.bedrag}</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${esc(inv.shift.title)}</strong>
            <div class="klein">${datum(inv.shift.date, lang)} · ${start} - ${eind} · via ChefShift</div>
          </td>
          <td class="r">${uren.toFixed(1).replace('.', ',')}</td>
          <td class="r">${eur(inv.shift.hourlyRate)}</td>
          <td class="r"><strong>${eur(excl)}</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="totalen">
      <div><span>${T.subtotaal}</span><span>${eur(excl)}</span></div>
      <div><span>${T.btw(inv.shift.vatRate)}</span><span>${eur(btw)}</span></div>
      <div class="tt"><span>${T.totaal}</span><span>${eur(totaal)}</span></div>
    </div>

    <div class="commissie">
      <div><span>${T.commissie}</span><span>- ${eur(fee)}</span></div>
      <div><span><strong>${T.uitbetaling}</strong></span><span><strong>${eur(inv.kokPayout)}</strong></span></div>
    </div>
    <div class="kor">${T.kor}</div>

    <div class="notitie">
      ${T.notitie}
    </div>

    <div class="voet">
      ${T.voet_1}<br>
      ${T.voet_2}<br>
      ${T.voet_3}
    </div>
  </div>

  <div class="acties">
    <button class="knop" onclick="window.print()">${T.knop}</button>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
