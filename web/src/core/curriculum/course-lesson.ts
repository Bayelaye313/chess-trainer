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
 *    Précédent/Suivant, jamais de coup à trouver) — chaque `CourseStep` est
 *    un chapitre RÉEL de l'étude source, avec sa propre position, son propre
 *    commentaire traduit, et les coups clés qui y sont joués (affichés en
 *    texte SAN sous le diagramme, jamais rejoués case par case : ce module
 *    reste pur, sans dépendance à chess.js, comme `theme-demo.ts`).
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
  /** Coups clés joués depuis la position de départ RÉELLE du chapitre — texte seul, jamais rejoué visuellement. */
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
 *   `private` en HTTP 403, aucun contenu réel à en tirer. Chaque `CourseStep`
 *   ici garde `fen` = position de DÉPART du chapitre source (jamais la
 *   position d'arrivée) ; `moveSan`, quand présent, est un PRÉFIXE RÉEL de la
 *   partie/ligne du chapitre rejoué depuis cette même position — jamais une
 *   suite reconstituée à la main.
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
};
