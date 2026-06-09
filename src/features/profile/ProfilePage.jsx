import { useState } from "react";
import { C, OBJ, ACTIVITE_FACTOR, FONT, SERIF, NUM } from "../../data/constants.js";

// ─── Icônes SVG inline ────────────────────────────────────────────────────────
function I({ d, size = 18, color = "currentColor", sw = 1.8, fill = "none" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={fill} stroke={color} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}

const ic = {
  flame:    <path d="M12 2c0 6-6 8-6 14a6 6 0 0 0 12 0c0-6-6-8-6-14z"/>,
  dumbbell: <path d="M6.5 6.5 17.5 17.5M4 8l4-4M16 20l4-4M2 10l2-2M20 16l2-2M9 4l3 3M15 17l3 3"/>,
  bone:     <><path d="M17 10c.7-.7 1.69-.9 2.5-.5.8.4 1.4 1.3 1.4 2.2s-.6 1.8-1.4 2.2c-.8.4-1.8.2-2.5-.5l-7-7c-.7-.7-.9-1.69-.5-2.5.4-.8 1.3-1.4 2.2-1.4s1.8.6 2.2 1.4c.4.81.2 1.81-.5 2.5M7 14c-.7.7-1.69.9-2.5.5-.8-.4-1.4-1.3-1.4-2.2s.6-1.8 1.4-2.2c.8-.4 1.8-.2 2.5.5l7 7c.7.7.9 1.69.5 2.5-.4.8-1.3 1.4-2.2 1.4s-1.8-.6-2.2-1.4c-.4-.81-.2-1.81.5-2.5"/></>,
  drop:     <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>,
  heart:    <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>,
  ruler:    <><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2"/></>,
  target:   <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  zap:      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
  activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
  crown:    <path d="M2 20h20M5 20 3 7l7 5 4-8 4 8 7-5-2 13"/>,
  upload:   <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
  chev:     <path d="m9 18 6-6-6-6"/>,
};

// ─── Carte Glass ──────────────────────────────────────────────────────────────
function Glass({ children, style = {}, glow, pad = 18, onClick }) {
  return (
    <div onClick={onClick} style={{
      position: "relative",
      borderRadius: 22,
      padding: pad,
      background: "linear-gradient(160deg, rgba(0,0,0,0.04), rgba(255,255,255,0.01))",
      border: "1px solid rgba(0,0,0,0.06)",
      boxShadow: glow
        ? `0 18px 40px -22px ${glow}, inset 0 1px 0 rgba(0,0,0,0.06)`
        : "0 18px 40px -28px rgba(0,0,0,0.9), inset 0 1px 0 rgba(0,0,0,0.05)",
      cursor: onClick ? "pointer" : "default",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ value, unit, label, color }) {
  return (
    <Glass pad={0} style={{ flex: 1 }}>
      <div style={{ padding: "20px 8px 16px", textAlign: "center", position: "relative", overflow: "hidden", borderRadius: 22 }}>
        <div style={{
          position: "absolute", top: -30, left: "50%", transform: "translateX(-50%)",
          width: 120, height: 120, borderRadius: "50%",
          background: `radial-gradient(circle, ${color}33, transparent 70%)`,
          pointerEvents: "none",
        }}/>
        <div style={{ position: "relative" }}>
          <span style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: -1, fontFamily: FONT, ...NUM }}>{value ?? "—"}</span>
          {unit && <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(242,244,247,0.40)", marginLeft: 2, fontFamily: FONT }}>{unit}</span>}
        </div>
        <div style={{ position: "relative", fontSize: 11.5, color: "rgba(242,244,247,0.40)", marginTop: 4, fontFamily: FONT }}>{label}</div>
      </div>
    </Glass>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
function Tabs({ active, setActive }) {
  const items = ["Profil", "Compo.", "Mesures"];
  const idx = items.indexOf(active);
  return (
    <div style={{
      position: "relative", display: "flex", padding: 5, borderRadius: 18,
      background: "rgba(255,255,255,0.035)", border: "1px solid rgba(0,0,0,0.05)",
      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
    }}>
      <div style={{
        position: "absolute", top: 5, bottom: 5, left: 5,
        width: "calc((100% - 10px) / 3)",
        transform: `translateX(${idx * 100}%)`,
        borderRadius: 14,
        background: "linear-gradient(180deg, rgba(59,130,246,0.28), rgba(59,130,246,0.12))",
        border: "1px solid rgba(96,165,250,0.4)",
        boxShadow: "0 8px 22px -10px rgba(59,130,246,0.9)",
        transition: "transform .35s cubic-bezier(.65,0,.35,1)",
      }}/>
      {items.map(it => (
        <button key={it} onClick={() => setActive(it)} style={{
          flex: 1, position: "relative", zIndex: 1, background: "transparent",
          border: "none", padding: "12px 0", borderRadius: 14, cursor: "pointer",
          fontFamily: FONT, fontSize: 14, fontWeight: active === it ? 700 : 500,
          color: active === it ? "#fff" : "rgba(242,244,247,0.40)", transition: "color .25s",
        }}>{it}</button>
      ))}
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "26px 4px 12px" }}>
      {icon && <I d={icon} size={13} color="#60a5fa"/>}
      <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "2.5px", color: "${C.dim}", fontFamily: FONT, textTransform: "uppercase" }}>{children}</span>
    </div>
  );
}

// ─── Row (affichage) ──────────────────────────────────────────────────────────
function Row({ label, value, accent, last }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "16px 18px",
      borderBottom: last ? "none" : "1px solid rgba(0,0,0,0.04)",
    }}>
      <span style={{ color: "rgba(242,244,247,0.40)", fontSize: 14, fontFamily: FONT }}>{label}</span>
      <span style={{ color: accent || C.text, fontSize: 15, fontWeight: 700, fontFamily: FONT }}>{value || "—"}</span>
    </div>
  );
}

// ─── Ligne éditable ───────────────────────────────────────────────────────────
function EditRow({ label, value, displayValue, type = "text", onChange, options, unit, last }) {
  const [editing, setEditing] = useState(false);
  return (
    <div onClick={() => !editing && setEditing(true)} style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "16px 18px",
      borderBottom: last ? "none" : "1px solid rgba(0,0,0,0.04)",
      cursor: editing ? "default" : "pointer",
    }}>
      <span style={{ color: "rgba(242,244,247,0.40)", fontSize: 14, fontFamily: FONT }}>{label}</span>
      {editing ? (
        options
          ? <select autoFocus value={value || ""} onChange={e => { onChange(e.target.value); setEditing(false); }}
              onBlur={() => setEditing(false)}
              style={{ background: C.s2, border: "1px solid rgba(59,130,246,0.5)", borderRadius: 9, color: C.text, fontSize: 13, padding: "6px 10px", outline: "none" }}>
              {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          : <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input autoFocus type={type} value={value || ""}
                onChange={e => onChange(e.target.value)}
                onBlur={() => setEditing(false)}
                onKeyDown={e => e.key === "Enter" && setEditing(false)}
                style={{ background: C.s2, border: "1px solid rgba(59,130,246,0.5)", borderRadius: 9, color: C.text, fontSize: 13, padding: "6px 10px", outline: "none", maxWidth: 90, textAlign: "right" }}
              />
              {unit && <span style={{ fontSize: 11, color: "${C.dim}", fontFamily: FONT }}>{unit}</span>}
            </div>
      ) : (
        <span style={{ fontSize: 15, fontWeight: 700, color: value ? C.text : "rgba(242,244,247,0.20)", fontFamily: FONT }}>
          {displayValue || value || <span style={{ fontSize: 12, fontWeight: 400, color: "rgba(242,244,247,0.20)" }}>Ajouter</span>}
          {unit && value && <span style={{ fontSize: 11, color: "${C.dim}", fontWeight: 400, marginLeft: 4 }}>{unit}</span>}
        </span>
      )}
    </div>
  );
}

// ─── Add Row (mensuration) ────────────────────────────────────────────────────
function AddRow({ icon, color, label, value, unit, onChange, last }) {
  const [editing, setEditing] = useState(false);
  return (
    <div onClick={() => !editing && setEditing(true)} style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "15px 18px",
      borderBottom: last ? "none" : "1px solid rgba(0,0,0,0.04)",
      cursor: editing ? "default" : "pointer",
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 12, display: "grid", placeItems: "center", flexShrink: 0,
        background: `linear-gradient(160deg, ${color}26, ${color}0d)`,
        border: `1px solid ${color}33`,
      }}>
        <I d={icon} size={17} color={color} sw={1.8}/>
      </div>
      <span style={{ flex: 1, color: C.text, fontSize: 15, fontWeight: 500, fontFamily: FONT }}>{label}</span>
      {editing
        ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input autoFocus type="number" value={value || ""}
              onChange={e => onChange(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={e => e.key === "Enter" && setEditing(false)}
              style={{ background: C.s2, border: "1px solid rgba(59,130,246,0.5)", borderRadius: 9, color: C.text, fontSize: 13, padding: "6px 10px", outline: "none", width: 70, textAlign: "right" }}
            />
            <span style={{ fontSize: 11, color: "${C.dim}" }}>cm</span>
          </div>
        : value
          ? <span style={{ fontSize: 15, fontWeight: 700, color: color, fontFamily: FONT }}>{value} cm</span>
          : <span style={{ fontSize: 13, fontWeight: 600, color: "#60a5fa", display: "flex", alignItems: "center", gap: 2, fontFamily: FONT }}>
              Ajouter <I d={ic.chev} size={14} color="#60a5fa" sw={2}/>
            </span>
      }
    </div>
  );
}

// ─── Macro Ring ───────────────────────────────────────────────────────────────
function MacroRing({ value, max, label, color }) {
  const r = 30, circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <Glass pad={14} style={{ flex: 1, textAlign: "center" }} glow={`${color}55`}>
      <div style={{ position: "relative", width: 76, height: 76, margin: "0 auto" }}>
        <svg width="76" height="76" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="7"/>
          <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(.65,0,.35,1)" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: FONT, ...NUM }}>{value || 0}</div>
            <div style={{ fontSize: 10, color: "${C.dim}", marginTop: -2 }}>g</div>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "rgba(242,244,247,0.40)", marginTop: 8, fontFamily: FONT }}>{label}</div>
    </Glass>
  );
}

// ─── Compo Bar ────────────────────────────────────────────────────────────────
function CompoBar({ icon, color, label, value, unit, onChange, pct, last }) {
  const [editing, setEditing] = useState(false);
  const pctVal = pct || 0;
  return (
    <div style={{ padding: "16px 18px", borderBottom: last ? "none" : "1px solid rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 11, display: "grid", placeItems: "center", flexShrink: 0,
          background: `linear-gradient(160deg, ${color}26, ${color}0d)`,
          border: `1px solid ${color}33`,
        }}>
          <I d={icon} size={16} color={color} sw={1.8}/>
        </div>
        <span style={{ flex: 1, color: C.text, fontSize: 14, fontWeight: 500, fontFamily: FONT }}>{label}</span>
        {editing
          ? <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <input autoFocus type="number"
                value={value || ""}
                onChange={e => onChange(e.target.value)}
                onBlur={() => setEditing(false)}
                onKeyDown={e => e.key === "Enter" && setEditing(false)}
                style={{ background: C.s2, border: "1px solid rgba(59,130,246,0.5)", borderRadius: 9, color: C.text, fontSize: 13, padding: "5px 9px", outline: "none", width: 70, textAlign: "right" }}
              />
              <span style={{ fontSize: 11, color: "${C.dim}" }}>{unit}</span>
            </div>
          : <span onClick={() => setEditing(true)}
              style={{ fontSize: 14, fontWeight: 700, color: value ? color : "#60a5fa", cursor: "pointer", fontFamily: FONT }}>
              {value ? `${value}${unit}` : <span style={{ fontSize: 12, color: "#60a5fa" }}>Ajouter</span>}
            </span>
        }
      </div>
      {/* Barre de progression */}
      <div style={{ height: 7, borderRadius: 99, background: "rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pctVal}%`, borderRadius: 99,
          background: `linear-gradient(90deg, ${color}, ${color}99)`,
          transition: "width 1s cubic-bezier(.65,0,.35,1)",
        }}/>
      </div>
    </div>
  );
}

// ─── ACTIVITE LABELS ──────────────────────────────────────────────────────────
const ACTIVITE_LABELS = {
  sedentaire: "Sédentaire",
  leger:      "Léger · 1–3×/sem",
  modere:     "Modéré · 3–5×/sem",
  actif:      "Très actif · 6–7×/sem",
};

// ─── MAIN PROFILE PAGE ────────────────────────────────────────────────────────
export default function Profile(props) {
  const { profil, setProfil, premium, setPremium, push,
    weightLog, imc, obj, calObj, pObj, lObj, gObj } = props;

  const [activeTab, setActiveTab] = useState("Profil");
  const set = key => val => setProfil({ ...profil, [key]: val });

  // IMC catégorie
  const imcVal = parseFloat(imc) || 0;
  const imcCat = imcVal < 18.5 ? "Maigreur" : imcVal < 25 ? "Normal" : imcVal < 30 ? "Surpoids" : "Obésité";
  const imcColor = imcVal < 18.5 ? "#60a5fa" : imcVal < 25 ? "#34D399" : imcVal < 30 ? "#fb923c" : "#f87171";
  const imcPct = Math.min(100, Math.max(0, ((imcVal - 15) / (40 - 15)) * 100));

  // Macros cibles
  const macros = [
    { label: "Protéines", value: pObj || 0, max: Math.round((pObj || 0) * 1.2), color: "#f87171" },
    { label: "Glucides",  value: gObj || 0, max: Math.round((gObj || 0) * 1.2), color: "#fb923c" },
    { label: "Lipides",   value: lObj || 0, max: Math.round((lObj || 0) * 1.2), color: "#34D399" },
  ];

  // Compo bars pct estimé
  const bfVal  = parseFloat(profil.bodyfat)    || 0;
  const mmVal  = parseFloat(profil.muscleMass) || 0;
  const bmVal  = parseFloat(profil.boneMass)   || 0;
  const wPct   = parseFloat(profil.waterPct)   || 0;
  const vfVal  = parseFloat(profil.visceralFat)|| 0;

  return (
    <div className="anim" style={{
      minHeight: "100vh", fontFamily: FONT, color: C.text,
      padding: "22px 18px 48px",
      background: `radial-gradient(800px 400px at 70% -10%, rgba(59,130,246,0.14), transparent 60%), ${C.bg}`,
    }}>
      <style>{`@keyframes rise { from { opacity:0; transform:translateY(12px)} to {opacity:1;transform:none} }`}</style>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
        <div style={{ animation: "rise .4s both" }}>
          <div style={{ fontFamily: SERIF, fontSize: 36, color: C.text, letterSpacing: -1.2, lineHeight: 1.05, marginBottom: 10 }}>
            {profil.prenom
              ? <>Bonjour, <span style={{ fontStyle: "italic" }}>{profil.prenom}</span></>
              : "Mon profil"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {premium
              ? <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 12, fontWeight: 700, letterSpacing: "1.5px",
                  color: "#fde68a", padding: "6px 12px", borderRadius: 11,
                  background: "linear-gradient(160deg, rgba(251,191,36,0.18), rgba(251,191,36,0.05))",
                  border: "1px solid rgba(251,191,36,0.35)",
                  fontFamily: FONT,
                }}>
                  <I d={ic.crown} size={13} color="#fbbf24" fill="none" sw={2}/> PREMIUM
                </span>
              : <span style={{
                  background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: 11, padding: "4px 10px", fontSize: 10, fontWeight: 600,
                  color: "rgba(242,244,247,0.28)", letterSpacing: "0.5px", fontFamily: FONT,
                }}>GRATUIT</span>
            }
            {profil.age && profil.sexe && (
              <span style={{ fontSize: 13, color: "rgba(242,244,247,0.40)", fontFamily: FONT }}>
                {profil.age} ans · {profil.sexe === "homme" ? "Homme" : "Femme"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 22, animation: "rise .4s .08s both" }}>
        <StatCard value={profil.poids} unit="kg"  label="Poids"  color="#60a5fa"/>
        <StatCard value={profil.taille} unit="cm" label="Taille" color="#34D399"/>
        <StatCard value={imc}           unit=""   label="IMC"    color={imcColor}/>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 4, animation: "rise .4s .12s both" }}>
        <Tabs active={activeTab} setActive={setActiveTab}/>
      </div>

      {/* ══════ PROFIL ══════════════════════════════════════════════ */}
      {activeTab === "Profil" && (
        <div key="profil">
          <SectionLabel icon={ic.target}>Identité</SectionLabel>
          <Glass pad={0} style={{ animation: "rise .4s both" }}>
            <EditRow label="Prénom" value={profil.prenom} onChange={set("prenom")}/>
            <div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
              <div style={{ flex: 1, borderRight: "1px solid rgba(0,0,0,0.04)" }}>
                <EditRow label="Âge" value={profil.age} displayValue={profil.age ? `${profil.age} ans` : null} type="number" onChange={set("age")} last/>
              </div>
              <div style={{ flex: 1 }}>
                <EditRow label="Genre" value={profil.sexe}
                  displayValue={profil.sexe === "homme" ? "Homme" : profil.sexe === "femme" ? "Femme" : null}
                  onChange={set("sexe")}
                  options={[{ value: "", label: "—" }, { value: "homme", label: "Homme" }, { value: "femme", label: "Femme" }]}
                  last/>
              </div>
            </div>
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1, borderRight: "1px solid rgba(0,0,0,0.04)" }}>
                <EditRow label="Poids" value={profil.poids} displayValue={profil.poids ? `${profil.poids} kg` : null} unit="kg" type="number" onChange={set("poids")} last/>
              </div>
              <div style={{ flex: 1 }}>
                <EditRow label="Taille" value={profil.taille} displayValue={profil.taille ? `${profil.taille} cm` : null} unit="cm" type="number" onChange={set("taille")} last/>
              </div>
            </div>
          </Glass>

          <SectionLabel icon={ic.zap}>Programme</SectionLabel>
          <Glass pad={0} style={{ animation: "rise .4s .08s both" }}>
            <EditRow label="Objectif" value={profil.objectif}
              displayValue={obj ? `${obj.icon} ${obj.l}` : null}
              onChange={set("objectif")}
              options={Object.entries(OBJ).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.l}` }))}
            />
            <EditRow label="Activité" value={profil.activite}
              displayValue={ACTIVITE_LABELS[profil.activite] || null}
              onChange={set("activite")}
              options={Object.entries(ACTIVITE_FACTOR).map(([k]) => ({ value: k, label: ACTIVITE_LABELS[k] || k }))}
            />
            {calObj > 0 && (
              <Row label="Besoins caloriques" value={`${calObj.toLocaleString()} kcal/j`} accent="#60a5fa" last/>
            )}
          </Glass>

          {calObj > 0 && (
            <>
              <SectionLabel icon={ic.flame}>Macros cibles</SectionLabel>
              <div style={{ display: "flex", gap: 10, animation: "rise .4s .16s both" }}>
                {macros.map(m => (
                  <MacroRing key={m.label} value={m.value} max={m.max} label={m.label} color={m.color}/>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════ COMPO ═══════════════════════════════════════════════ */}
      {activeTab === "Compo." && (
        <div key="compo">
          <div style={{ display: "flex", gap: 10, marginTop: 22, animation: "rise .4s both" }}>
            <Glass style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", color: "${C.dim}", fontFamily: FONT, marginBottom: 8 }}>POIDS</div>
              <span style={{ fontSize: 30, fontWeight: 800, color: "#60a5fa", fontFamily: FONT }}>{profil.poids || "—"}</span>
              <span style={{ fontSize: 14, color: "rgba(242,244,247,0.40)", fontWeight: 600 }}> kg</span>
            </Glass>
            <Glass style={{ flex: 1 }} glow={`${imcColor}44`}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", color: "${C.dim}", fontFamily: FONT, marginBottom: 8 }}>IMC</div>
              <span style={{ fontSize: 30, fontWeight: 800, color: imcColor, fontFamily: FONT }}>{imc || "—"}</span>
              <div style={{ fontSize: 12, color: imcColor, marginTop: 3, fontFamily: FONT }}>{imc ? imcCat : ""}</div>
              {imc && (
                <div style={{ height: 6, borderRadius: 99, marginTop: 10, background: "linear-gradient(90deg,#34d399,#fbbf24,#f87171)", position: "relative" }}>
                  <div style={{ position: "absolute", top: -3, left: `${imcPct}%`, width: 12, height: 12, borderRadius: "50%", background: "#fff", border: "2px solid #070b16", boxShadow: "0 2px 6px rgba(0,0,0,0.6)", transform: "translateX(-50%)" }}/>
                </div>
              )}
            </Glass>
          </div>

          <SectionLabel icon={ic.activity}>Composition</SectionLabel>
          <Glass pad={0} style={{ animation: "rise .4s .1s both" }}>
            <CompoBar icon={ic.flame}    color="#fb923c" label="Masse grasse"     value={profil.bodyfat}     unit="%"   onChange={set("bodyfat")}     pct={bfVal * 2.5}  />
            <CompoBar icon={ic.dumbbell} color="#34D399" label="Masse musculaire" value={profil.muscleMass}  unit="kg"  onChange={set("muscleMass")}  pct={mmVal * 1.2}  />
            <CompoBar icon={ic.bone}     color="#cbd5e1" label="Masse osseuse"    value={profil.boneMass}    unit="kg"  onChange={set("boneMass")}    pct={bmVal * 16}   />
            <CompoBar icon={ic.drop}     color="#38bdf8" label="Eau corporelle"   value={profil.waterPct}    unit="%"   onChange={set("waterPct")}    pct={wPct * 1.2}   />
            <CompoBar icon={ic.heart}    color="#f87171" label="Graisse viscérale" value={profil.visceralFat} unit="/20" onChange={set("visceralFat")} pct={vfVal * 5} last/>
          </Glass>
        </div>
      )}

      {/* ══════ MESURES ═════════════════════════════════════════════ */}
      {activeTab === "Mesures" && (
        <div key="mesures">
          <Glass style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 16, animation: "rise .4s both" }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, display: "grid", placeItems: "center", flexShrink: 0,
              background: "linear-gradient(160deg, rgba(59,130,246,0.25), rgba(59,130,246,0.08))",
              border: "1px solid rgba(96,165,250,0.35)",
            }}>
              <I d={ic.ruler} size={24} color="#60a5fa" sw={1.8}/>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: FONT }}>Mensurations corporelles</div>
              <div style={{ fontSize: 13, color: "rgba(242,244,247,0.40)", marginTop: 3, fontFamily: FONT }}>Appuie sur une ligne pour la modifier</div>
            </div>
          </Glass>

          <SectionLabel>Tronc</SectionLabel>
          <Glass pad={0} style={{ animation: "rise .4s .08s both" }}>
            <AddRow icon={ic.ruler} color="#60a5fa" label="Poitrine"  value={profil.mChest}  onChange={set("mChest")} />
            <AddRow icon={ic.ruler} color="#60a5fa" label="Taille"    value={profil.mWaist}  onChange={set("mWaist")} />
            <AddRow icon={ic.ruler} color="#60a5fa" label="Hanches"   value={profil.mHips}   onChange={set("mHips")}  last/>
          </Glass>

          <SectionLabel>Bras</SectionLabel>
          <Glass pad={0} style={{ animation: "rise .4s .14s both" }}>
            <AddRow icon={ic.dumbbell} color="#34D399" label="Bras gauche" value={profil.mLeftArm}  onChange={set("mLeftArm")} />
            <AddRow icon={ic.dumbbell} color="#34D399" label="Bras droit"  value={profil.mRightArm} onChange={set("mRightArm")} last/>
          </Glass>

          <SectionLabel>Jambes</SectionLabel>
          <Glass pad={0} style={{ animation: "rise .4s .2s both" }}>
            <AddRow icon={ic.activity} color="#fb923c" label="Cuisse gauche"  value={profil.mLeftThigh}  onChange={set("mLeftThigh")} />
            <AddRow icon={ic.activity} color="#fb923c" label="Cuisse droite"  value={profil.mRightThigh} onChange={set("mRightThigh")} />
            <AddRow icon={ic.activity} color="#fb923c" label="Mollet gauche"  value={profil.mLeftCalf}   onChange={set("mLeftCalf")} />
            <AddRow icon={ic.activity} color="#fb923c" label="Mollet droit"   value={profil.mRightCalf}  onChange={set("mRightCalf")} last/>
          </Glass>
        </div>
      )}

      {/* ── Partager ────────────────────────────────────────────────── */}
      <button onClick={() => {
        const txt = `${profil.prenom || "Utilisateur"} — ${profil.poids}kg, ${profil.taille}cm\nObjectif : ${obj?.l || "—"}\nCalories : ${calObj || "—"} kcal/j`;
        if (navigator.share) navigator.share({ title: "Mon profil MorphoCoach", text: txt });
        else push?.("✅", "Copié !", "Profil copié dans le presse-papier.");
      }} style={{
        width: "100%", marginTop: 26, padding: "17px", borderRadius: 18,
        background: "linear-gradient(160deg, rgba(59,130,246,0.20), rgba(59,130,246,0.06))",
        border: "1px solid rgba(96,165,250,0.30)", color: "#fff", fontFamily: FONT,
        fontSize: 15, fontWeight: 600, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        boxShadow: "0 14px 30px -16px rgba(59,130,246,0.8)",
        animation: "rise .4s .3s both",
      }}>
        <I d={ic.upload} size={18} color="#60a5fa" sw={2}/> Partager mon profil
      </button>

    </div>
  );
}
