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
};
