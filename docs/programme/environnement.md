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

## Reprise du 2026-11-05

Relevé de départ (12:40) : 1 759 Mo disponibles, swap 1 927 Mo. Aucun Stockfish, `next dev`, vitest ni Playwright étranger. Seul `next-server` tournait : c'est l'application absentéisme (port 3000, `~/Desktop/absenteisme-app`), un service permanent quasi entièrement en swap, non compté comme charge.

Lanceur : `runner.sh` (scratchpad de session). Avant chaque lot, il fait `free -m` et `ps aux --sort=-rss | head -15`. En présence d'une charge externe, il attend 5 min, et s'arrête après 3 contrôles. Chaque lot tourne sous `/usr/bin/time -v`, dans son propre groupe de processus (`setsid`). Un lot est tué si le swap monte de plus de 32 Mo, puis le lot suivant est réduit de moitié (minimum 10). Le lanceur s'arrête après 2 essais réduits ratés de suite.

| Étape | Pic (Maximum resident set size) | Lots | Arrêts |
|---|---|---|---|
| Phase 4 : `verify`, 443 → 687/1088 | 245 Mo | 75, puis 18, puis 10 | 7 lots tués sur hausse du swap, chaque fois suivis d'un lot réduit réussi : la règle des 2 essais n'a pas été atteinte |

- **Défaut du lanceur, corrigé.** Les trois premiers arrêts (12:41 à 12:43) viennent de mon lanceur, pas du poste : tuer le lot ne tuait pas le `verify-worker` petit-enfant, et jusqu'à 3 moteurs ont tourné en parallèle. J'ai tué les workers et retiré 39 doublons de `verify-0.jsonl`, aux verdicts identiques (sauvegarde : `verify-0.jsonl.bak-dups`). Le lanceur tue maintenant le groupe entier, et j'ai remis le décompte des essais à zéro.
- **Arrêt à 13:11 : charge externe persistante (3 contrôles à 5 min d'intervalle).** Une autre session Claude Code a lancé `vitest run` (13:01), puis `next dev -p 3131` et `next dev` dans `chess-trainer/web` (13:06 et 13:09, `next-server` ≈ 250 Mo). Une autre session encore a lancé trois Stockfish natifs dans `~/Desktop/chess/ct-audit-puzzles/web` (≈ 3 × 206 Mo, 13:07). Firefox était à ≈ 800 Mo. Au moment de l'arrêt : 628 Mo disponibles, swap 2 728 Mo.
- **État.** Phase 4 : 687/1088 candidats vérifiés, conservés dans `web/data/programme/phase-4/verify-0.jsonl`. `build` n'a pas été lancé. Phase 5 : rien n'a été lancé (ni `select`, ni `verify`, ni `build`). Pour reprendre, suivre la même commande que plus haut, une fois le poste libéré.

## Reprise et fin du 2026-11-05 (après-midi)

Lanceur versionné : `web/scripts/programme/run-step.sh` (usage et commande de reprise dans `web/scripts/programme/README.md`). Changements par rapport au lanceur du matin :

- verrou `/tmp/programme.lock` (PID), retiré à la sortie, y compris sur arrêt ;
- face à une charge externe (Stockfish, `next dev` / `next-server`, vitest, vérificateur étranger), **attente sans limite**, avec un contrôle toutes les 5 min, sans compter d'essai. Le `next-server` de l'application absentéisme est ignoré d'après son répertoire, et non plus d'après son PID, qui change à chaque redémarrage ;
- si le swap monte pendant notre propre lot : lot réduit de moitié (minimum 10), sans jamais abandonner ;
- un seul moteur, groupe de processus tué à l'arrêt ;
- `run-step.sh exec` fait passer `tsc`, lint, vitest, `next build` et le contrôle dans l'application par le même verrou et la même mesure.

Règle du minimum (`coverage.mjs`) : 13 candidats validés par jour de concept (6 puzzles, 1 blindfold, 6 en réserve pour rejouer une semaine après un échec à la rétention), plus 1 blindfold par semaine. Cela fait 553 pour les 42 jours d'une phase, 830 avec la marge de 50 %. La spec ne chiffre aucune réserve minimale : ce minimum est déduit de la porte de rétention (`adaptive.ts`).

| Étape | Pic (Maximum resident set size) | Durée | Swap | Arrêts |
|---|---|---|---|---|
| Phase 4 : règle du minimum à 687/1088 | — | — | — | Non couverte : 16 jours (S27 à S29) sans assez de candidats vérifiés, d'où la vérification complète |
| Phase 4 : `verify`, 687 → 1088 (6 lots) | 245 Mo | 24 min | 1 790 → 1 781 Mo (max 1 793) | aucun |
| Phase 4 : `build` | 154 Mo | 3 min 15 | stable | — |
| Phase 5 : `select` | 317 Mo | 5 min 51 | 1 781 → 1 788 Mo | — |
| Phase 5 : `verify`, 0 → 1085 (15 lots) | 245 Mo | 1 h 13 | stable (max 1 788 Mo) | aucun |
| Phase 5 : `build` | 155 Mo | 1 min 50 | stable | — |
| `tsc` | 861 Mo | 10 s | stable | — |
| lint | 831 Mo | 15 s | stable | — |
| `vitest run` | 538 Mo | 15 s | stable | — |
| `next build` | 864 Mo | 15 s | stable | — |
| contrôle dans l'application (`ui-check.sh 23:1 30:1`, `next start` + Chromium) | 188 Mo | 3 min 25 | stable | — |

Aucune attente pour charge externe et aucun lot réduit cet après-midi. Le pic absolu reste `next build` (864 Mo), sous le plafond de 1,2 Go.

**Chromium headless sur ce poste.** Par intermittence, le `headless_shell` de Playwright ne produit plus aucune image : `requestAnimationFrame` n'est jamais appelé, et les captures comme les clics restent « en attente de stabilité ». Ce n'est pas lié à l'application : la page de test vide se bloque aussi. Le rendu logiciel (`--use-gl=swiftshader --enable-unsafe-swiftshader --disable-gpu-compositing`) corrige le problème (3 lancements réussis sur 3). `play-day.mjs` l'utilise, relance le navigateur si le rendu reste bloqué, et attend un échiquier immobile avant chaque glisser-déposer : un décalage de l'échiquier avait fait déposer Rf1 en b1 au lieu de a1. Résultat : deux passages complets de S23J1 et S30J1, chacun avec 8 puzzles sur 8 résolus en jouant la solution, le blindfold, une séance « completed » et le curseur avancé en base.
