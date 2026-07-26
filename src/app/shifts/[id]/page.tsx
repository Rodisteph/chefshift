'use client'

import { useEffect, useState } from 'react'
import { useT, LangToggle, afficherPoste, afficherSpecialite } from '@/lib/i18n'
import AnimStyles from '@/components/AnimStyles'
import { Ico, IcoStar, IcoTile } from '@/components/Icons'

const FONT = '"Sora","Inter","Helvetica Neue",Arial,sans-serif'

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
    background: '#fff', borderRadius: 20, border: '1px solid #eceee3',
    boxShadow: '0 3px 12px rgba(46,52,43,0.05)', padding: 26,
  }
  const badgeSauge: React.CSSProperties = {
    background: '#eef2e6', color: '#4c5e42', fontSize: 12.5, fontWeight: 700,
    padding: '5px 12px', borderRadius: 999,
  }
  const badgePoste: React.CSSProperties = {
    background: '#23281f', color: '#dfe7d1', fontSize: 12.5, fontWeight: 700,
    padding: '5px 12px', borderRadius: 999,
  }
  const titreSection: React.CSSProperties = {
    fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5,
    color: '#5f7052', marginBottom: 9, marginTop: 18,
    display: 'flex', alignItems: 'center', gap: 6,
  }
  const meta: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 13.5, color: '#6b7268', fontWeight: 500,
  }

  if (chargement) {
    return (
      <main style={{ fontFamily: FONT, background: '#f6f7f2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7268', fontWeight: 600 }}>{t('dash_loading')}</p>
      </main>
    )
  }

  if (erreur || !shift) {
    return (
      <main style={{ fontFamily: FONT, background: '#f6f7f2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <IcoTile n="inbox" s={22} taille={56} />
          </div>
          <p style={{ color: '#6b7268', fontWeight: 600, marginBottom: 10 }}>Shift niet gevonden</p>
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
    <main style={{ fontFamily: FONT, background: '#f6f7f2', color: '#23281f', minHeight: '100vh' }}>
      <AnimStyles />
      <nav style={{
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e8ebe0',
        padding: '13px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <a href="/dashboard" style={{ fontWeight: 800, fontSize: 20, color: '#23281f', textDecoration: 'none', letterSpacing: -0.5 }}>
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
                <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 800, letterSpacing: -1 }}>{shift.title}</h1>
                {confirme && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#eef2e6', color: '#4c5e42', fontSize: 11.5, fontWeight: 800, padding: '5px 12px', borderRadius: 999 }}>
                    <Ico n="check" s={13} /> {t('shift_confirmed')}
                  </span>
                )}
              </div>
              <p style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 9 }}>
                <span style={meta}><Ico n="cal" s={14} c="#8a9a7b" /> {dateStr}</span>
                <span style={meta}><Ico n="clock" s={14} c="#8a9a7b" /> {start} – {end}</span>
                {shift.locationCity && <span style={meta}><Ico n="pin" s={14} c="#8a9a7b" /> {shift.locationCity}</span>}
              </p>
            </div>
            <div style={{ background: '#f0f4ea', borderRadius: 14, padding: '12px 18px' }}>
              <span style={{ fontSize: 25, fontWeight: 800, color: '#4c5e42', letterSpacing: -0.5 }}>€{shift.hourlyRate}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#7d8877' }}>/u</span>
            </div>
          </div>
        </div>

        {/* ===== Candidats ===== */}
        <h2 className="cs-fade cs-d1" style={{ fontSize: 22, fontWeight: 800, marginBottom: 18, letterSpacing: -0.6 }}>
          {t('applicants')} ({shift.applications.length})
        </h2>

        {shift.applications.length === 0 ? (
          <div className="cs-card" style={{ ...carte, textAlign: 'center', padding: 52 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <IcoTile n="inbox" s={22} taille={56} />
            </div>
            <p style={{ color: '#6b7268', fontWeight: 600 }}>{t('no_applicants')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            {shift.applications.map((k) => {
              const p = k.kok.kokProfile
              const nom = p ? `${p.firstName} ${p.lastName}`.trim() : k.kok.name || k.kok.email
              const estChoisi = shift.chosenKokId === k.kok.id
              const age = p?.dateOfBirth ? calculerAge(p.dateOfBirth) : null
              const note = p ? Math.round(p.averageScore) : 0
              return (
                <div key={k.id} className="cs-card" style={{
                  ...carte,
                  border: estChoisi ? '2px solid #5f7052' : '1px solid #eceee3',
                }}>
                  {/* ===== En-tête candidat ===== */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4 }}>{nom}</h3>
                      <p style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 5 }}>
                        {age && <span style={meta}><Ico n="cake" s={14} c="#8a9a7b" /> {age} {t('years_old')}</span>}
                        {p?.city && <span style={meta}><Ico n="pin" s={14} c="#8a9a7b" /> {p.city}</span>}
                        {p?.yearsExperience != null && <span style={meta}><Ico n="brief" s={14} c="#8a9a7b" /> {p.yearsExperience} {t('experience_years')}</span>}
                      </p>
                      {/* Note */}
                      <p style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 8 }}>
                        {p && p.reviewCount > 0 ? (
                          <>
                            {[1, 2, 3, 4, 5].map((i) => (
                              <IcoStar key={i} s={15} plein={i <= note} />
                            ))}
                            <span style={{ color: '#23281f', fontWeight: 800, fontSize: 14.5, marginLeft: 8 }}>{p.averageScore.toFixed(1)}</span>
                            <span style={{ color: '#6b7268', fontWeight: 500, fontSize: 13, marginLeft: 5 }}>({p.reviewCount} {t('reviews')})</span>
                          </>
                        ) : (
                          <span style={{ color: '#9aa39b', fontSize: 13.5 }}>{t('no_reviews')}</span>
                        )}
                      </p>
                      {/* Certifications */}
                      {(p?.haccpCertified || p?.svhCertified) && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                          {p.haccpCertified && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#dcfce7', color: '#15803d', fontSize: 12.5, fontWeight: 700, padding: '5px 12px', borderRadius: 999 }}>
                              <Ico n="shield" s={13} /> HACCP
                            </span>
                          )}
                          {p.svhCertified && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#dcfce7', color: '#15803d', fontSize: 12.5, fontWeight: 700, padding: '5px 12px', borderRadius: 999 }}>
                              <Ico n="shield" s={13} /> SVH{p.svhLevel ? ` ${p.svhLevel}` : ''}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {k.proposedRate ? (
                        <p style={{ fontSize: 13, color: '#6b7268', marginBottom: 4, fontWeight: 500 }}>
                          {t('proposed_rate')}
                        </p>
                      ) : null}
                      {k.proposedRate && (
                        <p style={{ fontSize: 22, fontWeight: 800, color: '#4c5e42', marginBottom: 9, letterSpacing: -0.5 }}>€{k.proposedRate}/u</p>
                      )}
                      {estChoisi ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#647a55,#46553c)', color: '#fff', padding: '11px 24px', borderRadius: 999, fontWeight: 700, fontSize: 14 }}>
                          <Ico n="check" s={15} /> {t('chosen')}
                        </span>
                      ) : (
                        !confirme && (
                          <button
                            onClick={() => choisir(k.kok.id)}
                            disabled={choixEnCours !== ''}
                            className="cs-btn"
                            style={{
                              background: 'linear-gradient(135deg,#647a55,#46553c)', color: '#fff', border: 'none', borderRadius: 12,
                              padding: '11px 24px', fontWeight: 700, fontSize: 14, fontFamily: FONT,
                              cursor: choixEnCours ? 'wait' : 'pointer',
                              opacity: choixEnCours ? 0.7 : 1,
                              boxShadow: '0 10px 22px -8px rgba(70,85,60,.5)',
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
                      <h4 style={titreSection}><Ico n="utensils" s={13} /> {t('functions_title')}</h4>
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
                      <h4 style={titreSection}><Ico n="chef" s={13} /> {t('specialties_title')}</h4>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {p.specialties.map((s) => (
                          <span key={s} style={badgeSauge}>{afficherSpecialite(s, lang)}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ===== Tarif souhaité ===== */}
                  {p && (p.hourlyRateMin || p.hourlyRateMax) && (
                    <p style={{ ...meta, marginTop: 14 }}>
                      <Ico n="bank" s={14} c="#8a9a7b" /> {t('rate_range')} : €{p.hourlyRateMin || '?'} – €{p.hourlyRateMax || '?'}/u
                    </p>
                  )}

                  {/* ===== Message du candidat ===== */}
                  {k.message && (
                    <p style={{ background: '#f6f7f2', border: '1px solid #eceee3', borderRadius: 12, padding: '13px 17px', fontSize: 14, color: '#23281f', fontStyle: 'italic', marginTop: 14 }}>
                      “{k.message}”
                    </p>
                  )}

                  {/* ===== Description ===== */}
                  {p?.description && (
                    <p style={{ fontSize: 14.5, color: '#6b7268', marginTop: 14, lineHeight: 1.6 }}>{p.description}</p>
                  )}

                  {/* ===== Historique ===== */}
                  {p && p.workExperience.length > 0 && (
                    <div>
                      <h4 style={titreSection}><Ico n="brief" s={13} /> {t('work_history')}</h4>
                      <div style={{ display: 'grid', gap: 10 }}>
                        {p.workExperience.map((w) => (
                          <div key={w.id} style={{ borderLeft: '3px solid #dfe5d0', paddingLeft: 12 }}>
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
                              <p style={{ fontSize: 13, color: '#6b7268', marginTop: 4, lineHeight: 1.55 }}>{w.description}</p>
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
