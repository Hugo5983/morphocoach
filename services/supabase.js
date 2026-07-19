// ═══════════════════════════════════════════════════════════════════════════
// CLIENT SUPABASE — point d'entrée unique.
// Toute l'app importe depuis ce fichier, jamais de nouvelle connexion ailleurs.
// Les deux valeurs viennent des variables d'environnement (jamais en dur ici),
// configurées dans Vercel → Settings → Environment Variables.
// ═══════════════════════════════════════════════════════════════════════════
import { createClient } from'@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Erreur explicite en dev si les variables ne sont pas configurées,
  // plutôt qu'un plantage silencieux plus loin dans l'app.
  console.error(
"[Supabase] Variables d'environnement manquantes : VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY"
);
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,      // reste connecté entre les visites
    autoRefreshToken: true,    // renouvelle la session automatiquement
    detectSessionInUrl: true,  // gère les liens de confirmation email
  },
});
