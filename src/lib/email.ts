import { Resend } from 'resend'

// Expéditeur : remplacé par noreply@chefshift.nl une fois le domaine vérifié dans Resend
const FROM = (process.env.EMAIL_FROM || 'ChefShift <onboarding@resend.dev>').trim()

export function baseUrl(): string {
  return (process.env.NEXTAUTH_URL || 'https://chefshift-git-main-freelance23.vercel.app').trim().replace(/\/+$/, '')
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

// Gabarit commun aux emails ChefShift
function gabarit(titre: string, corps: string, url: string, bouton: string): string {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f6f7f2;padding:32px 16px">
  <div style="background:#fff;border:1px solid #eceee3;border-radius:16px;padding:32px">
    <div style="font-size:20px;font-weight:800;color:#23281f">Chef<span style="color:#5f7052">Shift</span></div>
    <h1 style="font-size:21px;color:#23281f;margin:24px 0 12px">${titre}</h1>
    <p style="font-size:15px;line-height:1.7;color:#4a5044;margin:0">${corps}</p>
    <a href="${url}" style="display:inline-block;margin-top:22px;background:#46553c;color:#fff;text-decoration:none;padding:12px 26px;border-radius:999px;font-weight:700;font-size:14px">${bouton}</a>
  </div>
  <p style="font-size:12px;color:#9aa39b;text-align:center;margin-top:16px">© 2026 ChefShift</p>
</div>`
}

// 1. Horeca : nouvelle candidature reçue
export async function emailNouvelleCandidature(horecaEmail: string, shiftId: string, shiftTitre: string, kokNaam: string) {
  return envoyerEmail(
    horecaEmail,
    `Nieuwe kandidaat voor: ${shiftTitre}`,
    gabarit(
      'Nieuwe kandidaat',
      `${kokNaam} heeft gereageerd op je shift <strong>${shiftTitre}</strong>. Bekijk het profiel en kies je kok.`,
      `${baseUrl()}/shifts/${shiftId}`,
      'Bekijk kandidaat'
    )
  )
}

// 2. Chef : choisi pour un shift
export async function emailShiftBevestigd(kokEmail: string, shiftId: string, shiftTitre: string, datum: string) {
  return envoyerEmail(
    kokEmail,
    `Je bent gekozen voor: ${shiftTitre}`,
    gabarit(
      'Shift bevestigd!',
      `Gefeliciteerd, je bent gekozen voor de shift <strong>${shiftTitre}</strong> op <strong>${datum}</strong>. Je ontvangt een herinnering 24 uur en 2 uur voor aanvang.`,
      `${baseUrl()}/dashboard`,
      'Bekijk mijn shifts'
    )
  )
}

// 3. Chef : paiement reçu
export async function emailBetalingOntvangen(kokEmail: string, shiftTitre: string, bedrag: number) {
  return envoyerEmail(
    kokEmail,
    `Betaling ontvangen voor: ${shiftTitre}`,
    gabarit(
      'Betaling ontvangen',
      `De horeca heeft betaald voor de shift <strong>${shiftTitre}</strong>. Jouw uitbetaling van <strong>€${bedrag.toFixed(2)}</strong> wordt overgemaakt naar je rekening.`,
      `${baseUrl()}/dashboard`,
      'Naar dashboard'
    )
  )
}
