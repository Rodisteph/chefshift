'use client'

// Champ de tarif horaire avec boutons − / + (molette d'ajustement).
// step="any" évite le bug de validation HTML (min décimal + step fixe qui refuse
// des valeurs rondes comme 22). Les boutons ajustent par pas de 0,50 €, jamais sous le minimum.
export default function RateStepper({
  value,
  onChange,
  min,
  inputStyle,
}: {
  value: string
  onChange: (v: string) => void
  min: number
  inputStyle: React.CSSProperties
}) {
  const courant = () => {
    const n = parseFloat(value)
    return isNaN(n) ? min : n
  }
  const poser = (v: number) => {
    const clamp = Math.max(min, Math.round(v * 100) / 100)
    onChange(String(clamp))
  }

  const btn: React.CSSProperties = {
    flexShrink: 0,
    width: 44,
    borderRadius: 12,
    border: '1.5px solid #e2e6d7',
    background: 'hsl(var(--card))',
    color: 'hsl(var(--foreground))',
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1,
    cursor: 'pointer',
    fontFamily: 'inherit',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
      <button type="button" onClick={() => poser(courant() - 0.5)} aria-label="−0,50" style={btn}>−</button>
      <input
        type="number"
        inputMode="decimal"
        step="any"
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => { if (value !== '' && parseFloat(value) < min) poser(min) }}
        placeholder={String(min)}
        style={{ ...inputStyle, textAlign: 'center' }}
      />
      <button type="button" onClick={() => poser(courant() + 0.5)} aria-label="+0,50" style={btn}>+</button>
    </div>
  )
}
