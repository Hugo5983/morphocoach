// @ts-check
// ─── MORPHO SERVICE ─────────────────────────────────────────────────────────
// Gestion de la fiche morphologique côté client.
// La fiche est produite par /api/analyze-morpho (vision, appel RARE) puis
// stockée localement : les régénérations de programme n'envoient PLUS de
// photos tant que le physique n'a pas changé. La table observation→conséquence
// vit côté serveur — le client ne fait que stocker le résultat.

import { supabase } from"./supabase.js";

const FICHE_KEY ="morpho_fiche";
export const FICHE_VALIDITE_JOURS = 90; // au-delà, on suggère de nouvelles photos

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

export function saveFicheMorpho(fiche) {
  try { localStorage.setItem(FICHE_KEY, JSON.stringify(fiche)); return true; }
  catch { return false; }
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
  if (!res.ok) throw new Error(data.error ||`Analyse morpho: erreur ${res.status}`);
  if (!data.fiche) throw new Error("Fiche morphologique absente de la réponse");
  saveFicheMorpho(data.fiche);
  return data.fiche;
}
