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
      window.location.href = '/'
    }
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 440, margin: '40px auto', padding: 32, border: '1px solid #e2e2e2', borderRadius: 12 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>Inloggen</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>E-mailadres</label>
          <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="naam@bedrijf.nl" style={{ width: '100%', padding: 10, border: '1px solid #e2e2e2', borderRadius: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Wachtwoord</label>
          <input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: 10, border: '1px solid #e2e2e2', borderRadius: 8 }} />
        </div>
        {error && <p style={{ color: 'red', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: 12, background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer' }}>
          Inloggen
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
        <a href="/register" style={{ color: '#1a1a1a' }}>Account aanmaken</a>
      </p>
    </main>
  )
}
