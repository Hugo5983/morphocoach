// @ts-check
// ─── MorphoCoach · Référentiel des badges ────────────────────────────────────
// Chaque badge : id, nom, description, image (fichier statique /badges/),
// catégorie d'affichage, statistique suivie (clé du store de stats) et cible.
// Le calcul des stats est dans services/badgeService.js.

export const BADGE_CATEGORIES = [
  { id:"seances",     label:"Séances" },
  { id:"regularite",  label:"Régularité & Séries" },
  { id:"performance", label:"Performance" },
  { id:"nutrition",   label:"Nutrition & Récup" },
  { id:"prestige",    label:"Prestige" },
];

export const ACHIEVEMENTS = [
  // ── Séances ────────────────────────────────────────────────────────────────
  { id:"premiere_seance", nom:"Première Séance",  desc:"Valider ta toute première séance",            img:"/badges/premiere_seance.png", cat:"seances",     stat:"totalSeances",    target:1 },
  { id:"seances_50",      nom:"50 Séances",       desc:"Valider 50 séances au total",                 img:"/badges/seances_50.png",      cat:"seances",     stat:"totalSeances",    target:50 },
  { id:"seances_100",     nom:"100 Séances",      desc:"Valider 100 séances au total",                img:"/badges/seances_100.png",     cat:"seances",     stat:"totalSeances",    target:100 },
  { id:"seances_250",     nom:"250 Séances",      desc:"Valider 250 séances au total",                img:"/badges/seances_250.png",     cat:"seances",     stat:"totalSeances",    target:250 },
  { id:"focus_max",       nom:"Focus Max",        desc:"Terminer 10 séances en mode Focus",           img:"/badges/focus_max.png",       cat:"seances",     stat:"focusSessions",   target:10 },
  { id:"cardio_master",   nom:"Cardio Master",    desc:"Valider 20 séances légères ou mobilité",      img:"/badges/cardio_master.png",   cat:"seances",     stat:"cardioSeances",   target:20 },

  // ── Régularité & Séries ────────────────────────────────────────────────────
  { id:"serie_7_jours",    nom:"Série 7 Jours",           desc:"7 jours d'entraînement d'affilée",            img:"/badges/serie_7_jours.png",          cat:"regularite", stat:"bestStreak",       target:7 },
  { id:"serie_30_jours",   nom:"Série 30 Jours",          desc:"30 jours d'entraînement d'affilée",           img:"/badges/serie_30_jours.png",         cat:"regularite", stat:"bestStreak",       target:30 },
  { id:"discipline_acier", nom:"Discipline Acier",        desc:"14 jours d'entraînement d'affilée",           img:"/badges/discipline_acier.png",       cat:"regularite", stat:"bestStreak",       target:14 },
  { id:"regularite_impecable", nom:"Régularité Impecable", desc:"4 semaines de suite avec 3+ séances",        img:"/badges/regularite_impecable.png",   cat:"regularite", stat:"semainesRegulieres", target:4 },
  { id:"ponctualite_parfaite", nom:"Ponctualité Parfaite", desc:"Valider 10 séances le jour planifié",        img:"/badges/ponctualite_parfaite.png",   cat:"regularite", stat:"seancesPonctuelles", target:10 },
  { id:"perseverance_legendaire", nom:"Persévérance Légendaire", desc:"S'entraîner sur 6 mois différents",    img:"/badges/perseverance_legendaire.png", cat:"regularite", stat:"moisActifs",      target:6 },

  // ── Performance ────────────────────────────────────────────────────────────
  { id:"force_confirmee",  nom:"Force Confirmée",   desc:"Enregistrer des records sur 5 exercices",      img:"/badges/force_confirmee.png",  cat:"performance", stat:"exosAvecRecord",  target:5 },
  { id:"depassement_de_soi", nom:"Dépassement de Soi", desc:"Battre 5 fois un record personnel",          img:"/badges/depassement_de_soi.png", cat:"performance", stat:"recordsBattus",  target:5 },
  { id:"roi_progression",  nom:"Roi de la Progression", desc:"Battre 10 fois un record personnel",        img:"/badges/roi_progression.png",  cat:"performance", stat:"recordsBattus",   target:10 },
  { id:"progression_5kg",  nom:"Progression 5KG",   desc:"Gagner 5 kg sur un 1RM estimé",                img:"/badges/progression_5kg.png",  cat:"performance", stat:"progressionMaxKg", target:5 },
  { id:"challenge_complete", nom:"Challenge Complété", desc:"Terminer un mésocycle complet",              img:"/badges/challenge_complete.png", cat:"performance", stat:"mesocyclesTermines", target:1 },
  { id:"objectif_atteint", nom:"Objectif Atteint",  desc:"Un mois avec 12 séances validées",             img:"/badges/objectif_atteint.png", cat:"performance", stat:"meilleurMoisSeances", target:12 },

  // ── Nutrition & Récup ──────────────────────────────────────────────────────
  { id:"plan_nutrition_suivi", nom:"Plan Nutrition Suivi", desc:"Logger tes repas pendant 30 jours",      img:"/badges/plan_nutrition_suivi.png", cat:"nutrition", stat:"joursNutrition",  target:30 },
  { id:"nutrition_parfaite", nom:"Nutrition Parfaite", desc:"14 jours calories + protéines dans la cible", img:"/badges/nutrition_parfaite.png", cat:"nutrition", stat:"joursNutritionParfaite", target:14 },
  { id:"proteines_30",     nom:"30 Jours Protéines", desc:"Atteindre ta cible protéines 30 jours",        img:"/badges/proteines_30.png",     cat:"nutrition", stat:"joursProteines",  target:30 },
  { id:"hydratation_30",   nom:"30 Jours Hydratation", desc:"Boire 2 L d'eau pendant 30 jours",           img:"/badges/hydratation_30.png",   cat:"nutrition", stat:"joursHydratation", target:30 },
  { id:"deficit_maitrise", nom:"Déficit Maîtrisé",  desc:"14 jours sous ta cible calorique",             img:"/badges/deficit_maitrise.png", cat:"nutrition", stat:"joursDeficit",    target:14 },
  { id:"sommeil_optimal",  nom:"Sommeil Optimal",   desc:"7 nuits à ta cible de sommeil",                img:"/badges/sommeil_optimal.png",  cat:"nutrition", stat:"nuitsOptimales",  target:7 },
  { id:"poids_maitrise",   nom:"Poids Maîtrisé",    desc:"Enregistrer 10 pesées",                        img:"/badges/poids_maitrise.png",   cat:"nutrition", stat:"pesees",          target:10 },

  // ── Prestige ───────────────────────────────────────────────────────────────
  { id:"niveau_10",     nom:"Niveau 10",     desc:"Atteindre le niveau 10",                 img:"/badges/niveau_10.png",     cat:"prestige", stat:"niveau",          target:10 },
  { id:"niveau_25",     nom:"Niveau 25",     desc:"Atteindre le niveau 25",                 img:"/badges/niveau_25.png",     cat:"prestige", stat:"niveau",          target:25 },
  { id:"niveau_50",     nom:"Niveau 50",     desc:"Atteindre le niveau 50",                 img:"/badges/niveau_50.png",     cat:"prestige", stat:"niveau",          target:50 },
  { id:"athlete_elite", nom:"Athlète Élite", desc:"Atteindre le niveau 35",                 img:"/badges/athlete_elite.png", cat:"prestige", stat:"niveau",          target:35 },
  { id:"mode_legende",  nom:"Mode Légende",  desc:"Débloquer tous les autres badges",       img:"/badges/mode_legende.png",  cat:"prestige", stat:"autresBadges",    target:29 },
];
