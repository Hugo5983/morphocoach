// ─── scripts/fetch-offer-photos.mjs ───────────────────────────────────────────
// Résout les photos de la page « Offre du moment » via l'endpoint Pexels
// direct par ID (/v1/photos/{id}) et fige le résultat dans
// src/data/offerPhotoManifest.json.
//
// Différent de fetch-photos.mjs (recettes) :
//  - 2 photos figées, pas 549 → aucun quota, aucun batching, exécution < 2s.
//  - IDs choisis à la main pour garantir un rendu marketing stable — pas de
//    recherche par mot-clé, pas de contrôle qualité par description.
//  - Endpoint https://api.pexels.com/v1/photos/{id} (au lieu de /search).
//
// L'URL de la photo est déjà pré-remplie dans le manifest à la création
// (pattern stable `pexels-photo-{ID}.jpeg` sur le CDN), donc l'app affiche
// les images IMMÉDIATEMENT après déploiement, sans attendre le workflow.
// Ce script vient seulement compléter `author` / `alt` / `link` (crédits
// photographe + description) au premier passage horaire.
//
// Reprise automatique : les entrées déjà complètes (v: 2) sont ignorées.
// Un ID Pexels erroné → API 404, on log l'erreur et on passe à la suivante.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = path.join(__dirname, "..", "src", "data", "offerPhotoManifest.json");

const KEY = process.env.PEXELS_API_KEY;
if (!KEY) {
  console.error("✗ PEXELS_API_KEY manquante (secret GitHub Actions non configuré).");
  process.exit(1);
}

const FORCE = process.argv.includes("--force");
const DELAY_MS = 400;

function readManifest() {
  try { return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")); }
  catch { return {}; }
}
function writeManifest(m) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(m, null, 1) + "\n", "utf8");
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchPhotoById(id) {
  const url = `https://api.pexels.com/v1/photos/${id}`;
  const r = await fetch(url, { headers: { Authorization: KEY } });
  if (r.status === 404) return { error: "id_inconnu" };
  if (r.status === 429) return { error: "quota_depasse" };
  if (!r.ok) return { error: `pexels_${r.status}` };
  const photo = await r.json();
  const brute = photo.src?.large || photo.src?.medium || photo.src?.original || null;
  return {
    // URL SANS paramètres de taille : c'est le hook côté app qui choisit
    // la taille à l'affichage via les paramètres CDN Pexels.
    url: brute ? brute.split("?")[0] : null,
    author: photo.photographer || null,
    alt: photo.alt || null,
    link: photo.url || null,
  };
}

async function main() {
  const manifest = readManifest();
  const cles = Object.keys(manifest);
  const restant = cles.filter(k => FORCE || manifest[k]?.v !== 2);

  console.log(`${cles.length} offre(s) au total · ${cles.length - restant.length} déjà résolue(s) · ${restant.length} restante(s)`);

  if (!restant.length) {
    console.log("Rien à faire — toutes les photos d'offres sont déjà résolues.");
    return;
  }

  let ok = 0, echec = 0;

  for (const k of restant) {
    const entree = manifest[k];
    const id = entree?.pexelsId;
    if (!id) {
      console.warn(`✗ ${k} : pas de pexelsId, ignoré`);
      echec++;
      continue;
    }
    const res = await fetchPhotoById(id);
    if (res.error) {
      console.warn(`✗ ${k} (ID ${id}) : ${res.error}`);
      manifest[k] = { ...entree, error: res.error, v: 2 };
      echec++;
    } else {
      manifest[k] = {
        pexelsId: id,
        url: res.url || entree.url,        // garde l'URL pré-remplie si absente de la réponse
        author: res.author,
        alt: res.alt,
        link: res.link,
        v: 2,
      };
      console.log(`✓ ${k} (ID ${id}) → ${res.author || "?"}`);
      ok++;
    }
    await sleep(DELAY_MS);
  }

  writeManifest(manifest);
  console.log(`\n${ok} photo(s) résolue(s) · ${echec} en erreur`);
}

main().catch(e => { console.error("Erreur :", e); process.exit(1); });
