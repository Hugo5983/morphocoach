import { useState, useMemo } from "react";
import { REPAS } from "../../data/recipes.js";
import { C, FONT, SERIF } from "../../data/constants.js";


const TAG_LABELS = {
  vegan:"Vegan", anti_inflammatoire:"Anti-inflammatoire",
  sante:"Santé", proteine:"Protéiné", rapide:"Rapide",
};

// ─── Fonctions d'arrondi intelligent des ingrédients ─────────────────────────
function scaleQte(qte, ratio) {
  const match = qte.match(/^([\d.\/]+)\s*(.*)$/);
  if (!match) return qte;
  let num = match[1];
  const unit = match[2];
  // Gérer les fractions "1/2"
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
    return `${n} ${unit}`;
  }
  // Cuillères → paliers
  if (unit.includes("c. à")) {
    if (scaled < 0.4) return `¼ ${unit}`;
    if (scaled < 0.75) return `½ ${unit}`;
    if (scaled < 1.4) return `1 ${unit}`;
    if (scaled < 1.8) return `1½ ${unit}`;
    return `${Math.round(scaled)} ${unit}`;
  }
  // Pincée → fixe
  if (unit.includes("pincée")) return qte;
  // ml / g → arrondi à 5 près
  const rounded = Math.max(5, Math.round(scaled / 5) * 5);
  return `${rounded} ${unit}`;
}

export default function RecipeDetail({ recipe, onBack, liked, onLike, push }) {
  const [targetKcal, setTargetKcal] = useState(null);

  if (!recipe) return null;
  const r = recipe;
  const base = r.kcal;
  const target = targetKcal ?? base;
  const ratio  = target / base;
  const repasLabel = REPAS.find(x => x.id === r.repas)?.label || "";

  const macros = useMemo(() => ({
    prot: Math.round(r.prot * ratio),
    gluc: Math.round(r.gluc * ratio),
    lip:  Math.round(r.lip  * ratio),
  }), [ratio, r]);

  const diff = target - base;
  const diffLabel = Math.abs(diff) < 3 ? "Base" : (diff > 0 ? `+${Math.round(diff)} kcal` : `${Math.round(diff)} kcal`);
  const diffColor = Math.abs(diff) < 3
    ? "${C.dim}"
    : diff > 0 ? "#F87171" : "#34D399";
  const diffBg = Math.abs(diff) < 3
    ? "rgba(0,0,0,0.04)"
    : diff > 0 ? "rgba(248,113,113,0.10)" : "rgba(52,211,153,0.10)";
  const diffBorder = Math.abs(diff) < 3
    ? "rgba(0,0,0,0.06)"
    : diff > 0 ? "rgba(248,113,113,0.25)" : "rgba(52,211,153,0.25)";

  return (
    <div className="anim" style={{ background:C.bg, minHeight:"100vh", paddingBottom:90 }}>

      {/* ── Hero ── */}
      <div style={{ position:"relative", height:240, background:C.s2 }}>
        <img
          src={r.img} alt={r.nom} loading="lazy"
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          onError={e => { e.target.style.display="none"; }}
        />
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to bottom,rgba(11,18,32,0.55) 0%,transparent 30%,rgba(11,18,32,0.97) 100%)" }}/>

        {/* Boutons haut */}
        <div style={{ position:"absolute", top:16, left:16, right:16,
          display:"flex", justifyContent:"space-between" }}>
          <button onClick={onBack} className="tap-icon" style={{
            width:36, height:36, borderRadius:11,
            background:"rgba(11,18,32,0.60)",
            border:"1px solid rgba(0,0,0,0.09)",
            display:"grid", placeItems:"center", cursor:"pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button onClick={() => onLike(r.id)} className="tap-icon" style={{
            width:36, height:36, borderRadius:11,
            background:"rgba(11,18,32,0.60)",
            border:"1px solid rgba(0,0,0,0.09)",
            display:"grid", placeItems:"center", cursor:"pointer" }}>
            <svg width="15" height="15" viewBox="0 0 24 24"
                 fill={liked ? "#F87171" : "none"}
                 stroke={liked ? "#F87171" : "#fff"}
                 strokeWidth="2" strokeLinecap="round">
              <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
            </svg>
          </button>
        </div>

        {/* Titre + tags */}
        <div style={{ position:"absolute", bottom:16, left:16, right:16 }}>
          <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
            <span style={{ display:"inline-flex", padding:"4px 10px", borderRadius:7,
              fontSize:10.5, fontWeight:600, fontFamily:FONT,
              background:"rgba(59,130,246,0.15)",
              border:"1px solid rgba(59,130,246,0.30)", color:"#93C5FD" }}>
              {repasLabel}
            </span>
            {r.tags.slice(0, 2).map(t => (
              <span key={t} style={{ display:"inline-flex", padding:"4px 10px",
                borderRadius:7, fontSize:10.5, fontWeight:600, fontFamily:FONT,
                background:"rgba(52,211,153,0.12)",
                border:"1px solid rgba(52,211,153,0.25)", color:"#34D399" }}>
                {TAG_LABELS[t]}
              </span>
            ))}
          </div>
          <div style={{ fontFamily:SERIF, fontSize:24, color:"#fff",
            lineHeight:1.15, letterSpacing:-0.5 }}>{r.nom}</div>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div style={{ padding:16 }}>

        {/* Stats */}
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          {[
            { l:"Calories", v:target, u:"" },
            { l:"Temps",    v:r.temps, u:" min" },
            { l:"Portions", v:r.portions, u:"" },
          ].map(s => (
            <div key={s.l} style={{ flex:1, background:C.s1,
              border:"1px solid rgba(0,0,0,0.06)", borderRadius:12,
              padding:"12px 8px", textAlign:"center" }}>
              <div style={{ fontSize:9, fontWeight:600, letterSpacing:"0.8px",
                textTransform:"uppercase", color:"${C.dim}",
                fontFamily:FONT, marginBottom:4 }}>{s.l}</div>
              <div style={{ fontFamily:SERIF, fontSize:20, color:"${C.text}",
                transition:"all .2s" }}>
                {s.v}<span style={{ fontSize:11, color:"#374151" }}>{s.u}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Curseur calories ── */}
        <div style={{ background:C.s1, border:"1px solid rgba(0,0,0,0.06)",
          borderRadius:16, padding:"16px", marginBottom:14 }}>

          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:10, fontWeight:600, letterSpacing:"1.2px",
                textTransform:"uppercase", color:"${C.dim}",
                fontFamily:FONT, marginBottom:3 }}>Ajuster les calories</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
                <span style={{ fontFamily:SERIF, fontSize:32, color:"${C.text}",
                  letterSpacing:-1, lineHeight:1 }}>{target}</span>
                <span style={{ fontSize:12, color:"#374151",
                  fontFamily:FONT }}>kcal</span>
              </div>
            </div>
            <span style={{ padding:"4px 10px", borderRadius:7,
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
              background:`linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((target - Math.round(base*0.4)) / (Math.round(base*2.2) - Math.round(base*0.4))) * 100}%, rgba(0,0,0,0.07) ${((target - Math.round(base*0.4)) / (Math.round(base*2.2) - Math.round(base*0.4))) * 100}%, rgba(0,0,0,0.07) 100%)`,
              cursor:"pointer", marginBottom:6,
            }}
          />
          <div style={{ display:"flex", justifyContent:"space-between",
            fontSize:10, color:"${C.dim}", fontFamily:FONT,
            marginBottom:14 }}>
            <span>{Math.round(base * 0.4)} kcal</span>
            <span style={{ color:"#374151" }}>Base : {base} kcal</span>
            <span>{Math.round(base * 2.2)} kcal</span>
          </div>

          {/* Macros */}
          <div style={{ display:"flex", gap:8 }}>
            {[
              { l:"Protéines", v:macros.prot, c:"#60A5FA", bg:"rgba(59,130,246,0.10)", bd:"rgba(59,130,246,0.20)" },
              { l:"Glucides",  v:macros.gluc, c:"#22D3EE", bg:"rgba(34,211,238,0.10)", bd:"rgba(34,211,238,0.20)" },
              { l:"Lipides",   v:macros.lip,  c:"#34D399", bg:"rgba(52,211,153,0.10)", bd:"rgba(52,211,153,0.20)" },
            ].map(m => (
              <div key={m.l} style={{ flex:1, background:m.bg,
                border:`1px solid ${m.bd}`, borderRadius:12, padding:"10px 8px",
                textAlign:"center" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                  gap:4, marginBottom:5 }}>
                  <span style={{ width:5, height:5, borderRadius:1.5,
                    background:m.c, display:"inline-block", flexShrink:0 }}/>
                  <span style={{ fontSize:10, color:"#374151",
                    fontFamily:FONT }}>{m.l}</span>
                </div>
                <div style={{ fontSize:16, fontWeight:700, color:"${C.text}",
                  fontFamily:FONT, transition:"all .2s" }}>
                  {m.v}<span style={{ fontSize:10, color:"${C.dim}" }}>g</span>
                </div>
                {/* Mini barre */}
                <div style={{ height:3, background:"rgba(0,0,0,0.06)",
                  borderRadius:2, marginTop:6, overflow:"hidden" }}>
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
              background:"rgba(0,0,0,0.03)",
              border:"1px solid rgba(0,0,0,0.06)", borderRadius:10,
              color:"#374151", fontSize:12, fontWeight:500,
              fontFamily:FONT, cursor:"pointer",
            }}>
              Revenir à la recette de base ({base} kcal)
            </button>
          )}
        </div>

        {/* Description */}
        <div style={{ fontSize:13, color:"${C.mid}",
          lineHeight:1.6, marginBottom:20, fontFamily:FONT }}>
          {r.desc}
        </div>

        {/* Ingrédients */}
        <div style={{ fontSize:15, fontWeight:700, color:"${C.text}",
          marginBottom:12, fontFamily:FONT }}>
          Ingrédients
          <span style={{ fontSize:11, color:"${C.dim}",
            marginLeft:8, fontWeight:400 }}>
            pour {r.portions} {r.portions > 1 ? "portions" : "portion"}
          </span>
          {targetKcal && targetKcal !== base && (
            <span style={{ fontSize:11, color:"#3B82F6", marginLeft:8,
              fontWeight:500, fontFamily:FONT }}>· ajustés</span>
          )}
        </div>
        <div style={{ background:C.s1,
          border:"1px solid rgba(0,0,0,0.06)", borderRadius:14,
          padding:"4px 14px", marginBottom:20 }}>
          {r.ingredients.map((ing, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between",
              padding:"10px 0",
              borderBottom: i < r.ingredients.length - 1
                ? "1px solid rgba(0,0,0,0.04)" : "none" }}>
              <span style={{ fontSize:13, color:"${C.text}",
                fontFamily:FONT }}>{ing.nom}</span>
              <span style={{ fontSize:13, fontWeight:600,
                color: targetKcal && targetKcal !== base ? "#93C5FD" : "#374151",
                fontFamily:FONT, transition:"color .2s" }}>
                {scaleQte(ing.qte, ratio)}
              </span>
            </div>
          ))}
        </div>

        {/* Préparation */}
        <div style={{ fontSize:15, fontWeight:700, color:"${C.text}",
          marginBottom:12, fontFamily:FONT }}>Préparation</div>
        <div style={{ display:"flex", flexDirection:"column",
          gap:12, marginBottom:24 }}>
          {r.etapes.map((etape, i) => (
            <div key={i} style={{ display:"flex", gap:12 }}>
              <div style={{ width:24, height:24, borderRadius:8,
                background:"#3B82F6", display:"grid", placeItems:"center",
                flexShrink:0, fontSize:12, fontWeight:700, color:"#fff",
                fontFamily:FONT }}>{i + 1}</div>
              <div style={{ fontSize:13, color:"#374151",
                lineHeight:1.55, paddingTop:2, fontFamily:FONT }}>{etape}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button className="tap" onClick={() => {
          if (push) push("✅", "Ajouté au journal", `${r.nom} · ${target} kcal`);
        }} style={{
          width:"100%", padding:13, borderRadius:12,
          background:"#3B82F6", border:"none", color:"#fff",
          fontFamily:FONT, fontSize:14, fontWeight:600,
          display:"flex", alignItems:"center", justifyContent:"center", gap:7,
          cursor:"pointer", boxShadow:"0 4px 14px rgba(59,130,246,0.35)",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Ajouter au journal · {target} kcal
        </button>

      </div>
    </div>
  );
}
