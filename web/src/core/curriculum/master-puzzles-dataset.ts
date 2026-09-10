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
  {
    themeId: "pm-cavalier-contre-fou-qui-domine",
    fen: "r1b2rk1/ppq2ppp/2n1pn2/2p5/2BP4/P1P1PN2/5PPP/R1BQ1RK1 w - - 1 11",
    solution: ["c4d3","e6e5","d1c2"],
    solutionSan: ["Bd3","e5","Qc2"],
    rating: 1481,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "pm-le-pion-isole-de-la-dame",
    fen: "r1bq1rk1/pp3ppp/2n2n2/2bp4/8/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 10",
    solution: ["c1g5","d5d4","c3a4"],
    solutionSan: ["Bg5","d4","Na4"],
    rating: 1333,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "pm-les-pions-pendants",
    fen: "r1bqk2r/pp2bppp/2n1p3/3n4/2BP4/2N2N2/PP3PPP/R1BQK2R w KQkq - 1 9",
    solution: ["e1g1","e8g8","f1e1"],
    solutionSan: ["O-O","O-O","Re1"],
    rating: 1488,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "pm-doubler-les-pions-adverses",
    fen: "rn1q1rk1/pbp2ppp/1p2pn2/3p2B1/2PP4/P1Q2P2/1P2P1PP/R3KBNR w KQ - 0 9",
    solution: ["e2e3","b8d7","f1d3"],
    solutionSan: ["e3","Nbd7","Bd3"],
    rating: 1454,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "pm-le-pion-passe-protege",
    fen: "r1bqkb1r/1p3ppp/p4n2/3Pp1B1/3n4/N1N5/PPP2PPP/R2QKB1R w KQkq - 1 10",
    solution: ["a3c4","c8g4","f1e2"],
    solutionSan: ["Nc4","Bg4","Be2"],
    rating: 1334,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
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
  {
    themeId: "pm-prophylaxie-anticiper-le-plan-adverse",
    fen: "r1bq1rk1/1pp2pbp/2np1np1/p3p3/4P3/2PP1NP1/PP1N1PBP/R1BQ1RK1 w - - 0 9",
    solution: ["a2a4","f8e8","f1e1"],
    solutionSan: ["a4","Re8","Re1"],
    rating: 1372,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "pm-l-avantage-d-espace",
    fen: "r2qkbnr/pp1npppb/2p4p/7P/3P4/5NN1/PPP2PP1/R1BQKB1R w KQkq - 1 9",
    solution: ["f1d3","h7d3","d1d3"],
    solutionSan: ["Bd3","Bxd3","Qxd3"],
    rating: 1349,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "pm-le-complexe-de-cases-faibles",
    fen: "r1bqkb1r/pp1n1pp1/2p1Nn1p/8/3P4/3B1N2/PPP2PPP/R1BQK2R b KQkq - 0 8",
    solution: ["d8e7","e1g1","f7e6"],
    solutionSan: ["Qe7","O-O","fxe6"],
    rating: 1368,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
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
  {
    themeId: "pm-activite-des-pieces-contre-materiel",
    fen: "r1b1k2r/1pqnbppp/p2ppn2/6B1/3NPP2/2N2Q2/PPP3PP/2KR1B1R w kq - 5 10",
    solution: ["g2g4","b7b5","g5f6"],
    solutionSan: ["g4","b5","Bxf6"],
    rating: 1308,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
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
  {
    themeId: "pm-evaluer-un-echange-de-pieces",
    fen: "r1bq1rk1/pp3ppp/2n1pn2/2p5/2pP4/P1PBPN2/5PPP/R1BQ1RK1 w - - 0 10",
    solution: ["d3c4","d8c7","d1e2"],
    solutionSan: ["Bxc4","Qc7","Qe2"],
    rating: 1400,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
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
  {
    themeId: "pm-les-coups-de-rupture",
    fen: "r1bq1rk1/pp2npbp/2pp1np1/3Pp3/2P1P3/2N5/PP1NBPPP/R1BQ1RK1 w - - 0 10",
    solution: ["f2f3","c6d5","c4d5"],
    solutionSan: ["f3","cxd5","cxd5"],
    rating: 1349,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "pm-la-restriction-des-pieces-adverses",
    fen: "rn2k2r/1pq1bppp/p2pbn2/4p3/4PP2/1NN5/PPP1B1PP/R1BQ1RK1 w kq - 1 10",
    solution: ["f4f5","e6b3","a2b3"],
    solutionSan: ["f5","Bxb3","axb3"],
    rating: 1345,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "pm-la-surprotection-nimzowitsch",
    fen: "r1bqkb1r/pp1n1ppp/4pn2/8/3p4/3B1NN1/PPP2PPP/R1BQ1RK1 w kq - 0 9",
    solution: ["f3d4","f8c5","c2c3"],
    solutionSan: ["Nxd4","Bc5","c3"],
    rating: 1477,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "pm-le-blocus-du-pion-passe",
    fen: "rn2kb1r/pp3ppp/2p2qb1/3p4/3P4/2N1PQ2/PP3PPP/R3KBNR w KQkq - 0 9",
    solution: ["f3d5","f6d4"],
    solutionSan: ["Qxd5","Qxd4"],
    rating: 1402,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
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
  {
    themeId: "pm-transformer-un-avantage",
    fen: "r1b2rk1/1pppqppp/p1nb1n2/1B6/3P4/1P3N2/PBP2PPP/RN1Q1RK1 w - - 0 9",
    solution: ["b5c6","d7c6","c2c4"],
    solutionSan: ["Bxc6","dxc6","c4"],
    rating: 1321,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "pm-la-technique-de-simplification",
    fen: "rnb2rk1/ppp1qpp1/4p2p/3P4/3Pn3/2N1PN2/PP3PPP/R2QKB1R b KQ - 0 9",
    solution: ["e4c3","b2c3","e6d5"],
    solutionSan: ["Nxc3","bxc3","exd5"],
    rating: 1406,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "pm-le-complexe-de-cases-de-couleur",
    fen: "rnbqk2r/ppp2pbp/4p3/8/2P5/8/PP1B1PPP/R2QKBNR w KQkq - 0 8",
    solution: ["g1f3","e8g8","f1d3"],
    solutionSan: ["Nf3","O-O","Bd3"],
    rating: 1433,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "pm-la-forteresse-defensive",
    fen: "r2qkb1r/pp1bpppp/1nnp4/1B2P3/3P4/5N2/PP3PPP/RNBQK2R w KQkq - 4 9",
    solution: ["e5d6","e7d6","e1g1"],
    solutionSan: ["exd6","exd6","O-O"],
    rating: 1402,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "pm-le-fou-contre-trois-pions",
    fen: "r2q1rk1/1bp1bppp/p1np1n2/1p2p3/4P3/1BP2N1P/PP1P1PP1/RNBQR1K1 w - - 1 10",
    solution: ["d2d4","f8e8","b1d2"],
    solutionSan: ["d4","Re8","Nbd2"],
    rating: 1498,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "pm-la-superiorite-de-l-aile-dame",
    fen: "r3kbnr/1pp3pp/p4p2/2p5/4P1b1/1N6/PPP2PPP/RNBR2K1 w kq - 1 10",
    solution: ["f2f3","g4e6","b1c3"],
    solutionSan: ["f3","Be6","Nc3"],
    rating: 1348,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-1-structures-de-pions-symetriques",
    fen: "r2qkb1r/pb1n1ppp/2p1pn2/1p6/3P4/2NBPN2/PP3PPP/R1BQK2R w KQkq - 2 9",
    solution: ["e1g1","a7a6","e3e4"],
    solutionSan: ["O-O","a6","e4"],
    rating: 1760,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-2-jouer-contre-l-isolani",
    fen: "rnbqk2r/pp3ppp/4p3/8/1b1PP3/5N2/P4PPP/R1BQKB1R w KQkq - 1 9",
    solution: ["c1d2","b4d2","d1d2"],
    solutionSan: ["Bd2","Bxd2+","Qxd2"],
    rating: 1601,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-3-la-structure-carlsbad",
    fen: "r1bq1rk1/pp1nbppp/2p1p3/3n2B1/2BP4/2N1PN2/PP3PPP/2RQK2R w K - 1 10",
    solution: ["g5e7","d8e7","e1g1"],
    solutionSan: ["Bxe7","Qxe7","O-O"],
    rating: 1760,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-4-la-structure-maroczy",
    fen: "r2q1rk1/pp2ppbp/2npbnp1/8/4P3/1NN1B3/PPP1BPPP/R2Q1RK1 w - - 6 10",
    solution: ["f2f4","c6a5","b3a5"],
    solutionSan: ["f4","Na5","Nxa5"],
    rating: 1754,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-5-le-herisson-hedgehog",
    fen: "rn1qk2r/pb2bppp/1p1ppn2/8/2PQ4/2N2NP1/PP2PPBP/R1B2RK1 w kq - 0 9",
    solution: ["f1d1","a7a6","b2b3"],
    solutionSan: ["Rd1","a6","b3"],
    rating: 1699,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-6-la-chaine-de-pions-en-francais",
    fen: "r1b1kb1r/pp3ppp/1qn1p3/3pPn2/3P4/2N2N2/PP2BPPP/R1BQK2R w KQkq - 3 9",
    solution: ["c3a4","b6a5","c1d2"],
    solutionSan: ["Na4","Qa5+","Bd2"],
    rating: 1689,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-7-structures-a-pions-doubles",
    fen: "rn1q1rk1/pbp2ppp/1p1ppn2/8/2P5/P1Q2NP1/1P1PPPBP/R1B1K2R w KQ - 0 9",
    solution: ["e1g1","b8d7","d2d4"],
    solutionSan: ["O-O","Nbd7","d4"],
    rating: 1703,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-8-le-roque-oppose-et-l-attaque-de-pions",
    fen: "r1bq1rk1/pp2ppbp/2n3p1/2p5/2BPP3/2P1B3/P3NPPP/R2QK2R w KQ - 4 10",
    solution: ["d1d2","d8a5","a1c1"],
    solutionSan: ["Qd2","Qa5","Rc1"],
    rating: 1637,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-9-la-minorite-d-attaque",
    fen: "r1bqkb1r/3n1ppp/p3pn2/1pp5/3PP3/2NB1N2/PP3PPP/R1BQK2R w KQkq - 0 10",
    solution: ["e4e5","c5d4","e5f6"],
    solutionSan: ["e5","cxd4","exf6"],
    rating: 1634,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-10-le-sacrifice-positionnel-de-qualite",
    fen: "rn1q1rk1/1p2bppp/p2pbn2/4p3/2P1P3/1NN1BP2/PP4PP/R2QKB1R w KQ - 6 10",
    solution: ["d1d2","b8d7","a1d1"],
    solutionSan: ["Qd2","Nbd7","Rd1"],
    rating: 1732,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-11-les-finales-de-tours-pratiques",
    fen: "rnbqkb1r/5ppp/p3pn2/1p6/3p4/1B2PN2/PP2QPPP/RNB2RK1 w kq - 0 9",
    solution: ["f1d1","c8b7","e3d4"],
    solutionSan: ["Rd1","Bb7","exd4"],
    rating: 1711,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-12-les-finales-de-fous-de-couleurs-opposees",
    fen: "r1bqk2r/ppp2ppp/2n5/3n4/2BP4/5N2/PP1N1PPP/R2QK2R w KQkq - 0 10",
    solution: ["e1g1","e8g8","f1e1"],
    solutionSan: ["O-O","O-O","Re1"],
    rating: 1797,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-13-transition-milieu-de-partie-vers-finale",
    fen: "r1bqkb1r/pp2pp1p/2n3p1/8/1nBpP3/2N2N2/PP3PPP/R1BQ1RK1 w kq - 0 9",
    solution: ["a2a3","b4d3","d1b3"],
    solutionSan: ["a3","Nd3","Qb3"],
    rating: 1781,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-14-l-art-de-la-conversion",
    fen: "r1bqk2r/1p2bppp/p1nppn2/8/2P1P3/N1N5/PP3PPP/R1BQKB1R w KQkq - 2 9",
    solution: ["f1e2","e8g8","e1g1"],
    solutionSan: ["Be2","O-O","O-O"],
    rating: 1661,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-15-fou-contre-cavalier-mode-d-emploi",
    fen: "r1bqk2r/ppn1bppp/2n5/2p1p3/8/2NP1NP1/PP2PPBP/R1BQ1RK1 w kq - 1 9",
    solution: ["a2a3","e8g8","a1b1"],
    solutionSan: ["a3","O-O","Rb1"],
    rating: 1767,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-16-construire-un-plan-a-long-terme",
    fen: "r1bq1rk1/ppp1bppp/1nn5/4p3/8/2NP1NP1/PP2PPBP/R1BQ1RK1 w - - 1 9",
    solution: ["a2a3","c8e6","b2b4"],
    solutionSan: ["a3","Be6","b4"],
    rating: 1709,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-17-calcul-et-intuition-positionnelle",
    fen: "rnbq1rk1/ppp2pbp/1n1pp1p1/4P1N1/3P4/1B3Q2/PPP2PPP/RNB1K2R w KQ - 2 9",
    solution: ["g5e4","d6e5","d4e5"],
    solutionSan: ["Ne4","dxe5","dxe5"],
    rating: 1685,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-18-evaluation-dynamique-contre-statique",
    fen: "rnbq1rk1/pp4bp/2pp1np1/3Ppp2/2P5/2N3PN/PP2PPBP/R1BQ1RK1 w - e6 0 9",
    solution: ["d5e6","c8e6","b2b3"],
    solutionSan: ["dxe6","Bxe6","b3"],
    rating: 1767,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-19-les-cases-de-couleur-au-milieu-de-partie",
    fen: "rnb1k1r1/ppq1npQp/4p3/2ppP3/3P4/P1P5/2P2PPP/R1B1KBNR w KQq - 1 9",
    solution: ["g7h7","c5d4","g1e2"],
    solutionSan: ["Qxh7","cxd4","Ne2"],
    rating: 1742,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
  {
    themeId: "jh-module-20-le-roi-actif-en-finale",
    fen: "r1bqk2r/ppp1bppp/8/3p4/1nPPn3/3B1N2/PP3PPP/RNBQ1RK1 w kq - 1 9",
    solution: ["d3e2","e8g8","b1c3"],
    solutionSan: ["Be2","O-O","Nc3"],
    rating: 1605,
    sourceRef: "Ligne théorique réelle, rejouée depuis la position de départ — la suite proposée illustre le thème annoncé.",
  },
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
];
