'use client'

import { signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useT, LangToggle } from '@/lib/i18n'
import ShiftCard, { ShiftData } from '@/components/ShiftCard'
import AnimStyles from '@/components/AnimStyles'
import BarChart from '@/components/BarChart'
import PushSetup from '@/components/PushSetup'
import { Ico, IcoTile } from '@/components/Icons'

const FONT = '"Sora","Inter","Helvetica Neue",Arial,sans-serif'

type SessionUser = {
  name?: string | null
  email?: string | null
  role?: string
}

type Stats = {
  role: string
  nbShifts?: number
  nbCandidatures?: number
  nbEmbauches?: number
  nbAcceptees?: number
  totalDepense?: number
  totalGagne?: number
  serie: { key: string; value: number }[]
}

export default function DashboardPage() {
  const { t, lang } = useT()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [chargement, setChargement] = useState(true)
  const [shifts, setShifts] = useState<ShiftData[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    async function charger() {
      const s = await fetch('/api/auth/session').then((r) => r.json())
      if (!s?.user) {
        window.location.href = '/login'
        return
      }
      setUser(s.user)
      try {
        const [resShifts, resStats] = await Promise.all([
          fetch('/api/shifts'),
          fetch('/api/stats'),
        ])
        if (resShifts.ok) {
          const data = await resShifts.json()
          setShifts(data.shifts || [])
        }
        if (resStats.ok) {
          setStats(await resStats.json())
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
  const locale = lang === 'en' ? 'en-GB' : 'nl-NL'

  // ===== Cartes de stats selon le rôle (cliquables vers la liste) =====
  const statsCartes = estKok
    ? [
        { c: String(shifts.length), l: t('stat_kok_1'), icone: 'brief', lien: '/shifts' },
        { c: String(stats?.nbCandidatures ?? 0), l: t('stat_kok_apps'), icone: 'users', lien: '/shifts' },
        { c: String(stats?.nbAcceptees ?? 0), l: t('stat_kok_accepted'), icone: 'check', lien: '/shifts' },
        { c: `€${Math.round(stats?.totalGagne ?? 0)}`, l: t('stat_earn_total'), icone: 'bank', lien: '' },
      ]
    : [
        { c: String(stats?.nbShifts ?? shifts.length), l: t('stat_hor_1'), icone: 'brief', lien: '/shifts' },
        { c: String(stats?.nbCandidatures ?? 0), l: t('stat_hor_2'), icone: 'users', lien: '/shifts' },
        { c: String(stats?.nbEmbauches ?? 0), l: t('stat_hor_3'), icone: 'chef', lien: '/shifts' },
        { c: `€${Math.round(stats?.totalDepense ?? 0)}`, l: t('stat_spend_total'), icone: 'bank', lien: '' },
      ]

  // ===== Série du graphique (labels localisés) =====
  const serieGraph = (stats?.serie || []).map((m) => ({
    label: new Date(m.key + '-02').toLocaleDateString(locale, { month: 'short' }),
    value: m.value,
  }))

  return (
    <main style={{ fontFamily: FONT, background: '#f6f7f2', color: '#23281f', minHeight: '100vh' }}>
      <AnimStyles />
      {/* ===== Barre de navigation ===== */}
      <nav className="cs-nav" style={{
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
          <span className="cs-hide-mob" style={{ fontSize: 13.5, color: '#6b7268', fontWeight: 500 }}>{user?.email}</span>
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

      <div className="cs-wrap" style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <h1 className="cs-fade" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: -1.4, marginBottom: 8 }}>
          {t('dash_welcome')}, {user?.name || 'chef'}
        </h1>
        <p className="cs-fade cs-d1" style={{ color: '#6b7268', marginBottom: 32, fontSize: 15.5 }}>
          {estKok
            ? t('dash_kok_sub')
            : user?.role === 'HORECA'
            ? t('dash_horeca_sub')
            : user?.role === 'ADMIN'
            ? t('dash_admin_sub')
            : t('dash_default_sub')}
        </p>

        {/* ===== Activation des notifications push ===== */}
        <PushSetup />

        {/* ===== Statistiques ===== */}
        <div className="cs-fade cs-d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 18, marginBottom: 24 }}>
          {statsCartes.map((s) => {
            const contenu = (
              <>
                <IcoTile n={s.icone} s={19} taille={42} />
                <div>
                  <div style={{ fontSize: 25, fontWeight: 800, color: '#23281f', letterSpacing: -0.8 }}>{s.c}</div>
                  <div style={{ fontSize: 12.5, color: '#6b7268', fontWeight: 600 }}>{s.l}</div>
                </div>
              </>
            )
            const styleCarte: React.CSSProperties = { ...carte, display: 'flex', alignItems: 'center', gap: 14, padding: 20 }
            return s.lien ? (
              <a key={s.l} href={s.lien} className="cs-card" style={{ ...styleCarte, textDecoration: 'none', cursor: 'pointer' }}>
                {contenu}
              </a>
            ) : (
              <div key={s.l} className="cs-card" style={styleCarte}>
                {contenu}
              </div>
            )
          })}
        </div>

        {/* ===== Graphique budget / revenus ===== */}
        <div className="cs-fade cs-d3 cs-card" style={{ ...carte, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <IcoTile n="bank" s={18} taille={40} />
            <h2 style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.4 }}>
              {estKok ? t('chart_earn') : t('chart_spend')}
            </h2>
          </div>
          {serieGraph.every((m) => m.value === 0) ? (
            <p style={{ color: '#9aa39b', fontSize: 14, textAlign: 'center', padding: '30px 0' }}>{t('chart_empty')}</p>
          ) : (
            <BarChart data={serieGraph} />
          )}
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
                detailHref={`/shifts/${shift.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
