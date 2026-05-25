import { useState, memo } from "react";
import { C, INT, SESS_COLORS } from "../../data/constants.js";
import { EX } from "../../data/exercises.js";
import { Box, Lbl, Inp, Btn, Row } from "./index.jsx";

// ─── MODAL MUSCULATION : sélection exercices depuis biblio ───────────────────
function MusculationPicker({ onSave, onClose }) {
  const [step,    setStep]    = useState("type");   // "type" | "groupe" | "liste" | "config"
  const [groupe,  setGroupe]  = useState(null);
  const [search,  setSearch]  = useState("");
  const [seNom,   setSeNom]   = useState("");
  const [intensite,setInt]    = useState("modere");
  const [exos,    setExos]    = useState([]);        // exercices sélectionnés
  const [pendingEx, setPendingEx] = useState(null);  // { nom, cat, group }

  const cc = (cat) => ({principal:"#4D8BFF",correctif:"#FF7A6B",gainage:"#5FE0A5",isolation:"#B69DFF"}[cat||"principal"]||"#4D8BFF");

  const searchList = search
    ? Object.entries(EX).flatMap(([g,arr]) => arr.map(ex => ({nom:ex.n,cat:ex.cat,group:g})))
        .filter(e => e.nom.toLowerCase().includes(search.toLowerCase()))
    : groupe ? (EX[groupe]||[]).map(ex => ({nom:ex.n,cat:ex.cat,group:groupe})) : [];

  const handleAddEx = (ex) => {
    setExos(prev => prev.find(e=>e.nom===ex.nom) ? prev : [...prev, {...ex, series:"4", reps:"10", repos:"90s"}]);
    setGroupe(null); setSearch("");
  };
  const removeEx = (nom) => setExos(prev => prev.filter(e => e.nom !== nom));

  const handleSave = () => {
    const nomFinal = seNom || (exos.length > 0 ? exos.map(e=>e.nom.split(" ")[0]).join("+") : "Séance musculation");
    const color = INT[intensite]?.c || "#4D8BFF";
    onSave({ nom:nomFinal, intensite, color, musculation:{ exercices: exos } });
    onClose();
  };

  return (
    <div style={{maxHeight:"80vh",overflowY:"auto"}}>
      <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:12}}>Séance de musculation</div>

      {/* Nom */}
      <Inp placeholder="Nom de la séance (ex: Push, Dos…)" value={seNom} onChange={e=>setSeNom(e.target.value)} style={{marginBottom:10}}/>

      {/* Intensité */}
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
        {Object.entries(INT).map(([k,v])=>(
          <div key={k} onClick={()=>setInt(k)} style={{padding:"5px 10px",background:intensite===k?`${v.c}20`:C.s2,border:`1px solid ${intensite===k?v.c:C.s3}`,borderRadius:7,cursor:"pointer",fontSize:11,color:intensite===k?v.c:"rgba(245,241,232,0.50)",fontWeight:intensite===k?700:400}}>{v.l}</div>
        ))}
      </div>

      {/* Exercices ajoutés */}
      {exos.length > 0 && (
        <div style={{marginBottom:10}}>
          <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:6}}>Exercices ({exos.length})</div>
          {exos.map((ex,i) => (
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:"#1C2440",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:8,marginBottom:4}}>
              <div style={{width:3,height:24,borderRadius:2,background:cc(ex.cat),flexShrink:0}}/>
              <div style={{flex:1,fontSize:12,color:"#F5F1E8"}}>{ex.nom}</div>
              <div style={{fontSize:10,color:"rgba(245,241,232,0.50)"}}>{ex.series}×{ex.reps}</div>
              <button onClick={()=>removeEx(ex.nom)} style={{background:"transparent",border:"none",color:"#FF7A6B",cursor:"pointer",fontSize:14,padding:"0 2px"}}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Sélecteur bibliothèque */}
      <div style={{border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:10,overflow:"hidden",marginBottom:12}}>
        <div style={{padding:"8px 12px",background:"#1C2440",borderBottom:"0.5px solid rgba(190,180,255,0.07)"}}>
          <div style={{position:"relative"}}>
            <input value={search} onChange={e=>{setSearch(e.target.value);setGroupe(null);}} placeholder="Rechercher ou choisir un groupe…"
              style={{width:"100%",padding:"7px 10px 7px 30px",background:"#141A2E",border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:8,fontSize:12,color:"#F5F1E8",fontFamily:"'Inter',sans-serif",boxSizing:"border-box"}}/>
            <div style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"rgba(245,241,232,0.50)"}}>🔍</div>
          </div>
        </div>

        {/* Groupes musculaires */}
        {!search && (
          <div style={{padding:"8px 10px",display:"flex",flexWrap:"wrap",gap:5,maxHeight:130,overflowY:"auto"}}>
            {Object.keys(EX).map(g=>(
              <button key={g} onClick={()=>setGroupe(g===groupe?null:g)}
                style={{padding:"4px 10px",background:groupe===g?"rgba(59,130,246,0.1)":C.s2,border:`1px solid ${groupe===g?"#4D8BFF":"rgba(190,180,255,0.07)"}`,borderRadius:14,color:groupe===g?"#4D8BFF":"rgba(245,241,232,0.50)",cursor:"pointer",fontSize:10,fontWeight:groupe===g?600:400,fontFamily:"'Inter',sans-serif"}}>
                {g} <span style={{fontSize:9,color:"rgba(245,241,232,0.50)"}}>({(EX[g]||[]).length})</span>
              </button>
            ))}
          </div>
        )}

        {/* Liste exercices */}
        {searchList.length > 0 && (
          <div style={{maxHeight:160,overflowY:"auto",padding:"4px 8px"}}>
            {searchList.map((ex,i)=>(
              <div key={i} onClick={()=>handleAddEx(ex)}
                style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:8,cursor:"pointer",opacity:exos.find(e=>e.nom===ex.nom)?0.4:1,marginBottom:2}}
                onMouseEnter={ev=>ev.currentTarget.style.background="#1C2440"}
                onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
                <div style={{width:3,height:24,borderRadius:2,background:cc(ex.cat),flexShrink:0}}/>
                <div style={{flex:1,fontSize:12,color:"#F5F1E8"}}>{ex.nom}</div>
                <div style={{fontSize:10,color:"#4D8BFF",fontWeight:600}}>{exos.find(e=>e.nom===ex.nom)?"✓":"+ Ajouter"}</div>
              </div>
            ))}
          </div>
        )}
        {!search && !groupe && <div style={{padding:"12px",textAlign:"center",fontSize:11,color:"rgba(245,241,232,0.50)"}}>Sélectionne un groupe musculaire</div>}
      </div>

      <Btn disabled={exos.length===0&&!seNom} onClick={handleSave}>✓ Enregistrer la séance</Btn>
      <Btn v="ghost" onClick={onClose}>Annuler</Btn>
    </div>
  );
}

// ─── MODAL UN JOUR ───────────────────────────────────────────────────────────
export function DayModal({ date, session, onSave, onDelete, onClose }) {
  const [mode,     setMode]    = useState(session ? "view" : "choose"); // "choose"|"libre"|"musculation"|"view"
  const [nom,      setNom]     = useState(session?.nom || "");
  const [intensite,setInt]     = useState(session?.intensite || "modere");
  const [color,    setColor]   = useState(session?.color || SESS_COLORS[0]);

  // ── Vue : séance existante ──
  if (mode === "view") {
    return (
      <div style={{position:"fixed",inset:0,background:"rgba(8,9,14,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:18}}>
        <div style={{background:C.s1,border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:14,padding:"22px 18px",width:"100%",maxWidth:360}}>
          <Lbl>Séance du {date}</Lbl>
          <div style={{padding:"10px 12px",background:C.s2,borderRadius:9,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:13,color:session.color,fontWeight:500}}>{session.nom}</div>
              <div style={{fontSize:10,color:"rgba(245,241,232,0.50)",marginTop:2}}>{INT[session.intensite||"modere"]?.l}</div>
            </div>
            <button onClick={()=>{onDelete();onClose();}} style={{background:"transparent",border:"none",color:"#FF7A6B",cursor:"pointer",fontSize:12,fontWeight:500}}>Supprimer</button>
          </div>
          {session.musculation?.exercices?.length > 0 && (
            <div style={{marginBottom:12}}>
              <div style={{fontSize:9,color:"rgba(245,241,232,0.50)",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",marginBottom:6}}>Exercices</div>
              {session.musculation.exercices.map((ex,i)=>(
                <div key={i} style={{fontSize:11,color:"#F5F1E8",padding:"4px 0",borderBottom:"0.5px solid #1C2440"}}>{ex.nom} <span style={{color:"rgba(245,241,232,0.50)"}}>· {ex.series}×{ex.reps}</span></div>
              ))}
            </div>
          )}
          <Btn v="ghost" onClick={onClose}>Fermer</Btn>
        </div>
      </div>
    );
  }

  // ── Vue : choix du type de séance ──
  if (mode === "choose") {
    return (
      <div style={{position:"fixed",inset:0,background:"rgba(8,9,14,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:18}}>
        <div style={{background:C.s1,border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:14,padding:"22px 18px",width:"100%",maxWidth:380}}>
          <Lbl>Planifier le {date}</Lbl>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            {[
              {id:"musculation", i:"🏋️", l:"Musculation", d:"Sélectionner exercices", color:"#4D8BFF"},
              {id:"libre",       i:"📝", l:"Séance libre", d:"Nommer manuellement",   color:"#B69DFF"},
            ].map(t=>(
              <div key={t.id} onClick={()=>setMode(t.id)} style={{padding:"16px 12px",background:C.s2,border:`0.5px solid ${t.color}30`,borderRadius:12,cursor:"pointer",textAlign:"center"}}>
                <div style={{fontSize:26,marginBottom:6}}>{t.i}</div>
                <div style={{fontSize:12,fontWeight:600,color:t.color,marginBottom:3}}>{t.l}</div>
                <div style={{fontSize:10,color:"rgba(245,241,232,0.50)"}}>{t.d}</div>
              </div>
            ))}
          </div>
          <Btn v="ghost" onClick={onClose}>Annuler</Btn>
        </div>
      </div>
    );
  }

  // ── Vue : séance musculation ──
  if (mode === "musculation") {
    return (
      <div style={{position:"fixed",inset:0,background:"rgba(8,9,14,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:18}}>
        <div style={{background:C.s1,border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:14,padding:"18px 16px",width:"100%",maxWidth:400}}>
          <MusculationPicker
            onSave={(sess)=>onSave(sess)}
            onClose={onClose}
          />
        </div>
      </div>
    );
  }

  // ── Vue : séance libre ──
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(8,9,14,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:18}}>
      <div style={{background:C.s1,border:"0.5px solid rgba(190,180,255,0.07)",borderRadius:14,padding:"22px 18px",width:"100%",maxWidth:360}}>
        <Lbl>Séance du {date}</Lbl>
        <Inp placeholder="Nom de la séance" value={nom} onChange={e=>setNom(e.target.value)}/>
        <Lbl style={{marginTop:4}}>Intensité</Lbl>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
          {Object.entries(INT).map(([k,v])=>(
            <div key={k} onClick={()=>{setInt(k);setColor(v.c);}} style={{padding:"5px 10px",background:intensite===k?`${v.c}20`:C.s2,border:`1px solid ${intensite===k?v.c:C.s3}`,borderRadius:7,cursor:"pointer",fontSize:11,color:intensite===k?v.c:"rgba(245,241,232,0.50)",fontWeight:intensite===k?700:400}}>{v.l}</div>
          ))}
        </div>
        <Lbl>Couleur</Lbl>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          {SESS_COLORS.map(c=>(
            <div key={c} onClick={()=>setColor(c)} style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",outline:color===c?"2px solid white":"none",outlineOffset:2}}/>
          ))}
        </div>
        <Btn disabled={!nom} onClick={()=>{onSave({nom,intensite,color});onClose();}}>✓ Enregistrer</Btn>
        <Btn v="ghost" onClick={()=>setMode("choose")}>← Retour</Btn>
      </div>
    </div>
  );
}

// ─── CALENDRIER MENSUEL ──────────────────────────────────────────────────────
export const MonthCal = memo(function MonthCal({ sessions, onUpdate }) {
  const [date, setDate] = useState(new Date());
  const [modal, setModal] = useState(null);
  const DAYS = ["L","M","M","J","V","S","D"];
  const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const y = date.getFullYear(), m = date.getMonth();
  const first = (new Date(y,m,1).getDay()+6)%7;
  const daysInMonth = new Date(y,m+1,0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const ds = d => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const canGoPrev = y > today.getFullYear() || (y === today.getFullYear() && m > today.getMonth());
  const canGoNext = y < 2027 || (y === 2027 && m < 11);
  return (
    <div>
      <Row style={{justifyContent:"space-between",marginBottom:12}}>
        <button onClick={()=>canGoPrev&&setDate(new Date(y,m-1,1))} disabled={!canGoPrev} style={{background:"transparent",border:"none",color:canGoPrev?"rgba(245,241,232,0.50)":C.dim,cursor:canGoPrev?"pointer":"not-allowed",fontSize:18,padding:"2px 8px"}}>‹</button>
        <div style={{fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",fontSize:18,letterSpacing:-0.3,fontWeight:300}}>{MONTHS[m]} {y}</div>
        <button onClick={()=>canGoNext&&setDate(new Date(y,m+1,1))} disabled={!canGoNext} style={{background:"transparent",border:"none",color:canGoNext?"rgba(245,241,232,0.50)":C.dim,cursor:canGoNext?"pointer":"not-allowed",fontSize:18,padding:"2px 8px"}}>›</button>
      </Row>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {DAYS.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:9,color:C.dim,fontWeight:700,padding:"3px 0"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {[...Array(first)].map((_,i)=><div key={`e${i}`}/>)}
        {[...Array(daysInMonth)].map((_,i)=>{
          const d = i+1, key = ds(d), sess = sessions[key], isToday = key === todayStr;
          return (
            <div key={d} onClick={()=>setModal({date:key,session:sess})} style={{
              aspectRatio:"1",borderRadius:7,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",
              background:sess?sess.color:isToday?"rgba(59,130,246,0.1)":"transparent",
              border:`1px solid ${sess?sess.color:isToday?"#4D8BFF":C.s3}`,
              outline:isToday&&!sess?`1.5px solid #4D8BFF`:undefined,
            }}>
              <div style={{fontSize:10,fontWeight:isToday?600:400,color:sess?"#141A2E":isToday?"#4D8BFF":"#475569",lineHeight:1}}>{d}</div>
              {sess?.musculation && <div style={{fontSize:6,color:"#141A2E",marginTop:1}}>💪</div>}
            </div>
          );
        })}
      </div>
      <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:5}}>
        {Object.entries(INT).map(([k,v])=>(
          <Row key={k} style={{gap:4}}><div style={{width:5,height:5,borderRadius:"50%",background:v.c}}/><span style={{fontSize:9,color:"rgba(245,241,232,0.50)"}}>{v.l}</span></Row>
        ))}
      </div>
      {modal && (
        <DayModal
          date={modal.date} session={modal.session}
          onSave={sess=>onUpdate(modal.date,sess)}
          onDelete={()=>onUpdate(modal.date,null)}
          onClose={()=>setModal(null)}
        />
      )}
    </div>
  );
});
