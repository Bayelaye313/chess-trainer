/**
 * Classification des MATS NOMMÉS à partir de la position finale.
 *
 * Pourquoi : l'académie compte trente thèmes de mat — couloir, Anastasia,
 * arabe, Boden, étouffé, Opéra, Lolli… — et aucune banque de puzzles publique
 * ne les distingue tous. Lichess taggue une dizaine de ces motifs
 * (`arabianMate`, `bodenMate`, `smotheredMate`…) et s'arrête là : un mat de
 * Pillsbury ou de Cozio y est simplement `mate`. Sans ce module, vingt de nos
 * trente thèmes de mat n'auraient donc pas de critère de sélection propre — et
 * c'est exactement ce qui avait conduit, dans la version précédente, à écrire
 * une FEN à la main par thème puis à la faire tourner trente fois.
 *
 * Ce que ce module fait : il regarde la position APRÈS le coup de mat et décrit
 * sa géométrie — qui donne l'échec, qui garde les cases de fuite, quelles cases
 * autour du roi sont bouchées par ses PROPRES pièces, où est le roi sur
 * l'échiquier. Un mat nommé n'est rien d'autre que la récurrence d'une de ces
 * configurations.
 *
 * Deux familles de critères, et le docstring de chaque détecteur dit laquelle :
 *
 *  - GÉOMÉTRIQUE — le motif a une forme non ambiguë qu'on vérifie case par case
 *    (étouffé, couloir, épaulette, arabe, crochet, queue d'aronde…).
 *  - SIGNATURE MATÉRIELLE — le nom désigne d'abord un matériel et une manière
 *    de l'employer, pas une figure unique (mat de la boîte, deux tours, dame et
 *    tour, roi et dame). On exige alors le matériel exact plus le mat sur le
 *    bord, ce qui suffit à ne sélectionner que de vrais exemples du thème.
 *
 * Assumé, comme pour `motifs/` et `structures.ts` : c'est de la reconnaissance
 * de forme. Un mat peut satisfaire plusieurs motifs à la fois (bien des mats de
 * l'Opéra sont aussi des mats du couloir) — `describeMatePatterns` les renvoie
 * TOUS, sans trancher entre eux. Utilisé aujourd'hui comme filet de
 * vérification (voir `core/curriculum/master-puzzles-dataset.ts` et son test) :
 * chaque position de mat composée à la main y est confrontée au motif que son
 * thème annonce, recalculé plutôt que déclaré.
 */
import { Chess, type Color, type PieceSymbol, type Square } from "chess.js";
import { KING_OFFSETS, fileOf, rankOf, squareAt } from "./squares";

export const MATE_PATTERNS = [
  "back_rank",
  "ladder",
  "anastasia",
  "arabian",
  "boden",
  "damiano",
  "damiano_bishop",
  "blackburne",
  "epaulette",
  "greco",
  "hook",
  "legall",
  "lolli",
  "morphy",
  "opera",
  "pillsbury",
  "reti",
  "smothered",
  "dovetail",
  "cozio",
  "vukovic",
  "double_bishop",
  "box",
  "triangle",
  "queen_rook",
  "two_rooks",
  "king_queen",
  "max_lange",
  "net",
] as const;

export type MatePattern = (typeof MATE_PATTERNS)[number];

interface AdjacentSquare {
  square: Square;
  /** Occupée par une pièce du camp maté (`own`), du camp qui mate (`enemy`), ou vide. */
  occupant: "own" | "enemy" | null;
}

/** La position de mat décortiquée une seule fois, puis interrogée par tous les détecteurs. */
export interface MateShape {
  board: Chess;
  /** Camp maté / camp qui mate. */
  loser: Color;
  winner: Color;
  king: Square;
  /** Les pièces du camp gagnant qui donnent échec. */
  checkers: { square: Square; type: PieceSymbol }[];
  /** Les huit voisines du roi présentes sur l'échiquier. */
  adjacent: AdjacentSquare[];
  /** Voisines bouchées par les propres pièces du roi — l'ingrédient de la plupart des mats nommés. */
  ownBlockers: Square[];
  /** Cases du camp gagnant, par type de pièce. */
  winnerPieces: Record<PieceSymbol, Square[]>;
  onEdge: boolean;
  inCorner: boolean;
}

function emptyPieceMap(): Record<PieceSymbol, Square[]> {
  return { p: [], n: [], b: [], r: [], q: [], k: [] };
}

/**
 * Décortique une position matée. Renvoie `null` si la position n'est pas un mat
 * — tous les détecteurs partent de là, aucun ne raisonne sur une position que
 * le camp au trait pourrait encore sauver.
 */
export function analyseMate(fen: string): MateShape | null {
  let board: Chess;
  try {
    board = new Chess(fen);
  } catch {
    return null;
  }
  if (!board.isCheckmate()) return null;

  const loser = board.turn();
  const winner: Color = loser === "w" ? "b" : "w";

  const winnerPieces = emptyPieceMap();
  let king: Square | null = null;
  for (const row of board.board()) {
    for (const cell of row) {
      if (!cell) continue;
      if (cell.color === winner) winnerPieces[cell.type].push(cell.square);
      else if (cell.type === "k") king = cell.square;
    }
  }
  if (!king) return null;

  const checkers = board.attackers(king, winner).map((square) => ({
    square,
    type: board.get(square)!.type,
  }));

  const adjacent: AdjacentSquare[] = [];
  const ownBlockers: Square[] = [];
  for (const [df, dr] of KING_OFFSETS) {
    const square = squareAt(fileOf(king) + df, rankOf(king) + dr);
    if (!square) continue;
    const piece = board.get(square);
    const occupant = piece ? (piece.color === loser ? "own" : "enemy") : null;
    adjacent.push({ square, occupant });
    if (occupant === "own") ownBlockers.push(square);
  }

  const file = fileOf(king);
  const rank = rankOf(king);
  const onEdge = file === 0 || file === 7 || rank === 0 || rank === 7;
  const inCorner = (file === 0 || file === 7) && (rank === 0 || rank === 7);

  return { board, loser, winner, king, checkers, adjacent, ownBlockers, winnerPieces, onEdge, inCorner };
}

// ---------------------------------------------------------------------------
// Aides communes
// ---------------------------------------------------------------------------

/** L'unique pièce qui donne échec, ou `null` s'il y a échec double. */
function soleChecker(shape: MateShape): { square: Square; type: PieceSymbol } | null {
  return shape.checkers.length === 1 ? shape.checkers[0] : null;
}

function hasCheckerOfType(shape: MateShape, type: PieceSymbol): { square: Square; type: PieceSymbol } | null {
  return shape.checkers.find((checker) => checker.type === type) ?? null;
}

/** Vrai si la case touche le roi (les huit voisines). */
function isAdjacentToKing(shape: MateShape, square: Square): boolean {
  return Math.abs(fileOf(square) - fileOf(shape.king)) <= 1 && Math.abs(rankOf(square) - rankOf(shape.king)) <= 1;
}

/** Nombre de voisines VIDES du roi tenues par une pièce du type donné. */
function emptyEscapesCoveredBy(shape: MateShape, type: PieceSymbol): number {
  const posts = shape.winnerPieces[type];
  if (posts.length === 0) return 0;
  let covered = 0;
  for (const { square, occupant } of shape.adjacent) {
    if (occupant !== null) continue;
    if (shape.board.attackers(square, shape.winner).some((attacker) => posts.includes(attacker))) covered += 1;
  }
  return covered;
}

/** Vrai si une pièce du camp gagnant, du type donné, défend `square`. */
function defendedBy(shape: MateShape, square: Square, type: PieceSymbol): boolean {
  const posts = shape.winnerPieces[type];
  return shape.board.attackers(square, shape.winner).some((attacker) => posts.includes(attacker));
}

function countWinner(shape: MateShape, type: PieceSymbol): number {
  return shape.winnerPieces[type].length;
}

/** Le camp gagnant n'a que son roi et exactement le matériel listé. */
function winnerHasOnly(shape: MateShape, material: Partial<Record<PieceSymbol, number>>): boolean {
  const types: PieceSymbol[] = ["p", "n", "b", "r", "q"];
  return types.every((type) => countWinner(shape, type) === (material[type] ?? 0));
}

/** Case du fou : deux fous sur des cases de couleur opposée balaient tout l'échiquier. */
function isLight(square: Square): boolean {
  return (fileOf(square) + rankOf(square)) % 2 === 1;
}

const LONG_DIAGONAL_OFFSET = (square: Square) => Math.abs(fileOf(square) - rankOf(square));

/** Sur une des deux grandes diagonales (a1-h8 ou h1-a8). */
function onLongDiagonal(square: Square): boolean {
  return LONG_DIAGONAL_OFFSET(square) === 0 || fileOf(square) + rankOf(square) === 7;
}

// ---------------------------------------------------------------------------
// Détecteurs — géométriques
// ---------------------------------------------------------------------------

/** GÉOMÉTRIQUE. Roi sur sa rangée de fond, muré par ses propres pièces, mat d'une lourde sur cette rangée. */
export function isBackRankMate(shape: MateShape): boolean {
  const homeRank = shape.loser === "w" ? 0 : 7;
  if (rankOf(shape.king) !== homeRank) return false;

  const checker = shape.checkers.find((c) => c.type === "r" || c.type === "q");
  if (!checker || rankOf(checker.square) !== homeRank) return false;

  // Au moins une des trois cases devant le roi bouchée par son propre camp.
  const forward = shape.loser === "w" ? 1 : -1;
  return shape.adjacent.some(
    ({ square, occupant }) => occupant === "own" && rankOf(square) === homeRank + forward,
  );
}

/**
 * GÉOMÉTRIQUE. Mat de l'escalier : deux pièces lourdes repoussent le roi sur le
 * bord, l'une matant sur sa rangée, l'autre lui interdisant la précédente. Le
 * roi n'a AUCUNE pièce à lui autour — sinon c'est un couloir, pas un escalier.
 */
export function isLadderMate(shape: MateShape): boolean {
  if (!shape.onEdge) return false;
  if (shape.ownBlockers.length > 0) return false;

  const heavy = [...shape.winnerPieces.r, ...shape.winnerPieces.q];
  if (heavy.length < 2) return false;

  const checker = shape.checkers.find((c) => c.type === "r" || c.type === "q");
  if (!checker) return false;

  // La seconde lourde couvre la rangée (ou la colonne) de repli du roi.
  const kingRank = rankOf(shape.king);
  const kingFile = fileOf(shape.king);
  return heavy.some((square) => {
    if (square === checker.square) return false;
    return Math.abs(rankOf(square) - kingRank) === 1 || Math.abs(fileOf(square) - kingFile) === 1;
  });
}

/** GÉOMÉTRIQUE. Mat étouffé : cavalier, et toutes les voisines du roi occupées par SON camp. */
export function isSmotheredMate(shape: MateShape): boolean {
  const checker = soleChecker(shape);
  if (!checker || checker.type !== "n") return false;
  return shape.adjacent.every(({ occupant }) => occupant === "own");
}

/**
 * GÉOMÉTRIQUE. Mat arabe : tour collée au roi dans le coin, défendue par un
 * cavalier qui condamne en même temps la fuite en diagonale.
 */
export function isArabianMate(shape: MateShape): boolean {
  if (!shape.inCorner) return false;
  const checker = soleChecker(shape);
  if (!checker || checker.type !== "r") return false;
  if (!isAdjacentToKing(shape, checker.square)) return false;
  if (countWinner(shape, "n") === 0) return false;
  return defendedBy(shape, checker.square, "n") && emptyEscapesCoveredBy(shape, "n") >= 1;
}

/**
 * GÉOMÉTRIQUE. Mat du crochet : tour au contact du roi, défendue par un
 * cavalier, lui-même défendu par un PION — les trois maillons du crochet.
 */
export function isHookMate(shape: MateShape): boolean {
  const checker = soleChecker(shape);
  if (!checker || checker.type !== "r") return false;
  if (!isAdjacentToKing(shape, checker.square)) return false;
  if (!defendedBy(shape, checker.square, "n")) return false;
  return shape.winnerPieces.n.some((knight) => defendedBy(shape, knight, "p"));
}

/**
 * GÉOMÉTRIQUE. Mat de Vukovic : tour au contact sur le bord, gardée par une
 * pièce AUTRE que le cavalier, celui-ci se chargeant des cases de fuite. C'est
 * ce partage des rôles qui le sépare du mat arabe, où le cavalier fait les deux.
 */
export function isVukovicMate(shape: MateShape): boolean {
  if (!shape.onEdge) return false;
  const checker = soleChecker(shape);
  if (!checker || checker.type !== "r") return false;
  if (!isAdjacentToKing(shape, checker.square)) return false;
  if (countWinner(shape, "n") === 0) return false;
  if (emptyEscapesCoveredBy(shape, "n") < 1) return false;
  return !defendedBy(shape, checker.square, "n") && shape.board.attackers(checker.square, shape.winner).length > 0;
}

/**
 * GÉOMÉTRIQUE. Mat d'Anastasia : cavalier et lourde en tenaille — le cavalier
 * ôte deux cases au roi acculé au bord, la tour mate sur la colonne (ou la
 * rangée) du bord.
 */
export function isAnastasiaMate(shape: MateShape): boolean {
  if (!shape.onEdge) return false;
  const checker = shape.checkers.find((c) => c.type === "r" || c.type === "q");
  if (!checker) return false;
  if (countWinner(shape, "n") === 0) return false;
  if (emptyEscapesCoveredBy(shape, "n") < 2) return false;
  return shape.ownBlockers.length >= 1;
}

/**
 * GÉOMÉTRIQUE. Mat de Boden : les deux fous se croisent sur un roi enfermé par
 * ses propres pièces — la figure du roque long massacré.
 */
export function isBodenMate(shape: MateShape): boolean {
  if (countWinner(shape, "b") < 2) return false;
  const checker = soleChecker(shape);
  if (!checker || checker.type !== "b") return false;
  if (shape.ownBlockers.length < 2) return false;
  // Fous sur des complexes opposés : c'est le croisement qui fait le motif.
  const [first, second] = shape.winnerPieces.b;
  if (isLight(first) === isLight(second)) return false;
  return emptyEscapesCoveredBy(shape, "b") >= 1;
}

/** GÉOMÉTRIQUE. Mat des deux fous : les deux fous seuls, sur un roi acculé au bord et sans écran. */
export function isDoubleBishopMate(shape: MateShape): boolean {
  if (countWinner(shape, "b") < 2) return false;
  const checker = soleChecker(shape);
  if (!checker || checker.type !== "b") return false;
  if (!shape.onEdge) return false;
  if (shape.ownBlockers.length > 1) return false;
  return emptyEscapesCoveredBy(shape, "b") >= 1;
}

/** GÉOMÉTRIQUE. Mat de Blackburne : les deux fous ET le cavalier, sur un roi encore entouré des siens. */
export function isBlackburneMate(shape: MateShape): boolean {
  if (countWinner(shape, "b") < 2 || countWinner(shape, "n") === 0) return false;
  const checker = soleChecker(shape);
  if (!checker || checker.type !== "b") return false;
  if (shape.ownBlockers.length < 1) return false;
  return emptyEscapesCoveredBy(shape, "n") >= 1;
}

/** GÉOMÉTRIQUE. Mat de Legall : c'est le CAVALIER qui mate, les deux fous fermant les issues. */
export function isLegallMate(shape: MateShape): boolean {
  const checker = soleChecker(shape);
  if (!checker || checker.type !== "n") return false;
  if (countWinner(shape, "b") < 2) return false;
  return emptyEscapesCoveredBy(shape, "b") >= 1;
}

/**
 * GÉOMÉTRIQUE. Mat de l'épaulette : le roi est bloqué par ses deux propres
 * pièces DE PART ET D'AUTRE sur sa rangée — ses épaulettes — et prend le mat de
 * face.
 */
export function isEpauletteMate(shape: MateShape): boolean {
  const checker = shape.checkers.find((c) => c.type === "q" || c.type === "r");
  if (!checker) return false;

  const rank = rankOf(shape.king);
  const file = fileOf(shape.king);
  const left = squareAt(file - 1, rank);
  const right = squareAt(file + 1, rank);
  if (!left || !right) return false;

  const isOwn = (square: Square) => shape.board.get(square)?.color === shape.loser;
  return isOwn(left) && isOwn(right);
}

/**
 * GÉOMÉTRIQUE. Queue d'aronde : la dame colle le roi, dont les deux fuites sont
 * bouchées par ses propres pièces posées EN DIAGONALE derrière lui — d'où la
 * silhouette en queue d'hirondelle.
 *
 * Plusieurs auteurs appellent « mat de Cozio » cette même figure ; on les
 * sépare ici par l'orientation des deux bloqueurs — diagonale pour la queue
 * d'aronde, colonne pour Cozio — plutôt que de faire porter deux thèmes du
 * catalogue sur des positions indiscernables.
 */
export function isDovetailMate(shape: MateShape): boolean {
  const checker = soleChecker(shape);
  if (!checker || checker.type !== "q") return false;
  if (!isAdjacentToKing(shape, checker.square)) return false;
  if (shape.ownBlockers.length !== 2) return false;
  return shape.ownBlockers.every(
    (square) => fileOf(square) !== fileOf(shape.king) && rankOf(square) !== rankOf(shape.king),
  );
}

/** GÉOMÉTRIQUE. Mat de Cozio : même dame au contact, mais les deux bloqueurs sont alignés sur la COLONNE du roi. */
export function isCozioMate(shape: MateShape): boolean {
  const checker = soleChecker(shape);
  if (!checker || checker.type !== "q") return false;
  if (!isAdjacentToKing(shape, checker.square)) return false;
  if (shape.ownBlockers.length !== 2) return false;
  return shape.ownBlockers.every((square) => fileOf(square) === fileOf(shape.king));
}

/** GÉOMÉTRIQUE. Mat de Damiano : la dame mate au contact, adossée à un PION qui la défend. */
export function isDamianoMate(shape: MateShape): boolean {
  const checker = soleChecker(shape);
  if (!checker || checker.type !== "q") return false;
  if (!isAdjacentToKing(shape, checker.square)) return false;
  return defendedBy(shape, checker.square, "p");
}

/** GÉOMÉTRIQUE. Mat du fou de Damiano : la même dame au contact, défendue cette fois par un FOU. */
export function isDamianoBishopMate(shape: MateShape): boolean {
  const checker = soleChecker(shape);
  if (!checker || checker.type !== "q") return false;
  if (!isAdjacentToKing(shape, checker.square)) return false;
  if (defendedBy(shape, checker.square, "p")) return false; // c'est alors un Damiano ordinaire
  return defendedBy(shape, checker.square, "b");
}

/** GÉOMÉTRIQUE. Mat de Lolli : dame en g7/g2 épaulée par le pion f6/f3, sur un roque fianchetté éventré. */
export function isLolliMate(shape: MateShape): boolean {
  const checker = soleChecker(shape);
  if (!checker || checker.type !== "q") return false;

  const knightFile = 6; // colonne g
  if (fileOf(checker.square) !== knightFile) return false;
  const expectedRank = shape.loser === "b" ? 6 : 1;
  if (rankOf(checker.square) !== expectedRank) return false;
  return defendedBy(shape, checker.square, "p");
}

/** GÉOMÉTRIQUE. Mat de Greco : dame sur la colonne du bord, appuyée par un fou, roi muré par son propre pion. */
export function isGrecoMate(shape: MateShape): boolean {
  const checker = soleChecker(shape);
  if (!checker || checker.type !== "q") return false;
  const file = fileOf(checker.square);
  if (file !== 0 && file !== 7) return false;
  if (countWinner(shape, "b") === 0) return false;
  if (!defendedBy(shape, checker.square, "b") && emptyEscapesCoveredBy(shape, "b") === 0) return false;
  return shape.ownBlockers.some((square) => shape.board.get(square)?.type === "p");
}

/**
 * GÉOMÉTRIQUE. Mat de l'Opéra : la tour mate sur la rangée du fond, APPUYÉE PAR
 * UN FOU — c'est ce soutien qui distingue la figure de Morphy d'un mat du
 * couloir ordinaire, où la tour est seule et le roi enfermé par ses pions.
 *
 * Le fou n'est délibérément pas exigé sur une grande diagonale : dans la partie
 * qui donne son nom au motif (Morphy contre le duc de Brunswick, Paris 1858),
 * il est en g5 et soutient la tour depuis la diagonale c1-h6. Poser la grande
 * diagonale en condition écartait donc l'exemple canonique du thème.
 */
export function isOperaMate(shape: MateShape): boolean {
  const checker = soleChecker(shape);
  if (!checker || checker.type !== "r") return false;
  const homeRank = shape.loser === "w" ? 0 : 7;
  if (rankOf(checker.square) !== homeRank) return false;
  return defendedBy(shape, checker.square, "b");
}

/**
 * GÉOMÉTRIQUE. Mat de Pillsbury : tour sur la colonne g, fou de la grande
 * diagonale condamnant le coin.
 *
 * Seul détecteur à ne pas exiger un échec UNIQUE : dans la figure de Pillsbury,
 * le fou de la grande diagonale bat très souvent le roi en même temps que la
 * tour. Exiger l'échec simple reviendrait à ne reconnaître que les positions où
 * le fou est accessoire, c'est-à-dire justement pas des mats de Pillsbury.
 */
export function isPillsburyMate(shape: MateShape): boolean {
  const checker = hasCheckerOfType(shape, "r");
  if (!checker) return false;
  if (fileOf(checker.square) !== 6) return false;
  if (countWinner(shape, "b") === 0) return false;
  return shape.winnerPieces.b.some((square) => onLongDiagonal(square));
}

/** GÉOMÉTRIQUE. Mat de Morphy : c'est le FOU de la grande diagonale qui mate, une tour verrouillant la fuite. */
export function isMorphyMate(shape: MateShape): boolean {
  const checker = soleChecker(shape);
  if (!checker || checker.type !== "b") return false;
  if (!onLongDiagonal(checker.square)) return false;
  if (countWinner(shape, "r") === 0) return false;
  return emptyEscapesCoveredBy(shape, "r") >= 1;
}

/** GÉOMÉTRIQUE. Mat de Réti : fou matant un roi emmuré dans ses propres pièces, une lourde fermant la dernière issue. */
export function isRetiMate(shape: MateShape): boolean {
  const checker = soleChecker(shape);
  if (!checker || checker.type !== "b") return false;
  if (shape.ownBlockers.length < 2) return false;
  return emptyEscapesCoveredBy(shape, "r") + emptyEscapesCoveredBy(shape, "q") >= 1;
}

/** GÉOMÉTRIQUE. Mat de Max Lange : dame au contact soutenue par un fou, roi coincé par ses pièces sur sa rangée. */
export function isMaxLangeMate(shape: MateShape): boolean {
  const checker = soleChecker(shape);
  if (!checker || checker.type !== "q") return false;
  if (!isAdjacentToKing(shape, checker.square)) return false;
  if (!defendedBy(shape, checker.square, "b")) return false;
  return shape.ownBlockers.some((square) => rankOf(square) === rankOf(shape.king));
}

/**
 * GÉOMÉTRIQUE. Mat du triangle : la dame mate à distance sur la rangée ou la
 * colonne du roi, une tour la défendant depuis la même ligne — les trois pièces
 * dessinent le triangle.
 */
export function isTriangleMate(shape: MateShape): boolean {
  const checker = soleChecker(shape);
  if (!checker || checker.type !== "q") return false;
  if (isAdjacentToKing(shape, checker.square)) return false;
  const aligned =
    fileOf(checker.square) === fileOf(shape.king) || rankOf(checker.square) === rankOf(shape.king);
  if (!aligned) return false;
  return defendedBy(shape, checker.square, "r");
}

/**
 * GÉOMÉTRIQUE. Mat du filet : le roi est pris en plein échiquier — ni bord, ni
 * pièce à lui pour l'entourer. Toutes ses cases sont tenues, c'est le filet qui
 * se referme.
 */
export function isNetMate(shape: MateShape): boolean {
  if (shape.onEdge) return false;
  if (shape.ownBlockers.length > 0) return false;
  return shape.adjacent.length === 8;
}

// ---------------------------------------------------------------------------
// Détecteurs — signature matérielle
// ---------------------------------------------------------------------------

/** SIGNATURE MATÉRIELLE. Mat de la boîte : roi et tour seuls contre le roi nu, acculé au bord. */
export function isBoxMate(shape: MateShape): boolean {
  return winnerHasOnly(shape, { r: 1 }) && shape.ownBlockers.length === 0 && shape.onEdge;
}

/** SIGNATURE MATÉRIELLE. Roi et dame contre roi nu — le mat élémentaire, sur le bord. */
export function isKingQueenMate(shape: MateShape): boolean {
  return winnerHasOnly(shape, { q: 1 }) && shape.ownBlockers.length === 0 && shape.onEdge;
}

/** SIGNATURE MATÉRIELLE. Les deux tours seules, sans dame — le mat en tenaille. */
export function isTwoRooksMate(shape: MateShape): boolean {
  return winnerHasOnly(shape, { r: 2 }) && shape.onEdge;
}

/** SIGNATURE MATÉRIELLE. Dame et tour ensemble, toutes deux à l'ouvrage sur le roi. */
export function isQueenRookMate(shape: MateShape): boolean {
  if (countWinner(shape, "q") === 0 || countWinner(shape, "r") === 0) return false;
  const checker = shape.checkers.find((c) => c.type === "q" || c.type === "r");
  if (!checker) return false;
  // L'AUTRE lourde participe : elle garde au moins une case de fuite.
  const partner = checker.type === "q" ? "r" : "q";
  return emptyEscapesCoveredBy(shape, partner) >= 1 || defendedBy(shape, checker.square, partner);
}

// ---------------------------------------------------------------------------
// Façade
// ---------------------------------------------------------------------------

const DETECTORS: Record<MatePattern, (shape: MateShape) => boolean> = {
  back_rank: isBackRankMate,
  ladder: isLadderMate,
  anastasia: isAnastasiaMate,
  arabian: isArabianMate,
  boden: isBodenMate,
  damiano: isDamianoMate,
  damiano_bishop: isDamianoBishopMate,
  blackburne: isBlackburneMate,
  epaulette: isEpauletteMate,
  greco: isGrecoMate,
  hook: isHookMate,
  legall: isLegallMate,
  lolli: isLolliMate,
  morphy: isMorphyMate,
  opera: isOperaMate,
  pillsbury: isPillsburyMate,
  reti: isRetiMate,
  smothered: isSmotheredMate,
  dovetail: isDovetailMate,
  cozio: isCozioMate,
  vukovic: isVukovicMate,
  double_bishop: isDoubleBishopMate,
  box: isBoxMate,
  triangle: isTriangleMate,
  queen_rook: isQueenRookMate,
  two_rooks: isTwoRooksMate,
  king_queen: isKingQueenMate,
  max_lange: isMaxLangeMate,
  net: isNetMate,
};

/**
 * Tous les motifs que reconnaît cette position matée, dans l'ordre de
 * `MATE_PATTERNS`. Volontairement pluriel : les mats nommés se recouvrent, et
 * masquer ce recouvrement derrière un classement unique reviendrait à décider
 * arbitrairement qu'un mat de l'Opéra n'est « pas » un mat du couloir. Le
 * sélecteur attribue ensuite la position au thème qui en manque le plus.
 */
export function describeMatePatterns(fen: string): MatePattern[] {
  const shape = analyseMate(fen);
  if (!shape) return [];
  return MATE_PATTERNS.filter((pattern) => DETECTORS[pattern](shape));
}

/** Variante sans re-parsing, pour l'ingestion qui a déjà la position matée sous la main. */
export function describeShapePatterns(shape: MateShape): MatePattern[] {
  return MATE_PATTERNS.filter((pattern) => DETECTORS[pattern](shape));
}
