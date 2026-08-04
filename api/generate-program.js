// ─── API : /api/generate-program ────────────────────────────────────────────
// Appel GÉNÉRATION : reçoit { form, dossier, ficheMorpho } — PAS de photos.
// Le prompt est assemblé ICI : la connaissance MorphoCoach (_knowledge/) ne
// quitte jamais le serveur. Routage déterministe : seuls les modules pertinents
// pour CE profil sont injectés.
//
// V3 (post-audit) :
//   - candidats d'exercices INJECTÉS depuis le catalogue serveur, filtrés par
//     matériel + niveau → le modèle ne peut plus inventer de noms ;
//   - validations post-génération élargies : interdits, recouvrement ≤ 40 %,
//     exercices inconnus du catalogue, violations de matériel ;
//   - fusion déterministe des listes morpho (un privilégié banni est retiré
//     AVANT le prompt : plus de consignes contradictoires) ;
//   - directive sommeil explicite quand la récupération est dégradée ;
//   - quotas d'usage serveur (_lib/usage) + télémétrie IA (_lib/telemetry).

import { guard, checkAccess } from "./_lib/security.js";
import { callAnthropic, parseJSON, normalizeExo } from "./_lib/anthropic.js";
import { checkAndCountUsage } from "./_lib/usage.js";
import { logGenerationEvent } from "./_lib/telemetry.js";
import { logExercicesProposes } from "./_lib/proposals.js";
import { buildPathoRules, buildGardeFous } from "./_knowledge/securite.js";
import { getVolumeParams, getMesocycleLogic, REGLES_NIVEAU } from "./_knowledge/noyau.js";
import { QUESTIONS_COACH, REGLE_PONDERATION, getVariationDirectives, SCHEMA_REFLEXION }
  from "./_knowledge/couche0.js";
import { routeReferentiels, CORRECTEURS } from "./_knowledge/referentiels.js";
import { buildEMGBlock } from "./_knowledge/emg.js";
import { buildRattrapageBlock } from "./_knowledge/rattrapage.js";
import { buildTechniquesBlock } from "./_knowledge/techniques.js";
import { PUISSANCE_C8, COMBAT_C3, isCombat } from "./_knowledge/periodisation_combat.js";
import { selectCandidats, findInCatalogue, matsAutorises, correctifsPourPathologies }
  from "./_knowledge/exercices_catalogue.js";

export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };

const MODEL = "claude-sonnet-4-6";

// ─── Fusion déterministe des listes morpho ──────────────────────────────────
// La sécurité prime : un exercice à la fois "privilégié" (par une règle) et
// "interdit" (par une autre) est retiré des privilégiés AVANT d'atteindre le
// prompt. Le modèle ne reçoit jamais de consigne contradictoire.
// ─── Observations brutes → bloc lisible ─────────────────────────────────────
// Les 31 traits observés sur les photos étaient jusqu'ici réduits aux seules
// conséquences dérivées par les 37 règles — soit ~5 lignes sur un profil riche.
// Les traits que AUCUNE règle ne couvre (longueur de tibia, symétrie, position
// des pieds, densité musculaire…) n'atteignaient JAMAIS le modèle.
// On les lui redonne ici, en clair, sans toucher aux conséquences existantes.
const LIB_TRAITS = {
  humerus: "Humérus", avant_bras: "Avant-bras", femur: "Fémur", tibia: "Tibia",
  clavicules: "Clavicules", cage_thoracique: "Cage thoracique", bassin: "Bassin",
  biceps: "Insertion biceps", mollets: "Insertion mollets", pectoraux: "Insertion pectoraux",
  abdominaux: "Insertion abdominaux", ischios: "Insertion ischios",
  masse_grasse_visuelle: "Masse grasse visuelle", densite_musculaire: "Densité musculaire",
  repartition_graisse: "Répartition de la graisse",
  rapport_epaules_taille: "Rapport épaules/taille", rapport_tronc_jambes: "Rapport tronc/jambes",
  symetrie_gauche_droite: "Symétrie gauche/droite", position_pieds_naturelle: "Position naturelle des pieds",
};
const lisible = (v) => String(v || "").replace(/_/g, " ");

export function formatObservations(obs) {
  if (!obs) return "";
  const sections = [];
  const bloc = (titre, source, prefixe = "") => {
    const items = Object.entries(source || {})
      .filter(([, v]) => v && v !== "indetermine")
      .map(([k, v]) => `${prefixe}${LIB_TRAITS[k] || k} : ${lisible(v)}`);
    if (items.length) sections.push(`${titre} — ${items.join(" · ")}`);
  };
  bloc("LEVIERS OSSEUX", obs.leviers);
  bloc("INSERTIONS", obs.insertions);
  bloc("PHYSIQUE", obs.physique);
  bloc("PROPORTIONS", obs.proportions);
  if (Array.isArray(obs.posture) && obs.posture.length)
    sections.push(`POSTURE — ${obs.posture.map(lisible).join(" · ")}`);
  const rep = Object.entries(obs.repartition || {}).filter(([, v]) => v && v !== "indetermine");
  if (rep.length)
    sections.push(`DÉVELOPPEMENT PAR GROUPE — ${rep.map(([k, v]) => `${lisible(k)} : ${lisible(v)}`).join(" · ")}`);
  return sections.join("\n");
}

function mergeFicheLists(fiche) {
  if (!fiche?.consequences) return fiche;
  const c = fiche.consequences;
  const interdits = (c.exercices_interdits || []).map(normalizeExo);
  const clash = (nom) => {
    const n = normalizeExo(nom);
    return interdits.some((b) => b && (n === b || n.includes(b) || b.includes(n)));
  };
  return {
    ...fiche,
    consequences: {
      ...c,
      exercices_privilegies: (c.exercices_privilegies || []).filter((n) => !clash(n)),
      exercices_adaptes:     (c.exercices_adaptes     || []).filter((n) => !clash(n)),
    },
  };
}

// ─── Assemblage du prompt (côté serveur uniquement) ─────────────────────────
function buildServerPrompt({ form, dossier, fiche, directives, cycleNum, candidats }) {
  const joursPlein = normalizeJours(form.jours).length
    ? normalizeJours(form.jours) : ["Lundi", "Mercredi", "Vendredi"];
  const volParams  = getVolumeParams(form.niveau, form.objectif);
  const mesoLogic  = getMesocycleLogic(form.niveau, form.objectif, cycleNum);
  const pathoRules = buildPathoRules(form.pathologies);
  const gardeFous  = buildGardeFous({ age: form.age, niveau: form.niveau });
  const imc = form.poids && form.taille
    ? (parseFloat(form.poids) / Math.pow(parseFloat(form.taille) / 100, 2)).toFixed(1) : "?";

  // Routage référentiels : points faibles visuels (fiche) + priorités du dossier
  const groupesPrioritaires = [
    ...(fiche?.consequences?.points_faibles_visuels || []).map(p => p.groupe),
  ];
  const refs = routeReferentiels(groupesPrioritaires);

  const emgBlock  = buildEMGBlock({ niveau: form.niveau, objectif: form.objectif });
  const rattrapageBlock = buildRattrapageBlock({
    hasPointsFaibles: groupesPrioritaires.length > 0,
    corrigerFaibles:  !!dossier?.priorite_points_faibles,
    groupes:          groupesPrioritaires,
  });
  const techniquesBlock = buildTechniquesBlock({ niveau: form.niveau });
  const c8Block = (form.niveau === "avance" || ["force", "prep_physique"].includes(form.objectif))
    ? PUISSANCE_C8 : "";
  const combatBlock = isCombat(form.sport) ? COMBAT_C3 : "";

  const obsBrutes = formatObservations(fiche?.observations);
  const fiabilite = typeof fiche?.exploitabilite === "number"
    ? ` · ${fiche.exploitabilite}% des traits lisibles sur les photos` : "";

  const morphoBlock = fiche
    ? `═══ FICHE MORPHOLOGIQUE (lecture coach validée, confiance: ${fiche.confiance}${fiabilite}) ═══
${obsBrutes ? `OBSERVATIONS DIRECTES SUR LES PHOTOS (à exploiter dans ta réflexion et tes choix d'exercices) :
${obsBrutes}

` : ""}LECTURE : ${(fiche.consequences.lecture_coach || []).join(" ")}
EXERCICES INTERDITS PAR LA MORPHO : ${fiche.consequences.exercices_interdits.join(", ") || "aucun"}
EXERCICES À ADAPTER : ${fiche.consequences.exercices_adaptes.join(", ") || "aucun"}
EXERCICES PRIVILÉGIÉS : ${fiche.consequences.exercices_privilegies.join(", ") || "aucun"}
POINTS FAIBLES VISUELS : ${(fiche.consequences.points_faibles_visuels || []).map(p => `${p.groupe} (${p.niveau})`).join(", ") || "aucun"}
POINTS FORTS VISUELS : ${(fiche.consequences.points_forts_visuels || []).join(", ") || "—"}
${fiche.consequences.regle_donnant_donnant ? "DONNANT-DONNANT : " + fiche.consequences.regle_donnant_donnant : ""}
${REGLE_PONDERATION}`
    : `═══ FICHE MORPHOLOGIQUE ═══
Aucune fiche morphologique disponible (pas de photos analysées) : appliquer les règles générales
prudentes — exercices polyvalents, ROM contrôlé, aucune supposition morphologique.`;

  // ── Directive récupération explicite (sommeil dégradé → plafond de volume) ──
  const sommeilDegrade = /insuffisant/i.test(dossier?.recuperation?.note || "");
  const recupBlock = sommeilDegrade
    ? `\n═══ RÉCUPÉRATION DÉGRADÉE (donnée réelle du dossier) ═══
Sommeil moyen ${dossier.recuperation.sommeil_moyen_7j || "< 6,5 h"} sur 7 jours : plafonner le volume
à ${volParams.series_min} séries/exercice, AUCUN échec musculaire cette semaine, aucune technique
d'intensification allongeant les repos. La récupération nerveuse est LA variable limitante ici.`
    : "";

  // ── Liste fermée de candidats (matériel + niveau déjà filtrés) ──
  // Format GROUPÉ : un bloc par muscle, sous-groupé par matériel. Le nom du
  // groupe et du matériel n'est plus répété sur chaque ligne — environ 35 % de
  // tokens économisés, ce qui permet d'injecter le catalogue ENTIER.
  const parGroupe = {};
  for (const e of candidats) {
    (parGroupe[e.groupe] = parGroupe[e.groupe] || {});
    (parGroupe[e.groupe][e.mat] = parGroupe[e.groupe][e.mat] || []).push(e);
  }
  const bloc = Object.entries(parGroupe).map(([groupe, parMat]) => {
    const lignes = Object.entries(parMat).map(([mat, list]) => {
      // Les correctifs sont signalés : ce sont eux qui servent les pathologies.
      const noms = list.map(e => (e.cat === "correctif" ? `${e.n} (correctif)` : e.n));
      return `  ${mat} — ${noms.join(" | ")}`;
    });
    return `▸ ${groupe.toUpperCase()}\n${lignes.join("\n")}`;
  }).join("\n");

  const candidatsBlock = `═══ CATALOGUE D'EXERCICES AUTORISÉS (liste FERMÉE — ${candidats.length} exercices) ═══
Tu choisis les exercices EXCLUSIVEMENT dans cette liste (noms EXACTS, matériel déjà
compatible avec l'équipement déclaré de l'athlète). Format : ▸ GROUPE puis, par
matériel, les exercices séparés par « | ».

EXIGENCE DE VARIÉTÉ : ce catalogue est large exprès. Exploite-le — varie les
angles, les matériels et les patterns moteurs entre les séances. Ne retombe pas
sur les 15 mêmes exercices classiques. Les exercices marqués (correctif) sont à
privilégier quand une pathologie ou un déséquilibre est déclaré.

${bloc}

Un exercice hors de cette liste sera REJETÉ par la validation.`;

  // ── Bloc CIBLÉ rééducation ──
  // Dans un catalogue de 800 exercices, le marqueur "(correctif)" ne suffit pas
  // à orienter le modèle. On lui redonne ici, explicitement, la liste des
  // correctifs pertinents pour LES pathologies déclarées.
  const pathosDeclarees = (form.pathologies || []).filter(p => p && p !== "Aucune");
  const { groupes: zonesPatho, exercices: correctifsCibles } =
    correctifsPourPathologies(pathosDeclarees, form.materiel || []);
  const reeducBlock = correctifsCibles.length ? `
═══ RÉÉDUCATION CIBLÉE — PATHOLOGIES DÉCLARÉES ═══
Pathologies : ${pathosDeclarees.join(", ")}
Zones à protéger et renforcer : ${zonesPatho.join(", ")}

Intègre AU MOINS 2 exercices correctifs par semaine issus de cette liste, placés
en début de séance (échauffement spécifique) ou en fin (renforcement) :
${correctifsCibles.map(e => `- ${e.n} [${e.groupe} · ${e.mat}]`).join("\n")}

Ces exercices sont du RENFORCEMENT, jamais un traitement : ne formule aucun
diagnostic, et rappelle dans "tips_coach" d'arrêter en cas de douleur vive.` : "";

  return `Tu es un Master Coach Sportif et Préparateur Physique expert en biomécanique, hypertrophie et périodisation. Tu conçois de véritables planifications individualisées, cliniques et orientées progression réelle.

═══ COUCHE 0 — DOSSIER ATHLÈTE (données RÉELLES du compte, jamais fictives) ═══
${JSON.stringify(dossier, null, 1).replace(/\n\s*/g, "\n").substring(0, 6000)}

${morphoBlock}
${recupBlock}

═══ COUCHE 0 — RAISONNEMENT COACH OBLIGATOIRE ═══
Avant TOUTE construction, tu réponds intérieurement à ces questions à partir du dossier et de la fiche :
${QUESTIONS_COACH}
Ta synthèse remplit le bloc "reflexion" du JSON, EN PREMIER.
RÈGLE FONDAMENTALE : Programme = réflexion(dossier). Chaque exercice choisi doit découler d'un élément explicite de ta réflexion (champ "justification"). Jamais Programme = objectif générique.

═══ RÈGLES ANTI-RÉPÉTITION (OBLIGATOIRES) ═══
- ${directives.regle_overlap}
- Split IMPOSÉ pour ce cycle : ${directives.split_impose}
- Accent méthodologique du cycle : ${directives.accent_methode}
- Vague de répétitions du cycle : ${directives.vague_de_reps}
- Les exercices "exercices_a_remplacer" et "exercices_douloureux" du dossier, et les "EXERCICES INTERDITS PAR LA MORPHO", NE DOIVENT PAS apparaître dans le programme (nommer l'alternative dans reflexion.exercices_ecartes).
- Si "etat_athlete" indique une reprise après coupure : appliquer STRICTEMENT sa directive (charges réduites, réadaptation) ET renouveler les stimuli.

${candidatsBlock}
${reeducBlock}

═══ PROFIL ATHLÈTE ═══
Nom: ${form.prenom || "Athlète"} | Âge: ${form.age} ans | Sexe: ${form.sexe}
Poids: ${form.poids} kg | Taille: ${form.taille} cm | IMC: ${imc}
Niveau: ${form.niveau} | Objectif: ${form.objectif}${form.objectifPrecis ? ` (précis: ${form.objectifPrecis})` : ""}
Jours d'entraînement (${joursPlein.length} par semaine): ${joursPlein.join(", ")}
Matériel disponible: ${(form.materiel || []).join(", ") || "salle complète"}
${form.sport ? `Sport pratiqué: ${form.sport} — intégrer des exercices de transfert spécifiques` : ""}
Pathologies déclarées: ${(form.pathologies || []).filter(p => p !== "Aucune").join(", ") || "aucune"}
Numéro de cycle: ${cycleNum}

═══ PARAMÈTRES DE VOLUME (MEV → MRV) ═══
Niveau ${form.niveau}: ${volParams.series_min}–${volParams.series_max} séries de travail par exercice
RPE cible: ${volParams.rpe_bas}–${volParams.rpe_haut} | RIR: ${volParams.rir}
Plage de répétitions principale: ${volParams.plage_reps || "6-12"}
Méthodes autorisées: ${volParams.methodes}
Structure du split: ${volParams.split}
${REGLES_NIVEAU}

═══ PÉRIODISATION MÉSOCYCLE (${mesoLogic.duree} semaines) ═══
${mesoLogic.phases.map(p => `S${p.sem} — ${p.phase} (RPE ${p.rpe}): ${p.consigne}`).join("\n")}

═══ GARDE-FOUS SÉCURITÉ (priment sur TOUT) ═══
- ${gardeFous}
${pathoRules ? `\n═══ ADAPTATIONS PATHOLOGIES (non négociables) ═══\n${pathoRules}` : ""}

═══ SÉLECTION D'EXERCICES — DONNÉES EMG & VARIATION ═══
${emgBlock}

═══ ADAPTATION FINE & RATTRAPAGE ═══
${rattrapageBlock}
${techniquesBlock ? `\n═══ TECHNIQUES & RÉCUPÉRATION ═══\n${techniquesBlock}` : ""}
${c8Block ? `\n═══ PUISSANCE & PÉRIODISATION AVANCÉE ═══\n${c8Block}` : ""}
${combatBlock ? `\n═══ SPÉCIFIQUE SPORT DE COMBAT ═══\n${combatBlock}` : ""}
${refs ? `\n═══ RÉFÉRENTIELS DES MUSCLES PRIORITAIRES ═══\n${refs}\n\n${CORRECTEURS}` : ""}

═══ FORMAT DE RÉPONSE ═══
Réponds UNIQUEMENT avec le JSON ci-dessous. Aucun texte avant ou après. Aucun markdown.

⛔ RÈGLE ABSOLUE — NOMBRE DE SÉANCES ⛔
Le tableau "seances" doit contenir EXACTEMENT ${joursPlein.length} séances, une par jour demandé :
${joursPlein.map((j, i) => `  ${i + 1}. ${j}`).join("\n")}
Chaque séance porte le champ "jour" correspondant, avec AU MINIMUM 4 exercices.
Un programme incomplet est un échec total : ne t'arrête jamais avant d'avoir écrit les ${joursPlein.length} séances.
Le schéma ci-dessous ne montre QU'UN SEUL exemple de séance — tu dois en produire ${joursPlein.length}.

Le bloc "reflexion" vient EN PREMIER : c'est ta pensée de coach, elle conditionne tout le reste.
Chaque exercice doit avoir un "tips_coach" précis basé sur la morphologie ET une "justification" courte qui référence un élément de ta réflexion.
Le champ "progression_semaine" explique comment progresser la SEMAINE SUIVANTE sur cet exercice.

{
"reflexion": ${SCHEMA_REFLEXION},
"analyse": {
"bilan_profil": "3 phrases max: morphologie + comment elle dicte les choix du programme",
"points_forts": ["groupe musculaire"],
"points_faibles": ["groupe musculaire"],
"posture": "description courte",
"morphotype": "ectomorphe|mésomorphe|endomorphe",
"humerus": "courts|longs",
"femurs": "courts|longs",
"cage": "plate|large",
"conseil": "1 conseil prioritaire personnalisé"
  },
"mesocycle": {
"duree_semaines": ${mesoLogic.duree},
"logique": "description de la progression sur le cycle",
"phases": [
      {"semaines": "1-2", "nom": "Phase", "rpe_cible": "X-Y", "ajustement_volume": "+0 séries", "consigne_coach": "instruction précise"}
    ]
  },
"programme": {
"titre": "nom du programme",
"methode": "méthode principale",
"split": "type de split utilisé",
"seances": [
      {
"jour": "${joursPlein[0] || "Lundi"}",
"focus": "Groupe(s) musculaire(s)",
"duree": "60min",
"intensite": "leger|modere|lourd|intense",
"type_seance": "push|pull|legs|corps_entier|upper|lower",
"note": "contexte de la séance, placement dans la semaine",
"exercices": [
          {
"nom": "Nom complet de l'exercice",
"series": "4", "reps": "8-10", "rpe": "7-8", "rir": "2-3",
"tempo": "3-1-2-0", "repos": "90s", "charge": "70-75% 1RM estimé",
"methode": "classique|superset_avec_suivant|drop_set|rest_pause|pyramidal|cluster",
"tips_coach": "Positionnement précis basé sur la morphologie de l'athlète",
"justification": "Pourquoi cet exercice pour CE profil (référence à la réflexion)",
"progression_semaine": "Comment progresser la semaine suivante"
          }
        ]
      }
    ],
"progression": {
"semaines_1_2": "instruction", "semaines_3_4": "instruction",
"semaine_5": "instruction", "semaine_deload": "instruction"
    }
  },
"correction": {
"groupes": ["muscle prioritaire"],
"note": "fréquence et méthode de correction recommandée",
"exercices_correctifs": ["exercice spécifique"]
  },
"nutrition": {"cal": 2500, "p": 150, "g": 300, "l": 80, "conseil": "conseil nutrition lié à l'objectif" },
"morpho": {"resume": "synthèse morphologique complète pour l'utilisateur" }
}`;
}

// ─── Validations post-génération ────────────────────────────────────────────
function listExercices(parsed) {
  const out = [];
  (parsed?.programme?.seances || []).forEach(s => (s.exercices || []).forEach(ex => ex?.nom && out.push(ex.nom)));
  return out;
}

export function validateProgramme(parsed, { dossier, fiche, materiel, joursDemandes = [] }) {
  const problems = [];
  const noms = listExercices(parsed);
  const exos = noms.map(normalizeExo);

  // 0. COMPLÉTUDE — le motif d'échec le plus coûteux : un programme amputé
  //    (5 jours demandés, 2 générés) passait jusqu'ici sans aucune alerte.
  const seances = parsed?.programme?.seances || [];
  const attendu = joursDemandes.length;
  if (attendu > 0 && seances.length !== attendu) {
    problems.push(
      `Programme incomplet : ${seances.length} séance(s) générée(s) pour ${attendu} jour(s) demandé(s) ` +
      `(${joursDemandes.join(", ")}) — régénère le programme COMPLET avec les ${attendu} séances`
    );
  }
  seances.forEach((s, i) => {
    const n = (s?.exercices || []).length;
    if (n < 4) problems.push(`Séance ${i + 1} (${s?.jour || "?"}) : ${n} exercice(s) seulement — minimum 4`);
  });

  // 1. Exercices bannis (morpho + mémoire + douleur)
  const bans = [
    ...(fiche?.consequences?.exercices_interdits || []),
    ...(dossier?.memoire_exercices?.exercices_a_remplacer || []),
    ...(dossier?.feedback_corporel?.exercices_douloureux || []).map(d => d.nom),
  ].map(normalizeExo).filter(Boolean);

  for (const exo of exos) {
    for (const ban of bans) {
      if (exo === ban || exo.includes(ban) || ban.includes(exo)) {
        problems.push(`Exercice interdit présent : "${exo}" (règle : "${ban}")`);
      }
    }
  }

  // 2. Recouvrement ≤ 40 % avec le dernier cycle
  const dernier = (dossier?.memoire_exercices?.exercices_dernier_cycle || []).map(normalizeExo);
  if (dernier.length >= 4 && exos.length > 0) {
    const repris = exos.filter(e => dernier.some(d => d === e)).length;
    const ratio = repris / exos.length;
    if (ratio > 0.4) problems.push(`Recouvrement ${Math.round(ratio * 100)}% avec le cycle précédent (max 40%)`);
  }

  // 3. Existence au catalogue + compatibilité matériel
  const mats = matsAutorises(materiel || []);
  const horsCatalogue = [];
  for (const nom of noms) {
    const entry = findInCatalogue(nom);
    if (!entry) {
      horsCatalogue.push(nom);
      problems.push(`Exercice hors catalogue : "${nom}" — remplacer par un nom EXACT de la liste fournie`);
    } else if (!mats.has(entry.mat)) {
      problems.push(`Matériel indisponible pour "${nom}" (${entry.mat}) — choisir une alternative compatible`);
    }
  }
  // La liste des inconnus voyage avec les problèmes : elle alimente la file de
  // revue sans jamais faire échouer la génération.
  problems.horsCatalogue = horsCatalogue;
  return problems;
}

// ─── Jours : le sélecteur du client émet des abréviations ("Lun", "Mar"…) ────
// alors que le programme attend des noms complets ("Lundi"). On normalise ICI
// pour que le modèle reçoive exactement ce qu'il doit réécrire dans "jour".
const JOURS_COMPLETS = {
  lun: "Lundi", mar: "Mardi", mer: "Mercredi", jeu: "Jeudi",
  ven: "Vendredi", sam: "Samedi", dim: "Dimanche",
};
export function normalizeJours(jours = []) {
  return (jours || [])
    .map((j) => {
      const k = String(j || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").slice(0, 3);
      return JOURS_COMPLETS[k] || String(j || "").trim();
    })
    .filter(Boolean);
}

// ─── Cœur de génération (partagé sync/async) ────────────────────────────────
/**
 * Exécute la génération complète — EXACTEMENT la logique métier historique :
 * prompt intégral, appel principal, validation, tentative corrective unique.
 * Aucune simplification : seul le budget temps disponible change selon la
 * route appelante (110 s en synchrone, ~280 s via le job asynchrone).
 * @returns {Promise<{parsed:object, warnings:string[], meta:object}>}
 */
export async function runGeneration({ form, dossier, ficheMorpho, access, budgetMs = 110_000 }) {
  const startedAt = Date.now();
  const cycleNum = Math.max(1, parseInt(dossier?.numero_cycle) || (dossier?.memoire_exercices ? 2 : 1));
  const directives = getVariationDirectives({
    cycleNum, nbJours: (form.jours || []).length, objectif: form.objectif, niveau: form.niveau,
  });

  const fiche = mergeFicheLists(ficheMorpho || null);
  // Bassin de candidats proportionnel au volume demandé : 5 jours ont besoin de
  // bien plus de choix que 3. L'entrée coûte 5× moins cher que la sortie, donc
  // un catalogue large est le levier le moins cher pour la qualité.
  const nbJours = (form.jours || []).length || 3;
  const candidats = selectCandidats({
    materiel: form.materiel || [],
    niveau: form.niveau || "intermediaire",
    aConserver: dossier?.memoire_exercices?.exercices_a_conserver || [],
    privilegies: fiche?.consequences?.exercices_privilegies || [],
    max: 9999,   // catalogue ENTIER (déjà filtré par matériel + niveau)
  });

  const prompt = buildServerPrompt({ form, dossier: dossier || {}, fiche, directives, cycleNum, candidats });
  const system = "Tu es un Master Coach Sportif expert en biomécanique, hypertrophie et périodisation. Tu raisonnes comme un coach de 10 ans d'expérience : tu lis le dossier de l'athlète AVANT de décider. Tu génères UNIQUEMENT du JSON valide, sans texte avant ou après, sans markdown, COMPACT sur une seule ligne (aucune indentation, aucun retour à la ligne) : chaque caractère de mise en forme est du gaspillage.";

  const remaining = () => budgetMs - (Date.now() - startedAt);
  // Bornes par appel dérivées du budget : larges en asynchrone, historiques en synchrone.
  // Une réponse COMPLÈTE de 8000 tokens prend couramment 150-180 s : le cap
  // large doit couvrir ce cas réel, sinon c'est notre propre AbortController
  // qui tue une génération légitime (vu en production : abort à 120 s pile).
  const wide  = budgetMs >= 200_000;
  const CAP1  = wide ? 240_000 : 70_000;   // appel principal
  const GATE  = wide ?  90_000 : 35_000;   // temps restant minimal pour tenter la correction
  const CAP2  = wide ? 180_000 : 60_000;   // appel correctif
  const MARGE = wide ?  10_000 :  5_000;   // marge de sérialisation

  try {
    let raw = await callAnthropic({
      model: MODEL, maxTokens: 16000, system,
      content: [{ type: "text", text: prompt }],
      timeoutMs: Math.min(CAP1, remaining()),
    });
    let parsed = parseJSON(raw);
    let problems = validateProgramme(parsed, { dossier, fiche, materiel: form.materiel, joursDemandes: normalizeJours(form.jours) });

    // Une seule tentative corrective, et seulement si le temps restant le
    // permet. FILET DE SÉCURITÉ : si la correction expire ou échoue, on
    // CONSERVE le programme initial avec ses warnings — une correction ratée
    // ne doit jamais détruire une génération complète déjà en main.
    if (problems.length > 0 && remaining() > GATE) {
      console.warn("[generate-program] Corrections demandées:", problems);
      try {
        const raw2 = await callAnthropic({
          model: MODEL, maxTokens: 16000, system,
          timeoutMs: Math.min(CAP2, remaining() - MARGE),
          content: [{
            type: "text",
            text: prompt + `\n\n═══ CORRECTION OBLIGATOIRE ═══\nTa précédente proposition violait ces règles:\n- ${problems.join("\n- ")}\nRégénère le JSON COMPLET en corrigeant ces violations (remplace les exercices fautifs par des alternatives autorisées du même pattern moteur, prises dans la liste fournie, renouvelle les exercices en trop).`,
          }],
        });
        const parsed2 = parseJSON(raw2);
        parsed = parsed2;
        problems = validateProgramme(parsed2, { dossier, fiche, materiel: form.materiel, joursDemandes: normalizeJours(form.jours) });
      } catch (e2) {
        console.warn("[generate-program] Correction avortée, programme initial conservé:", e2.message);
      }
    }

    // Exercices proposés hors catalogue : conservés dans le programme, mis en
    // file de revue pour un ajout éventuel au catalogue (fire-and-forget).
    if (problems.horsCatalogue?.length) {
      logExercicesProposes(problems.horsCatalogue, {
        niveau: form.niveau, objectif: form.objectif, materiel: form.materiel,
      });
    }

    const durationMs = Date.now() - startedAt;

    // Télémétrie IA — fire-and-forget, jamais bloquante
    logGenerationEvent({
      userId: access.userId, form, dossier, fiche, directives,
      reflexion: parsed?.reflexion || null, programme: parsed?.programme || null,
      warnings: problems, model: MODEL, durationMs,
      accessMode: access.mode, status: "ok",
    });

    return {
      parsed,
      warnings: problems,             // vide si tout est conforme
      meta: { cycleNum, directives, dureeMs: durationMs, acces: access.mode || "verifie" },
    };
  } catch (e) {
    logGenerationEvent({
      userId: access.userId, form, dossier, fiche, directives,
      model: MODEL, durationMs: Date.now() - startedAt,
      accessMode: access.mode, status: "error:" + (e.status || 500),
    });
    throw e;
  }
}

// ─── Handler ────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  const g = guard(req, res);
  if (!g.ok) return g.error ? res.status(g.status).json({ error: g.error }) : res.status(g.status).end();

  const access = await checkAccess(req);
  if (!access.ok) return res.status(access.status).json({ error: access.error });

  const quota = await checkAndCountUsage(access, "generation");
  if (!quota.ok) return res.status(quota.status).json({ error: quota.error });

  const { form, dossier, ficheMorpho } = req.body || {};
  if (!form || typeof form !== "object") return res.status(400).json({ error: "Profil (form) manquant" });
  if (JSON.stringify(req.body).length > 200_000) return res.status(400).json({ error: "Requête trop volumineuse" });

  try {
    const out = await runGeneration({ form, dossier, ficheMorpho, access, budgetMs: 110_000 });
    return res.status(200).json(out);
  } catch (e) {
    console.error("[generate-program]", e.message);
    return res.status(e.status || 500).json({ error: e.message || "Erreur serveur" });
  }
}
