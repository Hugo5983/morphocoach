import { useState, useCallback, useRef } from "react";

export function useNotif() {
  const [notif, setNotif] = useState(null);
  const timerRef = useRef(null);
  const push = useCallback((icon, title, body) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotif({ icon, title, body });
    timerRef.current = setTimeout(() => setNotif(null), 4500);
  }, []);
  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotif(null);
  }, []);
  return { notif, push, dismiss };
}
