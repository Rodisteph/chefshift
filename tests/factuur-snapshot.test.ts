import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  berekenUrenMinuten, minutenVanTijd, tijdVanMinuten, isMinimumToegepast,
  euroNaarCenten, berekenBedragen,
} from '../src/lib/factuur'

// ===== tijdVanMinuten : minutes depuis minuit -> "HH:MM" =====

test('tijdVanMinuten : 0 => "00:00", 630 => "10:30"', () => {
  assert.equal(tijdVanMinuten(0), '00:00')
  assert.equal(tijdVanMinuten(630), '10:30')
  assert.equal(tijdVanMinuten(59), '00:59')
  assert.equal(tijdVanMinuten(1439), '23:59')
})

test('tijdVanMinuten : passage minuit (1470 => "00:30")', () => {
  assert.equal(tijdVanMinuten(1440), '00:00')
  assert.equal(tijdVanMinuten(1470), '00:30')
})

test('tijdVanMinuten : valeurs négatives enveloppées (-30 => "23:30")', () => {
  assert.equal(tijdVanMinuten(-30), '23:30')
  assert.equal(tijdVanMinuten(-60), '23:00')
})

// ===== minutenVanTijd : Date -> minutes wall-clock UTC =====

test('minutenVanTijd : composantes UTC, sans fuseau', () => {
  assert.equal(minutenVanTijd(new Date(Date.UTC(2026, 0, 15, 22, 30))), 22 * 60 + 30)
  assert.equal(minutenVanTijd(new Date(Date.UTC(2026, 0, 15, 0, 0))), 0)
})

test('aller-retour minutenVanTijd / tijdVanMinuten', () => {
  for (const m of [0, 75, 630, 1350, 1439]) {
    assert.equal(minutenVanTijd(new Date(Date.UTC(2026, 0, 15, 0, m))), m)
    assert.equal(tijdVanMinuten(m).length, 5)
  }
})

// ===== isMinimumToegepast : le minimum d'une heure a-t-il gonflé la durée ? =====

test('isMinimumToegepast : vrai pour un shift de 45 min', () => {
  assert.equal(isMinimumToegepast(600, 645, 0), true)
})

test('isMinimumToegepast : vrai pour 10:30-11:30 avec pause 30 min', () => {
  assert.equal(isMinimumToegepast(630, 690, 30), true)
})

test('isMinimumToegepast : faux pour un shift de 8 h avec pause', () => {
  assert.equal(isMinimumToegepast(9 * 60, 17 * 60, 30), false)
})

test('isMinimumToegepast : faux pour 22:00-02:00 sans pause (passage minuit)', () => {
  assert.equal(isMinimumToegepast(22 * 60, 2 * 60, 0), false)
})

test('isMinimumToegepast : pile 60 min effectives => faux (pas de gonflement)', () => {
  assert.equal(isMinimumToegepast(600, 660, 0), false)
  assert.equal(isMinimumToegepast(600, 690, 30), false)
})

// ===== Instantané de facturation : ce qui est figé au paiement = ce que le PDF relit =====

test("instantané : billedMinutes figé = calcul au moment du paiement", () => {
  // Simule l'écriture du webhook : instantané calculé UNE fois au paiement
  const startMin = minutenVanTijd(new Date(Date.UTC(2026, 1, 10, 9, 0)))
  const endMin = minutenVanTijd(new Date(Date.UTC(2026, 1, 10, 17, 0)))
  const pauze = 30
  const billedMinutes = berekenUrenMinuten(startMin, endMin, pauze)

  // Le PDF relit l'instantané tel quel, sans recalcul :
  // même si les horaires du shift changent ensuite, billedMinutes ne bouge pas
  const startMinModifie = minutenVanTijd(new Date(Date.UTC(2026, 1, 10, 10, 0))) // horaire modifié après coup
  assert.equal(billedMinutes, 450)
  assert.notEqual(berekenUrenMinuten(startMinModifie, endMin, pauze), billedMinutes)
  // => c'est bien la valeur figée (450) qui doit être affichée
})

test("instantané : affichage cohérent (heures, HH:MM, mention minimum)", () => {
  const startMin = 10 * 60 + 30
  const endMin = 11 * 60 + 30
  const pauze = 30
  const billedMinutes = berekenUrenMinuten(startMin, endMin, pauze) // 60 (minimum 1 h)

  assert.equal(billedMinutes / 60, 1) // uren affiché : 1,0
  assert.equal(tijdVanMinuten(startMin), '10:30')
  assert.equal(tijdVanMinuten(endMin), '11:30')
  assert.equal(isMinimumToegepast(startMin, endMin, pauze), true) // => " · minimum 1 uur"
})

test("instantané : montants calculés sur les minutes figées", () => {
  const billedMinutes = 450 // 7,5 h figées
  const b = berekenBedragen(billedMinutes, euroNaarCenten(25))
  assert.equal(b.exclCenten, 18750)
  assert.equal(b.btwCenten, 3938) // 21% de 187,50 arrondi half-up
  assert.equal(b.inclCenten, 22688)
})
