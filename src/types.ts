// ═══════════════════════════════════════════════════════════════════════════════
// MORPHOCOACH — TYPES CENTRAUX
// ─────────────────────────────────────────────────────────────────────────────
// Source unique de vérité pour toutes les structures de données de l'app.
// Ces types documentent les objets produits par l'IA, le storage, et les hooks.
//
// UTILISATION dans les fichiers .jsx :
//   /** @type {import('../types').Profil} */
//   const profil = ...
//
// ═══════════════════════════════════════════════════════════════════════════════

// ─── PROFIL UTILISATEUR ───────────────────────────────────────────────────────

export interface Profil {
  prenom:      string;
  sexe:        "homme" | "femme" | "";
  age:         string;           // stocké en string (input libre)
  poids:       string;           // kg
  taille:      string;           // cm
  objectif:    ObjectifKey | "";
  activite:    ActiviteKey | "";
  sport:       string;

  // Composition corporelle (optionnel)
  bodyfat?:    string;           // %
  muscleMass?: string;           // kg
  boneMass?:   string;           // kg
  waterPct?:   string;           // %
  visceralFat?: string;          // /20

  // Mensurations (optionnel)
  mChest?:       string;
  mWaist?:       string;
  mHips?:        string;
  mLeftArm?:     string;
  mRightArm?:    string;
  mLeftThigh?:   string;
  mRightThigh?:  string;
  mLeftCalf?:    string;
  mRightCalf?:   string;
}

export type ObjectifKey = "hypertrophie" | "force" | "poids" | "sante" | "prep_physique";
export type ActiviteKey = "sedentaire" | "leger" | "modere" | "actif" | "tres_actif";

// ─── ALIMENT ─────────────────────────────────────────────────────────────────

export interface Aliment {
  id?:  number;
  n:    string;    // nom
  c:    number;    // calories
  p:    number;    // protéines (g)
  g:    number;    // glucides (g)
  l:    number;    // lipides (g)
  cat?: string;    // catégorie
}

// ─── REPAS JOURNALIER ────────────────────────────────────────────────────────

export interface Repas {
  matin: Aliment[];
  midi:  Aliment[];
  soir:  Aliment[];
  snack: Aliment[];
}

export type RepasKey = keyof Repas;

// ─── TOTAUX NUTRITIONNELS ────────────────────────────────────────────────────

export interface TotauxNutri {
  cal: number;
  p:   number;
  g:   number;
  l:   number;
}

// ─── ENTRAÎNEMENT — EXERCICE ─────────────────────────────────────────────────

export interface EntreeHistorique {
  date:   string;
  poids:  string;
  reps:   string;
  note?:  string;
}

export interface Exercice {
  nom:                 string;
  series:              string;
  reps:                string;
  rpe?:                string;   // Rating of Perceived Exertion (1-10)
  rir?:                string;   // Reps in Reserve
  tempo?:              string;   // ex: "2-0-2-0"
  repos:               string;   // ex: "90s"
  charge?:             string;
  methode?:            string;   // "classique" | "drop_set" | "superset" | ...
  tips_coach?:         string;
  justification?:      string;
  progression_semaine?: string;
  historique:          EntreeHistorique[];
  note?:               string;
}

// ─── ENTRAÎNEMENT — SÉANCE ───────────────────────────────────────────────────

export type IntensiteKey = "leger" | "modere" | "intense" | "maximal";

export interface Seance {
  id:           number;
  nom:          string;
  focus?:       string;
  duree?:       string;          // ex: "60 min"
  intensite:    IntensiteKey;
  type_seance?: string;          // "corps_entier" | "haut" | "bas" | "push" | "pull" | ...
  note_seance?: string;
  exercices:    Exercice[];
  complete:     boolean;
  date:         string | null;
  note?:        string;
}

// ─── ENTRAÎNEMENT — ANALYSE MORPHOLOGIQUE (produit par l'IA) ─────────────────

export interface AnalyseMorpho {
  bilan_profil:              string;
  points_forts:              string[];
  points_faibles:            string[];
  posture:                   string;
  morphotype:                string;
  humerus?:                  string;
  femurs?:                   string;
  cage_thoracique?:          string;
  recommandation_principale: string;
}

// ─── ENTRAÎNEMENT — MÉSOCYCLE ────────────────────────────────────────────────

export interface PhaseMeso {
  sem:      string;
  phase:    string;
  rpe:      string;
  consigne: string;
}

export interface Mesocycle {
  duree_semaines: number;
  logique:        string;
  phases:         PhaseMeso[];
}

// ─── ENTRAÎNEMENT — CORRECTION ───────────────────────────────────────────────

export interface Correction {
  groupes_prioritaires:  string[];
  note:                  string;
  exercices_correctifs:  string[];
}

// ─── ENTRAÎNEMENT — PROGRAMME COMPLET ────────────────────────────────────────
// Produit par buildProgramFromAI() — structure critique

export interface Programme {
  titre:            string;
  type:             "ia" | "manuel";
  methode?:         string;
  split?:           string;
  morpho?:          Record<string, unknown>;

  analyse:          AnalyseMorpho;
  mesocycle:        Mesocycle;
  correction:       Correction;

  numero:           number;
  objectif:         ObjectifKey;
  nutrition?:       Record<string, unknown>;
  dateDebut:        string;
  duree_semaines:   number;
  progression?:     Record<string, string>;

  jours:            Seance[];

  // Champs calculés après usage
  chargesResume?:   string;
}

// ─── CALENDRIER ──────────────────────────────────────────────────────────────

export interface SessionCal {
  nom:       string;
  intensite: IntensiteKey;
  color?:    string;
}

export type CalSess = Record<string, SessionCal>;  // clé = "YYYY-MM-DD"

// ─── WEIGHT LOG ──────────────────────────────────────────────────────────────

export interface WeightEntry {
  date:  string;   // "YYYY-MM-DD"
  poids: string;   // kg (string pour cohérence avec les inputs)
}

// ─── PHOTOS MORPHO ───────────────────────────────────────────────────────────

export interface Photos {
  face?:   string;   // base64 ou URL
  dos?:    string;
  profil?: string;
}

// ─── RÉSULTATS HOOKS ─────────────────────────────────────────────────────────

export interface MacrosResult {
  imc:    number | null;
  obj:    { l: string; icon: string } | null;
  calObj: number;
  pObj:   number;
  lObj:   number;
  gObj:   number;
}

export interface CycleProgressResult {
  jR:   number | null;   // jour dans le cycle
  cPct: number;          // % de progression
  semC: number;          // semaine courante
}

// ─── NOTIFICATION ────────────────────────────────────────────────────────────

export interface Notif {
  id:      number;
  icon:    string;
  titre:   string;
  message: string;
}

// ─── SCAN PRODUIT ────────────────────────────────────────────────────────────

export interface ScanResult extends Aliment {
  error?: boolean;
}

// ─── CYCLE HISTORIQUE ────────────────────────────────────────────────────────
// Un cycle = un programme terminé avec son contexte

export interface CycleHistorique {
  titre:         string;
  dateDebut:     string;
  dateFin?:      string;
  objectif:      ObjectifKey;
  chargesResume: string;
  programme:     Programme;
}

// ─── PROPS APP GLOBALES ──────────────────────────────────────────────────────
// Les props communes passées à chaque feature depuis App.jsx

export interface CommonProps {
  push:  (icon: string, titre: string, message: string) => void;
  INT:   Record<IntensiteKey, { l: string; c: string }>;
}

export interface HomeProps extends CommonProps {
  profil:             Profil;
  prog:               Programme | null;
  cycleStart:         string | null;
  setTab:             (tab: string) => void;
  premium:            boolean;
  setPaywall:         (v: boolean) => void;
  setPaywallNutrition:(v: boolean) => void;
  eau:                number;
  setEau:             React.Dispatch<React.SetStateAction<number>>;
  weightLog:          WeightEntry[];
  calSess:            CalSess;
  obj:                MacrosResult["obj"];
  calObj:             number;
  pObj:               number;
  lObj:               number;
  gObj:               number;
  totR:               TotauxNutri;
  jR:                 number | null;
  cPct:               number;
  semC:               number;
  getStreak:          number;
  MOTIVATIONS:        string[];
}

// ─── RÉPONSE BRUTE IA ────────────────────────────────────────────────────────
// Ce que parseAIResponse() retourne avant buildProgramFromAI()

export interface AIRawResponse {
  programme: {
    titre?:           string;
    methode?:         string;
    split?:           string;
    duree_semaines?:  number;
    progression?:     string | Record<string, string>;
    seances:          Array<{
      jour?:       string;
      focus?:      string;
      duree?:      string;
      intensite?:  string;
      type_seance?: string;
      note?:       string;
      note_seance?: string;
      exercices:   Array<{
        nom?:                  string;
        series?:               string | number;
        reps?:                 string | number;
        rpe?:                  string;
        rir?:                  string;
        tempo?:                string;
        repos?:                string;
        charge?:               string;
        methode?:              string;
        tips_coach?:           string;
        morpho_tip?:           string;
        justification?:        string;
        technique?:            string;
        progression_semaine?:  string;
      }>;
    }>;
  };
  analyse?:    Partial<AnalyseMorpho> & { conseil?: string; cage?: string };
  mesocycle?:  Partial<Mesocycle>;
  correction?: {
    groupes?:              string[];
    note?:                 string;
    exercices_correctifs?: string[];
  };
  morpho?:     Record<string, unknown>;
  nutrition?:  Record<string, unknown>;
}
