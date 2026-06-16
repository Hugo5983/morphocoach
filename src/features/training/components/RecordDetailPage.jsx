// ─── RecordDetailPage.jsx ────────────────────────────────────────────────────
// Page plein écran pour un exercice : 1RM en texte, objectif en haut,
// saisie poids+reps (direct + +/-), graphique avec %, historique.
// Validée sur maquette v4.

import { useState, useMemo } from "react";
import { calc1RM } from "../../../utils/training.js";
import { C, FONT, SERIF, NUM } from "../../../data/constants.js";

const F    = FONT;
const SER  = SERIF;
const BG   = C.bg;
const S1   = C.s1;
const BD   = "rgba(0,0,0,0.06)";
const TEXT = C.text;
const MID  = "#374151";
const DIM  = "#6B7280";
const GRY  = "#9CA3AF";
const BL   = "#3B82F6";
const BLLG = "#60A5FA";
const BLDK = "#2563EB";
const GRN  = "#34D399";

// ── Graphique SVG (1RM par séance) ───────────────────────────────────────────
function RMChart({ data, objectifKg }) {
  if (!data || data.length < 2) return (
    <div style={{ padding:"18px 0", textAlign:"center",
      fontSize:12, color:GRY, fontFamily:F }}>
      Encore une entrée pour voir ta courbe d'évolution.
    </div>
  );

  const W=312, H=120, PT=20, PB=22, PL=4, PR=4;
  const cW=W-PL-PR, cH=H-PT-PB;
  const rms  = data.map(d => d.rm);
  const minV = Math.min(...rms) * 0.95;
  const maxV = Math.max(...rms, objectifKg || 0) * 1.05;
  const span = maxV - minV || 1;

  const pts  = data.map((d,i) => ({
    x: PL + (data.length===1 ? cW/2 : (i/(data.length-1))*cW),
    y: PT + cH - ((d.rm - minV)/span)*cH,
    ...d,
  }));

  const line = pts.reduce((acc,p,i) => {
    if (i===0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const prev = pts[i-1], t=0.4;
    const c1 = (prev.x+(p.x-prev.x)*t).toFixed(1);
    const c2 = (p.x-(p.x-prev.x)*t).toFixed(1);
    return `${acc} C${c1},${prev.y.toFixed(1)} ${c2},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }, "");

  const fill = `${line} L${pts[pts.length-1].x.toFixed(1)},${PT+cH} L${pts[0].x.toFixed(1)},${PT+cH} Z`;

  // Ligne objectif
  const objY = objectifKg ? PT + cH - ((objectifKg - minV)/span)*cH : null;

  // Dates extrêmes
  const fmtDate = (d) => {
    const p = String(d||"").split("/");
    return p.length===3 ? `${p[0]}/${p[1]}` : String(d||"").substring(0,5);
  };

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
         style={{ overflow:"visible", display:"block" }}>
      <defs>
        <linearGradient id="rmg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={BL} stopOpacity="0.16"/>
          <stop offset="100%" stopColor={BL} stopOpacity="0.01"/>
        </linearGradient>
      </defs>
      {/* Ligne objectif */}
      {objY !== null && (
        <>
          <line x1={PL} x2={W-PR} y1={objY} y2={objY}
            stroke="rgba(59,130,246,0.22)" strokeWidth="1" strokeDasharray="4 4"/>
          <text x={W-PR-2} y={objY-4} fontSize="8" fill="rgba(59,130,246,0.5)"
            textAnchor="end" fontFamily={F} fontWeight="700">
            Obj. {objectifKg} kg
          </text>
        </>
      )}
      {/* Fill + line */}
      <path d={fill} fill="url(#rmg)"/>
      <path d={line} fill="none" stroke={BL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Points extrêmes */}
      <circle cx={pts[0].x} cy={pts[0].y} r="4" fill="#fff" stroke={BL} strokeWidth="2"/>
      <text x={pts[0].x+8} y={pts[0].y+4} fontSize="9.5" fontWeight="700" fill={GRY}
        fontFamily={F}>{pts[0].rm} kg</text>
      <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="5" fill={BL} stroke="#fff" strokeWidth="2"/>
      <text x={pts[pts.length-1].x-8} y={pts[pts.length-1].y-8} fontSize="9.5" fontWeight="700"
        fill={BLDK} textAnchor="end" fontFamily={F}>{pts[pts.length-1].rm} kg</text>
      {/* Dates */}
      <text x={PL} y={H-4} fontSize="9" fill={GRY} fontFamily={F}>
        {fmtDate(data[0]?.date)}
      </text>
      <text x={W-PR} y={H-4} fontSize="9" fill={GRY} textAnchor="end" fontFamily={F}>
        {fmtDate(data[data.length-1]?.date)}
      </text>
    </svg>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function RecordDetailPage({ exData, prog, setProg, push, onClose }) {
  const [kg,         setKg]         = useState("");
  const [reps,       setReps]       = useState("");
  const [focusField, setFocusField] = useState(null);
  const [showObjInput, setShowObjInput] = useState(false);
  const [objKgInput,   setObjKgInput]   = useState("");

  const nom = exData?.nom || "";

  // Historique trié chrono
  const hist = useMemo(() => {
    const raw = exData?.historique || [];
    return [...raw].sort((a,b) => {
      const pa = String(a.date||"").split("/").reverse().join("");
      const pb = String(b.date||"").split("/").reverse().join("");
      return pa.localeCompare(pb);
    });
  }, [exData]);

  // 1RM par séance pour le graphique
  const chartData = useMemo(() =>
    hist.map(h => ({ rm: calc1RM(parseFloat(h.poids), parseInt(h.reps)), date: h.date, poids: h.poids, reps: h.reps }))
  , [hist]);

  // Record actuel
  const currentRM  = exData?.rm1 || (chartData.length ? Math.max(...chartData.map(d=>d.rm)) : 0);
  const firstRM    = chartData.length ? chartData[0].rm : currentRM;
  const pctProg    = firstRM > 0 ? Math.round(((currentRM - firstRM)/firstRM)*100) : 0;

  // Objectif stocké
  const objectifKg = prog?.records?.[nom]?.objectifKg || null;
  const objPct     = objectifKg && currentRM ? Math.min(100, Math.round((currentRM/objectifKg)*100)) : null;

  // 1RM live calculé
  const kgNum   = parseFloat(kg);
  const repsNum = parseInt(reps);
  const liveRM  = kgNum > 0 && repsNum > 0 ? calc1RM(kgNum, repsNum) : 0;
  const isNew   = liveRM > currentRM;
  const diffRM  = liveRM > 0 ? (liveRM - currentRM).toFixed(1) : null;

  // Sauvegarder une entrée
  const handleSave = () => {
    if (!kgNum || !repsNum) return;
    const entry = { poids: kgNum, reps: repsNum, date: new Date().toLocaleDateString("fr-FR") };
    const u = JSON.parse(JSON.stringify(prog));
    let found = false;
    u.jours?.forEach(j => (j.exercices||[]).forEach(ex => {
      if (ex.nom === nom) { ex.historique = [...(ex.historique||[]), entry]; found = true; }
    }));
    if (!found) {
      u.records = u.records || {};
      u.records[nom] = u.records[nom] || {};
      u.records[nom].historique = [...(u.records[nom]?.historique||[]), entry];
    }
    setProg(u);
    push("🏆", isNew ? "Nouveau record !" : "Performance enregistrée",
         `${nom} · ${kgNum}kg × ${repsNum} reps · 1RM≈${liveRM}kg`);
    setKg(""); setReps("");
  };

  // Sauvegarder objectif
  const saveObjectif = () => {
    const v = parseFloat(objKgInput);
    if (!v) return;
    const u = JSON.parse(JSON.stringify(prog));
    u.records = u.records || {};
    u.records[nom] = u.records[nom] || {};
    u.records[nom].objectifKg = v;
    setProg(u);
    setShowObjInput(false); setObjKgInput("");
    push("🎯","Objectif enregistré",`${nom} · ${v} kg 1RM`);
  };

  const stepKg   = (d) => setKg(k => String(Math.max(0, Math.round(((parseFloat(k)||0)+d)*2)/2)));
  const stepReps = (d) => setReps(r => String(Math.max(1, Math.min(30,(parseInt(r)||0)+d))));

  const canSave = kgNum > 0 && repsNum > 0;

  // Style input tile
  const tileStyle = (field) => ({
    flex:1, background:S1,
    border:`1.5px solid ${focusField===field?"rgba(59,130,246,0.5)":BD}`,
    borderRadius:14, padding:"11px 10px", textAlign:"center",
    boxShadow: focusField===field ? "0 0 0 3px rgba(59,130,246,0.08)" : "none",
    transition:"border-color .15s, box-shadow .15s",
  });

  return (
    <div style={{ position:"fixed", inset:0, zIndex:400,
      background:BG, display:"flex", flexDirection:"column",
      animation:"rm-slideIn .28s cubic-bezier(.32,.72,0,1)" }}>
      <style>{`@keyframes rm-slideIn{from{transform:translateX(100%)}to{transform:none}}`}</style>

      {/* Header */}
      <div style={{ padding:"18px 18px 12px", background:S1,
        borderBottom:`1px solid ${BD}`,
        display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        <button onClick={onClose} style={{ display:"flex", alignItems:"center", gap:4,
          fontSize:13, fontWeight:700, color:BL, background:"none", border:"none", cursor:"pointer" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BL} strokeWidth="2.2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Retour
        </button>
        <div style={{ flex:1, textAlign:"center", fontSize:13, fontWeight:700, color:TEXT }}>{nom}</div>
        <div style={{ width:32, height:32, borderRadius:"50%",
          background:"rgba(0,0,0,0.04)", display:"grid", placeItems:"center" }}>
          <svg width="3" height="13" viewBox="0 0 4 18">
            <circle cx="2" cy="2"  r="2" fill={GRY}/>
            <circle cx="2" cy="9"  r="2" fill={GRY}/>
            <circle cx="2" cy="16" r="2" fill={GRY}/>
          </svg>
        </div>
      </div>

      {/* Scroll */}
      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"0 0 40px" }}>

        {/* Hero texte */}
        <div style={{ padding:"18px 20px 14px" }}>
          <div style={{ fontFamily:SER, fontSize:26, color:TEXT, letterSpacing:"-0.5px", marginBottom:12 }}>
            {nom}
          </div>
          {/* 1RM + progression en texte (pas de cartes) */}
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div>
              <div style={{ fontSize:8.5, fontWeight:800, letterSpacing:"1.5px", textTransform:"uppercase",
                color:GRY, marginBottom:3 }}>Record 1RM</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                <span style={{ fontSize:34, fontWeight:800, color:TEXT, letterSpacing:"-1.5px", ...NUM }}>
                  {currentRM || "—"}
                </span>
                {currentRM > 0 && <span style={{ fontSize:14, color:GRY, fontWeight:600 }}>kg</span>}
              </div>
            </div>
            {pctProg !== 0 && firstRM !== currentRM && (
              <>
                <div style={{ width:1, height:32, background:BD }}/>
                <div>
                  <div style={{ fontSize:8.5, fontWeight:800, letterSpacing:"1.5px", textTransform:"uppercase",
                    color:GRY, marginBottom:3 }}>Depuis le départ</div>
                  <div style={{ fontSize:14, fontWeight:800,
                    color: pctProg > 0 ? GRN : "#F87171" }}>
                    {pctProg > 0 ? "↗" : "↘"} {pctProg > 0 ? "+" : ""}{pctProg}%
                  </div>
                  <div style={{ fontSize:10, color:GRY, marginTop:1, fontFamily:F }}>
                    {firstRM} kg → {currentRM} kg
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Objectif (en haut) ── */}
        <div style={{ margin:"0 18px 14px", background:S1, border:`1px solid ${BD}`,
          borderRadius:16, padding:"13px 15px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: objectifKg ? 9 : 0 }}>
            <div style={{ fontSize:12.5, fontWeight:700, color:TEXT }}>🎯 Objectif</div>
            <button onClick={() => { setShowObjInput(!showObjInput); setObjKgInput(objectifKg||""); }}
              style={{ fontSize:11.5, fontWeight:700, color:BL, background:"none", border:"none", cursor:"pointer" }}>
              {objectifKg ? "Modifier" : "+ Définir"}
            </button>
          </div>

          {showObjInput && (
            <div style={{ display:"flex", gap:8, marginTop:10 }}>
              <input type="number" inputMode="decimal" value={objKgInput}
                onChange={e => setObjKgInput(e.target.value)}
                placeholder="Ex: 100 kg"
                style={{ flex:1, padding:"10px 12px", borderRadius:11, border:`1.5px solid rgba(59,130,246,0.4)`,
                  fontSize:14, fontWeight:700, color:TEXT, fontFamily:F, outline:"none", background:"#F6F8FB" }}/>
              <button onClick={saveObjectif} style={{ padding:"10px 16px", borderRadius:11, border:"none",
                background:`linear-gradient(145deg,${BLLG},${BLDK})`, color:"#fff",
                fontFamily:F, fontSize:13, fontWeight:700, cursor:"pointer" }}>OK</button>
            </div>
          )}

          {objectifKg && !showObjInput && (
            <>
              <div style={{ height:7, background:"#F0F2F7", borderRadius:99, overflow:"hidden", marginBottom:7 }}>
                <div style={{ height:"100%", width:`${objPct}%`,
                  background:`linear-gradient(90deg,${BLLG},${BLDK})`, borderRadius:99 }}/>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:10.5, color:GRY }}>
                <span>{firstRM || currentRM} kg départ</span>
                <span style={{ fontWeight:700, color:BLDK }}>{currentRM} / {objectifKg} kg · {objPct}%</span>
                <span>{objectifKg} kg cible</span>
              </div>
            </>
          )}

          {!objectifKg && !showObjInput && (
            <div style={{ fontSize:11.5, color:GRY, marginTop:6, fontFamily:F }}>
              Définis une cible 1RM pour suivre ta progression.
            </div>
          )}
        </div>

        {/* ── Saisie : poids + reps ── */}
        <div style={{ margin:"0 18px 14px", background:S1, border:`1px solid ${BD}`,
          borderRadius:18, overflow:"hidden" }}>
          {/* Header avec 1RM live */}
          <div style={{ padding:"11px 15px 10px", borderBottom:`1px solid ${BD}`,
            display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ fontSize:9, fontWeight:800, letterSpacing:"1.5px",
              textTransform:"uppercase", color:GRY }}>Nouvelle performance</div>
            {liveRM > 0 ? (
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:16, fontWeight:800, color:BLDK, ...NUM }}>{liveRM}</span>
                <span style={{ fontSize:9.5, color:GRY }}>kg 1RM</span>
                <span style={{ fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:99,
                  background: isNew ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.10)",
                  color: isNew ? "#059669" : "#DC2626" }}>
                  {isNew ? `↗ Nouveau record` : `↘ ${diffRM} kg`}
                </span>
              </div>
            ) : (
              <span style={{ fontSize:9.5, color:"#C0C6D4" }}>Saisis poids + reps</span>
            )}
          </div>

          <div style={{ padding:"14px 15px 12px" }}>
            <div style={{ display:"flex", gap:10, marginBottom:12 }}>

              {/* Poids */}
              <div style={tileStyle("kg")}>
                <div style={{ fontSize:7.5, fontWeight:800, letterSpacing:"1.5px",
                  textTransform:"uppercase", color:GRY, marginBottom:8 }}>Poids</div>
                <div style={{ position:"relative", display:"flex", alignItems:"baseline",
                  justifyContent:"center", gap:3, marginBottom:10 }}>
                  <input type="number" inputMode="decimal" step="0.5" value={kg}
                    onChange={e => setKg(e.target.value)}
                    onFocus={() => setFocusField("kg")} onBlur={() => setFocusField(null)}
                    placeholder="–"
                    style={{ position:"absolute", inset:0, opacity:0, width:"100%",
                      fontSize:36, textAlign:"center", border:"none", background:"transparent",
                      cursor:"text", zIndex:2, WebkitUserSelect:"auto" }}/>
                  <span style={{ fontSize:36, fontWeight:800, letterSpacing:"-1.5px", ...NUM,
                    color: kg ? TEXT : "#D1D5DB", pointerEvents:"none" }}>
                    {kg || "–"}
                  </span>
                  <span style={{ fontSize:12, color:GRY, fontWeight:600, pointerEvents:"none" }}>kg</span>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={() => stepKg(-2.5)} style={{ flex:1, height:32, borderRadius:9,
                    border:"none", cursor:"pointer", fontSize:18, background:"#ECEEF4", color:MID }}>−</button>
                  <button onClick={() => stepKg(+2.5)} style={{ flex:1, height:32, borderRadius:9,
                    border:"none", cursor:"pointer", fontSize:18,
                    background:`linear-gradient(145deg,${BLLG},${BLDK})`,
                    color:"#fff", boxShadow:"0 3px 8px rgba(37,99,235,0.28)" }}>+</button>
                </div>
              </div>

              {/* Reps */}
              <div style={tileStyle("reps")}>
                <div style={{ fontSize:7.5, fontWeight:800, letterSpacing:"1.5px",
                  textTransform:"uppercase", color:GRY, marginBottom:8 }}>Répétitions</div>
                <div style={{ position:"relative", display:"flex", alignItems:"baseline",
                  justifyContent:"center", marginBottom:10 }}>
                  <input type="number" inputMode="numeric" value={reps}
                    onChange={e => setReps(e.target.value)}
                    onFocus={() => setFocusField("reps")} onBlur={() => setFocusField(null)}
                    placeholder="–"
                    style={{ position:"absolute", inset:0, opacity:0, width:"100%",
                      fontSize:36, textAlign:"center", border:"none", background:"transparent",
                      cursor:"text", zIndex:2, WebkitUserSelect:"auto" }}/>
                  <span style={{ fontSize:36, fontWeight:800, letterSpacing:"-1.5px", ...NUM,
                    color: reps ? TEXT : "#D1D5DB", pointerEvents:"none" }}>
                    {reps || "–"}
                  </span>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={() => stepReps(-1)} style={{ flex:1, height:32, borderRadius:9,
                    border:"none", cursor:"pointer", fontSize:18, background:"#ECEEF4", color:MID }}>−</button>
                  <button onClick={() => stepReps(+1)} style={{ flex:1, height:32, borderRadius:9,
                    border:"none", cursor:"pointer", fontSize:18,
                    background:`linear-gradient(145deg,${BLLG},${BLDK})`,
                    color:"#fff", boxShadow:"0 3px 8px rgba(37,99,235,0.28)" }}>+</button>
                </div>
              </div>

            </div>

            {/* Formule */}
            <div style={{ fontSize:9.5, textAlign:"center", color: canSave ? GRY : "#D1D5DB",
              fontFamily:F, paddingBottom:2 }}>
              {canSave
                ? `${kgNum} × (1 + ${repsNum}/30) = ${liveRM} kg 1RM`
                : "poids × (1 + reps / 30) = 1RM Epley"}
            </div>
          </div>

          {/* CTA */}
          <button onClick={handleSave} disabled={!canSave}
            style={{ display:"block", width:"calc(100% - 28px)", margin:"0 14px 14px",
              height:46, borderRadius:12, border:"none", fontFamily:F,
              fontSize:13, fontWeight:700, cursor: canSave ? "pointer" : "default",
              background: canSave ? `linear-gradient(180deg,${BLLG},${BLDK})` : "#F0F2F7",
              color: canSave ? "#fff" : "#D1D5DB",
              boxShadow: canSave ? "0 6px 18px rgba(37,99,235,0.38)" : "none",
              transition:"all .15s" }}>
            {canSave
              ? `Enregistrer · ${kgNum} kg × ${repsNum} → ${liveRM} kg 1RM`
              : "Enregistrer"}
          </button>
        </div>

        {/* ── Graphique ── */}
        <div style={{ margin:"0 18px 14px", background:S1, border:`1px solid ${BD}`,
          borderRadius:16, padding:"14px 15px" }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ fontSize:8, fontWeight:800, letterSpacing:"1.5px",
              textTransform:"uppercase", color:GRY }}>Évolution du 1RM estimé</div>
            {pctProg !== 0 && (
              <div style={{ fontSize:14, fontWeight:800,
                color: pctProg > 0 ? GRN : "#F87171" }}>
                {pctProg > 0 ? "+" : ""}{pctProg}%
                <span style={{ fontSize:10, color:GRY, fontWeight:600, marginLeft:4 }}>depuis le départ</span>
              </div>
            )}
          </div>
          <RMChart data={chartData} objectifKg={objectifKg}/>
        </div>

        {/* ── Historique ── */}
        <div style={{ margin:"0 18px 14px", background:S1, border:`1px solid ${BD}`,
          borderRadius:16, overflow:"hidden" }}>
          <div style={{ padding:"11px 15px 9px", borderBottom:`1px solid ${BD}` }}>
            <div style={{ fontSize:8, fontWeight:800, letterSpacing:"1.5px",
              textTransform:"uppercase", color:GRY }}>Historique</div>
          </div>
          {hist.length === 0 ? (
            <div style={{ padding:"20px", textAlign:"center", fontSize:12.5, color:GRY, fontFamily:F }}>
              Aucune entrée pour le moment. Enregistre ta première performance.
            </div>
          ) : [...hist].reverse().map((h,i) => {
            const rm = calc1RM(parseFloat(h.poids), parseInt(h.reps));
            const isRec = rm >= currentRM - 0.05;
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10,
                padding:"11px 15px", borderBottom:`1px solid ${BD}` }}>
                <div style={{ fontSize:11.5, color:GRY, fontWeight:600, flex:1 }}>{h.date}</div>
                <div style={{ fontSize:11, color:"#C0C6D4" }}>{h.poids} × {h.reps}</div>
                <div style={{ fontSize:13.5, fontWeight:800, color:TEXT, ...NUM, marginLeft:"auto" }}>
                  {rm} kg
                </div>
                <div style={{ fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:99,
                  marginLeft:7,
                  background: isRec ? "rgba(52,211,153,0.12)" : "rgba(0,0,0,0.04)",
                  color: isRec ? "#059669" : "#C0C6D4" }}>
                  {isRec ? "Record" : "—"}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
