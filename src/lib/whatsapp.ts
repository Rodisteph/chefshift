// Composition du message WhatsApp d'annonce d'une shift.
//
// Une seule source de verite : le mail au proprietaire et le bouton
// "Partager" de la page shift produisent exactement le meme texte.
// Sans ca, les deux divergent des la premiere modification.

export type ShiftBericht = {
  shiftId: string
  titel: string
  functie?: string | null
  datum: string // YYYY-MM-DD
  start: string // HH:MM
  eind: string // HH:MM
  tarief: number // en euros
  stad?: string | null
  bedrijf?: string | null
  urgent?: boolean
}

export function shiftWhatsAppTekst(s: ShiftBericht, baseUrl: string): string {
  const link = `${baseUrl}/shifts/${s.shiftId}?src=whatsapp`

  let datumMooi = s.datum
  try {
    datumMooi = new Date(`${s.datum}T00:00:00Z`).toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    })
  } catch {}

  return [
    s.urgent ? '\uD83D\uDD25 SPOEDSHIFT op ChefShift!' : '\uD83D\uDD2A Nieuwe shift op ChefShift!',
    '',
    `\uD83D\uDC68\u200D\uD83C\uDF73 ${s.functie || s.titel}${s.bedrijf ? ` bij ${s.bedrijf}` : ''}`,
    s.stad ? `\uD83D\uDCCD ${s.stad}` : '',
    `\uD83D\uDCC5 ${datumMooi}`,
    `\uD83D\uDD50 ${s.start} - ${s.eind}`,
    `\uD83D\uDCB6 \u20AC${s.tarief}/u`,
    '',
    `Reageer direct: ${link}`,
  ]
    .filter((l) => l !== '')
    .join('\n')
}

// wa.me ouvre WhatsApp (app ou web) avec le message pre-rempli.
// L'utilisateur choisit lui-meme le groupe : aucune API non officielle,
// donc aucun risque de bannissement du numero.
export function whatsappDeelUrl(tekst: string): string {
  return `https://wa.me/?text=${encodeURIComponent(tekst)}`
}
