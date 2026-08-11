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

function ProgressBar({ value, total, color = blue }) {
  return (
    <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
      <div style={{ width: `${pct(value, total)}%`, height: "100%", borderRadius: 999, background: color }} />
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
    <div style={{ padding: "20px 16px 0", fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 18 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: blue, fontSize: 15, fontWeight: 750, marginBottom: 8 }}>Bonjour {prenom} 👋</div>
          <div style={{ color: DARK.text, fontSize: 26, lineHeight: 1.06, fontWeight: 850, letterSpacing: "-0.035em" }}>
            Prêt à devenir<br />
            ta <span style={{ color: blue }}>meilleure version</span> ?
          </div>
        </div>
        <div style={{ flex: "0 0 74px", minHeight: 74, borderRadius: 18, border: "1px solid rgba(92,119,255,0.22)", background: "rgba(17,23,34,0.78)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
          <I name="flame" size={21} color={blue} fill />
          <strong style={{ color: DARK.text, fontSize: 18, lineHeight: 1 }}>1</strong>
          <span style={{ color: muted, fontSize: 10, fontWeight: 600 }}>série</span>
        </div>
      </div>

      <div style={{ position: "relative", minHeight: 292, borderRadius: 24, overflow: "hidden", border: "1px solid rgba(92,119,255,0.18)", background: "#0C1017", boxShadow: "0 14px 38px rgba(0,0,0,0.28)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${HOME_HERO_SRC})`, backgroundSize: "cover", backgroundPosition: "center 42%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(7,10,15,0.96) 0%, rgba(7,10,15,0.76) 38%, rgba(7,10,15,0.20) 76%, rgba(7,10,15,0.16) 100%), linear-gradient(0deg, rgba(7,10,15,0.92) 0%, transparent 48%)" }} />
        <div style={{ position: "relative", minHeight: 292, padding: "22px 20px 18px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ color: blue, fontSize: 12, fontWeight: 800, letterSpacing: "0.09em", marginBottom: 8 }}>SÉANCE DU JOUR</div>
          <div style={{ color: "#fff", fontSize: 32, fontWeight: 850, lineHeight: 1.05, letterSpacing: "-0.035em" }}>{title}</div>
          <div style={{ color: "rgba(255,255,255,0.82)", fontSize: 14, fontWeight: 600, marginTop: 8 }}>{duration} · {count} exercices</div>
          <button onClick={() => setTab && setTab("program")} className="tap" style={{ marginTop: 17, alignSelf: "flex-start", border: "none", borderRadius: 13, padding: "13px 17px", background: blue, color: "#fff", display: "flex", alignItems: "center", gap: 9, fontFamily: FONT, fontSize: 14, fontWeight: 750, boxShadow: "0 8px 22px rgba(60,91,255,0.32)", cursor: "pointer" }}>
            <I name="play" size={15} color="#fff" fill />
            Commencer la séance
          </button>
        </div>
      </div>

      <div style={{ ...card, marginTop: 12, padding: "15px 8px", display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
        {[
          { icon: "clock", label: "Dernière séance", value: lastSession, color: muted },
          { icon: "chart", label: "Progression", value: "Bonne dynamique", color: "#35D07F" },
          { icon: "target", label: "Objectif", value: `${fmt(firstDefined(calObj, 3305))} kcal`, color: blue },
        ].map((item, i) => (
          <div key={item.label} style={{ minWidth: 0, padding: "1px 11px", borderLeft: i ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
            <I name={item.icon} size={18} color={item.color} />
            <div style={{ color: muted, fontSize: 10.5, fontWeight: 600, marginTop: 7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</div>
            <div style={{ color: item.color, fontSize: 12.5, fontWeight: 750, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.value}</div>
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

export function StreakCard({ streak = 0 }) {
  const value = n(streak);
  const bars = [0, 1, 2, 3, 4];
  const isStarted = value > 0;
  const message = isStarted ? "Continue comme ça" : "Commence ta série aujourd’hui";

  return (
    <section style={{
      ...card,
      margin: "14px 16px 0",
      padding: "17px 18px 16px",
      fontFamily: FONT,
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <div style={sectionTitle}>TA PROGRESSION</div>
        <div style={{ color: blue, fontSize: 11.5, fontWeight: 750, letterSpacing: "-0.01em" }}>
          {value > 0 ? `${value} jour${value > 1 ? "s" : ""}` : "À démarrer"}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, marginTop: 15 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: muted, fontSize: 11.5, fontWeight: 600 }}>Série actuelle 🔥</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginTop: 5 }}>
            <strong style={{ color: DARK.text, fontSize: 34, lineHeight: 1, fontWeight: 850, letterSpacing: "-0.04em" }}>{value}</strong>
            <span style={{ color: muted, fontSize: 11.5, fontWeight: 600 }}>jour{value > 1 ? "s" : ""}</span>
          </div>
          <div style={{ color: blue, fontSize: 12, fontWeight: 750, marginTop: 11 }}>{message}</div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 7, paddingRight: 2, flexShrink: 0 }} aria-hidden="true">
          {bars.map(i => {
            const active = i < Math.min(value, 5);
            return (
              <div key={i} style={{
                width: 13,
                height: 22 + i * 9,
                borderRadius: 8,
                background: active ? `linear-gradient(180deg, ${blue}, ${blue}B8)` : "rgba(255,255,255,0.075)",
                boxShadow: active ? `0 0 16px ${blue}28` : "none",
                opacity: active ? 1 : 0.9,
              }} />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function BadgesCard({ badgeStates, onVoirTout }) {
  const earned = Object.values(badgeStates || {}).filter(v => v === true || v?.earned || v?.unlocked).length;

  // Visuels badges : retour à la direction validée (médaille + intitulé),
  // sans modifier l’état métier ni le calcul du nombre de badges.
  const badges = [
    { number: "1", top: "PREMIÈRE", bottom: "SÉANCE", color: "#4DA3FF", glow: true },
    { number: "", top: "FOCUS", bottom: "MAX", color: "#9B7CFF" },
    { number: "", top: "OBJECTIF", bottom: "ATTEINT", color: "#F5B942" },
    { number: "", top: "DÉFICIT", bottom: "MAÎTRISÉ", color: "#4ED9C2" },
    { number: "7", top: "JOURS", bottom: "CONSÉCUTIFS", color: "#A7AFBF" },
  ];

  return (
    <section style={{ ...card, margin: "14px 16px 0", padding: "17px 16px 15px", fontFamily: FONT }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={sectionTitle}>BADGES</div>
        <span style={{ color: blue, fontSize: 12.5, fontWeight: 800 }}>{Math.max(earned, 1)}/30</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginTop: 15 }}>
        {badges.map((badge) => (
          <div key={`${badge.top}-${badge.bottom}`} style={{ display: "flex", justifyContent: "center", minWidth: 0 }}>
            <div style={{
              position: "relative",
              width: 58,
              height: 66,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              clipPath: "polygon(50% 0%, 88% 14%, 100% 50%, 88% 86%, 50% 100%, 12% 86%, 0% 50%, 12% 14%)",
              background: `linear-gradient(145deg, ${badge.color}22, rgba(255,255,255,0.025))`,
              filter: badge.glow ? `drop-shadow(0 0 10px ${badge.color}35)` : "none",
            }}>
              <div style={{
                position: "absolute",
                inset: 1,
                clipPath: "inherit",
                background: "#101621",
              }} />
              <div style={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                textAlign: "center",
                color: badge.color,
                fontFamily: FONT,
                lineHeight: 1,
              }}>
                {badge.number ? (
                  <div style={{ fontSize: 16, fontWeight: 850, marginBottom: 2 }}>{badge.number}</div>
                ) : (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", border: `2px solid ${badge.color}`, marginBottom: 3, boxShadow: `0 0 7px ${badge.color}35` }} />
                )}
                <div style={{ fontSize: 6.5, fontWeight: 850, letterSpacing: "0.03em" }}>{badge.top}</div>
                <div style={{ fontSize: 6.5, fontWeight: 750, opacity: 0.92 }}>{badge.bottom}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onVoirTout} style={{ marginTop: 12, border: 0, background: "none", color: blue, fontFamily: FONT, fontSize: 12, fontWeight: 750, cursor: "pointer", padding: 0 }}>
        Voir tout ›
      </button>
    </section>
  );
}

export function CoachIACard({ setTab }) {
  return (
    <div style={{ ...card, position: "relative", overflow: "hidden", margin: "14px 16px 32px", minHeight: 158, padding: "20px 180px 20px 18px", fontFamily: FONT }}>
      <div style={{ color: blue, fontSize: 11, fontWeight: 800, letterSpacing: "0.10em" }}>TON COACH IA</div>
      <div style={{ color: DARK.text, fontSize: 24, lineHeight: 1.08, fontWeight: 850, letterSpacing: "-0.03em", marginTop: 7 }}>Un jour à la fois.</div>
      <div style={{ color: muted, fontSize: 13, lineHeight: 1.4, marginTop: 7 }}>Chaque séance compte,<br />même les plus courtes.</div>
      <button onClick={() => setTab?.("coach")} className="tap" style={{ marginTop: 13, border: `1px solid ${blue}`, borderRadius: 11, background: "rgba(60,91,255,0.08)", color: DARK.text, padding: "9px 12px", fontFamily: FONT, fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
        <I name="coach" size={15} color={blue} /> Discuter avec le coach
      </button>
      <img src={coachRobot} alt="Coach IA MorphoCoach" style={{ position: "absolute", width: 168, height: 168, objectFit: "contain", right: -4, bottom: -12, filter: "drop-shadow(0 0 24px rgba(60,91,255,0.34))" }} />
    </div>
  );
}

// Compatibilité avec les imports historiques.
export function PacksCard() { return null; }
