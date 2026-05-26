import { C } from "../../data/constants.js";
const DISPLAY = "'Space Grotesk','Inter',system-ui,sans-serif";

function NavIcon({name,active}){
  const col=active?C.gold:C.dim;
  const p={width:22,height:22,viewBox:"0 0 24 24",fill:"none",stroke:col,strokeWidth:1.6,strokeLinecap:"round",strokeLinejoin:"round"};
  const d={
    home:<><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></>,
    dumbbell:<><path d="M6.5 6.5 17.5 17.5M4 8l4-4M16 20l4-4M2 10l2-2M20 16l2-2M9 4l3 3M15 17l3 3"/></>,
    nutrition:<><path d="M12 2a9 9 0 0 1 9 9c0 4-2.5 7.5-6 9l-3 2-3-2C5.5 18.5 3 15 3 11a9 9 0 0 1 9-9z"/><path d="M12 6v6l4 2"/></>,
    recipes:<><path d="M4 3h13v18H6a2 2 0 0 1-2-2V3Z"/><path d="M4 19a2 2 0 0 1 2-2h11M9 7h6M9 11h6"/></>,
  };
  return <svg {...p}>{d[name]}</svg>;
}

const ITEMS=[
  {id:"home",     l:"Accueil",      icon:"home"},
  {id:"program",  l:"Entraînement", icon:"dumbbell"},
  {id:"__add__",  l:"",             center:true},
  {id:"nutrition",l:"Nutrition",    icon:"nutrition"},
  {id:"recipes",  l:"Recettes",     icon:"recipes"},
];

export function BottomNav({ tab, setTab }) {
  return (
    <nav className="np" style={{
      position:"fixed",bottom:0,left:0,right:0,
      background:"rgba(11,15,31,0.92)",backdropFilter:"blur(30px)",WebkitBackdropFilter:"blur(30px)",
      borderTop:`1px solid ${C.bd}`,display:"flex",alignItems:"center",zIndex:100,
      padding:"6px 4px 8px",boxShadow:"0 -1px 0 rgba(0,0,0,0.2)"
    }}>
      {ITEMS.map((t)=>{
        if(t.center){
          return (
            <button key={t.id} onClick={()=>setTab("program")} className="tap" style={{
              flex:1,display:"flex",justifyContent:"center",background:"transparent",border:"none",cursor:"pointer",padding:0
            }}>
              <div style={{
                width:50,height:50,borderRadius:16,marginTop:-22,
                background:`linear-gradient(145deg, ${C.gold}, ${C.amberDk})`,
                border:"1px solid rgba(255,255,255,0.25)",
                display:"grid",placeItems:"center",
                boxShadow:`0 8px 20px ${C.amberDk}66, inset 0 1px 0 rgba(255,255,255,0.45)`
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A1308" strokeWidth="2.6" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
            </button>
          );
        }
        const on=tab===t.id;
        return (
          <button key={t.id} onClick={()=>setTab(t.id)} className="tap" style={{
            flex:1,padding:"4px 2px",background:"transparent",border:"none",cursor:"pointer",
            display:"flex",flexDirection:"column",alignItems:"center",gap:3,fontFamily:DISPLAY
          }}>
            <NavIcon name={t.icon} active={on}/>
            <span style={{fontSize:9,letterSpacing:0.2,fontWeight:on?700:500,color:on?C.text:C.dim}}>{t.l}</span>
            {on&&<div style={{width:18,height:2,borderRadius:1,background:`linear-gradient(90deg,${C.blue},${C.gold})`}}/>}
          </button>
        );
      })}
    </nav>
  );
}
