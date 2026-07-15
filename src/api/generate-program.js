// ─── API : /api/generate-program ────────────────────────────────────────────
// Appel GÉNÉRATION : reçoit { form, dossier, ficheMorpho } — PAS de photos.
// Le prompt est assemblé ICI : la connaissance MorphoCoach (_knowledge/) ne
// quitte jamais le serveur. Routage déterministe : seuls les modules pertinents
// pour CE profil sont injectés. Validations post-génération : exercices
// interdits absents, recouvrement ≤ 40 % vs cycle précédent.

import { guard, checkAccess } from"./_lib/security.js";
import { callAnthropic, parseJSON, normalizeExo } from"./_lib/anthropic.js";
import { buildPathoRules, buildGardeFous } from"./_knowledge/securite.js";
import { getVolumeParams, getMesocycleLogic, REGLES_NIVEAU } from"./_knowledge/noyau.js";
import { QUESTIONS_COACH, REGLE_PONDERATION, getVariationDirectives, SCHEMA_REFLEXION }
  from"./_knowledge/couche0.js";
import { routeReferentiels, CORRECTEURS } from"./_knowledge/referentiels.js";
import { buildEMGBlock } from"./_knowledge/emg.js";
import { buildRattrapageBlock } from"./_knowledge/rattrapage.js";
import { buildTechniquesBlock } from"./_knowledge/techniques.js";
import { PUISSANCE_C8, COMBAT_C3, isCombat } from"./_knowledge/periodisation_combat.js";

export const config = { api: { bodyParser: { sizeLimit:"4mb" } } };

// ─── Assemblage du prompt (côté serveur uniquement) ─────────────────────────
function buildServerPrompt({ form, dossier, fiche, directives, cycleNum }) {
  const volParams  = getVolumeParams(form.niveau, form.objectif);
  const mesoLogic  = getMesocycleLogic(form.niveau, form.objectif, cycleNum);
  const pathoRules = buildPathoRules(form.pathologies);
  const gardeFous  = buildGardeFous({ age: form.age, niveau: form.niveau });
  const imc = form.poids && form.taille
    ? (parseFloat(form.poids) / Math.pow(parseFloat(form.taille) / 100, 2)).toFixed(1) :"?";

  // Routage référentiels : points faibles visuels (fiche) + priorités du dossier
  const groupesPrioritaires = [
    ...(fiche?.consequences?.points_faibles_visuels || []).map(p => p.groupe),
  ];
  const refs = routeReferentiels(groupesPrioritaires);

  // Routage des couches d'expertise (chaque bloc n'est injecté que s'il sert CE profil)
  const emgBlock  = buildEMGBlock({ niveau: form.niveau, objectif: form.objectif });
  const rattrapageBlock = buildRattrapageBlock({
    hasPointsFaibles: groupesPrioritaires.length > 0,
    corrigerFaibles:  !!dossier?.priorite_points_faibles,
    groupes:          groupesPrioritaires,
  });
  const techniquesBlock = buildTechniquesBlock({ niveau: form.niveau });
  const c8Block = (form.niveau ==="avance" || ["force","prep_physique"].includes(form.objectif))
    ? PUISSANCE_C8 :"";
  const combatBlock = isCombat(form.sport) ? COMBAT_C3 :"";

  const morphoBlock = fiche
    ?`═══ FICHE MORPHOLOGIQUE (lecture coach validée, confiance: ${fiche.confiance}) ═══
LECTURE : ${(fiche.consequences.lecture_coach || []).join("")}
EXERCICES INTERDITS PAR LA MORPHO : ${fiche.consequences.exercices_interdits.join(",") ||"aucun"}
EXERCICES À ADAPTER : ${fiche.consequences.exercices_adaptes.join(",") ||"aucun"}
EXERCICES PRIVILÉGIÉS : ${fiche.consequences.exercices_privilegies.join(",") ||"aucun"}
POINTS FAIBLES VISUELS : ${(fiche.consequences.points_faibles_visuels || []).map(p =>`${p.groupe} (${p.niveau})`).join(",") ||"aucun"}
POINTS FORTS VISUELS : ${(fiche.consequences.points_forts_visuels || []).join(",") ||"—"}
${fiche.consequences.regle_donnant_donnant ?"DONNANT-DONNANT :" + fiche.consequences.regle_donnant_donnant :""}
${REGLE_PONDERATION}`
    :`═══ FICHE MORPHOLOGIQUE ═══
Aucune fiche morphologique disponible (pas de photos analysées) : appliquer les règles générales
prudentes — exercices polyvalents, ROM contrôlé, aucune supposition morphologique.`;

  return`Tu es un Master Coach Sportif et Préparateur Physique expert en biomécanique, hypertrophie et périodisation. Tu conçois de véritables planifications individualisées, cliniques et orientées progression réelle.

═══ COUCHE 0 — DOSSIER ATHLÈTE (données RÉELLES du compte, jamais fictives) ═══
${JSON.stringify(dossier, null, 1).replace(/\n\s*/g,"\n").substring(0, 6000)}

${morphoBlock}

═══ COUCHE 0 — RAISONNEMENT COACH OBLIGATOIRE ═══
Avant TOUTE construction, tu réponds intérieurement à ces questions à partir du dossier et de la fiche :
${QUESTIONS_COACH}
Ta synthèse remplit le bloc"reflexion" du JSON, EN PREMIER.
RÈGLE FONDAMENTALE : Programme = réflexion(dossier). Chaque exercice choisi doit découler d'un élément explicite de ta réflexion (champ"justification"). Jamais Programme = objectif générique.

═══ RÈGLES ANTI-RÉPÉTITION (OBLIGATOIRES) ═══
- ${directives.regle_overlap}
- Split IMPOSÉ pour ce cycle : ${directives.split_impose}
- Accent méthodologique du cycle : ${directives.accent_methode}
- Vague de répétitions du cycle : ${directives.vague_de_reps}
- Les exercices"exercices_a_remplacer" et"exercices_douloureux" du dossier, et les"EXERCICES INTERDITS PAR LA MORPHO", NE DOIVENT PAS apparaître dans le programme (nommer l'alternative dans reflexion.exercices_ecartes).
- Si"etat_athlete" indique une reprise après coupure : appliquer STRICTEMENT sa directive (charges réduites, réadaptation) ET renouveler les stimuli.

═══ PROFIL ATHLÈTE ═══
Nom: ${form.prenom ||"Athlète"} | Âge: ${form.age} ans | Sexe: ${form.sexe}
Poids: ${form.poids} kg | Taille: ${form.taille} cm | IMC: ${imc}
Niveau: ${form.niveau} | Objectif: ${form.objectif}${form.objectifPrecis ?` (précis: ${form.objectifPrecis})` :""}
Jours d'entraînement: ${(form.jours || []).join(",") ||"3 jours/semaine"}
Matériel disponible: ${(form.materiel || []).join(",") ||"salle complète"}
${form.sport ?`Sport pratiqué: ${form.sport} — intégrer des exercices de transfert spécifiques` :""}
Pathologies déclarées: ${(form.pathologies || []).filter(p => p !=="Aucune").join(",") ||"aucune"}
Numéro de cycle: ${cycleNum}

═══ PARAMÈTRES DE VOLUME (MEV → MRV) ═══
Niveau ${form.niveau}: ${volParams.series_min}–${volParams.series_max} séries de travail par exercice
RPE cible: ${volParams.rpe_bas}–${volParams.rpe_haut} | RIR: ${volParams.rir}
Plage de répétitions principale: ${volParams.plage_reps ||"6-12"}
Méthodes autorisées: ${volParams.methodes}
Structure du split: ${volParams.split}
${REGLES_NIVEAU}

═══ PÉRIODISATION MÉSOCYCLE (${mesoLogic.duree} semaines) ═══
${mesoLogic.phases.map(p =>`S${p.sem} — ${p.phase} (RPE ${p.rpe}): ${p.consigne}`).join("\n")}

═══ GARDE-FOUS SÉCURITÉ (priment sur TOUT) ═══
- ${gardeFous}
${pathoRules ?`\n═══ ADAPTATIONS PATHOLOGIES (non négociables) ═══\n${pathoRules}` :""}

═══ SÉLECTION D'EXERCICES — DONNÉES EMG & VARIATION ═══
${emgBlock}

═══ ADAPTATION FINE & RATTRAPAGE ═══
${rattrapageBlock}
${techniquesBlock ?`\n═══ TECHNIQUES & RÉCUPÉRATION ═══\n${techniquesBlock}` :""}
${c8Block ?`\n═══ PUISSANCE & PÉRIODISATION AVANCÉE ═══\n${c8Block}` :""}
${combatBlock ?`\n═══ SPÉCIFIQUE SPORT DE COMBAT ═══\n${combatBlock}` :""}
${refs ?`\n═══ RÉFÉRENTIELS DES MUSCLES PRIORITAIRES ═══\n${refs}\n\n${CORRECTEURS}` :""}

═══ FORMAT DE RÉPONSE ═══
Réponds UNIQUEMENT avec le JSON ci-dessous. Aucun texte avant ou après. Aucun markdown.
Le bloc"reflexion" vient EN PREMIER : c'est ta pensée de coach, elle conditionne tout le reste.
Chaque exercice doit avoir un"tips_coach" précis basé sur la morphologie ET une"justification" courte qui référence un élément de ta réflexion.
Le champ"progression_semaine" explique comment progresser la SEMAINE SUIVANTE sur cet exercice.

{
"reflexion": ${SCHEMA_REFLEXION},
"analyse": {
"bilan_profil":"3 phrases max: morphologie + comment elle dicte les choix du programme",
"points_forts": ["groupe musculaire"],
"points_faibles": ["groupe musculaire"],
"posture":"description courte",
"morphotype":"ectomorphe|mésomorphe|endomorphe",
"humerus":"courts|longs",
"femurs":"courts|longs",
"cage":"plate|large",
"conseil":"1 conseil prioritaire personnalisé"
  },
"mesocycle": {
"duree_semaines": ${mesoLogic.duree},
"logique":"description de la progression sur le cycle",
"phases": [
      {"semaines":"1-2","nom":"Phase","rpe_cible":"X-Y","ajustement_volume":"+0 séries","consigne_coach":"instruction précise"}
    ]
  },
"programme": {
"titre":"nom du programme",
"methode":"méthode principale",
"split":"type de split utilisé",
"seances": [
      {
"jour":"Lundi",
"focus":"Groupe(s) musculaire(s)",
"duree":"60min",
"intensite":"leger|modere|lourd|intense",
"type_seance":"push|pull|legs|corps_entier|upper|lower",
"note":"contexte de la séance, placement dans la semaine",
"exercices": [
          {
"nom":"Nom complet de l'exercice",
"series":"4","reps":"8-10","rpe":"7-8","rir":"2-3",
"tempo":"3-1-2-0","repos":"90s","charge":"70-75% 1RM estimé",
"methode":"classique|superset_avec_suivant|drop_set|rest_pause|pyramidal|cluster",
"tips_coach":"Positionnement précis basé sur la morphologie de l'athlète",
"justification":"Pourquoi cet exercice pour CE profil (référence à la réflexion)",
"progression_semaine":"Comment progresser la semaine suivante"
          }
        ]
      }
    ],
"progression": {
"semaines_1_2":"instruction","semaines_3_4":"instruction",
"semaine_5":"instruction","semaine_deload":"instruction"
    }
  },
"correction": {
"groupes": ["muscle prioritaire"],
"note":"fréquence et méthode de correction recommandée",
"exercices_correctifs": ["exercice spécifique"]
  },
"nutrition": {"cal": 2500,"p": 150,"g": 300,"l": 80,"conseil":"conseil nutrition lié à l'objectif" },
"morpho": {"resume":"synthèse morphologique complète pour l'utilisateur" }
}`;
}

// ─── Validations post-génération ────────────────────────────────────────────
function listExercices(parsed) {
  const out = [];
  (parsed?.programme?.seances || []).forEach(s => (s.exercices || []).forEach(ex => ex?.nom && out.push(ex.nom)));
  return out;
}

function validate(parsed, { dossier, fiche }) {
  const problems = [];
  const exos = listExercices(parsed).map(normalizeExo);

  const bans = [
    ...(fiche?.consequences?.exercices_interdits || []),
    ...(dossier?.memoire_exercices?.exercices_a_remplacer || []),
    ...(dossier?.feedback_corporel?.exercices_douloureux || []).map(d => d.nom),
  ].map(normalizeExo).filter(Boolean);

  for (const exo of exos) {
    for (const ban of bans) {
      if (exo === ban || exo.includes(ban) || ban.includes(exo)) {
        problems.push(`Exercice interdit présent :"${exo}" (règle :"${ban}")`);
      }
    }
  }

  const dernier = (dossier?.memoire_exercices?.exercices_dernier_cycle || []).map(normalizeExo);
  if (dernier.length >= 4 && exos.length > 0) {
    const repris = exos.filter(e => dernier.some(d => d === e)).length;
    const ratio = repris / exos.length;
    if (ratio > 0.4) problems.push(`Recouvrement ${Math.round(ratio * 100)}% avec le cycle précédent (max 40%)`);
  }
  return problems;
}

// ─── Handler ────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  const g = guard(req, res);
  if (!g.ok) return g.error ? res.status(g.status).json({ error: g.error }) : res.status(g.status).end();

  const access = await checkAccess(req);
  if (!access.ok) return res.status(access.status).json({ error: access.error });

  const { form, dossier, ficheMorpho } = req.body || {};
  if (!form || typeof form !=="object") return res.status(400).json({ error:"Profil (form) manquant" });
  if (JSON.stringify(req.body).length > 200_000) return res.status(400).json({ error:"Requête trop volumineuse" });

  const startedAt = Date.now();
  const cycleNum = Math.max(1, parseInt(dossier?.numero_cycle) || (dossier?.memoire_exercices ? 2 : 1));
  const directives = getVariationDirectives({
    cycleNum, nbJours: (form.jours || []).length, objectif: form.objectif, niveau: form.niveau,
  });

  const prompt = buildServerPrompt({ form, dossier: dossier || {}, fiche: ficheMorpho || null, directives, cycleNum });
  const system ="Tu es un Master Coach Sportif expert en biomécanique, hypertrophie et périodisation. Tu raisonnes comme un coach de 10 ans d'expérience : tu lis le dossier de l'athlète AVANT de décider. Tu génères UNIQUEMENT du JSON valide, sans texte avant ou après, sans markdown.";

  try {
    let raw = await callAnthropic({
      model:"claude-sonnet-4-6", maxTokens: 8000, system,
      content: [{ type:"text", text: prompt }],
    });
    let parsed = parseJSON(raw);
    let problems = validate(parsed, { dossier, fiche: ficheMorpho });

    // Une seule tentative corrective, si le budget temps le permet
    if (problems.length > 0 && Date.now() - startedAt < 22_000) {
      console.warn("[generate-program] Corrections demandées:", problems);
      raw = await callAnthropic({
        model:"claude-sonnet-4-6", maxTokens: 8000, system,
        content: [{
          type:"text",
          text: prompt +`\n\n═══ CORRECTION OBLIGATOIRE ═══\nTa précédente proposition violait ces règles:\n- ${problems.join("\n-")}\nRégénère le JSON COMPLET en corrigeant ces violations (remplace les exercices fautifs par des alternatives autorisées du même pattern moteur, renouvelle les exercices en trop).`,
        }],
      });
      parsed = parseJSON(raw);
      problems = validate(parsed, { dossier, fiche: ficheMorpho });
    }

    return res.status(200).json({
      parsed,
      warnings: problems,             // vide si tout est conforme
      meta: { cycleNum, directives, dureeMs: Date.now() - startedAt, acces: access.mode ||"verifie" },
    });
  } catch (e) {
    console.error("[generate-program]", e.message);
    return res.status(e.status || 500).json({ error: e.message ||"Erreur serveur" });
  }
}
