import { useMemo } from "react";

export function useTotalRepas(repas) {
  return useMemo(
    () => [...repas.matin, ...repas.midi, ...repas.soir, ...repas.snack].reduce(
      (a, i) => ({ cal: a.cal + i.c, p: a.p + i.p, g: a.g + i.g, l: a.l + i.l }),
      { cal: 0, p: 0, g: 0, l: 0 }
    ),
    [repas]
  );
}
