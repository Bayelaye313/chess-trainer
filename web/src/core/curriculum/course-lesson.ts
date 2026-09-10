/**
 * Cours à PLUSIEURS CHAPITRES — la version « étude Lichess complète » de
 * `ThemeDemo` (`theme-demo.ts`), pour les sujets dont la source a assez de
 * matière pour être racontée en 5, 10 ou 17 positions réelles successives
 * plutôt qu'en 2-3 étapes de démonstration (cahier des charges du 2026-09-07 :
 * « il défile avec chaque partie des textes commentaires à côté », en
 * référence à l'étude Lichess « Pawn Structure » de Yushan
 * https://lichess.org/study/a8arx17S).
 *
 * Différence structurelle avec `ThemeDemo` :
 *  - `ThemeDemo` est un parcours GUIDÉ où le joueur doit lui-même jouer le
 *    coup indiqué (`expectedMove`) pour avancer — adapté à 2-3 coups d'une
 *    manœuvre précise.
 *  - `CourseLesson` est un cours à LIRE, chapitre par chapitre (bouton
 *    Précédent/Suivant, jamais bloqué par un coup à trouver) — chaque
 *    `CourseStep` est un chapitre RÉEL de l'étude source, avec sa propre
 *    position et son propre commentaire traduit. Ce module reste pur, sans
 *    dépendance à chess.js, comme `theme-demo.ts` : `moveSan` n'y est que du
 *    texte SAN. Cahier des charges du 2026-09-09, « possibilité de tenter de
 *    trouver le bon coup, de retenter » : c'est le VIEWER
 *    (`course-lesson-viewer.tsx`), pas ce module, qui rejoue `moveSan` avec
 *    chess.js au rendu pour transformer chaque chapitre qui en porte un en
 *    mini défi « devine le coup » pli par pli — indice et « voir la suite »
 *    toujours disponibles, jamais de blocage dur.
 *
 * `fen` porte la position qu'affiche le diagramme — le point de départ du
 * chapitre pour les chapitres purement explicatifs, ou la position obtenue
 * après `moveSan` pour les chapitres qui montrent une suite de coups (choix
 * fait chapitre par chapitre, celui qui rend le mieux l'idée du texte).
 * `arrows`/`highlights` reprennent les indications `[%cal]`/`[%csl]` de la
 * source Lichess (vert = idée/défenseur, rouge = menace/attaquant), quand
 * elles éclairent la position affichée.
 *
 * Toutes les positions et tous les coups de `COURSE_LESSONS` sont RÉELS,
 * tirés d'une partie ou d'une étude effectivement jouée/publiée — jamais
 * inventés — et vérifiés coup par coup avec chess.js avant rédaction (voir
 * `course-lesson.test.ts`).
 */

export interface CourseArrow {
  from: string;
  to: string;
  color: "green" | "red";
}

export interface CourseHighlight {
  square: string;
  color: "green" | "red";
}

export interface CourseStep {
  /** Titre du chapitre — affiché comme repère de progression (« Chapitre 4/17 : ... »). */
  title: string;
  /** Position affichée pour ce chapitre. */
  fen: string;
  /** Commentaire pédagogique de ce chapitre, traduit et adapté du texte source. */
  text: string;
  /**
   * Coups clés joués depuis la position de départ RÉELLE du chapitre — texte
   * SAN pur ici (ce module n'importe pas chess.js), mais le viewer
   * (`course-lesson-viewer.tsx`) les rejoue avec chess.js au rendu pour en
   * faire un défi « devine le coup » interactif, pli par pli.
   */
  moveSan?: readonly string[];
  arrows?: readonly CourseArrow[];
  highlights?: readonly CourseHighlight[];
}

export interface CourseLesson {
  steps: readonly [CourseStep, ...CourseStep[]];
}

/**
 * Clé = `CurriculumThemeOverview.id` (`catalog.ts`). Priorité sur `THEME_DEMOS`
 * dans `ThemeLesson` quand un thème porte les deux (aucun cas actuel).
 *
 * - « Formation Caro-Kann » (`ps-formation-caro-kann`) découpe en 8 chapitres
 *   le texte intégral de son chapitre Lichess (étude « Structures de pions »
 *   de Li-Pokamp, https://lichess.org/study/srjMsNnC) — un chapitre par plan
 *   annoncé (3 pour les Blancs, 3 pour les Noirs), les deux plans les plus
 *   concrets (c4-c5, puis l'occupation de d6) illustrés par de VRAIS coups de
 *   la partie Ivanisevic–Ascic citée en exemple par ce chapitre.
 * - « Le pion arriéré » (`pw-le-pion-arriere`) reprend 18 chapitres réels et
 *   consécutifs de l'étude Lichess « Pawn Structure » de Yushan — depuis le
 *   chapitre « Pawn Duo » (le duo de pions qui va se rompre) jusqu'à
 *   « One Pawn Holds Two » — dans l'ordre où l'étude les présente. Chaque
 *   position vient du chapitre cité en commentaire ; `ChapterURL` (dans le
 *   PGN source) pointe vers le chapitre exact.
 * - Les 7 thèmes `mg-*` (catégorie `middlegame`, cahier des charges du
 *   2026-09-07 : « ajoutons Middlegame [...] sur l'onglet apprendre ») reprennent
 *   chacun une étude Lichess complète et distincte de NoseKnowsAll (staff pick
 *   Lichess) — export PGN officiel de l'étude
 *   (`https://lichess.org/api/study/<id>.pgn`), rejoué et vérifié chapitre par
 *   chapitre avec chess.js avant traduction. Un 8e thème annoncé au cahier des
 *   charges, « Morphy Simulator », a dû être omis : son étude
 *   (`https://lichess.org/study/LAV8k5kM`) est passée privée depuis
 *   l'annonce de NoseKnowsAll — son export PGN renvoie littéralement
 *   `private` en HTTP 403, aucun contenu réel à en tirer.
 * - Les 3 thèmes `eg-*` (catégorie `endgame_mastery`, cahier des charges du
 *   2026-09-08 : « le endgame mastery peut être regroupé sous le format
 *   Lichess, avec tous les chapitres sous un cadre, on défile avec des
 *   commentaires et indices ») REMPLACENT l'ancienne version de la catégorie,
 *   qui piochait dans le pipeline d'import de tags Lichess génériques
 *   (`pawnEndgame`/`rookEndgame`/…) plutôt que de raconter un vrai cours.
 *   Chacun reprend, chapitre par chapitre, une étude Lichess distincte
 *   fournie par l'utilisateur : « eg-mats-de-force-ecrasante » vient du
 *   « Complete Endgame Course » de Jeremy Silman annoté par AliJradi
 *   (`https://lichess.org/study/EXprT7yo`) ; « eg-face-au-roi-seul » et
 *   « eg-finales-de-pions-le-duel-des-rois » viennent respectivement de
 *   « Master The Endgame (1) » et « Master The Endgame (2) » de MungosQerslen
 *   et nishka_d (`https://lichess.org/study/g57WZOXL`,
 *   `https://lichess.org/study/LNWy0uSa`). Chaque étude contient bien plus de
 *   chapitres que ceux repris ici (variantes de puzzle faciles/moyennes/
 *   difficiles, chapitres d'introduction ou de remerciements sans position
 *   réelle) — seul un chapitre par sous-thème a été retenu, le plus riche en
 *   commentaires pédagogiques, pour rester à une taille de cours comparable
 *   aux 7 thèmes `mg-*`.
 *
 * Pour ces trois familles (`ps-*`/`pw-*`, `mg-*`, `eg-*`), chaque `CourseStep`
 * garde `fen` = position de DÉPART du chapitre source (jamais la position
 * d'arrivée) ; `moveSan`, quand présent, est un PRÉFIXE RÉEL de la
 * partie/ligne du chapitre rejoué depuis cette même position — jamais une
 * suite reconstituée à la main.
 *
 * ## Les 10 thèmes `pm-*`/`jh-*` enrichis de vraies parties commentées (2026-09-08)
 *
 * 10 thèmes qui n'avaient jusque-là qu'un seul exercice statique
 * (`MASTER_PUZZLES_DATASET`) reçoivent ici, EN PLUS, un vrai cours à
 * plusieurs chapitres — cahier des charges du 2026-09-08 : « importe et
 * remplace » une bibliothèque de 30 parties historiques réelles (3 par
 * thème), préparée par une session sœur (« devoir-python-18 ») pour un
 * devoir universitaire, chaque partie sourcée (chessgames.com/Wikipedia/
 * étude Lichess citée en tag `[Source]`) et déjà commentée en français aux
 * moments clés (`devoir/Lichess_Studies_PGN/PILOT_*.pgn`, vérifiée
 * python-chess par cette session sœur, PUIS rejouée et vérifiée une seconde
 * fois ici avec chess.js — voir `course-lesson.test.ts`). Contrairement aux
 * familles ci-dessus, ici CHAQUE commentaire de la partie source devient son
 * propre `CourseStep` (pas un chapitre = un step) : le format PGN d'une
 * partie n'a pas de découpage en chapitres comme une étude Lichess, donc
 * chaque position commentée par l'annotateur original est reprise telle
 * quelle, avec le coup suivant réel en `moveSan`.
 *
 * Correspondance thème PGN → thème catalogue :
 * Avant-poste du cavalier → `pm-l-avant-poste-du-cavalier` ; Case faible →
 * `pm-la-case-faible-dans-le-camp-adverse` ; Mauvais fou →
 * `pm-le-mauvais-fou` ; IQP → `pm-le-pion-isole-de-la-dame` ; Carlsbad →
 * `jh-module-3-la-structure-carlsbad` ; Maroczy Bind →
 * `jh-module-4-la-structure-maroczy` ; Chaîne de pions →
 * `jh-module-6-la-chaine-de-pions-en-francais` ; Attaque de minorité vs
 * majorité → `jh-module-9-la-minorite-d-attaque` ; Finales de tours →
 * `jh-module-11-les-finales-de-tours-pratiques` ; Fous de couleurs opposées →
 * `jh-module-12-les-finales-de-fous-de-couleurs-opposees`.
 *
 * **Piège rencontré, à surveiller sur tout futur lot de cette bibliothèque :**
 * les fichiers `PILOT_03_*` à `PILOT_09_*` (21 des 30 parties du premier
 * lot) ont été enregistrés par la session source sans accents français (bug
 * d'encodage de son côté, confirmé — `file` les détecte comme ASCII pur,
 * alors que `PILOT_01_*`/`PILOT_02_*` et un fichier de `PILOT_10_*` sont du
 * vrai UTF-8 accentué). Les accents ont été restaurés ICI, à l'import, via
 * un dictionnaire de mots + une liste de locutions exactes pour lever
 * l'ambiguïté française "a" (verbe avoir, jamais accentué) / "à"
 * (préposition, toujours accentuée) — jamais par un remplacement global
 * aveugle, qui aurait cassé les vraies occurrences du verbe. Un script
 * one-shot a servi à ce nettoyage (non conservé dans le dépôt). Signalé à la
 * session source, qui a corrigé le bug : le second lot (6 thèmes
 * supplémentaires, ci-dessous) est arrivé en UTF-8 propre, sans retouche
 * nécessaire.
 *
 * ## Second lot — 6 thèmes de plus, 18 parties (2026-09-08, même journée)
 *
 * Même bibliothèque, même session source (relayée entre-temps par une
 * session sœur parallèle, « devoir-python-2a », après un incident de
 * collision de fichiers entre les deux résolu de leur côté) : 6 thèmes
 * `positional_mastery` de plus, chacun avec 3 parties réelles sourcées et
 * commentées, au même format un-commentaire-source = un-`CourseStep` que le
 * premier lot ci-dessus.
 *
 * Correspondance thème PGN → thème catalogue (second lot) :
 * Cavalier contre fou → `pm-cavalier-contre-fou-qui-domine` ; Pions
 * pendants → `pm-les-pions-pendants` ; Pions doublés →
 * `pm-doubler-les-pions-adverses` ; Pion passé protégé →
 * `pm-le-pion-passe-protege` ; Colonne ouverte → `pm-la-colonne-ouverte` ;
 * Colonne semi-ouverte → `pm-la-colonne-semi-ouverte`.
 *
 * ## Format « étude Lichess complète » : tutoriel + vague de puzzles (2026-09-10)
 *
 * Cahier des charges du 2026-09-10 : « Principal UI/UX Architect » — calquer
 * l'onglet Apprendre sur le modèle interactif des meilleures études Lichess
 * (référence citée : https://lichess.org/study/kNn68T8l), un chapitre
 * d'introduction théorique suivi d'une série de puzzles thématiques liés.
 * `pm-le-mauvais-fou` est le premier thème converti à ce format : ses 4
 * PREMIERS chapitres (avant les 13 chapitres de parties de maîtres déjà en
 * place depuis le 2026-09-08, inchangés) forment désormais ce tutoriel —
 * sourcés des chapitres théoriques (non-"Exercise") de cette même étude de
 * NoseKnowsAll, `[%csl]`/`[%cal]` du PGN source repris en `highlights`/
 * `arrows`. Juste après ce tutoriel, `ThemeLesson` bascule sur `ThemeSession`
 * (bouton « Passer aux exercices »), qui sert maintenant les 8 puzzles
 * thématiques liés au MÊME thème (`MASTER_PUZZLES_DATASET`, voir son
 * docstring pour le détail des 8 chapitres "Exercise") via le nouveau HUD
 * `AcademyPuzzleArena` (`client/features/learn/academy-puzzle-arena.tsx`) —
 * barre segmentée, transition en fondu enchaîné entre puzzles, son de
 * validation `esport-audio-synth.ts`. Le badge de palier (Bronze/Argent/Or,
 * `theme.level`) ne se débloque qu'une fois `completedCount >= totalPuzzles`
 * ATTEINT APRÈS le tutoriel — mécanisme déjà en place nativement (voir
 * `LearnScreen`, navigation `lesson` → `session` uniquement), aucune
 * nouvelle logique de déblocage n'a été nécessaire.
 *
 * `pm-l-avant-poste-du-cavalier` est le second thème converti à ce format
 * (2026-09-10) : ses 4 PREMIERS chapitres (avant les 18 chapitres de parties
 * de maîtres déjà en place depuis le 2026-09-08, inchangés) forment
 * désormais ce tutoriel — sourcés des chapitres théoriques (DEFINITION,
 * UTILITE STRATEGIQUE, CREATION EXEMPLE 1, CAP SUR L'A.P EXEMPLE 2) de
 * l'étude Lichess d'Antoine01 « L'avant-poste du Cavalier - cours Antoine01 »
 * (`https://lichess.org/study/AXtMrSMm`), qui alimente aussi les 8 puzzles
 * de la vague (`MASTER_PUZZLES_DATASET`, voir son docstring). Cette étude
 * compte 16 chapitres au total, mais seuls 7 portent explicitement
 * "EXERCICE" dans leur titre — 3 d'entre eux (CAP SUR L'AP EXERCICE 2, 3, 4)
 * ont dû être ÉCARTÉS de la vague de puzzles car leur ligne PRINCIPALE n'est
 * PAS le coup recommandé par l'annotateur (le vrai coup fort, marqué "!",
 * est enterré dans une variante RAV — jouer la ligne principale comme
 * "solution" aurait enseigné un coup faible ou hors-sujet). Pour combler la
 * vague à 8 puzzles malgré cela, 4 chapitres nommés "EXEMPLE" dont la ligne
 * PRINCIPALE porte bien le coup fort (marqué "!" ou explicitement complimenté
 * dans le commentaire) ont été promus au rang de puzzle plutôt que de
 * tutoriel — voir le docstring de `master-puzzles-dataset.ts` pour le détail
 * exercice par exercice.
 *
 * Les 28 autres thèmes `positional_mastery` restent au format à un seul
 * exercice : les convertir de la même façon suppose une étude Lichess réelle
 * par thème, non encore fournie — voir la mémoire de session pour le suivi.
 */
export const COURSE_LESSONS: Record<string, CourseLesson> = {
  "ps-formation-caro-kann": {
    steps: [
      {
        title: "La structure Caro-Kann",
        fen: "r1bq1rk1/pp1n1ppp/2pbpn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 7 8",
        text: "La structure Caro-Kann — pions blancs c/d contre pions noirs c/e — apparaît aussi dans la Scandinave et dans le Gambit Dame refusé (avec c4), comme ici : Blanc et Noir se sont développés normalement, mais le squelette de pions est déjà en place. Cette structure offre en général de meilleures chances aux Blancs.",
      },
      {
        title: "Plan blanc 1 : l'attaque à l'aile roi",
        fen: "r1bq1rk1/pp1n1ppp/2pbpn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 7 8",
        text: "Premier plan blanc : une attaque directe à l'aile roi, avec un cavalier en e5 et/ou la batterie Fd3 + Dame en c2 ou h3. Installe toujours la pièce AVANT de lancer l'assaut, jamais l'inverse.",
      },
      {
        title: "Plan blanc 2 : l'espace et le centre",
        fen: "r1bq1rk1/pp1n1ppp/2pbpn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 7 8",
        text: "Deuxième plan blanc : gagner de l'espace avec les poussées c2-c4 et h2-h4, tout en gardant le contrôle du centre.",
      },
      {
        title: "Plan blanc 3 : c4-c5, la case d6",
        fen: "r1bqr1k1/pp2bppp/2p1pn2/8/2PPNB2/6P1/PP3PBP/R2Q1RK1 w - - 3 13",
        text: "Troisième plan blanc, le plus radical : jouer c4-c5. Ce coup empêche À JAMAIS la rupture libératrice noire ...c6-c5, et prend le contrôle de la case d6 — la case juste devant le futur pion arriéré noir.",
        moveSan: ["c5"],
      },
      {
        title: "Conséquence : la case d6 tombe",
        fen: "r1bq1rk1/5ppp/2p1p3/ppPn4/3PN3/6P1/PPQ2PBP/R3R1K1 w - - 0 19",
        text: "Quelques coups plus tard, la case d6 — verrouillée depuis c4-c5 — devient un point d'appui idéal pour une pièce blanche, hors de portée de tout pion noir : exactement le fil rouge des trois plans blancs, du contrôle d'une case avancée jusqu'à son occupation définitive.",
        moveSan: ["Nd6"],
      },
      {
        title: "Plan noir 1 : la rupture centrale ...c6-c5",
        fen: "r1bq1rk1/pp1n1ppp/2pbpn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 7 8",
        text: "Côté noir, le plan prioritaire est de lutter pour le contrôle du centre en modifiant la structure par la rupture ...c6-c5 — avant que Blanc ne la referme lui-même avec c4-c5 (voir le plan blanc 3).",
      },
      {
        title: "Plan noir 2 : ...e6-e5, plus difficile",
        fen: "r1bq1rk1/pp1n1ppp/2pbpn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 7 8",
        text: "Deuxième option noire : la rupture ...e6-e5, plus difficile à réaliser que ...c6-c5 car elle exige souvent une préparation supplémentaire (pièces qui soutiennent e5, pion e6 déjà bien défendu).",
      },
      {
        title: "Plan noir 3 : presser le pion d4",
        fen: "r1bq1rk1/pp1n1ppp/2pbpn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 7 8",
        text: "Troisième option noire : presser le pion d4, en particulier après un c2-c4 blanc, ou bien jouer ...b7-b5 pour disputer à Blanc le contrôle de la case d5.",
      },
    ],
  },
  "ps-la-structure-grunfeld": {
    steps: [
      {
        title: "La structure Grünfeld",
        fen: "rnbqk2r/pp2ppbp/6p1/2p5/3PP3/2P2N2/P4PPP/R1BQKB1R w KQkq - 0 8",
        text: "La structure Grünfeld typique peut aussi découler d'une défense Nimzo-indienne où le pion e est resté en e6. Après l'échange des cavaliers en d4, Blanc garde une majorité de pions au centre, Noir une majorité à l'aile Dame — chaque camp vise à faire naître son propre pion passé avant l'autre.",
      },
      {
        title: "Plan blanc 1 : d4-d5, le pion passé",
        fen: "r2q1rk1/p3ppbp/1pn3p1/8/3PP3/5N2/P3QPPP/1RB2RK1 w - - 1 15",
        text: "Premier plan blanc, le plus radical : d4-d5. Ce coup crée un pion passé, domine le centre et gagne de l'espace — la percée directrice de toute la structure.",
        moveSan: ["d5"],
      },
      {
        title: "Plan blanc 2 : l'attaque à l'aile roi",
        fen: "rnbqk2r/pp2ppbp/6p1/2p5/3PP3/2P2N2/P4PPP/R1BQKB1R w KQkq - 0 8",
        text: "Deuxième plan blanc : une attaque à l'aile roi par h2-h4-h5 et e4-e5, pour prendre le contrôle de la case f6 affaiblie par le fianchetto noir.",
      },
      {
        title: "Plan noir 1 : le pion passé à l'aile dame",
        fen: "rnbqk2r/pp2ppbp/6p1/2p5/3PP3/2P2N2/P4PPP/R1BQKB1R w KQkq - 0 8",
        text: "Premier plan noir, symétrique de celui des Blancs : créer son propre pion passé à l'aile Dame, avant que le pion d blanc n'ait le temps de courir.",
      },
      {
        title: "Plan noir 2 : la colonne d, et la colonne c capitale",
        fen: "rnbqk2r/pp2ppbp/6p1/2p5/3PP3/2P2N2/P4PPP/R1BQKB1R w KQkq - 0 8",
        text: "Deuxième plan noir : exercer une pression centrale en plaçant une tour sur la colonne d, dans une position ouverte riche en ressources tactiques. Le contrôle de la colonne « c » est capital : s'il revient aux Blancs, ils créent leur pion passé et neutralisent le jeu noir ; s'il revient aux Noirs, le jeu blanc au centre et à l'aile roi se heurte à de nombreuses difficultés.",
      },
    ],
  },
  "ps-la-structure-stonewall": {
    steps: [
      {
        title: "La structure Stonewall",
        fen: "r1b2rk1/pp1nq1pp/2pbp3/3p1p2/2PPn3/1P1BPN2/PB2NPPP/R2Q1RK1 w - - 7 11",
        text: "La structure Stonewall (« mur de pierre ») découle le plus souvent d'une défense hollandaise, mais aussi d'une Slave ou d'une Catalane. Malgré sa mauvaise réputation, c'est un système solide, tout à fait jouable avec les Blancs.",
      },
      {
        title: "Plan blanc 1 : contrôler la case e5",
        fen: "r1b2rk1/pp1nq1pp/2pbp3/3p1p2/2PPn3/1P1BPN2/PB2NPPP/R2Q1RK1 w - - 7 11",
        text: "Premier plan blanc, le plus important de tous : obtenir le contrôle de la case e5 pour y installer un cavalier — la case n'est gardée par aucun pion noir.",
        moveSan: ["Ne5"],
      },
      {
        title: "Conséquence : le contrôle survit à l'échange",
        fen: "r1b2rk1/pp2q1pp/2pbp3/3pnp2/2PPn3/1P1BP3/PB2NPPP/R2Q1RK1 w - - 0 12",
        text: "Même après l'échange ...Cxe5, c'est un PION blanc qui prend le relais du contrôle de la case — tout l'intérêt du plan : la case e5 reste tenue même une fois les pièces échangées.",
        moveSan: ["dxe5"],
      },
      {
        title: "Plan blanc 2 : échanger le fou de cases noires",
        fen: "r1b2rk1/pp1nq1pp/2pbp3/3p1p2/2PPn3/1P1BPN2/PB2NPPP/R2Q1RK1 w - - 7 11",
        text: "Deuxième plan blanc : échanger le fou de cases noires — souvent gêné par la propre structure de pions blanche — dès que l'occasion se présente.",
      },
      {
        title: "Plan blanc 3 : l'aile dame et la colonne c",
        fen: "r1b2rk1/pp1nq1pp/2pbp3/3p1p2/2PPn3/1P1BPN2/PB2NPPP/R2Q1RK1 w - - 7 11",
        text: "Troisième plan blanc : se développer à l'aile Dame, ou ouvrir la colonne c au bon moment, puis poursuivre l'invasion sur cette colonne.",
      },
      {
        title: "Plan noir 1 : attaquer sans lâcher le centre",
        fen: "r1b2rk1/pp1nq1pp/2pbp3/3p1p2/2PPn3/1P1BPN2/PB2NPPP/R2Q1RK1 w - - 7 11",
        text: "Premier plan noir : attaquer à l'aile Roi sans jamais perdre le contrôle des cases centrales — le sacrifier reviendrait à laisser les Blancs exécuter leur propre plan sans opposition.",
      },
      {
        title: "Plan noir 2 : réactiver le fou c8",
        fen: "r1b2rk1/pp1nq1pp/2pbp3/3p1p2/2PPn3/1P1BPN2/PB2NPPP/R2Q1RK1 w - - 7 11",
        text: "Deuxième plan noir : améliorer la position du fou c8, souvent enfermé — par ...d7-e8-h5, ou parfois par ...b7-b6 suivi de ...Fa6.",
      },
      {
        title: "Plan noir 3 : la pression centrale",
        fen: "r1b2rk1/pp1nq1pp/2pbp3/3p1p2/2PPn3/1P1BPN2/PB2NPPP/R2Q1RK1 w - - 7 11",
        text: "Troisième plan noir : créer une pression au centre par ...b7-b6 suivi de ...c6-c5, pour contester directement le centre blanc.",
      },
    ],
  },
  "ps-formation-benoni-asymetrique": {
    steps: [
      {
        title: "Formation Bénoni asymétrique",
        fen: "r1bqrbk1/1p3p1p/p2p1np1/2pP4/P1N1P3/2N5/1PQ1BPPP/R4RK1 w - - 2 16",
        text: "Cette structure apparaît après des variantes de la Bénoni, mais aussi dans de nombreuses variantes de la Ruy Lopez. Le thème central est la lutte entre deux majorités de pions : au centre pour les Blancs, à l'aile Dame pour les Noirs. Blancs ayant un léger avantage d'espace, Noir a intérêt à échanger des pièces — la raison : Noir peut se créer un pion passé éloigné, redoutable en finale.",
      },
      {
        title: "Plan blanc 1 : la rupture centrale e4-e5",
        fen: "1rb1rbk1/1pqn1p1p/p2p2p1/P1pP4/2N1PP2/2N5/1PQ1B1PP/4RRK1 w - - 1 19",
        text: "Premier plan blanc : la rupture centrale e4-e5, pour obtenir une attaque à l'aile Roi ou créer un pion passé.",
        moveSan: ["e5"],
      },
      {
        title: "Plans blancs 2-3 : f4-f5 et la colonne f",
        fen: "r1bqrbk1/1p3p1p/p2p1np1/2pP4/P1N1P3/2N5/1PQ1BPPP/R4RK1 w - - 2 16",
        text: "Deuxième plan blanc : préparer la rupture e4-e5 par f2-f4 (puis f4-f5 le moment venu) pour l'attaque à l'aile Roi. Troisième plan, dans le même esprit : mener l'attaque principalement le long de la colonne f, une fois celle-ci ouverte.",
        moveSan: ["f4"],
      },
      {
        title: "Plan blanc 4 : bloquer l'aile dame noire",
        fen: "r1bqrbk1/1p3p1p/p2p1np1/2pP4/P1N1P3/2N5/1PQ1BPPP/R4RK1 w - - 2 16",
        text: "Quatrième plan blanc : empêcher l'expansion noire à l'aile Dame en jouant b2-b4, qui bloque à l'avance ...b5-b4.",
      },
      {
        title: "Plan noir 1 : avancer la majorité dame",
        fen: "r1bqrbk1/1p3p1p/p2p1np1/2pP4/P1N1P3/2N5/1PQ1BPPP/R4RK1 w - - 2 16",
        text: "Premier plan noir : avancer la majorité de l'aile Dame avec ...b7-b5, ...c5-c4, ...b5-b4, etc., pour créer si possible un pion passé.",
      },
      {
        title: "Plan noir 2 : la pression centrale",
        fen: "r1bqrbk1/1p3p1p/p2p1np1/2pP4/P1N1P3/2N5/1PQ1BPPP/R4RK1 w - - 2 16",
        text: "Deuxième plan noir : exercer une pression centrale pour empêcher les Blancs d'avancer leur propre majorité.",
      },
      {
        title: "Plan noir 3 : le contre-jeu à l'aile roi",
        fen: "r1bqrbk1/1p3p1p/p2p1np1/2pP4/P1N1P3/2N5/1PQ1BPPP/R4RK1 w - - 2 16",
        text: "Troisième plan noir : chercher un contre-jeu à l'aile Roi par ...h7-h5-h4, particulièrement efficace quand un cavalier blanc se trouve en g3.",
      },
      {
        title: "Plan noir 4 : la rupture f7-f5",
        fen: "r1bqrbk1/1p3p1p/p2p1np1/2pP4/P1N1P3/2N5/1PQ1BPPP/R4RK1 w - - 2 16",
        text: "Quatrième plan noir : la rupture ...f7-f5, une fois que les Blancs ont joué f3-f4 — le pion d5 blanc n'est alors plus protégé.",
      },
    ],
  },
  "ps-formation-benoni-symetrique": {
    steps: [
      {
        title: "Formation Bénoni symétrique",
        fen: "r2qnrk1/pp4bp/3p2p1/2pPnp2/2P5/2N4P/PP1BBPP1/R2Q1RK1 w - - 0 15",
        text: "Cette structure survient de variantes de la Bénoni quand les Blancs reprennent par exd5 plutôt que cxd5. Blanc conserve un petit avantage d'espace ; le jeu noir exige une grande précision pour éviter l'asphyxie. Un thème essentiel pour Noir : échanger des pièces mineures pour réduire le problème d'espace — le contrôle de la case e4 est déterminant pour ses chances d'égaliser.",
      },
      {
        title: "Plan blanc 1a : f2-f4",
        fen: "r2qnrk1/pp4bp/3p2p1/2pPnp2/2P5/2N4P/PP1BBPP1/R2Q1RK1 w - - 0 15",
        text: "Premier plan blanc : l'expansion à l'aile Roi par f2-f4 puis g2-g4 — le seul endroit où les Blancs ont vraiment du jeu dans cette structure fermée.",
        moveSan: ["f4"],
      },
      {
        title: "Plan blanc 1b : g2-g4",
        fen: "r2qnrk1/pp3nbp/3p2p1/2pP1p2/2P2P2/2N4P/PP1BB1P1/R2Q1RK1 w - - 1 16",
        text: "g2-g4 suit f2-f4 : l'expansion se poursuit, des lignes s'ouvrent contre le roi noir.",
        moveSan: ["g4"],
      },
      {
        title: "Plan blanc 2 : attaquer le pion faible d6",
        fen: "r2qnrk1/pp4bp/3p2p1/2pPnp2/2P5/2N4P/PP1BBPP1/R2Q1RK1 w - - 0 15",
        text: "Deuxième plan blanc : attaquer le pion faible d6 avec le fou sur la diagonale h2-b8, épaulé par un cavalier en e4.",
      },
      {
        title: "Plan blanc 3 : b2-b4, à double tranchant",
        fen: "r2qnrk1/pp4bp/3p2p1/2pPnp2/2P5/2N4P/PP1BBPP1/R2Q1RK1 w - - 0 15",
        text: "Troisième plan blanc, plus risqué : b2-b4 reste possible, mais l'ouverture de l'aile Dame qu'il provoque offrirait aussi du contre-jeu aux Noirs.",
      },
      {
        title: "Plan noir 1 : contrôler e4",
        fen: "r2qnrk1/pp4bp/3p2p1/2pPnp2/2P5/2N4P/PP1BBPP1/R2Q1RK1 w - - 0 15",
        text: "Premier plan noir, le plus important : contrôler la case e4 et l'occuper avec un cavalier.",
      },
      {
        title: "Plan noir 2 : la rupture b7-b5",
        fen: "r2qnrk1/pp4bp/3p2p1/2pPnp2/2P5/2N4P/PP1BBPP1/R2Q1RK1 w - - 0 15",
        text: "Deuxième plan noir : la rupture à l'aile Dame ...b7-b5, pour attaquer le pion d5 affaibli.",
      },
      {
        title: "Plan noir 3 : échanger les pièces mineures",
        fen: "r2qnrk1/pp4bp/3p2p1/2pPnp2/2P5/2N4P/PP1BBPP1/R2Q1RK1 w - - 0 15",
        text: "Troisième plan noir : échanger les pièces mineures pour réduire les problèmes d'espace — par exemple la suite ...Db6, ...Ff5 et ...Ce4, qui peut aussi créer une pression sur le pion b2.",
      },
    ],
  },
  "ps-structure-est-indienne-type-i": {
    steps: [
      {
        title: "Structure Est-indienne type I",
        fen: "r1bq1r2/5pbk/pn1p1npp/1p1Pp3/4P3/2N1BP2/PP1QB1PP/R1N2RK1 w - - 4 15",
        text: "Cette structure apparaît dans une Est-indienne, une Ouest-indienne ou une Ruy Lopez. La différence avec les structures Est-indiennes des chapitres suivants tient à l'ouverture de la colonne « c » et à sa lutte pour le contrôle.",
      },
      {
        title: "Plan blanc 1 : couvrir le point c2",
        fen: "r1bq1r2/5pbk/pn1p1npp/1p1Pp3/4P3/2N1BP2/PP1QB1PP/R1N2RK1 w - - 4 15",
        text: "Si les Noirs contrôlent la colonne c, la tâche des Blancs est de couvrir le point de pénétration c2 et de manœuvrer pour reprendre le contrôle de la colonne.",
      },
      {
        title: "Plan blanc 2 : pénétrer la 7e rangée",
        fen: "r1bq1r2/5pbk/pn1p1npp/1p1Pp3/4P3/2N1BP2/PP1QB1PP/R1N2RK1 w - - 4 15",
        text: "Si ce sont les Blancs qui contrôlent la colonne c, ils préparent au contraire une pénétration sur la 7e rangée du camp noir.",
      },
      {
        title: "Plan blanc 3a : b2-b4",
        fen: "r1bq1r2/5pbk/pn1p1npp/1p1Pp3/4P3/2N1BP2/PP1QB1PP/R1N2RK1 w - - 4 15",
        text: "Troisième plan blanc, l'expansion à l'aile Dame : b2-b4 d'abord, pour préparer a2-a4-a5, qui gagne de l'espace et limite l'action noire.",
        moveSan: ["b4"],
      },
      {
        title: "Plan blanc 3b : a2-a4-a5",
        fen: "r1bq1r2/5pbk/pn1p1npp/1p1Pp3/1P2P3/2N1BP2/P2QB1PP/R1N2RK1 w - - 0 15",
        text: "a2-a4 poursuit l'expansion à l'aile Dame amorcée par b2-b4 — a4-a5 suivra pour restreindre durablement le jeu noir sur ce côté.",
        moveSan: ["a4"],
      },
      {
        title: "Plan blanc 4 : répondre à ...b7-b5",
        fen: "r1bq1r2/5pbk/pn1p1npp/1p1Pp3/4P3/2N1BP2/PP1QB1PP/R1N2RK1 w - - 4 15",
        text: "Quatrième plan blanc : si les Noirs jouent ...b7-b5, la rupture a2-a4 ou la manœuvre Cb4-c6 méritent considération.",
      },
      {
        title: "Plan noir 1 : doubler les tours sur c",
        fen: "r1bq1r2/5pbk/pn1p1npp/1p1Pp3/4P3/2N1BP2/PP1QB1PP/R1N2RK1 w - - 4 15",
        text: "Si les Noirs contrôlent la colonne c, leur premier plan est de doubler les tours et de pénétrer sur la 2e rangée blanche.",
      },
      {
        title: "Plan noir 2 : le contre-jeu à l'aile roi",
        fen: "r1bq1r2/5pbk/pn1p1npp/1p1Pp3/4P3/2N1BP2/PP1QB1PP/R1N2RK1 w - - 4 15",
        text: "Deuxième plan noir : créer du contre-jeu à l'aile Roi par ...f7-f5xe4, pour ouvrir la colonne f, suivi de ...Fg7-f6-g5 et éventuellement ...h7-h5-h4-h3.",
      },
      {
        title: "Plan noir 3 : accélérer si Blanc est lent",
        fen: "r1bq1r2/5pbk/pn1p1npp/1p1Pp3/4P3/2N1BP2/PP1QB1PP/R1N2RK1 w - - 4 15",
        text: "Troisième plan noir : si le jeu blanc est trop lent, ...f7-f5-f4 suivi de ...g6-g5-g4 offre de bonnes perspectives.",
      },
      {
        title: "Plan noir 4 : transférer le fou en b6",
        fen: "r1bq1r2/5pbk/pn1p1npp/1p1Pp3/4P3/2N1BP2/PP1QB1PP/R1N2RK1 w - - 4 15",
        text: "Quatrième plan noir : transférer le fou de cases noires de g7 vers b6, via f6-d8.",
      },
    ],
  },
  "ps-structure-est-indienne-type-iii": {
    steps: [
      {
        title: "Structure Est-indienne type III",
        fen: "r2q1rk1/pppn2b1/3p2np/3Pp1p1/2P1Pp2/2N2P2/PP1N1BPP/R2QR1K1 w - - 2 16",
        text: "La structure la plus commune de cette défense conduit généralement à des actions sur des ailes opposées : Blanc à l'aile Dame, Noir à l'aile Roi.",
      },
      {
        title: "Plan blanc 1a : b2-b4",
        fen: "r2q1rk1/pppn2b1/3p2np/3Pp1p1/2P1Pp2/2N2P2/PP1N1BPP/R2QR1K1 w - - 2 16",
        text: "Premier plan blanc : à l'aile Dame, préparer puis jouer la rupture c4-c5xd6 pour envahir via la colonne c.",
        moveSan: ["b4"],
      },
      {
        title: "Plan blanc 1b : c4-c5xd6",
        fen: "r2q1rk1/ppp3b1/3p1nnp/3Pp1p1/1PP1Pp2/2N2P2/P2N1BPP/R2QR1K1 w - - 1 17",
        text: "c4-c5 attaque directement la base d6 et ouvre la colonne c à l'invasion — le plan blanc directeur à l'aile Dame.",
        moveSan: ["c5"],
      },
      {
        title: "Plan blanc 2 : c4-c5-c6 et la colonne a",
        fen: "r2q1rk1/pppn2b1/3p2np/3Pp1p1/2P1Pp2/2N2P2/PP1N1BPP/R2QR1K1 w - - 2 16",
        text: "Deuxième plan blanc : pousser jusqu'à c4-c5-c6, et si les Noirs répondent ...b7-b6, envahir via la colonne a après a4-a5xb6.",
      },
      {
        title: "Plan blanc 3 : bloquer l'aile roi",
        fen: "r2q1rk1/pppn2b1/3p2np/3Pp1p1/2P1Pp2/2N2P2/PP1N1BPP/R2QR1K1 w - - 2 16",
        text: "Troisième plan blanc : bloquer l'aile Roi par g2-g4, puis continuer avec l'un des plans précédents à l'aile Dame en toute tranquillité.",
      },
      {
        title: "Plan blanc 4 : répondre à ...f7-f5",
        fen: "r2q1rk1/pppn2b1/3p2np/3Pp1p1/2P1Pp2/2N2P2/PP1N1BPP/R2QR1K1 w - - 2 16",
        text: "Quatrième plan blanc : après ...f7-f5 des Noirs, répondre si possible Cg5-e6.",
      },
      {
        title: "Plan blanc 5 : échanger le bon fou",
        fen: "r2q1rk1/pppn2b1/3p2np/3Pp1p1/2P1Pp2/2N2P2/PP1N1BPP/R2QR1K1 w - - 2 16",
        text: "Cinquième plan blanc : échanger les fous de cases blanches, pour réduire le potentiel d'attaque noir.",
      },
      {
        title: "Plan noir 1 : l'attaque f5-f4-g4",
        fen: "r2q1rk1/pppn2b1/3p2np/3Pp1p1/2P1Pp2/2N2P2/PP1N1BPP/R2QR1K1 w - - 2 16",
        text: "Premier plan noir : créer une attaque à l'aile Roi par ...f7-f5-f4, puis plus tard ...g6-g5-g4-g3 ou ...g4xf3.",
      },
      {
        title: "Plan noir 2 : le contre-jeu par f5xe4",
        fen: "r2q1rk1/pppn2b1/3p2np/3Pp1p1/2P1Pp2/2N2P2/PP1N1BPP/R2QR1K1 w - - 2 16",
        text: "Deuxième plan noir : le contre-jeu par ...f7-f5xe4, suivi d'une action sur la colonne f désormais ouverte.",
      },
      {
        title: "Plan noir 3 : ...h7-h5-h4",
        fen: "r2q1rk1/pppn2b1/3p2np/3Pp1p1/2P1Pp2/2N2P2/PP1N1BPP/R2QR1K1 w - - 2 16",
        text: "Troisième plan noir, dans certains cas : jouer ...h7-h5-h4.",
      },
      {
        title: "Plan noir 4 : la tension par c7-c6",
        fen: "r2q1rk1/pppn2b1/3p2np/3Pp1p1/2P1Pp2/2N2P2/PP1N1BPP/R2QR1K1 w - - 2 16",
        text: "Quatrième plan noir : jouer ...c7-c6 pour créer une tension au centre.",
      },
      {
        title: "Plan noir 5 : freiner l'aile dame",
        fen: "r2q1rk1/pppn2b1/3p2np/3Pp1p1/2P1Pp2/2N2P2/PP1N1BPP/R2QR1K1 w - - 2 16",
        text: "Cinquième plan noir : jouer ...c7-c5 pour freiner directement l'action blanche à l'aile Dame.",
      },
    ],
  },
  "ps-structure-est-indienne-ouverte": {
    steps: [
      {
        title: "Structure Est-indienne ouverte",
        fen: "r1b2rk1/1p3pbp/nqpp2p1/p1n5/P1PNP3/2N1B2P/1P1Q1PP1/1B1R1RK1 w - - 3 15",
        text: "Cette formation apparaît après que les Noirs ont joué ...exd5. Elle exige un jeu précis des deux côtés, à cause des complications tactiques qu'elle fait naître.",
      },
      {
        title: "Plan blanc 1 : la pression sur d6",
        fen: "r1b2rk1/1p3pbp/nqpp2p1/p1n5/P1PNP3/2N1B2P/1P1Q1PP1/1B1R1RK1 w - - 3 15",
        text: "Premier plan blanc : maintenir la pression sur le pion d6.",
      },
      {
        title: "Plan blanc 2a : f2-f4",
        fen: "r1b2rk1/1p3pbp/nqpp2p1/p1n5/P1PNP3/2N1B2P/1P1Q1PP1/1B1R1RK1 w - - 3 15",
        text: "Deuxième plan blanc : l'expansion à l'aile Roi par f2-f4 et éventuellement g2-g4, en vue d'une rupture par e4-e5 ou f4-f5.",
        moveSan: ["f4"],
      },
      {
        title: "Plan blanc 2b : la rupture f4-f5",
        fen: "r1b2rk1/1p3pbp/n1pp2p1/p1n5/PqPNPP2/2N1B2P/1P1Q2P1/1B1R1RK1 w - - 1 16",
        text: "f4-f5 gagne encore de l'espace et prépare f5-f6, fissurant l'abri du roi noir.",
        moveSan: ["f5"],
      },
      {
        title: "Plan blanc 3 : éviter les échanges",
        fen: "r1b2rk1/1p3pbp/nqpp2p1/p1n5/P1PNP3/2N1B2P/1P1Q1PP1/1B1R1RK1 w - - 3 15",
        text: "Troisième plan blanc : éviter les échanges de pièces, pour optimiser l'avantage d'espace et l'activité des pièces.",
      },
      {
        title: "Plan blanc 4 : limiter l'aile dame noire",
        fen: "r1b2rk1/1p3pbp/nqpp2p1/p1n5/P1PNP3/2N1B2P/1P1Q1PP1/1B1R1RK1 w - - 3 15",
        text: "Quatrième plan blanc : limiter le contre-jeu noir à l'aile Dame par a2-a3 et b2-b4.",
      },
      {
        title: "Plan noir 1 : échanger des pièces",
        fen: "r1b2rk1/1p3pbp/nqpp2p1/p1n5/P1PNP3/2N1B2P/1P1Q1PP1/1B1R1RK1 w - - 3 15",
        text: "Premier plan noir : échanger des pièces pour diminuer les problèmes d'espace.",
      },
      {
        title: "Plan noir 2 : le cavalier en c5 ou e5",
        fen: "r1b2rk1/1p3pbp/nqpp2p1/p1n5/P1PNP3/2N1B2P/1P1Q1PP1/1B1R1RK1 w - - 3 15",
        text: "Deuxième plan noir : placer un cavalier en c5 ou e5, suivi de ...Db6-b4 pour attaquer c4 — ce qui peut aussi se préparer par ...a7-a6, ...b7-b5.",
      },
      {
        title: "Plan noir 3 : la rupture centrale",
        fen: "r1b2rk1/1p3pbp/nqpp2p1/p1n5/P1PNP3/2N1B2P/1P1Q1PP1/1B1R1RK1 w - - 3 15",
        text: "Troisième plan noir : la rupture centrale ...d6-d5 ou ...f7-f5.",
      },
      {
        title: "Plan noir 4 : l'attaque via Cf4",
        fen: "r1b2rk1/1p3pbp/nqpp2p1/p1n5/P1PNP3/2N1B2P/1P1Q1PP1/1B1R1RK1 w - - 3 15",
        text: "Quatrième plan noir : l'attaque à l'aile Roi via Cf4, suivie si possible de ...g6-g5.",
      },
    ],
  },
  "ps-structure-francaise-type-i": {
    steps: [
      {
        title: "Structure française type I",
        fen: "r1bqr1k1/pp3pbp/2n1pnp1/2pp4/4P3/2PP1NP1/PP1N1PBP/R1BQR1K1 w - - 3 10",
        text: "Cette structure peut aussi provenir d'une Caro-Kann après ...f7-f6. Le contrôle de la case e5 y est primordial : si les Blancs parviennent à le prendre, ils obtiennent une meilleure position — c'est exactement ce que la poussée e4-e5 s'apprête à fixer ici.",
        moveSan: ["e5"],
      },
      {
        title: "Plan blanc 1 : contrôler e5",
        fen: "r1bqr1k1/p5bp/1pn1pnp1/2pp4/3P4/2P2NPP/PP1N1PB1/R1BQR1K1 w - - 0 14",
        text: "Premier plan blanc, le plus important : contrôler e5 pour y installer une pièce — cavalier, fou, ou éventuellement une tour. e5 n'est défendue par aucun pion noir : installe-toi dessus avant que Noir ne puisse t'en déloger.",
        moveSan: ["Ne5"],
      },
      {
        title: "Plan blanc 2 : doubler les tours sur e",
        fen: "r1bqr1k1/p5bp/1pn1pnp1/2ppN3/3P4/2P3PP/PP1N1PB1/R1BQR1K1 b - - 1 14",
        text: "Une fois e5 tenu, deuxième plan blanc : mettre la pression sur le pion arriéré e6 en doublant les tours sur la colonne e.",
      },
      {
        title: "Plan blanc 3 : l'attaque à l'aile roi",
        fen: "r1bqr1k1/p5bp/1pn1pnp1/2ppN3/3P4/2P3PP/PP1N1PB1/R1BQR1K1 b - - 1 14",
        text: "Troisième plan blanc : une fois le contrôle de e5 assuré, développer une attaque à l'aile Roi par f2-f4 ou h2-h4-h5.",
      },
      {
        title: "Plan noir 1 : empêcher le contrôle de e5",
        fen: "r1bqr1k1/pp3pbp/2n1pnp1/2pp4/4P3/2PP1NP1/PP1N1PBP/R1BQR1K1 w - - 3 10",
        text: "Premier plan noir : empêcher le contrôle de e5 en mettant la pression sur d4 par ...c7-c5xd4, ...Cc6, et parfois ...Db6.",
      },
      {
        title: "Plan noir 2 : clouer le cavalier f3",
        fen: "r1bqr1k1/pp3pbp/2n1pnp1/2pp4/4P3/2PP1NP1/PP1N1PBP/R1BQR1K1 w - - 3 10",
        text: "Deuxième plan noir : mettre le fou de cases blanches en h5, pour clouer le cavalier f3 qui défend d4.",
      },
      {
        title: "Plan noir 3 : le sacrifice de qualité sur f3",
        fen: "r1bqr1k1/pp3pbp/2n1pnp1/2pp4/4P3/2PP1NP1/PP1N1PBP/R1BQR1K1 w - - 3 10",
        text: "Troisième plan noir : doubler les tours sur la colonne f, avec la perspective d'un sacrifice de qualité sur le cavalier f3, qui mine le centre blanc et l'aile roi.",
      },
      {
        title: "Plan noir 4 : la rupture e6-e5",
        fen: "r1bqr1k1/pp3pbp/2n1pnp1/2pp4/4P3/2PP1NP1/PP1N1PBP/R1BQR1K1 w - - 3 10",
        text: "Quatrième plan noir : réaliser la rupture ...e6-e5, pour obtenir un pion d passé isolé.",
      },
    ],
  },
  "pw-le-pion-arriere": {
    steps: [
      {
        title: "Côte à côte : la formation la plus forte",
        fen: "rnbq1rk1/ppp1ppbp/3p1np1/8/3PP3/2N2N2/PPP1BPPP/R1BQ1RK1 b Qq - 0 1",
        text: "En général, les pions sont mieux placés lorsqu'ils sont deux — parfois trois — de front : dans cette formation, toutes les cases qu'ils contrôlent s'alignent sur la même rangée, ce qui maximise leur efficacité. Cette position, standard dans la défense Pirc, n'est pas mauvaise pour les Noirs : ils se sont développés à peu près aussi bien que les Blancs et ont de bonnes cases pour leurs deux dernières pièces mineures. Mais la plupart des grands maîtres s'accordent à dire que les Blancs ont un léger avantage ici, grâce surtout à leur puissant duo de pions en e4 et d4, qui contrôle très bien les cases centrales.",
        highlights: [
          { square: "d4", color: "green" },
          { square: "e4", color: "green" },
        ],
        arrows: [{ from: "e4", to: "e5", color: "green" }],
      },
      {
        title: "Pions liés : lequel avance ?",
        fen: "r2q1rk1/p1nnbppp/1p2p3/2ppP3/3P1N2/2P2N2/PP3PPP/R1BQR1K1 b Qq - 0 1",
        text: "L'un des deux pions d'un duo finit toujours par avancer : les pions ne contrôlent alors plus harmonieusement les cases des deux couleurs devant eux. Le pion avancé contrôle deux cases d'une couleur ; le pion arrière contrôle deux cases de la MÊME couleur — y compris la case sur laquelle se trouve le pion avancé. Cette formation peut être forte ou faible selon la situation.",
        highlights: [
          { square: "e5", color: "green" },
          { square: "d5", color: "green" },
        ],
      },
      {
        title: "Le pion avancé, le pion arrière",
        fen: "r2q1rk1/p1nnbppp/1p2p3/2ppP3/3P1N2/2P2N2/PP3PPP/R1BQR1K1 b Qq - 0 1",
        text: "Le pion avancé blanc contrôle deux cases profondément dans le camp noir : d6 et f6. f6 est proche du roi noir, et Blanc contrôle bien plus de cases à l'aile roi — sa stratégie correcte est donc d'y attaquer. Le pion avancé noir en d5 contrôle e4 et c4 : aucune pièce noire ne peut vraiment exploiter e4, mais elles sont bien placées pour agir à l'aile dame — Noir peut donc y chercher son jeu. Une autre idée pour Noir : attaquer le pion fort e5 (et lutter pour f6) en poussant ...f7-f6.",
        highlights: [
          { square: "e5", color: "green" },
          { square: "d5", color: "green" },
        ],
      },
      {
        title: "Un pion arriéré qui tombe malade",
        fen: "6k1/5ppp/1pn1p3/3pP3/p1rP4/P4NP1/1P1R1PKP/8 b - - 0 1",
        text: "Le pion d4 est maintenant sous le feu des pièces noires ; la tour et le cavalier blancs sont passifs, contraints de le défendre, alors que les pièces noires sont actives — seul Noir a des chances de gagner cette position. L'un des dangers du pion arriéré : il peut devenir faible s'il perd le soutien de ses pions voisins.",
        highlights: [
          { square: "e5", color: "green" },
          { square: "d4", color: "green" },
        ],
        arrows: [
          { from: "c6", to: "a5", color: "green" },
          { from: "a5", to: "b3", color: "green" },
          { from: "c4", to: "c2", color: "green" },
          { from: "d4", to: "d5", color: "green" },
        ],
      },
      {
        title: "Peut-on encore avancer le pion arriéré ?",
        fen: "2r1r1k1/3bqppp/p4n2/2pP4/P1NpP3/5B1P/3Q1PP1/R3R1K1 w - - 0 1",
        text: "Pour juger une chaîne de pions, il faut se demander si le camp au pion arriéré peut facilement le repousser en avant pour reformer un duo. Même au trait, Noir est ici très mal : Blanc est prêt à avancer son pion e, pendant que les pions c et d noirs restent bloqués par les pièces blanches. Une fois le pion e avancé, les pièces noires seront repoussées sur leurs premières rangées — les pions blancs e5 et d5 deviendront redoutables, et leur force renforcera aussi les pièces derrière eux. Blanc gagnerait même du matériel avec e4-e5 : le cavalier noir n'aurait plus aucune case. La case devant un pion arriéré est presque toujours capitale : le camp au pion arriéré veut l'atteindre pour reformer le duo, l'autre camp veut l'en empêcher.",
        moveSan: ["e5"],
        highlights: [{ square: "e5", color: "green" }],
      },
      {
        title: "Un autre mauvais pion arriéré",
        fen: "2rr2k1/pp2qp1p/2np2p1/4p3/4P3/2P1N2P/PP1RQPP1/3R2K1 w - - 0 1",
        text: "Remarque à quel point le pion arriéré d6 est un handicap pour Noir : il ne peut être défendu que par des pièces, qui deviennent alors passives. Noir n'a presque aucun espoir de le pousser un jour en sécurité vers d5 pour l'échanger contre le pion e4 blanc — il restera donc faible longtemps. Et puisque le pion e noir a déjà avancé en e5, la case devant le pion arriéré (d5) n'est plus protégée par un pion : elle est « faible ». Imagine la puissance d'un cavalier blanc posé là, et combien il serait difficile de l'en déloger !",
        moveSan: ["Nc4"],
        arrows: [{ from: "c4", to: "d6", color: "green" }],
      },
      {
        title: "Un pion arriéré... pas si mauvais",
        fen: "2r1r1k1/1pqnbppp/p2pbn2/P3p3/4P3/1NN1B3/1PPQBPPP/R2R2K1 w - - 0 1",
        text: "La position noire est ici bien meilleure que dans l'exemple précédent : le pion d est bien défendu par le fou en e7 (ce qui le rend passif, mais pas trop grave puisqu'il défend aussi l'aile roi) ; Noir a assez d'influence sur d5 pour empêcher Blanc de s'y installer durablement ; le pion noir en e5 aide à contrôler le cavalier blanc en b3, une pièce passive ; et la dame et la tour noires sont actives sur la colonne c. Pour toutes ces raisons, les chances sont égales.",
        highlights: [{ square: "d5", color: "green" }],
      },
      {
        title: "Faire souffrir l'adversaire",
        fen: "3r2k1/6pp/2rp4/3Rp3/4P3/5P1P/6P1/3R2K1 w - - 0 1",
        text: "Ici, le pion arriéré noir d6 est attaqué par deux tours blanches et défendu par deux tours noires. Mais le besoin de protéger ce pion faible a donné à Blanc une belle occasion tactique : gagner le pion e.",
        moveSan: ["Rxe5", "dxe5", "Rxd8+"],
      },
      {
        title: "Une tour plus résiliente",
        fen: "3r2k1/3r2pp/3p4/3Rp3/4P3/5P1P/6P1/3R2K1 w - - 0 1",
        text: "Ce placement plus résilient de la tour évite la prise blanche en e5. Blanc garde une supériorité positionnelle : ses tours ont plus de liberté d'action, alors que celles de Noir restent liées à la défense.",
        arrows: [{ from: "g1", to: "f2", color: "green" }],
      },
      {
        title: "S'empiler sur la faiblesse",
        fen: "3r2k1/3r1p1p/3p2p1/2pR2P1/2P1P2P/5PK1/8/3R4 w - - 0 1",
        text: "Pour l'instant, Noir tient son pion d, mais au trait, Blanc peut avancer son pion e en e5, attaquant le pion arriéré d6 une troisième fois.",
        moveSan: ["e5"],
      },
      {
        title: "Tout le monde s'y met",
        fen: "1b1rn1k1/3r4/1pqp1p2/pNpR2p1/P1P1P3/1P1R1PB1/3Q2P1/6K1 w - - 0 1",
        text: "Ici, le pion d6 noir est attaqué 5 fois — par toutes les pièces blanches sauf le roi — et défendu 5 fois, par la dame, les tours, le fou et le cavalier noirs. Le jeu blanc est totalement actif, celui de Noir purement défensif. Et avec les faiblesses noires à l'aile roi, la position est mûre pour un sacrifice de percée : après e5! fxe5 Bxe5, le pion g5 noir se retrouve sans protection et menacé, et l'aile roi noire est grande ouverte.",
        moveSan: ["e5", "fxe5", "Bxe5"],
        highlights: [
          { square: "b8", color: "green" },
          { square: "c6", color: "green" },
          { square: "d7", color: "green" },
          { square: "d8", color: "green" },
          { square: "e8", color: "green" },
          { square: "b5", color: "red" },
          { square: "d5", color: "red" },
          { square: "d3", color: "red" },
          { square: "d2", color: "red" },
          { square: "g3", color: "red" },
        ],
      },
      {
        title: "Avancer le pion, malgré tout",
        fen: "6k1/pp1rbppp/3p4/4p3/2P1P3/1PN1RP1P/P5P1/6K1 b - - 0 1",
        text: "Parfois, les particularités d'une position permettent d'avancer le pion arriéré même sans protection suffisante. Au trait, Noir se débarrasse de son pion arriéré d simplement en le poussant en d5.",
        moveSan: ["d5", "exd5", "Bc5"],
        arrows: [{ from: "d6", to: "d5", color: "green" }],
      },
      {
        title: "La case de première ligne",
        fen: "6k1/pp1rbppp/3p4/3Np3/2P1P3/1P3P1P/P5P1/3R3K w - - 0 1",
        text: "La case juste devant un pion arriéré peut poser un gros problème : elle est vulnérable à l'occupation adverse. Ici, Noir a un fou, Blanc un cavalier — le fou est en général un peu plus fort, mais cette position montre l'exception : posté en d5, le cavalier blanc est une tour de force.",
        moveSan: ["Nxe7+", "Rxe7", "Rxd6"],
      },
      {
        title: "Pousser en avant",
        fen: "r3r1k1/p4pbp/3p2p1/4p3/1P2P3/5N2/PR3PPP/R5K1 b - - 0 1",
        text: "D'autres occasions tactiques peuvent permettre de se débarrasser d'un pion arriéré faible.",
        moveSan: ["Red8", "Rd2", "Rac8", "Rad1", "Rc6"],
        highlights: [{ square: "d6", color: "green" }],
      },
      {
        title: "Amener les renforts",
        fen: "2r3k1/pp1r1bp1/2Np1p2/3Np3/4P3/1P2R2P/P4PP1/3R2K1 b - - 0 1",
        text: "Une autre façon d'atténuer la faiblesse d'un pion arriéré est d'amener un pion ami sur une colonne voisine en capturant une pièce adverse — le pion arriéré peut ensuite avancer avec ce soutien. Ici, Blanc vient de capturer un cavalier noir en c6, et Noir a deux façons de reprendre : avec la tour c8 ou le pion b7.",
        moveSan: ["Rxc6"],
      },
      {
        title: "Éliminer l'obstacle",
        fen: "3r4/5pk1/3pb1p1/4p3/1r2P3/2N4P/1P4P1/1R1R2K1 b - - 0 1",
        text: "Parfois, on peut préparer l'avance d'un pion arriéré en échangeant le pion adverse qui l'empêche d'avancer.",
        moveSan: ["f5", "exf5", "Bxf5", "Ra1", "Rxb2"],
        highlights: [{ square: "d6", color: "green" }],
      },
      {
        title: "Occuper la case en toute sécurité",
        fen: "r4rk1/pp3ppp/3pb3/4p3/2P1P3/1PN2P1P/P5P1/R4RK1 w - - 0 1",
        text: "Le pion adverse est clairement arriéré et tu tiens fermement la case devant lui. Tu peux l'occuper avec une pièce, surtout un cavalier — mais avant de le faire, assure-toi que si ta pièce y est capturée, tu pourras reprendre avec une AUTRE PIÈCE, jamais un pion. 1.Cd5? est justement l'erreur à éviter (1.Tfd1! était le coup correct) : après ...Fxd5 2.cxd5, c'est un PION qui reprend — la colonne d se referme, et Blanc perd toute chance d'attaquer durablement le pion arriéré.",
        moveSan: ["Nd5", "Bxd5", "cxd5"],
      },
      {
        title: "Un pion qui en retient deux",
        fen: "1rbqr1k1/1p3pbp/p2p1np1/2pP4/P1N2P2/4PB1P/1PQ3P1/2BRR1K1 w - - 0 1",
        text: "Voici une situation où « un pion qui en retient deux » donne un net avantage à un camp. Le meilleur plan blanc est de pousser le pion e : cela renforce le contrôle du centre, établit un duo de pions (e4-f4), et prépare même un second duo, encore plus fort (d5-e5) ; cela permettrait aussi de jouer f2-f4, menaçant d'exposer le roi noir, et d'amener le fou en f4 qui, avec le cavalier fort en c4, attaquerait le pion faible d6 noir. 1.e4 donne l'avantage, mais ignore l'idée noire de jouer ...b5 pour créer son propre duo (c5-b5) et chasser le cavalier blanc — le meilleur coup était en réalité 1.a5!, qui empêche ce duo noir et sécurise la case c4 : avec le pion a qui retient à la fois le pion a et le pion b noirs, Blanc a alors pratiquement un pion de plus.",
        moveSan: ["e4", "b5", "axb5", "axb5", "Na3", "Nd7", "Qf2", "Qa5"],
      },
    ],
  },
  "mg-les-cavaliers": {
    steps: [
      {
        title: "Le fou, ennemi juré du cavalier",
        fen: "2n4k/5ppp/8/K7/8/4B3/5PPP/8 w - - 0 1",
        text: "Première illustration de la « domination » d'un cavalier, par son pire ennemi : le fou. Le matériel est rigoureusement égal, ce qui rend d'abord surprenant que les Blancs gagnent tout simplement ici — mais le cavalier noir, relégué au bord de l'échiquier, est le premier indice qu'on peut le dominer complètement.",
      },
      {
        title: "Trois cases en diagonale, et le cavalier est mort",
        fen: "2n4k/5ppp/8/K7/8/4B3/5PPP/8 w - - 0 1",
        text: "Avec ce coup tout simple, le cavalier est complètement paralysé ! Noir ne peut plus empêcher le plan Ra6-Rb7-Rxc8. Placer un fou exactement à trois cases d'un cavalier le domine entièrement : chaque case d'avance du cavalier tombe sous sa surveillance — on appelle parfois cela « décaler le cavalier ».",
        moveSan: ["Bc5"],
        highlights: [
          { square: "a7", color: "green" },
          { square: "b6", color: "green" },
          { square: "d6", color: "green" },
          { square: "e7", color: "green" },
        ],
        arrows: [
          { from: "c8", to: "e7", color: "green" },
          { from: "c8", to: "d6", color: "green" },
          { from: "c8", to: "b6", color: "green" },
          { from: "c8", to: "a7", color: "green" },
        ],
      },
      {
        title: "Un coup de pion qui coupe tout avenir au cavalier",
        fen: "r1r3k1/pp3pp1/4pn1p/3p1b2/P2P4/4P3/1PPKBPPP/R1R1N3 w - - 0 1",
        text: "Les Blancs ont un pion de plus, mais le chemin vers la victoire est encore long. Un coup de pion tout simple change pourtant la donne : en retirant au cavalier noir l'accès aux cases e4 et g4, f2-f3 lui coupe tout avenir en f6 — il doit reculer pour espérer avancer ailleurs. Cette lente reconversion laissera aux Blancs le temps d'activer leur majorité de pions à l'aile dame et de progresser vers le gain. Remarque au passage que le fou noir en f5 est, lui aussi, dominé par cette même chaîne de pions g2-f3.",
        moveSan: ["f3", "Ne8"],
        highlights: [
          { square: "e4", color: "green" },
          { square: "g4", color: "green" },
        ],
      },
      {
        title: "Toujours aucune case d'avance",
        fen: "r1r3k1/pp3pp1/4pn1p/3p1b2/P2P4/4P3/1PPKBPPP/R1R1N3 w - - 0 1",
        text: "Le cavalier n'a toujours aucune case d'avance, et les Blancs sont sur le point d'obtenir un pion c passé, décisif pour la victoire.",
        moveSan: ["f3", "Ne8", "b3", "Nd6", "c4", "dxc4", "bxc4"],
      },
      {
        title: "Botvinnik repère un poste instable",
        fen: "5rk1/3r1ppp/1pq3n1/p2p4/P2P4/2PNRQ2/1P4PP/4R1K1 w - - 0 1",
        text: "Noir vient de jouer ...Dc6, attaquant le pion a4 — mais Botvinnik remarque surtout que le cavalier en g6 est instable.",
      },
      {
        title: "Deux pions d'aile dominent aussi un cavalier",
        fen: "5rk1/3r1ppp/1pq3n1/p2p4/P2P4/2PNRQ2/1P4PP/4R1K1 w - - 0 1",
        text: "Deux pions d'aile (proches du bord de l'échiquier) suffisent à dominer un cavalier en g6/g3 (ou b6/b3) — et peuvent continuer d'avancer pour le repousser encore plus loin.",
        moveSan: ["g3", "Rd6", "h4"],
        highlights: [
          { square: "e5", color: "green" },
          { square: "f4", color: "green" },
          { square: "h4", color: "green" },
        ],
      },
      {
        title: "Le prix à payer pour reloger le cavalier",
        fen: "5rk1/3r1ppp/1pq3n1/p2p4/P2P4/2PNRQ2/1P4PP/4R1K1 w - - 0 1",
        text: "La poussée h5 est désormais imparable ; Boleslavsky choisit donc de contrôler la case e5 par un pion, pour permettre à son cavalier de se replacer ailleurs en sécurité. Mais ce coup affaiblissant abandonne toutes les cases claires près de son roi (surtout e6) — et rend en prime toute finale favorable aux Blancs.",
        moveSan: ["g3", "Rd6", "h4", "f6"],
      },
      {
        title: "Chaque pièce blanche vaut mieux que son vis-à-vis",
        fen: "5rk1/3r1ppp/1pq3n1/p2p4/P2P4/2PNRQ2/1P4PP/4R1K1 w - - 0 1",
        text: "Chacune des pièces de Botvinnik est meilleure que son homologue noire. Il a fini par remporter cette finale en 49 coups.",
        moveSan: ["g3", "Rd6", "h4", "f6", "Qf5", "Qc8", "Qxc8", "Rxc8", "h5", "Nf8", "Re7", "Rcd8", "Nf4"],
      },
      {
        title: "Le cavalier trouve un avant-poste en c5",
        fen: "r1bq1rk1/ppp2pbp/n2p1np1/3Pp3/2P1P3/2N2N2/PP2BPPP/R1BQ1RK1 b - - 0 8",
        text: "Cette position est une ligne principale de la défense Est-indienne. Le cavalier noir trouve en c5 un excellent avant-poste : en attaquant le pion e4, il force d'abord une réaction blanche.",
        moveSan: ["Nc5"],
      },
      {
        title: "Un trou où se poser pour toujours",
        fen: "r1bq1rk1/ppp2pbp/n2p1np1/3Pp3/2P1P3/2N2N2/PP2BPPP/R1BQ1RK1 b - - 0 8",
        text: "b4 est désormais impossible à cause de ...axb3 en passant. Le cavalier en c5 a trouvé un magnifique trou où se poser, et ne sera plus jamais dominé ! Un cavalier a besoin d'un point d'appui avancé pour révéler tout son potentiel — parfois, un seul coup de pion suffit à garder une case clé sous contrôle pour le reste de la partie.",
        moveSan: ["Nc5", "Qc2", "a5", "a3", "a4"],
      },
      {
        title: "Une tour peut dominer aussi",
        fen: "8/1p1kpppp/3n4/8/2R5/3K4/1P2PPPP/8 w - - 1 1",
        text: "Les Blancs ont un échange d'avance dans cette finale par ailleurs symétrique. Le chemin vers la victoire commence par sauver la tour — mais voici un joli coup qui domine presque totalement le cavalier en d6. D'un coup, trois des quatre cases d'avance du cavalier sont couvertes. La tour en b4 se trouve en plus exactement à deux cases en diagonale du cavalier, une distance que celui-ci ne peut menacer avant plusieurs coups : placer une pièce à exactement deux cases en diagonale d'un cavalier la met à l'abri de toute attaque de ce cavalier pendant au moins 3 coups.",
        moveSan: ["Rb4"],
        highlights: [
          { square: "b5", color: "green" },
          { square: "c4", color: "green" },
          { square: "e4", color: "green" },
        ],
        arrows: [
          { from: "d6", to: "b5", color: "green" },
          { from: "d6", to: "c4", color: "green" },
          { from: "d6", to: "e4", color: "green" },
        ],
      },
      {
        title: "Le roi et la dame dominent à tour de rôle",
        fen: "8/8/8/2n1k3/8/3K1Q2/8/8 w - - 4 3",
        text: "Cette finale dame contre cavalier est connue pour être gagnante pour les Blancs. Ici, en échec, ils doivent malgré tout progresser — en plaçant le roi exactement à deux cases en diagonale du cavalier noir, celui-ci se retrouve effectivement dominé ! Tout comme le roi dominait le cavalier, la dame fait de même à son tour : les Blancs sont désormais à l'abri de toute fourchette.",
        moveSan: ["Ke3", "Ne6", "Qg4"],
      },
      {
        title: "Répéter le motif jusqu'au mat",
        fen: "8/8/8/2n1k3/8/3K1Q2/8/8 w - - 4 3",
        text: "Le roi domine à nouveau le cavalier et progresse encore, repoussant le duo noir vers sa perte. Les Blancs répètent ce motif — dominer le cavalier tour à tour avec le roi et la dame — jusqu'au mat final.",
        moveSan: ["Ke3", "Ne6", "Qg4", "Kd5", "Qe4+", "Kd6", "Qf5", "Nc5", "Kd4", "Ne6+", "Kc4"],
      },
      {
        title: "NoseKnowsAll domine à son tour, en partie réelle",
        fen: "r4rk1/1bq1bppp/pp1ppn2/8/P2NPP2/2NnQ3/1PPB2PP/4RR1K w - - 0 15",
        text: "Extrait d'une partie rapide OTB de NoseKnowsAll lui-même : après l'erreur noire ...Cxd3, le cavalier f6 et le fou b7 se retrouvent dominés par cette masse de pions centrale.",
        moveSan: ["cxd3"],
      },
      {
        title: "La combinaison finale",
        fen: "2r1rk2/1bq2pnp/pp1p2pQ/6N1/P2PP3/2N5/1P4PP/4RR1K w - - 2 27",
        text: "La partie est en réalité terminée depuis longtemps, mais l'adversaire choisit de jouer jusqu'au mat puisque NoseKnowsAll manque de temps. La suite se passe de commentaire.",
        moveSan: ["Rxf7+", "Qxf7", "Nxf7", "Kxf7"],
      },
    ],
  },
  "mg-les-fous": {
    steps: [
      {
        title: "Bon fou, mauvais fou",
        fen: "r1bq1rk1/pp2bppp/2n1p3/3pP3/2pP4/2P2N2/PPB2PPP/R1BQ1RK1 w Qq - 0 1",
        text: "Premier concept clé : le « bon » et le « mauvais » fou. Un bon fou est sur la couleur OPPOSÉE à celle de tes pions fixés (souvent au centre) — il garde ainsi une grande liberté de mouvement et contrôle beaucoup de cases. Les bons fous de chaque camp sont ici surlignés en vert.",
        highlights: [
          { square: "c2", color: "green" },
          { square: "e7", color: "green" },
          { square: "c1", color: "red" },
          { square: "c8", color: "red" },
        ],
      },
      {
        title: "Le mauvais fou, prisonnier de ses propres pions",
        fen: "r1bq1rk1/pp2bppp/2n1p3/3pP3/2pP4/2P2N2/PPB2PPP/R1BQ1RK1 w Qq - 0 1",
        text: "Un mauvais fou est sur la MÊME couleur que tes pions fixés — il est donc restreint dans ses cases d'accès et n'en contrôle que peu. Les mauvais fous de chaque camp sont ici surlignés en rouge.",
        moveSan: ["g3"],
        highlights: [
          { square: "c1", color: "red" },
          { square: "c8", color: "red" },
          { square: "e7", color: "green" },
          { square: "c2", color: "green" },
        ],
      },
      {
        title: "Échanger son mauvais fou contre le bon fou adverse",
        fen: "r1bq1rk1/pp2bppp/2n1p3/3pP3/2pP4/2P2N2/PPB2PPP/R1BQ1RK1 w Qq - 0 1",
        text: "Ton mauvais fou est presque toujours de la même couleur que le BON fou adverse, et réciproquement — l'échanger contre lui est donc souvent excellent : ton adversaire ne garde plus qu'un mauvais fou. Attention cependant, ces étiquettes peuvent parfois tromper, comme la suite va le montrer...",
        moveSan: ["g3", "b5"],
        highlights: [
          { square: "e7", color: "green" },
          { square: "c2", color: "green" },
          { square: "c1", color: "red" },
          { square: "c8", color: "red" },
        ],
      },
      {
        title: "« Mauvais » ne veut pas dire « inactif »",
        fen: "r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P1B2/2PBP3/PP1N1PPP/R2QK1NR b KQkq - 0 1",
        text: "Un fou « mauvais » n'est pas forcément une mauvaise pièce ! Position type de la London : remarque que le fou blanc en f4 et le fou noir en c8 sont tous deux « mauvais » à cause des pions d bloqués — mais l'un des deux est loin d'être inactif.",
        highlights: [
          { square: "f4", color: "red" },
          { square: "f8", color: "green" },
          { square: "d3", color: "green" },
          { square: "c8", color: "red" },
        ],
      },
      {
        title: "Échanger son bon fou contre un mauvais fou très actif",
        fen: "r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P1B2/2PBP3/PP1N1PPP/R2QK1NR b KQkq - 0 1",
        text: "Noir échange volontiers son bon fou contre le mauvais fou blanc. Pourquoi ? Parce que le fou en f4 est une pièce extrêmement active, qui contrôle plusieurs cases clés dans le camp noir ! Ce mauvais fou actif vaut bien plus qu'un bon fou inactif ne vaudrait en e7.",
        moveSan: ["Bd6"],
      },
      {
        title: "Le fou actif reste actif, même après l'échange",
        fen: "r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P1B2/2PBP3/PP1N1PPP/R2QK1NR b KQkq - 0 1",
        text: "Débarrassés de leur mauvais fou, les Blancs placent aussitôt tous leurs pions sur cases sombres. Le bon fou en d3 reste actif, tourné vers le futur roque noir — Blanc peut même rêver de Cf3-e5.",
        moveSan: ["Bd6", "Bxd6", "Qxd6", "f4"],
        highlights: [{ square: "d3", color: "green" }],
      },
      {
        title: "Un mauvais fou qui reste enfermé n'est pas un drame",
        fen: "r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P1B2/2PBP3/PP1N1PPP/R2QK1NR b KQkq - 0 1",
        text: "Pendant ce temps, le mauvais fou noir reste inactif en d7, enfermé derrière sa propre chaîne de pions. Mais le roi noir sera raisonnablement en sécurité à l'aile roi et le camp noir n'a aucune faiblesse : la position reste à peu près égale, avec un jeu un peu plus facile pour les Blancs.",
        moveSan: ["Bd6", "Bxd6", "Qxd6", "f4", "cxd4", "cxd4", "Bd7"],
        highlights: [{ square: "d7", color: "red" }],
      },
      {
        title: "Un mauvais fou peut défendre un bon pion",
        fen: "2r1r3/1pqbppkp/3p2p1/3P4/B6P/5P2/1PPQ2PK/3RR3 w - - 0 1",
        text: "Exception importante à la règle des échanges : quand tu as plus d'espace, mieux vaut souvent ÉVITER tous les échanges. Ici, le pion d5 est très fort et les pièces blanches influencent les deux ailes ; Noir doit même réfléchir à deux fois avant de bouger son pion e, resté en arrière.",
      },
      {
        title: "Le mauvais fou défend le bon pion",
        fen: "2r1r3/1pqbppkp/3p2p1/3P4/B6P/5P2/1PPQ2PK/3RR3 w - - 0 1",
        text: "Le fou blanc est techniquement mauvais en b3, mais il joue un rôle bien réel : sans lui, Noir obtiendrait du contre-jeu à l'aile dame. En b3, il défend les pions clés c2 et d5, empêche à jamais le pion e noir d'avancer, et protège b2 d'une attaque directe. Défendre un pion depuis l'arrière avec un fou est parfaitement acceptable quand ce pion restreint les pièces adverses.",
        moveSan: ["Bb3"],
      },
      {
        title: "Le camp qui a un plan gagne",
        fen: "2r1r3/1pqbppkp/3p2p1/3P4/B6P/5P2/1PPQ2PK/3RR3 w - - 0 1",
        text: "Noir n'a aucun plan, alors que les Blancs peuvent attaquer le roi noir par h4-h5, ou doubler les tours sur la colonne e pour presser la faiblesse e7.",
        moveSan: ["Bb3", "Qc5"],
      },
      {
        title: "Toujours battre en retraite pour réactiver un mauvais fou",
        fen: "r3kn1r/p1q1npp1/4p3/1p1pP1Np/b1pP3P/2P3PB/2PB1P2/R2Q1RK1 w kq - 0 1",
        text: "Les Blancs ont un énorme avantage d'espace, un roi en sécurité et la paire de fous ; mais Noir a un pion de plus dans une position solide, avec l'espoir de jouer contre les pions c doublés blancs et de pousser son pion a passé vers la victoire. Stein comprend qu'il doit d'abord réactiver son mauvais fou, coincé derrière sa propre chaîne de pions centrale — toujours battre en retraite quand il le faut !",
        moveSan: ["Bc1"],
      },
      {
        title: "Le fou renaît sur la longue diagonale",
        fen: "r3kn1r/p1q1npp1/4p3/1p1pP1Np/b1pP3P/2P3PB/2PB1P2/R2Q1RK1 w kq - 0 1",
        text: "Pendant ce temps, le mauvais fou noir en a4 est certes sorti de la chaîne de pions, mais on ne peut guère le dire « actif » : il ne contrôle que 3 cases et n'a que 2 coups légaux, tous deux perdant la pièce. Le fou blanc, lui, respire enfin le long de la diagonale a3-f8 — et comme Noir n'a plus de fou de cases claires, rien ne peut contester ce monstre nouvellement créé.",
        moveSan: ["Bc1", "g6", "Ba3"],
      },
      {
        title: "Kasparov active sa pire pièce",
        fen: "r2qrb1k/1b4p1/p2p1n1p/1ppP1p2/Pn2P3/4R2P/1P1N1PPN/1BBQR1K1 w - - 4 20",
        text: "Championnat du monde 1990 : Karpov vient de jouer Rh8 pour mettre son roi à l'abri. Kasparov repère une faille dans cette idée et lance une attaque terrible, tout en activant sa pire pièce : le fou en c1, qui file vers b2 pour s'installer sur une diagonale qu'on ne pourra plus jamais fermer — au bout de celle-ci : le roi de Karpov.",
        moveSan: ["b3"],
      },
      {
        title: "Les deux fous sur leur meilleure diagonale",
        fen: "r2qrb1k/1b4p1/p2p1n1p/1ppP1p2/Pn2P3/4R2P/1P1N1PPN/1BBQR1K1 w - - 4 20",
        text: "Les deux fous de Kasparov ont atteint leurs meilleures diagonales. Il a fini par gagner cette partie grâce à une magnifique attaque à l'aile roi, s'assurant deux points d'avance et conservant son titre de champion du monde.",
        moveSan: ["b3", "bxa4", "bxa4", "c4", "Bb2"],
      },
      {
        title: "Course à l'activation du mauvais fou",
        fen: "8/1p2rkbp/1R4p1/5p2/2Ppp3/3P2P1/4PPBP/6K1 w - - 0 1",
        text: "Les deux camps ont ici un mauvais fou ; si les tours s'échangent, la partie finit sûrement nulle (fous de couleurs opposées). Mais il reste du jeu : tout se résume à savoir qui va activer son fou en premier.",
        moveSan: ["g4"],
      },
      {
        title: "Le mauvais fou trouve enfin une cible",
        fen: "8/1p2rkbp/1R4p1/5p2/2Ppp3/3P2P1/4PPBP/6K1 w - - 0 1",
        text: "Les Blancs ont trouvé le moyen d'activer leur mauvais fou, qui vise maintenant un pion non protégé. Noir essaie la même chose, mais h2 se défend facilement alors que f5 ne se défend pas — les Blancs ont ici de sérieuses chances de gain.",
        moveSan: ["g4", "Be5", "gxf5", "gxf5", "Bh3"],
      },
      {
        title: "Sacrifier un pion pour libérer le fou",
        fen: "1nrq1rk1/1b2bppp/p2pp3/1p6/1P2PP2/P1BP1N2/4N1PP/R3QR1K b - - 0 1",
        text: "Position sicilienne typique : Noir a la paire de fous, mais aucun des deux n'inspire confiance. David Navara trouve un moyen brillant d'activer son fou en b7, quel qu'en soit le prix — même un pion. Un coup de pion bien chronométré est souvent l'outil décisif pour activer ses pièces.",
        moveSan: ["d5", "e5", "d4", "Nexd4", "Nc6", "Bb2", "Nxd4", "Nxd4", "Qd5"],
      },
      {
        title: "Morphy et le mat sur la diagonale a3-f8",
        fen: "r4k1r/ppp1Rppp/qb6/n7/8/B4N2/P4PPP/1R1Q2K1 w - - 1 19",
        text: "Une partie du jeune Paul Morphy, en 1849, contre son propre père : cette fois, c'est le fou en a3 qui a le dernier mot, créant un double échec et mat esthétique le long de la diagonale a3-f8.",
        moveSan: ["Qd5", "Qc4", "Rxf7+", "Kg8", "Rf8#"],
      },
    ],
  },
  "mg-les-tours": {
    steps: [
      {
        title: "Le rêve de toute tour : la 7e rangée",
        fen: "7r/ppp1ppkp/6p1/8/8/6P1/PPP1PPKP/3R4 w - - 0 1",
        text: "Le rêve de toute tour est d'atterrir sur la 7e rangée (la 2e pour les Noirs) et d'y dévorer tous les pions adverses non défendus. Voici un exemple tout simple où les Blancs peuvent faire exactement cela.",
      },
      {
        title: "Un coup mat : la tour atterrit",
        fen: "7r/ppp1ppkp/6p1/8/8/6P1/PPP1PPKP/3R4 w - - 0 1",
        text: "La tour atterrit avec fracas sur la 7e rangée, et tous les pions noirs sont désormais visés.",
        moveSan: ["Rd7"],
      },
      {
        title: "Le mal est déjà fait",
        fen: "7r/ppp1ppkp/6p1/8/8/6P1/PPP1PPKP/3R4 w - - 0 1",
        text: "Noir essaie lui aussi d'atteindre notre 7e rangée, mais le mal est déjà fait : Blanc reste avec au moins 2 pions d'avance, et les pions surnuméraires à l'aile dame suffiront à gagner la partie.",
        moveSan: ["Rd7", "Kf6", "Rxc7", "Rd8", "Rxb7", "Rd2", "Rc7", "Rxe2", "Kf3", "Rd2", "Ke3"],
      },
      {
        title: "La 7e rangée n'a rien de magique en soi",
        fen: "7r/8/ppp1ppkp/6p1/8/6P1/PPP1PPKP/3R4 w - - 0 1",
        text: "La 7e rangée n'a en réalité rien de spécial en elle-même. Ce que la tour veut vraiment, c'est attaquer toutes les faiblesses adverses — ici, c'est en fait la 6e rangée que la tour doit viser, là où tous les pions noirs attendent d'être ramassés.",
        moveSan: ["Rd6"],
      },
      {
        title: "Pas d'infiltration pour toi !",
        fen: "7r/8/ppp1ppkp/6p1/8/6P1/PPP1PPKP/3R4 w - - 0 1",
        text: "Pas d'infiltration pour Noir cette fois : la tour blanche revient à temps garder la 3e rangée.",
        moveSan: ["Rd6", "Rc8", "Rxe6", "Kf7", "Re3", "Rd8", "Rd3"],
      },
      {
        title: "Des tours mal connectées",
        fen: "1nrq1rk1/4bppp/p2p4/1p1Pp3/1N2P3/1P2BP2/P2Q2PP/2R2RK1 w - - 4 20",
        text: "Les deux camps s'efforcent ici d'empêcher la tour adverse de s'infiltrer sur la colonne c — mais Noir a un problème de fond : ses tours ne sont pas connectées.",
      },
      {
        title: "La dame contrôle mal une colonne ouverte",
        fen: "1nrq1rk1/4bppp/p2p4/1p1Pp3/1N2P3/1P2BP2/P2Q2PP/2R2RK1 w - - 4 20",
        text: "La dame est la pire pièce pour contrôler une colonne ouverte, car on la chasse trop facilement. Les Blancs reprennent le contrôle de la colonne c, puis la verrouillent pour de bon : Dc7 arrive ensuite, avec une pénétration décisive sur la 7e rangée. Une fois le contrôle d'une colonne ouverte assuré, double toujours dessus pour t'infiltrer jusqu'à la 7e rangée !",
        moveSan: ["Rxc8", "Qxc8", "Rc1", "Qb7", "Qc2"],
      },
      {
        title: "Forcer le contrôle de la colonne ouverte",
        fen: "r1r2qk1/1p2bppp/p3pn2/3p4/3P1B2/1P1QPN1P/P4PP1/R1R3K1 b - - 0 2",
        text: "Comme on l'a déjà vu, tout échange de tours laisse à l'adversaire le contrôle de l'unique colonne ouverte. Mais Noir a ici un moyen de forcer les choses : en prenant la case-carrefour c1, il coupe toute chance pour les Blancs de garder le contrôle de la colonne c.",
        moveSan: ["Ba3"],
      },
      {
        title: "Grignoter toute la 2e rangée",
        fen: "r1r2qk1/1p2bppp/p3pn2/3p4/3P1B2/1P1QPN1P/P4PP1/R1R3K1 b - - 0 2",
        text: "Les pièces actives noires commencent à grignoter tous les pions de la 2e rangée — le contrôle d'une colonne ouverte peut souvent être le premier pas vers la victoire !",
        moveSan: ["Ba3", "Rxc8", "Rxc8", "Qe2", "Rc6", "Rd1", "Qc8", "Rd2", "Ne4", "Rd1", "Rc2", "Qf1", "Rxf2"],
      },
      {
        title: "Les cochons infiltrent la 8e rangée",
        fen: "1q1r2k1/2r1bpp1/p3pn1p/8/p1PP4/3B1Q1R/5PPP/BR4K1 b - - 1 26",
        text: "Les tours adorent aussi s'infiltrer sur la 8e rangée, même sans pion à y prendre : doubler sur la 8e rangée mène plutôt à une attaque directe et des menaces de mat. Voici un exemple spectaculaire de l'ancien champion du monde Viswanathan Anand — ce coup tactique a dû être un choc pour Radjabov.",
        moveSan: ["Rxc4"],
      },
      {
        title: "Le pion passé décide",
        fen: "1q1r2k1/2r1bpp1/p3pn1p/8/p1PP4/3B1Q1R/5PPP/BR4K1 b - - 1 26",
        text: "Radjabov a réussi à défendre son fou en f1, mais il reste encore un tour de force dans la position : le pion a passé blanc décide finalement de la partie. Les Blancs ont abandonné plutôt que de laisser Anand promouvoir une nouvelle dame. Une fois tes « cochons » installés sur la 8e rangée, vise toujours une attaque totale contre le roi adverse.",
        moveSan: ["Rxc4", "Rxb8", "Rc1+", "Bf1", "Rxb8", "Bc3", "Rbb1", "Qd3", "a3", "Qxa6", "a2", "g4", "Rxf1+", "Qxf1", "Ne4", "Ba1", "Nd2"],
      },
      {
        title: "Un coup contre-intuitif pour empêcher l'infiltration",
        fen: "r2r4/1pq1bp1k/2p1bnpp/4p3/4P3/4BNNP/1PPRQPP1/3R2K1 b - - 0 4",
        text: "On sait combien il est important de contrôler une colonne ouverte, pour ensuite s'y infiltrer. Ici pourtant, Noir doit jouer un coup contre-intuitif pour garder l'avantage : brillant ! Puisque toutes les cases d'infiltration de la colonne d sont déjà sous contrôle noir, Noir peut abandonner la colonne d aux Blancs et garder plus de pièces sur l'échiquier pour de futures opérations à l'aile dame.",
        moveSan: ["Rdb8"],
      },
      {
        title: "Contrôler une colonne ouverte ne sert que s'il y a une case d'infiltration",
        fen: "r2r4/1pq1bp1k/2p1bnpp/4p3/4P3/4BNNP/1PPRQPP1/3R2K1 b - - 0 4",
        text: "Noir garde un léger avantage et peut chercher à s'infiltrer lui-même en a2 — la colonne d blanche, elle, ne mène nulle part. Contrôler une colonne ouverte ne compte que s'il existe une vraie case d'infiltration au bout !",
        moveSan: ["Rdb8", "Nh2", "b5"],
      },
      {
        title: "Petursson et la maîtrise de l'infiltration",
        fen: "1rrn1bk1/1pqn1p1p/p2pp1p1/8/2P1PP2/1NN1B3/PP1RQ1PP/3R3K w - - 7 22",
        text: "Pour conclure, une partie éblouissante du GM islandais Margeir Petursson, qui multiplie ici les infiltrations de tour. Il doit d'abord convertir son avantage positionnel en attaque concrète.",
        moveSan: ["c5"],
      },
      {
        title: "Un puissant coup de tour sur la 7e rangée",
        fen: "r1r2b1k/1p1R1p1p/p3nNpB/2p5/8/8/PP4PP/3R3K w - - 2 32",
        text: "Un coup puissant qui montre toute la force d'une tour sur la 7e rangée : le mat arabe Txh7# est désormais menacé. Noir abandonne : le cavalier en g7, le roi en h8 et la tour en a8 sont tous paralysés par les deux pièces blanches et la menace de mat arabe ou de mat au couloir — aucune défense ne subsiste.",
        moveSan: ["Rxf7", "Bg7", "Bxg7+", "Nxg7", "Rdd7", "Rf8", "Rxb7", "Rxf7", "Rxf7"],
      },
    ],
  },
  "mg-toujours-sacrifier-la-qualite": {
    steps: [
      {
        title: "Sacrifier une tour contre un cavalier ou un fou",
        fen: "4q2k/2r1r1p1/4Pn1p/p1p2R2/P2pQ2P/1P1B1R2/6P1/6K1 w - - 9 38",
        text: "Le sacrifice de qualité consiste à céder volontairement une tour (5 points) contre un cavalier ou un fou (3 points). Premier exemple, tiré du match du championnat du monde 1972, Fischer-Spassky : ceci n'est presque pas un sacrifice de qualité, plutôt un coup qui achève net l'adversaire.",
      },
      {
        title: "Étouffer tout espoir de défense",
        fen: "4q2k/2r1r1p1/4Pn1p/p1p2R2/P2pQ2P/1P1B1R2/6P1/6K1 w - - 9 38",
        text: "Les Blancs gagnaient déjà, mais ce coup étouffe tout espoir de défense.",
        moveSan: ["Rxf6"],
      },
      {
        title: "Trois menaces de mat à la fois",
        fen: "4q2k/2r1r1p1/4Pn1p/p1p2R2/P2pQ2P/1P1B1R2/6P1/6K1 w - - 9 38",
        text: "Avec les menaces imparables Dxh6, Txh6 et Tf8+, toutes menant au mat, Spassky abandonne.",
        moveSan: ["Rxf6", "gxf6", "Rxf6", "Kg8", "Bc4", "Kh8", "Qf4"],
      },
      {
        title: "L'initiative prime sur le matériel",
        fen: "r2n1rk1/1ppqnpbp/3p2b1/1P4NR/4B3/2N3P1/PB1QPP2/R3K3 w Q - 3 18",
        text: "Partie Petrosian - Estrin : pour trouver ce coup, il faut reconnaître que les pièces noires sont épouvantables, que Blanc a une avance de développement, et que l'initiative compte plus que le matériel quand les deux camps ont roqué de côtés opposés. La colonne h ouverte suffit : Petrosian n'a même pas vraiment sacrifié la qualité, il gagne déjà tout simplement.",
        moveSan: ["Rxh7", "Bxh7", "Bxh7+", "Kh8", "O-O-O"],
      },
      {
        title: "Faire tout pour arrêter l'hémorragie",
        fen: "r2n1rk1/1ppqnpbp/3p2b1/1P4NR/4B3/2N3P1/PB1QPP2/R3K3 w Q - 3 18",
        text: "Les Blancs menacent Fxg7+ suivi de Db2+ sur la grande diagonale, alors Noir fait tout pour arrêter l'hémorragie. C'est déjà gagné pour les Blancs — Petrosian n'a plus qu'à trouver le chemin.",
        moveSan: ["Rxh7", "Bxh7", "Bxh7+", "Kh8", "O-O-O", "Ng8", "Rh1", "Nh6", "Nd5"],
      },
      {
        title: "L'écrasement final",
        fen: "r2n1rk1/1ppqnpbp/3p2b1/1P4NR/4B3/2N3P1/PB1QPP2/R3K3 w Q - 3 18",
        text: "Noir abandonne plutôt que d'affronter l'écrasement qui suit.",
        moveSan: ["Rxh7", "Bxh7", "Bxh7+", "Kh8", "O-O-O", "Ng8", "Rh1", "Nh6", "Nd5", "f6", "Ne4", "Rxa2", "Rxh6", "Bxh6", "Qxh6", "Qg7", "Qh4"],
      },
      {
        title: "Le VRAI sacrifice de qualité",
        fen: "2n1r1k1/2qbr1b1/pp1p1p1p/2pP1Pp1/P1P3P1/1PNQ1BBP/8/R3R1K1 w Q - 0 1",
        text: "Parlons maintenant des VRAIS sacrifices de qualité : céder une tour pour une pure compensation positionnelle — pas pour regagner le matériel tout de suite.",
      },
      {
        title: "La liste des pour et des contre",
        fen: "2n1r1k1/2qbr1b1/pp1p1p1p/2pP1Pp1/P1P3P1/1PNQ1BBP/8/R3R1K1 w Q - 0 1",
        text: "Noir : 👍 une qualité d'avance, 👎 le pion d6 est faible et accessible, 👎 le fou en g7 est totalement enfermé, 👎 les tours en e7 et e8 ne font rigoureusement rien, 👎 le cavalier en c8 ne participe à rien. Blanc : 👍 un pion e passé en e6, 👍 un cavalier magnifique en route pour d5, 👍 le fou en g3 et la dame visent tous deux la case faible d6.",
        moveSan: ["Re6", "Bxe6", "dxe6"],
      },
      {
        title: "Ne jamais se presser de reprendre la qualité",
        fen: "2n1r1k1/2qbr1b1/pp1p1p1p/2pP1Pp1/P1P3P1/1PNQ1BBP/8/R3R1K1 w Q - 0 1",
        text: "J'ai inclus la suite des coups pour montrer à quelle vitesse tout s'effondre si Noir joue des coups qui semblent pourtant normaux. Les Blancs n'ont même jamais besoin de reprendre la qualité — le cavalier en d5 vaut mieux que n'importe laquelle des deux tours noires ! Ce n'est qu'une fois la position poussée à son maximum qu'ils iront chercher le matériel.",
        moveSan: ["Re6", "Bxe6", "dxe6", "Na7", "Nd5"],
      },
      {
        title: "Le cavalier et la dame infiltrent les cases sombres",
        fen: "2n1r1k1/q3r3/pp1pP2p/2pN1Pp1/P1P3P1/1PbQ1B2/6K1/3R4 w - - 0 10",
        text: "Le cavalier et la dame s'apprêtent tous deux à s'infiltrer sur les cases sombres affaiblies autour du roi noir. Le moteur suggère Txe6, abandonnant carrément une tour entière plutôt que d'affronter le désastre immédiat.",
        moveSan: ["Qxc3"],
      },
      {
        title: "Le sacrifice sicilien classique",
        fen: "2rq1rk1/1b1nbppp/p2p1n2/1p2pP2/4P3/PNNQB3/1PP1B1PP/R4RK1 b - - 0 1",
        text: "Position tirée d'une Sicilienne Najdorf, même si ce schéma peut naître de nombreuses variantes siciliennes. Avec autant de pression sur e4 et le cavalier c3 comme défenseur clé, ce sacrifice de qualité ne devrait surprendre personne ! Noir : 👍 la qualité en moins mais compensée, 👎 down un pion central, 👎 faiblesse potentielle en c2. Blanc : 👍 une qualité d'avance, 👍 une bonne structure de pions. Position plus nuancée que la précédente, mais Noir a une compensation incroyable !",
        moveSan: ["Rxc3", "Qxc3", "Bxe4"],
      },
      {
        title: "Priver l'adversaire même de la paire de fous",
        fen: "2rq1rk1/1b1nbppp/p2p1n2/1p2pP2/4P3/PNNQB3/1PP1B1PP/R4RK1 b - - 0 1",
        text: "Noir trouve le moyen de priver aussi les Blancs de la paire de fous. Après Fg5 et Cc5, toutes les pièces noires sont clairement plus actives que les blanches — la « tour en plus » blanche reste coincée en a1, sans rien faire. Noir est un point de matériel en moins, mais le moteur affiche -1 uniquement grâce à cette compensation positionnelle.",
        moveSan: ["Rxc3", "Qxc3", "Bxe4", "Nd2", "Nd5", "Qb3", "Nxe3", "Qxe3", "Bb7"],
      },
      {
        title: "Exception : quand l'initiative retombe",
        fen: "r4r1k/ppb1qp2/2b1p1pP/7P/3pNP2/3B1R1K/PP3Q2/2R5 w - - 9 27",
        text: "Il existe d'importantes exceptions à retenir : on ne peut pas toujours sacrifier la qualité et espérer gagner tout de suite. Aronian mène ici une attaque féroce contre le roi de Caruana — mais son propre roi subit lui aussi une pression énorme. Il finit par devoir tout jeter dans la bataille pour garder l'initiative... et se retrouve vite à court de pièces à sacrifier. Retiens bien : si tu sacrifies la qualité pour l'initiative, cette initiative doit être RÉELLE — si l'attaque est repoussée, tu te retrouves juste en moins de matériel, pour rien.",
        moveSan: ["Ng5", "e5", "Rxc6", "bxc6", "Nxf7+", "Rxf7", "hxg6", "Rf6", "g7+", "Kg8", "Bc4+", "Kh7", "Qh4", "e4"],
      },
      {
        title: "Exception : la tour domine en finale pure",
        fen: "3r1k2/p4p1p/1pB3p1/2p5/8/3P4/PPPK2PP/8 b - - 0 27",
        text: "Autre position essentielle à connaître : si tu sacrifies la qualité et atterris dans une finale sans plus aucun avantage positionnel, alors la tour domine le fou (ou le cavalier). Dans une finale pure aux colonnes ouvertes, la tour est reine — ne laisse jamais un sacrifice de qualité te conduire jusque-là sans compensation réelle.",
        moveSan: ["Ke7", "Bb5", "f5", "Ke3", "Kf6", "a4", "Ke5", "c3", "a5", "Bc6", "g5", "Kd2", "Rd6"],
      },
      {
        title: "Exercice : Lasker sous-estime la suite",
        fen: "2rq1rk1/1p1bppbp/p2p1np1/4nPP1/3NP3/2N1B2P/PPP1B3/R2Q1RK1 b - - 0 13",
        text: "Emanuel Lasker vient de jouer g5, sous-estimant complètement la réponse de son adversaire. Le cavalier tourne aussitôt vers d5 (et peut-être même f6) — alors pourquoi ne pas prendre un second pion au passage ? Noir n'est même pas en moins de matériel, ET a une structure de pions parfaite.",
        moveSan: ["Rxc3", "bxc3", "Nxe4", "Bd3", "Nxc3"],
      },
    ],
  },
  "mg-cases-claires-et-cases-sombres": {
    steps: [
      {
        title: "Qu'est-ce qu'un complexe de cases faible ?",
        fen: "4k3/1p3p2/2p1p1p1/3p3p/3PP3/2P2P2/1P4PP/4K3 w - - 0 1",
        text: "Dans cette position, tous les pions noirs sont sur cases claires : Noir a donc des cases sombres faibles sur tout l'échiquier. Les Blancs, eux, n'ont pas ce problème puisque leurs pions ne sont pas tous de la même couleur — leur roi a plusieurs chemins d'infiltration faciles.",
      },
      {
        title: "Un complexe faible n'est pas toujours mortel",
        fen: "4k3/1p3p2/2p1p1p1/3p3p/3PP3/2P2P2/1P4PP/4K3 w - - 0 1",
        text: "Sans davantage de pièces sur l'échiquier pour fixer définitivement les pions noirs sur cases sombres et/ou s'infiltrer par les cases affaiblies, un complexe de cases faible n'est pas fatal en soi. En réparant partiellement les cases sombres affaiblies à l'aile roi, Noir empêche le roi blanc de s'infiltrer : la position reste égale. Si la structure de pions n'est pas fixée, le camp au complexe faible a souvent l'occasion de réparer les dégâts lui-même.",
        moveSan: ["Kf2", "Ke7", "Ke3", "g5"],
      },
      {
        title: "Avec quelques pièces, tout devient inconfortable",
        fen: "2b1k3/1p3pn1/2p1p1p1/2Np3p/3PP3/2P2PB1/1P4PP/4K3 w - - 0 1",
        text: "Même position, mais avec quelques pièces mineures en plus — et les cases sombres faibles noires deviennent immédiatement inconfortables. Le fou blanc devient un monstre, s'insinuant à l'aile dame ; le cavalier, posté sur une case sombre puissante, porte loin dans le camp noir.",
        moveSan: ["Be5"],
      },
      {
        title: "Tous les pions noirs, fixés pour toujours",
        fen: "2b1k3/1p3pn1/2p1p1p1/2Np3p/3PP3/2P2PB1/1P4PP/4K3 w - - 0 1",
        text: "Tous les pions noirs sont désormais fixés à jamais sur cases claires. Noir ne peut plus bouger le petit doigt pour reprendre le contrôle des cases sombres.",
        moveSan: ["Be5", "Kf8", "Na4", "Bd7", "Nb6", "Be8", "Bf6"],
      },
      {
        title: "Placer ses pions sur la couleur de son propre fou",
        fen: "2b1k3/1p3pn1/2p1p1p1/2Np3p/3PP3/2P2PB1/1P4PP/4K3 w - - 0 1",
        text: "Les Blancs gagneront le fou en e8, et la partie avec lui. Placer ses pions sur la couleur de son propre fou limite la portée de la pièce, au risque d'en faire un mauvais fou — ici, les deux pièces mineures noires souffrent du même mal.",
        moveSan: ["Be5", "Kf8", "Na4", "Bd7", "Nb6", "Be8", "Bf6", "Kg8", "Kf2", "Kh7", "Ke3", "Kg8", "Kf4", "Kh7", "Ke5", "Kg8", "Kd6"],
      },
      {
        title: "Les pièces majeures aussi s'infiltrent sur les cases faibles",
        fen: "2brk3/1p2qpn1/2p1p1p1/2Np3p/3PP3/2P1QPB1/RP4PP/4K3 w - - 0 1",
        text: "Ajouter des pièces majeures capables elles aussi de s'infiltrer sur les cases sombres affaiblies transforme la tâche défensive noire de l'improbable à l'impossible. Dès que la dame s'infiltre, les cases sombres noires deviennent immédiatement fatales.",
        moveSan: ["Qh6"],
      },
      {
        title: "L'échec et mat comme objectif final",
        fen: "2brk3/1p2qpn1/2p1p1p1/2Np3p/3PP3/2P1QPB1/RP4PP/4K3 w - - 0 1",
        text: "Les Blancs avaient sûrement l'avantage dès le début de ce chapitre, grâce à leur avantage d'espace et à la mobilité de leurs pièces — la suite précise importait donc peu. Plus il y a de pièces capables de s'infiltrer sur un complexe de cases affaibli, plus le déficit de structure devient grave. La tour, elle, contrôle toujours un nombre égal de cases claires et sombres où qu'elle aille : les tours sont, en un sens, « daltoniennes ».",
        moveSan: ["Qh6", "Qf8", "Bc7", "Ke7", "Bxd8+", "Kxd8", "Ra8", "Kc7", "Qf4+", "Qd6", "Rxc8+", "Kxc8", "Qxd6"],
      },
      {
        title: "Affaiblir volontairement son propre roque",
        fen: "3q1rk1/1bpn1ppp/1b1p1n2/1p2pNB1/3PP3/1BP2N1P/1P3PP1/Q3R1K1 b - - 1 20",
        text: "Avec le fou de cases sombres exilé en b6, plus aucun moyen de réparer les faiblesses de cases sombres créées à l'aile roi — f6 et h6 en particulier sont désormais horriblement faibles, et Noir ne pourra plus jamais jouer ...h6 pour défendre la case g5.",
        moveSan: ["g6"],
      },
      {
        title: "L'infiltration sur les cases sombres, encore et encore",
        fen: "3q1rk1/1bpn1ppp/1b1p1n2/1p2pNB1/3PP3/1BP2N1P/1P3PP1/Q3R1K1 b - - 1 20",
        text: "Remarque que le cavalier contrôle la couleur OPPOSÉE à celle sur laquelle il se trouve : replanté en f5 (case claire), il attaque directement toutes les cases sombres fraîchement affaiblies. Noir abandonne : Dh6 puis Dxh7# est imparable. Deux leçons à retenir : n'affaiblis jamais ton roque inutilement quand tu es attaqué — et affaiblir les cases sombres près de ton roi est une des pires concessions qui soit.",
        moveSan: ["g6", "Nh6+", "Kg7", "Qc1", "Qa8", "Bxf6+", "Nxf6", "Nf5+", "gxf5", "Qg5+", "Kh8", "Qxf6+", "Kg8", "Ng5"],
      },
      {
        title: "Sac-sac-mat, façon NoseKnowsAll",
        fen: "1rbqr1k1/3nppbp/2pp1np1/7P/pp1PP1P1/4BPN1/PPPQ4/1K1R1BNR w - - 1 14",
        text: "Une de mes propres parties, avec une attaque façon 150 contre la Dragon sicilienne. Fischer disait : pour battre la Dragon, « joue h4-h5, puis sacrifie-sacrifie-mat ». Étape 1 : éliminer le défenseur clé des cases sombres.",
        moveSan: ["Bh6"],
      },
      {
        title: "Amener plus de troupes à la fête",
        fen: "1r1qrnk1/7p/2pp1n1Q/4pP2/2bPPN2/Pp3P2/1P6/1K1R3R w - - 0 25",
        text: "Avec toutes mes pièces attaquant le roi noir et g7 mortellement faible (et désormais exposé !), j'étais confiant que les Blancs gagnaient sans même avoir besoin de calculer une variante précise au-delà de ce point. Une fin digne du plan : mat avec les deux pièces majeures atterrissant sur les cases sombres qui étaient la cible de toute l'attaque.",
        moveSan: ["Rdg1+", "Ng6", "Rxg6+", "hxg6", "Qxg6+", "Kf8", "Ne6+", "Bxe6", "fxe6", "Rxe6", "Rh8+", "Ke7", "Qg7#"],
      },
      {
        title: "Le complexe de cases faible, source d'idées positionnelles",
        fen: "rnbqk2r/pp4pp/2pbpn2/3p1p2/2PP4/1P3NP1/P3PPBP/RNBQ1RK1 b kq - 0 7",
        text: "Un complexe de cases faible crée aussi des idées positionnelles pures. Dans la hollandaise Stonewall, Noir bâtit une solide forteresse sur les cases claires centrales, au prix d'un fou c8 médiocre et de cases sombres potentiellement faibles. Échanger le principal défenseur des cases sombres noires garantit aux Blancs un bon contrôle des cases affaiblies sur tout l'échiquier — e5, c5 et f4 en particulier tombent bientôt sous leur coupe. Comprendre la structure de pions de tes ouvertures t'aide à identifier précisément quels échanges de pièces te servent ou te desservent !",
        moveSan: ["O-O", "Ba3"],
      },
      {
        title: "Un pion sacrifié pour réparer le centre",
        fen: "r2q1rk1/1p2ppbp/2bp1np1/p7/2PBP3/2N2P2/PP1QB1PP/2R2RK1 b - - 1 13",
        text: "Position tirée de la variante d'accélération Maroczy contre la dragon accélérée : Noir manque d'espace mais dispose d'un bon jeu à l'aile dame et au centre. Le prochain coup noir peut surprendre : Noir a-t-il perdu la tête ? Échanger les fous de cases sombres ne va-t-il pas affaiblir son roque à jamais ? Faux ! Ce coup est parfaitement juste, car les Blancs n'ont aucune pièce capable d'attaquer l'aile roi.",
        moveSan: ["Nd7"],
      },
      {
        title: "Un fromage suisse sur les cases sombres",
        fen: "r2q1rk1/1p2ppbp/2bp1np1/p7/2PBP3/2N2P2/PP1QB1PP/2R2RK1 b - - 1 13",
        text: "Regarde à quel point le fou de cases claires blanc est mauvais, comparé à la force du cavalier noir sur l'avant-poste (de cases sombres !) c5. Le centre de l'échiquier ressemble à un fromage suisse côté cases sombres.",
        moveSan: ["Nd7", "Bxg7", "Kxg7", "Rfd1", "Qb6+", "Qd4+", "Qxd4+", "Rxd4", "Nc5"],
      },
      {
        title: "Carlsen sacrifie du matériel pour les cases sombres",
        fen: "r1bq1r2/pp2p1bk/3p2p1/P2Pnp1p/4P2P/R1N1BP2/1P1QBP2/4K2R b K - 3 16",
        text: "Milieu de partie tendu en Est-indienne, Fedoseev - Carlsen, Coupe du monde 2021. Magnus lance ici un profond sacrifice positionnel pour s'emparer du contrôle des cases sombres pour le reste de la partie — en empêchant f2-f4, il garde tous les pions blancs fixés sur cases claires.",
        moveSan: ["f4"],
      },
      {
        title: "Toutes les pièces blanches, incapables de défendre",
        fen: "r1bq1r2/pp2p1bk/3p2p1/P2Pnp1p/4P2P/R1N1BP2/1P1QBP2/4K2R b K - 3 16",
        text: "Les Blancs sont en moins de dame et de fou tant qu'ils n'ont pas prouvé le contraire — à comparer avec les pièces mineures noires, dominantes sur leurs avant-postes centralisés de cases sombres. La position reste objectivement à peu près égale, mais les Blancs se sont effondrés rapidement face à Carlsen.",
        moveSan: ["f4", "Bxf4", "Bd7", "Nd1", "Rxf4", "Qxf4", "Bh6", "Qg3", "Qf8", "Ne3", "Bf4", "Qg2"],
      },
    ],
  },
  "mg-parle-a-tes-pieces": {
    steps: [
      {
        title: "Un pion n'est pas une pièce",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Avant d'expliquer ce que signifie « parler à ses pièces », mettons-nous d'accord sur ce qu'est une « pièce ». Un pion n'est PAS une pièce — c'est techniquement un pion, que tu peux déplacer sur l'échiquier, mais quand on parle des « pièces », on parle spécifiquement des pièces autres que les pions.",
      },
      {
        title: "Développer une pièce, pas un pion",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Les Blancs jouent bien ici : ils développent une pièce et contrôlent le centre. Erreur typique de débutant ensuite : au lieu de développer une pièce, Noir défend son pion e avec le pion f — certains débutants justifient ce coup par « mais je développais mon pion f ! » FAUX. Un pion ne se développe jamais, seule une pièce se développe.",
        moveSan: ["e4", "e5", "Nf3", "f6"],
      },
      {
        title: "La punition immédiate",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Les Blancs profitent aussitôt des cases claires affaiblies autour du roi noir. Ils ont déjà un pion et la qualité d'avance : la dame blanche ne peut pas être piégée en h8, l'avantage est donc décisif.",
        moveSan: ["e4", "e5", "Nf3", "f6", "Nxe5", "fxe5", "Qh5+", "g6", "Qxe5+", "Qe7", "Qxh8"],
      },
      {
        title: "Quand rien n'est forcé, discute avec tes pièces",
        fen: "rn1q1rk1/pp3ppp/2p2nb1/3p4/3P4/2PB1NB1/PPQ2PPP/R4RK1 w - - 0 1",
        text: "Dans beaucoup de positions, aucun feu d'artifice tactique ne couve. Plutôt que de chercher des coups forcés, il faut jouer des coups sains, positionnels, qui améliorent ta position — et pour cela, parle à tes pièces ! Mets-toi à la place de chacune d'elles. Après avoir parlé à ta tour, vous êtes tombés d'accord : elle préfère la colonne e ouverte plutôt que rester bloquée derrière le pion f2.",
        moveSan: ["Rfe1"],
      },
      {
        title: "Les pions ne sont pas des personnes",
        fen: "r1bqk2r/pp1nbppp/2pp1n2/4p3/P1BPP3/2N2N2/1PP2PPP/R1BQ1RK1 b kq - 0 1",
        text: "Position typique du « Lion noir », vue dans des centaines de parties de maîtres. Voyons ce qui arrive quand deux débutants prennent les commandes : Noir joue un coup horrible, croyant à tort que les pions sont des personnes — il pensait mieux valoir contester le centre avec le pion c que le laisser en c6. Puis c'est au tour des Blancs de commettre une erreur tout aussi affreuse, pensant gagner de l'espace plutôt que d'échanger d4 contre d6. Les deux auraient dû parler à leurs PIÈCES, pas à leurs pions.",
        moveSan: ["c5", "d5"],
      },
      {
        title: "Un long voyage vers la case idéale",
        fen: "r4nk1/p1q1b2p/1pb1p1p1/3pP3/NP1B1Q2/P1PB4/6PP/5RK1 w - - 3 22",
        text: "Si tu parles ici à tes pièces, tu constateras que la plupart sont satisfaites de leur poste : la dame et la tour forment une batterie sur l'unique colonne ouverte, le fou de cases claires vise le roi noir en contrôlant l'aile dame, le fou de cases sombres soutient le pion e5 fort. Seul le cavalier en a4 n'est clairement pas à son aise — b2 n'est certainement pas la case de ses rêves...",
        moveSan: ["Nb2"],
      },
      {
        title: "Le cavalier trouve enfin sa case de rêve",
        fen: "r4nk1/p1q1b2p/1pb1p1p1/3pP3/NP1B1Q2/P1PB4/6PP/5RK1 w - - 3 22",
        text: "Exactement ! g4 est la case idéale pour ce cavalier. De là, il peut bondir en f6 (libérant le pion et donc le fou de cases sombres) ou en h6 (créant peut-être des filets de mat autour du roi noir) au moment le plus gênant pour la défense. Toutes les pièces blanches sont désormais satisfaites.",
        moveSan: ["Nb2", "Be8", "Nd1", "Qd8", "Ne3", "Bc6", "Ng4"],
      },
      {
        title: "Le rebond du mauvais fou",
        fen: "3r4/1kr1bp1p/3p1p2/p1qPpP2/1p6/1P3QP1/P1PRN2P/1K2R3 b - - 0 29",
        text: "Jan Timman se retrouve dans une position Richter-Rauzer qui a mal tourné pour les Blancs. Bien sûr, le fou en e7 rêvait de mieux que de fixer le dos de ses propres pions : le fou jusque-là endormi rebondit d'abord contre la dernière rangée, avant de rejoindre l'action sur une diagonale bien plus importante — le GM Daniel King a baptisé cette manœuvre « le rebond du mauvais fou ».",
        moveSan: ["Bf8", "Nc1", "Bh6"],
      },
      {
        title: "Une interférence qui décide la partie",
        fen: "3r4/1kr1bp1p/3p1p2/p1qPpP2/1p6/1P3QP1/P1PRN2P/1K2R3 b - - 0 29",
        text: "Quelle différence deux coups peuvent faire ! Le fou respire désormais le feu le long de la diagonale h6-c1, en direction du roi blanc. Aucun « mauvais » fou ne pourrait espérer mieux. Un joli coup d'interférence décide la partie : les Blancs ne peuvent sauver à la fois le pion c2 et la tour e1 — plutôt que de prolonger une partie perdue d'au moins une qualité, ils abandonnent.",
        moveSan: ["Bf8", "Nc1", "Bh6", "Nd3", "Qc3", "Rde2", "Bd2"],
      },
      {
        title: "Kasparov coordonne toute son armée",
        fen: "r2qrbk1/1b1n1pp1/p2p3p/1ppP4/Pn2P3/5N1P/1P1N1PP1/RBBQR1K1 w - - 1 17",
        text: "Installe-toi confortablement pour admirer Kasparov coordonner magnifiquement toute son armée, dans cette célèbre partie du championnat du monde 1990 contre Karpov. Les fous et la dame n'allaient jamais pouvoir dégager la dernière rangée pour « finir le développement » — Garry trouve donc un moyen inventif de doubler les tours sans développer les pièces de l'aile dame : la 3e rangée, bien dégagée !",
        moveSan: ["Ra3"],
      },
      {
        title: "Une discussion prophylactique avec ses pièces",
        fen: "r2qrbk1/1b1n1pp1/p2p3p/1ppP4/Pn2P3/5N1P/1P1N1PP1/RBBQR1K1 w - - 1 17",
        text: "Tout l'intérêt de ce coup mystérieux : donner à la tour blanche l'accès à la case g3, au cas où le cavalier noir l'attaquerait. Un exemple parfait de discussion avec ses pièces pour trouver une bonne idée prophylactique.",
        moveSan: ["Ra3", "f5", "Rae3", "Nf6", "Nh2"],
      },
      {
        title: "Chaque pièce blanche prête à l'assaut",
        fen: "r2qrbk1/1b1n1pp1/p2p3p/1ppP4/Pn2P3/5N1P/1P1N1PP1/RBBQR1K1 w - - 1 17",
        text: "Karpov est certes un pion devant à ce stade, mais en échange, chaque pièce blanche a accumulé un potentiel d'attaque à l'aile roi. Remarque la puissance des deux fous, balayant tout l'échiquier, et la dame prête à bondir en h5 à tout moment.",
        moveSan: ["Ra3", "f5", "Rae3", "Nf6", "Nh2", "Kh8", "b3", "bxa4", "bxa4", "c4", "Bb2", "fxe4", "Nxe4", "Nfxd5", "Rg3"],
      },
      {
        title: "Attention : parler à ses pièces ne suffit pas",
        fen: "r1b2rk1/pp1pq2p/2n1pnp1/6N1/4B2Q/2P5/PP1N1PPP/R3R1K1 b - - 4 16",
        text: "Une mise en garde pour finir : parler à ses pièces est une excellente façon de trouver un plan ou d'améliorer sa position — mais il reste indispensable de calculer les coups forcés pour vérifier que l'idée fonctionne vraiment ! Dans une position difficile, ce coup de roi nonchalant visait à réparer les cases sombres de l'aile roi avec ...h6 — mon roi est certes plus heureux en g7, mais je n'ai pas pris la peine de calculer les suites concrètes.",
        moveSan: ["Kg7"],
      },
      {
        title: "Toujours envisager les coups forcés",
        fen: "r1b2rk1/pp1pq2p/2n1pnp1/6N1/4B2Q/2P5/PP1N1PPP/R3R1K1 b - - 4 16",
        text: "Les Blancs ont un pion d'avance et un bon cavalier contre mon mauvais fou. Étonnamment, j'ai réussi à arracher la nulle depuis cette position horrible : toujours envisager les coups forcés ! Trouver un coup ou une idée désirable positionnellement ne suffit jamais — il faut aussi vérifier qu'aucune tactique adverse ne le réfute.",
        moveSan: ["Kg7", "Bxc6", "bxc6", "Nxh7", "Rh8", "Qxf6+", "Qxf6", "Nxf6", "Kxf6"],
      },
      {
        title: "Karpov, prophylaxie magistrale",
        fen: "r1rq1bk1/1n1b1p1p/3p1np1/1p1Pp3/1Pp1P3/2P1BNNP/R2Q1PP1/1B2R1K1 w - - 0 1",
        text: "Place maintenant à une masterclass de Karpov sur l'art de parler à ses pièces. Prophylaxie stupéfiante : les tours noires sont temporairement déconnectées sur la colonne a, si bien que Noir n'a aucun moyen d'échanger des pièces pour desserrer l'étau sur sa dernière rangée. Remarque à quel point les pièces majeures et le cavalier en b7 sont malheureux, maintenant que Noir n'a pas obtenu ce qu'il visait.",
        moveSan: ["Ba7"],
      },
      {
        title: "Enfin de l'activité pour le fou enterré",
        fen: "r1rnb1k1/B1n1q1bp/3p1p2/1p1PpPp1/1Pp1P3/2P4P/R2QN1PN/RB4K1 w - - 0 9",
        text: "De l'activité, enfin ! Remarque comme le fou de cases claires blanc est heureux de s'échanger contre son homologue noir : le sien était un mauvais fou coincé derrière sa chaîne de pions depuis toujours, alors que le fou noir est un défenseur clé des cases claires affaiblies par la structure de pions noire.",
        moveSan: ["Bc2", "Bf7", "Ng3", "Nb7", "Bd1", "h6", "Bh5"],
      },
      {
        title: "Un final digne d'un tableau",
        fen: "1r1n1k2/2r2qb1/3p1pQp/1p1PpPpN/1Pp1P3/R1P1N2P/R5P1/6K1 w - - 0 24",
        text: "Un final digne d'un tableau. Les Blancs ont amené chaque pièce à son maximum, et la position est en réalité un zugzwang complet : essaie de bouger la moindre pièce noire sans perdre de matériel !",
        moveSan: ["Ra8", "Rcc8", "R2a7", "Nb7", "Rxb8", "Rxb8", "Ng4"],
      },
    ],
  },
  "mg-les-pions-ne-sont-pas-des-personnes": {
    steps: [
      {
        title: "Les désirs des pièces avant la structure de pions",
        fen: "4r1k1/3n1pb1/bq1p2p1/2pP2Pp/1r2PP2/2N3QP/1P3RK1/1BB1R3 w - - 19 37",
        text: "« Les pions ne sont pas des personnes ! » Cette formule rappelle simplement de faire passer les envies et les besoins de tes pièces AVANT tout souci de structure de pions ou de gain de matériel. Position tendue de Bénoni : les Blancs veulent submerger le centre et l'aile roi, les Noirs progressent à l'aile dame.",
      },
      {
        title: "Une rupture impossible... si les pions étaient des personnes",
        fen: "4r1k1/3n1pb1/bq1p2p1/2pP2Pp/1r2PP2/2N3QP/1P3RK1/1BB1R3 w - - 19 37",
        text: "Cette rupture thématique de la Bénoni semble impossible à première vue, puisque Noir défend e5 plus de fois que les Blancs ne l'attaquent. Mais elle n'est impossible que si tu regardes la position avec des lunettes « les pions sont des personnes », qui t'interdisent de donner un pion en apparence gratuitement.",
        moveSan: ["e5"],
      },
      {
        title: "Le vrai but derrière le sacrifice",
        fen: "4r1k1/3n1pb1/bq1p2p1/2pP2Pp/1r2PP2/2N3QP/1P3RK1/1BB1R3 w - - 19 37",
        text: "Le vrai but du jeu blanc : les Blancs voulaient jouer la rupture f5, mais avaient d'abord besoin de libérer la case e4 pour leur cavalier et leur fou, et d'entrouvrir la colonne e pour leur tour. Le pion en e4 trahissait en réalité trois pièces blanches à la fois !",
        moveSan: ["e5", "dxe5", "f5"],
      },
      {
        title: "Rendre aussitôt le pion pour libérer ses pièces",
        fen: "4r1k1/3n1pb1/bq1p2p1/2pP2Pp/1r2PP2/2N3QP/1P3RK1/1BB1R3 w - - 19 37",
        text: "Au tour de Noir de montrer qu'il comprend, lui aussi, que les pions ne sont pas des personnes ! Si le pion supplémentaire reste en e5, le cavalier noir, le fou de cases sombres en g7 et la tour e8 sont tous moins bien placés. Il est crucial de rendre aussitôt ce pion pour libérer toutes les pièces noires.",
        moveSan: ["e5", "dxe5", "f5", "e4"],
      },
      {
        title: "Sacrifier un pion uniquement pour activer ses pièces",
        fen: "4r1k1/3n1pb1/bq1p2p1/2pP2Pp/1r2PP2/2N3QP/1P3RK1/1BB1R3 w - - 19 37",
        text: "Les deux joueurs ont donné un pion dans le seul but d'activer leurs pièces. « Les pions ne sont pas des personnes » s'applique à l'ouverture, au milieu de partie et à la finale — mais c'est surtout vrai quand le temps compte sur l'échiquier. Ne sacrifie jamais un avantage statique sans obtenir, en échange, un vrai avantage dynamique.",
        moveSan: ["e5", "dxe5", "f5", "e4", "Nxe4"],
      },
      {
        title: "Un pion sacrifié pour tout faire exploser au centre",
        fen: "5r1r/p2knpp1/qp2p2p/2ppP2P/P1nP4/2P2R2/2P1NPP1/R1BQ2K1 w - - 13 20",
        text: "Structure française Winawer typique, centre verrouillé : les pièces blanches (surtout les tours) sont plus actives que les noires, et le roi noir en d7 pourrait bientôt subir un feu nourri si le centre s'ouvre. Coup magnifique dans l'esprit « les pions ne sont pas des personnes » : quelle que soit la façon dont la tension se résout, des lignes vont s'ouvrir à l'avantage des pièces blanches — le pion a lui-même est entièrement sacrifiable.",
        moveSan: ["a5"],
      },
      {
        title: "Une explosion qui ne se soucie pas de la structure",
        fen: "5r1r/p2knpp1/qp2p2p/2ppP2P/P1nP4/2P2R2/2P1NPP1/R1BQ2K1 w - - 13 20",
        text: "c4 est explosif ! Encore un coup « les pions ne sont pas des personnes » qui déchire la position au profit de toutes les pièces blanches. La tour en f3, jusque-là limitée à attaquer f7, gagne accès à toute la 3e rangée. Peu importe que la structure de pions blanche devienne un vrai chantier — ce qui compte, c'est que les pièces blanches reprennent vie.",
        moveSan: ["a5", "Nxa5", "dxc5", "bxc5", "c4"],
      },
      {
        title: "L'activité des pièces compense une mauvaise structure",
        fen: "5r1r/p2knpp1/qp2p2p/2ppP2P/P1nP4/2P2R2/2P1NPP1/R1BQ2K1 w - - 13 20",
        text: "Le cavalier noir en a5 tombe, et la partie avec lui. La structure de pions est souvent surestimée : le plus souvent, l'activité des pièces compense largement une mauvaise structure.",
        moveSan: ["a5", "Nxa5", "dxc5", "bxc5", "c4", "d4", "Rfa3", "Nec6", "Bd2"],
      },
      {
        title: "Le matérialisme, à l'épreuve de la finale",
        fen: "5rk1/ppR3pp/4p3/3pPp2/1P1P4/Pr4PP/7K/5R2 w - - 0 1",
        text: "Voyons maintenant les conséquences de « les pions ne sont pas des personnes » en finale — cette fois à l'épreuve du matérialisme pur. Les Blancs doivent choisir : capturer le pion gratuit en b7, ou jouer autre chose ? Bien sûr, mieux vaut dominer totalement la colonne ouverte plutôt que commencer à grappiller des pions.",
        moveSan: ["Rfc1"],
      },
      {
        title: "Doubler sur la 7e rangée, pas grappiller",
        fen: "5rk1/ppR3pp/4p3/3pPp2/1P1P4/Pr4PP/7K/5R2 w - - 0 1",
        text: "Ce coup n'a rien à voir avec le grappillage de pions. Il s'agit de doubler les tours sur la 7e rangée — l'activité des pièces reste reine.",
        moveSan: ["Rfc1", "Rxa3", "Rxb7"],
      },
      {
        title: "Un finale de tours tenu de justesse",
        fen: "5rk1/ppR3pp/4p3/3pPp2/1P1P4/Pr4PP/7K/5R2 w - - 0 1",
        text: "Coûte que coûte, Noir a activé sa dernière tour et parvient tout juste à faire assez pour la nulle. Menacé de mat par ...Rc2+, les Blancs doivent se rabattre sur une finale de tours nulle.",
        moveSan: ["Rfc1", "Rxa3", "Rxb7", "Rd3", "Rcc7", "Kh8", "Rxg7", "Rc8", "Rxh7+", "Kg8", "Rbg7+", "Kf8"],
      },
      {
        title: "Capablanca : fais monter ton roi en finale",
        fen: "5k2/p1p4R/1pr5/3p1pP1/P2P1P2/2P2K2/8/8 w - - 0 35",
        text: "Fais monter ton roi en finale ! Cela vaut parfois même un pion ou deux, rien que pour mettre au travail cette pièce cruciale de finale à son plein potentiel.",
        moveSan: ["Kg3"],
      },
      {
        title: "Deux pions de moins, mais aucune inquiétude",
        fen: "5k2/p1p4R/1pr5/3p1pP1/P2P1P2/2P2K2/8/8 w - - 0 35",
        text: "Capablanca est désormais deux pions derrière, mais cela ne l'inquiète pas — les pions ne sont pas des personnes ! Son roi utilise le pion f5 comme un bouclier contre la tour noire sur la colonne f : à l'abri de tout échec, menaçant le mat, avec le pion g6 terrifiant et la pièce la plus active de tout l'échiquier.",
        moveSan: ["Kg3", "Rxc3+", "Kh4", "Rf3", "g6", "Rxf4+", "Kg5", "Re4", "Kf6"],
      },
      {
        title: "Contre-exemple : un sacrifice qui échoue",
        fen: "1rbq1rk1/p1p1bppp/4p3/8/QnpP4/2N3P1/PP2PPBP/R1B2RK1 b - - 6 12",
        text: "Il est tout aussi important de savoir QUAND une règle est vraie que quand elle ne l'est pas. Sacrifier un pion pour l'activité est en général juste dans une position dynamique — encore faut-il obtenir, en échange, quelque chose de réellement dynamique. Dans cette partie, NoseKnowsAll sacrifie (à tort) le pion a pour activer toutes ses pièces, croyant piéger la dame en Sibérie — mais l'adversaire montre l'erreur : la dame en a7 est en fait bien placée.",
        moveSan: ["Bd7", "Qxa7", "Rb6"],
      },
      {
        title: "Une qualité de plus, pour rien",
        fen: "1rbq1rk1/p1p1bppp/4p3/8/QnpP4/2N3P1/PP2PPBP/R1B2RK1 b - - 6 12",
        text: "Les Blancs ont bien trop de matériel pour cette dame — la partie aurait sans doute été convertie sans les erreurs commises plus tard, sous la pression du temps. Une leçon d'humilité : sans vraie compensation dynamique, sacrifier un pion pour « l'activité » n'est parfois qu'un pion perdu pour rien.",
        moveSan: ["Bd7", "Qxa7", "Rb6", "Bf4", "Bd6", "Qxb6", "cxb6", "Bxd6", "Nc6", "Bxf8", "Qxf8"],
      },
      {
        title: "Carlsen : quand les pions SONT des personnes",
        fen: "2q3k1/2pbbn2/1p1p1n2/1N1Pp1p1/1PP1PpP1/2NQ1P2/6B1/1KB5 b - - 0 34",
        text: "Encore une exception à la règle : ici, Magnus Carlsen sort une séquence spectaculaire en défendant exactement l'argument inverse — que les pions SONT des personnes ! Son idée : deux pions passés liés sur les colonnes f et g contrôlent tant d'espace, et sont si proches de promouvoir, qu'ils valent en réalité une pièce entière.",
        moveSan: ["Nxg4", "fxg4", "Bxg4"],
      },
      {
        title: "Un phalange de pions qui vaut une pièce",
        fen: "2q3k1/2pbbn2/1p1p1n2/1N1Pp1p1/1PP1PpP1/2NQ1P2/6B1/1KB5 b - - 0 34",
        text: "Le problème pour les Blancs : le pion g passé noir est bien plus fort que leur pion e arriéré, et chaque pièce noire est plus active que son homologue blanche. Un phalange de pions qui approche de la 8e rangée peut parfois valoir une pièce entière — si tu te retrouves dans une telle position, les pions redeviennent alors, exceptionnellement, des personnes.",
        moveSan: ["Nxg4", "fxg4", "Bxg4", "Bf3", "Bh3", "Bh5", "g4", "Ne2", "Bf1", "Qd1", "Bg2", "Bg6", "Ng5", "Nbc3", "Bf3", "Qf1", "Kg7", "Bf5", "Qh8", "Nxf4", "exf4", "Bxf4", "Bf6"],
      },
    ],
  },
  "eg-mats-de-force-ecrasante": {
    steps: [
      {
        title: "L'escalier : deux pièces lourdes contre un roi",
        fen: "8/8/3k4/8/8/3K4/5Q2/6R1 w - - 0 1",
        text: "Avec deux pièces lourdes (dame et tour, ou deux tours) contre un roi seul, la méthode la plus simple est l'« escalier » : chaque pièce coupe le roi une rangée après l'autre, jusqu'à le pousser au bord de l'échiquier. Ici 1.Df5! empêche le roi noir de revenir sur la 5e rangée ; la tour prend ensuite le relais avec échec sur la 6e, puis la dame revient couper la 7e — le roi est mené marche par marche jusqu'à la dernière rangée, où 4.Tg8 mate. Le même principe fonctionne avec deux tours ou deux dames.",
        moveSan: ["Qf5", "Kc6", "Rg6+", "Kc7", "Qf7+", "Kd8", "Rg8#"],
        highlights: [{ square: "f5", color: "green" }],
        arrows: [
          { from: "f2", to: "f5", color: "green" },
          { from: "f5", to: "a5", color: "green" },
          { from: "f5", to: "h5", color: "green" },
        ],
      },
      {
        title: "Deux tours : la même idée, en pratique",
        fen: "8/8/8/8/8/4k3/6R1/6RK w - - 0 1",
        text: "Le même mat à l'escalier, cette fois avec deux tours : gardez-les toujours aussi loin que possible du roi adverse pendant qu'elles se relaient pour lui retirer une colonne, puis une rangée. Ce n'est pas la voie la plus rapide vers le mat, mais la plus simple à retenir : 1.Te1+! interdit d'emblée la colonne e, puis chaque tour, l'une après l'autre, chasse le roi noir vers le bord jusqu'au mat final.",
        moveSan: ["Re1+", "Kd3", "Rg8", "Kd2", "Re7", "Kd3"],
      },
      {
        title: "Mat à la dame seule",
        fen: "8/8/8/3k4/8/8/8/6QK w - - 0 1",
        text: "Seule contre un roi, la dame peut l'enfermer toute seule en se plaçant comme si elle était un cavalier à distance de mat : 1.Qe3! Kc4 2.Qd2! Kc5 3.Qd3! Kc6 4.Qd4! — à chaque coup, elle restreint un peu plus la boîte. Attention au piège classique : resserrer l'étau une case de trop mène au pat, pas au mat. Une fois le roi acculé sur le bord, c'est votre propre roi qu'il faut amener pour porter le coup de grâce.",
        moveSan: ["Qe3", "Kc4", "Qd2", "Kc5", "Qd3", "Kc6", "Qd4"],
      },
      {
        title: "Mat à la tour seule",
        fen: "8/8/2k5/8/8/5R2/6K1/8 w - - 0 1",
        text: "Avec la tour, la méthode est différente : elle seule referme la boîte en tenant une rangée ou une colonne à distance du roi adverse, pendant que votre roi s'avance faire tout le travail de rapprochement. 1.Tf5! Kd6 2.Rf3! Kc6 3.Re4! — la tour retire une ligne au roi noir, puis c'est au tour du roi blanc de s'approcher, jusqu'à ce que le roi noir soit en zugzwang et forcé de reculer jusqu'au mat.",
        moveSan: ["Rf5", "Kd6", "Kf3", "Kc6", "Ke4", "Kd6", "Rh5"],
      },
      {
        title: "La dame bat le fou",
        fen: "8/8/3b4/6k1/8/8/2K5/Q7 w - - 0 1",
        text: "Une dame seule bat toujours un fou seul, mais il faut la même méthode patiente qu'un mat à la dame : couper le roi, réduire l'espace, puis mater à l'aide du roi. Le fou ne peut qu'observer : 1.Qf1! Be5 2.Kd3! Kg6 3.Ke4! — le roi blanc s'avance pendant que la dame contrôle les diagonales, jusqu'au mat final.",
        moveSan: ["Qf1", "Be5", "Kd3", "Kg6", "Ke4"],
      },
      {
        title: "Fou et cavalier : la manœuvre en W",
        fen: "7k/8/8/8/8/8/8/3NKB2 w - - 0 1",
        text: "Le mat du fou et du cavalier est réputé le plus dur des mats de base : il faut piéger le roi adverse dans LE bon coin, celui de la couleur de votre fou (ici les cases claires, donc h8) — le pousser vers l'autre coin ne mène à rien. La méthode classique s'appelle la « manœuvre en W » : cavalier et roi avancent en zigzag pour repousser méthodiquement le roi adverse, pendant que le fou verrouille une diagonale à la fois. Ici le roi noir part déjà du bon côté : 1.Re2! Rg7 2.Re3! Rf6 3.Rf4! Rg6 4.Ce3! — toute la suite, jusqu'au mat final Cb7#, est un exemple réel et intégral de cette manœuvre.",
        moveSan: ["Ke2", "Kg7", "Ke3", "Kf6", "Kf4", "Kg6", "Ne3", "Kf6"],
      },
    ],
  },
  "eg-face-au-roi-seul": {
    steps: [
      {
        title: "Dame et roi contre roi seul",
        fen: "8/8/8/8/3k4/8/8/2QK4 w - - 0 1",
        text: "Le mat au roi et à la dame contre un roi seul est le plus simple de tous : imaginez la dame comme un cavalier géant qui donne échec à distance et grignote une rangée ou une colonne à chaque coup, jusqu'à repousser le roi adverse au bord de l'échiquier. 1.Dc2! Rd5 2.Dc3! Re4 3.Dd2! Re5 — la dame reste toujours à distance de cavalier du roi noir pour ne jamais lui laisser de repos. Une fois le roi acculé sur la dernière rangée, résistez à la tentation de resserrer encore l'étau : ce serait le pat. Amenez plutôt votre propre roi, et matez avec la dame juste à côté du vôtre.",
        moveSan: ["Qc2", "Kd5", "Qc3", "Ke4", "Qd2", "Ke5"],
      },
      {
        title: "Tour et roi contre roi seul",
        fen: "8/8/8/8/8/3k4/8/2RK4 w - - 0 1",
        text: "Avec la tour, la méthode est différente : elle seule referme la boîte en tenant une rangée ou une colonne à distance du roi adverse, pendant que votre roi s'avance faire tout le travail de rapprochement. 1.Tc2! Re3 2.Td2! Re4 3.Re2! — la tour retire une ligne au roi noir, puis c'est au tour du roi blanc de s'approcher. Une fois que la tour ne peut plus resserrer l'étau sans se faire attaquer, jouez un coup d'attente qui la garde protégée, jusqu'à ce que le roi noir soit forcé de reculer jusqu'au mat.",
        moveSan: ["Rc2", "Ke3", "Rd2", "Ke4", "Ke2", "Kf4"],
      },
      {
        title: "Deux fous contre roi seul",
        fen: "8/8/8/8/4k3/8/8/3BBK2 w - - 0 1",
        text: "Deux fous de cases de couleurs différentes matent un roi seul dans n'importe quel coin — contrairement au fou et au cavalier. Le duo avance en cage : les deux fous se soutiennent l'un l'autre sur des diagonales adjacentes pour grignoter l'espace du roi noir, avec l'aide du roi blanc dès que les fous ne peuvent plus avancer seuls. 1.Fd2! Rd4 2.Fc2! Rc4 3.Re2! — la cage se resserre jusqu'à ce que le roi noir soit poussé sur la dernière rangée, où l'opposition du roi blanc puis un dernier coup de fou délivrent le mat.",
        moveSan: ["Bd2", "Kd4", "Bc2", "Kc4", "Ke2", "Kd4"],
      },
      {
        title: "Fou et cavalier : le mat le plus dur",
        fen: "4k3/8/8/8/8/8/3B4/4KN2 w - - 0 1",
        text: "Le mat du fou et du cavalier est le plus difficile des quatre mats de base — jusqu'à 33 coups sont parfois nécessaires, et il faut connaître une règle précise : le roi adverse ne peut être maté QUE dans le coin de la couleur de votre fou (ici les cases claires : h8 ou a1), jamais dans l'autre coin. La technique de référence, la « manœuvre en W », consiste à faire avancer le cavalier et le roi en zigzag pour repousser méthodiquement le roi adverse vers le bon coin, pendant que le fou verrouille une diagonale à la fois. Dès que le roi tombe dans le mauvais coin, il faut le repousser patiemment vers l'autre — c'est précisément ce que montre cette partie, jusqu'au mat Fg7#.",
        moveSan: ["Ke2", "Kd7", "Kd3", "Kd6", "Kd4", "Kc6"],
      },
      {
        title: "Deux cavaliers ne matent pas",
        fen: "7k/8/4N1K1/5N2/8/8/8/8 w - - 0 1",
        text: "Deux cavaliers ne peuvent PAS forcer le mat contre un roi seul qui se défend bien — si vous obtenez cette position en partie, c'est une nulle automatique. Le mat n'arrive que si l'adversaire se trompe : ici, après l'erreur noire ...Rh8??, 1.Cf6! suivi de 2.Cf7 mate. Retenez surtout la leçon inverse : ne comptez jamais sur deux cavaliers seuls pour gagner une finale, ce matériel ne suffit pas à forcer quoi que ce soit.",
        moveSan: ["Nf8", "Kg8", "Nd7", "Kh8", "Nd6", "Kg8", "Nf6+", "Kh8", "Nf7#"],
      },
      {
        title: "La règle du carré",
        fen: "8/8/8/8/8/P5k1/8/7K w - - 0 1",
        text: "La « règle du carré » permet de savoir en un coup d'œil si un roi peut rattraper un pion adverse sans calculer une seule variante : trace un carré dont un côté va du pion jusqu'à sa case de promotion — si le roi adverse est DANS ce carré (ou peut y entrer immédiatement au trait), il rattrape le pion ; sinon, c'est trop tard. Ici, trait aux Blancs : le roi noir est hors du carré du pion a, et 1.a4! Rf4 2.a5! Re5 3.a6! Rd6 4.a7! Rc7 5.a8=D promeut avant que le roi n'ait pu revenir.",
        moveSan: ["a4", "Kf4", "a5", "Ke5", "a6", "Kd6", "a7", "Kc7", "a8=Q"],
      },
      {
        title: "L'opposition et les cases clés",
        fen: "8/4k3/8/8/3KP3/8/8/8 w - - 0 1",
        text: "L'opposition, c'est deux rois face à face avec une case (ou trois, ou même en diagonale) qui les sépare : si c'est à l'ADVERSAIRE de jouer dans cette position, il doit reculer — c'est vous qui « avez » l'opposition. Pour gagner une finale de roi et pion, il faut amener son roi devant son propre pion et y contrôler les « cases clés » (ici d6/e6/f6, à une rangée du pion) AVEC l'opposition : 1.Re5! Rd7 2.Rf6! Re8 3.e5! Rf8 4.e6! — le roi blanc garde toujours l'opposition, ce qui force le roi noir à céder du terrain jusqu'à la promotion. Sans l'opposition au bon moment, la même position ne serait que nulle.",
        moveSan: ["Ke5", "Kd7", "Kf6", "Ke8", "e5", "Kf8", "e6"],
        highlights: [
          { square: "d6", color: "green" },
          { square: "e6", color: "green" },
          { square: "f6", color: "green" },
        ],
      },
      {
        title: "La triangulation : perdre un temps exprès",
        fen: "2k5/8/p1P5/P2K4/8/8/8/8 w - - 1 2",
        text: "Parfois vous êtes déjà en position gagnante... sauf que c'est à VOUS de jouer, alors que la même position serait gagnante au trait adverse. La « triangulation » consiste à faire un détour avec le roi — trois cases qui forment un triangle — pour revenir exactement à la même position, mais en ayant « perdu un temps » : c'est alors à l'adversaire de bouger. Ici 1.Rd4! Rd8 2.Rc4! Rc8 3.Rd5! Rd8 4.Rd6! — après ce détour, on retombe sur la position de départ, mais cette fois c'est Noir qui doit céder du terrain.",
        moveSan: ["Kd4", "Kd8", "Kc4", "Kc8", "Kd5", "Kd8", "Kd6"],
      },
    ],
  },
  "eg-finales-de-pions-le-duel-des-rois": {
    steps: [
      {
        title: "Roi et pion : la nulle par l'opposition",
        fen: "8/8/5k2/8/8/8/5P2/5K2 w - - 0 1",
        text: "La finale la plus fondamentale : roi et pion contre roi seul. Ici, le trait n'a AUCUNE importance — la position est nulle quel que soit qui doit jouer, car le roi noir contrôle déjà les cases clés devant le pion. Retenez la règle de survie si vous défendez une telle position : dès que le pion avance, allez TOUJOURS dans sa direction avec votre roi, jamais à l'opposé — c'est exactement ce que fait Noir ici, coup après coup, pour tenir la nulle jusqu'au bout.",
        moveSan: ["Kg2", "Kg6", "Kg3", "Kg5", "Kf3", "Kf5", "Ke3", "Ke5"],
        highlights: [
          { square: "e4", color: "green" },
          { square: "f4", color: "green" },
          { square: "g4", color: "green" },
        ],
      },
      {
        title: "Même colonne, mais un rang plus haut : le gain",
        fen: "4k3/8/4p3/4P3/8/3K4/8/8 w - - 0 1",
        text: "Même position en apparence que la précédente — pions sur la même colonne — mais avec une différence capitale : ici, quand le roi blanc prend le pion noir, c'est déjà à la 6e rangée, donc le gain est garanti. Le seul coup gagnant est de partir chercher l'opposition sur le côté et de s'infiltrer dans le camp noir : 1.Rc4! Rd7 2.Rb5! Rc7 3.Rc5! Rd7 4.Rb6! — le roi blanc contourne, prend l'opposition diagonale puis normale, et s'invite dans le camp adverse jusqu'à croquer le pion en toute sécurité.",
        moveSan: ["Kc4", "Kd7", "Kb5", "Kc7", "Kc5", "Kd7", "Kb6"],
      },
      {
        title: "La course des pions... avec un piège",
        fen: "8/6p1/7k/8/1K6/8/1P6/8 w - - 0 1",
        text: "Les deux pions semblent promouvoir en même temps — une nulle logique. Mais c'est faux : le pion blanc promeut AVEC ÉCHEC, ce qui change tout. Le coup gagnant est étonnant : 1.Rc5! — le roi blanc rentre directement dans le carré de son PROPRE pion b, sans se soucier un instant du pion noir. Peu importe que le roi noir se rapproche du pion blanc : celui-ci promeut à temps, avec échec, ce qui laisse toujours le temps de revenir stopper le pion noir avant qu'il ne promeuve à son tour.",
        moveSan: ["Kc5", "Kg6", "b4", "Kf7", "b5", "Ke7", "Kc6"],
      },
      {
        title: "Le pion isolé : ne le poussez pas trop tôt",
        fen: "8/8/8/k1p5/2P5/1K6/P7/8 w - - 0 1",
        text: "Un pion isolé et passé (ici le pion a2) donne un avantage, mais il ne faut surtout pas se précipiter : le pousser trop tôt fermerait la porte au roi. La technique consiste à utiliser ce pion comme réserve de « coups de tempo » pendant que le roi va chercher une autre entrée dans le camp adverse, à l'opposé : 1.Ra3! Rb6 2.Rb2! Ra5 3.Rb3! Rb6 4.Rc3! — le roi blanc manœuvre patiemment vers l'aile roi, forçant le roi noir à faire des allers-retours, jusqu'à percer et gagner le pion c5.",
        moveSan: ["Ka3", "Kb6", "Kb2", "Ka5", "Kb3", "Kb6", "Kc3"],
      },
      {
        title: "Le pion de réserve qui sauve tout",
        fen: "8/5p2/5P2/3k4/5K2/5P2/8/8 w - - 0 1",
        text: "Le roi noir est plus actif, mais Blanc possède une ressource décisive : un pion f3 de réserve, qui sert de coup d'attente providentiel. Se précipiter avec 1.Rg5? perd le pion f6 après ...Re5! — il faut d'abord gagner un temps avec 1.Rf5! Rd6 2.f4! Rd5 3.Rg4! — désormais le roi blanc peut aller chercher le pion f7 sans jamais craindre de perdre l'opposition, précisément grâce au coup de réserve joué au bon moment.",
        moveSan: ["Kf5", "Kd6", "f4", "Kd5", "Kg4", "Kd6", "Kh5"],
      },
      {
        title: "Pions connectés bloqués : la défense par l'opposition",
        fen: "8/8/8/5k2/6pP/6P1/5K2/8 w - - 0 1",
        text: "Deux pions passés et connectés, bloqués l'un devant l'autre : la position semble perdue pour Noir, mais elle tient nulle avec une défense précise. Noir doit garder l'opposition — normale, ou à défaut diagonale, ou à défaut distante — à chaque instant, en restant toujours dans le carré du pion h. 1.Re3! Re5 2.Rd3! Rd5 3.Rc3! Re5! (l'opposition diagonale sauve la mise) 4.Rc4! Re4! — Noir jongle entre les trois types d'opposition sans jamais lâcher prise, et tient la nulle jusqu'au bout.",
        moveSan: ["Ke3", "Ke5", "Kd3", "Kd5", "Kc3", "Ke5", "Kc4", "Ke4"],
      },
      {
        title: "Pions connectés : le roi passe de l'autre côté",
        fen: "8/8/5pk1/8/4PPK1/8/8/8 w - - 0 1",
        text: "Deux pions connectés valent bien plus que la somme de leurs cases : ils se couvrent l'un l'autre. La bonne idée est d'amener le roi de l'AUTRE côté, là où il y a le plus d'espace, plutôt que de pousser les pions tout de suite : 1.Rf3! Rf7 2.Re3! Re6 3.Rd4! Rd6 4.f5! — dès que le roi noir doit céder l'opposition, un des deux pions se sacrifie au bon moment pour ouvrir la voie à l'autre, qui promeut. Règle générale à retenir : avancez toujours votre roi et soutenez vos pions — c'est la pièce la plus précieuse de la finale.",
        moveSan: ["Kf3", "Kf7", "Ke3", "Ke6", "Kd4", "Kd6", "f5"],
      },
      {
        title: "Deux pions contre un roi : le sacrifice qui gagne",
        fen: "8/1k6/8/8/8/8/PPK5/8 w - - 0 1",
        text: "Deux pions contre un roi seul : le gain est facile si on connaît la bonne méthode. Poussez d'abord les pions ensemble, puis laissez le roi prendre le relais : 1.b4! Rb6 2.a4! Ra6 3.Rb3! Rb6 4.Rc4! — dès que le roi noir bloque l'avance directe, la technique clé consiste à SACRIFIER un des deux pions au bon moment pour dégager la case de promotion de l'autre. Beaucoup de joueurs croient à tort que la position se referme sur une nulle, alors qu'un simple sacrifice de pion suffit à forcer le passage.",
        moveSan: ["b4", "Kb6", "a4", "Ka6", "Kb3", "Kb6", "Kc4"],
      },
      {
        title: "Empêcher le pion passé extérieur adverse",
        fen: "8/8/2p5/1p3k2/5P2/5K2/1P6/8 w - - 0 1",
        text: "Avec des pions des deux côtés, le premier réflexe adverse — créer un pion passé extérieur avec ...c5 pour détourner le roi blanc — doit être empêché immédiatement : 1.b4! (le seul coup gagnant : il verrouille la case c5 une fois pour toutes) Re6 2.Re4! Rf6 3.f5! — la finale se ramène ensuite à un simple roi et pion contre roi que vous savez déjà gagner.",
        moveSan: ["b4", "Ke6", "Ke4", "Kf6", "f5", "Kf7", "Ke5"],
      },
    ],
  },
  "pm-l-avant-poste-du-cavalier": {
    steps: [
      // Les 4 premiers chapitres (Tutoriel) sont nouveaux (2026-09-10) : sourcés
      // des chapitres THÉORIQUES (non-Exercice) de l'étude Lichess d'Antoine01
      // « L'avant-poste du Cavalier - cours Antoine01 »
      // (https://lichess.org/study/AXtMrSMm) — la même étude dont 8 chapitres
      // alimentent maintenant la vague de puzzles de ce thème dans
      // `master-puzzles-dataset.ts` (voir son docstring). Les `arrows`/
      // `highlights` reprennent telles quelles les indications `[%csl]`/
      // `[%cal]` du PGN source quand elles portent sur la position de départ du
      // chapitre affichée ici (jamais une indication tirée d'une variante RAV
      // qui ne s'applique pas à cette position). Les 18 chapitres suivants
      // (trois parties de maîtres commentées, lot du 2026-09-08) restent
      // inchangés.
      {
        title: "Tutoriel — Qu'est-ce qu'un avant-poste ?",
        fen: "3bk3/p2p4/1p1p2p1/2p1p1Pp/3nP2P/2N1N3/PPP1P3/3K4 w - - 0 1",
        text: "Un avant-poste est une case protégée par un de nos pions qui ne peut plus jamais être contrôlée par un pion adverse. Dans cette position, les Blancs peuvent compter sur l'avant-poste d5, mais aussi f6 (malgré la présence du Fou d8) et h6. Les Noirs semblent avoir un avant-poste en d4... mais non ! Cette case peut encore être contrôlée par le pion e2 ou c2 dès qu'ils avanceront d'une case. Le seul véritable avant-poste des Noirs est la case g4.\n\nPRO TIP : avant de baptiser une case « avant-poste », vérifie TOUS les pions adverses qui pourraient encore la rejoindre en avançant — pas seulement ceux déjà alignés sur sa colonne.",
        highlights: [
          { square: "d5", color: "green" },
          { square: "f6", color: "green" },
          { square: "h6", color: "green" },
        ],
      },
      {
        title: "Tutoriel — L'utilité stratégique de l'avant-poste",
        fen: "2r3k1/p2qb1pp/1p1pNr2/2pP4/2P5/1P1Q4/P5PP/4RRK1 w - - 0 1",
        text: "Un Cavalier est une pièce à courte portée : il a besoin de cases fortes dans le camp adverse pour s'exprimer pleinement. Un Cavalier centralisé sur un avant-poste atteint son plein potentiel dès la 6e rangée (la 3e rangée pour les Noirs) — regarde ce Cavalier blanc en e6, profondément enraciné au cœur de la position noire, inatteignable par le moindre pion.\n\nPRO TIP : plus un Cavalier avance sur un avant-poste protégé, plus il rayonne loin dans le camp adverse — c'est pour ça qu'un avant-poste en 6e/3e rangée vaut largement plus qu'un avant-poste en 4e/5e rangée.",
      },
      {
        title: "Tutoriel — Créer un avant-poste de toutes pièces",
        fen: "r6r/pppnk3/3p4/3Pp1pp/PPP1Pp2/5P2/1KB3PP/R4R2 b - - 0 1",
        text: "Un avant-poste n'existe pas toujours naturellement — il faut parfois le CRÉER en poussant ses pions pour écarter définitivement les pions adverses qui pourraient un jour contrôler la case visée. Ici, l'idée la plus forte était 1...a5! : après 2.bxa5 Rxa5, la case a4 devient un avant-poste inattaquable pour le Cavalier d7 (plan Nd7-c5-a4), avec la Tour prête à doubler sur la colonne a. La partie a suivi une voie plus prudente.",
        moveSan: ["c5", "b5", "b6"],
      },
      {
        title: "Tutoriel — Cap sur l'avant-poste : rediriger sa pièce",
        fen: "r4rk1/3bppbp/1q4p1/np1pP3/3P4/1P2BN2/4BPPP/R2Q1RK1 w - - 0 18",
        text: "Repérer un avant-poste ne suffit pas : encore faut-il y conduire sa pièce, parfois en la faisant reculer d'abord pour mieux sauter ensuite. Ici, le développement naturel 18.Bf4 est correct, mais l'idée la plus incisive était 18.Ne1! — le Cavalier recule d'une case pour mieux foncer vers l'avant-poste c5 (Ne1-d3-c5), un détour que beaucoup de joueurs hésitent à jouer instinctivement.\n\nPRO TIP : un Cavalier qui recule n'est pas un Cavalier passif — s'il prépare un saut vers un avant-poste, c'est souvent le coup le plus actif du coup.",
        moveSan: ["Bf4"],
      },
      {
        title: "Isaac Boleslavsky – Georgy Lisitsin, USSR Championship 1956",
        fen: "r4rk1/pp3pbp/3pbnp1/q3p3/4P3/2N1BP2/PPPQ2PP/1K1R1B1R w - - 2 13",
        text: "Comme dans de nombreuses structures de Dragon, la case d5 est un trou définitif dans le camp noir : le pion c est parti en c5xd4, et Noir vient de jouer ...e5, donc plus aucun pion noir ne pourra jamais chasser une pièce blanche installée en d5.",
        moveSan: ["a3", "Rfd8", "Nb5", "Qa4"],
      },
      {
        title: "Isaac Boleslavsky – Georgy Lisitsin : coup 16",
        fen: "r2r2k1/pp3pbp/3p1np1/4p3/q1b1P3/P1N1BP2/1P1Q2PP/1K1R1B1R b - - 1 16",
        text: "Le Cavalier blanc revient, prêt à sauter sur l'avant-poste d5 dès que possible.",
        moveSan: ["Qb3", "Bxc4", "Qxc4", "Bg5"],
      },
      {
        title: "Isaac Boleslavsky – Georgy Lisitsin : coup 19",
        fen: "r2r2k1/pp3pbp/3p1qp1/4p3/4P3/P1N2P2/1P1Q2PP/1K1R3R w - - 0 20",
        text: "En échangeant le Fou contre le Cavalier f6, Blanc supprime la dernière pièce noire susceptible de surveiller la case d5.",
        moveSan: ["Nd5"],
      },
      {
        title: "Isaac Boleslavsky – Georgy Lisitsin : coup 20",
        fen: "r2r2k1/pp3pbp/3p1qp1/3Np3/4P3/P4P2/1P1Q2PP/1K1R3R b - - 1 20",
        text: "L'avant-poste est pris ! Ce Cavalier centralisé, inattaquable par un pion, coupe la Dame noire de la défense du roque et prépare directement l'assaut sur l'aile roi.",
        moveSan: ["Qh4", "Qe2", "Bf8", "Qf1"],
      },
      {
        title: "Isaac Boleslavsky – Georgy Lisitsin : coup 27",
        fen: "2rr1bk1/pp3p1p/3p4/3Np1qR/4P1P1/P4P2/1P6/1K1R1Q2 b - - 1 27",
        text: "Depuis sa base d'appui en d5, Blanc mobilise toutes ses pièces vers le roi adverse ; la Dame noire, elle, se retrouve isolée loin de sa défense.",
        moveSan: ["Qg6", "g5", "h6", "Rxh6"],
      },
      {
        title: "Isaac Boleslavsky – Georgy Lisitsin : coup 29",
        fen: "2rr1bk1/pp3p2/3p2qR/3Np1P1/4P3/P4P2/1P6/1K1R1Q2 b - - 0 29",
        text: "Le sacrifice décisif exploite directement la domination acquise grâce à l'avant-poste : le Cavalier d5 empêchait toute réorganisation défensive noire pendant que Blanc préparait cette percée.",
        moveSan: ["Qxg5", "Rh5"],
      },
      {
        title: "Mikhail Botvinnik – Jan Hein Donner, GAK 1963",
        fen: "r2q1rk1/pb1nbppp/1p2pn2/8/1P6/P4NP1/1B1NPPBP/R2Q1RK1 w - - 1 14",
        text: "Contrairement à l'exemple sicilien précédent, ici l'avant-poste n'existe pas encore naturellement : c'est Botvinnik qui va le CRÉER de toutes pièces grâce à son expansion de pions a3-b4, puis a4-b5, en écartant les pions noirs qui pourraient un jour contrôler c6.",
        moveSan: ["Nd4", "Bxg2", "Kxg2", "Qc7"],
      },
      {
        title: "Mikhail Botvinnik – Jan Hein Donner : coup 20",
        fen: "r1r3k1/pq1nbppp/1p2pn2/1P6/3NP3/P4QP1/1B1N1PKP/R1R5 b - - 0 20",
        text: "Ce coup fixe définitivement la case c6 comme trou dans le camp noir : plus aucun pion noir (a6, b6) ne pourra jamais la défendre après l'échange à venir sur a6.",
        moveSan: ["a6", "Nc6"],
      },
      {
        title: "Mikhail Botvinnik – Jan Hein Donner : coup 21",
        fen: "r1r3k1/1q1nbppp/ppN1pn2/1P6/4P3/P4QP1/1B1N1PKP/R1R5 b - - 1 21",
        text: "L'avant-poste est occupé ! Le Cavalier blanc plonge en c6, profondément ancré dans le camp noir, attaquant la Dame et désorganisant complètement la coordination des pièces noires (Tours, Dame) qui doivent maintenant se contorsionner pour l'éviter.",
        moveSan: ["Bf8", "a4", "axb5", "axb5"],
      },
      {
        title: "Mikhail Botvinnik – Jan Hein Donner : coup 25",
        fen: "r3nbk1/1q1n1ppp/1pN1p3/1P6/4P3/5QP1/1B1N1PKP/3R4 w - - 3 26",
        text: "Le Cavalier c6 continue de dominer la position même après l'échange des Tours : il empêche toute réorganisation harmonieuse des pièces noires.",
        moveSan: ["Nc4", "Nc5", "e5", "Rc8"],
      },
      {
        title: "Mikhail Botvinnik – Jan Hein Donner : coup 29",
        fen: "4nbk1/Rqr2ppp/1pN1p3/1Pn1P3/2N5/5QP1/1B3PKP/8 b - - 4 29",
        text: "Grâce à la stabilité offerte par l'avant-poste en c6 pendant plusieurs coups, Botvinnik a eu le temps de faire progresser son attaque sur toute la largeur de l'échiquier jusqu'au gain décisif.",
        moveSan: ["Qxa7", "Nxa7", "Rxa7", "Nxb6"],
      },
      {
        title: "Vasily Smyslov – Iosif Rudakovsky, USSR Championship 1945",
        fen: "r1b2rk1/ppq1bppp/2nppn2/8/3NPP2/2N1B3/PPP1B1PP/R3QRK1 b - - 2 10",
        text: "Position typique de la Sicilienne Scheveningen. Notez déjà la case d5 : elle ne pourra plus jamais être défendue par un pion noir, puisque les pions c et e ont quitté leur colonne d'origine (c5 a disparu, et e6-e5 est le seul plan naturel pour Noir, ce qui abandonnerait définitivement d5). C'est la naissance potentielle d'un avant-poste pour le Cavalier blanc.",
        moveSan: ["Nxd4", "Bxd4", "e5"],
      },
      {
        title: "Vasily Smyslov – Iosif Rudakovsky : coup 11",
        fen: "r1b2rk1/ppq1bppp/3p1n2/4p3/3BPP2/2N5/PPP1B1PP/R3QRK1 w - - 0 12",
        text: "Noir doit jouer ce coup pour ne pas rester passif, mais il concède définitivement la case d5 : plus aucun pion noir ne peut la contrôler, et le Cavalier c6 qui aurait pu la surveiller vient d'être échangé.",
        moveSan: ["Be3", "Be6", "f5", "Bc4"],
      },
      {
        title: "Vasily Smyslov – Iosif Rudakovsky : coup 16",
        fen: "r3r1k1/pp3ppp/3p1b2/4pP2/2q1P3/2N5/PPP3PP/R3QRK1 w - - 0 17",
        text: "Dernier gardien potentiel de d5 éliminé : après cet échange, plus aucune pièce noire ne peut contester la case d5.",
        moveSan: ["Nd5"],
      },
      {
        title: "Vasily Smyslov – Iosif Rudakovsky : coup 17",
        fen: "r3r1k1/pp3ppp/3p1b2/3NpP2/2q1P3/8/PPP3PP/R3QRK1 b - - 1 17",
        text: "L'avant-poste est occupé ! Le Cavalier blanc s'installe sur d5, à l'abri de toute attaque de pion, soutenu par le pion e4. Il domine des cases clés (b6, c7, f6, e7) et paralyse la coordination des pièces noires.",
        moveSan: ["Bd8", "c3", "b5", "b3"],
      },
      {
        title: "Vasily Smyslov – Iosif Rudakovsky : coup 21",
        fen: "2rbr1k1/p4ppp/3p4/1pqNpP2/4P3/1PP2R2/P5PP/R3Q2K b - - 4 21",
        text: "Smyslov peut désormais transférer tranquillement sa Tour vers l'attaque, car le Cavalier sur d5 garantit la stabilité de sa position centrale : Noir n'a aucune contre-chance active.",
        moveSan: ["Kh8", "f6", "gxf6", "Qh4"],
      },
      {
        title: "Vasily Smyslov – Iosif Rudakovsky : coup 24",
        fen: "2rb2rk/p4p1p/3p1N2/1pq1p3/4P2Q/1PP2R2/P5PP/R6K b - - 0 24",
        text: "Le Cavalier, depuis son avant-poste, plonge directement dans la position noire pour lancer l'assaut final.",
        moveSan: ["Rg7", "Rg3", "Bxf6", "Qxf6"],
      },
      {
        title: "Vasily Smyslov – Iosif Rudakovsky : coup 29",
        fen: "7k/p4prp/5Q2/1pqRp3/4P3/1PP5/P5PP/7K b - - 0 29",
        text: "Blanc a gagné une pièce décisive ; la partie de la domination positionnelle (l'avant-poste en d5) a directement débouché sur un gain matériel puis la victoire.",
      },
    ],
  },
  "pm-la-case-faible-dans-le-camp-adverse": {
    steps: [
      {
        title: "Mikhail Botvinnik – Jose Raul Capablanca, AVRO 1938",
        fen: "r3r1k1/p2q1ppp/1p3n2/n2p4/P1pP4/2P1PPN1/1BQ3PP/4RRK1 b - - 0 18",
        text: "A cause de la chaîne de pions blancs abîmée (a3, c3 doublé, plus de pion b), la case b3 ne pourra plus jamais être surveillée par un pion blanc : c'est un trou permanent dans le camp blanc.",
        moveSan: ["Nb3"],
      },
      {
        title: "Mikhail Botvinnik – Jose Raul Capablanca : coup 18",
        fen: "r3r1k1/p2q1ppp/1p3n2/3p4/P1pP4/1nP1PPN1/1BQ3PP/4RRK1 w - - 1 19",
        text: "Capablanca occupe immédiatement cette case faible avec son Cavalier, créant un avant-poste inattaquable en plein cœur du camp adverse.",
        moveSan: ["e4"],
      },
      {
        title: "Mikhail Botvinnik – Jose Raul Capablanca : coup 19",
        fen: "r3r1k1/p2q1ppp/1p3n2/3p4/P1pPP3/1nP2PN1/1BQ3PP/4RRK1 b - - 0 19",
        text: "Mais posséder une case faible occupée ne suffit pas si elle reste coupée du reste du jeu : Botvinnik démontre ici qu'une attaque centrale et royale bien menée peut largement compenser - et même l'emporter sur - une concession positionnelle de ce type. C'est une nuance pédagogique essentielle du thème.",
        moveSan: ["Qxa4", "e5", "Nd7", "Qf2"],
      },
      {
        title: "Mikhail Botvinnik – Jose Raul Capablanca : coup 34",
        fen: "6k1/p3P2p/1p3Q2/3p3p/2pP4/qnP5/6PP/6K1 b - - 0 34",
        text: "Le pion passé, poussé jusqu'à la 7e rangée pendant que le Cavalier noir restait spectateur sur b3, illustre la leçon finale : une case faible mal exploitée, ou compensée par une attaque adverse plus rapide ailleurs sur l'échiquier, ne garantit jamais la victoire à elle seule.",
        moveSan: ["Qc1+", "Kf2", "Qc2+", "Kg3"],
      },
      {
        title: "Robert James Fischer – Boris Spassky, World Chess Championship 1972 1972",
        fen: "rnr3k1/4qpp1/p3b2p/1Bpp4/8/Q3PN2/PP3PPP/2R1K2R w K - 0 16",
        text: "Ce coup fixe une faiblesse chronique dans le camp noir : le pion c5 est désormais isolé et ne pourra plus jamais être protégé par un pion. Plus important encore, la case d5 devient un trou permanent - aucun pion noir (ni le c, ni le e) ne pourra plus jamais la contrôler. C'est exactement le genre de case faible que Fischer va exploiter pendant toute la suite de la partie.",
        moveSan: ["O-O", "Ra7", "Be2", "Nd7"],
      },
      {
        title: "Robert James Fischer – Boris Spassky : coup 20",
        fen: "2r2qk1/r2n2p1/p3p2p/2pp4/4P3/Q7/PP2BPPP/2R2RK1 b - - 0 20",
        text: "Fischer ouvre le jeu pour exploiter au maximum la faiblesse structurelle du camp noir.",
        moveSan: ["d4"],
      },
      {
        title: "Robert James Fischer – Boris Spassky : coup 20",
        fen: "2r2qk1/r2n2p1/p3p2p/2p5/3pP3/Q7/PP2BPPP/2R2RK1 w - - 0 21",
        text: "Considéré unanimement par les commentateurs comme le tournant décisif : en figeant la structure, Spassky crée une nouvelle case faible en e6 et abandonne toute perspective de contre-jeu, laissant le Fou clair blanc dominer la diagonale a2-g8 à travers ce complexe de cases claires affaiblies (c5, d5, e6).",
        moveSan: ["f4", "Qe7", "e5", "Rb8"],
      },
      {
        title: "Robert James Fischer – Boris Spassky : coup 27",
        fen: "1r3n1k/r3q1p1/7p/p1p1PR2/2Bp4/1P5Q/P5PP/2R3K1 b - - 0 27",
        text: "Toutes les pièces blanches convergent désormais vers les cases faibles du camp noir (d5, e6, f5) que Noir ne peut plus défendre avec des pions.",
        moveSan: ["Nh7", "Rcf1", "Qd8", "Qg3"],
      },
      {
        title: "Robert James Fischer – Boris Spassky : coup 41",
        fen: "4q2k/2r1r3/4PR1p/p1p5/P1Bp1Q1P/1P6/6P1/6K1 b - - 4 41",
        text: "La domination totale des cases claires (d5, e6, f5) obtenue dès le milieu de partie a fini par asphyxier complètement la position noire, sans possibilité de résistance organisée.",
      },
      {
        title: "Anatoly Karpov – Garry Kasparov, World Chess Championship 1985 1985",
        fen: "r2qr1k1/5ppp/p4n2/1pbP1bB1/1n6/N1N2B2/PP1Q1PPP/R4RK1 w - - 0 16",
        text: "Grâce à l'échange des pions c et e survenu plus tôt, la case d3 ne pourra plus jamais être surveillée par un pion blanc : c'est un trou définitif au cœur même du camp blanc.",
        moveSan: ["Rad1", "Nd3"],
      },
      {
        title: "Anatoly Karpov – Garry Kasparov : coup 16",
        fen: "r2qr1k1/5ppp/p4n2/1pbP1bB1/8/N1Nn1B2/PP1Q1PPP/3R1RK1 w - - 2 17",
        text: "Un coup devenu légendaire : le Cavalier noir s'installe sur d3, la fameuse case faible identifiée au coup précédent. Inatteignable par un pion, ce Cavalier devient un 'cavalier-pieuvre' (octopus knight) qui va tétaniser la coordination des pièces blanches pendant tout le reste de la partie.",
        moveSan: ["Nab1", "h6", "Bh4", "b4"],
      },
      {
        title: "Anatoly Karpov – Garry Kasparov : coup 27",
        fen: "2r1r1k1/3n1p2/5q1p/3P1bp1/Np6/1P1n2P1/Q4PBP/1N1R1RK1 b - - 1 27",
        text: "Depuis dix coups déjà, le Cavalier ancré en d3 paralyse littéralement les pièces blanches, qui doivent sans cesse se réorganiser autour de lui sans jamais pouvoir le chasser ni l'échanger.",
        moveSan: ["Bg6", "d6", "g4", "Qd2"],
      },
      {
        title: "Anatoly Karpov – Garry Kasparov : coup 34",
        fen: "2r1r3/5pk1/6bp/8/Np1qnRP1/1P1Q2P1/6BP/1N1R3K b - - 0 34",
        text: "Blanc parvient enfin à échanger ce Cavalier envahissant, mais beaucoup trop tard :",
        moveSan: ["Nf2+"],
      },
      {
        title: "Anatoly Karpov – Garry Kasparov : coup 34",
        fen: "2r1r3/5pk1/6bp/8/Np1q1RP1/1P1Q2P1/5nBP/1N1R3K w - - 1 35",
        text: "Le point d'orgue de la partie : depuis son avant-poste, le Cavalier surgit avec un échec à la fourchette décisif sur Roi et Tour, illustrant parfaitement comment une pièce solidement enracinée sur une case faible adverse peut, au moment choisi, se transformer en arme tactique dévastatrice.",
        moveSan: ["Rxf2", "Bxd3", "Rfd2", "Qe3"],
      },
    ],
  },
  "pm-le-mauvais-fou": {
    steps: [
      // Les 4 premiers chapitres (Tutoriel) sont nouveaux (2026-09-10) : sourcés
      // des chapitres THÉORIQUES (non-Exercise) de l'étude Lichess de
      // NoseKnowsAll « Bishops | Slice through the opposition! »
      // (https://lichess.org/study/kNn68T8l) — la même étude dont les 8
      // chapitres "Exercise 1" à "Exercise 8" alimentent maintenant la vague de
      // puzzles de ce thème dans `master-puzzles-dataset.ts` (voir son
      // docstring). Les `arrows`/`highlights` reprennent telles quelles les
      // indications `[%csl]`/`[%cal]` du PGN source. Les 13 chapitres suivants
      // (deux parties de maîtres commentées) restent inchangés.
      {
        title: "Tutoriel — La règle de la couleur : bon Fou, mauvais Fou",
        fen: "r1bq1rk1/pp2bppp/2n1p3/3pP3/2pP4/2P2N2/PPB2PPP/R1BQ1RK1 w Qq - 0 1",
        text: "Un Fou est dit « bon » quand il évolue sur la couleur OPPOSÉE à celle de ses pions fixes (au centre en général) : libre de ses mouvements, il contrôle souvent beaucoup de cases. Un Fou est dit « mauvais » quand il est coincé sur la MÊME couleur que ses propres pions fixes : ses mouvements sont restreints, il contrôle peu de cases. Ici, les bons Fous de chaque camp sont surlignés en vert, les mauvais en rouge.\n\nPRO TIP : ton mauvais Fou est presque toujours de la même couleur que le bon Fou adverse, et inversement — il peut donc être malin d'échanger ton mauvais Fou contre le bon Fou de l'adversaire, pour lui laisser seulement un mauvais Fou.",
        moveSan: ["g3", "b5"],
        highlights: [
          { square: "c2", color: "green" },
          { square: "e7", color: "green" },
          { square: "c1", color: "red" },
          { square: "c8", color: "red" },
        ],
      },
      {
        title: "Tutoriel — « Mauvais » ne veut pas dire passif",
        fen: "r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P1B2/2PBP3/PP1N1PPP/R2QK1NR b KQkq - 0 1",
        text: "Un Fou « mauvais » n'est pas forcément une mauvaise pièce ! Dans cette position typique du système Londres, le Fou blanc en f4 et le Fou noir en c8 sont tous les deux « mauvais » à cause des pions d bloqués — mais celui de f4 est actif, il contrôle des cases clés, là où celui de c8 restera passif derrière sa chaîne de pions. Noir accepte ici d'échanger son BON Fou contre le mauvais Fou actif adverse : ce mauvais Fou actif vaut mieux que le bon Fou inactif qu'il aurait sinon.",
        moveSan: ["Bd6", "Bxd6", "Qxd6", "f4"],
        highlights: [
          { square: "f4", color: "red" },
          { square: "f8", color: "green" },
          { square: "d3", color: "green" },
          { square: "c8", color: "red" },
        ],
      },
      {
        title: "Tutoriel — L'horreur du mauvais Fou (Grischuk – Bauer, 2005)",
        fen: "r3k2r/pp1qbp1p/1np1ppb1/8/3P3N/1BP2QP1/PP1B1P1P/R3K2R w KQkq - 1 15",
        text: "Grischuk affronte ici les pions doublés en f adverses, position pourtant jouable pour Noir s'il roque côté Dame et attaque sur la colonne g ouverte. Mais après ce roque suivi d'un coup de pion malheureux (f5?!), le Fou noir de g6 — déjà retenu par le Cavalier blanc en h4 — se retrouve emprisonné par son PROPRE pion : un mauvais Fou qui devient, en plus, définitivement passif. PRO TIP : plus les pièces s'échangent, plus ce genre de mauvais Fou pèse lourd dans la balance — Grischuk gagnera cette partie méthodiquement.",
        moveSan: ["O-O", "f5"],
      },
      {
        title: "Tutoriel — L'exception : un mauvais Fou peut défendre un bon pion",
        fen: "2r1r3/1pqbppkp/3p2p1/3P4/B6P/5P2/1PPQ2PK/3RR3 w - - 0 1",
        text: "Exception importante à la règle « il faut activer son mauvais Fou » : quand on a l'avantage d'espace, mieux vaut parfois éviter tous les échanges. Ici, le pion d5 blanc est très fort — le Fou en b3 est techniquement « mauvais », mais il joue un rôle actif essentiel : il défend c2 et d5, et empêche à jamais le pion e adverse d'avancer.\n\nPRO TIP : un mauvais Fou qui défend un bon pion, c'est acceptable — tant que ce pion restreint les pièces adverses et que le reste de tes pièces reste actif.",
        moveSan: ["Bb3", "Qc5"],
      },
      {
        title: "Leonard William Barden – Nicolas Rossolimo, Hastings 1950/51 1950",
        fen: "2r1k2r/1q2bpp1/p1bp3p/1p1NpP2/1Pn1P1P1/P2Q1B2/2P4P/2BR1RK1 b k - 4 21",
        text: "Un coup à double tranchant : en échangeant sur d5, Blanc va lui-même fixer des pions sur des cases claires (d5, puis f5, g4 restent déjà là), exactement la couleur de son propre Fou f3.",
        moveSan: ["Bxd5", "exd5"],
      },
      {
        title: "Leonard William Barden – Nicolas Rossolimo : coup 22",
        fen: "2r1k2r/1q2bpp1/p2p3p/1p1PpP2/1Pn3P1/P2Q1B2/2P4P/2BR1RK1 b k - 0 22",
        text: "Voila le prix à payer : désormais Blanc ne possède plus qu'un Fou de cases claires condamné à évoluer derrière sa propre chaîne de pions clairs (d5, f5, g4). Ce Fou devra rivaliser avec le Cavalier noir, bien plus mobile dans une position semi-fermée.",
        moveSan: ["Bg5", "Rfe1", "Qe7", "Be4"],
      },
      {
        title: "Leonard William Barden – Nicolas Rossolimo : coup 28",
        fen: "2r1k2r/5pp1/p2p1q2/1p1PpP2/1Pn3Q1/P2B4/2P4P/2R1R1K1 b k - 2 28",
        text: "Le Fou blanc, en cases claires, reste cantonné à un rôle purement défensif : il n'a plus aucune perspective active tant que la structure de pions clairs de son propre camp bloque ses diagonales.",
        moveSan: ["Rh4", "Qg3", "Nb6", "Re4"],
      },
      {
        title: "Leonard William Barden – Nicolas Rossolimo : coup 31",
        fen: "2r1k3/5pp1/p2p1q2/1p1npP1r/1P4R1/P2B2Q1/2P4P/2R3K1 w - - 0 32",
        text: "Le Cavalier noir, lui, profite pleinement de sa mobilité pour s'emparer du pion d5 et s'installer au centre, tandis que le mauvais Fou blanc ne peut ni le chasser ni compenser cette perte.",
        moveSan: ["Rxg7", "Nf4", "Rg8+", "Kd7"],
      },
      {
        title: "Leonard William Barden – Nicolas Rossolimo : coup 38",
        fen: "8/1k3p2/p2p3q/1p2pP1r/1P6/P2P4/7P/2R3QK b - - 0 38",
        text: "Le mauvais Fou disparaît enfin de l'échiquier, mais beaucoup trop tard : privé pendant toute la partie d'un rôle actif, il n'a jamais pu aider à la défense du Roi blanc, désormais exposé à une attaque décisive.",
        moveSan: ["Rxh2+"],
      },
      {
        title: "Anatoly Karpov – Garry Kasparov, World Chess Championship 1984/85 1984",
        fen: "rnbqkbnr/pp3ppp/8/2pp4/3P4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 5",
        text: "La Défense Tarrasch : Noir accepte un pion isolé en d5, une case claire, en échange d'un jeu de pièces actif. Tout l'enjeu stratégique de la partie va se jouer autour de la couleur de cette case.",
        moveSan: ["g3", "Nf6", "Bg2", "Be7"],
      },
      {
        title: "Anatoly Karpov – Garry Kasparov : coup 44",
        fen: "2b5/8/p2k1p2/1p1p1Bpp/3P3P/P4PP1/1PN2K2/8 b - - 0 44",
        text: "Avec l'échange des derniers Cavaliers, il ne reste plus qu'un Fou noir contre un Cavalier blanc. Or ce Fou est de cases claires - exactement la couleur du pion isolé d5 qu'il doit défendre en permanence : c'est le manuel même du 'mauvais Fou', condamné à rester passif derrière son propre pion central.",
        moveSan: ["Bxf5", "Ne3", "Bb1", "b4"],
      },
      {
        title: "Anatoly Karpov – Garry Kasparov : coup 53",
        fen: "8/8/p2k1p2/1p1p3K/1P1P1N2/P4P2/8/3b4 w - - 7 54",
        text: "Le Fou noir, mauvais depuis le milieu de partie, en est réduit à errer sans but dans les cases claires (b1, c2, d1) : il ne peut ni attaquer, ni défendre efficacement, pendant que le Roi et le Cavalier blancs devorent méthodiquement les pions noirs.",
        moveSan: ["Kg6", "Ke7", "Nxd5+", "Ke6"],
      },
      {
        title: "Anatoly Karpov – Garry Kasparov : coup 68",
        fen: "8/8/3N4/1p6/1PkP4/P3K3/6b1/8 b - - 20 68",
        text: "Jusqu'au bout, ce Fou reste incapable de coordonner la moindre résistance avec son Roi : l'infinie supériorité du Cavalier blanc, agile sur les deux couleurs de cases, face au Fou noir prisonnier de sa propre couleur, décide entièrement la finale.",
        moveSan: ["Kb3", "Nxb5", "Ka4", "Nd6"],
      },
      {
        title: "Tigran Petrosian – Bent Larsen, Second Piatigorsky Cup 1966",
        fen: "1r2r1k1/3bqpb1/n2p1np1/pp5p/3Pp3/PP2P1PP/1B1NNPBK/2RQ1R2 w - - 0 20",
        text: "Ce coup verrouillé la position : les pions noirs d5 (à venir) et e4 vont s'installer exactement sur la longue diagonale a8-h1, la même que celle du Fou blanc fianchetté en g2. Même fianchetté, ce Fou va se retrouver totalement etouffe par les propres pions de Blanc plus tard, et des maintenant par la chaîne adverse.",
        moveSan: ["Nf4", "d5"],
      },
      {
        title: "Tigran Petrosian – Bent Larsen : coup 20",
        fen: "1r2r1k1/3bqpb1/n4np1/pp1p3p/3PpN2/PP2P1PP/1B1N1PBK/2RQ1R2 w - - 0 21",
        text: "La chaîne de pions noirs d5-e4 obstrue complètement la diagonale du Fou blanc : la preuve qu'un fianchetto ne garantit jamais à lui seul un 'bon Fou' - tout depend de la structure de pions qui l'entoure.",
        moveSan: ["Qe2", "Qd6", "Rc2", "Rec8"],
      },
      {
        title: "Tigran Petrosian – Bent Larsen : coup 30",
        fen: "2b3k1/2n2pb1/3q1np1/p2p4/Pp1PpN1P/1P2P1PB/1B2Q2K/5N2 b - - 2 30",
        text: "Petrosian est contraint d'échanger lui-même ce Fou devenu inutile contre le Fou clair adverse : aveu positionnel que sa pièce était durablement mauvaise.",
        moveSan: ["Bxh3", "Nxh3", "Bf8", "Kg2"],
      },
      {
        title: "Tigran Petrosian – Bent Larsen : coup 60",
        fen: "7q/8/2Qb4/p2p1nkn/Pp1Pp1p1/1P2P1P1/6K1/3NBN2 b - - 21 60",
        text: "Malgré l'échange du mauvais Fou des le coup 30, Petrosian n'est jamais parvenu à effacer complètement le handicap positionnel initial : ses pièces restantes manquent de coordination face aux Cavaliers noirs, très actifs sur les deux couleurs de cases.",
        moveSan: ["Bxg3", "Bxg3", "Nhxg3"],
      },
    ],
  },
  "pm-le-pion-isole-de-la-dame": {
    steps: [
      {
        title: "Mikhail Botvinnik – Milan Vidmar, Nottingham 1936",
        fen: "r1bq1rk1/pp1nbppp/4pn2/6B1/2BP4/2N2N2/PP3PPP/R2Q1RK1 b - - 0 10",
        text: "Voici de nouveau la structure du pion dame isolé, mais avec les couleurs inversées par rapport à la partie précédente : c'est Blanc, cette fois, qui possede le pion isolé en d4, et qui va l'utiliser comme moteur d'une attaque directe contre le roque noir.",
        moveSan: ["Nb6", "Bb3", "Bd7", "Qd3"],
      },
      {
        title: "Mikhail Botvinnik – Milan Vidmar : coup 12",
        fen: "r2q1rk1/pp1bbppp/1n2pn2/6B1/3P4/1BNQ1N2/PP3PPP/R4RK1 b - - 4 12",
        text: "Un coup clé du systeme de Botvinnik : la Dame se place en d3, prête à rejoindre l'aile roi via g3 ou h3, en profitant de l'espace et du développement rapide que procuré l'IQP.",
        moveSan: ["Nbd5", "Ne5", "Bc6", "Rad1"],
      },
      {
        title: "Mikhail Botvinnik – Milan Vidmar : coup 17",
        fen: "r2q1rk1/pp2bppp/4pn2/3nN1B1/3P1P2/1B5Q/PP4PP/3R1RK1 b - - 0 17",
        text: "Un enchainement typique avec un IQP : Blanc prépare f4-f5 pour ouvrir les lignes vers le roi noir tant que ses pièces restent actives - il faut attaquer avant que la faiblesse structurelle du pion isolé ne se fasse sentir en finale.",
        moveSan: ["Rc8", "f5", "exf5", "Rxf5"],
      },
      {
        title: "Mikhail Botvinnik – Milan Vidmar : coup 20",
        fen: "2r2rk1/pp2bNpp/3q1n2/3n1RB1/3P4/1B5Q/PP4PP/3R2K1 b - - 0 20",
        text: "Le sacrifice qui couronne l'attaque : la dynamique offerte par le pion isolé d4 et l'espace qu'il procuré ont permis à Blanc de construire cette combinaison décisive avant que Noir ne puisse consolider.",
        moveSan: ["Rxf7", "Bxf6", "Bxf6", "Rxd5"],
      },
      {
        title: "Mikhail Botvinnik – Milan Vidmar : coup 22",
        fen: "2r3k1/pp3rpp/3q1b2/3R4/3P4/1B5Q/PP4PP/3R2K1 b - - 0 22",
        text: "Toutes les pièces noires s'effondrent sous la pression accumulée depuis le début, une démonstration magistrale du potentiel offensif d'un pion isolé bien soutenu.",
        moveSan: ["Qc6", "Rd6", "Qe8", "Rd7"],
      },
      {
        title: "David Janowski – Akiba Rubinstein, St. Petersburg 1914",
        fen: "r1bqkb1r/5ppp/p1n1pn2/1p6/3P4/2NB1N2/PP3PPP/R1BQ1RK1 b kq - 0 10",
        text: "Une nouvelle structure à pion dame isolé, mais cette fois du point de vue du camp qui va l'ATTAQUER : Rubinstein, l'un des plus grands spécialistes de la lutte contre l'IQP, va montrer la méthode canonique.",
        moveSan: ["Nb4"],
      },
      {
        title: "David Janowski – Akiba Rubinstein : coup 10",
        fen: "r1bqkb1r/5ppp/p3pn2/1p6/1n1P4/2NB1N2/PP3PPP/R1BQ1RK1 w kq - 1 11",
        text: "Rubinstein entame immédiatement le blocus de la case d5, juste devant le pion isolé : le Cavalier va s'y installer pour neutraliser toute avancé du pion et empêcher Blanc de gagner de l'espace.",
        moveSan: ["Bb1", "Nbd5", "Qe2", "Bb7"],
      },
      {
        title: "David Janowski – Akiba Rubinstein : coup 24",
        fen: "3r2k1/4r2p/pq2ppp1/1p1NN2n/3P3Q/P7/1P3PPP/R3R1K1 b - - 0 24",
        text: "Malgré le blocus mis en place, Janowski parvient à maintenir une pression active typique du camp qui possede l'IQP : il continue de chercher des complications tactiques plutôt que de laisser la partie se figer.",
        moveSan: ["Rxd5", "Nf3", "Kg7", "Qe4"],
      },
      {
        title: "David Janowski – Akiba Rubinstein : coup 28",
        fen: "8/4rknp/pq2ppp1/1p1r4/3PQ1P1/P4N2/1P3P1P/2R1R1K1 b - - 0 28",
        text: "Un exemple instructif : même assiège méthodiquement, le camp du pion isolé conserve des ressources dynamiques (ici une avancé de pions à l'aile roi) tant que les pièces restent sur l'échiquier - la lutte contre l'IQP exige donc de la précision jusqu'au bout.",
        moveSan: ["Qd6", "Rc8", "Re8", "Rec1"],
      },
      {
        title: "David Janowski – Akiba Rubinstein : coup 37",
        fen: "8/R2nk2p/p2qp1p1/1p2P1p1/8/P4Q2/1P3P1P/6K1 b - - 0 37",
        text: "Le pion isolé d4 disparaît finalement, mais en échange Blanc obtient un pion passé et une position de tours très active : ceci illustre une nuance essentielle du thème - un IQP peut aussi se transformer favorablement en finale s'il est échange au bon moment contre des atouts dynamiques.",
        moveSan: ["Qxe5", "Qd1", "Qd6", "Qxd6+"],
      },
      {
        title: "David Janowski – Akiba Rubinstein : coup 40",
        fen: "8/3n3p/R2kp1p1/1p4p1/8/P7/1P3P1P/6K1 b - - 0 40",
        text: "A ce stade, la position est objectivement très difficile, sinon perdue, pour Noir : la lutte contre l'IQP a été menée avec maestria par Rubinstein pendant tout le milieu de partie, mais la finale de tours qui en resulte reste extrêmement délicate à manier pour les deux camps.",
        moveSan: ["Kd5", "Kf1", "g4", "Ra7"],
      },
      {
        title: "David Janowski – Akiba Rubinstein : coup 63",
        fen: "8/6R1/8/P7/3kp2p/5npp/5P2/7K w - - 0 64",
        text: "Note factuelle importante pour la leçon : en toute rigueur historique, Janowski laissa ensuite filer le gain dans les complications techniques de cette finale de tours (une régularité bien connue chez ce joueur, célèbre pour perdre des positions gagnées) ; les pions noirs h, g et e finissent par se montrer plus rapides que la tour blanche isolée. Cela ne retire rien à la valeur pédagogique du milieu de partie qui précède : la manière dont Rubinstein a bloqué puis assiège le pion isolé reste un modèle du genre.",
        moveSan: ["fxg3", "e3"],
      },
      {
        title: "Viktor Korchnoi – Anatoly Karpov, World Chess Championship 1981 1981",
        fen: "rnbq1rk1/pp2bpp1/4pn1p/8/2BP3B/2N2N2/PP3PPP/2RQK2R b K - 0 10",
        text: "La position typique du pion dame isolé (IQP) apparait : le pion d4 blanc n'a plus de pion voisin (c ou e) pour le soutenir. En contrepartie, Blanc dispose de pièces actives et d'espace.",
        moveSan: ["Nc6", "O-O"],
      },
      {
        title: "Viktor Korchnoi – Anatoly Karpov : coup 11",
        fen: "r1bq1rk1/pp2bpp1/2n1pn1p/8/2BP3B/2N2N2/PP3PPP/2RQ1RK1 b - - 2 11",
        text: "Une nouveauté préparée par Karpov : au lieu de développer tranquillement, Noir force immédiatement l'échange des Fous de cases noires, retirant à Blanc une pièce essentielle pour attaquer le roque noir - la stratégie classique contre un IQP consiste à simplifier vers un finale ou la faiblesse du pion isolé primera sur sa force dynamique.",
        moveSan: ["Nh5", "Bxe7", "Nxe7", "Bb3"],
      },
      {
        title: "Viktor Korchnoi – Anatoly Karpov : coup 21",
        fen: "3r2k1/pp2npp1/2rqp2p/8/3PQ3/1BR3P1/PP3P1P/3R2K1 b - - 2 21",
        text: "Les échanges de pièces se poursuivent méthodiquement, exactement le plan à suivre contre un IQP : moins il reste de pièces sur l'échiquier, moins le pion isolé peut compter sur un potentiel d'attaque, et plus sa fragilité structurelle pese lourd.",
        moveSan: ["Rb6", "Qe1", "Qd7", "Rcd3"],
      },
      {
        title: "Viktor Korchnoi – Anatoly Karpov : coup 25",
        fen: "3r2k1/pp3pp1/2qrp2p/3n4/3P1Q2/1B1R2P1/PP3P1P/3R2K1 w - - 11 26",
        text: "Le Cavalier noir vient se poster juste devant le pion isolé, sur la case d5 : c'est le blocus classique, la méthode la plus efficace pour neutraliser durablement un pion isolé en l'empêchant même d'avancer.",
        moveSan: ["Qd2", "Qb6", "Bxd5", "Rxd5"],
      },
      {
        title: "Viktor Korchnoi – Anatoly Karpov : coup 35",
        fen: "3r2k1/5pp1/7p/pq1rp3/R2P1P2/Q5P1/1P1R3P/6K1 w - - 0 36",
        text: "Le coup décisif : Noir attaque de front le pion isolé d4, désormais totalement privé de soutien après tous les échanges de pièces qui ont eu lieu depuis le début de partie.",
        moveSan: ["fxe5", "Rxe5", "Qa1", "Qe8"],
      },
      {
        title: "Viktor Korchnoi – Anatoly Karpov : coup 38",
        fen: "3rq1k1/5pp1/7p/p3P3/R7/6P1/1P1R3P/Q5K1 b - - 0 38",
        text: "Le pion isolé tombe enfin, et avec lui l'équilibre de la partie : la faiblesse chronique identifiée des le coup 10 finit par coûter la partie à Blanc.",
        moveSan: ["Rxd2", "Rxa5", "Qc6", "Ra8+"],
      },
    ],
  },
  "jh-module-3-la-structure-carlsbad": {
    steps: [
      {
        title: "Anatoly Karpov – Joel Lautier, Dortmund Sparkassen 1995",
        fen: "r1b1r1k1/pp1nqpp1/2pb1n1p/4p3/2BP4/P1N1PN1P/1PQ2PP1/R1BR2K1 w - - 0 13",
        text: "La partie devie un instant du schéma Carlsbad \\\"pur\\\" (Blanc reprend sur c4 au lieu d'échanger sur d5), mais Karpov, l'un des plus grands spécialistes de ce type de structure, va neanmoins ramener le jeu vers un final ou le plan de minorité classique fait toute la difference.",
        moveSan: ["Nh4", "Nf8", "dxe5", "Bxe5"],
      },
      {
        title: "Anatoly Karpov – Joel Lautier : coup 20",
        fen: "3rrnk1/pp3pp1/1bp1bn1p/4q3/1P6/P2BP1NP/2QBNPP1/R2R2K1 b - - 0 20",
        text: "Le pion minoritaire s'avancé : même sans la structure Carlsbad symétrique classique, Karpov appliqué la même logique intemporelle - pousser le pion b pour cibler le côté dame noir privé de son pion c (déjà échange au coup 11).",
        moveSan: ["Ng6", "a4", "a6", "Bc3"],
      },
      {
        title: "Anatoly Karpov – Joel Lautier : coup 27",
        fen: "3rr1k1/1p3pp1/p1p1bnnp/1P6/P3Pq2/3B1NNP/2Q2PP1/R2R2K1 b - - 0 27",
        text: "Le coup clé du plan de minorité : Blanc force un échange qui va laisser un pion noir faible sur une colonne ouverte, exactement comme dans le schéma Carlsbad classique.",
        moveSan: ["axb5", "axb5", "Ne5", "Nxe5"],
      },
      {
        title: "Anatoly Karpov – Joel Lautier : coup 30",
        fen: "3rr1k1/1p3pp1/2P1bn1p/4q3/4P3/3B2NP/2Q2PP1/R2R2K1 b - - 0 30",
        text: "Le pion c6 noir tombe finalement, laissant Noir avec un pion c isolé et arriere sur la colonne c désormais grande ouverte pour les Tours blanches - la signature du plan de minorité mène a son terme.",
        moveSan: ["bxc6", "Rac1", "Rd6", "Qc3"],
      },
      {
        title: "Anatoly Karpov – Joel Lautier : coup 44",
        fen: "r5k1/6p1/3NPp1p/2pb4/n4PB1/R6P/6P1/6K1 b - - 0 44",
        text: "Le pion passé e, créé indirectement par toute la pression exercee depuis le coup 20 sur le côté dame, décide la partie : Noir abandonne, incapable d'arrêter la promotion.",
      },
      {
        title: "Tigran Petrosian – Nikolai Krogius, USSR Championship 1959",
        fen: "rnbqk2r/ppp2pbp/6p1/3p4/3P4/2N2N2/PP2PPPP/R2QKB1R w KQkq - 0 9",
        text: "Bien que la partie ait commence en Grunfeld, l'échange sur d5 fait apparaitre exactement la structure de pions dite \\\"Carlsbad\\\" : pion d5 noir isolé de son compagnon e (déjà échange), face au pion d4 blanc privé de son pion c (déjà échange lui aussi). Cette structure symétrique sur les colonnes a-b-d-e-f-g-h est le point de départ classique du plan de minorité.",
        moveSan: ["e3", "O-O", "Bd3", "Nc6"],
      },
      {
        title: "Tigran Petrosian – Nikolai Krogius : coup 12",
        fen: "r1bq1rk1/ppp1npbp/6p1/3p4/1P1P4/2NBPN2/P4PPP/R2Q1RK1 b - - 0 12",
        text: "Le plan de minorité commence : Blanc n'a que deux pions (a et b) face aux trois pions noirs (a, b, c) du côté dame, mais c'est précisément cette minorité qui va servir à attaquer, pas à défendre - l'idée centrale de la structure Carlsbad.",
        moveSan: ["Bf5", "Bxf5", "Nxf5", "b5"],
      },
      {
        title: "Tigran Petrosian – Nikolai Krogius : coup 14",
        fen: "r2q1rk1/ppp2pbp/6p1/1P1p1n2/3P4/2N1PN2/P4PPP/R2Q1RK1 b - - 0 14",
        text: "Deuxième temps du plan : Blanc pousse son pion minoritaire jusqu'a b5 pour forcer un échange qui va abimer les pions noirs, quel que soit le sens dans lequel Noir reprend.",
        moveSan: ["Qd6", "Qb3", "Ne7", "Rfc1"],
      },
      {
        title: "Tigran Petrosian – Nikolai Krogius : coup 18",
        fen: "r4r1k/pp2npb1/2pq2pp/1P1p4/3P4/1QN1PN2/P1R2PPP/2R3K1 w - - 0 19",
        text: "Noir est contraint de soutenir son pion d5 avec c6, completant lui-même le squelette Carlsbad et offrant à Blanc la cible fixe qu'il attendait sur la colonne c.",
        moveSan: ["Na4", "Rab8", "g3", "Kh7"],
      },
      {
        title: "Tigran Petrosian – Nikolai Krogius : coup 22",
        fen: "1r1r4/p3npbk/2pq2pp/2Np4/3P4/1Q2PNP1/P1R2P1P/2R3K1 w - - 0 23",
        text: "L'échange caracteristique du plan de minorité : le pion c noir devient faible et arriere sur une colonne c désormais ouverte, tandis que le pion d5 reste isolé - Noir se retrouve avec deux faiblesses permanentes au lieu d'une.",
        moveSan: ["Qa4", "Qf6", "Kg2", "Ra8"],
      },
      {
        title: "Tigran Petrosian – Nikolai Krogius : coup 36",
        fen: "r3r3/p5bk/2R4p/3Q4/q4pP1/5N1P/P4PK1/4R3 b - - 0 36",
        text: "Le second pion faible tombe à son tour : d5 et c6 avaient tous deux été condamnes des le coup 22, et Blanc les recolte l'un après l'autre - la démonstration complète du plan de minorité depuis la case-cible jusqu'au gain matériel décisif.",
        moveSan: ["Rxe1", "Nxe1", "Rf8", "Nf3"],
      },
      {
        title: "Yasser Seirawan – Mikhail Tal, Niksic 1983",
        fen: "rnbqk2r/ppp2ppp/5n2/3p4/1b1P4/2N5/PPQ1PPPP/R1B1KBNR w KQkq - 0 6",
        text: "Depuis la Nimzo-indienne, l'échange immédiat sur d5 produit directement la structure Carlsbad : Blanc a perdu son pion c, Noir son pion e, et les deux camps se retrouvent avec des pions symetriques sur les colonnes a, b, d, f, g, h. C'est l'autre grande voie d'acces (avec le Gambit Dame refuse, variante d'échange) vers ce type de position.",
        moveSan: ["Bg5", "h6", "Bxf6", "Qxf6"],
      },
      {
        title: "Yasser Seirawan – Mikhail Tal : coup 13",
        fen: "rnr3k1/ppp2pp1/4bq1p/3p4/1P1P4/P1Q1P1N1/5PPP/R3KB1R b KQ - 0 13",
        text: "Le plan de minorité demarre : les deux pions blancs a et b vont s'avancer contre les trois pions noirs a, b et c pour forcer une faiblesse durable, même si Blanc est numeriquement minoritaire de ce côté.",
        moveSan: ["a5", "Be2", "axb4", "axb4"],
      },
      {
        title: "Yasser Seirawan – Mikhail Tal : coup 18",
        fen: "2r3k1/1pp1qpp1/2n1b2p/1P1p4/3P4/2Q1P1N1/4BPPP/4K2R b K - 0 18",
        text: "Le pion minoritaire atteint b5 : Noir doit choisir entre laisser Blanc jouer bxc6 (pion c isolé/arriere) ou repousser le Cavalier en abandonnant le controle de c6 - dans les deux cas la structure noire va se fissurer.",
        moveSan: ["Nd8", "O-O", "c5"],
      },
      {
        title: "Yasser Seirawan – Mikhail Tal : coup 19",
        fen: "2rn2k1/1p2qpp1/4b2p/1Ppp4/3P4/2Q1P1N1/4BPPP/5RK1 w - c6 0 20",
        text: "Noir tente une contre-poussée immédiate plutôt que de subir passivement, mais la faiblesse structurelle sur les cases noires du côté dame demeure inevitable.",
        moveSan: ["bxc6", "bxc6"],
      },
      {
        title: "Yasser Seirawan – Mikhail Tal : coup 20",
        fen: "2rn2k1/4qpp1/2p1b2p/3p4/3P4/2Q1P1N1/4BPPP/5RK1 w - - 0 21",
        text: "Exactement le motif du plan de minorité : le pion c6 noir est désormais isolé (plus de pion b ou d pour le soutenir lateralement sur cette colonne) et la colonne c est ouverte pour les pièces blanches.",
        moveSan: ["Rc1", "Bd7", "Qa5", "Kf8"],
      },
      {
        title: "Yasser Seirawan – Mikhail Tal : coup 32",
        fen: "2r4k/3q1pp1/4n2p/2pp1Q2/3P3N/4P3/5PPP/2R3K1 w - - 0 33",
        text: "Noir essaie enfin de liquider sa faiblesse chronique, mais il est trop tard : la pression accumulée depuis le coup 13 a laissé Blanc largement en avancé dans la course.",
        moveSan: ["dxc5", "Qe7", "g3", "Qd7"],
      },
      {
        title: "Yasser Seirawan – Mikhail Tal : coup 35",
        fen: "2r4k/3q1pp1/2P1n2p/3p1Q2/7N/4P1P1/5P1P/2R3K1 b - - 0 35",
        text: "Le pion autrefois faible de Noir devient, après tous ces échanges, un pion passé blanc dangereux tout près de la promotion - illustration frappante de la valeur à long terme du plan de minorité.",
        moveSan: ["Rxc6", "Rxc6", "Qxc6", "Qxf7"],
      },
    ],
  },
  "jh-module-4-la-structure-maroczy": {
    steps: [
      {
        title: "Jose Raul Capablanca – Fred Dewhirst Yates, Bad Kissingen 1928",
        fen: "rnbqkbnr/pp2pp1p/3p2p1/8/2PNP3/8/PP3PPP/RNBQKB1R b KQkq - 0 5",
        text: "Capablanca installe le Bind par un ordre de coups un peu different (2.Ne2 puis c4), evitant certaines complications tactiques liees a Cb5 ou Cc3 precoce. Le resultat est le même : pions blancs c4 et e4 verrouillant durablement la case d5 face au futur fianchetto noir.",
        moveSan: ["Bg7", "Nc3", "Nf6", "Be2"],
      },
      {
        title: "Jose Raul Capablanca – Fred Dewhirst Yates : coup 10",
        fen: "r1bq1rk1/pp2ppbp/3p1np1/2n5/2PNP3/2N1BP2/PP2B1PP/R2Q1RK1 b - - 0 10",
        text: "Le coup f3 est une pièce maitresse du plan blanc dans le Bind : il soutient solidement le pion e4 (qui n'est alors plus attaquable par ...Ng4 ou ...Nf6-e4), permettant à Blanc de manoeuvrer tranquillement ses pièces (Qd2, Rac1, Rfd1) sans craindre de contre-jeu tactique immédiat au centre.",
        moveSan: ["Bd7", "Qd2", "Rc8", "Rfd1"],
      },
      {
        title: "Jose Raul Capablanca – Fred Dewhirst Yates : coup 20",
        fen: "3q1rk1/1pr1ppbp/p2pb1p1/4P3/N1P2P2/1P2QB2/P5PP/2RR2K1 w - - 1 21",
        text: "Toutes les pièces mineures qui pourraient contester la case d5 ou générer du contre-jeu ont été échangées ; Noir se retrouve dans une position purement passive, coincee derrière son pion d6, exactement le scenario que le Bind est cense produire.",
        moveSan: ["c5"],
      },
      {
        title: "Jose Raul Capablanca – Fred Dewhirst Yates : coup 21",
        fen: "3q1rk1/1pr1ppbp/p2pb1p1/2P1P3/N4P2/1P2QB2/P5PP/2RR2K1 b - - 0 21",
        text: "Le second pilier du Bind se transformé enfin en force offensive : la poussée c5 attaque directement d6 et ouvre les lignes vers le roi noir, illustrant comment l'avantage d'espace statique du début de partie se convertit en attaque concrète en fin de partie.",
        moveSan: ["Qb8", "exd6", "exd6", "Rxd6"],
      },
      {
        title: "Jose Raul Capablanca – Fred Dewhirst Yates : coup 32",
        fen: "5bk1/4qp1p/R3b1p1/4Q3/1p3P2/1P3B2/P5PP/6K1 w - - 0 33",
        text: "La domination totale des blancs, initiee par le Bind trente coups plus tôt, se conclut par un simple ratissage matériel : Blanc est Tour et pion contre pièces mineures avec une attaque décisive, et Noir n'a plus aucune ressource defensive.",
        moveSan: ["Be4", "Qd8", "h3", "Bxh3"],
      },
      {
        title: "Bent Larsen – Tigran Petrosian, Second Piatigorsky Cup 1966",
        fen: "r1bqk1nr/pp1pppbp/2n3p1/8/2PNP3/4B3/PP3PPP/RN1QKB1R b KQkq - 0 6",
        text: "Le Bind classique contre le Dragon Accéléré : Blanc pousse c4 dès que possible pour empêcher à tout jamais la libération thématique ...d5 de Noir, quitte à retarder Cc3.",
        moveSan: ["Nf6", "Nc3", "Ng4", "Qxg4"],
      },
      {
        title: "Bent Larsen – Tigran Petrosian : coup 14",
        fen: "r2qr1k1/pp2ppbp/2bpn1p1/3N4/2P1P3/4B3/PP1QBPPP/3R1RK1 w - - 8 15",
        text: "Position typique du Bind pleinement installee : pions c4-e4 blancs, pion d6 noir bloqué, Cavalier blanc solidement établi sur l'avant-poste d5. Face au champion du monde en titre Petrosian, Larsen dispose de tout l'espace nécessaire pour lancer une offensive au Roi.",
        moveSan: ["f4", "Nc7", "f5"],
      },
      {
        title: "Bent Larsen – Tigran Petrosian : coup 16",
        fen: "r2qr1k1/ppn1ppbp/2bp2p1/3N1P2/2P1P3/4B3/PP1QB1PP/3R1RK1 b - - 0 16",
        text: "L'espace procuré par le Bind se transformé directement en attaque : la poussée f4-f5 ouvre les lignes contre le roque noir, une démonstration classique du potentiel dynamique (et pas seulement statique) de cette structure.",
        moveSan: ["Na6", "Bg4", "Nc5", "fxg6"],
      },
      {
        title: "Bent Larsen – Tigran Petrosian : coup 25",
        fen: "r2q1rk1/pp2ppb1/3pn1Q1/3R4/2P3B1/4BR2/PP4PP/6K1 b - - 0 25",
        text: "Le coup célèbre de la partie : un sacrifice de Dame base sur une conception profonde plutôt que sur un calcul force jusqu'au mat. Il illustre à merveille comment l'avancé spatiale offerte par le Bind, cumulée à une attaque de pions savamment préparée, peut deboucher sur une explosion tactique même contre l'un des plus grands defenseurs de l'histoire.",
        moveSan: ["Nf4", "Rxf4", "fxg6", "Be6+"],
      },
      {
        title: "Rudolf Swiderski – Geza Maroczy, Monte Carlo 1904",
        fen: "rnbqkbnr/pp1ppppp/8/2p5/2P1P3/8/PP1P1PPP/RNBQKBNR b KQkq - 0 2",
        text: "Coup fondateur : c'est littéralement la naissance du concept. En jouant c4 dès le deuxième coup, Blanc annonce son intention d'installer les pions c4 et e4 ensemble pour contrôler durablement la case d5 et empêcher à jamais la poussée libératrice ...d5 de Noir. Cette partie est la toute première connue à présenter ce qui sera plus tard baptisé le \\\"Maroczy Bind\\\", justement en l'honneur du joueur qui la joue ici... avec les Noirs !",
        moveSan: ["Nc6", "Nf3", "g6", "d4"],
      },
      {
        title: "Rudolf Swiderski – Geza Maroczy : coup 11",
        fen: "r2q1rk1/pp2ppbp/2bp1np1/8/2PBP3/2N4P/PP2BPP1/R2Q1RK1 w - - 1 12",
        text: "La structure typique du Bind est désormais figée sur l'échiquier : pions blancs c4 et e4 côté à côté, pion noir bloqué en d6, fou de cases noires déjà échange. Noir ne pourra plus jamais libérer sa position par ...d5 ; il devra se contenter de manoeuvres lentes sur les colonnes semi-ouvertes.",
        moveSan: ["Qd3", "Nd7", "Bxg7", "Kxg7"],
      },
      {
        title: "Rudolf Swiderski – Geza Maroczy : coup 25",
        fen: "5k2/2q1p2p/1p2Q1p1/2p1n3/1P6/7P/4BPP1/6K1 w - - 0 26",
        text: "Ironie de l'histoire : c'est justement l'un des deux piliers du Bind (le pion c4, pousse en c5) qui se retrouve échange ici, rouvrant la position. Cette partie originelle montre que la technique pour exploiter le Bind n'était pas encore maîtrisée en 1904 : la belle structure statique du début ne suffit pas à elle seule si elle n'est pas suivie d'un plan concret.",
        moveSan: ["f4", "Nf7", "Bc4", "Qxf4"],
      },
      {
        title: "Rudolf Swiderski – Geza Maroczy : coup 36",
        fen: "8/4p2p/3n2p1/8/5k2/7P/5KP1/5B2 w - - 1 37",
        text: "Le créateur du concept, ici avec les pièces noires, prend le dessus dans la finale grâce à l'activité de son Roi et de son Cavalier. Une leçon utile : le Bind procuré un avantage positionnel durable, mais comme tout avantage il doit être transformé avec précision, sans quoi l'adversaire peut retourner la situation.",
        moveSan: ["Bd3", "Ne4+", "Ke2", "g5"],
      },
    ],
  },
  "jh-module-11-les-finales-de-tours-pratiques": {
    steps: [
      {
        title: "Alexander Alekhine – Jose Raul Capablanca, Capablanca - Alekhine World Championship 1927",
        fen: "8/5p1k/5rpp/8/P2R3P/6P1/5PK1/8 b - - 0 50",
        text: "Les Dames disparaissent et la véritable finale de Tours commence, Blanc disposant d'un pion supplémentaire (a4 contre l'absence de pion a noir) mais Noir conservant des ressources defensives grâce à l'activité potentielle de sa Tour.",
        moveSan: ["Kg7", "a5"],
      },
      {
        title: "Alexander Alekhine – Jose Raul Capablanca : coup 51",
        fen: "8/5pk1/5rpp/P7/3R3P/6P1/5PK1/8 b - - 0 51",
        text: "Premier principe appliqué : la création immédiate d'un pion passé protégé sur l'aile ou l'adversaire est le plus faible. Ce pion a va devenir la cible constante autour de laquelle s'organise toute la stratégie blanche pour le reste de la partie.",
        moveSan: ["Ra6", "Rd5", "Rf6", "Rd4"],
      },
      {
        title: "Alexander Alekhine – Jose Raul Capablanca : coup 64",
        fen: "8/5p2/k3r1p1/P6p/5K1P/6P1/R4P2/8 w - - 16 65",
        text: "Long ballet de Rois : chaque camp cherche à centraliser puis à activer son propre Roi, illustrant le principe cardinal des finales de Tours - contrairement aux autres finales, le Roi doit s'engager très tôt dans le combat plutôt que rester en retrait.",
        moveSan: ["Kg5", "Re5+", "Kh6", "Rf5"],
      },
      {
        title: "Alexander Alekhine – Jose Raul Capablanca : coup 70",
        fen: "8/3r1pK1/k5p1/P4P1p/7P/R5P1/8/8 b - - 0 70",
        text: "Second temps de la technique classique : Alekhine créé un second front (le pion f, puis la case g6) à l'opposé du pion a. La Tour noire, déjà clouée à la surveillance du pion a5, ne peut plus faire face partout à la fois - le principe des \\\"deux faiblesses\\\".",
        moveSan: ["gxf5", "Kh6", "f4", "gxf4"],
      },
      {
        title: "Alexander Alekhine – Jose Raul Capablanca : coup 81",
        fen: "8/5R2/2k5/7K/5P1P/8/8/7r w - - 1 82",
        text: "Le second pion passé (f) est désormais imparable, soutenu par le Roi blanc complètement libre dans le camp adverse, pendant que la Tour noire n'a plus aucune case utile pour l'arrêter - la conclusion logique de la stratégie des deux faiblesses.",
        moveSan: ["Re7"],
      },
      {
        title: "Jose Raul Capablanca – Savielly Tartakower, New York 1924",
        fen: "4k3/p1p5/1p3rp1/n2p4/P2P1P2/2PB2P1/6K1/7R b - - 1 29",
        text: "La finale de Tours proprement dite commence : premier principe appliqué par Capablanca, la prise de possession d'une colonne ouverte (ici la colonne h) pour faire pénétrer la Tour dans le camp adverse.",
        moveSan: ["Kf8", "Rh7"],
      },
      {
        title: "Jose Raul Capablanca – Savielly Tartakower : coup 30",
        fen: "5k2/p1p4R/1p3rp1/n2p4/P2P1P2/2PB2P1/6K1/8 b - - 3 30",
        text: "Deuxième principe classique : la Tour s'installe à la 7e rangée, où elle attaque simultanément les pions noirs et immobilise le Roi adverse - l'un des atouts les plus puissants d'une finale de Tours.",
        moveSan: ["Rc6", "g4", "Nc4", "g5"],
      },
      {
        title: "Jose Raul Capablanca – Savielly Tartakower : coup 34",
        fen: "5k2/p1p4R/1pr3p1/3p1BP1/P2P1P2/2P2K2/8/8 b - - 0 34",
        text: "Ce coup créé le pion passé qui va decider la partie : en échangeant son Fou contre le Cavalier noir, Blanc obtient un pion g passé, libre d'avancer sans plus jamais être inquiete par une pièce mineure noire.",
        moveSan: ["gxf5", "Kg3"],
      },
      {
        title: "Jose Raul Capablanca – Savielly Tartakower : coup 35",
        fen: "5k2/p1p4R/1pr5/3p1pP1/P2P1P2/2P3K1/8/8 b - - 1 35",
        text: "Le coup le plus célèbre de la partie ! Alors que la théorie générale enseigne de garder son Roi à l'abri, Capablanca demontre ici le principe spécifique aux finales de Tours : le Roi doit devenir une pièce active de premier plan. Il sacrifie même deux pions dans la foulee pour l'emmener vers f6, ou il soutiendra à la fois la promotion du pion g et les menaces de mat de la Tour.",
        moveSan: ["Rxc3+", "Kh4", "Rf3", "g6"],
      },
      {
        title: "Jose Raul Capablanca – Savielly Tartakower : coup 41",
        fen: "4r2k/p1R5/1p3KP1/3p1p2/P2P4/8/8/8 w - - 1 42",
        text: "Position modèle : Roi blanc en f6, pion en g6, Tour à la 7e rangée - Alekhine notait que cette configuration precise fait \\\"tomber les pions noirs comme des pommes mures\\\". Le matériel n'a plus d'importance : seule compte la coordination Roi + Tour + pion passé.",
        moveSan: ["Kxf5", "Re4", "Kf6", "Rf4+"],
      },
      {
        title: "Akiba Rubinstein – Emanuel Lasker, St. Petersburg 1909",
        fen: "8/p2rk1pp/8/5p2/5R2/4P3/PP4PP/6K1 w - - 0 24",
        text: "Les Dames sont échangées et la finale de Tours pure commence : matériel à peu près équilibré (Tour et quatre pions chacun), mais Blanc va demontrer que l'activité de la Tour et la qualité de la structure de pions comptent bien plus que le simple decompte matériel.",
        moveSan: ["Rxf5", "Rd1+", "Kf2", "Rd2+"],
      },
      {
        title: "Akiba Rubinstein – Emanuel Lasker : coup 27",
        fen: "8/p3k1pp/8/R7/8/4PK2/Pr4PP/8 b - - 1 27",
        text: "Premier principe illustre : Rubinstein ne se precipite pas pour reprendre des pions, il place d'abord sa Tour de manière active à la 5e rangée, prêt à harceler le Roi et les pions noirs, plutôt que de la laisser passive en défense.",
        moveSan: ["Rb7", "Ra6", "Kf8", "e4"],
      },
      {
        title: "Akiba Rubinstein – Emanuel Lasker : coup 35",
        fen: "8/p1r2kp1/R6p/4PK1P/6P1/8/P7/8 b - - 0 35",
        text: "Deuxième principe : le Roi blanc mène la marche vers l'avant tandis que la majorité de pions centraux et royaux avancé de concert, repoussant peu à peu le Roi noir et reduisant son espace de manoeuvre.",
        moveSan: ["Rb7", "Rd6", "Ke7", "Ra6"],
      },
      {
        title: "Akiba Rubinstein – Emanuel Lasker : coup 40",
        fen: "8/pr3kp1/2R4p/4PK1P/6P1/P7/8/8 b - - 0 40",
        text: "Coup d'attente décisif : la Tour noire est totalement clouée à la défense passive (elle doit surveiller les pions et le Roi ne peut plus bouger sans conceder du terrain), si bien que Noir se trouve pratiquement en zugzwang et abandonne. Démonstration exemplaire du thème \\\"Tour active contre Tour passive\\\" : c'est l'activité, non le matériel, qui a décide la partie.",
      },
    ],
  },
  "jh-module-6-la-chaine-de-pions-en-francais": {
    steps: [
      {
        title: "Miguel Najdorf – Svetozar Gligoric, Mar del Plata 1953",
        fen: "r1bq1rk1/ppp2pbp/2np1np1/3Pp3/2P1P3/2N2N2/PP2BPPP/R1BQ1RK1 b - - 0 8",
        text: "Le coup clé qui verrouillé définitivement le centre : Blanc obtient la chaîne c4-d5 pointant vers l'aile dame, Noir la chaîne d6-e5 pointant vers l'aile roi. C'est exactement cette partie, jouee ici pour la première fois avec ce plan complet, qui a donné son nom à toute la variante \\\"Mar del Plata\\\". Comme les deux chaînes sont verrouillées et pointent chacune vers un côté opposé de l'échiquier, chaque camp sait immédiatement ou est son terrain de jeu : Blanc à l'aile dame, Noir à l'aile roi - une illustration parfaite du principe selon lequel la direction d'une chaîne de pions dicte le plan stratégique.",
        moveSan: ["Ne7", "Ne1", "Nd7", "Nd3"],
      },
      {
        title: "Miguel Najdorf – Svetozar Gligoric : coup 10",
        fen: "r1bq1rk1/pppnn1bp/3p2p1/3Ppp2/2P1P3/2NN4/PP2BPPP/R1BQ1RK1 w - - 0 11",
        text: "Noir lance sa poussée thématique du côté roi, gagnant de l'espace et préparant à terme ...f4 pour attaquer la base de la chaîne blanche côté roi (le pion e4).",
        moveSan: ["f3", "f4", "Bd2", "Nf6"],
      },
      {
        title: "Miguel Najdorf – Svetozar Gligoric : coup 13",
        fen: "r1bq1rk1/ppp1n1bp/3p1np1/3Pp3/1PP1Pp2/2NN1P2/P2BB1PP/R2Q1RK1 b - - 0 13",
        text: "Réponse miroir à l'aile dame : Blanc entame le plan classique d'attaque de minorité/d'expansion (b4-c5) pour ouvrir des lignes contre la base du camp noir plutôt que d'attendre passivement l'assaut adverse.",
        moveSan: ["g5", "c5", "h5", "Nf2"],
      },
      {
        title: "Miguel Najdorf – Svetozar Gligoric : coup 17",
        fen: "r1bq2k1/pp3rb1/3p1nn1/3Pp1pp/1P2Pp2/2N2P2/P2BBNPP/2RQ1RK1 w - - 0 18",
        text: "La course est désormais pleinement engagée des deux côtés de l'échiquier : Blanc a ouvert la colonne c contre la base noire (case c6/pion d6), Noir continue de pousser ses pions g et h contre le roque blanc.",
        moveSan: ["a4", "Bf8", "a5", "Rg7"],
      },
      {
        title: "Miguel Najdorf – Svetozar Gligoric : coup 30",
        fen: "3qbbk1/1p6/pN1p1n1n/P2Pp1r1/1P2Pp2/B7/2Q1BNP1/5RK1 w - - 0 31",
        text: "Le pion g blanc, avancé pour freiner l'assaut, tombe à son tour : la course des deux pions passes/assauts opposés touche a son point culminant.",
        moveSan: ["Rc1", "Rg3", "Bb2", "Nfg4"],
      },
      {
        title: "Miguel Najdorf – Svetozar Gligoric : coup 40",
        fen: "5bk1/1p5q/pN1p2b1/P2Pp3/1PR1Pr2/2B1Qp2/5KP1/8 w - - 2 41",
        text: "Noir arrive le premier au but dans cette course des deux ailes : son assaut de pions transformes en attaque de pièces contre le roi blanc s'avere décisif avant que Blanc n'ait pu concrétiser son avantage à l'aile dame.",
        moveSan: ["gxf3", "Qh2+", "Ke1", "Qh1+"],
      },
      {
        title: "Aron Nimzowitsch – Georg Salwe, Karlsbad 1911",
        fen: "rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
        text: "La partie fondatrice du concept, telle qu'analysee par Nimzowitsch lui-même dans \\\"My System\\\". Les pions se verrouillent en diagonale : chaîne blanche d4-e5 contre chaîne noire d5-e6. Selon la règle d'or de Nimzowitsch, une chaîne de pions se combat à sa BASE (le pion le plus en arriere, ici d4 pour Blanc) et non à sa tête (le pion le plus avancé, ici e5).",
        moveSan: ["c5"],
      },
      {
        title: "Aron Nimzowitsch – Georg Salwe : coup 3",
        fen: "rnbqkbnr/pp3ppp/4p3/2ppP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4",
        text: "Noir appliqué immédiatement la règle : il attaque la base d4 plutôt que la tête e5, qui n'a aucune importance particuliere en elle-même.",
        moveSan: ["c3"],
      },
      {
        title: "Aron Nimzowitsch – Georg Salwe : coup 4",
        fen: "rnbqkbnr/pp3ppp/4p3/2ppP3/3P4/2P5/PP3PPP/RNBQKBNR b KQkq - 0 4",
        text: "Blanc renforce méthodiquement sa base avant qu'elle ne soit prise d'assaut.",
        moveSan: ["Nc6", "Nf3", "Qb6", "Bd3"],
      },
      {
        title: "Aron Nimzowitsch – Georg Salwe : coup 7",
        fen: "r3kbnr/pp1b1ppp/1qn1p3/2PpP3/8/2PB1N2/PP3PPP/RNBQK2R b KQkq - 0 7",
        text: "Plutôt que de laisser la tension s'eterniser, Blanc cède lui-même sa base d4 contre le pion c5 noir : la chaîne perd un maillon, mais Blanc obtient en échange du temps de développement et conserve le pion e5, désormais un pion isolé avancé, epine dans le camp noir.",
        moveSan: ["Bxc5", "O-O", "f6"],
      },
      {
        title: "Aron Nimzowitsch – Georg Salwe : coup 8",
        fen: "r3k1nr/pp1b2pp/1qn1pp2/2bpP3/8/2PB1N2/PP3PPP/RNBQ1RK1 w kq - 0 9",
        text: "Noir attaque maintenant directement la tête de la chaîne (le pion e5 restant), une méthode moins efficace selon Nimzowitsch, mais c'est tout ce qu'il reste a attaquer.",
        moveSan: ["b4"],
      },
      {
        title: "Aron Nimzowitsch – Georg Salwe : coup 9",
        fen: "r3k1nr/pp1b2pp/1qn1pp2/2bpP3/1P6/2PB1N2/P4PPP/RNBQ1RK1 b kq - 0 9",
        text: "Blanc contre-attaque le fou plutôt que de défendre passivement e5.",
        moveSan: ["Be7", "Bf4", "fxe5", "Nxe5"],
      },
      {
        title: "Aron Nimzowitsch – Georg Salwe : coup 12",
        fen: "r3k1nr/pp1bb1pp/1q2p3/3pB3/1P6/2PB4/P4PPP/RN1Q1RK1 b kq - 0 12",
        text: "Le dernier pion de \\\"l'orgueilleuse famille de la chaîne\\\" (selon les mots memes de Nimzowitsch) est tombe, mais Blanc le remplace aussitôt par une pièce : le Fou s'installe en blocus sur e5, occupant exactement la même case clé. C'est l'idée de la \\\"sur-protection\\\" et du blocus qui prolonge naturellement la théorie de la chaîne de pions.",
        moveSan: ["Nf6", "Nd2", "O-O", "Nf3"],
      },
      {
        title: "Aron Nimzowitsch – Georg Salwe : coup 27",
        fen: "2r4k/p2br1p1/1p1q1nB1/4p3/1P1p4/2P1B1R1/P1Q2PPP/4R1K1 w - - 0 28",
        text: "Noir tente enfin de faire valoir sa propre chaîne (d5-e5 devenu d4-e5) en la poussant en avant, mais il est trop tard : Blanc a déjà retourne toutes ses pièces vers l'attaque du roi noir.",
        moveSan: ["Bg5", "Rxc3", "Rxc3", "dxc3"],
      },
      {
        title: "Aron Nimzowitsch – Georg Salwe : coup 39",
        fen: "8/p7/1pbk1p2/8/1P1p3P/P2B4/5PP1/5K2 b - - 0 39",
        text: "La position est totalement gagnante pour Blanc (pion de plus, fou contre fou dans une finale largement supérieure) ; Salwe abandonne. Cette partie reste la reference historique du chapitre \\\"La chaîne de pions\\\" de Nimzowitsch : attaquer la base plutôt que la tête, et au besoin remplacer un pion tombe par une pièce qui occupe la même case-clé.",
      },
      {
        title: "Boris Spassky – Viktor Korchnoi, Korchnoi - Spassky Candidates Final 1977/78 1978",
        fen: "rnbqkbnr/pp3ppp/4p3/2ppP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4",
        text: "Même structure fondamentale que la partie Nimzowitsch-Salwe 1911 : chaînes verrouillées d4-e5 (Blanc) contre d5-e6 (Noir), et Noir attaque tout de suite la base blanche en d4.",
        moveSan: ["c3", "Nc6", "Nf3", "Bd7"],
      },
      {
        title: "Boris Spassky – Viktor Korchnoi : coup 7",
        fen: "r2qkb1r/pp1bnppp/2n1p3/2ppP3/3P4/N1P2N2/PP2BPPP/R1BQK2R b KQkq - 6 7",
        text: "Idée moderne : au lieu de défendre passivement d4 avec des pions, Blanc amene une pièce (le Cavalier via c2) pour renforcer la base tout en gardant les pions souples.",
        moveSan: ["cxd4", "cxd4", "Nf5", "Nc2"],
      },
      {
        title: "Boris Spassky – Viktor Korchnoi : coup 9",
        fen: "r2qkb1r/pp1b1ppp/4p3/3pPn2/1n1P4/5N2/PPN1BPPP/R1BQK2R w KQkq - 3 10",
        text: "Noir cible directement la base d4 avec toutes ses pièces plutôt que d'ouvrir immédiatement le jeu par un échange de pions.",
        moveSan: ["Ne3", "Nxe3", "fxe3", "Be7"],
      },
      {
        title: "Boris Spassky – Viktor Korchnoi : coup 13",
        fen: "r2qk2r/pp1bbppp/2n1p3/3pP3/1P1P4/P3PN2/4B1PP/R1BQK2R b KQkq - 0 13",
        text: "Blanc, la base d4 désormais solidement tenue, bascule vers sa propre expansion à l'aile dame - exactement le miroir du plan de Noir.",
        moveSan: ["a6", "Rb1", "Na7", "a4"],
      },
      {
        title: "Boris Spassky – Viktor Korchnoi : coup 20",
        fen: "r2q1r1k/1p1bb1pp/4pp2/pP1pP3/Pn1P4/4PNQ1/3BB1PP/1R3RK1 w - - 0 21",
        text: "A son tour, Noir attaque maintenant la tête de la chaîne blanche (le pion e5) par le levier thématique ...f6, exactement comme le prescrit la théorie de Nimzowitsch une fois que la base est hors d'atteinte.",
        moveSan: ["Rbc1", "f5", "h4", "Rc8"],
      },
      {
        title: "Boris Spassky – Viktor Korchnoi : coup 28",
        fen: "4br1k/1p2b1pp/1q2p3/pP1pPp1P/Pn1P2P1/4PN1Q/3BBK2/R7 b - - 0 28",
        text: "Course typique des deux chaînes de pions opposées : Blanc lance à son tour un assaut sur le roi noir à coups de pions (g4-g5-h5 déjà joue), pendant que la structure centrale reste verrouillee des deux côtés.",
        moveSan: ["g5", "hxg6", "Bxg6", "g5"],
      },
      {
        title: "Boris Spassky – Viktor Korchnoi : coup 30",
        fen: "5r1k/1p2b2p/1q2p1b1/pP1pP1P1/Pn1P1p2/4PN1Q/3BBK2/R7 w - - 0 31",
        text: "Noir riposte en poussant à son tour son propre pion f, cassant la tête de la chaîne blanche adverse (e3-e5 devenu vulnerable) au moment critique.",
        moveSan: ["exf4", "Nc2", "Rd1", "Be4"],
      },
      {
        title: "Boris Spassky – Viktor Korchnoi : coup 40",
        fen: "5r1k/1p5p/6bq/pP2P3/P1QP1b2/5N2/4BK2/6R1 w - - 4 41",
        text: "Les deux assauts opposés se sont finalement traduits par un chaos tactique ou c'est finalement Noir qui parvient à coordonner ses pièces contre le roi blanc exposé ; Spassky, matériel et position compromis, abandonne.",
        moveSan: ["Qc3"],
      },
    ],
  },
  "jh-module-9-la-minorite-d-attaque": {
    steps: [
      {
        title: "Lajos Portisch – Garry Kasparov, Skelleftea World Cup 1989",
        fen: "rnbqkb1r/pp3ppp/2p2n2/3p4/3P4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 6",
        text: "La structure Carlsbad classique est en place : Blanc a une majorité de pions à l'aile dame (a,b vs a) tandis que Noir a une majorité à l'aile roi (f,g,h vs f,g,h plus le pion d5 isolé d'un côté). Les deux plans thematiques vont s'affronter directement dans cette partie, contrairement à des démonstrations plus unilaterales du seul plan blanc.",
        moveSan: ["Qc2", "Na6", "a3", "Nc7"],
      },
      {
        title: "Lajos Portisch – Garry Kasparov : coup 13",
        fen: "r2q1rk1/ppn1bp1p/2p2np1/3p2B1/1P1P4/P1NQPN2/5PPP/R4RK1 b - - 0 13",
        text: "Le début classique de l'attaque de minorité : Blanc prépare b4-b5 pour faire exploser la structure de pions noire à l'aile dame.",
        moveSan: ["Ne4", "Bf4", "Nxc3", "Qxc3"],
      },
      {
        title: "Lajos Portisch – Garry Kasparov : coup 26",
        fen: "4r3/1p4kp/p1pnrp2/3p2pq/PP1P4/1Q1NP2P/5PP1/2R1R1K1 w - - 0 27",
        text: "Le signal de départ de la contre-attaque de majorité au roi : Kasparov lance désormais ses propres pions f et g vers l'avant, exactement comme Blanc pousse ses pions a et b de l'autre côté. La partie devient une véritable course entre les deux plans opposés.",
        moveSan: ["Qd1", "Qg6", "Qc2", "R6e7"],
      },
      {
        title: "Lajos Portisch – Garry Kasparov : coup 29",
        fen: "4r3/1p2r1k1/p1pn1pq1/3p2pp/PP1P4/3NP2P/2Q2PP1/2RR2K1 w - - 0 30",
        text: "Le rouleau compresseur des trois pions (f6-g5-h5) continue d'avancer inexorablement vers le roi blanc, pendant que Blanc n'a toujours pas réussi à jouer b4-b5.",
        moveSan: ["Qb1", "h4", "Qc2", "g4"],
      },
      {
        title: "Lajos Portisch – Garry Kasparov : coup 33",
        fen: "4r3/1p2r1k1/p1pn1p2/3p4/PP1P1N1p/4P1pP/2R2PP1/3R2K1 w - - 0 34",
        text: "Même après l'échange des Dames, la poussée de pions noire garde tout son venin : ce pion g3 fixe des faiblesses durables (f2/h3) dans le camp blanc et va servir de point d'appui pour l'infiltration des pièces noires dans la finale.",
        moveSan: ["Rd3", "Kh6", "Kf1", "Kg5"],
      },
      {
        title: "Lajos Portisch – Garry Kasparov : coup 62",
        fen: "8/8/2p2p2/1p1p1n1k/1N6/4K2P/8/8 w - - 2 63",
        text: "Kasparov gagne finalement la course : l'attaque de minorité blanche n'a jamais eu le temps de se concrétiser (b4-b5 n'a même jamais été joue), tandis que l'assaut de majorité noir à la fois créé des faiblesses durables et permis, via la finale de pièces legeres, de recolter tous les pions blancs. Portisch abandonne.",
      },
      {
        title: "Samuel Reshevsky – Lhamsuren Myagmarsuren, Sousse Interzonal 1967",
        fen: "rnbq1rk1/pp2bppp/2p2n2/3p2B1/3P4/2NBP3/PP3PPP/R2QK1NR w KQ - 0 8",
        text: "Structure Carlsbad classique. Contrairement aux parties ou Blanc mène son plan de minorité tout seul, cette partie illustre le cas ou Noir tente reellement de générer un jeu actif à l'aile roi, mais arrive trop tard dans la course.",
        moveSan: ["Qc2", "Nbd7", "Nf3", "Re8"],
      },
      {
        title: "Samuel Reshevsky – Lhamsuren Myagmarsuren : coup 12",
        fen: "r1bqrnk1/pp3ppp/2p2b2/3p4/1P1P4/2NBPN2/P1Q2PPP/R4RK1 b - - 0 12",
        text: "Le début du plan de minorité (b4-b5 à venir), exécute ici de manière très manuelle et methodique.",
        moveSan: ["Bg4", "Nd2", "Rc8", "Bf5"],
      },
      {
        title: "Samuel Reshevsky – Lhamsuren Myagmarsuren : coup 23",
        fen: "4r1k1/p4p1p/1ppqrnpb/3p4/PP1P4/2NQP2P/2R2PP1/1RN3K1 w - - 2 24",
        text: "Noir tente de reorienter ses pièces vers l'aile roi (Fou en h6, puis Cavalier vers h5) pour chercher une contre-attaque de majorité, mais ce plan reste trop lent : il n'y a pas encore de véritable poussée de pions f-g-h engagée.",
        moveSan: ["N1e2", "Nh5", "b5"],
      },
      {
        title: "Samuel Reshevsky – Lhamsuren Myagmarsuren : coup 25",
        fen: "4r1k1/p4p1p/1ppqr1pb/1P1p3n/P2P4/2NQP2P/2R1NPP1/1R4K1 b - - 0 25",
        text: "Blanc, lui, arrive au bout de son plan bien plus vite : b4-b5 est enfin joue, ouvrant les hostilites à l'aile dame avant que Noir n'ait pu lancer sa propre poussée de pions royale.",
        moveSan: ["Qd7", "bxc6", "Rxc6"],
      },
      {
        title: "Samuel Reshevsky – Lhamsuren Myagmarsuren : coup 26",
        fen: "4r1k1/p2q1p1p/1pr3pb/3p3n/P2P4/2NQP2P/2R1NPP1/1R4K1 w - - 0 27",
        text: "La base même de la contre-attaque de majorité noire (les pions f-g-h) n'a jamais eu le temps de bouger : pendant que Noir manoeuvrait ses pièces, Blanc a déjà converti son avantage structurel à l'aile dame.",
        moveSan: ["Qb5", "Rec8", "Rbc1", "R8c7"],
      },
      {
        title: "Samuel Reshevsky – Lhamsuren Myagmarsuren : coup 29",
        fen: "6k1/p1rq1p1p/1pr3pb/1Q1p3n/P2P2P1/2N1P2P/2R1NP2/2R3K1 b - - 0 29",
        text: "Ironie du sort : c'est finalement Blanc qui pousse en premier un pion du côté roi (g4), non pas pour attaquer mais pour chasser le Cavalier h5 et etouffer définitivement les dernières ambitions de contre-jeu noires.",
        moveSan: ["a6", "Qxa6", "Nf6", "Nxd5"],
      },
      {
        title: "Samuel Reshevsky – Lhamsuren Myagmarsuren : coup 31",
        fen: "6k1/2rq1p1p/Qpr2npb/3N4/P2P2P1/4P2P/2R1NP2/2R3K1 b - - 0 31",
        text: "Le coup décisif : ce coup tactique gagne un pion central et confirme que la course était perdue d'avancé pour Noir - son plan de majorité au roi n'a jamais dépassé le stade des preparatifs.",
        moveSan: ["Nxg4", "Rxc6", "Qxd5", "Qa8+"],
      },
      {
        title: "Samuel Reshevsky – Lhamsuren Myagmarsuren : coup 33",
        fen: "Q5k1/2r2p1p/1pR3pb/3q4/P2P2n1/4P2P/4NP2/2R3K1 b - - 1 33",
        text: "Noir abandonne : sa Dame est clouée et la Tour c6 blanche domine totalement la position. Cette partie illustre le revers de la medaille du thème : quand l'attaque de minorité est menée assez vite et assez précisément, la contre-attaque de majorité au roi peut tout simplement ne jamais avoir le temps d'exister.",
      },
      {
        title: "Jonathan David Tisdall – Evgeny Sveshnikov, Hastings 1977/78 1978",
        fen: "rnbqkb1r/pp3ppp/2p2n2/3p4/3P4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 6",
        text: "Structure Carlsbad issue de la Semi-Slave.",
        moveSan: ["Bg5", "Bf5", "e3", "Nbd7"],
      },
      {
        title: "Jonathan David Tisdall – Evgeny Sveshnikov : coup 16",
        fen: "r3rbk1/1p1n1ppp/2p1qn2/p2p4/1P1P4/P1N1PNB1/2Q2PPP/1R3RK1 b - - 0 16",
        text: "Le plan de minorité classique est lance.",
        moveSan: ["b5"],
      },
      {
        title: "Jonathan David Tisdall – Evgeny Sveshnikov : coup 16",
        fen: "r3rbk1/3n1ppp/2p1qn2/pp1p4/1P1P4/P1N1PNB1/2Q2PPP/1R3RK1 w - - 0 17",
        text: "Réponse energique de Sveshnikov : plutôt que d'attendre passivement b4-b5, Noir fixe lui-même la structure du côté dame et reoriente aussitôt son jeu vers une contre-attaque active par les pièces plutôt que par une poussée de pions.",
        moveSan: ["Ne2", "Nb6", "Nf4", "Qc8"],
      },
      {
        title: "Jonathan David Tisdall – Evgeny Sveshnikov : coup 19",
        fen: "r1q1rbk1/5ppp/2p2n2/pp1p4/1PnP4/P2NPNB1/2Q2PPP/1R3RK1 w - - 6 20",
        text: "Le Cavalier noir s'installe sur un avant-poste avancé (c4) et va servir de fer de lance à toute la contre-attaque : au lieu du classique assaut de pions f-g-h, c'est ici une invasion des pièces mineures qui joue le rôle de contre-jeu face au plan lent de Blanc.",
        moveSan: ["Ra1", "Ne4"],
      },
      {
        title: "Jonathan David Tisdall – Evgeny Sveshnikov : coup 20",
        fen: "r1q1rbk1/5ppp/2p5/pp1p4/1PnPn3/P2NPNB1/2Q2PPP/R4RK1 w - - 8 21",
        text: "Un second Cavalier vient s'installer sur un avant-poste tout aussi puissant (e4), et Noir contient totalement les ambitions positionnelles blanches en occupant simultanément les deux cases-clés du centre.",
        moveSan: ["Rfc1", "Re7", "a4", "Rea7"],
      },
      {
        title: "Jonathan David Tisdall – Evgeny Sveshnikov : coup 27",
        fen: "q4bk1/3N1ppp/8/1p1p4/2nPn3/3NP1B1/r1Q2PPP/2R3K1 w - - 4 28",
        text: "La contre-attaque noire atteint désormais directement les abords du roi et de la première rangée blanche : la Tour s'infiltre en a2 et les pièces noires convergent vers le camp blanc.",
        moveSan: ["Qb3", "Ra3", "Qb1", "Nc3"],
      },
      {
        title: "Jonathan David Tisdall – Evgeny Sveshnikov : coup 29",
        fen: "q4bk1/3N1ppp/8/1p1p4/2nP4/r1nNP1B1/5PPP/1QR3K1 w - - 8 30",
        text: "Le second Cavalier rejoint lui aussi l'assaut final, menacant de fourchettes décisives autour de la Dame et de la Tour blanches.",
        moveSan: ["Qc2", "b4", "Rf1", "Ra2"],
      },
      {
        title: "Jonathan David Tisdall – Evgeny Sveshnikov : coup 32",
        fen: "q4bk1/3N1ppp/8/3p4/1p1P4/1QnNP1B1/r2n1PPP/5RK1 w - - 4 33",
        text: "Coup final qui gagne la Dame ou la qualité par fourchette (menace sur la Dame b3 et la Tour f1) : la contre-attaque active de Noir, plus rapide et plus concrète que le plan de minorité blanc encore inacheve, décide totalement de la partie. Blanc abandonne.",
      },
    ],
  },
  "jh-module-12-les-finales-de-fous-de-couleurs-opposees": {
    steps: [
      {
        title: "Alexander Alekhine – Edward Lasker, New York 1924",
        fen: "4rrk1/2p3b1/n1b3p1/pP2pp1p/4n3/P1N2N2/2B3PP/R1B2R1K w - - 0 23",
        text: "Plutôt que de sauver son Fou de cases claires attaque par b5, Noir prefere lancer une combinaison tactique en prenant le pion e4.",
        moveSan: ["Nxe4", "fxe4", "bxc6"],
      },
      {
        title: "Alexander Alekhine – Edward Lasker : coup 24",
        fen: "4rrk1/2p3b1/n1P3p1/p3p2p/4p3/P4N2/2B3PP/R1B2R1K b - - 0 24",
        text: "Blanc empoche le Fou de cases claires noir : à partir de cet instant, la partie va inevitablement se diriger vers une finale de Fous de couleurs opposées (Blanc conserve ses deux Fous encore un moment, Noir ne garde plus que son Fou de cases noires, celui de g7).",
        moveSan: ["exf3", "Be4", "fxg2+", "Kxg2"],
      },
      {
        title: "Alexander Alekhine – Edward Lasker : coup 48",
        fen: "6k1/8/8/2b1p2p/3BB3/8/R6r/4K3 b - - 0 48",
        text: "Le Fou de cases noires blanc (celui developpe en dernier, via Be3-Bg5-Bc1-Bb2) capture le Cavalier noir : c'est désormais le dernier Fou noir restant (Bc5, cases noires) qui va devoir affronter seul le dernier Fou blanc restant (case claire) dans la finale.",
        moveSan: ["Bb4+", "Kf1", "Rxa2", "Bd5+"],
      },
      {
        title: "Alexander Alekhine – Edward Lasker : coup 51",
        fen: "5k2/8/8/7p/1b1p4/8/B7/5K2 w - - 0 52",
        text: "Le pion noir recapture le Fou de cases noires blanc sur d4 : la position est désormais reduite a Roi + Fou de cases claires + pions blancs contre Roi + Fou de cases noires + pions noirs, la definition même d'une finale de Fous de couleurs opposées. Malgré des pions eparpilles sur les deux ailes (a, d, h...), aucun camp ne peut forcer le gain : le Fou defenseur peut toujours se sacrifier ou bloquer une case clé que l'autre Fou ne controle pas.",
        moveSan: ["Bb1", "Kg7", "Kg2"],
      },
      {
        title: "Alexander Alekhine – Edward Lasker : coup 53",
        fen: "8/6k1/8/7p/1b1p4/8/6K1/1B6 b - - 3 53",
        text: "Position typique de forteresse : les pions restants sont trop eloignes les uns des autres pour que le camp en theorique avantage matériel puisse percer, exactement le phenomene decrit par la théorie des finales de Fous de couleurs opposées. Les deux joueurs conviennent du nul.",
      },
      {
        title: "Alexander Kotov – Mikhail Botvinnik, USSR Championship 1955",
        fen: "r1br2k1/pp2qppp/5n2/3p4/N2b1P2/1P1QP3/P1RB2PP/5RK1 w - - 0 19",
        text: "L'échange décisif pour la structure de la finale : le Fou de cases noires noir capture le Cavalier blanc en d4.",
        moveSan: ["Qxd4", "Bf5", "Bb4", "Qd7"],
      },
      {
        title: "Alexander Kotov – Mikhail Botvinnik : coup 25",
        fen: "r2r2k1/p2q2pp/1p3p2/3p4/1B1QbP2/1PR1P3/P5PP/3R2K1 w - - 1 26",
        text: "A partir d'ici, Noir ne conserve que son Fou de cases claires (celui de c8, passé par f5 puis e4), tandis que Blanc ne conserve que son Fou de cases noires (celui de d2, passé par b4) : la finale de Fous de couleurs opposées est définitivement fixee, avec des pions sur les deux ailes de chaque côté.",
        moveSan: ["Qd2", "Qg4", "h3", "Qg6"],
      },
      {
        title: "Alexander Kotov – Mikhail Botvinnik : coup 59",
        fen: "8/8/4b1p1/2Bp3p/5P1P/1pK1Pk2/8/8 b - - 3 59",
        text: "La finale de pièces legeres pures est atteinte : Fou de cases claires + pions noirs eparpilles sur les deux ailes (b3, d5, f-g-h) contre Fou de cases noires + pions blancs. Selon la théorie, une telle position devrait offrir des chances de nulle à Blanc grâce au Fou \\\"de la mauvaise couleur\\\" defensif.",
        moveSan: ["g5"],
      },
      {
        title: "Alexander Kotov – Mikhail Botvinnik : coup 59",
        fen: "8/8/4b3/2Bp2pp/5P1P/1pK1Pk2/8/8 w - - 0 60",
        text: "Le coup célèbre (connu dans les analyses classiques sous la forme \\\"...g5!!\\\") : Botvinnik sacrifie ce pion pour ouvrir des lignes et faire progresser son pion d passé, exploitant le fait qu'un seul Fou ne peut jamais contrôler les deux couleurs de cases à la fois.",
        moveSan: ["fxg5", "d4+"],
      },
      {
        title: "Alexander Kotov – Mikhail Botvinnik : coup 60",
        fen: "8/8/4b3/2B3Pp/3p3P/1pK1Pk2/8/8 w - - 0 61",
        text: "Le second sacrifice de la combinaison (\\\"...d4+!\\\") : ce pion d passé, désormais soutenu par le Roi noir, va decider de la partie.",
        moveSan: ["exd4", "Kg3"],
      },
      {
        title: "Alexander Kotov – Mikhail Botvinnik : coup 61",
        fen: "8/8/4b3/2B3Pp/3P3P/1pK3k1/8/8 w - - 1 62",
        text: "Le Roi noir s'infiltre de facon décisive pendant que le Fou blanc, seul, ne peut à la fois arrêter le pion h et empêcher l'invasion du Roi.",
        moveSan: ["Ba3", "Kxh4", "Kd3", "Kxg5"],
      },
      {
        title: "Alexander Kotov – Mikhail Botvinnik : coup 65",
        fen: "8/8/8/3b2k1/3P3p/Bp3K2/8/8 w - - 2 66",
        text: "Blanc abandonne : le pion h va promouvoir. Cette partie illustre l'autre face du thème : quand les pions passes sont suffisamment eloignes l'un de l'autre (ici les ailes dame et roi) et que le Roi peut activement les soutenir, même une finale de Fous de couleurs opposées devient parfaitement gagnante.",
      },
      {
        title: "Bojan Kurajica – Anatoly Karpov, Skopje 1976",
        fen: "r1bqkb1r/1pp2ppp/p1p2n2/4p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 6",
        text: "Blanc échange d'emblee son Fou de cases claires contre le Cavalier : Noir se retrouve donc, des la sortie de l'ouverture, avec la garantie de conserver son propre Fou de cases claires plus longtemps que Blanc son Fou de cases noires, un thème qui va determiner toute la suite.",
        moveSan: ["Nc3", "Bd6", "d4", "Bb4"],
      },
      {
        title: "Bojan Kurajica – Anatoly Karpov : coup 9",
        fen: "r1bqk2r/1pp2ppp/p1p5/4N3/3Pn3/2b5/PPP2PPP/R1BQ1RK1 w kq - 0 10",
        text: "Le second échange de Fous : Noir cède maintenant son Fou de cases noires contre le Cavalier blanc.",
        moveSan: ["bxc3", "O-O", "Ba3", "Nd6"],
      },
      {
        title: "Bojan Kurajica – Anatoly Karpov : coup 15",
        fen: "r2qr1k1/1pp3pp/p1p2p2/5b2/2PP4/B7/P1P2PPP/R2Q1RK1 w - - 0 16",
        text: "Désormais chaque camp ne possede plus qu'un seul Fou, et ils sont de couleurs opposées : Blanc garde le Fou de cases noires (developpe en a3), Noir garde le Fou de cases claires (c8-f5). Matériel egal, mais Karpov va montrer qu'une position supérieure suffit à gagner malgré la reputation de nullite de ce type de finale.",
        moveSan: ["Qd2", "Be6", "Qc3", "Qd7"],
      },
      {
        title: "Bojan Kurajica – Anatoly Karpov : coup 33",
        fen: "6k1/2p3p1/2p2p2/2Pb4/p2P3p/B2P1P2/5KPP/8 w - - 0 34",
        text: "Karpov simplifie méthodiquement vers une finale de Fous purs à deux pions passés bien séparés : Noir aura un pion passé à l'aile dame (a4) et une majorité de pions à l'aile roi (f-g-h contre f-g), exactement le type de configuration où, selon la théorie, le camp fort peut espérer gagner malgré les Fous de couleurs opposées si le Fou adverse ne peut contrôler les deux ailes à la fois.",
        moveSan: ["g3", "Kf7", "Ke3", "f5"],
      },
      {
        title: "Bojan Kurajica – Anatoly Karpov : coup 53",
        fen: "8/8/2p5/2Pp4/p2Pb1kp/8/1B3K1P/8 w - - 0 54",
        text: "Le pion passé a4, laisse pratiquement livre à lui-même à l'aile dame, va bientot commencer sa course pendant que le Roi et le Fou noirs dominent totalement l'aile roi : le Fou blanc, seul, ne peut pas être partout.",
        moveSan: ["Bc1", "Kh3", "Kg1", "Bg6"],
      },
      {
        title: "Bojan Kurajica – Anatoly Karpov : coup 57",
        fen: "8/8/2p5/2Pp4/p2P3p/7k/7P/2Bb2K1 w - - 8 58",
        text: "Zugzwang final : le Fou blanc ne peut plus bouger sans perdre davantage de terrain, et le Roi blanc est totalement paralyse dans le coin. Blanc abandonne : une démonstration devenue célèbre (analysee ensuite comme « enigme de finale » par Karsten Muller) de la facon dont un avantage positionnel suffisant, avec des pions passes sur des ailes opposées, permet de vaincre la tendance au nul des Fous de couleurs opposées.",
      },
    ],
  },
  "pm-cavalier-contre-fou-qui-domine": {
    steps: [
      {
        title: "Magnus Carlsen – Dmitry Jakovenko, Dortmund Sparkassen 2009",
        fen: "r1bk1b1r/ppp2ppp/2p5/4Pn2/8/5N2/PPP2PPP/RNB2RK1 w - - 0 9",
        text: "Le fameux « mur de Berlin » : Dame échangée dès le 8e coup, roi noir contraint à se déplacer, mais surtout Blanc vient d'échanger son Fou contre le Cavalier c6 noir. Noir se retrouve avec des pions doublés (c6 et c7) et sans Fou de cases claires pour les défendre, tandis que Blanc conservera un Cavalier. C'est la naissance de la lutte Cavalier contre Fou qui va dominer toute la fin de partie.",
        moveSan: ["Nc3", "Ke8", "h3", "h5"],
      },
      {
        title: "Magnus Carlsen – Dmitry Jakovenko : coup 24",
        fen: "8/1pp1kp2/2p1b1p1/rr2P2p/p2R1N1P/P1P2P2/1P2R1P1/6K1 w - - 5 25",
        text: "Position typique de finale Cavalier contre Fou : les pions noirs a4, c6 et c7 sont figés sur des cases où le Cavalier blanc pourra les attaquer depuis plusieurs angles, alors que le Fou noir, seul, ne peut surveiller qu'une seule couleur de case à la fois et doit courir d'un bout à l'autre de l'échiquier pour défendre les deux ailes.",
        moveSan: ["Kf2", "Rxe5", "Rxe5", "Rxe5"],
      },
      {
        title: "Magnus Carlsen – Dmitry Jakovenko : coup 43",
        fen: "8/2p2p2/p1N1k2P/8/1P6/P3K3/8/5b2 b - - 0 43",
        text: "Le pion h passé devient imparable : le Cavalier blanc, contrairement au Fou noir, peut à la fois soutenir sa propre poussée de pion ET continuer à harceler les faiblesses noires (a6, f7) — démonstration classique de la supériorité du Cavalier quand les pions adverses sont fixés sur les deux ailes.",
        moveSan: ["Kf6", "Ne5", "Bb5", "Kd4"],
      },
      {
        title: "Magnus Carlsen – Dmitry Jakovenko : coup 49",
        fen: "8/2p5/p3N1k1/8/bP1K4/P7/8/8 b - - 3 49",
        text: "Le Cavalier, en une seule manœuvre, vient de gober le pion f7 et fourchette maintenant les débris de la position noire ; le Fou, condamné à l'inactivité sur une seule diagonale, n'a jamais pu empêcher cette double action. Noir abandonne, sans pièces ni pions suffisants pour résister.",
      },
      {
        title: "Robert James Fischer – Mark Taimanov, Fischer - Taimanov Candidates Quarterfinal 1971",
        fen: "7r/1p1k1pp1/p4n1p/2p5/4RP2/6P1/PPP3BP/6K1 w - - 0 24",
        text: "La finale de pièces mineures apparaît : Fou blanc (fianchetto, cases claires) contre Cavalier noir, avec des pions noirs c5/a6 déjà fixés sur l'aile dame.",
        moveSan: ["Re5", "b6", "Bf1", "a5"],
      },
      {
        title: "Robert James Fischer – Mark Taimanov : coup 45",
        fen: "8/4n3/1p1k2p1/pBp2p1p/P4P1P/2PK2P1/1P6/8 w - - 2 46",
        text: "Après l'échange des Tours, le Cavalier noir doit à lui seul surveiller les deux ailes du plateau — une tâche que le Fou blanc, capable de sauter d'une aile à l'autre en un coup, remplit bien plus facilement.",
        moveSan: ["Be8", "Kd5", "Bf7+", "Kd6"],
      },
      {
        title: "Robert James Fischer – Mark Taimanov : coup 62",
        fen: "3k4/4n3/Kp4B1/p1p2p1p/P4P1P/2P3P1/1P6/8 b - - 0 62",
        text: "Le sacrifice thématique : après trente coups de domination silencieuse, Fischer convertit enfin l'avantage positionnel en gain matériel décisif — le Cavalier ne pouvait défendre le pion g6 sans abandonner l'aile dame.",
        moveSan: ["Nxg6", "Kxb6", "Kd7", "Kxc5"],
      },
      {
        title: "Robert James Fischer – Mark Taimanov : coup 71",
        fen: "1k6/8/1PK5/P4p1p/4nP1P/6P1/8/8 b - - 0 71",
        text: "Le pion b, désormais imparable et hors d'atteinte du Cavalier isolé, décide la partie.",
      },
      {
        title: "Veselin Topalov – Vladimir Kramnik, Kramnik - Topalov World Championship Match 2006",
        fen: "rn1qkb1r/pp3pp1/2p1pnp1/3p4/2PP4/2N1P3/PP3PPP/R1BQKB1R w KQkq - 0 8",
        text: "Coup-clé pour le thème : Blanc échange volontairement son propre Cavalier contre le Fou clair noir. Il conserve ainsi ses deux Fous pour la suite de la partie, pendant que Noir devra se contenter de pièces mineures moins harmonieuses (deux Cavaliers) dans une position qui va s'ouvrir.",
        moveSan: ["a3", "Nbd7", "g3", "Be7"],
      },
      {
        title: "Veselin Topalov – Vladimir Kramnik : coup 28",
        fen: "1n1rrnk1/pq3pp1/2p3p1/4P3/1b1P3P/2N2BP1/1PQ5/3R1RBK w - - 3 29",
        text: "La position s'est nettement ouverte : centre liquidé, colonnes semi-ouvertes, Rois en présence de pièces actives des deux côtés. C'est précisément le type de position où la paire de Fous doit démontrer sa supériorité sur les Cavaliers noirs, encore mal coordonnés.",
        moveSan: ["Qg2", "Qc8", "Rc1", "Bxc3"],
      },
      {
        title: "Veselin Topalov – Vladimir Kramnik : coup 31",
        fen: "1nqrrnk1/p4pp1/2p3p1/4P3/3P3P/2P2BP1/6Q1/2R2RBK b - - 0 31",
        text: "Dernier échange décisif du thème : le second Fou noir disparaît contre le second Cavalier blanc. Il ne reste donc plus sur l'échiquier QUE des Fous du côté blanc et QUE des Cavaliers du côté noir — la confrontation Fou contre Cavalier est désormais totale et va trancher la partie.",
        moveSan: ["Ne6", "Bg4", "Qc7", "Rcd1"],
      },
      {
        title: "Veselin Topalov – Vladimir Kramnik : coup 38",
        fen: "3r2k1/p1q1rRpn/1np3p1/4P3/3P2BP/2P1B1P1/Q7/5R1K b - - 0 38",
        text: "L'infiltration décisive : les deux Fous blancs, actifs sur des diagonales complémentaires (g4 et e3), dominent totalement des Cavaliers noirs relégués à la défense passive et incapables de coordonner une contre-attaque.",
        moveSan: ["Nd5", "R7f3"],
      },
    ],
  },
  "pm-les-pions-pendants": {
    steps: [
      {
        title: "Ossip Bernstein – Jose Raul Capablanca, Capablanca - Bernstein Match 1914",
        fen: "r2q1rk1/p3bppp/Q4n2/2pp4/8/2N1PN2/PP3PPP/2R1K2R w K - 0 14",
        text: "Les pions pendants c5 et d5 sont nés : deux pions adjacents, isolés de tout autre pion, séparés par une seule colonne libre entre eux. Ils sont une arme à double tranchant, ni faiblesse ni force en soi — tout dépendra de qui contrôle le rythme des événements.",
        moveSan: ["O-O", "Qb6", "Qe2", "c4"],
      },
      {
        title: "Ossip Bernstein – Jose Raul Capablanca : coup 15",
        fen: "r4rk1/p3bppp/1q3n2/3p4/2p5/2N1PN2/PP2QPPP/2R2RK1 w - - 0 16",
        text: "La démonstration classique de la force DYNAMIQUE des pions pendants : plutôt que de rester statiques et défendables, Capablanca les fait avancer. Ce coup gagne de l'espace, chasse les pièces blanches et transforme le doublet en un puissant duo offensif — bien loin d'une faiblesse.",
        moveSan: ["Rfd1", "Rfd8", "Nd4", "Bb4"],
      },
      {
        title: "Ossip Bernstein – Jose Raul Capablanca : coup 22",
        fen: "2rr2k1/p4ppp/1q6/3n4/3N4/2p1P3/P1R1QPPP/3R2K1 w - - 0 23",
        text: "Le pion pendant qui a le plus avancé (c4-c3) devient maintenant un pion passé très avancé, protégé et terriblement gênant : il cloue la Tour blanche à sa surveillance et prépare l'infiltration finale des pièces noires.",
        moveSan: ["Rdc1", "Rc5", "Nb3", "Rc6"],
      },
      {
        title: "Ossip Bernstein – Jose Raul Capablanca : coup 29",
        fen: "3r2k1/p4ppp/8/8/8/2R1P3/Pq2QPPP/6K1 w - - 1 30",
        text: "Le sacrifice final du pion c3 a ouvert toutes les lignes nécessaires à l'infiltration décisive de la Dame noire ; les pions pendants ont rempli leur rôle offensif jusqu'au bout. Blanc abandonne, sans parade satisfaisante face aux menaces combinées sur la 1e/2e rangée.",
      },
      {
        title: "Tigran Petrosian – Efim Geller, Amsterdam Candidates 1956",
        fen: "r1b2rk1/p3bppp/1qp2n2/3p4/5B2/2N3P1/PP2PPBP/R2Q1RK1 w - - 0 12",
        text: "De nouveau les pions pendants noirs c6-d5 apparaissent après l'échange des Cavaliers. Petrosian, spécialiste de la lente asphyxie positionnelle, va démontrer sur près de 150 coups la faiblesse à long terme de ce doublet dès que le camp adverse contrôle patiemment le jeu de pièces.",
        moveSan: ["Qc2", "Be6", "Be3", "Qa5"],
      },
      {
        title: "Tigran Petrosian – Efim Geller : coup 23",
        fen: "r3r1k1/p4ppp/1np5/2Np1b2/8/1P2P1P1/PR3PBP/R5K1 b - - 2 23",
        text: "Le Cavalier s'installe sur l'avant-poste c5, juste devant les pions pendants : de là il les surveille en permanence et empêche toute activité, condamnant Noir à une défense purement passive.",
        moveSan: ["Rec8", "Rc1", "a5", "e4"],
      },
      {
        title: "Tigran Petrosian – Efim Geller : coup 25",
        fen: "r1r3k1/5ppp/1np5/p1Np1b2/4P3/1P4P1/PR3PBP/2R3K1 b - - 0 25",
        text: "Petrosian ouvre le jeu au centre pour son propre profit alors que les pions pendants noirs restent des cibles fixes incapables de bouger sans s'affaiblir davantage.",
        moveSan: ["Bg6", "f4", "f6", "Bh3"],
      },
      {
        title: "Tigran Petrosian – Efim Geller : coup 46",
        fen: "2n5/2k3pp/P1N5/2Kp4/P7/6Pb/4B2P/8 b - - 0 46",
        text: "Après des dizaines de coups de manœuvres patientes, le pion c6, dernière faiblesse structurelle issue des pions pendants initiaux, tombe enfin — Petrosian n'a fait que confirmer méthodiquement, sur toute la durée de la partie, que ce doublet de pions ne pouvait être défendu indéfiniment sans pièces actives.",
        moveSan: ["Nb6", "Bb5", "Nd7+", "Kxd5"],
      },
      {
        title: "Tigran Petrosian – Efim Geller : coup 73",
        fen: "8/4n2p/1k2K3/6PP/8/8/8/8 b - - 3 73",
        text: "Les pions passés blancs (h et g) sont désormais indéfendables pour le seul Cavalier noir ; Noir abandonne, clôturant l'une des démonstrations techniques les plus longues et les plus pures de l'histoire du jeu contre les pions pendants.",
      },
      {
        title: "Akiba Rubinstein – Georg Salwe, Lodz 1908",
        fen: "r1b1kb1r/p4ppp/1qp2n2/3p4/8/2N3P1/PP2PPBP/R1BQK2R w KQkq - 0 10",
        text: "Les pions pendants noirs c6 et d5 apparaissent, mais cette fois affaiblis d'entrée : la case c5 devient un poste idéal pour une pièce blanche, et les deux pions ne peuvent être défendus que par des pièces (jamais par d'autres pions). Tout le plan de Rubinstein va consister à cibler méthodiquement ce doublet.",
        moveSan: ["O-O", "Be7", "Na4", "Qb5"],
      },
      {
        title: "Akiba Rubinstein – Georg Salwe : coup 15",
        fen: "r4rk1/p3bppp/2p1bn2/1qBp4/N7/5PP1/PP2P1BP/2RQ1RK1 b - - 2 15",
        text: "Le Fou s'installe précisément sur la case-clé libérée par l'échange des Cavaliers, attaquant directement la pièce qui défend le complexe c6-d5 et préparant l'échange des ultimes défenseurs noirs.",
        moveSan: ["Rfe8", "Rf2", "Nd7", "Bxe7"],
      },
      {
        title: "Akiba Rubinstein – Georg Salwe : coup 27",
        fen: "1r4k1/r4ppp/pqR1b3/R2p4/1P1Q4/P3PPP1/7P/5BK1 b - - 0 27",
        text: "Après avoir échangé toutes les pièces qui pouvaient défendre les pions pendants, Rubinstein récolte enfin le fruit de son plan : le pion c6 tombe, laissant Noir avec un pion d5 isolé et condamné, exactement la finalité recherchée contre une paire de pions pendants mal soutenue.",
        moveSan: ["Qxc6", "Qxa7", "Ra8", "Qc5"],
      },
      {
        title: "Akiba Rubinstein – Georg Salwe : coup 37",
        fen: "1q4k1/2R2p2/1P1Qb1p1/r2p3p/p6P/P3PPP1/4BK2/8 w - - 1 38",
        text: "La technique se transforme en course de pions : le pion b, soutenu par la Tour à la 7e rangée, devient imparable.",
        moveSan: ["b7"],
      },
      {
        title: "Akiba Rubinstein – Georg Salwe : coup 38",
        fen: "1q4k1/1PR2p2/3Qb1p1/r2p3p/p6P/P3PPP1/4BK2/8 b - - 0 38",
        text: "Le pion promeut au coup suivant, aucune parade possible.",
      },
    ],
  },
  "pm-doubler-les-pions-adverses": {
    steps: [
      {
        title: "Robert James Fischer – Wolfgang Unzicker, Siegen ol (Men) fin-A 1970",
        fen: "r1bqkbnr/1ppp1ppp/p1B5/4p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4",
        text: "Même plan que Lasker en 1914, mais avec 56 ans de raffinement technique en plus : Fischer double les pions c noirs puis, plutôt qu'une lente manœuvre de finale, choisit une expansion rapide au centre et à l'aile roi pour exploiter dynamiquement la faiblesse.",
        moveSan: ["dxc6", "O-O", "f6", "d4"],
      },
      {
        title: "Robert James Fischer – Wolfgang Unzicker : coup 14",
        fen: "r1bq1rk1/1pp3pp/p1pb1p2/5P2/3NP3/3QB3/PPP3PP/R4RK1 b - - 0 14",
        text: "La poussée thématique de la Ruy Lopez d'échange version Fischer : au lieu de chercher à créer un pion passé (impossible, les pions c noirs étant doublés), Blanc utilise son avantage d'espace pour lancer une attaque directe.",
        moveSan: ["Qe7", "Bf4", "Bxf4", "Rxf4"],
      },
      {
        title: "Robert James Fischer – Wolfgang Unzicker : coup 31",
        fen: "2b5/1pp1r1pk/p4qNp/2p2P2/2Q3PP/2P5/PP2R3/6K1 b - - 8 31",
        text: "Le Cavalier s'infiltre au cœur de la position noire, profitant de ce que les pions c doublés ne peuvent générer aucun contre-jeu sur l'aile dame pour compenser.",
        moveSan: ["Rxe2", "Qxe2", "Bd7", "Qe7"],
      },
      {
        title: "Robert James Fischer – Wolfgang Unzicker : coup 42",
        fen: "8/1p1N2k1/p7/5Pp1/2p3P1/2P3K1/PP6/3b4 b - - 1 42",
        text: "Le Cavalier blanc, seul maître du plateau face à une structure noire toujours marquée par les pions doublés du coup 4, décide la partie en finale.",
      },
      {
        title: "Paul F Johner – Aron Nimzowitsch, Dresden 1926",
        fen: "r1bq1rk1/pp1p1ppp/2n1pn2/2p5/2PP4/2bBPN2/PP3PPP/R1BQ1RK1 w - - 0 8",
        text: "Mécanisme inverse des parties Lasker-Capablanca et Fischer-Unzicker : ici c'est Noir qui sacrifie sa paire de Fous pour doubler les pions adverses, selon l'idée maîtresse de la Nimzo-indienne que Nimzowitsch a lui-même théorisée.",
        moveSan: ["bxc3", "d6", "Nd2", "b6"],
      },
      {
        title: "Paul F Johner – Aron Nimzowitsch : coup 24",
        fen: "2r3rk/3b1p1q/1p1p1n1n/p1pP2pp/P1P1pP2/2P1P1PP/3N2BK/R1B1Q1R1 w - - 0 25",
        text: "Les pions c3/c4 doublés et le complexe de cases noires qui les entoure restent une faiblesse chronique tout au long de la partie ; Nimzowitsch peut désormais lancer sans crainte une attaque de pions à l'aile roi.",
        moveSan: ["Nf1", "Rg7", "Ra2", "Nf5"],
      },
      {
        title: "Paul F Johner – Aron Nimzowitsch : coup 33",
        fen: "6rk/5prq/1p1p1n2/p1pP3p/P1P1pP1n/2P1R1Pb/2Q4K/2B2NRB w - - 0 34",
        text: "Le Fou noir s'engouffre par les cases noires affaiblies autour du Roi blanc — conséquence directe de la structure de pions compromise depuis le coup 8.",
        moveSan: ["Bxe4", "Bf5", "Bxf5", "Nxf5"],
      },
      {
        title: "Paul F Johner – Aron Nimzowitsch : coup 40",
        fen: "4r2k/5pr1/1p1p1n2/p1pP4/P1P2P1n/2P1N1pq/2Q1R1R1/2B2K2 w - - 6 41",
        text: "La combinaison finale des pièces noires autour du Roi blanc, rendue possible par la faiblesse structurelle initiée par les pions doublés, force l'abandon quelques coups plus tard.",
      },
      {
        title: "Emanuel Lasker – Jose Raul Capablanca, St. Petersburg 1914",
        fen: "r1bqkbnr/1ppp1ppp/p1B5/4p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4",
        text: "Le coup fondateur du thème : Lasker échange son Fou contre le Cavalier pour doubler définitivement les pions c de Noir. En contrepartie Noir garde la paire de Fous, mais Lasker mise sur le très long terme — c'est la première grande démonstration de ce plan, qui inspirera toute une école (notamment Fischer, cf. le thème « Fischer contre Unzicker » dans cette même bibliothèque).",
        moveSan: ["dxc6", "d4", "exd4", "Qxd4"],
      },
      {
        title: "Emanuel Lasker – Jose Raul Capablanca : coup 14",
        fen: "r3r1k1/1b2n1pp/pppp1p2/5P2/4P3/1NN5/PPP3PP/R4RK1 w - - 0 15",
        text: "Les pions c doublés de Noir (c6/c7 à l'origine) sont maintenant fixés en c6 et d6 : ils ne peuvent plus jamais former un pion passé efficace, et constitueront une faiblesse structurelle pour toute la finale.",
        moveSan: ["Nd4", "Rad8", "Ne6", "Rd7"],
      },
      {
        title: "Emanuel Lasker – Jose Raul Capablanca : coup 35",
        fen: "4k1r1/1b1r4/1nppNp2/1p2PPp1/1P4P1/2N3KR/2P5/7R b - - 0 35",
        text: "Trente et un coups après le coup d'échange initial, la faiblesse structurelle finit par se concrétiser : Blanc ouvre définitivement les lignes vers le Roi noir, paralysé par ses propres pions doublés incapables de fournir un contre-jeu central.",
        moveSan: ["dxe5", "Ne4", "Nd5", "N6c5"],
      },
      {
        title: "Emanuel Lasker – Jose Raul Capablanca : coup 42",
        fen: "R1bk1r2/7R/2p2p2/1pNnpPp1/1P4P1/6K1/2P5/8 b - - 7 42",
        text: "Les Tours blanches, infiltrées sur la 7e et la 8e rangée, paralysent totalement les pièces noires ; Capablanca abandonne, écrasé par le plan initié trente-huit coups plus tôt.",
      },
    ],
  },
  "pm-le-pion-passe-protege": {
    steps: [
      {
        title: "Levon Aronian – Viswanathan Anand, Morelia-Linares 2007",
        fen: "r3r1k1/1p1n1ppp/2pB1nb1/1p1Pp3/4P2P/2N5/PP3PBP/3RR1K1 b - - 0 19",
        text: "Le pion d, soutenu par le pion e4, devient un pion passé protégé dès ce 19e coup : il ne peut être capturé par aucun pion noir et va progressivement avancer, soutenu, jusqu'à la fin de la partie.",
        moveSan: ["Nh5", "Bf1", "f6", "b3"],
      },
      {
        title: "Levon Aronian – Viswanathan Anand : coup 31",
        fen: "r1r3k1/1p2Bbpp/3P1pn1/1B2p3/P6P/8/5P1P/1R1R2K1 b - - 0 31",
        text: "Le pion d, toujours protégé, s'enfonce encore plus profondément dans le camp noir, immobilisant totalement la coordination des pièces adverses.",
        moveSan: ["Nxe7", "Bd7", "Nc6", "Rxb7"],
      },
      {
        title: "Levon Aronian – Viswanathan Anand : coup 37",
        fen: "1R2brk1/6pp/3P1p2/P3p3/3n3P/8/5P1P/1R4K1 b - - 0 37",
        text: "Un second pion passé, cette fois sur l'aile a, se met en marche à son tour : les deux pions passés connectés a et d, en avançant de concert, débordent complètement les défenses noires — l'exemple même de la force décisive d'une paire de pions passés soutenus.",
        moveSan: ["Nf3+", "Kf1", "Nd2+", "Ke1"],
      },
      {
        title: "Levon Aronian – Viswanathan Anand : coup 44",
        fen: "Q4R2/3k2pp/2b2p2/4p3/7P/8/5P1P/1n2K3 b - - 0 44",
        text: "Le pion a atteint la 8e case en premier et promeut ; Blanc obtient une Dame supplémentaire et la partie est décidée.",
        moveSan: ["Bxa8", "Rxa8", "h5", "Ra7+"],
      },
      {
        title: "Robert James Fischer – Tigran Vartanovich Petrosian, Fischer - Petrosian Candidates Final 1971",
        fen: "r1bqkbnr/3p1ppp/p1p1p3/8/4P3/3B4/PPP2PPP/RNBQK2R w KQkq - 0 7",
        text: "Après cet échange, Noir n'a plus qu'un seul pion à l'aile dame (a6), alors que Blanc en garde deux (a2 et, bientôt, b4) : une majorité de pions 2 contre 1 qui, à terme, peut produire un pion passé protégé sur cette aile.",
        moveSan: ["O-O", "d5", "c4", "Nf6"],
      },
      {
        title: "Robert James Fischer – Tigran Vartanovich Petrosian : coup 18",
        fen: "r5k1/4rppp/p3bn2/3p4/NP6/3B4/P4PPP/R3R1K1 b - - 0 18",
        text: "La majorité de pions à l'aile dame prend forme : ce pion b4, à terme soutenu par a2-a3 ou par un Cavalier en c5, est la ressource positionnelle durable sur laquelle Fischer va appuyer toute la fin de partie — Petrosian, pourtant l'un des plus grands défenseurs de l'histoire, ne trouvera jamais de contre-jeu suffisant.",
        moveSan: ["Kf8", "Nc5", "Bc8", "f3"],
      },
      {
        title: "Robert James Fischer – Tigran Vartanovich Petrosian : coup 34",
        fen: "r3k3/1R3R2/p2r2p1/5p2/1PBp1n1p/8/P2K2PP/8 b - - 1 34",
        text: "Les deux Tours blanches infiltrées sur la 7e rangée, combinées à la menace toujours présente du pion passé protégé potentiel à l'aile dame, laissent Petrosian sans aucune ressource : il abandonne.",
      },
      {
        title: "Vladimir Kramnik – Alexey Shirov, Tilburg Fontys 1997",
        fen: "r2q1rk1/ppp1n2p/3pPbp1/5p2/1PP1Pp2/2N5/P3BPPP/2RQR1K1 b - - 0 15",
        text: "Le pion d de Blanc s'engouffre en territoire noir. Protégé temporairement par la pression sur la case e6, il devient un formidable clou qui immobilise les pièces noires bien avant même d'être un pion passé « classique » sur une colonne ouverte.",
        moveSan: ["Bxc3", "Rxc3", "fxe4", "Bf1"],
      },
      {
        title: "Vladimir Kramnik – Alexey Shirov : coup 25",
        fen: "r4rk1/pp2nR1p/4P1p1/2Qp2q1/1P6/8/P5PP/4RBK1 b - - 7 25",
        text: "Le pion e6, désormais soutenu par la Tour f7, écrase littéralement la position noire : il ne peut être capturé sans perdre la Tour, et sa seule présence paralyse la défense noire sur la dernière rangée.",
        moveSan: ["Rxf7", "exf7+", "Kxf7", "Qc7"],
      },
      {
        title: "Vladimir Kramnik – Alexey Shirov : coup 36",
        fen: "4rk2/4n2p/6p1/8/3Q4/P3R1P1/4B1KP/2q5 b - - 2 36",
        text: "Le pion avancé e6, en clouant durablement la position noire pendant une dizaine de coups, a offert à Kramnik le temps nécessaire pour récolter tous les pions faibles noirs (b7, a7) et emporter la partie.",
      },
    ],
  },
  "pm-la-colonne-ouverte": {
    steps: [
      {
        title: "Alexander Alekhine – Aron Nimzowitsch, San Remo 1930",
        fen: "r4rk1/pb1qnppp/1pn1p3/1N1pP3/PP1P1P2/5N2/3Q2PP/R3KB1R w KQ - 1 14",
        text: "La colonne c est désormais totalement ouverte : plus aucun pion, blanc ou noir, ne s'y trouve. Alekhine va y masser progressivement toutes ses pièces lourdes.",
        moveSan: ["Nd6", "f5", "a5", "Nc8"],
      },
      {
        title: "Alexander Alekhine – Aron Nimzowitsch : coup 22",
        fen: "r1r1q1k1/p3n1p1/Ppn1p2p/1B1pPp2/1P1P1P2/5N2/2RQ2PP/2R3K1 b - - 5 22",
        text: "Les deux Tours blanches sont désormais doublées sur la colonne c ouverte (c1 et c2).",
        moveSan: ["Rab8", "Qe3", "Rc7", "Rc3"],
      },
      {
        title: "Alexander Alekhine – Aron Nimzowitsch : coup 26",
        fen: "1r3k2/p1rqn1p1/Ppn1p2p/1B1pPp2/1P1P1P2/2R2N2/2R3PP/2Q3K1 b - - 13 26",
        text: "Le fameux « canon d'Alekhine » : Dame, Tour et Tour empilées sur la même colonne ouverte (c1-c2-c3), une puissance de feu qu'aucune pièce noire ne peut neutraliser puisque la colonne leur est entièrement fermée.",
        moveSan: ["Rbc8", "Ba4", "b5", "Bxb5"],
      },
      {
        title: "Alexander Alekhine – Aron Nimzowitsch : coup 30",
        fen: "2rk4/p1rqn1p1/P1n1p2p/3pPp2/BP1P1P1P/2R2N2/2R3P1/2Q3K1 b - - 0 30",
        text: "Totalement paralysé sur la colonne c et incapable du moindre coup utile, Nimzowitsch abandonne : la prise de possession complète de la colonne ouverte a suffi à décider la partie sans même qu'un sacrifice ne soit nécessaire.",
      },
      {
        title: "Viswanathan Anand – Vassily Ivanchuk, Amber Rapidplay 2001",
        fen: "3r4/4kpp1/p2prn1p/P1p5/1p2P3/5P1P/1PPR2P1/2NR2K1 w - - 8 29",
        text: "Les Tours blanches occupent déjà la colonne d, mais elle reste pour l'instant à demi fermée par le pion d6 noir : c'est la prochaine étape, l'ouverture complète de la colonne, qui va donner tout son sens à cette occupation préalable.",
        moveSan: ["Nd3", "Rd7", "b3", "g5"],
      },
      {
        title: "Viswanathan Anand – Vassily Ivanchuk : coup 34",
        fen: "4n3/4kp2/p2pr2p/Prp1P1p1/1pN5/1P3P1P/2PR1KP1/3R4 b - - 0 34",
        text: "Le coup clé : Anand sacrifie un pion pour ouvrir définitivement la colonne d, sur laquelle ses Tours forment déjà une batterie depuis plusieurs coups.",
        moveSan: ["dxe5", "Rd7+"],
      },
      {
        title: "Viswanathan Anand – Vassily Ivanchuk : coup 35",
        fen: "4n3/3Rkp2/p3r2p/Prp1p1p1/1pN5/1P3P1P/2P2KP1/3R4 b - - 1 35",
        text: "La colonne à peine ouverte, la Tour blanche s'engouffre immédiatement sur la 7e rangée.",
        moveSan: ["Kf6", "Ra7", "Kg6", "Rdd7"],
      },
      {
        title: "Viswanathan Anand – Vassily Ivanchuk : coup 40",
        fen: "R3n3/8/R3rpk1/Prp1p1p1/1pN4p/1P3P1P/2P2KP1/8 b - - 0 40",
        text: "Les deux Tours blanches, maîtresses absolues de la 7e et de la 8e rangée grâce à la colonne d ouverte, ratissent méthodiquement tous les pions faibles noirs — exactement le plan décrit par Nimzowitsch dans « Mon Système ».",
        moveSan: ["Nc7", "Rxe6", "Nxe6", "a6"],
      },
      {
        title: "Anatoly Karpov – Wolfgang Uhlmann, Madrid 1973",
        fen: "rnbqkbnr/pp3ppp/8/2pp4/3P4/8/PPPN1PPP/R1BQKBNR w KQkq - 0 5",
        text: "La Française Tarrasch symétrique ouvre d'emblée totalement la colonne e : plus aucun pion ne s'y trouve, pour aucun des deux camps.",
        moveSan: ["Ngf3", "Nc6", "Bb5", "Bd6"],
      },
      {
        title: "Anatoly Karpov – Wolfgang Uhlmann : coup 26",
        fen: "2rr2k1/1p2Rppp/6b1/pB1p4/P2P2P1/5P2/1P4P1/R5K1 b - - 2 26",
        text: "Malgré la simplification en finale, Karpov s'empare en premier de la colonne e ouverte et plonge directement sur la 7e rangée.",
        moveSan: ["b6", "Rae1", "h6", "Rb7"],
      },
      {
        title: "Anatoly Karpov – Wolfgang Uhlmann : coup 28",
        fen: "2rr2k1/1R3pp1/1p4bp/pB1p4/P2P2P1/5P2/1P4P1/4R1K1 b - - 1 28",
        text: "Les deux Tours blanches, l'une sur la 7e rangée (b7), l'autre prête à la rejoindre, dominent toute la position à partir de la seule colonne ouverte disponible.",
        moveSan: ["Rd6", "Ree7", "h5", "gxh5"],
      },
      {
        title: "Anatoly Karpov – Wolfgang Uhlmann : coup 37",
        fen: "8/1R2R1pk/1p4r1/pB1p2P1/P2PbP2/4K3/1Pr5/8 b - - 2 37",
        text: "Les deux Tours occupent maintenant ensemble la 7e rangée d'un bout à l'autre : la position noire est totalement paralysée.",
        moveSan: ["Rxb2", "Be8", "Rb3+", "Ke2"],
      },
    ],
  },
  "pm-la-colonne-semi-ouverte": {
    steps: [
      {
        title: "Viswanathan Anand – Garry Kasparov, Kasparov - Anand PCA World Championship Match 1995",
        fen: "3rr1k1/1p1bbppp/p2ppn2/q7/P3PP2/2NQBB2/1PP3PP/R2R3K b - - 3 16",
        text: "Coup typique de la Scheveningen : la Tour blanche s'installe sur la colonne d, semi-ouverte pour Blanc puisque Noir y garde son pion arriéré d6, cible permanente de toute cette structure.",
        moveSan: ["Bc6", "b4", "Qc7", "b5"],
      },
      {
        title: "Viswanathan Anand – Garry Kasparov : coup 24",
        fen: "r1q1r1k1/1p2bppp/1B1p1n2/1Q2P3/P1P1P3/5B2/6PP/1R1R3K b - - 0 24",
        text: "La pression accumulée sur la colonne d, combinée à l'expansion à l'aile dame, force finalement Noir à cette ouverture centrale : le pion arriéré d6 disparaît, mais au prix d'un affaiblissement décisif des cases noires centrales (d5, e4).",
        moveSan: ["dxe5", "a5", "Bf8", "h3"],
      },
      {
        title: "Viswanathan Anand – Garry Kasparov : coup 27",
        fen: "r3rbk1/1p3ppp/1B2qn2/PQ1Rp3/2P1P3/5B1P/6P1/1R5K b - - 2 27",
        text: "La Tour, présente sur la colonne d depuis le coup 16, y trouve maintenant un point d'appui avancé et irrésistible.",
        moveSan: ["Nxd5", "exd5", "Qg6", "c5"],
      },
      {
        title: "Viswanathan Anand – Garry Kasparov : coup 35",
        fen: "r4bk1/1Q3ppp/1B1Pq3/P1P5/8/4p1rP/4B1PK/6R1 b - - 2 35",
        text: "L'ancienne faiblesse structurelle du pion d6, exploitée dès le coup 16 par la Tour sur la colonne semi-ouverte, a fini par se transformer en un pion d passé et décisif ; Kasparov, en position perdue, abandonne peu après.",
      },
      {
        title: "Boris Spassky – Robert James Fischer, Spassky - Fischer World Championship Match 1972",
        fen: "rnbqkb1r/pp3ppp/3p1n2/2pP4/8/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 6",
        text: "Structure caractéristique du Benoni moderne : après cet échange, Noir n'a plus de pion e, alors que Blanc en garde un. La colonne e est donc semi-ouverte pour Noir — le plan thématique de tout le Benoni consiste précisément à y placer une Tour pour faire pression sur le futur pion e4 blanc.",
        moveSan: ["Nc3", "g6", "Nd2", "Nbd7"],
      },
      {
        title: "Boris Spassky – Robert James Fischer : coup 10",
        fen: "r1bqr1k1/pp1n1pbp/3p1np1/2pP4/4P3/2N5/PP1NBPPP/R1BQ1RK1 w - - 5 11",
        text: "Exactement le plan annoncé : la Tour vient immédiatement occuper la colonne semi-ouverte pour cibler le pion e4, qui devient une faiblesse permanente à surveiller pour Blanc pendant toute la partie.",
        moveSan: ["Qc2", "Nh5", "Bxh5", "gxh5"],
      },
      {
        title: "Boris Spassky – Robert James Fischer : coup 31",
        fen: "4r1k1/3brpb1/3p2q1/1p1P3p/1Pp1PBp1/2N3P1/3QRP1P/4R1K1 b - - 5 31",
        text: "Après vingt coups de pression sur la colonne semi-ouverte, Blanc doit garder ses deux Tours sur la défensive du pion e4 — une contrainte permanente que Fischer exploite pour lancer l'offensive décisive.",
        moveSan: ["Bxc3", "Qxc3", "Rxe4", "Rxe4"],
      },
      {
        title: "Boris Spassky – Robert James Fischer : coup 34",
        fen: "6k1/3b1p2/3p4/1p1P3p/1Pp1qBp1/2Q3P1/5P1P/6K1 w - - 0 35",
        text: "Le sacrifice de qualité de Fischer élimine enfin le pion e4 lui-même, aboutissant sur cette colonne à un gain matériel décisif : Noir a échangé une Tour contre Fou et pion, mais domine totalement avec Dame et Fou contre Dame.",
        moveSan: ["Bh6", "Qg6", "Bc1", "Qb1"],
      },
      {
        title: "Boris Spassky – Robert James Fischer : coup 41",
        fen: "6k1/5p2/3p4/1p1P3p/1PpQ2p1/1q1b2P1/4KP1P/2B5 w - - 14 42",
        text: "La première victoire de Fischer contre Spassky de toute leur carrière, tournant décisif du match.",
      },
      {
        title: "Loek van Wely – Judit Polgar, VAM Hoogeveen 1997",
        fen: "1bb1r1k1/1p4pp/r1q5/1N1p1p2/P1nBn1BN/4P1PP/5PK1/R3Q2R w - - 0 23",
        text: "Noir sacrifie son pion f pour ouvrir une colonne f désormais semi-ouverte (Blanc garde son pion f2, Noir n'en a plus) : sa Tour va pouvoir y faire pression toute la partie.",
        moveSan: ["Bxf5", "Rf8", "Bxc8", "Qxc8"],
      },
      {
        title: "Loek van Wely – Judit Polgar : coup 27",
        fen: "1bq2rk1/1p5p/7r/1N1p4/P1nBn1p1/4PNPP/R4PK1/3Q3R w - - 0 28",
        text: "Le pion g noir disparaît à son tour au coup suivant, créant cette fois une colonne g semi-ouverte pour la Dame noire (Blanc garde son pion g3).",
        moveSan: ["hxg4", "Rxh1", "Qxh1", "Qxg4"],
      },
      {
        title: "Loek van Wely – Judit Polgar : coup 29",
        fen: "1b3rk1/1p5p/8/1N1p4/P1nBn1q1/4PNP1/R4PK1/7Q w - - 0 30",
        text: "Malgré le sacrifice de deux pions, Noir contrôle maintenant deux colonnes semi-ouvertes (f et g) avec sa Tour et sa Dame : une compensation dynamique largement suffisante face à la faiblesse du Roi blanc resté au centre.",
        moveSan: ["Nh2", "Rxf2+"],
      },
      {
        title: "Loek van Wely – Judit Polgar : coup 30",
        fen: "1b4k1/1p5p/8/1N1p4/P1nBn1q1/4P1P1/R4rKN/7Q w - - 0 31",
        text: "La Tour noire, restée maîtresse de la colonne f semi-ouverte depuis le coup 22, porte le coup décisif : Blanc abandonne devant la perte imminente de matériel et l'attaque irrésistible.",
      },
    ],
  },
  // Les 5 thèmes ci-dessous (2026-09-10, 2e lot au format Lichess après
  // `pm-le-mauvais-fou`/`pm-l-avant-poste-du-cavalier`) sortent du « 1
  // exercice, pas de tutoriel » : chacun reprend une partie de maître RÉELLE
  // déjà présente dans `data/import/academy/PILOT_pm-*.pgn` (sourcée et
  // pré-commentée en français par une session sœur, voir la mémoire de
  // session « middlegame-course-pattern ») ou, à défaut de PILOT
  // disponible (`pm-la-centralisation-des-pieces`), une étude Lichess
  // distincte trouvée pour l'occasion. Un `CourseStep` par commentaire
  // source, `fen` = position de départ RÉELLE avant le coup commenté,
  // `moveSan` = la suite réellement jouée jusqu'au prochain point d'arrêt —
  // la vague de puzzles correspondante (`master-puzzles-dataset.ts`) mine
  // d'autres points de décision de la MÊME partie.
  "pm-la-chaine-de-pions": {
    steps: [
      {
        title: "Efim Bogoljubow – Richard Reti, 1923",
        fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
        text: "La chaîne de pions blanche e5-d4 s'établit : la case d6 devient un point d'appui potentiel pour Blanc, tandis que la base en d4 reste la cible naturelle des Noirs.",
        moveSan: ["e5", "Nfd7", "Qg4", "c5"],
      },
      {
        title: "Efim Bogoljubow – Richard Reti : coup 5",
        fen: "rnbqkb1r/pppn1ppp/4p3/3pP3/3P2Q1/2N5/PPP2PPP/R1B1KBNR b KQkq - 2 5",
        text: "Réponse classique contre une chaîne de pions : attaquer sa base (d4), jamais son sommet (e5).",
        moveSan: ["c5", "Nb5", "cxd4"],
        highlights: [{ square: "e5", color: "red" }],
        arrows: [{ from: "c5", to: "d4", color: "green" }],
      },
      {
        title: "Efim Bogoljubow – Richard Reti : coup 16",
        fen: "r3k2r/p2b3p/2p1pp2/3p4/3Nn3/8/PPP2PPP/R1B2RK1 b kq - 0 16",
        text: "Reti dispose désormais de quatre pions noirs (c5-d5-e6-f6) formant un centre compact et puissant — conséquence directe de l'attaque réussie contre la base de la chaîne blanche initiale.",
        moveSan: ["c5", "Ne2", "Kf7"],
        highlights: [
          { square: "c5", color: "green" },
          { square: "d5", color: "green" },
          { square: "e6", color: "green" },
          { square: "f6", color: "green" },
        ],
      },
      {
        title: "Efim Bogoljubow – Richard Reti : coup 19",
        fen: "r6r/p2b1k1p/3npp2/2pp4/8/1P3P2/P1P1N1PP/R1B2RK1 b - - 0 19",
        text: "La nouvelle chaîne de pions noire (c5-d4-e5) commence à avancer à son tour, repoussant les pièces blanches vers l'arrière.",
        moveSan: ["e5", "Ba3", "Rac8"],
      },
      {
        title: "Efim Bogoljubow – Richard Reti : coup 21",
        fen: "2r4r/p2b1k1p/3n1p2/2ppp3/8/BP3P2/P1P1N1PP/3R1RK1 b - - 3 21",
        text: "En avançant son pion sur une case noire, Reti limite l'action du Fou blanc de cases claires tout en dégageant celle de son propre Fou-dame.",
        moveSan: ["d4", "Nc1", "Nf5"],
      },
      {
        title: "Efim Bogoljubow – Richard Reti : coup 23",
        fen: "2r4r/p2b1k1p/5p2/2p1pn2/3p4/BP3P2/P1P2RPP/2NR2K1 b - - 3 23",
        text: "Le Cavalier s'installe sur un avant-poste créé directement par l'avance de la chaîne de pions.",
        moveSan: ["Ne3", "Re1", "c4"],
      },
      {
        title: "Efim Bogoljubow – Richard Reti : coup 26",
        fen: "2r4r/p4k1p/5p2/4p3/bPpp4/B3nP2/P1P1RRPP/2N3K1 b - - 2 26",
        text: "Début d'une longue promenade du Cavalier à travers tout le camp blanc.",
        moveSan: ["Nd1", "Rf1", "Nc3"],
      },
      {
        title: "Efim Bogoljubow – Richard Reti : coup 29",
        fen: "2r4r/p4k1p/5p2/4p3/bPpp4/5P2/PBP2RPP/1nN2RK1 b - - 8 29",
        text: "Le coup qui donne son nom au thème : la chaîne de pions noire avance encore d'un cran (c3) et repousse le Fou blanc jusqu'à la dernière rangée.",
        moveSan: ["c3", "Nb3", "Bxb3"],
        highlights: [
          { square: "c3", color: "green" },
          { square: "d4", color: "green" },
          { square: "e5", color: "green" },
          { square: "f6", color: "green" },
        ],
      },
      {
        title: "Efim Bogoljubow – Richard Reti : coup 33",
        fen: "2rr4/p4k1p/5p2/4p3/1P1p4/1Pp2P2/2Pn1RPP/2B1R1K1 b - - 4 33",
        text: "Percée au cœur de la chaîne pour obtenir un pion passé.",
        moveSan: ["d3", "cxd3", "Rxd3"],
      },
      {
        title: "Efim Bogoljubow – Richard Reti : coup 42",
        fen: "8/p6p/5p2/4p3/1P1k3P/1Pr2P2/2pK2P1/2R5 b - - 0 42",
        text: "La chaîne de pions initiale, attaquée dès le cinquième coup à sa base, aura fini par produire le pion c passé et décisif qui gagne la partie.",
        moveSan: ["Rd3+"],
      },
    ],
  },
  "pm-la-paire-de-fous": {
    steps: [
      {
        title: "Dawid Janowsky – Jose Raul Capablanca, New York 1916",
        fen: "rn2kb1r/1p2pppp/1pp5/3N1b2/3P4/5N2/PP2PPPP/R1B1KB1R b KQkq - 0 8",
        text: "Les pions dame noirs sont affaiblis, mais en échange deux colonnes ouvertes s'offrent aux Tours noires.",
        moveSan: ["cxd5", "e3", "Nc6"],
      },
      {
        title: "Dawid Janowsky – Jose Raul Capablanca : coup 10",
        fen: "r3kb1r/1p2pppp/1pn5/3p1b2/3P4/4PN2/PP1B1PPP/R3KB1R b KQkq - 2 10",
        text: "L'un des coups les plus profonds jamais joués, selon Chernev : Capablanca désinstalle volontairement son propre Fou et va même l'enfermer au coup suivant par ...e6. Le plan est ...Na5, ...b5 (le pion protégé par le Fou) et ...Nc4 : si les Blancs prennent le Cavalier, la reprise dégagera les pions noirs ET laissera Capablanca avec l'avantage de la paire de Fous — l'objectif réel de toute la manœuvre.",
        moveSan: ["Bd7", "Be2", "e6"],
      },
      {
        title: "Dawid Janowsky – Jose Raul Capablanca : coup 13",
        fen: "r3k2r/1p1b1ppp/1pnbp3/3p4/3P4/4PN2/PP1BBPPP/R1R3K1 b kq - 3 13",
        text: "Petit à petit, Capablanca prépare la suite de son plan sans se presser.",
        moveSan: ["Ke7", "Bc3", "Rhc8"],
      },
      {
        title: "Dawid Janowsky – Jose Raul Capablanca : coup 15",
        fen: "r1r5/1p1bkppp/1pnbp3/3p4/3P4/2B1PN2/PP2BPPP/R1R3K1 w - - 6 15",
        text: "Ce coup crée un trou en b3, une faiblesse organique irrémédiable.",
        moveSan: ["a3", "Na5"],
        highlights: [{ square: "b3", color: "red" }],
      },
      {
        title: "Dawid Janowsky – Jose Raul Capablanca : coup 15 (suite)",
        fen: "r1r5/1p1bkppp/1pnbp3/3p4/3P4/P1B1PN2/1P2BPPP/R1R3K1 b - - 0 15",
        text: "Capablanca poursuit son plan : installer le Cavalier sur c4.",
        moveSan: ["Na5", "Nd2", "f5"],
        arrows: [
          { from: "a5", to: "c4", color: "green" },
          { from: "b6", to: "b5", color: "green" },
        ],
      },
      {
        title: "Dawid Janowsky – Jose Raul Capablanca : coup 18",
        fen: "r1r5/1p1bk1pp/3bp3/np1p1p2/3P4/P1B1PPP1/1P1NB2P/R1R3K1 b - - 0 18",
        text: "Premier plan accompli : les Blancs devront prendre le Cavalier, et la faiblesse restante (le pion b doublé) deviendra une source de force en c4.",
        moveSan: ["Nc4", "Bxc4", "bxc4"],
      },
      {
        title: "Dawid Janowsky – Jose Raul Capablanca : coup 31",
        fen: "r7/3bbk2/4p2p/1p1pPp2/2pP1Pr1/P1B2K2/1P4NP/1R4R1 b - - 4 31",
        text: "Le Fou-dame noir, silencieux depuis son dixième coup, s'apprête à peser de tout son poids sur la position blanche.",
        moveSan: ["Rag8", "Be1", "b4"],
      },
      {
        title: "Dawid Janowsky – Jose Raul Capablanca : coup 32",
        fen: "6r1/3bbk2/4p2p/1p1pPp2/2pP1Pr1/P4K2/1P4NP/1R2B1R1 b - - 6 32",
        text: "Un sacrifice qui dégage enfin la diagonale du Fou-dame noir, muet depuis vingt-deux coups.",
        moveSan: ["b4", "axb4", "Ba4"],
      },
      {
        title: "Dawid Janowsky – Jose Raul Capablanca : coup 33",
        fen: "6r1/3bbk2/4p2p/3pPp2/1PpP1Pr1/5K2/1P4NP/1R2B1R1 b - - 0 33",
        text: "Le Fou se dirige vers c2 puis e4, où il frappera le Cavalier derrière le Roi blanc.",
        moveSan: ["Ba4", "Ra1", "Bc2"],
      },
      {
        title: "Dawid Janowsky – Jose Raul Capablanca : coup 42",
        fen: "6r1/R3Bk2/4p3/3pPp2/1PpP1P2/7r/1P3K2/8 b - - 2 42",
        text: "Aucune pièce ou pion noir ne se trouve sur case blanche — la paire de Fous initiale s'est transformée en domination totale des cases blanches, jusqu'à la victoire finale.",
        moveSan: ["Rb3"],
      },
    ],
  },
  "pm-la-securite-du-roi-en-milieu-de-partie": {
    steps: [
      {
        title: "Paul Morphy – Duc de Brunswick & Comte Isouard, Opéra de Paris 1858",
        fen: "rnbqkbnr/ppp2ppp/3p4/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3",
        text: "Une erreur de développement : ce Fou sort avant que le Roi noir ne soit en sécurité.",
        moveSan: ["Bg4", "dxe5", "Bxf3"],
      },
      {
        title: "Paul Morphy – Duc de Brunswick & Comte Isouard : coup 7",
        fen: "rn1qkb1r/ppp2ppp/5n2/4p3/2B1P3/5Q2/PPP2PPP/RNB1K2R w KQkq - 2 7",
        text: "La Dame attaque déjà b7 et f7 à la fois — les Noirs n'ont toujours pas roqué, et chaque tempo perdu va se payer cher.",
        moveSan: ["Qb3", "Qe7"],
      },
      {
        title: "Paul Morphy – Duc de Brunswick & Comte Isouard : coup 7 (suite)",
        fen: "rn1qkb1r/ppp2ppp/5n2/4p3/2B1P3/1Q6/PPP2PPP/RNB1K2R b KQkq - 3 7",
        text: "Ce coup protège f7 mais bloque à jamais le roque noir : le Roi restera au centre pour le reste de la partie, condamnant les Noirs avant même le milieu de partie.",
        moveSan: ["Qe7", "Nc3", "c6"],
      },
      {
        title: "Paul Morphy – Duc de Brunswick & Comte Isouard : coup 10",
        fen: "rn2kb1r/p3qppp/2p2n2/1p2p1B1/2B1P3/1QN5/PPP2PPP/R3K2R w KQkq - 0 10",
        text: "Morphy sacrifie déjà une pièce pour ouvrir des lignes vers le Roi bloqué au centre — exactement le prix à payer pour un Roi qui n'a jamais trouvé la sécurité du roque.",
        moveSan: ["Nxb5", "cxb5", "Bxb5+"],
      },
      {
        title: "Paul Morphy – Duc de Brunswick & Comte Isouard : coup 12",
        fen: "r3kb1r/p2nqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/R3K2R w KQkq - 1 12",
        text: "Morphy, lui, a roqué depuis longtemps : son Roi est en sécurité, tandis que celui des Noirs est encore au centre, cible de toutes les pièces blanches développées.",
        moveSan: ["O-O-O", "Rd8", "Rxd7"],
      },
      {
        title: "Paul Morphy – Duc de Brunswick & Comte Isouard : coup 16",
        fen: "4kb1r/p2n1ppp/4q3/4p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 16",
        text: "Le sacrifice final, rendu possible uniquement parce que le Roi noir n'a jamais quitté le centre.",
        moveSan: ["Qb8+", "Nxb8"],
      },
      {
        title: "Paul Morphy – Duc de Brunswick & Comte Isouard : coup 17",
        fen: "1n2kb1r/p4ppp/4q3/4p1B1/4P3/8/PPP2PPP/2KR4 w k - 0 17",
        text: "Mat : la totalité de la partie tient en une seule idée — un Roi jamais mis en sécurité finit toujours par être rattrapé, même avec toutes les pièces encore sur l'échiquier.",
        moveSan: ["Rd8#"],
      },
    ],
  },
  "pm-la-tour-a-la-7e-rangee": {
    steps: [
      {
        title: "Jose Raul Capablanca – Saviel Tartakower, New York 1924",
        fen: "4k3/p1p2r1p/1p4p1/n2p4/P2P1P1P/2PB2P1/6K1/R7 w - - 0 27",
        text: "Capablanca sacrifie déjà des pions pour ouvrir des lignes vers le Roi noir.",
        moveSan: ["h5", "Rf6", "hxg6"],
      },
      {
        title: "Jose Raul Capablanca – Saviel Tartakower : coup 29",
        fen: "4k3/p1p5/1p3rp1/n2p4/P2P1P2/2PB2P1/6K1/R7 w - - 0 29",
        text: "La Tour se dirige vers la colonne ouverte, prête à saisir la 7e rangée au coup suivant.",
        moveSan: ["Rh1", "Kf8", "Rh7"],
      },
      {
        title: "Jose Raul Capablanca – Saviel Tartakower : coup 30",
        fen: "5k2/p1p5/1p3rp1/n2p4/P2P1P2/2PB2P1/6K1/7R w - - 2 30",
        text: "La Tour arrive à la 7e rangée — le coup magique des finales de Tours. Trois effets à la fois : elle attaque tous les pions noirs qui n'ont pas encore bougé, elle peut prendre à revers ceux qui ont avancé, et elle confine le Roi noir à la dernière rangée, l'empêchant de participer au combat.",
        moveSan: ["Rh7", "Rc6", "g4"],
      },
      {
        title: "Jose Raul Capablanca – Saviel Tartakower : coup 35",
        fen: "5k2/p1p4R/1pr5/3p1pP1/P2P1P2/2P2K2/8/8 w - - 0 35",
        text: "Le Roi blanc se dirige vers f6 pour escorter son pion passé et participer aux menaces de mat — deuxième moitié de la formule « Tour à la 7e, Roi à la 6e ».",
        moveSan: ["Kg3", "Rxc3+", "Kh4"],
      },
      {
        title: "Jose Raul Capablanca – Saviel Tartakower : coup 52",
        fen: "6k1/2R3P1/1pK5/3P4/r7/8/8/8 w - - 0 52",
        text: "Le pion d, escorté par le Roi, va promouvoir : quatre pions noirs sont tombés en une demi-douzaine de coups dès l'installation de la Tour en 7e rangée, et toute résistance est désormais vaine.",
        moveSan: ["d6"],
      },
    ],
  },
  "pm-la-centralisation-des-pieces": {
    steps: [
      {
        title: "Étude Lichess « Centralizing the pieces » — le Roi actif en finale de Tours",
        fen: "3r4/1r3kp1/b4p2/p2p4/3b1P2/3P1BP1/P1R2NK1/3R4 b - - 0 1",
        text: "Noir veut échanger les Tours pour ensuite activer son Roi : sans Tour à défendre, le Roi peut se permettre de marcher au centre.",
        moveSan: ["Rb2", "Rxb2", "Bxb2"],
      },
      {
        title: "Centralisation du Roi (suite)",
        fen: "3r4/5kp1/b4p2/p2p4/3b1P2/3P1BPN/P2R2K1/8 b - - 3 4",
        text: "Le Roi noir n'a plus de Tour à protéger : il fonce vers le centre, exactement le rôle qu'on lui refuse tant que Dames et Tours occupent l'échiquier.",
        moveSan: ["Ke6", "Rc2", "Kd6"],
      },
      {
        title: "Centralisation du Roi (fin)",
        fen: "8/6p1/b4p2/p2pkP2/6P1/3PbK1N/P1B5/8 b - - 2 10",
        text: "Le Roi noir achève sa centralisation : depuis d4, il domine directement les pions blancs et prépare la finale gagnante.",
        moveSan: ["Kd4"],
      },
      {
        title: "La Dame centralisée attaque des deux côtés à la fois",
        fen: "8/p2B3k/1p6/1P6/7K/6Q1/6p1/5q2 w - - 0 1",
        text: "Centraliser la Dame : depuis e5, elle contrôle un maximum de cases tout en couvrant son propre camp et en surveillant la promotion du pion noir en g2.",
        moveSan: ["Qe5"],
      },
      {
        title: "Centralisation de la Dame contre deux faiblesses",
        fen: "4r2k/7p/2q5/2p1pQ2/8/P7/6PP/2R4K w - - 0 1",
        text: "Une Dame centralisée peut basculer d'une faiblesse à l'autre (ici c5 et e5) — l'atout décisif d'une pièce qui contrôle le centre plutôt qu'un seul flanc.",
        moveSan: ["Qh5", "Re7", "Rd1"],
      },
      {
        title: "Le Cavalier centralisé lance l'attaque de mat",
        fen: "rn1q1rk1/pbp1bppp/1p3n2/3pN1B1/3P4/2NBP3/PP3PPP/R2QK2R b KQq - 0 1",
        text: "Le Cavalier blanc est solidement centralisé en e5, soutenu par d4 et pouvant bientôt s'appuyer sur f4 : c'est cette centralisation qui va permettre toute l'attaque qui suit.",
        moveSan: ["Nbd7", "f4", "c5", "O-O"],
      },
    ],
  },
};
