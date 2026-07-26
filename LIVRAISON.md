# MorphoCoach — Livraison V3 (post-audit)

Tout le contenu de ce zip se dépose **à la racine du dépôt** via l'interface
GitHub (« Add file → Upload files »), en conservant les dossiers. Les fichiers
de ton dépôt qui ne figurent pas dans ce zip ne doivent **pas** être touchés.

---

## 1. Ce qui est corrigé (référence audit)

| Réf | Problème | Correctif livré |
|---|---|---|
| R1 | `/api/generate-program` jamais déployé (mauvais dossier) | Recréé dans `api/` (racine Vercel). La génération passe du fallback local au vrai moteur Sonnet + Couche 0. |
| R2 | Deux arborescences serveur divergentes | `src/api/` supprimé — une seule source de vérité : `api/`. |
| R3 | `data/` fantôme à la racine | Supprimé — seule `src/data/` fait foi. |
| R4 | Proxy générique `/api/generate` (modèle + prompt au choix du client) | **Supprimé.** Remplacé par `/api/analyze-meal` dédié : prompt côté serveur, modèle imposé. |
| R5 | Photo repas sur Opus 4.1 (~10× trop cher) | `claude-haiku-4-5` imposé côté serveur ; totaux macros recalculés par le serveur (l'arithmétique n'est plus confiée au modèle). |
| R6 | Kill switch qui désinscrivait aussi `sw-morpho.js` | Ne désinscrit plus que l'ancien `sw.js` — les notifications survivent aux rechargements. |
| R7 | `manifest.json` absent (PWA non installable) | Recréé dans `public/`. ⚠ Fournir `public/icon-192.png` et `public/icon-512.png` s'ils n'existent pas déjà dans le dépôt. |
| R8 | Monétisation contournable (localStorage) | Chaîne serveur complète : JWT vérifié → table `entitlements` → quotas mensuels atomiques (`increment_usage`). **Permissif par défaut**, activation par variables d'env (voir §4). |
| R9 | Rate limiting décoratif | Conservé comme anti-rafale, mais la vraie protection des coûts est désormais le quota par utilisateur en base. |
| R10 | Injection de prompt via `contexte` du chat | `prenom`/`objectif` assainis (retours ligne retirés, longueur plafonnée), champs numériques coercés. |
| R12 | Décalage UTC du journal nutrition | Clé de date **locale** dans `NutritionPage` — une saisie à 0h30 ne part plus sur la veille. |
| R13 | Faux matchs d'exercices/aliments (comparaison à la 1ʳᵉ lettre) | `findExInDB` et `enrichItem` réécrits : exact → inclusion du nom complet → sinon aucun match. |
| R14 | Zéro test, zéro CI | `scripts/smoke-tests.mjs` (12 tests des fonctions serveur pures) + workflow GitHub Actions (tests + build à chaque push, visible dans l'onglet **Actions**). |
| — | **Boucle de feedback débranchée** (découverte pendant les travaux) | Le ressenti RPE/douleur/sensation saisi en fin d'exercice était **jeté** : `saveExoFeedback` n'avait aucun appelant. Rebranché — la couche « feedback corporel » du dossier athlète reçoit enfin des données. |

## 2. Moteur de génération — améliorations

- **Liste fermée d'exercices injectée dans le prompt** : ~60-70 candidats filtrés
  par matériel déclaré + niveau, depuis le nouveau catalogue serveur
  (`api/_knowledge/exercices_catalogue.js`, 682 noms générés depuis
  `src/data/exercises.js` — régénération : `node scripts/gen-catalogue.mjs`).
  Le modèle ne peut plus inventer de noms.
- **Validation élargie** après génération : exercices interdits, recouvrement
  ≤ 40 % avec le cycle précédent, exercice hors catalogue, **matériel
  indisponible** — une passe corrective automatique si violation.
- **Fusion déterministe morpho** : un exercice à la fois « privilégié » et
  « interdit » est retiré des privilégiés AVANT le prompt.
- **Directive sommeil** : récupération dégradée détectée → plafond de volume
  explicite dans le prompt.
- **Dossier athlète enrichi** : tendance de poids sur 30 j et adhérence
  nutrition réelle sur 14 j entrent dans la Couche 0.
- Le doublon client des directives de variation est supprimé
  (`couche0.js` serveur = source unique).

## 3. Fondation données & IA

- `supabase/schema.sql` — à exécuter **une fois** dans Supabase → SQL Editor.
  Crée : `entitlements`, `usage_counters` (+ fonction `increment_usage`),
  `generation_events`, `morpho_events`, `workout_sync`, `cycle_outcomes` —
  toutes sous RLS (chaque utilisateur ne voit que ses lignes ; les tables
  d'événements sont réservées au serveur).
- **Journal client** (`src/services/syncService.js`) : séances terminées,
  feedbacks d'exercice et bilan de cycle partent vers Supabase quand
  l'utilisateur est connecté — silencieux, jamais bloquant, l'app reste
  100 % fonctionnelle hors ligne.
- **Télémétrie serveur** : chaque génération (dossier + fiche + directives →
  réflexion + programme + warnings) peut être journalisée — c'est le dataset
  d'entraînement des futurs modèles. Prénom retiré avant enregistrement.

## 4. Variables d'environnement (Vercel → Settings → Environment Variables)

| Variable | Rôle | Défaut |
|---|---|---|
| `ANTHROPIC_API_KEY` | déjà en place | — |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | vérification des JWT | permissif si absentes |
| `SUPABASE_SERVICE_ROLE_KEY` | entitlements, quotas, télémétrie | fonctions désactivées si absente |
| `ENFORCE_COACH_PRO=true` | exige un droit actif pour générer | **off** |
| `ENFORCE_QUOTAS=true` | applique les quotas mensuels serveur | **off** (compte quand même) |
| `TELEMETRY_ENABLED=true` | journalise les générations | **off** |
| `ALLOW_NO_ORIGIN=true` | ré-autorise les requêtes sans Origin | off (requêtes sans Origin refusées) |

**Ordre conseillé** : tout laisser off → exécuter le SQL → ajouter les clés
Supabase → observer une semaine → activer `ENFORCE_QUOTAS`, puis
`ENFORCE_COACH_PRO` quand les comptes payants ont leurs entitlements.

> ⚠ **RGPD** : n'activer `TELEMETRY_ENABLED` qu'après ajout d'une case de
> consentement dans l'app et mention dans la politique de confidentialité.
> Le journal client (séances) est couvert par le compte utilisateur, mais la
> politique doit le mentionner aussi.

## 5. Suppressions à faire dans GitHub (web UI)

1. `api/generate.js` — fichier seul.
2. Dossier `src/api/` entier.
3. Dossier `data/` à la racine (pas `src/data/` !).

(Ouvrir le dossier → bouton « ⋯ » → *Delete directory*.)

## 6. Le workflow CI

`.github/workflows/ci.yml` est dans le zip. Si le glisser-déposer ignore le
dossier caché `.github`, le créer à la main : **Add file → Create new file**,
taper `.github/workflows/ci.yml` comme nom, coller le contenu.

## 7. Volontairement inchangé (et pourquoi)

- **Les composants UI volumineux** (AnalyseIA 837 lignes, etc.) : ils
  fonctionnent ; les redécouper sans tests visuels serait le meilleur moyen de
  créer des régressions. À faire écran par écran, maquette à l'appui.
- **42 erreurs TypeScript préexistantes** (morphoService, nutritionService,
  vieux blocs de coachBrainService…) : comptées avant/après — **aucune
  nouvelle** introduite. Le typecheck tourne en CI en mode informatif.
- **localStorage reste la source de lecture** : la V3 ajoute le *journal*
  vers Supabase (les données sortent enfin du téléphone) ; faire de Supabase
  la source de vérité (multi-appareils) est le prochain grand chantier, pas un
  oubli.
- Le fond sombre au chargement (`index.html`) puis interface claire : choix
  visuel à trancher côté maquette, pas touché.

## 8. Vérifier après le push

1. Vercel : build vert (le même `npm run build` a été validé ici, 12 s).
2. GitHub → Actions : « CI » vert (12 tests + build).
3. Dans l'app : générer un programme (réponse enrichie : `warnings` +
   `meta.acces`), analyser une photo de repas, terminer un exercice **avec un
   ressenti** puis regarder `morpho_exo_feedback` dans le localStorage, envoyer
   un message au coach nutrition.
