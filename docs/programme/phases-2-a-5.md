# Phases 2 à 5 : specs

Les phases 2 à 5 reprennent le format de la phase 1 (voir `phase-1-modele.md`). Chaque phase a une spec `web/src/core/programme/content/phase-<n>.spec.ts`, avec les mêmes champs jour par jour. Les jours 7 sont produits par `retention-day.ts`, l'équivalent du `RET` de la phase 1 ; le dernier jour 7 d'une phase y ajoute le bilan.

## Durées : le calcul

- **Rythme de la phase 1.** Un jour dure 240 min, soit 4 h ; une semaine, 28 h. La phase 1 compte 7 semaines, soit 196 h.
- **Cible.** Environ 1000 h. Avec 28 h par semaine, 1000 / 28 = 35,7 semaines, d'où 36 semaines (1008 h). C'est déjà la valeur de `TOTAL_WEEKS`.
- **Répartition.** Il reste 29 semaines après la phase 1. Elles sont réparties selon l'écart d'Elo de chaque phase et la difficulté croissante d'un point d'Elo à haut niveau :

| Phase | Elo | Semaines | Jours | Heures |
|---|---|---|---|---|
| 1 | 1500 → 1700 | S1–S7 (7) | 49 | 196 |
| 2 | 1700 → 1900 | S8–S14 (7) | 49 | 196 |
| 3 | 1900 → 2100 | S15–S22 (8) | 56 | 224 |
| 4 | 2100 → 2250 | S23–S29 (7) | 49 | 196 |
| 5 | 2250 → 2400 | S30–S36 (7) | 49 | 196 |
| **Total** | | **36** | **252** | **1008** |

- **Changement par rapport au code de la phase 1.** `phases.ts` prévoyait 2100 → 2300 sur 8 semaines puis 2300 → 2400 sur 6 semaines. Les phases 4 et 5 suivent maintenant la progression indicative demandée (2100 → 2250 → 2400), avec 7 semaines chacune. Les identifiants de phase deviennent `2100-2250` et `2250-2400` ; ils ne sont stockés nulle part en base.
- **La phase 3 dure une semaine de plus.** Elle introduit la stratégie (évaluation, structures, prophylaxie), qui demande plus de temps de consolidation que la tactique.

## Plages de difficulté des puzzles

La logique de la phase 1 est inchangée :
- l'Elo cible du jour monte linéairement dans la phase ;
- le générateur sélectionne de T − 300 à T + 200 ;
- les puzzles par défaut restent dans T ± 200 ;
- la fenêtre adaptative décale la cible de ± 200 au plus.

| Phase | Elo cible (T) | Sélection | Coups du solveur | Blindfold |
|---|---|---|---|---|
| 2 | 1700 → 1900 | 1400 – 2100 | 2 → 4 | 20 s → 15 s, ≤ 2 coups |
| 3 | 1900 → 2100 | 1600 – 2300 | 2 → 5 | 15 s → 12 s, ≤ 2 coups |
| 4 | 2100 → 2250 | 1800 – 2450 | 3 → 6 | 12 s → 10 s, ≤ 3 coups |
| 5 | 2250 → 2400 | 1950 – 2600 | 3 → 7 | 10 s → 8 s, ≤ 3 coups |

- **Phase 5.** Le maximum de coups du solveur passe de 8 à 7 : au-delà, les puzzles Lichess qui passent les filtres de qualité deviennent trop rares pour remplir les jours.
- **Blindfold des phases 4 et 5.** Ces phases n'acceptent pas de combinaison de moins de 3 coups. Le blindfold y prend donc les combinaisons les plus courtes de la phase, soit 3 coups, au lieu de 2 (`BLIND_MAX_SOLVER` dans le générateur).

## Volume quotidien et révisions espacées

- **Volume.** Il est identique à la phase 1 :
  - jours 1 à 6 : 2 puzzles d'échauffement (jours antérieurs), 6 puzzles principaux et 1 blindfold ;
  - jour 7 : 6 puzzles de rétention (un par jour de la semaine précédente), 4 puzzles entrelacés et 1 blindfold.
- **Révisions espacées, à trois niveaux.**
  1. *Intra-semaine.* Chaque cours rappelle 2 ou 3 lieux déjà visités (`rappels`).
  2. *J+7.* Le test de rétention du jour 7.
  3. *À long terme.* Un lieu revient plusieurs phases plus tard avec un nouvel étage (même image, règle approfondie). Par exemple, le Phare revient en S2, S12, S16 et S33 ; la Pierre descellée de S1 revient en S36. L'échauffement et l'entrelacement tirent aussi des puzzles de tout l'historique, phases précédentes comprises (`interleavedReview`).
- **Garde-fou.** Le test `programme-content.test.ts` vérifie sur les 252 jours qu'aucun lieu n'est isolé et qu'aucun rappel ne vise un lieu pas encore visité.

## Thèmes

| Phase | Semaines | Quartiers et thèmes |
|---|---|---|
| 2 | S8 | **Forge**, le calcul tactique : coups forcés, coup intermédiaire, coup tranquille, dégagement, interception, combinaisons à deux motifs |
| | S9 | **Bastion**, la défense : coup unique, nulle par perpétuel, contre-attaque, dernière rangée, pièce piégée, découvertes |
| | S10 | **Port**, les finales de pièces mineures : cavalier, fou, fous opposés, blocus, promotion, zugzwang |
| | S11 | **Arsenal**, les finales lourdes : dames, dame et tour, tour active, coupure, défense de tours, roi actif |
| | S12 | **Faubourg**, les structures : pions pendants, pion isolé, attaque de minorité, rupture, avant-poste, pions doublés |
| | S13 | **Citadelle**, l'attaque : roques opposés, sacrifice de qualité, sacrifice sur le roque, figures de mat, fianchetto, mat en 3 |
| | S14 | Tour de la Cité : synthèse et bilan |
| 3 | S15 | **Observatoire** : déséquilibres, qualité contre pièce, paire de fous, mauvais fou, cavalier contre fou, pièce mal placée |
| | S16 | **Bibliothèque** : espace, Carlsbad, pion isolé, pions pendants, chaînes, blocus |
| | S17 | **Chantier** : prophylaxie, coup tranquille profond, restriction, défense longue, initiative, forteresse |
| | S18 | Citadelle (attaque) |
| | S19 | Port (finales mineures et tour contre pièce) |
| | S20 | Forge (calcul profond) |
| | S21 | Arsenal (finales lourdes) |
| | S22 | Tour de la Cité : synthèse et bilan |
| 4 | S23 | **Labyrinthe**, le calcul long : arbre de variantes, réfutation, coup tranquille au fond, coups intermédiaires, lignes, trois motifs |
| | S24 | Port |
| | S25 | Arsenal (plus les cases correspondantes) |
| | S26 | Citadelle (roi au centre, chasse au roi, mats longs) |
| | S27 | Observatoire (**Bascule** : transition vers la finale) |
| | S28 | Bastion |
| | S29 | Tour de la Cité : synthèse et bilan |
| 5 | S30 | **Théâtre** : moment critique, contrôle de bévue, coup naturel qui perd, calcul à la pendule, pièges, prophylaxie avant combinaison |
| | S31 | Finales de maître |
| | S32 | Citadelle |
| | S33 | Bibliothèque |
| | S34 | Labyrinthe et Forge |
| | S35 | Bastion |
| | S36 | Tour final : bilan du programme |

- **Nouveaux lieux.** On en compte 30 : 19 en phase 2, 5 en phase 3, 3 en phase 4 et 3 en phase 5. Les 144 autres jours de concept font revenir des lieux existants avec un nouvel étage.
- **Méthode.** Chaque cours est fait d'une image, d'une règle et d'un lien vers un lieu plus ancien, et chaque puzzle commence par la désignation de son squelette. Aucun exercice ne demande d'apprendre des variantes par cœur.
- **Ouvertures.** En phase 3, la « préparation d'ouverture » est traitée comme la compréhension des *structures* qui en sortent, avec deux plans par structure.
- **Parties de maîtres (base Masters).** Elles ne sont pas intégrées, comme en phase 1.

## Critères de passage

- **Semaine.** La règle est inchangée : au moins 70 % de réussites complètes au test du jour 7 (`RETENTION_PASS`). Sinon, la semaine est rejouée avec des puzzles neufs.
- **Bilan de fin de phase (nouveau).** Il a lieu au jour 7 de la dernière semaine de chaque phase (S7, S14, S22, S29, S36) : `phaseReview` dans `adaptive.ts`, appelé par `completeProgrammeSession`.
  1. Le test de rétention du jour doit être réussi (au moins 70 %).
  2. La réussite complète (squelette ET solution) sur les 6 jours de concept de cette semaine, même répétition, doit atteindre au moins **60 %** (`PHASE_PASS`).
  3. Si les deux critères sont remplis, la phase suivante se débloque (curseur en S+1). Sinon, la dernière semaine est rejouée avec des puzzles neufs, comme pour un échec de rétention.

  Les tables `programme_*` suffisent : le calcul lit `programme_sessions`, et aucune migration n'est nécessaire.

## Valeurs à recaler après la première semaine de pratique

Aucune statistique de progrès n'est avancée. Ces seuils reprennent la logique de la phase 1 et ne sont que des points de départ :

| Valeur | Départ | Où | Comment la recaler |
|---|---|---|---|
| `PHASE_PASS` (réussite de la dernière semaine) | 0,60 | `adaptive.ts` | Placée entre `LOWER_BELOW` (0,50) et `RETENTION_PASS` (0,70). À ajuster selon le taux réel sur des semaines jouées. |
| `RETENTION_PASS` | 0,70 | `adaptive.ts` | Repris de la phase 1. |
| `RAISE_ABOVE` / `LOWER_BELOW` | 0,75 / 0,50 | `adaptive.ts` | Repris de la phase 1. Si le décalage reste collé à ± 200, la plage du jour est mal centrée. |
| Elo de début et de fin de chaque phase | voir le tableau | `phases.ts` | À confronter à l'Elo réel (tuile « Elo actuel »). |
| Temps d'affichage du blindfold | voir le tableau | `phases.ts` | Si le taux de réussite du blindfold est très inférieur à celui des puzzles, rallonger. |
| `soloMoves.max` | 4 / 5 / 6 / 7 | `phases.ts` | Selon le temps réellement passé par puzzle. |
