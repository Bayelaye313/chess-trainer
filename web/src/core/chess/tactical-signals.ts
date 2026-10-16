/**
 * Ce que la SOLUTION d'un puzzle révèle, au-delà des étiquettes de sa source.
 *
 * Les bases publiques taguent le motif principal (`fork`, `pin`, `sacrifice`) et
 * s'arrêtent là. Or l'académie sépare des thèmes que ces étiquettes confondent :
 * le clouage ABSOLU et le clouage RELATIF portent tous deux le tag `pin`,
 * l'intermezzo et le coup INTERCALAIRE le tag `intermezzo`, le sacrifice grec
 * n'a aucun tag du tout. Sans ce module, ces thèmes-là devraient se partager les
 * mêmes puzzles — exactement le défaut qu'on est en train de corriger.
 *
 * Ces signaux se calculent en rejouant la solution avec `chess.js` : ils
 * décrivent ce qui se passe RÉELLEMENT sur l'échiquier, pas ce qu'un tagueur a
 * bien voulu écrire. Calculés une fois à l'ingestion, ils sont stockés dans le
 * dataset et interrogés par `theme-queries.ts`.
 */
import { Chess, type Color, type Move, type Square } from "chess.js";
import { isSacrifice } from "./sacrifice";
import { attacksFrom, isPinned, sliderDirections } from "./attacks";
import { PIECE_VALUE } from "./pieces";
import { directionBetween, rayFrom } from "./squares";

export const TACTICAL_SIGNALS = [
  /** Le premier coup du solveur donne échec. */
  "check_first",
  /** Le premier coup du solveur est une prise. */
  "capture_first",
  /** Le premier coup n'est ni échec ni prise — le « coup tranquille » qui décide quand même. */
  "quiet_first",
  "sacrifice_first",
  "queen_sacrifice",
  "exchange_sacrifice",
  /** Une pièce adverse se retrouve clouée devant SON ROI : le clouage est absolu, illégal à rompre. */
  "absolute_pin",
  /** Une pièce adverse écrante une pièce plus chère qu'elle : le clouage est relatif, rompre est légal mais coûteux. */
  "relative_pin",
  /** Fou qui se donne en h7/h2 avec échec — le sacrifice grec. */
  "greek_gift",
  "promotion",
  "under_promotion",
  "en_passant",
  /** Série d'échecs à la découverte entrecoupés de prises — le moulin. */
  "windmill",
  /** La ligne n'est faite que d'échecs et ne mate pas : c'est une ressource de nulle. */
  "perpetual_check",
  /** Le roi adverse est promené sur trois cases ou plus. */
  "king_hunt",
] as const;

export type TacticalSignal = (typeof TACTICAL_SIGNALS)[number];

/**
 * Clouage RELATIF : `square` porte une pièce de `color` alignée entre une
 * glissante ennemie et une pièce AMIE strictement plus chère qu'elle. Bouger
 * est légal — contrairement au clouage absolu de `attacks.ts` — mais perd du
 * matériel, et c'est cette nuance que le thème « Le clouage relatif » enseigne.
 */
export function isRelativelyPinned(board: Chess, color: Color, square: Square): boolean {
  const piece = board.get(square);
  if (!piece || piece.color !== color || piece.type === "k") return false;
  // Un clouage devant le roi est absolu, pas relatif : les deux thèmes doivent
  // rester étanches.
  if (isPinned(board, color, square)) return false;

  const enemy: Color = color === "w" ? "b" : "w";
  for (const attacker of board.attackers(square, enemy)) {
    const attackerPiece = board.get(attacker);
    if (!attackerPiece || !sliderDirections(attackerPiece.type)) continue;

    const direction = directionBetween(attacker, square);
    if (!direction) continue;

    // Derrière la pièce clouée, la première case occupée doit porter une pièce
    // amie plus chère.
    for (const behind of rayFrom(square, direction)) {
      const occupant = board.get(behind);
      if (!occupant) continue;
      if (occupant.color !== color) break;
      if (occupant.type === "k") break; // absolu, déjà écarté plus haut
      if (PIECE_VALUE[occupant.type] > PIECE_VALUE[piece.type]) return true;
      break;
    }
  }
  return false;
}

/** Une pièce adverse est-elle clouée, et de quelle façon, dans cette position ? */
function pinSignals(board: Chess, victim: Color): TacticalSignal[] {
  const signals: TacticalSignal[] = [];
  for (const row of board.board()) {
    for (const cell of row) {
      if (!cell || cell.color !== victim) continue;
      if (!signals.includes("absolute_pin") && isPinned(board, victim, cell.square)) signals.push("absolute_pin");
      if (!signals.includes("relative_pin") && isRelativelyPinned(board, victim, cell.square)) {
        signals.push("relative_pin");
      }
    }
  }
  return signals;
}

/**
 * L'échec vient-il d'une pièce AUTRE que celle qui vient de jouer ? C'est la
 * définition de l'échec à la découverte, et le maillon du moulin.
 */
function isDiscoveredCheck(after: Chess, move: Move, mover: Color): boolean {
  if (!after.isCheck()) return false;
  const [kingSquare] = after.findPiece({ type: "k", color: mover === "w" ? "b" : "w" });
  if (!kingSquare) return false;
  const checkers = after.attackers(kingSquare, mover);
  return checkers.length > 0 && !checkers.includes(move.to);
}

const GREEK_GIFT_SQUARES: readonly Square[] = ["h7", "h2"];

/**
 * Tous les signaux que porte cette solution.
 *
 * @param fen   position de départ, déjà réglée sur le coup à trouver
 * @param moves solution complète en UCI, réponses adverses aux rangs impairs
 */
export function describeTacticalSignals(fen: string, moves: readonly string[]): TacticalSignal[] {
  let board: Chess;
  try {
    board = new Chess(fen);
  } catch {
    return [];
  }
  if (moves.length === 0) return [];

  const solver = board.turn();
  const victim: Color = solver === "w" ? "b" : "w";
  const signals = new Set<TacticalSignal>();

  const kingSquares = new Set<string>();
  let solverMoves = 0;
  let solverChecks = 0;
  let discoveredChecks = 0;
  let capturesBetweenDiscoveries = 0;
  let finalCheckmate = false;

  for (const [index, uci] of moves.entries()) {
    const isSolverMove = index % 2 === 0;
    const before = new Chess(board.fen());

    let move: Move;
    try {
      move = board.move({
        from: uci.slice(0, 2) as Square,
        to: uci.slice(2, 4) as Square,
        promotion: uci.length > 4 ? uci[4] : undefined,
      });
    } catch {
      // Solution incohérente avec la position : aucun signal ne peut être
      // affirmé sur une ligne qu'on n'a pas pu rejouer.
      return [];
    }

    if (isSolverMove) {
      solverMoves += 1;
      if (index === 0) {
        if (board.isCheck()) signals.add("check_first");
        if (move.captured) signals.add("capture_first");
        if (!board.isCheck() && !move.captured) signals.add("quiet_first");
        if (isSacrifice(before, move)) {
          signals.add("sacrifice_first");
          if (move.piece === "q") signals.add("queen_sacrifice");
          if (move.piece === "r") signals.add("exchange_sacrifice");
        }
        if (
          move.piece === "b" &&
          move.captured &&
          GREEK_GIFT_SQUARES.includes(move.to) &&
          board.isCheck()
        ) {
          signals.add("greek_gift");
        }
      }

      if (move.promotion) {
        signals.add("promotion");
        if (move.promotion !== "q") signals.add("under_promotion");
      }
      if (move.isEnPassant?.() ?? move.flags.includes("e")) signals.add("en_passant");

      if (board.isCheck()) solverChecks += 1;
      if (isDiscoveredCheck(board, move, solver)) discoveredChecks += 1;
      else if (move.captured) capturesBetweenDiscoveries += 1;
    }

    const [kingSquare] = board.findPiece({ type: "k", color: victim });
    if (kingSquare) kingSquares.add(kingSquare);
    finalCheckmate = board.isCheckmate();
  }

  // Le moulin : au moins deux échecs à la découverte, et des prises entre eux —
  // c'est la moisson qui fait le motif, pas la simple répétition d'échecs.
  if (discoveredChecks >= 2 && capturesBetweenDiscoveries >= 1) signals.add("windmill");

  // Échec perpétuel : tout est échec, rien ne mate, et la ligne dure.
  if (solverMoves >= 3 && solverChecks === solverMoves && !finalCheckmate) signals.add("perpetual_check");

  if (kingSquares.size >= 3) signals.add("king_hunt");

  for (const signal of pinSignals(board, victim)) signals.add(signal);

  return TACTICAL_SIGNALS.filter((signal) => signals.has(signal));
}

/** Cases qu'une pièce bat depuis `square` — réexporté pour les scripts d'ingestion qui étiquettent les batteries. */
export { attacksFrom };
