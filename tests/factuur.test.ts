import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  CHEF_VAT_RATE, COMMISSION_RATE,
  berekenUrenMinuten, berekenBedragen,
  euroNaarCenten, centenNaarEuro,
  factuurNummer, commissieNummer,
} from '../src/lib/factuur.ts'

// ===== Heures dérivées des horaires =====

test('10:30 - 11:30 avec pause 30 min => 1,0 h (minimum 1 h)', () => {
  assert.equal(berekenUrenMinuten(10 * 60 + 30, 11 * 60 + 30, 30), 60)
})

test('shift 8 h avec pause 30 min => 7,5 h', () => {
  assert.equal(berekenUrenMinuten(9 * 60, 17 * 60, 30), 450)
})

test('passage minuit 22:00 - 02:00 sans pause => 4 h', () => {
  assert.equal(berekenUrenMinuten(22 * 60, 2 * 60, 0), 240)
})

test('shift de 45 min sans pause => minimum 1 h', () => {
  assert.equal(berekenUrenMinuten(600, 645, 0), 60)
})

// ===== Montant = heures x tarif (en centimes) =====

test('1,0 h x 10,00 EUR => 10,00 EUR HT', () => {
  const b = berekenBedragen(60, euroNaarCenten(10))
  assert.equal(b.exclCenten, 1000)
})

test('7,5 h x 25,00 EUR => 187,50 EUR HT', () => {
  const b = berekenBedragen(450, euroNaarCenten(25))
  assert.equal(b.exclCenten, 18750)
})

// ===== TVA 21% =====

test('TVA : 21% et pas 9%', () => {
  assert.equal(CHEF_VAT_RATE, 21)
  const b = berekenBedragen(60, euroNaarCenten(10))
  assert.equal(b.btwCenten, 210) // 21% de 10,00
  assert.equal(b.inclCenten, 1210)
})

test('TVA arrondie half-up : 0,13 EUR x 21% => 3 cents', () => {
  const b = berekenBedragen(60, 13) // 0,13 EUR/h => excl 13 cents, 21% = 2,73 => 3
  assert.equal(b.exclCenten, 13)
  assert.equal(b.btwCenten, 3)
})

// ===== Commission : 15% du HT, payout = TTC - commission =====

test('commission = 15% du montant HT', () => {
  assert.equal(COMMISSION_RATE, 15)
  const b = berekenBedragen(60, euroNaarCenten(10))
  // excl 10,00 / incl 12,10 => commission 1,50 (pas 1,815 = 15% TTC)
  assert.equal(b.commissieCenten, 150)
  assert.equal(b.payoutCenten, 1210 - 150)
})

test('commission sur cas réel : 15,00 HT / 18,15 TTC => 2,25', () => {
  const b = berekenBedragen(90, euroNaarCenten(10)) // 1,5 h x 10 = 15,00 HT
  assert.equal(b.exclCenten, 1500)
  assert.equal(b.btwCenten, 315)
  assert.equal(b.inclCenten, 1815)
  assert.equal(b.commissieCenten, 225)
  assert.equal(b.payoutCenten, 1590)
})

// ===== Numérotation : format, unicité, continuité =====

test('format document A : CS-annee-chefId-seq04', () => {
  assert.equal(factuurNummer(2026, 'abc123', 1), 'CS-2026-abc123-0001')
  assert.equal(factuurNummer(2026, 'abc123', 42), 'CS-2026-abc123-0042')
})

test('format document B : CM-annee-seq04 (série distincte)', () => {
  assert.equal(commissieNummer(2026, 1), 'CM-2026-0001')
  assert.notEqual(commissieNummer(2026, 1), factuurNummer(2026, 'abc123', 1))
})

test("continuité et unicité d'une série par chef", () => {
  // Simule le compteur transactionnel : seq strictement croissante, sans trou
  let seq = 0
  const numeros = new Set<string>()
  for (let i = 0; i < 100; i++) {
    seq += 1
    const n = factuurNummer(2026, 'kok1', seq)
    assert.ok(!numeros.has(n), 'doublon !')
    numeros.add(n)
  }
  assert.equal(numeros.size, 100)
  assert.ok(numeros.has('CS-2026-kok1-0001'))
  assert.ok(numeros.has('CS-2026-kok1-0100'))
})

test('deux chefs ont des séries indépendantes', () => {
  assert.equal(factuurNummer(2026, 'kokA', 1), 'CS-2026-kokA-0001')
  assert.equal(factuurNummer(2026, 'kokB', 1), 'CS-2026-kokB-0001')
})

// ===== Conversion euro <-> centimes sans dérive float =====

test('conversion aller-retour euro/centimes', () => {
  assert.equal(euroNaarCenten(0.1 + 0.2), 30) // 0.30000000000000004 en float
  assert.equal(centenNaarEuro(1060), 10.6)
})
