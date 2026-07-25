export default function LoginPage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 440, margin: '40px auto', padding: 32, border: '1px solid #e2e2e2', borderRadius: 12 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>Inloggen</h1>
      <form action="/api/auth/callback/credentials" method="POST">
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>E-mailadres</label>
          <input name="email" type="email" placeholder="naam@bedrijf.nl" style={{ width: '100%', padding: 10, border: '1px solid #e2e2e2', borderRadius: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Wachtwoord</label>
          <input name="password" type="password" placeholder="••••••••" style={{ width: '100%', padding: 10, border: '1px solid #e2e2e2', borderRadius: 8 }} />
        </div>
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
