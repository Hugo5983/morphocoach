import { useState, useRef, useEffect } from"react";
import useScrollTop from"../../hooks/useScrollTop.js";
import { RECIPES, REPAS, FILTRE_GROUPES, FILTRES, recipeBadge, prixEuros } from"../../data/recipes.js";
import RecipeDetail from"./RecipeDetail.jsx";
import { useRecipePhoto } from"./useRecipePhoto.js";
import { C, FONT, NUM } from"../../data/constants.js";
import { I } from"../../components/ui/Icon.jsx";

// ─── Carte recette (rail horizontal, 178px) ──────────────────────────────────
function RecipeCard({ r, liked, onLike, onOpen, fluid }) {
  const { src:photo } = useRecipePhoto(r.id, r.img,"card");
  const prix = prixEuros(r);
  return (
    <div onClick={() => onOpen(r)} className="tap" style={{
      ...(fluid ? { width:"100%" } : { flex:"none", width:178 }),
      background:C.s1,
      border:`1px solid ${C.bd}`, borderRadius:16,
      overflow:"hidden", cursor:"pointer",
      display:"flex", flexDirection:"column",
      contain:"layout paint",
    }}>
      <div style={{ position:"relative", width:"100%", aspectRatio:"4 / 3",
        background:C.s2, flexShrink:0 }}>
        <img src={photo} alt={r.nom} loading="lazy" decoding="async"
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          onError={e => { if (e.target.src !== r.img) e.target.src = r.img;
                          else e.target.style.display="none"; }}/>
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to top,rgba(16,19,24,0.55) 0%,transparent 45%)" }}/>
        {prix && (
          <div style={{ position:"absolute", left:8, bottom:8,
            padding:"4px 8px", borderRadius:8,
            background:"rgba(16,19,24,0.72)",
            color:"#FFF", fontSize:11, fontWeight:700, fontFamily:FONT,
            ...NUM, whiteSpace:"nowrap", letterSpacing:0.1 }}>{prix}</div>
        )}
        <button onClick={e => { e.stopPropagation(); onLike(r.id); }}
          aria-label={liked ?"Retirer des favoris" :"Ajouter aux favoris"}
          style={{ position:"absolute", top:8, right:8,
            width:32, height:32, borderRadius:"50%",
            background: liked ?"rgba(229,72,77,0.95)" :"rgba(255,255,255,0.92)",
            border: liked ?"1px solid rgba(229,72,77,0.65)" :"1px solid rgba(255,255,255,0.65)",
            boxShadow: liked ?"0 3px 10px rgba(229,72,77,0.5)" :"0 2px 8px rgba(16,19,24,0.18)",
            display:"grid", placeItems:"center", cursor:"pointer",
            transition:"all .2s ease" }}>
          <svg width="15" height="15" viewBox="0 0 24 24"
            fill={liked ?"#FFF" :"none"} stroke={liked ?"#FFF" :"#E5484D"}
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
          </svg>
        </button>
      </div>
      <div style={{ padding:"12px 13px 13px", flex:1, display:"flex",
        flexDirection:"column", gap:8 }}>
        <span style={{ fontSize:15, fontWeight:600, color:C.text, fontFamily:FONT,
          lineHeight:1.25, display:"-webkit-box", WebkitLineClamp:2,
          WebkitBoxOrient:"vertical", overflow:"hidden" }}>{r.nom}</span>
        <div style={{ marginTop:"auto", display:"flex", alignItems:"center",
          justifyContent:"space-between" }}>
          <span style={{ fontSize:13.5, fontWeight:600, color:C.dim,
            fontFamily:FONT, ...NUM }}>{r.kcal} kcal</span>
        </div>
      </div>
    </div>
  );
}

// ─── Hero card (rail éditorial) ──────────────────────────────────────────────
function HeroCard({ r, onOpen }) {
  const { src:photo } = useRecipePhoto(r.id, r.img,"card");
  return (
    <div onClick={() => onOpen(r)} className="tap" style={{
      flex:"none", width:300, position:"relative", borderRadius:18,
      overflow:"hidden", aspectRatio:"16 / 10", background:C.s3,
      border:`1px solid ${C.bd}`, cursor:"pointer",
    }}>
      <img src={photo} alt={r.nom} loading="lazy" decoding="async"
        style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
        onError={e => { e.target.style.display="none"; }}/>
      <div style={{ position:"absolute", inset:0,
        background:"linear-gradient(to top,rgba(16,19,24,0.72),rgba(16,19,24,0) 58%)",
        pointerEvents:"none" }}/>
      <span style={{ position:"absolute", left:18, right:18, bottom:15,
        fontSize:23, fontWeight:700, lineHeight:1.15, letterSpacing:"-.01em",
        color:"#FFFFFF", fontFamily:FONT }}>{r.nom}</span>
    </div>
  );
}

// ─── Rail section ────────────────────────────────────────────────────────────
function SectionRail({ label, recettes, liked, onLike, onOpen, onVoirTout }) {
  if (!recettes.length) return null;
  return (
    <div style={{ marginTop:26 }}>
      <div style={{ display:"flex", alignItems:"baseline",
        justifyContent:"space-between", padding:"0 20px" }}>
        <span style={{ fontSize:13, fontWeight:700, letterSpacing:".12em",
          textTransform:"uppercase", color:C.mid, fontFamily:FONT }}>{label}</span>
        {onVoirTout && (
          <button onClick={onVoirTout} style={{ background:"none", border:"none",
            fontSize:14.5, fontWeight:600, color:C.accent, fontFamily:FONT,
            cursor:"pointer", padding:0 }}>Voir tout</button>
        )}
      </div>
      <div style={{ display:"flex", gap:14, overflowX:"auto",
        padding:"14px 20px 2px", scrollbarWidth:"none",
        WebkitOverflowScrolling:"touch" }}>
        {recettes.map(r => (
          <RecipeCard key={r.id} r={r} liked={!!liked[r.id]}
            onLike={onLike} onOpen={onOpen}/>
        ))}
      </div>
    </div>
  );
}

// ─── RECIPES PAGE ─────────────────────────────────────────────────────────────
export default function Recipes(props) {
  const push       = props?.push;
  const premium    = props?.premium || false;
  const setPaywall = props?.setPaywall;
  const repas      = props?.repas;
  const setRepas   = props?.setRepas;

  const [search,    setSearch]    = useState("");
  const [filtres,   setFiltres]   = useState([]);
  const [drawerOpen,setDrawerOpen]= useState(false);
  const [liked,     setLiked]     = useState({});
  const [selected,  setSelected]  = useState(null);
  const [showFavs,  setShowFavs]  = useState(false);
  const [voirTout,  setVoirTout]  = useState(null);   // id de la section dépliée
  useScrollTop(voirTout);

  const toggleLike = (id) => setLiked(p => ({ ...p, [id]: !p[id] }));
  const openRecipe = (r) => {
    if (!premium) { if (setPaywall) setPaywall(true); return; }
    setSelected(r);
  };

  // ── Vue détail ──
  if (selected) return (
    <RecipeDetail recipe={selected} onBack={() => setSelected(null)}
      liked={!!liked[selected.id]} onLike={toggleLike}
      push={push} repas={repas} setRepas={setRepas}/>
  );

  // ── Filtrage ──
  const sl = search.toLowerCase();
  const matchSearch = (r) => !sl || r.nom.toLowerCase().includes(sl);
  const matchFiltre = (r) => filtres.every(f => r.tags?.includes(f));
  const matchFav    = (r) => !showFavs || !!liked[r.id];
  const visible = RECIPES.filter(r => matchSearch(r) && matchFiltre(r) && matchFav(r));

  // Grouper par repas
  const sections = REPAS.map(rep => ({
    ...rep, recettes: visible.filter(r => r.repas === rep.id),
  })).filter(s => s.recettes.length > 0);

  // Hero : 3 recettes récentes (ou les premières protéinées)
  const heroRecipes = RECIPES.filter(r => r.tags?.includes("proteine")).slice(0, 3);
  const showHome = !search && filtres.length === 0 && !showFavs && !voirTout;

  // ── Vue « Voir tout » d'une section ──
  if (voirTout) {
    const sec = sections.find(s => s.id === voirTout);
    if (!sec) { setVoirTout(null); return null; }
    return (
      <div className="anim" style={{ padding:"0 0 32px" }}>
        <div style={{ position:"sticky", top:0, zIndex:10,
          background:"rgba(246,247,249,0.9)", backdropFilter:"blur(12px)",
          WebkitBackdropFilter:"blur(12px)",
          borderBottom:`1px solid ${C.bd}`, padding:"18px 20px 15px",
          display:"flex", alignItems:"center", gap:14 }}>
          <button onClick={() => setVoirTout(null)} className="tap"
            style={{ background:"none", border:"none", cursor:"pointer",
              padding:0, display:"flex", alignItems:"center" }}>
            <I name="chevronLeft" size={20} color={C.text}/>
          </button>
          <span style={{ fontSize:18, fontWeight:700, fontFamily:FONT,
            color:C.text }}>{sec.label}</span>
          <span style={{ fontSize:13, color:C.dim, fontFamily:FONT }}>
            {sec.recettes.length}
          </span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
          gap:12, padding:"16px 20px" }}>
          {sec.recettes.map(r => (
            <RecipeCard key={r.id} r={r} liked={!!liked[r.id]}
              onLike={toggleLike} onOpen={openRecipe} fluid/>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="anim" style={{ padding:"0 0 32px" }}>

      {/* ── Header sticky : recherche + filtre ── */}
      <div style={{ position:"sticky", top:0, zIndex:10,
        background:"rgba(246,247,249,0.9)", backdropFilter:"blur(12px)",
        WebkitBackdropFilter:"blur(12px)",
        borderBottom:`1px solid rgba(16,19,24,0.06)`,
        padding:"18px 20px 15px", display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:10,
          background:"#FFFFFF", border:`1px solid ${C.bd}`,
          borderRadius:999, padding:"12px 16px" }}>
          <I name="search" size={18} color="#98A2B3"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher"
            style={{ background:"none", border:"none", outline:"none",
              color:C.text, fontSize:15, fontWeight:500, fontFamily:FONT,
              width:"100%" }}/>
          {search && (
            <button onClick={() => setSearch("")} style={{ background:"none",
              border:"none", cursor:"pointer", padding:0 }}>
              <I name="close" size={16} color={C.dim}/>
            </button>
          )}
        </div>
        {/* Bouton filtres */}
        <button onClick={() => setDrawerOpen(true)} className="tap"
          style={{ width:44, height:44, flex:"none", display:"grid",
            placeItems:"center", background:"none", border:"none",
            cursor:"pointer", position:"relative" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke={filtres.length ? C.accent : C.dim}
            strokeWidth="2.2" strokeLinecap="round">
            <path d="M4 6h16M6 12h12M9 18h6"/>
          </svg>
          {filtres.length > 0 && (
            <div style={{ position:"absolute", top:4, right:4,
              width:16, height:16, borderRadius:8, background:C.accent,
              color:"#FFF", fontSize:9, fontWeight:700, display:"grid",
              placeItems:"center" }}>{filtres.length}</div>
          )}
        </button>

      </div>

      {/* ── Hero éditorial ── */}
      {showHome && heroRecipes.length > 0 && (
        <div>
          <div style={{ padding:"20px 20px 0" }}>
            <span style={{ fontSize:13, fontWeight:700, letterSpacing:".12em",
              textTransform:"uppercase", color:C.mid, fontFamily:FONT }}>
              Tout nouveau, tout chaud
            </span>
          </div>
          <div style={{ display:"flex", gap:14, overflowX:"auto",
            padding:"14px 20px 2px", scrollbarWidth:"none",
            WebkitOverflowScrolling:"touch" }}>
            {heroRecipes.map(r => (
              <HeroCard key={r.id} r={r} onOpen={openRecipe}/>
            ))}
          </div>
        </div>
      )}

      {/* ── Sections par repas (rails) ── */}
      {sections.length === 0 ? (
        <div style={{ textAlign:"center", padding:"48px 20px",
          color:C.dim, fontSize:14, fontFamily:FONT, lineHeight:1.6 }}>
          {showFavs
            ?"Aucune recette en favori pour l'instant. Touche le cœur d'une recette pour l'ajouter."
            :"Aucune recette trouvée"}
        </div>
      ) : (
        sections.map(sec => (
          <SectionRail key={sec.id} label={sec.label}
            recettes={showHome ? sec.recettes.slice(0, 8) : sec.recettes}
            liked={liked} onLike={toggleLike} onOpen={openRecipe}
            onVoirTout={sec.recettes.length > 4
              ? () => { setVoirTout(sec.id); window.scrollTo(0,0); }
              : null}/>
        ))
      )}

      {/* ── CTA Premium ── */}
      {!premium && (
        <div style={{ margin:"32px 20px 0", display:"flex", flexDirection:"column",
          alignItems:"center", gap:16 }}>
          <span style={{ fontSize:21, fontWeight:800, letterSpacing:"-.02em",
            textAlign:"center", maxWidth:290, lineHeight:1.28, fontFamily:FONT,
            color:C.text }}>
            Obtenez un accès illimité aux recettes santé
          </span>
          <button onClick={() => setPaywall && setPaywall(true)} className="tap" style={{
            width:"100%", display:"flex", alignItems:"center", justifyContent:"center",
            gap:9, background:C.accent, color:"#FFFFFF", borderRadius:14, padding:16,
            fontSize:15, fontWeight:700, letterSpacing:".02em", fontFamily:FONT,
            border:"none", cursor:"pointer",
            boxShadow:"0 8px 20px rgba(60,91,255,0.28)" }}>
            <I name="lock" size={15} color="#FFF"/>
            <span>TOUT DÉBLOQUER</span>
          </button>
        </div>
      )}

      {/* ── Drawer filtres (glisse depuis la gauche) ── */}
      {drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{
            position:"fixed", inset:0, background:"rgba(16,19,24,0.42)",
            zIndex:50, animation:"fadeIn .2s ease" }}/>
          <div style={{ position:"fixed", top:0, left:0, bottom:0,
            width:"85%", maxWidth:330, zIndex:51,
            background:"#FFFFFF", fontFamily:FONT,
            display:"flex", flexDirection:"column",
            boxShadow:"22px 0 60px rgba(16,19,24,0.28)",
            animation:"slideRight .32s cubic-bezier(.33,1,.32,1)" }}>
            {/* header drawer */}
            <div style={{ display:"flex", alignItems:"center",
              justifyContent:"space-between", padding:"22px 20px 16px",
              borderBottom:`1px solid rgba(16,19,24,0.07)` }}>
              <span style={{ fontSize:20, fontWeight:700,
                letterSpacing:"-.02em" }}>Filtres</span>
              <button onClick={() => setDrawerOpen(false)} className="tap"
                style={{ width:34, height:34, borderRadius:10,
                  background:C.s2, display:"grid", placeItems:"center",
                  border:"none", cursor:"pointer" }}>
                <I name="close" size={16} color={C.mid}/>
              </button>
            </div>
            {/* contenu filtres */}
            <div style={{ flex:1, overflow:"auto", padding:20,
              display:"flex", flexDirection:"column", gap:22 }}>
              {/* Type de repas */}
              <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
                <span style={{ fontSize:12, fontWeight:700, letterSpacing:".08em",
                  textTransform:"uppercase", color:C.dim }}>Type de repas</span>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {REPAS.map(rep => {
                    const on = !filtres.some(f => REPAS.map(r=>r.id).includes(f)) && rep.id==="all"
                      || filtres.includes(rep.id);
                    return (
                      <button key={rep.id} onClick={() => {
                        setFiltres(p => p.includes(rep.id)
                          ? p.filter(x => x !== rep.id) : [...p.filter(x => !REPAS.map(r=>r.id).includes(x)), rep.id]);
                      }} className="tap" style={{
                        fontSize:13, fontWeight:600, borderRadius:999,
                        padding:"8px 14px", cursor:"pointer",
                        background: on ? C.accent : C.s2,
                        color: on ?"#FFF" : C.mid,
                        border: on ?"none" :`1px solid rgba(16,19,24,0.06)`,
                      }}>{rep.label}</button>
                    );
                  })}
                </div>
              </div>

              {/* Groupes de filtres */}
              {FILTRE_GROUPES.map(grp => (
                <div key={grp.g} style={{ display:"flex", flexDirection:"column", gap:11 }}>
                  <span style={{ fontSize:12, fontWeight:700, letterSpacing:".08em",
                    textTransform:"uppercase", color:C.dim }}>{grp.g}</span>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {grp.items.map(f => {
                      const on = filtres.includes(f.id);
                      return (
                        <button key={f.id} onClick={() => setFiltres(p =>
                          p.includes(f.id) ? p.filter(x => x !== f.id) : [...p, f.id])}
                          className="tap" style={{
                            fontSize:13, fontWeight:600, borderRadius:999,
                            padding:"8px 14px", cursor:"pointer",
                            background: on ? C.accent : C.s2,
                            color: on ?"#FFF" : C.mid,
                            border: on ?"none" :`1px solid rgba(16,19,24,0.06)`,
                          }}>{f.l}</button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {/* footer drawer */}
            <div style={{ padding:"16px 20px", borderTop:`1px solid ${C.bd}`,
              display:"flex", gap:10 }}>
              <button onClick={() => { setFiltres([]); setDrawerOpen(false); }}
                className="tap" style={{ flex:1, padding:14, borderRadius:12,
                  background:C.s2, border:"none", fontSize:14, fontWeight:600,
                  fontFamily:FONT, color:C.mid, cursor:"pointer" }}>
                Effacer
              </button>
              <button onClick={() => setDrawerOpen(false)}
                className="tap" style={{ flex:1, padding:14, borderRadius:12,
                  background:C.accent, border:"none", fontSize:14, fontWeight:600,
                  fontFamily:FONT, color:"#FFF", cursor:"pointer" }}>
                Voir {visible.length} résultat{visible.length > 1 ?"s" :""}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideRight{from{transform:translateX(-102%)}to{transform:translateX(0)}}
      `}</style>
    </div>
  );
}
