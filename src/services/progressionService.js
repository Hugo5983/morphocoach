// ─── PROGRESSION DE CHARGE ──────────────────────────────────────────────────
// Logique DÉTERMINISTE, sans IA : la recommandation de charge pour la prochaine
// séance se calcule à partir des séries réellement validées.
//
// Principe : DOUBLE PROGRESSION.
//   1. On progresse d'abord en RÉPÉTITIONS, dans la fourchette prescrite.
//   2. Quand le haut de fourchette est atteint sur TOUTES les séries, on
//      augmente la charge et on retombe en bas de fourchette.
// C'est la méthode de référence, et la seule qui reste sûre sans supervision.
//
// L'incrément dépend de l'objectif (un cycle de force ne progresse pas comme un
// cycle d'hypertrophie) ET du groupe musculaire (le bas du corps encaisse des
// sauts plus grands que les épaules).

import { groupeMusculaire } from "./muscleGroups.js";

const LOG_KEY = "morpho_workout_log";

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

/** Incréments en % de la charge, par objectif. */
const INCREMENTS = {
  force:           { pct: 0.05,  reps_cible: [3, 5],  seuil_series: 1.0, note: "Force : sauts nets, on privilégie la charge sur les répétitions." },
  hypertrophie:    { pct: 0.035, reps_cible: [8, 12], seuil_series: 1.0, note: "Hypertrophie : haut de fourchette atteint partout avant d'ajouter du poids." },
  perte_poids:     { pct: 0.025, reps_cible: [10, 15], seuil_series: 0.8, note: "Perte de graisse : la charge se maintient, elle protège le muscle." },
  prep_physique:   { pct: 0.04,  reps_cible: [4, 8],  seuil_series: 1.0, note: "Prépa physique : la vitesse d'exécution prime, on n'alourdit qu'à qualité constante." },
  sante:           { pct: 0.02,  reps_cible: [12, 15], seuil_series: 1.0, note: "Santé : progression lente et sans à-coup." },
  reathletisation: { pct: 0.02,  reps_cible: [12, 20], seuil_series: 1.0, note: "Réathlétisation : la charge suit la tolérance, jamais l'inverse." },
};

/** Groupes du bas du corps : paliers absolus plus larges. */
const BAS_DU_CORPS = ["Quadriceps", "Ischio-jambiers", "Fessiers", "Mollets", "Lombaires"];

/** Palier minimal réalisable en salle, selon le groupe. */
function palierMini(groupe) {
  if (BAS_DU_CORPS.includes(groupe)) return 5;      // disques de 2,5 kg par côté
  if (groupe === "Épaules" || groupe === "Biceps" || groupe === "Triceps" ||
      groupe === "Avant-bras") return 1;            // haltères de 1 kg
  return 2.5;
}

// Résolution déléguée : le catalogue client ne couvrait que 19 % des exercices
// prescriptibles, ce qui donnait un palier de progression faux sur les autres.
const groupeDe = groupeMusculaire;

/**
 * Arrondit à un palier réalisable (pas de 33,7 kg en salle).
 * Le SENS compte : à la hausse on arrondit VERS LE HAUT, sinon un incrément de
 * 3,5 % sur 32 kg retombait à 32,5 kg — un demi-kilo au lieu d'un vrai palier,
 * et la force donnait exactement le même résultat que l'hypertrophie.
 * @param {number} kg
 * @param {string} groupe
 * @param {"haut"|"bas"} sens
 */
function arrondirPalier(kg, groupe, sens = "haut") {
  const pas = palierMini(groupe);
  return sens === "haut"
    ? Math.ceil(kg / pas) * pas
    : Math.floor(kg / pas) * pas;
}

/** Normalise un objectif vers une clé d'incrément. */
function clefObjectif(objectif) {
  const k = String(objectif || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (k.includes("force")) return "force";
  if (k.includes("poids") || k.includes("seche") || k.includes("perte")) return "perte_poids";
  if (k.includes("prep") || k.includes("physique") || k.includes("puissance")) return "prep_physique";
  if (k.includes("sante")) return "sante";
  if (k.includes("reathle")) return "reathletisation";
  return "hypertrophie";
}

/** Extrait le haut de fourchette d'une prescription "8-10" / "8 à 10" / "10". */
export function parseRepsCible(reps, defaut) {
  const nums = String(reps || "").match(/\d+/g);
  if (!nums?.length) return defaut;
  return { bas: parseInt(nums[0]), haut: parseInt(nums[nums.length - 1]) };
}

/**
 * Charge de départ à afficher pour un exercice, en séance.
 * Corrige au passage un défaut réel : parseFloat("70-75% 1RM") renvoyait 70,
 * donc l'app proposait 70 kg pour une consigne en pourcentage.
 * @param {{nom?: string, charge?: string}} ex
 * @param {string} objectif
 * @returns {{kg: number|null, source: "reco"|"prescrite"|"defaut", note?: string}}
 */
export function chargeDepart(ex, objectif = "hypertrophie") {
  const reco = getChargeRecommandee(ex?.nom, { objectif, repsPrescrites: ex?.reps });
  if (reco.available) return { kg: reco.kg, source: "reco", note: reco.raison };

  const brut = String(ex?.charge || "");
  // Un pourcentage n'est PAS un poids : ne jamais le convertir en kilos.
  if (/%/.test(brut)) return { kg: null, source: "defaut", note: "Charge à trouver sur les séries d'approche." };
  const n = parseFloat(brut.replace(",", "."));
  if (isFinite(n) && n > 0) return { kg: n, source: "prescrite" };
  return { kg: null, source: "defaut" };
}

/**
 * Recommandation de charge pour la PROCHAINE séance d'un exercice.
 * @param {string} exNom
 * @param {{objectif?: string, repsPrescrites?: string}} opts
 * @returns {{available: boolean, kg?: number, precedente?: number, delta?: number,
 *            raison?: string, action?: "augmenter"|"maintenir"|"reduire", reason?: string}}
 */
export function getChargeRecommandee(exNom, { objectif = "hypertrophie", repsPrescrites } = {}) {
  if (!exNom) return { available: false, reason: "Exercice inconnu" };

  const log = readJSON(LOG_KEY, {});
  // Toutes les séances où cet exercice apparaît, de la plus ancienne à la plus récente.
  const seances = Object.entries(log)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, day]) => ({
      date,
      sets: (day?.sets || []).filter(s => s?.exNom === exNom
        && Number(s.kg) > 0 && Number(s.reps) > 0),
    }))
    .filter(s => s.sets.length > 0);

  if (seances.length === 0) {
    return { available: false, reason: "Aucune série validée sur cet exercice" };
  }

  const cfg = INCREMENTS[clefObjectif(objectif)];
  const derniere = seances[seances.length - 1];
  const groupe = groupeDe(exNom);
  const cible = parseRepsCible(repsPrescrites, { bas: cfg.reps_cible[0], haut: cfg.reps_cible[1] });

  // Charge de travail de la dernière séance = charge la plus fréquente
  // (et non la plus lourde : une série d'approche ne doit pas fausser le calcul).
  const parCharge = {};
  derniere.sets.forEach(s => { parCharge[s.kg] = (parCharge[s.kg] || 0) + 1; });
  const chargeTravail = Number(
    Object.entries(parCharge).sort((a, b) => b[1] - a[1] || Number(b[0]) - Number(a[0]))[0][0]
  );
  const setsTravail = derniere.sets.filter(s => Number(s.kg) === chargeTravail);
  const atteignent = setsTravail.filter(s => Number(s.reps) >= cible.haut).length;
  const ratio = setsTravail.length ? atteignent / setsTravail.length : 0;
  const repsMin = Math.min(...setsTravail.map(s => Number(s.reps)));

  // ── Décision ──
  // 1. Haut de fourchette atteint sur assez de séries → on monte.
  if (ratio >= cfg.seuil_series) {
    const brut = chargeTravail * (1 + cfg.pct);
    let kg = arrondirPalier(brut, groupe, "haut");
    if (kg <= chargeTravail) kg = chargeTravail + palierMini(groupe);  // garantir un vrai palier
    return {
      available: true, kg, precedente: chargeTravail,
      delta: Math.round((kg - chargeTravail) * 10) / 10,
      action: "augmenter",
      raison: `${cible.haut} répétitions atteintes sur toutes les séries à ${chargeTravail} kg. ${cfg.note}`,
    };
  }

  // 2. Sous le bas de fourchette → charge trop lourde, on redescend.
  if (repsMin < cible.bas) {
    const brut = chargeTravail * 0.95;
    let kg = arrondirPalier(brut, groupe, "bas");
    if (kg >= chargeTravail) kg = chargeTravail - palierMini(groupe);
    return {
      available: true, kg: Math.max(palierMini(groupe), kg), precedente: chargeTravail,
      delta: Math.round((kg - chargeTravail) * 10) / 10,
      action: "reduire",
      raison: `Seulement ${repsMin} répétitions au minimum pour une cible de ${cible.bas}. On allège pour retrouver la qualité d'exécution.`,
    };
  }

  // 3. Dans la fourchette → on reste, on gagne des répétitions.
  return {
    available: true, kg: chargeTravail, precedente: chargeTravail, delta: 0,
    action: "maintenir",
    raison: `Tu es dans la fourchette (${repsMin}-${cible.haut}). Garde ${chargeTravail} kg et vise ${cible.haut} répétitions sur toutes les séries avant d'ajouter du poids.`,
  };
}

/**
 * Toutes les recommandations d'une séance, pour l'aperçu avant de commencer.
 * @param {{exercices?: {nom?: string, reps?: string}[]}} seance
 * @param {string} objectif
 */
export function getRecommandationsSeance(seance, objectif = "hypertrophie") {
  return (seance?.exercices || []).map(ex => ({
    nom: ex?.nom,
    ...getChargeRecommandee(ex?.nom, { objectif, repsPrescrites: ex?.reps }),
  }));
}

/**
 * Bilan des charges atteintes sur un cycle : sert à archiver le point
 * d'arrivée pour que le cycle suivant reparte de là.
 * @param {number} joursEnArriere
 */
export function bilanChargesCycle(joursEnArriere = 60) {
  const log = readJSON(LOG_KEY, {});
  const limite = new Date();
  limite.setDate(limite.getDate() - joursEnArriere);

  /** @type {Record<string, {kg: number, reps: number, date: string}>} */
  const best = {};
  Object.entries(log).forEach(([date, day]) => {
    if (new Date(date) < limite) return;
    (day?.sets || []).forEach(s => {
      const kg = Number(s.kg) || 0, reps = Number(s.reps) || 0;
      if (!s.exNom || !kg || !reps) return;
      const cur = best[s.exNom];
      if (!cur || kg > cur.kg || (kg === cur.kg && reps > cur.reps)) {
        best[s.exNom] = { kg, reps, date };
      }
    });
  });
  return best;
}


// ═══════════════════════════════════════════════════════════════════════════
// SÉRIES D'APPROCHE (ramp-up)
// ═══════════════════════════════════════════════════════════════════════════
// Un coach ne met JAMAIS un athlète directement à sa charge de travail sur un
// mouvement lourd. On monte progressivement : ça prépare le système nerveux,
// ça révèle la forme du jour, et c'est là que se jouent la plupart des
// blessures évitables.
//
// Règle appliquée : plus la charge est lourde et l'objectif orienté force,
// plus il faut de paliers. Sur de l'isolation légère, aucune approche.
//
// IMPORTANT : ces séries ne comptent PAS dans le volume d'entraînement.
// Les compter fausserait le calcul MEV/MAV/MRV et le score de récupération.

/** Nombre de paliers selon l'objectif et la lourdeur du mouvement. */
const PALIERS = {
  force:           [0.50, 0.70, 0.85],
  prep_physique:   [0.50, 0.75],
  hypertrophie:    [0.55, 0.80],
  perte_poids:     [0.60],
  sante:           [0.60],
  reathletisation: [0.50, 0.70],
};

/** Catégories qui méritent une montée en charge. */
const MERITE_APPROCHE = new Set(["principal"]);

/**
 * Séries d'approche à effectuer avant la première série de travail.
 *
 * @param {{nom?: string, cat?: string}} ex
 * @param {number|null} chargeTravail charge de travail en kg (null = inconnue)
 * @param {{objectif?: string, repsTravail?: number}} [opts]
 * @returns {{kg: number, reps: number, repos: string, note: string}[]}
 */
export function getSeriesApproche(ex, chargeTravail, opts = {}) {
  const kg = Number(chargeTravail);
  if (!kg || kg <= 0) return [];

  const groupe = groupeDe(ex?.nom);
  // L'isolation et le gainage ne demandent pas de montée en charge : le risque
  // articulaire est faible et l'approche mangerait du temps pour rien.
  const cat = ex?.cat || (MERITE_APPROCHE.has(ex?.cat) ? ex.cat : null);
  const estPrincipal = !cat || MERITE_APPROCHE.has(cat);
  if (!estPrincipal) return [];

  // Charges légères : une seule série d'approche suffit, voire aucune.
  const seuil = BAS_DU_CORPS.includes(groupe) ? 40 : 20;
  if (kg < seuil) return [];

  const k = clefObjectif(opts.objectif);
  let ratios = PALIERS[k] || PALIERS.hypertrophie;
  // Charge modérée : on retire le palier le plus bas, il n'apporte rien.
  if (kg < seuil * 2.5 && ratios.length > 1) ratios = ratios.slice(1);

  const repsTravail = Number(opts.repsTravail) || 10;
  return ratios.map((r, i) => {
    const brut = kg * r;
    const arrondi = arrondirPalier(brut, groupe, "bas");
    // Plus on approche de la charge de travail, moins on fait de répétitions :
    // on prépare le geste, on ne fatigue pas.
    const reps = i === 0 ? Math.min(10, repsTravail + 2)
               : i === ratios.length - 1 ? Math.max(2, Math.round(repsTravail / 3))
               : Math.max(3, Math.round(repsTravail / 2));
    return {
      kg: Math.max(arrondirPalier(seuil / 2, groupe, "bas"), arrondi),
      reps,
      repos: i === ratios.length - 1 ? "60-90s" : "30-45s",
      note: i === 0 ? "Mise en route — geste ample et contrôlé"
          : i === ratios.length - 1 ? "Dernier palier — se rapprocher de la sensation de travail"
          : "Montée en charge",
    };
  });
}
