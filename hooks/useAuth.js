// ═══════════════════════════════════════════════════════════════════════════
// useAuth — état d'authentification global.
// Fournit : user (ou null), loading (chargement initial), et les actions
// signUp / signIn / signOut. Un seul point de vérité pour toute l'app.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from'react';
import { supabase } from'../services/supabase.js';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Session existante au chargement (utilisateur déjà connecté)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Écoute les changements : connexion, déconnexion, renouvellement de session
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { data, error };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  }, []);

  return { user, loading, signUp, signIn, signOut, resetPassword };
}
