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
