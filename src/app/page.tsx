'use client'

import { useT, LangToggle } from '@/lib/i18n'

export default function HomePage() {
  const { t } = useT()
  const hero = 'https://kimi-web-img.moonshot.cn/img/plus.unsplash.com/035b02474f33aabd5af6cf4d2ff2a0971fc1b816'

  return (
    <main style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', background: '#f7f5f0', color: '#2e342b', minHeight: '100vh' }}>

      {/* ===== Navigation flottante ===== */}
      <nav style={{
        position: 'fixed', top: 18, left: '50%', transform: 'translateX(-50%)',
        width: 'min(1160px, calc(100% - 32px))', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 26px', borderRadius: 999,
        background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.25)',
      }}>
        <a href="/" style={{ fontWeight: 800, fontSize: 20, color: '#fff', textDecoration: 'none' }}>
          Chef<span style={{ color: '#e4e9dd' }}>Shift</span>
        </a>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <LangToggle clair />
          <a href="/login" style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>{t('nav_login')}</a>
          <a href="/register" style={{
            background: '#5f7052', color: '#fff', padding: '10px 20px',
            borderRadius: 999, fontWeight: 700, fontSize: 14, textDecoration: 'none',
          }}>{t('nav_register')}</a>
        </div>
      </nav>

      {/* ===== Heros ===== */}
      <header style={{ position: 'relative', height: '100vh', minHeight: 620, display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
        <img src={hero} alt="Chef aan het werk in een professionele keuken"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(30,38,27,0.6), rgba(30,38,27,0.05) 55%)' }} />
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 24px 90px', color: '#fff' }}>
          <span style={{
            display: 'inline-block', background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)', padding: '8px 18px', borderRadius: 999,
            fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 22,
          }}>
            {t('hero_badge')}
          </span>
          <h1 style={{ fontSize: 'clamp(42px, 7vw, 84px)', fontWeight: 800, lineHeight: 1.02, letterSpacing: -1.5, maxWidth: '13ch', marginBottom: 22 }}>
            {t('hero_title_a')} <span style={{ color: '#e4e9dd' }}>{t('hero_title_b')}</span>
          </h1>
          <p style={{ fontSize: 18, maxWidth: '46ch', opacity: 0.92, marginBottom: 34 }}>{t('hero_sub')}</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href="/register" style={{ background: '#5f7052', color: '#fff', padding: '15px 32px', borderRadius: 999, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              {t('hero_cta1')}
            </a>
            <a href="/login" style={{ background: 'rgba(255,255,255,0.16)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(6px)', padding: '15px 32px', borderRadius: 999, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              {t('hero_cta2')}
            </a>
          </div>
        </div>
      </header>

      {/* ===== Etapes ===== */}
      <section style={{ padding: '90px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 56px' }}>
          <span style={{ color: '#5f7052', fontWeight: 800, fontSize: 13, letterSpacing: 2.5, textTransform: 'uppercase' }}>{t('steps_over')}</span>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 800, letterSpacing: -1, margin: '10px 0 14px' }}>{t('steps_title')}</h2>
          <p style={{ color: '#6b7268', fontSize: 17 }}>{t('steps_sub')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {[
            { n: '1', t: t('step1_t'), d: t('step1_d') },
            { n: '2', t: t('step2_t'), d: t('step2_d') },
            { n: '3', t: t('step3_t'), d: t('step3_d') },
          ].map((e) => (
            <div key={e.n} style={{ background: '#fff', borderRadius: 18, padding: '34px 28px', boxShadow: '0 4px 14px rgba(46,52,43,0.05)' }}>
              <div style={{ width: 46, height: 46, background: '#e4e9dd', color: '#5f7052', fontWeight: 800, fontSize: 19, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>{e.n}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{e.t}</h3>
              <p style={{ color: '#6b7268', fontSize: 14.5 }}>{e.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Avantages ===== */}
      <section style={{ padding: '0 24px 90px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 56px' }}>
          <span style={{ color: '#5f7052', fontWeight: 800, fontSize: 13, letterSpacing: 2.5, textTransform: 'uppercase' }}>{t('why_over')}</span>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 800, letterSpacing: -1, margin: '10px 0 14px' }}>{t('why_title')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 28 }}>
          {[
            { icon: '⚡', t: t('feat1_t'), d: t('feat1_d') },
            { icon: '✅', t: t('feat2_t'), d: t('feat2_d') },
            { icon: '🔒', t: t('feat3_t'), d: t('feat3_d') },
          ].map((c) => (
            <div key={c.t} style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 14px rgba(46,52,43,0.06)', padding: '30px 26px' }}>
              <div style={{ fontSize: 34, marginBottom: 14 }}>{c.icon}</div>
              <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 8 }}>{c.t}</h3>
              <p style={{ color: '#6b7268', fontSize: 14.5 }}>{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Banniere CTA ===== */}
      <section style={{ padding: '0 24px 90px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ position: 'relative', borderRadius: 26, overflow: 'hidden', padding: '80px 40px', textAlign: 'center', color: '#fff' }}>
          <img src={hero} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(46,52,43,0.6)' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: -1, marginBottom: 14 }}>{t('banner_title')}</h2>
            <p style={{ opacity: 0.9, marginBottom: 30, fontSize: 17 }}>{t('banner_sub')}</p>
            <a href="/register" style={{ display: 'inline-block', background: '#5f7052', color: '#fff', padding: '15px 32px', borderRadius: 999, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              {t('banner_cta')}
            </a>
          </div>
        </div>
      </section>

      {/* ===== Pied de page ===== */}
      <footer style={{ background: '#2e342b', color: 'rgba(255,255,255,0.75)', padding: '60px 24px 30px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 22, marginBottom: 12 }}>Chef<span style={{ color: '#8a9a7b' }}>Shift</span></div>
          <p style={{ maxWidth: 360, marginBottom: 40 }}>{t('footer_tag')}</p>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 24, fontSize: 13.5, textAlign: 'center' }}>
            {t('footer_rights')}
          </div>
        </div>
      </footer>
    </main>
  )
}
