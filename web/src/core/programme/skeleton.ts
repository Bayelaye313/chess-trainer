import { Chess, type Color, type PieceSymbol, type Square } from "chess.js";
import { attacksFrom, isPinned } from "../chess/attacks";
import { fileOf, rankOf, squareAt } from "../chess/squares";
import type { SkeletonKind, SkeletonSquare } from "./types";

/**
 * Le « squelette du pattern » (chunking) : les cases qui portent la
 * combinaison, à désigner AVANT d'avoir le droit de chercher la solution.
 *
 * Calculé une fois par le générateur (`scripts/programme/`), stocké dans le
 * JSON du jour (`squelette_cases` + la phrase `squelette_attendu`), puis noté
 * par `scoreSkeleton` côté écran. On ne marque jamais une case de la
 * SOLUTION elle-même (case de départ ou d'arrivée du coup du solveur) : le
 * squelette décrit les faiblesses, pas la réponse.
 *
 * Deux niveaux :
 * - les cases **cœur** : ce que la combinaison va frapper (pièces capturées,
 *   roi mis en échec, case de promotion) — au moins une doit être désignée ;
 * - les cases **contexte** : pièces non défendues, clouées, lignes de force,
 *   cases clés d'une finale de pions — elles comptent comme justes, pas comme
 *   obligatoires.
 */

export interface SkeletonAnalysis {
  squares: SkeletonSquare[];
  /** Sous-ensemble obligatoire (au moins une case à trouver). */
  core: string[];
  description: string;
}

const PIECE_NAME: Record<PieceSymbol, string> = { p: "pion", n: "cavalier", b: "fou", r: "tour", q: "dame", k: "roi" };
const COLOR_NAME: Record<Color, string> = { w: "blanc", b: "noir" };

const opposite = (c: Color): Color => (c === "w" ? "b" : "w");

function movesOf(fen: string, uci: readonly string[]) {
  const chess = new Chess(fen);
  return uci.map((m) => {
    const before = chess.fen();
    const move = chess.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m.slice(4, 5) || undefined });
    return { move, before };
  });
}

function isOpenOrSemiOpenFile(chess: Chess, file: number, owner: Color): boolean {
  for (let r = 0; r < 8; r += 1) {
    const sq = squareAt(file, r);
    const piece = sq ? chess.get(sq) : undefined;
    if (piece?.type === "p" && piece.color === owner) return false;
  }
  return true;
}

/** Cases clés d'un pion passé (règle classique : deux rangées devant, colonnes voisines). */
function keySquares(pawn: Square, color: Color): Square[] {
  const dir = color === "w" ? 1 : -1;
  const relRank = color === "w" ? rankOf(pawn) : 7 - rankOf(pawn);
  const ahead = relRank >= 4 ? [1, 2] : [2];
  const out: Square[] = [];
  for (const dr of ahead) {
    for (const df of [-1, 0, 1]) {
      const sq = squareAt(fileOf(pawn) + df, rankOf(pawn) + dr * dir);
      if (sq) out.push(sq);
    }
  }
  return out;
}

function isPassed(chess: Chess, pawn: Square, color: Color): boolean {
  const dir = color === "w" ? 1 : -1;
  for (let df = -1; df <= 1; df += 1) {
    for (let r = rankOf(pawn) + dir; r >= 0 && r <= 7; r += dir) {
      const sq = squareAt(fileOf(pawn) + df, r);
      const piece = sq ? chess.get(sq) : undefined;
      if (piece?.type === "p" && piece.color !== color) return false;
    }
  }
  return true;
}

function defendedByPawn(chess: Chess, square: Square, color: Color): boolean {
  const back = color === "w" ? -1 : 1;
  return [-1, 1].some((df) => {
    const sq = squareAt(fileOf(square) + df, rankOf(square) + back);
    const piece = sq ? chess.get(sq) : undefined;
    return piece?.type === "p" && piece.color === color;
  });
}

export function analyseSkeleton(fen: string, solutionUci: readonly string[]): SkeletonAnalysis {
  const chess = new Chess(fen);
  const me = chess.turn();
  const them = opposite(me);
  const plies = movesOf(fen, solutionUci);
  const solverPlies = plies.filter((_, i) => i % 2 === 0).map((p) => p.move);
  // Cases de la solution : jamais révélées par le squelette.
  const solutionSquares = new Set(solverPlies.flatMap((m) => [m.from, m.to]));

  const found = new Map<string, SkeletonKind>();
  const core = new Set<string>();
  const add = (sq: string, kind: SkeletonKind, isCore = false) => {
    if (solutionSquares.has(sq as Square) && kind !== "roi_expose") return;
    if (!found.has(sq)) found.set(sq, kind);
    if (isCore) core.add(sq);
  };

  // 1. Cibles : pièces adverses que la solution capture, prises à leur case de départ.
  for (const m of solverPlies) {
    if (!m.captured) continue;
    const original = chess.get(m.to);
    if (original && original.color === them && original.type === m.captured) {
      const defended = chess.attackers(m.to, them).length > 0;
      add(m.to, defended ? "case_faible" : "non_defendue", true);
      // La case d'arrivée d'une capture est aussi celle de la solution : on la
      // garde quand même, c'est la CIBLE (la nommer ne dit pas avec quoi la prendre).
      found.set(m.to, defended ? "case_faible" : "non_defendue");
      core.add(m.to);
    }
  }

  // 2. Roi exposé : la solution donne échec ou mat.
  const [theirKing] = chess.findPiece({ type: "k", color: them });
  if (theirKing && solverPlies.some((m) => /[+#]/.test(m.san))) add(theirKing, "roi_expose", true);

  // 3. Promotion : la case du belvédère.
  const promo = solverPlies.find((m) => m.promotion);
  if (promo) add(promo.to, "pion_passe", true);

  // 4. Contexte : pièces adverses non défendues ou clouées.
  for (const row of chess.board()) {
    for (const piece of row) {
      if (!piece || piece.color !== them || piece.type === "k") continue;
      if (isPinned(chess, them, piece.square)) add(piece.square, "piece_clouee");
      else if (piece.type !== "p" && chess.attackers(piece.square, them).length === 0) add(piece.square, "non_defendue");
    }
  }

  // 5. Lignes de force : tours/dames du solveur sur une colonne ouverte ou
  //    semi-ouverte, ou dont le rayon atteint le roi adverse.
  for (const row of chess.board()) {
    for (const piece of row) {
      if (!piece || piece.color !== me || (piece.type !== "r" && piece.type !== "q")) continue;
      const hitsKing = theirKing ? attacksFrom(chess, piece.square).includes(theirKing) : false;
      if (hitsKing || isOpenOrSemiOpenFile(chess, fileOf(piece.square), me)) add(piece.square, "ligne_de_force");
    }
  }

  // 6. Finales de pions : pions passés des deux camps (et cases clés des
  //    nôtres), pions adverses qu'aucun pion ne protège — les cibles du roi.
  const onlyPawnsAndKings = chess.board().flat().every((p) => !p || p.type === "p" || p.type === "k");
  if (onlyPawnsAndKings) {
    for (const pawn of chess.findPiece({ type: "p", color: me })) {
      if (!isPassed(chess, pawn, me)) continue;
      add(pawn, "pion_passe", true);
      for (const key of keySquares(pawn, me)) add(key, "case_cle");
    }
    for (const pawn of chess.findPiece({ type: "p", color: them })) {
      if (isPassed(chess, pawn, them)) add(pawn, "pion_passe", true);
      else if (!defendedByPawn(chess, pawn, them)) add(pawn, "non_defendue", true);
    }
  }

  // Aucun cœur (coup calme, zugzwang) : tout le contexte devient le cœur ;
  // et s'il n'y a rien du tout, le roi adverse, que tout le calcul vise.
  if (core.size === 0) for (const sq of found.keys()) core.add(sq);
  if (core.size === 0 && theirKing) add(theirKing, "case_cle", true);

  const squares = [...found.entries()].map(([sq, type]) => ({ case: sq, type }));
  return { squares, core: [...core], description: describe(chess, squares, them) };
}

const KIND_LABEL: Record<SkeletonKind, string> = {
  non_defendue: "pièce non défendue",
  roi_expose: "roi exposé",
  piece_clouee: "pièce clouée",
  ligne_de_force: "ligne de force",
  case_faible: "cible défendue mais surchargée",
  pion_passe: "pion passé / case de promotion",
  case_cle: "case clé",
};

function describe(chess: Chess, squares: readonly SkeletonSquare[], them: Color): string {
  if (squares.length === 0) return "Aucun élément statique : cherche le coup qui crée une menace.";
  const parts = squares.map(({ case: sq, type }) => {
    const piece = chess.get(sq as Square);
    const who = piece ? `${PIECE_NAME[piece.type]} ${COLOR_NAME[piece.color]} en ${sq}` : `case ${sq}`;
    return `${KIND_LABEL[type]} : ${who}`;
  });
  return `Camp adverse : ${COLOR_NAME[them]}s. ${parts.join(" ; ")}.`;
}

export interface SkeletonScore {
  ok: boolean;
  hits: string[];
  missedCore: string[];
  wrong: string[];
  precision: number;
}

/** Précision minimale du marquage : au moins une case sur deux désignées doit appartenir au squelette. */
export const SKELETON_MIN_PRECISION = 0.5;

/**
 * Note le squelette désigné par l'utilisateur : réussi s'il contient au moins
 * une case cœur ET si au moins la moitié de ses cases sont justes — marquer
 * tout l'échiquier ne passe pas.
 */
export function scoreSkeleton(expected: readonly SkeletonSquare[], core: readonly string[], marked: readonly string[]): SkeletonScore {
  const expectedSet = new Set(expected.map((s) => s.case));
  const unique = [...new Set(marked)];
  const hits = unique.filter((sq) => expectedSet.has(sq));
  const wrong = unique.filter((sq) => !expectedSet.has(sq));
  const missedCore = core.filter((sq) => !unique.includes(sq));
  const precision = unique.length === 0 ? 0 : hits.length / unique.length;
  const coreHit = core.some((sq) => unique.includes(sq));
  return { ok: coreHit && precision >= SKELETON_MIN_PRECISION, hits, missedCore, wrong, precision };
}
