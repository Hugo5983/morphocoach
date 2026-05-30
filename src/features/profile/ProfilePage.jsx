import { useState } from "react";
import { C, OBJ, ACTIVITE_FACTOR, FONT, NUM } from "../../data/constants.js";
import { Card, Eyebrow, Pill, Bar, Inp, G2 } from "../../components/ui/index.jsx";

// ─── WEIGHT CHART ─────────────────────────────────────────────────────────────
function WeightChart({ data }) {
  if (!data || data.length < 2) return null;
  const W = 320, H = 120, PAD = { top: 16, right: 16, bottom: 28, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const vals  = data.map(d => parseFloat(d.poids));
  const dates = data.map(d => d.date ? new Date(d.date) : null);
  const minV  = Math.min(...vals) - 0.5;
  const maxV  = Math.max(...vals) + 0.5;
  const x = i => PAD.left + (i / (vals.length - 1)) * innerW;
  const y = v => PAD.top + innerH - ((v - minV) / (maxV - minV)) * innerH;
  const pts = vals.map((v, i) => ({ x: x(i), y: y(v) }));
  const path = pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = pts[i - 1];
    const cp1x = prev.x + (pt.x - prev.x) * 0.5;
    const cp2x = pt.x  - (pt.x - prev.x) * 0.5;
    return `${acc} C ${cp1x} ${prev.y}, ${cp2x} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");
  const areaPath = `${path} L ${pts.at(-1).x} ${PAD.top + innerH} L ${pts[0].x} ${PAD.top + innerH} Z`;
  const delta  = vals.at(-1) - vals[0];
  const isGain = delta >= 0;
  const lineColor = C.accent;
  const yTicks = [minV + 0.5, (minV + maxV) / 2, maxV - 0.5].map(v => ({ v: v.toFixed(1), y: y(v) }));
  const formatDate = d => d ? d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "";

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
        <div>
          <Eyebrow style={{ marginBottom: 3 }}>Poids actuel</Eyebrow>
          <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
            <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1.5, color: C.text, lineHeight: 1, ...NUM }}>{vals.at(-1)}</span>
            <span style={{ fontSize: 13, color: "rgba(242,244,247,0.40)", fontWeight: 400 }}>kg</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <Eyebrow style={{ marginBottom: 3 }}>Évolution</Eyebrow>
          <Pill color={isGain ? C.accent : C.green} style={{ fontSize: 13, fontWeight: 700 }}>
            {isGain ? "+" : ""}{delta.toFixed(1)} kg
          </Pill>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ overflow: "visible", display: "block" }}>
        <defs>
          <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={lineColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0"    />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor={lineColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="1"   />
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <line key={i} x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
        ))}
        {yTicks.map((t, i) => (
          <text key={i} x={PAD.left - 8} y={t.y + 4} textAnchor="end"
            fill="rgba(242,244,247,0.25)" fontSize="9" fontFamily="'DM Sans',sans-serif">{t.v}</text>
        ))}
        <path d={areaPath} fill="url(#wGrad)" />
        <path d={path} fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r="3.5" fill={C.s1} stroke={lineColor} strokeWidth="1.5" />
            {i === pts.length - 1 && <circle cx={pt.x} cy={pt.y} r="5.5" fill="none" stroke={lineColor} strokeWidth="1" opacity="0.35" />}
          </g>
        ))}
        {pts.map((pt, i) => {
          if (pts.length > 6 && i % 2 !== 0 && i !== pts.length - 1) return null;
          return (
            <text key={i} x={pt.x} y={H - 4} textAnchor="middle"
              fill="rgba(242,244,247,0.25)" fontSize="9" fontFamily="'DM Sans',sans-serif">
              {dates[i] ? formatDate(dates[i]) : `J${i + 1}`}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ─── PRIMITIVES ÉDITION ───────────────────────────────────────────────────────
function EditableRow({ label, value, displayValue, type = "text", onChange, options, unit }) {
  const [editing, setEditing] = useState(false);
  return (
    <div onClick={() => !editing && setEditing(true)} style={{
      padding: "14px 0",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      cursor: editing ? "default" : "pointer", userSelect: "none",
    }}>
      <span style={{ fontSize: 13, color: "rgba(242,244,247,0.40)", fontWeight: 500, fontFamily: FONT }}>{label}</span>
      {editing ? (
        options
          ? <select autoFocus value={value || ""}
              onChange={e => { onChange(e.target.value); setEditing(false); }}
              onBlur={() => setEditing(false)}
              style={{ background: C.s2, border: `1px solid rgba(59,130,246,0.5)`, borderRadius: 9, color: C.text, fontSize: 13, padding: "6px 10px", outline: "none", boxShadow: "0 0 0 3px rgba(59,130,246,0.08)" }}>
              {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          : <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Inp autoFocus type={type} value={value || ""}
                onChange={e => onChange(e.target.value)}
                onBlur={() => setEditing(false)}
                onKeyDown={e => e.key === "Enter" && setEditing(false)}
                style={{ marginBottom: 0, maxWidth: 120, padding: "6px 10px", fontSize: 13, textAlign: "right", border: `1px solid rgba(59,130,246,0.5)`, boxShadow: "0 0 0 3px rgba(59,130,246,0.08)", borderRadius: 9 }}
              />
              {unit && <span style={{ fontSize: 12, color: "rgba(242,244,247,0.30)" }}>{unit}</span>}
            </div>
      ) : (
        <span style={{ fontSize: 14, fontWeight: 600, color: value ? C.text : "rgba(242,244,247,0.18)", display: "flex", alignItems: "center", gap: 6, fontFamily: FONT }}>
          {displayValue || value || <span style={{ fontSize: 12, color: "rgba(242,244,247,0.20)", fontWeight: 400 }}>Ajouter</span>}
          {unit && value && <span style={{ fontSize: 11, color: "rgba(242,244,247,0.30)", fontWeight: 400 }}>{unit}</span>}
        </span>
      )}
    </div>
  );
}

function EditableMetricRow({ label, icon, color, value, unit, onChange }) {
  const [editing, setEditing] = useState(false);
  const MAX = { "Masse grasse": 40, "Masse musculaire": 80, "Masse osseuse": 6, "Eau corporelle": 80, "Graisse viscérale": 20 };
  const val  = parseFloat(value) || 0;
  const barW = val ? Math.min((val / (MAX[label] || 100)) * 100, 100) : 0;
  return (
    <div onClick={() => !editing && setEditing(true)} style={{ padding: "12px 0", cursor: editing ? "default" : "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ fontSize: 13, color: "rgba(242,244,247,0.55)", fontWeight: 500, fontFamily: FONT }}>{label}</span>
        </div>
        {editing
          ? <Inp autoFocus type="number" placeholder="—"
              style={{ marginBottom: 0, maxWidth: 90, padding: "5px 9px", fontSize: 13, textAlign: "right", border: `1px solid rgba(59,130,246,0.5)`, boxShadow: "0 0 0 3px rgba(59,130,246,0.08)", borderRadius: 9 }}
              value={value || ""}
              onChange={e => onChange(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={e => e.key === "Enter" && setEditing(false)}
            />
          : <span style={{ fontSize: 15, fontWeight: 700, color: val ? color : "rgba(242,244,247,0.18)", fontFamily: FONT }}>
              {val ? `${val}${unit}` : <span style={{ fontSize: 12, fontWeight: 400, color: "rgba(242,244,247,0.20)" }}>Ajouter</span>}
            </span>}
      </div>
      <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${barW}%`, background: color, borderRadius: 2, opacity: val ? 1 : 0, transition: "width 0.4s cubic-bezier(.16,1,.3,1)" }} />
      </div>
    </div>
  );
}

function EditableMensRow({ label, icon, fieldKey, profil, setProfil }) {
  const [editing, setEditing] = useState(false);
  const val = profil[fieldKey] || "";
  return (
    <div onClick={() => !editing && setEditing(true)}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", cursor: editing ? "default" : "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span style={{ fontSize: 13, color: "rgba(242,244,247,0.55)", fontWeight: 500, fontFamily: FONT }}>{label}</span>
      </div>
      {editing
        ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Inp autoFocus type="number"
              style={{ marginBottom: 0, width: 80, padding: "5px 9px", fontSize: 13, textAlign: "right", border: `1px solid rgba(59,130,246,0.5)`, boxShadow: "0 0 0 3px rgba(59,130,246,0.08)", borderRadius: 9 }}
              value={val}
              onChange={e => setProfil({ ...profil, [fieldKey]: e.target.value })}
              onBlur={() => setEditing(false)}
              onKeyDown={e => e.key === "Enter" && setEditing(false)}
            />
            <span style={{ fontSize: 11, color: "rgba(242,244,247,0.30)" }}>cm</span>
          </div>
        : <span style={{ fontSize: 14, fontWeight: 600, color: val ? C.text : "rgba(242,244,247,0.18)", display: "flex", alignItems: "center", gap: 5, fontFamily: FONT }}>
            {val || <span style={{ fontSize: 12, fontWeight: 400, color: "rgba(242,244,247,0.20)" }}>Ajouter</span>}
            {val && <span style={{ fontSize: 11, color: "rgba(242,244,247,0.30)", fontWeight: 400 }}>cm</span>}
          </span>}
    </div>
  );
}

// ─── COMPOSANTS PARTAGÉS ──────────────────────────────────────────────────────
const Sep = () => <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />;

const Section = ({ title, children, style }) => (
  <div style={{ marginBottom: 32, ...style }}>
    <Eyebrow style={{ letterSpacing: "1.8px", marginBottom: 14 }}>{title}</Eyebrow>
    <Card padding="none" style={{ padding: "0 20px" }}>{children}</Card>
  </div>
);

const TABS = [
  { key: "profil",       label: "Profil"  },
  { key: "compo",        label: "Compo."  },
  { key: "mensurations", label: "Mesures" },
];

const ACTIVITE_LABELS = {
  sedentaire: "Sédentaire",
  leger:      "Léger · 1–3×/sem",
  modere:     "Modéré · 3–5×/sem",
  actif:      "Très actif · 6–7×/sem",
};

// ─── TAB PROFIL ───────────────────────────────────────────────────────────────
function TabProfil({ profil, setProfil, calObj, pObj, lObj, gObj, obj, weightLog }) {
  const set = key => val => setProfil({ ...profil, [key]: val });
  return (
    <div>
      <Section title="Identité">
        <EditableRow label="Prénom" value={profil.prenom} onChange={set("prenom")} />
        <Sep />
        <div style={{ display: "flex", gap: 0 }}>
          <div style={{ flex: 1 }}>
            <EditableRow label="Âge" value={profil.age} displayValue={profil.age ? `${profil.age} ans` : null} type="number" onChange={set("age")} />
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.05)", alignSelf: "stretch" }} />
          <div style={{ flex: 1, paddingLeft: 16 }}>
            <EditableRow label="Genre" value={profil.sexe}
              displayValue={profil.sexe === "homme" ? "Homme" : profil.sexe === "femme" ? "Femme" : null}
              onChange={set("sexe")}
              options={[{ value: "", label: "—" }, { value: "homme", label: "Homme" }, { value: "femme", label: "Femme" }]}
            />
          </div>
        </div>
        <Sep />
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1 }}>
            <EditableRow label="Poids" value={profil.poids} displayValue={profil.poids ? `${profil.poids}` : null} unit="kg" type="number" onChange={set("poids")} />
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.05)", alignSelf: "stretch" }} />
          <div style={{ flex: 1, paddingLeft: 16 }}>
            <EditableRow label="Taille" value={profil.taille} displayValue={profil.taille ? `${profil.taille}` : null} unit="cm" type="number" onChange={set("taille")} />
          </div>
        </div>
      </Section>

      {weightLog?.length >= 2 && (
        <div style={{ marginBottom: 32 }}>
          <Eyebrow style={{ letterSpacing: "1.8px", marginBottom: 14 }}>Historique</Eyebrow>
          <Card padding="lg"><WeightChart data={weightLog.slice(-12)} /></Card>
        </div>
      )}

      <Section title="Programme">
        <EditableRow label="Objectif" value={profil.objectif}
          displayValue={obj?.icon ? `${obj.icon} ${obj.l}` : null}
          onChange={set("objectif")}
          options={Object.entries(OBJ).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.l}` }))}
        />
        <Sep />
        <EditableRow label="Activité" value={profil.activite}
          displayValue={ACTIVITE_LABELS[profil.activite] || null}
          onChange={set("activite")}
          options={Object.entries(ACTIVITE_FACTOR).map(([k]) => ({ value: k, label: ACTIVITE_LABELS[k] || k }))}
        />
        {calObj && (
          <>
            <Sep />
            <div style={{ padding: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "rgba(242,244,247,0.40)", fontWeight: 500, fontFamily: FONT }}>Besoins caloriques</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.accent, fontFamily: FONT }}>{calObj.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 400, color: "rgba(242,244,247,0.40)" }}>kcal/j</span></span>
            </div>
          </>
        )}
      </Section>

      {calObj && (
        <div style={{ marginBottom: 32 }}>
          <Eyebrow style={{ letterSpacing: "1.8px", marginBottom: 14 }}>Macros cibles</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { l: "Protéines", v: pObj, color: "#FF7A6B", bg: "rgba(239,68,68,0.07)"  },
              { l: "Glucides",  v: gObj, color: "#FFAB5D", bg: "rgba(249,115,22,0.07)" },
              { l: "Lipides",   v: lObj, color: "#34D399", bg: "rgba(34,197,94,0.07)"  },
            ].map(m => (
              <div key={m.l} style={{ background: m.bg, border: `1px solid ${m.color}20`, borderRadius: 16, padding: "14px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: m.color, letterSpacing: -1, lineHeight: 1, fontFamily: FONT, ...NUM }}>
                  {m.v}<span style={{ fontSize: 10, fontWeight: 500, letterSpacing: 0 }}>g</span>
                </div>
                <div style={{ fontSize: 10, color: "rgba(242,244,247,0.35)", marginTop: 5, fontWeight: 500, fontFamily: FONT }}>{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB COMPOSITION ──────────────────────────────────────────────────────────
const METRICS = [
  { key: "bodyfat",     label: "Masse grasse",     unit: "%",   icon: "🔥", color: "#FF7043" },
  { key: "muscleMass",  label: "Masse musculaire",  unit: "kg",  icon: "💪", color: "#42A5F5" },
  { key: "boneMass",    label: "Masse osseuse",     unit: "kg",  icon: "🦴", color: "#AB47BC" },
  { key: "waterPct",    label: "Eau corporelle",    unit: "%",   icon: "💧", color: "#26C6DA" },
  { key: "visceralFat", label: "Graisse viscérale", unit: "/20", icon: "🫀", color: "#EF5350" },
];

function TabComposition({ profil, setProfil }) {
  const imc = profil.poids && profil.taille
    ? (parseFloat(profil.poids) / Math.pow(parseFloat(profil.taille) / 100, 2)).toFixed(1)
    : null;
  const bf = parseFloat(profil.bodyfat) || null;
  return (
    <div>
      <G2 style={{ marginBottom: 32 }}>
        <Card padding="lg" style={{ marginBottom: 0 }}>
          <Eyebrow style={{ marginBottom: 6 }}>Poids</Eyebrow>
          <div style={{ fontSize: 30, fontWeight: 700, color: C.accent, letterSpacing: -1.2, lineHeight: 1, fontFamily: FONT, ...NUM }}>
            {profil.poids || "—"}<span style={{ fontSize: 13, color: "rgba(242,244,247,0.35)", fontWeight: 400, letterSpacing: 0 }}> kg</span>
          </div>
        </Card>
        <Card padding="lg" style={{ marginBottom: 0 }}>
          <Eyebrow style={{ marginBottom: 6 }}>IMC</Eyebrow>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1, color: imc < 25 ? C.green : "#FFAB5D", fontFamily: FONT, ...NUM }}>
            {imc || "—"}
          </div>
          {imc && <div style={{ fontSize: 10, color: "rgba(242,244,247,0.30)", marginTop: 4, fontWeight: 500, fontFamily: FONT }}>
            {imc < 18.5 ? "Maigreur" : imc < 25 ? "Normal ✓" : imc < 30 ? "Surpoids" : "Obésité"}
          </div>}
        </Card>
      </G2>

      <Section title="Composition">
        {METRICS.map((m, i) => (
          <div key={m.key}>
            <EditableMetricRow label={m.label} icon={m.icon} color={m.color} unit={m.unit}
              value={profil[m.key]}
              onChange={val => setProfil({ ...profil, [m.key]: val })}
            />
            {i < METRICS.length - 1 && <Sep />}
          </div>
        ))}
      </Section>

      {bf && (
        <Card padding="md" style={{ marginTop: -20, marginBottom: 32 }}>
          {(() => {
            const cat = profil.sexe === "femme"
              ? (bf < 14 ? { l: "Athlète", c: C.green } : bf < 21 ? { l: "Forme", c: C.green } : bf < 25 ? { l: "Acceptable", c: "#FFAB5D" } : { l: "À améliorer", c: "#F87171" })
              : (bf < 6  ? { l: "Athlète", c: C.green } : bf < 14 ? { l: "Forme", c: C.green } : bf < 18 ? { l: "Acceptable", c: "#FFAB5D" } : { l: "À améliorer", c: "#F87171" });
            return (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "rgba(242,244,247,0.35)", fontFamily: FONT }}>Catégorie masse grasse</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: cat.c, fontFamily: FONT }}>{cat.l}</span>
              </div>
            );
          })()}
        </Card>
      )}
    </div>
  );
}

// ─── TAB MENSURATIONS ─────────────────────────────────────────────────────────
const MGROUPS = [
  { title: "Tronc",  items: [
    { key: "mChest", label: "Poitrine", icon: "📐" },
    { key: "mWaist", label: "Taille",   icon: "📐" },
    { key: "mHips",  label: "Hanches",  icon: "📐" },
  ]},
  { title: "Bras",   items: [
    { key: "mLeftArm",  label: "Bras gauche", icon: "💪" },
    { key: "mRightArm", label: "Bras droit",  icon: "💪" },
  ]},
  { title: "Jambes", items: [
    { key: "mLeftThigh",  label: "Cuisse gauche",  icon: "🦵" },
    { key: "mRightThigh", label: "Cuisse droite",  icon: "🦵" },
    { key: "mLeftCalf",   label: "Mollet gauche",  icon: "🦵" },
    { key: "mRightCalf",  label: "Mollet droit",   icon: "🦵" },
  ]},
];

function TabMensurations({ profil, setProfil }) {
  return (
    <div>
      <Card padding="lg" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <span style={{ fontSize: 40 }}>🧍</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3, color: C.text, fontFamily: FONT }}>Mensurations corporelles</div>
          <div style={{ fontSize: 12, color: "rgba(242,244,247,0.35)", lineHeight: 1.5, fontFamily: FONT }}>
            Appuie sur une ligne pour la modifier
          </div>
        </div>
      </Card>
      {MGROUPS.map(g => (
        <Section key={g.title} title={g.title}>
          {g.items.map((m, i) => (
            <div key={m.key}>
              <EditableMensRow label={m.label} icon={m.icon} fieldKey={m.key} profil={profil} setProfil={setProfil} />
              {i < g.items.length - 1 && <Sep />}
            </div>
          ))}
        </Section>
      ))}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Profile(props) {
  const { profil, setProfil, premium, setPremium, push, weightLog, imc, obj, calObj, pObj, lObj, gObj, cycles } = props;
  const [activeTab, setActiveTab] = useState("profil");

  return (
    <div style={{ padding: "0 20px 48px", fontFamily: FONT, minHeight: "100vh" }} className="anim">

      {/* HEADER */}
      <div style={{ paddingTop: 28, paddingBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.8, marginBottom: 8, color: C.text, fontFamily: FONT }}>
          {profil?.prenom || "Mon profil"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {premium
            ? <Pill color={C.accent} style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>✦ PREMIUM</Pill>
            : <span style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.bd}`, borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 600, color: "rgba(242,244,247,0.30)", letterSpacing: 0.5, fontFamily: FONT }}>GRATUIT</span>
          }
          {profil?.age && profil?.sexe && (
            <span style={{ fontSize: 12, color: "rgba(242,244,247,0.30)", fontFamily: FONT }}>
              {profil.age} ans · {profil.sexe === "homme" ? "Homme" : "Femme"}
            </span>
          )}
        </div>
      </div>

      {/* STATS PILLS */}
      {(profil?.poids || profil?.taille) && (
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {[
            { label: "Poids",  value: profil.poids,  unit: "kg", color: "#4FC3F7" },
            { label: "Taille", value: profil.taille, unit: "cm", color: "#81C784" },
            { label: "IMC",    value: imc,           unit: "",   color: "#FFB74D" },
          ].map((s, i) => (
            <Card key={i} padding="none" style={{ flex: 1, padding: "12px 8px", textAlign: "center", marginBottom: 0, borderRadius: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color, letterSpacing: -0.8, lineHeight: 1, fontFamily: FONT, ...NUM }}>
                {s.value || "—"}
                {s.unit && <span style={{ fontSize: 10, fontWeight: 500, color: "rgba(242,244,247,0.30)", letterSpacing: 0 }}> {s.unit}</span>}
              </div>
              <div style={{ fontSize: 10, color: "rgba(242,244,247,0.28)", marginTop: 4, fontWeight: 500, letterSpacing: 0.3, fontFamily: FONT }}>{s.label}</div>
            </Card>
          ))}
        </div>
      )}

      {/* TABS */}
      <div style={{
        display: "flex",
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${C.bd}`,
        borderRadius: 14, padding: 3, gap: 2, marginBottom: 28,
      }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            flex: 1,
            background: activeTab === tab.key ? C.s1 : "transparent",
            border: `1px solid ${activeTab === tab.key ? C.bd : "transparent"}`,
            borderRadius: 11, padding: "9px 4px",
            color: activeTab === tab.key ? C.text : "rgba(242,244,247,0.28)",
            fontSize: 12, fontWeight: activeTab === tab.key ? 600 : 500,
            cursor: "pointer", letterSpacing: 0.1, fontFamily: FONT,
            transition: "all 0.15s",
            boxShadow: activeTab === tab.key ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
          }}>{tab.label}</button>
        ))}
      </div>

      {activeTab === "profil" && (
        <TabProfil profil={profil} setProfil={setProfil}
          calObj={calObj} pObj={pObj} lObj={lObj} gObj={gObj}
          obj={obj} cycles={cycles} weightLog={weightLog || []}
        />
      )}
      {activeTab === "compo"  && <TabComposition  profil={profil} setProfil={setProfil} />}
      {activeTab === "mensurations" && <TabMensurations profil={profil} setProfil={setProfil} />}

      {/* PREMIUM */}
      {!premium && (
        <Card variant="accent" padding="lg" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, letterSpacing: -0.3, color: C.text, fontFamily: FONT }}>Passer en Premium</div>
          <div style={{ fontSize: 13, color: "rgba(242,244,247,0.40)", marginBottom: 18, lineHeight: 1.6, fontFamily: FONT }}>
            Analyse morphologique complète, planification 6 semaines et suivi nutritionnel avancé.
          </div>
          <button onClick={() => { setPremium?.(true); push?.("🎉", "Premium activé !", "Accès complet activé !"); }}
            style={{ width: "100%", padding: "14px", background: C.accent, border: "none", borderRadius: 14, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", letterSpacing: -0.1, boxShadow: "0 4px 16px rgba(59,130,246,0.30)", fontFamily: FONT }}>
            Activer Premium · 9,99€ / mois
          </button>
        </Card>
      )}

      {/* EXPORT */}
      <button onClick={() => {
        const txt = `${profil?.prenom || "Utilisateur"} — ${profil?.poids}kg, ${profil?.taille}cm\nObjectif : ${obj?.l || "—"}\nCalories : ${calObj || "—"} kcal/j`;
        if (navigator.share) navigator.share({ title: "Mon profil MorphoCoach", text: txt });
        else push?.("✅", "Copié !", "Profil copié dans le presse-papier.");
      }} style={{
        width: "100%", padding: "13px",
        background: "rgba(255,255,255,0.04)", border: `1px solid ${C.bd}`,
        borderRadius: 14, color: "rgba(242,244,247,0.50)", cursor: "pointer",
        fontSize: 13, fontWeight: 500, fontFamily: FONT,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        <span>📤</span> Partager mon profil
      </button>

    </div>
  );
}
