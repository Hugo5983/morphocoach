// ─── PAYWALL ────────────────────────────────────────────────────────────────
import { C } from "../../data/constants.js";
import { Btn, Row } from "../ui/index.jsx";

const FEATURES = [
  "Programme unique selon votre morphologie",
  "Exercices correctifs pathologies",
  "Guides techniques avancés",
  "Cycle 6 semaines optimisé",
];

export function Paywall({ onSubscribe, onClose }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(8,9,14,0.95)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:18}}>
      <div style={{background:C.s1,border:"1px solid rgba(200,150,62,.3)",borderRadius:14,padding:"24px 20px",width:"100%",maxWidth:400}}>
        <div style={{fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",fontSize:24,letterSpacing:2,color:C.gold,textAlign:"center",marginBottom:6}}>ACCÈS PREMIUM</div>
        <div style={{fontSize:12,color:"rgba(245,241,232,0.50)",textAlign:"center",marginBottom:16}}>Cette fonctionnalité est réservée aux membres Premium.</div>
        {FEATURES.map((f) => (
          <Row key={f} style={{marginBottom:8,gap:9}}>
            <div style={{width:15,height:15,borderRadius:"50%",background:"rgba(56,199,117,.12)",border:"1px solid rgba(56,199,117,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:C.green,flexShrink:0}}>✓</div>
            <span style={{fontSize:12}}>{f}</span>
          </Row>
        ))}
        <div style={{textAlign:"center",margin:"14px 0"}}>
          <div style={{fontFamily:"'Space Grotesk','Inter',system-ui,sans-serif",fontSize:26,color:C.gold,letterSpacing:-0.5,fontWeight:300}}>
            19.99€<span style={{fontSize:11,color:"rgba(245,241,232,0.50)",fontFamily:"'Inter',sans-serif",fontWeight:400}}> /cycle</span>
          </div>
        </div>
        <Btn onClick={onSubscribe}>Commencer maintenant</Btn>
        <Btn v="ghost" onClick={onClose}>Continuer en gratuit</Btn>
      </div>
    </div>
  );
}
