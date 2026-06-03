import { useState } from "react";
import { C, INT, FONT } from "../../data/constants.js";
import { EX } from "../../data/exercises.js";
import { Card, Eyebrow, Lbl, Btn, Row } from "../../components/ui/index.jsx";
import Calendar from "./Calendar.jsx";
import TodayView from "./TodayView.jsx";
import Creer from "./Creer.jsx";
import AnalyseIA from "../ai/AnalyseIA.jsx";
import { findExInDB } from "../../utils/training.js";
import { GuideExModal, SeanceDetailModal } from "./components/ProgramTabModals.jsx";

// ─── MÉSOCYCLE CHART ─────────────────────────────────────────────────────────
function MesocycleChart({ prog, semC, checkedEx }) {
  const DISP_F = "'Outfit','DM Sans',system-ui,sans-serif";
  const SERIF_F = "'DM Serif Display','Georgia',serif";
  const [open, setOpen] = useState(false);
  const currentWeek = Math.min((semC||0), 5);
  const baseVol = (prog?.jours||[]).reduce((a,j) =>
    a + (j.exercices||[]).reduce((b,ex) => b + (parseInt(ex.series)||4), 0), 0);
  const WEEKS = [
    {lbl:"S1", type:"Base",   m:1.00},
    {lbl:"S2", type:"Vol+",   m:1.10},
    {lbl:"S3", type:"Vol+",   m:1.20},
    {lbl:"S4", type:"Vol+",   m:1.30},
    {lbl:"S5", type:"Déload", m:0.70},
    {lbl:"S6", type:"Pic",    m:1.40},
  ];
  const maxH = 72, maxM = 1.4;
  // Volume landmarks (réels, dérivés du programme)
  const MEV = Math.round(baseVol*0.65);
  const MAV = baseVol;
  const MRV = Math.round(baseVol*1.35);
  const curVol = Math.round(baseVol * WEEKS[currentWeek].m);
  const nearMRV = curVol >= MRV*0.9;

  return (
    <>
    {/* Carte cliquable */}
    <div onClick={()=>setOpen(true)} style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:20,padding:"18px 16px",marginBottom:16,cursor:"pointer"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
        <div>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:"1.3px",textTransform:"uppercase",color:C.blue,fontFamily:DISP_F,marginBottom:4}}>Mésocycle</div>
          <div style={{fontSize:16,fontWeight:700,color:"#F2F4F7",fontFamily:DISP_F,letterSpacing:-0.3}}>Volume 6 semaines</div>
          <div style={{fontSize:11,color:"rgba(242,244,247,0.35)",fontFamily:DISP_F,marginTop:3}}>Progression planifiée · {baseVol} séries/sem</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:9,color:"rgba(242,244,247,0.35)",fontFamily:DISP_F}}>Sem. actuelle</div>
          <div style={{fontSize:20,fontWeight:800,color:C.blue,fontFamily:DISP_F,lineHeight:1}}>{currentWeek+1}<span style={{fontSize:11,color:"rgba(242,244,247,0.35)",fontWeight:400}}>/6</span></div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"flex-end",height:maxH,marginBottom:10}}>
        {WEEKS.map((w,i) => {
          const isCur = i===currentWeek;
          const h = Math.round((w.m/maxM)*maxH);
          const bg = w.type==="Déload" ? "rgba(248,113,113,0.4)"
            : w.type==="Pic" ? "rgba(245,158,11,0.55)"
            : isCur ? "linear-gradient(180deg,#60A5FA,#2563EB)" : "rgba(59,130,246,0.22)";
          return (
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
              <div style={{height:h,borderRadius:"5px 5px 3px 3px",background:bg,border:isCur?"1px solid #3B82F6":"1px solid transparent",boxShadow:isCur?"0 4px 14px rgba(59,130,246,0.3)":"none"}}/>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:8}}>
        {WEEKS.map((w,i) => {
          const isCur = i===currentWeek;
          const col = w.type==="Déload" ? "rgba(248,113,113,0.7)" : w.type==="Pic" ? "rgba(245,158,11,0.7)" : isCur ? "#60A5FA" : "rgba(242,244,247,0.35)";
          return (
            <div key={i} style={{flex:1,textAlign:"center"}}>
              <div style={{fontSize:isCur?12:11,fontWeight:isCur?800:600,color:col,fontFamily:DISP_F}}>{w.lbl}</div>
              <div style={{fontSize:8,color:"rgba(242,244,247,0.22)",fontFamily:DISP_F,marginTop:1}}>{w.type}</div>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:14,paddingTop:12,borderTop:`1px solid ${C.bd}`,color:"#60A5FA",fontSize:12,fontWeight:700,fontFamily:DISP_F}}>
        Voir l'analyse complète
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </div>
    </div>

    {/* Overlay analyse complète */}
    {open && <MesocycleDetail prog={prog} semC={semC} baseVol={baseVol} MEV={MEV} MAV={MAV} MRV={MRV} curVol={curVol} currentWeek={currentWeek} WEEKS={WEEKS} onClose={()=>setOpen(false)}/>}
    </>
  );
}

// ─── MÉSOCYCLE DETAIL (analyse complète, overlay) ────────────────────────────
function MesocycleDetail({ prog, semC, baseVol, MEV, MAV, MRV, curVol, currentWeek, WEEKS, onClose }) {
  const DISP_F = "'Outfit','DM Sans',system-ui,sans-serif";
  const SERIF_F = "'DM Serif Display','Georgia',serif";
  const [exp, setExp] = useState(null); // carte dépliée

  const card = (key, children) => (
    <div onClick={()=>setExp(exp===key?null:key)} style={{background:C.s1,border:`1px solid ${exp===key?"rgba(59,130,246,0.3)":C.bd}`,borderRadius:18,padding:16,marginBottom:12,cursor:"pointer"}}>
      {children}
    </div>
  );
  const expandRow = (key, label) => (
    <div style={{fontSize:10,color:"#60A5FA",marginTop:10,display:"flex",alignItems:"center",gap:4,fontFamily:DISP_F}}>
      {exp===key?"▴":"▾"} {label}
    </div>
  );
  const detailBox = (key, children) => exp===key ? (
    <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.bd}`,fontSize:12,color:"rgba(242,244,247,0.6)",lineHeight:1.6,fontFamily:DISP_F}}>{children}</div>
  ) : null;
  const reco = (icon, txt) => (
    <div style={{marginTop:10,padding:"10px 12px",background:"rgba(59,130,246,0.07)",border:"1px solid rgba(59,130,246,0.18)",borderRadius:10,display:"flex",gap:9,alignItems:"flex-start"}}>
      <span style={{fontSize:14,flexShrink:0}}>{icon}</span><div style={{fontSize:11.5,color:"rgba(242,244,247,0.6)",lineHeight:1.5}}>{txt}</div>
    </div>
  );
  const lbl = {fontSize:9,fontWeight:700,letterSpacing:"1.2px",textTransform:"uppercase",color:"rgba(242,244,247,0.30)",marginBottom:6,fontFamily:DISP_F};
  const badge = (bg,col,txt) => <span style={{fontSize:9,fontWeight:700,padding:"4px 9px",borderRadius:99,background:bg,color:col,whiteSpace:"nowrap",fontFamily:DISP_F}}>{txt}</span>;
  const demoBadge = badge("rgba(245,158,11,0.12)","#F59E0B","Démo · active le suivi");

  const VMAX = MRV*1.12;
  const nearMRV = curVol >= MRV*0.9;

  return (
    <div style={{position:"fixed",inset:0,zIndex:500,background:C.bg,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
      <div style={{padding:"0 16px 40px",maxWidth:480,margin:"0 auto"}}>
        {/* Header */}
        <div style={{position:"sticky",top:0,background:C.bg,paddingTop:18,paddingBottom:12,zIndex:2}}>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:"#60A5FA",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:DISP_F,display:"flex",alignItems:"center",gap:5,marginBottom:14}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Retour
          </button>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:"1.8px",textTransform:"uppercase",color:C.blue,fontFamily:DISP_F,marginBottom:5}}>Mésocycle · Semaine {currentWeek+1} / 6</div>
          <div style={{fontFamily:SERIF_F,fontSize:25,letterSpacing:-0.8,lineHeight:1.1}}>Analyse <span style={{fontStyle:"italic",color:"#60A5FA"}}>de charge</span></div>
          <div style={{fontSize:11,color:"rgba(242,244,247,0.30)",marginTop:4,fontFamily:DISP_F}}>{WEEKS[currentWeek].type==="Déload"?"Phase de récupération":WEEKS[currentWeek].type==="Pic"?"Phase de pic":"Phase d'accumulation"} · Hypertrophie</div>
        </div>

        {/* 1. VOLUME vs MEV/MAV/MRV (RÉEL) */}
        {card("vol", <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={lbl}>Volume vs capacité de récupération</div>
              <div><span style={{fontSize:30,fontWeight:800,color:nearMRV?"#F59E0B":"#34D399",letterSpacing:-1}}>{curVol}</span> <span style={{fontSize:13,fontWeight:600,color:"rgba(242,244,247,0.35)"}}>séries cette sem.</span></div>
            </div>
            {nearMRV ? badge("rgba(245,158,11,0.15)","#F59E0B","Limite proche") : badge("rgba(52,211,153,0.15)","#34D399","Zone optimale")}
          </div>
          {/* Barres avec lignes MEV/MAV/MRV */}
          <div style={{position:"relative",display:"flex",gap:7,alignItems:"flex-end",height:120,margin:"16px 0 8px"}}>
            {[["MRV",MRV,"#F87171"],["MAV",MAV,"#34D399"],["MEV",MEV,"#60A5FA"]].map(([t,v,col],k)=>{
              const y = 120-(v/VMAX*120);
              return <div key={k} style={{position:"absolute",left:0,right:0,top:y,height:1,borderTop:`1px dashed ${col}40`}}>
                <span style={{position:"absolute",right:0,top:-7,fontSize:8,fontWeight:700,padding:"1px 5px",borderRadius:4,background:`${col}20`,color:col,fontFamily:DISP_F}}>{t} {v}</span>
              </div>;
            })}
            {WEEKS.map((w,i)=>{
              const v = Math.round(baseVol*w.m);
              const h = v/VMAX*120;
              const isCur = i===currentWeek;
              const col = w.type==="Déload"?"#F87171":w.type==="Pic"?"#F59E0B":"#3B82F6";
              return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-end",alignItems:"center",gap:4,zIndex:2}}>
                <div style={{width:"100%",height:h,borderRadius:"4px 4px 2px 2px",background:isCur?`linear-gradient(180deg,${col},${col}AA)`:col+"55",boxShadow:isCur?`0 4px 12px ${col}50`:"none"}}/>
                <div style={{fontSize:10,fontWeight:700,color:isCur?col:"rgba(242,244,247,0.3)",fontFamily:DISP_F}}>{w.lbl}</div>
              </div>;
            })}
          </div>
          {expandRow("vol","Lire les seuils MEV / MAV / MRV")}
          {detailBox("vol", <>
            Chaque muscle a des seuils de volume hebdo (en séries) :<br/>
            • <b style={{color:"#F2F4F7"}}>MEV</b> ({MEV}) minimum efficace — sous ce seuil, pas de gain<br/>
            • <b style={{color:"#F2F4F7"}}>MAV</b> ({MAV}) volume adaptatif optimal — la zone de progression<br/>
            • <b style={{color:"#F2F4F7"}}>MRV</b> ({MRV}) max récupérable — plafond, au-delà = surentraînement
            {reco("⚠️", <>Tu es à <b style={{color:"#F2F4F7"}}>{curVol} séries</b>{nearMRV?<>, proche de ton MRV ({MRV}). Le <b style={{color:"#F2F4F7"}}>déload S5 est essentiel</b> pour dissiper la fatigue.</>:<>, dans ta zone optimale. Continue la progression.</>}</>)}
          </>)}
        </>)}

        {/* 2. SCORE PRÉPARATION (DÉMO) */}
        {card("ready", <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={lbl}>Score de préparation</div>{demoBadge}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:18,marginTop:4}}>
            <div style={{position:"relative",width:90,height:90,flexShrink:0}}>
              <svg width="90" height="90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
                <circle cx="48" cy="48" r="42" fill="none" stroke="#F59E0B" strokeWidth="7" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="76" transform="rotate(-90 48 48)"/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontSize:26,fontWeight:800,color:"#F59E0B",lineHeight:1}}>71</div>
                <div style={{fontSize:8,color:"rgba(242,244,247,0.3)",letterSpacing:1,textTransform:"uppercase",marginTop:2}}>/ 100</div>
              </div>
            </div>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
              {[["Sommeil","60%","#F59E0B","6h"],["Courbatures","70%","#F87171","Éle."],["Motivation","85%","#34D399","8"],["RPE moyen","80%","#F59E0B","8"]].map(([n,w,c,v],k)=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:9}}>
                  <span style={{fontSize:11,color:"rgba(242,244,247,0.55)",width:74,flexShrink:0,fontFamily:DISP_F}}>{n}</span>
                  <div style={{flex:1,height:6,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}><div style={{height:"100%",width:w,borderRadius:3,background:c}}/></div>
                  <span style={{fontSize:10,fontWeight:700,color:c,width:24,textAlign:"right",flexShrink:0}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          {expandRow("ready","Que faire avec ce score ?")}
          {detailBox("ready", <>
            Le <b style={{color:"#F2F4F7"}}>score de préparation</b> combine sommeil, courbatures, motivation et RPE. À <b style={{color:"#F2F4F7"}}>71/100</b> = fatigue modérée, typique d'une fin d'accumulation.
            {reco("🎯","Maintiens la charge mais priorise le sommeil (cible 8h). Sous 60, avance le déload.")}
            <div style={{marginTop:10,fontSize:11,color:"rgba(242,244,247,0.4)",fontStyle:"italic"}}>Ces valeurs deviennent réelles avec le check-in hebdo (20 s).</div>
          </>)}
        </>)}

        {/* 3. ACWR (DÉMO) */}
        {card("acwr", <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={lbl}>Ratio charge aiguë / chronique</div>
              <div><span style={{fontSize:30,fontWeight:800,color:"#34D399",letterSpacing:-1}}>1.18</span> <span style={{fontSize:13,fontWeight:600,color:"rgba(242,244,247,0.35)"}}>optimal</span></div>
            </div>
            {demoBadge}
          </div>
          <div style={{position:"relative",height:30,margin:"16px 0 16px"}}>
            <div style={{position:"absolute",bottom:8,left:0,right:0,height:8,borderRadius:4,background:"linear-gradient(90deg,#F87171 0%,#F59E0B 16%,#34D399 32%,#34D399 64%,#F59E0B 80%,#F87171 100%)"}}/>
            <div style={{position:"absolute",bottom:2,left:"59%",width:3,height:20,background:"#fff",borderRadius:2,boxShadow:"0 0 6px rgba(255,255,255,0.5)",transform:"translateX(-50%)"}}/>
            <div style={{position:"absolute",bottom:-12,left:0,right:0,display:"flex",justifyContent:"space-between",fontSize:8,color:"rgba(242,244,247,0.3)"}}><span>0.5</span><span>0.8</span><span style={{color:"#34D399"}}>1.0</span><span>1.3</span><span>1.5+</span></div>
          </div>
          {expandRow("acwr","Pourquoi c'est crucial")}
          {detailBox("acwr", <>
            L'<b style={{color:"#F2F4F7"}}>ACWR</b> compare ta charge des 7 derniers jours à ta moyenne 28 jours. Indicateur n°1 du <b style={{color:"#F2F4F7"}}>risque de blessure</b>.<br/><br/>
            • <b style={{color:"#F2F4F7"}}>0,8–1,3</b> : adaptation optimale<br/>• <b style={{color:"#F2F4F7"}}>&gt;1,5</b> : pic dangereux (risque ×2 à ×4)<br/>• <b style={{color:"#F2F4F7"}}>&lt;0,8</b> : désentraînement
            {reco("✅","À 1,18 tu progresses sans danger. Évite une hausse brutale de volume (reste sous 1,3).")}
            <div style={{marginTop:10,fontSize:11,color:"rgba(242,244,247,0.4)",fontStyle:"italic"}}>Calculé automatiquement dès que tu loggues tes charges en séance.</div>
          </>)}
        </>)}

        {/* 4. SURENTRAÎNEMENT (DÉMO partiel) */}
        {card("over", <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={lbl}>Détection surentraînement</div>
              <div style={{fontSize:22,fontWeight:800,color:"#F59E0B"}}>Surveillance</div>
            </div>
            {badge("rgba(245,158,11,0.15)","#F59E0B","2 / 4 signaux")}
          </div>
          <div style={{marginTop:14}}>
            {[["📉","Performance","Reps en baisse · dév. couché","Alerte","#F87171"],
              ["😴","Sommeil","6h moyenne (cible 8h)","À surveiller","#F59E0B"],
              ["💓","FC repos","58 bpm · stable","OK","#34D399"],
              ["🔥","Motivation","Élevée","OK","#34D399"]].map(([ic,t,s,st,col],k)=>(
              <div key={k} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 0",borderBottom:k<3?"1px solid rgba(255,255,255,0.04)":"none"}}>
                <div style={{width:34,height:34,borderRadius:10,background:`${col}18`,display:"grid",placeItems:"center",flexShrink:0,fontSize:15}}>{ic}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#F2F4F7",fontFamily:DISP_F}}>{t}</div>
                  <div style={{fontSize:10.5,color:"rgba(242,244,247,0.35)",marginTop:1,fontFamily:DISP_F}}>{s}</div>
                </div>
                {badge(`${col}15`,col,st)}
              </div>
            ))}
          </div>
          {expandRow("over","Interprétation coach")}
          {detailBox("over", <>
            <b style={{color:"#F2F4F7"}}>2 signaux sur 4</b> au orange/rouge. Ce n'est pas du surentraînement, mais du <b style={{color:"#F2F4F7"}}>surmenage fonctionnel</b> — attendu en fin d'accumulation et bénéfique s'il est suivi d'un déload.
            {reco("🩺","Baisse de perf + sommeil court = fatigue centrale. Tiens 1 semaine puis déload. Si un 3ᵉ signal vire au rouge, déload immédiat.")}
          </>)}
        </>)}

        {/* 5. PROGRESSION 1RM (projection) */}
        {card("rm", <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={lbl}>Progression force · Squat</div>
              <div><span style={{fontSize:30,fontWeight:800,color:"#60A5FA",letterSpacing:-1}}>+6.2</span> <span style={{fontSize:13,fontWeight:600,color:"rgba(242,244,247,0.35)"}}>% en 3 sem.</span></div>
            </div>
            {badge("rgba(52,211,153,0.15)","#34D399","↗ En hausse")}
          </div>
          <div style={{marginTop:12,height:56}}>
            <svg width="100%" height="56" viewBox="0 0 326 56" preserveAspectRatio="none">
              <path d="M8 38 L71.6 33 L135.2 23 M135.2 23 L198.8 18 L262.4 28 L326 8" fill="none" stroke="rgba(59,130,246,0.25)" strokeWidth="1.5" strokeDasharray="4 3"/>
              <path d="M8 38 L71.6 33 L135.2 23" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="8" cy="38" r="3" fill="#3B82F6"/><circle cx="71.6" cy="33" r="3" fill="#3B82F6"/><circle cx="135.2" cy="23" r="5" fill="#3B82F6" stroke="#fff" strokeWidth="1.5"/>
              <circle cx="198.8" cy="18" r="3" fill="rgba(59,130,246,0.3)"/><circle cx="262.4" cy="28" r="3" fill="rgba(59,130,246,0.3)"/><circle cx="326" cy="8" r="3" fill="rgba(59,130,246,0.3)"/>
            </svg>
          </div>
          <div style={{display:"flex",gap:6,marginTop:8}}>
            {[["100","S1",0],["102","S2",0],["106","S3",1],["108","S4",0],["104","S5",0],["112","S6",0]].map(([v,l,cur],k)=>(
              <div key={k} style={{flex:1,textAlign:"center"}}>
                <div style={{fontSize:12,fontWeight:cur?800:700,color:cur?"#60A5FA":k>2?"rgba(242,244,247,0.3)":"#60A5FA"}}>{v}<span style={{fontSize:8,opacity:.6}}>kg</span></div>
                <div style={{fontSize:8,color:"rgba(242,244,247,0.3)",marginTop:1}}>{l}</div>
              </div>
            ))}
          </div>
          {expandRow("rm","Détail de la progression")}
          {detailBox("rm", <>
            Ton <b style={{color:"#F2F4F7"}}>1RM estimé</b> au squat passe de 100 à 106 kg en 3 semaines (formule d'Epley sur tes meilleures séries).
            {reco("📈","Progression saine (+2%/sem). Projection post-déload (pointillé) : pic à 112 kg en S6 si tu respectes la périodisation.")}
            <div style={{marginTop:10,fontSize:11,color:"rgba(242,244,247,0.4)",fontStyle:"italic"}}>Se base sur tes records réels dès que tu en saisis.</div>
          </>)}
        </>)}

        <div style={{height:20}}/>
      </div>
    </div>
  );
}

function ProgrammeView(props) {
  const { prog, setProg, progs, setProgs, premium, setPaywall, push, calSess, setCalSess, checkedEx, createStep, setCS, newP, setNewP, jourActif, setJourActif, groupe, setGroupe, editExIdx, setEditExIdx, exModal, setExModal, exModalTab, setExModalTab, INT, EX, setProgView, cycleStart, setCycleStart, semC, jR, profil } = props;

  // vue interne : "creer" uniquement (seance detail → overlay fixe via selectedJour)
  const [innerView,    setInnerView]    = useState("list");  // gardé pour compatibilité Creer
  const [selectedJour, setSelectedJour] = useState(null);    // {jIdx} → ouvre SeanceDetailModal en overlay
  const [confirmDel, setConfirmDel] = useState(null); // {type:"prog"|"jour", progIdx, jourIdx}
  const [isCreating, setIsCreating] = useState(false);
  const [openJour,   setOpenJour]   = useState(null);

  const allProgs = progs && progs.length > 0 ? progs : (prog ? [prog] : []);

  // Synchro : quand on modifie un prog de la liste, mettre à jour prog actif si c'est le même
  const updateProgAtIdx = (idx, updatedP) => {
    const next = [...allProgs];
    next[idx] = updatedP;
    setProgs(next);
    // Mettre à jour prog actif si même titre/id
    if (prog && (prog.id === updatedP.id || prog.titre === allProgs[idx].titre)) {
      setProg(updatedP);
    }
  };

  const deleteProgAtIdx = (idx) => {
    const delProg = allProgs[idx];
    const next = allProgs.filter((_,i) => i !== idx);
    setProgs(next);
    if (prog && (prog.titre === delProg.titre || prog.id === delProg.id)) {
      setProg(next[0] || null);
    }
    // Nettoyer calSess : supprimer toutes les entrées liées aux séances de ce programme
    if (delProg.jours && setCalSess) {
      const joursNoms = new Set(delProg.jours.flatMap(j => [j.nom, j.focus].filter(Boolean)));
      setCalSess(prev => {
        const ns = {...prev};
        Object.keys(ns).forEach(k => { if (joursNoms.has(ns[k]?.nom)) delete ns[k]; });
        return ns;
      });
    }
    setConfirmDel(null);
    push("🗑️","Programme supprimé","Le programme et ses séances ont été retirés du calendrier.");
  };

  const deleteJourAtIdx = (pIdx, jIdx) => {
    const jour = allProgs[pIdx].jours[jIdx];
    const u = JSON.parse(JSON.stringify(allProgs[pIdx]));
    u.jours.splice(jIdx, 1);
    updateProgAtIdx(pIdx, u);
    // Nettoyer calSess : supprimer les entrées de ce jour
    if (jour && setCalSess) {
      const jourNoms = new Set([jour.nom, jour.focus].filter(Boolean));
      setCalSess(prev => {
        const ns = {...prev};
        Object.keys(ns).forEach(k => { if (jourNoms.has(ns[k]?.nom)) delete ns[k]; });
        return ns;
      });
    }
    setConfirmDel(null);
    push("🗑️","Séance supprimée","La séance a été retirée du programme et du calendrier.");
  };

  const showCreerForm = isCreating || createStep > 0 || (newP.nom !== "" || newP.jours.length > 0);
  const resetCreating = () => { setIsCreating(false); setCS(0); setNewP({nom:"",jours:[],seances:{}}); };
  const creerProps = {
    ...props,
    onCancel: resetCreating,
    setProgView: (v) => { resetCreating(); if(v === "calendar") setProgView("calendar"); else setInnerView("list"); },
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const SERIF_F  = "'DM Serif Display','Georgia',serif";
  const DISP_F   = "'Outfit','DM Sans',system-ui,sans-serif";
  const semN     = (semC||0)+1;
  const cc = (cat) => ({principal:"#4D8BFF",correctif:"#FF7A6B",gainage:"#5FE0A5",isolation:"#B69DFF"}[cat||"principal"]||"#4D8BFF");
  const progIdx = Math.max(0, allProgs.findIndex(p => prog && (p.id===prog.id || p.titre===prog.titre)));
  const durOf = (j) => {
    const exs = j.exercices||[];
    if (!exs.length) return null;
    const secs = exs.reduce((sum,ex) => {
      const s = parseInt(ex.series)||4, r = parseInt(String(ex.repos||"90").replace(/\D/g,""))||90;
      return sum + s*(r+60);
    },0);
    return Math.round(secs/60);
  };

  return (
    <div style={{padding:"0 15px"}}>

      {/* ── Confirm delete modal ── */}
      {confirmDel && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,26,46,0.55)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:C.s1,borderRadius:16,padding:"22px 20px",width:"100%",maxWidth:340}}>
            <div style={{fontFamily:DISP_F,fontSize:16,fontWeight:500,marginBottom:8,color:"#F2F4F7"}}>
              {confirmDel.type==="prog" ? "Supprimer ce programme ?" : "Supprimer cette séance ?"}
            </div>
            <div style={{fontSize:12,color:"rgba(242,244,247,0.50)",marginBottom:20,lineHeight:1.5}}>
              {confirmDel.type==="prog"
                ? "Toutes les séances seront perdues. Cette action est irréversible."
                : "La séance et tous ses exercices seront supprimés définitivement."}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setConfirmDel(null)} style={{flex:1,padding:"10px",background:C.s2,border:"none",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:500,color:"rgba(242,244,247,0.50)",fontFamily:DISP_F}}>Annuler</button>
              <button onClick={()=>confirmDel.type==="prog" ? deleteProgAtIdx(confirmDel.pIdx) : deleteJourAtIdx(confirmDel.pIdx, confirmDel.jIdx)} style={{flex:1,padding:"10px",background:"#FF7A6B",border:"none",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:600,color:"#141A2E",fontFamily:DISP_F}}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{paddingTop:6,marginBottom:18}}>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:C.blue,fontFamily:DISP_F,marginBottom:5}}>Programme</div>
        <div style={{fontFamily:SERIF_F,fontSize:28,color:"#F2F4F7",lineHeight:1.1,letterSpacing:-1}}>
          Ton <span style={{fontStyle:"italic",color:C.blue}}>programme</span>
        </div>
        <div style={{fontSize:11,color:"rgba(242,244,247,0.38)",marginTop:5,fontFamily:DISP_F}}>
          {prog ? `${prog.titre} · ${prog.jours?.length||0} séances/sem · Sem. ${semN}` : "Crée ton premier programme pour commencer."}
        </div>
      </div>

      {/* ── Programme actif ── */}
      {prog && prog.jours?.length > 0 && (<>

        {/* Séances accordion */}
        {prog.jours.map((j, jIdx) => {
          const int  = INT[j.intensite||"modere"];
          const dur  = durOf(j);
          const isOpen = openJour===jIdx;
          const exos = j.exercices||[];
          return (
            <div key={jIdx} style={{background:C.s1,border:`1px solid ${isOpen?int.c+"40":C.bd}`,borderRadius:18,marginBottom:10,overflow:"hidden",transition:"border-color .2s"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",cursor:"pointer"}} onClick={()=>setOpenJour(isOpen?null:jIdx)}>
                <div style={{width:46,height:46,borderRadius:13,background:int.c,border:"none",color:"#fff",display:"grid",placeItems:"center",flexShrink:0,fontFamily:DISP_F,fontSize:12,fontWeight:800,boxShadow:`0 4px 12px ${int.c}55`}}>
                  {j.focus||j.nom?.slice(0,3)||"—"}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:15,fontWeight:700,color:"#F2F4F7",letterSpacing:-0.2,fontFamily:DISP_F}}>{j.nom}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3,fontSize:11.5,color:"rgba(242,244,247,0.55)",fontFamily:DISP_F}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:int.c,boxShadow:`0 0 5px ${int.c}60`,flexShrink:0}}/>
                    {int.l} · {exos.length} exercice{exos.length!==1?"s":""}{dur?` · ~${dur} min`:""}
                  </div>
                </div>
                <button onClick={e=>{e.stopPropagation();setSelectedJour({jIdx});}}
                  style={{width:34,height:34,borderRadius:10,background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.22)",color:"#60A5FA",cursor:"pointer",display:"grid",placeItems:"center",flexShrink:0,fontSize:14}}>✏️</button>
                <div style={{color:"rgba(242,244,247,0.40)",fontSize:18,transition:"transform .2s",transform:isOpen?"rotate(180deg)":"rotate(0)",flexShrink:0}}>⌄</div>
              </div>
              {isOpen && (
                <div style={{borderTop:`1px solid ${C.bd}`,padding:"8px 14px 14px"}}>
                  {exos.length===0
                    ? <div style={{textAlign:"center",padding:"12px 0",fontSize:11,color:"rgba(242,244,247,0.30)",fontFamily:DISP_F}}>Aucun exercice — tape ✏️ pour en ajouter</div>
                    : exos.map((ex,k) => (
                      <div key={k} style={{display:"flex",alignItems:"flex-start",gap:11,padding:"9px 0",borderBottom:k<exos.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
                        <div style={{width:30,height:30,borderRadius:9,background:`${cc(ex.cat)}20`,border:`1px solid ${cc(ex.cat)}35`,color:cc(ex.cat),display:"grid",placeItems:"center",fontFamily:DISP_F,fontSize:11,fontWeight:800,flexShrink:0}}>{k+1}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13.5,fontWeight:700,color:"#F2F4F7",fontFamily:DISP_F,letterSpacing:-0.1}}>{ex.nom}</div>
                          <div style={{fontSize:9,fontWeight:800,letterSpacing:"1px",color:"rgba(242,244,247,0.30)",textTransform:"uppercase",fontFamily:DISP_F,marginTop:2}}>{ex.cat||"Principal"}</div>
                        </div>
                        <div style={{fontSize:12,fontWeight:600,color:"rgba(242,244,247,0.45)",fontFamily:DISP_F,flexShrink:0,marginTop:2,textAlign:"right",whiteSpace:"nowrap"}}>
                          {ex.series}×{ex.reps} · {ex.repos}s
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          );
        })}

        {/* Mésocycle */}
        <MesocycleChart prog={prog} semC={semC} checkedEx={checkedEx}/>

      </>)}

      {/* ── Autres programmes ── */}
      {allProgs.length > 1 && (
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:"1.3px",textTransform:"uppercase",color:C.blue,fontFamily:DISP_F,marginBottom:10}}>Autres programmes</div>
          {allProgs.map((p, pIdx) => {
            const isActive = prog && (prog.titre === p.titre || prog.id === p.id);
            if (isActive) return null;
            return (
              <div key={pIdx} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.s1,border:`1px solid ${C.bd}`,borderRadius:12,marginBottom:6}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#F2F4F7",fontFamily:DISP_F}}>{p.titre}</div>
                  <div style={{fontSize:10.5,color:"rgba(242,244,247,0.40)",marginTop:1}}>{p.jours?.length||0} séances</div>
                </div>
                <button onClick={()=>{setProg(p);push("✅","Programme activé",p.titre);}} style={{padding:"6px 10px",background:"rgba(52,211,153,0.10)",border:"1px solid rgba(52,211,153,0.25)",borderRadius:8,color:"#34D399",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:DISP_F}}>Activer</button>
                <button onClick={()=>setConfirmDel({type:"prog",pIdx})} style={{padding:"6px 8px",background:"rgba(248,113,113,0.07)",border:"1px solid rgba(248,113,113,0.18)",borderRadius:8,color:"#FF7A6B",cursor:"pointer",fontSize:11}}>🗑</button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Empty state ── */}
      {allProgs.length === 0 && !showCreerForm && (
        <div style={{textAlign:"center",padding:"32px 0 16px"}}>
          <div style={{fontFamily:SERIF_F,fontSize:22,fontWeight:400,color:"#F2F4F7",marginBottom:8}}>Aucun programme</div>
          <div style={{fontSize:12,color:"rgba(242,244,247,0.45)",lineHeight:1.6,maxWidth:240,margin:"0 auto 24px",fontFamily:DISP_F}}>Génère un programme IA adapté à ta morphologie ou crée-le manuellement.</div>
        </div>
      )}

      {/* ── CTAs ── */}
      {!showCreerForm && (
        <div style={{marginBottom:12}}>
          <Btn onClick={()=>{ if(!premium) setPaywall(true); else setProgView("analyse"); }}>✨ Nouveau programme IA</Btn>
          <Btn v="out" onClick={()=>{ setIsCreating(true); setCS(0); setNewP({nom:"",jours:[],seances:{}}); }}>+ Créer manuellement</Btn>
        </div>
      )}

      {showCreerForm && (
        <Creer {...creerProps} progs={allProgs} setProgsAll={(next)=>{ setProgs(next); if(next.length>0) setProg(next[next.length-1]); }}/>
      )}

      {/* ── SeanceDetailModal en overlay fixe ── */}
      {selectedJour !== null && prog?.jours?.[selectedJour.jIdx] && (
        <div style={{position:"fixed",inset:0,zIndex:400,background:C.bg,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
          <SeanceDetailModal
            jour={prog.jours[selectedJour.jIdx]}
            jourIdx={selectedJour.jIdx}
            prog={prog}
            setProg={(u) => updateProgAtIdx(progIdx, u)}
            onClose={() => setSelectedJour(null)}
            C={C} INT={INT}
          />
        </div>
      )}
    </div>
  );
}

// ─── PROGRAMTAB ──────────────────────────────────────────────────────────────

export default function ProgramTab(props){
  const { prog, setProg, progs, setProgs, cycleStart, setCycleStart, premium, setPaywall, push, calSess, setCalSess, checkedEx, setCheckedEx, seance, setSeance, setChrono, setChronoSec, exDetails, setExDetails, exEdit, setExEdit, profil, cycles, EX, loadIA, setLoadIA, loadMsg, setLoadMsg, photos, setPhotos, readFile, corrigerFaibles, setCorrigerFaibles } = props;

  // ─── State interne ───────────────────────────────────────────────────────
  const getInitialView = () => {
    try {
      const v = localStorage.getItem("mc_progView");
      if (v) { localStorage.removeItem("mc_progView"); return v; }
    } catch {}
    // Si un programme existe, afficher "today" par défaut; sinon "creer"
    try {
      const savedProg = localStorage.getItem("mc_prog");
      if (savedProg && savedProg !== "null") return "today";
    } catch {}
    return "creer";
  };
  const [progView,   setProgView]   = useState(getInitialView);
  const [createStep, setCS]         = useState(0);
  const [newP,       setNewP]       = useState({nom:"",jours:[],seances:{}});
  const [jourActif,  setJourActif]  = useState(null);
  const [groupe,     setGroupe]     = useState(null);
  const [editExIdx,  setEditExIdx]  = useState({});
  const [exModal,    setExModal]    = useState(null);
  const [exModalTab, setExModalTab] = useState("tips");

  const subNav = [
    {id:"today",    l:"Aujourd'hui"},
    {id:"creer",    l:"Programme"},
    {id:"calendar", l:"Planning"},
    {id:"analyse",  l:"Pro", prem:true},
  ];

  // Props partagés pour tous les sous-composants
  const sharedProps = {
    prog, setProg, progs, setProgs, cycleStart, setCycleStart,
    premium, setPaywall, push,
    calSess, setCalSess,
    checkedEx, setCheckedEx,
    seance, setSeance,
    setChrono, setChronoSec,
    exDetails, setExDetails,
    exEdit, setExEdit,
    profil, cycles, EX, C, INT,
    setProgView,
    setTab: props.setTab,
    jR: props.jR,
    semC: props.semC,
  };

  // Props pour Creer (inclut le state de création)
  const creerProps = {
    ...sharedProps,
    createStep, setCS,
    newP, setNewP,
    jourActif, setJourActif,
    groupe, setGroupe,
    editExIdx, setEditExIdx,
    exModal, setExModal,
    exModalTab, setExModalTab,
    setProgView,
  };

  // Props pour AnalyseIA
  const analyseProps = {
    profil,
    photos, setPhotos, readFile,
    loadIA, setLoadIA,
    loadMsg, setLoadMsg,
    corrigerFaibles, setCorrigerFaibles,
    setProg, setCycleStart, setCalSess,
    setProgView, setTab: props.setTab,
    cycles, setCycles: props.setCycles,
    prog,
    push, C, INT, EX,
  };

  return(
    <div style={{paddingBottom:16}}>
      {/* ── Segmented TopTabs (mockup) ── */}
      <div style={{padding:"16px 20px 0"}}>
        <div style={{display:"flex",gap:6,padding:4,borderRadius:14,background:"rgba(7,10,20,0.7)",border:`1px solid ${C.bd}`}}>
          {subNav.map(s=>{
            const on=progView===s.id;
            return(
              <button key={s.id} onClick={()=>setProgView(s.id)} className="tap" style={{
                flex:1,padding:"8px 6px",borderRadius:11,
                background:on?C.s2:"transparent",
                border:on?`1px solid ${C.bdHi}`:"1px solid transparent",
                color:on?C.text:"rgba(245,241,232,0.50)",
                fontSize:11.5,fontWeight:700,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",letterSpacing:0.2,
                boxShadow:on?"0 2px 6px rgba(0,0,0,0.25)":"none",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",gap:4,
              }}>
                {s.prem&&<span style={{color:on?C.gold:C.goldL,fontSize:11}}>♛</span>}
                {s.l}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{height:14}}/>

      {/* ── Planification ── */}
      {progView==="calendar" && <Calendar {...sharedProps} />}

      {/* ── Aujourd'hui ── */}
      {progView==="today" && <TodayView {...sharedProps} />}

      {/* ── Programme (creer) ── */}
      {progView==="creer" && (
        <ProgrammeView {...creerProps} />
      )}

      {/* ── Pro (AnalyseIA si premium, sinon upsell) ── */}
      {progView==="analyse" && premium && <AnalyseIA {...analyseProps} />}
      {progView==="analyse" && !premium && (
        <div style={{padding:"4px 20px 0"}}>
          <div style={{fontSize:9,fontWeight:700,color:C.dim,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}>MorphoCoach</div>
          <div style={{fontFamily:"'Instrument Serif',serif",fontSize:32,fontWeight:400,letterSpacing:-1.2,color:C.text,lineHeight:1.05,marginTop:6}}>Passe en <span style={{fontStyle:"italic",color:C.goldL}}>Pro</span></div>
          <div style={{fontSize:12.5,color:C.mid,marginTop:6,fontWeight:500,lineHeight:1.4}}>L'expérience complète. Programmes générés sur-mesure, suivi avancé, accès illimité.</div>

          <div style={{position:"relative",borderRadius:26,overflow:"hidden",marginTop:20,padding:"26px 22px 24px",background:`radial-gradient(120% 60% at 70% 0%, rgba(255,171,93,0.22), transparent 60%), radial-gradient(80% 60% at 0% 100%, rgba(77,139,255,0.18), transparent 60%), linear-gradient(160deg, ${C.s2} 0%, ${C.s1} 100%)`,border:`1px solid ${C.bdHi}`,boxShadow:"0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg, transparent, ${C.gold}, ${C.blue}, transparent)`}}/>
            <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:999,background:`${C.gold}20`,border:`1px solid ${C.gold}40`,color:C.goldL,fontSize:10,fontWeight:800,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",letterSpacing:1}}>♛ PRO</div>
            <div style={{fontFamily:"'Instrument Serif',serif",fontSize:36,fontWeight:400,letterSpacing:-1.3,color:C.text,lineHeight:1,marginTop:16}}>L'expérience<br/><span style={{fontStyle:"italic",color:C.goldL}}>complète.</span></div>
            <div style={{marginTop:20,display:"flex",flexDirection:"column",gap:12}}>
              {[
                {i:"✦",t:"Coach morphologique",s:"Programme adapté à ta morphologie précise"},
                {i:"◎",t:"Exercices correctifs",s:"Compensation des asymétries & déséquilibres"},
                {i:"♛",t:"Cycle 6 semaines",s:"Périodisation pro pour des gains durables"},
                {i:"⊙",t:"Suivi 3D",s:"Mesures corporelles et photo-progression"},
              ].map(f=>(
                <div key={f.t} style={{display:"flex",alignItems:"flex-start",gap:12}}>
                  <div style={{width:32,height:32,borderRadius:10,flexShrink:0,background:`${C.gold}18`,border:`1px solid ${C.gold}35`,color:C.goldL,display:"grid",placeItems:"center",fontSize:14}}>{f.i}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",letterSpacing:-0.1}}>{f.t}</div>
                    <div style={{fontSize:11.5,color:C.mid,fontWeight:500,marginTop:2,lineHeight:1.4}}>{f.s}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:20,padding:"14px 16px",borderRadius:16,background:"rgba(11,15,31,0.5)",border:`1px solid ${C.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:9,fontWeight:700,color:C.dim,letterSpacing:1.5,textTransform:"uppercase",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif"}}>Cycle 6 semaines</div>
                <div style={{marginTop:4,display:"flex",alignItems:"baseline",gap:4}}>
                  <span style={{fontFamily:"'Instrument Serif',serif",fontSize:34,fontWeight:400,letterSpacing:-1,color:C.text,lineHeight:1}}>19,99</span>
                  <span style={{fontSize:13,color:C.mid,fontWeight:600}}>€ / cycle</span>
                </div>
              </div>
              <div style={{padding:"5px 10px",borderRadius:999,background:`${C.mint}18`,border:`1px solid ${C.mint}40`,color:C.mint,fontSize:10,fontWeight:800,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",letterSpacing:0.5}}>ÉCONOMIE 40%</div>
            </div>
            <button className="tap" onClick={()=>setPaywall(true)} style={{marginTop:16,width:"100%",padding:"16px",borderRadius:16,background:`linear-gradient(135deg, ${C.gold}, ${C.amberDk})`,border:"1px solid rgba(255,255,255,0.22)",color:"#1A1308",fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:15,fontWeight:700,letterSpacing:0.2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:`0 10px 24px ${C.amberDk}55, inset 0 1px 0 rgba(255,255,255,0.45)`}}>⚡ Commencer maintenant</button>
            <button onClick={()=>setProgView("today")} style={{marginTop:10,width:"100%",padding:"6px",background:"transparent",border:"none",color:C.mid,fontSize:12,fontWeight:600,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",cursor:"pointer"}}>Continuer en gratuit</button>
          </div>
        </div>
      )}
    </div>
  );
}
