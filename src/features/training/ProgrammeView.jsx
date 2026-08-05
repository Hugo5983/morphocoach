import { I } from"../../components/ui/Icon.jsx";
import { dureeSeance } from"../../utils/training.js";
import useScrollTop from"../../hooks/useScrollTop.js";
import { useState } from"react";
import { C, DARK } from"../../data/constants.js";
import Creer from"./Creer.jsx";
import { SeanceDetailModal } from"./components/ProgramTabModals.jsx";
import CoachWeekCard from"./components/CoachWeekCard.jsx";
import MesocycleDetail from"./components/MesocycleDetail.jsx";
import RaisonnementCoach from"./components/RaisonnementCoach.jsx";
import MobilitePage from"./components/MobilitePage.jsx";
import { getFicheMorpho } from"../../services/morphoService.js";
import { resumeSemaine, periodisationActive } from"../../services/periodisationService.js";

export default function ProgrammeView(props) {
  useScrollTop();
  const { prog, setProg, progs, setProgs, premium, setPaywall, push, calSess, setCalSess, createStep, setCS, newP, setNewP, jourActif, setJourActif, groupe, setGroupe, editExIdx, setEditExIdx, exModal, setExModal, exModalTab, setExModalTab, INT, setProgView, semC, jR, profil } = props;

  // vue interne :"creer" uniquement (seance detail → overlay fixe via selectedJour)
  const [innerView,    setInnerView]    = useState("list");  // gardé pour compatibilité Creer
  const [selectedJour, setSelectedJour] = useState(null);    // {jIdx} → ouvre SeanceDetailModal en overlay
  const [confirmDel, setConfirmDel] = useState(null); // {type:"prog"|"jour", progIdx, jourIdx}
  const [showMeso, setShowMeso] = useState(false);
  const [showRaison, setShowRaison] = useState(false);
  const [showMobilite, setShowMobilite] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Durée totale du mésocycle : 6 semaines (Base · Vol+ ×3 · Déload · Pic),
  // même modèle que le reste de l'app — affichée dans le hero du programme.
  const TOTAL_SEMAINES = 6;

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
    push("","Programme supprimé","Le programme et ses séances ont été retirés du calendrier.");
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
    push("","Séance supprimée","La séance a été retirée du programme et du calendrier.");
  };

  const showCreerForm = isCreating || createStep > 0 || (newP.nom !=="" || newP.jours.length > 0);
  const resetCreating = () => { setIsCreating(false); setCS(0); setNewP({nom:"",jours:[],seances:{}}); };
  const creerProps = {
    ...props,
    onCancel: resetCreating,
    setProgView: (v) => { resetCreating(); if(v ==="calendar") setProgView("calendar"); else setInnerView("list"); },
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const SERIF_F  ="'Archivo',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
  const DISP_F   ="'Archivo',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
  const semN     = (semC||0)+1;
  const progIdx = Math.max(0, allProgs.findIndex(p => prog && (p.id===prog.id || p.titre===prog.titre)));
  const durOf = dureeSeance;

  // ── Mobilité : page pleine (même pattern que les autres) ──
  if (showMobilite) {
    // La fiche vient du service : c'est le SEUL point d'accès à l'analyse
    // morphologique produite par l'IA à partir des photos. Une lecture directe
    // de localStorage ici aurait divergé le jour où la clé change.
    return <MobilitePage prog={prog} profil={profil} fiche={getFicheMorpho()}
      onClose={() => setShowMobilite(false)} />;
  }

  // ── Raisonnement du coach : page pleine (même pattern que le mésocycle) ──
  if (showRaison) {
    return <RaisonnementCoach prog={prog} onClose={() => setShowRaison(false)} />;
  }

  // ── Mésocycle : page pleine (remplace le contenu, garde header + scroll natif) ──
  if (showMeso) {
    return (
      <MesocycleDetail
        prog={prog}
        semC={semC}
        currentWeek={semN - 1}
        profil={profil}
        WEEKS={[
          {label:"Base",color:"#3B82F6"},
          {label:"Vol+",color:"#3B82F6"},
          {label:"Vol+",color:"#3B82F6"},
          {label:"Vol+",color:"#3B82F6"},
          {label:"Déload",color:"#F59E0B"},
          {label:"Pic",color:"#12B76A"},
        ]}
        onClose={() => setShowMeso(false)}
      />
);
  }

  return (
    <div style={{padding:"0 20px"}}>
      <style>{`
        @keyframes tdAurora{0%{transform:translate(-6%,-4%) scale(1)}50%{transform:translate(7%,5%) scale(1.18)}100%{transform:translate(-6%,-4%) scale(1)}}
        @keyframes pulseDot{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes growW{from{width:0%}to{}}
      `}</style>

      {/* ── Confirm delete modal ── */}
      {confirmDel && (
        <div style={{position:"fixed",inset:0,background:"rgba(16,19,24,0.5)",zIndex:340,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:C.s1,borderRadius:16,padding:"24px 20px",width:"100%",maxWidth:340}}>
            <div style={{fontFamily:DISP_F,fontSize:16,fontWeight:500,marginBottom:8,color:C.text}}>
              {confirmDel.type==="prog" ?"Supprimer ce programme ?" :"Supprimer cette séance ?"}
            </div>
            <div style={{fontSize:13,color:C.mid,marginBottom:20,lineHeight:1.5}}>
              {confirmDel.type==="prog"
                ?"Toutes les séances seront perdues. Cette action est irréversible."
                :"La séance et tous ses exercices seront supprimés définitivement."}
            </div>
            <div style={{display:"flex",gap:12}}>
              <button onClick={()=>setConfirmDel(null)} style={{flex:1,padding:"12px",background:C.s2,border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500,color:C.mid,fontFamily:DISP_F}}>Annuler</button>
              <button onClick={()=>confirmDel.type==="prog" ? deleteProgAtIdx(confirmDel.pIdx) : deleteJourAtIdx(confirmDel.pIdx, confirmDel.jIdx)} style={{flex:1,padding:"12px",background:"#3C5BFF",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,color:DARK.surface,fontFamily:DISP_F}}>Supprimer</button>
            </div>
          </div>
        </div>
)}

      {/* ── Header daté V3 (même style que TodayView) ── */}
      {(() => {
        const now = new Date();
        const dateLabel = now.toLocaleDateString("fr-FR", {
          weekday:"long", day:"numeric", month:"short",
        }).toUpperCase().replace(".", "");
        return (
          <div style={{
            marginBottom: 18,
            display:"flex", alignItems:"flex-start", justifyContent:"space-between",
            gap: 12,
          }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{
                fontSize:11, fontWeight:700, letterSpacing:"0.12em",
                color:"#3B5BFB", fontFamily:DISP_F, marginBottom:6,
              }}>{dateLabel}</div>
              <div style={{
                fontFamily:DISP_F, fontSize:31, fontWeight:800,
                letterSpacing:"-0.03em", color:"#0F1923", lineHeight:1,
              }}>
                Ton <span style={{ fontStyle:"italic", color:"#3B5BFB" }}>programme</span>
              </div>
              <div style={{
                fontSize:13.5, fontWeight:500, color:"#6B7486",
                fontFamily:DISP_F, marginTop:6,
              }}>
                {prog
                  ? "Suis ta progression et gère tes séances"
                  : "Crée ton premier programme personnalisé"}
              </div>
            </div>
            {prog && (
              <div onClick={()=>setConfirmDel({type:"prog",pIdx:progIdx})}
                style={{ display:"flex", alignItems:"center", gap:5,
                  background:"#fff", border:"1px solid rgba(15,25,35,0.1)",
                  borderRadius:11, padding:"8px 12px", cursor:"pointer",
                  flexShrink:0, marginTop:20 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B5BFB"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                </svg>
                <span style={{ fontSize:13, fontWeight:700, color:"#0F1923", fontFamily:DISP_F }}>Éditer</span>
              </div>
            )}
          </div>
        );
      })()}



      {/* ── Hero Card premium — entre les 2 blocs, visible sans programme ── */}
      {!prog && !showCreerForm && (() => {
        const F2 ="'Archivo',system-ui,-apple-system,sans-serif";
        const days = ["L","M","M","J","V","S","D"];
        const doneD = [false,false,false,false,false,false,false];
        const scoreR = 87; const R2=18,cx2=21,cy2=21;
        const circ2 = 2*Math.PI*R2;
        const dash2 = (scoreR/100)*circ2;
        return (
          <div style={{borderRadius:28,overflow:"hidden",position:"relative",
            background:"linear-gradient(140deg,#101318 0%,#101318 30%,#101318 65%,#101318 100%)",
            boxShadow:"0 20px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(60,91,255,0.18)"}}>

            {/* Glows */}
            <div style={{position:"absolute",top:-60,left:-30,width:200,height:200,borderRadius:"50%",
              background:"radial-gradient(circle,rgba(109,40,217,0.25),transparent 65%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",bottom:-40,right:50,width:180,height:180,borderRadius:"50%",
              background:"radial-gradient(circle,rgba(60,91,255,0.18),transparent 65%)",pointerEvents:"none"}}/>

            {/* Grille abstraite */}
            <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",
              opacity:0.05,pointerEvents:"none"}} viewBox="0 0 380 240" preserveAspectRatio="xMidYMid slice">
              {[0,1,2,3,4,5,6].map(i=><line key={`h${i}`} x1="0" y1={i*40} x2="380" y2={i*40} stroke="#9DB0FF" strokeWidth="0.6"/>)}
              {[0,1,2,3,4,5,6,7,8,9,10].map(i=><line key={`v${i}`} x1={i*38} y1="0" x2={i*38} y2="240" stroke="#9DB0FF" strokeWidth="0.6"/>)}
            </svg>

            {/* Ligne lumineuse top */}
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,
              background:"linear-gradient(90deg,transparent,rgba(60,91,255,0.65),rgba(60,91,255,0.65),transparent)",
              pointerEvents:"none"}}/>

            {/* Particules */}
            {[[18,25,"#3C5BFF"],[220,16,DARK.accent],[170,140,"#9DB0FF"],[45,125,"#3C5BFF"]].map(([x,y,c],i)=>(
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
                  background:"linear-gradient(135deg,rgba(109,40,217,0.25),rgba(60,91,255,0.18))",
                  border:"1px solid rgba(60,91,255,0.35)",backdropFilter:"blur(6px)"}}>
                  <span style={{fontSize:10}}><I name="check" size={12}/></span>
                  <span style={{fontSize:10,fontWeight:700,color:"#C9D3FF",fontFamily:F2,letterSpacing:"0.1em"}}>PRO · IA Coach</span>
                  <div style={{width:3.5,height:3.5,borderRadius:"50%",background:"#3C5BFF",boxShadow:"0 0 5px #3C5BFF"}}/>
                </div>

                {/* Titre */}
                <div style={{fontSize:20,fontWeight:700,color:"#FFF",fontFamily:F2,
                  lineHeight:1.2,letterSpacing:-0.5,marginBottom:24}}>
                  <span style={{
                    background:"linear-gradient(90deg,#FFF,#E8EBFF)",
                    WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
                    Ton coach IA
                  </span>
                  <br/>t'attend. 
                </div>

                {/* CTA 1 — CRÉER PROGRAMME (bleu plein, principal) */}
                <button onClick={()=>{ setIsCreating(true); setCS(0); setNewP({nom:"",jours:[],seances:{}}); }}
                  style={{width:"100%",height:56,padding:"0 12px",borderRadius:16,border:"none",cursor:"pointer",
                    background:"linear-gradient(135deg,#2E48D9,#3C5BFF)",
                    color:"#FFF",fontSize:16,fontWeight:700,fontFamily:F2,
                    boxShadow:"0 8px 24px rgba(60,91,255,0.5),0 0 0 1px rgba(157,176,255,0.25)",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                    letterSpacing:-0.2,marginBottom:12}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFF" stroke="none">
                    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>
                  </svg>
                  Créer mon programme
                </button>

                {/* CTA 2 — PARLER À UN COACH (transparent, secondaire) */}
                <button onClick={()=>{ if(!premium) setPaywall(true); else setProgView("analyse"); }}
                  style={{width:"100%",height:56,padding:"0 12px",borderRadius:16,cursor:"pointer",
                    background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.18)",
                    color:"rgba(255,255,255,0.85)",fontSize:16,fontWeight:700,fontFamily:F2,
                    display:"flex",alignItems:"center",justifyContent:"center",gap:8,letterSpacing:-0.2,
                    backdropFilter:"blur(6px)"}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Analyse ta morphologie
                </button>
              </div>

              {/* ── Droite : Phone miniature ── */}
              <div style={{position:"relative",flexShrink:0,
                transform:"rotate(6deg) translateY(-8px)",transformOrigin:"center bottom"}}>
                {/* Glow */}
                <div style={{position:"absolute",top:-20,left:-18,right:-18,bottom:-12,zIndex:0,pointerEvents:"none",
                  background:"radial-gradient(ellipse at 50% 55%,rgba(60,91,255,0.5),rgba(60,91,255,0.18),transparent 68%)",
                  filter:"blur(16px)"}}/>
                {/* Phone */}
                <div style={{position:"relative",zIndex:1,width:118,borderRadius:20,
                  background:"linear-gradient(165deg,#101318,#101318,#101318)",
                  border:"1.5px solid rgba(60,91,255,0.5)",
                  boxShadow:"0 18px 55px rgba(0,0,0,0.65),0 0 0 1px rgba(255,255,255,0.05),inset 0 1px 0 rgba(255,255,255,0.08)",
                  overflow:"hidden",padding:"8px 8px 12px"}}>
                  {/* Reflet */}
                  <div style={{position:"absolute",top:0,left:0,right:0,height:48,
                    background:"linear-gradient(180deg,rgba(255,255,255,0.08),transparent)",
                    pointerEvents:"none",zIndex:2}}/>
                  {/* Notch */}
                  <div style={{width:36,height:5,borderRadius:3,background:"rgba(16,19,24,0.5)",margin:"0 auto 8px"}}/>
                  {/* Header */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:8,fontWeight:700,color:"#FFF",fontFamily:F2}}>MorphoCoach</span>
                    <div style={{display:"flex",alignItems:"center",gap:4,padding:"1px 4px",borderRadius:8,
                      background:"linear-gradient(135deg,rgba(60,91,255,0.25),rgba(60,91,255,0.18))",
                      border:"1px solid rgba(60,91,255,0.5)"}}>
                      <div style={{width:3,height:3,borderRadius:"50%",background:"#9DB0FF",boxShadow:"0 0 4px #3C5BFF"}}/>
                      <span style={{fontSize:6,fontWeight:700,color:"#C9D3FF",fontFamily:F2,letterSpacing:"0.1em"}}>IA</span>
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
                          <stop offset="0%" stopColor="#12B76A"/><stop offset="100%" stopColor={C.accent}/>
                        </linearGradient>
                      </defs>
                      <text x={cx2} y={cy2+0.5} textAnchor="middle" dominantBaseline="middle"
                        fontSize="9.5" fontWeight="700" fill="#FFF" fontFamily={F2}>{scoreR}</text>
                      <text x={cx2} y={cy2+8} textAnchor="middle" dominantBaseline="middle"
                        fontSize="4.5" fill="rgba(255,255,255,0.35)" fontFamily={F2}>RÉCUP.</text>
                    </svg>
                    <div>
                      <div style={{fontSize:7.5,fontWeight:700,color:"#12B76A",fontFamily:F2,marginBottom:2}}>Prêt à performer</div>
                      <div style={{fontSize:6.5,color:"rgba(255,255,255,0.35)",fontFamily:F2,lineHeight:1.5}}>Programme IA<br/>généré </div>
                    </div>
                  </div>
                  {/* Days */}
                  <div style={{display:"flex",gap:4,marginBottom:8}}>
                    {days.map((d,i)=>(
                      <div key={i} style={{flex:1,textAlign:"center"}}>
                        <div style={{fontSize:5.5,color:doneD[i]?"#9DB0FF":"rgba(255,255,255,0.25)",
                          fontFamily:F2,fontWeight:600,marginBottom:2}}>{d}</div>
                        <div style={{height:14,borderRadius:3,display:"grid",placeItems:"center",
                          background:i===0?"linear-gradient(135deg,#3C5BFF,#2E48D9)"
                            :"rgba(255,255,255,0.08)",
                          border:i===0?"1px solid rgba(60,91,255,0.65)":"none"}}>
                          {i===0&&<span style={{fontSize:5,color:"#FFF"}}>▸</span>}
                        </div>
                      </div>
))}
                  </div>
                  {/* Séance preview */}
                  <div style={{borderRadius:8,padding:"8px 8px",marginBottom:4,
                    background:"linear-gradient(135deg,rgba(60,91,255,0.18),rgba(60,91,255,0.12))",
                    border:"1px solid rgba(60,91,255,0.25)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:6,fontWeight:700,color:"#9DB0FF",fontFamily:F2,
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
                  {[{l:"Fatigue",v:"Basse",c:"#12B76A",b:0.22},{l:"Risque",v:"Faible",c:"#C9D3FF",b:0.15}].map((m,i)=>(
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

      {/* ── Programme actif — maquette V3b ── */}
      {prog && prog.jours?.length > 0 && (<>

        {/* Hero V3b — aurora + barre qui pousse */}
        <div style={{
          position:"relative", borderRadius:24, overflow:"hidden", marginBottom:18,
          background:"#0B0E1A",
        }}>
          {/* Aurora */}
          <div style={{position:"absolute",top:-50,left:-30,width:200,height:200,borderRadius:"50%",
            background:"radial-gradient(circle,#3B5BFB,transparent 66%)",filter:"blur(18px)",opacity:0.5,
            animation:"tdAurora 11s ease-in-out infinite",pointerEvents:"none"}}/>
          <div style={{position:"absolute",bottom:-60,right:-40,width:210,height:210,borderRadius:"50%",
            background:"radial-gradient(circle,#7C5CFF,transparent 66%)",filter:"blur(22px)",opacity:0.36,
            animation:"tdAurora 14s ease-in-out infinite reverse",pointerEvents:"none"}}/>


          <div style={{position:"relative",padding:"20px",display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:7,
                background:"rgba(59,91,251,0.2)",border:"1px solid rgba(120,150,255,0.4)",
                borderRadius:99,padding:"6px 12px",fontSize:11,fontWeight:800,
                letterSpacing:"0.06em",color:"#B9C6FF",fontFamily:DISP_F}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"#5B8DFF"}}/>
                PROGRAMME ACTIF
              </span>
              <span style={{background:"rgba(255,255,255,0.1)",borderRadius:99,
                padding:"6px 12px",fontSize:12,fontWeight:800,color:"#fff",fontFamily:DISP_F}}>
                Semaine {Math.min(semN, TOTAL_SEMAINES)} / {TOTAL_SEMAINES}
              </span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:3}}>
              <span style={{fontSize:30,fontWeight:800,letterSpacing:"-0.03em",color:"#fff",lineHeight:1,fontFamily:DISP_F}}>
                {prog.titre || "Mon programme"}
              </span>
              <span style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.6)",fontFamily:DISP_F}}>
                {prog.objectif || "Hypertrophie"} · {prog.jours.length} séance{prog.jours.length!==1?"s":""}
              </span>
              <div onClick={()=>setShowRaison(true)} style={{display:"inline-flex",alignItems:"center",
                gap:6,alignSelf:"flex-start",marginTop:10,cursor:"pointer",
                background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.16)",
                borderRadius:99,padding:"8px 14px"}}>
                <span style={{fontSize:12.5,fontWeight:800,color:"#fff",fontFamily:DISP_F}}>
                  Voir le raisonnement du coach
                </span>
                <span style={{fontSize:14,fontWeight:800,color:"#B9C6FF",fontFamily:DISP_F}}>&rsaquo;</span>
              </div>
              <div onClick={()=>setShowMobilite(true)} style={{display:"inline-flex",alignItems:"center",
                gap:6,alignSelf:"flex-start",marginTop:8,cursor:"pointer",
                background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.16)",
                borderRadius:99,padding:"8px 14px"}}>
                <span style={{fontSize:12.5,fontWeight:800,color:"#fff",fontFamily:DISP_F}}>
                  Ta mobilité quotidienne
                </span>
                <span style={{fontSize:14,fontWeight:800,color:"#B9C6FF",fontFamily:DISP_F}}>&rsaquo;</span>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:12.5,fontWeight:600,color:"rgba(255,255,255,0.6)",fontFamily:DISP_F}}>Cette semaine</span>
                <span style={{fontSize:14,fontWeight:800,color:"#fff",fontFamily:DISP_F}}>
                  {Math.min(semC||0, prog.jours.length)} / {prog.jours.length} séance{prog.jours.length!==1?"s":""}
                </span>
              </div>
              <div style={{position:"relative",height:9,borderRadius:99,background:"rgba(255,255,255,0.12)",overflow:"hidden"}}>
                <div style={{height:"100%",width:`${prog.jours.length?Math.max(5,Math.round(Math.min(semC||0,prog.jours.length)/prog.jours.length*100)):5}%`,
                  background:"linear-gradient(90deg,#5B8DFF,#3B5BFB)",borderRadius:99}}/>
              </div>
            </div>
          </div>
        </div>

        {/* Bandeau de semaine (concept D) — la périodisation devient visible.
            Sans lui, la semaine « Déload » n'était qu'une étiquette. */}
        {(() => {
          const ph = resumeSemaine(semN, prog?.objectif);
          const estRepos = ph.cle === "deload";
          const acc = estRepos ? "#F5A100" : "#3B5BFB";
          const active = periodisationActive(prog);
          const bascule = () => {
            const maj = { ...prog, periodisation: !active };
            setProg(maj);
            const i = allProgs.findIndex(x => x.id === prog.id);
            if (i >= 0) updateProgAtIdx(i, maj);
          };

          // Programme manuel sans périodisation : on PROPOSE, on n'impose pas.
          // Modifier silencieusement des séries choisies par l'utilisateur
          // serait contredire son travail, pas le coacher.
          if (!active) return (
            <div style={{ background:"#fff", border:"1px solid rgba(15,25,35,.06)",
                          borderRadius:22, padding:16, marginBottom:14,
                          boxShadow:"0 2px 10px rgba(15,25,35,.05)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ fontSize:11, fontWeight:800, fontFamily:DISP_F,
                               color:"#6B7486", background:"#F1F3F8",
                               padding:"5px 11px", borderRadius:99 }}>
                  Semaine {ph.semaine} / {ph.total}
                </span>
                <span style={{ fontSize:11.5, fontWeight:600, color:"#9AA3B2",
                               fontFamily:DISP_F }}>programme suivi tel quel</span>
              </div>
              <div style={{ fontSize:13, fontWeight:500, color:"#6B7486",
                            lineHeight:1.6, fontFamily:DISP_F }}>
                Tes séries et tes charges sont affichées exactement comme tu les as
                écrites. Je peux les faire varier sur 6 semaines — volume qui monte,
                semaine allégée, puis pic — sans jamais toucher à ton programme enregistré.
              </div>
              <div onClick={bascule} style={{ display:"inline-flex", alignItems:"center",
                gap:7, marginTop:12, cursor:"pointer", background:"rgba(59,91,251,.1)",
                borderRadius:99, padding:"9px 15px" }}>
                <span style={{ fontSize:12.5, fontWeight:800, color:"#2540E0",
                               fontFamily:DISP_F }}>Activer la périodisation</span>
              </div>
            </div>
          );

          return (
            <div style={{ background:"#fff", border:"1px solid rgba(15,25,35,.06)",
                          borderRadius:22, padding:16, marginBottom:14,
                          boxShadow:"0 2px 10px rgba(15,25,35,.05)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8,
                            flexWrap:"wrap", marginBottom:9 }}>
                <span style={{ fontSize:11, fontWeight:800, fontFamily:DISP_F,
                               color: estRepos ? "#B37400" : "#2540E0",
                               background: estRepos ? "rgba(245,161,0,.13)" : "rgba(59,91,251,.1)",
                               padding:"5px 11px", borderRadius:99 }}>
                  Semaine {ph.semaine} · {ph.label.toLowerCase()}
                </span>
                <span style={{ fontSize:11.5, fontWeight:600, color:"#9AA3B2",
                               fontFamily:DISP_F }}>{ph.ajustement}</span>
              </div>
              <div style={{ fontSize:13, fontWeight:500, color:"#6B7486",
                            lineHeight:1.6, fontFamily:DISP_F }}>{ph.consigne}</div>
              {/* La courbe dépend de l'objectif : sans cette ligne, l'athlète
                  voit des chiffres bouger sans savoir pourquoi. */}
              {ph.objectifNote && (
                <div style={{ fontSize:11.5, fontWeight:500, color:"#9AA3B2",
                              lineHeight:1.5, fontFamily:DISP_F, marginTop:7 }}>
                  {(prog?.objectif || "hypertrophie").replace(/_/g," ")} · {ph.objectifNote}
                </div>
              )}
              <div onClick={bascule} style={{ fontSize:11.5, fontWeight:700,
                color:"#9AA3B2", fontFamily:DISP_F, marginTop:9, cursor:"pointer" }}>
                Suivre le programme sans variation
              </div>
              <div style={{ display:"flex", gap:4, marginTop:13 }}>
                {Array.from({ length: ph.total }).map((_, i) => (
                  <span key={i} style={{ flex:1, height:5, borderRadius:99,
                    background: i + 1 === ph.semaine ? acc
                              : i + 1 < ph.semaine ? "#5B8DFF" : "#E1E5EE" }}/>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Tes séances — badge jour + statut, tap pour éditer */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ fontSize:17, fontWeight:800, color:"#0F1923", fontFamily:DISP_F }}>Tes séances</div>
          <div style={{ fontSize:12, fontWeight:700, color:"#9AA3B2", fontFamily:DISP_F }}>
            {prog.jours.length} / semaine
          </div>
        </div>

        {prog.jours.map((j, jIdx) => {
          const dur   = durOf(j);
          const exos  = j.exercices||[];
          const jDone = jIdx < (semC||0);
          const jNext = jIdx === (semC||0);
          const jourLbl = (j.focus || j.nom || "—").slice(0,3).toUpperCase();

          const badgeBg   = jDone ? `${C.green}18` : jNext ? "#3B5BFB" : "#F1F3F8";
          const badgeColor= jDone ? C.green : jNext ? "#FFF" : "#6B7486";
          const cardBorder= jNext ? "1.5px solid #3B5BFB" : "1px solid rgba(15,25,35,0.06)";
          const cardShadow= jNext ? "0 8px 22px rgba(59,91,251,0.16)" : "0 1px 3px rgba(15,25,35,0.04)";

          const dureeTxt = dur
            ? (jDone ? `${dur} min réalisés` : `~${dur} min`)
            : null;

          return (
            <div key={jIdx}
              onClick={()=>setSelectedJour({jIdx})}
              style={{
                background:"#fff", border:cardBorder, borderRadius:18,
                marginBottom:11, padding:"12px 14px",
                display:"flex", alignItems:"center", gap:13,
                boxShadow:cardShadow, cursor:"pointer",
              }}>
              {/* Badge jour */}
              <div style={{width:52,height:52,borderRadius:15,background:badgeBg,color:badgeColor,
                display:"grid",placeItems:"center",flexShrink:0,fontFamily:DISP_F,fontSize:12,fontWeight:800}}>
                {jourLbl}
              </div>
              {/* Infos */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:800,color:C.text,letterSpacing:-0.2,fontFamily:DISP_F}}>{j.nom}</div>
                <div style={{fontSize:11.5,fontWeight:600,color:C.dim,marginTop:2,fontFamily:DISP_F}}>
                  {exos.length} exercice{exos.length!==1?"s":""}{dureeTxt?` · ${dureeTxt}`:""}
                </div>
              </div>
              {/* Statut */}
              {jDone ? (
                <div style={{display:"flex",alignItems:"center",gap:5,background:`${C.green}18`,padding:"6px 10px",borderRadius:99,flexShrink:0}}>
                  <I name="check" size={12} color={C.green} stroke={3}/>
                  <span style={{fontSize:11,fontWeight:800,color:C.green,fontFamily:DISP_F}}>Fait</span>
                </div>
              ) : jNext ? (
                <button
                  onClick={e=>{ e.stopPropagation(); setProgView("today"); }}
                  style={{display:"flex",alignItems:"center",gap:6,background:C.accent,border:"none",
                    padding:"8px 13px",borderRadius:99,flexShrink:0,cursor:"pointer"}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFF"><path d="M8 5v14l11-7z"/></svg>
                  <span style={{fontSize:11.5,fontWeight:800,color:"#FFF",fontFamily:DISP_F}}>Démarrer</span>
                </button>
              ) : (
                <span style={{fontSize:11,fontWeight:800,color:C.dim,background:C.s2,padding:"6px 11px",borderRadius:99,flexShrink:0,fontFamily:DISP_F}}>
                  Planifié
                </span>
              )}
            </div>
          );
        })}

      </>)}

      {/* ── État de forme ── */}
      <div style={{marginTop:8}}>
        <CoachWeekCard
          semC={semC}
          semN={semN}
          totalJours={prog?.jours?.length||0}
          premium={premium}
          onUnlock={()=>setPaywall(true)}
          onFirstSeance={()=>setProgView("today")}
          onDetails={()=>setShowMeso(true)}
        />
      </div>


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
                <button onClick={()=>{setProg(p);push("","Programme activé",p.titre);}} style={{padding:"8px 12px",background:"rgba(18,183,106,0.12)",border:"1px solid rgba(18,183,106,0.25)",borderRadius:8,color:"#12B76A",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:DISP_F}}>Activer</button>
                <button onClick={()=>setConfirmDel({type:"prog",pIdx})} style={{padding:"8px 8px",background:"rgba(229,72,77,0.08)",border:"1px solid rgba(229,72,77,0.18)",borderRadius:8,color:"#3C5BFF",cursor:"pointer",fontSize:11}}><I name="trash" size={13}/></button>
              </div>
);
          })}
        </div>
)}

      {showCreerForm && (
        <Creer {...creerProps} progs={allProgs} setProgsAll={(next)=>{ setProgs(next); if(next.length>0) setProg(next[next.length-1]); }}/>
)}

      {/* ── SeanceDetailModal en overlay fixe (gère son propre positionnement) ── */}
      {selectedJour !== null && prog?.jours?.[selectedJour.jIdx] && (
        <SeanceDetailModal
          jour={prog.jours[selectedJour.jIdx]}
          jourIdx={selectedJour.jIdx}
          prog={prog}
          setProg={(u) => updateProgAtIdx(progIdx, u)}
          onClose={() => setSelectedJour(null)}
          C={C} INT={INT}
        />
)}
    </div>
);
}

// ─── PROGRAMTAB ──────────────────────────────────────────────────────────────

