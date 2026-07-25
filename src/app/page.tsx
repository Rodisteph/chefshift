export default function Home() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '0 auto', padding: 40 }}>
      <h1 style={{ fontSize: 40, fontWeight: 600, marginBottom: 16 }}>
        ChefShift <span style={{ color: '#d97706' }}>NL</span>
      </h1>
      <p style={{ fontSize: 18, color: '#4a4a4a', marginBottom: 32 }}>
        Platform voor ZZP-koks en horeca in Nederland
      </p>
      <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
        <a href="/login" style={{ padding: '14px 28px', background: '#1a1a1a', color: 'white', borderRadius: 10, textDecoration: 'none', fontWeight: 500 }}>
          Inloggen
        </a>
        <a href="/register" style={{ padding: '14px 28px', border: '1px solid #e2e2e2', color: '#1a1a1a', borderRadius: 10, textDecoration: 'none', fontWeight: 500 }}>
          Account aanmaken
        </a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ border: '1px solid #e2e2e2', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>⚡</div>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Snelle matching</h3>
          <p style={{ fontSize: 13, color: '#8a8a8a' }}>Binnen 2 uur een kok vinden</p>
        </div>
        <div style={{ border: '1px solid #e2e2e2', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>✓</div>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Geverifieerde koks</h3>
          <p style={{ fontSize: 13, color: '#8a8a8a' }}>KvK, HACCP en identiteit gecheckt</p>
        </div>
        <div style={{ border: '1px solid #e2e2e2', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>🔒</div>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Veilig betalen</h3>
          <p style={{ fontSize: 13, color: '#8a8a8a' }}>iDEAL, automatische facturering</p>
        </div>
      </div>
    </main>
  )
}
