import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ZZP-kok worden: zelf je shifts en tarief kiezen',
  description:
    'Als zzp-kok werken waar en wanneer jij wilt? Op ChefShift kies je zelf je shifts bij restaurants en hotels, stel je je eigen tarief in en word je veilig betaald via iDEAL.',
  alternates: { canonical: '/zzp-kok-worden' },
}

// FAQ en néerlandais pour le schema (langue de recherche du marché)
const FAQ_NL = [
  ['Heb ik een KvK-inschrijving nodig om als zzp-kok te werken?', 'Ja. Als zzp-kok werk je als zelfstandig ondernemer en daarvoor is een inschrijving bij de Kamer van Koophandel nodig. Die regel je online in ongeveer 15 minuten. Op ChefShift vragen we je KvK-nummer bij je profiel, zo weten horecazaken dat alles netjes geregeld is.'],
  ['Wat verdient een zzp-kok in Nederland?', 'Dat bepaal je grotendeels zelf. Op ChefShift stel je je eigen uurtarief in, met als minimum het wettelijk minimumuurloon. Ervaren zelfstandig werkende koks vragen meestal tussen €22 en €35 per uur.'],
  ['Hoe en wanneer word ik betaald?', 'De horecazaak betaalt na de shift veilig via iDEAL. Jij geeft je gewerkte eindtijd door, de zaak bevestigt en daarna wordt je geld overgemaakt naar je rekening.'],
  ['Moet ik een HACCP-certificaat hebben?', 'HACCP is niet verplicht om je aan te melden, maar koks met een HACCP-certificering krijgen duidelijk meer en betere shifts. De meeste horecazaken vragen erom.'],
  ['Kost ChefShift geld voor koks?', 'Nee. Aanmelden, een profiel maken en reageren op shifts is gratis voor koks. Je betaalt geen commissie zoals bij een uitzendbureau: wat je afspreekt, is wat je verdient.'],
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_NL.map(([v, a]) => ({
    '@type': 'Question',
    name: v,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function ZzpKokLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
