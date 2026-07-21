import { useEffect, useRef, useState } from"react";
import { I } from"../../components/ui/Icon.jsx";
import { ID } from"../../components/ui/Icon.jsx";
import { BrowserMultiFormatReader } from"@zxing/browser";
import { NotFoundException, DecodeHintType, BarcodeFormat } from"@zxing/library";
import { C, FONT } from"../../data/constants.js";


export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef    = useRef(null);
  const readerRef   = useRef(null);
  const [status,  setStatus]  = useState("init"); // init | scanning | error | found
  const [errMsg,  setErrMsg]  = useState("");
  const [lastCode,setLastCode]= useState("");
  const [flash,   setFlash]   = useState(false);

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

    // 3. anti-doublon par ref : l'ancien`lastCode` (useState) restait figé à
    //"" dans la closure → une fois le code lu, onDetected partait en
    //    BOUCLE plusieurs fois par seconde ("il cherche en permanence").
    const dejaLu = { current: null };

    async function start() {
      try {
        setStatus("scanning");
        // 2. HAUTE RÉSOLUTION : la définition par défaut (souvent 640×480 sur
        //    iPhone) est trop faible pour lire les barres fines d'un EAN-13.
        controls = await reader.decodeFromConstraints(
          { audio: false,
            video: { facingMode:"environment",
                     width:  { ideal: 1920 },
                     height: { ideal: 1080 } } },
          videoRef.current,
          (result, err) => {
            if (result) {
              const code = result.getText();
              if (dejaLu.current === code) return;
              dejaLu.current = code;
              setLastCode(code);
              setFlash(true);
              setTimeout(() => setFlash(false), 300);
              setStatus("found");
              // scan UNIQUE : on coupe la caméra dès la première lecture —
              // c'est au parent de fermer ou de relancer
              try { controls?.stop(); } catch {}
              if (navigator.vibrate) navigator.vibrate(60);
              onDetected(code);
            }
            if (err && !(err instanceof NotFoundException)) {
              console.warn("Scan err:", err);
            }
          }
);
      } catch (e) {
        console.error("Caméra:", e);
        if (e.name ==="NotAllowedError") {
          setErrMsg("Accès caméra refusé. Autorisez l'accès dans les paramètres du navigateur.");
        } else if (e.name ==="NotFoundError") {
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
      position:"fixed", inset:0, zIndex:380,
      background:"rgba(0,0,0,0.95)",
      display:"flex", flexDirection:"column",
    }}>
      {/* Header */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"16px 20px",
        background:"rgba(11,18,32,0.85)",
        borderBottom:"1px solid rgba(0,0,0,0.05)",
      }}>
        <div style={{ fontSize:14, fontWeight:700, color:"${C.text}", fontFamily:FONT }}>
          Scanner un produit
        </div>
        <button onClick={onClose} style={{
          width:34, height:34, borderRadius:12,
          background:"rgba(0,0,0,0.05)",
          border:"1px solid rgba(0,0,0,0.08)",
          display:"grid", placeItems:"center", cursor:"pointer",
          color:"${C.text}", fontSize:20,
        }}>×</button>
      </div>

      {/* Vidéo */}
      <div style={{ position:"relative", flex:1, overflow:"hidden" }}>
        <video
          ref={videoRef}
          style={{
            width:"100%", height:"100%",
            objectFit:"cover",
            display: status ==="error" ?"none" :"block",
          }}
        />

        {/* Flash de détection */}
        {flash && (
          <div style={{
            position:"absolute", inset:0,
            background:"rgba(60,91,255,0.25)",
            pointerEvents:"none",
            transition:"opacity .15s",
          }}/>
)}

        {/* Viseur central */}
        {status ==="scanning" && (
          <div style={{
            position:"absolute", inset:0,
            display:"flex", alignItems:"center", justifyContent:"center",
            pointerEvents:"none",
          }}>
            {/* Fond semi-transparent autour du viseur */}
            <div style={{ position:"absolute", inset:0, background:"rgba(16,19,24,0.5)" }}/>
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
                boxShadow: C.shadow,
                borderRadius:12,
                border:"2px solid rgba(60,91,255,0.85)",
              }}/>
              {/* Coins */}
              {[
                { top:0,left:0,borderTop:"3px solid #3C5BFF",borderLeft:"3px solid #3C5BFF",borderRadius:"12px 0 0 0" },
                { top:0,right:0,borderTop:"3px solid #3C5BFF",borderRight:"3px solid #3C5BFF",borderRadius:"0 12px 0 0" },
                { bottom:0,left:0,borderBottom:"3px solid #3C5BFF",borderLeft:"3px solid #3C5BFF",borderRadius:"0 0 0 12px" },
                { bottom:0,right:0,borderBottom:"3px solid #3C5BFF",borderRight:"3px solid #3C5BFF",borderRadius:"0 0 12px 0" },
              ].map((s,i) => (
                <div key={i} style={{ position:"absolute", width:24, height:24, ...s }}/>
))}
              {/* Ligne de scan animée */}
              <div style={{
                position:"absolute", left:8, right:8, height:2,
                background:"linear-gradient(90deg,transparent,#3C5BFF,transparent)",
                borderRadius:1, top:"50%",
                animation:"scanLine 2s ease-in-out infinite",
              }}/>
            </div>
            <div style={{
              position:"absolute", bottom:80, left:0, right:0,
              textAlign:"center", fontSize:13, color:"rgba(0,0,0,0.35)",
              fontFamily:FONT, fontWeight:500,
            }}>
              Placez le code-barres dans le cadre
            </div>
          </div>
)}

        {/* Loader init */}
        {status ==="init" && (
          <div style={{
            position:"absolute", inset:0, display:"flex",
            flexDirection:"column", alignItems:"center", justifyContent:"center",
            gap:16,
          }}>
            <div style={{
              width:44, height:44,
              border:"3px solid rgba(60,91,255,0.12)",
              borderTop:"3px solid #3C5BFF",
              borderRadius:"50%", animation:"spin .8s linear infinite",
            }}/>
            <div style={{ fontSize:13, color:"rgba(0,0,0,0.25)", fontFamily:FONT }}>
              Activation de la caméra…
            </div>
          </div>
)}

        {/* Succès */}
        {status ==="found" && (
          <div style={{
            position:"absolute", inset:0, display:"flex",
            flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16,
          }}>
            <div style={{
              width:72, height:72, borderRadius:20,
              background:"rgba(18,183,106,0.12)",
              border:"2px solid rgba(18,183,106,0.5)",
              display:"grid", placeItems:"center", fontSize:34,
            }}><I name="check" size={12}/></div>
            <div style={{ fontSize:16, fontWeight:600, color:"#12B76A", fontFamily:FONT }}>
              Produit détecté !
            </div>
          </div>
)}

        {/* Erreur */}
        {status ==="error" && (
          <div style={{
            position:"absolute", inset:0, display:"flex",
            flexDirection:"column", alignItems:"center", justifyContent:"center",
            padding:32, gap:16, textAlign:"center",
          }}>
            <div style={{display:"flex",justifyContent:"center"}}><ID name="cameraDuo" size={48}/></div>
            <div style={{ fontSize:14, fontWeight:600, color:"#E5484D", fontFamily:FONT }}>
              Caméra indisponible
            </div>
            <div style={{ fontSize:13, color:"rgba(0,0,0,0.25)", lineHeight:1.6, fontFamily:FONT }}>
              {errMsg}
            </div>
            <button onClick={onClose} style={{
              marginTop:8, padding:"12px 24px",
              background:C.accent, border:"none",
              borderRadius:12, color:"#FFF",
              fontSize:14, fontWeight:600, fontFamily:FONT, cursor:"pointer",
            }}>Fermer</button>
          </div>
)}
      </div>

      {/* Saisie manuelle en bas */}
      {status !=="error" && (
        <div style={{
          padding:"16px 20px 32px",
          background:"rgba(11,18,32,0.95)",
          borderTop:"1px solid rgba(0,0,0,0.05)",
        }}>
          <div style={{ fontSize:11, color:"rgba(0,0,0,0.18)", fontFamily:FONT,
            textAlign:"center", marginBottom:12 }}>
            Ou saisissez le code manuellement
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input
              type="text" inputMode="numeric"
              placeholder="Ex: 3017620422003"
              onKeyDown={e => { if (e.key ==="Enter" && e.target.value.length >= 8) onDetected(e.target.value); }}
              style={{
                flex:1, padding:"12px 16px",
                background:"rgba(0,0,0,0.05)",
                border:"1px solid rgba(0,0,0,0.08)",
                borderRadius:12, color:"${C.text}",
                fontSize:14, fontFamily:FONT, outline:"none",
              }}
            />
            <button
              onClick={e => {
                const inp = e.target.closest("div").querySelector("input");
                if (inp.value.length >= 8) onDetected(inp.value);
              }}
              style={{
                padding:"12px 16px", background:C.accent,
                border:"none", borderRadius:12, color:"#FFF",
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
