# Photo du hero (page d'accueil)

La page d'accueil affiche automatiquement le fichier **`public/hero.jpg`** s'il existe.
S'il est absent, elle retombe sur le décor CSS (dégradé olive + halos animés) — rien ne casse.

## Comment l'ajouter

1. Télécharger une photo **libre de droits** (voir sources ci-dessous).
2. L'enregistrer sous `public/hero.jpg`.
3. Committer et déployer. Aucun code à modifier.

## Sources libres de droits (usage commercial autorisé, sans attribution obligatoire)

- **Unsplash** — https://unsplash.com/s/photos/restaurant-kitchen
  (choisir une photo **sans** le bandeau « Unsplash+ » : celles-ci sont sous licence gratuite)
- **Pexels** — https://www.pexels.com/search/restaurant%20kitchen/
- **Pixabay** — https://pixabay.com/images/search/chef/

⚠️ Éviter les images marquées « Unsplash+ », « Premium » ou avec filigrane :
elles nécessitent un abonnement et ne doivent pas être utilisées telles quelles.

## Recommandations techniques

- **Format** : JPEG (ou WebP renommé `.jpg` fonctionne aussi si le navigateur le supporte)
- **Largeur** : 1920–2400 px (le hero est plein écran)
- **Poids** : viser < 350 Ko (compresser via https://squoosh.app)
- **Cadrage** : sujet plutôt à droite ou au centre — le texte du hero s'affiche en bas à gauche
- Un voile sombre est appliqué automatiquement par-dessus pour garantir la lisibilité du texte blanc

## Note

Cette photo est aussi réutilisée en fond de la bannière d'appel à l'action, plus bas sur la page.
