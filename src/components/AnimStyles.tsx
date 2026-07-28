'use client'

import { useEffect } from 'react'

export default function AnimStyles() {
  // Scroll-reveal : révèle les cartes au fil du défilement, sans modifier le markup.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const cartes = Array.from(document.querySelectorAll<HTMLElement>('.cs-card'))
    const aReveler: HTMLElement[] = []
    const marge = window.innerHeight - 80

    for (const el of cartes) {
      // On ne masque que ce qui est sous la ligne de flottaison (évite tout flash au chargement)
      if (el.getBoundingClientRect().top > marge) {
        el.classList.add('cs-reveal')
        aReveler.push(el)
      }
    }
    if (aReveler.length === 0) return

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('cs-reveal-in')
            obs.unobserve(e.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    aReveler.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <style>{`
      /* Les polices sont préchargées dans le <head> (voir layout.tsx) — plus d'@import bloquant ici. */

      * { -webkit-tap-highlight-color: transparent; }
      html { scroll-behavior: smooth; }
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

      /* ===== Hero : halos lumineux flottants (décor sans image) ===== */
      .cs-halo {
        position: absolute; border-radius: 50%; pointer-events: none;
        filter: blur(70px); will-change: transform;
        animation: csHalo 14s ease-in-out infinite alternate;
      }
      .cs-halo1 { width: 46vw; height: 46vw; min-width: 320px; min-height: 320px; top: -12%; right: -8%; background: rgba(207,220,186,0.16); }
      .cs-halo2 { width: 34vw; height: 34vw; min-width: 240px; min-height: 240px; bottom: -14%; left: -6%; background: rgba(138,154,123,0.20); animation-delay: -5s; animation-duration: 18s; }
      .cs-halo3 { width: 22vw; height: 22vw; min-width: 170px; min-height: 170px; top: 30%; left: 34%; background: rgba(100,122,85,0.22); animation-delay: -9s; animation-duration: 11s; }
      @keyframes csHalo {
        from { transform: translate3d(0, 0, 0) scale(1); }
        to { transform: translate3d(4vw, 3vh, 0) scale(1.12); }
      }

      /* ===== Cartes premium ===== */
      .cs-card { transition: transform .35s cubic-bezier(.22,.8,.35,1), box-shadow .35s ease, border-color .35s ease; will-change: transform; }
      .cs-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 22px 44px -14px rgba(46,52,43,.20) !important;
        border-color: #d5dfc5 !important;
      }

      /* ===== Boutons ===== */
      .cs-btn {
        transition: transform .2s ease, box-shadow .25s ease, filter .2s ease;
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        will-change: transform;
      }
      .cs-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 28px -8px rgba(70,85,60,.5); filter: brightness(1.07); }
      .cs-btn:active { transform: translateY(0) scale(.98); }
      /* Flèche qui glisse au survol du bouton */
      .cs-btn svg { transition: transform .25s cubic-bezier(.22,.8,.35,1); }
      .cs-btn:hover svg { transform: translateX(3px); }

      /* ===== Révélation au défilement (scroll-reveal) ===== */
      .cs-reveal { opacity: 0; transform: translateY(26px); transition: opacity .7s cubic-bezier(.22,.8,.35,1), transform .7s cubic-bezier(.22,.8,.35,1); }
      .cs-reveal-in { opacity: 1; transform: translateY(0); }

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

      /* ===== Mobile (téléphone) ===== */
      @media (max-width: 640px) {
        input, textarea, select { font-size: 16px !important; }
        .cs-hide-mob { display: none !important; }
        .cs-end { text-align: left !important; width: 100%; align-items: flex-start !important; }
        .cs-nav { padding: 11px 16px !important; }
        .cs-wrap { padding: 32px 16px !important; }
        .cs-sec { padding: 60px 18px !important; }
        .cs-sec2 { padding: 0 18px 60px !important; }
        .cs-hero-pad { padding: 0 18px 76px !important; }
        .cs-auth { padding: 30px 22px !important; }
        /* Barre de navigation compacte : textes masqués, icônes seules */
        .cs-nav-txt { display: none !important; }
        /* Statistiques : 2 par ligne, cartes compactes */
        .cs-stats { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        .cs-stat { padding: 14px 16px !important; gap: 10px !important; border-radius: 16px !important; }
        .cs-stat-n { font-size: 20px !important; }
        .cs-stat-l { font-size: 11.5px !important; }
      }

      @media (prefers-reduced-motion: reduce) {
        html { scroll-behavior: auto; }
        .cs-fade, .cs-pop { animation: none !important; opacity: 1 !important; transform: none !important; }
        .cs-halo { animation: none !important; }
        .cs-reveal, .cs-reveal-in { opacity: 1 !important; transform: none !important; transition: none !important; }
        .cs-card:hover, .cs-btn:hover, .cs-btn:hover svg, .cs-card:hover .cs-tile { transform: none !important; }
      }
    `}</style>
  )
}
