import { useState } from "react";
import { C, INT } from "../../data/constants.js";
import { Btn, Inp, Row } from "../../components/ui/index.jsx";

const FONT   = "'Outfit','DM Sans',system-ui,sans-serif";
const SERIF  = "'DM Serif Display','Georgia',serif";
const NUM    = { fontVariantNumeric:"tabular-nums", fontFeatureSettings:'"tnum"' };

// ─── Carte de surface réutilisable ──────────────────────────────────────
const card = {
  background:C.s1,
  border:`1px solid ${C.bd}`,
  borderRadius:18,
  boxShadow:"0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)",
};

// ─── Icône SVG simple ────────────────────────────────────────────────────
function I({ d, size=18, color="currentColor", sw=1.7 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}

const icons = {
  bolt:     <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>,
  plus:     <path d="M12 5v14M5 12h14"/>,
  chev:     <path d="m9 6 6 6-6 6"/>,
  play:     <path d="m8 5 12 7-12 7z" fill="currentColor" stroke="none"/>,
  arrowUp:  <path d="m6 14 6-6 6 6"/>,
  arrowDn:  <path d="m6 10 6 6 6-6"/>,
  flame:    <path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-5M12 21a6 6 0 0 0 6-6c0-3-2-5-3-6 0 3-2 4-3 4s-3-1-3-4c-1 1-3 3-3 6a6 6 0 0 0 6 6Z"/>,
  star:     <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
  cpu:      <><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/></>,
  gym:      <><path d="M6.5 6.5 17.5 17.5M4 8l4-4M16 20l4-4M2 10l2-2M20 16l2-2M9 4l3 3M15 17l3 3"/></>,
  drop:     <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/>,
};

// ─── Sparkline ───────────────────────────────────────────────────────────
function Sparkline({ data, width=260, height=48, color }) {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    height - ((v - min) / range) * (height - 6) - 3,
  ]);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]} ${p[1]}` : `L${p[0]} ${p[1]}`)).join(" ");
  const fillD = `${d} L${width} ${height} L0 ${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
         style={{ width:"100%", height, display:"block" }}>
      <defs>
        <linearGradient id="spkF2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={fillD} fill="url(#spkF2)"/>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p, i) => i === pts.length - 1 && (
        <circle key={i} cx={p[0]} cy={p[1]} r={3} fill={color}/>
      ))}
    </svg>
  );
}

// ─── Stat horizontale compacte ───────────────────────────────────────────
function StatRow({ label, value, unit, color }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0",
      borderBottom:`1px solid ${C.bd}` }}>
      <span style={{ fontSize:13, color:C.mid, fontFamily:FONT }}>{label}</span>
      <span style={{ fontFamily:FONT, fontSize:14, fontWeight:600, color:color||C.text, ...NUM }}>
        {value}<span style={{ fontSize:11, color:C.dim, marginLeft:3 }}>{unit}</span>
      </span>
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
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  const today    = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const todaySess  = calSess[todayKey];
  const dayOfYear  = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000*60*60*24));
  const motiv      = MOTIVATIONS[dayOfYear % MOTIVATIONS.length];
  const streak     = getStreak;
  const tot        = totR;

  const todayD       = new Date();
  const daysSinceLast = lastWeighIn ? Math.floor((todayD - new Date(lastWeighIn)) / (1000*60*60*24)) : 999;
  const canWeighIn   = daysSinceLast >= 14;
  const lastWeight   = weightLog.length > 0 ? weightLog[weightLog.length - 1] : null;
  const firstWeight  = weightLog.length > 1 ? weightLog[0] : null;
  const diff         = lastWeight && firstWeight ? (lastWeight.v - firstWeight.v).toFixed(1) : null;

  return (
    <div className="anim" style={{ padding:"0 16px 20px" }}>

      {/* ── Greeting ── */}
      <div style={{ paddingTop:22, paddingBottom:18 }}>
        <div style={{ fontSize:11.5, color:C.mid, fontFamily:FONT, marginBottom:6 }}>
          {today.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}
        </div>
        <div style={{ fontFamily:SERIF, fontSize:30, fontWeight:400, color:C.text, letterSpacing:-0.8, lineHeight:1.15 }}>
          {profil.prenom
            ? <>Bonjour, <span style={{ fontStyle:"italic" }}>{profil.prenom}</span></>
            : <>Bonjour </>}
        </div>
        {prog && (
          <div style={{
            marginTop:8, display:"inline-flex", alignItems:"center", gap:6,
            padding:"4px 10px", borderRadius:8,
            background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.20)",
            fontSize:11.5, color:C.accentLt, fontFamily:FONT, fontWeight:500,
          }}>
            {obj.l} · {prog?.jours?.length || 0} séances/sem.
          </div>
        )}
      </div>

      {/* ── Streak ── */}
      {streak > 0 && (
        <div className="pop-in" style={{
          ...card, padding:"12px 14px", marginBottom:12,
          display:"flex", alignItems:"center", gap:10,
        }}>
          <div style={{
            width:36, height:36, borderRadius:10,
            background:"rgba(248,113,113,0.10)",
            border:"1px solid rgba(248,113,113,0.18)",
            display:"grid", placeItems:"center", fontSize:18,
          }}>🔥</div>
          <div>
            <div style={{ fontFamily:FONT, fontWeight:700, fontSize:14, color:C.text }}>
              {streak} jour{streak > 1 ? "s" : ""} de suite
            </div>
            <div style={{ fontSize:12, color:C.mid, marginTop:1 }}>
              {streak >= 7 ? "Semaine parfaite !" : streak >= 3 ? "Continue comme ça !" : "Bonne lancée !"}
            </div>
          </div>
        </div>
      )}

      {/* ── Citation ── */}
      <div style={{
        ...card, padding:"14px 16px", marginBottom:12,
        borderLeft:`3px solid ${C.accent}`,
      }}>
        <div style={{ fontSize:11, color:C.accent, fontFamily:FONT, fontWeight:600,
          letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:6 }}>
          Citation du jour
        </div>
        <div style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:14.5, color:C.text,
          lineHeight:1.55, letterSpacing:-0.1 }}>
          "{motiv}"
        </div>
      </div>

      {/* ── Séance du jour ── */}
      {todaySess && (
        <div style={{ ...card, padding:18, marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{
              width:44, height:44, borderRadius:12,
              background:C.accent, display:"grid", placeItems:"center",
              boxShadow:"0 4px 12px rgba(59,130,246,0.30)",
              flexShrink:0,
            }}>
              <I d={icons.bolt} size={20} color="#fff" sw={2}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10.5, color:C.mid, fontFamily:FONT, fontWeight:500,
                letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:3 }}>
                Séance du jour
              </div>
              <div style={{ fontFamily:FONT, fontSize:16, fontWeight:700, color:C.text }}>
                {todaySess.nom}
              </div>
              {todaySess.intensite && (
                <div style={{ fontSize:12, color:C.mid, marginTop:2 }}>
                  {INT[todaySess.intensite]?.l}
                </div>
              )}
            </div>
          </div>
          <button className="tap" onClick={() => goProgram("today")} style={{
            marginTop:14, width:"100%", padding:"12px 16px",
            background:C.accent, border:"none", borderRadius:12,
            color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
            gap:8, fontFamily:FONT, fontSize:14, fontWeight:600,
            boxShadow:"0 4px 12px rgba(59,130,246,0.30)", cursor:"pointer",
          }}>
            <I d={icons.play} size={13} color="#fff"/>Démarrer la séance
          </button>
        </div>
      )}

      {/* ── Progression du cycle ── */}
      {cycleStart && (
        <div style={{ ...card, padding:18, marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div>
              <div style={{ fontSize:10.5, color:C.mid, fontFamily:FONT, fontWeight:500,
                letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:4 }}>
                Cycle · Semaine {(semC || 0) + 1}/6
              </div>
              <div style={{ fontFamily:FONT, fontSize:16, fontWeight:700, color:C.text }}>
                {prog?.titre}
              </div>
            </div>
            <div style={{ fontFamily:SERIF, fontSize:34, color:C.text, letterSpacing:-1, ...NUM }}>
              {jR}<span style={{ fontSize:12, color:C.dim, marginLeft:2 }}>j</span>
            </div>
          </div>
          {/* Barre */}
          <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
            <div style={{
              height:"100%", width:`${Math.min(100, cPct || 0)}%`,
              background:C.accent, borderRadius:3, transition:"width .5s ease",
            }}/>
          </div>
          {/* Semaines */}
          <div style={{ display:"flex", gap:4, marginTop:10 }}>
            {[0,1,2,3,4,5].map(w => (
              <div key={w} style={{
                flex:1, height:3, borderRadius:2,
                background: w <= semC ? C.accent : "rgba(255,255,255,0.06)",
                transition:"background .3s",
              }}/>
            ))}
          </div>
        </div>
      )}

      {/* ── Énergie / Macros ── */}
      {profil.poids && profil.taille && profil.age && profil.sexe ? (() => {
        const consumed  = tot.cal || 0;
        const goal      = calObj || 1;
        const remaining = Math.max(goal - consumed, 0);
        const pct       = Math.min(consumed / goal, 1);
        const over      = consumed > goal;
        const r = 66, circum = 2 * Math.PI * r;
        return (
          <div style={{ ...card, padding:18, marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontFamily:FONT, fontSize:15, fontWeight:700, color:C.text }}>Énergie du jour</div>
              <button className="tap" onClick={() => setTab("nutrition")} style={{
                padding:"5px 10px", background:"rgba(255,255,255,0.04)",
                border:`1px solid ${C.bd}`, borderRadius:8,
                color:C.mid, fontSize:11, fontFamily:FONT, cursor:"pointer",
                display:"flex", alignItems:"center", gap:4,
              }}>
                Voir <I d={icons.chev} size={11} sw={1.8}/>
              </button>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              {/* Anneau compact */}
              <div style={{ position:"relative", width:160, height:160, flexShrink:0 }}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <g transform="rotate(-90 80 80)">
                    <circle cx="80" cy="80" r={r} fill="none"
                      stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
                    <circle cx="80" cy="80" r={r} fill="none"
                      stroke={over ? C.red : C.accent} strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circum}
                      strokeDashoffset={circum * (1 - pct)}
                      style={{ transition:"stroke-dashoffset 1s ease" }}/>
                  </g>
                </svg>
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center" }}>
                  <div style={{ fontSize:9.5, color:C.dim, fontFamily:FONT, letterSpacing:"0.8px",
                    textTransform:"uppercase", marginBottom:2 }}>
                    {over ? "Dépassé" : "Restant"}
                  </div>
                  <div style={{ fontFamily:SERIF, fontSize:34, color:over ? C.red : C.text,
                    lineHeight:1, ...NUM }}>
                    {over ? consumed - goal : remaining}
                  </div>
                  <div style={{ fontSize:10, color:C.mid, fontFamily:FONT, marginTop:2 }}>kcal</div>
                </div>
              </div>
              {/* Macros */}
              <div style={{ flex:1 }}>
                {[
                  { label:"Apport", value:consumed, unit:"kcal", sub:`/${goal}` },
                  { label:"Protéines", value:tot.p||0, unit:"g", sub:`/${pObj}g` },
                  { label:"Glucides",  value:tot.g||0, unit:"g", sub:`/${gObj}g` },
                ].map(m => (
                  <div key={m.label} style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"baseline", marginBottom:4 }}>
                      <span style={{ fontSize:11.5, color:C.mid, fontFamily:FONT }}>{m.label}</span>
                      <span style={{ fontSize:13, fontWeight:600, color:C.text, fontFamily:FONT, ...NUM }}>
                        {m.value}<span style={{ fontSize:10, color:C.dim }}>{m.unit}</span>
                        <span style={{ fontSize:10, color:C.dim }}>{m.sub}</span>
                      </span>
                    </div>
                    <div style={{ height:3, background:"rgba(255,255,255,0.06)", borderRadius:2 }}>
                      <div style={{
                        height:"100%",
                        width:`${Math.min(100, (m.value / (parseInt(m.sub.replace("/","").replace("g","")) || 1)) * 100)}%`,
                        background:C.accent, borderRadius:2, transition:"width .5s",
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })() : (
        <div onClick={() => setTab("profile")} className="tap" style={{
          ...card, padding:16, marginBottom:12,
          cursor:"pointer", display:"flex", alignItems:"center", gap:12,
        }}>
          <div style={{
            width:40, height:40, borderRadius:11, fontSize:18,
            background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.18)",
            display:"grid", placeItems:"center",
          }}>👤</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13.5, fontWeight:600, color:C.text, fontFamily:FONT }}>
              Compléter mon profil
            </div>
            <div style={{ fontSize:12, color:C.mid, marginTop:2, lineHeight:1.4 }}>
              Pour voir tes calories et macros personnalisées
            </div>
          </div>
          <I d={icons.chev} size={16} color={C.dim}/>
        </div>
      )}

      {/* ── Hydratation ── */}
      <div style={{ ...card, padding:"14px 16px", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:34, height:34, borderRadius:10, fontSize:16,
              background:"rgba(52,211,153,0.10)", border:"1px solid rgba(52,211,153,0.18)",
              display:"grid", placeItems:"center",
            }}>
              <I d={icons.drop} size={16} color={C.green} sw={2}/>
            </div>
            <div>
              <div style={{ fontSize:11.5, color:C.mid, fontFamily:FONT }}>Hydratation</div>
              <div style={{ fontFamily:FONT, fontWeight:700, fontSize:14, color:C.text, ...NUM, marginTop:1 }}>
                {(eau * 0.25).toFixed(2).replace(".", ",")} L
                <span style={{ fontSize:11, color:C.dim, marginLeft:5, fontWeight:400 }}>{eau}/8 verres</span>
              </div>
            </div>
          </div>
          <button className="tap" onClick={() => setEau(e => Math.min(8, e + 1))} style={{
            padding:"7px 12px", borderRadius:9,
            background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.20)",
            color:C.green, fontSize:11.5, fontWeight:600, fontFamily:FONT,
            cursor:"pointer", display:"flex", alignItems:"center", gap:4,
          }}>
            <I d={icons.plus} size={11} color={C.green} sw={2.2}/>250ml
          </button>
        </div>
        <div style={{ display:"flex", gap:3 }}>
          {Array.from({ length:8 }).map((_, i) => {
            const on = i < eau;
            return (
              <button key={i} onClick={() => setEau(i + 1 === eau ? i : i + 1)} className="tap" style={{
                flex:1, height:16, borderRadius:4, padding:0,
                background: on ? C.green : "rgba(255,255,255,0.05)",
                border:`1px solid ${on ? "rgba(52,211,153,0.40)" : C.bd}`,
                transition:"background .15s",
              }}/>
            );
          })}
        </div>
      </div>

      {/* ── Accès rapide ── */}
      <div style={{ marginBottom:12 }}>
        <div style={{ fontFamily:FONT, fontSize:14, fontWeight:700, color:C.text, marginBottom:10 }}>
          Accès rapide
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {[
            { icon:"bolt",     l:"Séance du jour",  sub:"Exercices", fn:()=>goProgram("today") },
            { icon:"calendar", l:"Calendrier",       sub:"Planification", fn:()=>goProgram("calendar") },
            { icon:"cpu",      l:"Coach IA",         sub:"Programme sur-mesure", prem:true, fn:()=>{ if (!premium) setPaywall(true); else goProgram("analyse"); } },
            { icon:"gym",      l:"Créer",            sub:"Programme manuel", fn:()=>goProgram("creer") },
          ].map((a, i) => (
            <button key={i} className="tap" onClick={a.fn} style={{
              padding:"14px 14px", borderRadius:16, textAlign:"left",
              background: a.prem ? "rgba(59,130,246,0.06)" : C.s1,
              border:`1px solid ${a.prem ? "rgba(59,130,246,0.20)" : C.bd}`,
              color:C.text, display:"flex", flexDirection:"column", gap:8,
              minHeight:100, position:"relative", overflow:"hidden",
              boxShadow:"0 1px 3px rgba(0,0,0,0.20)", cursor:"pointer",
            }}>
              <div style={{
                width:34, height:34, borderRadius:10,
                background:"rgba(59,130,246,0.10)", border:"1px solid rgba(59,130,246,0.18)",
                display:"grid", placeItems:"center",
              }}>
                <I d={icons[a.icon]} size={16} color={C.accent} sw={1.9}/>
              </div>
              <div>
                <div style={{ fontFamily:FONT, fontSize:12.5, fontWeight:700, color:C.text, display:"flex", alignItems:"center", gap:6 }}>
                  {a.l}
                  {a.prem && (
                    <span style={{
                      padding:"1px 5px", borderRadius:4,
                      background:"rgba(59,130,246,0.15)", fontSize:8.5,
                      color:C.accentLt, fontWeight:700, letterSpacing:"0.5px",
                    }}>PRO</span>
                  )}
                </div>
                <div style={{ fontSize:11, color:C.dim, marginTop:2, fontFamily:FONT }}>{a.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Suivi du poids ── */}
      <div style={{ ...card, padding:18, marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:FONT }}>Suivi du poids</div>
            {lastWeight && (
              <div style={{ display:"flex", alignItems:"baseline", gap:4, marginTop:8 }}>
                <span style={{ fontFamily:SERIF, fontSize:32, color:C.text, letterSpacing:-1, ...NUM }}>{lastWeight.v}</span>
                <span style={{ fontSize:12, color:C.mid, fontFamily:FONT }}>kg</span>
              </div>
            )}
            {diff && (
              <div style={{
                marginTop:6, display:"inline-flex", alignItems:"center", gap:4,
                padding:"3px 8px", borderRadius:6,
                background: parseFloat(diff) > 0 ? "rgba(248,113,113,0.10)" : "rgba(52,211,153,0.10)",
                border:`1px solid ${parseFloat(diff) > 0 ? "rgba(248,113,113,0.25)" : "rgba(52,211,153,0.25)"}`,
                color: parseFloat(diff) > 0 ? C.red : C.green,
                fontSize:11.5, fontWeight:600, fontFamily:FONT, ...NUM,
              }}>
                <I d={parseFloat(diff) > 0 ? icons.arrowUp : icons.arrowDn} size={11}
                   color={parseFloat(diff) > 0 ? C.red : C.green} sw={2.2}/>
                {parseFloat(diff) > 0 ? "+" : ""}{diff} kg
              </div>
            )}
          </div>
          {canWeighIn && !showWeightInput && (
            <button className="tap" onClick={() => setShowWeightInput(true)} style={{
              padding:"7px 12px", background:"rgba(255,255,255,0.04)",
              border:`1px solid ${C.bd}`, borderRadius:9,
              color:C.mid, fontSize:11.5, fontWeight:600, fontFamily:FONT,
              display:"flex", alignItems:"center", gap:5, cursor:"pointer",
            }}>
              <I d={icons.plus} size={11} sw={2.2}/>Pesée
            </button>
          )}
        </div>
        {weightLog.length >= 2 && (
          <div style={{ marginTop:12 }}>
            <Sparkline data={weightLog.map(w => w.v)} color={C.accent}/>
          </div>
        )}
        {weightLog.length === 0 && (
          <div style={{ fontSize:12, color:C.dim, marginTop:8, lineHeight:1.5 }}>
            Enregistrez votre première pesée pour suivre votre progression.
          </div>
        )}
        {showWeightInput && canWeighIn && (
          <Row style={{ gap:8, marginTop:12 }}>
            <input
              type="number" placeholder="Ex: 79.5" value={newWeight}
              onChange={e => setNewWeight(e.target.value)} step="0.1"
              style={{
                flex:1, padding:"10px 12px",
                background:C.s2, border:`1px solid ${C.bd}`,
                borderRadius:10, color:C.text, fontSize:14,
                fontFamily:"'DM Sans',sans-serif",
              }}
            />
            <button className="tap" onClick={() => {
              if (!newWeight) return;
              const entry = { v:parseFloat(newWeight), date:new Date().toLocaleDateString("fr-FR") };
              setWeightLog(prev => [...prev, entry]);
              setLastWeighIn(new Date().toISOString());
              setNewWeight(""); setShowWeightInput(false);
              push("⚖️", "Poids enregistré !", `${newWeight}kg enregistré.`);
            }} style={{
              padding:"10px 14px",
              background:C.accent, border:"none", borderRadius:10,
              color:"#fff", cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:FONT,
            }}>✓</button>
            <button className="tap" onClick={() => setShowWeightInput(false)} style={{
              padding:"10px 11px", background:"rgba(255,255,255,0.04)",
              border:`1px solid ${C.bd}`, borderRadius:10,
              color:C.mid, cursor:"pointer", fontSize:16,
            }}>×</button>
          </Row>
        )}
        {!canWeighIn && (
          <div style={{
            marginTop:10, padding:"9px 12px",
            background:"rgba(52,211,153,0.06)", border:"1px solid rgba(52,211,153,0.18)",
            borderRadius:10, fontSize:12, color:C.green, lineHeight:1.5,
          }}>
            🌱 Prochaine pesée dans <strong>{14 - daysSinceLast} jour{14 - daysSinceLast > 1 ? "s" : ""}</strong>
          </div>
        )}
      </div>

      {/* ── Composition corporelle ── */}
      {(profil.bodyfat || imc) && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontFamily:FONT, fontSize:14, fontWeight:700, color:C.text, marginBottom:10 }}>
            Composition
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {profil.bodyfat && (() => {
              const bf  = parseFloat(profil.bodyfat);
              const cat = profil.sexe === "femme"
                ? (bf<14?"Athlète":bf<21?"Forme":bf<25?"Acceptable":bf<32?"À améliorer":"Obésité")
                : (bf<6?"Athlète":bf<14?"Forme":bf<18?"Acceptable":bf<25?"À améliorer":"Obésité");
              const col = cat==="Athlète"||cat==="Forme" ? C.green : cat==="Acceptable" ? C.accent : C.red;
              return (
                <div style={{ flex:1, padding:16, borderRadius:16, background:C.s1,
                  border:`1px solid ${C.bd}`, boxShadow:"0 1px 3px rgba(0,0,0,0.20)" }}>
                  <div style={{ fontSize:10.5, color:C.dim, fontFamily:FONT, letterSpacing:"0.8px",
                    textTransform:"uppercase", marginBottom:8 }}>Masse grasse</div>
                  <div style={{ display:"flex", alignItems:"baseline", gap:3 }}>
                    <span style={{ fontFamily:SERIF, fontSize:28, color:C.text, letterSpacing:-0.8, ...NUM }}>{bf}</span>
                    <span style={{ fontSize:12, color:C.mid, fontFamily:FONT }}>%</span>
                  </div>
                  <div style={{
                    marginTop:8, display:"inline-flex", padding:"3px 8px", borderRadius:6,
                    background:`${col}18`, border:`1px solid ${col}35`,
                    color:col, fontSize:10, fontWeight:700, fontFamily:FONT, letterSpacing:"0.4px",
                  }}>{cat.toUpperCase()}</div>
                </div>
              );
            })()}
            {imc && (
              <div style={{ flex:1, padding:16, borderRadius:16, background:C.s1,
                border:`1px solid ${C.bd}`, boxShadow:"0 1px 3px rgba(0,0,0,0.20)" }}>
                <div style={{ fontSize:10.5, color:C.dim, fontFamily:FONT, letterSpacing:"0.8px",
                  textTransform:"uppercase", marginBottom:8 }}>IMC</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:3 }}>
                  <span style={{ fontFamily:SERIF, fontSize:28, color:C.text, letterSpacing:-0.8, ...NUM }}>{imc}</span>
                  <span style={{ fontSize:12, color:C.mid, fontFamily:FONT }}>kg/m²</span>
                </div>
                <div style={{
                  marginTop:8, display:"inline-flex", padding:"3px 8px", borderRadius:6,
                  background: imc<25 ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)",
                  border:`1px solid ${imc<25 ? "rgba(52,211,153,0.30)" : "rgba(248,113,113,0.30)"}`,
                  color: imc<25 ? C.green : C.red,
                  fontSize:10, fontWeight:700, fontFamily:FONT, letterSpacing:"0.4px",
                }}>
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
