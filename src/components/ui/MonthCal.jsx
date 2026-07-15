import { catColor } from"../../utils/training.js";
import { useState, memo, useMemo } from"react";
import { C, DARK, INT, SERIF, SESS_COLORS } from"../../data/constants.js";
import { EX } from"../../data/exercises.js";
import { Inp, Btn } from"./index.jsx";

const DISPLAY ="'Archivo',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const NUM     = { fontVariantNumeric:'tabular-nums', fontFeatureSettings:'"tnum"' };
const ey      = { fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:'uppercase', color:C.accent, fontFamily:DISPLAY };

function I({name,size=18,color='currentColor',stroke=1.7}){
  const p={width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:color,strokeWidth:stroke,strokeLinecap:'round',strokeLinejoin:'round'};
  const paths={
    chevL:<path d="m15 18-6-6 6-6"/>,
    chevR:<path d="m9 6 6 6-6 6"/>,
    x:<path d="M18 6 6 18M6 6l12 12"/>,
    check:<path d="M20 6 9 17l-5-5"/>,
    plus:<path d="M12 5v14M5 12h14"/>,
    dumbbell:<><path d="M6.5 6.5 17.5 17.5M4 8l4-4M16 20l4-4M2 10l2-2M20 16l2-2M9 4l3 3M15 17l3 3"/></>,
    run:<><path d="M13 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/><path d="M7.5 17.5 9 13l2.5 2.5L14 10l3.5 5"/><path d="M6 13l1-4 3 1"/></>,
    yoga:<><circle cx="12" cy="4" r="1"/><path d="M4 17c3-1 5-3 8-3s5 2 8 3M12 5v6l3 3-3 3-3-3 3-3"/></>,
    trophy:<><path d="M6 9H4a2 2 0 0 0 0 4h2M18 9h2a2 2 0 0 0 0-4h-2M8 21h8M12 17v4M6 3h12v10a6 6 0 0 1-12 0V3Z"/></>,
    trash:<><path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></>,
  };
  return <svg {...p}>{paths[name]}</svg>;
}

// ─── MUSCULATION PICKER ───────────────────────────────────────────────────────
function MusculationPicker({ onSave, onClose }) {
  const [groupe,   setGroupe]   = useState(null);
  const [search,   setSearch]   = useState("");
  const [seNom,    setSeNom]    = useState("");
  const [intensite,setInt]      = useState("modere");
  const [exos,     setExos]     = useState([]);
  const cc = catColor;
  const searchList = search
    ? Object.entries(EX).flatMap(([,arr]) => arr.map(ex => ({nom:ex.n,cat:ex.cat}))).filter(e=>e.nom.toLowerCase().includes(search.toLowerCase()))
    : groupe ? (EX[groupe]||[]).map(ex => ({nom:ex.n,cat:ex.cat})) : [];
  return (
    <div>
      <div style={{...ey,color:C.accent,marginBottom:12}}>Musculation</div>
      <Inp placeholder="Nom de la séance (ex: Push, Pull…)" value={seNom} onChange={e=>setSeNom(e.target.value)} style={{marginBottom:12}}/>
      <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:12}}>
        {Object.entries(INT).map(([k,v])=>(
          <button key={k} onClick={()=>setInt(k)} style={{padding:'4px 12px',background:intensite===k?`${v.c}20`:C.s2,border:`1px solid ${intensite===k?v.c:'rgba(0,0,0,0.05)'}`,borderRadius:8,cursor:'pointer',fontSize:11,color:intensite===k?v.c:C.mid,fontWeight:intensite===k?700:400,fontFamily:DISPLAY}}>{v.l}</button>
))}
      </div>
      {exos.length>0&&(
        <div style={{marginBottom:12}}>
          {exos.map((ex,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:C.s2,borderRadius:8,marginBottom:4}}>
              <div style={{width:3,height:20,borderRadius:2,background:cc(ex.cat),flexShrink:0}}/>
              <div style={{flex:1,fontSize:13,color:C.text}}>{ex.nom}</div>
              <button onClick={()=>setExos(p=>p.filter(e=>e.nom!==ex.nom))} style={{background:'transparent',border:'none',color:'#E5484D',cursor:'pointer',padding:0}}><I name="x" size={14} stroke={2}/></button>
            </div>
))}
        </div>
)}
      <div style={{border:'1px solid rgba(0,0,0,0.05)',borderRadius:12,overflow:'hidden',marginBottom:12}}>
        <div style={{padding:'8px',background:C.s2}}>
          <input value={search} onChange={e=>{setSearch(e.target.value);setGroupe(null);}} placeholder="Rechercher un exercice…"
            style={{width:'100%',padding:'8px 12px',background:'rgba(0,0,0,0.05)',border:'1px solid rgba(0,0,0,0.05)',borderRadius:8,fontSize:13,color:C.text,fontFamily:DISPLAY,outline:'none',boxSizing:'border-box'}}/>
        </div>
        {!search&&(
          <div style={{padding:'8px',display:'flex',flexWrap:'wrap',gap:4,maxHeight:110,overflowY:'auto'}}>
            {Object.keys(EX).map(g=>(
              <button key={g} onClick={()=>setGroupe(g===groupe?null:g)} style={{padding:'4px 8px',background:groupe===g?'rgba(60,91,255,0.12)':C.s2,border:`1px solid ${groupe===g?C.accent:'rgba(0,0,0,0.05)'}`,borderRadius:12,color:groupe===g?C.accent:C.mid,cursor:'pointer',fontSize:10,fontFamily:DISPLAY}}>
                {g} <span style={{fontSize:8.5,opacity:0.6}}>({(EX[g]||[]).length})</span>
              </button>
))}
          </div>
)}
        {searchList.length>0&&(
          <div style={{maxHeight:150,overflowY:'auto',padding:'4px 8px'}}>
            {searchList.map((ex,i)=>(
              <div key={i} onClick={()=>{if(!exos.find(e=>e.nom===ex.nom))setExos(p=>[...p,{...ex,series:'4',reps:'10'}]);setSearch('');setGroupe(null);}}
                style={{display:'flex',alignItems:'center',gap:8,padding:'8px 8px',borderRadius:8,cursor:'pointer',opacity:exos.find(e=>e.nom===ex.nom)?0.4:1}}
                onMouseEnter={ev=>ev.currentTarget.style.background=C.s2}
                onMouseLeave={ev=>ev.currentTarget.style.background='transparent'}>
                <div style={{width:3,height:20,borderRadius:2,background:cc(ex.cat),flexShrink:0}}/>
                <div style={{flex:1,fontSize:13,color:C.text}}>{ex.nom}</div>
                <div style={{fontSize:10,color:C.accent,fontWeight:600}}>{exos.find(e=>e.nom===ex.nom)?'':'+'}</div>
              </div>
))}
          </div>
)}
        {!search&&!groupe&&<div style={{padding:'12px',textAlign:'center',fontSize:11,color:C.mid}}>Sélectionne un groupe musculaire</div>}
      </div>
      <Btn disabled={exos.length===0&&!seNom} onClick={()=>{const color=INT[intensite]?.c||'#3C5BFF';onSave({nom:seNom||(exos.map(e=>e.nom.split('')[0]).join('+')||'Musculation'),intensite,color,musculation:{exercices:exos}});onClose();}}> Enregistrer</Btn>
      <Btn v="ghost" onClick={onClose} style={{marginTop:8}}>Annuler</Btn>
    </div>
);
}

// ─── BONUS TYPES ──────────────────────────────────────────────────────────────
const BONUS = [
  { id:'cardio',   icon:'run',    label:'Cardio',               color:C.accent, desc:'Course, vélo, rameur…',        suggestions:['Course à pied','Vélo','Rameur','Elliptique','HIIT','Tapis roulant'] },
  { id:'mobility', icon:'yoga',   label:'Mobilité & Étirements', color:'#12B76A', desc:'Yoga, stretching, récupération', suggestions:['Yoga','Stretching','Foam rolling','Récupération active','Pilates','Mobilité'] },
  { id:'sport',    icon:'trophy', label:'Autre sport',           color:'#F59E0B', desc:'Natation, tennis, foot…',        suggestions:['Natation','Tennis','Football','Basketball','Boxe','Escalade','Padel'] },
];

function BonusForm({ type, onSave, onBack }) {
  const [nom,   setNom]   = useState('');
  const [duree, setDuree] = useState(30);
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
        <div style={{width:44,height:44,borderRadius:12,background:`${type.color}15`,border:`1px solid ${type.color}35`,display:'grid',placeItems:'center',flexShrink:0}}>
          <I name={type.icon} size={20} color={type.color} stroke={1.8}/>
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:DISPLAY}}>{type.label}</div>
          <div style={{fontSize:11,color:C.mid,marginTop:1}}>{type.desc}</div>
        </div>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:12}}>
        {type.suggestions.map(s=>(
          <button key={s} onClick={()=>setNom(s)} style={{padding:'4px 12px',background:nom===s?`${type.color}18`:C.s2,border:`1px solid ${nom===s?type.color:'rgba(0,0,0,0.05)'}`,borderRadius:999,cursor:'pointer',fontSize:11,color:nom===s?type.color:C.mid,fontFamily:DISPLAY,fontWeight:nom===s?700:400}}>{s}</button>
))}
      </div>
      <Inp placeholder="Ou saisir manuellement…" value={nom} onChange={e=>setNom(e.target.value)} style={{marginBottom:12}}/>
      <div style={{...ey,marginBottom:8}}>Durée</div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
        <button onClick={()=>setDuree(d=>Math.max(10,d-5))} style={{width:34,height:34,borderRadius:8,background:C.s2,border:`1px solid rgba(0,0,0,0.05)`,cursor:'pointer',fontSize:20,color:C.mid,fontFamily:DISPLAY}}>−</button>
        <div style={{flex:1,textAlign:'center',fontFamily:DISPLAY,fontSize:26,fontWeight:700,color:C.text,...NUM}}>{duree}<span style={{fontSize:13,fontWeight:400,color:C.mid,marginLeft:4}}>min</span></div>
        <button onClick={()=>setDuree(d=>Math.min(180,d+5))} style={{width:34,height:34,borderRadius:8,background:`${type.color}18`,border:`1px solid ${type.color}40`,cursor:'pointer',fontSize:20,color:type.color,fontFamily:DISPLAY}}>+</button>
      </div>
      <div style={{display:'flex',gap:4,marginBottom:16}}>
        {[15,20,30,45,60,90].map(d=>(
          <button key={d} onClick={()=>setDuree(d)} style={{flex:1,padding:'4px 2px',background:duree===d?`${type.color}14`:'transparent',border:`1px solid ${duree===d?type.color:'rgba(0,0,0,0.05)'}`,borderRadius:8,color:duree===d?type.color:C.mid,cursor:'pointer',fontSize:10,fontFamily:DISPLAY,fontWeight:duree===d?700:400}}>{d}'</button>
))}
      </div>
      <Btn disabled={!nom} onClick={()=>onSave({nom:`${nom} · ${duree}min`,intensite:type.id==='mobility'?'leger':'modere',color:type.color,bonus:{type:type.id,duree,label:nom}})}> Ajouter à ce jour</Btn>
      <button onClick={onBack} style={{width:'100%',marginTop:8,padding:'8px',background:'transparent',border:'none',color:C.mid,cursor:'pointer',fontSize:13,fontFamily:DISPLAY}}><I name="chevronLeft" size={14}/> Retour</button>
    </div>
);
}

// ─── DAY MODAL (bottom sheet) ─────────────────────────────────────────────────
export function DayModal({ date, sessions, onSave, onDelete, onToggleDone, onClose }) {
  const allSess = Array.isArray(sessions) ? sessions : (sessions ? [sessions] : []);
  const [step,          setStep]          = useState('main');
  const [selectedBonus, setSelectedBonus] = useState(null);

  const fmtDate = (d) => {
    try { return new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'}); }
    catch { return d; }
  };

  const overlay = { position:'fixed',inset:0,background:'rgba(6,9,20,0.85)',display:'flex',alignItems:'flex-end',justifyContent:'center',zIndex:300 };
  const sheet   = { background:C.s1,border:`1px solid ${C.bd}`,borderRadius:'20px 20px 0 0',padding:'12px 20px 32px',width:'100%',maxWidth:480,maxHeight:'90vh',overflowY:'auto' };
  const handle  = <div style={{width:36,height:4,borderRadius:2,background:'rgba(0,0,0,0.08)',margin:'0 auto 16px'}}/>;

  // ── Musculation step ──
  if (step==='musculation') return (
    <div style={overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={sheet}>
        {handle}
        <MusculationPicker onSave={sess=>{onSave(sess);onClose();}} onClose={()=>setStep('main')}/>
      </div>
    </div>
);

  // ── Bonus step ──
  if (step==='bonus'&&selectedBonus) return (
    <div style={overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={sheet}>
        {handle}
        <BonusForm type={selectedBonus} onSave={sess=>{onSave(sess);onClose();}} onBack={()=>setStep('main')}/>
      </div>
    </div>
);

  // ── Main step ──
  return (
    <div style={overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={sheet}>
        {handle}
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <div>
            <div style={{...ey,marginBottom:4}}>Planning</div>
            <div style={{fontFamily:DISPLAY,fontSize:14,fontWeight:700,color:C.text,textTransform:'capitalize'}}>{fmtDate(date)}</div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(170,180,255,0.25)',color:C.mid,cursor:'pointer',display:'grid',placeItems:'center'}}>
            <I name="x" size={14} stroke={2}/>
          </button>
        </div>

        {/* Existing sessions */}
        {allSess.length>0&&(
          <div style={{marginBottom:16}}>
            <div style={{...ey,marginBottom:8}}>Séances planifiées</div>
            {allSess.map((sess,i)=>{
              const col = INT[sess.intensite||'modere']?.c || sess.color || C.accent;
              return (
              <div key={i} style={{padding:'12px 12px',background:sess.done?`${col}14`:C.s2,borderRadius:12,marginBottom:8,borderLeft:`3px solid ${col}`,border:sess.done?`1px solid ${col}40`:'1px solid transparent'}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      {sess.done&&<div style={{width:15,height:15,borderRadius:5,background:col,display:'grid',placeItems:'center',flexShrink:0}}><I name="check" size={9} stroke={3.2} color="#FFF"/></div>}
                      <div style={{fontSize:13,fontWeight:600,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sess.nom}</div>
                    </div>
                    <div style={{fontSize:11,color:C.mid,marginTop:2}}>{INT[sess.intensite||'modere']?.l}{sess.bonus?` · ${sess.bonus.duree}min`:''}{sess.done?' · Validée':''}</div>
                  </div>
                  <button onClick={()=>onDelete(i)} style={{background:'transparent',border:'none',color:'rgba(229,72,77,0.65)',cursor:'pointer',padding:'4px',flexShrink:0,display:'grid',placeItems:'center'}}>
                    <I name="trash" size={14} stroke={1.8}/>
                  </button>
                </div>
                {onToggleDone&&(
                  <button onClick={()=>onToggleDone(i)} style={{
                    width:'100%',marginTop:8,padding:'8px',borderRadius:8,cursor:'pointer',fontFamily:DISPLAY,fontSize:13,fontWeight:700,
                    display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                    background:sess.done?'transparent':col,
                    border:sess.done?`1px solid ${C.bd}`:`1px solid ${col}`,
                    color:sess.done?C.mid:'#FFF',
                  }}>
                    {sess.done ?<><I name="refresh" size={14} stroke={2} color="#FFF"/> Reprendre la séance</> : <><I name="check" size={14} stroke={2.4} color="#FFF"/> Terminer la séance</>}
                  </button>
)}
              </div>
);})}
          </div>
)}

        {/* Add session */}
        <div style={{...ey,marginBottom:12}}>{allSess.length>0?'Ajouter une séance':'Planifier ce jour'}</div>

        {/* Musculation CTA */}
        <button onClick={()=>setStep('musculation')} style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'12px 16px',background:C.s2,border:`1px solid rgba(60,91,255,0.25)`,borderRadius:16,cursor:'pointer',marginBottom:12,textAlign:'left'}}>
          <div style={{width:44,height:44,borderRadius:12,background:'rgba(60,91,255,0.12)',display:'grid',placeItems:'center',flexShrink:0}}>
            <I name="dumbbell" size={20} color={C.accent} stroke={1.8}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:DISPLAY}}>Musculation</div>
            <div style={{fontSize:11,color:C.mid,marginTop:1}}>Exercices, séries, charges</div>
          </div>
          <I name="chevR" size={14} color={C.dim} stroke={2}/>
        </button>

        {/* Séances bonus */}
        <div style={{...ey,marginBottom:8,marginTop:4}}>Séances bonus</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          {BONUS.map(t=>(
            <button key={t.id} onClick={()=>{setSelectedBonus(t);setStep('bonus');}} style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'16px 8px',background:C.s2,border:`1px solid ${t.color}22`,borderRadius:16,cursor:'pointer',gap:8,textAlign:'center'}}>
              <div style={{width:40,height:40,borderRadius:12,background:`${t.color}14`,border:`1px solid ${t.color}30`,display:'grid',placeItems:'center'}}>
                <I name={t.icon} size={20} color={t.color} stroke={1.8}/>
              </div>
              <div style={{fontSize:11,fontWeight:700,color:C.text,fontFamily:DISPLAY,lineHeight:1.2}}>{t.label}</div>
            </button>
))}
        </div>
      </div>
    </div>
);
}

// ─── BILAN DU MOIS ────────────────────────────────────────────────────────────
function BilanMois({ sessions, year, month, currentWeek }) {
  const stats = useMemo(() => {
    const toArr = v => Array.isArray(v) ? v : (v ? [v] : []);
    const wLog = (() => { try { return JSON.parse(localStorage.getItem('morpho_workout_log')||'{}'); } catch{return{};} })();
    const realVolumeOf = (dateKey) => { const e = wLog[dateKey]; return e ? e.totalVolume : 0; };

    const prefix =`${year}-${String(month+1).padStart(2,'0')}`;
    const pd = new Date(year, month-1, 1);
    const prevPrefix =`${pd.getFullYear()}-${String(pd.getMonth()+1).padStart(2,'0')}`;

    let planned = 0, validated = 0, tonnage = 0;
    let prevValidated = 0, prevTonnage = 0;

    Object.entries(sessions).filter(([k]) => k.startsWith(prefix)).forEach(([k,v]) => {
      toArr(v).forEach(s => {
        planned++;
        if (s.done) {
          validated++;
          const real = realVolumeOf(k);
          const prog = (s.musculation?.exercices||[]).reduce((a,ex) =>
            a + (parseInt(ex.series)||4)*(parseInt(ex.reps)||10)*(parseFloat(ex.charge)||0), 0);
          tonnage += real > 0 ? real : prog;
        }
      });
    });

    Object.entries(sessions).filter(([k]) => k.startsWith(prevPrefix)).forEach(([k,v]) => {
      toArr(v).forEach(s => {
        if (s.done) {
          prevValidated++;
          const real = realVolumeOf(k);
          const prog = (s.musculation?.exercices||[]).reduce((a,ex) =>
            a + (parseInt(ex.series)||4)*(parseInt(ex.reps)||10)*(parseFloat(ex.charge)||0), 0);
          prevTonnage += real > 0 ? real : prog;
        }
      });
    });

    const assiduite  = planned > 0 ? Math.min(100, Math.round((validated/planned)*100)) : 0;
    const tonnageTon = tonnage / 1000; // en tonnes
    const prevTonTon = prevTonnage / 1000;
    const tonPct     = prevTonTon > 0 ? Math.round((tonnageTon-prevTonTon)/prevTonTon*100) : null;
    const diff       = validated - prevValidated;
    const volSess    = validated > 0 ? Math.round(tonnage / validated) : 0; // kg/séance
    const MONTHS_SHORT = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
    const prevMonthName = MONTHS_SHORT[(month+11)%12];

    return { planned, validated, tonnage: tonnageTon, assiduite, tonPct, diff, prevValidated, prevMonthName, volSess };
  }, [sessions, year, month]);

  return (
    <div style={{marginTop:24}}>
      {/* ── Séparateur ── */}
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
        <div style={{flex:1,height:1,background:'rgba(0,0,0,0.05)'}}/>
        <div style={{...ey,letterSpacing:"0.1em",flexShrink:0}}>Bilan du mois</div>
        <div style={{flex:1,height:1,background:'rgba(0,0,0,0.05)'}}/>
      </div>

      {/* Mois + mésocycle */}
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:16}}>
        <div style={{fontFamily:SERIF,fontSize:34,fontWeight:400,color:C.text,letterSpacing:-0.5,lineHeight:1}}>
          {['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'][month]}
        </div>
        {currentWeek !== undefined && (
          <div style={{fontSize:10,fontWeight:700,color:DARK.accent,fontFamily:DISPLAY,letterSpacing:"0.1em",textTransform:'uppercase',paddingBottom:2}}>
            MÉSOCYCLE SEM. {(currentWeek||0)+1}/6
          </div>
)}
      </div>

      {/* ── Deux carrés compacts côte à côte ── */}
      <div style={{display:'flex',gap:8}}>

        {/* Séances */}
        <div style={{flex:1,background:`radial-gradient(ellipse 100% 70% at 80% 0%, rgba(99,72,235,0.35), transparent 60%), linear-gradient(160deg, #101318 0%, #101318 55%, #101318 100%)`,border:'1px solid rgba(170,180,255,0.18)',boxShadow: C.shadow,borderRadius:20,padding:'16px 12px',minWidth:0}}>
          <div style={{...ey,color:DARK.accent,marginBottom:12}}>Séances</div>
          <div style={{fontFamily:DISPLAY,fontSize:26,fontWeight:700,color:'#FFFFFF',letterSpacing:-1,lineHeight:1,...NUM}}>
            {stats.validated}
            <span style={{fontSize:13,fontWeight:400,color:'#98A2B3',marginLeft:2}}>/{stats.planned}</span>
          </div>
          <div style={{fontSize:11,fontWeight:700,marginTop:8,fontFamily:DISPLAY,
            color: stats.validated>0&&stats.diff>=0 ? C.green :'#E5484D', ...NUM}}>
            {stats.prevValidated>0
              ? (stats.diff>=0 ?`+ ${stats.diff}` :`${stats.diff}`)
              : stats.validated>0 ?`${stats.validated} faite${stats.validated>1?'s':''}` :'—'}
          </div>
        </div>

        {/* Assiduité */}
        <div style={{flex:1,background:`radial-gradient(ellipse 100% 70% at 80% 0%, rgba(99,72,235,0.35), transparent 60%), linear-gradient(160deg, #101318 0%, #101318 55%, #101318 100%)`,border:'1px solid rgba(170,180,255,0.18)',boxShadow: C.shadow,borderRadius:20,padding:'16px 12px',minWidth:0}}>
          <div style={{...ey,color:DARK.accent,marginBottom:12}}>Assiduité</div>
          <div style={{fontFamily:DISPLAY,fontSize:26,fontWeight:700,color:'#FFFFFF',letterSpacing:-1,lineHeight:1,...NUM}}>
            {stats.assiduite}
            <span style={{fontSize:13,fontWeight:400,color:'#98A2B3',marginLeft:1}}>%</span>
          </div>
          <div style={{height:7,background:'rgba(255,255,255,0.12)',borderRadius:5,overflow:'hidden',marginTop:8}}>
            <div style={{height:'100%',width:`${stats.assiduite}%`,
              background:'linear-gradient(90deg,#12B76A,#12B76A)',
              borderRadius:5,transition:'width .7s cubic-bezier(.4,0,.2,1)'}}/>
          </div>
        </div>
      </div>
    </div>
);
}

// ─── MONTH CALENDAR ───────────────────────────────────────────────────────────
export const MonthCal = memo(function MonthCal({ sessions, onUpdate, semC, currentWeek }) {
  const [date,  setDate]  = useState(new Date());
  const [modal, setModal] = useState(null);

  const DAYS   = ['L','M','M','J','V','S','D'];
  const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const y = date.getFullYear(), m = date.getMonth();
  const first = (new Date(y,m,1).getDay()+6)%7;
  const daysInMonth = new Date(y,m+1,0).getDate();
  const today = new Date();
  const todayStr =`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const ds = d =>`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const canPrev = y > today.getFullYear() || (y===today.getFullYear() && m>today.getMonth());
  const canNext = y < 2027;

  // Resolve sessions for a day — normalize to array
  const getSess = (key) => {
    const v = sessions[key];
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  };

  // Get dominant color for a day
  const getDayColor = (key) => {
    const s = getSess(key);
    if (!s.length) return null;
    return INT[s[0].intensite||'modere']?.c || s[0].color || C.accent;
  };

  return (
    <div style={{paddingBottom:4}}>

      {/* ── Calendrier card ── */}
      <div style={{background:`radial-gradient(ellipse 90% 60% at 85% 0%, rgba(99,72,235,0.35), transparent 55%), radial-gradient(ellipse 70% 50% at 10% 100%, rgba(47,107,255,0.25), transparent 60%), linear-gradient(160deg, #101318 0%, #101318 55%, #101318 100%)`,border:'1px solid rgba(170,180,255,0.18)',boxShadow: C.shadow,borderRadius:20,padding:'16px 16px 16px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <button onClick={()=>canPrev&&setDate(new Date(y,m-1,1))} disabled={!canPrev} className="tap"
            style={{width:30,height:30,borderRadius:8,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(170,180,255,0.25)',color:canPrev?C.mid:C.dim,cursor:canPrev?'pointer':'not-allowed',display:'grid',placeItems:'center',padding:0,flexShrink:0}}>
            <I name="chevL" size={13} stroke={2} color={canPrev?DARK.dim:'#667085'}/>
          </button>
          <div style={{textAlign:'center'}}>
            <div style={{...ey,color:DARK.accent,marginBottom:4}}>Calendrier</div>
            <div style={{fontFamily:DISPLAY,fontSize:20,fontWeight:700,color:'#FFFFFF',letterSpacing:-0.5}}>
              {MONTHS[m]} <span style={{color:DARK.accent,fontWeight:400,fontStyle:'italic',fontFamily:SERIF}}>{y}</span>
            </div>
          </div>
          <button onClick={()=>canNext&&setDate(new Date(y,m+1,1))} disabled={!canNext} className="tap"
            style={{width:30,height:30,borderRadius:8,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(170,180,255,0.25)',color:canNext?C.mid:C.dim,cursor:canNext?'pointer':'not-allowed',display:'grid',placeItems:'center',padding:0,flexShrink:0}}>
            <I name="chevR" size={13} stroke={2} color={canNext?DARK.dim:'#667085'}/>
          </button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:4}}>
          {DAYS.map((d,i)=>(
            <div key={i} style={{textAlign:'center',fontSize:10,color:'#98A2B3',fontWeight:700,letterSpacing:"0.1em",fontFamily:DISPLAY}}>{d}</div>
))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}}>
          {[...Array(first)].map((_,i)=><div key={`e${i}`}/>)}
          {[...Array(daysInMonth)].map((_,i)=>{
            const d = i+1;
            const key = ds(d);
            const daySess = getSess(key);
            const isToday = key===todayStr;
            const isPast  = key < todayStr;
            const color   = getDayColor(key);
            const hasSess = daySess.length>0;
            const isDone  = daySess.some(s=>s.done);          // au moins une séance validée
            const dotColors = daySess.filter(s=>!s.done).map(s=>INT[s.intensite||'modere']?.c||s.color||'#3C5BFF').slice(0,3);

            // ── Styles selon l'état : validée = plein, planifiée = teintée ──
            let bg, bd, numColor;
            if (isDone)       { bg = color;            bd =`1px solid ${color}`;      numColor ='#FFF'; }
            else if (hasSess) { bg =`linear-gradient(${color}40,${color}40), #1A1F27`; bd =`1px solid ${color}88`; numColor ='#FFF'; }
            else              { bg = isPast?'#101318':'#1A1F27'; bd ='1px solid rgba(170,180,255,0.12)'; numColor = isPast?'#667085':'#EAECF0'; }

            const boxShadow = isToday
              ?`0 0 0 2px #9DB0FF, 0 4px 12px rgba(60,91,255,0.35)`
              : isDone ?`0 4px 12px ${color}45` :'none';

            return (
              <button key={d} onClick={()=>setModal({date:key,sessions:daySess})} className="tap" style={{
                position:'relative', aspectRatio:'1/1', borderRadius:12, padding:0, cursor:'pointer',
                background:bg, border:bd,
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4,
                boxShadow,
                opacity: isPast && !hasSess ? 0.4 : 1,
              }}>
                {isDone&&(
                  <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="#FFF" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" style={{position:'absolute',top:4,right:4,opacity:0.95}}><path d="M20 6 9 17l-5-5"/></svg>
)}
                <span style={{fontFamily:DISPLAY,fontSize:11,fontWeight:isDone||isToday?700:hasSess?600:500,color:numColor,...NUM}}>{d}</span>
                {dotColors.length>0&&(
                  <div style={{display:'flex',gap:2,alignItems:'center'}}>
                    {dotColors.map((dc,di)=>(
                      <span key={di} style={{width:4,height:4,borderRadius:'50%',background:dc}}/>
))}
                  </div>
)}
              </button>
);
          })}
        </div>
        <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid rgba(170,180,255,0.12)',display:'flex',flexWrap:'wrap',gap:8,alignItems:'center'}}>
          <div style={{...ey,color:DARK.accent,marginRight:4}}>Intensité</div>
          {Object.entries(INT).map(([k,v])=>(
            <div key={k} style={{display:'flex',alignItems:'center',gap:4}}>
              <div style={{width:6,height:6,borderRadius:2,background:v.c,flexShrink:0}}/>
              <span style={{fontSize:10,color:DARK.dim,fontFamily:DISPLAY}}>{v.l}</span>
            </div>
))}
        </div>
        <div style={{marginTop:8,display:'flex',flexWrap:'wrap',gap:12,alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <div style={{width:13,height:13,borderRadius:4,background:'rgba(60,91,255,0.25)',border:'1px solid rgba(60,91,255,0.5)',flexShrink:0}}/>
            <span style={{fontSize:10,color:DARK.dim,fontFamily:DISPLAY}}>Planifiée</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <div style={{width:13,height:13,borderRadius:4,background:C.accent,flexShrink:0,display:'grid',placeItems:'center'}}>
              <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="#FFF" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <span style={{fontSize:10,color:DARK.dim,fontFamily:DISPLAY}}>Validée (faite)</span>
          </div>
        </div>
      </div>

      {/* ── Bilan hors card ── */}
      <BilanMois sessions={sessions} year={y} month={m} currentWeek={currentWeek}/>

      {modal&&(
        <DayModal
          date={modal.date}
          sessions={modal.sessions}
          onSave={sess=>{
            const existing = getSess(modal.date);
            const updated  = [...existing, sess];
            onUpdate(modal.date, updated.length===1 ? updated[0] : updated);
            setModal(null);
          }}
          onDelete={idx=>{
            const existing = getSess(modal.date);
            const updated  = existing.filter((_,i)=>i!==idx);
            onUpdate(modal.date, updated.length===0 ? null : updated.length===1 ? updated[0] : updated);
            setModal(null);
          }}
          onToggleDone={idx=>{
            const existing = getSess(modal.date);
            const updated  = existing.map((s,i)=> i===idx
              ? {...s, done:!s.done, doneDate: !s.done ? new Date().toISOString() : undefined}
              : s);
            onUpdate(modal.date, updated.length===1 ? updated[0] : updated);
            setModal(m=>({...m, sessions:updated}));   // garde la feuille ouverte
          }}
          onClose={()=>setModal(null)}
        />
)}
    </div>
);
});
