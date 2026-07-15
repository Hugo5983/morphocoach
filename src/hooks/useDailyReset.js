import { useEffect } from"react";

export function useDailyReset(storageKey, setValue, resetValue = 0) {
  useEffect(() => {
    const today = new Date().toDateString();
    const lastDay = localStorage.getItem(`mc_${storageKey}`);
    if (lastDay !== today) {
      setValue(resetValue);
      localStorage.setItem(`mc_${storageKey}`, today);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
