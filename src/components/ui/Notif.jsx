import { C, FONT } from "../../data/constants.js";

// Note: l'auto-dismiss est géré dans useNotif (timer 4500ms).
// Pas de useEffect/setTimeout ici pour éviter le doublon de timers.

export function Notif({ n, onClose }) {
  if (!n) return null;
  return (
    <div className="notif np" style={{
      position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", zIndex:9999,
      background:C.s1,
      border:`1px solid ${C.bdHi}`,
      borderRadius:14,
      padding:"12px 16px",
      display:"flex", alignItems:"center", gap:12,
      boxShadow:"0 8px 32px rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.04)",
      maxWidth:320, width:"90vw",
      fontFamily:FONT,
    }}>
      <span style={{ fontSize:18, flexShrink:0 }}>{n.icon}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{
          fontSize:13, fontWeight:600, color:C.text, lineHeight:1.3,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
        }}>{n.title}</div>
        {n.body && (
          <div style={{
            fontSize:11.5, color:C.mid, marginTop:2, lineHeight:1.4,
          }}>{n.body}</div>
        )}
      </div>
      <button
        onClick={onClose}
        aria-label="Fermer la notification"
        style={{
          background:"none", border:"none", cursor:"pointer",
          color:C.dim, fontSize:18, padding:"0 2px", flexShrink:0, lineHeight:1,
        }}
      >×</button>
    </div>
  );
}
