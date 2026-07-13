// ─── scripts/fetch-photos.mjs ─────────────────────────────────────────────────
// Interroge Pexels UNE FOIS par recette et fige le résultat dans
// src/data/photoManifest.json. L'app ne parle plus jamais à Pexels ensuite :
// elle lit ce fichier, qui vit dans le dépôt comme n'importe quelle donnée.
//
// Pourquoi par lots (MAX_PER_RUN) : le quota gratuit Pexels est de 200
// requêtes/heure. Avec 549 recettes, il faut 3 exécutions (voir le workflow
// GitHub Actions associé, qui peut soit être relancé à la main, soit tourner
// tout seul chaque heure jusqu'à ce que tout soit résolu).
//
// Reprise automatique : les recettes déjà présentes dans le fichier ne sont
// jamais rappelées (sauf --force). Un run qui ne trouve plus rien à faire
// s'arrête immédiatement, sans consommer de quota.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RECIPES } from "../src/data/recipes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = path.join(__dirname, "..", "src", "data", "photoManifest.json");

const KEY = process.env.PEXELS_API_KEY;
if (!KEY) {
  console.error("✗ PEXELS_API_KEY manquante (secret GitHub Actions non configuré).");
  process.exit(1);
}

const MAX_PER_RUN = parseInt(process.env.MAX_PER_RUN || "180", 10); // marge sous 200/h
const DELAY_MS = 400;                                                // espace les appels
const FORCE = process.argv.includes("--force");

function readManifest() {
  try { return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")); }
  catch { return {}; }
}
function writeManifest(m) {
  const ordered = Object.fromEntries(
    Object.keys(m).sort((a, b) => +a - +b).map(k => [k, m[k]])
  );
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(ordered, null, 1) + "\n", "utf8");
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── CONTRÔLE QUALITÉ ──────────────────────────────────────────────────────────
// Prendre aveuglément le 1er résultat Pexels donnait parfois des photos sans
// rapport avec le plat. Pexels décrit chaque photo (champ `alt`) : on note
// désormais 6 candidats et on EXIGE qu'au moins un mot significatif de la
// requête figure dans la description. Aucun candidat valable → pas de photo,
// et l'app garde celle du catalogue (générique mais juste, plutôt que
// précise mais fausse).
function scorePhoto(photo, query) {
  const alt = (photo.alt || "").toLowerCase();
  if (!alt) return 0;
  const mots = query.toLowerCase().split(/[^a-z]+/).filter(w => w.length >= 3);
  return mots.filter(w => alt.includes(w)).length;
}

async function fetchPhoto(query) {
  const url =
    "https://api.pexels.com/v1/search" +
    `?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape`;
  const r = await fetch(url, { headers: { Authorization: KEY } });
  if (r.status === 429) return { error: "quota_depasse" };
  if (!r.ok) return { error: `pexels_${r.status}` };
  const data = await r.json();
  const candidats = (data?.photos || [])
    .map(ph => ({ ph, score: scorePhoto(ph, query) }))
    .filter(c => c.score >= 1)
    .sort((a, b) => b.score - a.score);
  if (!candidats.length) return { error: "aucun_resultat_pertinent" };
  const photo = candidats[0].ph;
  const brute = photo.src?.large || photo.src?.medium || photo.src?.original || null;
  return {
    // URL SANS paramètres de taille : c'est l'app qui choisit la taille à
    // l'affichage (petite pour les cartes, grande pour la fiche). Avant, on
    // figeait w=940 → 300 Ko par carte, d'où la lenteur.
    url: brute ? brute.split("?")[0] : null,
    author: photo.photographer || null,
    alt: photo.alt || null,
    link: photo.url || null,
  };
}

async function main() {
  const manifest = readManifest();
  const cible = RECIPES.filter(r => r.imgQuery);
  // v2 = choisi avec contrôle qualité (alt). Les entrées v1 (1er résultat brut)
  // sont re-résolues au fil des passages horaires, sans action manuelle.
  const restant = cible.filter(r => FORCE || manifest[r.id]?.v !== 2);

  console.log(`${cible.length} recettes au total · ${cible.length - restant.length} déjà résolues · ${restant.length} restantes`);

  if (!restant.length) {
    console.log("Rien à faire — toutes les photos sont déjà figées.");
    return;
  }

  const lot = restant.slice(0, MAX_PER_RUN);
  let ok = 0, echec = 0, quota = false;

  for (const r of lot) {
    if (quota) break;
    const res = await fetchPhoto(r.imgQuery);
    if (res.error === "quota_depasse") { quota = true; break; }
    if (res.url) {
      manifest[r.id] = { url: res.url, author: res.author, alt: res.alt,
                         q: r.imgQuery, v: 2 };
      ok++;
    } else {
      manifest[r.id] = { url: null, error: res.error, q: r.imgQuery, v: 2 };
      echec++;
    }
    await sleep(DELAY_MS);
  }

  writeManifest(manifest);

  const fait = cible.length - restant.length + ok + echec;
  console.log(`\n${ok} photo(s) trouvée(s) · ${echec} sans résultat` +
    (quota ? " · quota horaire atteint, arrêt propre" : ""));
  console.log(`Progression totale : ${fait}/${cible.length}`);
  if (fait < cible.length) {
    console.log("→ Relance le workflow (bouton « Run workflow ») pour continuer, " +
      "ou laisse le déclenchement automatique horaire s'en charger.");
  } else {
    console.log("→ Terminé : toutes les recettes ont une entrée dans photoManifest.json.");
  }
}

main().catch(e => { console.error("Erreur :", e); process.exit(1); });
