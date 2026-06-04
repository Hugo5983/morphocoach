import { useState } from "react";
import { C, INT, FONT } from "../../data/constants.js";
import { EX } from "../../data/exercises.js";
import { Card, Eyebrow, Lbl, Btn, Row } from "../../components/ui/index.jsx";
import { Tabs } from "../../components/ui/Tabs.jsx";
import { MonthCal } from "../../components/ui/MonthCal.jsx";
import { findExInDB } from "../../utils/training.js";
import { CardioModal, SportModal, GuideExModal, InfoExModal, ExerciceEditable } from "./components/CalendarModals.jsx";

export default function Calendar(props) {
  const { prog, setProg, progs, setProgs, cycleStart, setTab, premium, setPaywall, push, calSess, setCalSess, checkedEx, setCheckedEx, setChrono, setChronoSec, jR, semC, INT, setProgView, profil } = props;

  const [bonusModal,   setBonusModal]   = useState(null);
  const [cardioOpen,   setCardioOpen]   = useState(false);
  const [sportOpen,    setSportOpen]    = useState(false);
  const [viewJour,     setViewJour]     = useState(null);
  const [currentWeek,  setCurrentWeek]  = useState(semC || 0);
  const [guideEx,      setGuideEx]      = useState(null);
  const [infoEx,       setInfoEx]       = useState(null);

  // Toggle de validation d'un exercice (avec déclenchement chrono)
  const toggleCheck = (seanceId, exIdx, repos) => {
    if (!setCheckedEx) return;
    const key = `${seanceId}-${exIdx}`;
    const wasChecked = checkedEx?.[key];
    setCheckedEx(prev => ({...prev, [key]: !prev[key]}));
    if (!wasChecked && repos && setChrono && setChronoSec) {
      const sec = parseInt((repos+"").replace(/[^0-9]/g,"")) || 90;
      setChronoSec(sec);
      setChrono(true);
    }
  };

  const WEEK_INTENSITY = ["modere","modere","lourd","lourd","intense","leger"];
  const METHODS = ["Classique","Pyramidal","Super-set","Drop-set","Rest-pause","5×5","Séries de 100","Dégressif"];

  // ── Cardio modal ──
  if (cardioOpen) {
    return (
      <CardioModal
        poids={profil?.poids}
        C={C}
        onClose={() => setCardioOpen(false)}
        onSave={(sess) => {
          const today = new Date();
          const key = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
          setCalSess(s => ({...s,[key]:sess}));
          setCardioOpen(false);
          push("🏃","Cardio enregistré !",`${sess.nom}${sess.cardio?.kcal?` · ${sess.cardio.kcal} kcal`:""}`);
        }}
      />
    );
  }

  // ── Sport modal ──
  if (sportOpen) {
    return (
      <SportModal
        poids={profil?.poids}
        C={C}
        onClose={() => setSportOpen(false)}
        onSave={(sess) => {
          const today = new Date();
          const key = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
          setCalSess(s => ({...s,[key]:sess}));
          setSportOpen(false);
          push("🏆","Sport enregistré !",`${sess.nom}${sess.sport?.kcal?` · ${sess.sport.kcal} kcal`:""}`);
        }}
      />
    );
  }

  // ── Info modal ──
  if (infoEx) {
    return (
      <InfoExModal
        ex={infoEx.ex}
        dbEx={infoEx.dbEx}
        onClose={() => setInfoEx(null)}
        onOpenGuide={infoEx.dbEx ? (dbEx, serieEx) => { setInfoEx(null); setGuideEx({dbEx, serieEx}); } : null}
      />
    );
  }

  // ── Guide modal ──
  if (guideEx) {
    return <GuideExModal exData={guideEx.dbEx} exSerie={guideEx.serieEx} onClose={() => setGuideEx(null)} C={C} INT={INT} />;
  }

  // ── Vue détail séance ──
  if (viewJour !== null && prog) {
    const jour = prog.jours[viewJour];
    const weekInt = INT[WEEK_INTENSITY[currentWeek]];
    const int = INT[jour.intensite || "modere"];
    return (
      <div style={{padding:"0 15px"}}>
        <button onClick={() => setViewJour(null)} style={{background:"transparent",border:"none",color:"#4D8BFF",cursor:"pointer",fontSize:13,fontWeight:600,padding:"16px 0 12px",display:"flex",alignItems:"center",gap:5}}>← Retour aux séances</button>
        <div style={{padding:"12px 14px",background:`${int.c}14`,border:`0.5px solid ${int.c}40`,borderRadius:12,marginBottom:4}}>
          <div style={{fontSize:9,color:int.c,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>{int.l}</div>
          <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:18,fontWeight:400,marginBottom:2}}>{jour.nom}</div>
          <div style={{fontSize:11,color:"rgba(245,241,232,0.50)"}}>{jour.focus} · {jour.duree} · {jour.exercices?.length||0} exercices</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",background:`${weekInt.c}10`,border:`0.5px solid ${weekInt.c}30`,borderRadius:8,marginBottom:12}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:weekInt.c,flexShrink:0}}/>
          <div style={{fontSize:10,color:weekInt.c,fontWeight:600}}>Semaine {currentWeek+1} — {weekInt.l}</div>
        </div>
        {(jour.exercices||[]).length === 0 && <div style={{textAlign:"center",padding:"24px 0",color:"rgba(245,241,232,0.50)",fontSize:13}}>Aucun exercice dans cette séance.</div>}
        {(jour.exercices||[]).map((ex,k) => {
          const cc = {principal:"#4D8BFF",correctif:"#FF7A6B",gainage:"#5FE0A5",isolation:"#B69DFF",correctiv:"#FF7A6B"}[ex.cat||"principal"]||"#4D8BFF";
          return <ExerciceEditable key={k} ex={ex} exIdx={k} jourIdx={viewJour} prog={prog} setProg={setProg} cc={cc} METHODS={METHODS} onGuide={(dbEx,serieEx)=>setGuideEx({dbEx,serieEx})} onInfo={(exo)=>setInfoEx({ex:exo,dbEx:findExInDB(exo.nom)})} checkedEx={checkedEx} toggleCheck={toggleCheck} seanceId={prog.jours[viewJour].id} />;
        })}
      </div>
    );
  }

  return (
    <div style={{padding:"0 15px"}}>

      {/* ── Header planning ── */}
      <div style={{marginBottom:20,paddingTop:4}}>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:'1.4px',textTransform:'uppercase',color:'#3B82F6',fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",marginBottom:8}}>Planning</div>
        <div style={{fontFamily:"'DM Serif Display','Georgia',serif",fontSize:34,fontWeight:400,letterSpacing:-1.2,color:'#F2F4F7',lineHeight:1.05,marginBottom:2}}>
          Ton mois
        </div>
        <div style={{fontFamily:"'DM Serif Display','Georgia',serif",fontSize:34,fontWeight:400,letterSpacing:-1.2,color:'#3B82F6',lineHeight:1.05,fontStyle:'italic',marginBottom:12}}>
          en clair.
        </div>
        <div style={{fontSize:12.5,color:'rgba(242,244,247,0.45)',lineHeight:1.6,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontWeight:400}}>
          Densité d'effort, séances planifiées, jours de récupération.
        </div>
      </div>

      <MonthCal sessions={calSess} semC={semC} currentWeek={currentWeek} onUpdate={(date,sess) => {
        if (sess) setCalSess(s => ({...s,[date]:sess}));
        else setCalSess(s => { const ns={...s}; delete ns[date]; return ns; });
      }}/>


    </div>
  );
}
