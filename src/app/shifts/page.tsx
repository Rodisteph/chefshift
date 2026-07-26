'use client'

import { useEffect, useState } from 'react'
import { useT, LangToggle } from '@/lib/i18n'
import ShiftCard, { ShiftData } from '@/components/ShiftCard'
import AnimStyles from '@/components/AnimStyles'

export default function ShiftsPage() {
  const { t } = useT()
  const [shifts, setShifts] = useState<ShiftData[]>([])
  const [chargement, setChargement] = useState(true)
  const [role, setRole] = useState('')

  useEffect(() => {
    async function charger() {
      const s = await fetch('/api/auth/session').then((r) => r.json())
      if (!s?.user) {
        window.location.href = '/login'
        return
      }
      setRole(s.user.role)
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

  const estKok = role === 'KOK'

  return (
    <main style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', background: '#f7f5f0', color: '#2e342b', minHeight: '100vh' }}>
      <AnimStyles />
      <nav style={{
        background: '#fff', borderBottom: '1px solid #e4e9dd',
        padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <a href="/dashboard" style={{ fontWeight: 800, fontSize: 20, color: '#2e342b', textDecoration: 'none' }}>
          Chef<span style={{ color: '#5f7052' }}>Shift</span>
        </a>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <LangToggle />
          <a href="/dashboard" className="cs-nav-link" style={{ color: '#5f7052', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            {t('back_dashboard')}
          </a>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <div className="cs-fade" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, letterSpacing: -0.8 }}>
              {estKok ? t('shifts_title') : t('shifts_my')}
            </h1>
            <p style={{ color: '#6b7268', marginTop: 6 }}>
              {estKok ? t('shifts_sub') : ''}
            </p>
          </div>
          {role === 'HORECA' && (
            <a href="/shifts/new" className="cs-btn" style={{
              background: '#5f7052', color: '#fff', padding: '12px 24px', borderRadius: 999,
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
            }}>
              + {t('shifts_new')}
            </a>
          )}
        </div>

        {chargement ? (
          <p style={{ color: '#6b7268', fontWeight: 600, textAlign: 'center', padding: 40 }}>{t('dash_loading')}</p>
        ) : shifts.length === 0 ? (
          <div className="cs-card" style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 14px rgba(46,52,43,0.06)', padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🍳</div>
            <p style={{ color: '#6b7268', fontWeight: 600 }}>{t('empty_shifts')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {shifts.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} showApply={estKok} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
