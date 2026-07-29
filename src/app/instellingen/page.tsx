'use client'

import { signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useT, LangToggle } from '@/lib/i18n'
import AnimStyles from '@/components/AnimStyles'
import PushSetup from '@/components/PushSetup'
import ThemeToggle from '@/components/ThemeToggle'
import { Ico, IcoTile } from '@/components/Icons'

const FONT = '"Sora","Inter","Helvetica Neue",Arial,sans-serif'
const CONTACT_EMAIL = 'info@chefshift.nl'

type SessionUser = {
  name?: string | null
  email?: string | null
  role?: string
}

export default function InstellingenPage() {
  const { t, lang, setLang } = useT()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((s) => {
        if (!s?.user) {
          window.location.href = '/login'
          return
        }
        setUser(s.user)
        setChargement(false)
      })
  }, [])

  const carte: React.CSSProperties = {
    background: 'hsl(var(--card))', borderRadius: 20, border: '1px solid #eceee3',
    boxShadow: '0 3px 12px rgba(46,52,43,0.05)', padding: 24,
  }
  const titreBloc: React.CSSProperties = {
    fontSize: 16.5, fontWeight: 800, letterSpacing: -0.4, margin: 0,
  }

  if (chargement) {
    return (
      <main style={{ fontFamily: FONT, background: 'hsl(var(--background))', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>{t('dash_loading')}</p>
      </main>
    )
  }

  const estKok = user?.role === 'KOK'

  return (
    <main style={{ fontFamily: FONT, background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', minHeight: '100vh' }}>
      <AnimStyles />
      <nav className="cs-nav" style={{
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e8ebe0',
        padding: '13px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <a href="/dashboard" style={{ fontWeight: 800, fontSize: 20, color: 'hsl(var(--foreground))', textDecoration: 'none', letterSpacing: -0.5 }}>
          Chef<span style={{ color: '#5f7052' }}>Shift</span>
        </a>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <LangToggle />
          <ThemeToggle />
          <a href="/dashboard" style={{ color: '#5f7052', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            {t('back_dashboard')}
          </a>
        </div>
      </nav>

      <div className="cs-wrap" style={{ maxWidth: 640, margin: '0 auto', padding: '44px 24px 60px' }}>
        <h1 className="cs-fade" style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 800, letterSpacing: -1.1, marginBottom: 6 }}>
          {t('set_title')}
        </h1>
        <p className="cs-fade cs-d1" style={{ color: 'hsl(var(--muted-foreground))', fontSize: 14.5, marginTop: 0, marginBottom: 28 }}>
          {t('set_sub')}
        </p>

        {/* ===== Notifications ===== */}
        <section className="cs-fade cs-d1" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <IcoTile n="bell" s={16} taille={36} />
            <h2 style={titreBloc}>{t('set_notif_title')}</h2>
          </div>
          <PushSetup />
        </section>

        {/* ===== Langue ===== */}
        <section className="cs-fade cs-d2 cs-panel" style={{ ...carte, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <IcoTile n="msg" s={16} taille={36} />
            <div>
              <h2 style={titreBloc}>{t('set_lang_title')}</h2>
              <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: 13, margin: '3px 0 0' }}>{t('set_lang_desc')}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setLang('nl')}
              className="cs-btn cs-seg"
              data-active={lang === 'nl'}
              style={{
                border: lang === 'nl' ? '2px solid #5f7052' : '1.5px solid #dfe4d4',
                background: lang === 'nl' ? '#eef2e6' : '#fff',
                color: 'hsl(var(--foreground))', borderRadius: 999, padding: '9px 22px',
                fontWeight: 800, fontSize: 13.5, cursor: 'pointer', fontFamily: FONT,
              }}
            >
              NL
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className="cs-btn cs-seg"
              data-active={lang === 'en'}
              style={{
                border: lang === 'en' ? '2px solid #5f7052' : '1.5px solid #dfe4d4',
                background: lang === 'en' ? '#eef2e6' : '#fff',
                color: 'hsl(var(--foreground))', borderRadius: 999, padding: '9px 22px',
                fontWeight: 800, fontSize: 13.5, cursor: 'pointer', fontFamily: FONT,
              }}
            >
              EN
            </button>
          </div>
        </section>

        {/* ===== Compte ===== */}
        <section className="cs-fade cs-d2 cs-panel" style={{ ...carte, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <IcoTile n="user" s={16} taille={36} />
            <div>
              <h2 style={titreBloc}>{t('set_account_title')}</h2>
              <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: 13, margin: '3px 0 0' }}>
                {user?.email} · <span style={{ fontWeight: 700, color: '#4c5e42' }}>{user?.role}</span>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(estKok || user?.role === 'HORECA') && (
              <a
                href={estKok ? '/profiel' : '/profiel-horeca'}
                className="cs-btn"
                style={{
                  background: 'none', border: '1.5px solid #dfe4d4', borderRadius: 999,
                  padding: '10px 20px', fontWeight: 700, fontSize: 13.5, color: 'hsl(var(--foreground))',
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7,
                }}
              >
                <Ico n="user" s={14} /> {t('set_profile_btn')}
              </a>
            )}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="cs-btn"
              style={{
                background: 'none', border: '1.5px solid #f0d5d5', borderRadius: 999,
                padding: '10px 20px', fontWeight: 700, fontSize: 13.5, color: '#b91c1c',
                cursor: 'pointer', fontFamily: FONT,
              }}
            >
              {t('nav_logout')}
            </button>
          </div>
        </section>

        {/* ===== Aide / contact ===== */}
        <section className="cs-fade cs-d3 cs-panel" style={{ ...carte, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <IcoTile n="msg" s={16} taille={36} />
            <div>
              <h2 style={titreBloc}>{t('set_contact_title')}</h2>
              <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: 13, margin: '3px 0 0' }}>{t('contact_sub')}</p>
            </div>
          </div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="cs-btn"
            style={{
              background: 'linear-gradient(135deg,#647a55,#46553c)', color: '#fff', borderRadius: 999,
              padding: '10px 22px', fontWeight: 700, fontSize: 13.5, textDecoration: 'none',
              boxShadow: '0 8px 18px -8px rgba(70,85,60,.5)',
            }}
          >
            {t('contact')}
          </a>
        </section>
      </div>
    </main>
  )
}
