// ─── SUBSTITUTION D'EXERCICE & RÉACTION À LA DOULEUR ────────────────────────
// AUCUN appel IA : tout se décide sur le catalogue (812 exercices) et
// l'historique local. Fonctionne hors ligne, en pleine séance, instantanément.
//
// Deux besoins distincts :
//   1. VARIANTE — machine occupée, matériel absent, envie de changer.
//   2. DOULEUR  — la réponse doit être GRADUÉE, pas binaire. Supprimer un
//      exercice à la première gêne est une faute de coach : on regarde d'abord
//      depuis quand la douleur existe, si elle monte, et à quelle semaine on est.

import { CATALOGUE, PAR_NOM } from "../data/catalogue.js";
import { groupeMusculaire } from "./muscleGroups.js";

const FEEDBACK_KEY = "mc_exoFeedback";

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

const norm = (s) => String(s || "").toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

/** Matériels réellement disponibles à partir des cases cochées au formulaire. */
const MAP_EQUIP = {
  salle_complete: ["haltères", "barre", "poulie", "machine", "élastique", "TRX",
                   "kettlebell", "bosu", "medecine ball", "swiss ball", "poids de corps", "accessoire"],
  halteres:       ["haltères", "poids de corps", "accessoire"],
  machines:       ["machine", "poulie", "poids de corps", "accessoire"],
  elastiques:     ["élastique", "poids de corps", "accessoire"],
  poids_corps:    ["poids de corps", "accessoire"],
  barre_traction: ["poids de corps", "accessoire"],
  medecine_ball:  ["medecine ball", "poids de corps", "accessoire"],
  swiss_ball:     ["swiss ball", "poids de corps", "accessoire"],
  bosu:           ["bosu", "poids de corps", "accessoire"],
  kettlebell:     ["kettlebell", "poids de corps", "accessoire"],
  trx:            ["TRX", "poids de corps", "accessoire"],
};

function materielsDispo(materiel = []) {
  const s = new Set(["poids de corps", "accessoire"]);
  (materiel || []).forEach(m => (MAP_EQUIP[m] || []).forEach(x => s.add(x)));
  // Aucun matériel déclaré : on n'invente pas de contrainte, tout est permis.
  if (!materiel?.length) CATALOGUE.forEach(e => s.add(e.mat));
  return s;
}

const ORDRE_NIVEAU = { "Débutant": 0, "Intermédiaire": 1, "Avancé": 2 };

/**
 * Retrouve un exercice au catalogue même si le nom n'est pas exact.
 * Un programme peut contenir une variante orthographique ("Développé militaire
 * barre" pour "Développé militaire barre debout") : sans cette tolérance, la
 * substitution partait sans référence et proposait n'importe quoi.
 */
export function resoudreExercice(nom) {
  const bas = String(nom || "").toLowerCase();
  if (PAR_NOM[bas]) return PAR_NOM[bas];
  const n = norm(nom);
  if (!n) return null;
  // Correspondance par inclusion, en privilégiant le nom le plus proche en longueur.
  const proches = CATALOGUE.filter(e => {
    const en = norm(e.n);
    return en.startsWith(n) || n.startsWith(en);
  });
  if (!proches.length) return null;
  return proches.sort((a, b) =>
    Math.abs(norm(a.n).length - n.length) - Math.abs(norm(b.n).length - n.length))[0];
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. VARIANTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Alternatives à un exercice, classées de la plus proche à la plus éloignée.
 *
 * Le classement suit la logique d'un coach :
 *   1. même famille de mouvement (champ `parent`) → le geste le plus proche
 *   2. même groupe ET même catégorie (principal ↔ principal)
 *   3. même groupe, catégorie différente
 * À score égal, on privilégie le matériel identique puis le niveau adapté.
 *
 * @param {string} exNom
 * @param {{materiel?: string[], niveau?: string, exclure?: string[],
 *          interdits?: string[], max?: number}} [opts]
 * @returns {{n: string, groupe: string, mat: string, cat: string, raison: string}[]}
 */
export function getVariantes(exNom, opts = {}) {
  const { materiel = [], niveau = "intermediaire", exclure = [], interdits = [], max = 4 } = opts;
  const src = resoudreExercice(exNom);
  const groupe = src?.groupe || groupeMusculaire(exNom);
  if (!groupe || groupe === "Autre") return [];

  const dispo = materielsDispo(materiel);
  const nivMax = niveau === "debutant" ? 0 : niveau === "avance" ? 2 : 1;
  const exclus = new Set([norm(exNom), ...exclure.map(norm)]);
  const bannis = new Set(interdits.map(norm));

  // Racine de la famille : un exercice et son parent partagent le même geste.
  const racine = norm(src?.parent || src?.n || exNom);

  const catSrc = src?.cat || "principal";
  const candidats = CATALOGUE.filter(e => {
    if (e.groupe !== groupe) return false;
    // Un exercice de rééducation ne remplace pas un mouvement de construction :
    // il ne charge pas le muscle de la même façon. Il n'entre dans la liste que
    // si l'on remplace précisément un correctif, ou si la douleur l'impose
    // (opts.correctifsOK).
    if (e.cat === "correctif" && catSrc !== "correctif" && !opts.correctifsOK) return false;
    if (exclus.has(norm(e.n))) return false;
    if (bannis.has(norm(e.n))) return false;
    if (!dispo.has(e.mat)) return false;
    if (e.niveau && ORDRE_NIVEAU[e.niveau] > nivMax) return false;
    return true;
  });

  const score = (e) => {
    let s = 0;
    const memeFamille = norm(e.parent || "") === racine || norm(e.n) === racine;
    if (memeFamille)            s += 100;
    if (e.cat === catSrc)       s += 60;
    else if (e.cat === "isolation" && catSrc === "principal") s -= 15;
    if (e.mat === src?.mat)     s += 20;
    if (e.niveau && ORDRE_NIVEAU[e.niveau] === nivMax) s += 5;
    return s;
  };

  const raison = (e) => {
    if (norm(e.parent || "") === racine || norm(e.n) === racine)
      return "Même mouvement, variante directe";
    if (e.cat === src?.cat && e.mat === src?.mat) return "Même rôle, même matériel";
    if (e.cat === src?.cat) return `Même rôle, sur ${e.mat}`;
    return `${e.groupe} · ${e.mat}`;
  };

  return candidats
    .map(e => ({ ...e, _s: score(e) }))
    .sort((a, b) => b._s - a._s || a.n.localeCompare(b.n))
    .slice(0, max)
    .map(({ _s, niveau: _n, parent: _p, ...e }) => ({ ...e, raison: raison(e) }));
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. DOULEUR — réponse graduée
// ═══════════════════════════════════════════════════════════════════════════
// Échelle du feedback existant : 0 aucune · 1 légère · 2 gêne · 3 stop.

/** Historique de douleur d'un exercice, du plus ancien au plus récent. */
export function historiqueDouleur(exNom) {
  const all = readJSON(FEEDBACK_KEY, {});
  const list = all?.[exNom] || [];
  return list
    .filter(f => typeof f?.pain === "number")
    .map(f => ({ date: f.date, pain: f.pain }))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

/**
 * Décide quoi faire d'une douleur signalée, MAINTENANT.
 *
 * Principe de coach, et non d'algorithme brutal :
 * - douleur 3 (stop) → on arrête l'exercice, quelle que soit la semaine ;
 * - semaine 1 avec gêne → l'exercice ne convient probablement pas à cette
 *   morphologie, on propose de le remplacer tout de suite ;
 * - au-delà, si la douleur MONTE alors qu'elle était basse → on alerte, on
 *   allège et on revoit la technique ; on ne supprime PAS un exercice qui
 *   fonctionnait ;
 * - gêne isolée et stable → on allège légèrement et on surveille.
 *
 * @param {string} exNom
 * @param {number} pain 0-3, valeur signalée à l'instant
 * @param {{semaine?: number, chargeActuelle?: number}} [ctx]
 * @returns {{action: "aucune"|"surveiller"|"alleger"|"remplacer"|"stop",
 *            severite: "info"|"attention"|"critique",
 *            titre: string, message: string,
 *            chargeSuggeree?: number|null, proposerVariante: boolean,
 *            tendance: "nouvelle"|"stable"|"aggravation"|"amelioration"}}
 */
export function evaluerDouleur(exNom, pain, ctx = {}) {
  const semaine = Number(ctx.semaine) || 1;
  const charge = Number(ctx.chargeActuelle) || null;
  const hist = historiqueDouleur(exNom);
  const passees = hist.map(h => h.pain);
  const maxPasse = passees.length ? Math.max(...passees) : 0;
  const moyPassee = passees.length
    ? passees.reduce((a, b) => a + b, 0) / passees.length : 0;

  let tendance = "nouvelle";
  if (passees.length >= 1) {
    if (pain > maxPasse) tendance = "aggravation";
    else if (pain < moyPassee) tendance = "amelioration";
    else tendance = "stable";
  }

  const moins = (pct) => (charge ? Math.max(1, Math.round(charge * (1 - pct) * 2) / 2) : null);

  // ── Douleur vive : on ne discute pas ──
  if (pain >= 3) {
    return {
      action: "stop", severite: "critique",
      titre: "On arrête cet exercice",
      message: "Une douleur vive n'est pas de la fatigue musculaire. On stoppe ici et on passe à une alternative "
        + "qui sollicite le même muscle sans la zone sensible. Si elle persiste au repos ou revient hors séance, "
        + "consulte un professionnel de santé.",
      chargeSuggeree: null, proposerVariante: true, tendance,
    };
  }

  // ── Gêne dès la première semaine : mauvais choix d'exercice ──
  if (pain >= 2 && semaine <= 1) {
    return {
      action: "remplacer", severite: "attention",
      titre: "Cet exercice ne semble pas te convenir",
      message: "Une gêne dès la première séance vient rarement de la charge : c'est plus souvent le mouvement qui "
        + "ne correspond pas à ta morphologie. Autant le remplacer maintenant par une variante du même groupe "
        + "plutôt que d'insister six semaines.",
      chargeSuggeree: null, proposerVariante: true, tendance,
    };
  }

  // ── La douleur monte alors qu'elle était basse : le signal à ne pas rater ──
  if (pain >= 2 && tendance === "aggravation" && maxPasse <= 1) {
    return {
      action: "alleger", severite: "attention",
      titre: "La gêne augmente sur cet exercice",
      message: `Tu ne ressentais rien ou presque jusqu'ici (${maxPasse}/3), et c'est monté à ${pain}/3 en semaine ${semaine}. `
        + "On ne supprime pas un exercice qui fonctionnait : d'abord une charge plus basse et un travail sur la "
        + "technique — amplitude contrôlée, tempo ralenti sur l'excentrique, pas d'à-coup en fin de course. "
        + "Si la gêne persiste à la prochaine séance, on remplacera.",
      chargeSuggeree: moins(0.15), proposerVariante: false, tendance,
    };
  }

  // ── Gêne installée qui ne cède pas ──
  if (pain >= 2 && maxPasse >= 2 && passees.length >= 2) {
    return {
      action: "remplacer", severite: "attention",
      titre: "Gêne récurrente — on change de mouvement",
      message: `C'est au moins la troisième fois que cet exercice te gêne. Alléger n'a pas suffi : `
        + "on passe à une variante du même groupe musculaire, avec un angle ou un axe de charge différent.",
      chargeSuggeree: null, proposerVariante: true, tendance,
    };
  }

  // ── Gêne isolée ──
  if (pain >= 2) {
    return {
      action: "alleger", severite: "attention",
      titre: "Gêne signalée",
      message: "On allège pour cette séance et on soigne l'exécution. Une gêne ponctuelle peut venir d'un "
        + "échauffement trop court ou d'une charge montée trop vite.",
      chargeSuggeree: moins(0.1), proposerVariante: false, tendance,
    };
  }

  // ── Douleur légère ──
  if (pain === 1) {
    if (tendance === "aggravation") {
      return {
        action: "surveiller", severite: "info",
        titre: "Légère gêne à surveiller",
        message: "Rien d'alarmant, mais c'est nouveau sur cet exercice. Garde la charge, soigne l'amplitude "
          + "et l'échauffement de la zone. Si ça monte à la prochaine séance, on ajustera.",
        chargeSuggeree: null, proposerVariante: false, tendance,
      };
    }
    return {
      action: "aucune", severite: "info",
      titre: "Légère gêne",
      message: "Niveau habituel sur cet exercice. Continue en restant attentif à l'exécution.",
      chargeSuggeree: null, proposerVariante: false, tendance,
    };
  }

  return {
    action: "aucune", severite: "info", titre: "", message: "",
    chargeSuggeree: null, proposerVariante: false, tendance,
  };
}

/**
 * Exercices sur lesquels une douleur s'aggrave — pour une alerte hebdomadaire.
 * @returns {{exNom: string, actuel: number, precedent: number}[]}
 */
export function alertesDouleurEnCours() {
  const all = readJSON(FEEDBACK_KEY, {});
  const out = [];
  for (const [exNom, list] of Object.entries(all || {})) {
    const pains = (list || []).filter(f => typeof f?.pain === "number")
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map(f => f.pain);
    if (pains.length < 2) continue;
    const actuel = pains[pains.length - 1];
    const precedent = Math.max(...pains.slice(0, -1));
    if (actuel >= 2 && actuel > precedent) out.push({ exNom, actuel, precedent });
  }
  return out;
}
