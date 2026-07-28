'use client'

import { useEffect, useState } from 'react'
import { useT, LangToggle } from '@/lib/i18n'
import AnimStyles from '@/components/AnimStyles'
import { Ico, IcoTile, IcoStar } from '@/components/Icons'

const FONT = '"Sora","Inter","Helvetica Neue",Arial,sans-serif'
const CONTACT_EMAIL = 'info@chefshift.nl'

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

// Photo de fond optionnelle : déposer une image dans public/hero.jpg et elle s'affiche
// automatiquement (fondu doux par-dessus le dégradé). Si le fichier n'existe pas,
// l'image se retire d'elle-même et seul le décor CSS reste — rien ne casse.
function PhotoFond({ alt = '' }: { alt?: string }) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <img
      src="/hero.jpg"
      alt={alt}
      aria-hidden={alt ? undefined : true}
      onError={() => setOk(false)}
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

  return (
    <main style={{ fontFamily: FONT, background: '#f6f7f2', color: '#23281f', minHeight: '100vh' }}>
      <AnimStyles />

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

      {/* ===== Hero : décor CSS + photo locale optionnelle (public/hero.jpg) ===== */}
      <header style={{
        position: 'relative', height: '100vh', minHeight: 640, display: 'flex', alignItems: 'flex-end', overflow: 'hidden',
        background: 'linear-gradient(160deg, #1c2317 0%, #2b3522 48%, #46553c 100%)',
      }}>
        <PhotoFond alt="ChefShift" />
        <Halos />
        {/* Grille pointillée subtile */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, opacity: 0.5,
          backgroundImage: 'radial-gradient(rgba(207,220,186,0.13) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }} />
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

      {/* ===== Témoignages (avis sur la plateforme) ===== */}
      <section className="cs-sec2" style={{ padding: '0 24px 96px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 58px' }}>
          <span style={{ color: '#5f7052', fontWeight: 800, fontSize: 12.5, letterSpacing: 2.5, textTransform: 'uppercase' }}>{t('testi_over')}</span>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 800, letterSpacing: -1.4, margin: '12px 0 14px' }}>{t('testi_title')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 26 }}>
          {[
            { q: t('testi1_q'), a: t('testi1_a'), r: t('testi1_r') },
            { q: t('testi2_q'), a: t('testi2_a'), r: t('testi2_r') },
            { q: t('testi3_q'), a: t('testi3_a'), r: t('testi3_r') },
          ].map((c, i) => (
            <div key={i} className="cs-card" style={{ background: '#fff', borderRadius: 20, border: '1px solid #eceee3', boxShadow: '0 3px 12px rgba(46,52,43,0.05)', padding: '30px 28px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ display: 'inline-flex', gap: 2, marginBottom: 14 }}>
                {[1, 2, 3, 4, 5].map((s) => <IcoStar key={s} s={16} plein />)}
              </span>
              <p style={{ color: '#3c4436', fontSize: 15.5, lineHeight: 1.6, fontWeight: 500, marginBottom: 20, flex: 1 }}>“{c.q}”</p>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14.5, letterSpacing: -0.2 }}>{c.a}</div>
                <div style={{ color: '#6b7268', fontSize: 13 }}>{c.r}</div>
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
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 24, fontSize: 13.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <span>{t('footer_rights')}</span>
            <span style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
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
