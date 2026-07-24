// ─── useSwipeBack — Navigation gestuelle iOS native ─────────────────────────
// Swipe depuis le bord gauche de l'écran (≤24px) → si dépasse ~30% de la largeur,
// déclenche onBack. Sinon, animation de retour fluide.
//
// Usage :
//   const { swipeStyle, onTouchStart, onTouchMove, onTouchEnd, BehindOverlay } = useSwipeBack(onClose);
//   <BehindOverlay />
//   <div style={{ ...swipeStyle }} onTouchStart={...} onTouchMove={...} onTouchEnd={...}>
//
// L'option"edgeOnly" (true par défaut) impose que le swipe parte du bord gauche
// (< 24px) — comportement natif iOS.

import { useState, useRef, useCallback } from"react";

export function useSwipeBack(onBack, { edgeOnly = true, threshold = 0.15 } = {}) {
  const [translateX, setTranslateX] = useState(0);
  const [isSwipingBack, setSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const active = useRef(false);

  const onTouchStart = useCallback((e) => {
    const t = e.touches[0];
    // Native iOS : seul un swipe depuis le bord gauche (≤ 24px) déclenche
    if (edgeOnly && t.clientX > 80) return;
    startX.current = t.clientX;
    startY.current = t.clientY;
    active.current = true;
  }, [edgeOnly]);

  const onTouchMove = useCallback((e) => {
    if (!active.current) return;
    const t = e.touches[0];
    const dx = t.clientX - startX.current;
    const dy = Math.abs(t.clientY - startY.current);
    // Si le geste devient majoritairement vertical, on annule
    if (dy > Math.abs(dx) && dy > 18) {
      active.current = false;
      setSwiping(false);
      setTranslateX(0);
      return;
    }
    if (dx > 0) {
      setSwiping(true);
      setTranslateX(dx);
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!active.current) return;
    active.current = false;
    const W = (typeof window !=="undefined" ? window.innerWidth : 390);
    if (translateX > W * threshold) {
      setTranslateX(W);
      setSwiping(false);
      setTimeout(() => {
        setTranslateX(0);
        onBack?.();
      }, 220);
    } else {
      setSwiping(false);
      setTranslateX(0);
    }
  }, [translateX, threshold, onBack]);

  const W = (typeof window !=="undefined" ? window.innerWidth : 390);
  const progress = Math.max(0, Math.min(1, translateX / W));

  return {
    translateX,
    progress,
    isSwipingBack,
    onTouchStart, onTouchMove, onTouchEnd,
    swipeStyle: {
      transform:`translateX(${translateX}px)`,
      transition: isSwipingBack ?"none" :"transform .28s cubic-bezier(.32,.72,0,1)",
      willChange:"transform",
      touchAction:"pan-y",
      // Ombre portée à gauche de la page (style iOS) — donne l'illusion d'une page derrière
      boxShadow: translateX > 0 ?"-8px 0 30px rgba(0,0,0,0.22)" :"none",
    },
  };
}

