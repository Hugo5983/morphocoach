import { useState, useRef, useEffect } from "react";
import { RECIPES, REPAS, FILTRE_GROUPES, FILTRES, recipeBadge, prixEuros } from "../../data/recipes.js";
import RecipeDetail from "./RecipeDetail.jsx";
import { useRecipePhoto } from "./useRecipePhoto.js";
import { C, FONT, SERIF } from "../../data/constants.js";


// ─── Carte recette ────────────────────────────────────────────────────────────
// Trois règles d'homogénéisation, pour que toutes les cartes s'alignent :
//   1. photo en ratio 4/3 FIXE (avant : hauteur libre → images inégales)
//   2. titre coupé net à 2 lignes (avant : un nom long étirait la carte)
//   3. ligne du bas INSÉCABLE (avant : « 392 / kcal » et « ≈ 2,54 / € » se
//      coupaient en deux et cassaient l'alignement des deux colonnes)
// Le prix passe sur la photo : la ligne du bas n'a plus que kcal + badge, et
// plus rien ne se marche dessus.
function RecipeCard({ r, liked, onLike, onOpen }) {
  const badge = recipeBadge(r);
  const { src:photo } = useRecipePhoto(r.id, r.img, "card");
  const prix = prixEuros(r);
  return (
    <div onClick={() => onOpen(r)} className="tap" style={{
      background:C.s1, border:"1px solid rgba(0,0,0,0.05)",
      borderRadius:16, overflow:"hidden", cursor:"pointer",
      position:"relative", height:"100%",
      display:"flex", flexDirection:"column",
      contain:"layout paint",
    }}>
      <div style={{ position:"relative", width:"100%", aspectRatio:"4 / 3",
        background:C.s2, flexShrink:0 }}>
        <img
          src={photo} alt={r.nom} loading="lazy" decoding="async"
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          onError={e => { if (e.target.src !== r.img) e.target.src = r.img;
                          else e.target.style.display="none"; }}
        />
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to top,rgba(11,18,32,0.55) 0%,transparent 45%)" }}/>

        {/* prix, posé sur la photo */}
        {prix && (
          <div style={{ position:"absolute", left:8, bottom:8,
            padding:"4px 8px", borderRadius:8,
            background:"rgba(11,18,32,0.72)",
            color:"#FFF", fontSize:11, fontWeight:700, fontFamily:FONT,
            fontVariantNumeric:"tabular-nums", whiteSpace:"nowrap",
            letterSpacing:0.1 }}>{prix}</div>
        )}

        <button
          onClick={e => { e.stopPropagation(); onLike(r.id); }}
          aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
          style={{ position:"absolute", top:8, right:8,
            width:32, height:32, borderRadius:"50%",
            background: liked ? "rgba(248,113,113,0.95)" : "rgba(255,255,255,0.92)",
            border: liked ? "1px solid rgba(248,113,113,0.65)" : "1px solid rgba(255,255,255,0.65)",
            boxShadow: liked ? "0 3px 10px rgba(248,113,113,0.5)" : "0 2px 8px rgba(11,18,32,0.18)",
            display:"grid", placeItems:"center", cursor:"pointer",
            transition:"all .2s ease" }}>
          <svg width="15" height="15" viewBox="0 0 24 24"
               fill={liked ? "#FFF" : "none"}
               stroke={liked ? "#FFF" : "#F87171"}
               strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
          </svg>
        </button>
      </div>

      <div style={{ padding:"12px", flex:1, display:"flex", flexDirection:"column" }}>
        {/* titre : 2 lignes maximum, hauteur réservée → cartes alignées */}
        <div style={{ fontSize:13, fontWeight:700, color:C.text,
          lineHeight:1.32, marginBottom:10, fontFamily:FONT,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical",
          overflow:"hidden", minHeight:"2.64em" }}>{r.nom}</div>

        {/* ligne du bas : insécable, kcal à gauche, badge à droite */}
        <div style={{ display:"flex", alignItems:"center",
          justifyContent:"space-between", gap:8, marginTop:"auto" }}>
          <span style={{ fontSize:11, color:C.mid, fontFamily:FONT,
            whiteSpace:"nowrap", fontVariantNumeric:"tabular-nums" }}>
            {r.kcal} kcal
          </span>
          <span style={{ padding:"3px 8px", borderRadius:6, fontSize:10,
            fontWeight:700, fontFamily:FONT, letterSpacing:0.2,
            background: badge.c, border:`1px solid ${badge.c}`, color: C.text,
            whiteSpace:"nowrap", flexShrink:0 }}>{badge.l}</span>
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
  const repas    = props?.repas;
  const setRepas = props?.setRepas;
  const [filtres,  setFiltres]  = useState([]);   // multi-sélection (ET logique)
  const [menuOuvert, setMenuOuvert] = useState(false);
  const menuRef = useRef(null);

  // fermeture du menu au clic à l'extérieur
  useEffect(() => {
    if (!menuOuvert) return;
    const clic = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOuvert(false); };
    document.addEventListener("mousedown", clic);
    document.addEventListener("touchstart", clic);
    return () => { document.removeEventListener("mousedown", clic);
                   document.removeEventListener("touchstart", clic); };
  }, [menuOuvert]);
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
        repas={repas}
        setRepas={setRepas}
      />
    );
  }

  // ── Filtrage ──
  const searchLower = search.toLowerCase();
  const matchSearch = (r) => !searchLower || r.nom.toLowerCase().includes(searchLower);
  const matchFiltre = (r) => filtres.every(f => r.tags.includes(f));
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
  // rendu incrémental — budget global de cartes montées à l'écran
  const [nbVisible, setNbVisible] = useState(24);
  const sentinelle = useRef(null);
  useEffect(() => { setNbVisible(24); }, [search, filtres, showFavs, sortBy]);
  useEffect(() => {
    const el = sentinelle.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) setNbVisible(n => n + 24);
    }, { rootMargin: "600px" });        // recharge bien avant d'atteindre le bas
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible.length]);

  const sections = REPAS.map(rep => ({
    ...rep,
    recettes: visible.filter(r => r.repas === rep.id),
  })).filter(s => s.recettes.length > 0);

  const showFeatured = filtres.length === 0 && !search && !showFavs && sortBy === "default";

  return (
    <div className="anim" style={{ padding:"0 20px 32px" }}>

      {/* ── Header ── */}
      <div style={{ paddingTop:16, paddingBottom:16,
        display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.1em",
            textTransform:"uppercase", color:C.dim,
            fontFamily:FONT, marginBottom:4 }}>Explore</div>
          <div style={{ fontFamily:SERIF, fontSize:26, color:C.text,
            letterSpacing:-0.5, lineHeight:1.1 }}>Recettes</div>
        </div>
        <button onClick={() => setShowFavs(v => !v)}
          aria-label="Mes favoris"
          style={{ height:40, padding:"0 16px", borderRadius:12,
            background: showFavs ? "rgba(248,113,113,0.95)" : C.s1,
            border:`1px solid ${showFavs ? "rgba(248,113,113,0.65)" : "rgba(0,0,0,0.05)"}`,
            boxShadow: showFavs ? "0 3px 10px rgba(248,113,113,0.35)" : "none",
            display:"flex", alignItems:"center", gap:8, cursor:"pointer",
            transition:"all .2s ease" }}>
          <svg width="15" height="15" viewBox="0 0 24 24"
               fill={showFavs ? "#FFF" : "none"}
               stroke={showFavs ? "#FFF" : "#F87171"}
               strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
          </svg>
          <span style={{ fontSize:13, fontWeight:700, fontFamily:FONT,
            color: showFavs ? "#FFF" : C.mid }}>Favoris</span>
        </button>
      </div>

      {/* ── Banner PRO ── */}
      {!premium && (
        <div onClick={() => setPaywall && setPaywall(true)} style={{
          display:"flex", alignItems:"center", gap:12,
          background:"rgba(59,130,246,0.05)",
          border:"1px solid rgba(59,130,246,0.18)",
          borderRadius:16, padding:"12px 16px", marginBottom:12,
          cursor:"pointer",
        }}>
          <div style={{
            width:40, height:40, borderRadius:12, flexShrink:0,
            background:"rgba(59,130,246,0.12)",
            border:"1px solid rgba(59,130,246,0.25)",
            display:"grid", placeItems:"center", fontSize:20,
          }}>🍽️</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text,
              fontFamily:FONT }}>
              Nutrition PRO — 6.99€/mois
            </div>
            <div style={{ fontSize:11, color:C.mid,
              marginTop:2, fontFamily:FONT }}>
              Accès complet à toutes les recettes
            </div>
          </div>
          <div style={{
            padding:"4px 12px", borderRadius:8,
            background:C.accent, fontSize:11,
            color:"#FFF", fontWeight:700,
            fontFamily:FONT,
          }}>Voir</div>
        </div>
      )}

      {/* ── Recherche ── */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:8,
          background:C.s1, border:"1px solid rgba(0,0,0,0.05)",
          borderRadius:12, padding:"12px 12px" }}>
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
              border:"none", cursor:"pointer", color:C.mid,
              fontSize:16, lineHeight:1, padding:0 }}>×</button>
          )}
        </div>
        <div style={{ position:"relative", flexShrink:0 }}>
          <button onClick={() => setSortOpen(v => !v)}
            aria-label="Trier"
            style={{ width:40, height:40,
              background: sortBy!=="default" ? C.accent : C.s1,
              border:`1px solid ${sortBy!=="default" ? C.accent : "rgba(0,0,0,0.05)"}`,
              borderRadius:12, display:"grid", placeItems:"center", cursor:"pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke={sortBy!=="default" ? "#FFF" : C.mid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h13M3 12h9M3 18h5M17 8l4-4 4 4M21 4v16" transform="scale(0.78) translate(3,3)"/>
              <path d="M7 4v16M3 16l4 4 4-4"/>
            </svg>
          </button>
          {sortOpen && (
            <>
              <div onClick={() => setSortOpen(false)} style={{ position:"fixed", inset:0, zIndex:40 }}/>
              <div style={{ position:"absolute", top:46, right:0, zIndex:41,
                background:C.s1, border:"1px solid rgba(0,0,0,0.08)", borderRadius:16,
                boxShadow: C.shadow, padding:8, width:178 }}>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
                  color:C.dim, fontFamily:FONT, padding:"8px 12px 4px" }}>Trier par</div>
                {Object.entries(SORTS).map(([k, s]) => {
                  const on = sortBy === k;
                  return (
                    <button key={k} onClick={() => { setSortBy(k); setSortOpen(false); }}
                      style={{ width:"100%", textAlign:"left", padding:"12px 12px", borderRadius:8,
                        background: on ? "rgba(59,130,246,0.12)" : "transparent",
                        border:"none", cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"space-between",
                        fontFamily:FONT, fontSize:13, fontWeight: on?700:500,
                        color: on ? C.accentDk : C.text }}>
                      {s.l}
                      {on && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.accentDk} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Filtres (menu déroulant) ── */}
      <div ref={menuRef} style={{ position:"relative", marginBottom:20 }}>
        <button className="tap" onClick={() => setMenuOuvert(o => !o)} style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          width:"100%", padding:"12px 16px", borderRadius:14,
          background: filtres.length ? "rgba(59,130,246,0.08)" : C.s1,
          border:`1px solid ${filtres.length ? "rgba(59,130,246,0.3)" : "rgba(0,0,0,0.05)"}`,
          color:C.text, fontSize:14, fontWeight:600, fontFamily:FONT,
          cursor:"pointer" }}>
          <span style={{ display:"flex", alignItems:"center", gap:8 }}>
            Filtres
            {filtres.length > 0 && (
              <span style={{ display:"inline-flex", alignItems:"center",
                justifyContent:"center", minWidth:20, height:20, padding:"0 6px",
                borderRadius:10, background:C.accent, color:"#FFF",
                fontSize:11, fontWeight:700 }}>{filtres.length}</span>
            )}
          </span>
          <span style={{ color:C.mid, fontSize:12,
            transform:menuOuvert ? "rotate(180deg)" : "none",
            transition:"transform .2s" }}>▾</span>
        </button>

        {/* résumé des filtres actifs, menu fermé */}
        {!menuOuvert && filtres.length > 0 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8 }}>
            {filtres.map(id => (
              <button key={id} className="tap"
                onClick={() => setFiltres(p => p.filter(x => x !== id))}
                style={{ padding:"5px 10px", borderRadius:14, background:C.accent,
                  border:"none", color:"#FFF", fontSize:12, fontWeight:600,
                  fontFamily:FONT, cursor:"pointer" }}>
                {FILTRES.find(f => f.id === id)?.l} ✕
              </button>
            ))}
          </div>
        )}

        {menuOuvert && (
          <div style={{ position:"absolute", top:"calc(100% + 8px)", left:0, right:0,
            zIndex:40, background:C.s1, border:"1px solid rgba(0,0,0,0.08)",
            borderRadius:16, padding:16, maxHeight:380, overflowY:"auto",
            boxShadow:"0 12px 32px rgba(11,18,32,0.14)" }}>

            {FILTRE_GROUPES.map(grp => (
              <div key={grp.g} style={{ marginBottom:14 }}>
                <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.1em",
                  textTransform:"uppercase", color:C.dim, fontFamily:FONT,
                  marginBottom:8 }}>{grp.g}</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {grp.items.map(f => {
                    const on = filtres.includes(f.id);
                    return (
                      <button key={f.id} className="tap"
                        onClick={() => setFiltres(p =>
                          p.includes(f.id) ? p.filter(x => x !== f.id) : [...p, f.id])}
                        style={{
                          padding:"8px 14px", borderRadius:20, whiteSpace:"nowrap",
                          background: on ? C.accent : "rgba(0,0,0,0.05)",
                          border:`1px solid ${on ? C.accent : "rgba(0,0,0,0.05)"}`,
                          color: on ? "#FFF" : C.mid,
                          fontSize:13, fontWeight:600, fontFamily:FONT,
                          cursor:"pointer" }}>{f.l}</button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={{ display:"flex", gap:8, paddingTop:4,
              borderTop:"1px solid rgba(0,0,0,0.05)" }}>
              <button className="tap" onClick={() => setFiltres([])} style={{
                flex:1, padding:"10px", borderRadius:12, background:"rgba(0,0,0,0.05)",
                border:"none", color:C.mid, fontSize:13, fontWeight:600,
                fontFamily:FONT, cursor:"pointer" }}>Tout effacer</button>
              <button className="tap" onClick={() => setMenuOuvert(false)} style={{
                flex:1, padding:"10px", borderRadius:12, background:C.accent,
                border:"none", color:"#FFF", fontSize:13, fontWeight:600,
                fontFamily:FONT, cursor:"pointer" }}>
                Voir {visible.length} recette{visible.length > 1 ? "s" : ""}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── À la une ── */}
      {showFeatured && featured && (
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:12 }}>
            <span style={{ fontSize:14, fontWeight:700, color:C.text,
              fontFamily:FONT }}>À la une</span>
          </div>
          <div onClick={() => setSelected(featured)} className="tap" style={{
            background:C.s1, border:"1px solid rgba(0,0,0,0.05)",
            borderRadius:16, overflow:"hidden", cursor:"pointer" }}>
            <div style={{ position:"relative", height:150, background:C.s2 }}>
              <img
                src={featured.img} alt={featured.nom} loading="lazy"
                style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                onError={e => { e.target.style.display="none"; }}
              />
              <div style={{ position:"absolute", inset:0,
                background:"linear-gradient(to top,rgba(11,18,32,0.85) 0%,transparent 50%)" }}/>
              <div style={{ position:"absolute", bottom:12, left:12, right:52 }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:4,
                  fontSize:10, fontWeight:700, letterSpacing:"0.1em",
                  textTransform:"uppercase", color:"#FFF",
                  background:"linear-gradient(135deg,#FB7185,#F43F5E)",
                  border:"1px solid rgba(244,63,94,0.5)",
                  boxShadow:"0 3px 10px rgba(244,63,94,0.5)",
                  padding:"4px 8px", borderRadius:8,
                  fontFamily:FONT, marginBottom:8 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFF" stroke="none">
                    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
                  </svg>
                  Coup de cœur
                </div>
                <div style={{ fontSize:16, fontWeight:700, color:"#FFF",
                  lineHeight:1.2, fontFamily:FONT,
                  textShadow:"0 1px 6px rgba(0,0,0,0.35)" }}>{featured.nom}</div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
                  {[
                    `${featured.kcal} kcal`,
                    `${featured.temps} min`,
                    `${featured.prot}g prot.`,
                  ].map((t, i) => (
                    <span key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      {i > 0 && <span style={{ width:3, height:3, borderRadius:"50%",
                        background:"rgba(255,255,255,0.5)", display:"inline-block" }}/>}
                      <span style={{ fontSize:13, color:"rgba(255,255,255,0.85)",
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
                  background: liked[featured.id] ? "rgba(248,113,113,0.95)" : "rgba(255,255,255,0.85)",
                  backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
                  border: liked[featured.id] ? "1px solid rgba(248,113,113,0.65)" : "1px solid rgba(255,255,255,0.65)",
                  boxShadow: liked[featured.id] ? "0 3px 10px rgba(248,113,113,0.5)" : "0 2px 8px rgba(11,18,32,0.18)",
                  display:"grid", placeItems:"center", cursor:"pointer",
                  transition:"all .2s ease" }}>
                <svg width="16" height="16" viewBox="0 0 24 24"
                     fill={liked[featured.id] ? "#FFF" : "none"}
                     stroke={liked[featured.id] ? "#FFF" : "#F87171"}
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
        <div style={{ textAlign:"center", padding:"32px 20px",
          color:C.dim, fontSize:13, fontFamily:FONT, lineHeight:1.6 }}>
          {showFavs
            ? "Aucune recette en favori pour l'instant. Touche le cœur d'une recette pour l'ajouter."
            : "Aucune recette trouvée"}
        </div>
      ) : (
        (() => { let budget = nbVisible; return sections.map(section => {
          if (budget <= 0) return null;
          const aAfficher = section.recettes.slice(0, budget);
          budget -= aAfficher.length;
          section = { ...section, total: section.recettes.length, recettes: aAfficher };
          return (
          <div key={section.id} style={{ marginBottom:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:12 }}>
              <div>
                <span style={{ fontSize:14, fontWeight:700, color:C.text,
                  fontFamily:FONT }}>{section.label}</span>
                <span style={{ fontSize:11, color:C.dim,
                  marginLeft:8, fontFamily:FONT }}>
                  {section.total} recette{section.total > 1 ? "s" : ""}
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
        );}); })()
      )}

      {/* sentinelle : déclenche le chargement des 24 cartes suivantes */}
      <div ref={sentinelle} style={{ height:1 }}/>

    </div>
  );
}
