// @ts-check
import { useMemo } from "react";
import { computeStreak } from "../services/workoutService.js";

/**
 * Retourne le nombre de jours consécutifs de séances.
 * @param {import('../types').Programme | null} prog
 * @returns {number}
 */
export function useStreak(prog) {
  return useMemo(() => computeStreak(prog), [prog]);
}
