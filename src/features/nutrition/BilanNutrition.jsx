// ─── BilanNutrition.jsx — v4 (design maquette validée) ──────────────────────
// Logique identique v3 · redesign visuel Tableau de bord :
//   • Mini-rings animés par macro · carrés P/G/L pleine couleur
//   • "Encore Xg pour atteindre ta cible" · Moyenne sur totalDays
//   • Hero cohérence dégradé sombre · sections avec accent coloré
//   • Onglet "Analyse détaillée" inchangé

import { useState, useMemo, useEffect, useRef } from "react";
import { C, FONT, SERIF, NUM } from "../../data/constants.js";
import { useSwipeBack } from "../../hooks/useSwipeBack.js";
import {
  computeBilan, computeCriteria, computeIndicators,
  computeHealthScore, CritRow, SectionHeader,
  MIN_DAYS_FULL_BILAN,
} from "./components/BilanUtils.jsx";
import {
  BG, S1, BD, TEXT, MID, DIM, BL, GRN, AMB, RED,
  I, MacroCard, SecHead, NoteCalme, NextBilanCard, StreakGrid,
} from "./components/BilanKit.jsx";

export default function BilanNutrition({
  onBack, repasHistory, repas, foods, calObj, pObj, gObj, lObj,
  profil, obj, premium, onOpenArchive,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [go, setGo] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    window.scrollTo(0, 0);
  }, []);

  // Animations : démarrer après 200ms
  useEffect(() => {
    const t = setTimeout(() => setGo(true), 200);
    return () => clearTimeout(t);
  }, []);

  // ─── Calculs ──────────────────────────────────────────────────────────
  const bilan = useMemo(() =>
    computeBilan(repasHistory, calObj, pObj, gObj, lObj),
    [repasHistory, calObj, pObj, gObj, lObj]
  );

  const realItems = useMemo(() => {
    const r = repas || {};
    return [...(r.matin||[]),...(r.midi||[]),...(r.soir||[]),...(r.snack||[])];
  }, [repas]);

  const criteria   = useMemo(() => computeCriteria(realItems), [realItems]);
  const indicators = useMemo(() => computeIndicators(realItems), [realItems]);
  const health     = useMemo(() => computeHealthScore(criteria), [criteria]);
  const hasFood    = realItems.length > 0;

  // Moyennes sur la PÉRIODE complète (pas seulement les jours loggés)
  const totalDays = bilan.totalDays || 1;
  const nb = bilan.nbLogged || 0;
  const avgKcalP = Math.round((bilan.avgKcal * nb) / totalDays);
  const avgProtP = Math.round((bilan.avgProt * nb) / totalDays);
  const avgGlucP = Math.round((bilan.avgGluc * nb) / totalDays);
  const avgLipP  = Math.round((bilan.avgLip  * nb) / totalDays);
  const avgEauP  = (bilan.avgEau * nb) / totalDays;

  const pctProtP = pObj   ? Math.round((avgProtP / pObj)   * 100) : 0;
  const pctGlucP = gObj   ? Math.round((avgGlucP / gObj)   * 100) : 0;
  const pctLipP  = lObj   ? Math.round((avgLipP  / lObj)   * 100) : 0;
  const pctKcalP = calObj ? Math.round((avgKcalP / calObj)  * 100) : 0;

  // Meilleur macro (le plus proche de sa cible)
  const macroData = [
    { label:"Protéines", pct:pctProtP },
    { label:"Glucides",  pct:pctGlucP },
    { label:"Lipides",   pct:pctLipP  },
  ];
  const bestMacroLabel = macroData.reduce((best,m) => m.pct > best.pct ? m : best, macroData[0]).label;

  // Prochain bilan
  const today = new Date();
  const daysToSunday = (7 - today.getDay()) % 7 || 7;
  const nextSunday = new Date(today.getTime() + daysToSunday * 86400000);
  const nextBilanLabel = nextSunday.toLocaleDateString("fr-FR",
    { weekday:"long", day:"numeric", month:"long" });

  // ─── Header tabs ──────────────────────────────────────────────────────
  const renderHeader = () => (
    <div style={{ margin:"0 16px 16px", display:"flex", gap:8 }}>
      {[
        { label:"Tableau de bord",   ico:"chart" },
        { label:"Analyse détaillée", ico:"brain" },
      ].map((tab,i) => (
        <button key={i} onClick={() => setActiveTab(i)}
          style={{ flex:1,padding:"12px 0",borderRadius:12,
            fontSize:13,fontWeight:700,fontFamily:FONT,
            border:`1px solid ${activeTab===i?"rgba(59,130,246,0.35)":BD}`,
            background:activeTab===i?"rgba(59,130,246,0.12)":S1,
            color:activeTab===i?C.blueLt:MID,
            cursor:"pointer",display:"flex",alignItems:"center",
            justifyContent:"center",gap:8,transition:"all .18s" }}>
          <I name={tab.ico} size={14} stroke={activeTab===i?2.2:1.8} color={activeTab===i?C.blueLt:MID}/>
          {tab.label}
        </button>
      ))}
    </div>
  );

  // ─── ONGLET 1 · Tableau de bord ───────────────────────────────────────
  const renderDashboard = () => {
    if (bilan.nbLogged === 0) return (
      <div style={{ margin:"8px 16px 16px" }}>
        <div style={{ background:S1,border:`1px solid ${BD}`,borderRadius:20,
          padding:"32px 24px",textAlign:"center" }}>
          <div style={{ fontSize:34,marginBottom:12 }}>🍽️</div>
          <div style={{ fontSize:16,fontWeight:700,color:TEXT,fontFamily:FONT,marginBottom:8 }}>
            En attente de ton premier jour
          </div>
          <div style={{ fontSize:13,color:MID,lineHeight:1.6,fontFamily:FONT,maxWidth:280,margin:"0 auto" }}>
            Le bilan démarre dès que tu enregistres un repas. Tes macros et la régularité
            s'analysent à partir de ta première journée renseignée.
          </div>
        </div>
      </div>
    );

    return (
      <div style={{ padding:"0 20px" }}>

        {/* Note calme si données partielles */}
        {bilan.isPartial && (
          <NoteCalme nbLogged={bilan.nbLogged} totalDays={bilan.totalDays}/>
        )}

        {/* ── COHÉRENCE — HERO CARD (en premier) ── */}
        <SecHead
          title="Cohérence Nutrition"
          sub="Ton alimentation soutient-elle ta progression ?"
          color={BL}
        />
        <div style={{
          borderRadius:20,padding:"24px 20px",marginBottom:20,
          background:"linear-gradient(140deg,#1E3A8A 0%,#4C1D95 52%,#9D174D 100%)",
          boxShadow:"0 12px 40px rgba(99,102,241,0.35)",
          color:"white",display:"flex",alignItems:"center",gap:20,
          position:"relative",overflow:"hidden",
        }}>
          <div style={{ position:"absolute",top:-50,right:-30,width:160,height:160,
            borderRadius:"50%",background:"rgba(255,255,255,0.05)",pointerEvents:"none" }}/>
          <div style={{ position:"absolute",bottom:-25,left:10,width:90,height:90,
            borderRadius:"50%",background:"rgba(255,255,255,0.05)",pointerEvents:"none" }}/>

          {bilan.isPartial ? (
            <div style={{ position:"relative",width:108,height:108,flexShrink:0 }}>
              <svg width="108" height="108" style={{ position:"absolute",inset:0 }}>
                <circle cx="54" cy="54" r="48" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={11}/>
                <circle cx="54" cy="54" r="48" fill="none" stroke="white" strokeWidth={11}
                  strokeLinecap="round"
                  strokeDasharray={2*Math.PI*48}
                  strokeDashoffset={go?(1-Math.min(bilan.nbLogged/MIN_DAYS_FULL_BILAN,1))*(2*Math.PI*48):(2*Math.PI*48)}
                  transform="rotate(-90 54 54)"
                  style={{ transition:"stroke-dashoffset 1.5s cubic-bezier(.34,1.2,.64,1) .1s",
                    filter:"drop-shadow(0 0 7px rgba(255,255,255,0.65))" }}
                />
              </svg>
              <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",
                justifyContent:"center",flexDirection:"column",textAlign:"center" }}>
                <div style={{ fontFamily:SERIF,fontSize:26,lineHeight:1,color:"white" }}>
                  {bilan.nbLogged}<span style={{ fontSize:14,opacity:.65 }}>/{MIN_DAYS_FULL_BILAN}</span>
                </div>
                <div style={{ fontSize:10,opacity:.75,fontWeight:600,marginTop:4,fontFamily:FONT }}>
                  jours complets
                </div>
              </div>
            </div>
          ) : (
            <div style={{ position:"relative",width:108,height:108,flexShrink:0 }}>
              <svg width="108" height="108" style={{ position:"absolute",inset:0 }}>
                <circle cx="54" cy="54" r="48" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={11}/>
                <circle cx="54" cy="54" r="48" fill="none" stroke="white" strokeWidth={11}
                  strokeLinecap="round"
                  strokeDasharray={2*Math.PI*48}
                  strokeDashoffset={go?(1-parseFloat(bilan.score)/10)*(2*Math.PI*48):(2*Math.PI*48)}
                  transform="rotate(-90 54 54)"
                  style={{ transition:"stroke-dashoffset 1.5s cubic-bezier(.34,1.2,.64,1) .1s",
                    filter:"drop-shadow(0 0 7px rgba(255,255,255,0.65))" }}
                />
              </svg>
              <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",
                justifyContent:"center",flexDirection:"column",textAlign:"center" }}>
                <div style={{ fontFamily:SERIF,fontSize:34,lineHeight:1,color:"white" }}>{bilan.score}</div>
                <div style={{ fontSize:10,opacity:.75,fontWeight:600,marginTop:4,fontFamily:FONT }}>sur 10</div>
              </div>
            </div>
          )}

          <div style={{ flex:1 }}>
            {bilan.isPartial ? (
              <div style={{ display:"inline-flex",alignItems:"center",gap:8,fontSize:11,
                fontWeight:700,color:"rgba(255,255,255,0.85)",
                background:"rgba(255,255,255,0.18)",padding:"4px 12px",borderRadius:8,fontFamily:FONT }}>
                <I name="lock" size={11} color="rgba(255,255,255,0.85)"/>
                {" "}Score dans {Math.max(0,MIN_DAYS_FULL_BILAN-bilan.nbLogged)} jours
              </div>
            ) : (
              <div style={{ display:"inline-block",fontSize:11,fontWeight:700,
                color:"rgba(255,255,255,0.85)",background:"rgba(255,255,255,0.18)",
                padding:"4px 12px",borderRadius:8,fontFamily:FONT }}>
                Objectif · {obj?.l || "Prise de muscle"}
              </div>
            )}
            <div style={{ fontFamily:SERIF,fontSize:26,color:"white",marginTop:12,
              letterSpacing:-0.5,lineHeight:1 }}>
              {avgKcalP}{" "}
              <span style={{ fontFamily:FONT,fontSize:13,fontWeight:600,opacity:.72 }}>kcal/j moy.</span>
            </div>
            <div style={{ fontSize:11,opacity:.72,marginTop:8,lineHeight:1.6,fontFamily:FONT }}>
              Cible : {calObj} kcal/j · {pctKcalP}% atteint<br/>
              <span style={{ opacity:.9,fontWeight:600 }}>
                {bilan.isPartial
                  ? "Continue à tout enregistrer ✦"
                  : `${bilan.daysOk} jour${bilan.daysOk>1?"s":""} dans la cible ✦`}
              </span>
            </div>
          </div>
        </div>

        {/* ── RÉGULARITÉ ── */}
        <div style={{ marginTop:24 }}>
        <SecHead
          title="Régularité du suivi"
          sub="La constance crée les résultats."
          color={GRN}
        />
        <div style={{ borderRadius:20,padding:"20px",
          background:"linear-gradient(140deg,#F0FDF4,#FFF8F0)",
          border:"1px solid rgba(16,185,129,0.18)",
          boxShadow: C.shadow,
          marginBottom:20 }}>
          {/* Header : chiffre + illustration calendrier */}
          <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20 }}>
            <div>
              <div style={{ display:"flex",alignItems:"baseline",gap:8 }}>
                <span style={{ fontFamily:SERIF,fontSize:44,fontWeight:400,
                  letterSpacing:-1,lineHeight:1,color:TEXT,...NUM }}>
                  {(repasHistory||[]).slice(-7).filter(d=>d&&d.kcal&&d.kcal>0).length}
                </span>
                <span style={{ fontSize:16,color:DIM,fontFamily:FONT }}>/7</span>
              </div>
              <div style={{ fontSize:14,color:MID,fontWeight:600,fontFamily:FONT,marginTop:4 }}>
                jours renseignés
              </div>
            </div>
            {/* Illustration calendrier */}
            <svg width="82" height="68" viewBox="0 0 86 72" fill="none">
              <rect x="10" y="14" width="66" height="52" rx="8" fill="#EEF2FB" stroke="#C9D6F0" strokeWidth="2"/>
              <rect x="10" y="14" width="66" height="15" rx="8" fill="#DBE6FB"/>
              <path d="M24 8v12M62 8v12" stroke="#9DB5E6" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M26 44l5 5 9-11" stroke={C.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="56" cy="48" r="3.2" fill="#CDD9F1"/>
            </svg>
          </div>

          <StreakGrid days={repasHistory} calObj={calObj}/>

          <div style={{ display:"flex",gap:16,paddingTop:12,
            borderTop:"1px solid rgba(16,185,129,0.12)",flexWrap:"wrap" }}>
            {[
              { color:GRN, label:"Atteint" },
              { color:AMB, label:"Proche cible" },
              { color:RED, bg:"rgba(248,113,113,0.12)", label:"Hors cible" },
              { bg:"rgba(0,0,0,0.05)", bd:"1.5px dashed rgba(18,26,48,0.12)", label:"Non renseigné" },
            ].map((x,i) => (
              <div key={i} style={{ display:"flex",alignItems:"center",gap:8,
                fontSize:13,color:MID,fontFamily:FONT }}>
                <span style={{ width:10,height:10,borderRadius:3,flexShrink:0,
                  background:x.bg||x.color,border:x.bd||"none" }}/>
                {x.label}
              </div>
            ))}
          </div>
        </div>

        </div>{/* fin régularité */}

        {/* ── MACRONUTRIMENTS ── */}
        <div style={{ marginTop:24 }}>
        <SecHead
          title="Macronutriments"
          sub={`Moyenne sur ${totalDays} jours · tes 3 carburants clés`}
          color={BL}
        />
        <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:20 }}>
          <MacroCard
            label="Protéines" value={avgProtP} goal={pObj} pct={pctProtP}
            isPointFort={bestMacroLabel==="Protéines"} go={go} delay={0.1}
          />
          <MacroCard
            label="Glucides" value={avgGlucP} goal={gObj} pct={pctGlucP}
            isPointFort={bestMacroLabel==="Glucides"} go={go} delay={0.22}
          />
          <MacroCard
            label="Lipides" value={avgLipP} goal={lObj} pct={pctLipP}
            isPointFort={bestMacroLabel==="Lipides"} go={go} delay={0.34}
          />
        </div>

        </div>{/* fin macros */}

        {/* ── HYDRATATION ── */}
        <div style={{ marginTop:24 }}>
        <SecHead
          title="Hydratation"
          sub="Optimal : 35 ml / kg de poids de corps"
          color={GRN}
          icon={<I name="drop" size={12} color="white" stroke={2}/>}
        />
        <div style={{ borderRadius:20,padding:"20px 20px",background:S1,
          border:"1px solid rgba(16,185,129,0.25)",
          boxShadow: C.shadow,
          marginBottom:16 }}>
          <div style={{ display:"flex",alignItems:"center",gap:16 }}>
            <div style={{ width:56,height:56,borderRadius:16,flexShrink:0,
              background:"linear-gradient(135deg,#34D399,#047857)",
              display:"grid",placeItems:"center",
              boxShadow:"0 8px 22px rgba(4,120,87,0.35),inset 0 1px 0 rgba(255,255,255,0.25)" }}>
              <I name="drop" size={26} color="white" stroke={2}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div style={{ display:"flex",alignItems:"baseline",gap:4 }}>
                  <span style={{ fontSize:34,fontWeight:700,color:TEXT,fontFamily:SERIF,letterSpacing:-0.5,...NUM }}>
                    {(avgEauP*0.25).toFixed(1)} L
                  </span>
                  <span style={{ fontSize:14,color:DIM,fontWeight:600,fontFamily:FONT }}>/ 2 L</span>
                </div>
                <span style={{ fontSize:13,fontWeight:700,color:GRN,
                  border:`1.5px solid ${GRN}`,padding:"4px 12px",borderRadius:999,fontFamily:FONT }}>
                  {Math.min(100,Math.round((avgEauP*0.25/2)*100))}%
                </span>
              </div>
              <div style={{ height:9,borderRadius:8,background:"rgba(16,185,129,0.12)",
                marginTop:12,overflow:"hidden" }}>
                <div style={{ height:"100%",borderRadius:8,
                  background:"linear-gradient(90deg,#6EE7B7,#10B981)",
                  boxShadow:"2px 0 10px rgba(16,185,129,0.35)",
                  width:go?`${Math.min(100,(avgEauP*0.25/2)*100)}%`:"0%",
                  transition:"width 1.4s cubic-bezier(.34,1.2,.64,1) .4s" }}/>
              </div>
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12 }}>
            <span style={{ fontSize:13,color:DIM,fontWeight:500,fontFamily:FONT }}>
              Encore {Math.max(0,(2-avgEauP*0.25).toFixed(1))} L pour ton objectif
            </span>
            <I name="trend" size={18} color={GRN}/>
          </div>
        </div>

        </div>{/* fin hydratation */}

        {/* ── PROCHAIN BILAN ── */}
        <div style={{ marginTop:16 }}>
        <NextBilanCard
          nextDate={nextBilanLabel}
          daysUntil={daysToSunday}
          onOpen={onOpenArchive}
        />
        </div>

      </div>
    );
  };

  // ─── ONGLET 2 · Analyse détaillée (inchangé) ──────────────────────────
  const renderDetailed = () => (
    <>
      {!hasFood && (
        <div style={{ margin:"0 16px 16px",background:S1,border:`1px solid ${BD}`,
          borderRadius:20,padding:"24px 20px",textAlign:"center" }}>
          <div style={{ width:48,height:48,borderRadius:16,margin:"0 auto 12px",
            background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.18)",
            display:"grid",placeItems:"center",fontSize:20 }}>🥗</div>
          <div style={{ fontSize:14,fontWeight:700,color:TEXT,fontFamily:FONT,marginBottom:4 }}>
            Aucun aliment saisi
          </div>
          <div style={{ fontSize:13,color:MID,lineHeight:1.5,fontFamily:FONT,maxWidth:260,margin:"0 auto" }}>
            Ajoute tes repas du jour pour calculer ton score qualité et tes indicateurs nutritionnels.
          </div>
        </div>
      )}
      {hasFood && (<>
        <div style={{ margin:"0 16px 16px",background:S1,border:`1px solid ${BD}`,
          borderRadius:20,padding:"24px 20px",position:"relative",overflow:"hidden" }}>
          <div style={{ position:"absolute",top:-50,right:-50,width:180,height:180,
            borderRadius:"50%",background:`radial-gradient(circle,${health.color}25,transparent 70%)`,
            pointerEvents:"none" }}/>
          <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",
            textTransform:"uppercase",color:DIM,marginBottom:16,fontFamily:FONT }}>
            Score santé · qualité des aliments rentrés
          </div>
          <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:16 }}>
            <div style={{ fontFamily:SERIF,fontSize:78,fontWeight:400,
              lineHeight:1,color:health.color,letterSpacing:-1 }}>{health.letter}</div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:34,fontWeight:700,letterSpacing:-1,lineHeight:1,
                color:TEXT,fontFamily:FONT,...NUM }}>
                {health.score}<span style={{ color:DIM,fontSize:14,fontWeight:500 }}>/100</span>
              </div>
              <div style={{ fontSize:11,color:DIM,marginTop:2,fontFamily:FONT }}>
                basé sur {criteria.length} critères
              </div>
              <div style={{ display:"inline-block",marginTop:8,padding:"4px 12px",
                background:`${health.color}1F`,border:`1px solid ${health.color}4D`,
                borderRadius:999,fontSize:11,fontWeight:700,color:health.color,fontFamily:FONT }}>
                {health.pill}
              </div>
            </div>
          </div>
          <div style={{ height:8,background:"linear-gradient(90deg,#F87171 0%,#F59E0B 50%,#34D399 100%)",
            borderRadius:999,position:"relative",opacity:.4 }}>
            <div style={{ position:"absolute",top:-3,width:14,height:14,borderRadius:"50%",
              background:"white",border:`2px solid ${health.color}`,
              boxShadow:`0 0 0 4px ${health.color}33`,
              left:`calc(${health.score}% - 7px)` }}/>
          </div>
          <div style={{ display:"flex",justifyContent:"space-between",marginTop:4 }}>
            {["E","D","C","B","A"].map(l => (
              <span key={l} style={{ fontSize:10,
                color:l===health.letter?health.color:DIM,fontWeight:700,fontFamily:FONT }}>{l}</span>
            ))}
          </div>
        </div>

        <div style={{ margin:"0 16px 16px" }}>
          <SectionHeader title="Critères évalués"/>
          <div style={{ background:S1,border:`1px solid ${BD}`,borderRadius:20,padding:"4px 16px" }}>
            {criteria.map((c,i) => (
              <div key={c.key} style={{ borderBottom:i===criteria.length-1?"none":undefined }}>
                <CritRow crit={c}/>
              </div>
            ))}
          </div>
        </div>

        <div style={{ margin:"0 16px 16px" }}>
          <SectionHeader title="Qualité nutritionnelle · apports mesurés"/>
          <div style={{ background:S1,border:`1px solid ${BD}`,borderRadius:20,padding:20 }}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              {indicators.map(m => (
                <div key={m.key} style={{ padding:"12px 12px",
                  background:`linear-gradient(160deg,${m.color}14,${m.color}05)`,
                  border:`1px solid ${m.color}33`,borderRadius:16 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",
                    alignItems:"center",marginBottom:4 }}>
                    <div style={{ fontSize:13,fontWeight:700,color:TEXT,fontFamily:FONT }}>{m.label}</div>
                    <span style={{ width:9,height:9,borderRadius:"50%",background:m.color,
                      boxShadow:`0 0 7px ${m.color}` }}/>
                  </div>
                  <div style={{ fontSize:11,marginBottom:8,fontFamily:FONT }}>
                    <span style={{ fontSize:14,fontWeight:700,color:TEXT,...NUM }}>
                      {m.display!==undefined?m.display:(m.val<10?m.val.toFixed(1):Math.round(m.val))}{m.unit}
                    </span>
                    <span style={{ color:MID }}> {m.lower?"· viser <":"/"} {m.goal}{m.unit}</span>
                  </div>
                  <div style={{ fontSize:10,color:m.color,fontWeight:700,fontFamily:FONT,marginBottom:4 }}>
                    {m.statusLabel}
                  </div>
                  <div style={{ height:5,background:`${m.color}1F`,borderRadius:999,overflow:"hidden" }}>
                    <div style={{ height:"100%",width:`${Math.min(100,m.pct)}%`,
                      background:m.color,borderRadius:999,transition:"width .8s",
                      boxShadow:`0 0 6px ${m.color}` }}/>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:12,fontSize:11,color:MID,lineHeight:1.5,fontFamily:FONT }}>
              Indicateurs calculés à partir des aliments réellement saisis.
            </div>
          </div>
        </div>
      </>)}

      <div style={{ margin:"0 16px 16px" }}>
        <button onClick={onOpenArchive} style={{ width:"100%",padding:"16px 16px",
          background:S1,border:`1px solid ${BD}`,borderRadius:16,cursor:"pointer",
          display:"flex",alignItems:"center",gap:12,fontFamily:FONT,textAlign:"left" }}>
          <div style={{ width:34,height:34,borderRadius:12,
            background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.25)",
            display:"grid",placeItems:"center",flexShrink:0 }}>
            <I name="arch" size={15} color={C.blueLt}/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13,fontWeight:700,color:TEXT,fontFamily:FONT }}>
              Historique des bilans
            </div>
            <div style={{ fontSize:11,color:MID,marginTop:2,fontFamily:FONT }}>
              Voir tous les rapports bi-hebdomadaires
            </div>
          </div>
          <I name="chevR" size={16} color={MID}/>
        </button>
      </div>
    </>
  );

  // ─── Render ────────────────────────────────────────────────────────────
  const { swipeStyle, onTouchStart, onTouchMove, onTouchEnd } = useSwipeBack(onBack);

  return (
    <div ref={scrollRef}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      style={{ minHeight:"100vh",maxHeight:"100vh",overflowY:"auto",
        WebkitOverflowScrolling:"touch",background:BG,fontFamily:FONT,
        paddingBottom:32,...swipeStyle }}>

      {/* Retour */}
      <div style={{ padding:"16px 16px 8px",display:"flex",alignItems:"center",gap:12 }}>
        <button onClick={onBack} style={{ background:"transparent",border:"none",
          color:BL,cursor:"pointer",fontSize:13,fontWeight:700,
          display:"flex",alignItems:"center",gap:4,fontFamily:FONT }}>
          <I name="chevL" size={15} stroke={2.5} color={BL}/> Retour
        </button>
      </div>

      {/* Titre */}
      <div style={{ padding:"0 20px 16px" }}>
        <div style={{ fontFamily:SERIF,fontSize:20,fontWeight:700,
          color:TEXT,letterSpacing:-0.5,lineHeight:1.1 }}>
          Bilan PRO Nutrition
        </div>
        <div style={{ fontSize:13,color:MID,marginTop:4,fontFamily:FONT }}>
          {bilan.totalDays} derniers jours
        </div>
      </div>

      {renderHeader()}
      {activeTab === 0 ? renderDashboard() : renderDetailed()}
    </div>
  );
}

