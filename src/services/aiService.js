// @ts-check
// ─── AI SERVICE ─────────────────────────────────────────────────────────────
// Côté client : préparation des données, appel de l'endpoint serveur, et
// construction du Programme depuis la réponse.
// IMPORTANT : toute la connaissance MorphoCoach (règles biomécaniques, volume,
// périodisation, pathologies, prompt) vit désormais CÔTÉ SERVEUR
// (/api/generate-program + /api/_knowledge). Rien de propriétaire ici.

import { authHeaders } from"./morphoService.js";

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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Demande la génération au serveur. AUCUNE photo n'est envoyée ici :
 * la morphologie voyage via la fiche (voir morphoService.analyserMorpho).
 *
 * Mode ASYNCHRONE d'abord (job + polling) : chaque requête HTTP dure < 1 s,
 * ce qui neutralise la coupure Safari/WebKit à ~60 s pendant que le serveur
 * génère tranquillement (jusqu'à ~280 s). Si les routes asynchrones ne sont
 * pas disponibles (404/501), repli automatique sur la route synchrone
 * historique — comportement strictement identique à avant.
 * @param {{ form: object, dossier: object, ficheMorpho: object|null, fichePrecedente?: object|null }} payload
 * @returns {Promise<{parsed: import('../types').AIRawResponse, warnings: string[], meta: object}>}
 */
export async function callGenerateProgramAPI({ form, dossier, ficheMorpho, fichePrecedente = null }) {
  const body = JSON.stringify({ form, dossier, ficheMorpho, fichePrecedente });

  // ── 1) Tentative asynchrone : /start puis polling /status ────────────────
  try {
    const start = await fetch("/api/generate-program-start", {
      method: "POST",
      headers: await authHeaders(),
      body,
    });

    if (start.status === 404 || start.status === 501) {
      throw Object.assign(new Error("async_unavailable"), { fallback: true });
    }
    const sd = await start.json().catch(() => ({}));
    if (!start.ok) throw new Error(sd.error || `API ${start.status}`);
    if (!sd.jobId || !sd.token) {
      throw Object.assign(new Error("async_unavailable"), { fallback: true });
    }

    const POLL_MS = 3_000;
    const MAX_MS = 14 * 60_000;      // plafond global : couvre budget serveur + reprise
    const t0 = Date.now();
    let netFails = 0;

    while (Date.now() - t0 < MAX_MS) {
      await sleep(POLL_MS);
      let r, d;
      try {
        r = await fetch("/api/generate-program-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: sd.jobId, token: sd.token }),
        });
        d = await r.json().catch(() => ({}));
        netFails = 0;
      } catch {
        // Coupure réseau passagère (changement d'antenne, mise en veille…) :
        // on tolère quelques échecs consécutifs avant d'abandonner.
        if (++netFails >= 5) throw new Error("Connexion perdue pendant la génération");
        continue;
      }

      if (r.status === 202) continue;                        // toujours en cours
      if (!r.ok) throw new Error(d.error || `API ${r.status}`);
      if (!d.parsed?.programme) throw new Error("Réponse serveur invalide (programme absent)");
      return d;                                              // même forme qu'avant
    }
    throw new Error("La génération a pris trop de temps. Réessaie.");
  } catch (e) {
    if (!e.fallback) throw e;
    // sinon : routes asynchrones absentes → repli synchrone ci-dessous
  }

  // ── 2) Repli : route synchrone historique (inchangée) ────────────────────
  const res = await fetch("/api/generate-program", {
    method:"POST",
    headers: await authHeaders(),
    body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ||`API ${res.status}`);
  if (!data.parsed?.programme) throw new Error("Réponse serveur invalide (programme absent)");
  return data;
}

// ─── BUILD PROGRAMME DEPUIS RÉPONSE IA ───────────────────────────────────────
/**
 * Construit un Programme complet depuis la réponse parsée de l'IA.
 * @param {import('../types').AIRawResponse} parsed
 * @param {{ form: import('../types').Profil, cycles: import('../types').CycleHistorique[] }} ctx
 * @returns {import('../types').Programme}
 */
export function buildProgramFromAI(parsed, { form, cycles, ficheMorpho = null }) {
  if (!parsed.programme) throw new Error("Clé'programme' absente");
  if (!Array.isArray(parsed.programme.seances) || parsed.programme.seances.length === 0)
    throw new Error("Aucune séance générée");

  const analyse    = parsed.analyse    || {};
  const correction = parsed.correction || {};
  const mesocycle  = parsed.mesocycle  || {};

  return {
    titre:   parsed.programme.titre   ||"Mon programme",
    type:"ia",
    methode: parsed.programme.methode ||"Classique",
    split:   parsed.programme.split   ||"",
    morpho:  parsed.morpho || {},

    // Couche 0 — la pensée du coach qui a produit ce programme
    reflexion: parsed.reflexion || null,

    // Qualité de la lecture morphologique : permet d'afficher honnêtement
    // sur quoi le programme s'appuie réellement.
    ficheExploitabilite: typeof ficheMorpho?.exploitabilite === "number"
      ? ficheMorpho.exploitabilite : null,

    // Analyse biomécanique complète
    analyse: {
      bilan_profil:                 analyse.bilan_profil ||"",
      points_forts:                 analyse.points_forts || [],
      points_faibles:               analyse.points_faibles || [],
      posture:                      analyse.posture ||"",
      morphotype:                   analyse.morphotype ||"",
      humerus:                      analyse.humerus ||"",
      femurs:                       analyse.femurs ||"",
      cage_thoracique:              analyse.cage || analyse.cage_thoracique ||"",
      recommandation_principale:    analyse.conseil ||"",
    },

    // Mésocycle périodisé
    mesocycle: {
      duree_semaines: mesocycle.duree_semaines || 6,
      logique:        mesocycle.logique ||"",
      phases:         mesocycle.phases  || [],
    },

    correction: {
      groupes_prioritaires:  correction.groupes || [],
      note:                  correction.note ||"",
      exercices_correctifs:  correction.exercices_correctifs || [],
    },

    numero:          (cycles?.length || 0) + 1,
    objectif:        /** @type {import('../types').ObjectifKey} */ (form.objectif ||"sante"),
    // Nécessaires à la substitution en séance : sans eux, les variantes
    // proposées ignoreraient le matériel réel et le niveau de l'athlète.
    materiel:        form.materiel || [],
    niveau:          form.niveau ||"intermediaire",
    nutrition:       parsed.nutrition || {},
    dateDebut:       new Date().toLocaleDateString("fr-FR"),
    duree_semaines:  parsed.programme.duree_semaines || mesocycle.duree_semaines || 6,

    progression: typeof parsed.programme.progression ==="string"
      ? { semaines_1_2: parsed.programme.progression }
      : (parsed.programme.progression || {}),

    // Séances avec tous les nouveaux champs (rpe, rir, tempo, tips_coach, etc.)
    jours: parsed.programme.seances.map((s, i) => ({
      id:           i + 1,
      nom:          s.jour ||`Séance ${i + 1}`,
      focus:        s.focus ||"",
      duree:        s.duree ||"60 min",
      /** @type {import('../types').IntensiteKey} */
      intensite:    /** @type {any} */ (s.intensite) ||"modere",
      type_seance:  s.type_seance ||"corps_entier",
      note_seance:  s.note || s.note_seance ||"",
      // Échauffement spécifique à la séance : sans ce report, le champ produit
      // par l'IA était perdu à la construction et n'atteignait jamais l'écran.
      echauffement: s.echauffement ||"",
      exercices: (s.exercices || []).map(ex => ({
        nom:                  ex.nom ||"",
        series:               String(ex.series ||"3"),
        reps:                 String(ex.reps ||"10"),
        rpe:                  ex.rpe ||"",
        rir:                  ex.rir ||"",
        tempo:                ex.tempo ||"2-0-2-0",
        repos:                ex.repos ||"90s",
        charge:               ex.charge ||"",
        methode:              ex.methode ||"classique",
        tips_coach:           ex.tips_coach || ex.morpho_tip ||"",
        // Conservés pour les programmes générés AVANT leur retrait du schéma.
        // La justification vit désormais dans reflexion, et la progression de
        // charge est calculée par progressionService sur les séries validées.
        justification:        ex.justification || ex.technique ||"",
        historique:           /** @type {import('../types').EntreeHistorique[]} */ ([]),
        note:"",
      })),
      complete: false,
      date:     null,
      note:"",
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
      const key =`${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2,"0")}-${String(dateObj.getDate()).padStart(2,"0")}`;
      newSess[key] = {
        nom:      jour.focus || jour.nom,
        intensite: jour.intensite ||"modere",
        color:    INT[jour.intensite ||"modere"]?.c ||"#3C5BFF",
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
  return chargesResume.slice(0, 5).join(",");
}

// ─── MESSAGES DE CHARGEMENT ──────────────────────────────────────────────────
export const LOAD_MESSAGES = [
" Lecture de ton historique d'entraînement réel…",
" Détection des progressions et stagnations, exercice par exercice…",
" Lecture de ta fiche morphologique…",
" Rotation des exercices vs ton cycle précédent…",
" Croisement leviers osseux × historique de charges…",
" Identification des points forts et déséquilibres…",
" Sélection des exercices selon ta morphologie…",
" Calibrage du volume MEV → MRV selon ton niveau…",
" Adaptation aux pathologies déclarées…",
" Construction de la périodisation mésocycle…",
" Finalisation de ton programme sur-mesure…",
];
