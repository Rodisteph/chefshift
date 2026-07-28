// Limiteur de débit en mémoire (fenêtre glissante).
// En serverless chaque instance a son propre compteur : ce n'est pas une protection
// absolue mais cela freine fortement le brute-force sur login / register.
const tentatives = new Map<string, number[]>()

export function estAutorise(cle: string, max: number, fenetreMs: number): boolean {
  const maintenant = Date.now()
  const liste = (tentatives.get(cle) || []).filter((t) => maintenant - t < fenetreMs)
  if (liste.length >= max) {
    tentatives.set(cle, liste)
    return false
  }
  liste.push(maintenant)
  tentatives.set(cle, liste)
  // Nettoyage opportuniste pour éviter une croissance illimitée
  if (tentatives.size > 10000) {
    tentatives.forEach((v, k) => {
      if (v.every((t) => maintenant - t >= fenetreMs)) tentatives.delete(k)
    })
  }
  return true
}
