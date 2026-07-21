import { useState } from"react";
import { ID } from"../../components/ui/Icon.jsx";
import useScrollTop from"../../hooks/useScrollTop.js";
import { ACTIVITE_FACTOR, C, DARK, FONT, NUM, OBJ, SERIF } from"../../data/constants.js";
import {
  I, ic, Glass, StatCard, Tabs, SectionLabel, Row, EditRow, AddRow,
  MacroRing, CompoBar, ACTIVITE_LABELS, WeightChart,
} from"./components/ProfileKit.jsx";

export default function Profile(props) {
  useScrollTop();
  const { profil, setProfil, premium, premiumNutrition, setPremium, push,
    weightLog, setWeightLog, imc, obj, calObj, pObj, lObj, gObj } = props;

  const [activeTab, setActiveTab] = useState("Profil");
  const set = key => val => setProfil({ ...profil, [key]: val });

  // Enregistre une pesée datée (1 entrée / jour, la dernière valeur du jour gagne)
  const recordWeight = (val) => {
    set("poids")(val);
    const kg = parseFloat(val);
    if (!kg || !setWeightLog) return;
    const today = new Date().toLocaleDateString("fr-FR");
    setWeightLog(prev => {
      const arr = Array.isArray(prev) ? [...prev] : [];
      const i = arr.findIndex(e => e.date === today);
      if (i >= 0) arr[i] = { date: today, poids: kg };
      else arr.push({ date: today, poids: kg });
      return arr;
    });
  };

  // IMC catégorie
  const imcVal = parseFloat(imc) || 0;
  const imcCat = imcVal < 18.5 ?"Maigreur" : imcVal < 25 ?"Normal" : imcVal < 30 ?"Surpoids" :"Obésité";
  const imcColor = imcVal < 18.5 ? DARK.accent : imcVal < 25 ?"#12B76A" : imcVal < 30 ?"#3C5BFF" :"#E5484D";
  const imcPct = Math.min(100, Math.max(0, ((imcVal - 15) / (40 - 15)) * 100));

  // Macros cibles
  const macros = [
    { label:"Protéines", value: pObj || 0, max: Math.round((pObj || 0) * 1.2), color:"#3C5BFF" },
    { label:"Glucides",  value: gObj || 0, max: Math.round((gObj || 0) * 1.2), color:"#F59E0B" },
    { label:"Lipides",   value: lObj || 0, max: Math.round((lObj || 0) * 1.2), color:"#E5484D" },
  ];

  // Compo bars pct estimé
  const bfVal  = parseFloat(profil.bodyfat)    || 0;
  const mmVal  = parseFloat(profil.muscleMass) || 0;
  const bmVal  = parseFloat(profil.boneMass)   || 0;
  const wPct   = parseFloat(profil.waterPct)   || 0;
  const vfVal  = parseFloat(profil.visceralFat)|| 0;

  return (
    <div className="anim" style={{
      minHeight:"100vh", fontFamily: FONT, color: C.text,
      padding:"16px 20px 32px",
      background:`radial-gradient(800px 400px at 70% -10%, rgba(60,91,255,0.12), transparent 60%), ${C.bg}`,
    }}>
      <style>{`@keyframes rise { from { opacity:0; transform:translateY(12px)} to {opacity:1;transform:none} }`}</style>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom: 24 }}>
        <div style={{ animation:"rise .4s both" }}>
          <div style={{ fontFamily: SERIF, fontSize: 34, color: C.text, letterSpacing: -1, lineHeight: 1.1, marginBottom: 12 }}>
            {profil.prenom
              ? <>Bonjour, <span style={{ fontStyle:"italic" }}>{profil.prenom}</span></>
              :"Mon profil"}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
            {(premium || premiumNutrition) && (
              <span style={{
                display:"inline-flex", alignItems:"center", gap: 4,
                fontSize: 11, fontWeight:700, letterSpacing:"0.1em",
                color:"#FFF", padding:"4px 12px", borderRadius: 8,
                background:"linear-gradient(145deg, #3C5BFF, #2E48D9)",
                border:"1px solid rgba(46,72,217,0.65)",
                boxShadow:"0 4px 12px -3px rgba(60,91,255,0.85)",
                fontFamily: FONT,
              }}>
                PRO
              </span>
)}
            {profil.age && profil.sexe && (
              <span style={{ fontSize: 13, color: C.mid, fontFamily: FONT }}>
                {profil.age} ans · {profil.sexe ==="homme" ?"Homme" :"Femme"}
              </span>
)}
          </div>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <div style={{ display:"flex", gap: 12, marginBottom: 24, animation:"rise .4s .08s both" }}>
        <StatCard value={profil.poids} unit="kg"  label="Poids"  color={DARK.accent}/>
        <StatCard value={profil.taille} unit="cm" label="Taille" color="#12B76A"/>
        <StatCard value={imc}           unit=""   label="IMC"    color={imcColor}/>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 4, animation:"rise .4s .12s both" }}>
        <Tabs active={activeTab} setActive={setActiveTab}/>
      </div>

      {/* ══════ PROFIL ══════════════════════════════════════════════ */}
      {activeTab ==="Profil" && (
        <div key="profil">
          <SectionLabel icon={ic.target}>Identité</SectionLabel>
          <Glass pad={0} style={{ animation:"rise .4s both" }}>
            <EditRow label="Prénom" value={profil.prenom} onChange={set("prenom")}/>
            <div style={{ display:"flex", borderBottom:"1px solid rgba(0,0,0,0.05)" }}>
              <div style={{ flex: 1, borderRight:"1px solid rgba(0,0,0,0.05)" }}>
                <EditRow label="Âge" value={profil.age} displayValue={profil.age ?`${profil.age} ans` : null} type="number" onChange={set("age")} last/>
              </div>
              <div style={{ flex: 1 }}>
                <EditRow label="Genre" value={profil.sexe}
                  displayValue={profil.sexe ==="homme" ?"Homme" : profil.sexe ==="femme" ?"Femme" : null}
                  onChange={set("sexe")}
                  options={[{ value:"", label:"—" }, { value:"homme", label:"Homme" }, { value:"femme", label:"Femme" }]}
                  last/>
              </div>
            </div>
            <div style={{ display:"flex" }}>
              <div style={{ flex: 1, borderRight:"1px solid rgba(0,0,0,0.05)" }}>
                <EditRow label="Poids" value={profil.poids} displayValue={profil.poids ?`${profil.poids} kg` : null} unit="kg" type="number" onChange={recordWeight} last/>
              </div>
              <div style={{ flex: 1 }}>
                <EditRow label="Taille" value={profil.taille} displayValue={profil.taille ?`${profil.taille} cm` : null} unit="cm" type="number" onChange={set("taille")} last/>
              </div>
            </div>
          </Glass>

          <SectionLabel icon={ic.zap}>Programme</SectionLabel>
          <Glass pad={0} style={{ animation:"rise .4s .08s both" }}>
            <EditRow label="Objectif" value={profil.objectif}
              displayValue={obj ?`${obj.l}` : null}
              onChange={set("objectif")}
              options={Object.entries(OBJ).map(([k, v]) => ({ value: k, label:`${v.l}` }))}
            />
            <EditRow label="Activité" value={profil.activite}
              displayValue={ACTIVITE_LABELS[profil.activite] || null}
              onChange={set("activite")}
              options={Object.entries(ACTIVITE_FACTOR).map(([k]) => ({ value: k, label: ACTIVITE_LABELS[k] || k }))}
            />
            {calObj > 0 && (
              <Row label="Besoins caloriques" value={`${calObj.toLocaleString()} kcal/j`} accent={DARK.accent} last/>
)}
          </Glass>

          {calObj > 0 && (
            <>
              <SectionLabel icon={ic.flame}>Macros cibles</SectionLabel>
              <div style={{ display:"flex", gap: 12, animation:"rise .4s .16s both" }}>
                {macros.map(m => (
                  <MacroRing key={m.label} value={m.value} max={m.max} label={m.label} color={m.color}/>
))}
              </div>
            </>
)}
        </div>
)}

      {/* ══════ COMPO ═══════════════════════════════════════════════ */}
      {activeTab ==="Compo." && (
        <div key="compo">
          {/* Suivi du poids (graphique) */}
          <div style={{ marginTop: 24 }}>
            <WeightChart log={weightLog}/>
          </div>

          <SectionLabel icon={ic.activity}>Composition</SectionLabel>
          <Glass pad={0} style={{ animation:"rise .4s .1s both" }}>
            <CompoBar icon={ic.flame}    color="#3C5BFF" label="Masse grasse"     value={profil.bodyfat}     unit="%"   onChange={set("bodyfat")}     pct={bfVal * 2.5}  />
            <CompoBar icon={ic.dumbbell} color="#12B76A" label="Masse musculaire" value={profil.muscleMass}  unit="kg"  onChange={set("muscleMass")}  pct={mmVal * 1.2}  />
            <CompoBar icon={ic.bone}     color="#EAECF0" label="Masse osseuse"    value={profil.boneMass}    unit="kg"  onChange={set("boneMass")}    pct={bmVal * 16}   />
            <CompoBar icon={ic.drop}     color="#3C5BFF" label="Eau corporelle"   value={profil.waterPct}    unit="%"   onChange={set("waterPct")}    pct={wPct * 1.2}   />
            <CompoBar icon={ic.heart}    color="#E5484D" label="Graisse viscérale" value={profil.visceralFat} unit="/20" onChange={set("visceralFat")} pct={vfVal * 5} last/>
          </Glass>

          {/* IMC — en bas, dé-priorisé (peu pertinent pour un sportif) */}
          <SectionLabel icon={ic.activity}>Indice de masse corporelle</SectionLabel>
          <Glass pad={0} style={{ animation:"rise .4s .14s both" }}>
            <div style={{ padding:"16px 20px" }}>
              <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing:"0.1em", color: C.dim, fontFamily: FONT, marginBottom: 8 }}>IMC</div>
                  <span style={{ fontSize: 34, fontWeight:700, color: imcColor, fontFamily: FONT, ...NUM }}>{imc ||"—"}</span>
                  <span style={{ fontSize: 13, color: imcColor, marginLeft: 8, fontFamily: FONT }}>{imc ? imcCat :""}</span>
                </div>
              </div>
              {imc && (
                <div style={{ height: 6, borderRadius: 999, background:"linear-gradient(90deg,#12B76A,#F59E0B,#E5484D)", position:"relative" }}>
                  <div style={{ position:"absolute", top: -3, left:`${imcPct}%`, width: 12, height: 12, borderRadius:"50%", background:"#FFF", border:"2px solid #EAECF0", boxShadow: C.shadow, transform:"translateX(-50%)" }}/>
                </div>
)}
              <div style={{ marginTop: 12, fontSize: 11, color:"#98A2B3", lineHeight: 1.5, fontFamily: FONT }}>
                L'IMC ne distingue pas muscle et graisse : il surestime souvent le « surpoids » chez les sportifs. Fie-toi davantage à ta <b>masse grasse</b> ci-dessus.
              </div>
            </div>
          </Glass>
        </div>
)}

      {/* ══════ MESURES ═════════════════════════════════════════════ */}
      {activeTab ==="Mesures" && (
        <div key="mesures">
          <Glass style={{ marginTop: 24, display:"flex", alignItems:"center", gap: 16, animation:"rise .4s both" }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16, display:"grid", placeItems:"center", flexShrink: 0,
              background:"linear-gradient(160deg, rgba(60,91,255,0.25), rgba(60,91,255,0.08))",
              border:"1px solid rgba(157,176,255,0.35)",
            }}>
              <I d={ic.ruler} size={24} color={DARK.accent} sw={1.8}/>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: FONT }}>Mensurations corporelles</div>
              <div style={{ fontSize: 13, color: C.mid, marginTop: 4, fontFamily: FONT }}>Appuie sur une ligne pour la modifier</div>
            </div>
          </Glass>

          <SectionLabel>Tronc</SectionLabel>
          <Glass pad={0} style={{ animation:"rise .4s .08s both" }}>
            <AddRow icon={ic.ruler} color={DARK.accent} label="Poitrine"  value={profil.mChest}  onChange={set("mChest")} />
            <AddRow icon={ic.ruler} color={DARK.accent} label="Taille"    value={profil.mWaist}  onChange={set("mWaist")} />
            <AddRow icon={ic.ruler} color={DARK.accent} label="Hanches"   value={profil.mHips}   onChange={set("mHips")}  last/>
          </Glass>

          <SectionLabel>Bras</SectionLabel>
          <Glass pad={0} style={{ animation:"rise .4s .14s both" }}>
            <AddRow icon={ic.ruler} color="#12B76A" label="Bras gauche" value={profil.mLeftArm}  onChange={set("mLeftArm")} />
            <AddRow icon={ic.ruler} color="#12B76A" label="Bras droit"  value={profil.mRightArm} onChange={set("mRightArm")} last/>
          </Glass>

          <SectionLabel>Jambes</SectionLabel>
          <Glass pad={0} style={{ animation:"rise .4s .2s both" }}>
            <AddRow icon={ic.ruler} color="#3C5BFF" label="Cuisse gauche"  value={profil.mLeftThigh}  onChange={set("mLeftThigh")} />
            <AddRow icon={ic.ruler} color="#3C5BFF" label="Cuisse droite"  value={profil.mRightThigh} onChange={set("mRightThigh")} />
            <AddRow icon={ic.ruler} color="#3C5BFF" label="Mollet gauche"  value={profil.mLeftCalf}   onChange={set("mLeftCalf")} />
            <AddRow icon={ic.ruler} color="#3C5BFF" label="Mollet droit"   value={profil.mRightCalf}  onChange={set("mRightCalf")} last/>
          </Glass>
        </div>
)}

    </div>
);
}

