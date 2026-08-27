/**
 * Rejoue une suite de coups UCI depuis une FEN et renvoie leur SAN — pur
 * (chess.js), aucune dépendance moteur ni base. Les puzzles maison
 * (`puzzleFromMove`, `server/queries/spaced-repetition.ts`) n'ont qu'un seul
 * coup de solution, déjà connu en SAN à l'analyse ; les puzzles tiers
 * (`server/puzzle-bank/`) en ont plusieurs et n'arrivent que sous forme UCI —
 * d'où ce petit utilitaire, absent jusqu'ici faute de besoin.
 */
import { Chess } from "chess.js";

export function uciSequenceToSan(fen: string, moves: readonly string[]): string[] {
  const chess = new Chess(fen);
  const sans: string[] = [];
  for (const uci of moves) {
    const move = chess.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci.slice(4, 5) || undefined,
    });
    sans.push(move.san);
  }
  return sans;
}

/** Un pli rejoué, avec les deux FEN qui l'encadrent — voir `replayPlies`. */
export interface ReplayedPly {
  uci: string;
  san: string;
  fenBefore: string;
  fenAfter: string;
}

/**
 * Même rejeu que `uciSequenceToSan`, mais garde aussi la FEN de chaque
 * position traversée — c'est ce dont a besoin une navigation coup par coup
 * (`use-post-solve-analysis.ts`, le Mode Analyse Pro du puzzle une fois
 * résolu) pour afficher n'importe quel pli de `puzzle.solution` sans
 * réanalyser le moteur ni maintenir sa propre instance `chess.js`.
 */
export function replayPlies(fen: string, moves: readonly string[]): ReplayedPly[] {
  const chess = new Chess(fen);
  const plies: ReplayedPly[] = [];
  for (const uci of moves) {
    const fenBefore = chess.fen();
    const move = chess.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci.slice(4, 5) || undefined,
    });
    plies.push({ uci, san: move.san, fenBefore, fenAfter: chess.fen() });
  }
  return plies;
}
