// Heures de shift = "wall-clock" (heure locale de l'établissement).
// Elles sont stockées en composantes UTC et affichées SANS conversion de fuseau :
// ce que l'utilisateur saisit est exactement ce qui est stocké et affiché, quel que
// soit le fuseau/DST de l'appareil. On évite ainsi tout décalage d'une heure.

// Affiche "HH:MM" à partir d'une valeur stockée (Date ou ISO), en lisant les composantes UTC.
export function heureHHMM(v: string | Date, locale = 'nl-NL'): string {
  return new Date(v).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

// Extrait "HH:MM" (UTC) pour préremplir un <input type="time">.
export function versChamp(v: string | Date): string {
  const d = new Date(v)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

// Minutes depuis minuit (UTC) — pour calculer une durée sans conversion de fuseau.
export function minutesUTC(v: string | Date): number {
  const d = new Date(v)
  return d.getUTCHours() * 60 + d.getUTCMinutes()
}
