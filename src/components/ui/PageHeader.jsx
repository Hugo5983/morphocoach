// ═══════════════════════════════════════════════════════════════════════════
// PAGE HEADER — MorphoCoach
// Barre d'en-tête standard des écrans de détail : bouton retour + titre +
// action optionnelle. Remplace, écran par écran, les barres retour
// réinventées localement (tailles et positions divergentes).
//
// Usage :
//   <PageHeader title="Développé couché" onBack={() => setView(null)} />
//   <PageHeader title="Recette" eyebrow="PETIT-DÉJEUNER" onBack={…}
//               right={<button…/>} sticky />
// ═══════════════════════════════════════════════════════════════════════════

import { C, FONT } from"../../data/constants.js";

export function PageHeader({ title, eyebrow, onBack, right, sticky = false, style }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap: 12,
      padding:"16px 20px 12px",
      ...(sticky && {
        position:"sticky", top: 0, zIndex: 100,
        background:"rgba(246,248,251,0.85)",
        backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)",
      }),
      ...style,
    }}>
      {onBack && (
        <button onClick={onBack} className="tap-icon" aria-label="Retour" style={{
          width: 36, height: 36, borderRadius: 999, flexShrink: 0,
          background: C.s1, border:`1px solid ${C.bd}`,
          display:"grid", placeItems:"center", cursor:"pointer",
          boxShadow: C.shadow, color: C.text,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.2"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
)}
      <div style={{ flex: 1, minWidth: 0 }}>
        {eyebrow && (
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing:"0.1em",
            textTransform:"uppercase", color: C.dim, fontFamily: FONT,
            marginBottom: 2,
          }}>{eyebrow}</div>
)}
        {title && (
          <div style={{
            fontSize: 20, fontWeight: 700, letterSpacing: -0.3,
            lineHeight: 1.2, color: C.text, fontFamily: FONT,
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }}>{title}</div>
)}
      </div>
      {right}
    </div>
);
}
