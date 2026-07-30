-- Pause déclarée par le chef lors de la déclaration d'heure de fin.
-- NULL = pause par défaut du shift (break_minutes), 0 = pas de pause.
ALTER TABLE "shift_end" ADD COLUMN IF NOT EXISTS "break_minuten" INTEGER;
