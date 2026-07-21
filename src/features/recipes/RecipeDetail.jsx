import { useState, useMemo } from"react";
import useScrollTop from"../../hooks/useScrollTop.js";
import { REPAS, MICROS, PRIX_LABEL, PRIX_TEXTE, FILTRES } from"../../data/recipes.js";
import { useRecipePhoto } from"./useRecipePhoto.js";
import { C, DARK, FONT, SERIF } from"../../data/constants.js";
import { useSwipeBack } from"../../hooks/useSwipeBack.js";


const TAG_LABELS = Object.fromEntries(FILTRES.map(f => [f.id, f.l]));

// ─── Fonctions d'arrondi intelligent des ingrédients ─────────────────────────
function scaleQte(qte, ratio) {
  const match = qte.match(/^([\d.\/]+)\s*(.*)$/);
  if (!match) return qte;
  let num = match[1];
  const unit = match[2];
  // Gérer les fractions"1/2"
  if (num.includes("/")) {
    const parts = num.split("/");
    num = parseFloat(parts[0]) / parseFloat(parts[1]);
  } else {
    num = parseFloat(num);
  }
  if (isNaN(num)) return qte;
  const scaled = num * ratio;
  // Pièces → arrondi à l'entier, min 1
  if (unit.includes("pièce") || unit.includes("œuf") || unit.includes("citron") || unit.includes("banane") || unit.includes("pomme")) {
    const n = Math.max(1, Math.round(scaled));
    return`${n} ${unit}`;
  }
  // Cuillères → paliers
  if (unit.includes("c. à")) {
    if (scaled < 0.4) return`¼ ${unit}`;
    if (scaled < 0.75) return`½ ${unit}`;
    if (scaled < 1.4) return`1 ${unit}`;
    if (scaled < 1.8) return`1½ ${unit}`;
    return`${Math.round(scaled)} ${unit}`;
  }
  // Pincée → fixe
  if (unit.includes("pincée")) return qte;
  // ml / g → arrondi à 5 près
  const rounded = Math.max(5, Math.round(scaled / 5) * 5);
  return`${rounded} ${unit}`;
}

export default function RecipeDetail({ recipe, onBack, liked, onLike, push, repas, setRepas }) {
  useScrollTop();
  const [targetKcal, setTargetKcal] = useState(null);
  const [showMealPicker, setShowMealPicker] = useState(false);

  if (!recipe) return null;
  const r = recipe;
  const base = r.kcal;
  const target = targetKcal ?? base;
  const ratio  = target / base;
  const repasLabel = REPAS.find(x => x.id === r.repas)?.label ||"";
  const { src:photo, author:photoAuteur } = useRecipePhoto(r.id, r.img,"hero");

  const macros = useMemo(() => ({
    prot: Math.round(r.prot * ratio),
    gluc: Math.round(r.gluc * ratio),
    lip:  Math.round(r.lip  * ratio),
  }), [ratio, r]);

  const diff = target - base;

  // Le curseur calories redimensionne les quantités → le coût et les
  // micronutriments par portion suivent le même ratio que les macros.
  const coutAjuste = r.cout != null ? r.cout * ratio : null;
  const prixAff = coutAjuste == null ? null
    :`${r.coutEstime ?"≈" :""}${coutAjuste.toFixed(2).replace(".",",")} €`;
  const diffLabel = Math.abs(diff) < 3 ?"Base" : (diff > 0 ?`+${Math.round(diff)} kcal` :`${Math.round(diff)} kcal`);
  const diffColor = Math.abs(diff) < 3
    ?"${C.dim}"
    : diff > 0 ?"#E5484D" :"#12B76A";
  const diffBg = Math.abs(diff) < 3
    ?"rgba(0,0,0,0.05)"
    : diff > 0 ?"rgba(229,72,77,0.12)" :"rgba(18,183,106,0.12)";
  const diffBorder = Math.abs(diff) < 3
    ?"rgba(0,0,0,0.05)"
    : diff > 0 ?"rgba(229,72,77,0.25)" :"rgba(18,183,106,0.25)";

  const { swipeStyle, onTouchStart, onTouchMove, onTouchEnd } = useSwipeBack(onBack);

  return (
    <div className="anim" style={{ background:C.bg, minHeight:"100vh", paddingBottom:32, ...swipeStyle }}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>

      {/* ── Hero ── */}
      <div style={{ position:"relative", height:240, background:C.s2 }}>
        <img
          src={photo} alt={r.nom} loading="lazy" decoding="async"
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          onError={e => { if (e.target.src !== r.img) e.target.src = r.img;
                          else e.target.style.display="none"; }}
        />
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to bottom,rgba(11,18,32,0.5) 0%,transparent 30%,rgba(11,18,32,0.97) 100%)" }}/>

        {photoAuteur && (
          <div style={{ position:"absolute", bottom:6, right:10, fontSize:9,
            color:"rgba(255,255,255,0.45)", fontFamily:FONT }}>
            Photo · {photoAuteur}
          </div>
)}

        {/* Boutons haut */}
        <div style={{ position:"absolute", top:16, left:16, right:16,
          display:"flex", justifyContent:"space-between" }}>
          <button onClick={onBack} className="tap-icon" style={{
            width:36, height:36, borderRadius:12,
            background:"rgba(11,18,32,0.65)",
            border:"1px solid rgba(0,0,0,0.08)",
            display:"grid", placeItems:"center", cursor:"pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="#FFF" strokeWidth="2.2" strokeLinecap="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button onClick={() => onLike(r.id)} className="tap-icon" style={{
            width:36, height:36, borderRadius:12,
            background:"rgba(11,18,32,0.65)",
            border:"1px solid rgba(0,0,0,0.08)",
            display:"grid", placeItems:"center", cursor:"pointer" }}>
            <svg width="15" height="15" viewBox="0 0 24 24"
                 fill={liked ?"#E5484D" :"none"}
                 stroke={liked ?"#E5484D" :"#FFF"}
                 strokeWidth="2" strokeLinecap="round">
              <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
            </svg>
          </button>
        </div>

        {/* Titre + tags */}
        <div style={{ position:"absolute", bottom:16, left:20, right:20 }}>
          <div style={{ display:"flex", gap:8, marginBottom:8, flexWrap:"wrap" }}>
            <span style={{ display:"inline-flex", padding:"4px 12px", borderRadius:8,
              fontSize:11, fontWeight:600, fontFamily:FONT,
              background:"rgba(60,91,255,0.12)",
              border:"1px solid rgba(60,91,255,0.25)", color:C.blueLt }}>
              {repasLabel}
            </span>
            {r.tags.slice(0, 2).map(t => (
              <span key={t} style={{ display:"inline-flex", padding:"4px 12px",
                borderRadius:8, fontSize:11, fontWeight:600, fontFamily:FONT,
                background:"rgba(18,183,106,0.12)",
                border:"1px solid rgba(18,183,106,0.25)", color:"#12B76A" }}>
                {TAG_LABELS[t]}
              </span>
))}
          </div>
          <div style={{ fontFamily:SERIF, fontSize:26, color:"#FFF",
            lineHeight:1.2, letterSpacing:-0.5 }}>{r.nom}</div>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div style={{ padding:"16px 20px 32px" }}>

        {/* Stats */}
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {[
            { l:"Calories", v:target, u:"" },
            { l:"Temps",    v:r.temps, u:" min" },
            { l:"Portions", v:r.portions, u:"" },
            ...(prixAff ? [{ l:"Budget", v:prixAff, u:"" }] : []),
          ].map(s => (
            <div key={s.l} style={{ flex:1, background:C.s1,
              border:"1px solid rgba(0,0,0,0.05)", borderRadius:12,
              padding:"12px 8px", textAlign:"center" }}>
              <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.1em",
                textTransform:"uppercase", color:"${C.dim}",
                fontFamily:FONT, marginBottom:4 }}>{s.l}</div>
              <div style={{ fontFamily:SERIF, fontSize:20, color:"${C.text}",
                transition:"all .2s" }}>
                {s.v}<span style={{ fontSize:11, color:C.mid }}>{s.u}</span>
              </div>
            </div>
))}
        </div>

        {/* ── Curseur calories ── */}
        <div style={{ background:C.s1, border:"1px solid rgba(0,0,0,0.05)",
          borderRadius:16, padding:"16px", marginBottom:16 }}>

          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.1em",
                textTransform:"uppercase", color:"${C.dim}",
                fontFamily:FONT, marginBottom:4 }}>Ajuster les calories</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                <span style={{ fontFamily:SERIF, fontSize:34, color:"${C.text}",
                  letterSpacing:-1, lineHeight:1 }}>{target}</span>
                <span style={{ fontSize:13, color:C.mid,
                  fontFamily:FONT }}>kcal</span>
              </div>
            </div>
            <span style={{ padding:"4px 12px", borderRadius:8,
              fontSize:11, fontWeight:600, fontFamily:FONT,
              background:diffBg, border:`1px solid ${diffBorder}`,
              color:diffColor, transition:"all .2s" }}>
              {diffLabel}
            </span>
          </div>

          {/* Slider */}
          <input
            type="range" min={Math.round(base * 0.4)} max={Math.round(base * 2.2)}
            step={1} value={target}
            onChange={e => setTargetKcal(parseInt(e.target.value))}
            style={{
              width:"100%", appearance:"none", WebkitAppearance:"none",
              height:4, borderRadius:2, outline:"none",
              background:`linear-gradient(to right, #3C5BFF 0%, #3C5BFF ${((target - Math.round(base*0.4)) / (Math.round(base*2.2) - Math.round(base*0.4))) * 100}%, rgba(0,0,0,0.08) ${((target - Math.round(base*0.4)) / (Math.round(base*2.2) - Math.round(base*0.4))) * 100}%, rgba(0,0,0,0.08) 100%)`,
              cursor:"pointer", marginBottom:8,
            }}
          />
          <div style={{ display:"flex", justifyContent:"space-between",
            fontSize:10, color:"${C.dim}", fontFamily:FONT,
            marginBottom:16 }}>
            <span>{Math.round(base * 0.4)} kcal</span>
            <span style={{ color:C.mid }}>Base : {base} kcal</span>
            <span>{Math.round(base * 2.2)} kcal</span>
          </div>

          {/* Macros */}
          <div style={{ display:"flex", gap:8 }}>
            {[
              { l:"Protéines", v:macros.prot, c:"#3C5BFF", bg:"rgba(60,91,255,0.12)", bd:"rgba(60,91,255,0.18)" },
              { l:"Glucides",  v:macros.gluc, c:"#F59E0B", bg:"rgba(245,158,11,0.12)", bd:"rgba(245,158,11,0.18)" },
              { l:"Lipides",   v:macros.lip,  c:"#E5484D", bg:"rgba(229,72,77,0.12)", bd:"rgba(229,72,77,0.18)" },
            ].map(m => (
              <div key={m.l} style={{ flex:1, background:m.bg,
                border:`1px solid ${m.bd}`, borderRadius:12, padding:"12px 8px",
                textAlign:"center" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                  gap:4, marginBottom:4 }}>
                  <span style={{ width:5, height:5, borderRadius:1.5,
                    background:m.c, display:"inline-block", flexShrink:0 }}/>
                  <span style={{ fontSize:10, color:C.mid,
                    fontFamily:FONT }}>{m.l}</span>
                </div>
                <div style={{ fontSize:16, fontWeight:700, color:"${C.text}",
                  fontFamily:FONT, transition:"all .2s" }}>
                  {m.v}<span style={{ fontSize:10, color:"${C.dim}" }}>g</span>
                </div>
                {/* Mini barre */}
                <div style={{ height:3, background:"rgba(0,0,0,0.05)",
                  borderRadius:2, marginTop:8, overflow:"hidden" }}>
                  <div style={{
                    height:"100%",
                    width:`${Math.min(100, (m.v / Math.max(macros.prot, macros.gluc, macros.lip)) * 100)}%`,
                    background:m.c, borderRadius:2, transition:"width .3s ease",
                  }}/>
                </div>
              </div>
))}
          </div>

          {/* Reset */}
          {targetKcal && targetKcal !== base && (
            <button className="tap" onClick={() => setTargetKcal(null)} style={{
              marginTop:12, width:"100%", padding:"8px",
              background:"rgba(0,0,0,0.05)",
              border:"1px solid rgba(0,0,0,0.05)", borderRadius:12,
              color:C.mid, fontSize:13, fontWeight:500,
              fontFamily:FONT, cursor:"pointer",
            }}>
              Revenir à la recette de base ({base} kcal)
            </button>
)}
        </div>

        {/* ── Détail du budget ── */}
        {prixAff && (
          <div style={{ display:"flex", alignItems:"center", gap:8,
            marginBottom:16, paddingLeft:2 }}>
            <span style={{ fontSize:13, fontWeight:700, color:C.accent,
              fontFamily:FONT }}>{PRIX_LABEL[r.prix]}</span>
            <span style={{ fontSize:12, color:C.mid, fontFamily:FONT }}>
              {PRIX_TEXTE[r.prix]} · {prixAff} par portion
              {r.coutEstime &&" (estimé)"}
            </span>
          </div>
)}

        {/* ── Micronutriments (par portion) ── */}
        {r.micros && (
          <div style={{ background:C.s1, border:"1px solid rgba(0,0,0,0.05)",
            borderRadius:16, padding:16, marginBottom:16 }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.1em",
              textTransform:"uppercase", color:C.dim, fontFamily:FONT,
              marginBottom:12 }}>
              Micronutriments · par portion
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {MICROS.filter(m => r.micros[m.id] > 0).map(m => {
                const v   = r.micros[m.id] * ratio;
                const pct = Math.min(100, Math.round((v / m.ar) * 100));
                return (
                  <div key={m.id}>
                    <div style={{ fontSize:11, color:C.mid, fontFamily:FONT,
                      marginBottom:3 }}>{m.l}</div>
                    <div style={{ fontFamily:SERIF, fontSize:16, color:C.text,
                      lineHeight:1.1 }}>
                      {v < 10 ? v.toFixed(1) : Math.round(v)}
                      <span style={{ fontSize:10, color:C.mid,
                        fontFamily:FONT, marginLeft:2 }}>{m.u}</span>
                    </div>
                    {/* part de l'apport de référence quotidien */}
                    <div style={{ marginTop:5, height:3, borderRadius:2,
                      background:"rgba(0,0,0,0.06)", overflow:"hidden" }}>
                      <div style={{ width:`${pct}%`, height:"100%",
                        background: pct >= 30 ?"#12B76A" : C.accent,
                        borderRadius:2 }}/>
                    </div>
                    <div style={{ fontSize:9, color:C.dim, fontFamily:FONT,
                      marginTop:3 }}>{pct}% AR</div>
                  </div>
);
              })}
            </div>

            <div style={{ fontSize:10, color:C.dim, fontFamily:FONT,
              marginTop:12, lineHeight:1.5 }}>
              Estimations calculées depuis la table de composition ANSES-CIQUAL.
              AR = apport de référence quotidien.
            </div>
          </div>
)}

        {/* ── Astuce du chef ── */}
        {r.astuce && (
          <div style={{ background:"rgba(60,91,255,0.06)",
            border:"1px solid rgba(60,91,255,0.15)", borderRadius:16,
            padding:16, marginBottom:16 }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.1em",
              textTransform:"uppercase", color:C.accent, fontFamily:FONT,
              marginBottom:6 }}>Astuce du chef</div>
            <div style={{ fontSize:13, color:C.mid, lineHeight:1.6,
              fontFamily:FONT }}>{r.astuce}</div>
          </div>
)}

        {/* Description */}
        <div style={{ fontSize:13, color:"${C.mid}",
          lineHeight:1.6, marginBottom:20, fontFamily:FONT }}>
          {r.desc}
        </div>

        {/* Ingrédients */}
        <div style={{ fontSize:14, fontWeight:700, color:"${C.text}",
          marginBottom:12, fontFamily:FONT,
          position:"sticky", top:0, zIndex:10,
          background:C.bg, paddingTop:4, paddingBottom:4 }}>
          Ingrédients
          <span style={{ fontSize:11, color:"${C.dim}",
            marginLeft:8, fontWeight:400 }}>
            pour {r.portions} {r.portions > 1 ?"portions" :"portion"}
          </span>
          {targetKcal && targetKcal !== base && (
            <span style={{ fontSize:11, color:C.accent, marginLeft:8,
              fontWeight:500, fontFamily:FONT }}>· ajustés</span>
)}
        </div>
        <div style={{ background:C.s1,
          border:"1px solid rgba(0,0,0,0.05)", borderRadius:16,
          padding:"4px 16px", marginBottom:20 }}>
          {r.ingredients.map((ing, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between",
              padding:"12px 0",
              borderBottom: i < r.ingredients.length - 1
                ?"1px solid rgba(0,0,0,0.05)" :"none" }}>
              <span style={{ fontSize:13, color:"${C.text}",
                fontFamily:FONT }}>{ing.nom}</span>
              <span style={{ fontSize:13, fontWeight:600,
                color: targetKcal && targetKcal !== base ? C.accentDk : C.mid,
                fontFamily:FONT, transition:"color .2s" }}>
                {scaleQte(ing.qte, ratio)}
              </span>
            </div>
))}
        </div>

        {/* Préparation */}
        <div style={{ fontSize:14, fontWeight:700, color:"${C.text}",
          marginBottom:12, fontFamily:FONT,
          position:"sticky", top:0, zIndex:10,
          background:C.bg, paddingTop:4, paddingBottom:4 }}>Préparation</div>
        <div style={{ display:"flex", flexDirection:"column",
          gap:12, marginBottom:24 }}>
          {r.etapes.map((etape, i) => (
            <div key={i} style={{ display:"flex", gap:12 }}>
              <div style={{ width:24, height:24, borderRadius:8,
                background:C.accent, display:"grid", placeItems:"center",
                flexShrink:0, fontSize:13, fontWeight:700, color:"#FFF",
                fontFamily:FONT }}>{i + 1}</div>
              <div style={{ fontSize:13, color:C.mid,
                lineHeight:1.6, paddingTop:2, fontFamily:FONT }}>{etape}</div>
            </div>
))}
        </div>

        {/* CTA */}
        <button className="tap" onClick={() => setShowMealPicker(true)} style={{
          width:"100%", padding:12, borderRadius:12,
          background:C.accent, border:"none", color:"#FFF",
          fontFamily:FONT, fontSize:14, fontWeight:600,
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          cursor:"pointer", boxShadow:"0 4px 14px rgba(60,91,255,0.35)",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="#FFF" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Ajouter à un repas · {target} kcal
        </button>

        {/* Sélecteur de repas */}
        {showMealPicker && (
          <div onClick={() => setShowMealPicker(false)}
            style={{ position:"fixed", inset:0, zIndex:360,
              background:"rgba(16,19,24,0.5)", backdropFilter:"blur(3px)",
              display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
            <div onClick={e => e.stopPropagation()} style={{
              width:"100%", maxWidth:380, background:C.bg, borderRadius:20,
              padding:"24px 20px 20px",
              boxShadow: C.shadow }}>
              <div style={{ fontFamily:SERIF, fontSize:20, fontWeight:400,
                color:C.text, marginBottom:4, letterSpacing:-0.5 }}>
                Ajouter à quel repas ?
              </div>
              <div style={{ fontSize:13, color:C.dim, marginBottom:16, fontFamily:FONT }}>
                {r.nom} · {target} kcal
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  { id:"matin", l:"Petit-déjeuner", e:"", c:"#F59E0B" },
                  { id:"midi",  l:"Déjeuner",      e:"", c:C.accent },
                  { id:"snack", l:"Collation",     e:"", c:"#E5484D" },
                  { id:"soir",  l:"Dîner",         e:"", c:"#3C5BFF" },
                ].map(m => (
                  <button key={m.id} onClick={() => {
                    // Construire un aliment à partir de la recette
                    const aliment = {
                      n:`${r.nom}${target !== r.kcal ?` · ${target} kcal` :""}`,
                      c: target,
                      p: macros.prot, g: macros.gluc, l: macros.lip,
                    };
                    if (setRepas) {
                      setRepas(rp => ({
                        ...rp,
                        [m.id]: [...(rp?.[m.id] || []), aliment],
                      }));
                    }
                    setShowMealPicker(false);
                    if (push) push("",`Ajouté au ${m.l.toLowerCase()}`,`${r.nom} · ${target} kcal`);
                  }} style={{
                    width:"100%", padding:"16px 16px", borderRadius:16,
                    background:"#FFF", border:"1px solid rgba(0,0,0,0.05)",
                    display:"flex", alignItems:"center", gap:12, cursor:"pointer",
                    fontFamily:FONT, textAlign:"left" }}>
                    <div style={{ width:40, height:40, borderRadius:12,
                      background:`${m.c}18`, border:`1px solid ${m.c}30`,
                      display:"grid", placeItems:"center", fontSize:20 }}>{m.e}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{m.l}</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#98A2B3" strokeWidth="2" strokeLinecap="round">
                      <path d="M9 6l6 6-6 6"/>
                    </svg>
                  </button>
))}
              </div>
              <button onClick={() => setShowMealPicker(false)} style={{
                width:"100%", marginTop:12, padding:"12px",
                background:"transparent", border:"none", color:C.dim,
                fontFamily:FONT, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                Annuler
              </button>
            </div>
          </div>
)}

      </div>
    </div>
);
}
