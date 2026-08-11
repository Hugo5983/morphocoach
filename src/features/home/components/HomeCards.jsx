// @ts-check
// ─── MorphoCoach · HomeCards — Accueil V2 ─────────────────────────────────────
// DESIGN ONLY : les données, callbacks et règles métier restent inchangés.
import { C, FONT, DARK } from "../../../data/constants.js";
import { I, ID } from "../../../components/ui/Icon.jsx";
import coachRobot from "./coachRobot.png";

// Photo héroïque Pexels : même principe que la page « Offre du moment ».
// L'ID reste volontairement figé pour garantir un rendu stable.
const HOME_HERO_PEXELS_ID = 16996376;
const HOME_HERO_SRC = `https://images.pexels.com/photos/${HOME_HERO_PEXELS_ID}/pexels-photo-${HOME_HERO_PEXELS_ID}.jpeg`;

const blue = C.accent || "#3C5BFF";
const green = C.green || "#12B76A";
const muted = DARK.dimStrong || "#A7AFBF";
const surface = "rgba(15,19,27,0.94)";
const border = "rgba(92,119,255,0.24)";
const softBorder = "rgba(255,255,255,0.075)";

const card = {
  background: surface,
  border: `1px solid ${border}`,
  borderRadius: 22,
  boxShadow: "0 12px 34px rgba(0,0,0,0.20)",
};

const sectionTitle = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: DARK.text,
  fontFamily: FONT,
};

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
  for (const k of keys) if (raw?.[k]) return raw[k];
  if (Array.isArray(raw)) return raw[0] || null;
  return raw?.session || raw?.current || raw?.seance || raw?.[0] || null;
}

function sessionTitle(session) {
  return firstDefined(session?.title, session?.nom, session?.name, session?.label, session?.muscle, "Torse");
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

function ProgressBar({ value, total, color = blue, height = 6 }) {
  return (
    <div style={{ height, borderRadius: 999, background: "rgba(255,255,255,0.075)", overflow: "hidden" }}>
      <div style={{ width: `${pct(value, total)}%`, height: "100%", borderRadius: 999, background: color, transition: "width .25s ease" }} />
    </div>
  );
}

function MetricIcon({ name, color = blue, size = 18 }) {
  return (
    <div style={{ width: 30, height: 30, borderRadius: 10, display: "grid", placeItems: "center", background: `${color}12`, border: `1px solid ${color}30` }}>
      <I name={name} size={size} color={color} />
    </div>
  );
}

export function HeroCard({ profil, prog, calObj, calSess, setTab }) {
  const session = getSession(calSess, prog);
  const title = sessionTitle(session);
  const duration = sessionDuration(session);
  const count = sessionExerciseCount(session);
  const lastSession = firstDefined(calSess?.last?.label, calSess?.last?.name, calSess?.lastSession, "Vendredi – Dos");
  const prenom = firstDefined(profil?.prenom, prog?.prenom, "Hugo");

  return (
    <div style={{ padding: "18px 16px 0", fontFamily: FONT }}>
      {/* Greeting : plus compact pour laisser davantage de contenu visible au scroll. */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
        <div style={{ minWidth: 0, paddingRight: 4 }}>
          <div style={{ color: blue, fontSize: 13, fontWeight: 750, marginBottom: 7 }}>Bonjour {prenom} 👋</div>
          <div style={{ color: DARK.text, fontSize: 29, lineHeight: 1.04, fontWeight: 850, letterSpacing: "-0.04em" }}>
            Prêt à devenir<br />
            ta <span style={{ color: blue }}>meilleure version</span> ?
          </div>
        </div>

        <div style={{ flex: "0 0 70px", width: 70, height: 70, borderRadius: 18, border: `1px solid ${blue}3A`, background: "rgba(17,23,34,0.86)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, boxShadow: `0 0 24px ${blue}0C` }}>
          <I name="flame" size={21} color={blue} fill />
          <strong style={{ color: DARK.text, fontSize: 18, lineHeight: 1 }}>1</strong>
          <span style={{ color: muted, fontSize: 10, fontWeight: 650 }}>série</span>
        </div>
      </div>

      {/* Hero immersif : photo Pexels figée par ID + overlay contrôlé. */}
      <div style={{ position: "relative", minHeight: 310, borderRadius: 24, overflow: "hidden", border: `1px solid ${blue}38`, background: "#0B0F16", boxShadow: `0 14px 38px rgba(0,0,0,0.28), 0 0 0 1px ${blue}0C` }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: `url(${HOME_HERO_SRC})`, backgroundSize: "cover", backgroundPosition: "center 42%", transform: "scale(1.01)" }} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(6,9,14,0.98) 0%, rgba(6,9,14,0.88) 31%, rgba(6,9,14,0.54) 56%, rgba(6,9,14,0.12) 100%), linear-gradient(0deg, rgba(6,9,14,0.92) 0%, rgba(6,9,14,0.10) 54%, rgba(6,9,14,0.15) 100%)" }} />
        <div style={{ position: "relative", minHeight: 310, padding: "22px 20px 18px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ color: blue, fontSize: 12, fontWeight: 850, letterSpacing: "0.10em", marginBottom: 8 }}>SÉANCE DU JOUR</div>
          <div style={{ color: "#fff", fontSize: 31, fontWeight: 850, lineHeight: 1.04, letterSpacing: "-0.04em", maxWidth: "88%" }}>{title}</div>
          <div style={{ color: "rgba(255,255,255,0.84)", fontSize: 14, fontWeight: 600, marginTop: 8 }}>{duration} · {count} exercices</div>
          <button onClick={() => setTab && setTab("program")} className="tap" style={{ marginTop: 16, alignSelf: "flex-start", border: "none", borderRadius: 14, padding: "13px 17px", background: blue, color: "#fff", display: "flex", alignItems: "center", gap: 9, fontFamily: FONT, fontSize: 14, fontWeight: 780, boxShadow: `0 9px 24px ${blue}45`, cursor: "pointer" }}>
            <I name="play" size={15} color="#fff" fill />
            Commencer la séance
          </button>
        </div>
      </div>

      {/* Stats : trois blocs, vrais pictogrammes, aucune nouvelle logique. */}
      <div style={{ ...card, marginTop: 12, padding: "13px 6px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", boxShadow: "none" }}>
        {[
          { icon: "clock", label: "Dernière séance", value: lastSession, color: muted },
          { icon: "chart", label: "Progression", value: "Bonne dynamique", color: "#35D07F" },
          { icon: "target", label: "Objectif", value: `${fmt(firstDefined(calObj, 3305))} kcal`, color: blue },
        ].map((item, i) => (
          <div key={item.label} style={{ minWidth: 0, padding: "1px 10px", borderLeft: i ? `1px solid ${softBorder}` : "none" }}>
            <MetricIcon name={item.icon} color={item.color} size={16} />
            <div style={{ color: muted, fontSize: 10.5, fontWeight: 600, marginTop: 7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</div>
            <div style={{ color: item.color, fontSize: 12.5, fontWeight: 760, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.value}</div>
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
        <button onClick={() => setTab?.("nutrition")} style={{ border: 0, background: "none", color: blue, fontFamily: FONT, fontWeight: 750, fontSize: 12, cursor: "pointer", padding: 0 }}>Détails ›</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "112px 1fr", gap: 18, alignItems: "center" }}>
        <div style={{ position: "relative", width: 112, height: 112 }}>
          <svg width="112" height="112" viewBox="0 0 112 112" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.075)" strokeWidth="8" />
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
            { label: "Glucides", used: gUsed, total: gTarget, color: "#F5B942" },
            { label: "Lipides", used: lUsed, total: lTarget, color: "#E56B72" },
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

      <button onClick={addMeal} className="tap" style={{ width: "100%", marginTop: 17, border: "none", borderRadius: 13, padding: "13px 14px", background: green, color: "#fff", fontFamily: FONT, fontSize: 14, fontWeight: 780, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
        <I name="plus" size={17} color="#fff" stroke={2.2} /> Ajouter un repas
      </button>
    </section>
  );
}

export function StreakCard({ streak = 0 }) {
  const value = n(streak);
  const bars = [0, 1, 2, 3, 4];

  return (
    <div style={{ ...card, margin: "14px 16px 0", padding: 17, fontFamily: FONT }}>
      <div style={{ ...sectionTitle, color: DARK.text }}>TA PROGRESSION</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, marginTop: 12 }}>
        <div>
          <div style={{ color: muted, fontSize: 11 }}>Série actuelle 🔥</div>
          <div style={{ color: DARK.text, fontSize: 30, fontWeight: 850, lineHeight: 1, marginTop: 7 }}>{value}</div>
          <div style={{ color: muted, fontSize: 11, marginTop: 5 }}>jours</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", paddingRight: 3 }} aria-hidden="true">
          {bars.map(i => {
            const active = i < Math.min(value, 5);
            return <div key={i} style={{ width: 11, height: 18 + i * 7, borderRadius: 7, background: active ? blue : "rgba(255,255,255,0.075)", boxShadow: active ? `0 0 14px ${blue}20` : "none" }} />;
          })}
        </div>
      </div>
      <div style={{ marginTop: 13, color: blue, fontSize: 12, fontWeight: 750 }}>Continue comme ça</div>
    </div>
  );
}

export function BadgesCard({ badgeStates, onVoirTout }) {
  // SECTION VOLONTAIREMENT CONSERVÉE : même composition que le visuel validé.
  const earned = Object.values(badgeStates || {}).filter(v => v === true || v?.earned || v?.unlocked).length;
  const icons = ["trophy", "bolt", "target", "flame", "star"];
  const colors = ["#4DA3FF", "#9B7CFF", "#F5B942", "#4ED9C2", "#A7AFBF"];
  return (
    <div style={{ ...card, margin: "14px 16px 0", padding: 16, fontFamily: FONT }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={sectionTitle}>BADGES</div>
        <span style={{ color: blue, fontSize: 12, fontWeight: 750 }}>{Math.max(earned, 1)}/30</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 15 }}>
        {icons.map((icon, i) => (
          <div key={icon} style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(145deg, ${colors[i]}18, rgba(255,255,255,0.02))`, border: `1px solid ${colors[i]}40`, display: "grid", placeItems: "center", boxShadow: `0 0 14px ${colors[i]}12` }}>
            <I name={icon} size={22} color={colors[i]} fill={icon === "star" || icon === "flame"} />
          </div>
        ))}
      </div>
      <button onClick={onVoirTout} style={{ marginTop: 11, border: 0, background: "none", color: blue, fontFamily: FONT, fontSize: 11.5, fontWeight: 700, cursor: "pointer", padding: 0 }}>Voir tout ›</button>
    </div>
  );
}

export function CoachIACard({ setTab }) {
  return (
    <div style={{ ...card, position: "relative", overflow: "hidden", margin: "14px 16px 34px", minHeight: 164, padding: "20px 168px 20px 18px", fontFamily: FONT }}>
      <div style={{ color: blue, fontSize: 11, fontWeight: 850, letterSpacing: "0.10em" }}>TON COACH IA</div>
      <div style={{ color: DARK.text, fontSize: 24, lineHeight: 1.08, fontWeight: 850, letterSpacing: "-0.03em", marginTop: 7 }}>Un jour à la fois.</div>
      <div style={{ color: muted, fontSize: 13, lineHeight: 1.42, marginTop: 7 }}>Chaque séance compte,<br />même les plus courtes.</div>
      <button onClick={() => setTab?.("coach")} className="tap" style={{ marginTop: 13, border: `1px solid ${blue}`, borderRadius: 11, background: `${blue}0F`, color: DARK.text, padding: "9px 12px", fontFamily: FONT, fontSize: 11.5, fontWeight: 720, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
        <I name="coach" size={15} color={blue} /> Discuter avec le coach
      </button>
      <img src={coachRobot} alt="Coach IA MorphoCoach" style={{ position: "absolute", width: 158, height: 158, objectFit: "contain", right: -2, bottom: -8, filter: `drop-shadow(0 0 24px ${blue}55)` }} />
    </div>
  );
}

// Compatibilité avec les imports historiques.
export function PacksCard() { return null; }
