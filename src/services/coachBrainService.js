import {
  getWeeklyVolume, getPerformanceTrend, getRestingHR, getMotivation,
  getMobilityData, getRecoveryScore, getOvertrainingStatus,
} from "./recoveryService.js";

// @ts-check
// ─── COACH BRAIN SERVICE — COUCHE 0 : RAISONNEMENT COACH ────────────────────
// Construit le"Dossier Athlète" : l'objet de décision que l'IA lit AVANT
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
  try { return JSON.parse(localStorage.getItem(key) ||"null") ?? fallback; }
  catch { return fallback; }
}

function daysSince(isoOrDate) {
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 864e5);
}

/**"12/03/2026" (fr-FR) → Date */
function parseFrDate(str) {
  if (!str) return null;
  const p = String(str).split("/");
  if (p.length !== 3) return null;
  const d = new Date(`${p[2]}-${p[1]}-${p[0]}`);
  return isNaN(d.getTime()) ? null : d;
}

// ─── FEEDBACK POST-EXERCICE (écrit par Focus Mode, lu par la Couche 0) ──────

const FEEDBACK_KEY ="morpho_exo_feedback";
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
      statut:"premier_programme",
      jours_depuis_derniere_seance: null,
      directive:"Aucun historique : bases solides, apprentissage technique, progression linéaire simple.",
    };
  }

  const last = new Date(Math.max(...dates.map(d => d.getTime())));
  const jours = daysSince(last);

  if (jours <= 10) return {
    statut:"actif", jours_depuis_derniere_seance: jours,
    directive:"Athlète actif : progression normale vs cycle précédent (+2.5 à 5% charge ou +1 série).",
  };
  if (jours <= 20) return {
    statut:"pause_courte", jours_depuis_derniere_seance: jours,
    directive:"Pause courte détectée : semaine 1 à -10% des dernières charges connues, retour à la normale en semaine 2. Pas d'échec musculaire en S1.",
  };
  if (jours <= 45) return {
    statut:"reprise", jours_depuis_derniere_seance: jours,
    directive:"REPRISE APRÈS COUPURE (~" + Math.round(jours / 7) +" semaines) : charges à -25/-35% vs dernières perfs connues, volume au MEV, S1-S2 = réadaptation technique et tissulaire, AUCUN échec avant S3, courbatures à anticiper (volume progressif). Le programme DOIT être différent du précédent : la coupure est l'occasion parfaite d'introduire de nouveaux stimuli.",
  };
  return {
    statut:"reprise_longue", jours_depuis_derniere_seance: jours,
    directive:"COUPURE LONGUE (" + Math.round(jours / 7) +" semaines+) : repartir sur une base quasi débutant-intermédiaire. Charges -40/-50%, corps entier ou split simple les 2 premières semaines, tempo contrôlé, mobilité intégrée, reconstruction des patterns moteurs. Programme entièrement renouvelé.",
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
    (series[nom] = series[nom] || []).push({ date: String(date ||""), top: k, reps: parseInt(String(reps)) || 0 });
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
    // Il faut au moins 3 points pour parler d'une tendance.
    if (pts.length < 3) return;
    pts.sort((a, b) => a.date.localeCompare(b.date));
    const win = pts.slice(-4);                       // fenêtre : 4 dernières séances
    const first = win[0].top, lastP = win[win.length - 1];

    // ÉTALEMENT DANS LE TEMPS — le critère qui manquait.
    // Trois séances réparties sur trois mois ne constituent PAS une
    // stagnation : c'est un problème de fréquence. Conclure « stagnation »
    // dans ce cas amenait l'IA à remplacer des exercices qui n'avaient
    // simplement jamais eu l'occasion de progresser.
    const jours = Math.round(
      (new Date(lastP.date) - new Date(win[0].date)) / 864e5
    );
    const semaines = Math.max(1, Math.round(jours / 7));
    const cadence = win.length / semaines;           // séances par semaine

    // Tolérance : 2 % sur 60 kg font 1,2 kg, soit moins que le plus petit
    // disque. On prend le maximum entre 3 % et un vrai palier de 2,5 kg.
    const seuil = Math.max(0.03, 2.5 / Math.max(1, first));
    const delta = (lastP.top - first) / first;

    let tendance, action;

    if (cadence < 0.4) {
      // Moins d'une séance toutes les 2,5 semaines sur cet exercice.
      tendance = "frequence_insuffisante";
      action = `FRÉQUENCE INSUFFISANTE (${win.length} séances étalées sur ${semaines} semaines) → `
        + "aucune conclusion possible sur cet exercice : il n'a pas été pratiqué assez souvent "
        + "pour progresser ou stagner. NE PAS le remplacer pour cause de stagnation. "
        + "Le problème est l'assiduité, pas le choix d'exercice.";
    } else if (delta >= seuil) {
      tendance = "progression";
      action = "Exercice qui FONCTIONNE pour ce profil → à conserver ou faire évoluer légèrement.";
    } else if (delta <= -seuil) {
      tendance = "regression";
      action = "Régression → réduire le volume 2 semaines OU remplacer par une variante moins exigeante, vérifier la récupération.";
    } else if (win.length >= 4) {
      tendance = "stagnation";
      action = `STAGNATION (${win.length} séances sur ${semaines} semaines à ~${lastP.top}kg) → `
        + "cet exercice ne produit plus d'adaptation : remplacer par une variante du même pattern "
        + "(angle/prise/matériel différent) OU changer radicalement la plage de reps OU passer en rest-pause.";
    } else {
      // 3 séances rapprochées mais sans évolution nette : trop tôt pour trancher.
      tendance = "a_confirmer";
      action = `Charge stable sur ${win.length} séances en ${semaines} semaines → `
        + "trop tôt pour conclure. Conserver l'exercice une période de plus avant d'envisager "
        + "un remplacement.";
    }

    verdicts.push({
      nom, seances_analysees: pts.length,
      periode: `${win.length} séances sur ${semaines} semaine${semaines > 1 ? "s" : ""}`,
      derniere_perf: lastP.top + "kg ×" + (lastP.reps || "?"),
      evolution_recente: win.map(p => p.top).join(" →"),
      tendance, action,
    });
  });

  // Les problèmes d'abord (c'est là que le coach doit réfléchir)
  const ordre = { regression: 0, stagnation: 1, a_confirmer: 2,
                  frequence_insuffisante: 3, progression: 4 };
  verdicts.sort((a, b) => ordre[a.tendance] - ordre[b.tendance]);
  return verdicts.slice(0, 15);
}

// ─── 3. ASSIDUITÉ & PERSONNALITÉ SPORTIVE ───────────────────────────────────

/**
 * Ce que le coach"sent" sans le mesurer : les séances évitées, les
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
    const focus = (j.focus || j.type_seance || j.nom ||"?").toLowerCase();
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
  let verdict ="";
  if (freqReelle !== null && freqPrevue && freqReelle < freqPrevue - 0.8)
    verdict ="Fait MOINS de séances que prévu (" + freqReelle +"/sem réel vs" + freqPrevue +" prévu) → programme réaliste : moins de séances mais denses, chaque séance doit être autosuffisante.";
  else if (freqReelle !== null && freqPrevue && freqReelle >= freqPrevue)
    verdict ="Très assidu (" + freqReelle +" séances/sem réelles) → on peut oser un volume et une structure plus ambitieux.";

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
  const douloureux = [], nonRessentis = [], rpeParExo = [];
  let rpeSum = 0, rpeN = 0;

  Object.entries(all).forEach(([nom, list]) => {
    if (!Array.isArray(list) || list.length === 0) return;
    const recents = list.slice(-3);
    const maxPain = Math.max(...recents.map(f => f.pain ?? 0));
    const nbNonRessenti = recents.filter(f => f.feel === 2).length;
    const rpesEx = recents.filter(f => typeof f.rpe === "number").map(f => f.rpe);
    rpesEx.forEach(r => { rpeSum += r; rpeN++; });
    // RPE PAR EXERCICE : la moyenne globale masque les cas individuels. Un
    // athlète peut être à 6 partout et à 9,5 sur le développé couché — c'est
    // là que se joue le risque, et l'IA ne le voyait pas.
    if (rpesEx.length >= 2) {
      const moy = Math.round((rpesEx.reduce((a, b) => a + b, 0) / rpesEx.length) * 10) / 10;
      if (moy >= 9)      rpeParExo.push({ nom, rpe: moy, note: "systématiquement proche de l'échec — charge à tempérer" });
      else if (moy <= 6) rpeParExo.push({ nom, rpe: moy, note: "marge disponible — charge peut progresser" });
    }

    if (maxPain >= 3) douloureux.push({ nom, niveau:"douleur STOP", consigne:"INTERDIT — remplacer par une alternative sans stress articulaire sur la même zone." });
    else if (maxPain === 2) douloureux.push({ nom, niveau:"gêne répétée", consigne:"Remplacer ou réduire la charge de 15% + tempo contrôlé, surveiller." });
    if (nbNonRessenti >= 2) nonRessentis.push({ nom, consigne:"Muscle cible non ressenti ×" + nbNonRessenti +" → remplacer par un exercice à meilleure connexion pour ce profil (câble/unilatéral) ou imposer tempo 3-1-3." });
  });

  const rpeMoyen = rpeN > 0 ? Math.round((rpeSum / rpeN) * 10) / 10 : null;
  let calibration = null;
  if (rpeMoyen !== null && rpeMoyen >= 9) calibration ="RPE moyen rapporté très haut (" + rpeMoyen +") : cet athlète pousse toujours plus que prévu → prescrire des charges 5% plus conservatrices et verrouiller le RIR.";
  else if (rpeMoyen !== null && rpeMoyen <= 6.5) calibration ="RPE moyen rapporté bas (" + rpeMoyen +") : marge disponible → progression de charge légèrement plus agressive.";

  return {
    exercices_douloureux: douloureux,
    exercices_non_ressentis: nonRessentis,
    rpe_moyen_rapporte: rpeMoyen,
    rpe_par_exercice: rpeParExo.length ? rpeParExo : undefined,
    calibration,
  };
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
    ...verdicts.filter(v => v.tendance !=="progression").map(v => v.nom),
    ...feedbacks.exercices_douloureux.map(d => d.nom),
    ...feedbacks.exercices_non_ressentis.map(d => d.nom),
  ]);
  const quiMarchent = verdicts.filter(v => v.tendance ==="progression" && !problemes.has(v.nom)).map(v => v.nom);

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

// ─── 7. DOSSIER ATHLÈTE COMPLET ─────────────────────────────────────────────

/**
 * Assemble la Couche 0 complète.
 * @returns {{ dossier: object }}
 */
/**
 * ÉTAT DE FORME RÉEL — le moteur de récupération existait mais n'atteignait
 * jamais l'IA : elle programmait un cycle d'accumulation alors que l'écran
 * affichait « fatigue accumulée ». On lui transmet désormais le même diagnostic.
 * @param {{age?: number|string}} profil
 */
function analyzeEtatDeForme(profil = {}) {
  const age = parseInt(String(profil.age)) || null;
  const vol   = getWeeklyVolume();
  const perf  = getPerformanceTrend();
  const hr    = getRestingHR();
  const moti  = getMotivation(7);
  const mob   = getMobilityData(7);
  const score = getRecoveryScore({ age });
  const over  = getOvertrainingStatus({ age });

  /** @type {Record<string, any>} */
  const out = {};

  if (vol.available) {
    out.volume_reel_semaine = {
      series_validees: vol.totalSets,
      seances: vol.sessions,
      statut: vol.globalStatus,                    // optimal | au-dessus | sous-seuil
      groupes_au_dessus_du_MRV: vol.byMuscle.filter(g => g.statut === "au-dessus").map(g => g.groupe),
      groupes_sous_le_MEV:      vol.byMuscle.filter(g => g.statut === "sous-seuil").map(g => g.groupe),
      detail: vol.byMuscle.slice(0, 8).map(g => `${g.groupe}: ${g.sets} séries`),
    };
  }
  if (perf.available) {
    out.tendance_performance = {
      moyenne_pct: perf.avgDelta,
      tendance: perf.trend,                        // hausse | stable | baisse
      meilleur: perf.best ? `${perf.best.exNom} ${perf.best.deltaPct > 0 ? "+" : ""}${perf.best.deltaPct}%` : null,
      pire:     perf.worst ? `${perf.worst.exNom} ${perf.worst.deltaPct > 0 ? "+" : ""}${perf.worst.deltaPct}%` : null,
    };
  }
  if (hr.available && !hr.partial) {
    out.fc_repos = { recente: hr.recent, reference_30j: hr.baseline, ecart: hr.delta, statut: hr.status };
  }
  if (moti.available) out.motivation = { moyenne_sur_5: moti.avg, checkins: moti.count };
  if (mob.count > 0)  out.mobilite = { seances_7j: mob.count };
  if (score.available) {
    out.score_recuperation = { sur_100: score.score, label: score.label, couverture_pct: score.coverage };
  }
  if (over.available) {
    out.statut_recuperation = {
      niveau: over.label, risque: over.risk, fiabilite_pct: over.confidence,
      alertes: over.warnings, signaux_positifs: over.positives,
    };
  }
  return Object.keys(out).length ? out : { note: "Pas encore de données d'état de forme." };
}

/**
 * CHARGES RÉELLES par exercice : point de départ chiffré de la surcharge
 * progressive. Sans elles, l'IA ne peut prescrire qu'une progression abstraite.
 */
function analyzeChargesReelles() {
  const log = readJSON("morpho_workout_log", {});
  /** @type {Record<string, {kg: number, reps: number, date: string}>} */
  const best = {};
  Object.entries(log).sort(([a], [b]) => a.localeCompare(b)).forEach(([date, day]) => {
    (day?.sets || []).forEach(s => {
      const kg = Number(s.kg) || 0, reps = Number(s.reps) || 0;
      if (!s.exNom || !kg) return;
      const cur = best[s.exNom];
      // Meilleure série = charge la plus lourde ; à charge égale, plus de reps.
      if (!cur || kg > cur.kg || (kg === cur.kg && reps > cur.reps)) {
        best[s.exNom] = { kg, reps, date };
      }
    });
  });
  const entries = Object.entries(best);
  if (!entries.length) return { note: "Aucune charge enregistrée." };
  return Object.fromEntries(
    entries.slice(-15).map(([nom, b]) => [nom, `${b.kg}kg×${b.reps}`])
  );
}

/**
 * JOURS RÉELLEMENT HONORÉS : un athlète peut valider 100 % de ses lundis et
 * zéro vendredi. Placer la séance clé le jour le mieux tenu est une décision
 * de coach que l'IA ne pouvait pas prendre.
 */
function analyzeJoursReels() {
  const log = readJSON("morpho_workout_log", {});
  const NOMS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const compte = {};
  Object.keys(log).forEach(d => {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return;
    if (!(log[d]?.sets || []).length) return;      // séance réellement faite
    const n = NOMS[dt.getDay()];
    compte[n] = (compte[n] || 0) + 1;
  });
  const total = Object.values(compte).reduce((a, b) => a + b, 0);
  if (total < 3) return { note: "Pas assez de séances pour dégager un rythme." };
  const tri = Object.entries(compte).sort((a, b) => b[1] - a[1]);
  return {
    seances_par_jour: Object.fromEntries(tri),
    jour_le_mieux_tenu: tri[0][0],
    jour_le_moins_tenu: tri[tri.length - 1][0],
    conseil: `Placer la séance la plus exigeante le ${tri[0][0]} (jour le plus régulièrement honoré).`,
  };
}

/**
 * Réduit l'historique aux exercices qui appellent une décision : stagnation et
 * régression d'abord, progression ensuite, le tout plafonné.
 */
function limiterHistorique(verdicts, max = 18) {
  const entries = Object.entries(verdicts || {});
  if (entries.length <= max) return verdicts;
  const poids = (v) => {
    const s = JSON.stringify(v).toLowerCase();
    if (/regression|baisse/.test(s)) return 0;
    if (/stagnation/.test(s)) return 1;
    return 2;
  };
  return Object.fromEntries(
    entries.sort((a, b) => poids(a[1]) - poids(b[1])).slice(0, max)
  );
}

export function buildDossierAthlete({ form, prog, cycles, corrigerFaibles }) {
  const detraining = analyzeDetraining({ prog, cycles });
  const verdicts   = analyzeProgressionParExercice({ prog, cycles });
  const adherence  = analyzeAdherence({ prog, form });
  const feedbacks  = analyzeFeedbacks();
  const memoire    = buildExerciseMemory({ prog, cycles, verdicts, feedbacks });

  // Tendance de poids corporel (30 derniers jours, si ≥ 2 pesées)
  const weightLog = readJSON("mc_weightLog", []);
  /** @type {Record<string, string|number>} */
  let suiviPoids = { note:"Pas assez de pesées récentes." };
  if (Array.isArray(weightLog)) {
    const pts = /** @type {{d: Date, kg: number}[]} */ (weightLog
      .map(e => ({ d: parseFrDate(e?.date), kg: parseFloat(e?.poids) }))
      .filter(e => e.d && isFinite(e.kg) && daysSince(e.d) !== null && Number(daysSince(e.d)) <= 30))
      .sort((a, b) => a.d.getTime() - b.d.getTime());
    if (pts.length >= 2) {
      const delta = Math.round((pts[pts.length - 1].kg - pts[0].kg) * 10) / 10;
      suiviPoids = {
        pesees_30j: pts.length,
        delta_30j: (delta > 0 ?"+" :"") + delta +" kg",
        dernier_poids: pts[pts.length - 1].kg +" kg",
      };
    }
  }

  // Nutrition réelle (journal des 14 derniers jours renseignés)
  const repasLog = readJSON("mc_repasLog", {});
  /** @type {Record<string, string|number>} */
  let nutritionRecente = { note:"Pas de journal nutrition récent." };
  {
    const jours = Object.values(repasLog || {})
      .filter(j => j && j.kcal > 0 && daysSince(j.date) !== null && Number(daysSince(j.date)) <= 14);
    if (jours.length >= 3) {
      const avg = (k) => Math.round(jours.reduce((a, j) => a + (j[k] || 0), 0) / jours.length);
      nutritionRecente = {
        jours_renseignes_14j: jours.length,
        kcal_moyennes: avg("kcal"),
        proteines_moyennes: avg("prot") +" g",
      };
    }
  }

  // Récupération : sommeil moyen 7 derniers jours si loggé
  const sleepLog = readJSON("morpho_sleep_log", {});
  const sleepVals = Object.entries(sleepLog)
    .filter(([d]) => daysSince(d) !== null && daysSince(d) <= 7)
    .map(([, v]) => parseFloat(v)).filter(v => isFinite(v) && v > 0);
  const sommeilMoyen = sleepVals.length >= 3
    ? Math.round((sleepVals.reduce((a, b) => a + b, 0) / sleepVals.length) * 10) / 10
    : null;

  // ORDRE VOLONTAIRE : le dossier est tronqué à une taille fixe côté serveur.
  // Les clés qui PILOTENT des décisions passent en premier — sur un athlète
  // chargé, l'historique détaillé peut être coupé, jamais l'état de forme.
  const dossier = {
    numero_cycle: (cycles?.length || 0) + 1,
    etat_de_forme: analyzeEtatDeForme(form),
    charges_actuelles: analyzeChargesReelles(),
    rythme_reel: analyzeJoursReels(),
    priorite_points_faibles: !!corrigerFaibles,
    etat_athlete: detraining,
    personnalite_sportive: adherence,
    feedback_corporel: feedbacks,
    memoire_exercices: memoire,
    // Borné : sur un athlète de longue date, ce bloc atteignait 4 400 caractères
    // et poussait les autres clés hors de la fenêtre du prompt. Les exercices
    // en stagnation ou en régression passent en premier — ce sont ceux qui
    // demandent une décision.
    historique_progression: limiterHistorique(verdicts, 18),
    suivi_poids: suiviPoids,
    nutrition_recente: nutritionRecente,
    recuperation: sommeilMoyen !== null
      ? { sommeil_moyen_7j: sommeilMoyen +"h", note: sommeilMoyen < 6.5 ?"Sommeil insuffisant → réduire le volume de 10-15%, éviter l'échec fréquent." :"Récupération correcte." }
      : { note:"Pas de données sommeil récentes." },
  };

  // Les directives de variation (split / accent / vague) sont recalculées
  // CÔTÉ SERVEUR (couche0.js) — source unique de vérité depuis la V3.
  return { dossier };
}

/** Sérialisation compacte pour injection dans le prompt (budget tokens). */
export function formatDossierPourPrompt(dossier) {
  return JSON.stringify(dossier, null, 1)
    .replace(/\n\s*/g,"\n")
    .substring(0, 6000);
}
