// ─── RaisonnementCoach.jsx ───────────────────────────────────────────────────
// Affiche la pensée du coach IA qui a produit le programme actif.
// La donnée existe depuis toujours (prog.reflexion) mais n'était jamais montrée.
// On n'affiche QUE les points principaux — pas le JSON brut.
import useScrollTop from "../../../hooks/useScrollTop.js";
import { FONT } from "../../../data/constants.js";
import { I } from "../../../components/ui/Icon.jsx";

const F    = FONT;
const BL   = "#3B5BFB";
const GRN  = "#0B8A5F";
const AMB  = "#F5A100";
const RED  = "#EF4444";
const GREY = "#9AA3B2";

export default function RaisonnementCoach({ prog, onClose }) {
  useScrollTop();
  const r = prog?.reflexion || null;
  const obj = r?.objectifs || null;
  const analyse = prog?.analyse || {};

  return (
    <div style={{ padding: "0 20px" }}>
      <style>{`
        @keyframes rcUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes rcAur{0%{transform:translate(-6%,-4%) scale(1)}50%{transform:translate(7%,5%) scale(1.18)}100%{transform:translate(-6%,-4%) scale(1)}}
      `}</style>

      <div style={{ padding: "14px 0 40px", maxWidth: 480, margin: "0 auto" }}>

        <div onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 6,
          padding: "0 0 8px", cursor: "pointer", animation: "rcUp .5s cubic-bezier(.22,1,.36,1) both" }}>
          <I name="chevronLeft" size={18} color={BL} />
          <span style={{ fontSize: 15, fontWeight: 700, color: BL, fontFamily: F }}>Retour</span>
        </div>

        {/* HERO */}
        <div style={{ position: "relative", borderRadius: 26, overflow: "hidden", background: "#0B0E1A",
          marginBottom: 16, clipPath: "inset(0 round 26px)",
          animation: "rcUp .6s cubic-bezier(.22,1,.36,1) both", animationDelay: ".06s" }}>
          <div style={{ position: "absolute", top: -60, left: -40, width: 230, height: 230, borderRadius: "50%",
            background: `radial-gradient(circle,${BL},transparent 66%)`, filter: "blur(20px)", opacity: .55,
            animation: "rcAur 10s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={{ position: "relative", padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", color: "#9FB0FF", fontFamily: F }}>
              RAISONNEMENT DU COACH
            </span>
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.03em", color: "#fff",
              lineHeight: 1.1, fontFamily: F }}>
              Pourquoi <span style={{ fontStyle: "italic", color: "#A9B8FF" }}>ce programme</span>
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.62)", fontFamily: F }}>
              {prog?.titre || "Programme actif"}
            </span>
          </div>
        </div>

        {!r ? (
          <Card delay=".12s">
            <Head title="RAISONNEMENT INDISPONIBLE" />
            <Empty
              title="Ce programme n'a pas de raisonnement enregistré"
              text="Les programmes générés avant cette mise à jour ne contiennent pas le détail de la réflexion. Il apparaîtra automatiquement sur ton prochain cycle." />
          </Card>
        ) : (
          <>
            {/* ── DIAGNOSTIC ── */}
            {r.diagnostic && (
              <Card delay=".12s">
                <Head title="LE DIAGNOSTIC" sub="Où tu en es, et quel est ton vrai besoin maintenant" />
                <p style={pBig}>{r.diagnostic}</p>
              </Card>
            )}

            {/* ── OBJECTIFS CT / MT / LT ── */}
            {obj && (
              <Card delay=".16s">
                <Head title="TES OBJECTIFS" sub="Court, moyen et long terme" />
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Horizon label="Court terme"  data={obj.court_terme}  color={GRN} />
                  <Horizon label="Moyen terme"  data={obj.moyen_terme}  color={BL} />
                  <Horizon label="Long terme"   data={obj.long_terme}   color="#7C5CFF" />
                </div>
              </Card>
            )}

            {/* ── PRIORITÉS ── */}
            {(r.priorites?.prioriser?.length > 0 || analyse.points_faibles?.length > 0) && (
              <Card delay=".20s">
                <Head title="CE QU'ON BOSSE EN PRIORITÉ" sub="Issu de ton analyse morphologique" />
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <TagRow label="À prioriser" color={RED}
                    items={r.priorites?.prioriser?.length ? r.priorites.prioriser : analyse.points_faibles} />
                  {r.priorites?.entretenir?.length > 0 && (
                    <TagRow label="À entretenir" color={GREY} items={r.priorites.entretenir} />
                  )}
                  {analyse.points_forts?.length > 0 && (
                    <TagRow label="Tes points forts" color={GRN} items={analyse.points_forts} />
                  )}
                </div>
              </Card>
            )}

            {/* ── STRATÉGIE ── */}
            {r.strategie && (
              <Card delay=".24s">
                <Head title="LA STRATÉGIE DU CYCLE" sub="Le compromis choisi entre sécurité, progression et motivation" />
                <p style={pBig}>{r.strategie}</p>
              </Card>
            )}

            {/* ── CHOIX D'EXERCICES ── */}
            {(r.exercices_conserves?.length > 0 || r.exercices_ecartes?.length > 0) && (
              <Card delay=".28s">
                <Head title="LES CHOIX D'EXERCICES" sub="Ce qui a été gardé, ce qui a été remplacé et pourquoi" />
                {r.exercices_conserves?.length > 0 && (
                  <div style={{ marginBottom: r.exercices_ecartes?.length ? 16 : 0 }}>
                    <SubLabel>Conservés</SubLabel>
                    {r.exercices_conserves.slice(0, 6).map((e, i) => (
                      <ExoRow key={i} nom={e?.nom} raison={e?.raison} color={GRN} />
                    ))}
                  </div>
                )}
                {r.exercices_ecartes?.length > 0 && (
                  <div>
                    <SubLabel>Écartés</SubLabel>
                    {r.exercices_ecartes.slice(0, 6).map((e, i) => (
                      <ExoRow key={i} nom={e?.nom} raison={e?.raison} remplace={e?.remplace_par} color={AMB} />
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* ── RISQUES ANTICIPÉS ── */}
            {(r.risque_blessure || r.risque_abandon || r.facteur_limitant_prevu) && (
              <Card delay=".32s">
                <Head title="CE QUE LE COACH ANTICIPE" sub="Les obstacles prévus et la parade intégrée au programme" />
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {r.risque_blessure && <RiskRow label="Zone à protéger" text={r.risque_blessure} color={RED} />}
                  {r.risque_abandon && <RiskRow label="Risque de décrochage" text={r.risque_abandon} color={AMB} />}
                  {r.facteur_limitant_prevu && <RiskRow label="Prochain mur prévu" text={r.facteur_limitant_prevu} color={BL} />}
                </div>
              </Card>
            )}

            {/* ── LECTURES ── */}
            {(r.lecture_morpho || r.lecture_historique) && (
              <Card delay=".36s">
                <Head title="CE QUE LE COACH A LU" sub="Les données sur lesquelles il s'est appuyé" />
                {r.lecture_morpho && (
                  <div style={{ marginBottom: r.lecture_historique ? 14 : 0 }}>
                    <SubLabel>Ta morphologie</SubLabel>
                    <p style={pSmall}>{r.lecture_morpho}</p>
                  </div>
                )}
                {r.lecture_historique && (
                  <div>
                    <SubLabel>Ton historique</SubLabel>
                    <p style={pSmall}>{r.lecture_historique}</p>
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sous-composants ─────────────────────────────────────────────────────────
const pBig = {
  margin: 0, fontSize: 15, fontWeight: 500, lineHeight: 1.6, color: "#0F1923", fontFamily: FONT,
};
const pSmall = {
  margin: 0, fontSize: 13.5, fontWeight: 500, lineHeight: 1.6, color: "#6B7486", fontFamily: FONT,
};

function Card({ children, delay }) {
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(15,25,35,.06)", borderRadius: 22,
      padding: 18, marginBottom: 14, boxShadow: "0 2px 10px rgba(15,25,35,.05)",
      animation: "rcUp .55s cubic-bezier(.22,1,.36,1) both", animationDelay: delay }}>
      {children}
    </div>
  );
}

function Head({ title, sub }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".06em", color: "#6B7486", fontFamily: FONT }}>
        {title}
      </span>
      {sub && <span style={{ fontSize: 12, fontWeight: 500, color: GREY, lineHeight: 1.4, fontFamily: FONT }}>{sub}</span>}
    </div>
  );
}

function SubLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".05em", color: GREY,
      fontFamily: FONT, marginBottom: 8 }}>{String(children).toUpperCase()}</div>
  );
}

function Horizon({ label, data, color }) {
  if (!data) return null;
  const cible = typeof data === "string" ? data : data.cible;
  if (!cible) return null;
  return (
    <div style={{ display: "flex", gap: 11 }}>
      <span style={{ flexShrink: 0, width: 4, borderRadius: 99, background: color }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#0F1923", fontFamily: FONT }}>{label}</span>
          {data.horizon && (
            <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: FONT }}>{data.horizon}</span>
          )}
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F1923", lineHeight: 1.5, fontFamily: FONT }}>{cible}</div>
        {data.comment && (
          <div style={{ fontSize: 12.5, fontWeight: 500, color: GREY, lineHeight: 1.5,
            fontFamily: FONT, marginTop: 3 }}>{data.comment}</div>
        )}
      </div>
    </div>
  );
}

function TagRow({ label, items, color }) {
  if (!items?.length) return null;
  return (
    <div>
      <SubLabel>{label}</SubLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.map((m, i) => (
          <span key={i} style={{ borderRadius: 99, padding: "6px 12px", fontSize: 12.5, fontWeight: 700,
            fontFamily: FONT, color,
            background: color === "#0B8A5F" ? "#E7F7F0" : color === "#EF4444" ? "#FDECEC" : "#F1F3F8" }}>
            {String(m)}
          </span>
        ))}
      </div>
    </div>
  );
}

function ExoRow({ nom, raison, remplace, color }) {
  if (!nom) return null;
  return (
    <div style={{ display: "flex", gap: 9, padding: "8px 0", borderTop: "1px solid rgba(15,25,35,.05)" }}>
      <span style={{ flexShrink: 0, width: 4, borderRadius: 99, background: color }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1923", fontFamily: FONT }}>{nom}</div>
        {raison && (
          <div style={{ fontSize: 12.5, fontWeight: 500, color: GREY, lineHeight: 1.45, fontFamily: FONT }}>{raison}</div>
        )}
        {remplace && (
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3B5BFB", fontFamily: FONT, marginTop: 2 }}>
            → remplacé par {remplace}
          </div>
        )}
      </div>
    </div>
  );
}

function RiskRow({ label, text, color }) {
  return (
    <div style={{ display: "flex", gap: 11 }}>
      <span style={{ flexShrink: 0, width: 4, borderRadius: 99, background: color }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color, fontFamily: FONT, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: "#0F1923", lineHeight: 1.5, fontFamily: FONT }}>{text}</div>
      </div>
    </div>
  );
}

function Empty({ title, text }) {
  return (
    <div style={{ padding: "14px 16px", borderRadius: 16,
      background: "linear-gradient(135deg,#F7F8FB,#EEF1FF)", border: "1px dashed rgba(59,91,251,.2)",
      display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 14.5, fontWeight: 800, color: BL, fontFamily: FONT }}>{title}</span>
      <span style={{ fontSize: 12.5, fontWeight: 500, color: "#6B7486", lineHeight: 1.5, fontFamily: FONT }}>{text}</span>
    </div>
  );
}
