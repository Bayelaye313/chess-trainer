/**
 * Qualifie un coup hors-solution joué pendant un puzzle (`solve-state.ts`,
 * branche `!matchesSolution` de `applyWhileSolving`) — au lieu du seul
 * compteur d'essais, un indice textuel nommant la nature de l'erreur, sur le
 * modèle « Humanized Coaching » de CLAUDE.md (« Left piece en prise »,
 * « Weak King Safety »).
 *
 * Pur (chess.js uniquement), aucune dépendance moteur : les deux heuristiques
 * ci-dessous sont volontairement bon marché (pas d'appel Stockfish) pour
 * rester instantanées à chaque coup faux, contrairement à la jauge live qui,
 * elle, interroge le moteur.
 */
import { Chess, type Color, type PieceSymbol, type Square } from "chess.js";
import { attacksFrom, hasHangingPiece } from "./attacks";
import { MINOR_PIECE_VALUE, PIECE_VALUE } from "./pieces";
import { directionBetween, rayFrom } from "./squares";
import { WRONG_MOVE_HINTS, type WrongMoveHint } from "./types";

export { WRONG_MOVE_HINTS, type WrongMoveHint };

/**
 * `before`/`after` encadrent le coup hors-solution : `after` est la position
 * une fois ce coup joué (avant que l'appelant ne l'annule, voir le docstring
 * de `use-puzzle-solver.ts#onPieceDrop`). `mover` est le camp qui vient de
 * jouer — jamais déduit du trait de `after`, qui a déjà tourné.
 */
export function classifyWrongMove(before: Chess, after: Chess, mover: Color): WrongMoveHint {
  // Pièce en prise : seulement si CE coup en est la cause — un matériel déjà
  // perdu avant le coup ne doit pas être reproché à celui-ci.
  if (hasHangingPiece(after, mover) && !hasHangingPiece(before, mover)) return "hangs_piece";

  if (newKingThreat(before, after, mover)) return "exposes_king";

  return "generic";
}

/** Ce que coûte concrètement l'échec offert : mat, matériel pris avec échec, ou fourchette roi + pièce. */
export type KingThreatKind = "mate" | "wins_material" | "fork";

/** Ce que le coup joué a fait pour rendre l'échec possible — `null` si rien de lisible. */
export type KingThreatCause =
  | { kind: "king_move" }
  /** La pièce qui vient de bouger est elle-même prise (ou fourchée) avec échec. */
  | { kind: "moved_piece"; square: Square }
  | { kind: "pawn_shield"; square: Square }
  | { kind: "opened_line"; square: Square };

export interface KingThreat {
  kind: KingThreatKind;
  /** L'échec adverse, en SAN (`Qh4#`, `Bxf7+`, `Nc7+`). */
  checkSan: string;
  /** Pièce prise (`wins_material`) ou attaquée en même temps que le roi (`fork`). */
  target: { piece: PieceSymbol; square: Square } | null;
  cause: KingThreatCause | null;
}

const THREAT_RANK: Record<KingThreatKind, number> = { mate: 3, wins_material: 2, fork: 1 };

/** Position identique avec le trait inversé (« coup nul ») — `null` si chess.js la refuse. */
function withTurnFlipped(board: Chess): Chess | null {
  const fields = board.fen().split(" ");
  fields[1] = fields[1] === "w" ? "b" : "w";
  fields[3] = "-";
  try {
    return new Chess(fields.join(" "));
  } catch {
    return null;
  }
}

/** Le camp au trait (en échec) peut-il légalement prendre la pièce posée en `square` ? */
function canCapture(board: Chess, square: Square): boolean {
  return board.moves({ verbose: true }).some((move) => move.to === square && Boolean(move.captured));
}

/**
 * Échecs DANGEREUX à la disposition du camp au trait dans `board` : seuls
 * comptent ceux qui coûtent quelque chose de vérifiable — mat immédiat,
 * capture avec échec qui gagne du matériel (pas de reprise légale, ou pièce
 * prise plus chère que la pièce qui prend), ou fourchette (l'échec attaque
 * aussi une pièce ≥ cavalier, plus chère que l'attaquant ou sans défenseur,
 * et l'attaquant ne peut pas être pris). Un échec « en l'air » n'est pas un
 * problème de sécurité du roi.
 */
type FoundCheck = Omit<KingThreat, "cause"> & { from: Square; to: Square };

function dangerousChecks(board: Chess): Map<string, FoundCheck> {
  const found = new Map<string, FoundCheck>();
  const defender: Color = board.turn() === "w" ? "b" : "w";
  for (const move of board.moves({ verbose: true })) {
    const probe = new Chess(board.fen());
    probe.move(move.san);
    if (!probe.isCheck()) continue;
    const key = `${move.from}${move.to}${move.promotion ?? ""}`;
    const checker = probe.get(move.to);
    const checkerValue = checker ? PIECE_VALUE[checker.type] : 0;

    if (probe.isCheckmate()) {
      found.set(key, { kind: "mate", checkSan: move.san, target: null, from: move.from, to: move.to });
      continue;
    }

    const checkerSafe = !canCapture(probe, move.to);
    if (move.captured && (checkerSafe || PIECE_VALUE[move.captured] > checkerValue)) {
      found.set(key, {
        kind: "wins_material",
        checkSan: move.san,
        target: { piece: move.captured, square: move.to },
        from: move.from,
        to: move.to,
      });
      continue;
    }

    if (!checkerSafe) continue;
    let best: { piece: PieceSymbol; square: Square } | null = null;
    for (const square of attacksFrom(probe, move.to)) {
      const piece = probe.get(square);
      if (!piece || piece.color !== defender || piece.type === "k") continue;
      const value = PIECE_VALUE[piece.type];
      if (value < MINOR_PIECE_VALUE) continue;
      if (value <= checkerValue && probe.attackers(square, defender).length > 0) continue;
      if (!best || value > PIECE_VALUE[best.piece]) best = { piece: piece.type, square };
    }
    if (best) found.set(key, { kind: "fork", checkSan: move.san, target: best, from: move.from, to: move.to });
  }
  return found;
}

/** `square` est-elle strictement entre `from` et `to` sur une même ligne (colonne, rangée, diagonale) ? */
function isBetween(from: Square, to: Square, square: Square): boolean {
  const direction = directionBetween(from, to);
  if (!direction) return false;
  for (const current of rayFrom(from, direction)) {
    if (current === to) return false;
    if (current === square) return true;
  }
  return false;
}

/**
 * Ce que le coup `before → after` a fait pour rendre l'échec possible — sert
 * à EXPLIQUER l'échec, jamais à le détecter. Chaque cause est vérifiée
 * géométriquement ; `null` plutôt qu'une explication fausse.
 */
function threatCause(
  before: Chess,
  after: Chess,
  mover: Color,
  threat: Omit<KingThreat, "cause">,
  checkFrom: Square,
  checkTo: Square,
): KingThreatCause | null {
  const [kingBefore] = before.findPiece({ type: "k", color: mover });
  const [kingAfter] = after.findPiece({ type: "k", color: mover });
  if (!kingBefore || !kingAfter) return null;
  if (kingBefore !== kingAfter) return { kind: "king_move" };

  const squares = before.board().flat();
  // Case d'arrivée : occupée par `mover` après, mais pas par la même pièce avant.
  const arrived = after
    .board()
    .flat()
    .find((piece) => piece && piece.color === mover && before.get(piece.square)?.type !== piece.type);
  if (arrived && threat.target?.square === arrived.square) return { kind: "moved_piece", square: arrived.square };

  // Case de départ : occupée par `mover` avant, plus après.
  const vacated = squares.find((piece) => piece && piece.color === mover && after.get(piece.square)?.color !== mover);
  if (!vacated) return null;

  // Ligne ouverte : la case quittée bloquait la pièce qui donne échec, avant
  // ou après son déplacement, sur le chemin du roi.
  if (isBetween(checkTo, kingAfter, vacated.square) || isBetween(checkFrom, checkTo, vacated.square)) {
    return { kind: "opened_line", square: vacated.square };
  }
  // Abri de pion : un pion du même côté que le roi, sur une colonne voisine
  // (au plus deux colonnes d'écart) — typiquement f/g/h devant un petit roque.
  const fileGap = Math.abs(vacated.square.charCodeAt(0) - kingAfter.charCodeAt(0));
  if (vacated.type === "p" && fileGap <= 2) return { kind: "pawn_shield", square: vacated.square };
  return null;
}

/**
 * Le coup de `mover` (`before → after`, adversaire au trait dans `after`)
 * vient-il d'offrir à l'adversaire un échec qui COÛTE quelque chose (voir
 * `dangerousChecks`) et qu'il n'avait pas déjà avant ce coup ? Remplace
 * l'ancien « l'adversaire a-t-il un échec légal ? », vrai dans la plupart des
 * positions et donc source de fausses alertes « roi exposé ». `null` : la
 * sécurité du roi n'est pas en cause.
 */
export function newKingThreat(before: Chess, after: Chess, mover: Color): KingThreat | null {
  const now = dangerousChecks(after);
  if (now.size === 0) return null;
  const flipped = withTurnFlipped(before);
  const already = flipped ? dangerousChecks(flipped) : new Map<string, FoundCheck>();

  let worst: FoundCheck | null = null;
  for (const [key, threat] of now) {
    const previous = already.get(key);
    if (previous && THREAT_RANK[previous.kind] >= THREAT_RANK[threat.kind]) continue;
    if (!worst || THREAT_RANK[threat.kind] > THREAT_RANK[worst.kind]) worst = threat;
  }
  if (!worst) return null;
  const { from, to, ...threat } = worst;
  return { ...threat, cause: threatCause(before, after, mover, threat, from, to) };
}
