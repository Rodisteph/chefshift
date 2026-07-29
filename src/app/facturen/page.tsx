'use client'

import { useEffect, useState } from 'react'
import { LangToggle } from '@/lib/i18n'

const FONT = '"Sora","Inter","Helvetica Neue",Arial,sans-serif'

type Lang = 'nl' | 'en'

function useLang(): Lang {
  const [lang, setLang] = useState<Lang>('nl')
  useEffect(() => {
    const lire = () => setLang(localStorage.getItem('chefshift-lang') === 'en' ? 'en' : 'nl')
    lire()
    window.addEventListener('chefshift-lang-change', lire)
    return () => window.removeEventListener('chefshift-lang-change', lire)
  }, [])
  return lang
}

const T = {
  nl: {
    title: 'Facturen',
    sub: 'Al je facturen op één plek. Klik op een factuur om de PDF te openen.',
    loading: 'Laden...',
    empty: 'Nog geen facturen. Facturen verschijnen hier zodra een shift is betaald.',
    paid: 'Betaald',
    open: 'Te betalen',
    cancelled: 'Geannuleerd',
    download: 'PDF openen',
    shift_on: 'Shift op',
    back: '← Terug naar dashboard',
    login: 'Log in om je facturen te bekijken.',
    kok_part: 'Jouw uitbetaling',
  },
  en: {
    title: 'Invoices',
    sub: 'All your invoices in one place. Click an invoice to open the PDF.',
    loading: 'Loading...',
    empty: 'No invoices yet. Invoices appear here once a shift has been paid.',
    paid: 'Paid',
    open: 'Due',
    cancelled: 'Cancelled',
    download: 'Open PDF',
    shift_on: 'Shift on',
    back: '← Back to dashboard',
    login: 'Log in to view your invoices.',
    kok_part: 'Your payout',
  },
}

function eur(n: number): string {
  return `€ ${Number(n || 0).toFixed(2).replace('.', ',')}`
}

function datumNL(d: string, lang: Lang): string {
  return new Date(d).toLocaleDateString(lang === 'en' ? 'en-GB' : 'nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

export default function FacturenPage() {
  const lang = useLang()
  const t = T[lang]
  const [facturen, setFacturen] = useState<any[] | null>(null)
  const [fout, setFout] = useState(false)

  useEffect(() => {
    fetch('/api/invoices')
      .then((r) => {
        if (r.status === 401) {
          setFout(true)
          return { invoices: [] }
        }
        return r.json()
      })
      .then((d) => setFacturen(d.invoices || []))
      .catch(() => setFacturen([]))
  }, [])

  const badge = (status: string) => {
    const isPaid = status === 'PAID'
    const isCancelled = status === 'REFUNDED' || status === 'FAILED'
    const s = isPaid
      ? { bg: '#e3efdc', fg: '#3f5a34', label: t.paid }
      : isCancelled
        ? { bg: '#f3e2e0', fg: '#8a3226', label: t.cancelled }
        : { bg: '#fdf0dc', fg: '#8a5b1e', label: t.open }
    return (
      <span style={{ background: s.bg, color: s.fg, fontWeight: 800, fontSize: 11.5, padding: '5px 12px', borderRadius: 999, letterSpacing: 0.4 }}>
        {s.label}
      </span>
    )
  }

  return (
    <main style={{ fontFamily: FONT, background: '#f6f7f2', color: '#23281f', minHeight: '100vh' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #e8ebe0', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <a href="/" style={{ fontWeight: 800, fontSize: 20, color: '#23281f', textDecoration: 'none', letterSpacing: -0.5 }}>
          Chef<span style={{ color: '#5f7052' }}>Shift</span>
        </a>
        <LangToggle />
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 96px' }}>
        <a href="/dashboard" style={{ color: '#5f7052', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>{t.back}</a>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: -1.2, margin: '16px 0 8px' }}>{t.title}</h1>
        <p style={{ color: '#6b7268', fontSize: 15.5, marginBottom: 30 }}>{t.sub}</p>

        {fout && <p style={{ color: '#8a3226' }}>{t.login}</p>}
        {!facturen && !fout && <p style={{ color: '#9aa39b' }}>{t.loading}</p>}
        {facturen && facturen.length === 0 && !fout && (
          <div style={{ background: '#fff', border: '1px solid #eceee3', borderRadius: 18, padding: '40px 28px', textAlign: 'center', color: '#9aa39b' }}>
            {t.empty}
          </div>
        )}

        <div style={{ display: 'grid', gap: 14 }}>
          {(facturen || []).map((f: any) => {
            const jaar = new Date(f.paidAt || f.createdAt).getFullYear()
            const nummer = f.invoiceNumber || `CS-${jaar}-${f.id.slice(0, 6).toUpperCase()}`
            const bedrijf = f.shift?.horeca?.horecaProfile?.companyName || ''
            return (
              <div key={f.id} style={{ background: '#fff', border: '1px solid #eceee3', borderRadius: 18, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ width: 44, height: 44, borderRadius: 13, background: '#eef2e6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#4c5e42', fontSize: 15, flexShrink: 0 }}>
                  F
                </span>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: -0.2 }}>{nummer}</div>
                  <div style={{ color: '#6b7268', fontSize: 13, marginTop: 3 }}>
                    {f.shift?.title}{bedrijf ? ` · ${bedrijf}` : ''}
                  </div>
                  <div style={{ color: '#9aa39b', fontSize: 12.5, marginTop: 2 }}>
                    {t.shift_on} {f.shift?.date ? datumNL(f.shift.date, lang) : '-'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.3 }}>{eur(f.amountInclVat)}</div>
                  <div style={{ color: '#9aa39b', fontSize: 12 }}>{t.kok_part}: {eur(f.kokPayout)}</div>
                  <div style={{ marginTop: 6 }}>{badge(f.status)}</div>
                </div>
                {f.status === 'PAID' && (
                  <a
                    href={`/api/invoices/${f.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: 'linear-gradient(135deg,#647a55,#46553c)', color: '#fff', padding: '11px 20px', borderRadius: 999, fontWeight: 700, fontSize: 13.5, textDecoration: 'none', flexShrink: 0 }}
                  >
                    {t.download}
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
