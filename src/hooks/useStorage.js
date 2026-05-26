import { useState, useCallback } from "react";
import * as storage from "../services/storageService.js";

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
