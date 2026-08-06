// Régénère src/data/douleurs.js depuis api/_knowledge/douleurs.js.
// À relancer après toute modification des zones ou des lectures.
import fs from "node:fs";
const src = fs.readFileSync(new URL("../api/_knowledge/douleurs.js", import.meta.url), "utf8");
const entete = `// ─── DOULEURS — COPIE CLIENT ────────────────────────────────────────────────
// Copie de api/_knowledge/douleurs.js — ne pas éditer à la main.
// Régénérer : node scripts/gen-douleurs.mjs
//
// Une seule source de vérité : les zones, localisations et mouvements proposés
// à l'utilisateur DOIVENT être exactement ceux que le serveur sait interpréter.

`;
fs.writeFileSync(new URL("../src/data/douleurs.js", import.meta.url), entete + src);
console.log("douleurs.js régénéré depuis le serveur");
