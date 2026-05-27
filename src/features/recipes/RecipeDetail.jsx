import { REPAS } from "../../data/recipes.js";

const FONT  = "'Outfit','DM Sans',system-ui,sans-serif";
const SERIF = "'DM Serif Display','Georgia',serif";

const TAG_LABELS = {
  vegan:"Vegan", anti_inflammatoire:"Anti-inflammatoire",
  sante:"Santé", proteine:"Protéiné", rapide:"Rapide",
};

export default function RecipeDetail({ recipe, onBack, liked, onLike, push }) {
  if (!recipe) return null;
  const r = recipe;
  const repasLabel = REPAS.find(x => x.id === r.repas)?.label || "";

  return (
    <div className="anim" style={{ background:"#0B1220", minHeight:"100vh" }}>

      {/* ── Hero ── */}
      <div style={{ position:"relative", height:240, background:"#1A2336" }}>
        <img
          src={r.img} alt={r.nom} loading="lazy"
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          onError={e => { e.target.style.display="none"; }}
        />
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to bottom,rgba(11,18,32,0.55) 0%,transparent 30%,rgba(11,18,32,0.97) 100%)" }}/>

        {/* Boutons */}
        <div style={{ position:"absolute", top:16, left:16, right:16,
          display:"flex", justifyContent:"space-between" }}>
          <button onClick={onBack} className="tap-icon" style={{
            width:36, height:36, borderRadius:11,
            background:"rgba(11,18,32,0.55)",
            border:"1px solid rgba(255,255,255,0.12)",
            display:"grid", placeItems:"center", cursor:"pointer",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button onClick={() => onLike(r.id)} className="tap-icon" style={{
            width:36, height:36, borderRadius:11,
            background:"rgba(11,18,32,0.55)",
            border:"1px solid rgba(255,255,255,0.12)",
            display:"grid", placeItems:"center", cursor:"pointer",
          }}>
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
      <div style={{ padding:16, paddingBottom:90 }}>

        {/* Stats */}
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {[
            { l:"Calories", v:r.kcal, u:"" },
            { l:"Temps",    v:r.temps, u:" min" },
            { l:"Portions", v:r.portions, u:"" },
          ].map(s => (
            <div key={s.l} style={{ flex:1, background:"#111827",
              border:"1px solid rgba(255,255,255,0.07)", borderRadius:12,
              padding:"12px 8px", textAlign:"center" }}>
              <div style={{ fontSize:9, fontWeight:600, letterSpacing:"0.8px",
                textTransform:"uppercase", color:"rgba(242,244,247,0.38)",
                fontFamily:FONT, marginBottom:4 }}>{s.l}</div>
              <div style={{ fontFamily:SERIF, fontSize:20, color:"#F2F4F7" }}>
                {s.v}<span style={{ fontSize:11, color:"rgba(242,244,247,0.40)" }}>{s.u}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Macros */}
        <div style={{ display:"flex", gap:8, marginBottom:18 }}>
          {[
            { l:"Protéines", v:r.prot, c:"#60A5FA" },
            { l:"Glucides",  v:r.gluc, c:"#22D3EE" },
            { l:"Lipides",   v:r.lip,  c:"#34D399" },
          ].map(m => (
            <div key={m.l} style={{ flex:1, background:"#111827",
              border:"1px solid rgba(255,255,255,0.07)", borderRadius:12,
              padding:12, textAlign:"center" }}>
              <div style={{ display:"flex", alignItems:"center",
                justifyContent:"center", gap:4, marginBottom:5 }}>
                <span style={{ width:6, height:6, borderRadius:2,
                  background:m.c, display:"inline-block" }}/>
                <span style={{ fontSize:10, color:"rgba(242,244,247,0.50)",
                  fontFamily:FONT }}>{m.l}</span>
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:"#F2F4F7",
                fontFamily:FONT }}>
                {m.v}<span style={{ fontSize:10, color:"rgba(242,244,247,0.35)" }}>g</span>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ fontSize:13, color:"rgba(242,244,247,0.60)",
          lineHeight:1.6, marginBottom:20, fontFamily:FONT }}>
          {r.desc}
        </div>

        {/* Ingrédients */}
        <div style={{ fontSize:15, fontWeight:700, color:"#F2F4F7",
          marginBottom:12, fontFamily:FONT }}>
          Ingrédients
          <span style={{ fontSize:11, color:"rgba(242,244,247,0.35)",
            marginLeft:8, fontWeight:400 }}>
            pour {r.portions} {r.portions > 1 ? "portions" : "portion"}
          </span>
        </div>
        <div style={{ background:"#111827",
          border:"1px solid rgba(255,255,255,0.07)", borderRadius:14,
          padding:"4px 14px", marginBottom:20 }}>
          {r.ingredients.map((ing, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between",
              padding:"10px 0",
              borderBottom: i < r.ingredients.length - 1
                ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <span style={{ fontSize:13, color:"#F2F4F7", fontFamily:FONT }}>{ing.nom}</span>
              <span style={{ fontSize:13, color:"rgba(242,244,247,0.50)",
                fontWeight:600, fontFamily:FONT }}>{ing.qte}</span>
            </div>
          ))}
        </div>

        {/* Préparation */}
        <div style={{ fontSize:15, fontWeight:700, color:"#F2F4F7",
          marginBottom:12, fontFamily:FONT }}>Préparation</div>
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
          {r.etapes.map((etape, i) => (
            <div key={i} style={{ display:"flex", gap:12 }}>
              <div style={{ width:24, height:24, borderRadius:8,
                background:"#3B82F6", display:"grid", placeItems:"center",
                flexShrink:0, fontSize:12, fontWeight:700, color:"#fff",
                fontFamily:FONT }}>{i + 1}</div>
              <div style={{ fontSize:13, color:"rgba(242,244,247,0.70)",
                lineHeight:1.55, paddingTop:2, fontFamily:FONT }}>{etape}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button className="tap" onClick={() => {
          if (push) push("✅", "Ajouté au journal", `${r.nom} · ${r.kcal} kcal`);
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
          Ajouter au journal
        </button>

      </div>
    </div>
  );
}
