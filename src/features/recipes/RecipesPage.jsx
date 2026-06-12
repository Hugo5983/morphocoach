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
      position:"relative", height:"100%",
      display:"flex", flexDirection:"column",
    }}>
      <div style={{ position:"relative", height:110, background:C.s2, flexShrink:0 }}>
        <img
          src={r.img} alt={r.nom} loading="lazy"
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          onError={e => { e.target.style.display="none"; }}
        />
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to top,rgba(11,18,32,0.70) 0%,transparent 55%)" }}/>
        <button
          onClick={e => { e.stopPropagation(); onLike(r.id); }}
          aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
          style={{ position:"absolute", top:8, right:8,
            width:32, height:32, borderRadius:"50%",
            background: liked ? "rgba(248,113,113,0.95)" : "rgba(255,255,255,0.92)",
            backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
            border: liked ? "1px solid rgba(248,113,113,0.6)" : "1px solid rgba(255,255,255,0.7)",
            boxShadow: liked ? "0 3px 10px rgba(248,113,113,0.45)" : "0 2px 8px rgba(11,18,32,0.18)",
            display:"grid", placeItems:"center", cursor:"pointer",
            transition:"all .2s ease" }}>
          <svg width="15" height="15" viewBox="0 0 24 24"
               fill={liked ? "#fff" : "none"}
               stroke={liked ? "#fff" : "#F87171"}
               strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
          </svg>
        </button>
      </div>
      <div style={{ padding:"10px 10px 12px", flex:1, display:"flex", flexDirection:"column" }}>
        <div style={{ fontSize:12.5, fontWeight:700, color:C.text,
          lineHeight:1.3, marginBottom:8, fontFamily:FONT }}>{r.nom}</div>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:"auto" }}>
          <span style={{ fontSize:11, color:"#374151",
            fontFamily:FONT }}>{r.kcal} kcal</span>
          <span style={{ padding:"2px 8px", borderRadius:5, fontSize:9.5,
            fontWeight:800, fontFamily:FONT, letterSpacing:"0.4px",
            background: badge.c,
            border:`1px solid ${badge.c}`,
            color: "#0F1923" }}>{badge.l}</span>
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
  const [showFavs, setShowFavs] = useState(false);
  const [sortBy,   setSortBy]   = useState("default");  // default | temps | kcal | prot
  const [sortOpen, setSortOpen] = useState(false);

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
  const matchFav    = (r) => !showFavs || !!liked[r.id];
  let visible = RECIPES.filter(r => matchSearch(r) && matchFiltre(r) && matchFav(r));

  // ── Tri ──
  const SORTS = {
    default: { l:"Pertinence",      fn:null },
    temps:   { l:"Plus rapide",     fn:(a,b)=>a.temps-b.temps },
    kcal:    { l:"Moins calorique", fn:(a,b)=>a.kcal-b.kcal },
    prot:    { l:"Plus protéiné",   fn:(a,b)=>b.prot-a.prot },
  };
  if (SORTS[sortBy]?.fn) visible = [...visible].sort(SORTS[sortBy].fn);

  // Featured = première recette protéinée santé
  const featured = RECIPES.find(r => r.id === 6);

  // Grouper par repas
  const sections = REPAS.map(rep => ({
    ...rep,
    recettes: visible.filter(r => r.repas === rep.id),
  })).filter(s => s.recettes.length > 0);

  const showFeatured = filtre === "all" && !search && !showFavs && sortBy === "default";

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
        <button onClick={() => setShowFavs(v => !v)}
          aria-label="Mes favoris"
          style={{ height:38, padding:"0 14px", borderRadius:12,
            background: showFavs ? "rgba(248,113,113,0.95)" : C.s1,
            border:`1px solid ${showFavs ? "rgba(248,113,113,0.6)" : "rgba(0,0,0,0.06)"}`,
            boxShadow: showFavs ? "0 3px 10px rgba(248,113,113,0.4)" : "none",
            display:"flex", alignItems:"center", gap:6, cursor:"pointer",
            transition:"all .2s ease" }}>
          <svg width="15" height="15" viewBox="0 0 24 24"
               fill={showFavs ? "#fff" : "none"}
               stroke={showFavs ? "#fff" : "#F87171"}
               strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
          </svg>
          <span style={{ fontSize:12, fontWeight:700, fontFamily:FONT,
            color: showFavs ? "#fff" : "#374151" }}>Favoris</span>
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
        <div style={{ position:"relative", flexShrink:0 }}>
          <button onClick={() => setSortOpen(v => !v)}
            aria-label="Trier"
            style={{ width:40, height:40,
              background: sortBy!=="default" ? "#3B82F6" : C.s1,
              border:`1px solid ${sortBy!=="default" ? "#3B82F6" : "rgba(0,0,0,0.06)"}`,
              borderRadius:12, display:"grid", placeItems:"center", cursor:"pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke={sortBy!=="default" ? "#fff" : "#374151"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h13M3 12h9M3 18h5M17 8l4-4 4 4M21 4v16" transform="scale(0.78) translate(3,3)"/>
              <path d="M7 4v16M3 16l4 4 4-4"/>
            </svg>
          </button>
          {sortOpen && (
            <>
              <div onClick={() => setSortOpen(false)} style={{ position:"fixed", inset:0, zIndex:40 }}/>
              <div style={{ position:"absolute", top:46, right:0, zIndex:41,
                background:C.s1, border:"1px solid rgba(0,0,0,0.08)", borderRadius:14,
                boxShadow:"0 10px 30px rgba(15,25,35,0.14)", padding:6, width:178 }}>
                <div style={{ fontSize:9, fontWeight:800, letterSpacing:"1px", textTransform:"uppercase",
                  color:C.dim, fontFamily:FONT, padding:"7px 10px 5px" }}>Trier par</div>
                {Object.entries(SORTS).map(([k, s]) => {
                  const on = sortBy === k;
                  return (
                    <button key={k} onClick={() => { setSortBy(k); setSortOpen(false); }}
                      style={{ width:"100%", textAlign:"left", padding:"10px 10px", borderRadius:9,
                        background: on ? "rgba(59,130,246,0.10)" : "transparent",
                        border:"none", cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"space-between",
                        fontFamily:FONT, fontSize:13, fontWeight: on?700:500,
                        color: on ? "#2563EB" : C.text }}>
                      {s.l}
                      {on && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
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
              <div style={{ position:"absolute", bottom:12, left:12, right:52 }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:5,
                  fontSize:10, fontWeight:800, letterSpacing:"0.6px",
                  textTransform:"uppercase", color:"#fff",
                  background:"linear-gradient(135deg,#FB7185,#F43F5E)",
                  border:"1px solid rgba(244,63,94,0.5)",
                  boxShadow:"0 3px 10px rgba(244,63,94,0.5)",
                  padding:"3px 9px", borderRadius:7,
                  fontFamily:FONT, marginBottom:7 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff" stroke="none">
                    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
                  </svg>
                  Coup de cœur
                </div>
                <div style={{ fontSize:16, fontWeight:700, color:"#fff",
                  lineHeight:1.2, fontFamily:FONT,
                  textShadow:"0 1px 6px rgba(0,0,0,0.4)" }}>{featured.nom}</div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:5 }}>
                  {[
                    `${featured.kcal} kcal`,
                    `${featured.temps} min`,
                    `${featured.prot}g prot.`,
                  ].map((t, i) => (
                    <span key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      {i > 0 && <span style={{ width:3, height:3, borderRadius:"50%",
                        background:"rgba(255,255,255,0.55)", display:"inline-block" }}/>}
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.92)",
                        fontFamily:FONT, textShadow:"0 1px 4px rgba(0,0,0,0.35)" }}>{t}</span>
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); toggleLike(featured.id); }}
                aria-label={liked[featured.id] ? "Retirer des favoris" : "Ajouter aux favoris"}
                style={{ position:"absolute", top:12, right:12,
                  width:34, height:34, borderRadius:"50%",
                  background: liked[featured.id] ? "rgba(248,113,113,0.95)" : "rgba(255,255,255,0.92)",
                  backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
                  border: liked[featured.id] ? "1px solid rgba(248,113,113,0.6)" : "1px solid rgba(255,255,255,0.7)",
                  boxShadow: liked[featured.id] ? "0 3px 10px rgba(248,113,113,0.45)" : "0 2px 8px rgba(11,18,32,0.2)",
                  display:"grid", placeItems:"center", cursor:"pointer",
                  transition:"all .2s ease" }}>
                <svg width="16" height="16" viewBox="0 0 24 24"
                     fill={liked[featured.id] ? "#fff" : "none"}
                     stroke={liked[featured.id] ? "#fff" : "#F87171"}
                     strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sections ── */}
      {sections.length === 0 ? (
        <div style={{ textAlign:"center", padding:"40px 20px",
          color:C.dim, fontSize:13, fontFamily:FONT, lineHeight:1.6 }}>
          {showFavs
            ? "Aucune recette en favori pour l'instant. Touche le cœur d'une recette pour l'ajouter."
            : "Aucune recette trouvée"}
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
