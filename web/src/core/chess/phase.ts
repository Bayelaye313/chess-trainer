import { Chess } from "chess.js";
import { PHASE_MATERIAL_VALUE } from "./pieces";
import type { GamePhase } from "./types";

/** Au-delà, on est encore dans les coups de développement. */
export const OPENING_LAST_MOVE = 10;

/** Matériel (pions et rois exclus) en dessous duquel on considère être en finale. */
export const ENDGAME_MATERIAL_THRESHOLD = 14;

/** Matériel restant sur l'échiquier, pions et rois exclus. */
export function phaseMaterial(board: Chess): number {
  let total = 0;
  for (const row of board.board()) {
    for (const square of row) {
      if (square) total += PHASE_MATERIAL_VALUE[square.type] ?? 0;
    }
  }
  return total;
}

/**
 * Phase de jeu, par heuristique : les dix premiers coups sont l'ouverture,
 * ensuite c'est le matériel restant qui décide.
 *
 * Volontairement grossier — sert à ranger une erreur dans le bon deck, pas à
 * qualifier finement la position.
 */
export function gamePhase(board: Chess): GamePhase {
  if (board.moveNumber() <= OPENING_LAST_MOVE) return "opening";
  return phaseMaterial(board) <= ENDGAME_MATERIAL_THRESHOLD ? "endgame" : "middlegame";
}
