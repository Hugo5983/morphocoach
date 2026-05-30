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
  lock:     <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
  check:    <polyline points="20 6 9 17 4 12"/>,
  dumbbell: <path d="M6.5 6.5 17.5 17.5M4 8l4-4M16 20l4-4M2 10l2-2M20 16l2-2M9 4l3 3M15 17l3 3"/>,
  leaf:     <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>,
  star:     <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" stroke="none"/>,
};

// ─── Barre macro ─────────────────────────────────────────────────────────
function MacroBar({ label, value, goal, color, unit }) {
  const pct = Math.min((value / (goal || 1)) * 100, 100);
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"center", marginBottom:5 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <div style={{ width:7, height:7, borderRadius:"50%",
            background:color, flexShrink:0 }}/>
          <span style={{ fontSize:12.5, color:"rgba(242,244,247,0.55)",
            fontFamily:FONT, fontWeight:500 }}>{label}</span>
        </div>
        <div style={{ display:"flex", alignItems:"baseline", gap:3 }}>
          <span style={{ fontSize:13, fontWeight:700, color:"#F2F4F7",
            fontFamily:FONT, ...NUM }}>{value}</span>
          <span style={{ fontSize:11, color:"rgba(242,244,247,0.28)",
            fontFamily:FONT }}>/ {goal}{unit}</span>
        </div>
      </div>
      <div style={{ height:3, background:"rgba(255,255,255,0.07)", borderRadius:99 }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color,
          borderRadius:99, transition:"width .6s ease" }}/>
      </div>
    </div>
  );
}

// ─── Pack Premium Card ────────────────────────────────────────────────────
function PackCard({ type, onUnlock }) {
  const isTraining = type === "training";
  const accent     = isTraining ? "#3B82F6" : "#10B981";
  const accentDk   = isTraining ? "#1D4ED8" : "#059669";
  const accentLt   = isTraining ? "#93C5FD" : "#6EE7B7";
  const bg         = isTraining
    ? "linear-gradient(145deg,#0D1A3E 0%,#0F1629 100%)"
    : "linear-gradient(145deg,#071A14 0%,#0A2018 100%)";
  const borderClr  = isTraining ? "rgba(59,130,246,0.25)" : "rgba(16,185,129,0.22)";
  const iconPath   = isTraining
    ? <path d="M6.5 6.5 17.5 17.5M4 8l4-4M16 20l4-4M2 10l2-2M20 16l2-2M9 4l3 3M15 17l3 3"/>
    : <><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>;
  const title      = isTraining ? "Entraînement Pro" : "Nutrition Pro";
  const eyebrow    = isTraining ? "Pack" : "Pack";
  const free       = isTraining
    ? ["Créer un programme sur mesure", "Planification manuelle"]
    : ["Suivi calories quotidien", "Suivi des macronutriments"];
  const locked     = isTraining
    ? ["Analyse morphologique complète", "Planning 6 semaines personnalisé"]
    : ["Analyse micronutriments", "Recettes & conseils personnalisés"];
  const btnBg      = isTraining
    ? "linear-gradient(135deg,#1D4ED8,#3B82F6)"
    : "linear-gradient(135deg,#059669,#10B981)";

  return (
    <div className="tap" onClick={onUnlock} style={{
      background: bg,
      border: `1px solid ${borderClr}`,
      borderRadius: 20,
      padding: "20px 20px 18px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Glow */}
      <div style={{
        position:"absolute", top:-50, right:-50,
        width:160, height:160,
        background:`radial-gradient(circle, ${accent}40 0%, transparent 70%)`,
        pointerEvents:"none",
      }}/>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"flex-start", marginBottom:16, position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:38, height:38, borderRadius:11,
            background:`${accent}20`,
            border:`1px solid ${accent}40`,
            display:"grid", placeItems:"center", flexShrink:0,
          }}>
            <I d={iconPath} size={17} color={accentLt} sw={2.2}/>
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em",
              textTransform:"uppercase", color:accentLt,
              fontFamily:FONT, marginBottom:2 }}>{eyebrow}</div>
            <div style={{ fontSize:17, fontWeight:700, color:"#F2F4F7",
              fontFamily:FONT, letterSpacing:-0.4, lineHeight:1 }}>{title}</div>
          </div>
        </div>
        <div style={{
          display:"flex", alignItems:"center", gap:4,
          background:`${accent}18`, border:`1px solid ${accent}30`,
          borderRadius:99, padding:"4px 10px",
        }}>
          <I d={ic.star} size={10} color={accentLt} sw={0} fill={accentLt}/>
          <span style={{ color:accentLt, fontSize:10.5, fontWeight:700,
            fontFamily:FONT, letterSpacing:"0.04em" }}>Premium</span>
        </div>
      </div>

      {/* Features */}
      <div style={{ display:"flex", flexDirection:"column", gap:8,
        marginBottom:16, position:"relative", zIndex:1 }}>
        {free.map(f => (
          <div key={f} style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{
              width:18, height:18, borderRadius:5, flexShrink:0,
              background:`${accent}20`, border:`1px solid ${accent}35`,
              display:"grid", placeItems:"center",
            }}>
              <I d={ic.check} size={10} color={accentLt} sw={2.8}/>
            </div>
            <span style={{ fontSize:13, color:"rgba(242,244,247,0.80)",
              fontFamily:FONT, fontWeight:500 }}>{f}</span>
          </div>
        ))}
        <div style={{ height:1, background:"rgba(255,255,255,0.06)", margin:"3px 0" }}/>
        {locked.map(f => (
          <div key={f} style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{
              width:18, height:18, borderRadius:5, flexShrink:0,
              background:"rgba(255,255,255,0.05)",
              display:"grid", placeItems:"center",
            }}>
              <I d={ic.lock} size={9} color="rgba(242,244,247,0.30)" sw={2}/>
            </div>
            <span style={{ fontSize:13, color:"rgba(242,244,247,0.30)",
              fontFamily:FONT, fontWeight:500 }}>{f}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button className="tap" onClick={e => { e.stopPropagation(); onUnlock(); }} style={{
        width:"100%", background:btnBg, border:"none",
        borderRadius:12, padding:"13px 16px",
        color:"#fff", fontSize:13.5, fontWeight:700,
        cursor:"pointer", letterSpacing:-0.2,
        display:"flex", alignItems:"center", justifyContent:"center", gap:6,
        fontFamily:FONT, position:"relative", zIndex:1,
      }}>
        Débloquer le pack <I d={ic.chev} size={13} color="#fff" sw={2.4}/>
      </button>
    </div>
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

  // Macros
  const consumed  = tot.cal || 0;
  const goal      = calObj || 1;
  const remaining = Math.max(goal - consumed, 0);
  const pct       = Math.min(consumed / goal, 1);
  const over      = consumed > goal;
  const r = 54, circum = 2 * Math.PI * r;

  const sectionTitle = (label) => (
    <div style={{
      fontSize:12, fontWeight:700, letterSpacing:"0.08em",
      textTransform:"uppercase", color:"rgba(242,244,247,0.35)",
      fontFamily:FONT, marginBottom:12,
    }}>{label}</div>
  );

  return (
    <div className="anim" style={{ padding:"0 16px 28px" }}>

      {/* ── GREETING ─────────────────────────────────────────── */}
      <div style={{ paddingTop:24, paddingBottom:20 }}>
        <div style={{ fontSize:11.5, color:"rgba(242,244,247,0.38)",
          fontFamily:FONT, marginBottom:6 }}>
          {today.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}
        </div>
        <div style={{ fontFamily:SERIF, fontSize:34, color:"#F2F4F7",
          letterSpacing:-1.2, lineHeight:1.05 }}>
          {profil.prenom
            ? <>Bonjour, <span style={{ fontStyle:"italic" }}>{profil.prenom}</span></>
            : <>Bonjour</>}
        </div>
        {prog && (
          <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
            <span style={{
              display:"inline-flex", alignItems:"center", gap:5,
              padding:"5px 11px", borderRadius:99,
              background:"rgba(59,130,246,0.10)",
              border:"1px solid rgba(59,130,246,0.20)",
              fontSize:11.5, color:"#93C5FD", fontWeight:600, fontFamily:FONT,
            }}>
              <span style={{ width:6, height:6, borderRadius:"50%",
                background:"#3B82F6", display:"inline-block" }}/>
              {obj?.l} · {prog?.jours?.length||0} séances/sem.
            </span>
            {cycleStart && jR !== null && (
              <span style={{
                display:"inline-flex", padding:"5px 11px", borderRadius:99,
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.10)",
                fontSize:11.5, color:"rgba(242,244,247,0.55)",
                fontWeight:600, fontFamily:FONT,
              }}>
                Cycle {(semC||0)+1} · J{jR}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── STREAK ───────────────────────────────────────────── */}
      {streak > 0 && (
        <div className="pop-in" style={{
          background:"#111827",
          border:"1px solid rgba(255,255,255,0.07)",
          borderRadius:16, padding:"13px 16px",
          display:"flex", alignItems:"center", gap:11, marginBottom:12,
        }}>
          <div style={{
            width:38, height:38, borderRadius:11, fontSize:18,
            background:"rgba(248,113,113,0.10)",
            border:"1px solid rgba(248,113,113,0.18)",
            display:"grid", placeItems:"center", flexShrink:0,
          }}>🔥</div>
          <div>
            <div style={{ fontFamily:FONT, fontWeight:700, fontSize:14, color:"#F2F4F7" }}>
              {streak} jour{streak > 1 ? "s" : ""} de suite
            </div>
            <div style={{ fontSize:12, color:"rgba(242,244,247,0.45)", marginTop:2, fontFamily:FONT }}>
              {streak >= 7 ? "Semaine parfaite !" : streak >= 3 ? "Continue comme ça !" : "Bonne lancée !"}
            </div>
          </div>
        </div>
      )}

      {/* ── CITATION ─────────────────────────────────────────── */}
      <div style={{
        background:"#111827",
        border:"1px solid rgba(255,255,255,0.07)",
        borderLeft:"3px solid #3B82F6",
        borderRadius:"0 14px 14px 0",
        padding:"13px 16px", marginBottom:12,
      }}>
        <div style={{
          fontSize:10, fontWeight:700, letterSpacing:"1.2px",
          textTransform:"uppercase", color:"#3B82F6",
          fontFamily:FONT, marginBottom:5,
        }}>Citation du jour</div>
        <div style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:14,
          color:"rgba(242,244,247,0.80)", lineHeight:1.6 }}>"{motiv}"</div>
      </div>

      {/* ── SÉANCE DU JOUR ───────────────────────────────────── */}
      {todaySess ? (
        <div style={{
          background:"linear-gradient(135deg,#1E40AF 0%,#2563EB 50%,#3B82F6 100%)",
          border:"1px solid rgba(255,255,255,0.15)",
          borderRadius:20, padding:"20px 20px 18px", marginBottom:12,
          position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:1,
            background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)" }}/>
          <div style={{ position:"absolute", top:-40, right:-40, width:130, height:130,
            borderRadius:"50%", background:"rgba(255,255,255,0.05)", pointerEvents:"none" }}/>
          <div style={{ display:"flex", alignItems:"center", gap:13, position:"relative" }}>
            <div style={{
              width:48, height:48, borderRadius:14,
              background:"rgba(255,255,255,0.15)",
              border:"1px solid rgba(255,255,255,0.22)",
              display:"grid", placeItems:"center", flexShrink:0,
            }}>
              <I d={ic.bolt} size={22} color="#fff" sw={2.2}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:"1.2px",
                textTransform:"uppercase", color:"rgba(255,255,255,0.65)",
                fontFamily:FONT, marginBottom:3 }}>Séance du jour</div>
              <div style={{ fontSize:18, fontWeight:700, color:"#fff",
                fontFamily:FONT, letterSpacing:-0.4 }}>{todaySess.nom}</div>
              {todaySess.intensite && (
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.60)",
                  marginTop:2, fontFamily:FONT }}>
                  {INT[todaySess.intensite]?.l} · ~60 min
                </div>
              )}
            </div>
          </div>
          <button className="tap" onClick={() => goProgram("today")} style={{
            marginTop:16, width:"100%", padding:"13px",
            borderRadius:12,
            background:"rgba(255,255,255,0.16)",
            border:"1px solid rgba(255,255,255,0.25)",
            color:"#fff", display:"flex", alignItems:"center",
            justifyContent:"center", gap:8,
            fontFamily:FONT, fontSize:14, fontWeight:700, cursor:"pointer",
          }}>
            <I d={ic.play} size={13} color="#fff" sw={0} fill="#fff"/>
            Démarrer la séance
          </button>
        </div>
      ) : !prog && (
        <div onClick={() => goProgram("creer")} className="tap" style={{
          background:"#111827",
          border:"1px solid rgba(255,255,255,0.07)",
          borderRadius:16, padding:"16px",
          cursor:"pointer", display:"flex",
          alignItems:"center", gap:12, marginBottom:12,
        }}>
          <div style={{ width:42, height:42, borderRadius:12,
            background:"rgba(59,130,246,0.10)",
            border:"1px solid rgba(59,130,246,0.20)",
            display:"grid", placeItems:"center", fontSize:20, flexShrink:0 }}>🏋️</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13.5, fontWeight:700, color:"#F2F4F7",
              fontFamily:FONT }}>Créer mon premier programme</div>
            <div style={{ fontSize:12, color:"rgba(242,244,247,0.45)",
              marginTop:2, fontFamily:FONT }}>Démarre en quelques secondes</div>
          </div>
          <I d={ic.chev} size={16} color="rgba(242,244,247,0.35)"/>
        </div>
      )}

      {/* ── ÉNERGIE DU JOUR ──────────────────────────────────── */}
      {profil.poids && profil.taille && profil.age && profil.sexe ? (
        <div style={{
          background:"#111827",
          border:"1px solid rgba(255,255,255,0.07)",
          borderRadius:20, padding:"18px 18px 16px", marginBottom:12,
        }}>
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:18 }}>
            <span style={{ fontSize:16, fontWeight:700, color:"#F2F4F7",
              fontFamily:FONT, letterSpacing:-0.3 }}>Énergie du jour</span>
            <button className="tap" onClick={() => setTab("nutrition")} style={{
              padding:"5px 10px", background:"rgba(255,255,255,0.04)",
              border:"1px solid rgba(255,255,255,0.07)", borderRadius:8,
              color:"rgba(242,244,247,0.45)", fontSize:11, fontFamily:FONT,
              cursor:"pointer", display:"flex", alignItems:"center", gap:3,
            }}>
              Voir <I d={ic.chev} size={11} sw={1.8}/>
            </button>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:18 }}>
            {/* Donut */}
            <div style={{ position:"relative", width:132, height:132, flexShrink:0 }}>
              <svg width="132" height="132" viewBox="0 0 132 132">
                <defs>
                  <linearGradient id="ringHome" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563EB"/>
                    <stop offset="100%" stopColor="#60A5FA"/>
                  </linearGradient>
                </defs>
                <g transform="rotate(-90 66 66)">
                  <circle cx="66" cy="66" r={r} fill="none"
                    stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
                  <circle cx="66" cy="66" r={r} fill="none"
                    stroke={over ? "#F87171" : "url(#ringHome)"}
                    strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={circum}
                    strokeDashoffset={circum * (1 - pct)}
                    style={{ transition:"stroke-dashoffset 1s ease" }}/>
                </g>
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex",
                flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <div style={{ fontSize:9, fontWeight:700,
                  color:"rgba(242,244,247,0.35)", letterSpacing:"1px",
                  textTransform:"uppercase", fontFamily:FONT, marginBottom:3 }}>
                  {over ? "Dépassé" : "Restant"}
                </div>
                <div style={{ fontFamily:SERIF, fontSize:30,
                  color: over ? "#F87171" : "#F2F4F7",
                  lineHeight:1, ...NUM }}>
                  {over ? consumed - goal : remaining}
                </div>
                <div style={{ fontSize:10, color:"rgba(242,244,247,0.40)",
                  fontFamily:FONT, marginTop:2 }}>kcal</div>
              </div>
            </div>

            {/* Macros */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:13 }}>
              <MacroBar label="Protéines" value={tot.p||0} goal={pObj}
                color="#3B82F6" unit="g"/>
              <MacroBar label="Glucides"  value={tot.g||0} goal={gObj}
                color="#22D3EE" unit="g"/>
              <MacroBar label="Lipides"   value={tot.l||0} goal={lObj}
                color="#34D399" unit="g"/>
            </div>
          </div>
        </div>
      ) : (
        <div onClick={() => setTab("profile")} className="tap" style={{
          background:"#111827",
          border:"1px solid rgba(255,255,255,0.07)",
          borderRadius:16, padding:"16px",
          cursor:"pointer", display:"flex",
          alignItems:"center", gap:12, marginBottom:12,
        }}>
          <div style={{ width:42, height:42, borderRadius:12,
            background:"rgba(59,130,246,0.10)",
            border:"1px solid rgba(59,130,246,0.20)",
            display:"grid", placeItems:"center", fontSize:20, flexShrink:0 }}>👤</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13.5, fontWeight:700, color:"#F2F4F7",
              fontFamily:FONT }}>Compléter mon profil</div>
            <div style={{ fontSize:12, color:"rgba(242,244,247,0.45)",
              marginTop:2, fontFamily:FONT }}>
              Pour voir tes calories et macros personnalisées
            </div>
          </div>
          <I d={ic.chev} size={16} color="rgba(242,244,247,0.35)"/>
        </div>
      )}

      {/* ── HYDRATATION ──────────────────────────────────────── */}
      <div style={{
        background:"#111827",
        border:"1px solid rgba(255,255,255,0.07)",
        borderRadius:20, padding:"18px 18px 16px", marginBottom:28,
      }}>
        <div style={{ display:"flex", alignItems:"center",
          justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:36, height:36, borderRadius:10,
              background:"rgba(52,211,153,0.10)",
              border:"1px solid rgba(52,211,153,0.18)",
              display:"grid", placeItems:"center", flexShrink:0,
            }}>
              <I d={ic.drop} size={16} color="#34D399" sw={2}/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:"1.2px",
                textTransform:"uppercase", color:"rgba(242,244,247,0.38)",
                fontFamily:FONT, marginBottom:2 }}>Hydratation</div>
              <div style={{ fontFamily:FONT, fontWeight:700, fontSize:14,
                color:"#F2F4F7", ...NUM }}>
                {(eau * 0.25).toFixed(2).replace(".", ",")} L
                <span style={{ fontSize:11.5, color:"rgba(242,244,247,0.38)",
                  marginLeft:6, fontWeight:500 }}>{eau}/8 verres</span>
              </div>
            </div>
          </div>
          <button className="tap" onClick={() => setEau(e => Math.min(8, e + 1))} style={{
            padding:"7px 12px", borderRadius:9,
            background:"rgba(52,211,153,0.08)",
            border:"1px solid rgba(52,211,153,0.20)",
            color:"#34D399", fontSize:11.5, fontWeight:700,
            fontFamily:FONT, cursor:"pointer",
            display:"flex", alignItems:"center", gap:4,
          }}>
            <I d={ic.plus} size={10} color="#34D399" sw={2.4}/>250ml
          </button>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {Array.from({ length:8 }).map((_, i) => {
            const on = i < eau;
            return (
              <button key={i} onClick={() => setEau(i + 1 === eau ? i : i + 1)}
                className="tap" style={{
                  flex:1, height:18, borderRadius:5, padding:0,
                  background: on ? "#3B82F6" : "rgba(255,255,255,0.05)",
                  border:`1px solid ${on ? "rgba(59,130,246,0.40)" : "rgba(255,255,255,0.07)"}`,
                  transition:"background .15s",
                }}/>
            );
          })}
        </div>
      </div>

      {/* ── MES PROGRAMMES ───────────────────────────────────── */}
      <div style={{ marginBottom:8 }}>
        <div style={{ marginBottom:5 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.09em",
            textTransform:"uppercase", color:"rgba(242,244,247,0.35)",
            fontFamily:FONT, marginBottom:4 }}>Passer au niveau supérieur</div>
          <div style={{ fontSize:22, fontWeight:700, color:"#F2F4F7",
            fontFamily:FONT, letterSpacing:-0.6, marginBottom:14 }}>Mes programmes</div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <PackCard type="training" onUnlock={() => setPaywall(true)}/>
          <PackCard type="nutrition" onUnlock={() => setPaywall(true)}/>
        </div>
      </div>

    </div>
  );
}
