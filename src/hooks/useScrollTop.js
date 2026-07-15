// @ts-check
// ─── MorphoCoach · useScrollTop — remet la vue en haut à l'ouverture ──────────
// Corrige « écran blanc car j'étais au milieu de la page » : quand une page ou
// une sous-vue s'ouvre, on force le scroll à 0 — window + <html>/<body> +
// tout conteneur marqué [data-scroll-root]. Un double requestAnimationFrame
// rejoue le reset APRÈS le premier paint (utile pour les pages lazy/Suspense
// dont le contenu arrive une frame plus tard).
//
// Usage 1 — au montage d'une page (le plus courant) :
//   import { useScrollTop } from "../../hooks/useScrollTop.js";
//   export default function RecipeDetail(){ useScrollTop(); ... }
//
// Usage 2 — sous-vue qui change SANS démontage (togglée par un state) :
//   useScrollTop(vue);      // rejoue le reset à chaque changement de `vue`

import { useLayoutEffect } from "react";

export function scrollTop() {
  try {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.querySelectorAll("[data-scroll-root]").forEach((el) => { el.scrollTop = 0; });
  } catch {}
}

export function useScrollTop(dep) {
  useLayoutEffect(() => {
    scrollTop();
    let r1, r2;
    r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(scrollTop); });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep]);
}

export default useScrollTop;
