import { Resend } from 'resend'

// Expéditeur : noreply@chefshift.nl (domaine vérifié dans Resend)
const FROM = (process.env.EMAIL_FROM || 'ChefShift <onboarding@resend.dev>').trim()

// Adresse du propriétaire (reçoit les messages WhatsApp prêts à coller)
const OWNER_EMAIL = (process.env.OWNER_EMAIL || 'rdrgbouabida@gmail.com').trim()

export function baseUrl(): string {
  return (process.env.NEXTAUTH_URL || 'https://www.chefshift.nl').trim().replace(/\/+$/, '')
}

// Envoi d'email via Resend. Ne fait rien si la clé n'est pas configurée.
export async function envoyerEmail(to: string, sujet: string, html: string) {
  const key = process.env.RESEND_API_KEY
  if (!key || !to) return { ok: false }
  try {
    const resend = new Resend(key.trim())
    await resend.emails.send({ from: FROM, to, subject: sujet, html })
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

// Échappe le HTML pour un affichage sûr dans les cadres copiables
function esc(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Logo ChefShift en HTML pur (aucune image à charger, compatible tous clients mail)
function logoHtml(): string {
  return `<table cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="background:#5f7052;border-radius:12px;width:44px;height:44px;text-align:center;vertical-align:middle;color:#ffffff;font-weight:800;font-size:24px;font-family:Arial,sans-serif">C</td>
    <td style="padding-left:12px;font-size:21px;font-weight:800;color:#23281f;font-family:Arial,sans-serif">Chef<span style="color:#5f7052">Shift</span></td>
  </tr></table>`
}

// Gabarit commun bilingue : bloc NL, séparateur, bloc EN
function gabarit(
  titreNl: string, corpsNl: string, boutonNl: string,
  titreEn: string, corpsEn: string, boutonEn: string,
  url: string
): string {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f6f7f2;padding:32px 16px">
  <div style="background:#ffffff;border:1px solid #eceee3;border-radius:16px;padding:32px">
    ${logoHtml()}

    <!-- NL -->
    <h1 style="font-size:21px;color:#23281f;margin:28px 0 12px;font-family:Arial,sans-serif">${titreNl}</h1>
    <p style="font-size:15px;line-height:1.7;color:#4a5044;margin:0">${corpsNl}</p>
    <a href="${url}" style="display:inline-block;margin-top:22px;background:#46553c;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:999px;font-weight:700;font-size:14px">${boutonNl}</a>

    <hr style="border:none;border-top:1px dashed #dfe4d4;margin:30px 0">

    <!-- EN -->
    <h1 style="font-size:19px;color:#23281f;margin:0 0 12px;font-family:Arial,sans-serif">${titreEn}</h1>
    <p style="font-size:14px;line-height:1.7;color:#6b7268;margin:0">${corpsEn}</p>
    <a href="${url}" style="display:inline-block;margin-top:20px;background:#8a9a7b;color:#ffffff;text-decoration:none;padding:11px 24px;border-radius:999px;font-weight:700;font-size:13px">${boutonEn}</a>
  </div>
  <p style="font-size:12px;color:#9aa39b;text-align:center;margin-top:16px;line-height:1.6">
    ChefShift · Het platform voor zzp-koks en horeca<br>© 2026 ChefShift
  </p>
</div>`
}

// Ligne d'étape numérotée pour l'e-mail de bienvenue
function stap(n: string, titre: string, desc: string): string {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px"><tr>
    <td style="background:#eef2e6;border-radius:9px;width:27px;height:27px;text-align:center;vertical-align:middle;color:#4c5e42;font-weight:800;font-size:13px;font-family:Arial,sans-serif">${n}</td>
    <td style="padding-left:11px;font-family:Arial,sans-serif"><strong style="font-size:14px;color:#23281f">${titre}</strong><br><span style="font-size:13px;color:#6b7268;line-height:1.55">${desc}</span></td>
  </tr></table>`
}

// Gabarit de bienvenue : intro + 3 étapes + bouton + astuce (bloc NL puis bloc EN)
function gabaritBienvenue(
  titreNl: string, introNl: string, stappenNl: string, boutonNl: string, tipNl: string,
  titreEn: string, introEn: string, stappenEn: string, boutonEn: string, tipEn: string,
  url: string
): string {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f6f7f2;padding:32px 16px">
  <div style="background:#ffffff;border:1px solid #eceee3;border-radius:16px;padding:32px">
    ${logoHtml()}

    <!-- NL -->
    <h1 style="font-size:21px;color:#23281f;margin:28px 0 12px;font-family:Arial,sans-serif">${titreNl}</h1>
    <p style="font-size:15px;line-height:1.7;color:#4a5044;margin:0 0 22px">${introNl}</p>
    ${stappenNl}
    <a href="${url}" style="display:inline-block;margin-top:12px;background:#46553c;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:999px;font-weight:700;font-size:14px">${boutonNl}</a>
    <div style="margin-top:24px;background:#f6f7f2;border-left:3px solid #8a9a7b;border-radius:0 10px 10px 0;padding:12px 14px;font-size:13px;color:#6b7268;line-height:1.6;font-style:italic">${tipNl}</div>

    <hr style="border:none;border-top:1px dashed #dfe4d4;margin:30px 0">

    <!-- EN -->
    <h1 style="font-size:19px;color:#23281f;margin:0 0 12px;font-family:Arial,sans-serif">${titreEn}</h1>
    <p style="font-size:14px;line-height:1.7;color:#6b7268;margin:0 0 20px">${introEn}</p>
    ${stappenEn}
    <a href="${url}" style="display:inline-block;margin-top:10px;background:#8a9a7b;color:#ffffff;text-decoration:none;padding:11px 24px;border-radius:999px;font-weight:700;font-size:13px">${boutonEn}</a>
    <div style="margin-top:22px;background:#f6f7f2;border-left:3px solid #cfdcba;border-radius:0 10px 10px 0;padding:11px 13px;font-size:12.5px;color:#9aa39b;line-height:1.6;font-style:italic">${tipEn}</div>
  </div>
  <p style="font-size:12px;color:#9aa39b;text-align:center;margin-top:16px;line-height:1.6">
    ChefShift · Het platform voor zzp-koks en horeca<br>
    <a href="https://www.chefshift.nl" style="color:#5f7052;text-decoration:none;font-weight:700">www.chefshift.nl</a> · <a href="mailto:info@chefshift.nl" style="color:#5f7052;text-decoration:none">info@chefshift.nl</a><br>© 2026 ChefShift
  </p>
</div>`
}

// 1. Horeca : nouvelle candidature reçue
export async function emailNouvelleCandidature(horecaEmail: string, shiftId: string, shiftTitre: string, kokNaam: string) {
  return envoyerEmail(
    horecaEmail,
    `Nieuwe kandidaat voor: ${shiftTitre} · New applicant`,
    gabarit(
      'Nieuwe kandidaat',
      `${kokNaam} heeft gereageerd op je shift <strong>${shiftTitre}</strong>. Bekijk het profiel en kies je kok.`,
      'Bekijk kandidaat',
      'New applicant',
      `${kokNaam} applied for your shift <strong>${shiftTitre}</strong>. View the profile and choose your chef.`,
      'View applicant',
      `${baseUrl()}/shifts/${shiftId}`
    )
  )
}

// 2. Chef : choisi pour un shift
export async function emailShiftBevestigd(kokEmail: string, shiftId: string, shiftTitre: string, datum: string) {
  return envoyerEmail(
    kokEmail,
    `Je bent gekozen voor: ${shiftTitre} · You are chosen`,
    gabarit(
      'Shift bevestigd!',
      `Gefeliciteerd, je bent gekozen voor de shift <strong>${shiftTitre}</strong> op <strong>${datum}</strong>. Je ontvangt een herinnering 24 uur en 2 uur voor aanvang.`,
      'Bekijk mijn shifts',
      'Shift confirmed!',
      `Congratulations, you have been chosen for the shift <strong>${shiftTitre}</strong> on <strong>${datum}</strong>. You will receive a reminder 24 hours and 2 hours before it starts.`,
      'View my shifts',
      `${baseUrl()}/shifts/${shiftId}`
    )
  )
}

// 3. Chef : paiement reçu
export async function emailBetalingOntvangen(kokEmail: string, shiftTitre: string, bedrag: number) {
  return envoyerEmail(
    kokEmail,
    `Betaling ontvangen voor: ${shiftTitre} · Payment received`,
    gabarit(
      'Betaling ontvangen',
      `De horeca heeft betaald voor de shift <strong>${shiftTitre}</strong>. Jouw uitbetaling van <strong>€${bedrag.toFixed(2)}</strong> wordt overgemaakt naar je rekening.`,
      'Naar dashboard',
      'Payment received',
      `The business has paid for the shift <strong>${shiftTitre}</strong>. Your payout of <strong>€${bedrag.toFixed(2)}</strong> will be transferred to your account.`,
      'Go to dashboard',
      `${baseUrl()}/dashboard`
    )
  )
}

// 4. Chef : rappel avant un shift (24h / 2h)
export async function emailRappelShift(kokEmail: string, shiftId: string, shiftTitre: string, delai: '24 uur' | '2 uur', debut: string) {
  const delaiEn = delai === '24 uur' ? '24 hours' : '2 hours'
  return envoyerEmail(
    kokEmail,
    `Herinnering: je shift begint over ${delai} · Shift reminder`,
    gabarit(
      `Je shift begint over ${delai}`,
      `Herinnering: je shift <strong>${shiftTitre}</strong> begint over <strong>${delai}</strong> (${debut}). Zorg dat je op tijd bent!`,
      'Bekijk shift',
      `Your shift starts in ${delaiEn}`,
      `Reminder: your shift <strong>${shiftTitre}</strong> starts in <strong>${delaiEn}</strong> (${debut}). Make sure you're on time!`,
      'View shift',
      `${baseUrl()}/shifts/${shiftId}`
    )
  )
}

// 5. Horeca : le chef a déclaré son heure de fin
export async function emailEindtijdGemeld(horecaEmail: string, shiftId: string, shiftTitre: string, kokNaam: string, eindtijd: string) {
  return envoyerEmail(
    horecaEmail,
    `Eindtijd doorgegeven voor: ${shiftTitre} · End time reported`,
    gabarit(
      'Eindtijd doorgegeven',
      `${kokNaam} geeft aan om <strong>${eindtijd}</strong> te zijn gestopt met de shift <strong>${shiftTitre}</strong>. Bevestig deze eindtijd in de app.`,
      'Bevestig eindtijd',
      'End time reported',
      `${kokNaam} reported finishing the shift <strong>${shiftTitre}</strong> at <strong>${eindtijd}</strong>. Please confirm this end time in the app.`,
      'Confirm end time',
      `${baseUrl()}/shifts/${shiftId}`
    )
  )
}

// 6. Chef : l'horeca a confirmé l'heure de fin
export async function emailEindtijdBevestigd(kokEmail: string, shiftId: string, shiftTitre: string, eindtijd: string) {
  return envoyerEmail(
    kokEmail,
    `Eindtijd bevestigd voor: ${shiftTitre} · End time confirmed`,
    gabarit(
      'Eindtijd bevestigd',
      `De horeca heeft je eindtijd van <strong>${eindtijd}</strong> voor de shift <strong>${shiftTitre}</strong> bevestigd.`,
      'Bekijk shift',
      'End time confirmed',
      `The business confirmed your end time of <strong>${eindtijd}</strong> for the shift <strong>${shiftTitre}</strong>.`,
      'View shift',
      `${baseUrl()}/shifts/${shiftId}`
    )
  )
}

// 7. Rappel : le chef n'a pas encore déclaré son heure de fin
export async function emailRappelEindtijdChef(kokEmail: string, shiftId: string, shiftTitre: string) {
  return envoyerEmail(
    kokEmail,
    `Herinnering: geef je eindtijd door · ${shiftTitre}`,
    gabarit(
      'Vergeet je eindtijd niet',
      `Je hebt de shift <strong>${shiftTitre}</strong> gewerkt maar nog geen eindtijd doorgegeven. Geef ze door zodat de betaling kan starten.`,
      'Eindtijd doorgeven',
      "Don't forget your end time",
      `You worked the shift <strong>${shiftTitre}</strong> but haven't reported your end time yet. Report it so payment can start.`,
      'Report end time',
      `${baseUrl()}/shifts/${shiftId}`
    )
  )
}

// Shift expire : la date est passee sans kok choisi.

export async function emailShiftVerlopenHoreca(horecaEmail: string, shiftTitre: string, datum: string, aantalKandidaten: number) {
  const nlKand = aantalKandidaten > 0
    ? `Er ${aantalKandidaten === 1 ? 'was 1 kandidaat' : `waren ${aantalKandidaten} kandidaten`}, maar er is geen kok gekozen.`
    : 'Er hebben zich geen koks aangemeld.'
  const enKand = aantalKandidaten > 0
    ? `There ${aantalKandidaten === 1 ? 'was 1 applicant' : `were ${aantalKandidaten} applicants`}, but no chef was selected.`
    : 'No chefs applied.'
  return envoyerEmail(
    horecaEmail,
    `Shift verlopen \u00b7 ${shiftTitre}`,
    gabarit(
      'Je shift is verlopen',
      `De shift <strong>${shiftTitre}</strong> van ${datum} is voorbij. ${nlKand} Plaats hem opnieuw met een andere datum of een hoger tarief.`,
      'Nieuwe shift plaatsen',
      'Your shift has expired',
      `The shift <strong>${shiftTitre}</strong> on ${datum} has passed. ${enKand} Post it again with a different date or a higher rate.`,
      'Post a new shift',
      `${baseUrl()}/shifts/new`
    )
  )
}

export async function emailShiftVerlopenKok(kokEmail: string, shiftTitre: string, datum: string) {
  return envoyerEmail(
    kokEmail,
    `Shift niet ingevuld \u00b7 ${shiftTitre}`,
    gabarit(
      'Deze shift is niet doorgegaan',
      `De shift <strong>${shiftTitre}</strong> van ${datum} is verlopen zonder dat er een kok is gekozen. Je aanmelding vervalt. Er staan andere shifts open.`,
      'Open shifts bekijken',
      'This shift did not go ahead',
      `The shift <strong>${shiftTitre}</strong> on ${datum} expired without a chef being selected. Your application has lapsed. Other shifts are available.`,
      'View open shifts',
      `${baseUrl()}/shifts`
    )
  )
}

// 8. Rappel : l'horeca n'a pas encore confirmé l'heure de fin
export async function emailRappelEindtijdHoreca(horecaEmail: string, shiftId: string, shiftTitre: string) {
  return envoyerEmail(
    horecaEmail,
    `Herinnering: bevestig de eindtijd · ${shiftTitre}`,
    gabarit(
      'Bevestig de gewerkte uren',
      `De shift <strong>${shiftTitre}</strong> is afgelopen. Bevestig de eindtijd in de app zodat de betaling kan plaatsvinden.`,
      'Eindtijd bevestigen',
      'Confirm the worked hours',
      `The shift <strong>${shiftTitre}</strong> has ended. Confirm the end time in the app so payment can take place.`,
      'Confirm end time',
      `${baseUrl()}/shifts/${shiftId}`
    )
  )
}

// 9. Bienvenue : nouveau chef inscrit
export async function emailBienvenueChef(kokEmail: string) {
  const stappenNl =
    stap('1', 'Maak je profiel compleet', 'Vul je ervaring, functies en specialiteiten in en voeg je KvK- en HACCP-gegevens toe. Een geverifieerd profiel krijgt tot 3x meer reacties.') +
    stap('2', 'Reageer op shifts bij jou in de buurt', 'Reageer met jouw tarief (minimaal €14,06 per uur). De horecazaak kiest, daarna staat de shift vast.') +
    stap('3', 'Werk en ontvang je geld', 'Betaling loopt veilig via het platform met iDEAL. Geef na je shift je eindtijd door; zodra die is bevestigd, wordt je geld overgemaakt.')
  const stappenEn =
    stap('1', 'Complete your profile', 'Add your experience, roles and specialties plus your KvK and HACCP details. A verified profile gets up to 3x more responses.') +
    stap('2', 'Apply to shifts near you', 'Apply with your own rate (minimum €14.06 per hour). The business chooses, then the shift is locked in.') +
    stap('3', 'Work and get paid', 'Payment runs safely through the platform via iDEAL. Report your end time after the shift; once confirmed, your money is transferred.')
  return envoyerEmail(
    kokEmail,
    'Welkom bij ChefShift, chef! · Welcome to ChefShift',
    gabaritBienvenue(
      'Welkom aan boord, chef!',
      'Je account is aangemaakt. Vanaf nu vind je op ChefShift shifts bij restaurants en hotels in heel Nederland, zonder uitzendbureau ertussen. Jij bepaalt waar, wanneer en voor welk tarief je werkt. Zo start je in 3 stappen:',
      stappenNl,
      'Bekijk beschikbare shifts',
      'Tip: activeer shift-herinneringen in je instellingen. Je krijgt dan een melding 24 uur en 2 uur voor elke bevestigde shift.',
      'Welcome aboard, chef!',
      'Your account has been created. From now on you will find shifts at restaurants and hotels across the Netherlands on ChefShift, with no temp agency in between. You decide where, when and for what rate you work. Get started in 3 steps:',
      stappenEn,
      'Browse available shifts',
      'Tip: enable shift reminders in your settings. You will get a notification 24 hours and 2 hours before each confirmed shift.',
      `${baseUrl()}/shifts`
    )
  )
}

// 10. Bienvenue : nouvelle horecazaak inscrite
export async function emailBienvenueHoreca(horecaEmail: string) {
  const stappenNl =
    stap('1', 'Plaats uw shift', 'Datum, tijden, functie en tarief invullen, klaar. De shift is direct zichtbaar voor koks. Spoed? Markeer de shift als urgent voor extra zichtbaarheid.') +
    stap('2', 'Kies zelf wie er komt werken', 'U ontvangt sollicitaties met profiel, ervaring en beoordelingen. Alle koks zijn gecontroleerd op KvK-inschrijving en HACCP-certificering. U kiest.') +
    stap('3', 'Betaal veilig achteraf', 'De kok geeft na de shift de gewerkte eindtijd door, u bevestigt en u betaalt veilig via iDEAL. Alles staat vastgelegd voor uw administratie. No cure, no pay.')
  const stappenEn =
    stap('1', 'Post your shift', 'Enter date, times, role and rate, done. The shift is instantly visible to chefs. In a hurry? Mark it as urgent for extra visibility.') +
    stap('2', 'You choose who comes to work', 'You receive applications with profile, experience and reviews. All chefs are checked for KvK registration and HACCP certification. You decide.') +
    stap('3', 'Pay safely afterwards', 'The chef reports the worked end time, you confirm and pay safely via iDEAL. Everything is recorded for your administration. No cure, no pay.')
  return envoyerEmail(
    horecaEmail,
    'Welkom bij ChefShift! Plaats uw eerste shift in 1 minuut',
    gabaritBienvenue(
      'Welkom bij ChefShift',
      'Uw account is aangemaakt. Vanaf nu plaatst u in 1 minuut een shift en ontvangt u binnen enkele uren reacties van geverifieerde zzp-koks bij u in de buurt. Zo werkt het:',
      stappenNl,
      'Plaats uw eerste shift',
      'Tip: beoordeel uw kok na elke shift. Zo helpt u collega-ondernemers en bouwt u een eigen netwerk van betrouwbare koks op.',
      'Welcome to ChefShift',
      'Your account has been created. From now on you can post a shift in 1 minute and receive responses from verified freelance chefs near you within hours. This is how it works:',
      stappenEn,
      'Post your first shift',
      'Tip: rate your chef after each shift. You help fellow business owners and build your own network of reliable chefs.',
      `${baseUrl()}/shifts/new`
    )
  )
}

// 11. Propriétaire : nouvelle shift publiée, message prêt à coller dans le groupe WhatsApp
export async function emailShiftVoorWhatsApp(s: {
  shiftId: string
  titel: string
  functie?: string | null
  datum: string // YYYY-MM-DD
  start: string
  eind: string
  tarief: number
  stad?: string
  bedrijf?: string
  urgent?: boolean
}) {
  const link = `${baseUrl()}/shifts/${s.shiftId}`
  let datumMooi = s.datum
  try {
    datumMooi = new Date(`${s.datum}T00:00:00Z`).toLocaleDateString('nl-NL', {
      weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
    })
  } catch {}

  const regels = [
    s.urgent ? '🔥 SPOEDSHIFT op ChefShift!' : '🔪 Nieuwe shift op ChefShift!',
    '',
    `👨‍🍳 ${s.functie || s.titel}${s.bedrijf ? ` bij ${s.bedrijf}` : ''}`,
    s.stad ? `📍 ${s.stad}` : '',
    `📅 ${datumMooi}`,
    `🕐 ${s.start} - ${s.eind}`,
    `💶 €${s.tarief}/u`,
    '',
    `Reageer direct: ${link}`,
  ].filter((l) => l !== '')

  const bericht = regels.join('\n')
  const berichtHtml = esc(bericht)
    .split('\n')
    .map((l) => `<p style="margin:0 0 4px">${l}</p>`)
    .join('')

  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f6f7f2;padding:32px 16px">
  <div style="background:#ffffff;border:1px solid #eceee3;border-radius:16px;padding:32px">
    ${logoHtml()}
    <h1 style="font-size:21px;color:#23281f;margin:28px 0 12px;font-family:Arial,sans-serif">Nieuwe shift geplaatst ✅</h1>
    <p style="font-size:15px;line-height:1.7;color:#4a5044;margin:0 0 18px">
      Copie le message ci-dessous et colle-le dans le groupe WhatsApp des chefs. Le lien renvoie directement vers la shift.
    </p>
    <div style="background:#f6f7f2;border:1.5px solid #dfe4d4;border-radius:12px;padding:16px 18px;font-size:14.5px;line-height:1.55;color:#23281f">${berichtHtml}</div>
    <a href="${link}" style="display:inline-block;margin-top:22px;background:#46553c;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:999px;font-weight:700;font-size:14px">Bekijk de shift</a>
  </div>
  <p style="font-size:12px;color:#9aa39b;text-align:center;margin-top:16px;line-height:1.6">
    ChefShift · Alleen zichtbaar voor jou als beheerder
  </p>
</div>`

  return envoyerEmail(
    OWNER_EMAIL,
    `WhatsApp-bericht klaar: ${s.titel}${s.stad ? ` (${s.stad})` : ''}`,
    html
  )
}
