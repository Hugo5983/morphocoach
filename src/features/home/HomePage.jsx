import { useState } from "react";
import { C, INT } from "../../data/constants.js";
import { Row } from "../../components/ui/index.jsx";

const FONT  = "'Outfit','DM Sans',system-ui,sans-serif";
const SERIF = "'DM Serif Display','Georgia',serif";
const NUM   = { fontVariantNumeric:"tabular-nums", fontFeatureSettings:'"tnum"' };

// ─── Icône SVG ───────────────────────────────────────────────────────────
function I({ d, size=18, color="currentColor", sw=1.8, fill="none" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
         fill={fill} stroke={color} strokeWidth={sw}
         strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}

const ic = {
  bolt:     <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>,
  plus:     <path d="M12 5v14M5 12h14"/>,
  chev:     <path d="m9 6 6 6-6 6"/>,
  play:     <path d="m8 5 12 7-12 7z"/>,
  arrowUp:  <path d="m6 14 6-6 6 6"/>,
  arrowDn:  <path d="m6 10 6 6 6-6"/>,
  drop:     <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/></>,
  chat:     <path d="M21 12a8 8 0 0 1-12 7l-5 1 1-5A8 8 0 1 1 21 12z"/>,
  dumbbell: <path d="M6.5 6.5 17.5 17.5M4 8l4-4M16 20l4-4M2 10l2-2M20 16l2-2M9 4l3 3M15 17l3 3"/>,
  bell:     <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8Z"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
  user:     <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>,
};

// ─── Sparkline ───────────────────────────────────────────────────────────
function Sparkline({ data, color = "#3B82F6" }) {
  if (!data || data.length < 2) return null;
  const W = 280, H = 52;
  const vals = data.map(v => typeof v === "object" ? v.v : v);
  const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1;
  const pts = vals.map((v, i) => [
    (i / (vals.length - 1)) * W,
    H - ((v - min) / range) * (H - 8) - 4,
  ]);
  const d    = pts.map((p, i) => (i === 0 ? `M${p[0]} ${p[1]}` : `L${p[0]} ${p[1]}`)).join(" ");
  const fill = `${d} L${W} ${H} L0 ${H} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
         style={{ display:"block", overflow:"visible" }}>
      <defs>
        <linearGradient id="spkHome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#spkHome)"/>
      <path d={d} fill="none" stroke={color} strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={last[0]} cy={last[1]} r="7" fill={color} opacity="0.20"/>
      <circle cx={last[0]} cy={last[1]} r="3.5" fill={color}/>
    </svg>
  );
}

// ─── Barre macro ─────────────────────────────────────────────────────────
function MacroBar({ label, value, goal, color, sub }) {
  const pct = Math.min((value / (goal || 1)) * 100, 100);
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"baseline", marginBottom:4 }}>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          {color !== "#3B82F6" && (
            <span style={{ width:6, height:6, borderRadius:2,
              background:color, display:"inline-block", flexShrink:0 }}/>
          )}
          <span style={{ fontSize:11, color:"rgba(242,244,247,0.50)",
            fontFamily:FONT }}>{label}</span>
        </div>
        <span style={{ fontSize:13, fontWeight:700, color:"#F2F4F7",
          fontFamily:FONT, ...NUM }}>
          {value}
          <span style={{ fontSize:10, color:"rgba(242,244,247,0.35)",
            marginLeft:2 }}>{sub?.unit}</span>
        </span>
      </div>
      <div style={{ height:3, background:"rgba(255,255,255,0.06)", borderRadius:2 }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color,
          borderRadius:2, transition:"width .5s ease" }}/>
      </div>
      <div style={{ fontSize:10, color:"rgba(242,244,247,0.28)",
        marginTop:2, fontFamily:FONT }}>{sub?.label}</div>
    </div>
  );
}

// ─── Tuile accès rapide pleine bleue ─────────────────────────────────────
function QuickTile({ icon, label, sub, onClick, pro, dark }) {
  const bg = dark
    ? "linear-gradient(145deg,#1E3A8A,#2563EB)"
    : "linear-gradient(145deg,#2563EB,#3B82F6)";
  return (
    <button className="tap" onClick={onClick} style={{
      background: bg,
      border:"1px solid rgba(255,255,255,0.15)",
      borderRadius:14, padding:14, cursor:"pointer",
      textAlign:"left", display:"flex", flexDirection:"column",
      gap:10, position:"relative", overflow:"hidden",
    }}>
      <div style={{ position:"absolute", top:-20, right:-20, width:70, height:70,
        borderRadius:"50%", background:"rgba(255,255,255,0.07)", pointerEvents:"none" }}/>
      <div style={{ width:34, height:34, borderRadius:10,
        background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.20)",
        display:"grid", placeItems:"center" }}>
        <I d={ic[icon]} size={16} color="#fff" sw={2.2}/>
      </div>
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:12.5, fontWeight:700, color:"#fff",
            fontFamily:FONT }}>{label}</span>
          {pro && (
            <span style={{ padding:"1px 5px", borderRadius:4,
              background:"rgba(255,255,255,0.15)",
              fontSize:8.5, color:"rgba(255,255,255,0.85)",
              fontWeight:700, letterSpacing:"0.5px", fontFamily:FONT }}>PRO</span>
          )}
        </div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)",
          marginTop:2, fontFamily:FONT }}>{sub}</div>
      </div>
    </button>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────
export default function Home(props) {
  const {
    profil, prog, cycleStart, setTab, premium, setPaywall,
    push, eau, setEau, weightLog, setWeightLog, lastWeighIn,
    setLastWeighIn, calSess, imc, obj, calObj, pObj, lObj, gObj,
    totR, jR, cPct, semC, getStreak, C, INT, MOTIVATIONS,
  } = props;

  const goProgram = (view) => {
    try { localStorage.setItem("mc_progView", view); } catch {}
    setTab("program");
  };

  const [showWeightInput, setShowWeightInput] = useState(false);
  const [newWeight, setNewWeight]             = useState("");

  const today      = new Date();
  const todayKey   = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const todaySess  = calSess[todayKey];
  const dayOfYear  = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000*60*60*24));
  const motiv      = MOTIVATIONS[dayOfYear % MOTIVATIONS.length];
  const streak     = getStreak;
  const tot        = totR;

  const todayD        = new Date();
  const daysSinceLast = lastWeighIn
    ? Math.floor((todayD - new Date(lastWeighIn)) / (1000*60*60*24))
    : 999;
  const canWeighIn  = daysSinceLast >= 14;
  const lastWeight  = weightLog.length > 0 ? weightLog[weightLog.length - 1] : null;
  const firstWeight = weightLog.length > 1 ? weightLog[0] : null;
  const diff        = lastWeight && firstWeight
    ? (lastWeight.v - firstWeight.v).toFixed(1) : null;

  // Macros
  const consumed  = tot.cal || 0;
  const goal      = calObj || 1;
  const remaining = Math.max(goal - consumed, 0);
  const pct       = Math.min(consumed / goal, 1);
  const over      = consumed > goal;
  const r = 60, circum = 2 * Math.PI * r;

  const card = {
    background:"#111827",
    border:"1px solid rgba(255,255,255,0.07)",
    borderRadius:16,
    padding:16,
    marginBottom:10,
  };

  return (
    <div className="anim" style={{ padding:"0 16px 20px" }}>

      {/* ── Greeting ── */}
      <div style={{ paddingTop:20, paddingBottom:14 }}>
        <div style={{ fontSize:11, color:"rgba(242,244,247,0.38)",
          fontFamily:FONT, marginBottom:5 }}>
          {today.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}
        </div>
        <div style={{ fontFamily:SERIF, fontSize:30, color:"#F2F4F7",
          letterSpacing:-0.8, lineHeight:1.1 }}>
          {profil.prenom
            ? <>Bonjour, <span style={{ fontStyle:"italic" }}>{profil.prenom}</span></>
            : <>Bonjour</>}
        </div>
        {prog && (
          <div style={{ marginTop:8 }}>
            <span style={{ display:"inline-flex", alignItems:"center", gap:5,
              padding:"4px 10px", borderRadius:8,
              background:"rgba(59,130,246,0.10)",
              border:"1px solid rgba(59,130,246,0.20)",
              fontSize:11.5, color:"#93C5FD", fontWeight:500, fontFamily:FONT }}>
              <span style={{ width:6, height:6, borderRadius:"50%",
                background:"#3B82F6", display:"inline-block" }}/>
              {cycleStart && jR !== null
                ? `Cycle ${(semC||0)+1} · J${jR}`
                : `${obj.l} · ${prog?.jours?.length||0} séances/sem.`}
            </span>
          </div>
        )}
      </div>

      {/* ── Streak ── */}
      {streak > 0 && (
        <div className="pop-in" style={{ ...card, display:"flex",
          alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, fontSize:18,
            background:"rgba(248,113,113,0.10)",
            border:"1px solid rgba(248,113,113,0.18)",
            display:"grid", placeItems:"center" }}>🔥</div>
          <div>
            <div style={{ fontFamily:FONT, fontWeight:700, fontSize:14,
              color:"#F2F4F7" }}>
              {streak} jour{streak > 1 ? "s" : ""} de suite
            </div>
            <div style={{ fontSize:12, color:"rgba(242,244,247,0.50)",
              marginTop:1, fontFamily:FONT }}>
              {streak >= 7 ? "Semaine parfaite !" : streak >= 3 ? "Continue comme ça !" : "Bonne lancée !"}
            </div>
          </div>
        </div>
      )}

      {/* ── Citation ── */}
      <div style={{ background:"#111827",
        border:"1px solid rgba(255,255,255,0.07)",
        borderLeft:"3px solid #3B82F6",
        borderRadius:"0 12px 12px 0",
        padding:"12px 14px", marginBottom:10 }}>
        <div style={{ fontSize:10, fontWeight:600, letterSpacing:"1.2px",
          textTransform:"uppercase", color:"#3B82F6",
          fontFamily:FONT, marginBottom:5 }}>Citation du jour</div>
        <div style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:14,
          color:"#F2F4F7", lineHeight:1.55 }}>"{motiv}"</div>
      </div>

      {/* ── Séance du jour — carte pleine bleue ── */}
      {todaySess ? (
        <div style={{
          background:"linear-gradient(135deg,#1E40AF 0%,#2563EB 50%,#3B82F6 100%)",
          border:"1px solid rgba(255,255,255,0.15)",
          borderRadius:18, padding:18, marginBottom:10,
          position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:1,
            background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)" }}/>
          <div style={{ position:"absolute", top:-40, right:-40, width:140, height:140,
            borderRadius:"50%", background:"rgba(255,255,255,0.05)", pointerEvents:"none" }}/>
          <div style={{ display:"flex", alignItems:"center", gap:12, position:"relative" }}>
            <div style={{ width:48, height:48, borderRadius:14,
              background:"rgba(255,255,255,0.15)",
              border:"1px solid rgba(255,255,255,0.22)",
              display:"grid", placeItems:"center", flexShrink:0 }}>
              <I d={ic.bolt} size={22} color="#fff" sw={2.2}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, fontWeight:600, letterSpacing:"1.2px",
                textTransform:"uppercase", color:"rgba(255,255,255,0.65)",
                fontFamily:FONT, marginBottom:3 }}>
                Séance du jour
              </div>
              <div style={{ fontSize:17, fontWeight:700, color:"#fff",
                fontFamily:FONT, letterSpacing:-0.3 }}>
                {todaySess.nom}
              </div>
              {todaySess.intensite && (
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.60)",
                  marginTop:2, fontFamily:FONT }}>
                  {INT[todaySess.intensite]?.l}
                </div>
              )}
            </div>
          </div>
          <button className="tap" onClick={() => goProgram("today")} style={{
            marginTop:14, width:"100%", padding:12,
            borderRadius:12,
            background:"rgba(255,255,255,0.15)",
            border:"1px solid rgba(255,255,255,0.25)",
            color:"#fff", display:"flex", alignItems:"center",
            justifyContent:"center", gap:7,
            fontFamily:FONT, fontSize:14, fontWeight:600, cursor:"pointer",
          }}>
            <I d={ic.play} size={13} color="#fff" sw={0} fill="#fff"/>
            Démarrer la séance
          </button>
        </div>
      ) : !prog && (
        <div onClick={() => goProgram("creer")} className="tap" style={{
          ...card, cursor:"pointer", display:"flex",
          alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:11,
            background:"rgba(59,130,246,0.10)",
            border:"1px solid rgba(59,130,246,0.20)",
            display:"grid", placeItems:"center", fontSize:18 }}>🏋️</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13.5, fontWeight:600, color:"#F2F4F7",
              fontFamily:FONT }}>Créer mon premier programme</div>
            <div style={{ fontSize:12, color:"rgba(242,244,247,0.45)",
              marginTop:2, fontFamily:FONT }}>Démarre en quelques secondes</div>
          </div>
          <I d={ic.chev} size={16} color="rgba(242,244,247,0.35)"/>
        </div>
      )}

      {/* ── Progression du cycle ── */}
      {cycleStart && prog && (
        <div style={{ ...card }}>
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:14 }}>
            <div>
              <div style={{ fontSize:10, fontWeight:600, letterSpacing:"1.2px",
                textTransform:"uppercase", color:"rgba(242,244,247,0.38)",
                fontFamily:FONT, marginBottom:4 }}>
                Cycle · Semaine {(semC||0)+1}/6
              </div>
              <div style={{ fontFamily:FONT, fontSize:16, fontWeight:700,
                color:"#F2F4F7" }}>{prog?.titre}</div>
            </div>
            <div style={{ fontFamily:SERIF, fontSize:34, color:"#F2F4F7",
              letterSpacing:-1, ...NUM }}>
              {jR}<span style={{ fontSize:12, color:"rgba(242,244,247,0.38)",
                marginLeft:2 }}>j</span>
            </div>
          </div>
          <div style={{ height:5, background:"rgba(255,255,255,0.06)",
            borderRadius:3, overflow:"hidden" }}>
            <div style={{ height:"100%",
              width:`${Math.min(100, cPct||0)}%`,
              background:"#3B82F6", borderRadius:3,
              transition:"width .5s ease" }}/>
          </div>
          <div style={{ display:"flex", gap:4, marginTop:10 }}>
            {[0,1,2,3,4,5].map(w => (
              <div key={w} style={{ flex:1, height:3, borderRadius:2,
                background: w <= semC ? "#3B82F6" : "rgba(255,255,255,0.06)",
                transition:"background .3s" }}/>
            ))}
          </div>
        </div>
      )}

      {/* ── Énergie / Macros ── */}
      {profil.poids && profil.taille && profil.age && profil.sexe ? (
        <div style={{ ...card }}>
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:14 }}>
            <span style={{ fontSize:15, fontWeight:700, color:"#F2F4F7",
              fontFamily:FONT }}>Énergie du jour</span>
            <button className="tap" onClick={() => setTab("nutrition")} style={{
              padding:"5px 10px", background:"rgba(255,255,255,0.04)",
              border:"1px solid rgba(255,255,255,0.07)", borderRadius:8,
              color:"rgba(242,244,247,0.45)", fontSize:11, fontFamily:FONT,
              cursor:"pointer", display:"flex", alignItems:"center", gap:3,
            }}>
              Voir <I d={ic.chev} size={11} sw={1.8}/>
            </button>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            {/* Anneau */}
            <div style={{ position:"relative", width:148, height:148, flexShrink:0 }}>
              <svg width="148" height="148" viewBox="0 0 148 148">
                <defs>
                  <linearGradient id="ringHome" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563EB"/>
                    <stop offset="100%" stopColor="#60A5FA"/>
                  </linearGradient>
                </defs>
                <g transform="rotate(-90 74 74)">
                  <circle cx="74" cy="74" r={r} fill="none"
                    stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
                  <circle cx="74" cy="74" r={r} fill="none"
                    stroke={over ? "#F87171" : "url(#ringHome)"}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circum}
                    strokeDashoffset={circum * (1 - pct)}
                    style={{ transition:"stroke-dashoffset 1s ease" }}/>
                </g>
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex",
                flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <div style={{ fontSize:9, fontWeight:600,
                  color:"rgba(242,244,247,0.35)", letterSpacing:"1px",
                  textTransform:"uppercase", fontFamily:FONT, marginBottom:2 }}>
                  {over ? "Dépassé" : "Restant"}
                </div>
                <div style={{ fontFamily:SERIF, fontSize:34,
                  color: over ? "#F87171" : "#F2F4F7",
                  lineHeight:1, ...NUM }}>
                  {over ? consumed - goal : remaining}
                </div>
                <div style={{ fontSize:10, color:"rgba(242,244,247,0.40)",
                  fontFamily:FONT, marginTop:2 }}>kcal</div>
              </div>
            </div>
            {/* Barres macros */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:11 }}>
              <MacroBar
                label="Apport" value={consumed} color="#3B82F6"
                goal={goal} sub={{ unit:"kcal", label:`sur ${goal}` }}
              />
              <MacroBar
                label="Protéines" value={tot.p||0} color="#60A5FA"
                goal={pObj} sub={{ unit:"g", label:`obj ${pObj}g` }}
              />
              <MacroBar
                label="Glucides" value={tot.g||0} color="#22D3EE"
                goal={gObj} sub={{ unit:"g", label:`obj ${gObj}g` }}
              />
              <MacroBar
                label="Lipides" value={tot.l||0} color="#34D399"
                goal={lObj} sub={{ unit:"g", label:`obj ${lObj}g` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div onClick={() => setTab("profile")} className="tap" style={{
          ...card, cursor:"pointer", display:"flex",
          alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:11,
            background:"rgba(59,130,246,0.10)",
            border:"1px solid rgba(59,130,246,0.20)",
            display:"grid", placeItems:"center", fontSize:18 }}>👤</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13.5, fontWeight:600, color:"#F2F4F7",
              fontFamily:FONT }}>Compléter mon profil</div>
            <div style={{ fontSize:12, color:"rgba(242,244,247,0.45)",
              marginTop:2, fontFamily:FONT }}>
              Pour voir tes calories et macros personnalisées
            </div>
          </div>
          <I d={ic.chev} size={16} color="rgba(242,244,247,0.35)"/>
        </div>
      )}

      {/* ── Hydratation ── */}
      <div style={{ ...card }}>
        <div style={{ display:"flex", alignItems:"center",
          justifyContent:"space-between", marginBottom:11 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:10,
              background:"rgba(52,211,153,0.10)",
              border:"1px solid rgba(52,211,153,0.18)",
              display:"grid", placeItems:"center" }}>
              <I d={ic.drop} size={15} color="#34D399" sw={2}/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:600, letterSpacing:"1.2px",
                textTransform:"uppercase", color:"rgba(242,244,247,0.38)",
                fontFamily:FONT, marginBottom:2 }}>Hydratation</div>
              <div style={{ fontFamily:FONT, fontWeight:700, fontSize:13,
                color:"#F2F4F7", ...NUM }}>
                {(eau * 0.25).toFixed(2).replace(".", ",")} L
                <span style={{ fontSize:11, color:"rgba(242,244,247,0.38)",
                  marginLeft:5, fontWeight:400 }}>{eau}/8 verres</span>
              </div>
            </div>
          </div>
          <button className="tap" onClick={() => setEau(e => Math.min(8, e + 1))} style={{
            padding:"6px 11px", borderRadius:8,
            background:"rgba(52,211,153,0.08)",
            border:"1px solid rgba(52,211,153,0.20)",
            color:"#34D399", fontSize:11, fontWeight:600,
            fontFamily:FONT, cursor:"pointer",
            display:"flex", alignItems:"center", gap:4,
          }}>
            <I d={ic.plus} size={10} color="#34D399" sw={2.4}/>250ml
          </button>
        </div>
        <div style={{ display:"flex", gap:3 }}>
          {Array.from({ length:8 }).map((_, i) => {
            const on = i < eau;
            return (
              <button key={i} onClick={() => setEau(i + 1 === eau ? i : i + 1)}
                className="tap" style={{
                  flex:1, height:16, borderRadius:4, padding:0,
                  background: on ? "#3B82F6" : "rgba(255,255,255,0.05)",
                  border:`1px solid ${on ? "rgba(59,130,246,0.40)" : "rgba(255,255,255,0.07)"}`,
                  transition:"background .15s",
                }}/>
            );
          })}
        </div>
      </div>

      {/* ── Accès rapide — tuiles bleues pleines ── */}
      <div style={{ marginBottom:10 }}>
        <div style={{ fontFamily:FONT, fontSize:15, fontWeight:700,
          color:"#F2F4F7", marginBottom:10 }}>Accès rapide</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <QuickTile icon="bolt"     label="Séance du jour" sub="Exercices"          onClick={() => goProgram("today")}/>
          <QuickTile icon="calendar" label="Calendrier"     sub="Planification"      onClick={() => goProgram("calendar")}/>
          <QuickTile icon="chat"     label="Coach IA"       sub="Sur-mesure" pro dark onClick={() => { if (!premium) setPaywall(true); else goProgram("analyse"); }}/>
          <QuickTile icon="dumbbell" label="Créer"          sub="Programme manuel"   onClick={() => goProgram("creer")}/>
        </div>
      </div>

      {/* ── Suivi du poids ── */}
      <div style={{ ...card }}>
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"flex-start", marginBottom:4 }}>
          <div>
            <div style={{ fontFamily:FONT, fontSize:14, fontWeight:700,
              color:"#F2F4F7" }}>Suivi du poids</div>
            {lastWeight && (
              <div style={{ display:"flex", alignItems:"baseline",
                gap:4, marginTop:7 }}>
                <span style={{ fontFamily:SERIF, fontSize:32, color:"#F2F4F7",
                  letterSpacing:-1, lineHeight:1, ...NUM }}>{lastWeight.v}</span>
                <span style={{ fontSize:12, color:"rgba(242,244,247,0.38)",
                  fontFamily:FONT }}>kg</span>
              </div>
            )}
            {diff && (
              <div style={{ marginTop:6, display:"inline-flex",
                alignItems:"center", gap:4, padding:"3px 8px", borderRadius:6,
                background: parseFloat(diff) > 0
                  ? "rgba(248,113,113,0.10)" : "rgba(52,211,153,0.10)",
                border:`1px solid ${parseFloat(diff) > 0
                  ? "rgba(248,113,113,0.25)" : "rgba(52,211,153,0.25)"}`,
                color: parseFloat(diff) > 0 ? "#F87171" : "#34D399",
                fontSize:11.5, fontWeight:600, fontFamily:FONT, ...NUM }}>
                <I d={parseFloat(diff) > 0 ? ic.arrowUp : ic.arrowDn}
                   size={11} color={parseFloat(diff) > 0 ? "#F87171" : "#34D399"} sw={2.4}/>
                {parseFloat(diff) > 0 ? "+" : ""}{diff} kg
              </div>
            )}
            {weightLog.length === 0 && (
              <div style={{ fontSize:12, color:"rgba(242,244,247,0.35)",
                marginTop:8, fontFamily:FONT, lineHeight:1.5 }}>
                Enregistrez votre première pesée.
              </div>
            )}
          </div>
          {canWeighIn && !showWeightInput && (
            <button className="tap" onClick={() => setShowWeightInput(true)} style={{
              padding:"7px 11px", background:"rgba(255,255,255,0.04)",
              border:"1px solid rgba(255,255,255,0.07)", borderRadius:9,
              color:"rgba(242,244,247,0.50)", fontSize:11, fontWeight:600,
              fontFamily:FONT, display:"flex", alignItems:"center",
              gap:4, cursor:"pointer",
            }}>
              <I d={ic.plus} size={10} sw={2.4}/>Pesée
            </button>
          )}
        </div>
        {weightLog.length >= 2 && (
          <div style={{ marginTop:12 }}>
            <Sparkline data={weightLog.map(w => w.v)} color="#3B82F6"/>
          </div>
        )}
        {showWeightInput && canWeighIn && (
          <Row style={{ gap:8, marginTop:12 }}>
            <input
              type="number" placeholder="Ex: 79.5" value={newWeight}
              onChange={e => setNewWeight(e.target.value)} step="0.1"
              style={{ flex:1, padding:"10px 12px",
                background:"#1A2336",
                border:"1px solid rgba(255,255,255,0.07)",
                borderRadius:10, color:"#F2F4F7", fontSize:14,
                fontFamily:"'DM Sans',sans-serif" }}
            />
            <button className="tap" onClick={() => {
              if (!newWeight) return;
              const entry = { v:parseFloat(newWeight),
                date:new Date().toLocaleDateString("fr-FR") };
              setWeightLog(prev => [...prev, entry]);
              setLastWeighIn(new Date().toISOString());
              setNewWeight(""); setShowWeightInput(false);
              push("⚖️", "Poids enregistré !", `${newWeight}kg enregistré.`);
            }} style={{ padding:"10px 14px", background:"#3B82F6",
              border:"none", borderRadius:10, color:"#fff",
              cursor:"pointer", fontSize:14, fontWeight:600,
              fontFamily:FONT }}>✓</button>
            <button className="tap" onClick={() => setShowWeightInput(false)}
              style={{ padding:"10px 11px", background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.07)",
                borderRadius:10, color:"rgba(242,244,247,0.50)",
                cursor:"pointer", fontSize:16 }}>×</button>
          </Row>
        )}
        {!canWeighIn && (
          <div style={{ marginTop:10, padding:"9px 12px",
            background:"rgba(52,211,153,0.06)",
            border:"1px solid rgba(52,211,153,0.18)",
            borderRadius:10, fontSize:12, color:"#34D399",
            fontFamily:FONT, lineHeight:1.5 }}>
            🌱 Prochaine pesée dans{" "}
            <strong>{14 - daysSinceLast} jour{14 - daysSinceLast > 1 ? "s" : ""}</strong>
          </div>
        )}
      </div>

      {/* ── Composition ── */}
      {(profil.bodyfat || imc) && (
        <div style={{ marginBottom:10 }}>
          <div style={{ fontFamily:FONT, fontSize:15, fontWeight:700,
            color:"#F2F4F7", marginBottom:10 }}>Composition</div>
          <div style={{ display:"flex", gap:8 }}>
            {profil.bodyfat && (() => {
              const bf  = parseFloat(profil.bodyfat);
              const cat = profil.sexe === "femme"
                ? (bf<14?"Athlète":bf<21?"Forme":bf<25?"Acceptable":bf<32?"À améliorer":"Obésité")
                : (bf<6?"Athlète":bf<14?"Forme":bf<18?"Acceptable":bf<25?"À améliorer":"Obésité");
              const col = cat==="Athlète"||cat==="Forme"
                ? "#34D399" : cat==="Acceptable" ? "#3B82F6" : "#F87171";
              return (
                <div style={{ flex:1, ...card, marginBottom:0 }}>
                  <div style={{ fontSize:10, fontWeight:600, letterSpacing:"1.2px",
                    textTransform:"uppercase", color:"rgba(242,244,247,0.38)",
                    fontFamily:FONT, marginBottom:8 }}>Masse grasse</div>
                  <div style={{ display:"flex", alignItems:"baseline",
                    gap:3, marginBottom:8 }}>
                    <span style={{ fontFamily:SERIF, fontSize:28,
                      color:"#F2F4F7", letterSpacing:-0.8, lineHeight:1,
                      ...NUM }}>{bf}</span>
                    <span style={{ fontSize:12, color:"rgba(242,244,247,0.38)",
                      fontFamily:FONT }}>%</span>
                  </div>
                  <div style={{ display:"inline-flex", alignItems:"center",
                    gap:4, padding:"3px 8px", borderRadius:6,
                    background:`${col}18`,
                    border:`1px solid ${col}35`,
                    color:col, fontSize:10, fontWeight:700,
                    fontFamily:FONT, letterSpacing:"0.4px" }}>
                    {cat.toUpperCase()}
                  </div>
                </div>
              );
            })()}
            {imc && (
              <div style={{ flex:1, ...card, marginBottom:0 }}>
                <div style={{ fontSize:10, fontWeight:600, letterSpacing:"1.2px",
                  textTransform:"uppercase", color:"rgba(242,244,247,0.38)",
                  fontFamily:FONT, marginBottom:8 }}>IMC</div>
                <div style={{ display:"flex", alignItems:"baseline",
                  gap:3, marginBottom:8 }}>
                  <span style={{ fontFamily:SERIF, fontSize:28,
                    color:"#F2F4F7", letterSpacing:-0.8, lineHeight:1,
                    ...NUM }}>{imc}</span>
                  <span style={{ fontSize:10, color:"rgba(242,244,247,0.38)",
                    fontFamily:FONT }}>kg/m²</span>
                </div>
                <div style={{ display:"inline-flex", padding:"3px 8px",
                  borderRadius:6,
                  background: imc<25 ? "rgba(52,211,153,0.10)" : "rgba(248,113,113,0.10)",
                  border:`1px solid ${imc<25 ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)"}`,
                  color: imc<25 ? "#34D399" : "#F87171",
                  fontSize:10, fontWeight:700, fontFamily:FONT,
                  letterSpacing:"0.4px" }}>
                  {imc<18.5?"MAIGREUR":imc<25?"NORMAL":imc<30?"SURPOIDS":"OBÉSITÉ"}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
