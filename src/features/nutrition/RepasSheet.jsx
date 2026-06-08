// ─── RepasSheet — Page plein écran d'ajout d'aliment par repas ────────────────
// Ouvert quand l'utilisateur tape un repas (Petit-déj, Déjeuner…).
// Design aligné avec BiblioSheet de Creer.jsx : même overlay, handle, typo, etc.

import { useState, useRef, useCallback } from "react";
import { C, FONT, SERIF } from "../../data/constants.js";

const F   = FONT;
const SF  = SERIF;
const BL  = C.accent  || "#3B82F6";
const BLD = C.accentDk|| "#2563EB";
const BG  = "#080E1A";
const S1  = C.s1 || "#111827";
const S2  = C.s2 || "#1A2336";
const BD  = C.bd || "rgba(255,255,255,0.07)";
const TEXT= C.text|| "#F2F4F7";
const MID = C.mid || "rgba(242,244,247,0.60)";
const DIM = C.dim || "rgba(242,244,247,0.35)";
const GRN = "#34D399";
const RED = "#F87171";

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
  };
  return <svg {...p}>{paths[name]}</svg>;
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@keyframes rsFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes rsPop{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}
.rs-fade{animation:rsFadeUp .28s cubic-bezier(.22,1,.36,1) both}
.rs-pop{animation:rsPop .22s cubic-bezier(.34,1.56,.64,1) both}
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
  const inputRef = useRef(null);

  const filtered = search
    ? allFoods.filter(f => f.n.toLowerCase().includes(search.toLowerCase()))
    : [];

  const mealTotal = items.reduce(
    (a, f) => ({ cal: a.cal + f.c, p: a.p + f.p, g: a.g + f.g, l: a.l + f.l }),
    { cal: 0, p: 0, g: 0, l: 0 }
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: BG, zIndex: 10002,
      display: "flex", flexDirection: "column" }}>
      <style>{CSS}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 18 }}>
          <button onClick={onClose} style={{ background: "transparent", border: "none",
            color: BL, cursor: "pointer", fontSize: 13, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 4, fontFamily: F }}>
            <Ico name="chevL" size={15} color={BL} stroke={2.5}/> Retour
          </button>
          <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 12,
            border: `1px solid ${BD}`, background: S1,
            display: "grid", placeItems: "center",
            color: MID, cursor: "pointer", fontSize: 20 }}>×</button>
        </div>

        {/* Icône + Titre repas */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14,
            background: `linear-gradient(145deg,${meal.accent},${meal.accentDk})`,
            display: "grid", placeItems: "center",
            boxShadow: `0 6px 16px ${meal.accent}50, inset 0 1px 0 rgba(255,255,255,0.30)`,
            position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0,
              background: "radial-gradient(110% 60% at 30% 10%,rgba(255,255,255,0.35),transparent 60%)",
              pointerEvents: "none" }}/>
            <Ico name={meal.icon} size={22} stroke={2} color={meal.dark}/>
          </div>
          <div>
            <div style={{ fontFamily: SF, fontSize: 24, fontWeight: 700, color: TEXT,
              letterSpacing: -0.5, lineHeight: 1.1 }}>{meal.l}</div>
            {mealTotal.cal > 0 && (
              <div style={{ fontSize: 12, color: MID, fontFamily: F, marginTop: 3 }}>
                <span style={{ color: meal.accent, fontWeight: 700 }}>{mealTotal.cal}</span> kcal ·
                P {mealTotal.p}g · G {mealTotal.g}g · L {mealTotal.l}g
              </div>
            )}
          </div>
        </div>

        {/* ── Barre de recherche ───────────────────────────────────────── */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            pointerEvents: "none" }}>
            <Ico name="search" size={16} color={DIM} stroke={2}/>
          </div>
          <input
            ref={inputRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un aliment…"
            style={{ width: "100%", padding: "13px 16px 13px 42px",
              background: S1, border: `1px solid ${BD}`, borderRadius: 14,
              color: TEXT, fontSize: 14, fontFamily: F, outline: "none",
              boxSizing: "border-box", transition: "border-color .18s" }}
            onFocus={e => e.target.style.borderColor = "rgba(59,130,246,0.35)"}
            onBlur={e => e.target.style.borderColor = BD}
          />
        </div>

        {/* ── Actions Scanner + Photo ──────────────────────────────────── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button onClick={onScan} style={{ flex: 1, display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8, padding: "12px 0",
            background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.25)",
            borderRadius: 13, color: "#93C5FD", fontSize: 13, fontWeight: 700,
            fontFamily: F, cursor: "pointer", transition: "all .16s" }}>
            <Ico name="scan" size={16} stroke={2} color="#93C5FD"/> Scanner
          </button>
          <button onClick={onPhoto} style={{ flex: 1, display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8, padding: "12px 0",
            background: premium ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.04)",
            border: premium ? "1px solid rgba(99,102,241,0.30)" : `1px solid ${BD}`,
            borderRadius: 13,
            color: premium ? "#A5B4FC" : DIM,
            fontSize: 13, fontWeight: 700, fontFamily: F, cursor: "pointer",
            transition: "all .16s" }}>
            {!premium
              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              : <Ico name="camera" size={15} stroke={1.8} color="#A5B4FC"/>
            }
            Photo
          </button>
        </div>
      </div>

      {/* ── Contenu scrollable ─────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 32px" }} className="rs-scroll">

        {/* Aliments déjà ajoutés */}
        {items.length > 0 && (
          <div className="rs-fade" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.2px",
              textTransform: "uppercase", color: DIM, fontFamily: F,
              marginBottom: 10 }}>
              Ajoutés ({items.length})
            </div>
            {items.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10,
                padding: "11px 13px", background: S1, border: `1px solid ${BD}`,
                borderRadius: 14, marginBottom: 6 }}>
                <div style={{ width: 4, height: 32, borderRadius: 2,
                  background: meal.accent, flexShrink: 0 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: F }}>{item.n}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: "#60A5FA", fontFamily: F }}>P {item.p}g</span>
                    <span style={{ fontSize: 10, color: "#22D3EE", fontFamily: F }}>G {item.g}g</span>
                    <span style={{ fontSize: 10, color: GRN, fontFamily: F }}>L {item.l}g</span>
                  </div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, fontFamily: F,
                  marginRight: 6 }}>{item.c}</span>
                <button onClick={() => onRemove(i)} style={{ width: 32, height: 32,
                  borderRadius: 10, border: "1px solid rgba(248,113,113,.20)",
                  background: "rgba(248,113,113,.06)", display: "grid", placeItems: "center",
                  cursor: "pointer", color: RED, flexShrink: 0, fontSize: 14 }}>
                  <Ico name="trash" size={13} stroke={2} color={RED}/>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Résultats de recherche */}
        {search && filtered.length > 0 && (
          <div className="rs-fade">
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.2px",
              textTransform: "uppercase", color: DIM, fontFamily: F,
              marginBottom: 10 }}>
              Résultats · {filtered.length}
            </div>
            {filtered.slice(0, 15).map((item, i) => {
              const alreadyAdded = items.some(x => x.n === item.n);
              return (
                <div key={i} onClick={() => { if (!alreadyAdded) { onAdd(item); setSearch(""); }}}
                  style={{ display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 14px",
                    background: alreadyAdded
                      ? "linear-gradient(135deg,rgba(52,211,153,.06),transparent)"
                      : S1,
                    border: `1px solid ${alreadyAdded ? "rgba(52,211,153,.25)" : BD}`,
                    borderRadius: 14, marginBottom: 6,
                    cursor: alreadyAdded ? "default" : "pointer",
                    transition: "border-color .18s" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: TEXT, fontFamily: F }}>{item.n}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 10, color: MID }}>{item.c} kcal</span>
                      <span style={{ fontSize: 10, color: "#60A5FA" }}>P {item.p}g</span>
                      <span style={{ fontSize: 10, color: "#22D3EE" }}>G {item.g}g</span>
                      <span style={{ fontSize: 10, color: GRN }}>L {item.l}g</span>
                    </div>
                  </div>
                  {alreadyAdded ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: GRN, fontFamily: F }}>✓ Ajouté</span>
                  ) : (
                    <div style={{ width: 34, height: 34, borderRadius: 11,
                      background: `linear-gradient(135deg,${BL},${BLD})`,
                      display: "grid", placeItems: "center", flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(59,130,246,0.30)" }}>
                      <Ico name="plus" size={16} stroke={2.5} color="#fff"/>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {search && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "28px 10px", color: MID,
            fontSize: 13, fontFamily: F }}>
            Aucun aliment trouvé pour « {search} »
          </div>
        )}

        {/* Raccourcis rapides (sans recherche active) */}
        {!search && (
          <>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.2px",
              textTransform: "uppercase", color: DIM, fontFamily: F,
              marginBottom: 10 }}>
              Raccourcis
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
              {quickFoods.map((f, i) => (
                <button key={i} onClick={() => onAdd(f)}
                  className="rs-pop"
                  style={{ padding: "8px 13px", background: S1,
                    border: `1px solid ${BD}`, borderRadius: 999,
                    cursor: "pointer", fontSize: 11.5, color: MID,
                    fontFamily: F, fontWeight: 600, transition: "all .16s",
                    display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {f.n.split("(")[0].trim()}
                  <span style={{ color: meal.accent, fontWeight: 700 }}>{f.c}</span>
                </button>
              ))}
            </div>

            {/* Scanner code-barres inline */}
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.2px",
              textTransform: "uppercase", color: DIM, fontFamily: F,
              marginBottom: 10 }}>
              Code-barres
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && manualCode.length >= 8) handleScan(manualCode); }}
                placeholder="EAN (ex: 3017620422003)"
                inputMode="numeric"
                style={{ flex: 1, padding: "11px 14px",
                  background: S1, border: `1px solid ${BD}`, borderRadius: 12,
                  color: TEXT, fontSize: 13, fontFamily: F, outline: "none",
                  boxSizing: "border-box" }}
              />
              <button
                onClick={() => { if (manualCode.length >= 8) handleScan(manualCode); }}
                style={{ padding: "11px 18px",
                  background: manualCode.length >= 8 ? `linear-gradient(135deg,${BL},${BLD})` : S2,
                  border: "none", borderRadius: 12,
                  color: manualCode.length >= 8 ? "#fff" : DIM,
                  fontSize: 13, fontWeight: 700, fontFamily: F, cursor: "pointer",
                  transition: "all .2s",
                  boxShadow: manualCode.length >= 8 ? "0 4px 14px rgba(59,130,246,0.30)" : "none" }}>
                OK
              </button>
            </div>

            {/* Résultat scan */}
            {scanRes && !scanRes.error && (
              <div className="rs-fade" style={{ padding: 16, background: "rgba(52,211,153,0.06)",
                border: "1px solid rgba(52,211,153,0.22)", borderRadius: 16, marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: GRN,
                  marginBottom: 10, fontFamily: F }}>{scanRes.n}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
                  {[
                    { l: `${scanRes.c} kcal`, c: "#F59E0B" },
                    { l: `P ${scanRes.p}g`, c: "#60A5FA" },
                    { l: `G ${scanRes.g}g`, c: "#22D3EE" },
                    { l: `L ${scanRes.l}g`, c: GRN },
                  ].map(s => (
                    <div key={s.l} style={{ padding: "4px 10px", background: `${s.c}20`,
                      border: `1px solid ${s.c}40`, borderRadius: 999,
                      fontSize: 11, color: s.c, fontWeight: 700, fontFamily: F }}>{s.l}</div>
                  ))}
                </div>
                <button onClick={() => {
                  onAdd(scanRes);
                  push("✅", "Ajouté !", `${scanRes.n} ajouté au ${meal.l.toLowerCase()}.`);
                  setScanRes(null);
                  setManualCode("");
                }} style={{ width: "100%", padding: "13px",
                  background: `linear-gradient(135deg,${BL},${BLD})`,
                  border: "none", borderRadius: 13,
                  color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: F,
                  cursor: "pointer",
                  boxShadow: "0 6px 18px rgba(59,130,246,0.30)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Ico name="plus" size={15} stroke={2.5} color="#fff"/>
                  Ajouter au {meal.l.toLowerCase()}
                </button>
              </div>
            )}
            {scanRes?.error && (
              <div style={{ padding: "10px 12px", background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.22)", borderRadius: 12,
                fontSize: 12, color: RED, fontFamily: F, marginBottom: 14 }}>
                Produit non trouvé. Essaie la recherche ou ajoute-le manuellement.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
