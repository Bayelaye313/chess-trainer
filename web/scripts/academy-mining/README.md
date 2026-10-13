# Minage des puzzles de l'Académie

Scripts qui ont produit les lots 1 à 3 (octobre 2026) : `data/import/academy/lot*-*.json`.
Chaque puzzle est une position réelle (base Lichess ou étude), rejouée par chess.js
et vérifiée coup par coup par Stockfish avant import. Toutes les commandes se lancent
depuis `web/`.

## Puzzles tirés de la base Lichess

Prérequis : `data/import/academy/lichess_db_puzzle.csv.zst`, téléchargé depuis
<https://database.lichess.org/#puzzles> (CC0).

```sh
# 1. Une passe sur les ~6 M puzzles, un détecteur géométrique par thème
#    (~2 h pour tous les détecteurs ; ONLY=<thème> + un préfiltre FEN dédié : ~10 min)
node scripts/academy-mining/mine-lichess-puzzles.mjs data/import/academy/lichess_db_puzzle.csv.zst out/candidats.json

# 2. Sélection : 15 par thème, qualité, une position par partie, rien de déjà importé
node scripts/academy-mining/select-puzzles.mjs out/candidats.json out

# 3. Stockfish sur chaque coup du solveur (ici 6 processus en parallèle)
for i in 0 1 2 3 4 5; do SHARD=$i/6 node scripts/academy-mining/verify-stockfish.mjs out/verify-all-in.json out/v/vout-$i.json & done; wait

# 4. Fichiers d'import (seuls les puzzles validés sont gardés)
node scripts/academy-mining/build-import.mjs out/sel-all.json out/v data/import/academy lot4
```

- Ajouter un thème : écrire son détecteur `D["<themeId>"]` dans
  `mine-lichess-puzzles.mjs`, avec la source de sa définition en commentaire, puis
  relancer avec `ONLY=<themeId>` pour ne passer que lui.
- Les thèmes `tm-*` / `cm-*` sont remplacés (fichier `.override.json`). Les autres
  sont complétés jusqu'à 15 sans rien effacer (voir `seed-academy.ts`).

## Unicité de la solution (lot 5)

`verify-stockfish.mjs` accepte un coup « aussi bon » que le meilleur. Ça ne suffit
pas : dans une vague tirée d'une partie de maître, un coup calme admet souvent
plusieurs bonnes réponses, et le solveur refusait des coups corrects. Un puzzle
d'Apprendre doit donc aussi passer le contrôle d'unicité : à chaque coup du
solveur, au moins 10 points de probabilité de gain d'avance sur le 2e meilleur coup.

```sh
# Audit des puzzles en base (catégories pédagogiques), 3 processus
for i in 0 1 2; do SHARD=$i/3 node --import tsx scripts/academy-mining/check-uniqueness.mts out/u/all-$i.jsonl & done; wait
node scripts/academy-mining/classify-uniqueness.mjs out/u            # → out/u/classified.json
```

### Remplacer une vague ambiguë

```sh
# 1. Candidats du mineur pour les thèmes visés (ONLY=…)
# 2. Garde les puzzles uniques, tire des candidats pour compléter à 15
THEMES=pm-le-mauvais-fou,… node scripts/academy-mining/waves.mjs select out/candidats.json out/u out
# 3. Contrôle d'unicité des candidats
for i in 0 1 2; do INPUT=out/waves-check-in.json SHARD=$i/3 node --import tsx scripts/academy-mining/check-uniqueness.mts out/c/c-$i.jsonl & done; wait
# 4. Fichier de remplacement
node scripts/academy-mining/waves.mjs build out out/c data/import/academy/lot5-positionnel-verifie.override.json
```

### Coups équivalents acceptés par le solveur

Les puzzles qui restent ambigus (en attendant leur remplacement) acceptent les coups
que Stockfish juge aussi bons : l'échiquier joue alors le coup du maître et le
signale. Table générée, jamais écrite à la main :

```sh
for i in 0 1 2; do SHARD=$i/3 node --import tsx scripts/academy-mining/analyse-alternatives.mts out/ids.json out/alt/out-$i.jsonl & done; wait
node scripts/academy-mining/build-alternatives.mjs out/alt   # → src/core/curriculum/puzzle-alternatives.json
```

## Puzzles de finales tirés d'études

Lichess n'a presque pas de finales élémentaires à coup unique. Celles-ci viennent
donc d'études (PGN téléchargé depuis `https://lichess.org/study/<id>.pgn`) et des
chapitres déjà présents dans `COURSE_LESSONS`.

```sh
npx tsx scripts/academy-mining/extract-endgame-positions.ts out/positions.json out/wukLYIXj.pgn
node scripts/academy-mining/endgame-puzzles.mjs out/positions.json out/finales.json
# → out/finales.entries.json, au format d'import
```

Le tri final reste manuel. Au lot 3, 2 puzzles de pat ont été écartés parce que la
position n'était pas vraiment annulée, et les mats en 1 ont été retirés là où le
filtre qualité du seed les aurait de toute façon écartés.

## Seed

Déposer les fichiers dans `data/import/academy/`, sauvegarder la base
(`cp data/chess-trainer.db data/chess-trainer.db.bak-<date>-pre<lot>`), puis lancer
`npm run db:seed-academy`.
