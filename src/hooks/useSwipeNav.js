// ─── useSwipeNav — Navigation gestuelle bidirectionnelle ─────────────────────
// Swipe depuis le bord gauche → retour (onBack)
// Swipe depuis le bord droit  → avancer (onForward)
// Zone de détection : 40px depuis chaque bord
// Seuil de déclenchement : 20% de la largeur de l'écran

import { useState, useRef, useCallback } from"react";

export function useSwipeNav(onBack, onForward, { threshold = 0.15 } = {}) {
  const [translateX, setTranslateX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const active = useRef(false);
  const dir = useRef(null); // "back" ou "forward"

  const EDGE = 80;

  const onTouchStart = useCallback((e) => {
    const t = e.touches[0];
    const W = window.innerWidth || 390;
    if (t.clientX <= EDGE) {
      dir.current ="back";
    } else if (t.clientX >= W - EDGE) {
      dir.current ="forward";
    } else {
      return;
    }
    startX.current = t.clientX;
    startY.current = t.clientY;
    active.current = true;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!active.current) return;
    const t = e.touches[0];
    const dx = t.clientX - startX.current;
    const dy = Math.abs(t.clientY - startY.current);
    if (dy > Math.abs(dx) && dy > 18) {
      active.current = false;
      setSwiping(false);
      setTranslateX(0);
      dir.current = null;
      return;
    }
    // Back = swipe vers la droite (dx > 0), Forward = swipe vers la gauche (dx < 0)
    if (dir.current ==="back" && dx > 0) {
      setSwiping(true);
      setTranslateX(dx);
    } else if (dir.current ==="forward" && dx < 0) {
      setSwiping(true);
      setTranslateX(dx);
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!active.current) return;
    active.current = false;
    const W = window.innerWidth || 390;
    const absDx = Math.abs(translateX);
    if (absDx > W * threshold) {
      const targetX = dir.current ==="back" ? W : -W;
      setTranslateX(targetX);
      setSwiping(false);
      const cb = dir.current ==="back" ? onBack : onForward;
      setTimeout(() => {
        setTranslateX(0);
        cb?.();
      }, 300);
    } else {
      setSwiping(false);
      setTranslateX(0);
    }
    dir.current = null;
  }, [translateX, threshold, onBack, onForward]);

  return {
    translateX,
    swiping,
    onTouchStart, onTouchMove, onTouchEnd,
    swipeStyle: {
      transform:`translateX(${translateX}px)`,
      transition: swiping ?"none" :"transform .35s cubic-bezier(.25,.46,.45,.94)",
      willChange:"transform",
      touchAction:"pan-y",
      boxShadow: Math.abs(translateX) > 10
        ? `${translateX > 0 ? "-" : ""}6px 0 24px rgba(0,0,0,0.10)`
        : "none",
      opacity: Math.abs(translateX) > 10 ? Math.max(0.92, 1 - Math.abs(translateX) / 1200) : 1,
    },
  };
}
