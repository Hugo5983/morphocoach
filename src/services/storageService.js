// ─── STORAGE SERVICE ────────────────────────────────────────────────────────
// Wrapper sécurisé autour de localStorage avec préfixe "mc_".
const PREFIX = "mc_";

export function get(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch { return defaultValue; }
}

export function set(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; }
  catch { return false; }
}

export function remove(key) {
  try { localStorage.removeItem(PREFIX + key); return true; }
  catch { return false; }
}

export function clearAll() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
    return true;
  } catch { return false; }
}
