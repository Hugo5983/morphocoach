// ─── PHOTOS DE RECETTES ──────────────────────────────────────────────────────
// Les photos sont résolues UNE FOIS pour toutes par un robot GitHub Actions
// (.github/workflows/fetch-photos.yml), qui interroge Pexels et fige le
// résultat dans photoManifest.json. Ce hook ne fait plus aucun appel réseau :
// il lit ce fichier, exactement comme il lirait n'importe quelle donnée
// statique de l'app. Aucune clé API, aucun endpoint, aucun risque de crash.
//
// Tant que le workflow n'a pas encore tourné (ou pour une recette qu'il n'a
// pas encore atteinte), le manifeste ne contient rien pour cet id : la photo
// du catalogue s'affiche, comme avant.

import manifest from "../../data/photoManifest.json";

/**
 * @param {number} id       identifiant de la recette
 * @param {string} fallback photo du catalogue, utilisée si le manifeste n'a
 *                          pas (encore) d'entrée pour cette recette
 */
export function useRecipePhoto(id, fallback) {
  const entree = manifest[id];
  return {
    src: entree?.url || fallback,
    author: entree?.author || null,
  };
}
