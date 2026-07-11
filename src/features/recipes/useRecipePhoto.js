// ─── PHOTOS DE RECETTES ──────────────────────────────────────────────────────
// Résout la vraie photo d'un plat via /api/photo, avec cache localStorage
// (30 jours) et repli immédiat sur la photo du catalogue.
//
// Principe : la photo du catalogue s'affiche TOUT DE SUITE (aucun écran vide),
// puis elle est remplacée en silence par la photo exacte dès qu'elle arrive.

import { useState, useEffect } from "react";

const CACHE_KEY = "mc_photos_v1";
const TTL = 30 * 24 * 3600 * 1000;   // 30 jours

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); }
  catch { return {}; }
}
function writeCache(c) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch { /* quota plein */ }
}

// requêtes en vol : évite 20 appels identiques quand la grille se monte
const inflight = new Map();

async function resolve(query) {
  const cache = readCache();
  const hit = cache[query];
  if (hit && Date.now() - hit.t < TTL) return hit.u;

  if (inflight.has(query)) return inflight.get(query);

  const p = fetch(`/api/photo?q=${encodeURIComponent(query)}`)
    .then(r => (r.ok ? r.json() : null))
    .then(d => {
      const u = d?.url || null;
      const c = readCache();
      c[query] = { u, t: Date.now() };     // on mémorise même l'échec (null)
      writeCache(c);
      return u;
    })
    .catch(() => null)
    .finally(() => inflight.delete(query));

  inflight.set(query, p);
  return p;
}

/**
 * @param {string} query    requête décrivant le plat (champ imgQuery)
 * @param {string} fallback photo du catalogue, affichée immédiatement
 */
export function useRecipePhoto(query, fallback) {
  const [src, setSrc] = useState(fallback);

  useEffect(() => {
    let vivant = true;
    setSrc(fallback);
    if (!query) return;
    resolve(query).then(u => { if (vivant && u) setSrc(u); });
    return () => { vivant = false; };
  }, [query, fallback]);

  return src;
}
