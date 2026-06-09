// @ts-check
import { useMemo } from "react";

/**
 * Calcule les totaux nutritionnels journaliers.
 * Defensive : tolère un objet `repas` partiellement vide ou null
 * (migration de données, manipulation localStorage…).
 *
 * @param {import('../types').Repas | null | undefined} repas
 * @returns {import('../types').TotauxNutri}
 */
export function useTotalRepas(repas) {
  return useMemo(() => {
    const matin = Array.isArray(repas?.matin) ? repas.matin : [];
    const midi  = Array.isArray(repas?.midi)  ? repas.midi  : [];
    const soir  = Array.isArray(repas?.soir)  ? repas.soir  : [];
    const snack = Array.isArray(repas?.snack) ? repas.snack : [];

    return [...matin, ...midi, ...soir, ...snack].reduce(
      (a, i) => ({
        cal: a.cal + (Number(i?.c) || 0),
        p:   a.p   + (Number(i?.p) || 0),
        g:   a.g   + (Number(i?.g) || 0),
        l:   a.l   + (Number(i?.l) || 0),
      }),
      { cal: 0, p: 0, g: 0, l: 0 }
    );
  }, [repas]);
}
