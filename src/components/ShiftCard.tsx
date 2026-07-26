'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n'

export type ShiftData = {
  id: string
  title: string
  function?: string
  date: string
  startTime: string
  endTime: string
  hourlyRate: number
  totalAmount?: number | null
  locationCity?: string | null
  isUrgent?: boolean
  status?: string
  horeca?: { horecaProfile?: { companyName?: string } | null } | null
  _count?: { applications: number }
}

export default function ShiftCard({ shift, showApply }: { shift: ShiftData; showApply?: boolean }) {
  const { t, lang } = useT()
  const [etat, setEtat] = useState<'idle' | 'envoi' | 'ok' | 'erreur'>('idle')
  const [msgErreur, setMsgErreur] = useState('')
  const locale = lang === 'en' ? 'en-GB' : 'nl-NL'

  const dateObj = new Date(shift.date)
  const dateStr = dateObj.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
  const start = new Date(shift.startTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  const end = new Date(shift.endTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  const restaurant = shift.horeca?.horecaProfile?.companyName

  async function postuler() {
    setEtat('envoi')
    setMsgErreur('')
    try {
      const res = await fetch(`/api/shifts/${shift.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (res.ok) {
        setEtat('ok')
      } else {
        const data = await res.json().catch(() => ({}))
        setMsgErreur(data?.error === 'Already applied' ? t('apply_already') : t('apply_fail'))
        setEtat('erreur')
      }
    } catch {
      setMsgErreur(t('apply_fail'))
      setEtat('erreur')
    }
  }

  return (
    <div className="cs-card" style={{
      background: '#fff', borderRadius: 18, boxShadow: '0 4px 14px rgba(46,52,43,0.06)',
      padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: 16,
    }}>
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2e342b' }}>{shift.title}</h3>
          {shift.isUrgent && (
            <span style={{
              background: '#fef2f2', color: '#b91c1c', fontSize: 11, fontWeight: 800,
              padding: '4px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 1,
            }}>
              🔥 {t('urgent')}
            </span>
          )}
        </div>
        {restaurant && (
          <p style={{ fontSize: 14.5, fontWeight: 700, color: '#5f7052', marginBottom: 6 }}>
            🍽️ {restaurant}
          </p>
        )}
        <p style={{ fontSize: 14, color: '#6b7268' }}>
          📅 {dateStr} &nbsp;·&nbsp; 🕐 {start} – {end}
          {shift.locationCity && <>&nbsp;·&nbsp; 📍 {shift.locationCity}</>}
        </p>
        {shift._count && (
          <p style={{ fontSize: 12.5, color: '#9aa39b', marginTop: 6 }}>
            {shift._count.applications} {t('applications')}
          </p>
        )}
        {etat === 'erreur' && (
          <p style={{ fontSize: 13, color: '#b91c1c', marginTop: 6, fontWeight: 600 }}>{msgErreur}</p>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#5f7052' }}>
          €{shift.hourlyRate}<span style={{ fontSize: 14, fontWeight: 600, color: '#6b7268' }}>/u</span>
        </div>
        {shift.totalAmount != null && (
          <div style={{ fontSize: 13, color: '#6b7268', marginBottom: 8 }}>
            {t('total')} €{Math.round(shift.totalAmount)}
          </div>
        )}
        {showApply && (
          <button
            onClick={postuler}
            disabled={etat === 'envoi' || etat === 'ok'}
            className="cs-btn"
            style={{
              marginTop: 6,
              background: etat === 'ok' ? '#8a9a7b' : '#5f7052',
              color: '#fff', border: 'none', borderRadius: 999,
              padding: '10px 22px', fontWeight: 700, fontSize: 13.5,
              cursor: etat === 'envoi' || etat === 'ok' ? 'default' : 'pointer',
              opacity: etat === 'envoi' ? 0.7 : 1,
            }}
          >
            {etat === 'envoi' ? t('apply_sending') : etat === 'ok' ? t('applied') : t('apply_btn')}
          </button>
        )}
      </div>
    </div>
  )
}
