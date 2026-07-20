// ─── RepasSheet — Page plein écran d'ajout d'aliment par repas ────────────────
// Ouvert quand l'utilisateur tape un repas (Petit-déj, Déjeuner…).
// Design aligné avec BiblioSheet de Creer.jsx : même overlay, handle, typo, etc.

import { useState, useRef, useCallback, useEffect } from"react";
import { ID } from"../../components/ui/Icon.jsx";
import { C, FONT, SERIF } from"../../data/constants.js";
import { searchProducts, cachedForPrefix } from"../../services/offSearch.js";

const F   = FONT;
const SF  = SERIF;
const BL  = C.accent  || C.accent;
const BLD = C.accentDk|| C.accentDk;
const BG  = C.bg;
const S1  = C.s1;
const S2  = C.s2;
const BD  = C.bd ||"rgba(0,0,0,0.05)";
const TEXT= C.text;
const MID = C.mid;
const DIM = C.dim;
const GRN ="#12B76A";
const RED ="#E5484D";

// Détecte si un aliment est exprimé pour 100 g (sinon : à l'unité/portion)
const per100Test = (f) => /100\s*g/i.test((f && f.n) ||"");

const NUTRI_COLORS = { A:"#12B76A", B:"#12B76A", C:"#F59E0B", D:"#F59E0B", E:"#E5484D" };

// ─── Icônes ──────────────────────────────────────────────────────────────────
function Ico({name,size=18,color="currentColor",stroke=1.6}){
  const p={width:size,height:size,viewBox:"0 0 24 24",fill:"none",stroke:color,strokeWidth:stroke,strokeLinecap:"round",strokeLinejoin:"round"};
  const paths={
    search:<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>,
    scan:<><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/></>,
    camera:<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
    x:<path d="M18 6 6 18M6 6l12 12"/>,
    plus:<path d="M12 5v14M5 12h14"/>,
    chevL:<path d="m15 18-6-6 6-6"/>,
    trash:<><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
    sun:<><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M5 12H3M21 12h-2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></>,
    coffee:<><path d="M6 9h11v6a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V9Z"/><path d="M17 11h2a2 2 0 0 1 0 4h-2"/><path d="M9 3v3M13 3v3"/></>,
    moon:<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>,
    apple:<><path d="M16 4c-1.5 0-3 1-3 2.5"/><path d="M19 14c0 4-2 7-4 7-1.5 0-2-1-3-1s-1.5 1-3 1c-2 0-4-3-4-7s2-7 4-7c1.5 0 2 1 3 1s1.5-1 3-1c2 0 4 3 4 7Z"/></>,
    spark:<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor" stroke="none"/>,
    pencil:<><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></>,
  };
  return <svg {...p}>{paths[name]}</svg>;
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS =`
@keyframes rsFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes rsPop{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}
.rs-fade{animation:rsFadeUp .28s cubic-bezier(.22,1,.36,1) both}
.rs-pop{animation:rsPop .22s cubic-bezier(.34,1.56,.64,1) both}
@keyframes spin{to{transform:rotate(360deg)}}
.rs-scroll::-webkit-scrollbar{width:0}
.rs-scroll{scrollbar-width:none}
`;

// ═════════════════════════════════════════════════════════════════════════════
export default function RepasSheet({
  meal,           // { id, l, icon, accent, accentDk, dark }
  items,          // aliments déjà dans ce repas
  allFoods,       // FOODS + myFoods
  quickFoods,     // FOODS.slice(0,8) pour les raccourcis
  onAdd,          // (aliment) => void
  onRemove,       // (index) => void
  onUpdate,       // (index, aliment) => void — modifier la quantité d'un aliment
  onClose,
  onScan,         // ouvre le BarcodeScanner caméra
  onPhoto,        // ouvre PhotoAnalyse
  premium,
  scanRes,        // résultat scan code-barres
  setScanRes,     // pour le reset
  handleScan,     // (code) => fetch OFF
  push,
}) {
  const [search, setSearch] = useState("");
  const [manualCode, setManualCode] = useState("");

  // ── Recherche produits du commerce (Open Food Facts) ───────────────────────
  // Débouncée à 450 ms pour ne partir en réseau qu'une fois la frappe posée.
  // Les résultats locaux (FOODS + mes aliments) restent instantanés au-dessus.
  const [offResults, setOffResults] = useState([]);
  const [offLoading, setOffLoading] = useState(false);
  useEffect(() => {
    const q = search.trim();
    if (q.length < 3) { setOffResults([]); setOffLoading(false); return; }

    // affichage INSTANTANÉ de ce qu'on connaît déjà (cache du préfixe),
    // le temps que la recherche fraîche arrive
    const instant = cachedForPrefix(q);
    if (instant.length) setOffResults(instant);
    setOffLoading(true);

    const ctrl = new AbortController();
    const t = setTimeout(() => {
      searchProducts(q, ctrl.signal)
        .then(r => { if (!ctrl.signal.aborted) {
          if (r.length || !instant.length) setOffResults(r);
          setOffLoading(false);
        }})
        .catch(() => { if (!ctrl.signal.aborted) setOffLoading(false); });
    }, 150);                             // départ quasi immédiat après la frappe
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [search]);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  // ── Sélecteur de quantité (type Lifesum) ──────────────────────────────────
  const [qtyFood, setQtyFood] = useState(null);   // aliment en attente de quantité
  const [amount,  setAmount]  = useState(100);
  const [editIndex, setEditIndex] = useState(null); // null = ajout, sinon index à modifier
  const per100 = qtyFood ? /100\s*g/i.test(qtyFood.n ||"") : false; // base 100g ?
  const pickFood = (f) => { setEditIndex(null); setQtyFood(f); setAmount(per100Test(f) ? 100 : 1); };
  const editItem = (item, idx) => {
    const base = item.base || item;
    setEditIndex(idx);
    setQtyFood(base);
    setAmount(item.grams ?? item.qty ?? (per100Test(base) ? 100 : 1));
  };
  const closeQty = () => { setQtyFood(null); setEditIndex(null); };
  const confirmQty = () => {
    if (!qtyFood) return;
    const factor = per100 ? amount / 100 : amount;
    const sc = (v) => v == null ? v : Math.round(v * factor * 10) / 10;
    const baseName = (qtyFood.n ||"").replace(/\s*\(100\s*g\)/i,"").trim();
    const scaled = {
      ...qtyFood,
      n:  per100 ?`${baseName} · ${amount}g` :`${baseName}${amount !== 1 ?` · ×${amount}` :""}`,
      c:  Math.round((qtyFood.c || 0) * factor),
      p:  sc(qtyFood.p), g: sc(qtyFood.g), l: sc(qtyFood.l),
      fi: sc(qtyFood.fi), na: sc(qtyFood.na), su: sc(qtyFood.su), sa: sc(qtyFood.sa),
      grams: per100 ? amount : undefined,
      qty:   per100 ? undefined : amount,
      base:  { n: qtyFood.n, c: qtyFood.c, p: qtyFood.p, g: qtyFood.g, l: qtyFood.l,
               fi: qtyFood.fi, na: qtyFood.na, su: qtyFood.su, sa: qtyFood.sa },
    };
    if (editIndex != null && onUpdate) onUpdate(editIndex, scaled);
    else onAdd(scaled);
    setQtyFood(null);
    setEditIndex(null);
    setSearch("");
  };

  // À l'ouverture, on commence toujours en haut de la page (vue d'ensemble)
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    window.scrollTo(0, 0);
  }, []);

  const filtered = search
    ? allFoods.filter(f => f.n.toLowerCase().includes(search.toLowerCase()))
    : [];

  const mealTotal = items.reduce(
    (a, f) => ({ cal: a.cal + f.c, p: a.p + f.p, g: a.g + f.g, l: a.l + f.l }),
    { cal: 0, p: 0, g: 0, l: 0 }
);

  return (
    <div style={{ position:"fixed", inset: 0, background: BG, zIndex: 340,
      display:"flex", flexDirection:"column" }}>
      <style>{CSS}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ padding:"20px 20px 0", flexShrink: 0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          marginBottom: 20 }}>
          <button onClick={onClose} style={{ background:"transparent", border:"none",
            color: BL, cursor:"pointer", fontSize: 13, fontWeight: 700,
            display:"flex", alignItems:"center", gap: 4, fontFamily: F }}>
            <Ico name="chevL" size={15} color={BL} stroke={2.5}/> Retour
          </button>
          <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: 12,
            border:`1px solid ${BD}`, background: S1,
            display:"grid", placeItems:"center",
            color: MID, cursor:"pointer", fontSize: 20 }}>×</button>
        </div>

        {/* Icône + Titre repas */}
        <div style={{ display:"flex", alignItems:"center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16,
            background:`linear-gradient(145deg,${meal.accent},${meal.accentDk})`,
            display:"grid", placeItems:"center",
            boxShadow:`0 6px 16px ${meal.accent}50, inset 0 1px 0 rgba(0,0,0,0.12)`,
            position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset: 0,
              background:"radial-gradient(110% 60% at 30% 10%,rgba(0,0,0,0.12),transparent 60%)",
              pointerEvents:"none" }}/>
            <ID name={meal.icon} size={22}/>
          </div>
          <div>
            <div style={{ fontFamily: SF, fontSize: 26, fontWeight: 700, color: TEXT,
              letterSpacing: -0.5, lineHeight: 1.1 }}>{meal.l}</div>
            {mealTotal.cal > 0 && (
              <div style={{ fontSize: 13, color: MID, fontFamily: F, marginTop: 4 }}>
                <span style={{ color: meal.accent, fontWeight: 700 }}>{mealTotal.cal}</span> kcal ·
                P {mealTotal.p}g · G {mealTotal.g}g · L {mealTotal.l}g
              </div>
)}
          </div>
        </div>

        {/* ── Barre de recherche ───────────────────────────────────────── */}
        <div style={{ position:"relative", marginBottom: 16 }}>
          <div style={{ position:"absolute", left: 14, top:"50%", transform:"translateY(-50%)",
            pointerEvents:"none" }}>
            <Ico name="search" size={16} color={DIM} stroke={2}/>
          </div>
          <input
            ref={inputRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un aliment…"
            style={{ width:"100%", padding:"12px 16px 12px 32px",
              background: S1, border:`1px solid ${BD}`, borderRadius: 16,
              color: TEXT, fontSize: 14, fontFamily: F, outline:"none",
              boxSizing:"border-box", transition:"border-color .18s" }}
            onFocus={e => e.target.style.borderColor ="rgba(60,91,255,0.35)"}
            onBlur={e => e.target.style.borderColor = BD}
          />
        </div>

        {/* ── Actions Scanner + Photo ──────────────────────────────────── */}
        <div style={{ display:"flex", gap: 8, marginBottom: 16 }}>
          <button onClick={onScan} style={{ flex: 1, display:"flex", alignItems:"center",
            justifyContent:"center", gap: 8, padding:"12px 0",
            background:"linear-gradient(145deg,#3C5BFF,#2E48D9)", border:"1px solid rgba(46,72,217,0.5)",
            borderRadius: 12, color:"#FFF", fontSize: 13, fontWeight: 700,
            boxShadow:"0 4px 12px rgba(60,91,255,0.35)",
            fontFamily: F, cursor:"pointer", transition:"all .16s" }}>
            <Ico name="scan" size={16} stroke={2.2} color="#FFF"/> Scanner
          </button>
          <button onClick={onPhoto} style={{ flex: 1, display:"flex", alignItems:"center",
            justifyContent:"center", gap: 8, padding:"12px 0",
            background: premium ?"linear-gradient(145deg,#9DB0FF,#3C5BFF)" :"linear-gradient(145deg,#C9D3FF,#9DB0FF)",
            border: premium ?"1px solid rgba(60,91,255,0.5)" :"1px solid rgba(157,176,255,0.5)",
            borderRadius: 12,
            color:"#FFF",
            boxShadow:"0 4px 12px rgba(60,91,255,0.35)",
            fontSize: 13, fontWeight: 700, fontFamily: F, cursor:"pointer",
            transition:"all .16s" }}>
            {!premium
              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              : <Ico name="camera" size={15} stroke={1.9} color="#FFF"/>
            }
            Photo
          </button>
        </div>
      </div>

      {/* ── Contenu scrollable ─────────────────────────────────────────── */}
      <div ref={scrollRef} style={{ flex: 1, overflowY:"auto", padding:"0 20px 32px" }} className="rs-scroll">

        {/* Aliments déjà ajoutés */}
        {items.length > 0 && (
          <div className="rs-fade" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight:700, letterSpacing:"1.2px",
              textTransform:"uppercase", color: DIM, fontFamily: F,
              marginBottom: 12 }}>
              Ajoutés ({items.length})
            </div>
            {items.map((item, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap: 12,
                padding:"12px 12px", background: S1, border:`1px solid ${BD}`,
                borderRadius: 16, marginBottom: 8 }}>
                <div style={{ width: 4, height: 32, borderRadius: 2,
                  background: meal.accent, flexShrink: 0 }}/>
                <div onClick={() => editItem(item, i)} style={{ flex: 1, minWidth: 0, cursor:"pointer" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: F, display:"flex", alignItems:"center", gap: 8 }}>
                    {item.n}
                    <Ico name="pencil" size={11} stroke={2} color="#98A2B3"/>
                  </div>
                  <div style={{ display:"flex", gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 10, color:"#9DB0FF", fontFamily: F }}>P {item.p}g</span>
                    <span style={{ fontSize: 10, color:"#3C5BFF", fontFamily: F }}>G {item.g}g</span>
                    <span style={{ fontSize: 10, color: GRN, fontFamily: F }}>L {item.l}g</span>
                    <span style={{ fontSize: 10, color:"#98A2B3", fontFamily: F }}>· toucher pour modifier</span>
                  </div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, fontFamily: F,
                  marginRight: 8 }}>{item.c}</span>
                <button onClick={() => onRemove(i)} style={{ width: 32, height: 32,
                  borderRadius: 12, border:"1px solid rgba(229,72,77,0.18)",
                  background:"rgba(229,72,77,0.05)", display:"grid", placeItems:"center",
                  cursor:"pointer", color: RED, flexShrink: 0, fontSize: 14 }}>
                  <Ico name="trash" size={13} stroke={2} color={RED}/>
                </button>
              </div>
))}
          </div>
)}

        {/* Résultats de recherche */}
        {search.trim().length >= 1 && (filtered.length > 0 || offLoading || offResults.length > 0) && (
          <div className="rs-fade">
            {/* UNE seule section : les aliments de base (instantanés) puis les
                produits du commerce, sous le même titre. */}
            <div style={{ fontSize: 10, fontWeight:700, letterSpacing:"1.2px",
              textTransform:"uppercase", color: DIM, fontFamily: F,
              marginBottom: 12, display:"flex", alignItems:"center", gap:8 }}>
              Produits en magasin
              {offLoading && (
                <span style={{ width:10, height:10, borderRadius:"50%",
                  border:`2px solid ${BD}`, borderTopColor:BL,
                  animation:"spin .7s linear infinite", display:"inline-block" }}/>
)}
            </div>
            {filtered.slice(0, 15).map((item, i) => {
              const alreadyAdded = items.some(x => x.n === item.n);
              return (
                <div key={i} onClick={() => { if (!alreadyAdded) { pickFood(item); }}}
                  style={{ display:"flex", alignItems:"center", gap: 12,
                    padding:"12px 16px",
                    background: alreadyAdded
                      ?"linear-gradient(135deg,rgba(18,183,106,0.05),transparent)"
                      : S1,
                    border:`1px solid ${alreadyAdded ?"rgba(18,183,106,0.25)" : BD}`,
                    borderRadius: 16, marginBottom: 8,
                    cursor: alreadyAdded ?"default" :"pointer",
                    transition:"border-color .18s" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, fontFamily: F }}>{item.n}</div>
                    <div style={{ display:"flex", gap: 8, marginTop: 2 }}>
                      <span style={{ fontSize: 10, color: MID }}>{item.c} kcal</span>
                      <span style={{ fontSize: 10, color:"#9DB0FF" }}>P {item.p}g</span>
                      <span style={{ fontSize: 10, color:"#3C5BFF" }}>G {item.g}g</span>
                      <span style={{ fontSize: 10, color: GRN }}>L {item.l}g</span>
                    </div>
                  </div>
                  {alreadyAdded ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: GRN, fontFamily: F }}> Ajouté</span>
) : (
                    <div style={{ width: 34, height: 34, borderRadius: 12,
                      background:`linear-gradient(135deg,${BL},${BLD})`,
                      display:"grid", placeItems:"center", flexShrink: 0,
                      boxShadow:"0 4px 12px rgba(60,91,255,0.25)" }}>
                      <Ico name="plus" size={16} stroke={2.5} color="#FFF"/>
                    </div>
)}
                </div>
);
            })}

            {/* produits du commerce (Open Food Facts), à la suite */}
            {offResults.map((item, i) => {
              const alreadyAdded = items.some(x => x.n === item.n);
              return (
                <div key={item.code || i}
                  onClick={() => { if (!alreadyAdded) pickFood(item); }}
                  style={{ display:"flex", alignItems:"center", gap: 12,
                    padding:"10px 12px",
                    background: alreadyAdded
                      ?"linear-gradient(135deg,rgba(18,183,106,0.05),transparent)"
                      : S1,
                    border:`1px solid ${alreadyAdded ?"rgba(18,183,106,0.25)" : BD}`,
                    borderRadius: 16, marginBottom: 8,
                    cursor: alreadyAdded ?"default" :"pointer" }}>

                  {/* vignette produit */}
                  <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: S2, overflow:"hidden",
                    display:"grid", placeItems:"center" }}>
                    {item.img
                      ? <img src={item.img} alt="" loading="lazy"
                          style={{ width:"100%", height:"100%", objectFit:"cover" }}
                          onError={e => { e.target.style.display ="none"; }}/>
                      : <Ico name="search" size={16} color={DIM} stroke={1.8}/>}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT,
                      fontFamily: F, whiteSpace:"nowrap", overflow:"hidden",
                      textOverflow:"ellipsis" }}>
                      {item.n.replace(/\s*\(100\s*g\)/i,"")}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap: 8, marginTop: 3 }}>
                      {item.nutriscore && (
                        <span style={{ fontSize: 9, fontWeight: 800, color:"#FFF",
                          background: NUTRI_COLORS[item.nutriscore] || DIM,
                          padding:"1px 6px", borderRadius: 4, letterSpacing: .5 }}>
                          {item.nutriscore}
                        </span>
)}
                      <span style={{ fontSize: 10, color: MID }}>{item.c} kcal/100 g</span>
                      <span style={{ fontSize: 10, color:"#9DB0FF" }}>P {item.p}g</span>
                      <span style={{ fontSize: 10, color:"#3C5BFF" }}>G {item.g}g</span>
                      <span style={{ fontSize: 10, color: GRN }}>L {item.l}g</span>
                    </div>
                  </div>

                  {alreadyAdded ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: GRN, fontFamily: F }}></span>
) : (
                    <div style={{ width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                      background:`linear-gradient(135deg,${BL},${BLD})`,
                      display:"grid", placeItems:"center",
                      boxShadow:"0 4px 12px rgba(60,91,255,0.25)" }}>
                      <Ico name="plus" size={14} stroke={2.5} color="#FFF"/>
                    </div>
)}
                </div>
);
            })}
          </div>
)}

        {search && filtered.length === 0 && !offLoading && offResults.length === 0 && (
          <div style={{ textAlign:"center", padding:"32px 12px", color: MID,
            fontSize: 13, fontFamily: F }}>
            Aucun aliment trouvé pour « {search} »
          </div>
)}

        {/* Raccourcis rapides (sans recherche active) */}
        {!search && (
          <>
            <div style={{ fontSize: 10, fontWeight:700, letterSpacing:"1.2px",
              textTransform:"uppercase", color: DIM, fontFamily: F,
              marginBottom: 12 }}>
              Raccourcis
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap: 8, marginBottom: 20 }}>
              {quickFoods.map((f, i) => (
                <button key={i} onClick={() => pickFood(f)}
                  className="rs-pop"
                  style={{ padding:"8px 12px", background: S1,
                    border:`1px solid ${BD}`, borderRadius: 999,
                    cursor:"pointer", fontSize: 11, color: MID,
                    fontFamily: F, fontWeight: 600, transition:"all .16s",
                    display:"inline-flex", alignItems:"center", gap: 4 }}>
                  {f.n.split("(")[0].trim()}
                  <span style={{ color: meal.accent, fontWeight: 700 }}>{f.c}</span>
                </button>
))}
            </div>

            {/* Scanner code-barres inline */}
            <div style={{ fontSize: 10, fontWeight:700, letterSpacing:"1.2px",
              textTransform:"uppercase", color: DIM, fontFamily: F,
              marginBottom: 12 }}>
              Code-barres
            </div>
            <div style={{ display:"flex", gap: 8, marginBottom: 16 }}>
              <input
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                onKeyDown={e => { if (e.key ==="Enter" && manualCode.length >= 8) handleScan(manualCode); }}
                placeholder="EAN (ex: 3017620422003)"
                inputMode="numeric"
                style={{ flex: 1, padding:"12px 16px",
                  background: S1, border:`1px solid ${BD}`, borderRadius: 12,
                  color: TEXT, fontSize: 13, fontFamily: F, outline:"none",
                  boxSizing:"border-box" }}
              />
              <button
                onClick={() => { if (manualCode.length >= 8) handleScan(manualCode); }}
                style={{ padding:"12px 20px",
                  background: manualCode.length >= 8 ?`linear-gradient(135deg,${BL},${BLD})` : S2,
                  border:"none", borderRadius: 12,
                  color: manualCode.length >= 8 ?"#FFF" : DIM,
                  fontSize: 13, fontWeight: 700, fontFamily: F, cursor:"pointer",
                  transition:"all .2s",
                  boxShadow: manualCode.length >= 8 ?"0 4px 14px rgba(60,91,255,0.25)" :"none" }}>
                OK
              </button>
            </div>

            {/* Résultat scan */}
            {scanRes && !scanRes.error && (
              <div className="rs-fade" style={{ padding: 16, background:"rgba(18,183,106,0.05)",
                border:"1px solid rgba(18,183,106,0.25)", borderRadius: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: GRN,
                  marginBottom: 12, fontFamily: F }}>{scanRes.n}</div>
                <div style={{ display:"flex", gap: 4, flexWrap:"wrap", marginBottom: 12 }}>
                  {[
                    { l:`${scanRes.c} kcal`, c:"#F59E0B" },
                    { l:`P ${scanRes.p}g`, c:"#9DB0FF" },
                    { l:`G ${scanRes.g}g`, c:"#3C5BFF" },
                    { l:`L ${scanRes.l}g`, c: GRN },
                  ].map(s => (
                    <div key={s.l} style={{ padding:"4px 12px", background:`${s.c}20`,
                      border:`1px solid ${s.c}40`, borderRadius: 999,
                      fontSize: 11, color: s.c, fontWeight: 700, fontFamily: F }}>{s.l}</div>
))}
                </div>
                <button onClick={() => {
                  onAdd(scanRes);
                  push("","Ajouté !",`${scanRes.n} ajouté au ${meal.l.toLowerCase()}.`);
                  setScanRes(null);
                  setManualCode("");
                }} style={{ width:"100%", padding:"12px",
                  background:`linear-gradient(135deg,${BL},${BLD})`,
                  border:"none", borderRadius: 12,
                  color:"#FFF", fontSize: 14, fontWeight: 700, fontFamily: F,
                  cursor:"pointer",
                  boxShadow:"0 6px 18px rgba(60,91,255,0.25)",
                  display:"flex", alignItems:"center", justifyContent:"center", gap: 8 }}>
                  <Ico name="plus" size={15} stroke={2.5} color="#FFF"/>
                  Ajouter au {meal.l.toLowerCase()}
                </button>
              </div>
)}
            {scanRes?.error && (
              <div style={{ padding:"12px 12px", background:"rgba(229,72,77,0.08)",
                border:"1px solid rgba(229,72,77,0.25)", borderRadius: 12,
                fontSize: 13, color: RED, fontFamily: F, marginBottom: 16 }}>
                Produit non trouvé. Essaie la recherche ou ajoute-le manuellement.
              </div>
)}
          </>
)}
      </div>

      {/* ── Sélecteur de quantité (type Lifesum) ──────────────────────────── */}
      {qtyFood && (() => {
        const factor = per100 ? amount / 100 : amount;
        const kcal = Math.round((qtyFood.c || 0) * factor);
        const P = Math.round((qtyFood.p || 0) * factor);
        const G = Math.round((qtyFood.g || 0) * factor);
        const L = Math.round((qtyFood.l || 0) * factor);
        const step = per100 ? 10 : 0.5;
        const presets = per100 ? [50, 100, 150, 200] : [0.5, 1, 1.5, 2];
        const baseName = (qtyFood.n ||"").replace(/\s*\(100\s*g\)/i,"").trim();
        return (
          <div onClick={closeQty} style={{ position:"fixed", inset: 0, zIndex: 360,
            background:"rgba(16,19,24,0.45)", backdropFilter:"blur(3px)",
            display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
            <div onClick={e => e.stopPropagation()} className="rs-pop" style={{
              width:"100%", maxWidth: 420, background: BG, borderRadius: 28,
              padding:"24px 20px 20px",
              boxShadow: C.shadow }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: TEXT, fontFamily: SF, marginBottom: 4 }}>
                {editIndex != null ?"Modifier ·" :""}{baseName}
              </div>
              <div style={{ fontSize: 13, color: DIM, fontFamily: F, marginBottom: 20 }}>
                {per100 ?"Choisis la quantité en grammes" :"Choisis le nombre de portions"}
              </div>

              {/* Stepper */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap: 20, marginBottom: 16 }}>
                <button onClick={() => setAmount(a => Math.max(step, Math.round((a - step) * 10) / 10))}
                  style={{ width: 48, height: 48, borderRadius: 16, cursor:"pointer",
                    background: S2, border:`1px solid ${BD}`, color: TEXT, fontSize: 26, fontWeight: 700,
                    display:"grid", placeItems:"center", lineHeight: 1 }}>−</button>
                <div style={{ minWidth: 110, textAlign:"center" }}>
                  <span style={{ fontFamily: SF, fontSize: 34, fontWeight: 700, color: BL }}>{amount}</span>
                  <span style={{ fontSize: 14, color: MID, marginLeft: 4, fontWeight: 600 }}>{per100 ?"g" :"×"}</span>
                </div>
                <button onClick={() => setAmount(a => Math.round((a + step) * 10) / 10)}
                  style={{ width: 48, height: 48, borderRadius: 16, cursor:"pointer",
                    background:"linear-gradient(145deg,#3C5BFF,#2E48D9)", border:"1px solid rgba(46,72,217,0.5)",
                    color:"#FFF", fontSize: 26, fontWeight: 700, boxShadow:"0 4px 12px rgba(60,91,255,0.35)",
                    display:"grid", placeItems:"center", lineHeight: 1 }}>+</button>
              </div>

              {/* Presets */}
              <div style={{ display:"flex", gap: 8, marginBottom: 20 }}>
                {presets.map(p => {
                  const on = amount === p;
                  return (
                    <button key={p} onClick={() => setAmount(p)}
                      style={{ flex: 1, padding:"8px 0", borderRadius: 12, cursor:"pointer",
                        background: on ?"rgba(60,91,255,0.12)" : S1,
                        border:`1px solid ${on ?"rgba(60,91,255,0.35)" : BD}`,
                        color: on ? C.accentDk : MID, fontSize: 13, fontWeight: 700, fontFamily: F }}>
                      {per100 ?`${p}g` :`×${p}`}
                    </button>
);
                })}
              </div>

              {/* Aperçu macros live */}
              <div style={{ display:"flex", gap: 8, marginBottom: 20 }}>
                {[{ l:"kcal", v: kcal, c:"#F59E0B" }, { l:"P", v: P +"g", c:"#9DB0FF" },
                  { l:"G", v: G +"g", c:"#3C5BFF" }, { l:"L", v: L +"g", c:"#12B76A" }].map(s => (
                  <div key={s.l} style={{ flex: 1, textAlign:"center", padding:"12px 0", borderRadius: 12,
                    background:`${s.c}12`, border:`1px solid ${s.c}30` }}>
                    <div style={{ fontSize: 16, fontWeight:700, color: s.c, fontFamily: F }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: DIM, fontWeight: 700, letterSpacing:"0.5px", marginTop: 1 }}>{s.l}</div>
                  </div>
))}
              </div>

              <button onClick={confirmQty} style={{ width:"100%", padding:"16px", borderRadius: 16,
                background:"linear-gradient(145deg,#3C5BFF,#2E48D9)", border:"none", color:"#FFF",
                fontSize: 14, fontWeight: 700, fontFamily: F, cursor:"pointer",
                boxShadow:"0 8px 22px -8px rgba(60,91,255,0.85)" }}>
                {editIndex != null ?"Modifier" :"Ajouter"} · {kcal} kcal
              </button>
            </div>
          </div>
);
      })()}
    </div>
);
}
