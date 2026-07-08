import { C, FONT, SERIF } from "../../data/constants.js";
import { Card, Eyebrow } from "../../components/ui/index.jsx";

const FEATURES = [
  { icon:"💪", label:"Programme morphologique personnalisé",  sub:"Adapté à ta morphologie, tes objectifs et ton niveau" },
  { icon:"📅", label:"Planification 6 semaines clé en main",  sub:"Cycles progressifs avec surcharge programmée" },
  { icon:"🔬", label:"Analyse morphologique complète",         sub:"Évaluation posture, points faibles, déséquilibres" },
  { icon:"📊", label:"Bilan de progression bi-mensuel",        sub:"Suivi détaillé de tes progrès toutes les 2 semaines" },
  { icon:"⚡", label:"Méthodes d'intensification avancées",    sub:"Drop sets, pyramidal, surcharge progressive" },
  { icon:"🎯", label:"Exercices correctifs sur mesure",        sub:"Adaptés à tes limitations ou pathologies" },
];

export function Paywall({ onSubscribe, onClose }) {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:340,
      background:"rgba(15,25,35,0.5)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"0 16px",
    }}>
      <Card padding="none" variant="accent" style={{
        padding:"24px 20px",
        width:"100%", maxWidth:400,
        boxShadow: C.shadow,
        position:"relative", overflow:"hidden",
        maxHeight:"90vh", overflowY:"auto",
      }}>
        {/* Lueur */}
        <div style={{
          position:"absolute", top:-60, left:"50%", transform:"translateX(-50%)",
          width:300, height:160, borderRadius:"50%",
          background:"radial-gradient(closest-side,rgba(59,130,246,0.25),transparent 70%)",
          filter:"blur(20px)", pointerEvents:"none",
        }}/>

        {/* Fermer */}
        <button onClick={onClose} style={{
          position:"absolute", top:14, right:14,
          width:30, height:30, borderRadius:8,
          background:"rgba(0,0,0,0.05)",
          border:`1px solid ${C.bd}`,
          color:C.mid, fontSize:20,
          display:"grid", placeItems:"center", cursor:"pointer",
        }}>×</button>

        {/* Badge + Titre */}
        <div style={{ textAlign:"center", marginBottom:20, position:"relative" }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"4px 16px", borderRadius:20,
            background:"rgba(59,130,246,0.12)",
            border:"1px solid rgba(59,130,246,0.35)",
            fontSize:11, fontWeight:700, color:"#1D4ED8",
            fontFamily:FONT, letterSpacing:"0.1em", textTransform:"uppercase",
            marginBottom:16,
          }}>💪 Entraînement PRO</div>

          <div style={{ fontFamily:SERIF, fontSize:26, color:C.text, letterSpacing:-0.5, lineHeight:1.3, marginBottom:8 }}>
            Entraîne-toi smarter,<br/>
            <span style={{ fontStyle:"italic" }}>progresse faster</span>
          </div>
          <div style={{ fontSize:13, color:C.mid, fontFamily:FONT, lineHeight:1.6 }}>
            Un programme conçu pour ton corps,<br/>pas pour tout le monde.
          </div>
        </div>

        {/* Features */}
        <Card padding="none" style={{ padding:"4px 16px", marginBottom:20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"12px 0",
              borderBottom: i < FEATURES.length - 1 ? `1px solid rgba(0,0,0,0.05)` : "none",
            }}>
              <span style={{ fontSize:20, flexShrink:0 }}>{f.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.text, fontFamily:FONT }}>{f.label}</div>
                <div style={{ fontSize:11, color:C.mid, marginTop:1, fontFamily:FONT }}>{f.sub}</div>
              </div>
              <div style={{
                width:20, height:20, borderRadius:8, flexShrink:0,
                background:"rgba(59,130,246,0.12)",
                border:"1px solid rgba(59,130,246,0.25)",
                display:"grid", placeItems:"center",
                fontSize:11, color:"#1D4ED8", fontWeight:700,
              }}>✓</div>
            </div>
          ))}
        </Card>

        {/* Prix */}
        <div style={{ textAlign:"center", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"center", gap:8 }}>
            <span style={{ fontFamily:SERIF, fontSize:44, color:C.text, letterSpacing:-1, lineHeight:1 }}>19.99€</span>
            <span style={{ fontSize:13, color:C.mid, fontFamily:FONT }}>/cycle</span>
          </div>
          <div style={{ fontSize:11, color:"${C.dim}", fontFamily:FONT, marginTop:4 }}>
            Sans engagement · Résiliable à tout moment
          </div>
        </div>

        {/* CTA */}
        <button onClick={onSubscribe} style={{
          width:"100%", padding:"16px 16px",
          background:"linear-gradient(135deg,#1D4ED8,#3B82F6)",
          border:"1px solid rgba(0,0,0,0.08)",
          borderRadius:16, color:"#FFF",
          fontSize:14, fontWeight:700, fontFamily:FONT,
          cursor:"pointer", marginBottom:12,
          boxShadow:"0 4px 20px rgba(59,130,246,0.35)",
          position:"relative", overflow:"hidden",
        }}>
          <div style={{
            position:"absolute", top:0, left:0, right:0, height:1,
            background:"linear-gradient(90deg,transparent,rgba(0,0,0,0.12),transparent)",
          }}/>
          Activer Entraînement PRO
        </button>

        <button onClick={onClose} style={{
          width:"100%", padding:"12px 16px",
          background:"transparent", border:`1px solid ${C.bd}`,
          borderRadius:16, color:C.mid,
          fontSize:13, fontWeight:500, fontFamily:FONT, cursor:"pointer",
        }}>
          Continuer en gratuit
        </button>
      </Card>
    </div>
  );
}
