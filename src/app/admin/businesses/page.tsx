'use client'

import { useEffect, useState } from 'react'
import { useT } from '@/lib/i18n'
import AdminShell, { ADMIN_CARTE } from '@/components/AdminShell'
import { IcoTile } from '@/components/Icons'

type B = {
  id: string
  email: string
  createdAt: string
  horecaProfile?: {
    companyName?: string | null
    kvkNumber?: string | null
    city?: string | null
    contactName?: string | null
    horecaType?: string | null
  } | null
}

export default function AdminBusinessesPage() {
  const { t, lang } = useT()
  const [items, setItems] = useState<B[] | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch('/api/admin?vue=businesses')
      .then((r) => r.json())
      .then((d) => setItems(d.businesses || []))
      .catch(() => setItems([]))
  }, [])

  const locale = lang === 'en' ? 'en-GB' : 'nl-NL'
  const liste = (items || []).filter((b) => {
    const p = b.horecaProfile
    const hay = `${p?.companyName || ''} ${p?.city || ''} ${p?.kvkNumber || ''} ${b.email}`.toLowerCase()
    return hay.includes(q.trim().toLowerCase())
  })

  return (
    <AdminShell titre={t('admin_horeca')} sousTitre={`${items?.length ?? 0} ${t('admin_horeca').toLowerCase()}`}>
      <div className="cs-fade cs-d1" style={{ marginBottom: 14, display: 'flex', justifyContent: 'flex-end' }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('admin_search_biz')}
          style={{ width: '100%', maxWidth: 320, padding: 12, border: '1.5px solid #e2e6d7', borderRadius: 12, fontSize: 15, outline: 'none', boxSizing: 'border-box', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
        />
      </div>
      <div className="cs-fade cs-d2" style={{ display: 'grid', gap: 12 }}>
        {items === null ? (
          <p style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>{t('dash_loading')}</p>
        ) : liste.length === 0 ? (
          <div className="cs-card" style={{ ...ADMIN_CARTE, textAlign: 'center', padding: 36 }}>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 600, margin: 0 }}>{t('admin_no_results')}</p>
          </div>
        ) : (
          liste.map((b) => {
            const p = b.horecaProfile
            return (
              <div key={b.id} className="cs-card" style={{ ...ADMIN_CARTE, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 220 }}>
                  <IcoTile n="brief" s={18} taille={40} />
                  <div>
                    <div style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: -0.3 }}>{p?.companyName || b.email}</div>
                    <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', fontWeight: 600, marginTop: 2 }}>
                      {[p?.contactName, p?.city, p?.horecaType].filter(Boolean).join(' · ') || b.email}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {p?.kvkNumber && (
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 11px', borderRadius: 999, background: '#eef2e6', color: '#4c5e42', letterSpacing: 0.6 }}>KVK {p.kvkNumber}</span>
                  )}
                  <span style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>
                    {t('admin_since')} {new Date(b.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </AdminShell>
  )
}
