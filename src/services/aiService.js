// ─── AI SERVICE ─────────────────────────────────────────────────────────────
// Logique de génération de programme par IA — Master Coach Edition

export function compressImage(dataUrl, maxW = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = Math.min(maxW / img.width, maxW / img.height, 1);
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// ─── RÈGLES BIOMÉCANIQUE PAR PATHOLOGIE ─────────────────────────────────────
function buildPathoRules(pathologies) {
  if (!pathologies || pathologies.includes("Aucune")) return "";
  const rules = [];
  if (pathologies.includes("Lombalgie") || pathologies.includes("Hernie discale"))
    rules.push("LOMBAIRES: INTERDITS soulevé de terre, good morning, hyperextension lourde, squat haute barre. OBLIGATOIRES gainage transverse, bird-dog, pont fessier, soulevé de terre roumain léger. Éviter flexion lombaire sous charge.");
  if (pathologies.includes("Scoliose"))
    rules.push("SCOLIOSE: Exercices UNILATÉRAUX prioritaires pour corriger les asymétries. Eviter charges axiales lourdes. Prioriser câbles et haltères.");
  if (pathologies.includes("Cervicalgie"))
    rules.push("CERVICALES: INTERDIT tirage nuque, développé nuque. Limiter les positions tête en avant. Face pull et rétraction scapulaire à chaque séance.");
  if (pathologies.includes("Conflit épaule") || pathologies.includes("Coiffe rotateurs"))
    rules.push("ÉPAULE: INTERDITS développé barre, tirage nuque, élévations frontales. OBLIGATOIRES face pull, rotation externe (Rotateurs), dips si tolérés. Mouvements dans le plan scapulaire uniquement.");
  if (pathologies.includes("Ménisque") || pathologies.includes("LCA"))
    rules.push("GENOU: INTERDIT squat profond, fentes avec impact, leg press pied haut. OK presse 60° limiter amplitude, leg extension léger pour VMO, step-up contrôlé. Renforcement ischio-jambiers prioritaire.");
  if (pathologies.includes("Arthrose"))
    rules.push("ARTHROSE: Charges modérées, amplitudes réduites. Éviter les chocs articulaires. Privilégier machines guidées et câbles.");
  if (pathologies.includes("Épicondylite"))
    rules.push("ÉPICONDYLITE: INTERDIT curl barre droite, rowing barre pronation. OK curl haltères, câble. Excentrique contrôlé sur fléchisseurs.");
  if (pathologies.includes("Canal carpien"))
    rules.push("CANAL CARPIEN: Éviter la flexion/extension forcée du poignet sous charge. Utiliser des sangles. Éviter les push-ups sur poignets.");
  if (pathologies.includes("Tendinite Achille"))
    rules.push("ACHILLE: INTERDIT mollets debout lourds, sauts. OK mollets assis, excentrique en déclive. Éviter les accélérations brutales.");
  if (pathologies.includes("Coxarthrose"))
    rules.push("HANCHE: Amplitudes réduites, pas de squat profond. Privilégier les mouvements dans l'axe fonctionnel de la hanche.");
  return rules.join("\n");
}

// ─── LOGIQUE DE VOLUME MEV → MRV ────────────────────────────────────────────
function getVolumeParams(niveau, objectif) {
  const base = {
    debutant:       { series_min: 3, series_max: 4, rpe_bas: 5, rpe_haut: 7, rir: "3-4", methodes: "classique uniquement, pas de techniques d'intensification", split: "corps entier 3x/sem ou push-pull-legs si 4j+" },
    intermediaire:  { series_min: 4, series_max: 5, rpe_bas: 7, rpe_haut: 8, rir: "2-3", methodes: "pyramidal, supersets agonistes-antagonistes, rest-pause sur 1 exercice/séance", split: "push-pull-legs ou haut-bas selon jours" },
    avance:         { series_min: 5, series_max: 6, rpe_bas: 8, rpe_haut: 9, rir: "1-2", methodes: "drop sets, rest-pause, cluster sets, 5x5 sur composés, méthode bulgare si force", split: "split 4-6 jours, spécialisation par groupe" },
  };
  const v = base[niveau] || base.intermediaire;
  if (objectif === "force")
    return { ...v, rpe_bas: v.rpe_bas + 0.5, rpe_haut: Math.min(v.rpe_haut + 0.5, 9.5), plage_reps: "1-6", priorite: "composés poly-articulaires: squat, développé, soulevé de terre, épaulé" };
  if (objectif === "poids")
    return { ...v, methodes: v.methodes + ", circuits métaboliques, supersets non-antagonistes pour densité", plage_reps: "12-20" };
  if (objectif === "sante")
    return { ...v, rpe_bas: Math.max(v.rpe_bas - 1, 4), rpe_haut: Math.min(v.rpe_haut - 1, 7), plage_reps: "12-15", methodes: "classique, effort confortable et régulier" };
  return { ...v, plage_reps: "6-12" };
}

// ─── LOGIQUE DE PÉRIODISATION MÉSOCYCLE ─────────────────────────────────────
function getMesocycleLogic(niveau, objectif, cycleNum) {
  const duree = niveau === "debutant" ? 4 : 6;
  const phases = {
    hypertrophie: [
      { sem: "1-2", phase: "Accumulation", rpe: "6-7", consigne: "Apprentissage des mouvements, volume modéré, maîtrise technique" },
      { sem: "3-4", phase: "Intensification", rpe: "7-8", consigne: `Augmenter la charge de 5% ou +1 rep sur chaque exercice vs S${cycleNum>1?cycleNum-1:1}` },
      { sem: "5",   phase: "Surcharge",      rpe: "8-9", consigne: "Volume max du cycle, chercher l'échec technique sur le dernier set" },
      { sem: "6",   phase: "Deload",          rpe: "5-6", consigne: "Réduire le volume de 40%, maintenir l'intensité, récupération active" },
    ],
    force: [
      { sem: "1-2", phase: "Technique",       rpe: "6-7", consigne: "Perfectionner les patterns moteurs sur squat, développé, soulevé de terre" },
      { sem: "3-4", phase: "Force-volume",    rpe: "7-8", consigne: "5x5 sur composés, progression linéaire +2.5kg/séance" },
      { sem: "5",   phase: "Pic d'intensité", rpe: "9",   consigne: "Triples et doubles à 90-95% du max, viser des records personnels" },
      { sem: "6",   phase: "Deload",          rpe: "5",   consigne: "Volume 50%, intensité maintenue, préparer le prochain bloc" },
    ],
    poids: [
      { sem: "1-2", phase: "Activation",      rpe: "6-7", consigne: "Circuits métaboliques, supersets, dépense calorique + maintien musculaire" },
      { sem: "3-4", phase: "Intensification", rpe: "7-8", consigne: "Densité d'effort, temps de repos courts (60s), maintien des charges" },
      { sem: "5",   phase: "Pic effort",      rpe: "8",   consigne: "HIIT en fin de séance, séries longues 15-20 reps" },
      { sem: "6",   phase: "Décharge",        rpe: "5-6", consigne: "Volume réduit, récupération, recalibration hormonale" },
    ],
    prep_physique: [
      { sem: "1-2", phase: "Fondations",      rpe: "6-7", consigne: "Force de base, gainage, mobilité, aucune fatigue résiduelle" },
      { sem: "3-4", phase: "Développement",   rpe: "7-8", consigne: "Puissance explosive, exercices de transfert sportif, conditionnement" },
      { sem: "5",   phase: "Pic athlétique",  rpe: "8-9", consigne: "Intensité maximale, exercices spécifiques au sport pratiqué" },
      { sem: "6",   phase: "Récupération",    rpe: "5",   consigne: "Récupération active, mobilité, préparation cycle suivant" },
    ],
    sante: [
      { sem: "1-2", phase: "Adaptation",      rpe: "5-6", consigne: "Mouvements fonctionnels, effort agréable, régularité" },
      { sem: "3-4", phase: "Progression",     rpe: "6-7", consigne: "Légère augmentation du volume, diversification des exercices" },
      { sem: "5-6", phase: "Consolidation",   rpe: "6-7", consigne: "Maintien, plaisir de l'effort, équilibre musculaire global" },
    ],
  };
  return { duree, phases: phases[objectif] || phases.hypertrophie };
}

// ─── BUILD PROMPT — MASTER COACH ─────────────────────────────────────────────
export function buildPrompt({ form, photos, cycles, corrigerFaibles }) {
  const prec     = cycles && cycles.length > 0 ? cycles[cycles.length - 1] : null;
  const cycleNum = (cycles?.length || 0) + 1;
  const imc      = form.poids && form.taille
    ? (parseFloat(form.poids) / Math.pow(parseFloat(form.taille) / 100, 2)).toFixed(1)
    : "?";
  const nbPhotos   = [photos?.face, photos?.dos, photos?.profil].filter(Boolean).length;
  const pathosAdapt = (form.pathologies || []).filter(p => p !== "Aucune");
  const volParams  = getVolumeParams(form.niveau, form.objectif);
  const mesoLogic  = getMesocycleLogic(form.niveau, form.objectif, cycleNum);
  const pathoRules = buildPathoRules(form.pathologies);

  const histCtx = prec
    ? `CYCLE PRÉCÉDENT (C${cycleNum - 1}): "${prec.titre}". Charges loggées: ${prec.chargesResume || "non disponibles"}. RÈGLE ABSOLUE: ce programme DOIT progresser en charge (+2.5 à 5%), volume (+1 série) ou méthode d'intensification vs le cycle précédent.`
    : `PREMIER CYCLE. L'utilisateur démarre sa progression — partir sur des bases solides et apprenables.`;

  return `Tu es un Master Coach Sportif et Préparateur Physique expert en biomécanique, hypertrophie, et périodisation de l'entraînement. Tu conçois de véritables planifications sportives individualisées, cliniques et orientées progression réelle.

═══ CONTEXTE CYCLE ═══
${histCtx}
Numéro de cycle: ${cycleNum}
${cycleNum > 1 ? "Progression OBLIGATOIRE vs cycle précédent sur au moins 70% des exercices." : ""}

═══ PROFIL ATHLÈTE ═══
Nom: ${form.prenom || "Athlète"} | Âge: ${form.age} ans | Sexe: ${form.sexe}
Poids: ${form.poids} kg | Taille: ${form.taille} cm | IMC: ${imc}
Niveau: ${form.niveau} | Objectif: ${form.objectif}${form.objectifPrecis ? ` (précis: ${form.objectifPrecis})` : ""}
Jours d'entraînement: ${(form.jours || []).join(", ") || "3 jours/semaine"}
Matériel disponible: ${(form.materiel || []).join(", ") || "salle complète"}
${form.sport ? `Sport pratiqué: ${form.sport} — intégrer des exercices de transfert spécifiques` : ""}
Pathologies déclarées: ${pathosAdapt.length > 0 ? pathosAdapt.join(", ") : "aucune"}
Photos de posture disponibles: ${nbPhotos}/3
Corriger les points faibles: ${corrigerFaibles ? "OUI — prioriser les groupes musculaires en retard" : "NON"}

═══ PARAMÈTRES DE VOLUME (MEV → MRV) ═══
Niveau ${form.niveau}: ${volParams.series_min}–${volParams.series_max} séries de travail par exercice
RPE cible: ${volParams.rpe_bas}–${volParams.rpe_haut} | RIR: ${volParams.rir}
Plage de répétitions principale: ${volParams.plage_reps || "6-12"}
Méthodes autorisées: ${volParams.methodes}
Structure du split: ${volParams.split}

═══ PÉRIODISATION MÉSOCYCLE (${mesoLogic.duree} semaines) ═══
${mesoLogic.phases.map(p => `S${p.sem} — ${p.phase} (RPE ${p.rpe}): ${p.consigne}`).join("\n")}

═══ RÈGLES BIOMÉCANIQUES OBLIGATOIRES ═══
ANALYSE MORPHOLOGIQUE (si photos disponibles, sinon inférer à partir du profil):
- Humérus longs → développé haltères UNIQUEMENT (angle naturel), dumbbell flyes préférés
- Humérus courts → barre acceptable au développé
- Fémurs longs → presse 45° PRIORITAIRE sur squat, bonne position squat goblet
- Fémurs courts → squat haute barre possible
- Cage thoracique plate → pull-over OBLIGATOIRE (1x/semaine)
- Antépulsion scapulaire → face pull à chaque séance (échauffement)
- Valgus genou → travail d'abducteurs, clamshells
- Hyperlordose → gainage antiextension prioritaire

RÈGLES PAR NIVEAU:
- Débutant: 3 séances corps entier, progressions linéaires simples, technique avant charge
- Intermédiaire: split adapté, progression ondulante, 1 technique d'intensification max/séance
- Avancé: spécialisation, périodisation par blocs, techniques avancées sur composés principaux

${pathoRules ? `═══ ADAPTATIONS PATHOLOGIES ═══\n${pathoRules}` : ""}

═══ FORMAT DE RÉPONSE ═══
Réponds UNIQUEMENT avec le JSON ci-dessous. Aucun texte avant ou après. Aucun markdown.
Chaque exercice doit avoir un "tips_coach" précis basé sur la morphologie ET une "justification" courte du choix.
Le champ "progression_semaine" explique comment progresser la SEMAINE SUIVANTE sur cet exercice.

{
  "analyse": {
    "bilan_profil": "3 phrases max: morphologie détectée + comment elle dicte les choix du programme",
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
        "jour": "Lundi",
        "focus": "Groupe(s) musculaire(s)",
        "duree": "60min",
        "intensite": "leger|modere|lourd|intense",
        "type_seance": "push|pull|legs|corps_entier|upper|lower",
        "note": "contexte de la séance, placement dans la semaine",
        "exercices": [
          {
            "nom": "Nom complet de l'exercice",
            "series": "4",
            "reps": "8-10",
            "rpe": "7-8",
            "rir": "2-3",
            "tempo": "3-1-2-0",
            "repos": "90s",
            "charge": "70-75% 1RM estimé",
            "methode": "classique|superset_avec_suivant|drop_set|rest_pause|pyramidal|cluster",
            "tips_coach": "Positionnement précis basé sur la morphologie de l'athlète",
            "justification": "Pourquoi cet exercice pour CE profil",
            "progression_semaine": "Comment progresser la semaine suivante sur cet exercice"
          }
        ]
      }
    ],
    "progression": {
      "semaines_1_2": "instruction",
      "semaines_3_4": "instruction",
      "semaine_5": "instruction",
      "semaine_deload": "instruction"
    }
  },
  "correction": {
    "groupes": ["muscle prioritaire"],
    "note": "fréquence et méthode de correction recommandée",
    "exercices_correctifs": ["exercice spécifique"]
  },
  "nutrition": {
    "cal": 2500,
    "p": 150,
    "g": 300,
    "l": 80,
    "conseil": "conseil nutrition personnalisé lié à l'objectif"
  },
  "morpho": {
    "resume": "synthèse morphologique complète pour l'utilisateur"
  }
}`;
}

// ─── PARSE RÉPONSE IA ────────────────────────────────────────────────────────
export function parseAIResponse(rawText) {
  if (!rawText) throw new Error("Réponse vide de l'API");
  let jsonStr = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const jStart = jsonStr.indexOf("{");
  const jEnd   = jsonStr.lastIndexOf("}");
  if (jStart === -1 || jEnd === -1 || jEnd <= jStart) throw new Error("Pas de JSON dans la réponse");
  jsonStr = jsonStr.substring(jStart, jEnd + 1);
  const openB  = (jsonStr.match(/\{/g) || []).length;
  const closeB = (jsonStr.match(/\}/g) || []).length;
  if (openB > closeB) jsonStr += "}".repeat(openB - closeB);
  const openBr  = (jsonStr.match(/\[/g) || []).length;
  const closeBr = (jsonStr.match(/\]/g) || []).length;
  if (openBr > closeBr) jsonStr += "]".repeat(openBr - closeBr) + "}";
  try { return JSON.parse(jsonStr); }
  catch (e) { throw new Error("JSON mal formé: " + e.message.substring(0, 50)); }
}

// ─── BUILD PROGRAMME DEPUIS RÉPONSE IA ───────────────────────────────────────
export function buildProgramFromAI(parsed, { form, cycles }) {
  if (!parsed.programme) throw new Error("Clé 'programme' absente");
  if (!Array.isArray(parsed.programme.seances) || parsed.programme.seances.length === 0)
    throw new Error("Aucune séance générée");

  const analyse    = parsed.analyse    || {};
  const correction = parsed.correction || {};
  const mesocycle  = parsed.mesocycle  || {};

  return {
    titre:   parsed.programme.titre   || "Mon programme",
    type:    "ia",
    methode: parsed.programme.methode || "Classique",
    split:   parsed.programme.split   || "",
    morpho:  parsed.morpho || {},

    // Analyse biomécanique complète
    analyse: {
      bilan_profil:                 analyse.bilan_profil || "",
      points_forts:                 analyse.points_forts || [],
      points_faibles:               analyse.points_faibles || [],
      posture:                      analyse.posture || "",
      morphotype:                   analyse.morphotype || "",
      humerus:                      analyse.humerus || "",
      femurs:                       analyse.femurs || "",
      cage_thoracique:              analyse.cage || analyse.cage_thoracique || "",
      recommandation_principale:    analyse.conseil || "",
    },

    // Mésocycle périodisé
    mesocycle: {
      duree_semaines: mesocycle.duree_semaines || 6,
      logique:        mesocycle.logique || "",
      phases:         mesocycle.phases  || [],
    },

    correction: {
      groupes_prioritaires:  correction.groupes || [],
      note:                  correction.note || "",
      exercices_correctifs:  correction.exercices_correctifs || [],
    },

    numero:          (cycles?.length || 0) + 1,
    objectif:        form.objectif,
    nutrition:       parsed.nutrition || {},
    dateDebut:       new Date().toLocaleDateString("fr-FR"),
    duree_semaines:  parsed.programme.duree_semaines || mesocycle.duree_semaines || 6,

    progression: typeof parsed.programme.progression === "string"
      ? { semaines_1_2: parsed.programme.progression }
      : (parsed.programme.progression || {}),

    // Séances avec tous les nouveaux champs (rpe, rir, tempo, tips_coach, etc.)
    jours: parsed.programme.seances.map((s, i) => ({
      id:           i + 1,
      nom:          s.jour || `Séance ${i + 1}`,
      focus:        s.focus || "",
      duree:        s.duree || "60 min",
      intensite:    s.intensite || "modere",
      type_seance:  s.type_seance || "corps_entier",
      note_seance:  s.note || s.note_seance || "",
      exercices: (s.exercices || []).map(ex => ({
        nom:                  ex.nom || "",
        series:               ex.series || "3",
        reps:                 ex.reps || "10",
        rpe:                  ex.rpe || "",
        rir:                  ex.rir || "",
        tempo:                ex.tempo || "2-0-2-0",
        repos:                ex.repos || "90s",
        charge:               ex.charge || "",
        methode:              ex.methode || "classique",
        tips_coach:           ex.tips_coach || ex.morpho_tip || "",
        justification:        ex.justification || ex.technique || "",
        progression_semaine:  ex.progression_semaine || "",
        historique:           [],
        note:                 "",
      })),
      complete: false,
      date:     null,
      note:     "",
    })),
  };
}

// ─── BUILD CALENDRIER ────────────────────────────────────────────────────────
export function buildCalendarFromProgram(prog, INT) {
  const today    = new Date();
  const joursMap = { lun: 1, mar: 2, mer: 3, jeu: 4, ven: 5, sam: 6, dim: 0 };
  const newSess  = {};
  prog.jours.forEach((jour) => {
    const match = Object.entries(joursMap).find(([k]) => jour.nom.toLowerCase().startsWith(k));
    if (!match) return;
    const dayNum = match[1];
    for (let w = 0; w < 8; w++) {
      const dateObj = new Date(today);
      dateObj.setDate(dateObj.getDate() + ((dayNum - dateObj.getDay() + 7) % 7 || 7) + w * 7);
      const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
      newSess[key] = {
        nom:      jour.focus || jour.nom,
        intensite: jour.intensite || "modere",
        color:    INT[jour.intensite || "modere"]?.c || "#4D8BFF",
      };
    }
  });
  return newSess;
}

// ─── RÉSUMÉ DES CHARGES ──────────────────────────────────────────────────────
export function summarizeProgramLoads(prog) {
  const chargesResume = [];
  prog.jours.forEach((j) =>
    j.exercices.forEach((ex) => {
      if (ex.historique?.length > 0) {
        const max = Math.max(...ex.historique.map((h) => parseFloat(h.poids) || 0));
        if (max > 0) chargesResume.push(`${ex.nom.split(" ")[0]}: ${max}kg`);
      }
    })
  );
  return chargesResume.slice(0, 5).join(", ");
}

// ─── CALL API ────────────────────────────────────────────────────────────────
export async function callGenerateAPI({ photos, promptText }) {
  const content = [];
  for (const src of (photos || [])) {
    if (!src) continue;
    const compressed = await compressImage(src, 800, 0.65);
    const b64 = compressed.split(",")[1];
    content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } });
  }
  content.push({ type: "text", text: promptText });

  const res = await fetch("/api/generate", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 6000,
      system:     "Tu es un Master Coach Sportif expert en biomécanique, hypertrophie, et périodisation. Tu génères UNIQUEMENT du JSON valide, sans aucun texte avant ou après, sans markdown.",
      messages:   [{ role: "user", content }],
    }),
  });

  if (!res.ok) {
    const errTxt = await res.text();
    throw new Error(`API ${res.status}: ${errTxt.substring(0, 100)}`);
  }
  const apiData = await res.json();
  if (apiData.error) throw new Error(apiData.error.message || "Erreur API");
  return apiData.content.map(i => i.text || "").join("").trim();
}

// ─── MESSAGES DE CHARGEMENT ──────────────────────────────────────────────────
export const LOAD_MESSAGES = [
  "📸 Analyse morphologique en cours…",
  "🦴 Détection des leviers osseux et proportions…",
  "💪 Identification des points forts et déséquilibres…",
  "🧬 Calcul du profil biomécanique complet…",
  "📐 Sélection des exercices selon ta morphologie…",
  "⚖️ Calibrage du volume MEV → MRV selon ton niveau…",
  "🎯 Adaptation aux pathologies déclarées…",
  "📈 Construction de la périodisation mésocycle…",
  "🔁 Intégration de la progression semaine par semaine…",
  "✨ Finalisation de ton programme sur-mesure…",
];
