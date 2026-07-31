// Wettelijk minimumuurloon Nederland (21+).
// Referentie: rijksoverheid.nl — minimumloon per uur. Halfjaarlijks bijwerken.
// (Barème 2025 : €14,06/uur — à ajuster à chaque indexation.)
export const MIN_HOURLY_RATE = 14.06

// Pause déduite par défaut d'un shift, en minutes.
// Utilisée à la création du shift ET par la facturation : une seule
// source de vérité, sinon l'estimation affichée et la facture divergent.
export const STANDAARD_PAUZE_MIN = 30
