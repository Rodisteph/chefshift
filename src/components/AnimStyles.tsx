export default function AnimStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

      ::selection { background: #dfe7d3; color: #23281f; }

      /* ===== Entrées en cascade ===== */
      .cs-fade { opacity: 0; animation: csFadeUp .9s cubic-bezier(.22,.8,.35,1) forwards; }
      .cs-d1 { animation-delay: .12s; }
      .cs-d2 { animation-delay: .24s; }
      .cs-d3 { animation-delay: .36s; }
      .cs-d4 { animation-delay: .5s; }
      @keyframes csFadeUp {
        from { opacity: 0; transform: translateY(28px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .cs-pop { opacity: 0; animation: csPop .7s cubic-bezier(.22,.8,.35,1) forwards; }
      @keyframes csPop {
        from { opacity: 0; transform: scale(.96) translateY(14px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }

      /* ===== Hero : zoom lent façon Lovable ===== */
      .cs-heroimg { animation: csHeroZoom 16s ease-out forwards; }
      @keyframes csHeroZoom { from { transform: scale(1.12); } to { transform: scale(1); } }

      /* ===== Cartes premium ===== */
      .cs-card { transition: transform .35s cubic-bezier(.22,.8,.35,1), box-shadow .35s ease, border-color .35s ease; }
      .cs-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 22px 44px -14px rgba(46,52,43,.20) !important;
        border-color: #d5dfc5 !important;
      }

      /* ===== Boutons ===== */
      .cs-btn {
        transition: transform .2s ease, box-shadow .25s ease, filter .2s ease;
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      }
      .cs-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 28px -8px rgba(70,85,60,.5); filter: brightness(1.07); }
      .cs-btn:active { transform: translateY(0) scale(.98); }

      .cs-nav-link { transition: opacity .2s ease; }
      .cs-nav-link:hover { opacity: .72; }

      /* ===== Pastille icône animée au survol de la carte ===== */
      .cs-tile { transition: transform .35s cubic-bezier(.22,.8,.35,1); }
      .cs-card:hover .cs-tile { transform: scale(1.08) rotate(-4deg); }

      /* ===== Champs de formulaire ===== */
      input, textarea, select { transition: border-color .2s ease, box-shadow .2s ease; }
      input:focus, textarea:focus, select:focus {
        border-color: #5f7052 !important;
        box-shadow: 0 0 0 3.5px rgba(95,112,82,.16) !important;
      }
      input[type="checkbox"] { accent-color: #5f7052; }

      @media (prefers-reduced-motion: reduce) {
        .cs-fade, .cs-pop, .cs-heroimg { animation: none !important; opacity: 1 !important; }
      }
    `}</style>
  )
}
