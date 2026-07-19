import { useState } from"react";
import useScrollTop from"../../hooks/useScrollTop.js";
import { C, INT, FONT } from"../../data/constants.js";
import Calendar from"./Calendar.jsx";
import TodayView from"./TodayView.jsx";
import AnalyseIA from"../ai/AnalyseIA.jsx";
import ProgrammeView from"./ProgrammeView.jsx";

export default function ProgramTab(props){
  useScrollTop();
  const { prog, setProg, progs, setProgs, cycleStart, setCycleStart, premium, setPaywall, push, calSess, setCalSess, checkedEx, setCheckedEx, seance, setSeance, setChrono, setChronoSec, exDetails, setExDetails, exEdit, setExEdit, profil, cycles, EX, loadIA, setLoadIA, loadMsg, setLoadMsg, photos, setPhotos, readFile, corrigerFaibles, setCorrigerFaibles } = props;

  // ─── State interne ───────────────────────────────────────────────────────
  const getInitialView = () => {
    try {
      const v = localStorage.getItem("mc_progView");
      if (v) { localStorage.removeItem("mc_progView"); return v; }
    } catch {}
    // Si un programme existe, afficher"today" par défaut; sinon"creer"
    try {
      const savedProg = localStorage.getItem("mc_prog");
      if (savedProg && savedProg !=="null") return"today";
    } catch {}
    return"creer";
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
    <div style={{paddingBottom:32}}>
      {/* ── Segmented TopTabs (mockup) ── */}
      <div style={{padding:"16px 20px 0"}}>
        <div style={{display:"flex",gap:8,padding:4,borderRadius:16,background:C.s2,border:`1px solid rgba(0,0,0,0.08)`}}>
          {subNav.map(s=>{
            const on=progView===s.id;
            return(
              <button key={s.id} onClick={()=>setProgView(s.id)} className="tap" style={{
                flex:1,padding:"8px 8px",borderRadius:12,
                background:on?"#FFFFFF":"transparent",
                border:on?"1px solid rgba(60,91,255,0.25)":"1px solid transparent",
                color:on?C.text:C.dim,
                fontSize:11,fontWeight:700,fontFamily:FONT,letterSpacing:0.2,
                boxShadow:on?"0 1px 4px rgba(0,0,0,0.08)":"none",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",gap:4,
              }}>
                {s.prem&&<span style={{color:on?C.accent:C.blueLt,fontSize:11}}></span>}
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
          <div style={{fontSize:10,fontWeight:700,color:C.dim,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:FONT}}>MorphoCoach</div>
          <div style={{fontFamily:FONT,fontSize:34,fontWeight:700,letterSpacing:-1,color:C.text,lineHeight:1.1,marginTop:8}}>Passe en <span style={{fontStyle:"italic",color:C.blueLt}}>Pro</span></div>
          <div style={{fontSize:13,color:C.mid,marginTop:8,fontWeight:500,lineHeight:1.4}}>L'expérience complète. Programmes générés sur-mesure, suivi avancé, accès illimité.</div>

          <div style={{position:"relative",borderRadius:28,overflow:"hidden",marginTop:20,padding:"24px 24px 24px",background:`radial-gradient(120% 60% at 70% 0%, rgba(60,91,255,0.25), transparent 60%), radial-gradient(80% 60% at 0% 100%, rgba(60,91,255,0.18), transparent 60%), linear-gradient(160deg, ${C.s2} 0%, ${C.s1} 100%)`,border:`1px solid ${C.bdHi}`,boxShadow:"0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(0,0,0,0.05)"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg, transparent, ${C.accent}, ${C.blue}, transparent)`}}/>
            <div style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 12px",borderRadius:999,background:`${C.accent}20`,border:`1px solid ${C.accent}40`,color:C.blueLt,fontSize:10,fontWeight:700,fontFamily:FONT,letterSpacing:"0.1em"}}> PRO</div>
            <div style={{fontFamily:FONT,fontSize:34,fontWeight:700,letterSpacing:-1,color:C.text,lineHeight:1,marginTop:16}}>L'expérience<br/><span style={{fontStyle:"italic",color:C.blueLt}}>complète.</span></div>
            <div style={{marginTop:20,display:"flex",flexDirection:"column",gap:12}}>
              {[
                {i:"·",t:"Coach morphologique",s:"Programme adapté à ta morphologie précise"},
                {i:"◎",t:"Exercices correctifs",s:"Compensation des asymétries & déséquilibres"},
                {i:"·",t:"Cycle 6 semaines",s:"Périodisation pro pour des gains durables"},
                {i:"⊙",t:"Suivi 3D",s:"Mesures corporelles et photo-progression"},
              ].map(f=>(
                <div key={f.t} style={{display:"flex",alignItems:"flex-start",gap:12}}>
                  <div style={{width:32,height:32,borderRadius:12,flexShrink:0,background:`${C.accent}18`,border:`1px solid ${C.accent}35`,color:C.blueLt,display:"grid",placeItems:"center",fontSize:14}}>{f.i}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:FONT,letterSpacing:-0.2}}>{f.t}</div>
                    <div style={{fontSize:11,color:C.mid,fontWeight:500,marginTop:2,lineHeight:1.4}}>{f.s}</div>
                  </div>
                </div>
))}
            </div>
            <div style={{marginTop:20,padding:"16px 16px",borderRadius:16,background:"rgba(11,15,31,0.5)",border:`1px solid ${C.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:C.dim,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:FONT}}>Cycle 6 semaines</div>
                <div style={{marginTop:4,display:"flex",alignItems:"baseline",gap:4}}>
                  <span style={{fontFamily:FONT,fontSize:34,fontWeight:700,letterSpacing:-1,color:C.text,lineHeight:1}}>19,99</span>
                  <span style={{fontSize:13,color:C.mid,fontWeight:600}}>€ / cycle</span>
                </div>
              </div>
              <div style={{padding:"4px 12px",borderRadius:999,background:`${C.mint}18`,border:`1px solid ${C.mint}40`,color:C.mint,fontSize:10,fontWeight:700,fontFamily:FONT,letterSpacing:"0.1em"}}>ÉCONOMIE 40%</div>
            </div>
            <button className="tap" onClick={()=>setPaywall(true)} style={{marginTop:16,width:"100%",padding:"16px",borderRadius:16,background:`linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,border:"1px solid rgba(0,0,0,0.12)",color:"#101318",fontFamily:FONT,fontSize:14,fontWeight:700,letterSpacing:0.2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:`0 10px 24px ${C.accentDk}55, inset 0 1px 0 rgba(0,0,0,0.25)`}}> Commencer maintenant</button>
            <button onClick={()=>setProgView("today")} style={{marginTop:12,width:"100%",padding:"8px",background:"transparent",border:"none",color:C.mid,fontSize:13,fontWeight:600,fontFamily:FONT,cursor:"pointer"}}>Continuer en gratuit</button>
          </div>
        </div>
)}
    </div>
);
}

