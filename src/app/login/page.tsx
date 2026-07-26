'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error) {
      setError('E-mailadres of wachtwoord onjuist')
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <main style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', background: '#f7f5f0', color: '#2e342b', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <nav style={{ padding: '22px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontWeight: 800, fontSize: 20, color: '#2e342b', textDecoration: 'none' }}>
          Chef<span style={{ color: '#5f7052' }}>Shift</span>
        </a>
        <a href="/register" style={{ color: '#5f7052', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
          Nog geen account? Registreren
        </a>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{
          background: '#fff', width: '100%', maxWidth: 440, padding: 40,
          borderRadius: 18, boxShadow: '0 10px 30px rgba(46,52,43,0.10)',
        }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginBottom: 6 }}>Inloggen</h1>
          <p style={{ color: '#6b7268', fontSize: 14.5, marginBottom: 28 }}>Welkom terug in de keuken.</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>E-mailadres</label>
              <input
                name="email" type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@bedrijf.nl"
                style={{ width: '100%', padding: 12, border: '1.5px solid #e4e9dd', borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Wachtwoord</label>
              <input
                name="password" type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: 12, border: '1.5px solid #e4e9dd', borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {error && (
              <p style={{ color: '#b91c1c', fontSize: 13.5, marginBottom: 16, background: '#fef2f2', padding: '10px 14px', borderRadius: 8 }}>
                {error}
              </p>
            )}

            <button type="submit" style={{
              width: '100%', padding: 14, background: '#5f7052', color: '#fff',
              border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer',
            }}>
              Inloggen
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13.5, color: '#6b7268' }}>
            <a href="/register" style={{ color: '#5f7052', fontWeight: 700, textDecoration: 'none' }}>Account aanmaken</a>
          </p>
        </div>
      </div>
    </main>
  )
}
