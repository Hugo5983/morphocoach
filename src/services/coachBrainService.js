// @ts-check
// ─── COACH BRAIN SERVICE — COUCHE 0 : RAISONNEMENT COACH ────────────────────
// Construit le "Dossier Athlète" : l'objet de décision que l'IA lit AVANT
// toute génération. Philosophie : Programme = réflexion(dossier),
// et non Programme = objectif.
//
// Sources de données (100% réelles, aucune valeur fictive) :
//   - morpho_workout_log   → chaque série réellement effectuée (exNom, kg, reps)
//   - morpho_exo_feedback  → RPE / douleur / sensation par exercice (Focus Mode)
//   - cycles (props)       → programmes archivés + historique de charges
//   - prog (props)         → programme en cours (celui qu'on remplace)
//   - morpho_sleep_log     → signal de récupération

// ─── Helpers ────────────────────────────────────────────────────────────────

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
  catch { return fallback; }
}

function daysSince(isoOrDate) {
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 864e5);
}

/** "12/03/2026" (fr-FR) → Date */
function parseFrDate(str) {
  if (!str) return null;
  const p = String(str).split("/");
  if (p.length !== 3) return null;
  const d = new Date(`${p[2]}-${p[1]}-${p[0]}`);
  return isNaN(d.getTime()) ? null : d;
}

// ─── FEEDBACK POST-EXERCICE (écrit par Focus Mode, lu par la Couche 0) ──────

const FEEDBACK_KEY = "morpho_exo_feedback";
const FEEDBACK_MAX_PER_EXO = 10;

/**
 * Persiste le feedback de fin d'exercice du Focus Mode.
 * pain: 0 aucune | 1 légère | 2 gêne | 3 stop
 * feel: 0 parfait | 1 moyen | 2 non ressenti
 * @param {string} exNom
 * @param {{rpe?: number|null, pain?: number|null, feel?: number|null}} fb
 */
export function saveExoFeedback(exNom, { rpe = null, pain = null, feel = null }) {
  if (!exNom || (rpe === null && pain === null && feel === null)) return;
  const all = readJSON(FEEDBACK_KEY, {});
  const list = Array.isArray(all[exNom]) ? all[exNom] : [];
  list.push({ date: new Date().toISOString().split("T")[0], rpe, pain, feel });
  all[exNom] = list.slice(-FEEDBACK_MAX_PER_EXO);
  try { localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all)); } catch { /* quota */ }
}

// ─── 1. DÉTECTION DE COUPURE / REPRISE ──────────────────────────────────────

/**
 * Analyse le temps écoulé depuis la dernière séance réelle.
 * C'est CE bloc qui garantit qu'une reprise à 6 semaines ne reçoit
 * jamais le même programme qu'un athlète actif.
 */
export function analyzeDetraining({ prog, cycles }) {
  const log = readJSON("morpho_workout_log", {});
  const dates = [];

  Object.keys(log).forEach(k => { const d = new Date(k); if (!isNaN(d.getTime())) dates.push(d); });
  (prog?.jours || []).forEach(j => { const d = parseFrDate(j.date); if (d) dates.push(d); });
  (cycles || []).forEach(c => (c.jours || []).forEach(j => { const d = parseFrDate(j.date); if (d) dates.push(d); }));

  if (dates.length === 0) {
    return {
      statut: "premier_programme",
      jours_depuis_derniere_seance: null,
      directive: "Aucun historique : bases solides, apprentissage technique, progression linéaire simple.",
    };
  }

  const last = new Date(Math.max(...dates.map(d => d.getTime())));
  const jours = daysSince(last);

  if (jours <= 10) return {
    statut: "actif", jours_depuis_derniere_seance: jours,
    directive: "Athlète actif : progression normale vs cycle précédent (+2.5 à 5% charge ou +1 série).",
  };
  if (jours <= 20) return {
    statut: "pause_courte", jours_depuis_derniere_seance: jours,
    directive: "Pause courte détectée : semaine 1 à -10% des dernières charges connues, retour à la normale en semaine 2. Pas d'échec musculaire en S1.",
  };
  if (jours <= 45) return {
    statut: "reprise", jours_depuis_derniere_seance: jours,
    directive: "REPRISE APRÈS COUPURE (~" + Math.round(jours / 7) + " semaines) : charges à -25/-35% vs dernières perfs connues, volume au MEV, S1-S2 = réadaptation technique et tissulaire, AUCUN échec avant S3, courbatures à anticiper (volume progressif). Le programme DOIT être différent du précédent : la coupure est l'occasion parfaite d'introduire de nouveaux stimuli.",
  };
  return {
    statut: "reprise_longue", jours_depuis_derniere_seance: jours,
    directive: "COUPURE LONGUE (" + Math.round(jours / 7) + " semaines+) : repartir sur une base quasi débutant-intermédiaire. Charges -40/-50%, corps entier ou split simple les 2 premières semaines, tempo contrôlé, mobilité intégrée, reconstruction des patterns moteurs. Programme entièrement renouvelé.",
  };
}

// ─── 2. PROGRESSION / STAGNATION PAR EXERCICE ───────────────────────────────

/**
 * Reconstruit, exercice par exercice, la série des meilleures charges
 * par séance, puis pose un verdict : progression | stagnation | regression.
 * Exemple du cahier des charges : 60, 62.5, 65, 65, 65, 65 → stagnation.
 */
export function analyzeProgressionParExercice({ prog, cycles }) {
  /** @type {Record<string, {date: string, top: number, reps: number}[]>} */
  const series = {};

  const pushPoint = (nom, date, kg, reps) => {
    const k = parseFloat(String(kg)); if (!nom || !isFinite(k) || k <= 0) return;
    (series[nom] = series[nom] || []).push({ date: String(date || ""), top: k, reps: parseInt(String(reps)) || 0 });
  };

  // a) Log réel du Focus Mode (source la plus fiable)
  const log = readJSON("morpho_workout_log", {});
  Object.entries(log).forEach(([date, day]) => {
    const best = {};
    (day?.sets || []).forEach(s => {
      if (!s?.exNom) return;
      if (!best[s.exNom] || s.kg > best[s.exNom].kg) best[s.exNom] = { kg: s.kg, reps: s.reps };
    });
    Object.entries(best).forEach(([nom, b]) => pushPoint(nom, date, b.kg, b.reps));
  });

  // b) Historique loggé sur les programmes (cycles archivés + programme courant)
  [...(cycles || []), ...(prog ? [prog] : [])].forEach(p =>
    (p.jours || []).forEach(j => (j.exercices || []).forEach(ex =>
      (ex.historique || []).forEach(h => pushPoint(ex.nom, h.date, h.poids, h.reps))
    ))
  );

  const verdicts = [];
  Object.entries(series).forEach(([nom, pts]) => {
    if (pts.length < 3) return;
    pts.sort((a, b) => a.date.localeCompare(b.date));
    const win = pts.slice(-4);                       // fenêtre : 4 dernières séances
    const first = win[0].top, lastP = win[win.length - 1];
    const delta = (lastP.top - first) / first;
    let tendance, action;
    if (delta >= 0.02) {
      tendance = "progression";
      action = "Exercice qui FONCTIONNE pour ce profil → à conserver ou faire évoluer légèrement.";
    } else if (delta <= -0.02) {
      tendance = "regression";
      action = "Régression → réduire le volume 2 semaines OU remplacer par une variante moins exigeante, vérifier la récupération.";
    } else {
      tendance = "stagnation";
      action = "STAGNATION (" + win.length + " séances à ~" + lastP.top + "kg) → cet exercice ne produit plus d'adaptation : remplacer par une variante du même pattern (angle/prise/matériel différent) OU changer radicalement la plage de reps OU passer en rest-pause.";
    }
    verdicts.push({
      nom, seances_analysees: pts.length,
      derniere_perf: lastP.top + "kg × " + (lastP.reps || "?"),
      evolution_recente: win.map(p => p.top).join(" → "),
      tendance, action,
    });
  });

  // Les problèmes d'abord (c'est là que le coach doit réfléchir)
  const ordre = { stagnation: 0, regression: 1, progression: 2 };
  verdicts.sort((a, b) => ordre[a.tendance] - ordre[b.tendance]);
  return verdicts.slice(0, 15);
}

// ─── 3. ASSIDUITÉ & PERSONNALITÉ SPORTIVE ───────────────────────────────────

/**
 * Ce que le coach "sent" sans le mesurer : les séances évitées, les
 * séances favorites, la fréquence réelle vs prévue.
 */
export function analyzeAdherence({ prog, form }) {
  const log = readJSON("morpho_workout_log", {});
  const dates = Object.keys(log).map(d => new Date(d)).filter(d => !isNaN(d.getTime()));

  // Fréquence réelle sur les 6 dernières semaines d'activité
  let freqReelle = null;
  if (dates.length >= 2) {
    const recent = dates.filter(d => daysSince(d) <= 42);
    if (recent.length > 0) {
      const span = Math.max(7, (Math.max(...recent.map(d => +d)) - Math.min(...recent.map(d => +d))) / 864e5);
      freqReelle = Math.round((recent.length / span) * 7 * 10) / 10;
    }
  }

  // Focus évités / favoris sur le programme en cours
  const parFocus = {};
  (prog?.jours || []).forEach(j => {
    const focus = (j.focus || j.type_seance || j.nom || "?").toLowerCase();
    const f = (parFocus[focus] = parFocus[focus] || { prevu: 0, fait: 0 });
    f.prevu++; if (j.complete) f.fait++;
  });
  const evites = [], favoris = [];
  const totalFait = Object.values(parFocus).reduce((a, f) => a + f.fait, 0);
  Object.entries(parFocus).forEach(([focus, f]) => {
    // Évitement = signal RELATIF : il fait d'autres séances mais jamais celle-ci
    if (totalFait >= 2 && f.prevu >= 1 && f.fait === 0) evites.push(focus);
    else if (f.prevu >= 1 && f.fait / f.prevu >= 0.99) favoris.push(focus);
  });

  const freqPrevue = (form?.jours || []).length || null;
  let verdict = "";
  if (freqReelle !== null && freqPrevue && freqReelle < freqPrevue - 0.8)
    verdict = "Fait MOINS de séances que prévu (" + freqReelle + "/sem réel vs " + freqPrevue + " prévu) → programme réaliste : moins de séances mais denses, chaque séance doit être autosuffisante.";
  else if (freqReelle !== null && freqPrevue && freqReelle >= freqPrevue)
    verdict = "Très assidu (" + freqReelle + " séances/sem réelles) → on peut oser un volume et une structure plus ambitieux.";

  return {
    frequence_reelle_par_semaine: freqReelle,
    frequence_prevue: freqPrevue,
    seances_evitees: evites,       // ex: ["jambes"] → 2 exos jambes max, placés en début de séance
    seances_favorites: favoris,    // ex: ["bras"] → à utiliser comme récompense en fin de séance
    verdict,
  };
}

// ─── 4. FEEDBACK CORPOREL (douleur / sensation / calibration RPE) ───────────

export function analyzeFeedbacks() {
  const all = readJSON(FEEDBACK_KEY, {});
  const douloureux = [], nonRessentis = [];
  let rpeSum = 0, rpeN = 0;

  Object.entries(all).forEach(([nom, list]) => {
    if (!Array.isArray(list) || list.length === 0) return;
    const recents = list.slice(-3);
    const maxPain = Math.max(...recents.map(f => f.pain ?? 0));
    const nbNonRessenti = recents.filter(f => f.feel === 2).length;
    recents.forEach(f => { if (typeof f.rpe === "number") { rpeSum += f.rpe; rpeN++; } });

    if (maxPain >= 3) douloureux.push({ nom, niveau: "douleur STOP", consigne: "INTERDIT — remplacer par une alternative sans stress articulaire sur la même zone." });
    else if (maxPain === 2) douloureux.push({ nom, niveau: "gêne répétée", consigne: "Remplacer ou réduire la charge de 15% + tempo contrôlé, surveiller." });
    if (nbNonRessenti >= 2) nonRessentis.push({ nom, consigne: "Muscle cible non ressenti ×" + nbNonRessenti + " → remplacer par un exercice à meilleure connexion pour ce profil (câble/unilatéral) ou imposer tempo 3-1-3." });
  });

  const rpeMoyen = rpeN > 0 ? Math.round((rpeSum / rpeN) * 10) / 10 : null;
  let calibration = null;
  if (rpeMoyen !== null && rpeMoyen >= 9) calibration = "RPE moyen rapporté très haut (" + rpeMoyen + ") : cet athlète pousse toujours plus que prévu → prescrire des charges 5% plus conservatrices et verrouiller le RIR.";
  else if (rpeMoyen !== null && rpeMoyen <= 6.5) calibration = "RPE moyen rapporté bas (" + rpeMoyen + ") : marge disponible → progression de charge légèrement plus agressive.";

  return { exercices_douloureux: douloureux, exercices_non_ressentis: nonRessentis, rpe_moyen_rapporte: rpeMoyen, calibration };
}

// ─── 5. MÉMOIRE D'EXERCICES (anti-répétition) ───────────────────────────────

/**
 * Trie les exercices déjà utilisés en trois listes exploitables par l'IA :
 * à conserver (ils marchent), à remplacer (problème identifié),
 * à éviter en principal (rotation → programmes qui ne se ressemblent pas).
 */
export function buildExerciseMemory({ prog, cycles, verdicts, feedbacks }) {
  const dernierCycle = new Set();
  (prog?.jours || []).forEach(j => (j.exercices || []).forEach(ex => ex.nom && dernierCycle.add(ex.nom)));

  const usage = {};
  [...(cycles || []), ...(prog ? [prog] : [])].forEach(p =>
    (p.jours || []).forEach(j => (j.exercices || []).forEach(ex => {
      if (ex.nom) usage[ex.nom] = (usage[ex.nom] || 0) + 1;
    }))
  );

  const problemes = new Set([
    ...verdicts.filter(v => v.tendance !== "progression").map(v => v.nom),
    ...feedbacks.exercices_douloureux.map(d => d.nom),
    ...feedbacks.exercices_non_ressentis.map(d => d.nom),
  ]);
  const quiMarchent = verdicts.filter(v => v.tendance === "progression" && !problemes.has(v.nom)).map(v => v.nom);

  const aConserver = quiMarchent.slice(0, 8);
  const aRemplacer = [...problemes].slice(0, 10);
  const aEviterEnPrincipal = [...dernierCycle].filter(n => !aConserver.includes(n)).slice(0, 25);
  const usesTropLongtemps = Object.entries(usage).filter(([, n]) => n >= 3).map(([nom]) => nom).slice(0, 8);

  return {
    exercices_a_conserver: aConserver,
    exercices_a_remplacer: aRemplacer,
    exercices_du_dernier_cycle_a_eviter: aEviterEnPrincipal,
    exercices_uses_depuis_3_cycles: usesTropLongtemps,
    exercices_dernier_cycle: [...dernierCycle],   // liste COMPLÈTE → contrôle de recouvrement côté serveur
  };
}

// ─── 6. DIRECTIVES DE VARIATION (rotation split / méthodes / reps) ──────────

const SPLITS_PAR_JOURS = {
  2: ["Corps entier ×2 (patterns différents chaque séance)", "Haut / Bas"],
  3: ["Push / Pull / Legs", "Corps entier ×3 à dominantes différentes", "Haut / Bas / Corps entier", "Tirage-Postérieur / Poussée / Jambes-Gainage"],
  4: ["Haut / Bas ×2 (intensité ≠ volume)", "Push / Pull / Legs / Haut", "Torse / Dos / Jambes / Bras-Épaules", "Poussée / Tirage / Jambes / Points faibles"],
  5: ["Push / Pull / Legs / Haut / Bas", "Split spécialisation point faible (2 séances dédiées)", "Torse / Dos / Jambes / Épaules-Bras / Full pump"],
  6: ["Push / Pull / Legs ×2 (lourd puis volume)", "Arnold split (Torse-Dos / Épaules-Bras / Jambes) ×2", "Spécialisation : 2 séances point faible + PPL entretien"],
};

const ACCENTS_METHODE = [
  "Tempo contrôlé 3-1-3 sur toutes les isolations (connexion neuromusculaire)",
  "Travail unilatéral prioritaire (haltères/câble un bras-une jambe) sur les assistances",
  "Supersets antagonistes sur le milieu de séance (densité)",
  "Pré-fatigue du point faible avant le composé principal",
  "Rest-pause sur le DERNIER set de chaque composé",
  "Clusters 2×(3+3+3) sur les composés principaux",
];

const VAGUES_REPS = {
  hypertrophie: ["6-8 composés / 10-12 assistance", "8-12 partout, tempo strict", "5-8 composés lourds / 12-15 isolations", "10-15 métabolique, repos courts"],
  force: ["3-5 composés / 6-8 assistance", "5×5 linéaire", "vague 5-3-1 / 8-10 assistance"],
  poids: ["12-15 + circuits", "10-12 supersets, repos 60s", "15-20 métabolique + finishers"],
  sante: ["12-15 confortable", "10-12 varié machines/câbles", "12-15 fonctionnel + gainage"],
  prep_physique: ["5-8 force / 8-10 transfert", "puissance 3-5 + conditionnement", "contraste lourd-explosif"],
};

/**
 * Rotation déterministe MAIS dépendante du temps : le seed combine le numéro
 * de cycle ET la semaine de l'année. Résultat : regénérer 6 semaines plus
 * tard donne un split/accent/vague différents, même à profil identique.
 */
export function getVariationDirectives({ cycleNum, nbJours, objectif, niveau }) {
  const week = Math.floor(Date.now() / (7 * 864e5));   // semaine absolue
  const seed = (cycleNum || 1) + week;

  const pool = SPLITS_PAR_JOURS[Math.min(Math.max(nbJours || 3, 2), 6)] || SPLITS_PAR_JOURS[3];
  const split = pool[seed % pool.length];

  const accents = niveau === "debutant" ? ACCENTS_METHODE.slice(0, 2) : ACCENTS_METHODE;
  const accent = accents[(seed + 1) % accents.length];

  const vagues = VAGUES_REPS[objectif] || VAGUES_REPS.hypertrophie;
  const vague = vagues[(seed + 2) % vagues.length];

  return {
    split_impose: split,
    accent_methode: accent,
    vague_de_reps: vague,
    regle_overlap: "MAXIMUM 40% des exercices peuvent provenir du cycle précédent. Les exercices repris doivent être EXCLUSIVEMENT ceux listés dans 'exercices_a_conserver' (ils progressent). Tout le reste doit être renouvelé : autre variante du même pattern, autre angle, autre matériel.",
  };
}

// ─── 7. DOSSIER ATHLÈTE COMPLET ─────────────────────────────────────────────

/**
 * Assemble la Couche 0 complète.
 * @returns {{ dossier: object, directives: object }}
 */
export function buildDossierAthlete({ form, prog, cycles, corrigerFaibles }) {
  const detraining = analyzeDetraining({ prog, cycles });
  const verdicts   = analyzeProgressionParExercice({ prog, cycles });
  const adherence  = analyzeAdherence({ prog, form });
  const feedbacks  = analyzeFeedbacks();
  const memoire    = buildExerciseMemory({ prog, cycles, verdicts, feedbacks });
  const directives = getVariationDirectives({
    cycleNum: (cycles?.length || 0) + 1,
    nbJours:  (form?.jours || []).length,
    objectif: form?.objectif,
    niveau:   form?.niveau,
  });

  // Récupération : sommeil moyen 7 derniers jours si loggé
  const sleepLog = readJSON("morpho_sleep_log", {});
  const sleepVals = Object.entries(sleepLog)
    .filter(([d]) => daysSince(d) !== null && daysSince(d) <= 7)
    .map(([, v]) => parseFloat(v)).filter(v => isFinite(v) && v > 0);
  const sommeilMoyen = sleepVals.length >= 3
    ? Math.round((sleepVals.reduce((a, b) => a + b, 0) / sleepVals.length) * 10) / 10
    : null;

  const dossier = {
    numero_cycle: (cycles?.length || 0) + 1,
    etat_athlete: detraining,
    historique_progression: verdicts,
    personnalite_sportive: adherence,
    feedback_corporel: feedbacks,
    memoire_exercices: memoire,
    recuperation: sommeilMoyen !== null
      ? { sommeil_moyen_7j: sommeilMoyen + "h", note: sommeilMoyen < 6.5 ? "Sommeil insuffisant → réduire le volume de 10-15%, éviter l'échec fréquent." : "Récupération correcte." }
      : { note: "Pas de données sommeil récentes." },
    priorite_points_faibles: !!corrigerFaibles,
  };

  return { dossier, directives };
}

/** Sérialisation compacte pour injection dans le prompt (budget tokens). */
export function formatDossierPourPrompt(dossier) {
  return JSON.stringify(dossier, null, 1)
    .replace(/\n\s*/g, "\n")
    .substring(0, 6000);
}
