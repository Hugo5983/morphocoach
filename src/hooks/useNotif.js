import { useState, useCallback } from "react";

export function useNotif() {
  const [notif, setNotif] = useState(null);
  const push = useCallback((icon, title, body) => {
    setNotif({ icon, title, body });
    setTimeout(() => setNotif(null), 4500);
  }, []);
  const dismiss = useCallback(() => setNotif(null), []);
  return { notif, push, dismiss };
}
