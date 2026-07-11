// ─── PHOTOS DE RECETTES ──────────────────────────────────────────────────────
// Source : Wikimedia Commons. Gratuit, SANS clé d'API, sans quota, CORS ouvert
// (origin=*). Aucune fonction serverless : l'appel part directement du navigateur.
//
// Garde-fous, dans l'ordre :
//  1. IntersectionObserver → on ne cherche que pour les cartes visibles à l'écran.
//  2. File d'attente (2 appels en parallèle max).
//  3. Cache localStorage 30 jours → une recette n'est cherchée qu'une seule fois,
//     échec compris.
//  4. Contrôle qualité → un résultat non pertinent est REJETÉ, et on garde la
//     photo du catalogue. Mieux vaut une photo générique correcte qu'une photo
//     exacte… de travers.

import { useState, useEffect, useRef } from "react";

const CACHE_KEY = "mc_photos_v3";
const TTL = 30 * 24 * 3600 * 1000;
const API = "https://commons.wikimedia.org/w/api.php";

function readCache()   { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch { return {}; } }
function writeCache(c) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch {} }

// ── file d'attente : 2 requêtes simultanées max ──────────────────────────────
const MAX_PARALLELE = 2;
let enCours = 0;
const file = [];
const inflight = new Map();

function pompe() {
  while (enCours < MAX_PARALLELE && file.length) {
    const job = file.shift();
    enCours++;
    job().finally(() => { enCours--; pompe(); });
  }
}

const sansAccent = s =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// ── contrôle qualité : le résultat parle-t-il vraiment du plat ? ─────────────
function acceptable(page, query) {
  const info = page?.imageinfo?.[0];
  if (!info?.thumburl) return false;
  if (!/\.(jpe?g|png)$/i.test(info.url || "")) return false;   // ni SVG, ni GIF
  if ((info.width || 0) < 500) return false;                   // pas de vignette

  const titre = sansAccent(page.title || "");
  // au moins un mot significatif du plat doit figurer dans le nom du fichier
  const mots = sansAccent(query).split(/[^a-z]+/).filter(m => m.length >= 4);
  if (!mots.length) return false;
  return mots.some(m => titre.includes(m));
}

function chercher(query) {
  const cache = readCache();
  const hit = cache[query];
  if (hit && Date.now() - hit.t < TTL) return Promise.resolve({ url: hit.u, author: hit.a });
  if (inflight.has(query)) return inflight.get(query);

  const url =
    `${API}?action=query&format=json&origin=*` +
    `&generator=search&gsrnamespace=6&gsrlimit=8` +
    `&gsrsearch=${encodeURIComponent("filetype:bitmap " + query)}` +
    `&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800`;

  const p = new Promise(res => {
    file.push(() =>
      fetch(url)
        .then(r => (r.ok ? r.json() : null))
        .then(d => {
          const pages = Object.values(d?.query?.pages || {});
          const bon = pages.find(pg => acceptable(pg, query));
          const info = bon?.imageinfo?.[0];
          const auteur = (info?.extmetadata?.Artist?.value || "")
            .replace(/<[^>]*>/g, "").trim().slice(0, 40) || null;

          const out = { url: info?.thumburl || null, author: auteur };
          const c = readCache();
          c[query] = { u: out.url, a: out.author, t: Date.now() };
          writeCache(c);
          res(out);
        })
        .catch(() => res({ url: null, author: null }))
    );
    pompe();
  });

  inflight.set(query, p);
  p.finally(() => inflight.delete(query));
  return p;
}

/**
 * @param {string} query    requête décrivant le plat (champ imgQuery)
 * @param {string} fallback photo du catalogue — affichée immédiatement
 * @returns {{ src, author, ref }} `ref` se pose sur le conteneur de l'image.
 */
export function useRecipePhoto(query, fallback) {
  const [src, setSrc]       = useState(fallback);
  const [author, setAuthor] = useState(null);
  const noeud = useRef(null);

  useEffect(() => { setSrc(fallback); setAuthor(null); }, [fallback]);

  useEffect(() => {
    if (!query) return;
    let vivant = true;

    const charger = () => chercher(query).then(({ url, author }) => {
      if (vivant && url) { setSrc(url); setAuthor(author); }
    });

    const el = noeud.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      charger();
      return () => { vivant = false; };
    }

    const obs = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { obs.disconnect(); charger(); }
    }, { rootMargin: "200px" });

    obs.observe(el);
    return () => { vivant = false; obs.disconnect(); };
  }, [query]);

  return { src, author, ref: noeud };
}
