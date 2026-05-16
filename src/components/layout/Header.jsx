// ─── HEADER ─────────────────────────────────────────────────────────────────
export function Header({ premium, cycleStart, jR, tab, setTab }) {
  return (
    <div className="np" style={{
      background:"rgba(237,243,251,0.96)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
      borderBottom:"0.5px solid #dce8f4",padding:"12px 16px",position:"sticky",top:0,zIndex:100,
      display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 1px 0 rgba(59,130,246,0.06)"
    }}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,letterSpacing:"3px",fontWeight:500,color:"#0f1a2e"}}>
        MORPHO<span style={{color:"#3b82f6"}}>COACH</span>
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        {cycleStart && jR !== null && jR <= 7 && (
          <span style={{fontSize:9,color:"#f97316",fontWeight:500}}>⚠️ J-{jR}</span>
        )}
        {premium && (
          <span style={{fontSize:9,color:"#3b82f6",border:"0.5px solid rgba(59,130,246,0.3)",padding:"2px 8px",borderRadius:8,fontWeight:700,letterSpacing:"1px"}}>
            PREMIUM
          </span>
        )}
        <button onClick={() => setTab(tab === "profile" ? "home" : "profile")} className="tap-icon" style={{
          width:34,height:34,borderRadius:"50%",
          background:tab === "profile" ? "rgba(59,130,246,0.1)" : "transparent",
          border:`0.5px solid ${tab === "profile" ? "#3b82f6" : "#dce8f4"}`,
          display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
          transition:"all.2s cubic-bezier(.34,1.56,.64,1)"
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke={tab === "profile" ? "#3b82f6" : "#64748b"}
               strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
