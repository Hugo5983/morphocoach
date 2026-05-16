import { useState, useRef } from "react";
import { Box, Lbl, Inp, Btn, G2, Tag } from "../components/ui/index.jsx";
import {
  buildPrompt,
  callGenerateAPI,
  parseAIResponse,
  buildProgramFromAI,
  buildCalendarFromProgram,
  summarizeProgramLoads,
  LOAD_MESSAGES,
} from "../services/aiService.js";

// ─── ANALYSEIA ──────────────────────────────────────────────────────────────
// Wizard 5 étapes. Toute la logique métier (prompt IA, API, parsing) est
// déléguée à services/aiService.js. Ce composant gère uniquement l'UI.

export default function AnalyseIA(props) {
  const {
    profil, photos, setPhotos, readFile,
    C, INT,
    loadIA, setLoadIA, loadMsg, setLoadMsg,
    corrigerFaibles, setCorrigerFaibles,
    setProg, setCycleStart, setCalSess,
    setProgView, setTab,
    cycles, setCycles, prog,
    push,
  } = props;

  const [aStep, setAStep] = useState(0);
  const [form, setForm] = useState({
    prenom: profil?.prenom || "",
    age: profil?.age || "",
    poids: profil?.poids || "",
    taille: profil?.taille || "",
    sexe: profil?.sexe || "",
    metier: "",
    niveau: "",
    jours: [],
    objectif: profil?.objectif || "",
    objectifPrecis: "",
    materiel: [],
    pathologies: [],
    sport: "",
  });

  const fileRefFace   = useRef();
  const fileRefDos    = useRef();
  const fileRefProfil = useRef();

  // ─── Génération IA (orchestre les services) ─────────────────────────────
  const lancerIA = async () => {
    setLoadIA(true);
    let mi = 0;
    setLoadMsg(LOAD_MESSAGES[0]);
    const interval = setInterval(() => {
      mi = (mi + 1) % LOAD_MESSAGES.length;
      setLoadMsg(LOAD_MESSAGES[mi]);
    }, 2200);

    try {
      const promptText = buildPrompt({ form, photos, cycles, corrigerFaibles });
      const rawText = await callGenerateAPI({
        photos: [photos.face, photos.dos, photos.profil],
        promptText,
      });
      const parsed = parseAIResponse(rawText);
      const np = buildProgramFromAI(parsed, { form, cycles });

      // Archiver l'ancien cycle
      if (prog && setCycles) {
        setCycles((prev) => [...prev, {
          ...prog,
          archiveDate: new Date().toLocaleDateString("fr-FR"),
          chargesResume: summarizeProgramLoads(prog),
        }]);
      }

      setProg(np);
      setCycleStart(Date.now());
      setAStep(0);
      setPhotos({ face: null, dos: null, profil: null });

      const newSess = buildCalendarFromProgram(np, INT);
      setCalSess((prev) => ({ ...prev, ...newSess }));

      if (setProgView) setProgView("today");
      if (setTab) setTab("program");

      const pts = np.analyse?.points_faibles?.join(", ") || "";
      push("🎯", `Programme Cycle ${np.numero} créé !`,
           pts ? `Points faibles: ${pts}` : "Votre programme est prêt !");
    } catch (e) {
      console.error("lancerIA error:", e);
      setLoadMsg(`Erreur: ${e.message}`);
      setTimeout(() => {
        setLoadIA(false);
        push("❌", "Échec", e.message?.substring(0, 80) || "Réessayez.");
      }, 2000);
    } finally {
      clearInterval(interval);
      setLoadIA(false);
    }
  };


  if (loadIA) return (
    <div style={{padding:"0 15px"}} className="fade-in">
      {loadMsg.startsWith("Erreur") ? (
        <Box style={{textAlign:"center",padding:"40px 20px"}} className="scale-in">
          <div style={{fontSize:40,marginBottom:14}}>❌</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,color:C.red,fontWeight:500,marginBottom:10}}>Génération échouée</div>
          <div style={{fontSize:12,color:"#64748b",marginBottom:20,lineHeight:1.6}}>{loadMsg}</div>
          <Btn onClick={()=>{setLoadIA(false);setLoadMsg("");}}>← Réessayer</Btn>
        </Box>
      ) : (
        <div>
          <Box style={{textAlign:"center",padding:"32px 20px 24px"}} className="slide-up">
            <div style={{width:56,height:56,border:`3px solid ${C.goldD}`,borderTop:`3px solid ${C.gold}`,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 20px"}}/>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,color:C.gold,fontWeight:300,marginBottom:6,letterSpacing:"0.5px"}}>{loadMsg}</div>
            <div style={{fontSize:11,color:"#64748b",lineHeight:1.8}}>Analyse morphologique + génération<br/>du programme personnalisé…</div>
          </Box>
          {[1,2,3].map(i=>(
            <Box key={i} className="slide-up" style={{padding:"18px 16px",marginBottom:9,animationDelay:`${i*0.08}s`}}>
              <div className="skeleton" style={{height:10,width:"40%",marginBottom:12}}/>
              <div className="skeleton" style={{height:8,width:"90%",marginBottom:8}}/>
              <div className="skeleton" style={{height:8,width:"75%",marginBottom:8}}/>
              <div className="skeleton" style={{height:8,width:"60%"}}/>
            </Box>
          ))}
        </div>
      )}
    </div>
  );

  const steps = ["Photo","Profil","Objectif","Pathologies","Matériel"];
  return (
    <div style={{padding:"0 15px"}}>
      <div style={{display:"flex",gap:3,marginBottom:14}}>
        {steps.map((_,i)=><div key={i} style={{flex:1,height:2,borderRadius:1,background:i<=aStep?C.gold:"rgba(255,255,255,0.07)"}}/>)}
      </div>
      <div style={{fontSize:10,color:"#64748b",marginBottom:12,letterSpacing:"0.5px"}}>ÉTAPE {aStep+1}/{steps.length} — {steps[aStep].toUpperCase()}</div>

      {aStep===0 && <Box>
        <Lbl>Photos de posture</Lbl>
        <div style={{padding:"10px 12px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:8,fontSize:12,color:"#64748b",marginBottom:14,lineHeight:1.6}}>
          📸 3 photos permettent une analyse morphologique précise. Position droite, vêtements près du corps. Vous pouvez utiliser votre galerie ou prendre de nouvelles photos.
        </div>
        {[
          {key:"face",   label:"De face",   icon:"🧍", desc:"Face à l'objectif, bras le long du corps"},
          {key:"dos",    label:"De dos",    icon:"🔄", desc:"Dos à l'objectif, bras le long du corps"},
          {key:"profil", label:"De profil", icon:"↔️", desc:"Côté droit ou gauche, position droite"},
        ].map(({key,label,icon,desc})=>(
          <div key={key} style={{marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:500,color:photos[key]?C.green:C.text,marginBottom:5,display:"flex",alignItems:"center",gap:6}}>
              {photos[key] ? <span style={{color:C.green}}>✓</span> : <span style={{opacity:0.4}}>○</span>}
              {label}
            </div>
            <div onClick={()=>{
              const ref={face:fileRefFace,dos:fileRefDos,profil:fileRefProfil}[key];
              ref.current?.click();
            }} style={{border:`1.5px dashed ${photos[key]?"rgba(62,199,122,0.4)":C.goldB}`,borderRadius:10,height:120,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",background:C.s2,position:"relative"}}>
              {photos[key]
                ? <img src={photos[key]} alt={label} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <>
                    <div style={{fontSize:28,marginBottom:4}}>{icon}</div>
                    <div style={{fontSize:11,color:C.gold,fontWeight:600}}>Galerie ou appareil photo</div>
                    <div style={{fontSize:10,color:"#64748b",marginTop:2,textAlign:"center",padding:"0 10px"}}>{desc}</div>
                  </>
              }
              {photos[key]&&(
                <div style={{position:"absolute",top:6,right:6,background:"rgba(8,9,13,0.7)",borderRadius:6,padding:"3px 8px",fontSize:10,color:C.green,fontWeight:700}}>✓ {label}</div>
              )}
            </div>
          </div>
        ))}
        <input ref={fileRefFace}   type="file" accept="image/*" style={{display:"none"}} onChange={e=>readFile("face",  e.target.files[0])}/>
        <input ref={fileRefDos}    type="file" accept="image/*" style={{display:"none"}} onChange={e=>readFile("dos",   e.target.files[0])}/>
        <input ref={fileRefProfil} type="file" accept="image/*" style={{display:"none"}} onChange={e=>readFile("profil",e.target.files[0])}/>
        <div style={{marginTop:6,marginBottom:10,fontSize:11,color:"#64748b",textAlign:"center"}}>
          {[photos.face,photos.dos,photos.profil].filter(Boolean).length}/3 photos ajoutées
          {photos.face&&photos.dos&&photos.profil&&<span style={{color:C.green,marginLeft:6,fontWeight:700}}>✓ Prêt !</span>}
        </div>
        <Btn disabled={!photos.face&&!photos.dos&&!photos.profil} onClick={()=>setAStep(1)}>
          {photos.face||photos.dos||photos.profil ? "Continuer →" : "Ajoutez au moins 1 photo"}
        </Btn>
      </Box>}

      {aStep===1 && <Box>
        <Lbl>Profil</Lbl>
        <div style={{fontSize:10,color:C.red,marginBottom:10}}>* Champs obligatoires</div>
        <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>Prénom <span style={{color:C.textMid}}>(facultatif)</span></div>
        <Inp placeholder="Prénom" value={form.prenom} onChange={e=>setForm({...form,prenom:e.target.value})}/>
        <G2>
          <div>
            <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>Âge <span style={{color:C.red}}>*</span></div>
            <Inp type="number" placeholder="Ex: 28" style={{marginBottom:0}} value={form.age} onChange={e=>setForm({...form,age:e.target.value})}/>
          </div>
          <div>
            <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>Sexe <span style={{color:C.red}}>*</span></div>
            <select style={{width:"100%",padding:"11px 13px",background:C.s2,border:`1px solid ${form.sexe?C.green:C.s3}`,borderRadius:9,color:C.text,fontSize:13}} value={form.sexe} onChange={e=>setForm({...form,sexe:e.target.value})}>
              <option value="">Choisir…</option><option value="homme">Homme</option><option value="femme">Femme</option>
            </select>
          </div>
        </G2>
        <G2 style={{marginTop:6}}>
          <div>
            <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>Poids (kg) <span style={{color:C.red}}>*</span></div>
            <Inp type="number" placeholder="Ex: 75" style={{marginBottom:0,borderColor:form.poids?C.green:C.s3}} value={form.poids} onChange={e=>setForm({...form,poids:e.target.value})}/>
          </div>
          <div>
            <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>Taille (cm) <span style={{color:C.red}}>*</span></div>
            <Inp type="number" placeholder="Ex: 178" style={{marginBottom:0,borderColor:form.taille?C.green:C.s3}} value={form.taille} onChange={e=>setForm({...form,taille:e.target.value})}/>
          </div>
        </G2>
        <div style={{fontSize:11,color:"#64748b",marginBottom:6,marginTop:6}}>Niveau <span style={{color:C.red}}>*</span></div>
        {[{id:"debutant",l:"Débutant",d:"< 1 an"},{id:"intermediaire",l:"Intermédiaire",d:"1-3 ans"},{id:"avance",l:"Avancé",d:"> 3 ans"}].map(n=>(
          <div key={n.id} onClick={()=>setForm({...form,niveau:n.id})} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:form.niveau===n.id?C.goldD:C.s2,border:`1px solid ${form.niveau===n.id?C.gold:C.s3}`,borderRadius:9,cursor:"pointer",marginBottom:6}}>
            <span style={{fontSize:13,fontWeight:600}}>{n.l}</span><span style={{fontSize:10,color:"#64748b"}}>{n.d}</span>
          </div>
        ))}
        {(!form.age||!form.poids||!form.taille||!form.sexe||!form.niveau)&&(
          <div style={{padding:"8px 12px",background:"rgba(224,72,72,0.08)",border:"1px solid rgba(224,72,72,0.2)",borderRadius:8,fontSize:11,color:C.red,marginBottom:8}}>
            Remplis tous les champs marqués * pour continuer
          </div>
        )}
        <Btn disabled={!form.age||!form.poids||!form.taille||!form.sexe||!form.niveau} onClick={()=>setAStep(2)}>Continuer →</Btn>
        <Btn v="ghost" onClick={()=>setAStep(0)}>← Retour</Btn>
      </Box>}

      {aStep===2 && <Box>
        <div style={{fontSize:11,color:"#64748b",marginBottom:8}}>Objectif principal <span style={{color:C.red}}>*</span></div>
        <G2>{[{id:"hypertrophie",i:"💪",l:"Prise de muscle"},{id:"force",i:"🏋️",l:"Force"},{id:"poids",i:"🔥",l:"Perte de poids"},{id:"reathletisation",i:"🩺",l:"Réathlé"},{id:"sante",i:"❤️",l:"Santé"},{id:"performance",i:"🏆",l:"Performance"}].map(o=>(
          <div key={o.id} onClick={()=>setForm({...form,objectif:o.id})} style={{padding:"12px 8px",textAlign:"center",cursor:"pointer",background:form.objectif===o.id?C.goldD:C.s2,border:`1px solid ${form.objectif===o.id?C.gold:C.s3}`,borderRadius:10}}>
            <div style={{fontSize:20,marginBottom:4}}>{o.i}</div><div style={{fontSize:11,fontWeight:400}}>{o.l}</div>
          </div>
        ))}</G2>
        <textarea style={{width:"100%",padding:"11px 13px",background:C.s2,border:"0.5px solid #dce8f4",borderRadius:9,color:C.text,fontSize:13,minHeight:60,resize:"vertical",marginBottom:10,fontFamily:"'Inter',sans-serif"}} placeholder="Décrivez votre objectif précis (facultatif)" value={form.objectifPrecis} onChange={e=>setForm({...form,objectifPrecis:e.target.value})}/>
        <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>Jours d'entraînement <span style={{color:C.red}}>*</span></div>
        <div style={{display:"flex",flexWrap:"wrap",marginBottom:6}}>
          {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(j=>(
            <Tag key={j} active={form.jours.includes(j)} onClick={()=>setForm(f=>({...f,jours:f.jours.includes(j)?f.jours.filter(x=>x!==j):[...f.jours,j]}))}>{j}</Tag>
          ))}
        </div>
        {form.jours.length===0&&<div style={{fontSize:11,color:C.red,marginBottom:8}}>* Sélectionne au moins 1 jour</div>}
        {!form.objectif&&<div style={{fontSize:11,color:C.red,marginBottom:8}}>* Sélectionne un objectif</div>}
        <Btn disabled={!form.objectif||form.jours.length===0} onClick={()=>setAStep(3)}>Continuer →</Btn>
        <Btn v="ghost" onClick={()=>setAStep(1)}>← Retour</Btn>
      </Box>}

      {aStep===3 && <Box>
        <Lbl>Douleurs & Pathologies</Lbl>
        <div style={{padding:"8px 10px",background:"rgba(59,130,246,0.08)",border:"0.5px solid rgba(59,130,246,0.2)",borderRadius:7,fontSize:11,color:"#64748b",marginBottom:10,lineHeight:1.6}}>Exercices correctifs = renforcement uniquement. Consultez un kiné pour tout diagnostic.</div>
        {[{z:"Dos",p:["Lombalgie","Hernie discale","Scoliose","Cervicalgie"]},{z:"Épaule",p:["Conflit épaule","Coiffe rotateurs"]},{z:"Genou",p:["Ménisque","LCA","Tendinite","Arthrose"]},{z:"Autres",p:["Épicondylite","Canal carpien","Tendinite Achille","Coxarthrose"]}].map(zone=>(
          <div key={zone.z} style={{marginBottom:10}}>
            <div style={{fontSize:9,color:C.dim,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{zone.z}</div>
            <div style={{display:"flex",flexWrap:"wrap"}}>{zone.p.map(p=><Tag key={p} active={form.pathologies.includes(p)} onClick={()=>setForm(f=>({...f,pathologies:f.pathologies.includes(p)?f.pathologies.filter(x=>x!==p):[...f.pathologies.filter(x=>x!=="Aucune"),p]}))}>{p}</Tag>)}</div>
          </div>
        ))}
        <Tag active={form.pathologies.includes("Aucune")} onClick={()=>setForm(f=>({...f,pathologies:["Aucune"]}))}>Aucune pathologie</Tag>
        <div style={{marginTop:10}}><Btn disabled={form.pathologies.length===0} onClick={()=>setAStep(4)}>Continuer →</Btn><Btn v="ghost" onClick={()=>setAStep(2)}>← Retour</Btn></div>
      </Box>}

      {aStep===4 && <Box>
        <div style={{fontSize:11,color:"#64748b",marginBottom:8}}>Matériel disponible <span style={{color:C.red}}>*</span></div>
        <G2>{[{id:"salle_complete",i:"🏋️",l:"Salle complète"},{id:"halteres",i:"💪",l:"Haltères"},{id:"elastiques",i:"🎯",l:"Élastiques"},{id:"barre_traction",i:"⬆️",l:"Barre traction"},{id:"poids_corps",i:"🤸",l:"Poids du corps"},{id:"machines",i:"⚙️",l:"Machines"}].map(m=>(
          <div key={m.id} onClick={()=>setForm(f=>({...f,materiel:f.materiel.includes(m.id)?f.materiel.filter(x=>x!==m.id):[...f.materiel,m.id]}))} style={{padding:"12px 8px",textAlign:"center",cursor:"pointer",background:form.materiel.includes(m.id)?"rgba(59,130,246,0.08)":C.s2,border:`1px solid ${form.materiel.includes(m.id)?"#3b82f6":C.s3}`,borderRadius:10}}>
            <div style={{fontSize:20,marginBottom:4}}>{m.i}</div><div style={{fontSize:11,fontWeight:400}}>{m.l}</div>
          </div>
        ))}</G2>
        <div onClick={()=>setCorrigerFaibles(v=>!v)} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:corrigerFaibles?"rgba(59,130,246,0.06)":"#f8fafc",border:`0.5px solid ${corrigerFaibles?"#3b82f6":"#dce8f4"}`,borderRadius:10,cursor:"pointer",marginTop:10,transition:"all.15s"}}>
          <div style={{width:20,height:20,borderRadius:5,background:corrigerFaibles?"#3b82f6":"transparent",border:`1.5px solid ${corrigerFaibles?"#3b82f6":"#64748b"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all.15s"}}>
            {corrigerFaibles&&<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>}
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:500,color:C.text}}>Corriger mes points faibles</div>
            <div style={{fontSize:10,color:"#64748b",marginTop:1}}>L'IA priorisera les groupes musculaires en retard détectés sur les photos</div>
          </div>
        </div>
        {form.materiel.length===0&&<div style={{fontSize:11,color:C.red,marginBottom:8,marginTop:6}}>* Sélectionne au moins un équipement</div>}
        <Btn disabled={form.materiel.length===0} onClick={lancerIA} style={{marginTop:10}}>🚀 Générer mon programme</Btn>
        <Btn v="ghost" onClick={()=>setAStep(3)}>← Retour</Btn>
      </Box>}
    </div>
  );
}
