/**
 * Détection des motifs tactiques exploités par un coup.
 *
 * Heuristique assumée : le but est d'étiqueter des puzzles pour que le joueur
 * révise par thème, pas de produire une preuve formelle. Un faux positif coûte
 * une étiquette approximative, pas une erreur d'analyse — l'évaluation, elle,
 * vient toujours du moteur.
 */
import { Chess, type Move } from "chess.js";
import type { Motif } from "../types";
import { isBackRankMate } from "./back-rank";
import { detectCaptureMotifs } from "./capture";
import { isDiscoveredAttack } from "./discovered-attack";
import { isFork } from "./fork";
import { isSkewer } from "./skewer";

export { isBackRankMate, detectCaptureMotifs, isDiscoveredAttack, isFork, isSkewer };

/**
 * Motifs exploités par `move`, dans l'ordre de détection et sans doublon.
 *
 * @param before position AVANT le coup
 * @param move   le coup, tel que renvoyé par chess.js
 * @param after  position APRÈS le coup
 */
export function detectMotifs(before: Chess, move: Move, after: Chess): Motif[] {
  const piece = before.get(move.from);
  if (!piece) return [];

  const { color } = piece;
  const motifs: Motif[] = [...detectCaptureMotifs(before, move, color)];

  if (isFork(after, move.to, color)) motifs.push("fork");
  if (isSkewer(after, move.to, piece.type, color)) motifs.push("skewer");
  if (isDiscoveredAttack(before, move, after, color)) motifs.push("discovered_attack");
  if (after.isCheckmate() && isBackRankMate(after)) motifs.push("back_rank_mate");

  return [...new Set(motifs)];
}
