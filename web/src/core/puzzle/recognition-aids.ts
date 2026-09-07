import { Chess, type Color } from "chess.js";
import type { Motif } from "@/core/chess/types";

export interface RecognitionAids {
  targetSquares: string[];
  inCheck: boolean;
  text: string;
}

const motifText: Partial<Record<Motif, string>> = {
  fork: "Cherche une pièce qui attaque deux cibles à la fois.",
  pin: "Cherche une pièce immobilisée devant le roi ou une pièce plus importante.",
  skewer: "Cherche une cible majeure qui doit bouger pour laisser une pièce derrière elle.",
  discovered_attack: "Cherche la ligne qui s'ouvre après le déplacement d'une pièce.",
  back_rank_mate: "Vérifie les cases de fuite autour du roi et la rangée du fond.",
  hanging_piece: "Commence par repérer la pièce adverse insuffisamment défendue.",
};

export function buildRecognitionAids(fen: string, playerColor: Color, motifs: readonly Motif[]): RecognitionAids {
  const board = new Chess(fen);
  const opponent: Color = playerColor === "w" ? "b" : "w";
  const targetSquares = board
    .board()
    .flatMap((rank) => rank.filter((piece) => piece?.color === opponent && piece.type !== "k" && board.attackers(piece.square, playerColor).length > 0).map((piece) => piece!.square));
  const inCheck = board.isCheck();
  const motif = motifs.find((candidate) => motifText[candidate]);
  const text = inCheck
    ? "Ton roi est en échec : commence par trouver une réponse légale."
    : motif
      ? motifText[motif]!
      : targetSquares.length > 0
        ? "Des cibles adverses sont attaquées : cherche le coup qui crée ou exploite cette tension."
        : "Observe les menaces adverses, les pièces non défendues et les lignes qui peuvent s'ouvrir.";
  return { targetSquares, inCheck, text };
}