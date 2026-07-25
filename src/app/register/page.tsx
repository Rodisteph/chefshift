export default function RegisterPage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 440, margin: '40px auto', padding: 32, border: '1px solid #e2e2e2', borderRadius: 12 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>Account aanmaken</h1>
      <form method="POST" action="/api/auth/register">
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>E-mailadres</label>
          <input name="email" type="email" placeholder="naam@bedrijf.nl" style={{ width: '100%', padding: 10, border: '1px solid #e2e2e2', borderRadius: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Wachtwoord</label>
          <input name="password" type="password" placeholder="Minimaal 8 tekens" style={{ width: '100%', padding: 10, border: '1px solid #e2e2e2', borderRadius: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Naam</label>
          <input name="name" type="text" placeholder="Jouw naam" style={{ width: '100%', padding: 10, border: '1px solid #e2e2e2', borderRadius: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Rol</label>
          <select name="role" style={{ width: '100%', padding: 10, border: '1px solid #e2e2e2', borderRadius: 8 }}>
            <option value="KOK">ZZP-kok</option>
            <option value="HORECA">Horeca</option>
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>KvK-nummer</label>
          <input name="kvkNumber" type="text" placeholder="12345678" style={{ width: '100%', padding: 10, border: '1px solid #e2e2e2', borderRadius: 8 }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: 12, background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer' }}>
          Account aanmaken
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
        <a href="/login" style={{ color: '#1a1a1a' }}>Al een account? Inloggen</a>
      </p>
    </main>
  )
}
