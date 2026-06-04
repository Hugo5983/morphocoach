/**
 * AnalyseIA.jsx — Refonte visuelle uniquement (design system onboarding)
 * ─────────────────────────────────────────────────────────────────────
 * LOGIQUE 100% INCHANGÉE : états, handlers, validation, services IA.
 * Seule la couche visuelle est remplacée par les tokens Focus Mode / Onboarding.
 */

import { useState, useRef } from "react";
import {
  buildPrompt, callGenerateAPI, parseAIResponse,
  buildProgramFromAI, buildCalendarFromProgram,
  summarizeProgramLoads, LOAD_MESSAGES,
} from "../../services/aiService.js";

// ── Tokens ───────────────────────────────────────────────────────────────────
const T = {
  bg:'#060912', surf:'#0D1322', surfHi:'#141B30', surfFlat:'#0A1020',
  bd:'rgba(178,190,210,0.07)', bdHi:'rgba(178,190,210,0.14)', bdAc:'rgba(91,141,239,0.32)',
  t1:'#F2F4F7', t2:'rgba(242,244,247,0.74)', t3:'#8A94A6',
  t4:'rgba(138,148,166,0.62)', t5:'rgba(138,148,166,0.32)',
  ac:'#5B8DEF', acLt:'#9CB9F5', acDk:'#2D5DC9',
  acSoft:'rgba(91,141,239,0.14)', acGlow:'rgba(91,141,239,0.22)',
  green:'#34D399', red:'#F87171',
};
const F   = '"Space Grotesk","Inter",system-ui,sans-serif';
const SER = '"Instrument Serif","Times New Roman",serif';
const MON = '"JetBrains Mono",ui-monospace,monospace';

const CARD = {
  background:   T.surf,
  border:       `1px solid ${T.bd}`,
  borderRadius: 20,
  boxShadow:    'inset 0 1px 0 rgba(255,255,255,0.025), 0 1px 0 rgba(0,0,0,0.25), 0 12px 28px rgba(3,6,13,0.50)',
  padding:      '18px 16px',
};

// ── CSS animation (un seul tag, injecté une fois) ─────────────────────────────
const CSS_ONCE = `
  @keyframes ob-breathe { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:.85;transform:scale(1.04)} }
  @keyframes ob-pulse   { 0%,100%{opacity:.55} 50%{opacity:1} }
  @keyframes ob-spin    { to{transform:rotate(360deg)} }
  @keyframes ob-fadeUp  { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
  .ob-tap { transition:transform .15s cubic-bezier(.4,0,.2,1),opacity .2s,background .2s,border-color .2s,box-shadow .2s; cursor:pointer; -webkit-tap-highlight-color:transparent; }
  .ob-tap:active { transform:scale(0.97); }
`;

let cssInjected = false;
function InjectCSS() {
  if (!cssInjected && typeof document !== 'undefined') {
    if (!document.getElementById('ob-styles')) {
      const s = document.createElement('style');
      s.id = 'ob-styles'; s.textContent = CSS_ONCE;
      document.head.appendChild(s);
    }
    cssInjected = true;
  }
  return null;
}

// ── Icônes SVG (line, pas d'emoji) ───────────────────────────────────────────
function OI({ n, sz=18, c='currentColor', s=1.6 }) {
  const p = { width:sz, height:sz, viewBox:'0 0 24 24', fill:'none',
    stroke:c, strokeWidth:s, strokeLinecap:'round', strokeLinejoin:'round' };
  const P = {
    check:   <path d="m4 12 5 5 11-12"/>,
    arrowR:  <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    arrowL:  <><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></>,
    camera:  <><path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L19 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2Z" transform="translate(0 -1)"/><circle cx="12" cy="12" r="3.5"/></>,
    shield:  <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6Z"/><path d="m9 12 2 2 4-4"/></>,
    info:    <><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></>,
    sparkles:<><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="M7 7l2 2M15 15l2 2M7 17l2-2M15 9l2-2"/><circle cx="12" cy="12" r="2"/></>,
    muscle:  <><path d="M6 13c0-3 2-5 5-5h2c3 0 5 2 5 5v0c0 1.5-1 2.5-2.5 2.5S13 14.5 13 13"/><path d="M6 13c-1.5 0-2.5 1-2.5 2.5S4.5 18 6 18h3"/><path d="M13 13v3a2 2 0 0 0 2 2h2"/></>,
    barbell: <><path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"/></>,
    flame:   <path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-5M12 21a6 6 0 0 0 6-6c0-3-2-5-3-6 0 3-2 4-3 4s-3-1-3-4c-1 1-3 3-3 6a6 6 0 0 0 6 6Z"/>,
    zap:     <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>,
    pulse:   <path d="M3 12h4l2-6 4 14 2-8h6"/>,
    heart:   <path d="M12 21s-7-4.5-9.5-9.5C1 8 3 4 6.5 4 9 4 11 6 12 8c1-2 3-4 5.5-4C21 4 23 8 21.5 11.5 19 16.5 12 21 12 21Z"/>,
    building:<><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3"/></>,
    dumbbell:<><path d="M6.5 6.5 17.5 17.5M3.5 9.5 9.5 3.5M14.5 20.5 20.5 14.5M2 11l2-2M22 13l-2 2M9 17l-2 2M17 7l-2-2"/></>,
    band:    <><path d="M5 6c4 4 10 4 14 0M5 18c4-4 10-4 14 0M5 6v12M19 6v12"/></>,
    pullup:  <><path d="M4 4h16M7 4v3M17 4v3M12 7v8"/><path d="M10 15a2 2 0 1 0 4 0"/></>,
    person:  <><circle cx="12" cy="5" r="2"/><path d="M12 7v6M8 9h8M9 21l3-8 3 8"/></>,
    gear:    <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M22 12h-3M5 12H2M19 19l-2-2M7 7 5 5M19 5l-2 2M7 17l-2 2"/></>,
    spine:   <><circle cx="12" cy="4" r="2"/><path d="M12 6v12M9 9h6M9 13h6"/></>,
    shoulder:<><circle cx="8" cy="6" r="3"/><path d="M8 9c-3 0-5 2-5 5v4M8 9c4 0 7 2 8 5l3 5"/></>,
    knee:    <><path d="M9 3v7l-3 5 3 6M9 10c3 0 5 1 6 4"/><circle cx="9" cy="12" r="1" fill="currentColor"/></>,
    more:    <><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></>,
  };
  return <svg {...p}>{P[n]||null}</svg>;
}

// ── Silhouette SVG pour les photo slots ──────────────────────────────────────
function Silhouette({ view }) {
  const c = { fill:'none', stroke:T.acLt, strokeWidth:1.2, strokeLinecap:'round', strokeLinejoin:'round', opacity:0.5 };
  return (
    <svg width="44" height="76" viewBox="0 0 44 76">
      {view === 'face' && <>
        <circle cx="22" cy="10" r="7" {...c}/>
        <path d="M13 19L31 19L33 42L28 46L27 64L24 64L23 47L21 47L20 64L17 64L16 46L11 42Z" {...c}/>
        <path d="M13 19L7 34L5 50" {...c}/><path d="M31 19L37 34L39 50" {...c}/>
      </>}
      {view === 'dos' && <>
        <circle cx="22" cy="10" r="7" {...c}/>
        <path d="M12 19L32 19L33 44L27 48L26 64L23 64L22 48L20 48L18 64L15 64L11 44Z" {...c}/>
        <path d="M22 21L22 44" {...c}/><path d="M12 19L6 34L4 50" {...c}/><path d="M32 19L38 34L40 50" {...c}/>
      </>}
      {view === 'profil' && <>
        <circle cx="20" cy="10" r="7" {...c}/>
        <path d="M17 17L26 19L27 42L24 48L26 64L22 64L20 48L18 64L15 64L16 44L15 22Z" {...c}/>
        <path d="M22 22L24 40L22 50" {...c}/>
      </>}
    </svg>
  );
}

// ── Stepper segmenté ─────────────────────────────────────────────────────────
function Stepper({ step, eyebrow, title, subtitle }) {
  const labels = ['Photo','Profil','Objectif','Santé','Matériel'];
  const total  = labels.length;
  return (
    <div style={{ padding:'18px 20px 0' }}>
      {/* Segments */}
      <div style={{ display:'flex', gap:5 }}>
        {labels.map((_,i) => {
          const done = i < step, cur = i === step;
          return (
            <div key={i} style={{ flex:1, height:3, borderRadius:2, overflow:'hidden',
                                  background:'rgba(178,190,210,0.10)', position:'relative' }}>
              {(done||cur) && (
                <div style={{ position:'absolute', inset:0, width:done?'100%':'60%',
                  background: cur ? `linear-gradient(90deg,${T.acDk},${T.acLt})` : T.ac,
                  borderRadius:2, boxShadow: cur?`0 0 8px ${T.acGlow}`:'none' }}/>
              )}
            </div>
          );
        })}
      </div>
      {/* Labels */}
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:9 }}>
        {labels.map((l,i) => (
          <div key={l} style={{ flex:1, display:'flex', justifyContent:'center' }}>
            <span style={{ fontFamily:MON, fontSize:7.5, fontWeight:500,
              letterSpacing:'1.8px', textTransform:'uppercase',
              color: i===step?T.acLt:i<step?T.t3:T.t5 }}>
              {l}
            </span>
          </div>
        ))}
      </div>
      {/* Eyebrow + title */}
      <div style={{ marginTop:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <span style={{ fontFamily:MON, fontSize:9.5, fontWeight:600, color:T.ac,
                         letterSpacing:'1.6px', textTransform:'uppercase' }}>
            ÉTAPE {step+1}/{total}
          </span>
          <span style={{ width:14, height:1, background:T.t5 }}/>
          <span style={{ fontFamily:MON, fontSize:9.5, fontWeight:500, color:T.t3,
                         letterSpacing:'1.6px', textTransform:'uppercase' }}>
            {eyebrow}
          </span>
        </div>
        <div style={{ fontFamily:SER, fontSize:34, fontWeight:400, letterSpacing:'-1.3px',
                      color:T.t1, lineHeight:1.02, marginTop:8 }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize:12, fontWeight:500, color:T.t3, lineHeight:1.5, marginTop:8, maxWidth:330 }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

// ── NavButtons ────────────────────────────────────────────────────────────────
function NavBtns({ nextLabel, enabled, gen, onNext, onBack, showBack=true }) {
  return (
    <div style={{ padding:'22px 20px 0', display:'flex', flexDirection:'column', gap:8 }}>
      <button className="ob-tap" onClick={enabled?onNext:undefined} style={{
        width:'100%', padding:'16px', borderRadius:14,
        background: enabled
          ? `linear-gradient(180deg,${T.acLt} 0%,${T.ac} 50%,${T.acDk} 100%)`
          : T.surfHi,
        color: enabled ? T.t1 : T.t4,
        border: `1px solid ${enabled?T.acLt+'60':T.bd}`,
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        fontFamily:F, fontSize:14, fontWeight:600, letterSpacing:0.1,
        boxShadow: enabled
          ? 'inset 0 1px 0 rgba(255,255,255,0.28), 0 8px 22px rgba(45,93,201,0.42)'
          : 'none',
        opacity: enabled ? 1 : 0.65,
      }}>
        {gen && <OI n="sparkles" sz={15} s={1.9} c={enabled?T.t1:T.t4}/>}
        {nextLabel}
        {!gen && <OI n="arrowR" sz={14} s={1.9} c={enabled?T.t1:T.t4}/>}
      </button>
      {showBack && onBack && (
        <button className="ob-tap" onClick={onBack} style={{
          width:'100%', padding:'14px', borderRadius:14,
          background:'transparent', color:T.t3, border:`1px solid ${T.bd}`,
          display:'flex', alignItems:'center', justifyContent:'center', gap:7,
          fontFamily:F, fontSize:12.5, fontWeight:600,
        }}>
          <OI n="arrowL" sz={13} s={1.9}/> Retour
        </button>
      )}
    </div>
  );
}

// ── FieldLabel ────────────────────────────────────────────────────────────────
function FL({ children, required, optional }) {
  return (
    <div style={{ fontFamily:F, fontSize:11.5, fontWeight:600, color:T.t3,
                  letterSpacing:0.2, marginBottom:8,
                  display:'flex', alignItems:'center', gap:5 }}>
      <span>{children}</span>
      {required && <span style={{ color:T.ac }}>*</span>}
      {optional && <span style={{ fontFamily:MON, fontSize:8, color:T.t5,
                                  letterSpacing:'1.6px', textTransform:'uppercase' }}>FACULTATIF</span>}
    </div>
  );
}

// ── TextInput ─────────────────────────────────────────────────────────────────
function TxtInput({ value, placeholder, suffix, valid, type='text', onChange }) {
  return (
    <div style={{
      width:'100%', padding:'14px 16px', borderRadius:13, boxSizing:'border-box',
      background:T.surfFlat, border:`1px solid ${valid?T.bdAc:T.bd}`,
      display:'flex', alignItems:'center', justifyContent:'space-between',
    }}>
      {onChange ? (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          style={{ background:'transparent', border:'none', outline:'none',
                   fontFamily:F, fontSize:15, fontWeight:500, color:value?T.t1:T.t5,
                   flex:1, width:'100%' }}
        />
      ) : (
        <span style={{ fontFamily:F, fontSize:15, fontWeight:500,
                       color:value?T.t1:T.t5 }}>{value||placeholder}</span>
      )}
      {suffix && <span style={{ fontFamily:MON, fontSize:11, color:T.t4, flexShrink:0, marginLeft:6 }}>{suffix}</span>}
      {valid && !suffix && <OI n="check" sz={14} s={2.4} c={T.ac}/>}
    </div>
  );
}

// ── SelectRow (niveau d'expérience) ──────────────────────────────────────────
function SelRow({ label, meta, selected, onClick }) {
  return (
    <button className="ob-tap" onClick={onClick} style={{
      width:'100%', padding:'15px 16px', borderRadius:14, textAlign:'left',
      background: selected ? `linear-gradient(95deg,${T.acSoft},${T.surf} 75%)` : T.surf,
      border: `1px solid ${selected?T.bdAc:T.bd}`,
      display:'flex', alignItems:'center', justifyContent:'space-between', gap:10,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:11 }}>
        <span style={{ width:18, height:18, borderRadius:'50%',
          border:`1.5px solid ${selected?T.ac:T.bdHi}`,
          display:'grid', placeItems:'center',
          background:selected?T.ac:'transparent', flexShrink:0 }}>
          {selected && <span style={{ width:7, height:7, borderRadius:'50%', background:'#03060D' }}/>}
        </span>
        <span style={{ fontFamily:F, fontSize:14, fontWeight:600, color:T.t1 }}>{label}</span>
      </div>
      <span style={{ fontFamily:MON, fontSize:10.5, color:selected?T.acLt:T.t4 }}>{meta}</span>
    </button>
  );
}

// ── GoalCard ─────────────────────────────────────────────────────────────────
const GOAL_ICONS = {
  hypertrophie:'muscle', force:'barbell', poids:'flame',
  prep_physique:'zap', reathletisation:'pulse', sante:'heart',
};
// Chaque objectif a sa couleur sémantique — comme les intensités du programme
const GOAL_COLORS = {
  hypertrophie:   '#FB923C',  // orange doux = modéré planning
  force:          '#F87171',  // rouge doux  = lourd planning
  poids:          '#5B8DEF',  // bleu        = accent app
  prep_physique:  '#FBBF24',  // jaune doux  — énergie, vitesse
  reathletisation:'#A78BFA',  // violet doux — récup, soin
  sante:          '#34D399',  // vert        = léger planning
};
function GoalCrd({ id, label, selected, onClick }) {
  const ic  = GOAL_ICONS[id]  || 'zap';
  const col = GOAL_COLORS[id] || T.ac;
  return (
    <button className="ob-tap" onClick={onClick} style={{
      padding:'18px 14px 15px', borderRadius:16, textAlign:'center',
      position:'relative', overflow:'hidden',
      background: selected
        ? `linear-gradient(155deg, ${col} 0%, ${col}CC 55%, ${col}66 100%)`
        : T.surf,
      border: `1px solid ${selected ? col+'60' : T.bd}`,
      display:'flex', flexDirection:'column', alignItems:'center', gap:10,
      boxShadow: selected ? `0 16px 32px ${col}35` : 'none',
    }}>
      {selected && <div style={{ position:'absolute', top:0, left:0, right:0, height:1,
        background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.40),transparent)' }}/>}
      {selected && <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'radial-gradient(160% 60% at 20% 10%, rgba(255,255,255,0.18), transparent 55%)' }}/>}
      {selected && (
        <div style={{ position:'absolute', top:8, right:8, width:20, height:20,
          borderRadius:'50%', background:'rgba(0,0,0,0.22)',
          border:'1px solid rgba(255,255,255,0.25)',
          display:'grid', placeItems:'center' }}>
          <OI n="check" sz={11} s={2.8} c={T.t1}/>
        </div>
      )}
      <div style={{ width:42, height:42, borderRadius:13,
        background: selected ? 'rgba(0,0,0,0.18)' : `${col}18`,
        border: `1px solid ${selected ? 'rgba(255,255,255,0.18)' : col+'35'}`,
        display:'grid', placeItems:'center',
        color: selected ? T.t1 : col }}>
        <OI n={ic} sz={21} s={1.7}/>
      </div>
      <span style={{ fontFamily:F, fontSize:12.5, fontWeight:700,
        color: selected ? T.t1 : T.t2, letterSpacing:-0.1,
        textShadow: selected ? '0 1px 3px rgba(0,0,0,0.3)' : 'none' }}>
        {label}
      </span>
    </button>
  );
}

// ── EquipCard ─────────────────────────────────────────────────────────────────
const EQUIP_ICONS = {
  salle_complete:'building', halteres:'dumbbell', elastiques:'band',
  barre_traction:'pullup',   poids_corps:'person', machines:'gear',
};
function EquipCrd({ id, label, selected, onClick }) {
  const ic = EQUIP_ICONS[id] || 'gear';
  return (
    <button className="ob-tap" onClick={onClick} style={{
      padding:'18px 14px', borderRadius:16, textAlign:'center',
      position:'relative', overflow:'hidden',
      background: selected ? `linear-gradient(180deg,${T.surfHi},${T.surf})` : T.surf,
      border: `1px solid ${selected?T.bdAc:T.bd}`,
      display:'flex', flexDirection:'column', alignItems:'center', gap:11,
      boxShadow: selected ? '0 8px 22px rgba(45,93,201,0.22)' : 'none',
    }}>
      {selected && (
        <div style={{ position:'absolute', top:8, right:8, width:18, height:18,
          borderRadius:'50%', background:T.ac, display:'grid', placeItems:'center' }}>
          <OI n="check" sz={11} s={2.8} c="#03060D"/>
        </div>
      )}
      <div style={{ width:40, height:40, borderRadius:12,
        background:selected?T.acSoft:'rgba(178,190,210,0.05)',
        border:`1px solid ${selected?T.bdAc:T.bd}`,
        display:'grid', placeItems:'center', color:selected?T.acLt:T.t3 }}>
        <OI n={ic} sz={20} s={1.6}/>
      </div>
      <span style={{ fontFamily:F, fontSize:12.5, fontWeight:600,
                     color:selected?T.t1:T.t2 }}>{label}</span>
    </button>
  );
}

// ── Chip (pathologies) ────────────────────────────────────────────────────────
function Chip({ label, selected, onClick }) {
  return (
    <button className="ob-tap" onClick={onClick} style={{
      padding:'9px 14px', borderRadius:999,
      background:selected?T.acSoft:T.surf,
      border:`1px solid ${selected?T.bdAc:T.bd}`,
      color:selected?T.acLt:T.t3,
      fontFamily:F, fontSize:12, fontWeight:600, letterSpacing:0.1,
      display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap',
    }}>
      {selected && <OI n="check" sz={11} s={2.6} c={T.acLt}/>}
      {label}
    </button>
  );
}

// ── ZoneGroup (pathologies) ───────────────────────────────────────────────────
const ZONE_ICONS = { Dos:'spine', Épaule:'shoulder', Genou:'knee', Autres:'more' };
function ZoneGrp({ zone, items, selected, onToggle }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <div style={{ width:24, height:24, borderRadius:7,
          background:'rgba(178,190,210,0.05)', border:`1px solid ${T.bd}`,
          display:'grid', placeItems:'center', color:T.t3 }}>
          <OI n={ZONE_ICONS[zone]||'more'} sz={13} s={1.6}/>
        </div>
        <span style={{ fontFamily:MON, fontSize:9.5, fontWeight:500, color:T.t3,
                       letterSpacing:'1.6px', textTransform:'uppercase' }}>{zone}</span>
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
        {items.map(p => (
          <Chip key={p} label={p} selected={selected.includes(p)} onClick={()=>onToggle(p)}/>
        ))}
      </div>
    </div>
  );
}

// ── DayPicker ─────────────────────────────────────────────────────────────────
function DayPicker({ selected, onToggle }) {
  return (
    <div style={{ display:'flex', gap:5 }}>
      {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(d => {
        const on = selected.includes(d);
        return (
          <button key={d} className="ob-tap" onClick={()=>onToggle(d)} style={{
            flex:1, padding:'12px 0', borderRadius:11,
            background: on ? `linear-gradient(160deg,${T.acLt},${T.acDk})` : T.surf,
            border: `1px solid ${on?T.acLt:T.bd}`,
            color: on ? '#0A0F1C' : T.t3,
            fontFamily:F, fontSize:11, fontWeight:600, letterSpacing:-0.1,
            boxShadow: on ? `0 4px 10px ${T.acGlow}` : 'none',
          }}>{d}</button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL — logique inchangée
// ════════════════════════════════════════════════════════════════════════════
export default function AnalyseIA(props) {
  const { profil, photos, setPhotos, readFile, INT, loadIA, setLoadIA, loadMsg,
          setLoadMsg, corrigerFaibles, setCorrigerFaibles, setProg, setCycleStart,
          setCalSess, setProgView, setTab, cycles, setCycles, prog, push } = props;

  // ── État du formulaire (inchangé) ────────────────────────────────────────
  const [aStep, setAStep] = useState(0);
  const [form, setForm]   = useState({
    prenom: profil?.prenom || "", age: profil?.age || "",
    poids:  profil?.poids  || "", taille: profil?.taille || "",
    sexe:   profil?.sexe   || "", metier: "",
    niveau: "", jours: [], objectif: profil?.objectif || "",
    objectifPrecis: "", materiel: [], pathologies: [], sport: "",
  });

  const fileRefFace   = useRef();
  const fileRefDos    = useRef();
  const fileRefProfil = useRef();

  // ── Génération IA (inchangée) ────────────────────────────────────────────
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
      const rawText    = await callGenerateAPI({ photos:[photos.face,photos.dos,photos.profil], promptText });
      const parsed     = parseAIResponse(rawText);
      const np         = buildProgramFromAI(parsed, { form, cycles });
      if (prog && setCycles) {
        setCycles(prev => [...prev, {
          ...prog, archiveDate: new Date().toLocaleDateString("fr-FR"),
          chargesResume: summarizeProgramLoads(prog),
        }]);
      }
      setProg(np); setCycleStart(Date.now());
      setAStep(0); setPhotos({ face:null, dos:null, profil:null });
      const newSess = buildCalendarFromProgram(np, INT);
      setCalSess(prev => ({ ...prev, ...newSess }));
      if (setProgView) setProgView("today");
      if (setTab)      setTab("program");
      const pts = np.analyse?.points_faibles?.join(", ") || "";
      push("🎯", `Programme Cycle ${np.numero} créé !`, pts ? `Points faibles: ${pts}` : "Votre programme est prêt !");
      setLoadIA(false);
    } catch(e) {
      console.error("lancerIA error:", e);
      setLoadMsg(`Erreur: ${e.message}`);
      setTimeout(() => { setLoadIA(false); push("❌","Échec",e.message?.substring(0,80)||"Réessayez."); }, 2000);
    } finally { clearInterval(interval); }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const togglePath  = p => setForm(f => ({ ...f, pathologies:
    f.pathologies.includes(p) ? f.pathologies.filter(x=>x!==p)
    : [...f.pathologies.filter(x=>x!=="Aucune"), p] }));
  const toggleDay   = d => setForm(f => ({ ...f, jours:
    f.jours.includes(d) ? f.jours.filter(x=>x!==d) : [...f.jours,d] }));
  const toggleEquip = id => setForm(f => ({ ...f, materiel:
    f.materiel.includes(id) ? f.materiel.filter(x=>x!==id) : [...f.materiel,id] }));
  const photoCount = [photos.face,photos.dos,photos.profil].filter(Boolean).length;

  // ── Écran de génération ───────────────────────────────────────────────────
  if (loadIA) {
    const isError = loadMsg.startsWith("Erreur");
    const RING_R = 54;
    const CIRC   = 2 * Math.PI * RING_R;

    if (isError) return (
      <div style={{ padding:'0 20px' }}>
        <InjectCSS/>
        <div style={{ ...CARD, textAlign:'center', padding:'40px 20px', marginTop:20 }}>
          <div style={{ width:56, height:56, borderRadius:'50%',
            background:'rgba(248,113,113,0.12)', border:`1px solid rgba(248,113,113,0.3)`,
            display:'grid', placeItems:'center', margin:'0 auto 18px', color:T.red }}>
            <OI n="sparkles" sz={24}/>
          </div>
          <div style={{ fontFamily:SER, fontSize:22, color:T.red, marginBottom:8 }}>
            Génération échouée
          </div>
          <div style={{ fontSize:12, color:T.t3, marginBottom:24, lineHeight:1.6 }}>{loadMsg}</div>
          <button className="ob-tap" onClick={()=>{setLoadIA(false);setLoadMsg("");}}
            style={{ padding:'14px 24px', borderRadius:14,
              background:`linear-gradient(180deg,${T.acLt},${T.ac})`,
              color:T.t1, border:'none', fontFamily:F, fontSize:14, fontWeight:600, cursor:'pointer' }}>
            ← Réessayer
          </button>
        </div>
      </div>
    );

    return (
      <div style={{ padding:'0 20px' }}>
        <InjectCSS/>
        <div style={{ paddingTop:40, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
          {/* Anneau animé */}
          <div style={{ position:'relative', width:140, height:140, marginTop:20 }}>
            <div style={{ position:'absolute', inset:-8, borderRadius:'50%',
              background:`radial-gradient(closest-side,${T.acGlow},transparent 70%)`,
              filter:'blur(18px)', animation:'ob-breathe 3s ease-in-out infinite' }}/>
            <svg width="140" height="140" viewBox="0 0 140 140"
              style={{ position:'relative', transform:'rotate(-90deg)' }}>
              <circle cx="70" cy="70" r={RING_R} stroke="rgba(178,190,210,0.08)" strokeWidth="2" fill="none"/>
              <circle cx="70" cy="70" r={RING_R} stroke={T.ac} strokeWidth="2.5" fill="none"
                strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC*0.35}
                style={{ animation:'ob-spin 2s linear infinite', transformOrigin:'center' }}/>
            </svg>
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
                          alignItems:'center', justifyContent:'center' }}>
              <OI n="sparkles" sz={28} c={T.acLt} s={1.6}/>
            </div>
          </div>

          <div style={{ fontFamily:MON, fontSize:9.5, fontWeight:600, color:T.ac,
                        letterSpacing:'1.6px', textTransform:'uppercase', marginTop:28 }}>
            GÉNÉRATION EN COURS
          </div>
          <div style={{ fontFamily:SER, fontSize:28, letterSpacing:'-1px', color:T.t1,
                        marginTop:8, lineHeight:1.1 }}>
            L'IA construit<br/>
            <span style={{ fontStyle:'italic', color:T.acLt }}>ton programme.</span>
          </div>
          <div style={{ fontFamily:F, fontSize:13, color:T.t3, marginTop:14,
                        lineHeight:1.5, maxWidth:280 }}>
            {loadMsg}
          </div>
        </div>

        {/* Tâches skeleton */}
        <div style={{ ...CARD, padding:'8px 16px', marginTop:28 }}>
          {LOAD_MESSAGES.slice(0,5).map((m,i) => {
            const cur  = m === loadMsg;
            const done = LOAD_MESSAGES.indexOf(loadMsg) > i;
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12,
                padding:'13px 0', borderBottom:i<4?`1px solid ${T.bd}`:'none' }}>
                <span style={{ width:22, height:22, borderRadius:'50%', flexShrink:0,
                  border:`1.5px solid ${done?T.ac:cur?T.acLt:T.bdHi}`,
                  background:done?T.ac:'transparent', display:'grid', placeItems:'center' }}>
                  {done ? <OI n="check" sz={12} s={2.8} c="#03060D"/>
                   : cur ? <span style={{ width:7, height:7, borderRadius:'50%',
                              background:T.acLt, animation:'ob-pulse 1.2s ease-in-out infinite' }}/>
                   : null}
                </span>
                <span style={{ flex:1, fontFamily:F, fontSize:13, fontWeight:600,
                               color:done?T.t3:cur?T.t1:T.t4 }}>{m}</span>
                {cur  && <span style={{ fontFamily:MON, fontSize:8.5, color:T.acLt,
                                        letterSpacing:'1.5px', textTransform:'uppercase' }}>EN COURS</span>}
                {done && <span style={{ fontFamily:MON, fontSize:8.5, color:T.t4,
                                        letterSpacing:'1.5px', textTransform:'uppercase' }}>OK</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Wizard ────────────────────────────────────────────────────────────────
  return (
    <div style={{ paddingBottom:32 }}>
      <InjectCSS/>

      {/* ÉTAPE 0 — PHOTOS ──────────────────────────────────────────────────── */}
      {aStep===0 && <>
        <Stepper step={0} eyebrow="PHOTO"
          title={<>Analyse <span style={{ fontStyle:'italic', color:T.acLt }}>morpho.</span></>}
          subtitle="3 photos permettent à l'IA de détecter ta morphologie et tes points faibles. Position droite, vêtements près du corps."/>

        <div style={{ padding:'18px 20px 0' }}>
          {/* Bandeau confidentialité */}
          <div style={{ ...CARD, padding:'12px 14px', display:'flex', gap:10,
            alignItems:'center', marginBottom:16,
            background:'rgba(91,141,239,0.05)', border:`1px solid ${T.bdAc}` }}>
            <OI n="shield" sz={18} c={T.acLt} s={1.6}/>
            <span style={{ fontSize:11, color:T.t2, fontWeight:500, lineHeight:1.5 }}>
              Photos chiffrées et privées. Analyse locale, jamais partagées.
            </span>
          </div>

          {/* Slots photo */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {[
              { key:"face",   label:"De face",   view:"face",   hint:"Face à l'objectif, bras le long du corps", ref:fileRefFace },
              { key:"dos",    label:"De dos",     view:"dos",    hint:"Dos à l'objectif, bras le long du corps",  ref:fileRefDos  },
              { key:"profil", label:"De profil",  view:"profil", hint:"Côté droit ou gauche, position droite",   ref:fileRefProfil },
            ].map(({ key, label, view, hint, ref }) => {
              const filled = !!photos[key];
              return (
                <div key={key}>
                  {/* Label slot */}
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <span style={{ width:18, height:18, borderRadius:'50%',
                      border:`1.5px solid ${filled?T.ac:T.bdHi}`,
                      display:'grid', placeItems:'center', background:filled?T.ac:'transparent' }}>
                      {filled && <OI n="check" sz={11} s={2.6} c="#03060D"/>}
                    </span>
                    <span style={{ fontFamily:F, fontSize:13.5, fontWeight:600, color:T.t1 }}>{label}</span>
                    <span style={{ fontFamily:MON, fontSize:8, color:T.t4, letterSpacing:'1.8px',
                                   textTransform:'uppercase', marginLeft:'auto' }}>{view.toUpperCase()}</span>
                  </div>
                  {/* Zone upload */}
                  <button className="ob-tap" onClick={()=>ref.current?.click()} style={{
                    width:'100%', padding:'22px 16px', borderRadius:16,
                    background: filled
                      ? `linear-gradient(180deg,${T.surfHi},${T.surf})`
                      : 'rgba(13,19,34,0.40)',
                    border: `1.5px dashed ${filled?T.bdAc:'rgba(178,190,210,0.16)'}`,
                    display:'flex', flexDirection:'column', alignItems:'center', gap:10,
                    position:'relative', overflow:'hidden',
                  }}>
                    {filled && (
                      <div style={{ position:'absolute', top:8, right:8,
                        padding:'3px 7px', borderRadius:6,
                        background:T.acSoft, border:`1px solid ${T.bdAc}` }}>
                        <span style={{ fontFamily:MON, fontSize:8, fontWeight:600,
                                       color:T.acLt, letterSpacing:0.4 }}>AJOUTÉE</span>
                      </div>
                    )}
                    {filled
                      ? <img src={photos[key]} alt={label}
                          style={{ width:'100%', height:120, objectFit:'cover', borderRadius:8 }}/>
                      : <>
                          <Silhouette view={view}/>
                          <div style={{ display:'flex', alignItems:'center', gap:6, color:T.ac }}>
                            <OI n="camera" sz={14} s={1.7}/>
                            <span style={{ fontFamily:F, fontSize:12, fontWeight:600 }}>
                              Galerie ou photo
                            </span>
                          </div>
                          <span style={{ fontSize:10.5, color:T.t4, textAlign:'center' }}>{hint}</span>
                        </>
                    }
                  </button>
                </div>
              );
            })}
          </div>

          {/* Compteur photos */}
          <div style={{ marginTop:16, display:'flex', alignItems:'center',
                        justifyContent:'center', gap:8 }}>
            <div style={{ display:'flex', gap:4 }}>
              {[photos.face,photos.dos,photos.profil].map((f,i) => (
                <span key={i} style={{ width:18, height:4, borderRadius:2,
                  background:f?T.ac:'rgba(178,190,210,0.14)' }}/>
              ))}
            </div>
            <span style={{ fontFamily:MON, fontSize:9, fontWeight:500, color:T.t4,
                           letterSpacing:'1.8px', textTransform:'uppercase' }}>
              {photoCount} / 3 PHOTOS
            </span>
          </div>
        </div>

        {/* Inputs fichier cachés (logique inchangée) */}
        <input ref={fileRefFace}   type="file" accept="image/*" style={{display:"none"}} onChange={e=>readFile("face",  e.target.files[0])}/>
        <input ref={fileRefDos}    type="file" accept="image/*" style={{display:"none"}} onChange={e=>readFile("dos",   e.target.files[0])}/>
        <input ref={fileRefProfil} type="file" accept="image/*" style={{display:"none"}} onChange={e=>readFile("profil",e.target.files[0])}/>

        <NavBtns
          nextLabel={photoCount>0?"Continuer":"Ajoutez au moins 1 photo"}
          enabled={photoCount>0}
          onNext={()=>setAStep(1)}
          showBack={false}
        />
      </>}

      {/* ÉTAPE 1 — PROFIL ──────────────────────────────────────────────────── */}
      {aStep===1 && <>
        <Stepper step={1} eyebrow="PROFIL"
          title={<>Qui es-<span style={{ fontStyle:'italic', color:T.acLt }}>tu ?</span></>}
          subtitle="Ces données calibrent les charges, le volume et la nutrition de ton programme."/>

        <div style={{ padding:'18px 20px 0' }}>
          <div style={{ ...CARD }}>
            {/* Prénom */}
            <div style={{ marginBottom:16 }}>
              <FL optional>Prénom</FL>
              <input value={form.prenom} onChange={e=>setForm({...form,prenom:e.target.value})}
                placeholder="Prénom" autoComplete="off"
                style={{ width:'100%', padding:'14px 16px', borderRadius:13, boxSizing:'border-box',
                  background:T.surfFlat, border:`1px solid ${T.bd}`,
                  fontFamily:F, fontSize:15, fontWeight:500, color:T.t1, outline:'none' }}/>
            </div>
            {/* Âge + Sexe */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
              <div>
                <FL required>Âge</FL>
                <input type="number" placeholder="27"
                  value={form.age} onChange={e=>setForm({...form,age:e.target.value})}
                  style={{ width:'100%', padding:'14px 16px', borderRadius:13, boxSizing:'border-box',
                    background:T.surfFlat, border:`1px solid ${form.age?T.bdAc:T.bd}`,
                    fontFamily:F, fontSize:15, fontWeight:500, color:T.t1, outline:'none' }}/>
              </div>
              <div>
                <FL required>Sexe</FL>
                <select value={form.sexe} onChange={e=>setForm({...form,sexe:e.target.value})}
                  style={{ width:'100%', padding:'14px 16px', borderRadius:13, boxSizing:'border-box',
                    background:T.surfFlat, border:`1px solid ${form.sexe?T.bdAc:T.bd}`,
                    fontFamily:F, fontSize:15, fontWeight:500, color:form.sexe?T.t1:T.t5,
                    outline:'none', appearance:'none' }}>
                  <option value="">Choisir…</option>
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                </select>
              </div>
            </div>
            {/* Poids + Taille */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>
                <FL required>Poids</FL>
                <div style={{ position:'relative' }}>
                  <input type="number" placeholder="75"
                    value={form.poids} onChange={e=>setForm({...form,poids:e.target.value})}
                    style={{ width:'100%', padding:'14px 44px 14px 16px', borderRadius:13, boxSizing:'border-box',
                      background:T.surfFlat, border:`1px solid ${form.poids?T.bdAc:T.bd}`,
                      fontFamily:F, fontSize:15, fontWeight:500, color:T.t1, outline:'none' }}/>
                  <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                    fontFamily:MON, fontSize:11, color:T.t4 }}>kg</span>
                </div>
              </div>
              <div>
                <FL required>Taille</FL>
                <div style={{ position:'relative' }}>
                  <input type="number" placeholder="178"
                    value={form.taille} onChange={e=>setForm({...form,taille:e.target.value})}
                    style={{ width:'100%', padding:'14px 44px 14px 16px', borderRadius:13, boxSizing:'border-box',
                      background:T.surfFlat, border:`1px solid ${form.taille?T.bdAc:T.bd}`,
                      fontFamily:F, fontSize:15, fontWeight:500, color:T.t1, outline:'none' }}/>
                  <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                    fontFamily:MON, fontSize:11, color:T.t4 }}>cm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Niveau */}
          <div style={{ marginTop:18 }}>
            <FL required>Niveau d'expérience</FL>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[{id:"debutant",l:"Débutant",d:"< 1 an"},
                {id:"intermediaire",l:"Intermédiaire",d:"1–3 ans"},
                {id:"avance",l:"Avancé",d:"> 3 ans"}].map(n => (
                <SelRow key={n.id} label={n.l} meta={n.d}
                  selected={form.niveau===n.id}
                  onClick={()=>setForm({...form,niveau:n.id})}/>
              ))}
            </div>
          </div>

          {(!form.age||!form.poids||!form.taille||!form.sexe||!form.niveau) && (
            <div style={{ marginTop:12, padding:'10px 14px', borderRadius:12,
              background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)',
              fontSize:11, color:T.red, lineHeight:1.5 }}>
              Remplis tous les champs marqués * pour continuer
            </div>
          )}
        </div>

        <NavBtns
          nextLabel="Continuer"
          enabled={!!(form.age&&form.poids&&form.taille&&form.sexe&&form.niveau)}
          onNext={()=>setAStep(2)} onBack={()=>setAStep(0)}
        />
      </>}

      {/* ÉTAPE 2 — OBJECTIF ─────────────────────────────────────────────────── */}
      {aStep===2 && <>
        <Stepper step={2} eyebrow="OBJECTIF"
          title={<>Ton <span style={{ fontStyle:'italic', color:T.acLt }}>but.</span></>}
          subtitle="Un objectif principal. L'IA structure tout le mésocycle autour de lui."/>

        <div style={{ padding:'18px 20px 0' }}>
          <FL required>Objectif principal</FL>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[{id:"hypertrophie",l:"Prise de muscle"},{id:"force",l:"Force"},
              {id:"poids",l:"Perte de poids"},{id:"prep_physique",l:"Prépa physique"},
              {id:"reathletisation",l:"Réathlé"},{id:"sante",l:"Santé"}].map(o => (
              <GoalCrd key={o.id} id={o.id} label={o.l}
                selected={form.objectif===o.id}
                onClick={()=>setForm({...form,objectif:o.id})}/>
            ))}
          </div>

          {/* Objectif précis */}
          <div style={{ marginTop:18 }}>
            <FL optional>Objectif précis</FL>
            <textarea
              value={form.objectifPrecis}
              onChange={e=>setForm({...form,objectifPrecis:e.target.value})}
              placeholder="Ex : prendre 4 kg de muscle sec d'ici septembre…"
              style={{ width:'100%', padding:'14px 16px', borderRadius:13, boxSizing:'border-box',
                background:T.surfFlat, border:`1px solid ${T.bd}`,
                fontFamily:F, fontSize:13.5, fontWeight:500, color:T.t1, minHeight:60,
                resize:'vertical', outline:'none', lineHeight:1.5 }}/>
          </div>

          {/* Sport pratiqué */}
          <div style={{ marginTop:18 }}>
            <FL optional>Sport pratiqué</FL>
            <input value={form.sport||""} onChange={e=>setForm({...form,sport:e.target.value})}
              placeholder="Football, Tennis, Natation, Boxe…" autoComplete="off"
              style={{ width:'100%', padding:'14px 16px', borderRadius:13, boxSizing:'border-box',
                background:T.surfFlat, border:`1px solid ${T.bd}`,
                fontFamily:F, fontSize:15, fontWeight:500, color:T.t1, outline:'none' }}/>
          </div>

          {/* Jours */}
          <div style={{ marginTop:18 }}>
            <FL required>Jours d'entraînement</FL>
            <DayPicker selected={form.jours} onToggle={toggleDay}/>
            {form.jours.length>0 && (
              <div style={{ marginTop:9, display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:T.ac }}/>
                <span style={{ fontSize:11, color:T.t3, fontWeight:500 }}>
                  {form.jours.length} jour{form.jours.length>1?'s':''} sélectionné{form.jours.length>1?'s':''}
                </span>
              </div>
            )}
          </div>

          {(!form.objectif||form.jours.length===0) && (
            <div style={{ marginTop:12, padding:'10px 14px', borderRadius:12,
              background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)',
              fontSize:11, color:T.red, lineHeight:1.5 }}>
              {!form.objectif && "* Sélectionne un objectif principal"}
              {form.jours.length===0 && <div>* Sélectionne au moins 1 jour</div>}
            </div>
          )}
        </div>

        <NavBtns
          nextLabel="Continuer"
          enabled={!!(form.objectif&&form.jours.length>0)}
          onNext={()=>setAStep(3)} onBack={()=>setAStep(1)}
        />
      </>}

      {/* ÉTAPE 3 — PATHOLOGIES ──────────────────────────────────────────────── */}
      {aStep===3 && <>
        <Stepper step={3} eyebrow="SANTÉ"
          title={<>Douleurs &<br/><span style={{ fontStyle:'italic', color:T.acLt }}>pathologies.</span></>}
          subtitle="L'IA adapte ou retire les exercices à risque selon tes antécédents."/>

        <div style={{ padding:'18px 20px 0' }}>
          {/* Disclaimer médical */}
          <div style={{ ...CARD, padding:'13px 14px', display:'flex', gap:10, alignItems:'flex-start',
            marginBottom:18, background:'rgba(91,141,239,0.05)', border:`1px solid ${T.bdAc}` }}>
            <OI n="info" sz={17} c={T.acLt} s={1.6}/>
            <span style={{ fontSize:11, color:T.t2, lineHeight:1.5 }}>
              Exercices correctifs = renforcement uniquement. Consulte un kiné pour tout diagnostic.
            </span>
          </div>

          {/* Zones */}
          {[
            { z:"Dos",    items:["Lombalgie","Hernie discale","Scoliose","Cervicalgie"] },
            { z:"Épaule", items:["Conflit épaule","Coiffe rotateurs"] },
            { z:"Genou",  items:["Ménisque","LCA","Tendinite","Arthrose"] },
            { z:"Autres", items:["Épicondylite","Canal carpien","Tendinite Achille","Coxarthrose"] },
          ].map(zone => (
            <ZoneGrp key={zone.z} zone={zone.z} items={zone.items}
              selected={form.pathologies} onToggle={togglePath}/>
          ))}

          {/* Aucune pathologie */}
          <div style={{ paddingTop:4 }}>
            <button className="ob-tap"
              onClick={()=>setForm(f=>({...f,pathologies:["Aucune"]}))}
              style={{ width:'100%', padding:'13px', borderRadius:13,
                background: form.pathologies.includes("Aucune") ? T.acSoft : T.surfFlat,
                border: `1px dashed ${form.pathologies.includes("Aucune")?T.bdAc:T.bdHi}`,
                color:T.t2, fontFamily:F, fontSize:12.5, fontWeight:600,
                display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
              <OI n="check" sz={13} s={2.2} c={T.t3}/> Aucune pathologie
            </button>
          </div>
        </div>

        <NavBtns
          nextLabel="Continuer"
          enabled={form.pathologies.length>0}
          onNext={()=>setAStep(4)} onBack={()=>setAStep(2)}
        />
      </>}

      {/* ÉTAPE 4 — MATÉRIEL ─────────────────────────────────────────────────── */}
      {aStep===4 && <>
        <Stepper step={4} eyebrow="MATÉRIEL"
          title={<>Ton <span style={{ fontStyle:'italic', color:T.acLt }}>équipement.</span></>}
          subtitle="L'IA ne proposera que des exercices réalisables avec ce que tu as."/>

        <div style={{ padding:'18px 20px 0' }}>
          <FL required>Matériel disponible</FL>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[{id:"salle_complete",l:"Salle complète"},{id:"halteres",l:"Haltères"},
              {id:"elastiques",l:"Élastiques"},{id:"barre_traction",l:"Barre traction"},
              {id:"poids_corps",l:"Poids du corps"},{id:"machines",l:"Machines"}].map(m => (
              <EquipCrd key={m.id} id={m.id} label={m.l}
                selected={form.materiel.includes(m.id)}
                onClick={()=>toggleEquip(m.id)}/>
            ))}
          </div>

          {/* Corriger points faibles */}
          <button className="ob-tap"
            onClick={()=>setCorrigerFaibles(v=>!v)}
            style={{ marginTop:16, width:'100%', padding:'15px 16px', borderRadius:16, textAlign:'left',
              background: corrigerFaibles ? `linear-gradient(95deg,${T.acSoft},${T.surf} 80%)` : T.surf,
              border: `1px solid ${corrigerFaibles?T.bdAc:T.bd}`,
              display:'flex', alignItems:'center', gap:13 }}>
            <div style={{ width:26, height:26, borderRadius:8, flexShrink:0,
              background:corrigerFaibles?T.ac:'transparent',
              border:`1.5px solid ${corrigerFaibles?T.ac:T.bdHi}`,
              display:'grid', placeItems:'center',
              boxShadow:corrigerFaibles?`0 4px 10px ${T.acGlow}`:'none' }}>
              {corrigerFaibles && <OI n="check" sz={15} s={2.8} c="#03060D"/>}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:F, fontSize:13.5, fontWeight:600, color:T.t1 }}>
                Corriger mes points faibles
              </div>
              <div style={{ fontSize:11, color:T.t3, marginTop:2, lineHeight:1.4 }}>
                L'IA priorisera les groupes en retard détectés sur tes photos.
              </div>
            </div>
          </button>

          {/* Récapitulatif */}
          <div style={{ ...CARD, marginTop:16, padding:'14px 16px' }}>
            <div style={{ fontFamily:MON, fontSize:9.5, fontWeight:500, color:T.t3,
                          letterSpacing:'1.6px', textTransform:'uppercase', marginBottom:12 }}>
              RÉCAPITULATIF
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {[
                { l:'Objectif', v:{hypertrophie:"Prise de muscle",force:"Force",poids:"Perte de poids",prep_physique:"Prépa physique",reathletisation:"Réathlé",sante:"Santé"}[form.objectif]||"—" },
                { l:'Niveau',   v:{debutant:"Débutant",intermediaire:"Intermédiaire",avance:"Avancé"}[form.niveau]||"—" },
                { l:'Fréquence',v:form.jours.length>0?`${form.jours.length} jours / sem`:"—" },
                { l:'Contraintes', v:form.pathologies.length>0?form.pathologies.join(", "):"Aucune" },
              ].map(r => (
                <div key={r.l} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:11.5, fontWeight:500, color:T.t3 }}>{r.l}</span>
                  <span style={{ fontFamily:F, fontSize:12, fontWeight:600, color:T.t1 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>

          {form.materiel.length===0 && (
            <div style={{ marginTop:12, padding:'10px 14px', borderRadius:12,
              background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)',
              fontSize:11, color:T.red }}>
              * Sélectionne au moins un équipement
            </div>
          )}
        </div>

        <NavBtns
          nextLabel="Générer mon programme"
          enabled={form.materiel.length>0}
          gen
          onNext={lancerIA}
          onBack={()=>setAStep(3)}
        />
      </>}
    </div>
  );
}
