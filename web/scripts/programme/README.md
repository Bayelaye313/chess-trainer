# Programme 1000 Heures — pipeline de contenu

Produit `src/core/programme/content/phase-<n>.json`, lu par l'onglet `/programme`.
Toutes les commandes se lancent depuis `web/`.

```sh
# Prérequis : le dump officiel des puzzles Lichess (CC0)
#   https://database.lichess.org/#puzzles → data/import/academy/lichess_db_puzzle.csv.zst
npm run programme:generate -- 1            # select + verify + build (≈ 7 min + ≈ 45 min de Stockfish)
npm run programme:generate -- 1 select     # une étape seulement
SHARDS=3 DEPTH=18 npm run programme:generate -- 1 verify
```

| Étape | Ce qu'elle fait |
|---|---|
| `select` | Une passe sur le dump. Pour chaque jour de la spec (`src/core/programme/content/phase-<n>.spec.ts`) : tags Lichess du concept, **filtre géométrique** vérifié sur l'échiquier (`geometry.mts`), fenêtre de rating autour de l'Elo cible du jour, longueur de combinaison bornée par la phase. Un puzzle et une partie d'origine ne servent qu'une fois par phase. Sortie : `data/programme/phase-<n>/selected.json`. |
| `verify` | Stockfish 18 sur chaque coup du solveur (`verify-worker.mts`, `SHARDS` processus). Un coup passe s'il est le meilleur, ou aussi bon à 30 cp près ; les coups équivalents (MultiPV 3) sont enregistrés pour être acceptés par l'écran. |
| `build` | Garde uniquement les puzzles validés. Positions ≤ 7 pièces : contrôle supplémentaire par la tablebase Syzygy (`tablebase.mts`). Positions pédagogiques construites (Lucena, Philidor, avec leurs symétries) : validées coup par coup par la tablebase, marquées `position_pedagogique`. Calcule le squelette (`core/programme/skeleton.ts`) et écrit le JSON. |

Traçabilité : chaque puzzle porte `source`, `puzzle_id`, `url` (page Lichess ou syzygy-tables.info)
et `verification` (moteur, profondeur, évaluation, date, verdict tablebase éventuel).
Aucune position n'est écrite à la main sans être signalée comme construite.

## Ajouter une phase

1. Écrire `phase-<n>.spec.ts` (cours, métaphores de `metaphors.ts`, règles de sourcing).
2. L'enregistrer dans `SPECS` (`generate-phase.mts`) et dans `server/programme/content.ts`.
3. Lancer le pipeline, puis `npm test` : `programme-content.test.ts` vérifie les règles
   du cahier des charges (240 min, pauses SMR, hack différent chaque jour, métaphores
   jamais isolées, puzzles légaux et traçables).

Le dump du 2026-10 présent en local est tronqué (≈ 3,5 M lignes lisibles sur ≈ 5,6 M) :
le lecteur s'arrête proprement à la coupure. Retélécharger le fichier élargit le choix.
