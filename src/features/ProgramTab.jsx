import { useState } from "react";
import { INT } from "../data/constants.js";
import { Box, Lbl, Btn, Row } from "../components/ui/index.jsx";
import Calendar from "./Calendar.jsx";
import TodayView from "./TodayView.jsx";
import Creer from "./Creer.jsx";
import AnalyseIA from "./AnalyseIA.jsx";

// ─── PROGRAMTAB ──────────────────────────────────────────────────────────────

export default function ProgramTab(props){
  const {
    prog, setProg, cycleStart, setCycleStart,
    premium, setPaywall, push,
    calSess, setCalSess,
    checkedEx,
    seance, setSeance,
    setChrono, setChronoSec,
    exDetails, setExDetails,
    exEdit, setExEdit,
    profil, cycles,
    EX, C,
    loadIA, setLoadIA, loadMsg, setLoadMsg,
    photos, setPhotos, readFile,
    corrigerFaibles, setCorrigerFaibles,
  } = props;

  // ─── State interne ───────────────────────────────────────────────────────
  const getInitialView = () => {
    try {
      const v = localStorage.getItem("mc_progView");
      if (v) { localStorage.removeItem("mc_progView"); return v; }
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
    {id:"calendar", l:"Planification"},
    {id:"today",    l:"Aujourd'hui"},
    {id:"creer",    l:"Programme"},
    {id:"analyse",  l:"Programme Pro", prem:true},
  ];

  // Props partagés pour tous les sous-composants
  const sharedProps = {
    prog, setProg, cycleStart, setCycleStart,
    premium, setPaywall, push,
    calSess, setCalSess,
    checkedEx,
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

  const showCreerForm = createStep > 0 || (!prog && (newP.nom !== "" || newP.jours.length > 0));

  return(
    <div style={{paddingBottom:16}}>
      <div style={{padding:"26px 15px 12px"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:30,letterSpacing:-0.3,fontWeight:300}}>PROGRAMMATION</div>
      </div>

      {/* Sous-navigation */}
      <div style={{display:"flex",gap:5,padding:"0 15px",marginBottom:14,overflowX:"auto",paddingBottom:3}}>
        {subNav.map(s=>(
          <button
            key={s.id}
            onClick={()=>{ if(s.prem&&!premium) setPaywall(true); else setProgView(s.id); }}
            style={{
              padding:"7px 13px",
              background:progView===s.id?C.goldD:C.s2,
              border:`1px solid ${progView===s.id?C.gold:C.s3}`,
              borderRadius:18,
              color:progView===s.id?C.gold:"#64748b",
              cursor:"pointer",fontSize:11.5,fontWeight:600,
              whiteSpace:"nowrap",fontFamily:"'Inter',sans-serif",
            }}
          >{s.l}</button>
        ))}
      </div>

      {/* ── Planification ── */}
      {progView==="calendar" && <Calendar {...sharedProps} />}

      {/* ── Aujourd'hui ── */}
      {progView==="today" && <TodayView {...sharedProps} />}

      {/* ── Programme (creer) ── */}
      {progView==="creer" && (
        <div style={{padding:"0 15px"}}>
          <Box>
            <Lbl>Mon programme</Lbl>
            {prog ? (
              <div>
                <div style={{padding:"10px 12px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:9,marginBottom:12}}>
                  <div style={{fontSize:9,color:C.gold,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>Cycle {prog.numero||1} actif</div>
                  <div style={{fontSize:14,fontWeight:500}}>{prog.titre}</div>
                  <div style={{fontSize:10,color:"#64748b",marginTop:2}}>{prog.jours?.length} séances · Démarré le {prog.dateDebut}</div>
                </div>
                {prog.jours?.map((j,i)=>{
                  const int=INT[j.intensite||"modere"];
                  const total=j.exercices?.length||0;
                  const done=j.exercices?.filter((_,idx)=>checkedEx[`${j.id}-${idx}`]).length||0;
                  return(
                    <div key={i} onClick={()=>setProgView("today")} style={{padding:"10px 12px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,marginBottom:6,cursor:"pointer"}}>
                      <Row style={{justifyContent:"space-between"}}>
                        <div>
                          <div style={{fontSize:9,color:int.c,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:2}}>{int.l}</div>
                          <div style={{fontSize:13,fontWeight:500}}>{j.nom}</div>
                          <div style={{fontSize:10,color:"#64748b"}}>{j.focus} · {total} exercices</div>
                        </div>
                        <Row style={{gap:8}}>
                          {done>0&&<div style={{fontSize:10,color:C.green,fontWeight:700}}>{done}/{total}</div>}
                          {j.complete&&<div style={{fontSize:12,color:C.green}}>✓</div>}
                          <div style={{color:C.dim,fontSize:16}}>›</div>
                        </Row>
                      </Row>
                    </div>
                  );
                })}
                <div style={{height:1,background:C.s3,margin:"12px 0"}}/>
                <Btn onClick={()=>{ if(!premium) setPaywall(true); else setProgView("analyse"); }}>✨ Nouveau programme</Btn>
                <div style={{textAlign:"center",marginTop:4}}>
                  <span
                    onClick={()=>{ setCS(0); setNewP({nom:"",jours:[],seances:{}}); }}
                    style={{fontSize:11,color:"#64748b",cursor:"pointer",textDecoration:"underline",textDecorationStyle:"dotted"}}
                  >Créer manuellement</span>
                </div>
              </div>
            ):(
              <div>
                <div style={{textAlign:"center",padding:"24px 0 8px"}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:400,color:"#0f1a2e",marginBottom:4}}>Programme sur-mesure ✦</div>
                  <div style={{fontSize:12,color:"#64748b",lineHeight:1.5,marginBottom:20}}>Obtenez un programme 100% adapté à votre morphologie, niveau et objectifs grâce à notre algorithme avancé</div>
                </div>
                <Btn onClick={()=>{ if(!premium) setPaywall(true); else setProgView("analyse"); }}>✨ Générer mon programme</Btn>
                <Btn v="out" onClick={()=>{ setCS(0); setNewP({nom:"",jours:[],seances:{}}); }}>Créer manuellement</Btn>
              </div>
            )}
          </Box>
          {/* Formulaire de création manuelle */}
          {showCreerForm && <Creer {...creerProps} />}
          {/* Si pas de programme, afficher le formulaire vide directement */}
          {!prog && !showCreerForm && <Creer {...creerProps} />}
        </div>
      )}

      {/* ── Programme Pro (AnalyseIA) ── */}
      {progView==="analyse" && premium && <AnalyseIA {...analyseProps} />}
    </div>
  );
}
