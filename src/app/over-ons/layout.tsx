import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Over ons: het verhaal achter ChefShift',
  description:
    'ChefShift is het Nederlandse platform dat zzp-koks en horecazaken direct met elkaar verbindt, zonder uitzendbureau. Lees wie we zijn en waarom we ChefShift bouwen.',
  alternates: { canonical: '/over-ons' },
}

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

export default function OverOnsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
