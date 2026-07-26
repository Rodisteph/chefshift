import React from 'react'

// Icônes SVG style Lucide — pas d'emoji, rendu net et pro
const PATHS: Record<string, React.ReactNode> = {
  cal: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  flame: (
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  ),
  bolt: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </>
  ),
  chef: (
    <>
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6z" />
      <path d="M6 17h12" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  brief: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </>
  ),
  utensils: (
    <>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </>
  ),
  msg: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  inbox: (
    <>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </>
  ),
  user: (
    <>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="8" r="6" />
      <path d="M15.5 13 17 22l-5-3-5 3 1.5-9" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  x: <path d="M18 6 6 18M6 6l12 12" />,
  bank: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </>
  ),
  muscle: (
    <path d="M12.4 6.5c.8-1.3 2.5-1.9 4-1.4 1.9.6 2.9 2.6 2.3 4.5-.2.8-.7 1.4-1 2.1-.4 1-.5 2-.2 3.1.3 1.2 1.1 2.1 1 3.4-.1 1.2-1.2 2.2-2.4 2.3-1.4.1-2.5-.9-2.9-2.2-.3-1-.3-2-.7-2.9-.5-1.1-1.6-1.8-2.8-1.9-1.1 0-2.2.4-3.2-.2-1-.5-1.6-1.7-1.3-2.8.3-1.2 1.5-2 2.7-2 1.1 0 2.1.6 3.2.5 1-.1 1.7-1 2-1.9z" />
  ),
  cake: (
    <>
      <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
      <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
      <path d="M2 21h20" />
      <path d="M7 8v3M12 8v3M17 8v3" />
      <path d="M7 4h.01M12 4h.01M17 4h.01" />
    </>
  ),
}

export function Ico({ n, s = 16, c = 'currentColor', sw = 2 }: { n: string; s?: number; c?: string; sw?: number }) {
  return (
    <svg
      width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, verticalAlign: '-2px' }} aria-hidden
    >
      {PATHS[n]}
    </svg>
  )
}

export function IcoStar({ s = 15, plein = true }: { s?: number; plein?: boolean }) {
  return (
    <svg
      width={s} height={s} viewBox="0 0 24 24"
      fill={plein ? '#e8a33d' : 'none'} stroke={plein ? '#e8a33d' : '#d5d0c4'}
      strokeWidth="1.6" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
    </svg>
  )
}

// Pastille icône dans un cercle sauge
export function IcoTile({ n, s = 20, taille = 46 }: { n: string; s?: number; taille?: number }) {
  return (
    <span
      className="cs-tile"
      style={{
        width: taille, height: taille, borderRadius: 14,
        background: 'linear-gradient(135deg, #eef2e6, #dfe7d1)',
        color: '#4c5e42', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.7), 0 2px 6px rgba(76,94,66,.12)',
      }}
    >
      <Ico n={n} s={s} sw={1.9} />
    </span>
  )
}
