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

## Mise à jour du 2026-11-04 (règle assouplie)

Nouvelle règle : RAM disponible d'au moins 1,8 Go au départ, un seul processus lourd à la fois, vérification Stockfish avec `SHARDS=1`, `Threads 1` et `Hash 64`, pic mémoire mesuré avec `/usr/bin/time -v`, arrêt d'un lot si le pic dépasse 1,2 Go ou si le swap augmente.

- **Relevé de départ** (`free -m`, après fermeture de next-server et de Firefox) : 1 843 Mo disponibles, au-dessus du seuil de 1,8 Go. VS Code reste ouvert, car cette session tourne dans son extension.
- **Autre activité sur le poste.** Une seconde session Claude Code (pid 141692) a lancé un Stockfish natif (≈ 400 Mo) pendant la sélection de la phase 2. VS Code (tsserver ≈ 500 Mo) monte aussi quand des fichiers `.ts` sont ouverts. Le swap a augmenté pendant ce lot (1 196 → 1 878 Mo) alors que la sélection elle-même ne dépassait pas 334 Mo.

## Dump Lichess (étape 2)

| Contrôle | Attendu | Obtenu |
|---|---|---|
| Taille (`content-length` du serveur) | 309 751 173 octets | 309 751 173 octets |
| SHA-256 (`https://database.lichess.org/sha256sums.txt`) | `7b0d235f…f94253` | identique |
| Lignes (`zstdcat \| wc -l`, en flux) | 6 193 530 puzzles annoncés + 1 en-tête | 6 193 531 |
| Lignes lues par le générateur (`lichess-csv.mts`, en flux) | 6 193 530 | 6 193 530 |

- **Téléchargement.** `curl -C -` depuis <https://database.lichess.org/lichess_db_puzzle.csv.zst> (dernière modification côté serveur : 2026-11-01), réussi du premier coup. Pic de 12,6 Mo pour le comptage en flux.
- **Ancien fichier.** Le fichier tronqué est conservé dans `web/data/import/academy/download/lichess_db_puzzle.truncated-2026-11-02.csv.zst` (hors dépôt, dans `data/`).
- **Indexation.** Le pipeline du programme n'utilise pas d'index : `select` relit le `.zst` en flux à chaque génération, sans jamais le décompresser sur disque. Il n'y a rien à refaire.

## Pics mémoire mesurés

Le journal brut est `web/data/programme/measures.log` (une ligne par étape ou par lot). Synthèse :

| Étape | Pic (Maximum resident set size) | Durée | Swap |
|---|---|---|---|
| Comptage des lignes du dump (`zstdcat \| wc -l`) | 12,6 Mo | 2 s | stable |
| Phase 2 : `select` | 334 Mo | 16 min | 1 196 → 1 878 Mo (autres processus, voir plus haut) |
| Phase 2 : `verify` (17 lots de 150, 75 ou 37) | 252 Mo | ≈ 1 h 10 de calcul | 6 lots arrêtés sur hausse du swap |
| Phase 2 : `build` | 168 Mo | 3 min | stable |
| Phase 3 : `select` | 329 Mo | 15 min | 2 138 → 2 437 Mo (autres processus) |
| Phase 3 : `verify` (17 lots de 75) | 246 Mo | ≈ 1 h 15 | aucun arrêt |
| Phase 3 : `build` | 142 Mo | 4 min 30 | stable |
| Phase 4 : `select` (2 passes) | 315 Mo | 7 min | stable |
| Phase 4 : `verify`, interrompu à 377/1088 | 242 Mo | — | 4 lots arrêtés, dont 2 réduits de suite : règle atteinte |
| `tsc` | 674 Mo | 4 s | — |
| `npm run lint` | 861 Mo | 13 s | — |
| `vitest run` (sans navigateur) | 465 Mo | 14 s | — |
| `next build` | 977 Mo | 18 s | — |

Aucun lot n'a approché le plafond de 1,2 Go : tous les arrêts viennent de la règle du swap.

## Arrêts et pauses

- **Règle appliquée.** Le swap monte de plus de 32 Mo pendant un lot ? Le lot est tué (les résultats déjà écrits restent, la reprise saute ce qui est fait), la taille est divisée par deux, puis on reprend. Après 2 essais réduits ratés de suite, arrêt.
- **Cause externe.** Pendant la journée, d'autres sessions Claude Code ont fait tourner sur le même poste des Stockfish natifs (jusqu'à 2 × 400 Mo, 300 % de CPU), un `next dev`, `vitest`, `tsc` et un Chromium Playwright. Quand l'un d'eux tournait au moment de l'arrêt, le lanceur faisait une pause, sans réduire la taille des lots ni compter un essai, puis reprenait 60 s après la fin de la charge externe. Les lots sont arrêtés quand même, comme l'exige la règle : seul le décompte change.
- **Phase 4.** Deux lots réduits (75, puis 37) ont été arrêtés de suite sans charge externe détectable : swap à 2,85 Go, 1 Go libre, pression générale du poste. Conformément à la règle, la génération des phases 4 et 5 s'est arrêtée là.
- **Reprise.** Les 377 candidats déjà vérifiés de la phase 4 sont conservés dans `web/data/programme/phase-4/verify-0.jsonl`. Pour reprendre, depuis `web/`, sur un poste moins chargé :
  ```sh
  LIMIT=75 npm run programme:generate -- 4 verify   # à répéter jusqu'à 1088/1088, ou sans LIMIT
  npm run programme:generate -- 4 build
  # puis ajouter phase-4.json dans src/server/programme/content.ts, et faire de même pour la phase 5
  ```
