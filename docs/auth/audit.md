# Passage multi-utilisateurs : audit

Branche `auth`, créée depuis `integration` après la fusion de `programme-2` (merge `aee6c7c`).
Ce fichier sert de journal à la mission. Il décrit l'état de départ (étape 0), les choix retenus
et les vérifications de sécurité (étape 5).

## 1. Version de Next.js et conventions

- Next.js **16.3.0**, React **19.2.8** (`web/package.json`). La documentation embarquée est dans
  `web/node_modules/next/dist/docs/`.
- **`middleware.ts` est déprécié** depuis Next 16. Il est renommé **`proxy.ts`** et exporte
  `proxy` ou un `default` (`03-api-reference/03-file-conventions/proxy.md`). Le fichier se place
  à côté de `app/`, donc dans `web/src/proxy.ts`.
- **Le proxy tourne sur le runtime Node.js** par défaut. L'option `runtime` y est interdite et lève
  une erreur.
- Le guide `02-guides/authentication.md` réserve le proxy aux **contrôles optimistes** : lecture
  du cookie seulement, sans base de données, parce qu'il s'exécute aussi sur les préchargements.
  Il précise aussi qu'un layout **n'est pas rejoué** à chaque navigation côté client. Le contrôle
  qui fait autorité doit donc aussi se trouver près des données.
- Retenu ici :
  - `proxy.ts` redirige vers `/connexion` quand le cookie de session est absent.
  - `requireUser()` (mis en cache par requête avec `React.cache`) est appelé dans le layout du
    groupe `(app)`, dans chaque page qui lit des données personnelles, dans chaque server action
    et dans chaque route handler.
  - Les requêtes reçoivent toujours le `userId` en paramètre explicite.

## 2. Inventaire des tables (26 tables, hors `__drizzle_migrations`)

### Contenu partagé (reste global, lisible par tout utilisateur connecté)

| Table | Contenu |
|---|---|
| `curriculum_themes` | thèmes de l'Académie (205 lignes) |
| `curriculum_puzzles` | puzzles de l'Académie (positions des cours) |
| `imported_traps` | pièges importés (PGN) |
| `imported_opening_lines` | lignes d'ouverture importées (TSV Lichess) |

Les autres contenus partagés ne sont pas en base : cours d'ouverture (`opening-course-*.ts`,
`op-*.ts`), modules `pm-*`, catalogue (`catalog.ts`), contenus du Programme
(`core/programme/content/phase-*.json`) et index d'ouvertures calculé en mémoire. Rien n'y change.

### Données personnelles (reçoivent un `user_id`)

| Table | État avant | Remarque |
|---|---|---|
| `platform_links` | PK = `source` | une seule ligne par plateforme, **mono-utilisateur** → unique `(user_id, source)` |
| `settings` | PK = `key` | **mono-utilisateur** → unique `(user_id, key)` |
| `games` | unique `(source, external_id)` | deux joueurs peuvent importer la même partie (ils ont pu jouer l'un contre l'autre) → unique `(user_id, source, external_id)` |
| `moves` | enfant de `games` | `user_id` dénormalisé (défense en profondeur) |
| `bot_game_results` | enfant de `games` | idem |
| `puzzles` | cartes issues des parties | toutes les sources (`local`, `chesscom`, `lichess`) viennent des parties du joueur |
| `reviews` | carte FSRS (PK `puzzle_id`) | idem |
| `review_logs` | historique FSRS | idem |
| `daily_sets` | PK = `day` | **mono-utilisateur** → unique `(user_id, day)` |
| `puzzle_purges` | PK = `move_id` | **douteuse** (journal de purge, aucun code ne l'écrit aujourd'hui) → classée personnelle |
| `opening_mistake_review` | `user_id` déjà présent (`'local'`) | clé `(user_id, fen, uci)` déjà par utilisateur |
| `opening_progress` | `user_id` déjà présent | clé `(user_id, opening_id, variation_key)` |
| `opening_endurance_sessions` | `user_id` déjà présent | |
| `sparring_sessions` | `user_id` déjà présent | |
| `sparring_moves` | enfant de `sparring_sessions` | `user_id` ajouté |
| `training_events` | `user_id` déjà présent | |
| `training_recommendations` | `user_id` déjà présent | |
| `user_theme_progress` | `user_id` déjà présent | progression de l'Académie |
| `programme_state` | PK = `user_id` | progression du Programme |
| `programme_sessions` | `user_id` déjà présent | |
| `programme_puzzle_results` | `user_id` déjà présent | |

Soit **21 tables personnelles**, toutes cloisonnées. Dix d'entre elles avaient déjà une colonne
`user_id` en texte libre, qui valait toujours `'local'` (`LOCAL_USER_ID`). Les 11 autres n'en
avaient pas.

Table douteuse à relire : **`puzzle_purges`**, classée personnelle par défaut.

### Lignes présentes dans la base de travail (copie du 2026-11-04)

`games` 200, `moves` 13 752, `puzzles` 749, `reviews` 749, `daily_sets` 3, `platform_links` 1,
`programme_state` 1 (`'local'`), `training_recommendations` 11 (`'local'`). Toutes les autres
tables personnelles sont vides.

## 3. Ce qui lit ou écrit ces tables

| Fichier | Tables personnelles touchées | Appelé par |
|---|---|---|
| `server/import/persist.ts` | games, moves | synchro |
| `server/import/run-sync.ts` | platform_links (+ persist, extraction) | `/api/sync`, `linkPlatform` |
| `server/actions/platform-link.ts` | platform_links | page Plus (comptes liés) |
| `server/actions/play.ts` | games, moves, bot_game_results | écran Jouer |
| `server/queries/games.ts` | games, moves | accueil, `/parties`, `/analyse/[id]`, `/rapport/brillants` |
| `server/queries/progress.ts` | games, moves | `/rapport` |
| `server/queries/course-games.ts` | games, moves | `/rapport/ouvertures/[slug]`, cours |
| `server/queries/opening-mistakes.ts` | games, moves | hub des erreurs d'ouverture, `/ouvertures/[slug]` |
| `server/queries/reviews.ts` | puzzles, reviews, moves | accueil, `/entrainer` |
| `server/queries/spaced-repetition.ts` | puzzles, reviews, review_logs, daily_sets, moves, training_events, training_recommendations | actions `practice`, synchro |
| `server/queries/training.ts` | games, moves, puzzles, reviews, opening_progress, training_events, training_recommendations | accueil (séance du jour) |
| `server/queries/daily-plan.ts` | settings, training_events | accueil, actions `training` |
| `server/queries/settings.ts` | settings | préférences d'entraînement |
| `server/queries/opening-progress.ts` | opening_progress, training_events | ouvertures, répétition |
| `server/queries/opening-endurance.ts` | opening_endurance_sessions | `/ouvertures/historique-endurance` |
| `server/queries/opening-mistake-review.ts` | opening_mistake_review | hub des erreurs |
| `server/queries/sparring.ts` | sparring_sessions, sparring_moves, training_events | sparring |
| `server/queries/curriculum.ts` | user_theme_progress | `/apprendre` |
| `server/curriculum/populate-puzzles.ts` | user_theme_progress (remise à zéro) | script `populate:puzzles` |
| `server/queries/programme.ts` | programme_state, programme_sessions, programme_puzzle_results, games | `/programme` |
| `server/actions/*.ts` (13 fichiers) | via les requêtes ci-dessus | composants client |
| `app/api/sync/route.ts` | via `runSync` | `useSyncNotifier` (sondage) |

Scripts de maintenance (`scripts/fix-obvious-recapture-quality.ts`, `seed-academy.ts`,
`backfill-puzzle-lines.ts`) : ils agissent sur toute la base, hors requête HTTP, et sont lancés
par l'exploitant. `seed-academy.ts` ne touche que la progression de l'Académie quand le contenu
change.

### Stockage navigateur

| Clé | Stockage | Contenu |
|---|---|---|
| `chess-trainer:move-fx-muted` | localStorage | son coupé |
| `chess-trainer:move-success-counter` | localStorage | compteurs de réussite par coup |
| `chess-trainer:solved-traps` | localStorage | pièges résolus |
| `chess-trainer:last-bot-setup` | localStorage | dernier bot choisi |
| `chess-trainer:course-position:<id>` | localStorage | position de lecture d'un cours |
| `chess-trainer:last-course` | localStorage | dernier cours ouvert |
| `chess-trainer:review-queue` | sessionStorage | file de révision des ouvertures |
| `chess-trainer:seance-queue` | sessionStorage | file de la séance du jour |

Retenu : `chess-trainer:<userId>:<suite>`, et toutes les clés `chess-trainer:*` sont effacées à
la déconnexion. Les anciennes clés sans préfixe sont reprises par le compte qui hérite des données
(`LEGACY_CLAIM_EMAIL`) et supprimées pour les autres comptes.

## 4. En-têtes COOP / COEP

`next.config.ts` envoie sur `/:path*` les en-têtes `Cross-Origin-Opener-Policy: same-origin` et
`Cross-Origin-Embedder-Policy: require-corp`. Ils sont nécessaires à Stockfish multi-thread
(SharedArrayBuffer).

- **Redirection OAuth** : la connexion Google passe par une navigation de premier niveau
  (`/api/auth/signin/google` → accounts.google.com → `/api/auth/callback/google`), sans popup.
  COOP `same-origin` ne gêne que les popups, la redirection fonctionne donc.
- **Avatar Google** (`lh3.googleusercontent.com`) : servi sans `Cross-Origin-Resource-Policy`,
  il serait **bloqué** par COEP `require-corp`. Le menu compte affiche donc les **initiales**. Le
  champ `image` est bien enregistré par l'adaptateur, mais aucune interface ne l'affiche.
- Les en-têtes restent intacts : aucune modification de `next.config.ts`.

## 5. Hypothèses de déploiement

- **SQLite en fichier unique** (`DATABASE_PATH`), mode WAL, `foreign_keys = ON`. Il faut **un seul
  processus serveur** : pas de pool ni de réplique, et la base doit vivre sur un disque persistant.
- **Serveur Node persistant** (`next start`), pas de plateforme serverless. La synchro tourne en
  tâche de fond dans le processus, et les verrous anti-chevauchement comme les limites de
  fréquence sont **en mémoire**. Un redémarrage les remet à zéro, sans conséquence.
- Le moteur Stockfish côté serveur est une instance unique partagée. Deux imports ne tournent
  jamais en parallèle (verrou global), et un même utilisateur ne peut jamais en lancer deux.
- Les sessions sont stockées en base (stratégie « database »). Révoquer revient à supprimer une
  ligne de `sessions`.
- HTTPS en production : le cookie passe alors en `__Secure-authjs.session-token` (secure). Il faut
  `AUTH_URL` ou `AUTH_TRUST_HOST=true` derrière un proxy inverse.

## 6. Cloisonnement (étape 2) : ce qui a été fait

### Schéma et migrations

- **0017** (`auth_tables`) : `users`, `accounts`, `sessions`, `verification_tokens`.
- **0018** (`user_id_columns`) : `user_id` NULLable ajouté par `ALTER TABLE` aux 11 tables qui
  n'en avaient pas, plus `admin_audit`.
- **0019** (`user_scoping`) : clés étrangères `user_id → users.id ON DELETE CASCADE` sur les
  21 tables, index par `user_id`, et clés uniques par utilisateur :
  - `settings (user_id, key)`
  - `platform_links (user_id, source)`
  - `daily_sets (user_id, day)`
  - `games (user_id, source, external_id)`

  Les anciennes clés primaires `key`, `source` et `day` sont supprimées : SQLite utilise alors le
  `rowid`.
- Le `when` du journal augmente : 0016 = 1793697940548 < 0017 < 0018 < 0019.

Pourquoi deux migrations au lieu d'une : drizzle-kit 0.31.10, en une seule passe, générait un
`INSERT … SELECT "id", "user_id"` depuis des tables où ces colonnes n'existaient pas encore. Il
générait aussi des `ALTER TABLE … ADD … REFERENCES users(id)` **sans** `ON DELETE CASCADE`
(générateur SQLite, `drizzle-kit/bin.cjs` l.24050). Avec deux passes générées, toutes les FK sont
recréées proprement avec la cascade. Aucune ligne SQL n'a été écrite à la main.

### Exécution des migrations : `npm run db:migrate` → `src/server/db/migrate/run.mjs`

**Ne plus utiliser `drizzle-kit migrate` à partir de 0019.** drizzle exécute toutes les
migrations dans une seule transaction, et better-sqlite3 active `foreign_keys` par défaut. Les
`PRAGMA foreign_keys=OFF` générés n'ont aucun effet dans une transaction : le `DROP TABLE games`
de la recréation déclencherait les cascades et viderait `moves`, `puzzles`, `reviews`…

Le script coupe les FK *avant* la transaction (procédure documentée par SQLite), applique les
migrations, puis lance `PRAGMA foreign_key_check`. Seules les lignes `user_id = 'local'` en
attente de reprise peuvent y apparaître.

Vérifié :
- base neuve : OK ;
- copie de la base existante : 200 parties, 13 752 coups, 749 cartes, 749 révisions et 3 plans
  du jour, tous conservés. `integrity_check` = ok, aucune FK invalide hors `'local'`
  (11 `training_recommendations`, 1 `programme_state`).

### Retard préexistant de la base locale (à corriger avant de migrer)

`web/data/chess-trainer.db` (état du 2026-11-04) n'a **jamais reçu 0015** : la table
`puzzle_purges` et les colonnes `puzzles.coach_comment`, `alternatives` et `audited_at`
manquent. Les tables de 0016 existent pourtant, enregistrées sous un ancien horodatage
(1793629628770). `drizzle-kit migrate` échouait donc déjà (code 1, sans message). Ce retard ne
vient pas de cette mission.

Procédure d'alignement suivie sur la copie (à refaire sur la vraie base, **après
sauvegarde**) :
1. exécuter le SQL de 0015 ;
2. insérer dans `__drizzle_migrations` les entrées de 0015 et 0016 (hash sha256 du fichier,
   `created_at` = `when` du journal) ;
3. lancer `npm run db:migrate`.

### Point d'entrée unique : `src/server/db/user-scope.ts`

- `userScope(userId)` fournit trois outils :
  - `where(table, …)` : condition `user_id = ? AND …` ;
  - `owns(...tables)` : la même condition sur plusieurs tables, pour les jointures ;
  - `own(values)` / `ownAll(values)` : ajoutent le propriétaire aux insertions.

  Il refuse un identifiant vide ou `'local'`.
- Les tables personnelles s'importent de `user-scope.ts`, jamais de `@/server/db/schema`.
- Deux tests le garantissent :
  - `user-scope.enforcement.test.ts` (statique) : chaque `from/join/update/delete` d'une table
    personnelle est filtré, et chaque `insert` passe par `own`. Il comporte un cas témoin.
  - `user-isolation.test.ts` (comportemental) : 12 tests.
- Toutes les requêtes prennent `userId` en premier paramètre. Pages, server actions et route
  handlers l'obtiennent de `requireUser()`.
- **Aucun fichier `"use server"` n'exporte de fonction qui accepte un `userId`** : le client
  pourrait sinon le choisir. La logique de Jouer est passée de `actions/play.ts` à
  `queries/play.ts`.
- Failles d'écriture croisée corrigées en passant : `recordPlayerMove`, `saveBotGameResult`,
  `recordSparringMove` et `finishSparringSession` acceptaient un identifiant de partie ou de
  séance d'un autre joueur. Ils vérifient désormais que le compte en est propriétaire.
- `currentElo` du Programme lisait la dernière partie notée, tous joueurs confondus. Il est
  désormais filtré.

### Reprise des données mono-utilisateur (`LEGACY_CLAIM_EMAIL`)

- Lignes concernées : `user_id IS NULL` (colonnes ajoutées) ou `user_id = 'local'` (anciennes
  colonnes non nullables, dont certaines en clé primaire).
- Déclenchement : `events.signIn`, quand l'email du compte correspond. Une seule fois pour toute
  l'instance : si un compte a déjà `users.legacy_claimed_at`, rien ne se passe.
- Exécution en transaction. Elle est journalisée dans `admin_audit` (action `legacy-claim`, avec
  les compteurs par table) et dans le journal serveur (nombre total de lignes).
- Sans la variable, rien n'est repris : les lignes restent invisibles pour tout le monde.
- Navigateur : les anciennes clés `chess-trainer:*` sans préfixe reviennent à ce compte. Elles
  sont supprimées pour tout autre compte.

### Synchro `/api/sync`

- Authentifiée : 401 sans session.
- Limite de fréquence : 6 appels par minute et par utilisateur, au-delà 429 avec `Retry-After`.
  Le client traite 429 comme « rien à signaler ».
- Verrous en mémoire :
  - par utilisateur : pas d'import concurrent pour le même compte ;
  - global : un seul import à la fois, car le moteur Stockfish serveur est partagé.
- Les comptes Chess.com et Lichess liés appartiennent à chaque utilisateur : unique
  `(user_id, source)`.

## 7. Présence et statistiques (étape 3)

- Tables (migration **0020**, cascade sur `users`) :
  - `user_presence` (`user_id`, `last_seen_at`, `current_section`) ;
  - `user_daily_activity` (`user_id`, `day` UTC, `active_seconds`, `sessions_count`,
    `first_seen_at`, `last_seen_at`).

  Ce sont des métadonnées d'usage, hors `PERSONAL_TABLES` : l'admin les lit en agrégé, et elles
  disparaissent avec le compte, par cascade.
- `PresenceBeacon` (layout connecté) envoie un battement :
  - toutes les 60 s quand `document.visibilityState === "visible"` ;
  - au retour sur l'onglet et au changement de section, avec 15 s d'écart minimum.

  Le corps vaut `{ section }` : une valeur de `PRESENCE_SECTIONS`, calculée côté client par
  `sectionOfPath`. L'URL ne quitte jamais le navigateur.
- `POST /api/presence` :
  - 401 sans session, et aucune écriture ;
  - 429 au-delà de 4 battements par minute et par compte ;
  - 400 si la section est inconnue ;
  - 204 sinon.
- Définitions (`src/core/presence/metrics.ts`, 10 tests) :
  - **en ligne** : dernier battement il y a moins de 2 minutes ;
  - **actif** sur une période : au moins 60 s actives cumulées. DAU = jour UTC courant,
    WAU = 7 jours glissants, MAU = 30 jours glissants, aujourd'hui compris ;
  - **temps actif** : chaque battement crédite le temps écoulé depuis le précédent, plafonné à
    60 s. Après 2 minutes de silence, le battement ouvre une nouvelle session et ne crédite rien ;
  - **sessions actives** : lignes de `sessions` non expirées ;
  - **rétention simple** : parmi les inscrits depuis au moins 7 jours, part de ceux qui ont une
    activité à partir de J+1 (J = jour UTC d'inscription).
