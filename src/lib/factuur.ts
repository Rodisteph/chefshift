// Calculs des factures ChefShift — TOUT en centimes entiers, arrondi half-up.
// Jamais de float pour l'argent.

// TVA sur la prestation du chef : 21% (prestation de main-d'œuvre, pas une denrée alimentaire)
export const CHEF_VAT_RATE = 21
// Commission plateforme : 15% du montant HT
export const COMMISSION_RATE = 15

// Arrondi half-up à l'entier (centimes) le plus proche
export function afrondenHalfUp(x: number): number {
  return Math.floor(x + 0.5)
}

// Minutes facturables depuis les horaires "wall-clock" (composantes UTC, sans fuseau).
// Gère le passage minuit (22:00 → 02:00). Pause déduite. Minimum facturé : 1 h.
export function berekenUrenMinuten(startMin: number, eindMin: number, pauzeMin: number): number {
  let duur = eindMin - startMin
  if (duur <= 0) duur += 1440
  return Math.max(60, duur - pauzeMin)
}

// Date ou chaîne -> minutes depuis minuit (wall-clock UTC)
export function minutenVanTijd(d: Date | string): number {
  const t = new Date(d)
  return t.getUTCHours() * 60 + t.getUTCMinutes()
}

export interface Bedragen {
  exclCenten: number
  btwCenten: number
  inclCenten: number
  commissieCenten: number
  payoutCenten: number
}

// Montants d'une facture à partir des minutes travaillées et du tarif horaire (en centimes)
export function berekenBedragen(
  urenMinuten: number,
  tariefCentenPerUur: number,
  vatRate: number = CHEF_VAT_RATE,
  commissiePct: number = COMMISSION_RATE
): Bedragen {
  const excl = afrondenHalfUp((tariefCentenPerUur * urenMinuten) / 60)
  const btw = afrondenHalfUp((excl * vatRate) / 100)
  const incl = excl + btw
  const commissie = afrondenHalfUp((excl * commissiePct) / 100)
  const payout = incl - commissie
  return { exclCenten: excl, btwCenten: btw, inclCenten: incl, commissieCenten: commissie, payoutCenten: payout }
}

export function centenNaarEuro(c: number): number {
  return c / 100
}

export function euroNaarCenten(e: number): number {
  return afrondenHalfUp(e * 100)
}

// Document A : CS-{année}-{chefId}-{seq:04d} — série continue par chef, sans trou
export function factuurNummer(jaar: number, kokId: string, seq: number): string {
  return `CS-${jaar}-${kokId}-${String(seq).padStart(4, '0')}`
}

// Document B : CM-{année}-{seq:04d} — série plateforme, distincte de A
export function commissieNummer(jaar: number, seq: number): string {
  return `CM-${jaar}-${String(seq).padStart(4, '0')}`
}
