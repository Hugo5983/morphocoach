import { C } from "../../data/constants.js";
const DISPLAY = "'Space Grotesk','Inter',system-ui,sans-serif";

export function Header({ premium, cycleStart, jR, tab, setTab }) {
  return (
    <div className="np" style={{
      background:"rgba(11,15,31,0.85)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",
      borderBottom:`1px solid ${C.bd}`,padding:"12px 16px",position:"sticky",top:0,zIndex:100,
      display:"flex",alignItems:"center",justifyContent:"space-between",
      boxShadow:"0 1px 0 rgba(0,0,0,0.2)"
    }}>
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        <svg width={18} height={18} viewBox="0 0 32 32">
          <defs><linearGradient id="logoG" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor={C.blue}/><stop offset="55%" stopColor="#A07AE8"/><stop offset="100%" stopColor={C.gold}/>
          </linearGradient></defs>
          <rect x="3" y="20" width="5" height="9" rx="1.5" fill="url(#logoG)" opacity=".75"/>
          <rect x="10" y="14" width="5" height="15" rx="1.5" fill="url(#logoG)" opacity=".88"/>
          <rect x="17" y="6" width="5" height="23" rx="1.5" fill="url(#logoG)"/>
          <circle cx="26" cy="6" r="2.2" fill={C.gold}/>
        </svg>
        <span style={{fontFamily:DISPLAY,fontWeight:700,fontSize:12,letterSpacing:0.5,color:C.text,textTransform:"uppercase"}}>
          Morpho<span style={{color:C.gold}}>·</span>Coach
        </span>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {cycleStart && jR !== null && jR <= 7 && (
          <span style={{fontSize:9,color:C.gold,fontWeight:700,fontFamily:DISPLAY}}>⚠️ J-{jR}</span>
        )}
        {premium && (
          <span style={{fontSize:9,color:C.gold,border:`1px solid ${C.gold}40`,padding:"2px 8px",borderRadius:8,fontWeight:700,letterSpacing:"1px",fontFamily:DISPLAY}}>
            PRO
          </span>
        )}
        <button onClick={() => setTab(tab === "profile" ? "home" : "profile")} className="tap-icon" style={{
          width:36,height:36,borderRadius:11,
          background:tab === "profile" ? `${C.gold}18` : C.s1,
          border:`1px solid ${tab === "profile" ? `${C.gold}40` : C.bd}`,
          display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
          transition:"all.2s cubic-bezier(.34,1.56,.64,1)",color:tab === "profile" ? C.gold : C.mid,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
