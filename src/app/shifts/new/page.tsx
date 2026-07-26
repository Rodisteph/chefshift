'use client'

import { useEffect, useState } from 'react'
import { useT, LangToggle } from '@/lib/i18n'

export default function NewShiftPage() {
  const { t } = useT()
  const [title, setTitle] = useState('')
  const [func, setFunc] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [locationCity, setLocationCity] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [autorise, setAutorise] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session').then((r) => r.json()).then((s) => {
      if (!s?.user) {
        window.location.href = '/login'
      } else if (s.user.role !== 'HORECA' && s.user.role !== 'ADMIN') {
        window.location.href = '/dashboard'
      } else {
        setAutorise(true)
      }
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          function: func || title,
          date,
          startTime,
          endTime,
          hourlyRate: parseFloat(hourlyRate),
          locationCity,
          isUrgent,
        }),
      })
      if (!res.ok) {
        setError(t('shift_fail'))
        setLoading(false)
        return
      }
      window.location.href = '/shifts'
    } catch {
      setError(t('shift_fail'))
      setLoading(false)
    }
  }

  const champ = {
    width: '100%', padding: 12, border: '1.5px solid #e4e9dd', borderRadius: 10,
    fontSize: 15, outline: 'none', boxSizing: 'border-box' as const, background: '#fff',
  }
  const etiquette = { display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }

  if (!autorise) {
    return (
      <main style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', background: '#f7f5f0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7268', fontWeight: 600 }}>{t('dash_loading')}</p>
      </main>
    )
  }

  return (
    <main style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', background: '#f7f5f0', color: '#2e342b', minHeight: '100vh' }}>
      <nav style={{
        background: '#fff', borderBottom: '1px solid #e4e9dd',
        padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <a href="/dashboard" style={{ fontWeight: 800, fontSize: 20, color: '#2e342b', textDecoration: 'none' }}>
          Chef<span style={{ color: '#5f7052' }}>Shift</span>
        </a>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <LangToggle />
          <a href="/shifts" style={{ color: '#5f7052', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            ← {t('list_other')}
          </a>
        </div>
      </nav>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 800, letterSpacing: -0.8, marginBottom: 8 }}>
          {t('shifts_new')}
        </h1>
        <p style={{ color: '#6b7268', marginBottom: 32 }}>{t('shifts_new_sub')}</p>

        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 18, boxShadow: '0 10px 30px rgba(46,52,43,0.10)', padding: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={etiquette}>{t('field_shift_title')}</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required
              placeholder="Bijv. Zelfstandig werkend kok avonddienst" style={champ} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={etiquette}>{t('field_function')}</label>
            <input value={func} onChange={(e) => setFunc(e.target.value)}
              placeholder="Bijv. Kok, sous-chef, keukenhulp" style={champ} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={etiquette}>{t('field_date')}</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={champ} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={etiquette}>{t('field_start')}</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required style={champ} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={etiquette}>{t('field_end')}</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required style={champ} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={etiquette}>{t('field_rate')}</label>
              <input type="number" min="1" step="0.5" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} required
                placeholder="22" style={champ} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={etiquette}>{t('field_city')}</label>
              <input value={locationCity} onChange={(e) => setLocationCity(e.target.value)} required
                placeholder="Amsterdam" style={champ} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer', fontSize: 14.5, fontWeight: 600 }}>
            <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} style={{ width: 18, height: 18 }} />
            🔥 {t('field_urgent')}
          </label>

          {error && (
            <p style={{ color: '#b91c1c', fontSize: 13.5, marginBottom: 16, background: '#fef2f2', padding: '10px 14px', borderRadius: 8 }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 14, background: '#5f7052', color: '#fff',
            border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15,
            cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? t('form_loading') : t('shift_submit')}
          </button>
        </form>
      </div>
    </main>
  )
}
