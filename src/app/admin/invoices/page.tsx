'use client'

import { useEffect, useState } from 'react'
import { useT } from '@/lib/i18n'
import AdminShell, { ADMIN_CARTE } from '@/components/AdminShell'
import { Ico } from '@/components/Icons'

type Facture = {
  id: string
  invoiceNumber: string | null
  status: string
  amountInclVat: number
  createdAt: string
  paidAt: string | null
  shift?: { title?: string | null } | null
}

const STATUT: Record<string, { bg: string; fg: string }> = {
  PAID: { bg: '#dcfce7', fg: '#15803d' },
  PENDING: { bg: '#fef9c3', fg: '#a16207' },
  INVOICED: { bg: '#e0e7ff', fg: '#3730a3' },
  REFUNDED: { bg: '#f1f0eb', fg: '#8a8676' },
  FAILED: { bg: '#fee2e2', fg: '#b91c1c' },
}

export default function AdminInvoicesPage() {
  const { t, lang } = useT()
  const [factures, setFactures] = useState<Facture[] | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch('/api/admin?vue=invoices')
      .then((r) => r.json())
      .then((d) => setFactures(d.invoices || []))
      .catch(() => setFactures([]))
  }, [])

  const locale = lang === 'en' ? 'en-GB' : 'nl-NL'
  const euro = (c: number) => `€${(c / 100).toFixed(2)}`
  const liste = (factures || []).filter((f) => {
    const hay = `${f.invoiceNumber || ''} ${f.shift?.title || ''} ${f.status}`.toLowerCase()
    return hay.includes(q.trim().toLowerCase())
  })

  return (
    <AdminShell titre={t('admin_invoices')} sousTitre={`${factures?.length ?? 0} ${t('admin_invoices').toLowerCase()}`}>
      <div className="cs-fade cs-d1" style={{ marginBottom: 14, display: 'flex', justifyContent: 'flex-end' }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('admin_search_invoices')}
          style={{ width: '100%', maxWidth: 320, padding: 12, border: '1.5px solid #e2e6d7', borderRadius: 12, fontSize: 15, outline: 'none', boxSizing: 'border-box', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
        />
      </div>
      <div className="cs-fade cs-d2" style={{ display: 'grid', gap: 12 }}>
        {factures === null ? (
          <p style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>{t('dash_loading')}</p>
        ) : liste.length === 0 ? (
          <div className="cs-card" style={{ ...ADMIN_CARTE, textAlign: 'center', padding: 36 }}>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 600, margin: 0 }}>{t('admin_no_results')}</p>
          </div>
        ) : (
          liste.map((f) => {
            const st = STATUT[f.status] || STATUT.PENDING
            return (
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
                    {f.shift?.title || '—'} · {new Date(f.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.3 }}>{euro(f.amountInclVat)}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 11px', borderRadius: 999, background: st.bg, color: st.fg, textTransform: 'uppercase', letterSpacing: 0.6 }}>{f.status}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#5f7052', fontWeight: 700, fontSize: 13 }}>
                    PDF <Ico n="arrow" s={13} />
                  </span>
                </div>
              </a>
            )
          })
        )}
      </div>
    </AdminShell>
  )
}
