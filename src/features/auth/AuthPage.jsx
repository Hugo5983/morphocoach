// ═══════════════════════════════════════════════════════════════════════════
// AUTH PAGE — connexion / inscription.
// Refonte visuelle uniquement : la logique Supabase et les actions d'auth
// restent identiques. Direction : premium fitness, noir profond + bleu.
// ═══════════════════════════════════════════════════════════════════════════
import { useState } from "react";
import { FONT } from "../../data/constants.js";
import { useAuth } from "../../hooks/useAuth.js";

const BLUE = "#3C5BFF";
const BLUE_DARK = "#2848E8";
const BG = "#05080F";
const TEXT = "#F7F8FC";
const MUTED = "rgba(247,248,252,.62)";
const FAINT = "rgba(247,248,252,.42)";
const BORDER = "rgba(255,255,255,.12)";
const GLASS = "rgba(5,8,15,.62)";

// Référence Pexels choisie pour la direction artistique.
// Le fallback local permet de garder l'écran visuel même hors connexion.
const AUTH_BACKGROUND = "/auth-athlete.png";

export default function AuthPage() {
  const { signUp, signIn, resetPassword, signInWithOAuth } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(null);
  const [bgFailed, setBgFailed] = useState(false);

  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      if (isForgot) {
        const { error } = await resetPassword(email.trim());
        if (error) {
          setError(traduireErreur(error.message));
          return;
        }
        setInfo("Email envoyé. Suis le lien reçu pour choisir un nouveau mot de passe.");
        return;
      }

      if (isSignup) {
        if (password.length < 6) {
          setError("Le mot de passe doit faire au moins 6 caractères.");
          return;
        }
        const { error } = await signUp(email.trim(), password, fullName.trim());
        if (error) {
          setError(traduireErreur(error.message));
          return;
        }
        setInfo("Compte créé ! Vérifie tes emails pour confirmer ton adresse.");
        setMode("signin");
        return;
      }

      const { error } = await signIn(email.trim(), password);
      if (error) setError(traduireErreur(error.message));
    } finally {
      setBusy(false);
    }
  }

  async function handleOAuth(provider) {
    setError("");
    setOauthBusy(provider);
    const { error } = await signInWithOAuth(provider);
    if (error) {
      setError(traduireErreur(error.message));
      setOauthBusy(null);
    }
  }

  const go = (nextMode) => {
    setMode(nextMode);
    setError("");
    setInfo("");
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: BG,
        color: TEXT,
        fontFamily: FONT,
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Fond portrait complet : centré sans recadrer l'athlète. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: "#020611",
          overflow: "hidden",
        }}
      >
        <img
          src={AUTH_BACKGROUND}
          alt=""
          aria-hidden="true"
          style={{
            // Cadrage calé sur la maquette : le sujet est agrandi et remonté
            // pour que la tête arrive en haut de l'écran. Valeurs en % de la
            // hauteur -> le cadrage reste identique sur tous les formats.
            position: "absolute",
            top: 0,
            left: "50%",
            // Largeur calée sur celle de l'écran -> le sportif garde la même
            // taille apparente sur tous les téléphones. Le décalage vertical
            // est en % de la hauteur de l'image (et non du viewport), donc la
            // tête se place au même endroit quel que soit le format.
            width: "120%",
            height: "auto",
            maxWidth: "none",
            transform: "translate(-50%, -9.1%)",
            display: "block",
            filter: "saturate(.82) contrast(1.05)",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(2,6,17,.10) 0%, rgba(2,6,17,.02) 38%, rgba(2,6,17,.42) 100%)",
          }}
        />
      </div>

      {/* Traitement cinématique : bleu froid en haut, noir vers le formulaire. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(3,7,15,.10) 0%, rgba(3,7,15,.18) 25%, rgba(3,7,15,.38) 48%, rgba(5,8,15,.86) 76%, #05080F 100%)",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          background:
            "radial-gradient(circle at 50% 30%, rgba(60,91,255,.16), transparent 36%), linear-gradient(90deg, rgba(3,7,15,.46), transparent 38%, rgba(3,7,15,.36))",
          pointerEvents: "none",
        }}
      />

      {/* SCÈNE — verrouillée au format de l'iPhone 15 (393 x 852).
          Elle prend toute la place disponible sans jamais déformer, et
          « container-type: size » + « font-size: 1cqw » font que TOUTES les
          dimensions internes (exprimées en em) suivent la même échelle.
          Résultat : la composition est rigoureusement identique d'un
          téléphone à l'autre, seule la taille globale change. */}
      <main
        style={{
          position: "relative",
          zIndex: 2,
          width: "min(100%, calc((100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom)) * 393 / 852))",
          aspectRatio: "393 / 852",
          maxHeight: "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
          margin: "0 auto",
          containerType: "size",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          padding: `${R(20)} ${R(20)} ${R(24)}`,
        }}
      >
        {/* Répartition 4:1 — reproduit la composition de la maquette sur
            toutes les hauteurs d'écran. Les spacers se compriment à zéro
            quand la place manque : le contenu n'est jamais recouvert. */}
        <div aria-hidden="true" style={{ flex: "4 1 0", minHeight: 0 }} />

        {/* Colonne unique : tout est dans le flux, rien n'est superposé. */}
        <div
          style={{
            width: "100%",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
        {/* Petit retour uniquement pour inscription / récupération. */}
        <div style={{ minHeight: "11.705cqw", display: "flex", alignItems: "center" }}>
          {(isSignup || isForgot) && (
            <button
              type="button"
              onClick={() => go("signin")}
              aria-label="Retour"
              className="tap"
              style={{
                width: "10.687cqw",
                height: "10.687cqw",
                borderRadius: "3.562cqw",
                border: `1px solid ${BORDER}`,
                background: "rgba(7,11,19,.52)",
                color: TEXT,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                backdropFilter: "blur(14px)",
              }}
            >
              <ArrowLeft />
            </button>
          )}
        </div>

        {/* Branding : dans le flux, il pousse le formulaire au lieu de le recouvrir. */}
        <section
          style={{
            textAlign: "center",
            marginBottom: "11.196cqw",
            pointerEvents: "none",
          }}
        >
          <BrandMark />
          <div style={{
            marginTop: "3.053cqw",
            fontFamily: '"Arial Narrow", "Roboto Condensed", "Helvetica Neue", Arial, sans-serif',
            fontSize: "10.178cqw",
            lineHeight: .95,
            fontWeight: 900,
            fontStyle: "italic",
            letterSpacing: "-.065em",
            transform: "skewX(-4deg)",
            textShadow: "0 3px 20px rgba(0,0,0,.38)",
          }}>
            MORPHO<span style={{ color: BLUE }}>COACH</span>
          </div>
        </section>

        <section
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {isForgot && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 25, fontWeight: 750, letterSpacing: "-.035em" }}>
                Réinitialiser
              </div>
              <div style={{ marginTop: 7, fontSize: 13.5, color: MUTED, lineHeight: 1.5 }}>
                Entre ton email pour recevoir ton lien.
              </div>
            </div>
          )}

          {isSignup && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 25, fontWeight: 750, letterSpacing: "-.035em" }}>
                Crée ton compte
              </div>
              <div style={{ marginTop: 7, fontSize: 13.5, color: MUTED }}>
                Ton parcours commence maintenant.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "3.053cqw" }}>
            {isSignup && (
              <Field label="Prénom" value={fullName} onChange={setFullName} type="text" placeholder="Ton prénom" autoComplete="name" icon={<UserIcon />} />
            )}
            <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="ton@email.com" autoComplete="email" required icon={<MailIcon />} />
            {!isForgot && (
              <Field label="Mot de passe" value={password} onChange={setPassword} type="password" placeholder="••••••••" autoComplete={isSignup ? "new-password" : "current-password"} required icon={<LockIcon />} />
            )}

            {error && <Message tone="error">{error}</Message>}
            {info && <Message tone="info">{info}</Message>}

            {mode === "signin" && (
              <div style={{ textAlign: "right", marginTop: -2 }}>
                <button type="button" onClick={() => go("forgot")} style={linkButtonStyle}>
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="tap"
              style={{
                height: "15.267cqw",
                border: 0,
                borderRadius: "4.326cqw",
                marginTop: "1.018cqw",
                background: busy ? "#26304E" : `linear-gradient(135deg, ${BLUE}, ${BLUE_DARK})`,
                color: "#FFF",
                fontFamily: FONT,
                fontSize: "3.817cqw",
                fontWeight: 750,
                letterSpacing: ".015em",
                cursor: busy ? "default" : "pointer",
                boxShadow: busy ? "none" : "0 10px 32px rgba(60,91,255,.30)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "3.053cqw",
              }}
            >
              {busy ? "..." : isForgot ? "Envoyer le lien" : isSignup ? "Créer mon compte" : "Se connecter"}
              {!busy && <ArrowRight />}
            </button>
          </form>

          {!isForgot && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "3.053cqw", margin: "5.089cqw 0 3.562cqw" }}>
                <div style={{ flex: 1, height: 1, background: BORDER }} />
                <span style={{ fontSize: "2.672cqw", letterSpacing: ".12em", color: FAINT, fontWeight: 700 }}>OU</span>
                <div style={{ flex: 1, height: 1, background: BORDER }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.545cqw" }}>
                <SocialButton provider="apple" label="Apple" busy={oauthBusy === "apple"} disabled={!!oauthBusy} onClick={() => handleOAuth("apple")} icon={<AppleMark />} />
                <SocialButton provider="google" label="Google" busy={oauthBusy === "google"} disabled={!!oauthBusy} onClick={() => handleOAuth("google")} icon={<GoogleMark />} />
              </div>
            </>
          )}

          <div style={{ textAlign: "center", marginTop: "5.089cqw", fontSize: "3.308cqw", color: MUTED }}>
            {isSignup ? (
              <>
                Déjà un compte ?{" "}
                <button type="button" onClick={() => go("signin")} style={linkButtonStyle}>Se connecter</button>
              </>
            ) : isForgot ? (
              <button type="button" onClick={() => go("signin")} style={linkButtonStyle}>Retour à la connexion</button>
            ) : (
              <>
                Pas encore de compte ?{" "}
                <button type="button" onClick={() => go("signup")} style={linkButtonStyle}>Créer un compte</button>
              </>
            )}
          </div>
        </section>
        </div>

        <div aria-hidden="true" style={{ flex: "1 1 0", minHeight: 0 }} />
      </main>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .tap { -webkit-tap-highlight-color: transparent; transition: transform .16s ease, opacity .16s ease, filter .16s ease; }
        .tap:active { transform: scale(.985); }
        input::placeholder { color: rgba(247,248,252,.34); }
      `}</style>
    </div>
  );
}

function Field({ label, value, onChange, type, placeholder, autoComplete, required, icon }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "1.781cqw" }}>
      <span style={{ fontSize: "2.926cqw", fontWeight: 650, color: MUTED, paddingLeft: "0.509cqw" }}>{label}</span>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: "4.326cqw", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.62)", display: "grid", placeItems: "center", pointerEvents: "none", zIndex: 2 }}>
          {icon}
        </span>
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          style={{
            width: "100%",
            height: "14.249cqw",
            borderRadius: "4.071cqw",
            border: `1px solid rgba(255,255,255,.15)`,
            background: "rgba(7,11,20,.42)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            padding: isPassword ? "0 12.723cqw 0 13.232cqw" : "0 4.071cqw 0 13.232cqw",
            fontSize: "max(16px, 3.944cqw)",
            fontFamily: FONT,
            color: TEXT,
            outline: "none",
            boxSizing: "border-box",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.025), 0 8px 30px rgba(0,0,0,.12)",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            style={{
              position: "absolute",
              right: "3.817cqw",
              top: "50%",
              transform: "translateY(-50%)",
              border: 0,
              background: "transparent",
              color: "rgba(255,255,255,.68)",
              padding: "1.527cqw",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <EyeIcon open={showPassword} />
          </button>
        )}
      </div>
    </label>
  );
}

function SocialButton({ label, icon, busy, disabled, onClick }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="tap" style={{
      height: "14.758cqw",
      borderRadius: "3.817cqw",
      border: `1px solid ${BORDER}`,
      background: "rgba(7,11,19,.56)",
      backdropFilter: "blur(16px)",
      color: TEXT,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "2.290cqw",
      cursor: disabled ? "default" : "pointer",
      opacity: disabled && !busy ? .45 : 1,
      fontSize: "3.435cqw",
      fontWeight: 650,
      fontFamily: FONT,
    }}>
      {busy ? <Spinner /> : icon}
      <span>{busy ? "..." : label}</span>
    </button>
  );
}

function Message({ tone, children }) {
  const good = tone === "info";
  return (
    <div style={{
      fontSize: 12,
      lineHeight: 1.45,
      color: good ? "#70E3B0" : "#FF9A9D",
      background: good ? "rgba(18,183,106,.09)" : "rgba(229,72,77,.09)",
      border: `1px solid ${good ? "rgba(18,183,106,.22)" : "rgba(229,72,77,.22)"}`,
      borderRadius: 13,
      padding: "10px 12px",
    }}>{children}</div>
  );
}

function BrandMark() {
  // Logo MorphoCoach officiel — tracé vectoriel unique (deux chevrons
  // entrecroisés + languette signature en haut à droite).
  // Le viewBox est resserré sur la forme : elle remplit la boîte sans marge morte.
  return (
    <div style={{
      width: "16.794cqw",
      height: "16.794cqw",
      margin: "0 auto",
      filter: "drop-shadow(0 10px 28px rgba(60,91,255,.40))",
    }}>
      <svg
        viewBox="461 90.2 112.5 147.9"
        width="100%"
        height="100%"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="morphoMark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4D6BFF" />
            <stop offset=".52" stopColor={BLUE} />
            <stop offset="1" stopColor="#1F35C4" />
          </linearGradient>
        </defs>
        <path
          fillRule="evenodd"
          fill="url(#morphoMark)"
          d="m552.35 93.34c1.89 0.31 5.57 1.74 8.18 3.18 2.61 1.44 5.92 3.86 9.97 8.14v57.66c0 49.8-0.2 57.9-1.47 59.45-0.81 0.99-5.45 4.39-10.3 7.55-6.55 4.27-9.72 5.75-12.26 5.74-2.14-0.01-5.11-1.12-7.85-2.92-2.43-1.59-6.29-4.47-12.75-9.89l0.03-63.27-14.35-17.66c-7.89-9.71-16.61-19.98-19.39-22.82-2.77-2.84-5.7-5.14-6.51-5.12-0.81 0.02-2.91 1.13-7.85 4.89l-0.02 95.64 4.18 2.69c3.66 2.36 4.42 2.53 6.14 1.38 1.08-0.73 2.96-1.94 6.38-4.07v-33.11c0-18.21 0.22-33.1 0.49-33.1 0.27 0 3.37 2.53 13.29 11.28l-0.05 62.29-6.13 5.42c-3.37 2.99-7.57 6.08-9.32 6.87-1.76 0.79-5.62 1.44-8.59 1.44-5.12 0-5.76-0.3-20.1-11.77v-112.81l4.65-3.77c2.57-2.08 6.65-5.18 9.08-6.9 3.58-2.53 5.34-3.11 9.32-3.07 4.77 0.05 5.09 0.24 11.81 7.14 3.8 3.9 9.54 10.09 18.6 20.43l8.51-10.6c4.68-5.82 9.97-11.97 11.77-13.67 1.79-1.69 5.03-4.01 7.18-5.14 2.79-1.46 4.93-1.9 7.36-1.5zm-22.86 41.27c0 0 6.95 11.26 7.9 11.5 1.59 0.4 1.23 3.04 1.23 34.45v33.84c6.99 4.95 8.97 5.7 10.3 5.28 1.08-0.35 3.17-1.46 4.66-2.46l2.7-1.84v-101.04c-4.95-3.03-7.1-3.92-7.98-3.92-0.89 0-4.01 2.76-6.94 6.13-2.93 3.37-9.62 15.23-11.87 18.06z"
        />
      </svg>
    </div>
  );
}

function ArrowRight() {
  return <svg width="19" height="19" style={{ width: "4.835cqw", height: "4.835cqw" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></svg>;
}
function ArrowLeft() {
  return <svg width="18" height="18" style={{ width: "4.580cqw", height: "4.580cqw" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>;
}
function MailIcon() {
  return <svg width="19" height="19" style={{ width: "4.835cqw", height: "4.835cqw" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" style={{ width: "4.580cqw", height: "3.562cqw" }} rx="2"/><path d="m3 7 9 6 9-6"/></svg>;
}
function LockIcon() {
  return <svg width="19" height="19" style={{ width: "4.835cqw", height: "4.835cqw" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="10" width="14" height="10" style={{ width: "3.562cqw", height: "2.545cqw" }} rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>;
}
function UserIcon() {
  return <svg width="19" height="19" style={{ width: "4.835cqw", height: "4.835cqw" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.5 3.3-5.3 7-5.3s6.2 1.8 7 5.3"/></svg>;
}
function Spinner() {
  return <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,.25)", borderTopColor: "#fff", animation: "spin .7s linear infinite" }} />;
}
function GoogleMark() {
  return <svg width="18" height="18" style={{ width: "4.580cqw", height: "4.580cqw" }} viewBox="0 0 48 48"><path fill="#4285F4" d="M45.1 24.5c0-1.6-.14-3.13-.4-4.6H24v9.02h11.85c-.51 2.75-2.06 5.08-4.4 6.64v5.52h7.11c4.16-3.83 6.54-9.47 6.54-16.58Z"/><path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.32l-7.11-5.52c-1.97 1.32-4.5 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46Z"/><path fill="#FBBC05" d="M11.69 28.19A13.87 13.87 0 0 1 10.95 24c0-1.46.25-2.87.74-4.19v-5.7H4.34A21.93 21.93 0 0 0 2 24c0 3.55.85 6.9 2.34 9.89l7.35-5.7Z"/><path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.9 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.11l7.35 5.7c1.73-5.2 6.58-9.06 12.31-9.06Z"/></svg>;
}
function EyeIcon({ open }) {
  return (
    <svg width="21" height="21" style={{ width: "5.344cqw", height: "5.344cqw" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <>
          <path d="M2.2 12s3.4-6 9.8-6 9.8 6 9.8 6-3.4 6-9.8 6-9.8-6-9.8-6Z"/>
          <circle cx="12" cy="12" r="2.7"/>
        </>
      ) : (
        <>
          <path d="M2.2 12s3.4-6 9.8-6 9.8 6 9.8 6-3.4 6-9.8 6-9.8-6-9.8-6Z"/>
          <circle cx="12" cy="12" r="2.7"/>
        </>
      )}
    </svg>
  );
}
function AppleMark() {
  return <svg width="17" height="20" style={{ width: "4.326cqw", height: "5.089cqw" }} viewBox="0 0 17 20" fill="#FFF"><path d="M14.03 10.62c-.02-2.15 1.76-3.18 1.84-3.23-1-1.47-2.57-1.67-3.13-1.69-1.33-.14-2.6.78-3.28.78-.68 0-1.72-.76-2.82-.74-1.45.02-2.79.85-3.54 2.15-1.51 2.62-.39 6.5 1.09 8.63.72 1.04 1.58 2.2 2.71 2.16 1.09-.04 1.5-.7 2.82-.7 1.31 0 1.69.7 2.84.68 1.18-.02 1.92-1.06 2.63-2.11.83-1.21 1.17-2.38 1.19-2.44-.03-.01-2.28-.88-2.35-3.49ZM11.87 4.14c.59-.72.99-1.71.88-2.7-.85.03-1.88.57-2.49 1.28-.55.63-1.03 1.65-.9 2.62.94.07 1.91-.48 2.51-1.2Z"/></svg>;
}

const linkButtonStyle = {
  background: "none",
  border: 0,
  padding: 0,
  color: "#4D6BFF",
  fontFamily: FONT,
  fontSize: "3.308cqw",
  fontWeight: 650,
  cursor: "pointer",
}

function traduireErreur(msg) {
  if (msg.includes("Invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (msg.includes("User already registered")) return "Un compte existe déjà avec cet email.";
  if (msg.includes("Email not confirmed")) return "Confirme ton email avant de te connecter (regarde tes spams).";
  if (msg.includes("Password should be")) return "Le mot de passe doit faire au moins 6 caractères.";
  if (msg.includes("provider is not enabled") || msg.includes("Unsupported provider")) return "Cette méthode de connexion n'est pas encore activée.";
  return "Une erreur est survenue. Réessaie dans un instant.";
}

