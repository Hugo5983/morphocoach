import { useState } from "react";
import { INT } from "../../data/constants.js";
import { EX } from "../../data/exercises.js";
import { Box, Lbl, Btn, Row } from "../../components/ui/index.jsx";
import { MonthCal } from "../../components/ui/MonthCal.jsx";

// ─── HELPER : chercher un exercice dans la BDD par nom ───────────────────────
function findExInDB(nom) {
  if (!nom) return null;
  const n = nom.toLowerCase();
  for (const group of Object.values(EX)) {
    const found = group.find(e =>
      e.n.toLowerCase() === n ||
      n.includes(e.n.toLowerCase().split(" ")[0]) ||
      e.n.toLowerCase().includes(n.split(" ")[0])
    );
    if (found) return found;
  }
  return null;
}

// ─── GUIDE MODAL (Tips / Variantes / Erreurs / Morpho) ──────────────────────
function GuideExModal({ exData, exSerie, onClose, C, INT }) {
  const [tab, setTab] = useState("tips");
  const cc = {principal:"#3b82f6",correctif:"#ef4444",gainage:"#22c55e",isolation:"#8b5cf6",mobilite:"#06b6d4"}[exData.cat] || "#3b82f6";

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(228,238,248,0.99)",zIndex:500,overflowY:"auto"}}>
      <div style={{maxWidth:500,margin:"0 auto",paddingBottom:80}}>
        {/* Header */}
        <div style={{padding:"20px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1}}>
            <div style={{display:"inline-block",padding:"3px 10px",background:`${cc}14`,border:`0.5px solid ${cc}40`,borderRadius:8,fontSize:10,color:cc,letterSpacing:"1px",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>{exData.cat}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:400,lineHeight:1.2,color:"#0f1a2e",marginBottom:4}}>{exData.n}</div>
          </div>
          <button onClick={onClose} style={{background:"#edf3fb",border:"0.5px solid #dce8f4",borderRadius:10,width:36,height:36,color:"#64748b",cursor:"pointer",fontSize:18,flexShrink:0,marginLeft:12}}>×</button>
        </div>

        {/* Stats séries/reps */}
        <div style={{padding:"12px 16px",display:"flex",gap:7,flexWrap:"wrap"}}>
          {[
            {l:"Séries", v: exSerie?.series || exData.s},
            {l:"Reps",   v: exSerie?.reps   || exData.r},
            {l:"Repos",  v: exSerie?.repos   || exData.rest},
            {l:"Charge", v: exSerie?.charge  || exData.ch},
          ].map(s => (
            <div key={s.l} style={{padding:"8px 10px",background:"#ffffff",border:"0.5px solid #dce8f4",borderRadius:10,textAlign:"center",flex:1,minWidth:60}}>
              <div style={{fontSize:14,fontWeight:400,color:"#3b82f6",fontFamily:"'Syne',sans-serif"}}>{s.v || "—"}</div>
              <div style={{fontSize:9,color:"#64748b",marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{padding:"0 16px",display:"flex",gap:6,marginBottom:14}}>
          {[{id:"tips",l:"Tips"},{id:"variantes",l:"Variantes"},{id:"erreurs",l:"Erreurs"},{id:"morpho",l:"Morpho"}].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{padding:"6px 13px",background:tab===t.id?"rgba(59,130,246,0.08)":"transparent",border:`0.5px solid ${tab===t.id?"#3b82f6":"#dce8f4"}`,borderRadius:20,color:tab===t.id?"#3b82f6":"#64748b",cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:"'Inter',sans-serif"}}>{t.l}</button>
          ))}
        </div>

        <div style={{padding:"0 16px"}}>
          {tab==="tips" && (
            <div style={{background:"#fff",border:"0.5px solid #dce8f4",borderRadius:12,padding:"14px 16px"}}>
              <div style={{fontSize:9,color:"#64748b",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:12}}>Conseils techniques</div>
              {(exData.tips||[]).map((tip,i) => (
                <div key={i} style={{display:"flex",gap:12,marginBottom:14,paddingBottom:14,borderBottom:i<(exData.tips.length-1)?"0.5px solid #dce8f4":"none"}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(59,130,246,0.1)",border:"0.5px solid rgba(59,130,246,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,fontWeight:500,color:"#3b82f6"}}>{i+1}</div>
                  <div style={{fontSize:12,color:"#0f1a2e",lineHeight:1.6}}>{tip}</div>
                </div>
              ))}
              {exData.prog && (
                <div style={{marginTop:4,padding:"10px 12px",background:"rgba(34,197,94,0.08)",border:"0.5px solid rgba(34,197,94,0.2)",borderRadius:9}}>
                  <div style={{fontSize:10,color:"#22c55e",fontWeight:500,letterSpacing:"1px",textTransform:"uppercase",marginBottom:3}}>Progression</div>
                  <div style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>{exData.prog}</div>
                </div>
              )}
            </div>
          )}

          {tab==="variantes" && (
            <div>
              {(exData.variantes||[]).map((v,i) => (
                <div key={i} style={{background:"#fff",border:"0.5px solid #dce8f4",borderRadius:12,padding:"14px 16px",marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:500,color:"#0f1a2e",marginBottom:5}}>{v.nom||v}</div>
                  {v.note && <div style={{fontSize:11,color:"#64748b",lineHeight:1.5}}>{v.note}</div>}
                </div>
              ))}
              {(!exData.variantes || exData.variantes.length === 0) && (
                <div style={{textAlign:"center",padding:"24px",color:"#94a3b8",fontSize:13}}>Pas de variantes renseignées.</div>
              )}
            </div>
          )}

          {tab==="erreurs" && (
            <div style={{background:"#fff",border:"0.5px solid #dce8f4",borderRadius:12,padding:"14px 16px"}}>
              <div style={{fontSize:9,color:"#64748b",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:12}}>Erreurs à éviter</div>
              {(exData.erreurs||[]).map((e,i) => (
                <div key={i} style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start"}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(248,113,113,0.1)",border:"0.5px solid rgba(248,113,113,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,color:"#f87171"}}>✕</div>
                  <div style={{fontSize:12,color:"#0f1a2e",lineHeight:1.5}}>{e}</div>
                </div>
              ))}
            </div>
          )}

          {tab==="morpho" && (
            <div style={{background:"#fff",border:"0.5px solid #dce8f4",borderRadius:12,padding:"14px 16px"}}>
              <div style={{fontSize:9,color:"#64748b",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:12}}>Adaptation morphologique</div>
              {(exData.morpho||"").split('\n').filter(Boolean).map((line,i,arr) => (
                <div key={i} style={{display:"flex",gap:8,marginBottom:10,paddingBottom:10,borderBottom:i<arr.length-1?"0.5px solid #dce8f4":"none",alignItems:"flex-start"}}>
                  <div style={{fontSize:13,flexShrink:0,marginTop:1}}>{line.split(':')[0].trim()}</div>
                  <div style={{fontSize:11.5,color:"#0f1a2e",lineHeight:1.6,flex:1}}>{line.split(':').slice(1).join(':').trim()}</div>
                </div>
              ))}
              {!(exData.morpho||"").includes('\n') && exData.morpho && (
                <div style={{fontSize:12,color:"#0f1a2e",lineHeight:1.7}}>{exData.morpho}</div>
              )}
            </div>
          )}
        </div>

        <div style={{padding:"14px 16px 0"}}>
          <button onClick={onClose} style={{width:"100%",padding:"11px",background:"transparent",border:"0.5px solid #dce8f4",borderRadius:10,color:"#64748b",cursor:"pointer",fontSize:13,fontFamily:"'Inter',sans-serif"}}>← Retour à la séance</button>
        </div>
      </div>
    </div>
  );
}

// ─── EXERCICE EDITABLE (sous-composant propre, pas de hook dans .map) ────────
function ExerciceEditable({ ex, exIdx, jourIdx, prog, setProg, cc, METHODS, onGuide }) {
  const [editing, setEditing] = useState(false);
  const updateEx = (field, val) => {
    const u = JSON.parse(JSON.stringify(prog));
    u.jours[jourIdx].exercices[exIdx][field] = val;
    setProg(u);
  };
  const dbEx = findExInDB(ex.nom);

  return (
    <div style={{background:"#fff",border:"0.5px solid #dce8f4",borderRadius:10,marginBottom:7,overflow:"hidden"}}>
     <div style={{padding:"10px 13px",borderLeft:`3px solid ${cc}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
       <div style={{flex:1,cursor:"pointer"}} onClick={() => setEditing(e => !e)}>
        <div style={{fontSize:12,fontWeight:600,color:"#0f1a2e",marginBottom:3}}>{ex.nom}</div>
        <div style={{fontSize:10,color:"#64748b"}}>{ex.series}×{ex.reps} · {ex.repos}{ex.charge?` · ${ex.charge}`:""}{ex.tempo?` · ${ex.tempo}`:""}{ex.methode&&ex.methode!=="Classique"?` · ${ex.methode}`:""}</div>
       </div>
       <div style={{display:"flex",gap:5,marginLeft:8,flexShrink:0}}>
        {dbEx && onGuide && (
          <button onClick={() => onGuide(dbEx, ex)} style={{padding:"4px 8px",background:"rgba(59,130,246,0.06)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:6,color:"#3b82f6",cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Guide ›</button>
        )}
        <button onClick={() => setEditing(e => !e)} style={{padding:"4px 8px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:6,color:"#3b82f6",cursor:"pointer",fontSize:10,flexShrink:0}}>✏️</button>
       </div>
      </div>
      {editing && (
      <div style={{marginTop:10,paddingTop:10,borderTop:"0.5px solid #dce8f4"}}>
       <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:7}}>
        {[{l:"Séries",k:"series"},{l:"Reps",k:"reps"},{l:"Repos",k:"repos"},{l:"Charge",k:"charge"}].map(pp => (
         <div key={pp.k}>
          <div style={{fontSize:9,color:"#64748b",marginBottom:3,fontWeight:600}}>{pp.l}</div>
          <div style={{display:"flex",gap:3,alignItems:"center"}}>
           <button onClick={() => {const cur=parseFloat(ex[pp.k])||0; updateEx(pp.k,String(pp.k==="repos"?Math.max(0,cur-15):Math.max(1,cur-1)));}} style={{width:22,height:22,borderRadius:5,background:"#f1f5f9",border:"none",cursor:"pointer",fontSize:12}}>−</button>
           <input value={ex[pp.k]||""} onChange={e => updateEx(pp.k,e.target.value)} style={{flex:1,padding:"4px 5px",background:"#fff",border:"0.5px solid #dce8f4",borderRadius:6,fontSize:11,textAlign:"center",fontFamily:"'Inter',sans-serif"}}/>
           <button onClick={() => {const cur=parseFloat(ex[pp.k])||0; updateEx(pp.k,String(pp.k==="repos"?cur+15:cur+1));}} style={{width:22,height:22,borderRadius:5,background:"#3b82f6",border:"none",color:"#fff",cursor:"pointer",fontSize:12}}>+</button>
          </div>
         </div>
        ))}
       </div>
       <div style={{marginBottom:6}}>
        <div style={{fontSize:9,color:"#64748b",marginBottom:3,fontWeight:600}}>TEMPO</div>
        <input value={ex.tempo||""} onChange={e => updateEx("tempo",e.target.value)} placeholder="Ex: 2-1-3" style={{width:"100%",padding:"7px 10px",background:"#fff",border:"0.5px solid #dce8f4",borderRadius:8,fontSize:11,fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
       </div>
       <div>
        <div style={{fontSize:9,color:"#64748b",marginBottom:4,fontWeight:600}}>MÉTHODE</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
         {METHODS.map(mm => (
          <button key={mm} onClick={() => updateEx("methode",mm)} style={{padding:"3px 8px",borderRadius:12,border:`1px solid ${ex.methode===mm?"#3b82f6":"#dce8f4"}`,background:ex.methode===mm?"rgba(59,130,246,0.1)":"transparent",color:ex.methode===mm?"#3b82f6":"#64748b",cursor:"pointer",fontSize:9,fontFamily:"'Inter',sans-serif"}}>{mm}</button>
         ))}
        </div>
       </div>
      </div>
      )}
     </div>
    </div>
  );
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
export default function Calendar(props) {
  const { prog, setProg, progs, setProgs, cycleStart, setTab, premium, setPaywall, push, calSess, setCalSess, checkedEx, jR, semC, C, INT, setProgView } = props;

  const [bonusModal, setBonusModal]   = useState(null);
  const [viewJour,   setViewJour]     = useState(null);
  const [currentWeek, setCurrentWeek] = useState(semC || 0);
  const [guideEx,    setGuideEx]      = useState(null); // { dbEx, serieEx }

  const WEEK_INTENSITY = ["modere","modere","lourd","lourd","intense","leger"];
  const METHODS = ["Classique","Pyramidal","Super-set","Drop-set","Rest-pause","5×5","Séries de 100","Dégressif"];

  // ── Guide modal ──
  if (guideEx) {
    return (
      <GuideExModal
        exData={guideEx.dbEx}
        exSerie={guideEx.serieEx}
        onClose={() => setGuideEx(null)}
        C={C} INT={INT}
      />
    );
  }

  // ── Vue détail d'une séance (exercices) ──
  if (viewJour !== null && prog) {
    const jour = prog.jours[viewJour];
    const weekInt = INT[WEEK_INTENSITY[currentWeek]];
    const int = INT[jour.intensite || "modere"];
    return (
      <div style={{padding:"0 15px"}}>
        <button onClick={() => setViewJour(null)} style={{background:"transparent",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:13,fontWeight:600,padding:"16px 0 12px",display:"flex",alignItems:"center",gap:5}}>← Retour aux séances</button>

        {/* Header séance */}
        <div style={{padding:"12px 14px",background:`${int.c}14`,border:`0.5px solid ${int.c}40`,borderRadius:12,marginBottom:4}}>
          <div style={{fontSize:9,color:int.c,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>{int.l}</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:400,marginBottom:2}}>{jour.nom}</div>
          <div style={{fontSize:11,color:"#64748b"}}>{jour.focus} · {jour.duree} · {jour.exercices?.length||0} exercices</div>
        </div>

        {/* Badge intensité semaine sélectionnée */}
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",background:`${weekInt.c}10`,border:`0.5px solid ${weekInt.c}30`,borderRadius:8,marginBottom:12}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:weekInt.c,flexShrink:0}}/>
          <div style={{fontSize:10,color:weekInt.c,fontWeight:600}}>Semaine {currentWeek+1} — {weekInt.l}</div>
        </div>

        {(jour.exercices||[]).length === 0 && (
          <div style={{textAlign:"center",padding:"24px 0",color:"#64748b",fontSize:13}}>Aucun exercice dans cette séance.</div>
        )}
        {(jour.exercices||[]).map((ex,k) => {
          const cc = {principal:"#3b82f6",correctif:"#ef4444",gainage:"#22c55e",isolation:"#8b5cf6",correctiv:"#ef4444"}[ex.cat||"principal"]||"#3b82f6";
          return (
            <ExerciceEditable
              key={k} ex={ex} exIdx={k} jourIdx={viewJour}
              prog={prog} setProg={setProg}
              cc={cc} METHODS={METHODS}
              onGuide={(dbEx, serieEx) => setGuideEx({dbEx, serieEx})}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div style={{padding:"0 15px"}}>

      {/* Calendrier mensuel */}
      <Box>
        <Lbl>Calendrier mensuel</Lbl>
        <MonthCal sessions={calSess} onUpdate={(date,sess) => {
          if (sess) setCalSess(s => ({...s,[date]:sess}));
          else setCalSess(s => { const ns={...s}; delete ns[date]; return ns; });
        }}/>
      </Box>

      {/* Séances bonus */}
      <Lbl>Séance bonus</Lbl>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
        {[{id:"etirements",i:"🧘",l:"Étirements",color:C.purple},{id:"cardio",i:"🏃",l:"Cardio",color:C.blue},{id:"mobilite",i:"💆",l:"Mobilité",color:C.green}].map(b => (
          <div key={b.id} onClick={() => setBonusModal(b)} style={{padding:"12px 8px",textAlign:"center",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:10,cursor:"pointer"}}>
            <div style={{fontSize:22,marginBottom:4}}>{b.i}</div>
            <div style={{fontSize:11,fontWeight:700,color:b.color}}>{b.l}</div>
          </div>
        ))}
      </div>

      {bonusModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(237,243,251,0.97)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:18}}>
          <div style={{background:C.s1,border:"0.5px solid #dce8f4",borderRadius:14,padding:"22px 18px",width:"100%",maxWidth:360}}>
            <Lbl>{bonusModal.i} {bonusModal.l}</Lbl>
            <div style={{fontSize:12,color:"#64748b",marginBottom:14}}>Durée de la séance ?</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
              {["15 min","20 min","30 min","45 min"].map(dur => (
                <div key={dur} onClick={() => {
                  const today = new Date();
                  const key = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
                  setCalSess(s => ({...s,[key]:{nom:`${bonusModal.l} ${dur}`,intensite:"mobilite",color:bonusModal.color}}));
                  setBonusModal(null);
                  push("✅",`${bonusModal.l} ajouté !`,`${dur} enregistré dans le calendrier.`);
                }} style={{padding:"10px 16px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:600,color:C.text}}>{dur}</div>
              ))}
            </div>
            <Btn v="ghost" onClick={() => setBonusModal(null)}>Annuler</Btn>
          </div>
        </div>
      )}

      {/* Bloc programme + semaines S1-S6 */}
      {cycleStart && prog && (
        <Box style={{background:"rgba(59,130,246,0.06)",borderColor:C.goldB}}>
          <Row style={{justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <Lbl style={{marginBottom:4}}>Cycle {prog.numero||1} · {prog.duree_semaines||6} semaines</Lbl>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:500}}>{prog.titre}</div>
              {prog.methode && <div style={{fontSize:10,color:"#3b82f6",marginTop:2,fontWeight:500}}>⚡ {prog.methode}</div>}
              {prog.dateDebut && <div style={{fontSize:10,color:"#64748b",marginTop:2}}>Démarré le {prog.dateDebut}</div>}
            </div>
            {jR !== null && jR <= 7 && (
              <div style={{padding:"5px 10px",background:"rgba(224,136,58,0.15)",border:"1px solid rgba(224,136,58,0.3)",borderRadius:8,fontSize:10,color:"#f97316",fontWeight:500,flexShrink:0}}>J-{jR}</div>
            )}
          </Row>

          {/* Analyse morpho IA */}
          {prog.analyse && (prog.analyse.points_forts?.length>0 || prog.analyse.points_faibles?.length>0) && (
            <div style={{marginBottom:12,padding:"10px 12px",background:"#ffffff",border:"0.5px solid #dce8f4",borderRadius:10}}>
              <div style={{fontSize:9,color:"#3b82f6",fontWeight:600,letterSpacing:"1px",textTransform:"uppercase",marginBottom:8}}>🔬 Analyse morphologique</div>
              {prog.analyse.morphotype && <div style={{fontSize:11,color:"#64748b",marginBottom:6,fontStyle:"italic"}}>Morphotype : <span style={{color:C.text,fontWeight:500}}>{prog.analyse.morphotype}</span> · Humérus : {prog.analyse.humerus||"?"} · Fémurs : {prog.analyse.femurs||"?"}</div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {prog.analyse.points_forts?.length>0 && (
                  <div>
                    <div style={{fontSize:9,color:C.green,fontWeight:600,letterSpacing:"0.5px",marginBottom:4}}>✅ POINTS FORTS</div>
                    {prog.analyse.points_forts.map((p,i) => <div key={i} style={{fontSize:10,color:C.text,padding:"2px 0"}}>{p}</div>)}
                  </div>
                )}
                {prog.analyse.points_faibles?.length>0 && (
                  <div>
                    <div style={{fontSize:9,color:C.red,fontWeight:600,letterSpacing:"0.5px",marginBottom:4}}>🎯 À DÉVELOPPER</div>
                    {prog.analyse.points_faibles.map((p,i) => <div key={i} style={{fontSize:10,color:C.text,padding:"2px 0"}}>{p}</div>)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Correction points faibles */}
          {prog.correction?.groupes_prioritaires?.length>0 && (
            <div style={{marginBottom:12,padding:"8px 12px",background:"rgba(249,115,22,0.06)",border:"0.5px solid rgba(249,115,22,0.2)",borderRadius:8}}>
              <div style={{fontSize:9,color:"#f97316",fontWeight:600,letterSpacing:"1px",textTransform:"uppercase",marginBottom:4}}>🔧 Correction prioritaire</div>
              <div style={{fontSize:10,color:C.text}}>{prog.correction.groupes_prioritaires.join(" · ")}</div>
            </div>
          )}

          {/* Fin de cycle */}
          {jR === 0 && (
            <div style={{padding:"12px 14px",background:"rgba(62,199,122,0.1)",border:"1px solid rgba(62,199,122,0.3)",borderRadius:10,marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:500,color:C.green,marginBottom:4}}>🏆 Cycle terminé !</div>
              <div style={{fontSize:11,color:"#64748b",marginBottom:10,lineHeight:1.5}}>Démarrez un nouveau cycle pour continuer votre progression.</div>
              <Btn sm onClick={() => { if(!premium) setPaywall(true); else { setProgView("analyse"); setTab("program"); }}}>Nouveau cycle personnalisé →</Btn>
            </div>
          )}

          {/* ── Sélecteur semaines S1-S6 (CLIQUABLE) ── */}
          <div style={{fontSize:9,color:"#64748b",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:6}}>Planification 6 semaines</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:4,marginBottom:8}}>
            {WEEK_INTENSITY.map((k,w) => {
              const int = INT[k];
              const isSelected = w === currentWeek;
              const isDone = w < semC;
              return (
                <div key={w} onClick={() => setCurrentWeek(w)} style={{
                  padding:"9px 4px",
                  background: isSelected ? `${int.c}20` : isDone ? "rgba(34,197,94,0.1)" : C.s2,
                  border:`1px solid ${isSelected ? int.c : isDone ? "rgba(56,199,117,.25)" : C.s3}`,
                  borderRadius:9,textAlign:"center",cursor:"pointer",
                  transition:"all .12s",
                }}>
                  <div style={{fontSize:9,color:isSelected?int.c:isDone?C.green:C.dim,fontWeight:700,fontFamily:"'Syne',sans-serif"}}>S{w+1}</div>
                  <div style={{width:4,height:4,borderRadius:"50%",background:isSelected?int.c:isDone?"#22c55e":C.dim,margin:"4px auto 0"}}/>
                  {isSelected && <div style={{fontSize:7,color:int.c,marginTop:2,fontWeight:600}}>●</div>}
                </div>
              );
            })}
          </div>

          {/* Badge intensité semaine sélectionnée */}
          {(() => {
            const wi = WEEK_INTENSITY[currentWeek];
            const int = INT[wi];
            return (
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:`${int.c}10`,border:`0.5px solid ${int.c}30`,borderRadius:9,marginBottom:12}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:int.c,flexShrink:0}}/>
                <div>
                  <span style={{fontSize:11,fontWeight:600,color:int.c}}>Semaine {currentWeek+1} — {int.l}</span>
                  <span style={{fontSize:10,color:"#64748b"}}>{currentWeek<2?" · Charges modérées, technique":currentWeek<4?" · Charges lourdes, progression":currentWeek===4?" · Intensité maximale":""}</span>
                </div>
                {currentWeek === semC && <div style={{marginLeft:"auto",fontSize:9,color:int.c,fontWeight:700,background:`${int.c}15`,padding:"2px 6px",borderRadius:5}}>EN COURS</div>}
              </div>
            );
          })()}

          {/* Liste des séances de la semaine sélectionnée */}
          <div style={{fontSize:9,color:"#64748b",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:8}}>Séances — Semaine {currentWeek+1}</div>
          {prog.jours.map((j, i) => {
            const weekIntKey = WEEK_INTENSITY[currentWeek];
            const int = INT[weekIntKey];
            const total = j.exercices?.length || 0;
            const done = j.exercices?.filter((_,idx) => checkedEx[`${j.id}-${idx}`]).length || 0;
            return (
              <Row key={i} onClick={() => setViewJour(i)} style={{
                padding:"11px 13px",background:"#fff",borderRadius:10,marginBottom:6,
                cursor:"pointer",border:`0.5px solid ${int.c}25`,
                borderLeft:`3px solid ${int.c}`,
              }}>
                <div style={{flex:1}}>
                  <div style={{fontSize:9,color:int.c,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:2}}>{int.l}</div>
                  <div style={{fontSize:13,fontWeight:500,color:"#0f1a2e"}}>{j.nom}</div>
                  <div style={{fontSize:10,color:"#64748b"}}>{j.focus} · {total} exercice{total!==1?"s":""}</div>
                </div>
                <Row style={{gap:7,alignItems:"center"}}>
                  {done>0 && <div style={{fontSize:9,color:C.green,fontWeight:700}}>{done}/{total}</div>}
                  {j.complete && <div style={{fontSize:10,color:C.green}}>✓</div>}
                  <div style={{color:"#94a3b8",fontSize:16}}>›</div>
                </Row>
              </Row>
            );
          })}
        </Box>
      )}

      {!prog && (
        <Box style={{textAlign:"center",padding:"24px 20px"}}>
          <div style={{fontSize:13,color:"#64748b",marginBottom:16}}>Créez un programme pour planifier vos séances.</div>
          <Btn onClick={() => { setTab("program"); setProgView("creer"); }}>Créer un programme</Btn>
          <Btn v="out" onClick={() => { if(!premium) setPaywall(true); else { setTab("program"); setProgView("analyse"); }}}>Programme personnalisé ◈</Btn>
        </Box>
      )}
    </div>
  );
}
