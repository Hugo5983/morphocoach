// Régénère src/data/mesocycle.js depuis api/_knowledge/noyau.js.
// À relancer après toute modification de la logique de mésocycle.
import fs from "node:fs";
const src = fs.readFileSync(new URL("../api/_knowledge/noyau.js", import.meta.url), "utf8");
const entete = `// ─── MÉSOCYCLE — COPIE CLIENT ───────────────────────────────────────────────
// Copie de api/_knowledge/noyau.js pour un usage hors ligne côté application.
// Régénérer : node scripts/gen-mesocycle.mjs
//
// Une seule source de vérité : la périodisation affichée à l'athlète doit être
// EXACTEMENT celle envoyée à l'IA.

`;
fs.writeFileSync(new URL("../src/data/mesocycle.js", import.meta.url), entete + src);
console.log("mesocycle.js régénéré depuis le noyau");
