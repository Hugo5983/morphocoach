// ─── ProgressionPage.jsx — Records & Objectifs (maquette 15a/b/c/d) ──────────
// 15a page principale · 15b feuille "ajouter un record" (1RM live + confettis)
// 15c feuille "définir un objectif" · 15d état vide
import { useState, useMemo, useEffect } from"react";
import { calc1RM } from"../../utils/training.js";
import { FONT } from"../../data/constants.js";
import { I } from"../../components/ui/Icon.jsx";

const F   = FONT;
const BL  = "#3B82F6";
const BL2 = "#2563EB";
const GRN = "#10B981";
const GRN2= "#059669";
const AMB = "#F5A623";

const REPS_PRESETS = [1, 3, 5, 6, 8, 10, 12];

export default function ProgressionPage({ EX, prog, setProg, push, onClose }) {
  const [selMuscle, setSelMuscle] = useState("");
  const [selExIdx,  setSelExIdx]  = useState(0);
  const [period,    setPeriod]    = useState("Tout");
  const [sheet,     setSheet]     = useState(null);   // null | "record" | "objectif"
  const [kg,        setKg]        = useState(0);
  const [reps,      setReps]      = useState(6);
  const [objVal,    setObjVal]    = useState(0);
  const [confetti,  setConfetti]  = useState(false);
  const [toast,     setToast]     = useState("");

  // ── Groupes musculaires ────────────────────────────────────────────────────
  const muscles = useMemo(
    () => (EX ? Object.keys(EX).filter(k => Array.isArray(EX[k]) && EX[k].length) : []),
    [EX]
  );
  useEffect(() => { if (muscles.length && !selMuscle) setSelMuscle(muscles[0]); }, [muscles, selMuscle]);

  // ── Exercices du groupe, enrichis avec l'historique réel ───────────────────
  const exos = useMemo(() => {
    const cat = EX?.[selMuscle];
    if (!cat) return [];
    return cat.map(ex => {
      const nom = ex.n;
      let hist = [];
      (prog?.jours || []).forEach(j => (j.exercices || []).forEach(e => {
        if (e.nom === nom) hist = [...hist, ...(e.historique || [])];
      }));
      const rec = prog?.records?.[nom];
      if (Array.isArray(rec)) hist = [...hist, ...rec];
      else if (rec?.historique) hist = [...hist, ...rec.historique];
      const seen = new Set();
      hist = hist
        .filter(h => { const k = `${h.date}|${h.poids}|${h.reps}`; if (seen.has(k)) return false; seen.add(k); return true; })
        .sort((a, b) => dnum(a.date) - dnum(b.date));
      const pts = hist
        .map(h => ({ rm: calc1RM(parseFloat(h.poids) || 0, parseInt(h.reps) || 1), date: h.date, poids: parseFloat(h.poids) || 0, reps: parseInt(h.reps) || 0 }))
        .filter(d => d.rm > 0);
      return { nom, mat: ex.mat || "", pts, bestRM: pts.length ? Math.max(...pts.map(d => d.rm)) : 0 };
    });
  }, [EX, selMuscle, prog]);

  const sel = exos[selExIdx] || exos[0] || null;

  // ── Filtre période ─────────────────────────────────────────────────────────
  const chart = useMemo(() => {
    const all = sel?.pts || [];
    if (period === "Tout" || !all.length) return all;
    const days = { "1M": 31, "3M": 92, "6M": 183, "1A": 366 }[period] || 9999;
    const lim = Date.now() - days * 864e5;
    return all.filter(p => dnum(p.date) >= lim);
  }, [sel, period]);

  const hasData = chart.length > 0;
  const best  = hasData ? Math.max(...chart.map(d => d.rm)) : 0;
  const first = hasData ? chart[0].rm : 0;
  const last  = hasData ? chart[chart.length - 1].rm : 0;
  const pctUp = first > 0 ? Math.round(((best - first) / first) * 100) : 0;
  const lastEntry = hasData ? chart[chart.length - 1] : null;

  // ── Objectif ───────────────────────────────────────────────────────────────
  const savedObj = prog?.objectifs?.[sel?.nom]?.cible || 0;
  const objKg  = savedObj || (best > 0 ? Math.round(best * 1.17) : 0);
  const objPct = objKg > 0 && best > 0 ? Math.min(100, Math.round(((best - first) / Math.max(1, objKg - first)) * 100)) : 0;
  const encore = Math.max(0, objKg - Math.round(best));
  const gainSeance = chart.length >= 2 ? Math.round(((best - first) / (chart.length - 1)) * 10) / 10 : 0;
  const seancesLeft = gainSeance > 0 ? Math.ceil(encore / gainSeance) : null;

  // ── Sheet : 1RM live ───────────────────────────────────────────────────────
  const liveRM   = kg > 0 && reps > 0 ? calc1RM(kg, reps) : 0;
  const isPR     = liveRM > best && best > 0;
  const isFirst  = best === 0 && liveRM > 0;
  const deltaRM  = Math.round((liveRM - best) * 10) / 10;

  const openRecordSheet = () => {
    setKg(lastEntry ? lastEntry.poids : 20);
    setReps(lastEntry ? lastEntry.reps : 6);
    setSheet("record");
  };
  const openObjSheet = () => { setObjVal(objKg || Math.round(best * 1.15) || 50); setSheet("objectif"); };

  // ── Sauvegarde record ──────────────────────────────────────────────────────
  const saveRecord = () => {
    if (!sel || kg <= 0 || reps <= 0) return;
    const entry = { poids: kg, reps, date: new Date().toLocaleDateString("fr-FR") };
    const u = JSON.parse(JSON.stringify(prog || {}));
    let found = false;
    (u.jours || []).forEach(j => (j.exercices || []).forEach(e => {
      if (e.nom === sel.nom) { e.historique = [...(e.historique || []), entry]; found = true; }
    }));
    if (!found) {
      if (!u.records) u.records = {};
      const cur = u.records[sel.nom];
      const arr = Array.isArray(cur) ? cur : (cur?.historique || []);
      u.records[sel.nom] = [...arr, entry];
    }
    setProg(u);
    push?.("Record enregistré");
    if (isPR || isFirst) { setConfetti(true); setTimeout(() => setConfetti(false), 2000); }
    setToast(isPR ? `Nouveau record · ${liveRM} kg 🏆` : "Performance enregistrée");
    setTimeout(() => setToast(""), 2600);
    setSheet(null);
  };

  // ── Sauvegarde objectif ────────────────────────────────────────────────────
  const saveObjectif = () => {
    if (!sel || objVal <= 0) return;
    const u = JSON.parse(JSON.stringify(prog || {}));
    if (!u.objectifs) u.objectifs = {};
    u.objectifs[sel.nom] = { cible: objVal, date: new Date().toLocaleDateString("fr-FR") };
    setProg(u);
    push?.("Objectif défini");
    setToast(`Cap fixé à ${objVal} kg`);
    setTimeout(() => setToast(""), 2600);
    setSheet(null);
  };

  // ── Courbe SVG ─────────────────────────────────────────────────────────────
  const SW = 300, SH = 128, PT = 14, PB = 22, PL = 6, PR = 6;
  const cW = SW - PL - PR, cH = SH - PT - PB;
  const rms = chart.map(s => s.rm);
  const hi  = Math.max(...(rms.length ? rms : [1]), objKg || 0, 1);
  const lo  = Math.min(...(rms.length ? rms : [0]));
  const sp  = (hi - lo) || 1;
  const pts = chart.map((s, i) => ({
    x: PL + (chart.length === 1 ? cW / 2 : (i / (chart.length - 1)) * cW),
    y: PT + cH - ((s.rm - lo) / sp) * cH, ...s,
  }));
  const poly = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const objY = objKg > 0 ? PT + cH - ((objKg - lo) / sp) * cH : 0;

  return (
    <div style={{ padding:"0 20px", fontFamily:F, position:"relative" }}>

      <style>{`
        @keyframes rpUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes rpDraw{from{stroke-dashoffset:640}to{stroke-dashoffset:0}}
        @keyframes rpSheet{from{transform:translateY(102%)}to{transform:translateY(0)}}
        @keyframes rpBackdrop{from{opacity:0}to{opacity:1}}
        @keyframes rpPop{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
        @keyframes rpFloaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes rpSweep{0%{transform:translateX(-100%)}100%{transform:translateX(220%)}}
        @keyframes rpPulse{0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,.45)}50%{box-shadow:0 0 0 9px rgba(59,130,246,0)}}
        @keyframes rpGrow{from{width:0}}
        @keyframes rpConf{0%{transform:translateY(-6px) rotate(0);opacity:1}100%{transform:translateY(360px) rotate(300deg);opacity:0}}
        @keyframes rpToast{0%{opacity:0;transform:translate(-50%,18px)}12%,88%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,8px)}}
        .rp-nos::-webkit-scrollbar{display:none}
        .rp-nos{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      <div style={{ padding:"14px 0 130px", maxWidth:500, margin:"0 auto",
        display:"flex", flexDirection:"column", gap:16 }}>

          {/* Retour */}
          <div onClick={onClose} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer",
            animation:"rpUp .4s cubic-bezier(.22,1,.36,1) both" }}>
            <I name="chevronLeft" size={18} color={BL}/>
            <span style={{ fontSize:15, fontWeight:700, color:BL }}>Retour</span>
          </div>

          {/* Titre */}
          <div style={{ display:"flex", flexDirection:"column", gap:5,
            animation:"rpUp .5s cubic-bezier(.22,1,.36,1) both" }}>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:".13em", color:"#9AA3B2" }}>PROGRESSION DE FORCE</span>
            <span style={{ fontSize:30, fontWeight:700, letterSpacing:"-.03em", lineHeight:1.02, color:"#0F1923" }}>
              Tes records & <span style={{ fontStyle:"italic", fontWeight:500, color:BL }}>objectifs</span>
            </span>
            <span style={{ fontSize:13.5, fontWeight:500, color:"#6B7280", lineHeight:1.45 }}>
              Bats ton max, puis vise la marche d'après. Ton 1RM, séance après séance.
            </span>
          </div>

          {/* Groupes */}
          {muscles.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:9,
              animation:"rpUp .5s cubic-bezier(.22,1,.36,1) .04s both" }}>
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:".1em", color:"#9AA3B2" }}>GROUPE MUSCULAIRE</span>
              <div className="rp-nos" style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:2 }}>
                {muscles.map(m => {
                  const on = m === selMuscle;
                  return (
                    <button key={m} onClick={() => { setSelMuscle(m); setSelExIdx(0); }} style={{
                      flex:"none", padding:"9px 16px", borderRadius:13, cursor:"pointer", fontFamily:F,
                      border: on ? "none" : "1px solid rgba(15,25,35,.06)",
                      background: on ? BL : "#fff", color: on ? "#fff" : "#6B7280",
                      fontSize:13, fontWeight: on ? 700 : 600,
                      boxShadow: on ? "0 8px 18px rgba(59,130,246,.35)" : "none",
                      transition:"all .18s cubic-bezier(.22,1,.36,1)",
                    }}>{m}</button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Exercices */}
          {exos.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:9,
              animation:"rpUp .5s cubic-bezier(.22,1,.36,1) .08s both" }}>
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:".1em", color:"#9AA3B2" }}>EXERCICE</span>
              <div className="rp-nos" style={{ display:"flex", gap:10, overflowX:"auto", padding:"2px 2px 4px" }}>
                {exos.map((ex, i) => {
                  const on = i === selExIdx;
                  return (
                    <div key={ex.nom} onClick={() => setSelExIdx(i)} style={{
                      flex:"none", width:172, boxSizing:"border-box", padding:15, borderRadius:20,
                      background:"#fff", cursor:"pointer",
                      border: on ? `1.5px solid ${BL}` : "1px solid rgba(15,25,35,.06)",
                      boxShadow: on ? "0 10px 26px rgba(59,130,246,.16)" : "0 2px 10px rgba(15,25,35,.04)",
                      transition:"all .2s cubic-bezier(.22,1,.36,1)",
                    }}>
                      <div style={{ fontSize:14.5, fontWeight:700, lineHeight:1.18, color:"#0F1923",
                        display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{ex.nom}</div>
                      <div style={{ fontSize:12, fontWeight:600, color:"#9AA3B2", marginTop:5 }}>{ex.mat || "—"}</div>
                      {ex.bestRM > 0
                        ? <div style={{ fontSize:12, fontWeight:700, color:BL2, marginTop:10 }}>{Math.round(ex.bestRM)} kg · record</div>
                        : <div style={{ fontSize:12, fontWeight:500, fontStyle:"italic", color:"#B4BCCA", marginTop:10 }}>Pas encore de données</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ HERO ═══ */}
          {sel && hasData ? (
            <div style={{ position:"relative", borderRadius:26, overflow:"hidden", background:"#0B0F1F",
              boxShadow:"0 22px 55px rgba(11,15,31,.5)", clipPath:"inset(0 round 26px)",
              animation:"rpUp .55s cubic-bezier(.22,1,.36,1) .12s both" }}>
              <div style={{ position:"absolute", top:-70, left:-46, width:230, height:230, borderRadius:"50%",
                background:`radial-gradient(circle,${BL},transparent 66%)`, filter:"blur(22px)", opacity:.5 }}/>
              <div style={{ position:"absolute", bottom:-80, right:-56, width:250, height:250, borderRadius:"50%",
                background:"radial-gradient(circle,#6366F1,transparent 66%)", filter:"blur(26px)", opacity:.42 }}/>
              <div style={{ position:"relative", padding:"20px 20px 22px" }}>
                <div style={{ display:"flex", alignItems:"center", marginBottom:16 }}>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:7,
                    background:AMB, borderRadius:99, padding:"6px 12px 6px 10px",
                    boxShadow:"0 4px 14px rgba(245,166,35,.4)" }}>
                    <I name="trophy" size={14} color="#fff"/>
                    <span style={{ fontSize:11, fontWeight:800, letterSpacing:".05em", color:"#fff" }}>RECORD PERSONNEL</span>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                  <span style={{ fontSize:60, fontWeight:700, letterSpacing:"-.05em", lineHeight:.9,
                    color:"#fff", fontVariantNumeric:"tabular-nums" }}>{Math.round(best)}</span>
                  <span style={{ fontSize:22, fontWeight:600, color:"rgba(255,255,255,.55)" }}>kg</span>
                  {pctUp > 0 && (
                    <span style={{ marginLeft:2, padding:"5px 10px", borderRadius:99, whiteSpace:"nowrap",
                      background:"rgba(16,185,129,.16)", border:"1px solid rgba(16,185,129,.3)",
                      fontSize:12, fontWeight:800, color:"#6EE7B7" }}>↗ +{pctUp}%</span>
                  )}
                </div>
                <span style={{ display:"block", fontSize:13, fontWeight:600, color:"rgba(255,255,255,.55)", marginTop:6 }}>
                  1RM estimé · {lastEntry.poids} kg × {lastEntry.reps} · {fmtD(lastEntry.date)}
                </span>
              </div>
            </div>
          ) : sel ? (
            /* ═══ 15d — ÉTAT VIDE ═══ */
            <div style={{ position:"relative", borderRadius:26, overflow:"hidden", background:"#0B0F1F",
              boxShadow:"0 22px 55px rgba(11,15,31,.5)", clipPath:"inset(0 round 26px)",
              animation:"rpUp .55s cubic-bezier(.22,1,.36,1) .12s both" }}>
              <div style={{ position:"absolute", top:-70, left:-46, width:230, height:230, borderRadius:"50%",
                background:`radial-gradient(circle,${BL},transparent 66%)`, filter:"blur(22px)", opacity:.5 }}/>
              <div style={{ position:"absolute", bottom:-80, right:-56, width:250, height:250, borderRadius:"50%",
                background:"radial-gradient(circle,#6366F1,transparent 66%)", filter:"blur(26px)", opacity:.42 }}/>
              <div style={{ position:"relative", padding:"24px 20px" }}>
                <div style={{ width:52, height:52, borderRadius:16, marginBottom:16,
                  background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.12)",
                  display:"grid", placeItems:"center", animation:"rpFloaty 3.4s ease-in-out infinite" }}>
                  <I name="trophy" size={26} color={AMB}/>
                </div>
                <span style={{ fontSize:26, fontWeight:700, letterSpacing:"-.03em", color:"#fff", lineHeight:1.1, display:"block" }}>
                  Ton premier record<br/>t'attend.
                </span>
                <span style={{ fontSize:13.5, fontWeight:500, color:"rgba(255,255,255,.55)", lineHeight:1.45, display:"block", marginTop:8 }}>
                  Entre une charge et des répétitions — on calcule ton 1RM pour toi.
                </span>
              </div>
            </div>
          ) : null}

          {/* ═══ OBJECTIF ═══ */}
          {sel && hasData ? (
            <div style={{ position:"relative", background:"#fff", border:"1px solid rgba(15,25,35,.06)",
              borderRadius:24, padding:18, overflow:"hidden", boxShadow:"0 2px 12px rgba(15,25,35,.05)",
              clipPath:"inset(0 round 24px)",
              animation:"rpUp .55s cubic-bezier(.22,1,.36,1) .16s both" }}>
              <div style={{ position:"absolute", top:-40, right:-30, width:150, height:150, borderRadius:"50%",
                background:"radial-gradient(circle,rgba(16,185,129,.14),transparent 70%)" }}/>
              <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <div style={{ width:32, height:32, borderRadius:10, background:"#D1FAE5", display:"grid", placeItems:"center" }}>
                    <I name="target" size={17} color={GRN2}/>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column" }}>
                    <span style={{ fontSize:16, fontWeight:700, lineHeight:1, color:"#0F1923" }}>Objectif</span>
                    <span style={{ fontSize:12, fontWeight:600, color:"#9AA3B2" }}>cap {objKg} kg 1RM</span>
                  </div>
                </div>
                <div onClick={openObjSheet} style={{ display:"inline-flex", alignItems:"center", gap:5, cursor:"pointer",
                  background:"rgba(59,130,246,.1)", borderRadius:10, padding:"7px 11px", fontSize:12, fontWeight:700, color:BL2 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={BL2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                  </svg>
                  Modifier
                </div>
              </div>
              {/* Route */}
              <div style={{ position:"relative", padding:"26px 4px 4px", marginBottom:16 }}>
                <div style={{ position:"relative", height:10, borderRadius:99, background:"#EEF0F5" }}>
                  <div style={{ position:"absolute", top:0, left:0, bottom:0, borderRadius:99,
                    background:`linear-gradient(90deg,${BL},${GRN})`, width:`${objPct}%`,
                    boxShadow:"0 2px 8px rgba(16,185,129,.35)",
                    animation:"rpGrow 1.1s cubic-bezier(.22,1,.36,1) both" }}/>
                  <div style={{ position:"absolute", top:"50%", left:0, transform:"translate(-50%,-50%)",
                    width:14, height:14, borderRadius:"50%", background:"#fff", border:"3px solid #C6CEDE" }}/>
                  <div style={{ position:"absolute", top:-24, left:0, transform:"translateX(-2px)",
                    fontSize:10.5, fontWeight:700, color:"#9AA3B2", whiteSpace:"nowrap" }}>
                    Départ <span style={{ color:"#0F1923" }}>{Math.round(first)}</span>
                  </div>
                  <div style={{ position:"absolute", top:"50%", left:`${objPct}%`, transform:"translate(-50%,-50%)",
                    width:18, height:18, borderRadius:"50%", background:BL, border:"3px solid #fff",
                    animation:"rpPulse 2.4s ease-out infinite" }}/>
                  <div style={{ position:"absolute", top:-24, left:`${objPct}%`, transform:"translateX(-50%)",
                    fontSize:10.5, fontWeight:800, color:BL2, whiteSpace:"nowrap" }}>Toi {Math.round(best)}</div>
                  <div style={{ position:"absolute", top:"50%", left:"100%", transform:"translate(-50%,-50%)",
                    width:24, height:24, borderRadius:8, background:GRN, display:"grid", placeItems:"center",
                    boxShadow:"0 4px 12px rgba(16,185,129,.4)" }}>
                    <I name="target" size={13} color="#fff"/>
                  </div>
                  <div style={{ position:"absolute", top:-24, right:0, transform:"translateX(6px)",
                    fontSize:10.5, fontWeight:700, color:GRN2, whiteSpace:"nowrap" }}>{objKg}</div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:12 }}>
                <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                  <span style={{ fontSize:11, fontWeight:700, letterSpacing:".06em", color:"#9AA3B2" }}>ENCORE</span>
                  <span style={{ fontSize:26, fontWeight:700, letterSpacing:"-.03em", lineHeight:1, color:"#0F1923" }}>{encore} kg</span>
                </div>
                {seancesLeft !== null && encore > 0 && (
                  <div style={{ flex:1, background:"#F5F9F7", border:"1px solid rgba(16,185,129,.16)", borderRadius:14, padding:"11px 13px" }}>
                    <span style={{ fontSize:12, fontWeight:600, color:"#4B5563", lineHeight:1.4 }}>
                      À ~{String(gainSeance).replace(".", ",")} kg/séance, il te reste environ {seancesLeft} séance{seancesLeft > 1 ? "s" : ""} pour y arriver.
                    </span>
                  </div>
                )}
                {encore === 0 && (
                  <div style={{ flex:1, background:"#ECFDF5", border:"1px solid rgba(16,185,129,.28)", borderRadius:14, padding:"11px 13px" }}>
                    <span style={{ fontSize:12, fontWeight:700, color:GRN2, lineHeight:1.4 }}>Objectif atteint 🏆 — fixe-toi un nouveau cap.</span>
                  </div>
                )}
              </div>
            </div>
          ) : sel ? (
            /* Invitation objectif (état vide) */
            <div onClick={openObjSheet} style={{ position:"relative", background:"#fff",
              border:"1.5px dashed rgba(16,185,129,.4)", borderRadius:24, padding:20, cursor:"pointer",
              boxShadow:"0 2px 12px rgba(15,25,35,.04)", display:"flex", alignItems:"center", gap:14,
              animation:"rpUp .55s cubic-bezier(.22,1,.36,1) .16s both" }}>
              <div style={{ width:46, height:46, borderRadius:14, background:"#D1FAE5", display:"grid", placeItems:"center", flex:"none" }}>
                <I name="target" size={22} color={GRN2}/>
              </div>
              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:2 }}>
                <span style={{ fontSize:16, fontWeight:700, color:"#0F1923" }}>Fixe-toi un cap</span>
                <span style={{ fontSize:12.5, fontWeight:500, color:"#6B7280", lineHeight:1.4 }}>
                  Un objectif chiffré rend chaque séance plus lisible. On te trace la route.
                </span>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GRN2} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          ) : null}

          {/* ═══ COURBE ═══ */}
          {sel && (
            <div style={{ background:"#fff", border:"1px solid rgba(15,25,35,.06)", borderRadius:24,
              padding:"18px 18px 16px", boxShadow:"0 2px 12px rgba(15,25,35,.05)",
              animation:"rpUp .55s cubic-bezier(.22,1,.36,1) .2s both" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, gap:10 }}>
                <span style={{ fontSize:16, fontWeight:700, color:"#0F1923" }}>Évolution du 1RM</span>
                <div style={{ display:"flex", gap:3, background:"#F1F3F8", borderRadius:10, padding:3 }}>
                  {["1M","3M","6M","1A","Tout"].map(p => {
                    const on = period === p;
                    return (
                      <button key={p} onClick={() => setPeriod(p)} style={{
                        padding:"6px 9px", borderRadius:8, border:"none", cursor:"pointer", fontFamily:F,
                        fontSize:12, fontWeight: on ? 700 : 600,
                        background: on ? "#fff" : "transparent", color: on ? "#0F1923" : "#9AA3B2",
                        boxShadow: on ? "0 1px 4px rgba(0,0,0,.08)" : "none",
                      }}>{p}</button>
                    );
                  })}
                </div>
              </div>
              {chart.length >= 2 ? (
                <svg width="100%" height={SH} viewBox={`0 0 ${SW} ${SH}`} preserveAspectRatio="none" style={{ overflow:"visible", display:"block" }}>
                  <defs>
                    <linearGradient id="rpGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={BL} stopOpacity="0.18"/>
                      <stop offset="100%" stopColor={BL} stopOpacity="0.01"/>
                    </linearGradient>
                  </defs>
                  {objKg > 0 && objY > PT && objY < PT + cH && (
                    <>
                      <line x1={PL} x2={PL+cW} y1={objY} y2={objY} stroke="rgba(16,185,129,.45)" strokeWidth="1.2" strokeDasharray="5 4"/>
                      <text x={PL+cW-2} y={objY-5} fontSize="9" fill={GRN2} textAnchor="end" fontWeight="800" fontFamily={F}>Objectif {objKg}</text>
                    </>
                  )}
                  <polygon points={`${PL},${PT+cH} ${poly} ${PL+cW},${PT+cH}`} fill="url(#rpGrad)"/>
                  <polyline points={poly} fill="none" stroke={BL} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray="640" style={{ animation:"rpDraw 1.2s cubic-bezier(.22,1,.36,1) both" }}/>
                  {pts.map((p, k) => {
                    const isLast = k === pts.length - 1;
                    return (
                      <g key={k}>
                        <circle cx={p.x} cy={p.y} r={isLast ? 5.5 : 4}
                          fill={isLast ? BL : "#fff"} stroke={isLast ? "#fff" : "#C6CEDE"} strokeWidth={isLast ? 2.5 : 2}
                          style={isLast ? { animation:"rpPop .4s cubic-bezier(.22,1,.36,1) 1s both" } : undefined}/>
                        {isLast && <text x={p.x-8} y={p.y-10} fontSize="10" fontWeight="800" fill={BL2} textAnchor="end" fontFamily={F}>{Math.round(p.rm)} kg</text>}
                      </g>
                    );
                  })}
                  <text x={pts[0].x} y={SH-4} fontSize="9" fill="#9AA3B2" textAnchor="start" fontFamily={F}>{fmtD(chart[0].date)}</text>
                  <text x={pts[pts.length-1].x} y={SH-4} fontSize="9" fill="#9AA3B2" textAnchor="end" fontFamily={F}>{fmtD(chart[chart.length-1].date)}</text>
                </svg>
              ) : (
                <div style={{ padding:"26px 0", textAlign:"center", fontSize:13, fontWeight:500, color:"#9AA3B2" }}>
                  {chart.length === 1 ? "Encore une perf et ta courbe d'évolution apparaît ici." : "Aucune donnée sur cette période."}
                </div>
              )}
            </div>
          )}

          {/* ═══ TRIO ═══ */}
          {sel && hasData && (
            <div style={{ display:"flex", gap:10, animation:"rpUp .55s cubic-bezier(.22,1,.36,1) .24s both" }}>
              {[
                { l:"DÉPART", dot:"#C6CEDE", lc:"#9AA3B2", v:first, bd:"rgba(15,25,35,.06)",   sh:"0 2px 10px rgba(15,25,35,.04)" },
                { l:"RECORD", dot:AMB,       lc:"#C77E12", v:best,  bd:"rgba(245,158,11,.22)", sh:"0 2px 10px rgba(245,158,11,.08)" },
                { l:"ACTUEL", dot:GRN,       lc:GRN2,      v:last,  bd:"rgba(16,185,129,.22)", sh:"0 2px 10px rgba(16,185,129,.08)" },
              ].map(s => (
                <div key={s.l} style={{ flex:1, background:"#fff", border:`1px solid ${s.bd}`, borderRadius:18,
                  padding:"14px 12px", display:"flex", flexDirection:"column", gap:7, boxShadow:s.sh }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ width:8, height:8, borderRadius:"50%", background:s.dot }}/>
                    <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:".05em", color:s.lc }}>{s.l}</span>
                  </div>
                  <span style={{ fontSize:22, fontWeight:700, letterSpacing:"-.02em", lineHeight:1, color:"#0F1923" }}>
                    {Math.round(s.v)}<span style={{ fontSize:12, fontWeight:600, color:"#9AA3B2" }}> kg</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ═══ DERNIÈRES PERFS ═══ */}
          {sel && hasData && (
            <div style={{ background:"#fff", border:"1px solid rgba(15,25,35,.06)", borderRadius:22,
              padding:"16px 18px", boxShadow:"0 2px 12px rgba(15,25,35,.05)",
              animation:"rpUp .55s cubic-bezier(.22,1,.36,1) .28s both" }}>
              <span style={{ fontSize:13, fontWeight:700, color:"#0F1923" }}>Dernières perfs</span>
              <div style={{ display:"flex", flexDirection:"column", marginTop:8 }}>
                {chart.slice(-6).reverse().map((s, i) => {
                  const isBest = Math.round(s.rm) === Math.round(best);
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"9px 0", borderTop:"1px solid rgba(15,25,35,.05)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                        <span style={{ fontSize:11, fontWeight:600, color:"#9AA3B2", fontVariantNumeric:"tabular-nums", minWidth:36 }}>{fmtD(s.date)}</span>
                        <span style={{ fontSize:13.5, fontWeight:600, color:"#0F1923" }}>{s.poids} kg × {s.reps}</span>
                        {isBest && <span style={{ fontSize:9.5, fontWeight:800, color:"#C77E12",
                          background:"rgba(245,158,11,.14)", borderRadius:6, padding:"2px 6px", letterSpacing:".05em" }}>PR</span>}
                      </div>
                      <span style={{ fontSize:13, fontWeight:700, fontVariantNumeric:"tabular-nums",
                        color: isBest ? "#C77E12" : "#0F1923" }}>{Math.round(s.rm)} kg</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

      </div>

      {/* ═══ CTA FLOTTANT (fixe, au-dessus de la BottomNav) ═══ */}
      <div style={{ position:"fixed", left:0, right:0, bottom:"calc(64px + env(safe-area-inset-bottom))",
        padding:"0 18px", pointerEvents:"none", zIndex:150 }}>
        <button onClick={openRecordSheet} style={{
          position:"relative", overflow:"hidden", width:"100%", pointerEvents:"auto", cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center", gap:10, fontFamily:F,
          background:BL, borderRadius:18, padding:16, border:"none",
          boxShadow:"0 14px 34px rgba(59,130,246,.5)" }}>
          <span style={{ position:"absolute", top:0, left:0, height:"100%", width:"35%", pointerEvents:"none",
            background:"linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent)",
            animation:"rpSweep 3.4s ease-in-out 1.4s infinite" }}/>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          <span style={{ fontSize:16, fontWeight:700, color:"#fff" }}>
            {hasData ? "Ajouter un record" : "Ajouter mon premier record"}
          </span>
        </button>
      </div>

      {/* ═══ 15b — FEUILLE RECORD ═══ */}
      {sheet === "record" && sel && (
        <>
          <div onClick={() => setSheet(null)} style={{ position:"fixed", inset:0, zIndex:610,
            background:"rgba(11,15,31,.5)", backdropFilter:"blur(3px)", animation:"rpBackdrop .3s ease both" }}/>
          <div style={{ position:"fixed", left:0, right:0, bottom:0, zIndex:611, background:"#fff",
            borderRadius:"28px 28px 0 0", padding:"8px 20px 26px", maxHeight:"88%", overflowY:"auto",
            boxShadow:"0 -12px 40px rgba(11,15,31,.28)", animation:"rpSheet .45s cubic-bezier(.22,1,.36,1) both" }}
            className="rp-nos">
            <div style={{ width:38, height:5, borderRadius:99, background:"#E1E5EE", margin:"8px auto 16px" }}/>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18, gap:12 }}>
              <div style={{ display:"flex", flexDirection:"column", gap:3, minWidth:0 }}>
                <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:".1em", color:"#9AA3B2" }}>NOUVELLE PERFORMANCE</span>
                <span style={{ fontSize:21, fontWeight:700, letterSpacing:"-.02em", lineHeight:1.15, color:"#0F1923" }}>{sel.nom}</span>
              </div>
              <div onClick={() => setSheet(null)} style={{ width:36, height:36, borderRadius:11, flex:"none", cursor:"pointer",
                background:"#F1F3F8", display:"grid", placeItems:"center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
              </div>
            </div>

            <span style={{ fontSize:12, fontWeight:700, color:"#6B7280" }}>Charge soulevée</span>
            <div style={{ display:"flex", alignItems:"center", gap:12, margin:"9px 0 18px" }}>
              <div onClick={() => setKg(v => Math.max(0, Math.round((v - 2.5) * 10) / 10))}
                style={{ width:52, height:52, borderRadius:16, background:"#F1F3F8", display:"grid", placeItems:"center", flex:"none", cursor:"pointer" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F1923" strokeWidth="2.6" strokeLinecap="round"><path d="M5 12h14"/></svg>
              </div>
              <div style={{ flex:1, textAlign:"center" }}>
                <span style={{ fontSize:38, fontWeight:700, letterSpacing:"-.03em", fontVariantNumeric:"tabular-nums", color:"#0F1923" }}>
                  {String(kg).replace(".", ",")}
                </span>
                <span style={{ fontSize:16, fontWeight:600, color:"#9AA3B2" }}> kg</span>
              </div>
              <div onClick={() => setKg(v => Math.round((v + 2.5) * 10) / 10)}
                style={{ width:52, height:52, borderRadius:16, background:BL, display:"grid", placeItems:"center", flex:"none",
                  cursor:"pointer", boxShadow:"0 8px 18px rgba(59,130,246,.4)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              </div>
            </div>

            <span style={{ fontSize:12, fontWeight:700, color:"#6B7280" }}>Répétitions</span>
            <div style={{ display:"flex", gap:7, margin:"9px 0 18px" }}>
              {REPS_PRESETS.map(r => {
                const on = reps === r;
                return (
                  <button key={r} onClick={() => setReps(r)} style={{
                    flex:1, padding:"11px 0", borderRadius:12, cursor:"pointer", fontFamily:F, fontSize:14,
                    border: on ? `1px solid ${BL}` : "1px solid rgba(15,25,35,.08)",
                    background: on ? "rgba(59,130,246,.1)" : "#fff",
                    color: on ? BL2 : "#6B7280", fontWeight: on ? 700 : 600,
                    transition:"all .15s",
                  }}>{r}</button>
                );
              })}
            </div>

            <div style={{ borderRadius:18, padding:"16px 18px", marginBottom:18,
              background: (isPR || isFirst) ? "#ECFDF5" : "#F7F8FB",
              border: (isPR || isFirst) ? "1px solid rgba(16,185,129,.28)" : "1px solid rgba(15,25,35,.06)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                  <span style={{ fontSize:11, fontWeight:700, letterSpacing:".05em", color:"#6B7280" }}>1RM ESTIMÉ</span>
                  <span style={{ fontSize:13, fontWeight:600, color: (isPR || isFirst) ? GRN2 : "#9AA3B2" }}>
                    {isFirst ? "Ton premier record !" : isPR ? `+${deltaRM} kg — nouveau record !` : best > 0 ? `${Math.round(best - liveRM)} kg sous ton record` : "—"}
                  </span>
                </div>
                <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                  <span style={{ fontSize:36, fontWeight:700, letterSpacing:"-.03em", fontVariantNumeric:"tabular-nums",
                    color: (isPR || isFirst) ? GRN2 : "#0F1923" }}>{liveRM || "—"}</span>
                  <span style={{ fontSize:15, fontWeight:600, color:"#9AA3B2" }}>kg</span>
                </div>
              </div>
            </div>

            <button onClick={saveRecord} disabled={kg <= 0} style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:9, fontFamily:F,
              background: kg > 0 ? BL : "#C6CEDE", borderRadius:16, padding:16, border:"none",
              color:"#fff", fontSize:16, fontWeight:700, cursor: kg > 0 ? "pointer" : "default",
              boxShadow: kg > 0 ? "0 12px 30px rgba(59,130,246,.42)" : "none" }}>
              Valider ce record {(isPR || isFirst) ? "🏆" : ""}
            </button>
          </div>
        </>
      )}

      {/* ═══ 15c — FEUILLE OBJECTIF ═══ */}
      {sheet === "objectif" && sel && (
        <>
          <div onClick={() => setSheet(null)} style={{ position:"fixed", inset:0, zIndex:610,
            background:"rgba(11,15,31,.5)", backdropFilter:"blur(3px)", animation:"rpBackdrop .3s ease both" }}/>
          <div style={{ position:"fixed", left:0, right:0, bottom:0, zIndex:611, background:"#fff",
            borderRadius:"28px 28px 0 0", padding:"8px 20px 26px", maxHeight:"88%", overflowY:"auto",
            boxShadow:"0 -12px 40px rgba(11,15,31,.28)", animation:"rpSheet .45s cubic-bezier(.22,1,.36,1) both" }}
            className="rp-nos">
            <div style={{ width:38, height:5, borderRadius:99, background:"#E1E5EE", margin:"8px auto 16px" }}/>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18, gap:12 }}>
              <div style={{ display:"flex", flexDirection:"column", gap:3, minWidth:0 }}>
                <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:".1em", color:GRN2 }}>TON CAP</span>
                <span style={{ fontSize:21, fontWeight:700, letterSpacing:"-.02em", lineHeight:1.15, color:"#0F1923" }}>{sel.nom}</span>
              </div>
              <div onClick={() => setSheet(null)} style={{ width:36, height:36, borderRadius:11, flex:"none", cursor:"pointer",
                background:"#F1F3F8", display:"grid", placeItems:"center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
              </div>
            </div>

            <div style={{ textAlign:"center", padding:"6px 0 4px" }}>
              <span style={{ fontSize:12, fontWeight:600, color:"#9AA3B2" }}>
                {best > 0 ? `Record actuel · ${Math.round(best)} kg` : "Pas encore de record sur cet exercice"}
              </span>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:12, margin:"6px 0 18px" }}>
              <div onClick={() => setObjVal(v => Math.max(1, v - 1))}
                style={{ width:52, height:52, borderRadius:16, background:"#F1F3F8", display:"grid", placeItems:"center", flex:"none", cursor:"pointer" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F1923" strokeWidth="2.6" strokeLinecap="round"><path d="M5 12h14"/></svg>
              </div>
              <div style={{ flex:1, textAlign:"center" }}>
                <span style={{ fontSize:44, fontWeight:700, letterSpacing:"-.03em", color:GRN2, fontVariantNumeric:"tabular-nums" }}>{objVal}</span>
                <span style={{ fontSize:17, fontWeight:600, color:"#9AA3B2" }}> kg</span>
              </div>
              <div onClick={() => setObjVal(v => v + 1)}
                style={{ width:52, height:52, borderRadius:16, background:GRN, display:"grid", placeItems:"center", flex:"none",
                  cursor:"pointer", boxShadow:"0 8px 18px rgba(16,185,129,.4)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              </div>
            </div>

            {best > 0 && (
              <div style={{ display:"flex", gap:7, marginBottom:16 }}>
                {[1.10, 1.17, 1.25].map(mult => {
                  const v = Math.round(best * mult);
                  const on = objVal === v;
                  return (
                    <button key={mult} onClick={() => setObjVal(v)} style={{
                      flex:1, padding:"10px 0", borderRadius:12, cursor:"pointer", fontFamily:F, fontSize:13,
                      border: on ? `1px solid ${GRN}` : "1px solid rgba(15,25,35,.08)",
                      background: on ? "rgba(16,185,129,.1)" : "#fff",
                      color: on ? GRN2 : "#6B7280", fontWeight: on ? 700 : 600,
                      transition:"all .15s",
                    }}>{v} kg</button>
                  );
                })}
              </div>
            )}

            <div style={{ background:"#F5F9F7", border:"1px solid rgba(16,185,129,.16)", borderRadius:16,
              padding:"14px 16px", marginBottom:18, display:"flex", alignItems:"center", gap:10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GRN2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="4"/>
              </svg>
              <span style={{ fontSize:12.5, fontWeight:600, color:"#4B5563", lineHeight:1.4 }}>
                {best > 0
                  ? `Soit +${Math.max(0, objVal - Math.round(best))} kg sur ton record actuel. Un cap réaliste se joue sur 2 à 4 mois.`
                  : "Enregistre d'abord un record pour caler un cap réaliste."}
              </span>
            </div>

            <button onClick={saveObjectif} disabled={objVal <= 0} style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:9, fontFamily:F,
              background: objVal > 0 ? GRN : "#C6CEDE", borderRadius:16, padding:16, border:"none",
              color:"#fff", fontSize:16, fontWeight:700, cursor: objVal > 0 ? "pointer" : "default",
              boxShadow: objVal > 0 ? "0 12px 30px rgba(16,185,129,.42)" : "none" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              Définir cet objectif
            </button>
          </div>
        </>
      )}

      {/* ═══ CONFETTIS ═══ */}
      {confetti && (
        <div style={{ position:"fixed", inset:0, zIndex:620, pointerEvents:"none", overflow:"hidden" }}>
          {[
            { l:"14%", w:8, h:10, c:BL,        r:2,     d:".1s",  t:"1.6s" },
            { l:"28%", w:7, h:7,  c:GRN,       r:"50%", d:".25s", t:"1.9s" },
            { l:"42%", w:9, h:6,  c:AMB,       r:2,     d:"0s",   t:"1.5s" },
            { l:"56%", w:7, h:9,  c:"#6366F1", r:2,     d:".35s", t:"1.8s" },
            { l:"70%", w:8, h:8,  c:"#34D399", r:"50%", d:".15s", t:"1.7s" },
            { l:"84%", w:6, h:9,  c:BL2,       r:2,     d:".45s", t:"1.6s" },
          ].map((c, i) => (
            <span key={i} style={{ position:"absolute", top:"36%", left:c.l, width:c.w, height:c.h,
              background:c.c, borderRadius:c.r,
              animation:`rpConf ${c.t} cubic-bezier(.4,0,.7,1) ${c.d} both` }}/>
          ))}
        </div>
      )}

      {/* ═══ TOAST ═══ */}
      {toast && (
        <div style={{ position:"fixed", left:"50%", bottom:96, zIndex:630, transform:"translateX(-50%)",
          background:"#0F1923", color:"#fff", borderRadius:14, padding:"12px 18px",
          fontSize:13.5, fontWeight:700, whiteSpace:"nowrap", fontFamily:F,
          boxShadow:"0 12px 30px rgba(15,25,35,.3)", animation:"rpToast 2.6s ease both" }}>
          {toast}
        </div>
      )}

    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function dnum(d) {
  if (!d) return 0;
  const p = String(d).split(/[-/]/);
  if (p.length !== 3) return 0;
  // "30/07/2026" (fr) ou "2026-07-30" (iso)
  const [a, b, c] = p.map(Number);
  return a > 31 ? new Date(a, b - 1, c).getTime() : new Date(c, b - 1, a).getTime();
}
function fmtD(d) {
  if (!d) return "—";
  const p = String(d).split(/[-/]/);
  if (p.length !== 3) return String(d);
  return Number(p[0]) > 31 ? `${p[2]}/${p[1]}` : `${p[0]}/${p[1]}`;
}
