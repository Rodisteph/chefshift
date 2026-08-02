// Libellés de statut ultra-clairs, différents selon le point de vue (horeca ou kok).
// Fichier sûr côté client : aucune dépendance serveur (prisma, etc.).
import type { Key } from './i18n'

export type ShiftStatut = {
  status: string
  date: string
  chosenKokId?: string | null
  invoice?: { status: string } | null
  eind?: { reportedEnd: string; confirmedAt: string | null } | null
}

export type StatutInfo = {
  cle: Key
  toon: 'action' | 'ok' | 'neutre' | 'gris'
  icone: string
}

// Renvoie le statut à afficher pour une shift, ou null si rien de pertinent.
export function statutShift(shift: ShiftStatut, perspectief: 'horeca' | 'kok'): StatutInfo | null {
  if (shift.status === 'CANCELLED') return { cle: 'st_geannuleerd', toon: 'gris', icone: 'out' }
  if (shift.status === 'EXPIRED') return { cle: 'st_verlopen', toon: 'gris', icone: 'clock' }
  if (shift.invoice?.status === 'PAID') return { cle: 'pay_paid_badge', toon: 'ok', icone: 'card' }

  const aujourdhui = new Date(new Date().toDateString())
  const passe = new Date(shift.date) < aujourdhui

  if (shift.status === 'OPEN') {
    return perspectief === 'horeca'
      ? { cle: 'st_open_hor', toon: 'neutre', icone: 'users' }
      : { cle: 'st_open_kok', toon: 'action', icone: 'bolt' }
  }

  if (!shift.chosenKokId) return null

  if (!passe) {
    return perspectief === 'horeca'
      ? { cle: 'st_gekozen_hor', toon: 'ok', icone: 'check' }
      : { cle: 'st_gekozen_kok', toon: 'ok', icone: 'check' }
  }

  // Shift passée avec un chef choisi : le suivi de l'eindtijd pilote le statut
  if (!shift.eind) {
    return perspectief === 'horeca'
      ? { cle: 'st_wacht_eindtijd_hor', toon: 'neutre', icone: 'clock' }
      : { cle: 'st_eindtijd_doorgeven_kok', toon: 'action', icone: 'clock' }
  }
  if (!shift.eind.confirmedAt) {
    return perspectief === 'horeca'
      ? { cle: 'st_eindtijd_bevestigen_hor', toon: 'action', icone: 'clock' }
      : { cle: 'st_wacht_bevestiging_kok', toon: 'neutre', icone: 'clock' }
  }
  return perspectief === 'horeca'
    ? { cle: 'st_te_betalen_hor', toon: 'action', icone: 'card' }
    : { cle: 'st_wacht_betaling_kok', toon: 'neutre', icone: 'card' }
}

// Couleurs des badges selon le ton
export const TOON_STIJLEN: Record<StatutInfo['toon'], { bg: string; color: string }> = {
  action: { bg: '#ffedd5', color: '#c2410c' },
  ok: { bg: '#dcfce7', color: '#15803d' },
  neutre: { bg: '#f0f4ea', color: '#4c5e42' },
  gris: { bg: '#f3f4f6', color: '#6b7280' },
}
