-- Phase 4 : montants en centimes entiers (Float euros -> Int centimes, arrondi half-up)
-- round(double precision) de PostgreSQL arrondit half-up pour les valeurs positives.

-- invoices : 5 montants
ALTER TABLE "invoices"
  ALTER COLUMN "amount_excl_vat" TYPE INTEGER USING (round("amount_excl_vat" * 100)::integer),
  ALTER COLUMN "vat_amount"      TYPE INTEGER USING (round("vat_amount" * 100)::integer),
  ALTER COLUMN "amount_incl_vat" TYPE INTEGER USING (round("amount_incl_vat" * 100)::integer),
  ALTER COLUMN "platform_fee"    TYPE INTEGER USING (round("platform_fee" * 100)::integer),
  ALTER COLUMN "kok_payout"      TYPE INTEGER USING (round("kok_payout" * 100)::integer);

-- shifts : tarif horaire + montant total
ALTER TABLE "shifts"
  ALTER COLUMN "hourly_rate"  TYPE INTEGER USING (round("hourly_rate" * 100)::integer),
  ALTER COLUMN "total_amount" TYPE INTEGER USING (round("total_amount" * 100)::integer);
