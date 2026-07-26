'use client'

import { LangToggle } from '@/lib/i18n'
import AnimStyles from '@/components/AnimStyles'

const FONT = '"Sora","Inter","Helvetica Neue",Arial,sans-serif'

const artikelen: { titre: string; tekst: string }[] = [
  {
    titre: '1. Definities',
    tekst: '„ChefShift": het online platform, beheerd door de exploitant (ingeschreven bij de Kamer van Koophandel). „Horecaonderneming”: een horecazaak die via het platform een shift plaatst. „Kok”: een zelfstandig ondernemer (ZZP\u2019er) die via het platform op shifts reageert. „Opdracht”: een shift waarvoor de horecaonderneming en de kok een overeenkomst van opdracht sluiten.',
  },
  {
    titre: '2. Rol van het platform',
    tekst: 'ChefShift is uitsluitend een online bemiddelingsplatform. ChefShift brengt horecaondernemingen en zelfstandige koks met elkaar in contact. ChefShift is géén arbeidsbemiddelaar, uitzendbureau of werkgever, en is nimmer partij bij de overeenkomst die tussen horecaonderneming en kok tot stand komt. De uitvoering van de opdracht, de wijze waarop en het resultaat zijn uitsluitend de verantwoordelijkheid van kok en horecaonderneming.',
  },
  {
    titre: '3. Registratie en verificatie',
    tekst: 'Koks registreren zich als zelfstandig ondernemer met een geldig KvK-nummer. Door te registreren verklaart de kok zelfstandig ondernemer te zijn en zelf verantwoordelijk voor belastingen, premies en verzekeringen. Horecaondernemingen registreren zich met hun bedrijfsgegevens. ChefShift mag accounts weigeren of verwijderen bij oneigenlijk gebruik.',
  },
  {
    titre: '4. Totstandkoming van de overeenkomst van opdracht',
    tekst: 'Zodra een horecaonderneming een kok voor een shift kiest, komt rechtstreeks tussen horecaonderneming en kok een overeenkomst van opdracht tot stand. De kok bepaalt zelf of hij/zij op een shift reageert; er bestaat geen gezag, leiding of toezicht zoals bij een arbeidsovereenkomst. Partijen zijn zelf verantwoordelijk voor de naleving van de Wet DBA.',
  },
  {
    titre: '5. Vergoeding en betaling',
    tekst: 'De horecaonderneming betaalt de overeengekomen vergoeding via het betalingssysteem van het platform, na afronding van de shift. Betalingen worden verwerkt door een externe betaaldienstverlener (Stripe). ChefShift houdt een servicecommissie in van 12% over de vergoeding, vermeerderd met 21% btw. De commissie wordt automatisch verrekend; het restant wordt aan de kok uitbetaald.',
  },
  {
    titre: '6. Annulering',
    tekst: 'Een horecaonderneming kan een bevestigde shift annuleren zolang deze niet is betaald. Bij annulering door de horecaonderneming binnen 24 uur voor aanvang van de shift kan de kok een redelijke vergoeding claimen, rechtstreeks bij de horecaonderneming. ChefShift is geen partij bij annuleringsgeschillen.',
  },
  {
    titre: '7. Verantwoordelijkheden van de kok',
    tekst: 'De kok werkt als zelfstandig ondernemer, bepaalt zelf zijn tarief en beschikbaarheid, en is verantwoordelijk voor: correcte btw-aangifte en inkomstenbelasting; een geldige HACCP-hygiënecode of vergelijkbare certificering; eigen arbeidsongeschiktheids- en aansprakelijkheidsverzekering; professioneel en veilig werken conform de hygiëneregels van de horecalocatie.',
  },
  {
    titre: '8. Verantwoordelijkheden van de horecaonderneming',
    tekst: 'De horecaonderneming zorgt voor een veilige werkomgeving conform de Arbowet, juiste shiftgegevens (tijden, taken, vergoeding) en tijdige betaling. De horecaonderneming verklaart dat de inhuur van de kok past binnen de regels voor zelfstandige inhuur (Wet DBA) en dat er geen sprake is van schijnzelfstandigheid.',
  },
  {
    titre: '9. Aansprakelijkheid',
    tekst: 'ChefShift is niet aansprakelijk voor schade ontstaan tijdens of door de uitvoering van een opdracht, waaronder persoonlijk letsel, materiële schade, kwaliteit van het werk, annuleringen of betalingsgeschillen tussen partijen. De aansprakelijkheid van ChefShift is in alle gevallen beperkt tot het bedrag van de servicecommissie van de betreffende opdracht.',
  },
  {
    titre: '10. Beoordelingen',
    tekst: 'Na afloop van een shift kunnen partijen elkaar beoordelen. Beoordelingen moeten eerlijk en feitelijk zijn. ChefShift mag beoordelingen verwijderen die beledigend, onjuist of misleidend zijn.',
  },
  {
    titre: '11. Persoonsgegevens',
    tekst: 'Persoonsgegevens worden verwerkt conform het privacybeleid van ChefShift en de Algemene verordening gegevensbescherming (AVG).',
  },
  {
    titre: '12. Toepasselijk recht en geschillen',
    tekst: 'Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in Nederland. ChefShift streeft ernaar klachten binnen 14 dagen te behandelen via de contactgegevens op het platform.',
  },
]

export default function VoorwaardenPage() {
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
          Algemene voorwaarden
        </h1>
        <p style={{ color: '#6b7268', marginBottom: 40, fontSize: 15 }}>
          Versie 1.0 — juli 2026. Van toepassing op elk gebruik van het ChefShift-platform.
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
          Conceptvoorwaarden — laat deze tekst valideren door een Nederlandse jurist voordat je commercieel lanceert.
        </p>
      </div>
    </main>
  )
}
