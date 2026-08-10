// @ts-check
// ─── MORPHO SERVICE ─────────────────────────────────────────────────────────
// Gestion de la fiche morphologique côté client.
// La fiche est produite par /api/analyze-morpho (vision, appel RARE) puis
// stockée localement : les régénérations de programme n'envoient PLUS de
// photos tant que le physique n'a pas changé. La table observation→conséquence
// vit côté serveur — le client ne fait que stocker le résultat.

import { supabase } from"./supabase.js";

const FICHE_KEY ="morpho_fiche";
const FICHE_PREV_KEY ="morpho_fiche_precedente";
// 6 semaines = un cycle complet. La posture et le rattrapage d'un point faible
// évoluent plus vite que la silhouette globale : au-delà, la fiche décrit un
// corps qui n'existe plus tout à fait.
export const FICHE_VALIDITE_JOURS = 42;

/** En-têtes d'authentification : joint le JWT Supabase si une session existe. */
export async function authHeaders() {
  const headers = {"Content-Type":"application/json" };
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) headers["Authorization"] =`Bearer ${token}`;
  } catch { /* pas de session — mode transition */ }
  return headers;
}

/** @returns {object | null} fiche stockée, ou null */
export function getFicheMorpho() {
  try { return JSON.parse(localStorage.getItem(FICHE_KEY) ||"null"); }
  catch { return null; }
}

/**
 * Enregistre la fiche courante et ARCHIVE la précédente.
 *
 * Sans cet archivage, chaque nouvelle analyse écrasait l'ancienne et toute
 * notion d'évolution disparaissait : impossible de savoir si un point faible
 * avait rattrapé, si une posture s'était corrigée, si le travail prescrit
 * avait produit un résultat.
 *
 * On horodate aussi la fiche : l'API n'ajoute pas de date, donc sans ce
 * marquage `ageFicheMorpho()` renvoyait toujours null et l'app affichait
 * « fiche ancienne » à chaque génération, même sur une analyse du jour.
 *
 * @param {object} fiche
 * @param {{poids?: number}} [contexte] poids du jour, pour détecter plus tard
 *   un écart significatif sans dépendre d'une autre source.
 */
export function saveFicheMorpho(fiche, contexte = {}) {
  try {
    const precedente = getFicheMorpho();
    if (precedente) localStorage.setItem(FICHE_PREV_KEY, JSON.stringify(precedente));
    const horodatee = {
      ...fiche,
      date: fiche?.date || new Date().toISOString(),
      poids_a_l_analyse: typeof contexte.poids === "number" ? contexte.poids
        : (typeof fiche?.poids_a_l_analyse === "number" ? fiche.poids_a_l_analyse : null),
    };
    localStorage.setItem(FICHE_KEY, JSON.stringify(horodatee));
    return true;
  } catch { return false; }
}

/** @returns {object | null} fiche de l'analyse PRÉCÉDENTE, ou null */
export function getFichePrecedente() {
  try { return JSON.parse(localStorage.getItem(FICHE_PREV_KEY) ||"null"); }
  catch { return null; }
}

/** Âge de la fiche en jours (null si pas de fiche). */
export function ageFicheMorpho() {
  const f = getFicheMorpho();
  if (!f?.date) return null;
  const d = new Date(f.date);
  if (isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 864e5);
}

export function ficheEstValide() {
  const age = ageFicheMorpho();
  return age !== null && age <= FICHE_VALIDITE_JOURS;
}

/**
 * Analyse morphologique via l'API vision (les photos transitent, ne sont pas stockées).
 * Stocke et retourne la fiche.
 * @param {string[]} photos - dataURLs compressées
 * @param {{sexe?: string, age?: string|number}} profil
 */
export async function analyserMorpho(photos, profil) {
  const clean = (photos || []).filter(Boolean);
  if (clean.length === 0) throw new Error("Aucune photo à analyser");

  const res = await fetch("/api/analyze-morpho", {
    method:"POST",
    headers: await authHeaders(),
    body: JSON.stringify({
      photos: clean.map(p => p.split(",")[1] || p),
      profil: { sexe: profil?.sexe, age: profil?.age },
    }),
  });
  const data = await res.json().catch(() => ({}));

  // ── Qualité photo insuffisante (422) ──
  if (res.status === 422 && data.error === "qualite_insuffisante") {
    const err = new Error(data.message || "La qualité des photos est insuffisante.");
    err.qualite = data.qualite;
    err.conseil = data.conseil;
    err.type = "qualite_photo";
    throw err;
  }

  if (!res.ok) throw new Error(data.error ||`Analyse morpho: erreur ${res.status}`);
  if (!data.fiche) throw new Error("Fiche morphologique absente de la réponse");
  saveFicheMorpho(data.fiche, { poids: Number(profil?.poids) || undefined });
  return getFicheMorpho() || data.fiche;
}

/**
 * Faut-il proposer de nouvelles photos ?
 *
 * Politique définie avec le coach :
 *  - un cycle complet terminé (≈ 6 semaines) : la posture et le rattrapage
 *    d'un point faible évoluent vite, plus vite que la silhouette globale ;
 *  - un écart de poids d'environ 2 kg ;
 *  - et à tout moment si le client le décide (bouton toujours disponible).
 *
 * ATTENTION — recomposition corporelle : un athlète peut perdre de la graisse
 * ET prendre du muscle à poids constant. Le critère pondéral ne détecterait
 * rien dans ce cas. C'est exactement pourquoi la règle des 6 semaines existe
 * en parallèle et ne doit jamais être remplacée par le seul écart de poids.
 *
 * @param {{poidsActuel?: number, cyclesTermines?: number}} [ctx]
 * @returns {{besoin: boolean, raisons: string[], message: string}}
 */
export function besoinNouvellesPhotos(ctx = {}) {
  const fiche = getFicheMorpho();
  if (!fiche) {
    return {
      besoin: true,
      raisons: ["aucune analyse morphologique"],
      message: "Ajoute des photos pour que ton programme tienne compte de ta morphologie.",
    };
  }

  const raisons = [];
  const age = ageFicheMorpho();
  if (age !== null && age >= FICHE_VALIDITE_JOURS) raisons.push(`${age} jours depuis ta dernière analyse`);
  if ((ctx.cyclesTermines || 0) >= 1 && (age === null || age >= 28)) raisons.push("un cycle complet terminé");

  const poidsFiche = fiche?.poids_a_l_analyse;
  const poidsActuel = Number(ctx.poidsActuel);
  if (typeof poidsFiche === "number" && Number.isFinite(poidsActuel)) {
    const ecart = Math.abs(poidsActuel - poidsFiche);
    if (ecart >= 2) raisons.push(`${ecart.toFixed(1)} kg d'écart depuis l'analyse`);
  }

  if (!raisons.length) return { besoin: false, raisons: [], message: "" };

  return {
    besoin: true,
    raisons,
    message: "De nouvelles photos affineraient ton programme : " + raisons.join(", ")
      + ". Ton corps peut avoir changé même si ton poids n'a pas bougé — posture et "
      + "rattrapage de points faibles évoluent vite.",
  };
}
