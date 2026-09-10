import { useMemo } from "react";
import MANIFEST from "../data/exerciseImageManifest.json";

// ─── Base Supabase Storage ───────────────────────────────────────────────────
// Remplace <TON-PROJET> par l'identifiant de ton projet Supabase.
// Tu le trouves dans Supabase → Settings → API → Project URL.
const BASE =
  "https://mcwvfniomgxtmwalcptb.supabase.co/storage/v1/object/public/exercices";

// ─── Normalisation ───────────────────────────────────────────────────────────
// Les noms d'exercices arrivent parfois avec une casse ou des accents
// différents selon la source (base EX, programme généré, saisie manuelle).
// On compare sur une forme neutralisée pour éviter les ratés.
const norm = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// Index construit une seule fois au chargement du module
const INDEX = (() => {
  const idx = {};
  for (const [nom, data] of Object.entries(MANIFEST)) {
    // "Squat barre (2)" -> on indexe aussi sur "Squat barre"
    const sansSuffixe = nom.replace(/\s*\(\d+\)$/, "");
    const k1 = norm(nom);
    const k2 = norm(sansSuffixe);
    if (!idx[k1]) idx[k1] = data;
    if (!idx[k2]) idx[k2] = data;
  }
  return idx;
})();

/**
 * Retourne les photos d'un exercice.
 *
 * @param {string} nom  Nom de l'exercice (ex: "Développé couché barre")
 * @returns {{
 *   depart: string|null,   // URL de la position de départ
 *   fin:    string|null,   // URL de la position d'arrivée
 *   unique: string|null,   // URL si l'exercice n'a qu'une seule image
 *   toutes: string[],      // toutes les URLs disponibles, dans l'ordre
 *   existe: boolean        // false si aucune image pour cet exercice
 * }}
 */
export function useExercisePhoto(nom) {
  return useMemo(() => {
    const vide = { depart: null, fin: null, unique: null, toutes: [], existe: false };
    if (!nom) return vide;

    const d = INDEX[norm(nom)];
    if (!d) return vide;

    const url = (f) => `${BASE}/${f}`;

    if (d.type === "solo") {
      const u = url(d.img);
      return { depart: u, fin: null, unique: u, toutes: [u], existe: true };
    }

    const dep = url(d.depart);
    const fin = url(d.fin);
    return { depart: dep, fin, unique: null, toutes: [dep, fin], existe: true };
  }, [nom]);
}

/** Variante non-hook, utilisable hors composant React. */
export function getExercisePhoto(nom) {
  const d = INDEX[norm(nom)];
  if (!d) return null;
  const url = (f) => `${BASE}/${f}`;
  return d.type === "solo"
    ? { unique: url(d.img), depart: url(d.img), fin: null }
    : { unique: null, depart: url(d.depart), fin: url(d.fin) };
}

export default useExercisePhoto;
