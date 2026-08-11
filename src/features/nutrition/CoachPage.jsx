// ─── CoachPage.jsx ────────────────────────────────────────────────────────────
// Page Coach Nutrition IA — plein écran, accessible via le bouton flottant.
// Streaming token par token via /api/generate.
// Limite gratuit : FREE_MSG_LIMIT questions/mois. PRO : illimité.

import { useState, useRef, useEffect, useCallback } from"react";
import { Ico as UIco } from"../../components/ui/Icon.jsx";
import useScrollTop from"../../hooks/useScrollTop.js";
import { C, DARK, FONT, SERIF } from"../../data/constants.js";
import { useSwipeBack } from"../../hooks/useSwipeBack.js";


// ─── Constantes ───────────────────────────────────────────────────────────────
const FREE_MSG_LIMIT = 3;
const STORAGE_KEY    ="morphocoach_coach_usage"; // { count, month }

const BG   = C.bg;
const S1   = C.s1;
const S2   = C.s2;
const BD   = C.bd ||"rgba(0,0,0,0.05)";
const TEXT = C.text ||"${C.text}";
const MID  = C.mid ||"${C.mid}";
const DIM  = C.dim ||"${C.dim}";
const BL   = C.accent || C.accent;
const BLD  = C.accentDk || C.accentDk;
const VIO  ="#3C5BFF";
const VIOD ="#2E48D9";
const GRN  ="#12B76A";
const AMB  ="#F59E0B";
const RED  ="#E5484D";

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
function I({name,size=18,color="currentColor",stroke=1.8,...r}){
  return <UIco name={name} size={size} color={color} stroke={stroke} {...r}/>;
}

// Robot Coach IA — rendu vectoriel intégré au composant pour éviter une image
// rectangulaire et garder le personnage net à toutes les tailles d'écran.
function CoachRobot({ size=190, compact=false }) {
  const h = size * 0.875;
  return (
    <svg width={size} height={h} viewBox="0 0 240 210" role="img" aria-label="Coach IA"
      style={{ display:"block", overflow:"visible", filter:"drop-shadow(0 0 22px rgba(55,110,255,.34))" }}>
      <defs>
        <linearGradient id="crHead" x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#FFFFFF"/>
          <stop offset="0.55" stopColor="#E9ECF7"/>
          <stop offset="1" stopColor="#BFC7DA"/>
        </linearGradient>
        <linearGradient id="crBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F8FAFF"/>
          <stop offset="0.58" stopColor="#D9DEEA"/>
          <stop offset="1" stopColor="#AEB8CE"/>
        </linearGradient>
        <linearGradient id="crFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#101A2F"/>
          <stop offset="1" stopColor="#020711"/>
        </linearGradient>
        <linearGradient id="crBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8BE7FF"/>
          <stop offset="0.5" stopColor="#3C8DFF"/>
          <stop offset="1" stopColor="#4A45FF"/>
        </linearGradient>
        <filter id="crGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="7" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* halo */}
      <ellipse cx="122" cy="184" rx="66" ry="12" fill="rgba(48,110,255,.28)" filter="url(#crGlow)"/>

      {!compact && (
        <>
          {/* shoulders / body */}
          <path d="M82 151 C83 132 101 121 120 121 C139 121 157 132 159 151 L165 181 C151 191 91 191 75 181 Z" fill="url(#crBody)" stroke="#A9B5CE" strokeWidth="2"/>
          {/* arms */}
          <path d="M80 149 C67 151 58 160 55 173 C53 181 59 186 66 183 L84 169" fill="url(#crBody)" stroke="#A9B5CE" strokeWidth="2"/>
          <path d="M160 149 C173 151 182 160 185 173 C187 181 181 186 174 183 L156 169" fill="url(#crBody)" stroke="#A9B5CE" strokeWidth="2"/>
          {/* chest ring */}
          <circle cx="120" cy="158" r="11" fill="#091020" stroke="#B8C4DA" strokeWidth="3"/>
          <circle cx="120" cy="158" r="6" fill="none" stroke="url(#crBlue)" strokeWidth="3" filter="url(#crGlow)"/>
        </>
      )}

      {/* side modules */}
      <rect x="42" y="48" width="24" height="54" rx="12" fill="url(#crBody)" stroke="#B4BED2" strokeWidth="2"/>
      <rect x="174" y="48" width="24" height="54" rx="12" fill="url(#crBody)" stroke="#B4BED2" strokeWidth="2"/>
      <circle cx="54" cy="75" r="7" fill="#141F35" stroke="#77DFFF" strokeWidth="2"/>
      <circle cx="186" cy="75" r="7" fill="#141F35" stroke="#77DFFF" strokeWidth="2"/>

      {/* head */}
      <rect x="60" y="24" width="120" height="105" rx="42" fill="url(#crHead)" stroke="#C6CEE0" strokeWidth="2"/>
      <rect x="74" y="40" width="92" height="66" rx="28" fill="url(#crFace)" stroke="#D6DBE7" strokeWidth="2"/>
      {/* eyes */}
      <ellipse cx="101" cy="72" rx="9" ry="13" fill="#6FE7FF" filter="url(#crGlow)"/>
      <ellipse cx="139" cy="72" rx="9" ry="13" fill="#6FE7FF" filter="url(#crGlow)"/>
      {/* smile */}
      <path d="M111 88 Q120 96 129 88" fill="none" stroke="#62E8FF" strokeWidth="3" strokeLinecap="round" filter="url(#crGlow)"/>
      {/* head highlight */}
      <path d="M83 34 C101 25 138 25 157 35" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
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
// buildSystemPrompt : déplacé côté serveur (/api/coach-chat) — la connaissance ne vit plus dans le bundle client.

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
  useScrollTop();
  const [messages, setMessages] = useState([
    {
      role:"assistant",
      content:`Bonjour ${profil?.prenom ||""} ! Je suis ton Coach Nutrition. J'ai accès à ton bilan des 14 derniers jours. Pose-moi tes questions sur ton alimentation, tes macros ou tes carences.`,
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
    msgsEndRef.current?.scrollIntoView({ behavior:"smooth" });
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
    const userMsg = { role:"user", content: q, ts: Date.now() };
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

      // Le system prompt et la connaissance MorphoCoach sont construits CÔTÉ
      // SERVEUR (/api/coach-chat) — on n'envoie que les données de contexte.
      const res = await fetch("/api/coach-chat", {
        method:"POST",
        headers: {"Content-Type":"application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          contexte: {
            prenom:  profil?.prenom,
            objectif: obj?.l,
            calObj, pObj, gObj, lObj,
            // L'analyse du journal (bilan) n'est envoyée qu'aux comptes PRO —
            // même une question reformulée ne peut pas y accéder gratuitement.
            bilan: premium ? bilan : null,
          },
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ||`Erreur ${res.status}`);
      }

      const data = await res.json();
      const answer = (data.answer ||"").trim()
        ||"Je n'ai pas pu générer une réponse. Réessaie.";

      // Simule le streaming (l'API /api/generate ne stream pas — on affiche mot par mot)
      setLoading(false);
      const words = answer.split("");
      let built ="";
      for (let i = 0; i < words.length; i++) {
        built += (i > 0 ?"" :"") + words[i];
        setStream(built);
        await new Promise(r => setTimeout(r, 18));
      }
      setStream("");
      setMessages(prev => [...prev, { role:"assistant", content: answer, ts: Date.now() }]);

    } catch (err) {
      if (err.name ==="AbortError") return;
      setLoading(false);
      setStream("");
      setMessages(prev => [...prev, {
        role:"assistant",
        content:"Une erreur s'est produite. Vérifie ta connexion et réessaie.",
        ts: Date.now(),
        error: true,
      }]);
    }
  }, [input, loading, messages, canSend, premium, usage, profil, obj, calObj, pObj, gObj, lObj, bilan]);

  const handleKey = (e) => {
    if (e.key ==="Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  const { swipeStyle, onTouchStart, onTouchMove, onTouchEnd } = useSwipeBack(onBack);
  const firstName = profil?.prenom || "Hugo";
  const scoreValue = bilan?.score ?? "—";
  const kcalRest = Math.max(0, Math.round((calObj || 0) - (bilan?.avgKcal || 0)));
  const protRest = Math.max(0, Math.round((pObj || 0) - (bilan?.avgProt || 0)));
  const journalDays = `${bilan?.nbLogged ?? 0}/${bilan?.totalDays ?? 14} j`;

  const SUGGESTION_ICONS = ["search", "target", "progress", "mealprep", "fiber", "star"];

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      style={{
        position:"relative",
        background:DARK.bgDeep,
        color:"#F6F7F9",
        display:"block",
        fontFamily: FONT,
        minHeight:"calc(100vh - 120px)",
        boxSizing:"border-box",
        ...swipeStyle,
      }}>

      {/* HERO COACH IA */}
      <div style={{ padding:"18px 20px 0" }}>
        <div style={{
          position:"relative", overflow:"hidden",
          border:"1px solid rgba(60,91,255,.75)",
          borderRadius:24,
          background:"radial-gradient(circle at 82% 32%, rgba(42,82,255,.32), transparent 34%), linear-gradient(145deg,#0A0D14 0%,#070A10 58%,#0B0E12 100%)",
          boxShadow:"0 0 34px rgba(60,91,255,.12), inset 0 0 40px rgba(60,91,255,.04)",
          minHeight: 292,
        }}>
          <div style={{ position:"absolute", inset:0, pointerEvents:"none",
            background:"radial-gradient(circle at 84% 44%, rgba(60,91,255,.24), transparent 30%)" }}/>

          <div style={{ position:"relative", zIndex:2, padding:"22px 20px 0", minHeight:292 }}>
            <div style={{ fontSize:12, fontWeight:800, letterSpacing:".14em", color:"#3C8DFF",
              textTransform:"uppercase", marginBottom:13 }}>COACH IA</div>
            <div style={{ width:"61%", maxWidth:300, fontSize:25, lineHeight:1.06, fontWeight:850,
              letterSpacing:"-.03em", color:"#F7F8FC" }}>
              Salut {firstName},<br/>j’ai lu ton journal.
            </div>
            <div style={{ width:"58%", maxWidth:286, marginTop:11, fontSize:14.5, lineHeight:1.42,
              color:"rgba(246,247,249,.72)" }}>
              Pose-moi tes questions sur ton alimentation et tes macros.
            </div>

            <div style={{ position:"absolute", right:0, top:12, width:190, height:166, pointerEvents:"none" }}>
              <div style={{ position:"absolute", inset:8, borderRadius:"50%",
                background:"radial-gradient(circle, rgba(69,115,255,.30) 0%, rgba(65,93,255,.12) 34%, transparent 70%)",
                filter:"blur(8px)" }}/>
              <CoachRobot size={190}/>
            </div>

            {/* Metrics inside hero */}
            <div style={{
              position:"absolute", left:14, right:14, bottom:14,
              display:"grid", gridTemplateColumns:"repeat(4,1fr)",
              background:"rgba(5,8,13,.88)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
              border:"1px solid rgba(255,255,255,.11)", borderRadius:18,
              overflow:"hidden",
            }}>
              {[
                { icon:"target", label:"Objectif", value:obj?.l || "Prise de masse", color:"#F6F7F9" },
                { icon:"flame", label:"Calories restantes", value:`${kcalRest} kcal`, color:"#3C7CFF" },
                { icon:"bolt", label:"Protéines restantes", value:`${protRest} g`, color:"#3C7CFF" },
                { icon:"calendar", label:"Journal", value:journalDays, color:"#3C7CFF" },
              ].map((m,i) => (
                <div key={m.label} style={{ padding:"11px 8px 12px", minWidth:0,
                  borderRight:i<3 ? "1px solid rgba(255,255,255,.10)" : "none" }}>
                  <I name={m.icon} size={16} color={m.color}/>
                  <div style={{ marginTop:6, fontSize:9, color:"rgba(246,247,249,.62)", lineHeight:1.15,
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{m.label}</div>
                  <div style={{ marginTop:4, fontSize:11.8, fontWeight:700, color:m.color,
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SCORE STRIP */}
      <div style={{ padding:"18px 20px 0" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
          background:"rgba(7,10,16,.86)", border:"1px solid rgba(60,91,255,.35)",
          borderRadius:18, overflow:"hidden" }}>
          {[
            { v:scoreValue, l:"Score nutrition", info:true, c:scoreValue === "—" ? "#F6F7F9" : "#3C7CFF" },
            { v:"—", l:"kcal / j", info:true, c:"#F6F7F9" },
            { v:`${bilan?.nbLogged ?? 0}/${bilan?.totalDays ?? 14}`, l:"Jours analysés", c:"#F6F7F9" },
            { v:bilan?.avgProt ? `${Math.round(bilan.avgProt)} g` : "—", l:"Protéines / j", info:true, c:"#3C7CFF" },
          ].map((m,i) => (
            <div key={m.l} style={{ padding:"13px 8px 12px", textAlign:"center",
              borderRight:i<3 ? "1px solid rgba(255,255,255,.10)" : "none" }}>
              <div style={{ fontSize:16, lineHeight:1.1, fontWeight:800, color:m.c }}>{m.v}</div>
              <div style={{ marginTop:6, fontSize:9, color:"rgba(246,247,249,.62)", lineHeight:1.15 }}>{m.l}{m.info ? " ⓘ" : ""}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT — flux normal de la page : un seul scroll vertical global */}
      <div style={{ padding:"18px 16px 0" }}>

        {/* Welcome assistant bubble */}
        {messages.length === 1 && (
          <div style={{ display:"flex", alignItems:"flex-end", gap:10, margin:"0 0 20px 0" }}>
            <div style={{ width:42, height:42, flexShrink:0, borderRadius:"50%",
              border:"1px solid #3C5BFF", background:"#080C14",
              display:"grid", placeItems:"center", overflow:"hidden",
              boxShadow:"0 0 20px rgba(60,91,255,.25)" }}>
              <CoachRobot size={42} compact/>
            </div>
            <div style={{ position:"relative", maxWidth:"calc(100% - 68px)",
              padding:"16px 18px", borderRadius:"20px 20px 20px 5px",
              background:"linear-gradient(145deg,#0B101A,#070A11)",
              border:"1px solid rgba(60,91,255,.58)", color:"#F6F7F9",
              fontSize:14.5, lineHeight:1.55, boxShadow:"0 0 24px rgba(60,91,255,.08)" }}>
              Bonjour {firstName} ! Je suis ton Coach Nutrition.<br/>
              J’ai accès à ton bilan des 14 derniers jours.<br/>
              Pose-moi tes questions sur ton alimentation, tes macros ou tes carences.
            </div>
          </div>
        )}

        {/* Conversation */}
        {messages.length > 1 && messages.slice(1).map((m,i) => (
          <div key={i} style={{ display:"flex", justifyContent:m.role === "user" ? "flex-end" : "flex-start",
            gap:8, marginBottom:12 }}>
            {m.role === "assistant" && (
              <div style={{ width:34, height:34, borderRadius:"50%", flexShrink:0, overflow:"hidden",
                border:"1px solid rgba(60,91,255,.7)", background:"#080C14" }}>
                <CoachRobot size={34} compact/>
              </div>
            )}
            <div style={{ maxWidth:"82%", padding:"12px 14px", borderRadius:m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background:m.role === "user" ? "linear-gradient(135deg,#315CFF,#2044D9)" : "#0A0E16",
              border:m.role === "user" ? "none" : "1px solid rgba(60,91,255,.45)",
              color:"#F6F7F9", fontSize:14, lineHeight:1.55, whiteSpace:"pre-wrap" }}>{m.content}</div>
          </div>
        ))}

        {/* Streaming */}
        {(loading || streamText) && (
          <div style={{ display:"flex", gap:8, alignItems:"flex-end", marginBottom:14 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", flexShrink:0, overflow:"hidden",
              border:"1px solid rgba(60,91,255,.7)", background:"#080C14" }}>
              <CoachRobot size={34} compact/>
            </div>
            <div style={{ padding:"12px 14px", borderRadius:"16px 16px 16px 4px", background:"#0A0E16",
              border:"1px solid rgba(60,91,255,.45)", color:"#F6F7F9", fontSize:14, lineHeight:1.55 }}>
              {streamText || <div style={{ display:"flex", gap:7 }}>
                {[0,1,2].map(j => <span key={j} style={{ width:6, height:6, borderRadius:"50%", background:"#3C5BFF",
                  animation:`coachBounce 1.2s ease-in-out ${j*0.15}s infinite` }}/>) }
                <style>{`@keyframes coachBounce{0%,80%,100%{transform:scale(.6);opacity:.45}40%{transform:scale(1);opacity:1}}`}</style>
              </div>}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {messages.length === 1 && !loading && (
          <div>
            <div style={{ fontSize:12.5, fontWeight:800, letterSpacing:".12em", textTransform:"uppercase",
              color:"#1680FF", marginBottom:11 }}>Questions suggérées</div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {SUGGESTIONS.map((s,i) => (
                <button key={i} onClick={() => sendMessage(s)} style={{ width:"100%", minHeight:52,
                  padding:"7px 10px", background:"linear-gradient(180deg,rgba(10,14,22,.98),rgba(6,10,17,.98))",
                  border:"1px solid rgba(60,91,255,.34)", borderRadius:15, color:"#F6F7F9",
                  fontSize:13.5, fontFamily:FONT, cursor:"pointer", textAlign:"left",
                  display:"flex", alignItems:"center", gap:11 }}>
                  <span style={{ width:38, height:38, borderRadius:11, flexShrink:0, display:"grid", placeItems:"center",
                    background:"#0C1422", border:"1px solid rgba(60,91,255,.35)", boxShadow:"inset 0 0 14px rgba(60,91,255,.06)" }}>
                    <I name={SUGGESTION_ICONS[i] || "star"} size={19} color="#4B8DFF"/>
                  </span>
                  <span style={{ flex:1 }}>{s}</span>
                  <I name="arrowRight" size={18} color="#1680FF" stroke={2}/>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={msgsEndRef}/>
      </div>

      {/* PAYWALL */}
      {!premium && remaining === 0 && (
        <div style={{ margin:"16px 16px 0", padding:"12px 14px", background:"rgba(60,91,255,.08)",
          border:"1px solid rgba(60,91,255,.35)", borderRadius:15, flexShrink:0 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#4B8DFF", marginBottom:4 }}>3 questions gratuites utilisées ce mois-ci</div>
          <div style={{ fontSize:11, color:"rgba(246,247,249,.62)", marginBottom:10 }}>Passe à Nutrition PRO pour des questions illimitées.</div>
          <button onClick={() => setPaywall && setPaywall(true)} style={{ padding:"9px 14px", background:"#3C5BFF",
            border:"none", borderRadius:11, color:"#FFF", fontSize:12, fontWeight:700, fontFamily:FONT }}>Débloquer Nutrition PRO</button>
        </div>
      )}

      {/* INPUT */}
      <div style={{ padding:"14px 16px 6px", borderTop:"1px solid rgba(255,255,255,.08)",
        display:"flex", gap:10, alignItems:"flex-end", flexShrink:0, background:DARK.bgDeep }}>
        <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder={canSend ? "Pose ta question au coach…" : "Limite atteinte ce mois-ci"}
          disabled={!canSend || loading} rows={1}
          style={{ flex:1, minHeight:48, background:"#070B12", border:"1px solid rgba(255,255,255,.16)",
            borderRadius:25, padding:"12px 16px", color:"#F6F7F9", fontSize:14, fontFamily:FONT,
            resize:"none", outline:"none", lineHeight:1.4, maxHeight:100, overflowY:"auto" }} />
        <button onClick={() => sendMessage()} disabled={!input.trim() || !canSend || loading}
          style={{ width:56, height:56, borderRadius:18, flexShrink:0,
            background:input.trim() && canSend && !loading ? "linear-gradient(135deg,#2E63FF,#0B5CFF)" : "#0C1420",
            border:input.trim() && canSend && !loading ? "1px solid rgba(75,141,255,.85)" : "1px solid rgba(255,255,255,.10)",
            display:"grid", placeItems:"center", cursor:input.trim() && canSend && !loading ? "pointer" : "default",
            boxShadow:input.trim() && canSend && !loading ? "0 0 22px rgba(60,91,255,.45)" : "none" }}>
          <I name="send" size={22} color={input.trim() && canSend && !loading ? "#FFF" : "#667085"} stroke={2}/>
        </button>
      </div>
    </div>
  );
}
