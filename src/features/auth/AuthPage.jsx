// ═══════════════════════════════════════════════════════════════════════════
// AUTH PAGE — écran de connexion / inscription (thème « Précision »).
// Affiché uniquement quand personne n'est connecté (voir App.jsx).
// ═══════════════════════════════════════════════════════════════════════════
import { useState } from"react";
import { C, FONT } from"../../data/constants.js";
import { useAuth } from"../../hooks/useAuth.js";
import { I } from"../../components/ui/Icon.jsx";

export default function AuthPage() {
  const { signUp, signIn, resetPassword, signInWithOAuth } = useAuth();
  const [mode, setMode] = useState("signin"); //"signin" |"signup" |"forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(null); // "google" |"apple" |"facebook" | null

  const isSignup = mode ==="signup";
  const isForgot = mode ==="forgot";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setInfo(""); setBusy(true);
    try {
      if (isForgot) {
        const { error } = await resetPassword(email.trim());
        if (error) { setError(traduireErreur(error.message)); setBusy(false); return; }
        setInfo("Email envoyé ! Suis le lien reçu pour choisir un nouveau mot de passe.");
        setBusy(false); return;
      }
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

  async function handleOAuth(provider) {
    setError(""); setOauthBusy(provider);
    const { error } = await signInWithOAuth(provider);
    if (error) { setError(traduireErreur(error.message)); setOauthBusy(null); }
    // en cas de succès, redirection gérée par Supabase — pas de reset local nécessaire.
  }

  const title = isForgot ?"Mot de passe oublié" : isSignup ?"Créer un compte" :"Se connecter";
  const canGoBack = isSignup || isForgot;

  return (
    <div style={{
      minHeight:"100vh", background: C.bg, fontFamily: FONT,
      display:"flex", flexDirection:"column",
    }}>
      {/* ── Header : retour + titre ── */}
      <div style={{ display:"flex", alignItems:"center", gap:14,
        padding:"20px 20px 8px" }}>
        {canGoBack ? (
          <button onClick={() => { setMode("signin"); setError(""); setInfo(""); }}
            aria-label="Retour" className="tap" style={{
              width:40, height:40, borderRadius:"50%", flexShrink:0,
              background:C.s1, border:`1px solid ${C.bd}`,
              display:"grid", placeItems:"center", cursor:"pointer" }}>
            <I name="chevronLeft" size={20} color={C.text}/>
          </button>
        ) : (
          <div style={{ width:40, height:40, flexShrink:0 }}/>
        )}
        <span style={{ flex:1, textAlign:"center", marginRight:40,
          fontSize:19, fontWeight:700, letterSpacing:"-.01em",
          color:C.text, fontFamily:FONT }}>{title}</span>
      </div>

      <div style={{ flex:1, display:"flex", flexDirection:"column",
        justifyContent:"center", padding:"12px 20px 24px",
        boxSizing:"border-box" }}>

        {/* ── Logo (uniquement à la connexion) ── */}
        {!canGoBack && (
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{
              width:56, height:56, borderRadius:16, margin:"0 auto 14px",
              background:"linear-gradient(135deg, #2E48D9, #3C5BFF)",
              display:"grid", placeItems:"center",
              boxShadow:"0 8px 24px rgba(60,91,255,0.28)",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 8v8M9 5v14M15 5v14M19 8v8M9 12h6"/>
              </svg>
            </div>
            <div style={{ fontSize:13, color:C.dim, fontWeight:500 }}>
              Content de te revoir
            </div>
          </div>
        )}

        {isForgot && (
          <div style={{ fontSize:13.5, color:C.dim, fontWeight:500,
            lineHeight:1.5, marginBottom:20 }}>
            Indique ton email — on t'envoie un lien pour choisir un nouveau mot de passe.
          </div>
        )}

        {/* ── Formulaire ── */}
        <form onSubmit={handleSubmit} style={{
          display:"flex", flexDirection:"column", gap:18,
        }}>
          {isSignup && (
            <Field label="Nom" value={fullName} onChange={setFullName} type="text"
                   placeholder="Ton prénom" autoComplete="name" required />
          )}
          <Field label="Adresse e-mail" value={email} onChange={setEmail} type="email"
                 placeholder="toi@exemple.com" autoComplete="email" required />
          {!isForgot && (
            <Field label="Mot de passe" value={password} onChange={setPassword} type="password"
                   placeholder="••••••••" autoComplete={isSignup ?"new-password" :"current-password"} required />
          )}

          {error && (
            <div style={{
              fontSize:12.5, fontWeight:600, color:C.red,
              background:"rgba(229,72,77,0.08)", border:"1px solid rgba(229,72,77,0.25)",
              borderRadius:12, padding:"10px 12px",
            }}>{error}</div>
          )}
          {info && (
            <div style={{
              fontSize:12.5, fontWeight:600, color:C.green,
              background:"rgba(18,183,106,0.08)", border:"1px solid rgba(18,183,106,0.25)",
              borderRadius:12, padding:"10px 12px",
            }}>{info}</div>
          )}

          <button type="submit" disabled={busy} className="tap" style={{
            height:52, borderRadius:14, border:"none", marginTop:2,
            background: busy ? C.s3 : C.accent,
            color:"#FFF", fontSize:15, fontWeight:700, fontFamily:FONT,
            cursor: busy ?"default" :"pointer",
            boxShadow: busy ?"none" :"0 8px 20px rgba(60,91,255,0.28)",
          }}>
            {busy ?"..." : isForgot ?"Envoyer le lien" : isSignup ?"Créer mon compte" :"Se connecter"}
          </button>
        </form>

        {!isSignup && !isForgot && (
          <button onClick={() => { setMode("forgot"); setError(""); setInfo(""); }}
            style={{ marginTop:18, background:"none", border:"none", cursor:"pointer",
              alignSelf:"center", fontSize:14, fontWeight:600, color:C.accent,
              fontFamily:FONT }}>
            Mot de passe oublié ?
          </button>
        )}

        {/* ── Séparateur + boutons sociaux (hors mode "mot de passe oublié") ── */}
        {!isForgot && (
          <>
            <div style={{ display:"flex", alignItems:"center", gap:14,
              margin:"28px 0 20px" }}>
              <div style={{ flex:1, height:1, background:C.bd }}/>
              <span style={{ fontSize:12, fontWeight:700, letterSpacing:".08em",
                color:C.dim, fontFamily:FONT }}>OU</span>
              <div style={{ flex:1, height:1, background:C.bd }}/>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <SocialButton provider="google" label="Continuer avec Google"
                busy={oauthBusy==="google"} disabled={!!oauthBusy}
                onClick={() => handleOAuth("google")}
                icon={<GoogleMark/>}/>
              <SocialButton provider="apple" label="Continuer avec Apple"
                busy={oauthBusy==="apple"} disabled={!!oauthBusy}
                onClick={() => handleOAuth("apple")}
                icon={<AppleMark/>}/>
              <SocialButton provider="facebook" label="Continuer avec Facebook"
                busy={oauthBusy==="facebook"} disabled={!!oauthBusy}
                onClick={() => handleOAuth("facebook")}
                icon={<FacebookMark/>}/>
            </div>
          </>
        )}

        {!canGoBack ? (
          <button
            onClick={() => { setMode("signup"); setError(""); setInfo(""); }}
            style={{
              marginTop:24, background:"none", border:"none", cursor:"pointer",
              alignSelf:"center", fontSize:13.5, fontWeight:600, color:C.dim, fontFamily:FONT,
            }}
          >
            Pas encore de compte ?{" "}
            <span style={{ color:C.accent }}>Créer un compte</span>
          </button>
        ) : (
          <div style={{ marginTop:24, textAlign:"center", fontSize:12,
            color:C.dim, fontWeight:500, lineHeight:1.5 }}>
            Nous ne publierons jamais rien sans votre autorisation.
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type, placeholder, autoComplete, required }) {
  return (
    <label style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <span style={{ fontSize:13, fontWeight:600, color:C.mid, fontFamily:FONT }}>
        {label}
      </span>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete} required={required}
        style={{
          height:52, borderRadius:14, border:`1px solid ${C.bd}`,
          background:C.s1, padding:"0 16px", fontSize:15, fontFamily:FONT,
          color:C.text, outline:"none", boxSizing:"border-box",
        }}
      />
    </label>
  );
}

function SocialButton({ label, icon, busy, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} className="tap" style={{
      height:52, borderRadius:14, border:`1px solid ${C.bd}`,
      background:"#FFFFFF", display:"flex", alignItems:"center",
      justifyContent:"center", gap:10, cursor: disabled ?"default" :"pointer",
      opacity: disabled && !busy ? 0.5 : 1,
      fontSize:14.5, fontWeight:700, color:C.text, fontFamily:FONT,
    }}>
      {busy ? <Spinner/> : icon}
      <span>{busy ?"Connexion..." : label}</span>
    </button>
  );
}

function Spinner() {
  return (
    <div style={{ width:18, height:18, borderRadius:"50%",
      border:`2px solid ${C.bd}`, borderTopColor:C.accent,
      animation:"spin .7s linear infinite" }}/>
  );
}

function GoogleMark() {
  return (
    <svg width="19" height="19" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.14-3.13-.4-4.6H24v9.02h11.85c-.51 2.75-2.06 5.08-4.4 6.64v5.52h7.11c4.16-3.83 6.54-9.47 6.54-16.58Z"/>
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.32l-7.11-5.52c-1.97 1.32-4.5 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46Z"/>
      <path fill="#FBBC05" d="M11.69 28.19A13.87 13.87 0 0 1 10.95 24c0-1.46.25-2.87.74-4.19v-5.7H4.34A21.93 21.93 0 0 0 2 24c0 3.55.85 6.9 2.34 9.89l7.35-5.7Z"/>
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.9 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.11l7.35 5.7c1.73-5.2 6.58-9.06 12.31-9.06Z"/>
    </svg>
  );
}

function AppleMark() {
  return (
    <svg width="17" height="20" viewBox="0 0 17 20" fill="#101318">
      <path d="M14.03 10.62c-.02-2.15 1.76-3.18 1.84-3.23-1-1.47-2.57-1.67-3.13-1.69-1.33-.14-2.6.78-3.28.78-.68 0-1.72-.76-2.82-.74-1.45.02-2.79.85-3.54 2.15-1.51 2.62-.39 6.5 1.09 8.63.72 1.04 1.58 2.2 2.71 2.16 1.09-.04 1.5-.7 2.82-.7 1.31 0 1.69.7 2.84.68 1.18-.02 1.92-1.06 2.63-2.11.83-1.21 1.17-2.38 1.19-2.44-.03-.01-2.28-.88-2.35-3.49ZM11.87 4.14c.59-.72.99-1.71.88-2.7-.85.03-1.88.57-2.49 1.28-.55.63-1.03 1.65-.9 2.62.94.07 1.91-.48 2.51-1.2Z"/>
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24">
      <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07Z"/>
    </svg>
  );
}

// Messages Supabase traduits en français simple pour l'utilisateur
function traduireErreur(msg) {
  if (msg.includes("Invalid login credentials")) return"Email ou mot de passe incorrect.";
  if (msg.includes("User already registered")) return"Un compte existe déjà avec cet email.";
  if (msg.includes("Email not confirmed")) return"Confirme ton email avant de te connecter (regarde tes spams).";
  if (msg.includes("Password should be")) return"Le mot de passe doit faire au moins 6 caractères.";
  if (msg.includes("provider is not enabled") || msg.includes("Unsupported provider")) return"Cette méthode de connexion n'est pas encore activée.";
  return"Une erreur est survenue. Réessaie dans un instant.";
}
