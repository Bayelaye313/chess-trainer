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
