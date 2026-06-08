// ─── CoachPage.jsx ────────────────────────────────────────────────────────────
// Page Coach Nutrition IA — plein écran, accessible via le bouton flottant.
// Streaming token par token via /api/generate.
// Limite gratuit : FREE_MSG_LIMIT questions/mois. PRO : illimité.

import { useState, useRef, useEffect, useCallback } from "react";
import { C, FONT, SERIF } from "../../data/constants.js";

// ─── Constantes ───────────────────────────────────────────────────────────────
const FREE_MSG_LIMIT = 3;
const MODEL          = "claude-sonnet-4-5";
const MAX_TOKENS     = 1000;
const STORAGE_KEY    = "morphocoach_coach_usage"; // { count, month }

const BG   = "#080E1A";
const S1   = C.s1 || "#111827";
const S2   = C.s2 || "#1A2336";
const BD   = C.bd || "rgba(255,255,255,0.07)";
const TEXT = C.text || "#F2F4F7";
const MID  = C.mid || "rgba(242,244,247,0.60)";
const DIM  = C.dim || "rgba(242,244,247,0.35)";
const BL   = C.accent || "#3B82F6";
const BLD  = C.accentDk || "#2563EB";
const VIO  = "#6366F1";
const VIOD = "#4F46E5";
const GRN  = "#34D399";
const AMB  = "#F59E0B";
const RED  = "#F87171";

// ─── Questions suggérées ──────────────────────────────────────────────────────
const SUGGESTIONS = [
  "Quelles sont mes carences principales ?",
  "Que manger ce soir selon mes objectifs ?",
  "Pourquoi mon score nutrition est faible ?",
  "Repas idéal avant l'entraînement ?",
  "Comment améliorer ma qualité alimentaire ?",
  "Mes points forts en nutrition ?",
];

// ─── Icônes ───────────────────────────────────────────────────────────────────
function I({ name, size = 18, color = "currentColor", stroke = 1.8 }) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: color, strokeWidth: stroke,
    strokeLinecap: "round", strokeLinejoin: "round",
  };
  const paths = {
    chevL:  <path d="m15 18-6-6 6-6"/>,
    send:   <><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></>,
    spark:  <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor" stroke="none"/>,
    refresh:<><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></>,
    lock:   <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    chat:   <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
  };
  return <svg {...p}>{paths[name]}</svg>;
}

// ─── Usage mensuel (localStorage) ─────────────────────────────────────────────
function getUsage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, month: new Date().getMonth() };
    const u = JSON.parse(raw);
    const now = new Date().getMonth();
    if (u.month !== now) return { count: 0, month: now };
    return u;
  } catch { return { count: 0, month: new Date().getMonth() }; }
}
function saveUsage(u) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); } catch {}
}

// ─── Construit le system prompt avec contexte nutrition ───────────────────────
function buildSystemPrompt({ profil, obj, calObj, pObj, gObj, lObj, bilan }) {
  const prenom = profil?.prenom || "l'utilisateur";
  const objectif = obj?.l || "non défini";
  const score = bilan?.score ?? "—";
  const avgKcal = bilan?.avgKcal ? Math.round(bilan.avgKcal) : "—";
  const nbLogged = bilan?.nbLogged ?? "—";
  const totalDays = bilan?.totalDays ?? 14;
  const pct = bilan?.pctKcal ?? 0;

  return `Tu es le Coach Nutrition IA de MorphoCoach, un assistant spécialisé UNIQUEMENT en nutrition et alimentation sportive.

PROFIL DE L'UTILISATEUR :
- Prénom : ${prenom}
- Objectif : ${objectif}
- TDEE / Cible calorique : ${calObj || "—"} kcal/j
- Cibles macros : Protéines ${pObj || "—"}g · Glucides ${gObj || "—"}g · Lipides ${lObj || "—"}g

BILAN NUTRITION DES 14 DERNIERS JOURS :
- Score de cohérence : ${score}/10
- Calories moyennes : ${avgKcal} kcal/j (${pct}% de la cible)
- Jours loggés : ${nbLogged}/${totalDays}
- Protéines moy. : ${bilan?.avgProt ? Math.round(bilan.avgProt) : "—"}g/j (cible ${pObj || "—"}g)
- Glucides moy. : ${bilan?.avgGluc ? Math.round(bilan.avgGluc) : "—"}g/j (cible ${gObj || "—"}g)
- Lipides moy. : ${bilan?.avgLip ? Math.round(bilan.avgLip) : "—"}g/j (cible ${lObj || "—"}g)

RÈGLES STRICTES :
1. Tu réponds UNIQUEMENT sur la nutrition, l'alimentation, les macros, les micronutriments, les repas et les recettes.
2. Si on te pose une question hors nutrition (entraînement, programme sportif, médecin, etc.), tu réponds poliment que tu es spécialisé en nutrition et tu rediriges vers la section appropriée de l'app.
3. Tes réponses sont courtes, directes, personnalisées au profil ci-dessus.
4. Tu utilises les données réelles du bilan pour contextualiser tes conseils.
5. Jamais de prescription médicale. Jamais de régimes extrêmes.
6. Ton ton : coach bienveillant, factuel, sans jugement.`;
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════
export default function CoachPage({
  onBack,
  profil, obj, calObj, pObj, gObj, lObj,
  bilan,       // données calculées depuis BilanUtils (peut être null)
  premium,     // premiumNutrition
  setPaywall,  // setPaywallNutrition
  push,
}) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Bonjour ${profil?.prenom || ""} ! Je suis ton Coach Nutrition. J'ai accès à ton bilan des 14 derniers jours. Pose-moi tes questions sur ton alimentation, tes macros ou tes carences.`,
      ts: Date.now(),
    },
  ]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [usage, setUsage]       = useState(getUsage);
  const [streamText, setStream] = useState("");

  const msgsEndRef = useRef(null);
  const inputRef   = useRef(null);
  const abortRef   = useRef(null);

  // Auto-scroll au dernier message
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  // Compteur d'utilisation restante (gratuit)
  const remaining = premium ? Infinity : Math.max(0, FREE_MSG_LIMIT - usage.count);
  const canSend   = premium || remaining > 0;

  // ─── Envoi message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    if (!canSend) { if (setPaywall) setPaywall(true); return; }

    // Ajoute le message user
    const userMsg = { role: "user", content: q, ts: Date.now() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);
    setStream("");

    // Mise à jour usage
    if (!premium) {
      const newUsage = { count: usage.count + 1, month: usage.month };
      setUsage(newUsage);
      saveUsage(newUsage);
    }

    // Construit le tableau messages pour l'API (sans le premier message IA de bienvenue)
    const apiMessages = history
      .filter((_, i) => i > 0)  // skip le message initial de bienvenue
      .map(m => ({ role: m.role, content: m.content }));

    try {
      abortRef.current = new AbortController();

      const res = await fetch("/api/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model:      MODEL,
          max_tokens: MAX_TOKENS,
          system:     buildSystemPrompt({ profil, obj, calObj, pObj, gObj, lObj, bilan }),
          messages:   apiMessages,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erreur ${res.status}`);
      }

      const data = await res.json();
      const answer = data.content?.map(c => c.text || "").join("").trim()
        || "Je n'ai pas pu générer une réponse. Réessaie.";

      // Simule le streaming (l'API /api/generate ne stream pas — on affiche mot par mot)
      setLoading(false);
      const words = answer.split(" ");
      let built = "";
      for (let i = 0; i < words.length; i++) {
        built += (i > 0 ? " " : "") + words[i];
        setStream(built);
        await new Promise(r => setTimeout(r, 18));
      }
      setStream("");
      setMessages(prev => [...prev, { role: "assistant", content: answer, ts: Date.now() }]);

    } catch (err) {
      if (err.name === "AbortError") return;
      setLoading(false);
      setStream("");
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Une erreur s'est produite. Vérifie ta connexion et réessaie.",
        ts: Date.now(),
        error: true,
      }]);
    }
  }, [input, loading, messages, canSend, premium, usage, profil, obj, calObj, pObj, gObj, lObj, bilan]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: BG,
      display: "flex", flexDirection: "column",
      fontFamily: FONT,
      paddingTop: "env(safe-area-inset-top, 0px)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      height: "100dvh",
      boxSizing: "border-box",
    }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${BD}`,
        display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
        background: BG }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none",
          color: BL, cursor: "pointer", fontSize: 13, fontWeight: 700,
          display: "flex", alignItems: "center", gap: 4, fontFamily: FONT, padding: 0 }}>
          <I name="chevL" size={15} color={BL} stroke={2.5}/> Retour
        </button>

        <div style={{ width: 34, height: 34, borderRadius: 10,
          background: `linear-gradient(135deg, ${VIO}, ${VIOD})`,
          display: "grid", placeItems: "center",
          boxShadow: `0 3px 12px ${VIO}60`, flexShrink: 0 }}>
          <I name="spark" size={16} color="#fff"/>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, fontFamily: FONT }}>
            Coach Nutrition
          </div>
          <div style={{ fontSize: 9, color: GRN, display: "flex", alignItems: "center",
            gap: 4, marginTop: 2, fontFamily: FONT }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%",
              background: GRN, display: "inline-block" }}/>
            Contexte chargé
            {!premium && (
              <span style={{ marginLeft: 6, color: AMB }}>
                · {remaining} question{remaining > 1 ? "s" : ""} restante{remaining > 1 ? "s" : ""}
              </span>
            )}
            {premium && <span style={{ marginLeft: 6, color: BL }}>· PRO</span>}
          </div>
        </div>
      </div>

      {/* ── Strip contexte ─────────────────────────────────────────────── */}
      {bilan && (
        <div style={{ margin: "10px 16px 0", padding: "8px 12px",
          background: `${VIO}0F`, border: `1px solid ${VIO}30`,
          borderRadius: 10, display: "flex", gap: 0, flexShrink: 0 }}>
          {[
            { v: bilan.score ?? "—",                            c: AMB,  l: "Score" },
            { v: bilan.avgKcal ? Math.round(bilan.avgKcal) : "—", c: TEXT, l: "kcal/j" },
            { v: `${bilan.nbLogged ?? 0}/${bilan.totalDays ?? 14}`, c: TEXT, l: "Jours" },
            { v: bilan.avgProt ? `${Math.round(bilan.avgProt)}g` : "—", c: "#60A5FA", l: "Prot." },
          ].map((item, i, arr) => (
            <div key={item.l} style={{ flex: 1, textAlign: "center",
              borderRight: i < arr.length - 1 ? `1px solid ${BD}` : "none" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: item.c,
                fontFamily: FONT }}>{item.v}</div>
              <div style={{ fontSize: 8, color: DIM, marginTop: 1, fontFamily: FONT }}>
                {item.l}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Messages ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "14px 16px",
        display: "flex", flexDirection: "column", gap: 10 }}>

        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            gap: 8, alignItems: "flex-end",
          }}>
            {m.role === "assistant" && (
              <div style={{ width: 24, height: 24, borderRadius: 7,
                background: `linear-gradient(135deg, ${VIO}, ${VIOD})`,
                display: "grid", placeItems: "center", flexShrink: 0, marginBottom: 2 }}>
                <I name="spark" size={11} color="#fff"/>
              </div>
            )}
            <div style={{
              maxWidth: "82%",
              padding: "10px 13px",
              borderRadius: m.role === "user"
                ? "14px 14px 4px 14px"
                : "14px 14px 14px 4px",
              background: m.role === "user"
                ? `linear-gradient(135deg, ${BL}, ${BLD})`
                : m.error
                  ? "rgba(248,113,113,0.10)"
                  : `${VIO}12`,
              border: m.role === "user"
                ? "none"
                : m.error
                  ? "1px solid rgba(248,113,113,0.25)"
                  : `1px solid ${VIO}25`,
              fontSize: 13,
              lineHeight: 1.6,
              color: m.role === "user" ? "#fff" : m.error ? RED : TEXT,
              fontFamily: FONT,
              whiteSpace: "pre-wrap",
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {/* Streaming en cours */}
        {(loading || streamText) && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ width: 24, height: 24, borderRadius: 7,
              background: `linear-gradient(135deg, ${VIO}, ${VIOD})`,
              display: "grid", placeItems: "center", flexShrink: 0, marginBottom: 2 }}>
              <I name="spark" size={11} color="#fff"/>
            </div>
            <div style={{ maxWidth: "82%", padding: "10px 13px",
              borderRadius: "14px 14px 14px 4px",
              background: `${VIO}12`, border: `1px solid ${VIO}25`,
              fontSize: 13, lineHeight: 1.6, color: TEXT, fontFamily: FONT }}>
              {streamText || (
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {[0,1,2].map(j => (
                    <div key={j} style={{ width: 6, height: 6, borderRadius: "50%",
                      background: `${VIO}CC`,
                      animation: `coachBounce 1.2s ease-in-out ${j*0.15}s infinite` }}/>
                  ))}
                  <style>{`@keyframes coachBounce{0%,80%,100%{transform:scale(0.6);opacity:0.5}40%{transform:scale(1);opacity:1}}`}</style>
                </div>
              )}
              {streamText && (
                <span style={{ display: "inline-block", width: 2, height: 12,
                  background: `${VIO}CC`, borderRadius: 1, marginLeft: 2,
                  verticalAlign: -2, animation: "blink 1s step-end infinite" }}/>
              )}
              <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
            </div>
          </div>
        )}

        {/* Suggestions (affiché seulement au départ) */}
        {messages.length === 1 && !loading && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "1.2px",
              textTransform: "uppercase", color: DIM, marginBottom: 8, fontFamily: FONT }}>
              Questions suggérées
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  style={{ padding: "9px 13px", background: `${VIO}08`,
                    border: `1px solid ${VIO}25`, borderRadius: 10,
                    color: "#A5B4FC", fontSize: 12, fontFamily: FONT,
                    cursor: "pointer", textAlign: "left",
                    display: "flex", alignItems: "center", gap: 8,
                    transition: "border-color .15s" }}>
                  <span style={{ color: `${VIO}80`, fontSize: 12 }}>→</span>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={msgsEndRef}/>
      </div>

      {/* ── Paywall gratuit ────────────────────────────────────────────── */}
      {!premium && remaining === 0 && (
        <div style={{ margin: "0 16px 10px", padding: "12px 14px",
          background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.28)",
          borderRadius: 14, flexShrink: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: BL, marginBottom: 3, fontFamily: FONT }}>
            {FREE_MSG_LIMIT} questions gratuites utilisées ce mois-ci
          </div>
          <div style={{ fontSize: 11, color: MID, marginBottom: 10, fontFamily: FONT }}>
            Passe à Nutrition PRO pour des questions illimitées.
          </div>
          <button onClick={() => setPaywall && setPaywall(true)}
            style={{ padding: "9px 16px",
              background: `linear-gradient(135deg, ${BL}, ${BLD})`,
              border: "none", borderRadius: 10, color: "#fff",
              fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(59,130,246,0.35)" }}>
            Débloquer Nutrition PRO
          </button>
        </div>
      )}

      {/* ── Input ──────────────────────────────────────────────────────── */}
      <div style={{ padding: "10px 16px 12px",
        borderTop: `1px solid ${BD}`, display: "flex", gap: 8,
        alignItems: "flex-end", flexShrink: 0, background: BG }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={canSend ? "Pose ta question au coach…" : "Limite atteinte ce mois-ci"}
          disabled={!canSend || loading}
          rows={1}
          style={{ flex: 1, background: S1, border: `1px solid ${BD}`,
            borderRadius: 18, padding: "9px 14px",
            color: canSend ? TEXT : MID, fontSize: 13, fontFamily: FONT,
            resize: "none", outline: "none", lineHeight: 1.5,
            maxHeight: 100, overflowY: "auto",
            transition: "border-color .18s",
            opacity: canSend ? 1 : 0.5 }}
          onFocus={e => { if (canSend) e.target.style.borderColor = `${VIO}50`; }}
          onBlur={e => e.target.style.borderColor = BD}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || !canSend || loading}
          style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
            background: input.trim() && canSend && !loading
              ? `linear-gradient(135deg, ${VIO}, ${VIOD})`
              : S2,
            border: "none", display: "grid", placeItems: "center",
            cursor: input.trim() && canSend && !loading ? "pointer" : "default",
            transition: "all .2s",
            boxShadow: input.trim() && canSend && !loading
              ? `0 4px 14px ${VIO}50` : "none" }}>
          <I name="send" size={16} color={input.trim() && canSend && !loading ? "#fff" : DIM} stroke={2}/>
        </button>
      </div>

    </div>
  );
}
