import { useState, memo, useMemo } from "react";
import { C, INT, SESS_COLORS } from "../../data/constants.js";
import { EX } from "../../data/exercises.js";
import { Inp, Btn } from "./index.jsx";

const DISPLAY = "'Outfit','DM Sans',system-ui,sans-serif";
const SERIF   = "'DM Serif Display','Georgia',serif";
const NUM     = { fontVariantNumeric:'tabular-nums', fontFeatureSettings:'"tnum"' };
const ey      = { fontSize:9, fontWeight:700, letterSpacing:'1.3px', textTransform:'uppercase', color:'rgba(242,244,247,0.38)', fontFamily:DISPLAY };

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
  const cc = (cat) => ({principal:"#4D8BFF",correctif:"#FF7A6B",gainage:"#5FE0A5",isolation:"#B69DFF"}[cat||"principal"]||"#4D8BFF");
  const searchList = search
    ? Object.entries(EX).flatMap(([,arr]) => arr.map(ex => ({nom:ex.n,cat:ex.cat}))).filter(e=>e.nom.toLowerCase().includes(search.toLowerCase()))
    : groupe ? (EX[groupe]||[]).map(ex => ({nom:ex.n,cat:ex.cat})) : [];
  return (
    <div>
      <div style={{...ey,color:'#3B82F6',marginBottom:10}}>Musculation</div>
      <Inp placeholder="Nom de la séance (ex: Push, Pull…)" value={seNom} onChange={e=>setSeNom(e.target.value)} style={{marginBottom:10}}/>
      <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:12}}>
        {Object.entries(INT).map(([k,v])=>(
          <button key={k} onClick={()=>setInt(k)} style={{padding:'5px 10px',background:intensite===k?`${v.c}20`:C.s2,border:`1px solid ${intensite===k?v.c:'rgba(255,255,255,0.07)'}`,borderRadius:7,cursor:'pointer',fontSize:11,color:intensite===k?v.c:'rgba(242,244,247,0.50)',fontWeight:intensite===k?700:400,fontFamily:DISPLAY}}>{v.l}</button>
        ))}
      </div>
      {exos.length>0&&(
        <div style={{marginBottom:10}}>
          {exos.map((ex,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',background:C.s2,borderRadius:8,marginBottom:4}}>
              <div style={{width:3,height:20,borderRadius:2,background:cc(ex.cat),flexShrink:0}}/>
              <div style={{flex:1,fontSize:12,color:C.text}}>{ex.nom}</div>
              <button onClick={()=>setExos(p=>p.filter(e=>e.nom!==ex.nom))} style={{background:'transparent',border:'none',color:'#F87171',cursor:'pointer',padding:0}}><I name="x" size={14} stroke={2}/></button>
            </div>
          ))}
        </div>
      )}
      <div style={{border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,overflow:'hidden',marginBottom:12}}>
        <div style={{padding:'8px',background:C.s2}}>
          <input value={search} onChange={e=>{setSearch(e.target.value);setGroupe(null);}} placeholder="Rechercher un exercice…"
            style={{width:'100%',padding:'7px 10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:8,fontSize:12,color:C.text,fontFamily:DISPLAY,outline:'none',boxSizing:'border-box'}}/>
        </div>
        {!search&&(
          <div style={{padding:'8px',display:'flex',flexWrap:'wrap',gap:4,maxHeight:110,overflowY:'auto'}}>
            {Object.keys(EX).map(g=>(
              <button key={g} onClick={()=>setGroupe(g===groupe?null:g)} style={{padding:'4px 9px',background:groupe===g?'rgba(59,130,246,0.10)':C.s2,border:`1px solid ${groupe===g?'#3B82F6':'rgba(255,255,255,0.07)'}`,borderRadius:12,color:groupe===g?'#3B82F6':'rgba(242,244,247,0.45)',cursor:'pointer',fontSize:10,fontFamily:DISPLAY}}>
                {g} <span style={{fontSize:8.5,opacity:0.6}}>({(EX[g]||[]).length})</span>
              </button>
            ))}
          </div>
        )}
        {searchList.length>0&&(
          <div style={{maxHeight:150,overflowY:'auto',padding:'4px 6px'}}>
            {searchList.map((ex,i)=>(
              <div key={i} onClick={()=>{if(!exos.find(e=>e.nom===ex.nom))setExos(p=>[...p,{...ex,series:'4',reps:'10'}]);setSearch('');setGroupe(null);}}
                style={{display:'flex',alignItems:'center',gap:8,padding:'7px 8px',borderRadius:8,cursor:'pointer',opacity:exos.find(e=>e.nom===ex.nom)?0.4:1}}
                onMouseEnter={ev=>ev.currentTarget.style.background=C.s2}
                onMouseLeave={ev=>ev.currentTarget.style.background='transparent'}>
                <div style={{width:3,height:20,borderRadius:2,background:cc(ex.cat),flexShrink:0}}/>
                <div style={{flex:1,fontSize:12,color:C.text}}>{ex.nom}</div>
                <div style={{fontSize:10,color:'#3B82F6',fontWeight:600}}>{exos.find(e=>e.nom===ex.nom)?'✓':'+'}</div>
              </div>
            ))}
          </div>
        )}
        {!search&&!groupe&&<div style={{padding:'12px',textAlign:'center',fontSize:11,color:'rgba(242,244,247,0.40)'}}>Sélectionne un groupe musculaire</div>}
      </div>
      <Btn disabled={exos.length===0&&!seNom} onClick={()=>{const color=INT[intensite]?.c||'#3B82F6';onSave({nom:seNom||(exos.map(e=>e.nom.split(' ')[0]).join('+')||'Musculation'),intensite,color,musculation:{exercices:exos}});onClose();}}>✓ Enregistrer</Btn>
      <Btn v="ghost" onClick={onClose} style={{marginTop:6}}>Annuler</Btn>
    </div>
  );
}

// ─── BONUS TYPES ──────────────────────────────────────────────────────────────
const BONUS = [
  { id:'cardio',   icon:'run',    label:'Cardio',               color:'#3B82F6', desc:'Course, vélo, rameur…',        suggestions:['Course à pied','Vélo','Rameur','Elliptique','HIIT','Tapis roulant'] },
  { id:'mobility', icon:'yoga',   label:'Mobilité & Étirements', color:'#34D399', desc:'Yoga, stretching, récupération', suggestions:['Yoga','Stretching','Foam rolling','Récupération active','Pilates','Mobilité'] },
  { id:'sport',    icon:'trophy', label:'Autre sport',           color:'#F59E0B', desc:'Natation, tennis, foot…',        suggestions:['Natation','Tennis','Football','Basketball','Boxe','Escalade','Padel'] },
];

function BonusForm({ type, onSave, onBack }) {
  const [nom,   setNom]   = useState('');
  const [duree, setDuree] = useState(30);
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <div style={{width:42,height:42,borderRadius:13,background:`${type.color}15`,border:`1px solid ${type.color}35`,display:'grid',placeItems:'center',flexShrink:0}}>
          <I name={type.icon} size={20} color={type.color} stroke={1.8}/>
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:DISPLAY}}>{type.label}</div>
          <div style={{fontSize:10.5,color:'rgba(242,244,247,0.45)',marginTop:1}}>{type.desc}</div>
        </div>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:12}}>
        {type.suggestions.map(s=>(
          <button key={s} onClick={()=>setNom(s)} style={{padding:'5px 10px',background:nom===s?`${type.color}18`:C.s2,border:`1px solid ${nom===s?type.color:'rgba(255,255,255,0.07)'}`,borderRadius:999,cursor:'pointer',fontSize:10.5,color:nom===s?type.color:'rgba(242,244,247,0.50)',fontFamily:DISPLAY,fontWeight:nom===s?700:400}}>{s}</button>
        ))}
      </div>
      <Inp placeholder="Ou saisir manuellement…" value={nom} onChange={e=>setNom(e.target.value)} style={{marginBottom:12}}/>
      <div style={{...ey,marginBottom:8}}>Durée</div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
        <button onClick={()=>setDuree(d=>Math.max(10,d-5))} style={{width:34,height:34,borderRadius:9,background:C.s2,border:`1px solid rgba(255,255,255,0.07)`,cursor:'pointer',fontSize:18,color:'rgba(242,244,247,0.50)',fontFamily:DISPLAY}}>−</button>
        <div style={{flex:1,textAlign:'center',fontFamily:DISPLAY,fontSize:24,fontWeight:700,color:C.text,...NUM}}>{duree}<span style={{fontSize:12,fontWeight:400,color:'rgba(242,244,247,0.40)',marginLeft:4}}>min</span></div>
        <button onClick={()=>setDuree(d=>Math.min(180,d+5))} style={{width:34,height:34,borderRadius:9,background:`${type.color}18`,border:`1px solid ${type.color}40`,cursor:'pointer',fontSize:18,color:type.color,fontFamily:DISPLAY}}>+</button>
      </div>
      <div style={{display:'flex',gap:5,marginBottom:16}}>
        {[15,20,30,45,60,90].map(d=>(
          <button key={d} onClick={()=>setDuree(d)} style={{flex:1,padding:'5px 2px',background:duree===d?`${type.color}14`:'transparent',border:`1px solid ${duree===d?type.color:'rgba(255,255,255,0.07)'}`,borderRadius:7,color:duree===d?type.color:'rgba(242,244,247,0.40)',cursor:'pointer',fontSize:10,fontFamily:DISPLAY,fontWeight:duree===d?700:400}}>{d}'</button>
        ))}
      </div>
      <Btn disabled={!nom} onClick={()=>onSave({nom:`${nom} · ${duree}min`,intensite:type.id==='mobility'?'leger':'modere',color:type.color,bonus:{type:type.id,duree,label:nom}})}>✓ Ajouter à ce jour</Btn>
      <button onClick={onBack} style={{width:'100%',marginTop:8,padding:'8px',background:'transparent',border:'none',color:'rgba(242,244,247,0.45)',cursor:'pointer',fontSize:12,fontFamily:DISPLAY}}>← Retour</button>
    </div>
  );
}

// ─── DAY MODAL (bottom sheet) ─────────────────────────────────────────────────
export function DayModal({ date, sessions, onSave, onDelete, onClose }) {
  const allSess = Array.isArray(sessions) ? sessions : (sessions ? [sessions] : []);
  const [step,          setStep]          = useState('main');
  const [selectedBonus, setSelectedBonus] = useState(null);

  const fmtDate = (d) => {
    try { return new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'}); }
    catch { return d; }
  };

  const overlay = { position:'fixed',inset:0,background:'rgba(6,9,20,0.92)',display:'flex',alignItems:'flex-end',justifyContent:'center',zIndex:300 };
  const sheet   = { background:C.s1,border:`1px solid ${C.bd}`,borderRadius:'20px 20px 0 0',padding:'12px 18px 32px',width:'100%',maxWidth:480,maxHeight:'90vh',overflowY:'auto' };
  const handle  = <div style={{width:36,height:4,borderRadius:2,background:'rgba(255,255,255,0.10)',margin:'0 auto 16px'}}/>;

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
            <div style={{...ey,marginBottom:3}}>Planning</div>
            <div style={{fontFamily:DISPLAY,fontSize:15,fontWeight:700,color:C.text,textTransform:'capitalize'}}>{fmtDate(date)}</div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:9,background:C.s2,border:`1px solid ${C.bd}`,color:'rgba(242,244,247,0.50)',cursor:'pointer',display:'grid',placeItems:'center'}}>
            <I name="x" size={14} stroke={2}/>
          </button>
        </div>

        {/* Existing sessions */}
        {allSess.length>0&&(
          <div style={{marginBottom:16}}>
            <div style={{...ey,marginBottom:8}}>Séances planifiées</div>
            {allSess.map((sess,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:C.s2,borderRadius:12,marginBottom:6,borderLeft:`3px solid ${sess.color||'#3B82F6'}`}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sess.nom}</div>
                  <div style={{fontSize:10.5,color:'rgba(242,244,247,0.45)',marginTop:1}}>{INT[sess.intensite||'modere']?.l}{sess.bonus?` · ${sess.bonus.duree}min`:''}</div>
                </div>
                <button onClick={()=>onDelete(i)} style={{background:'transparent',border:'none',color:'rgba(248,113,113,0.7)',cursor:'pointer',padding:'4px',flexShrink:0,display:'grid',placeItems:'center'}}>
                  <I name="trash" size={14} stroke={1.8}/>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add session */}
        <div style={{...ey,marginBottom:10}}>{allSess.length>0?'Ajouter une séance':'Planifier ce jour'}</div>

        {/* Musculation CTA */}
        <button onClick={()=>setStep('musculation')} style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:C.s2,border:`1px solid rgba(59,130,246,0.22)`,borderRadius:14,cursor:'pointer',marginBottom:10,textAlign:'left'}}>
          <div style={{width:42,height:42,borderRadius:13,background:'rgba(59,130,246,0.12)',display:'grid',placeItems:'center',flexShrink:0}}>
            <I name="dumbbell" size={20} color='#3B82F6' stroke={1.8}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:DISPLAY}}>Musculation</div>
            <div style={{fontSize:10.5,color:'rgba(242,244,247,0.45)',marginTop:1}}>Exercices, séries, charges</div>
          </div>
          <I name="chevR" size={14} color='rgba(242,244,247,0.25)' stroke={2}/>
        </button>

        {/* Séances bonus */}
        <div style={{...ey,marginBottom:9,marginTop:4}}>Séances bonus</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          {BONUS.map(t=>(
            <button key={t.id} onClick={()=>{setSelectedBonus(t);setStep('bonus');}} style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'14px 8px',background:C.s2,border:`1px solid ${t.color}22`,borderRadius:14,cursor:'pointer',gap:8,textAlign:'center'}}>
              <div style={{width:40,height:40,borderRadius:12,background:`${t.color}14`,border:`1px solid ${t.color}30`,display:'grid',placeItems:'center'}}>
                <I name={t.icon} size={20} color={t.color} stroke={1.8}/>
              </div>
              <div style={{fontSize:10.5,fontWeight:700,color:C.text,fontFamily:DISPLAY,lineHeight:1.2}}>{t.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── BILAN DU MOIS ────────────────────────────────────────────────────────────
function BilanMois({ sessions, year, month }) {
  const stats = useMemo(() => {
    const prefix = `${year}-${String(month+1).padStart(2,'0')}`;
    const monthEntries = Object.entries(sessions).filter(([k]) => k.startsWith(prefix));
    const allSess = monthEntries.flatMap(([,v]) => Array.isArray(v) ? v : (v ? [v] : []));
    const count = allSess.length;

    // Tonnage estimé
    let tonnage = 0;
    allSess.forEach(s => {
      (s.musculation?.exercices||[]).forEach(ex => {
        tonnage += (parseInt(ex.series)||4) * (parseInt(ex.reps)||10) * (parseFloat(ex.charge)||0) / 1000;
      });
    });

    // Intensités
    const intCounts = {};
    allSess.forEach(s => { const k=s.intensite||'modere'; intCounts[k]=(intCounts[k]||0)+1; });

    // Jours avec séance vs jours dans le mois
    const uniqueDays = new Set(monthEntries.filter(([,v])=>(Array.isArray(v)?v:v?[v]:[]).length>0).map(([k])=>k)).size;
    const today = new Date();
    const isCurrent = today.getFullYear()===year && today.getMonth()===month;
    const totalDays = isCurrent ? today.getDate() : new Date(year,month+1,0).getDate();
    const assiduité = totalDays > 0 ? Math.round((uniqueDays/totalDays)*100) : 0;

    // Charge dominante
    const topInt = Object.entries(intCounts).sort((a,b)=>b[1]-a[1])[0];

    return { count, tonnage: tonnage.toFixed(1), intCounts, uniqueDays, totalDays, assiduité, topInt };
  }, [sessions, year, month]);

  // Carte bilan — design exact maquette
  const Card = ({ label, main, sub, delta, deltaOk, accent }) => (
    <div style={{flex:1,background:'#111827',border:`1px solid rgba(255,255,255,0.07)`,borderRadius:14,padding:'14px 12px',minWidth:0}}>
      <div style={{...ey,marginBottom:8}}>{label}</div>
      <div style={{fontFamily:DISPLAY,fontSize:28,fontWeight:700,color:C.text,letterSpacing:-0.8,lineHeight:1,...NUM}}>
        {main}
        {sub&&<span style={{fontSize:13,fontWeight:400,color:'rgba(242,244,247,0.35)',marginLeft:3}}>{sub}</span>}
      </div>
      {delta&&(
        <div style={{fontSize:11,fontWeight:700,color:deltaOk?'#34D399':'#F87171',marginTop:6,fontFamily:DISPLAY,...NUM}}>{delta}</div>
      )}
      {accent&&<div style={{marginTop:8}}>{accent}</div>}
    </div>
  );

  if (stats.count===0) return (
    <div style={{marginTop:20}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <div style={{fontFamily:DISPLAY,fontSize:17,fontWeight:700,color:C.text,letterSpacing:-0.4}}>Bilan du mois</div>
        <div style={{...ey}}>VS. MOIS PRÉC.</div>
      </div>
      <div style={{padding:'20px',textAlign:'center',background:'#111827',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,fontSize:12,color:'rgba(242,244,247,0.30)',fontFamily:DISPLAY}}>
        Aucune séance ce mois
      </div>
    </div>
  );

  const topIntData = stats.topInt ? INT[stats.topInt[0]] : null;

  // Barre assiduité
  const assBarre = (
    <div>
      <div style={{height:3,background:'rgba(255,255,255,0.06)',borderRadius:3,overflow:'hidden',marginBottom:3}}>
        <div style={{height:'100%',width:`${stats.assiduité}%`,background:'#34D399',borderRadius:3,transition:'width .8s ease'}}/>
      </div>
      <div style={{fontSize:9,color:'rgba(242,244,247,0.35)',fontFamily:DISPLAY,...NUM}}>{stats.uniqueDays} j / {stats.totalDays} j</div>
    </div>
  );

  // Barre charge
  const chargeBarre = topIntData ? (
    <div style={{display:'flex',alignItems:'center',gap:6,marginTop:2}}>
      <div style={{width:8,height:8,borderRadius:'50%',background:topIntData.c,flexShrink:0,boxShadow:`0 0 5px ${topIntData.c}`}}/>
      <div style={{fontSize:13,fontWeight:700,color:topIntData.c,fontFamily:DISPLAY}}>{topIntData.l}</div>
    </div>
  ) : <div style={{fontSize:12,color:'rgba(242,244,247,0.35)'}}>—</div>;

  return (
    <div style={{marginTop:20}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <div style={{fontFamily:DISPLAY,fontSize:17,fontWeight:700,color:C.text,letterSpacing:-0.4}}>Bilan du mois</div>
        <div style={{...ey}}>VS. MOIS PRÉC.</div>
      </div>
      {/* Row 1 */}
      <div style={{display:'flex',gap:8,marginBottom:8}}>
        <Card label="Séances" main={stats.count} sub={`/${stats.totalDays}j`} delta="↑ données en cours" deltaOk={true}/>
        <Card label="Tonnage" main={parseFloat(stats.tonnage)>0?stats.tonnage:'—'} sub={parseFloat(stats.tonnage)>0?'t':''} delta={parseFloat(stats.tonnage)>0?"↑ connecté prog.":null} deltaOk={true}/>
      </div>
      {/* Row 2 */}
      <div style={{display:'flex',gap:8}}>
        <Card label="Charge" main=" " accent={chargeBarre}/>
        <Card label="Assiduité" main={`${stats.assiduité}`} sub="%" accent={assBarre}/>
      </div>
    </div>
  );
}

// ─── MONTH CALENDAR ───────────────────────────────────────────────────────────
export const MonthCal = memo(function MonthCal({ sessions, onUpdate }) {
  const [date,  setDate]  = useState(new Date());
  const [modal, setModal] = useState(null);

  const DAYS   = ['L','M','M','J','V','S','D'];
  const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const y = date.getFullYear(), m = date.getMonth();
  const first = (new Date(y,m,1).getDay()+6)%7;
  const daysInMonth = new Date(y,m+1,0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const ds = d => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
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
    return s[0].color || '#3B82F6';
  };

  return (
    <div style={{paddingBottom:4}}>
      {/* Month header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <button onClick={()=>canPrev&&setDate(new Date(y,m-1,1))} disabled={!canPrev} className="tap"
          style={{width:32,height:32,borderRadius:10,background:C.s2,border:`1px solid ${C.bd}`,color:canPrev?C.mid:C.dim,cursor:canPrev?'pointer':'not-allowed',display:'grid',placeItems:'center',padding:0}}>
          <I name="chevL" size={14} stroke={2} color={canPrev?C.mid:C.dim}/>
        </button>
        <div style={{textAlign:'center'}}>
          <div style={{...ey,color:'#3B82F6',marginBottom:3}}>Calendrier</div>
          <div style={{fontFamily:DISPLAY,fontSize:20,fontWeight:700,color:C.text,letterSpacing:-0.5}}>
            {MONTHS[m]} <span style={{color:'rgba(242,244,247,0.40)',fontWeight:400,fontStyle:'italic',fontFamily:SERIF}}>{y}</span>
          </div>
        </div>
        <button onClick={()=>canNext&&setDate(new Date(y,m+1,1))} disabled={!canNext} className="tap"
          style={{width:32,height:32,borderRadius:10,background:C.s2,border:`1px solid ${C.bd}`,color:canNext?C.mid:C.dim,cursor:canNext?'pointer':'not-allowed',display:'grid',placeItems:'center',padding:0}}>
          <I name="chevR" size={14} stroke={2} color={canNext?C.mid:C.dim}/>
        </button>
      </div>

      {/* Weekday headers */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3,marginBottom:6}}>
        {DAYS.map((d,i)=>(
          <div key={i} style={{textAlign:'center',fontSize:9,color:'rgba(242,244,247,0.30)',fontWeight:700,letterSpacing:1,fontFamily:DISPLAY}}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}}>
        {[...Array(first)].map((_,i)=><div key={`e${i}`}/>)}
        {[...Array(daysInMonth)].map((_,i)=>{
          const d = i+1;
          const key = ds(d);
          const daySess = getSess(key);
          const isToday = key===todayStr;
          const isPast  = key < todayStr;
          const color   = getDayColor(key);
          const dotColors = daySess.map(s=>s.color||'#3B82F6').slice(0,3);

          return (
            <button key={d} onClick={()=>setModal({date:key,sessions:daySess})} className="tap" style={{
              aspectRatio:'1/1', borderRadius:11, padding:0, cursor:'pointer',
              background: isToday
                ? '#3B82F6'
                : daySess.length>0
                  ? `${color}18`
                  : isPast ? 'rgba(255,255,255,0.03)' : C.s2,
              border: isToday
                ? '1.5px solid #60A5FA'
                : daySess.length>0
                  ? `1px solid ${color}40`
                  : `1px solid ${C.bd}`,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3,
              boxShadow: isToday ? '0 4px 12px rgba(59,130,246,0.35)' : 'none',
              opacity: isPast && daySess.length===0 ? 0.45 : 1,
            }}>
              <span style={{fontFamily:DISPLAY,fontSize:11,fontWeight:isToday?700:500,color:isToday?'#fff':isPast&&!daySess.length?'rgba(242,244,247,0.35)':C.text,...NUM}}>{d}</span>
              {dotColors.length>0&&(
                <div style={{display:'flex',gap:2,alignItems:'center'}}>
                  {dotColors.map((dc,di)=>(
                    <span key={di} style={{width:4,height:4,borderRadius:'50%',background:isToday?'rgba(255,255,255,0.8)':dc,boxShadow:!isToday?`0 0 4px ${dc}`:''}}/>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{marginTop:14,display:'flex',flexWrap:'wrap',gap:10}}>
        {Object.entries(INT).map(([k,v])=>(
          <div key={k} style={{display:'flex',alignItems:'center',gap:5}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:v.c,boxShadow:`0 0 4px ${v.c}`}}/>
            <span style={{fontSize:10,color:'rgba(242,244,247,0.45)',fontFamily:DISPLAY}}>{v.l}</span>
          </div>
        ))}
        {BONUS.map(b=>(
          <div key={b.id} style={{display:'flex',alignItems:'center',gap:5}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:b.color}}/>
            <span style={{fontSize:10,color:'rgba(242,244,247,0.45)',fontFamily:DISPLAY}}>{b.label.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      {/* Bilan du mois */}
      <BilanMois sessions={sessions} year={y} month={m}/>

      {/* Modal */}
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
          onClose={()=>setModal(null)}
        />
      )}
    </div>
  );
});
