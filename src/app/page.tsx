'use client'

import { useEffect, useState } from 'react'
import { useT, LangToggle } from '@/lib/i18n'
import AnimStyles from '@/components/AnimStyles'
import { Ico, IcoTile, IcoStar } from '@/components/Icons'

const FONT = '"Sora","Inter","Helvetica Neue",Arial,sans-serif'
const CONTACT_EMAIL = 'info@chefshift.nl'

// Photo du hero générée pour ChefShift (hébergée en ligne)
const HERO_URL = 'https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2F27b665a925688f5be2e3e4a8cb9c3d9a2e7e646e33aa32d129d44e5cdd26d54e?filename=hero-chefshift.jpg&sig=1974T8mF3RlDIwOmP3yXKXTFq5DvJ5-l2Pt9nFGwyDQ=&t=o'
// Visuel côté restaurants (salle élégante au crépuscule)
const VIS_RESTO = 'https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2F2f6ed5f2ed74d6208166b3aa37b3bd9985cb96e3da6419b597eb7cc1dd41c5f0?filename=visuel-restaurant.jpg&sig=eI33ikgivlnhi9vtuxsig4JwEivZADZ9Bc3_453kRpI=&t=o'

// Données structurées schema.org : l'organisation et le site (rendu côté serveur, visible pour Google)
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.chefshift.nl/#org',
      name: 'ChefShift',
      url: 'https://www.chefshift.nl',
      logo: 'https://www.chefshift.nl/icon.svg',
      description: 'Platform voor zzp-koks en horeca in Nederland.',
      email: CONTACT_EMAIL,
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.chefshift.nl/#site',
      name: 'ChefShift',
      url: 'https://www.chefshift.nl',
      inLanguage: 'nl',
      publisher: { '@id': 'https://www.chefshift.nl/#org' },
    },
  ],
}

// Décor du hero : halos lumineux animés sur dégradé olive (aucune image externe)
function Halos() {
  return (
    <>
      <span className="cs-halo cs-halo1" aria-hidden="true" />
      <span className="cs-halo cs-halo2" aria-hidden="true" />
      <span className="cs-halo cs-halo3" aria-hidden="true" />
    </>
  )
}

// Photo de fond : la version en ligne (HERO_URL) est affichée en priorité ;
// si elle ne charge pas, on essaie une éventuelle image locale public/hero.jpg ;
// sinon seul le décor CSS reste, rien ne casse.
function PhotoFond({ alt = '' }: { alt?: string }) {
  const [src, setSrc] = useState(HERO_URL)
  if (!src) return null
  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      onError={() => setSrc(src === HERO_URL ? '/hero.jpg' : '')}
      className="cs-heroimg"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
    />
  )
}

export default function HomePage() {
  const { t } = useT()
  const [user, setUser] = useState<any>(null)
  const [charge, setCharge] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((s) => setUser(s?.user || null))
      .catch(() => {})
      .finally(() => setCharge(true))
  }, [])

  const btnPrimaire: React.CSSProperties = {
    background: 'linear-gradient(135deg,#647a55,#46553c)', color: '#fff',
    padding: '15px 32px', borderRadius: 999, fontWeight: 700, fontSize: 15,
    textDecoration: 'none', boxShadow: '0 10px 24px -8px rgba(70,85,60,.55)',
  }

  // Destination du bouton "Plaats een shift" : connecté → création directe,
  // sinon → connexion (le compte existe déjà dans ce cas le plus souvent)
  const shiftCtaHref = charge && user ? '/shifts/new' : '/login'

  // Témoignages (restaurant, hôtel, chef) affichés dans la section "Wat gebruikers zeggen"
  const temoignages = [
    { q: t('testi1_q'), a: t('testi1_a'), r: t('testi1_r'), score: 5 },
    { q: t('testi2_q'), a: t('testi2_a'), r: t('testi2_r'), score: 5 },
    { q: t('testi3_q'), a: t('testi3_a'), r: t('testi3_r'), score: 4 },
  ]

  return (
    <main style={{ fontFamily: FONT, background: '#f6f7f2', color: '#23281f', minHeight: '100vh' }}>
      <AnimStyles />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      {/* ===== Navigation flottante ===== */}
      <nav className="cs-nav" style={{
        position: 'fixed', top: 18, left: '50%', transform: 'translateX(-50%)',
        width: 'min(1160px, calc(100% - 32px))', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '13px 26px', borderRadius: 999,
        background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.28)',
        boxShadow: '0 8px 30px rgba(20,26,17,.18)',
      }}>
        <a href="/" style={{ fontWeight: 800, fontSize: 20, color: '#fff', textDecoration: 'none', letterSpacing: -0.5 }}>
          Chef<span style={{ color: '#cfdcba' }}>Shift</span>
        </a>
        <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
          <LangToggle clair />
          {charge && user ? (
            <>
              <span className="cs-hide-mob" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13.5, fontWeight: 600 }}>
                {user.email}
              </span>
              <a href="/dashboard" className="cs-btn" style={{ ...btnPrimaire, padding: '10px 22px', fontSize: 14 }}>
                {t('nav_dashboard')} <Ico n="arrow" s={15} />
              </a>
            </>
          ) : (
            <>
              <a href={`mailto:${CONTACT_EMAIL}`} className="cs-nav-link cs-hide-mob" style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                {t('contact')}
              </a>
              <a href="/login" className="cs-nav-link" style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                {t('nav_login')}
              </a>
              <a href="/register" className="cs-btn" style={{ ...btnPrimaire, padding: '10px 22px', fontSize: 14 }}>
                {t('nav_register')}
              </a>
            </>
          )}
        </div>
      </nav>

      {/* ===== Hero : photo pro + décor CSS ===== */}
      <header style={{
        position: 'relative', height: '100vh', minHeight: 640, display: 'flex', alignItems: 'flex-end', overflow: 'hidden',
        background: 'linear-gradient(160deg, #1c2317 0%, #2b3522 48%, #46553c 100%)',
      }}>
        <PhotoFond alt="ZZP-kok aan het werk in een professionele horecakeuken" />
        <Halos />
        {/* Voile de lisibilité : garantit le contraste du texte blanc, avec ou sans photo */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(24,30,21,0.80) 0%, rgba(24,30,21,0.28) 48%, rgba(24,30,21,0.42) 100%)' }} />
        <div className="cs-hero-pad" style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 24px 92px', color: '#fff' }}>
          <span className="cs-fade" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)', padding: '8px 18px', borderRadius: 999,
            fontSize: 12.5, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 22,
          }}>
            <Ico n="chef" s={14} /> {t('hero_badge')}
          </span>
          <h1 className="cs-fade cs-d1" style={{ fontSize: 'clamp(44px, 7vw, 86px)', fontWeight: 800, lineHeight: 1.01, letterSpacing: -2, maxWidth: '13ch', marginBottom: 22 }}>
            {t('hero_title_a')} <span style={{ color: '#cfdcba' }}>{t('hero_title_b')}</span>
          </h1>
          <p className="cs-fade cs-d2" style={{ fontSize: 17.5, maxWidth: '46ch', opacity: 0.92, marginBottom: 34, lineHeight: 1.65 }}>{t('hero_sub')}</p>
          <div className="cs-fade cs-d3" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {charge && user ? (
              <a href="/dashboard" className="cs-btn" style={btnPrimaire}>
                {t('nav_dashboard')} <Ico n="arrow" s={16} />
              </a>
            ) : (
              <>
                <a href="/register" className="cs-btn" style={btnPrimaire}>
                  {t('hero_cta1')} <Ico n="arrow" s={16} />
                </a>
                <a href="/login" className="cs-btn" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff', border: '1px solid rgba(255,255,255,0.42)', backdropFilter: 'blur(6px)', padding: '15px 32px', borderRadius: 999, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
                  {t('hero_cta2')}
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ===== Étapes ===== */}
      <section className="cs-sec" style={{ padding: '96px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 58px' }}>
          <span style={{ color: '#5f7052', fontWeight: 800, fontSize: 12.5, letterSpacing: 2.5, textTransform: 'uppercase' }}>{t('steps_over')}</span>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 800, letterSpacing: -1.4, margin: '12px 0 14px' }}>{t('steps_title')}</h2>
          <p style={{ color: '#6b7268', fontSize: 16.5, lineHeight: 1.6 }}>{t('steps_sub')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {[
            { n: '1', t: t('step1_t'), d: t('step1_d') },
            { n: '2', t: t('step2_t'), d: t('step2_d') },
            { n: '3', t: t('step3_t'), d: t('step3_d') },
          ].map((e) => (
            <div key={e.n} className="cs-card" style={{ background: '#fff', borderRadius: 20, border: '1px solid #eceee3', padding: '36px 28px', boxShadow: '0 3px 12px rgba(46,52,43,0.05)' }}>
              <div className="cs-tile" style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#647a55,#46553c)', color: '#fff', fontWeight: 800, fontSize: 19, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 8px 18px -6px rgba(70,85,60,.5)' }}>{e.n}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 9, letterSpacing: -0.3 }}>{e.t}</h3>
              <p style={{ color: '#6b7268', fontSize: 14.5, lineHeight: 1.6 }}>{e.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Avantages ===== */}
      <section className="cs-sec2" style={{ padding: '0 24px 96px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 58px' }}>
          <span style={{ color: '#5f7052', fontWeight: 800, fontSize: 12.5, letterSpacing: 2.5, textTransform: 'uppercase' }}>{t('why_over')}</span>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 800, letterSpacing: -1.4, margin: '12px 0 14px' }}>{t('why_title')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 26 }}>
          {[
            { icon: 'bolt', t: t('feat1_t'), d: t('feat1_d') },
            { icon: 'shield', t: t('feat2_t'), d: t('feat2_d') },
            { icon: 'card', t: t('feat3_t'), d: t('feat3_d') },
          ].map((c) => (
            <div key={c.t} className="cs-card" style={{ background: '#fff', borderRadius: 20, border: '1px solid #eceee3', boxShadow: '0 3px 12px rgba(46,52,43,0.05)', padding: '32px 28px' }}>
              <div style={{ marginBottom: 18 }}><IcoTile n={c.icon} s={21} /></div>
              <h3 style={{ fontSize: 18.5, fontWeight: 800, marginBottom: 9, letterSpacing: -0.3 }}>{c.t}</h3>
              <p style={{ color: '#6b7268', fontSize: 14.5, lineHeight: 1.6 }}>{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Voor horeca : photo + arguments restaurants ===== */}
      <section className="cs-sec2" style={{ padding: '0 24px 96px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="cs-card" style={{
          background: '#fff', borderRadius: 24, border: '1px solid #eceee3',
          boxShadow: '0 3px 12px rgba(46,52,43,0.05)', overflow: 'hidden',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        }}>
          <img
            src={VIS_RESTO}
            alt="Restaurantzaal 's avonds, klaar voor de dinerservice"
            loading="lazy"
            style={{ width: '100%', height: '100%', minHeight: 320, objectFit: 'cover', display: 'block' }}
          />
          <div style={{ padding: '46px 42px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ color: '#5f7052', fontWeight: 800, fontSize: 12.5, letterSpacing: 2.5, textTransform: 'uppercase' }}>{t('hor_over')}</span>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800, letterSpacing: -1.1, margin: '12px 0 12px' }}>{t('hor_title')}</h2>
            <p style={{ color: '#6b7268', fontSize: 15.5, lineHeight: 1.65, marginBottom: 24 }}>{t('hor_sub')}</p>
            <div style={{ display: 'grid', gap: 13, marginBottom: 30 }}>
              {[t('hor_p1'), t('hor_p2'), t('hor_p3')].map((p) => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 14.5, fontWeight: 600, color: '#3c4436' }}>
                  <span style={{ width: 27, height: 27, borderRadius: 9, background: '#eef2e6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Ico n="check" s={14} c="#4c5e42" />
                  </span>
                  {p}
                </div>
              ))}
            </div>
            <div>
              <a href={shiftCtaHref} className="cs-btn" style={btnPrimaire}>
                {t('hor_cta')} <Ico n="arrow" s={15} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Wat gebruikers zeggen (témoignages) ===== */}
      <section className="cs-sec2" style={{ padding: '0 24px 96px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 58px' }}>
          <span style={{ color: '#5f7052', fontWeight: 800, fontSize: 12.5, letterSpacing: 2.5, textTransform: 'uppercase' }}>{t('rev_over')}</span>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 800, letterSpacing: -1.4, margin: '12px 0 14px' }}>{t('rev_title')}</h2>
          <p style={{ color: '#6b7268', fontSize: 16.5, lineHeight: 1.6 }}>{t('rev_sub')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 26 }}>
          {temoignages.map((a) => (
            <div key={a.a} className="cs-card" style={{ background: '#fff', borderRadius: 20, border: '1px solid #eceee3', boxShadow: '0 3px 12px rgba(46,52,43,0.05)', padding: '30px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span style={{ display: 'inline-flex', gap: 2 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <IcoStar key={i} s={15} plein={i <= a.score} />
                ))}
              </span>
              <p style={{ color: '#3c4436', fontSize: 15, lineHeight: 1.65, margin: 0, flex: 1 }}>
                &ldquo;{a.q}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg, #eef2e6, #dfe7d1)',
                  color: '#4c5e42', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 15,
                }}>
                  {a.a.charAt(0).toUpperCase()}
                </span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: -0.2 }}>{a.a}</div>
                  <div style={{ color: '#9aa39b', fontSize: 12.5 }}>{a.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Bannière CTA ===== */}
      <section className="cs-sec2" style={{ padding: '0 24px 96px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="cs-card" style={{
          position: 'relative', borderRadius: 28, overflow: 'hidden', padding: '84px 40px', textAlign: 'center', color: '#fff',
          border: '1px solid #eceee3', background: 'linear-gradient(135deg, #242c1f 0%, #38452c 55%, #55684a 100%)',
        }}>
          <PhotoFond />
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(36,44,31,0.78), rgba(70,85,60,0.68))' }} />
          <Halos />
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0, opacity: 0.45,
            backgroundImage: 'radial-gradient(rgba(207,220,186,0.14) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: -1.2, marginBottom: 14 }}>{t('banner_title')}</h2>
            <p style={{ opacity: 0.9, marginBottom: 30, fontSize: 16.5 }}>{t('banner_sub')}</p>
            <a href={charge && user ? '/dashboard' : '/register'} className="cs-btn" style={{ background: '#fff', color: '#3f4d36', padding: '15px 34px', borderRadius: 999, fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>
              {charge && user ? t('nav_dashboard') : t('banner_cta')} <Ico n="arrow" s={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ===== Contact ===== */}
      <section className="cs-sec2" style={{ padding: '0 24px 96px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="cs-card" style={{ background: '#fff', borderRadius: 20, border: '1px solid #eceee3', boxShadow: '0 3px 12px rgba(46,52,43,0.05)', padding: '44px 32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><IcoTile n="msg" s={22} taille={56} /></div>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, letterSpacing: -0.8, marginBottom: 10 }}>{t('contact_title')}</h2>
          <p style={{ color: '#6b7268', fontSize: 15, marginBottom: 24 }}>{t('contact_sub')}</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="cs-btn" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg,#647a55,#46553c)', color: '#fff',
            padding: '14px 30px', borderRadius: 999, fontWeight: 700, fontSize: 15, textDecoration: 'none',
            boxShadow: '0 10px 22px -8px rgba(70,85,60,.5)',
          }}>
            {CONTACT_EMAIL}
          </a>
        </div>
      </section>

      {/* ===== Pied de page ===== */}
      <footer style={{ background: '#23281f', color: 'rgba(255,255,255,0.72)', padding: '64px 24px 30px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 22, marginBottom: 12, letterSpacing: -0.5 }}>Chef<span style={{ color: '#8a9a7b' }}>Shift</span></div>
          <p style={{ maxWidth: 360, marginBottom: 40, lineHeight: 1.6 }}>{t('footer_tag')}</p>
          {/* Maillage interne SEO : pages piliers + pages légales */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 24, fontSize: 13.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <span>{t('footer_rights')}</span>
            <span style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
              <a href="/kok-inhuren" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none', fontWeight: 600 }}>Kok inhuren</a>
              <a href="/zzp-kok-worden" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none', fontWeight: 600 }}>ZZP-kok worden</a>
              <a href="/over-ons" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none', fontWeight: 600 }}>{t('footer_over')}</a>
              <a href="/shifts" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none', fontWeight: 600 }}>Shifts</a>
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none', fontWeight: 600 }}>{t('contact')}</a>
              <a href="/voorwaarden" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none', fontWeight: 600 }}>{t('terms_of')}</a>
              <a href="/privacy" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none', fontWeight: 600 }}>{t('privacy_of')}</a>
            </span>
          </div>
        </div>
      </footer>
    </main>
  )
}
