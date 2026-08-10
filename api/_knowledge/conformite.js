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

import { getPrescription, calibrerSeance } from "./prescription.js";
import { findInCatalogue } from "./exercices_catalogue.js";

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

  // Séries hebdomadaires par groupe de catalogue.
  const seriesParGroupe = {};
  for (const { ex } of tousExercices(parsed)) {
    const entry = findInCatalogue(ex.nom);
    if (!entry) continue;
    const n = parseSeries(ex.series) ?? 3;
    seriesParGroupe[entry.groupe] = (seriesParGroupe[entry.groupe] || 0) + n;
  }
  const volumes = Object.values(seriesParGroupe).filter(v => v > 0).sort((a, b) => a - b);
  if (!volumes.length) return [];
  const mediane = volumes[Math.floor(volumes.length / 2)];

  const problems = [];
  const absents = [], sousVolume = [];

  for (const pf of faibles) {
    const cibles = MAP_GROUPE_CATALOGUE[String(pf.groupe).toLowerCase().replace(/\s+/g, "_")];
    if (!cibles) continue;                       // groupe non mappable : on se tait
    const total = cibles.reduce((acc, g) => acc + (seriesParGroupe[g] || 0), 0);

    if (total === 0) absents.push(lisibleGroupe(pf.groupe));
    else if (total < mediane) sousVolume.push(`${lisibleGroupe(pf.groupe)} : ${total} séries (médiane ${mediane})`);
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

  // Même marge que dans le prompt : ~8 min d'échauffement retirées.
  const calib = calibrerSeance(objectif, Math.max(20, duree - 8));
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

/** Lance les quatre contrôles d'un coup. */
export function validateConformite(parsed, { objectif, dossier, fiche, dureeSeance }) {
  return [
    ...validatePrescription(parsed, objectif),
    ...validateCharges(parsed, dossier),
    ...validatePointsFaibles(parsed, fiche),
    ...validateTempsSeance(parsed, objectif, dureeSeance),
  ];
}
