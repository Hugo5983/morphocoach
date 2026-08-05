// ─── MÉSOCYCLE — COPIE CLIENT ───────────────────────────────────────────────
// Copie de api/_knowledge/noyau.js pour un usage hors ligne côté application.
// Régénérer : node scripts/gen-mesocycle.mjs
//
// Une seule source de vérité : la périodisation affichée à l'athlète doit être
// EXACTEMENT celle envoyée à l'IA.

// ─── KNOWLEDGE : NOYAU (C1) ─────────────────────────────────────────────────
// Volume MEV→MRV, périodisation mésocycle, plages de reps.
// Migré depuis le client (aiService) : cette connaissance vit désormais côté serveur.

export function getVolumeParams(niveau, objectif) {
  const base = {
    debutant:      { series_min: 3, series_max: 4, rpe_bas: 5, rpe_haut: 7, rir: "3-4", methodes: "classique uniquement, pas de techniques d'intensification", split: "corps entier 3x/sem ou push-pull-legs si 4j+" },
    intermediaire: { series_min: 4, series_max: 5, rpe_bas: 7, rpe_haut: 8, rir: "2-3", methodes: "pyramidal, supersets agonistes-antagonistes, rest-pause sur 1 exercice/séance", split: "push-pull-legs ou haut-bas selon jours" },
    avance:        { series_min: 5, series_max: 6, rpe_bas: 8, rpe_haut: 9, rir: "1-2", methodes: "drop sets, rest-pause, cluster sets, 5x5 sur composés, méthode bulgare si force", split: "split 4-6 jours, spécialisation par groupe" },
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

export function getMesocycleLogic(niveau, objectif, cycleNum) {
  const duree = niveau === "debutant" ? 4 : 6;
  const phases = {
    hypertrophie: [
      { sem: "1-2", phase: "Accumulation",    rpe: "6-7", consigne: "Apprentissage des mouvements, volume modéré, maîtrise technique" },
      { sem: "3-4", phase: "Intensification", rpe: "7-8", consigne: `Augmenter la charge de 5% ou +1 rep sur chaque exercice vs S${cycleNum > 1 ? cycleNum - 1 : 1}` },
      { sem: "5",   phase: "Surcharge",       rpe: "8-9", consigne: "Volume max du cycle, chercher l'échec technique sur le dernier set" },
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

export const REGLES_NIVEAU = `
- Débutant : 3 séances corps entier, progressions linéaires simples, technique avant charge.
- Intermédiaire : split adapté, progression ondulante, 1 technique d'intensification max/séance.
- Avancé : spécialisation, périodisation par blocs, techniques avancées sur composés principaux.`;
