// ─── API : /api/analyze-morpho ──────────────────────────────────────────────
// V2 : Haiku 4.5 (coût ÷10), few-shot, détection qualité photo, schéma élargi
// (proportions + répartition graisse). Les photos transitent vers l'API puis
// sont oubliées. Le client stocke la fiche retournée.

import { guard, checkAccess } from "./_lib/security.js";
import { callAnthropic, parseJSON } from "./_lib/anthropic.js";
import { logMorphoEvent } from "./_lib/telemetry.js";
import { buildBaseBlock } from "./_lib/knowledge-base.js";
import { SCHEMA_OBSERVATIONS, REPERES_VISUELS, validerObservations, deriverConsequences }
  from "./_knowledge/morphologie.js";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

const FICHE_VERSION = 2;

function schemaToPrompt() {
  const S = SCHEMA_OBSERVATIONS;
  const section = (obj) => Object.entries(obj).map(([k, v]) => `"${k}": "${v.join(" | ")}"`).join(",\n    ");
  const rep = S.repartition.groupes.map(g => `"${g}": "${S.repartition.valeurs.join(" | ")}"`).join(",\n    ");
  return `{
  "qualite_photo": "bonne | acceptable | floue | sombre | trop_loin | partielle",
  "leviers": {
    ${section(S.leviers)}
  },
  "insertions": {
    ${section(S.insertions)}
  },
  "physique": {
    ${section(S.physique)}
  },
  "proportions": {
    ${section(S.proportions)}
  },
  "posture": ["parmi: ${S.posture.items.join(", ")} — uniquement si clairement visible"],
  "repartition": {
    ${rep}
  },
  "confiance": "${S.confiance.join(" | ")}"
}`;
}

// Few-shot : 2 exemples de sortie correcte pour guider le modèle
const FEW_SHOT = `
EXEMPLE 1 (homme 25 ans, sec, carrure moyenne) :
{"qualite_photo":"bonne","leviers":{"humerus":"long","avant_bras":"moyen","femur":"moyen","tibia":"moyen","clavicules":"moyennes","cage_thoracique":"plate","bassin":"moyen"},"insertions":{"biceps":"haute","mollets":"haute","pectoraux":"moyenne","abdominaux":"basse","ischios":"moyenne","avant_bras":"moyenne"},"physique":{"masse_grasse_visuelle":"sec","densite_musculaire":"intermediaire","repartition_graisse":"androide"},"proportions":{"rapport_epaules_taille":"vtaper_moyen","rapport_tronc_jambes":"equilibre","symetrie_gauche_droite":"symetrique","position_pieds_naturelle":"paralleles"},"posture":["antepulsion_scapulaire"],"repartition":{"quadriceps":"equilibre","ischios":"en_retard","mollets":"en_retard","pectoraux":"equilibre","dos_largeur":"en_retard","dos_epaisseur":"equilibre","epaules":"equilibre","biceps":"dominant","triceps":"equilibre","abdos":"equilibre"},"confiance":"haute"}

EXEMPLE 2 (femme 32 ans, moyen, débutante) :
{"qualite_photo":"acceptable","leviers":{"humerus":"moyen","avant_bras":"court","femur":"long","tibia":"court","clavicules":"etroites","cage_thoracique":"moyenne","bassin":"large"},"insertions":{"biceps":"moyenne","mollets":"moyenne","pectoraux":"indetermine","abdominaux":"indetermine","ischios":"indetermine","avant_bras":"indetermine"},"physique":{"masse_grasse_visuelle":"moyen","densite_musculaire":"debutant","repartition_graisse":"gynoide"},"proportions":{"rapport_epaules_taille":"vtaper_faible","rapport_tronc_jambes":"jambes_longues","symetrie_gauche_droite":"symetrique","position_pieds_naturelle":"rotation_externe"},"posture":["hyperlordose","bascule_bassin"],"repartition":{"quadriceps":"equilibre","ischios":"en_retard","mollets":"indetermine","pectoraux":"indetermine","dos_largeur":"en_retard","dos_epaisseur":"indetermine","epaules":"indetermine","biceps":"indetermine","triceps":"indetermine","abdos":"en_retard"},"confiance":"moyenne"}
`;

export default async function handler(req, res) {
  const g = guard(req, res);
  if (!g.ok) return g.error ? res.status(g.status).json({ error: g.error }) : res.status(g.status).end();

  const access = await checkAccess(req);
  if (!access.ok) return res.status(access.status).json({ error: access.error });

  const { photos, profil } = req.body || {};
  const imgs = (Array.isArray(photos) ? photos : []).filter(p => typeof p === "string" && p.length > 100).slice(0, 3);
  if (imgs.length === 0) return res.status(400).json({ error: "Au moins une photo requise" });
  for (const p of imgs) {
    if (p.length > 3_000_000) return res.status(400).json({ error: "Photo trop lourde (compresser côté client)" });
  }

  // ─── Injection base MorphoCoach en TÊTE du content ────────────────────
  // Sonnet lit les leviers, insertions et postures AVEC toute la connaissance
  // MorphoCoach en tête (moteur d'orchestration étape 1, C2 sécurité morpho,
  // C6 leviers fins, C10 rattrapage). Le premier bloc porte cache_control :
  // il est stocké 1 h côté Anthropic, et surtout il est IDENTIQUE au premier
  // bloc envoyé par generate-program → si l'utilisateur enchaîne analyse
  // morpho puis génération, la génération bénéficie du cache écrit ici.
  const baseBlock = buildBaseBlock("1h");
  const content = [
    ...baseBlock,
    ...imgs.map(p => ({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: p.replace(/^data:image\/\w+;base64,/, "") },
    })),
  ];

  content.push({
    type: "text",
    text: `Tu es l'œil d'un coach sportif expert en morpho-anatomie. Analyse ces photos de posture (face/dos/profil, dans le désordre) d'une personne (${profil?.sexe || "?"}, ${profil?.age || "?"} ans).

Tu as reçu EN AMONT ta base de connaissance MorphoCoach complète. La section
1 du moteur d'orchestration ("Lecture morphologique des photos") et le
chapitre C2 (couche sécurité & personnalisation morpho) DÉCRIVENT
exactement ce que tu dois lire et comment. Applique-les à la lettre.

ÉTAPE 1 — QUALITÉ PHOTO
Évalue d'abord la qualité globale des photos :
- "bonne" : éclairage correct, corps entier visible, poses claires
- "acceptable" : quelques détails difficiles mais exploitable
- "floue" : image trop floue pour une analyse fiable
- "sombre" : éclairage insuffisant
- "trop_loin" : personne trop petite dans le cadre
- "partielle" : parties du corps coupées
Si qualite_photo est "floue", "sombre", "trop_loin" ou "partielle", mets TOUS les champs à "indetermine" et confiance à "faible".

⛔ LA POSTURE SE LIT SUR LES PHOTOS, ELLE NE SE DÉDUIT PAS ⛔
Tu ne connais NI le métier, NI le mode de vie de cette personne, et c'est
volontaire. Ne coche une posture que si tu la VOIS :
- antepulsion_scapulaire : de PROFIL, les épaules sont en avant de l'axe de
  l'oreille et du bassin ; de FACE, les paumes regardent vers l'arrière.
- cyphose : de PROFIL, courbure dorsale marquée, sternum affaissé.
- hyperlordose : de PROFIL, creux lombaire accentué, bassin basculé vers
  l'avant, fesses projetées en arrière.
- bascule_bassin : de PROFIL, l'épine iliaque antérieure est nettement plus
  BASSE que la postérieure.
- valgus_genou : de FACE, les genoux convergent vers l'intérieur.
- epaule_asymetrique : de FACE ou de DOS, une épaule visiblement plus haute.
- rotation_bassin : de FACE, une crête iliaque plus haute ou plus avancée.

Si l'angle de prise de vue ne permet pas de trancher (pas de profil net,
vêtement ample, cadrage partiel), NE COCHE PAS. Une posture supposée
entraîne des exercices imposés pendant six semaines : le coût d'une
fausse détection est réel.

⚠ IMPORTANT — "indetermine" est une EXCEPTION, pas un réflexe.
Si la photo est exploitable, tu DOIS te prononcer : un coach expérimenté lit des
proportions sur une photo correcte, c'est son métier. Réserve "indetermine" aux
traits réellement invisibles sur ces photos précises (par exemple les insertions
sous un vêtement ample). Une fiche entièrement "indetermine" sur des photos
exploitables est un ÉCHEC d'analyse : elle prive le programme de toute
personnalisation morphologique.
Renseigne en particulier "repartition" pour les 10 groupes musculaires : c'est
elle qui détermine les points faibles à prioriser dans le programme.

ÉTAPE 2 — ANALYSE MORPHOLOGIQUE
Tu classes chaque trait dans des CATÉGORIES FERMÉES. JAMAIS de mesure, JAMAIS de chiffre.
${REPERES_VISUELS}

${FEW_SHOT}

Réponds UNIQUEMENT avec ce JSON (aucun texte avant/après, aucun markdown). Chaque valeur DOIT être exactement l'une des valeurs listées :
${schemaToPrompt()}`,
  });

  try {
    const raw = await callAnthropic({
      // Sonnet et non Haiku : lire des leviers osseux et des insertions sur
      // photo est une tâche de vision fine. Haiku répondait "indetermine"
      // partout, ce qui produisait une fiche techniquement valide mais VIDE —
      // et donc un programme généré sans aucune donnée morphologique.
      model: "claude-sonnet-4-6",
      maxTokens: 2000,
      system: "Tu es un expert en lecture morphologique visuelle pour le coaching sportif. Tu réponds UNIQUEMENT en JSON valide avec les valeurs d'énumération exactes demandées. Au moindre doute tu réponds \"indetermine\" — tu n'inventes jamais. Tu évalues TOUJOURS la qualité des photos en premier.",
      content,
    });

    const parsed = parseJSON(raw);

    // ── Détection qualité insuffisante ──
    const qualite = parsed.qualite_photo || "indetermine";
    const MAUVAISE_QUALITE = ["floue", "sombre", "trop_loin", "partielle"];
    if (MAUVAISE_QUALITE.includes(qualite)) {
      const MESSAGES = {
        floue: "Les photos sont trop floues pour une analyse fiable. Reprends-les dans un endroit bien éclairé, téléphone stable.",
        sombre: "L'éclairage est insuffisant. Place-toi face à une fenêtre ou allume toutes les lumières de la pièce.",
        trop_loin: "Tu es trop loin de l'appareil photo. Demande à quelqu'un de te photographier à 2 mètres de distance.",
        partielle: "Certaines parties du corps sont coupées. Assure-toi que le cadre montre ton corps entier, des pieds à la tête.",
      };
      return res.status(422).json({
        error: "qualite_insuffisante",
        qualite,
        message: MESSAGES[qualite] || "La qualité des photos est insuffisante pour une analyse fiable. Reprends-les.",
        conseil: "Prends 3 photos (face, dos, profil) dans un endroit bien éclairé, vêtements ajustés, corps entier visible.",
      });
    }

    const observations = validerObservations(parsed);
    const consequences = deriverConsequences(observations);

    // Une fiche sans AUCUNE observation exploitable est un échec silencieux :
    // on le rend visible plutôt que de générer un programme "aveugle".
    const traits = [
      ...Object.values(observations.leviers || {}),
      ...Object.values(observations.insertions || {}),
      ...Object.values(observations.physique || {}),
      ...Object.values(observations.proportions || {}),
      ...Object.values(observations.repartition || {}),
    ];
    const renseignes = traits.filter(v => v && v !== "indetermine").length;
    const exploitabilite = traits.length ? Math.round((renseignes / traits.length) * 100) : 0;

    const fiche = {
      version: FICHE_VERSION,
      date: new Date().toISOString().split("T")[0],
      observations,
      consequences,
      confiance: observations.confiance,
      qualite_photo: qualite,
      exploitabilite,          // % de traits réellement renseignés
      vide: renseignes === 0,  // aucune donnée : le programme sera générique
    };
    logMorphoEvent({ userId: access.userId, fiche, status: "ok" }); // fire-and-forget
    return res.status(200).json({ fiche });
  } catch (e) {
    console.error("[analyze-morpho]", e.message);
    return res.status(e.status || 500).json({ error: e.message || "Erreur serveur" });
  }
}
