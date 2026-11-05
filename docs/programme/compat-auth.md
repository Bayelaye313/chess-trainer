# Programme 1000 heures et multi-utilisateurs : contenu partagé, progression personnelle

Relevé fait le 2026-11-05 en lecture seule, sur `programme-2` (4f84bf4) comparé à `integration` (5cc64d2, qui contient `auth`). Rien n'a été fusionné.

## Où `programme:generate` écrit

`scripts/programme/generate-phase.mts` n'ouvre **aucune base**. Il n'importe pas `server/db` et n'utilise ni `better-sqlite3` ni `DATABASE_PATH`.

| Étape | Écrit dans | Versionné ? |
|---|---|---|
| `select` | `web/data/programme/phase-<n>/selected.json`, `verify-in.json`, journaux | Non (`web/data/` est ignoré par git) |
| `verify` | `web/data/programme/phase-<n>/verify-<i>.jsonl` | Non |
| `build` | `web/src/core/programme/content/phase-<n>.json` (jours, cours, puzzles par rôle, réserve, blindfolds, positions construites) et `data/programme/phase-<n>/report.txt` | **Oui** pour le JSON |

L'écran ne lit ce contenu qu'à travers `src/server/programme/content.ts`, qui importe les `phase-<n>.json`. La déduplication entre phases (puzzles et parties d'origine) relit aussi ces fichiers. Elle ne passe jamais par la base.

## Classement

### Contenu partagé : fichiers du dépôt, aucune table

- `src/core/programme/content/phase-<n>.json` et `phase-<n>.spec.ts`
- `src/core/programme/phases.ts`, `metaphors.ts`, `visual-hacks.ts`

Aucune table `programme_*` ne contient de contenu. Il n'y a donc **aucune table partagée à créer**, et la fusion ne demande pas de migration de contenu.

### Progression par utilisateur : les trois tables `programme_*`

| Table | Contenu | Clé utilisateur |
|---|---|---|
| `programme_state` | Le curseur (semaine, jour, répétition, décalage de difficulté) | `user_id` (clé primaire) |
| `programme_sessions` | Une séance par jour joué, avec le `plan` (identifiants des puzzles servis), le résultat, la check-list et la reconsolidation | `user_id` |
| `programme_puzzle_results` | Un puzzle tenté (squelette, solution, cases marquées, durée) | `user_id`, plus `session_id` |

La branche `auth` les classe déjà en données personnelles. Elle ajoute une FK `user_id → users.id` avec `ON DELETE CASCADE`, les inscrit dans `PERSONAL_TABLES` (`server/db/user-scope.ts`) et les fait supprimer par `deleteUserAndData`. **Ce classement est correct** : ces tables ne contiennent que de la progression.

Les puzzles sont référencés par des `puzzle_id` en texte libre, sans clé étrangère vers le contenu. L'« Elo actuel » est lu dans `games`, qui est déjà personnelle sur `auth`.

## Ce qui devra changer à la fusion de `programme-2` dans `integration`

1. **`src/server/programme/content.ts`** : ajouter les imports de `phase-4.json` et `phase-5.json`. Le fichier est identique sur les deux branches, donc la fusion est sans conflit.
2. **`src/core/programme/content/phase-4.json`, `phase-5.json`, `phase-4.spec.ts`, `phase-5.spec.ts`** : nouveaux fichiers, aucun conflit.
3. **`src/server/queries/programme.ts` et `src/server/actions/programme.ts`** : ne pas les toucher sur `programme-2`. Sur `integration`, ils prennent `userId` en premier argument et passent par `userScope()`. Sur `programme-2`, l'ancienne signature est `(input, userId = LOCAL_USER_ID)`. Toute modification faite de ce côté créera un conflit, à résoudre en gardant la version `integration`.
4. **`src/client/features/programme/programme-screen.tsx`** (libellés de difficulté, voir le commit « programme: libellés de difficulté ») : ce fichier n'a pas changé sur `integration`, donc pas de conflit attendu. Sur `integration`, la page a été déplacée en `src/app/(app)/programme/page.tsx` et appelle `requireUser()`. git suivra ce renommage : il faut garder la version `integration`.
5. **Données existantes** : les lignes `programme_*` créées en local avec `user_id = 'local'` sont des lignes héritées. Elles sont réclamées une seule fois par `LEGACY_CLAIM_EMAIL`, comme les autres tables personnelles. Il faut aligner et migrer la base avec `npm run db:migrate` (lanceur `migrate/run.mjs`), jamais avec `drizzle-kit migrate` (voir `docs/auth/audit.md`).

## Point de vigilance (multi-utilisateurs)

Le contenu est partagé, mais les séances gardent des `puzzle_id` dans `programme_sessions.plan` et `programme_puzzle_results`. **Régénérer une phase déjà commencée par un utilisateur** (nouveau `build`, avec d'autres puzzles retenus) rendrait ces identifiants orphelins pour tous les utilisateurs : une séance en cours ne retrouverait plus ses puzzles, et le test de rétention du jour 7 relit les puzzles des jours précédents. Avec un seul utilisateur, le problème restait local. Avec plusieurs, il faut considérer un `phase-<n>.json` publié comme figé : on corrige en ajoutant des puzzles, jamais en remplaçant ceux qui existent. Une autre option est de versionner le contenu (par exemple `content_version` dans `programme_sessions`). Aucune modification n'a été faite.
