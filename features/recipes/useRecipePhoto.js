// ─── PHOTOS DE RECETTES ──────────────────────────────────────────────────────
// Les photos sont résolues une fois pour toutes par le robot GitHub Actions
// (.github/workflows/fetch-photos.yml → Pexels) et figées dans
// photoManifest.json. Ce hook lit ce fichier — aucun appel réseau, aucune clé.
//
// LA TAILLE EST CHOISIE ICI, à l'affichage. Le manifeste stocke l'URL nue ;
// le CDN de Pexels redimensionne à la volée selon les paramètres qu'on ajoute.
// Avant, toutes les images arrivaient en 940 px (~150-300 Ko) même pour des
// cartes de 180 px de large → des Mo à charger, d'où la lenteur. Désormais :
//   carte  → 480 px  (~25-50 Ko, net sur écran Retina)
//   fiche  → 960 px  (plein écran)

import manifest from"../../data/photoManifest.json";

const LARGEURS = { card: 480, hero: 960 };

function dimensionner(url, taille) {
  if (!url) return null;
  if (!url.includes("images.pexels.com")) return url;   // photo du catalogue : telle quelle
  const base = url.split("?")[0];                        // tolère les URLs v1 (avec w=940)
  const w = LARGEURS[taille] || LARGEURS.card;
  return`${base}?auto=compress&cs=tinysrgb&w=${w}`;
}

/**
 * @param {number} id       identifiant de la recette
 * @param {string} fallback photo du catalogue si le manifeste n'a rien
 * @param {"card"|"hero"} taille  contexte d'affichage (défaut : card)
 */
export function useRecipePhoto(id, fallback, taille ="card") {
  const entree = manifest[id];
  return {
    src: dimensionner(entree?.url, taille) || fallback,
    author: entree?.author || null,
  };
}
