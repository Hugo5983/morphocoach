// ─── AI SERVICE ─────────────────────────────────────────────────────────────
// Toute la logique de génération de programme par IA.

export function compressImage(dataUrl, maxW = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = Math.min(maxW / img.width, maxW / img.height, 1);
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function buildPrompt({ form, photos, cycles, corrigerFaibles }) {
  const prec = cycles && cycles.length > 0 ? cycles[cycles.length - 1] : null;
  const histCtx = prec
    ? `CYCLE PRÉCÉDENT: ${prec.titre}. Charges maximales: ${prec.chargesResume || "aucune"}. Le nouveau programme doit PROGRESSER en charge, volume ou méthode.`
    : "PREMIER CYCLE de l'utilisateur.";
  const cycleNum = (cycles?.length || 0) + 1;
  const imc = form.poids && form.taille
    ? (parseFloat(form.poids) / Math.pow(parseFloat(form.taille) / 100, 2)).toFixed(1)
    : "?";
  const nbPhotos = [photos.face, photos.dos, photos.profil].filter(Boolean).length;
  const pathosAdapt = form.pathologies.filter((p) => p !== "Aucune");

  return `Tu es un coach sportif expert en musculation et biomécanique. ${histCtx}

PROFIL: ${form.prenom || "User"}, ${form.age}ans, ${form.sexe}, ${form.poids}kg/${form.taille}cm, IMC:${imc}
Niveau:${form.niveau} | Objectif:${form.objectif} | Jours:${(form.jours || []).join("/") || "3j"} | Matériel:${(form.materiel || []).join(",") || "salle"} | Pathologies:${pathosAdapt.join(",") || "aucune"} | Cycle:${cycleNum} | Photos:${nbPhotos} | Corriger faibles:${corrigerFaibles ? "OUI" : "NON"}

RÈGLES DELAVIER (selon photos):
- Humérus longs→haltères UNIQUEMENT au développé/épaules | Fémurs longs→presse PAS squat | Cage plate→pull-over OBLIGATOIRE | Antépulsion→face pull chaque séance
- Débutant:3s×8-12,10s/séance,corps entier | Intermédiaire:4s,split H/B,pyramidal,supersets | Avancé:5s,split complet,drop-set,5×5,rest-pause
- Cycle${cycleNum}:${cycleNum === 1 ? "méthodes de base" : cycleNum === 2 ? "pyramidal+supersets" : "drop-sets+rest-pause+avancé"}
${pathosAdapt.length > 0 ? `PATHOLOGIES:${form.pathologies.includes("Lombalgie") || form.pathologies.includes("Hernie discale") ? "INTERDIT:soulevé terre,good morning,hyperextension lourde|OBLIGATOIRE:gainage transverse" : ""}${form.pathologies.includes("Conflit épaule") || form.pathologies.includes("Coiffe rotateurs") ? "INTERDIT:développé barre,tirage nuque|OBLIGATOIRE:face pull,rotation externe" : ""}${form.pathologies.includes("Ménisque") || form.pathologies.includes("LCA") ? "INTERDIT:squat profond,fentes impact|OK:presse 60°,leg extension léger" : ""}${form.pathologies.includes("Scoliose") ? "Exercices unilatéraux PRIORITAIRES" : ""}${form.pathologies.includes("Épicondylite") ? "INTERDIT:curl barre droite,rowing barre" : ""}` : ""}
Analyse les photos, identifie morphologie et déséquilibres musculaires.

RÉPONDS UNIQUEMENT avec ce JSON compact (pas de texte, pas de markdown):
{"analyse":{"points_forts":["m1"],"points_faibles":["m1"],"posture":"courte","morphotype":"ecto|meso|endo","humerus":"courts|longs","femurs":"courts|longs","cage":"plate|large","conseil":"1 phrase"},"programme":{"titre":"string","methode":"string","seances":[{"jour":"Lundi","focus":"string","duree":"50min","intensite":"modere","exercices":[{"nom":"string","series":"3","reps":"10","repos":"90s","charge":"65%","tempo":"2-1-3","methode":"classique","morpho_tip":"string","technique":"string"}],"note":"string"}],"progression":"conseil 8 semaines"},"correction":{"groupes":["m1"],"note":"string"},"nutrition":{"cal":2500,"p":150,"g":300,"l":80,"conseil":"string"},"morpho":{"resume":"string"}}`;
}

export function parseAIResponse(rawText) {
  if (!rawText) throw new Error("Réponse vide de l'API");
  let jsonStr = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const jStart = jsonStr.indexOf("{");
  const jEnd = jsonStr.lastIndexOf("}");
  if (jStart === -1 || jEnd === -1 || jEnd <= jStart) throw new Error("Pas de JSON dans la réponse");
  jsonStr = jsonStr.substring(jStart, jEnd + 1);
  const openB = (jsonStr.match(/\{/g) || []).length;
  const closeB = (jsonStr.match(/\}/g) || []).length;
  if (openB > closeB) jsonStr += "}".repeat(openB - closeB);
  const openBr = (jsonStr.match(/\[/g) || []).length;
  const closeBr = (jsonStr.match(/\]/g) || []).length;
  if (openBr > closeBr) jsonStr += "]".repeat(openBr - closeBr) + "}";
  try { return JSON.parse(jsonStr); }
  catch (e) { throw new Error("JSON mal formé: " + e.message.substring(0, 50)); }
}

export function buildProgramFromAI(parsed, { form, cycles }) {
  if (!parsed.programme) throw new Error("Clé 'programme' absente");
  if (!Array.isArray(parsed.programme.seances) || parsed.programme.seances.length === 0)
    throw new Error("Aucune séance générée");
  const analyse = parsed.analyse || parsed.analyse_physique || {};
  const correction = parsed.correction || parsed.correction_faibles || {};
  return {
    titre: parsed.programme.titre || "Mon programme",
    type: "ia",
    methode: parsed.programme.methode || "Classique",
    morpho: parsed.morpho || {},
    analyse: {
      points_forts: analyse.points_forts || [],
      points_faibles: analyse.points_faibles || [],
      posture: analyse.posture || "",
      morphotype: analyse.morphotype || "",
      humerus: analyse.humerus || "",
      femurs: analyse.femurs || "",
      cage_thoracique: analyse.cage || analyse.cage_thoracique || "",
      recommandation_principale: analyse.conseil || analyse.recommandation_principale || "",
    },
    correction: {
      groupes_prioritaires: correction.groupes || correction.groupes_prioritaires || [],
      note: correction.note || correction.frequence_supplementaire || "",
    },
    numero: (cycles?.length || 0) + 1,
    objectif: form.objectif,
    nutrition: parsed.nutrition || {},
    dateDebut: new Date().toLocaleDateString("fr-FR"),
    duree_semaines: parsed.programme.duree_semaines || 8,
    progression: typeof parsed.programme.progression === "string"
      ? { semaines_1_2: parsed.programme.progression }
      : (parsed.programme.progression || {}),
    jours: parsed.programme.seances.map((s, i) => ({
      id: i + 1,
      nom: s.jour || `Séance ${i + 1}`,
      focus: s.focus || "",
      duree: s.duree || "50 min",
      intensite: s.intensite || "modere",
      type_seance: s.type_seance || "corps_entier",
      note_seance: s.note || s.note_seance || "",
      exercices: (s.exercices || []).map((ex) => ({
        ...ex,
        series: ex.series || ex.s || "3",
        reps: ex.reps || ex.r || "10",
        repos: ex.repos || "90s",
        historique: [],
        note: "",
      })),
      complete: false,
      date: null,
      note: "",
    })),
  };
}

export function buildCalendarFromProgram(prog, INT) {
  const today = new Date();
  const joursMap = { lun: 1, mar: 2, mer: 3, jeu: 4, ven: 5, sam: 6, dim: 0 };
  const newSess = {};
  prog.jours.forEach((jour) => {
    const match = Object.entries(joursMap).find(([k]) => jour.nom.toLowerCase().startsWith(k));
    if (!match) return;
    const dayNum = match[1];
    for (let w = 0; w < 8; w++) {
      const dateObj = new Date(today);
      dateObj.setDate(dateObj.getDate() + ((dayNum - dateObj.getDay() + 7) % 7 || 7) + w * 7);
      const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
      newSess[key] = {
        nom: jour.focus || jour.nom,
        intensite: jour.intensite || "modere",
        color: INT[jour.intensite || "modere"]?.c || "#3b82f6",
      };
    }
  });
  return newSess;
}

export function summarizeProgramLoads(prog) {
  const chargesResume = [];
  prog.jours.forEach((j) =>
    j.exercices.forEach((ex) => {
      if (ex.historique?.length > 0) {
        const max = Math.max(...ex.historique.map((h) => parseFloat(h.poids) || 0));
        if (max > 0) chargesResume.push(`${ex.nom.split(" ")[0]}: ${max}kg`);
      }
    })
  );
  return chargesResume.slice(0, 5).join(", ");
}

export async function callGenerateAPI({ photos, promptText }) {
  const content = [];
  for (const src of photos) {
    if (!src) continue;
    const compressed = await compressImage(src, 800, 0.65);
    const b64 = compressed.split(",")[1];
    content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } });
  }
  content.push({ type: "text", text: promptText });
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 5000,
      messages: [{ role: "user", content }],
    }),
  });
  if (!res.ok) {
    const errTxt = await res.text();
    throw new Error(`API ${res.status}: ${errTxt.substring(0, 100)}`);
  }
  const apiData = await res.json();
  if (apiData.error) throw new Error(apiData.error.message || "Erreur API");
  return apiData.content.map((i) => i.text || "").join("").trim();
}

export const LOAD_MESSAGES = [
  "📸 Analyse de votre morphologie en cours…",
  "🦴 Détection des proportions et déséquilibres…",
  "💪 Identification de vos points forts et axes de progression…",
  "🧬 Calcul de votre profil biomécanique…",
  "📋 Sélection des exercices adaptés à votre profil…",
  "⚖️ Équilibrage du volume et de l'intensité…",
  "🎯 Adaptation aux pathologies déclarées…",
  "📈 Construction de la progression sur 8 semaines…",
  "🍽️ Calcul de vos besoins nutritionnels personnalisés…",
  "✨ Finalisation de votre programme sur-mesure…",
];
