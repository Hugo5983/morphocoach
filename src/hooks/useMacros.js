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
    // Métabolisme de base — Mifflin-St Jeor (référence clinique, plus précise que Harris-Benedict)
    const mb = profil.sexe === "femme"
      ? 10 * p + 6.25 * t - 5 * a - 161
      : 10 * p + 6.25 * t - 5 * a + 5;
    const factAct = ACTIVITE_FACTOR[profil.activite] || 1.375;
    const tdee = Math.round(mb * factAct);
    // Ajustement objectif : surplus (prise) OU déficit (perte) — le déficit était ignoré avant
    const adj = (obj.surplus ?? obj.deficit ?? 0);
    const cycleNum = cycles.length + 1;
    let cycleAdj = 0;
    if (profil.objectif === "hypertrophie") cycleAdj = Math.min((cycleNum - 1) * 50, 200);
    else if (profil.objectif === "poids")  cycleAdj = cycleNum % 4 < 2 ? 0 : -50; // mini-paliers de déficit
    // Plancher de sécurité : jamais sous le BMR pour la perte de poids
    const floor = profil.objectif === "poids" ? Math.round(mb * 1.05) : 1200;
    return Math.max(floor, tdee + adj + cycleAdj);
  }, [profil, obj, cycles]);
  const { pObj, lObj, gObj } = useMemo(() => {
    const p_kg = parseFloat(profil.poids) || 70;
    // Protéines basées sur la masse maigre si le %MG est connu (plus précis pour les sportifs)
    const bf = parseFloat(profil.bodyfat);
    const leanKg = bf > 0 && bf < 60 ? p_kg * (1 - bf / 100) : null;
    const proteinBase = leanKg ? leanKg * (obj.p || 2.0) * 1.18 : p_kg * (obj.p || 2.0);
    const pObj = Math.round(proteinBase);
    const lObj = Math.round(p_kg * (obj.li || 1.0));
    // Glucides = calories restantes après protéines + lipides
    const gObj = Math.max(50, Math.round((calObj - pObj * 4 - lObj * 9) / 4));
    return { pObj, lObj, gObj };
  }, [profil.poids, profil.bodyfat, obj, calObj]);
  return { imc, obj, calObj, pObj, lObj, gObj };
}
