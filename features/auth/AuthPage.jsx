// ═══════════════════════════════════════════════════════════════════════════
// AUTH PAGE — écran de connexion / inscription.
// Affiché uniquement quand personne n'est connecté (voir App.jsx).
// ═══════════════════════════════════════════════════════════════════════════
import { useState } from"react";
import { C, FONT } from"../../data/constants.js";
import { useAuth } from"../../hooks/useAuth.js";

export default function AuthPage() {
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState("signin"); //"signin" |"signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const isSignup = mode ==="signup";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setInfo(""); setBusy(true);
    try {
      if (isSignup) {
        if (password.length < 6) {
          setError("Le mot de passe doit faire au moins 6 caractères.");
          setBusy(false); return;
        }
        const { error } = await signUp(email.trim(), password, fullName.trim());
        if (error) { setError(traduireErreur(error.message)); setBusy(false); return; }
        setInfo("Compte créé ! Vérifie tes emails pour confirmer ton adresse, puis connecte-toi.");
        setMode("signin");
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) { setError(traduireErreur(error.message)); setBusy(false); return; }
        // Succès : useAuth détecte la session, App.jsx bascule automatiquement.
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      minHeight:"100vh", background: C.bg, fontFamily: FONT,
      display:"flex", flexDirection:"column", justifyContent:"center",
      padding:"24px 20px", boxSizing:"border-box",
    }}>
      {/* Logo / titre */}
      <div style={{ textAlign:"center", marginBottom: 32 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin:"0 auto 16px",
          background:"linear-gradient(135deg, #2E48D9, #3C5BFF)",
          display:"grid", placeItems:"center",
          boxShadow:"0 8px 24px rgba(60,91,255,0.35)",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 8v8M9 5v14M15 5v14M19 8v8M9 12h6"/>
          </svg>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>
          Morpho<span style={{ color: C.accent }}>Coach</span>
        </div>
        <div style={{ fontSize: 13, color: C.dim, fontWeight: 500, marginTop: 4 }}>
          {isSignup ?"Crée ton compte pour commencer" :"Content de te revoir"}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{
        background: C.s1, borderRadius: 20, padding: 20,
        boxShadow: C.shadow, display:"flex", flexDirection:"column", gap: 12,
      }}>
        {isSignup && (
          <Field label="Nom" value={fullName} onChange={setFullName} type="text"
                 placeholder="Ton prénom" autoComplete="name" required />
)}
        <Field label="Email" value={email} onChange={setEmail} type="email"
               placeholder="toi@exemple.com" autoComplete="email" required />
        <Field label="Mot de passe" value={password} onChange={setPassword} type="password"
               placeholder="••••••••" autoComplete={isSignup ?"new-password" :"current-password"} required />

        {error && (
          <div style={{
            fontSize: 12.5, fontWeight: 600, color: C.red,
            background:"rgba(229,72,77,0.08)", border:"1px solid rgba(229,72,77,0.25)",
            borderRadius: 12, padding:"10px 12px",
          }}>{error}</div>
)}
        {info && (
          <div style={{
            fontSize: 12.5, fontWeight: 600, color: C.green,
            background:"rgba(18,183,106,0.08)", border:"1px solid rgba(18,183,106,0.25)",
            borderRadius: 12, padding:"10px 12px",
          }}>{info}</div>
)}

        <button type="submit" disabled={busy} style={{
          height: 48, borderRadius: 16, border:"none", marginTop: 4,
          background: busy ? C.s3 :"linear-gradient(135deg, #2E48D9, #3C5BFF)",
          color:"#FFF", fontSize: 14, fontWeight: 700, fontFamily: FONT,
          cursor: busy ?"default" :"pointer",
          boxShadow: busy ?"none" :"0 8px 24px rgba(60,91,255,0.35)",
        }}>
          {busy ?"..." : isSignup ?"Créer mon compte" :"Se connecter"}
        </button>
      </form>

      <button
        onClick={() => { setMode(isSignup ?"signin" :"signup"); setError(""); setInfo(""); }}
        style={{
          marginTop: 20, background:"none", border:"none", cursor:"pointer",
          fontSize: 13, fontWeight: 600, color: C.dim, fontFamily: FONT,
        }}
      >
        {isSignup ?"Déjà un compte ?" :"Pas encore de compte ?"}
        <span style={{ color: C.accent }}>{isSignup ?"Se connecter" :"Créer un compte"}</span>
      </button>
    </div>
);
}

function Field({ label, value, onChange, type, placeholder, autoComplete, required }) {
  return (
    <label style={{ display:"flex", flexDirection:"column", gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily: FONT }}>
        {label}
      </span>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete} required={required}
        style={{
          height: 44, borderRadius: 12, border:`1px solid ${C.bd}`,
          background: C.s2, padding:"0 14px", fontSize: 14, fontFamily: FONT,
          color: C.text, outline:"none", boxSizing:"border-box",
        }}
      />
    </label>
);
}

// Messages Supabase traduits en français simple pour l'utilisateur
function traduireErreur(msg) {
  if (msg.includes("Invalid login credentials")) return"Email ou mot de passe incorrect.";
  if (msg.includes("User already registered")) return"Un compte existe déjà avec cet email.";
  if (msg.includes("Email not confirmed")) return"Confirme ton email avant de te connecter (regarde tes spams).";
  if (msg.includes("Password should be")) return"Le mot de passe doit faire au moins 6 caractères.";
  return"Une erreur est survenue. Réessaie dans un instant.";
}
