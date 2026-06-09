import { C, FONT, SERIF } from "../../data/constants.js";
import { Card, Eyebrow } from "../../components/ui/index.jsx";

const FEATURES = [
  { icon:"📚", label:"+500 recettes premium complètes",       sub:"Ingrédients, étapes détaillées, curseur calories" },
  { icon:"🎯", label:"Conseils nutritionnels personnalisés",   sub:"Selon ton objectif, profil et régime alimentaire" },
  { icon:"📷", label:"Estimation macros par photo de repas",   sub:"Analyse instantanée — jusqu'à 120 photos/mois" },
  { icon:"📊", label:"Bilan nutritionnel bi-mensuel",          sub:"Analyse complète de tes apports toutes les 2 semaines" },
  { icon:"🥦", label:"Suivi fruits & légumes quotidien",       sub:"Tracker avec objectifs personnalisés" },
  { icon:"📈", label:"Recommandations actionnables",           sub:"Conseils concrets pour progresser chaque semaine" },
];

export function PaywallNutrition({ onSubscribe, onClose }) {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:500,
      background:"rgba(5,8,18,0.96)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"0 16px",
    }}>
      <Card padding="none" style={{
        border:"1px solid rgba(16,185,129,0.22)",
        padding:"24px 20px",
        width:"100%", maxWidth:400,
        boxShadow:"0 24px 80px rgba(0,0,0,0.60)",
        position:"relative", overflow:"hidden",
        maxHeight:"90vh", overflowY:"auto",
      }}>
        {/* Lueur verte */}
        <div style={{
          position:"absolute", top:-60, left:"50%", transform:"translateX(-50%)",
          width:300, height:160, borderRadius:"50%",
          background:"radial-gradient(closest-side,rgba(16,185,129,0.18),transparent 70%)",
          filter:"blur(20px)", pointerEvents:"none",
        }}/>

        {/* Fermer */}
        <button onClick={onClose} style={{
          position:"absolute", top:14, right:14,
          width:30, height:30, borderRadius:8,
          background:"rgba(0,0,0,0.05)",
          border:`1px solid ${C.bd}`,
          color:"rgba(242,244,247,0.45)", fontSize:18,
          display:"grid", placeItems:"center", cursor:"pointer",
        }}>×</button>

        {/* Badge + Titre */}
        <div style={{ textAlign:"center", marginBottom:18, position:"relative" }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:6,
            padding:"5px 14px", borderRadius:20,
            background:"rgba(16,185,129,0.12)",
            border:"1px solid rgba(16,185,129,0.30)",
            fontSize:11, fontWeight:700, color:"#6EE7B7",
            fontFamily:FONT, letterSpacing:"0.8px", textTransform:"uppercase",
            marginBottom:14,
          }}>🥗 Nutrition PRO</div>

          <div style={{ fontFamily:SERIF, fontSize:24, color:C.text, letterSpacing:-0.5, lineHeight:1.25, marginBottom:8 }}>
            Mange mieux,<br/>
            <span style={{ fontStyle:"italic" }}>progresse plus vite</span>
          </div>
          <div style={{ fontSize:12, color:"rgba(242,244,247,0.50)", fontFamily:FONT, lineHeight:1.55 }}>
            Tout ce qu'il faut pour optimiser<br/>ta nutrition au quotidien.
          </div>
        </div>

        {/* Features */}
        <Card padding="none" style={{ padding:"4px 14px", marginBottom:18 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"10px 0",
              borderBottom: i < FEATURES.length - 1 ? `1px solid rgba(0,0,0,0.04)` : "none",
            }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{f.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.text, fontFamily:FONT }}>{f.label}</div>
                <div style={{ fontSize:11, color:"rgba(242,244,247,0.45)", marginTop:1, fontFamily:FONT }}>{f.sub}</div>
              </div>
              <div style={{
                width:20, height:20, borderRadius:6, flexShrink:0,
                background:"rgba(16,185,129,0.12)",
                border:"1px solid rgba(16,185,129,0.25)",
                display:"grid", placeItems:"center",
                fontSize:10, color:"#6EE7B7", fontWeight:700,
              }}>✓</div>
            </div>
          ))}
        </Card>

        {/* Prix */}
        <div style={{ textAlign:"center", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"center", gap:6 }}>
            <span style={{ fontFamily:SERIF, fontSize:44, color:C.text, letterSpacing:-1.5, lineHeight:1 }}>6.99€</span>
            <span style={{ fontSize:13, color:"rgba(242,244,247,0.45)", fontFamily:FONT }}>/mois</span>
          </div>
          <div style={{ fontSize:11, color:"${C.dim}", fontFamily:FONT, marginTop:4 }}>
            Sans engagement · Résiliable à tout moment
          </div>
        </div>

        {/* CTA */}
        <button onClick={onSubscribe} style={{
          width:"100%", padding:"14px 16px",
          background:"linear-gradient(135deg,#059669,#10B981)",
          border:"1px solid rgba(0,0,0,0.09)",
          borderRadius:14, color:"#fff",
          fontSize:15, fontWeight:700, fontFamily:FONT,
          cursor:"pointer", marginBottom:10,
          boxShadow:"0 4px 20px rgba(16,185,129,0.35)",
          position:"relative", overflow:"hidden",
        }}>
          <div style={{
            position:"absolute", top:0, left:0, right:0, height:1,
            background:"linear-gradient(90deg,transparent,rgba(0,0,0,0.12),transparent)",
          }}/>
          Activer Nutrition PRO
        </button>

        <button onClick={onClose} style={{
          width:"100%", padding:"12px 16px",
          background:"transparent", border:`1px solid ${C.bd}`,
          borderRadius:14, color:"rgba(242,244,247,0.40)",
          fontSize:13, fontWeight:500, fontFamily:FONT, cursor:"pointer",
        }}>
          Continuer en gratuit
        </button>
      </Card>
    </div>
  );
}
