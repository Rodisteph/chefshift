import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kok inhuren voor je horecazaak, zonder uitzendbureau',
  description:
    'Een kok inhuren via ChefShift: plaats je shift in 1 minuut, ontvang binnen enkele uren reacties van geverifieerde zzp-koks en betaal veilig via iDEAL. No cure, no pay.',
  alternates: { canonical: '/kok-inhuren' },
}

// FAQ en néerlandais pour le schema (langue de recherche du marché)
const FAQ_NL = [
  ['Hoe snel vind ik een kok via ChefShift?', 'De meeste shifts krijgen binnen 2 uur de eerste reacties van beschikbare koks. Bij een spoedshift kun je de shift als urgent markeren, dan krijgt hij extra zichtbaarheid.'],
  ['Zijn de koks op ChefShift geverifieerd?', 'Ja. Elke kok wordt gecontroleerd op KvK-inschrijving en kan zijn HACCP-certificering uploaden. Daarnaast zie je bij elke sollicitatie de ervaring en de beoordelingen van andere horecazaken.'],
  ['Wat kost het inhuren van een kok via ChefShift?', 'Je betaalt alleen de gewerkte uren tegen het afgesproken uurtarief, plus een kleine platformfee. Aanmelden en shifts plaatsen is gratis. Geen match, geen kosten: no cure, no pay.'],
  ['Wat als de kok niet komt opdagen?', 'Omdat de betaling pas na de shift plaatsvindt, betaal je niets als er niet gewerkt is. Je kunt direct een nieuwe urgent-shift plaatsen. Koks die niet komen opdagen krijgen een negatieve beoordeling en verdwijnen van het platform.'],
  ['Hoe zit het met de administratie en facturatie?', 'Alle afspraken, uren en betalingen lopen via het platform. Na elke shift vind je een overzicht met gewerkte uren en bedrag inclusief 9% btw in je dashboard. Dat scheelt uren administratie.'],
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

export default function KokInhurenLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
