'use client'

import { useEffect, useState } from 'react'

export type Lang = 'nl' | 'en'

const LANG_EVENT = 'chefshift-lang-change'

function readLang(): Lang {
  if (typeof window === 'undefined') return 'nl'
  const l = localStorage.getItem('chefshift-lang')
  return l === 'en' ? 'en' : 'nl'
}

const dict = {
  nl: {
    nav_login: 'Inloggen',
    nav_register: 'Account aanmaken',
    nav_logout: 'Uitloggen',
    hero_badge: 'Platform voor ZZP-koks en horeca',
    hero_title_a: 'De juiste chef,',
    hero_title_b: 'op het juiste moment.',
    hero_sub: 'Vind geverifieerde zzp-koks voor jouw shift, of vind als kok de leukste keukens van Nederland. Snel, veilig en zonder gedoe.',
    hero_cta1: 'Gratis starten',
    hero_cta2: 'Inloggen',
    steps_over: 'Zo werkt het',
    steps_title: 'In drie stappen geregeld',
    steps_sub: 'Geen uitzendbureau, geen eindeloos zoeken. ChefShift brengt keukens en koks direct bij elkaar.',
    step1_t: 'Maak je profiel',
    step1_d: 'Registreer als horecazaak of als zzp-kok. Verificatie met KvK en HACCP inbegrepen.',
    step2_t: 'Plaats of vind een shift',
    step2_d: 'Zet een shift online of reageer direct op een opdracht die bij jou past.',
    step3_t: 'Werk en betaal veilig',
    step3_d: 'Afspraken en betalingen lopen via het platform, met iDEAL. Zekerheid voor beide kanten.',
    why_over: 'Waarom ChefShift',
    why_title: 'Gemaakt voor de horeca',
    feat1_t: 'Snelle matching',
    feat1_d: 'Een shift geplaatst? Gemiddeld binnen 2 uur de eerste reacties van beschikbare koks.',
    feat2_t: 'Geverifieerde koks',
    feat2_d: 'Elke kok wordt gecontroleerd op KvK-inschrijving en HACCP-certificering.',
    feat3_t: 'Veilig betalen',
    feat3_d: 'Betalingen via iDEAL, vastgelegd in het platform. No cure, no pay.',
    banner_title: 'Klaar om je eerste shift te vullen?',
    banner_sub: 'Maak vandaag nog een gratis account aan.',
    banner_cta: 'Account aanmaken',
    footer_tag: 'Het platform voor zzp-koks en horecazaken in Nederland.',
    footer_rights: '© 2026 ChefShift — Gemaakt voor de horeca.',
    login_title: 'Inloggen',
    login_sub: 'Welkom terug in de keuken.',
    login_noaccount: 'Nog geen account? Registreren',
    login_error: 'E-mailadres of wachtwoord onjuist',
    field_email: 'E-mailadres',
    field_password: 'Wachtwoord',
    register_title: 'Account aanmaken',
    register_sub: 'Gratis aanmelden in 1 minuut.',
    register_have: 'Al een account? Inloggen',
    role_kok_t: 'Ik ben kok',
    role_kok_d: 'Ik zoek shifts',
    role_horeca_t: 'Ik ben horeca',
    role_horeca_d: 'Ik zoek koks',
    field_name: 'Naam',
    field_contact: 'Contactpersoon',
    field_company: 'Bedrijfsnaam',
    field_kvk: 'KvK-nummer',
    register_kvk_required: 'KvK-nummer is verplicht',
    register_email_used: 'Dit e-mailadres is al geregistreerd',
    register_fail: 'Registreren is niet gelukt. Probeer het opnieuw.',
    register_error: 'Er ging iets mis. Probeer het later opnieuw.',
    form_submit: 'Account aanmaken',
    form_loading: 'Bezig...',
    dash_loading: 'Laden...',
    dash_welcome: 'Welkom terug',
    dash_kok_sub: 'Dit is jouw kok-omgeving: vind shifts en beheer je opdrachten.',
    dash_horeca_sub: 'Dit is jouw horeca-omgeving: plaats shifts en vind koks.',
    dash_admin_sub: 'ChefShift beheerdersomgeving.',
    dash_default_sub: 'Dit is jouw ChefShift-omgeving.',
    stat_kok_1: 'Aankomende shifts',
    stat_kok_2: 'Afgeronde opdrachten',
    stat_kok_3: 'Omzet deze maand',
    stat_hor_1: 'Geplaatste shifts',
    stat_hor_2: 'Ontvangen sollicitaties',
    stat_hor_3: 'Ingehuurde koks',
    action_kok_t: 'Klaar voor je volgende shift?',
    action_kok_d: 'Bekijk beschikbare shifts bij jou in de buurt.',
    action_kok_btn: 'Zoek shifts',
    action_hor_t: 'Een kok nodig?',
    action_hor_d: 'Plaats een shift en ontvang sollicitaties van geverifieerde koks.',
    action_hor_btn: 'Nieuwe shift plaatsen',
    list_kok: 'Beschikbare shifts',
    list_other: 'Mijn shifts',
    empty_api: 'Shifts zijn nog niet beschikbaar — dit onderdeel wordt binnenkort gebouwd.',
    empty_none: 'Nog geen shifts. Kom later terug!',
    // Shifts
    shifts_title: 'Beschikbare shifts',
    shifts_sub: 'Reageer direct op een shift die bij jou past.',
    shifts_my: 'Mijn shifts',
    shifts_new: 'Nieuwe shift plaatsen',
    shifts_new_sub: 'Vul de gegevens in — de shift is direct zichtbaar voor koks.',
    field_shift_title: 'Titel',
    field_function: 'Functie',
    field_date: 'Datum',
    field_start: 'Starttijd',
    field_end: 'Eindtijd',
    field_rate: 'Uurtarief (€)',
    field_city: 'Plaats',
    field_urgent: 'Dit is een spoedshift',
    shift_submit: 'Shift plaatsen',
    shift_fail: 'Shift plaatsen is mislukt. Probeer het opnieuw.',
    back_dashboard: '← Terug naar dashboard',
    urgent: 'Spoed',
    applications: 'sollicitaties',
    apply_btn: 'Reageren',
    empty_shifts: 'Nog geen shifts beschikbaar. Kom later terug!',
    total: 'Totaal',
  },
  en: {
    nav_login: 'Log in',
    nav_register: 'Sign up',
    nav_logout: 'Log out',
    hero_badge: 'Platform for freelance chefs & hospitality',
    hero_title_a: 'The right chef,',
    hero_title_b: 'at the right time.',
    hero_sub: 'Find verified freelance chefs for your shift, or discover the best kitchens in the Netherlands as a chef. Fast, safe and hassle-free.',
    hero_cta1: 'Get started free',
    hero_cta2: 'Log in',
    steps_over: 'How it works',
    steps_title: 'Sorted in three steps',
    steps_sub: 'No temp agency, no endless searching. ChefShift connects kitchens and chefs directly.',
    step1_t: 'Create your profile',
    step1_d: 'Register as a hospitality business or as a freelance chef. KvK and HACCP verification included.',
    step2_t: 'Post or find a shift',
    step2_d: 'Put a shift online or apply directly to a job that suits you.',
    step3_t: 'Work and get paid safely',
    step3_d: 'Agreements and payments run through the platform, with iDEAL. Security for both sides.',
    why_over: 'Why ChefShift',
    why_title: 'Built for hospitality',
    feat1_t: 'Fast matching',
    feat1_d: 'Posted a shift? On average the first responses from available chefs within 2 hours.',
    feat2_t: 'Verified chefs',
    feat2_d: 'Every chef is checked for KvK registration and HACCP certification.',
    feat3_t: 'Safe payments',
    feat3_d: 'Payments via iDEAL, recorded in the platform. No cure, no pay.',
    banner_title: 'Ready to fill your first shift?',
    banner_sub: 'Create a free account today.',
    banner_cta: 'Sign up',
    footer_tag: 'The platform for freelance chefs and hospitality businesses in the Netherlands.',
    footer_rights: '© 2026 ChefShift — Built for hospitality.',
    login_title: 'Log in',
    login_sub: 'Welcome back to the kitchen.',
    login_noaccount: 'No account yet? Sign up',
    login_error: 'Incorrect email or password',
    field_email: 'Email address',
    field_password: 'Password',
    register_title: 'Create account',
    register_sub: 'Sign up free in 1 minute.',
    register_have: 'Already have an account? Log in',
    role_kok_t: "I'm a chef",
    role_kok_d: "I'm looking for shifts",
    role_horeca_t: "I'm a business",
    role_horeca_d: "I'm looking for chefs",
    field_name: 'Name',
    field_contact: 'Contact person',
    field_company: 'Company name',
    field_kvk: 'KvK number',
    register_kvk_required: 'KvK number is required',
    register_email_used: 'This email address is already registered',
    register_fail: 'Registration failed. Please try again.',
    register_error: 'Something went wrong. Please try again later.',
    form_submit: 'Create account',
    form_loading: 'Working...',
    dash_loading: 'Loading...',
    dash_welcome: 'Welcome back',
    dash_kok_sub: 'This is your chef space: find shifts and manage your gigs.',
    dash_horeca_sub: 'This is your business space: post shifts and find chefs.',
    dash_admin_sub: 'ChefShift admin area.',
    dash_default_sub: 'This is your ChefShift space.',
    stat_kok_1: 'Upcoming shifts',
    stat_kok_2: 'Completed gigs',
    stat_kok_3: 'Revenue this month',
    stat_hor_1: 'Posted shifts',
    stat_hor_2: 'Applications received',
    stat_hor_3: 'Chefs hired',
    action_kok_t: 'Ready for your next shift?',
    action_kok_d: 'Browse available shifts near you.',
    action_kok_btn: 'Find shifts',
    action_hor_t: 'Need a chef?',
    action_hor_d: 'Post a shift and receive applications from verified chefs.',
    action_hor_btn: 'Post a new shift',
    list_kok: 'Available shifts',
    list_other: 'My shifts',
    empty_api: 'Shifts are not available yet — this part is being built.',
    empty_none: 'No shifts yet. Check back later!',
    shifts_title: 'Available shifts',
    shifts_sub: 'Apply directly to a shift that suits you.',
    shifts_my: 'My shifts',
    shifts_new: 'Post a new shift',
    shifts_new_sub: 'Fill in the details — the shift is instantly visible to chefs.',
    field_shift_title: 'Title',
    field_function: 'Function',
    field_date: 'Date',
    field_start: 'Start time',
    field_end: 'End time',
    field_rate: 'Hourly rate (€)',
    field_city: 'City',
    field_urgent: 'This is an urgent shift',
    shift_submit: 'Post shift',
    shift_fail: 'Failed to post shift. Please try again.',
    back_dashboard: '← Back to dashboard',
    urgent: 'Urgent',
    applications: 'applications',
    apply_btn: 'Apply',
    empty_shifts: 'No shifts available yet. Check back later!',
    total: 'Total',
  },
} as const

export type Key = keyof typeof dict.nl

export function useT() {
  const [lang, setLangState] = useState<Lang>('nl')

  useEffect(() => {
    setLangState(readLang())
    const handler = () => setLangState(readLang())
    window.addEventListener(LANG_EVENT, handler)
    return () => window.removeEventListener(LANG_EVENT, handler)
  }, [])

  function setLang(l: Lang) {
    localStorage.setItem('chefshift-lang', l)
    window.dispatchEvent(new Event(LANG_EVENT))
  }

  function t(key: Key): string {
    return dict[lang][key]
  }

  return { lang, setLang, t }
}

export function LangToggle({ clair }: { clair?: boolean }) {
  const { lang, setLang } = useT()
  const base: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    fontWeight: 800, fontSize: 12, letterSpacing: 1, padding: '4px 6px',
  }
  const actif = clair ? '#fff' : '#5f7052'
  const inactif = clair ? 'rgba(255,255,255,0.55)' : '#9aa39b'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      <button type="button" style={{ ...base, color: lang === 'nl' ? actif : inactif }} onClick={() => setLang('nl')}>NL</button>
      <span style={{ color: inactif }}>·</span>
      <button type="button" style={{ ...base, color: lang === 'en' ? actif : inactif }} onClick={() => setLang('en')}>EN</button>
    </span>
  )
}
