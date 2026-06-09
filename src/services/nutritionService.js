// @ts-check
// ─── NUTRITION SERVICE ────────────────────────────────────────────────────────

/**
 * Lit un fichier image et retourne son contenu base64.
 * @param {File} file
 * @returns {Promise<string>} base64 string
 */
export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) { reject(new Error("Aucun fichier")); return; }
    const r = new FileReader();
    r.onload  = () => resolve(/** @type {string} */ (r.result));
    r.onerror = () => reject(new Error("Erreur lecture fichier"));
    r.readAsDataURL(file);
  });
}

/**
 * Arrondi sécurisé : tolère undefined/null/NaN.
 * @param {number|undefined|null} v
 * @param {number} decimals
 */
function safeRound(v, decimals = 0) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  const m = 10 ** decimals;
  return Math.round(n * m) / m;
}

/**
 * Scan Open Food Facts — récupère maintenant fibres, sodium, sucres, saturées.
 * @param {string} code
 * @returns {Promise<import('../types').Aliment | {error: boolean}>}
 */
export async function scanBarcode(code) {
  try {
    if (!code || String(code).length < 6) return { error: true };

    const res  = await fetch(`https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(code)}.json`);
    if (!res.ok) return { error: true };
    const data = await res.json();
    if (data.status !== 1 || !data.product) return { error: true };

    const n = data.product.nutriments || {};

    return {
      n:   data.product.product_name_fr || data.product.product_name || "Produit",
      c:   safeRound(n["energy-kcal_100g"]),
      p:   safeRound(n.proteins_100g),
      g:   safeRound(n.carbohydrates_100g),
      l:   safeRound(n.fat_100g),
      // ── Champs enrichis (parenthèses corrigées pour le sodium) ──
      fi:  safeRound(n.fiber_100g, 1),                  // fibres (g)
      na:  safeRound((n.sodium_100g || 0) * 1000),      // sodium (mg) — ⚠️ () avant *
      su:  safeRound(n["sugars_100g"]),                 // sucres (g)
      sa:  safeRound(n["saturated-fat_100g"], 1),       // graisses saturées (g)
      cat: "Scanné",
    };
  } catch {
    return { error: true };
  }
}
