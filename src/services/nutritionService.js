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
    r.onload = () => resolve(/** @type {string} */ (r.result));
    r.onerror = () => reject(new Error("Erreur lecture fichier"));
    r.readAsDataURL(file);
  });
}

/**
 * Scan Open Food Facts — récupère maintenant fibres, sodium, sucres, saturées.
 * @param {string} code
 * @returns {Promise<import('../types').Aliment | {error: boolean}>}
 */
export async function scanBarcode(code) {
  try {
    const res  = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
    const data = await res.json();
    if (data.status !== 1) return { error: true };
    const n = data.product.nutriments || {};
    const marque = (data.product.brands || "").split(",")[0].trim();
    return {
      n:      data.product.product_name_fr || data.product.product_name || "Produit",
      c:      Math.round(n["energy-kcal_100g"] || 0),
      p:      Math.round(n.proteins_100g      || 0),
      g:      Math.round(n.carbohydrates_100g || 0),
      l:      Math.round(n.fat_100g           || 0),
      // ── Champs enrichis ──
      fi:     Math.round((n.fiber_100g              || 0) * 10) / 10,  // fibres (g)
      na:     Math.round(n.sodium_100g * 1000        || 0),             // sodium (mg)
      su:     Math.round(n["sugars_100g"]            || 0),             // sucres (g)
      sa:     Math.round((n["saturated-fat_100g"]    || 0) * 10) / 10, // graisses saturées (g)
      cat:    "Scanné",
      // ── Affichage produit (marque, Nutri-Score, photo) ──
      brand:      marque || null,
      nutriscore: /^[a-e]$/i.test(data.product.nutriscore_grade || "")
                    ? data.product.nutriscore_grade.toUpperCase() : null,
      img:        data.product.image_front_small_url || data.product.image_small_url || null,
      code,
    };
  } catch { return { error: true }; }
}
