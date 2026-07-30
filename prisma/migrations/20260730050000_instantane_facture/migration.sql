-- Instantané figé de la facturation, écrit une seule fois au paiement.
-- Une facture est un document légal : elle ne doit plus changer après émission.
-- Nullable volontairement : la table contient déjà des lignes, une colonne
-- NOT NULL ferait échouer la migration. Les factures antérieures (NULL)
-- sont recalculées à l'affichage, comme avant.
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "billed_minutes" INTEGER;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "break_minutes" INTEGER;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "start_minutes" INTEGER;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "end_minutes" INTEGER;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "vat_rate_used" INTEGER;
