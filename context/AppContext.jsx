// @ts-check
// ─── APP CONTEXT ─────────────────────────────────────────────────────────────
// Remplace le prop drilling de App.jsx vers les features.
// Importer useApp() dans n'importe quel composant pour accéder à l'état global.
// App.jsx reste la source de vérité — ce fichier expose juste le contexte.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext } from"react";

/** @type {React.Context<import('../types').AppContextValue | null>} */
const AppContext = createContext(null);

/**
 * Hook pour accéder au contexte global de l'app.
 * @returns {import('../types').AppContextValue}
 */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp() doit être utilisé dans <AppContext.Provider>");
  return ctx;
}

export default AppContext;
