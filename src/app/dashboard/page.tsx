'use client'

import { signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useT, LangToggle } from '@/lib/i18n'
import ShiftCard, { ShiftData } from '@/components/ShiftCard'
import AnimStyles from '@/components/AnimStyles'

type SessionUser = {
  name?: string | null
  email?: string | null
  role?: string
}

export default function DashboardPage() {
  const { t } = useT()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [chargement, setChargement] = useState(true)
  const [shifts, setShifts] = useState<ShiftData[]>([])

  useEffect(() => {
    async function charger() {
      const s = await fetch('/api/auth/session').then((r) => r.json())
      if (!s?.user) {
        window.location.href = '/login'
        return
      }
      setUser(s.user)
      try {
        const res = await fetch('/api/shifts')
        if (res.ok) {
          const data = await res.json()
          setShifts(data.shifts || [])
        }
      } catch {}
      setChargement(false)
    }
    charger()
  }, [])

  const carte: React.CSSProperties = {
    background: '#fff', borderRadius: 18, boxShadow: '0 4px 14px rgba(46,52,43,0.06)', padding: 26,
  }

  if (chargement) {
    return (
      <main style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', background: '#f7f5f0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7268', fontWeight: 600 }}>{t('dash_loading')}</p>
      </main>
    )
  }

  const estKok = user?.role === 'KOK'
  const totalCandidatures = shifts.reduce((acc, s) => acc + (s._count?.applications || 0), 0)

  return (
    <main style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', background: '#f7f5f0', color: '#2e342b', minHeight: '100vh' }}>
      <AnimStyles />
      {/* ===== Barre de navigation ===== */}
      <nav style={{
        background: '#fff', borderBottom: '1px solid #e4e9dd',
        padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <a href="/" style={{ fontWeight: 800, fontSize: 20, color: '#2e342b', textDecoration: 'none' }}>
          Chef<span style={{ color: '#5f7052' }}>Shift</span>
        </a>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <LangToggle />
          {estKok && (
            <a href="/profiel" className="cs-nav-link" style={{ color: '#5f7052', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              👤 {t('nav_profile')}
            </a>
          )}
          <span style={{ fontSize: 14, color: '#6b7268' }}>{user?.email}</span>
          <span style={{
            background: '#e4e9dd', color: '#5f7052', fontSize: 12, fontWeight: 800,
            padding: '5px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 1,
          }}>
            {user?.role}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="cs-btn"
            style={{
              background: 'none', border: '1.5px solid #e4e9dd', borderRadius: 999,
              padding: '8px 18px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', color: '#2e342b',
            }}
          >
            {t('nav_logout')}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <h1 className="cs-fade" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: -1, marginBottom: 8 }}>
          {t('dash_welcome')}, {user?.name || 'chef'} 👋
        </h1>
        <p className="cs-fade cs-d1" style={{ color: '#6b7268', marginBottom: 40 }}>
          {estKok
            ? t('dash_kok_sub')
            : user?.role === 'HORECA'
            ? t('dash_horeca_sub')
            : user?.role === 'ADMIN'
            ? t('dash_admin_sub')
            : t('dash_default_sub')}
        </p>

        {/* ===== Statistiques ===== */}
        <div className="cs-fade cs-d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
          {(estKok
            ? [
                { c: String(shifts.length), l: t('stat_kok_1') },
                { c: '0', l: t('stat_kok_2') },
                { c: '€0', l: t('stat_kok_3') },
              ]
            : [
                { c: String(shifts.length), l: t('stat_hor_1') },
                { c: String(totalCandidatures), l: t('stat_hor_2') },
                { c: '0', l: t('stat_hor_3') },
              ]
          ).map((s) => (
            <div key={s.l} className="cs-card" style={carte}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#5f7052' }}>{s.c}</div>
              <div style={{ fontSize: 13.5, color: '#6b7268', fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* ===== Action principale ===== */}
        <div className="cs-fade cs-d3 cs-card" style={{ ...carte, marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              {estKok ? t('action_kok_t') : t('action_hor_t')}
            </h2>
            <p style={{ color: '#6b7268', fontSize: 14.5 }}>
              {estKok ? t('action_kok_d') : t('action_hor_d')}
            </p>
          </div>
          <a
            href={estKok ? '/shifts' : '/shifts/new'}
            className="cs-btn"
            style={{
              background: '#5f7052', color: '#fff', borderRadius: 999,
              padding: '13px 28px', fontWeight: 700, fontSize: 14.5, textDecoration: 'none',
            }}
          >
            {estKok ? t('action_kok_btn') : t('action_hor_btn')}
          </a>
        </div>

        {/* ===== Liste des shifts ===== */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>
            {estKok ? t('list_kok') : t('list_other')}
          </h2>
          <a href="/shifts" style={{ color: '#5f7052', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            {estKok ? t('list_kok') : t('list_other')} →
          </a>
        </div>
        {shifts.length === 0 ? (
          <div className="cs-card" style={{ ...carte, textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🍳</div>
            <p style={{ color: '#6b7268', fontWeight: 600 }}>{t('empty_none')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {shifts.slice(0, 3).map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                showApply={estKok}
                detailHref={!estKok ? `/shifts/${shift.id}` : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
