import { catColor } from "../../utils/training.js";
import { useState } from "react";
import { C, DARK, FONT } from "../../data/constants.js";
import Creer from "./Creer.jsx";
import { SeanceDetailModal } from "./components/ProgramTabModals.jsx";
import CoachWeekCard from "./components/CoachWeekCard.jsx";
import MesocycleChart from "./components/MesocycleChart.jsx";
import MesocycleDetail from "./components/MesocycleDetail.jsx";

export default function ProgrammeView(props) {
  const { prog, setProg, progs, setProgs, premium, setPaywall, push, calSess, setCalSess, checkedEx, createStep, setCS, newP, setNewP, jourActif, setJourActif, groupe, setGroupe, editExIdx, setEditExIdx, exModal, setExModal, exModalTab, setExModalTab, INT, EX, setProgView, cycleStart, setCycleStart, semC, jR, profil } = props;

  // vue interne : "creer" uniquement (seance detail → overlay fixe via selectedJour)
  const [innerView,    setInnerView]    = useState("list");  // gardé pour compatibilité Creer
  const [selectedJour, setSelectedJour] = useState(null);    // {jIdx} → ouvre SeanceDetailModal en overlay
  const [confirmDel, setConfirmDel] = useState(null); // {type:"prog"|"jour", progIdx, jourIdx}
  const [isCreating, setIsCreating] = useState(false);
  const [openJour,   setOpenJour]   = useState(null);
  const [showAnalyse, setShowAnalyse] = useState(false);  // overlay analyse de charge (depuis carte Coach IA)

  // ── Valeurs mésocycle pour l'overlay analyse (depuis le bouton Coach IA) ──
  const anaCurrentWeek = Math.min((semC||0), 5);
  const anaWEEKS = [
    {lbl:"S1", type:"Base",   m:1.00},{lbl:"S2", type:"Vol+",   m:1.10},
    {lbl:"S3", type:"Vol+",   m:1.20},{lbl:"S4", type:"Vol+",   m:1.30},
    {lbl:"S5", type:"Déload", m:0.70},{lbl:"S6", type:"Pic",    m:1.40},
  ];
  const anaBaseVol = (prog?.jours||[]).reduce((a,j) =>
    a + (j.exercices||[]).reduce((b,ex) => b + (parseInt(ex.series)||4), 0), 0);
  const anaMEV = Math.round(anaBaseVol*0.65);
  const anaMAV = anaBaseVol;
  const anaMRV = Math.round(anaBaseVol*1.35);
  const anaCurVol = Math.round(anaBaseVol * anaWEEKS[anaCurrentWeek].m);

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
  const SERIF_F  = FONT;
  const DISP_F   = FONT;
  const semN     = (semC||0)+1;
  const cc = catColor;
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
    <div style={{padding:"0 20px"}}>

      {/* ── Confirm delete modal ── */}
      {confirmDel && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,25,35,0.5)",zIndex:340,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:C.s1,borderRadius:16,padding:"24px 20px",width:"100%",maxWidth:340}}>
            <div style={{fontFamily:DISP_F,fontSize:16,fontWeight:500,marginBottom:8,color:C.text}}>
              {confirmDel.type==="prog" ? "Supprimer ce programme ?" : "Supprimer cette séance ?"}
            </div>
            <div style={{fontSize:13,color:C.mid,marginBottom:20,lineHeight:1.5}}>
              {confirmDel.type==="prog"
                ? "Toutes les séances seront perdues. Cette action est irréversible."
                : "La séance et tous ses exercices seront supprimés définitivement."}
            </div>
            <div style={{display:"flex",gap:12}}>
              <button onClick={()=>setConfirmDel(null)} style={{flex:1,padding:"12px",background:C.s2,border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500,color:C.mid,fontFamily:DISP_F}}>Annuler</button>
              <button onClick={()=>confirmDel.type==="prog" ? deleteProgAtIdx(confirmDel.pIdx) : deleteJourAtIdx(confirmDel.pIdx, confirmDel.jIdx)} style={{flex:1,padding:"12px",background:"#FF7A6B",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,color:DARK.surface,fontFamily:DISP_F}}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ marginBottom:16, display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontFamily:SERIF_F, fontSize:26, color:C.text, lineHeight:1.1, letterSpacing:-1 }}>
            Ton <span style={{ fontStyle:"italic", color:C.blue }}>programme</span>
          </div>
        </div>
        {prog && (
          <button onClick={()=>setConfirmDel({type:"prog",pIdx:progIdx})}
            style={{ padding:"8px 12px", borderRadius:12, background:C.s1,
              border:`1px solid ${C.bd}`, display:"flex", alignItems:"center", gap:8,
              cursor:"pointer", flexShrink:0, marginTop:4,
              boxShadow: C.shadow }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.dim}
              strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/>
            </svg>
            <span style={{ fontSize:13, fontWeight:600, color:C.dim, fontFamily:DISP_F }}>Éditer</span>
          </button>
        )}
      </div>


      {/* ── Overlay Analyse de charge (depuis carte Coach IA) ── */}
      {showAnalyse && (
        <MesocycleDetail
          mode="analyse"
          prog={prog} semC={semC}
          baseVol={anaBaseVol} MEV={anaMEV} MAV={anaMAV} MRV={anaMRV} curVol={anaCurVol}
          currentWeek={anaCurrentWeek} WEEKS={anaWEEKS}
          cycleStart={cycleStart} checkedEx={checkedEx}
          onClose={()=>setShowAnalyse(false)}
        />
      )}

      {/* ── Hero Card premium — entre les 2 blocs, visible sans programme ── */}
      {!prog && !showCreerForm && (() => {
        const F2 = "'General Sans',system-ui,-apple-system,sans-serif";
        const days = ["L","M","M","J","V","S","D"];
        const doneD = [false,false,false,false,false,false,false];
        const scoreR = 87; const R2=18,cx2=21,cy2=21;
        const circ2 = 2*Math.PI*R2;
        const dash2 = (scoreR/100)*circ2;
        return (
          <div style={{borderRadius:28,overflow:"hidden",position:"relative",
            background:"linear-gradient(140deg,#04001C 0%,#080528 30%,#0B0E40 65%,#060A30 100%)",
            boxShadow:"0 20px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(139,92,246,0.18)"}}>

            {/* Glows */}
            <div style={{position:"absolute",top:-60,left:-30,width:200,height:200,borderRadius:"50%",
              background:"radial-gradient(circle,rgba(109,40,217,0.25),transparent 65%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",bottom:-40,right:50,width:180,height:180,borderRadius:"50%",
              background:"radial-gradient(circle,rgba(59,130,246,0.18),transparent 65%)",pointerEvents:"none"}}/>

            {/* Grille abstraite */}
            <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",
              opacity:0.05,pointerEvents:"none"}} viewBox="0 0 380 240" preserveAspectRatio="xMidYMid slice">
              {[0,1,2,3,4,5,6].map(i=><line key={`h${i}`} x1="0" y1={i*40} x2="380" y2={i*40} stroke="#818CF8" strokeWidth="0.6"/>)}
              {[0,1,2,3,4,5,6,7,8,9,10].map(i=><line key={`v${i}`} x1={i*38} y1="0" x2={i*38} y2="240" stroke="#818CF8" strokeWidth="0.6"/>)}
            </svg>

            {/* Ligne lumineuse top */}
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,
              background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.65),rgba(139,92,246,0.65),transparent)",
              pointerEvents:"none"}}/>

            {/* Particules */}
            {[[18,25,"#8B5CF6"],[220,16,DARK.accent],[170,140,"#A78BFA"],[45,125,"#6366F1"]].map(([x,y,c],i)=>(
              <div key={i} style={{position:"absolute",left:x,top:y,width:2.5,height:2.5,borderRadius:"50%",
                background:c,boxShadow:`0 0 7px ${c}`,opacity:0.75,pointerEvents:"none"}}/>
            ))}

            {/* Layout gauche + droite */}
            <div style={{display:"flex",alignItems:"flex-start",padding:"20px 16px 20px 20px",gap:12,position:"relative",zIndex:1}}>

              {/* ── Gauche ── */}
              <div style={{flex:1,minWidth:0}}>
                {/* Badge */}
                <div style={{display:"inline-flex",alignItems:"center",gap:4,
                  padding:"4px 12px",borderRadius:28,marginBottom:12,
                  background:"linear-gradient(135deg,rgba(109,40,217,0.25),rgba(99,102,241,0.18))",
                  border:"1px solid rgba(139,92,246,0.35)",backdropFilter:"blur(6px)"}}>
                  <span style={{fontSize:10}}>🚀</span>
                  <span style={{fontSize:10,fontWeight:700,color:"#C4B5FD",fontFamily:F2,letterSpacing:"0.1em"}}>PRO · IA Coach</span>
                  <div style={{width:3.5,height:3.5,borderRadius:"50%",background:"#8B5CF6",boxShadow:"0 0 5px #8B5CF6"}}/>
                </div>

                {/* Titre */}
                <div style={{fontSize:20,fontWeight:700,color:"#FFF",fontFamily:F2,
                  lineHeight:1.2,letterSpacing:-0.5,marginBottom:8}}>
                  <span style={{
                    background:"linear-gradient(90deg,#FFF,#E0E7FF)",
                    WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
                    Ton coach IA
                  </span>
                  <br/>t'attend. 🧠
                </div>

                {/* CTA 1 — CRÉER PROGRAMME (bleu plein, principal) */}
                <button onClick={()=>{ setIsCreating(true); setCS(0); setNewP({nom:"",jours:[],seances:{}}); }}
                  style={{width:"100%",padding:"16px 12px",borderRadius:16,border:"none",cursor:"pointer",
                    background:"linear-gradient(135deg,#2563EB,#3B82F6)",
                    color:"#FFF",fontSize:16,fontWeight:700,fontFamily:F2,
                    boxShadow:"0 8px 24px rgba(59,130,246,0.5),0 0 0 1px rgba(96,165,250,0.25)",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                    letterSpacing:-0.2,marginBottom:12}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFF" stroke="none">
                    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>
                  </svg>
                  Créer mon programme
                </button>

                {/* CTA 2 — PARLER À UN COACH (transparent, secondaire) */}
                <button onClick={()=>{ if(!premium) setPaywall(true); else setProgView("analyse"); }}
                  style={{width:"100%",padding:"16px 12px",borderRadius:16,cursor:"pointer",
                    background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.18)",
                    color:"rgba(255,255,255,0.85)",fontSize:16,fontWeight:700,fontFamily:F2,
                    display:"flex",alignItems:"center",justifyContent:"center",gap:8,letterSpacing:-0.2,
                    backdropFilter:"blur(6px)"}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Parler à un coach
                </button>
              </div>

              {/* ── Droite : Phone miniature ── */}
              <div style={{position:"relative",flexShrink:0,
                transform:"rotate(6deg) translateY(-8px)",transformOrigin:"center bottom"}}>
                {/* Glow */}
                <div style={{position:"absolute",top:-20,left:-18,right:-18,bottom:-12,zIndex:0,pointerEvents:"none",
                  background:"radial-gradient(ellipse at 50% 55%,rgba(139,92,246,0.5),rgba(59,130,246,0.18),transparent 68%)",
                  filter:"blur(16px)"}}/>
                {/* Phone */}
                <div style={{position:"relative",zIndex:1,width:118,borderRadius:20,
                  background:"linear-gradient(165deg,#0D0B2E,#0E1245,#0A1650)",
                  border:"1.5px solid rgba(139,92,246,0.5)",
                  boxShadow:"0 18px 55px rgba(0,0,0,0.65),0 0 0 1px rgba(255,255,255,0.05),inset 0 1px 0 rgba(255,255,255,0.08)",
                  overflow:"hidden",padding:"8px 8px 12px"}}>
                  {/* Reflet */}
                  <div style={{position:"absolute",top:0,left:0,right:0,height:48,
                    background:"linear-gradient(180deg,rgba(255,255,255,0.08),transparent)",
                    pointerEvents:"none",zIndex:2}}/>
                  {/* Notch */}
                  <div style={{width:36,height:5,borderRadius:3,background:"rgba(15,25,35,0.5)",margin:"0 auto 8px"}}/>
                  {/* Header */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:8,fontWeight:700,color:"#FFF",fontFamily:F2}}>MorphoCoach</span>
                    <div style={{display:"flex",alignItems:"center",gap:4,padding:"1px 4px",borderRadius:8,
                      background:"linear-gradient(135deg,rgba(139,92,246,0.25),rgba(99,102,241,0.18))",
                      border:"1px solid rgba(139,92,246,0.5)"}}>
                      <div style={{width:3,height:3,borderRadius:"50%",background:"#A78BFA",boxShadow:"0 0 4px #8B5CF6"}}/>
                      <span style={{fontSize:6,fontWeight:700,color:"#C4B5FD",fontFamily:F2,letterSpacing:"0.1em"}}>IA</span>
                    </div>
                  </div>
                  {/* Recovery ring */}
                  <div style={{display:"flex",alignItems:"center",gap:8,borderRadius:12,padding:"8px 8px",
                    marginBottom:8,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
                    <svg width="42" height="42" viewBox="0 0 42 42" style={{flexShrink:0}}>
                      <circle cx={cx2} cy={cy2} r={R2} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4.5"/>
                      <circle cx={cx2} cy={cy2} r={R2} fill="none" stroke="url(#mcHeroRG)" strokeWidth="4.5"
                        strokeDasharray={`${dash2} ${circ2}`} strokeLinecap="round"
                        transform={`rotate(-90 ${cx2} ${cy2})`}/>
                      <defs>
                        <linearGradient id="mcHeroRG" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6EE7B7"/><stop offset="100%" stopColor={C.accent}/>
                        </linearGradient>
                      </defs>
                      <text x={cx2} y={cy2+0.5} textAnchor="middle" dominantBaseline="middle"
                        fontSize="9.5" fontWeight="700" fill="#FFF" fontFamily={F2}>{scoreR}</text>
                      <text x={cx2} y={cy2+8} textAnchor="middle" dominantBaseline="middle"
                        fontSize="4.5" fill="rgba(255,255,255,0.35)" fontFamily={F2}>RÉCUP.</text>
                    </svg>
                    <div>
                      <div style={{fontSize:7.5,fontWeight:700,color:"#6EE7B7",fontFamily:F2,marginBottom:2}}>Prêt à performer</div>
                      <div style={{fontSize:6.5,color:"rgba(255,255,255,0.35)",fontFamily:F2,lineHeight:1.5}}>Programme IA<br/>généré ✓</div>
                    </div>
                  </div>
                  {/* Days */}
                  <div style={{display:"flex",gap:4,marginBottom:8}}>
                    {days.map((d,i)=>(
                      <div key={i} style={{flex:1,textAlign:"center"}}>
                        <div style={{fontSize:5.5,color:doneD[i]?"#A78BFA":"rgba(255,255,255,0.25)",
                          fontFamily:F2,fontWeight:600,marginBottom:2}}>{d}</div>
                        <div style={{height:14,borderRadius:3,display:"grid",placeItems:"center",
                          background:i===0?"linear-gradient(135deg,#7C3AED,#4F46E5)"
                            :"rgba(255,255,255,0.08)",
                          border:i===0?"1px solid rgba(139,92,246,0.65)":"none"}}>
                          {i===0&&<span style={{fontSize:5,color:"#FFF"}}>▸</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Séance preview */}
                  <div style={{borderRadius:8,padding:"8px 8px",marginBottom:4,
                    background:"linear-gradient(135deg,rgba(139,92,246,0.18),rgba(99,102,241,0.12))",
                    border:"1px solid rgba(139,92,246,0.25)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:6,fontWeight:700,color:"#A78BFA",fontFamily:F2,
                        letterSpacing:"0.1em",textTransform:"uppercase"}}>Lundi · Prochain</span>
                      <span style={{fontSize:6,fontWeight:700,color:"rgba(255,255,255,0.35)",fontFamily:F2}}>45min</span>
                    </div>
                    <div style={{fontSize:8,fontWeight:700,color:"#FFF",fontFamily:F2,marginBottom:4}}>Push · Hypertrophie</div>
                    {[{n:"Développé couché",s:"4×8"},{n:"Dips lestés",s:"3×10"}].map((ex,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",
                        borderTop:i===0?"1px solid rgba(255,255,255,0.05)":"none",paddingTop:i===0?3:2}}>
                        <span style={{fontSize:5.5,color:"rgba(255,255,255,0.5)",fontFamily:F2}}>{ex.n}</span>
                        <span style={{fontSize:5.5,fontWeight:700,color:"rgba(255,255,255,0.35)",fontFamily:F2}}>{ex.s}</span>
                      </div>
                    ))}
                  </div>
                  {/* Métriques mini */}
                  {[{l:"Fatigue",v:"Basse",c:"#6EE7B7",b:0.22},{l:"Risque",v:"Faible",c:"#C4B5FD",b:0.15}].map((m,i)=>(
                    <div key={i} style={{borderRadius:8,padding:"4px 8px",marginBottom:i===0?3:0,
                      background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.05)",
                      display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:6,color:"rgba(255,255,255,0.35)",fontFamily:F2,flex:1}}>{m.l}</span>
                      <div style={{width:24,height:2.5,borderRadius:2,background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
                        <div style={{width:`${m.b*100}%`,height:"100%",borderRadius:2,background:m.c}}/>
                      </div>
                      <span style={{fontSize:6,fontWeight:700,color:m.c,fontFamily:F2}}>{m.v}</span>
                    </div>
                  ))}
                  <div style={{height:2,borderRadius:1,background:"rgba(255,255,255,0.12)",margin:"8px 20px 0"}}/>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Programme actif ── */}
      {prog && prog.jours?.length > 0 && (<>

        {/* Label section */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ fontSize:16, fontWeight:700, color:C.text, fontFamily:DISP_F }}>Programme</div>
          <div style={{ fontSize:13, fontWeight:500, color:C.dim, fontFamily:DISP_F }}>
            {prog?.jours?.length||0} séance{(prog?.jours?.length||0)!==1?"s":""} · Sem. {semN}
          </div>
        </div>

        {/* Séances accordion */}
        {prog.jours.map((j, jIdx) => {
          const int    = INT[j.intensite||"modere"];
          const dur    = durOf(j);
          const isOpen = openJour===jIdx;
          const exos   = j.exercices||[];
          // Status dynamique basé sur semC
          const jDone = jIdx < (semC||0);
          const jNext = jIdx === (semC||0);
          const status     = jDone ? "FAIT"     : jNext ? "PROCHAIN"  : "PLANIFIÉ";
          const statusColor = jDone ? C.green   : jNext ? C.blue      : C.dim;
          const statusBg    = jDone ? `${C.green}18` : jNext ? `${C.blue}14` : "rgba(107,114,128,0.08)";
          return (
            <div key={jIdx} style={{
              background:C.s1, border:`1px solid ${C.bd}`,
              borderRadius:20, marginBottom:12, overflow:"hidden",
              boxShadow: C.shadow,
            }}>
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 16px",cursor:"pointer"}}
                onClick={()=>setOpenJour(isOpen?null:jIdx)}>
                {/* Badge jour */}
                <div style={{width:48,height:48,borderRadius:16,background:int.c,color:"#FFF",
                  display:"grid",placeItems:"center",flexShrink:0,fontFamily:DISP_F,fontSize:13,fontWeight:700,
                  boxShadow:`0 4px 14px ${int.c}55`}}>
                  {j.focus||j.nom?.slice(0,3)||"—"}
                </div>
                {/* Infos */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.text,letterSpacing:-0.2,fontFamily:DISP_F}}>{j.nom}</div>
                  <div style={{fontSize:11,color:C.mid,marginTop:4,fontFamily:DISP_F}}>
                    {int.l} · {exos.length} exercice{exos.length!==1?"s":""}{dur?` · ~${dur}min`:""}
                  </div>
                </div>
                {/* Badge statut */}
                <div style={{padding:"4px 12px",borderRadius:8,background:statusBg,flexShrink:0}}>
                  <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",
                    color:statusColor,fontFamily:DISP_F}}>{status}</span>
                </div>
              </div>
              {isOpen && (
                <div style={{borderTop:`1px solid ${C.bd}`,padding:"8px 16px 16px"}}>
                  {/* Bouton éditer séance */}
                  <button onClick={e=>{e.stopPropagation();setSelectedJour({jIdx});}}
                    style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",
                      background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.18)",
                      borderRadius:12,cursor:"pointer",marginBottom:12,color:DARK.accent,
                      fontSize:13,fontWeight:600,fontFamily:DISP_F}}>
                    <span>✏️</span> Modifier la séance
                  </button>
                  {exos.length===0
                    ? <div style={{textAlign:"center",padding:"12px 0",fontSize:11,color:C.dim,fontFamily:DISP_F}}>Aucun exercice — tape Modifier pour en ajouter</div>
                    : exos.map((ex,k) => (
                      <div key={k} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"8px 0",borderBottom:k<exos.length-1?"1px solid rgba(0,0,0,0.05)":"none"}}>
                        <div style={{width:30,height:30,borderRadius:8,background:`${cc(ex.cat)}20`,border:`1px solid ${cc(ex.cat)}35`,color:cc(ex.cat),display:"grid",placeItems:"center",fontFamily:DISP_F,fontSize:11,fontWeight:700,flexShrink:0}}>{k+1}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:DISP_F,letterSpacing:-0.2}}>{ex.nom}</div>
                          <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:C.dim,textTransform:"uppercase",fontFamily:DISP_F,marginTop:2}}>{ex.cat||"Principal"}</div>
                        </div>
                        <div style={{fontSize:13,fontWeight:600,color:C.mid,fontFamily:DISP_F,flexShrink:0,marginTop:2,textAlign:"right",whiteSpace:"nowrap"}}>
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

        {/* CTAs supprimés — remplacés par la carte coach entre les 2 hero blocs */}

      </>)}


      {/* ── Bilan semaine (Ta semaine est prête) ── */}
      <div style={{marginTop:20}}>
      <CoachWeekCard
        semC={semC}
        semN={semN}
        totalJours={prog?.jours?.length||0}
        onDetail={()=>setShowAnalyse(true)}
        premium={premium}
        onUnlock={()=>setPaywall(true)}
      />
      </div>

      {/* ── Charge progressive — toujours visible ── */}
      <div style={{fontSize:20,fontWeight:700,color:C.text,fontFamily:DISP_F,marginTop:20,marginBottom:12,letterSpacing:-0.3}}>
        Charge <span style={{fontStyle:"italic",color:C.accent}}>progressive</span>
      </div>
      <MesocycleChart prog={prog} semC={semC} checkedEx={checkedEx} cycleStart={cycleStart}/>

      {/* ── Autres programmes ── */}
      {allProgs.length > 1 && (
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.blue,fontFamily:DISP_F,marginBottom:12}}>Autres programmes</div>
          {allProgs.map((p, pIdx) => {
            const isActive = prog && (prog.titre === p.titre || prog.id === p.id);
            if (isActive) return null;
            return (
              <div key={pIdx} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 12px",background:C.s1,border:`1px solid ${C.bd}`,borderRadius:12,marginBottom:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text,fontFamily:DISP_F}}>{p.titre}</div>
                  <div style={{fontSize:11,color:C.mid,marginTop:1}}>{p.jours?.length||0} séances</div>
                </div>
                <button onClick={()=>{setProg(p);push("✅","Programme activé",p.titre);}} style={{padding:"8px 12px",background:"rgba(52,211,153,0.12)",border:"1px solid rgba(52,211,153,0.25)",borderRadius:8,color:"#34D399",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:DISP_F}}>Activer</button>
                <button onClick={()=>setConfirmDel({type:"prog",pIdx})} style={{padding:"8px 8px",background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.18)",borderRadius:8,color:"#FF7A6B",cursor:"pointer",fontSize:11}}>🗑</button>
              </div>
            );
          })}
        </div>
      )}

      {showCreerForm && (
        <Creer {...creerProps} progs={allProgs} setProgsAll={(next)=>{ setProgs(next); if(next.length>0) setProg(next[next.length-1]); }}/>
      )}

      {/* ── SeanceDetailModal en overlay fixe ── */}
      {selectedJour !== null && prog?.jours?.[selectedJour.jIdx] && (
        <div style={{position:"fixed",inset:0,zIndex:320,background:C.bg,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
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

