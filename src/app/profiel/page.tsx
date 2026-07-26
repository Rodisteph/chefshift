'use client'

import { useEffect, useState } from 'react'
import { useT, LangToggle } from '@/lib/i18n'
import AnimStyles from '@/components/AnimStyles'

const POSTES = [
  'Garde-manger', 'Rôtisseur', 'Poissonnier', 'Saucier',
  'Pâtissier', 'Garnituur', 'Entremetier', 'Chef de partie',
  'Sous-chef', 'Cuisinier', 'Keukenhulp', 'Banqueting',
]

const CUISINES = [
  'Frans', 'Italiaans', 'Aziatisch', 'Fusion', 'Vegetarisch / Vegan',
  'Vis & schaaldieren', 'Grill / BBQ', 'Fine dining', 'Brasserie', 'Banket',
]

type Exp = {
  function: string
  companyName: string
  location: string
  fromDate: string
  toDate: string
  isCurrent: boolean
  description: string
}

export default function ProfielPage() {
  const { t } = useT()
  const [chargement, setChargement] = useState(true)
  const [sauvegarde, setSauvegarde] = useState<'idle' | 'envoi' | 'ok' | 'erreur'>('idle')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [city, setCity] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [functions, setFunctions] = useState<string[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [haccpCertified, setHaccpCertified] = useState(false)
  const [svhCertified, setSvhCertified] = useState(false)
  const [svhLevel, setSvhLevel] = useState('')
  const [hourlyRateMin, setHourlyRateMin] = useState('')
  const [hourlyRateMax, setHourlyRateMax] = useState('')
  const [description, setDescription] = useState('')
  const [exps, setExps] = useState<Exp[]>([])

  useEffect(() => {
    async function charger() {
      const s = await fetch('/api/auth/session').then((r) => r.json())
      if (!s?.user) {
        window.location.href = '/login'
        return
      }
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        const p = data.profile
        if (p) {
          setFirstName(p.firstName || '')
          setLastName(p.lastName || '')
          setDateOfBirth(p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : '')
          setCity(p.city || '')
          setYearsExperience(p.yearsExperience != null ? String(p.yearsExperience) : '')
          setFunctions(p.functions || [])
          setSpecialties(p.specialties || [])
          setHaccpCertified(!!p.haccpCertified)
          setSvhCertified(!!p.svhCertified)
          setSvhLevel(p.svhLevel || '')
          setHourlyRateMin(p.hourlyRateMin != null ? String(p.hourlyRateMin) : '')
          setHourlyRateMax(p.hourlyRateMax != null ? String(p.hourlyRateMax) : '')
          setDescription(p.description || '')
          setExps((p.workExperience || []).map((w: any) => ({
            function: w.function || '',
            companyName: w.companyName || '',
            location: w.location || '',
            fromDate: w.fromDate ? w.fromDate.slice(0, 7) : '',
            toDate: w.toDate ? w.toDate.slice(0, 7) : '',
            isCurrent: !!w.isCurrent,
            description: w.description || '',
          })))
        }
      }
      setChargement(false)
    }
    charger()
  }, [])

  function basculer(liste: string[], valeur: string, setter: (l: string[]) => void) {
    setter(liste.includes(valeur) ? liste.filter((v) => v !== valeur) : [...liste, valeur])
  }

  function majExp(i: number, champ: keyof Exp, valeur: any) {
    setExps(exps.map((e, j) => (j === i ? { ...e, [champ]: valeur } : e)))
  }

  async function sauvegarder(e: React.FormEvent) {
    e.preventDefault()
    setSauvegarde('envoi')
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName, lastName, dateOfBirth, city, yearsExperience,
          functions, specialties, description,
          haccpCertified, svhCertified, svhLevel,
          hourlyRateMin, hourlyRateMax,
          workExperience: exps.map((w) => ({
            ...w,
            fromDate: w.fromDate ? w.fromDate + '-01' : '',
            toDate: w.toDate ? w.toDate + '-01' : '',
          })),
        }),
      })
      setSauvegarde(res.ok ? 'ok' : 'erreur')
      if (res.ok) setTimeout(() => setSauvegarde('idle'), 3000)
    } catch {
      setSauvegarde('erreur')
    }
  }

  const champ: React.CSSProperties = {
    width: '100%', padding: 11, border: '1.5px solid #e4e9dd', borderRadius: 10,
    fontSize: 14.5, outline: 'none', boxSizing: 'border-box', background: '#fff',
  }
  const etiquette: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }
  const section: React.CSSProperties = {
    background: '#fff', borderRadius: 18, boxShadow: '0 4px 14px rgba(46,52,43,0.06)',
    padding: 28, marginBottom: 24,
  }
  const titreSection: React.CSSProperties = { fontSize: 17, fontWeight: 800, marginBottom: 18 }
  const caseACocher = (actif: boolean): React.CSSProperties => ({
    padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer',
    border: actif ? '2px solid #5f7052' : '1.5px solid #e4e9dd',
    background: actif ? '#eef2e7' : '#fff', color: actif ? '#5f7052' : '#2e342b',
  })

  if (chargement) {
    return (
      <main style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', background: '#f7f5f0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7268', fontWeight: 600 }}>{t('dash_loading')}</p>
      </main>
    )
  }

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

      <form onSubmit={sauvegarder} style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
        <h1 className="cs-fade" style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, letterSpacing: -0.8 }}>{t('profile_title')}</h1>
        <p className="cs-fade cs-d1" style={{ color: '#6b7268', marginTop: 6, marginBottom: 32 }}>{t('profile_sub')}</p>

        {/* ===== Persoonlijke gegevens ===== */}
        <div className="cs-card" style={section}>
          <h2 style={titreSection}>👤 {t('pers_title')}</h2>
          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={etiquette}>{t('field_firstname')}</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={champ} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={etiquette}>{t('field_lastname')}</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} required style={champ} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={etiquette}>{t('field_birth')}</label>
              <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} style={champ} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={etiquette}>{t('field_city')}</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Amsterdam" style={champ} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={etiquette}>{t('field_years')}</label>
              <input type="number" min="0" max="60" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} placeholder="8" style={champ} />
            </div>
          </div>
        </div>

        {/* ===== Postes / parties ===== */}
        <div className="cs-card" style={section}>
          <h2 style={titreSection}>🔪 {t('functions_label')}</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {POSTES.map((p) => (
              <button key={p} type="button" onClick={() => basculer(functions, p, setFunctions)} style={caseACocher(functions.includes(p))}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* ===== Spécialités ===== */}
        <div className="cs-card" style={section}>
          <h2 style={titreSection}>⭐ {t('spec_label')}</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {CUISINES.map((c) => (
              <button key={c} type="button" onClick={() => basculer(specialties, c, setSpecialties)} style={caseACocher(specialties.includes(c))}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* ===== Certifications & tarif ===== */}
        <div className="cs-card" style={section}>
          <h2 style={titreSection}>✓ {t('certs_label')}</h2>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 18 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14.5, fontWeight: 600 }}>
              <input type="checkbox" checked={haccpCertified} onChange={(e) => setHaccpCertified(e.target.checked)} style={{ width: 18, height: 18 }} />
              {t('haccp_label')}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14.5, fontWeight: 600 }}>
              <input type="checkbox" checked={svhCertified} onChange={(e) => setSvhCertified(e.target.checked)} style={{ width: 18, height: 18 }} />
              {t('svh_label')}
            </label>
            {svhCertified && (
              <input value={svhLevel} onChange={(e) => setSvhLevel(e.target.value)} placeholder={t('svh_level_label')} style={{ ...champ, width: 160 }} />
            )}
          </div>
          <label style={etiquette}>{t('rates_label')}</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input type="number" min="10" step="0.5" value={hourlyRateMin} onChange={(e) => setHourlyRateMin(e.target.value)} placeholder={t('min')} style={{ ...champ, width: 110 }} />
            <span style={{ color: '#6b7268' }}>–</span>
            <input type="number" min="10" step="0.5" value={hourlyRateMax} onChange={(e) => setHourlyRateMax(e.target.value)} placeholder={t('max')} style={{ ...champ, width: 110 }} />
            <span style={{ color: '#6b7268', fontSize: 14 }}>€/u</span>
          </div>
        </div>

        {/* ===== Description ===== */}
        <div className="cs-card" style={section}>
          <h2 style={titreSection}>💬 {t('desc_label')}</h2>
          <textarea
            value={description} onChange={(e) => setDescription(e.target.value)}
            rows={4} placeholder="Vertel kort wie je bent, je stijl, je passie..."
            style={{ ...champ, resize: 'vertical' }}
          />
        </div>

        {/* ===== Werkervaring ===== */}
        <div className="cs-card" style={section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ ...titreSection, marginBottom: 0 }}>📋 {t('work_title')}</h2>
            <button
              type="button"
              onClick={() => setExps([...exps, { function: '', companyName: '', location: '', fromDate: '', toDate: '', isCurrent: false, description: '' }])}
              className="cs-btn"
              style={{ background: '#e4e9dd', color: '#5f7052', border: 'none', borderRadius: 999, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              {t('work_add')}
            </button>
          </div>
          {exps.length === 0 && <p style={{ color: '#9aa39b', fontSize: 14 }}>{t('work_empty')}</p>}
          <div style={{ display: 'grid', gap: 18 }}>
            {exps.map((w, i) => (
              <div key={i} style={{ border: '1.5px solid #e4e9dd', borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={etiquette}>{t('work_function')}</label>
                    <input value={w.function} onChange={(e) => majExp(i, 'function', e.target.value)} required placeholder="Bijv. Garde-manger" style={champ} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={etiquette}>{t('work_company')}</label>
                    <input value={w.companyName} onChange={(e) => majExp(i, 'companyName', e.target.value)} placeholder="Restaurant ..." style={champ} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={etiquette}>{t('work_location')}</label>
                    <input value={w.location} onChange={(e) => majExp(i, 'location', e.target.value)} style={champ} />
                  </div>
                  <div>
                    <label style={etiquette}>{t('work_from')}</label>
                    <input type="month" value={w.fromDate} onChange={(e) => majExp(i, 'fromDate', e.target.value)} required style={champ} />
                  </div>
                  {!w.isCurrent && (
                    <div>
                      <label style={etiquette}>{t('work_to')}</label>
                      <input type="month" value={w.toDate} onChange={(e) => majExp(i, 'toDate', e.target.value)} style={champ} />
                    </div>
                  )}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5, fontWeight: 600, marginTop: 22 }}>
                    <input type="checkbox" checked={w.isCurrent} onChange={(e) => majExp(i, 'isCurrent', e.target.checked)} style={{ width: 16, height: 16 }} />
                    {t('work_current')}
                  </label>
                </div>
                <label style={etiquette}>{t('work_desc')}</label>
                <textarea value={w.description} onChange={(e) => majExp(i, 'description', e.target.value)} rows={2} style={{ ...champ, resize: 'vertical' }} />
                <button
                  type="button"
                  onClick={() => setExps(exps.filter((_, j) => j !== i))}
                  style={{ marginTop: 10, background: 'none', border: 'none', color: '#b91c1c', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  ✕ {t('work_delete')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Sauvegarder ===== */}
        {sauvegarde === 'erreur' && (
          <p style={{ color: '#b91c1c', fontSize: 13.5, marginBottom: 14, background: '#fef2f2', padding: '10px 14px', borderRadius: 8 }}>
            {t('profile_fail')}
          </p>
        )}
        <button
          type="submit"
          disabled={sauvegarde === 'envoi'}
          className="cs-btn"
          style={{
            width: '100%', padding: 15,
            background: sauvegarde === 'ok' ? '#8a9a7b' : '#5f7052',
            color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15,
            cursor: sauvegarde === 'envoi' ? 'wait' : 'pointer',
          }}
        >
          {sauvegarde === 'envoi' ? t('form_loading') : sauvegarde === 'ok' ? t('profile_saved') : t('profile_save')}
        </button>
      </form>
    </main>
  )
}
