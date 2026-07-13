// ─── API : /api/coach-chat ──────────────────────────────────────────────────
// Chat du coach : le system prompt est construit ICI (plus côté client) et la
// connaissance MorphoCoach est routée par mots-clés selon la question posée.
// Le bot CONSEILLE et EXPLIQUE ; il ne génère jamais de programme en chat
// (→ onglet Programme) et ne délivre pas de plan alimentaire complet
// (→ Bilan PRO).

import { guard, checkAccess } from "./_lib/security.js";
import { callAnthropic } from "./_lib/anthropic.js";
import { BOT_EMS, BOT_OCCLUSION, BOT_POTENTIATION, BOT_ZONE_BRULE_GRAISSE,
         BOT_RECUP_SOMMEIL, BOT_TEMPERATURE } from "./_knowledge/bot/curiosites.js";
import { BOT_COMPLEMENTS, BOT_NUTRITION } from "./_knowledge/bot/nutrition_complements.js";
import { BOT_MORPHO, BOT_INSERTIONS, BOT_PATHO, BOT_EPAULE_DOS_C7,
         BOT_REF_PECS, BOT_REF_DOS, BOT_REF_JAMBES, BOT_REF_BRAS, BOT_CORRECTEURS,
         BOT_STAGNATION, BOT_VOLUME, BOT_PERIODISATION, BOT_RECUP_COMPLET,
         BOT_INTENSIFICATION, BOT_MENTAL, BOT_COMBAT_EXPERT } from "./_knowledge/bot/expertise.js";

export const config = { api: { bodyParser: { sizeLimit: "1mb" } } };

// ─── Routage de connaissance par mots-clés ──────────────────────────────────
// Ordre = priorité : les routes spécifiques d'abord, les générales ensuite.
const ROUTES = [
  // Curiosités & techniques pointues
  { re: /electro.?stim|\bems\b|stimulateur/i,                          mod: () => BOT_EMS },
  { re: /occlusion|\bbfr\b|blood.?flow|bandes? de restriction/i,       mod: () => BOT_OCCLUSION },
  { re: /potentiation|\bpap\b|post.?activation/i,                      mod: () => BOT_POTENTIATION },
  { re: /brule.?graisse|lipox|cardio.*(graisse|maigrir|jeun)|zone.*cardio|hiit.*graisse/i, mod: () => BOT_ZONE_BRULE_GRAISSE },
  { re: /drop.?set|rest.?pause|superset|cluster|pre.?fatigue|intensification|congestion|serie geante/i, mod: () => BOT_INTENSIFICATION },

  // Morphologie & insertions
  { re: /morpho|levier|humerus|femur|tibia|clavicule|cage thoracique|bassin|carrure|ossature|meme exercice|pas les memes resultats|bati/i, mod: () => BOT_MORPHO },
  { re: /insertion|muscle court|muscle long|genetique|pic du biceps|plafond|point faible|abdos en (6|8|four)/i, mod: () => BOT_INSERTIONS },
  { re: /valgus|pronation|supination|barre ez|barre droite.*(mal|poignet|coude)|un bras|unilateral|machine.*(biceps|guidee)|poids libre/i, mod: () => BOT_REF_BRAS },

  // Muscles / exercices
  { re: /pec|developpe couche|developpe incline|ecarte|dips|butterfly|rebond|poitrine/i, mod: () => BOT_REF_PECS },
  { re: /\bdos\b|traction|tirage|rowing|dorsa|grand rond|trapeze|largeur|epaisseur|pull.?over/i, mod: () => BOT_REF_DOS },
  { re: /jambe|squat|presse|fente|ischio|quadri|mollet|leg curl|leg extension|hack|souleve de terre/i, mod: () => BOT_REF_JAMBES },
  { re: /biceps|triceps|curl|avant.?bras|extension nuque/i,            mod: () => BOT_REF_BRAS },
  { re: /epaule|deltoide|elevation|developpe (militaire|nuque)|coiffe|face pull|arriere d.?epaule/i, mod: () => BOT_EPAULE_DOS_C7 + "\n\n" + BOT_CORRECTEURS },

  // Sécurité & pathologies
  { re: /douleur|mal (a|au|aux)|blessure|pathologie|hernie|lombalgie|sciatique|tendinite|menisque|lca|arthrose|epicondylite|canal carpien|conflit|acromial|ceinture de force|age|45 ans|50 ans/i, mod: () => BOT_PATHO },

  // Progression, volume, périodisation
  { re: /stagn|plateau|progresse plus|regress|rattrapage|reprendre|reprise|arret|coupure|point faible|fonctionne plus|marche plus|5 difficultes|muscle en retard|donnant|changer de programme|programme.*(durer|changer)/i, mod: () => BOT_STAGNATION },
  { re: /combien de serie|volume|\bmev\b|\bmrv\b|repos entre|\brpe\b|\brir\b|tempo|repetition|full.?body|split|half.?body|deload|frequence/i, mod: () => BOT_VOLUME },
  { re: /periodisation|mesocycle|bloc|1rm|force max|explosi|puissance|plyo|excentrique|isometrique|concentrique|cardio.*muscle|force d.?abord|masse d.?abord|quel ordre/i, mod: () => BOT_PERIODISATION },

  // Récupération & mental
  { re: /courbature|recup|sommeil|surentrainement|fatigue|melatonine|dormir|echauffement|tendon/i, mod: () => BOT_RECUP_COMPLET },
  { re: /froid|meteo|articulation.*(douleur|mal)|hiver|temperature/i,  mod: () => BOT_TEMPERATURE },
  { re: /motiv|mental|abandon|decourag|comparer|discipline|adherence|envie|craquage|emotion|miracle|fixer un objectif|objectif trop|seance.*(longue|trop)|decroche/i, mod: () => BOT_MENTAL },

  // Combat
  { re: /combat|boxe|mma|judo|jjb|jiu|lutte|karat|taekwondo|kick|muay|grappling|frappe|prehension|relachement|circuit|respir/i, mod: () => BOT_COMBAT_EXPERT },

  // Compléments & nutrition (générales, en dernier)
  { re: /creatine|whey|caseine|bcaa|proteine en poudre|complement|supplement|cafeine|citrulline|bicarbonate|booster|boire|boisson|hydrat/i, mod: () => BOT_COMPLEMENTS },
  { re: /calorie|macro|proteine|glucide|lipide|seche|prise de masse|refeed|cheat|manger|repas|nutrition|regime|maigrir|deficit/i, mod: () => BOT_NUTRITION },
];

// Fallback recup/sommeil léger conservé pour compat
const LEGACY = [{ re: /$^/, mod: () => BOT_RECUP_SOMMEIL }];

function routeKnowledge(messages) {
  const lastUsers = (messages || [])
    .filter(m => m.role === "user").slice(-2)
    .map(m => String(m.content || "")).join(" ")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const mods = new Set();
  for (const r of ROUTES) {
    if (mods.size >= 3) break;          // 3 modules max → prompt maîtrisé
    if (r.re.test(lastUsers)) mods.add(r.mod());
  }
  return [...mods].join("\n\n");
}

function buildSystem({ contexte, knowledge }) {
  const c = contexte || {};
  const b = c.bilan || {};
  return `Tu es le Coach IA de MorphoCoach : spécialiste de la nutrition sportive ET des questions de science de l'entraînement (récupération, techniques, compléments, mythes du fitness).

PROFIL DE L'UTILISATEUR :
- Prénom : ${c.prenom || "l'utilisateur"} | Objectif : ${c.objectif || "non défini"}
- Cible calorique : ${c.calObj || "—"} kcal/j | Macros cibles : P ${c.pObj || "—"}g · G ${c.gObj || "—"}g · L ${c.lObj || "—"}g

BILAN NUTRITION 14 JOURS : score ${b.score ?? "—"}/10 · ${b.avgKcal ? Math.round(b.avgKcal) : "—"} kcal/j (${b.pctKcal ?? 0}% de la cible) · ${b.nbLogged ?? "—"}/${b.totalDays ?? 14} jours loggés · P ${b.avgProt ? Math.round(b.avgProt) : "—"}g · G ${b.avgGluc ? Math.round(b.avgGluc) : "—"}g · L ${b.avgLip ? Math.round(b.avgLip) : "—"}g
${knowledge ? `\n═══ CONNAISSANCE MORPHOCOACH PERTINENTE POUR CETTE QUESTION ═══\n${knowledge}\n(Utilise cette connaissance en priorité : elle fait autorité chez MorphoCoach.)` : ""}

RÈGLES STRICTES :
1. Réponses courtes, directes, personnalisées avec les données réelles du bilan quand c'est pertinent.
2. Tu peux répondre aux questions de science de l'entraînement (techniques, récupération, mythes) — mais tu ne GÉNÈRES JAMAIS de programme en chat : pour un programme personnalisé, redirige vers l'onglet Programme (analyse morpho + historique complet).
3. Pour un plan alimentaire complet chiffré jour par jour : indique que c'est le rôle du Bilan PRO ; ici tu donnes des conseils et des repères.
4. Jamais de prescription médicale, jamais de diagnostic, jamais de régime extrême, jamais de produit dopant. Douleur persistante → professionnel de santé.
5. Ton : coach bienveillant, factuel, sans jugement. Tutoiement.`;
}

export default async function handler(req, res) {
  const g = guard(req, res);
  if (!g.ok) return g.error ? res.status(g.status).json({ error: g.error }) : res.status(g.status).end();

  const access = await checkAccess(req);
  if (!access.ok) return res.status(access.status).json({ error: access.error });

  const { messages, contexte } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0)
    return res.status(400).json({ error: "Messages manquants" });
  if (JSON.stringify(messages).length > 60_000)
    return res.status(400).json({ error: "Conversation trop longue" });

  const clean = messages
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-16)
    .map(m => ({ role: m.role, content: m.content.substring(0, 4000) }));

  try {
    const knowledge = routeKnowledge(clean);
    const raw = await callAnthropic({
      model: "claude-sonnet-4-6",
      maxTokens: 1000,
      system: buildSystem({ contexte, knowledge }),
      messages: clean,
    });
    return res.status(200).json({ answer: raw });
  } catch (e) {
    console.error("[coach-chat]", e.message);
    return res.status(e.status || 500).json({ error: e.message || "Erreur serveur" });
  }
}
