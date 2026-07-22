/**
 * HomeCards.jsx — Constantes, assets & cartes de la page d'accueil.
 * Accueil V2 : refonte visuelle alignée sur la maquette 14A (bandeau,
 * hero blanc, nutrition, badges, coach IA, packs PRO). Aucune photo —
 * uniquement les icônes déjà présentes dans Icon.jsx et les icônes
 * inline déjà existantes dans ce fichier. Logique métier (props,
 * calculs, navigation) strictement inchangée par rapport à la version
 * précédente.
 */

import { useMemo } from"react";
import { I, ID } from"../../../components/ui/Icon.jsx";
import { C, FONT, NUM } from"../../../data/constants.js";
import { toDateKey } from"../../../utils/training.js";

// ─── Sous-composants ─────────────────────────────────────────────────────────
/** Carte entraînement du jour */
function HeroCard({ prog, calSess, setTab }) {
  // Séance du jour : priorité au calendrier, puis nom/focus du jour, puis prochaine séance
  const todaySeance = useMemo(() => {
    if (!prog?.jours?.length) return null;
    const today     = new Date();
    const dayNames  = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
    const todayKey  = toDateKey(today);
    const todayName = dayNames[today.getDay()];
    const calSeance = calSess?.[todayKey];
    if (calSeance?.seanceId) {
      const found = prog.jours.find((j) => j.id === calSeance.seanceId);
      if (found) return found;
    }
    const byDay = prog.jours.find((j) =>
      j.nom?.toLowerCase().includes(todayName.toLowerCase()) ||
      j.focus?.toLowerCase().includes(todayName.toLowerCase())
);
    if (byDay) return byDay;
    return prog.jours.find((j) => !j.complete) || prog.jours[0] || null;
  }, [prog, calSess]);

  return (
    <div style={{
      margin:"0 20px 12px",
      background: C.s1,
      borderRadius: 20,
      padding:"22px 20px",
      boxShadow: C.shadow,
      display:"flex", flexDirection:"column", gap: 14,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 13,
          background:"rgba(60,91,255,0.1)",
          display:"grid", placeItems:"center", flexShrink: 0,
        }}>
          <I name="dumbbell" size={21} color={C.accent} stroke={2}/>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap: 2, minWidth: 0 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing:".09em",
            color: C.accent, fontFamily: FONT,
          }}>
            ENTRAÎNEMENT DU JOUR
          </span>
          <span style={{
            fontSize: 19, fontWeight: 700, letterSpacing:"-.01em",
            fontFamily: FONT, color: C.text,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
          }}>
            {todaySeance ? (todaySeance.nom ||"Séance du jour") :"Aucun programme actif"}
          </span>
        </div>
      </div>

      {todaySeance ? (
        <div style={{
          display:"flex", alignItems:"center", gap: 10,
          fontSize: 13.5, fontWeight: 600, color: C.dim, fontFamily: FONT,
        }}>
          <span>{todaySeance?.duree ||"45"} min</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{todaySeance?.exercices?.length || 0} exercices</span>
        </div>
) : (
        <div style={{
          fontSize: 13.5, fontWeight: 500, color: C.dim,
          lineHeight: 1.5, fontFamily: FONT,
        }}>
          Génère ton programme personnalisé pour voir ta séance du jour ici.
        </div>
)}

      <button
        onClick={() => setTab && setTab("training")}
        className="tap"
        style={{
          border:"none", cursor:"pointer",
          background: C.accent,
          color:"#FFF", fontFamily: FONT, fontWeight: 700, fontSize: 15,
          padding: 14, borderRadius: 14,
          display:"flex", alignItems:"center", justifyContent:"center", gap: 9,
        }}
      >
        {todaySeance ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFF"><path d="M6 4l14 8-14 8z"/></svg>
) : (
          <I name="plus" size={16} color="#FFF" stroke={2.4}/>
)}
        {todaySeance ?"Commencer" :"Créer mon programme"}
      </button>
    </div>
);
}

/** Section Nutrition */
function NutritionCard({ calObj, pObj, gObj, lObj, totR, setTab, setPaywallNutrition, premium }) {
  const consumed  = totR?.kcal  || 0;
  const goal      = calObj || 2000;
  const remaining = Math.max(0, goal - consumed);
  const over      = consumed > goal;
  const pCons  = totR?.p  || 0;
  const gCons  = totR?.g  || 0;
  const lCons  = totR?.l  || 0;
  const pPct   = pObj ? Math.min(100, Math.round((pCons / pObj) * 100)) : 0;
  const gPct   = gObj ? Math.min(100, Math.round((gCons / gObj) * 100)) : 0;
  const lPct   = lObj ? Math.min(100, Math.round((lCons / lObj) * 100)) : 0;

  const macros = [
    { label:"PROTÉINES", value: Math.round(pCons), goalVal: Math.round(pObj || 198), pct: pPct,
      text: C.accentDk, tint:"rgba(60,91,255,.07)", track:"rgba(60,91,255,.15)", bar: C.accent },
    { label:"GLUCIDES",  value: Math.round(gCons), goalVal: Math.round(gObj || 426), pct: gPct,
      text:"#B45309", tint:"rgba(245,158,11,.09)", track:"rgba(245,158,11,.18)", bar: C.amber },
    { label:"LIPIDES",   value: Math.round(lCons), goalVal: Math.round(lObj || 90),  pct: lPct,
      text:"#C53030", tint:"rgba(229,72,77,.07)",  track:"rgba(229,72,77,.15)",  bar: C.red },
  ];

  const handleAdd = () => {
    if (premium) {
      setTab && setTab("nutrition");
    } else {
      setPaywallNutrition && setPaywallNutrition(true);
    }
  };

  const r = 42, circ = 2 * Math.PI * r;
  const ringPct = Math.min(consumed / (goal || 1), 1);

  return (
    <div style={{
      margin:"0 20px 12px",
      background: C.s1,
      borderRadius: 20,
      padding:"20px 20px",
      boxShadow: C.shadow,
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing:"0.1em", fontFamily: FONT, color: C.text }}>
          NUTRITION
        </span>
        <span onClick={handleAdd} className="tap-sm" style={{
          fontSize: 12.5, fontWeight: 700, color: C.accent, fontFamily: FONT, cursor:"pointer",
        }}>
          Détails
        </span>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap: 18 }}>
        <div style={{ position:"relative", width: 100, height: 100, flexShrink: 0 }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <g transform="rotate(-90 50 50)">
              <circle cx="50" cy="50" r={r} fill="none" stroke={C.s2} strokeWidth="9"/>
              <circle cx="50" cy="50" r={r} fill="none" stroke={over ? C.red : C.accent} strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - ringPct)}
                style={{ transition:"stroke-dashoffset .6s ease" }}
              />
            </g>
          </svg>
          <div style={{
            position:"absolute", inset: 0,
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", gap: 1,
          }}>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing:"-.02em", fontFamily: FONT, color: C.text, ...NUM }}>
              {Math.round(over ? consumed - goal : remaining)}
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, color: C.dim, fontFamily: FONT }}>
              {over ?"kcal dépassé" :"kcal restant"}
            </span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0, display:"flex", flexDirection:"column", gap: 10 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize: 12.5, fontWeight: 500, color: C.dim, fontFamily: FONT }}>Objectif</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: FONT, ...NUM }}>{Math.round(goal)}</span>
          </div>
          <div style={{ height: 1, background:"rgba(0,0,0,.05)" }}/>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize: 12.5, fontWeight: 500, color: C.dim, fontFamily: FONT }}>Consommé</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: FONT, ...NUM }}>{Math.round(consumed)}</span>
          </div>
        </div>
      </div>

      <div style={{ display:"flex", gap: 8, marginTop: 18 }}>
        {macros.map(({ label, value, goalVal, pct, text, tint, track, bar }) => (
          <div key={label} style={{ flex: 1, background: tint, borderRadius: 13, padding:"10px 10px", minWidth: 0 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: text, marginBottom: 7,
              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
            }}>
              {label}
            </div>
            <div style={{ height: 3, background: track, borderRadius: 2, marginBottom: 6 }}>
              <div style={{ height: 3, width:`${pct}%`, background: bar, borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: C.mid, fontFamily: FONT, whiteSpace:"nowrap" }}>
              {value} / {goalVal}g
            </div>
          </div>
))}
      </div>

      <button onClick={handleAdd} className="tap" style={{
        width:"100%", cursor:"pointer",
        background:"#FFF",
        border:"1.5px solid rgba(18,183,106,0.25)",
        color: C.green,
        fontFamily: FONT, fontWeight: 700, fontSize: 16,
        padding: 16, borderRadius: 16, marginTop: 16,
        display:"flex", alignItems:"center", justifyContent:"center", gap: 8,
      }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Ajouter un repas
      </button>
    </div>
);
}

/** Carte Packs PRO */
function ProPackBanner({ variant, onUnlock }) {
  const V = variant ==="entrainement"
    ? {
        title:"Entraînement Pro",
        subtitle:"Programme sur-mesure selon ta morphologie",
        icon:(
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.accent}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4Z"/>
          </svg>
        ),
        iconBg:"#E4ECFF",
        topBorder:"linear-gradient(90deg,#2E48D9,#3C5BFF)",
        border:"rgba(60,91,255,0.18)",
        btnBg: C.accent,
      }
    : {
        title:"Nutrition Pro",
        subtitle:"Recettes premium, analyse photo, bilan bi-mensuel",
        icon:(
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.green}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 7c-1.2-1.6-3-2.2-4.8-1.6C4.6 6.3 3.2 9 3.8 12c.7 3.6 3 7.4 5.5 8.6.9.4 1.6.4 2.7-.1 1.1.5 1.8.5 2.7.1 2.5-1.2 4.8-5 5.5-8.6.6-3-.8-5.7-3.4-6.6C15 4.8 13.2 5.4 12 7Z"/>
            <path d="M12 6.5c0-2 1.3-3.5 3.2-3.9"/>
          </svg>
        ),
        iconBg:"rgba(18,183,106,0.12)",
        topBorder:"linear-gradient(90deg,#0F9553,#12B76A)",
        border:"rgba(18,183,106,0.22)",
        btnBg: C.green,
      };
  return (
    <div style={{
      margin:"12px 20px 0", background:"#FFFFFF",
      border:`1px solid ${V.border}`, borderRadius:16,
      padding:16, position:"relative", overflow:"hidden",
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3,
        background: V.topBorder }}/>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:11, background: V.iconBg,
          display:"grid", placeItems:"center", flexShrink:0 }}>
          {V.icon}
        </div>
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:1, minWidth:0 }}>
          <span style={{ fontSize:14, fontWeight:700, fontFamily:FONT, color:C.text }}>
            {V.title}
          </span>
          <span style={{ fontSize:11.5, fontWeight:500, color:C.dim, fontFamily:FONT,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {V.subtitle}
          </span>
        </div>
        <button onClick={onUnlock} className="tap-sm" style={{
          fontSize:12.5, fontWeight:700, color:"#FFF", background: V.btnBg,
          padding:"8px 14px", borderRadius:10, whiteSpace:"nowrap",
          border:"none", cursor:"pointer", fontFamily: FONT, flexShrink:0,
        }}>Débloquer</button>
      </div>
    </div>
  );
}

function PacksCard({ premium, setPaywall, setPaywallNutrition }) {
  if (premium) return null;
  return (
    <>
      <ProPackBanner variant="entrainement" onUnlock={() => setPaywall(true)}/>
      <ProPackBanner variant="nutrition" onUnlock={() => setPaywallNutrition(true)}/>
    </>
  );
}

/** Mes Badges */
/** @param {{ badgeStates?: Array<any>, onVoirTout?: () => void }} props */
function BadgesCard({ badgeStates = [], onVoirTout } = {}) {
  // 5 badges mis en avant : les débloqués d'abord, puis les plus proches du déblocage
  const displayed = [...badgeStates]
    .sort((a, b) => (b.unlocked - a.unlocked) || (b.pct - a.pct))
    .slice(0, 5);
  const unlockedCount = badgeStates.filter((b) => b.unlocked).length;
  return (
    <div style={{
      margin:"0 20px 12px",
      background: C.s1,
      borderRadius: 16,
      padding:"18px 18px",
      boxShadow: C.shadow,
    }}>
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom: 14,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing:"0.1em", fontFamily: FONT, color: C.text }}>
          MES BADGES
          <span style={{ color: C.dim, fontWeight: 700, marginLeft: 8, fontSize: 12, ...NUM }}>
            {unlockedCount}/{badgeStates.length}
          </span>
        </span>
        <span onClick={onVoirTout} className="tap" style={{ fontSize: 12.5, fontWeight: 700, color: C.accent, fontFamily: FONT, cursor:"pointer" }}>
          Voir tout
        </span>
      </div>
      <div style={{ display:"flex", gap: 10 }}>
        {displayed.map((b) => (
          <div key={b.id} onClick={onVoirTout} className="tap" style={{
            flex: 1, display:"flex", justifyContent:"center",
            cursor:"pointer", minWidth: 0,
          }}>
            <img
              src={b.img} alt={b.nom} loading="lazy"
              style={{
                width: 44, height: 50, objectFit:"contain",
                filter: b.unlocked
                  ?"drop-shadow(0 4px 10px rgba(30,80,220,0.25))"
                  :"grayscale(1) brightness(0.72) opacity(0.5)",
              }}
            />
          </div>
))}
      </div>
    </div>
);
}

/** Série en cours */
function StreakCard({ streak }) {
  return (
    <div style={{
      margin:"0 20px 12px",
      background:"linear-gradient(120deg,rgba(245,158,11,.09),rgba(245,158,11,.03))",
      border:"1px solid rgba(245,158,11,.15)",
      borderRadius: 16,
      padding: 14,
      display:"flex", alignItems:"center", gap: 12,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 11,
        background:"rgba(245,158,11,.14)",
        display:"grid", placeItems:"center", flexShrink: 0,
      }}>
        <ID name="streak" size={20}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: C.text, fontFamily: FONT }}>
          Série de {streak} jours
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 500, color: C.dim, fontFamily: FONT, marginTop: 1 }}>
          Continue aujourd'hui pour ne pas la perdre
        </div>
      </div>
    </div>
);
}

/** Coach IA */
function CoachIACard() {
  return (
    <div style={{
      margin:"0 20px 12px",
      background:"#0B0F1F",
      borderRadius: 15,
      padding:"14px 15px",
      display:"flex", alignItems:"center", gap: 12,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background:"rgba(124,140,255,.16)",
        display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B93FF" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="12" cy="12" r="9"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
          <circle cx="12" cy="17" r=".5" fill="#8B93FF"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color:"#FFF", fontFamily: FONT }}>
          Coach IA
        </div>
        <div style={{
          fontSize: 11, fontWeight: 500, color:"rgba(246,248,251,.55)", fontFamily: FONT,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
        }}>
          Pose une question sur ta forme, ta nutrition
        </div>
      </div>
      <I name="chevronRight" size={16} color="rgba(246,248,251,.4)"/>
    </div>
);
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

/**
 * @param {{
 *   profil: any,
 *   prog: any,
 *   cycleStart: any,
 *   setTab: Function,
 *   premium: boolean,
 *   setPaywall: Function,
 *   setPaywallNutrition: Function,
 *   calObj: number,
 *   pObj: number,
 *   gObj: number,
 *   lObj: number,
 *   totR: any,
 *   getStreak: number,
 *   [key: string]: any
 * }} props
 */

export { HeroCard, NutritionCard, PacksCard, BadgesCard, StreakCard, CoachIACard };
