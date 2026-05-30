import { useState, useEffect } from "react";
import { C, FONT, SERIF, NUM } from "../../data/constants.js";
import { Card, Eyebrow } from "../../components/ui/index.jsx";
import {
  avg, statusBadge, microStatus,
  computeBilan, buildBilanPrompt,
  Badge, SectionHeader, MacroRow,
} from "./components/BilanUtils.jsx";

export default function BilanNutrition({
  onBack, repasHistory, calObj, pObj, gObj, lObj, profil, obj, premium,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [analyse, setAnalyse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calcul statistiques
  const bilan = useMemo(() =>
    computeBilan(repasHistory, calObj, pObj, gObj, lObj, profil),
    [repasHistory, calObj, pObj, gObj, lObj]
  );

  // Score ring
  const score = parseFloat(bilan.score);
  const r = 44, circum = 2 * Math.PI * r;
  const pctRing = score / 10;
  const nextBilanDate = new Date(Date.now() + 14 * 86400000)
    .toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" });

  // Générer le bilan détaillé via API
  const generateAnalyse = async () => {
    if (analyse) { setActiveTab(1); return; }
    setLoading(true); setError(null); setActiveTab(1);
    try {
      const prompt = buildBilanPrompt(bilan, profil, obj, calObj, pObj, gObj, lObj);
      const res = await fetch("/api/generate", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-haiku-4-5-20251001",
          max_tokens:2000,
          messages:[{ role:"user", content:prompt }],
        }),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json\n?|\n?```/g,"").trim();
      setAnalyse(JSON.parse(clean));
    } catch(e) {
      setError("L'analyse n'a pas pu être générée. Réessaie dans quelques instants.");
    } finally {
      setLoading(false);
    }
  };

  const MICRO_LABELS = {
    fer:"Fer", vitamine_b12:"Vitamine B12", calcium:"Calcium",
    magnesium:"Magnésium", zinc:"Zinc", vitamine_d:"Vitamine D",
    omega3:"Oméga-3", vitamine_c:"Vitamine C",
  };

  return (
    <div style={{ background:C.bg, minHeight:"100vh", paddingBottom:90 }}>

      {/* ── Header sticky ── */}
      <div style={{
        position:"sticky", top:0, zIndex:50,
        background:"rgba(11,18,32,0.95)", backdropFilter:"blur(20px)",
        WebkitBackdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(255,255,255,0.07)", paddingBottom:0,
      }}>
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center", padding:"14px 16px 12px" }}>
          <button onClick={onBack} className="tap-icon" style={{
            width:34, height:34, borderRadius:10,
            background:C.s1, border:"1px solid rgba(255,255,255,0.07)",
            display:"grid", placeItems:"center", cursor:"pointer",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                 stroke="rgba(242,244,247,0.55)" strokeWidth="2.2" strokeLinecap="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#F2F4F7",
              fontFamily:FONT }}>Bilan nutritionnel</div>
            <div style={{ fontSize:11, color:"rgba(242,244,247,0.38)",
              fontFamily:FONT }}>14 derniers jours</div>
          </div>
          <div style={{ width:34, height:34, borderRadius:10,
            background:"rgba(59,130,246,0.10)",
            border:"1px solid rgba(59,130,246,0.20)",
            display:"grid", placeItems:"center" }}>
            <span style={{ fontSize:10, fontWeight:700, color:"#3B82F6",
              fontFamily:FONT }}>PRO</span>
          </div>
        </div>

        {/* Onglets */}
        <div style={{ display:"flex", padding:"0 16px", gap:4 }}>
          {["📊 Tableau de bord", "🧠 Analyse détaillée"].map((t, i) => (
            <button key={i} onClick={() => i === 1 ? generateAnalyse() : setActiveTab(0)} style={{
              flex:1, padding:"10px 8px", background:"transparent", border:"none",
              borderBottom:`2px solid ${activeTab === i ? "#3B82F6" : "transparent"}`,
              color: activeTab === i ? "#F2F4F7" : "rgba(242,244,247,0.45)",
              fontSize:13, fontWeight: activeTab === i ? 600 : 500,
              fontFamily:FONT, cursor:"pointer", transition:"all .2s", textAlign:"center",
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════ */}
      {/* ONGLET 1 — Tableau de bord              */}
      {/* ════════════════════════════════════════ */}
      {activeTab === 0 && (
        <div className="anim" style={{ padding:"14px 16px 20px" }}>

          {/* Score global */}
          <Card style={{ textAlign:"center", padding:"20px 16px" }}>
            <Eyebrow style={{ marginBottom:14 }}>Score cohérence nutrition / objectif</Eyebrow>
            <div style={{ position:"relative", width:110, height:110, margin:"0 auto 8px" }}>
              <svg width="110" height="110" viewBox="0 0 110 110">
                <defs>
                  <linearGradient id="bilanRing" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563EB"/>
                    <stop offset="100%" stopColor="#34D399"/>
                  </linearGradient>
                </defs>
                <g transform="rotate(-90 55 55)">
                  <circle cx="55" cy="55" r={r} fill="none"
                    stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
                  <circle cx="55" cy="55" r={r} fill="none"
                    stroke="url(#bilanRing)" strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={circum}
                    strokeDashoffset={circum * (1 - pctRing)}
                    style={{ transition:"stroke-dashoffset 1s ease" }}/>
                </g>
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex",
                flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <div style={{ fontFamily:SERIF, fontSize:34, color:"#F2F4F7",
                  lineHeight:1, letterSpacing:-1, ...NUM }}>{bilan.score}</div>
                <div style={{ fontSize:10, color:"rgba(242,244,247,0.38)",
                  fontFamily:FONT, marginTop:1 }}>/10</div>
              </div>
            </div>
            <div style={{ fontSize:14, fontWeight:700, color:"#F2F4F7",
              fontFamily:FONT, marginBottom:5 }}>
              {score >= 8 ? "Excellent travail 🔥" : score >= 6 ? "Bonne progression 👍" : "Des progrès à faire 💪"}
            </div>
            <div style={{ fontSize:12, color:"rgba(242,244,247,0.50)",
              lineHeight:1.55, fontFamily:FONT }}>
              {bilan.daysOk} jours dans la cible sur {bilan.totalDays}
            </div>
          </Card>

          {/* Profil */}
          <Card style={{ padding:"12px 16px" }}>
            <Eyebrow>Profil analysé</Eyebrow>
            <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
              {obj && (
                <span style={{ padding:"3px 9px", borderRadius:6,
                  background:"rgba(59,130,246,0.10)",
                  border:"1px solid rgba(59,130,246,0.20)",
                  fontSize:11, color:"#93C5FD", fontWeight:500, fontFamily:FONT }}>
                  🏋️ {obj.l}
                </span>
              )}
              {(profil.regime === "vegetarien" || profil.regime === "vegan") && (
                <span style={{ padding:"3px 9px", borderRadius:6,
                  background:"rgba(52,211,153,0.08)",
                  border:"1px solid rgba(52,211,153,0.18)",
                  fontSize:11, color:"#34D399", fontWeight:500, fontFamily:FONT }}>
                  🌱 {profil.regime === "vegan" ? "Vegan" : "Végétarien"}
                </span>
              )}
              {calObj > 0 && (
                <span style={{ padding:"3px 9px", borderRadius:6,
                  background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.08)",
                  fontSize:11, color:"rgba(242,244,247,0.55)", fontWeight:500, fontFamily:FONT }}>
                  ⚡ TDEE {calObj} kcal
                </span>
              )}
            </div>
          </Card>

          {/* Calories */}
          <Card>
            <Eyebrow>Calories · Moyenne journalière</Eyebrow>
            <div style={{ display:"flex", alignItems:"baseline", gap:8, margin:"8px 0 4px" }}>
              <span style={{ fontFamily:SERIF, fontSize:30, color:"#F2F4F7",
                letterSpacing:-1, ...NUM }}>
                {Math.round(bilan.avgKcal).toLocaleString("fr-FR")}
              </span>
              <span style={{ fontSize:12, color:"rgba(242,244,247,0.38)", fontFamily:FONT }}>kcal/j</span>
              <span style={{ marginLeft:"auto", padding:"3px 9px", borderRadius:6, fontSize:11,
                fontWeight:600, fontFamily:FONT, ...NUM,
                ...statusBadge(bilan.pctKcal) }}>
                {bilan.pctKcal >= 100 ? "+" : ""}{Math.round(bilan.avgKcal - calObj)} kcal
              </span>
            </div>
            <div style={{ fontSize:12, color:"rgba(242,244,247,0.45)",
              marginBottom:12, fontFamily:FONT }}>
              Cible : {calObj} kcal · {bilan.pctKcal}% atteint
            </div>
            {/* Mini sparkline statique placeholder */}
            <div style={{ height:3, background:"rgba(255,255,255,0.06)",
              borderRadius:2, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${Math.min(100, bilan.pctKcal)}%`,
                background:"#3B82F6", borderRadius:2 }}/>
            </div>
          </Card>

          {/* Macros */}
          <Card>
            <Eyebrow style={{ marginBottom:14 }}>Macronutriments · Moyenne 14 jours</Eyebrow>
            <MacroRow label="Protéines" color="#60A5FA"
              value={bilan.avgProt} goal={pObj} pct={bilan.pctProt}/>
            <MacroRow label="Glucides" color="#22D3EE"
              value={bilan.avgGluc} goal={gObj} pct={bilan.pctGluc}/>
            <div style={{ marginBottom:0 }}>
              <MacroRow label="Lipides" color="#34D399"
                value={bilan.avgLip} goal={lObj} pct={bilan.pctLip}/>
            </div>
          </Card>

          {/* Jours de cohérence */}
          <Card>
            <Eyebrow style={{ marginBottom:10 }}>Régularité · {bilan.totalDays} jours</Eyebrow>
            <div style={{ display:"flex", flexWrap:"wrap", gap:2, marginBottom:10 }}>
              {Array.from({ length: bilan.totalDays }).map((_, i) => {
                const isOk   = i < bilan.daysOk;
                const isWarn = !isOk && i < bilan.daysOk + bilan.daysWarn;
                const bg  = isOk ? "rgba(52,211,153,0.14)" : isWarn ? "rgba(251,191,36,0.12)" : "rgba(248,113,113,0.12)";
                const col = isOk ? "#34D399" : isWarn ? "#FBBF24" : "#F87171";
                return (
                  <div key={i} style={{ width:28, height:28, borderRadius:8,
                    background:bg, color:col, display:"grid", placeItems:"center",
                    fontSize:11, fontWeight:600, fontFamily:FONT, margin:2 }}>
                    {i + 1}
                  </div>
                );
              })}
            </div>
            <div style={{ display:"flex", gap:14 }}>
              {[
                { c:"#34D399", l:`${bilan.daysOk} jours ✅` },
                { c:"#FBBF24", l:`${bilan.daysWarn} moyen` },
                { c:"#F87171", l:`${bilan.daysBad} hors cible` },
              ].map(x => (
                <div key={x.l} style={{ display:"flex", alignItems:"center",
                  gap:5, fontSize:11, color:"rgba(242,244,247,0.50)", fontFamily:FONT }}>
                  <span style={{ width:8, height:8, borderRadius:2,
                    background:x.c, display:"inline-block" }}/>
                  {x.l}
                </div>
              ))}
            </div>
          </Card>

          {/* Hydratation */}
          <Card>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <Eyebrow>Hydratation moyenne</Eyebrow>
                <div style={{ display:"flex", alignItems:"baseline", gap:6, marginTop:4 }}>
                  <span style={{ fontFamily:SERIF, fontSize:26, color:"#F2F4F7", ...NUM }}>
                    {(bilan.avgEau * 0.25).toFixed(1)}L
                  </span>
                  <span style={{ fontSize:12, color:"rgba(242,244,247,0.38)", fontFamily:FONT }}>
                    / 2L recommandés
                  </span>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <Badge {...(bilan.avgEau >= 7 ?
                  { label:"Bon", color:"#34D399", bg:"rgba(52,211,153,0.10)", bd:"rgba(52,211,153,0.22)" } :
                  bilan.avgEau >= 5 ?
                  { label:"À améliorer", color:"#FBBF24", bg:"rgba(251,191,36,0.10)", bd:"rgba(251,191,36,0.22)" } :
                  { label:"Insuffisant", color:"#F87171", bg:"rgba(248,113,113,0.10)", bd:"rgba(248,113,113,0.22)" }
                )}/>
              </div>
            </div>
          </Card>

          {/* CTA Analyse détaillée */}
          <button className="tap" onClick={generateAnalyse} style={{
            width:"100%", padding:"13px 16px",
            background:"linear-gradient(135deg,#1E40AF,#3B82F6)",
            border:"1px solid rgba(255,255,255,0.15)", borderRadius:14,
            color:"#fff", fontFamily:FONT, fontSize:14, fontWeight:600,
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            cursor:"pointer", boxShadow:"0 4px 14px rgba(59,130,246,0.30)",
            marginTop:4,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a8 8 0 0 1-12 7l-5 1 1-5A8 8 0 1 1 21 12z"/>
              <path d="M8 12h.01M12 12h.01M16 12h.01"/>
            </svg>
            Voir l'analyse détaillée
          </button>

          {/* Prochain bilan */}
          <div style={{ background:"rgba(59,130,246,0.06)",
            border:"1px solid rgba(59,130,246,0.18)", borderRadius:14,
            padding:"14px 16px", marginTop:10,
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <Eyebrow style={{ color:"rgba(59,130,246,0.70)", marginBottom:3 }}>
                Prochain bilan
              </Eyebrow>
              <div style={{ fontSize:14, fontWeight:600, color:"#F2F4F7", fontFamily:FONT }}>
                {nextBilanDate}
              </div>
              <div style={{ fontSize:11.5, color:"rgba(242,244,247,0.38)",
                fontFamily:FONT, marginTop:1 }}>dans 14 jours</div>
            </div>
            <div style={{ width:42, height:42, borderRadius:12,
              background:"#3B82F6", display:"grid", placeItems:"center",
              boxShadow:"0 4px 12px rgba(59,130,246,0.30)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                   stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
            </div>
          </div>

        </div>
      )}

      {/* ════════════════════════════════════════ */}
      {/* ONGLET 2 — Analyse détaillée            */}
      {/* ════════════════════════════════════════ */}
      {activeTab === 1 && (
        <div className="anim" style={{ padding:"14px 16px 20px" }}>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign:"center", padding:"50px 20px" }}>
              <div style={{ width:44, height:44, border:"3px solid rgba(59,130,246,0.15)",
                borderTop:"3px solid #3B82F6", borderRadius:"50%",
                animation:"spin 0.8s linear infinite", margin:"0 auto 20px" }}/>
              <div style={{ fontSize:16, fontWeight:600, color:"#F2F4F7",
                fontFamily:FONT, marginBottom:6 }}>Analyse en cours…</div>
              <div style={{ fontSize:12, color:"rgba(242,244,247,0.45)",
                fontFamily:FONT, lineHeight:1.6 }}>
                Ton coach nutritionnel analyse<br/>14 jours de données
              </div>
            </div>
          )}

          {/* Erreur */}
          {error && !loading && (
            <div style={{ background:"rgba(248,113,113,0.08)",
              border:"1px solid rgba(248,113,113,0.20)", borderRadius:14,
              padding:16, textAlign:"center" }}>
              <div style={{ fontSize:13, color:"#F87171", fontFamily:FONT, marginBottom:10 }}>
                {error}
              </div>
              <button className="tap" onClick={generateAnalyse} style={{
                padding:"9px 16px", background:"#3B82F6", border:"none",
                borderRadius:10, color:"#fff", fontSize:13, fontWeight:600,
                fontFamily:FONT, cursor:"pointer" }}>
                Réessayer
              </button>
            </div>
          )}

          {/* Analyse rendue */}
          {analyse && !loading && (
            <>
              {/* Badge coach */}
              <div style={{ display:"flex", alignItems:"center", gap:10,
                padding:"4px 0 14px" }}>
                <div style={{ width:36, height:36, borderRadius:10,
                  background:"rgba(59,130,246,0.12)",
                  border:"1px solid rgba(59,130,246,0.22)",
                  display:"grid", placeItems:"center" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                       stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a8 8 0 0 1-12 7l-5 1 1-5A8 8 0 1 1 21 12z"/>
                    <path d="M8 12h.01M12 12h.01M16 12h.01"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#F2F4F7", fontFamily:FONT }}>
                    Analyse rédigée par ton coach nutritionnel
                  </div>
                  <div style={{ fontSize:11, color:"rgba(242,244,247,0.40)", fontFamily:FONT }}>
                    14 jours de données analysées
                  </div>
                </div>
              </div>

              {/* 1 — Résumé */}
              <SectionHeader num="1" title="Résumé global"/>
              <Card><p style={{ fontSize:13, color:"rgba(242,244,247,0.70)",
                lineHeight:1.65, fontFamily:FONT }}>{analyse.resume}</p></Card>

              {/* 2 — Points positifs */}
              <SectionHeader num="2" title="Points positifs 🌟" color="#34D399"/>
              <Card>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {analyse.points_positifs?.map((p, i) => (
                    <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                      <span style={{ color:"#34D399", fontSize:14, flexShrink:0 }}>✓</span>
                      <p style={{ fontSize:13, color:"rgba(242,244,247,0.70)",
                        lineHeight:1.55, fontFamily:FONT }}>{p}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* 3 — Points à améliorer */}
              <SectionHeader num="3" title="Points à améliorer ⚠️" color="#F87171"/>
              <Card>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {analyse.points_ameliorer?.map((p, i) => (
                    <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                      <span style={{ color:"#F87171", fontSize:14, flexShrink:0 }}>→</span>
                      <p style={{ fontSize:13, color:"rgba(242,244,247,0.70)",
                        lineHeight:1.55, fontFamily:FONT }}>{p}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* 4 — Macros */}
              <SectionHeader num="4" title="Analyse des macronutriments"/>
              <Card>
                <p style={{ fontSize:13, color:"rgba(242,244,247,0.70)",
                  lineHeight:1.65, fontFamily:FONT }}>{analyse.analyse_macros}</p>
              </Card>

              {/* 5 — Micronutriments */}
              <SectionHeader num="5" title="Micronutriments détectés"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                {Object.entries(analyse.micronutriments || {}).map(([key, val]) => {
                  const st = microStatus(val.statut);
                  return (
                    <div key={key} style={{ background:"rgba(255,255,255,0.03)",
                      border:"1px solid rgba(255,255,255,0.06)", borderRadius:10,
                      padding:"10px 12px" }}>
                      <div style={{ fontSize:10, color:"rgba(242,244,247,0.38)",
                        marginBottom:4, fontFamily:FONT }}>
                        {MICRO_LABELS[key] || key}
                      </div>
                      <div style={{ fontSize:12, fontWeight:600, color:"#F2F4F7",
                        marginBottom:5, fontFamily:FONT, lineHeight:1.3 }}>
                        {val.note}
                      </div>
                      <Badge label={st.label} color={st.color} bg={st.bg} bd={st.bd}/>
                    </div>
                  );
                })}
              </div>

              {/* 6 — Sucres */}
              <SectionHeader num="6" title="Sucres & produits transformés"/>
              <Card>
                <p style={{ fontSize:13, color:"rgba(242,244,247,0.70)",
                  lineHeight:1.65, fontFamily:FONT }}>{analyse.analyse_sucres}</p>
              </Card>

              {/* 7 — Hydratation */}
              <SectionHeader num="7" title="Hydratation"/>
              <Card>
                <p style={{ fontSize:13, color:"rgba(242,244,247,0.70)",
                  lineHeight:1.65, fontFamily:FONT }}>{analyse.hydratation}</p>
              </Card>

              {/* 8 — Habitudes */}
              <SectionHeader num="8" title="Habitudes alimentaires"/>
              <Card>
                <p style={{ fontSize:13, color:"rgba(242,244,247,0.70)",
                  lineHeight:1.65, fontFamily:FONT }}>{analyse.habitudes}</p>
              </Card>

              {/* 9 — Risques */}
              {analyse.risques?.length > 0 && (
                <>
                  <SectionHeader num="9" title="Risques & déséquilibres" color="#F87171"/>
                  <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:10 }}>
                    {analyse.risques.map((r, i) => (
                      <div key={i} style={{ padding:12,
                        background:"rgba(248,113,113,0.06)",
                        border:"1px solid rgba(248,113,113,0.15)", borderRadius:10 }}>
                        <p style={{ fontSize:12.5, color:"rgba(242,244,247,0.70)",
                          lineHeight:1.55, fontFamily:FONT }}>⚠️ {r}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* 10 — Objectifs */}
              <SectionHeader num="10" title="Tes objectifs — 14 prochains jours" color="#3B82F6"/>
              <Card>
                <div>
                  {analyse.objectifs?.map((o, i) => (
                    <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start",
                      padding:"10px 0",
                      borderBottom: i < analyse.objectifs.length - 1
                        ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                      <div style={{ width:22, height:22, borderRadius:6,
                        background:"#3B82F6", display:"grid", placeItems:"center",
                        fontSize:11, fontWeight:700, color:"#fff", fontFamily:FONT,
                        flexShrink:0, marginTop:1 }}>{i + 1}</div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:"#F2F4F7",
                          marginBottom:2, fontFamily:FONT }}>{o.titre}</div>
                        <div style={{ fontSize:12, color:"rgba(242,244,247,0.50)",
                          lineHeight:1.5, fontFamily:FONT }}>{o.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* 11 — Conclusion */}
              <SectionHeader num="11" title="Conclusion" color="#34D399"/>
              <div style={{ background:"linear-gradient(135deg,#1E3A8A,#2563EB)",
                border:"1px solid rgba(255,255,255,0.15)", borderRadius:16,
                padding:18, marginBottom:8, position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:-30, right:-30, width:100,
                  height:100, borderRadius:"50%", background:"rgba(255,255,255,0.05)",
                  pointerEvents:"none" }}/>
                <p style={{ fontSize:14, fontStyle:"italic",
                  color:"rgba(255,255,255,0.90)", lineHeight:1.65, fontFamily:FONT,
                  position:"relative" }}>
                  "{analyse.conclusion}"
                </p>
                <div style={{ marginTop:12, fontSize:12,
                  color:"rgba(255,255,255,0.55)", fontWeight:500, fontFamily:FONT }}>
                  — Coach Nutritionnel · MorphoCoach PRO
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
