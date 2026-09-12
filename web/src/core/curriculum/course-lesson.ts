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
 * Lot 6 (2026-09-12) ajoute deux modules de plus, tous deux avec un premier
 * tutoriel réel (aucun contenu préexistant) : `jh-module-14-l-art-de-la-conversion`
 * (7 chapitres, Fischer–Taimanov, Vancouver 1971 Candidats partie 4, 71 coups)
 * et `jh-module-15-fou-contre-cavalier-mode-d-emploi` (6 chapitres,
 * Capablanca–Steiner, exhibition d'échecs vivants de Los Angeles 1933, mat en
 * 25 coups — partie qui alimente aussi 5 puzzles de
 * `pm-la-securite-du-roi-en-milieu-de-partie` sous un angle différent, voir
 * le commentaire détaillé au-dessus de son entrée).
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
  // `jh-module-1-structures-de-pions-symetriques` (2026-09-11, cahier des
  // charges « tout nouveau chantier » du cursus Jesper Hall, aucun fichier
  // PILOT disponible) : 7 chapitres tirés de la partie réelle Akiba
  // Rubinstein – Georg Salwe, Lodz 1908 (Gambit Dame refusé, Défense
  // Tarrasch, dite « The Backward Pawn » — chessgames.com/perl/chessgame?
  // gid=1119705, confirmée indépendamment par chess.com/lessons/silmans-
  // lessons-in-strategy-2/rubinstein-salwe-lodz-1908 et par l'étude Lichess
  // https://lichess.org/study/jgR5G5hW). Choix de cette partie : après
  // 4.cxd5 exd5, la position semble parfaitement symétrique sur les
  // colonnes centrales — exactement l'illusion que ce module veut démonter.
  // Les 75 demi-coups de la partie ont été rejoués et vérifiés intégralement
  // avec chess.js avant rédaction (voir `course-lesson.test.ts`) ; la même
  // partie alimente aussi la vague de 15 puzzles de
  // `MASTER_PUZZLES_DATASET` pour ce thème.
  "jh-module-1-structures-de-pions-symetriques": {
    steps: [
      {
        title: "Akiba Rubinstein – Georg Salwe, Lodz 1908",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Tournoi de Lodz 1908 : Rubinstein (Blancs) affronte Georg Salwe dans un Gambit Dame refusé, Défense Tarrasch. PRO TIP de Jesper Hall : une structure de pions symétrique — où chaque camp a exactement les mêmes pions, en miroir — ne décide JAMAIS rien par elle-même ; c'est l'activité relative des pièces qui va créer, case après case, la première vraie différence entre les deux camps.",
        moveSan: ["d4", "d5", "Nf3", "c5"],
      },
      {
        title: "Rubinstein – Salwe : coup 4 — la fausse symétrie se construit",
        fen: "rnbqkbnr/pp2pppp/8/2pp4/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 0 3",
        text: "Après 3...e6, Rubinstein force l'échange central : cxd5 exd5 va reconstituer un pion noir sur d5 en face du pion blanc d4 — à première vue, la structure semble redevenir parfaitement symétrique sur les colonnes centrales.",
        moveSan: ["c4", "e6", "cxd5", "exd5"],
        highlights: [
          { square: "d4", color: "green" },
          { square: "d5", color: "green" },
        ],
        arrows: [
          { from: "c4", to: "d5", color: "green" },
          { from: "e6", to: "d5", color: "green" },
        ],
      },
      {
        title: "Rubinstein – Salwe : coup 8 — une symétrie trompeuse",
        fen: "rnbqkbnr/pp3ppp/8/2pp4/3P4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 5",
        text: "PRO TIP : regardez mieux. Blanc n'a plus qu'UN seul pion central (d4, sur une colonne d ouverte pour sa Dame), tandis que Noir traîne DEUX pions centraux (c5 ET d5) sur la même zone — la colonne c, déjà privée de son pion blanc, appartient virtuellement à Rubinstein depuis ce coup. La symétrie n'est qu'apparente : l'asymétrie réelle, invisible au premier regard, se cache dans ce déséquilibre de colonnes.",
        highlights: [
          { square: "d4", color: "green" },
          { square: "c5", color: "red" },
          { square: "d5", color: "red" },
        ],
        arrows: [{ from: "a1", to: "c1", color: "green" }],
      },
      {
        title: "Rubinstein – Salwe : coup 14 — la rupture qui grave la faiblesse",
        fen: "r1bqkb1r/pp3ppp/2n2n2/2pp4/3P4/2N2NP1/PP2PPBP/R1BQK2R b KQkq - 2 7",
        text: "Salwe cède lui-même la tension sur d4 : après cxd4 Nxd4 Qb6 Nxc6 bxc6, son pion b7 reprend sur c6 — Noir se retrouve avec un pion c6 arriéré et un pion d5 isolé, deux cibles permanentes sur la colonne c que Rubinstein vient tout juste de rendre entièrement sienne. PRO TIP : c'est exactement le moment à repérer — transformer l'asymétrie latente (case c5, colonne c) en faiblesse structurelle concrète et durable.",
        moveSan: ["cxd4", "Nxd4", "Qb6", "Nxc6", "bxc6"],
        highlights: [
          { square: "c6", color: "red" },
          { square: "d5", color: "red" },
        ],
      },
      {
        title: "Rubinstein – Salwe : coup 23 — centraliser les pièces lourdes sur la colonne c",
        fen: "r5k1/pqr2ppp/2p1b3/2Rp4/3Q4/4PPP1/PP3R1P/5BK1 w - - 1 23",
        text: "PRO TIP de Jesper Hall : dans une position devenue asymétrique, doublez vos pièces lourdes sur LA colonne qui compte — ici la colonne c, ouverte depuis le coup 8. Rfc2 amène la seconde Tour derrière la première, et la Dame blanche contrôle déjà d4 : trois pièces lourdes convergent vers les deux mêmes cibles, c6 et d5.",
        moveSan: ["Rfc2", "Qb6"],
        highlights: [
          { square: "c6", color: "red" },
          { square: "d5", color: "red" },
          { square: "c5", color: "green" },
        ],
        arrows: [{ from: "f2", to: "c2", color: "green" }],
      },
      {
        title: "Rubinstein – Salwe : coup 27 — Rxc6!, la percée décisive",
        fen: "1r4k1/r4ppp/pqp1b3/R2p4/1P1Q4/P3PPP1/2R4P/5BK1 w - - 1 27",
        text: "Le fruit de toute la manoeuvre : Rxc6! élimine définitivement le pion arriéré, et après Qxc6 Qxa7, Rubinstein ramasse aussi le second point faible — exactement le principe des « deux faiblesses » : attaquer tour à tour deux cibles jusqu'à ce que l'adversaire ne puisse plus les défendre toutes les deux à la fois.",
        moveSan: ["Rxc6", "Qxc6", "Qxa7"],
        highlights: [
          { square: "c6", color: "red" },
          { square: "a7", color: "red" },
        ],
        arrows: [{ from: "c2", to: "c6", color: "green" }],
      },
      {
        title: "Rubinstein – Salwe : coup 35 — la 7e rangée, puis le pion qui décide",
        fen: "r5k1/1q3p2/3Qb1p1/p1Rp3p/1P5P/P3PPP1/4BK2/8 w - - 0 35",
        text: "Dernier acte : Rc7 envahit la 7e rangée et immobilise totalement les pièces noires, pendant que le pion b, soutenu par la Dame et la Tour, s'avance b5-b6-b7 sans que Noir ne puisse rien y opposer. Salwe abandonne : une structure 100% symétrique au coup 4 a fini, 34 coups plus tard, entièrement dominée par l'activité des pièces blanches — la démonstration complète du PRO TIP de ce module.",
        moveSan: ["Rc7", "Qb8", "b5", "a4", "b6", "Ra5", "b7"],
        highlights: [
          { square: "c7", color: "green" },
          { square: "b7", color: "green" },
        ],
        arrows: [{ from: "c5", to: "c7", color: "green" }],
      },
    ],
  },
  // Modules 2-4 (2026-09-11, « Lot 2 » du cursus Jesper Hall — structures de
  // pions du milieu de partie), chacun 7 chapitres tirés d'UNE partie réelle
  // authentique, parsée et vérifiée coup par coup avec chess.js
  // (`course-lesson.test.ts`) ; la même partie alimente aussi la vague de 14
  // puzzles du thème dans `MASTER_PUZZLES_DATASET`. Les 3 sources initialement
  // désignées par le cahier des charges ont dû être vérifiées puis en partie
  // remplacées : « Botvinnik–Vidmar, Nottingham 1936 » (assignée à Carlsbad)
  // s'est révélée être un isolani/IQP classique (« IQP Perfection »), et
  // « Gligoric–Fischer, Zagreb 1970 » (assignée à Maroczy) n'existe pas telle
  // quelle (la seule Gligoric-Fischer de 1970 est une Benoni à l'Interzonal de
  // Palma de Mallorca) — l'utilisateur a confirmé, après vérification
  // présentée, de chercher de vrais substituts plutôt que de forcer ces deux
  // parties hors-sujet.
  //  - `jh-module-2` : Lajos Portisch – Anatoly Karpov, Milan 1975 (E54,
  //    Nimzo-indienne, 1/2-1/2, pgnmentor.com/players/Karpov.zip) — Portisch
  //    joue avec l'isolani, Karpov le bloque en Noir et tient la nulle.
  //  - `jh-module-3` : Tigran Petrosian – Nikolai Krogius, URSS ch26,
  //    Tbilisi 1959 (D91, Grünfeld, 1-0, pgnmentor.com/players/Petrosian.zip)
  //    — cité par l'article Wikipédia « Minority attack » comme un des trois
  //    modèles canoniques de l'attaque de minorité en structure Carlsbad.
  //  - `jh-module-4` : Christopher Lutz – Marek Vokac, Dortmund-B 1991 (B38,
  //    Dragon accéléré, 1-0, étude Lichess https://lichess.org/study/S5BJsGLV
  //    « The Maroczy Bind: Every Pawn Structure Explained ») — le Bind blanc
  //    (c4+e4) mené jusqu'au sacrifice décisif Bxh7+.
  "jh-module-2-jouer-contre-l-isolani": {
    steps: [
      {
        title: "Portisch – Karpov, Milan 1975",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Une Nimzo-indienne classique : Portisch installe le centre avec d4/c4/Nc3, Karpov développe et prépare la rupture ...c5. Le duel qui va suivre décide qui, des deux, héritera d'un pion isolé sur la colonne d — et comment l'autre camp va s'en servir.",
        moveSan: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4", "e3", "c5"],
      },
      {
        title: "La naissance de l'isolani",
        fen: "rnbq1rk1/pp3ppp/4pn2/8/1bBp4/2N1PN2/PP3PPP/R1BQ1RK1 w - - 0 9",
        text: "Blanc doit reprendre sur d4 : exd4 est le seul coup qui garde l'équilibre matériel, mais il accepte du même coup un pion isolé sur d4 — plus de pion c ni de pion e pour le soutenir. À partir de cet instant précis, toute la partie va se jouer autour de cette unique faiblesse structurelle.",
        moveSan: ["exd4"],
        highlights: [{ square: "d4", color: "red" }],
        arrows: [{ from: "e3", to: "d4", color: "red" }],
      },
      {
        title: "Le blocus : le cavalier sur d5",
        fen: "2rq1rk1/pb2bppp/1pn1pn2/6B1/2BP4/P1NQ1N2/1P3PPP/2RR2K1 b - - 4 14",
        text: "PRO TIP de Jesper Hall : contre l'isolani, on bloque d'abord avec un CAVALIER — jamais un fou — posté exactement devant le pion, hors de portée de tout pion adverse. Le Cf6-d5 de Karpov est un manuel à lui seul : depuis cette case, aucun pion blanc ne peut jamais le déloger.",
        moveSan: ["Nd5"],
        highlights: [{ square: "d5", color: "green" }, { square: "d4", color: "red" }],
        arrows: [{ from: "f6", to: "d5", color: "green" }],
      },
      {
        title: "Portisch échange le bloqueur",
        fen: "2rq1rk1/pb2bppp/1pn1p3/3n2B1/2BP4/P1NQ1N2/1P3PPP/2RR2K1 w - - 5 15",
        text: "Le camp qui POSSÈDE l'isolani ne peut pas laisser un cavalier s'installer éternellement sur la case de blocus : Portisch l'échange sur-le-champ. Une cascade de prises de pièces mineures s'ensuit ; le matériel reste égal, mais la position se simplifie nettement — exactement le genre de moment où chaque camp doit juger si la simplification sert le bloqueur (moins d'attaquants) ou le possesseur de l'isolani (moins de pièces à défendre).",
        moveSan: ["Bxd5", "Bxg5", "Nxg5", "Qxg5"],
      },
      {
        title: "L'échange des dames",
        fen: "2rr2k1/pb3pp1/1pn1p2p/6q1/3PB3/P1N1Q3/1P3PPP/2RR2K1 w - - 2 19",
        text: "Les dames quittent l'échiquier — un moment charnière pour les deux plans. Le second PRO TIP du module dit que le camp AVEC l'isolani doit éviter les échanges pour garder ses chances dynamiques : ce troc volontaire de dames est donc une concession de Portisch, signe qu'il joue désormais sur la valeur structurelle et spatiale du centre plutôt que sur une attaque directe au roi.",
        moveSan: ["Qxg5", "hxg5"],
      },
      {
        title: "d4-d5 ! La percée centrale",
        fen: "2rr2k1/pb3pp1/1pn1p3/6p1/3PB3/P1N5/1P3PPP/2RR2K1 w - - 0 20",
        text: "Même sans les dames, le pion isolé garde une arme : la percée centrale. Portisch le pousse une dernière fois et l'échange contre une activité de pièces totale — le fou qui reprend sur d5 se retrouve magnifiquement centralisé, largement de quoi compenser la disparition du pion.",
        moveSan: ["d5", "exd5", "Rxd5", "Rxd5", "Bxd5"],
        highlights: [{ square: "d5", color: "green" }],
        arrows: [{ from: "d4", to: "d5", color: "green" }],
      },
      {
        title: "Le bilan : Karpov tient la nulle",
        fen: "8/4n1p1/1p1k1p2/p5p1/3KB3/P4P2/1P4PP/8 b - - 3 34",
        text: "Trente-quatre coups après la naissance de l'isolani, la position se simplifie en une pure finale fou contre cavalier. Le cavalier de Karpov, parfaitement placé et soutenu par une structure de pions saine, maintient l'équilibre — la démonstration qu'un DÉFENSEUR n'a pas besoin de gagner pour réussir : neutraliser le dynamisme de l'isolani jusqu'à une finale nulle, face à l'un des tout meilleurs joueurs du monde de l'époque, EST la victoire de cette technique.",
      },
    ],
  },
  "jh-module-3-la-structure-carlsbad": {
    steps: [
      {
        title: "Petrosian – Krogius, Tbilisi 1959",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Cette partie ne commence pas en Gambit Dame refusé mais en défense Grünfeld/Est-indienne — la preuve que la structure Carlsbad peut naître de bien des ordres de coups différents, pas seulement de la Variante d'échange classique.",
        moveSan: ["d4", "Nf6", "Nf3", "g6", "c4", "Bg7", "Nc3", "d5"],
      },
      {
        title: "La structure Carlsbad apparaît",
        fen: "rnbqk2r/ppp1ppbp/6p1/3p2B1/2PPn3/2N2N2/PP2PPPP/R2QKB1R w KQkq - 2 6",
        text: "La séquence 6.cxd5 Nxg5 7.Nxg5 e6 8.Nf3 exd5 fait apparaître, quelques coups plus tard, exactement le squelette Carlsbad : pion d4 blanc privé de son pion c, pion d5 noir privé de son pion e — le point de départ classique du plan de minorité.",
        moveSan: ["cxd5", "Nxg5", "Nxg5", "e6", "Nf3", "exd5"],
      },
      {
        title: "Le plan blanc : b4, jamais le pion c",
        fen: "r1bq1rk1/ppp1npbp/6p1/3p4/3P4/2NBPN2/PP3PPP/R2Q1RK1 w - - 5 12",
        text: "PRO TIP de Jesper Hall sur l'attaque de minorité : le camp attaquant pousse SES pions a et b vers l'aile dame adverse — mais ne touche JAMAIS à son propre pion c. C'est l'échange qui doit venir de l'adversaire, pas de vous.",
        moveSan: ["b4"],
        highlights: [{ square: "b4", color: "green" }, { square: "c6", color: "red" }],
      },
      {
        title: "Bxf5 puis b5 : préparer la fissure",
        fen: "r2q1rk1/ppp1npbp/6p1/3p1b2/1P1P4/2NBPN2/P4PPP/R2Q1RK1 w - - 1 13",
        text: "Petrosian échange d'abord la pièce qui pourrait gêner sa poussée, puis enfonce le clou avec b5 — la minorité (deux pions a/b) s'apprête à forcer un échange qui va abîmer les pions noirs, quel que soit le sens dans lequel Noir reprend.",
        moveSan: ["Bxf5", "Nxf5", "b5"],
      },
      {
        title: "bxc6 : la faiblesse est créée",
        fen: "1r1r4/pp2npbk/2pq2pp/1PNp4/3P4/1Q2PNP1/P1R2P1P/2R3K1 w - - 3 22",
        text: "L'instant précis où le plan de minorité aboutit : bxc6 bxc6 laisse le pion c6 noir arriéré sur une colonne c désormais grande ouverte — la cible fixe qui va peser pour le reste de la partie.",
        moveSan: ["bxc6", "bxc6"],
        highlights: [{ square: "c6", color: "red" }],
        arrows: [{ from: "b5", to: "c6", color: "green" }],
      },
      {
        title: "Le point culminant : Nxc6 et Rxc6",
        fen: "r3r3/p3npbk/2p4p/N2p1qp1/Q2P4/4PNPP/P1R2PK1/2R5 w - - 1 28",
        text: "Après une longue phase de regroupement (Na4-c5-b7-a5), Petrosian récolte tout simplement la faiblesse c6 et plante sa tour dessus — la terre promise de toute attaque de minorité réussie.",
        moveSan: ["Nxc6", "Qe4", "Rc5", "f5", "Qc2", "Nxc6", "Rxc6"],
      },
      {
        title: "La conversion",
        fen: "r3r3/p5bk/2R4p/3p4/3Pqp2/5NPP/P1Q2PK1/2R5 w - - 0 33",
        text: "Krogius tente un coup de désespoir tactique (Bxd4) mais Petrosian consolide sans se troubler puis gagne aussi le pion d5 — la pression positionnelle accumulée depuis le coup 12 se transforme en domination matérielle totale. Blanc gagne quelques coups plus tard.",
        moveSan: ["g4", "Bxd4", "Qd2", "Bg7", "Re1", "Qa4", "Qxd5"],
      },
    ],
  },
  "jh-module-4-la-structure-maroczy": {
    steps: [
      {
        title: "Lutz – Vokac, Dortmund 1991",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Un Dragon accéléré : Blanc installe immédiatement les deux piliers du Bind Maroczy, les pions c4 et e4, avant même de développer son cavalier roi.",
        moveSan: ["d4", "g6", "c4", "Bg7", "Nf3", "c5", "e4"],
      },
      {
        title: "Les deux piliers : c4 et e4",
        fen: "rnbqk1nr/pp1pppbp/6p1/8/2PNP3/8/PP3PPP/RNBQKB1R b KQkq - 0 5",
        text: "PRO TIP de Jesper Hall sur le Bind : les pions c4 et e4 interdisent à jamais ...d5 (contrôlé par c4) et rendent ...b5 improductif (repris par c4) — Noir doit désormais chercher son contre-jeu par les pièces, jamais par les pions centraux.",
        highlights: [{ square: "c4", color: "green" }, { square: "e4", color: "green" }, { square: "d5", color: "red" }],
        arrows: [{ from: "c4", to: "d5", color: "red" }, { from: "e4", to: "d5", color: "red" }],
      },
      {
        title: "Na1 ! Éviter tous les échanges",
        fen: "1rrqb1k1/1p1nppbp/2np2p1/3N4/p1P1P3/1N2BP2/PP1QB1PP/2RR3K w - - 0 19",
        text: "Second PRO TIP, à l'inverse de la lutte contre l'isolani : le camp qui TIENT le Bind veut GARDER un maximum de pièces sur l'échiquier, car c'est le nombre de pièces qui amplifie l'effet d'étouffement. Lutz retraite lui-même son cavalier plutôt que d'autoriser le moindre échange.",
        moveSan: ["Na1"],
        highlights: [{ square: "a1", color: "green" }],
      },
      {
        title: "b4 : l'espace continue de grandir",
        fen: "2rqb1k1/1r2ppbp/1pnp2p1/2nN4/p1P1P2B/5P2/PPNQB1PP/1R1R3K w - - 8 24",
        text: "Même en évitant les échanges de pièces, Blanc continue de gagner de l'espace avec les pions : b4 puis la reprise axb3 consolident l'aile dame sans jamais relâcher la pression.",
        moveSan: ["b4", "axb3", "axb3"],
      },
      {
        title: "e5 ! La percée centrale du Bind",
        fen: "r2q2k1/4pbbp/1pnpnpp1/3N4/1PP1PPBB/4N3/r5PP/1R1RQ2K w - - 3 31",
        text: "L'arme ultime du Bind : avec Noir totalement corseté, Blanc ouvre enfin le centre avec e5. Nxf6+ force la reprise exf6, puis Rxd8+ enlève la dame noire contre une simple tour — un gain matériel décisif.",
        moveSan: ["e5", "dxe5", "Nxf6+", "exf6", "Rxd8+", "Rxd8"],
        highlights: [{ square: "e5", color: "green" }],
        arrows: [{ from: "e4", to: "e5", color: "green" }],
      },
      {
        title: "Bxh7 ! Le sacrifice qui décide",
        fen: "4rb1k/r4b1p/1p3P2/1P3BQ1/2P5/7P/6P1/3R3K w - - 3 47",
        text: "Le coup qui couronne toute la partie : des années — ou plutôt des dizaines de coups — à restreindre les pièces noires payent enfin par un sacrifice direct à l'aile roi.",
        moveSan: ["Bxh7", "Kxh7"],
      },
      {
        title: "La conversion",
        fen: "5b2/r4b1k/1p3P2/1P4Q1/2P1R3/7P/6P1/7K b - - 0 49",
        text: "Technique de clôture classique : échanger les tours pour simplifier vers une position matériellement et positionnellement gagnante — la démonstration complète du Bind, depuis l'installation des pions c4/e4 jusqu'au sacrifice décisif.",
      },
    ],
  },
  // Modules 5 et 7 (2026-09-11, « Lot 3 » du cursus Jesper Hall — clôture des
  // structures de pions du milieu de partie), même méthode que le Lot 2 :
  // 7 chapitres tirés d'UNE partie réelle authentique, parsée et vérifiée
  // coup par coup avec chess.js (`course-lesson.test.ts`) ; la même partie
  // alimente aussi la vague de 14 puzzles du thème dans
  // `MASTER_PUZZLES_DATASET`. Sur les 3 sources désignées par le cahier des
  // charges, DEUX ont dû être vérifiées puis remplacées (même schéma qu'au
  // Lot 2, présenté à l'utilisateur via question avant rédaction) :
  //  - `jh-module-5` : « Fischer–Andersson, Belgrade 1970 » n'existe pas —
  //    la vraie partie s'est jouée à Siegen (exhibition en marge de
  //    l'Olympiade), pas à Belgrade. Gardée telle quelle, ville corrigée :
  //    Robert Fischer – Ulf Andersson, Siegen 1970 (1-0, 43 coups,
  //    chessgames.com/perl/chessgame?gid=1019452) — LA partie fondatrice du
  //    Hérisson citée par l'article Wikipédia « Hedgehog (chess) » (« one of
  //    the first games to feature this method of development »), qui a
  //    d'ailleurs convaincu Andersson lui-même de devenir un spécialiste du
  //    Hérisson après cette défaite.
  //  - `jh-module-6` (chaîne de pions) : Nimzowitsch–Salwe, Karlsbad 1911
  //    confirmée correcte — mais son thème catalogue avait déjà 21 chapitres
  //    narratifs depuis le 2026-09-08 (voir plus haut) ; voir la note juste
  //    avant `jh-module-6-la-chaine-de-pions-en-francais` plus bas pour la
  //    méthode retenue (préfixe tutoriel, pas de remplacement).
  //  - `jh-module-7` : « Botvinnik–Vidmar, Nottingham 1936 » est EXACTEMENT
  //    la partie déjà écartée pour Carlsbad au Lot 2 (un classique de
  //    l'isolani, pas des pions doublés) — recyclée par erreur par le cahier
  //    des charges. Remplacée par Aron Nimzowitsch – Jose Raul Capablanca,
  //    Saint-Pétersbourg 1914 (0-1, 42 coups,
  //    chessgames.com/perl/chessgame?gid=1102386, « Burn the Witsch! ») :
  //    9.Nxc6 bxc6 double authentiquement les pions c noirs, puis toute la
  //    seconde moitié de la partie montre Capablanca compenser entièrement
  //    cette faiblesse par l'activité de ses pièces — un premier chapitre
  //    volontairement nuancé sur le thème plutôt qu'une démonstration à sens
  //    unique.
  "jh-module-5-le-herisson-hedgehog": {
    steps: [
      {
        title: "Fischer – Andersson, Siegen 1970",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Une partie d'exhibition disputée en marge de l'Olympiade de Siegen, mais promise à devenir historique : Fischer adopte 1.b3, une mise en place dite « Hérisson inversé » — Blanc joue avec les pions restreints (b3, c4, e3) et le Fou fianchetto typiques du Hérisson noir, mais avec un temps de plus. PRO TIP de Jesper Hall : cette partie a tellement impressionné Andersson lui-même qu'il en est devenu, dans le camp adverse, l'un des plus grands spécialistes du vrai Hérisson.",
        moveSan: ["b3", "e5", "Bb2", "Nc6", "c4", "Nf6", "e3", "Be7"],
        highlights: [
          { square: "b3", color: "green" },
          { square: "c4", color: "green" },
          { square: "e3", color: "green" },
        ],
      },
      {
        title: "La patience avant tout : ne rien précipiter",
        fen: "r1bqk2r/ppppbppp/2n2n2/4p3/2P5/1P2P3/PB1P1PPP/RN1QKBNR w KQkq - 1 5",
        text: "PRO TIP : le principe numéro un du Hérisson (dans un sens comme dans l'autre) est de ne fixer aucun pion avant d'avoir fini son développement. Fischer prend neuf coups pour ranger toutes ses pièces (a3, Qc2, d3, Nf3, Be2) sans jamais toucher à sa structure de pions b3-c4-e3 — la flexibilité reste entière tant que l'adversaire n'a pas révélé son propre plan.",
        moveSan: ["a3", "O-O", "Qc2", "Re8", "d3", "Bf8", "Nf3", "a5", "Be2"],
      },
      {
        title: "Andersson ouvre le centre — et perd le Hérisson",
        fen: "r1bqrbk1/1ppp1ppp/2n2n2/p3p3/2P5/PP1PPN2/1BQ1BPPP/RN2K2R b KQ - 1 9",
        text: "En jouant ...d5, Andersson renonce précisément à la retenue qui caractérise le Hérisson : le centre s'ouvre, ses pièces se dégagent, mais avec elles disparaît la principale arme défensive de la structure — la case d5 elle-même, que Fischer reprend aussitôt à son compte. PRO TIP : contre un Hérisson (ou son inverse), c'est souvent l'impatience du camp restreint qui offre à l'autre son premier vrai point d'appui.",
        moveSan: ["d5", "cxd5", "Nxd5", "Nbd2", "f6", "O-O", "Be6"],
        highlights: [{ square: "d5", color: "red" }],
      },
      {
        title: "Kh1, Rg1, g4 : la méthode qui a donné son nom à la partie",
        fen: "r2qrbk1/1pp3pp/2n1bp2/p2np3/8/PP1PPN2/1BQNBPPP/R4RK1 w - - 2 13",
        text: "Le plan devenu manuel depuis cette partie précise, cité par l'article Wikipédia consacré au Hérisson : le Roi se met à l'abri sur h1, la Tour vient sur la colonne g AVANT que le pion g n'avance, puis g4 lance l'assaut. PRO TIP de Jesper Hall : contre une structure restreinte et sans contre-jeu central immédiat, une majorité de pions à l'aile roi doit toujours avancer précédée de ses pièces, jamais l'inverse.",
        moveSan: ["Kh1", "Qd7", "Rg1", "Rad8", "Ne4", "Qf7", "g4"],
        highlights: [{ square: "h1", color: "green" }, { square: "g1", color: "green" }],
        arrows: [{ from: "g2", to: "g4", color: "green" }],
      },
      {
        title: "Le second PRO TIP : la danse des pièces avant la percée",
        fen: "3rr1k1/1pp2qbp/2n1bpp1/p2np3/4N1P1/PP1PPNR1/1BQ1BP1P/R6K w - - 2 18",
        text: "Fischer double ses Tours derrière le pion g (Rag1) puis lance son Cavalier dans une longue série de sauts (Nc5-Nh4-Ne4-Nf5-Nc5) qui semblent ne rien faire — en réalité, chaque saut pousse une pièce noire à reculer d'une case, grignotant peu à peu l'espace de manœuvre d'Andersson jusqu'à l'étouffement complet.",
        moveSan: ["Rag1", "Nb6", "Nc5", "Bc8", "Nh4", "Nd7", "Ne4", "Nf8", "Nf5", "Be6", "Nc5", "Ne7"],
      },
      {
        title: "La percée : Nxg7 ! puis g5 !",
        fen: "3rrnk1/1pp1nqbp/4bpp1/p1N1pN2/6P1/PP1PP1R1/1BQ1BP1P/6RK w - - 14 24",
        text: "Le fruit de toute la manœuvre précédente : Nxg7 arrache le rempart du roi noir, puis g5 chasse le Cavalier tout juste réinstallé et prépare gxf6+, ouvrant définitivement les lignes contre un roi noir désormais totalement exposé.",
        moveSan: ["Nxg7", "Kxg7", "g5", "Nf5", "Rf3", "b6", "gxf6+", "Kh8", "Nxe6", "Rxe6"],
        highlights: [{ square: "g7", color: "red" }],
      },
      {
        title: "Bxd6+, le coup qui décide",
        fen: "5k2/2p2q1p/1p1n1Pn1/p3B1Q1/4PP2/PP5R/3r4/6RK w - - 3 43",
        text: "Le clou final : Bxd6+ est un échec auquel Noir n'a aucune bonne réponse, la Dame blanche en g5 et la Tour h3 surveillant déjà toutes les issues autour du roi acculé — Andersson abandonne. Retenir la leçon complète : patience dans le développement, structure restreinte gardée flexible aussi longtemps que possible, puis assaut méthodique Kh1-Rg1-g4 d'un seul côté — exactement le manuel que Wikipédia cite comme fondateur du Hérisson moderne.",
        moveSan: ["Bxd6+"],
      },
    ],
  },
  "jh-module-7-structures-a-pions-doubles": {
    steps: [
      {
        title: "Nimzowitsch – Capablanca, Saint-Pétersbourg 1914",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Le tournoi le plus légendaire de l'histoire pré-moderne : Lasker, Capablanca, Alekhine, Tarrasch, Marshall et Nimzowitsch s'y affrontent tous. Face au futur théoricien de « Mon Système », Capablanca choisit une défense Steinitz différée contre l'Espagnole. PRO TIP de Jesper Hall pour ce module : les pions doublés ont mauvaise réputation, mais cette partie va montrer à la fois comment ils naissent ET comment ils peuvent être entièrement compensés.",
        moveSan: ["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6", "Bb5", "d6", "d4", "Bd7"],
      },
      {
        title: "Bxc6 : Nimzowitsch échange son bon Fou",
        fen: "r2qkb1r/pppb1ppp/2np1n2/1B2p3/3PP3/2N2N2/PPP2PPP/R1BQK2R w KQkq - 1 6",
        text: "Premier temps du plan : Nimzowitsch cède volontairement la paire de Fous en échangeant sur c6. Ce choix n'a de sens qu'en vue d'une seconde opération, quelques coups plus tard, sur cette même case c6 — préparer la naissance de pions doublés chez l'adversaire vaut parfois de céder un léger avantage immédiat.",
        moveSan: ["Bxc6", "Bxc6", "Qd3", "exd4", "Nxd4"],
        highlights: [{ square: "c6", color: "green" }],
      },
      {
        title: "Nxc6 ! bxc6 — les pions doublés naissent",
        fen: "r2qkb1r/ppp2p1p/2bp1np1/8/3NP3/2NQ4/PPP2PPP/R1B1K2R w KQkq - 0 9",
        text: "Le moment clé du thème : en échangeant son Cavalier contre le Fou noir revenu sur c6, Nimzowitsch force Noir à reprendre du pion b — Capablanca se retrouve avec deux pions sur la colonne c (c6 et c7), doublés et incapables de se défendre mutuellement. PRO TIP : des pions doublés créent presque toujours un SECOND défaut collatéral — ici, la colonne b totalement ouverte pour les pièces blanches.",
        moveSan: ["Nxc6", "bxc6"],
        highlights: [{ square: "c6", color: "red" }, { square: "c7", color: "red" }],
        arrows: [{ from: "b7", to: "c6", color: "red" }],
      },
      {
        title: "La Dame blanche exploite aussitôt la faiblesse",
        fen: "r2qkb1r/p1p2p1p/2pp1np1/8/4P3/2NQ4/PPP2PPP/R1B1K2R w KQkq - 0 10",
        text: "Sans perdre un instant, Nimzowitsch envoie sa Dame sur les cases fraîchement affaiblies par l'échange : Qa6 puis Qb7 grignotent déjà le pion a7. PRO TIP : la vraie faiblesse d'un pion doublé n'est presque jamais le pion lui-même, mais l'espace et les cases que sa disparition ou son immobilité laissent aux pièces adverses.",
        moveSan: ["Qa6", "Qd7", "Qb7", "Rc8", "Qxa7"],
      },
      {
        title: "La réponse de Capablanca : l'activité plutôt que la passivité",
        fen: "2r1r1k1/2p2pbp/2ppq1p1/8/2n1P3/2N2P2/PPPBQ1PP/R4RK1 w - - 5 19",
        text: "Plutôt que de défendre indéfiniment ses pions faibles, Capablanca choisit exactement le remède classique : l'activité maximale de ses pièces. Son Cavalier saute sur c4, sa Dame prend des postes agressifs — la meilleure défense contre une structure abîmée n'est presque jamais statique. PRO TIP de Jesper Hall : des pions doublés ne sont un handicap réel QUE si le camp qui les possède reste passif.",
        moveSan: ["Rab1", "Ra8", "a4", "Nxd2", "Qxd2", "Qc4"],
      },
      {
        title: "Le paiement en retour : Rxb2",
        fen: "1r4k1/2p2p1p/2pp2p1/6Q1/Prq1P3/2N2P2/1PP3PP/3R3K w - - 2 28",
        text: "La boucle se ferme : la colonne b, ouverte par le tout premier échange (9...bxc6) qui avait créé les pions doublés noirs, sert désormais de rampe d'accès à la Tour noire — qui vient croquer le pion b2 blanc. La compensation est déjà totale.",
        moveSan: ["h4", "Rxb2"],
        highlights: [{ square: "b2", color: "red" }],
      },
      {
        title: "Nimzowitsch abandonne",
        fen: "6k1/r1p2p1p/2p3p1/2qp4/7R/2N2P2/1rPQ2PK/8 w - - 0 42",
        text: "Nimzowitsch, matériel et position totalement compromis, joue son dernier coup avant d'abandonner. Le bilan complet du module : oui, les pions doublés sont une faiblesse structurelle réelle (Nxc6/bxc6 puis Qa6/Qb7 le montrent) — mais l'activité des pièces, le plan choisi ici par Capablanca, peut totalement l'annuler, voire la retourner contre son adversaire. Un premier chapitre volontairement nuancé, avant des démonstrations plus tranchées ailleurs dans le catalogue.",
        moveSan: ["Nd1"],
      },
    ],
  },
  // `jh-module-8-le-roque-oppose-et-l-attaque-de-pions` (2026-09-11, Lot 4) :
  // Anatoly Karpov – Viktor Korchnoi, Finale des Candidats, Moscou 1974,
  // partie 2 (chessgames.com/perl/chessgame?gid=1067858, confirmé via curl —
  // B77, Dragon, Attaque Yougoslave, roques opposés, 1-0). Le cahier des
  // charges désignait déjà la bonne partie — vérifiée avant rédaction,
  // aucune substitution nécessaire pour ce module.
  "jh-module-8-le-roque-oppose-et-l-attaque-de-pions": {
    steps: [
      {
        title: "Anatoly Karpov – Viktor Korchnoi, Moscou 1974 (Finale des Candidats, partie 2)",
        fen: "r1bqk2r/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPP3PP/R2QKB1R w KQkq - 1 8",
        text: "Dragon, Attaque Yougoslave : les Blancs préparent le roque long pendant que les Noirs viennent de roquer court. Dès que les rois se mettent sur des ailes opposées, chaque camp sait déjà quel plan jouer — Karpov lance IMMÉDIATEMENT h4, sans même avoir encore roqué : dans une course de vitesse, le tempo compte plus que la sécurité formelle du roi.",
        moveSan: ["Qd2", "O-O", "Bc4", "Bd7"],
        arrows: [{ from: "h2", to: "h4", color: "green" }],
        highlights: [{ square: "g8", color: "red" }],
      },
      {
        title: "Karpov – Korchnoi : coup 12, le roque long enfin joué",
        fen: "2rq1rk1/pp1bppbp/2np1np1/8/3NP2P/1BN1BP2/PPPQ2P1/R3K2R b KQ - 2 11",
        text: "PRO TIP de Jesper Hall : une fois le plan de pions lancé, le roi peut se mettre à l'abri à tout moment — ici Karpov roque long seulement au coup 12, après avoir déjà avancé son pion h. Korchnoi riposte aussitôt en envoyant son Cavalier vers c4, cherchant à ouvrir des lignes contre le roi blanc tout juste installé : le miroir exact du danger que les Blancs préparent de l'autre côté.",
        moveSan: ["Ne5", "O-O-O", "Nc4", "Bxc4"],
        arrows: [{ from: "e1", to: "c1", color: "green" }, { from: "e5", to: "c4", color: "red" }],
      },
      {
        title: "Karpov – Korchnoi : coups 14-15, l'assaut continue",
        fen: "3q1rk1/pp1bppbp/3p1np1/8/2rNP2P/2N1BP2/PPPQ2P1/2KR3R w - - 0 14",
        text: "Les Blancs sacrifient volontiers l'intégrité de leur propre structure de pions pour gagner des tempos : h5 chasse le Cavalier qui doit le prendre (Nxh5), puis g4 le chasse à nouveau (Nf6). PRO TIP : dans une course de roques opposés, chaque tempo gagné dans l'ouverture des lignes vaut plus qu'un pion isolé ou doublé — la seule question qui compte est « qui arrive en premier ? ».",
        moveSan: ["h5", "Nxh5", "g4", "Nf6"],
        arrows: [{ from: "h4", to: "h5", color: "green" }, { from: "g2", to: "g4", color: "green" }],
      },
      {
        title: "Karpov – Korchnoi : coups 17-18, éliminer le défenseur",
        fen: "5rk1/pp1bppbp/3p1np1/q7/2r1P1P1/2N1BP2/PPPQN3/2KR3R w - - 3 17",
        text: "Bh6 ! échange le Fou de fianchetto noir, LE défenseur naturel du roque court — un motif classique de l'attaque de pions : retirer la pièce qui protège les cases claires/foncées autour du roi adverse avant même d'y envoyer les pions ou les pièces lourdes.",
        moveSan: ["Bh6", "Bxh6", "Qxh6", "Rfc8"],
        arrows: [{ from: "e3", to: "h6", color: "green" }],
        highlights: [{ square: "g7", color: "red" }],
      },
      {
        title: "Karpov – Korchnoi : coups 19-20, la Tour bascule",
        fen: "2r3k1/pp1bpp1p/3p1npQ/q7/2r1P1P1/2N2P2/PPP1N3/2KR3R w - - 1 19",
        text: "Karpov regroupe calmement sa Tour vers l'aile roi (Rd3) puis relance un second pion (g5) : Korchnoi, de son côté, tente une contre-attaque sur la colonne c avec R4c5, mais elle n'a toujours produit aucune menace concrète — elle arrive un temps trop tard.",
        moveSan: ["Rd3", "R4c5", "g5", "Rxg5"],
        arrows: [{ from: "d1", to: "d3", color: "green" }],
      },
      {
        title: "Karpov – Korchnoi : coups 21-22, une petite opération tactique",
        fen: "2r3k1/pp1bpp1p/3p1npQ/q5r1/4P3/2NR1P2/PPP1N3/2K4R w - - 0 21",
        text: "Un échange de Tours suivi d'une reprise par le Cavalier (Rd5, Rxd5, Nxd5) maintient l'initiative sans perdre le moindre tempo : le Cavalier s'installe sur l'avant-poste central d5, verrou qui prépare directement la percée e5 à venir.",
        moveSan: ["Rd5", "Rxd5", "Nxd5", "Re8"],
      },
      {
        title: "Karpov – Korchnoi : coups 24-27, la percée décisive",
        fen: "4r1k1/pp2pp1p/2bp1npQ/q2N4/4PN2/5P2/PPP5/2K4R w - - 3 24",
        text: "e5 ouvre la grande diagonale, exf6 arrache complètement la couverture de pions du roque noir, et Qxh7+ suivi de Qh8+ conclut la course : l'attaque blanche arrive la première. Korchnoi abandonne face au mat forcé — la démonstration parfaite qu'en cas de roques opposés, la vitesse d'exécution prime sur tout le reste.",
        moveSan: ["e5", "Bxd5", "exf6", "exf6", "Qxh7+", "Kf8", "Qh8+"],
        arrows: [{ from: "e4", to: "e5", color: "green" }, { from: "h6", to: "h7", color: "green" }],
        highlights: [{ square: "f8", color: "red" }],
      },
    ],
  },
  // `jh-module-10-le-sacrifice-positionnel-de-qualite` (2026-09-11, Lot 4) :
  // Samuel Reshevsky – Tigran Petrosian, Zurich Candidates 1953, ronde 2
  // (chessgames.com/perl/chessgame?gid=1106248, confirmé via curl — E58,
  // Nimzo-Indienne, nulle). Le cahier des charges citait « Petrosian–Reshevsky »
  // mais les couleurs sont en réalité inversées : c'est Reshevsky qui avait
  // les Blancs, et c'est Petrosian, avec les Noirs, qui a joué le sacrifice
  // positionnel de qualité 25...Re6!! — LA référence historique du thème
  // (Mikhaïl Tal, cité par de nombreuses sources dont New In Chess). Citation
  // simplement corrigée dans le bon sens, même partie conservée.
  "jh-module-10-le-sacrifice-positionnel-de-qualite": {
    steps: [
      {
        title: "Samuel Reshevsky – Tigran Petrosian, Zurich Candidates 1953 (ronde 2)",
        fen: "r1bq1rk1/pp3ppp/2n1pn2/2pp4/2PP4/P1bBPN2/1P3PPP/R1BQ1RK1 w - - 0 9",
        text: "Nimzo-Indienne : bxc3 double les pions blancs, mais cxd5 exd5 donne aussitôt aux Noirs un pion d5 isolé en miroir. Une position équilibrée, riche en défauts structurels des deux côtés — le terrain de jeu idéal pour la manœuvre prophylactique que Petrosian va bâtir tout au long de la partie.",
        moveSan: ["bxc3", "b6", "cxd5", "exd5"],
        highlights: [{ square: "c3", color: "red" }, { square: "d5", color: "red" }],
      },
      {
        title: "Reshevsky – Petrosian : coups 11-12, Petrosian verrouille la position",
        fen: "r1bq1rk1/p4ppp/1pn2n2/2pp4/3P4/P1PBPN2/5PPP/R1BQ1RK1 w - - 0 11",
        text: "PRO TIP de Jesper Hall : la signature de Petrosian — c4 ! fixe volontairement la chaîne de pions, retire tout levier central aux Blancs et refuse toute complication prématurée, avant même de songer à une quelconque tactique. La prophylaxie précède toujours l'action chez Petrosian.",
        moveSan: ["Bb2", "c4", "Bc2", "Bg4"],
        arrows: [{ from: "c5", to: "c4", color: "green" }],
      },
      {
        title: "Reshevsky – Petrosian : coups 17-18, l'infiltration légère blanche",
        fen: "r2q1rk1/p4ppp/1pn3b1/3p4/2pP4/P1P1PP2/1BBQ2PP/R4RK1 w - - 1 17",
        text: "Reshevsky finit par rompre avec e4, gagnant de l'espace central et ouvrant des lignes vers le roque noir — la première étape d'un plan qui va bientôt amener le Fou blanc au contact du pion e6.",
        moveSan: ["e4", "Qd7", "Rae1", "dxe4"],
        arrows: [{ from: "e3", to: "e4", color: "green" }],
      },
      {
        title: "Reshevsky – Petrosian : coups 22-23, la pression sur e6",
        fen: "r5k1/p2qrppp/2n3b1/1p6/2pPPQ2/P1P5/1B4PP/3BRRK1 w - - 2 22",
        text: "Le Fou blanc vise ouvertement la case e6 tandis que les Blancs gagnent encore de l'espace avec e5 : la compensation qui va suivre pour les Noirs n'est encore visible nulle part — c'est justement tout l'art du sacrifice positionnel.",
        moveSan: ["Bg4", "Qe8", "e5", "a5"],
        arrows: [{ from: "d1", to: "g4", color: "green" }],
      },
      {
        title: "Reshevsky – Petrosian : coup 25, 25...Re6!! — la compensation invisible",
        fen: "3rq1k1/4rppp/2n3b1/pp2P3/2pP1QB1/P1P1R3/1B4PP/5RK1 w - - 2 25",
        text: "LE coup le plus célèbre de la partie : sans échec, sans menace directe, sans la moindre urgence apparente, Petrosian offre la qualité. Mikhaïl Tal disait de ce coup tranquille qu'il lui avait fait une impression indélébile — c'est le modèle absolu du sacrifice positionnel : un investissement à très long terme, encaissé bien plus tard sous forme de cases fortes, de mauvais Fou adverse et d'une masse de pions dominante, jamais sous forme d'une combinaison immédiate.",
        moveSan: ["Rfe1", "Re6"],
        highlights: [{ square: "e6", color: "green" }],
      },
      {
        title: "Reshevsky – Petrosian : coup 27, l'échange accepté",
        fen: "3rq1k1/4nppp/4r1b1/pp2P3/P1pP1QB1/2P1R3/1B4PP/4R1K1 w - - 1 27",
        text: "Bxe6 fxe6 : les Blancs empochent la qualité, mais les pions noirs e6/e7 fusionnent en un duo central massif, verrouillant les cases claires et donnant au Cavalier et au Fou restants des Noirs un contrôle total du centre — la compensation promise commence déjà à apparaître.",
        moveSan: ["Bxe6", "fxe6"],
        arrows: [{ from: "g4", to: "e6", color: "red" }],
      },
      {
        title: "Reshevsky – Petrosian : coups 37-39, la compensation se matérialise enfin",
        fen: "r5k1/6pp/Pq2p3/3nP3/1p1P4/3Q4/3B2PP/R5K1 b - - 2 37",
        text: "Douze coups après le sacrifice, la poussée de pions à l'aile dame des Noirs (b3, puis b2) crée un pion passé monstrueux qui paralyse durablement une Tour blanche entière sur b1. La partie se conclut par la nulle — mais les Noirs, malgré leur déficit matériel officiel, n'ont pas été un seul instant en danger : la preuve vivante qu'un sacrifice positionnel bien conçu peut valoir largement son prix, même sans jamais reprendre la qualité.",
        moveSan: ["b3", "Qc4", "h6", "h3", "b2"],
        highlights: [{ square: "b2", color: "green" }],
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
  // Préfixe tutoriel du 2026-09-11 (Lot 3) : `jh-module-6-la-chaine-de-pions-en-francais`
  // portait déjà, depuis le 2026-09-08, 21 chapitres narratifs (3 parties
  // réelles complètes — Najdorf-Gligoric, Nimzowitsch-Salwe, Spassky-Korchnoi,
  // voir plus haut) mais aucun tutoriel théorique. Même méthode que
  // `pm-le-mauvais-fou`/`pm-l-avant-poste-du-cavalier` (2026-09-10) : les 6
  // chapitres ci-dessous sont PRÉFIXÉS avant les 21 existants, INCHANGÉS —
  // jamais un remplacement. Sourcés de la même partie Nimzowitsch–Salwe,
  // Karlsbad 1911 déjà utilisée plus loin dans ce thème (chapitres 7 à 15) et
  // par `pm-la-surprotection-nimzowitsch`, mais volontairement limités à ses
  // tout premiers coups (1 à 7) : le principe « attaquer la base, pas la
  // tête » qui donne son nom au chapitre « The Pawn-Chain » de « Mon Système ».
  "jh-module-6-la-chaine-de-pions-en-francais": {
    steps: [
      {
        title: "La chaîne se verrouille : d4-e5 contre d5-e6",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Dès le troisième coup, la Défense française prend sa forme la plus caractéristique : Blanc pousse e5, verrouillant deux chaînes de pions diagonales imbriquées — d4-e5 pour Blanc, d5-e6 pour Noir. PRO TIP de Jesper Hall : dans une chaîne de pions, chaque maillon a un rôle précis — la BASE (le pion le plus en arrière, ici d4) est toujours le point faible ; la TÊTE (le pion le plus avancé, ici e5) est en général bien défendue et sans grand intérêt à attaquer directement.",
        moveSan: ["e4", "e6", "d4", "d5", "e5"],
        highlights: [
          { square: "d4", color: "red" },
          { square: "e5", color: "green" },
        ],
      },
      {
        title: "Noir applique aussitôt la règle d'or",
        fen: "rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
        text: "...c5 ! Noir n'attend pas une seconde pour appliquer le principe fondamental : viser la BASE de la chaîne adverse (d4), jamais sa tête. C'est exactement ce réflexe — canonisé depuis par Nimzowitsch lui-même dans « Mon Système » à partir de CETTE partie précise — que ce module veut vous transmettre.",
        moveSan: ["c5"],
        highlights: [{ square: "d4", color: "red" }],
        arrows: [{ from: "c5", to: "d4", color: "red" }],
      },
      {
        title: "Blanc renforce sa base avant l'assaut",
        fen: "rnbqkbnr/pp3ppp/4p3/2ppP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4",
        text: "Réponse logique : c3 vient étayer la base d4 avant même qu'elle ne soit sérieusement menacée. PRO TIP : protéger une base MENACÉE est une nécessité ; la protéger par anticipation, avant la menace, est un signe de maîtrise.",
        moveSan: ["c3"],
        highlights: [{ square: "d4", color: "green" }],
      },
      {
        title: "Chaque camp développe vers son propre flanc",
        fen: "rnbqkbnr/pp3ppp/4p3/2ppP3/3P4/2P5/PP3PPP/RNBQKBNR b KQkq - 0 4",
        text: "Les pièces se placent naturellement en fonction de la direction de la chaîne : le Cavalier noir vient sur c6 pour appuyer la pression sur d4, la Dame se poste en b6 sur la même diagonale, pendant que le Fou blanc se dirige vers d3, sur la diagonale qui deviendra utile à l'aile roi — exactement là où pointe la tête e5 de sa propre chaîne.",
        moveSan: ["Nc6", "Nf3", "Qb6", "Bd3", "Bd7"],
      },
      {
        title: "Céder un maillon plutôt que le défendre indéfiniment",
        fen: "r3kbnr/pp1b1ppp/1qn1p3/2ppP3/3P4/2PB1N2/PP3PPP/RNBQK2R w KQkq - 5 7",
        text: "Plutôt que de prolonger la défense de d4 coup après coup, Blanc cède lui-même ce maillon contre le pion c5 noir. PRO TIP : perdre un pion de la chaîne n'est pas nécessairement une erreur — ici, Blanc gagne du temps de développement et conserve intacte sa tête e5, désormais une véritable épine isolée dans le camp noir.",
        moveSan: ["dxc5", "Bxc5"],
        highlights: [{ square: "e5", color: "green" }],
      },
      {
        title: "Un premier aperçu du principe en place",
        fen: "r3k1nr/pp1b1ppp/1qn1p3/2bpP3/8/2PB1N2/PP3PPP/RNBQK2R w KQkq - 0 8",
        text: "La base d4 a disparu, mais le principe qu'elle illustrait reste entier — et c'est loin d'être la fin de l'histoire de cette chaîne de pions dans cette partie. Les chapitres qui suivent explorent le thème à travers trois parties de maîtres bien distinctes : Najdorf-Gligoric (la variante qui a donné son nom au plan complet des deux chaînes opposées), CETTE partie Nimzowitsch-Salwe rejouée en intégralité jusqu'à l'abandon noir, puis Spassky-Korchnoi (la même structure fondamentale reprise à l'ère moderne).",
      },
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
  // (2026-09-11, Lot 4) 8 nouveaux steps PRÉPENDÉS avant les 23 existants :
  // Anatoly Karpov – Joël Lautier, Dortmund Sparkassen 1995, ronde 9
  // (chessgames.com/perl/chessgame?gid=1069252, confirmé via curl — D45,
  // Semi-Slave, 1-0). Le cahier des charges désignait « Pillsbury–Lasker,
  // Nuremberg 1896 » — partie INEXISTANTE dans ce sens : la seule partie
  // Pillsbury-Lasker de ce tournoi (ronde 9, « Full Nelson ») est une
  // Défense Française avec sacrifice de tour, aucun rapport avec l'attaque
  // de minorité ; Pillsbury–Tarrasch, Hastings 1895 (D63) vérifiée par
  // acquit de conscience, également hors-sujet (structure verrouillée par
  // 11...c4). Remplacée, après validation utilisateur, par Karpov–Lautier —
  // une des 3 parties canoniques citées par l'article Wikipédia
  // « Minority attack » (avec Petrosian–Krogius déjà utilisée au Lot 2 pour
  // `jh-module-3` et Seirawan–Tal, Niksic 1983, non retenue ici).
  "jh-module-9-la-minorite-d-attaque": {
    steps: [
      {
        title: "Anatoly Karpov – Joël Lautier, Dortmund 1995 (partie canonique de l'attaque de minorité selon Wikipédia)",
        fen: "3rrnk1/pp3pp1/1bp1bn1p/4q3/8/P2BP1NP/1PQBNPP1/R2R2K1 w - - 10 20",
        text: "Structure Carlsbad classique : les Blancs n'ont que 2 pions à l'aile dame (a,b) contre 3 aux Noirs (a,b,c) — MOINS de pions, pas plus. C'est précisément pour cette raison que 20.b4! lance l'attaque de minorité : l'objectif n'est jamais de gagner du terrain, mais de forcer bxc6 pour transformer le pion c noir en faiblesse permanente et irréparable.",
        moveSan: ["b4", "Ng6", "a4", "a6"],
        arrows: [{ from: "b2", to: "b4", color: "green" }],
        highlights: [{ square: "c6", color: "red" }],
      },
      {
        title: "Karpov – Lautier : coups 22-23, régrouper avant de frapper",
        fen: "3rr1k1/1p3pp1/pbp1bnnp/4q3/PP6/3BP1NP/2QBNPP1/R2R2K1 w - - 0 22",
        text: "Les Blancs ne se précipitent pas : Bc3 puis l'échange des Fous sur d4 préparent méthodiquement la percée b5, en s'assurant qu'aucune pièce noire ne pourra harceler le pion b une fois lancé.",
        moveSan: ["Bc3", "Qg5", "Bd4", "Bxd4"],
        arrows: [{ from: "d2", to: "c3", color: "green" }],
      },
      {
        title: "Karpov – Lautier : coup 25, garder le centre flexible",
        fen: "3rr1k1/1p3pp1/p1p2nnp/3b2q1/PP1N4/3BP1NP/2Q2PP1/R2R2K1 w - - 1 25",
        text: "e4 fixe le centre sans se hâter : PRO TIP de Jesper Hall — l'attaque de minorité est un plan LENT, presque un cheminement en plusieurs étapes ; rien n'oblige à jouer b5 dans l'instant tant que la position centrale reste sous contrôle.",
        moveSan: ["e4", "Be6", "Nf3", "Qf4"],
        arrows: [{ from: "e3", to: "e4", color: "green" }],
      },
      {
        title: "Karpov – Lautier : coup 27, la percée b5",
        fen: "3rr1k1/1p3pp1/p1p1bnnp/8/PP2Pq2/3B1NNP/2Q2PP1/R2R2K1 w - - 3 27",
        text: "b5 ! ouvre enfin les hostilités. Après axb5 axb5, la colonne a s'ouvre et le coup bxc6 devient jouable à tout moment — le pion noir c6 va devenir la cible isolée de toute la partie, exactement le scénario que « minorité contre majorité » promet depuis le coup 20.",
        moveSan: ["b5", "axb5", "axb5", "Ne5"],
        arrows: [{ from: "b4", to: "b5", color: "green" }],
      },
      {
        title: "Karpov – Lautier : coups 30-31, la faiblesse naît (bxc6)",
        fen: "3rr1k1/1p3pp1/2p1bn1p/1P2q3/4P3/3B2NP/2Q2PP1/R2R2K1 w - - 0 30",
        text: "bxc6 bxc6 : le pion c noir est désormais définitivement isolé et arriéré, sans aucun pion voisin pour le soutenir. Toute la stratégie des 10 coups précédents n'avait qu'un seul but — créer exactement cette faiblesse.",
        moveSan: ["bxc6", "bxc6", "Rac1", "Rd6"],
        highlights: [{ square: "c6", color: "red" }],
      },
      {
        title: "Karpov – Lautier : coups 32-33, la pression s'accumule puis se simplifie",
        fen: "4r1k1/5pp1/2prbn1p/4q3/4P3/3B2NP/2Q2PP1/2RR2K1 w - - 2 32",
        text: "Les Blancs empilent leurs pièces sur la colonne c (Qc3, Rac1) et acceptent volontiers les échanges qui s'ensuivent — chaque simplification profite à celui qui possède la faiblesse durable, jamais à celui qui la défend.",
        moveSan: ["Qc3", "Nd7", "Be2", "Rxd1+"],
        arrows: [{ from: "c2", to: "c3", color: "green" }],
      },
      {
        title: "Karpov – Lautier : coups 40-41, le paiement différé",
        fen: "4r1k1/3n1bp1/5p1p/2p5/3NPPB1/2R4P/6P1/6K1 w - - 4 40",
        text: "Vingt coups après bxc6, le Cavalier blanc s'infiltre enfin via b5-d6 : la faiblesse créée au milieu de partie ne rapporte ses fruits que dans le finale. PRO TIP : c'est le trait le plus caractéristique de l'attaque de minorité — la compensation matérielle ou positionnelle peut se faire attendre très longtemps avant de se concrétiser.",
        moveSan: ["Nb5", "Nb6", "Nd6", "Na4"],
        arrows: [{ from: "d4", to: "b5", color: "green" }, { from: "b5", to: "d6", color: "green" }],
      },
      {
        title: "Karpov – Lautier : coups 43-44, le pion passé décide",
        fen: "r5k1/5bp1/3N1p1p/2p5/n3PPB1/R6P/6P1/6K1 w - - 10 43",
        text: "e5 puis e6 : le pion e blanc, libre de toute entrave depuis l'ouverture du centre, se transforme en pion passé décisif. Lautier abandonne — la faiblesse du pion c6, créée trente coups plus tôt par la seule attaque de minorité, a fini par déterminer toute l'issue de la partie.",
        moveSan: ["e5", "Bd5", "e6"],
        arrows: [{ from: "e5", to: "e6", color: "green" }],
      },
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
  // (2026-09-12, Lot 5) 8 nouveaux steps PRÉPENDÉS avant les 14 existants :
  // Veselin Topalov (Blancs) – Alexei Shirov (Noirs), Linares 1998, ronde 10
  // (D85, Gambit Dame Refusé Grünfeld Échange, 0-1). Le cahier des charges
  // désignait « Shirov–Topalov » mais les couleurs sont en réalité inversées
  // (confirmé, AskUserQuestion) — LA partie la plus célèbre de l'histoire des
  // finales de Fous de couleurs opposées, avec le sacrifice 47...Bh3!!.
  "jh-module-12-les-finales-de-fous-de-couleurs-opposees": {
    steps: [
      {
        title: "Veselin Topalov – Alexei Shirov, Linares 1998 (ronde 10)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Grünfeld Échange : Noir cède le centre (d4/c4/e4) contre l'activité de pièces, notamment le Fou de g7 sur la grande diagonale. PRO TIP de Jesper Hall pour ce module : rien dans cette structure de départ ne laisse deviner qu'elle va déboucher, trente coups plus tard, sur la finale de Fous de couleurs opposées la plus célèbre de toute l'histoire des échecs — et sur l'un des sacrifices les plus audacieux jamais joués.",
        moveSan: ["d4", "Nf6", "c4", "g6", "Nc3", "d5", "cxd5", "Nxd5", "e4", "Nxc3", "bxc3"],
        highlights: [{ square: "g7", color: "green" }],
      },
      {
        title: "Topalov – Shirov : coups 6 à 10, fianchetto et rupture centrale",
        fen: "rnbqkb1r/ppp1pp1p/6p1/8/3PP3/2P5/P4PPP/R1BQKBNR b KQkq - 0 6",
        text: "Noir termine son développement (Bg7, roque) puis frappe aussitôt le centre blanc avec ...e5, le levier thématique de toute variante Grünfeld. PRO TIP : dans ce type de structure, le Fou fianchetté n'est jamais une pièce passive — il justifie à lui seul l'abandon du centre.",
        moveSan: ["Bg7", "Bb5+", "c6", "Ba4", "O-O", "Ne2", "Nd7", "O-O", "e5"],
        arrows: [{ from: "e7", to: "e5", color: "green" }],
      },
      {
        title: "Topalov – Shirov : coups 11 à 19, la tension se résout",
        fen: "r1bq1rk1/pp1n1pbp/2p3p1/4p3/B2PP3/2P5/P3NPPP/R1BQ1RK1 w - - 0 11",
        text: "Après f3 et un long remaniement de pièces des deux côtés, Topalov tranche la tension centrale par f4 puis exd4/Nxd4 : chaque camp installe ses pièces sur des cases actives, sans qu'aucun déséquilibre décisif ne soit encore visible.",
        moveSan: ["f3", "Qe7", "Be3", "Rd8", "Qc2", "Nb6", "Bb3", "Be6", "Rad1", "Nc4", "Bc1", "b5", "f4", "exd4", "Nxd4", "Bg4", "Rde1", "Qc5"],
      },
      {
        title: "Topalov – Shirov : coups 20 à 29, manœuvres et grappillages de pions",
        fen: "r2r2k1/p4pbp/2p3p1/1pq5/2nNPPb1/1BP5/P1Q3PP/2B1RRK1 w - - 3 20",
        text: "Une longue phase tactique s'ensuit : Topalov ouvre l'aile dame (a4), pousse ses pions centraux (e5, f5) pour chasser le Cavalier noir, puis chaque camp reprend une pièce mineure (Qxa4 Nxa2 Qxa2 Bxe5) avant que fxg6/hxg6 n'ouvre la colonne h. Rien n'indique encore la tournure que va prendre la partie.",
        moveSan: ["Kh1", "a5", "h3", "Bd7", "a4", "bxa4", "Ba2", "Be8", "e5", "Nb6", "f5", "Nd5", "Bd2", "Nb4", "Qxa4", "Nxa2", "Qxa2", "Bxe5", "fxg6", "hxg6"],
      },
      {
        title: "Topalov – Shirov : coups 33 à 37 — la structure de Fous opposés se fixe",
        fen: "r5k1/3b1p2/2pq2p1/p2rb1B1/3N4/2P1R2P/4Q1P1/5R1K w - - 6 33",
        text: "LA séquence qui donne son sujet au module : après c4! Bxd4 cxd5 Bxe3, chaque camp ne conserve plus qu'un seul Fou — et ce sont des Fous de couleurs opposées. PRO TIP de Jesper Hall : à cet instant précis, la partie bascule dans une zone de dynamisme géométrique extrême — tant que Dames et Tours restent sur l'échiquier, ce déséquilibre favorise presque toujours l'attaquant, jamais le défenseur passif.",
        moveSan: ["c4", "Bxd4", "cxd5", "Bxe3", "Qxe3", "Re8", "Qc3", "Qxd5", "Bh6"],
        highlights: [{ square: "e3", color: "red" }, { square: "d5", color: "green" }],
        arrows: [{ from: "c1", to: "h6", color: "green" }],
      },
      {
        title: "Topalov – Shirov : coups 41 à 43 — l'échange des Dames, LE moment de bascule",
        fen: "6k1/8/2p2ppB/p1q1rb2/8/4R2P/6P1/Q6K w - - 0 41",
        text: "Rxe5 Qxe5 simplifie une paire de Tours, puis Qa2+ Qd5 Qxd5+ cxd5 échange les Dames. PRO TIP : c'est exactement ce moment qu'il faut savoir reconnaître — sans Dames ni Tours, la même finale de Fous de couleurs opposées devient en théorie l'une des plus nulles de tous les échecs. Shirov vient d'entrer dans la phase que la théorie juge imperdable... pour Topalov.",
        moveSan: ["Rxe5", "Qxe5", "Qa2+", "Qd5", "Qxd5+", "cxd5"],
        highlights: [{ square: "d5", color: "red" }],
      },
      {
        title: "Topalov – Shirov : coup 47 — Bh3!!, le sacrifice le plus célèbre de l'histoire des Fous opposés",
        fen: "8/8/4kpp1/3p1b2/p6P/2B5/6P1/7K w - - 1 47",
        text: "Après Kg1, Shirov joue le coup qui allait rester dans toutes les mémoires : Bh3!!, offrant son propre Fou — le seul défenseur théorique d'une finale de Fous opposés — contre un simple pion. gxh3 est presque forcé. PRO TIP de Jesper Hall : ce sacrifice illustre à la perfection le double visage du thème — sans pièces pour s'opposer à lui, un Roi actif et un pion passé valent largement plus qu'un Fou « de la bonne couleur » resté seul sur l'échiquier.",
        moveSan: ["Kg1", "Bh3", "gxh3", "Kf5", "Kf2", "Ke4", "Bxf6", "d4"],
        highlights: [{ square: "h3", color: "green" }],
        arrows: [{ from: "f5", to: "h3", color: "green" }],
      },
      {
        title: "Topalov – Shirov : coups 51 à 53 — la conclusion",
        fen: "8/8/5Bp1/8/p2pk2P/7P/5K2/8 w - - 0 51",
        text: "Le Fou blanc, seul, ne peut à la fois arrêter le pion d noir ET empêcher l'invasion du Roi noir vers b3 : c'est le bilan complet du module — un Fou isolé, même du côté théoriquement « fort », ne peut jamais contrôler les deux couleurs de cases à la fois. Topalov abandonne.",
        moveSan: ["Be7", "Kd3", "Bc5", "Kc4", "Be7", "Kb3"],
      },
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
  // (2026-09-12, Lot 5) Premier tutoriel réel de ce thème (aucun contenu
  // préexistant) : Jose Raul Capablanca (Blancs) – Frederick Yates (Noirs),
  // Hastings 1930/31, ronde 2 (D63, Dame Refusé Orthodoxe, 87 coups, 1-0). Le
  // cahier des charges citait « Capablanca–Nimzowitsch, Saint-Pétersbourg
  // 1914 » — partie inexistante dans ce sens (la seule partie de ce tournoi
  // est Nimzowitsch(Blancs)–Capablanca(Noirs), déjà utilisée dans
  // jh-module-7, et sans le moindre échange de Dames sur ses 42 coups —
  // inutilisable pour un module centré sur CET échange précis). Remplacée
  // après validation utilisateur par cette partie, réputée « la meilleure
  // partie jamais jouée par Capablanca », qui contient un vrai échange de
  // Dames (23...Qxb1! 24.Nxb1) suivi d'une conversion technique complète.
  "jh-module-13-transition-milieu-de-partie-vers-finale": {
    steps: [
      {
        title: "Jose Raul Capablanca – Frederick Yates, Hastings 1930/31 (ronde 2)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Dame Refusé Orthodoxe : une mise en place tranquille, aucune Dame n'est encore en jeu pour un quelconque échange. PRO TIP de Jesper Hall pour ce module : la transition milieu de partie → finale ne se décide jamais au moment où les Dames disparaissent — elle se prépare bien avant, par le choix de la structure et des pièces que l'on garde. Cette partie entière est une leçon sur CE jugement précis.",
        moveSan: ["d4", "d5", "c4", "e6", "Nf3", "Nf6", "Bg5", "Nbd7", "e3", "Be7", "Nc3", "O-O", "Rc1"],
      },
      {
        title: "Capablanca – Yates : coups 7 à 11, la pression classique sur l'aile dame",
        fen: "r1bq1rk1/pppnbppp/4pn2/3p2B1/2PP4/2N1PN2/PP3PPP/2RQKB1R b K - 4 7",
        text: "Bd3, l'échange sur c4 puis a6/O-O/b5 : une mise en place à la fois classique et prudente des deux côtés, sans aucune tension immédiate. Rien ne distingue encore cette position d'un milieu de partie ordinaire.",
        moveSan: ["c6", "Bd3", "dxc4", "Bxc4", "a6", "O-O", "b5", "Be2"],
      },
      {
        title: "Capablanca – Yates : coups 11 à 16, la rupture centrale et une Dame en b1",
        fen: "r1bq1rk1/3nbppp/p1p1pn2/1p4B1/3P4/2N1PN2/PP2BPPP/2RQ1RK1 b - - 1 11",
        text: "Après ...c5 et dxc5, les Tours s'échangent sur la colonne c ouverte ; Capablanca place ensuite sa Dame en b1 (Qb1). PRO TIP : ce coup semble parfaitement anodin — il va pourtant devenir, quelques coups plus tard, la cible d'un échange que Noir choisira lui-même. Toujours se demander : « cette case est-elle sûre à moyen terme, ou seulement pour l'instant ? »",
        moveSan: ["Bb7", "Qc2", "Rc8", "Rfd1", "c5", "dxc5", "Rxc5", "b4", "Rc8", "Qb1"],
        highlights: [{ square: "b1", color: "red" }],
      },
      {
        title: "Capablanca – Yates : coups 16 à 22, la cascade d'échanges",
        fen: "2rq1rk1/1b1nbppp/p3pn2/1p4B1/1P6/2N1PN2/P3BPPP/1QRR2K1 b - - 2 16",
        text: "Une longue série d'échanges de pièces mineures (Nxd5/Bxg5, Rxc8/Bxc8, Nxg5/Qxg5) puis un dernier regroupement (Nc3-Ne4, Bf3) simplifie nettement la position : il ne reste plus qu'une Dame, une paire de Tours et quelques pièces mineures de chaque côté. Le terrain est prêt pour LA décision du module.",
        moveSan: ["Nd5", "Nxd5", "Bxg5", "Rxc8", "Bxc8", "Nxg5", "Qxg5", "Nc3", "Bb7", "Ne4", "Qg6", "Bf3", "Bd5"],
      },
      {
        title: "Capablanca – Yates : coup 23 — Qxb1!, LE moment de transition",
        fen: "5rk1/3n1ppp/p3p1q1/1p1b4/1P2N3/4PB2/P4PPP/1Q1R2K1 w - - 6 23",
        text: "Après Nc3, c'est Yates lui-même qui choisit d'échanger les Dames (23...Qxb1! 24.Nxb1), pensant sans doute la finale résultante au moins équilibrée. PRO TIP de Jesper Hall — le cœur de ce module : AVANT d'échanger les Dames, comptez toujours pions ET cases faibles pour juger QUI la finale favorise réellement. Ici, la structure (pion d5 bientôt isolé) et l'activité future du Roi blanc rendent cette finale de Tours nettement meilleure pour Blanc — un jugement que Yates n'a pas fait à temps.",
        moveSan: ["Nc3", "Qxb1", "Nxb1"],
        highlights: [{ square: "b1", color: "red" }, { square: "d5", color: "green" }],
      },
      {
        title: "Capablanca – Yates : coups 24 à 27, la simplification continue",
        fen: "5rk1/3n1ppp/p3p3/1p1b4/1P6/4PB2/P4PPP/1N1R2K1 b - - 0 24",
        text: "Les échanges se poursuivent sans relâche (Nc3, Rc8, Nxd5/Nxd5, Bxd5/exd5) : Noir hérite d'un pion d5 isolé dans une pure finale de Tours. Les priorités ont déjà radicalement changé depuis l'échange des Dames — la sécurité du roi n'a plus d'importance, seule compte désormais l'activité des pièces restantes et la solidité de la structure de pions.",
        moveSan: ["Nf6", "Nc3", "Rc8", "Nxd5", "Nxd5", "Bxd5", "exd5"],
      },
      {
        title: "Capablanca – Yates : coups 28 à 29, la petite supériorité devient concrète",
        fen: "2r3k1/5ppp/p7/1p1p4/1P6/4P3/P4PPP/3R2K1 w - - 0 28",
        text: "g3, g6 puis Rxd5! : Capablanca récupère méthodiquement le pion isolé noir. Ce qui n'était qu'un jugement abstrait au coup 23 (« cette finale me favorise ») devient maintenant un avantage matériel et structurel bien réel — la conversion technique de plus de cinquante coups peut commencer.",
        moveSan: ["g3", "g6", "Rxd5", "Rc2"],
        highlights: [{ square: "d5", color: "red" }],
      },
      {
        title: "Capablanca – Yates : coups 80 à 87, le Roi termine seul le travail",
        fen: "7k/r4pR1/2K2P1p/4P3/6P1/8/8/8 w - - 9 80",
        text: "Après près de cinquante coups de manœuvres patientes (non détaillées ici), le Roi blanc traverse méthodiquement tout l'échiquier — b6, c5, d6, e7 — pendant que ses pions avancent en soutien, jusqu'à la combinaison finale (e6! Ra6+ Ke7 Rxe6+ Kxf7!) qui gagne un pion décisif. PRO TIP de conclusion : en finale, gardez les pièces qui aident VOTRE plan (ici la Tour, pour convertir) et laissez le Roi faire lui-même, sur la durée, le travail qu'aucune autre pièce ne peut faire aussi discrètement.",
        moveSan: ["Kb6", "Rd7", "Kc5", "Rc7+", "Kd6", "Ra7", "e6", "Ra6+", "Ke7", "Rxe6+", "Kxf7", "Re4", "g5", "hxg5", "Kg6"],
      },
    ],
  },
  // (2026-09-12, Lot 6) `jh-module-14` : Fischer (Blancs) – Taimanov (Noirs),
  // Vancouver 1971, Candidats quart de finale, partie 4 (B47, Sicilienne
  // Taimanov/Bastrikov), 71 coups, 1-0 (abandon). LA partie assignée par le
  // cahier des charges, vérifiée exacte (couleurs et ronde). 141 demi-coups
  // intégralement rejoués et vérifiés avec chess.js — la plus longue partie
  // de tout le cursus Jesper Hall à ce jour, parfaite pour « l'art de la
  // conversion » : Fischer transforme un minuscule avantage structurel
  // (Fou contre Cavalier, pion c5 noir isolé) en victoire par quarante coups
  // de restriction patiente avant le moindre gain matériel concret.
  "jh-module-14-l-art-de-la-conversion": {
    steps: [
      {
        title: "Robert James Fischer – Mark Taimanov, Vancouver 1971 (Candidats, partie 4)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Sicilienne Taimanov : une mise en place flexible, rien d'agressif encore. PRO TIP de Jesper Hall pour tout ce module : l'art de la conversion ne se joue JAMAIS dans un unique coup brillant — il se construit sur des dizaines de coups patients, en restreignant méthodiquement les ressources de l'adversaire AVANT même de songer à gagner la moindre chose concrète. Cette partie de 71 coups, la plus longue démonstration technique du cursus, en est l'exemple parfait.",
        moveSan: ["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "Qc7", "Nc3", "e6", "g3", "a6", "Bg2", "Nf6"],
      },
      {
        title: "Fischer – Taimanov : coups 8 à 13, la mise en place",
        fen: "r1b1kb1r/1pqp1ppp/p1n1pn2/8/3NP3/2N3P1/PPP2PBP/R1BQK2R w KQkq - 2 8",
        text: "Échange au centre, développement classique des deux camps (Bc5, Bf4, Qd2, Rad1, e5, Be3) — rien ne distingue encore cette position d'un milieu de partie ordinaire. C'est précisément le piège : la conversion se prépare bien avant qu'elle ne devienne visible.",
        moveSan: ["O-O", "Nxd4", "Qxd4", "Bc5", "Bf4", "d6", "Qd2", "h6", "Rad1", "e5", "Be3", "Bg4"],
      },
      {
        title: "Fischer – Taimanov : coup 14, Bxc5! — la première graine de la conversion",
        fen: "r3k2r/1pq2pp1/p2p1n1p/2b1p3/4P1b1/2N1B1P1/PPPQ1PBP/3R1RK1 w kq - 2 14",
        text: "Fischer échange volontairement son Fou contre celui de Taimanov, acceptant de laisser Noir avec un pion c5 isolé après ...dxc5. PRO TIP : une conversion réussie commence souvent par CRÉER, à peu de frais, une faiblesse durable et fixe — ici une cible que Fischer visera méthodiquement pendant les cinquante coups suivants, bien avant de songer à la capturer.",
        moveSan: ["Bxc5", "dxc5", "f3", "Be6", "f4", "Rd8"],
        highlights: [{ square: "c5", color: "red" }],
      },
      {
        title: "Fischer – Taimanov : coup 17, Nd5! — la combinaison qui juge la finale AVANT de la forcer",
        fen: "3rk2r/1pq2pp1/p3bn1p/2p1p3/4PP2/2N3P1/PPPQ2BP/3R1RK1 w k - 1 17",
        text: "Nd5! force une cascade d'échanges (Bxd5, exd5, e4, Rfe1, Rxd5, Rxe4+) menant tout droit à un échange de Dames (23...Qxb1... ici Qd7 puis Qxd7+ Kxd7). PRO TIP central du module : AVANT de forcer une telle séquence, Fischer a déjà jugé la finale de Tour + Fou contre Tour + Cavalier qui en résultera — le pion c5 isolé, le Fou de cases claires supérieur au Cavalier, et un Roi noir qui devra défendre seul les deux ailes. Simplifier n'est un progrès que si la position simplifiée est authentiquement meilleure.",
        moveSan: ["Nd5", "Bxd5", "exd5", "e4", "Rfe1", "Rxd5", "Rxe4+", "Kd8", "Qe2", "Rxd1+", "Qxd1+", "Qd7", "Qxd7+", "Kxd7"],
        highlights: [{ square: "d5", color: "green" }, { square: "c5", color: "red" }],
      },
      {
        title: "Fischer – Taimanov : coups 24 à 44, quarante coups de restriction silencieuse",
        fen: "7r/1p1k1pp1/p4n1p/2p5/4RP2/6P1/PPP3BP/6K1 w - - 0 24",
        text: "Re5, b6, Bf1, a5, Bc4 : Fischer fixe d'abord les pions noirs a6/c5/b6 sur des cases où son Fou pourra toujours les attaquer, jamais son Cavalier adverse les défendre efficacement. PRO TIP : ce qui suit (non détaillé coup par coup ici) est l'essence même de l'art de la conversion — près de vingt coups supplémentaires où le Roi blanc migre tranquillement vers le centre puis l'aile dame (Kg2-f3-e2-d3-c4-b5-a6), le Fou surveille inlassablement les deux faiblesses noires, et Noir ne peut STRICTEMENT RIEN faire d'autre qu'attendre. Aucun gain matériel n'est encore visible — et c'est exactement le but.",
        moveSan: ["Re5", "b6", "Bf1", "a5", "Bc4"],
        highlights: [{ square: "a6", color: "red" }, { square: "c5", color: "red" }],
        arrows: [{ from: "c4", to: "a6", color: "green" }],
      },
      {
        title: "Fischer – Taimanov : coup 45, la finale pure Fou contre Cavalier est atteinte",
        fen: "8/8/1pnk2p1/pBp2p1p/P4P1P/2P3P1/1P2K3/8 w - - 0 45",
        text: "Après l'échange des dernières Tours (44.Rxd6 Kxd6), il ne reste plus que Roi, Fou et pions blancs contre Roi, Cavalier et pions noirs — exactement la finale que Fischer avait jugée gagnante vingt-huit coups plus tôt. PRO TIP : regardez le réseau de cases que le Fou va maintenant tisser (e8-f7-b3-d1-f3) pour forcer le Roi noir en zugzwang, pendant que le Cavalier noir, simple spectateur, ne peut jamais couvrir les deux ailes à la fois.",
        moveSan: ["Kd3", "Ne7", "Be8", "Kd5", "Bf7+", "Kd6", "Kc4", "Kc6", "Be8+", "Kb7", "Kb5"],
        arrows: [
          { from: "e8", to: "f7", color: "green" },
          { from: "f7", to: "b3", color: "green" },
          { from: "b3", to: "d1", color: "green" },
          { from: "d1", to: "f3", color: "green" },
        ],
      },
      {
        title: "Fischer – Taimanov : coup 62, Bxg6! — la restriction devient enfin un gain matériel",
        fen: "3kB3/4n3/Kp4p1/p1p2p1p/P4P1P/2P3P1/1P6/8 w - - 34 62",
        text: "Après encore quinze coups de la même patience (Ka6, Bd5-c4-f7-e8, le Cavalier noir ballotté sans jamais trouver de case sûre), Fischer sacrifie enfin son Fou contre le pion g6 : Bxg6! Nxg6 Kxb6 — son Roi engloutit ensuite b6 puis c5, et la course de pions à l'aile dame (b4, a5, b5) décide la partie. PRO TIP de conclusion : la restriction n'est jamais une fin en soi — elle prépare le moment, souvent un sacrifice minime, où l'avantage statique devient enfin un gain matériel concret et irréversible. Noir abandonne, son Cavalier isolé ne pouvant arrêter le pion b.",
        moveSan: ["Bxg6", "Nxg6", "Kxb6", "Kd7", "Kxc5", "Ne7", "b4", "axb4", "cxb4", "Nc8", "a5", "Nd6", "b5", "Ne4+", "Kb6", "Kc8", "Kc6", "Kb8", "b6"],
        highlights: [{ square: "g6", color: "red" }],
      },
    ],
  },
  // (2026-09-12, Lot 6) `jh-module-15` : Capablanca (Blancs) – Steiner (Noirs),
  // exhibition d'échecs vivants, Los Angeles 1933 (C49, Quatre Cavaliers
  // Espagnole Symétrique), 25 coups, 1-0 (mat). LA partie assignée par le
  // cahier des charges, vérifiée exacte (couleurs, lieu, année, mat final
  // Qb4#). 49 demi-coups intégralement rejoués et vérifiés avec chess.js.
  // Cette même partie alimente déjà 5 puzzles de
  // `pm-la-securite-du-roi-en-milieu-de-partie` (étude Lichess « King safety »
  // de FM Heineccius) — la lecture ici est délibérément différente : pas la
  // sécurité du roi, mais le sacrifice ciblé des DEUX Fous blancs (11.Bxf6!
  // puis 12.Bxe6!) pour ouvrir les deux ailes noires à la fois, exactement le
  // critère que Jesper Hall demande d'évaluer AVANT de choisir son camp entre
  // Fou et Cavalier. Aucune position choisie ici (voir `master-puzzles-dataset.ts`)
  // ne coïncide avec celles déjà utilisées pour ce thème.
  "jh-module-15-fou-contre-cavalier-mode-d-emploi": {
    steps: [
      {
        title: "Jose Raul Capablanca – Herman Steiner, Los Angeles 1933 (exhibition d'échecs vivants)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Quatre Cavaliers, variante symétrique de l'Espagnole : chaque camp clou le Cavalier adverse avec son Fou. PRO TIP de Jesper Hall pour tout ce module : avant même de choisir ton camp entre Fou et Cavalier, demande-toi QUELLE couleur de cases neutralise le Fou adverse — ou, comme dans cette partie, cherche directement à obtenir la paire de Fous elle-même plutôt que de rester dans la symétrie.",
        moveSan: ["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6", "Bb5", "Bb4", "O-O", "O-O", "d3", "d6"],
      },
      {
        title: "Capablanca – Steiner : coup 7, Bg5! — la paire de Fous naît de l'échange adverse",
        fen: "r1bq1rk1/ppp2ppp/2np1n2/1B2p3/1b2P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
        text: "Bg5 renouvelle la pression sur le Cavalier f6 ; Noir répond Bxc3, échangeant SON Fou contre le Cavalier c3. Après 8.bxc3, Blanc conserve ses DEUX Fous (b5 et g5) contre un Cavalier en moins, pendant que Noir se retrouve avec un seul Fou (encore sur c8) et deux Cavaliers. PRO TIP : cette asymétrie — paire de Fous contre paire de Cavaliers — est exactement le déséquilibre que ce module enseigne à exploiter.",
        moveSan: ["Bg5", "Bxc3", "bxc3", "Ne7"],
        highlights: [{ square: "b4", color: "red" }, { square: "b5", color: "green" }, { square: "g5", color: "green" }],
      },
      {
        title: "Capablanca – Steiner : coups 9-10, repositionner le Cavalier, garder les Fous actifs",
        fen: "r1bq1rk1/ppp1nppp/3p1n2/1B2p1B1/4P3/2PP1N2/P1P2PPP/R2Q1RK1 w - - 1 9",
        text: "Nh4, en route vers f5, pendant que Noir joue c6 et développe enfin son propre Fou en e6. PRO TIP : avec la paire de Fous, chaque camp cherche à garder ses pièces mineures ACTIVES sur des diagonales ouvertes — jamais à les figer derrière ses propres pions, ce qui annulerait tout l'avantage du coup 7.",
        moveSan: ["Nh4", "c6", "Bc4", "Be6"],
      },
      {
        title: "Capablanca – Steiner : coups 11-12, Bxf6! puis Bxe6! — le critère d'ouverture des deux ailes",
        fen: "r2q1rk1/pp2nppp/2ppbn2/4p1B1/2B1P2N/2PP4/P1P2PPP/R2Q1RK1 w - - 2 11",
        text: "LE moment-clé du module, et son paradoxe assumé : Capablanca sacrifie SES DEUX FOUS l'un après l'autre (Bxf6! gxf6, puis Bxe6! fxe6), forçant Noir à reprendre avec des pions et à doubler ses pions g ET ses pions e — brisant d'un coup l'abri du roi ET la structure centrale, sur les DEUX ailes à la fois. PRO TIP de Jesper Hall : la paire de Fous n'a de valeur que tant qu'elle sert un plan — ici, ouvrir les deux ailes pour l'attaque qui suit. Un Fou qui a fini ce travail peut, et doit, se sacrifier lui-même plutôt que de rester en spectateur.",
        moveSan: ["Bxf6", "gxf6", "Bxe6", "fxe6"],
        highlights: [{ square: "f6", color: "red" }, { square: "e6", color: "red" }],
        arrows: [{ from: "g5", to: "f6", color: "green" }, { from: "c4", to: "e6", color: "green" }],
      },
      {
        title: "Capablanca – Steiner : coups 13 à 19, l'assaut sur l'aile roi",
        fen: "r2q1rk1/pp2n2p/2pppp2/4p3/4P2N/2PP4/P1P2PPP/R2Q1RK1 w - - 0 13",
        text: "Les deux Fous ont disparu, mais leur travail de démolition reste : Qg4+, f4, Qh5+, puis le sacrifice de qualité Rxf6! achèvent d'exposer le Roi noir, contraint de fuir à pied jusqu'au centre de l'échiquier. PRO TIP : c'est la CONSÉQUENCE directe des coups 11-12 — sans Fou noir pour couvrir les cases sombres autour du roi, chaque pièce blanche restante frappe plus fort qu'elle ne le devrait.",
        moveSan: ["Qg4+", "Kf7", "f4", "Rg8", "Qh5+", "Kg7", "fxe5", "dxe5", "Rxf6", "Kxf6", "Rf1+", "Nf5", "Nxf5", "exf5"],
      },
      {
        title: "Capablanca – Steiner : coups 20 à 25, bascule vers l'aile dame et mat",
        fen: "r2q2r1/pp5p/2p2k2/4pp1Q/4P3/2PP4/P1P3PP/5RK1 w - - 0 20",
        text: "Rxf5+ chasse le Roi noir vers l'aile DAME cette fois (Ke7, Kd6, Kc5) — la seconde aile, ouverte dès le coup 9 (...c6), s'avère tout aussi vulnérable : Qxb7! puis Rxc6+! arrachent les derniers points d'appui noirs avant le mat Qb4#. PRO TIP de conclusion : un Roi privé de son Fou protecteur ne trouve plus refuge nulle part — ni à l'aile roi, ni à l'aile dame. C'est exactement pour forcer ce résultat que la paire de Fous s'est sacrifiée elle-même aux coups 11 et 12.",
        moveSan: ["Rxf5+", "Ke7", "Qf7+", "Kd6", "Rf6+", "Kc5", "Qxb7", "Qb6", "Rxc6+", "Qxc6", "Qb4#"],
        highlights: [{ square: "b7", color: "red" }, { square: "c6", color: "red" }],
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
  // Les 6 thèmes ci-dessous (2026-09-10, 3e lot au format Lichess) sortent
  // des 6 fichiers PILOT `positional_mastery` restés inutilisés depuis le
  // 2e lot (voir le commentaire au-dessus de `pm-la-chaine-de-pions`) —
  // chacun reprend une partie de maître RÉELLE déjà présente dans
  // `data/import/academy/PILOT_pm-*.pgn`, pré-commentée en français et
  // vérifiée coup par coup avec python-chess côté source, puis rejouée et
  // revérifiée ici avec chess.js. Un `CourseStep` par commentaire source
  // (`[%csl]`/`[%cal]` repris en `highlights`/`arrows` quand présents),
  // `fen` = position de départ RÉELLE avant le coup commenté, `moveSan` = la
  // suite réellement jouée jusqu'au prochain point d'arrêt — la vague de
  // puzzles correspondante (`master-puzzles-dataset.ts`) mine d'autres
  // points de décision de la MÊME partie (ou d'une seconde partie réelle sur
  // le même thème, pour `pm-le-complexe-de-cases-faibles`, dont le PILOT
  // porte 2 chapitres).
  "pm-l-avantage-d-espace": {
    steps: [
      {
        title: "Mikhail Botvinnik – Milan Vidmar, 1946",
        fen: "2kr3r/ppp2ppp/1nb1p3/8/3PP3/PP2KPP1/3N3P/R1R2B2 w - - 0 23",
        text: "Le plan des Blancs : gagner de l'espace à l'aile dame pour disloquer les pions noirs et ouvrir une colonne.",
        moveSan: ["a4", "Be8", "a5"],
        arrows: [
          { from: "a4", to: "a5", color: "green" },
          { from: "a5", to: "a6", color: "green" },
          { from: "a6", to: "b7", color: "green" },
        ],
      },
      {
        title: "Mikhail Botvinnik – Milan Vidmar : coup 24",
        fen: "2krb2r/ppp2ppp/1n2p3/P7/3PP3/1P2KPP1/3N3P/R1R2B2 b - - 0 24",
        text: "Les pièces noires sont toutes revenues sur la première rangée, totalement comprimées par l'avance des pions blancs.",
        moveSan: ["Na8", "a6", "b6"],
      },
      {
        title: "Mikhail Botvinnik – Milan Vidmar : coup 31",
        fen: "1k1r3r/p1nb2pp/Ppp1pp2/8/1P1PP3/N1R1KPP1/7P/2R2B2 w - - 4 31",
        text: "Selon Fine, cela vaut la peine de donner un pion pour installer une tour en 7e rangée — conséquence directe de l'espace accumulé depuis vingt coups.",
        moveSan: ["b5", "Nxb5", "Bxb5"],
        arrows: [{ from: "c3", to: "c7", color: "green" }],
      },
      {
        title: "Mikhail Botvinnik – Milan Vidmar : coup 35",
        fen: "k1r4r/pR1b2pp/Pp2pp2/1p6/3PP3/N3KPP1/7P/2R5 w - - 4 35",
        text: "Botvinnik sacrifie la qualité pour garder sa tour en 7e rangée.",
        moveSan: ["Rxd7", "Rxc1", "Nxb5"],
      },
      {
        title: "Mikhail Botvinnik – Milan Vidmar : coup 59",
        fen: "8/2k5/5N2/3Pp1P1/4P3/5PK1/8/7r w - - 5 59",
        text: "Domination totale : la tour noire n'a plus qu'une seule case correcte sur la colonne h.",
        moveSan: ["Kg2", "Rh8", "g6"],
      },
      {
        title: "Mikhail Botvinnik – Milan Vidmar : coup 60",
        fen: "7r/2k5/5N2/3Pp1P1/4P3/5P2/6K1/8 w - - 7 60",
        text: "Le pion g va promouvoir : l'avantage d'espace initial, transformé en domination totale des cases et des pièces adverses, se conclut par la promotion d'un pion oublié à l'autre bout de l'échiquier.",
        moveSan: ["g6"],
      },
    ],
  },
  "pm-le-complexe-de-cases-faibles": {
    steps: [
      {
        title: "Dragoslav Andric – Daja, 1949",
        fen: "rnq2rk1/1bp2ppp/1p3b2/p2Pp3/P1P1P3/B1P3P1/2QN2BP/R4RK1 b - - 2 17",
        text: "Un seul défenseur noir se trouve près du roi : c'est lui qu'il faut éliminer pour faire apparaître le complexe de cases faibles noires (f6, h6 et les environs immédiats du roi).",
        moveSan: ["Rd8", "Rxf6", "gxf6"],
      },
      {
        title: "Dragoslav Andric – Daja : coup 18",
        fen: "rnqr2k1/1bp2ppp/1p3b2/p2Pp3/P1P1P3/B1P3P1/2QN2BP/R4RK1 w - - 3 18",
        text: "Le sacrifice qui déclenche tout : en échangeant contre le fou défenseur, les Blancs vont pouvoir installer leurs pièces sur les cases noires désormais indéfendables.",
        moveSan: ["Rxf6", "gxf6", "Qd1"],
      },
      {
        title: "Dragoslav Andric – Daja : coup 19",
        fen: "rnqr2k1/1bp2p1p/1p3p2/p2Pp3/P1P1P3/B1P3P1/2QN2BP/R5K1 w - - 0 19",
        text: "La menace Qh5 suivie de Bh3-f5 vise précisément le réseau de cases noires autour du roi.",
        moveSan: ["Qd1", "c5", "Qh5"],
        arrows: [
          { from: "d1", to: "h5", color: "green" },
          { from: "g2", to: "h3", color: "green" },
          { from: "h3", to: "f5", color: "green" },
        ],
      },
      {
        title: "Dragoslav Andric – Daja : coup 22",
        fen: "rn3qk1/1b3p1p/1p1r1p2/p1pPp2Q/P1P1P3/B1P3PB/3N3P/R5K1 w - - 4 22",
        text: "Menace de mat immédiat — le fou s'installe sur une case noire désormais totalement indéfendable.",
        moveSan: ["Bf5", "Qg7", "Nf3"],
      },
      {
        title: "Dragoslav Andric – Daja : coup 24",
        fen: "r5k1/1b1n1pqp/1p1r1p2/p1pPpB1Q/P1P1P3/B1P2NP1/7P/R5K1 w - - 8 24",
        text: "Menace Bh6, occupant une autre case noire critique.",
        moveSan: ["Bc1", "Kh8", "Bh6"],
      },
      {
        title: "Dragoslav Andric – Daja : coup 27",
        fen: "r5qk/1b1r1p1p/1p3p1B/p1pPp2Q/P1P1P3/2P2NP1/7P/R5K1 w - - 0 27",
        text: "Un second sacrifice, exploitant à fond le complexe de cases faibles créé depuis le dix-huitième coup.",
        moveSan: ["Nxe5", "fxe5", "Qxe5+"],
      },
      {
        title: "Dragoslav Andric – Daja : coup 37",
        fen: "6k1/7p/1p6/p1p5/P3P3/2P3P1/7P/5bK1 w - - 0 37",
        text: "Toute l'attaque, depuis le sacrifice de qualité au 18e coup, aura consisté à exploiter méthodiquement un unique complexe de cases noires autour du roi adverse — la démonstration exemplaire du concept.",
        moveSan: ["Kxf1"],
      },
    ],
  },
  "pm-les-coups-de-rupture": {
    steps: [
      {
        title: "Harry Nelson Pillsbury – Isidor Gunsberg, Hastings 1895",
        fen: "1n6/4k2p/p3ppp1/1pPp4/3P1PP1/3NP3/P3K2P/8 w - - 1 27",
        text: "Premier coup de rupture : la menace est 28.fxe6 Kxe6 29.Nf4+, qui fait tomber le pion d vital. Un simple échange par 26...gxf5 27.gxf5 exf5 28.Nf4 laisserait déjà les Blancs avec deux pions passés connectés.",
        moveSan: ["f5", "g5", "Nb4"],
      },
      {
        title: "Harry Nelson Pillsbury – Isidor Gunsberg : coup 28",
        fen: "1n6/4k2p/p3pp2/1pPp1Pp1/3P2P1/3NP3/P3K2P/8 w - - 0 28",
        text: "Le cavalier s'infiltre pour éliminer un maximum de pions.",
        moveSan: ["Nb4", "a5", "c6"],
      },
      {
        title: "Harry Nelson Pillsbury – Isidor Gunsberg : coup 29",
        fen: "1n6/4k2p/4pp2/ppPp1Pp1/1N1P2P1/4P3/P3K2P/8 w - - 0 29",
        text: "Deuxième coup de rupture : si le cavalier est pris, 30.c7 gagne immédiatement.",
        moveSan: ["c6", "Kd6", "fxe6"],
      },
      {
        title: "Harry Nelson Pillsbury – Isidor Gunsberg : coup 30",
        fen: "1n6/7p/2Pkpp2/pp1p1Pp1/1N1P2P1/4P3/P3K2P/8 w - - 1 30",
        text: "Troisième rupture — les Blancs sacrifient sans relâche pour ouvrir des lignes vers la promotion.",
        moveSan: ["fxe6", "Nxc6", "Nxc6"],
      },
      {
        title: "Harry Nelson Pillsbury – Isidor Gunsberg : coup 32",
        fen: "8/7p/2k1Pp2/pp1p2p1/3P2P1/4P3/P3K2P/8 w - - 0 32",
        text: "Quatrième coup de rupture, magnifique : Pillsbury s'assure ainsi deux pions passés connectés, exactement le but de toute la séquence depuis le coup 27.",
        moveSan: ["e4", "dxe4", "d5+"],
      },
      {
        title: "Harry Nelson Pillsbury – Isidor Gunsberg : coup 33",
        fen: "8/7p/2k1Pp2/pp4p1/3Pp1P1/8/P3K2P/8 w - - 0 33",
        text: "Cinquième et dernier coup de rupture de la séquence — le pion d, impossible à capturer, poursuit sa marche.",
        moveSan: ["d5+", "Kd6", "Ke3"],
      },
      {
        title: "Harry Nelson Pillsbury – Isidor Gunsberg : coup 40",
        fen: "8/8/3kP2P/3P2p1/1pK2p2/p7/P6P/8 w - - 0 40",
        text: "Cinq coups de rupture consécutifs, calculés avec précision par Pillsbury dans une position qui semblait pourtant totalement équilibrée, décident finalement de la partie et du tournoi.",
        moveSan: ["h7"],
      },
    ],
  },
  "pm-prophylaxie-anticiper-le-plan-adverse": {
    steps: [
      {
        title: "Siegbert Tarrasch – Jackson Showalter, 1898",
        fen: "rnbqk1nr/ppp1bppp/3p4/3Pp3/2B1P3/5N2/PPP2PPP/RNBQK2R w KQkq - 1 6",
        text: "Premier coup prophylactique : au lieu du naturel Nc3, Tarrasch empêche d'abord ...f5, qui aurait attaqué la base de sa chaîne de pions e4-d5. Selon Tarrasch lui-même, ne jamais laisser l'adversaire se développer librement est le tout premier principe de l'attaque positionnelle.",
        moveSan: ["Bd3", "Nf6", "c4"],
        highlights: [
          { square: "c3", color: "red" },
          { square: "c4", color: "red" },
        ],
      },
      {
        title: "Siegbert Tarrasch – Jackson Showalter : coup 8",
        fen: "rnbq1rk1/ppp1bppp/3p1n2/3Pp3/2P1P3/3B1N2/PP3PPP/RNBQK2R w KQ - 1 8",
        text: "Deuxième coup prophylactique : empêche ...Bg4 et prépare g4 contre une future tentative noire de libération par ...Ne8 et ...f5.",
        moveSan: ["h3", "c6", "Nc3"],
      },
      {
        title: "Siegbert Tarrasch – Jackson Showalter : coup 12",
        fen: "r1bqnrk1/ppn1bppp/2pp4/3Pp3/2P1P3/2NBBN1P/PP3PP1/R2Q1RK1 w - - 6 12",
        text: "La dame soutient à l'avance la case f5, clé de toute la stratégie de restriction.",
        moveSan: ["Qc2", "cxd5", "cxd5"],
      },
      {
        title: "Siegbert Tarrasch – Jackson Showalter : coup 14",
        fen: "r1bqnrk1/ppn1bp1p/3p2p1/3Pp3/4P3/2NBBN1P/PPQ2PP1/R4RK1 w - - 0 14",
        text: "Force le cavalier noir à boucher f5 : il sera désormais cloué et incapable de soutenir le coup libérateur ...f5.",
        moveSan: ["Bh6", "Ng7", "g4"],
      },
      {
        title: "Siegbert Tarrasch – Jackson Showalter : coup 17",
        fen: "r1bqnr1k/pp2bpnp/3p2pB/3Pp3/4P1P1/2NB1N1P/PPQ2P1K/R4R2 w - - 3 17",
        text: "Tarrasch anticipe déjà l'ouverture de la colonne g si jamais ...f5 finissait par être joué.",
        moveSan: ["Rg1", "Bd7", "Rg2"],
      },
      {
        title: "Siegbert Tarrasch – Jackson Showalter : coup 27",
        fen: "2rq1rn1/p2bb1n1/1p1p1pkp/3Pp1p1/4P1PP/2NBBN2/PP1Q1PR1/6KR w - - 4 27",
        text: "Le cavalier blanc se dirige vers f5 via f1 et g3 — l'aboutissement de toute la stratégie préparée dès le coup 6.",
        moveSan: ["Nh2", "Rc7", "Nf1"],
      },
      {
        title: "Siegbert Tarrasch – Jackson Showalter : coup 39",
        fen: "1q4n1/p4kbR/1prpnp2/4p1p1/4P1P1/4BQN1/PP3PR1/6K1 w - - 0 39",
        text: "Le cavalier atteint enfin la case idéale préparée depuis le tout début de la partie.",
        moveSan: ["Nf5", "Qc8", "Rgh2"],
      },
      {
        title: "Siegbert Tarrasch – Jackson Showalter : coup 42",
        fen: "2q5/p3nknR/1prp1p2/4p1B1/4P1P1/5Q2/PP3P1R/6K1 b - - 0 42",
        text: "Showalter joue ce coup puis abandonne sans attendre la réponse : aucune gaffe noire identifiable dans toute la partie, seulement une asphyxie positionnelle méthodique.",
        moveSan: ["Qe6"],
      },
    ],
  },
  "pm-activite-des-pieces-contre-materiel": {
    steps: [
      {
        title: "Frank Marshall – Jose Raul Capablanca, 1918",
        fen: "r2r2k1/pb3ppp/1pp1q3/8/4P3/2Q2N2/PP3PPP/2R1R1K1 w - - 0 18",
        text: "Marshall pose un piège tactique.",
        moveSan: ["Nd4", "Qe5", "Nxc6"],
      },
      {
        title: "Frank Marshall – Jose Raul Capablanca : coup 18 (suite)",
        fen: "r2r2k1/pb3ppp/1pp1q3/8/3NP3/2Q5/PP3PPP/2R1R1K1 b - - 1 18",
        text: "Le coup clé de toute la partie : plutôt que d'entrer dans les complications tactiques de Marshall, Capablanca sacrifie volontairement un pion. À cet instant, le bénéfice n'est pas évident — les dames vont disparaître et peu de matériel restera pour attaquer — mais Capablanca a calculé que l'activité de ses pièces vaudra bien plus qu'un pion.",
        moveSan: ["Qe5", "Nxc6", "Qxc3"],
      },
      {
        title: "Frank Marshall – Jose Raul Capablanca : coup 20",
        fen: "r2r2k1/pb3ppp/1pN5/8/4P3/2R5/PP3PPP/4R1K1 b - - 0 20",
        text: "La tour domine déjà la 7e rangée — premier versement de la « compensation » pour le pion sacrifié.",
        moveSan: ["Rd2", "Rb1", "Re8"],
      },
      {
        title: "Frank Marshall – Jose Raul Capablanca : coup 21",
        fen: "r5k1/pb3ppp/1pN5/8/4P3/2R5/PP1r1PPP/1R4K1 b - - 2 21",
        text: "Cette tour attaque le centre et se prépare à basculer contre le roi blanc.",
        moveSan: ["Re8", "e5", "g5"],
      },
      {
        title: "Frank Marshall – Jose Raul Capablanca : coup 22",
        fen: "4r1k1/pb3ppp/1pN5/4P3/8/2R5/PP1r1PPP/1R4K1 b - - 0 22",
        text: "Coup magistral : empêche f4, crée une case de fuite pour le roi, et menace de gagner un pion.",
        moveSan: ["g5", "h4", "gxh4"],
      },
      {
        title: "Frank Marshall – Jose Raul Capablanca : coup 24",
        fen: "4r1k1/pb3p1p/1pN5/4P3/7p/2R5/PP1r1PP1/4R1K1 b - - 1 24",
        text: "Sans perdre de temps à ramasser des pions, attaque directe sur le cavalier qui doit désormais être défendu par les deux tours blanches à la fois.",
        moveSan: ["Re6", "Rec1", "Kg7"],
      },
      {
        title: "Frank Marshall – Jose Raul Capablanca : coup 30",
        fen: "8/pb3pkp/2N3r1/1p2P3/1P6/P1R3Pp/r4P2/2R3K1 b - - 0 30",
        text: "Coup d'attente : les Blancs sont totalement paralysés, chaque coup possible perd quelque chose.",
        moveSan: ["a6", "e6", "Rxe6"],
      },
      {
        title: "Frank Marshall – Jose Raul Capablanca : coup 39",
        fen: "8/1b3p1p/p7/1p3Nk1/1P3PP1/P1R5/r5rp/2R2K2 b - - 0 39",
        text: "L'activité totale des pièces noires, achetée pour le prix d'un seul pion au 18e coup, se solde par la reddition complète des Blancs.",
        moveSan: ["Kxf4"],
      },
    ],
  },
  "pm-evaluer-un-echange-de-pieces": {
    steps: [
      {
        title: "Akiba Rubinstein – Oldrich Duras, 1908",
        fen: "2r1kb1r/p3pppp/6b1/4N3/1P4P1/P3P3/1B3P1P/R3K2R w KQk - 1 18",
        text: "Les deux fous noirs pourraient offrir une résistance gênante : Rubinstein évalue qu'il vaut mieux en échanger un, même au prix de céder la colonne h à la tour noire.",
        moveSan: ["Nxg6", "hxg6", "Bd4"],
      },
      {
        title: "Akiba Rubinstein – Oldrich Duras : coup 21",
        fen: "2r1kb1r/4p1p1/p4pp1/8/1P1B2P1/P3P3/3K1P1P/R6R w k - 0 21",
        text: "Le moment clé du thème : ce coup pose une vraie question d'évaluation aux Noirs — échanger les tours (ce qui simplifie vers une finale gagnante pour les Blancs) ou abandonner la colonne ouverte. Aucune des deux options ne convient aux Noirs.",
        moveSan: ["Rac1", "Rxc1", "Rxc1"],
      },
      {
        title: "Akiba Rubinstein – Oldrich Duras : coup 22",
        fen: "4kb1r/4p1p1/p4pp1/8/1P1B2P1/P3P3/3K1P1P/2r4R w k - 0 22",
        text: "Rubinstein reprend avec la tour, pas avec le roi : en finale, la tour doit rester active, pas immobile à h1 à garder un pion. C'est le point pédagogique central — la pièce qui reprend n'est jamais un détail anodin, elle détermine toute l'activité future.",
        moveSan: ["Rxc1", "e5", "Bc5"],
      },
      {
        title: "Akiba Rubinstein – Oldrich Duras : coup 27",
        fen: "5k2/6p1/R4pp1/8/1P2p1P1/P3P3/4KPr1/8 b - - 0 27",
        text: "Le matériel est désormais égal, mais Rubinstein a évalué depuis longtemps que ses deux pions passés connectés valent bien plus qu'un simple décompte de points.",
        moveSan: ["Rxg4", "Ra7", "Rg1"],
      },
      {
        title: "Akiba Rubinstein – Oldrich Duras : coup 39",
        fen: "4R3/6p1/5p2/5k2/4p1p1/4P3/4KP2/8 w - - 3 39",
        text: "La chaîne de décisions d'échange, depuis le dix-huitième coup jusqu'à la finale de tours, aura été la clé de toute la victoire de Rubinstein.",
        moveSan: ["Kf1"],
      },
    ],
  },
  // Les 3 thèmes ci-dessous (2026-09-11, 1er lot du « Palier Or ») sortent de
  // 3 parties de maîtres RÉELLES (aucun fichier PILOT n'existait pour ces
  // thèmes) sourcées sur le web puis rejouées et vérifiées coup par coup
  // avec chess.js avant rédaction (aucune position tapée à la main) :
  //  - `pm-la-restriction-des-pieces-adverses` : Mikhail Botvinnik – Nikolay
  //    Sorokin, Championnat d'URSS 1931 (étude Lichess « IM Jeremy Silman's
  //    Lessons in Strategy », https://lichess.org/study/e2P29Eva/SKXizPgx) —
  //    14.b3! condamne le Cavalier noir à rester sur a5 jusqu'à la fin.
  //  - `pm-la-surprotection-nimzowitsch` : Aron Nimzowitsch – Georg Salwe,
  //    Karlsbad 1911, dite « Overprotection Racket »
  //    (https://www.chessgames.com/perl/chessgame?gid=1000795) — Nimzowitsch
  //    accumule Cavalier, Fou ET Tour sur la case e5 déjà largement tenue.
  //  - `pm-le-blocus-du-pion-passe` : Friedrich Sämisch – Aron Nimzowitsch,
  //    Copenhague 1923, « The Immortal Zugzwang Game »
  //    (https://en.wikipedia.org/wiki/Immortal_Zugzwang_Game) — 21...Rxf2!!
  //    crée un pion passé e4 authentique, que 24.Qe3! doit ensuite bloquer.
  // La vague de puzzles correspondante (`master-puzzles-dataset.ts`) mine
  // d'autres points de décision réels de ces 3 mêmes parties.
  "pm-la-restriction-des-pieces-adverses": {
    steps: [
      {
        title: "Botvinnik – Sorokin, URSS 1931 — l'avantage blanc avant restriction",
        fen: "r1b2rk1/1p3pp1/pn3n1p/2q1p3/P3P3/2N2N2/BP1RQPPP/3R2K1 w - - 0 1",
        text: "Les Blancs ont un développement plus rapide, des pièces plus actives, une pression sur le pion e5 noir et le contrôle total de la colonne d ouverte. 1.Qe3! propose l'échange des Dames : après 1...Qxe3 2.fxe3, les Noirs perdent leur meilleure pièce défensive et leur structure de pions se fissure — exactement le genre de finale où restreindre les pièces adverses va devenir le thème central de la partie.",
        moveSan: ["Qe3", "Qxe3", "fxe3"],
      },
      {
        title: "Chasser le Cavalier vers le bord",
        fen: "r1b2rk1/1p3pp1/pn3n1p/4p3/P3P3/2N1PN2/BP1R2PP/3R2K1 b - - 0 2",
        text: "2...Bg4 développe une pièce en clouant le Cavalier f3 sur la Tour d1. Mais 3.a5! est le vrai coup à retenir : il attaque le Cavalier b6 et gagne de l'espace en même temps. Le Cavalier n'a que 3...Nc8, une case passive — le tout premier pas vers sa restriction totale.",
        moveSan: ["Bg4", "a5", "Nc8"],
      },
      {
        title: "Regroupement et nouvelles concessions",
        fen: "r1n2rk1/1p3pp1/p4n1p/P3p3/4P1b1/2N1PN2/BP1R2PP/3R2K1 w - - 1 4",
        text: "4.Rc1! est facile à manquer : les Blancs n'ont plus besoin de deux Tours sur la colonne d, alors ils revendiquent aussi la colonne c tout en sortant du clouage. Après l'échange 4...Bxf3 5.gxf3, le pion e4 est renforcé. Suit un ballet de pièces (Nd5, Nc6, Nxf6+) qui abîme encore la structure de pions noire (5...gxf6) et prépare l'invasion de la 7e rangée.",
        moveSan: ["Rc1", "Bxf3", "gxf3", "Ne7", "Nd5", "Nc6", "Nxf6+", "gxf6"],
      },
      {
        title: "Invasion de la 7e rangée",
        fen: "r4rk1/1p3p2/p1n2p1p/P3p3/4P3/4PP2/BP1R3P/2R3K1 w - - 0 8",
        text: "8.Rd7! est une pénétration décisive : suivant la règle qu'une Tour à la 7e rangée vaut un pion, les Blancs sacrifient leur pion a5 pour créer des menaces contre b7 et f7. 9.Kf2! active le Roi, menace Rg1+, et ose les Noirs à manger le pion a5. 9...Nxa5 croque le pion — mais dégage la colonne c pour les Blancs, et surtout éloigne encore plus le Cavalier du centre de l'action.",
        moveSan: ["Rd7", "Rab8", "Kf2", "Nxa5"],
      },
      {
        title: "b3! — la restriction totale du Cavalier",
        fen: "1r3rk1/1p1R1p2/p4p1p/n3p3/4P3/4PP2/BP3K1P/2R5 w - - 0 10",
        text: "10.Rcc7 double les Tours sur la 7e rangée et force pratiquement le gain du pion f7. Après les échanges de Tours, 13.Bd5! place le Fou sur sa case la plus imposante, empêchant à jamais la Tour noire d'utiliser la colonne d. Puis 14.b3! est le coup thème de tout le chapitre : il domine complètement le Cavalier noir. Un coup comme 14.Ra7 aurait laissé un peu de contre-jeu avec 14...Nc4, mais maintenant le pauvre Cavalier reste bloqué sur le bord de l'échiquier pour le reste de la partie. Ne jamais arrêter de chercher à restreindre les pièces adverses.",
        moveSan: ["Rcc7", "Rbc8", "Rxf7", "Rxc7", "Rxc7+", "Kh8", "Bd5", "b5", "b3"],
        highlights: [{ square: "a5", color: "red" }],
        arrows: [{ from: "b2", to: "b3", color: "green" }],
      },
      {
        title: "La méthode : améliorer chaque pièce, puis le Roi",
        fen: "5r1k/2R5/p4p1p/np1Bp3/4P3/1P2PP2/5K1P/8 b - - 0 14",
        text: "Remarquez la méthode : les Blancs ont d'abord rendu leur Tour meilleure que celle des Noirs, puis leur Fou meilleur que le Cavalier. Maintenant, avec 15.Kg3, ils tournent tranquillement leur attention vers leur propre Roi. Chaque pièce blanche est amenée à donner le meilleur d'elle-même. 16.Kh4 amène le Roi dans l'attaque — les Noirs sont totalement démunis, la victoire n'est plus qu'une question de temps.",
        moveSan: ["Rd8", "Kg3", "f5", "Kh4", "fxe4", "fxe4"],
      },
      {
        title: "Marquer le temps — le Cavalier toujours prisonnier",
        fen: "3r3k/2R5/p6p/np1Bp3/4P2K/1P2P3/7P/8 b - - 0 17",
        text: "17.Rd6 met en place une ultime ligne de défense. 18.Kh5 continue le plan commencé quelques coups plus tôt : le Roi blanc vise maintenant h6. 19.h3 laisse les Noirs s'asseoir et souffrir — Botvinnik améliore d'abord sa position au maximum avant d'encaisser ses avantages. 20.h4 continue ce jeu du chat et de la souris, qui use moralement l'adversaire, réduit à des coups d'attente pendant que son Cavalier reste totalement hors jeu sur a5.",
        moveSan: ["Rd6", "Kh5", "Rf6", "h3", "Rd6", "h4", "Rb6"],
      },
      {
        title: "La restriction paie : l'infiltration finale",
        fen: "7k/2R5/pr5p/np1Bp2K/4P2P/1P2P3/8/8 w - - 1 21",
        text: "21.Kg4 menace Kf5 suivi de Kxe5. 22.Ra7 attache la Tour noire à la défense du pion a6. 22...Rb6 tente un sacrifice de pion pour redonner vie au Cavalier — par exemple 23.Kf5 permettrait 23...Nc6. Mais 23.Re7! ne menace pas seulement de prendre le pion e5 (une menace impossible à parer) : il empêche aussi 23...Nc6 à cause de 24.Re6, qui clouerait et gagnerait le Cavalier. Les Noirs ont abandonné ici : le Cavalier resté restreint sur a5 depuis le coup 14 n'a jamais pu revenir dans la partie.",
        moveSan: ["Kg4", "Rf6", "Ra7", "Rb6", "Re7"],
      },
    ],
  },
  "pm-la-surprotection-nimzowitsch": {
    steps: [
      {
        title: "Française Avance — la pointe e5 à protéger",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Après 3.e5, les Blancs obtiennent une pointe de pion avancée en e5. Toute la partie va tourner autour de cette case : Nimzowitsch va la protéger, la sur-protéger, puis l'utiliser comme tremplin pour l'attaque — l'exemple le plus célèbre de son concept de « surprotection ».",
        moveSan: ["e4", "e6", "d4", "d5", "e5", "c5", "c3", "Nc6"],
      },
      {
        title: "Développement et première tension",
        fen: "r1bqkbnr/pp3ppp/2n1p3/2ppP3/3P4/2P5/PP3PPP/RNBQKBNR w KQkq - 1 5",
        text: "Les Blancs développent tranquillement pendant que les Noirs visent le pion b2 avec ...Qb6. 7.dxc5 Bxc5 libère la diagonale du Fou noir mais laisse le pion e5 comme unique atout central des Blancs — d'autant plus précieux qu'il est désormais isolé du reste de la structure.",
        moveSan: ["Nf3", "Qb6", "Bd3", "Bd7", "dxc5", "Bxc5"],
      },
      {
        title: "Bf4 avant même l'attaque — le réflexe de surprotection",
        fen: "r3k1nr/pp1b1ppp/1qn1p3/2bpP3/8/2PB1N2/PP3PPP/RNBQK2R w KQkq - 0 8",
        text: "8...f6 attaque directement le pion e5. Au lieu de simplement le défendre une fois, 10.Bf4! ajoute un défenseur supplémentaire à la pointe AVANT même qu'elle ne soit vraiment menacée de disparaître — le réflexe de surprotection de Nimzowitsch : jamais content d'un point fort simplement « assez défendu ».",
        moveSan: ["O-O", "f6", "b4", "Be7", "Bf4", "fxe5"],
      },
      {
        title: "Première occupation de la case e5",
        fen: "r3k1nr/pp1bb1pp/1qn1p3/3pp3/1P3B2/2PB1N2/P4PPP/RN1Q1RK1 w kq - 0 11",
        text: "Après les échanges forcés sur e5, le Fou blanc atterrit sur la case elle-même. Ce n'est encore qu'une occupation — la vraie surprotection, où plusieurs pièces défendent une case déjà solide, arrive dans les coups suivants.",
        moveSan: ["Nxe5", "Nxe5", "Bxe5"],
      },
      {
        title: "Regrouper pour revenir sur e5",
        fen: "r3k1nr/pp1bb1pp/1q2p3/3pB3/1P6/2PB4/P4PPP/RN1Q1RK1 b kq - 0 12",
        text: "Les Blancs manœuvrent patiemment leur Cavalier (Nd2-f3) dans le seul but de pouvoir revenir occuper e5 une seconde fois. Ce genre de détour, qui semble perdre du temps, est typique de la stratégie de Nimzowitsch : construire un point fort qu'aucune pièce adverse ne pourra jamais déloger.",
        moveSan: ["Nf6", "Nd2", "O-O", "Nf3", "Bd6", "Qe2", "Rac8", "Bd4", "Qc7"],
      },
      {
        title: "La surprotection : Ne5 ET Rae1 sur la même case",
        fen: "2r2rk1/ppqb2pp/3bpn2/3p4/1P1B4/2PB1N2/P3QPPP/R4RK1 w - - 9 17",
        text: "17.Ne5! replace le Cavalier sur la pointe. Puis 18.Rae1! est le coup emblématique de tout le chapitre : la Tour vient soutenir une case déjà parfaitement défendue par le Fou et le Cavalier. C'est la définition même de la surprotection — accumuler plus de défenseurs qu'il n'en faut sur une case-clé, pour que chaque pièce impliquée gagne en liberté d'action ailleurs sur l'échiquier. Après l'échange 18...Bxe5 19.Bxe5, un Fou occupe désormais e5, toujours soutenu par la Tour e1.",
        moveSan: ["Ne5", "Be8", "Rae1", "Bxe5", "Bxe5"],
        highlights: [{ square: "e5", color: "green" }],
        arrows: [{ from: "a1", to: "e1", color: "green" }],
      },
      {
        title: "Le point fort libère l'attaque",
        fen: "2r1brk1/ppq3pp/4pn2/3pB3/1P6/2PB4/P3QPPP/4RRK1 b - - 0 19",
        text: "Une fois e5 rendu inattaquable, les pièces blanches restantes sont libres de basculer vers le Roi noir : 22.Re3! puis 23.Rg3 transfèrent la Tour sur l'aile Roi, et 24.Bxh7! sacrifie un pion pour arracher l'abri du Roi noir — la récompense directe de tous les coups « lents » de surprotection joués plus tôt.",
        moveSan: ["Qc6", "Bd4", "Bd7", "Qc2", "Rf7", "Re3", "b6", "Rg3", "Kh8", "Bxh7", "e5"],
      },
      {
        title: "La conversion : combinaison gagnante",
        fen: "2r4k/p2b1rpB/1pq2n2/3pp3/1P1B4/2P3R1/P1Q2PPP/5RK1 w - - 0 25",
        text: "25.Bg6! maintient l'étau. Après quelques échanges forcés, 28.Bg5! attaque la Tour c8 clouée sur la Dame et gagne la qualité (28...Rxc3 29.Rxc3 dxc3 30.Qxc3) : le matériel supplémentaire, combiné à l'activité de pièces acquise grâce à la surprotection initiale de e5, suffit à Nimzowitsch pour conduire cette partie jusqu'au gain.",
        moveSan: ["Bg6", "Re7", "Re1", "Qd6", "Be3", "d4", "Bg5", "Rxc3", "Rxc3", "dxc3", "Qxc3", "Kg8", "a3"],
      },
    ],
  },
  "pm-le-blocus-du-pion-passe": {
    steps: [
      {
        title: "Étude « La partie immortelle du zugzwang » — mise en place",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Sämisch – Nimzowitsch, Copenhague, mars 1923 : une Indienne de Dame catalane où les Noirs préparent tranquillement la rupture centrale ...d5. Cette partie reste célèbre pour sa fin : la position finale est un rare exemple de zugzwang en plein milieu de partie, obtenu après que les Noirs aient méthodiquement bloqué et restreint le jeu blanc — dont un pion passé qui va naître au fil des coups suivants.",
        moveSan: ["d4", "Nf6", "c4", "e6", "Nf3", "b6", "g3", "Bb7", "Bg2", "Be7", "Nc3", "O-O", "O-O", "d5"],
      },
      {
        title: "La structure se fixe",
        fen: "rn1q1rk1/pbp1bppp/1p2pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
        text: "8.Ne5 c6 9.cxd5 cxd5 fixe un pion noir isolé en d5, tandis que les Blancs développent leur Fou en Bf4. Rien n'indique encore qu'un pion passé va apparaître au centre — la partie en donne l'impression d'un jeu de position tranquille.",
        moveSan: ["Ne5", "c6", "cxd5", "cxd5", "Bf4", "a6"],
      },
      {
        title: "Manœuvres des deux côtés",
        fen: "rn1q1rk1/1b2bppp/pp2pn2/3pN3/3P1B2/2N3P1/PP2PPBP/R2Q1RK1 w - - 0 11",
        text: "Les Noirs gagnent de l'espace à l'aile Dame (...b5) pendant que les Blancs regroupent leurs pièces. 15...Nh5 puis 16...f5 préparent une expansion à l'aile Roi — c'est cette poussée ...f5 qui va, quelques coups plus tard, transformer la structure centrale.",
        moveSan: ["Rc1", "b5", "Qb3", "Nc6", "Nxc6", "Bxc6", "h3", "Qd7", "Kh2", "Nh5", "Bd2", "f5"],
      },
      {
        title: "20.e4?! — la naissance du pion passé",
        fen: "r4rk1/3qb1pp/p1b1p3/1p1p1p1n/3P4/1QN3PP/PP1BPPBK/2R2R2 w - - 0 17",
        text: "Cherchant du contre-jeu, les Blancs jouent 20.e4?!. Après 20...fxe4, ils récupèrent la tension au centre mais, comme on va le voir au coup suivant, cette décision va leur coûter très cher : elle prépare, sans qu'ils s'en doutent encore, la création d'un pion noir passé sur la colonne e.",
        moveSan: ["Qd1", "b4", "Nb1", "Bb5", "Rg1", "Bd6", "e4", "fxe4"],
      },
      {
        title: "Rxf2! — le sacrifice qui crée le pion passé",
        fen: "r4rk1/3q2pp/p2bp3/1b1p3n/1p1Pp3/6PP/PP1B1PBK/1NRQ2R1 w - - 0 21",
        text: "21.Qxh5 regagne la pièce, mais 21...Rxf2!! est le coup qui décide de tout le reste de la partie. En échange de la qualité, les Noirs suppriment le SEUL pion blanc (f2) qui aurait jamais pu capturer leur pion e4 en route vers la promotion. À partir de cet instant précis, le pion e4 noir est un véritable pion passé — irrattrapable par aucun pion blanc, seules des pièces pourront désormais l'arrêter. Créer proprement le pion passé est la première étape du blocus ; le bloquer vient ensuite.",
        moveSan: ["Qxh5", "Rxf2"],
        highlights: [{ square: "e4", color: "red" }],
      },
      {
        title: "Qe3! — le blocus (par la pièce la plus mal adaptée)",
        fen: "r5k1/3q2pp/p2bp3/1b1p3Q/1p1Pp3/6PP/PP1B1rBK/1NR3R1 w - - 0 22",
        text: "Après 22.Qg5 Raf8 23.Kh1 R8f5, les Blancs n'ont plus le choix : 24.Qe3! place la Dame directement devant le pion passé e4, sur la seule case qui l'empêche d'avancer. C'est un blocus au sens plein du terme — sauf que la Dame est, selon la théorie de Nimzowitsch lui-même, la PIRE pièce bloqueuse possible : elle immobilise la pièce la plus puissante de l'échiquier sur une tâche purement défensive. Que les Blancs en soient réduits à bloquer avec leur Dame montre à quel point leur position est déjà désespérée.",
        moveSan: ["Qg5", "Raf8", "Kh1", "R8f5", "Qe3"],
        highlights: [{ square: "e4", color: "red" }],
        arrows: [{ from: "g5", to: "e3", color: "green" }],
      },
      {
        title: "Bd3! puis h6 — le zugzwang final",
        fen: "6k1/3q2pp/p2bp3/1b1p1r2/1p1Pp3/4Q1PP/PP1B1rB1/1NR3RK b - - 5 24",
        text: "24...Bd3! attaque immédiatement la bloqueuse : le Fou noir s'installe au cœur du camp blanc et chasse la Dame de sa case de blocus. Après 25.Rce1 (les Blancs réorganisent tant bien que mal leur défense), le tranquille 25...h6 est le coup qui a donné son nom à la partie : ce non-coup ne menace rien de direct, mais chaque pièce blanche est déjà tellement occupée à restreindre et bloquer les Noirs — retenir le pion passé e4, couvrir la 1re rangée, éviter les mats de couloir — qu'aucun coup blanc ne reste inoffensif. C'est le zugzwang en plein milieu de partie, résultat direct du blocus imposé quelques coups plus tôt.",
        moveSan: ["Bd3", "Rce1", "h6"],
      },
    ],
  },
  // Les 3 thèmes ci-dessous (2026-09-11, 2e lot du « Palier Or ») sortent
  // eux aussi de 3 parties de maîtres RÉELLES (aucun fichier PILOT
  // n'existait pour ces thèmes) sourcées sur le web puis rejouées et
  // vérifiées coup par coup avec chess.js avant rédaction :
  //  - `pm-transformer-un-avantage` : Fabiano Caruana – Sam Shankland,
  //    Sinquefield Cup 2021 (PGN officiel du tournoi,
  //    theweekinchess.com/assets/files/pgn/sinqcup21.pgn) — un léger
  //    avantage d'espace se transforme, coup après coup, en attaque de mat.
  //  - `pm-la-technique-de-simplification` : Magnus Carlsen – Ian
  //    Nepomniachtchi, Championnat du Monde 2021, Partie 6, la plus longue
  //    partie de l'histoire des Mondiaux (136 coups) — 26.Qxc8! Rxc8
  //    27.Rxc8! échange la Dame contre deux Tours pour simplifier.
  //  - `pm-le-complexe-de-cases-de-couleur` : Ludek Pachman – Bobby
  //    Fischer, Olympiade de La Havane 1966 — les Blancs perdent tour à
  //    tour leurs deux Fous puis leur dernier Cavalier, abandonnant à
  //    jamais les cases claires au Fou noir (33...Bxa2!, 39...Bxa4!).
  // La vague de puzzles correspondante (`master-puzzles-dataset.ts`) mine
  // d'autres points de décision réels de ces 3 mêmes parties.
  "pm-transformer-un-avantage": {
    steps: [
      {
        title: "Caruana – Shankland, Sinquefield Cup 2021 — un petit avantage à transformer",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Face au système Londres, les Noirs développent normalement. Après quelques coups seulement, les Blancs disposent d'un léger avantage d'espace et d'une meilleure coordination des pièces — rien de décisif en soi, mais exactement le genre de petit plus qu'il va falloir transformer, coup après coup, en quelque chose de concret.",
        moveSan: ["d4", "Nf6", "Nf3", "g6", "Bf4", "Bg7", "e3", "d6", "h3", "c5", "Nbd2", "cxd4", "exd4", "O-O", "Be2", "Qb6"],
      },
      {
        title: "Fermer le centre pour préparer la suite",
        fen: "rnb2rk1/pp2ppbp/1q1p1np1/8/3P1B2/5N1P/PPPNBPP1/R2QK2R w KQ - 3 9",
        text: "9.Nc4 Qc7 10.Ne3! réoriente le Cavalier vers e3, une case idéale pour surveiller d5 et f5. Après 12...e5, les Noirs ferment le centre ; 15...e4 fixe définitivement la structure — les Blancs vont devoir transformer leur avantage d'espace en activité de pièces plutôt qu'en pression centrale directe.",
        moveSan: ["Nc4", "Qc7", "Ne3", "Nc6", "c3", "e5", "Bh2", "Qe7", "O-O", "e4", "Ne1", "d5", "N1c2", "Be6"],
      },
      {
        title: "f3 : ouvrir des lignes vers le Roi noir",
        fen: "r4rk1/pp2qpbp/2n1bnp1/3p4/3Pp3/2P1N2P/PPN1BPPB/R2Q1RK1 w - - 2 16",
        text: "17.f3! est le premier signe de transformation : les Blancs convertissent leur avantage de structure en ouverture de lignes vers le Roi noir. Après 18...fxe4 19.fxe4, la colonne f est ouverte et toutes les pièces blanches (Dame, Tours, Fou) convergent vers l'aile Roi.",
        moveSan: ["Qe1", "Nd7", "f3", "f5", "fxe4", "fxe4", "Bf4", "Rf7", "Qg3", "Nf6", "Rf2", "Qd7", "Raf1", "Raf8"],
      },
      {
        title: "Le Cavalier centralisé en e5 change encore la nature de l'avantage",
        fen: "5rk1/pp1q1rbp/2n1bnp1/3p4/3PpB2/2P1N1QP/PPN1BRP1/5RK1 w - - 8 23",
        text: "23.Ne5! plante un Cavalier intouchable au centre de l'échiquier, transformant l'avantage spatial en un avant-poste dominant. Après l'échange 24...Bxe5 25.Bxe5, les Blancs gardent un Fou monstrueux sur les cases noires, contrôlant toute la diagonale a1-h8 autour du Roi noir.",
        moveSan: ["Qh4", "Ne8", "Ng4", "Nd6", "Nce3", "Ne7", "Ne5", "Bxe5"],
      },
      {
        title: "Regrouper les dernières pièces pour l'assaut final",
        fen: "5rk1/pp1qnr1p/3nb1p1/3pb3/3PpB1Q/2P1N2P/PP2BRP1/5RK1 w - - 0 27",
        text: "26.Ng4! puis 27.Qg5 amènent les dernières pièces blanches vers l'aile Roi. L'avantage positionnel accumulé depuis vingt coups est maintenant prêt à se transformer en attaque directe.",
        moveSan: ["Bxe5", "Ndf5", "Ng4", "h5", "Qg5", "hxg4"],
      },
      {
        title: "La transformation décisive : sacrifice de qualité",
        fen: "5rk1/pp1qnr2/4b1p1/3pBnQ1/3Pp1p1/2P4P/PP2BRP1/5RK1 w - - 0 30",
        text: "30.gxf5! Rxf5 31.Rxf5! Rxf5 32.Rxf5! Bxf5 — les Blancs acceptent une série d'échanges de Tours qui, sur l'échiquier, semble neutre en matériel, mais transforme en réalité tout l'avantage positionnel accumulé en attaque directe contre le Roi noir désormais totalement dégarni.",
        moveSan: ["hxg4", "Ng7", "Qh6", "Nef5", "gxf5", "Rxf5", "Rxf5", "Rxf5", "Rxf5", "Bxf5"],
      },
      {
        title: "Qxg6! — la conversion finale",
        fen: "6k1/pp1q2n1/6pQ/3pBb2/3Pp3/2P5/PP2B1P1/6K1 w - - 0 35",
        text: "33.g4! chasse le Fou noir, et 34.Qxg6! est le coup qui encaisse tout : l'avantage de départ — un peu d'espace et une meilleure coordination — s'est transformé, coup après coup, en une attaque de mat imparable. Les Noirs ont abandonné peu après.",
        moveSan: ["g4", "Be6", "Qxg6", "Qf7", "Qh6", "e3", "Bf3"],
      },
    ],
  },
  "pm-la-technique-de-simplification": {
    steps: [
      {
        title: "Carlsen – Nepomniachtchi, Championnat du Monde 2021, Partie 6 — la partie la plus longue de l'histoire des Mondiaux",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Une Catalane calme où les Noirs acceptent de rendre le pion c5 pris au passage. Rien ne laisse présager que cette partie va durer 136 coups et devenir la plus longue de l'histoire des championnats du monde — Carlsen va simplement, méthodiquement, simplifier la position pendant des heures jusqu'à ce qu'une seule petite erreur suffise.",
        moveSan: ["d4", "Nf6", "Nf3", "d5", "g3", "e6", "Bg2", "Be7", "O-O", "O-O", "b3", "c5", "dxc5", "Bxc5", "c4", "dxc4"],
      },
      {
        title: "Premiers échanges : simplifier sans rien lâcher",
        fen: "rnbq1rk1/pp3ppp/4pn2/2b5/2p5/1P3NP1/P3PPBP/RNBQ1RK1 w - - 0 9",
        text: "17.Bxf6! échange le Fou contre le Cavalier noir, abîmant volontairement la structure de pions noire (17...gxf6). 18.Rac1! Nd4 19.Nxd4 Bxd4 poursuit les échanges — Carlsen ne cherche pas la complication, il cherche la position la plus simple possible où son léger avantage reste réel.",
        moveSan: ["Qc2", "Qe7", "Nbd2", "Nc6", "Nxc4", "b5", "Nce5", "Nb4"],
      },
      {
        title: "Le Roi vient au jeu tôt",
        fen: "r1b2rk1/p3qppp/4pn2/1pb1N3/1n6/1P3NP1/P1Q1PPBP/R1B2RK1 w - - 2 13",
        text: "20.Qa2! Bxg2 21.Kxg2 — les Blancs acceptent même de perdre leur Fou-roi si cela simplifie la position vers une finale où l'activité du Roi blanc compte plus que n'importe quelle pièce mineure. C'est une autre facette de la technique de simplification : ne jamais craindre d'échanger si la position qui en résulte est plus facile à jouer pour soi.",
        moveSan: ["Qb2", "Bb7", "a3", "Nc6", "Nd3", "Bb6", "Bg5", "Rfd8"],
      },
      {
        title: "Qxc8! — la Dame contre deux Tours",
        fen: "r2r2k1/pb2qppp/1bn1pn2/1p4B1/8/PP1N1NP1/1Q2PPBP/R4RK1 w - - 5 17",
        text: "25.Rd2 Rac8 26.Qxc8! Rxc8 27.Rxc8! est LE moment-clé du chapitre : les Blancs échangent volontairement leur Dame contre les deux Tours noires. Ce n'est pas un sacrifice — matériellement c'est équilibré — mais c'est une simplification radicale : Carlsen préfère une finale Dame contre deux Tours et Cavalier, plus simple à manier sur la durée, à une position où les pièces lourdes restent sur l'échiquier avec leurs complications propres.",
        moveSan: ["Bxf6", "gxf6", "Rac1", "Nd4", "Nxd4", "Bxd4", "Qa2", "Bxg2"],
      },
      {
        title: "La technique s'installe pour la longue durée",
        fen: "r2r2k1/p3qp1p/4pp2/1p6/3b4/PP1N2P1/Q3PPbP/2R2RK1 w - - 0 21",
        text: "Après les grands échanges, la partie entre dans sa phase de technique pure : chaque camp grignote, chaque camp manœuvre. 33...Bxa3 grappille un pion, mais la position reste extrêmement difficile à gagner pour l'un comme pour l'autre — c'est exactement le genre de finale simplifiée où seule une patience infinie fait la différence.",
        moveSan: ["Kxg2", "Qb7+", "Kg1", "Qe4", "Qc2", "a5", "Rfd1", "Kg7", "Rd2", "Rac8"],
      },
      {
        title: "Le grignotage continue, coup après coup",
        fen: "2rr4/5pkp/4pp2/pp6/3bq3/PP1N2P1/2QRPP1P/2R3K1 w - - 4 26",
        text: "Les pièces s'échangent encore par endroits, les pions tombent des deux côtés (39...Qxb4, 41...Qb3), mais la position reste globalement équilibrée sur le papier. C'est précisément dans ce genre de position — simplifiée, techniquement égale, mais psychologiquement épuisante — que la technique de Carlsen fait la différence sur la durée.",
        moveSan: ["Qxc8", "Rxc8", "Rxc8", "Qd5", "b4", "a4", "e3", "Be5", "h4", "h5", "Kh2", "Bb2", "Rc5", "Qd6"],
      },
      {
        title: "Vers le record : 136 coups avant la faute fatale",
        fen: "8/5pk1/3qpp2/1pR4p/pP5P/P2NP1P1/1b1R1P1K/8 w - - 4 33",
        text: "La partie va se poursuivre encore près de 70 coups sur ce même mode : manœuvres patientes, aucune complication inutile, la position toujours simplifiée à l'extrême. Nepomniachtchi tient bon pendant des heures, jusqu'à ce qu'une inexactitude, au bout de 136 coups, laisse enfin Carlsen porter le coup fatal — la partie la plus longue de l'histoire des championnats du monde, et l'une des démonstrations les plus pures de la technique de simplification.",
        moveSan: ["Rd1", "Bxa3", "Rxb5", "Qd7", "Rc5", "e5", "Rc2", "Qd5", "Rdd2", "Qb3", "Ra2", "e4", "Nc5", "Qxb4", "Nxe4", "Qb3", "Rac2", "Bf8", "Nc5", "Qb5", "Nd3", "a3", "Nf4", "Qa5", "Ra2", "Bb4", "Rd3", "Kh6", "Rd1", "Qa4", "Rda1", "Bd6", "Kg1", "Qb3", "Ne2", "Qd3"],
      },
    ],
  },
  "pm-le-complexe-de-cases-de-couleur": {
    steps: [
      {
        title: "Pachman – Fischer, Olympiade de La Havane 1966 — un seul Fou de chaque couleur va rester",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Après une série d'échanges dans les douze premiers coups, les DEUX fous à cases noires quittent l'échiquier (8...Bxd4 9.exd4), puis le Fou à cases claires blanc disparaît à son tour (11.Bxc4 Nxc4!). Résultat : les Blancs ne conservent plus qu'un Fou à cases NOIRES, les Noirs qu'un Fou à cases CLAIRES. Toute la partie va désormais se jouer autour de ce déséquilibre de couleur.",
        moveSan: ["d4", "Nf6", "Nf3", "c5", "c4", "cxd4", "Nxd4", "e6", "e3", "Nc6", "Be2", "d5", "Nc3", "Bc5", "O-O", "Bxd4", "exd4", "dxc4", "Be3", "Na5", "Bxc4", "Nxc4"],
      },
      {
        title: "Les Dames s'échangent, la structure blanche se fixe sur les cases noires",
        fen: "r1bqk2r/pp3ppp/4pn2/8/2nP4/2N1B3/PP3PPP/R2Q1RK1 w kq - 0 12",
        text: "12.Qa4+ Bd7 13.Qxc4 Bc6 14.Bg5 Qa5 15.Qc5! propose l'échange des Dames. Après 15...Qxc5 16.dxc5, le pion blanc se fixe sur c5 — une case NOIRE, la couleur du seul Fou qu'il reste aux Blancs. Chaque nouveau pion blanc qui se fixera sur une case noire laissera un peu plus les cases claires sans défense.",
        moveSan: ["Qa4+", "Bd7", "Qxc4", "Bc6", "Bg5", "Qa5", "Qc5", "Qxc5", "dxc5"],
      },
      {
        title: "Le Fou noir manœuvre, les cases claires restent abandonnées",
        fen: "r3k2r/pp3ppp/2b1pn2/2P3B1/8/2N5/PP3PPP/R4RK1 b kq - 0 16",
        text: "Pendant une vingtaine de coups, le Fou blanc navigue entre e3, d4 et f2 — toujours sur des cases noires, jamais capable d'aider à défendre les cases claires. Fischer regroupe patiemment son Cavalier (Ne5, Nd7, Ne5, Ng6, Nf4) sans se presser : le complexe de cases claires ne va nulle part, il peut prendre tout son temps pour l'exploiter.",
        moveSan: ["a5", "Rfd1", "h5", "h4", "Nd7", "Be3", "Ne5", "Bd4", "Nd7", "b3", "Rg8", "Be3", "Ne5", "f3", "Ng6", "Bf2", "Nf4", "Be3"],
      },
      {
        title: "Nxd5 Bxd5 — plus aucune pièce blanche ne peut jamais toucher les cases claires",
        fen: "r3k1r1/1p3pp1/2b1p3/p1P4p/5n1P/1PN1BP2/P5P1/R2R2K1 b q - 4 25",
        text: "26.Nxd5! Bxd5 échange le dernier Cavalier blanc. À partir de cet instant précis, les Blancs n'ont plus AUCUNE pièce capable de contrôler une case claire — seulement des pions et un Fou à cases noires. Le complexe de cases claires est désormais une faiblesse permanente, structurelle, pour le reste de la partie.",
        moveSan: ["Nd5", "Nxd5", "Bxd5"],
      },
      {
        title: "Bxa2! — le Fou clair noir croque un premier pion",
        fen: "r3k1r1/1p3pp1/4p3/p1Pb3p/7P/1P2BP2/P5P1/R2R2K1 w q - 0 27",
        text: "Après un long regroupement des Tours et une marche du Roi blanc, 31...a4 32.Rxa4 Rxa4 33.bxa4 Bxa2! est la première récolte concrète : le pion a2, sur une case claire, tombe simplement parce qu'aucune pièce blanche ne pouvait plus jamais le défendre. C'est la conséquence directe, dix coups plus tard, de l'échange des Cavaliers.",
        moveSan: ["Rd4", "Kd7", "Rc1", "Kc6", "Rc3", "f6", "f4", "Rgd8", "Kf2", "a4", "Rxa4", "Rxa4", "bxa4", "Bxa2"],
      },
      {
        title: "Bxa4! — une seconde case claire tombe",
        fen: "3r4/1p4p1/2k1pp2/2P4p/P4P1P/2R1B3/b4KP1/8 w - - 0 34",
        text: "34.Rc2 Bd5 puis, après un nouveau regroupement, 39...Bxa4! récolte un second pion sur case claire. Le Fou noir se promène librement dans le camp blanc, sur des cases qu'aucune pièce blanche ne pourra plus jamais contester.",
        moveSan: ["Rc2", "Bd5", "Rb2", "Ra8", "Rb4", "Ra5", "g3", "Kc7", "Bd4", "Bc6", "Be3", "Bxa4"],
      },
      {
        title: "Position désespérée — l'abandon",
        fen: "8/1pk3p1/4pp2/r1P4p/bR3P1P/4B1P1/5K2/8 w - - 0 40",
        text: "40.Rd4 Bd7 41.Rd2 Ra8 42.Rb2 Rb8 43.Rd2 : les Blancs ne peuvent plus qu'attendre, deux pions de moins et un complexe de cases claires totalement abandonné. La partie fut ajournée puis abandonnée sans reprise — la démonstration de Fischer était déjà complète.",
        moveSan: ["Rd4", "Bd7", "Rd2", "Ra8", "Rb2", "Rb8", "Rd2"],
      },
    ],
  },
  // Les 3 thèmes ci-dessous (2026-09-11, 3e et dernier lot du « Palier Or »)
  // sortent eux aussi de 3 parties de maîtres RÉELLES (aucun fichier PILOT
  // n'existait pour ces thèmes) sourcées sur le web puis rejouées et
  // vérifiées coup par coup avec chess.js avant rédaction :
  //  - `pm-le-fou-contre-trois-pions` : Bobby Fischer – Boris Spassky,
  //    Reykjavik 1972, Partie 1 — la référence de tous les livres qui
  //    discutent la règle « Fou = trois pions » (29...Bxh2?? piège le Fou
  //    noir, capturé pour seulement 2 pions).
  //  - `pm-la-forteresse-defensive` : Jonathan Hawkins – Daniel Gormally,
  //    2008 (étude Lichess « Fortresses », lichess.org/study/0ZcX3Bkx) —
  //    1.e5 plante le premier pion d'une forteresse patiemment construite
  //    jusqu'à la nulle théorique.
  //  - `pm-la-superiorite-de-l-aile-dame` : Frank Marshall – Jose Raul
  //    Capablanca, New York 1909, partie 23 du match — une majorité de
  //    pions née au 4e coup, transformée en pion passé décisif (31...b3!).
  // La vague de puzzles correspondante (`master-puzzles-dataset.ts`) mine
  // d'autres points de décision réels de ces 3 mêmes parties.
  "pm-le-fou-contre-trois-pions": {
    steps: [
      {
        title: "Fischer – Spassky, Reykjavik 1972, Partie 1 — un Fou vaut-il vraiment trois pions ?",
        fen: "5k2/pp4pp/3bpp2/1P6/8/P2KP3/5PPP/2B5 b - - 0 1",
        text: "Une finale de Fous de même couleur de cases semble parfaitement nulle. Mais Fischer, en zeitnot, tente 1...Bxh2?, estimant qu'un pion de plus (avec un autre à suivre) vaut bien le risque. 2.g3! est la réponse immédiate : la case de fuite g1 est fermée, et le Fou noir commence déjà à manquer d'air.",
        moveSan: ["Bxh2", "g3", "h5", "Ke2", "h4", "Kf3"],
      },
      {
        title: "Le piège se referme",
        fen: "5k2/pp4p1/4pp2/1P6/7p/P3PKP1/5P1b/2B5 b - - 1 4",
        text: "4...Ke7 5.Kg2! Le Roi blanc vient directement fermer la dernière case de fuite du Fou noir. Après 5...hxg3 6.fxg3 Bxg3, le Fou grappille un second pion — mais 7.Kxg3! encaisse la facture : le Fou est perdu pour de bon, capturé sans aucune compensation supplémentaire.",
        moveSan: ["Ke7", "Kg2", "hxg3", "fxg3", "Bxg3", "Kxg3"],
      },
      {
        title: "Le bilan matériel réel",
        fen: "8/pp2k1p1/4pp2/1P6/8/P3P1K1/8/2B5 b - - 0 7",
        text: "Après la chute du Fou, le bilan est clair : les Blancs ont gagné un Fou complet contre seulement deux pions (h2 et g3) — pas trois. C'est précisément la leçon de cette partie devenue légendaire : la règle empirique « un Fou vaut trois pions » ne dit rien sur la SÉCURITÉ de la pièce qui va les capturer. Ici, Fischer a évalué la valeur des pions sans vérifier si son Fou pouvait s'échapper ensuite.",
        moveSan: ["Kd6", "a4", "Kd5", "Ba3", "Ke4", "Bc5", "a6", "b6"],
      },
      {
        title: "Les Noirs cherchent des contre-chances",
        fen: "8/1p4p1/pP2pp2/2B5/P3k3/4P1K1/8/8 b - - 0 11",
        text: "Réduits à un Roi et des pions contre un Roi, un Fou et des pions, les Noirs tentent 21...f5? pour créer de l'activité, mais après 22.Kh4! f4 23.exf4 Kxf4, les Blancs restent maîtres du jeu, Fou et pion d'avance.",
        moveSan: ["f5", "Kh4", "f4", "exf4", "Kxf4", "Kh5", "Kf5", "Be3"],
      },
      {
        title: "Le Fou blanc restreint le dernier pion noir",
        fen: "8/1p4p1/pP2p3/5k1K/P7/4B3/8/8 b - - 3 15",
        text: "Le Fou blanc navigue entre e3, f2, h4 et g5, toujours en embuscade contre les derniers pions noirs (e5, e4) — exactement le rôle qu'un Fou seul peut jouer efficacement contre des pions non soutenus : les bloquer un par un tout en laissant le Roi blanc faire le travail décisif ailleurs.",
        moveSan: ["Ke4", "Bf2", "Kf5", "Bh4", "e5", "Bg5", "e4", "Be3"],
      },
      {
        title: "Le Roi blanc part chercher les pions du camp adverse",
        fen: "8/1p4p1/pP6/5k1K/P3p3/4B3/8/8 b - - 1 19",
        text: "37...Kf6 38.Kg4! Le Roi blanc, débarrassé de toute inquiétude grâce à son Fou qui tient la position seul, part maintenant récolter les pions noirs restants un par un.",
        moveSan: ["Kf6", "Kg4", "Ke5", "Kg5", "Kd5", "Kf5", "a5", "Bf2"],
      },
      {
        title: "La conversion finale",
        fen: "8/1p4p1/1P6/p2k1K2/P3p3/8/5B2/8 b - - 1 23",
        text: "45...g5 46.Kxg5! Le dernier pion noir tombe. Le Fou blanc, resté en sécurité toute la partie, a fini par valoir infiniment plus que les deux pions qu'il avait fallu sacrifier pour le piéger — Fischer abandonnera quelques coups plus tard. Depuis, cette partie est LA référence de tous les livres qui discutent la règle « Fou = trois pions ».",
        moveSan: ["g5", "Kxg5", "Kc4", "Kf5", "Kb4", "Kxe4", "Kxa4", "Kd5", "Kb4", "Kd6"],
      },
    ],
  },
  "pm-la-forteresse-defensive": {
    steps: [
      {
        title: "Hawkins – Gormally, 2008 — planter un pion pour construire la forteresse à venir",
        fen: "r4rk1/pp1qppb1/2n3p1/7p/3PP2P/2R1BP2/P3N1P1/1Q3K1R w - - 0 1",
        text: "1.e5! restreint le Fou g7 noir et fixe un grand centre de pions — mais cette avancée, jouée dans une position où les Blancs sont objectivement moins bien, est aussi le premier pas d'un plan de défense à très long terme : créer des points d'appui fixes autour desquels bâtir, coup après coup, une forteresse imprenable.",
        moveSan: ["e5", "e6", "Kf2", "Ne7", "Rb3", "b6", "Bg5", "Rac8"],
      },
      {
        title: "Simplifier vers la finale la plus défendable",
        fen: "2r2rk1/p2qnpb1/1p2p1p1/4P1Bp/3P3P/1R3P2/P3NKP1/1Q5R w - - 2 5",
        text: "5.Qe4! propose l'échange des Dames — exactement ce qu'il faut quand on doit défendre une position inférieure : moins de pièces sur l'échiquier, moins de moyens pour l'adversaire de créer des complications imprévisibles.",
        moveSan: ["Qe4", "Rc4", "g4", "hxg4", "fxg4", "Qd5", "Qf3", "Qxf3+"],
      },
      {
        title: "h5-h6 : le pion qui va nourrir toute la forteresse",
        fen: "5rk1/p3npb1/1p2p1p1/4P1B1/2rP2PP/1R3q2/P3NK2/7R w - - 0 9",
        text: "10.h5! puis 12.h6! lancent le pion h très loin dans le camp noir. Ce pion n'est pas seulement une menace de promotion : il OBLIGE le Fou noir à rester cloué sur h8 pour l'empêcher d'avancer — la toute première pierre du mur défensif que les Blancs vont construire.",
        moveSan: ["Rxf3", "Nd5", "h5", "gxh5", "gxh5", "Kh7", "h6", "Bh8"],
      },
      {
        title: "Les péripéties tactiques ne changent rien au plan de fond",
        fen: "5r1b/p4p1k/1p2p2P/3nP1B1/2rP4/5R2/P3NK2/7R w - - 1 13",
        text: "Une série d'échanges et d'escarmouches tactiques fait tomber du matériel des deux côtés, mais le plan de fond reste identique : garder le pion h vivant et garder le Fou noir cloué à sa garde.",
        moveSan: ["Nf4", "Rc2+", "Kg3", "Rg8", "Kh4", "Nxf4", "Rxf4", "Rg2"],
      },
      {
        title: "h7 : le pion arrive à un coup de la promotion",
        fen: "6rb/p4p1k/1p2p2P/4P1B1/3P1R1K/8/P5r1/7R w - - 1 17",
        text: "18.h7! Le pion atteint la 7e rangée. Même très en retard au matériel, les Blancs disposent maintenant d'un atout qui vaut, à lui seul, presque une pièce : aucune finale n'est vraiment perdue tant qu'une telle menace de promotion reste vivante.",
        moveSan: ["Rxf7+", "Kg6", "h7", "Ra8", "Re7", "Rxg5", "Rxe6+", "Kf5"],
      },
      {
        title: "Construire le mur : Tour et Roi entourent le pion h7",
        fen: "r6b/p6P/1p2R3/4Pkr1/3P3K/8/P7/7R w - - 1 21",
        text: "Après une série d'échanges, la position se clarifie : Tour et Roi blancs prennent position pour garder le pion h7 et contenir la majorité noire à l'aile Dame. Chaque coup vise désormais un seul objectif : ne rien laisser passer.",
        moveSan: ["Rf1+", "Kxe6", "Kxg5", "Rd8", "Rf4", "b5", "Kh6", "a5", "Rg4", "b4", "Rg8", "Ke7"],
      },
      {
        title: "La forteresse tient : nulle théorique",
        fen: "3r2Rb/4k2P/7K/p3P3/1p1P4/8/P7/8 w - - 2 27",
        text: "Malgré un pion de moins puis deux, les Blancs manœuvrent avec une précision totale (34...Rb4! zugzwang évité de justesse) jusqu'à atteindre, au 35e coup, une finale Tour+pion contre Tour+Fou parfaitement nulle en théorie. La partie fut donnée nulle après 50 coups : la forteresse, patiemment construite depuis le tout premier coup 1.e5, a parfaitement tenu.",
        moveSan: ["Kg5", "a4", "Kf5", "b3", "axb3", "axb3", "Ke4", "b2", "Rg1", "Rb8", "Rb1", "Ke6", "Kd3", "Kd5", "Kc3", "Rc8+", "Kxb2", "Kxd4"],
      },
    ],
  },
  "pm-la-superiorite-de-l-aile-dame": {
    steps: [
      {
        title: "Marshall – Capablanca, New York 1909 (partie 23) — la majorité de pions naît dès l'ouverture",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Après 3...c5 4.cxd5 exd5, la structure de pions est fixée dès le 4e coup : les Noirs auront une majorité de pions à l'aile Dame (a7, b7, c5 contre a2, b2 des Blancs), les Blancs une majorité au centre-Roi. Capablanca va démontrer, dans cette dernière partie du match, comment cette seule majorité suffit à gagner une partie de Grand Maître.",
        moveSan: ["d4", "d5", "c4", "e6", "Nc3", "c5", "cxd5", "exd5", "Nf3", "Nc6", "g3", "Be6", "Bg2", "Be7", "O-O", "Nf6"],
      },
      {
        title: "Les complications tactiques n'effacent pas l'avantage structurel",
        fen: "r2qk2r/pp2bppp/2n1bn2/2pp4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w kq - 5 9",
        text: "Une série d'échanges tactiques autour du centre (9...Ne4, 11.Ne5, 12.Nxe4) fait tomber plusieurs pièces, mais la structure de pions posée au 4e coup reste identique : quoi qu'il arrive tactiquement, la majorité de pions à l'aile Dame de Capablanca reste intacte et attend son heure.",
        moveSan: ["Bg5", "Ne4", "Bxe7", "Qxe7", "Ne5", "Nxd4", "Nxe4", "dxe4", "e3", "Nf3+", "Nxf3", "exf3", "Qxf3", "O-O"],
      },
      {
        title: "Mobiliser la majorité : ...b5 puis ...c4",
        fen: "r4rk1/pp2qppp/4b3/2p5/8/4PQP1/PP3PBP/R4RK1 w - - 1 16",
        text: "18...b5! puis 19...c4! commencent la marche de la majorité. Ce n'est pas encore décisif, mais chaque pas de ces pions réduit d'autant l'espace de manœuvre des pièces blanches à l'aile Dame.",
        moveSan: ["Rfc1", "Rab8", "Qe4", "Qc7", "Rc3", "b5", "a3", "c4"],
      },
      {
        title: "Simplifier encore : moins de pièces, plus le pion avance vite",
        fen: "1r3rk1/p1q2ppp/4b3/1p6/2p1Q3/P1R1P1P1/1P3PBP/R5K1 w - - 0 20",
        text: "Capablanca échange une paire de Tours (21...Rxd1+) — exactement le bon réflexe quand on possède une majorité de pions : moins il reste de pièces adverses, plus les pions passés futurs seront difficiles à arrêter.",
        moveSan: ["Bf3", "Rfd8", "Rd1", "Rxd1+", "Bxd1", "Rd8", "Bf3", "g6"],
      },
      {
        title: "L'échange des Dames confirme le plan",
        fen: "3r2k1/p1q2p1p/4b1p1/1p6/2p1Q3/P1R1PBP1/1P3P1P/6K1 w - - 0 24",
        text: "24...Qe5! propose l'échange des Dames. Après 25.Qe4 Qxe4 26.Bxe4, les Dames quittent l'échiquier : sans elles, la majorité de pions à l'aile Dame devient l'unique facteur qui compte sur l'échiquier.",
        moveSan: ["Qc6", "Qe5", "Qe4", "Qxe4", "Bxe4", "Rd1+", "Kg2", "a5"],
      },
      {
        title: "b4 : la majorité devient un pion passé",
        fen: "6k1/5p1p/4b1p1/pp6/2p1B3/P1R1P1P1/1P3PKP/3r4 w - - 0 28",
        text: "27...b4! Après 28.axb4 axb4, les Noirs obtiennent un pion b passé et soutenu — la transformation complète de « majorité de pions » en « pion passé », l'aboutissement naturel de tout le plan initié dès le 4e coup.",
        moveSan: ["Rc2", "b4", "axb4", "axb4", "Bf3", "Rb1", "Be2", "b3"],
      },
      {
        title: "Le pion passé décide la partie",
        fen: "6k1/5p1p/4b1p1/8/2p5/1p2P1P1/1PR1BPKP/1r6 w - - 2 31",
        text: "31...b3! avance encore. Après 33...c3! 34.bxc3 b2!, le pion, désormais à un pas de la promotion, force la Tour blanche à un sacrifice de qualité pour l'arrêter (35.Rxb2 Rxd1) — les Noirs restent avec un matériel décisif.",
        moveSan: ["Rd2", "Rc1", "Bd1", "c3", "bxc3", "b2", "Rxb2", "Rxd1", "Rc2", "Bf5", "Rb2", "Rc1", "Rb3", "Be4+", "Kh3", "Rc2"],
      },
      {
        title: "La conversion technique",
        fen: "6k1/5p1p/6p1/8/4b3/1RP1P1PK/2r2P1P/8 w - - 8 40",
        text: "Le reste n'est plus que de la technique pure : Capablanca simplifie, active sa Tour et son Fou, et encaisse méthodiquement son avantage matériel et positionnel jusqu'à l'abandon de Marshall au 49e coup — la démonstration parfaite de la supériorité de l'aile Dame, du 4e coup jusqu'au tout dernier.",
        moveSan: ["f4", "h5", "g4", "hxg4+", "Kxg4", "Rxh2", "Rb4", "f5+", "Kg3", "Re2", "Rc4", "Rxe3+", "Kh4", "Kg7", "Rc7+", "Kf6", "Rd7", "Bg2", "Rd6+", "Kg7"],
      },
    ],
  },
  // (2026-09-12, Palier Or « Avancé », Lot 7) `jh-module-16` : Aron
  // Nimzowitsch (Blancs) – Akiba Rubinstein (Noirs), Dresde 1926, ronde 5
  // (A34, Anglaise Symétrique), 46 coups, 1-0 — élue meilleure partie du
  // tournoi, et Nimzowitsch lui-même la considérait comme le sommet de sa
  // carrière. La partie assignée à l'origine par le cahier des charges
  // (« Rubinstein–Nimzowitsch, San Sebastian 1912 ») EXISTE bien
  // (chessgames gid=1102356, A55, 1-0) mais est une mêlée tactique tranchée
  // par un double aveuglement mutuel (mat en 2 raté par les deux joueurs au
  // coup 25) — aucun contenu de plan à long terme. Remplacée, avec
  // validation utilisateur, par ce vrai modèle historique du thème : la
  // manœuvre de regroupement Cg3-h1-f2-h3-g5! (coups 18-30), suivie de
  // l'ouverture d'un second front à l'aile dame (26.b4!) sans jamais
  // relâcher la pression à l'aile roi. 91 demi-coups intégralement rejoués
  // et vérifiés avec chess.js.
  "jh-module-16-construire-un-plan-a-long-terme": {
    steps: [
      {
        title: "Aron Nimzowitsch – Akiba Rubinstein, Dresde 1926 (meilleure partie du tournoi)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Anglaise symétrique : après les échanges du centre (4.cxd5 Cxd5 5.e4 Cb4), la position semble presque banale. PRO TIP de Jesper Hall pour tout ce module : NE JOUEZ JAMAIS un plan à long terme sans avoir d'abord identifié une cible durable — ici, Nimzowitsch a repéré dès l'ouverture que le Cavalier noir b4, repoussé un jour ou l'autre, laissera des cases affaiblies autour du roi noir. Tout le reste de la partie n'est que l'exécution patiente de ce diagnostic initial.",
        moveSan: ["c4", "c5", "Nf3", "Nf6", "Nc3", "d5", "cxd5", "Nxd5", "e4", "Nb4", "Bc4", "e6", "O-O", "N8c6"],
      },
      {
        title: "Nimzowitsch – Rubinstein : coups 10-11, Ce2-g3 — premier maillon du plan",
        fen: "r1bqkb1r/pp3ppp/4p3/8/1nBpP3/2NP4/PP3PPP/R1BQ1RK1 w kq - 0 10",
        text: "Ne2 puis Ng3 : un coup qui ne menace rien d'immédiat et ressemble à une simple mise en place. PRO TIP : un plan à long terme démarre presque toujours par une étape modeste, invisible pour l'adversaire — ce Cavalier va bientôt entamer un voyage bien plus surprenant encore, mais chaque étape doit d'abord sembler anodine pour ne pas alerter le camp adverse.",
        moveSan: ["Ne2", "a6", "Ng3", "Bd6"],
      },
      {
        title: "Nimzowitsch – Rubinstein : coup 18, Ch1 !? — le point culminant du regroupement",
        fen: "r1b2r1k/1pq3pp/p1nb4/5p2/2Bp1P2/3P1QN1/PP1BR1PP/5RK1 w - - 0 18",
        text: "LE coup que Nimzowitsch lui-même considérait comme la clé de toute la partie : le Cavalier retourne sur la pire case théorique de l'échiquier — mais c'est le seul chemin vers f2, puis h3, puis enfin g5, une case qu'aucune pièce mineure noire ne pourra jamais contester. PRO TIP : ne craignez jamais un coup qui semble affreux À COURT TERME s'il sert un plan clairement identifié à long terme — jugez un coup par sa destination finale, pas par l'apparence de la case qu'il traverse.",
        moveSan: ["Nh1", "Bd7", "Nf2", "Rae8"],
        arrows: [{ from: "g3", to: "h1", color: "green" }, { from: "h1", to: "f2", color: "green" }],
        highlights: [{ square: "g5", color: "green" }],
      },
      {
        title: "Nimzowitsch – Rubinstein : coup 22, Ch3 — le Cavalier atteint enfin sa cible",
        fen: "3n1r1k/1pqb2pp/p2b4/5p2/2Bp1P2/3P1Q2/PP1BRNPP/6K1 w - - 1 22",
        text: "Nh3, avant-dernière étape : le Cavalier menace directement Ng5, et Noir doit déjà commencer à composer avec cette perspective. PRO TIP : au fur et à mesure qu'un plan à long terme approche de son terme, chaque coup redevient concret et menaçant — le camp qui a patienté vingt coups plus tôt récolte maintenant l'initiative avec un temps d'avance sur l'adversaire, qui découvre le danger trop tard.",
        moveSan: ["Nh3", "Bc6", "Qh5", "g6"],
        arrows: [{ from: "f2", to: "h3", color: "green" }],
        highlights: [{ square: "g5", color: "green" }],
      },
      {
        title: "Nimzowitsch – Rubinstein : coup 26, b4! — ouvrir un second front sans relâcher le premier",
        fen: "3n1r2/1pq3kp/p1b3p1/2b2p2/2Bp1P2/3P3N/PP1BRQPP/6K1 w - - 4 26",
        text: "b4! surgit à l'opposé de l'échiquier, alors que la pression à l'aile roi (Dh4, Ch3-g5) est toujours à son maximum. PRO TIP essentiel : un plan à long terme n'est pas forcément à sens unique — Nimzowitsch ouvre ici un DEUXIÈME front pendant que le premier tient toujours l'adversaire occupé, l'obligeant à défendre sur deux tableaux à la fois avec des pièces qui ne suffisent plus.",
        moveSan: ["b4", "Bb6", "Qh4", "Re8"],
        arrows: [{ from: "b2", to: "b4", color: "green" }],
      },
      {
        title: "Nimzowitsch – Rubinstein : coups 28-30, Te5 et Cg5 — les cases préparées entrent en jeu",
        fen: "3nr3/1pq3kp/pbb3p1/5p2/1PBp1P1Q/3P3N/P2BR1PP/6K1 w - - 3 28",
        text: "Re5! puis, après l'élimination du Cavalier f7, Ng5 : la Tour et le Cavalier occupent enfin les cases que toute la manœuvre précédente avait préparées. PRO TIP : un plan mûrit par accumulation — chaque coup isolé semblait modeste, mais leur somme installe maintenant deux pièces blanches sur des postes que Noir ne peut contester nulle part.",
        moveSan: ["Re5", "Nf7", "Bxf7", "Qxf7", "Ng5", "Qg8"],
        arrows: [{ from: "e2", to: "e5", color: "green" }],
        highlights: [{ square: "f7", color: "red" }],
      },
      {
        title: "Nimzowitsch – Rubinstein : coups 33-36, la convergence des deux ailes tranche la partie",
        fen: "6q1/1p4kp/pbb3p1/5pN1/1P1p1P2/3P4/P2B2PP/4Q1K1 w - - 2 33",
        text: "Qe7+! chasse le roi noir, puis b5! relance immédiatement l'attaque à l'aile dame préparée au coup 26 — les deux plans, kingside et queenside, convergent enfin l'un vers l'autre et Noir ne peut plus parer les deux à la fois : la paire de Fous tombe. PRO TIP de conclusion : un plan à long terme bien exécuté ne se termine JAMAIS par un seul grand coup spectaculaire, mais par la convergence tranquille de plusieurs menaces préparées bien à l'avance — exactement ce qui distingue Nimzowitsch, ici, de son propre adversaire.",
        moveSan: ["Qe7+", "Kh8", "b5", "Qg7", "Qxg7+", "Kxg7", "bxc6", "bxc6"],
        highlights: [{ square: "c6", color: "red" }],
      },
    ],
  },
  // (2026-09-12, Palier Or « Avancé », Lot 7) `jh-module-17` : Robert James
  // Fischer (Blancs) – Lhamsuren Myagmarsuren (Noirs), Interzonal de Sousse
  // 1967, ronde 3 (A07, Attaque Indienne du Roi), 31 coups, 1-0 — partie
  // assignée par le cahier des charges, vérifiée exacte (chessgames
  // gid=1044267). Illustre le passage d'un registre à l'autre : une
  // construction tranquille par principes généraux (registre intuitif),
  // suivie d'une course de pions/attaque calculée avec précision jusqu'au
  // dernier tempo (registre du calcul). 61 demi-coups intégralement rejoués
  // et vérifiés avec chess.js.
  "jh-module-17-calcul-et-intuition-positionnelle": {
    steps: [
      {
        title: "Robert James Fischer – Lhamsuren Myagmarsuren, Interzonal de Sousse 1967",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Attaque Indienne du Roi : structure calme, développement naturel, rien de forcé pour l'instant. PRO TIP de Jesper Hall pour tout ce module : dans une position calme comme celle-ci, jugez par l'INTUITION — espace, sécurité du roi, activité des pièces — jamais par un calcul en profondeur qui serait ici une pure perte de temps.",
        moveSan: ["e4", "e6", "d3", "d5", "Nd2", "Nf6", "g3", "c5", "Bg2", "Nc6", "Ngf3", "Be7", "O-O", "O-O"],
      },
      {
        title: "Fischer – Myagmarsuren : coup 8, e5! — décision intuitive qui fixe les plans",
        fen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/4P3/3P1NP1/PPPN1PBP/R1BQ1RK1 w - - 6 8",
        text: "e5! ferme le centre et fixe durablement les plans des deux camps — Blanc jouera à l'aile roi (h4-h5, Cf1-e3-g5 ou h3), Noir à l'aile dame (b5-b4-a4). Ce choix ne se calcule pas, il se JUGE par expérience et par principes : quel plan votre structure favorise-t-elle ?",
        moveSan: ["e5", "Nd7", "Re1", "b5"],
      },
      {
        title: "Fischer – Myagmarsuren : coup 16, Bh3! — la prophylaxie tranquille avant la bascule",
        fen: "r2q1rk1/3nbppp/b3p3/n1ppP3/p4B1P/P2PNNP1/2P2PB1/R2QR1K1 w - - 3 16",
        text: "Bh3, dernier coup purement positionnel : la diagonale c8-h3 est neutralisée et le Fou vise déjà e6/d7 sans qu'aucune pièce noire ne soit directement attaquée. PRO TIP : c'est le tout dernier moment du registre intuitif — la position va basculer au coup suivant, il faut la sentir venir.",
        moveSan: ["Bh3", "d4", "Nf1", "Nb6"],
      },
      {
        title: "Fischer – Myagmarsuren : coup 18, Cg5! — le signal du passage au calcul",
        fen: "r2q1rk1/4bppp/bn2p3/n1p1P3/p2p1B1P/P2P1NPB/2P2P2/R2QRNK1 w - - 2 18",
        text: "Ng5! change tout : le Cavalier menace des prises concrètes (Bxg5 forcé, sinon Cxe6 ou Cxh7). PRO TIP essentiel : DÈS QU'un coup crée une menace directe, un échec ou une prise possible, arrêtez d'évaluer par intuition et commencez à CALCULER chaque ligne jusqu'au bout — se tromper de registre ici coûte la partie.",
        moveSan: ["Ng5", "Nd5", "Bd2", "Bxg5", "Bxg5", "Qd7"],
        arrows: [{ from: "f3", to: "g5", color: "green" }],
        highlights: [{ square: "d5", color: "red" }],
      },
      {
        title: "Fischer – Myagmarsuren : coups 22-23, Cc3 et Bf6 — la partie devient une course calculée",
        fen: "r1r3k1/3q1ppp/b3p3/n1pnP1BQ/p2p3P/P2P2PB/2P2P2/R3RNK1 w - - 3 22",
        text: "Noir tente sa propre contre-chance calculée (...Nc3, une fourchette potentielle sur d1/e2), pendant que Fischer verrouille toutes les issues avec Bf6!. À partir d'ici, chaque coup des deux camps doit être vérifié plusieurs coups à l'avance — l'intuition seule ne suffit plus à départager les lignes.",
        moveSan: ["Nd2", "Nc3", "Bf6", "Qe8"],
      },
      {
        title: "Fischer – Myagmarsuren : coups 26-27, la course des pions passés — calcul pur des tempos",
        fen: "r1r1q1k1/5p1p/b3pBp1/n1p1P1Q1/p2pn2P/P2P2PB/2P2P2/R3R1K1 w - - 0 26",
        text: "Rxe4! c4 h5 cxd3 : Noir pousse son pion c vers la promotion pendant que Fischer avance son attaque de mat à l'aile roi — une pure course de vitesse où seul un compte EXACT des tempos permet de savoir qui arrive le premier. PRO TIP : dans une course calculée, comptez toujours les coups des DEUX côtés avant de choisir votre propre coup, jamais un seul camp à la fois.",
        moveSan: ["Rxe4", "c4", "h5", "cxd3", "Rh4", "Ra7"],
      },
      {
        title: "Fischer – Myagmarsuren : coups 30-31, Dh6! puis Dxh7+ — le calcul gagne d'un tempo exact",
        fen: "2r1q1k1/r4p1p/b3pBp1/n3P1QP/p2p3R/P5P1/2p2PB1/R5K1 w - - 0 30",
        text: "Qh6! puis Qxh7+ : le pion c noir n'est plus qu'à deux cases de la promotion (il en est à c2), mais le mat blanc arrive un coup plus tôt. PRO TIP de conclusion : ce dénouement est la preuve du module — Fischer a joué intuitivement pendant quinze coups, puis a calculé jusqu'au bout à partir du coup 18, sans jamais confondre les deux registres.",
        moveSan: ["Qh6", "Qf8", "Qxh7+"],
        highlights: [{ square: "h7", color: "red" }],
      },
    ],
  },
  // (2026-09-12, Palier Or « Avancé », Lot 7) `jh-module-18` : Deep Blue
  // (Blancs, IBM) – Garry Kasparov (Noirs), Philadelphie 1996, Partie 1 (B22,
  // Sicilienne Alapin), 37 coups, 1-0 — première victoire d'un ordinateur sur
  // un champion du monde en titre dans des conditions de tournoi standard.
  // Couleurs corrigées par rapport au cahier des charges (« Kasparov–Deep
  // Blue ») : c'est Deep Blue qui a les Blancs, validé par l'utilisateur.
  // Illustre l'évaluation dynamique (23.d5!?, sacrifice de pion pour
  // l'activité — Kasparov lui-même : « j'aurais peut-être joué 23.d5 moi-même
  // ») contre l'évaluation statique (18.Bxf6!, endommager durablement la
  // structure noire). 73 demi-coups intégralement rejoués et vérifiés avec
  // chess.js.
  "jh-module-18-evaluation-dynamique-contre-statique": {
    steps: [
      {
        title: "Deep Blue – Garry Kasparov, Philadelphie 1996, Partie 1 (Sicilienne Alapin)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Sicilienne Alapin, choisie par l'équipe IBM précisément pour éviter les lignes où Kasparov possédait une préparation approfondie. PRO TIP de Jesper Hall pour tout ce module : une évaluation STATIQUE compte le matériel et la structure de pions ; une évaluation DYNAMIQUE compte l'activité et l'initiative — la vraie force d'un joueur (ou d'une machine) se voit dans sa capacité à peser les deux à chaque coup, jamais un seul des deux registres isolément.",
        moveSan: ["e4", "c5", "c3", "d5", "exd5", "Qxd5", "d4", "Nf6", "Nf3", "Bg4", "Be2", "e6", "h3", "Bh5", "O-O", "Nc6"],
      },
      {
        title: "Deep Blue – Kasparov : coup 18, Bxf6! — un choix statique assumé",
        fen: "2r2rk1/pp2qppp/1bn1pn2/1N2N1B1/3P4/P6P/1P2QPP1/2R2RK1 w - - 5 18",
        text: "Bxf6! cède la paire de Fous mais laisse les pions noirs doublés et affaiblis en permanence (gxf6). PRO TIP : c'est un choix purement STATIQUE — Deep Blue renonce à une pièce active contre un gain durable, immuable, qui ne dépendra d'aucune initiative future pour rester réel.",
        moveSan: ["Bxf6", "gxf6"],
      },
      {
        title: "Deep Blue – Kasparov : coup 23, d5!? — LE sacrifice dynamique",
        fen: "2rr2k1/1p3p1p/1pn1pq2/1N3p2/3P4/P3Q2P/1P3PP1/2RR2K1 w - - 2 23",
        text: "d5!? Rxd5 Rxd5 exd5 : Deep Blue sacrifie un pion pour ouvrir le centre et exposer le roi noir. PRO TIP essentiel : Kasparov lui-même reconnaîtra après la partie « j'aurais peut-être joué 23.d5 moi-même » — c'est l'exemple parfait d'une décision purement DYNAMIQUE, où l'activité et la sécurité du roi adverse comptent plus que le compte exact du matériel.",
        moveSan: ["d5", "Rxd5", "Rxd5", "exd5"],
        arrows: [{ from: "d4", to: "d5", color: "green" }],
        highlights: [{ square: "d5", color: "green" }],
      },
      {
        title: "Deep Blue – Kasparov : coup 25, b3 — consolider avant d'encaisser",
        fen: "2r3k1/1p3p1p/1pn2q2/1N1p1p2/8/P3Q2P/1P3PP1/2R3K1 w - - 0 25",
        text: "b3, coup tranquille de prophylaxie : Deep Blue sécurise sa propre position avant de continuer à convertir son avantage dynamique. PRO TIP : une fois l'initiative acquise, ne vous précipitez pas — consolidez d'abord tout ce qui pourrait basculer contre vous, PUIS continuez à pousser l'avantage.",
        moveSan: ["b3", "Kh8", "Qxb6", "Rg8"],
      },
      {
        title: "Deep Blue – Kasparov : coups 27-28, Dc5 et Cd6 — chasser les dernières cibles statiques",
        fen: "6rk/1p3p1p/1Qn2q2/1N1p1p2/8/PP5P/5PP1/2R3K1 w - - 1 27",
        text: "Qc5! puis Nd6! : la Dame et le Cavalier harcèlent maintenant les faiblesses statiques restantes (d4, b7) pendant que Noir tente sa propre dynamique avec f4-f3. Le sacrifice de pion du coup 23 a payé : l'initiative se transforme peu à peu en gains matériels concrets.",
        moveSan: ["Qc5", "d4", "Nd6", "f4"],
      },
      {
        title: "Deep Blue – Kasparov : coups 30-32, Dd5 et Tc7 — la 7e rangée referme le filet",
        fen: "6rk/1N3p1p/5q2/2Q1n3/3p1p2/PP5P/5PP1/2R3K1 w - - 1 30",
        text: "Qd5! centralise pendant que Rc7! s'installe sur la 7e rangée — un gain définitivement STATIQUE (une case forte, permanente) qui vient couronner toute l'activité dynamique accumulée depuis le coup 23. PRO TIP : le but ultime d'un avantage dynamique est presque toujours de se transformer en gain statique avant de s'éroder.",
        moveSan: ["Qd5", "f3", "g3", "Nd3", "Rc7", "Re8"],
      },
      {
        title: "Deep Blue – Kasparov : coups 34-37, la combinaison finale — dynamique devenue décisive",
        fen: "7k/2R2p1p/3N1q2/3Q4/3p4/PP1n1pPP/5P2/4r1K1 w - - 5 34",
        text: "Kh2! Nxf2 Nxf7+! Kg7 Ng5+ Kh6 Rxh7+ : la combinaison finale enchaîne les coups forcés jusqu'au gain décisif. PRO TIP de conclusion : cette partie entière est un dialogue permanent entre le statique (coup 18) et le dynamique (coup 23) — comprendre LEQUEL des deux registres domine à chaque instant est exactement ce qui permet de choisir le bon coup, humain ou machine.",
        moveSan: ["Kh2", "Nxf2", "Nxf7+", "Kg7", "Ng5+", "Kh6", "Rxh7+"],
      },
    ],
  },
  // (2026-09-12, Palier Or « Avancé », Lot 7) `jh-module-19` : Anatoly Karpov
  // (Blancs) – Garry Kasparov (Noirs), Championnat du Monde, Moscou 1985,
  // Partie 16 (B44, Sicilienne Taimanov), 40 coups, 0-1 — élue par les
  // lecteurs de Chess Informant meilleure partie des 64 premiers numéros de
  // la revue. Partie assignée par le cahier des charges, vérifiée exacte
  // (chessgames gid=1067175, couleurs et résultat confirmés). Illustre la
  // domination d'un complexe de cases (le Cavalier noir plante son drapeau
  // sur d3 au coup 16 et y reste 18 coups, jusqu'à forcer Karpov à donner sa
  // Dame pour l'en déloger au coup 34). 80 demi-coups intégralement rejoués
  // et vérifiés avec chess.js.
  "jh-module-19-les-cases-de-couleur-au-milieu-de-partie": {
    steps: [
      {
        title: "Anatoly Karpov – Garry Kasparov, Championnat du Monde Moscou 1985, Partie 16",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Sicilienne Taimanov : les dix premiers coups reprennent exactement la Partie 12 du même match, mais Kasparov avait préparé une nouveauté en profondeur pour cette position précise. PRO TIP de Jesper Hall pour tout ce module : voyez le milieu de partie en DEUX couches de cases, claires et sombres — chaque échange de pièces mineures modifie l'équilibre entre les deux, souvent bien avant que la conséquence ne devienne visible.",
        moveSan: ["e4", "c5", "Nf3", "e6", "d4", "cxd4", "Nxd4", "Nc6", "Nb5", "d6", "c4", "Nf6", "N1c3", "a6", "Na3", "d5"],
      },
      {
        title: "Karpov – Kasparov : coups 9-10, la série d'échanges qui fixe déjà les cases faibles",
        fen: "r1bqkb1r/1p3ppp/p1n1pn2/3p4/2P1P3/N1N5/PP3PPP/R1BQKB1R w KQkq - 0 9",
        text: "cxd5 exd5 exd5 Nb4 : cette séquence d'échanges centraux, en apparence anodine, détermine déjà quelles cases resteront faibles pour chaque camp. PRO TIP : AVANT de jouer une série d'échanges, demandez-vous toujours quel complexe de cases restera affaibli pour chacun des deux camps une fois la poussière retombée — c'est précisément ce diagnostic que Kasparov a fait avant même de s'asseoir à la table.",
        moveSan: ["cxd5", "exd5", "exd5", "Nb4"],
      },
      {
        title: "Karpov – Kasparov : coup 16, Cd3! — le Cavalier plante son drapeau",
        fen: "r2qr1k1/5ppp/p4n2/1pbP1bB1/1n6/N1N2B2/PP1Q1PPP/R4RK1 w - - 0 16",
        text: "Nd3!! Le Cavalier s'installe sur une case qu'aucune pièce blanche ne peut jamais attaquer ni déloger — ni pion, ni Fou de la bonne couleur, ni Cavalier sans se faire échanger contre lui. PRO TIP essentiel : un complexe de cases se domine en y plantant une pièce IMMUNISÉE contre toute expulsion — ce Cavalier va rester sur d3 pendant DIX-HUIT coups, une éternité à l'échelle d'une partie d'échecs.",
        moveSan: ["Rad1", "Nd3"],
        highlights: [{ square: "d3", color: "green" }],
      },
      {
        title: "Karpov – Kasparov : coup 22, l'échange des Fous de cases sombres aggrave le déséquilibre",
        fen: "2rqr1k1/5p2/p2b1n1p/3P1bp1/Np6/1P1n1BB1/P2Q1PPP/1N1R1RK1 w - - 0 22",
        text: "Bxd6 Qxd6 g3 Nd7 : l'échange des derniers Fous de cases sombres retire à Karpov son seul défenseur naturel de ce complexe — désormais, plus AUCUNE pièce blanche ne peut jamais contester les cases sombres autour de son propre roi.",
        moveSan: ["Bxd6", "Qxd6", "g3", "Nd7"],
      },
      {
        title: "Karpov – Kasparov : coups 28-29, d6 et g4 — l'attaque se déploie sur les deux couleurs",
        fen: "2r1r1k1/3n1p2/5qbp/3P2p1/Np6/1P1n2P1/Q4PBP/1N1R1RK1 w - - 2 28",
        text: "d6 g4 Qd2 Kg7 : Kasparov pousse maintenant sur les DEUX couleurs à la fois — le pion g4 attaque les cases sombres du roque blanc pendant que le Cavalier d3 tient toujours les cases claires. Karpov n'a plus de refuge sûr, quelle que soit la couleur qu'il choisit de défendre.",
        moveSan: ["d6", "g4", "Qd2", "Kg7"],
      },
      {
        title: "Karpov – Kasparov : coups 32-33, Cf6-e4 — le Cavalier occupe une nouvelle case du complexe",
        fen: "2r1r3/3n1pk1/6bp/8/Np1q2P1/1P1n2P1/3Q2BP/1N1R1RK1 w - - 1 32",
        text: "Kh1 Nf6 Rf4 Ne4! : le Cavalier noir, chassé de d3, migre aussitôt vers e4 — une AUTRE case du même complexe de cases claires, tout aussi inaccessible aux pièces blanches. PRO TIP : dominer un complexe de cases n'exige pas de garder toujours la MÊME case, mais de toujours en occuper AU MOINS une.",
        moveSan: ["Kh1", "Nf6", "Rf4", "Ne4"],
      },
      {
        title: "Karpov – Kasparov : coup 34, Dxd3! — le prix à payer pour chasser l'intrus",
        fen: "2r1r3/5pk1/6bp/8/Np1qnRP1/1P1n2P1/3Q2BP/1N1R3K w - - 5 34",
        text: "Qxd3! Nf2+ : Karpov est enfin contraint de donner sa PROPRE DAME pour éliminer l'intrus — c'est le prix matériel exact d'un complexe de cases dominé pendant dix-huit coups sans interruption. PRO TIP de conclusion : ce sacrifice forcé n'est pas un accident, c'est la conséquence mathématique du coup 16 — une pièce inamovible sur une case-clé finit toujours par coûter au moins son propre poids en matériel à l'adversaire.",
        moveSan: ["Qxd3", "Nf2+"],
        highlights: [{ square: "d3", color: "red" }],
      },
      {
        title: "Karpov – Kasparov : coups 37-40, l'infiltration finale sur la 1e rangée",
        fen: "2r1r3/5pk1/7p/8/Np4P1/1P1bq1P1/3R2BP/1N1R3K w - - 2 37",
        text: "Rxd3 Rc1! Nb2 Qf2 Nd2 Rxd1+! Nxd1 Re1+ : les Tours et la Dame noires s'infiltrent sur la première rangée blanche, désormais totalement dégarnie — Karpov abandonne sans parade au double échec qui suit. La domination d'un seul complexe de cases, commencée vingt-quatre coups plus tôt, a fini par décider toute la partie.",
        moveSan: ["Rxd3", "Rc1", "Nb2", "Qf2", "Nd2", "Rxd1+", "Nxd1", "Re1+"],
      },
    ],
  },
  // (2026-09-12, Palier Or « Avancé », Lot 7) `jh-module-20` : Alexander
  // Alekhine (Blancs) – Frederick Yates (Noirs), Londres 1922, ronde 10 (D63,
  // Dame Refusée Orthodoxe), 38 coups, 1-0 — qu'Alekhine lui-même qualifiait
  // de « chef-d'œuvre positionnel ». La partie assignée à l'origine par le
  // cahier des charges (« Short–Timman, Tilburg 1991 ») EXISTE bien
  // (chessgames gid=1124533, B04, 1-0) et EST la fameuse marche de roi
  // Rh2-g3-f4-g5, mais elle a lieu en plein MILIEU DE PARTIE — Dames et
  // Tours toutes deux encore sur l'échiquier à la position finale — pas en
  // finale comme le nom du thème l'exige. Remplacée, avec validation
  // utilisateur, par le propre contre-exemple « en finale » cité par
  // l'article Wikipédia « King walk » : Dames échangées dès le coup 18, bon
  // Cavalier contre mauvais Fou, 7e rangée, et une vraie marche de roi de
  // finale Rf2-g3-f4-e5 qui tranche la partie. 75 demi-coups intégralement
  // rejoués et vérifiés avec chess.js.
  "jh-module-20-le-roi-actif-en-finale": {
    steps: [
      {
        title: "Alexander Alekhine – Frederick Yates, Londres 1922 (« chef-d'œuvre positionnel »)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        text: "Dame Refusée, ligne Orthodoxe classique. PRO TIP de Jesper Hall pour tout ce module : dès que les Dames quittent l'échiquier et qu'aucune attaque de mat n'est plus possible, réévaluez IMMÉDIATEMENT la sécurité de votre roi — il cesse d'être une faiblesse à protéger pour devenir une pièce à faire progresser.",
        moveSan: ["d4", "Nf6", "c4", "e6", "Nf3", "d5", "Nc3", "Be7", "Bg5", "O-O", "e3", "Nbd7", "Rc1", "c6", "Qc2", "Re8", "Bd3"],
      },
      {
        title: "Alekhine – Yates : coups 18-19, l'échange des Dames ouvre VRAIMENT la finale",
        fen: "r1b1r1k1/4q1pp/4p3/1pnp1p2/p2P4/4PN2/PPQ2PPP/2R2RK1 w - - 0 18",
        text: "Qxc5! Qxc5 Rxc5 b4 : les Dames disparaissent définitivement de l'échiquier. PRO TIP : c'est le VRAI début de la finale — à partir d'ici, chaque évaluation doit se faire à travers l'activité des rois, pas leur sécurité.",
        moveSan: ["Qxc5", "Qxc5", "Rxc5", "b4"],
      },
      {
        title: "Alekhine – Yates : coup 21, Ce5! — le bon Cavalier contre le mauvais Fou",
        fen: "r3r1k1/6pp/b3p3/2Rp1p2/pp1P4/4PN2/PP3PPP/2R3K1 w - - 2 21",
        text: "Ne5! installe le Cavalier sur un poste que rien ne peut déloger, pendant que le Fou noir a6 reste emprisonné derrière ses propres pions b5/d5 — un bon Cavalier contre un mauvais Fou, la structure sous-jacente qui va permettre au roi blanc d'avancer sans crainte.",
        moveSan: ["Ne5", "Reb8"],
        arrows: [{ from: "f3", to: "e5", color: "green" }],
        highlights: [{ square: "a6", color: "red" }],
      },
      {
        title: "Alekhine – Yates : coup 24, Rf2! — la marche du roi commence",
        fen: "rr4k1/6p1/b3p2p/2RpNp2/p2P4/Pp2PP2/1P4PP/2R3K1 w - - 0 24",
        text: "Kf2! Kh7 h4 Rf8 : plus aucun échec noir n'est possible, plus aucune attaque de mat ne menace — Alekhine commence donc IMMÉDIATEMENT à marcher son roi vers le centre. PRO TIP majeur : dès que le danger direct s'éloigne, le roi devient une pièce de combat à part entière — ne le laissez jamais passif au bord de l'échiquier une fois ce moment venu.",
        moveSan: ["Kf2", "Kh7", "h4", "Rf8"],
        arrows: [{ from: "g1", to: "f2", color: "green" }],
      },
      {
        title: "Alekhine – Yates : coups 26-30, Rg3-f4 — le roi et les Tours avancent ensemble",
        fen: "r4r2/6pk/b3p2p/2RpNp2/p2P3P/Pp2PP2/1P3KP1/2R5 w - - 1 26",
        text: "Kg3! Rfb8 Rc7 Bb5 R1c5 Ba6 R5c6 Re8 Kf4! Kg8 : le roi poursuit sa marche (f2-g3-f4) pendant que les deux Tours blanches triplent leur domination de la 6e/7e rangée — le Fou noir, condamné à l'immobilité, ne peut qu'observer. Chaque pièce blanche progresse EN MÊME TEMPS vers l'action.",
        moveSan: ["Kg3", "Rfb8", "Rc7", "Bb5", "R1c5", "Ba6", "R5c6", "Re8", "Kf4", "Kg8"],
        arrows: [{ from: "f2", to: "g3", color: "green" }, { from: "g3", to: "f4", color: "green" }],
      },
      {
        title: "Alekhine – Yates : coups 35-36, Cd7 et Cf6! — le filet se referme",
        fen: "r5r1/2R2Rpk/b3p2p/3pNp1P/p2P1K2/Pp2PPP1/1P6/8 w - - 5 35",
        text: "Nd7! Kh8 Nf6! Rgf8 : le Cavalier complète l'étau pendant que le roi noir n'a plus une seule case sûre. Le roi blanc en f4, lui, reste totalement protégé — il n'a plus rien à craindre depuis l'échange des Dames au coup 18.",
        moveSan: ["Nd7", "Kh8", "Nf6", "Rgf8"],
      },
      {
        title: "Alekhine – Yates : coup 38, Re5! — le roi complète lui-même la domination",
        fen: "r6k/2R3R1/b3pr1p/3p1p1P/p2P1K2/Pp2PPP1/1P6/8 w - - 0 38",
        text: "Après 37.Rxg7 Rxf6, le roi blanc, parti de g1 vingt coups plus tôt, atteint maintenant e5 pour porter le coup de grâce lui-même : la Tour noire f6 est perdue, prise entre le roi et l'attaque combinée des pièces blanches. PRO TIP de conclusion : voilà le fil rouge de toute la partie — depuis l'échange des Dames, chaque étape de la marche du roi (f2, g3, f4, e5) a rapproché Alekhine un peu plus de cette case exacte, choisie bien avant d'y arriver.",
        moveSan: ["Ke5"],
      },
    ],
  },
  // Les modules 21-25 (clôture du Palier Or) N'ONT PLUS d'entrée ici depuis
  // le 2026-09-12 : remplacés par un vrai arbre RAV (variantes réelles,
  // suggestions moteur) dans `COURSE_TREES` (`course-tree.ts`), que
  // `theme-lesson.tsx` préfère désormais à ce module pour ces 5 thèmes — voir
  // le docstring de `course-tree.ts` pour la source de chaque partie et
  // pourquoi ce format ne s'applique qu'à ces 5-là pour l'instant.
};
