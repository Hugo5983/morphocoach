import { C, FONT } from "../../data/constants.js";


function NavIcon({ name, active }) {
  const col = active ? C.accent : C.dim;
  const p = { width:22, height:22, viewBox:"0 0 24 24", fill:"none", stroke:col, strokeWidth:1.7, strokeLinecap:"round", strokeLinejoin:"round" };
  const d = {
    home:      <><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></>,
    dumbbell:  <><path d="M6.5 6.5 17.5 17.5M4 8l4-4M16 20l4-4M2 10l2-2M20 16l2-2M9 4l3 3M15 17l3 3"/></>,
    nutrition: <><path d="M6 9h11v6a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V9Z"/><path d="M17 11h2a2 2 0 0 1 0 4h-2"/><path d="M9 3v3M13 3v3"/></>,
    recipes:   <><path d="M4 3h13v18H6a2 2 0 0 1-2-2V3Z"/><path d="M4 19a2 2 0 0 1 2-2h11M9 7h6M9 11h6"/></>,
  };
  return <svg {...p}>{d[name]}</svg>;
}

const ITEMS = [
  { id:"home",      l:"Accueil",      icon:"home" },
  { id:"program",   l:"Entraînement", icon:"dumbbell" },
  { id:"nutrition", l:"Nutrition",    icon:"nutrition" },
  { id:"recipes",   l:"Recettes",     icon:"recipes" },
];

export function BottomNav({ tab, setTab }) {
  return (
    <nav className="np" style={{
      position:"fixed", bottom:0, left:0, right:0,
      background:"rgba(246,248,251,0.97)",
      backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
      borderTop:`1px solid rgba(0,0,0,0.08)`,
      boxShadow: C.shadow,
      display:"flex", flexDirection:"column",
      zIndex:100,
    }}>
      {/* Boutons nav */}
      <div style={{ display:"flex", alignItems:"center",
        paddingTop:8, paddingLeft:4, paddingRight:4, paddingBottom:4 }}>
      {ITEMS.map((t) => {
        const on = tab === t.id;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} className="tap" style={{
            flex:1, padding:"4px 2px", background:"transparent", border:"none", cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"center", gap:4, fontFamily:FONT,
          }}>
            <NavIcon name={t.icon} active={on}/>
            <span style={{
              fontSize:10, letterSpacing:0.2,
              fontWeight: on ? 600 : 400,
              color: on ? C.accent : C.dim,
              transition:"color .15s",
            }}>{t.l}</span>
            <div style={{
              width: on ? 20 : 0,
              height:3, borderRadius:999,
              background:C.accent,
              transition:"width .2s ease",
            }}/>
          </button>
        );
      })}
      </div>
      {/* Zone safe-area réduite — colle la nav au plus bas sans passer sous la barre home */}
      <div style={{
        height:"max(4px, calc(env(safe-area-inset-bottom, 0px) - 12px))",
        background:"rgba(246,248,251,0.97)",
      }}/>
    </nav>
  );
}
