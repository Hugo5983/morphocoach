// ═══════════════════════════════════════════════════════════════════════════
// SHEET & MODAL — MorphoCoach
// Standardise les ~20 implémentations locales de modales / bottom sheets.
// Fichier additif : aucun composant existant n'est modifié. La migration se
// fait écran par écran en remplaçant les overlays locaux par <BottomSheet>
// ou <Modal> — le comportement (open/close via props) reste identique.
// ═══════════════════════════════════════════════════════════════════════════

import { C, SPACE, RADIUS, SHADOW, Z, TYPE } from"../../styles/tokens.js";
import { Row } from"../primitives/index.jsx";

// ─── Backdrop commun ─────────────────────────────────────────────────────────
const Backdrop = ({ onClose, center, children }) => (
  <div
    onClick={onClose}
    className="fade-in"
    style={{
      position:"fixed", inset: 0,
      background:"rgba(16,19,24,0.5)",
      backdropFilter:"blur(4px)", WebkitBackdropFilter:"blur(4px)",
      zIndex: Z.overlay,
      display:"flex",
      alignItems: center ?"center" :"flex-end",
      justifyContent:"center",
    }}
  >{children}</div>
);

const stop = (e) => e.stopPropagation();

// ─── BOTTOM SHEET — panneau ancré en bas (pattern principal de l'app) ────────
// <BottomSheet title="Ajouter un record" onClose={…}> … </BottomSheet>
export function BottomSheet({ title, onClose, children, footer, maxHeight ="86dvh", style }) {
  return (
    <Backdrop onClose={onClose}>
      <div onClick={stop} className="slide-up" style={{
        width:"100%", maxWidth: 500,
        maxHeight,
        overflowY:"auto",
        background: C.s1,
        borderRadius:`${RADIUS.xl}px ${RADIUS.xl}px 0 0`,
        boxShadow: SHADOW.high,
        padding: SPACE.lg,
        paddingBottom:`calc(${SPACE.lg}px + env(safe-area-inset-bottom, 0px))`,
        zIndex: Z.sheet,
        ...style,
      }}>
        {/* Grabber */}
        <div style={{
          width: 36, height: 4, borderRadius: RADIUS.full,
          background: C.s3, margin:`0 auto ${SPACE.md}px`,
        }}/>
        {title && (
          <Row justify="space-between" style={{ marginBottom: SPACE.lg }}>
            <span style={{ ...TYPE.h3, color: C.text }}>{title}</span>
            <CloseBtn onClose={onClose}/>
          </Row>
)}
        {children}
        {footer && <div style={{ marginTop: SPACE.lg }}>{footer}</div>}
      </div>
    </Backdrop>
);
}

// ─── MODAL — boîte centrée (confirmations, contenus courts) ──────────────────
export function Modal({ title, onClose, children, footer, style }) {
  return (
    <Backdrop onClose={onClose} center>
      <div onClick={stop} className="scale-in" style={{
        width:`calc(100% - ${SPACE.xl * 2}px)`, maxWidth: 400,
        maxHeight:"80dvh", overflowY:"auto",
        background: C.s1,
        borderRadius: RADIUS.xxl,
        boxShadow: SHADOW.high,
        padding: SPACE.xl,
        zIndex: Z.sheet,
        ...style,
      }}>
        {title && (
          <Row justify="space-between" style={{ marginBottom: SPACE.lg }}>
            <span style={{ ...TYPE.h3, color: C.text }}>{title}</span>
            <CloseBtn onClose={onClose}/>
          </Row>
)}
        {children}
        {footer && <div style={{ marginTop: SPACE.lg }}>{footer}</div>}
      </div>
    </Backdrop>
);
}

// ─── Bouton fermer standard ──────────────────────────────────────────────────
function CloseBtn({ onClose }) {
  return (
    <button onClick={onClose} className="tap-icon" aria-label="Fermer" style={{
      width: 30, height: 30, borderRadius: RADIUS.full,
      background: C.s2, border:"none", cursor:"pointer",
      display:"grid", placeItems:"center", flexShrink: 0,
      color: C.dim, fontSize: 14, lineHeight: 1,
    }}></button>
);
}
