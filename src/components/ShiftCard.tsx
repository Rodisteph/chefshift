'use client'

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
  const locale = lang === 'en' ? 'en-GB' : 'nl-NL'

  const dateObj = new Date(shift.date)
  const dateStr = dateObj.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
  const start = new Date(shift.startTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  const end = new Date(shift.endTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  const restaurant = shift.horeca?.horecaProfile?.companyName

  return (
    <div style={{
      background: '#fff', borderRadius: 18, boxShadow: '0 4px 14px rgba(46,52,43,0.06)',
      padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: 16, transition: 'box-shadow 0.2s, transform 0.2s',
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
          <button style={{
            marginTop: 6, background: '#5f7052', color: '#fff', border: 'none',
            borderRadius: 999, padding: '10px 22px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
          }}>
            {t('apply_btn')}
          </button>
        )}
      </div>
    </div>
  )
}
