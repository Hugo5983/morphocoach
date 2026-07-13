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
  const prot = n.proteins_100g || 0, gluc = n.carbohydrates_100g || 0, lip = n.fat_100g || 0;
  // kcal : champ direct, sinon kJ converti, sinon RECONSTITUÉ des macros
  // (4P + 4G + 9L). Beaucoup de fiches OFF ont les macros sans l'énergie :
  // les rejeter rendait introuvables des produits pourtant très courants.
  let kcal = n["energy-kcal_100g"] ?? (n["energy_100g"] ? n["energy_100g"] / 4.184 : 0);
  if (!kcal && (prot || gluc || lip)) kcal = 4 * prot + 4 * gluc + 9 * lip;
  const nom = (p.product_name_fr || p.product_name || "").trim();
  if (!nom || (!kcal && !prot && !gluc && !lip)) return null;   // vraiment vide
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

// timeout individuel : un moteur qui ne répond pas en 6 s est abandonné
// (les autres continuent la course)
function avecTimeout(signal, ms = 6000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  signal?.addEventListener?.("abort", () => { clearTimeout(t); ctrl.abort(); });
  return { signal: ctrl.signal, fin: () => clearTimeout(t) };
}

async function viaSearchALicious(q, signal) {
  // pas de `fields` ici : le paramètre pouvait tronquer les documents et
  // vider les résultats — on prend la fiche complète, normalize() trie
  const { signal: sg, fin } = avecTimeout(signal);
  try {
    const url = "https://search.openfoodfacts.org/search" +
      `?q=${encodeURIComponent(q)}&langs=fr&page_size=${PAGE}`;
    const r = await fetch(url, { signal: sg });
    if (!r.ok) throw new Error("sal_" + r.status);
    const d = await r.json();
    const hits = d?.hits || d?.products;
    if (!Array.isArray(hits)) throw new Error("sal_shape");
    return hits;
  } finally { fin(); }
}

function viaLegacyBase(host) {
  return async function (q, signal) {
    const { signal: sg, fin } = avecTimeout(signal);
    try {
      const url = `https://${host}/cgi/search.pl` +
        `?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process` +
        `&json=1&page_size=${PAGE}&fields=${FIELDS}`;
      const r = await fetch(url, { signal: sg });
      if (!r.ok) throw new Error("legacy_" + r.status);
      const d = await r.json();
      if (!Array.isArray(d?.products)) throw new Error("legacy_shape");
      return d.products;
    } finally { fin(); }
  };
}
const viaLegacyFr    = viaLegacyBase("fr.openfoodfacts.org");
const viaLegacyWorld = viaLegacyBase("world.openfoodfacts.org");

// code-barres tapé au clavier → accès DIRECT à la fiche (instantané et exact)
async function viaBarcode(code, signal) {
  const { signal: sg, fin } = avecTimeout(signal);
  try {
    const r = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`, { signal: sg });
    if (!r.ok) throw new Error("barcode_" + r.status);
    const d = await r.json();
    return d?.status === 1 && d.product ? [d.product] : [];
  } finally { fin(); }
}

const inflight = new Map();

/** Meilleurs résultats déjà en cache pour le plus long préfixe de la requête.
 *  Permet d'afficher quelque chose INSTANTANÉMENT pendant que la recherche
 *  fraîche arrive : « nutell » montre les résultats de « nutel » sans attendre. */
export function cachedForPrefix(query) {
  const q = (query || "").trim().toLowerCase();
  if (q.length < 3) return [];
  const cache = readCache();
  for (let l = q.length; l >= 3; l--) {
    const hit = cache[q.slice(0, l)];
    if (hit && Date.now() - hit.t < TTL) return hit.r;
  }
  return [];
}

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

  // TROIS moteurs partent en parallèle : le premier qui renvoie des résultats
  // exploitables gagne. Un code-barres tapé au clavier court-circuite tout
  // (accès direct à la fiche, quasi instantané).
  const moteurs = /^\d{8,14}$/.test(q)
    ? [viaBarcode(q, signal)]
    : [viaSearchALicious(q, signal), viaLegacyFr(q, signal), viaLegacyWorld(q, signal)];
  const course = moteurs
    .map(pr => pr.then(brut => brut.map(normalize).filter(Boolean).slice(0, PAGE)));

  const p = new Promise(resolve => {
    let restants = course.length, fini = false;
    const done = (res) => {
      if (!fini && res && res.length) { fini = true; resolve(res); }
      else if (--restants <= 0 && !fini) { fini = true; resolve([]); }
    };
    course.forEach(pr => pr.then(done, () => done(null)));
  }).then(res => {
    if (res.length) {                    // on ne met en cache que les succès
      const c = readCache();
      c[q] = { r: res, t: Date.now() };
      writeCache(c);
    }
    return res;
  });

  inflight.set(q, p);
  p.finally(() => inflight.delete(q));
  return p;
}
