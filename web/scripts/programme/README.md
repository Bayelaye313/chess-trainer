# Programme 1000 Heures — pipeline de contenu

Produit `src/core/programme/content/phase-<n>.json`, lu par l'onglet `/programme`.
Toutes les commandes se lancent depuis `web/`.

```sh
# Prérequis : le dump officiel des puzzles Lichess (CC0)
#   https://database.lichess.org/#puzzles → data/import/academy/lichess_db_puzzle.csv.zst
npm run programme:generate -- 2            # select + verify + build (phases dans l'ordre : 1, 2, 3, 4, 5)
npm run programme:generate -- 2 select     # une étape seulement (≈ 16 min sur le dump complet)
LIMIT=150 npm run programme:generate -- 2 verify   # un lot de 150 candidats non encore vérifiés, puis arrêt
SHARDS=3 DEPTH=18 npm run programme:generate -- 2 verify   # plusieurs moteurs (machine avec plus de RAM)
```

| Étape | Ce qu'elle fait |
|---|---|
| `select` | Une passe sur le dump. Pour chaque jour de la spec (`src/core/programme/content/phase-<n>.spec.ts`) : tags Lichess du concept, **filtre géométrique** vérifié sur l'échiquier (`geometry.mts`), fenêtre de rating autour de l'Elo cible du jour, longueur de combinaison bornée par la phase. Un puzzle et une partie d'origine ne servent qu'une fois dans **tout le programme** : ceux des `phase-<k>.json` déjà générés (k < n) sont exclus. Sortie : `data/programme/phase-<n>/selected.json`. |
| `verify` | Stockfish 18 sur chaque coup du solveur (`verify-worker.mts`, `SHARDS` processus, 1 par défaut, `Threads 1`, `Hash 64`). Reprise : les candidats déjà dans `verify-<i>.jsonl` sont sautés ; `LIMIT=<n>` traite un lot puis s'arrête. Un coup passe s'il est le meilleur, ou aussi bon à 30 cp près ; les coups équivalents (MultiPV 3) sont enregistrés pour être acceptés par l'écran. |
| `build` | Garde uniquement les puzzles validés. Positions ≤ 7 pièces : contrôle supplémentaire par la tablebase Syzygy (`tablebase.mts`). Positions pédagogiques construites (Lucena, Philidor, avec leurs symétries) : validées coup par coup par la tablebase, marquées `position_pedagogique`. Calcule le squelette (`core/programme/skeleton.ts`) et écrit le JSON. |

Traçabilité : chaque puzzle porte `source`, `puzzle_id`, `url` (page Lichess ou syzygy-tables.info)
et `verification` (moteur, profondeur, évaluation, date, verdict tablebase éventuel).
Aucune position n'est écrite à la main sans être signalée comme construite.

## Ajouter une phase

1. Écrire `phase-<n>.spec.ts` (exporte `PHASE_<n>_DAYS` et `PHASE_<n>_CONSTRUCTED` ; cours, métaphores de
   `metaphors.ts`, règles de sourcing). Le générateur la charge tout seul.
2. Après génération, ajouter `phase-<n>.json` dans `server/programme/content.ts`.
3. Lancer le pipeline, puis `npm test` : `programme-content.test.ts` vérifie les règles
   du cahier des charges (240 min, pauses SMR, hack différent chaque jour, métaphores
   jamais isolées, puzzles légaux et traçables).

Le dump local a été retéléchargé le 2026-11-04 (6 193 530 puzzles, SHA-256 vérifié contre
`https://database.lichess.org/sha256sums.txt`). Le lecteur tolère toujours un fichier tronqué
(il s'arrête proprement à la coupure).
