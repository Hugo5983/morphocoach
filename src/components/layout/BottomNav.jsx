// ─── BOTTOM NAV ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:"home", l:"Accueil", svg:(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  )},
  { id:"program", l:"Programme", svg:(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
    </svg>
  )},
  { id:"nutrition", l:"Nutrition", svg:(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a9 9 0 0 1 9 9c0 4-2.5 7.5-6 9l-3 2-3-2C5.5 18.5 3 15 3 11a9 9 0 0 1 9-9z"/>
      <path d="M12 6v6l4 2"/>
    </svg>
  )},
];

export function BottomNav({ tab, setTab }) {
  return (
    <nav className="np" style={{
      position:"fixed",bottom:0,left:0,right:0,
      background:"rgba(230,240,252,0.98)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",
      borderTop:"0.5px solid #c8daf0",display:"flex",zIndex:100,boxShadow:"0 -1px 0 rgba(59,130,246,0.06)"
    }}>
      {NAV_ITEMS.map((t) => (
        <button key={t.id} onClick={() => setTab(t.id)} className="tap" style={{
          flex:1,padding:"10px 4px 12px",background:"transparent",border:"none",cursor:"pointer",
          display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all.15s",fontFamily:"'Inter',sans-serif"
        }}>
          <div style={{color:tab === t.id ? "#3b82f6" : "#64748b",transition:"color.15s",lineHeight:1}}>{t.svg}</div>
          <span style={{
            fontSize:9,letterSpacing:"0.3px",
            fontWeight:tab === t.id ? 600 : 400,
            color:tab === t.id ? "#3b82f6" : "#64748b",
            transition:"color.15s"
          }}>{t.l}</span>
          {tab === t.id && (
            <div className="nav-dot" style={{
              width:20,height:2,borderRadius:1,background:"#3b82f6",
              animation:"scaleIn .2s cubic-bezier(.34,1.56,.64,1) both"
            }}/>
          )}
        </button>
      ))}
    </nav>
  );
}
