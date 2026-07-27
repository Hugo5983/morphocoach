import { C, DARK, FONT } from"../../../data/constants.js";
import { I } from"../../../components/ui/Icon.jsx";
import { useMemo } from"react";

// ─── CARD SEMAINE — VARIANTE B BLEU (design blanc + accent #3C5BFF) ─────────
// État 1 : !premium         → verrouillé, flou, CTA conversion PRO
// État 2 : premium && !data → déverrouillé, données insuffisantes
// État 3 : premium && data  → expérience premium complète
export default function CoachWeekCard({ semC, semN, totalJours, premium, onUnlock, onFirstSeance }) {
  const F = FONT;
  const done  = semC || 0;
  const total = totalJours || 0;
  const ratio = total > 0 ? done / total : 0;

  // Détecte si des séances ont vraiment été loggées avec des charges
  // Analyse possible uniquement avec de vraies données : au moins une séance
  // validée cette semaine ET du volume réellement loggé (charges saisies).
  const hasRealData = useMemo(() => {
    if (!done) return false;
    try {
      const log = JSON.parse(localStorage.getItem('morpho_workout_log') ||'{}');
      return Object.values(log).some(d => d?.totalVolume > 0 || (d?.sets||[]).length > 0);
    } catch(e) { return false; }
  }, [done]);

  // Sommeil moyen sur les 7 derniers jours — mêmes données que la carte
  // Aujourd'hui (morpho_sleep_log), jamais une valeur inventée : "—" si vide.
  const sommeilMoy = useMemo(() => {
    try {
      const log = JSON.parse(localStorage.getItem('morpho_sleep_log') ||'{}');
      const today = new Date(); today.setHours(0,0,0,0);
      const vals = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        if (typeof log[key] ==='number') vals.push(log[key]);
      }
      return vals.length ? vals.reduce((a,b)=>a+b,0) / vals.length : null;
    } catch(e) { return null; }
  }, [done]);

  // Métriques calculées depuis les vraies données
  const fatigueLbl = ratio < 0.35 ?"Basse"     : ratio < 0.70 ?"Modérée"   :"Élevée";
  const fatigueCol = ratio < 0.35 ? C.green   : ratio < 0.70 ?"#F59E0B"   : C.red;
  const fatigueBar = ratio < 0.35 ? 0.20        : ratio < 0.70 ? 0.55        : 0.90;
  const recupPct   = Math.round(100 - ratio * 32);
  const recupCol   = recupPct >= 80 ? C.accent : recupPct >= 60 ?"#F59E0B" : C.red;
  const recupBar   = recupPct / 100;
  const risqueLbl  = ratio < 0.35 ?"Faible"    : ratio < 0.70 ?"Vigilance" :"Élevé";
  const risqueCol  = ratio < 0.35 ?"#F59E0B"   : ratio < 0.70 ?"#F59E0B"   : C.red;
  const risqueBar  = ratio < 0.35 ? 0.15        : ratio < 0.70 ? 0.55        : 0.90;

  // Styles partagés
  const cardShell = {
    borderRadius: 20,
    overflow:"hidden",
    marginBottom: 16,
    background:"#FFFFFF",
    boxShadow: C.shadow,
    border:"1px solid #F2F4F7",
    position:"relative",
  };

  // Barre accent bleue en haut de la card
  const AccentBar = () => null;

  // Pills Semaine + statut
  const PillsSemaine = ({ statusLabel ="En forme", statusColor ="#12B76A", statusBg ="#E8EBFF", statusBorder ="#E8EBFF" }) => (
    <div style={{display:"flex", gap:8, marginBottom:8}}>
      <div style={{
        padding:"4px 12px", borderRadius:20,
        background:"#F1F3FF", border:"1px solid #DCE2FF",
        fontSize:10, fontWeight:700, color:C.accentDk, fontFamily:F,
        letterSpacing:0.2,
      }}>
        Semaine {semN}
      </div>
      <div style={{
        padding:"4px 12px", borderRadius:20,
        background:statusBg, border:`1px solid ${statusBorder}`,
        fontSize:10, fontWeight:700, color:statusColor, fontFamily:F,
        display:"flex", alignItems:"center", gap:4,
      }}>
        <div style={{width:5,height:5,borderRadius:"50%",background:statusColor}}/>
        {statusLabel}
      </div>
    </div>
);

  // Anneau récup bleu
  const RecupRing = ({ value, color = C.accent }) => {
    const r = 26;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - value / 100);
    return (
      <div style={{position:"relative", width:62, height:62, flexShrink:0}}>
        <svg width="62" height="62" viewBox="0 0 62 62" style={{transform:"rotate(-90deg)"}}>
          <circle cx="31" cy="31" r={r} fill="none" stroke="#F1F3FF" strokeWidth="5"/>
          <circle cx="31" cy="31" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"/>
        </svg>
        <div style={{
          position:"absolute", inset:0,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:0,
        }}>
          <span style={{fontSize:20, fontWeight:700, color, lineHeight:1, fontFamily:F}}>{value}</span>
          <span style={{fontSize:8, fontWeight:700, color:"#98A2B3", textTransform:"uppercase", letterSpacing:0.2, fontFamily:F}}>Récup</span>
        </div>
      </div>
);
  };

  const METRIC_ICONS = { "Fatigue":"flame", "Récup.":"heart", "Risque":"alert" };

  // Métriques row (3 chips)
  const MetricsRow = ({ items }) => (
    <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16}}>
      {items.map((s,i) => (
        <div key={i} style={{
          borderRadius:12, padding:"12px 8px", textAlign:"center",
          background:"#F6F7F9", border:"1px solid #F2F4F7",
        }}>
          <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:4, marginBottom:4}}>
            <I name={METRIC_ICONS[s.l] || "chart"} size={14} color={s.c} stroke={2}/>
            <span style={{fontSize:14, fontWeight:700, color:s.c, fontFamily:F, letterSpacing:-0.2}}>{s.v}</span>
          </div>
          <div style={{height:3, borderRadius:2, background:"#EAECF0", overflow:"hidden", margin:"4px 0"}}>
            <div style={{width:`${s.bar*100}%`, height:"100%", borderRadius:2, background:s.c}}/>
          </div>
          <div style={{fontSize:10, fontWeight:700, color:"#98A2B3", fontFamily:F, textTransform:"uppercase", letterSpacing:0.2}}>{s.l}</div>
        </div>
))}
    </div>
);

  // Bouton principal"Analyser ma semaine"
  const BtnAnalyse = ({ onClick }) => (
    <button onClick={onClick} style={{
      width:"100%", padding:"16px", border:"none", borderRadius:16,
      background:"linear-gradient(135deg,#2E48D9,#3C5BFF)", color:"white",
      fontSize:14, fontWeight:700, fontFamily:F,
      boxShadow:"0 4px 16px rgba(60,91,255,0.35)",
      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      cursor:"pointer", letterSpacing:0.2,
    }}>
       Analyser ma semaine
      <span style={{
        background:"rgba(255,255,255,0.12)", padding:"4px 8px",
        borderRadius:8, fontSize:11, fontWeight:600,
      }}>Sem. {semN}</span>
    </button>
);

  // ── ÉTAT 1 : GRATUIT — contenu flouté + overlay de conversion ────────────────
  if (!premium) return (
    <div style={{position:"relative", marginBottom:16}}>
      {/* Carte blanche floue derrière */}
      <div style={{...cardShell, filter:"blur(1.5px)", opacity:0.55, userSelect:"none", pointerEvents:"none"}}>
        <AccentBar/>
        <div style={{padding:"20px 20px 20px"}}>
          <PillsSemaine/>
          <div style={{fontSize:20, fontWeight:700, color:DARK.surface, lineHeight:1.2, letterSpacing:-0.3, marginBottom:4, fontFamily:F}}>
            Ta semaine est prête 
          </div>
          <div style={{fontSize:13, color:"#98A2B3", marginBottom:16, fontFamily:F}}>Fatigue basse · bon signal</div>
          <MetricsRow items={[
            {v:"Basse", l:"Fatigue", c:C.green, bar:0.20},
            {v:"87%",   l:"Récup.",  c:C.accent, bar:0.87},
            {v:"Faible",l:"Risque",  c:"#F59E0B", bar:0.15},
          ]}/>
          <BtnAnalyse/>
        </div>
      </div>

      {/* Badge PRO coin supérieur droit */}
      <div style={{
        position:"absolute", top:14, right:14, zIndex:20,
        display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:28,
        background:"linear-gradient(135deg,#3C5BFF,#2E48D9)",
        boxShadow:"0 4px 14px rgba(201,145,47,0.5)",
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span style={{fontSize:10, fontWeight:700, color:"#FFF", fontFamily:F, letterSpacing:"0.1em"}}>PRO</span>
      </div>

      {/* Overlay conversion */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, bottom:0, zIndex:10, borderRadius:20,
        background:"linear-gradient(180deg,rgba(246,248,251,0.15) 0%,rgba(246,248,251,0.94) 30%,rgba(246,248,251,0.98) 100%)",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        padding:"20px",
      }}>
        <div style={{
          width:56, height:56, borderRadius:16,
          background:"linear-gradient(135deg,rgba(60,91,255,0.12),rgba(46,72,217,0.25))",
          border:"1px solid rgba(60,91,255,0.25)",
          display:"grid", placeItems:"center", marginBottom:12,
          boxShadow:"0 8px 24px rgba(60,91,255,0.18)",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div style={{fontSize:14, fontWeight:700, color:DARK.surface, fontFamily:F, textAlign:"center", letterSpacing:-0.2, marginBottom:8}}>
           Réservé aux membres PRO
        </div>
        <div style={{fontSize:13, color:"#667085", fontFamily:F, textAlign:"center", lineHeight:1.6, marginBottom:20, maxWidth:240}}>
          Débloque ton plan hebdomadaire personnalisé selon tes performances et ton évolution.
        </div>
        <button onClick={onUnlock} style={{
          width:"100%", padding:"16px", borderRadius:16, border:"none", cursor:"pointer",
          background:"linear-gradient(135deg,#2E48D9,#3C5BFF)",
          color:"#FFF", fontSize:14, fontWeight:700, fontFamily:F,
          boxShadow:"0 8px 24px rgba(60,91,255,0.35)", marginBottom:12,
          display:"flex", alignItems:"center", justifyContent:"center", gap:8, letterSpacing:-0.2,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFF" stroke="none">
            <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>
          </svg>
          Passer au PRO
        </button>
        <button onClick={onUnlock} style={{
          width:"100%", padding:"12px", borderRadius:16, cursor:"pointer",
          background:"rgba(15,23,42,0.05)", border:"1px solid #EAECF0",
          color:"#344054", fontSize:13, fontWeight:600, fontFamily:F,
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        }}>
          Découvrir les avantages
        </button>
      </div>
    </div>
);

  // ── ÉTAT 2 : PRO SANS DONNÉES — risque impossible à calculer ──────────────────
  if (!hasRealData) return (
    <div style={cardShell}>
      <div style={{padding:"16px"}}>
        {/* Header : titre + badge statut */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14}}>
          <span style={{fontSize:16, fontWeight:800, color:DARK.surface, fontFamily:F}}>État de forme</span>
          <span style={{display:"flex", alignItems:"center", gap:5, fontSize:11, fontWeight:800, color:"#98A2B3", background:"#F6F7F9", padding:"5px 11px", borderRadius:99, fontFamily:F}}>
            <span style={{width:7, height:7, borderRadius:"50%", background:"#98A2B3"}}/>
            En attente
          </span>
        </div>

        <div style={{textAlign:"center", padding:"8px 0 18px"}}>
          <div style={{
            width:58, height:58, borderRadius:16,
            background:"#E8EBFF", border:"1px solid #E8EBFF",
            display:"grid", placeItems:"center", margin:"0 auto 14px",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke={C.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18M7 16l4-8 4 5 3-3"/>
            </svg>
          </div>
          <div style={{fontSize:17, fontWeight:800, color:DARK.surface, fontFamily:F, letterSpacing:-0.2, marginBottom:8}}>
            Pas encore de données
          </div>
          <div style={{fontSize:13, color:C.dim, lineHeight:1.6, fontFamily:F, maxWidth:280, margin:"0 auto"}}>
            Le coach évalue ton risque de surentraînement à partir de tes séances validées, charges, sommeil, alimentation et douleurs. Lance ta première séance pour activer l'analyse.
          </div>
        </div>

        <button onClick={onFirstSeance} style={{
          width:"100%", padding:"16px", borderRadius:16, border:"none", cursor:"pointer",
          background:"linear-gradient(135deg,#2E48D9,#3C5BFF)",
          color:"#FFF", fontSize:14, fontWeight:700, fontFamily:F,
          boxShadow:"0 6px 20px rgba(60,91,255,0.35)",
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Faire ma première séance
        </button>
      </div>
    </div>
);

  // ── ÉTAT 3 : PRO AVEC DONNÉES — jauge de risque façon maquette 2a ─────────────
  const risquePillLbl   = ratio < 0.35 ?"Risque faible" : ratio < 0.70 ?"Risque modéré" :"Risque élevé";
  const risquePillColor = ratio < 0.35 ? C.green : ratio < 0.70 ?"#F59E0B" : C.red;
  const risquePillBg    = ratio < 0.35 ?"#E7F7F0" : ratio < 0.70 ?"rgba(245,158,11,0.12)" :"rgba(229,72,77,0.12)";

  const tip = ratio < 0.35
    ?"Ta charge progresse sans accumuler de fatigue. Tu peux garder ce rythme cette semaine."
    : ratio < 0.70
    ?"Ta fatigue monte. Priorise le sommeil et garde une marge sur tes prochaines séries."
    :"Fatigue élevée cette semaine. Envisage une séance plus légère ou un jour de repos supplémentaire.";

  const sommeilTxt = sommeilMoy != null ?`${sommeilMoy.toFixed(1).replace(".",",")}h` :"—";

  return (
    <div style={cardShell}>
      <div style={{padding:"16px", display:"flex", flexDirection:"column", gap:14}}>

        {/* Header : titre + badge risque */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <span style={{fontSize:16, fontWeight:800, color:DARK.surface, fontFamily:F}}>État de forme</span>
          <span style={{display:"flex", alignItems:"center", gap:5, fontSize:11, fontWeight:800, color:risquePillColor, background:risquePillBg, padding:"5px 11px", borderRadius:99, fontFamily:F}}>
            <span style={{width:7, height:7, borderRadius:"50%", background:risquePillColor}}/>
            {risquePillLbl}
          </span>
        </div>

        {/* Jauge risque */}
        <div style={{display:"flex", flexDirection:"column", gap:6}}>
          <div style={{position:"relative", height:9, borderRadius:99, background:`linear-gradient(90deg,${C.green} 0%,#F59E0B 55%,${C.red} 100%)`}}>
            <span style={{position:"absolute", top:"50%", left:`${risqueBar*100}%`, transform:"translate(-50%,-50%)", width:16, height:16, borderRadius:99, background:"#fff", border:`3px solid ${DARK.surface}`, boxShadow:"0 1px 4px rgba(0,0,0,0.25)"}}/>
          </div>
          <div style={{display:"flex", justifyContent:"space-between", fontSize:9.5, fontWeight:800, letterSpacing:"0.03em", color:"#9AA3B2", fontFamily:F}}>
            <span>OPTIMAL</span><span>VIGILANCE</span><span>SURENTRAÎN.</span>
          </div>
        </div>

        {/* Fatigue · Récup · Sommeil */}
        <div style={{display:"flex", gap:9}}>
          {[
            {l:"FATIGUE", v:fatigueLbl,   c:fatigueCol},
            {l:"RÉCUP.",  v:`${recupPct}%`, c:DARK.surface},
            {l:"SOMMEIL", v:sommeilTxt,   c:DARK.surface},
          ].map(m => (
            <div key={m.l} style={{flex:1, background:"#F6F7FB", borderRadius:14, padding:"12px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:3}}>
              <span style={{fontSize:9.5, fontWeight:800, letterSpacing:"0.04em", color:"#9AA3B2", fontFamily:F}}>{m.l}</span>
              <span style={{fontSize:15, fontWeight:800, color:m.c, fontFamily:F}}>{m.v}</span>
            </div>
          ))}
        </div>

        {/* Conseil coach */}
        <div style={{display:"flex", alignItems:"flex-start", gap:9, background:"#EEF1FF", borderRadius:12, padding:"11px 13px"}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={C.accent} style={{flexShrink:0, marginTop:1}}>
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2Zm0-8h-2V7h2Z"/>
          </svg>
          <span style={{fontSize:12.5, fontWeight:500, color:"#3949AB", lineHeight:1.5, fontFamily:F}}>{tip}</span>
        </div>
      </div>
    </div>
);
}


// ─── PROGRESSION DE LA SEMAINE CHART ─────────────────────────────────────────
