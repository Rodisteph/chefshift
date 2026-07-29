'use client'

import { useEffect, useState } from 'react'

// Bandeau "facture payée" bilingue : lit la langue choisie sur le site
// (localStorage, même mécanisme que lib/i18n — le layout parent est côté serveur)
export default function FactuurBanner({ id }: { id: string }) {
  const [en, setEn] = useState(false)
  useEffect(() => {
    const lire = () => setEn(localStorage.getItem('chefshift-lang') === 'en')
    lire()
    window.addEventListener('chefshift-lang-change', lire)
    return () => window.removeEventListener('chefshift-lang-change', lire)
  }, [])

  return (
    <a
      href={`/api/invoices/${id}/pdf`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: '#eef2e6', color: '#3f5a34', textDecoration: 'none',
        fontFamily: '"Sora","Inter",Arial,sans-serif', fontWeight: 700, fontSize: 14,
        padding: '12px 20px', borderBottom: '1px solid #dfe4d4',
      }}
    >
      {en ? '✓ Paid · Download invoice (PDF)' : '✓ Betaald · Factuur downloaden (PDF)'}
    </a>
  )
}
