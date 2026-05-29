import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";

const FONT = "'Outfit','DM Sans',system-ui,sans-serif";

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef    = useRef(null);
  const readerRef   = useRef(null);
  const [status,  setStatus]  = useState("init"); // init | scanning | error | found
  const [errMsg,  setErrMsg]  = useState("");
  const [lastCode,setLastCode]= useState("");
  const [flash,   setFlash]   = useState(false);

  useEffect(() => {
    let controls = null;
    const reader  = new BrowserMultiFormatReader();
    readerRef.current = reader;

    async function start() {
      try {
        setStatus("scanning");
        controls = await reader.decodeFromVideoDevice(
          undefined, // utilise la caméra arrière par défaut
          videoRef.current,
          (result, err) => {
            if (result) {
              const code = result.getText();
              if (code === lastCode) return; // éviter les doublons rapides
              setLastCode(code);
              setFlash(true);
              setTimeout(() => setFlash(false), 300);
              setStatus("found");
              onDetected(code);
            }
            if (err && !(err instanceof NotFoundException)) {
              console.warn("Scan err:", err);
            }
          }
        );
      } catch (e) {
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
      try { controls?.stop(); } catch {}
      try { BrowserMultiFormatReader.releaseAllStreams(); } catch {}
    };
  }, []);

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
        <button onClick={onClose} style={{
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
            {/* Fond semi-transparent autour du viseur */}
            <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.35)" }}/>
            {/* Rectangle viseur */}
            <div style={{
              position:"relative",
              width:260, height:140,
              borderRadius:12,
            }}>
              {/* Découpe transparente */}
              <div style={{
                position:"absolute", inset:0,
                background:"transparent",
                boxShadow:"0 0 0 9999px rgba(0,0,0,0.50)",
                borderRadius:12,
                border:"2px solid rgba(59,130,246,0.80)",
              }}/>
              {/* Coins */}
              {[
                { top:0,left:0,borderTop:"3px solid #3B82F6",borderLeft:"3px solid #3B82F6",borderRadius:"10px 0 0 0" },
                { top:0,right:0,borderTop:"3px solid #3B82F6",borderRight:"3px solid #3B82F6",borderRadius:"0 10px 0 0" },
                { bottom:0,left:0,borderBottom:"3px solid #3B82F6",borderLeft:"3px solid #3B82F6",borderRadius:"0 0 0 10px" },
                { bottom:0,right:0,borderBottom:"3px solid #3B82F6",borderRight:"3px solid #3B82F6",borderRadius:"0 0 10px 0" },
              ].map((s,i) => (
                <div key={i} style={{ position:"absolute", width:24, height:24, ...s }}/>
              ))}
              {/* Ligne de scan animée */}
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
              type="text" inputMode="numeric"
              placeholder="Ex: 3017620422003"
              onKeyDown={e => { if (e.key === "Enter" && e.target.value.length >= 8) onDetected(e.target.value); }}
              style={{
                flex:1, padding:"11px 14px",
                background:"rgba(255,255,255,0.08)",
                border:"1px solid rgba(255,255,255,0.12)",
                borderRadius:12, color:"#F2F4F7",
                fontSize:14, fontFamily:FONT, outline:"none",
              }}
            />
            <button
              onClick={e => {
                const inp = e.target.closest("div").querySelector("input");
                if (inp.value.length >= 8) onDetected(inp.value);
              }}
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
