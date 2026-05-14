import { useState, useCallback } from "react";

/**
 * useStorage — Identique à useState mais sauvegarde automatiquement dans localStorage.
 * Toutes les clés sont préfixées "mc_" pour éviter les collisions.
 *
 * Usage : const [profil, setProfil] = useStorage("profil", defaultValue);
 */
export function useStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem("mc_" + key);
      if (saved === null) return defaultValue;
      return JSON.parse(saved);
    } catch {
      return defaultValue;
    }
  });

  const setAndSave = useCallback((next) => {
    setValue(prev => {
      const resolved = typeof next === "function" ? next(prev) : next;
      try {
        localStorage.setItem("mc_" + key, JSON.stringify(resolved));
      } catch {}
      return resolved;
    });
  }, [key]);

  return [value, setAndSave];
}
