import { useMemo } from "react";
import { getCycleProgress } from "../services/workoutService.js";

export function useCycleProgress(cycleStart) {
  return useMemo(() => getCycleProgress(cycleStart), [cycleStart]);
}
