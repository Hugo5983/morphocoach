// ─── LECTURE DES DURÉES ÉCRITES EN TEXTE ────────────────────────────────────
// L'IA écrit les temps de repos en langage naturel : "90s", "60-90s", "2 min",
// "3 à 5 minutes". Le code les lisait avec String(v).replace(/\D/g, ""), qui
// retire tout ce qui n'est pas un chiffre. Conséquences observées en séance :
//
//   "60-90s"        → "6090" → 6090 s  → minuteur de 101 min 30 s
//   "45-60s"        → "4560" → 4560 s  → 76 min
//   "2 min"         → "2"    →    2 s  → repos quasi nul
//   "1-2 min"       → "12"   →   12 s  → repos quasi nul
//
// Ce n'est pas un défaut d'affichage : un athlète qui suit le minuteur se
// repose 12 secondes entre deux séries lourdes, ou attend une heure et demie.
// Dans les deux cas la prescription est trahie.
//
// Ce module lit correctement les fourchettes ET les unités. Il est volontairement
// partagé : toute lecture de durée dans l'app doit passer par ici, pour que le
// bug ne puisse pas se reformer ailleurs.

/**
 * Convertit un temps de repos écrit en texte vers un nombre de SECONDES.
 *
 * Sur une fourchette ("60-90s"), renvoie la BORNE HAUTE : mieux vaut proposer
 * le repos complet et laisser l'athlète enchaîner plus tôt que l'inverse.
 *
 * @param {string|number|null|undefined} valeur
 * @param {number} [defaut=90] valeur de repli si rien n'est lisible
 * @returns {number} secondes, borné entre 5 et 600
 */
export function reposEnSecondes(valeur, defaut = 90) {
  if (typeof valeur === "number" && Number.isFinite(valeur)) return borner(valeur, defaut);

  const t = String(valeur ?? "").toLowerCase().replace(",", ".").trim();
  if (!t) return defaut;

  // Format horloge explicite : "1:30", "2:00"
  const horloge = t.match(/^(\d{1,2})\s*:\s*(\d{2})$/);
  if (horloge) return borner(Number(horloge[1]) * 60 + Number(horloge[2]), defaut);

  const nombres = t.match(/\d+(?:\.\d+)?/g);
  if (!nombres || !nombres.length) return defaut;

  // Borne haute de la fourchette.
  const valeurs = nombres.map(Number).filter(n => Number.isFinite(n) && n > 0);
  if (!valeurs.length) return defaut;
  const brut = Math.max(...valeurs);

  // L'unité décide. "min"/"minute" l'emporte ; "s"/"sec" force les secondes.
  const enMinutes = /min|minute/.test(t);
  const enSecondes = /\d\s*(s\b|sec)/.test(t);

  let secondes;
  if (enMinutes && !enSecondes) secondes = brut * 60;
  else if (enSecondes) secondes = brut;
  // Aucune unité : un nombre inférieur à 10 est presque sûrement des minutes.
  else secondes = brut < 10 ? brut * 60 : brut;

  return borner(secondes, defaut);
}

/** Garde-fou : hors de [5 s, 10 min], la valeur lue est aberrante. */
function borner(secondes, defaut) {
  if (!Number.isFinite(secondes) || secondes < 5 || secondes > 600) return defaut;
  return Math.round(secondes);
}

/**
 * Affichage d'un nombre de secondes en "M:SS".
 * @param {number} secondes
 */
export function formaterDuree(secondes) {
  const s = Math.max(0, Math.round(Number(secondes) || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Minutes lisibles depuis un texte du type "3 min", "45 s", "2 × 15".
 * Renvoie null si aucune durée n'est exprimée (ex. "15 répétitions").
 * @param {string} texte
 */
export function minutesDepuisTexte(texte) {
  const t = String(texte ?? "").toLowerCase();
  if (!/min|sec|\bs\b/.test(t)) return null;
  const n = t.match(/\d+(?:[.,]\d+)?/);
  if (!n) return null;
  const v = parseFloat(n[0].replace(",", "."));
  if (!Number.isFinite(v)) return null;
  return /min/.test(t) ? v : v / 60;
}
