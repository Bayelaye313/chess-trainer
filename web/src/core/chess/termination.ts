import { Chess } from "chess.js";
import type { GameResult } from "./types";

export type Termination =
  | "checkmate"
  | "stalemate"
  | "insufficient_material"
  | "threefold_repetition"
  | "fifty_move_rule";

export interface GameOutcome {
  result: GameResult;
  termination: Termination;
}

/**
 * Résultat et cause de fin de partie, ou `null` tant que la partie continue.
 *
 * chess.js n'a pas d'équivalent au `board.result()` de python-chess : on le
 * reconstruit à partir des prédicats `is*()`, dans l'ordre où ils s'excluent
 * mutuellement.
 */
export function gameOutcome(chess: Chess): GameOutcome | null {
  if (!chess.isGameOver()) return null;

  if (chess.isCheckmate()) {
    // Le camp au trait est celui qui vient d'être maté : l'autre gagne.
    return { result: chess.turn() === "w" ? "0-1" : "1-0", termination: "checkmate" };
  }
  if (chess.isStalemate()) return { result: "1/2-1/2", termination: "stalemate" };
  if (chess.isInsufficientMaterial()) {
    return { result: "1/2-1/2", termination: "insufficient_material" };
  }
  if (chess.isThreefoldRepetition()) {
    return { result: "1/2-1/2", termination: "threefold_repetition" };
  }
  // isGameOver() est vrai et aucun des cas ci-dessus ne l'explique : c'est la
  // règle des 50 coups, seule condition de nulle restante dans chess.js.
  return { result: "1/2-1/2", termination: "fifty_move_rule" };
}
