// ─── MobilitePage.jsx ───────────────────────────────────────────────────────
// Routines de mobilité INDIVIDUELLES, dérivées de la posture lue sur les
// photos, du métier et des pathologies déclarées. Aucun appel IA.
//
// Concepts F + G : la liste par moment de journée sert d'entrée, chaque
// routine se déplie sur sa raison d'être et son détail. L'encart « pourquoi
// toi » est ce qui distingue un vrai coaching d'une routine générique.
import { useState, useMemo } from "react";
import useScrollTop from "../../../hooks/useScrollTop.js";
import { FONT } from "../../../data/constants.js";
import { I } from "../../../components/ui/Icon.jsx";
import { getRoutinesMobilite } from "../../../services/mobiliteService.js";

const F    = FONT;
const BL   = "#3B5BFB";
const GRN  = "#0B8A5F";
const AMB  = "#F5A100";
const GREY = "#9AA3B2";

const MOMENTS = {
  matin:        { label: "Matin",           icone: "sun",    couleur: AMB },
  soir:         { label: "Soir",            icone: "moon",   couleur: "#7C5CFF" },
  avant_seance: { label: "Avant la séance", icone: "flame",  couleur: BL },
  libre:        { label: "Dans la journée", icone: "clock",  couleur: GREY },
};

export default function MobilitePage({ prog, profil, fiche, onClose }) {
  useScrollTop();
  const [ouvert, setOuvert] = useState(null);

  const { routines, minutesJour, resume } = useMemo(
    () => getRoutinesMobilite(fiche, {
      metier: profil?.metier || prog?.metier,
      pathologies: prog?.pathologies || profil?.pathologies || [],
    }),
    [fiche, profil?.metier, prog?.metier, prog?.pathologies]
  );

  return (
    <div style={{ padding: "0 20px" }}>
      <style>{`
        @keyframes moUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes moAur{0%{transform:translate(-6%,-4%) scale(1)}50%{transform:translate(7%,5%) scale(1.18)}100%{transform:translate(-6%,-4%) scale(1)}}
      `}</style>

      <div style={{ padding: "14px 0 40px", maxWidth: 480, margin: "0 auto" }}>

        <div onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 6,
          padding: "0 0 8px", cursor: "pointer", animation: "moUp .5s cubic-bezier(.22,1,.36,1) both" }}>
          <I name="chevronLeft" size={18} color={BL} />
          <span style={{ fontSize: 15, fontWeight: 700, color: BL, fontFamily: F }}>Retour</span>
        </div>

        {/* HERO */}
        <div style={{ position: "relative", borderRadius: 26, overflow: "hidden",
          background: "#0B0E1A", marginBottom: 16, clipPath: "inset(0 round 26px)",
          animation: "moUp .6s cubic-bezier(.22,1,.36,1) both", animationDelay: ".06s" }}>
          <div style={{ position: "absolute", top: -60, left: -40, width: 230, height: 230,
            borderRadius: "50%", background: `radial-gradient(circle,${BL},transparent 66%)`,
            filter: "blur(20px)", opacity: .55, animation: "moAur 10s ease-in-out infinite",
            pointerEvents: "none" }} />
          <div style={{ position: "relative", padding: 20, display: "flex", flexDirection: "column", gap: 7 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em",
              color: "#9FB0FF", fontFamily: F }}>MOBILITÉ QUOTIDIENNE</span>
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.03em",
              color: "#fff", lineHeight: 1.1, fontFamily: F }}>
              Ce que <span style={{ fontStyle: "italic", color: "#A9B8FF" }}>ton corps</span> demande
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.62)", fontFamily: F }}>
              {routines.length > 0
                ? `${routines.length} routine${routines.length > 1 ? "s" : ""} · ~${minutesJour} min par jour`
                : "Aucune contrainte identifiée"}
            </span>
          </div>
        </div>

        {routines.length === 0 ? (
          <Card delay=".12s">
            <div style={{ padding: "14px 16px", borderRadius: 16,
              background: "linear-gradient(135deg,#F7F8FB,#EEF1FF)",
              border: "1px dashed rgba(59,91,251,.2)" }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: BL, fontFamily: F, marginBottom: 6 }}>
                Rien de spécifique à corriger
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: "#6B7486", lineHeight: 1.5, fontFamily: F }}>
                {resume} Renseigne ton métier et refais l'analyse morphologique pour affiner.
              </div>
            </div>
          </Card>
        ) : (
          <>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: "#6B7486",
              lineHeight: 1.5, fontFamily: F, marginBottom: 14, padding: "0 2px" }}>
              {resume}
            </div>

            {routines.map((r, i) => {
              const m = MOMENTS[r.moment] || MOMENTS.libre;
              const open = ouvert === r.cle;
              return (
                <Card key={r.cle} delay={`${(0.12 + i * 0.05).toFixed(2)}s`}>
                  {/* Ligne repliée (concept F) */}
                  <div onClick={() => setOuvert(o => (o === r.cle ? null : r.cle))}
                    style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                    <span style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 13,
                      display: "grid", placeItems: "center", background: `${m.couleur}18` }}>
                      <I name={m.icone} size={18} color={m.couleur} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 800, color: "#0F1923", fontFamily: F }}>
                        {r.titre}
                      </div>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: GREY, fontFamily: F, marginTop: 2 }}>
                        {m.label} · {r.minutes} min · {r.exercices.length} exercices
                      </div>
                    </div>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GREY}
                      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
                      style={{ flexShrink: 0, transform: open ? "rotate(90deg)" : "none",
                               transition: "transform .2s" }}>
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </div>

                  {/* Détail déplié (concept G) */}
                  {open && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(15,25,35,.06)" }}>
                      <div style={{ background: "rgba(59,91,251,.07)", borderRadius: 13,
                        padding: "11px 13px", marginBottom: 14 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".08em",
                          color: "#2540E0", fontFamily: F, marginBottom: 4 }}>POURQUOI TOI</div>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: "#2540E0",
                          lineHeight: 1.55, fontFamily: F }}>{r.cause}</div>
                      </div>

                      <div style={{ fontSize: 11.5, fontWeight: 700, color: GREY,
                        fontFamily: F, marginBottom: 8 }}>{r.frequence}</div>

                      {r.exercices.map((e, k) => (
                        <div key={k} style={{ display: "flex", gap: 11, padding: "9px 0",
                          borderTop: k === 0 ? "none" : "1px solid rgba(15,25,35,.05)" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: GREY,
                            fontFamily: F, minWidth: 14 }}>{k + 1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1923", fontFamily: F }}>
                              {e.nom}
                            </div>
                            <div style={{ fontSize: 11.5, fontWeight: 700, color: BL,
                              fontFamily: F, marginTop: 2 }}>{e.duree}</div>
                            <div style={{ fontSize: 12, fontWeight: 500, color: "#6B7486",
                              lineHeight: 1.5, fontFamily: F, marginTop: 3 }}>{e.comment}</div>
                          </div>
                        </div>
                      ))}

                      {/* L'avertissement que la plupart des applications ratent :
                          un muscle allongé se renforce, il ne s'étire pas. */}
                      {r.renforcer && (
                        <div style={{ marginTop: 13, background: "rgba(245,161,0,.1)",
                          borderLeft: `3px solid ${AMB}`, padding: "11px 13px" }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#8A5A00",
                            lineHeight: 1.55, fontFamily: F }}>{r.renforcer}</div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}

            <div style={{ fontSize: 11.5, fontWeight: 500, color: GREY, lineHeight: 1.55,
              fontFamily: F, padding: "4px 2px 0" }}>
              Ces routines viennent de ta posture, de ton métier et de tes antécédents.
              Elles complètent l'entraînement, elles ne le remplacent pas.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Card({ children, delay }) {
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(15,25,35,.06)",
      borderRadius: 22, padding: 16, marginBottom: 12,
      boxShadow: "0 2px 10px rgba(15,25,35,.05)",
      animation: "moUp .55s cubic-bezier(.22,1,.36,1) both", animationDelay: delay }}>
      {children}
    </div>
  );
}
