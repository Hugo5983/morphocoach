import { useState } from "react";
import { C, OBJ, ACTIVITE_FACTOR } from "../../data/constants.js";
import { Inp, Btn } from "../../components/ui/index.jsx";

// ─── HELPERS ────────────────────────────────────────────────────────────────
const pct = (v, t) => Math.min((v / t) * 100, 100);

const SectionTitle = ({ children }) => (
  <div style={{
    fontSize: 10, fontWeight: 700, color: "rgba(242,244,247,0.30)",
    letterSpacing: "1.5px", textTransform: "uppercase",
    marginBottom: 10,
  }}>{children}</div>
);

const Card = ({ children, style }) => (
  <div style={{
    background: C.s1,
    border: `1px solid ${C.bd}`,
    borderRadius: 18,
    padding: "4px 16px",
    marginBottom: 12,
    ...style,
  }}>{children}</div>
);

const Divider = () => (
  <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0 -16px" }} />
);

const FieldRow = ({ label, children }) => (
  <div style={{
    padding: "12px 0",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  }}>
    <span style={{ fontSize: 12, color: "rgba(242,244,247,0.40)" }}>{label}</span>
    {children}
  </div>
);

const FieldVal = ({ children, highlight }) => (
  <span style={{
    fontSize: 13, fontWeight: 600,
    color: highlight ? C.accent : C.text,
  }}>{children}</span>
);

// ─── TABS ───────────────────────────────────────────────────────────────────
const TABS = [
  { key: "profil",        label: "Profil" },
  { key: "compo",         label: "Compo." },
  { key: "mensurations",  label: "Mesures" },
];

// ─── TAB PROFIL ─────────────────────────────────────────────────────────────
function TabProfil({ profil, setProfil, editMode, calObj, pObj, lObj, gObj, obj, cycles, weightLog, ACTIVITE_FACTOR, OBJ }) {
  const maxW = weightLog?.length ? Math.max(...weightLog.map(d => parseFloat(d.poids))) : 0;
  const minW = weightLog?.length ? Math.min(...weightLog.map(d => parseFloat(d.poids))) : 0;
  const last5 = weightLog?.slice(-5) || [];

  const activiteLabels = {
    sedentaire: "Sédentaire",
    leger: "Léger (1-3x/sem)",
    modere: "Modéré (3-5x/sem)",
    actif: "Très actif (6-7x/sem)",
  };

  return (
    <div>
      {/* Infos personnelles */}
      <SectionTitle>Informations</SectionTitle>
      <Card>
        <FieldRow label="Prénom">
          {editMode
            ? <Inp style={{ marginBottom: 0, maxWidth: 160, padding: "6px 10px", fontSize: 13 }}
                value={profil.prenom || ""} onChange={e => setProfil({ ...profil, prenom: e.target.value })} />
            : <FieldVal>{profil.prenom || "—"}</FieldVal>}
        </FieldRow>
        <Divider />
        <div style={{ display: "flex", gap: 0 }}>
          <div style={{ flex: 1 }}>
            <FieldRow label="Âge">
              {editMode
                ? <Inp type="number" style={{ marginBottom: 0, maxWidth: 80, padding: "6px 10px", fontSize: 13 }}
                    value={profil.age || ""} onChange={e => setProfil({ ...profil, age: e.target.value })} />
                : <FieldVal>{profil.age ? `${profil.age} ans` : "—"}</FieldVal>}
            </FieldRow>
          </div>
          <div style={{ flex: 1 }}>
            <FieldRow label="Genre">
              {editMode
                ? <select style={{ background: C.s2, border: `1px solid ${C.bd}`, borderRadius: 8, color: C.text, fontSize: 13, padding: "6px 8px" }}
                    value={profil.sexe || ""} onChange={e => setProfil({ ...profil, sexe: e.target.value })}>
                    <option value="">—</option>
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                  </select>
                : <FieldVal>{profil.sexe === "homme" ? "Homme" : profil.sexe === "femme" ? "Femme" : "—"}</FieldVal>}
            </FieldRow>
          </div>
        </div>
        <Divider />
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1 }}>
            <FieldRow label="Poids">
              {editMode
                ? <Inp type="number" style={{ marginBottom: 0, maxWidth: 90, padding: "6px 10px", fontSize: 13 }}
                    value={profil.poids || ""} onChange={e => setProfil({ ...profil, poids: e.target.value })} />
                : <FieldVal>{profil.poids ? `${profil.poids} kg` : "—"}</FieldVal>}
            </FieldRow>
          </div>
          <div style={{ flex: 1 }}>
            <FieldRow label="Taille">
              {editMode
                ? <Inp type="number" style={{ marginBottom: 0, maxWidth: 90, padding: "6px 10px", fontSize: 13 }}
                    value={profil.taille || ""} onChange={e => setProfil({ ...profil, taille: e.target.value })} />
                : <FieldVal>{profil.taille ? `${profil.taille} cm` : "—"}</FieldVal>}
            </FieldRow>
          </div>
        </div>
      </Card>

      {/* Évolution du poids */}
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
                    <div style={{
                      width: "100%", height: h, borderRadius: "4px 4px 2px 2px",
                      background: isLast
                        ? `linear-gradient(180deg, ${C.accent}, ${C.accentDk || C.blueDk})`
                        : `rgba(59,130,246,0.18)`,
                    }} />
                    <span style={{ fontSize: 9, color: "rgba(242,244,247,0.25)" }}>
                      {d.date ? new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(242,244,247,0.30)" }}>
              <span>Dernière pesée : {last5.at(-1)?.date ? new Date(last5.at(-1).date).toLocaleDateString("fr-FR") : "aujourd'hui"}</span>
              {last5.length >= 2 && (() => {
                const delta = (parseFloat(last5.at(-1).poids) - parseFloat(last5[0].poids)).toFixed(1);
                return <span style={{ color: delta >= 0 ? C.green : C.red, fontWeight: 700 }}>{delta >= 0 ? "+" : ""}{delta} kg</span>;
              })()}
            </div>
          </Card>
        </>
      )}

      {/* Objectif */}
      <SectionTitle>Objectif & Activité</SectionTitle>
      <Card>
        <FieldRow label="Objectif">
          {editMode
            ? <select style={{ background: C.s2, border: `1px solid ${C.bd}`, borderRadius: 8, color: C.text, fontSize: 13, padding: "6px 8px" }}
                value={profil.objectif || ""} onChange={e => setProfil({ ...profil, objectif: e.target.value })}>
                {Object.entries(OBJ).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.l}</option>)}
              </select>
            : <FieldVal>{obj?.icon} {obj?.l || "—"}</FieldVal>}
        </FieldRow>
        <Divider />
        <FieldRow label="Niveau d'activité">
          {editMode
            ? <select style={{ background: C.s2, border: `1px solid ${C.bd}`, borderRadius: 8, color: C.text, fontSize: 13, padding: "6px 8px" }}
                value={profil.activite || ""} onChange={e => setProfil({ ...profil, activite: e.target.value })}>
                {Object.entries(ACTIVITE_FACTOR).map(([k]) => <option key={k} value={k}>{activiteLabels[k] || k}</option>)}
              </select>
            : <FieldVal>{activiteLabels[profil.activite] || "—"}</FieldVal>}
        </FieldRow>
        {calObj && <><Divider /><FieldRow label="Besoins caloriques"><FieldVal highlight>{calObj.toLocaleString()} kcal/jour</FieldVal></FieldRow></>}
      </Card>

      {/* Macros */}
      {calObj && (
        <>
          <SectionTitle>Macros journaliers</SectionTitle>
          <Card style={{ padding: "14px 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { l: "Protéines", v: pObj, unit: "g", color: "#FF7A6B", bg: "rgba(239,68,68,0.08)" },
                { l: "Glucides",  v: gObj, unit: "g", color: "#FFAB5D", bg: "rgba(249,115,22,0.08)" },
                { l: "Lipides",   v: lObj, unit: "g", color: "#34D399", bg: "rgba(34,197,94,0.08)" },
              ].map(m => (
                <div key={m.l} style={{
                  textAlign: "center", padding: "10px 6px",
                  background: m.bg, borderRadius: 12,
                  border: `1px solid ${m.color}25`,
                }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: m.color, lineHeight: 1 }}>
                    {m.v}<span style={{ fontSize: 9 }}>{m.unit}</span>
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

// ─── TAB COMPOSITION ────────────────────────────────────────────────────────
function TabComposition({ profil, setProfil, editMode }) {
  const bf = parseFloat(profil.bodyfat) || null;
  const imc = profil.poids && profil.taille
    ? (parseFloat(profil.poids) / Math.pow(parseFloat(profil.taille) / 100, 2)).toFixed(1)
    : null;

  const METRICS = [
    { key: "bodyfat",      label: "Masse grasse",     unit: "%",    icon: "🔥", color: "#FF7043", max: 40 },
    { key: "muscleMass",   label: "Masse musculaire",  unit: "kg",   icon: "💪", color: "#42A5F5", max: 80 },
    { key: "boneMass",     label: "Masse osseuse",     unit: "kg",   icon: "🦴", color: "#AB47BC", max: 6  },
    { key: "waterPct",     label: "Eau corporelle",    unit: "%",    icon: "💧", color: "#26C6DA", max: 80 },
    { key: "visceralFat",  label: "Graisse viscérale", unit: "/20",  icon: "🫀", color: "#EF5350", max: 20 },
  ];

  return (
    <div>
      {/* IMC + Poids */}
      <SectionTitle>Bilan général</SectionTitle>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{
          flex: 1, background: C.s1, border: `1px solid ${C.bd}`,
          borderRadius: 16, padding: "14px",
        }}>
          <div style={{ fontSize: 10, color: "rgba(242,244,247,0.30)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Poids actuel</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.accent, lineHeight: 1 }}>
            {profil.poids || "—"}<span style={{ fontSize: 12, color: C.mid, fontWeight: 400 }}>kg</span>
          </div>
        </div>
        <div style={{
          flex: 1, background: C.s1, border: `1px solid ${C.bd}`,
          borderRadius: 16, padding: "14px",
        }}>
          <div style={{ fontSize: 10, color: "rgba(242,244,247,0.30)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>IMC</div>
          <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, color: imc < 25 ? C.green : "#FFAB5D" }}>
            {imc || "—"}
          </div>
          {imc && <div style={{ fontSize: 9, color: C.mid, marginTop: 2 }}>
            {imc < 18.5 ? "Maigreur" : imc < 25 ? "Normal ✓" : imc < 30 ? "Surpoids" : "Obésité"}
          </div>}
        </div>
      </div>

      {/* Métriques balance */}
      <SectionTitle>Composition corporelle</SectionTitle>
      <Card>
        {METRICS.map((m, i) => {
          const val = parseFloat(profil[m.key]) || null;
          const p = val ? Math.min((val / m.max) * 100, 100) : 0;
          return (
            <div key={m.key}>
              <div style={{ padding: "10px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15 }}>{m.icon}</span>
                    <span style={{ fontSize: 12, color: C.mid }}>{m.label}</span>
                  </div>
                  {editMode
                    ? <Inp type="number" placeholder="—"
                        style={{ marginBottom: 0, maxWidth: 80, padding: "4px 8px", fontSize: 13, textAlign: "right" }}
                        value={profil[m.key] || ""}
                        onChange={e => setProfil({ ...profil, [m.key]: e.target.value })} />
                    : <span style={{ fontSize: 15, fontWeight: 700, color: val ? m.color : C.dim }}>
                        {val ? `${val}${m.unit}` : "—"}
                      </span>}
                </div>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 4, height: 3, overflow: "hidden" }}>
                  <div style={{ width: `${p}%`, height: "100%", background: m.color, borderRadius: 4, boxShadow: `0 0 6px ${m.color}55` }} />
                </div>
              </div>
              {i < METRICS.length - 1 && <Divider />}
            </div>
          );
        })}
      </Card>

      {/* Conseil masse grasse */}
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

// ─── TAB MENSURATIONS ───────────────────────────────────────────────────────
const MEASUREMENTS = [
  { key: "mChest",       label: "Tour de poitrine",  icon: "📐" },
  { key: "mWaist",       label: "Tour de taille",    icon: "📐" },
  { key: "mHips",        label: "Tour de hanches",   icon: "📐" },
  { key: "mLeftArm",     label: "Bras gauche",       icon: "💪" },
  { key: "mRightArm",    label: "Bras droit",        icon: "💪" },
  { key: "mLeftThigh",   label: "Cuisse gauche",     icon: "🦵" },
  { key: "mRightThigh",  label: "Cuisse droite",     icon: "🦵" },
  { key: "mLeftCalf",    label: "Mollet gauche",     icon: "🦵" },
  { key: "mRightCalf",   label: "Mollet droit",      icon: "🦵" },
];

function TabMensurations({ profil, setProfil, editMode }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <SectionTitle>Mes mensurations</SectionTitle>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px dashed ${C.bd}`,
        borderRadius: 16, padding: 14,
        marginBottom: 12,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 36 }}>🧍</div>
        <div style={{ fontSize: 11, color: "rgba(242,244,247,0.25)", marginTop: 4 }}>
          {editMode ? "Active le mode édition pour remplir tes mesures" : "Clique sur Éditer pour mettre à jour"}
        </div>
      </div>

      <Card>
        {MEASUREMENTS.map((m, i) => (
          <div key={m.key}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14 }}>{m.icon}</span>
                <span style={{ fontSize: 12, color: C.mid }}>{m.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {editMode
                  ? <Inp type="number" placeholder="—"
                      style={{ marginBottom: 0, width: 70, padding: "4px 8px", fontSize: 13, textAlign: "right" }}
                      value={profil[m.key] || ""}
                      onChange={e => setProfil({ ...profil, [m.key]: e.target.value })} />
                  : <span style={{ fontSize: 14, fontWeight: 700, color: profil[m.key] ? C.text : C.dim }}>
                      {profil[m.key] || "—"}
                    </span>}
                <span style={{ fontSize: 10, color: "rgba(242,244,247,0.25)" }}>cm</span>
              </div>
            </div>
            {i < MEASUREMENTS.length - 1 && <Divider />}
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── MAIN PROFILE PAGE ──────────────────────────────────────────────────────
export default function Profile(props) {
  const {
    profil, setProfil, premium, setPremium, push,
    weightLog, imc, obj, calObj, pObj, lObj, gObj,
    cycles, C: propsC, OBJ: propsOBJ, ACTIVITE_FACTOR: propsAF,
  } = props;

  const [activeTab, setActiveTab] = useState("profil");
  const [editMode, setEditMode]   = useState(false);

  const usedOBJ = propsOBJ || OBJ;
  const usedAF  = propsAF  || ACTIVITE_FACTOR;

  const handleSave = () => {
    setEditMode(false);
    push?.("✅", "Profil mis à jour", "Tes informations ont été sauvegardées.");
  };

  return (
    <div style={{ padding: "0 16px 32px", fontFamily: "'DM Sans', -apple-system, sans-serif" }} className="anim">

      {/* ── HEADER ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "26px 0 20px",
      }}>
        <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>Mon Profil</span>
        <button
          onClick={editMode ? handleSave : () => setEditMode(true)}
          style={{
            background: editMode ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${editMode ? "rgba(59,130,246,0.35)" : C.bd}`,
            borderRadius: 10, padding: "7px 14px",
            color: editMode ? C.accent : "rgba(242,244,247,0.50)",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}
        >
          {editMode ? "Sauvegarder" : "Éditer"}
        </button>
      </div>

      {/* ── AVATAR + NOM ── */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%", margin: "0 auto 12px",
          background: "rgba(59,130,246,0.08)",
          border: `1px solid rgba(59,130,246,0.20)`,
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
            ? <span style={{
                background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: C.accent,
              }}>✦ PREMIUM</span>
            : <span style={{
                background: "rgba(255,255,255,0.04)", border: `1px solid ${C.bd}`,
                borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 600, color: "rgba(242,244,247,0.35)",
              }}>Compte gratuit</span>
          }
          {profil?.age && profil?.sexe && (
            <span style={{ fontSize: 11, color: "rgba(242,244,247,0.35)" }}>
              · {profil.age} ans · {profil.sexe === "homme" ? "Homme" : "Femme"}
            </span>
          )}
        </div>
      </div>

      {/* ── QUICK STATS ── */}
      {(profil?.poids || profil?.taille) && (
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Poids",  value: profil.poids, unit: "kg", color: "#4FC3F7" },
            { label: "Taille", value: profil.taille, unit: "cm", color: "#81C784" },
            { label: "IMC",    value: imc, unit: "",             color: "#FFB74D" },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, background: C.s1, border: `1px solid ${C.bd}`,
              borderRadius: 14, padding: "10px 8px", textAlign: "center",
            }}>
              <div style={{ fontSize: 16, marginBottom: 3 }}>
                {i === 0 ? "⚖️" : i === 1 ? "📏" : "📊"}
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                {s.value || "—"}
                <span style={{ fontSize: 10, fontWeight: 400, color: "rgba(242,244,247,0.30)" }}>{s.unit}</span>
              </div>
              <div style={{ fontSize: 9, color: "rgba(242,244,247,0.25)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── TABS ── */}
      <div style={{
        display: "flex", background: "rgba(255,255,255,0.03)",
        border: `1px solid ${C.bd}`, borderRadius: 12, padding: 3, gap: 2, marginBottom: 20,
      }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            flex: 1, background: activeTab === tab.key ? "rgba(59,130,246,0.15)" : "transparent",
            border: `1px solid ${activeTab === tab.key ? "rgba(59,130,246,0.30)" : "transparent"}`,
            borderRadius: 9, padding: "8px 4px",
            color: activeTab === tab.key ? C.accent : "rgba(242,244,247,0.30)",
            fontSize: 11, fontWeight: 700, cursor: "pointer",
            letterSpacing: 0.3, textTransform: "uppercase",
            transition: "all 0.15s",
          }}>{tab.label}</button>
        ))}
      </div>

      {/* ── CONTENU TABS ── */}
      {activeTab === "profil" && (
        <TabProfil
          profil={profil} setProfil={setProfil}
          editMode={editMode} calObj={calObj}
          pObj={pObj} lObj={lObj} gObj={gObj}
          obj={obj} cycles={cycles}
          weightLog={weightLog || []}
          ACTIVITE_FACTOR={usedAF} OBJ={usedOBJ}
        />
      )}
      {activeTab === "compo" && (
        <TabComposition profil={profil} setProfil={setProfil} editMode={editMode} />
      )}
      {activeTab === "mensurations" && (
        <TabMensurations profil={profil} setProfil={setProfil} editMode={editMode} />
      )}

      {/* ── SECTION PREMIUM (si gratuit) ── */}
      {!premium && (
        <div style={{
          marginTop: 8,
          background: "rgba(59,130,246,0.05)",
          border: `1px solid rgba(59,130,246,0.15)`,
          borderRadius: 18, padding: "16px",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Passer en Premium</div>
          <div style={{ fontSize: 12, color: "rgba(242,244,247,0.45)", marginBottom: 14, lineHeight: 1.5 }}>
            Accède à l'analyse morphologique complète, la planification 6 semaines et le suivi nutritionnel avancé.
          </div>
          <Btn onClick={() => { setPremium?.(true); push?.("🎉", "Premium activé !", "Accès complet activé !"); }}>
            Activer Premium · 9,99€/mois
          </Btn>
        </div>
      )}

      {/* ── EXPORT ── */}
      <div style={{ marginTop: 12 }}>
        <SectionTitle>Export</SectionTitle>
        <Card style={{ padding: "14px 16px" }}>
          <button onClick={() => {
            if (navigator.share) {
              navigator.share({ title: "Mon profil MorphoCoach", text: `${profil?.prenom || "Utilisateur"} — ${profil?.poids}kg, ${profil?.taille}cm\nObjectif : ${obj?.l || "—"}\nCalories : ${calObj || "—"} kcal/j` });
            } else {
              push?.("✅", "Copié !", "Profil copié dans le presse-papier.");
            }
          }} style={{
            width: "100%", padding: "10px 14px",
            background: "rgba(59,130,246,0.08)", border: `1px solid rgba(59,130,246,0.20)`,
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
