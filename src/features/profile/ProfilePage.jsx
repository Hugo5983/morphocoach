import { useState } from "react";
import { C, OBJ, ACTIVITE_FACTOR } from "../../data/constants.js";
import { Inp } from "../../components/ui/index.jsx";

// ─── UI HELPERS ──────────────────────────────────────────────────────────────

const SectionTitle = ({ children }) => (
  <div style={{
    fontSize: 10, fontWeight: 700, color: "rgba(242,244,247,0.30)",
    letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10,
  }}>{children}</div>
);

const Card = ({ children, style }) => (
  <div style={{
    background: C.s1, border: `1px solid ${C.bd}`,
    borderRadius: 18, padding: "4px 16px", marginBottom: 12, ...style,
  }}>{children}</div>
);

const Divider = () => (
  <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0 -16px" }} />
);

// Ligne cliquable : affiche la valeur, passe en input au tap
function EditableRow({ label, value, displayValue, type = "text", onChange, options }) {
  const [editing, setEditing] = useState(false);

  const handleBlur = () => setEditing(false);
  const handleKeyDown = (e) => { if (e.key === "Enter") setEditing(false); };

  return (
    <div
      onClick={() => !editing && setEditing(true)}
      style={{
        padding: "12px 0",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        cursor: editing ? "default" : "pointer",
        transition: "background 0.1s",
      }}
    >
      <span style={{ fontSize: 12, color: "rgba(242,244,247,0.40)", flexShrink: 0 }}>{label}</span>

      {editing ? (
        options
          // Select
          ? <select
              autoFocus
              value={value || ""}
              onChange={e => { onChange(e.target.value); setEditing(false); }}
              onBlur={handleBlur}
              style={{
                background: C.s2, border: `1px solid rgba(59,130,246,0.45)`,
                borderRadius: 8, color: C.text, fontSize: 13, padding: "5px 8px",
                outline: "none", boxShadow: "0 0 0 3px rgba(59,130,246,0.10)",
              }}
            >
              {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          // Input
          : <Inp
              autoFocus
              type={type}
              value={value || ""}
              onChange={e => onChange(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              style={{
                marginBottom: 0, maxWidth: 140, padding: "5px 10px", fontSize: 13,
                textAlign: "right", border: `1px solid rgba(59,130,246,0.45)`,
                boxShadow: "0 0 0 3px rgba(59,130,246,0.10)",
              }}
            />
      ) : (
        <span style={{
          fontSize: 13, fontWeight: 600, color: value ? C.text : "rgba(242,244,247,0.20)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {displayValue || value || "Appuyer pour modifier"}
          <span style={{ fontSize: 10, color: "rgba(242,244,247,0.15)" }}>✏️</span>
        </span>
      )}
    </div>
  );
}

function EditableMetricRow({ label, icon, color, value, unit, onChange }) {
  const [editing, setEditing] = useState(false);
  const max = { bodyfat: 40, muscleMass: 80, boneMass: 6, waterPct: 80, visceralFat: 20 };
  const barMax = max[label] || 100;
  const val = parseFloat(value) || null;
  const barW = val ? Math.min((val / barMax) * 100, 100) : 0;

  return (
    <div onClick={() => !editing && setEditing(true)} style={{ padding: "10px 0", cursor: editing ? "default" : "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15 }}>{icon}</span>
          <span style={{ fontSize: 12, color: C.mid }}>{label}</span>
        </div>
        {editing
          ? <Inp autoFocus type="number" placeholder="—"
              style={{ marginBottom: 0, maxWidth: 80, padding: "4px 8px", fontSize: 13, textAlign: "right", border: `1px solid rgba(59,130,246,0.45)`, boxShadow: "0 0 0 3px rgba(59,130,246,0.10)" }}
              value={value || ""}
              onChange={e => onChange(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={e => e.key === "Enter" && setEditing(false)}
            />
          : <span style={{ fontSize: 14, fontWeight: 700, color: val ? color : "rgba(242,244,247,0.15)", display: "flex", alignItems: "center", gap: 4 }}>
              {val ? `${val}${unit}` : "—"}
              <span style={{ fontSize: 10, color: "rgba(242,244,247,0.15)" }}>✏️</span>
            </span>}
      </div>
      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 4, height: 3, overflow: "hidden" }}>
        <div style={{ width: `${barW}%`, height: "100%", background: color, borderRadius: 4, boxShadow: `0 0 6px ${color}55`, transition: "width 0.3s" }} />
      </div>
    </div>
  );
}

function EditableMensurationRow({ label, icon, fieldKey, profil, setProfil }) {
  const [editing, setEditing] = useState(false);
  const value = profil[fieldKey] || "";

  return (
    <div onClick={() => !editing && setEditing(true)}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", cursor: editing ? "default" : "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontSize: 12, color: C.mid }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {editing
          ? <Inp autoFocus type="number" placeholder="—"
              style={{ marginBottom: 0, width: 70, padding: "4px 8px", fontSize: 13, textAlign: "right", border: `1px solid rgba(59,130,246,0.45)`, boxShadow: "0 0 0 3px rgba(59,130,246,0.10)" }}
              value={value}
              onChange={e => setProfil({ ...profil, [fieldKey]: e.target.value })}
              onBlur={() => setEditing(false)}
              onKeyDown={e => e.key === "Enter" && setEditing(false)}
            />
          : <span style={{ fontSize: 14, fontWeight: 700, color: value ? C.text : "rgba(242,244,247,0.15)", display: "flex", alignItems: "center", gap: 4 }}>
              {value || "—"}
              <span style={{ fontSize: 10, color: "rgba(242,244,247,0.15)" }}>✏️</span>
            </span>}
        <span style={{ fontSize: 10, color: "rgba(242,244,247,0.25)" }}>cm</span>
      </div>
    </div>
  );
}

// ─── TABS ────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "profil",       label: "Profil"  },
  { key: "compo",        label: "Compo."  },
  { key: "mensurations", label: "Mesures" },
];

const ACTIVITE_LABELS = {
  sedentaire: "Sédentaire",
  leger:      "Léger (1-3x/sem)",
  modere:     "Modéré (3-5x/sem)",
  actif:      "Très actif (6-7x/sem)",
};

// ─── TAB PROFIL ──────────────────────────────────────────────────────────────

function TabProfil({ profil, setProfil, calObj, pObj, lObj, gObj, obj, weightLog }) {
  const set = (key) => (val) => setProfil({ ...profil, [key]: val });
  const last5 = weightLog?.slice(-5) || [];
  const maxW  = last5.length ? Math.max(...last5.map(d => parseFloat(d.poids))) : 0;
  const minW  = last5.length ? Math.min(...last5.map(d => parseFloat(d.poids))) : 0;

  return (
    <div>
      <SectionTitle>Informations</SectionTitle>
      <Card>
        <EditableRow label="Prénom" value={profil.prenom} onChange={set("prenom")} />
        <Divider />
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1 }}>
            <EditableRow label="Âge" value={profil.age} displayValue={profil.age ? `${profil.age} ans` : null} type="number" onChange={set("age")} />
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.05)", margin: "8px 0" }} />
          <div style={{ flex: 1, paddingLeft: 12 }}>
            <EditableRow
              label="Genre" value={profil.sexe}
              displayValue={profil.sexe === "homme" ? "Homme" : profil.sexe === "femme" ? "Femme" : null}
              onChange={set("sexe")}
              options={[{ value: "", label: "—" }, { value: "homme", label: "Homme" }, { value: "femme", label: "Femme" }]}
            />
          </div>
        </div>
        <Divider />
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1 }}>
            <EditableRow label="Poids" value={profil.poids} displayValue={profil.poids ? `${profil.poids} kg` : null} type="number" onChange={set("poids")} />
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.05)", margin: "8px 0" }} />
          <div style={{ flex: 1, paddingLeft: 12 }}>
            <EditableRow label="Taille" value={profil.taille} displayValue={profil.taille ? `${profil.taille} cm` : null} type="number" onChange={set("taille")} />
          </div>
        </div>
      </Card>

      {last5.length >= 2 && (
        <>
          <SectionTitle>Évolution du poids</SectionTitle>
          <Card style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70 }}>
              {last5.map((d, i) => {
                const h = ((parseFloat(d.poids) - minW) / (maxW - minW + 0.1)) * 50 + 16;
                const isLast = i === last5.length - 1;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 9, color: C.accent, fontWeight: 700 }}>{d.poids}</span>
                    <div style={{ width: "100%", height: h, borderRadius: "4px 4px 2px 2px", background: isLast ? `linear-gradient(180deg, ${C.accent}, ${C.accentDk})` : "rgba(59,130,246,0.18)" }} />
                    <span style={{ fontSize: 9, color: "rgba(242,244,247,0.25)" }}>
                      {d.date ? new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(242,244,247,0.30)" }}>
              <span>Dernière pesée : {last5.at(-1)?.date ? new Date(last5.at(-1).date).toLocaleDateString("fr-FR") : "aujourd'hui"}</span>
              <span style={{ color: (parseFloat(last5.at(-1).poids) - parseFloat(last5[0].poids)) >= 0 ? C.green : C.red, fontWeight: 700 }}>
                {(parseFloat(last5.at(-1).poids) - parseFloat(last5[0].poids)) >= 0 ? "+" : ""}
                {(parseFloat(last5.at(-1).poids) - parseFloat(last5[0].poids)).toFixed(1)} kg
              </span>
            </div>
          </Card>
        </>
      )}

      <SectionTitle>Objectif & Activité</SectionTitle>
      <Card>
        <EditableRow
          label="Objectif" value={profil.objectif}
          displayValue={obj?.icon ? `${obj.icon} ${obj.l}` : null}
          onChange={set("objectif")}
          options={Object.entries(OBJ).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.l}` }))}
        />
        <Divider />
        <EditableRow
          label="Activité" value={profil.activite}
          displayValue={ACTIVITE_LABELS[profil.activite] || null}
          onChange={set("activite")}
          options={Object.entries(ACTIVITE_FACTOR).map(([k]) => ({ value: k, label: ACTIVITE_LABELS[k] || k }))}
        />
        {calObj && (
          <>
            <Divider />
            <div style={{ padding: "12px 0", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "rgba(242,244,247,0.40)" }}>Besoins caloriques</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.accent }}>{calObj.toLocaleString()} kcal/jour</span>
            </div>
          </>
        )}
      </Card>

      {calObj && (
        <>
          <SectionTitle>Macros journaliers</SectionTitle>
          <Card style={{ padding: "14px 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { l: "Protéines", v: pObj, color: "#FF7A6B", bg: "rgba(239,68,68,0.08)"  },
                { l: "Glucides",  v: gObj, color: "#FFAB5D", bg: "rgba(249,115,22,0.08)" },
                { l: "Lipides",   v: lObj, color: "#34D399", bg: "rgba(34,197,94,0.08)"  },
              ].map(m => (
                <div key={m.l} style={{ textAlign: "center", padding: "10px 6px", background: m.bg, borderRadius: 12, border: `1px solid ${m.color}25` }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: m.color, lineHeight: 1 }}>
                    {m.v}<span style={{ fontSize: 9 }}>g</span>
                  </div>
                  <div style={{ fontSize: 9, color: C.mid, marginTop: 3 }}>{m.l}</div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// ─── TAB COMPOSITION ─────────────────────────────────────────────────────────

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
      <SectionTitle>Bilan général</SectionTitle>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, background: C.s1, border: `1px solid ${C.bd}`, borderRadius: 16, padding: "14px" }}>
          <div style={{ fontSize: 10, color: "rgba(242,244,247,0.30)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Poids actuel</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.accent, lineHeight: 1 }}>
            {profil.poids || "—"}<span style={{ fontSize: 12, color: C.mid, fontWeight: 400 }}>kg</span>
          </div>
        </div>
        <div style={{ flex: 1, background: C.s1, border: `1px solid ${C.bd}`, borderRadius: 16, padding: "14px" }}>
          <div style={{ fontSize: 10, color: "rgba(242,244,247,0.30)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>IMC</div>
          <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, color: imc < 25 ? C.green : "#FFAB5D" }}>
            {imc || "—"}
          </div>
          {imc && <div style={{ fontSize: 9, color: C.mid, marginTop: 2 }}>
            {imc < 18.5 ? "Maigreur" : imc < 25 ? "Normal ✓" : imc < 30 ? "Surpoids" : "Obésité"}
          </div>}
        </div>
      </div>

      <SectionTitle>Composition corporelle</SectionTitle>
      <Card>
        {METRICS.map((m, i) => (
          <div key={m.key}>
            <EditableMetricRow
              label={m.label} icon={m.icon} color={m.color} unit={m.unit}
              value={profil[m.key]}
              onChange={val => setProfil({ ...profil, [m.key]: val })}
            />
            {i < METRICS.length - 1 && <Divider />}
          </div>
        ))}
      </Card>

      {bf && (
        <Card style={{ padding: "12px 14px" }}>
          {(() => {
            const cat = profil.sexe === "femme"
              ? (bf < 14 ? { l: "Athlète ⚡", c: C.green } : bf < 21 ? { l: "Forme ✅", c: C.green } : bf < 25 ? { l: "Acceptable", c: "#FFAB5D" } : { l: "À améliorer", c: "#F87171" })
              : (bf < 6  ? { l: "Athlète ⚡", c: C.green } : bf < 14 ? { l: "Forme ✅", c: C.green } : bf < 18 ? { l: "Acceptable", c: "#FFAB5D" } : { l: "À améliorer", c: "#F87171" });
            return (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: C.mid }}>Catégorie masse grasse</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: cat.c }}>{cat.l}</span>
              </div>
            );
          })()}
        </Card>
      )}
    </div>
  );
}

// ─── TAB MENSURATIONS ────────────────────────────────────────────────────────

const MEASUREMENTS = [
  { key: "mChest",      label: "Tour de poitrine", icon: "📐" },
  { key: "mWaist",      label: "Tour de taille",   icon: "📐" },
  { key: "mHips",       label: "Tour de hanches",  icon: "📐" },
  { key: "mLeftArm",    label: "Bras gauche",      icon: "💪" },
  { key: "mRightArm",   label: "Bras droit",       icon: "💪" },
  { key: "mLeftThigh",  label: "Cuisse gauche",    icon: "🦵" },
  { key: "mRightThigh", label: "Cuisse droite",    icon: "🦵" },
  { key: "mLeftCalf",   label: "Mollet gauche",    icon: "🦵" },
  { key: "mRightCalf",  label: "Mollet droit",     icon: "🦵" },
];

function TabMensurations({ profil, setProfil }) {
  return (
    <div>
      <SectionTitle>Mes mensurations</SectionTitle>
      <div style={{ background: "rgba(255,255,255,0.02)", border: `1px dashed ${C.bd}`, borderRadius: 16, padding: 14, marginBottom: 12, textAlign: "center" }}>
        <div style={{ fontSize: 36 }}>🧍</div>
        <div style={{ fontSize: 11, color: "rgba(242,244,247,0.25)", marginTop: 4 }}>
          Appuie sur une ligne pour la modifier
        </div>
      </div>
      <Card>
        {MEASUREMENTS.map((m, i) => (
          <div key={m.key}>
            <EditableMensurationRow
              label={m.label} icon={m.icon} fieldKey={m.key}
              profil={profil} setProfil={setProfil}
            />
            {i < MEASUREMENTS.length - 1 && <Divider />}
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function Profile(props) {
  const {
    profil, setProfil, premium, setPremium, push,
    weightLog, imc, obj, calObj, pObj, lObj, gObj, cycles,
  } = props;

  const [activeTab, setActiveTab] = useState("profil");

  return (
    <div style={{ padding: "0 16px 32px", fontFamily: "'DM Sans', -apple-system, sans-serif" }} className="anim">

      {/* HEADER */}
      <div style={{ padding: "26px 0 20px" }}>
        <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>Mon Profil</span>
      </div>

      {/* AVATAR */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%", margin: "0 auto 12px",
          background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.20)",
          boxShadow: "0 0 0 3px rgba(59,130,246,0.08), 0 0 24px rgba(59,130,246,0.10)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="rgba(59,130,246,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4, marginBottom: 5 }}>
          {profil?.prenom || "Mon profil"}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {premium
            ? <span style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: C.accent }}>✦ PREMIUM</span>
            : <span style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.bd}`, borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 600, color: "rgba(242,244,247,0.35)" }}>Compte gratuit</span>
          }
          {profil?.age && profil?.sexe && (
            <span style={{ fontSize: 11, color: "rgba(242,244,247,0.35)" }}>
              · {profil.age} ans · {profil.sexe === "homme" ? "Homme" : "Femme"}
            </span>
          )}
        </div>
      </div>

      {/* QUICK STATS */}
      {(profil?.poids || profil?.taille) && (
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Poids",  value: profil.poids,  unit: "kg", icon: "⚖️", color: "#4FC3F7" },
            { label: "Taille", value: profil.taille, unit: "cm", icon: "📏", color: "#81C784" },
            { label: "IMC",    value: imc,           unit: "",   icon: "📊", color: "#FFB74D" },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: C.s1, border: `1px solid ${C.bd}`, borderRadius: 14, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 16, marginBottom: 3 }}>{s.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                {s.value || "—"}<span style={{ fontSize: 10, fontWeight: 400, color: "rgba(242,244,247,0.30)" }}>{s.unit}</span>
              </div>
              <div style={{ fontSize: 9, color: "rgba(242,244,247,0.25)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* TABS */}
      <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.bd}`, borderRadius: 12, padding: 3, gap: 2, marginBottom: 20 }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            flex: 1,
            background: activeTab === tab.key ? "rgba(59,130,246,0.15)" : "transparent",
            border: `1px solid ${activeTab === tab.key ? "rgba(59,130,246,0.30)" : "transparent"}`,
            borderRadius: 9, padding: "8px 4px",
            color: activeTab === tab.key ? C.accent : "rgba(242,244,247,0.30)",
            fontSize: 11, fontWeight: 700, cursor: "pointer",
            letterSpacing: 0.3, textTransform: "uppercase", transition: "all 0.15s",
          }}>{tab.label}</button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === "profil" && (
        <TabProfil
          profil={profil} setProfil={setProfil}
          calObj={calObj} pObj={pObj} lObj={lObj} gObj={gObj}
          obj={obj} cycles={cycles} weightLog={weightLog || []}
        />
      )}
      {activeTab === "compo" && (
        <TabComposition profil={profil} setProfil={setProfil} />
      )}
      {activeTab === "mensurations" && (
        <TabMensurations profil={profil} setProfil={setProfil} />
      )}

      {/* PREMIUM UPSELL */}
      {!premium && (
        <div style={{ marginTop: 8, background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 18, padding: "16px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Passer en Premium</div>
          <div style={{ fontSize: 12, color: "rgba(242,244,247,0.45)", marginBottom: 14, lineHeight: 1.5 }}>
            Accède à l'analyse morphologique complète, la planification 6 semaines et le suivi nutritionnel avancé.
          </div>
          <button onClick={() => { setPremium?.(true); push?.("🎉", "Premium activé !", "Accès complet activé !"); }}
            style={{ width: "100%", padding: "13px 16px", background: C.accent, border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            Activer Premium · 9,99€/mois
          </button>
        </div>
      )}

      {/* EXPORT */}
      <div style={{ marginTop: 12 }}>
        <SectionTitle>Export</SectionTitle>
        <Card style={{ padding: "14px 16px" }}>
          <button onClick={() => {
            const txt = `${profil?.prenom || "Utilisateur"} — ${profil?.poids}kg, ${profil?.taille}cm\nObjectif : ${obj?.l || "—"}\nCalories : ${calObj || "—"} kcal/j`;
            if (navigator.share) navigator.share({ title: "Mon profil MorphoCoach", text: txt });
            else push?.("✅", "Copié !", "Profil copié dans le presse-papier.");
          }} style={{
            width: "100%", padding: "10px 14px",
            background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.20)",
            borderRadius: 10, color: C.accent, cursor: "pointer",
            fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            📤 Partager mon profil
          </button>
        </Card>
      </div>

    </div>
  );
}
