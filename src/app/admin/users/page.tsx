'use client'

import { useEffect, useState } from 'react'
import { useT } from '@/lib/i18n'
import AdminShell, { ADMIN_CARTE } from '@/components/AdminShell'
import { IcoTile } from '@/components/Icons'

type U = {
  id: string
  name: string | null
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

const ROLE_STYLE: Record<string, { bg: string; fg: string }> = {
  HORECA: { bg: '#e0e7ff', fg: '#3730a3' },
  KOK: { bg: '#dcfce7', fg: '#15803d' },
  ADMIN: { bg: '#23281f', fg: '#dfe7d1' },
}

export default function AdminUsersPage() {
  const { t, lang } = useT()
  const [users, setUsers] = useState<U[] | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch('/api/admin?vue=users')
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .catch(() => setUsers([]))
  }, [])

  const locale = lang === 'en' ? 'en-GB' : 'nl-NL'
  const liste = (users || []).filter((u) => {
    const hay = `${u.name || ''} ${u.email} ${u.role}`.toLowerCase()
    return hay.includes(q.trim().toLowerCase())
  })

  return (
    <AdminShell titre={t('admin_users')} sousTitre={`${users?.length ?? 0} ${t('admin_users').toLowerCase()}`}>
      <div className="cs-fade cs-d1" style={{ marginBottom: 14, display: 'flex', justifyContent: 'flex-end' }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('admin_search_users')}
          style={{ width: '100%', maxWidth: 320, padding: 12, border: '1.5px solid #e2e6d7', borderRadius: 12, fontSize: 15, outline: 'none', boxSizing: 'border-box', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
        />
      </div>
      <div className="cs-fade cs-d2" style={{ display: 'grid', gap: 12 }}>
        {users === null ? (
          <p style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>{t('dash_loading')}</p>
        ) : liste.length === 0 ? (
          <div className="cs-card" style={{ ...ADMIN_CARTE, textAlign: 'center', padding: 36 }}>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 600, margin: 0 }}>{t('admin_no_results')}</p>
          </div>
        ) : (
          liste.map((u) => {
            const rs = ROLE_STYLE[u.role] || ROLE_STYLE.KOK
            return (
              <div key={u.id} className="cs-card" style={{ ...ADMIN_CARTE, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 220 }}>
                  <IcoTile n="users" s={18} taille={40} />
                  <div>
                    <div style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: -0.3 }}>{u.name || u.email}</div>
                    <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', fontWeight: 600, marginTop: 2 }}>{u.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 11px', borderRadius: 999, background: rs.bg, color: rs.fg, textTransform: 'uppercase', letterSpacing: 0.6 }}>{u.role}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 11px', borderRadius: 999, background: u.isActive ? '#dcfce7' : '#fee2e2', color: u.isActive ? '#15803d' : '#b91c1c', letterSpacing: 0.6 }}>
                    {u.isActive ? t('admin_active') : t('admin_inactive')}
                  </span>
                  <span style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>
                    {t('admin_since')} {new Date(u.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
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
