// Mini graphique en barres — sans dépendance externe
export default function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 12, height: 190, padding: '6px 2px 0' }}>
      {data.map((d) => (
        <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#23281f' }}>
            {d.value > 0 ? `€${Math.round(d.value)}` : ''}
          </span>
          <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <div
              className="cs-bar"
              style={{
                width: '100%', maxWidth: 52, margin: '0 auto', borderRadius: '8px 8px 4px 4px',
                height: `${Math.max(3, (d.value / max) * 100)}%`,
                background: d.value > 0 ? 'linear-gradient(180deg,#7c9468,#46553c)' : '#e8ebe0',
                transition: 'height .7s cubic-bezier(.22,.8,.35,1)',
              }}
            />
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#9aa39b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  )
}
