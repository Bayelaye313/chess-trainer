# Phase 1 : le modèle à reproduire

Résumé tiré du code, relu le 2026-11-04. Chemins relatifs à `web/`.

## Où vit quoi

| Élément | Fichier |
|---|---|
| Définition des 5 phases (Elo, semaines, longueur des combinaisons, temps du blindfold) | `src/core/programme/phases.ts` |
| Planning type d'un jour (240 min, blocs A→H, pauses SMR) | `phases.ts` : `conceptDayPlanning`, `retentionDayPlanning` |
| Spec rédigée d'une phase (texte des cours, règles de sourcing) | `src/core/programme/content/phase-1.spec.ts`, types dans `spec-types.ts` |
| Bibliothèque des lieux du palais (méthode des loci) | `src/core/programme/metaphors.ts` |
| Hacks visuels (un par jour, jamais deux fois de suite) | `src/core/programme/visual-hacks.ts` |
| Contenu généré, lu par l'écran | `src/core/programme/content/phase-1.json` (1,4 Mo) |
| Pipeline de génération | `scripts/programme/generate-phase.mts` (+ `geometry.mts`, `lichess-csv.mts`, `verify-worker.mts`, `tablebase.mts`) |
| Progression adaptative et portes de passage | `src/core/programme/adaptive.ts`, `session-plan.ts` |
| Persistance | tables `programme_state`, `programme_sessions`, `programme_puzzle_results` (`src/server/db/schema/programme.ts`, migration `0016_curvy_red_skull`) |
| Écran | `src/app/programme/page.tsx`, `src/client/features/programme/*`, `src/server/queries/programme.ts`, `src/server/actions/programme.ts` |
| Phases chargées par le serveur | `src/server/programme/content.ts` |
| Règles du cahier des charges, vérifiées à chaque `npm test` | `src/core/programme/programme-content.test.ts` |

## Structure d'une phase

- **Durée.** Une semaine compte 7 jours de 240 min (4 h), soit 28 h. La phase 1 dure 7 semaines (S1 à S7) : 49 jours, 196 h. Les semaines sont numérotées sur tout le programme, de sorte que `S<n>J<m>` reste unique.
- **Jours 1 à 6 (concept).** Un lieu du palais par jour. Le planning enchaîne :
  - cours (40 min) ;
  - échauffement sous hack visuel : 2 puzzles des jours précédents ;
  - puzzles 1 à 3, puis 4 à 6 : on désigne le squelette, puis on résout ;
  - blindfold (20 min) ;
  - partie lente 15+10 contre un bot réglé vers l'Elo cible ;
  - reconsolidation active (20 min) : dessin de mémoire, reconstruction inverse ou récitation ;
  - checklist ;
  - 4 pauses SMR de 6 à 8 min entre les blocs.
- **Jour 7 (rétention).** Pas de nouveau contenu. Le jour comprend :
  - un test de rétention : un puzzle par jour de la semaine précédente, en reprenant en priorité ceux qui ont été ratés ;
  - la visite du palais, à l'endroit puis à l'envers ;
  - 4 puzzles entrelacés, tirés des jours antérieurs en alternant récents et anciens ;
  - un blindfold ;
  - une partie longue 30+0 annotée.
- **Volume par jour de concept.** Le joueur fait 8 puzzles (2 d'échauffement et 6 principaux) et 1 blindfold. Le générateur fournit 6 puzzles principaux, une réserve de 16 au plus et 1 blindfold. La phase 1 compte 252 puzzles principaux, 670 en réserve et 49 blindfolds.
- **Types d'exercices.** Il y a quatre types de puzzle : squelette puis solution, blindfold, rétention et entrelacé. S'y ajoutent la reconsolidation (`dessin_memoire`, `reconstruction_inverse`, `recitation`, `test_retention_j7`), la partie contre un bot et la checklist.
- **Thèmes de la phase 1 (un quartier par semaine).**

  | Semaine | Quartier | Thèmes |
  |---|---|---|
  | S1 | La Cathédrale | colonnes, 7e rangée, batterie, couloir, pièces non défendues |
  | S2 | Les Remparts | chaînes de pions, pion isolé, pions doublés, pion passé, règle du carré, majorité |
  | S3 | Le Jardin | finales de pions : roi actif, opposition, triangulation, pion éloigné, percée, zugzwang |
  | S4 | L'Atelier | clouage, enfilade, fourchette, découverte, surcharge et déviation, pièce piégée |
  | S5 | Le Sanctuaire | cases faibles, fianchetto, bon et mauvais fou, paire de fous, cavalier contre fou, roi exposé |
  | S6 | Le Donjon | attaque de pions, attraction, figures de mat, Fxh7+, élimination du défenseur, mat en 2-3 |
  | S7 | Les Remparts de la Tour | tour active, coupure, Lucena, Philidor, passage en finale de pions, pion passé en finale de tours |

## Plage d'Elo des puzzles

- **Elo cible du jour.** Il monte linéairement de `eloDebut` à `eloFin` sur la phase, arrondi à 10 (`targetElo`). En phase 1 : de 1500 à 1700.
- **Sélection.** Le générateur retient les puzzles notés entre T − 300 et T + 200, répartis en trois bandes :
  - `mid` (± 100) : 13 candidats ;
  - `low` (de − 200 à − 100) : 5 ;
  - `high` (au-dessus de + 100) : 5 ;
  - plus 3 candidats blindfold.
- **Garde-fou.** Les puzzles par défaut restent dans T ± 200, ce qu'un test vérifie. Constaté en phase 1 : de 1485 à 1710.
- **Fenêtre adaptative.** Elle se décale par pas de 50, dans la limite de ± 200 :
  - elle monte si la réussite complète sur les 10 dernières séances dépasse 75 % ;
  - elle baisse sous 50 %.
  - Une réussite complète, c'est le squelette ET la solution justes.
- **Longueur des combinaisons.** Elle est bornée par `soloMoves` (1 à 3 coups du solveur en phase 1) et croît dans la phase (`maxSolverMoves`).
- **Blindfold.** La position reste affichée 30 s au début de la phase, 20 s à la fin. Le générateur ne prend que des combinaisons d'au plus 2 coups, d'au plus 13 pièces, et pas plus difficiles que la cible.

## Critères de passage (phase 1)

- **Semaine.** Le test du jour 7 doit atteindre au moins 70 % de réussites complètes (`RETENTION_PASS`). Sinon, la semaine est rejouée avec des puzzles neufs pris dans la réserve (`repetition` + 1).
- **Phase.** Il n'y a pas de porte propre à la phase : réussir le jour 7 de la dernière semaine fait passer à la semaine suivante.

## D'où viennent les données

1. **`select`** fait une passe en flux sur le dump officiel `data/import/academy/lichess_db_puzzle.csv.zst` (<https://database.lichess.org/#puzzles>, CC0). Il n'y a pas d'index : chaque génération relit le dump. Les filtres appliqués :
   - qualité : popularité ≥ 80, au moins 150 parties jouées, écart de classement (RD) ≤ 100 ;
   - tags Lichess du concept ;
   - filtre géométrique vérifié sur l'échiquier (`geometry.mts`), avec repli sur les tags seuls ;
   - unicité : un puzzle et sa partie d'origine ne servent qu'une fois **dans la phase**.
2. **`verify`** passe chaque coup du solveur à Stockfish 18 (WASM « lite-single », profondeur 18, MultiPV 3). Un coup est accepté s'il est le meilleur ou à 30 cp près ; les coups équivalents sont enregistrés.
3. **`build`** contrôle les positions de 7 pièces ou moins avec la tablebase Syzygy (tablebase.lichess.ovh). Les positions construites (Lucena, Philidor et leurs symétries) sont validées par la tablebase. Il calcule ensuite le squelette (`skeleton.ts`) et écrit le JSON.

En phase 1 : 1 086 candidats vérifiés, en environ 45 min avec 3 processus Stockfish.

## Ce qui change d'une phase à l'autre

| Paramètre | Où |
|---|---|
| Elo de début et de fin (donc Elo cible et fenêtre de sélection) | `PHASES` |
| Semaines (durée) | `PHASES` |
| Longueur des combinaisons (`soloMoves`) | `PHASES` |
| Temps d'affichage du blindfold | `PHASES` |
| Thèmes, quartiers, textes, tags et filtres géométriques | `phase-<n>.spec.ts` |
| Nouveaux lieux | `metaphors.ts` (un nouveau quartier par semaine, les anciens jamais redessinés) |
| Positions construites | `PHASE_<n>_CONSTRUCTED` |

Le reste est commun à toutes les phases : planning, quotas, seuils adaptatifs, règles du test de contenu.
