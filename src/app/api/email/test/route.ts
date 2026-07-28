import { NextRequest, NextResponse } from 'next/server'
import {
  emailNouvelleCandidature,
  emailShiftBevestigd,
  emailBetalingOntvangen,
  emailRappelShift,
} from '@/lib/email'

// GET /api/email/test?secret=<CRON_SECRET>&to=<email>[&mode=mix]
// Diagnostic : envoi simple (défaut) ou série complète de démonstration (mode=mix)
export async function GET(req: NextRequest) {
  // Fermé par défaut : sans secret configuré, l'endpoint reste inaccessible
  // (évite un relais d'envoi d'emails ouvert au public).
  const secret = (process.env.CRON_SECRET || '').trim()
  if (!secret || req.nextUrl.searchParams.get('secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const key = (process.env.RESEND_API_KEY || '').trim()
  if (!key) {
    return NextResponse.json({ ok: false, etape: 'env', erreur: 'RESEND_API_KEY absente de Vercel (ou non redéployé)' })
  }

  const to = req.nextUrl.searchParams.get('to') || ''
  if (!to) {
    return NextResponse.json({ ok: false, etape: 'param', erreur: 'Ajoute &to=adresse@email.com' })
  }

  // Série complète de démonstration
  if (req.nextUrl.searchParams.get('mode') === 'mix') {
    const resultats: Record<string, boolean> = {}
    const r1 = await emailNouvelleCandidature(to, 'demo', 'Chef de partie avonddienst', 'Mark de Vries')
    resultats.candidature = r1.ok
    const r2 = await emailShiftBevestigd(to, 'demo', 'Chef de partie avonddienst', 'maandag 27 juli')
    resultats.shift_confirme = r2.ok
    const r3 = await emailRappelShift(to, 'demo', 'Chef de partie avonddienst', '24 uur', 'morgen om 18:00')
    resultats.rappel_24h = r3.ok
    const r4 = await emailRappelShift(to, 'demo', 'Chef de partie avonddienst', '2 uur', 'vandaag om 18:00')
    resultats.rappel_2h = r4.ok
    const r5 = await emailBetalingOntvangen(to, 'Chef de partie avonddienst', 312.5)
    resultats.paiement = r5.ok
    return NextResponse.json({ ok: true, envoyes: Object.values(resultats).filter(Boolean).length, resultats })
  }

  // Envoi simple de diagnostic
  const from = (process.env.EMAIL_FROM || 'ChefShift <onboarding@resend.dev>').trim()
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: 'ChefShift - test email',
        html: '<p>Si tu lis ceci, les emails ChefShift fonctionnent.</p>',
      }),
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json({ ok: res.ok, statut: res.status, from, reponseResend: data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, etape: 'fetch', erreur: e?.message || 'network error' })
  }
}
