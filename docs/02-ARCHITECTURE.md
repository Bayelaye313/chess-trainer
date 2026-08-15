# Architecture

> Décisions structurantes et organisation du code. À lire avant d'ajouter une fonctionnalité.
> Le benchmark et la feuille de route sont dans [01-BENCHMARK.md](01-BENCHMARK.md).

---

## 1. Décisions et raisons

| Sujet | Choix | Raison |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) + TypeScript | Server Components pour les tableaux de bord, Server Actions pour les mutations, un seul langage du domaine à l'UI. |
| Moteur | Stockfish 18 WASM en Web Worker | Zéro latence réseau, zéro process serveur. Le prototype relançait un process par coup : 1 à 3 s d'attente. |
| Build moteur | `lite` (~7 Mo), multi-thread avec repli mono-thread | La build complète pèse 113 Mo. La `lite` reste très au-dessus du niveau humain. |
| Base | SQLite + Drizzle ORM | Local, sans serveur, sauvegarde = copie de fichier. Le schéma reste portable vers Postgres. |
| SRS | FSRS-5 (`ts-fsrs`) | Modélise stabilité et difficulté par carte, là où Leitner applique des intervalles fixes. |
| Échiquier | `react-chessboard` v5 + `chess.js` | Remplace chessboard.js/jQuery. Pièces en SVG inline — pas de CDN, ce qui compte avec COEP. |
| Tests | Vitest | Le domaine est du TypeScript pur, testable sans DOM ni moteur. |

### Isolation cross-origin

`next.config.ts` pose `Cross-Origin-Opener-Policy: same-origin` et
`Cross-Origin-Embedder-Policy: require-corp`. C'est la condition de
`SharedArrayBuffer`, donc du Stockfish multi-thread.

Contrepartie : **aucune ressource cross-origin ne peut être chargée côté client**
sans en-têtes CORP. On n'en a aucune (pièces en SVG inline, appels aux API
Chess.com/Lichess faits depuis le serveur). À garder en tête avant d'ajouter une
police ou une image externe.

Si l'isolation échoue, `selectEngineBuild()` retombe sur la build mono-thread
sans rien casser. Le panneau moteur de la page d'accueil le signale.

### Licence

Stockfish est sous **GPLv3**. Il est chargé comme binaire séparé depuis
`public/engine/`, jamais lié au code de l'application. Usage local personnel.

---

## 2. Organisation du code

```
web/src/
├── core/                        # DOMAINE PUR — aucune dépendance React, Next ou DB
│   ├── chess/
│   │   ├── types.ts             # MoveQuality, GamePhase, Motif, GameResult
│   │   ├── squares.ts           # géométrie de l'échiquier
│   │   ├── pieces.ts            # valeurs (deux échelles : cible vs repreneur)
│   │   ├── attacks.ts           # attacksFrom, isPinned — absents de chess.js
│   │   ├── phase.ts             # ouverture / milieu / finale
│   │   ├── sacrifice.ts         # critère du coup « Brillant »
│   │   ├── classify.ts          # seuils de perte en centipions
│   │   ├── decks.ts             # les 7 decks et la règle de rangement
│   │   ├── termination.ts       # résultat/cause de fin de partie
│   │   └── motifs/              # un fichier par détecteur
│   └── analysis/
│       ├── types.ts             # PositionAnalyser, conventions de score
│       └── evaluate-move.ts     # qualification d'un coup, agnostique du moteur
│
├── client/                      # ne tourne QUE dans le navigateur
│   ├── engine/                    # adaptateur Stockfish
│   │   ├── uci.ts                   # décodage du protocole (pur, testé)
│   │   ├── loader.ts                # choix de la build
│   │   ├── stockfish-engine.ts      # worker + sérialisation des commandes
│   │   ├── engine-context.tsx       # provider React, une instance pour l'app
│   │   └── types.ts                 # ChessEngine, EngineOptions
│   └── features/                  # composants + hooks, par domaine métier
│       ├── play/
│       └── engine-check/
│
├── server/                      # ne tourne QUE côté serveur
│   ├── db/
│   │   ├── schema/                  # une table par fichier
│   │   └── index.ts                 # client SQLite ("server-only")
│   └── actions/                   # Server Actions ('use server'), une par feature
│       └── play.ts
│
├── components/ui/               # primitives d'interface partagées
├── lib/labels.ts                # traduction FR des clés du domaine
└── app/                         # routes, composition seulement
```

### Les quatre règles

**1. `core/` ne dépend de rien d'autre que `chess.js`.**
Pas de React, pas de Drizzle, pas de `fetch`. C'est ce qui rend la logique
échiquéenne testable en millisecondes et réutilisable côté serveur comme côté
client. 61 tests unitaires tournent en moins de deux secondes grâce à ça.

**2. `client/` et `server/` ne s'importent jamais l'un l'autre directement.**
Le pont entre les deux est toujours une Server Action (`server/actions/*`,
`'use server'`) appelée depuis un hook ou composant client — jamais un import
direct de `server/db` depuis `client/`. `core/`, `components/ui/` et `lib/`
sont neutres : les deux côtés peuvent les importer.

**3. Le moteur est derrière une interface.**
Tout consommateur d'évaluation dépend de `PositionAnalyser` (`core/analysis/types.ts`),
pas de Stockfish. `evaluateMove()` se teste avec un moteur factice. Quand Maia
arrivera (étape 8), elle s'y branchera sans toucher au domaine.

**4. Le domaine parle anglais, l'interface parle français.**
Les clés (`blunder`, `missed_tactics`, `fork`) finissent en base et dans les URL :
elles doivent être stables. Tout le français est dans `lib/labels.ts`.

---

## 3. Conventions de données

### Évaluations

Deux conventions coexistent, ne pas les mélanger :

- **UCI** exprime les scores du point de vue du **camp au trait**.
- **`PositionEvaluation`** les exprime du point de vue des **Blancs**, toujours.

La conversion se fait une seule fois, dans `StockfishEngine.search()`. En aval,
comparer une position avant et après un coup est direct.

Un mat est porté par `mate` (et non `cp`), en nombre de coups signé.
`toWhitePovScore()` l'écrase en scalaire pour les comparaisons : mat en 1 vaut
99 999, mat en 5 vaut 99 995 — un mat rapide vaut mieux qu'un mat lointain.

### Valeurs de pièces

Deux échelles distinctes, et c'est volontaire :

- `PIECE_VALUE` — le roi vaut 99. Comme **cible**, il domine tout (fourchette).
- `RECAPTURE_VALUE` — le roi vaut 1. Comme **repreneur**, il ne coûte rien : un
  fou donné en h7 et repris par le roi reste un sacrifice.

---

## 4. Ce qui a changé par rapport au prototype Flask

| Sujet | Prototype | Maintenant |
|---|---|---|
| Latence d'analyse | 1–3 s (un process Stockfish par coup) | Worker persistant, analyse en continu |
| Parties | `GAMES = {}` en mémoire, perdues au redémarrage | Table `games` + `moves` |
| Stockage | Fichier JSON relu et réécrit en entier | SQLite indexé |
| Répétition espacée | Leitner, 5 boîtes | FSRS-5 |
| Puzzles | Un seul coup | `solution: string[]`, multi-coups dès le schéma |
| Libellés | Français mélangé au domaine | Clés stables + `lib/labels.ts` |
| Tests | 1 fichier sur l'import | 57 tests sur le domaine et le protocole |

### Deux corrections de fond au portage

**Mat manqué.** Le prototype marquait `mate_missed = True` dès qu'un mat forcé
existait et que le coup joué n'était pas mat — donc jouer le premier coup correct
d'un mat en 3 comptait comme un mat manqué. `evaluateMove()` vérifie maintenant
que le mat a réellement disparu après le coup.

**Sacrifice.** Le prototype donnait implicitement la valeur 1 au roi repreneur
(via un `.get(type, 1)` sans entrée pour le roi). Le comportement était correct
mais accidentel ; il est désormais explicite via `RECAPTURE_VALUE`.

---

## 5. Commandes

```bash
npm run dev            # serveur de développement
npm run build          # build de production
npm test               # tests unitaires (Vitest)
npm run typecheck      # tsc --noEmit
npm run lint           # ESLint

npm run db:generate    # génère une migration depuis le schéma
npm run db:migrate     # applique les migrations
npm run db:studio      # explorateur de base

npm run setup:engine   # recopie Stockfish dans public/engine (auto au postinstall)
npm run smoke:engine   # confronte le décodage UCI à la sortie réelle du moteur
```

---

## 6. État de vérification

| Élément | Vérifié |
|---|---|
| Domaine échiquéen, protocole UCI, qualification des coups | 74 tests Vitest |
| Décodage UCI face au moteur réel | `npm run smoke:engine` |
| Migrations SQLite | 9 tables créées |
| Build de production, typecheck, lint | Propres, sans avertissement |
| En-têtes COOP/COEP, service du `.wasm` | Vérifiés par requête HTTP |
| Worker dans le navigateur (page d'accueil) | Playwright : multi-thread, éval, meilleur coup, profondeur |
| Partie complète (`/play`) : coups légaux, illégaux, feedback, réplique IA, persistance | Playwright, plusieurs séquences, 0 erreur console |

## 7. Étape 2 — Jouer

Partie contre le moteur, feedback en direct, persistance en base. UI et hooks
sous `src/client/features/play/`, mutations sous `src/server/actions/play.ts`.

### Ce qui est fait
- Échiquier `react-chessboard` v5, entièrement contrôlé par le FEN de `chess.js`.
- Chaque coup du joueur : évalué à pleine force (`ANALYSIS_DEPTH = 16`), classifié,
  surligné selon sa qualité (jetons `--quality-*`, un seul endroit où ces couleurs
  sont définies).
- Réplique du moteur bridée sur l'ELO choisi (`AI_MOVE_TIME_MS = 600`) — un seul
  worker partagé, reconfiguré entre les deux modes via `ensureEngineMode`, qui
  évite l'aller-retour `setoption`/`isready` quand le mode demandé est déjà actif.
- Persistance : `games` créée au lancement, un `moves` par coup **du joueur
  seulement** (comme le prototype Python — les coups de l'IA ne sont pas
  analysés, le PGN complet sur `games.pgn` suffit à reconstituer la partie).
  `games` mise à jour à la fin (résultat, cause, PGN, FEN final).
- Fin de partie détectée via `core/chess/termination.ts` (mat, pat, matériel
  insuffisant, répétition, règle des 50 coups) — chess.js n'a pas d'équivalent
  au `board.result()` de python-chess, reconstruit à partir des prédicats `is*()`.

### Décisions
- **Seuls les coups du joueur sont analysés.** Cohérent avec le prototype et
  avec l'étape 3 (import) : ce qui compte pour Insights, c'est la précision du
  joueur, pas celle de l'adversaire.
- **Promotion toujours dame.** Pas de sélecteur de pièce — comme le prototype.
  Un vrai sélecteur reste à faire si le besoin se confirme à l'usage.
- **`EvaluatedMove` porte désormais `cpBefore`/`mateBefore`/`cpAfter`/`mateAfter`**
  (POV Blancs, valeurs déjà normalisées par `PositionAnalyser`) — ajouté pour
  remplir ces colonnes de `moves`, utiles au graphe d'évaluation de l'étape 4.

### Un piège react-chessboard à connaître
`ChessboardOptions.position` accepte une chaîne FEN et se comporte comme un
composant contrôlé (`useEffect` interne qui resynchronise `currentPosition`
à chaque changement de `position`). **Le diagnostic d'un plateau qui semblait
ne pas refléter le coup de l'IA était un faux positif** : le test vérifiait des
cases fixes (e6/e7) alors que le moteur, bridé et à temps de réflexion court,
avait joué ailleurs (d6). Un deuxième faux positif similaire : un coup de test
illégal (fou bloqué par son propre pion) correctement rejeté par `onPieceDrop`
(snapback) a été pris pour un bug. Lesson : toujours lire le coup réellement
joué avant de diagnostiquer un désaccord entre l'état et l'affichage.

## 8. Bug réel trouvé en usage : timeout moteur silencieux

En testant `/play` manuellement (donc hors des scénarios Playwright déjà
couverts), le moteur a fini par rejeter avec *« Le moteur n'a pas répondu à
temps »* — et cette erreur remontait comme une **promesse non attrapée**,
plantant l'onglet plutôt que de s'afficher proprement.

Deux défauts distincts :

1. **`StockfishEngine` n'écoutait ni `error` ni `messageerror` sur le worker.**
   Si le WASM plante silencieusement (mémoire, exception interne), plus aucune
   ligne UCI n'arrive jamais : le code attendait bêtement le timeout complet
   (120 s à l'origine) avant d'abandonner. Corrigé : le worker expose
   maintenant ces deux événements, qui font échouer **immédiatement** tous les
   appels en attente (`failAll()`), et bloquent les suivants avec la même
   cause tant que le moteur n'est pas recréé. Le timeout lui-même est ramené à
   45 s — généreux pour une recherche profonde en mono-thread de repli, mais
   plus assez court pour ne pas laisser l'interface figée sans explication.
2. **`startNewGame` (usePlayGame) et `runCheck` (EngineCheck) n'avaient pas de
   `try/catch`.** Un rejet de promesse dans un gestionnaire d'événement React
   sans `.catch()` ni `try/catch` devient une exception non gérée au niveau du
   navigateur. Les deux sont corrigés ; `startNewGame` repasse proprement le
   statut à `"setup"` en cas d'échec (au lieu de rester bloqué sur
   `"loading"`/`"thinking"`) et affiche l'erreur.

**Leçon générale, appliquée partout où le moteur est appelé depuis un
gestionnaire d'événement :** chaque point d'entrée asynchrone déclenché par un
clic doit soit être `await`é dans un `try/catch`, soit voir son rejet
explicitement capté — jamais un `void appelAsync()` nu sur une fonction qui
peut rejeter sans protection en amont.

## 9. Restructuration serveur/client (post étape 2)

`src/` sépare maintenant explicitement ce qui tourne côté serveur
(`server/db`, `server/actions`) de ce qui ne tourne que dans le navigateur
(`client/engine`, `client/features`) — voir §2. `core/`, `components/ui/` et
`lib/` restent neutres, importables des deux côtés.

Au passage : l'ancien prototype Flask (`chess-trainer/` et son `.venv` à la
racine du dépôt) a été supprimé — entièrement porté et corrigé dans `web/`,
il ne servait plus de référence active. Le code reste consultable dans
l'historique git si besoin. Les assets SVG par défaut de `create-next-app`
(non référencés nulle part) ont aussi été retirés de `public/`.

## 10. Étape 3 — Importer

Chess.com et Lichess, analyse en tâche de fond, progression en direct. Fichiers
sous `src/server/import/` (pipeline), `src/server/engine/` (moteur Node),
`src/client/features/import/` (UI).

### Deux moteurs, une seule interface

Le point de départ payant de l'étape 1 : `evaluateMove()` (`core/analysis/`)
est agnostique du moteur, donc **inchangé** pour l'import. Seul un nouvel
adaptateur `PositionAnalyser` a été nécessaire :

- `client/engine/stockfish-engine.ts` — navigateur, Worker + `postMessage`.
- `server/engine/node-stockfish-analyser.ts` — Node, API `sendCommand`/`listener`
  du même package `stockfish` (déjà utilisé côté navigateur), pour l'analyse
  de fond au fil de l'import.

Les deux dupliquent la logique de file d'attente et de collecte de lignes —
assumé : les transports (Worker vs callback direct) sont trop différents pour
une abstraction commune qui vaille le coût, à cette taille de projet.

Ceci a aussi révélé que `uci.ts` (décodage du protocole, pur) n'avait rien de
spécifiquement client : déplacé de `client/engine/` vers `core/engine/`, seul
endroit neutre importable des deux côtés. Même chose pour la découpe d'un flux
PGN multi-parties (`splitPgnGames`) : `core/chess/pgn.ts`.

### Pourquoi un job tourne « en tâche de fond » sans infrastructure de queue

L'app est 100% locale : `next dev`/`next start` est un **process Node
persistant**, pas une fonction serverless qui se suspend après la réponse
HTTP. `startImport` (Server Action) crée la ligne `import_jobs`, lance
`runImportJob(...)` **sans l'attendre** (`void runImportJob(...).catch(...)`),
et rend la main immédiatement — le job continue de tourner dans le même
process. La table `import_jobs` est ce qui rend cette progression observable
(sondage côté client, toutes les 1,5 s) et survit à un rechargement de page.

Prix de cette simplicité : si le process serveur redémarre, un job « en cours »
reste bloqué à `running` en base sans jamais se terminer (aucune reprise
implémentée). Acceptable pour un outil local mono-utilisateur ; à revoir si un
déploiement serverless devient pertinent un jour.

### Ce qui est fait
- Connecteurs `server/import/chesscom.ts` (archives mensuelles paginées,
  parcourues de la plus récente à la plus ancienne) et `lichess.ts` (un seul
  flux PGN streamé, déjà trié). Aucun plafond artificiel de parties comme le
  prototype (20 max, 60 demi-coups max) : configurable jusqu'à 1000, partie
  entière analysée.
- **Seuls les coups du joueur identifié par son pseudo sont analysés** — même
  choix qu'en partie live (§7), et une vraie garde de sécurité : une partie
  dont le pseudo ne correspond à aucun des deux camps est ignorée plutôt que
  d'analyser les coups du mauvais camp.
- Dédoublonnage par `(source, externalId)` avant analyse : relancer un import
  saute les parties déjà en base sans les ré-analyser.
- Profondeur d'analyse plus faible qu'en direct (`IMPORT_ANALYSIS_DEPTH = 12`
  contre 16) — le débit prime sur la précision au coup près pour du volume.
- Annulation : `AbortController` par job (`server/import/job-runner.ts`),
  vérifié entre deux parties (pas entre deux coups — accepté comme grain de
  réactivité suffisant).
- Un seul job actif à la fois, appliqué par `startImport`.

### Vérifié en conditions réelles
Import Chess.com réel (compte public, 3 parties) via Playwright bout en bout :
3 parties trouvées, 3 analysées, 0 ignorée, 0 erreur console. Distribution des
qualités de coup cohérente avec le niveau du joueur importé (majorité
excellent/bon, peu d'erreurs) — signe que le pipeline produit une analyse
plausible, pas seulement qu'il ne plante pas.

### Décision différée
Comme en partie live, l'import **ne crée pas de puzzles** — seulement des
lignes `moves` qualifiées (quality, phase, motifs, mate manqué). Tout ce qu'il
faut pour dériver les decks (`categorizeDeck()`) est déjà là ; leur création
sert de tremplin à l'étape 4.

## 11. Étape 4 — Game Review

Revue de partie complète : plateau navigable, graphe d'évaluation, moments
clés, rejouer une erreur. Domaine pur sous `core/analysis/timeline.ts`,
lectures sous `server/queries/games.ts`, UI sous `client/features/games/`.

### Server Components pour la lecture, Server Actions pour l'écriture
Contrairement à `/play` et `/import` (client dès le départ, actions pour
chaque mutation), les pages `/games` et `/games/[id]` sont des **Server
Components** qui lisent directement via `server/queries/` — de simples
fonctions async, pas des `'use server'`. C'est le bon découpage Next.js : les
Server Actions sont pour les mutations déclenchées par un client, pas pour
composer une page en lecture seule. Seuls les îlots interactifs (plateau
navigable, graphe, réessai) sont des Client Components, alimentés par les
données déjà chargées côté serveur.

### `moves` ne porte que les coups du joueur — comment revoir toute la partie ?
Comme prévu depuis l'étape 2 : les coups de l'adversaire n'ont pas de ligne
analysée. `buildGameTimeline()` (`core/analysis/timeline.ts`) reconstruit les
**deux camps** depuis `games.pgn` (chess.js), puis superpose l'analyse
disponible sur les demi-coups du joueur. Le graphe d'évaluation n'a donc de
points qu'après les coups du joueur — la ligne traverse les réponses
adverses par un simple segment, sans point intermédiaire. Assumé et documenté
dans l'UI, pas caché : ce n'est pas une trace continue coup par coup.

### Palette du graphe : convention du domaine, pas la palette diverging générique
La skill dataviz recommande une paire divergente à deux teintes (bleu↔rouge)
pour un encodage de polarité. Choix différent ici, délibéré : clair = avantage
Blancs, sombre = avantage Noirs — la convention qu'un joueur d'échecs reconnaît
déjà (comme les pièces elles-mêmes), plus lisible pour ce public qu'une paire
de teintes arbitraire. Jetons `--eval-*` dans `globals.css`, **fixes quel que
soit le thème de l'appli** — comme un échiquier, dont les cases ne s'inversent
pas en mode sombre. Les marqueurs de moments clés réutilisent les jetons
`--quality-*` déjà validés en usage ailleurs dans l'app (statut, jamais la
couleur seule : toujours accompagnés d'un `<title>` et d'un libellé).

### Retry sans appel moteur
« Rejouer une erreur » (fonctionnalité phare de Chess.com Game Review, voir
benchmark) ne coûte aucune requête moteur : le meilleur coup est déjà connu
(`bestUci`/`bestSan`, stocké lors de l'analyse d'origine). `RetryBoard` compare
simplement le coup tenté à `bestUci` — comparaison de chaînes, chess.js pour
valider la légalité du coup essayé. Le score « précision » affiché n'est donc
pas recalculé/persisté façon Chess.com : c'est un retour immédiat correct/
incorrect par coup, sans état de session à gérer.

### Précision : approximation transparente, pas CAPS2
`computeAccuracy()` moyenne un poids fixe par qualité de coup (brillant/
excellent ≈ 100, gaffe ≈ 5). Explicitement **pas** une reproduction de
l'algorithme CAPS de Chess.com (non documenté publiquement, basé sur des
courbes de probabilité de gain) — assez pour classer/comparer des parties
entre elles, présenté comme approximatif dans l'UI.

### Deux bugs réels trouvés en testant avec de vraies données
Les deux corrigés dans `server/engine/node-stockfish-analyser.ts` :

1. **Un deuxième import faisait planter tout le serveur.** `new
   NodeStockfishAnalyser()` par job appelait `initEngine()` une seconde fois
   dans le même process Node — le module Emscripten ne le supporte pas
   (`WebAssembly.instantiate(): LinkError: memory import must be a
   WebAssembly.Memory object`), et l'exception, non rattrapée, tuait le
   process entier. Corrigé par un singleton (`getNodeStockfishAnalyser()`,
   pattern `globalThis` comme `server/db/index.ts`) : une seule instance pour
   toute la durée de vie du serveur, jamais recréée. La méthode `dispose()`
   a été retirée plutôt que laissée comme tentation.
2. **Initialiser le moteur Node écrase `global.fetch`.** Le bundle Stockfish
   contient un shim de compatibilité pensé pour un vieux Node sans fetch
   natif, qui met `global.fetch = null` sans condition liée à la présence
   réelle du fetch natif moderne. Comme `runImportJob` appelle `newGame()`
   (donc initialise le moteur) avant `fetchGames()`, le deuxième import
   voyait son propre appel réseau casser avec `fetch is not a function`.
   Corrigé : la référence native est capturée avant tout appel à
   `initEngine()` et restaurée juste après si elle a été effacée.

Aucun des deux ne s'est révélé lors des tests de l'étape 3 (un seul import
par session de test à l'époque) — trouvés seulement en rejouant plusieurs
imports d'affilée dans la même session serveur, ce que fait un usage réel.

### Vérifié en conditions réelles
Deux imports Chess.com réels et **consécutifs** dans la même session serveur
(preuve directe que le bug n°1 est corrigé) : 0 erreur, serveur toujours
vivant. Puis, via Playwright, sur les parties importées : liste, détail,
navigation par la liste des coups (105 boutons), clic sur un moment clé,
et activation du mode réessai sur un vrai coup erroné (position, prompt et
meilleur coup tous corrects) — 0 erreur console sur l'ensemble.
effective est le travail de l'étape 6 (Practice v2 / FSRS), pas de celle-ci.
