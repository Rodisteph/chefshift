import { NextRequest, NextResponse } from 'next/server'
import {
  emailNouvelleCandidature,
  emailShiftBevestigd,
  emailBetalingOntvangen,
  emailRappelShift,
  emailBienvenueChef,
  emailBienvenueHoreca,
} from '@/lib/email'

const POSTS: Record<string, { sujet: string; img: string; fichier: string; texte: string }> = {
  '1': {
    sujet: 'Post Facebook 1 prêt à publier (groupes de chefs)',
    img: 'https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2F1141ad18bf359f74859ff5eaf383f3b086aaae388ea6c85274e16fd9ac221d66?filename=Post+Facebook+1+-+chef+freelance+%28logo%29.jpg&sig=TOilzPyTJidp5rjzDmCest3h8VPP-z3BgUE1VluFtnE=&t=o',
    fichier: 'post-facebook-chefs.jpg',
    texte: 'Hoi koks! 👋\n\nIk ben Rodrigo en ik heb ChefShift gelanceerd: een platform waar je als zzp-kok zelf je shifts kiest bij restaurants en hotels in jouw regio.\n\n✅ Jij bepaalt je tarief\n✅ Je kiest waar en wanneer je werkt\n✅ Betaling loopt veilig via iDEAL\n✅ Geen uitzendbureau ertussen\n\nAanmelden kost 1 minuut en is gratis:\n👉 www.chefshift.nl\n\nWie heeft er zin in een proefshift? Stuur me gerust een bericht, ik help je op weg.',
  },
  '2': {
    sujet: 'Post Facebook 2 prêt à publier (groupes horeca + LinkedIn)',
    img: 'https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2Fd4ec50ec6bfa44f2c0c520d00f211e09bfdd55f65bd6ada8f7a2d6a507660987?filename=Post+Facebook+2+-+restaurant+et+chef+%28logo%29.jpg&sig=x4EHjtlz7w2d4o3guALsy7JvjeiIBCdV-6V1xzHcvzA=&t=o',
    fichier: 'post-facebook-horeca.jpg',
    texte: 'Horeca-ondernemers: herkenbaar? 👨‍🍳\n\nIemand valt uit op vrijdagavond en er is niemand om in te springen.\n\nMet ChefShift vind je binnen een paar uur een geverifieerde zzp-kok:\n✅ Shift plaatsen kost 1 minuut\n✅ Koks geverifieerd op KvK en HACCP\n✅ Jij kiest zelf wie er komt werken\n✅ Betaling veilig via iDEAL\n✅ No cure, no pay\n\nGeen uitzendbureau, geen 30% commissie.\nMaak gratis een account: 👉 www.chefshift.nl\n\nVragen? Reageer hieronder of stuur me een bericht, ik lees alles.',
  },
  '3': {
    sujet: 'Post Facebook 3 prêt à publier (semaine 2 — groupes de chefs)',
    img: 'https://www.kimi.com/apiv2-files/sign-obj/kimi-fs%2Ffiles%2Fblob%2F166b35ed5bd114f604dc4e916e85489ae727d7d4ea25eace205cf479afb26060?filename=Post+Facebook+3+-+chefs+semaine+2+%28logo%29.jpg&sig=UhgiKQLdZH9OR6APPRLIJ3dkwApphN60ulhKxurthxo=&t=o',
    fichier: 'post-facebook-semaine2.jpg',
    texte: 'Vraag aan alle zzp-koks hier: 👨‍🍳\n\nWaar werkte jij deze maand het liefst? En tegen welk tarief?\n\nOp ChefShift bepaal je dat helemaal zelf:\n✅ Kies je eigen shifts bij restaurants en hotels\n✅ Stel je eigen tarief in (min. €14,06/u)\n✅ Ontvang je geld veilig via iDEAL\n✅ Beoordeel en word beoordeeld, zo groeit je reputatie\n\nGratis aanmelden in 1 minuut:\n👉 www.chefshift.nl\n\nDeel deze post met een kok die dit verdient! 🙌',
  },
}

// GET /api/email/test?secret=<CRON_SECRET>&to=<email>[&mode=mix|bienvenue][&mode=post&which=1|2|3]
export async function GET(req: NextRequest) {
  const secret = (process.env.CRON_SECRET || '').trim()
  // Fermé par défaut : sans secret configuré, l'endpoint reste inaccessible
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

  const from = (process.env.EMAIL_FROM || 'ChefShift <onboarding@resend.dev>').trim()

  // ===== Envoi des deux e-mails de bienvenue (chef + horeca) =====
  if (req.nextUrl.searchParams.get('mode') === 'bienvenue') {
    const r1 = await emailBienvenueChef(to)
    const r2 = await emailBienvenueHoreca(to)
    return NextResponse.json({ ok: r1.ok && r2.ok, chef: r1.ok, horeca: r2.ok })
  }

  // ===== Envoi d'un post prêt à publier (image jointe + texte à coller) =====
  if (req.nextUrl.searchParams.get('mode') === 'post') {
    const which = req.nextUrl.searchParams.get('which') || '1'
    const post = POSTS[which]
    if (!post) {
      return NextResponse.json({ ok: false, erreur: 'which doit valoir 1, 2 ou 3' })
    }
    const texteHtml = post.texte
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .split('\n')
      .map((l) => (l.trim() === '' ? '<br>' : `<p style="margin:0 0 4px">${l}</p>`))
      .join('')
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#23281f">
        <h2 style="font-size:18px">Ton post est prêt 🚀</h2>
        <ol style="font-size:14px;line-height:1.6;padding-left:20px">
          <li>Télécharge l'image ci-dessous (clic droit &gt; enregistrer, ou pièce jointe)</li>
          <li>Copie le texte dans le cadre</li>
          <li>Sur Facebook : crée un post, ajoute l'image, colle le texte, publie</li>
        </ol>
        <h3 style="font-size:15px;margin:22px 0 8px">1. L'image</h3>
        <img src="${post.img}" alt="Visuel du post" style="width:100%;border-radius:12px;display:block">
        <h3 style="font-size:15px;margin:22px 0 8px">2. Le texte à coller</h3>
        <div style="background:#f6f7f2;border:1.5px solid #dfe4d4;border-radius:12px;padding:16px 18px;font-size:14.5px;line-height:1.55">${texteHtml}</div>
      </div>`
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [to],
          subject: post.sujet,
          html,
          attachments: [{ path: post.img, filename: post.fichier }],
        }),
      })
      const data = await res.json().catch(() => ({}))
      return NextResponse.json({ ok: res.ok, statut: res.status, post: which, reponseResend: data })
    } catch (e: any) {
      return NextResponse.json({ ok: false, etape: 'fetch', erreur: e?.message || 'network error' })
    }
  }

  // ===== Série complète de démonstration =====
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

  // ===== Envoi simple de diagnostic =====
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
