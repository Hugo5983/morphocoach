// @ts-check
// ─── AI SERVICE ─────────────────────────────────────────────────────────────
// Côté client : préparation des données, appel de l'endpoint serveur, et
// construction du Programme depuis la réponse.
// IMPORTANT : toute la connaissance MorphoCoach (règles biomécaniques, volume,
// périodisation, pathologies, prompt) vit désormais CÔTÉ SERVEUR
// (/api/generate-program + /api/_knowledge). Rien de propriétaire ici.

import { authHeaders } from "./morphoService.js";

export function compressImage(dataUrl, maxW = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = Math.min(maxW / img.width, maxW / img.height, 1);
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// ─── APPEL API : GÉNÉRATION DE PROGRAMME (serveur) ──────────────────────────
/**
 * Demande la génération au serveur. AUCUNE photo n'est envoyée ici :
 * la morphologie voyage via la fiche (voir morphoService.analyserMorpho).
 * @param {{ form: object, dossier: object, ficheMorpho: object|null }} payload
 * @returns {Promise<{parsed: import('../types').AIRawResponse, warnings: string[], meta: object}>}
 */
export async function callGenerateProgramAPI({ form, dossier, ficheMorpho }) {
  const res = await fetch("/api/generate-program", {
    method:  "POST",
    headers: await authHeaders(),
    body:    JSON.stringify({ form, dossier, ficheMorpho }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `API ${res.status}`);
  if (!data.parsed?.programme) throw new Error("Réponse serveur invalide (programme absent)");
  return data;
}

// ─── PARSE RÉPONSE IA (conservé pour compatibilité/outils) ──────────────────
/**
 * @param {string} rawText
 * @returns {import('../types').AIRawResponse}
 */
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
/**
 * Construit un Programme complet depuis la réponse parsée de l'IA.
 * @param {import('../types').AIRawResponse} parsed
 * @param {{ form: import('../types').Profil, cycles: import('../types').CycleHistorique[] }} ctx
 * @returns {import('../types').Programme}
 */
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

    // Couche 0 — la pensée du coach qui a produit ce programme
    reflexion: parsed.reflexion || null,

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
    objectif:        /** @type {import('../types').ObjectifKey} */ (form.objectif || "sante"),
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
      /** @type {import('../types').IntensiteKey} */
      intensite:    /** @type {any} */ (s.intensite) || "modere",
      type_seance:  s.type_seance || "corps_entier",
      note_seance:  s.note || s.note_seance || "",
      exercices: (s.exercices || []).map(ex => ({
        nom:                  ex.nom || "",
        series:               String(ex.series || "3"),
        reps:                 String(ex.reps || "10"),
        rpe:                  ex.rpe || "",
        rir:                  ex.rir || "",
        tempo:                ex.tempo || "2-0-2-0",
        repos:                ex.repos || "90s",
        charge:               ex.charge || "",
        methode:              ex.methode || "classique",
        tips_coach:           ex.tips_coach || ex.morpho_tip || "",
        justification:        ex.justification || ex.technique || "",
        progression_semaine:  ex.progression_semaine || "",
        historique:           /** @type {import('../types').EntreeHistorique[]} */ ([]),
        note:                 "",
      })),
      complete: false,
      date:     null,
      note:     "",
    })),
  };
}

// ─── BUILD CALENDRIER ────────────────────────────────────────────────────────
/**
 * Génère un calendrier de séances depuis un programme.
 * @param {import('../types').Programme} prog
 * @param {Record<string, {l:string, c:string}>} INT
 * @returns {import('../types').CalSess}
 */
export function buildCalendarFromProgram(prog, INT) {
  const today    = new Date();
  const joursMap = { lun: 1, mar: 2, mer: 3, jeu: 4, ven: 5, sam: 6, dim: 0 };
  /** @type {import('../types').CalSess} */
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
/**
 * Résume les charges max loggées sur un programme.
 * @param {import('../types').Programme} prog
 * @returns {string}
 */
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

// ─── MESSAGES DE CHARGEMENT ──────────────────────────────────────────────────
export const LOAD_MESSAGES = [
  "🧠 Lecture de ton historique d'entraînement réel…",
  "📊 Détection des progressions et stagnations, exercice par exercice…",
  "📸 Lecture de ta fiche morphologique…",
  "🔁 Rotation des exercices vs ton cycle précédent…",
  "🦴 Croisement leviers osseux × historique de charges…",
  "💪 Identification des points forts et déséquilibres…",
  "📐 Sélection des exercices selon ta morphologie…",
  "⚖️ Calibrage du volume MEV → MRV selon ton niveau…",
  "🎯 Adaptation aux pathologies déclarées…",
  "📈 Construction de la périodisation mésocycle…",
  "✨ Finalisation de ton programme sur-mesure…",
];
