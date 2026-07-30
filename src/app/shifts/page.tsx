'use client'

import { useEffect, useState } from 'react'
import { useT, LangToggle, Key } from '@/lib/i18n'
import ShiftCard, { ShiftData } from '@/components/ShiftCard'
import AnimStyles from '@/components/AnimStyles'
import { IcoTile } from '@/components/Icons'

const FONT = '"Sora","Inter","Helvetica Neue",Arial,sans-serif'

type Filtre = 'alle' | 'open' | 'bevestigd' | 'afgerond' | 'geannuleerd'

// Groupe de statut d'une shift, pour les chips de filtre
function groupe(s: ShiftData): Exclude<Filtre, 'alle'> {
  if (s.status === 'CANCELLED') return 'geannuleerd'
  if (s.status === 'COMPLETED' || s.invoice?.status === 'PAID' || (s.eind && s.eind.confirmedAt)) return 'afgerond'
  if (s.status === 'OPEN') return 'open'
  return 'bevestigd'
}

export default function ShiftsPage() {
  const { t } = useT()
  const [shifts, setShifts] = useState<ShiftData[]>([])
  const [chargement, setChargement] = useState(true)
  const [role, setRole] = useState('')
  const [titre, setTitre] = useState<Key | null>(null)
  const [filtre, setFiltre] = useState<Filtre>('alle')

  useEffect(() => {
    async function charger() {
      const s = await fetch('/api/auth/session').then((r) => r.json())
      if (!s?.user) {
        window.location.href = '/login'
        return
      }
      setRole(s.user.role)
      // Filtres dédiés : ?vue=avenir|candidatures|acceptees (chef) ou ?passe=1 (shifts passés)
      const params = new URLSearchParams(window.location.search)
      const qs = params.toString()
      const estKokIci = s.user.role === 'KOK'
      if (params.get('passe') === '1') setTitre('list_past')
      else if (params.get('vue') === 'avenir') setTitre('list_kok_upcoming')
      else if (params.get('vue') === 'candidatures') setTitre(estKokIci ? 'stat_kok_apps' : 'stat_hor_2')
      else if (params.get('vue') === 'acceptees') setTitre(estKokIci ? 'stat_kok_accepted' : 'stat_hor_3')
      else setTitre(estKokIci ? 'shifts_title' : 'shifts_my')
      try {
        const res = await fetch(`/api/shifts${qs ? `?${qs}` : ''}`)
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

  // Chips de filtre par statut : pas sur la vue "shifts disponibles" (tout est OPEN)
  const voirFiltres = titre !== null && titre !== 'shifts_title'
  const filtres: { f: Filtre; cle: Key }[] = [
    { f: 'alle', cle: 'filt_alle' },
    { f: 'open', cle: 'filt_open' },
    { f: 'bevestigd', cle: 'filt_bevestigd' },
    { f: 'afgerond', cle: 'filt_afgerond' },
    { f: 'geannuleerd', cle: 'filt_geannuleerd' },
  ]
  const compte = (f: Filtre) => (f === 'alle' ? shifts.length : shifts.filter((s) => groupe(s) === f).length)
  const visibles = filtre === 'alle' ? shifts : shifts.filter((s) => groupe(s) === filtre)

  return (
    <main style={{ fontFamily: FONT, background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', minHeight: '100vh' }}>
      <AnimStyles />
      <nav className="cs-nav" style={{
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e8ebe0',
        padding: '13px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <a href="/dashboard" style={{ fontWeight: 800, fontSize: 20, color: 'hsl(var(--foreground))', textDecoration: 'none', letterSpacing: -0.5 }}>
          Chef<span style={{ color: '#5f7052' }}>Shift</span>
        </a>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <LangToggle />
          <a href="/dashboard" className="cs-nav-link" style={{ color: '#5f7052', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            {t('back_dashboard')}
          </a>
        </div>
      </nav>

      <div className="cs-wrap" style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <div className="cs-fade" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, letterSpacing: -1.2 }}>
              {titre ? t(titre) : ' '}
            </h1>
            <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: 6, fontSize: 15 }}>
              {titre === 'shifts_title' && estKok ? t('shifts_sub') : ''}
            </p>
          </div>
          {role === 'HORECA' && (
            <a href="/shifts/new" className="cs-btn" style={{
              background: 'linear-gradient(135deg,#647a55,#46553c)', color: '#fff', padding: '12px 24px', borderRadius: 999,
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
              boxShadow: '0 10px 22px -8px rgba(70,85,60,.5)',
            }}>
              + {t('shifts_new')}
            </a>
          )}
        </div>

        {/* ===== Filtres par statut ===== */}
        {!chargement && voirFiltres && shifts.length > 0 && (
          <div className="cs-fade" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
            {filtres.map(({ f, cle }) => {
              const actif = filtre === f
              return (
                <button
                  key={f}
                  onClick={() => setFiltre(f)}
                  className="cs-btn"
                  style={{
                    border: actif ? 'none' : '1.5px solid #dfe4d4',
                    background: actif ? '#4c5e42' : 'hsl(var(--card))',
                    color: actif ? '#fff' : '#4c5e42',
                    borderRadius: 999, padding: '8px 16px',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT,
                  }}
                >
                  {t(cle)}
                  <span style={{
                    marginLeft: 7, fontSize: 11.5, fontWeight: 800,
                    background: actif ? 'rgba(255,255,255,0.25)' : '#eef2e6',
                    color: actif ? '#fff' : '#4c5e42',
                    padding: '2px 8px', borderRadius: 999,
                  }}>
                    {compte(f)}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {chargement ? (
          <p style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 600, textAlign: 'center', padding: 40 }}>{t('dash_loading')}</p>
        ) : visibles.length === 0 ? (
          <div className="cs-card" style={{ background: 'hsl(var(--card))', borderRadius: 20, border: '1px solid #eceee3', boxShadow: '0 3px 12px rgba(46,52,43,0.05)', padding: 52, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <IcoTile n="inbox" s={22} taille={56} />
            </div>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>{t('empty_shifts')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {visibles.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                showApply={estKok && titre === 'shifts_title'}
                detailHref={`/shifts/${shift.id}`}
                perspectief={estKok ? 'kok' : 'horeca'}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
