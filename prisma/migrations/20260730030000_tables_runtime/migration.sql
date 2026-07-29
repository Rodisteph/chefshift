-- Phase 5 : les 7 tables de service passent sous gestion des migrations Prisma.
-- IF NOT EXISTS : en production les tables existent déjà (créées à l'exécution)
-- avec leurs données ; sur une base neuve, elles sont créées ici.

CREATE TABLE IF NOT EXISTS shift_end (
  shift_id TEXT PRIMARY KEY,
  reported_end TIMESTAMP NOT NULL,
  reported_at TIMESTAMP DEFAULT now(),
  confirmed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kok_push (
  endpoint TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kok_reminder (
  shift_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (shift_id, kind)
);

CREATE TABLE IF NOT EXISTS user_source (
  user_id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kok_factuur_seq (
  kok_id TEXT NOT NULL,
  jaar INT NOT NULL,
  laatste_seq INT NOT NULL DEFAULT 0,
  PRIMARY KEY (kok_id, jaar)
);

CREATE TABLE IF NOT EXISTS platform_factuur_seq (
  jaar INT PRIMARY KEY,
  laatste_seq INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS commissie_factuur (
  invoice_id TEXT PRIMARY KEY,
  nummer TEXT NOT NULL,
  jaar INT NOT NULL,
  seq INT NOT NULL
);
