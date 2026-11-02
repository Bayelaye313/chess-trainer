# Refonte UX/UI — mesures avant → après

« Avant » = `docs/app-inventory.md` (relevé du 2026-10-19, base de 440 parties). « Après » = `docs/screens/redesign/mesures.json`
(2026-11-02, build de production, base de ce poste : 47 parties Chess.com + parties contre le bot jouées pendant les tests,
aucune ligne Lichess ni piège importé). Les hauteurs ne sont donc pas strictement comparables : les listes longues sont
désormais plafonnées par construction (10 ou 8 lignes + « Voir tout », blocs repliés), ce qui borne la hauteur quel que soit le volume.

## Parcours (clics depuis Aujourd'hui)

| Parcours | Avant | Après | Vérifié |
|---|---|---|---|
| a) Lancer une partie contre un bot | 1 (Club/Blancs par défaut), 2–3 sinon | 2 (« Jouer » → « Commencer ») ; **1** avec le dernier choix mémorisé (« Rejouer ») | e2e-game.mjs, t3 : `/jouer?rejouer=1` lance la partie |
| b) Reprendre un cours | 3, sans reprise de position | **1** (« Reprendre le cours » d'Aujourd'hui) ; 2 depuis Ouvertures (carte → « Reprendre le cours ») ; position mémorisée | e2e-flows.mjs `reprise-cours` |
| c) Réviser mes erreurs | 2 | 2 (« Réviser » → « Réviser » sur un deck, ou l'action principale du deck le plus chargé) | e2e-flows.mjs `deck` |
| d) Rapport sur une ouverture | 2 + défilement sous un tableau de 26 lignes | 2 (Progrès → ligne de « Mes ouvertures face au cours ») ; sans défilement sur desktop, 1 défilement sur mobile (section sous les chiffres) | capture `rapport` |
| e) Lier un compte | 1 + saisie, après défilement de l'accueil | 2 (pastille de synchro ou ⚙ → Réglages, « Lier ») + saisie, erreurs visibles | capture `plus` |
| f) Plan du jour | 1 par action + retour manuel à l'accueil | « Continuer » ouvre la 1re action ; la barre « Séance du jour · Action suivante » enchaîne les suivantes (1 clic chacune, sans retour) | t3 : puzzle → revue → piège |

## Écrans (hauteur en px, éléments interactifs visibles sans défiler, cibles < 44 px sur mobile)

| Écran | Hauteur desktop | Hauteur mobile | Visibles desktop | Visibles mobile | Cibles < 44 px (mobile) | Action principale visible (mobile) |
|---|---|---|---|---|---|---|
| `accueil` | 2 867 → 900 | 4 458 → 1 087 | 9 → 10 | 4 → 8 | 0 | oui |
| `rapport` | — → 1 496 | 5 650 → 2 509 | 1 → 5 | 1 → 1 | 0 | — |
| `rapport-brillants` | — → 900 | — → 844 | 10 → 2 | 5 → 2 | 0 | — |
| `rapport-ouvertures-scotch-game` | 3 884 → 1 280 | 8 027 → 2 215 | 33 → 16 | 2 → 8 | 0 | — |
| `entrainer` | — → 900 | — → 1 475 | 7 → 11 | 1 → 7 | 0 | oui |
| `entrainer-hub-erreurs-ouverture` | 14 545 → 1 055 | — → 1 128 | 11 → 35 | — → 28 | 0 | — |
| `apprendre` | 3 434 → 1 979 | 8 222 → 2 080 | 22 → 10 | 1 → 8 | 0 | oui |
| `apprendre-categorie-positional_mastery` | — → 1 277 | — → 1 306 | 10 → 10 | 8 → 10 | 0 | — |
| `apprendre-theme-pm-l-avant-poste-du-cavalier` | — → 977 | — → 1 740 | 18 → 17 | 10 → 9 | 2 | — |
| `ouvertures` | 3 397 → 1 113 | 7 664 → 2 314 | 2 → 21 | 1 → 7 | 0 | — |
| `ouvertures-scotch-game` | — → 900 | — → 844 | 8 → 5 | 2 → 5 | 0 | oui |
| `ouvertures-lichess-modern-defense` | 2 159 → 900 | 3 225 → 844 | 19 → 2 | 3 → 2 | 0 | — |
| `ouvertures-scotch-game-cours` | 2 002 → 1 346 | 2 796 → 2 110 | 34 → 52 | 11 → 15 | 54 | — |
| `ouvertures-queens-gambit-declined-cours` | 1 616 → 1 338 | 2 466 → 2 182 | 35 → 57 | 11 → 14 | 61 | — |
| `ouvertures-historique-endurance` | — → 900 | — → 844 | 4 → 0 | 1 → 0 | 0 | — |
| `pieges` | 3 414 → 900 | 9 444 → 844 | 15 → 12 | 4 → 12 | 0 | oui |
| `pieges-detail` | — → 1 083 | — → 957 | 2 → 2 | 3 → 3 | 0 | — |
| `plus` | — → 939 | — → 1 266 | 3 → 9 | 3 → 7 | 1 | — |
| `analyse-partie-chesscom` | 1 585 → 1 788 | 2 688 → 2 952 | 28 → 26 | 6 → 7 | 89 | non |
| `analyse-partie-locale-avec-pgn` | 1 737 → 1 544 | 2 989 → 2 376 | 27 → 14 | 5 → 6 | 14 | non |

Lecture : « Visibles » exclut en-tête, navigation et cases d'échiquier (même règle que l'inventaire). Les cibles < 44 px restantes sont
les coups cliquables de la notation (lecteur de cours, revue de partie) et les étiquettes de moments clés : densité assumée de la notation,
signalée au rapport. `ouvertures-lichess-modern-defense` répond 404 sur ce poste : aucune ligne Lichess importée dans la base (comportement
identique au commit de base, données absentes).

## Objectifs

- Hauteur des écrans-listes sur mobile ≤ 3 000 px : **atteint** sur tous les écrans (max. 2 952 px, revue d'une partie Chess.com de 77 coups).
- Défilement horizontal : **aucun** écran (desktop et mobile).
- Action principale visible sans défiler sur mobile : atteint sur Aujourd'hui, Réviser, Académie, Ouvertures (fiche), Pièges, Jouer.
  Non atteint : revue de partie (« Rejouer mes erreurs » est sous l'échiquier, qui est l'élément principal de l'écran).
- ≤ 8 éléments interactifs visibles sur desktop : atteint sur Progrès (5), fiche ouverture (5), Jouer, Réglages (9 avec le formulaire de plan), 404.
  Non atteint sur les écrans-listes (Aujourd'hui 10 : 5 parties demandées + 5 actions ; Ouvertures, Pièges, Réviser : une ligne = un élément)
  et sur les lecteurs (coups de la notation).

## Contrastes (jetons, `node docs/redesign/audit/contrast.mjs web/src/app/globals.css`)

Tous les couples texte/fond de l'interface ≥ 4,5:1 (texte secondaire 6,28 à 8,82 ; ancien `--es-dim` remplacé par `--foreground-subtle` ≥ 4,79 ;
rouge de gaffe en texte remplacé par `--status-danger` ≥ 4,94). Sous 4,5:1 : `--quality-book` et `--quality-critical` sur les surfaces
les plus claires — jetons invariants (CLAUDE.md), employés en pastilles et liserés, pas en texte courant sur ces surfaces.
