// @ts-check
import { useMemo } from "react";
import { OBJ, ACTIVITE_FACTOR } from "../data/constants.js";

/**
 * Calcule les macros et calories cibles du profil.
 * @param {import('../types').Profil} profil
 * @param {import('../types').CycleHistorique[]} cycles
 * @returns {{ imc: string|null, obj: {l:string,icon:string}|null, calObj:number, pObj:number, lObj:number, gObj:number }}
 */
export function useMacros(profil, cycles = []) {
  const imc = useMemo(
    () => profil.poids && profil.taille
      ? (parseFloat(profil.poids) / ((parseFloat(profil.taille) / 100) ** 2)).toFixed(1) : null,
    [profil.poids, profil.taille]
  );
  const obj = useMemo(() => OBJ[profil.objectif] || OBJ.sante, [profil.objectif]);
  const calObj = useMemo(() => {
    const p = parseFloat(profil.poids) || 0;
    const t = parseFloat(profil.taille) || 0;
    const a = parseFloat(profil.age) || 0;
    if (!p || !t || !a) return 2000;
    const mb = profil.sexe === "femme"
      ? 447.593 + 9.247 * p + 3.098 * t - 4.33 * a
      : 88.362 + 13.397 * p + 4.799 * t - 5.677 * a;
    const factAct = ACTIVITE_FACTOR[profil.activite] || 1.375;
    const tdee = Math.round(mb * factAct);
    const adj = obj.surplus || 0;
    const cycleNum = cycles.length + 1;
    let cycleAdj = 0;
    if (profil.objectif === "hypertrophie") cycleAdj = Math.min((cycleNum - 1) * 50, 200);
    else if (profil.objectif === "poids") cycleAdj = cycleNum % 4 < 2 ? 0 : 50;
    return Math.max(1200, tdee + adj + cycleAdj);
  }, [profil, obj, cycles]);
  const { pObj, lObj, gObj } = useMemo(() => {
    const p_kg = parseFloat(profil.poids) || 70;
    const pObj = Math.round(p_kg * (obj.p || 2.0));
    const lObj = Math.round(p_kg * (obj.li || 1.0));
    const gObj = Math.max(50, Math.round((calObj - pObj * 4 - lObj * 9) / 4));
    return { pObj, lObj, gObj };
  }, [profil.poids, obj, calObj]);
  return { imc, obj, calObj, pObj, lObj, gObj };
}
