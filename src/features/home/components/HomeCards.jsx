// @ts-check
// ─── MorphoCoach · HomeCards — refonte visuelle premium dark ──────────────────
// IMPORTANT : ce fichier ne change aucune donnée métier. Il ne fait que
// présenter les mêmes props dans la nouvelle direction artistique de l'accueil.
import { C, FONT, DARK } from "../../../data/constants.js";
import { I, ID } from "../../../components/ui/Icon.jsx";
import coachRobot from "./coachRobot.png";

const HOME_HERO_PEXELS_ID = 16996376;
const HOME_HERO_SRC = `https://images.pexels.com/photos/${HOME_HERO_PEXELS_ID}/pexels-photo-${HOME_HERO_PEXELS_ID}.jpeg`;

const card = {
  background: "rgba(15,19,27,0.92)",
  border: "1px solid rgba(92,119,255,0.20)",
  borderRadius: 22,
  boxShadow: "0 12px 34px rgba(0,0,0,0.22)",
};

const sectionTitle = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: DARK.text,
  fontFamily: FONT,
};

const muted = DARK.dimStrong || "#A7AFBF";
const blue = C.accent || "#3C5BFF";
const green = C.green || "#12B76A";

function n(v, fallback = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

function fmt(v) {
  return Math.round(n(v)).toLocaleString("fr-FR");
}

function pct(value, total) {
  if (!total || total <= 0) return 0;
  return Math.max(0, Math.min(100, (n(value) / n(total)) * 100));
}

function firstDefined(...values) {
  return values.find(v => v !== undefined && v !== null && v !== "");
}

function getSession(calSess, prog) {
  const raw = calSess || {};
  const today = new Date();
  const keys = [
    "today",
    today.toISOString().slice(0, 10),
    today.toLocaleDateString("fr-FR", { weekday: "long" }).toLowerCase(),
  ];
  for (const k of keys) {
    if (raw?.[k]) return raw[k];
  }
  if (Array.isArray(raw)) return raw[0] || null;
  return raw?.session || raw?.current || raw?.seance || null;
}

function sessionTitle(session) {
  return firstDefined(session?.title, session?.nom, session?.name, session?.label, session?.muscle, null);
}

/**
 * Découpe un titre de séance en {main, sub} pour un rendu premium :
 *  · "Dos (Épaisseur prioritaire — séance…)" → main="Dos", sub="Épaisseur prioritaire — séance…"
 *  · "Torse — force"                        → main="Torse", sub="force"
 *  · "Push"                                 → main="Push", sub=null
 * Le sous-titre est destiné à un rendu plus petit et estompé, tronqué visuellement à 2 lignes.
 */
function splitSessionTitle(raw) {
  if (!raw || typeof raw !== "string") return { main: null, sub: null };
  const trimmed = raw.trim();
  const idx = trimmed.search(/[(—–\-·]/);
  if (idx <= 0) return { main: trimmed, sub: null };
  const main = trimmed.slice(0, idx).trim();
  let sub = trimmed.slice(idx).replace(/^[\s(—–\-·]+/, "").replace(/\)\s*$/, "").trim();
  if (!main) return { main: trimmed, sub: null };
  return { main, sub: sub || null };
}

function sessionDuration(session) {
  const value = firstDefined(session?.duration, session?.duree, session?.minutes, session?.durationMin);
  return value ? `${Math.round(n(value, 60))} min` : "60 min";
}

function sessionExerciseCount(session) {
  const list = firstDefined(session?.exercises, session?.exercices, session?.items, session?.workout);
  if (Array.isArray(list)) return list.length;
  return n(session?.exerciseCount || session?.nbExercices, 5);
}

/** Vrai quand l'utilisateur n'a pas encore de programme actif. */
function hasProgram(prog) {
  if (!prog) return false;
  if (Array.isArray(prog?.jours) && prog.jours.length > 0) return true;
  if (Array.isArray(prog?.seances) && prog.seances.length > 0) return true;
  if (Array.isArray(prog) && prog.length > 0) return true;
  return Boolean(prog?.id || prog?.title || prog?.nom);
}

function ProgressBar({ value, total, color = blue }) {
  return (
    <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
      <div style={{ width: `${pct(value, total)}%`, height: "100%", borderRadius: 999, background: color }} />
    </div>
  );
}

export function HeroCard({ profil, prog, calObj, calSess, setTab }) {
  const session = getSession(calSess, prog);
  const hasProg = hasProgram(prog);
  const rawTitle = sessionTitle(session);
  const { main: titleMain, sub: titleSub } = splitSessionTitle(rawTitle);
  const duration = sessionDuration(session);
  const count = sessionExerciseCount(session);
  const lastSession = firstDefined(calSess?.last?.label, calSess?.last?.name, calSess?.lastSession, "Vendredi · Dos");
  const prenom = firstDefined(profil?.prenom, prog?.prenom, "Hugo");

  // Deux modes :
  //  · sessionMode = programme actif ET séance du jour → CTA "Commencer la séance"
  //  · setupMode   = pas de programme (ou aucune séance) → CTA "Créer ton programme"
  const sessionMode = hasProg && titleMain !== null;

  return (
    <div style={{ padding: "22px 16px 0", fontFamily: FONT }}>
      {/* Bonjour + phrase — occupe toute la largeur (plus de pilule à droite) */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          color: blue, fontSize: 20, fontWeight: 800, marginBottom: 10,
          letterSpacing: "-0.02em",
        }}>
          Bonjour {prenom} <span style={{ display: "inline-block" }}>👋</span>
        </div>
        <div style={{
          color: DARK.text, fontSize: 26, lineHeight: 1.08,
          fontWeight: 850, letterSpacing: "-0.035em",
        }}>
          Prêt à devenir<br />
          ta <span style={{ color: blue }}>meilleure version</span> ?
        </div>
      </div>

      {/* HERO : photo Pexels + contenu selon le mode */}
      <div style={{
        position: "relative", minHeight: 292, borderRadius: 24, overflow: "hidden",
        border: "1px solid rgba(92,119,255,0.18)", background: "#0C1017",
        boxShadow: "0 14px 38px rgba(0,0,0,0.28)",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${HOME_HERO_SRC})`,
          backgroundSize: "cover", backgroundPosition: "center 42%",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(7,10,15,0.96) 0%, rgba(7,10,15,0.76) 38%, rgba(7,10,15,0.20) 76%, rgba(7,10,15,0.16) 100%), linear-gradient(0deg, rgba(7,10,15,0.92) 0%, transparent 48%)",
        }} />
        <div style={{
          position: "relative", minHeight: 292,
          padding: "20px 20px 30px",
          display: "flex", flexDirection: "column",
        }}>
          {/* Label collé en haut de la carte */}
          <div style={{
            color: blue, fontSize: 12, fontWeight: 800,
            letterSpacing: "0.09em",
          }}>
            {sessionMode ? "SÉANCE DU JOUR" : "PRÊT À COMMENCER"}
          </div>

          {/* Spacer poussant le contenu principal vers le bas */}
          <div style={{ flex: 1 }} />

          {sessionMode ? (
            <>
              {/* Titre principal (partie avant parenthèse/tiret) — 2 lignes max */}
              <div style={{
                color: "#fff", fontSize: 28, fontWeight: 850,
                lineHeight: 1.04, letterSpacing: "-0.035em",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                wordBreak: "break-word",
              }}>{titleMain}</div>
              {/* Sous-titre (contexte entre parenthèses) — plus petit, muted, 2 lignes max */}
              {titleSub && (
                <div style={{
                  color: "rgba(255,255,255,0.66)",
                  fontSize: 12.5, fontWeight: 600,
                  lineHeight: 1.35, marginTop: 6,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>{titleSub}</div>
              )}
              <div style={{
                color: "rgba(255,255,255,0.82)",
                fontSize: 13, fontWeight: 600, marginTop: 8,
              }}>{duration} · {count} exercices</div>
              <button
                onClick={() => setTab && setTab("program")}
                className="tap"
                style={{
                  marginTop: 16, alignSelf: "stretch",
                  border: "none", borderRadius: 14,
                  padding: "14px 17px",
                  background: blue, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                  fontFamily: FONT, fontSize: 15, fontWeight: 750,
                  boxShadow: "0 8px 22px rgba(60,91,255,0.32)",
                  cursor: "pointer",
                }}
              >
                <I name="play" size={15} color="#fff" fill />
                Commencer la séance
              </button>
            </>
          ) : (
            <>
              <div style={{
                color: "#fff", fontSize: 28, fontWeight: 850,
                lineHeight: 1.04, letterSpacing: "-0.035em",
              }}>Crée ton programme</div>
              <div style={{
                color: "rgba(255,255,255,0.72)",
                fontSize: 13, fontWeight: 600, marginTop: 7,
              }}>Sur-mesure, selon ta morphologie</div>
              <button
                onClick={() => setTab && setTab("program")}
                className="tap"
                style={{
                  marginTop: 16, alignSelf: "stretch",
                  border: "none", borderRadius: 14,
                  padding: "14px 17px",
                  background: blue, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                  fontFamily: FONT, fontSize: 15, fontWeight: 750,
                  boxShadow: "0 8px 22px rgba(60,91,255,0.32)",
                  cursor: "pointer",
                }}
              >
                <I name="plus" size={16} color="#fff" stroke={2.2} />
                Créer ton programme
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bandeau info rapide sous le hero */}
      <div style={{
        ...card, marginTop: 12, padding: "15px 8px",
        display: "grid", gridTemplateColumns: "repeat(3,1fr)",
      }}>
        {[
          { icon: "clock",  label: "Dernière séance", value: lastSession, color: muted },
          { icon: "chart",  label: "Progression",     value: "Bonne dynamique", color: "#35D07F" },
          { icon: "target", label: "Objectif",        value: `${fmt(firstDefined(calObj, 3305))} kcal`, color: blue },
        ].map((item, i) => (
          <div key={item.label} style={{
            minWidth: 0, padding: "1px 11px",
            borderLeft: i ? "1px solid rgba(255,255,255,0.08)" : "none",
          }}>
            <I name={item.icon} size={18} color={item.color} />
            <div style={{
              color: muted, fontSize: 10.5, fontWeight: 600, marginTop: 7,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{item.label}</div>
            <div style={{
              color: item.color, fontSize: 12.5, fontWeight: 750, marginTop: 3,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NutritionCard({ calObj, pObj, gObj, lObj, totR, setTab, setPaywallNutrition, premium }) {
  const calTarget = n(calObj, 3305);
  const pTarget = n(pObj, 196);
  const gTarget = n(gObj, 428);
  const lTarget = n(lObj, 90);
  const calUsed = n(totR?.cal);
  const pUsed = n(totR?.p);
  const gUsed = n(totR?.g);
  const lUsed = n(totR?.l);
  const calRemain = Math.max(0, calTarget - calUsed);
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * Math.min(1, calRemain / Math.max(calTarget, 1));

  const addMeal = () => {
    if (!premium) {
      setPaywallNutrition?.(true);
      return;
    }
    setTab?.("nutrition");
  };

  return (
    <section style={{ ...card, margin: "14px 16px 0", padding: 18, fontFamily: FONT }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
        <div style={sectionTitle}>TA NUTRITION</div>
        <button onClick={() => setTab?.("nutrition")} style={{ border: 0, background: "none", color: blue, fontFamily: FONT, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Détails ›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "112px 1fr", gap: 18, alignItems: "center" }}>
        <div style={{ position: "relative", width: 112, height: 112 }}>
          <svg width="112" height="112" viewBox="0 0 112 112" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle cx="56" cy="56" r={r} fill="none" stroke={blue} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${dash} ${circumference - dash}`} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <strong style={{ color: DARK.text, fontSize: 20, lineHeight: 1 }}>{fmt(calRemain)}</strong>
            <span style={{ color: muted, fontSize: 10, marginTop: 5 }}>kcal restantes</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {[
            { label: "Protéines", used: pUsed, total: pTarget, color: blue },
            { label: "Glucides", used: gUsed, total: gTarget, color: "#F59E0B" },
            { label: "Lipides", used: lUsed, total: lTarget, color: "#E5484D" },
          ].map(m => (
            <div key={m.label}>
              <div style={{ display: "flex", justifyContent: "space-between", color: DARK.text, fontSize: 11.5, fontWeight: 650, marginBottom: 6 }}>
                <span>{m.label}</span><span style={{ color: muted, fontWeight: 600 }}>{fmt(m.used)} / {fmt(m.total)}g</span>
              </div>
              <ProgressBar value={m.used} total={m.total} color={m.color} />
            </div>
          ))}
        </div>
      </div>
      <button onClick={addMeal} className="tap" style={{ width: "100%", marginTop: 17, border: "none", borderRadius: 13, padding: "13px 14px", background: green, color: "#fff", fontFamily: FONT, fontSize: 14, fontWeight: 750, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
        <I name="plus" size={17} color="#fff" stroke={2.2} /> Ajouter un repas
      </button>
    </section>
  );
}

/**
 * Carte "Série actuelle" — layout épuré : titre en haut, gros chiffre à gauche,
 * 4 barres verticales UNIFORMES à droite (bleu MorphoCoach), message en bas.
 * `inline` = utilisée dans une grille 2 colonnes → pas de margin extérieure.
 */
export function StreakCard({ streak = 0, inline = false }) {
  const value = n(streak);
  const bars = [0, 1, 2, 3];
  const isStarted = value > 0;

  return (
    <section style={{
      ...card,
      margin: inline ? 0 : "14px 16px 0",
      padding: "14px 14px 13px",
      fontFamily: FONT,
      overflow: "hidden",
      display: "flex", flexDirection: "column",
      minHeight: inline ? 152 : undefined,
    }}>
      {/* Titre en haut : label + flamme */}
      <div style={{
        color: DARK.text, fontSize: 13, fontWeight: 800,
        letterSpacing: "-0.005em",
        display: "flex", alignItems: "center", gap: 5,
      }}>
        Série actuelle <span style={{ fontSize: 14 }} aria-hidden="true">🔥</span>
      </div>

      {/* Ligne principale : chiffre à gauche, 4 barres uniformes à droite */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 10, marginTop: 10, flex: 1,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
          <strong style={{
            color: DARK.text, fontSize: 36, lineHeight: 1,
            fontWeight: 850, letterSpacing: "-0.045em",
          }}>{value}</strong>
          <span style={{ color: muted, fontSize: 11.5, fontWeight: 600 }}>
            jour{value > 1 ? "s" : ""}
          </span>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          flexShrink: 0,
        }} aria-hidden="true">
          {bars.map(i => {
            const active = i < Math.min(value, bars.length);
            return (
              <div key={i} style={{
                width: 8,
                height: 34,
                borderRadius: 5,
                background: active
                  ? `linear-gradient(180deg, ${blue}, ${blue}B8)`
                  : "rgba(255,255,255,0.08)",
                boxShadow: active ? `0 0 12px ${blue}30` : "none",
              }} />
            );
          })}
        </div>
      </div>

      {/* Message conditionnel en bas */}
      <div style={{
        color: isStarted ? blue : muted,
        fontSize: 10.5, fontWeight: 700,
        marginTop: 8, lineHeight: 1.3,
        letterSpacing: "-0.005em",
      }}>
        {isStarted ? "Continue comme ça" : "Commence aujourd'hui"}
      </div>
    </section>
  );
}

/**
 * Sélectionne les 4 badges les plus pertinents à afficher sur l'accueil :
 * les débloqués d'abord, puis ceux dont la progression est la plus avancée.
 * Filtre le badge "mode_legende" (méta-badge) tant qu'il n'est pas gagné.
 */
function pickFourBadges(badgeStates) {
  const list = Array.isArray(badgeStates) ? badgeStates : [];
  const filtered = list.filter(b => b?.id !== "mode_legende" || b?.unlocked);
  const sorted = [...filtered].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    return (b.pct || 0) - (a.pct || 0);
  });
  return sorted.slice(0, 4);
}

/**
 * Carte Badges — 4 vrais badges depuis le sprite /public/badges/*.png.
 * Débloqués : pleine opacité + léger glow bleu. Verrouillés : très estompés.
 */
export function BadgesCard({ badgeStates, onVoirTout, inline = false }) {
  const list = Array.isArray(badgeStates) ? badgeStates : [];
  const earned = list.filter(b => b?.unlocked).length;
  const total = list.length || 30;
  const four = pickFourBadges(list);

  return (
    <section style={{
      ...card,
      margin: inline ? 0 : "14px 16px 0",
      padding: "14px 12px 12px",
      fontFamily: FONT,
      display: "flex", flexDirection: "column",
      minHeight: inline ? 152 : undefined,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{
          color: DARK.text, fontSize: 13, fontWeight: 800,
          letterSpacing: "-0.005em",
        }}>Badges</div>
        <span style={{ color: blue, fontSize: 11.5, fontWeight: 800 }}>
          {earned}/{total}
        </span>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: 6, marginTop: 10, flex: 1, alignItems: "center",
      }}>
        {four.map(b => (
          <div key={b.id} style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 3, minWidth: 0,
          }}>
            <div style={{
              width: 42, height: 42,
              display: "grid", placeItems: "center",
              filter: b.unlocked ? `drop-shadow(0 0 8px ${blue}40)` : "none",
              opacity: b.unlocked ? 1 : 0.32,
            }}>
              <img
                src={b.img}
                alt={b.nom}
                style={{
                  width: "100%", height: "100%", objectFit: "contain",
                  filter: b.unlocked ? "none" : "grayscale(1)",
                }}
              />
            </div>
            <div style={{
              color: b.unlocked ? DARK.text : muted,
              fontSize: 8, fontWeight: 700,
              letterSpacing: "0.02em", textAlign: "center",
              lineHeight: 1.15,
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              opacity: b.unlocked ? 1 : 0.7,
            }}>{b.nom}</div>
          </div>
        ))}
      </div>

      <button onClick={onVoirTout} style={{
        marginTop: 6, alignSelf: "flex-end",
        border: 0, background: "none",
        color: blue, fontFamily: FONT,
        fontSize: 11.5, fontWeight: 750,
        cursor: "pointer", padding: 0,
      }}>
        Voir tout ›
      </button>
    </section>
  );
}

/**
 * Carte "Ton Coach" — grande carte immersive avec le robot MorphoCoach
 * centré verticalement dans la partie droite. Deux CTA empilés à gauche :
 * un pour le coach entraînement (bleu), un pour le coach nutrition (vert).
 * Les deux routent vers setTab("coach").
 */
export function CoachCard({ setTab }) {
  return (
    <div style={{
      ...card,
      position: "relative", overflow: "hidden",
      margin: "14px 16px 32px",
      minHeight: 200,
      padding: "20px 168px 20px 18px",
      fontFamily: FONT,
    }}>
      <div style={{ color: blue, fontSize: 11, fontWeight: 800, letterSpacing: "0.10em" }}>TON COACH</div>
      <div style={{
        color: DARK.text, fontSize: 22, lineHeight: 1.08,
        fontWeight: 850, letterSpacing: "-0.03em", marginTop: 7,
      }}>Un jour à la fois.</div>
      <div style={{
        color: muted, fontSize: 12.5, lineHeight: 1.4, marginTop: 6,
      }}>Chaque séance compte,<br />même les plus courtes.</div>

      {/* Deux CTA empilés : entraînement (bleu) + nutrition (vert) */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 8,
        marginTop: 12,
      }}>
        <button onClick={() => setTab?.("coach")} className="tap" style={{
          border: `1px solid ${blue}`, borderRadius: 11,
          background: "rgba(60,91,255,0.10)",
          color: DARK.text,
          padding: "9px 12px",
          fontFamily: FONT, fontSize: 11.5, fontWeight: 700,
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 7,
          width: "fit-content", maxWidth: "100%",
        }}>
          <I name="coach" size={14} color={blue} />
          Coach entraînement
        </button>
        <button onClick={() => setTab?.("coach")} className="tap" style={{
          border: `1px solid ${green}`, borderRadius: 11,
          background: `${green}14`,
          color: DARK.text,
          padding: "9px 12px",
          fontFamily: FONT, fontSize: 11.5, fontWeight: 700,
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 7,
          width: "fit-content", maxWidth: "100%",
        }}>
          <I name="coach" size={14} color={green} />
          Coach nutrition
        </button>
      </div>

      {/* Robot centré verticalement dans la moitié droite */}
      <img src={coachRobot} alt="Coach MorphoCoach" style={{
        position: "absolute",
        width: 168, height: 168, objectFit: "contain",
        right: -6, top: "50%",
        transform: "translateY(-50%)",
        filter: "drop-shadow(0 0 24px rgba(60,91,255,0.34))",
        pointerEvents: "none",
      }} />
    </div>
  );
}

// Compatibilité avec les imports historiques.
export function CoachIACard(props) { return <CoachCard {...props} />; }
export function CoachNutritionCard() { return null; }
export function PacksCard() { return null; }
