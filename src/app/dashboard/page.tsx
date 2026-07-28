'use client'

import { signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useT, LangToggle, Key } from '@/lib/i18n'
import ShiftCard, { ShiftData } from '@/components/ShiftCard'
import AnimStyles from '@/components/AnimStyles'
import BarChart from '@/components/BarChart'
import PushSetup from '@/components/PushSetup'
import ThemeToggle from '@/components/ThemeToggle'
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
  const [shiftsPasses, setShiftsPasses] = useState<ShiftData[]>([])
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
        const [resShifts, resPasses, resStats] = await Promise.all([
          fetch('/api/shifts'),
          fetch('/api/shifts?passe=1'),
          fetch('/api/stats'),
        ])
        if (resShifts.ok) {
          const data = await resShifts.json()
          setShifts(data.shifts || [])
        }
        if (resPasses.ok) {
          const dataPasses = await resPasses.json()
          setShiftsPasses(dataPasses.shifts || [])
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
    background: 'hsl(var(--card))', borderRadius: 20, border: '1px solid #eceee3',
    boxShadow: '0 3px 12px rgba(46,52,43,0.05)', padding: 26,
  }

  if (chargement) {
    return (
      <main style={{ fontFamily: FONT, background: 'hsl(var(--background))', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>{t('dash_loading')}</p>
      </main>
    )
  }

  const estKok = user?.role === 'KOK'
  const locale = lang === 'en' ? 'en-GB' : 'nl-NL'
  const aujourdhui = new Date(new Date().toDateString())

  // ===== Shifts à venir et passés =====
  const aVenir = shifts
    .filter((s) => new Date(s.date) >= aujourdhui)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const passes = (estKok ? shiftsPasses : shifts.filter((s) => new Date(s.date) < aujourdhui))
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // ===== Cartes de stats selon le rôle =====
  const statsCartes = estKok
    ? [
        { c: String(aVenir.length), l: t('stat_kok_1'), icone: 'brief', lien: '/shifts' },
        { c: String(stats?.nbCandidatures ?? 0), l: t('stat_kok_apps'), icone: 'users', lien: '/shifts' },
        { c: String(stats?.nbAcceptees ?? 0), l: t('stat_kok_accepted'), icone: 'check', lien: '/shifts' },
        { c: `€${Math.round(stats?.totalGagne ?? 0)}`, l: t('stat_earn_total'), icone: 'bank', lien: '' },
      ]
    : [
        { c: String(shifts.length), l: t('stat_hor_1'), icone: 'brief', lien: '/shifts' },
        { c: String(stats?.nbCandidatures ?? 0), l: t('stat_hor_2'), icone: 'users', lien: '/shifts' },
        { c: String(stats?.nbEmbauches ?? 0), l: t('stat_hor_3'), icone: 'chef', lien: '/shifts' },
        { c: `€${Math.round(stats?.totalDepense ?? 0)}`, l: t('stat_spend_total'), icone: 'bank', lien: '' },
      ]

  const serieGraph = (stats?.serie || []).map((m) => ({
    label: new Date(m.key + '-02').toLocaleDateString(locale, { month: 'short' }),
    value: m.value,
  }))

  // ===== Bloc de section (à venir / passés) =====
  function Section({ titre, icone, liste, vide }: { titre: string; icone: string; liste: ShiftData[]; vide: Key }) {
    return (
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.4, display: 'flex', alignItems: 'center', gap: 9 }}>
            <IcoTile n={icone} s={16} taille={34} />
            {titre}
            <span style={{
              background: '#eef2e6', color: '#4c5e42', fontSize: 12, fontWeight: 800,
              padding: '3px 11px', borderRadius: 999,
            }}>
              {liste.length}
            </span>
          </h2>
          {liste.length > 4 && (
            <a href="/shifts" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#5f7052', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              {t('view_all')} <Ico n="arrow" s={13} />
            </a>
          )}
        </div>
        {liste.length === 0 ? (
          <div className="cs-card" style={{ ...carte, textAlign: 'center', padding: '36px 20px' }}>
            <p style={{ color: '#9aa39b', fontWeight: 600, fontSize: 14, margin: 0 }}>{t(vide)}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {liste.slice(0, 4).map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                showApply={estKok}
                detailHref={`/shifts/${shift.id}`}
              />
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <main style={{ fontFamily: FONT, background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', minHeight: '100vh' }}>
      <AnimStyles />
      {/* ===== Barre de navigation ===== */}
      <nav className="cs-nav" style={{
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e8ebe0',
        padding: '13px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <a href="/" style={{ fontWeight: 800, fontSize: 20, color: 'hsl(var(--foreground))', textDecoration: 'none', letterSpacing: -0.5 }}>
          Chef<span style={{ color: '#5f7052' }}>Shift</span>
        </a>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <LangToggle />
          <ThemeToggle />
          {estKok && (
            <a href="/profiel" className="cs-nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#5f7052', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              <Ico n="user" s={15} /> <span className="cs-nav-txt">{t('nav_profile')}</span>
            </a>
          )}
          {user?.role === 'ADMIN' && (
            <a href="/admin" className="cs-nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#5f7052', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              <Ico n="brief" s={15} /> <span className="cs-nav-txt">Admin</span>
            </a>
          )}
          <a href="/instellingen" className="cs-nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#5f7052', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            <Ico n="gear" s={15} /> <span className="cs-nav-txt">{t('nav_settings')}</span>
          </a>
          <span className="cs-hide-mob" style={{ fontSize: 13.5, color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>{user?.email}</span>
          <span className="cs-hide-mob" style={{
            background: '#eef2e6', color: '#4c5e42', fontSize: 11, fontWeight: 800,
            padding: '5px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 1,
          }}>
            {user?.role}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="cs-btn"
            aria-label={t('nav_logout')}
            style={{
              background: 'none', border: '1.5px solid #dfe4d4', borderRadius: 999,
              padding: '8px 16px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
              color: 'hsl(var(--foreground))', fontFamily: FONT, gap: 6,
            }}
          >
            <Ico n="out" s={14} /> <span className="cs-nav-txt">{t('nav_logout')}</span>
          </button>
        </div>
      </nav>

      <div className="cs-wrap" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 56px' }}>
        {/* ===== En-tête : bienvenue + action principale ===== */}
        <div className="cs-fade" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 26 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, letterSpacing: -1.2, marginBottom: 6 }}>
              {t('dash_welcome')}, {user?.name || 'chef'}
            </h1>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: 14.5, margin: 0 }}>
              {estKok
                ? t('dash_kok_sub')
                : user?.role === 'HORECA'
                ? t('dash_horeca_sub')
                : user?.role === 'ADMIN'
                ? t('dash_admin_sub')
                : t('dash_default_sub')}
            </p>
          </div>
          <a
            href={estKok ? '/shifts' : '/shifts/new'}
            className="cs-btn"
            style={{
              background: 'linear-gradient(135deg,#647a55,#46553c)', color: '#fff', borderRadius: 999,
              padding: '13px 26px', fontWeight: 700, fontSize: 14.5, textDecoration: 'none',
              boxShadow: '0 10px 22px -8px rgba(70,85,60,.5)',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            {estKok ? t('action_kok_btn') : t('action_hor_btn')} <Ico n="arrow" s={15} />
          </a>
        </div>

        {/* ===== Notifications push ===== */}
        <PushSetup />

        {/* ===== Statistiques ===== */}
        <div className="cs-fade cs-d1 cs-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 34 }}>
          {statsCartes.map((s) => {
            const contenu = (
              <>
                <IcoTile n={s.icone} s={19} taille={42} />
                <div>
                  <div className="cs-stat-n" style={{ fontSize: 25, fontWeight: 800, color: 'hsl(var(--foreground))', letterSpacing: -0.8 }}>{s.c}</div>
                  <div className="cs-stat-l" style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>{s.l}</div>
                </div>
              </>
            )
            const styleCarte: React.CSSProperties = { ...carte, display: 'flex', alignItems: 'center', gap: 14, padding: 18 }
            return s.lien ? (
              <a key={s.l} href={s.lien} className="cs-card cs-stat" style={{ ...styleCarte, textDecoration: 'none', cursor: 'pointer' }}>
                {contenu}
              </a>
            ) : (
              <div key={s.l} className="cs-card cs-stat" style={styleCarte}>
                {contenu}
              </div>
            )
          })}
        </div>

        {/* ===== Deux colonnes : à venir | passés ===== */}
        <div className="cs-fade cs-d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 28, alignItems: 'start', marginBottom: 34 }}>
          <Section
            titre={estKok ? t('list_kok') : t('list_upcoming')}
            icone="cal"
            liste={aVenir}
            vide="empty_none"
          />
          <Section
            titre={t('list_past')}
            icone="check"
            liste={passes}
            vide="empty_past"
          />
        </div>

        {/* ===== Graphique budget / revenus ===== */}
        <div className="cs-fade cs-d3 cs-card" style={{ ...carte }}>
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
      </div>
    </main>
  )
}
