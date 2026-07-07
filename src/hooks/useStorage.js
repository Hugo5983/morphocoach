// @ts-check
import { useState, useCallback } from "react";
import * as storage from "../services/storageService.js";

/**
 * Hook de stockage persistant (localStorage).
 * @template T
 * @param {string} key
 * @param {T} defaultValue
 * @returns {[T | null, React.Dispatch<React.SetStateAction<T | null>>]}
 */
export function useStorage(key, defaultValue) {
  const [value, setValue] = useState(() => storage.get(key, defaultValue));
  const setAndSave = useCallback((next) => {
    setValue((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      storage.set(key, resolved);
      return resolved;
    });
  }, [key]);
  return [value, setAndSave];
}
