// @ts-check
// ─── PHOTOS DE LA PAGE « OFFRE DU MOMENT » ────────────────────────────────────
// Les 2 photos (training-pro, nutrition-pro) sont résolues une fois pour
// toutes par le robot GitHub Actions (.github/workflows/fetch-photos.yml →
// scripts/fetch-offer-photos.mjs → Pexels) et figées dans
// offerPhotoManifest.json. Ce hook lit ce fichier — aucun appel réseau,
// aucune clé côté client.
//
// LA TAILLE EST CHOISIE ICI, à l'affichage. Le manifeste stocke l'URL nue ;
// le CDN de Pexels redimensionne à la volée selon les paramètres qu'on ajoute.
// Pour les cartes d'offres, on veut une photo immersive occupant ~40 % de la
// carte sur mobile → 720 px suffit (Retina), aucun besoin du 940 px original.

import manifest from "../../data/offerPhotoManifest.json";

const LARGEURS = { card: 720, hero: 1080 };

function dimensionner(url, taille) {
  if (!url) return null;
  if (!url.includes("images.pexels.com")) return url;
  const base = url.split("?")[0];
  const w = LARGEURS[taille] || LARGEURS.card;
  return `${base}?auto=compress&cs=tinysrgb&w=${w}`;
}

/**
 * @param {"training-pro"|"nutrition-pro"} slug  identifiant de l'offre
 * @param {"card"|"hero"} taille  contexte d'affichage (défaut : card)
 */
export function useOfferPhoto(slug, taille = "card") {
  const entree = manifest[slug];
  return {
    src: dimensionner(entree?.url, taille),
    author: entree?.author || null,
    alt: entree?.alt || null,
    link: entree?.link || null,
  };
}
