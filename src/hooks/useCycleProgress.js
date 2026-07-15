// @ts-check
import { useMemo } from"react";
import { getCycleProgress } from"../services/workoutService.js";

/**
 * Calcule la progression dans le cycle en cours.
 * @param {string | null} cycleStart
 * @returns {import('../types').CycleProgressResult}
 */
export function useCycleProgress(cycleStart) {
  return useMemo(() => getCycleProgress(cycleStart), [cycleStart]);
}
