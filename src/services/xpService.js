// ─── MorphoCoach · XP Service ────────────────────────────────────────────────
// Source unique de vérité pour le système de progression Momentum XP.
// Stockage : localStorage'morpho_xp'
// Communication : CustomEvent'morpho_xp_update'

const KEY ='morpho_xp';

export const LEVELS = [
  { level:1,  xp:0,     name:"Débutant"  },
  { level:2,  xp:300,   name:"Régulier"  },
  { level:3,  xp:700,   name:"Engagé"    },
  { level:4,  xp:1400,  name:"Sérieux"   },
  { level:5,  xp:2300,  name:"Athlète"   },
  { level:6,  xp:3500,  name:"Confirmé"  },
  { level:7,  xp:5000,  name:"Avancé"    },
  { level:8,  xp:7000,  name:"Expert"    },
  { level:9,  xp:9500,  name:"Élite"     },
  { level:10, xp:12500, name:"Champion"  },
  { level:11, xp:16000, name:"Légende"},
];

// XP par action
export const XP = {
  SESSION_COMPLETE : 250,  // séance terminée
  SESSION_BONUS_PR : 50,   // nouveau record perso
  NUTRITION_MEAL   : 30,   // premier aliment d'un repas loggé
  STREAK_WEEK      : 75,   // streak hebdo maintenu
};

// ─── Lecture / écriture ───────────────────────────────────────────────────────
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { xp:0, level:1, lastNutriDate:{} };
  } catch { return { xp:0, level:1, lastNutriDate:{} }; }
}
function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

// ─── Calcul du niveau depuis un total XP ─────────────────────────────────────
export function getLevelInfo(totalXP) {
  let cur = LEVELS[0], next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xp) {
      cur  = LEVELS[i];
      next = LEVELS[i + 1] ?? null;
      break;
    }
  }
  const curXP    = totalXP - cur.xp;
  const needed   = next ? next.xp - cur.xp : 1;
  const pct      = next ? Math.min(100, Math.round((curXP / needed) * 100)) : 100;
  const toNext   = next ? needed - curXP : 0;
  return { cur, next, curXP, needed, pct, toNext, totalXP };
}

// ─── Lire l'état courant ──────────────────────────────────────────────────────
export function getXPState() {
  return load();
}

// ─── Ajouter des XP ──────────────────────────────────────────────────────────
// Retourne { xp, leveledUp, newLevel }
// Émet l'event'morpho_xp_update' pour que XPBar et LevelUpModal réagissent
export function addXP(amount, reason ='') {
  const state  = load();
  const oldXP  = state.xp || 0;
  const newXP  = oldXP + amount;
  const before = getLevelInfo(oldXP);
  const after  = getLevelInfo(newXP);
  const leveledUp = after.cur.level > before.cur.level;

  save({ ...state, xp: newXP, level: after.cur.level });

  window.dispatchEvent(new CustomEvent('morpho_xp_update', {
    detail: { xp: newXP, amount, reason, leveledUp, levelInfo: after }
  }));

  return { xp: newXP, leveledUp, levelInfo: after };
}

// ─── XP nutrition — évite les doublons par repas/jour ────────────────────────
// Retourne true si XP accordé, false si déjà accordé aujourd'hui pour ce repas
export function addXPNutrition(repasId) {
  const state   = load();
  const today   = new Date().toISOString().split('T')[0];
  const logged  = state.lastNutriDate || {};
  const key     =`${today}_${repasId}`;
  if (logged[key]) return false;           // déjà accordé

  // Nettoie les anciens logs (> 3 jours) pour ne pas grossir le localStorage
  const cutoff = Date.now() - 3 * 86400000;
  const clean  = Object.fromEntries(
    Object.entries(logged).filter(([k]) => {
      const d = new Date(k.split('_')[0]).getTime();
      return d > cutoff;
    })
);
  clean[key] = true;
  save({ ...state, lastNutriDate: clean });

  addXP(XP.NUTRITION_MEAL,`repas_${repasId}`);
  return true;
}
