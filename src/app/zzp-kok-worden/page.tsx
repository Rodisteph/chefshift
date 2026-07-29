import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ZZP-kok worden: zelf je shifts en tarief kiezen',
  description:
    'Als zzp-kok werken waar en wanneer jij wilt? Op ChefShift kies je zelf je shifts bij restaurants en hotels, stel je je eigen tarief in en word je veilig betaald via iDEAL.',
  alternates: { canonical: '/zzp-kok-worden' },
}

const FONT = '"Sora","Inter","Helvetica Neue",Arial,sans-serif'

const FAQ = [
  {
    v: 'Heb ik een KvK-inschrijving nodig om als zzp-kok te werken?',
    a: 'Ja. Als zzp-kok werk je als zelfstandig ondernemer en daarvoor is een inschrijving bij de Kamer van Koophandel nodig. Die regel je online in ongeveer 15 minuten. Op ChefShift vragen we je KvK-nummer bij je profiel, zo weten horecazaken dat alles netjes geregeld is.',
  },
  {
    v: 'Wat verdient een zzp-kok in Nederland?',
    a: 'Dat bepaal je grotendeels zelf. Op ChefShift stel je je eigen uurtarief in, met als minimum het wettelijk minimumuurloon. Ervaren zelfstandig werkende koks vragen meestal tussen €22 en €35 per uur. Veel koks verdienen €1.500 tot €3.000 per maand bij naast een vaste baan, en fulltime zzp-koks verdienen meer.',
  },
  {
    v: 'Hoe en wanneer word ik betaald?',
    a: 'De horecazaak betaalt na de shift veilig via iDEAL. Jij geeft je gewerkte eindtijd door, de zaak bevestigt en daarna wordt je geld overgemaakt naar je rekening. Alles is vastgelegd in je dashboard, dus je administratie is zo bijgewerkt.',
  },
  {
    v: 'Moet ik een HACCP-certificaat hebben?',
    a: 'HACCP is niet verplicht om je aan te melden, maar koks met een HACCP-certificering krijgen duidelijk meer en betere shifts. De meeste horecazaken vragen erom. Heb je hem nog niet, dan is dat een goede investering in jezelf.',
  },
  {
    v: 'Kost ChefShift geld voor koks?',
    a: 'Nee. Aanmelden, een profiel maken en reageren op shifts is gratis voor koks. Je betaalt geen commissie zoals bij een uitzendbureau: wat je afspreekt, is wat je verdient.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({
    '@type': 'Question',
    name: f.v,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

const h2: React.CSSProperties = { fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, letterSpacing: -0.8, margin: '46px 0 14px' }
const p: React.CSSProperties = { color: '#4a5044', fontSize: 16, lineHeight: 1.75, margin: '0 0 14px' }
const li: React.CSSProperties = { color: '#4a5044', fontSize: 16, lineHeight: 1.75 }

export default function ZzpKokWordenPage() {
  return (
    <main style={{ fontFamily: FONT, background: '#f6f7f2', color: '#23281f', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav style={{ background: '#fff', borderBottom: '1px solid #e8ebe0', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: 20, color: '#23281f', textDecoration: 'none', letterSpacing: -0.5 }}>
          Chef<span style={{ color: '#5f7052' }}>Shift</span>
        </a>
        <a href="/register" style={{ background: 'linear-gradient(135deg,#647a55,#46553c)', color: '#fff', padding: '10px 22px', borderRadius: 999, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
          Gratis aanmelden
        </a>
      </nav>

      <article style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 96px' }}>
        <span style={{ color: '#5f7052', fontWeight: 800, fontSize: 12.5, letterSpacing: 2.5, textTransform: 'uppercase' }}>Voor koks</span>
        <h1 style={{ fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.08, margin: '14px 0 18px' }}>
          ZZP-kok worden: werk waar en wanneer jij wilt
        </h1>
        <p style={{ ...p, fontSize: 18, color: '#6b7268' }}>
          Als zzp-kok bepaal je zelf welke shifts je werkt, bij welke restaurants en tegen welk tarief. Op ChefShift vind je keukens in heel Nederland zonder uitzendbureau ertussen. Gratis aanmelden kost 1 minuut.
        </p>

        <h2 style={h2}>Waarom steeds meer koks voor het zzp-leven kiezen</h2>
        <p style={p}>
          Vaste roosters, weinig waardering en een salaris dat al jaren hetzelfde is: steeds meer koks kiezen voor vrijheid. Als zzp-kok combineer je shifts zoals het jou uitkomt. Extra bijverdienen naast je vaste baan, of juist fulltime zelfstandig aan de slag: het kan allebei.
        </p>
        <ul style={{ paddingLeft: 22, margin: '0 0 14px', display: 'grid', gap: 8 }}>
          <li style={li}><strong>Vrijheid:</strong> kies zelf welke shifts je werkt en welke je laat schieten.</li>
          <li style={li}><strong>Eigen tarief:</strong> jij stelt je uurtarief in, niemand anders.</li>
          <li style={li}><strong>Geen commissie:</strong> geen uitzendbureau dat 25 tot 35% van je loon pakt.</li>
          <li style={li}><strong>Variatie:</strong> werk in verschillende keukens en bouw snel ervaring en een netwerk op.</li>
        </ul>

        <h2 style={h2}>Zo start je als zzp-kok op ChefShift</h2>
        <p style={p}>
          <strong>1. Regel je KvK-inschrijving.</strong> Als zelfstandig kok schrijf je je in bij de Kamer van Koophandel. Dat doe je online in ongeveer een kwartier.
        </p>
        <p style={p}>
          <strong>2. Maak je profiel compleet.</strong> Vul je ervaring, functies en specialiteiten in en voeg je HACCP-certificering toe als je die hebt. Een compleet profiel krijgt tot 3x meer reacties van horecazaken.
        </p>
        <p style={p}>
          <strong>3. Reageer op shifts.</strong> Bekijk het overzicht en reageer met jouw tarief op de shifts die bij jou passen. De zaak kiest, daarna staat de shift vast. Je krijgt een herinnering 24 uur en 2 uur voor aanvang.
        </p>
        <p style={p}>
          <strong>4. Werk en word betaald.</strong> Na je shift geef je je eindtijd door. De zaak bevestigt en betaalt veilig via iDEAL. Jouw geld wordt daarna overgemaakt.
        </p>

        <h2 style={h2}>Wat verdient een zzp-kok?</h2>
        <p style={p}>
          Jij bepaalt je tarief, met als minimum het wettelijk minimumuurloon. Ervaren zelfstandig werkende koks op ChefShift werken meestal voor €22 tot €35 per uur, afhankelijk van de functie en de regio. Bouw je een goede reputatie op met positieve beoordelingen, dan kun je je tarief stap voor stap verhogen.
        </p>

        <h2 style={h2}>Veelgestelde vragen over zzp-kok worden</h2>
        <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
          {FAQ.map((f) => (
            <details key={f.v} style={{ background: '#fff', border: '1px solid #eceee3', borderRadius: 14, padding: '18px 20px' }}>
              <summary style={{ fontWeight: 700, fontSize: 15.5, cursor: 'pointer' }}>{f.v}</summary>
              <p style={{ ...p, marginTop: 10, marginBottom: 0 }}>{f.a}</p>
            </details>
          ))}
        </div>

        <div style={{ marginTop: 52, background: 'linear-gradient(135deg, #242c1f 0%, #38452c 55%, #55684a 100%)', borderRadius: 24, padding: '48px 32px', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 800, letterSpacing: -1, margin: '0 0 12px' }}>
            Klaar voor je eerste shift?
          </h2>
          <p style={{ opacity: 0.9, fontSize: 15.5, margin: '0 0 26px' }}>
            Gratis profiel in 1 minuut. Vandaag aangemeld, deze week aan het werk.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/register" style={{ background: '#fff', color: '#3f4d36', padding: '15px 34px', borderRadius: 999, fontWeight: 800, fontSize: 15, textDecoration: 'none', display: 'inline-block' }}>
              Maak gratis je profiel
            </a>
            <a href="/shifts" style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.42)', color: '#fff', padding: '15px 34px', borderRadius: 999, fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-block' }}>
              Bekijk beschikbare shifts
            </a>
          </div>
        </div>

        <p style={{ ...p, marginTop: 36, fontSize: 14, color: '#9aa39b' }}>
          Horecazaak en op zoek naar een kok? Lees dan verder op{' '}
          <a href="/kok-inhuren" style={{ color: '#5f7052', fontWeight: 700 }}>kok inhuren</a>.
        </p>
      </article>
    </main>
  )
}
