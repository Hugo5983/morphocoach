import { useState } from"react";
import useScrollTop from"../../hooks/useScrollTop.js";
import { RECIPES, REPAS, FILTRE_GROUPES, FILTRES, prixEuros } from"../../data/recipes.js";
import RecipeDetail from"./RecipeDetail.jsx";
import ListeDeCourses from"./ListeDeCourses.jsx";
import { useRecipePhoto } from"./useRecipePhoto.js";
import { C, FONT, NUM } from"../../data/constants.js";
import { I } from"../../components/ui/Icon.jsx";

// ─── Carte recette ────────────────────────────────────────────────────────────
function RecipeCard({ r, liked, onLike, onOpen, fluid, locked }) {
  const { src:photo } = useRecipePhoto(r.id, r.img,"card");
  const prix = prixEuros(r);
  return (
    <div onClick={() => onOpen(r)} className="tap" style={{
      ...(fluid ? { width:"100%" } : { flex:"none", width:184 }),
      background:"#FFFFFF",
      border:`1px solid rgba(16,19,24,0.075)`, borderRadius:18,
      overflow:"hidden", cursor:"pointer",
      display:"flex", flexDirection:"column",
      boxShadow:"0 2px 10px rgba(16,19,24,0.045)",
      contain:"layout paint", position:"relative",
    }}>
      {locked && (
        <div style={{ position:"absolute", inset:0, zIndex:5,
          background:"rgba(246,247,249,0.58)", backdropFilter:"blur(1.5px)",
          display:"flex", alignItems:"center", justifyContent:"center",
          borderRadius:18 }}>
          <div style={{ width:38, height:38, borderRadius:12,
            background:"rgba(255,255,255,0.92)", border:"1px solid rgba(16,19,24,0.08)",
            boxShadow:"0 4px 14px rgba(16,19,24,0.10)", display:"grid", placeItems:"center" }}>
            <I name="lock" size={18} color={C.dim}/>
          </div>
        </div>
      )}

      <div style={{ position:"relative", width:"100%", aspectRatio:"1.42 / 1",
        background:C.s2, flexShrink:0,
        ...(locked ? { filter:"grayscale(0.55) opacity(0.72)" } : {}) }}>
        <img src={photo} alt={r.nom} loading="lazy" decoding="async"
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          onError={e => { if (e.target.src !== r.img) e.target.src = r.img;
                          else e.target.style.display="none"; }}/>
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to top,rgba(16,19,24,0.48) 0%,rgba(16,19,24,0.03) 58%,transparent 100%)" }}/>

        {prix && (
          <div style={{ position:"absolute", left:10, bottom:10,
            padding:"6px 10px", borderRadius:10,
            background:"rgba(16,19,24,0.72)", backdropFilter:"blur(8px)",
            color:"#FFF", fontSize:11.5, fontWeight:700, fontFamily:FONT,
            ...NUM, whiteSpace:"nowrap", letterSpacing:0.1 }}>{prix}</div>
        )}

        {!locked && (
          <button onClick={e => { e.stopPropagation(); onLike(r.id); }}
            aria-label={liked ?"Retirer des favoris" :"Ajouter aux favoris"}
            style={{ position:"absolute", top:10, right:10,
              width:36, height:36, borderRadius:"50%",
              background:"rgba(255,255,255,0.94)",
              border:"1px solid rgba(255,255,255,0.72)",
              boxShadow:liked ?"0 4px 12px rgba(229,72,77,0.24)" :"0 3px 10px rgba(16,19,24,0.12)",
              display:"grid", placeItems:"center", cursor:"pointer", transition:"all .2s ease" }}>
            <I name="heart" size={18} color={liked ?"#E5484D" :"#E5484D"} fill={liked}/>
          </button>
        )}
      </div>

      <div style={{ padding:"12px 13px 13px", minHeight:76,
        display:"flex", flexDirection:"column", gap:8 }}>
        <span style={{ fontSize:15, fontWeight:650, color:C.text, fontFamily:FONT,
          lineHeight:1.24, display:"-webkit-box", WebkitLineClamp:2,
          WebkitBoxOrient:"vertical", overflow:"hidden", letterSpacing:"-.015em" }}>{r.nom}</span>

        <div style={{ marginTop:"auto", display:"flex", alignItems:"center", gap:10,
          color:C.dim, fontFamily:FONT, fontSize:12.5, fontWeight:600 }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
            <I name="flame" size={15} color="#F59E0B" />
            <span {...NUM}>{r.kcal} kcal</span>
          </span>
          {r.temps != null && <span style={{ width:1, height:15, background:"rgba(16,19,24,0.14)" }}/>} 
          {r.temps != null && (
            <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
              <I name="clock" size={15} color="#667085" />
              <span {...NUM}>{r.temps} min</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Hero éditorial ──────────────────────────────────────────────────────────
function HeroCard({ r, onOpen, index = 0 }) {
  const { src:photo } = useRecipePhoto(r.id, r.img,"card");
  const badge = index === 0 ? "Nouveau" : "À découvrir";
  const tag = index === 0 ? "Incontournable" : null;
  return (
    <div onClick={() => onOpen(r)} className="tap" style={{
      flex:"none", width:326, position:"relative", borderRadius:22,
      overflow:"hidden", aspectRatio:"1.68 / 1", background:C.s3,
      border:"1px solid rgba(16,19,24,0.08)", cursor:"pointer",
      boxShadow:"0 5px 18px rgba(16,19,24,0.08)" }}>
      <img src={photo} alt={r.nom} loading="lazy" decoding="async"
        style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
        onError={e => { if (e.target.src !== r.img) e.target.src = r.img;
                        else e.target.style.display="none"; }}/>
      <div style={{ position:"absolute", inset:0,
        background:"linear-gradient(to bottom,rgba(16,19,24,0.06) 0%,rgba(16,19,24,0.02) 36%,rgba(16,19,24,0.78) 100%)",
        pointerEvents:"none" }}/>

      <div style={{ position:"absolute", top:12, left:12,
        display:"flex", gap:7, alignItems:"center" }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:6,
          padding:"6px 10px", borderRadius:999,
          background:"rgba(255,255,255,0.92)", color:C.accent,
          fontSize:11, fontWeight:700, fontFamily:FONT,
          boxShadow:"0 3px 10px rgba(16,19,24,0.08)" }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:C.accent }}/>{badge}
        </span>
      </div>

      <div style={{ position:"absolute", left:18, right:18, bottom:16 }}>
        {tag && (
          <span style={{ display:"inline-flex", alignItems:"center", gap:5,
            padding:"5px 9px", borderRadius:8, marginBottom:8,
            background:C.accent, color:"#FFF", fontSize:10.5, fontWeight:700,
            fontFamily:FONT, boxShadow:"0 3px 10px rgba(60,91,255,0.24)" }}>
            <I name="star" size={11} color="#FFF" fill /> {tag}
          </span>
        )}
        <div style={{ fontSize:24, fontWeight:750, lineHeight:1.12,
          letterSpacing:"-.025em", color:"#FFFFFF", fontFamily:FONT,
          textShadow:"0 2px 8px rgba(0,0,0,0.18)" }}>{r.nom}</div>
        <div style={{ display:"flex", alignItems:"center", gap:10,
          marginTop:10, color:"rgba(255,255,255,0.94)", fontFamily:FONT,
          fontSize:12.5, fontWeight:600 }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
            <I name="flame" size={16} color="#F59E0B"/> {r.kcal} kcal
          </span>
          <span style={{ width:1, height:15, background:"rgba(255,255,255,0.38)" }}/>
          <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
            <I name="clock" size={16} color="#FFFFFF"/> {r.temps ?? "—"} min
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Rail section ────────────────────────────────────────────────────────────
function SectionRail({ label, recettes, liked, onLike, onOpen, onVoirTout, premium }) {
  if (!recettes.length) return null;
  return (
    <section style={{ marginTop:30 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 20px" }}>
        <span style={{ fontSize:14, fontWeight:750, letterSpacing:".13em",
          textTransform:"uppercase", color:"#344054", fontFamily:FONT }}>{label}</span>
        {onVoirTout && (
          <button onClick={onVoirTout} className="tap" style={{ background:"none", border:"none",
            fontSize:14.5, fontWeight:650, color:C.accent, fontFamily:FONT,
            cursor:"pointer", padding:0 }}>Voir tout</button>
        )}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,minmax(0,1fr))",
        gap:12, padding:"14px 20px 0" }}>
        {recettes.map(r => (
          <RecipeCard key={r.id} r={r} liked={!!liked[r.id]}
            onLike={onLike} onOpen={onOpen} fluid
            locked={!premium && !r.free}/>
        ))}
      </div>
    </section>
  );
}

// ─── RECIPES PAGE ─────────────────────────────────────────────────────────────
export default function Recipes(props) {
  const push       = props?.push;
  const premium    = props?.premium || false;
  const setPaywall = props?.setPaywall;
  const repas      = props?.repas;
  const setRepas   = props?.setRepas;
  const subView    = props?.subView;

  const [search,    setSearch]    = useState("");
  const [filtres,   setFiltres]   = useState([]);
  const [drawerOpen,setDrawerOpen]= useState(false);
  const [liked,     setLiked]     = useState({});
  const [selected,  setSelected]  = useState(null);
  const showFavs  = subView ==="favorites";
  const showListe = subView ==="liste";
  const [voirTout,  setVoirTout]  = useState(null);   // id de la section dépliée
  useScrollTop(voirTout);

  const toggleLike = (id) => setLiked(p => ({ ...p, [id]: !p[id] }));
  const openRecipe = (r) => {
    if (!r.free && !premium) { if (setPaywall) setPaywall(true); return; }
    setSelected(r);
  };

  // ── Vue détail ──
  if (selected) return (
    <RecipeDetail recipe={selected} onBack={() => setSelected(null)}
      liked={!!liked[selected.id]} onLike={toggleLike}
      push={push} repas={repas} setRepas={setRepas}/>
  );

  // ── Liste de courses (remplace l'ancien onglet Premium) ──
  if (showListe) return <ListeDeCourses premium={premium} push={push}/>;

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
  const showHome = !search && filtres.length === 0 && !showFavs && !showListe && !voirTout;

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
              onLike={toggleLike} onOpen={openRecipe} fluid
              locked={!premium && !r.free}/>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="anim" style={{ padding:"0 0 32px", background:"#F6F7F9" }}>

      {/* ── Recherche ── */}
      <div style={{
        position:"sticky", top:0, zIndex:10,
        background:"rgba(246,247,249,0.92)", backdropFilter:"blur(14px)",
        WebkitBackdropFilter:"blur(14px)",
        borderBottom:"1px solid rgba(16,19,24,0.045)",
        padding:"16px 20px 14px",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ flex:1, height:48, display:"flex", alignItems:"center", gap:11,
            background:"#FFFFFF", border:"1px solid rgba(16,19,24,0.075)",
            borderRadius:999, padding:"0 17px",
            boxShadow:"0 2px 8px rgba(16,19,24,0.025)" }}>
            <I name="search" size={19} color="#98A2B3"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une recette, un ingrédient..."
              style={{ background:"none", border:"none", outline:"none",
                color:C.text, fontSize:15, fontWeight:500, fontFamily:FONT,
                width:"100%" }}/>
            {search && (
              <button onClick={() => setSearch("")} aria-label="Effacer la recherche"
                style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}>
                <I name="close" size={16} color={C.dim}/>
              </button>
            )}
          </div>
          <button onClick={() => setDrawerOpen(true)} className="tap"
            aria-label="Ouvrir les filtres"
            style={{ width:48, height:48, flex:"none", display:"grid", placeItems:"center",
              background:"#FFFFFF", border:"1px solid rgba(16,19,24,0.075)",
              borderRadius:16, cursor:"pointer",
              boxShadow:"0 2px 8px rgba(16,19,24,0.025)", position:"relative" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke={filtres.length ? C.accent : "#667085"}
              strokeWidth="2.1" strokeLinecap="round">
              <path d="M4 6h16M7 12h10M10 18h4"/>
            </svg>
            {filtres.length > 0 && (
              <div style={{ position:"absolute", top:3, right:3,
                width:16, height:16, borderRadius:8, background:C.accent,
                color:"#FFF", fontSize:9, fontWeight:700, display:"grid", placeItems:"center" }}>
                {filtres.length}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* ── Hero éditorial ── */}
      {showHome && heroRecipes.length > 0 && (
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"20px 20px 0" }}>
            <span style={{ fontSize:14, fontWeight:750, letterSpacing:".13em",
              textTransform:"uppercase", color:"#344054", fontFamily:FONT }}>
              Tout nouveau, tout chaud
            </span>
          </div>
          <div style={{ display:"flex", gap:14, overflowX:"auto",
            padding:"14px 20px 0", scrollbarWidth:"none",
            WebkitOverflowScrolling:"touch" }}>
            {heroRecipes.map((r, i) => (
              <HeroCard key={r.id} r={r} index={i} onOpen={openRecipe}/>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center",
            gap:7, paddingTop:12 }}>
            {heroRecipes.map((r, i) => (
              <span key={r.id} style={{ width:i === 0 ? 16 : 7, height:7,
                borderRadius:999, background:i === 0 ? C.accent : "#D9DEE8",
                transition:"all .2s ease" }}/>
            ))}
          </div>
        </div>
      )}

      {/* ── Sections par repas ── */}
      {sections.length === 0 ? (
        <div style={{ textAlign:"center", padding:"54px 20px",
          color:C.dim, fontSize:14, fontFamily:FONT, lineHeight:1.6 }}>
          {showFavs
            ?"Aucune recette en favori pour l'instant. Touche le cœur d'une recette pour l'ajouter."
            :"Aucune recette trouvée"}
        </div>
      ) : (
        sections.map(sec => (
          <SectionRail key={sec.id} label={sec.label}
            recettes={showHome ? sec.recettes.slice(0, 2) : sec.recettes}
            liked={liked} onLike={toggleLike} onOpen={openRecipe}
            premium={premium}
            onVoirTout={sec.recettes.length > 2
              ? () => { setVoirTout(sec.id); window.scrollTo(0,0); }
              : null}/>
        ))
      )}

      {/* ── CTA Premium ── */}
      {!premium && (
        <div style={{ margin:"36px 20px 0", display:"flex", flexDirection:"column",
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
