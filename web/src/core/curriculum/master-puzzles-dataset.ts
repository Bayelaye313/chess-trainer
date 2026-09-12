/**
 * DATASET STATIQUE ET DÉCONNECTÉ — un puzzle réel et distinct par thème, pour
 * chacun des 161 thèmes curatés de l'académie « Apprendre » (141 d'origine +
 * les 3 de la catégorie « Endgame Mastery » (cahier des charges du
 * 2026-09-08, remplace les 14 positions pédagogiques d'origine) + les 9
 * `pawn_structures` + le thème `pawn_weaknesses` + les 7 `middlegame`, voir
 * le docstring de `catalog.ts`).
 *
 * ## Pourquoi ce fichier remplace tout le pipeline dynamique précédent
 *
 * L'ancien pipeline (`select-theme-puzzles.ts` + `generate-theme-puzzles.ts` +
 * `mutate-position.ts`) routait un thème vers un corpus, puis complétait sous
 * la cible en MUTANT cosmétiquement une même poignée de structures maîtresses
 * (une pièce spectatrice déplacée d'une case) — un générateur de clones par
 * rotation géométrique, précisément ce qu'on nous a demandé d'éliminer
 * DÉFINITIVEMENT. Ce pipeline dépendait aussi d'un `tsx`/`npx` invoqué en
 * script (`populate:puzzles`) — sur ce poste, l'antivirus (WithSecure) bloque
 * l'exécution de fichiers depuis le dossier temporaire que `npx` utilise
 * (`Erreur 5 : Accès refusé`), rendant CE point d'entrée précis intermittent.
 *
 * Ici : zéro réseau, zéro dossier temporaire, zéro mutation. Chaque entrée est
 * une position RÉELLE et DISTINCTE — soit une ligne d'ouverture théorique
 * authentique rejouée coup par coup (`chess.js`, vérifiée par ce module
 * lui-même à l'exécution, voir son test), soit — pour les 30 thèmes de mats
 * nommés — une SUITE MULTI-PLIS jusqu'au mat (jamais le seul coup final,
 * voir le docstring de `academy-parser.ts#replaySolution` et de
 * `usePuzzleSolver`, `client/features/board/use-puzzle-solver.ts`) : 24
 * positions réellement jouées, importées et sélectionnées parmi les corpus
 * déjà convertis (`data/import/academy/checkmate-patterns-lichess.json` —
 * base officielle Lichess CC0 — et `tactics-checkmate-patterns.json`, voir
 * `scripts/convert-lichess-puzzles-csv.ts`/`scripts/refine-tactics-pgn.ts`),
 * plus 5 positions composées à la main (`cm-mat-de-lolli`, `-du-triangle`,
 * `-roi-et-dame-contre-roi`, `-de-cozio`, `-de-max-lange`) faute d'exemple
 * multi-plis dans ces corpus pour ces motifs plus rares. Dans les deux cas,
 * la position FINALE (après rejeu intégral de `solution`) est RECALCULÉE par
 * `core/chess/mate-patterns.ts` et confrontée au motif que le thème annonce,
 * jamais déclarée — voir le test de ce module. `cm-mat-du-moulin` reste à
 * part (`tactical-signals.ts`, pas un `MatePattern` nommé).
 *
 * Un thème purement stratégique (« La structure Carlsbad », « Le mauvais
 * fou »…) reçoit une position de milieu de partie exacte de cette structure :
 * le coup à trouver n'est pas un mat en 2, c'est le coup ou le plan
 * positionnel correct — la machine de résolution (`core/puzzle/solve-state.ts`)
 * est déjà générique sur ce point, elle n'a jamais imposé qu'une solution
 * soit tactique.
 *
 * ## Le compromis assumé
 *
 * UN exercice par thème, pas quinze à trente : à ce niveau d'exigence
 * (chaque position réelle et vérifiée, aucune rotation pour gonfler un
 * compte), constituer un catalogue de plusieurs milliers de positions
 * distinctes dépasse ce qu'un unique passage peut couvrir. `totalPuzzles`
 * (`populate-puzzles.ts`) reflète ce compte réel — la doctrine « mieux vaut
 * annoncer honnêtement moins » déjà en place avant ce fichier, désormais
 * appliquée à la SOURCE du contenu plutôt qu'à un filtre de sélection.
 * Étendre un thème à plusieurs exercices est une extension future de CE
 * fichier, jamais un retour à la mutation géométrique.
 *
 * ## La vague de puzzles (2026-09-10) — la première extension au pluriel
 *
 * `pm-le-mauvais-fou` est le premier thème à sortir du "UN exercice" : il en
 * porte 8, pas 1 — `themeId` N'EST PLUS unique dans ce tableau pour ce
 * thème, exactement l'extension anticipée ci-dessus. Les 8 sont RÉELS, tirés
 * de la même étude Lichess de NoseKnowsAll « Bishops | Slice through the
 * opposition! » (`https://lichess.org/study/kNn68T8l`, export PGN officiel)
 * qui alimente aussi les 4 premiers chapitres (tutoriel) du cours
 * `COURSE_LESSONS["pm-le-mauvais-fou"]` (`course-lesson.ts`), pour que le
 * tutoriel et la série de puzzles qui suit portent sur la MÊME source — 7
 * des 8 viennent directement des chapitres gamebook "Exercise 1" à
 * "Exercise 8" ; le 3e a dû être remplacé par un autre chapitre réel de la
 * même étude (« Targeting a weakness ») car sa FEN entrait en collision avec
 * un puzzle déjà présent sur `mg-les-fous` (catégorie `middlegame`, alimenté
 * par cette même étude depuis le 2026-09-07) — voir le commentaire sur cette
 * entrée plus bas.
 * `populate-puzzles.ts` gère déjà nativement plusieurs lignes par
 * `themeId` (une par index, `orderIndex` croissant) — voir son docstring.
 * Cahier des charges du 2026-09-10 : une série de "10 à 15 puzzles
 * thématiques" par thème `positional_mastery`, une "vague" à la fois côté
 * HUD (`academy-puzzle-arena.tsx`) — 8 restent le compte réel disponible
 * ici, jamais complétés à 10-15 par une position hors-sujet ou dupliquée.
 * `pm-l-avant-poste-du-cavalier` est le second thème étendu en vague
 * (2026-09-10, cahier des charges « L'avant-poste du Cavalier ») : 8 entrées
 * elles aussi, tirées de l'étude Lichess d'Antoine01 « L'avant-poste du
 * Cavalier - cours Antoine01 » (`https://lichess.org/study/AXtMrSMm`) — voir
 * le commentaire détaillé juste au-dessus de ses 8 entrées plus bas dans ce
 * fichier, et le docstring de `COURSE_LESSONS["pm-l-avant-poste-du-cavalier"]`
 * (`course-lesson.ts`) pour le tutoriel qui partage la même source.
 *
 * Les 28 autres thèmes `positional_mastery` restent à 1 exercice chacun :
 * étendre chacun en vague demande une étude Lichess source par thème, non
 * encore fournie — voir la mémoire de session pour le suivi.
 *
 * ## État au 2026-09-11 (sprint de clôture)
 *
 * Les 10 thèmes `positional_mastery` de niveau `advanced` (« Palier Or »,
 * voir `catalog.ts#levelForIndex`) portent maintenant TOUS une vague
 * (22 vagues au total à ce stade). Puis 4 des 8 thèmes de niveau `beginner`
 * (« Palier Bronze ») encore à 1 seul exercice ont eux aussi reçu une vague
 * (13-15 entrées chacun, voir leurs commentaires plus bas) : ces 4 n'ont
 * demandé AUCUNE nouvelle recherche de source — la partie de maître utilisée
 * est celle déjà citée dans le `COURSE_LESSONS` existant de chaque thème,
 * simplement rejouée plus loin (`chess.js`) pour en extraire davantage de
 * positions de décision réelles. 26 vagues au total désormais ; 4 thèmes
 * `positional_mastery` de niveau `beginner` restent à 1 seul exercice
 * (`pm-la-case-faible-dans-le-camp-adverse`, `pm-le-pion-isole-de-la-dame`,
 * `pm-la-colonne-ouverte`, `pm-la-colonne-semi-ouverte`) — même méthode
 * disponible pour un prochain lot, voir la mémoire de session.
 *
 * ## Cursus Jesper Hall — premier chantier (2026-09-11)
 *
 * `jh-module-1-structures-de-pions-symetriques` est le premier thème du
 * cursus `jesper_hall_course` à sortir du format « 1 ligne théorique
 * générique » : son unique entrée (une ouverture rejouée sans lien avec un
 * module précis) est remplacée par une vague de 15 positions réelles, toutes
 * tirées de la même partie que son tutoriel (`COURSE_LESSONS`, voir
 * `course-lesson.ts`) — Akiba Rubinstein – Georg Salwe, Lodz 1908. Aucun
 * fichier PILOT n'existait pour ce cursus : la partie a été sourcée sur le
 * web puis intégralement rejouée et vérifiée avec chess.js avant rédaction.
 * 23 vagues au total désormais (482 → 496 entrées).
 */

export interface MasterPuzzle {
  /** Identique à `CurriculumThemeSeed.id` (`core/curriculum/catalog.ts`) — une entrée par thème. */
  themeId: string;
  fen: string;
  /** Solution complète en UCI, réponses adverses comprises aux rangs impairs — voir `core/puzzle/solve-state.ts`. */
  solution: readonly string[];
  solutionSan: readonly string[];
  /** Elo affiché — estimé, jamais un Elo de puzzle réel (voir le docstring d'en-tête). */
  rating: number;
  sourceRef: string;
}

export const MASTER_PUZZLES_DATASET: readonly MasterPuzzle[] = [
  {
    themeId: "tm-la-fourchette",
    fen: "r1b1k2r/ppp2pp1/2np1q1p/2b1p3/2B1P3/2NP1N2/PPP2PPP/R2QK2R w KQkq - 0 8",
    solution: ["c3d5","f6d8","d5c7"],
    solutionSan: ["Nd5","Qd8","Nxc7+"],
    rating: 1543,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-le-clouage-absolu",
    fen: "r1bq1rk1/1pp1bppp/p1np1n2/4p3/B3P3/2PP1N2/PP3PPP/RNBQ1RK1 w - - 1 8",
    solution: ["c1g5"],
    solutionSan: ["Bg5"],
    rating: 1499,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-le-clouage-relatif",
    fen: "rnbq1rk1/pppp1pp1/4pn1p/6B1/1bPP4/2N2N2/PP2PPPP/R2QKB1R w KQ - 0 6",
    solution: ["g5h4"],
    solutionSan: ["Bh4"],
    rating: 1460,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-l-enfilade",
    fen: "1q6/8/1k6/8/8/8/8/R5K1 w - - 0 1",
    solution: ["a1b1","b6c6","b1b8"],
    solutionSan: ["Rb1+","Kc6","Rxb8"],
    rating: 1495,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-l-attaque-a-la-decouverte",
    fen: "rn1q1rk1/1p2bppp/p2pbn2/4p3/4P3/1NN1B3/PPP1BPPP/R2Q1RK1 w - - 6 10",
    solution: ["c3d5","e6d5","e4d5"],
    solutionSan: ["Nd5","Bxd5","exd5"],
    rating: 1535,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-l-echec-a-la-decouverte",
    fen: "4kn2/2p5/8/4N3/8/8/8/4R2K w - - 0 1",
    solution: ["e5d7","e8d8","d7f8"],
    solutionSan: ["Nd7+","Kd8","Nxf8"],
    rating: 1510,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-l-echec-double",
    fen: "r1bq1b1r/ppp2kpp/2n5/3np3/2B5/8/PPPP1PPP/RNBQK2R w KQ - 0 7",
    solution: ["d1f3","f7e6","b1c3"],
    solutionSan: ["Qf3+","Ke6","Nc3"],
    rating: 1411,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-la-deviation",
    fen: "rnbq1rk1/p1p2pp1/1p2pb1p/3p4/2PP4/2N1PN2/PP3PPP/R2QKB1R w KQ - 0 9",
    solution: ["c4d5","e6d5","d1b3"],
    solutionSan: ["cxd5","exd5","Qb3"],
    rating: 1541,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-l-attraction",
    fen: "r1bqk1nr/ppp2ppp/2np4/b7/2BpP3/2P2N2/P4PPP/RNBQ1RK1 w kq - 0 8",
    solution: ["d1b3","d8d7","f3g5"],
    solutionSan: ["Qb3","Qd7","Ng5"],
    rating: 1548,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-l-interference",
    fen: "r1bq1rk1/ppp1npbp/3p1np1/3Pp3/2P1P3/2N2N2/PP2BPPP/R1BQ1RK1 w - - 1 9",
    solution: ["f3e1","f6d7","e1d3"],
    solutionSan: ["Ne1","Nd7","Nd3"],
    rating: 1479,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-la-surcharge",
    fen: "r2q1rk1/pp2bppp/3pbn2/4p3/3nP3/1NN1B3/PPPQBPPP/R4RK1 w - - 8 11",
    solution: ["e3d4","e5d4","c3d5"],
    solutionSan: ["Bxd4","exd4","Nd5"],
    rating: 1432,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-l-intermezzo-zwischenzug",
    fen: "rn1qk2r/pp3ppp/2p1pn2/5b2/PbBP4/2N1PN2/1P3PPP/R1BQK2R w KQkq - 1 8",
    solution: ["e1g1","e8g8","d1b3"],
    solutionSan: ["O-O","O-O","Qb3"],
    rating: 1562,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-le-coup-collineen",
    fen: "r1bqkb1r/ppp2ppp/2p5/4Pn2/8/5N2/PPP2PPP/RNBQ1RK1 w kq - 1 8",
    solution: ["d1d8","e8d8","f1d1"],
    solutionSan: ["Qxd8+","Kxd8","Rd1+"],
    rating: 1463,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-l-elimination-du-defenseur",
    fen: "r1bq1rk1/bpp2ppp/p1np1n2/4p3/2B1P3/2PP1N2/PP1N1PPP/R1BQR1K1 w - - 2 9",
    solution: ["d2f1","c6e7","c1g5"],
    solutionSan: ["Nf1","Ne7","Bg5"],
    rating: 1430,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-l-attaque-a-rayons-x",
    fen: "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 3 9",
    solution: ["f1c4","c8d7","e1c1"],
    solutionSan: ["Bc4","Bd7","O-O-O"],
    rating: 1546,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-le-sacrifice-de-degagement",
    fen: "r1bqk2r/ppp2ppp/2n2n2/3p4/2BPP3/5N2/PP1N1PPP/R2QK2R w KQkq - 0 9",
    solution: ["e4d5","f6d5","d1b3"],
    solutionSan: ["exd5","Nxd5","Qb3"],
    rating: 1503,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-le-moulin-tactique",
    fen: "6k1/rr3R1p/8/8/8/8/B7/7K w - - 0 1",
    solution: ["f7b7","g8f8","b7a7"],
    solutionSan: ["Rxb7+","Kf8","Rxa7"],
    rating: 1565,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-la-piece-piegee",
    fen: "r1bq1rk1/2p1bppp/p2p1n2/np2p3/4P3/1BP2N1P/PP1P1PP1/RNBQR1K1 w - - 1 10",
    solution: ["b3c2","c7c5","d2d4"],
    solutionSan: ["Bc2","c5","d4"],
    rating: 1542,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-le-zugzwang-tactique",
    fen: "r1b1kbnr/1pp3pp/p4p2/2p5/4P3/1N6/PPP2PPP/RNBR2K1 b kq - 0 9",
    solution: ["b7b6","c1e3"],
    solutionSan: ["b6","Be3"],
    rating: 1402,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-le-coup-intercalaire",
    fen: "r1bq1rk1/pp1nbppp/5n2/2pp2B1/3P4/2NBPN2/PP3PPP/R2QK2R w KQ - 0 9",
    solution: ["g5f6","d7f6","d4c5"],
    solutionSan: ["Bxf6","Nxf6","dxc5"],
    rating: 1523,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-le-desespoir-desperado",
    fen: "rnb1k2r/1pq1bppp/p2ppn2/6B1/3NPP2/2N2Q2/PPP3PP/R3KB1R w KQkq - 3 9",
    solution: ["e1c1","b8d7","d4e6"],
    solutionSan: ["O-O-O","Nbd7","Nxe6"],
    rating: 1596,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-l-attraction-sur-case-fatale",
    fen: "r1bqkb1r/p4pp1/2p2n1p/n3p1N1/8/8/PPPPBPPP/RNBQK2R w KQkq - 0 9",
    solution: ["g5f3","e5e4","f3e5"],
    solutionSan: ["Nf3","e4","Ne5"],
    rating: 1456,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-le-blocage-tactique",
    fen: "r1bq1rk1/pp3ppp/2n1pn2/2pp4/2PP4/P1bBPN2/1P3PPP/R1BQ1RK1 w - - 0 9",
    solution: ["b2c3","d5c4","d3c4"],
    solutionSan: ["bxc3","dxc4","Bxc4"],
    rating: 1578,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-la-sous-promotion",
    fen: "8/5P1r/6k1/8/8/8/8/K7 w - - 0 1",
    solution: ["f7f8n"],
    solutionSan: ["f8=N+"],
    rating: 1476,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-l-echec-perpetuel",
    fen: "6k1/Q7/8/8/8/8/8/K7 w - - 0 1",
    solution: ["a7f7","g8h8","f7f8","h8h7","f8f7"],
    solutionSan: ["Qf7+","Kh8","Qf8+","Kh7","Qf7+"],
    rating: 1544,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-le-pat-comme-ressource",
    fen: "k7/2P5/2K5/8/8/8/8/8 w - - 0 1",
    solution: ["c6b6"],
    solutionSan: ["Kb6"],
    rating: 1453,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-la-prise-en-passant-tactique",
    fen: "rnbq1rk1/pp2ppbp/1n4p1/3p4/2PP4/1PN1BN2/P4PPP/R2QKB1R w KQ - 0 10",
    solution: ["c4c5","b6c4"],
    solutionSan: ["c5","Nc4"],
    rating: 1537,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-la-batterie-de-pieces",
    fen: "r1bq1rk1/1p1nbppp/p2p1n2/4p3/4P3/1NN5/PPP1BPPP/R1BQ1R1K w - - 6 10",
    solution: ["f2f4","d8c7","d1e1"],
    solutionSan: ["f4","Qc7","Qe1"],
    rating: 1560,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-le-canon-d-alekhine",
    fen: "6k1/5ppp/3p4/8/8/3R4/3R1PPP/3Q2K1 w - - 0 1",
    solution: ["d3d6"],
    solutionSan: ["Rxd6"],
    rating: 1416,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-le-sacrifice-grec",
    fen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 2 8",
    solution: ["d3h7","g8h7","f3g5"],
    solutionSan: ["Bxh7+","Kxh7","Ng5+"],
    rating: 1461,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-le-sacrifice-de-qualite",
    fen: "2rq1rk1/pp1bppbp/3p1np1/8/3BP2P/2N2P2/PPPQ2P1/1K1R1B1R b - - 0 12",
    solution: ["c8c3","b2c3","d8a5"],
    solutionSan: ["Rxc3","bxc3","Qa5"],
    rating: 1507,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-le-sacrifice-positionnel",
    fen: "r1bq1rk1/pp1p1ppp/2n1pn2/2p5/2PP4/2bBPN2/PP3PPP/R1BQ1RK1 w - - 0 8",
    solution: ["b2c3","d7d6","e3e4"],
    solutionSan: ["bxc3","d6","e4"],
    rating: 1584,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-le-sacrifice-de-dame",
    fen: "5r1k/6pp/3N4/8/8/8/Q7/1K6 w - - 0 1",
    solution: ["a2g8","f8g8","d6f7"],
    solutionSan: ["Qg8+","Rxg8","Nf7#"],
    rating: 1405,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-la-liberation-de-case",
    fen: "r1bqk2r/pp2ppbp/2n3p1/2p5/2BPP3/2P5/P3NPPP/R1BQK2R w KQkq - 2 9",
    solution: ["c1e3","e8g8","e1g1"],
    solutionSan: ["Be3","O-O","O-O"],
    rating: 1462,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-l-ouverture-de-colonne",
    fen: "r1bqkb1r/3n1ppp/p1p1pn2/1p6/3P4/2NBPN2/PP3PPP/R1BQK2R w KQkq - 0 9",
    solution: ["e3e4","c6c5","e4e5"],
    solutionSan: ["e4","c5","e5"],
    rating: 1539,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "tm-l-ouverture-de-diagonale",
    fen: "rnbq1rk1/pp2nppp/4p3/2ppP3/3P2Q1/P1P5/2P2PPP/R1B1KBNR w KQ - 3 8",
    solution: ["f1d3","b8c6","g4h5"],
    solutionSan: ["Bd3","Nbc6","Qh5"],
    rating: 1493,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  // Vague de puzzles (2026-09-10, second thème converti après pm-le-mauvais-fou)
  // — remplace l'unique exercice précédent de ce thème. Les 8 positions sont
  // RÉELLES, tirées de l'étude Lichess d'Antoine01 « L'avant-poste du
  // Cavalier - cours Antoine01 » (`https://lichess.org/study/AXtMrSMm`,
  // export PGN officiel `https://lichess.org/api/study/AXtMrSMm.pgn`), qui
  // alimente aussi les 4 premiers chapitres (tutoriel) du cours
  // `COURSE_LESSONS["pm-l-avant-poste-du-cavalier"]` (`course-lesson.ts`).
  // L'étude compte 16 chapitres, mais seuls 4 des 7 chapitres nommés
  // "EXERCICE" ont une ligne PRINCIPALE dont le premier coup est bien celui
  // recommandé par l'annotateur ("!" ou complimenté en clair) — les 3 autres
  // ("CAP SUR L'AP EXERCICE 2/3/4") ont été écartés car leur coup fort est
  // enterré dans une variante RAV, jamais sur la ligne principale (voir le
  // commentaire du docstring de `course-lesson.ts`). Pour atteindre 8
  // positions, 4 chapitres nommés "EXEMPLE" dont la ligne principale porte
  // elle aussi le coup fort ont été promus au rang de puzzle. Comme pour
  // `pm-le-mauvais-fou`, chaque solution suit la LIGNE PRINCIPALE du chapitre
  // gamebook (les variantes RAV entre parenthèses sont les essais écartés par
  // l'auteur) — rejouée et vérifiée coup par coup avec chess.js avant d'être
  // écrite ici. Aucune FEN ne collisionne avec le reste du dataset (voir le
  // test "aucune FEN dupliquée"). `rating` reste une estimation croissante
  // du plus simple (un seul coup à trouver) au plus complexe (mat forcé en 9
  // demi-coups, chapitre "CREATION EXERCICE 1").
  {
    themeId: "pm-l-avant-poste-du-cavalier",
    fen: "2k4r/pppq1p1p/2n5/3p1p2/3PrB2/P1P2QPP/2P2P2/R4RK1 b - - 0 17",
    solution: ["c6a5"],
    solutionSan: ["Na5"],
    rating: 1380,
    sourceRef: "Antoine01 — « L'avant-poste du Cavalier - cours Antoine01 », CAP SUR L'A.P !! EXEMPLE 1 (lichess.org/study/AXtMrSMm).",
  },
  {
    themeId: "pm-l-avant-poste-du-cavalier",
    fen: "2r2b2/1p6/1pp1kp1p/3p2p1/3P4/1P2N2P/P1P1KPP1/R7 w - - 0 1",
    solution: ["g2g4"],
    solutionSan: ["g4"],
    rating: 1420,
    sourceRef: "Antoine01 — « L'avant-poste du Cavalier - cours Antoine01 », AVANT POSTE ==> CREATION EXEMPLE 3 (lichess.org/study/AXtMrSMm).",
  },
  {
    themeId: "pm-l-avant-poste-du-cavalier",
    fen: "1kn2r1r/pbb3q1/3p4/2pPpP1p/2P1P1p1/P1BB2P1/K1Q2RN1/7R w - - 0 1",
    solution: ["g2f4"],
    solutionSan: ["Nf4"],
    rating: 1460,
    sourceRef: "Antoine01 — « L'avant-poste du Cavalier - cours Antoine01 », CAP SUR L'AP !! EXERCICE 1 (lichess.org/study/AXtMrSMm).",
  },
  {
    themeId: "pm-l-avant-poste-du-cavalier",
    fen: "r4r2/4qp1k/2np2p1/1pp1p2p/4P2P/1PPP1PP1/2Q3B1/1R3RK1 b - - 0 1",
    solution: ["b5b4","f3f4","b4c3","c2c3"],
    solutionSan: ["b4","f4","bxc3","Qxc3"],
    rating: 1510,
    sourceRef: "Antoine01 — « L'avant-poste du Cavalier - cours Antoine01 », AVANT POSTE ==> CREATION EXEMPLE 2 (lichess.org/study/AXtMrSMm).",
  },
  {
    themeId: "pm-l-avant-poste-du-cavalier",
    fen: "3q1rk1/p4p1p/1p1pn1p1/3Np3/1P2P2P/P3P1P1/4QP2/2R3K1 w - - 0 1",
    solution: ["c1c8","d8c8","d5e7","g8g7","e7c8","f8c8"],
    solutionSan: ["Rc8","Qxc8","Ne7+","Kg7","Nxc8","Rxc8"],
    rating: 1560,
    sourceRef: "Antoine01 — « L'avant-poste du Cavalier - cours Antoine01 », AVANT POSTE ==> UTILITE TACTIQUE (lichess.org/study/AXtMrSMm).",
  },
  {
    themeId: "pm-l-avant-poste-du-cavalier",
    fen: "1q1rr1k1/1p2pp1p/p2p2p1/2n5/2PQP3/5P2/PP2B1PP/2RR2K1 b - - 0 22",
    solution: ["e7e5","d4e3","c5e6","b2b3","e6d4","e3c3","d4e2"],
    solutionSan: ["e5","Qe3","Ne6","b3","Nd4","Qc3","Nxe2+"],
    rating: 1610,
    sourceRef: "Antoine01 — « L'avant-poste du Cavalier - cours Antoine01 », AVANT POSTE ==> CREATION EXERCICE 2 (lichess.org/study/AXtMrSMm).",
  },
  {
    themeId: "pm-l-avant-poste-du-cavalier",
    fen: "8/p1p2k1p/1p1np3/3p1pp1/3P4/PPP1PPPP/1B6/3K4 b - - 0 1",
    solution: ["g5g4","h3g4","f5g4","d1e2","g4f3","e2f3"],
    solutionSan: ["g4","hxg4","fxg4","Ke2","gxf3+","Kxf3"],
    rating: 1660,
    sourceRef: "Antoine01 — « L'avant-poste du Cavalier - cours Antoine01 », AVANT POSTE ==> CREATION EXERCICE 3 (lichess.org/study/AXtMrSMm).",
  },
  {
    themeId: "pm-l-avant-poste-du-cavalier",
    fen: "8/1p1r1nk1/1R1p2p1/P1pP4/4NPP1/2P2K2/8/8 w - - 0 43",
    solution: ["g4g5","g7f8","e4f6","d7c7","a5a6","b7a6","b6b8","f8e7","b8e8"],
    solutionSan: ["g5","Kf8","Nf6","Rc7","a6","bxa6","Rb8+","Ke7","Re8#"],
    rating: 1750,
    sourceRef: "Antoine01 — « L'avant-poste du Cavalier - cours Antoine01 », AVANT POSTE ==> CREATION EXERCICE 1 (lichess.org/study/AXtMrSMm).",
  },
  {
    themeId: "pm-la-case-faible-dans-le-camp-adverse",
    fen: "r1bqr1k1/pppn1pbp/3p1np1/4p3/3P4/4PN1P/PPP1BPPB/RN1Q1RK1 w - - 2 9",
    solution: ["c2c4","c7c6","b1c3"],
    solutionSan: ["c4","c6","Nc3"],
    rating: 1398,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  // `pm-le-mauvais-fou` : 8 exercices, pas 1 — voir "La vague de puzzles"
  // dans le docstring d'en-tête. Tous les 8 viennent des chapitres gamebook
  // "Exercise 1" à "Exercise 8" de l'étude Lichess de NoseKnowsAll "Bishops |
  // Slice through the opposition!" (https://lichess.org/study/kNn68T8l,
  // export PGN officiel `https://lichess.org/api/study/kNn68T8l.pgn`) : la
  // LIGNE PRINCIPALE de chaque chapitre gamebook (hors variantes RAV
  // entre parenthèses, qui sont les essais erronés commentés par l'auteur)
  // est bien la suite correcte à jouer — rejouée et vérifiée coup par coup
  // avec chess.js avant d'être écrite ici, comme tout le reste de ce
  // fichier. `rating` reste une estimation (aucun Elo Lichess d'origine,
  // ce sont des chapitres d'étude, pas des puzzles de la base officielle).
  {
    themeId: "pm-le-mauvais-fou",
    fen: "rn1qk2r/pbp2ppp/1p2p3/3pP3/1b1P4/2NB1N2/PPPQ1PPP/R3K2R b KQkq - 0 9",
    solution: ["b7a6","d3a6","b8a6","a2a3","b4e7"],
    solutionSan: ["Ba6","Bxa6","Nxa6","a3","Be7"],
    rating: 1450,
    sourceRef: "NoseKnowsAll — « Bishops | Slice through the opposition! », Exercise 1 : Bishop trades I (lichess.org/study/kNn68T8l).",
  },
  {
    themeId: "pm-le-mauvais-fou",
    fen: "r4rk1/2q2ppp/p1n1pn2/2b1pN2/4P3/3B4/PPP3PP/R1BQ1R1K w - - 0 1",
    solution: ["d1e2","a6a5","d3c4"],
    solutionSan: ["Qe2","a5","Bc4"],
    rating: 1500,
    sourceRef: "NoseKnowsAll — « Bishops | Slice through the opposition! », Exercise 2 : Bishop trades II (lichess.org/study/kNn68T8l).",
  },
  {
    // Remplace le chapitre gamebook "Exercise 3" : sa FEN
    // ("r3kbnr/p4ppp/bpn1p3/2p5/4P3/2P2NP1/PP3PBP/RNBK3R w kq - 1 3") entre en
    // collision exacte avec le puzzle DÉJÀ présent de `mg-les-fous`
    // (catégorie `middlegame`, alimenté par la même étude — voir le test
    // "aucune FEN dupliquée"). Repli sur un autre chapitre réel et distinct
    // de la même étude, non repris ailleurs.
    themeId: "pm-le-mauvais-fou",
    fen: "8/1p2rkbp/1R4p1/5p2/2Ppp3/3P2P1/4PPBP/6K1 w - - 0 1",
    solution: ["g3g4","g7e5","g4f5","g6f5","g2h3"],
    solutionSan: ["g4","Be5","gxf5","gxf5","Bh3"],
    rating: 1600,
    sourceRef: "NoseKnowsAll — « Bishops | Slice through the opposition! », « Targeting a weakness », partie Bejtovic–Smith 2011 (lichess.org/study/kNn68T8l).",
  },
  {
    themeId: "pm-le-mauvais-fou",
    fen: "q4rk1/pbr1bppp/1pn1pn2/8/2PP4/P2B1N2/1B1NQPPP/2RR2K1 w - - 0 1",
    solution: ["d4d5","e6d5","c4d5","f6d5","e2e4","d5f6","b2f6","e7f6","e4h7"],
    solutionSan: ["d5","exd5","cxd5","Nxd5","Qe4","Nf6","Bxf6","Bxf6","Qxh7#"],
    rating: 1700,
    sourceRef: "NoseKnowsAll — « Bishops | Slice through the opposition! », Exercise 4 : Bishop activation I (lichess.org/study/kNn68T8l).",
  },
  {
    themeId: "pm-le-mauvais-fou",
    fen: "r2q1rk1/pb1n2pp/1pp1pb2/3p1p2/NPPPn3/5NP1/PBQ1PPBP/R2R2K1 b - - 0 1",
    solution: ["b7a6","c4c5","a6c4","f3d2","e4d2","c2d2","b6b5"],
    solutionSan: ["Ba6","c5","Bc4","Nd2","Nxd2","Qxd2","b5"],
    rating: 1650,
    sourceRef: "NoseKnowsAll — « Bishops | Slice through the opposition! », Exercise 5 : Bishop activation II, Stonewall Dutch (lichess.org/study/kNn68T8l).",
  },
  {
    themeId: "pm-le-mauvais-fou",
    fen: "r1b2rk1/1pq2ppp/p1n1pn2/2p5/3P4/P1P1PN2/4BPPP/R1BQ1RK1 b - - 0 1",
    solution: ["f8d8","d1c2","e6e5","c1b2","c8g4"],
    solutionSan: ["Rd8","Qc2","e5","Bb2","Bg4"],
    rating: 1650,
    sourceRef: "NoseKnowsAll — « Bishops | Slice through the opposition! », Exercise 6 : Bishop activation III, Nimzo-Indienne (lichess.org/study/kNn68T8l).",
  },
  {
    themeId: "pm-le-mauvais-fou",
    fen: "r2q1r1k/pppnn3/3p3b/3Pp3/4Pp2/2N4P/PPPQBBP1/3R1RK1 w - - 0 18",
    solution: ["e2g4","d7f6","g4e6"],
    solutionSan: ["Bg4","Nf6","Be6"],
    rating: 1750,
    sourceRef: "NoseKnowsAll — « Bishops | Slice through the opposition! », Exercise 7 : Bishop activation IV, partie Karpov–Keene 1977 (lichess.org/study/kNn68T8l).",
  },
  {
    themeId: "pm-le-mauvais-fou",
    fen: "1r3rk1/3qbppp/p1npbn2/1p2p3/4P3/P1NBN3/1PP2PPP/R2QBR1K b - - 0 1",
    solution: ["e7d8","d1e2","d8b6"],
    solutionSan: ["Bd8","Qe2","Bb6"],
    rating: 1600,
    sourceRef: "NoseKnowsAll — « Bishops | Slice through the opposition! », Exercise 8 : Bishop activation V, Sicilienne Kalachnikov (lichess.org/study/kNn68T8l).",
  },
  // Vague de 13 puzzles (2026-09-11, sprint de clôture) — Anatoly Karpov –
  // Wolfgang Unzicker, Olympiade de Nice, ronde 4, 18 juin 1974 (partie
  // surnommée « Squeeze Play », https://www.chessgames.com/perl/chessgame?gid=1067846,
  // même fichier PILOT réel que celui qui alimente déjà `COURSE_LESSONS`
  // pour ce thème sur d'autres parties). Karpov ferme méthodiquement l'aile
  // roi (31.f5 g5) jusqu'à ce que le Fou noir n'ait plus une seule case où
  // s'exprimer, puis l'échange (35.Bh5!, 41.Bxf7+) pour ne garder que ses
  // deux Cavaliers pleinement fonctionnels — la démonstration manuelle
  // (mécanique, `chess.js`, aucune position inventée) du thème.
  {
    themeId: "pm-cavalier-contre-fou-qui-domine",
    fen: "r1b2rk1/2q1bppp/p1np1n2/1pp1p3/3PP3/2P2N1P/PPBN1PP1/R1BQR1K1 w - - 3 13",
    solution: ["d4d5"],
    solutionSan: ["d5"],
    rating: 1320,
    sourceRef: "Anatoly Karpov – Wolfgang Unzicker, Olympiade de Nice, ronde 4, 18 juin 1974 (« Squeeze Play »)",
  },
  {
    themeId: "pm-cavalier-contre-fou-qui-domine",
    fen: "1rbn1rk1/2q1bppp/3p1n2/1ppPp3/4P3/2P2N1P/1PBN1PP1/R1BQR1K1 w - - 0 16",
    solution: ["b2b4"],
    solutionSan: ["b4"],
    rating: 1360,
    sourceRef: "Anatoly Karpov – Wolfgang Unzicker, Olympiade de Nice, ronde 4, 18 juin 1974 (« Squeeze Play »)",
  },
  {
    themeId: "pm-cavalier-contre-fou-qui-domine",
    fen: "1rb2rk1/1nq1bppp/3p1n2/1ppPp3/1P2P3/2P2N1P/2BN1PP1/R1BQR1K1 w - - 1 17",
    solution: ["d2f1"],
    solutionSan: ["Nf1"],
    rating: 1400,
    sourceRef: "Anatoly Karpov – Wolfgang Unzicker, Olympiade de Nice, ronde 4, 18 juin 1974 (« Squeeze Play »)",
  },
  {
    themeId: "pm-cavalier-contre-fou-qui-domine",
    fen: "r4rk1/1nqbbppp/3p1n2/1ppPp3/1P2P3/2P1BN1P/2B2PP1/R2QRNK1 w - - 5 19",
    solution: ["d1d2"],
    solutionSan: ["Qd2"],
    rating: 1440,
    sourceRef: "Anatoly Karpov – Wolfgang Unzicker, Olympiade de Nice, ronde 4, 18 juin 1974 (« Squeeze Play »)",
  },
  {
    themeId: "pm-cavalier-contre-fou-qui-domine",
    fen: "r1r3k1/1nqbbp1p/3p1np1/1ppPp3/1P2P3/2PBBN1P/3Q1PP1/R3RNK1 w - - 0 21",
    solution: ["f1g3"],
    solutionSan: ["Ng3"],
    rating: 1480,
    sourceRef: "Anatoly Karpov – Wolfgang Unzicker, Olympiade de Nice, ronde 4, 18 juin 1974 (« Squeeze Play »)",
  },
  {
    themeId: "pm-cavalier-contre-fou-qui-domine",
    fen: "r1r2bk1/1nqb1p1p/3p1np1/1ppPp3/1P2P3/2PBBNNP/3Q1PP1/R3R1K1 w - - 2 22",
    solution: ["a1a2"],
    solutionSan: ["Ra2"],
    rating: 1520,
    sourceRef: "Anatoly Karpov – Wolfgang Unzicker, Olympiade de Nice, ronde 4, 18 juin 1974 (« Squeeze Play »)",
  },
  {
    themeId: "pm-cavalier-contre-fou-qui-domine",
    fen: "r1rq1bk1/Bnnb1p1p/3p2p1/1p1Pp3/1Pp1P3/2P2NNP/R1BQ1PP1/4R1K1 w - - 6 26",
    solution: ["e1a1"],
    solutionSan: ["Rea1"],
    rating: 1560,
    sourceRef: "Anatoly Karpov – Wolfgang Unzicker, Olympiade de Nice, ronde 4, 18 juin 1974 (« Squeeze Play »)",
  },
  {
    themeId: "pm-cavalier-contre-fou-qui-domine",
    fen: "r1r1bbk1/Bnn1qp1p/3p2p1/1p1Pp3/1Pp1P3/2P2NNP/R2Q1PP1/RB4K1 w - - 10 28",
    solution: ["g3e2"],
    solutionSan: ["Ne2"],
    rating: 1600,
    sourceRef: "Anatoly Karpov – Wolfgang Unzicker, Olympiade de Nice, ronde 4, 18 juin 1974 (« Squeeze Play »)",
  },
  {
    themeId: "pm-cavalier-contre-fou-qui-domine",
    fen: "r1rnbbk1/B1n1qp1p/3p2p1/1p1Pp3/1Pp1P3/2P2N1P/R2QNPP1/RB4K1 w - - 12 29",
    solution: ["f3h2"],
    solutionSan: ["Nh2"],
    rating: 1640,
    sourceRef: "Anatoly Karpov – Wolfgang Unzicker, Olympiade de Nice, ronde 4, 18 juin 1974 (« Squeeze Play »)",
  },
  {
    themeId: "pm-cavalier-contre-fou-qui-domine",
    fen: "r1rnb1k1/B1n1qpbp/3p2p1/1p1Pp3/1Pp1P3/2P4P/R2QNPPN/RB4K1 w - - 14 30",
    solution: ["f2f4"],
    solutionSan: ["f4"],
    rating: 1680,
    sourceRef: "Anatoly Karpov – Wolfgang Unzicker, Olympiade de Nice, ronde 4, 18 juin 1974 (« Squeeze Play »)",
  },
  {
    themeId: "pm-cavalier-contre-fou-qui-domine",
    fen: "r1rnb1k1/B1n1q1bp/3p1pp1/1p1Pp3/1Pp1PP2/2P4P/R2QN1PN/RB4K1 w - - 0 31",
    solution: ["f4f5"],
    solutionSan: ["f5"],
    rating: 1720,
    sourceRef: "Anatoly Karpov – Wolfgang Unzicker, Olympiade de Nice, ronde 4, 18 juin 1974 (« Squeeze Play »)",
  },
  {
    themeId: "pm-cavalier-contre-fou-qui-domine",
    fen: "r1r3k1/Bnn1qbb1/3p1p1p/1p1PpPp1/1Pp1P3/2P3NP/R2Q2PN/R2B2K1 w - - 0 35",
    solution: ["d1h5"],
    solutionSan: ["Bh5"],
    rating: 1760,
    sourceRef: "Anatoly Karpov – Wolfgang Unzicker, Olympiade de Nice, ronde 4, 18 juin 1974 (« Squeeze Play »)",
  },
  {
    themeId: "pm-cavalier-contre-fou-qui-domine",
    fen: "r1rnq1k1/B1n2bb1/3p1p1p/1p1PpPpB/1Pp1P3/R1P1N1NP/R5P1/3Q2K1 w - - 12 41",
    solution: ["h5f7"],
    solutionSan: ["Bxf7+"],
    rating: 1800,
    sourceRef: "Anatoly Karpov – Wolfgang Unzicker, Olympiade de Nice, ronde 4, 18 juin 1974 (« Squeeze Play »)",
  },
  {
    themeId: "pm-le-pion-isole-de-la-dame",
    fen: "r1bq1rk1/pp3ppp/2n2n2/2bp4/8/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 10",
    solution: ["c1g5","d5d4","c3a4"],
    solutionSan: ["Bg5","d4","Na4"],
    rating: 1333,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  // Vague de 15 puzzles (2026-09-11, sprint de clôture) — Tigran Petrosian –
  // Efim Geller, Amsterdam Candidates, ronde 10, 14 avril 1956 (ECO D34,
  // 145 demi-coups, source : archive pgnmentor.com/players/Petrosian.zip,
  // même partie que celle déjà citée dans `COURSE_LESSONS` pour ce thème —
  // 4 des FEN ci-dessous sont d'ailleurs identiques aux étapes déjà
  // vérifiées du cours). Les pions pendants noirs c6/d5 naissent après
  // 11...bxc6, puis Petrosian les bloque, les grignote (91.Nxc6) et pousse
  // son pion a jusqu'à la 7e rangée avant que la partie ne se solde par la
  // nulle (résultat réel « 1/2-1/2 » — la partie ne s'est PAS terminée par
  // un abandon noir, contrairement à une note antérieure de ce fichier).
  {
    themeId: "pm-les-pions-pendants",
    fen: "r1b2rk1/p3bppp/1qp2n2/3p4/5B2/2N3P1/PP2PPBP/R2Q1RK1 w - - 0 12",
    solution: ["d1c2"],
    solutionSan: ["Qc2"],
    rating: 1300,
    sourceRef: "Tigran Petrosian – Efim Geller, Amsterdam Candidates, ronde 10, 14 avril 1956",
  },
  {
    themeId: "pm-les-pions-pendants",
    fen: "r4rk1/p2nbppp/2p1b3/3p4/N7/4B1P1/PP2PPBP/R4RK1 w - - 1 16",
    solution: ["f1d1"],
    solutionSan: ["Rfd1"],
    rating: 1335,
    sourceRef: "Tigran Petrosian – Efim Geller, Amsterdam Candidates, ronde 10, 14 avril 1956",
  },
  {
    themeId: "pm-les-pions-pendants",
    fen: "r1r3k1/p2n1ppp/2p5/3p4/N2B2b1/bP4P1/P3PPBP/R2R2K1 w - - 3 19",
    solution: ["d1d2"],
    solutionSan: ["Rd2"],
    rating: 1370,
    sourceRef: "Tigran Petrosian – Efim Geller, Amsterdam Candidates, ronde 10, 14 avril 1956",
  },
  {
    themeId: "pm-les-pions-pendants",
    fen: "r3r1k1/p2n1ppp/2p5/3p1b2/N2B4/bP2P1P1/P2R1PBP/R5K1 w - - 1 21",
    solution: ["d4b2"],
    solutionSan: ["Bb2"],
    rating: 1405,
    sourceRef: "Tigran Petrosian – Efim Geller, Amsterdam Candidates, ronde 10, 14 avril 1956",
  },
  {
    themeId: "pm-les-pions-pendants",
    fen: "r3r1k1/p4ppp/1np5/3p1b2/N7/1P2P1P1/PR3PBP/R5K1 w - - 1 23",
    solution: ["a4c5"],
    solutionSan: ["Nc5"],
    rating: 1440,
    sourceRef: "Tigran Petrosian – Efim Geller, Amsterdam Candidates, ronde 10, 14 avril 1956",
  },
  {
    themeId: "pm-les-pions-pendants",
    fen: "r1r3k1/5ppp/1np5/p1Np1b2/8/1P2P1P1/PR3PBP/2R3K1 w - - 2 25",
    solution: ["e3e4"],
    solutionSan: ["e4"],
    rating: 1475,
    sourceRef: "Tigran Petrosian – Efim Geller, Amsterdam Candidates, ronde 10, 14 avril 1956",
  },
  {
    themeId: "pm-les-pions-pendants",
    fen: "rr4k1/6pp/1np2pb1/p1Np4/4PP2/1P4PB/PR5P/2R3K1 w - - 2 28",
    solution: ["e4e5"],
    solutionSan: ["e5"],
    rating: 1510,
    sourceRef: "Tigran Petrosian – Efim Geller, Amsterdam Candidates, ronde 10, 14 avril 1956",
  },
  {
    themeId: "pm-les-pions-pendants",
    fen: "rr4k1/6pp/2p3b1/2NpP3/P1n5/6PB/PR5P/2R3K1 w - - 1 31",
    solution: ["b2b8"],
    solutionSan: ["Rxb8+"],
    rating: 1545,
    sourceRef: "Tigran Petrosian – Efim Geller, Amsterdam Candidates, ronde 10, 14 avril 1956",
  },
  {
    themeId: "pm-les-pions-pendants",
    fen: "6k1/6pp/2p1P3/2Np4/P1n5/6PB/P6P/1b4K1 w - - 0 34",
    solution: ["h3f1"],
    solutionSan: ["Bf1"],
    rating: 1580,
    sourceRef: "Tigran Petrosian – Efim Geller, Amsterdam Candidates, ronde 10, 14 avril 1956",
  },
  {
    themeId: "pm-les-pions-pendants",
    fen: "2n2k2/6pp/2p1P3/P1Np4/8/P5P1/7P/1b3BK1 w - - 1 37",
    solution: ["g1f2"],
    solutionSan: ["Kf2"],
    rating: 1615,
    sourceRef: "Tigran Petrosian – Efim Geller, Amsterdam Candidates, ronde 10, 14 avril 1956",
  },
  {
    themeId: "pm-les-pions-pendants",
    fen: "8/n5pp/2pkP3/P1Np1b2/3K4/P5P1/4B2P/8 w - - 9 41",
    solution: ["a5a6"],
    solutionSan: ["a6"],
    rating: 1650,
    sourceRef: "Tigran Petrosian – Efim Geller, Amsterdam Candidates, ronde 10, 14 avril 1956",
  },
  {
    themeId: "pm-les-pions-pendants",
    fen: "2n5/2k3pp/P1p5/N1Kp4/P7/6Pb/4B2P/8 w - - 4 46",
    solution: ["a5c6"],
    solutionSan: ["Nxc6"],
    rating: 1685,
    sourceRef: "Tigran Petrosian – Efim Geller, Amsterdam Candidates, ronde 10, 14 avril 1956",
  },
  {
    themeId: "pm-les-pions-pendants",
    fen: "8/3n2pp/P1k1K3/8/P7/6P1/7P/8 w - - 0 51",
    solution: ["a6a7"],
    solutionSan: ["a7"],
    rating: 1720,
    sourceRef: "Tigran Petrosian – Efim Geller, Amsterdam Candidates, ronde 10, 14 avril 1956",
  },
  {
    themeId: "pm-les-pions-pendants",
    fen: "n7/Pk5p/8/P5K1/6p1/6P1/7P/8 w - - 2 56",
    solution: ["g5g4"],
    solutionSan: ["Kxg4"],
    rating: 1755,
    sourceRef: "Tigran Petrosian – Efim Geller, Amsterdam Candidates, ronde 10, 14 avril 1956",
  },
  {
    themeId: "pm-les-pions-pendants",
    fen: "8/4n2p/k7/P5PP/6K1/8/8/8 w - - 1 71",
    solution: ["g4f4"],
    solutionSan: ["Kf4"],
    rating: 1790,
    sourceRef: "Tigran Petrosian – Efim Geller, Amsterdam Candidates, ronde 10, 14 avril 1956",
  },

  // Vague de 13 puzzles (2026-09-11, sprint de clôture) — Emanuel Lasker –
  // Jose Raul Capablanca, tournoi final de Saint-Petersbourg, 27 avril 1914
  // (le tout premier coup, 4.Bxc6!, est LA partie fondatrice du thème) —
  // même fichier PILOT réel que celui qui alimente déjà `COURSE_LESSONS`
  // pour ce thème sur cette partie précise (3 FEN ci-dessous, coups 15/35/42,
  // identiques aux étapes déjà vérifiées du cours).
  {
    themeId: "pm-doubler-les-pions-adverses",
    fen: "r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
    solution: ["b5c6"],
    solutionSan: ["Bxc6"],
    rating: 1310,
    sourceRef: "Emanuel Lasker – Jose Raul Capablanca, Tournoi final, Saint-Petersbourg, 27 avril 1914",
  },
  {
    themeId: "pm-doubler-les-pions-adverses",
    fen: "r1b1kbnr/1pp2ppp/p1p5/8/3qP3/5N2/PPP2PPP/RNB1K2R w KQkq - 0 7",
    solution: ["f3d4"],
    solutionSan: ["Nxd4"],
    rating: 1345,
    sourceRef: "Emanuel Lasker – Jose Raul Capablanca, Tournoi final, Saint-Petersbourg, 27 avril 1914",
  },
  {
    themeId: "pm-doubler-les-pions-adverses",
    fen: "r1b2rk1/1pp1nppp/p1pb4/8/3NP3/2N5/PPP2PPP/R1B2RK1 w - - 5 10",
    solution: ["f2f4"],
    solutionSan: ["f4"],
    rating: 1380,
    sourceRef: "Emanuel Lasker – Jose Raul Capablanca, Tournoi final, Saint-Petersbourg, 27 avril 1914",
  },
  {
    themeId: "pm-doubler-les-pions-adverses",
    fen: "r1b1r1k1/1pp1n1pp/p1pb1p2/8/4PP2/1NN5/PPP3PP/R1B2RK1 w - - 0 12",
    solution: ["f4f5"],
    solutionSan: ["f5"],
    rating: 1415,
    sourceRef: "Emanuel Lasker – Jose Raul Capablanca, Tournoi final, Saint-Petersbourg, 27 avril 1914",
  },
  {
    themeId: "pm-doubler-les-pions-adverses",
    fen: "r3r1k1/1b2n1pp/pppp1p2/5P2/4P3/1NN5/PPP3PP/R4RK1 w - - 0 15",
    solution: ["b3d4"],
    solutionSan: ["Nd4"],
    rating: 1450,
    sourceRef: "Emanuel Lasker – Jose Raul Capablanca, Tournoi final, Saint-Petersbourg, 27 avril 1914",
  },
  {
    themeId: "pm-doubler-les-pions-adverses",
    fen: "3rr1k1/1b2n1pp/pppp1p2/5P2/3NP3/2N5/PPP3PP/R4RK1 w - - 2 16",
    solution: ["d4e6"],
    solutionSan: ["Ne6"],
    rating: 1485,
    sourceRef: "Emanuel Lasker – Jose Raul Capablanca, Tournoi final, Saint-Petersbourg, 27 avril 1914",
  },
  {
    themeId: "pm-doubler-les-pions-adverses",
    fen: "2n1r1k1/1b1r2pp/p1ppNp2/1p3P2/4P3/2N5/PPP2RPP/3R2K1 w - - 0 19",
    solution: ["f2d2"],
    solutionSan: ["Rfd2"],
    rating: 1520,
    sourceRef: "Emanuel Lasker – Jose Raul Capablanca, Tournoi final, Saint-Petersbourg, 27 avril 1914",
  },
  {
    themeId: "pm-doubler-les-pions-adverses",
    fen: "b1n1r3/4rkpp/p1ppNp2/1p3P2/1P2P3/P1N5/2PR2PP/3R2K1 w - - 1 22",
    solution: ["g1f2"],
    solutionSan: ["Kf2"],
    rating: 1555,
    sourceRef: "Emanuel Lasker – Jose Raul Capablanca, Tournoi final, Saint-Petersbourg, 27 avril 1914",
  },
  {
    themeId: "pm-doubler-les-pions-adverses",
    fen: "b1n1r3/r4kp1/2ppNp1p/pp3P2/1P2P1P1/P1NR4/2P2K1P/3R4 w - - 0 25",
    solution: ["h2h4"],
    solutionSan: ["h4"],
    rating: 1590,
    sourceRef: "Emanuel Lasker – Jose Raul Capablanca, Tournoi final, Saint-Petersbourg, 27 avril 1914",
  },
  {
    themeId: "pm-doubler-les-pions-adverses",
    fen: "b1n3r1/4rk2/2ppNppp/1p3P2/1P2PKPP/2NR4/2P5/3R4 w - - 0 29",
    solution: ["d3g3"],
    solutionSan: ["Rg3"],
    rating: 1625,
    sourceRef: "Emanuel Lasker – Jose Raul Capablanca, Tournoi final, Saint-Petersbourg, 27 avril 1914",
  },
  {
    themeId: "pm-doubler-les-pions-adverses",
    fen: "b5r1/3r1k2/1nppNp2/1p3Pp1/1P2P1P1/2N2K1R/2P5/3R4 w - - 2 33",
    solution: ["f3g3"],
    solutionSan: ["Kg3"],
    rating: 1660,
    sourceRef: "Emanuel Lasker – Jose Raul Capablanca, Tournoi final, Saint-Petersbourg, 27 avril 1914",
  },
  {
    themeId: "pm-doubler-les-pions-adverses",
    fen: "4k1r1/1b1r4/1np1Np2/1p2pPp1/1P4P1/2N3KR/2P5/7R w - - 0 36",
    solution: ["c3e4"],
    solutionSan: ["Ne4"],
    rating: 1695,
    sourceRef: "Emanuel Lasker – Jose Raul Capablanca, Tournoi final, Saint-Petersbourg, 27 avril 1914",
  },
  {
    themeId: "pm-doubler-les-pions-adverses",
    fen: "4k1r1/3b4/2p2p2/1p1npPp1/1P2N1P1/6KR/2P5/7R w - - 0 39",
    solution: ["h3h7"],
    solutionSan: ["Rh7"],
    rating: 1730,
    sourceRef: "Emanuel Lasker – Jose Raul Capablanca, Tournoi final, Saint-Petersbourg, 27 avril 1914",
  },

  // Vague de 14 puzzles (2026-09-11, sprint de clôture) — Levon Aronian –
  // Viswanathan Anand, Morelia-Linares, ronde 5, 22 février 2007 (« Levon
  // For Good », source : archive pgnmentor.com/players/Aronian.zip) — même
  // partie que celle déjà citée dans `COURSE_LESSONS` pour ce thème (les 4
  // FEN des coups 19/31/37/44 y sont déjà vérifiées). Le pion d devient
  // passé ET protégé dès 19.d5 (soutenu par le pion e4), un second pion
  // passé (le pion a) le rejoint à partir du coup 37, et les deux
  // s'avancent de concert jusqu'à la promotion (44.a8=Q!).
  {
    themeId: "pm-le-pion-passe-protege",
    fen: "r4rk1/pp1n1ppp/1qp1pnb1/8/3PP2P/1QN5/PP3PBP/R1B1R1K1 w - - 1 15",
    solution: ["b3b6"],
    solutionSan: ["Qxb6"],
    rating: 1360,
    sourceRef: "Levon Aronian – Viswanathan Anand, Morelia-Linares, ronde 5, 22 fevrier 2007 (« Levon For Good »)",
  },
  {
    themeId: "pm-le-pion-passe-protege",
    fen: "r3r1k1/1p1n1ppp/1pp1pnb1/8/3PPB1P/2N5/PP3PBP/R3R1K1 w - - 2 17",
    solution: ["a1d1"],
    solutionSan: ["Rad1"],
    rating: 1395,
    sourceRef: "Levon Aronian – Viswanathan Anand, Morelia-Linares, ronde 5, 22 fevrier 2007 (« Levon For Good »)",
  },
  {
    themeId: "pm-le-pion-passe-protege",
    fen: "r3r1k1/1p1n1ppp/2p1pnb1/1p6/3PPB1P/2N5/PP3PBP/3RR1K1 w - - 0 18",
    solution: ["f4d6"],
    solutionSan: ["Bd6"],
    rating: 1430,
    sourceRef: "Levon Aronian – Viswanathan Anand, Morelia-Linares, ronde 5, 22 fevrier 2007 (« Levon For Good »)",
  },
  {
    themeId: "pm-le-pion-passe-protege",
    fen: "r3r1k1/1p1n1ppp/2pB1nb1/1p2p3/3PP2P/2N5/PP3PBP/3RR1K1 w - - 0 19",
    solution: ["d4d5"],
    solutionSan: ["d5"],
    rating: 1465,
    sourceRef: "Levon Aronian – Viswanathan Anand, Morelia-Linares, ronde 5, 22 fevrier 2007 (« Levon For Good »)",
  },
  {
    themeId: "pm-le-pion-passe-protege",
    fen: "r3r1k1/1p1n2pp/2pB1pb1/3Pp3/p3Pn1P/1PN5/5P1P/3RRBK1 w - - 0 23",
    solution: ["b3a4"],
    solutionSan: ["bxa4"],
    rating: 1500,
    sourceRef: "Levon Aronian – Viswanathan Anand, Morelia-Linares, ronde 5, 22 fevrier 2007 (« Levon For Good »)",
  },
  {
    themeId: "pm-le-pion-passe-protege",
    fen: "2r3k1/rp1n1bpp/2pB1p2/3Pp3/P3Pn1P/2N5/5P1P/1R1R1BK1 w - - 5 26",
    solution: ["c3e2"],
    solutionSan: ["Ne2"],
    rating: 1535,
    sourceRef: "Levon Aronian – Viswanathan Anand, Morelia-Linares, ronde 5, 22 fevrier 2007 (« Levon For Good »)",
  },
  {
    themeId: "pm-le-pion-passe-protege",
    fen: "2r2nk1/rp3bpp/3B1p2/3Pp3/P6P/8/4BP1P/1R1R2K1 w - - 1 29",
    solution: ["e2b5"],
    solutionSan: ["Bb5"],
    rating: 1570,
    sourceRef: "Levon Aronian – Viswanathan Anand, Morelia-Linares, ronde 5, 22 fevrier 2007 (« Levon For Good »)",
  },
  {
    themeId: "pm-le-pion-passe-protege",
    fen: "r1r3k1/1p2Bbpp/5pn1/1B1Pp3/P6P/8/5P1P/1R1R2K1 w - - 5 31",
    solution: ["d5d6"],
    solutionSan: ["d6"],
    rating: 1605,
    sourceRef: "Levon Aronian – Viswanathan Anand, Morelia-Linares, ronde 5, 22 fevrier 2007 (« Levon For Good »)",
  },
  {
    themeId: "pm-le-pion-passe-protege",
    fen: "r1r3k1/1p1B1bpp/2nP1p2/4p3/P6P/8/5P1P/1R1R2K1 w - - 2 33",
    solution: ["b1b7"],
    solutionSan: ["Rxb7"],
    rating: 1640,
    sourceRef: "Levon Aronian – Viswanathan Anand, Morelia-Linares, ronde 5, 22 fevrier 2007 (« Levon For Good »)",
  },
  {
    themeId: "pm-le-pion-passe-protege",
    fen: "1R2brk1/6pp/3P1p2/4p3/P2n3P/8/5P1P/1R4K1 w - - 4 37",
    solution: ["a4a5"],
    solutionSan: ["a5"],
    rating: 1675,
    sourceRef: "Levon Aronian – Viswanathan Anand, Morelia-Linares, ronde 5, 22 fevrier 2007 (« Levon For Good »)",
  },
  {
    themeId: "pm-le-pion-passe-protege",
    fen: "1R2brk1/6pp/3P1p2/P3p3/7P/8/5P1P/1n2K3 w - - 0 40",
    solution: ["a5a6"],
    solutionSan: ["a6"],
    rating: 1710,
    sourceRef: "Levon Aronian – Viswanathan Anand, Morelia-Linares, ronde 5, 22 fevrier 2007 (« Levon For Good »)",
  },
  {
    themeId: "pm-le-pion-passe-protege",
    fen: "1R3rk1/6pp/P1bP1p2/4p3/7P/8/5P1P/1n2K3 w - - 1 41",
    solution: ["a6a7"],
    solutionSan: ["a7"],
    rating: 1745,
    sourceRef: "Levon Aronian – Viswanathan Anand, Morelia-Linares, ronde 5, 22 fevrier 2007 (« Levon For Good »)",
  },
  {
    themeId: "pm-le-pion-passe-protege",
    fen: "5R2/P2k2pp/2b2p2/4p3/7P/8/5P1P/1n2K3 w - - 0 44",
    solution: ["a7a8q"],
    solutionSan: ["a8=Q"],
    rating: 1780,
    sourceRef: "Levon Aronian – Viswanathan Anand, Morelia-Linares, ronde 5, 22 fevrier 2007 (« Levon For Good »)",
  },
  {
    themeId: "pm-le-pion-passe-protege",
    fen: "R7/3k2p1/5p2/4p2p/7P/8/5P1P/1n2K3 w - - 0 46",
    solution: ["a8a7"],
    solutionSan: ["Ra7+"],
    rating: 1815,
    sourceRef: "Levon Aronian – Viswanathan Anand, Morelia-Linares, ronde 5, 22 fevrier 2007 (« Levon For Good »)",
  },
  {
    themeId: "pm-la-colonne-ouverte",
    fen: "r2q1rk1/pp1n1ppp/2p1pn2/5b2/PbBP4/2N1PN2/1P2QPPP/R1B2RK1 w - - 5 10",
    solution: ["f1d1","d8e7","e3e4"],
    solutionSan: ["Rd1","Qe7","e4"],
    rating: 1483,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "pm-la-colonne-semi-ouverte",
    fen: "r1bq1rk1/1p2bppp/p1np1n2/4p3/4P3/1NN5/PPP1BPPP/R1BQ1R1K w - - 6 10",
    solution: ["f2f4","e5f4","f1f4"],
    solutionSan: ["f4","exf4","Rxf4"],
    rating: 1410,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  // `pm-la-tour-a-la-7e-rangee` : 15 exercices (2026-09-10, plusieurs sources).
  // 15 tirés de la MÊME partie réelle que le tutoriel
  // (`COURSE_LESSONS["pm-la-tour-a-la-7e-rangee"]`, Capablanca–Tartakower,
  // New York 1924, citée par Chernev sous le titre « Rook on the 7th rank,
  // King to the 6th », The Most Instructive Games of Chess Ever Played n°1 —
  // `data/import/academy/PILOT_pm-la-tour-a-la-7e-rangee.pgn`) : chaque
  // position est un point de décision réel de cette finale de tours, rejoué
  // et vérifié coup par coup avec chess.js.
  {
    themeId: "pm-la-tour-a-la-7e-rangee",
    fen: "4k3/p1p5/1p3rp1/n2p4/P2P1P2/2PB2P1/6K1/R7 w - - 0 29",
    solution: ["a1h1"],
    solutionSan: ["Rh1"],
    rating: 1420,
    sourceRef: "Capablanca–Tartakower, New York 1924 (PILOT_pm-la-tour-a-la-7e-rangee.pgn) : la Tour rejoint la colonne ouverte avant de saisir la 7e rangée.",
  },
  {
    themeId: "pm-la-tour-a-la-7e-rangee",
    fen: "5k2/p1p5/1p3rp1/n2p4/P2P1P2/2PB2P1/6K1/7R w - - 2 30",
    solution: ["h1h7"],
    solutionSan: ["Rh7"],
    rating: 1440,
    sourceRef: "Capablanca–Tartakower, New York 1924 (PILOT_pm-la-tour-a-la-7e-rangee.pgn) : le coup magique des finales de tours — la 7e rangée.",
  },
  {
    themeId: "pm-la-tour-a-la-7e-rangee",
    fen: "5k2/p1p4R/1pr3p1/3p1nP1/P2P1P2/2PB1K2/8/8 w - - 3 34",
    solution: ["d3f5"],
    solutionSan: ["Bxf5"],
    rating: 1455,
    sourceRef: "Capablanca–Tartakower, New York 1924 (PILOT_pm-la-tour-a-la-7e-rangee.pgn) : simplifier pendant que la Tour tient déjà la 7e rangée.",
  },
  {
    themeId: "pm-la-tour-a-la-7e-rangee",
    fen: "5k2/p1p4R/1pr5/3p1pP1/P2P1P2/2P2K2/8/8 w - - 0 35",
    solution: ["f3g3"],
    solutionSan: ["Kg3"],
    rating: 1465,
    sourceRef: "Capablanca–Tartakower, New York 1924 (PILOT_pm-la-tour-a-la-7e-rangee.pgn) : « Tour à la 7e, Roi à la 6e » — le Roi blanc part escorter son pion passé.",
  },
  {
    themeId: "pm-la-tour-a-la-7e-rangee",
    fen: "5k2/p1p4R/1pr5/3p1pP1/P2P1P2/2P3K1/8/8 b - - 1 35",
    solution: ["c6c3"],
    solutionSan: ["Rxc3+"],
    rating: 1475,
    sourceRef: "Capablanca–Tartakower, New York 1924 (PILOT_pm-la-tour-a-la-7e-rangee.pgn).",
  },
  {
    themeId: "pm-la-tour-a-la-7e-rangee",
    fen: "5k2/p1p4R/1p4P1/3p1p2/P2P1P1K/5r2/8/8 b - - 0 37",
    solution: ["f3f4"],
    solutionSan: ["Rxf4+"],
    rating: 1485,
    sourceRef: "Capablanca–Tartakower, New York 1924 (PILOT_pm-la-tour-a-la-7e-rangee.pgn).",
  },
  {
    themeId: "pm-la-tour-a-la-7e-rangee",
    fen: "4r2k/p1R5/1p3KP1/3p1p2/P2P4/8/8/8 w - - 1 42",
    solution: ["f6f5"],
    solutionSan: ["Kxf5"],
    rating: 1495,
    sourceRef: "Capablanca–Tartakower, New York 1924 (PILOT_pm-la-tour-a-la-7e-rangee.pgn).",
  },
  {
    themeId: "pm-la-tour-a-la-7e-rangee",
    fen: "6k1/p1p4R/1p3KP1/3p1p2/P2Pr3/8/8/8 w - - 4 40",
    solution: ["h7g7"],
    solutionSan: ["Rg7+"],
    rating: 1505,
    sourceRef: "Capablanca–Tartakower, New York 1924 (PILOT_pm-la-tour-a-la-7e-rangee.pgn) : depuis la 7e rangée, la Tour continue de harceler le Roi confiné à la dernière rangée.",
  },
  {
    themeId: "pm-la-tour-a-la-7e-rangee",
    fen: "7k/p1p3R1/1p3KP1/3p1p2/P2Pr3/8/8/8 w - - 6 41",
    solution: ["g7c7"],
    solutionSan: ["Rxc7"],
    rating: 1515,
    sourceRef: "Capablanca–Tartakower, New York 1924 (PILOT_pm-la-tour-a-la-7e-rangee.pgn) : un pion noir de plus tombe depuis la 7e rangée.",
  },
  {
    themeId: "pm-la-tour-a-la-7e-rangee",
    fen: "4rk2/p1pq1r1p/1p4p1/n2p4/P2PQP1P/2PB2P1/6K1/R3R3 w - - 0 25",
    solution: ["e4e8"],
    solutionSan: ["Qxe8+"],
    rating: 1400,
    sourceRef: "Capablanca–Tartakower, New York 1924 (PILOT_pm-la-tour-a-la-7e-rangee.pgn) : préparer l'entrée de la Tour par un échange de Dames.",
  },
  {
    themeId: "pm-la-tour-a-la-7e-rangee",
    fen: "4qk2/p1p2r1p/1p4p1/n2p4/P2P1P1P/2PB2P1/6K1/R3R3 w - - 0 26",
    solution: ["e1e8"],
    solutionSan: ["Rxe8+"],
    rating: 1410,
    sourceRef: "Capablanca–Tartakower, New York 1924 (PILOT_pm-la-tour-a-la-7e-rangee.pgn).",
  },
  {
    themeId: "pm-la-tour-a-la-7e-rangee",
    fen: "5k2/p1p4R/1pr3p1/3p2P1/P2P1P2/2PBn3/6K1/8 w - - 1 33",
    solution: ["g2f3"],
    solutionSan: ["Kf3"],
    rating: 1450,
    sourceRef: "Capablanca–Tartakower, New York 1924 (PILOT_pm-la-tour-a-la-7e-rangee.pgn).",
  },
  {
    themeId: "pm-la-tour-a-la-7e-rangee",
    fen: "5k2/p1p4R/1p4P1/3p1pK1/P2Pr3/8/8/8 w - - 2 39",
    solution: ["g5f6"],
    solutionSan: ["Kf6"],
    rating: 1490,
    sourceRef: "Capablanca–Tartakower, New York 1924 (PILOT_pm-la-tour-a-la-7e-rangee.pgn).",
  },
  {
    themeId: "pm-la-tour-a-la-7e-rangee",
    fen: "6k1/2R3P1/1p1K4/8/P2P4/8/2r5/8 w - - 3 49",
    solution: ["d4d5"],
    solutionSan: ["d5"],
    rating: 1520,
    sourceRef: "Capablanca–Tartakower, New York 1924 (PILOT_pm-la-tour-a-la-7e-rangee.pgn) : le pion passé, escorté par le Roi depuis la finale gagnée à la 7e rangée, va promouvoir.",
  },
  {
    themeId: "pm-la-tour-a-la-7e-rangee",
    fen: "6k1/p1R3P1/1p6/3pK3/P2P2r1/8/8/8 w - - 1 46",
    solution: ["c7a7"],
    solutionSan: ["Rxa7"],
    rating: 1500,
    sourceRef: "Capablanca–Tartakower, New York 1924 (PILOT_pm-la-tour-a-la-7e-rangee.pgn).",
  },
  // `pm-prophylaxie-anticiper-le-plan-adverse` : 15 exercices (2026-09-10,
  // 3e lot au format Lichess), tous tirés de la MÊME partie que le tutoriel
  // (`COURSE_LESSONS`, Tarrasch–Showalter, 1898, citée par Chernev sous le
  // titre « Systematic strangulation », The Most Instructive Games of Chess
  // Ever Played n°22 — `data/import/academy/PILOT_pm-prophylaxie-anticiper-le-plan-adverse.pgn`).
  // Chaque position est un point de décision réel de la démonstration
  // classique « empêcher d'abord, développer ensuite », rejouée et vérifiée
  // coup par coup avec chess.js.
  {
    themeId: "pm-prophylaxie-anticiper-le-plan-adverse",
    fen: "rnbqk1nr/ppp1bppp/3p4/3Pp3/2B1P3/5N2/PPP2PPP/RNBQK2R w KQkq - 1 6",
    solution: ["c4d3"],
    solutionSan: ["Bd3"],
    rating: 1230,
    sourceRef: "Siegbert Tarrasch – Jackson Showalter, 1898 (PILOT_pm-prophylaxie-anticiper-le-plan-adverse.pgn) : premier coup prophylactique, empêcher ...f5 avant même de développer le cavalier dame.",
  },
  {
    themeId: "pm-prophylaxie-anticiper-le-plan-adverse",
    fen: "rnbq1rk1/ppp1bppp/3p1n2/3Pp3/2P1P3/3B1N2/PP3PPP/RNBQK2R w KQ - 1 8",
    solution: ["h2h3"],
    solutionSan: ["h3"],
    rating: 1260,
    sourceRef: "Siegbert Tarrasch – Jackson Showalter, 1898 (PILOT_pm-prophylaxie-anticiper-le-plan-adverse.pgn) : deuxième coup prophylactique, empêcher ...Bg4 et préparer g4.",
  },
  {
    themeId: "pm-prophylaxie-anticiper-le-plan-adverse",
    fen: "r1bq1rk1/pp2bppp/n1pp1n2/3Pp3/2P1P3/2NB1N1P/PP3PP1/R1BQK2R w KQ - 2 10",
    solution: ["c1e3"],
    solutionSan: ["Be3"],
    rating: 1290,
    sourceRef: "Siegbert Tarrasch – Jackson Showalter, 1898 (PILOT_pm-prophylaxie-anticiper-le-plan-adverse.pgn).",
  },
  {
    themeId: "pm-prophylaxie-anticiper-le-plan-adverse",
    fen: "r1bqnrk1/ppn1bppp/2pp4/3Pp3/2P1P3/2NBBN1P/PP3PP1/R2Q1RK1 w - - 6 12",
    solution: ["d1c2"],
    solutionSan: ["Qc2"],
    rating: 1320,
    sourceRef: "Siegbert Tarrasch – Jackson Showalter, 1898 (PILOT_pm-prophylaxie-anticiper-le-plan-adverse.pgn) : la dame soutient à l'avance la case f5, clé de toute la stratégie de restriction.",
  },
  {
    themeId: "pm-prophylaxie-anticiper-le-plan-adverse",
    fen: "r1bqnrk1/ppn1bp1p/3p2p1/3Pp3/4P3/2NBBN1P/PPQ2PP1/R4RK1 w - - 0 14",
    solution: ["e3h6"],
    solutionSan: ["Bh6"],
    rating: 1350,
    sourceRef: "Siegbert Tarrasch – Jackson Showalter, 1898 (PILOT_pm-prophylaxie-anticiper-le-plan-adverse.pgn) : force le cavalier noir à boucher f5, désormais cloué et incapable de soutenir la libération.",
  },
  {
    themeId: "pm-prophylaxie-anticiper-le-plan-adverse",
    fen: "r1bq1rk1/ppn1bpnp/3p2pB/3Pp3/4P3/2NB1N1P/PPQ2PP1/R4RK1 w - - 2 15",
    solution: ["g2g4"],
    solutionSan: ["g4"],
    rating: 1380,
    sourceRef: "Siegbert Tarrasch – Jackson Showalter, 1898 (PILOT_pm-prophylaxie-anticiper-le-plan-adverse.pgn).",
  },
  {
    themeId: "pm-prophylaxie-anticiper-le-plan-adverse",
    fen: "r1bqnr1k/pp2bpnp/3p2pB/3Pp3/4P1P1/2NB1N1P/PPQ2P1K/R4R2 w - - 3 17",
    solution: ["f1g1"],
    solutionSan: ["Rg1"],
    rating: 1410,
    sourceRef: "Siegbert Tarrasch – Jackson Showalter, 1898 (PILOT_pm-prophylaxie-anticiper-le-plan-adverse.pgn) : anticiper déjà l'ouverture de la colonne g si jamais ...f5 finissait par être joué.",
  },
  {
    themeId: "pm-prophylaxie-anticiper-le-plan-adverse",
    fen: "2rqnr1k/p2bbpnp/1p1p2pB/3Pp3/4P1P1/2NB1N1P/PPQ2PRK/6R1 w - - 0 20",
    solution: ["c2d2"],
    solutionSan: ["Qd2"],
    rating: 1440,
    sourceRef: "Siegbert Tarrasch – Jackson Showalter, 1898 (PILOT_pm-prophylaxie-anticiper-le-plan-adverse.pgn).",
  },
  {
    themeId: "pm-prophylaxie-anticiper-le-plan-adverse",
    fen: "2rq1rnk/p2bb1np/1p1p1p2/3Pp1p1/4P1P1/2NBBN1P/PP1Q1PRK/6R1 w - - 0 24",
    solution: ["h3h4"],
    solutionSan: ["h4"],
    rating: 1470,
    sourceRef: "Siegbert Tarrasch – Jackson Showalter, 1898 (PILOT_pm-prophylaxie-anticiper-le-plan-adverse.pgn).",
  },
  {
    themeId: "pm-prophylaxie-anticiper-le-plan-adverse",
    fen: "2rq1rn1/p2bb1n1/1p1p1pkp/3Pp1p1/4P1PP/2NBBN2/PP1Q1PR1/6KR w - - 4 27",
    solution: ["f3h2"],
    solutionSan: ["Nh2"],
    rating: 1500,
    sourceRef: "Siegbert Tarrasch – Jackson Showalter, 1898 (PILOT_pm-prophylaxie-anticiper-le-plan-adverse.pgn) : le cavalier se dirige vers f5 via f1 et g3 — l'aboutissement de la stratégie préparée dès le 6e coup.",
  },
  {
    themeId: "pm-prophylaxie-anticiper-le-plan-adverse",
    fen: "1q3rn1/p1rbbkn1/Bp1p1p1p/3Pp1p1/4P1PP/2N1B3/PP2QPR1/5NKR w - - 12 31",
    solution: ["c3b5"],
    solutionSan: ["Nb5"],
    rating: 1530,
    sourceRef: "Siegbert Tarrasch – Jackson Showalter, 1898 (PILOT_pm-prophylaxie-anticiper-le-plan-adverse.pgn).",
  },
  {
    themeId: "pm-prophylaxie-anticiper-le-plan-adverse",
    fen: "1qr3n1/p1r1bkn1/1p1p1p2/1B1Pp1p1/4P1P1/4B3/PP2QPR1/5NKR w - - 0 34",
    solution: ["b5c6"],
    solutionSan: ["Bc6"],
    rating: 1560,
    sourceRef: "Siegbert Tarrasch – Jackson Showalter, 1898 (PILOT_pm-prophylaxie-anticiper-le-plan-adverse.pgn).",
  },
  {
    themeId: "pm-prophylaxie-anticiper-le-plan-adverse",
    fen: "1qr2bn1/p1r2kn1/1pBp1p2/3Pp1p1/4P1P1/4B3/PP2QPR1/5NKR w - - 2 35",
    solution: ["e2f3"],
    solutionSan: ["Qf3"],
    rating: 1590,
    sourceRef: "Siegbert Tarrasch – Jackson Showalter, 1898 (PILOT_pm-prophylaxie-anticiper-le-plan-adverse.pgn).",
  },
  {
    themeId: "pm-prophylaxie-anticiper-le-plan-adverse",
    fen: "1q4n1/p4kbR/1prpnp2/4p1p1/4P1P1/4BQN1/PP3PR1/6K1 w - - 0 39",
    solution: ["g3f5"],
    solutionSan: ["Nf5"],
    rating: 1620,
    sourceRef: "Siegbert Tarrasch – Jackson Showalter, 1898 (PILOT_pm-prophylaxie-anticiper-le-plan-adverse.pgn) : le cavalier atteint enfin la case idéale préparée depuis le tout début de la partie.",
  },
  {
    themeId: "pm-prophylaxie-anticiper-le-plan-adverse",
    fen: "2q5/p3nknR/1prp1p2/4p1p1/4P1P1/4BQ2/PP3P1R/6K1 w - - 0 42",
    solution: ["e3g5"],
    solutionSan: ["Bxg5"],
    rating: 1650,
    sourceRef: "Siegbert Tarrasch – Jackson Showalter, 1898 (PILOT_pm-prophylaxie-anticiper-le-plan-adverse.pgn).",
  },
  // `pm-l-avantage-d-espace` : 12 exercices (2026-09-10, 3e lot au format
  // Lichess), tous tirés de la MÊME partie que le tutoriel (`COURSE_LESSONS`,
  // Botvinnik–Vidmar, 1946, citée par Chernev sous le titre implicite de
  // l'avance à l'aile dame — `data/import/academy/PILOT_pm-lavantage-despace.pgn`,
  // source Lichess https://lichess.org/study/w2JcfP5K/gVYEYZbz). Chaque
  // position est un point de décision réel de la démonstration classique
  // « gagner de l'espace pour comprimer, puis étouffer », rejouée et
  // vérifiée coup par coup avec chess.js.
  {
    themeId: "pm-l-avantage-d-espace",
    fen: "rnb1k2r/ppp2ppp/4pn2/8/2NP4/5NP1/PP1bPP1P/R3KB1R w KQkq - 0 10",
    solution: ["f3d2"],
    solutionSan: ["Nfxd2"],
    rating: 1230,
    sourceRef: "Mikhail Botvinnik – Milan Vidmar, 1946 (PILOT_pm-lavantage-despace.pgn).",
  },
  {
    themeId: "pm-l-avantage-d-espace",
    fen: "r1b1k2r/ppp2ppp/4pn2/8/1nNP4/4P1P1/PP1N1P1P/R3KB1R w KQkq - 1 12",
    solution: ["e1e2"],
    solutionSan: ["Ke2"],
    rating: 1260,
    sourceRef: "Mikhail Botvinnik – Milan Vidmar, 1946 (PILOT_pm-lavantage-despace.pgn).",
  },
  {
    themeId: "pm-l-avantage-d-espace",
    fen: "r3k2r/pppn1ppp/2b1p3/3n4/2NP4/P3PPP1/1P1NK1BP/R6R w kq - 1 16",
    solution: ["e3e4"],
    solutionSan: ["e4"],
    rating: 1290,
    sourceRef: "Mikhail Botvinnik – Milan Vidmar, 1946 (PILOT_pm-lavantage-despace.pgn).",
  },
  {
    themeId: "pm-l-avantage-d-espace",
    fen: "2kr3r/ppp2ppp/1nb1p3/8/3PP3/PP2KPP1/3N3P/R1R2B2 w - - 0 23",
    solution: ["a3a4"],
    solutionSan: ["a4"],
    rating: 1320,
    sourceRef: "Mikhail Botvinnik – Milan Vidmar, 1946 (PILOT_pm-lavantage-despace.pgn) : le plan des Blancs — gagner de l'espace à l'aile dame pour disloquer les pions noirs.",
  },
  {
    themeId: "pm-l-avantage-d-espace",
    fen: "nk1rb2r/p5pp/Ppp1pp2/8/1P1PP3/2R1KPP1/3N3P/2R2B2 w - - 0 29",
    solution: ["d2b1"],
    solutionSan: ["Nb1"],
    rating: 1350,
    sourceRef: "Mikhail Botvinnik – Milan Vidmar, 1946 (PILOT_pm-lavantage-despace.pgn).",
  },
  {
    themeId: "pm-l-avantage-d-espace",
    fen: "1k1r3r/p1nb2pp/Ppp1pp2/8/1P1PP3/N1R1KPP1/7P/2R2B2 w - - 4 31",
    solution: ["b4b5"],
    solutionSan: ["b5"],
    rating: 1380,
    sourceRef: "Mikhail Botvinnik – Milan Vidmar, 1946 (PILOT_pm-lavantage-despace.pgn) : donner un pion pour installer la Tour en 7e rangée, conséquence directe de l'espace accumulé.",
  },
  {
    themeId: "pm-l-avantage-d-espace",
    fen: "1k1r3r/p2b2pp/Pp2pp2/1p6/3PP3/N1R1KPP1/7P/2R5 w - - 0 33",
    solution: ["c3c7"],
    solutionSan: ["Rc7"],
    rating: 1410,
    sourceRef: "Mikhail Botvinnik – Milan Vidmar, 1946 (PILOT_pm-lavantage-despace.pgn).",
  },
  {
    themeId: "pm-l-avantage-d-espace",
    fen: "k1r4r/pR1b2pp/Pp2pp2/1p6/3PP3/N3KPP1/7P/2R5 w - - 4 35",
    solution: ["b7d7"],
    solutionSan: ["Rxd7"],
    rating: 1440,
    sourceRef: "Mikhail Botvinnik – Milan Vidmar, 1946 (PILOT_pm-lavantage-despace.pgn) : Botvinnik sacrifie la qualité pour garder sa Tour en 7e rangée.",
  },
  {
    themeId: "pm-l-avantage-d-espace",
    fen: "k1r5/p2R2pp/Pp2pp2/1N6/3PP3/4KPP1/7P/2r5 w - - 1 37",
    solution: ["d7g7"],
    solutionSan: ["Rxg7"],
    rating: 1470,
    sourceRef: "Mikhail Botvinnik – Milan Vidmar, 1946 (PILOT_pm-lavantage-despace.pgn).",
  },
  {
    themeId: "pm-l-avantage-d-espace",
    fen: "8/Pk6/5p1p/1NrPp3/4P1P1/4KP2/7P/8 w - - 1 49",
    solution: ["b5d6"],
    solutionSan: ["Nd6+"],
    rating: 1500,
    sourceRef: "Mikhail Botvinnik – Milan Vidmar, 1946 (PILOT_pm-lavantage-despace.pgn).",
  },
  {
    themeId: "pm-l-avantage-d-espace",
    fen: "8/2k2r2/7p/3Pp2N/4P1PP/5P2/5K2/8 w - - 3 55",
    solution: ["g4g5"],
    solutionSan: ["g5"],
    rating: 1530,
    sourceRef: "Mikhail Botvinnik – Milan Vidmar, 1946 (PILOT_pm-lavantage-despace.pgn).",
  },
  {
    themeId: "pm-l-avantage-d-espace",
    fen: "8/2k5/5N2/3Pp1P1/4P3/5PK1/8/7r w - - 5 59",
    solution: ["g3g2"],
    solutionSan: ["Kg2"],
    rating: 1560,
    sourceRef: "Mikhail Botvinnik – Milan Vidmar, 1946 (PILOT_pm-lavantage-despace.pgn) : domination totale, la Tour noire n'a plus qu'une seule case correcte.",
  },
  // `pm-le-complexe-de-cases-faibles` : 15 exercices (2026-09-10, 3e lot au
  // format Lichess) — 13 tirés de la MÊME partie que le tutoriel
  // (`COURSE_LESSONS`, Andric–Daja, 1949, citée par Chernev sous le titre
  // « Bolt from the Blue », The Most Instructive Games of Chess Ever Played
  // n°59), 2 tirés d'une seconde partie réelle sur le même thème, Schlechter–
  // John, 1905 (« Web of Black Squares », partie n°47, « l'une des plus
  // grandes parties jamais jouées » selon Reti) — les deux chapitres du même
  // fichier PILOT (`data/import/academy/PILOT_pm-le-complexe-de-cases-faibles.pgn`).
  // Chaque position est un point de décision réel autour du réseau de cases
  // faibles (f6/h6 puis e5-f6-h6), rejouée et vérifiée coup par coup avec
  // chess.js.
  {
    themeId: "pm-le-complexe-de-cases-faibles",
    fen: "rnq2rk1/1bp1bppp/1p1p4/p3p3/P1PPP3/2P3P1/2QN1PBP/R1B2RK1 w - - 0 13",
    solution: ["f2f4"],
    solutionSan: ["f4"],
    rating: 1230,
    sourceRef: "Dragoslav Andric – Daja, 1949 (PILOT_pm-le-complexe-de-cases-faibles.pgn).",
  },
  {
    themeId: "pm-le-complexe-de-cases-faibles",
    fen: "rnq2rk1/1bp2ppp/1p3b2/p2Pp3/P1P1P3/2P3P1/1BQN2BP/R4RK1 w - - 1 17",
    solution: ["b2a3"],
    solutionSan: ["Ba3"],
    rating: 1260,
    sourceRef: "Dragoslav Andric – Daja, 1949 (PILOT_pm-le-complexe-de-cases-faibles.pgn).",
  },
  {
    themeId: "pm-le-complexe-de-cases-faibles",
    fen: "rnqr2k1/1bp2ppp/1p3b2/p2Pp3/P1P1P3/B1P3P1/2QN2BP/R4RK1 w - - 3 18",
    solution: ["f1f6"],
    solutionSan: ["Rxf6"],
    rating: 1290,
    sourceRef: "Dragoslav Andric – Daja, 1949 (PILOT_pm-le-complexe-de-cases-faibles.pgn) : le sacrifice qui déclenche tout — céder la qualité contre le fou défenseur pour investir les cases noires.",
  },
  {
    themeId: "pm-le-complexe-de-cases-faibles",
    fen: "rnqr2k1/1bp2p1p/1p3p2/p2Pp3/P1P1P3/B1P3P1/2QN2BP/R5K1 w - - 0 19",
    solution: ["c2d1"],
    solutionSan: ["Qd1"],
    rating: 1320,
    sourceRef: "Dragoslav Andric – Daja, 1949 (PILOT_pm-le-complexe-de-cases-faibles.pgn) : la menace Qh5 suivie de Bh3-f5 vise précisément le réseau de cases noires.",
  },
  {
    themeId: "pm-le-complexe-de-cases-faibles",
    fen: "rnqr2k1/1b3p1p/1p3p2/p1pPp3/P1P1P3/B1P3P1/3N2BP/R2Q2K1 w - c6 0 20",
    solution: ["d1h5"],
    solutionSan: ["Qh5"],
    rating: 1350,
    sourceRef: "Dragoslav Andric – Daja, 1949 (PILOT_pm-le-complexe-de-cases-faibles.pgn).",
  },
  {
    themeId: "pm-le-complexe-de-cases-faibles",
    fen: "rnq3k1/1b3p1p/1p1r1p2/p1pPp2Q/P1P1P3/B1P3P1/3N2BP/R5K1 w - - 2 21",
    solution: ["g2h3"],
    solutionSan: ["Bh3"],
    rating: 1380,
    sourceRef: "Dragoslav Andric – Daja, 1949 (PILOT_pm-le-complexe-de-cases-faibles.pgn).",
  },
  {
    themeId: "pm-le-complexe-de-cases-faibles",
    fen: "rn3qk1/1b3p1p/1p1r1p2/p1pPp2Q/P1P1P3/B1P3PB/3N3P/R5K1 w - - 4 22",
    solution: ["h3f5"],
    solutionSan: ["Bf5"],
    rating: 1410,
    sourceRef: "Dragoslav Andric – Daja, 1949 (PILOT_pm-le-complexe-de-cases-faibles.pgn) : menace de mat immédiat, le fou s'installe sur une case noire indéfendable.",
  },
  {
    themeId: "pm-le-complexe-de-cases-faibles",
    fen: "r5k1/1b1n1pqp/1p1r1p2/p1pPpB1Q/P1P1P3/B1P2NP1/7P/R5K1 w - - 8 24",
    solution: ["a3c1"],
    solutionSan: ["Bc1"],
    rating: 1440,
    sourceRef: "Dragoslav Andric – Daja, 1949 (PILOT_pm-le-complexe-de-cases-faibles.pgn).",
  },
  {
    themeId: "pm-le-complexe-de-cases-faibles",
    fen: "r6k/1b1n1pqp/1p1r1p2/p1pPpB1Q/P1P1P3/2P2NP1/7P/R1B3K1 w - - 10 25",
    solution: ["c1h6"],
    solutionSan: ["Bh6"],
    rating: 1470,
    sourceRef: "Dragoslav Andric – Daja, 1949 (PILOT_pm-le-complexe-de-cases-faibles.pgn).",
  },
  {
    themeId: "pm-le-complexe-de-cases-faibles",
    fen: "r5qk/1b1n1p1p/1p1r1p1B/p1pPpB1Q/P1P1P3/2P2NP1/7P/R5K1 w - - 12 26",
    solution: ["f5d7"],
    solutionSan: ["Bxd7"],
    rating: 1500,
    sourceRef: "Dragoslav Andric – Daja, 1949 (PILOT_pm-le-complexe-de-cases-faibles.pgn).",
  },
  {
    themeId: "pm-le-complexe-de-cases-faibles",
    fen: "r5qk/1b1r1p1p/1p3p1B/p1pPp2Q/P1P1P3/2P2NP1/7P/R5K1 w - - 0 27",
    solution: ["f3e5"],
    solutionSan: ["Nxe5"],
    rating: 1530,
    sourceRef: "Dragoslav Andric – Daja, 1949 (PILOT_pm-le-complexe-de-cases-faibles.pgn) : un second sacrifice, exploitant à fond le complexe de cases faibles créé depuis le 18e coup.",
  },
  {
    themeId: "pm-le-complexe-de-cases-faibles",
    fen: "r5qk/1b4rp/1p3Q1B/p1pP4/P1P1P3/2P3P1/7P/R5K1 w - - 1 30",
    solution: ["a1f1"],
    solutionSan: ["Rf1"],
    rating: 1550,
    sourceRef: "Dragoslav Andric – Daja, 1949 (PILOT_pm-le-complexe-de-cases-faibles.pgn).",
  },
  {
    themeId: "pm-le-complexe-de-cases-faibles",
    fen: "r5qk/6rp/1p1P1Q1B/p1p5/P1b1P3/2P3P1/7P/5RK1 w - - 0 32",
    solution: ["d6d7"],
    solutionSan: ["d7"],
    rating: 1570,
    sourceRef: "Dragoslav Andric – Daja, 1949 (PILOT_pm-le-complexe-de-cases-faibles.pgn).",
  },
  {
    themeId: "pm-le-complexe-de-cases-faibles",
    fen: "rnb2r1k/pp3qpp/2p1p3/3p1p2/2PPnP2/1QNB1NP1/PP3P1P/2R2RK1 w - - 1 13",
    solution: ["f3e5"],
    solutionSan: ["Ne5"],
    rating: 1590,
    sourceRef: "Carl Schlechter – William John, 1905 (PILOT_pm-le-complexe-de-cases-faibles.pgn, chapitre 2 « le réseau des cases noires e5-f6-h6 ») : le cavalier s'installe sur la première case-clé du réseau noir, e5.",
  },
  {
    themeId: "pm-le-complexe-de-cases-faibles",
    fen: "4brk1/1pn1q1rp/p1p1p1p1/2PpN1P1/PP1P1PN1/5R2/2Q4P/5RK1 w - - 3 33",
    solution: ["g4h6"],
    solutionSan: ["Nh6+"],
    rating: 1610,
    sourceRef: "Carl Schlechter – William John, 1905 (PILOT_pm-le-complexe-de-cases-faibles.pgn, chapitre 2) : la deuxième case du réseau tombe à son tour.",
  },
  // `pm-la-securite-du-roi-en-milieu-de-partie` : 15 exercices (2026-09-10,
  // trois parties réelles). 6 viennent de la partie du tutoriel
  // (`COURSE_LESSONS`, l'Opéra de Paris, Morphy–Duc de Brunswick & Comte
  // Isouard, 1858 — `data/import/academy/PILOT_pm-la-securite-du-roi-en-milieu-de-partie.pgn`),
  // 9 de deux autres parties réelles sur le même thème, tirées de l'étude
  // Lichess « King safety » de FM Heineccius
  // (https://lichess.org/study/ukMqeI6m) : Tarrasch–Pillsbury, Vienne 1898,
  // et Capablanca–Steiner (exhibition d'échecs vivants), 1933. Chaque
  // position est un point de décision réel, rejoué et vérifié coup par coup
  // avec chess.js.
  {
    themeId: "pm-la-securite-du-roi-en-milieu-de-partie",
    fen: "rn1qkb1r/ppp2ppp/5n2/4p3/2B1P3/5Q2/PPP2PPP/RNB1K2R w KQkq - 2 7",
    solution: ["f3b3"],
    solutionSan: ["Qb3"],
    rating: 1320,
    sourceRef: "Paul Morphy – Duc de Brunswick & Comte Isouard, Opéra de Paris 1858 (PILOT_pm-la-securite-du-roi-en-milieu-de-partie.pgn) : la Dame attaque b7 et f7 à la fois pendant que le Roi noir traîne au centre.",
  },
  {
    themeId: "pm-la-securite-du-roi-en-milieu-de-partie",
    fen: "rn2kb1r/p3qppp/2p2n2/1p2p1B1/2B1P3/1QN5/PPP2PPP/R3K2R w KQkq - 0 10",
    solution: ["c3b5"],
    solutionSan: ["Nxb5"],
    rating: 1380,
    sourceRef: "Paul Morphy – Duc de Brunswick & Comte Isouard, Opéra de Paris 1858 (PILOT_pm-la-securite-du-roi-en-milieu-de-partie.pgn) : sacrifice de pièce pour ouvrir des lignes vers le Roi jamais mis à l'abri.",
  },
  {
    themeId: "pm-la-securite-du-roi-en-milieu-de-partie",
    fen: "r3kb1r/p2nqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/R3K2R w KQkq - 1 12",
    solution: ["e1c1"],
    solutionSan: ["O-O-O"],
    rating: 1400,
    sourceRef: "Paul Morphy – Duc de Brunswick & Comte Isouard, Opéra de Paris 1858 (PILOT_pm-la-securite-du-roi-en-milieu-de-partie.pgn) : Morphy roque depuis longtemps, son Roi en sécurité contre celui, encore au centre, des Noirs.",
  },
  {
    themeId: "pm-la-securite-du-roi-en-milieu-de-partie",
    fen: "3rkb1r/p2nqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR3R w k - 3 13",
    solution: ["d1d7"],
    solutionSan: ["Rxd7"],
    rating: 1430,
    sourceRef: "Paul Morphy – Duc de Brunswick & Comte Isouard, Opéra de Paris 1858 (PILOT_pm-la-securite-du-roi-en-milieu-de-partie.pgn).",
  },
  {
    themeId: "pm-la-securite-du-roi-en-milieu-de-partie",
    fen: "4kb1r/p2n1ppp/4q3/4p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 16",
    solution: ["b3b8"],
    solutionSan: ["Qb8+"],
    rating: 1480,
    sourceRef: "Paul Morphy – Duc de Brunswick & Comte Isouard, Opéra de Paris 1858 (PILOT_pm-la-securite-du-roi-en-milieu-de-partie.pgn) : le sacrifice final, rendu possible uniquement parce que le Roi noir n'a jamais quitté le centre.",
  },
  {
    themeId: "pm-la-securite-du-roi-en-milieu-de-partie",
    fen: "1n2kb1r/p4ppp/4q3/4p1B1/4P3/8/PPP2PPP/2KR4 w k - 0 17",
    solution: ["d1d8"],
    solutionSan: ["Rd8#"],
    rating: 1500,
    sourceRef: "Paul Morphy – Duc de Brunswick & Comte Isouard, Opéra de Paris 1858 (PILOT_pm-la-securite-du-roi-en-milieu-de-partie.pgn) : mat — toute la partie tient en une idée, un Roi jamais mis en sécurité finit toujours par être rattrapé.",
  },
  {
    themeId: "pm-la-securite-du-roi-en-milieu-de-partie",
    fen: "r2q1rk1/ppp1nppp/3pbn2/4p1B1/2B1P3/2PP1N2/P1P2PPP/R2Q1RK1 w - - 3 10",
    solution: ["g5f6"],
    solutionSan: ["Bxf6"],
    rating: 1410,
    sourceRef: "Siegbert Tarrasch – Harry Nelson Pillsbury, Vienne 1898 (étude Lichess « King safety », FM Heineccius, lichess.org/study/ukMqeI6m) : détruire volontairement le rempart de pions du Roi noir.",
  },
  {
    themeId: "pm-la-securite-du-roi-en-milieu-de-partie",
    fen: "r2q4/ppp3k1/3p1pPr/4p3/8/2PP4/P1P3PP/R2Q1RK1 w - - 1 18",
    solution: ["a1b1"],
    solutionSan: ["Rb1"],
    rating: 1460,
    sourceRef: "Siegbert Tarrasch – Harry Nelson Pillsbury, Vienne 1898 (étude Lichess « King safety », FM Heineccius, lichess.org/study/ukMqeI6m) : une manière originale d'amener la Tour dans la partie, en gagnant un tempo contre b7.",
  },
  {
    themeId: "pm-la-securite-du-roi-en-milieu-de-partie",
    fen: "r7/p1pq2k1/1p1p1pPr/4p3/1R6/2PP4/P1P3PP/3Q1RK1 w - - 2 20",
    solution: ["f1f6"],
    solutionSan: ["Rxf6"],
    rating: 1520,
    sourceRef: "Siegbert Tarrasch – Harry Nelson Pillsbury, Vienne 1898 (étude Lichess « King safety », FM Heineccius, lichess.org/study/ukMqeI6m) : le Roi noir, jamais vraiment en sécurité malgré le grand roque, est rattrapé en finale.",
  },
  {
    themeId: "pm-la-securite-du-roi-en-milieu-de-partie",
    fen: "r2q1rk1/pp2n2p/2pppp2/4p3/4P2N/2PP4/P1P2PPP/R2Q1RK1 w - - 0 13",
    solution: ["d1g4"],
    solutionSan: ["Qg4+"],
    rating: 1440,
    sourceRef: "Jose Raul Capablanca – Herman Steiner, exhibition d'échecs vivants, Los Angeles 1933 (étude Lichess « King safety », FM Heineccius, lichess.org/study/ukMqeI6m) : le Roi noir n'a pas roqué, la Dame ouvre les hostilités.",
  },
  {
    themeId: "pm-la-securite-du-roi-en-milieu-de-partie",
    fen: "r2q1r2/pp2nk1p/2pppp2/4p3/4P1QN/2PP4/P1P2PPP/R4RK1 w - - 2 14",
    solution: ["f2f4"],
    solutionSan: ["f4"],
    rating: 1450,
    sourceRef: "Jose Raul Capablanca – Herman Steiner, Los Angeles 1933 (étude Lichess « King safety », FM Heineccius, lichess.org/study/ukMqeI6m) : ouvrir encore des lignes vers le Roi contraint de rester au centre.",
  },
  {
    themeId: "pm-la-securite-du-roi-en-milieu-de-partie",
    fen: "r2q2r1/pp2n1kp/2p1pp2/4p2Q/4P2N/2PP4/P1P3PP/R4RK1 w - - 0 17",
    solution: ["f1f6"],
    solutionSan: ["Rxf6"],
    rating: 1530,
    sourceRef: "Jose Raul Capablanca – Herman Steiner, Los Angeles 1933 (étude Lichess « King safety », FM Heineccius, lichess.org/study/ukMqeI6m) : sacrifice d'échange décisif contre le Roi resté au centre.",
  },
  {
    themeId: "pm-la-securite-du-roi-en-milieu-de-partie",
    fen: "r2q2r1/pp5p/2p1pk2/4pn1Q/4P2N/2PP4/P1P3PP/5RK1 w - - 2 19",
    solution: ["h4f5"],
    solutionSan: ["Nxf5"],
    rating: 1545,
    sourceRef: "Jose Raul Capablanca – Herman Steiner, Los Angeles 1933 (étude Lichess « King safety », FM Heineccius, lichess.org/study/ukMqeI6m).",
  },
  {
    themeId: "pm-la-securite-du-roi-en-milieu-de-partie",
    fen: "r2q2r1/pp3Q1p/2p2R2/2k1p3/4P3/2PP4/P1P3PP/6K1 w - - 5 23",
    solution: ["f7b7"],
    solutionSan: ["Qxb7"],
    rating: 1560,
    sourceRef: "Jose Raul Capablanca – Herman Steiner, Los Angeles 1933 (étude Lichess « King safety », FM Heineccius, lichess.org/study/ukMqeI6m) : le Roi noir, chassé du centre par la brèche initiale, se retrouve maintenant traqué en pleine partie.",
  },
  {
    themeId: "pm-la-securite-du-roi-en-milieu-de-partie",
    fen: "r5r1/pQ5p/1qp2R2/2k1p3/4P3/2PP4/P1P3PP/6K1 w - - 1 24",
    solution: ["f6c6"],
    solutionSan: ["Rxc6+"],
    rating: 1570,
    sourceRef: "Jose Raul Capablanca – Herman Steiner, Los Angeles 1933 (étude Lichess « King safety », FM Heineccius, lichess.org/study/ukMqeI6m) : le filet se referme sur le Roi noir.",
  },
  // `pm-activite-des-pieces-contre-materiel` : 13 exercices (2026-09-10, 3e
  // lot au format Lichess), tous tirés de la MÊME partie que le tutoriel
  // (`COURSE_LESSONS`, Marshall–Capablanca, 1918, citée par Chernev sous le
  // titre « Lured into Zugzwang », The Most Instructive Games of Chess Ever
  // Played n°60 — `data/import/academy/PILOT_pm-activite-des-pieces-contre-materiel.pgn`).
  // Chaque position est un point de décision réel de la démonstration
  // classique du sacrifice positionnel (céder un pion pour l'activité des
  // pièces), rejouée et vérifiée coup par coup avec chess.js.
  {
    themeId: "pm-activite-des-pieces-contre-materiel",
    fen: "r2r2k1/pb3ppp/1pp1q3/8/4P3/2Q2N2/PP3PPP/2R1R1K1 w - - 0 18",
    solution: ["f3d4"],
    solutionSan: ["Nd4"],
    rating: 1230,
    sourceRef: "Frank Marshall – Jose Raul Capablanca, 1918 (PILOT_pm-activite-des-pieces-contre-materiel.pgn) : Marshall pose un piège tactique.",
  },
  {
    themeId: "pm-activite-des-pieces-contre-materiel",
    fen: "r2r2k1/pb3ppp/1pp1q3/8/3NP3/2Q5/PP3PPP/2R1R1K1 b - - 1 18",
    solution: ["e6e5"],
    solutionSan: ["Qe5"],
    rating: 1260,
    sourceRef: "Frank Marshall – Jose Raul Capablanca, 1918 (PILOT_pm-activite-des-pieces-contre-materiel.pgn) : le coup clé de toute la partie — sacrifier volontairement un pion pour l'activité des pièces.",
  },
  {
    themeId: "pm-activite-des-pieces-contre-materiel",
    fen: "r2r2k1/pb3ppp/1pN5/8/4P3/2R5/PP3PPP/4R1K1 b - - 0 20",
    solution: ["d8d2"],
    solutionSan: ["Rd2"],
    rating: 1290,
    sourceRef: "Frank Marshall – Jose Raul Capablanca, 1918 (PILOT_pm-activite-des-pieces-contre-materiel.pgn) : la tour domine déjà la 7e rangée, premier versement de la compensation pour le pion sacrifié.",
  },
  {
    themeId: "pm-activite-des-pieces-contre-materiel",
    fen: "r5k1/pb3ppp/1pN5/8/4P3/2R5/PP1r1PPP/1R4K1 b - - 2 21",
    solution: ["a8e8"],
    solutionSan: ["Re8"],
    rating: 1320,
    sourceRef: "Frank Marshall – Jose Raul Capablanca, 1918 (PILOT_pm-activite-des-pieces-contre-materiel.pgn) : cette tour attaque le centre et se prépare à basculer contre le roi blanc.",
  },
  {
    themeId: "pm-activite-des-pieces-contre-materiel",
    fen: "4r1k1/pb3ppp/1pN5/4P3/8/2R5/PP1r1PPP/1R4K1 b - - 0 22",
    solution: ["g7g5"],
    solutionSan: ["g5"],
    rating: 1350,
    sourceRef: "Frank Marshall – Jose Raul Capablanca, 1918 (PILOT_pm-activite-des-pieces-contre-materiel.pgn) : coup magistral, empêche f4 et menace de gagner un pion.",
  },
  {
    themeId: "pm-activite-des-pieces-contre-materiel",
    fen: "4r1k1/pb3p1p/1pN5/4P3/7p/2R5/PP1r1PP1/4R1K1 b - - 1 24",
    solution: ["e8e6"],
    solutionSan: ["Re6"],
    rating: 1380,
    sourceRef: "Frank Marshall – Jose Raul Capablanca, 1918 (PILOT_pm-activite-des-pieces-contre-materiel.pgn) : attaque directe sur le cavalier, désormais défendu par les deux tours blanches à la fois.",
  },
  {
    themeId: "pm-activite-des-pieces-contre-materiel",
    fen: "8/pb3pkp/1pN1r3/4P3/1P5p/2R5/P2r1PP1/2R3K1 b - - 0 26",
    solution: ["b6b5"],
    solutionSan: ["b5"],
    rating: 1410,
    sourceRef: "Frank Marshall – Jose Raul Capablanca, 1918 (PILOT_pm-activite-des-pieces-contre-materiel.pgn).",
  },
  {
    themeId: "pm-activite-des-pieces-contre-materiel",
    fen: "8/pb3pkp/2N1r3/1p2P3/1P5p/P1R5/3r1PP1/2R3K1 b - - 0 27",
    solution: ["e6g6"],
    solutionSan: ["Rg6"],
    rating: 1440,
    sourceRef: "Frank Marshall – Jose Raul Capablanca, 1918 (PILOT_pm-activite-des-pieces-contre-materiel.pgn).",
  },
  {
    themeId: "pm-activite-des-pieces-contre-materiel",
    fen: "8/pb3pkp/2N3r1/1p2P3/1P5p/P1R5/3r1PP1/2R2K2 b - - 2 28",
    solution: ["d2a2"],
    solutionSan: ["Ra2"],
    rating: 1470,
    sourceRef: "Frank Marshall – Jose Raul Capablanca, 1918 (PILOT_pm-activite-des-pieces-contre-materiel.pgn).",
  },
  {
    themeId: "pm-activite-des-pieces-contre-materiel",
    fen: "8/pb3pkp/2N3r1/1p2P3/1P5p/P1R5/r4PP1/2R3K1 b - - 4 29",
    solution: ["h4h3"],
    solutionSan: ["h3"],
    rating: 1500,
    sourceRef: "Frank Marshall – Jose Raul Capablanca, 1918 (PILOT_pm-activite-des-pieces-contre-materiel.pgn).",
  },
  {
    themeId: "pm-activite-des-pieces-contre-materiel",
    fen: "8/pb3pkp/2N3r1/1p2P3/1P6/P1R3Pp/r4P2/2R3K1 b - - 0 30",
    solution: ["a7a6"],
    solutionSan: ["a6"],
    rating: 1530,
    sourceRef: "Frank Marshall – Jose Raul Capablanca, 1918 (PILOT_pm-activite-des-pieces-contre-materiel.pgn) : coup d'attente, les Blancs sont totalement paralysés.",
  },
  {
    themeId: "pm-activite-des-pieces-contre-materiel",
    fen: "8/1b2Npkp/p2r4/1p6/1P4P1/P1R2P1p/r7/2R3K1 b - - 2 34",
    solution: ["d6d2"],
    solutionSan: ["Rdd2"],
    rating: 1560,
    sourceRef: "Frank Marshall – Jose Raul Capablanca, 1918 (PILOT_pm-activite-des-pieces-contre-materiel.pgn).",
  },
  {
    themeId: "pm-activite-des-pieces-contre-materiel",
    fen: "8/1b3p1p/p7/1p3Nk1/1P3PP1/P1R5/r5rp/2R2K2 b - - 0 39",
    solution: ["g5f4"],
    solutionSan: ["Kxf4"],
    rating: 1590,
    sourceRef: "Frank Marshall – Jose Raul Capablanca, 1918 (PILOT_pm-activite-des-pieces-contre-materiel.pgn).",
  },
  // `pm-la-paire-de-fous` : 15 exercices (2026-09-10), tous tirés de la MÊME
  // partie que le tutoriel (`COURSE_LESSONS`, Janowsky–Capablanca, New York
  // 1916, citée par Chernev, The Most Instructive Games of Chess Ever
  // Played n°49 — `data/import/academy/PILOT_pm-la-paire-de-fous.pgn`).
  // Chaque position est un point de décision réel de cette démonstration
  // classique (Capablanca désinstalle sciemment son fou pour forcer
  // l'échange qui lui laisse la paire), rejouée et vérifiée coup par coup
  // avec chess.js.
  {
    themeId: "pm-la-paire-de-fous",
    fen: "rn2kb1r/1p2pppp/1pp5/3N1b2/3P4/5N2/PP2PPPP/R1B1KB1R b KQkq - 0 8",
    solution: ["c6d5"],
    solutionSan: ["cxd5"],
    rating: 1300,
    sourceRef: "Dawid Janowsky – Jose Raul Capablanca, New York 1916 (PILOT_pm-la-paire-de-fous.pgn) : les pions dame noirs s'affaiblissent, mais deux colonnes ouvertes s'offrent en échange.",
  },
  {
    themeId: "pm-la-paire-de-fous",
    fen: "r3kb1r/1p2pppp/1pn5/3p1b2/3P4/4PN2/PP1B1PPP/R3KB1R b KQkq - 2 10",
    solution: ["f5d7"],
    solutionSan: ["Bd7"],
    rating: 1350,
    sourceRef: "Dawid Janowsky – Jose Raul Capablanca, New York 1916 (PILOT_pm-la-paire-de-fous.pgn) : « l'un des coups les plus profonds jamais joués » selon Chernev — désinstaller son propre Fou pour préparer l'échange qui laisse la paire.",
  },
  {
    themeId: "pm-la-paire-de-fous",
    fen: "r3k2r/1p1b1ppp/1pnbp3/3p4/3P4/4PN2/PP1BBPPP/R1R3K1 b kq - 3 13",
    solution: ["e8e7"],
    solutionSan: ["Ke7"],
    rating: 1370,
    sourceRef: "Dawid Janowsky – Jose Raul Capablanca, New York 1916 (PILOT_pm-la-paire-de-fous.pgn).",
  },
  {
    themeId: "pm-la-paire-de-fous",
    fen: "r1r5/1p1bkppp/1pnbp3/3p4/3P4/P1B1PN2/1P2BPPP/R1R3K1 b - - 0 15",
    solution: ["c6a5"],
    solutionSan: ["Na5"],
    rating: 1390,
    sourceRef: "Dawid Janowsky – Jose Raul Capablanca, New York 1916 (PILOT_pm-la-paire-de-fous.pgn) : le Cavalier se dirige vers c4, où il forcera Blanc à céder ses deux Fous.",
  },
  {
    themeId: "pm-la-paire-de-fous",
    fen: "r1r5/1p1bkppp/1p1bp3/n2p4/3P4/P1B1P3/1P1NBPPP/R1R3K1 b - - 2 16",
    solution: ["f7f5"],
    solutionSan: ["f5"],
    rating: 1400,
    sourceRef: "Dawid Janowsky – Jose Raul Capablanca, New York 1916 (PILOT_pm-la-paire-de-fous.pgn).",
  },
  {
    themeId: "pm-la-paire-de-fous",
    fen: "r1r5/1p1bk1pp/1p1bp3/n2p1p2/3P4/P1B1P1P1/1P1NBP1P/R1R3K1 b - - 0 17",
    solution: ["b6b5"],
    solutionSan: ["b5"],
    rating: 1410,
    sourceRef: "Dawid Janowsky – Jose Raul Capablanca, New York 1916 (PILOT_pm-la-paire-de-fous.pgn).",
  },
  {
    themeId: "pm-la-paire-de-fous",
    fen: "r1r5/1p1bk1pp/3bp3/np1p1p2/3P4/P1B1PPP1/1P1NB2P/R1R3K1 b - - 0 18",
    solution: ["a5c4"],
    solutionSan: ["Nc4"],
    rating: 1430,
    sourceRef: "Dawid Janowsky – Jose Raul Capablanca, New York 1916 (PILOT_pm-la-paire-de-fous.pgn) : premier plan accompli — Blanc doit céder un Fou, et la faiblesse restante devient une source de force.",
  },
  {
    themeId: "pm-la-paire-de-fous",
    fen: "6r1/3bbk2/4p2p/1p1pPp2/2pP1Pr1/P1B2K2/1P4NP/1R4R1 w - - 5 32",
    solution: ["c3e1"],
    solutionSan: ["Be1"],
    rating: 1470,
    sourceRef: "Dawid Janowsky – Jose Raul Capablanca, New York 1916 (PILOT_pm-la-paire-de-fous.pgn).",
  },
  {
    themeId: "pm-la-paire-de-fous",
    fen: "6r1/3bbk2/4p2p/1p1pPp2/2pP1Pr1/5K2/1P4NP/1R2B1R1 b - - 6 32",
    solution: ["b5b4"],
    solutionSan: ["b4"],
    rating: 1480,
    sourceRef: "Dawid Janowsky – Jose Raul Capablanca, New York 1916 (PILOT_pm-la-paire-de-fous.pgn) : un sacrifice qui dégage enfin la diagonale du Fou-dame noir, muet depuis vingt-deux coups.",
  },
  {
    themeId: "pm-la-paire-de-fous",
    fen: "6r1/3bbk2/4p2p/3pPp2/1PpP1Pr1/5K2/1P4NP/1R2B1R1 b - - 0 33",
    solution: ["d7a4"],
    solutionSan: ["Ba4"],
    rating: 1495,
    sourceRef: "Dawid Janowsky – Jose Raul Capablanca, New York 1916 (PILOT_pm-la-paire-de-fous.pgn) : le Fou se dirige vers c2 puis e4, où il frappera le Cavalier derrière le Roi blanc.",
  },
  {
    themeId: "pm-la-paire-de-fous",
    fen: "6r1/4bk2/4p2p/3pPp2/1PpP1Pr1/5KB1/1Pb3NP/R5R1 b - - 4 35",
    solution: ["c2e4"],
    solutionSan: ["Be4+"],
    rating: 1510,
    sourceRef: "Dawid Janowsky – Jose Raul Capablanca, New York 1916 (PILOT_pm-la-paire-de-fous.pgn).",
  },
  {
    themeId: "pm-la-paire-de-fous",
    fen: "6r1/4bk2/4p2p/3pPp2/1PpPbPr1/6B1/1P3KNP/R5R1 b - - 6 36",
    solution: ["h6h5"],
    solutionSan: ["h5"],
    rating: 1520,
    sourceRef: "Dawid Janowsky – Jose Raul Capablanca, New York 1916 (PILOT_pm-la-paire-de-fous.pgn).",
  },
  {
    themeId: "pm-la-paire-de-fous",
    fen: "6r1/R3bk2/4p3/3pPp1p/1PpPbPr1/6B1/1P3KNP/6R1 b - - 1 37",
    solution: ["e4g2"],
    solutionSan: ["Bxg2"],
    rating: 1540,
    sourceRef: "Dawid Janowsky – Jose Raul Capablanca, New York 1916 (PILOT_pm-la-paire-de-fous.pgn).",
  },
  {
    themeId: "pm-la-paire-de-fous",
    fen: "6r1/R3bk2/4p3/3pPp2/1PpP1PrB/8/1P3KRP/8 b - - 0 39",
    solution: ["g4g2"],
    solutionSan: ["Rxg2+"],
    rating: 1555,
    sourceRef: "Dawid Janowsky – Jose Raul Capablanca, New York 1916 (PILOT_pm-la-paire-de-fous.pgn).",
  },
  {
    themeId: "pm-la-paire-de-fous",
    fen: "6r1/4R3/4p1k1/3pPpB1/1PpP1P2/1r6/1P3K2/8 b - - 6 44",
    solution: ["b3b2"],
    solutionSan: ["Rxb2+"],
    rating: 1560,
    sourceRef: "Dawid Janowsky – Jose Raul Capablanca, New York 1916 (PILOT_pm-la-paire-de-fous.pgn) : aucune pièce ou pion noir sur case blanche — la paire de Fous initiale s'est transformée en domination totale des cases blanches.",
  },
  // `pm-evaluer-un-echange-de-pieces` : 12 exercices (2026-09-10, 3e lot au
  // format Lichess), tous tirés de la MÊME partie que le tutoriel
  // (`COURSE_LESSONS`, Rubinstein–Duras, 1908, citée par Chernev sous le
  // titre « The passed pawn », The Most Instructive Games of Chess Ever
  // Played n°5 — `data/import/academy/PILOT_pm-evaluer-un-echange-de-pieces.pgn`).
  // Chaque position est un point de décision réel de la démonstration
  // classique « quelle pièce échanger, et avec laquelle reprendre »,
  // rejouée et vérifiée coup par coup avec chess.js.
  {
    themeId: "pm-evaluer-un-echange-de-pieces",
    fen: "r3kb1r/p1q1pppp/2n2n2/1p6/1PN3b1/P3PN2/1B3PPP/R2QKB1R w KQkq - 0 11",
    solution: ["c4e5"],
    solutionSan: ["Nce5"],
    rating: 1230,
    sourceRef: "Akiba Rubinstein – Oldrich Duras, 1908 (PILOT_pm-evaluer-un-echange-de-pieces.pgn).",
  },
  {
    themeId: "pm-evaluer-un-echange-de-pieces",
    fen: "r3kb1r/p1q1pppp/5n2/1p2n3/1P4b1/P3PN2/1B3PPP/R2QKB1R w KQkq - 0 12",
    solution: ["f3e5"],
    solutionSan: ["Nxe5"],
    rating: 1260,
    sourceRef: "Akiba Rubinstein – Oldrich Duras, 1908 (PILOT_pm-evaluer-un-echange-de-pieces.pgn).",
  },
  {
    themeId: "pm-evaluer-un-echange-de-pieces",
    fen: "r3kb1r/p1q1pppp/5n2/1p2N3/1P6/P3P3/1B3PPP/R2bKB1R w KQkq - 0 13",
    solution: ["f1b5"],
    solutionSan: ["Bxb5+"],
    rating: 1290,
    sourceRef: "Akiba Rubinstein – Oldrich Duras, 1908 (PILOT_pm-evaluer-un-echange-de-pieces.pgn).",
  },
  {
    themeId: "pm-evaluer-un-echange-de-pieces",
    fen: "2r1kb1r/p3pppp/6b1/4N3/1P4P1/P3P3/1B3P1P/R3K2R w KQk - 1 18",
    solution: ["e5g6"],
    solutionSan: ["Nxg6"],
    rating: 1320,
    sourceRef: "Akiba Rubinstein – Oldrich Duras, 1908 (PILOT_pm-evaluer-un-echange-de-pieces.pgn) : les deux fous noirs pourraient gêner — Rubinstein évalue qu'il vaut mieux en échanger un.",
  },
  {
    themeId: "pm-evaluer-un-echange-de-pieces",
    fen: "2r1kb1r/4p1p1/p4pp1/8/1P1B2P1/P3P3/3K1P1P/R6R w k - 0 21",
    solution: ["a1c1"],
    solutionSan: ["Rac1"],
    rating: 1350,
    sourceRef: "Akiba Rubinstein – Oldrich Duras, 1908 (PILOT_pm-evaluer-un-echange-de-pieces.pgn) : le moment clé du thème — échanger les tours ou abandonner la colonne ouverte, aucune option ne convient aux Noirs.",
  },
  {
    themeId: "pm-evaluer-un-echange-de-pieces",
    fen: "4kb1r/4p1p1/p4pp1/8/1P1B2P1/P3P3/3K1P1P/2r4R w k - 0 22",
    solution: ["h1c1"],
    solutionSan: ["Rxc1"],
    rating: 1380,
    sourceRef: "Akiba Rubinstein – Oldrich Duras, 1908 (PILOT_pm-evaluer-un-echange-de-pieces.pgn) : Rubinstein reprend avec la tour, pas avec le roi — la pièce qui reprend détermine toute l'activité future.",
  },
  {
    themeId: "pm-evaluer-un-echange-de-pieces",
    fen: "4kb2/6p1/p4pp1/2B1p3/1P4P1/P3P3/3K1P1r/2R5 w - - 0 24",
    solution: ["c5f8"],
    solutionSan: ["Bxf8"],
    rating: 1410,
    sourceRef: "Akiba Rubinstein – Oldrich Duras, 1908 (PILOT_pm-evaluer-un-echange-de-pieces.pgn).",
  },
  {
    themeId: "pm-evaluer-un-echange-de-pieces",
    fen: "5k2/6p1/R4pp1/8/1P2p1P1/P3P3/4KPr1/8 b - - 0 27",
    solution: ["g2g4"],
    solutionSan: ["Rxg4"],
    rating: 1440,
    sourceRef: "Akiba Rubinstein – Oldrich Duras, 1908 (PILOT_pm-evaluer-un-echange-de-pieces.pgn) : le matériel est égal, mais les deux pions passés connectés valent bien plus qu'un simple décompte de points.",
  },
  {
    themeId: "pm-evaluer-un-echange-de-pieces",
    fen: "5k2/6p1/R4pp1/8/1P2p1r1/P3P3/4KP2/8 w - - 0 28",
    solution: ["a6a7"],
    solutionSan: ["Ra7"],
    rating: 1470,
    sourceRef: "Akiba Rubinstein – Oldrich Duras, 1908 (PILOT_pm-evaluer-un-echange-de-pieces.pgn).",
  },
  {
    themeId: "pm-evaluer-un-echange-de-pieces",
    fen: "5k2/1R4p1/5p2/1P4p1/P3p3/4P3/4KP2/r7 w - - 2 32",
    solution: ["b5b6"],
    solutionSan: ["b6"],
    rating: 1500,
    sourceRef: "Akiba Rubinstein – Oldrich Duras, 1908 (PILOT_pm-evaluer-un-echange-de-pieces.pgn).",
  },
  {
    themeId: "pm-evaluer-un-echange-de-pieces",
    fen: "5k2/1R4p1/1P3p2/6p1/P3p3/4P3/4KP2/r7 b - - 0 32",
    solution: ["a1a4"],
    solutionSan: ["Rxa4"],
    rating: 1530,
    sourceRef: "Akiba Rubinstein – Oldrich Duras, 1908 (PILOT_pm-evaluer-un-echange-de-pieces.pgn).",
  },
  {
    themeId: "pm-evaluer-un-echange-de-pieces",
    fen: "4R3/6p1/5p2/5k2/4p1p1/4P3/4KP2/8 w - - 3 39",
    solution: ["e2f1"],
    solutionSan: ["Kf1"],
    rating: 1560,
    sourceRef: "Akiba Rubinstein – Oldrich Duras, 1908 (PILOT_pm-evaluer-un-echange-de-pieces.pgn) : la chaîne de décisions d'échange, depuis le 18e coup, aura été la clé de toute la victoire.",
  },
  // `pm-la-chaine-de-pions` : 17 exercices (2026-09-10), tous tirés de la
  // MÊME partie que le tutoriel (`COURSE_LESSONS`, Bogoljubow–Reti, 1923,
  // « Perennial Favorite » selon Chernev, The Most Instructive Games of
  // Chess Ever Played n°55 — `data/import/academy/PILOT_pm-la-chaine-de-pions.pgn`).
  // Chaque position est un point de décision réel de la démonstration
  // classique « attaquer la base, pas le sommet », rejouée et vérifiée coup
  // par coup avec chess.js.
  {
    themeId: "pm-la-chaine-de-pions",
    fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
    solution: ["e4e5"],
    solutionSan: ["e5"],
    rating: 1250,
    sourceRef: "Efim Bogoljubow – Richard Reti, 1923 (PILOT_pm-la-chaine-de-pions.pgn) : la chaîne de pions blanche e5-d4 s'établit.",
  },
  {
    themeId: "pm-la-chaine-de-pions",
    fen: "rnbqkb1r/pppn1ppp/4p3/3pP3/3P2Q1/2N5/PPP2PPP/R1B1KBNR b KQkq - 2 5",
    solution: ["c7c5"],
    solutionSan: ["c5"],
    rating: 1280,
    sourceRef: "Efim Bogoljubow – Richard Reti, 1923 (PILOT_pm-la-chaine-de-pions.pgn) : réponse classique — attaquer la base de la chaîne, pas son sommet.",
  },
  {
    themeId: "pm-la-chaine-de-pions",
    fen: "rnbqkb1r/pp1n1ppp/4p3/1NppP3/3P2Q1/8/PPP2PPP/R1B1KBNR b KQkq - 1 6",
    solution: ["c5d4"],
    solutionSan: ["cxd4"],
    rating: 1300,
    sourceRef: "Efim Bogoljubow – Richard Reti, 1923 (PILOT_pm-la-chaine-de-pions.pgn).",
  },
  {
    themeId: "pm-la-chaine-de-pions",
    fen: "r1bqk2r/pp1n1pQp/2nbp3/3pP3/3p4/5N2/PPP2PPP/R1B1KB1R b KQkq - 0 9",
    solution: ["d6e5"],
    solutionSan: ["Bxe5"],
    rating: 1350,
    sourceRef: "Efim Bogoljubow – Richard Reti, 1923 (PILOT_pm-la-chaine-de-pions.pgn) : reprendre sur la base sans se soucier de la Dame blanche infiltrée en g7.",
  },
  {
    themeId: "pm-la-chaine-de-pions",
    fen: "r1bqk2r/pp1n1pQp/2n1p3/3pN3/3p4/8/PPP2PPP/R1B1KB1R b KQkq - 0 10",
    solution: ["d8f6"],
    solutionSan: ["Qf6"],
    rating: 1370,
    sourceRef: "Efim Bogoljubow – Richard Reti, 1923 (PILOT_pm-la-chaine-de-pions.pgn) : proposer l'échange des Dames pour punir l'aventure de la Dame blanche.",
  },
  {
    themeId: "pm-la-chaine-de-pions",
    fen: "r3k2r/pp1b1p1p/2n1pn2/1B1p4/3p4/5N2/PPP2PPP/R1B1K2R b KQkq - 3 13",
    solution: ["f6e4"],
    solutionSan: ["Ne4"],
    rating: 1390,
    sourceRef: "Efim Bogoljubow – Richard Reti, 1923 (PILOT_pm-la-chaine-de-pions.pgn).",
  },
  {
    themeId: "pm-la-chaine-de-pions",
    fen: "r3k2r/p2b3p/2p1pp2/3p4/3Nn3/8/PPP2PPP/R1B2RK1 b kq - 0 16",
    solution: ["c6c5"],
    solutionSan: ["c5"],
    rating: 1410,
    sourceRef: "Efim Bogoljubow – Richard Reti, 1923 (PILOT_pm-la-chaine-de-pions.pgn) : Reti forme déjà un centre de pions compact après avoir démantelé la base blanche.",
  },
  {
    themeId: "pm-la-chaine-de-pions",
    fen: "r6r/p2b1k1p/3npp2/2pp4/8/1P3P2/P1P1N1PP/R1B2RK1 b - - 0 19",
    solution: ["e6e5"],
    solutionSan: ["e5"],
    rating: 1430,
    sourceRef: "Efim Bogoljubow – Richard Reti, 1923 (PILOT_pm-la-chaine-de-pions.pgn) : la nouvelle chaîne noire c5-d4-e5 commence à avancer à son tour.",
  },
  {
    themeId: "pm-la-chaine-de-pions",
    fen: "2r4r/p2b1k1p/3n1p2/2ppp3/8/BP3P2/P1P1N1PP/3R1RK1 b - - 3 21",
    solution: ["d5d4"],
    solutionSan: ["d4"],
    rating: 1450,
    sourceRef: "Efim Bogoljubow – Richard Reti, 1923 (PILOT_pm-la-chaine-de-pions.pgn) : la case noire limite le Fou blanc tout en dégageant celui de Reti.",
  },
  {
    themeId: "pm-la-chaine-de-pions",
    fen: "2r4r/p2b1k1p/5p2/2p1pn2/3p4/BP3P2/P1P2RPP/2NR2K1 b - - 3 23",
    solution: ["f5e3"],
    solutionSan: ["Ne3"],
    rating: 1470,
    sourceRef: "Efim Bogoljubow – Richard Reti, 1923 (PILOT_pm-la-chaine-de-pions.pgn) : le Cavalier s'installe sur un avant-poste créé directement par l'avance de la chaîne.",
  },
  {
    themeId: "pm-la-chaine-de-pions",
    fen: "2r4r/p2b1k1p/5p2/2p1p3/3p4/BP2nP2/P1P2RPP/2N1R1K1 b - - 5 24",
    solution: ["c5c4"],
    solutionSan: ["c4"],
    rating: 1485,
    sourceRef: "Efim Bogoljubow – Richard Reti, 1923 (PILOT_pm-la-chaine-de-pions.pgn).",
  },
  {
    themeId: "pm-la-chaine-de-pions",
    fen: "2r4r/p4k1p/5p2/4p3/bPpp4/B3nP2/P1P1RRPP/2N3K1 b - - 2 26",
    solution: ["e3d1"],
    solutionSan: ["Nd1"],
    rating: 1500,
    sourceRef: "Efim Bogoljubow – Richard Reti, 1923 (PILOT_pm-la-chaine-de-pions.pgn) : début d'une longue promenade du Cavalier à travers tout le camp blanc.",
  },
  {
    themeId: "pm-la-chaine-de-pions",
    fen: "2r4r/p4k1p/5p2/4p3/bPpp4/5P2/PBP2RPP/1nN2RK1 b - - 8 29",
    solution: ["c4c3"],
    solutionSan: ["c3"],
    rating: 1520,
    sourceRef: "Efim Bogoljubow – Richard Reti, 1923 (PILOT_pm-la-chaine-de-pions.pgn) : le coup qui donne son nom au thème — la chaîne noire avance encore d'un cran et repousse le Fou blanc jusqu'à la dernière rangée.",
  },
  {
    themeId: "pm-la-chaine-de-pions",
    fen: "2rr4/p4k1p/5p2/4p3/1P1p4/1Pp2P2/2Pn1RPP/2B1R1K1 b - - 4 33",
    solution: ["d4d3"],
    solutionSan: ["d3"],
    rating: 1535,
    sourceRef: "Efim Bogoljubow – Richard Reti, 1923 (PILOT_pm-la-chaine-de-pions.pgn) : percée au cœur de la chaîne pour obtenir un pion passé.",
  },
  {
    themeId: "pm-la-chaine-de-pions",
    fen: "2rr4/p4k1p/5p2/4p3/1P6/1PpP1P2/3n1RPP/2B1R1K1 b - - 0 34",
    solution: ["d8d3"],
    solutionSan: ["Rxd3"],
    rating: 1545,
    sourceRef: "Efim Bogoljubow – Richard Reti, 1923 (PILOT_pm-la-chaine-de-pions.pgn).",
  },
  {
    themeId: "pm-la-chaine-de-pions",
    fen: "2r5/p4k1p/5p2/4p3/1P6/1Pp2P2/3r1RPP/R5K1 b - - 1 36",
    solution: ["f7e6"],
    solutionSan: ["Ke6"],
    rating: 1555,
    sourceRef: "Efim Bogoljubow – Richard Reti, 1923 (PILOT_pm-la-chaine-de-pions.pgn).",
  },
  {
    themeId: "pm-la-chaine-de-pions",
    fen: "2r5/p6p/5p2/3kp3/1P6/1P2KP2/2p3PP/2R5 b - - 3 40",
    solution: ["c8c3"],
    solutionSan: ["Rc3+"],
    rating: 1565,
    sourceRef: "Efim Bogoljubow – Richard Reti, 1923 (PILOT_pm-la-chaine-de-pions.pgn) : la chaîne initiale, attaquée dès le 5e coup à sa base, aura fini par produire le pion passé décisif.",
  },
  // `pm-les-coups-de-rupture` : 12 exercices (2026-09-10, 3e lot au format
  // Lichess), tous tirés de la MÊME partie que le tutoriel (`COURSE_LESSONS`,
  // Pillsbury–Gunsberg, Hastings 1895 (dernière ronde), citée par Chernev
  // sous le titre « March of the little pawns », The Most Instructive Games
  // of Chess Ever Played n°50 — `data/import/academy/PILOT_pm-les-coups-de-rupture.pgn`).
  // Chaque position est un point de décision réel de la démonstration
  // classique des cinq coups de rupture consécutifs qui décident la partie,
  // rejouée et vérifiée coup par coup avec chess.js.
  {
    themeId: "pm-les-coups-de-rupture",
    fen: "rnbq1rk1/pp2ppbp/2p3p1/3nN3/2BP4/2N1P3/PP3PPP/R1BQK2R w KQ - 1 9",
    solution: ["f2f4"],
    solutionSan: ["f4"],
    rating: 1230,
    sourceRef: "Harry Nelson Pillsbury – Isidor Gunsberg, Hastings 1895 (PILOT_pm-les-coups-de-rupture.pgn).",
  },
  {
    themeId: "pm-les-coups-de-rupture",
    fen: "rn3rk1/p3ppbp/6p1/1p1pN3/3P1P2/4P3/PP4PP/R1B1K2R w KQ - 0 14",
    solution: ["e5d3"],
    solutionSan: ["Nd3"],
    rating: 1260,
    sourceRef: "Harry Nelson Pillsbury – Isidor Gunsberg, Hastings 1895 (PILOT_pm-les-coups-de-rupture.pgn).",
  },
  {
    themeId: "pm-les-coups-de-rupture",
    fen: "r1r3k1/p2nppbp/6p1/1p1p4/3P1P2/3NP3/PP1B2PP/R3K2R w KQ - 4 16",
    solution: ["e1e2"],
    solutionSan: ["Ke2"],
    rating: 1290,
    sourceRef: "Harry Nelson Pillsbury – Isidor Gunsberg, Hastings 1895 (PILOT_pm-les-coups-de-rupture.pgn).",
  },
  {
    themeId: "pm-les-coups-de-rupture",
    fen: "5k2/p2n1p1p/3bp1p1/1p1p4/3P1P2/3NP3/PP1BK1PP/8 w - - 3 22",
    solution: ["d2b4"],
    solutionSan: ["Bb4"],
    rating: 1320,
    sourceRef: "Harry Nelson Pillsbury – Isidor Gunsberg, Hastings 1895 (PILOT_pm-les-coups-de-rupture.pgn).",
  },
  {
    themeId: "pm-les-coups-de-rupture",
    fen: "8/p2nkp1p/3bp1p1/1p1p4/1B1P1P2/3NP3/PP2K1PP/8 w - - 5 23",
    solution: ["b4c5"],
    solutionSan: ["Bc5"],
    rating: 1350,
    sourceRef: "Harry Nelson Pillsbury – Isidor Gunsberg, Hastings 1895 (PILOT_pm-les-coups-de-rupture.pgn).",
  },
  {
    themeId: "pm-les-coups-de-rupture",
    fen: "8/3nkp1p/p2bp1p1/1pBp4/3P1P2/3NP3/PP2K1PP/8 w - - 0 24",
    solution: ["b2b4"],
    solutionSan: ["b4"],
    rating: 1380,
    sourceRef: "Harry Nelson Pillsbury – Isidor Gunsberg, Hastings 1895 (PILOT_pm-les-coups-de-rupture.pgn).",
  },
  {
    themeId: "pm-les-coups-de-rupture",
    fen: "1n6/4k2p/p3ppp1/1pPp4/3P1PP1/3NP3/P3K2P/8 w - - 1 27",
    solution: ["f4f5"],
    solutionSan: ["f5"],
    rating: 1410,
    sourceRef: "Harry Nelson Pillsbury – Isidor Gunsberg, Hastings 1895 (PILOT_pm-les-coups-de-rupture.pgn) : premier coup de rupture — le pion f s'ouvre un chemin vers e6.",
  },
  {
    themeId: "pm-les-coups-de-rupture",
    fen: "1n6/4k2p/p3pp2/1pPp1Pp1/3P2P1/3NP3/P3K2P/8 w - - 0 28",
    solution: ["d3b4"],
    solutionSan: ["Nb4"],
    rating: 1440,
    sourceRef: "Harry Nelson Pillsbury – Isidor Gunsberg, Hastings 1895 (PILOT_pm-les-coups-de-rupture.pgn) : le cavalier s'infiltre pour éliminer un maximum de pions.",
  },
  {
    themeId: "pm-les-coups-de-rupture",
    fen: "1n6/4k2p/4pp2/ppPp1Pp1/1N1P2P1/4P3/P3K2P/8 w - - 0 29",
    solution: ["c5c6"],
    solutionSan: ["c6"],
    rating: 1470,
    sourceRef: "Harry Nelson Pillsbury – Isidor Gunsberg, Hastings 1895 (PILOT_pm-les-coups-de-rupture.pgn) : deuxième coup de rupture — si le cavalier est pris, c7 gagne immédiatement.",
  },
  {
    themeId: "pm-les-coups-de-rupture",
    fen: "1n6/7p/2Pkpp2/pp1p1Pp1/1N1P2P1/4P3/P3K2P/8 w - - 1 30",
    solution: ["f5e6"],
    solutionSan: ["fxe6"],
    rating: 1500,
    sourceRef: "Harry Nelson Pillsbury – Isidor Gunsberg, Hastings 1895 (PILOT_pm-les-coups-de-rupture.pgn) : troisième rupture, sacrifiée sans relâche pour ouvrir des lignes vers la promotion.",
  },
  {
    themeId: "pm-les-coups-de-rupture",
    fen: "8/7p/2k1Pp2/pp1p2p1/3P2P1/4P3/P3K2P/8 w - - 0 32",
    solution: ["e3e4"],
    solutionSan: ["e4"],
    rating: 1530,
    sourceRef: "Harry Nelson Pillsbury – Isidor Gunsberg, Hastings 1895 (PILOT_pm-les-coups-de-rupture.pgn) : quatrième coup de rupture — deux pions passés connectés, le but de toute la séquence depuis le coup 27.",
  },
  {
    themeId: "pm-les-coups-de-rupture",
    fen: "8/7p/2k1Pp2/pp4p1/3Pp1P1/8/P3K2P/8 w - - 0 33",
    solution: ["d4d5"],
    solutionSan: ["d5+"],
    rating: 1560,
    sourceRef: "Harry Nelson Pillsbury – Isidor Gunsberg, Hastings 1895 (PILOT_pm-les-coups-de-rupture.pgn) : cinquième et dernier coup de rupture — le pion d, impossible à capturer, poursuit sa marche.",
  },
  // `pm-la-restriction-des-pieces-adverses` : 13 exercices (2026-09-11, 1er
  // lot du Palier Or), tirés de la partie RÉELLE Mikhail Botvinnik – Nikolay
  // Sorokin, Championnat d'URSS 1931 (étude Lichess « IM Jeremy Silman's
  // Lessons in Strategy(1) », https://lichess.org/study/e2P29Eva/SKXizPgx,
  // annotée par Jeremy Silman). Aucun fichier PILOT n'existait pour ce
  // thème : la partie a été sourcée sur le web puis rejouée et vérifiée
  // coup par coup avec chess.js. Même partie que le tutoriel
  // `COURSE_LESSONS["pm-la-restriction-des-pieces-adverses"]` (`course-lesson.ts`).
  {
    themeId: "pm-la-restriction-des-pieces-adverses",
    fen: "r1b2rk1/1p3pp1/pn3n1p/2q1p3/P3P3/2N2N2/BP1RQPPP/3R2K1 w - - 0 1",
    solution: ["e2e3"],
    solutionSan: ["Qe3"],
    rating: 1300,
    sourceRef: "Botvinnik – Sorokin, Championnat d'URSS 1931 (lichess.org/study/e2P29Eva) : 1.Qe3! propose l'échange des Dames, point de départ de toute la restriction à venir.",
  },
  {
    themeId: "pm-la-restriction-des-pieces-adverses",
    fen: "r4rk1/1p3pp1/pn3n1p/4p3/P3P1b1/2N1PN2/BP1R2PP/3R2K1 w - - 1 3",
    solution: ["a4a5"],
    solutionSan: ["a5"],
    rating: 1330,
    sourceRef: "Botvinnik – Sorokin, 1931 : 3.a5! attaque le Cavalier b6 et l'envoie sur une case passive (3...Nc8).",
  },
  {
    themeId: "pm-la-restriction-des-pieces-adverses",
    fen: "r1n2rk1/1p3pp1/p4n1p/P3p3/4P1b1/2N1PN2/BP1R2PP/3R2K1 w - - 1 4",
    solution: ["d1c1"],
    solutionSan: ["Rc1"],
    rating: 1360,
    sourceRef: "Botvinnik – Sorokin, 1931 : 4.Rc1! reprend la colonne c en sortant au passage du clouage sur d1.",
  },
  {
    themeId: "pm-la-restriction-des-pieces-adverses",
    fen: "r4rk1/1p2npp1/p4n1p/P3p3/4P3/2N1PP2/BP1R3P/2R3K1 w - - 1 6",
    solution: ["c3d5"],
    solutionSan: ["Nd5"],
    rating: 1380,
    sourceRef: "Botvinnik – Sorokin, 1931 : 6.Nd5 centralise le Cavalier et prépare Nxf6+.",
  },
  {
    themeId: "pm-la-restriction-des-pieces-adverses",
    fen: "r4rk1/1p3pp1/p1n2n1p/P2Np3/4P3/4PP2/BP1R3P/2R3K1 w - - 3 7",
    solution: ["d5f6"],
    solutionSan: ["Nxf6+"],
    rating: 1400,
    sourceRef: "Botvinnik – Sorokin, 1931 : 7.Nxf6+! abîme la structure de pions noire juste avant l'invasion de la 7e rangée.",
  },
  {
    themeId: "pm-la-restriction-des-pieces-adverses",
    fen: "r4rk1/1p3p2/p1n2p1p/P3p3/4P3/4PP2/BP1R3P/2R3K1 w - - 0 8",
    solution: ["d2d7"],
    solutionSan: ["Rd7"],
    rating: 1420,
    sourceRef: "Botvinnik – Sorokin, 1931 : 8.Rd7! — Tour à la 7e rangée, sacrifie le pion a5 pour des menaces sur b7 et f7.",
  },
  {
    themeId: "pm-la-restriction-des-pieces-adverses",
    fen: "1r3rk1/1p1R1p2/p1n2p1p/P3p3/4P3/4PP2/BP5P/2R3K1 w - - 2 9",
    solution: ["g1f2"],
    solutionSan: ["Kf2"],
    rating: 1440,
    sourceRef: "Botvinnik – Sorokin, 1931 : 9.Kf2! active le Roi et menace Rg1+, osant les Noirs à croquer le pion a5.",
  },
  {
    themeId: "pm-la-restriction-des-pieces-adverses",
    fen: "1r3rk1/1p1R1p2/p4p1p/n3p3/4P3/4PP2/BP3K1P/2R5 w - - 0 10",
    solution: ["c1c7"],
    solutionSan: ["Rcc7"],
    rating: 1460,
    sourceRef: "Botvinnik – Sorokin, 1931 : 10.Rcc7 double les Tours sur la 7e rangée, forçant pratiquement le gain du pion f7.",
  },
  {
    themeId: "pm-la-restriction-des-pieces-adverses",
    fen: "5r1k/1pR5/p4p1p/n3p3/4P3/4PP2/BP3K1P/8 w - - 1 13",
    solution: ["a2d5"],
    solutionSan: ["Bd5"],
    rating: 1480,
    sourceRef: "Botvinnik – Sorokin, 1931 : 13.Bd5! — la case la plus imposante pour le Fou, ferme à jamais la colonne d à la Tour noire.",
  },
  {
    themeId: "pm-la-restriction-des-pieces-adverses",
    fen: "5r1k/2R5/p4p1p/np1Bp3/4P3/4PP2/1P3K1P/8 w - - 0 14",
    solution: ["b2b3"],
    solutionSan: ["b3"],
    rating: 1500,
    sourceRef: "Botvinnik – Sorokin, 1931 : 14.b3! LE coup du thème — le Cavalier noir reste bloqué sur a5 jusqu'à la fin de la partie.",
  },
  {
    themeId: "pm-la-restriction-des-pieces-adverses",
    fen: "3r3k/2R5/p4p1p/np1Bp3/4P3/1P2PP2/5K1P/8 w - - 1 15",
    solution: ["f2g3"],
    solutionSan: ["Kg3"],
    rating: 1520,
    sourceRef: "Botvinnik – Sorokin, 1931 : 15.Kg3 — après la Tour et le Fou, c'est au tour du Roi blanc d'entrer en jeu.",
  },
  {
    themeId: "pm-la-restriction-des-pieces-adverses",
    fen: "7k/2R5/p2r3p/np1Bp3/4P2K/1P2P3/7P/8 w - - 1 18",
    solution: ["h4h5"],
    solutionSan: ["Kh5"],
    rating: 1540,
    sourceRef: "Botvinnik – Sorokin, 1931 : 18.Kh5 — le Roi blanc vise h6 pendant que le Cavalier noir reste totalement hors-jeu.",
  },
  {
    themeId: "pm-la-restriction-des-pieces-adverses",
    fen: "7k/R7/pr5p/np1Bp3/4P1KP/1P2P3/8/8 w - - 5 23",
    solution: ["a7e7"],
    solutionSan: ["Re7"],
    rating: 1580,
    sourceRef: "Botvinnik – Sorokin, 1931 : 23.Re7! décisif — 23...Nc6 est impossible à cause de 24.Re6 qui gagne le Cavalier ; les Noirs abandonnent, leur Cavalier n'ayant jamais quitté a5 depuis le coup 14.",
  },
  // `pm-la-surprotection-nimzowitsch` : 14 exercices (2026-09-11, 1er lot du
  // Palier Or), tirés de la partie RÉELLE Aron Nimzowitsch – Georg Salwe,
  // Karlsbad 1911, dite « Overprotection Racket »
  // (chessgames.com/perl/chessgame?gid=1000795, confirmée via
  // chessbox.in/chessgame/nimzowitsch-aaron-salwe-georg-3). Aucun fichier
  // PILOT n'existait pour ce thème : la partie a été sourcée sur le web puis
  // rejouée et vérifiée coup par coup avec chess.js. Même partie que le
  // tutoriel `COURSE_LESSONS["pm-la-surprotection-nimzowitsch"]`.
  {
    themeId: "pm-la-surprotection-nimzowitsch",
    fen: "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
    solution: ["e4e5"],
    solutionSan: ["e5"],
    rating: 1300,
    sourceRef: "Nimzowitsch – Salwe, Karlsbad 1911 « Overprotection Racket » (chessgames.com/perl/chessgame?gid=1000795) : 3.e5 plante la pointe de pion qui sera sur-protégée toute la partie.",
  },
  {
    themeId: "pm-la-surprotection-nimzowitsch",
    fen: "r3kbnr/pp1b1ppp/1qn1p3/2ppP3/3P4/2PB1N2/PP3PPP/RNBQK2R w KQkq - 5 7",
    solution: ["d4c5"],
    solutionSan: ["dxc5"],
    rating: 1325,
    sourceRef: "Nimzowitsch – Salwe, 1911 : 7.dxc5 ouvre la diagonale du Fou noir mais laisse e5 comme unique atout central blanc.",
  },
  {
    themeId: "pm-la-surprotection-nimzowitsch",
    fen: "r3k1nr/pp1bb1pp/1qn1pp2/3pP3/1P6/2PB1N2/P4PPP/RNBQ1RK1 w kq - 1 10",
    solution: ["c1f4"],
    solutionSan: ["Bf4"],
    rating: 1350,
    sourceRef: "Nimzowitsch – Salwe, 1911 : 10.Bf4! renforce e5 avant même que le pion ne soit attaqué — le réflexe de surprotection.",
  },
  {
    themeId: "pm-la-surprotection-nimzowitsch",
    fen: "r3k1nr/pp1bb1pp/1qn1p3/3pp3/1P3B2/2PB1N2/P4PPP/RN1Q1RK1 w kq - 0 11",
    solution: ["f3e5"],
    solutionSan: ["Nxe5"],
    rating: 1375,
    sourceRef: "Nimzowitsch – Salwe, 1911 : 11.Nxe5, première occupation de la case e5.",
  },
  {
    themeId: "pm-la-surprotection-nimzowitsch",
    fen: "r3k1nr/pp1bb1pp/1q2p3/3pn3/1P3B2/2PB4/P4PPP/RN1Q1RK1 w kq - 0 12",
    solution: ["f4e5"],
    solutionSan: ["Bxe5"],
    rating: 1400,
    sourceRef: "Nimzowitsch – Salwe, 1911 : 12.Bxe5 recapture et garde une pièce ancrée sur e5.",
  },
  {
    themeId: "pm-la-surprotection-nimzowitsch",
    fen: "2r2rk1/pp1b2pp/1q1bpn2/3pB3/1P6/2PB1N2/P3QPPP/R4RK1 w - - 7 16",
    solution: ["e5d4"],
    solutionSan: ["Bd4"],
    rating: 1425,
    sourceRef: "Nimzowitsch – Salwe, 1911 : 16.Bd4, le Fou recule mais garde le contrôle de la grande diagonale centrale.",
  },
  {
    themeId: "pm-la-surprotection-nimzowitsch",
    fen: "2r2rk1/ppqb2pp/3bpn2/3p4/1P1B4/2PB1N2/P3QPPP/R4RK1 w - - 9 17",
    solution: ["f3e5"],
    solutionSan: ["Ne5"],
    rating: 1450,
    sourceRef: "Nimzowitsch – Salwe, 1911 : 17.Ne5!, le Cavalier revient occuper la case e5 une seconde fois.",
  },
  {
    themeId: "pm-la-surprotection-nimzowitsch",
    fen: "2r1brk1/ppq3pp/3bpn2/3pN3/1P1B4/2PB4/P3QPPP/R4RK1 w - - 11 18",
    solution: ["a1e1"],
    solutionSan: ["Rae1"],
    rating: 1475,
    sourceRef: "Nimzowitsch – Salwe, 1911 : 18.Rae1! — la Tour vient sur-protéger une case déjà défendue deux fois : la définition même de la surprotection.",
  },
  {
    themeId: "pm-la-surprotection-nimzowitsch",
    fen: "2r1brk1/ppq3pp/4pn2/3pb3/1P1B4/2PB4/P3QPPP/4RRK1 w - - 0 19",
    solution: ["d4e5"],
    solutionSan: ["Bxe5"],
    rating: 1500,
    sourceRef: "Nimzowitsch – Salwe, 1911 : 19.Bxe5, la case reste occupée et soutenue par la Tour e1 après l'échange.",
  },
  {
    themeId: "pm-la-surprotection-nimzowitsch",
    fen: "2r2rk1/pp1b2pp/2q1pn2/3p4/1P1B4/2PB4/P3QPPP/4RRK1 w - - 3 21",
    solution: ["e2c2"],
    solutionSan: ["Qc2"],
    rating: 1525,
    sourceRef: "Nimzowitsch – Salwe, 1911 : 21.Qc2, regroupement avant le basculement des pièces vers l'aile Roi noire.",
  },
  {
    themeId: "pm-la-surprotection-nimzowitsch",
    fen: "2r4k/p2b1rpp/1pq1pn2/3p4/1P1B4/2PB2R1/P1Q2PPP/5RK1 w - - 2 24",
    solution: ["d3h7"],
    solutionSan: ["Bxh7"],
    rating: 1550,
    sourceRef: "Nimzowitsch – Salwe, 1911 : 24.Bxh7! sacrifie un pion pour arracher l'abri du Roi noir — la récompense de la surprotection de e5.",
  },
  {
    themeId: "pm-la-surprotection-nimzowitsch",
    fen: "2r4k/p2b1rpB/1pq2n2/3pp3/1P1B4/2P3R1/P1Q2PPP/5RK1 w - - 0 25",
    solution: ["h7g6"],
    solutionSan: ["Bg6"],
    rating: 1575,
    sourceRef: "Nimzowitsch – Salwe, 1911 : 25.Bg6! maintient l'étau sur le Roi noir.",
  },
  {
    themeId: "pm-la-surprotection-nimzowitsch",
    fen: "2r4k/p2br1p1/1p1q1nB1/4p3/1P1p4/2P1B1R1/P1Q2PPP/4R1K1 w - - 0 28",
    solution: ["e3g5"],
    solutionSan: ["Bg5"],
    rating: 1600,
    sourceRef: "Nimzowitsch – Salwe, 1911 : 28.Bg5! attaque la Tour c8 clouée sur la Dame et gagne la qualité.",
  },
  {
    themeId: "pm-la-surprotection-nimzowitsch",
    fen: "7k/p2br1p1/1p1q1nB1/4p1B1/1P6/2p5/P1Q2PPP/4R1K1 w - - 0 30",
    solution: ["c2c3"],
    solutionSan: ["Qxc3"],
    rating: 1625,
    sourceRef: "Nimzowitsch – Salwe, 1911 : 30.Qxc3 récupère le matériel — position gagnante pour les Blancs, grâce à l'activité acquise depuis la surprotection de e5.",
  },
  // `pm-le-blocus-du-pion-passe` : 13 exercices (2026-09-11, 1er lot du
  // Palier Or), tirés de la partie RÉELLE Friedrich Sämisch – Aron
  // Nimzowitsch, Copenhague 1923, « The Immortal Zugzwang Game »
  // (en.wikipedia.org/wiki/Immortal_Zugzwang_Game). Aucun fichier PILOT
  // n'existait pour ce thème : la partie a été sourcée sur le web puis
  // rejouée et vérifiée coup par coup avec chess.js. Même partie que le
  // tutoriel `COURSE_LESSONS["pm-le-blocus-du-pion-passe"]`.
  {
    themeId: "pm-le-blocus-du-pion-passe",
    fen: "rn1q1rk1/pbppbppp/1p2pn2/8/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 5 7",
    solution: ["e1g1"],
    solutionSan: ["O-O"],
    rating: 1300,
    sourceRef: "Sämisch – Nimzowitsch, Copenhague 1923 « The Immortal Zugzwang Game » (en.wikipedia.org/wiki/Immortal_Zugzwang_Game) : 7.O-O, mise en place avant la rupture centrale ...d5.",
  },
  {
    themeId: "pm-le-blocus-du-pion-passe",
    fen: "rn1q1rk1/pbp1bppp/1p2pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
    solution: ["f3e5"],
    solutionSan: ["Ne5"],
    rating: 1325,
    sourceRef: "Sämisch – Nimzowitsch, 1923 : 8.Ne5, avant-poste central qui prépare la prise cxd5.",
  },
  {
    themeId: "pm-le-blocus-du-pion-passe",
    fen: "rn1q1rk1/pb2bppp/1pp1pn2/3pN3/2PP4/2N3P1/PP2PPBP/R1BQ1RK1 w - - 0 9",
    solution: ["c4d5"],
    solutionSan: ["cxd5"],
    rating: 1350,
    sourceRef: "Sämisch – Nimzowitsch, 1923 : 9.cxd5, fixe la structure centrale — rien n'indique encore le pion passé à venir.",
  },
  {
    themeId: "pm-le-blocus-du-pion-passe",
    fen: "rn1q1rk1/1b2bppp/pp2pn2/3pN3/3P1B2/2N3P1/PP2PPBP/R2Q1RK1 w - - 0 11",
    solution: ["a1c1"],
    solutionSan: ["Rc1"],
    rating: 1375,
    sourceRef: "Sämisch – Nimzowitsch, 1923 : 11.Rc1, préparation à l'aile Dame.",
  },
  {
    themeId: "pm-le-blocus-du-pion-passe",
    fen: "r2q1rk1/1b2bppp/p1n1pn2/1p1pN3/3P1B2/1QN3P1/PP2PPBP/2R2RK1 w - - 2 13",
    solution: ["e5c6"],
    solutionSan: ["Nxc6"],
    rating: 1400,
    sourceRef: "Sämisch – Nimzowitsch, 1923 : 13.Nxc6, échange qui simplifie avant la bataille à venir sur l'aile Roi.",
  },
  {
    themeId: "pm-le-blocus-du-pion-passe",
    fen: "r4rk1/3qbppp/p1b1pn2/1p1p4/3P1B2/1QN3PP/PP2PPB1/2R2RK1 w - - 1 15",
    solution: ["g1h2"],
    solutionSan: ["Kh2"],
    rating: 1425,
    sourceRef: "Sämisch – Nimzowitsch, 1923 : 15.Kh2 met le Roi blanc à l'abri avant les complications à venir.",
  },
  {
    themeId: "pm-le-blocus-du-pion-passe",
    fen: "r4rk1/3qb1pp/p1b1p3/1p1p1p1n/3P4/1QN3PP/PP1BPPBK/2R2R2 w - - 0 17",
    solution: ["b3d1"],
    solutionSan: ["Qd1"],
    rating: 1450,
    sourceRef: "Sämisch – Nimzowitsch, 1923 : 17.Qd1, retraite prudente de la Dame.",
  },
  {
    themeId: "pm-le-blocus-du-pion-passe",
    fen: "r4rk1/3q2pp/p2bp3/1b1p1p1n/1p1P4/6PP/PP1BPPBK/1NRQ2R1 w - - 4 20",
    solution: ["e2e4"],
    solutionSan: ["e4"],
    rating: 1475,
    sourceRef: "Sämisch – Nimzowitsch, 1923 : 20.e4?!, la tentative de contre-jeu qui va, sans le savoir encore, préparer le futur pion passé noir.",
  },
  {
    themeId: "pm-le-blocus-du-pion-passe",
    fen: "r4rk1/3q2pp/p2bp3/1b1p1p1n/1p1PP3/6PP/PP1B1PBK/1NRQ2R1 b - - 0 20",
    solution: ["f5e4"],
    solutionSan: ["fxe4"],
    rating: 1500,
    sourceRef: "Sämisch – Nimzowitsch, 1923 : 20...fxe4 récupère la tension centrale.",
  },
  {
    themeId: "pm-le-blocus-du-pion-passe",
    fen: "r4rk1/3q2pp/p2bp3/1b1p3n/1p1Pp3/6PP/PP1B1PBK/1NRQ2R1 w - - 0 21",
    solution: ["d1h5"],
    solutionSan: ["Qxh5"],
    rating: 1525,
    sourceRef: "Sämisch – Nimzowitsch, 1923 : 21.Qxh5 regagne la pièce, mais ouvre la voie au sacrifice décisif suivant.",
  },
  {
    themeId: "pm-le-blocus-du-pion-passe",
    fen: "r4rk1/3q2pp/p2bp3/1b1p3Q/1p1Pp3/6PP/PP1B1PBK/1NR3R1 b - - 0 21",
    solution: ["f8f2"],
    solutionSan: ["Rxf2"],
    rating: 1550,
    sourceRef: "Sämisch – Nimzowitsch, 1923 : 21...Rxf2!! supprime le seul pion blanc capable d'arrêter e4 — le pion passé noir vient de naître.",
  },
  {
    themeId: "pm-le-blocus-du-pion-passe",
    fen: "6k1/3q2pp/p2bp3/1b1p1rQ1/1p1Pp3/6PP/PP1B1rB1/1NR3RK w - - 4 24",
    solution: ["g5e3"],
    solutionSan: ["Qe3"],
    rating: 1575,
    sourceRef: "Sämisch – Nimzowitsch, 1923 : 24.Qe3! bloque le pion passé e4 avec la pièce la plus mal adaptée à cette tâche — signe d'une position déjà désespérée.",
  },
  {
    themeId: "pm-le-blocus-du-pion-passe",
    fen: "6k1/3q2pp/p2bp3/1b1p1r2/1p1Pp3/4Q1PP/PP1B1rB1/1NR3RK b - - 5 24",
    solution: ["b5d3"],
    solutionSan: ["Bd3"],
    rating: 1600,
    sourceRef: "Sämisch – Nimzowitsch, 1923 : 24...Bd3! chasse la bloqueuse et prépare le zugzwang final (25...h6) qui a donné son nom à la partie.",
  },
  // `pm-la-centralisation-des-pieces` : 15 exercices (2026-09-10), tirés de
  // trois chapitres réels de l'étude Lichess « Centralizing the pieces » de
  // Gurujit/aramsamsam (https://lichess.org/study/yhXzfSss, export PGN
  // officiel `https://lichess.org/api/study/yhXzfSss.pgn`) : le Roi qui se
  // centralise en finale de Tours (chapitre « 8.1 »), la Dame qui se
  // centralise pour attaquer deux faiblesses à la fois (chapitre « 8.4 »),
  // et une partie réelle complète où le Cavalier centralisé en e5 lance
  // l'attaque de mat (chapitre « Kapitel 6 »). Même source que les 6
  // premiers chapitres (tutoriel) de `COURSE_LESSONS["pm-la-centralisation-des-pieces"]`
  // (`course-lesson.ts`). Chaque position rejouée et vérifiée coup par coup
  // avec chess.js.
  {
    themeId: "pm-la-centralisation-des-pieces",
    fen: "3r4/1r3kp1/b4p2/p2p4/3b1P2/3P1BP1/P1R2NK1/3R4 b - - 0 1",
    solution: ["b7b2"],
    solutionSan: ["Rb2"],
    rating: 1300,
    sourceRef: "Étude Lichess « Centralizing the pieces », chapitre 8.1 (lichess.org/study/yhXzfSss) : échanger les Tours pour libérer le Roi.",
  },
  {
    themeId: "pm-la-centralisation-des-pieces",
    fen: "3r4/5kp1/b4p2/p2p4/3b1P2/3P1BP1/PR3NK1/3R4 b - - 0 2",
    solution: ["d4b2"],
    solutionSan: ["Bxb2"],
    rating: 1320,
    sourceRef: "Étude Lichess « Centralizing the pieces », chapitre 8.1 (lichess.org/study/yhXzfSss).",
  },
  {
    themeId: "pm-la-centralisation-des-pieces",
    fen: "3r4/5kp1/b4p2/p2p4/3b1P2/3P1BPN/P2R2K1/8 b - - 3 4",
    solution: ["f7e6"],
    solutionSan: ["Ke6"],
    rating: 1340,
    sourceRef: "Étude Lichess « Centralizing the pieces », chapitre 8.1 (lichess.org/study/yhXzfSss) : sans plus de Tours à défendre, le Roi noir fonce vers le centre.",
  },
  {
    themeId: "pm-la-centralisation-des-pieces",
    fen: "3r4/6p1/b3kp2/p2p4/3b1P2/3P1BPN/P1R3K1/8 b - - 5 5",
    solution: ["e6d6"],
    solutionSan: ["Kd6"],
    rating: 1350,
    sourceRef: "Étude Lichess « Centralizing the pieces », chapitre 8.1 (lichess.org/study/yhXzfSss).",
  },
  {
    themeId: "pm-la-centralisation-des-pieces",
    fen: "2r5/6p1/b2k1p2/p2p1P2/3b4/3P2PN/P1R3K1/3B4 b - - 2 7",
    solution: ["c8c2"],
    solutionSan: ["Rxc2+"],
    rating: 1400,
    sourceRef: "Étude Lichess « Centralizing the pieces », chapitre 8.1 (lichess.org/study/yhXzfSss).",
  },
  {
    themeId: "pm-la-centralisation-des-pieces",
    fen: "8/6p1/b2k1p2/p2p1P2/3b4/3P2PN/P1B3K1/8 b - - 0 8",
    solution: ["d6e5"],
    solutionSan: ["Ke5"],
    rating: 1420,
    sourceRef: "Étude Lichess « Centralizing the pieces », chapitre 8.1 (lichess.org/study/yhXzfSss) : le Roi noir poursuit sa centralisation.",
  },
  {
    themeId: "pm-la-centralisation-des-pieces",
    fen: "8/6p1/b4p2/p2pkP2/6P1/3PbK1N/P1B5/8 b - - 2 10",
    solution: ["e5d4"],
    solutionSan: ["Kd4"],
    rating: 1440,
    sourceRef: "Étude Lichess « Centralizing the pieces », chapitre 8.1 (lichess.org/study/yhXzfSss) : le Roi achève sa centralisation, prêt à décider la finale.",
  },
  {
    themeId: "pm-la-centralisation-des-pieces",
    fen: "8/p2B3k/1p6/1P6/7K/6Q1/6p1/5q2 w - - 0 1",
    solution: ["g3e5"],
    solutionSan: ["Qe5"],
    rating: 1360,
    sourceRef: "Étude Lichess « Centralizing the pieces », chapitre 8.3 (lichess.org/study/yhXzfSss) : centraliser la Dame — un maximum de cases contrôlées.",
  },
  {
    themeId: "pm-la-centralisation-des-pieces",
    fen: "4r2k/7p/2q5/2p1pQ2/8/P7/6PP/2R4K w - - 0 1",
    solution: ["f5h5"],
    solutionSan: ["Qh5"],
    rating: 1450,
    sourceRef: "Étude Lichess « Centralizing the pieces », chapitre 8.4 (lichess.org/study/yhXzfSss) : une Dame centralisée peut basculer d'une faiblesse à l'autre.",
  },
  {
    themeId: "pm-la-centralisation-des-pieces",
    fen: "8/4r1kp/6q1/2p1p3/8/P4Q2/6PP/3R3K w - - 6 4",
    solution: ["f3d5"],
    solutionSan: ["Qd5"],
    rating: 1470,
    sourceRef: "Étude Lichess « Centralizing the pieces », chapitre 8.4 (lichess.org/study/yhXzfSss) : recentraliser pour attaquer c5 ET e5 à la fois.",
  },
  {
    themeId: "pm-la-centralisation-des-pieces",
    fen: "7k/4rq1p/8/2pQp3/8/P5R1/6PP/7K w - - 12 7",
    solution: ["d5c5"],
    solutionSan: ["Qxc5"],
    rating: 1490,
    sourceRef: "Étude Lichess « Centralizing the pieces », chapitre 8.4 (lichess.org/study/yhXzfSss) : la Dame centralisée récolte enfin l'une des deux faiblesses.",
  },
  {
    themeId: "pm-la-centralisation-des-pieces",
    fen: "r2q1rk1/1b1nbppp/pp3n2/3pN1B1/2pP1P2/2N1P3/PPB3PP/R2Q1RK1 w q - 0 5",
    solution: ["d1f3"],
    solutionSan: ["Qf3"],
    rating: 1500,
    sourceRef: "Étude Lichess « Centralizing the pieces », chapitre « Kapitel 6 » (lichess.org/study/yhXzfSss) : le Cavalier blanc, déjà centralisé en e5, est rejoint par une Dame qui contrôle e4.",
  },
  {
    themeId: "pm-la-centralisation-des-pieces",
    fen: "r4rk1/1b1qbp2/p4np1/3p2B1/2pP3Q/2p1P3/PPB3PP/R4RK1 w q - 0 11",
    solution: ["f1f6"],
    solutionSan: ["Rxf6"],
    rating: 1560,
    sourceRef: "Étude Lichess « Centralizing the pieces », chapitre « Kapitel 6 » (lichess.org/study/yhXzfSss) : le Cavalier centralisé en e5 et le Fou en g5 rendent ce sacrifice de qualité décisif.",
  },
  {
    themeId: "pm-la-centralisation-des-pieces",
    fen: "5rk1/1b1qbp2/r4Rp1/p2p2B1/2pP3Q/2p1P3/PPB3PP/5RK1 w - - 2 13",
    solution: ["c2g6"],
    solutionSan: ["Bxg6"],
    rating: 1580,
    sourceRef: "Étude Lichess « Centralizing the pieces », chapitre « Kapitel 6 » (lichess.org/study/yhXzfSss).",
  },
  {
    themeId: "pm-la-centralisation-des-pieces",
    fen: "8/1b1q3Q/r3k1p1/p2p2B1/2pP4/2p1P3/PP4PP/6K1 w - - 4 18",
    solution: ["h7g6"],
    solutionSan: ["Qxg6#"],
    rating: 1600,
    sourceRef: "Étude Lichess « Centralizing the pieces », chapitre « Kapitel 6 » (lichess.org/study/yhXzfSss) : mat livré par la Dame, dernière pièce blanche à converger vers le Roi noir depuis le centre.",
  },
  // `jh-module-1-structures-de-pions-symetriques` : 15 puzzles (2026-09-11,
  // premier chantier du cursus Jesper Hall, aucun fichier PILOT disponible),
  // tirés de la même partie réelle que le tutoriel
  // `COURSE_LESSONS["jh-module-1-structures-de-pions-symetriques"]`
  // (`course-lesson.ts`) : Akiba Rubinstein – Georg Salwe, Lodz 1908, « The
  // Backward Pawn » (chessgames.com/perl/chessgame?gid=1119705, confirmée
  // par chess.com/lessons/silmans-lessons-in-strategy-2/rubinstein-salwe-
  // lodz-1908). Les 15 positions couvrent la fin du milieu de partie et la
  // finale (coups 17 à 38), depuis la simplification Bxe7 jusqu'à la marche
  // du pion b vers la promotion qui force l'abandon noir — chaque FEN et
  // chaque solution rejouées et vérifiées avec chess.js depuis la partie
  // intégrale (75 demi-coups), aucune variante RAV impliquée.
  {
    themeId: "jh-module-1-structures-de-pions-symetriques",
    fen: "r3r1k1/p2nbppp/2p1b3/1qBp4/N7/5PP1/PP2PRBP/2RQ2K1 w - - 5 17",
    solution: ["c5e7", "e8e7"],
    solutionSan: ["Bxe7", "Rxe7"],
    rating: 1480,
    sourceRef: "Rubinstein – Salwe, Lodz 1908 « The Backward Pawn » (chessgames.com/perl/chessgame?gid=1119705) : 17.Bxe7 simplifie vers une position où les faiblesses noires de la colonne c vont peser de plus en plus lourd.",
  },
  {
    themeId: "jh-module-1-structures-de-pions-symetriques",
    fen: "r5k1/p2nrppp/2p1b3/1q1p4/N7/5PP1/PP2PRBP/2RQ2K1 w - - 0 18",
    solution: ["d1d4"],
    solutionSan: ["Qd4"],
    rating: 1460,
    sourceRef: "Rubinstein – Salwe, 1908 : 18.Qd4 centralise la Dame blanche sur la grande diagonale, visant déjà a7 et le pion isolé d5.",
  },
  {
    themeId: "jh-module-1-structures-de-pions-symetriques",
    fen: "r3r1k1/p2n1ppp/2p1b3/1q1p4/N2Q4/5PP1/PP2PRBP/2R3K1 w - - 2 19",
    solution: ["g2f1"],
    solutionSan: ["Bf1"],
    rating: 1440,
    sourceRef: "Rubinstein – Salwe, 1908 : 19.Bf1 replie le Fou sur une diagonale plus utile, libérant la case g2 et préparant e3-Nc5.",
  },
  {
    themeId: "jh-module-1-structures-de-pions-symetriques",
    fen: "r1r3k1/p2n1ppp/2p1b3/1q1p4/N2Q4/5PP1/PP2PR1P/2R2BK1 w - - 4 20",
    solution: ["e2e3", "b5b7"],
    solutionSan: ["e3", "Qb7"],
    rating: 1450,
    sourceRef: "Rubinstein – Salwe, 1908 : 20.e3 prépare tranquillement le saut Nc5, sans jamais relâcher la pression sur la colonne c.",
  },
  {
    themeId: "jh-module-1-structures-de-pions-symetriques",
    fen: "r1r3k1/pq1n1ppp/2p1b3/3p4/N2Q4/4PPP1/PP3R1P/2R2BK1 w - - 1 21",
    solution: ["a4c5", "d7c5", "c1c5"],
    solutionSan: ["Nc5", "Nxc5", "Rxc5"],
    rating: 1520,
    sourceRef: "Rubinstein – Salwe, 1908 : 21.Nc5! force l'échange et recentralise la Tour blanche sur c5, juste devant les deux cibles noires c6 et d5.",
  },
  {
    themeId: "jh-module-1-structures-de-pions-symetriques",
    fen: "r5k1/pqr2ppp/2p1b3/2Rp4/3Q4/4PPP1/PP3R1P/5BK1 w - - 1 23",
    solution: ["f2c2", "b7b6"],
    solutionSan: ["Rfc2", "Qb6"],
    rating: 1470,
    sourceRef: "Rubinstein – Salwe, 1908 : 23.Rfc2 double les Tours sur la colonne c — trois pièces lourdes blanches convergent désormais vers c6 et d5.",
  },
  {
    themeId: "jh-module-1-structures-de-pions-symetriques",
    fen: "r5k1/p1r2ppp/1qp1b3/2Rp4/3Q4/4PPP1/PPR4P/5BK1 w - - 3 24",
    solution: ["b2b4", "a7a6"],
    solutionSan: ["b4", "a6"],
    rating: 1460,
    sourceRef: "Rubinstein – Salwe, 1908 : 24.b4 gagne de l'espace à l'aile dame et prépare le prochain coup, Ra5.",
  },
  {
    themeId: "jh-module-1-structures-de-pions-symetriques",
    fen: "r5k1/2r2ppp/pqp1b3/2Rp4/1P1Q4/4PPP1/P1R4P/5BK1 w - - 0 25",
    solution: ["c5a5", "a8b8"],
    solutionSan: ["Ra5", "Rb8"],
    rating: 1500,
    sourceRef: "Rubinstein – Salwe, 1908 : 25.Ra5 lance la Tour à l'assaut du pion a6, tout en libérant la case c5 pour la seconde Tour.",
  },
  {
    themeId: "jh-module-1-structures-de-pions-symetriques",
    fen: "1r4k1/r4ppp/pqp1b3/R2p4/1P1Q4/P3PPP1/2R4P/5BK1 w - - 1 27",
    solution: ["c2c6", "b6c6", "d4a7"],
    solutionSan: ["Rxc6", "Qxc6", "Qxa7"],
    rating: 1580,
    sourceRef: "Rubinstein – Salwe, 1908 : 27.Rxc6! élimine le pion arriéré, puis 28.Qxa7 ramasse aussi l'autre faiblesse — le principe des deux faiblesses illustré d'un seul coup.",
  },
  {
    themeId: "jh-module-1-structures-de-pions-symetriques",
    fen: "r5k1/Q4ppp/p1q1b3/R2p4/1P6/P3PPP1/7P/5BK1 w - - 1 29",
    solution: ["a7c5", "c6b7"],
    solutionSan: ["Qc5", "Qb7"],
    rating: 1500,
    sourceRef: "Rubinstein – Salwe, 1908 : 29.Qc5 recentralise la Dame après le gain de pion, maintenant le Roi et le pion d5 noirs sous pression constante.",
  },
  {
    themeId: "jh-module-1-structures-de-pions-symetriques",
    fen: "r5k1/1q3p2/p3b1p1/R1Qp3p/1P6/P3PPP1/4BK1P/8 w - - 0 32",
    solution: ["c5d6", "b7c8"],
    solutionSan: ["Qd6", "Qc8"],
    rating: 1540,
    sourceRef: "Rubinstein – Salwe, 1908 : 32.Qd6 pénètre au plus profond du camp noir, clouant la Dame adverse à la défense de la 8e rangée.",
  },
  {
    themeId: "jh-module-1-structures-de-pions-symetriques",
    fen: "r5k1/1q3p2/3Qb1p1/p1Rp3p/1P5P/P3PPP1/4BK2/8 w - - 0 35",
    solution: ["c5c7", "b7b8"],
    solutionSan: ["Rc7", "Qb8"],
    rating: 1560,
    sourceRef: "Rubinstein – Salwe, 1908 : 35.Rc7 envahit la 7e rangée — les pièces noires n'ont plus aucun coup actif disponible.",
  },
  {
    themeId: "jh-module-1-structures-de-pions-symetriques",
    fen: "rq4k1/2R2p2/3Qb1p1/p2p3p/1P5P/P3PPP1/4BK2/8 w - - 2 36",
    solution: ["b4b5", "a5a4"],
    solutionSan: ["b5", "a4"],
    rating: 1490,
    sourceRef: "Rubinstein – Salwe, 1908 : 36.b5 lance la marche du pion passé, soutenu par la Dame et la Tour déjà en position dominante.",
  },
  {
    themeId: "jh-module-1-structures-de-pions-symetriques",
    fen: "rq4k1/2R2p2/3Qb1p1/1P1p3p/p6P/P3PPP1/4BK2/8 w - - 0 37",
    solution: ["b5b6", "a8a5"],
    solutionSan: ["b6", "Ra5"],
    rating: 1500,
    sourceRef: "Rubinstein – Salwe, 1908 : 37.b6 rapproche encore le pion de la promotion — Noir ne peut plus que regarder.",
  },
  {
    themeId: "jh-module-1-structures-de-pions-symetriques",
    fen: "1q4k1/2R2p2/1P1Qb1p1/r2p3p/p6P/P3PPP1/4BK2/8 w - - 1 38",
    solution: ["b6b7"],
    solutionSan: ["b7"],
    rating: 1450,
    sourceRef: "Rubinstein – Salwe, 1908 : 38.b7, dernier coup de la partie — la promotion est désormais inévitable et Salwe abandonne, une structure 100% symétrique au coup 4 entièrement domptée par l'activité des pièces blanches.",
  },
  {
    themeId: "jh-module-2-jouer-contre-l-isolani",
    fen: "rnbq1rk1/pp3ppp/4pn2/8/1bBp4/2N1PN2/PP3PPP/R1BQ1RK1 w - - 0 9",
    solution: ["e3d4"],
    solutionSan: ["exd4"],
    rating: 1280,
    sourceRef: "Portisch – Karpov, Milan 1975 (9.exd4) : le seul coup qui accepte l'isolani — Nxd4 aurait juste échangé les cavaliers sans le créer.",
  },
  {
    themeId: "jh-module-2-jouer-contre-l-isolani",
    fen: "2rq1rk1/pb2bppp/1pn1pn2/6B1/2BP4/P1NQ1N2/1P3PPP/2RR2K1 b - - 4 14",
    solution: ["f6d5"],
    solutionSan: ["Nd5"],
    rating: 1330,
    sourceRef: "Portisch – Karpov, Milan 1975 (14...Nd5) : le cavalier se poste exactement devant le pion isolé — la case de blocus par excellence.",
  },
  {
    themeId: "jh-module-2-jouer-contre-l-isolani",
    fen: "2rq1rk1/pb2bppp/1pn1p3/3n2B1/2BP4/P1NQ1N2/1P3PPP/2RR2K1 w - - 5 15",
    solution: ["c4d5"],
    solutionSan: ["Bxd5"],
    rating: 1370,
    sourceRef: "Portisch – Karpov, Milan 1975 (15.Bxd5) : le possesseur de l'isolani ne peut pas tolérer un blocus éternel, il échange le bloqueur.",
  },
  {
    themeId: "jh-module-2-jouer-contre-l-isolani",
    fen: "2rq1rk1/pb2bppp/1pn1p3/3B2B1/3P4/P1NQ1N2/1P3PPP/2RR2K1 b - - 0 15",
    solution: ["e7g5", "f3g5", "d8g5"],
    solutionSan: ["Bxg5", "Nxg5", "Qxg5"],
    rating: 1410,
    sourceRef: "Portisch – Karpov, Milan 1975 (15...Bxg5 16.Nxg5 Qxg5) : la cascade d'échanges de pièces mineures qui suit le retrait du blocus.",
  },
  {
    themeId: "jh-module-2-jouer-contre-l-isolani",
    fen: "2rr2k1/pb3pp1/1pn1p2p/6q1/3PB3/P1N1Q3/1P3PPP/2RR2K1 w - - 2 19",
    solution: ["e3g5", "h6g5"],
    solutionSan: ["Qxg5", "hxg5"],
    rating: 1440,
    sourceRef: "Portisch – Karpov, Milan 1975 (19.Qxg5 hxg5) : l'échange des dames — une concession du camp qui possède l'isolani.",
  },
  {
    themeId: "jh-module-2-jouer-contre-l-isolani",
    fen: "2rr2k1/pb3pp1/1pn1p3/6p1/3PB3/P1N5/1P3PPP/2RR2K1 w - - 0 20",
    solution: ["d4d5"],
    solutionSan: ["d5"],
    rating: 1470,
    sourceRef: "Portisch – Karpov, Milan 1975 (20.d5) : la percée centrale, dernière arme dynamique du pion isolé.",
  },
  {
    themeId: "jh-module-2-jouer-contre-l-isolani",
    fen: "2rr2k1/pb3pp1/1pn1p3/3P2p1/4B3/P1N5/1P3PPP/2RR2K1 b - - 0 20",
    solution: ["e6d5", "d1d5", "d8d5", "e4d5"],
    solutionSan: ["exd5", "Rxd5", "Rxd5", "Bxd5"],
    rating: 1500,
    sourceRef: "Portisch – Karpov, Milan 1975 (20...exd5 21.Rxd5 Rxd5 22.Bxd5) : la chaîne de reprises qui centralise le fou blanc.",
  },
  {
    themeId: "jh-module-2-jouer-contre-l-isolani",
    fen: "2r3k1/pb3pp1/1pn5/3B2p1/8/P1N5/1P3PPP/2R3K1 b - - 0 22",
    solution: ["c6a5"],
    solutionSan: ["Na5"],
    rating: 1530,
    sourceRef: "Portisch – Karpov, Milan 1975 (22...Na5) : le cavalier noir entame sa manœuvre vers le bel avant-poste c4.",
  },
  {
    themeId: "jh-module-2-jouer-contre-l-isolani",
    fen: "2r3k1/pb3pp1/1p6/n2B2p1/8/P1N5/1P3PPP/2R3K1 w - - 1 23",
    solution: ["d5a2"],
    solutionSan: ["Ba2"],
    rating: 1560,
    sourceRef: "Portisch – Karpov, Milan 1975 (23.Ba2) : le fou blanc se replace pour éviter l'échange contre le cavalier entrant.",
  },
  {
    themeId: "jh-module-2-jouer-contre-l-isolani",
    fen: "2r3k1/pb3pp1/1p6/n5p1/8/P1N5/BP3PPP/2R3K1 b - - 2 23",
    solution: ["a5c4"],
    solutionSan: ["Nc4"],
    rating: 1590,
    sourceRef: "Portisch – Karpov, Milan 1975 (23...Nc4) : le cavalier noir atteint l'avant-poste idéal, hors de portée des pions blancs.",
  },
  {
    themeId: "jh-module-2-jouer-contre-l-isolani",
    fen: "2r3k1/pb3pp1/1p6/6p1/2n5/P1N5/BP3PPP/2R3K1 w - - 3 24",
    solution: ["c3b5", "c4d6"],
    solutionSan: ["Nb5", "Nd6"],
    rating: 1620,
    sourceRef: "Portisch – Karpov, Milan 1975 (24.Nb5 Nd6) : manœuvres réciproques des cavaliers en finale.",
  },
  {
    themeId: "jh-module-2-jouer-contre-l-isolani",
    fen: "2r3k1/pb3pp1/1p1n4/1N4p1/8/P7/BP3PPP/2R3K1 w - - 5 25",
    solution: ["c1c8", "d6c8"],
    solutionSan: ["Rxc8+", "Nxc8"],
    rating: 1650,
    sourceRef: "Portisch – Karpov, Milan 1975 (25.Rxc8+ Nxc8) : l'échange final des tours simplifie vers la finale de pièces mineures.",
  },
  {
    themeId: "jh-module-2-jouer-contre-l-isolani",
    fen: "2n5/4kpp1/1pb5/pN4p1/2B5/P3KP2/1P4PP/8 w - - 0 30",
    solution: ["e3d4", "c6b5", "c4b5"],
    solutionSan: ["Kd4", "Bxb5", "Bxb5"],
    rating: 1680,
    sourceRef: "Portisch – Karpov, Milan 1975 (30.Kd4 Bxb5 31.Bxb5) : le roi blanc se centralise, dernier échange de fous.",
  },
  {
    themeId: "jh-module-2-jouer-contre-l-isolani",
    fen: "2n5/6p1/1p1k1p2/p5p1/3K4/P2B1P2/1P4PP/8 b - - 1 33",
    solution: ["c8e7"],
    solutionSan: ["Ne7"],
    rating: 1710,
    sourceRef: "Portisch – Karpov, Milan 1975 (33...Ne7) : le regroupement final qui tient la nulle — la technique de défense contre l'isolani menée jusqu'au bout.",
  },
  {
    themeId: "jh-module-3-la-structure-carlsbad",
    fen: "r1bq1rk1/ppp1npbp/6p1/3p4/3P4/2NBPN2/PP3PPP/R2Q1RK1 w - - 5 12",
    solution: ["b2b4"],
    solutionSan: ["b4"],
    rating: 1280,
    sourceRef: "Petrosian – Krogius, Tbilisi 1959 (12.b4) : le coup qui lance l'attaque de minorité, sans jamais toucher au pion c.",
  },
  {
    themeId: "jh-module-3-la-structure-carlsbad",
    fen: "r2q1rk1/ppp1npbp/6p1/3p1b2/1P1P4/2NBPN2/P4PPP/R2Q1RK1 w - - 1 13",
    solution: ["d3f5", "e7f5", "b4b5"],
    solutionSan: ["Bxf5", "Nxf5", "b5"],
    rating: 1320,
    sourceRef: "Petrosian – Krogius, Tbilisi 1959 (13.Bxf5 Nxf5 14.b5) : préparer puis enfoncer la fissure sur l'aile dame.",
  },
  {
    themeId: "jh-module-3-la-structure-carlsbad",
    fen: "r4r1k/pp2npb1/2pq2pp/1P1p4/3P4/1QN1PN2/P1R2PPP/2R3K1 w - - 0 19",
    solution: ["c3a4"],
    solutionSan: ["Na4"],
    rating: 1360,
    sourceRef: "Petrosian – Krogius, Tbilisi 1959 (19.Na4) : le cavalier entame sa route vers l'avant-poste c5.",
  },
  {
    themeId: "jh-module-3-la-structure-carlsbad",
    fen: "1r3r2/pp2npbk/2pq2pp/1P1p4/N2P4/1Q2PNP1/P1R2P1P/2R3K1 w - - 1 21",
    solution: ["a4c5"],
    solutionSan: ["Nc5"],
    rating: 1400,
    sourceRef: "Petrosian – Krogius, Tbilisi 1959 (21.Nc5) : le cavalier atteint l'avant-poste créé par l'attaque de minorité.",
  },
  {
    themeId: "jh-module-3-la-structure-carlsbad",
    fen: "1r1r4/pp2npbk/2pq2pp/1PNp4/3P4/1Q2PNP1/P1R2P1P/2R3K1 w - - 3 22",
    solution: ["b5c6", "b7c6"],
    solutionSan: ["bxc6", "bxc6"],
    rating: 1440,
    sourceRef: "Petrosian – Krogius, Tbilisi 1959 (22.bxc6 bxc6) : l'échange qui crée la faiblesse permanente sur c6.",
  },
  {
    themeId: "jh-module-3-la-structure-carlsbad",
    fen: "1r1r4/p3npbk/2pq2pp/2Np4/3P4/1Q2PNP1/P1R2P1P/2R3K1 w - - 0 23",
    solution: ["b3a4"],
    solutionSan: ["Qa4"],
    rating: 1470,
    sourceRef: "Petrosian – Krogius, Tbilisi 1959 (23.Qa4) : la dame rejoint la pression sur l'aile dame noire.",
  },
  {
    themeId: "jh-module-3-la-structure-carlsbad",
    fen: "r2r4/p3npbk/2p2qpp/2Np4/Q2P4/4PNP1/P1R2PKP/2R5 w - - 4 25",
    solution: ["c5b7"],
    solutionSan: ["Nb7"],
    rating: 1500,
    sourceRef: "Petrosian – Krogius, Tbilisi 1959 (25.Nb7) : le cavalier continue sa manœuvre de harcèlement.",
  },
  {
    themeId: "jh-module-3-la-structure-carlsbad",
    fen: "r3r3/pN2npbk/2p2qpp/3p4/Q2P4/4PNP1/P1R2PKP/2R5 w - - 6 26",
    solution: ["b7a5"],
    solutionSan: ["Na5"],
    rating: 1530,
    sourceRef: "Petrosian – Krogius, Tbilisi 1959 (26.Na5) : encore une étape vers la cible c6.",
  },
  {
    themeId: "jh-module-3-la-structure-carlsbad",
    fen: "r3r3/p3npbk/2p4p/N2p1qp1/Q2P4/4PNPP/P1R2PK1/2R5 w - - 1 28",
    solution: ["a5c6", "f5e4"],
    solutionSan: ["Nxc6", "Qe4"],
    rating: 1560,
    sourceRef: "Petrosian – Krogius, Tbilisi 1959 (28.Nxc6 Qe4) : le cavalier récolte enfin la faiblesse c6.",
  },
  {
    themeId: "jh-module-3-la-structure-carlsbad",
    fen: "r3r3/p3npbk/2N4p/3p2p1/Q2Pq3/4PNPP/P1R2PK1/2R5 w - - 1 29",
    solution: ["c2c5", "f7f5", "a4c2", "e7c6", "c5c6"],
    solutionSan: ["Rc5", "f5", "Qc2", "Nxc6", "Rxc6"],
    rating: 1600,
    sourceRef: "Petrosian – Krogius, Tbilisi 1959 (29.Rc5 f5 30.Qc2 Nxc6 31.Rxc6) : la tour blanche s'installe sur la case c6, but final de l'attaque de minorité.",
  },
  {
    themeId: "jh-module-3-la-structure-carlsbad",
    fen: "r3r3/p5bk/2R4p/3p4/3Pqp2/5NPP/P1Q2PK1/2R5 w - - 0 33",
    solution: ["g3g4", "g7d4"],
    solutionSan: ["g4", "Bxd4"],
    rating: 1630,
    sourceRef: "Petrosian – Krogius, Tbilisi 1959 (33.g4 Bxd4) : la tentative de contre-jeu tactique désespérée de Krogius.",
  },
  {
    themeId: "jh-module-3-la-structure-carlsbad",
    fen: "r3r3/p5bk/2R4p/3p4/4qpP1/5N1P/P2Q1PK1/2R5 w - - 2 35",
    solution: ["c1e1", "e4a4", "d2d5"],
    solutionSan: ["Re1", "Qa4", "Qxd5"],
    rating: 1660,
    sourceRef: "Petrosian – Krogius, Tbilisi 1959 (35.Re1 Qa4 36.Qxd5) : Petrosian gagne aussi le second pion faible.",
  },
  {
    themeId: "jh-module-3-la-structure-carlsbad",
    fen: "5r1k/p5b1/2R4p/3Q4/q4pP1/5N1P/P4PK1/8 w - - 3 39",
    solution: ["c6c7", "a7a6"],
    solutionSan: ["Rc7", "a6"],
    rating: 1690,
    sourceRef: "Petrosian – Krogius, Tbilisi 1959 (39.Rc7 a6) : la tour blanche envahit la 7e rangée, technique de conversion.",
  },
  {
    themeId: "jh-module-3-la-structure-carlsbad",
    fen: "5r1k/2R3b1/p6p/3Q4/q4pP1/5N1P/P4PK1/8 w - - 0 40",
    solution: ["d5b7", "f8g8"],
    solutionSan: ["Qb7", "Rg8"],
    rating: 1720,
    sourceRef: "Petrosian – Krogius, Tbilisi 1959 (40.Qb7 Rg8) : domination totale à l'approche du gain.",
  },
  {
    themeId: "jh-module-4-la-structure-maroczy",
    fen: "rnbqk1nr/pp1pppbp/6p1/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
    solution: ["e2e4"],
    solutionSan: ["e4"],
    rating: 1250,
    sourceRef: "Lutz – Vokac, Dortmund 1991 (4.e4) : le second pilier du Bind Maroczy rejoint le pion c4.",
  },
  {
    themeId: "jh-module-4-la-structure-maroczy",
    fen: "1rrqb1k1/1p1nppbp/2np2p1/3N4/p1P1P3/1N2BP2/PP1QB1PP/2RR3K w - - 0 19",
    solution: ["b3a1"],
    solutionSan: ["Na1"],
    rating: 1330,
    sourceRef: "Lutz – Vokac, Dortmund 1991 (19.Na1) : éviter tout échange — le camp qui tient le Bind veut garder les pièces sur l'échiquier.",
  },
  {
    themeId: "jh-module-4-la-structure-maroczy",
    fen: "2rqb1k1/1r2ppbp/1pnp2p1/2nN4/p1P1P2B/5P2/PPNQB1PP/1R1R3K w - - 8 24",
    solution: ["b2b4", "a4b3", "a2b3"],
    solutionSan: ["b4", "axb3", "axb3"],
    rating: 1370,
    sourceRef: "Lutz – Vokac, Dortmund 1991 (24.b4 axb3 25.axb3) : l'expansion spatiale continue sans le moindre échange de pièces.",
  },
  {
    themeId: "jh-module-4-la-structure-maroczy",
    fen: "r2qb1k1/1r2ppbp/1pnp2p1/2nN4/2P1P2B/1P3P2/2NQB1PP/1R1R3K w - - 1 26",
    solution: ["c2e3"],
    solutionSan: ["Nce3"],
    rating: 1400,
    sourceRef: "Lutz – Vokac, Dortmund 1991 (26.Nce3) : le cavalier se replace pour éviter l'invasion de la case a2.",
  },
  {
    themeId: "jh-module-4-la-structure-maroczy",
    fen: "r2qb1k1/r3ppbp/1pnpn1p1/3N4/2P1PP1B/1P2N3/3QB1PP/1R1R3K w - - 1 28",
    solution: ["d2e1"],
    solutionSan: ["Qe1"],
    rating: 1430,
    sourceRef: "Lutz – Vokac, Dortmund 1991 (28.Qe1) : regroupement discret avant la percée centrale.",
  },
  {
    themeId: "jh-module-4-la-structure-maroczy",
    fen: "r2q2k1/4pbbp/1pnpnpp1/3N4/1PP1PPBB/4N3/r5PP/1R1RQ2K w - - 3 31",
    solution: ["e4e5", "d6e5", "d5f6", "e7f6", "d1d8", "a8d8"],
    solutionSan: ["e5", "dxe5", "Nxf6+", "exf6", "Rxd8+", "Rxd8"],
    rating: 1470,
    sourceRef: "Lutz – Vokac, Dortmund 1991 (31.e5 dxe5 32.Nxf6+ exf6 33.Rxd8+ Rxd8) : la percée centrale qui gagne la dame contre la tour.",
  },
  {
    themeId: "jh-module-4-la-structure-maroczy",
    fen: "3r2k1/5bbp/1pn1npp1/4p3/1PP2PBB/4N3/r5PP/1R2Q2K w - - 0 34",
    solution: ["b4b5"],
    solutionSan: ["b5"],
    rating: 1500,
    sourceRef: "Lutz – Vokac, Dortmund 1991 (34.b5) : Blanc continue de pousser malgré les simplifications.",
  },
  {
    themeId: "jh-module-4-la-structure-maroczy",
    fen: "3r2k1/5bbp/1p2npp1/1P2p3/2Pn1PBB/4N3/r5PP/1R2Q2K w - - 1 35",
    solution: ["f4e5"],
    solutionSan: ["fxe5"],
    rating: 1530,
    sourceRef: "Lutz – Vokac, Dortmund 1991 (35.fxe5) : exploiter le clouage du pion f noir.",
  },
  {
    themeId: "jh-module-4-la-structure-maroczy",
    fen: "3r2k1/5b1p/1p3P2/1Pb3p1/2Pn1nB1/4N1B1/r5PP/3RQ2K w - - 0 39",
    solution: ["g3f4", "g5f4"],
    solutionSan: ["Bxf4", "gxf4"],
    rating: 1560,
    sourceRef: "Lutz – Vokac, Dortmund 1991 (39.Bxf4 gxf4) : simplification technique en faveur de Blanc.",
  },
  {
    themeId: "jh-module-4-la-structure-maroczy",
    fen: "3r2k1/5b1p/1p3P2/1Pb5/2Pn1pB1/4N3/r5PP/3RQ2K w - - 0 40",
    solution: ["e3f5"],
    solutionSan: ["Nf5"],
    rating: 1590,
    sourceRef: "Lutz – Vokac, Dortmund 1991 (40.Nf5) : le cavalier atteint l'avant-poste ultime.",
  },
  {
    themeId: "jh-module-4-la-structure-maroczy",
    fen: "4rbk1/7p/1p3PbQ/1P3N2/2Pn1pB1/8/r5PP/3R3K w - - 6 43",
    solution: ["h6f4", "d4f5", "g4f5"],
    solutionSan: ["Qxf4", "Nxf5", "Bxf5"],
    rating: 1620,
    sourceRef: "Lutz – Vokac, Dortmund 1991 (43.Qxf4 Nxf5 44.Bxf5) : récolte matérielle et centralisation du fou.",
  },
  {
    themeId: "jh-module-4-la-structure-maroczy",
    fen: "4rbk1/r4b1p/1p3P2/1P3B2/2P2Q2/7P/6P1/3R3K w - - 1 46",
    solution: ["f4g5"],
    solutionSan: ["Qg5+"],
    rating: 1650,
    sourceRef: "Lutz – Vokac, Dortmund 1991 (46.Qg5+) : l'attaque directe contre le roi noir s'intensifie.",
  },
  {
    themeId: "jh-module-4-la-structure-maroczy",
    fen: "4rb1k/r4b1p/1p3P2/1P3BQ1/2P5/7P/6P1/3R3K w - - 3 47",
    solution: ["f5h7", "h8h7"],
    solutionSan: ["Bxh7", "Kxh7"],
    rating: 1690,
    sourceRef: "Lutz – Vokac, Dortmund 1991 (47.Bxh7 Kxh7) : le sacrifice qui décide de la partie.",
  },
  {
    themeId: "jh-module-4-la-structure-maroczy",
    fen: "4rb2/r4b1k/1p3P2/1P4Q1/2P5/7P/6P1/3R3K w - - 0 48",
    solution: ["d1d4", "e8e4", "d4e4"],
    solutionSan: ["Rd4", "Re4", "Rxe4"],
    rating: 1720,
    sourceRef: "Lutz – Vokac, Dortmund 1991 (48.Rd4 Re4 49.Rxe4) : conversion technique vers le gain.",
  },
  // `jh-module-5-le-herisson-hedgehog` : 14 exercices (2026-09-11, Lot 3 du
  // cursus Jesper Hall), tirés de la partie RÉELLE Robert Fischer – Ulf
  // Andersson, Siegen 1970 (chessgames.com/perl/chessgame?gid=1019452) — LA
  // partie fondatrice du Hérisson citée par l'article Wikipédia « Hedgehog
  // (chess) ». Le cahier des charges désignait « Belgrade 1970 », qui
  // n'existe pas : la partie réelle s'est jouée à Siegen, gardée telle
  // quelle une fois la ville corrigée (voir docstring de `course-lesson.ts`
  // pour le détail de la vérification).
  ...[
    { fen: "r1bqrbk1/1ppp1ppp/2n2n2/p3p3/2P5/PP1PPN2/1BQ2PPP/RN2KB1R w KQ - 0 9", solution: ["f1e2"], solutionSan: ["Be2"], rating: 1500, sourceRef: "Fischer – Andersson, Siegen 1970 (9.Be2) : dernier coup de développement avant que la tension centrale ne se résolve." },
    { fen: "r1bqrbk1/1ppp1ppp/2n2n2/p3p3/2P5/PP1PPN2/1BQ1BPPP/RN2K2R b KQ - 1 9", solution: ["d7d5"], solutionSan: ["d5"], rating: 1520, sourceRef: "Fischer – Andersson, Siegen 1970 (9...d5) : Andersson ouvre lui-même le centre, renonçant à la retenue du Hérisson." },
    { fen: "r1bqrbk1/1pp2ppp/2n2n2/p2pp3/2P5/PP1PPN2/1BQ1BPPP/RN2K2R w KQ - 0 10", solution: ["c4d5"], solutionSan: ["cxd5"], rating: 1540, sourceRef: "Fischer – Andersson, Siegen 1970 (10.cxd5) : Fischer clarifie aussitôt la position centrale." },
    { fen: "r1bqrbk1/1pp2ppp/2n5/p2np3/8/PP1PPN2/1BQ1BPPP/RN2K2R w KQ - 0 11", solution: ["b1d2"], solutionSan: ["Nbd2"], rating: 1560, sourceRef: "Fischer – Andersson, Siegen 1970 (11.Nbd2) : le Cavalier rejoint le jeu avant tout engagement à l'aile roi." },
    { fen: "r2qrbk1/1pp3pp/2n1bp2/p2np3/8/PP1PPN2/1BQNBPPP/R4RK1 w - - 2 13", solution: ["g1h1"], solutionSan: ["Kh1"], rating: 1580, sourceRef: "Fischer – Andersson, Siegen 1970 (13.Kh1) : premier temps du plan devenu manuel — le Roi se met hors de la colonne g avant qu'elle ne s'ouvre." },
    { fen: "r3rbk1/1ppq2pp/2n1bp2/p2np3/8/PP1PPN2/1BQNBPPP/R4R1K w - - 4 14", solution: ["f1g1"], solutionSan: ["Rg1"], rating: 1600, sourceRef: "Fischer – Andersson, Siegen 1970 (14.Rg1) : la Tour rejoint la colonne g AVANT l'avance du pion, jamais l'inverse." },
    { fen: "3rrbk1/1pp2qpp/2n1bp2/p2np3/4N3/PP1PPN2/1BQ1BPPP/R5RK w - - 8 16", solution: ["g2g4"], solutionSan: ["g4"], rating: 1620, sourceRef: "Fischer – Andersson, Siegen 1970 (16.g4) : l'assaut de pions commence enfin, pièces déjà en place." },
    { fen: "3rr1k1/1pp2qbp/2n1bpp1/p2np3/4N1P1/PP1PPNR1/1BQ1BP1P/R6K w - - 2 18", solution: ["a1g1"], solutionSan: ["Rag1"], rating: 1640, sourceRef: "Fischer – Andersson, Siegen 1970 (18.Rag1) : la seconde Tour double sur la colonne g." },
    { fen: "2brr1k1/1pp2qbp/1nn2pp1/p1N1p3/6P1/PP1PPNR1/1BQ1BP1P/6RK w - - 6 20", solution: ["f3h4"], solutionSan: ["Nh4"], rating: 1660, sourceRef: "Fischer – Andersson, Siegen 1970 (20.Nh4) : le Cavalier poursuit sa longue danse de regroupement avant la percée." },
    { fen: "3rrnk1/1pp1nqbp/4bpp1/p1N1pN2/6P1/PP1PP1R1/1BQ1BP1P/6RK w - - 14 24", solution: ["f5g7","g8g7"], solutionSan: ["Nxg7","Kxg7"], rating: 1680, sourceRef: "Fischer – Andersson, Siegen 1970 (24.Nxg7 Kxg7) : le sacrifice qui arrache le rempart du roi noir." },
    { fen: "3rrn2/1pp1nqkp/4bpp1/p1N1p3/6P1/PP1PP1R1/1BQ1BP1P/6RK w - - 0 25", solution: ["g4g5"], solutionSan: ["g5"], rating: 1700, sourceRef: "Fischer – Andersson, Siegen 1970 (25.g5) : le pion chasse le Cavalier tout juste réinstallé." },
    { fen: "3rrn2/2p2qkp/1p2bpp1/p1N1pnP1/8/PP1PPR2/1BQ1BP1P/6RK w - - 0 27", solution: ["g5f6"], solutionSan: ["gxf6+"], rating: 1720, sourceRef: "Fischer – Andersson, Siegen 1970 (27.gxf6+) : la percée de pions ouvre définitivement les lignes." },
    { fen: "3rrn1k/2p2q1p/1p2bPp1/p1N1pn2/8/PP1PPR2/1BQ1BP1P/6RK w - - 1 28", solution: ["c5e6","e8e6"], solutionSan: ["Nxe6","Rxe6"], rating: 1740, sourceRef: "Fischer – Andersson, Siegen 1970 (28.Nxe6 Rxe6) : clearance tactique qui prépare la percée centrale d4." },
    { fen: "5k2/2p2q1p/1p1n1Pn1/p3B1Q1/4PP2/PP5R/3r4/6RK w - - 3 43", solution: ["e5d6"], solutionSan: ["Bxd6+"], rating: 1760, sourceRef: "Fischer – Andersson, Siegen 1970 (43.Bxd6+) : le coup final, Andersson abandonne." },
  ].map((p) => ({ themeId: "jh-module-5-le-herisson-hedgehog", ...p })),
  // `jh-module-6-la-chaine-de-pions-en-francais` : 14 exercices de plus
  // (2026-09-11, Lot 3), tirés de la même partie Nimzowitsch–Salwe, Karlsbad
  // 1911 déjà utilisée par le tutoriel ci-dessus (`COURSE_LESSONS`) et par
  // `pm-la-surprotection-nimzowitsch` — plis DISTINCTS de ceux déjà
  // sélectionnés par cette dernière (aucune collision de FEN), centrés sur
  // le développement et la manœuvre base/tête plutôt que sur la
  // surprotection de e5.
  ...[
    { fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", solution: ["e2e4"], solutionSan: ["e4"], rating: 1500, sourceRef: "Nimzowitsch – Salwe, Karlsbad 1911 (1.e4) : le tout premier coup de la partie fondatrice du chapitre « The Pawn-Chain »." },
    { fen: "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2", solution: ["d2d4"], solutionSan: ["d4"], rating: 1515, sourceRef: "Nimzowitsch – Salwe, Karlsbad 1911 (2.d4) : Blanc installe le second pion central avant le verrouillage." },
    { fen: "rnbqkbnr/pp3ppp/4p3/2ppP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4", solution: ["c2c3"], solutionSan: ["c3"], rating: 1530, sourceRef: "Nimzowitsch – Salwe, Karlsbad 1911 (4.c3) : la base d4 est renforcée par anticipation." },
    { fen: "r1bqkbnr/pp3ppp/2n1p3/2ppP3/3P4/2P5/PP3PPP/RNBQKBNR w KQkq - 1 5", solution: ["g1f3"], solutionSan: ["Nf3"], rating: 1545, sourceRef: "Nimzowitsch – Salwe, Karlsbad 1911 (5.Nf3) : développement naturel avant tout engagement." },
    { fen: "r1b1kbnr/pp3ppp/1qn1p3/2ppP3/3P4/2P2N2/PP3PPP/RNBQKB1R w KQkq - 3 6", solution: ["f1d3"], solutionSan: ["Bd3"], rating: 1560, sourceRef: "Nimzowitsch – Salwe, Karlsbad 1911 (6.Bd3) : le Fou se dirige vers l'aile roi, dans l'axe de la tête e5." },
    { fen: "r3k1nr/pp1b1ppp/1qn1p3/2bpP3/8/2PB1N2/PP3PPP/RNBQK2R w KQkq - 0 8", solution: ["e1g1"], solutionSan: ["O-O"], rating: 1575, sourceRef: "Nimzowitsch – Salwe, Karlsbad 1911 (8.O-O) : Blanc met son Roi à l'abri avant les opérations à venir." },
    { fen: "r3k1nr/pp1b2pp/1qn1pp2/2bpP3/8/2PB1N2/PP3PPP/RNBQ1RK1 w kq - 0 9", solution: ["b2b4"], solutionSan: ["b4"], rating: 1590, sourceRef: "Nimzowitsch – Salwe, Karlsbad 1911 (9.b4) : premier signe de l'expansion à l'aile dame." },
    { fen: "r3k2r/pp1bb1pp/1q2pn2/3pB3/1P6/2PB4/P4PPP/RN1Q1RK1 w kq - 1 13", solution: ["b1d2"], solutionSan: ["Nd2"], rating: 1605, sourceRef: "Nimzowitsch – Salwe, Karlsbad 1911 (13.Nd2) : regroupement du Cavalier vers l'aile roi." },
    { fen: "r4rk1/pp1bb1pp/1q2pn2/3pB3/1P6/2PB4/P2N1PPP/R2Q1RK1 w - - 3 14", solution: ["d2f3"], solutionSan: ["Nf3"], rating: 1620, sourceRef: "Nimzowitsch – Salwe, Karlsbad 1911 (14.Nf3) : le Cavalier reprend sa route vers e5." },
    { fen: "r4rk1/pp1b2pp/1q1bpn2/3pB3/1P6/2PB1N2/P4PPP/R2Q1RK1 w - - 5 15", solution: ["d1e2"], solutionSan: ["Qe2"], rating: 1635, sourceRef: "Nimzowitsch – Salwe, Karlsbad 1911 (15.Qe2) : la Dame se prépare à rejoindre l'aile roi." },
    { fen: "2r1brk1/pp4pp/2q1pn2/3pB3/1P6/2PB4/P3QPPP/4RRK1 w - - 1 20", solution: ["e5d4"], solutionSan: ["Bd4"], rating: 1650, sourceRef: "Nimzowitsch – Salwe, Karlsbad 1911 (20.Bd4) : le Fou recule mais garde la grande diagonale sous contrôle." },
    { fen: "2r3k1/pp1b1rpp/2q1pn2/3p4/1P1B4/2PB4/P1Q2PPP/4RRK1 w - - 5 22", solution: ["e1e3"], solutionSan: ["Re3"], rating: 1665, sourceRef: "Nimzowitsch – Salwe, Karlsbad 1911 (22.Re3) : la Tour se prépare à basculer vers l'aile roi." },
    { fen: "2r3k1/p2b1rpp/1pq1pn2/3p4/1P1B4/2PBR3/P1Q2PPP/5RK1 w - - 0 23", solution: ["e3g3"], solutionSan: ["Rg3"], rating: 1680, sourceRef: "Nimzowitsch – Salwe, Karlsbad 1911 (23.Rg3) : la Tour rejoint la colonne g, l'assaut final se prépare." },
    { fen: "7k/p2br1p1/1p1q1nB1/4p1B1/1P1p4/2r3R1/P1Q2PPP/4R1K1 w - - 0 29", solution: ["g3c3","d4c3"], solutionSan: ["Rxc3","dxc3"], rating: 1695, sourceRef: "Nimzowitsch – Salwe, Karlsbad 1911 (29.Rxc3 dxc3) : le dernier maillon de la chaîne noire tombe, réduisant la contre-attaque à néant." },
  ].map((p) => ({ themeId: "jh-module-6-la-chaine-de-pions-en-francais", ...p })),
  // `jh-module-7-structures-a-pions-doubles` : 14 exercices (2026-09-11, Lot
  // 3), tirés de la partie RÉELLE Aron Nimzowitsch – Jose Raul Capablanca,
  // Saint-Pétersbourg 1914 (chessgames.com/perl/chessgame?gid=1102386,
  // « Burn the Witsch! »). Le cahier des charges désignait
  // « Botvinnik–Vidmar, Nottingham 1936 » — exactement la partie déjà
  // écartée pour Carlsbad au Lot 2 (un isolani, pas des pions doublés) —
  // remplacée après vérification présentée à l'utilisateur (voir docstring
  // de `course-lesson.ts`).
  ...[
    { fen: "r2qkb1r/pppb1ppp/2np1n2/1B2p3/3PP3/2N2N2/PPP2PPP/R1BQK2R w KQkq - 1 6", solution: ["b5c6"], solutionSan: ["Bxc6"], rating: 1500, sourceRef: "Nimzowitsch – Capablanca, Saint-Pétersbourg 1914 (6.Bxc6) : Nimzowitsch cède la paire de Fous en préparation du plan sur c6." },
    { fen: "r2qkb1r/ppp2ppp/2bp1n2/8/3pP3/2NQ1N2/PPP2PPP/R1B1K2R w KQkq - 0 8", solution: ["f3d4"], solutionSan: ["Nxd4"], rating: 1520, sourceRef: "Nimzowitsch – Capablanca, Saint-Pétersbourg 1914 (8.Nxd4) : reprise centrale avant l'opération décisive." },
    { fen: "r2qkb1r/ppp2p1p/2bp1np1/8/3NP3/2NQ4/PPP2PPP/R1B1K2R w KQkq - 0 9", solution: ["d4c6","b7c6"], solutionSan: ["Nxc6","bxc6"], rating: 1540, sourceRef: "Nimzowitsch – Capablanca, Saint-Pétersbourg 1914 (9.Nxc6 bxc6) : les pions c noirs sont doublés — le thème du module naît ici." },
    { fen: "r2qkb1r/p1p2p1p/2pp1np1/8/4P3/2NQ4/PPP2PPP/R1B1K2R w KQkq - 0 10", solution: ["d3a6"], solutionSan: ["Qa6"], rating: 1560, sourceRef: "Nimzowitsch – Capablanca, Saint-Pétersbourg 1914 (10.Qa6) : la Dame blanche s'engouffre aussitôt dans les cases affaiblies." },
    { fen: "r3kb1r/p1pq1p1p/Q1pp1np1/8/4P3/2N5/PPP2PPP/R1B1K2R w KQkq - 2 11", solution: ["a6b7"], solutionSan: ["Qb7"], rating: 1580, sourceRef: "Nimzowitsch – Capablanca, Saint-Pétersbourg 1914 (11.Qb7) : la Dame continue de grignoter l'aile dame noire." },
    { fen: "2r1kb1r/pQpq1p1p/2pp1np1/8/4P3/2N5/PPP2PPP/R1B1K2R w KQk - 4 12", solution: ["b7a7"], solutionSan: ["Qxa7"], rating: 1600, sourceRef: "Nimzowitsch – Capablanca, Saint-Pétersbourg 1914 (12.Qxa7) : un premier pion tombe, fruit direct de la faiblesse structurelle." },
    { fen: "2r1r1k1/2p2pbp/2ppq1p1/8/2n1P3/2N2P2/PPPBQ1PP/R4RK1 w - - 5 19", solution: ["a1b1"], solutionSan: ["Rab1"], rating: 1620, sourceRef: "Nimzowitsch – Capablanca, Saint-Pétersbourg 1914 (19.Rab1) : Nimzowitsch se met en position de défendre b2, désormais visé en retour." },
    { fen: "r3r1k1/2p2pbp/2ppq1p1/8/2n1P3/2N2P2/PPPBQ1PP/1R3RK1 w - - 7 20", solution: ["a2a4"], solutionSan: ["a4"], rating: 1640, sourceRef: "Nimzowitsch – Capablanca, Saint-Pétersbourg 1914 (20.a4) : Blanc poursuit son expansion à l'aile dame." },
    { fen: "r3r1k1/2p2pbp/2ppq1p1/8/P1n1P3/2N2P2/1PPBQ1PP/1R3RK1 b - - 0 20", solution: ["c4d2","e2d2"], solutionSan: ["Nxd2","Qxd2"], rating: 1660, sourceRef: "Nimzowitsch – Capablanca, Saint-Pétersbourg 1914 (20...Nxd2 21.Qxd2) : Capablanca échange pour garder l'initiative, pas pour simplifier passivement." },
    { fen: "r5k1/2p2pbp/2pp2p1/8/Prq1P3/2N1QP2/1PP3PP/1R1R2K1 w - - 5 24", solution: ["e3g5"], solutionSan: ["Qg5"], rating: 1680, sourceRef: "Nimzowitsch – Capablanca, Saint-Pétersbourg 1914 (24.Qg5) : Nimzowitsch cherche des complications, la position déjà tendue." },
    { fen: "1r4k1/2p2p1p/2pp2p1/6Q1/PrqbP3/2N2P2/1PP3PP/1R1R3K w - - 9 26", solution: ["d1d4","c4d4"], solutionSan: ["Rxd4","Qxd4"], rating: 1700, sourceRef: "Nimzowitsch – Capablanca, Saint-Pétersbourg 1914 (26.Rxd4 Qxd4) : échange central, la Dame noire prend une position dominante." },
    { fen: "1r4k1/2p2p1p/2pp2p1/6Q1/Prq1P2P/2N2P2/1PP3P1/3R3K b - - 0 28", solution: ["b4b2"], solutionSan: ["Rxb2"], rating: 1720, sourceRef: "Nimzowitsch – Capablanca, Saint-Pétersbourg 1914 (28...Rxb2) : la Tour noire referme la boucle ouverte par bxc6 dix-neuf coups plus tôt." },
    { fen: "r5k1/P1p2p1p/2pp2p1/2q5/4P3/2N2P2/1rPQ2P1/R6K w - - 1 37", solution: ["e4e5","c5e5"], solutionSan: ["e5","Qxe5"], rating: 1740, sourceRef: "Nimzowitsch – Capablanca, Saint-Pétersbourg 1914 (37.e5 Qxe5) : un second pion blanc tombe, la compensation dépasse maintenant la faiblesse initiale." },
    { fen: "6k1/r1p2p1p/2p3p1/2qp4/7R/2N2P2/1rPQ2PK/8 w - - 0 42", solution: ["c3d1"], solutionSan: ["Nd1"], rating: 1760, sourceRef: "Nimzowitsch – Capablanca, Saint-Pétersbourg 1914 (42.Nd1) : dernier coup avant l'abandon de Nimzowitsch." },
  ].map((p) => ({ themeId: "jh-module-7-structures-a-pions-doubles", ...p })),
  // `jh-module-8-le-roque-oppose-et-l-attaque-de-pions` : 14 exercices
  // (2026-09-11, Lot 4), tirés de la partie RÉELLE Anatoly Karpov – Viktor
  // Korchnoi, Finale des Candidats, Moscou 1974, partie 2
  // (chessgames.com/perl/chessgame?gid=1067858, B77 Dragon, Attaque
  // Yougoslave, roques opposés) — voir le docstring de `course-lesson.ts`.
  ...[
    { fen: "r2q1rk1/pp1bppbp/2np1np1/8/2BNP3/2N1BP2/PPPQ2PP/R3K2R w KQ - 5 10", solution: ["h2h4"], solutionSan: ["h4"], rating: 1500, sourceRef: "Karpov – Korchnoi, Moscou 1974 (10.h4) : l'assaut de pions démarre avant même le roque du roi blanc." },
    { fen: "2rq1rk1/pp1bppbp/3p1np1/4n3/3NP2P/1BN1BP2/PPPQ2P1/R3K2R w KQ - 3 12", solution: ["e1c1"], solutionSan: ["O-O-O"], rating: 1520, sourceRef: "Karpov – Korchnoi, Moscou 1974 (12.O-O-O) : le roi blanc se met enfin à l'abri, juste avant que la course ne s'accélère." },
    { fen: "3q1rk1/pp1bppbp/3p1np1/8/2rNP2P/2N1BP2/PPPQ2P1/2KR3R w - - 0 14", solution: ["h4h5"], solutionSan: ["h5"], rating: 1540, sourceRef: "Karpov – Korchnoi, Moscou 1974 (14.h5) : le pion fonce droit sur le Cavalier pour ouvrir la colonne h." },
    { fen: "3q1rk1/pp1bppbp/3p2p1/7n/2rNP3/2N1BP2/PPPQ2P1/2KR3R w - - 0 15", solution: ["g2g4"], solutionSan: ["g4"], rating: 1560, sourceRef: "Karpov – Korchnoi, Moscou 1974 (15.g4) : second pion lancé, l'étau se resserre sur le roque noir." },
    { fen: "5rk1/pp1bppbp/3p1np1/q7/2r1P1P1/2N1BP2/PPPQN3/2KR3R w - - 3 17", solution: ["e3h6"], solutionSan: ["Bh6"], rating: 1580, sourceRef: "Karpov – Korchnoi, Moscou 1974 (17.Bh6) : élimination du Fou défenseur du roque noir." },
    { fen: "5rk1/pp1bpp1p/3p1npb/q7/2r1P1P1/2N2P2/PPPQN3/2KR3R w - - 0 18", solution: ["d2h6"], solutionSan: ["Qxh6"], rating: 1600, sourceRef: "Karpov – Korchnoi, Moscou 1974 (18.Qxh6) : la Dame blanche s'installe au contact direct du roi noir." },
    { fen: "2r3k1/pp1bpp1p/3p1npQ/q7/2r1P1P1/2N2P2/PPP1N3/2KR3R w - - 1 19", solution: ["d1d3"], solutionSan: ["Rd3"], rating: 1615, sourceRef: "Karpov – Korchnoi, Moscou 1974 (19.Rd3) : la Tour bascule vers l'aile roi pour amplifier l'attaque." },
    { fen: "2r3k1/pp1bpp1p/3p1npQ/q1r5/4P1P1/2NR1P2/PPP1N3/2K4R w - - 3 20", solution: ["g4g5"], solutionSan: ["g5"], rating: 1630, sourceRef: "Karpov – Korchnoi, Moscou 1974 (20.g5) : le second pion continue sa poussée, chassant le Cavalier f6." },
    { fen: "2r3k1/pp1bpp1p/3p1npQ/q5r1/4P3/2NR1P2/PPP1N3/2K4R w - - 0 21", solution: ["d3d5","g5d5"], solutionSan: ["Rd5","Rxd5"], rating: 1650, sourceRef: "Karpov – Korchnoi, Moscou 1974 (21.Rd5 Rxd5) : échange de Tours qui ouvre une case d'invasion." },
    { fen: "2r3k1/pp1bpp1p/3p1npQ/q2r4/4P3/2N2P2/PPP1N3/2K4R w - - 0 22", solution: ["c3d5"], solutionSan: ["Nxd5"], rating: 1665, sourceRef: "Karpov – Korchnoi, Moscou 1974 (22.Nxd5) : le Cavalier reprend et s'installe sur un avant-poste central dominant." },
    { fen: "4r1k1/pp1bpp1p/3p1npQ/q2N4/4P3/5P2/PPP1N3/2K4R w - - 1 23", solution: ["e2f4"], solutionSan: ["Nef4"], rating: 1680, sourceRef: "Karpov – Korchnoi, Moscou 1974 (23.Nef4) : régroupement final avant la percée décisive." },
    { fen: "4r1k1/pp2pp1p/2bp1npQ/q2N4/4PN2/5P2/PPP5/2K4R w - - 3 24", solution: ["e4e5"], solutionSan: ["e5"], rating: 1695, sourceRef: "Karpov – Korchnoi, Moscou 1974 (24.e5) : la diagonale a2-g8 s'ouvre en direction du roi noir." },
    { fen: "4r1k1/pp2pp1p/3p1npQ/q2bP3/5N2/5P2/PPP5/2K4R w - - 0 25", solution: ["e5f6","e7f6"], solutionSan: ["exf6","exf6"], rating: 1720, sourceRef: "Karpov – Korchnoi, Moscou 1974 (25.exf6 exf6) : le rempart de pions du roque noir est arraché." },
    { fen: "4r1k1/pp3p1p/3p1ppQ/q2b4/5N2/5P2/PPP5/2K4R w - - 0 26", solution: ["h6h7","g8f8","h7h8"], solutionSan: ["Qxh7+","Kf8","Qh8+"], rating: 1750, sourceRef: "Karpov – Korchnoi, Moscou 1974 (26.Qxh7+ Kf8 27.Qh8+) : la combinaison finale, Korchnoi abandonne face au mat forcé." },
  ].map((p) => ({ themeId: "jh-module-8-le-roque-oppose-et-l-attaque-de-pions", ...p })),
  // `jh-module-9-la-minorite-d-attaque` : 14 exercices (2026-09-11, Lot 4),
  // tirés de la partie RÉELLE Anatoly Karpov – Joël Lautier, Dortmund 1995,
  // ronde 9 (chessgames.com/perl/chessgame?gid=1069252, D45) — l'une des 3
  // parties canoniques citées par l'article Wikipédia « Minority attack ».
  // Le cahier des charges désignait « Pillsbury–Lasker, Nuremberg 1896 »,
  // partie inexistante dans ce sens — voir le docstring de
  // `course-lesson.ts`. Puzzles distincts des 23 steps de tutoriel déjà
  // présents pour ce thème (aucune collision de FEN).
  ...[
    { fen: "3rrnk1/pp3pp1/1bp1bn1p/4q3/8/P2BP1NP/1PQBNPP1/R2R2K1 w - - 10 20", solution: ["b2b4"], solutionSan: ["b4"], rating: 1500, sourceRef: "Karpov – Lautier, Dortmund 1995 (20.b4) : le coup qui déclenche l'attaque de minorité, partie citée par Wikipédia comme modèle du thème." },
    { fen: "3rr1k1/pp3pp1/1bp1bnnp/4q3/1P6/P2BP1NP/2QBNPP1/R2R2K1 w - - 1 21", solution: ["a3a4"], solutionSan: ["a4"], rating: 1520, sourceRef: "Karpov – Lautier, Dortmund 1995 (21.a4) : le second pion de la minorité avance à son tour." },
    { fen: "3rr1k1/1p3pp1/pbp1bnnp/4q3/PP6/3BP1NP/2QBNPP1/R2R2K1 w - - 0 22", solution: ["d2c3"], solutionSan: ["Bc3"], rating: 1540, sourceRef: "Karpov – Lautier, Dortmund 1995 (22.Bc3) : régroupement avant la percée, aucune précipitation." },
    { fen: "3rr1k1/1p3pp1/pbp1bnnp/6q1/PP6/2BBP1NP/2Q1NPP1/R2R2K1 w - - 2 23", solution: ["c3d4","b6d4"], solutionSan: ["Bd4","Bxd4"], rating: 1560, sourceRef: "Karpov – Lautier, Dortmund 1995 (23.Bd4 Bxd4) : simplification qui retire une pièce défensive noire." },
    { fen: "3rr1k1/1p3pp1/p1p1bnnp/6q1/PP1b4/3BP1NP/2Q1NPP1/R2R2K1 w - - 0 24", solution: ["e2d4"], solutionSan: ["Nxd4"], rating: 1580, sourceRef: "Karpov – Lautier, Dortmund 1995 (24.Nxd4) : reprise centrale, le Cavalier prend une position idéale." },
    { fen: "3rr1k1/1p3pp1/p1p2nnp/3b2q1/PP1N4/3BP1NP/2Q2PP1/R2R2K1 w - - 1 25", solution: ["e3e4"], solutionSan: ["e4"], rating: 1595, sourceRef: "Karpov – Lautier, Dortmund 1995 (25.e4) : le centre est fixé avant de relancer l'opération à l'aile dame." },
    { fen: "3rr1k1/1p3pp1/p1p1bnnp/8/PP2Pq2/3B1NNP/2Q2PP1/R2R2K1 w - - 3 27", solution: ["b4b5"], solutionSan: ["b5"], rating: 1615, sourceRef: "Karpov – Lautier, Dortmund 1995 (27.b5) : la percée décisive de l'attaque de minorité." },
    { fen: "3rr1k1/1p3pp1/p1p1bnnp/1P6/P3Pq2/3B1NNP/2Q2PP1/R2R2K1 b - - 0 27", solution: ["a6b5","a4b5"], solutionSan: ["axb5","axb5"], rating: 1635, sourceRef: "Karpov – Lautier, Dortmund 1995 (27...axb5 28.axb5) : la colonne a s'ouvre entièrement." },
    { fen: "3rr1k1/1p3pp1/2p1bn1p/1P2n3/4Pq2/3B1NNP/2Q2PP1/R2R2K1 w - - 1 29", solution: ["f3e5","f4e5"], solutionSan: ["Nxe5","Qxe5"], rating: 1655, sourceRef: "Karpov – Lautier, Dortmund 1995 (29.Nxe5 Qxe5) : échange central qui clarifie la position avant le coup clé." },
    { fen: "3rr1k1/1p3pp1/2p1bn1p/1P2q3/4P3/3B2NP/2Q2PP1/R2R2K1 w - - 0 30", solution: ["b5c6","b7c6"], solutionSan: ["bxc6","bxc6"], rating: 1675, sourceRef: "Karpov – Lautier, Dortmund 1995 (30.bxc6 bxc6) : la faiblesse définitive naît — le pion c noir est désormais isolé et arriéré." },
    { fen: "4r1k1/3n1pp1/2prb2p/4q3/4P3/2Q3NP/4BPP1/2RR2K1 b - - 5 33", solution: ["d6d1","e2d1"], solutionSan: ["Rxd1+","Bxd1"], rating: 1695, sourceRef: "Karpov – Lautier, Dortmund 1995 (33...Rxd1+ 34.Bxd1) : simplification supplémentaire, la faiblesse c6 reste intacte." },
    { fen: "4r1k1/3n1pp1/2p1b2p/4q3/4P3/2Q3NP/5PP1/2RB2K1 b - - 0 34", solution: ["e5c3","c1c3"], solutionSan: ["Qxc3","Rxc3"], rating: 1710, sourceRef: "Karpov – Lautier, Dortmund 1995 (34...Qxc3 35.Rxc3) : les Dames quittent l'échiquier, l'avantage structurel blanc persiste en finale." },
    { fen: "4r1k1/3n1bp1/5p1p/2p5/3NPPB1/2R4P/6P1/6K1 w - - 4 40", solution: ["d4b5","d7b6","b5d6"], solutionSan: ["Nb5","Nb6","Nd6"], rating: 1730, sourceRef: "Karpov – Lautier, Dortmund 1995 (40.Nb5 Nb6 41.Nd6) : vingt coups plus tard, le Cavalier blanc exploite enfin la faiblesse c6 créée au coup 20." },
    { fen: "r5k1/5bp1/3N1p1p/2p5/n3PPB1/R6P/6P1/6K1 w - - 10 43", solution: ["e4e5","f7d5","e5e6"], solutionSan: ["e5","Bd5","e6"], rating: 1755, sourceRef: "Karpov – Lautier, Dortmund 1995 (43.e5 Bd5 44.e6) : le pion passé central décide de la partie, Lautier abandonne." },
  ].map((p) => ({ themeId: "jh-module-9-la-minorite-d-attaque", ...p })),
  // `jh-module-10-le-sacrifice-positionnel-de-qualite` : 14 exercices
  // (2026-09-11, Lot 4), tirés de la partie RÉELLE Samuel Reshevsky – Tigran
  // Petrosian, Zurich Candidates 1953, ronde 2
  // (chessgames.com/perl/chessgame?gid=1106248, E58) — LA référence
  // historique du sacrifice positionnel de qualité (25...Re6!!, saluée par
  // Mikhaïl Tal). Le cahier des charges citait « Petrosian–Reshevsky »,
  // couleurs inversées — voir le docstring de `course-lesson.ts`.
  ...[
    { fen: "r1bq1rk1/pp3ppp/2n1pn2/2pp4/1bPP4/P1NBPN2/1P3PPP/R1BQ1RK1 b - - 0 8", solution: ["b4c3","b2c3"], solutionSan: ["Bxc3","bxc3"], rating: 1500, sourceRef: "Reshevsky – Petrosian, Zurich 1953 (8...Bxc3 9.bxc3) : les pions blancs doublent, premier déséquilibre structurel de la partie." },
    { fen: "r1bq1rk1/p4ppp/1pn1pn2/2pp4/2PP4/P1PBPN2/5PPP/R1BQ1RK1 w - - 0 10", solution: ["c4d5","e6d5"], solutionSan: ["cxd5","exd5"], rating: 1520, sourceRef: "Reshevsky – Petrosian, Zurich 1953 (10.cxd5 exd5) : échange central qui donne aux Noirs un pion d5 isolé en miroir." },
    { fen: "r1bq1rk1/p4ppp/1pn2n2/2pp4/3P4/P1PBPN2/1B3PPP/R2Q1RK1 b - - 1 11", solution: ["c5c4"], solutionSan: ["c4"], rating: 1540, sourceRef: "Reshevsky – Petrosian, Zurich 1953 (11...c4) : Petrosian verrouille la chaîne de pions, prophylaxie avant toute tactique." },
    { fen: "r2q1rk1/p4ppp/1pn3b1/3p4/2pP4/P1P1PP2/1BBQ2PP/R4RK1 w - - 1 17", solution: ["e3e4"], solutionSan: ["e4"], rating: 1560, sourceRef: "Reshevsky – Petrosian, Zurich 1953 (17.e4) : les Blancs rompent enfin au centre, gagnant de l'espace." },
    { fen: "r4rk1/p2q1ppp/1pn3b1/3p4/2pPP3/P1P2P2/1BBQ2PP/4RRK1 b - - 2 18", solution: ["d5e4","f3e4"], solutionSan: ["dxe4","fxe4"], rating: 1580, sourceRef: "Reshevsky – Petrosian, Zurich 1953 (18...dxe4 19.fxe4) : reprise qui ouvre la colonne f blanche." },
    { fen: "r5k1/p2qrppp/2n3b1/1p6/2pPPQ2/P1P5/1B4PP/3BRRK1 w - - 2 22", solution: ["d1g4"], solutionSan: ["Bg4"], rating: 1600, sourceRef: "Reshevsky – Petrosian, Zurich 1953 (22.Bg4) : le Fou blanc vise directement le pion e6." },
    { fen: "r3q1k1/p3rppp/2n3b1/1p6/2pPPQB1/P1P5/1B4PP/4RRK1 w - - 4 23", solution: ["e4e5"], solutionSan: ["e5"], rating: 1615, sourceRef: "Reshevsky – Petrosian, Zurich 1953 (23.e5) : nouvel gain d'espace central, la tension monte." },
    { fen: "3rq1k1/4rppp/2n3b1/pp2P3/2pP1QB1/P1P1R3/1B4PP/4R1K1 b - - 3 25", solution: ["e7e6"], solutionSan: ["Re6"], rating: 1635, sourceRef: "Reshevsky – Petrosian, Zurich 1953 (25...Re6!!) : LE coup de la partie — un sacrifice positionnel de qualité offert sans échec ni menace directe, salué par Mikhaïl Tal." },
    { fen: "3rq1k1/4nppp/4r1b1/pp2P3/P1pP1QB1/2P1R3/1B4PP/4R1K1 w - - 1 27", solution: ["g4e6","f7e6"], solutionSan: ["Bxe6","fxe6"], rating: 1660, sourceRef: "Reshevsky – Petrosian, Zurich 1953 (27.Bxe6 fxe6) : l'échange est accepté, les pions noirs fusionnent en un duo central massif." },
    { fen: "3rq1k1/6pp/4p3/pp1nP3/P1pP4/2Pb1R2/1B4PP/4RQK1 w - - 4 30", solution: ["f3d3","c4d3"], solutionSan: ["Rxd3","cxd3"], rating: 1685, sourceRef: "Reshevsky – Petrosian, Zurich 1953 (30.Rxd3 cxd3) : nouvel échange, la compensation positionnelle noire persiste malgré les simplifications." },
    { fen: "3rq1k1/6pp/4p3/pp1nP3/P2P4/2Pp4/1B4PP/4RQK1 w - - 0 31", solution: ["f1d3"], solutionSan: ["Qxd3"], rating: 1700, sourceRef: "Reshevsky – Petrosian, Zurich 1953 (31.Qxd3) : reprise de Dame, matériellement les Blancs restent en tête de qualité contre pion." },
    { fen: "3rq1k1/6pp/4p3/p2nP3/Pp1P4/2PQ4/1B4PP/4R1K1 w - - 0 32", solution: ["c3b4","a5b4"], solutionSan: ["cxb4","axb4"], rating: 1720, sourceRef: "Reshevsky – Petrosian, Zurich 1953 (32.cxb4 axb4) : les pions se dégagent encore à l'aile dame, la marche du pion noir se poursuit." },
    { fen: "r5k1/6pp/Pq2p3/3nP3/1p1P4/3Q4/3B2PP/R5K1 b - - 2 37", solution: ["b4b3"], solutionSan: ["b3"], rating: 1740, sourceRef: "Reshevsky – Petrosian, Zurich 1953 (37...b3) : le pion passé noir continue inexorablement sa course." },
    { fen: "r5k1/6p1/Pq2p2p/3nP3/2QP4/1p5P/3B2P1/R5K1 b - - 0 39", solution: ["b3b2"], solutionSan: ["b2"], rating: 1760, sourceRef: "Reshevsky – Petrosian, Zurich 1953 (39...b2) : la compensation se matérialise enfin — un pion passé qui va paralyser une Tour blanche entière ; la partie se conclura nulle." },
  ].map((p) => ({ themeId: "jh-module-10-le-sacrifice-positionnel-de-qualite", ...p })),
  // (2026-09-12, Lot 5) Vague de 12 puzzles pour `jh-module-11` — aucun nouveau
  // tutoriel : la partie assignée (« Rubinstein–Vidmar, San Sebastian 1911 »)
  // s'est révélée être une nulle rapide en 22 coups sans le moindre contenu de
  // finale de tours (confirmé avant rédaction, AskUserQuestion) ; le thème
  // possédait déjà 14 CourseSteps réels et corrects sur exactement ce sujet
  // (Alekhine–Capablanca 1927, Capablanca–Tartakower New York 1924,
  // Rubinstein–Lasker Saint-Pétersbourg 1909) — seule la vague de puzzles
  // (un placeholder générique) manquait. Puzzles extraits de ces 3 mêmes
  // parties déjà présentes dans course-lesson.ts, chess.js-validés.
  ...[
    { fen: "8/5pk1/5rpp/8/P2R3P/6P1/5PK1/8 w - - 1 51", solution: ["a4a5"], solutionSan: ["a5"], rating: 1550, sourceRef: "Alekhine – Capablanca, Championnat du monde 1927 (51.a5) : créer le pion passé protégé qui sera la cible de toute la finale." },
    { fen: "8/5p2/k3r1p1/P6p/5K1P/6P1/R4P2/8 w - - 16 65", solution: ["f4g5","e6e5","g5h6","e5f5"], solutionSan: ["Kg5","Re5+","Kh6","Rf5"], rating: 1600, sourceRef: "Alekhine – Capablanca, Championnat du monde 1927 (65.Kg5!) : le Roi blanc s'avance activement au contact de l'adversaire, malgré les échecs." },
    { fen: "8/3r1pK1/k5p1/P4P1p/7P/R5P1/8/8 b - - 0 70", solution: ["g6f5","g7h6","f5f4","g3f4"], solutionSan: ["gxf5","Kh6","f4","gxf4"], rating: 1650, sourceRef: "Alekhine – Capablanca, Championnat du monde 1927 (71.gxf5 puis f4) : ouverture d'un second front de pions, le principe des deux faiblesses." },
    { fen: "8/5R2/2k5/7K/5P1P/8/8/7r w - - 1 82", solution: ["f7e7"], solutionSan: ["Re7"], rating: 1690, sourceRef: "Alekhine – Capablanca, Championnat du monde 1927 (82.Re7) : couper complètement la Tour noire achève la conversion." },
    { fen: "4k3/p1p5/1p3rp1/n2p4/P2P1P2/2PB2P1/6K1/7R b - - 1 29", solution: ["e8f8","h1h7"], solutionSan: ["Kf8","Rh7"], rating: 1560, sourceRef: "Capablanca – Tartakower, New York 1924 (29...Kf8 30.Rh7) : la Tour prend possession de la 7e rangée." },
    { fen: "5k2/p1p4R/1p3rp1/n2p4/P2P1P2/2PB2P1/6K1/8 b - - 3 30", solution: ["f6c6","g3g4","a5c4","g4g5"], solutionSan: ["Rc6","g4","Nc4","g5"], rating: 1610, sourceRef: "Capablanca – Tartakower, New York 1924 (31.g4! Nc4 32.g5) : gain d'espace et fixation du camp noir avant la percée décisive." },
    { fen: "5k2/p1p4R/1pr3p1/3p1BP1/P2P1P2/2P2K2/8/8 b - - 0 34", solution: ["g6f5","f3g3"], solutionSan: ["gxf5","Kg3"], rating: 1640, sourceRef: "Capablanca – Tartakower, New York 1924 (34...gxf5 35.Kg3) : le pion g devient passé, libre de toute entrave adverse." },
    { fen: "5k2/p1p4R/1p6/3p1pP1/P2P1P2/2r3K1/8/8 w - - 0 36", solution: ["g3h4","c3f3","g5g6"], solutionSan: ["Kh4","Rf3","g6"], rating: 1670, sourceRef: "Capablanca – Tartakower, New York 1924 (après 35...Rxc3+, 36.Kh4! Rf3 37.g6) : Capablanca sacrifie deux pions pour lancer son Roi vers f6, où « les pions noirs tombent comme des pommes mûres »." },
    { fen: "4r2k/p1R5/1p4P1/3p1K2/P2P4/8/8/8 b - - 0 42", solution: ["e8e4","f5f6","e4f4"], solutionSan: ["Re4","Kf6","Rf4+"], rating: 1700, sourceRef: "Capablanca – Tartakower, New York 1924 (42...Re4 43.Kf6 Rf4+) : Roi + pion passé + Tour à la 7e, la coordination parfaite l'emporte sur le matériel." },
    { fen: "8/p2rk1pp/8/5p2/5R2/4P3/PP4PP/6K1 w - - 0 24", solution: ["f4f5","d7d1","g1f2","d1d2"], solutionSan: ["Rxf5","Rd1+","Kf2","Rd2+"], rating: 1540, sourceRef: "Rubinstein – Lasker, Saint-Pétersbourg 1909 (24.Rxf5! Rd1+ 25.Kf2 Rd2+) : encaisser le pion puis centraliser le Roi malgré les échecs." },
    { fen: "8/p3k1pp/8/R7/8/4PK2/Pr4PP/8 b - - 1 27", solution: ["b2b7","a5a6","e7f8","e3e4"], solutionSan: ["Rb7","Ra6","Kf8","e4"], rating: 1600, sourceRef: "Rubinstein – Lasker, Saint-Pétersbourg 1909 (28.Rb7 Ra6 Kf8 29.e4) : Rubinstein prend son temps, plaçant sa Tour de façon active avant de progresser." },
    { fen: "8/p1r2kp1/R6p/4PK1P/6P1/8/P7/8 b - - 0 35", solution: ["c7b7","a6d6","f7e7","d6a6"], solutionSan: ["Rb7","Rd6","Ke7","Ra6"], rating: 1650, sourceRef: "Rubinstein – Lasker, Saint-Pétersbourg 1909 (36.Rb7 Rd6 Ke7 37.Ra6) : la Tour blanche harcèle sans relâche pendant que le Roi blanc avance." },
  ].map((p) => ({ themeId: "jh-module-11-les-finales-de-tours-pratiques", ...p })),
  // (2026-09-12, Lot 5) `jh-module-12` : Topalov (Blancs) – Shirov (Noirs),
  // Linares 1998 ronde 10 (D85, Gambit Dame Refusé Grünfeld Échange). Le
  // cahier des charges citait « Shirov–Topalov » mais les couleurs sont en
  // réalité inversées (confirmé, AskUserQuestion) — la partie EST la plus
  // célèbre finale de Fous de couleurs opposées de l'histoire, avec le
  // sacrifice 47...Bh3!!. 14 nouveaux CourseSteps prépendés dans
  // course-lesson.ts + vague de 14 puzzles ci-dessous, même partie.
  ...[
    { fen: "rnbqkb1r/ppp1pp1p/6p1/3n4/3P4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 5", solution: ["e2e4","d5c3"], solutionSan: ["e4","Nxc3"], rating: 1500, sourceRef: "Topalov – Shirov, Linares 1998 (5.e4! Nxc3) : dès l'ouverture, Blanc accepte une structure qui, plus tard, débouchera sur des Fous de couleurs opposées." },
    { fen: "r2r2k1/p3qpbp/2p1b1p1/1p2p3/2nPP3/1BP2P2/P1Q1N1PP/2BR1RK1 w - - 0 17", solution: ["f3f4","e5d4","e2d4","e6g4"], solutionSan: ["f4","exd4","Nxd4","Bg4"], rating: 1530, sourceRef: "Topalov – Shirov, Linares 1998 (17.f4 exd4 18.Nxd4 Bg4) : la tension centrale se résout, chaque camp active ses pièces." },
    { fen: "r2r2k1/3b1pbp/2p3p1/ppq5/2nNPP2/1BP4P/P1Q3P1/2B1RR1K w - - 1 22", solution: ["a2a4","b5a4","b3a2","d7e8"], solutionSan: ["a4","bxa4","Ba2","Be8"], rating: 1550, sourceRef: "Topalov – Shirov, Linares 1998 (22.a4 bxa4 23.Ba2 Be8) : Topalov ouvre l'aile dame pour ses pièces avant l'assaut central." },
    { fen: "r2rb1k1/5pbp/2p3p1/p1q5/p1nNPP2/2P4P/B1Q3P1/2B1RR1K w - - 2 24", solution: ["e4e5","c4b6","f4f5","b6d5"], solutionSan: ["e5","Nb6","f5","Nd5"], rating: 1580, sourceRef: "Topalov – Shirov, Linares 1998 (24.e5 Nb6 25.f5 Nd5) : les pions f et e blancs gagnent de l'espace, chassant le Cavalier noir." },
    { fen: "r2rb1k1/5pbp/2p3p1/p1q1PP2/pn1N4/2P4P/B1QB2P1/4RR1K w - - 3 27", solution: ["c2a4","b4a2","a4a2","g7e5"], solutionSan: ["Qxa4","Nxa2","Qxa2","Bxe5"], rating: 1600, sourceRef: "Topalov – Shirov, Linares 1998 (27.Qxa4 Nxa2 28.Qxa2 Bxe5) : échange de pièces mineures, chaque camp reprend son dû." },
    { fen: "r2rb1k1/5p2/2p3p1/p1q1b3/3N4/2P4P/Q2B2P1/4RR1K w - - 0 30", solution: ["d2g5","d8d5","e1e3","c5d6"], solutionSan: ["Bg5","Rd5","Re3","Qd6"], rating: 1630, sourceRef: "Topalov – Shirov, Linares 1998 (30.Bg5 Rd5 31.Re3 Qd6) : Topalov regroupe ses pièces lourdes vers le centre." },
    { fen: "r5k1/3b1p2/2pq2p1/p2rb1B1/3N4/2P1R2P/4Q1P1/5R1K w - - 6 33", solution: ["c3c4","e5d4","c4d5","d4e3"], solutionSan: ["c4","Bxd4","cxd5","Bxe3"], rating: 1660, sourceRef: "Topalov – Shirov, Linares 1998 (33.c4! Bxd4 34.cxd5 Bxe3) : LA séquence clé — après ces échanges, chaque camp ne conserve plus qu'un seul Fou, et ils sont de couleurs opposées." },
    { fen: "r5k1/3b1p2/2pq2p1/p2P2B1/8/4b2P/4Q1P1/5R1K w - - 0 35", solution: ["e2e3","a8e8","e3c3","d6d5"], solutionSan: ["Qxe3","Re8","Qc3","Qxd5"], rating: 1690, sourceRef: "Topalov – Shirov, Linares 1998 (35.Qxe3 Re8 36.Qc3 Qxd5) : la position se stabilise, Dames et Tours encore présentes autour des Fous opposés." },
    { fen: "4r1k1/3b1p2/2p3p1/p2q2B1/8/2Q4P/6P1/5R1K w - - 0 37", solution: ["g5h6","e8e5","f1f3","d5c5"], solutionSan: ["Bh6","Re5","Rf3","Qc5"], rating: 1710, sourceRef: "Topalov – Shirov, Linares 1998 (37.Bh6! Re5 38.Rf3 Qc5) : le Fou blanc, de la bonne couleur pour attaquer, vise directement le roi noir." },
    { fen: "6k1/8/2p2ppB/p1q1rb2/8/4R2P/6P1/Q6K w - - 0 41", solution: ["e3e5","c5e5","a1a2","e5d5"], solutionSan: ["Rxe5","Qxe5","Qa2+","Qd5"], rating: 1740, sourceRef: "Topalov – Shirov, Linares 1998 (41.Rxe5 Qxe5 42.Qa2+ Qd5) : simplification vers l'échange de Dames à venir." },
    { fen: "6k1/8/2p2ppB/p2q1b2/8/7P/Q5P1/7K w - - 2 43", solution: ["a2d5","c6d5"], solutionSan: ["Qxd5+","cxd5"], rating: 1760, sourceRef: "Topalov – Shirov, Linares 1998 (43.Qxd5+! cxd5) : LE moment de transition — l'échange des Dames fait basculer la partie dans une pure finale de Fous de couleurs opposées, réputée nulle." },
    { fen: "8/8/4kpp1/3p1b2/p6P/2B5/6P1/7K w - - 1 47", solution: ["h1g1","f5h3","g2h3"], solutionSan: ["Kg1","Bh3","gxh3"], rating: 1800, sourceRef: "Topalov – Shirov, Linares 1998 (47.Kg1 Bh3!! 48.gxh3) : LE sacrifice le plus célèbre de l'histoire des finales de Fous opposés — trouvez le coup qui transforme une position jugée nulle en victoire forcée." },
    { fen: "8/8/5pp1/3p1k2/p6P/2B4P/8/6K1 w - - 1 49", solution: ["g1f2","f5e4","c3f6","d5d4"], solutionSan: ["Kf2","Ke4","Bxf6","d4"], rating: 1820, sourceRef: "Topalov – Shirov, Linares 1998 (49.Kf2 Ke4 50.Bxf6 d4!) : le pion passé noir se met en marche pendant que le Fou blanc, seul, ne peut être partout." },
    { fen: "8/8/5Bp1/8/p2pk2P/7P/5K2/8 w - - 0 51", solution: ["f6e7","e4d3","e7c5","d3c4","c5e7","c4b3"], solutionSan: ["Be7","Kd3","Bc5","Kc4","Be7","Kb3"], rating: 1840, sourceRef: "Topalov – Shirov, Linares 1998 (51.Be7 Kd3 52.Bc5 Kc4 53.Be7 Kb3) : le Roi noir s'infiltre définitivement, Blanc abandonne." },
  ].map((p) => ({ themeId: "jh-module-12-les-finales-de-fous-de-couleurs-opposees", ...p })),
  // (2026-09-12, Lot 5) `jh-module-13` : Capablanca (Blancs) – Yates (Noirs),
  // Hastings 1930/31 ronde 2 (D63, Dame Refusé Orthodoxe), 87 coups, 1-0. Le
  // cahier des charges citait « Capablanca–Nimzowitsch, Saint-Pétersbourg
  // 1914 » — partie inexistante dans ce sens (seule partie de ce tournoi est
  // Nimzowitsch(Blancs)–Capablanca(Noirs), DÉJÀ utilisée dans jh-module-7, et
  // sans le moindre échange de Dames sur ses 42 coups) ; remplacée après
  // validation utilisateur par cette partie, réputée « la meilleure partie de
  // Capablanca », qui contient un vrai échange de Dames (23...Qxb1! 24.Nxb1)
  // suivi d'une conversion technique complète vers une finale de pions gagnée.
  // Premier tutoriel réel de ce thème (8 CourseSteps, aucun contenu préexistant).
  ...[
    { fen: "r1bq1rk1/pppnbppp/4pn2/3p2B1/2PP4/2N1PN2/PP3PPP/2RQKB1R b K - 4 7", solution: ["c7c6","f1d3","d5c4","d3c4"], solutionSan: ["c6","Bd3","dxc4","Bxc4"], rating: 1500, sourceRef: "Capablanca – Yates, Hastings 1930/31 (8.Bd3 dxc4 9.Bxc4 a6) : structure Dame classique, Capablanca prépare la pression sur l'aile dame." },
    { fen: "r1bq1rk1/pp1nbppp/2p1pn2/6B1/2BP4/2N1PN2/PP3PPP/2RQK2R b K - 0 9", solution: ["a7a6","e1g1","b7b5","c4e2"], solutionSan: ["a6","O-O","b5","Be2"], rating: 1520, sourceRef: "Capablanca – Yates, Hastings 1930/31 (10.O-O b5 11.Be2 Bb7) : Noir gagne de l'espace à l'aile dame, sans encore réaliser le danger à venir." },
    { fen: "2rq1rk1/1b1nbppp/p1p1pn2/1p4B1/3P4/2N1PN2/PPQ1BPPP/2RR2K1 b - - 5 13", solution: ["c6c5","d4c5","c8c5","b2b4"], solutionSan: ["c5","dxc5","Rxc5","b4"], rating: 1550, sourceRef: "Capablanca – Yates, Hastings 1930/31 (14.dxc5! Rxc5 15.b4 Rc8) : la rupture centrale ouvre des lignes, la Tour noire est chassée." },
    { fen: "3q1rk1/1b1nbppp/p3pn2/1pr3B1/8/2N1PN2/PPQ1BPPP/2RR2K1 w - - 0 15", solution: ["b2b4","c5c8","c2b1","f6d5"], solutionSan: ["b4","Rc8","Qb1","Nd5"], rating: 1570, sourceRef: "Capablanca – Yates, Hastings 1930/31 (16.Qb1 Nd5 17.Nxd5 Bxg5) : Capablanca place sa Dame sur une case qui semble anodine — elle va pourtant devenir la cible d'un échange quelques coups plus tard." },
    { fen: "2rq1rk1/1b1nbppp/p3p3/1p1n2B1/1P6/2N1PN2/P3BPPP/1QRR2K1 w - - 3 17", solution: ["c3d5","e7g5","c1c8","b7c8"], solutionSan: ["Nxd5","Bxg5","Rxc8","Bxc8"], rating: 1600, sourceRef: "Capablanca – Yates, Hastings 1930/31 (18.Rxc8 Bxc8 19.Nxg5 Qxg5) : cascade d'échanges, la position se simplifie rapidement." },
    { fen: "2bq1rk1/3n1ppp/p3p3/1p1N2b1/1P6/4PN2/P3BPPP/1Q1R2K1 w - - 0 19", solution: ["f3g5","d8g5","d5c3","c8b7"], solutionSan: ["Nxg5","Qxg5","Nc3","Bb7"], rating: 1620, sourceRef: "Capablanca – Yates, Hastings 1930/31 (20.Nc3 Bb7 21.Ne4 Qg6) : Blanc regroupe son Cavalier vers le centre pendant que Noir cherche l'activité." },
    { fen: "5rk1/1b1n1ppp/p3p3/1p4q1/1P6/2N1P3/P3BPPP/1Q1R2K1 w - - 2 21", solution: ["c3e4","g5g6","e2f3","b7d5"], solutionSan: ["Ne4","Qg6","Bf3","Bd5"], rating: 1650, sourceRef: "Capablanca – Yates, Hastings 1930/31 (22.Bf3 Bd5 23.Nc3) : dernier coup avant la décision — Noir s'apprête à choisir d'échanger les Dames." },
    { fen: "5rk1/3n1ppp/p3p1q1/1p1b4/1P2N3/4PB2/P4PPP/1Q1R2K1 w - - 6 23", solution: ["e4c3","g6b1","c3b1"], solutionSan: ["Nc3","Qxb1","Nxb1"], rating: 1670, sourceRef: "Capablanca – Yates, Hastings 1930/31 (23...Qxb1! 24.Nxb1) : LE moment de transition du module — Yates échange les Dames, pensant la finale au moins équilibrée ; posez-vous toujours la question AVANT de jouer ce coup." },
    { fen: "5rk1/3n1ppp/p3p3/1p1b4/1P6/4PB2/P4PPP/1N1R2K1 b - - 0 24", solution: ["d7f6","b1c3","f8c8","c3d5","f6d5","f3d5","e6d5"], solutionSan: ["Nf6","Nc3","Rc8","Nxd5","Nxd5","Bxd5","exd5"], rating: 1700, sourceRef: "Capablanca – Yates, Hastings 1930/31 (24...Nf6 25.Nc3 Rc8 26.Nxd5 Nxd5 27.Bxd5 exd5) : les échanges continuent, Noir hérite d'un pion d5 isolé dans une pure finale de Tours." },
    { fen: "2r3k1/5ppp/p7/1p1p4/1P6/4P3/P4PPP/3R2K1 w - - 0 28", solution: ["g2g3","g7g6","d1d5","c8c2"], solutionSan: ["g3","g6","Rxd5","Rc2"], rating: 1720, sourceRef: "Capablanca – Yates, Hastings 1930/31 (28.g3 g6 29.Rxd5! Rc2) : Capablanca récupère le pion isolé, la petite supériorité structurelle devient concrète." },
    { fen: "6k1/5p1p/p5p1/1p1R4/1P6/4P1P1/P1r2P1P/6K1 w - - 1 30", solution: ["a2a4","b5a4","d5a5","c2a2"], solutionSan: ["a4","bxa4","Ra5","Ra2"], rating: 1740, sourceRef: "Capablanca – Yates, Hastings 1930/31 (30.a4 bxa4 31.Ra5 Ra2) : Blanc ouvre un second front à l'aile dame pour ses pions." },
    { fen: "6k1/5p1p/p5p1/R7/pP6/4P1P1/r4P1P/6K1 w - - 2 32", solution: ["a5a6","g8g7","g1g2","a4a3"], solutionSan: ["Rxa6","Kg7","Kg2","a3"], rating: 1760, sourceRef: "Capablanca – Yates, Hastings 1930/31 (32.Rxa6 Kg7 33.Kg2 a3) : le pion supplémentaire est engrangé, la conversion méthodique commence." },
    { fen: "1R6/5pk1/7p/4PP2/r3K1P1/8/8/8 w - - 5 69", solution: ["e4d5","a4a5","d5d6","a5a6"], solutionSan: ["Kd5","Ra5+","Kd6","Ra6+"], rating: 1800, sourceRef: "Capablanca – Yates, Hastings 1930/31 (69.Kd5! Ra5+ 70.Kd6 Ra6+) : après 60 coups de manœuvres, c'est le Roi blanc, inlassablement actif, qui fait toute la différence." },
    { fen: "7k/r4pR1/3K1P1p/4P3/6P1/8/8/8 w - - 15 83", solution: ["e5e6","a7a6","d6e7","a6e6","e7f7","e6e4","g4g5","h6g5"], solutionSan: ["e6","Ra6+","Ke7","Rxe6+","Kxf7","Re4","g5","hxg5"], rating: 1830, sourceRef: "Capablanca – Yates, Hastings 1930/31 (83.e6! Ra6+ 84.Ke7 Rxe6+ 85.Kxf7! Re4 86.g5 hxg5) : la combinaison finale gagne un pion décisif dans une finale de pions désormais totalement gagnante." },
  ].map((p) => ({ themeId: "jh-module-13-transition-milieu-de-partie-vers-finale", ...p })),
  // (2026-09-12, Lot 6) `jh-module-14` : Fischer (Blancs) – Taimanov (Noirs),
  // Vancouver 1971, Candidats quart de finale, partie 4 (B47, Sicilienne
  // Taimanov/Bastrikov), 71 coups, 1-0. LA partie assignée par le cahier des
  // charges, vérifiée exacte. 14 puzzles couvrant l'intégralité de la partie
  // (coups 14 à 71), même source que les 7 CourseSteps du tutoriel ajouté à
  // `course-lesson.ts` — le premier contenu réel de ce thème.
  ...[
    { fen: "r3k2r/1pq2pp1/p2p1n1p/2b1p3/4P1b1/2N1B1P1/PPPQ1PBP/3R1RK1 w kq - 2 14", solution: ["e3c5","d6c5","f2f3","g4e6","f3f4","a8d8"], solutionSan: ["Bxc5","dxc5","f3","Be6","f4","Rd8"], rating: 1520, sourceRef: "Fischer – Taimanov, Vancouver 1971 (14.Bxc5! dxc5) : créer à peu de frais un pion c5 isolé, la cible de toute la conversion à venir." },
    { fen: "3rk2r/1pq2pp1/p3bn1p/2p1p3/4PP2/2N3P1/PPPQ2BP/3R1RK1 w k - 1 17", solution: ["c3d5","e6d5","e4d5","e5e4","f1e1","d8d5","e1e4","e8d8"], solutionSan: ["Nd5","Bxd5","exd5","e4","Rfe1","Rxd5","Rxe4+","Kd8"], rating: 1550, sourceRef: "Fischer – Taimanov, Vancouver 1971 (17.Nd5!) : forcer une cascade d'échanges vers une finale déjà jugée gagnante — jamais l'inverse." },
    { fen: "3k3r/1pq2pp1/p4n1p/2pr4/4RP2/6P1/PPPQ2BP/3R2K1 w - - 1 21", solution: ["d2e2","d5d1","e2d1","c7d7","d1d7","d8d7"], solutionSan: ["Qe2","Rxd1+","Qxd1+","Qd7","Qxd7+","Kxd7"], rating: 1570, sourceRef: "Fischer – Taimanov, Vancouver 1971 (23.Qxd7+ Kxd7) : le jugement d'échange des Dames se confirme, la finale Fou contre Cavalier commence." },
    { fen: "7r/1p1k1pp1/p4n1p/2p5/4RP2/6P1/PPP3BP/6K1 w - - 0 24", solution: ["e4e5","b7b6","g2f1","a6a5","f1c4"], solutionSan: ["Re5","b6","Bf1","a5","Bc4"], rating: 1590, sourceRef: "Fischer – Taimanov, Vancouver 1971 (24.Re5 ... 26.Bc4) : fixer les pions noirs a6/c5/b6 sur les cases où le Fou pourra toujours les attaquer." },
    { fen: "7r/3k1pp1/1p3n1p/p1p1R3/2B2P2/6P1/PPP4P/6K1 b - - 1 26", solution: ["h8f8","g1g2","d7d6","g2f3","f6d7"], solutionSan: ["Rf8","Kg2","Kd6","Kf3","Nd7"], rating: 1610, sourceRef: "Fischer – Taimanov, Vancouver 1971 (27.Kg2 Kd6 28.Kf3 Nd7) : le Roi blanc commence sa longue marche vers le centre puis l'aile dame." },
    { fen: "5r2/3n1pp1/1p1k3p/p1p1R3/2B2P2/5KP1/PPP4P/8 w - - 6 29", solution: ["e5e3","d7b8","e3d3","d6c7","c2c3","b8c6"], solutionSan: ["Re3","Nb8","Rd3+","Kc7","c3","Nc6"], rating: 1630, sourceRef: "Fischer – Taimanov, Vancouver 1971 (29.Re3 Nb8 30.Rd3+ Kc7 31.c3 Nc6) : le Cavalier noir, sans case sûre, est déjà réduit à l'attente pure." },
    { fen: "5r2/5pp1/1pnk3p/p1p5/2B2P2/2P1RKP1/PP5P/8 w - - 3 33", solution: ["a2a4","c6e7","h2h3","e7c6","h3h4","h6h5"], solutionSan: ["a4","Ne7","h3","Nc6","h4","h5"], rating: 1650, sourceRef: "Fischer – Taimanov, Vancouver 1971 (33.a4 ... 35.h5) : gain d'espace des deux côtés pendant que le Cavalier noir shuttle sans but." },
    { fen: "8/3k2p1/1pn2r2/p1p2p1p/P1B2P1P/2P2KP1/1P2R3/8 w - - 4 40", solution: ["e2e3","g7g6","c4b5","f6d6","f3e2","d7d8","e3d3","d8c7","d3d6","c7d6"], solutionSan: ["Re3","g6","Bb5","Rd6","Ke2","Kd8","Rd3","Kc7","Rxd6","Kxd6"], rating: 1670, sourceRef: "Fischer – Taimanov, Vancouver 1971 (40.Re3 ... 44.Rxd6 Kxd6) : réduire vers la pure finale de pièces mineures où le Fou domine." },
    { fen: "8/8/1pnk2p1/pBp2p1p/P4P1P/2P3P1/1P2K3/8 w - - 0 45", solution: ["e2d3","c6e7","b5e8","d6d5","e8f7","d5d6","d3c4","d6c6","f7e8","c6b7","c4b5"], solutionSan: ["Kd3","Ne7","Be8","Kd5","Bf7+","Kd6","Kc4","Kc6","Be8+","Kb7","Kb5"], rating: 1690, sourceRef: "Fischer – Taimanov, Vancouver 1971 (45.Kd3 ... 50.Kb5) : le Roi et le Fou tissent ensemble un réseau de cases qui emprisonne le Cavalier." },
    { fen: "8/2k1n3/1p4p1/pKpB1p1p/P4P1P/2P3P1/1P6/8 w - - 16 53", solution: ["d5f7","c7b7","f7b3","b7a7","b3d1","a7b7","d1f3","b7c7"], solutionSan: ["Bf7","Kb7","Bb3","Ka7","Bd1","Kb7","Bf3+","Kc7"], rating: 1700, sourceRef: "Fischer – Taimanov, Vancouver 1971 (53.Bf7 ... 56.Bf3+) : le Fou navigue seul d'un réseau de cases à l'autre, le Cavalier ne peut qu'observer." },
    { fen: "8/2k1n3/1p4p1/pKp2p1p/P4P1P/2P2BP1/1P6/8 w - - 24 57", solution: ["b5a6","e7g8","f3d5","g8e7","d5c4","e7c6"], solutionSan: ["Ka6","Ng8","Bd5","Ne7","Bc4","Nc6"], rating: 1710, sourceRef: "Fischer – Taimanov, Vancouver 1971 (57.Ka6 ... 59.Bc4) : le Roi blanc s'infiltre profondément, le Cavalier noir shuffle sans la moindre case sûre." },
    { fen: "3kB3/4n3/Kp4p1/p1p2p1p/P4P1P/2P3P1/1P6/8 w - - 34 62", solution: ["e8g6","e7g6","a6b6","d8d7","b6c5"], solutionSan: ["Bxg6","Nxg6","Kxb6","Kd7","Kxc5"], rating: 1730, sourceRef: "Fischer – Taimanov, Vancouver 1971 (62.Bxg6! Nxg6 63.Kxb6 ... 64.Kxc5) : la restriction devient enfin un gain matériel concret." },
    { fen: "8/3k4/6n1/p1K2p1p/P4P1P/2P3P1/1P6/8 b - - 0 64", solution: ["g6e7","b2b4","a5b4","c3b4","e7c8","a4a5","c8d6","b4b5","d6e4"], solutionSan: ["Ne7","b4","axb4","cxb4","Nc8","a5","Nd6","b5","Ne4+"], rating: 1760, sourceRef: "Fischer – Taimanov, Vancouver 1971 (65.b4 ... 68.b5) : la majorité de pions à l'aile dame, jusque-là latente, devient soudain décisive." },
    { fen: "8/3k4/8/PPK2p1p/4nP1P/6P1/8/8 w - - 1 69", solution: ["c5b6","d7c8","b6c6","c8b8","b5b6"], solutionSan: ["Kb6","Kc8","Kc6","Kb8","b6"], rating: 1790, sourceRef: "Fischer – Taimanov, Vancouver 1971 (69.Kb6 ... 71.b6) : le pion b devient imparable, Noir abandonne — quarante coups de patience enfin récompensés." },
  ].map((p) => ({ themeId: "jh-module-14-l-art-de-la-conversion", ...p })),
  // (2026-09-12, Lot 6) `jh-module-15` : Capablanca (Blancs) – Steiner (Noirs),
  // exhibition d'échecs vivants, Los Angeles 1933 (C49, Quatre Cavaliers
  // Espagnole Symétrique), 25 coups, 1-0 (mat, 25.Qb4#). LA partie assignée
  // par le cahier des charges, vérifiée exacte. 13 puzzles, même source que
  // les 6 CourseSteps du tutoriel ajouté à `course-lesson.ts` — le premier
  // contenu réel de ce thème. Cette même partie alimente déjà 5 puzzles de
  // `pm-la-securite-du-roi-en-milieu-de-partie` (coups 13, 14, 17, 19, 23, 24
  // — étude Lichess « King safety » de FM Heineccius) : chaque position
  // ci-dessous a été délibérément choisie à un point de la partie NON DÉJÀ
  // utilisé par ce thème (coups 4 à 12, puis les demi-coups noirs intercalés
  // des coups 13 à 25), pour zéro collision de FEN — vérifié programmatiquement
  // (chess.js, voir le script de génération) avant écriture.
  ...[
    { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4", solution: ["f1b5","f8b4"], solutionSan: ["Bb5","Bb4"], rating: 1480, sourceRef: "Capablanca – Steiner, Los Angeles 1933 (4.Bb5 Bb4) : le clouage symétrique caractéristique des Quatre Cavaliers, chaque camp visant sa propre configuration idéale de pièces mineures." },
    { fen: "r1bqk2r/pppp1ppp/2n2n2/1B2p3/1b2P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 6 5", solution: ["e1g1","e8g8","d2d3","d7d6"], solutionSan: ["O-O","O-O","d3","d6"], rating: 1500, sourceRef: "Capablanca – Steiner, Los Angeles 1933 (5.O-O O-O 6.d3 d6) : mise en place tranquille, la tension du clouage reste entière." },
    { fen: "r1bq1rk1/ppp2ppp/2np1n2/1B2p3/1b2P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", solution: ["c1g5","b4c3","b2c3","c6e7"], solutionSan: ["Bg5","Bxc3","bxc3","Ne7"], rating: 1520, sourceRef: "Capablanca – Steiner, Los Angeles 1933 (7.Bg5 Bxc3 8.bxc3 Ne7) : la paire de Fous blancs naît de l'échange consenti par Noir." },
    { fen: "r1bq1rk1/ppp1nppp/3p1n2/1B2p1B1/4P3/2PP1N2/P1P2PPP/R2Q1RK1 w - - 1 9", solution: ["f3h4","c7c6","b5c4","c8e6"], solutionSan: ["Nh4","c6","Bc4","Be6"], rating: 1550, sourceRef: "Capablanca – Steiner, Los Angeles 1933 (9.Nh4 c6 10.Bc4 Be6) : le Cavalier blanc vise f5 pendant que les Fous restent actifs des deux côtés." },
    { fen: "r2q1rk1/pp2nppp/2ppbn2/4p1B1/2B1P2N/2PP4/P1P2PPP/R2Q1RK1 w - - 2 11", solution: ["g5f6","g7f6","c4e6","f7e6"], solutionSan: ["Bxf6","gxf6","Bxe6","fxe6"], rating: 1580, sourceRef: "Capablanca – Steiner, Los Angeles 1933 (11.Bxf6! gxf6 12.Bxe6! fxe6) : LE critère du module — sacrifier les deux Fous pour ouvrir les deux ailes noires à la fois." },
    { fen: "r2q1rk1/pp2n2p/2pppp2/4p3/4P1QN/2PP4/P1P2PPP/R4RK1 b - - 1 13", solution: ["g8f7","f2f4","f8g8","g4h5"], solutionSan: ["Kf7","f4","Rg8","Qh5+"], rating: 1605, sourceRef: "Capablanca – Steiner, Los Angeles 1933 (13...Kf7 14.f4 Rg8 15.Qh5+) : sans Fou pour couvrir les cases noires, le Roi ne trouve nul refuge." },
    { fen: "r2q2r1/pp2nk1p/2pppp2/4p3/4PPQN/2PP4/P1P3PP/R4RK1 w - - 1 15", solution: ["g4h5","f7g7","f4e5","d6e5"], solutionSan: ["Qh5+","Kg7","fxe5","dxe5"], rating: 1625, sourceRef: "Capablanca – Steiner, Los Angeles 1933 (15.Qh5+ Kg7 16.fxe5 dxe5) : l'ouverture du centre poursuit le travail commencé par le sacrifice des Fous." },
    { fen: "r2q2r1/pp2n1kp/2p1pR2/4p2Q/4P2N/2PP4/P1P3PP/R5K1 b - - 0 17", solution: ["g7f6","a1f1","e7f5","h4f5"], solutionSan: ["Kxf6","Rf1+","Nf5","Nxf5"], rating: 1645, sourceRef: "Capablanca – Steiner, Los Angeles 1933 (17...Kxf6 18.Rf1+ Nf5 19.Nxf5) : le Roi noir, mis à nu, doit marcher à pied jusqu'au centre de l'échiquier." },
    { fen: "r2q2r1/pp5p/2p1pk2/4pN1Q/4P3/2PP4/P1P3PP/5RK1 b - - 0 19", solution: ["e6f5","f1f5","f6e7"], solutionSan: ["exf5","Rxf5+","Ke7"], rating: 1665, sourceRef: "Capablanca – Steiner, Los Angeles 1933 (19...exf5 20.Rxf5+ Ke7) : le Roi noir continue sa fuite forcée, toujours sans appui de pièce mineure." },
    { fen: "r2q2r1/pp2k2p/2p5/4pR1Q/4P3/2PP4/P1P3PP/6K1 w - - 1 21", solution: ["h5f7","e7d6"], solutionSan: ["Qf7+","Kd6"], rating: 1685, sourceRef: "Capablanca – Steiner, Los Angeles 1933 (21.Qf7+ Kd6) : la Dame et la Tour blanches chassent maintenant le Roi vers l'aile dame." },
    { fen: "r2q2r1/pp3Q1p/2pk4/4pR2/4P3/2PP4/P1P3PP/6K1 w - - 3 22", solution: ["f5f6","d6c5"], solutionSan: ["Rf6+","Kc5"], rating: 1695, sourceRef: "Capablanca – Steiner, Los Angeles 1933 (22.Rf6+ Kc5) : la seconde aile, ouverte dès le coup 9 (...c6), s'avère tout aussi vulnérable." },
    { fen: "r2q2r1/pQ5p/2p2R2/2k1p3/4P3/2PP4/P1P3PP/6K1 b - - 0 23", solution: ["d8b6","f6c6","b6c6"], solutionSan: ["Qb6","Rxc6+","Qxc6"], rating: 1720, sourceRef: "Capablanca – Steiner, Los Angeles 1933 (23...Qb6 24.Rxc6+! Qxc6) : les derniers points d'appui noirs à l'aile dame tombent un à un." },
    { fen: "r5r1/pQ5p/2q5/2k1p3/4P3/2PP4/P1P3PP/6K1 w - - 0 25", solution: ["b7b4"], solutionSan: ["Qb4#"], rating: 1750, sourceRef: "Capablanca – Steiner, Los Angeles 1933 (25.Qb4#) : mat — conséquence directe du sacrifice des deux Fous aux coups 11 et 12." },
  ].map((p) => ({ themeId: "jh-module-15-fou-contre-cavalier-mode-d-emploi", ...p })),
  // (2026-09-12, Palier Or « Avancé », Lot 7) `jh-module-16` : Nimzowitsch –
  // Rubinstein, Dresde 1926 (46 coups, 1-0) remplace sa ligne théorique par
  // une vague réelle de 13 puzzles — voir `course-lesson.ts` pour la
  // justification du remplacement de la partie assignée à l'origine.
  ...[
    { fen: "r1b2r1k/1pq3pp/p1nb4/5p2/2Bp1P2/3P1QN1/PP1BR1PP/5RK1 w - - 0 18", solution: ["g3h1","c8d7"], solutionSan: ["Nh1","Bd7"], rating: 1600, sourceRef: "Nimzowitsch – Rubinstein, Dresde 1926 (18.Nh1! Bd7) : le Cavalier plonge sur la pire case du plateau pour un plan à long terme." },
    { fen: "r4r1k/1pqb2pp/p1nb4/5p2/2Bp1P2/3P1Q2/PP1BR1PP/5RKN w - - 2 19", solution: ["h1f2","a8e8"], solutionSan: ["Nf2","Rae8"], rating: 1610, sourceRef: "Nimzowitsch – Rubinstein, Dresde 1926 (19.Nf2 Rae8) : le regroupement continue, invisible pour l'adversaire." },
    { fen: "3n1r1k/1pqb2pp/p2b4/5p2/2Bp1P2/3P1Q2/PP1BRNPP/6K1 w - - 1 22", solution: ["f2h3","d7c6"], solutionSan: ["Nh3","Bc6"], rating: 1620, sourceRef: "Nimzowitsch – Rubinstein, Dresde 1926 (22.Nh3 Bc6) : le Cavalier ressort enfin, prêt pour g5." },
    { fen: "3n1r1k/1pq3pp/p1bb4/5p2/2Bp1P2/3P1Q1N/PP1BR1PP/6K1 w - - 3 23", solution: ["f3h5","g7g6"], solutionSan: ["Qh5","g6"], rating: 1630, sourceRef: "Nimzowitsch – Rubinstein, Dresde 1926 (23.Qh5 g6) : la pression sur l'aile roi force une nouvelle faiblesse." },
    { fen: "3n1r2/1pq3kp/p1bb2p1/5p2/2Bp1P1Q/3P3N/PP1BR1PP/6K1 w - - 2 25", solution: ["h4f2","d6c5"], solutionSan: ["Qf2","Bc5"], rating: 1640, sourceRef: "Nimzowitsch – Rubinstein, Dresde 1926 (25.Qf2 Bc5) : Nimzowitsch réoriente sa Dame sans hâte, le plan est encore loin d'être fini." },
    { fen: "3n1r2/1pq3kp/p1b3p1/2b2p2/2Bp1P2/3P3N/PP1BRQPP/6K1 w - - 4 26", solution: ["b2b4","c5b6"], solutionSan: ["b4","Bb6"], rating: 1650, sourceRef: "Nimzowitsch – Rubinstein, Dresde 1926 (26.b4! Bb6) : un second front s'ouvre à l'aile dame sans relâcher la pression à l'aile roi." },
    { fen: "3nr3/1pq3kp/pbb3p1/5p2/1PBp1P1Q/3P3N/P2BR1PP/6K1 w - - 3 28", solution: ["e2e5","d8f7"], solutionSan: ["Re5","Nf7"], rating: 1660, sourceRef: "Nimzowitsch – Rubinstein, Dresde 1926 (28.Re5! Nf7) : la Tour occupe la case préparée par les échanges précédents." },
    { fen: "4r3/1pq2nkp/pbb3p1/4Rp2/1PBp1P1Q/3P3N/P2B2PP/6K1 w - - 5 29", solution: ["c4f7","c7f7"], solutionSan: ["Bxf7","Qxf7"], rating: 1670, sourceRef: "Nimzowitsch – Rubinstein, Dresde 1926 (29.Bxf7 Qxf7) : élimination du dernier défenseur du roi noir." },
    { fen: "4r3/1p3qkp/pbb3p1/4Rp2/1P1p1P1Q/3P3N/P2B2PP/6K1 w - - 0 30", solution: ["h3g5","f7g8"], solutionSan: ["Ng5","Qg8"], rating: 1680, sourceRef: "Nimzowitsch – Rubinstein, Dresde 1926 (30.Ng5 Qg8) : le Cavalier atteint enfin g5, terme du voyage commencé au coup 18." },
    { fen: "4r1q1/1p4kp/pbb3p1/4RpN1/1P1p1P1Q/3P4/P2B2PP/6K1 w - - 2 31", solution: ["e5e8","c6e8"], solutionSan: ["Rxe8","Bxe8"], rating: 1690, sourceRef: "Nimzowitsch – Rubinstein, Dresde 1926 (31.Rxe8 Bxe8) : simplification qui profite au camp le mieux organisé." },
    { fen: "6q1/1p4kp/pbb3p1/5pN1/1P1p1P2/3P4/P2B2PP/4Q1K1 w - - 2 33", solution: ["e1e7","g7h8","b4b5","g8g7"], solutionSan: ["Qe7+","Kh8","b5","Qg7"], rating: 1700, sourceRef: "Nimzowitsch – Rubinstein, Dresde 1926 (33.Qe7+ Kh8 34.b5 Qg7) : les deux ailes convergent enfin l'une vers l'autre." },
    { fen: "7k/1p2Q1qp/pbb3p1/1P3pN1/3p1P2/3P4/P2B2PP/6K1 w - - 1 35", solution: ["e7g7","h8g7","b5c6","b7c6"], solutionSan: ["Qxg7+","Kxg7","bxc6","bxc6"], rating: 1710, sourceRef: "Nimzowitsch – Rubinstein, Dresde 1926 (35.Qxg7+ Kxg7 36.bxc6 bxc6) : le plan encaisse son premier gain matériel concret, la paire de Fous." },
    { fen: "8/2B1b2p/p3k1p1/2p2p2/2Np1P2/3P2P1/P6P/6K1 w - - 5 43", solution: ["c4b6","h7h6","h2h4","g6g5"], solutionSan: ["Nb6","h6","h4","g5"], rating: 1720, sourceRef: "Nimzowitsch – Rubinstein, Dresde 1926 (43.Nb6 h6 44.h4 g5) : conversion technique de la finale de pièces mineures, vingt coups après le début du plan." },
  ].map((p) => ({ themeId: "jh-module-16-construire-un-plan-a-long-terme", ...p })),
  // (2026-09-12, Palier Or « Avancé », Lot 7) `jh-module-17` : Fischer –
  // Myagmarsuren, Interzonal de Sousse 1967 (31 coups, 1-0) remplace sa
  // ligne théorique par une vague réelle de 13 puzzles.
  ...[
    { fen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/4P3/3P1NP1/PPPN1PBP/R1BQ1RK1 w - - 6 8", solution: ["e4e5","f6d7"], solutionSan: ["e5","Nd7"], rating: 1550, sourceRef: "Fischer – Myagmarsuren, Interzonal de Sousse 1967 (8.e5! Nd7) : un coup d'intuition positionnelle qui fixe la structure pour tout le reste de la partie." },
    { fen: "r1bq1rk1/p2nbppp/2n1p3/1pppP3/8/3P1NP1/PPPN1PBP/R1BQR1K1 w - - 0 10", solution: ["d2f1","b5b4"], solutionSan: ["Nf1","b4"], rating: 1565, sourceRef: "Fischer – Myagmarsuren, Interzonal de Sousse 1967 (10.Nf1 b4) : manœuvre tranquille, encore le registre de l'évaluation générale." },
    { fen: "r1bq1rk1/3nbppp/2n1p3/p1ppP3/1p5P/3P1NP1/PPP2PB1/R1BQRNK1 w - - 0 12", solution: ["c1f4","a5a4"], solutionSan: ["Bf4","a4"], rating: 1580, sourceRef: "Fischer – Myagmarsuren, Interzonal de Sousse 1967 (12.Bf4 a4) : les deux camps continuent d'avancer leurs pions par principe général, sans calcul forcé." },
    { fen: "r1bq1rk1/3nbppp/4p3/n1ppP3/p4B1P/P2P1NP1/2P2PB1/R2QRNK1 w - - 1 15", solution: ["f1e3","c8a6"], solutionSan: ["Ne3","Ba6"], rating: 1595, sourceRef: "Fischer – Myagmarsuren, Interzonal de Sousse 1967 (15.Ne3 Ba6) : dernier coup purement intuitif avant que la position ne se tende." },
    { fen: "r2q1rk1/3nbppp/b3p3/n1ppP3/p4B1P/P2PNNP1/2P2PB1/R2QR1K1 w - - 3 16", solution: ["g2h3","d5d4"], solutionSan: ["Bh3","d4"], rating: 1610, sourceRef: "Fischer – Myagmarsuren, Interzonal de Sousse 1967 (16.Bh3! d4) : la prophylaxie tranquille précède la bascule tactique." },
    { fen: "r2q1rk1/4bppp/bn2p3/n1p1P3/p2p1B1P/P2P1NPB/2P2P2/R2QRNK1 w - - 2 18", solution: ["f3g5","b6d5"], solutionSan: ["Ng5","Nd5"], rating: 1625, sourceRef: "Fischer – Myagmarsuren, Interzonal de Sousse 1967 (18.Ng5! Nd5) : le signal — dès qu'un saut de Cavalier menace des prises concrètes, il faut calculer." },
    { fen: "r2q1rk1/4bppp/b3p3/n1pnP1N1/p2p1B1P/P2P2PB/2P2P2/R2QRNK1 w - - 4 19", solution: ["f4d2","e7g5","d2g5","d8d7"], solutionSan: ["Bd2","Bxg5","Bxg5","Qd7"], rating: 1645, sourceRef: "Fischer – Myagmarsuren, Interzonal de Sousse 1967 (19.Bd2 Bxg5 20.Bxg5 Qd7) : séquence forcée, chaque coup doit être vérifié jusqu'au bout." },
    { fen: "r4rk1/3q1ppp/b3p3/n1pnP1B1/p2p3P/P2P2PB/2P2P2/R2QRNK1 w - - 1 21", solution: ["d1h5","f8c8"], solutionSan: ["Qh5","Rfc8"], rating: 1660, sourceRef: "Fischer – Myagmarsuren, Interzonal de Sousse 1967 (21.Qh5 Rfc8) : la Dame blanche s'installe pour l'assaut final, calculé à l'avance." },
    { fen: "r1r3k1/3q1ppp/b3p3/n1pnP1BQ/p2p3P/P2P2PB/2P2P2/R3RNK1 w - - 3 22", solution: ["f1d2","d5c3"], solutionSan: ["Nd2","Nc3"], rating: 1675, sourceRef: "Fischer – Myagmarsuren, Interzonal de Sousse 1967 (22.Nd2 Nc3) : Noir cherche sa propre contre-chance calculée, une fourchette potentielle." },
    { fen: "r1r3k1/3q1ppp/b3p3/n1p1P1BQ/p2p3P/P1nP2PB/2PN1P2/R3R1K1 w - - 5 23", solution: ["g5f6","d7e8"], solutionSan: ["Bf6","Qe8"], rating: 1690, sourceRef: "Fischer – Myagmarsuren, Interzonal de Sousse 1967 (23.Bf6 Qe8) : Fischer ferme toutes les issues avant de continuer le calcul de l'attaque." },
    { fen: "r1r1q1k1/5ppp/b3pB2/n1p1P2Q/p2p3P/P1nP2PB/2PN1P2/R3R1K1 w - - 7 24", solution: ["d2e4","g7g6","h5g5","c3e4"], solutionSan: ["Ne4","g6","Qg5","Nxe4"], rating: 1705, sourceRef: "Fischer – Myagmarsuren, Interzonal de Sousse 1967 (24.Ne4 g6 25.Qg5 Nxe4) : la course commence — chaque tempo compte des deux côtés." },
    { fen: "r1r1q1k1/5p1p/b3pBp1/n1p1P1Q1/p2pn2P/P2P2PB/2P2P2/R3R1K1 w - - 0 26", solution: ["e1e4","c5c4","h4h5","c4d3"], solutionSan: ["Rxe4","c4","h5","cxd3"], rating: 1720, sourceRef: "Fischer – Myagmarsuren, Interzonal de Sousse 1967 (26.Rxe4 c4 27.h5 cxd3) : calcul pur de la course des pions passés contre l'attaque de mat." },
    { fen: "2r1q1k1/r4p1p/b3pBp1/n3P1QP/p2p3R/P5P1/2p2PB1/R5K1 w - - 0 30", solution: ["g5h6","e8f8","h6h7"], solutionSan: ["Qh6","Qf8","Qxh7+"], rating: 1740, sourceRef: "Fischer – Myagmarsuren, Interzonal de Sousse 1967 (30.Qh6 Qf8 31.Qxh7+) : le calcul gagne la course d'exactement un tempo." },
  ].map((p) => ({ themeId: "jh-module-17-calcul-et-intuition-positionnelle", ...p })),
  // (2026-09-12, Palier Or « Avancé », Lot 7) `jh-module-18` : Deep Blue –
  // Kasparov, Philadelphie 1996, Partie 1 (37 coups, 1-0) remplace sa ligne
  // théorique par une vague réelle de 14 puzzles.
  ...[
    { fen: "2r2rk1/pp2qppp/1bn1pn2/1N2N1B1/3P4/P6P/1P2QPP1/2R2RK1 w - - 5 18", solution: ["g5f6","g7f6"], solutionSan: ["Bxf6","gxf6"], rating: 1600, sourceRef: "Deep Blue – Kasparov, Philadelphie 1996, Partie 1 (18.Bxf6! gxf6) : choix statique, endommager durablement la structure noire." },
    { fen: "2r2rk1/pp2qp1p/1bn1pp2/1N2N3/3P4/P6P/1P2QPP1/2R2RK1 w - - 0 19", solution: ["e5c4","f8d8"], solutionSan: ["Nc4","Rfd8"], rating: 1615, sourceRef: "Deep Blue – Kasparov, Philadelphie 1996, Partie 1 (19.Nc4 Rfd8) : le Cavalier vise b6, une faiblesse statique fraîchement créée." },
    { fen: "2rr2k1/pp2qp1p/1bn1pp2/1N6/2NP4/P6P/1P2QPP1/2R2RK1 w - - 2 20", solution: ["c4b6","a7b6"], solutionSan: ["Nxb6","axb6"], rating: 1630, sourceRef: "Deep Blue – Kasparov, Philadelphie 1996, Partie 1 (20.Nxb6 axb6) : récolte immédiate, les pions noirs restent durablement affaiblis." },
    { fen: "2rr2k1/1p2qp1p/1pn1p3/1N3p2/3P4/P6P/1P2QPP1/2RR2K1 w - - 0 22", solution: ["e2e3","e7f6"], solutionSan: ["Qe3","Qf6"], rating: 1645, sourceRef: "Deep Blue – Kasparov, Philadelphie 1996, Partie 1 (22.Qe3 Qf6) : Deep Blue prépare tranquillement le coup dynamique qui va suivre." },
    { fen: "2rr2k1/1p3p1p/1pn1pq2/1N3p2/3P4/P3Q2P/1P3PP1/2RR2K1 w - - 2 23", solution: ["d4d5","d8d5","d1d5","e6d5"], solutionSan: ["d5","Rxd5","Rxd5","exd5"], rating: 1665, sourceRef: "Deep Blue – Kasparov, Philadelphie 1996, Partie 1 (23.d5!? Rxd5 24.Rxd5 exd5) : LE sacrifice dynamique — activité et roi adverse exposé contre un pion." },
    { fen: "2r3k1/1p3p1p/1pn2q2/1N1p1p2/8/P3Q2P/1P3PP1/2R3K1 w - - 0 25", solution: ["b2b3","g8h8"], solutionSan: ["b3","Kh8"], rating: 1680, sourceRef: "Deep Blue – Kasparov, Philadelphie 1996, Partie 1 (25.b3 Kh8) : consolidation prophylactique avant d'encaisser le gain dynamique." },
    { fen: "2r4k/1p3p1p/1pn2q2/1N1p1p2/8/PP2Q2P/5PP1/2R3K1 w - - 1 26", solution: ["e3b6","c8g8"], solutionSan: ["Qxb6","Rg8"], rating: 1695, sourceRef: "Deep Blue – Kasparov, Philadelphie 1996, Partie 1 (26.Qxb6 Rg8) : la faiblesse statique du coup 18 tombe enfin, vingt coups plus tard." },
    { fen: "6rk/1p3p1p/1Qn2q2/1N1p1p2/8/PP5P/5PP1/2R3K1 w - - 1 27", solution: ["b6c5","d5d4"], solutionSan: ["Qc5","d4"], rating: 1705, sourceRef: "Deep Blue – Kasparov, Philadelphie 1996, Partie 1 (27.Qc5 d4) : chasse des dernières cibles statiques noires." },
    { fen: "6rk/1p3p1p/2n2q2/1NQ2p2/3p4/PP5P/5PP1/2R3K1 w - - 0 28", solution: ["b5d6","f5f4"], solutionSan: ["Nd6","f4"], rating: 1715, sourceRef: "Deep Blue – Kasparov, Philadelphie 1996, Partie 1 (28.Nd6 f4) : le Cavalier blanc s'infiltre pendant que Noir tente sa propre dynamique." },
    { fen: "6rk/1p3p1p/2nN1q2/2Q5/3p1p2/PP5P/5PP1/2R3K1 w - - 0 29", solution: ["d6b7","c6e5"], solutionSan: ["Nxb7","Ne5"], rating: 1725, sourceRef: "Deep Blue – Kasparov, Philadelphie 1996, Partie 1 (29.Nxb7 Ne5) : nouvelle prise statique, Noir n'a plus que des espoirs dynamiques." },
    { fen: "6rk/1N3p1p/5q2/2Q1n3/3p1p2/PP5P/5PP1/2R3K1 w - - 1 30", solution: ["c5d5","f4f3"], solutionSan: ["Qd5","f3"], rating: 1735, sourceRef: "Deep Blue – Kasparov, Philadelphie 1996, Partie 1 (30.Qd5 f3) : Noir pousse sa dernière carte dynamique, le pion f." },
    { fen: "6rk/1N3p1p/5q2/3Q4/3p4/PP1n1pPP/5P2/2R3K1 w - - 1 32", solution: ["c1c7","g8e8"], solutionSan: ["Rc7","Re8"], rating: 1745, sourceRef: "Deep Blue – Kasparov, Philadelphie 1996, Partie 1 (32.Rc7 Re8) : la 7e rangée, un gain positionnel définitivement statique, referme le filet." },
    { fen: "4r2k/1NR2p1p/5q2/3Q4/3p4/PP1n1pPP/5P2/6K1 w - - 3 33", solution: ["b7d6","e8e1"], solutionSan: ["Nd6","Re1+"], rating: 1755, sourceRef: "Deep Blue – Kasparov, Philadelphie 1996, Partie 1 (33.Nd6 Re1+) : dernier sursaut dynamique noir, insuffisant." },
    { fen: "7k/2R2p1p/3N1q2/3Q4/3p4/PP1n1pPP/5P2/4r1K1 w - - 5 34", solution: ["g1h2","d3f2","d6f7","h8g7","f7g5","g7h6","c7h7"], solutionSan: ["Kh2","Nxf2","Nxf7+","Kg7","Ng5+","Kh6","Rxh7+"], rating: 1780, sourceRef: "Deep Blue – Kasparov, Philadelphie 1996, Partie 1 (34.Kh2 Nxf2 35.Nxf7+ Kg7 36.Ng5+ Kh6 37.Rxh7+) : la combinaison finale, dynamique devenue décisive." },
  ].map((p) => ({ themeId: "jh-module-18-evaluation-dynamique-contre-statique", ...p })),
  // (2026-09-12, Palier Or « Avancé », Lot 7) `jh-module-19` : Karpov –
  // Kasparov, Championnat du Monde Moscou 1985, Partie 16 (40 coups, 0-1)
  // remplace sa ligne théorique par une vague réelle de 14 puzzles.
  ...[
    { fen: "r1bqkb1r/1p3ppp/p1n1pn2/3p4/2P1P3/N1N5/PP3PPP/R1BQKB1R w KQkq - 0 9", solution: ["c4d5","e6d5","e4d5","c6b4"], solutionSan: ["cxd5","exd5","exd5","Nb4"], rating: 1600, sourceRef: "Karpov – Kasparov, Championnat du Monde Moscou 1985, Partie 16 (9.cxd5 exd5 10.exd5 Nb4) : la série d'échanges qui fixe déjà les cases faibles blanches." },
    { fen: "r1bq1rk1/1p3ppp/p4n2/2bP4/1n6/N1N5/PP2BPPP/R1BQ1RK1 w - - 5 13", solution: ["e2f3","c8f5"], solutionSan: ["Bf3","Bf5"], rating: 1615, sourceRef: "Karpov – Kasparov, Championnat du Monde Moscou 1985, Partie 16 (13.Bf3 Bf5) : Kasparov développe en gardant le complexe de cases en tête." },
    { fen: "r2qr1k1/1p3ppp/p4n2/2bP1bB1/1n6/N1N2B2/PP3PPP/R2Q1RK1 w - - 9 15", solution: ["d1d2","b7b5"], solutionSan: ["Qd2","b5"], rating: 1630, sourceRef: "Karpov – Kasparov, Championnat du Monde Moscou 1985, Partie 16 (15.Qd2 b5) : préparation tranquille avant le grand saut du Cavalier." },
    { fen: "r2qr1k1/5ppp/p4n2/1pbP1bB1/1n6/N1N2B2/PP1Q1PPP/R4RK1 w - - 0 16", solution: ["a1d1","b4d3"], solutionSan: ["Rad1","Nd3"], rating: 1645, sourceRef: "Karpov – Kasparov, Championnat du Monde Moscou 1985, Partie 16 (16.Rad1 Nd3!) : le Cavalier plante son drapeau sur une case que rien ne peut jamais déloger." },
    { fen: "r2qr1k1/5pp1/p4n1p/2bP1b2/1p5B/2Nn1B2/PP1Q1PPP/1N1R1RK1 w - - 0 19", solution: ["c3a4","c5d6"], solutionSan: ["Na4","Bd6"], rating: 1660, sourceRef: "Karpov – Kasparov, Championnat du Monde Moscou 1985, Partie 16 (19.Na4 Bd6) : Karpov tente une parade, Kasparov garde toujours son intrus." },
    { fen: "2rqr1k1/5pp1/p2b1n1p/3P1b2/Np6/3n1BB1/PP1Q1PPP/1N1R1RK1 w - - 4 21", solution: ["b2b3","g7g5"], solutionSan: ["b3","g5"], rating: 1675, sourceRef: "Karpov – Kasparov, Championnat du Monde Moscou 1985, Partie 16 (21.b3 g5) : Kasparov attaque maintenant sur les DEUX couleurs à la fois." },
    { fen: "2rqr1k1/5p2/p2b1n1p/3P1bp1/Np6/1P1n1BB1/P2Q1PPP/1N1R1RK1 w - - 0 22", solution: ["g3d6","d8d6","g2g3","f6d7"], solutionSan: ["Bxd6","Qxd6","g3","Nd7"], rating: 1690, sourceRef: "Karpov – Kasparov, Championnat du Monde Moscou 1985, Partie 16 (22.Bxd6 Qxd6 23.g3 Nd7) : l'échange des derniers Fous de cases sombres aggrave le déséquilibre." },
    { fen: "2r1r1k1/3n1p2/p4q1p/3P1bp1/Np6/1P1n2P1/P2Q1PBP/1N1R1RK1 w - - 3 25", solution: ["a2a3","a6a5","a3b4","a5b4"], solutionSan: ["a3","a5","axb4","axb4"], rating: 1705, sourceRef: "Karpov – Kasparov, Championnat du Monde Moscou 1985, Partie 16 (25.a3 a5 26.axb4 axb4) : ouverture de la colonne a pendant que le Cavalier tient toujours d3." },
    { fen: "2r1r1k1/3n1p2/5qbp/3P2p1/Np6/1P1n2P1/Q4PBP/1N1R1RK1 w - - 2 28", solution: ["d5d6","g5g4","a2d2","g8g7"], solutionSan: ["d6","g4","Qd2","Kg7"], rating: 1715, sourceRef: "Karpov – Kasparov, Championnat du Monde Moscou 1985, Partie 16 (28.d6 g4 29.Qd2 Kg7) : double poussée sur les deux couleurs, le roi blanc n'a plus de refuge sûr." },
    { fen: "2r1r3/3n1pk1/3q2bp/8/Np4p1/1P1n1PP1/3Q2BP/1N1R1RK1 w - - 0 31", solution: ["f3g4","d6d4"], solutionSan: ["fxg4","Qd4+"], rating: 1725, sourceRef: "Karpov – Kasparov, Championnat du Monde Moscou 1985, Partie 16 (31.fxg4 Qd4+) : Karpov encaisse un échec avant même de pouvoir souffler." },
    { fen: "2r1r3/5pk1/5nbp/8/Np1q2P1/1P1n2P1/3Q2BP/1N1R1R1K w - - 3 33", solution: ["f1f4","f6e4"], solutionSan: ["Rf4","Ne4"], rating: 1735, sourceRef: "Karpov – Kasparov, Championnat du Monde Moscou 1985, Partie 16 (33.Rf4 Ne4) : le Cavalier migre vers une nouvelle case du même complexe." },
    { fen: "2r1r3/5pk1/6bp/8/Np1qnRP1/1P1n2P1/3Q2BP/1N1R3K w - - 5 34", solution: ["d2d3","e4f2"], solutionSan: ["Qxd3","Nf2+"], rating: 1745, sourceRef: "Karpov – Kasparov, Championnat du Monde Moscou 1985, Partie 16 (34.Qxd3! Nf2+) : le prix à payer pour chasser enfin l'intrus — la Dame elle-même." },
    { fen: "2r1r3/5pk1/7p/8/Np4P1/1P1bq1P1/3R2BP/1N1R3K w - - 2 37", solution: ["d2d3","c8c1","a4b2","e3f2"], solutionSan: ["Rxd3","Rc1","Nb2","Qf2"], rating: 1760, sourceRef: "Karpov – Kasparov, Championnat du Monde Moscou 1985, Partie 16 (37.Rxd3 Rc1 38.Nb2 Qf2) : l'infiltration décisive sur la 1e rangée blanche." },
    { fen: "4r3/5pk1/7p/8/1p4P1/1P1R2P1/1N3qBP/1NrR3K w - - 3 39", solution: ["b1d2","c1d1","b2d1","e8e1"], solutionSan: ["Nd2","Rxd1+","Nxd1","Re1+"], rating: 1780, sourceRef: "Karpov – Kasparov, Championnat du Monde Moscou 1985, Partie 16 (39.Nd2 Rxd1+ 40.Nxd1 Re1+) : Karpov abandonne, sans parade au double échec qui suit." },
  ].map((p) => ({ themeId: "jh-module-19-les-cases-de-couleur-au-milieu-de-partie", ...p })),
  // (2026-09-12, Palier Or « Avancé », Lot 7) `jh-module-20` : Alekhine –
  // Yates, Londres 1922 (38 coups, 1-0) remplace sa ligne théorique par une
  // vague réelle de 13 puzzles — voir `course-lesson.ts` pour la
  // justification du remplacement de la partie assignée à l'origine.
  ...[
    { fen: "r1b1r1k1/4q1pp/4p3/1pnp1p2/p2P4/4PN2/PPQ2PPP/2R2RK1 w - - 0 18", solution: ["c2c5","e7c5","c1c5","b5b4"], solutionSan: ["Qxc5","Qxc5","Rxc5","b4"], rating: 1550, sourceRef: "Alekhine – Yates, Londres 1922 (18.Qxc5! Qxc5 19.Rxc5 b4) : l'échange des Dames ouvre VRAIMENT la finale." },
    { fen: "r3r1k1/6pp/b3p3/2Rp1p2/pp1P4/4PN2/PP3PPP/2R3K1 w - - 2 21", solution: ["f3e5","e8b8"], solutionSan: ["Ne5","Reb8"], rating: 1570, sourceRef: "Alekhine – Yates, Londres 1922 (21.Ne5! Reb8) : le bon Cavalier s'installe pendant que le mauvais Fou noir reste emprisonné." },
    { fen: "rr4k1/6pp/b3p3/2RpNp2/pp1P4/4P3/PP3PPP/2R3K1 w - - 4 22", solution: ["f2f3","b4b3"], solutionSan: ["f3","b3"], rating: 1590, sourceRef: "Alekhine – Yates, Londres 1922 (22.f3 b3) : consolidation avant la marche du roi." },
    { fen: "rr4k1/6p1/b3p2p/2RpNp2/p2P4/Pp2PP2/1P4PP/2R3K1 w - - 0 24", solution: ["g1f2","g8h7"], solutionSan: ["Kf2","Kh7"], rating: 1610, sourceRef: "Alekhine – Yates, Londres 1922 (24.Kf2! Kh7) : la marche du roi commence — plus aucun échec adverse à craindre." },
    { fen: "rr6/6pk/b3p2p/2RpNp2/p2P4/Pp2PP2/1P3KPP/2R5 w - - 2 25", solution: ["h2h4","b8f8"], solutionSan: ["h4","Rf8"], rating: 1625, sourceRef: "Alekhine – Yates, Londres 1922 (25.h4 Rf8) : le roi blanc continue sa promenade, soutenu par ses pions." },
    { fen: "r4r2/6pk/b3p2p/2RpNp2/p2P3P/Pp2PP2/1P3KP1/2R5 w - - 1 26", solution: ["f2g3","f8b8"], solutionSan: ["Kg3","Rfb8"], rating: 1640, sourceRef: "Alekhine – Yates, Londres 1922 (26.Kg3 Rfb8) : troisième étape de la marche royale, vers le centre de l'échiquier." },
    { fen: "rr6/6pk/b3p2p/2RpNp2/p2P3P/Pp2PPK1/1P4P1/2R5 w - - 3 27", solution: ["c5c7","a6b5"], solutionSan: ["Rc7","Bb5"], rating: 1655, sourceRef: "Alekhine – Yates, Londres 1922 (27.Rc7 Bb5) : les Tours blanches s'infiltrent pendant que le roi continue d'avancer." },
    { fen: "rr6/2R3pk/4p2p/1b1pNp2/p2P3P/Pp2PPK1/1P4P1/2R5 w - - 5 28", solution: ["c1c5","b5a6","c5c6","b8e8"], solutionSan: ["R1c5","Ba6","R5c6","Re8"], rating: 1670, sourceRef: "Alekhine – Yates, Londres 1922 (28.R1c5 Ba6 29.R5c6 Re8) : triplement des pièces lourdes sur la 6e/7e rangée, le Fou noir reste spectateur." },
    { fen: "r3r3/2R3pk/b1R1p2p/3pNp2/p2P3P/Pp2PPK1/1P4P1/8 w - - 9 30", solution: ["g3f4","h7g8"], solutionSan: ["Kf4","Kg8"], rating: 1685, sourceRef: "Alekhine – Yates, Londres 1922 (30.Kf4! Kg8) : le roi atteint f4, une case active en plein centre." },
    { fen: "r3r1k1/2R3p1/b1R1p2p/3pNp2/p2P1K1P/Pp2PP2/1P4P1/8 w - - 11 31", solution: ["h4h5","a6f1"], solutionSan: ["h5","Bf1"], rating: 1700, sourceRef: "Alekhine – Yates, Londres 1922 (31.h5 Bf1) : le dernier pion faible noir tombe bientôt, le Fou erre sans plan." },
    { fen: "r3r1k1/2R3p1/b1R1p2p/3pNp1P/p2P1K2/Pp2PPP1/1P6/8 w - - 1 33", solution: ["c7f7","g8h7","c6c7","e8g8"], solutionSan: ["Rf7","Kh7","Rcc7","Rg8"], rating: 1715, sourceRef: "Alekhine – Yates, Londres 1922 (33.Rf7 Kh7 34.Rcc7 Rg8) : les deux Tours blanches dominent totalement la 7e rangée." },
    { fen: "r5r1/2R2Rpk/b3p2p/3pNp1P/p2P1K2/Pp2PPP1/1P6/8 w - - 5 35", solution: ["e5d7","h7h8","d7f6","g8f8"], solutionSan: ["Nd7","Kh8","Nf6","Rgf8"], rating: 1730, sourceRef: "Alekhine – Yates, Londres 1922 (35.Nd7 Kh8 36.Nf6! Rgf8) : le Cavalier complète l'étau pendant que le roi noir n'a plus une case sûre." },
    { fen: "r4r1k/2R2Rp1/b3pN1p/3p1p1P/p2P1K2/Pp2PPP1/1P6/8 w - - 9 37", solution: ["f7g7","f8f6","f4e5"], solutionSan: ["Rxg7","Rxf6","Ke5"], rating: 1750, sourceRef: "Alekhine – Yates, Londres 1922 (37.Rxg7 Rxf6 38.Ke5!) : le roi blanc conclut lui-même la domination, sur la case même que la finale préparait depuis quinze coups." },
  ].map((p) => ({ themeId: "jh-module-20-le-roi-actif-en-finale", ...p })),
  {
    themeId: "jh-module-21-jouer-les-structures-fermees",
    fen: "r1bq1rk1/1pp1npbp/3p1np1/p2Pp3/2P1P3/2N5/PP1NBPPP/R1BQ1RK1 w - - 0 10",
    solution: ["a2a3","f6d7","a1b1"],
    solutionSan: ["a3","Nd7","Rb1"],
    rating: 1779,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-22-affronter-le-fianchetto",
    fen: "r1bq1rk1/ppp2pbp/3p1np1/3P4/2PpP3/2N5/PP2BPPP/R1BQ1RK1 w - - 0 10",
    solution: ["d1d4","f8e8","c1g5"],
    solutionSan: ["Qxd4","Re8","Bg5"],
    rating: 1764,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-23-le-controle-du-centre",
    fen: "rn1qk2r/4ppbp/b2p1np1/2pP4/8/2N2NP1/PP2PP1P/R1BQKB1R w KQkq - 1 9",
    solution: ["f1g2","b8d7","e1g1"],
    solutionSan: ["Bg2","Nbd7","O-O"],
    rating: 1620,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-24-le-zugzwang-positionnel",
    fen: "r1b1kbnr/2p3pp/pp3p2/2p5/4P3/1N6/PPP2PPP/RNBR2K1 w kq - 0 10",
    solution: ["b1c3","c8e6","d1d2"],
    solutionSan: ["Nc3","Be6","Rd2"],
    rating: 1651,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-25-synthese-parties-commentees",
    fen: "rnbq1rk1/p1p1Bpp1/1p2p2p/3n4/3P4/2N1PN2/PP3PPP/R2QKB1R b KQ - 0 9",
    solution: ["d8e7","a1c1","c8b7"],
    solutionSan: ["Qxe7","Rc1","Bb7"],
    rating: 1655,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "sp-candidats-fide-2026-ronde-1-sortie-de-theorie",
    fen: "r1bq1rk1/pp1n1pbp/2pp1np1/4p3/2PPP3/2N1BN2/PP2BPPP/R2Q1RK1 w - - 0 9",
    solution: ["d4d5","c6d5","c4d5"],
    solutionSan: ["d5","cxd5","cxd5"],
    rating: 2270,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "sp-candidats-fide-2026-ronde-3-milieu-de-partie-tendu",
    fen: "r2q1rk1/1p1nbppp/p2pbn2/4p3/4P3/1NN1BP2/PPPQ2PP/2KR1B1R w - - 5 11",
    solution: ["g2g4","b7b5","g4g5"],
    solutionSan: ["g4","b5","g5"],
    rating: 2287,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "sp-candidats-fide-2026-ronde-5-finale-technique",
    fen: "r2qkb1r/1b1n1ppp/p3pn2/1pp5/3PP3/2NB1N2/PP3PPP/R1BQ1RK1 w kq - 0 11",
    solution: ["e4e5","c5d4","c3b5"],
    solutionSan: ["e5","cxd4","Nxb5"],
    rating: 2287,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "sp-candidats-fide-2026-ronde-7-sacrifice-thematique",
    fen: "r1bq1rk1/ppp3pp/2n2b2/3p4/3Pn3/2NB1N2/PPP3PP/R1BQ1RK1 w - - 2 10",
    solution: ["f1e1","f8e8","d1e2"],
    solutionSan: ["Re1","Re8","Qe2"],
    rating: 2246,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "sp-candidats-fide-2026-ronde-9-conversion-d-avantage",
    fen: "rn1q1rk1/1p2bppp/2p1pn2/p2p1b2/8/1P1P1NP1/PBPNPPBP/R2Q1RK1 w - - 0 9",
    solution: ["a2a3","b8d7","c2c4"],
    solutionSan: ["a3","Nbd7","c4"],
    rating: 2212,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "sp-candidats-fide-2026-ronde-11-defense-resiliente",
    fen: "r1bq1rk1/pp2npbp/3p1np1/3pp3/P1P1P3/2N5/1P1NBPPP/R1BQ1RK1 w - - 0 11",
    solution: ["c4d5","f6d7","d2c4"],
    solutionSan: ["cxd5","Nd7","Nc4"],
    rating: 2125,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "sp-candidats-fide-2026-ronde-13-coup-decisif",
    fen: "r1bq1rk1/ppn1ppbp/3p1np1/2pP4/4PP2/2NB1N2/PPP3PP/R1BQ1RK1 w - - 1 9",
    solution: ["a2a4","a7a6","g1h1"],
    solutionSan: ["a4","a6","Kh1"],
    rating: 2209,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "sp-candidats-fide-2026-derniere-ronde",
    fen: "rnb2rk1/p1p1qpp1/1p2p2p/3n4/3P4/2N1PN2/PP3PPP/R2QKB1R w KQ - 0 10",
    solution: ["c3d5","e6d5","a1c1"],
    solutionSan: ["Nxd5","exd5","Rc1"],
    rating: 2243,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "sp-norway-chess-2026-armageddon",
    fen: "r2q1rk1/ppp1bppp/1nn1b3/4p3/8/P1NP1NP1/1P2PPBP/R1BQ1RK1 w - - 1 10",
    solution: ["c1e3","f7f5","f3d2"],
    solutionSan: ["Be3","f5","Nd2"],
    rating: 2221,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "sp-norway-chess-2026-duel-de-style",
    fen: "r2qkbnr/pp1nppp1/2p4p/7P/3P4/3b1NN1/PPP2PP1/R1BQK2R w KQkq - 0 10",
    solution: ["d1d3","d8c7","c1d2"],
    solutionSan: ["Qxd3","Qc7","Bd2"],
    rating: 2103,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "sp-norway-chess-2026-pression-positionnelle",
    fen: "r1bq1rk1/pp2bppp/2n1p3/3n4/2BP4/2N2N2/PP3PPP/R1BQ1RK1 w - - 3 10",
    solution: ["f1e1","d5f6","c1g5"],
    solutionSan: ["Re1","Nf6","Bg5"],
    rating: 2208,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "sp-norway-chess-2026-contre-attaque",
    fen: "rnb1k2r/4bppp/pq1ppn2/1p6/3NP3/1BN2Q2/PPP2PPP/R1B2RK1 w kq - 4 10",
    solution: ["c1e3","b6b7","a1d1"],
    solutionSan: ["Be3","Qb7","Rad1"],
    rating: 2220,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "sp-norway-chess-2026-finale-de-pions",
    fen: "r1bqkb1r/3n1ppp/p3pn2/1p2P3/3p4/2NB1N2/PP3PPP/R1BQK2R w KQkq - 0 11",
    solution: ["c3b5","a6b5","e5f6"],
    solutionSan: ["Nxb5","axb5","exf6"],
    rating: 2234,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "sp-norway-chess-2026-classique-contre-armageddon",
    fen: "rn1q1rk1/pp2bpp1/2p1pn1p/3p1b2/8/1P1P1NP1/PBPNPPBP/R2Q1RK1 w - - 3 9",
    solution: ["c2c4","a7a5","a2a3"],
    solutionSan: ["c4","a5","a3"],
    rating: 2210,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "sp-tata-steel-2026-groupe-masters",
    fen: "r2q1rk1/pbpn1ppp/1p2pn2/3p2B1/2PP4/P1Q1PP2/1P4PP/R3KBNR w KQ - 1 10",
    solution: ["c4d5","e6d5","f1d3"],
    solutionSan: ["cxd5","exd5","Bd3"],
    rating: 2100,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "sp-candidates-feminines-2026",
    fen: "r1bqk2r/pppp1ppp/2n2b2/3P4/2B1n3/5N2/PP3PPP/R1BQ1RK1 w kq - 1 10",
    solution: ["f1e1","c6e7","e1e4"],
    solutionSan: ["Re1","Ne7","Rxe4"],
    rating: 2186,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "sp-grand-chess-tour-2026-etape-blitz",
    fen: "r2qkb1r/pp1n1ppp/2n1p3/1B1p1b2/3P1B2/2N1PN2/PP3PPP/R2QK2R w KQkq - 2 9",
    solution: ["e1g1","f8d6","f4d6"],
    solutionSan: ["O-O","Bd6","Bxd6"],
    rating: 2111,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "sp-championnat-du-monde-2026-preparation",
    fen: "r1b2rk1/ppq1ppbp/2p2np1/8/3PP3/5N2/PP3PPP/RNBQR1K1 w - - 1 10",
    solution: ["b1c3","f8d8","h2h3"],
    solutionSan: ["Nc3","Rd8","h3"],
    rating: 2279,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "sp-sinquefield-cup-2026",
    fen: "r1bq1rk1/ppp2pbp/1nn3p1/4p3/3P4/2N1PNP1/PP3PBP/R1BQ1RK1 w - - 0 10",
    solution: ["d4d5","c6e7","e3e4"],
    solutionSan: ["d5","Ne7","e4"],
    rating: 2289,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "sp-superbet-chess-classic-2026",
    fen: "r1bq1rk1/2p1bppp/p1n5/1p1np3/8/1BP2N2/PP1P1PPP/RNBQR1K1 w - - 0 10",
    solution: ["f3e5","c6e5","e1e5"],
    solutionSan: ["Nxe5","Nxe5","Rxe5"],
    rating: 2285,
    sourceRef: "Position d'entraînement dans l'esprit du tournoi, construite sur une ligne réelle — pas une reproduction littérale de la partie.",
  },
  {
    themeId: "cm-mat-du-couloir",
    fen: "1k6/ppp4p/1b1rB3/4p1B1/2K5/2P3P1/Pr6/5R2 w - - 0 30",
    solution: ["f1f8","d6d8","f8d8"],
    solutionSan: ["Rf8+","Rd8","Rxd8#"],
    rating: 1250,
    sourceRef: "Partie Lichess réelle (CC0, base officielle des puzzles) — position critique jusqu'au mat forcé, motif authentique. https://lichess.org/Clzl2QJG/black#58",
  },
  {
    themeId: "cm-mat-de-l-escalier",
    fen: "6r1/8/RR6/4k3/2P5/7r/2K5/8 b KQkq - 0 1",
    solution: ["g8g2","c2d1","h3h1"],
    solutionSan: ["Rg2+","Kd1","Rh1#"],
    rating: 1150,
    sourceRef: "Position tactique réelle du corpus d'entraînement — position critique jusqu'au mat forcé, motif authentique (source interne, pas de lien public).",
  },
  {
    themeId: "cm-mat-d-anastasia",
    fen: "8/R4p2/2p1N1pk/1p1p4/2nP4/2n5/Pr6/K4R2 w - - 6 32",
    solution: ["f1h1","b2h2","h1h2"],
    solutionSan: ["Rh1+","Rh2","Rxh2#"],
    rating: 1250,
    sourceRef: "Partie Lichess réelle (CC0, base officielle des puzzles) — position critique jusqu'au mat forcé, motif authentique. https://lichess.org/xLB5DzoK/black#62",
  },
  {
    themeId: "cm-mat-arabe",
    fen: "8/6pk/6rp/pRpN2n1/P3P3/5P1P/1P2R2K/8 b - - 0 38",
    solution: ["g5f3","h2h1","g6g1"],
    solutionSan: ["Nxf3+","Kh1","Rg1#"],
    rating: 1300,
    sourceRef: "Partie Lichess réelle (CC0, base officielle des puzzles) — position critique jusqu'au mat forcé, motif authentique. https://lichess.org/HaAVG8MD#75",
  },
  {
    themeId: "cm-mat-de-boden",
    fen: "r3kb1r/pp3ppp/4p3/5bB1/3Pn3/1BN5/PP3PPP/n2K2NR w kq - 2 13",
    solution: ["b3a4","b7b5","a4b5"],
    solutionSan: ["Ba4+","b5","Bxb5#"],
    rating: 1410,
    sourceRef: "Partie Lichess réelle (CC0, base officielle des puzzles) — position critique jusqu'au mat forcé, motif authentique. https://lichess.org/cakqqXtb/black#24",
  },
  {
    themeId: "cm-mat-de-damiano",
    fen: "r1bqk2r/pp4pp/2p5/3p1p2/2PP1P2/1PB1pP2/P3B2P/R2QK2R b KQkq - 0 1",
    solution: ["d8h4","e1f1","h4f2"],
    solutionSan: ["Qh4+","Kf1","Qf2#"],
    rating: 1150,
    sourceRef: "Position tactique réelle du corpus d'entraînement — position critique jusqu'au mat forcé, motif authentique (source interne, pas de lien public).",
  },
  {
    themeId: "cm-mat-de-blackburne",
    fen: "r2qkb1r/pp2pppp/2p2nb1/4N3/P1BP2P1/2N1P2P/1Pn2P2/R1BQK2R w KQkq - 1 2",
    solution: ["d1c2","g6c2","c4f7"],
    solutionSan: ["Qxc2","Bxc2","Bxf7#"],
    rating: 1150,
    sourceRef: "Position tactique réelle du corpus d'entraînement — position critique jusqu'au mat forcé, motif authentique (source interne, pas de lien public).",
  },
  {
    themeId: "cm-mat-de-l-epaulette",
    fen: "2r5/8/5R2/r5R1/pkp5/1p5P/1P4P1/6K1 w - - 12 51",
    solution: ["f6b6","a5b5","g5b5"],
    solutionSan: ["Rb6+","Rb5","Rgxb5#"],
    rating: 1350,
    sourceRef: "Partie Lichess réelle (CC0, base officielle des puzzles) — position critique jusqu'au mat forcé, motif authentique. https://lichess.org/26VYcNnh/black#100",
  },
  {
    themeId: "cm-mat-de-greco",
    fen: "2bqr1k1/1ppp1ppp/7r/p1b1P3/2P1P3/P1N5/1P2B1PP/1RBQ1R1K b KQkq - 0 1",
    solution: ["h6h2","h1h2","d8h4"],
    solutionSan: ["Rxh2+","Kxh2","Qh4#"],
    rating: 1150,
    sourceRef: "Position tactique réelle du corpus d'entraînement — position critique jusqu'au mat forcé, motif authentique (source interne, pas de lien public).",
  },
  {
    themeId: "cm-mat-du-crochet",
    fen: "6n1/1k3N1p/p4p1b/1p2r3/1Pp5/2Pn1R2/P2P1PPP/RNBK4 b - - 2 20",
    solution: ["e5e1","d1c2","e1c1"],
    solutionSan: ["Re1+","Kc2","Rxc1#"],
    rating: 1490,
    sourceRef: "Partie Lichess réelle (CC0, base officielle des puzzles) — position critique jusqu'au mat forcé, motif authentique. https://lichess.org/RN7YCraI#39",
  },
  {
    themeId: "cm-mat-de-legall",
    fen: "rn1qkbnr/ppp2pp1/3p3p/4N3/2B1P3/2N5/PPPP1PPP/R1BbK2R w KQkq - 0 2",
    solution: ["c4f7","e8e7","c3d5"],
    solutionSan: ["Bxf7+","Ke7","Nd5#"],
    rating: 1150,
    sourceRef: "Position tactique réelle du corpus d'entraînement — position critique jusqu'au mat forcé, motif authentique (source interne, pas de lien public).",
  },
  {
    themeId: "cm-mat-de-lolli",
    fen: "6k1/p4p1p/5P1Q/8/8/8/8/1K6 w - - 0 1",
    solution: ["b1a1","a7a6","h6g7"],
    solutionSan: ["Ka1","a6","Qg7#"],
    rating: 1240,
    sourceRef: "Position pédagogique composée à la main, vérifiée par rejeu et reconnaissance du motif — aucun exemple multi-plis authentique disponible dans les corpus importés pour ce motif rare.",
  },
  {
    themeId: "cm-mat-de-morphy",
    fen: "r4r1k/p6p/1pp5/2b5/5B2/P1PpPP2/7P/2K3R1 w - - 0 26",
    solution: ["f4e5","f8f6","e5f6"],
    solutionSan: ["Be5+","Rf6","Bxf6#"],
    rating: 1260,
    sourceRef: "Partie Lichess réelle (CC0, base officielle des puzzles) — position critique jusqu'au mat forcé, motif authentique. https://lichess.org/dua002wr/black#50",
  },
  {
    themeId: "cm-mat-de-l-opera",
    fen: "6k1/p2r1p2/bp4pp/2p1Rp1P/8/P1B5/1PP2PP1/1K6 w - - 0 25",
    solution: ["e5e8","g8h7","e8h8"],
    solutionSan: ["Re8+","Kh7","Rh8#"],
    rating: 1280,
    sourceRef: "Partie Lichess réelle (CC0, base officielle des puzzles) — position critique jusqu'au mat forcé, motif authentique. https://lichess.org/fpARnzrv/black#48",
  },
  {
    themeId: "cm-mat-de-pillsbury",
    fen: "3N2k1/2p3p1/p1b2r1p/4R3/8/8/PP3P1P/5RK1 b - - 0 26",
    solution: ["f6g6","e5g5","g6g5"],
    solutionSan: ["Rg6+","Rg5","Rxg5#"],
    rating: 1430,
    sourceRef: "Partie Lichess réelle (CC0, base officielle des puzzles) — position critique jusqu'au mat forcé, motif authentique. https://lichess.org/JUipkHn5#51",
  },
  {
    themeId: "cm-mat-de-reti",
    fen: "4k2r/3n1p2/4pp2/8/1p1RqB2/5P2/rP4PP/2R4K w KQkq - 0 2",
    solution: ["c1c8","e8e7","f4d6"],
    solutionSan: ["Rc8+","Ke7","Bd6#"],
    rating: 1150,
    sourceRef: "Position tactique réelle du corpus d'entraînement — position critique jusqu'au mat forcé, motif authentique (source interne, pas de lien public).",
  },
  {
    themeId: "cm-mat-etouffe",
    fen: "5r2/ppkb4/4p2p/3p4/2p3Q1/2PnB3/PP4PP/RN3R1K b - - 0 24",
    solution: ["f8f1","e3g1","d3f2"],
    solutionSan: ["Rxf1+","Bg1","Nf2#"],
    rating: 1670,
    sourceRef: "Partie Lichess réelle (CC0, base officielle des puzzles) — position critique jusqu'au mat forcé, motif authentique. https://lichess.org/qQlQAab9#47",
  },
  {
    themeId: "cm-mat-de-la-queue-d-aronde",
    fen: "4r1k1/p6p/1p2p3/1q1pBp2/3P1P2/P3P2Q/1n4PP/6K1 w - - 0 34",
    solution: ["h3g3","g8f7","g3g7"],
    solutionSan: ["Qg3+","Kf7","Qg7#"],
    rating: 1590,
    sourceRef: "Partie Lichess réelle (CC0, base officielle des puzzles) — position critique jusqu'au mat forcé, motif authentique. https://lichess.org/UqtPz0Cz/black#66",
  },
  {
    themeId: "cm-mat-de-vukovic",
    fen: "4r2k/pp3p2/7P/2n2pN1/4p3/4K2P/PP6/6R1 w - - 2 31",
    solution: ["g5f7","h8h7","g1g7"],
    solutionSan: ["Nxf7+","Kh7","Rg7#"],
    rating: 1330,
    sourceRef: "Partie Lichess réelle (CC0, base officielle des puzzles) — position critique jusqu'au mat forcé, motif authentique. https://lichess.org/tG4TleQ2/black#60",
  },
  {
    themeId: "cm-mat-des-deux-fous",
    fen: "5r1k/p5p1/1p5p/P1p2b2/5P2/6P1/4Bb1P/R1R4K b - - 0 31",
    solution: ["f5e4","e2f3","e4f3"],
    solutionSan: ["Be4+","Bf3","Bxf3#"],
    rating: 1310,
    sourceRef: "Partie Lichess réelle (CC0, base officielle des puzzles) — position critique jusqu'au mat forcé, motif authentique. https://lichess.org/ocBUDmV9#61",
  },
  {
    themeId: "cm-mat-de-la-boite",
    fen: "8/8/7p/1R2b3/5p2/5K1k/1p6/8 w KQ - 0 2",
    solution: ["b5e5","b2b1q","e5h5"],
    solutionSan: ["Rxe5","b1=Q","Rh5#"],
    rating: 1150,
    sourceRef: "Position tactique réelle du corpus d'entraînement — position critique jusqu'au mat forcé, motif authentique (source interne, pas de lien public).",
  },
  {
    themeId: "cm-mat-du-triangle",
    fen: "7k/p5p1/5N2/8/8/R1Q5/8/2K5 w - - 0 1",
    solution: ["c1b1","a7a6","c3h3"],
    solutionSan: ["Kb1","a6","Qh3#"],
    rating: 1260,
    sourceRef: "Position pédagogique composée à la main, vérifiée par rejeu et reconnaissance du motif — aucun exemple multi-plis authentique disponible dans les corpus importés pour ce motif rare.",
  },
  {
    themeId: "cm-mat-du-moulin",
    fen: "7k/r5Rp/8/8/8/8/1B6/K7 w - - 0 1",
    solution: ["g7a7","h8g8","a7g7","g8h8","g7g1"],
    solutionSan: ["Rxa7+","Kg8","Rg7+","Kh8","Rg1#"],
    rating: 1098,
    sourceRef: "Position pédagogique composée, vérifiée par rejeu — le motif de mat annoncé par le thème.",
  },
  {
    themeId: "cm-mat-dame-et-tour",
    fen: "r1b1k2r/1pqp1pp1/p3p3/7p/4P1P1/2NBQ3/PPP2PP1/R4R1K b KQkq - 0 1",
    solution: ["h5g4","h1g1","c7h2"],
    solutionSan: ["hxg4+","Kg1","Qh2#"],
    rating: 1150,
    sourceRef: "Position tactique réelle du corpus d'entraînement — position critique jusqu'au mat forcé, motif authentique (source interne, pas de lien public).",
  },
  {
    themeId: "cm-mat-des-deux-tours",
    fen: "6r1/8/8/1P3Q2/P7/2P4P/1k4r1/7K b - - 8 55",
    solution: ["g2g1","h1h2","g8g2"],
    solutionSan: ["Rg1+","Kh2","R8g2#"],
    rating: 1300,
    sourceRef: "Partie Lichess réelle (CC0, base officielle des puzzles) — position critique jusqu'au mat forcé, motif authentique. https://lichess.org/4Wg3ajV4#109",
  },
  {
    themeId: "cm-mat-roi-et-dame-contre-roi",
    fen: "k7/8/2K5/8/8/8/8/3Q4 w - - 0 1",
    solution: ["c6b6","a8b8","d1d8"],
    solutionSan: ["Kb6","Kb8","Qd8#"],
    rating: 1180,
    sourceRef: "Position pédagogique composée à la main, vérifiée par rejeu et reconnaissance du motif — aucun exemple multi-plis authentique disponible dans les corpus importés pour ce motif rare.",
  },
  {
    themeId: "cm-mat-de-cozio",
    fen: "8/p7/7n/7k/5P1p/8/8/1K4Q1 w - - 0 1",
    solution: ["b1a1","a7a6","g1g5"],
    solutionSan: ["Ka1","a6","Qg5#"],
    rating: 1210,
    sourceRef: "Position pédagogique composée à la main, vérifiée par rejeu et reconnaissance du motif — aucun exemple multi-plis authentique disponible dans les corpus importés pour ce motif rare.",
  },
  {
    themeId: "cm-mat-du-fou-de-damiano",
    fen: "r3r1k1/pbq2p1p/1pp4B/4Pp2/1nP5/7Q/P4PPP/R3R1K1 w KQkq - 0 2",
    solution: ["h3g3","g8h8","g3g7"],
    solutionSan: ["Qg3+","Kh8","Qg7#"],
    rating: 1150,
    sourceRef: "Position tactique réelle du corpus d'entraînement — position critique jusqu'au mat forcé, motif authentique (source interne, pas de lien public).",
  },
  {
    themeId: "cm-mat-de-max-lange",
    fen: "6nk/p6p/7B/8/8/8/8/1K4Q1 w - - 0 1",
    solution: ["b1a1","a7a6","g1g7"],
    solutionSan: ["Ka1","a6","Qg7#"],
    rating: 1230,
    sourceRef: "Position pédagogique composée à la main, vérifiée par rejeu et reconnaissance du motif — aucun exemple multi-plis authentique disponible dans les corpus importés pour ce motif rare.",
  },
  {
    themeId: "cm-mat-du-filet",
    fen: "r4rk1/ppp2p1p/4B1p1/2K1N3/4q3/2Q5/PP4PP/R1B4R b kq - 0 1",
    solution: ["b7b6","c5b5","a7a6"],
    solutionSan: ["b6+","Kb5","a6#"],
    rating: 1150,
    sourceRef: "Position tactique réelle du corpus d'entraînement — position critique jusqu'au mat forcé, motif authentique (source interne, pas de lien public).",
  },

  // --- Endgame Mastery : 3 positions réelles, une par cours (voir course-lesson.ts) ---
  {
    themeId: "eg-mats-de-force-ecrasante",
    fen: "1k6/7R/1K6/8/8/8/8/8 w - - 30 16",
    solution: ["h7h8"],
    solutionSan: ["Rh8#"],
    rating: 900,
    sourceRef: "Position réelle du chapitre « Overkill mates: Rook Mate » du Complete Endgame Course de Jeremy Silman (AliJradi) — https://lichess.org/study/EXprT7yo/xt92Jlg6.",
  },
  {
    themeId: "eg-face-au-roi-seul",
    fen: "8/4k3/8/8/3KP3/8/8/8 w - - 0 1",
    solution: ["d4e5"],
    solutionSan: ["Ke5"],
    rating: 1000,
    sourceRef: "Position réelle du chapitre « Opposition » de Master The Endgame (1), MungosQerslen — https://lichess.org/study/g57WZOXL/vo2O2arG.",
  },
  {
    themeId: "eg-finales-de-pions-le-duel-des-rois",
    fen: "8/6p1/7k/8/1K6/8/1P6/8 w - - 0 1",
    solution: ["b4c5"],
    solutionSan: ["Kc5"],
    rating: 1400,
    sourceRef: "Position réelle du chapitre « King & Pawn vs King & Pawn (Different File) » de Master The Endgame (2), nishka_d — https://lichess.org/study/LNWy0uSa/dtnM1rKE.",
  },
  // ─────────────────────────────────────────────────────────────────────
  // Les 9 thèmes `pawn_structures` — chaque position vient d'une VRAIE
  // partie de maître citée par le chapitre Lichess correspondant (étude
  // https://lichess.org/study/srjMsNnC de Li-Pokamp), sur un moment DIFFÉRENT
  // de celui déjà illustré par `THEME_DEMOS` (`theme-demo.ts`) pour ce même
  // thème — jamais le même couple position/coup répété deux fois.
  // ─────────────────────────────────────────────────────────────────────
  {
    themeId: "ps-formation-caro-kann",
    fen: "r1bq1rk1/5ppp/2p1p3/ppPn4/3PN3/6P1/PPQ2PBP/R3R1K1 w - - 0 19",
    solution: ["e4d6"],
    solutionSan: ["Nd6"],
    rating: 1650,
    sourceRef: "Ivanisevic, Ivan – Ascic, Pero, Zupanja 2007 — étude Lichess « Structures de pions » de Li-Pokamp. https://lichess.org/study/srjMsNnC/upNrvdif",
  },
  {
    themeId: "ps-la-structure-grunfeld",
    fen: "rnbqk2r/pp2ppbp/6p1/2p5/3PP3/2P2N2/P4PPP/R1BQKB1R w KQkq - 0 8",
    solution: ["a1b1"],
    solutionSan: ["Rb1"],
    rating: 1550,
    sourceRef: "So, Wesley – Flores Rios, Mauricio, 2012 — étude Lichess « Structures de pions » de Li-Pokamp. https://lichess.org/study/srjMsNnC/B4IGDKLX",
  },
  {
    themeId: "ps-la-structure-stonewall",
    fen: "r1b2rk1/pp2q1pp/2pbp3/3pnp2/2PPn3/1P1BP3/PB2NPPP/R2Q1RK1 w - - 0 12",
    solution: ["d4e5"],
    solutionSan: ["dxe5"],
    rating: 1580,
    sourceRef: "Cvitan, Ognjen – Doric, Darko, Rijeka 2006 — étude Lichess « Structures de pions » de Li-Pokamp. https://lichess.org/study/srjMsNnC/MvGKodNu",
  },
  {
    themeId: "ps-formation-benoni-asymetrique",
    fen: "r1bqrbk1/1p3p1p/p2p1np1/2pP4/P1N1P3/2N5/1PQ1BPPP/R4RK1 w - - 2 16",
    solution: ["f2f4"],
    solutionSan: ["f4"],
    rating: 1620,
    sourceRef: "Akopian, Vladimir – Pantsulaia, Levan, UAE 2013 — étude Lichess « Structures de pions » de Li-Pokamp. https://lichess.org/study/srjMsNnC/SIXXErfT",
  },
  {
    themeId: "ps-formation-benoni-symetrique",
    fen: "r2qnrk1/pp3nbp/3p2p1/2pP1p2/2P2P2/2N4P/PP1BB1P1/R2Q1RK1 w - - 1 16",
    solution: ["g2g4"],
    solutionSan: ["g4"],
    rating: 1700,
    sourceRef: "Spassky, Boris – Fischer, Robert, 1992 — étude Lichess « Structures de pions » de Li-Pokamp. https://lichess.org/study/srjMsNnC/6s9sqgoy",
  },
  {
    themeId: "ps-structure-est-indienne-type-i",
    fen: "r1bq1r2/5pbk/pn1p2pp/1p1Pp2n/1P2P3/2N1BP2/P2QB1PP/R1N2RK1 w - - 1 16",
    solution: ["a2a4"],
    solutionSan: ["a4"],
    rating: 1690,
    sourceRef: "Ponomariov, Ruslan – Radjabov, Teimour, 2010 — étude Lichess « Structures de pions » de Li-Pokamp. https://lichess.org/study/srjMsNnC/IAnzABFD",
  },
  {
    themeId: "ps-structure-est-indienne-type-iii",
    fen: "r2q1rk1/pppn2b1/3p2np/3Pp1p1/2P1Pp2/2N2P2/PP1N1BPP/R2QR1K1 w - - 2 16",
    solution: ["b2b4"],
    solutionSan: ["b4"],
    rating: 1590,
    sourceRef: "Azarov, Sergei – Volke, Karsten, Dresden 2007 — étude Lichess « Structures de pions » de Li-Pokamp. https://lichess.org/study/srjMsNnC/V85NEXTp",
  },
  {
    themeId: "ps-structure-est-indienne-ouverte",
    fen: "r1b2rk1/1p3pbp/nqpp2p1/p1n5/P1PNP3/2N1B2P/1P1Q1PP1/1B1R1RK1 w - - 3 15",
    solution: ["f2f4"],
    solutionSan: ["f4"],
    rating: 1560,
    sourceRef: "Malakhov, Vladimir – Jobava, Baadur, 2012 — étude Lichess « Structures de pions » de Li-Pokamp. https://lichess.org/study/srjMsNnC/Y6fcd2tD",
  },
  {
    themeId: "ps-structure-francaise-type-i",
    fen: "r1bqr1k1/pp3pbp/2n1pnp1/2pp4/4P3/2PP1NP1/PP1N1PBP/R1BQR1K1 w - - 3 10",
    solution: ["e4e5"],
    solutionSan: ["e5"],
    rating: 1610,
    sourceRef: "Areshchenko, Alexander – Vovk, Yuri, Kiev 2011 — étude Lichess « Structures de pions » de Li-Pokamp. https://lichess.org/study/srjMsNnC/Gt5AJoXF",
  },
  // ─────────────────────────────────────────────────────────────────────
  // Le thème `pawn_weaknesses` — étude Lichess « Pawn Structure » de Yushan.
  // ─────────────────────────────────────────────────────────────────────
  {
    themeId: "pw-le-pion-arriere",
    fen: "3r2k1/6pp/2rp4/3Rp3/4P3/5P1P/6P1/3R2K1 w - - 0 1",
    solution: ["d5e5", "d6e5", "d1d8"],
    solutionSan: ["Rxe5", "dxe5", "Rxd8+"],
    rating: 1500,
    sourceRef: "Position réelle de l'étude Lichess « Pawn Structure » de Yushan (« Backward Pawn: Make Your Opponent Suffer ») — la nécessité de défendre le pion arriéré d6 laisse échapper le pion e5. https://lichess.org/study/a8arx17S/f05zVwCO",
  },
  // ─────────────────────────────────────────────────────────────────────
  // Le thème `middlegame` — 7 études Lichess complètes de NoseKnowsAll (voir
  // `course-lesson.ts`) : un exercice par thème, tiré du chapitre « Exercise »
  // de l'étude source elle-même (position + solution déjà données par
  // NoseKnowsAll), jamais composé à la main.
  // ─────────────────────────────────────────────────────────────────────
  {
    themeId: "mg-les-cavaliers",
    fen: "3r2r1/p1p2n1k/1p4p1/4p2p/PP2PP1P/4BP2/2K3R1/6R1 w - - 0 2",
    solution: ["g2d2", "e5f4", "e3f4"],
    solutionSan: ["Rd2", "exf4", "Bxf4"],
    rating: 1750,
    sourceRef: "Exercice 2 de l'étude Lichess « Knights » de NoseKnowsAll, adapté de Petrosian – Botvinnik, 1963 — le fou reprend sur f4 et domine aussitôt le cavalier f7. https://lichess.org/study/kI8ikTU4/0m3Rdf01",
  },
  {
    themeId: "mg-les-fous",
    fen: "r3kbnr/p4ppp/bpn1p3/2p5/4P3/2P2NP1/PP3PBP/RNBK3R w kq - 1 3",
    solution: ["g2f1", "e8c8", "b1d2", "a6b7"],
    solutionSan: ["Bf1", "O-O-O+", "Nbd2", "Bb7"],
    rating: 1700,
    sourceRef: "Exercice 3 de l'étude Lichess « Bishops » de NoseKnowsAll — le fou se redirige vers la grande diagonale plutôt que de s'échanger contre le fou mal placé en f1. https://lichess.org/study/kNn68T8l/FfZCrLSb",
  },
  {
    themeId: "mg-les-tours",
    fen: "3r3k/2Rb4/2p5/P1R4P/4P1p1/8/rP3PK1/8 w - - 0 1",
    solution: ["c5e5", "d7e8", "e5e7", "a2a5", "e7h7", "h8g8", "c7g7", "g8f8", "h5h6"],
    solutionSan: ["Re5", "Be8", "Ree7", "Rxa5", "Rh7+", "Kg8", "Rcg7+", "Kf8", "h6"],
    rating: 1900,
    sourceRef: "Exercice 4 de l'étude Lichess « Rooks » de NoseKnowsAll — les tours doublées créent un filet de mat imparable (Rh8# menacé) après h6. https://lichess.org/study/U7tTRtdj/PTOUuoVo",
  },
  {
    themeId: "mg-toujours-sacrifier-la-qualite",
    fen: "b2r2k1/2q3bp/1r4p1/p2nPp2/2pP1P2/2P4P/R1B1NQ1K/2B2R2 b - - 1 31",
    solution: ["b6b3", "c2b3", "c4b3", "a2a4", "g7f8", "c1b2", "a8c6"],
    solutionSan: ["Rb3", "Bxb3", "cxb3", "Ra4", "Bf8", "Bb2", "Bc6"],
    rating: 2100,
    sourceRef: "Exercice 3 de l'étude Lichess « Always sacrifice the exchange! » de NoseKnowsAll, tiré du tournoi des Candidats 1959, Smyslov – Gligorić. https://lichess.org/study/h3ccaYFE/Xoo9CRly",
  },
  {
    themeId: "mg-cases-claires-et-cases-sombres",
    fen: "3q1r2/5pkp/r1p1p1p1/p2p3n/4P3/2N2P2/PPPQ2P1/2KR3R w - - 0 16",
    solution: ["g2g4", "h5f6", "d2h6", "g7g8", "e4e5"],
    solutionSan: ["g4", "Nf6", "Qh6+", "Kg8", "e5"],
    rating: 1650,
    sourceRef: "Exercice 3 de l'étude Lichess « Light and Dark Squares » de NoseKnowsAll — après e5, le cavalier noir n'a plus aucune case sûre et Qxh7# est imparable. https://lichess.org/study/T3ixjwmg/6VkLbgOl",
  },
  {
    themeId: "mg-parle-a-tes-pieces",
    fen: "r4rk1/7p/2nq2p1/1pp1p1Q1/4P3/pPPP2P1/P4P2/R3RBK1 b - - 0 1",
    solution: ["b5b4", "c3c4", "c6d4"],
    solutionSan: ["b4", "c4", "Nd4"],
    rating: 1800,
    sourceRef: "Exercice 3 de l'étude Lichess « Talk to your pieces! » de NoseKnowsAll — le pion c3 dominait le cavalier ; une fois délogé, le cavalier rejoint enfin sa case de rêve d4. https://lichess.org/study/kjBSgqoA/xwGEKc63",
  },
  {
    themeId: "mg-les-pions-ne-sont-pas-des-personnes",
    fen: "3qr1k1/3n1pbp/3p2p1/1p1P4/2p1PPP1/1r2BB1P/1P2RQK1/R7 b - - 0 1",
    solution: ["g6g5", "f4g5", "d7e5"],
    solutionSan: ["g5", "fxg5", "Ne5"],
    rating: 1950,
    sourceRef: "Exercice 3 de l'étude Lichess « Pawns aren't people! » de NoseKnowsAll — le pion sacrifié n'a aucune importance, seule compte l'activation du cavalier sur e5. https://lichess.org/study/dYFcDtRq/RlyKOUux",
  },
  // `pm-transformer-un-avantage` : 13 exercices (2026-09-11, 2e lot du
  // Palier Or), tirés de la partie RÉELLE Fabiano Caruana – Sam Shankland,
  // Sinquefield Cup 2021 (PGN officiel du tournoi,
  // theweekinchess.com/assets/files/pgn/sinqcup21.pgn). Aucun fichier PILOT
  // n'existait pour ce thème : la partie a été sourcée sur le web puis
  // rejouée et vérifiée coup par coup avec chess.js. Même partie que le
  // tutoriel `COURSE_LESSONS["pm-transformer-un-avantage"]`.
  {
    themeId: "pm-transformer-un-avantage",
    fen: "rnb2rk1/pp2ppbp/1q1p1np1/8/3P1B2/5N1P/PPPNBPP1/R2QK2R w KQ - 3 9",
    solution: ["d2c4"],
    solutionSan: ["Nc4"],
    rating: 1300,
    sourceRef: "Caruana – Shankland, Sinquefield Cup 2021 : 9.Nc4 réoriente le Cavalier vers un avant-poste central.",
  },
  {
    themeId: "pm-transformer-un-avantage",
    fen: "r1b2rk1/ppq1ppbp/2np1np1/8/3P1B2/4NN1P/PPP1BPP1/R2QK2R w KQ - 7 11",
    solution: ["c2c3"],
    solutionSan: ["c3"],
    rating: 1330,
    sourceRef: "Caruana – Shankland, 2021 : 11.c3 consolide le centre avant de préparer la fermeture par e5.",
  },
  {
    themeId: "pm-transformer-un-avantage",
    fen: "r1b2rk1/pp2qpbp/2np1np1/8/3Pp3/2P1NN1P/PP2BPPB/R2Q1RK1 w - - 0 14",
    solution: ["f3e1"],
    solutionSan: ["Ne1"],
    rating: 1360,
    sourceRef: "Caruana – Shankland, 2021 : 14.Ne1 replie le Cavalier pour le rediriger vers c2 puis e3.",
  },
  {
    themeId: "pm-transformer-un-avantage",
    fen: "r4rk1/pp1nqpbp/2n1b1p1/3p4/3Pp3/2P1N2P/PPN1BPPB/R3QRK1 w - - 4 17",
    solution: ["f2f3"],
    solutionSan: ["f3"],
    rating: 1390,
    sourceRef: "Caruana – Shankland, 2021 : 17.f3! commence à transformer l'avantage de structure en ouverture de lignes vers le Roi noir.",
  },
  {
    themeId: "pm-transformer-un-avantage",
    fen: "r4rk1/pp1nq1bp/2n1b1p1/3p4/3Pp3/2P1N2P/PPN1B1PB/R3QRK1 w - - 0 19",
    solution: ["h2f4"],
    solutionSan: ["Bf4"],
    rating: 1420,
    sourceRef: "Caruana – Shankland, 2021 : 19.Bf4 rejoint l'attaque contre l'aile Roi noire.",
  },
  {
    themeId: "pm-transformer-un-avantage",
    fen: "r5k1/pp2qrbp/2n1bnp1/3p4/3PpB2/2P1N1QP/PPN1B1P1/R4RK1 w - - 4 21",
    solution: ["f1f2"],
    solutionSan: ["Rf2"],
    rating: 1450,
    sourceRef: "Caruana – Shankland, 2021 : 21.Rf2 double les Tours sur la colonne f fraîchement ouverte.",
  },
  {
    themeId: "pm-transformer-un-avantage",
    fen: "4nrk1/pp1q1rbp/2n1b1p1/3p4/3PpB1Q/2P1N2P/PPN1BRP1/5RK1 w - - 10 24",
    solution: ["e3g4"],
    solutionSan: ["Ng4"],
    rating: 1480,
    sourceRef: "Caruana – Shankland, 2021 : 24.Ng4 amène une dernière pièce vers l'assaut final.",
  },
  {
    themeId: "pm-transformer-un-avantage",
    fen: "5rk1/pp1qnrbp/3nb1p1/3p4/3PpBNQ/2P1N2P/PP2BRP1/5RK1 w - - 14 26",
    solution: ["g4e5"],
    solutionSan: ["Ne5"],
    rating: 1500,
    sourceRef: "Caruana – Shankland, 2021 : 26.Ne5! plante un Cavalier intouchable au centre, transformant l'espace en avant-poste dominant.",
  },
  {
    themeId: "pm-transformer-un-avantage",
    fen: "5rk1/pp1qnr1p/3nb1p1/3pb3/3PpB1Q/2P1N2P/PP2BRP1/5RK1 w - - 0 27",
    solution: ["f4e5"],
    solutionSan: ["Bxe5"],
    rating: 1520,
    sourceRef: "Caruana – Shankland, 2021 : 27.Bxe5 garde un Fou monstrueux sur les cases noires autour du Roi noir.",
  },
  {
    themeId: "pm-transformer-un-avantage",
    fen: "5rk1/pp1q1rn1/4b1pQ/3pBn2/3Pp1P1/2P5/PP2BRP1/5RK1 w - - 3 32",
    solution: ["g4f5"],
    solutionSan: ["gxf5"],
    rating: 1550,
    sourceRef: "Caruana – Shankland, 2021 : 30.gxf5! ouvre la série d'échanges qui va convertir la pression en attaque directe.",
  },
  {
    themeId: "pm-transformer-un-avantage",
    fen: "6k1/pp1q2n1/4b1pQ/3pBr2/3Pp3/2P5/PP2B1P1/5RK1 w - - 0 34",
    solution: ["f1f5"],
    solutionSan: ["Rxf5"],
    rating: 1570,
    sourceRef: "Caruana – Shankland, 2021 : 32.Rxf5, dernier maillon de la série d'échanges de Tours.",
  },
  {
    themeId: "pm-transformer-un-avantage",
    fen: "6k1/pp1q2n1/4b1pQ/3pB3/3Pp1P1/2P5/PP2B3/6K1 w - - 1 36",
    solution: ["h6g6"],
    solutionSan: ["Qxg6"],
    rating: 1600,
    sourceRef: "Caruana – Shankland, 2021 : 36.Qxg6! — la conversion finale, l'avantage initial devient une attaque de mat imparable.",
  },
  {
    themeId: "pm-transformer-un-avantage",
    fen: "6k1/pp3qn1/4b2Q/3pB3/3P2P1/2P1p3/PP2B3/6K1 w - - 0 38",
    solution: ["e2f3"],
    solutionSan: ["Bf3"],
    rating: 1620,
    sourceRef: "Caruana – Shankland, 2021 : 38.Bf3, dernier coup avant l'abandon des Noirs.",
  },
  // `pm-la-technique-de-simplification` : 14 exercices (2026-09-11, 2e lot
  // du Palier Or), tirés de la partie RÉELLE Magnus Carlsen – Ian
  // Nepomniachtchi, Championnat du Monde 2021, Partie 6 — la plus longue
  // partie de l'histoire des championnats du monde (136 coups)
  // (en.wikipedia.org/wiki/Carlsen_versus_Nepomniachtchi,_World_Chess_Championship_2021,_Game_6).
  // Aucun fichier PILOT n'existait pour ce thème : la partie a été sourcée
  // sur le web puis rejouée et vérifiée coup par coup avec chess.js
  // (seuls les 50 premiers coups sont exploités ici, largement suffisants
  // pour illustrer la technique). Même partie que le tutoriel
  // `COURSE_LESSONS["pm-la-technique-de-simplification"]`.
  {
    themeId: "pm-la-technique-de-simplification",
    fen: "rnbqk2r/ppp1bppp/4pn2/3p4/3P4/5NP1/PPP1PPBP/RNBQK2R w KQkq - 2 5",
    solution: ["e1g1"],
    solutionSan: ["O-O"],
    rating: 1300,
    sourceRef: "Carlsen – Nepomniachtchi, Championnat du Monde 2021, Partie 6 : 5.O-O, mise en place calme d'une Catalane.",
  },
  {
    themeId: "pm-la-technique-de-simplification",
    fen: "rnbq1rk1/pp3ppp/4pn2/2b5/2p5/1P3NP1/P3PPBP/RNBQ1RK1 w - - 0 9",
    solution: ["d1c2"],
    solutionSan: ["Qc2"],
    rating: 1325,
    sourceRef: "Carlsen – Nepomniachtchi, 2021 : 9.Qc2 prépare la reprise du pion c4 sans complication.",
  },
  {
    themeId: "pm-la-technique-de-simplification",
    fen: "r1b2rk1/pp2qppp/2n1pn2/2b5/2p5/1P3NP1/P1QNPPBP/R1B2RK1 w - - 4 11",
    solution: ["d2c4"],
    solutionSan: ["Nxc4"],
    rating: 1350,
    sourceRef: "Carlsen – Nepomniachtchi, 2021 : 11.Nxc4 regagne le pion, position parfaitement saine et simple à jouer.",
  },
  {
    themeId: "pm-la-technique-de-simplification",
    fen: "r1b2rk1/p3qppp/2n1pn2/1pb5/2N5/1P3NP1/P1Q1PPBP/R1B2RK1 w - - 0 12",
    solution: ["c4e5"],
    solutionSan: ["Nce5"],
    rating: 1375,
    sourceRef: "Carlsen – Nepomniachtchi, 2021 : 12.Nce5 centralise le Cavalier plutôt que de chercher la complication.",
  },
  {
    themeId: "pm-la-technique-de-simplification",
    fen: "r4rk1/pb2qppp/4pn2/1pb1N3/1n6/1P3NP1/PQ2PPBP/R1B2RK1 w - - 4 14",
    solution: ["a2a3"],
    solutionSan: ["a3"],
    rating: 1400,
    sourceRef: "Carlsen – Nepomniachtchi, 2021 : 14.a3 chasse le Cavalier b4 sans relâcher la pression.",
  },
  {
    themeId: "pm-la-technique-de-simplification",
    fen: "r2r2k1/pb2qppp/1bn1pn2/1p4B1/8/PP1N1NP1/1Q2PPBP/R4RK1 w - - 5 17",
    solution: ["g5f6"],
    solutionSan: ["Bxf6"],
    rating: 1425,
    sourceRef: "Carlsen – Nepomniachtchi, 2021 : 17.Bxf6! échange volontairement pour abîmer la structure de pions noire.",
  },
  {
    themeId: "pm-la-technique-de-simplification",
    fen: "r2r2k1/pb2qp1p/1bn1pp2/1p6/8/PP1N1NP1/1Q2PPBP/R4RK1 w - - 0 18",
    solution: ["a1c1"],
    solutionSan: ["Rac1"],
    rating: 1450,
    sourceRef: "Carlsen – Nepomniachtchi, 2021 : 18.Rac1, développement tranquille qui continue de simplifier.",
  },
  {
    themeId: "pm-la-technique-de-simplification",
    fen: "r2r2k1/pb2qp1p/1b2pp2/1p6/3n4/PP1N1NP1/1Q2PPBP/2R2RK1 w - - 2 19",
    solution: ["f3d4"],
    solutionSan: ["Nxd4"],
    rating: 1475,
    sourceRef: "Carlsen – Nepomniachtchi, 2021 : 19.Nxd4, encore un échange qui rapproche d'une finale maîtrisable.",
  },
  {
    themeId: "pm-la-technique-de-simplification",
    fen: "r2r2k1/p4p1p/4pp2/1p6/3bq3/PP1N2P1/Q3PP1P/2R2RK1 w - - 3 23",
    solution: ["a2c2"],
    solutionSan: ["Qc2"],
    rating: 1500,
    sourceRef: "Carlsen – Nepomniachtchi, 2021 : 23.Qc2, la Dame se replace avant la grande simplification à venir.",
  },
  {
    themeId: "pm-la-technique-de-simplification",
    fen: "r2r4/5pkp/4pp2/pp6/3bq3/PP1N2P1/2Q1PP1P/2RR2K1 w - - 2 25",
    solution: ["d1d2"],
    solutionSan: ["Rd2"],
    rating: 1525,
    sourceRef: "Carlsen – Nepomniachtchi, 2021 : 25.Rd2, dernier coup de mise en place avant Qxc8!.",
  },
  {
    themeId: "pm-la-technique-de-simplification",
    fen: "2r5/5pkp/4pp2/pp6/3bq3/PP1N2P1/3RPP1P/2R3K1 w - - 0 27",
    solution: ["c1c8"],
    solutionSan: ["Rxc8"],
    rating: 1550,
    sourceRef: "Carlsen – Nepomniachtchi, 2021 : 26.Qxc8! Rxc8 27.Rxc8! — les Blancs échangent leur Dame contre deux Tours, la grande simplification du chapitre.",
  },
  {
    themeId: "pm-la-technique-de-simplification",
    fen: "2R5/5pkp/4pp2/1p1qb3/pP6/P2NP1P1/3R1P1P/6K1 w - - 1 30",
    solution: ["h2h4"],
    solutionSan: ["h4"],
    rating: 1575,
    sourceRef: "Carlsen – Nepomniachtchi, 2021 : 30.h4, la phase de technique pure s'installe pour de longues manœuvres.",
  },
  {
    themeId: "pm-la-technique-de-simplification",
    fen: "8/5pk1/3qpp2/1pR4p/pP5P/P2NP1P1/1b1R1P1K/8 w - - 4 33",
    solution: ["d2d1"],
    solutionSan: ["Rd1"],
    rating: 1600,
    sourceRef: "Carlsen – Nepomniachtchi, 2021 : 33.Rd1, la partie continue de se jouer sur la seule patience.",
  },
  {
    themeId: "pm-la-technique-de-simplification",
    fen: "8/5p2/5p1k/q6p/1b3N1P/p2RP1P1/R4P1K/8 w - - 6 47",
    solution: ["d3d1"],
    solutionSan: ["Rd1"],
    rating: 1625,
    sourceRef: "Carlsen – Nepomniachtchi, 2021 : 47.Rd1 — au 47e coup, la partie n'est encore qu'à un tiers de son record de 136 coups.",
  },
  // `pm-le-complexe-de-cases-de-couleur` : 13 exercices (2026-09-11, 2e lot
  // du Palier Or), tirés de la partie RÉELLE Ludek Pachman – Bobby Fischer,
  // Olympiade de La Havane 1966 (confirmée via
  // chessbox.in/chessgame/pachman-ludek-fischer-robert-j-4). Aucun fichier
  // PILOT n'existait pour ce thème : la partie a été sourcée sur le web puis
  // rejouée et vérifiée coup par coup avec chess.js. Même partie que le
  // tutoriel `COURSE_LESSONS["pm-le-complexe-de-cases-de-couleur"]`.
  {
    themeId: "pm-le-complexe-de-cases-de-couleur",
    fen: "r1bqk2r/pp3ppp/4pn2/n7/2pP4/2N1B3/PP2BPPP/R2Q1RK1 w kq - 2 11",
    solution: ["e2c4"],
    solutionSan: ["Bxc4"],
    rating: 1300,
    sourceRef: "Pachman – Fischer, Olympiade de La Havane 1966 : 11.Bxc4 — le dernier Fou à cases claires blanc va bientôt quitter l'échiquier.",
  },
  {
    themeId: "pm-le-complexe-de-cases-de-couleur",
    fen: "r1bqk2r/pp3ppp/4pn2/n7/2BP4/2N1B3/PP3PPP/R2Q1RK1 b kq - 0 11",
    solution: ["a5c4"],
    solutionSan: ["Nxc4"],
    rating: 1330,
    sourceRef: "Pachman – Fischer, 1966 : 11...Nxc4! — les Blancs ne conservent plus qu'un Fou à cases noires pour le reste de la partie.",
  },
  {
    themeId: "pm-le-complexe-de-cases-de-couleur",
    fen: "r3k2r/pp3ppp/2b1pn2/q5B1/2QP4/2N5/PP3PPP/R4RK1 w kq - 3 15",
    solution: ["c4c5"],
    solutionSan: ["Qc5"],
    rating: 1360,
    sourceRef: "Pachman – Fischer, 1966 : 15.Qc5 propose l'échange des Dames.",
  },
  {
    themeId: "pm-le-complexe-de-cases-de-couleur",
    fen: "r3k2r/pp3ppp/2b1pn2/2q3B1/3P4/2N5/PP3PPP/R4RK1 w kq - 0 16",
    solution: ["d4c5"],
    solutionSan: ["dxc5"],
    rating: 1390,
    sourceRef: "Pachman – Fischer, 1966 : 16.dxc5 fixe un pion blanc sur une case noire — la couleur du seul Fou blanc restant.",
  },
  {
    themeId: "pm-le-complexe-de-cases-de-couleur",
    fen: "r3k2r/1p1n1pp1/2b1p3/p1P4p/7P/2N1B3/PP3PP1/R2R2K1 b kq - 2 19",
    solution: ["d7e5"],
    solutionSan: ["Ne5"],
    rating: 1420,
    sourceRef: "Pachman – Fischer, 1966 : 19...Ne5, Fischer regroupe patiemment son Cavalier.",
  },
  {
    themeId: "pm-le-complexe-de-cases-de-couleur",
    fen: "r3k1r1/1p1n1pp1/2b1p3/p1P4p/7P/1PN1B3/P4PP1/R2R2K1 b q - 2 22",
    solution: ["d7e5"],
    solutionSan: ["Ne5"],
    rating: 1450,
    sourceRef: "Pachman – Fischer, 1966 : 22...Ne5 — le complexe de cases claires ne va nulle part, Fischer prend tout son temps.",
  },
  {
    themeId: "pm-le-complexe-de-cases-de-couleur",
    fen: "r3k1r1/1p3pp1/2b1p3/p1Pn3p/7P/1PN1BP2/P5P1/R2R2K1 w q - 5 26",
    solution: ["c3d5"],
    solutionSan: ["Nxd5"],
    rating: 1480,
    sourceRef: "Pachman – Fischer, 1966 : 26.Nxd5 échange le dernier Cavalier blanc — plus aucune pièce blanche ne pourra jamais toucher une case claire.",
  },
  {
    themeId: "pm-le-complexe-de-cases-de-couleur",
    fen: "r3k1r1/1p3pp1/2b1p3/p1PN3p/7P/1P2BP2/P5P1/R2R2K1 b q - 0 26",
    solution: ["c6d5"],
    solutionSan: ["Bxd5"],
    rating: 1500,
    sourceRef: "Pachman – Fischer, 1966 : 26...Bxd5, le Fou noir prend possession de tout le complexe de cases claires.",
  },
  {
    themeId: "pm-le-complexe-de-cases-de-couleur",
    fen: "r3k1r1/1p3pp1/4p3/p1Pb3p/7P/1P2BP2/P5P1/R2R2K1 w q - 0 27",
    solution: ["d1d4"],
    solutionSan: ["Rd4"],
    rating: 1520,
    sourceRef: "Pachman – Fischer, 1966 : 27.Rd4, les Blancs n'ont plus que des manœuvres défensives.",
  },
  {
    themeId: "pm-le-complexe-de-cases-de-couleur",
    fen: "r5r1/1p4p1/2k1pp2/p1Pb3p/3R3P/1PR1BP2/P5P1/6K1 w - - 0 30",
    solution: ["f3f4"],
    solutionSan: ["f4"],
    rating: 1550,
    sourceRef: "Pachman – Fischer, 1966 : 30.f4, encore un pion blanc qui se fixe sur une case noire.",
  },
  {
    themeId: "pm-le-complexe-de-cases-de-couleur",
    fen: "r2r4/1p4p1/2k1pp2/2Pb3p/p2R1P1P/1PR1B3/P4KP1/8 w - - 0 32",
    solution: ["d4a4"],
    solutionSan: ["Rxa4"],
    rating: 1570,
    sourceRef: "Pachman – Fischer, 1966 : 32.Rxa4, regagne un pion mais la faiblesse de fond demeure entière.",
  },
  {
    themeId: "pm-le-complexe-de-cases-de-couleur",
    fen: "3r4/1p4p1/2k1pp2/2Pb3p/P4P1P/2R1B3/P4KP1/8 b - - 0 33",
    solution: ["d5a2"],
    solutionSan: ["Bxa2"],
    rating: 1600,
    sourceRef: "Pachman – Fischer, 1966 : 33...Bxa2! — première récolte concrète : le pion a2, sur case claire, tombe car aucune pièce blanche ne pouvait plus le défendre.",
  },
  {
    themeId: "pm-le-complexe-de-cases-de-couleur",
    fen: "8/1pk3p1/2b1pp2/r1P4p/PR3P1P/4B1P1/5K2/8 b - - 4 39",
    solution: ["c6a4"],
    solutionSan: ["Bxa4"],
    rating: 1620,
    sourceRef: "Pachman – Fischer, 1966 : 39...Bxa4! — un second pion sur case claire tombe ; le Fou noir se promène librement dans le camp blanc.",
  },
  // `pm-le-fou-contre-trois-pions` : 13 exercices (2026-09-11, 3e lot du
  // Palier Or), tirés de la partie RÉELLE Bobby Fischer – Boris Spassky,
  // Reykjavik 1972, Partie 1 (étude Lichess,
  // lichess.org/study/luNw8vEM/NCcC4fSs) — LA référence de tous les livres
  // qui discutent la règle « Fou = trois pions ». Aucun fichier PILOT
  // n'existait pour ce thème : la partie a été sourcée sur le web puis
  // rejouée et vérifiée coup par coup avec chess.js. Même partie que le
  // tutoriel `COURSE_LESSONS["pm-le-fou-contre-trois-pions"]`.
  {
    themeId: "pm-le-fou-contre-trois-pions",
    fen: "5k2/pp4pp/3bpp2/1P6/8/P2KP3/5PPP/2B5 b - - 0 1",
    solution: ["d6h2"],
    solutionSan: ["Bxh2"],
    rating: 1300,
    sourceRef: "Fischer – Spassky, Reykjavik 1972, Partie 1 : 29...Bxh2?? — le coup qui déclenche tout, un pion grappillé qui va coûter la pièce entière.",
  },
  {
    themeId: "pm-le-fou-contre-trois-pions",
    fen: "5k2/pp4pp/4pp2/1P6/8/P2KP1P1/5P1b/2B5 b - - 0 2",
    solution: ["h7h5"],
    solutionSan: ["h5"],
    rating: 1330,
    sourceRef: "Fischer – Spassky, 1972 : 30...h5, le Fou noir cherche encore une case de fuite.",
  },
  {
    themeId: "pm-le-fou-contre-trois-pions",
    fen: "5k2/pp4p1/4pp2/1P5p/8/P3P1P1/4KP1b/2B5 b - - 1 3",
    solution: ["h5h4"],
    solutionSan: ["h4"],
    rating: 1360,
    sourceRef: "Fischer – Spassky, 1972 : 31...h4, mais la case g1 reste fermée.",
  },
  {
    themeId: "pm-le-fou-contre-trois-pions",
    fen: "5k2/pp4p1/4pp2/1P6/7p/P3PKP1/5P1b/2B5 b - - 1 4",
    solution: ["f8e7"],
    solutionSan: ["Ke7"],
    rating: 1390,
    sourceRef: "Fischer – Spassky, 1972 : 32...Ke7, le Roi noir vient à l'aide de son Fou piégé.",
  },
  {
    themeId: "pm-le-fou-contre-trois-pions",
    fen: "8/pp2k1p1/4pp2/1P6/7p/P3P1P1/5PKb/2B5 b - - 3 5",
    solution: ["h4g3"],
    solutionSan: ["hxg3"],
    rating: 1420,
    sourceRef: "Fischer – Spassky, 1972 : 33...hxg3, un second pion tombe.",
  },
  {
    themeId: "pm-le-fou-contre-trois-pions",
    fen: "8/pp2k1p1/4pp2/1P6/8/P3P1P1/6Kb/2B5 b - - 0 6",
    solution: ["h2g3"],
    solutionSan: ["Bxg3"],
    rating: 1450,
    sourceRef: "Fischer – Spassky, 1972 : 34...Bxg3, le Fou croque un troisième pion — mais il n'y a plus d'issue.",
  },
  {
    themeId: "pm-le-fou-contre-trois-pions",
    fen: "8/pp2k1p1/4pp2/1P6/8/P3P1K1/8/2B5 b - - 0 7",
    solution: ["e7d6"],
    solutionSan: ["Kd6"],
    rating: 1480,
    sourceRef: "Fischer – Spassky, 1972 : 35.Kxg3! le Fou est capturé pour de bon — un Fou entier contre seulement 2 pions.",
  },
  {
    themeId: "pm-le-fou-contre-trois-pions",
    fen: "8/pp4p1/4pp2/1P1k4/P7/B3P1K1/8/8 b - - 2 9",
    solution: ["d5e4"],
    solutionSan: ["Ke4"],
    rating: 1500,
    sourceRef: "Fischer – Spassky, 1972 : 37...Ke4, les Noirs n'ont plus qu'un Roi et des pions contre Roi, Fou et pions.",
  },
  {
    themeId: "pm-le-fou-contre-trois-pions",
    fen: "8/1p4p1/pP2pp2/2B5/P3k3/4P1K1/8/8 b - - 0 11",
    solution: ["f6f5"],
    solutionSan: ["f5"],
    rating: 1520,
    sourceRef: "Fischer – Spassky, 1972 : 39...f5?, une tentative de contre-jeu qui ne change rien à l'évaluation.",
  },
  {
    themeId: "pm-le-fou-contre-trois-pions",
    fen: "8/1p4p1/pP2p3/2B5/P3kP1K/8/8/8 b - - 0 13",
    solution: ["e4f4"],
    solutionSan: ["Kxf4"],
    rating: 1550,
    sourceRef: "Fischer – Spassky, 1972 : 41...Kxf4, le dernier pion noir actif disparaît.",
  },
  {
    themeId: "pm-le-fou-contre-trois-pions",
    fen: "8/1p4p1/pP2p3/5k1K/P7/4B3/8/8 b - - 3 15",
    solution: ["f5e4"],
    solutionSan: ["Ke4"],
    rating: 1570,
    sourceRef: "Fischer – Spassky, 1972 : 43...Ke4, le Fou blanc continue seul de restreindre les derniers pions noirs.",
  },
  {
    themeId: "pm-le-fou-contre-trois-pions",
    fen: "8/1p4p1/pP6/5k1K/P3p3/4B3/8/8 b - - 1 19",
    solution: ["f5f6"],
    solutionSan: ["Kf6"],
    rating: 1600,
    sourceRef: "Fischer – Spassky, 1972 : 47...Kf6, le Roi blanc part récolter les derniers pions noirs.",
  },
  {
    themeId: "pm-le-fou-contre-trois-pions",
    fen: "8/1p4p1/1P6/p2k1K2/P3p3/8/5B2/8 b - - 1 23",
    solution: ["g7g5"],
    solutionSan: ["g5"],
    rating: 1620,
    sourceRef: "Fischer – Spassky, 1972 : 51...g5?, le dernier pion noir tombe la position d'après ; la conversion finale du Fou en avantage décisif est achevée.",
  },
  // `pm-la-forteresse-defensive` : 13 exercices (2026-09-11, 3e lot du
  // Palier Or), tirés de la partie RÉELLE Jonathan Hawkins – Daniel
  // Gormally, 2008 (étude Lichess « Fortresses »,
  // lichess.org/study/0ZcX3Bkx/GiZWMnur). Aucun fichier PILOT n'existait
  // pour ce thème : la partie a été sourcée sur le web puis rejouée et
  // vérifiée coup par coup avec chess.js. Même partie que le tutoriel
  // `COURSE_LESSONS["pm-la-forteresse-defensive"]`.
  {
    themeId: "pm-la-forteresse-defensive",
    fen: "r4rk1/pp1qppb1/2n3p1/7p/3PP2P/2R1BP2/P3N1P1/1Q3K1R w - - 0 1",
    solution: ["e4e5"],
    solutionSan: ["e5"],
    rating: 1300,
    sourceRef: "Hawkins – Gormally, 2008 : 1.e5! restreint le Fou g7 noir et pose la première pierre de la forteresse.",
  },
  {
    themeId: "pm-la-forteresse-defensive",
    fen: "2r2rk1/p2qnpb1/1p2p1p1/4P1Bp/3P3P/1R3P2/P3NKP1/1Q5R w - - 2 5",
    solution: ["b1e4"],
    solutionSan: ["Qe4"],
    rating: 1330,
    sourceRef: "Hawkins – Gormally, 2008 : 5.Qe4! propose l'échange des Dames, le bon réflexe pour défendre une position inférieure.",
  },
  {
    themeId: "pm-la-forteresse-defensive",
    fen: "5rk1/p3npb1/1p2p1p1/4P1B1/2rP2PP/1R3q2/P3NK2/7R w - - 0 9",
    solution: ["b3f3"],
    solutionSan: ["Rxf3"],
    rating: 1360,
    sourceRef: "Hawkins – Gormally, 2008 : 9.Rxf3, regroupement avant la poussée du pion h.",
  },
  {
    themeId: "pm-la-forteresse-defensive",
    fen: "5rk1/p4pb1/1p2p1p1/3nP1B1/2rP2PP/5R2/P3NK2/7R w - - 1 10",
    solution: ["h4h5"],
    solutionSan: ["h5"],
    rating: 1390,
    sourceRef: "Hawkins – Gormally, 2008 : 10.h5!, le pion h se lance en avant.",
  },
  {
    themeId: "pm-la-forteresse-defensive",
    fen: "5rk1/p4pb1/1p2p3/3nP1Bp/2rP2P1/5R2/P3NK2/7R w - - 0 11",
    solution: ["g4h5"],
    solutionSan: ["gxh5"],
    rating: 1420,
    sourceRef: "Hawkins – Gormally, 2008 : 11.gxh5, le pion h poursuit sa route.",
  },
  {
    themeId: "pm-la-forteresse-defensive",
    fen: "6rb/p4p1k/1p2p2P/4P1B1/3P1R1K/8/P5r1/7R w - - 1 17",
    solution: ["f4f7"],
    solutionSan: ["Rxf7+"],
    rating: 1450,
    sourceRef: "Hawkins – Gormally, 2008 : 17.Rxf7+, activité de Tour malgré le déficit matériel à venir.",
  },
  {
    themeId: "pm-la-forteresse-defensive",
    fen: "r6b/p4R1P/1p2p1k1/4P1B1/3P3K/8/P5r1/7R w - - 1 19",
    solution: ["f7e7"],
    solutionSan: ["Re7"],
    rating: 1480,
    sourceRef: "Hawkins – Gormally, 2008 : 19.Re7, la Tour blanche reste active malgré le pion h désormais livré à lui-même.",
  },
  {
    themeId: "pm-la-forteresse-defensive",
    fen: "r6b/p6P/1p2R3/4Pkr1/3P3K/8/P7/7R w - - 1 21",
    solution: ["h1f1"],
    solutionSan: ["Rf1+"],
    rating: 1500,
    sourceRef: "Hawkins – Gormally, 2008 : 21.Rf1+, dernier échange de Tours avant l'entrée en finale technique.",
  },
  {
    themeId: "pm-la-forteresse-defensive",
    fen: "3r3b/p6P/1p2k3/4P1K1/3P4/8/P7/5R2 w - - 1 23",
    solution: ["f1f4"],
    solutionSan: ["Rf4"],
    rating: 1520,
    sourceRef: "Hawkins – Gormally, 2008 : 23.Rf4, la Tour blanche prend position pour la défense de longue durée.",
  },
  {
    themeId: "pm-la-forteresse-defensive",
    fen: "3r3b/7P/4k2K/pp2P3/3P1R2/8/P7/8 w - - 0 25",
    solution: ["f4g4"],
    solutionSan: ["Rg4"],
    rating: 1550,
    sourceRef: "Hawkins – Gormally, 2008 : 25.Rg4, la Tour bascule pour soutenir le pion h7 tout près de promouvoir.",
  },
  {
    themeId: "pm-la-forteresse-defensive",
    fen: "3r2Rb/4k2P/7K/p3P3/1p1P4/8/P7/8 w - - 2 27",
    solution: ["h6g5"],
    solutionSan: ["Kg5"],
    rating: 1570,
    sourceRef: "Hawkins – Gormally, 2008 : 27.Kg5, le Roi blanc vient renforcer le mur défensif.",
  },
  {
    themeId: "pm-la-forteresse-defensive",
    fen: "3r2Rb/4k2P/8/4P3/3PK3/8/1p6/8 w - - 0 31",
    solution: ["g8g1"],
    solutionSan: ["Rg1"],
    rating: 1600,
    sourceRef: "Hawkins – Gormally, 2008 : 31.Rg1, la Tour revient stopper le pion noir tout près de promouvoir à son tour.",
  },
  {
    themeId: "pm-la-forteresse-defensive",
    fen: "2r4b/7P/8/3kP3/3P4/2K5/1p6/1R6 w - - 8 35",
    solution: ["c3b2"],
    solutionSan: ["Kxb2"],
    rating: 1620,
    sourceRef: "Hawkins – Gormally, 2008 : 35.Kxb2, le dernier pion noir dangereux tombe ; la position atteint la nulle théorique Tour+pion contre Tour+Fou.",
  },
  // `pm-la-superiorite-de-l-aile-dame` : 14 exercices (2026-09-11, 3e lot du
  // Palier Or), tirés de la partie RÉELLE Frank Marshall – Jose Raul
  // Capablanca, New York 1909, partie 23 (et dernière) du match (étude
  // Lichess, lichess.org/study/v1uWUyMz/BPoJPmH8). Aucun fichier PILOT
  // n'existait pour ce thème : la partie a été sourcée sur le web puis
  // rejouée et vérifiée coup par coup avec chess.js — les variantes RAV de
  // la source ont été systématiquement écartées, seule la ligne réellement
  // jouée est reprise ici. Même partie que le tutoriel
  // `COURSE_LESSONS["pm-la-superiorite-de-l-aile-dame"]`.
  {
    themeId: "pm-la-superiorite-de-l-aile-dame",
    fen: "r2qk2r/pp2bppp/2n1bn2/2pp4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w kq - 5 9",
    solution: ["c1g5"],
    solutionSan: ["Bg5"],
    rating: 1300,
    sourceRef: "Marshall – Capablanca, New York 1909 (partie 23) : 9.Bg5, la majorité de pions à l'aile Dame de Capablanca, fixée depuis le 4e coup, attend son heure.",
  },
  {
    themeId: "pm-la-superiorite-de-l-aile-dame",
    fen: "r3k2r/pp2qppp/4b3/2ppN3/3nn3/2N3P1/PP2PPBP/R2Q1RK1 w kq - 0 12",
    solution: ["c3e4"],
    solutionSan: ["Nxe4"],
    rating: 1325,
    sourceRef: "Marshall – Capablanca, 1909 : 12.Nxe4, les complications tactiques n'effacent pas la structure de pions posée dès l'ouverture.",
  },
  {
    themeId: "pm-la-superiorite-de-l-aile-dame",
    fen: "r4rk1/pp2qppp/4b3/2p5/8/4PQP1/PP3PBP/R4RK1 w - - 1 16",
    solution: ["f1c1"],
    solutionSan: ["Rfc1"],
    rating: 1350,
    sourceRef: "Marshall – Capablanca, 1909 : 16.Rfc1, développement tranquille avant la mobilisation de la majorité.",
  },
  {
    themeId: "pm-la-superiorite-de-l-aile-dame",
    fen: "1r3rk1/ppq2ppp/4b3/2p5/4Q3/4P1P1/PP3PBP/R1R3K1 w - - 5 18",
    solution: ["c1c3"],
    solutionSan: ["Rc3"],
    rating: 1375,
    sourceRef: "Marshall – Capablanca, 1909 : 18.Rc3, juste avant 18...b5! qui lance la majorité en marche.",
  },
  {
    themeId: "pm-la-superiorite-de-l-aile-dame",
    fen: "1r3rk1/p1q2ppp/4b3/1pp5/4Q3/2R1P1P1/PP3PBP/R5K1 w - - 0 19",
    solution: ["a2a3"],
    solutionSan: ["a3"],
    rating: 1400,
    sourceRef: "Marshall – Capablanca, 1909 : 19.a3, les Blancs tentent de retenir la majorité noire.",
  },
  {
    themeId: "pm-la-superiorite-de-l-aile-dame",
    fen: "3r2k1/p1q2ppp/4b3/1p6/2p1Q3/P1R1P1P1/1P3P1P/3B2K1 w - - 1 23",
    solution: ["d1f3"],
    solutionSan: ["Bf3"],
    rating: 1425,
    sourceRef: "Marshall – Capablanca, 1909 : 23.Bf3, regroupement avant la simplification qui va suivre.",
  },
  {
    themeId: "pm-la-superiorite-de-l-aile-dame",
    fen: "3r2k1/p4p1p/2Q1b1p1/1p2q3/2p5/P1R1PBP1/1P3P1P/6K1 w - - 2 25",
    solution: ["c6e4"],
    solutionSan: ["Qe4"],
    rating: 1450,
    sourceRef: "Marshall – Capablanca, 1909 : 25.Qe4, l'échange des Dames qui va suivre confirme que seule la majorité de pions compte désormais.",
  },
  {
    themeId: "pm-la-superiorite-de-l-aile-dame",
    fen: "6k1/p4p1p/4b1p1/1p6/2p1B3/P1R1P1P1/1P3P1P/3r2K1 w - - 1 27",
    solution: ["g1g2"],
    solutionSan: ["Kg2"],
    rating: 1475,
    sourceRef: "Marshall – Capablanca, 1909 : 27.Kg2, les Blancs n'ont plus de contre-jeu, seule la marche de la majorité noire dicte la partie.",
  },
  {
    themeId: "pm-la-superiorite-de-l-aile-dame",
    fen: "6k1/5p1p/4b1p1/p7/1pp1B3/P3P1P1/1PR2PKP/3r4 w - - 0 29",
    solution: ["a3b4"],
    solutionSan: ["axb4"],
    rating: 1500,
    sourceRef: "Marshall – Capablanca, 1909 : 29.axb4, la majorité devient un pion b passé et soutenu.",
  },
  {
    themeId: "pm-la-superiorite-de-l-aile-dame",
    fen: "6k1/5p1p/4b1p1/8/1pp5/4PBP1/1PR2PKP/1r6 w - - 2 31",
    solution: ["f3e2"],
    solutionSan: ["Be2"],
    rating: 1525,
    sourceRef: "Marshall – Capablanca, 1909 : 31.Be2, juste avant 31...b3! qui relance la marche du pion passé.",
  },
  {
    themeId: "pm-la-superiorite-de-l-aile-dame",
    fen: "6k1/5p1p/4b1p1/8/8/1pp1P1P1/1P1R1PKP/2rB4 w - - 0 34",
    solution: ["b2c3"],
    solutionSan: ["bxc3"],
    rating: 1550,
    sourceRef: "Marshall – Capablanca, 1909 : 34.bxc3, le pion b passé de Capablanca approche de la promotion.",
  },
  {
    themeId: "pm-la-superiorite-de-l-aile-dame",
    fen: "6k1/5p1p/6p1/5b2/8/2P1P1P1/2R2PKP/3r4 w - - 2 37",
    solution: ["c2b2"],
    solutionSan: ["Rb2"],
    rating: 1575,
    sourceRef: "Marshall – Capablanca, 1909 : 37.Rb2, les Blancs sacrifient la qualité pour stopper la promotion du pion.",
  },
  {
    themeId: "pm-la-superiorite-de-l-aile-dame",
    fen: "6k1/5p2/6p1/8/4bPK1/1RP1P3/7r/8 w - - 0 43",
    solution: ["b3b4"],
    solutionSan: ["Rb4"],
    rating: 1600,
    sourceRef: "Marshall – Capablanca, 1909 : 43.Rb4, technique de conversion pure de l'avantage acquis grâce à la majorité initiale.",
  },
  {
    themeId: "pm-la-superiorite-de-l-aile-dame",
    fen: "8/6k1/6p1/5p2/2R1bP1K/2P1r3/8/8 w - - 2 47",
    solution: ["c4c7"],
    solutionSan: ["Rc7+"],
    rating: 1625,
    sourceRef: "Marshall – Capablanca, 1909 : 47.Rc7+, l'un des derniers coups avant l'abandon de Marshall au 49e coup.",
  },
];
