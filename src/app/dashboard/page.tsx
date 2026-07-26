'use client'

import { signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useT, LangToggle } from '@/lib/i18n'
import ShiftCard, { ShiftData } from '@/components/ShiftCard'
import AnimStyles from '@/components/AnimStyles'
import { Ico, IcoTile } from '@/components/Icons'

const FONT = '"Sora","Inter","Helvetica Neue",Arial,sans-serif'

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
    background: '#fff', borderRadius: 20, border: '1px solid #eceee3',
    boxShadow: '0 3px 12px rgba(46,52,43,0.05)', padding: 26,
  }

  if (chargement) {
    return (
      <main style={{ fontFamily: FONT, background: '#f6f7f2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7268', fontWeight: 600 }}>{t('dash_loading')}</p>
      </main>
    )
  }

  const estKok = user?.role === 'KOK'
  const totalCandidatures = shifts.reduce((acc, s) => acc + (s._count?.applications || 0), 0)

  const stats = estKok
    ? [
        { c: String(shifts.length), l: t('stat_kok_1'), icone: 'brief' },
        { c: '0', l: t('stat_kok_2'), icone: 'check' },
        { c: '€0', l: t('stat_kok_3'), icone: 'bank' },
      ]
    : [
        { c: String(shifts.length), l: t('stat_hor_1'), icone: 'brief' },
        { c: String(totalCandidatures), l: t('stat_hor_2'), icone: 'users' },
        { c: '0', l: t('stat_hor_3'), icone: 'chef' },
      ]

  return (
    <main style={{ fontFamily: FONT, background: '#f6f7f2', color: '#23281f', minHeight: '100vh' }}>
      <AnimStyles />
      {/* ===== Barre de navigation ===== */}
      <nav style={{
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e8ebe0',
        padding: '13px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <a href="/" style={{ fontWeight: 800, fontSize: 20, color: '#23281f', textDecoration: 'none', letterSpacing: -0.5 }}>
          Chef<span style={{ color: '#5f7052' }}>Shift</span>
        </a>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <LangToggle />
          {estKok && (
            <a href="/profiel" className="cs-nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#5f7052', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              <Ico n="user" s={15} /> {t('nav_profile')}
            </a>
          )}
          <span style={{ fontSize: 13.5, color: '#6b7268', fontWeight: 500 }}>{user?.email}</span>
          <span style={{
            background: '#eef2e6', color: '#4c5e42', fontSize: 11, fontWeight: 800,
            padding: '5px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 1,
          }}>
            {user?.role}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="cs-btn"
            style={{
              background: 'none', border: '1.5px solid #dfe4d4', borderRadius: 999,
              padding: '8px 18px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
              color: '#23281f', fontFamily: FONT,
            }}
          >
            {t('nav_logout')}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <h1 className="cs-fade" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: -1.4, marginBottom: 8 }}>
          {t('dash_welcome')}, {user?.name || 'chef'}
        </h1>
        <p className="cs-fade cs-d1" style={{ color: '#6b7268', marginBottom: 40, fontSize: 15.5 }}>
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
          {stats.map((s) => (
            <div key={s.l} className="cs-card" style={{ ...carte, display: 'flex', alignItems: 'center', gap: 16 }}>
              <IcoTile n={s.icone} s={20} />
              <div>
                <div style={{ fontSize: 27, fontWeight: 800, color: '#23281f', letterSpacing: -0.8 }}>{s.c}</div>
                <div style={{ fontSize: 13, color: '#6b7268', fontWeight: 600 }}>{s.l}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== Action principale ===== */}
        <div className="cs-fade cs-d3 cs-card" style={{
          ...carte, marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 18,
          background: 'linear-gradient(135deg, #ffffff, #f2f5ea)',
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, letterSpacing: -0.5 }}>
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
              background: 'linear-gradient(135deg,#647a55,#46553c)', color: '#fff', borderRadius: 999,
              padding: '13px 28px', fontWeight: 700, fontSize: 14.5, textDecoration: 'none',
              boxShadow: '0 10px 22px -8px rgba(70,85,60,.5)',
            }}
          >
            {estKok ? t('action_kok_btn') : t('action_hor_btn')} <Ico n="arrow" s={15} />
          </a>
        </div>

        {/* ===== Liste des shifts ===== */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.5 }}>
            {estKok ? t('list_kok') : t('list_other')}
          </h2>
          <a href="/shifts" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#5f7052', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            {estKok ? t('list_kok') : t('list_other')} <Ico n="arrow" s={14} />
          </a>
        </div>
        {shifts.length === 0 ? (
          <div className="cs-card" style={{ ...carte, textAlign: 'center', padding: 52 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <IcoTile n="inbox" s={22} taille={56} />
            </div>
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
