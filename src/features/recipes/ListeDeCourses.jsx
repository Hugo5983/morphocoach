// @ts-check
// ─── LISTE DE COURSES — onglet Recettes (remplace Premium) ────────────────────
// Ce que la page optimise : le recoupement. Sept recettes prises au hasard
// demandent une trentaine d'ingrédients ; sept choisies pour se recouper en
// demandent une vingtaine, pour le même apport protéique.
//
// Révision (juillet 2026) — corrections suite aux retours :
//   1. Le foyer (adultes/enfants) est persisté (useStorage) — ne revient plus
//      à 2,5 à chaque ouverture.
//   2. Le prix ne divise plus par un baseline caché : la fourchette affichée
//      est la somme réelle des articles visibles, multipliée par le foyer
//      choisi, avec la base et le nombre de personnes toujours affichés à
//      côté du chiffre. Rien n'est montré sans dire d'où ça vient.
//   3. Catalogue démo étendu (24 produits) pour ressembler à une vraie semaine.
//   4. Explication socle/rotation en légende permanente, courte, en langage
//      simple — pas une carte qu'on doit fermer.
//   5. Ajout manuel avec grammage ; sans prix connu, l'article est marqué
//      « prix non estimé » plutôt que de fausser le total avec un chiffre
//      inventé.
//   6. Doublons corrigés : ajout (saisie libre ou raccourci) fusionne sur le
//      nom au lieu de créer une nouvelle ligne à chaque tap.
//   7. Partage natif (feuille de partage iOS/Android) avec repli presse-papier.
//   8. Bouton horloge retiré — sa fonction n'était pas définie ; un seul geste
//      principal, clair : Partager.

import { useState, useMemo, useCallback } from "react";
import { useStorage } from "../../hooks/useStorage.js";
import { I } from "../../components/ui/Icon.jsx";
import { C, FONT, NUM } from "../../data/constants.js";
import { SPACE, TYPE, RADIUS, SHADOW, Z, MOTION } from "../../styles/tokens.js";

// ─── Catalogue démo ────────────────────────────────────────────────────────────
// Chaque ligne porte sa dominante macro et le nombre de recettes qui l'utilise.
// Prix en euros, fourchette basse/haute, pour 1 personne sur la semaine.
// Le branchement sur le vrai catalogue nécessite d'ajouter rayon/prix/formats
// à chaque ingrédient — cf. note de livraison.

const SEC_LABEL = { socle: "Socle", rotation: "Rotation" };
const MACRO_TAGS = {
  p: { l: "Prot.", c: C.accent },
  g: { l: "Gluc.", c: C.amber },
  l: { l: "Lip.",  c: "#E5484D" },
};

const DEMO_LIST = [
  // ── Socle : gros formats, achetés une fois pour plusieurs semaines ──
  { id: 1,  nom: "Blanc de poulet",       qte: "1,2 kg",    sec: "socle", macro: "p", prix: [12.50, 14.20], recettes: 4, adj: "−180 g" },
  { id: 2,  nom: "Œufs",                  qte: "18 pièces", sec: "socle", macro: "p", prix: [5.00, 5.80],   recettes: 5 },
  { id: 3,  nom: "Skyr nature",           qte: "1 kg",      sec: "socle", macro: "p", prix: [2.60, 3.10],   recettes: 3, adj: "+250 g" },
  { id: 4,  nom: "Flocons d'avoine",      qte: "1 kg",      sec: "socle", macro: "g", prix: [1.80, 2.40],   recettes: 3 },
  { id: 5,  nom: "Riz basmati",           qte: "2 kg",      sec: "socle", macro: "g", prix: [3.80, 4.60],   recettes: 4 },
  { id: 6,  nom: "Huile d'olive",         qte: "75 cl",     sec: "socle", macro: "l", prix: [6.20, 7.40],   recettes: 6 },
  { id: 7,  nom: "Amandes",               qte: "250 g",     sec: "socle", macro: "l", prix: [3.40, 4.20],   recettes: 3 },
  { id: 8,  nom: "Pâtes complètes",       qte: "1 kg",      sec: "socle", macro: "g", prix: [2.20, 2.80],   recettes: 2 },
  { id: 9,  nom: "Beurre de cacahuète",   qte: "350 g",     sec: "socle", macro: "l", prix: [4.50, 5.40],   recettes: 2 },
  { id: 10, nom: "Lentilles corail",      qte: "500 g",     sec: "socle", macro: "g", prix: [2.00, 2.60],   recettes: 2 },

  // ── Rotation : changent chaque semaine ──
  { id: 11, nom: "Pavé de saumon",        qte: "360 g",     sec: "rotation", macro: "p", prix: [6.80, 7.60], recettes: 1 },
  { id: 12, nom: "Myrtilles",             qte: "250 g",     sec: "rotation", macro: "g", prix: [2.80, 3.60], recettes: 3 },
  { id: 13, nom: "Épinards frais",        qte: "150 g",     sec: "rotation", macro: "g", prix: [1.00, 1.40], recettes: 2, adj: "−150 g" },
  { id: 14, nom: "Feta",                  qte: "150 g",     sec: "rotation", macro: "l", prix: [2.10, 2.60], recettes: 2 },
  { id: 15, nom: "Citrons",               qte: "3 pièces",  sec: "rotation", macro: "g", prix: [1.00, 1.40], recettes: 4 },
  { id: 16, nom: "Brocolis",              qte: "300 g",     sec: "rotation", macro: "g", prix: [1.60, 2.20], recettes: 2 },
  { id: 17, nom: "Avocat",                qte: "2 pièces",  sec: "rotation", macro: "l", prix: [2.40, 3.00], recettes: 2 },
  { id: 18, nom: "Tomates cerises",       qte: "250 g",     sec: "rotation", macro: "g", prix: [1.80, 2.30], recettes: 3 },
  { id: 19, nom: "Yaourt grec",           qte: "500 g",     sec: "rotation", macro: "p", prix: [2.30, 2.90], recettes: 2 },
  { id: 20, nom: "Thon frais",            qte: "300 g",     sec: "rotation", macro: "p", prix: [5.60, 6.80], recettes: 1 },
  { id: 21, nom: "Champignons",           qte: "250 g",     sec: "rotation", macro: "g", prix: [1.40, 1.90], recettes: 1 },
  { id: 22, nom: "Courgettes",            qte: "400 g",     sec: "rotation", macro: "g", prix: [1.20, 1.60], recettes: 2 },
  { id: 23, nom: "Fromage de chèvre",     qte: "120 g",     sec: "rotation", macro: "l", prix: [2.60, 3.20], recettes: 1 },
  { id: 24, nom: "Pain complet",          qte: "500 g",     sec: "rotation", macro: "g", prix: [1.90, 2.30], recettes: 2 },
];

const HABITUELS = ["Pain complet", "Bananes", "Thon en boîte", "Café"];

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

/** Normalise un nom pour la déduplication (casse, espaces superflus). */
function cle(nom) { return nom.trim().toLowerCase().replace(/\s+/g, " "); }

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

/**
 * @param {{ premium?: boolean, push?: (icon:string, titre:string, msg:string)=>void }} props
 */
export default function ListeDeCourses({ premium, push }) {
  // ── Persistance : foyer, articles ajoutés à la main, cases cochées ────────
  const [foyer,   setFoyer]   = useStorage("listeCoursesFoyerAdultes", 1);
  const [enfants, setEnfants] = useStorage("listeCoursesFoyerEnfants", 0);
  const [manuels, setManuels] = useStorage("listeCoursesManuels", /** @type {Array<{id:number,nom:string,grammes:string|null,prix:number|null}>} */ ([]));
  const [coches,  setCoches]  = useStorage("listeCoursesCoches", /** @type {Record<string,boolean>} */ ({}));

  const foyerSafe   = foyer   ?? 1;
  const enfantsSafe = enfants ?? 0;
  const manuelsSafe = manuels ?? [];
  const cochesSafe  = coches  ?? {};

  const [saisieNom, setSaisieNom] = useState("");
  const [saisieG,   setSaisieG]   = useState("");
  const [showFoyer, setShowFoyer] = useState(false);

  const toggleCoche = useCallback((id) => {
    setCoches(p => ({ ...(p || {}), [id]: !(p || {})[id] }));
  }, [setCoches]);

  // ── Ajout d'un article, avec fusion sur le nom : jamais de doublon ────────
  /** @type {(nom: string, grammes?: string|null) => void} */
  const fusionnerOuAjouter = useCallback((nom, grammes = /** @type {string|null} */ (null)) => {
    const k = cle(nom);
    if (!k) return;
    setManuels(prev => {
      const list = prev || [];
      const idx = list.findIndex(m => cle(m.nom) === k);
      if (idx >= 0) {
        if (!grammes) return list; // déjà présent, rien à changer
        const copy = [...list];
        copy[idx] = { ...copy[idx], grammes };
        return copy;
      }
      return [...list, { id: Date.now() + Math.random(), nom: nom.trim(), grammes, prix: null }];
    });
  }, [setManuels]);

  const ajouterManuel = () => {
    const nom = saisieNom.trim();
    if (!nom) return;
    const g = parseInt(saisieG, 10);
    const grammes = Number.isFinite(g) && g > 0 ? `${g} g` : null;
    fusionnerOuAjouter(nom, grammes);
    setSaisieNom(""); setSaisieG("");
  };

  const retirerManuel = (id) => setManuels(prev => (prev || []).filter(m => m.id !== id));

  // ── Toutes les lignes ──────────────────────────────────────────────────────
  const allItems = /** @type {Array<any>} */ (useMemo(() => [
    ...DEMO_LIST,
    ...manuelsSafe.map(m => ({ ...m, sec: "manuel", macro: null, prix: null, recettes: 0, qte: m.grammes || "" })),
  ], [manuelsSafe]));

  const nbCoches = allItems.filter(i => cochesSafe[i.id]).length;
  const nbTotal  = allItems.length;

  // ── Prix : somme réelle des articles avec prix connu, multipliée par le
  //    foyer. Aucune division cachée — le multiplicateur est direct et
  //    affiché en toutes lettres à côté du chiffre. ────────────────────────
  const prixLoBase = DEMO_LIST.reduce((t, i) => t + i.prix[0], 0);
  const prixHiBase = DEMO_LIST.reduce((t, i) => t + i.prix[1], 0);
  const mult = foyerSafe + enfantsSafe * 0.5;
  const lo = Math.round(prixLoBase * mult);
  const hi = Math.round(prixHiBase * mult);
  const multTxt = mult % 1 === 0 ? String(mult) : mult.toFixed(1).replace(".", ",");

  // ── Regroupement par section ───────────────────────────────────────────────
  const sections = ["socle", "rotation", "manuel"];
  const parSection = (sec) => allItems.filter(i => i.sec === sec);

  // ── Partage natif ──────────────────────────────────────────────────────────
  const partager = async () => {
    const lignes = allItems
      .filter(i => !cochesSafe[i.id])
      .map(i => `• ${i.nom}${i.qte ? ` — ${i.qte}` : ""}`)
      .join("\n");
    const texte = `Liste de courses MorphoCoach\n${lignes}\n\nEstimé : ${lo} – ${hi} € pour ${multTxt} personne${mult > 1 ? "s" : ""}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Liste de courses", text: texte });
      } catch { /* annulé par l'utilisateur : rien à faire */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(texte);
      push && push("", "Copié !", "La liste est dans le presse-papier — colle-la où tu veux.");
    } catch {
      push && push("", "Partage indisponible", "Ton navigateur ne permet pas le partage direct.");
    }
  };

  return (
    <div className="anim" style={{ position: "relative", paddingBottom: 110 }}>

      {/* ── En-tête ── */}
      <div style={{ padding: `${SPACE.lg}px ${SPACE.lg}px ${SPACE.sm}px` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: SPACE.md }}>
          <div>
            <div style={{ ...TYPE.h1, color: C.text }}>Ta semaine</div>
            <div style={{ ...TYPE.caption, color: C.dim, marginTop: SPACE.xs }}>
              {nbCoches} / {nbTotal} cochés
            </div>
          </div>
          <button className="tap" onClick={() => setShowFoyer(true)} style={{
            display: "flex", alignItems: "center", gap: 7,
            background: C.s1, border: `1px solid ${C.bd}`, borderRadius: RADIUS.full,
            padding: "7px 12px", ...TYPE.caption, fontWeight: 600,
            color: C.mid, cursor: "pointer", whiteSpace: "nowrap",
          }}>
            <I name="user" size={15}/> {multTxt} pers.
          </button>
        </div>
      </div>

      <div style={{ padding: `0 ${SPACE.lg}px` }}>

        {/* ── Carte prix + macros ── */}
        <Carte>
          <div style={{ display: "flex", alignItems: "baseline", gap: SPACE.sm, flexWrap: "wrap" }}>
            <span style={{ ...TYPE.display, color: C.text, ...NUM }}>{lo} – {hi} €</span>
            <span style={{ ...TYPE.bodySmall, color: C.dim }}>estimés</span>
          </div>
          <div style={{ ...TYPE.caption, color: C.dim, marginTop: SPACE.sm }}>
            Base nationale, juillet 2026 · pour {multTxt} personne{mult > 1 ? "s" : ""}
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
              { l: "Protéines", v: `${Math.round(172 * mult / 2.5)} g/j`, c: C.accent },
              { l: "Glucides",  v: `${Math.round(310 * mult / 2.5)} g/j`, c: C.amber },
              { l: "Lipides",   v: `${Math.round(78  * mult / 2.5)} g/j`, c: "#E5484D" },
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
          border: "1px solid rgba(18,183,106,0.2)", marginBottom: SPACE.md,
        }}>
          <I name="refresh" size={18} color={C.green}/>
          <span style={{ flex: 1, ...TYPE.bodySmall, color: "#1D604E" }}>
            <b style={{ fontWeight: 600, color: "#0E4738" }}>3 quantités ajustées</b> d'après ce que ton journal
            enregistre vraiment.
          </span>
        </div>

        {/* ── Légende Socle / Rotation — toujours visible, en langage simple ── */}
        <div style={{
          display: "flex", gap: SPACE.sm, marginBottom: SPACE.md, flexWrap: "wrap",
        }}>
          <div style={{
            flex: "1 1 140px", display: "flex", alignItems: "center", gap: SPACE.sm,
            padding: `${SPACE.sm}px ${SPACE.md}px`, borderRadius: RADIUS.lg,
            background: C.accentLt, border: `1px solid rgba(60,91,255,0.2)`,
          }}>
            <I name="target" size={16} color={C.accentDk}/>
            <span style={{ ...TYPE.caption, color: C.accentDk, lineHeight: 1.35 }}>
              <b style={{ fontWeight: 700 }}>Socle</b> — grand format, dure plusieurs semaines
            </span>
          </div>
          <div style={{
            flex: "1 1 140px", display: "flex", alignItems: "center", gap: SPACE.sm,
            padding: `${SPACE.sm}px ${SPACE.md}px`, borderRadius: RADIUS.lg,
            background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.22)",
          }}>
            <I name="refresh" size={16} color={C.amber}/>
            <span style={{ ...TYPE.caption, color: "#8A5A08", lineHeight: 1.35 }}>
              <b style={{ fontWeight: 700 }}>Rotation</b> — change chaque semaine
            </span>
          </div>
        </div>

        {/* ── Progression ── */}
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.md, marginBottom: SPACE.lg }}>
          <div style={{ flex: 1, height: 6, borderRadius: RADIUS.full, background: C.s3, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${Math.round(nbCoches / Math.max(1, nbTotal) * 100)}%`,
              background: C.green, borderRadius: RADIUS.full,
              transition: `width ${MOTION.slow}`,
            }}/>
          </div>
          <span style={{ ...TYPE.caption, fontWeight: 600, color: C.dim, ...NUM }}>{nbCoches} / {nbTotal}</span>
        </div>

        {/* ── Sections ── */}
        {sections.map(sec => {
          const items = parSection(sec);
          if (sec !== "manuel" && !items.length) return null;
          return (
            <Carte key={sec}>
              {sec !== "manuel" ? (
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: SPACE.md }}>
                  <span style={{ ...TYPE.micro, color: C.dim }}>{SEC_LABEL[sec]}</span>
                  <span style={{ ...TYPE.caption, color: C.dim, ...NUM }}>{items.length} produits</span>
                </div>
              ) : (
                <div style={{ ...TYPE.micro, color: C.dim, marginBottom: SPACE.md, display: "flex", justifyContent: "space-between" }}>
                  <span>Ajouté à la main</span>
                  <span style={{ letterSpacing: 0, textTransform: "none", fontWeight: 500 }}>hors recettes</span>
                </div>
              )}

              {items.filter(i => i.sec !== "manuel").map((it, i, arr) => {
                const on = !!cochesSafe[it.id];
                return (
                  <div key={it.id} className="tap" onClick={() => toggleCoche(it.id)} style={{
                    display: "flex", alignItems: "center", gap: SPACE.md,
                    padding: `${SPACE.md}px 0`,
                    borderBottom: i < arr.length - 1 ? `1px solid ${C.bd}` : "none",
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
                        textDecoration: on ? "line-through" : "none", display: "block",
                      }}>{it.nom}</span>
                      <span style={{ ...TYPE.caption, color: C.dim, marginTop: 2, display: "block", ...NUM, opacity: on ? 0.4 : 1 }}>
                        {it.qte}{it.adj ? " · " : ""}
                        {it.adj && <span style={{ color: C.green, fontWeight: 600 }}>{it.adj}</span>}
                      </span>
                    </span>
                    {it.macro && <MacroTag type={it.macro}/>}
                    <span style={{ ...TYPE.caption, color: C.dim, ...NUM, minWidth: 48, textAlign: "right", opacity: on ? 0.4 : 1 }}>
                      {(it.prix[0] * mult).toFixed(2).replace(".", ",")} €
                    </span>
                    {it.recettes > 0 && (
                      <span style={{
                        ...TYPE.caption, fontWeight: 600, padding: "4px 8px",
                        borderRadius: RADIUS.sm, flexShrink: 0, ...NUM,
                        background: it.recettes > 1 ? C.accentLt : C.s2,
                        color: it.recettes > 1 ? C.accentDk : C.dim,
                        opacity: on ? 0.4 : 1,
                      }}>{it.recettes} rec.</span>
                    )}
                  </div>
                );
              })}

              {sec === "manuel" && (
                <>
                  {manuelsSafe.map((m, i) => {
                    const on = !!cochesSafe[m.id];
                    return (
                      <div key={m.id} style={{
                        display: "flex", alignItems: "center", gap: SPACE.md,
                        padding: `${SPACE.md}px 0`,
                        borderBottom: i < manuelsSafe.length - 1 ? `1px solid ${C.bd}` : "none",
                      }}>
                        <span className="tap" onClick={() => toggleCoche(m.id)} style={{
                          width: 23, height: 23, borderRadius: RADIUS.sm,
                          border: `1.7px solid ${on ? C.green : "#CFD7E6"}`,
                          background: on ? C.green : "#FFF",
                          display: "grid", placeItems: "center", flexShrink: 0, cursor: "pointer",
                        }}>
                          {on && <I name="check" size={12} color="#FFF" stroke={3.2}/>}
                        </span>
                        <span className="tap" onClick={() => toggleCoche(m.id)} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
                          <span style={{
                            ...TYPE.body, fontWeight: 600, color: on ? C.dim : C.text,
                            textDecoration: on ? "line-through" : "none", display: "block",
                          }}>{m.nom}</span>
                          {m.grammes && (
                            <span style={{ ...TYPE.caption, color: C.dim, marginTop: 2, display: "block", ...NUM, opacity: on ? 0.4 : 1 }}>
                              {m.grammes}
                            </span>
                          )}
                        </span>
                        <span style={{
                          ...TYPE.caption, color: C.dim, fontStyle: "italic", flexShrink: 0, opacity: on ? 0.4 : 1,
                        }}>prix non estimé</span>
                        <button className="tap-icon" onClick={() => retirerManuel(m.id)} aria-label="Retirer" style={{
                          width: 26, height: 26, borderRadius: RADIUS.sm, border: "none",
                          background: C.s2, cursor: "pointer", display: "grid", placeItems: "center", color: C.dim, flexShrink: 0,
                        }}>
                          <I name="close" size={12}/>
                        </button>
                      </div>
                    );
                  })}

                  {/* Saisie : nom + grammage, fusion automatique sur le nom */}
                  <div style={{ display: "flex", gap: SPACE.sm, marginTop: SPACE.sm }}>
                    <div style={{
                      flex: 1, display: "flex", alignItems: "center", gap: SPACE.sm,
                      background: C.s2, borderRadius: RADIUS.lg, padding: `0 ${SPACE.md}px`,
                    }}>
                      <I name="plus" size={16} color={C.dim}/>
                      <input
                        value={saisieNom}
                        onChange={e => setSaisieNom(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") ajouterManuel(); }}
                        placeholder="Ajouter un article…"
                        style={{
                          flex: 1, border: "none", background: "transparent", outline: "none",
                          ...TYPE.body, color: C.text, padding: `${SPACE.md}px 0`, minWidth: 0,
                        }}
                      />
                    </div>
                    <input
                      value={saisieG}
                      onChange={e => setSaisieG(e.target.value.replace(/[^0-9]/g, ""))}
                      onKeyDown={e => { if (e.key === "Enter") ajouterManuel(); }}
                      inputMode="numeric"
                      placeholder="g"
                      style={{
                        width: 58, textAlign: "center", border: "none", background: C.s2,
                        borderRadius: RADIUS.lg, outline: "none", ...TYPE.body,
                        color: C.text, ...NUM,
                      }}
                    />
                    <button className="tap-icon" onClick={ajouterManuel} aria-label="Ajouter" style={{
                      width: 44, borderRadius: RADIUS.lg, border: "none",
                      background: saisieNom.trim() ? C.accent : C.s3,
                      display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0,
                    }}>
                      <I name="plus" size={18} color={saisieNom.trim() ? "#FFF" : C.dim}/>
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: SPACE.md }}>
                    {HABITUELS.map(h => {
                      const dejaLa = manuelsSafe.some(m => cle(m.nom) === cle(h));
                      return (
                        <button key={h} className="tap" onClick={() => fusionnerOuAjouter(h)} style={{
                          ...TYPE.caption, fontWeight: 500,
                          color: dejaLa ? C.dim : C.mid,
                          padding: "7px 12px", borderRadius: RADIUS.full,
                          background: dejaLa ? C.s2 : C.s1, border: `1px solid ${C.bd}`,
                          cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5,
                        }}>
                          {dejaLa && <I name="check" size={11} color={C.dim} stroke={3}/>}
                          {h}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </Carte>
          );
        })}

        <div style={{ height: 8 }}/>
      </div>

      {/* ── Barre basse : un seul geste, clair ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: `${SPACE.md}px ${SPACE.lg}px calc(${SPACE.xl}px + 68px + env(safe-area-inset-bottom, 0px))`,
        background: `linear-gradient(180deg, rgba(246,247,249,0) 0%, ${C.bg} 26%)`,
        zIndex: Z.sticky + 1,
      }}>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <button className="tap" onClick={partager} style={{
            width: "100%", border: "none", borderRadius: RADIUS.lg, padding: SPACE.lg,
            background: `linear-gradient(135deg,${C.accent},${C.accentDk})`,
            color: "#FFF", ...TYPE.h3,
            display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.sm,
            cursor: "pointer",
          }}>
            Partager la liste
            <I name="arrowUp" size={17} color="#FFF"/>
          </button>
        </div>
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
            <div style={{ width: 36, height: 4, borderRadius: RADIUS.full, background: C.s3, margin: `${SPACE.md}px auto ${SPACE.lg}px` }}/>
            <div style={{ ...TYPE.h2, color: C.text }}>Tu cuisines pour combien ?</div>
            <div style={{ ...TYPE.bodySmall, color: C.dim, marginTop: SPACE.xs }}>
              Les quantités de la liste se multiplient. Ce choix est mémorisé pour la prochaine fois.
            </div>

            {[
              { label: "Adultes", sub: "Portion pleine", val: foyerSafe, set: setFoyer, min: 1 },
              { label: "Enfants", sub: "Demi-portion",   val: enfantsSafe, set: setEnfants, min: 0 },
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
                  <button className="tap-icon" onClick={() => r.set(v => Math.max(r.min, (v ?? r.min) - 1))} style={{
                    width: 30, height: 30, borderRadius: RADIUS.sm, border: "none",
                    background: "transparent", cursor: "pointer", color: C.mid,
                    display: "grid", placeItems: "center", lineHeight: 1,
                    fontFamily: FONT, fontSize: 18, fontWeight: 700,
                  }}>−</button>
                  <span style={{ minWidth: 34, textAlign: "center", ...TYPE.body, fontWeight: 700, ...NUM }}>{r.val}</span>
                  <button className="tap-icon" onClick={() => r.set(v => (v ?? 0) + 1)} style={{
                    width: 30, height: 30, borderRadius: RADIUS.sm, border: "none",
                    background: "transparent", cursor: "pointer", color: C.mid,
                    display: "grid", placeItems: "center", lineHeight: 1,
                    fontFamily: FONT, fontSize: 18, fontWeight: 700,
                  }}>+</button>
                </span>
              </div>
            ))}

            <div style={{ display: "flex", gap: SPACE.md, marginTop: SPACE.lg }}>
              <div style={{ flex: 1, padding: SPACE.md, borderRadius: RADIUS.lg, border: `1px solid ${C.accent}`, background: C.accentLt }}>
                <span style={{ ...TYPE.micro, color: C.accentDk }}>Liste de courses</span>
                <span style={{ display: "block", ...TYPE.h2, color: C.accentDk, marginTop: SPACE.xs, ...NUM }}>
                  × {mult % 1 === 0 ? mult : mult.toFixed(1).replace(".", ",")}
                </span>
                <span style={{ display: "block", ...TYPE.caption, color: C.accentDk, marginTop: SPACE.xs }}>
                  Quantités pour tout le foyer
                </span>
              </div>
              <div style={{ flex: 1, padding: SPACE.md, borderRadius: RADIUS.lg, border: `1px solid ${C.bd}` }}>
                <span style={{ ...TYPE.micro, color: C.dim }}>Ton journal</span>
                <span style={{ display: "block", ...TYPE.h2, color: C.text, marginTop: SPACE.xs, ...NUM }}>× 1</span>
                <span style={{ display: "block", ...TYPE.caption, color: C.dim, marginTop: SPACE.xs }}>
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
              Enregistrer
              <I name="check" size={18} color="#FFF"/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
