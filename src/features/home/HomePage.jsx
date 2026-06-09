import { useState } from "react";
import { C, INT, FONT, SERIF, NUM } from "../../data/constants.js";
import { Card, Eyebrow, Pill, Bar } from "../../components/ui/index.jsx";

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
  drop:     <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/>,
  lock:     <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
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
          <span style={{ fontSize:12.5, color:"#374151",
            fontFamily:FONT, fontWeight:500 }}>{label}</span>
        </div>
        <div style={{ display:"flex", alignItems:"baseline", gap:3 }}>
          <span style={{ fontSize:13, fontWeight:700, color:"${C.text}",
            fontFamily:FONT, ...NUM }}>{value}</span>
          <span style={{ fontSize:11, color:"#6B7280",
            fontFamily:FONT }}>/ {goal}{unit}</span>
        </div>
      </div>
      <div style={{ height:3, background:"rgba(0,0,0,0.06)", borderRadius:99 }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color,
          borderRadius:99, transition:"width .6s ease" }}/>
      </div>
    </div>
  );
}

// ─── Pack Premium Card ────────────────────────────────────────────────────
function PackCard({ type, onUnlock }) {
  const isTraining = type === "training";
  const accent     = isTraining ? "#2563EB" : "#059669";
  const accentLt   = isTraining ? "#DBEAFE" : "#D1FAE5";
  const accentTxt  = isTraining ? "#1D4ED8" : "#065F46";
  const bg         = "#FFFFFF";
  const borderClr  = isTraining ? "rgba(59,130,246,0.30)" : "rgba(16,185,129,0.30)";
  const iconPath   = isTraining
    ? <path d="M6.5 6.5 17.5 17.5M4 8l4-4M16 20l4-4M2 10l2-2M20 16l2-2M9 4l3 3M15 17l3 3"/>
    : <><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>;
  const title      = isTraining ? "Entraînement Pro" : "Nutrition Pro";
  const locked     = isTraining
    ? [
        "Programme sur mesure selon ta morphologie",
        "Planification 6 semaines optimisée",
        "Analyse morphologique complète",
        "Bilan de progression toutes les 2 semaines",
      ]
    : [
        "+500 recettes premium complètes",
        "Conseils nutritionnels personnalisés",
        "Estimation macros par photo de repas",
        "Bilan nutritionnel bi-mensuel",
      ];
  const btnBg      = isTraining
    ? "linear-gradient(135deg,#1D4ED8,#3B82F6)"
    : "linear-gradient(135deg,#059669,#10B981)";

  return (
    <Card onClick={onUnlock} className="tap" padding="none" style={{
      background: bg,
      border: `1px solid ${borderClr}`,
      boxShadow: `0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px ${borderClr}`,
      padding: "20px 20px 18px",
      position: "relative",
      overflow: "hidden",
      marginBottom: 0,
    }}>
      {/* Bande colorée en haut */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:4,
        background: isTraining
          ? "linear-gradient(90deg,#2563EB,#3B82F6)"
          : "linear-gradient(90deg,#059669,#10B981)",
        borderRadius:"18px 18px 0 0",
      }}/>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"flex-start", marginBottom:14, marginTop:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:40, height:40, borderRadius:12,
            background: accentLt,
            border:`1px solid ${borderClr}`,
            display:"grid", placeItems:"center", flexShrink:0,
          }}>
            <I d={iconPath} size={18} color={accentTxt} sw={2.2}/>
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:accent,
              letterSpacing:"1px", textTransform:"uppercase",
              fontFamily:FONT, marginBottom:2 }}>Pack</div>
            <div style={{ fontSize:17, fontWeight:700, color:"#0F1923",
              fontFamily:FONT, letterSpacing:-0.4, lineHeight:1 }}>{title}</div>
          </div>
        </div>
        <div style={{
          padding:"4px 10px", borderRadius:99,
          background: accentLt,
          border:`1px solid ${borderClr}`,
          fontSize:10, fontWeight:700, color:accentTxt,
          display:"flex", alignItems:"center", gap:4, flexShrink:0,
        }}>
          <I d={ic.star} size={10} color={accentTxt} sw={0} fill={accentTxt}/>
          Premium
        </div>
      </div>

      {/* Features */}
      <div style={{ display:"flex", flexDirection:"column", gap:8,
        marginBottom:16 }}>
        {locked.map(f => (
          <div key={f} style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{
              width:18, height:18, borderRadius:5, flexShrink:0,
              background: accentLt,
              border:`1px solid ${borderClr}`,
              display:"grid", placeItems:"center",
            }}>
              <I d={ic.lock} size={9} color={accentTxt} sw={2}/>
            </div>
            <span style={{ fontSize:13, color:"#374151",
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
        fontFamily:FONT,
        boxShadow: isTraining
          ? "0 4px 14px rgba(37,99,235,0.35)"
          : "0 4px 14px rgba(5,150,105,0.35)",
      }}>
        Débloquer le pack <I d={ic.chev} size={13} color="#fff" sw={2.4}/>
      </button>
    </Card>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────
export default function Home(props) {
  const { profil, prog, cycleStart, setTab, premium, setPaywall, setPaywallNutrition, push, eau, setEau, weightLog, setWeightLog, lastWeighIn, setLastWeighIn, calSess, imc, obj, calObj, pObj, lObj, gObj, totR, jR, cPct, semC, getStreak, INT, MOTIVATIONS } = props;

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

  // Macros
  const consumed  = tot.cal || 0;
  const goal      = calObj || 1;
  const remaining = Math.max(goal - consumed, 0);
  const pct       = Math.min(consumed / goal, 1);
  const over      = consumed > goal;
  const r = 54, circum = 2 * Math.PI * r;

  return (
    <div className="anim" style={{ padding:"0 16px 28px" }}>

      {/* ── GREETING ─────────────────────────────────────────── */}
      <div style={{ paddingTop:24, paddingBottom:20 }}>
        <div style={{ fontSize:11.5, color:"${C.dim}",
          fontFamily:FONT, marginBottom:6 }}>
          {today.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}
        </div>
        <div style={{ fontFamily:SERIF, fontSize:34, color:"${C.text}",
          letterSpacing:-1.2, lineHeight:1.05 }}>
          {profil.prenom
            ? <>Bonjour, <span style={{ fontStyle:"italic" }}>{profil.prenom}</span></>
            : <>Bonjour</>}
        </div>
        {prog && (
          <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
            <Pill color="#3B82F6" dot style={{ color:"#93C5FD", background:"rgba(59,130,246,0.10)", border:"1px solid rgba(59,130,246,0.20)" }}>
              {obj?.l} · {prog?.jours?.length||0} séances/sem.
            </Pill>
            {cycleStart && jR !== null && (
              <span style={{
                display:"inline-flex", padding:"5px 11px", borderRadius:99,
                background:"rgba(0,0,0,0.04)",
                border:"1px solid rgba(0,0,0,0.07)",
                fontSize:11.5, color:"#374151",
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
        <Card className="pop-in" padding="none" style={{
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
            <div style={{ fontFamily:FONT, fontWeight:700, fontSize:14, color:"${C.text}" }}>
              {streak} jour{streak > 1 ? "s" : ""} de suite
            </div>
            <div style={{ fontSize:12, color:"#374151", marginTop:2, fontFamily:FONT }}>
              {streak >= 7 ? "Semaine parfaite !" : streak >= 3 ? "Continue comme ça !" : "Bonne lancée !"}
            </div>
          </div>
        </Card>
      )}

      {/* ── CITATION ─────────────────────────────────────────── */}
      <Card padding="none" style={{
        borderLeft:"3px solid #3B82F6",
        borderRadius:"0 14px 14px 0",
        padding:"13px 16px", marginBottom:12,
      }}>
        <Eyebrow color="#3B82F6" style={{ letterSpacing:"1.2px", marginBottom:5 }}>Citation du jour</Eyebrow>
        <div style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:14,
          color:"#0F1923", lineHeight:1.6 }}>"{motiv}"</div>
      </Card>

      {/* ── SÉANCE DU JOUR ───────────────────────────────────── */}
      {todaySess ? (
        <Card padding="none" style={{
          background:"linear-gradient(135deg,#1E40AF 0%,#2563EB 50%,#3B82F6 100%)",
          border:"1px solid rgba(0,0,0,0.09)",
          borderRadius:20, padding:"20px 20px 18px", marginBottom:12,
          position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:1,
            background:"linear-gradient(90deg,transparent,rgba(0,0,0,0.12),transparent)" }}/>
          <div style={{ position:"absolute", top:-40, right:-40, width:130, height:130,
            borderRadius:"50%", background:"rgba(0,0,0,0.04)", pointerEvents:"none" }}/>
          <div style={{ display:"flex", alignItems:"center", gap:13, position:"relative" }}>
            <div style={{
              width:48, height:48, borderRadius:14,
              background:"rgba(0,0,0,0.09)",
              border:"1px solid rgba(0,0,0,0.11)",
              display:"grid", placeItems:"center", flexShrink:0,
            }}>
              <I d={ic.bolt} size={22} color="#fff" sw={2.2}/>
            </div>
            <div style={{ flex:1 }}>
              <Eyebrow color="rgba(0,0,0,0.33)" style={{ letterSpacing:"1.2px", marginBottom:3 }}>Séance du jour</Eyebrow>
              <div style={{ fontSize:18, fontWeight:700, color:"#fff",
                fontFamily:FONT, letterSpacing:-0.4 }}>{todaySess.nom}</div>
              {todaySess.intensite && (
                <div style={{ fontSize:12, color:"rgba(0,0,0,0.3)",
                  marginTop:2, fontFamily:FONT }}>
                  {INT[todaySess.intensite]?.l} · ~60 min
                </div>
              )}
            </div>
          </div>
          <button className="tap" onClick={() => goProgram("today")} style={{
            marginTop:16, width:"100%", padding:"13px",
            borderRadius:12,
            background:"rgba(0,0,0,0.08)",
            border:"1px solid rgba(0,0,0,0.12)",
            color:"#fff", display:"flex", alignItems:"center",
            justifyContent:"center", gap:8,
            fontFamily:FONT, fontSize:14, fontWeight:700, cursor:"pointer",
          }}>
            <I d={ic.play} size={13} color="#fff" sw={0} fill="#fff"/>
            Démarrer la séance
          </button>
        </Card>
      ) : !prog && (
        <Card onClick={() => goProgram("creer")} className="tap" padding="none" style={{
          borderRadius:16, padding:"16px",
          display:"flex", alignItems:"center", gap:12, marginBottom:12,
        }}>
          <div style={{ width:42, height:42, borderRadius:12,
            background:"rgba(59,130,246,0.10)",
            border:"1px solid rgba(59,130,246,0.20)",
            display:"grid", placeItems:"center", fontSize:20, flexShrink:0 }}>🏋️</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13.5, fontWeight:700, color:"${C.text}",
              fontFamily:FONT }}>Créer mon premier programme</div>
            <div style={{ fontSize:12, color:"#374151",
              marginTop:2, fontFamily:FONT }}>Démarre en quelques secondes</div>
          </div>
          <I d={ic.chev} size={16} color="${C.dim}"/>
        </Card>
      )}

      {/* ── ÉNERGIE DU JOUR ──────────────────────────────────── */}
      {profil.poids && profil.taille && profil.age && profil.sexe ? (
        <Card padding="none" style={{
          borderRadius:20, padding:"18px 18px 16px", marginBottom:28,
        }}>
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:18 }}>
            <span style={{ fontSize:16, fontWeight:700, color:"${C.text}",
              fontFamily:FONT, letterSpacing:-0.3 }}>Énergie du jour</span>
            <button className="tap" onClick={() => setTab("nutrition")} style={{
              padding:"5px 10px", background:"rgba(0,0,0,0.03)",
              border:"1px solid rgba(0,0,0,0.06)", borderRadius:8,
              color:"#374151", fontSize:11, fontFamily:FONT,
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
                    stroke="rgba(0,0,0,0.05)" strokeWidth="7"/>
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
                <Eyebrow style={{ fontSize:9, letterSpacing:"1px", marginBottom:3, color:"${C.dim}" }}>
                  {over ? "Dépassé" : "Restant"}
                </Eyebrow>
                <div style={{ fontFamily:SERIF, fontSize:30,
                  color: over ? "#F87171" : "${C.text}",
                  lineHeight:1, ...NUM }}>
                  {over ? consumed - goal : remaining}
                </div>
                <div style={{ fontSize:10, color:"#374151",
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
        </Card>
      ) : (
        <Card onClick={() => setTab("profile")} className="tap" padding="none" style={{
          borderRadius:16, padding:"16px",
          display:"flex", alignItems:"center", gap:12, marginBottom:12,
        }}>
          <div style={{ width:42, height:42, borderRadius:12,
            background:"rgba(59,130,246,0.10)",
            border:"1px solid rgba(59,130,246,0.20)",
            display:"grid", placeItems:"center", fontSize:20, flexShrink:0 }}>👤</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13.5, fontWeight:700, color:"${C.text}",
              fontFamily:FONT }}>Compléter mon profil</div>
            <div style={{ fontSize:12, color:"#374151",
              marginTop:2, fontFamily:FONT }}>
              Pour voir tes calories et macros personnalisées
            </div>
          </div>
          <I d={ic.chev} size={16} color="${C.dim}"/>
        </Card>
      )}

      {/* ── MES PROGRAMMES ───────────────────────────────────── */}
      <div style={{ marginBottom:8 }}>
        <div style={{ marginBottom:5 }}>
          <Eyebrow style={{ fontSize:11, letterSpacing:"0.09em", marginBottom:4 }}>Passer au niveau supérieur</Eyebrow>
          <div style={{ fontSize:22, fontWeight:700, color:"${C.text}",
            fontFamily:FONT, letterSpacing:-0.6, marginBottom:14 }}>Mes programmes</div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <PackCard type="training"  onUnlock={() => setPaywall(true)}/>
          <PackCard type="nutrition" onUnlock={() => setPaywallNutrition(true)}/>
        </div>
      </div>

    </div>
  );
}
