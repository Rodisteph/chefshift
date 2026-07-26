'use client'

import { useEffect, useState } from 'react'
import { useT, LangToggle, afficherPoste, afficherSpecialite } from '@/lib/i18n'
import AnimStyles from '@/components/AnimStyles'

type Kandidaat = {
  id: string
  message?: string | null
  proposedRate?: number | null
  status: string
  kok: {
    id: string
    name?: string | null
    email: string
    kokProfile?: {
      firstName: string
      lastName: string
      dateOfBirth?: string | null
      yearsExperience?: number | null
      averageScore: number
      reviewCount: number
      functions: string[]
      specialties: string[]
      description?: string | null
      city?: string | null
      haccpCertified: boolean
      svhCertified: boolean
      svhLevel?: string | null
      hourlyRateMin?: number | null
      hourlyRateMax?: number | null
      workExperience: {
        id: string
        function: string
        companyName?: string | null
        location?: string | null
        fromDate: string
        toDate?: string | null
        isCurrent: boolean
        description?: string | null
      }[]
    } | null
  }
}

type ShiftDetail = {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  hourlyRate: number
  locationCity?: string | null
  status: string
  chosenKokId?: string | null
  applications: Kandidaat[]
}

function calculerAge(dateNaissance: string): number {
  const n = new Date(dateNaissance)
  const maintenant = new Date()
  let age = maintenant.getFullYear() - n.getFullYear()
  const m = maintenant.getMonth() - n.getMonth()
  if (m < 0 || (m === 0 && maintenant.getDate() < n.getDate())) age--
  return age
}

export default function ShiftDetailPage({ params }: { params: { id: string } }) {
  const { t, lang } = useT()
  const [shift, setShift] = useState<ShiftDetail | null>(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [choixEnCours, setChoixEnCours] = useState('')
  const locale = lang === 'en' ? 'en-GB' : 'nl-NL'

  async function charger() {
    const s = await fetch('/api/auth/session').then((r) => r.json())
    if (!s?.user) {
      window.location.href = '/login'
      return
    }
    const res = await fetch(`/api/shifts/${params.id}`)
    if (res.ok) {
      const data = await res.json()
      setShift(data.shift)
    } else {
      setErreur('notfound')
    }
    setChargement(false)
  }

  useEffect(() => {
    charger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  async function choisir(kokId: string) {
    setChoixEnCours(kokId)
    try {
      const res = await fetch(`/api/shifts/${params.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kokId }),
      })
      if (res.ok) {
        await charger()
      }
    } catch {}
    setChoixEnCours('')
  }

  const carte: React.CSSProperties = {
    background: '#fff', borderRadius: 18, boxShadow: '0 4px 14px rgba(46,52,43,0.06)', padding: 26,
  }
  const badgeSauge: React.CSSProperties = {
    background: '#e4e9dd', color: '#5f7052', fontSize: 12.5, fontWeight: 700,
    padding: '5px 12px', borderRadius: 999,
  }
  const badgePoste: React.CSSProperties = {
    background: '#2e342b', color: '#e4e9dd', fontSize: 12.5, fontWeight: 700,
    padding: '5px 12px', borderRadius: 999,
  }
  const titreSection: React.CSSProperties = {
    fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5,
    color: '#5f7052', marginBottom: 8, marginTop: 18,
  }

  if (chargement) {
    return (
      <main style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', background: '#f7f5f0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7268', fontWeight: 600 }}>{t('dash_loading')}</p>
      </main>
    )
  }

  if (erreur || !shift) {
    return (
      <main style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', background: '#f7f5f0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🍳</div>
          <p style={{ color: '#6b7268', fontWeight: 600 }}>Shift niet gevonden</p>
          <a href="/shifts" style={{ color: '#5f7052', fontWeight: 700 }}>{t('back_shifts')}</a>
        </div>
      </main>
    )
  }

  const dateStr = new Date(shift.date).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
  const start = new Date(shift.startTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  const end = new Date(shift.endTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  const confirme = shift.status === 'CONFIRMED'

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
          <a href="/shifts" className="cs-nav-link" style={{ color: '#5f7052', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            {t('back_shifts')}
          </a>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        {/* ===== Résumé du shift ===== */}
        <div className="cs-fade" style={{ ...carte, marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 800, letterSpacing: -0.6 }}>{shift.title}</h1>
                {confirme && (
                  <span style={{ background: '#eef2e7', color: '#5f7052', fontSize: 12, fontWeight: 800, padding: '5px 12px', borderRadius: 999 }}>
                    ✓ {t('shift_confirmed')}
                  </span>
                )}
              </div>
              <p style={{ color: '#6b7268', marginTop: 8 }}>
                📅 {dateStr} &nbsp;·&nbsp; 🕐 {start} – {end}
                {shift.locationCity && <>&nbsp;·&nbsp; 📍 {shift.locationCity}</>}
              </p>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#5f7052' }}>
              €{shift.hourlyRate}<span style={{ fontSize: 15, fontWeight: 600, color: '#6b7268' }}>/u</span>
            </div>
          </div>
        </div>

        {/* ===== Candidats ===== */}
        <h2 className="cs-fade cs-d1" style={{ fontSize: 22, fontWeight: 800, marginBottom: 18 }}>
          {t('applicants')} ({shift.applications.length})
        </h2>

        {shift.applications.length === 0 ? (
          <div className="cs-card" style={{ ...carte, textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{ color: '#6b7268', fontWeight: 600 }}>{t('no_applicants')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            {shift.applications.map((k) => {
              const p = k.kok.kokProfile
              const nom = p ? `${p.firstName} ${p.lastName}`.trim() : k.kok.name || k.kok.email
              const estChoisi = shift.chosenKokId === k.kok.id
              const age = p?.dateOfBirth ? calculerAge(p.dateOfBirth) : null
              return (
                <div key={k.id} className="cs-card" style={{
                  ...carte,
                  border: estChoisi ? '2px solid #5f7052' : '2px solid transparent',
                }}>
                  {/* ===== En-tête candidat ===== */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 800 }}>{nom}</h3>
                      <p style={{ fontSize: 14, color: '#6b7268', marginTop: 4 }}>
                        {age && <>🎂 {age} {t('years_old')} &nbsp;·&nbsp; </>}
                        {p?.city && <>📍 {p.city} &nbsp;·&nbsp; </>}
                        {p?.yearsExperience != null && <>💪 {p.yearsExperience} {t('experience_years')}</>}
                      </p>
                      {/* Note */}
                      <p style={{ fontSize: 15, marginTop: 6 }}>
                        {p && p.reviewCount > 0 ? (
                          <span style={{ color: '#d97706', fontWeight: 700 }}>
                            {'★'.repeat(Math.round(p.averageScore))}{'☆'.repeat(5 - Math.round(p.averageScore))}
                            <span style={{ color: '#2e342b', marginLeft: 8 }}>{p.averageScore.toFixed(1)}</span>
                            <span style={{ color: '#6b7268', fontWeight: 400, marginLeft: 6 }}>({p.reviewCount} {t('reviews')})</span>
                          </span>
                        ) : (
                          <span style={{ color: '#9aa39b', fontSize: 13.5 }}>{t('no_reviews')}</span>
                        )}
                      </p>
                      {/* Certifications */}
                      {(p?.haccpCertified || p?.svhCertified) && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                          {p.haccpCertified && <span style={{ ...badgeSauge, background: '#dcfce7', color: '#15803d' }}>✓ HACCP</span>}
                          {p.svhCertified && <span style={{ ...badgeSauge, background: '#dcfce7', color: '#15803d' }}>✓ SVH{p.svhLevel ? ` ${p.svhLevel}` : ''}</span>}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {k.proposedRate ? (
                        <p style={{ fontSize: 14, color: '#6b7268', marginBottom: 4 }}>
                          {t('proposed_rate')}
                        </p>
                      ) : null}
                      {k.proposedRate && (
                        <p style={{ fontSize: 22, fontWeight: 800, color: '#5f7052', marginBottom: 8 }}>€{k.proposedRate}/u</p>
                      )}
                      {estChoisi ? (
                        <span style={{ background: '#5f7052', color: '#fff', padding: '11px 24px', borderRadius: 999, fontWeight: 700, fontSize: 14 }}>
                          {t('chosen')}
                        </span>
                      ) : (
                        !confirme && (
                          <button
                            onClick={() => choisir(k.kok.id)}
                            disabled={choixEnCours !== ''}
                            className="cs-btn"
                            style={{
                              background: '#5f7052', color: '#fff', border: 'none', borderRadius: 999,
                              padding: '11px 24px', fontWeight: 700, fontSize: 14,
                              cursor: choixEnCours ? 'wait' : 'pointer',
                              opacity: choixEnCours ? 0.7 : 1,
                            }}
                          >
                            {choixEnCours === k.kok.id ? t('form_loading') : t('choose')}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* ===== Postes / parties ===== */}
                  {p && p.functions.length > 0 && (
                    <div>
                      <h4 style={titreSection}>🔪 {t('functions_title')}</h4>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {p.functions.map((f) => (
                          <span key={f} style={badgePoste}>{afficherPoste(f, lang)}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ===== Spécialités ===== */}
                  {p && p.specialties.length > 0 && (
                    <div>
                      <h4 style={titreSection}>⭐ {t('specialties_title')}</h4>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {p.specialties.map((s) => (
                          <span key={s} style={badgeSauge}>{afficherSpecialite(s, lang)}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ===== Tarif souhaité ===== */}
                  {p && (p.hourlyRateMin || p.hourlyRateMax) && (
                    <p style={{ fontSize: 13.5, color: '#6b7268', marginTop: 14 }}>
                      💶 {t('rate_range')} : €{p.hourlyRateMin || '?'} – €{p.hourlyRateMax || '?'}/u
                    </p>
                  )}

                  {/* ===== Message du candidat ===== */}
                  {k.message && (
                    <p style={{ background: '#f7f5f0', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#2e342b', fontStyle: 'italic', marginTop: 14 }}>
                      “{k.message}”
                    </p>
                  )}

                  {/* ===== Description ===== */}
                  {p?.description && (
                    <p style={{ fontSize: 14.5, color: '#6b7268', marginTop: 14 }}>{p.description}</p>
                  )}

                  {/* ===== Historique ===== */}
                  {p && p.workExperience.length > 0 && (
                    <div>
                      <h4 style={titreSection}>📋 {t('work_history')}</h4>
                      <div style={{ display: 'grid', gap: 10 }}>
                        {p.workExperience.map((w) => (
                          <div key={w.id} style={{ borderLeft: '3px solid #e4e9dd', paddingLeft: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 14 }}>
                              <span>
                                <strong>{afficherPoste(w.function, lang)}</strong>
                                {w.companyName && <span style={{ color: '#6b7268' }}> · {w.companyName}</span>}
                                {w.location && <span style={{ color: '#9aa39b' }}> · {w.location}</span>}
                              </span>
                              <span style={{ color: '#9aa39b', fontSize: 13 }}>
                                {new Date(w.fromDate).getFullYear()} – {w.isCurrent ? t('current') : w.toDate ? new Date(w.toDate).getFullYear() : ''}
                              </span>
                            </div>
                            {w.description && (
                              <p style={{ fontSize: 13, color: '#6b7268', marginTop: 4 }}>{w.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
