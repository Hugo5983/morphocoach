// @ts-check
// ─── MorphoCoach · HomePage ───────────────────────────────────────────────────
import { useState, useMemo } from"react";
import { C, FONT, NUM } from"../../data/constants.js";
import { ID } from"../../components/ui/Icon.jsx";
import BadgesPage from"./BadgesPage.jsx";
import { getBadgeStates } from"../../services/badgeService.js";
import {
  HeroCard, NutritionCard, PacksCard,
  BadgesCard, StreakCard, CoachIACard,
} from"./components/HomeCards.jsx";

// ─── Rapport PRO (vue dédiée) ─────────────────────────────────────────────────
function RapportView({ premium, setPaywall, setPaywallNutrition }) {
  const cards = [
    {
      title:"Entraînement Pro",
      subtitle:"Programme sur-mesure selon ta morphologie",
      features:[
        {i:"coachDuo", t:"Coach morphologique", s:"Programme adapté à ta morphologie précise"},
        {i:"scale",    t:"Exercices correctifs", s:"Compensation des asymétries & déséquilibres"},
        {i:"calendarDuo", t:"Cycle 6 semaines", s:"Périodisation pro pour des gains durables"},
        {i:"scanDuo",  t:"Suivi 3D", s:"Mesures corporelles et photo-progression"},
      ],
      accent: C.accent,
      accentLt:"rgba(60,91,255,0.12)",
      onUnlock:() => setPaywall(true),
    },
    {
      title:"Nutrition Pro",
      subtitle:"Recettes premium, analyse photo, bilan bi-mensuel",
      features:[
        {i:"nutrition", t:"Analyse macro avancée", s:"Répartition P/G/L personnalisée à tes objectifs"},
        {i:"cameraDuo", t:"Scan photo", s:"Identifie les aliments en photo pour les logger"},
        {i:"bookDuo",   t:"Recettes premium", s:"500+ recettes adaptées à ton profil"},
        {i:"trophyDuo", t:"Bilan bi-mensuel", s:"Rapport détaillé de ta progression nutritive"},
      ],
      accent: C.green,
      accentLt:"rgba(18,183,106,0.12)",
      onUnlock:() => setPaywallNutrition(true),
    },
  ];

  return (
    <div style={{ padding:"20px 20px 32px", display:"flex", flexDirection:"column", gap: 20 }}>
      {cards.map((card) => (
        <div key={card.title} style={{
          background: C.s1, borderRadius: 24, padding:"24px 22px",
          boxShadow: C.shadow, border:`1px solid ${C.bd}`,
          position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top: 0, left: 0, right: 0, height: 3,
            background: card.accent }} />
          <div style={{ display:"flex", alignItems:"center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: card.accentLt,
              display:"grid", placeItems:"center", flexShrink: 0,
            }}>
              <ID name={card.features[0].i} size={20} dark={false} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: FONT, color: C.text }}>
                {card.title}
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: C.dim, fontFamily: FONT }}>
                {card.subtitle}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, display:"flex", flexDirection:"column", gap: 14 }}>
            {card.features.map((f) => (
              <div key={f.t} style={{ display:"flex", alignItems:"flex-start", gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: card.accentLt,
                  display:"grid", placeItems:"center",
                }}>
                  <ID name={f.i} size={17} dark={false} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: FONT }}>{f.t}</div>
                  <div style={{ fontSize: 11, color: C.dim, fontWeight: 500, marginTop: 2, lineHeight: 1.4, fontFamily: FONT }}>{f.s}</div>
                </div>
              </div>
            ))}
          </div>

          {!premium && (
            <button onClick={card.onUnlock} className="tap" style={{
              width:"100%", marginTop: 22, padding: 14, borderRadius: 14,
              background: card.accent, color:"#FFF", border:"none",
              fontSize: 15, fontWeight: 700, fontFamily: FONT, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap: 8,
            }}>
              Débloquer
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function HomePage({
  profil, prog, setTab, premium, setPaywall, setPaywallNutrition,
  calObj, pObj, gObj, lObj, totR, getStreak, calSess, subView,
}) {
  const [showBadges, setShowBadges] = useState(false);
  const badgeStates = useMemo(() => getBadgeStates({ calObj, pObj }), [calObj, pObj, showBadges]);

  if (showBadges) {
    return <BadgesPage onBack={() => setShowBadges(false)} calObj={calObj} pObj={pObj} />;
  }

  // ── Vue Rapport ──
  if (subView ==="rapport") {
    return (
      <RapportView
        premium={premium}
        setPaywall={setPaywall}
        setPaywallNutrition={setPaywallNutrition}
      />
    );
  }

  // ── Vue Accueil (today / default) ──
  const streak = getStreak ?? 0;
  return (
    <div style={{
      paddingBottom: 32,
      fontFamily: FONT,
      WebkitFontSmoothing:"antialiased",
    }}>
      <HeroCard prog={prog} calSess={calSess} setTab={setTab} />
      <StreakCard streak={streak} />
      <NutritionCard
        calObj={calObj} pObj={pObj} gObj={gObj} lObj={lObj}
        totR={totR} setTab={setTab}
        setPaywallNutrition={setPaywallNutrition} premium={premium}
      />
      <BadgesCard badgeStates={badgeStates} onVoirTout={() => setShowBadges(true)} />
      <CoachIACard />
      <PacksCard premium={premium} setPaywall={setPaywall} setPaywallNutrition={setPaywallNutrition} />
    </div>
  );
}
