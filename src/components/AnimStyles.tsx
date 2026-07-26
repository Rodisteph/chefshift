export default function AnimStyles() {
  return (
    <style>{`
      .cs-fade { opacity: 0; animation: csFadeUp .8s ease forwards; }
      .cs-d1 { animation-delay: .12s; }
      .cs-d2 { animation-delay: .24s; }
      .cs-d3 { animation-delay: .36s; }
      .cs-d4 { animation-delay: .5s; }
      @keyframes csFadeUp {
        from { opacity: 0; transform: translateY(26px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .cs-card { transition: transform .3s ease, box-shadow .3s ease; }
      .cs-card:hover { transform: translateY(-6px); box-shadow: 0 16px 38px rgba(46,52,43,.14) !important; }
      .cs-btn { transition: transform .2s ease, box-shadow .2s ease, background .2s ease; display: inline-block; }
      .cs-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(95,112,82,.4); }
      .cs-btn:active { transform: translateY(0); }
      .cs-nav-link { transition: opacity .2s ease; }
      .cs-nav-link:hover { opacity: .75; }
    `}</style>
  )
}
