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

// ── Tokens (thème clair — aligné sur l'app) ──────────────────────────────────
const T = {
  bg:'#F6F8FB', surf:'#FFFFFF', surfHi:'#FFFFFF', surfFlat:'#F0F2F7',
  bd:'rgba(0,0,0,0.06)', bdHi:'rgba(0,0,0,0.10)', bdAc:'rgba(59,130,246,0.35)',
  t1:'#0F1923', t2:'#374151', t3:'#6B7280',
  t4:'rgba(107,114,128,0.62)', t5:'rgba(107,114,128,0.32)',
  ac:'#3B82F6', acLt:'#60A5FA', acDk:'#2563EB',
  acSoft:'rgba(59,130,246,0.10)', acGlow:'rgba(59,130,246,0.18)',
  green:'#34D399', red:'#F87171',
};
const F   = "'Outfit','DM Sans',system-ui,sans-serif";
const SER = "'DM Serif Display','Georgia',serif";
const MON = '"JetBrains Mono",ui-monospace,monospace';

const CARD = {
  background:   T.surf,
  border:       `1px solid ${T.bd}`,
  borderRadius: 20,
  boxShadow:    '0 1px 3px rgba(15,25,35,0.04), 0 8px 24px -12px rgba(15,25,35,0.12)',
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
    muscle:  <><path d="M13.6 3.4a2 2 0 0 0-3.3 1.5v3.4L7 11.5a3 3 0 0 0-1 2.2V19a2 2 0 0 0 2 2h6.5a2 2 0 0 0 2-1.6l.8-4.6a6 6 0 0 0-3.7-6.6"/><path d="M10.3 8.3a5 5 0 0 1 4.4 2.7"/></>,
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
    gear:    <><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.6M12 18.9v2.6M21.5 12h-2.6M5.1 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1 5.3 5.3"/></>,
    // ── Zones corps — icônes anatomiques lisibles ─────────────────────────────
    spine:   <><path d="M12 2.5v19"/><path d="M8.5 4.5h7M8 8h8M8 11.5h8M8 15h8M8.5 18.5h7"/></>,
    shoulder:<><circle cx="8" cy="7" r="3.2"/><path d="M9.5 9.6c2.5 1 4.5 3.2 5.2 6l.8 3.4"/><path d="M5 10c-1.5 1.5-2 3.5-2 5.5V19"/></>,
    knee:    <><path d="M9 2.5v6.5a3.5 3.5 0 0 0 3.5 3.5H16"/><path d="M9 12.5V21.5"/><circle cx="9" cy="10.5" r="2.6"/></>,
    bone:    <><path d="m9.5 14.5 5-5"/><path d="M8.2 15.8a2.3 2.3 0 1 1-2-2 2.3 2.3 0 1 1 2 2Z"/><path d="M15.8 8.2a2.3 2.3 0 1 0 2 2 2.3 2.3 0 1 0-2-2Z"/></>,
    more:    <><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></>,
  };
  return <svg {...p}>{P[n]||null}</svg>;
}

// ── Silhouette : vraies photos de référence (issues de l'infographie) ──────────
const POSE_IMGS = {
  face:   "data:image/jpeg;base64,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",
  dos:    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wAARCAE5AQQDASIAAhEBAxEB/8QAHAABAAIDAQEBAAAAAAAAAAAAAAUGAgMEBwEI/8QARBAAAQMDAgMECQIEAA0FAAAAAQACAwQFERIhBhMxIkFCUQcUMmFxgZGhscHRFSNSchYkJTM0NUNic4Ky8PE2Y5Kiwv/EABsBAQEBAQADAQAAAAAAAAAAAAABAgMEBQYH/8QAJhEBAQACAQMCBgMAAAAAAAAAAAECESEDEjETQQQiMlFhkUKh8P/aAAwDAQACEQMRAD8A/SCIiAiIgIid6AiIgIiICIiAiIgIiIBRMogIiICIiAiIgIneiAiIgIiICIEQEREHzUPNMjzWtFdI25B70WpZtdnqmlZIi1k5KgzyPNNQ8wuaWohgcBLNHGTuA94bn6rEVlKSAKmEk9MSN/db7azuOvUPMJqHmteUWdK2ah5hNQ81rRNDZqHmmR5rWiaG3UPNNQ81qRNDZqHmmoeYWtE0Nuoea+ZHmtaJobMjzTI81rRNDZkeaZHmFrRNDZkeaZHmFrRNDZkeaah5rWiaGzI80yPNa0TQ2ZHmmoea1omhs1DzRa0TQIiKgvreq+IEGw+yVrG7h8Vn4StecOHxUivz1d3y3TiyqdWVLA6WqcwyzHsxt1EDPkAFsvFppbfR0lXS1ra2mqjI1r+SYzlhAOx6jfYrnuEApuKqplfE97I6t5liDtLnN1k4z3ZHf7108RXmju88L6SknphE3liN8rXRsYOjWANGkDfzyv0ad2+nMPp1+NeOPz+nzF181vl65wDWT1vBFukle6SQB0etxySGvIG/wAXJDxTfH0tZcBaqWago55Y5AydwmLWHBcARg7b4yur0eNlg4EtwkiLC7W8A7bF5IP0XFFw3xF6jXW1tbQU9FWzyyPla175mtkO4GcNzhfIZTpev1e/X1e+/G7vw91O/08Nb8Jup4tsdE2B1RcGR8+JszctJwx3RzsA6R7yt0vENriuMdC6saaiTThrWlw7XsguAwM92TuoOr4VuFJ63BZpqQUtdTR0sjaoOLogxmgFuPa2PQ961t4RuNNeKGS31EFNT0zYWPnbJI2aVkYwWvZ7D89xPQLnOj8LZvu9v97cf3trv6u/C5Inei9a8oREQEREBERAREQEREBERAREQEREBERAREQEREBERBn4SsFn4SsFIrhq7Ja6+bnVdupaiXGNckTXHHxWhnDFiY4ObZqAOHfyG/spVF1nV6kmplf2xcMbzo2DQAAANgAE7kRc2hEXxB9XxfUQEREBFHuvFOZSyA84tOCWns5+Pet8Va1+NTSz39QoOlERUEREBERARO5EBERAREQEREBERARRHC95mv/DlLcqikFHJOHExNkEgGHEdR8FLd6AvqIgzHslYLPwlYKQfF9RFQREQF8X1EHxfURAUPxZWSUHClwniJbII9LXDqC4hufuphU30nXGSg4VZExrHR1czYZC4HsjqMe/IUERw5Xs9XY3V3K4RVLHQdRleS2KWWF+G5IBV2pKuQxAnICirnb5OZSnfOlxaF1KE4dqecyeMEHlkOPmCf/Cm1pBERAREQEREBERAREQEREBERBppqSmoo3R0tPFTsc90hbEwNBcTknA7ydytyIgIiIM/CVgs/CVgpAREVBERAREQEREBRHE9kpr/AGCooqoO0Y5jXMOHNc3cEf8AfQqXXLWVkcED2uw55aQ1neThB5dwdbRLC+SQnDun0V0gooxQbNyVrtdmbbrc1rfC0BSEcohkMRGxGVlXTZKGCjppZYg7XVv50hcc74wAPcAFJLnpCwwMY0gFoxhYxXOjlqGwMlOt2dGWODX466SRh2PctzG3xEtk8upEwT3FPkoCJg+RTB8kBEIIG4UVXcTWi2V/qVbVGGUMbI4mJ5YxrnFrS54GloJBG5HRBKotbp4WmTMrBy/by4dj4+XzWmuuNNbac1FXM2GIYGo79+Nh39UHUixEsRcG81mou0gahknGcfHC0Ulyo65z2U9Q18kbWufGdnsDhlupp3GR5oOlERAwiIgIiICBEQZ+ErArPwlYKQERFQREQEREBYvkZGMve1o95wobiO+fwmKOGNwFRPkg/wBDB1d+gUNSV4qWhzyd99zkn4qbHfXcTE1bqemyyNuxlPV3w8gvtNIyU5B1OPUnfK5qqnpZow4tD35xstNNSGluAEcriwjOgnooqwYP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",
  profil: "data:image/jpeg;base64,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",
};
function Silhouette({ view }) {
  const src = POSE_IMGS[view] || POSE_IMGS.face;
  return (
    <img src={src} alt={view}
      style={{ width:'100%', maxHeight:220, objectFit:'contain', objectPosition:'center bottom',
               display:'block', userSelect:'none', pointerEvents:'none' }}/>
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
                                  background:'rgba(0,0,0,0.05)', position:'relative' }}>
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
          ? 'inset 0 1px 0 rgba(0,0,0,0.14), 0 8px 22px rgba(45,93,201,0.42)'
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
          {selected && <span style={{ width:7, height:7, borderRadius:'50%', background:'#fff' }}/>}
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
        background:'linear-gradient(90deg,transparent,rgba(0,0,0,0.16),transparent)' }}/>}
      {selected && <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'radial-gradient(160% 60% at 20% 10%, rgba(0,0,0,0.10), transparent 55%)' }}/>}
      {selected && (
        <div style={{ position:'absolute', top:8, right:8, width:20, height:20,
          borderRadius:'50%', background:'rgba(255,255,255,0.95)',
          border:'1px solid rgba(255,255,255,0.6)',
          display:'grid', placeItems:'center' }}>
          <OI n="check" sz={11} s={2.8} c={col}/>
        </div>
      )}
      <div style={{ width:42, height:42, borderRadius:13,
        background: selected ? 'rgba(255,255,255,0.22)' : `${col}18`,
        border: `1px solid ${selected ? 'rgba(255,255,255,0.35)' : col+'35'}`,
        display:'grid', placeItems:'center',
        color: selected ? '#fff' : col }}>
        <OI n={ic} sz={21} s={1.7}/>
      </div>
      <span style={{ fontFamily:F, fontSize:12.5, fontWeight:700,
        color: selected ? '#fff' : T.t2, letterSpacing:-0.1,
        textShadow: 'none' }}>
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
const EQUIP_COLORS = {
  salle_complete:'#3B82F6', halteres:'#6366F1', elastiques:'#14B8A6',
  barre_traction:'#F59E0B', poids_corps:'#EC4899', machines:'#8B5CF6',
};
function EquipCrd({ id, label, selected, onClick }) {
  const ic = EQUIP_ICONS[id] || 'gear';
  const col = EQUIP_COLORS[id] || '#3B82F6';
  return (
    <button className="ob-tap" onClick={onClick} style={{
      padding:'18px 14px', borderRadius:16, textAlign:'center',
      position:'relative', overflow:'hidden',
      background: selected ? `linear-gradient(180deg,${T.surfHi},${T.surf})` : T.surf,
      border: `1px solid ${selected?T.bdAc:T.bd}`,
      display:'flex', flexDirection:'column', alignItems:'center', gap:11,
      boxShadow: selected ? '0 8px 22px rgba(45,93,201,0.22)' : 'none',
      opacity: selected ? 1 : 0.62,
    }}>
      {selected && (
        <div style={{ position:'absolute', top:8, right:8, width:18, height:18,
          borderRadius:'50%', background:T.ac, display:'grid', placeItems:'center' }}>
          <OI n="check" sz={11} s={2.8} c="#fff"/>
        </div>
      )}
      <div style={{ width:42, height:42, borderRadius:13,
        background:`linear-gradient(145deg,${col},${col}DD)`,
        boxShadow:`0 4px 12px ${col}45`,
        display:'grid', placeItems:'center', color:'#fff' }}>
        <OI n={ic} sz={21} s={1.8} c="#fff"/>
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
const ZONE_ICONS = { Dos:'spine', Épaule:'shoulder', Genou:'knee', Autres:'bone' };
function ZoneGrp({ zone, items, selected, onToggle }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <div style={{ width:24, height:24, borderRadius:7,
          background:'rgba(0,0,0,0.03)', border:`1px solid ${T.bd}`,
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
            color: on ? '#fff' : T.t3,
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
              <circle cx="70" cy="70" r={RING_R} stroke="rgba(0,0,0,0.06)" strokeWidth="2" fill="none"/>
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
                  {done ? <OI n="check" sz={12} s={2.8} c="#fff"/>
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
                      {filled && <OI n="check" sz={11} s={2.6} c="#fff"/>}
                    </span>
                    <span style={{ fontFamily:F, fontSize:13.5, fontWeight:600, color:T.t1 }}>{label}</span>
                    <span style={{ fontFamily:MON, fontSize:8, color:T.t4, letterSpacing:'1.8px',
                                   textTransform:'uppercase', marginLeft:'auto' }}>{view.toUpperCase()}</span>
                  </div>
                  {/* Zone upload */}
                  <button type="button" className="ob-tap"
                    onClick={()=>{ if (ref.current) { ref.current.value=""; ref.current.click(); } }} style={{
                    width:'100%', padding:0, borderRadius:16,
                    background: T.surfFlat,
                    border: `1.5px dashed ${filled?T.bdAc:T.bd}`,
                    display:'block', position:'relative', overflow:'hidden',
                    minHeight: 200,
                  }}>
                    {filled ? (
                      <>
                        <img src={photos[key]} alt={label}
                          style={{ width:'100%', minHeight:200, objectFit:'cover', display:'block' }}/>
                        <div style={{ position:'absolute', top:8, right:8,
                          padding:'3px 7px', borderRadius:6,
                          background:T.acSoft, border:`1px solid ${T.bdAc}` }}>
                          <span style={{ fontFamily:MON, fontSize:8, fontWeight:600,
                                         color:T.acLt, letterSpacing:0.4 }}>AJOUTÉE</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Silhouette view={view}/>
                        {/* Overlay bouton en bas */}
                        <div style={{ position:'absolute', bottom:0, left:0, right:0,
                          padding:'12px 14px',
                          background:'linear-gradient(180deg,transparent,rgba(246,248,251,0.96) 40%)',
                          display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:7,
                            background:`linear-gradient(145deg,${T.ac},${T.acDk})`,
                            color:'#fff', padding:'10px 20px', borderRadius:12,
                            boxShadow:`0 6px 18px -6px rgba(59,130,246,0.8)`,
                            fontFamily:F, fontSize:13, fontWeight:700 }}>
                            <OI n="camera" sz={15} s={1.9} c="#fff"/>
                            Galerie ou photo
                          </div>
                          <span style={{ fontSize:10.5, color:T.t4, textAlign:'center', fontFamily:F }}>{hint}</span>
                        </div>
                      </>
                    )}
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
                  background:f?T.ac:'rgba(0,0,0,0.10)' }}/>
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
              {corrigerFaibles && <OI n="check" sz={15} s={2.8} c="#fff"/>}
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
