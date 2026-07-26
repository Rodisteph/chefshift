'use client'

import { LangToggle } from '@/lib/i18n'
import AnimStyles from '@/components/AnimStyles'

const FONT = '"Sora","Inter","Helvetica Neue",Arial,sans-serif'

const artikelen: { titre: string; tekst: string }[] = [
  {
    titre: '1. Wie zijn wij',
    tekst: 'ChefShift is een online platform dat zelfstandige koks (ZZP\u2019ers) en horecaondernemingen met elkaar verbindt. ChefShift is verwerkingsverantwoordelijke voor de persoonsgegevens die via het platform worden verzameld.',
  },
  {
    titre: '2. Welke gegevens wij verzamelen',
    tekst: 'Accountgegevens: naam, e-mailadres, wachtwoord (versleuteld). Profielgegevens koks: geboortedatum, woonplaats, werkervaring, functies, specialiteiten, certificeringen (HACCP/SVH), tarieven, KvK-nummer en IBAN. Bedrijfsgegevens horeca: bedrijfsnaam, contactpersoon, KvK-nummer. Gebruiksgegevens: shifts, sollicitaties, beoordelingen, betalingsstatus.',
  },
  {
    titre: '3. Waarvoor wij gegevens gebruiken',
    tekst: 'Wij gebruiken je gegevens uitsluitend voor: het aanmaken en beheren van je account; het matchen van koks en horecaondernemingen; het verwerken van betalingen en facturen; het tonen van profielen en beoordelingen aan de tegenpartij; wettelijke verplichtingen (zoals fiscale bewaarplicht). Wij verkopen je gegevens nooit aan derden.',
  },
  {
    titre: '4. Rechtsgrond',
    tekst: 'De verwerking is gebaseerd op: uitvoering van de overeenkomst (account, matching, betalingen); gerechtvaardigd belang (platformveiligheid, verbetering); wettelijke verplichting (belasting- en boekhoudwetgeving); en waar nodig jouw toestemming.',
  },
  {
    titre: '5. Delen met derden',
    tekst: 'Wij delen gegevens alleen met: de tegenpartij (horeca ziet het profiel van de kok, de kok ziet de bedrijfsnaam); onze betaaldienstverlener Stripe (voor betalingen en uitbetalingen); hosting- en infrastructuurleveranciers (Vercel, Railway) — altijd met een verwerkersovereenkomst.',
  },
  {
    titre: '6. Bewaartermijnen',
    tekst: 'Account- en profielgegevens bewaren wij zolang je account actief is. Factuur- en betalingsgegevens bewaren wij 7 jaar conform de fiscale bewaarplicht. Beoordelingen blijven zichtbaar zolang het profiel bestaat.',
  },
  {
    titre: '7. Beveiliging',
    tekst: 'Wij treffen passende technische en organisatorische maatregelen, waaronder versleutelde verbindingen (HTTPS), versleutelde wachtwoorden en beperkte toegang tot gegevens.',
  },
  {
    titre: '8. Jouw rechten (AVG)',
    tekst: 'Je hebt recht op: inzage in je gegevens; correctie of verwijdering; beperking van de verwerking; overdraagbaarheid van je gegevens (dataportabiliteit); bezwaar tegen verwerking. Stuur een verzoek via het platform. Wij reageren binnen 30 dagen.',
  },
  {
    titre: '9. Cookies',
    tekst: 'ChefShift gebruikt uitsluitend functionele cookies die noodzakelijk zijn voor inloggen en taalvoorkeur. Wij gebruiken geen tracking- of advertentiecookies.',
  },
  {
    titre: '10. Klachten',
    tekst: 'Heb je een klacht over hoe wij met je gegevens omgaan? Neem contact met ons op. Je kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens (autoriteitpersoonsgegevens.nl).',
  },
  {
    titre: '11. Wijzigingen',
    tekst: 'Dit privacybeleid kan worden aangepast. De actuele versie staat altijd op deze pagina. Versie 1.0 — juli 2026.',
  },
]

export default function PrivacyPage() {
  return (
    <main style={{ fontFamily: FONT, background: '#f6f7f2', color: '#23281f', minHeight: '100vh' }}>
      <AnimStyles />
      <nav style={{
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e8ebe0', padding: '13px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <a href="/" style={{ fontWeight: 800, fontSize: 20, color: '#23281f', textDecoration: 'none', letterSpacing: -0.5 }}>
          Chef<span style={{ color: '#5f7052' }}>Shift</span>
        </a>
        <LangToggle />
      </nav>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px 80px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: -1.4, marginBottom: 8 }}>
          Privacybeleid
        </h1>
        <p style={{ color: '#6b7268', marginBottom: 40, fontSize: 15 }}>
          Hoe ChefShift omgaat met jouw persoonsgegevens, conform de AVG (GDPR).
        </p>
        <div style={{ display: 'grid', gap: 20 }}>
          {artikelen.map((a) => (
            <div key={a.titre} className="cs-card" style={{
              background: '#fff', borderRadius: 18, border: '1px solid #eceee3',
              boxShadow: '0 3px 12px rgba(46,52,43,0.05)', padding: 24,
            }}>
              <h2 style={{ fontSize: 16.5, fontWeight: 800, marginBottom: 8, letterSpacing: -0.3 }}>{a.titre}</h2>
              <p style={{ fontSize: 14.5, color: '#4a5048', lineHeight: 1.7 }}>{a.tekst}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 32, fontSize: 12.5, color: '#9aa39b', lineHeight: 1.6 }}>
          Concepttekst — laat dit beleid valideren door een Nederlandse jurist voordat je commercieel lanceert.
        </p>
      </div>
    </main>
  )
}
