import "server-only";
import { Chess } from "chess.js";
import { uciSequenceToSan } from "@/core/chess/replay";

/**
 * Banque de puzzles tierce (onglet Casse-têtes) : appels en direct à l'API
 * publique Lichess, aucune persistance locale — contrairement aux puzzles
 * maison (`puzzles` + `reviews`, alimentés par nos propres parties), rien ici
 * n'est mis en file FSRS, on résout et on passe au suivant.
 *
 * Mêmes réglages HTTP que `server/import/sync-platforms.ts` : aucune des deux
 * API Lichess n'a besoin d'OAuth.
 */
const HEADERS = {
  "User-Agent": "ChessTrainerLocal/1.0 (projet local personnel, sans finalité commerciale)",
};
const REQUEST_TIMEOUT_MS = 15_000;

export type PuzzleDifficulty = "easiest" | "easier" | "normal" | "harder" | "hardest";

/** Un thème tactique tel qu'exposé par Lichess (`fork`, `pin`, `mateIn2`…) — "mix" = pas de filtre. */
export type PuzzleTheme = string;

export interface BankPuzzle {
  id: string;
  /** Position avant le premier coup que le solveur doit trouver — déjà réglée après le coup d'installation adverse, voir `toBankPuzzle`. */
  fen: string;
  /** Suite attendue en UCI, coups adverses inclus aux rangs impairs (même convention que `puzzles.solution`). */
  solutionUci: string[];
  solutionSan: string[];
  rating: number;
  themes: PuzzleTheme[];
  gameUrl: string;
}

interface LichessPuzzleResponse {
  game: {
    id: string;
    pgn: string;
  };
  puzzle: {
    id: string;
    rating: number;
    solution: string[];
    themes: string[];
    initialPly: number;
  };
}

/**
 * Traduit la réponse Lichess vers `BankPuzzle`.
 *
 * `game.pgn` est une liste de coups en SAN séparés par des espaces, sans
 * numéros ni en-têtes — on la rejoue nous-mêmes coup par coup plutôt que de
 * passer par `chess.loadPgn`, pensé pour un PGN complet.
 *
 * Convention Lichess (documentée avec le dump CSV de la base de puzzles) : la
 * position à `initialPly` n'est pas encore celle du puzzle — `solution[0]`
 * est le coup d'installation joué par l'ADVERSAIRE, pas celui que le solveur
 * doit trouver. On le rejoue automatiquement et on ne garde que la suite
 * (`solution.slice(1)`) — exactement la convention déjà utilisée par
 * `puzzles.solution` et `PuzzleBoard` (rangs pairs = solveur, impairs = replies).
 */
function toBankPuzzle(response: LichessPuzzleResponse): BankPuzzle {
  const { game, puzzle } = response;
  const chess = new Chess();

  const sanMoves = game.pgn.trim().split(/\s+/).filter(Boolean);
  for (let i = 0; i < puzzle.initialPly && i < sanMoves.length; i += 1) {
    chess.move(sanMoves[i]);
  }

  const setupUci = puzzle.solution[0];
  chess.move({
    from: setupUci.slice(0, 2),
    to: setupUci.slice(2, 4),
    promotion: setupUci.slice(4, 5) || undefined,
  });

  const fen = chess.fen();
  const solutionUci = puzzle.solution.slice(1);

  return {
    id: puzzle.id,
    fen,
    solutionUci,
    solutionSan: uciSequenceToSan(fen, solutionUci),
    rating: puzzle.rating,
    themes: puzzle.themes,
    gameUrl: `https://lichess.org/${game.id}`,
  };
}

async function getPuzzle(url: string): Promise<BankPuzzle> {
  const response = await fetch(url, {
    headers: HEADERS,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Lichess a répondu ${response.status} pour ${url}`);
  }
  const body = (await response.json()) as LichessPuzzleResponse;
  return toBankPuzzle(body);
}

/** Puzzle du jour Lichess — le même pour tout le monde jusqu'à minuit UTC. */
export function fetchDailyPuzzle(): Promise<BankPuzzle> {
  return getPuzzle("https://lichess.org/api/puzzle/daily");
}

/** Puzzle aléatoire, filtrable par thème et difficulté ressentie. */
export function fetchRandomPuzzle(filters: { theme?: PuzzleTheme; difficulty?: PuzzleDifficulty } = {}): Promise<BankPuzzle> {
  const url = new URL("https://lichess.org/api/puzzle/next");
  if (filters.theme) url.searchParams.set("angle", filters.theme);
  if (filters.difficulty) url.searchParams.set("difficulty", filters.difficulty);
  return getPuzzle(url.toString());
}
