import { useState } from "react";
import { C } from "../../data/constants.js";

const SERIF='"DM Serif Display","Times New Roman",serif';
const DISPLAY='"Outfit","Inter",system-ui,sans-serif';
const card={background:C.s1,border:`1px solid ${C.bd}`,borderRadius:16,boxShadow:'inset 0 1px 0 rgba(255,255,255,0.03), 0 1px 0 rgba(0,0,0,0.2)'};
const eyebrowS={fontSize:9,fontWeight:700,color:C.dim,letterSpacing:2,textTransform:'uppercase',fontFamily:DISPLAY};

// Placeholder recipe data — visual only, no backend yet (per brief)
const CATS=[
  {id:"all",l:"Tout"},{id:"proteine",l:"Protéiné"},{id:"rapide",l:"Rapide"},
  {id:"vege",l:"Végé"},{id:"postworkout",l:"Post-workout"},
];
const RECIPES=[
  {id:1,nom:"Bowl protéiné poulet",kcal:520,p:48,g:42,l:14,temps:15,cat:"proteine",emoji:"🍗",accent:C.blue},
  {id:2,nom:"Porridge avoine & fruits rouges",kcal:380,p:18,g:58,l:9,temps:8,cat:"rapide",emoji:"🥣",accent:C.gold},
  {id:3,nom:"Saumon, quinoa & légumes",kcal:610,p:44,g:38,l:28,temps:25,cat:"proteine",emoji:"🐟",accent:C.coral},
  {id:4,nom:"Buddha bowl végétarien",kcal:450,p:22,g:54,l:16,temps:20,cat:"vege",emoji:"🥗",accent:C.mint},
  {id:5,nom:"Shake banane-cacao maison",kcal:310,p:28,g:36,l:6,temps:5,cat:"postworkout",emoji:"🥤",accent:C.lavender},
  {id:6,nom:"Omelette épinards & feta",kcal:340,p:26,g:6,l:24,temps:10,cat:"rapide",emoji:"🍳",accent:C.sun},
];

export default function Recipes(props){
  const { C } = props;
  const [cat,setCat]=useState("all");
  const [open,setOpen]=useState(null);
  const list=cat==="all"?RECIPES:RECIPES.filter(r=>r.cat===cat);

  return(
    <div className="anim" style={{padding:'0 20px 16px',position:'relative'}}>
      <div style={{position:'absolute',top:120,left:'50%',transform:'translateX(-50%)',width:340,height:260,borderRadius:'50%',background:'radial-gradient(closest-side,rgba(255,171,93,0.10),transparent 70%)',filter:'blur(40px)',pointerEvents:'none'}}/>
      <div style={{position:'relative'}}>
        {/* Header */}
        <div style={{paddingTop:22,paddingBottom:8}}>
          <div style={{...eyebrowS,color:C.gold}}>Recettes</div>
          <div style={{fontFamily:SERIF,fontSize:34,fontWeight:400,letterSpacing:-1.3,color:C.text,lineHeight:1.05,marginTop:6}}>
            Mange <span style={{fontStyle:'italic',color:C.goldL}}>malin.</span>
          </div>
          <div style={{fontSize:12.5,color:C.mid,marginTop:6,fontWeight:500}}>Des idées de repas adaptées à tes objectifs.</div>
        </div>

        {/* Soft notice — feature in progress */}
        <div style={{...card,padding:'12px 14px',marginBottom:14,display:'flex',alignItems:'center',gap:10,background:`${C.gold}10`,border:`1px solid ${C.gold}24`}}>
          <span style={{fontSize:18}}>✨</span>
          <div style={{fontSize:11.5,color:C.mid,lineHeight:1.5}}>Module en préparation — bientôt : recettes personnalisées selon tes macros du jour.</div>
        </div>

        {/* Category filter */}
        <div style={{display:'flex',gap:7,overflowX:'auto',paddingBottom:4,marginBottom:14}}>
          {CATS.map(ct=>{
            const on=cat===ct.id;
            return(
              <button key={ct.id} onClick={()=>setCat(ct.id)} className="tap" style={{padding:'7px 14px',borderRadius:999,whiteSpace:'nowrap',background:on?`${C.gold}1a`:C.s1,border:`1px solid ${on?C.gold+'50':C.bd}`,color:on?C.gold:C.mid,fontSize:11.5,fontWeight:700,fontFamily:DISPLAY,letterSpacing:0.2,cursor:'pointer'}}>{ct.l}</button>
            );
          })}
        </div>

        {/* Recipe cards */}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {list.map(r=>(
            <div key={r.id} onClick={()=>setOpen(open===r.id?null:r.id)} className="tap" style={{...card,padding:14,cursor:'pointer'}}>
              <div style={{display:'flex',alignItems:'center',gap:13}}>
                <div style={{width:54,height:54,borderRadius:15,flexShrink:0,background:`linear-gradient(145deg, ${r.accent}30, ${r.accent}08)`,border:`1px solid ${r.accent}35`,display:'grid',placeItems:'center',fontSize:26}}>{r.emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:DISPLAY,fontSize:14,fontWeight:700,color:C.text,letterSpacing:-0.1}}>{r.nom}</div>
                  <div style={{display:'flex',gap:10,marginTop:4}}>
                    <span style={{fontSize:11,color:C.mid,fontWeight:600,fontFamily:DISPLAY}}>🔥 {r.kcal} kcal</span>
                    <span style={{fontSize:11,color:C.mid,fontWeight:600,fontFamily:DISPLAY}}>⏱ {r.temps} min</span>
                  </div>
                </div>
                <div style={{color:C.dim,fontSize:18,transform:open===r.id?'rotate(90deg)':'none',transition:'transform .2s'}}>›</div>
              </div>
              {open===r.id&&(
                <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.bd}`}}>
                  <div style={{display:'flex',gap:8}}>
                    {[{l:'Protéines',v:r.p,c:C.blue},{l:'Glucides',v:r.g,c:C.gold},{l:'Lipides',v:r.l,c:C.lavender}].map(mac=>(
                      <div key={mac.l} style={{flex:1,padding:'10px 8px',borderRadius:12,background:`${mac.c}14`,border:`1px solid ${mac.c}28`,textAlign:'center'}}>
                        <div style={{fontFamily:DISPLAY,fontSize:16,fontWeight:700,color:C.text}}>{mac.v}<span style={{fontSize:10,color:C.dim}}>g</span></div>
                        <div style={{...eyebrowS,fontSize:8,marginTop:2}}>{mac.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:10,fontSize:11.5,color:C.dim,fontWeight:500,textAlign:'center'}}>Recette détaillée disponible prochainement</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
