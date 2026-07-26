import { Resend } from 'resend'

// Expéditeur : noreply@chefshift.nl (domaine vérifié dans Resend)
const FROM = (process.env.EMAIL_FROM || 'ChefShift <onboarding@resend.dev>').trim()

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
