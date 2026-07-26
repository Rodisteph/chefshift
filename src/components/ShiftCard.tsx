'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n'
import { Ico } from '@/components/Icons'

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

const FONT = '"Sora","Inter","Helvetica Neue",Arial,sans-serif'

export default function ShiftCard({
  shift,
  showApply,
  detailHref,
}: {
  shift: ShiftData
  showApply?: boolean
  detailHref?: string
}) {
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

  const titre = detailHref ? (
    <a href={detailHref} style={{ color: '#23281f', textDecoration: 'none' }}>
      {shift.title} <Ico n="arrow" s={15} c="#5f7052" />
    </a>
  ) : (
    shift.title
  )

  const meta: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 13.5, color: '#6b7268', fontWeight: 500,
  }

  return (
    <div className="cs-card" style={{
      background: '#fff', borderRadius: 20, border: '1px solid #eceee3',
      boxShadow: '0 3px 12px rgba(46,52,43,0.05)',
      padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: 18, fontFamily: FONT,
    }}>
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
          <h3 style={{ fontSize: 17.5, fontWeight: 800, letterSpacing: -0.3 }}>{titre}</h3>
          {shift.isUrgent && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#fef2f2', color: '#b91c1c', fontSize: 10.5, fontWeight: 800,
              padding: '4px 11px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 1,
            }}>
              <Ico n="flame" s={12} /> {t('urgent')}
            </span>
          )}
          {shift.status === 'CONFIRMED' && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#eef2e7', color: '#4c5e42', fontSize: 10.5, fontWeight: 800,
              padding: '4px 11px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 1,
            }}>
              <Ico n="check" s={12} /> {t('status_confirmed')}
            </span>
          )}
        </div>
        {restaurant && (
          <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#4c5e42', marginBottom: 7 }}>
            <Ico n="chef" s={15} /> {restaurant}
          </p>
        )}
        <p style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={meta}><Ico n="cal" s={14} c="#8a9a7b" /> {dateStr}</span>
          <span style={meta}><Ico n="clock" s={14} c="#8a9a7b" /> {start} – {end}</span>
          {shift.locationCity && <span style={meta}><Ico n="pin" s={14} c="#8a9a7b" /> {shift.locationCity}</span>}
        </p>
        {shift._count && (
          <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#9aa39b', marginTop: 7, fontWeight: 500 }}>
            <Ico n="users" s={13} /> {shift._count.applications} {t('applications')}
          </p>
        )}
        {etat === 'erreur' && (
          <p style={{ fontSize: 13, color: '#b91c1c', marginTop: 7, fontWeight: 600 }}>{msgErreur}</p>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          display: 'inline-block', background: '#f0f4ea', borderRadius: 14, padding: '10px 16px', marginBottom: 10,
        }}>
          <span style={{ fontSize: 23, fontWeight: 800, color: '#4c5e42', letterSpacing: -0.5 }}>€{shift.hourlyRate}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#7d8877' }}>/u</span>
        </div>
        {shift.totalAmount != null && (
          <div style={{ fontSize: 12.5, color: '#6b7268', marginBottom: 8, fontWeight: 500 }}>
            {t('total')} €{Math.round(shift.totalAmount)}
          </div>
        )}
        {showApply && shift.status !== 'CONFIRMED' && (
          <button
            onClick={postuler}
            disabled={etat === 'envoi' || etat === 'ok'}
            className="cs-btn"
            style={{
              display: 'flex', width: '100%',
              background: etat === 'ok' ? '#8a9a7b' : 'linear-gradient(135deg,#647a55,#46553c)',
              color: '#fff', border: 'none', borderRadius: 12,
              padding: '11px 22px', fontWeight: 700, fontSize: 13.5, fontFamily: FONT,
              cursor: etat === 'envoi' || etat === 'ok' ? 'default' : 'pointer',
              opacity: etat === 'envoi' ? 0.7 : 1,
            }}
          >
            {etat === 'ok' && <Ico n="check" s={14} />}
            {etat === 'envoi' ? t('apply_sending') : etat === 'ok' ? t('applied') : t('apply_btn')}
          </button>
        )}
      </div>
    </div>
  )
}
