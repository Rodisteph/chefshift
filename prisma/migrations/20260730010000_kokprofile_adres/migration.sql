-- Étape 1 : colonnes nullable sur kok_profiles
ALTER TABLE "kok_profiles"
  ADD COLUMN "street" TEXT,
  ADD COLUMN "house_number" TEXT;

-- Étape 2 : backfill depuis la table provisoire kok_adres (si elle existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'kok_adres'
  ) THEN
    UPDATE "kok_profiles" kp
    SET "street" = ka."straat", "house_number" = ka."huisnummer"
    FROM "kok_adres" ka
    WHERE kp."id" = ka."kok_id";
  END IF;
END $$;

-- Étape 3 (NOT NULL sur street/house_number/postal_code/city/vat_number) :
-- volontairement reportée — appliquée une fois tous les profils existants complétés.
