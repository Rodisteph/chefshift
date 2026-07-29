-- AlterTable : nouveau défaut 21% pour les shifts créés à l'avenir
ALTER TABLE "shifts" ALTER COLUMN "vat_rate" SET DEFAULT 21;

-- Données : bascule des shifts existants de 9% vers 21%,
-- SAUF ceux liés à une facture déjà payée (PAID) — ceux-ci sont
-- listés séparément pour décision manuelle.
UPDATE "shifts" SET "vat_rate" = 21
WHERE "vat_rate" = 9
  AND "id" NOT IN (SELECT "shift_id" FROM "invoices" WHERE "status" = 'PAID');
