'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useT, LangToggle } from '@/lib/i18n'
import AnimStyles from '@/components/AnimStyles'

const FONT = '"Sora","Inter","Helvetica Neue",Arial,sans-serif'

export default function LoginPage() {
  const { t } = useT()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error) {
      setError(t('login_error'))
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <main style={{ fontFamily: FONT, background: '#f6f7f2', color: '#23281f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AnimStyles />

      <nav style={{ padding: '22px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: 20, color: '#23281f', textDecoration: 'none', letterSpacing: -0.5 }}>
          Chef<span style={{ color: '#5f7052' }}>Shift</span>
        </a>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <LangToggle />
          <a href="/register" style={{ color: '#5f7052', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            {t('login_noaccount')}
          </a>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="cs-pop" style={{
          background: '#fff', width: '100%', maxWidth: 440, padding: 42,
          borderRadius: 22, border: '1px solid #eceee3',
          boxShadow: '0 18px 44px -16px rgba(46,52,43,0.18)',
        }}>
          <h1 style={{ fontSize: 27, fontWeight: 800, letterSpacing: -0.9, marginBottom: 6 }}>{t('login_title')}</h1>
          <p style={{ color: '#6b7268', fontSize: 14.5, marginBottom: 28 }}>{t('login_sub')}</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#3c4436' }}>{t('field_email')}</label>
              <input
                name="email" type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@bedrijf.nl"
                style={{ width: '100%', padding: 12, border: '1.5px solid #e2e6d7', borderRadius: 12, fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: FONT }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#3c4436' }}>{t('field_password')}</label>
              <input
                name="password" type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: 12, border: '1.5px solid #e2e6d7', borderRadius: 12, fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: FONT }}
              />
            </div>

            {error && (
              <p style={{ color: '#b91c1c', fontSize: 13.5, marginBottom: 16, background: '#fef2f2', padding: '10px 14px', borderRadius: 10, fontWeight: 600 }}>
                {error}
              </p>
            )}

            <button type="submit" className="cs-btn" style={{
              width: '100%', padding: 14, background: 'linear-gradient(135deg,#647a55,#46553c)', color: '#fff',
              border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: FONT,
              boxShadow: '0 10px 22px -8px rgba(70,85,60,.5)',
            }}>
              {t('login_title')}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13.5, color: '#6b7268' }}>
            <a href="/register" style={{ color: '#5f7052', fontWeight: 700, textDecoration: 'none' }}>{t('nav_register')}</a>
          </p>
        </div>
      </div>
    </main>
  )
}
