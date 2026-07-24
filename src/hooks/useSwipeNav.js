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
      }, 220);
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
      transition: swiping ?"none" :"transform .28s cubic-bezier(.32,.72,0,1)",
      willChange:"transform",
      touchAction:"pan-y",
      boxShadow: translateX > 0
        ?"-8px 0 30px rgba(0,0,0,0.18)"
        : translateX < 0
          ?"8px 0 30px rgba(0,0,0,0.18)"
          :"none",
    },
  };
}
