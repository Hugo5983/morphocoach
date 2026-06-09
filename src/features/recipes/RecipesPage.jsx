import { useState } from "react";
import { RECIPES, REPAS, FILTRES, recipeBadge } from "../../data/recipes.js";
import RecipeDetail from "./RecipeDetail.jsx";
import { C, FONT, SERIF } from "../../data/constants.js";


// ─── Carte recette ────────────────────────────────────────────────────────────
function RecipeCard({ r, liked, onLike, onOpen }) {
  const badge = recipeBadge(r);
  return (
    <div onClick={() => onOpen(r)} className="tap" style={{
      background:C.s1, border:"1px solid rgba(0,0,0,0.06)",
      borderRadius:14, overflow:"hidden", cursor:"pointer",
      position:"relative",
    }}>
      <div style={{ position:"relative", height:110, background:C.s2 }}>
        <img
          src={r.img} alt={r.nom} loading="lazy"
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          onError={e => { e.target.style.display="none"; }}
        />
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to top,rgba(11,18,32,0.70) 0%,transparent 55%)" }}/>
        <button
          onClick={e => { e.stopPropagation(); onLike(r.id); }}
          style={{ position:"absolute", bottom:8, right:8,
            width:28, height:28, borderRadius:8,
            background:"rgba(11,18,32,0.65)",
            border:"1px solid rgba(0,0,0,0.08)",
            display:"grid", placeItems:"center", cursor:"pointer" }}>
          <svg width="13" height="13" viewBox="0 0 24 24"
               fill={liked ? "#F87171" : "none"}
               stroke={liked ? "#F87171" : "#374151"}
               strokeWidth="2" strokeLinecap="round">
            <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
          </svg>
        </button>
      </div>
      <div style={{ padding:"10px 10px 12px" }}>
        <div style={{ fontSize:12.5, fontWeight:700, color:C.text,
          lineHeight:1.3, marginBottom:5, fontFamily:FONT }}>{r.nom}</div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:11, color:"#374151",
            fontFamily:FONT }}>{r.kcal} kcal</span>
          <span style={{ padding:"1px 6px", borderRadius:4, fontSize:9.5,
            fontWeight:600, fontFamily:FONT, letterSpacing:"0.3px",
            background: badge.c === "#34D399"
              ? "rgba(52,211,153,0.10)" : "rgba(59,130,246,0.10)",
            border:`1px solid ${badge.c === "#34D399"
              ? "rgba(52,211,153,0.20)" : "rgba(59,130,246,0.20)"}`,
            color: badge.c }}>{badge.l}</span>
        </div>
      </div>
    </div>
  );
}

// ─── RECIPES PAGE ─────────────────────────────────────────────────────────────
export default function Recipes(props) {
  const push     = props?.push;
  const premium  = props?.premium || false;
  const setPaywall = props?.setPaywall;
  const [filtre,   setFiltre]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [liked,    setLiked]    = useState({});
  const [selected, setSelected] = useState(null);

  const toggleLike = (id) => setLiked(p => ({ ...p, [id]: !p[id] }));

  // Ouvrir une recette — PRO requis pour le détail complet
  const openRecipe = (r) => {
    if (!premium) {
      if (setPaywall) setPaywall(true);
      return;
    }
    setSelected(r);
  };

  // ── Vue détail ──
  if (selected) {
    return (
      <RecipeDetail
        recipe={selected}
        onBack={() => setSelected(null)}
        liked={!!liked[selected.id]}
        onLike={toggleLike}
        push={push}
      />
    );
  }

  // ── Filtrage ──
  const searchLower = search.toLowerCase();
  const matchSearch = (r) => !searchLower || r.nom.toLowerCase().includes(searchLower);
  const matchFiltre = (r) => filtre === "all" || r.tags.includes(filtre);
  const visible = RECIPES.filter(r => matchSearch(r) && matchFiltre(r));

  // Featured = première recette protéinée santé
  const featured = RECIPES.find(r => r.id === 6);

  // Grouper par repas
  const sections = REPAS.map(rep => ({
    ...rep,
    recettes: visible.filter(r => r.repas === rep.id),
  })).filter(s => s.recettes.length > 0);

  const showFeatured = filtre === "all" && !search;

  return (
    <div className="anim" style={{ padding:"0 16px 20px" }}>

      {/* ── Header ── */}
      <div style={{ paddingTop:20, paddingBottom:14,
        display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontSize:10, fontWeight:600, letterSpacing:"1.2px",
            textTransform:"uppercase", color:C.dim,
            fontFamily:FONT, marginBottom:4 }}>Explore</div>
          <div style={{ fontFamily:SERIF, fontSize:26, color:C.text,
            letterSpacing:-0.6, lineHeight:1.1 }}>Recettes</div>
        </div>
        <button style={{ width:34, height:34, borderRadius:10,
          background:C.s1, border:"1px solid rgba(0,0,0,0.06)",
          display:"grid", placeItems:"center", cursor:"pointer" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="#374151" strokeWidth="1.8" strokeLinecap="round">
            <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>

      {/* ── Banner PRO ── */}
      {!premium && (
        <div onClick={() => setPaywall && setPaywall(true)} style={{
          display:"flex", alignItems:"center", gap:12,
          background:"rgba(59,130,246,0.06)",
          border:"1px solid rgba(59,130,246,0.20)",
          borderRadius:14, padding:"12px 14px", marginBottom:12,
          cursor:"pointer",
        }}>
          <div style={{
            width:38, height:38, borderRadius:11, flexShrink:0,
            background:"rgba(59,130,246,0.12)",
            border:"1px solid rgba(59,130,246,0.22)",
            display:"grid", placeItems:"center", fontSize:18,
          }}>🍽️</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text,
              fontFamily:"'Outfit',sans-serif" }}>
              Nutrition PRO — 6.99€/mois
            </div>
            <div style={{ fontSize:11.5, color:"#374151",
              marginTop:2, fontFamily:"'Outfit',sans-serif" }}>
              Accès complet à toutes les recettes
            </div>
          </div>
          <div style={{
            padding:"4px 10px", borderRadius:7,
            background:"#3B82F6", fontSize:11,
            color:"#fff", fontWeight:700,
            fontFamily:"'Outfit',sans-serif",
          }}>Voir</div>
        </div>
      )}

      {/* ── Recherche ── */}
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:8,
          background:C.s1, border:"1px solid rgba(0,0,0,0.06)",
          borderRadius:12, padding:"10px 12px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke={C.dim} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une recette…"
            style={{ background:"none", border:"none", outline:"none",
              color:C.text, fontSize:13, fontFamily:FONT, width:"100%" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background:"none",
              border:"none", cursor:"pointer", color:"#374151",
              fontSize:16, lineHeight:1, padding:0 }}>×</button>
          )}
        </div>
        <button style={{ width:40, height:40, background:C.s1,
          border:"1px solid rgba(0,0,0,0.06)", borderRadius:12,
          display:"grid", placeItems:"center", cursor:"pointer", flexShrink:0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="#374151" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M7 12h10M10 18h4"/>
          </svg>
        </button>
      </div>

      {/* ── Filtres thématiques ── */}
      <div style={{ display:"flex", gap:7, overflowX:"auto",
        paddingBottom:4, marginBottom:18, scrollbarWidth:"none" }}>
        {FILTRES.map(f => {
          const on = filtre === f.id;
          return (
            <button key={f.id} onClick={() => setFiltre(f.id)} className="tap" style={{
              padding:"6px 14px", borderRadius:20, whiteSpace:"nowrap",
              background: on ? "#3B82F6" : "rgba(0,0,0,0.04)",
              border:`1px solid ${on ? "#3B82F6" : "rgba(0,0,0,0.06)"}`,
              color: on ? "#fff" : "#374151",
              fontSize:12, fontWeight:600, fontFamily:FONT, cursor:"pointer",
            }}>{f.l}</button>
          );
        })}
      </div>

      {/* ── À la une ── */}
      {showFeatured && featured && (
        <div style={{ marginBottom:22 }}>
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:12 }}>
            <span style={{ fontSize:15, fontWeight:700, color:C.text,
              fontFamily:FONT }}>À la une</span>
          </div>
          <div onClick={() => setSelected(featured)} className="tap" style={{
            background:C.s1, border:"1px solid rgba(0,0,0,0.06)",
            borderRadius:16, overflow:"hidden", cursor:"pointer" }}>
            <div style={{ position:"relative", height:150, background:C.s2 }}>
              <img
                src={featured.img} alt={featured.nom} loading="lazy"
                style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                onError={e => { e.target.style.display="none"; }}
              />
              <div style={{ position:"absolute", inset:0,
                background:"linear-gradient(to top,rgba(11,18,32,0.88) 0%,transparent 50%)" }}/>
              <div style={{ position:"absolute", bottom:12, left:12, right:44 }}>
                <div style={{ fontSize:9.5, fontWeight:600, letterSpacing:"1px",
                  textTransform:"uppercase", color:"rgba(0,0,0,0.33)",
                  fontFamily:FONT, marginBottom:4 }}>Coup de cœur</div>
                <div style={{ fontSize:16, fontWeight:700, color:"#fff",
                  lineHeight:1.2, fontFamily:FONT }}>{featured.nom}</div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:5 }}>
                  {[
                    `${featured.kcal} kcal`,
                    `${featured.temps} min`,
                    `${featured.prot}g prot.`,
                  ].map((t, i) => (
                    <span key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      {i > 0 && <span style={{ width:3, height:3, borderRadius:"50%",
                        background:"rgba(0,0,0,0.14)", display:"inline-block" }}/>}
                      <span style={{ fontSize:12, color:"rgba(0,0,0,0.33)",
                        fontFamily:FONT }}>{t}</span>
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); toggleLike(featured.id); }}
                style={{ position:"absolute", bottom:12, right:12,
                  width:32, height:32, borderRadius:9,
                  background:"rgba(11,18,32,0.65)",
                  border:"1px solid rgba(0,0,0,0.08)",
                  display:"grid", placeItems:"center", cursor:"pointer" }}>
                <svg width="14" height="14" viewBox="0 0 24 24"
                     fill={liked[featured.id] ? "#F87171" : "none"}
                     stroke={liked[featured.id] ? "#F87171" : "#374151"}
                     strokeWidth="2" strokeLinecap="round">
                  <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sections ── */}
      {sections.length === 0 ? (
        <div style={{ textAlign:"center", padding:"40px 0",
          color:C.dim, fontSize:13, fontFamily:FONT }}>
          Aucune recette trouvée
        </div>
      ) : (
        sections.map(section => (
          <div key={section.id} style={{ marginBottom:22 }}>
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:12 }}>
              <div>
                <span style={{ fontSize:15, fontWeight:700, color:C.text,
                  fontFamily:FONT }}>{section.label}</span>
                <span style={{ fontSize:11, color:C.dim,
                  marginLeft:8, fontFamily:FONT }}>
                  {section.recettes.length} recette{section.recettes.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {section.recettes.map(r => (
                <RecipeCard key={r.id} r={r}
                  liked={!!liked[r.id]} onLike={toggleLike} onOpen={openRecipe}/>
              ))}
            </div>
          </div>
        ))
      )}

    </div>
  );
}
