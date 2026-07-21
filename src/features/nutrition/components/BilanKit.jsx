/**
 * BilanKit.jsx — Palette & composants visuels du Bilan Nutrition.
 * Extrait de BilanNutrition.jsx sans aucune modification de code.
 */

import { C, FONT, SERIF, NUM } from"../../../data/constants.js";
import { Ico as UIco } from"../../../components/ui/Icon.jsx";
import { MIN_DAYS_FULL_BILAN } from"./BilanUtils.jsx";

// ─── Palette ───────────────────────────────────────────────────────────────
const BG  = C.bg;
const S1  = C.s1  ||"#FFFFFF";
const BD  = C.bd  ||"rgba(0,0,0,0.05)";
const TEXT = C.text;
const MID  = C.mid;
const DIM  = C.dim;
const BL   = C.accent;
const BLD  = C.accentDk;
const GRN  = C.green;
const AMB  ="#F59E0B";
const RED  ="#E5484D";

// ─── Config macros ─────────────────────────────────────────────────────────
const MCFG = {
  Protéines: {
    L:"P", sq:"linear-gradient(135deg,#9DB0FF,#2438B8)", sqS:"rgba(36,56,184,0.35)",
    bar:"linear-gradient(90deg,#C9D3FF,#3C5BFF)", barG:"rgba(60,91,255,0.35)",
    color:C.accent, roleC:"#2438B8", roleBg:C.accentLt,
    role:"Muscle & récup'", brd:"rgba(60,91,255,0.25)",
  },
  Glucides: {
    L:"G", sq:"linear-gradient(135deg,#F59E0B,#D97706)", sqS:"rgba(245,158,11,0.25)",
    bar:"linear-gradient(90deg,#FCD34D,#F59E0B)", barG:"rgba(245,158,11,0.35)",
    color:"#F59E0B", roleC:"#D97706", roleBg:"rgba(245,158,11,0.12)",
    role:"Carburant sport", brd:"rgba(245,158,11,0.25)",
  },
  Lipides: {
    L:"L", sq:"linear-gradient(135deg,#E5484D,#C53030)", sqS:"rgba(229,72,77,0.25)",
    bar:"linear-gradient(90deg,#F1A8AB,#E5484D)", barG:"rgba(229,72,77,0.35)",
    color:"#E5484D", roleC:"#C53030", roleBg:"rgba(229,72,77,0.12)",
    role:"Récupération", brd:"rgba(229,72,77,0.25)",
  },
};

// ─── Icônes inline ─────────────────────────────────────────────────────────
function I({name,size=18,color="currentColor",stroke=1.8,...r}){
  return <UIco name={name} size={size} color={color} stroke={stroke} {...r}/>;
}

// ─── Mini-ring animé (par macro) ───────────────────────────────────────────
function MiniRing({ pct, color, go, delay=0 }) {
  const sz=76, r=(sz-10)/2, cx=sz/2, cy=sz/2, len=2*Math.PI*r;
  const off=(1-Math.min(pct/100,1))*len;
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0 }}>
      <div style={{ position:"relative",width:sz,height:sz }}>
        <svg width={sz} height={sz} style={{ position:"absolute",inset:0 }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(18,26,48,0.08)" strokeWidth={10}/>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10}
            strokeLinecap="round" strokeDasharray={len} strokeDashoffset={go?off:len}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition:`stroke-dashoffset 1.3s cubic-bezier(.34,1.2,.64,1) ${delay}s`,
              filter:`drop-shadow(0 0 6px ${color}88)` }}
          />
        </svg>
        <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",
          justifyContent:"center",flexDirection:"column" }}>
          <span style={{ fontSize:16,fontWeight:700,color:TEXT,lineHeight:1,fontFamily:FONT,...NUM }}>
            {Math.min(100,pct)}%
          </span>
          <span style={{ fontSize:10,color:DIM,fontWeight:600,marginTop:4,
            textAlign:"center",lineHeight:1.3,fontFamily:FONT }}>
            de la<br/>cible
          </span>
        </div>
      </div>
    </div>
);
}

// ─── Carte macro avec mini-ring ────────────────────────────────────────────
function MacroCard({ label, value, goal, pct, isPointFort, go, delay=0 }) {
  const cfg = MCFG[label] || MCFG.Protéines;
  const remaining = Math.max(0, goal - Math.round(value));
  const tagLabel = pct >= 90 ?"Objectif atteint"
                 : isPointFort ?"Ton point fort"
                 :"À compléter";
  const tagBg    = pct >= 90 ?"#E8EBFF" : isPointFort ? cfg.roleBg :"#E8EBFF";
  const tagColor = pct >= 90 ?"#12B76A" : isPointFort ? cfg.roleC  :"#F59E0B";

  return (
    <div style={{ borderRadius:20, padding:"20px 20px 16px", background:S1,
      border:`1px solid ${cfg.brd}`,
      boxShadow: C.shadow }}>

      {/* Ligne haute : icône + nom/valeur + mini-ring */}
      <div style={{ display:"flex",alignItems:"center",gap:16 }}>
        <div style={{ width:56,height:56,borderRadius:16,flexShrink:0,
          background:cfg.sq, display:"grid",placeItems:"center",
          boxShadow:`0 8px 22px ${cfg.sqS},inset 0 1px 0 rgba(255,255,255,0.25)`,
          fontSize:20,fontWeight:700,color:"white",fontFamily:FONT }}>
          {cfg.L}
        </div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
            <span style={{ fontSize:16,fontWeight:700,color:TEXT,fontFamily:FONT }}>{label}</span>
            <span style={{ fontSize:13,fontWeight:700,padding:"4px 12px",borderRadius:8,
              background:cfg.roleBg,color:cfg.roleC,fontFamily:FONT }}>{cfg.role}</span>
          </div>
          <div style={{ display:"flex",alignItems:"baseline",gap:4,marginTop:4 }}>
            <span style={{ fontSize:34,fontWeight:700,color:TEXT,fontFamily:SERIF,
              letterSpacing:-0.5,...NUM }}>{Math.round(value)}</span>
            <span style={{ fontSize:14,color:DIM,fontWeight:600,fontFamily:FONT }}>/ {goal} g</span>
          </div>
        </div>
        <MiniRing pct={pct} color={cfg.color} go={go} delay={delay}/>
      </div>

      {/* Barre de progression */}
      <div style={{ height:9,borderRadius:8,background:"rgba(18,26,48,0.08)",
        margin:"16px 0 0",overflow:"hidden" }}>
        <div style={{ height:"100%",borderRadius:8,background:cfg.bar,
          boxShadow:`2px 0 12px ${cfg.barG}`,
          width:go?`${Math.min(100,pct)}%`:"0%",
          transition:`width 1.3s cubic-bezier(.34,1.2,.64,1) ${delay}s` }}/>
      </div>

      {/* Ligne basse : badge + texte + chevron */}
      <div style={{ display:"flex",alignItems:"center",gap:12,marginTop:12 }}>
        <span style={{ fontSize:13,fontWeight:700,padding:"4px 12px",borderRadius:8,
          background:tagBg,color:tagColor,flexShrink:0,fontFamily:FONT }}>
          {tagLabel}
        </span>
        <span style={{ fontSize:13,color:DIM,fontWeight:500,flex:1,minWidth:0,
          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:FONT }}>
          {remaining > 0 ?`Encore ${remaining} g pour atteindre ta cible` :"Cible atteinte"}
        </span>
        <I name="chevR" size={17} color={DIM}/>
      </div>
    </div>
);
}

// ─── En-tête de section ────────────────────────────────────────────────────
function SecHead({ title, sub, color=BL, icon=null }) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
        {icon
          ? <div style={{ width:22,height:22,borderRadius:8,background:color,
              display:"grid",placeItems:"center",flexShrink:0 }}>{icon}</div>
          : <div style={{ width:4,height:16,borderRadius:2,background:color,flexShrink:0 }}/>
        }
        <span style={{ fontSize:13,fontWeight:700,letterSpacing:"0.1em",
          textTransform:"uppercase",color:TEXT,fontFamily:FONT }}>{title}</span>
        <div style={{ width:20,height:20,borderRadius:"50%",border:`1px solid ${BD}`,
          display:"grid",placeItems:"center",opacity:.7 }}>
          <I name="info" size={11} color={DIM}/>
        </div>
      </div>
      {sub && (
        <div style={{ fontSize:13,color:DIM,fontWeight:500,marginTop:4,
          paddingLeft:icon?30:12,fontFamily:FONT,lineHeight:1.4 }}>{sub}</div>
)}
    </div>
);
}

// ─── Note calme (remplace PartialBanner) ───────────────────────────────────
function NoteCalme({ nbLogged, totalDays }) {
  const daysLeft = Math.max(0, MIN_DAYS_FULL_BILAN - nbLogged);
  return (
    <div style={{ display:"flex",alignItems:"center",gap:12,padding:"16px 16px",
      borderRadius:16,background:"rgba(238,242,255,0.95)",border:"1px solid rgba(60,91,255,0.25)",
      marginBottom:20,cursor:"pointer" }}>
      <div style={{ width:36,height:36,borderRadius:12,background:"#E8EBFF",
        display:"grid",placeItems:"center",flexShrink:0 }}>
        <I name="info" size={17} color="#2E48D9" stroke={2.2}/>
      </div>
      <div style={{ flex:1,fontSize:14,color:"#2E48D9",lineHeight:1.5,fontFamily:FONT }}>
        <b>{nbLogged} jour{nbLogged>1?"s":""} sur {totalDays} renseigné{nbLogged>1?"s":""}.</b>
        {""}Il te faut {daysLeft} jour{daysLeft>1?"s":""} de plus pour un score fiable.
      </div>
      <I name="chevR" size={17} color="#3C5BFF"/>
    </div>
);
}

// ─── Carte"Prochain bilan archivé" ────────────────────────────────────────
function NextBilanCard({ nextDate, daysUntil, onOpen }) {
  return (
    <div onClick={onOpen} style={{ background:S1,
      border:`1px solid ${BD}`, borderRadius:20,
      padding:"16px 20px", display:"flex", gap:16, alignItems:"center",
      cursor:"pointer",
      boxShadow: C.shadow }}>
      <div style={{ width:48,height:48,borderRadius:16,
        background:`linear-gradient(135deg,#9DB0FF,${BLD})`,
        display:"grid",placeItems:"center",
        boxShadow:"0 5px 16px rgba(46,72,217,0.35)",flexShrink:0 }}>
        <I name="calendar" size={23} color="#FFF"/>
      </div>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontSize:11,fontWeight:700,letterSpacing:"0.1em",
          textTransform:"uppercase",color:BL,marginBottom:4,fontFamily:FONT }}>
          Prochain bilan complet
        </div>
        <div style={{ fontSize:14,fontWeight:700,color:TEXT,fontFamily:FONT }}>
          {nextDate}{daysUntil!=null ?` · dans ${daysUntil} jour${daysUntil>1?"s":""}` :""}
        </div>
        <div style={{ fontSize:13,color:MID,fontFamily:FONT,marginTop:2 }}>
          Rapport bi-hebdomadaire automatique
        </div>
      </div>
      <I name="chevR" size={18} color={MID}/>
    </div>
);
}

// ─── Grille régularité — 7 jours avec lettres ──────────────────────────────
function StreakGrid({ days, calObj }) {
  const arr = Array.isArray(days) ? days.slice(-7) : [];
  const padded = [...Array(Math.max(0, 7 - arr.length)).fill(null), ...arr];

  const statusOf = (day) => {
    if (!day || !day.kcal) return"empty";
    const diff = Math.abs(day.kcal - calObj);
    if (diff < calObj * 0.15) return"ok";
    if (diff < calObj * 0.30) return"warn";
    return"bad";
  };

  const dayLetter = (iso) => {
    if (!iso) return null;
    try { return ["D","L","M","M","J","V","S"][new Date(iso +"T12:00:00").getDay()]; }
    catch { return null; }
  };

  const STYLES = {
    ok:    { bg:"linear-gradient(135deg,#12B76A,#12B76A)", shadow:"0 5px 14px rgba(5,150,105,0.5)", bd:"none" },
    warn:  { bg:"linear-gradient(135deg,#F59E0B,#F59E0B)", shadow:"0 5px 14px rgba(245,158,11,0.35)", bd:"none" },
    bad:   { bg:"linear-gradient(135deg,#E5484D,#E5484D)", shadow:"0 5px 14px rgba(220,38,38,0.35)", bd:"none" },
    empty: { bg:"rgba(18,26,48,0.05)", shadow:"none", bd:"1.5px solid rgba(18,26,48,0.18)" },
  };

  return (
    <div style={{ display:"flex", gap:8, marginBottom:16 }}>
      {padded.map((day, i) => {
        const st = statusOf(day);
        const s  = STYLES[st];
        const letter = day ? dayLetter(day.date) : null;
        return (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            <div style={{ width:"100%", aspectRatio:"1", borderRadius:12,
              display:"grid", placeItems:"center",
              background:s.bg, border:s.bd, boxShadow:s.shadow }}>
              {st==="ok" && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5L10 17l9-10"/>
                </svg>
)}
              {st==="warn" && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round">
                  <path d="M5 12h14"/>
                </svg>
)}
              {st==="bad" && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
)}
            </div>
            <span style={{ fontSize:13, fontWeight:700, color:DIM, fontFamily:FONT }}>
              {letter ||"·"}
            </span>
          </div>
);
      })}
    </div>
);
}

export { BG, S1, BD, TEXT, MID, DIM, BL, BLD, GRN, AMB, RED, MCFG, I, MiniRing, MacroCard, SecHead, NoteCalme, NextBilanCard, StreakGrid };
