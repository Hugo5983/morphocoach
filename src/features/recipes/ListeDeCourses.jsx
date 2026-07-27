// @ts-check
// ─── LISTE DE COURSES — onglet Recettes (remplace Premium) ────────────────────
// Ce que la page optimise : le recoupement. Sept recettes prises au hasard
// demandent une trentaine d'ingrédients ; sept choisies pour se recouper en
// demandent une vingtaine, pour le même apport protéique.
//
// Quatre mécaniques :
//   1. Socle & rotation — deux rythmes d'achat, deux sections visuelles.
//   2. Boucle achat → journal — les quantités se corrigent avec l'usage.
//   3. Réapprovisionnement prédictif — les consommables remontent au bon moment.
//   4. Foyer — les quantités se multiplient, les macros restent pour une part.
//
// Données nécessaires (en sus du catalogue actuel) :
//   • par ingrédient : rayon, formats de vente, prix bas/haut
//   • par consommable : date d'ouverture, format saisi une fois
//   • un champ parts par recette planifiée
//   → générables en une passe sur le catalogue, comme le manifeste photo.
//
// Pour l'instant ce composant fonctionne avec une liste simulée (DEMO_LIST)
// qui illustre l'UI complète. Le branchement sur les vraies données du
// catalogue se fera quand les champs rayon/format seront ajoutés.

import { useState, useCallback, useMemo, useEffect } from "react";
import { I, ID } from "../../components/ui/Icon.jsx";
import { C, FONT, NUM } from "../../data/constants.js";
import { SPACE, TYPE, RADIUS, SHADOW, Z, MOTION } from "../../styles/tokens.js";

// ─── Données de démonstration ─────────────────────────────────────────────────
// Chaque ligne porte sa dominante macro et le nombre de recettes qui l'utilisent.
// Les quantités « ajustées » illustrent la boucle journal.

const SEC = { socle: "Socle", rotation: "Rotation", manuel: "Ajouté à la main" };
const MACRO_TAGS = {
  p: { l: "Prot.", c: C.accent },
  g: { l: "Gluc.", c: C.amber },
  l: { l: "Lip.",  c: "#E5484D" },
};

const DEMO_LIST = [
  { id: 1,  nom: "Blanc de poulet",    qte: "1,2 kg",   sec: "socle", macro: "p", prix: [12.50, 14.20], recettes: 4, adj: "−180 g" },
  { id: 2,  nom: "Œufs",               qte: "18 pièces", sec: "socle", macro: "p", prix: [5.00, 5.80],  recettes: 5 },
  { id: 3,  nom: "Skyr nature",         qte: "1 kg",     sec: "socle", macro: "p", prix: [2.60, 3.10],  recettes: 3, adj: "+250 g" },
  { id: 4,  nom: "Flocons d'avoine",   qte: "1 kg",     sec: "socle", macro: "g", prix: [1.80, 2.40],  recettes: 3 },
  { id: 5,  nom: "Riz basmati",        qte: "2 kg",     sec: "socle", macro: "g", prix: [3.80, 4.60],  recettes: 4 },
  { id: 6,  nom: "Huile d'olive",      qte: "75 cl",    sec: "socle", macro: "l", prix: [6.20, 7.40],  recettes: 6 },
  { id: 7,  nom: "Amandes",            qte: "250 g",    sec: "socle", macro: "l", prix: [3.40, 4.20],  recettes: 3 },

  { id: 8,  nom: "Pavé de saumon",     qte: "360 g",    sec: "rotation", macro: "p", prix: [6.80, 7.60], recettes: 1 },
  { id: 9,  nom: "Myrtilles",          qte: "250 g",    sec: "rotation", macro: "g", prix: [2.80, 3.60], recettes: 3 },
  { id: 10, nom: "Épinards frais",     qte: "150 g",    sec: "rotation", macro: "g", prix: [1.00, 1.40], recettes: 2, adj: "−150 g" },
  { id: 11, nom: "Feta",               qte: "150 g",    sec: "rotation", macro: "l", prix: [2.10, 2.60], recettes: 2 },
  { id: 12, nom: "Citrons",            qte: "3 pièces", sec: "rotation", macro: "g", prix: [1.00, 1.40], recettes: 4 },
  { id: 13, nom: "Brocolis",           qte: "300 g",    sec: "rotation", macro: "g", prix: [1.60, 2.20], recettes: 2 },
];

// ─── Composants utilitaires ───────────────────────────────────────────────────

function Carte({ children, style }) {
  return (
    <div style={{
      background: C.s1, border: `1px solid ${C.bd}`,
      borderRadius: RADIUS.xl, boxShadow: SHADOW.low,
      padding: SPACE.lg, marginBottom: SPACE.md, ...style,
    }}>{children}</div>
  );
}

function MacroTag({ type }) {
  const m = MACRO_TAGS[type];
  if (!m) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: RADIUS.sm,
      background: C.s2, color: C.mid, flexShrink: 0,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: RADIUS.full, background: m.c }}/>
      {m.l}
    </span>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

export default function ListeDeCourses({ premium }) {
  const [coches, setCoches]   = useState(/** @type {Record<number,boolean>} */ ({}));
  const [manuels, setManuels] = useState(/** @type {Array<{id:number,nom:string}>} */ ([]));
  const [saisie, setSaisie]   = useState("");
  const [foyer, setFoyer]     = useState(2);
  const [enfants, setEnfants] = useState(1);
  const [showFoyer, setShowFoyer] = useState(false);

  const toggleCoche = useCallback((id) => {
    setCoches(p => ({ ...p, [id]: !p[id] }));
  }, []);

  // Toutes les lignes (démo + manuelles)
  const allItems = useMemo(() => [
    ...DEMO_LIST,
    ...manuels.map(m => ({ ...m, qte: "", sec: "manuel", macro: null, prix: null, recettes: 0 })),
  ], [manuels]);

  const nbCoches = Object.values(coches).filter(Boolean).length;
  const nbTotal  = allItems.length;

  // Prix fourchette
  const prixLo = DEMO_LIST.reduce((t, i) => t + (i.prix?.[0] || 0), 0);
  const prixHi = DEMO_LIST.reduce((t, i) => t + (i.prix?.[1] || 0), 0);
  const mult   = foyer + enfants * 0.5;
  const lo = Math.round(prixLo * mult / 2);
  const hi = Math.round(prixHi * mult / 2);

  // Ajout manuel
  const ajouterManuel = () => {
    const nom = saisie.trim();
    if (!nom) return;
    setManuels(p => [...p, { id: Date.now(), nom }]);
    setSaisie("");
  };

  // Habituels (fictifs, à brancher sur l'historique)
  const habituels = ["Pain complet", "Bananes", "Thon en boîte", "Café"];

  // Regroupement par section
  const sections = ["socle", "rotation", "manuel"];
  const parSection = (sec) => allItems.filter(i => i.sec === sec);

  return (
    <div className="anim" style={{ position: "relative", paddingBottom: 120 }}>

      {/* ── En-tête ── */}
      <div style={{ padding: `${SPACE.lg}px ${SPACE.lg}px ${SPACE.sm}px` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: SPACE.md }}>
          <div>
            <div style={{ ...TYPE.h1, color: C.text }}>Ta semaine</div>
            <div style={{ ...TYPE.caption, color: C.dim, marginTop: SPACE.xs }}>
              {nbCoches} / {nbTotal} cochés · 7 recettes
            </div>
          </div>
          <button className="tap" onClick={() => setShowFoyer(true)} style={{
            display: "flex", alignItems: "center", gap: 7,
            background: C.s1, border: `1px solid ${C.bd}`, borderRadius: RADIUS.full,
            padding: "7px 12px", fontFamily: FONT, ...TYPE.caption, fontWeight: 600,
            color: C.mid, cursor: "pointer", whiteSpace: "nowrap",
          }}>
            <I name="user" size={15}/> Foyer {mult % 1 === 0 ? mult : mult.toFixed(1).replace(".", ",")}
          </button>
        </div>
      </div>

      <div style={{ padding: `0 ${SPACE.lg}px` }}>

        {/* ── Carte prix + macros ── */}
        <Carte>
          <div style={{ display: "flex", alignItems: "baseline", gap: SPACE.sm }}>
            <span style={{ ...TYPE.display, color: C.text, ...NUM }}>{lo} – {hi} €</span>
            <span style={{ ...TYPE.bodySmall, color: C.dim }}>estimés</span>
          </div>
          <div style={{ ...TYPE.caption, color: C.dim, marginTop: SPACE.sm, display: "flex", alignItems: "center", gap: SPACE.sm }}>
            Base nationale · coef. magasin appliqué
          </div>

          <div style={{
            display: "flex", gap: 3, height: 10, borderRadius: RADIUS.full,
            overflow: "hidden", background: C.s3, margin: `${SPACE.lg}px 0 ${SPACE.md}px`,
          }}>
            <span style={{ flex: 38, background: C.accent }}/>
            <span style={{ flex: 41, background: C.amber }}/>
            <span style={{ flex: 21, background: "#E5484D" }}/>
          </div>
          <div style={{ display: "flex", gap: SPACE.md, flexWrap: "wrap" }}>
            {[
              { l: "Protéines", v: "172 g/j", c: C.accent },
              { l: "Glucides",  v: "310 g/j", c: C.amber },
              { l: "Lipides",   v: "78 g/j",  c: "#E5484D" },
            ].map(m => (
              <span key={m.l} style={{ display: "flex", alignItems: "center", gap: 6, ...TYPE.caption, color: C.mid }}>
                <span style={{ width: 7, height: 7, borderRadius: RADIUS.full, background: m.c }}/>
                {m.l} <b style={{ fontWeight: 600, color: C.text, ...NUM }}>{m.v}</b>
              </span>
            ))}
          </div>
        </Carte>

        {/* ── Bandeau boucle journal ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: SPACE.md, padding: SPACE.md,
          borderRadius: RADIUS.lg, background: "rgba(18,183,106,0.08)",
          border: "1px solid rgba(18,183,106,0.2)", marginBottom: SPACE.md, cursor: "pointer",
        }}>
          <I name="refresh" size={18} color={C.green}/>
          <span style={{ flex: 1, ...TYPE.bodySmall, color: "#1D604E" }}>
            <b style={{ fontWeight: 600, color: "#0E4738" }}>3 quantités ajustées</b> d'après ce que ton journal
            enregistre vraiment.
          </span>
          <I name="chevronRight" size={16} color="#1D604E"/>
        </div>

        {/* ── Progression ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: SPACE.md, marginBottom: SPACE.lg,
        }}>
          <div style={{
            flex: 1, height: 6, borderRadius: RADIUS.full, background: C.s3, overflow: "hidden",
          }}>
            <div style={{
              height: "100%", width: `${Math.round(nbCoches / Math.max(1, nbTotal) * 100)}%`,
              background: C.green, borderRadius: RADIUS.full,
              transition: `width ${MOTION.slow}`,
            }}/>
          </div>
          <span style={{ ...TYPE.caption, fontWeight: 600, color: C.dim, ...NUM }}>
            {nbCoches} / {nbTotal}
          </span>
        </div>

        {/* ── Sections socle & rotation ── */}
        {sections.map(sec => {
          const items = parSection(sec);
          if (!items.length && sec !== "manuel") return null;
          return (
            <Carte key={sec}>
              {sec !== "manuel" ? (
                <>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ ...TYPE.micro, color: C.dim }}>{SEC[sec]}</span>
                    <span style={{ ...TYPE.caption, color: C.dim, ...NUM }}>
                      {items.length} produit{items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div style={{ ...TYPE.caption, color: C.dim, marginBottom: SPACE.md }}>
                    {sec === "socle"
                      ? "Gros formats, achetés une fois pour plusieurs semaines."
                      : "Changent chaque semaine — c'est ce qui évite la lassitude."}
                  </div>
                </>
              ) : (
                <div style={{ ...TYPE.micro, color: C.dim, marginBottom: SPACE.md, display: "flex", justifyContent: "space-between" }}>
                  <span>Ajouté à la main</span>
                  <span style={{ letterSpacing: 0, textTransform: "none", fontWeight: 500 }}>hors recettes</span>
                </div>
              )}

              {items.map((it, i) => {
                const on = !!coches[it.id];
                return (
                  <div key={it.id} className="tap" onClick={() => toggleCoche(it.id)} style={{
                    display: "flex", alignItems: "center", gap: SPACE.md,
                    padding: `${SPACE.md}px 0`,
                    borderBottom: i < items.length - 1 ? `1px solid ${C.bd}` : "none",
                    cursor: "pointer",
                  }}>
                    <span style={{
                      width: 23, height: 23, borderRadius: RADIUS.sm,
                      border: `1.7px solid ${on ? C.green : "#CFD7E6"}`,
                      background: on ? C.green : "#FFF",
                      display: "grid", placeItems: "center", flexShrink: 0,
                      transition: `background ${MOTION.fast}, border-color ${MOTION.fast}`,
                    }}>
                      {on && <I name="check" size={12} color="#FFF" stroke={3.2}/>}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        ...TYPE.body, fontWeight: 600, color: on ? C.dim : C.text,
                        textDecoration: on ? "line-through" : "none",
                        display: "block",
                      }}>{it.nom}</span>
                      <span style={{
                        ...TYPE.caption, color: C.dim, marginTop: 2, display: "block", ...NUM,
                        opacity: on ? 0.4 : 1,
                      }}>
                        {it.qte}{it.adj ? ` · ` : ""}
                        {it.adj && <span style={{ color: C.green, fontWeight: 600 }}>{it.adj}</span>}
                      </span>
                    </span>
                    {it.macro && <MacroTag type={it.macro}/>}
                    {it.prix && (
                      <span style={{
                        ...TYPE.caption, color: C.dim, ...NUM, minWidth: 48,
                        textAlign: "right", opacity: on ? 0.4 : 1,
                      }}>
                        {it.prix[0].toFixed(2).replace(".", ",")} €
                      </span>
                    )}
                    {it.recettes > 0 && (
                      <span style={{
                        ...TYPE.caption, fontWeight: 600, padding: "4px 8px",
                        borderRadius: RADIUS.sm, flexShrink: 0, ...NUM,
                        background: it.recettes > 1 ? C.accentLt : C.s2,
                        color: it.recettes > 1 ? C.accentDk : C.dim,
                        opacity: on ? 0.4 : 1,
                      }}>
                        {it.recettes} rec.
                      </span>
                    )}
                  </div>
                );
              })}

              {sec === "manuel" && (
                <>
                  {manuels.map((m, i) => {
                    const on = !!coches[m.id];
                    return (
                      <div key={m.id} className="tap" onClick={() => toggleCoche(m.id)} style={{
                        display: "flex", alignItems: "center", gap: SPACE.md,
                        padding: `${SPACE.md}px 0`,
                        borderBottom: i < manuels.length - 1 ? `1px solid ${C.bd}` : "none",
                        cursor: "pointer",
                      }}>
                        <span style={{
                          width: 23, height: 23, borderRadius: RADIUS.sm,
                          border: `1.7px solid ${on ? C.green : "#CFD7E6"}`,
                          background: on ? C.green : "#FFF",
                          display: "grid", placeItems: "center", flexShrink: 0,
                        }}>
                          {on && <I name="check" size={12} color="#FFF" stroke={3.2}/>}
                        </span>
                        <span style={{ flex: 1, ...TYPE.body, fontWeight: 600,
                          color: on ? C.dim : C.text,
                          textDecoration: on ? "line-through" : "none",
                        }}>{m.nom}</span>
                      </div>
                    );
                  })}

                  <div style={{
                    display: "flex", alignItems: "center", gap: SPACE.md,
                    background: C.s2, borderRadius: RADIUS.lg, padding: `${SPACE.md}px ${SPACE.md}px`,
                    marginTop: SPACE.sm,
                  }}>
                    <I name="plus" size={17} color={C.dim}/>
                    <input
                      value={saisie}
                      onChange={e => setSaisie(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") ajouterManuel(); }}
                      placeholder="Ajouter un article…"
                      style={{
                        flex: 1, border: "none", background: "transparent",
                        outline: "none", fontFamily: FONT, ...TYPE.body, color: C.text,
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: SPACE.md }}>
                    {habituels.map(h => (
                      <button key={h} className="tap" onClick={() => {
                        setManuels(p => [...p, { id: Date.now() + Math.random(), nom: h }]);
                      }} style={{
                        fontFamily: FONT, ...TYPE.caption, fontWeight: 500, color: C.mid,
                        padding: "7px 12px", borderRadius: RADIUS.full,
                        background: C.s1, border: `1px solid ${C.bd}`, cursor: "pointer",
                      }}>{h}</button>
                    ))}
                  </div>
                </>
              )}
            </Carte>
          );
        })}

        {/* Marge basse */}
        <div style={{ height: 32 }}/>
      </div>

      {/* ── Barre basse ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: `${SPACE.md}px ${SPACE.lg}px calc(${SPACE.xl}px + 68px + env(safe-area-inset-bottom, 0px))`,
        background: `linear-gradient(180deg, rgba(246,247,249,0) 0%, ${C.bg} 26%)`,
        display: "flex", gap: SPACE.md, zIndex: Z.sticky + 1, maxWidth: 500, margin: "0 auto",
      }}>
        <button className="tap-icon" aria-label="Historique" style={{
          width: 54, flexShrink: 0, borderRadius: RADIUS.lg,
          background: C.s1, border: `1px solid ${C.bd}`,
          display: "grid", placeItems: "center", cursor: "pointer", color: C.text,
        }}>
          <I name="clock" size={19}/>
        </button>
        <button className="tap" style={{
          flex: 1, border: "none", borderRadius: RADIUS.lg, padding: SPACE.lg,
          background: `linear-gradient(135deg,${C.accent},${C.accentDk})`,
          color: "#FFF", ...TYPE.h3,
          display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.sm,
          cursor: "pointer",
        }}>
          Partager la liste
          <I name="arrowUp" size={17} color="#FFF"/>
        </button>
      </div>

      {/* ── Feuille Foyer ── */}
      {showFoyer && (
        <div
          onClick={() => setShowFoyer(false)}
          style={{
            position: "fixed", inset: 0, zIndex: Z.sheet,
            background: "rgba(16,19,24,0.5)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            animation: `fadeIn ${MOTION.base} both`,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 500,
              background: C.s1,
              borderRadius: `${RADIUS.xl}px ${RADIUS.xl}px 0 0`,
              boxShadow: SHADOW.high,
              padding: `0 ${SPACE.lg}px calc(${SPACE.xl}px + env(safe-area-inset-bottom, 0px))`,
              animation: `slideUp ${MOTION.smooth} both`,
            }}
          >
            <div style={{
              width: 36, height: 4, borderRadius: RADIUS.full,
              background: C.s3, margin: `${SPACE.md}px auto ${SPACE.lg}px`,
            }}/>
            <div style={{ ...TYPE.h2, color: C.text }}>Tu cuisines pour combien ?</div>
            <div style={{ ...TYPE.bodySmall, color: C.dim, marginTop: SPACE.xs }}>
              Les quantités se multiplient. Tes macros, elles, restent pour toi seul.
            </div>

            {[
              { label: "Adultes", sub: "Portion pleine", val: foyer, set: setFoyer, min: 1 },
              { label: "Enfants", sub: "Demi-portion", val: enfants, set: setEnfants, min: 0 },
            ].map(r => (
              <div key={r.label} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: SPACE.md, borderRadius: RADIUS.lg, background: C.s2, marginTop: SPACE.md,
              }}>
                <span>
                  <span style={{ ...TYPE.body, fontWeight: 600, color: C.text, display: "block" }}>{r.label}</span>
                  <span style={{ ...TYPE.caption, color: C.dim }}>{r.sub}</span>
                </span>
                <span style={{
                  display: "flex", alignItems: "center", gap: 2,
                  background: C.s1, borderRadius: RADIUS.md, padding: 3, border: `1px solid ${C.bd}`,
                }}>
                  <button className="tap-icon" onClick={() => r.set(v => Math.max(r.min, v - 1))} style={{
                    width: 30, height: 30, borderRadius: RADIUS.sm, border: "none",
                    background: "transparent", cursor: "pointer", color: C.mid,
                    display: "grid", placeItems: "center", lineHeight: 1,
                    fontFamily: FONT, fontSize: 18, fontWeight: 700,
                  }}>−</button>
                  <span style={{ minWidth: 34, textAlign: "center", ...TYPE.body, fontWeight: 700, ...NUM }}>{r.val}</span>
                  <button className="tap-icon" onClick={() => r.set(v => v + 1)} style={{
                    width: 30, height: 30, borderRadius: RADIUS.sm, border: "none",
                    background: "transparent", cursor: "pointer", color: C.mid,
                    display: "grid", placeItems: "center", lineHeight: 1,
                    fontFamily: FONT, fontSize: 18, fontWeight: 700,
                  }}>+</button>
                </span>
              </div>
            ))}

            <div style={{ display: "flex", gap: SPACE.md, marginTop: SPACE.lg }}>
              <div style={{ flex: 1, padding: SPACE.md, borderRadius: RADIUS.lg, border: `1px solid ${C.bd}` }}>
                <span style={{ ...TYPE.micro, color: C.dim }}>Liste de courses</span>
                <span style={{ display: "block", ...TYPE.h2, color: C.text, marginTop: SPACE.xs, ...NUM }}>
                  × {mult % 1 === 0 ? mult : mult.toFixed(1).replace(".", ",")}
                </span>
                <span style={{ display: "block", ...TYPE.caption, color: C.dim, marginTop: SPACE.xs }}>
                  Quantités pour tout le foyer
                </span>
              </div>
              <div style={{ flex: 1, padding: SPACE.md, borderRadius: RADIUS.lg,
                border: `1px solid ${C.accent}`, background: C.accentLt }}>
                <span style={{ ...TYPE.micro, color: C.accentDk }}>Ton journal</span>
                <span style={{ display: "block", ...TYPE.h2, color: C.accentDk, marginTop: SPACE.xs, ...NUM }}>× 1</span>
                <span style={{ display: "block", ...TYPE.caption, color: C.accentDk, marginTop: SPACE.xs }}>
                  Une part, tes macros
                </span>
              </div>
            </div>

            <button className="tap" onClick={() => setShowFoyer(false)} style={{
              width: "100%", marginTop: SPACE.lg, padding: SPACE.lg,
              border: "none", borderRadius: RADIUS.lg,
              background: `linear-gradient(135deg,${C.accent},${C.accentDk})`,
              color: "#FFF", ...TYPE.h3,
              display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.sm,
              cursor: "pointer",
            }}>
              Recalculer la liste
              <I name="check" size={18} color="#FFF"/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
