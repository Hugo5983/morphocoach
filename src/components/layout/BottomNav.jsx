import { C } from "../../data/constants.js";

const FONT = "'Outfit','DM Sans',system-ui,sans-serif";

function NavIcon({ name, active }) {
  const col = active ? C.accent : C.dim;
  const p = { width:22, height:22, viewBox:"0 0 24 24", fill:"none", stroke:col, strokeWidth:1.7, strokeLinecap:"round", strokeLinejoin:"round" };
  const d = {
    home:      <><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></>,
    dumbbell:  <><path d="M6.5 6.5 17.5 17.5M4 8l4-4M16 20l4-4M2 10l2-2M20 16l2-2M9 4l3 3M15 17l3 3"/></>,
    nutrition: <><path d="M12 2a9 9 0 0 1 9 9c0 4-2.5 7.5-6 9l-3 2-3-2C5.5 18.5 3 15 3 11a9 9 0 0 1 9-9z"/><path d="M12 6v6l4 2"/></>,
    recipes:   <><path d="M4 3h13v18H6a2 2 0 0 1-2-2V3Z"/><path d="M4 19a2 2 0 0 1 2-2h11M9 7h6M9 11h6"/></>,
  };
  return <svg {...p}>{d[name]}</svg>;
}

const ITEMS = [
  { id:"home",      l:"Accueil",      icon:"home" },
  { id:"program",   l:"Entraînement", icon:"dumbbell" },
  { id:"__add__",   l:"",             center:true },
  { id:"nutrition", l:"Nutrition",    icon:"nutrition" },
  { id:"recipes",   l:"Recettes",     icon:"recipes" },
];

export function BottomNav({ tab, setTab }) {
  return (
    <nav className="np" style={{
      position:"fixed", bottom:0, left:0, right:0,
      background:"rgba(8,14,26,0.96)",
      backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
      borderTop:`1px solid ${C.bd}`,
      display:"flex", alignItems:"center", zIndex:100,
      padding:"8px 4px",
      paddingBottom:"calc(10px + env(safe-area-inset-bottom, 0px))",
    }}>
      {ITEMS.map((t) => {
        if (t.center) {
          return (
            <button key={t.id} onClick={() => setTab("program")} className="tap" style={{
              flex:1, display:"flex", justifyContent:"center",
              background:"transparent", border:"none", cursor:"pointer", padding:0,
            }}>
              <div style={{
                width:48, height:48, borderRadius:14, marginTop:-20,
                background:C.accent,
                border:"1px solid rgba(255,255,255,0.15)",
                display:"grid", placeItems:"center",
                boxShadow:"0 4px 16px rgba(59,130,246,0.40)",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
            </button>
          );
        }
        const on = tab === t.id;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} className="tap" style={{
            flex:1, padding:"4px 2px", background:"transparent", border:"none", cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"center", gap:4, fontFamily:FONT,
          }}>
            <NavIcon name={t.icon} active={on}/>
            <span style={{
              fontSize:9.5, letterSpacing:0.2,
              fontWeight: on ? 600 : 400,
              color: on ? C.text : C.dim,
              transition:"color .15s",
            }}>{t.l}</span>
            {on && <div style={{ width:16, height:2, borderRadius:1, background:C.accent }}/>}
          </button>
        );
      })}
    </nav>
  );
}
