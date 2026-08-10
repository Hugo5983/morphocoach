// Vérifie la lecture des temps de repos écrits en texte.
// Le bug d'origine : "60-90s" devenait 6090 secondes → minuteur de 101 min 30 s.
//   node scripts/test-durees.mjs
import { reposEnSecondes, formaterDuree, minutesDepuisTexte } from "../src/utils/duree.js";

let ok = 0, ko = 0;
const check = (nom, cond, detail = "") => {
  if (cond) { ok++; console.log(`  ✅ ${nom}`); }
  else { ko++; console.log(`  ❌ ${nom}${detail ? ` — ${detail}` : ""}`); }
};
const eq = (entree, attendu) => {
  const r = reposEnSecondes(entree);
  check(`"${entree}" → ${attendu} s (${formaterDuree(attendu)})`, r === attendu, `obtenu ${r} s`);
};

console.log("\n=== Le bug constaté en séance ===");
eq("60-90s", 90);     // avant : 6090 s = 101 min 30 s
eq("45-60s", 60);     // avant : 4560 s = 76 min
eq("90-120s", 120);   // avant : 90120 s

console.log("\n=== Repos exprimés en minutes ===");
eq("2 min", 120);     // avant : 2 secondes
eq("1-2 min", 120);   // avant : 12 secondes
eq("3 à 5 minutes", 300);
eq("3 min", 180);
eq("2,5 min", 150);

console.log("\n=== Formats simples ===");
eq("90s", 90);
eq("120s", 120);
eq("90", 90);
eq(120, 120);
eq("1:30", 90);
eq("2:00", 120);
eq("45 sec", 45);

console.log("\n=== Valeurs aberrantes → repli sur le défaut ===");
check("Vide → 90 s", reposEnSecondes("") === 90);
check("null → 90 s", reposEnSecondes(null) === 90);
check("Texte sans chiffre → 90 s", reposEnSecondes("au feeling") === 90);
check("Valeur délirante (2 h) → 90 s", reposEnSecondes("7200s") === 90);
check("Défaut personnalisé respecté", reposEnSecondes("", 45) === 45);
check("Jamais en dessous de 5 s", reposEnSecondes("2s") === 90);

console.log("\n=== Minutes depuis un texte libre ===");
check('"3 min" → 3', minutesDepuisTexte("3 min") === 3);
check('"45 s" → 0,75', Math.abs(minutesDepuisTexte("45 s") - 0.75) < 0.01);
check('"15 répétitions" → null (aucune durée)', minutesDepuisTexte("15 répétitions") === null);
check('"2 × 15" → null', minutesDepuisTexte("2 × 15") === null);

console.log(`\n${"─".repeat(50)}\nRÉSULTAT : ${ok} réussis, ${ko} échoués\n`);
process.exit(ko ? 1 : 0);
