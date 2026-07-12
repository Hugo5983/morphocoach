// ─── RECHERCHE PRODUITS — OPEN FOOD FACTS ────────────────────────────────────
// Base collaborative française : ~3,7 millions de produits, excellente
// couverture des supermarchés français (Auchan, Lidl, Carrefour, Leclerc…).
// Gratuit, sans clé API, CORS ouvert : on interroge directement depuis le
// navigateur. C'est la même famille de données que celle qui alimente les
// grandes apps de suivi nutritionnel.
//
// Deux endpoints, par ordre de préférence :
//   1. search.openfoodfacts.org  (moteur récent, rapide)
//   2. fr.openfoodfacts.org/cgi/search.pl  (historique, plus lent mais fiable)
// Si le premier échoue ou renvoie une forme inattendue, on bascule sur le
// second. Les deux formes de réponse sont gérées.
//
// Cache localStorage 24 h par requête : re-taper « nutella » ne refait pas
// d'appel réseau, et la base reste consultable pour les recherches récentes
// même avec un réseau médiocre.

const CACHE_KEY = "mc_off_search_v1";
const TTL = 24 * 3600 * 1000;
const PAGE = 12;

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch { return {}; }
}
function writeCache(c) {
  try {
    // garde au plus 60 requêtes en cache pour ne pas gonfler le localStorage
    const keys = Object.keys(c);
    if (keys.length > 60) {
      keys.sort((a, b) => c[a].t - c[b].t)
          .slice(0, keys.length - 60)
          .forEach(k => delete c[k]);
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch { /* quota plein : tant pis pour le cache */ }
}

const round1 = v => Math.round((v || 0) * 10) / 10;

/** Normalise un produit OFF vers le format aliment de l'app.
 *  Le « (100 g) » dans le nom est la convention de l'app : il déclenche la
 *  saisie par grammes dans RepasSheet (per100Test). */
function normalize(p) {
  const n = p.nutriments || {};
  const kcal = n["energy-kcal_100g"] ?? (n["energy_100g"] ? n["energy_100g"] / 4.184 : 0);
  const nom = (p.product_name_fr || p.product_name || "").trim();
  if (!nom || !kcal) return null;                    // produit inexploitable
  const marque = (p.brands || "").split(",")[0].trim();
  return {
    n:   `${nom}${marque ? " — " + marque : ""} (100 g)`,
    c:   Math.round(kcal),
    p:   round1(n.proteins_100g),
    g:   round1(n.carbohydrates_100g),
    l:   round1(n.fat_100g),
    fi:  round1(n.fiber_100g),
    na:  Math.round((n.sodium_100g || 0) * 1000),
    su:  round1(n.sugars_100g),
    sa:  round1(n["saturated-fat_100g"]),
    cat: "Magasin",
    // champs d'affichage
    brand:      marque || null,
    nutriscore: /^[a-e]$/i.test(p.nutriscore_grade || "") ? p.nutriscore_grade.toUpperCase() : null,
    img:        p.image_front_small_url || p.image_small_url || null,
    code:       p.code || null,
  };
}

const FIELDS = "code,product_name,product_name_fr,brands,nutriscore_grade," +
               "image_front_small_url,image_small_url,nutriments";

async function viaSearchALicious(q, signal) {
  const url = "https://search.openfoodfacts.org/search" +
    `?q=${encodeURIComponent(q)}&langs=fr&page_size=${PAGE}&fields=${FIELDS}`;
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error("sal_" + r.status);
  const d = await r.json();
  const hits = d?.hits || d?.products;
  if (!Array.isArray(hits)) throw new Error("sal_shape");
  return hits;
}

async function viaLegacy(q, signal) {
  const url = "https://fr.openfoodfacts.org/cgi/search.pl" +
    `?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process` +
    `&json=1&page_size=${PAGE}&fields=${FIELDS}`;
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error("legacy_" + r.status);
  const d = await r.json();
  if (!Array.isArray(d?.products)) throw new Error("legacy_shape");
  return d.products;
}

const inflight = new Map();

/**
 * Recherche des produits du commerce.
 * @param {string} query   texte tapé par l'utilisateur (≥ 3 caractères utiles)
 * @param {AbortSignal=} signal  pour annuler quand l'utilisateur retape
 * @returns {Promise<Array>} produits normalisés (souvent vide, jamais d'exception)
 */
export async function searchProducts(query, signal) {
  const q = (query || "").trim().toLowerCase();
  if (q.length < 3) return [];

  const cache = readCache();
  const hit = cache[q];
  if (hit && Date.now() - hit.t < TTL) return hit.r;

  if (inflight.has(q)) return inflight.get(q);

  const p = (async () => {
    let brut = [];
    try { brut = await viaSearchALicious(q, signal); }
    catch (e) {
      if (e?.name === "AbortError") return [];
      try { brut = await viaLegacy(q, signal); }
      catch (e2) { if (e2?.name === "AbortError") return []; brut = []; }
    }
    const res = brut.map(normalize).filter(Boolean).slice(0, PAGE);
    if (res.length) {                    // on ne met en cache que les succès
      const c = readCache();
      c[q] = { r: res, t: Date.now() };
      writeCache(c);
    }
    return res;
  })();

  inflight.set(q, p);
  p.finally(() => inflight.delete(q));
  return p;
}
