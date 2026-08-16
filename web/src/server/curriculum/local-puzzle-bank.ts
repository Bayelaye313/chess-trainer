/**
 * Données pures de `populate-puzzles.ts` : la banque locale de positions
 * (`LOCAL_PUZZLE_BANK`, `FALLBACK_PUZZLE_BANK`) et la fonction qui en tire une
 * déclinaison pour un `index` donné (`resolveLocalPuzzle`). Séparé du script
 * pour rester testable sans toucher à `@/server/db` (aucun `import
 * "server-only"` ici) — voir `local-puzzle-bank.test.ts`.
 *
 * Historique (voir aussi le docstring de `populate-puzzles.ts`) : quand une
 * banque n'a qu'une seule position pour un tag, boucler dessus avec un simple
 * `index % bank.length` recycle littéralement la même FEN à chaque tour —
 * l'utilisateur voit le même puzzle partout dans le thème. `resolveLocalPuzzle`
 * fait d'abord défiler toutes les positions distinctes de la banque, puis les
 * 4 variantes géométriques (`geometric-variants.ts`) de chacune, avant de
 * répéter une combinaison déjà servie.
 */
import { applyGeometricVariant, GEOMETRIC_VARIANTS } from "@/core/chess/geometric-variants";

/**
 * Une position de la banque locale : déjà réglée sur la position où le
 * solveur doit trouver le premier coup (même convention que le reste de
 * l'appli — `puzzles.solution`, `PuzzleBoard`) ; `moves` liste la suite
 * complète en UCI, coups adverses inclus aux rangs impairs. `baseRating` est
 * l'Elo affiché pour la toute première déclinaison de cette position — les
 * suivantes (voir `resolveLocalPuzzle`) varient légèrement autour pour ne pas
 * afficher exactement le même nombre partout.
 *
 * Chaque position a été composée puis vérifiée coup par coup avec
 * `chess.js` (position de départ légale, chaque coup légal dans
 * l'enchaînement, mat effectif quand le nom du motif l'exige) — pas
 * recopiée d'une partie réelle, mais tout aussi jouable.
 */
export interface LocalPuzzleSeed {
  fen: string;
  moves: string[];
  baseRating: number;
}

/**
 * Banque locale : une ou plusieurs positions par tag, couvrant les 27 tags
 * distincts de `THEME_TAG_MAP` (`populate-puzzles.ts`).
 */
export const LOCAL_PUZZLE_BANK: Record<string, LocalPuzzleSeed[]> = {
  // --- Checkmate Patterns ---
  backRankMate: [
    { fen: "6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1", moves: ["e1e8"], baseRating: 700 },
    { fen: "r5k1/8/8/8/8/8/5PPP/6K1 b - - 0 1", moves: ["a8a1"], baseRating: 750 },
  ],
  anastasiaMate: [
    { fen: "7k/6p1/5N2/8/8/8/R7/K7 w - - 0 1", moves: ["a2h2"], baseRating: 1300 },
    { fen: "7k/6p1/5N2/8/8/R7/8/K7 w - - 0 1", moves: ["a3h3"], baseRating: 1320 },
    { fen: "7k/6p1/5N2/8/R7/8/8/K7 w - - 0 1", moves: ["a4h4"], baseRating: 1340 },
  ],
  arabianMate: [
    { fen: "7k/R7/5N2/8/8/8/8/K7 w - - 0 1", moves: ["a7h7"], baseRating: 1400 },
    { fen: "R6k/8/5N2/8/8/8/8/K7 w - - 0 1", moves: ["a8g8"], baseRating: 1420 },
    { fen: "7k/1R6/5N2/8/8/8/8/K7 w - - 0 1", moves: ["b7h7"], baseRating: 1440 },
  ],
  bodenMate: [{ fen: "1bk5/3n4/8/B7/8/8/8/K4B2 w - - 0 1", moves: ["f1a6"], baseRating: 1500 }],
  smotheredMate: [
    { fen: "6rk/6pp/3N4/8/8/8/8/K7 w - - 0 1", moves: ["d6f7"], baseRating: 1400 },
    { fen: "3N2rk/6pp/8/8/8/8/8/K7 w - - 0 1", moves: ["d8f7"], baseRating: 1420 },
    { fen: "6rk/6pp/8/4N3/8/8/8/K7 w - - 0 1", moves: ["e5f7"], baseRating: 1440 },
  ],
  hookMate: [
    { fen: "k7/pRP5/1N6/8/8/8/8/7K w - - 0 1", moves: ["b7b8"], baseRating: 1500 },
    { fen: "k1R5/p1P5/1N6/8/8/8/8/7K w - - 0 1", moves: ["c8b8"], baseRating: 1520 },
    { fen: "k2R4/p1P5/1N6/8/8/8/8/7K w - - 0 1", moves: ["d8b8"], baseRating: 1540 },
  ],
  vukovicMate: [
    { fen: "4k3/8/3NK3/8/8/8/8/R7 w - - 0 1", moves: ["a1a8"], baseRating: 1300 },
    { fen: "4k3/8/3NK3/8/8/8/R7/8 w - - 0 1", moves: ["a2a8"], baseRating: 1320 },
    { fen: "4k3/8/3NK3/8/8/R7/8/8 w - - 0 1", moves: ["a3a8"], baseRating: 1340 },
    { fen: "4k3/8/3NK3/8/R7/8/8/8 w - - 0 1", moves: ["a4a8"], baseRating: 1360 },
    { fen: "4k3/8/3NK3/R7/8/8/8/8 w - - 0 1", moves: ["a5a8"], baseRating: 1380 },
  ],
  dovetailMate: [{ fen: "3nkn2/8/2N5/8/8/8/8/K3Q3 w - - 0 1", moves: ["e1e7"], baseRating: 1200 }],
  doubleBishopMate: [{ fen: "7k/7p/8/8/8/8/BB6/K7 w - - 0 1", moves: ["a2b3"], baseRating: 1400 }],

  // --- Tactical Motifs ---
  fork: [{ fen: "r3k3/8/8/1N6/8/8/8/7K w - - 0 1", moves: ["b5c7"], baseRating: 900 }],
  pin: [{ fen: "3k4/3n4/8/8/8/8/8/3RK3 w - - 0 1", moves: ["d1d7"], baseRating: 900 }],
  skewer: [{ fen: "4q3/8/8/8/4k3/8/8/R6K w - - 0 1", moves: ["a1e1"], baseRating: 1000 }],
  discoveredAttack: [{ fen: "4k3/8/2n5/4N3/8/8/8/4R2K w - - 0 1", moves: ["e5c6"], baseRating: 1300 }],
  doubleCheck: [{ fen: "8/7k/8/8/4N3/8/8/1B5K w - - 0 1", moves: ["e4f6"], baseRating: 1600 }],
  deflection: [
    { fen: "6k1/8/3q4/8/8/b1N5/8/R6K w - - 0 1", moves: ["c3b5", "d6d8", "a1a3"], baseRating: 1500 },
  ],
  attraction: [{ fen: "6k1/7p/8/8/8/8/7Q/7K w - - 0 1", moves: ["h2h7", "g8h7"], baseRating: 1400 }],
  interference: [
    { fen: "6k1/8/1r6/8/8/8/1bN5/4Q1K1 w - - 0 1", moves: ["c2b4", "b6b4", "e1b4"], baseRating: 1900 },
  ],
  overloading: [
    { fen: "b2r2k1/8/8/8/3n4/8/7K/R2R4 w - - 0 1", moves: ["d1d4", "d8d4", "a1a8"], baseRating: 1600 },
  ],
  intermezzo: [
    { fen: "6k1/7p/6B1/3b4/8/8/8/K2Q4 w - - 0 1", moves: ["g6h7", "g8h7", "d1d5"], baseRating: 1700 },
  ],
  xRayAttack: [
    { fen: "3q2k1/8/8/3r4/8/8/3R4/3R3K w - - 0 1", moves: ["d2d5", "d8d5", "d1d5"], baseRating: 1500 },
  ],
  capturingDefender: [
    { fen: "6k1/8/2n5/4b3/4B3/8/8/4Q2K w - - 0 1", moves: ["e4c6", "g8h8", "e1e5"], baseRating: 1300 },
  ],
  clearance: [
    { fen: "6k1/7p/8/3p4/4P3/8/2B5/7K w - - 0 1", moves: ["e4d5", "g8f8", "c2h7"], baseRating: 1600 },
  ],
  trappedPiece: [{ fen: "6k1/8/8/8/8/6P1/7b/5K1R w - - 0 1", moves: ["h1h2"], baseRating: 1100 }],
  zugzwang: [{ fen: "7k/8/5K2/8/8/8/8/R7 w - - 0 1", moves: ["a1g1"], baseRating: 1800 }],
  underPromotion: [{ fen: "1r6/2Pk4/q7/8/8/8/8/7K w - - 0 1", moves: ["c7b8n"], baseRating: 1700 }],
  enPassant: [{ fen: "6k1/8/8/3pP3/8/8/8/6K1 w - d6 0 1", moves: ["e5d6"], baseRating: 1000 }],
  sacrifice: [
    { fen: "5r1k/6pp/7N/8/8/8/Q7/K7 w - - 0 1", moves: ["a2g8", "f8g8", "h6f7"], baseRating: 1600 },
  ],
};

/**
 * Banque de repli pour les 105 thèmes absents de `THEME_TAG_MAP`
 * (`positional_mastery`, `jesper_hall_course`, `sparring_positions` — voir
 * docstring de `populate-puzzles.ts`). Avant l'ajout de cette banque
 * dédiée, ces thèmes tiraient tous sur `LOCAL_PUZZLE_BANK.pin` ou `.sacrifice`
 * — une seule position chacune, clonée 30 fois par thème sur 105 thèmes :
 * la cause principale du "même puzzle partout" observé par l'utilisateur.
 *
 * 6 positions radicalement différentes (mélange mat en 1 / mat en 2 /
 * tactique de gain de pièce, aucune ne recopie une position déjà présente
 * dans `LOCAL_PUZZLE_BANK`), chacune composée puis vérifiée coup par coup
 * avec `chess.js` comme le reste de la banque — voir
 * `local-puzzle-bank.test.ts`.
 */
export const FALLBACK_PUZZLE_BANK: LocalPuzzleSeed[] = [
  // Mat en 1 — dame seule, roi adverse encagé par son propre roi.
  { fen: "1k6/8/1K6/8/8/8/8/7Q w - - 0 1", moves: ["h1h8"], baseRating: 750 },
  // Mat en 2 — "échelle" à deux tours : la première coupe la rangée 7, la
  // seconde mate sur la 8e une fois le roi forcé en g8 (seul coup légal).
  { fen: "7k/8/8/8/8/8/8/RR5K w - - 0 1", moves: ["a1a7", "h8g8", "b1b8"], baseRating: 1250 },
  // Tactique — enfilade : la tour cloue le roi puis gagne la dame derrière.
  { fen: "3q3k/8/8/8/8/8/8/R6K w - - 0 1", moves: ["a1a8", "h8h7"], baseRating: 1000 },
  // Tactique — fourchette de cavalier sur la tour et la dame (pas d'échec).
  { fen: "1r1q3k/8/8/N7/8/8/8/7K w - - 0 1", moves: ["a5c6"], baseRating: 950 },
  // Mat en 1 — dame + tour : la dame verrouille les cases de fuite, la tour mate.
  { fen: "k7/8/1Q6/8/8/8/8/6KR w - - 0 1", moves: ["h1h8"], baseRating: 800 },
  // Tactique — attaque à la découverte du fou qui gagne la tour.
  { fen: "3rk3/8/8/8/2B5/8/8/2R3K1 w - - 0 1", moves: ["c4a6"], baseRating: 1300 },
];

export interface ResolvedLocalPuzzle {
  fen: string;
  moves: string[];
  baseRating: number;
}

/**
 * Longueur du cycle avant qu'une combinaison (position, variante) ne soit
 * répétée à l'identique — exporté pour que `populate-puzzles.ts` calcule le
 * même "numéro de clone" que `resolveLocalPuzzle` en interne (décalage
 * d'Elo affiché).
 */
export function cycleLength(bank: readonly LocalPuzzleSeed[]): number {
  return bank.length * GEOMETRIC_VARIANTS.length;
}

/**
 * Choisit la position à servir pour la déclinaison `index` (0-based) d'un
 * tag donné : fait d'abord défiler les positions distinctes de `bank`, puis,
 * une fois toutes vues, applique successivement les 4 variantes géométriques
 * de `geometric-variants.ts` à chacune, avant de répéter une combinaison déjà
 * servie. Pour une banque de 6 positions (ex: `FALLBACK_PUZZLE_BANK`), ça
 * fait 24 déclinaisons visuellement distinctes avant tout doublon exact — et
 * même une banque à une seule position (ex: `LOCAL_PUZZLE_BANK.fork`) en
 * sort avec 4 orientations différentes plutôt qu'un unique clonage littéral.
 */
export function resolveLocalPuzzle(bank: readonly LocalPuzzleSeed[], index: number): ResolvedLocalPuzzle {
  if (bank.length === 0) {
    throw new Error("resolveLocalPuzzle: banque vide.");
  }
  const cycle = cycleLength(bank);
  const cyclePosition = index % cycle;
  const seedIndex = cyclePosition % bank.length;
  const variantIndex = Math.floor(cyclePosition / bank.length);
  const seed = bank[seedIndex];
  const variant = GEOMETRIC_VARIANTS[variantIndex];
  const { fen, moves } = applyGeometricVariant(seed, variant);
  return { fen, moves: [...moves], baseRating: seed.baseRating };
}
