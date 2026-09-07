/**
 * Message du Coach affiché AVANT que le joueur ne cherche le coup — la partie
 * manquante de « Humanized Coaching » (CLAUDE.md) côté puzzles.
 *
 * Retour utilisateur direct : « on résout un puzzle sans savoir c'est quoi la
 * faiblesse ou l'opportunité présentée ». Jusqu'ici `PuzzleBoard` ne montrait
 * qu'une position nue — ce module nomme, en une phrase, ce que le coup adverse
 * vient de créer et ce qu'il faut y chercher, avant la recherche plutôt
 * qu'après le coup (voir `core/analysis/coach-narrative.ts`, son pendant côté
 * Revue de partie, qui commente APRÈS coup).
 *
 * Pur, testable indépendamment de React — même esprit que
 * `coach-narrative.ts` : le domaine (`core/`) ne connaît que le vocabulaire
 * anglais stable des motifs (`Motif`), la traduction française vit ici en
 * dur, comme dans `coach-narrative.ts#MOTIF_NAME` (jamais `lib/labels.ts`,
 * que `core/` ne doit pas dépendre).
 */
import type { Motif } from "../chess/types";

export interface PreSolveCoachInput {
  /** SAN du coup adverse qui a mené à la position du puzzle — `null` si inconnu (tout premier coup d'une partie, ou puzzle sans historique). */
  setupSan: string | null;
  /** Motifs exploités par la solution (`puzzles.motifs`, voir `core/chess/motifs`). */
  motifs: readonly Motif[];
  /** Nombre de coups DU JOUEUR à trouver (plis pairs de `solution`) — > 1 signale une suite à enchaîner, pas un coup isolé. */
  playerMoveCount: number;
}

const MOTIF_HINT: Record<Motif, string> = {
  fork: "une fourchette",
  pin: "un clouage",
  skewer: "une enfilade",
  discovered_attack: "une attaque à la découverte",
  back_rank_mate: "un mat du couloir",
  hanging_piece: "une pièce en prise",
};

/**
 * Construit le message, toujours non vide : au minimum une invite à jouer,
 * enrichie du coup adverse et/ou du motif quand ils sont connus.
 */
export function buildPreSolveCoachMessage({ setupSan, motifs, playerMoveCount }: PreSolveCoachInput): string {
  const parts: string[] = [];

  if (setupSan) parts.push(`L'adversaire vient de jouer ${setupSan}.`);

  if (motifs.length > 0) {
    const named = motifs.map((motif) => MOTIF_HINT[motif]).join(" et ");
    parts.push(`Cherche ${named}.`);
  } else {
    parts.push(playerMoveCount > 1 ? "Trouve la suite gagnante." : "Trouve le meilleur coup.");
  }

  if (playerMoveCount > 1) parts.push(`(${playerMoveCount} coups à enchaîner.)`);

  return parts.join(" ");
}
