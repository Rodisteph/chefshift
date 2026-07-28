'use client'

import { useEffect, useState } from 'react'
import { useT, LangToggle } from '@/lib/i18n'
import AnimStyles from '@/components/AnimStyles'
import { Ico } from '@/components/Icons'
import RateStepper from '@/components/RateStepper'
import { MIN_HOURLY_RATE } from '@/lib/constants'

const FONT = '"Sora","Inter","Helvetica Neue",Arial,sans-serif'

// Catégories prêtes à cliquer pour remplir rapidement titre & fonction
const TITRES = ['Lunchdienst', 'Dinerdienst', 'Ontbijtdienst', 'Avonddienst', 'Weekenddienst', 'Banqueting', 'Evenement']
const FONCTIES = ['Chef de partie', 'Sous-chef', 'Zelfstandig werkend kok', 'Commis', 'Keukenhulp', 'Afwas', 'Garde-manger', 'Saucier', 'Pâtisserie', 'Grillkok']

function Chips({ options, current, onPick }: { options: string[]; current: string; onPick: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 8 }}>
      {options.map((o) => {
        const actif = current.trim().toLowerCase() === o.toLowerCase()
        return (
          <button
            key={o}
            type="button"
            onClick={() => onPick(o)}
            style={{
              padding: '6px 13px', borderRadius: 999, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
              border: actif ? '1.5px solid #5f7052' : '1.5px solid #e2e6d7',
              background: actif ? '#eef2e6' : 'hsl(var(--card))',
              color: actif ? '#3d5233' : 'hsl(var(--foreground))',
              transition: 'border-color .15s ease, background .15s ease',
            }}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}

export default function NewShiftPage() {
  const { t } = useT()
  const [title, setTitle] = useState('')
  const [func, setFunc] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [locationStreet, setLocationStreet] = useState('')
  const [locationPostal, setLocationPostal] = useState('')
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
    if (!(parseFloat(hourlyRate) >= MIN_HOURLY_RATE)) {
      setError(`${t('rate_too_low')} €${MIN_HOURLY_RATE.toFixed(2)}`)
      return
    }
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
          // Instants construits dans le fuseau local du navigateur (évite le décalage d'1h)
          startAt: new Date(`${date}T${startTime}`).toISOString(),
          endAt: new Date(`${date}T${endTime}`).toISOString(),
          hourlyRate: parseFloat(hourlyRate),
          locationStreet,
          locationPostal,
          locationCity,
          isUrgent,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error === 'RATE_TOO_LOW' ? `${t('rate_too_low')} €${(data.min ?? MIN_HOURLY_RATE).toFixed(2)}` : t('shift_fail'))
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
    width: '100%', padding: 12, border: '1.5px solid #e2e6d7', borderRadius: 12,
    fontSize: 15, outline: 'none', boxSizing: 'border-box' as const, background: 'hsl(var(--card))', fontFamily: FONT,
  }
  const etiquette = { display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#3c4436' }

  if (!autorise) {
    return (
      <main style={{ fontFamily: FONT, background: 'hsl(var(--background))', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>{t('dash_loading')}</p>
      </main>
    )
  }

  return (
    <main style={{ fontFamily: FONT, background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', minHeight: '100vh' }}>
      <AnimStyles />
      <nav style={{
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e8ebe0',
        padding: '13px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <a href="/dashboard" style={{ fontWeight: 800, fontSize: 20, color: 'hsl(var(--foreground))', textDecoration: 'none', letterSpacing: -0.5 }}>
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
        <h1 className="cs-fade" style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 800, letterSpacing: -1.2, marginBottom: 8 }}>
          {t('shifts_new')}
        </h1>
        <p className="cs-fade cs-d1" style={{ color: 'hsl(var(--muted-foreground))', marginBottom: 32 }}>{t('shifts_new_sub')}</p>

        <form onSubmit={handleSubmit} className="cs-pop" style={{ background: 'hsl(var(--card))', borderRadius: 20, border: '1px solid #eceee3', boxShadow: '0 12px 34px -12px rgba(46,52,43,0.14)', padding: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={etiquette}>{t('field_shift_title')}</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required
              placeholder={t('shift_title_ph')} style={champ} />
            <Chips options={TITRES} current={title} onPick={setTitle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={etiquette}>{t('field_function')}</label>
            <input value={func} onChange={(e) => setFunc(e.target.value)}
              placeholder={t('shift_function_ph')} style={champ} />
            <Chips options={FONCTIES} current={func} onPick={setFunc} />
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
              <RateStepper value={hourlyRate} onChange={setHourlyRate} min={MIN_HOURLY_RATE} inputStyle={champ} />
              <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 5, fontWeight: 600 }}>
                {t('rate_min_hint')} €{MIN_HOURLY_RATE.toFixed(2)}
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={etiquette}>{t('field_street')}</label>
            <input value={locationStreet} onChange={(e) => setLocationStreet(e.target.value)}
              placeholder="Herengracht 123" style={champ} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={etiquette}>{t('field_postal')}</label>
              <input value={locationPostal} onChange={(e) => setLocationPostal(e.target.value)}
                placeholder="1015 BG" style={champ} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={etiquette}>{t('field_city')}</label>
              <input value={locationCity} onChange={(e) => setLocationCity(e.target.value)} required
                placeholder="Amsterdam" style={champ} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer', fontSize: 14.5, fontWeight: 600 }}>
            <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} style={{ width: 18, height: 18 }} />
            <Ico n="flame" s={15} c="#b91c1c" /> {t('field_urgent')}
          </label>

          {error && (
            <p style={{ color: '#b91c1c', fontSize: 13.5, marginBottom: 16, background: '#fef2f2', padding: '10px 14px', borderRadius: 10, fontWeight: 600 }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="cs-btn" style={{
            width: '100%', padding: 14, background: 'linear-gradient(135deg,#647a55,#46553c)', color: '#fff',
            border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, fontFamily: FONT,
            cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
            boxShadow: '0 10px 22px -8px rgba(70,85,60,.5)',
          }}>
            {loading ? t('form_loading') : t('shift_submit')}
          </button>
        </form>
      </div>
    </main>
  )
}
