'use client'

import { signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useT, LangToggle } from '@/lib/i18n'

type SessionUser = {
  name?: string | null
  email?: string | null
  role?: string
}

export default function DashboardPage() {
  const { t } = useT()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [chargement, setChargement] = useState(true)
  const [shifts, setShifts] = useState<any[]>([])
  const [shiftsErreur, setShiftsErreur] = useState(false)

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
          setShifts(Array.isArray(data) ? data : data.shifts || [])
        } else {
          setShiftsErreur(true)
        }
      } catch {
        setShiftsErreur(true)
      }
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

  return (
    <main style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', background: '#f7f5f0', color: '#2e342b', minHeight: '100vh' }}>
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
          <span style={{ fontSize: 14, color: '#6b7268' }}>{user?.email}</span>
          <span style={{
            background: '#e4e9dd', color: '#5f7052', fontSize: 12, fontWeight: 800,
            padding: '5px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 1,
          }}>
            {user?.role}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
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
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: -1, marginBottom: 8 }}>
          {t('dash_welcome')}, {user?.name || 'chef'} 👋
        </h1>
        <p style={{ color: '#6b7268', marginBottom: 40 }}>
          {estKok
            ? t('dash_kok_sub')
            : user?.role === 'HORECA'
            ? t('dash_horeca_sub')
            : user?.role === 'ADMIN'
            ? t('dash_admin_sub')
            : t('dash_default_sub')}
        </p>

        {/* ===== Statistiques ===== */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
          {(estKok
            ? [
                { c: '0', l: t('stat_kok_1') },
                { c: '0', l: t('stat_kok_2') },
                { c: '€0', l: t('stat_kok_3') },
              ]
            : [
                { c: String(shifts.length), l: t('stat_hor_1') },
                { c: '0', l: t('stat_hor_2') },
                { c: '0', l: t('stat_hor_3') },
              ]
          ).map((s) => (
            <div key={s.l} style={carte}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#5f7052' }}>{s.c}</div>
              <div style={{ fontSize: 13.5, color: '#6b7268', fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* ===== Action principale ===== */}
        <div style={{ ...carte, marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              {estKok ? t('action_kok_t') : t('action_hor_t')}
            </h2>
            <p style={{ color: '#6b7268', fontSize: 14.5 }}>
              {estKok ? t('action_kok_d') : t('action_hor_d')}
            </p>
          </div>
          <button style={{
            background: '#5f7052', color: '#fff', border: 'none', borderRadius: 999,
            padding: '13px 28px', fontWeight: 700, fontSize: 14.5, cursor: 'pointer',
          }}>
            {estKok ? t('action_kok_btn') : t('action_hor_btn')}
          </button>
        </div>

        {/* ===== Liste des shifts ===== */}
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 18 }}>
          {estKok ? t('list_kok') : t('list_other')}
        </h2>
        {shifts.length === 0 ? (
          <div style={{ ...carte, textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🍳</div>
            <p style={{ color: '#6b7268', fontWeight: 600 }}>
              {shiftsErreur ? t('empty_api') : t('empty_none')}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {shifts.map((shift: any, i: number) => (
              <div key={shift.id || i} style={{ ...carte, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800 }}>{shift.title || shift.titre || 'Shift'}</h3>
                  <p style={{ color: '#6b7268', fontSize: 14 }}>
                    {shift.date || ''} {shift.location ? '· ' + shift.location : ''}
                  </p>
                </div>
                {shift.rate && (
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#5f7052' }}>€{shift.rate}/u</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
