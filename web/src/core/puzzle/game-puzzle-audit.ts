/**
 * Audit des puzzles tirés des parties de l'utilisateur (onglet Entraîner) —
 * la même rigueur que les vagues de l'Académie (`scripts/academy-mining`,
 * contrôle d'unicité) appliquée aux cartes FSRS personnelles.
 *
 * Tout est pur : le script `scripts/audit-game-puzzles.mts` fournit les
 * lignes Stockfish (MultiPV, profondeur 16, score du point de vue du camp au
 * trait) et ce module rend les verdicts :
 *
 *  1. `judgeSolverPly` — le coup attendu du solveur est-il LE coup unique le
 *     plus fort ? Seule tolérance : plusieurs coups qui matent de force
 *     (`mate-equivalent`, rangés dans `alternatives`).
 *  2. `isAccusationRefuted` — le moteur confirme-t-il que le coup joué dans
 *     la partie était une vraie erreur ? Sinon la carte « accuse » à tort.
 *  3. `recalibrateGamePuzzleDeck` — le deck mérité, recalculé à partir des
 *     faits vérifiés (mat réellement manqué, matériel réellement perdu).
 *  4. `buildGameErrorComment` — le commentaire du coach, au format de nos
 *     cours (`[%txt "…"]`, `[%csl]`, `[%cal]`, voir `core/chess/move-tree.ts`),
 *     avec des repères géométriques RÉELS : cases, pièces, lignes lues sur
 *     l'échiquier par chess.js, jamais inventés.
 */
import { Chess, type Color, type Move, type PieceSymbol, type Square } from "chess.js";
import type { MistakeDeckId } from "@/core/chess/decks";
import { gamePhase } from "@/core/chess/phase";
import { PIECE_VALUE } from "@/core/chess/pieces";
import { attacksFrom, newlyHangingPieces } from "@/core/chess/attacks";
import { winPercent } from "@/core/analysis/win-percent";

/** Une ligne Stockfish : score du point de vue du camp AU TRAIT de la position analysée. */
export interface EngineLine {
  kind: "cp" | "mate";
  v: number;
  pv: readonly string[];
}

/** Écart minimal (points de probabilité de gain) entre le 1er et le 2e coup — même seuil que l'Académie (README `academy-mining`, lot 5). */
export const UNIQUENESS_MIN_GAP = 10;

/**
 * Perte minimale (points de probabilité de gain) pour que le coup joué soit
 * une erreur — le seuil « imprécision » de Lichess (`core/analysis/win-percent.ts`).
 * En dessous, le moteur réfute l'accusation de la carte.
 */
export const ACCUSATION_MIN_DROP = 10;

/** Matériel (pions) à partir duquel un écart compte comme gain/perte « tactique ». */
export const MATERIAL_SWING = 2;

export function lineWinPercent(line: EngineLine): number {
  return line.kind === "mate" ? winPercent(null, line.v) : winPercent(line.v, null);
}

/** La ligne mate-t-elle de force POUR le camp au trait ? */
export function isForcedMateFor(line: EngineLine | undefined): boolean {
  return line?.kind === "mate" && line.v > 0;
}

/** Ligne vue de l'autre camp (après un coup, le trait change). */
export function flipLine(line: EngineLine): EngineLine {
  return { ...line, v: -line.v };
}

export type SolverPlyVerdict =
  | { ok: true; reason: "unique" | "mate-equivalent"; alternatives: string[] }
  | { ok: false; reason: "not-best" | "ambiguous" | "no-line" };

/**
 * Pli du SOLVEUR : `lines` = MultiPV de la position (triées), `expectedLine`
 * = score du coup attendu quand il n'est pas dans `lines` (`go searchmoves`).
 *
 * - le coup attendu est le meilleur et le 2e coup est à ≥ `UNIQUENESS_MIN_GAP`
 *   points derrière → `unique` ;
 * - le meilleur coup mate et le 2e ne mate pas → `unique` (seul le mat compte) ;
 * - plusieurs coups matent de force, le coup attendu parmi eux →
 *   `mate-equivalent` (les autres mats vont dans `alternatives`) ;
 * - sinon : `not-best` (le moteur préfère autre chose) ou `ambiguous`.
 */
export function judgeSolverPly(
  expectedUci: string,
  lines: readonly EngineLine[],
  expectedLine?: EngineLine | null,
): SolverPlyVerdict {
  const best = lines[0];
  if (!best || best.pv.length === 0) return { ok: false, reason: "no-line" };
  const mates = lines.filter((line) => isForcedMateFor(line) && line.pv.length > 0);
  const expected = lines.find((line) => line.pv[0] === expectedUci) ?? expectedLine ?? null;

  if (isForcedMateFor(best)) {
    if (!expected || !isForcedMateFor(expected)) return { ok: false, reason: "not-best" };
    const others = mates.map((line) => line.pv[0]).filter((uci) => uci !== expectedUci);
    return others.length === 0
      ? { ok: true, reason: "unique", alternatives: [] }
      : { ok: true, reason: "mate-equivalent", alternatives: others };
  }

  if (best.pv[0] !== expectedUci) return { ok: false, reason: "not-best" };
  const second = lines[1];
  // Un seul coup légal (ou MultiPV tronquée) : rien à départager.
  if (!second) return { ok: true, reason: "unique", alternatives: [] };
  return lineWinPercent(best) - lineWinPercent(second) >= UNIQUENESS_MIN_GAP
    ? { ok: true, reason: "unique", alternatives: [] }
    : { ok: false, reason: "ambiguous" };
}

/**
 * Pli ADVERSE de la solution : la réponse enregistrée doit être la défense la
 * plus tenace (à `UNIQUENESS_MIN_GAP` près, du point de vue du défenseur) —
 * sinon la suite que le solveur rejoue n'est pas forcée.
 */
export function isForcedReply(expectedUci: string, lines: readonly EngineLine[], expectedLine?: EngineLine | null): boolean {
  const best = lines[0];
  if (!best) return false;
  if (best.pv[0] === expectedUci) return true;
  const expected = lines.find((line) => line.pv[0] === expectedUci) ?? expectedLine ?? null;
  if (!expected) return false;
  return lineWinPercent(best) - lineWinPercent(expected) < UNIQUENESS_MIN_GAP;
}

/**
 * Le moteur réfute-t-il l'accusation ? `best` = meilleure ligne avant le coup
 * (POV du joueur), `afterPlayed` = meilleure ligne après le coup joué (POV
 * de l'ADVERSAIRE, au trait). Un mat qui s'évapore n'est jamais réfuté.
 */
export function isAccusationRefuted(best: EngineLine, afterPlayed: EngineLine): boolean {
  const played = flipLine(afterPlayed);
  if (isForcedMateFor(best) && !isForcedMateFor(played)) return false;
  return lineWinPercent(best) - lineWinPercent(played) < ACCUSATION_MIN_DROP;
}

/** Bilan matériel (pions, rois exclus) du point de vue de `color`. */
export function materialBalance(board: Chess, color: Color): number {
  let total = 0;
  for (const row of board.board()) {
    for (const square of row) {
      if (!square || square.type === "k") continue;
      total += square.color === color ? PIECE_VALUE[square.type] : -PIECE_VALUE[square.type];
    }
  }
  return total;
}

/**
 * Variation de matériel pour `color` au bout d'une PV jouée depuis `fen`.
 * Stockfish prolonge sa PV jusqu'à une position calme : on la lit en entier
 * (bornée à `maxPlies`) pour ne jamais arrêter le compte au milieu d'un échange.
 */
export function materialSwingAlong(fen: string, pv: readonly string[], color: Color, maxPlies = 12): number {
  const board = new Chess(fen);
  const start = materialBalance(board, color);
  for (const uci of pv.slice(0, maxPlies)) {
    if (!playUci(board, uci)) break;
  }
  return materialBalance(board, color) - start;
}

export interface DeckFacts {
  fenBefore: string;
  /** Un mat forcé existait pour le joueur et le coup joué l'a laissé filer. */
  mateMissed: boolean;
  /** Matériel perdu par le joueur le long de la meilleure réponse adverse au coup joué. */
  materialLostByPlayed: number;
  /** Matériel gagné par le joueur le long de la meilleure suite (la solution). */
  materialWonByBest: number;
}

/**
 * Deck mérité, par priorité décroissante (même ordre que `categorizeDeck`) :
 * mat manqué > ouverture (coups 1-10, `gamePhase`) > finale > gaffe
 * matérielle (« Erreurs tactiques ») > gain matériel raté (« Tactiques
 * manquées ») > erreur positionnelle.
 */
export function recalibrateGamePuzzleDeck(facts: DeckFacts): MistakeDeckId {
  if (facts.mateMissed) return "missed_checkmates";
  const phase = gamePhase(new Chess(facts.fenBefore));
  if (phase === "opening") return "opening_mistakes";
  if (phase === "endgame") return "endgame_mistakes";
  if (facts.materialLostByPlayed >= MATERIAL_SWING) return "tactical_mistakes";
  if (facts.materialWonByBest >= MATERIAL_SWING) return "missed_tactics";
  return "positional_mistakes";
}

const PIECE_NAME: Record<PieceSymbol, { name: string; feminine: boolean }> = {
  p: { name: "pion", feminine: false },
  n: { name: "cavalier", feminine: false },
  b: { name: "fou", feminine: false },
  r: { name: "tour", feminine: true },
  q: { name: "dame", feminine: true },
  k: { name: "roi", feminine: false },
};

/** « ton cavalier », « ta dame », « le fou adverse »… */
function yourPiece(type: PieceSymbol): string {
  const { name, feminine } = PIECE_NAME[type];
  return `${feminine ? "ta" : "ton"} ${name}`;
}

function theirPiece(type: PieceSymbol): string {
  const { name, feminine } = PIECE_NAME[type];
  return `${feminine ? "la" : "le"} ${name}`;
}

function moveLabel(fen: string): string {
  const board = new Chess(fen);
  return board.turn() === "w" ? `${board.moveNumber()}.` : `${board.moveNumber()}...`;
}

function formatScore(line: EngineLine, perspective: "self" | "flip"): string {
  const v = perspective === "self" ? line.v : -line.v;
  if (line.kind === "mate") return v > 0 ? `mat en ${v}` : `mat subi en ${-v}`;
  const pawns = v / 100;
  return `${pawns >= 0 ? "+" : ""}${pawns.toFixed(1)}`;
}

function playUci(board: Chess, uci: string): Move | null {
  try {
    return board.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
  } catch {
    return null;
  }
}

/** Pièces adverses de valeur (cavalier et plus, roi compris) attaquées depuis `square` sur `board`. */
function valuableTargetsFrom(board: Chess, square: Square, owner: Color): { square: Square; type: PieceSymbol }[] {
  return attacksFrom(board, square)
    .map((target) => ({ square: target, piece: board.get(target) }))
    .filter((entry) => entry.piece && entry.piece.color !== owner && PIECE_VALUE[entry.piece.type] >= 3)
    .map((entry) => ({ square: entry.square, type: entry.piece!.type }));
}

export interface GameErrorCommentInput {
  fenBefore: string;
  playedUci: string;
  /** Meilleure ligne avant le coup (POV du joueur) — sa PV commence par la solution. */
  best: EngineLine;
  /** Meilleure ligne après le coup joué (POV de l'adversaire, au trait). */
  afterPlayed: EngineLine;
  deck: MistakeDeckId;
}

export interface GameErrorComment {
  /** Commentaire brut au format de nos cours : `[%txt "…"] [%csl …] [%cal …]`. */
  raw: string;
  /** Le texte seul (contenu de `[%txt]`). */
  text: string;
}

/**
 * Commentaire du coach sur l'erreur RÉELLE de la partie : ce qui a été joué,
 * la réfutation vue par Stockfish (pièce et case perdues, échec, mat) et le
 * coup qu'il fallait (trajet de la pièce, cibles attaquées depuis sa case
 * d'arrivée). Chaque case citée est relue sur l'échiquier par chess.js.
 */
export function buildGameErrorComment(input: GameErrorCommentInput): GameErrorComment | null {
  const before = new Chess(input.fenBefore);
  const me = before.turn();
  const label = moveLabel(input.fenBefore);

  const playedBoard = new Chess(input.fenBefore);
  const played = playUci(playedBoard, input.playedUci);
  const bestBoard = new Chess(input.fenBefore);
  const bestMove = input.best.pv[0] ? playUci(bestBoard, input.best.pv[0]) : null;
  if (!played || !bestMove) return null;

  const sentences: string[] = [];
  const circles: string[] = [];
  const arrows: string[] = [`R${played.from}${played.to}`, `G${bestMove.from}${bestMove.to}`];

  sentences.push(`Au coup ${label}${played.san}, ${yourPiece(played.piece)} part de ${played.from} vers ${played.to}.`);

  // Réfutation : la meilleure réponse adverse au coup joué.
  const replyUci = input.afterPlayed.pv[0];
  const replyBoard = new Chess(playedBoard.fen());
  const reply = replyUci ? playUci(replyBoard, replyUci) : null;
  const hanging = newlyHangingPieces(before, playedBoard, me).sort((a, b) => PIECE_VALUE[b.piece] - PIECE_VALUE[a.piece]);

  if (input.deck === "missed_checkmates" && isForcedMateFor(input.best)) {
    sentences.push(
      `Il y avait mat en ${input.best.v} : ${bestMove.san}, ${yourPiece(bestMove.piece)} de ${bestMove.from} à ${bestMove.to}${bestMove.san.includes("+") ? " avec échec" : ""}.`,
    );
    const king = before.board().flat().find((sq) => sq && sq.type === "k" && sq.color !== me);
    if (king) {
      circles.push(`R${king.square}`);
      sentences.push(`Le roi adverse en ${king.square} n'avait plus de case sûre.`);
    }
  } else {
    if (isForcedMateFor(input.afterPlayed)) {
      sentences.push(`Erreur fatale : l'adversaire a désormais mat en ${input.afterPlayed.v}${reply ? `, à commencer par ${reply.san}` : ""}.`);
    } else if (reply?.captured) {
      circles.push(`R${reply.to}`);
      sentences.push(`Réfutation : ${reply.san} — ${theirPiece(reply.piece)} adverse prend ${yourPiece(reply.captured)} en ${reply.to}.`);
    } else if (hanging.length > 0) {
      const target = hanging[0];
      circles.push(`R${target.square}`);
      sentences.push(`Ce coup laisse ${yourPiece(target.piece)} en ${target.square} sans défense légale.`);
    } else if (reply) {
      // Conséquence lue sur le score RÉEL après le coup joué (POV du joueur) :
      // « prend l'avantage » seulement si l'adversaire passe vraiment devant.
      const after = lineWinPercent(flipLine(input.afterPlayed));
      const consequence = after >= 55 ? "et réduit ton avantage" : after >= 45 ? "et revient à égalité" : "et prend l'avantage";
      sentences.push(`Stockfish répond ${reply.san}${reply.san.includes("+") ? ", avec échec" : ""} ${consequence}.`);
    }
    if (reply) arrows.push(`R${reply.from}${reply.to}`);

    const targets = valuableTargetsFrom(bestBoard, bestMove.to, me);
    const fork = targets.length >= 2 ? ` Depuis ${bestMove.to}, il attaque ${targets.map((t) => `${theirPiece(t.type)} ${t.square}`).join(" et ")}.` : "";
    for (const t of targets) circles.push(`G${t.square}`);
    sentences.push(
      `Il fallait ${bestMove.san} : ${yourPiece(bestMove.piece)} de ${bestMove.from} à ${bestMove.to}${bestMove.captured ? `, en prenant ${theirPiece(bestMove.captured)} adverse` : ""}.${fork}`,
    );
  }

  sentences.push(
    `Stockfish (prof. 16) : ${formatScore(input.best, "self")} avec ${bestMove.san}, ${formatScore(input.afterPlayed, "flip")} après ${played.san}.`,
  );

  const text = sentences.join(" ").replaceAll('"', "«");
  const tags = [`[%txt "${text}"]`];
  if (circles.length > 0) tags.push(`[%csl ${[...new Set(circles)].join(",")}]`);
  tags.push(`[%cal ${[...new Set(arrows)].join(",")}]`);
  return { raw: tags.join(" "), text };
}
