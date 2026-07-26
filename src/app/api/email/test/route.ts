import { NextRequest, NextResponse } from 'next/server'

// GET /api/email/test?secret=<CRON_SECRET>&to=<email>
// Diagnostic : tente un envoi via Resend et renvoie la réponse exacte de l'API
export async function GET(req: NextRequest) {
  const secret = (process.env.CRON_SECRET || '').trim()
  if (secret && req.nextUrl.searchParams.get('secret') !== secret) {
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
