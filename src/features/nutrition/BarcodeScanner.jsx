import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";
import { FONT } from "../../data/constants.js";


export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef    = useRef(null);
  const readerRef   = useRef(null);
  const manualRef   = useRef(null);                 // ref directe sur l'input manuel
  const lastCodeRef = useRef("");                   // ✅ ref au lieu de state (closure-safe)
  const detectedRef = useRef(false);                // évite plusieurs callbacks après détection
  const onDetectedRef = useRef(onDetected);         // toujours pointer vers le dernier callback

  const [status,  setStatus]  = useState("init"); // init | scanning | error | found
  const [errMsg,  setErrMsg]  = useState("");
  const [flash,   setFlash]   = useState(false);

  // Garde onDetectedRef à jour sans recréer l'effet caméra
  useEffect(() => { onDetectedRef.current = onDetected; }, [onDetected]);

  useEffect(() => {
    let controls = null;
    let cancelled = false;
    const reader  = new BrowserMultiFormatReader();
    readerRef.current = reader;

    async function start() {
      try {
        setStatus("scanning");
        controls = await reader.decodeFromVideoDevice(
          undefined, // utilise la caméra arrière par défaut
          videoRef.current,
          (result, err) => {
            if (cancelled || detectedRef.current) return;
            if (result) {
              const code = result.getText();
              // ✅ lastCodeRef.current est toujours à jour (pas de stale closure)
              if (code === lastCodeRef.current) return;
              lastCodeRef.current = code;
              detectedRef.current = true;          // stop further callbacks
              setFlash(true);
              setTimeout(() => setFlash(false), 300);
              setStatus("found");
              onDetectedRef.current?.(code);
            }
            if (err && !(err instanceof NotFoundException)) {
              // NotFoundException = "pas de code détecté sur cette frame" — normal
              console.warn("Scan err:", err);
            }
          }
        );
      } catch (e) {
        if (cancelled) return;
        console.error("Caméra:", e);
        if (e.name === "NotAllowedError") {
          setErrMsg("Accès caméra refusé. Autorisez l'accès dans les paramètres du navigateur.");
        } else if (e.name === "NotFoundError") {
          setErrMsg("Aucune caméra détectée sur cet appareil.");
        } else {
          setErrMsg("Impossible d'accéder à la caméra. Réessayez.");
        }
        setStatus("error");
      }
    }

    start();

    return () => {
      cancelled = true;
      try { controls?.stop(); } catch {}
      // Stop tous les MediaStreamTracks restants (cleanup défensif)
      try {
        const stream = videoRef.current?.srcObject;
        if (stream && typeof stream.getTracks === "function") {
          stream.getTracks().forEach(t => { try { t.stop(); } catch {} });
        }
      } catch {}
      try { BrowserMultiFormatReader.releaseAllStreams?.(); } catch {}
    };
  }, []);

  // Saisie manuelle — handler unifié, plus de DOM walk fragile
  const submitManualCode = () => {
    const val = manualRef.current?.value?.trim() || "";
    if (val.length >= 8) {
      onDetectedRef.current?.(val);
    }
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      background:"rgba(0,0,0,0.95)",
      display:"flex", flexDirection:"column",
    }}>
      {/* Header */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"16px 20px",
        background:"rgba(11,18,32,0.90)",
        borderBottom:"1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ fontSize:15, fontWeight:700, color:"#F2F4F7", fontFamily:FONT }}>
          Scanner un produit
        </div>
        <button onClick={onClose} aria-label="Fermer" style={{
          width:34, height:34, borderRadius:10,
          background:"rgba(255,255,255,0.08)",
          border:"1px solid rgba(255,255,255,0.12)",
          display:"grid", placeItems:"center", cursor:"pointer",
          color:"#F2F4F7", fontSize:18,
        }}>×</button>
      </div>

      {/* Vidéo */}
      <div style={{ position:"relative", flex:1, overflow:"hidden" }}>
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            width:"100%", height:"100%",
            objectFit:"cover",
            display: status === "error" ? "none" : "block",
          }}
        />

        {/* Flash de détection */}
        {flash && (
          <div style={{
            position:"absolute", inset:0,
            background:"rgba(59,130,246,0.25)",
            pointerEvents:"none",
            transition:"opacity .15s",
          }}/>
        )}

        {/* Viseur central */}
        {status === "scanning" && (
          <div style={{
            position:"absolute", inset:0,
            display:"flex", alignItems:"center", justifyContent:"center",
            pointerEvents:"none",
          }}>
            <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.35)" }}/>
            <div style={{
              position:"relative",
              width:260, height:140,
              borderRadius:12,
            }}>
              <div style={{
                position:"absolute", inset:0,
                background:"transparent",
                boxShadow:"0 0 0 9999px rgba(0,0,0,0.50)",
                borderRadius:12,
                border:"2px solid rgba(59,130,246,0.80)",
              }}/>
              {[
                { top:0,left:0,borderTop:"3px solid #3B82F6",borderLeft:"3px solid #3B82F6",borderRadius:"10px 0 0 0" },
                { top:0,right:0,borderTop:"3px solid #3B82F6",borderRight:"3px solid #3B82F6",borderRadius:"0 10px 0 0" },
                { bottom:0,left:0,borderBottom:"3px solid #3B82F6",borderLeft:"3px solid #3B82F6",borderRadius:"0 0 0 10px" },
                { bottom:0,right:0,borderBottom:"3px solid #3B82F6",borderRight:"3px solid #3B82F6",borderRadius:"0 0 10px 0" },
              ].map((s,i) => (
                <div key={i} style={{ position:"absolute", width:24, height:24, ...s }}/>
              ))}
              <div style={{
                position:"absolute", left:8, right:8, height:2,
                background:"linear-gradient(90deg,transparent,#3B82F6,transparent)",
                borderRadius:1, top:"50%",
                animation:"scanLine 2s ease-in-out infinite",
              }}/>
            </div>
            <div style={{
              position:"absolute", bottom:80, left:0, right:0,
              textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.75)",
              fontFamily:FONT, fontWeight:500,
            }}>
              Placez le code-barres dans le cadre
            </div>
          </div>
        )}

        {/* Loader init */}
        {status === "init" && (
          <div style={{
            position:"absolute", inset:0, display:"flex",
            flexDirection:"column", alignItems:"center", justifyContent:"center",
            gap:16,
          }}>
            <div style={{
              width:44, height:44,
              border:"3px solid rgba(59,130,246,0.15)",
              borderTop:"3px solid #3B82F6",
              borderRadius:"50%", animation:"spin .8s linear infinite",
            }}/>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.60)", fontFamily:FONT }}>
              Activation de la caméra…
            </div>
          </div>
        )}

        {/* Succès */}
        {status === "found" && (
          <div style={{
            position:"absolute", inset:0, display:"flex",
            flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14,
          }}>
            <div style={{
              width:72, height:72, borderRadius:20,
              background:"rgba(52,211,153,0.15)",
              border:"2px solid rgba(52,211,153,0.50)",
              display:"grid", placeItems:"center", fontSize:36,
            }}>✓</div>
            <div style={{ fontSize:16, fontWeight:600, color:"#34D399", fontFamily:FONT }}>
              Produit détecté !
            </div>
          </div>
        )}

        {/* Erreur */}
        {status === "error" && (
          <div style={{
            position:"absolute", inset:0, display:"flex",
            flexDirection:"column", alignItems:"center", justifyContent:"center",
            padding:32, gap:16, textAlign:"center",
          }}>
            <div style={{ fontSize:40 }}>📷</div>
            <div style={{ fontSize:14, fontWeight:600, color:"#F87171", fontFamily:FONT }}>
              Caméra indisponible
            </div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.55)", lineHeight:1.6, fontFamily:FONT }}>
              {errMsg}
            </div>
            <button onClick={onClose} style={{
              marginTop:8, padding:"10px 24px",
              background:"#3B82F6", border:"none",
              borderRadius:12, color:"#fff",
              fontSize:14, fontWeight:600, fontFamily:FONT, cursor:"pointer",
            }}>Fermer</button>
          </div>
        )}
      </div>

      {/* Saisie manuelle en bas */}
      {status !== "error" && (
        <div style={{
          padding:"16px 20px 32px",
          background:"rgba(11,18,32,0.95)",
          borderTop:"1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.40)", fontFamily:FONT,
            textAlign:"center", marginBottom:10 }}>
            Ou saisissez le code manuellement
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input
              ref={manualRef}
              type="text" inputMode="numeric"
              placeholder="Ex: 3017620422003"
              onKeyDown={e => { if (e.key === "Enter") submitManualCode(); }}
              style={{
                flex:1, padding:"11px 14px",
                background:"rgba(255,255,255,0.08)",
                border:"1px solid rgba(255,255,255,0.12)",
                borderRadius:12, color:"#F2F4F7",
                fontSize:14, fontFamily:FONT, outline:"none",
              }}
            />
            <button
              onClick={submitManualCode}
              style={{
                padding:"11px 16px", background:"#3B82F6",
                border:"none", borderRadius:12, color:"#fff",
                fontSize:13, fontWeight:600, fontFamily:FONT, cursor:"pointer",
              }}>OK</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scanLine {
          0%   { transform: translateY(-30px); opacity:0.5 }
          50%  { transform: translateY(30px);  opacity:1   }
          100% { transform: translateY(-30px); opacity:0.5 }
        }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}
