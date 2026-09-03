// ─── BASE DE CONNAISSANCE MORPHOCOACH — CHARGEUR ────────────────────────────
// Charge le PDF (181 pages, ~55 000 tokens) UNE FOIS au démarrage du worker
// serverless, puis expose la même chaîne à tous les appels. Le fichier est
// lu depuis le disque via readFileSync au niveau module : Vercel exécute
// ce code UNE fois par cold start, puis conserve la constante en mémoire
// tant que l'instance reste chaude.
//
// La base est identique pour tous les appels et pour tous les utilisateurs
// → elle sera envoyée à l'API Anthropic avec cache_control (5 min ou 1 h)
// pour ne payer qu'une fois par fenêtre de cache, quel que soit le nombre
// d'utilisateurs qui génèrent un programme dans l'intervalle.
//
// IMPORTANT : le fichier .txt doit être présent au déploiement Vercel.
// vercel.json déclare explicitement includeFiles pour garantir son upload.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_PATH = path.join(__dirname, "..", "_knowledge", "base-morphocoach.txt");

// Chargement au boot. En cas d'échec on log mais on n'explose pas :
// la génération peut toujours tourner sans la base (dégradation gracieuse),
// c'est le comportement historique avant cette V4.
let BASE_TEXT = "";
try {
  BASE_TEXT = fs.readFileSync(BASE_PATH, "utf-8");
  console.log(`[knowledge-base] Base chargée : ${BASE_TEXT.length.toLocaleString()} caractères`);
} catch (err) {
  console.error(`[knowledge-base] ÉCHEC chargement ${BASE_PATH} :`, err.message);
  console.error("[knowledge-base] Le pipeline tournera SANS la base — programmes moins riches.");
}

/**
 * Retourne le texte complet de la base MorphoCoach (181 pages).
 * Chaîne vide si le fichier n'a pas pu être chargé (mode dégradé).
 */
export function getBaseMorphoCoach() {
  return BASE_TEXT;
}

/**
 * Indique si la base est disponible. À tester avant d'inclure le bloc
 * cache dans le prompt, pour ne pas envoyer un cache_control vide.
 */
export function hasBaseMorphoCoach() {
  return BASE_TEXT.length > 1000;
}

/**
 * Construit le bloc "connaissance" à placer EN TÊTE du content Anthropic,
 * avec cache_control activé. Le bloc est identique pour tous les appels :
 * c'est ce qui permet au cache Anthropic d'être partagé entre les
 * utilisateurs simultanés (même préfixe = même clé de cache).
 *
 * @param {"5m"|"1h"} ttl durée de vie du cache (défaut : 1 h)
 * @returns {Array} tableau de blocs à concaténer devant le content de l'appel
 */
export function buildBaseBlock(ttl = "1h") {
  if (!hasBaseMorphoCoach()) return [];
  const cacheControl = ttl === "1h"
    ? { type: "ephemeral", ttl: "1h" }
    : { type: "ephemeral" };  // 5 min par défaut côté Anthropic

  return [{
    type: "text",
    text: `═══════════════════════════════════════════════════════════════════════
BASE DE CONNAISSANCE MORPHOCOACH — 181 pages, distillées par Hugo
═══════════════════════════════════════════════════════════════════════
Ceci est TA base de référence de coach expert. Tu la consultes pour
CHAQUE décision, comme un coach humain ouvre son manuel à la bonne page.
Le pipeline (données athlète + morpho + objectif + matériel) qui suit
CETTE base doit être exécuté À LA LUMIÈRE de son contenu, jamais à
côté. Applique en particulier :
  - la CLÉ de hiérarchie (sécurité C2 prime sur objectif ; morpho filtre
    AVANT que l'objectif choisisse volume et intensité) ;
  - le pipeline en 7 étapes du "Moteur d'orchestration" ;
  - le référentiel détaillé du muscle cible quand l'objectif nomme un
    muscle précis (DOS / PECTORAUX / JAMBES / BRAS) ;
  - la couche C10 (rattrapage par muscle) chaque fois qu'un point
    faible est diagnostiqué visuellement OU déclaré verbalement.

────────────────── DÉBUT DE LA BASE ──────────────────
${getBaseMorphoCoach()}
────────────────── FIN DE LA BASE ────────────────────`,
    cache_control: cacheControl,
  }];
}
