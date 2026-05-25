// ─── NUTRITION SERVICE ──────────────────────────────────────────────────────
const OFF_BASE = "https://world.openfoodfacts.org/api/v0/product";

export async function scanBarcode(code) {
  if (!code || code.length < 8) return null;
  try {
    const r = await fetch(`${OFF_BASE}/${code}.json`);
    const data = await r.json();
    if (data.status !== 1) return { error: true };
    const n = data.product.nutriments || {};
    return {
      n: data.product.product_name_fr || data.product.product_name || "Produit",
      c: Math.round(n["energy-kcal_100g"] || 0),
      p: Math.round(n.proteins_100g || 0),
      g: Math.round(n.carbohydrates_100g || 0),
      l: Math.round(n.fat_100g || 0),
      cat: "Scanné",
    };
  } catch { return { error: true }; }
}

export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) { reject(new Error("Aucun fichier")); return; }
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("Erreur lecture fichier"));
    r.readAsDataURL(file);
  });
}
