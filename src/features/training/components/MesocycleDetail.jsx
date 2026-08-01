// ─── MesocycleDetail.jsx — Récupération ──────────────────────────────────────
// Chaque chiffre affiché provient de recoveryService, calculé sur les séances
// réellement validées. Aucune valeur n'est simulée : quand une donnée manque,
// la carte le dit et propose de la renseigner.
import { useState, useMemo } from "react";
import useScrollTop from "../../../hooks/useScrollTop.js";
import { FONT } from "../../../data/constants.js";
import { I } from "../../../components/ui/Icon.jsx";
import {
  getWeeklyVolume, getPerformanceTrend, getSleepData, getSleepSeries,
  getRestingHR, saveRestingHR, getMobilityData, getMotivation, saveMotivation,
  getRecoveryScore, getOvertrainingStatus, RECOVERY_WEIGHTS,
} from "../../../services/recoveryService.js";

const F    = FONT;
const BL   = "#3B5BFB";
const GRN  = "#0B8A5F";
const AMB  = "#F5A100";
const RED  = "#EF4444";
const GREY = "#9AA3B2";

const WEIGHT_LABEL = {
  sommeil: "Sommeil", charge: "Charge d'entraînement",
  fcRepos: "FC de repos", motivation: "Motivation", mobilite: "Mobilité",
};

export default function MesocycleDetail({
  prog, semC, currentWeek, WEEKS, profil, onClose,
}) {
  useScrollTop();
  const [exp, setExp]             = useState(null);
  const [sheet, setSheet]         = useState(null);
  const [hrInput, setHrInput]     = useState(60);
  const [motiInput, setMotiInput] = useState(3);
  const [tick, setTick]           = useState(0);

  const age = Number(profil?.age) || null;

  const vol   = useMemo(() => getWeeklyVolume(),              [tick]);
  const perf  = useMemo(() => getPerformanceTrend(),          [tick]);
  const sleep = useMemo(() => getSleepData(age, 7),           [age, tick]);
  const sl14  = useMemo(() => getSleepSeries(14),             [tick]);
  const hr    = useMemo(() => getRestingHR(),                 [tick]);
  const mob   = useMemo(() => getMobilityData(7),             [tick]);
  const moti  = useMemo(() => getMotivation(7),               [tick]);
  const score = useMemo(() => getRecoveryScore({ age }),      [age, tick]);
  const over  = useMemo(() => getOvertrainingStatus({ age }), [age, tick]);

  const weekIdx    = Math.min(currentWeek ?? 0, (WEEKS || []).length - 1);
  const phase      = WEEKS?.[weekIdx] || { label: "Base" };
  const phaseLabel = phase.label === "Déload" ? "Récupération"
                   : phase.label === "Pic"    ? "Pic de performance"
                   : "Accumulation";

  const saveHR   = () => { if (saveRestingHR(hrInput))   { setTick(t => t + 1); setSheet(null); } };
  const saveMoti = () => { if (saveMotivation(motiInput)) { setTick(t => t + 1); setSheet(null); } };
  const toggle   = (k) => setExp(e => (e === k ? null : k));

  return (
    <div style={{ padding: "0 20px" }}>
      <style>{`
        @keyframes mFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes mFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes mRingDraw{from{stroke-dashoffset:97}to{stroke-dashoffset:0}}
        @keyframes mAurora{0%{transform:translate(-6%,-4%) scale(1)}50%{transform:translate(7%,5%) scale(1.18)}100%{transform:translate(-6%,-4%) scale(1)}}
        @keyframes mGrowW{from{width:0}}
        @keyframes mSheet{from{transform:translateY(102%)}to{transform:translateY(0)}}
        @keyframes mBackdrop{from{opacity:0}to{opacity:1}}
        .m-nos::-webkit-scrollbar{display:none}
        .m-nos{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      <div style={{ padding: "14px 0 40px", maxWidth: 480, margin: "0 auto" }}>

        {/* ── Retour ── */}
        <div onClick={onClose} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "0 0 8px", cursor: "pointer",
          animation: "mFadeUp .5s cubic-bezier(.22,1,.36,1) both",
        }}>
          <I name="chevronLeft" size={18} color={BL} />
          <span style={{ fontSize: 15, fontWeight: 700, color: BL, fontFamily: F }}>Retour</span>
        </div>

        {/* ── HERO ── */}
        <div style={{
          position: "relative", borderRadius: 26, overflow: "hidden", background: "#0B0E1A",
          marginBottom: 16, clipPath: "inset(0 round 26px)",
          animation: "mFadeUp .6s cubic-bezier(.22,1,.36,1) both", animationDelay: ".06s",
        }}>
          <div style={{ position: "absolute", top: -60, left: -40, width: 230, height: 230, borderRadius: "50%",
            background: `radial-gradient(circle,${BL},transparent 66%)`, filter: "blur(20px)", opacity: .55,
            animation: "mAurora 10s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -70, right: -50, width: 250, height: 250, borderRadius: "50%",
            background: "radial-gradient(circle,#7C5CFF,transparent 66%)", filter: "blur(24px)", opacity: .4,
            animation: "mAurora 13s ease-in-out infinite reverse", pointerEvents: "none" }} />
          <div style={{ position: "relative", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", color: "#9FB0FF", fontFamily: F }}>
                MÉSOCYCLE · SEMAINE {weekIdx + 1} / {WEEKS?.length || 6}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
                background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.14)",
                borderRadius: 99, padding: "5px 11px", fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: F }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7C5CFF" }} />
                {phaseLabel}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 33, fontWeight: 800, letterSpacing: "-.03em", color: "#fff", lineHeight: 1, fontFamily: F }}>
                Analyse <span style={{ fontStyle: "italic", color: "#A9B8FF" }}>de charge</span>
              </span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "rgba(255,255,255,.62)", fontFamily: F }}>
                Phase {phaseLabel.toLowerCase()} · {prog?.objectif || "Hypertrophie"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, paddingTop: 2 }}>
              {(WEEKS || []).map((_, i) => (
                <span key={i} style={{ flex: 1, height: 6, borderRadius: 99,
                  background: i <= weekIdx ? "#5B8DFF" : "rgba(255,255,255,.16)" }} />
              ))}
            </div>
          </div>
        </div>

        {/* ═══ 1. VOLUME RÉEL ═══ */}
        <Card delay=".12s">
          <CardHead
            title="VOLUME RÉEL CETTE SEMAINE"
            sub="Séries validées en séance, comparées à tes seuils par muscle"
            badge={vol.available
              ? { txt: vol.globalStatus === "au-dessus" ? "Au-dessus du MRV"
                     : vol.globalStatus === "sous-seuil" ? "Sous le MEV" : "Zone optimale",
                  color: vol.globalStatus === "optimal" ? GRN : vol.globalStatus === "au-dessus" ? RED : AMB }
              : { txt: "En attente", color: GREY }}
          />

          {vol.available ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-.03em", lineHeight: .9,
                  color: vol.globalStatus === "optimal" ? GRN : vol.globalStatus === "au-dessus" ? RED : AMB,
                  fontVariantNumeric: "tabular-nums", fontFamily: F }}>{vol.totalSets}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#6B7486", fontFamily: F }}>séries validées</span>
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: GREY, fontFamily: F, marginBottom: 16 }}>
                sur {vol.sessions} séance{vol.sessions > 1 ? "s" : ""} · {vol.totalTonnage.toLocaleString("fr-FR")} kg déplacés
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {vol.byMuscle.map((g, i) => {
                  const lm  = g.landmarks;
                  const max = lm ? lm.MRV * 1.25 : Math.max(g.sets * 1.3, 10);
                  const col = g.statut === "au-dessus" ? RED : g.statut === "optimal" ? GRN : AMB;
                  return (
                    <div key={g.groupe} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#0F1923", fontFamily: F }}>{g.groupe}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: col, fontFamily: F,
                          fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                          {g.sets} série{g.sets > 1 ? "s" : ""}
                          {lm && <span style={{ fontWeight: 600, color: GREY }}> · MEV {lm.MEV} → MRV {lm.MRV}</span>}
                        </span>
                      </div>
                      <div style={{ position: "relative", height: 8, borderRadius: 99, background: "#EEF0F5" }}>
                        {lm && (
                          <>
                            <span style={{ position: "absolute", top: -2, bottom: -2, width: 2, borderRadius: 2,
                              left: `${Math.min(98, (lm.MEV / max) * 100)}%`, background: "#C3CDF7" }} />
                            <span style={{ position: "absolute", top: -2, bottom: -2, width: 2, borderRadius: 2,
                              left: `${Math.min(98, (lm.MRV / max) * 100)}%`, background: "#F3B7B7" }} />
                          </>
                        )}
                        <div style={{ height: "100%", borderRadius: 99, background: col,
                          width: `${Math.min(100, (g.sets / max) * 100)}%`,
                          animation: `mGrowW .9s cubic-bezier(.22,1,.36,1) ${(0.3 + i * 0.06).toFixed(2)}s both` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <Empty title="Aucune séance validée cette semaine"
              text="Ce compteur ne prend que les séries que tu valides pendant une séance. Lance ta prochaine séance et il se remplira tout seul." />
          )}

          <Reveal open={exp === "vol"} onToggle={() => toggle("vol")} label="Comment ce chiffre est calculé ?">
            <p style={{ margin: "0 0 10px" }}>
              On additionne uniquement les séries que tu as <b style={{ color: "#0F1923" }}>validées</b> en séance
              depuis lundi. Les séances planifiées mais non faites ne comptent pas.
            </p>
            <p style={{ margin: 0 }}>
              <b style={{ color: "#2540E0" }}>MEV</b> : volume minimum pour progresser ·{" "}
              <b style={{ color: GRN }}>MAV</b> : zone de progression optimale ·{" "}
              <b style={{ color: "#C23B3B" }}>MRV</b> : maximum que tu peux récupérer.
              Les seuils sont propres à chaque muscle — un pectoral ne récupère pas comme un mollet.
            </p>
          </Reveal>
        </Card>

        {/* ═══ 2. PERFORMANCE ═══ */}
        <Card delay=".18s">
          <CardHead
            title="PERFORMANCE"
            sub="Progression du 1RM estimé entre tes deux dernières séances"
            badge={perf.available
              ? { txt: perf.trend === "hausse" ? "En hausse" : perf.trend === "baisse" ? "En baisse" : "Stable",
                  color: perf.trend === "hausse" ? GRN : perf.trend === "baisse" ? RED : AMB }
              : { txt: "En attente", color: GREY }}
          />

          {perf.available ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-.03em", lineHeight: .9,
                  color: perf.trend === "hausse" ? GRN : perf.trend === "baisse" ? RED : AMB,
                  fontVariantNumeric: "tabular-nums", fontFamily: F }}>
                  {perf.avgDelta > 0 ? "+" : ""}{perf.avgDelta}%
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#6B7486", fontFamily: F }}>
                  sur {perf.comparable.length} exercice{perf.comparable.length > 1 ? "s" : ""}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {perf.comparable.slice(0, 5).map((e, i) => (
                  <div key={e.exNom} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 10, padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid rgba(15,25,35,.05)" }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1923", fontFamily: F,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.exNom}</div>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: GREY, fontFamily: F }}>
                        {e.prev.kg} kg × {e.prev.reps} → {e.last.kg} kg × {e.last.reps}
                      </div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", fontFamily: F,
                      color: e.deltaPct > 0 ? GRN : e.deltaPct < 0 ? RED : GREY }}>
                      {e.deltaPct > 0 ? "+" : ""}{e.deltaPct}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Empty title={perf.needSecondSession ? "Encore une séance" : "Aucune séance validée"} text={perf.reason} />
          )}

          <Reveal open={exp === "perf"} onToggle={() => toggle("perf")} label="Comment c'est mesuré ?">
            <p style={{ margin: 0 }}>
              Pour chaque exercice on garde ta <b style={{ color: "#0F1923" }}>meilleure série</b> de chaque séance,
              convertie en 1RM estimé (formule d'Epley). On compare ensuite les deux dernières séances.
              Plus de charge à répétitions égales, ou plus de répétitions à charge égale, se traduit par une hausse.
              Tant qu'un exercice n'a qu'une seule séance, aucune progression n'est affichée — un « +0 % » serait faux.
            </p>
          </Reveal>
        </Card>

        {/* ═══ 3. SCORE DE RÉCUPÉRATION ═══ */}
        <Card delay=".24s">
          <CardHead
            title="SCORE DE RÉCUPÉRATION"
            sub="Pondéré sur les données que tu as réellement enregistrées"
            badge={score.available
              ? { txt: `${score.coverage} % de couverture`, color: score.coverage >= 70 ? GRN : AMB }
              : { txt: "En attente", color: GREY }}
          />

          {score.available ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 16 }}>
                <div style={{ position: "relative", width: 92, height: 92, flex: "none" }}>
                  <svg width="92" height="92" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F1F3F8" strokeWidth="4" />
                    <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="4" strokeLinecap="round"
                      stroke={score.score >= 65 ? GRN : score.score >= 50 ? AMB : RED}
                      strokeDasharray={`${Math.round(97 * (score.score / 100))} 97`}
                      transform="rotate(-90 18 18)"
                      style={{ animation: "mRingDraw 1.1s cubic-bezier(.22,1,.36,1) .4s both" }} />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", animation: "mFadeIn .6s ease .9s both" }}>
                    <span style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, fontFamily: F,
                      color: score.score >= 65 ? GRN : score.score >= 50 ? AMB : RED }}>{score.score}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: GREY, fontFamily: F }}>/ 100</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#0F1923", fontFamily: F, marginBottom: 4 }}>
                    {score.label}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: "#6B7486", lineHeight: 1.45, fontFamily: F }}>
                    {score.missing.length === 0
                      ? "Toutes les composantes sont renseignées."
                      : `Calculé sans ${score.missing.map(m => WEIGHT_LABEL[m].toLowerCase()).join(", ")}.`}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {score.parts.map(p => (
                  <div key={p.key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1923", fontFamily: F }}>
                        {WEIGHT_LABEL[p.key]}
                        <span style={{ fontWeight: 600, color: GREY }}> · {p.weight} %</span>
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: 800, fontFamily: F,
                        color: p.score >= 70 ? GRN : p.score >= 45 ? AMB : RED }}>{p.score}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 99, background: "#EEF0F5", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 99, width: `${p.score}%`,
                        background: p.score >= 70 ? GRN : p.score >= 45 ? AMB : RED,
                        animation: "mGrowW .9s cubic-bezier(.22,1,.36,1) .5s both" }} />
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 500, color: GREY, fontFamily: F }}>{p.detail}</span>
                  </div>
                ))}
              </div>

              {score.missing.length > 0 && (
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  {score.missing.map(m => (
                    <MissingRow key={m} label={WEIGHT_LABEL[m]} weight={RECOVERY_WEIGHTS[m]}
                      onAction={m === "fcRepos" ? () => setSheet("fc")
                              : m === "motivation" ? () => setSheet("motivation") : null} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <Empty title="Pas encore de données" text={score.reason} />
          )}

          <Reveal open={exp === "score"} onToggle={() => toggle("score")} label="Comment ce score est calculé ?">
            <p style={{ margin: "0 0 10px" }}>
              Cinq composantes pondérées : sommeil {RECOVERY_WEIGHTS.sommeil} %, charge {RECOVERY_WEIGHTS.charge} %,
              FC de repos {RECOVERY_WEIGHTS.fcRepos} %, motivation {RECOVERY_WEIGHTS.motivation} %,
              mobilité {RECOVERY_WEIGHTS.mobilite} %.
            </p>
            <p style={{ margin: 0 }}>
              Une composante sans donnée est <b style={{ color: "#0F1923" }}>exclue du calcul</b> plutôt que remplacée
              par une valeur par défaut. Le score est ramené sur 100 au prorata des composantes disponibles,
              et le pourcentage de couverture t'indique sur quelle part de l'information il repose.
            </p>
          </Reveal>
        </Card>

        {/* ═══ 4. FC DE REPOS ═══ */}
        <Card delay=".30s">
          <CardHead
            title="FRÉQUENCE CARDIAQUE DE REPOS"
            sub="Mesurée au réveil, avant de sortir du lit"
            badge={hr.available && !hr.partial
              ? { txt: hr.status === "stable" ? "Stable" : hr.status,
                  color: (hr.status === "stable" || hr.status === "abaissée") ? GRN : hr.delta >= 7 ? RED : AMB }
              : { txt: "À renseigner", color: GREY }}
          />

          {hr.available && !hr.partial ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-.03em", lineHeight: .9,
                  fontVariantNumeric: "tabular-nums", fontFamily: F,
                  color: hr.delta >= 7 ? RED : hr.delta >= 4 ? AMB : GRN }}>{hr.recent}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#6B7486", fontFamily: F }}>bpm sur 7 j</span>
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: GREY, fontFamily: F, marginBottom: 14 }}>
                Référence 30 j : {hr.baseline} bpm · écart {hr.delta > 0 ? "+" : ""}{hr.delta} bpm
              </div>
              <HRChart series={hr.series} baseline={hr.baseline} />
              <button onClick={() => setSheet("fc")} style={btnGhost}>Saisir la mesure du jour</button>
            </>
          ) : (
            <>
              <Empty
                title={hr.partial ? "Ligne de base en cours" : "Aucune mesure enregistrée"}
                text={hr.partial
                  ? `Dernière mesure : ${hr.latest} bpm. ${hr.reason}.`
                  : "Une hausse durable de ta FC au réveil est l'un des signaux les plus précoces de fatigue accumulée. Mesure-la allongé, au réveil, pendant une minute."} />
              <button onClick={() => setSheet("fc")} style={btnPrimary}>Enregistrer ma FC au réveil</button>
            </>
          )}

          <Reveal open={exp === "hr"} onToggle={() => toggle("hr")} label="Pourquoi cette mesure ?">
            <p style={{ margin: "0 0 10px" }}>
              La FC de repos remonte quand le système nerveux reste en tension : charge trop lourde, sommeil court,
              stress. Une élévation de <b style={{ color: "#0F1923" }}>5 bpm ou plus</b> au-dessus de ta référence
              personnelle sur plusieurs jours signale une récupération incomplète.
            </p>
            <p style={{ margin: 0, color: GREY }}>
              La synchronisation automatique avec Apple Santé, Garmin, Whoop ou Oura demande une version native
              de l'application. En attendant, la saisie manuelle alimente exactement le même calcul.
            </p>
          </Reveal>
        </Card>

        {/* ═══ 5. SOMMEIL ═══ */}
        <Card delay=".36s">
          <CardHead
            title="SOMMEIL"
            sub={sleep.targetInfo?.available
              ? `Cible ${sleep.targetInfo.min}–${sleep.targetInfo.max} h pour ta tranche d'âge (${sleep.targetInfo.tranche})`
              : "Renseigne ton âge dans ton profil pour calculer ta cible"}
            badge={sleep.available && sleep.target
              ? { txt: sleep.avg >= sleep.target ? "Au niveau" : "Sous la cible",
                  color: sleep.avg >= sleep.target ? GRN : AMB }
              : { txt: "En attente", color: GREY }}
          />

          {sleep.available ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-.03em", lineHeight: .9,
                  fontVariantNumeric: "tabular-nums", fontFamily: F,
                  color: sleep.target && sleep.avg >= sleep.target ? GRN : AMB }}>
                  {String(sleep.avg).replace(".", ",")}
                </span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#6B7486", fontFamily: F }}>h de moyenne</span>
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: GREY, fontFamily: F, marginBottom: 14 }}>
                {sleep.days} nuit{sleep.days > 1 ? "s" : ""} renseignée{sleep.days > 1 ? "s" : ""} sur 7
                {sleep.target ? ` · cible ${sleep.target} h` : ""}
                {sleep.deficitStreak >= 2 ? ` · ${sleep.deficitStreak} nuits d'affilée sous la cible` : ""}
              </div>
              <SleepChart series={sl14} target={sleep.target} />
            </>
          ) : (
            <Empty title="Aucune nuit renseignée"
              text="Note ton sommeil depuis l'onglet Aujourd'hui pour activer cette analyse et la composante la plus lourde du score de récupération." />
          )}

          <Reveal open={exp === "sleep"} onToggle={() => toggle("sleep")} label="D'où vient la cible ?">
            <p style={{ margin: 0 }}>
              {sleep.targetInfo?.available
                ? <>Ta cible de <b style={{ color: "#0F1923" }}>{sleep.targetInfo.min} à {sleep.targetInfo.max} h</b> vient
                    des recommandations de la National Sleep Foundation pour la tranche {sleep.targetInfo.tranche}.
                    Elle est calculée depuis l'âge de ton profil, pas choisie à la main.</>
                : <>La cible se calcule automatiquement à partir de ton âge selon les recommandations de la
                    National Sleep Foundation. Renseigne ton âge dans ton profil pour l'activer.</>}
            </p>
          </Reveal>
        </Card>

        {/* ═══ 6. SURENTRAÎNEMENT ═══ */}
        <Card delay=".42s">
          <CardHead
            title="DÉTECTION DU SURENTRAÎNEMENT"
            sub="Croisement du volume, des performances, du sommeil et de la FC"
            badge={over.available
              ? { txt: `Fiabilité ${over.confidence} %`, color: over.confidence >= 60 ? GRN : AMB }
              : { txt: "En attente", color: GREY }}
          />

          {over.available ? (
            <>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.1,
                color: over.color, fontFamily: F, marginBottom: 16 }}>{over.label}</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {over.warnings.map((w, i) => <Signal key={`w${i}`} type="warn" text={w} />)}
                {over.positives.map((p, i) => <Signal key={`p${i}`} type="ok" text={p} />)}
              </div>

              {over.unavailable.length > 0 && (
                <div style={{ marginTop: 14, padding: "11px 13px", borderRadius: 12, background: "#F7F8FB",
                  fontSize: 12, fontWeight: 500, color: "#6B7486", lineHeight: 1.5, fontFamily: F }}>
                  Non pris en compte faute de données : {over.unavailable.join(", ").toLowerCase()}.
                  Plus tu en renseignes, plus ce statut devient fiable.
                </div>
              )}
            </>
          ) : (
            <Empty title="Évaluation impossible pour l'instant" text={over.reason} />
          )}

          <Reveal open={exp === "over"} onToggle={() => toggle("over")} label="Comment ce statut est déterminé ?">
            <p style={{ margin: "0 0 10px" }}>
              Chaque signal négatif ajoute des points de risque : sommeil sous la cible plusieurs nuits (+3),
              FC de repos nettement élevée (+3), performances en baisse (+3), volume au-dessus du MRV (+2),
              motivation basse (+2).
            </p>
            <p style={{ margin: 0 }}>
              Le total détermine le niveau, de « récupération excellente » à « risque de surentraînement ».
              Aucun statut n'est affiché sans au moins un signal mesuré — c'est pour ça que chaque ligne
              ci-dessus renvoie à une donnée précise.
            </p>
          </Reveal>
        </Card>

        {/* ═══ 7. RÉCUPÉRATION ACTIVE ═══ */}
        <Card delay=".48s">
          <CardHead title="RÉCUPÉRATION ACTIVE" sub="Mobilité et ressenti hebdomadaire" />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1923", fontFamily: F }}>Mobilité · 7 j</span>
                <span style={{ fontSize: 13, fontWeight: 800, fontFamily: F,
                  color: mob.count >= 4 ? GRN : mob.count > 0 ? AMB : GREY }}>{mob.count} / 7 j</span>
              </div>
              <div style={{ height: 7, borderRadius: 99, background: "#EEF0F5", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 99, width: `${Math.max(2, mob.pct)}%`,
                  background: mob.count >= 4 ? GRN : mob.count > 0 ? AMB : "#E1E5EE",
                  animation: "mGrowW .9s cubic-bezier(.22,1,.36,1) .5s both" }} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1923", fontFamily: F }}>Motivation · 7 j</span>
                <span style={{ fontSize: 13, fontWeight: 800, fontFamily: F,
                  color: !moti.available ? GREY : moti.avg >= 4 ? GRN : moti.avg >= 3 ? AMB : RED }}>
                  {moti.available ? `${moti.avg} / 5` : "—"}
                </span>
              </div>
              {moti.available ? (
                <div style={{ height: 7, borderRadius: 99, background: "#EEF0F5", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 99, width: `${moti.pct}%`,
                    background: moti.avg >= 4 ? GRN : moti.avg >= 3 ? AMB : RED,
                    animation: "mGrowW .9s cubic-bezier(.22,1,.36,1) .55s both" }} />
                </div>
              ) : (
                <button onClick={() => setSheet("motivation")} style={btnGhost}>Faire mon check-in</button>
              )}
            </div>
          </div>
        </Card>

      </div>

      {/* ═══ FEUILLES ═══ */}
      {sheet === "fc" && (
        <Sheet onClose={() => setSheet(null)} eyebrow="AU RÉVEIL" title="Fréquence cardiaque de repos">
          <p style={{ fontSize: 13, color: "#6B7486", lineHeight: 1.5, margin: "0 0 18px", fontFamily: F }}>
            Mesure allongé, juste après le réveil, avant de te lever. Une minute suffit.
          </p>
          <Stepper value={hrInput} unit="bpm" step={1} min={30} max={140} onChange={setHrInput} color={BL} />
          <button onClick={saveHR} style={{ ...btnPrimary, marginTop: 22 }}>Enregistrer</button>
        </Sheet>
      )}

      {sheet === "motivation" && (
        <Sheet onClose={() => setSheet(null)} eyebrow="CHECK-IN" title="Comment tu te sens cette semaine ?">
          <div style={{ display: "flex", gap: 8, margin: "6px 0 14px" }}>
            {[1, 2, 3, 4, 5].map(v => {
              const on = motiInput === v;
              return (
                <button key={v} onClick={() => setMotiInput(v)} style={{
                  flex: 1, padding: "16px 0", borderRadius: 14, cursor: "pointer", fontFamily: F,
                  border: on ? `1.5px solid ${BL}` : "1px solid rgba(15,25,35,.08)",
                  background: on ? "rgba(59,91,251,.08)" : "#fff",
                  color: on ? BL : "#6B7486", fontSize: 19, fontWeight: 800,
                }}>{v}</button>
              );
            })}
          </div>
          <p style={{ fontSize: 12.5, color: GREY, textAlign: "center", margin: "0 0 18px", fontFamily: F }}>
            1 = épuisé · 5 = en pleine forme
          </p>
          <button onClick={saveMoti} style={{ ...btnPrimary, marginTop: 0 }}>Valider mon ressenti</button>
        </Sheet>
      )}
    </div>
  );
}

// ─── Sous-composants ─────────────────────────────────────────────────────────
const cardStyle = {
  background: "#fff", border: "1px solid rgba(15,25,35,.06)", borderRadius: 22,
  padding: 18, marginBottom: 14, boxShadow: "0 2px 10px rgba(15,25,35,.05)",
};
const btnPrimary = {
  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  background: BL, border: "none", borderRadius: 14, padding: 15, cursor: "pointer",
  color: "#fff", fontSize: 15, fontWeight: 800, fontFamily: F,
  boxShadow: "0 10px 26px rgba(59,91,251,.36)", marginTop: 14,
};
const btnGhost = {
  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
  background: "#fff", border: "1px solid rgba(59,91,251,.25)", borderRadius: 13, padding: 13,
  cursor: "pointer", color: BL, fontSize: 13.5, fontWeight: 700, fontFamily: F, marginTop: 14,
};

function Card({ children, delay }) {
  return (
    <div style={{ ...cardStyle, animation: "mFadeUp .55s cubic-bezier(.22,1,.36,1) both", animationDelay: delay }}>
      {children}
    </div>
  );
}

function CardHead({ title, sub, badge }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".06em", color: "#6B7486",
          lineHeight: 1.3, fontFamily: F }}>{title}</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: GREY, lineHeight: 1.4, fontFamily: F }}>{sub}</span>
      </div>
      {badge && (
        <span style={{ flexShrink: 0, borderRadius: 99, padding: "5px 11px", whiteSpace: "nowrap",
          fontSize: 11, fontWeight: 800, fontFamily: F, color: badge.color,
          background: badge.color === GRN ? "#E7F7F0" : badge.color === RED ? "#FDECEC"
                    : badge.color === AMB ? "#FEF3E2" : "#F6F7F9" }}>{badge.txt}</span>
      )}
    </div>
  );
}

function Empty({ title, text }) {
  return (
    <div style={{ padding: "14px 16px", borderRadius: 16,
      background: "linear-gradient(135deg,#F7F8FB,#EEF1FF)", border: "1px dashed rgba(59,91,251,.2)",
      display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 14.5, fontWeight: 800, color: BL, fontFamily: F }}>{title}</span>
      <span style={{ fontSize: 12.5, fontWeight: 500, color: "#6B7486", lineHeight: 1.5, fontFamily: F }}>{text}</span>
    </div>
  );
}

function Signal({ type, text }) {
  const ok = type === "ok";
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
      <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: 7, marginTop: 1,
        display: "grid", placeItems: "center",
        background: ok ? "#E7F7F0" : "#FEF3E2", color: ok ? GRN : "#B37400",
        fontSize: 12, fontWeight: 800, fontFamily: F }}>{ok ? "✓" : "!"}</span>
      <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.45, fontFamily: F,
        color: ok ? "#0F1923" : "#8A5A00" }}>{text}</span>
    </div>
  );
}

function MissingRow({ label, weight, onAction }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
      borderRadius: 12, background: "#F7F8FB", border: "1px dashed rgba(15,25,35,.1)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#6B7486", fontFamily: F }}>{label}</div>
        <div style={{ fontSize: 11, fontWeight: 500, color: GREY, fontFamily: F }}>
          Donnée indisponible · {weight} % du score
        </div>
      </div>
      {onAction && (
        <button onClick={onAction} style={{ flexShrink: 0, background: "rgba(59,91,251,.1)", border: "none",
          borderRadius: 9, padding: "7px 12px", cursor: "pointer",
          fontSize: 12, fontWeight: 700, color: BL, fontFamily: F }}>Renseigner</button>
      )}
    </div>
  );
}

function Reveal({ open, onToggle, label, children }) {
  return (
    <>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginTop: 14 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={BL}
          strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d={open ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 700, color: BL, fontFamily: F }}>{label}</span>
      </div>
      {open && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(15,25,35,.06)",
          fontSize: 13, color: "#6B7486", lineHeight: 1.6, fontFamily: F }}>{children}</div>
      )}
    </>
  );
}

function Sheet({ onClose, eyebrow, title, children }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 610,
        background: "rgba(11,15,31,.5)", backdropFilter: "blur(3px)", animation: "mBackdrop .3s ease both" }} />
      <div className="m-nos" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 611,
        background: "#fff", borderRadius: "28px 28px 0 0", padding: "8px 20px 26px",
        maxHeight: "88%", overflowY: "auto", boxShadow: "0 -12px 40px rgba(11,15,31,.28)",
        animation: "mSheet .45s cubic-bezier(.22,1,.36,1) both" }}>
        <div style={{ width: 38, height: 5, borderRadius: 99, background: "#E1E5EE", margin: "8px auto 16px" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", color: GREY, fontFamily: F }}>{eyebrow}</span>
            <span style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.15,
              color: "#0F1923", fontFamily: F }}>{title}</span>
          </div>
          <div onClick={onClose} style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0,
            cursor: "pointer", background: "#F1F3F8", display: "grid", placeItems: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280"
              strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </div>
        </div>
        {children}
      </div>
    </>
  );
}

function Stepper({ value, unit, step, min, max, onChange, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div onClick={() => onChange(Math.max(min, value - step))}
        style={{ width: 52, height: 52, borderRadius: 16, background: "#F1F3F8", flexShrink: 0,
          display: "grid", placeItems: "center", cursor: "pointer" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F1923"
          strokeWidth="2.6" strokeLinecap="round"><path d="M5 12h14" /></svg>
      </div>
      <div style={{ flex: 1, textAlign: "center" }}>
        <span style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-.03em", color: "#0F1923",
          fontVariantNumeric: "tabular-nums", fontFamily: F }}>{value}</span>
        <span style={{ fontSize: 16, fontWeight: 600, color: GREY, fontFamily: F }}> {unit}</span>
      </div>
      <div onClick={() => onChange(Math.min(max, value + step))}
        style={{ width: 52, height: 52, borderRadius: 16, background: color, flexShrink: 0,
          display: "grid", placeItems: "center", cursor: "pointer", boxShadow: `0 8px 18px ${color}66` }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff"
          strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      </div>
    </div>
  );
}

function SleepChart({ series, target }) {
  const max = Math.max(...series.map(s => s.value), target || 8, 1);
  return (
    <div style={{ background: "#F7F8FB", borderRadius: 16, padding: "15px 15px 12px",
      display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".05em", color: "#6B7486", fontFamily: F }}>
          SOMMEIL · 14 JOURS
        </span>
        {target && <span style={{ fontSize: 11, fontWeight: 700, color: GREY, fontFamily: F }}>cible {target} h</span>}
      </div>
      <div style={{ position: "relative", height: 74, display: "flex", alignItems: "flex-end", gap: 4 }}>
        {target && (
          <div style={{ position: "absolute", left: 0, right: 0, zIndex: 2,
            top: `${(1 - target / max) * 100}%`, borderTop: "1.5px dashed #A9B8FF" }} />
        )}
        {series.map((s, i) => {
          const has  = s.value > 0;
          const last = i === series.length - 1;
          const pct  = has ? Math.max(10, (s.value / max) * 100) : 8;
          return (
            <div key={i} style={{ flex: 1, display: "flex", alignItems: "flex-end", height: "100%" }}>
              <div style={{ width: "100%", height: `${pct}%`, borderRadius: 4,
                background: !has ? "#E1E5EE"
                  : last ? "linear-gradient(180deg,#12B981,#0BA36B)"
                  : (target && s.value >= target) ? "#A9E3CB" : "#E1E5EE" }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: GREY, fontFamily: F }}>{fmtShort(series[0]?.date)}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: GRN, fontFamily: F }}>aujourd'hui</span>
      </div>
    </div>
  );
}

function HRChart({ series, baseline }) {
  if (!series?.length) return null;
  const W = 300, H = 90, P = 6;
  const vals = series.map(s => s.bpm);
  const hi = Math.max(...vals, baseline) + 2, lo = Math.min(...vals, baseline) - 2;
  const sp = (hi - lo) || 1;
  const pts = series.map((s, i) => ({
    x: P + (series.length === 1 ? (W - 2 * P) / 2 : (i / (series.length - 1)) * (W - 2 * P)),
    y: P + (H - 2 * P) - ((s.bpm - lo) / sp) * (H - 2 * P),
  }));
  const baseY = P + (H - 2 * P) - ((baseline - lo) / sp) * (H - 2 * P);
  return (
    <div style={{ background: "#F7F8FB", borderRadius: 16, padding: "14px 14px 10px" }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".05em", color: "#6B7486",
        fontFamily: F, marginBottom: 10 }}>
        FC AU RÉVEIL · {series.length} MESURE{series.length > 1 ? "S" : ""}
      </div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
        style={{ display: "block", overflow: "visible" }}>
        <line x1={P} x2={W - P} y1={baseY} y2={baseY} stroke="#C3CDF7" strokeWidth="1.2" strokeDasharray="5 4" />
        <text x={W - P} y={baseY - 5} fontSize="9" fill="#6B7486" textAnchor="end" fontWeight="700" fontFamily={F}>
          réf. {baseline}
        </text>
        <polyline points={pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
          fill="none" stroke={BL} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 4.5 : 2.5}
            fill={i === pts.length - 1 ? BL : "#fff"} stroke={i === pts.length - 1 ? "#fff" : "#C6CEDE"}
            strokeWidth={i === pts.length - 1 ? 2 : 1.5} />
        ))}
      </svg>
    </div>
  );
}

function fmtShort(iso) {
  if (!iso) return "";
  const p = String(iso).split("-");
  return p.length === 3 ? `${p[2]}/${p[1]}` : iso;
}
