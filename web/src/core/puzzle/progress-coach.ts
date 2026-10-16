/**
 * Le Coach EN COURS de résolution — cahier des charges du 2026-09-06 : « le
 * Coach reste bloqué sur un commentaire fixe au lieu de s'adapter
 * DYNAMIQUEMENT à chaque pli ». Jusqu'ici `pre-solve-coach.ts` ne parlait
 * qu'UNE fois, avant le tout premier coup ; ce module prend le relais après
 * CHAQUE coup correct du joueur jusqu'à la fin de la séquence, en lisant ce
 * que ce coup précis vient de changer sur l'échiquier — jamais un texte
 * générique répété.
 *
 * Pur, sans dépendance React — même esprit que `coach-narrative.ts` : lu par
 * `usePuzzleSolver`/`PuzzleBoard` (`client/features/board/`) à chaque coup
 * JOUEUR accepté (jamais sur les réponses adverses rejouées automatiquement,
 * scriptées et sans intérêt pédagogique propre).
 *
 * Ordre de priorité, la première heuristique qui matche l'emporte :
 * nulle atteinte > promotion imminente > colonne tout juste ouverte pour une
 * pièce lourde déjà en place > matériel net gagné par ce coup > repli
 * générique qui rappelle combien de plis restent à enchaîner.
 */
import { Chess, type PieceSymbol } from "chess.js";
import { PIECE_VALUE } from "../chess/pieces";
import { parsePosition, type ParsedPosition } from "../chess/structures";

export interface ProgressCoachInput {
  /** Position juste avant ce coup. */
  fenBefore: string;
  /** Position juste après ce coup (c'est elle qui est affichée à l'écran). */
  fenAfter: string;
  /** UCI du coup qui vient d'être joué (`solution[moveIndex]`, déjà validé). */
  lastMoveUci: string;
  playerColor: "w" | "b";
  /** Plis de solution restants APRÈS ce coup — `0` si c'était le dernier. */
  movesRemaining: number;
}

/** Balance matérielle du point de vue de `color` — pions compris, roi exclu (valeur nulle de toute façon dans `PIECE_VALUE` n'existe pas pour le roi ici). */
function materialBalance(position: ParsedPosition, color: "w" | "b"): number {
  const own: PieceSymbol[] = ["p", "n", "b", "r", "q"];
  let total = 0;
  for (const type of own) {
    const whiteLetter = type.toUpperCase();
    const blackLetter = type;
    const mine = position.counts[color === "w" ? whiteLetter : blackLetter] ?? 0;
    const theirs = position.counts[color === "w" ? blackLetter : whiteLetter] ?? 0;
    total += (mine - theirs) * PIECE_VALUE[type];
  }
  return total;
}

function isFileOpen(position: ParsedPosition, file: number): boolean {
  return position.pawns.w[file].length === 0 && position.pawns.b[file].length === 0;
}

/** Rang de promotion — l'AVANT-DERNIÈRE rangée pour le camp qui avance (7e pour Blanc, 2e pour Noir), 0-indexée comme `parsePosition`. */
function promotionEveRank(color: "w" | "b"): number {
  return color === "w" ? 6 : 1;
}

export function buildProgressCoachMessage(input: ProgressCoachInput): string | null {
  const { fenBefore, fenAfter, lastMoveUci, playerColor, movesRemaining } = input;

  const board = new Chess(fenAfter);
  if (board.isCheckmate()) return null; // Le statut "Puzzle résolu !" suffit — jamais doublé ici.
  if (board.isStalemate() || board.isDraw()) {
    return "🤝 Objectif atteint : la position est nulle — plus rien à forcer, sécurise-la.";
  }

  const before = parsePosition(fenBefore);
  const after = parsePosition(fenAfter);
  if (!before || !after) return genericEncouragement(movesRemaining);

  const fromFile = lastMoveUci.charCodeAt(0) - "a".charCodeAt(0);
  const toFile = lastMoveUci.charCodeAt(2) - "a".charCodeAt(0);
  const toRank = Number(lastMoveUci[3]) - 1;
  if (toFile < 0 || toFile > 7 || Number.isNaN(toRank)) return genericEncouragement(movesRemaining);

  const movedPiece = after.board[toRank]?.[toFile];
  const movedByPlayer = movedPiece != null && (playerColor === "w" ? movedPiece === movedPiece.toUpperCase() : movedPiece === movedPiece.toLowerCase());

  if (movedByPlayer && movedPiece?.toLowerCase() === "p" && toRank === promotionEveRank(playerColor)) {
    return "🚀 Le pion n'est plus qu'à un pas de la promotion — force le passage, l'adversaire ne peut plus l'arrêter indéfiniment !";
  }

  // Une colonne ne peut s'ouvrir que sur la colonne QUITTÉE par ce coup (une
  // poussée tout droit reste sur sa colonne, seule une capture en diagonale la
  // vide réellement) — jamais la colonne d'arrivée.
  if (movedByPlayer && fromFile >= 0 && fromFile <= 7 && !isFileOpen(before, fromFile) && isFileOpen(after, fromFile)) {
    const heavy = playerColor === "w" ? ["R", "Q"] : ["r", "q"];
    const hasHeavyOnFile = after.board.some((rank) => heavy.includes(rank[fromFile] ?? ""));
    if (hasHeavyOnFile) {
      return "📂 Excellent, la colonne vient de s'ouvrir : prépare l'infiltration de ta pièce lourde !";
    }
  }

  const materialSwing = materialBalance(after, playerColor) - materialBalance(before, playerColor);
  if (materialSwing >= 2) {
    return movesRemaining > 0
      ? "💰 Matériel gagné ! Continue la séquence, ta position est désormais gagnante."
      : "💰 Matériel gagné ! La position est complètement gagnante.";
  }

  return genericEncouragement(movesRemaining);
}

function genericEncouragement(movesRemaining: number): string {
  if (movesRemaining === 0) return "✅ Bien joué — c'est le dernier coup de la séquence.";
  return `👍 Bien joué, continue — encore ${movesRemaining} demi-coup${movesRemaining > 1 ? "s" : ""} avant la fin de la séquence.`;
}
