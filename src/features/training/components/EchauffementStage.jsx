// ─── ÉTAPE ÉCHAUFFEMENT DU LECTEUR DE SÉANCE ────────────────────────────────
// L'échauffement était calculé (echauffementService) et affiché sur la fiche de
// séance, mais le lecteur démarrait directement sur l'exercice 1. Résultat :
// l'athlète qui lance sa séance depuis le mode focus ne le voyait jamais.
//
// Cette étape s'intercale AVANT le premier exercice. Elle est passable en un
// geste — un échauffement qu'on ne peut pas sauter est un échauffement qui fait
// abandonner le lecteur, et l'athlète le saute alors pour de bon.
//
// Les routines viennent de la morphologie réelle quand il y en a. Seules celles
// marquées "avant_seance" sont reprises : une ouverture de hanche tenue 40 s ou
// une respiration du soir n'ont pas leur place juste avant des charges lourdes —
// l'étirement statique prolongé réduit la production de force sur les minutes
// qui suivent. Ces routines-là restent à leur moment, matin ou soir.

import { T, F, MON, NUM, GL, I } from "./FocusModeStages.jsx";

export default function EchauffementStage({ echauffement, onDemarrer, onPasser, C }) {
  const blocs = echauffement?.blocs || [];
  const minutes = echauffement?.minutes || 0;
  const montee = echauffement?.montee || [];

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 18px 24px", position: "relative", zIndex: 10 }}>

      {/* Durée annoncée : l'athlète décide en connaissance de cause. */}
      <div style={{ textAlign: "center", marginTop: 8, marginBottom: 20 }}>
        <div style={{ fontFamily: MON, fontSize: 11, fontWeight: 600, color: T.ac,
                      letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Échauffement
        </div>
        <div style={{ fontFamily: F, fontSize: 40, fontWeight: 700, color: T.t1,
                      letterSpacing: -1, marginTop: 6, ...NUM }}>
          {minutes} min
        </div>
        {montee.length > 0 && (
          <div style={{ fontFamily: F, fontSize: 13, color: T.t3, marginTop: 4 }}>
            + montée en charge sur le premier mouvement
          </div>
        )}
      </div>

      {/* Consigne écrite par l'IA pour CETTE séance, quand elle existe. */}
      {echauffement?.noteIA && (
        <div style={{ background: T.surf, border: `1px solid ${T.bd}`, borderRadius: 16,
                      padding: 14, marginBottom: 16, boxShadow: C?.shadow }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <I n="bulb" sz={16} c={T.ac} />
            <div style={{ fontFamily: F, fontSize: 13.5, color: T.t2, lineHeight: 1.5 }}>
              {echauffement.noteIA}
            </div>
          </div>
        </div>
      )}

      {blocs.map((b) => (
        <div key={b.cle} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between",
                        marginBottom: 8 }}>
            <span style={{ fontFamily: F, fontSize: 15, fontWeight: 700, color: T.t1 }}>
              {b.titre}
            </span>
            <span style={{ fontFamily: MON, fontSize: 11, fontWeight: 600, color: T.t4, ...NUM }}>
              {b.minutes} min
            </span>
          </div>
          {b.but && (
            <div style={{ fontFamily: F, fontSize: 12.5, color: T.t3, marginBottom: 10,
                          lineHeight: 1.45 }}>
              {b.but}
            </div>
          )}
          <div style={{ background: T.surf, border: `1px solid ${T.bd}`, borderRadius: 16,
                        overflow: "hidden", boxShadow: C?.shadow }}>
            {b.exercices.map((e, i) => (
              <div key={`${b.cle}-${i}`}
                   style={{ padding: "12px 14px",
                            borderTop: i ? `1px solid ${T.bd}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: T.t1 }}>
                    {e.nom}
                  </span>
                  <span style={{ fontFamily: MON, fontSize: 12, fontWeight: 600,
                                 color: T.ac, whiteSpace: "nowrap", ...NUM }}>
                    {e.duree}
                  </span>
                </div>
                {e.comment && (
                  <div style={{ fontFamily: F, fontSize: 12.5, color: T.t3,
                                marginTop: 4, lineHeight: 1.45 }}>
                    {e.comment}
                  </div>
                )}
                {e.origine && (
                  <div style={{ fontFamily: MON, fontSize: 10, color: T.t4, marginTop: 6,
                                letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {e.origine}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* La montée en charge est annoncée ici mais se déroule dans l'exercice :
          elle appartient au mouvement, pas à la préparation générale. */}
      {montee.length > 0 && (
        <div style={{ ...GL, borderRadius: 16, padding: 14, marginBottom: 20 }}>
          <div style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: T.t1,
                        marginBottom: 6 }}>
            Puis montée en charge
          </div>
          <div style={{ fontFamily: F, fontSize: 12.5, color: T.t3, lineHeight: 1.45 }}>
            {montee.map(m => `${m.kg} kg × ${m.reps}`).join("  ·  ")}
            {" — "}elle démarre automatiquement sur le premier exercice.
          </div>
        </div>
      )}

      <button className="fm-tap" onClick={onDemarrer}
        style={{ width: "100%", padding: "18px", borderRadius: 18, border: "none",
                 background: T.ac, color: "#fff", fontFamily: F, fontSize: 17,
                 fontWeight: 700, boxShadow: `0 8px 24px ${T.acGlow}`, cursor: "pointer" }}>
        Échauffement terminé
      </button>

      <button className="fm-tap" onClick={onPasser}
        style={{ width: "100%", padding: "14px", marginTop: 10, borderRadius: 16,
                 border: "none", background: "transparent", color: T.t3,
                 fontFamily: F, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
        Passer l'échauffement
      </button>
    </div>
  );
}
