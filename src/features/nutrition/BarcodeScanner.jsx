// @ts-check
// ─── BARCODE SCANNER — lecture EAN/UPC d'un produit ───────────────────────────
// Refonte visuelle (juillet 2026) — la logique ZXing est conservée telle quelle
// (formats restreints, haute résolution, anti-doublon par ref) : seule la
// couche d'affichage change.
//
// Ce qui est corrigé :
//   1. Vue montée en portal sur document.body. Avant, la caméra s'ouvrait dans
//      le flux de la page : l'en-tête et la barre d'onglets restaient au-dessus,
//      et le bas du cadre de visée passait sous la navigation.
//   2. Couleurs. Le fichier peignait du texte clair avec des tokens sombres —
//      pire, plusieurs valeurs étaient écrites "${C.text}" entre guillemets
//      droits (chaîne littérale, pas template) : la couleur était invalide et
//      le titre s'affichait en noir sur fond noir.
//   3. Cadre de visée centré, reste de l'image assombri par une ombre portée :
//      l'œil va au bon endroit, et rien n'est jamais coupé.
//   4. Torche si l'appareil la propose, et saisie manuelle repliée par défaut.
//
// Contrat inchangé : props { onDetected(code), onClose }.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { I, ID } from "../../components/ui/Icon.jsx";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException, DecodeHintType, BarcodeFormat } from "@zxing/library";
import { C, FONT, NUM, SPACE, TYPE, RADIUS, Z, MOTION } from "../../styles/tokens.js";

const VISEUR_W = 268;
const VISEUR_H = 172;

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef  = useRef(/** @type {HTMLVideoElement|null} */ (null));
  const readerRef = useRef(/** @type {BrowserMultiFormatReader|null} */ (null));
  const trackRef  = useRef(/** @type {MediaStreamTrack|null} */ (null));
  const [status,   setStatus]   = useState("init"); // init | scanning | error | found
  const [errMsg,   setErrMsg]   = useState("");
  const [flash,    setFlash]    = useState(false);
  const [torchOk,  setTorchOk]  = useState(false);
  const [torchOn,  setTorchOn]  = useState(false);
  const [manuel,   setManuel]   = useState(false);
  const [code,     setCode]     = useState("");

  useEffect(() => {
    let controls = null;

    // 1. FORMATS RESTREINTS : par défaut, ZXing essaie TOUS les formats (QR,
    //    Aztec, PDF417…) à chaque image — lent, donc peu de tentatives par
    //    seconde. Les produits alimentaires n'utilisent que EAN/UPC :
    //    on ne cherche qu'eux, plus TRY_HARDER pour les codes un peu flous.
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,  BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 80 });
    readerRef.current = reader;

    // 3. anti-doublon par ref : l'ancien `lastCode` (useState) restait figé à
    //    "" dans la closure → une fois le code lu, onDetected partait en
    //    BOUCLE plusieurs fois par seconde ("il cherche en permanence").
    const dejaLu = { current: /** @type {string|null} */ (null) };

    async function start() {
      try {
        setStatus("scanning");
        // 2. HAUTE RÉSOLUTION : la définition par défaut (souvent 640×480 sur
        //    iPhone) est trop faible pour lire les barres fines d'un EAN-13.
        controls = await reader.decodeFromConstraints(
          { audio: false,
            video: { facingMode: "environment",
                     width:  { ideal: 1920 },
                     height: { ideal: 1080 } } },
          videoRef.current || undefined,
          (result, err) => {
            if (result) {
              const texte = result.getText();
              if (dejaLu.current === texte) return;
              dejaLu.current = texte;
              setFlash(true);
              setTimeout(() => setFlash(false), 300);
              setStatus("found");
              // scan UNIQUE : on coupe la caméra dès la première lecture —
              // c'est au parent de fermer ou de relancer
              try { controls?.stop(); } catch {}
              if (navigator.vibrate) navigator.vibrate(60);
              onDetected(texte);
            }
            if (err && !(err instanceof NotFoundException)) {
              console.warn("Scan err:", err);
            }
          }
        );

        // Torche : proposée uniquement si l'appareil l'expose réellement.
        try {
          const stream = /** @type {MediaStream|null} */ (videoRef.current?.srcObject);
          const track  = stream?.getVideoTracks?.()[0] || null;
          trackRef.current = track;
          const caps = track?.getCapabilities?.();
          if (caps && "torch" in caps) setTorchOk(true);
        } catch { /* capacité non exposée : on n'affiche pas le bouton */ }

      } catch (e) {
        console.error("Caméra:", e);
        if (e.name === "NotAllowedError") {
          setErrMsg("Accès caméra refusé. Autorise l'accès dans les réglages du navigateur.");
        } else if (e.name === "NotFoundError") {
          setErrMsg("Aucune caméra détectée sur cet appareil.");
        } else {
          setErrMsg("Impossible d'accéder à la caméra. Réessaie.");
        }
        setStatus("error");
      }
    }

    start();

    return () => {
      try { controls?.stop(); } catch {}
      try { BrowserMultiFormatReader.releaseAllStreams(); } catch {}
      trackRef.current = null;
    };
  }, []);

  const toggleTorch = async () => {
    const track = trackRef.current;
    if (!track) return;
    try {
      const next = !torchOn;
      await track.applyConstraints({ advanced: [/** @type {any} */ ({ torch: next })] });
      setTorchOn(next);
    } catch { setTorchOk(false); }
  };

  const valider = () => { if (code.trim().length >= 8) onDetected(code.trim()); };

  // ─── Bouton translucide sur la caméra ──────────────────────────────────────
  const Glass = ({ onClick, label, actif = false, children }) => (
    <button className="tap-icon" onClick={onClick} aria-label={label} style={{
      width: 40, height: 40, borderRadius: RADIUS.md, flexShrink: 0,
      background: actif ? "#FFFFFF" : "rgba(255,255,255,0.16)",
      border: `1px solid ${actif ? "#FFFFFF" : "rgba(255,255,255,0.22)"}`,
      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      display: "grid", placeItems: "center", cursor: "pointer",
      color: actif ? C.ink : "#FFF",
    }}>{children}</button>
  );

  const contenu = (
    <div style={{
      position: "fixed", inset: 0, zIndex: Z.scanner,
      background: C.ink, fontFamily: FONT,
      animation: `fadeIn ${MOTION.base} both`,
    }}>

      {/* ═══ FLUX CAMÉRA — plein cadre ═══ */}
      <video
        ref={videoRef}
        playsInline
        muted
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%", objectFit: "cover",
          display: status === "error" ? "none" : "block",
        }}
      />

      {/* Flash de détection */}
      {flash && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(60,91,255,0.25)", pointerEvents: "none",
        }}/>
      )}

      {/* ═══ SUPERPOSITION ═══ */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
      }}>

        {/* Barre haute */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: SPACE.md, padding: `calc(${SPACE.md}px + env(safe-area-inset-top, 0px)) ${SPACE.lg}px 0`,
          flexShrink: 0,
        }}>
          <Glass onClick={onClose} label="Fermer"><I name="close" size={17} color="#FFF"/></Glass>
          <div style={{ ...TYPE.h3, color: "#FFF" }}>Scanner un produit</div>
          {torchOk
            ? <Glass onClick={toggleTorch} label="Torche" actif={torchOn}>
                <I name="bolt" size={17} color={torchOn ? C.ink : "#FFF"} fill/>
              </Glass>
            : <span style={{ width: 40, flexShrink: 0 }}/>}
        </div>

        {/* Zone centrale */}
        <div style={{ flex: 1, display: "grid", placeItems: "center", padding: SPACE.lg }}>

          {status === "scanning" && (
            <div style={{
              position: "relative", width: VISEUR_W, height: VISEUR_H,
              borderRadius: RADIUS.xl,
              // le reste de l'image est assombri par une ombre portée géante :
              // une seule div, aucune image de masque à charger
              boxShadow: "0 0 0 2000px rgba(8,11,20,0.62)",
            }}>
              {[
                { top: -2, left: -2,  borderRight: 0, borderBottom: 0, borderRadius: "12px 0 0 0" },
                { top: -2, right: -2, borderLeft: 0,  borderBottom: 0, borderRadius: "0 12px 0 0" },
                { bottom: -2, left: -2,  borderRight: 0, borderTop: 0, borderRadius: "0 0 0 12px" },
                { bottom: -2, right: -2, borderLeft: 0,  borderTop: 0, borderRadius: "0 0 12px 0" },
              ].map((s, i) => (
                <span key={i} style={{
                  position: "absolute", width: 30, height: 30,
                  border: "3px solid #FFF", ...s,
                }}/>
              ))}

              {/* Ligne de balayage */}
              <span style={{
                position: "absolute", left: 10, right: 10, height: 2,
                borderRadius: RADIUS.full, background: C.accent,
                boxShadow: `0 0 14px 3px rgba(60,91,255,0.85)`,
                animation: "mcLaser 2.1s cubic-bezier(.5,0,.5,1) infinite",
              }}/>

              {/* Consigne */}
              <div style={{
                position: "absolute", left: 0, right: 0, top: "calc(100% + 22px)",
                textAlign: "center",
              }}>
                <div style={{ ...TYPE.h3, color: "#FFF" }}>Vise le code-barres</div>
                <div style={{ ...TYPE.bodySmall, color: "rgba(255,255,255,0.62)", marginTop: 5 }}>
                  La détection se fait toute seule
                </div>
              </div>
            </div>
          )}

          {status === "init" && (
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 44, height: 44, margin: "0 auto",
                border: "3px solid rgba(255,255,255,0.18)",
                borderTopColor: "#FFF",
                borderRadius: "50%", animation: "spin .8s linear infinite",
              }}/>
              <div style={{ ...TYPE.bodySmall, color: "rgba(255,255,255,0.62)", marginTop: SPACE.lg }}>
                Activation de la caméra…
              </div>
            </div>
          )}

          {status === "found" && (
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 72, height: 72, borderRadius: RADIUS.xl, margin: "0 auto",
                background: "rgba(18,183,106,0.18)",
                border: "2px solid rgba(18,183,106,0.6)",
                display: "grid", placeItems: "center",
              }}>
                <I name="check" size={34} color={C.green} stroke={2.6}/>
              </div>
              <div style={{ ...TYPE.h3, color: C.green, marginTop: SPACE.lg }}>
                Produit détecté
              </div>
            </div>
          )}

          {status === "error" && (
            <div style={{ textAlign: "center", maxWidth: 320 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.lg }}>
                <ID name="cameraDuo" size={48} dark/>
              </div>
              <div style={{ ...TYPE.h3, color: "#FFF" }}>Caméra indisponible</div>
              <div style={{ ...TYPE.bodySmall, color: "rgba(255,255,255,0.62)", marginTop: SPACE.sm }}>
                {errMsg}
              </div>
              <button className="tap" onClick={() => setManuel(true)} style={{
                marginTop: SPACE.xl, padding: `${SPACE.md}px ${SPACE.xl}px`,
                background: C.accent, border: "none", borderRadius: RADIUS.md,
                color: "#FFF", ...TYPE.body, fontWeight: 700, cursor: "pointer",
              }}>Saisir le code à la main</button>
            </div>
          )}
        </div>

        {/* Barre basse */}
        <div style={{
          padding: `0 ${SPACE.lg}px calc(${SPACE.xxl}px + env(safe-area-inset-bottom, 0px))`,
          flexShrink: 0,
        }}>
          {manuel ? (
            <div style={{ display: "flex", gap: SPACE.sm }}>
              <input
                autoFocus
                type="text" inputMode="numeric" value={code}
                placeholder="Ex. 3017620422003"
                onChange={e => setCode(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") valider(); }}
                style={{
                  flex: 1, padding: `${SPACE.md}px ${SPACE.lg}px`,
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  borderRadius: RADIUS.md, color: "#FFF",
                  ...TYPE.body, outline: "none", ...NUM,
                }}
              />
              <button className="tap" onClick={valider} disabled={code.trim().length < 8} style={{
                padding: `0 ${SPACE.lg}px`,
                background: code.trim().length >= 8 ? C.accent : "rgba(255,255,255,0.14)",
                border: "none", borderRadius: RADIUS.md, color: "#FFF",
                ...TYPE.body, fontWeight: 700,
                cursor: code.trim().length >= 8 ? "pointer" : "not-allowed",
              }}>OK</button>
            </div>
          ) : status !== "error" && (
            <button className="tap" onClick={() => setManuel(true)} style={{
              width: "100%", padding: SPACE.md,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: RADIUS.lg, color: "#FFF",
              ...TYPE.body, fontWeight: 600, cursor: "pointer",
              backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.sm,
            }}>
              <I name="scan" size={16} color="#FFF"/> Saisir le code à la main
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes mcLaser { 0% { top: 14px } 50% { top: ${VISEUR_H - 16}px } 100% { top: 14px } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (prefers-reduced-motion: reduce) {
          [style*="mcLaser"] { animation: none !important; top: ${Math.round(VISEUR_H / 2)}px }
        }
      `}</style>
    </div>
  );

  return createPortal(contenu, document.body);
}
