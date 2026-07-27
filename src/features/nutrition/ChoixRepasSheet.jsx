// @ts-check
// ─── CHOIX REPAS — feuille de confirmation avant ajout au journal ─────────────
// Posée au moment de l'enregistrement (et non avant la saisie) : c'est le seul
// endroit où l'on peut se tromper de façon coûteuse. Chaque ligne montre ce que
// le repas contient déjà et ce qu'il deviendra.
//
// Composant autonome et réutilisable : photo, scan, ajout manuel.
// Aucun état global, aucun effet de bord — le parent décide via onPick(repasId).

import { useState } from "react";
import { I, ID } from "../../components/ui/Icon.jsx";
import { C, FONT, NUM, SPACE, TYPE, RADIUS, SHADOW, Z, MOTION } from "../../styles/tokens.js";
import { MEALS } from "./components/NutritionKit.jsx";

// Ordre chronologique d'affichage (MEALS est ordonné pour le journal).
const ORDRE = ["matin", "midi", "soir", "snack"];

/** Repas plausible d'après l'heure — pré-sélection, jamais imposée. */
export function repasSuggere(date = new Date()) {
  const h = date.getHours();
  if (h < 11) return "matin";
  if (h < 15) return "midi";
  if (h < 18) return "snack";
  return "soir";
}

/** Somme des calories déjà présentes dans un repas. */
function totalRepas(items) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((t, i) => t + (Number(i?.c) || 0), 0);
}

/**
 * @param {{
 *   totals: { c:number, p:number, g:number, l:number },
 *   contenu?: Record<string, Array<object>>,
 *   defaultId?: string|null,
 *   onPick: (repasId: string) => void,
 *   onClose: () => void,
 * }} props
 */
export default function ChoixRepasSheet({ totals, contenu = {}, defaultId = null, onPick, onClose }) {
  const suggere = repasSuggere();
  const [choix, setChoix] = useState(defaultId || suggere);

  const liste = ORDRE.flatMap(id => {
    const m = MEALS.find(x => x.id === id);
    return m ? [m] : [];
  });

  const labelChoix = (MEALS.find(m => m.id === choix)?.l || "").toLowerCase();
  const kcal = Math.round(totals?.c || 0);

  return (
    <div
      onClick={onClose}
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
          maxHeight: "88dvh", overflowY: "auto",
          animation: `slideUp ${MOTION.smooth} both`,
        }}
      >
        {/* Grabber */}
        <div style={{
          width: 36, height: 4, borderRadius: RADIUS.full,
          background: C.s3, margin: `${SPACE.md}px auto ${SPACE.lg}px`,
        }}/>

        <div style={{ ...TYPE.h2, color: C.text }}>Dans quel repas ?</div>
        <div style={{ ...TYPE.bodySmall, color: C.dim, marginTop: SPACE.xs, ...NUM }}>
          {kcal} kcal · P {Math.round(totals?.p || 0)} · G {Math.round(totals?.g || 0)} · L {Math.round(totals?.l || 0)}
        </div>

        {/* Lignes repas */}
        <div style={{ marginTop: SPACE.lg }}>
          {liste.map(m => {
            const actuel  = totalRepas(contenu[m.id]);
            const nb      = Array.isArray(contenu[m.id]) ? contenu[m.id].length : 0;
            const actif   = choix === m.id;
            return (
              <button
                key={m.id}
                className="tap"
                onClick={() => setChoix(m.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: SPACE.md,
                  padding: SPACE.md,
                  marginBottom: SPACE.sm,
                  borderRadius: RADIUS.lg,
                  background: actif ? C.accentLt : C.s1,
                  border: `1.5px solid ${actif ? C.accent : C.bd}`,
                  cursor: "pointer", textAlign: "left",
                  fontFamily: FONT,
                  transition: `background ${MOTION.base}, border-color ${MOTION.base}`,
                }}
              >
                <span style={{
                  width: 38, height: 38, borderRadius: RADIUS.md,
                  background: actif ? C.s1 : C.s2,
                  display: "grid", placeItems: "center", flexShrink: 0,
                }}>
                  <ID name={m.icon} size={22}/>
                </span>

                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: SPACE.sm }}>
                    <span style={{ ...TYPE.h3, color: C.text }}>{m.l}</span>
                    {m.id === suggere && (
                      <span style={{
                        ...TYPE.micro, color: C.green,
                        background: "rgba(18,183,106,0.10)",
                        padding: "2px 6px", borderRadius: RADIUS.sm,
                      }}>Suggéré</span>
                    )}
                  </span>
                  <span style={{ display: "block", ...TYPE.caption, color: C.dim, marginTop: 2, ...NUM }}>
                    {actuel > 0 ? `${actuel} kcal · ${nb} aliment${nb > 1 ? "s" : ""}` : "Vide"}
                  </span>
                </span>

                <span style={{
                  ...TYPE.bodySmall, fontWeight: 700,
                  color: actif ? C.accentDk : C.dim,
                  flexShrink: 0, ...NUM,
                }}>+{kcal}</span>
              </button>
            );
          })}
        </div>

        {/* Confirmation */}
        <button
          className="tap"
          onClick={() => onPick(choix)}
          style={{
            width: "100%", marginTop: SPACE.md,
            padding: SPACE.lg,
            border: "none", borderRadius: RADIUS.lg,
            background: `linear-gradient(135deg,${C.accent},${C.accentDk})`,
            color: "#FFF", ...TYPE.h3,
            display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.sm,
            cursor: "pointer",
          }}
        >
          Ajouter au {labelChoix}
          <I name="check" size={18} color="#FFF"/>
        </button>

        <button
          className="tap"
          onClick={onClose}
          style={{
            width: "100%", marginTop: SPACE.sm,
            padding: SPACE.md,
            border: "none", borderRadius: RADIUS.lg,
            background: C.s2, color: C.mid,
            ...TYPE.body, fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
