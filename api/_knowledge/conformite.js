// ─── CONFORMITÉ DU PROGRAMME GÉNÉRÉ ─────────────────────────────────────────
// POURQUOI CE MODULE EXISTE :
//
// Jusqu'ici, une grande partie de la connaissance MorphoCoach était ENVOYÉE au
// modèle avec des mots forts ("PRESCRIPTION OBLIGATOIRE", "PRESCRIRE EN KILOS",
// "DONNANT-DONNANT") mais RIEN ne vérifiait ensuite qu'elle avait été appliquée.
// Un programme "force" pouvait sortir avec des séries de 12 et 60 s de repos,
// un athlète dont on connaît les charges recevait des pourcentages, un point
// faible détecté sur photo pouvait recevoir moins de volume qu'un point fort —
// et tout cela passait la validation sans une seule alerte.
//
// Ce module transforme trois de ces règles en vérifications DÉTERMINISTES.
// Si le programme les viole, la génération demande une correction.
//
// PRINCIPE DE CONCEPTION : mieux vaut rater une violation subtile que crier au
// loup sur un choix de coach légitime. Chaque seuil est volontairement large,
// et les exercices dont l'écart est normal (gainage, correctifs, isométrie)
// sont explicitement exclus. Un validateur qui produit des faux positifs
// déclenche des corrections inutiles, consomme le budget temps, et finit par
// être désactivé — c'est pire que pas de validateur du tout.

import { getPrescription, calibrerSeance, reserveEchauffementMin } from "./prescription.js";
import { findInCatalogue } from "./exercices_catalogue.js";
import { collectDiagnostics, detectMethodesExo, METHODES, METHODES_INTERDITES_DEBUTANT, METHODES_DOUCES_DEBUTANT } from "./methodes.js";
import { pathologiesActives } from "./pathologies-cadre.js";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

/** Tous les exercices du programme, avec leur séance d'origine. */
function tousExercices(parsed) {
  const out = [];
  (parsed?.programme?.seances || []).forEach((s, i) => {
    (s?.exercices || []).forEach((ex) => {
      if (ex?.nom) out.push({ ex, seance: s, index: i + 1, jour: s?.jour || `séance ${i + 1}` });
    });
  });
  return out;
}

/**
 * Répétitions sous forme de plage numérique.
 * Renvoie null pour tout ce qui n'est PAS un nombre de répétitions :
 * "AMRAP", "max", "30s" (tenue isométrique), "à l'échec"…
 * — ces formes sont légitimes et ne doivent jamais déclencher d'alerte.
 */
export function parseReps(v) {
  const t = String(v ?? "").toLowerCase().trim();
  if (!t) return null;
  if (/s\b|sec|min|amrap|max|echec|échec|tenue|iso/.test(t)) return null;
  const m = t.match(/(\d{1,3})\s*(?:[-–à]\s*(\d{1,3}))?/);
  if (!m) return null;
  const a = parseInt(m[1], 10);
  const b = m[2] ? parseInt(m[2], 10) : a;
  if (!(a > 0 && b > 0 && a <= 100 && b <= 100)) return null;
  return [Math.min(a, b), Math.max(a, b)];
}

/**
 * Temps de repos en SECONDES, sous forme de plage.
 * Gère "90s", "90-120s", "2 min", "3 à 5 minutes", "180".
 */
export function parseRepos(v) {
  const t = String(v ?? "").toLowerCase().replace(",", ".").trim();
  if (!t) return null;
  const minutes = /min/.test(t);
  const m = t.match(/(\d{1,3}(?:\.\d)?)\s*(?:[-–à]\s*(\d{1,3}(?:\.\d)?))?/);
  if (!m) return null;
  let a = parseFloat(m[1]);
  let b = m[2] ? parseFloat(m[2]) : a;
  if (minutes) { a *= 60; b *= 60; }
  // Une valeur nue < 15 est presque sûrement des minutes ("3" = 3 min).
  else if (a < 15 && b < 15) { a *= 60; b *= 60; }
  if (!(a > 0 && b > 0 && a <= 900 && b <= 900)) return null;
  return [Math.min(a, b), Math.max(a, b)];
}

/** Durée de la phase excentrique depuis un tempo "3-1-2-0". */
export function parseTempoExcentrique(v) {
  const m = String(v ?? "").match(/^\s*(\d)\s*[-/ ]\s*(\d)\s*[-/ ]\s*(\d)/);
  return m ? parseInt(m[1], 10) : null;
}

/** Nombre de séries de travail, ou null si illisible. */
function parseSeries(v) {
  const m = String(v ?? "").match(/(\d{1,2})/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return n > 0 && n <= 12 ? n : null;
}

/** Deux plages se recoupent-elles ? */
const chevauche = (a, b) => a && b && a[0] <= b[1] && b[0] <= a[1];

/**
 * Exercices dont l'écart à la prescription est NORMAL et ne doit rien signaler :
 * gainage, correctifs de rééducation, échauffement, mobilité, isométrie.
 * Un pallof press à 3×30 s dans un programme de force n'est pas une erreur.
 */
function horsPrescription(nom) {
  const entry = findInCatalogue(nom);
  if (entry && (entry.cat === "gainage" || entry.cat === "correctif")) return true;
  return /gainage|planche|plank|hollow|pallof|bird dog|dead bug|mobilit|etirement|étirement|proprioception|isometr|isométr|respiration|wall slide|scapular|rotation externe|face pull|superman|cat cow|chin tuck/i
    .test(String(nom || ""));
}

// ────────────────────────────────────────────────────────────────────────────
// 1. PRESCRIPTION — reps, repos et tempo cohérents avec l'objectif
// ────────────────────────────────────────────────────────────────────────────

/**
 * Vérifie que le programme respecte réellement la prescription de son objectif.
 *
 * Ce que ça attrape : un "programme de force" avec des séries de 12 et 60 s de
 * repos, une "hypertrophie" entièrement sous 5 répétitions, un tempo explosif
 * là où l'excentrique lent est le levier.
 *
 * Ce que ça NE fait PAS : juger les méthodes d'intensification, l'ordre des
 * exercices ou le choix des mouvements — ce sont des décisions de coach que du
 * code ne peut pas arbitrer sans se tromper.
 *
 * @param {object} parsed  programme généré
 * @param {string} objectif
 * @returns {string[]} problèmes détectés (vide si conforme)
 */
export function validatePrescription(parsed, objectif) {
  const p = getPrescription(objectif);
  const b = p?.bornes;
  if (!b) return [];

  const problems = [];
  const exos = tousExercices(parsed).filter(({ ex }) => !horsPrescription(ex.nom));
  if (!exos.length) return [];

  // ── Bornes par exercice ──
  const horsReps = [], horsRepos = [], horsTempo = [];
  for (const { ex, jour } of exos) {
    const reps = parseReps(ex.reps);
    if (reps && !chevauche(reps, b.reps)) horsReps.push(`${ex.nom} (${ex.reps}) — ${jour}`);

    const repos = parseRepos(ex.repos);
    if (repos && !chevauche(repos, b.repos_s)) horsRepos.push(`${ex.nom} (${ex.repos}) — ${jour}`);

    const ecc = parseTempoExcentrique(ex.tempo);
    if (ecc !== null && (ecc < b.tempo_excentrique_s[0] || ecc > b.tempo_excentrique_s[1]))
      horsTempo.push(`${ex.nom} (tempo ${ex.tempo}) — ${jour}`);
  }

  if (horsReps.length) problems.push(
    `Répétitions hors prescription "${objectif}" (attendu ${b.reps[0]}-${b.reps[1]}) : `
    + `${horsReps.slice(0, 5).join(" ; ")}${horsReps.length > 5 ? ` … et ${horsReps.length - 5} autre(s)` : ""}`
    + ". Ramène ces exercices dans la plage de l'objectif."
  );
  if (horsRepos.length) problems.push(
    `Temps de repos hors prescription "${objectif}" (attendu ${b.repos_s[0]}-${b.repos_s[1]} s) : `
    + `${horsRepos.slice(0, 5).join(" ; ")}${horsRepos.length > 5 ? ` … et ${horsRepos.length - 5} autre(s)` : ""}`
    + ". C'est le repos qui définit l'objectif : ajuste-le, pas l'inverse."
  );
  if (horsTempo.length) problems.push(
    `Tempo incompatible avec l'objectif "${objectif}" (excentrique attendu entre `
    + `${b.tempo_excentrique_s[0]} et ${b.tempo_excentrique_s[1]} s) : ${horsTempo.slice(0, 4).join(" ; ")}`
  );

  // ── Signature : au moins un exercice réellement représentatif par séance ──
  // Sans ça, un "programme de force" peut n'avoir aucune série lourde tout en
  // restant dans les bornes larges.
  if (b.signature) {
    const manquantes = [];
    for (const s of (parsed?.programme?.seances || [])) {
      const liste = (s?.exercices || []).filter(ex => ex?.nom && !horsPrescription(ex.nom));
      if (!liste.length) continue;
      const aUnLourd = liste.some((ex) => {
        const reps = parseReps(ex.reps), repos = parseRepos(ex.repos);
        return reps && repos && reps[0] <= b.signature.reps_max && repos[1] >= b.signature.repos_min_s;
      });
      if (!aUnLourd) manquantes.push(s?.jour || "séance sans nom");
    }
    if (manquantes.length) problems.push(
      `Objectif "${objectif}" non servi — ${b.signature.libelle} sur : ${manquantes.join(", ")}. `
      + "Chaque séance doit comporter au moins un mouvement principal traité selon l'objectif."
    );
  }

  return problems;
}

// ────────────────────────────────────────────────────────────────────────────
// 2. CHARGES RÉELLES — prescrire en kilos, pas en pourcentage
// ────────────────────────────────────────────────────────────────────────────

/**
 * Vérifie que les exercices dont on CONNAÎT la charge réelle de l'athlète sont
 * prescrits en kilos, et non en pourcentage du 1RM.
 *
 * C'est la différence entre un coach et un tableau : si l'athlète a poussé
 * 80 kg au développé couché la semaine dernière, lui répondre "75 % du 1RM
 * estimé" le renvoie à un calcul qu'il ne devrait pas avoir à faire.
 *
 * @param {object} parsed
 * @param {object} dossier  doit contenir charges_actuelles
 * @returns {string[]}
 */
export function validateCharges(parsed, dossier) {
  const connues = Object.entries(dossier?.charges_actuelles || {})
    .filter(([k]) => k !== "note")
    .map(([nom, valeur]) => ({ nom, cle: norm(nom), valeur }));
  if (!connues.length) return [];

  const fautifs = [];
  for (const { ex, jour } of tousExercices(parsed)) {
    const n = norm(ex.nom);
    // Correspondance directe, ou via l'entrée catalogue (tolère les variantes).
    const match = connues.find(({ cle }) =>
      cle === n || (cle.length >= 8 && (n.includes(cle) || cle.includes(n)))
    ) || (() => {
      const entry = findInCatalogue(ex.nom);
      if (!entry) return null;
      const en = norm(entry.n);
      return connues.find(({ cle }) => cle === en) || null;
    })();
    if (!match) continue;

    const charge = String(ex.charge ?? "");
    const enPourcentage = /%/.test(charge) || /1\s*rm/i.test(charge);
    const enKilos = /\d\s*(kg|kilo)/i.test(charge);
    if (enPourcentage || !enKilos) {
      fautifs.push(`${ex.nom} (${jour}) : "${charge || "vide"}" alors que sa charge connue est ${match.valeur}`);
    }
  }

  if (!fautifs.length) return [];
  return [
    `Charge prescrite en pourcentage alors qu'elle est CONNUE en kilos : ${fautifs.slice(0, 5).join(" ; ")}`
    + `${fautifs.length > 5 ? ` … et ${fautifs.length - 5} autre(s)` : ""}. `
    + "Reprends la charge réelle et donne l'incrément en kilos "
    + "(ex. \"82,5 kg (S1-2) → 85 kg (S3-4)\"), jamais un pourcentage.",
  ];
}

// ────────────────────────────────────────────────────────────────────────────
// 3. POINTS FAIBLES — le volume suit-il vraiment le diagnostic ?
// ────────────────────────────────────────────────────────────────────────────

/** Groupe de la fiche morpho → groupe(s) du catalogue. */
const MAP_GROUPE_CATALOGUE = {
  dos_largeur: ["Dos"], dos_epaisseur: ["Dos"], dos: ["Dos"], dorsaux: ["Dos"],
  trapezes: ["Trapèzes", "Dos"],
  pectoraux: ["Pectoraux"], pecs: ["Pectoraux"],
  epaules: ["Épaules"], deltoides: ["Épaules"],
  biceps: ["Biceps"], triceps: ["Triceps"], bras: ["Biceps", "Triceps"],
  avant_bras: ["Avant-bras"],
  quadriceps: ["Quadriceps"], ischios: ["Ischio-jambiers"],
  fessiers: ["Fessiers"], mollets: ["Mollets"],
  abdos: ["Abdominaux"], abdominaux: ["Abdominaux"], lombaires: ["Lombaires"],
};

/** Libellé lisible d'un groupe. */
const lisibleGroupe = (g) => String(g).replace(/_/g, " ");

/**
 * Vérifie qu'un point faible détecté sur photo reçoit RÉELLEMENT plus de
 * travail — et pas seulement une mention polie dans la réflexion.
 *
 * Deux contrôles, du plus grave au plus fin :
 *   1. ABSENCE : le groupe en retard n'apparaît nulle part dans la semaine.
 *      C'est une contradiction directe avec le diagnostic.
 *   2. SOUS-VOLUME : le groupe en retard reçoit moins de séries que la médiane
 *      des groupes travaillés. Contrôle RELATIF, donc valable quel que soit le
 *      nombre de jours — on ne compare pas à un chiffre absolu arbitraire.
 *
 * @param {object} parsed
 * @param {object} fiche  fiche morphologique
 * @returns {string[]}
 */
export function validatePointsFaibles(parsed, fiche) {
  const faibles = (fiche?.consequences?.points_faibles_visuels || [])
    .map(p => (typeof p === "string" ? { groupe: p, niveau: "en_retard" } : p))
    .filter(p => p?.groupe);
  if (!faibles.length) return [];

  // Séries hebdomadaires ET nombre de séances par groupe de catalogue.
  const seriesParGroupe = {};
  const seancesParGroupe = {};   // groupe → Set d'index de séance
  for (const { ex, index } of tousExercices(parsed)) {
    const entry = findInCatalogue(ex.nom);
    if (!entry) continue;
    const n = parseSeries(ex.series) ?? 3;
    seriesParGroupe[entry.groupe] = (seriesParGroupe[entry.groupe] || 0) + n;
    (seancesParGroupe[entry.groupe] ||= new Set()).add(index);
  }
  const nbSeances = (parsed?.programme?.seances || []).length;
  const volumes = Object.values(seriesParGroupe).filter(v => v > 0).sort((a, b) => a - b);
  if (!volumes.length) return [];
  const mediane = volumes[Math.floor(volumes.length / 2)];

  const problems = [];
  const absents = [], sousVolume = [], sousFrequence = [];

  for (const pf of faibles) {
    const cibles = MAP_GROUPE_CATALOGUE[String(pf.groupe).toLowerCase().replace(/\s+/g, "_")];
    if (!cibles) continue;                       // groupe non mappable : on se tait
    const total = cibles.reduce((acc, g) => acc + (seriesParGroupe[g] || 0), 0);

    if (total === 0) { absents.push(lisibleGroupe(pf.groupe)); continue; }
    if (total < mediane) sousVolume.push(`${lisibleGroupe(pf.groupe)} : ${total} séries (médiane ${mediane})`);

    // Fréquence : c'est le PREMIER levier sur un point faible, avant le volume.
    // On ne l'exige qu'à partir de 3 séances — en dessous, le format est
    // corps entier et la question ne se pose pas.
    if (nbSeances >= 3) {
      const seances = new Set();
      for (const g of cibles) for (const i of (seancesParGroupe[g] || [])) seances.add(i);
      if (seances.size < 2) sousFrequence.push(`${lisibleGroupe(pf.groupe)} : 1 seule séance sur ${nbSeances}`);
    }
  }

  if (absents.length) problems.push(
    `Point(s) faible(s) identifié(s) sur les photos mais ABSENT(S) du programme : ${absents.join(", ")}. `
    + "Un groupe diagnostiqué en retard doit être travaillé dans la semaine — ajoute-lui au moins "
    + "un exercice dédié et explique le choix dans \"reflexion.priorites\"."
  );
  if (sousVolume.length) problems.push(
    `Point(s) faible(s) sous-servi(s) en volume : ${sousVolume.join(" ; ")}. `
    + "Un groupe en retard doit recevoir AU MOINS autant de séries que la moyenne des autres. "
    + "Applique le donnant-donnant : réalloue du volume depuis les groupes dominants."
  );
  if (sousFrequence.length) problems.push(
    `Point(s) faible(s) stimulé(s) une seule fois dans la semaine : ${sousFrequence.join(" ; ")}. `
    + "La FRÉQUENCE est le premier levier sur un muscle en retard, avant le volume : répartis son "
    + "travail sur au moins 2 séances, à volume total constant. C'est le changement le moins "
    + "coûteux en récupération."
  );

  return problems;
}

// ────────────────────────────────────────────────────────────────────────────
// 4. TEMPS DE SÉANCE — la durée annoncée est-elle tenable ?
// ────────────────────────────────────────────────────────────────────────────

/**
 * Vérifie que le nombre d'exercices tient dans la durée annoncée par l'athlète.
 *
 * Le calcul existait déjà (calibrerSeance) et était transmis au modèle, mais
 * rien ne vérifiait le résultat : on pouvait prescrire 8 exercices de force
 * pour 45 minutes. Dans la vraie vie, l'athlète tronque la fin de séance —
 * donc ce sont les derniers exercices, souvent ceux du point faible, qui
 * sautent. Une séance trop chargée n'est pas un détail de confort.
 *
 * Le gainage et les correctifs comptent pour MOITIÉ : ils sont courts et
 * s'intercalent entre les séries.
 *
 * @param {object} parsed
 * @param {string} objectif
 * @param {number} dureeSeance  minutes annoncées par l'athlète
 * @returns {string[]}
 */
export function validateTempsSeance(parsed, objectif, dureeSeance) {
  const duree = Number(dureeSeance);
  if (!Number.isFinite(duree) || duree < 20) return [];

  // MÊME réserve que dans le prompt : sinon le validateur juge sur une base
  // différente de celle annoncée au modèle, et signale des séances correctes.
  const calib = calibrerSeance(objectif, Math.max(20, duree - reserveEchauffementMin(objectif)));
  if (!calib) return [];

  const trop = [], insuffisant = [];
  for (const s of (parsed?.programme?.seances || [])) {
    const liste = (s?.exercices || []).filter(ex => ex?.nom);
    if (!liste.length) continue;
    // Coût pondéré : un correctif court ne pèse pas comme un squat lourd.
    const cout = liste.reduce((acc, ex) => acc + (horsPrescription(ex.nom) ? 0.5 : 1), 0);
    const jour = s?.jour || "séance sans nom";
    if (cout > calib.max + 1) trop.push(`${jour} : ${liste.length} exercices`);
    else if (cout < calib.min - 1) insuffisant.push(`${jour} : ${liste.length} exercices`);
  }

  const problems = [];
  if (trop.length) problems.push(
    `Séance(s) trop chargée(s) pour ${duree} min en "${objectif}" `
    + `(${calib.min} à ${calib.max} exercices tenables, ≈ ${calib.coutExo} min chacun) : ${trop.join(" ; ")}. `
    + "Retire les exercices les moins rentables : une séance qu'on ne finit pas fait sauter "
    + "la fin du programme, donc souvent le travail du point faible."
  );
  if (insuffisant.length) problems.push(
    `Séance(s) sous-remplie(s) pour ${duree} min en "${objectif}" `
    + `(${calib.min} à ${calib.max} exercices attendus) : ${insuffisant.join(" ; ")}. `
    + "Le temps disponible n'est pas exploité — ajoute du travail utile sur les priorités du cycle."
  );
  return problems;
}

// ─── VALIDATEUR MÉTHODES (V5) ───────────────────────────────────────────────
// Pour chaque diagnostic présent sur ce profil (extrait via collectDiagnostics
// de methodes.js), on vérifie qu'au moins UNE des méthodes attendues apparaît
// dans le programme, sur les exercices ciblant le muscle concerné.
//
// PRINCIPE : ce validateur est CAUSAL, jamais quantitatif. Il ne compte pas
// "combien de méthodes au total". Il vérifie qu'à chaque diagnostic présent
// correspond au moins une réponse méthodologique dans le programme.

/**
 * Retourne le groupe musculaire d'un exercice via findInCatalogue.
 * Renvoie null si le catalogue ne le connaît pas (le validateur d'exercices
 * s'en occupe déjà, on ne double pas l'alerte ici).
 */
function groupeDeExo(nom) {
  const entry = findInCatalogue(nom);
  return entry?.groupe || null;
}

/** Un groupe musculaire matche-t-il un groupe cible du diagnostic ? */
function matchGroupe(groupeExo, groupeCible) {
  if (!groupeCible) return true;                 // diagnostic sans groupe spécifique
  if (!groupeExo) return false;
  const g = String(groupeExo).toLowerCase();
  const c = String(groupeCible).toLowerCase();
  if (g === c) return true;
  // Alias raisonnables
  if (c === "dos" && (g === "dos_largeur" || g === "dos_epaisseur")) return true;
  if (c === "jambes" && ["quadriceps", "ischios", "mollets", "fessiers"].includes(g)) return true;
  if (c === "abdos" && (g === "abdos" || g === "abdominaux")) return true;
  return false;
}

export function validateMethodes(parsed, { fiche, form }) {
  if (!parsed?.programme?.seances) return [];
  const diags = collectDiagnostics(fiche, form);
  if (diags.length === 0) return [];

  const niveau = form?.niveau || "intermediaire";
  const isDebutant = niveau === "debutant"
    || fiche?.observations?.physique?.densite_musculaire === "debutant";

  // Toutes les méthodes détectées dans le programme, agrégées par groupe.
  // { groupe: Set<methode_key>, ... } + un Set global "sans groupe".
  const methodesParGroupe = new Map();
  const methodesGlobal = new Set();
  const allExos = tousExercices(parsed);

  for (const { ex } of allExos) {
    const g = groupeDeExo(ex.nom);
    const found = detectMethodesExo(ex);
    for (const m of found) {
      methodesGlobal.add(m);
      if (g) {
        if (!methodesParGroupe.has(g)) methodesParGroupe.set(g, new Set());
        methodesParGroupe.get(g).add(m);
      }
    }
  }

  const problems = [];

  for (const d of diags) {
    // Appliquer les garde-fous : retirer les méthodes interdites au débutant
    // (sauf si elles font partie des méthodes douces autorisées sur point faible).
    let attendues = d.methodes_attendues || [];
    if (isDebutant) {
      attendues = attendues.filter(m => METHODES_DOUCES_DEBUTANT.has(m) && !METHODES_INTERDITES_DEBUTANT.has(m));
      // Si le diagnostic se retrouve sans aucune méthode autorisée pour
      // débutant, on ne bloque pas — le garde-fou G3 a absorbé la règle.
      if (attendues.length === 0) continue;
    }

    // Cherche si au moins une méthode attendue apparaît sur un exercice du
    // muscle cible (ou globalement si groupe_cible est null).
    let trouve = false;
    if (d.groupe_cible) {
      // Regarder tous les groupes qui matchent (aliases inclus)
      for (const [g, set] of methodesParGroupe.entries()) {
        if (!matchGroupe(g, d.groupe_cible)) continue;
        if (attendues.some(m => set.has(m))) { trouve = true; break; }
      }
    } else {
      // Diagnostic sans groupe : on regarde globalement
      trouve = attendues.some(m => methodesGlobal.has(m));
    }

    if (!trouve) {
      const noms = attendues.map(m => METHODES[m]?.nom || m).join(" OU ");
      const cible = d.groupe_cible ? ` sur ${d.groupe_cible}` : "";
      problems.push(
        `Diagnostic actif "${d.diagnostic}" (${d.source_matrice}) sans réponse méthodologique${cible} : ` +
        `attendu au moins une méthode parmi { ${noms} } — aucune détectée dans le programme.`
      );
    }
  }

  return problems;
}

// ─── VALIDATEUR PATHOLOGIES (V5) ────────────────────────────────────────────
// Cadre grand public 4 étapes (exclusion / substitution / progression /
// avis_medical). Ce validateur vérifie surtout :
//   - présence du champ "avis_medical" dans le JSON quand une pathologie
//     est déclarée
//   - respect du RPE plafond sur la zone concernée pendant la phase de
//     prudence (approximation : le champ RPE des exos concernés ne
//     dépasse pas rpe_max)
//   - absence de langage médical prohibé dans les tips_coach

const LANGAGE_MEDICAL_INTERDIT = /\b(traiter|traite|traité|soigner|soigne|soigné|guérir|guéri|guérit)\b/i;

/** Extrait un RPE numérique haut d'une chaîne "6-7", "7", "RPE 8". Renvoie null si non parsable. */
function rpeHaut(v) {
  const t = String(v || "").toLowerCase().trim();
  if (!t) return null;
  const m = t.match(/(\d{1,2})\s*(?:[-–à]\s*(\d{1,2}))?/);
  if (!m) return null;
  const b = m[2] ? parseInt(m[2], 10) : parseInt(m[1], 10);
  return Number.isFinite(b) && b >= 1 && b <= 10 ? b : null;
}

/** Muscle concerné par la pathologie (approximation grossière pour scan RPE) */
const ZONE_PATHO_TO_GROUPES = {
  hernie_discale:  ["dos", "dos_largeur", "dos_epaisseur", "jambes", "quadriceps", "ischios", "fessiers"],
  epaule:          ["epaules", "pectoraux", "dos_largeur"],
  coude:           ["biceps", "triceps"],
  genou:           ["quadriceps", "ischios", "fessiers", "jambes"],
  laxite_hormonale: null,   // s'applique à TOUT le corps
  reprise_age_sedentaire: null,
};

export function validatePathologies(parsed, { form }) {
  const patos = pathologiesActives(form?.pathologies || []);
  if (patos.length === 0) return [];

  const problems = [];

  // 1. Présence du champ avis_medical
  const avis = String(parsed?.avis_medical || parsed?.correction?.avis_medical || "").trim();
  if (avis.length < 30) {
    problems.push(
      `Champ "avis_medical" manquant ou trop court : pathologie(s) déclarée(s) (${patos.map(p => p.libelle).join(", ")}), ` +
      `ajouter dans le JSON de sortie : "avis_medical": "En cas de douleur qui persiste, s'aggrave ou irradie, arrête et consulte ton médecin ou kinésithérapeute. Ce programme est un cadre d'entraînement, pas un traitement."`
    );
  }

  // 2. RPE plafond sur la zone concernée
  const allExos = tousExercices(parsed);
  for (const p of patos) {
    const rpeMax = p.progression?.rpe_max;
    if (!rpeMax) continue;
    const zones = ZONE_PATHO_TO_GROUPES[p.id];
    const exosZone = zones
      ? allExos.filter(({ ex }) => zones.includes(groupeDeExo(ex.nom)))
      : allExos;
    for (const { ex, jour } of exosZone) {
      const rh = rpeHaut(ex.rpe);
      if (rh && rh > rpeMax) {
        problems.push(
          `RPE trop haut pour "${p.libelle}" : ${ex.nom} (${jour}) prescrit à RPE ${ex.rpe}, plafond ${rpeMax} pendant la phase de prudence.`
        );
      }
    }
  }

  // 3. Langage médical interdit dans les tips_coach
  for (const { ex, jour } of allExos) {
    if (LANGAGE_MEDICAL_INTERDIT.test(ex.tips_coach || "")) {
      problems.push(
        `Langage médical prohibé dans "${ex.nom}" (${jour}) : "${ex.tips_coach}". ` +
        `Reformuler avec "adapter", "protéger", "renforcer avec précaution" — jamais "traiter", "soigner", "guérir".`
      );
    }
  }

  return problems;
}

/** Lance TOUS les contrôles (dont les 2 nouveaux V5). */
export function validateConformite(parsed, { objectif, dossier, fiche, dureeSeance, form }) {
  return [
    ...validatePrescription(parsed, objectif),
    ...validateCharges(parsed, dossier),
    ...validatePointsFaibles(parsed, fiche),
    ...validateTempsSeance(parsed, objectif, dureeSeance),
    ...(form ? validateMethodes(parsed, { fiche, form }) : []),
    ...(form ? validatePathologies(parsed, { form }) : []),
  ];
}
