// ─── ProgressionPage.jsx ─────────────────────────────────────────────────────
// Records & Objectifs — maquette 15a. Hero record aurora, objectif journey,
// courbe 1RM, stat trio, dernières perfs. Données 100 % connectées.
import { useState, useMemo, useEffect } from"react";
import useScrollTop from"../../hooks/useScrollTop.js";
import { useSwipeBack } from"../../hooks/useSwipeBack.js";
import { calc1RM } from"../../utils/training.js";
import { C, FONT, NUM } from"../../data/constants.js";
import { I, ID } from"../../components/ui/Icon.jsx";

const F = FONT;
const BL = "#3B82F6";
const GRN = "#10B981";

const MUSCLES = [
  { id:"Pectoraux",       label:"Pectoraux" },
  { id:"Dos",             label:"Dos" },
  { id:"Épaules",         label:"Épaules" },
  { id:"Biceps",          label:"Biceps" },
  { id:"Triceps",         label:"Triceps" },
  { id:"Quadriceps",      label:"Jambes" },
  { id:"Ischio-jambiers", label:"Ischios" },
  { id:"Fessiers",        label:"Fessiers" },
  { id:"Abdominaux",      label:"Abdos" },
  { id:"Lombaires",       label:"Lombaires" },
  { id:"Mollets",         label:"Mollets" },
  { id:"Avant-bras",      label:"Avant-bras" },
  { id:"Trapèzes",        label:"Trapèzes" },
];

export default function ProgressionPage({ EX, prog, setProg, push, onClose }) {
  useScrollTop();
  const { swipeStyle, onTouchStart, onTouchMove, onTouchEnd } = useSwipeBack(onClose);
  const [selMuscle, setSelMuscle] = useState(MUSCLES[0].id);
  const [selExIdx, setSelExIdx] = useState(0);
  const [period, setPeriod] = useState("3M");

  useEffect(() => {
    const scrollY = window.scrollY;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  const exos = useMemo(() => (EX?.[selMuscle] || []).map(ex => {
    const nom = ex.n;
    let hist = [];
    (prog?.jours || []).forEach(j => (j.exercices || []).forEach(e => {
      if (e.nom === nom) {
        (e.sets || []).forEach(s => {
          if (s.poids && s.reps) hist.push({ poids: s.poids, reps: s.reps, date: s.date || e.lastDate || "" });
        });
        (e.historique || []).forEach(h => hist.push(h));
      }
    }));
    const recRaw = prog?.records?.[nom];
    const recHist = Array.isArray(recRaw) ? recRaw : (recRaw?.historique || []);
    recHist.forEach(h => hist.push(h));
    const seen = new Set();
    hist = hist.filter(h => {
      const k = `${h.date}-${h.poids}-${h.reps}`;
      if (seen.has(k)) return false; seen.add(k); return true;
    }).sort((a,b) => String(a.date||"").localeCompare(String(b.date||"")));
    const chartData = hist.map(h => ({
      rm: calc1RM(parseFloat(h.poids), parseInt(h.reps)),
      date: h.date, poids: parseFloat(h.poids), reps: parseInt(h.reps),
    })).filter(d => d.rm > 0);
    const currentRM = chartData.length ? chartData[chartData.length-1].rm : 0;
    const bestRM = chartData.length ? Math.max(...chartData.map(d=>d.rm)) : 0;
    const firstRM = chartData.length ? chartData[0].rm : 0;
    const pctProg = firstRM > 0 ? Math.round(((bestRM-firstRM)/firstRM)*100) : 0;
    return { nom, mat: ex.mat, chartData, currentRM, bestRM, firstRM, pctProg, nbSeances: chartData.length };
  }), [EX, selMuscle, prog]);

  const selEx = exos[selExIdx] || exos[0] || null;
  const filterByPeriod = (data) => {
    if (!data?.length) return data;
    const now = Date.now();
    const days = { "1M":30, "3M":90, "6M":180, "1A":365, "Tout":9999 }[period] || 90;
    return data.filter(d => {
      const parts = (d.date||"").split("/");
      if (parts.length < 3) return true;
      const dt = new Date(parts[2]+"-"+parts[1]+"-"+parts[0]);
      return (now - dt.getTime()) / 86400000 <= days;
    });
  };

  const chart = selEx ? filterByPeriod(selEx.chartData) : [];
  const hasData = chart.length > 0;
  const best = hasData ? Math.max(...chart.map(d=>d.rm)) : 0;
  const first = hasData ? chart[0].rm : 0;
  const last  = hasData ? chart[chart.length-1].rm : 0;
  const pct   = first > 0 ? Math.round(((best - first) / first) * 100) : 0;
  const fmtD  = (d) => { if (!d) return "—"; const p = d.split("/"); return p.length >= 2 ? `${p[0]}/${p[1]}` : d; };

  // Objectif
  const objKg = prog?.objectifs?.[selEx?.nom]?.cible || (best > 0 ? Math.round(best * 1.17) : 0);
  const objPct = objKg > 0 && best > 0 ? Math.min(100, Math.round((best / objKg) * 100)) : 0;
  const encore = Math.max(0, objKg - best);

  // SVG chart
  const SVG_W = 312, SVG_H = 130, PT = 14, PB = 24, PL = 6, PR = 6;
  const cH = SVG_H - PT - PB, cW = SVG_W - PL - PR;
  const rms = chart.map(s=>s.rm);
  const maxRM = Math.max(...(rms.length ? rms : [1]), objKg, 1);
  const minRM = Math.min(...(rms.length ? rms : [0]));
  const span = (maxRM - minRM) || 1;
  const pts = chart.map((s,i) => ({
    x: PL + (chart.length===1 ? cW/2 : (i/(chart.length-1))*cW),
    y: PT + cH - ((s.rm - minRM)/span)*cH, ...s,
  }));
  const polyline = pts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const objY = objKg > 0 ? PT + cH - ((objKg - minRM)/span)*cH : 0;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:100, background:"#E9EBF1", fontFamily:F, overflow:"hidden" }}
      onTouchStart={e => { e.stopPropagation(); onTouchStart(e); }}
      onTouchMove={e => { e.stopPropagation(); onTouchMove(e); }}
      onTouchEnd={e => { e.stopPropagation(); onTouchEnd(e); }}>

      <style>{`
        @keyframes prFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes prShimmer{0%{transform:translateX(-130%)}60%,100%{transform:translateX(260%)}}
        @keyframes prPulse{0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,.4)}50%{box-shadow:0 0 0 6px rgba(59,130,246,0)}}
      `}</style>

      <div style={{ ...swipeStyle, height:"100%", overflowY:"auto",
        WebkitOverflowScrolling:"touch", overscrollBehavior:"contain",
        padding:"20px 18px 120px", display:"flex", flexDirection:"column", gap:16 }}>

        {/* Header daté */}
        {(() => {
          const dateLabel = new Date().toLocaleDateString("fr-FR", {
            weekday:"long", day:"numeric", month:"short",
          }).toUpperCase().replace(".", "");
          return (
            <div style={{ animation:"prFadeUp .5s cubic-bezier(.22,1,.36,1) both" }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:BL, fontFamily:F, marginBottom:6 }}>{dateLabel}</div>
              <div style={{ fontFamily:F, fontSize:31, fontWeight:800, letterSpacing:"-0.03em", color:"#0F1923", lineHeight:1 }}>
                Tes records & <span style={{ fontStyle:"italic", color:BL }}>objectifs</span>
              </div>
              <div style={{ fontSize:13.5, fontWeight:500, color:"#6B7486", fontFamily:F, marginTop:6 }}>
                Bats ton max, fixe ton cap, suis ta route
              </div>
            </div>
          );
        })()}

        {/* Muscle chips */}
        <div style={{ animation:"prFadeUp .5s cubic-bezier(.22,1,.36,1) .04s both" }}>
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", color:"#9AA3B2", fontFamily:F, display:"block", marginBottom:9 }}>GROUPE MUSCULAIRE</span>
          <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:2 }} className="mc-scroll">
            {MUSCLES.map(m => (
              <button key={m.id} onClick={() => { setSelMuscle(m.id); setSelExIdx(0); }} style={{
                flex:"none", padding:"9px 16px", borderRadius:13,
                border: m.id === selMuscle ? "none" : "1px solid rgba(15,25,35,0.06)",
                background: m.id === selMuscle ? BL : "#fff",
                color: m.id === selMuscle ? "#fff" : "#6B7280",
                fontSize:13, fontWeight: m.id === selMuscle ? 700 : 600, fontFamily:F,
                cursor:"pointer",
                boxShadow: m.id === selMuscle ? "0 8px 18px rgba(59,130,246,0.35)" : "none",
              }}>{m.label}</button>
            ))}
          </div>
        </div>

        {/* Exercise cards */}
        <div style={{ animation:"prFadeUp .5s cubic-bezier(.22,1,.36,1) .08s both" }}>
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", color:"#9AA3B2", fontFamily:F, display:"block", marginBottom:9 }}>EXERCICE</span>
          <div style={{ display:"flex", gap:10, overflowX:"auto", padding:"2px 2px 4px" }} className="mc-scroll">
            {exos.map((ex, i) => (
              <div key={ex.nom} onClick={() => setSelExIdx(i)} style={{
                flex:"none", width:172, boxSizing:"border-box", padding:15, borderRadius:20, cursor:"pointer",
                background:"#fff",
                border: i === selExIdx ? "1.5px solid #3B82F6" : "1px solid rgba(15,25,35,0.06)",
                boxShadow: i === selExIdx ? "0 10px 26px rgba(59,130,246,0.16)" : "0 2px 10px rgba(15,25,35,0.04)",
              }}>
                <div style={{ fontSize:14.5, fontWeight:700, lineHeight:1.18, fontFamily:F, color:"#0F1923",
                  display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{ex.nom}</div>
                <div style={{ fontSize:12, fontWeight:600, color:"#9AA3B2", marginTop:5, fontFamily:F }}>{ex.mat || "—"}</div>
                {ex.bestRM > 0
                  ? <div style={{ fontSize:12, fontWeight:700, color:"#2563EB", marginTop:10, fontFamily:F }}>{Math.round(ex.bestRM)} kg · record</div>
                  : <div style={{ fontSize:12, fontWeight:500, fontStyle:"italic", color:"#B4BCCA", marginTop:10, fontFamily:F }}>Pas encore de données</div>}
              </div>
            ))}
          </div>
        </div>

        {/* HERO RECORD */}
        {selEx && hasData ? (
          <div style={{
            position:"relative", borderRadius:26, overflow:"hidden", background:"#0B0F1F",
            animation:"prFadeUp .55s cubic-bezier(.22,1,.36,1) .12s both",
          }}>
            <div style={{position:"absolute",top:-70,left:-46,width:230,height:230,borderRadius:"50%",
              background:"radial-gradient(circle,#3B82F6,transparent 66%)",filter:"blur(22px)",opacity:0.5,pointerEvents:"none"}}/>
            <div style={{position:"absolute",bottom:-80,right:-56,width:250,height:250,borderRadius:"50%",
              background:"radial-gradient(circle,#6366F1,transparent 66%)",filter:"blur(26px)",opacity:0.42,pointerEvents:"none"}}/>
            <div style={{position:"relative",padding:"20px 20px 22px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:7,
                  background:"rgba(245,158,11,0.15)",border:"1px solid rgba(245,158,11,0.35)",
                  borderRadius:99,padding:"6px 12px 6px 10px"}}>
                  <I name="trophyDuo" size={14} color="#F5A623"/>
                  <span style={{fontSize:11,fontWeight:800,letterSpacing:"0.05em",color:"#FCD9A0",fontFamily:F}}>RECORD PERSONNEL</span>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                <span style={{fontSize:66,fontWeight:700,letterSpacing:"-0.05em",lineHeight:0.9,color:"#fff",
                  fontVariantNumeric:"tabular-nums",fontFamily:F}}>{Math.round(best)}</span>
                <span style={{fontSize:22,fontWeight:600,color:"rgba(255,255,255,0.55)",fontFamily:F}}>kg</span>
                {pct > 0 && (
                  <span style={{marginLeft:2,padding:"5px 10px",borderRadius:99,
                    background:"rgba(16,185,129,0.16)",border:"1px solid rgba(16,185,129,0.3)",
                    fontSize:12,fontWeight:800,color:"#6EE7B7",fontFamily:F}}>↗ +{pct}%</span>
                )}
              </div>
              <span style={{display:"block",fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.55)",marginTop:6,fontFamily:F}}>
                1RM estimé · {chart[chart.length-1]?.poids || "?"} kg × {chart[chart.length-1]?.reps || "?"} · {fmtD(chart[chart.length-1]?.date)}
              </span>
            </div>
          </div>
        ) : selEx ? (
          <div style={{ background:"linear-gradient(135deg,#F7F8FB,#EEF1FF)", border:"1px dashed rgba(59,91,251,0.2)",
            borderRadius:22, padding:"24px 18px", textAlign:"center",
            animation:"prFadeUp .55s cubic-bezier(.22,1,.36,1) .12s both" }}>
            <div style={{fontSize:16,fontWeight:800,color:BL,fontFamily:F,marginBottom:6}}>Pas encore de record</div>
            <div style={{fontSize:13,fontWeight:500,color:"#6B7486",lineHeight:1.5,fontFamily:F}}>
              Enregistre tes charges en séance pour voir ton 1RM et ta progression.
            </div>
          </div>
        ) : null}

        {/* OBJECTIF */}
        {selEx && hasData && (
          <div style={{
            position:"relative",background:"#fff",border:"1px solid rgba(15,25,35,0.06)",
            borderRadius:24,padding:18,overflow:"hidden",boxShadow:"0 2px 12px rgba(15,25,35,0.05)",
            animation:"prFadeUp .55s cubic-bezier(.22,1,.36,1) .16s both",
          }}>
            <div style={{position:"absolute",top:-40,right:-30,width:150,height:150,borderRadius:"50%",
              background:"radial-gradient(circle,rgba(16,185,129,0.14),transparent 70%)",pointerEvents:"none"}}/>
            <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <div style={{width:32,height:32,borderRadius:10,background:"#D1FAE5",display:"grid",placeItems:"center"}}>
                  <I name="goal" size={17} color="#059669"/>
                </div>
                <div style={{display:"flex",flexDirection:"column"}}>
                  <span style={{fontSize:16,fontWeight:700,lineHeight:1,fontFamily:F}}>Objectif</span>
                  <span style={{fontSize:12,fontWeight:600,color:"#9AA3B2",fontFamily:F}}>cap {objKg} kg 1RM</span>
                </div>
              </div>
            </div>
            <div style={{position:"relative",padding:"26px 4px 4px",marginBottom:16}}>
              <div style={{position:"relative",height:10,borderRadius:99,background:"#EEF0F5"}}>
                <div style={{position:"absolute",top:0,left:0,bottom:0,borderRadius:99,
                  background:"linear-gradient(90deg,#3B82F6,#10B981)",width:`${objPct}%`,
                  boxShadow:"0 2px 8px rgba(16,185,129,0.35)"}}/>
                <div style={{position:"absolute",top:"50%",left:0,transform:"translate(-50%,-50%)",
                  width:14,height:14,borderRadius:"50%",background:"#fff",border:"3px solid #C6CEDE"}}/>
                <div style={{position:"absolute",top:-24,left:0,transform:"translateX(-2px)",
                  fontSize:10.5,fontWeight:700,color:"#9AA3B2",whiteSpace:"nowrap",fontFamily:F}}>
                  Départ <span style={{color:"#0F1923"}}>{Math.round(first)}</span>
                </div>
                <div style={{position:"absolute",top:"50%",left:`${objPct}%`,transform:"translate(-50%,-50%)",
                  width:18,height:18,borderRadius:"50%",background:BL,border:"3px solid #fff",
                  animation:"prPulse 2.4s ease-out infinite"}}/>
                <div style={{position:"absolute",top:-24,left:`${objPct}%`,transform:"translateX(-50%)",
                  fontSize:10.5,fontWeight:800,color:"#2563EB",whiteSpace:"nowrap",fontFamily:F}}>
                  Toi {Math.round(best)}
                </div>
                <div style={{position:"absolute",top:"50%",left:"100%",transform:"translate(-50%,-50%)",
                  width:24,height:24,borderRadius:8,background:GRN,display:"grid",placeItems:"center",
                  boxShadow:"0 4px 12px rgba(16,185,129,0.4)"}}>
                  <I name="goal" size={13} color="#fff"/>
                </div>
                <div style={{position:"absolute",top:-24,right:0,transform:"translateX(6px)",
                  fontSize:10.5,fontWeight:700,color:"#059669",whiteSpace:"nowrap",fontFamily:F}}>{objKg}</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:12}}>
              <div style={{display:"flex",flexDirection:"column",gap:2}}>
                <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.06em",color:"#9AA3B2",fontFamily:F}}>ENCORE</span>
                <span style={{fontSize:26,fontWeight:700,letterSpacing:"-0.03em",lineHeight:1,fontFamily:F}}>{encore} kg</span>
              </div>
              {chart.length >= 2 && (() => {
                const gain = Math.round(((best - first) / Math.max(1, chart.length - 1)) * 10) / 10;
                const needed = gain > 0 ? Math.ceil(encore / gain) : "?";
                return (
                  <div style={{flex:1,background:"#F5F9F7",border:"1px solid rgba(16,185,129,0.16)",borderRadius:14,padding:"11px 13px"}}>
                    <span style={{fontSize:12,fontWeight:600,color:"#4B5563",lineHeight:1.4,fontFamily:F}}>
                      À ~{gain} kg/séance, il te reste environ {needed} séance{needed > 1 ? "s" : ""}.
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* CHART */}
        {selEx && (
          <div style={{
            background:"#fff",border:"1px solid rgba(15,25,35,0.06)",borderRadius:24,
            padding:"18px 18px 16px",boxShadow:"0 2px 12px rgba(15,25,35,0.05)",
            animation:"prFadeUp .55s cubic-bezier(.22,1,.36,1) .2s both",
          }}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <span style={{fontSize:16,fontWeight:700,fontFamily:F}}>Évolution du 1RM</span>
              <div style={{display:"flex",gap:3,background:"#F1F3F8",borderRadius:10,padding:3}}>
                {["1M","3M","6M","1A","Tout"].map(p => (
                  <button key={p} onClick={() => setPeriod(p)} style={{
                    padding:"6px 10px",borderRadius:8,border:"none",fontSize:12,
                    fontWeight: period===p ? 700 : 600, fontFamily:F, cursor:"pointer",
                    background: period===p ? "#fff" : "transparent",
                    color: period===p ? "#0F1923" : "#9AA3B2",
                    boxShadow: period===p ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}>{p}</button>
                ))}
              </div>
            </div>
            {chart.length >= 2 ? (
              <svg width="100%" height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} preserveAspectRatio="none" style={{overflow:"visible",display:"block"}}>
                <defs><linearGradient id="rmg-pp" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={BL} stopOpacity="0.18"/>
                  <stop offset="100%" stopColor={BL} stopOpacity="0.01"/>
                </linearGradient></defs>
                {objKg > 0 && <>
                  <line x1={PL} x2={PL+cW} y1={objY} y2={objY} stroke="rgba(16,185,129,0.45)" strokeWidth="1.2" strokeDasharray="5 4"/>
                  <text x={PL+cW-2} y={objY-5} fontSize="9" fill="#059669" textAnchor="end" fontWeight="800" fontFamily={F}>Objectif {objKg}</text>
                </>}
                <polygon points={`${PL},${PT+cH} ${polyline} ${PL+cW},${PT+cH}`} fill="url(#rmg-pp)"/>
                <polyline points={polyline} fill="none" stroke={BL} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                {pts.map((p,k) => (
                  <g key={k}>
                    <circle cx={p.x} cy={p.y} r={k===pts.length-1?5.5:4}
                      fill={k===pts.length-1?BL:"#fff"} stroke={k===pts.length-1?"#fff":"#C6CEDE"} strokeWidth={k===pts.length-1?2.5:2}/>
                    {k===pts.length-1 && <text x={p.x-8} y={p.y-10} fontSize="10" fontWeight="800" fill="#2563EB" textAnchor="end" fontFamily={F}>{Math.round(p.rm)} kg</text>}
                  </g>
                ))}
                <text x={pts[0].x} y={SVG_H-4} fontSize="9" fill="#9AA3B2" textAnchor="start" fontFamily={F}>{fmtD(chart[0].date)}</text>
                <text x={pts[pts.length-1].x} y={SVG_H-4} fontSize="9" fill="#9AA3B2" textAnchor="end" fontFamily={F}>{fmtD(chart[chart.length-1].date)}</text>
              </svg>
            ) : (
              <div style={{padding:"24px 0",textAlign:"center",fontSize:13,color:"#9AA3B2",fontFamily:F}}>
                {chart.length === 1 ? "Encore une entrée pour voir ta courbe." : "Aucune donnée sur cette période."}
              </div>
            )}
          </div>
        )}

        {/* STAT TRIO */}
        {selEx && hasData && (
          <div style={{display:"flex",gap:10,animation:"prFadeUp .55s cubic-bezier(.22,1,.36,1) .24s both"}}>
            {[
              {lab:"DÉPART",dot:"#C6CEDE",lc:"#9AA3B2",val:first,bc:"rgba(15,25,35,0.06)",bs:"rgba(15,25,35,0.04)"},
              {lab:"RECORD",dot:"#F5A623",lc:"#C77E12",val:best,bc:"rgba(245,158,11,0.22)",bs:"rgba(245,158,11,0.08)"},
              {lab:"ACTUEL",dot:GRN,lc:"#059669",val:last,bc:"rgba(16,185,129,0.22)",bs:"rgba(16,185,129,0.08)"},
            ].map(s => (
              <div key={s.lab} style={{flex:1,background:"#fff",border:`1px solid ${s.bc}`,borderRadius:18,
                padding:"14px 12px",display:"flex",flexDirection:"column",gap:7,boxShadow:`0 2px 10px ${s.bs}`}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:s.dot}}/>
                  <span style={{fontSize:10.5,fontWeight:700,letterSpacing:"0.05em",color:s.lc,fontFamily:F}}>{s.lab}</span>
                </div>
                <span style={{fontSize:22,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,fontFamily:F}}>
                  {Math.round(s.val)}<span style={{fontSize:12,fontWeight:600,color:"#9AA3B2"}}> kg</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* DERNIÈRES PERFS */}
        {selEx && chart.length > 0 && (
          <div style={{
            background:"#fff",border:"1px solid rgba(15,25,35,0.06)",borderRadius:22,
            padding:"16px 18px",boxShadow:"0 2px 12px rgba(15,25,35,0.05)",
            animation:"prFadeUp .55s cubic-bezier(.22,1,.36,1) .28s both",
          }}>
            <span style={{fontSize:13,fontWeight:700,fontFamily:F}}>Dernières perfs</span>
            <div style={{display:"flex",flexDirection:"column",marginTop:8}}>
              {chart.slice(-5).reverse().map((s, i) => {
                const isBest = Math.round(s.rm) === Math.round(best);
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                    padding:"9px 0",borderTop:"1px solid rgba(15,25,35,0.05)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <span style={{fontSize:11,fontWeight:600,color:"#9AA3B2",fontVariantNumeric:"tabular-nums",
                        minWidth:36,fontFamily:F}}>{fmtD(s.date)}</span>
                      <span style={{fontSize:13.5,fontWeight:600,fontFamily:F}}>{s.poids} kg × {s.reps}</span>
                      {isBest && <span style={{fontSize:9.5,fontWeight:800,color:"#C77E12",
                        background:"rgba(245,158,11,0.14)",borderRadius:6,padding:"2px 6px",
                        letterSpacing:"0.05em",fontFamily:F}}>PR</span>}
                    </div>
                    <span style={{fontSize:13,fontWeight:700,fontVariantNumeric:"tabular-nums",fontFamily:F,
                      color:isBest?"#C77E12":"#0F1923"}}>{Math.round(s.rm)} kg</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FLOATING CTA */}
        <button onClick={() => { /* TODO: open add record modal */ }} style={{
          position:"relative",overflow:"hidden",
          width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:10,
          background:BL,borderRadius:18,padding:16,border:"none",
          boxShadow:"0 14px 34px rgba(59,130,246,0.5)",cursor:"pointer",
          animation:"prFadeUp .55s cubic-bezier(.22,1,.36,1) .32s both",
        }}>
          <span style={{position:"absolute",top:0,left:0,height:"100%",width:"35%",
            background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)",
            animation:"prShimmer 3.4s ease-in-out 1.4s infinite",pointerEvents:"none"}}/>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          <span style={{fontSize:16,fontWeight:700,color:"#fff",fontFamily:F}}>Ajouter un record</span>
        </button>

      </div>
    </div>
  );
}
