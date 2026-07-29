import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Over ons: het verhaal achter ChefShift',
  description:
    'ChefShift is het Nederlandse platform dat zzp-koks en horecazaken direct met elkaar verbindt, zonder uitzendbureau. Lees wie we zijn en waarom we ChefShift bouwen.',
  alternates: { canonical: '/over-ons' },
}

const FONT = '"Sora","Inter","Helvetica Neue",Arial,sans-serif'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'Over ChefShift',
  url: 'https://www.chefshift.nl/over-ons',
  about: {
    '@type': 'Organization',
    name: 'ChefShift',
    url: 'https://www.chefshift.nl',
    email: 'info@chefshift.nl',
    description: 'Platform voor zzp-koks en horeca in Nederland.',
  },
}

const h2: React.CSSProperties = { fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, letterSpacing: -0.8, margin: '46px 0 14px' }
const p: React.CSSProperties = { color: '#4a5044', fontSize: 16, lineHeight: 1.75, margin: '0 0 14px' }

export default function OverOnsPage() {
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
        <span style={{ color: '#5f7052', fontWeight: 800, fontSize: 12.5, letterSpacing: 2.5, textTransform: 'uppercase' }}>Over ons</span>
        <h1 style={{ fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.08, margin: '14px 0 18px' }}>
          Gebouwd voor de keuken, niet voor het bureau
        </h1>
        <p style={{ ...p, fontSize: 18, color: '#6b7268' }}>
          ChefShift verbindt zzp-koks en horecazaken in Nederland direct met elkaar. Zonder uitzendbureau, zonder commissie van 30%, zonder eindeloos heen-en-weer gebel.
        </p>

        <h2 style={h2}>Waarom ChefShift bestaat</h2>
        <p style={p}>
          Iedereen in de horeca kent het probleem: een kok die ziek is op vrijdagavond, een banket dat net te groot is voor het vaste team, een agenda die per week verandert. Aan de andere kant staan duizenden zelfstandige koks die graag zelf bepalen waar en wanneer ze werken, maar geen makkelijke manier hebben om nieuwe keukens te vinden.
        </p>
        <p style={p}>
          ChefShift brengt die twee werelden bij elkaar. Een horecazaak plaatst een shift in 1 minuut, geverifieerde koks reageren met hun eigen tarief, en de betaling loopt veilig via het platform. Simpel, snel en eerlijk voor beide kanten.
        </p>

        <h2 style={h2}>Waar we in geloven</h2>
        <p style={p}>
          <strong>Vrijheid voor koks.</strong> Jij bepaalt je eigen tarief en je eigen agenda. Niemand pakt een percentage van jouw loon.
        </p>
        <p style={p}>
          <strong>Zekerheid voor zaken.</strong> Elke kok wordt gecontroleerd op KvK en kan HACCP-certificering uploaden. Beoordelingen van echte shifts houden de kwaliteit hoog.
        </p>
        <p style={p}>
          <strong>Eerlijk geld.</strong> Betaling gebeurt pas na de shift, veilig via iDEAL. Voor koks is het platform gratis, voor zaken geldt no cure no pay.
        </p>

        <h2 style={h2}>Wie er achter ChefShift zit</h2>
        <p style={p}>
          ChefShift wordt gebouwd door Rodrigo, oprichter en zelf actief in de horeca-community. Hij is persoonlijk bereikbaar voor vragen, feedback en ideeën: dat is de manier waarop het platform elke week beter wordt.
        </p>
        <p style={p}>
          Vragen over ChefShift, samenwerken of iets wat beter kan? Mail naar{' '}
          <a href="mailto:info@chefshift.nl" style={{ color: '#5f7052', fontWeight: 700 }}>info@chefshift.nl</a>. We antwoorden meestal binnen één werkdag.
        </p>

        <div style={{ marginTop: 52, background: 'linear-gradient(135deg, #242c1f 0%, #38452c 55%, #55684a 100%)', borderRadius: 24, padding: '48px 32px', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 800, letterSpacing: -1, margin: '0 0 12px' }}>
            Word onderdeel van ChefShift
          </h2>
          <p style={{ opacity: 0.9, fontSize: 15.5, margin: '0 0 26px' }}>
            Als kok of als horecazaak: gratis aanmelden kost 1 minuut.
          </p>
          <a href="/register" style={{ background: '#fff', color: '#3f4d36', padding: '15px 34px', borderRadius: 999, fontWeight: 800, fontSize: 15, textDecoration: 'none', display: 'inline-block' }}>
            Maak een gratis account
          </a>
        </div>
      </article>
    </main>
  )
}
