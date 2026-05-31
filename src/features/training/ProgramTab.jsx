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

function ProgrammeView(props) {
  const { prog, setProg, progs, setProgs, premium, setPaywall, push, calSess, setCalSess, checkedEx, createStep, setCS, newP, setNewP, jourActif, setJourActif, groupe, setGroupe, editExIdx, setEditExIdx, exModal, setExModal, exModalTab, setExModalTab, INT, EX, setProgView, cycleStart, setCycleStart, semC, jR, profil } = props;

  // vue interne : "list" | "seance:{progIdx}:{jourIdx}" | "creer"
  const [innerView, setInnerView] = useState("list");
  const [confirmDel, setConfirmDel] = useState(null); // {type:"prog"|"jour", progIdx, jourIdx}
  const [isCreating, setIsCreating] = useState(false);

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

  // Parser innerView pour séance
  let seanceView = null;
  if (innerView.startsWith("seance:")) {
    const [,pi,ji] = innerView.split(":");
    const pIdx = parseInt(pi), jIdx = parseInt(ji);
    if (allProgs[pIdx] && allProgs[pIdx].jours[jIdx]) {
      seanceView = { pIdx, jIdx, prog: allProgs[pIdx] };
    }
  }

  const showCreerForm = isCreating || createStep > 0 || (newP.nom !== "" || newP.jours.length > 0);
  const resetCreating = () => { setIsCreating(false); setCS(0); setNewP({nom:"",jours:[],seances:{}}); };
  const creerProps = {
    ...props,
    onCancel: resetCreating,
    setProgView: (v) => { resetCreating(); if(v === "calendar") setProgView("calendar"); else setInnerView("list"); },
  };

  // ── Vue séance detail ──
  if (seanceView) {
    return (
      <SeanceDetailModal
        jour={seanceView.prog.jours[seanceView.jIdx]}
        jourIdx={seanceView.jIdx}
        prog={seanceView.prog}
        setProg={(u) => updateProgAtIdx(seanceView.pIdx, u)}
        onClose={() => setInnerView("list")}
        C={C} INT={INT}
      />
    );
  }

  // ── Messages de phase adaptés à l'objectif ──────────────────────────────
  const obj = profil?.objectif || "hypertrophie";

  const PHASE_MSG = {
    hypertrophie: {
      1: { titre: <>Installe la <span style={{color:"#34D399"}}>mécanique.</span></>, desc: "Volume modéré, 10–12 reps, RPE 6–7. Maîtrise chaque mouvement avant d'augmenter la charge." },
      2: { titre: <>Le volume <span style={{color:"#34D399"}}>augmente.</span></>, desc: "Charge progressive, 8–12 reps, RPE 7–8. C'est ici que l'hypertrophie se construit vraiment." },
      3: { titre: <>Tonnage en <span style={{color:"#34D399"}}>hausse de +8%.</span></>, desc: "3 séances par groupe, 6–10 reps, RPE 7–8. Charge progressive sur les composés." },
      4: { titre: <>Accumulation <span style={{color:"#F59E0B"}}>maximale.</span></>, desc: "Séries longues, 10–15 reps, pump recherché. Surcharge mécanique et métabolique." },
      5: { titre: <>Intensification. <span style={{color:"#F87171"}}>Charge lourde.</span></>, desc: "Passe à 6–8 reps avec plus de poids. Le stimulus de force favorise la densité musculaire." },
      6: { titre: <>Deload. <span style={{color:"#818CF8"}}>Récupère.</span></>, desc: "Volume réduit de 40%, intensité maintenue. Ton corps consolide les gains. Ne skip pas." },
    },
    force: {
      1: { titre: <>Construis <span style={{color:"#3B82F6"}}>tes bases.</span></>, desc: "Séries de 5 reps, RPE 7. Focus sur le squat, développé et soulevé de terre. Technique avant tout." },
      2: { titre: <>Progressions <span style={{color:"#3B82F6"}}>linéaires.</span></>, desc: "Ajoute 2,5–5kg à chaque séance sur les composés. C'est la phase la plus rentable du cycle." },
      3: { titre: <>Charge <span style={{color:"#818CF8"}}>lourde. 3×3–5.</span></>, desc: "Intensité à 85–90% de ton max. RPE 8–9. Vise tes records sur les mouvements fondamentaux." },
      4: { titre: <>Pic de <span style={{color:"#F87171"}}>force.</span></>, desc: "Doubles et simples à 90–95% de ton max. Repos complets 3–5 min. Prépare tes PRs." },
      5: { titre: <>Spécialisation. <span style={{color:"#F87171"}}>Vise les records.</span></>, desc: "Séances courtes et intenses. 1–3 reps lourdes. C'est la semaine pour battre tes records personnels." },
      6: { titre: <>Deload actif. <span style={{color:"#34D399"}}>Récupère fort.</span></>, desc: "50–60% du volume habituel. Maintiens l'intensité. Tu arrives frais et plus fort au prochain bloc." },
    },
    poids: {
      1: { titre: <>Déficit géré, <span style={{color:"#F59E0B"}}>muscle préservé.</span></>, desc: "Charge modérée, 10–15 reps. L'objectif est de maintenir le tissu musculaire en déficit calorique." },
      2: { titre: <>Métabolisme <span style={{color:"#F59E0B"}}>activé.</span></>, desc: "Circuit training et supersets. Dépense calorique maximisée tout en stimulant les muscles." },
      3: { titre: <>Densité <span style={{color:"#F59E0B"}}>d'effort.</span></>, desc: "Temps de repos courts, 8–12 reps. Maintiens le volume pour éviter la perte musculaire." },
      4: { titre: <>Intensification <span style={{color:"#F87171"}}>métabolique.</span></>, desc: "HIIT en fin de séance. Le muscle consomme du gras même au repos — construis-en." },
      5: { titre: <>Force. <span style={{color:"#F87171"}}>Le muscle brûle.</span></>, desc: "Séries lourdes, 5–8 reps. Plus de masse musculaire = métabolisme de base plus élevé." },
      6: { titre: <>Récupération. <span style={{color:"#34D399"}}>Bilan positif.</span></>, desc: "Volume léger. Ton corps recalibres ses hormones. Prépare le prochain bloc avec une meilleure composition." },
    },
    prep_physique: {
      1: { titre: <>Fondations <span style={{color:"#3B82F6"}}>athlétiques.</span></>, desc: "Gainage, mobilité et force de base. Un athlète solide part de la stabilité." },
      2: { titre: <>Puissance <span style={{color:"#3B82F6"}}>en construction.</span></>, desc: "Exercices explosifs intégrés. Pliométrie légère sur les membres inférieurs." },
      3: { titre: <>Endurance <span style={{color:"#818CF8"}}>de force.</span></>, desc: "Séries longues à haute densité. RPE 7–8 maintenu sur toute la séance. Conditioning." },
      4: { titre: <>Capacité de <span style={{color:"#F59E0B"}}>travail max.</span></>, desc: "Volume le plus élevé du cycle. Teste tes limites. C'est ici que l'athlète se forme." },
      5: { titre: <>Pics d'intensité. <span style={{color:"#F87171"}}>Explosivité.</span></>, desc: "Efforts courts et maximaux. Pliométrie avancée, sprints, charges explosives." },
      6: { titre: <>Récupération <span style={{color:"#34D399"}}>stratégique.</span></>, desc: "Mobilité, étirements, récupération active. Prépare ton corps pour surpasser le cycle précédent." },
    },
    sante: {
      1: { titre: <>Mouvement <span style={{color:"#34D399"}}>régulier.</span></>, desc: "3–4 séances par semaine, effort agréable, RPE 5–6. L'objectif est la régularité avant tout." },
      2: { titre: <>Progression <span style={{color:"#34D399"}}>douce.</span></>, desc: "Légère augmentation du volume. Le corps s'adapte à son rythme, sans se blesser." },
      3: { titre: <>Effort <span style={{color:"#3B82F6"}}>soutenu.</span></>, desc: "RPE 6–7. Tu dois pouvoir parler en séance. Construis l'habitude profondément." },
      4: { titre: <>Renforcement <span style={{color:"#3B82F6"}}>complet.</span></>, desc: "Travaille toutes les chaînes musculaires. Mobilité incluse. Équilibre le corps." },
      5: { titre: <>Intensité <span style={{color:"#F59E0B"}}>maîtrisée.</span></>, desc: "RPE 7–8 sur les séries principales. Tu sens la progression. Continue sur cette lancée." },
      6: { titre: <>Récupère, <span style={{color:"#34D399"}}>tu le mérites.</span></>, desc: "Volume réduit, étirements, marche active. La santé c'est aussi savoir se reposer." },
    },
  };

  const weekIdx    = Math.min(Math.max((semC||0)+1, 1), 6);
  const msgObj     = PHASE_MSG[obj]?.[weekIdx] || PHASE_MSG.hypertrophie[weekIdx];

  const PHASES_MESO = [
    { n:"S1", phase:"Volume",  int:"modere",  h:38 },
    { n:"S2", phase:"Volume",  int:"modere",  h:52 },
    { n:"S3", phase:"Volume",  int:"lourd",   h:68, active: (semC||0)===2 },
    { n:"S4", phase:"Force",   int:"lourd",   h:68, active: (semC||0)===3 },
    { n:"S5", phase:"Force",   int:"intense", h:58, active: (semC||0)===4 },
    { n:"S6", phase:"Deload",  int:"leger",   h:28, active: (semC||0)===5 },
  ];
  const totalW = 6;
  const week   = (semC||0)+1;
  const SERIF_F  = "'DM Serif Display','Georgia',serif";
  const DISP_F   = "'Outfit','DM Sans',system-ui,sans-serif";

  return (
    <div style={{padding:"0 15px"}}>

      {/* ── Hero header ── */}
      <div style={{paddingTop:6,marginBottom:16}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:C.blue,fontFamily:DISP_F,marginBottom:5}}>Programme</div>
        <div style={{fontFamily:SERIF_F,fontSize:28,color:C.text,lineHeight:1.1,letterSpacing:-1}}>
          Ton <span style={{fontStyle:"italic",color:C.blue}}>cycle</span>
        </div>
        <div style={{fontSize:11,color:"rgba(242,244,247,0.38)",marginTop:5,fontFamily:DISP_F}}>
          {prog ? "Mésocycle périodisé selon ta morphologie." : "Crée ton premier programme pour commencer."}
        </div>
      </div>

      {/* ── Mésocycle bars (si prog actif) ── */}
      {prog && cycleStart && (
        <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:16,padding:"14px",marginBottom:10,boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:"1.3px",textTransform:"uppercase",color:"#818CF8",fontFamily:DISP_F,marginBottom:4}}>Mésocycle · {prog.titre}</div>
              <div style={{fontSize:15,fontWeight:700,color:C.text,fontFamily:DISP_F}}>{totalW} semaines · {prog.jours?.map(j=>j.nom?.split(" ")[0]).slice(0,3).join(" / ") || "Programme"}</div>
            </div>
            <div style={{fontSize:13,fontWeight:700,color:"#818CF8",fontVariantNumeric:"tabular-nums",fontFamily:DISP_F}}>S{week}/{totalW}</div>
          </div>
          {/* Barres */}
          <div style={{display:"flex",gap:5,alignItems:"flex-end",height:90,marginBottom:10}}>
            {PHASES_MESO.map((s,i)=>{
              const intData = INT[s.int]||INT.modere;
              const isDone  = i < (semC||0);
              const isActive= i === (semC||0);
              return (
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{
                    width:"100%",height:s.h,borderRadius:7,
                    background: isActive
                      ? `linear-gradient(180deg,${intData.c},${intData.c}99)`
                      : isDone
                        ? `${intData.c}45`
                        : "rgba(255,255,255,0.05)",
                    border: isActive ? `1.5px solid ${intData.c}` : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: isActive ? `0 4px 14px ${intData.c}45` : "none",
                    position:"relative",overflow:"hidden",
                  }}>
                    {isActive&&<div style={{position:"absolute",inset:0,background:"radial-gradient(120% 50% at 50% 0%,rgba(255,255,255,0.18),transparent 60%)"}}/>}
                  </div>
                  <div style={{fontSize:9,fontWeight:700,color:isActive?intData.c:"rgba(242,244,247,0.35)",fontFamily:DISP_F,letterSpacing:0.3}}>{s.n}</div>
                  <div style={{fontSize:7.5,color:isActive?"rgba(242,244,247,0.55)":"rgba(242,244,247,0.25)",fontFamily:DISP_F,textAlign:"center"}}>{s.phase}</div>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:10,borderTop:`1px solid ${C.bd}`}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:8,height:8,borderRadius:2,background:"#818CF8"}}/>
              <span style={{fontSize:10,color:"rgba(242,244,247,0.45)",fontFamily:DISP_F}}>Intensité prévue</span>
            </div>
            <div style={{display:"flex",gap:14}}>
              {[
                {v:`${prog.jours?.length||0}/sem`, u:"rythme", c:C.blue},
                {v:`J${jR??"—"}`, u:"prochain", c:C.mint},
                {v:`${Math.round(week/totalW*100)}%`, u:"cycle", c:"#818CF8"},
              ].map(s=>(
                <div key={s.u} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{fontSize:13,fontWeight:700,color:s.c,fontFamily:DISP_F,fontVariantNumeric:"tabular-nums"}}>{s.v}</div>
                  <div style={{fontSize:8,fontWeight:700,color:"rgba(242,244,247,0.35)",letterSpacing:1.2,textTransform:"uppercase",fontFamily:DISP_F}}>{s.u}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Phase active ── */}
      {prog && cycleStart && (
        <div style={{background:"linear-gradient(135deg,#0a1628,#0f172a)",border:"1px solid rgba(59,130,246,0.18)",borderRadius:18,padding:"16px",marginBottom:14,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",background:"rgba(59,130,246,0.08)",pointerEvents:"none"}}/>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:C.blue,boxShadow:`0 0 8px ${C.blue}`}}/>
            <div style={{fontSize:8.5,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"#60a5fa",fontFamily:DISP_F}}>Phase active · Semaine {week}</div>
          </div>
          <div style={{fontFamily:SERIF_F,fontSize:18,color:C.text,lineHeight:1.25,marginBottom:6}}>
            {msgObj.titre}
          </div>
          <div style={{fontSize:11,color:"rgba(242,244,247,0.42)",lineHeight:1.55,fontFamily:DISP_F}}>
            {msgObj.desc}
          </div>
        </div>
      )}

      {/* ── Modal confirmation suppression ── */}      {/* ── Modal confirmation suppression ── */}
      {confirmDel && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,26,46,0.45)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:C.s1,borderRadius:16,padding:"22px 20px",width:"100%",maxWidth:340,boxShadow:"0 8px 32px rgba(0,0,0,0.12)"}}>
            <div style={{fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",fontSize:16,fontWeight:500,marginBottom:8,color:"#F2F4F7"}}>
              {confirmDel.type==="prog" ? "Supprimer ce programme ?" : "Supprimer cette séance ?"}
            </div>
            <div style={{fontSize:12,color:"rgba(242,244,247,0.50)",marginBottom:20,lineHeight:1.5}}>
              {confirmDel.type==="prog"
                ? "Toutes les séances de ce programme seront perdues. Cette action est irréversible."
                : "La séance et tous ses exercices seront supprimés définitivement."}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={() => setConfirmDel(null)} style={{flex:1,padding:"10px",background:C.s2,border:"none",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:500,color:"rgba(242,244,247,0.50)",fontFamily:"'Inter',sans-serif"}}>Annuler</button>
              <button onClick={() => confirmDel.type==="prog" ? deleteProgAtIdx(confirmDel.pIdx) : deleteJourAtIdx(confirmDel.pIdx, confirmDel.jIdx)} style={{flex:1,padding:"10px",background:"#FF7A6B",border:"none",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:600,color:"#141A2E",fontFamily:"'Inter',sans-serif"}}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Séances de la semaine ── */}
      {prog && prog.jours && prog.jours.length > 0 && (
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{fontSize:17,fontWeight:700,color:C.text,fontFamily:DISP_F,letterSpacing:-0.4}}>Semaine {week} · Split</div>
            <div style={{fontSize:9,fontWeight:700,color:C.blue,letterSpacing:"1.2px",textTransform:"uppercase",fontFamily:DISP_F}}>
              {prog.jours.length} séances
            </div>
          </div>
          <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:18,overflow:"hidden"}}>
            {prog.jours.map((j, jIdx) => {
              const int   = INT[j.intensite || "modere"];
              const total = j.exercices?.length || 0;
              const done  = j.exercices?.filter((_,idx) => checkedEx[`${j.id}-${idx}`]).length || 0;
              const isFirst = jIdx===0;
              return (
                <div key={jIdx} style={{
                  display:"flex",alignItems:"center",gap:12,padding:"14px 16px",
                  borderBottom: jIdx<prog.jours.length-1 ? `1px solid ${C.bd}` : "none",
                }}>
                  {/* Icône */}
                  <div style={{
                    width:36,height:36,borderRadius:11,flexShrink:0,display:"grid",placeItems:"center",
                    background: j.complete ? `${int.c}18` : isFirst ? `${int.c}15` : "rgba(255,255,255,0.04)",
                    border: j.complete ? `1px solid ${int.c}35` : isFirst ? `1px solid ${int.c}30` : `1px solid ${C.bd}`,
                  }}>
                    {j.complete
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={int.c} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                      : <div style={{width:8,height:8,borderRadius:"50%",background:isFirst?int.c:"rgba(255,255,255,0.15)"}}/>}
                  </div>
                  {/* Info */}
                  <div onClick={() => setInnerView(`seance:0:${jIdx}`)} style={{flex:1,minWidth:0,cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                      <span style={{fontSize:14,fontWeight:700,color:j.complete?"rgba(242,244,247,0.40)":C.text,fontFamily:DISP_F,letterSpacing:-0.2}}>{j.nom}</span>
                      {j.complete && <span style={{fontSize:8,fontWeight:700,color:"rgba(242,244,247,0.30)",letterSpacing:"0.8px",fontFamily:DISP_F}}>FAIT</span>}
                    </div>
                    <div style={{fontSize:9.5,fontWeight:700,color:int.c,letterSpacing:"0.8px",textTransform:"uppercase",fontFamily:DISP_F}}>
                      {int.l}{j.focus?` · ${j.focus}`:""} · {total} ex.
                    </div>
                  </div>
                  {/* Droite */}
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0}}>
                    {done>0 && <div style={{fontSize:11,fontWeight:700,color:int.c,fontVariantNumeric:"tabular-nums"}}>{done}/{total}</div>}
                    <button onClick={() => setConfirmDel({type:"jour",pIdx:0,jIdx})} style={{padding:"5px 8px",background:"rgba(248,113,113,0.07)",border:"1px solid rgba(248,113,113,0.18)",borderRadius:8,color:"#FF7A6B",cursor:"pointer",fontSize:11,lineHeight:1}}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Liste des autres programmes ── */}
      {allProgs.length > 1 && (
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:"1.3px",textTransform:"uppercase",color:C.blue,fontFamily:DISP_F,marginBottom:10}}>Autres programmes</div>
          {allProgs.map((p, pIdx) => {
            const isActive = prog && (prog.titre === p.titre || prog.id === p.id);
            if (isActive) return null;
            return (
              <div key={pIdx} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.s1,border:`1px solid ${C.bd}`,borderRadius:12,marginBottom:6}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text,fontFamily:DISP_F}}>{p.titre}</div>
                  <div style={{fontSize:10.5,color:"rgba(242,244,247,0.40)",marginTop:1}}>{p.jours?.length||0} séances</div>
                </div>
                <button onClick={() => { setProg(p); push("✅","Programme activé",p.titre); }} style={{padding:"6px 10px",background:"rgba(52,211,153,0.10)",border:"1px solid rgba(52,211,153,0.25)",borderRadius:8,color:"#34D399",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:DISP_F}}>Activer</button>
                <button onClick={() => setConfirmDel({type:"prog",pIdx})} style={{padding:"6px 8px",background:"rgba(248,113,113,0.07)",border:"1px solid rgba(248,113,113,0.18)",borderRadius:8,color:"#FF7A6B",cursor:"pointer",fontSize:11}}>🗑</button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Empty state ── */}
      {allProgs.length === 0 && !showCreerForm && (
        <div style={{textAlign:"center",padding:"32px 0 16px"}}>
          <div style={{fontSize:40,marginBottom:14}}>🏋️</div>
          <div style={{fontFamily:SERIF_F,fontSize:22,fontWeight:400,color:C.text,marginBottom:8}}>Aucun programme</div>
          <div style={{fontSize:12,color:"rgba(242,244,247,0.45)",lineHeight:1.6,maxWidth:240,margin:"0 auto 24px",fontFamily:DISP_F}}>Génère un programme IA adapté à ta morphologie ou crée-le manuellement.</div>
        </div>
      )}

      {/* ── CTAs ── */}
      {!showCreerForm && (
        <div style={{marginBottom:12}}>
          <Btn onClick={() => { if(!premium) setPaywall(true); else setProgView("analyse"); }}>✨ Nouveau programme IA</Btn>
          <Btn v="out" onClick={() => { setIsCreating(true); setCS(0); setNewP({nom:"",jours:[],seances:{}}); }}>+ Créer manuellement</Btn>
        </div>
      )}

      {/* ── Formulaire de création ── */}
      {showCreerForm && (
        <Creer {...creerProps} progs={allProgs} setProgsAll={(next) => { setProgs(next); if(next.length>0) setProg(next[next.length-1]); }} />
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
