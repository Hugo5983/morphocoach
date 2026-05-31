// @ts-check
// ─── HEALTH SCORE v2 ──────────────────────────────────────────────────────────
// Score nutritionnel 0-100 basé sur 8 critères pondérés.
// Chaque critère retourne { pts, max, pct, status, value, tip }.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {import('../../../types').Repas} repas
 * @param {number} eau
 * @param {import('../../../types').TotauxNutri} tot
 * @param {number} pObj
 * @param {number} gObj
 * @param {number} lObj
 * @param {import('../../../types').Profil} profil
 * @returns {{ score:number, lettre:string, color:string, details:CritereDetail[] }}
 */
export function computeHealthScore(repas, eau, tot, pObj, gObj, lObj, profil) {
  const allItems = [
    ...repas.matin, ...repas.midi, ...repas.soir, ...repas.snack,
  ];

  // ── Agréger les champs enrichis ──────────────────────────────────────────
  const fibres   = allItems.reduce((a, f) => a + (f.fi  || 0), 0);
  const sodium   = allItems.reduce((a, f) => a + (f.na  || 0), 0);
  const sucres   = allItems.reduce((a, f) => a + (f.su  || 0), 0);
  const saturees = allItems.reduce((a, f) => a + (f.sa  || 0), 0);
  const omega3Items  = allItems.filter(f => f.omega3).length;
  const qualProtItems= allItems.filter(f => f.qualProt).length;
  const transformes  = allItems.filter(f => f.cat === "Transformé" || f.cat === "Scanné").length;
  const repasNonVides= [repas.matin, repas.midi, repas.soir].filter(r => r.length > 0).length;

  // Catégories denses
  const portionsLegumes = allItems.filter(f => f.cat === "Légumes").length;
  const portionsFruits  = allItems.filter(f => f.cat === "Fruits").length;
  const portionsOleagineux = allItems.filter(f => f.cat === "Lipides").length;

  // Objectif hydratation adapté au poids (30 ml/kg, verre = 250ml)
  const poidsKg    = parseFloat(/** @type {any} */ (profil)?.poids) || 70;
  const eauObj     = Math.round((poidsKg * 30) / 250); // verres/jour
  const eauPct     = Math.min(100, Math.round((eau / eauObj) * 100));

  // ── Critère 1 : Répartition macros (20 pts) ──────────────────────────────
  const pPct = pObj > 0 ? Math.min(100, Math.round((tot.p / pObj) * 100)) : 0;
  const gPct = gObj > 0 ? Math.min(100, Math.round((tot.g / gObj) * 100)) : 0;
  const lPct = lObj > 0 ? Math.min(100, Math.round((tot.l / lObj) * 100)) : 0;
  const macroScore = Math.round(
    (Math.min(pPct, 100) * 0.5 + Math.min(gPct, 100) * 0.25 + Math.min(lPct, 100) * 0.25) / 100 * 20
  );
  /** @type {CritereDetail} */
  const c1 = {
    id: "macros", icon: "🎯", label: "Répartition macros",
    pts: macroScore, max: 20,
    status: macroScore >= 16 ? "ok" : macroScore >= 10 ? "warn" : "bad",
    value: `P ${pPct}% · G ${gPct}% · L ${lPct}%`,
    tip: pPct < 70 ? "Augmente ton apport en protéines" :
         gPct < 60 ? "Ajoute des glucides complexes" :
         "Bonne répartition des macros",
  };

  // ── Critère 2 : Qualité protéines (15 pts) ───────────────────────────────
  const qualProtScore = Math.min(15, qualProtItems * 4 + omega3Items * 3);
  /** @type {CritereDetail} */
  const c2 = {
    id: "qualProt", icon: "🥩", label: "Qualité protéines",
    pts: qualProtScore, max: 15,
    status: qualProtScore >= 12 ? "ok" : qualProtScore >= 6 ? "warn" : "bad",
    value: `${qualProtItems} source${qualProtItems > 1 ? "s" : ""} de qualité${omega3Items > 0 ? ` · ${omega3Items} oméga-3` : ""}`,
    tip: omega3Items === 0 ? "Ajoute du saumon, thon ou œufs pour les oméga-3" :
         qualProtItems < 2 ? "Varie tes sources de protéines" :
         "Excellentes sources de protéines",
  };

  // ── Critère 3 : Fibres (15 pts) ──────────────────────────────────────────
  const fiScore = fibres >= 25 ? 15 : fibres >= 15 ? 10 : fibres >= 8 ? 5 : 0;
  /** @type {CritereDetail} */
  const c3 = {
    id: "fibres", icon: "🌾", label: "Apport en fibres",
    pts: fiScore, max: 15,
    status: fibres >= 25 ? "ok" : fibres >= 15 ? "warn" : "bad",
    value: `${fibres.toFixed(1)} g`,
    tip: fibres < 15 ? "Objectif : 25g/jour. Ajoute légumes et céréales complètes" :
         fibres < 25 ? "Bien ! Quelques légumes supplémentaires pour atteindre 25g" :
         "Excellent apport en fibres",
  };

  // ── Critère 4 : Hydratation intelligente (15 pts) ────────────────────────
  const hydraScore = eauPct >= 100 ? 15 : eauPct >= 75 ? 10 : eauPct >= 50 ? 5 : 0;
  /** @type {CritereDetail} */
  const c4 = {
    id: "hydra", icon: "💧", label: "Hydratation",
    pts: hydraScore, max: 15,
    status: eauPct >= 100 ? "ok" : eauPct >= 75 ? "warn" : "bad",
    value: `${eau}/${eauObj} verres (${eauPct}%)`,
    tip: eauPct < 50 ? `Objectif ${eauObj} verres/jour (30ml × ${Math.round(poidsKg)}kg)` :
         eauPct < 100 ? `Encore ${eauObj - eau} verre${eauObj - eau > 1 ? "s" : ""} pour atteindre ton objectif` :
         "Hydratation optimale !",
  };

  // ── Critère 5 : Densité nutritionnelle (15 pts) ──────────────────────────
  const portionsDenses = portionsLegumes + portionsFruits + portionsOleagineux;
  const densScore = portionsDenses >= 5 ? 15 : portionsDenses >= 3 ? 10 : portionsDenses >= 1 ? 5 : 0;
  /** @type {CritereDetail} */
  const c5 = {
    id: "densite", icon: "🥦", label: "Densité nutritionnelle",
    pts: densScore, max: 15,
    status: portionsDenses >= 5 ? "ok" : portionsDenses >= 3 ? "warn" : "bad",
    value: `${portionsLegumes} légumes · ${portionsFruits} fruits · ${portionsOleagineux} oléagineux`,
    tip: portionsLegumes === 0 ? "Ajoute des légumes à au moins 2 repas" :
         portionsDenses < 3 ? "Objectif : 5 portions de fruits & légumes/jour" :
         "Belle diversité végétale",
  };

  // ── Critère 6 : Qualité lipides (10 pts) ─────────────────────────────────
  const satMax   = Math.max(1, tot.l * 0.3); // max 30% des lipides totaux
  const satRatio = saturees > 0 ? Math.min(1, saturees / satMax) : 0;
  const lipScore = omega3Items >= 2 ? 10 :
                   omega3Items >= 1 && satRatio < 0.5 ? 8 :
                   satRatio < 0.3 ? 7 :
                   satRatio < 0.6 ? 4 : 1;
  /** @type {CritereDetail} */
  const c6 = {
    id: "lipides", icon: "🥑", label: "Qualité des lipides",
    pts: lipScore, max: 10,
    status: lipScore >= 8 ? "ok" : lipScore >= 5 ? "warn" : "bad",
    value: `${saturees.toFixed(1)}g saturées · ${omega3Items} source${omega3Items > 1 ? "s" : ""} oméga-3`,
    tip: omega3Items === 0 ? "Ajoute avocat, amandes ou huile olive pour les bons lipides" :
         satRatio > 0.5 ? "Limite les graisses saturées" :
         "Bon équilibre lipidique",
  };

  // ── Critère 7 : Sucres & charge glycémique (5 pts) ───────────────────────
  const sucreScore = sucres <= 25 ? 5 : sucres <= 40 ? 3 : sucres <= 60 ? 1 : 0;
  /** @type {CritereDetail} */
  const c7 = {
    id: "sucres", icon: "🍭", label: "Sucres & charge glycémique",
    pts: sucreScore, max: 5,
    status: sucres <= 25 ? "ok" : sucres <= 40 ? "warn" : "bad",
    value: `${Math.round(sucres)} g de sucres`,
    tip: sucres > 40 ? "Limite les sucres ajoutés (max 25g recommandé)" :
         sucres > 25 ? "Attention aux sucres cachés" :
         "Apport en sucres maîtrisé",
  };

  // ── Critère 8 : Sodium (5 pts) ───────────────────────────────────────────
  const sodiumScore = sodium <= 1500 ? 5 : sodium <= 2300 ? 3 : sodium <= 3000 ? 1 : 0;
  /** @type {CritereDetail} */
  const c8 = {
    id: "sodium", icon: "🧂", label: "Apport en sodium",
    pts: sodiumScore, max: 5,
    status: sodium <= 1500 ? "ok" : sodium <= 2300 ? "warn" : "bad",
    value: sodium > 0 ? `${Math.round(sodium)} mg` : "Non disponible",
    tip: sodium > 2300 ? "Limite le sel ajouté (max 2300mg/jour)" :
         sodium > 1500 ? "Apport correct, reste vigilant" :
         "Excellent contrôle du sodium",
  };

  // ── Score total ──────────────────────────────────────────────────────────
  const details = [c1, c2, c3, c4, c5, c6, c7, c8];
  const totalPts = details.reduce((a, d) => a + d.pts, 0);
  const totalMax = details.reduce((a, d) => a + d.max, 0); // = 100
  const score    = Math.max(0, Math.min(100, Math.round(totalPts / totalMax * 100)));

  const lettre =
    score >= 85 ? "A" :
    score >= 70 ? "B" :
    score >= 55 ? "C" :
    score >= 40 ? "D" : "E";

  const color =
    score >= 85 ? "#34D399" :
    score >= 70 ? "#86EFAC" :
    score >= 55 ? "#FBBF24" :
    score >= 40 ? "#FB923C" : "#F87171";

  return { score, lettre, color, details };
}

/**
 * @typedef {{
 *   id: string,
 *   icon: string,
 *   label: string,
 *   pts: number,
 *   max: number,
 *   status: "ok"|"warn"|"bad",
 *   value: string,
 *   tip: string,
 * }} CritereDetail
 */
