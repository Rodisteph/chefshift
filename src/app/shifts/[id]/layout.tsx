import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Métadonnées uniques par shift (titre + description avec ville et tarif)
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const shift = await prisma.shift.findUnique({
      where: { id: params.id },
      include: { horeca: { include: { horecaProfile: true } } },
    })
    if (!shift) return { title: 'Shift' }
    const stad = shift.locationCity ? ` in ${shift.locationCity}` : ''
    const bedrijf = shift.horeca.horecaProfile?.companyName || 'Horecazaak'
    return {
      title: `${shift.title}${stad} · €${shift.hourlyRate}/u`,
      description: `${bedrijf} zoekt een kok${stad} op ${shift.date.toISOString().slice(0, 10)}. Tarief €${shift.hourlyRate}/u. Reageer direct via ChefShift.`,
      alternates: { canonical: `/shifts/${params.id}` },
    }
  } catch {
    return { title: 'Shift' }
  }
}

// Layout serveur : injecte le schema JobPosting (Google for Jobs) dans le HTML
// et affiche un bandeau de téléchargement de facture quand la shift est payée
export default async function ShiftLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  let jsonLd: Record<string, any> | null = null
  let factuurId: string | null = null

  try {
    const s = await prisma.shift.findUnique({
      where: { id: params.id },
      include: { horeca: { include: { horecaProfile: true } } },
    })
    if (s && s.status !== 'CANCELLED') {
      const bedrijf = s.horeca.horecaProfile?.companyName || 'Horecazaak via ChefShift'
      const stad = s.locationCity ? ` in ${s.locationCity}` : ' in Nederland'
      const start = new Date(s.startTime).toISOString().slice(11, 16)
      const end = new Date(s.endTime).toISOString().slice(11, 16)
      const valid = new Date(s.date)
      valid.setUTCHours(23, 59, 59)
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: s.title,
        description: `<p>${bedrijf} zoekt een ${s.function || 'kok'}${stad} op ${s.date.toISOString().slice(0, 10)} van ${start} tot ${end}. Uurtarief €${s.hourlyRate}. Reageer direct via ChefShift, het platform voor zzp-koks en horeca.</p>`,
        identifier: { '@type': 'PropertyValue', name: 'ChefShift', value: s.id },
        datePosted: s.createdAt.toISOString().slice(0, 10),
        validThrough: valid.toISOString(),
        employmentType: 'CONTRACTOR',
        url: `https://www.chefshift.nl/shifts/${s.id}`,
        directApply: true,
        hiringOrganization: {
          '@type': 'Organization',
          name: bedrijf,
          sameAs: 'https://www.chefshift.nl',
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            ...(s.locationStreet ? { streetAddress: s.locationStreet } : {}),
            ...(s.locationPostal ? { postalCode: s.locationPostal } : {}),
            ...(s.locationCity ? { addressLocality: s.locationCity } : {}),
            addressCountry: 'NL',
          },
        },
        baseSalary: {
          '@type': 'MonetaryAmount',
          currency: 'EUR',
          value: { '@type': 'QuantitativeValue', value: s.hourlyRate, unitText: 'HOUR' },
        },
      }
    }
  } catch {}

  // Bandeau facture : visible pour la horecazaak propriétaire ou l'admin, quand la facture est payée
  try {
    const session = await getServerSession(authOptions)
    if (session && (session.user.role === 'HORECA' || session.user.role === 'ADMIN')) {
      const inv = await prisma.invoice.findUnique({
        where: { shiftId: params.id },
        select: { id: true, status: true, horecaId: true },
      })
      if (inv && inv.status === 'PAID' && (inv.horecaId === session.user.id || session.user.role === 'ADMIN')) {
        factuurId = inv.id
      }
    }
  } catch {}

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      {factuurId && (
        <a
          href={`/api/invoices/${factuurId}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: '#eef2e6', color: '#3f5a34', textDecoration: 'none',
            fontFamily: '"Sora","Inter",Arial,sans-serif', fontWeight: 700, fontSize: 14,
            padding: '12px 20px', borderBottom: '1px solid #dfe4d4',
          }}
        >
          ✓ Betaald · Factuur downloaden (PDF)
        </a>
      )}
      {children}
    </>
  )
}
