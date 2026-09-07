/**
 * Démonstrations de maître curatées à la main — l'échiquier explicatif animé
 * en tête de `ThemeLesson` (cahier des charges du 2026-09-03, puis du
 * 2026-09-06 pour la version INTERACTIVE : « le joueur ne lit pas juste du
 * texte, le cours lui demande de jouer 2 ou 3 coups d'illustration
 * directement sur l'échiquier de démo »).
 *
 * Contrairement à `MotifIntro` (`motif-intro.ts`, dérivé automatiquement du
 * premier puzzle importé du thème — un seul coup, jamais interactif), une
 * `ThemeDemo` est un petit PARCOURS GUIDÉ à plusieurs étapes :
 *  - une étape SANS `expectedMove` est purement explicative (flèches +
 *    légende), le joueur avance avec un bouton « Suivant » ;
 *  - une étape AVEC `expectedMove` exige que le joueur DÉPLACE lui-même la
 *    pièce indiquée par la flèche verte — `ThemeDemoBoard`
 *    (`client/features/learn/theme-demo-board.tsx`) ne fait avancer le
 *    parcours QUE si le coup joué correspond exactement, jamais en cliquant
 *    simplement sur un bouton.
 *
 * Chaque étape porte sa PROPRE position déjà résolue (`fen` = la position une
 * fois `expectedMove` de l'étape PRÉCÉDENTE joué, réponse(s) adverse(s)
 * comprise(s) quand il y en a) — jamais recalculée en direct : ce module reste
 * pur, sans dépendance à chess.js, exactement comme `motif-intro.ts`. Positions
 * RÉELLES, jamais inventées, vérifiées coup par coup avec chess.js avant
 * rédaction (voir `theme-demo.test.ts`) :
 *  - « L'avant-poste du cavalier » et « La case faible dans le camp adverse »
 *    viennent des deux parties annotées de l'étude Lichess hors-ligne « Weak
 *    Squares and Outposts »
 *    (`data/import/academy/lichess_study_weak-squares-and-outposts-study_*.pgn`,
 *    mêmes positions que `positional-studies-curated.json`) ;
 *  - Carlsbad/Maroczy (cursus Jesper Hall) sont des mises en place théoriques
 *    réelles (mêmes coups que `positional-studies-curated.json`).
 *  - Les 9 thèmes `pawn_structures` viennent chacun d'une VRAIE partie de
 *    maître citée en exemple par le chapitre Lichess correspondant
 *    (`data/import/academy/lichess_study_structures-de-pions_*.pgn`, étude
 *    https://lichess.org/study/srjMsNnC de Li-Pokamp) — la position et le
 *    coup rejoués sont ceux effectivement joués dans cette partie, jamais une
 *    reconstitution, vérifiés coup par coup avec chess.js avant rédaction.
 *
 * Flèches ROUGES = menace/case faible adverse, flèches VERTES = manœuvre ou
 * coup recommandé (y compris le coup que l'étape attend, le cas échéant) —
 * jamais les deux confondues sur une même flèche.
 */

export interface ThemeDemoArrow {
  from: string;
  to: string;
  kind: "threat" | "solution";
}

export interface ThemeDemoStep {
  /** Position affichée PENDANT cette étape. */
  fen: string;
  /** Légende du Coach pour cette étape — toujours affichée, coup requis ou non. */
  caption: string;
  arrows: readonly ThemeDemoArrow[];
  /**
   * Coup que le joueur doit jouer pour valider l'étape et avancer —
   * `undefined` pour une étape purement explicative (bouton « Suivant »).
   * `promotion` seulement pour les rares démonstrations qui en ont besoin.
   */
  expectedMove?: { from: string; to: string; promotion?: string };
}

export interface ThemeDemo {
  steps: readonly [ThemeDemoStep, ...ThemeDemoStep[]];
}

/** Clé = `CurriculumThemeOverview.id` (`catalog.ts`). Un thème sans entrée ici retombe sur `MotifIntroBoard` (voir `ThemeLesson`). */
export const THEME_DEMOS: Record<string, ThemeDemo> = {
  "pm-l-avant-poste-du-cavalier": {
    steps: [
      {
        fen: "r2r3k/4q2p/p1n1np2/1p2p1pP/2p1P1Q1/2P1B1P1/PPB2PK1/R3R3 b - - 1 27",
        caption:
          "🔴 Les pions blancs c3 et e4 ne pourront plus JAMAIS chasser une pièce noire de d3 — et ton pion c4 la protège déjà. 🟢 Dévie d'abord le Roi blanc : joue Nf4+.",
        arrows: [
          { from: "c3", to: "d3", kind: "threat" },
          { from: "e4", to: "d3", kind: "threat" },
          { from: "c4", to: "d3", kind: "solution" },
          { from: "e6", to: "f4", kind: "solution" },
        ],
        expectedMove: { from: "e6", to: "f4" },
      },
      {
        fen: "r2r3k/4q2p/p1n2p2/1p2p1pP/2p1PnQ1/2P1B1P1/PPB2P1K/R3R3 b - - 3 28",
        caption: "🟢 Le Roi a été dévié en h2 — fonce sur la case forte : joue Nd3.",
        arrows: [{ from: "f4", to: "d3", kind: "solution" }],
        expectedMove: { from: "f4", to: "d3" },
      },
      {
        fen: "r2r3k/4q2p/p1n2p2/1p2p1pP/2p1P1Q1/2PnB1P1/PPB2P1K/R3R3 w - - 4 29",
        caption: "✅ Le Cavalier noir est indéboulonnable en d3 — il paralyse durablement tout le jeu blanc.",
        arrows: [],
      },
    ],
  },
  "pm-la-case-faible-dans-le-camp-adverse": {
    steps: [
      {
        fen: "3r1r1k/1p1nb1p1/p1p1p1qp/Pn2P1p1/1PNPN3/1R3P1P/4QBP1/3R3K w - - 9 32",
        caption:
          "🔴 d6 est un trou définitif dans le camp noir : ses pions c6 et e6 ne pourront plus jamais la garder. 🟢 Commence par échanger le cavalier qui pourrait encore la contester : joue Nc5.",
        arrows: [
          { from: "c6", to: "d6", kind: "threat" },
          { from: "e6", to: "d6", kind: "threat" },
          { from: "e4", to: "c5", kind: "solution" },
        ],
        expectedMove: { from: "e4", to: "c5" },
      },
      {
        fen: "5r1k/1p2b1p1/p1p1p1qp/PnPrP1p1/2NP4/1R3P1P/4QBP1/3R3K w - - 1 34",
        caption: "🟢 Après Nxc5, bxc5 et ...Rd5, la voie est libre : plonge sur la case faible avec Nd6.",
        arrows: [{ from: "c4", to: "d6", kind: "solution" }],
        expectedMove: { from: "c4", to: "d6" },
      },
      {
        fen: "5r1k/1p2b1p1/p1pNp1qp/PnPrP1p1/3P4/1R3P1P/4QBP1/3R3K b - - 2 34",
        caption: "✅ Nd6 : le Cavalier blanc s'installe sur la case faible, hors de portée de tout pion noir — la position noire est paralysée.",
        arrows: [],
      },
    ],
  },
  "jh-module-4-la-structure-maroczy": {
    steps: [
      {
        fen: "r1bqkbnr/pp1ppp1p/2n3p1/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 0 5",
        caption:
          "🔴 Noir rêve des ruptures ...d5 et ...b5 pour respirer — un seul coup de pion blanc les interdit à jamais. 🟢 Trouve-le.",
        arrows: [
          { from: "d7", to: "d5", kind: "threat" },
          { from: "b7", to: "b5", kind: "threat" },
          { from: "c2", to: "c4", kind: "solution" },
        ],
        expectedMove: { from: "c2", to: "c4" },
      },
      {
        fen: "r1bqkbnr/pp1ppp1p/2n3p1/8/2PNP3/8/PP3PPP/RNBQKB1R b KQkq - 0 5",
        caption:
          "✅ c4 referme l'étau Maroczy : ...d5 est désormais contrôlé par ce pion, ...b5 ne sert plus à rien — Noir devra manœuvrer une pièce pour respirer.",
        arrows: [],
      },
    ],
  },
  "jh-module-3-la-structure-carlsbad": {
    steps: [
      {
        fen: "rnbqk2r/ppp1bppp/5n2/3p2B1/3P4/2N1P3/PP3PPP/R2QKBNR b KQkq - 0 6",
        caption:
          "Le squelette Carlsbad se dessine : pions blancs c/d contre pions noirs d, colonne e encore fermée. 🔴 Sans ...c6, Blanc peut encore ouvrir le centre à son profit. 🟢 Verrouille la structure : joue ...c6.",
        arrows: [{ from: "c7", to: "c6", kind: "solution" }],
        expectedMove: { from: "c7", to: "c6" },
      },
      {
        fen: "rnbqk2r/pp2bppp/2p2n2/3p2B1/3P4/2N1P3/PP3PPP/R2QKBNR w KQkq - 0 7",
        caption: "🟢 Structure verrouillée. Le plan blanc peut commencer : b4 puis b5, l'attaque de minorité, va fissurer l'aile dame noire.",
        arrows: [
          { from: "b2", to: "b4", kind: "solution" },
          { from: "b4", to: "b5", kind: "solution" },
        ],
        expectedMove: { from: "b2", to: "b4" },
      },
      {
        fen: "rnbqk2r/pp2bppp/2p2n2/3p2B1/1P1P4/2N1P3/P4PPP/R2QKBNR b KQkq - 0 7",
        caption: "✅ b4 lance l'attaque de minorité — b5 suivra pour infliger une faiblesse permanente sur c6 ou b7.",
        arrows: [],
      },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────
  // Les 9 thèmes `pawn_structures` (étude Lichess de Li-Pokamp) — chaque
  // FEN et chaque coup viennent d'une vraie partie citée par le chapitre
  // correspondant, voir le docstring de fichier.
  // ─────────────────────────────────────────────────────────────────────
  "ps-formation-caro-kann": {
    steps: [
      {
        fen: "r1bqr1k1/pp2bppp/2p1pn2/8/2PPNB2/6P1/PP3PBP/R2Q1RK1 w - - 3 13",
        caption:
          "🔴 Sans intervention, Noir jouera un jour ...c6-c5 pour respirer. 🟢 Empêche cette rupture pour toujours : joue c4-c5.",
        arrows: [
          { from: "c6", to: "c5", kind: "threat" },
          { from: "c4", to: "c5", kind: "solution" },
        ],
        expectedMove: { from: "c4", to: "c5" },
      },
      {
        fen: "r1bqr1k1/pp2bppp/2p1pn2/2P5/3PNB2/6P1/PP3PBP/R2Q1RK1 b - - 0 13",
        caption:
          "✅ c4-c5 interdit à jamais ...c6-c5 et fige la structure à l'avantage blanc — exactement le plan qui verrouille les cases avancées de cette formation.",
        arrows: [],
      },
    ],
  },
  "ps-la-structure-grunfeld": {
    steps: [
      {
        fen: "r2q1rk1/p3ppbp/1pn3p1/8/3PP3/5N2/P3QPPP/1RB2RK1 w - - 1 15",
        caption: "🟢 Le centre blanc peut avancer avec tempo — joue d4-d5 pour gagner de l'espace et te rapprocher d'un pion passé central.",
        arrows: [{ from: "d4", to: "d5", kind: "solution" }],
        expectedMove: { from: "d4", to: "d5" },
      },
      {
        fen: "r2q1rk1/p3ppbp/1pn3p1/3P4/4P3/5N2/P3QPPP/1RB2RK1 b - - 0 15",
        caption: "✅ d4-d5 gagne de l'espace et prépare la marche du pion vers la promotion — le plan directeur des Blancs dans cette structure.",
        arrows: [],
      },
    ],
  },
  "ps-la-structure-stonewall": {
    steps: [
      {
        fen: "r1b2rk1/pp1nq1pp/2pbp3/3p1p2/2PPn3/1P1BPN2/PB2NPPP/R2Q1RK1 w - - 7 11",
        caption: "🟢 La case e5 n'est gardée par aucun pion noir — installe-toi dessus : joue Ne5.",
        arrows: [{ from: "f3", to: "e5", kind: "solution" }],
        expectedMove: { from: "f3", to: "e5" },
      },
      {
        fen: "r1b2rk1/pp1nq1pp/2pbp3/3pNp2/2PPn3/1P1BP3/PB2NPPP/R2Q1RK1 b - - 8 11",
        caption:
          "✅ Ne5 prend le contrôle de la case clé de la structure Stonewall — même après un échange, c'est un pion blanc qui gardera ensuite ce contrôle.",
        arrows: [],
      },
    ],
  },
  "ps-formation-benoni-asymetrique": {
    steps: [
      {
        fen: "1rb1rbk1/1pqn1p1p/p2p2p1/P1pP4/2N1PP2/2N5/1PQ1B1PP/4RRK1 w - - 1 19",
        caption: "🟢 Ouvre le jeu à l'aile roi avant que Noir ne stabilise sa majorité dame — joue e4-e5.",
        arrows: [{ from: "e4", to: "e5", kind: "solution" }],
        expectedMove: { from: "e4", to: "e5" },
      },
      {
        fen: "1rb1rbk1/1pqn1p1p/p2p2p1/P1pPP3/2N2P2/2N5/1PQ1B1PP/4RRK1 b - - 0 19",
        caption: "✅ e4-e5 lance l'attaque à l'aile roi et prépare un pion passé — le plan directeur des Blancs dans cette formation Bénoni asymétrique.",
        arrows: [],
      },
    ],
  },
  "ps-formation-benoni-symetrique": {
    steps: [
      {
        fen: "r2qnrk1/pp4bp/3p2p1/2pPnp2/2P5/2N4P/PP1BBPP1/R2Q1RK1 w - - 0 15",
        caption: "🟢 L'aile roi est le seul endroit où les Blancs ont du jeu dans cette structure fermée — commence l'expansion : joue f2-f4.",
        arrows: [{ from: "f2", to: "f4", kind: "solution" }],
        expectedMove: { from: "f2", to: "f4" },
      },
      {
        fen: "r2qnrk1/pp4bp/3p2p1/2pPnp2/2P2P2/2N4P/PP1BB1P1/R2Q1RK1 b - - 0 15",
        caption:
          "✅ f2-f4 lance l'expansion à l'aile roi ; g2-g4 suivra pour ouvrir des lignes contre le roi noir — le plan blanc de cette formation Bénoni symétrique.",
        arrows: [],
      },
    ],
  },
  "ps-structure-est-indienne-type-i": {
    steps: [
      {
        fen: "r1bq1r2/5pbk/pn1p1npp/1p1Pp3/4P3/2N1BP2/PP1QB1PP/R1N2RK1 w - - 4 15",
        caption: "🟢 Prépare l'expansion à l'aile dame — joue b2-b4, avant a2-a4-a5 qui gagnera encore plus d'espace.",
        arrows: [{ from: "b2", to: "b4", kind: "solution" }],
        expectedMove: { from: "b2", to: "b4" },
      },
      {
        fen: "r1bq1r2/5pbk/pn1p1npp/1p1Pp3/1P2P3/2N1BP2/P2QB1PP/R1N2RK1 b - - 0 15",
        caption: "✅ b2-b4 puis a2-a4-a5 restreignent durablement le jeu noir à l'aile dame — le plan blanc de cette structure Est-indienne.",
        arrows: [],
      },
    ],
  },
  "ps-structure-est-indienne-type-iii": {
    steps: [
      {
        fen: "r2q1rk1/ppp3b1/3p1nnp/3Pp1p1/1PP1Pp2/2N2P2/P2N1BPP/R2QR1K1 w - - 1 17",
        caption: "🔴 Sans intervention, Noir garde son aile dame fermée. 🟢 Ouvre la colonne c pour y pénétrer : joue c4-c5.",
        arrows: [{ from: "c4", to: "c5", kind: "solution" }],
        expectedMove: { from: "c4", to: "c5" },
      },
      {
        fen: "r2q1rk1/ppp3b1/3p1nnp/2PPp1p1/1P2Pp2/2N2P2/P2N1BPP/R2QR1K1 b - - 0 17",
        caption:
          "✅ c4-c5 attaque la base d6 et prépare l'invasion de la colonne c — le plan blanc pendant que Noir attaque à l'opposé, à l'aile roi.",
        arrows: [],
      },
    ],
  },
  "ps-structure-est-indienne-ouverte": {
    steps: [
      {
        fen: "r1b2rk1/1p3pbp/n1pp2p1/p1n5/PqPNPP2/2N1B2P/1P1Q2P1/1B1R1RK1 w - - 1 16",
        caption: "🟢 L'espace à l'aile roi t'appartient — pousse la rupture : joue f4-f5.",
        arrows: [{ from: "f4", to: "f5", kind: "solution" }],
        expectedMove: { from: "f4", to: "f5" },
      },
      {
        fen: "r1b2rk1/1p3pbp/n1pp2p1/p1n2P2/PqPNP3/2N1B2P/1P1Q2P1/1B1R1RK1 b - - 0 16",
        caption:
          "✅ f4-f5 gagne encore de l'espace et prépare f5-f6, fissurant l'abri du roi noir — le plan directeur des Blancs dans l'Est-indienne ouverte.",
        arrows: [],
      },
    ],
  },
  "ps-structure-francaise-type-i": {
    steps: [
      {
        fen: "r1bqr1k1/p5bp/1pn1pnp1/2pp4/3P4/2P2NPP/PP1N1PB1/R1BQR1K1 w - - 0 14",
        caption: "🟢 e5 n'est défendue par aucun pion noir — installe-toi dessus avant que Noir ne puisse t'en déloger : joue Ne5.",
        arrows: [{ from: "f3", to: "e5", kind: "solution" }],
        expectedMove: { from: "f3", to: "e5" },
      },
      {
        fen: "r1bqr1k1/p5bp/1pn1pnp1/2ppN3/3P4/2P3PP/PP1N1PB1/R1BQR1K1 b - - 1 14",
        caption:
          "✅ Ne5 prend le contrôle de la case clé de la structure — les tours doublées sur la colonne e viendront ensuite presser le pion arriéré e6.",
        arrows: [],
      },
    ],
  },
};
