import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { COMMISSION_RATE, commissieNummer } from '@/lib/factuur'

function esc(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Montants stockés en centimes entiers : conversion à l'affichage
function eur(centen: number): string {
  return `€ ${(centen / 100).toFixed(2).replace('.', ',')}`
}

function datumNL(d: Date | string): string {
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

// ============================================================================
// DOCUMENT B — Facture CHEFSHIFT → CHEF (commission de 15% du HT)
// Série propre : CM-{année}-{seq:04d}. Sans TVA (KOR, art. 25 Wet OB).
// Accès : le chef concerné ou un admin (PAS la horecazaak).
// ============================================================================
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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
    inv.shift.chosenKokId === session.user.id ||
    session.user.role === 'ADMIN'
  if (!toegang) return new NextResponse('Geen toegang', { status: 403 })

  // ===== Numéro du document B : série plateforme, attribué au paiement ;
  // pour les anciennes factures, attribution à la volée (idempotente).
  // Tables gérées par les migrations Prisma (série gapless préservée). =====
  const jaar = new Date(inv.paidAt || inv.createdAt).getFullYear()
  const gevonden: { nummer: string }[] = await prisma.$queryRaw`
    SELECT nummer FROM commissie_factuur WHERE invoice_id = ${inv.id} LIMIT 1`
  let nummer = gevonden[0]?.nummer || null
  if (!nummer) {
    nummer = await prisma.$transaction(async (tx) => {
      const rows: { laatste_seq: number }[] = await tx.$queryRaw`
        INSERT INTO platform_factuur_seq (jaar, laatste_seq)
        VALUES (${jaar}, 1)
        ON CONFLICT (jaar)
        DO UPDATE SET laatste_seq = platform_factuur_seq.laatste_seq + 1
        RETURNING laatste_seq`
      const n = commissieNummer(jaar, rows[0].laatste_seq)
      await tx.$executeRaw`
        INSERT INTO commissie_factuur (invoice_id, nummer, jaar, seq)
        VALUES (${inv.id}, ${n}, ${jaar}, ${rows[0].laatste_seq})
        ON CONFLICT (invoice_id) DO NOTHING`
      const check: { nummer: string }[] = await tx.$queryRaw`
        SELECT nummer FROM commissie_factuur WHERE invoice_id = ${inv.id} LIMIT 1`
      return check[0].nummer
    })
  }

  const kp = inv.shift.chosenKok?.kokProfile
  const kokNaam = kp ? `${kp.firstName || ''} ${kp.lastName || ''}`.trim() || 'Kok' : 'Kok'
  let adrKok: { straat: string | null; huisnummer: string | null; postcode: string | null } | null = null
  if (kp) {
    try {
      await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS kok_adres (kok_id TEXT PRIMARY KEY, straat TEXT, huisnummer TEXT, postcode TEXT, updated_at TIMESTAMP DEFAULT now())`
      const rowsA: { straat: string | null; huisnummer: string | null; postcode: string | null }[] = await prisma.$queryRaw`SELECT straat, huisnummer, postcode FROM kok_adres WHERE kok_id = ${kp.id} LIMIT 1`
      adrKok = rowsA[0] || null
    } catch {}
  }
  const adresKok = [
    [kp?.street || adrKok?.straat, kp?.houseNumber || adrKok?.huisnummer].filter(Boolean).join(' '),
    [kp?.postalCode || adrKok?.postcode, kp?.city].filter(Boolean).join(' '),
  ].filter(Boolean).join(', ')
  const grondslag = inv.amountExclVat
  const fee = inv.platformFee

  const html = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Commissiefactuur ${esc(nummer)} · ChefShift</title>
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
  .fact-titel h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
  .fact-titel p { color: #4a5044; font-size: 13px; margin-top: 4px; }
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
  .totalen .tt { border-top: 1px solid #dfe4d4; margin-top: 8px; padding-top: 12px; font-weight: 800; font-size: 16px; color: #23281f; display: flex; justify-content: space-between; }
  .kor { margin-top: 24px; background: #eef2e6; border-radius: 10px; padding: 12px 16px; font-size: 12.5px; color: #4c5e42; font-weight: 700; line-height: 1.55; }
  .notitie { margin-top: 22px; background: #f6f7f2; border-radius: 10px; padding: 14px 16px; font-size: 12px; color: #6b7268; line-height: 1.6; }
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
        <h1>COMMISSIEFACTUUR</h1>
        <p>Factuurnummer: <strong>${esc(nummer)}</strong></p>
        <p>Factuurdatum: ${datumNL(inv.paidAt || inv.createdAt)}</p>
      </div>
    </div>

    <hr>

    <div class="blokken">
      <div class="blok">
        <h3>VAN</h3>
        <p><strong>ChefShift</strong><br>
        Fred. Roeskestraat 90<br>
        1076 ED Amsterdam<br>
        KvK: 91547261</p>
      </div>
      <div class="blok">
        <h3>AAN (ZELFSTANDIGE)</h3>
        <p><strong>${esc(kokNaam)}</strong>
        ${adresKok ? `<br>${esc(adresKok)}` : ''}
        ${kp?.kvkNumber ? `<br>KvK: ${esc(kp.kvkNumber)}` : ''}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <td>OMSCHRIJVING</td>
          <td class="r">GRONDSLAG</td>
          <td class="r">BEDRAG</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>Bemiddelingscommissie ChefShift</strong>
            <div class="klein">Shift: ${esc(inv.shift.title)} · ${datumNL(inv.shift.date)}${inv.invoiceNumber ? ` · factuur ${esc(inv.invoiceNumber)}` : ''}</div>
          </td>
          <td class="r">${COMMISSION_RATE}% van ${eur(grondslag)} excl. btw</td>
          <td class="r"><strong>${eur(fee)}</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="totalen">
      <div class="tt"><span>Totaal</span><span>${eur(fee)}</span></div>
    </div>

    <div class="kor">
      Factuur vrijgesteld van OB o.g.v. artikel 25 Wet OB
    </div>

    <div class="notitie">
      Deze commissie is verrekend bij de uitbetaling van je shift; je hoeft niets over te maken.
      Bewaar deze factuur voor je administratie.
    </div>

    <div class="voet">
      ChefShift · Fred. Roeskestraat 90, 1076 ED Amsterdam · KvK 91547261<br>
      www.chefshift.nl · info@chefshift.nl
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
