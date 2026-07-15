import { useEffect } from"react";
import { C, FONT } from"../../data/constants.js";

export function Notif({ n, onClose }) {
  useEffect(() => {
    if (!n) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [n]);
  if (!n) return null;
  return (
    <>
      <style>{`
        @keyframes notif-drop {
          0%   { transform: translate(-50%, -120%); opacity: 0; }
          60%  { transform: translate(-50%, 6%);    opacity: 1; }
          100% { transform: translate(-50%, 0);     opacity: 1; }
        }
`}</style>
      <div
        role="status"
        style={{
          position:"fixed",
          top:"max(14px, env(safe-area-inset-top, 14px))",
          left:"50%",
          transform:"translateX(-50%)",
          zIndex: 500,
          width:"calc(100vw - 32px)",
          maxWidth: 380,
          animation:"notif-drop .42s cubic-bezier(.2,.9,.25,1) both",
          pointerEvents:"auto",
        }}
      >
        <div
          style={{
            background:"rgba(255,255,255,0.85)",
            backdropFilter:"blur(20px) saturate(160%)",
            WebkitBackdropFilter:"blur(20px) saturate(160%)",
            border:`1px solid ${C.bdHi}`,
            borderRadius: 20,
            padding:"12px 16px 12px 16px",
            display:"flex",
            alignItems:"center",
            gap: 12,
            boxShadow: C.shadow,
            fontFamily: FONT,
          }}
        >
          {n.icon ? <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>{n.icon}</span> : <div style={{width:8,height:8,borderRadius:4,background:C.accent,flexShrink:0,marginTop:6}}/>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.3, letterSpacing: -0.2 }}>
              {n.title}
            </div>
            {n.body && (
              <div style={{ fontSize: 11, color: C.mid, marginTop: 2, lineHeight: 1.4 }}>
                {n.body}
              </div>
)}
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              width: 30,
              height: 30,
              borderRadius: 12,
              flexShrink: 0,
              background:"rgba(0,0,0,0.05)",
              border:"none",
              cursor:"pointer",
              display:"grid",
              placeItems:"center",
              color: C.dim,
              padding: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </>
);
}
