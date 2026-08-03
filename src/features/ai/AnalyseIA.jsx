/**
 * AnalyseIA.jsx — Refonte visuelle uniquement (design system onboarding)
 * ─────────────────────────────────────────────────────────────────────
 * LOGIQUE 100% INCHANGÉE : états, handlers, validation, services IA.
 * Seule la couche visuelle est remplacée par les tokens Focus Mode / Onboarding.
 */

import { I } from"../../components/ui/Icon.jsx";
import { useState, useRef, useEffect } from"react";
import useScrollTop from"../../hooks/useScrollTop.js";
import {
  callGenerateProgramAPI, compressImage,
  buildProgramFromAI, buildCalendarFromProgram,
  summarizeProgramLoads, LOAD_MESSAGES,
} from"../../services/aiService.js";
import { buildDossierAthlete } from"../../services/coachBrainService.js";
import { analyserMorpho, getFicheMorpho, ficheEstValide } from"../../services/morphoService.js";
import { syncCycleOutcome } from"../../services/syncService.js";
import {
  T, F, SER, MON, CARD, InjectCSS, OI,
  PoseCard, Stepper, NavBtns, FL, SelRow,
  GoalCrd, EquipCrd, ZoneGrp, DayPicker,
} from"./components/AnalyseIAKit.jsx";

export default function AnalyseIA(props) {
  useScrollTop();
  const [elapsed, setElapsed] = useState(0);
  const { profil, photos, setPhotos, readFile, INT, loadIA, setLoadIA, loadMsg,
          setLoadMsg, corrigerFaibles, setCorrigerFaibles, setProg, setCycleStart,
          setCalSess, setProgView, setTab, cycles, setCycles, prog, push } = props;

  // ── État du formulaire (inchangé) ────────────────────────────────────────
  const [aStep, setAStep] = useState(0);
  const [form, setForm]   = useState({
    prenom: profil?.prenom ||"", age: profil?.age ||"",
    poids:  profil?.poids  ||"", taille: profil?.taille ||"",
    sexe:   profil?.sexe   ||"", metier:"",
    niveau:"", jours: [], objectif: profil?.objectif ||"",
    objectifPrecis:"", materiel: [], pathologies: [], sport:"",
  });

  const fileRefFace   = useRef();
  const fileRefDos    = useRef();
  const fileRefProfil = useRef();

  // ── Génération IA — flux serveur en 2 temps ──────────────────────────────
  // 1) VISION (rare) : si photos fournies → /api/analyze-morpho → fiche stockée.
  //    Sinon : réutilise la fiche morpho existante (le physique change lentement).
  // 2) GÉNÉRATION : /api/generate-program reçoit form + dossier + fiche (PAS de photos).
  //    Le prompt et la connaissance MorphoCoach vivent côté serveur.
  const lancerIA = async () => {
    setLoadIA(true);
    let mi = 0;
    setLoadMsg(LOAD_MESSAGES[0]);
    const interval = setInterval(() => {
      mi = (mi + 1) % LOAD_MESSAGES.length;
      setLoadMsg(LOAD_MESSAGES[mi]);
    }, 2200);
    try {
      // Couche 0 : dossier athlète depuis les données réelles du compte
      const { dossier } = buildDossierAthlete({ form, prog, cycles, corrigerFaibles });

      // Fiche morphologique : nouvelles photos → analyse vision ; sinon fiche stockée
      let fiche = getFicheMorpho();
      const rawPhotos = [photos.face, photos.dos, photos.profil].filter(Boolean);
      if (rawPhotos.length > 0) {
        setLoadMsg(" Analyse morphologique de tes photos…");
        const compressed = [];
        // 1200 px / qualité 0.82 : à 800 px et 0.65, les détails morphologiques
        // (insertions, reliefs, proportions) disparaissaient et l'analyse
        // renvoyait "indetermine" partout. Reste très en dessous de la limite
        // serveur de 3 Mo par photo.
        for (const p of rawPhotos) compressed.push(await compressImage(p, 1200, 0.82));
        fiche = await analyserMorpho(compressed, { sexe: form.sexe, age: form.age });
        // Une analyse qui ne lit rien doit se voir : sans ça, le programme est
        // généré "à l'aveugle" et rien ne le signale à l'utilisateur.
        if (fiche?.vide) {
          push?.("", "Analyse morpho peu concluante",
            "Tes photos n'ont pas permis de lire ta morphologie. Le programme reste basé sur ton historique. Reprends-les en pied, bien éclairé, vêtements ajustés.");
        } else if (typeof fiche?.exploitabilite === "number" && fiche.exploitabilite < 40) {
          push?.("", "Analyse morpho partielle",
            `Seuls ${fiche.exploitabilite} % des traits ont pu être lus. Des photos plus nettes affineraient ton programme.`);
        }
      } else if (fiche && !ficheEstValide()) {
        // Fiche ancienne (> 90 j) : on l'utilise quand même, mais on le signale
        push?.("","Fiche morpho ancienne","Pense à refaire tes photos pour une analyse à jour.");
      }

      const { parsed, warnings } = await callGenerateProgramAPI({ form, dossier, ficheMorpho: fiche });
      if (warnings?.length) console.warn("Avertissements génération:", warnings);

      const np = buildProgramFromAI(parsed, { form, cycles, ficheMorpho: fiche });
      if (prog && setCycles) {
        const archive = {
          ...prog, archiveDate: new Date().toLocaleDateString("fr-FR"),
          chargesResume: summarizeProgramLoads(prog),
        };
        setCycles(prev => [...prev, archive]);
        syncCycleOutcome(archive);                 // journal Supabase — silencieux
      }
      setProg(np); setCycleStart(Date.now());
      setAStep(0); setPhotos({ face:null, dos:null, profil:null });
      const newSess = buildCalendarFromProgram(np, INT);
      setCalSess(prev => ({ ...prev, ...newSess }));
      if (setProgView) setProgView("today");
      if (setTab)      setTab("program");
      const pts = np.analyse?.points_faibles?.join(",") ||"";
      push("",`Programme Cycle ${np.numero} créé !`, pts ?`Points faibles: ${pts}` :"Votre programme est prêt !");
      setLoadIA(false);
    } catch(e) {
      console.error("lancerIA error:", e);
      // L'écran d'erreur reste affiché : c'est son bouton « Réessayer » qui
      // ramène au formulaire. Le refermer automatiquement rendait l'erreur
      // illisible (elle disparaissait au bout de 2 s).
      setLoadMsg(`Erreur: ${e.message}`);
      push?.("","Génération échouée", e.message?.substring(0,80) ||"Réessayez.");
    } finally { clearInterval(interval); }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const togglePath  = p => setForm(f => ({ ...f, pathologies:
    f.pathologies.includes(p) ? f.pathologies.filter(x=>x!==p)
    : [...f.pathologies.filter(x=>x!=="Aucune"), p] }));
  const toggleDay   = d => setForm(f => ({ ...f, jours:
    f.jours.includes(d) ? f.jours.filter(x=>x!==d) : [...f.jours,d] }));
  const toggleEquip = id => setForm(f => ({ ...f, materiel:
    f.materiel.includes(id) ? f.materiel.filter(x=>x!==id) : [...f.materiel,id] }));
  // IMC + estimation du taux de masse grasse (Deurenberg 1991, à partir de
  // l'IMC, l'âge et le sexe). C'est une ESTIMATION de population, pas une
  // mesure : elle situe, elle ne remplace pas une impédancemétrie ou un pli.
  const imcVal = (() => {
    const p = parseFloat(form.poids), h = parseFloat(form.taille);
    if (!p || !h) return null;
    return (p / Math.pow(h / 100, 2)).toFixed(1);
  })();
  const imcLabel = imcVal == null ? "" :
    imcVal < 18.5 ? "maigreur" : imcVal < 25 ? "normal" :
    imcVal < 30 ? "surpoids" : "obésité";
  const bfVal = (() => {
    const age = parseFloat(form.age);
    if (!imcVal || !age || !form.sexe) return null;
    const sexe = form.sexe === "homme" ? 1 : 0;
    const bf = 1.20 * parseFloat(imcVal) + 0.23 * age - 10.8 * sexe - 5.4;
    return bf > 2 && bf < 65 ? bf.toFixed(1) : null;
  })();

  const photoCount = [photos.face,photos.dos,photos.profil].filter(Boolean).length;

  // Compteur d'attente : repart de zéro à chaque génération.
  useEffect(() => {
    if (!loadIA) { setElapsed(0); return; }
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [loadIA]);

  // ── Écran de génération ───────────────────────────────────────────────────
  if (loadIA) {
    const isError = loadMsg.startsWith("Erreur");
    const RING_R = 54;
    const CIRC   = 2 * Math.PI * RING_R;

    if (isError) return (
      <div style={{ padding:'0 20px' }}>
        <InjectCSS/>
        <div style={{ ...CARD, textAlign:'center', padding:'32px 20px', marginTop:20 }}>
          <div style={{ width:56, height:56, borderRadius:'50%',
            background:'rgba(229,72,77,0.12)', border:`1px solid rgba(229,72,77,0.25)`,
            display:'grid', placeItems:'center', margin:'0 auto 18px', color:T.red }}>
            <OI n="sparkles" sz={24}/>
          </div>
          <div style={{ fontFamily:SER, fontSize:20, color:T.red, marginBottom:8 }}>
            Génération échouée
          </div>
          <div style={{ fontSize:13, color:T.t3, marginBottom:24, lineHeight:1.6 }}>{loadMsg}</div>
          <button className="ob-tap" onClick={()=>{setLoadIA(false);setLoadMsg("");}}
            style={{ padding:'16px 24px', borderRadius:16,
              background:`linear-gradient(180deg,${T.acLt},${T.ac})`,
              color:T.t1, border:'none', fontFamily:F, fontSize:14, fontWeight:600, cursor:'pointer' }}>
            <I name="chevronLeft" size={14}/> Réessayer
          </button>
        </div>
      </div>
);

    return (
      <div style={{ padding:'0 20px' }}>
        <InjectCSS/>
        <div style={{ paddingTop:32, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
          {/* Anneau animé */}
          <div style={{ position:'relative', width:140, height:140, marginTop:20 }}>
            <div style={{ position:'absolute', inset:-8, borderRadius:'50%',
              background:`radial-gradient(closest-side,${T.acGlow},transparent 70%)`,
              filter:'blur(18px)', animation:'ob-breathe 3s ease-in-out infinite' }}/>
            <svg width="140" height="140" viewBox="0 0 140 140"
              style={{ position:'relative', transform:'rotate(-90deg)' }}>
              <circle cx="70" cy="70" r={RING_R} stroke="rgba(0,0,0,0.05)" strokeWidth="2" fill="none"/>
              <circle cx="70" cy="70" r={RING_R} stroke={T.ac} strokeWidth="2.5" fill="none"
                strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC*0.35}
                style={{ animation:'ob-spin 2s linear infinite', transformOrigin:'center' }}/>
            </svg>
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
                          alignItems:'center', justifyContent:'center' }}>
              <OI n="sparkles" sz={28} c={T.acLt} s={1.6}/>
            </div>
          </div>

          <div style={{ fontFamily:MON, fontSize:10, fontWeight:600, color:T.ac,
                        letterSpacing:"0.1em", textTransform:'uppercase', marginTop:32 }}>
            GÉNÉRATION EN COURS
          </div>
          <div style={{ fontFamily:SER, fontSize:26, letterSpacing:-1, color:T.t1,
                        marginTop:8, lineHeight:1.1 }}>
            L'IA construit<br/>
            <span style={{ fontStyle:'italic', color:T.acLt }}>ton programme.</span>
          </div>
          <div style={{ fontFamily:F, fontSize:13, color:T.t3, marginTop:16,
                        lineHeight:1.5, maxWidth:280 }}>
            {loadMsg}
          </div>

          {/* Attente annoncée : une génération complète prend réellement
              2 à 4 minutes. L'annoncer évite de croire à un blocage. */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
                        gap:6, marginTop:20 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8,
                          background:T.surf, border:`1px solid ${T.bd}`,
                          borderRadius:99, padding:'8px 16px' }}>
              <span style={{ fontFamily:MON, fontSize:15, fontWeight:700, color:T.t1,
                             fontVariantNumeric:'tabular-nums' }}>
                {String(Math.floor(elapsed/60)).padStart(2,'0')}:{String(elapsed%60).padStart(2,'0')}
              </span>
              <span style={{ fontFamily:F, fontSize:12, fontWeight:500, color:T.t3 }}>
                / ~3 min en moyenne
              </span>
            </div>
            <div style={{ fontFamily:F, fontSize:12, color:T.t3, maxWidth:290,
                          lineHeight:1.5, textAlign:'center' }}>
              {elapsed < 150
                ? "Un programme complet demande du temps. Tu peux laisser l'écran ouvert."
                : elapsed < 300
                  ? "Encore quelques instants — le coach finalise et vérifie ton programme."
                  : "C'est plus long que d'habitude, mais la génération est toujours en cours."}
            </div>
          </div>
        </div>

        {/* Tâches skeleton */}
        <div style={{ ...CARD, padding:'8px 16px', marginTop:32 }}>
          {LOAD_MESSAGES.slice(0,5).map((m,i) => {
            const cur  = m === loadMsg;
            const done = LOAD_MESSAGES.indexOf(loadMsg) > i;
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12,
                padding:'12px 0', borderBottom:i<4?`1px solid ${T.bd}`:'none' }}>
                <span style={{ width:22, height:22, borderRadius:'50%', flexShrink:0,
                  border:`1.5px solid ${done?T.ac:cur?T.acLt:T.bdHi}`,
                  background:done?T.ac:'transparent', display:'grid', placeItems:'center' }}>
                  {done ? <OI n="check" sz={12} s={2.8} c="#FFF"/>
                   : cur ? <span style={{ width:7, height:7, borderRadius:'50%',
                              background:T.acLt, animation:'ob-pulse 1.2s ease-in-out infinite' }}/>
                   : null}
                </span>
                <span style={{ flex:1, fontFamily:F, fontSize:13, fontWeight:600,
                               color:done?T.t3:cur?T.t1:T.t4 }}>{m}</span>
                {cur  && <span style={{ fontFamily:MON, fontSize:8.5, color:T.acLt,
                                        letterSpacing:"0.1em", textTransform:'uppercase' }}>EN COURS</span>}
                {done && <span style={{ fontFamily:MON, fontSize:8.5, color:T.t4,
                                        letterSpacing:"0.1em", textTransform:'uppercase' }}>OK</span>}
              </div>
);
          })}
        </div>
      </div>
);
  }

  // ── Wizard ────────────────────────────────────────────────────────────────
  return (
    <div style={{ paddingBottom:32 }}>
      <InjectCSS/>

      {/* ÉTAPE 0 — PHOTOS ──────────────────────────────────────────────────── */}
      {aStep===0 && <>
        <Stepper step={0} eyebrow="PHOTO"
          title={<>Analyse <span style={{ fontStyle:'italic', color:T.ac }}>morpho.</span></>}
          subtitle="3 photos permettent à l'IA de détecter ta morphologie et tes points faibles. Position droite, vêtements près du corps."/>

        <div style={{ padding:'20px 20px 0' }}>
          {/* Bandeau confidentialité */}
          <div style={{ ...CARD, padding:'12px 16px', display:'flex', gap:12,
            alignItems:'center', marginBottom:16,
            background:'rgba(60,91,255,0.08)', border:`1px solid rgba(60,91,255,0.25)` }}>
            <div style={{ width:34, height:34, borderRadius:12, background:T.ac,
              display:'grid', placeItems:'center', flexShrink:0,
              boxShadow:`0 4px 10px ${T.acGlow}` }}>
              <OI n="shield" sz={17} c="#FFF" s={2}/>
            </div>
            <span style={{ fontSize:11, color:T.t2, fontWeight:500, lineHeight:1.5 }}>
              Photos chiffrées et privées. Analyse locale, jamais partagées.
            </span>
          </div>

          {/* Slots photo */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {[
              { key:"face",   view:"face",   hint:"Face à l'objectif, bras le long du corps", ref:fileRefFace },
              { key:"dos",    view:"dos",    hint:"Dos à l'objectif, bras le long du corps",  ref:fileRefDos  },
              { key:"profil", view:"profil", hint:"Côté droit ou gauche, position droite",   ref:fileRefProfil },
            ].map(({ key, view, hint, ref }, i) => {
              const filled = !!photos[key];
              return (
                <div key={key}>
                  <PoseCard
                    view={view}
                    hint={hint}
                    filled={filled}
                    photo={photos[key]}
                    index={i+1}
                    onTap={()=>{ if (ref.current) { ref.current.value=""; ref.current.click(); } }}
                  />
                </div>
);
            })}
          </div>

          {/* Compteur photos */}
          <div style={{ marginTop:16, display:'flex', alignItems:'center',
                        justifyContent:'center', gap:8 }}>
            <div style={{ display:'flex', gap:4 }}>
              {[photos.face,photos.dos,photos.profil].map((f,i) => (
                <span key={i} style={{ width:18, height:4, borderRadius:2,
                  background:f?T.ac:'rgba(0,0,0,0.12)' }}/>
))}
            </div>
            <span style={{ fontFamily:MON, fontSize:10, fontWeight:500, color:T.t4,
                           letterSpacing:"0.1em", textTransform:'uppercase' }}>
              {photoCount} / 3 PHOTOS
            </span>
          </div>
        </div>

        {/* Inputs fichier cachés (logique inchangée) */}
        <input ref={fileRefFace}   type="file" accept="image/*" style={{display:"none"}} onChange={e=>readFile("face",  e.target.files[0])}/>
        <input ref={fileRefDos}    type="file" accept="image/*" style={{display:"none"}} onChange={e=>readFile("dos",   e.target.files[0])}/>
        <input ref={fileRefProfil} type="file" accept="image/*" style={{display:"none"}} onChange={e=>readFile("profil",e.target.files[0])}/>

        <NavBtns
          nextLabel={photoCount>0?"Continuer":"Ajoutez au moins 1 photo"}
          enabled={photoCount>0}
          onNext={()=>setAStep(1)}
          showBack={false}
        />
      </>}

      {/* ÉTAPE 1 — PROFIL ──────────────────────────────────────────────────── */}
      {aStep===1 && <>
        <Stepper step={1} eyebrow="PROFIL"
          title={<>Qui es-<span style={{ fontStyle:'italic', color:T.acLt }}>tu ?</span></>}
          subtitle="Ces données calibrent les charges, le volume et la nutrition de ton programme."/>

        <div style={{ padding:'20px 20px 0' }}>
          <div style={{ ...CARD }}>
            {/* Prénom */}
            <div style={{ marginBottom:16 }}>
              <FL optional>Prénom</FL>
              <input value={form.prenom} onChange={e=>setForm({...form,prenom:e.target.value})}
                placeholder="Prénom" autoComplete="off"
                style={{ width:'100%', padding:'16px 16px', borderRadius:12, boxSizing:'border-box',
                  background:T.surfFlat, border:`1px solid ${T.bd}`,
                  fontFamily:F, fontSize:14, fontWeight:500, color:T.t1, outline:'none' }}/>
            </div>
            {/* Âge + Sexe */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
              <div>
                <FL required>Âge</FL>
                <input type="number" placeholder="27"
                  value={form.age} onChange={e=>setForm({...form,age:e.target.value})}
                  style={{ width:'100%', padding:'16px 16px', borderRadius:12, boxSizing:'border-box',
                    background:T.surfFlat, border:`1px solid ${form.age?T.bdAc:T.bd}`,
                    fontFamily:F, fontSize:14, fontWeight:500, color:T.t1, outline:'none' }}/>
              </div>
              <div>
                <FL required>Sexe</FL>
                <select value={form.sexe} onChange={e=>setForm({...form,sexe:e.target.value})}
                  style={{ width:'100%', padding:'16px 16px', borderRadius:12, boxSizing:'border-box',
                    background:T.surfFlat, border:`1px solid ${form.sexe?T.bdAc:T.bd}`,
                    fontFamily:F, fontSize:14, fontWeight:500, color:form.sexe?T.t1:T.t5,
                    outline:'none', appearance:'none' }}>
                  <option value="">Choisir…</option>
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                </select>
              </div>
            </div>
            {/* Poids + Taille */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <FL required>Poids</FL>
                <div style={{ position:'relative' }}>
                  <input type="number" placeholder="75"
                    value={form.poids} onChange={e=>setForm({...form,poids:e.target.value})}
                    style={{ width:'100%', padding:'16px 32px 16px 16px', borderRadius:12, boxSizing:'border-box',
                      background:T.surfFlat, border:`1px solid ${form.poids?T.bdAc:T.bd}`,
                      fontFamily:F, fontSize:14, fontWeight:500, color:T.t1, outline:'none' }}/>
                  <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                    fontFamily:MON, fontSize:11, color:T.t4 }}>kg</span>
                </div>
              </div>
              <div>
                <FL required>Taille</FL>
                <div style={{ position:'relative' }}>
                  <input type="number" placeholder="178"
                    value={form.taille} onChange={e=>setForm({...form,taille:e.target.value})}
                    style={{ width:'100%', padding:'16px 32px 16px 16px', borderRadius:12, boxSizing:'border-box',
                      background:T.surfFlat, border:`1px solid ${form.taille?T.bdAc:T.bd}`,
                      fontFamily:F, fontSize:14, fontWeight:500, color:T.t1, outline:'none' }}/>
                  <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                    fontFamily:MON, fontSize:11, color:T.t4 }}>cm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Niveau */}
          <div style={{ marginTop:20 }}>
            <FL required>Niveau d'expérience</FL>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[{id:"debutant",l:"Débutant",d:"< 1 an"},
                {id:"intermediaire",l:"Intermédiaire",d:"1–3 ans"},
                {id:"avance",l:"Avancé",d:"> 3 ans"}].map(n => (
                <SelRow key={n.id} label={n.l} meta={n.d}
                  selected={form.niveau===n.id}
                  onClick={()=>setForm({...form,niveau:n.id})}/>
))}
            </div>
          </div>

          {(!form.age||!form.poids||!form.taille||!form.sexe||!form.niveau) && (
            <div style={{ marginTop:12, padding:'12px 16px', borderRadius:12,
              background:'rgba(229,72,77,0.08)', border:'1px solid rgba(229,72,77,0.18)',
              fontSize:11, color:T.red, lineHeight:1.5 }}>
              Remplis tous les champs marqués * pour continuer
            </div>
)}
        </div>

        <NavBtns
          nextLabel="Continuer"
          enabled={!!(form.age&&form.poids&&form.taille&&form.sexe&&form.niveau)}
          onNext={()=>setAStep(2)} onBack={()=>setAStep(0)}
        />
      </>}

      {/* ÉTAPE 2 — OBJECTIF ─────────────────────────────────────────────────── */}
      {aStep===2 && <>
        <Stepper step={2} eyebrow="OBJECTIF"
          title={<>Ton <span style={{ fontStyle:'italic', color:T.acLt }}>but.</span></>}
          subtitle="Un objectif principal. L'IA structure tout le mésocycle autour de lui."/>

        <div style={{ padding:'20px 20px 0' }}>
          <FL required>Objectif principal</FL>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[{id:"hypertrophie",l:"Prise de muscle"},{id:"force",l:"Force"},
              {id:"poids",l:"Perte de poids"},{id:"prep_physique",l:"Prépa physique"},
              {id:"reathletisation",l:"Réathlé"},{id:"sante",l:"Santé"}].map(o => (
              <GoalCrd key={o.id} id={o.id} label={o.l}
                selected={form.objectif===o.id}
                onClick={()=>setForm({...form,objectif:o.id})}/>
))}
          </div>

          {/* Objectif précis */}
          <div style={{ marginTop:20 }}>
            <FL optional>Objectif précis</FL>
            <textarea
              value={form.objectifPrecis}
              onChange={e=>setForm({...form,objectifPrecis:e.target.value})}
              placeholder="Ex : prendre 4 kg de muscle sec d'ici septembre…"
              style={{ width:'100%', padding:'16px 16px', borderRadius:12, boxSizing:'border-box',
                background:T.surfFlat, border:`1px solid ${T.bd}`,
                fontFamily:F, fontSize:14, fontWeight:500, color:T.t1, minHeight:60,
                resize:'vertical', outline:'none', lineHeight:1.5 }}/>
          </div>

          {/* Sport pratiqué */}
          <div style={{ marginTop:20 }}>
            <FL optional>Sport pratiqué</FL>
            <input value={form.sport||""} onChange={e=>setForm({...form,sport:e.target.value})}
              placeholder="Football, Tennis, Natation, Boxe…" autoComplete="off"
              style={{ width:'100%', padding:'16px 16px', borderRadius:12, boxSizing:'border-box',
                background:T.surfFlat, border:`1px solid ${T.bd}`,
                fontFamily:F, fontSize:14, fontWeight:500, color:T.t1, outline:'none' }}/>
          </div>

          {/* Jours */}
          <div style={{ marginTop:20 }}>
            <FL required>Jours d'entraînement</FL>
            <DayPicker selected={form.jours} onToggle={toggleDay}/>
            {form.jours.length>0 && (
              <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:T.ac }}/>
                <span style={{ fontSize:11, color:T.t3, fontWeight:500 }}>
                  {form.jours.length} jour{form.jours.length>1?'s':''} sélectionné{form.jours.length>1?'s':''}
                </span>
              </div>
)}
          </div>

          {(!form.objectif||form.jours.length===0) && (
            <div style={{ marginTop:12, padding:'12px 16px', borderRadius:12,
              background:'rgba(229,72,77,0.08)', border:'1px solid rgba(229,72,77,0.18)',
              fontSize:11, color:T.red, lineHeight:1.5 }}>
              {!form.objectif &&"* Sélectionne un objectif principal"}
              {form.jours.length===0 && <div>* Sélectionne au moins 1 jour</div>}
            </div>
)}
        </div>

        <NavBtns
          nextLabel="Continuer"
          enabled={!!(form.objectif&&form.jours.length>0)}
          onNext={()=>setAStep(3)} onBack={()=>setAStep(1)}
        />
      </>}

      {/* ÉTAPE 3 — PATHOLOGIES ──────────────────────────────────────────────── */}
      {aStep===3 && <>
        <Stepper step={3} eyebrow="SANTÉ"
          title={<>Douleurs &<br/><span style={{ fontStyle:'italic', color:T.acLt }}>pathologies.</span></>}
          subtitle="L'IA adapte ou retire les exercices à risque selon tes antécédents."/>

        <div style={{ padding:'20px 20px 0' }}>
          {/* Disclaimer médical */}
          <div style={{ ...CARD, padding:'12px 16px', display:'flex', gap:12, alignItems:'flex-start',
            marginBottom:20, background:'rgba(91,141,239,0.05)', border:`1px solid ${T.bdAc}` }}>
            <OI n="info" sz={17} c={T.acLt} s={1.6}/>
            <span style={{ fontSize:11, color:T.t2, lineHeight:1.5 }}>
              Exercices correctifs = renforcement uniquement. Consulte un kiné pour tout diagnostic.
            </span>
          </div>

          {/* Zones */}
          {[
            { z:"Dos",    items:["Lombalgie","Hernie discale","Scoliose","Cervicalgie"] },
            { z:"Épaule", items:["Conflit épaule","Coiffe rotateurs"] },
            { z:"Genou",  items:["Ménisque","LCA","Tendinite","Arthrose"] },
            { z:"Autres", items:["Épicondylite","Canal carpien","Tendinite Achille","Coxarthrose"] },
          ].map(zone => (
            <ZoneGrp key={zone.z} zone={zone.z} items={zone.items}
              selected={form.pathologies} onToggle={togglePath}/>
))}

          {/* Aucune pathologie */}
          <div style={{ paddingTop:4 }}>
            <button className="ob-tap"
              onClick={()=>setForm(f=>({...f,pathologies:["Aucune"]}))}
              style={{ width:'100%', padding:'12px', borderRadius:12,
                background: form.pathologies.includes("Aucune") ? T.acSoft : T.surfFlat,
                border:`1px dashed ${form.pathologies.includes("Aucune")?T.bdAc:T.bdHi}`,
                color:T.t2, fontFamily:F, fontSize:13, fontWeight:600,
                display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <OI n="check" sz={13} s={2.2} c={T.t3}/> Aucune pathologie
            </button>
          </div>
        </div>

        <NavBtns
          nextLabel="Continuer"
          enabled={form.pathologies.length>0}
          onNext={()=>setAStep(4)} onBack={()=>setAStep(2)}
        />
      </>}

      {/* ÉTAPE 4 — MATÉRIEL ─────────────────────────────────────────────────── */}
      {aStep===4 && <>
        <Stepper step={4} eyebrow="MATÉRIEL"
          title={<>Ton <span style={{ fontStyle:'italic', color:T.acLt }}>équipement.</span></>}
          subtitle="L'IA ne proposera que des exercices réalisables avec ce que tu as."/>

        <div style={{ padding:'20px 20px 0' }}>
          <FL required>Matériel disponible</FL>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[{id:"salle_complete",l:"Salle complète"},{id:"halteres",l:"Haltères"},
              {id:"elastiques",l:"Élastiques"},{id:"barre_traction",l:"Barre traction"},
              {id:"poids_corps",l:"Poids du corps"},{id:"machines",l:"Machines"}].map(m => (
              <EquipCrd key={m.id} id={m.id} label={m.l}
                selected={form.materiel.includes(m.id)}
                onClick={()=>toggleEquip(m.id)}/>
))}
          </div>

          {/* Corriger points faibles */}
          <button className="ob-tap"
            onClick={()=>setCorrigerFaibles(v=>!v)}
            style={{ marginTop:16, width:'100%', padding:'16px 16px', borderRadius:16, textAlign:'left',
              background: corrigerFaibles ?`linear-gradient(95deg,${T.acSoft},${T.surf} 80%)` : T.surf,
              border:`1px solid ${corrigerFaibles?T.bdAc:T.bd}`,
              display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:26, height:26, borderRadius:8, flexShrink:0,
              background:corrigerFaibles?T.ac:'transparent',
              border:`1.5px solid ${corrigerFaibles?T.ac:T.bdHi}`,
              display:'grid', placeItems:'center',
              boxShadow:corrigerFaibles?`0 4px 10px ${T.acGlow}`:'none' }}>
              {corrigerFaibles && <OI n="check" sz={15} s={2.8} c="#FFF"/>}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:F, fontSize:14, fontWeight:600, color:T.t1 }}>
                Corriger mes points faibles
              </div>
              <div style={{ fontSize:11, color:T.t3, marginTop:2, lineHeight:1.4 }}>
                L'IA priorisera les groupes en retard détectés sur tes photos.
              </div>
            </div>
          </button>

          {/* Récapitulatif */}
          <div style={{ ...CARD, marginTop:16, padding:'16px 16px' }}>
            <div style={{ fontFamily:MON, fontSize:10, fontWeight:500, color:T.t3,
                          letterSpacing:"0.1em", textTransform:'uppercase', marginBottom:12 }}>
              RÉCAPITULATIF
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { l:'Objectif', v:{hypertrophie:"Prise de muscle",force:"Force",poids:"Perte de poids",prep_physique:"Prépa physique",reathletisation:"Réathlé",sante:"Santé"}[form.objectif]||"—" },
                { l:'Niveau',   v:{debutant:"Débutant",intermediaire:"Intermédiaire",avance:"Avancé"}[form.niveau]||"—" },
                { l:'Fréquence',v:form.jours.length>0?`${form.jours.length} jours / sem`:"—" },
                { l:'IMC', v:imcVal ? `${imcVal} · ${imcLabel}` : "—" },
                { l:'Masse grasse estimée', v:bfVal ? `~${bfVal} %` : "—" },
                { l:'Contraintes', v:form.pathologies.length>0?form.pathologies.join(","):"Aucune" },
              ].map(r => (
                <div key={r.l} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:11, fontWeight:500, color:T.t3 }}>{r.l}</span>
                  <span style={{ fontFamily:F, fontSize:13, fontWeight:600, color:T.t1 }}>{r.v}</span>
                </div>
))}
            </div>
          </div>

          {form.materiel.length===0 && (
            <div style={{ marginTop:12, padding:'12px 16px', borderRadius:12,
              background:'rgba(229,72,77,0.08)', border:'1px solid rgba(229,72,77,0.18)',
              fontSize:11, color:T.red }}>
              * Sélectionne au moins un équipement
            </div>
)}
        </div>

        <NavBtns
          nextLabel="Générer mon programme"
          enabled={form.materiel.length>0}
          gen
          onNext={lancerIA}
          onBack={()=>setAStep(3)}
        />
      </>}
    </div>
);
}

