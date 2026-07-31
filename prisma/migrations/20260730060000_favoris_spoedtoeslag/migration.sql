-- Étape 3b : favoris horeca -> chefs + supplément d'urgence (spoedtoeslag).
-- spoedtoeslag_pct : 0, 10, 15 ou 20 (% du tarif de base).
-- Payé par l'horeca, reversé à 100% au chef ; la commission plateforme
-- reste calculée sur le tarif de base (factuur.ts inchangé).
ALTER TABLE "shifts" ADD COLUMN IF NOT EXISTS "spoedtoeslag_pct" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "favorite_kok" (
    "horeca_id" TEXT NOT NULL,
    "kok_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_kok_pkey" PRIMARY KEY ("horeca_id", "kok_id")
);
