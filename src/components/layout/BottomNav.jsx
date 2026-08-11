import { C, FONT } from"../../data/constants.js";


// Icônes 2 états : contour fin au repos → version pleine sur l'onglet actif.
function NavIcon({ name, active, dark = false }) {
  const col = active ? C.accent : (dark ? "rgba(246,247,249,.58)" : C.dim);
  const base = { width:22, height:22, viewBox:"0 0 24 24" };
  const line = { fill:"none", stroke:col, strokeWidth:1.8, strokeLinecap:"round", strokeLinejoin:"round" };

  if (name ==="home") return active ? (
    <svg {...base} fill={col}>
      <path d="M11.35 2.53a1 1 0 0 1 1.3 0l8 6.86A1 1 0 0 1 21 10.9V20a2 2 0 0 1-2 2h-4a1 1 0 0 1-1-1v-5h-4v5a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2v-9.1a1 1 0 0 1 .35-.76l8-6.61Z"/>
    </svg>
) : (
    <svg {...base} {...line}>
      <path d="M3.5 10.6 12 3.4l8.5 7.2V20a1.5 1.5 0 0 1-1.5 1.5h-4.6V16h-4.8v5.5H5A1.5 1.5 0 0 1 3.5 20v-9.4Z"/>
    </svg>
);

  if (name ==="dumbbell") return active ? (
    <svg {...base} fill={col}>
      <rect x="1.5" y="9" width="3.4" height="6" rx="1.2"/>
      <rect x="4.9" y="6.8" width="3.4" height="10.4" rx="1.2"/>
      <rect x="15.7" y="6.8" width="3.4" height="10.4" rx="1.2"/>
      <rect x="19.1" y="9" width="3.4" height="6" rx="1.2"/>
      <rect x="8.3" y="10.9" width="7.4" height="2.2" rx="1.1"/>
    </svg>
) : (
    <svg {...base} {...line}>
      <rect x="1.5" y="9" width="3.4" height="6" rx="1.2"/>
      <rect x="4.9" y="6.8" width="3.4" height="10.4" rx="1.2"/>
      <rect x="15.7" y="6.8" width="3.4" height="10.4" rx="1.2"/>
      <rect x="19.1" y="9" width="3.4" height="6" rx="1.2"/>
      <path d="M8.3 12h7.4"/>
    </svg>
);

  if (name ==="nutrition") return active ? (
    <svg {...base}>
      <path fill={col} d="M12 7c-1.2-1.6-3-2.2-4.8-1.6C4.6 6.3 3.2 9 3.8 12c.7 3.6 3 7.4 5.5 8.6.9.4 1.6.4 2.7-.1 1.1.5 1.8.5 2.7.1 2.5-1.2 4.8-5 5.5-8.6.6-3-.8-5.7-3.4-6.6C15 4.8 13.2 5.4 12 7Z"/>
      <path fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" d="M12 6.5c0-2 1.3-3.5 3.2-3.9"/>
    </svg>
) : (
    <svg {...base} {...line}>
      <path d="M12 7c-1.2-1.6-3-2.2-4.8-1.6C4.6 6.3 3.2 9 3.8 12c.7 3.6 3 7.4 5.5 8.6.9.4 1.6.4 2.7-.1 1.1.5 1.8.5 2.7.1 2.5-1.2 4.8-5 5.5-8.6.6-3-.8-5.7-3.4-6.6C15 4.8 13.2 5.4 12 7Z"/>
      <path d="M12 6.5c0-2 1.3-3.5 3.2-3.9"/>
    </svg>
);

  // recipes — toque de chef
  return active ? (
    <svg {...base} fill={col}>
      <path d="M6.8 6c.3 0 .6 0 .9.1C8.5 4.3 10.1 3 12 3s3.5 1.3 4.3 3.1c.3-.1.6-.1.9-.1 2.1 0 3.8 1.7 3.8 3.7 0 1.9-1.5 3.4-3.3 3.7v2.1h-11v-2.1C4.8 13 3 11.5 3 9.7 3 7.7 4.7 6 6.8 6Z"/>
      <path d="M6.7 17h10.6v2a2 2 0 0 1-2 2H8.7a2 2 0 0 1-2-2v-2Z"/>
    </svg>
) : (
    <svg {...base} {...line}>
      <path d="M6.5 13.5C4.6 13.2 3 11.7 3 9.7 3 7.7 4.7 6 6.8 6c.3 0 .6 0 .9.1C8.5 4.3 10.1 3 12 3s3.5 1.3 4.3 3.1c.3-.1.6-.1.9-.1 2.1 0 3.8 1.7 3.8 3.7 0 2-1.6 3.5-3.5 3.8"/>
      <path d="M6.5 13v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-6M6.5 17h11"/>
    </svg>
);
}

const ITEMS = [
  { id:"home",      l:"Accueil",      icon:"home" },
  { id:"program",   l:"Entraînement", icon:"dumbbell" },
  { id:"nutrition", l:"Nutrition",    icon:"nutrition" },
  { id:"recipes",   l:"Recettes",     icon:"recipes" },
];

export function BottomNav({ tab, setTab, theme = "light" }) {
  const dark = theme === "dark";
  const navBg = dark ? "rgba(11,14,18,.97)" : "rgba(246,248,251,.97)";
  const navDim = dark ? "rgba(246,247,249,.58)" : C.dim;
  return (
    <nav className="np" style={{
      position:"fixed", bottom:0, left:0, right:0,
      background:navBg,
      backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
      borderTop:`1px solid ${dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,0.08)"}`,
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
            <NavIcon name={t.icon} active={on} dark={dark}/>
            <span style={{
              fontSize:10, letterSpacing:0.2,
              fontWeight: on ? 600 : 400,
              color: on ? C.accent : navDim,
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
        background:navBg,
      }}/>
    </nav>
);
}
