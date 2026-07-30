'use client'

// Cadre commun des pages admin : vérifie la session ADMIN, affiche la barre de
// navigation et le contenu. Utilisé par /admin et ses pages dédiées.

import { useEffect, useState, ReactNode } from 'react'
import { useT, LangToggle } from '@/lib/i18n'
import AnimStyles from '@/components/AnimStyles'
import ThemeToggle from '@/components/ThemeToggle'

export const ADMIN_FONT = '"Sora","Inter","Helvetica Neue",Arial,sans-serif'

export const ADMIN_CARTE: React.CSSProperties = {
  background: 'hsl(var(--card))', borderRadius: 20, border: '1px solid #eceee3',
  boxShadow: '0 3px 12px rgba(46,52,43,0.05)', padding: 18,
}

export default function AdminShell({ children, titre, sousTitre }: { children: ReactNode; titre: string; sousTitre?: string }) {
  const { t } = useT()
  const [acces, setAcces] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((s) => {
        if (!s?.user) {
          window.location.href = '/login'
          return
        }
        setAcces(s.user.role === 'ADMIN')
      })
      .catch(() => setAcces(false))
  }, [])

  if (acces === null) {
    return (
      <main style={{ fontFamily: ADMIN_FONT, background: 'hsl(var(--background))', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>{t('dash_loading')}</p>
      </main>
    )
  }

  if (!acces) {
    return (
      <main style={{ fontFamily: ADMIN_FONT, background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <p style={{ fontWeight: 700 }}>{t('admin_denied')}</p>
        <a href="/dashboard" style={{ color: '#5f7052', fontWeight: 700, textDecoration: 'none' }}>{t('back_dashboard')}</a>
      </main>
    )
  }

  return (
    <main style={{ fontFamily: ADMIN_FONT, background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', minHeight: '100vh' }}>
      <AnimStyles />
      <nav className="cs-nav" style={{
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e8ebe0',
        padding: '13px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <a href="/admin" style={{ fontWeight: 800, fontSize: 20, color: 'hsl(var(--foreground))', textDecoration: 'none', letterSpacing: -0.5 }}>
          Chef<span style={{ color: '#5f7052' }}>Shift</span>
          <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 999, background: '#23281f', color: '#dfe7d1', letterSpacing: 1, verticalAlign: 'middle' }}>ADMIN</span>
        </a>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <LangToggle />
          <ThemeToggle />
          <a href="/admin" style={{ color: '#5f7052', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>{t('admin_back')}</a>
        </div>
      </nav>

      <div className="cs-wrap" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 56px' }}>
        <h1 className="cs-fade" style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, letterSpacing: -1.2, marginBottom: 6 }}>{titre}</h1>
        {sousTitre !== undefined && (
          <p className="cs-fade cs-d1" style={{ color: 'hsl(var(--muted-foreground))', fontSize: 14.5, marginTop: 0, marginBottom: 28 }}>{sousTitre}</p>
        )}
        {children}
      </div>
    </main>
  )
}
