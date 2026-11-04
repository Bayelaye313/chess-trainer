# Environnement de la machine (relevé du 2026-11-04)

Relevé fait avant tout téléchargement ou calcul pour les phases 2 à 5 du Programme 1000 heures.

## Mesures

| Ressource | Valeur |
|---|---|
| RAM totale | 3,8 Gio (4 004 172 kB) |
| RAM disponible | **823 Mio** (MemAvailable 841 500 kB) |
| Swap | 3,8 Gio, entièrement occupé (560 Kio libres) |
| Disque libre (`/`) | 67 Go sur 98 Go |
| CPU | Intel Xeon Gold 6442Y, 4 cœurs logiques |

Les processus qui occupent le plus de mémoire au moment du relevé : un `next-server` déjà lancé (≈ 450 Mo), VS Code (≈ 700 Mo sur plusieurs processus), Firefox (≈ 380 Mo), deux sessions Claude Code (≈ 450 Mo), Xorg et GNOME Shell (≈ 190 Mo).

## Dump Lichess

- Fichier attendu par `web/scripts/programme/generate-phase.mts` : `web/data/import/academy/lichess_db_puzzle.csv.zst`, source officielle <https://database.lichess.org/#puzzles> (CC0).
- Sur le poste : 43,7 Mo compressés, tronqué (≈ 3,5 M de lignes lisibles sur ≈ 5,6 M).
- Le dump complet fait environ 1 Go décompressé. Le seuil disque (3 × la taille décompressée, soit ≈ 3 Go) est largement respecté.

## Application de la règle

> Si la RAM disponible est < 3 Go ou l'espace libre < 3 × la taille décompressée du dump : ne rien télécharger, ne lancer aucune génération, s'arrêter.

- Disque : conforme (67 Go libres pour ≈ 3 Go requis).
- RAM : **non conforme** (823 Mio disponibles pour 3 Go requis, et le swap est plein).

Je n'ai donc rien téléchargé et je n'ai lancé aucune génération.

## Ce qu'il faudrait pour continuer

La machine n'a que 3,8 Gio de RAM au total. Atteindre 3 Go disponibles demande de libérer presque tout le reste :

1. arrêter le `next-server` déjà lancé ;
2. fermer Firefox et les sessions Claude Code en trop ;
3. idéalement fermer VS Code et lancer la génération depuis un terminal seul.

Autre option : abaisser le seuil. La sélection lit le `.zst` en flux (`scripts/programme/lichess-csv.mts`). La vérification lance 3 processus Stockfish en parallèle par défaut, mais la variable `SHARDS=1` réduit ce nombre à un seul. Je n'ai pas mesuré la mémoire réellement consommée. Le seuil est une règle de la mission : c'est à vous de décider de le changer.
