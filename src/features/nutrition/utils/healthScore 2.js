// ─── HEALTH SCORE ───────────────────────────────────────────────────────────
// Calcule un score nutritionnel (0-100) avec note A-E.

export function computeHealthScore(repas, eau, tot, pObj) {
  let score = 100;
  const allItems = [
    ...repas.matin, ...repas.midi, ...repas.soir, ...repas.snack,
  ];
  const sucres = allItems.reduce((a, f) => a + (f.sucres || 0), 0);
  const fibres = allItems.reduce((a, f) => a + (f.fibres || 0), 0);
  const transformes = allItems.filter(
    (f) => f.cat === "Transformé" || f.cat === "Scanné"
  ).length;

  if (sucres > 25) score -= 20;
  else if (sucres > 15) score -= 10;
  if (transformes > 2) score -= 15;
  else if (transformes > 1) score -= 8;
  if (fibres < 15) score -= 10;
  if (eau < 6) score -= 15;
  if (eau < 4) score -= 25;
  if (tot.p < pObj * 0.7) score -= 10;
  const repasNonVides = [repas.matin, repas.midi, repas.soir].filter(
    (r) => r.length > 0
  ).length;
  if (repasNonVides < 2) score -= 10;

  score = Math.max(0, Math.min(100, score));

  const lettre =
    score >= 85 ? "A" :
    score >= 70 ? "B" :
    score >= 55 ? "C" :
    score >= 40 ? "D" : "E";

  const color =
    score >= 85 ? "#3ec77a" :
    score >= 70 ? "#8BC34A" :
    score >= 55 ? "#FFAB5D" :
    score >= 40 ? "#FF7043" : "#FF7A6B";

  const details = [
    { l: "Sucres ajoutés",       ok: sucres <= 15,        icon: "🍬" },
    { l: "Aliments transformés", ok: transformes <= 1,   icon: "🏭" },
    { l: "Hydratation",          ok: eau >= 6,            icon: "💧" },
    { l: "Apport protéines",     ok: tot.p >= pObj * 0.8, icon: "💪" },
    { l: "Diversité repas",      ok: repasNonVides >= 2,  icon: "🥗" },
  ];

  return { score, lettre, color, details };
}
