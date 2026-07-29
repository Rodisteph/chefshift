import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kok inhuren voor je horecazaak, zonder uitzendbureau',
  description:
    'Een kok inhuren via ChefShift: plaats je shift in 1 minuut, ontvang binnen enkele uren reacties van geverifieerde zzp-koks en betaal veilig via iDEAL. No cure, no pay.',
  alternates: { canonical: '/kok-inhuren' },
}

const FONT = '"Sora","Inter","Helvetica Neue",Arial,sans-serif'

const FAQ = [
  {
    v: 'Hoe snel vind ik een kok via ChefShift?',
    a: 'De meeste shifts krijgen binnen 2 uur de eerste reacties van beschikbare koks. Bij een spoedshift kun je de shift als urgent markeren, dan krijgt hij extra zichtbaarheid.',
  },
  {
    v: 'Zijn de koks op ChefShift geverifieerd?',
    a: 'Ja. Elke kok wordt gecontroleerd op KvK-inschrijving en kan zijn HACCP-certificering uploaden. Daarnaast zie je bij elke sollicitatie de ervaring en de beoordelingen van andere horecazaken.',
  },
  {
    v: 'Wat kost het inhuren van een kok via ChefShift?',
    a: 'Je betaalt alleen de gewerkte uren tegen het afgesproken uurtarief, plus een kleine platformfee. Aanmelden en shifts plaatsen is gratis. Geen match, geen kosten: no cure, no pay.',
  },
  {
    v: 'Wat als de kok niet komt opdagen?',
    a: 'Omdat de betaling pas na de shift plaatsvindt, betaal je niets als er niet gewerkt is. Je kunt direct een nieuwe urgent-shift plaatsen. Koks die niet komen opdagen krijgen een negatieve beoordeling en verdwijnen van het platform.',
  },
  {
    v: 'Hoe zit het met de administratie en facturatie?',
    a: 'Alle afspraken, uren en betalingen lopen via het platform. Na elke shift vind je een overzicht met gewerkte uren en bedrag inclusief 9% btw in je dashboard. Dat scheelt uren administratie.',
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

export default function KokInhurenPage() {
  return (
    <main style={{ fontFamily: FONT, background: '#f6f7f2', color: '#23281f', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav style={{ background: '#fff', borderBottom: '1px solid #e8ebe0', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: 20, color: '#23281f', textDecoration: 'none', letterSpacing: -0.5 }}>
          Chef<span style={{ color: '#5f7052' }}>Shift</span>
        </a>
        <a href="/register" style={{ background: 'linear-gradient(135deg,#647a55,#46553c)', color: '#fff', padding: '10px 22px', borderRadius: 999, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
          Account aanmaken
        </a>
      </nav>

      <article style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 96px' }}>
        <span style={{ color: '#5f7052', fontWeight: 800, fontSize: 12.5, letterSpacing: 2.5, textTransform: 'uppercase' }}>Voor horecazaken</span>
        <h1 style={{ fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.08, margin: '14px 0 18px' }}>
          Een kok inhuren zonder uitzendbureau
        </h1>
        <p style={{ ...p, fontSize: 18, color: '#6b7268' }}>
          Vanavond nog een kok in je keuken, morgen ook. Op ChefShift plaats je een shift in 1 minuut en kies je zelf welke geverifieerde zzp-kok er komt werken. Betaling loopt veilig via iDEAL, en geen match betekent geen kosten.
        </p>

        <h2 style={h2}>Waarom horecazaken zelf een kok inhuren via ChefShift</h2>
        <p style={p}>
          Het personeelstekort in de horeca is groot en uitzendbureaus rekenen vaak 25 tot 35% commissie bovenop het uurtarief. ChefShift werkt anders: je spreekt rechtstreeks met de kok af, zonder tussenpersoon. Daardoor houd je de kosten in de hand en weet je precies wie er in je keuken staat.
        </p>
        <ul style={{ paddingLeft: 22, margin: '0 0 14px', display: 'grid', gap: 8 }}>
          <li style={li}><strong>Snelheid:</strong> gemiddeld binnen 2 uur de eerste reacties op je shift.</li>
          <li style={li}><strong>Zekerheid:</strong> koks geverifieerd op KvK en HACCP, met beoordelingen van andere zaken.</li>
          <li style={li}><strong>Controle:</strong> jij kiest wie er komt werken, op basis van profiel, ervaring en tarief.</li>
          <li style={li}><strong>Geen risico:</strong> betaling pas na de shift, no cure no pay.</li>
        </ul>

        <h2 style={h2}>Zo werkt een kok inhuren via ChefShift</h2>
        <p style={p}>
          <strong>1. Plaats je shift.</strong> Vul de datum, de tijden, de functie (bijvoorbeeld chef de partie of saucier) en het uurtarief in. De shift is direct zichtbaar voor koks in heel Nederland. In een noodgeval markeer je de shift als urgent.
        </p>
        <p style={p}>
          <strong>2. Kies je kok.</strong> Je ontvangt sollicitaties met profiel, werkervaring, specialiteiten en beoordelingen. Je vergelijkt rustig en kiest zelf wie er komt werken. Daarna staat de shift vast.
        </p>
        <p style={p}>
          <strong>3. Bevestig de uren en betaal.</strong> Na de shift geef je de gewerkte eindtijd door. Je betaalt veilig via iDEAL en alles staat vastgelegd voor je administratie, inclusief 9% btw.
        </p>

        <h2 style={h2}>Wat kost een zzp-kok inhuren?</h2>
        <p style={p}>
          De koks op ChefShift bepalen hun eigen tarief, met als minimum het wettelijk minimumuurloon. Ervaren zelfstandig werkende koks vragen meestal tussen €22 en €35 per uur, afhankelijk van de functie, de regio en de drukte. Omdat je geen uitzendcommissie betaalt, ben je per dienst vaak tientallen euro's goedkoper uit dan via een bureau.
        </p>

        <h2 style={h2}>Voor welke zaken werkt ChefShift?</h2>
        <p style={p}>
          Restaurants, hotels, brasseries, cateringbedrijven en evenementenlocaties gebruiken ChefShift voor zowel geplande diensten als last-minute uitval. Van een enkele avonddienst tot wekelijks terugkerende banqueting-shifts.
        </p>

        <h2 style={h2}>Veelgestelde vragen over een kok inhuren</h2>
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
            Vanavond al een kok nodig?
          </h2>
          <p style={{ opacity: 0.9, fontSize: 15.5, margin: '0 0 26px' }}>
            Plaats je shift in 1 minuut. Gemiddeld binnen 2 uur de eerste reacties.
          </p>
          <a href="/shifts/new" style={{ background: '#fff', color: '#3f4d36', padding: '15px 34px', borderRadius: 999, fontWeight: 800, fontSize: 15, textDecoration: 'none', display: 'inline-block' }}>
            Plaats gratis een shift
          </a>
        </div>

        <p style={{ ...p, marginTop: 36, fontSize: 14, color: '#9aa39b' }}>
          Zelf kok en op zoek naar werk? Lees dan verder op{' '}
          <a href="/zzp-kok-worden" style={{ color: '#5f7052', fontWeight: 700 }}>zzp-kok worden</a> of bekijk direct de{' '}
          <a href="/shifts" style={{ color: '#5f7052', fontWeight: 700 }}>beschikbare shifts</a>.
        </p>
      </article>
    </main>
  )
}
