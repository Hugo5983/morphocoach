// ─── CoachFAB.jsx ─────────────────────────────────────────────────────────────
// Bouton flottant Coach — visible sur toutes les pages, tap → page Coach.
// S'auto-cache sur la page Coach elle-même.

import { C } from"../../data/constants.js";

const VIO  ="#3C5BFF";
const VIOD ="#2E48D9";

function SparkIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" stroke="none">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>
    </svg>
);
}

export function CoachFAB({ tab, setTab, premium }) {
  // Caché sur la page Coach (inutile) et pendant l'onboarding
  if (tab ==="coach" || tab ==="onboarding") return null;

  return (
    <button
      onClick={() => setTab("coach")}
      aria-label="Ouvrir le Coach Nutrition"
      style={{
        position:"fixed",
        bottom:"calc(72px + env(safe-area-inset-bottom, 0px))",
        right:        16,
        zIndex:       150,
        width:        48,
        height:       48,
        borderRadius:"50%",
        background:`linear-gradient(135deg, ${VIO}, ${VIOD})`,
        border:"none",
        display:"grid",
        placeItems:"center",
        cursor:"pointer",
        boxShadow:`0 4px 20px ${VIO}55, 0 0 0 1px ${VIO}30`,
        transition:"transform .15s, box-shadow .15s",
        outline:"none",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform ="scale(1.08)";
        e.currentTarget.style.boxShadow =`0 6px 24px ${VIO}70, 0 0 0 1px ${VIO}40`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform ="scale(1)";
        e.currentTarget.style.boxShadow =`0 4px 20px ${VIO}55, 0 0 0 1px ${VIO}30`;
      }}
    >
      <SparkIcon size={22}/>
    </button>
);
}
