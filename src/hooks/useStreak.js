import { useMemo } from "react";
import { computeStreak } from "../services/workoutService.js";

export function useStreak(prog) {
  return useMemo(() => computeStreak(prog), [prog]);
}
