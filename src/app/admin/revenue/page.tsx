'use client'

import { useEffect, useState } from 'react'
import { useT } from '@/lib/i18n'
import AdminShell, { ADMIN_CARTE } from '@/components/AdminShell'
import { Ico, IcoTile } from '@/components/Icons'

type Facture = {
  id: string
  invoiceNumber: string | null
  amountInclVat: number
  platformFee: number
  kokPayout: number
  paidAt: string | null
  createdAt: string
  shift?: { title?: string | null } | null
}

type Totaux = { facture: number; commission: number; reverse: number }

export default function AdminRevenuePage() {
  const { t, lang } = useT()
  const [factures, setFactures] = useState<Facture[] | null>(null)
  const [totaux, setTotaux] = useState<Totaux | null>(null)

  useEffect(() => {
    fetch('/api/admin?vue=revenue')
      .then((r) => r.json())
      .then((d) => {
        setFactures(d.invoices || [])
        setTotaux(d.totaux || null)
      })
      .catch(() => setFactures([]))
  }, [])

  const locale = lang === 'en' ? 'en-GB' : 'nl-NL'
  const euro = (c: number) => `€${(c / 100).toFixed(2)}`
  const euroN = (e: number) => `€${e.toFixed(2)}`

  const cartes = [
    { l: t('admin_billed_total'), v: euroN(totaux?.facture ?? 0), icone: 'bank' },
    { l: t('admin_platform_fee'), v: euroN(totaux?.commission ?? 0), icone: 'card' },
    { l: t('admin_kok_payouts'), v: euroN(totaux?.reverse ?? 0), icone: 'chef' },
  ]

  return (
    <AdminShell titre={t('admin_revenue')} sousTitre={t('admin_revenue_sub')}>
      <div className="cs-fade cs-d1 cs-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {cartes.map((c) => (
          <div key={c.l} className="cs-card cs-stat" style={{ ...ADMIN_CARTE, display: 'flex', alignItems: 'center', gap: 14 }}>
            <IcoTile n={c.icone} s={19} taille={42} />
            <div>
              <div className="cs-stat-n" style={{ fontSize: 22, fontWeight: 800, color: 'hsl(var(--foreground))', letterSpacing: -0.8 }}>{c.v}</div>
              <div className="cs-stat-l" style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>{c.l}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="cs-fade cs-d2" style={{ display: 'grid', gap: 12 }}>
        {factures === null ? (
          <p style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>{t('dash_loading')}</p>
        ) : factures.length === 0 ? (
          <div className="cs-card" style={{ ...ADMIN_CARTE, textAlign: 'center', padding: 36 }}>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 600, margin: 0 }}>{t('admin_no_results')}</p>
          </div>
        ) : (
          factures.map((f) => (
            <a
              key={f.id}
              href={`/api/invoices/${f.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="cs-card"
              style={{ ...ADMIN_CARTE, textDecoration: 'none', color: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
            >
              <div style={{ minWidth: 200 }}>
                <div style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: -0.3 }}>{f.invoiceNumber || `#${f.id.slice(0, 8)}`}</div>
                <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', fontWeight: 600, marginTop: 2 }}>
                  {f.shift?.title || '—'} · {new Date(f.paidAt || f.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.3 }}>{euro(f.amountInclVat)}</span>
                <span style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>
                  {t('admin_platform_fee')} {euro(f.platformFee)}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#5f7052', fontWeight: 700, fontSize: 13 }}>
                  PDF <Ico n="arrow" s={13} />
                </span>
              </div>
            </a>
          ))
        )}
      </div>
    </AdminShell>
  )
}
