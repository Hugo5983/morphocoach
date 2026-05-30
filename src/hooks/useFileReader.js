import { useCallback } from "react";
import { readImageFile } from "../services/nutritionService.js";

export function useFileReader(setPhotos) {
  return useCallback(async (key, file) => {
    if (!file) return;
    try {
      const dataUrl = await readImageFile(file);
      setPhotos((p) => ({ ...p, [key]: dataUrl }));
    } catch (e) { console.error("readFile error:", e); }
  }, [setPhotos]);
}
