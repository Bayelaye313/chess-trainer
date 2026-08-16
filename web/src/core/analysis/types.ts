/**
 * Contrat d'analyse, indépendant du moteur.
 *
 * Tout ce qui consomme une évaluation passe par `PositionAnalyser`. Stockfish
 * WASM en est une implémentation ; un stub de test ou, demain, un service Maia
 * en sont d'autres. Le domaine ne connaît que cette interface.
 */
import type { GamePhase, GameResult, Motif, MoveQuality } from "../chess/types";

/** Score sentinelle d'un mat, aligné sur la convention python-chess. */
export const MATE_SCORE = 100_000;

/**
 * Évaluation d'une position, **toujours du point de vue des Blancs**.
 *
 * Le protocole UCI raisonne du point de vue du trait ; la normalisation se fait
 * dans l'adaptateur moteur, pas ici, pour que les comparaisons avant/après
 * soient directement possibles.
 */
export interface PositionEvaluation {
  /** Centipions, POV Blancs. `null` quand un mat est annoncé. */
  cp: number | null;
  /** Coups avant le mat, POV Blancs : positif = les Blancs matent. `null` sinon. */
  mate: number | null;
  /** Meilleur coup en notation UCI ("e2e4"), `null` si aucune ligne trouvée. */
  bestMoveUci: string | null;
  /** Variante principale, en UCI. */
  pv: string[];
  /** Profondeur effectivement atteinte. */
  depth: number;
  /**
   * Évaluation du deuxième meilleur coup (POV Blancs, même convention que
   * `cp`/`mate`), quand le moteur tourne avec MultiPV≥2. `null` si l'option
   * n'était pas active ou qu'aucun second coup légal distinct n'existait.
   * Sert uniquement à détecter les positions « critiques » — voir
   * `chess/classify.ts`.
   */
  secondBest: { cp: number | null; mate: number | null } | null;
}

export interface AnalysisLimit {
  depth?: number;
  /** Temps de réflexion en millisecondes. */
  movetimeMs?: number;
}

export interface PositionAnalyser {
  analyse(fen: string, limit: AnalysisLimit): Promise<PositionEvaluation>;
}

/**
 * Écrase l'évaluation en un scalaire comparable, POV Blancs.
 *
 * Un mat plus rapide vaut mieux qu'un mat lointain, d'où la décote par le
 * nombre de coups : mat en 1 = 99 999, mat en 5 = 99 995.
 */
export function toWhitePovScore(evaluation: PositionEvaluation): number | null {
  if (evaluation.mate !== null) {
    return evaluation.mate > 0
      ? MATE_SCORE - evaluation.mate
      : -MATE_SCORE - evaluation.mate;
  }
  return evaluation.cp;
}

/** Bascule un score POV Blancs vers le point de vue du camp qui joue. */
export function toMoverPov(whitePovScore: number, moverIsWhite: boolean): number {
  return moverIsWhite ? whitePovScore : -whitePovScore;
}

/** Nombre de coups avant mat du point de vue du camp qui joue. */
export function moverPovMate(
  evaluation: PositionEvaluation,
  moverIsWhite: boolean,
): number | null {
  if (evaluation.mate === null) return null;
  return moverIsWhite ? evaluation.mate : -evaluation.mate;
}

/**
 * Entrées de `aggregatePlayerProgress` (voir `progress-insights.ts`), l'onglet
 * « Rapport ». Volontairement distinctes de `AnalysedPly`/`TimelinePly`
 * (`timeline.ts`) : ce module a besoin de `fenBefore`/`uci` pour rejouer un
 * coup et vérifier les pièces en prise (axe 4), que `AnalysedPly` ne porte
 * pas — pas de raison d'alourdir ce dernier pour un besoin qui lui est propre.
 */
export interface PlayerMoveRecord {
  /** Position avant le coup — permet de rejouer le coup joué (axe « pièces en prise »). */
  fenBefore: string;
  /** Coup joué, en UCI. */
  uci: string;
  quality: MoveQuality;
  phase: GamePhase;
  /** Motifs exploités par le MEILLEUR coup à cette position (voir `detectMotifs`). */
  motifs: Motif[];
  /** Le coup joué a-t-il effectivement exploité ces motifs (coup joué = meilleur coup) ? */
  motifFound: boolean;
  /** Coup du joueur suivi, par opposition à l'adversaire — jamais compté dans son propre profil. */
  byPlayer: boolean;
}

/** Une partie et ses coups analysés, entrée de `aggregatePlayerProgress`. */
export interface PlayerGameRecord {
  /** Code ECO de l'ouverture, `null` si la partie n'a pas encore été catégorisée (voir `games.eco`). */
  eco: string | null;
  /**
   * Nom de l'ouverture assorti à `eco` (voir `games.openingName`), déjà résolu
   * à l'import par `findBookMove` (`server/import/openings.ts`). Reçu tel
   * quel plutôt que recalculé ici : `core/` ne dépend que de `chess.js`, la
   * résolution FEN → nom d'ouverture reste du ressort de la couche serveur.
   */
  openingName: string | null;
  result: GameResult | null;
  playerColor: "w" | "b";
  moves: PlayerMoveRecord[];
}

/** Précision moyenne (voir `computeAccuracy`, `timeline.ts`) sur les coups d'une phase de jeu. */
export interface PhaseAccuracy {
  phase: GamePhase;
  movesAnalysed: number;
  /** `null` si aucun coup analysé dans cette phase. */
  accuracy: number | null;
}

/** Motifs tactiques comptés « trouvé / manqué » à l'onglet Rapport — un sous-ensemble de `Motif`. */
export type TrackedTacticalMotif = "fork" | "pin";

export interface TacticalMotifStats {
  motif: TrackedTacticalMotif;
  /** Le meilleur coup exploitait ce motif, et le joueur l'a joué. */
  found: number;
  /** Le meilleur coup exploitait ce motif, mais le joueur a joué autre chose. */
  missed: number;
  /** `found / (found + missed)` en %, `null` si aucune occasion rencontrée. */
  successRate: number | null;
}

/** Bilan du joueur sur une ouverture (code ECO), agrégé sur toutes ses parties. */
export interface OpeningPerformance {
  eco: string;
  /**
   * Nom lisible de l'ouverture — le plus fréquent parmi les parties de ce
   * code ECO (voir `UNKNOWN_OPENING_NAME` si aucune partie du groupe n'a de
   * nom connu). Un même code ECO peut en théorie regrouper plusieurs familles
   * distinctes qui transposent à la même profondeur ; ce nom n'est donc
   * représentatif que de CE joueur, pas une vérité générale sur le code.
   */
  name: string;
  gamesPlayed: number;
  wins: number;
  /** `wins / gamesPlayed` en %. */
  winRate: number;
  /** Précision moyenne du joueur dans les parties de cette ouverture, `null` si aucun coup analysé. */
  accuracy: number | null;
}

/** Gaffes ('blunder') où le coup joué a laissé au moins une pièce attaquée sans reprise légale. */
export interface HangingPieceStats {
  blunderCount: number;
  /** Total des gaffes du joueur analysées, pour resituer `blunderCount` en proportion. */
  totalBlunders: number;
}

/** Profil de faiblesses du joueur — sortie de `aggregatePlayerProgress`, onglet « Rapport ». */
export interface PlayerProgressInsights {
  phaseAccuracy: Record<GamePhase, PhaseAccuracy>;
  tacticalMotifs: Record<TrackedTacticalMotif, TacticalMotifStats>;
  /** Triée par nombre de parties décroissant — les ouvertures les plus jouées, les plus représentatives, d'abord. */
  openingPerformance: OpeningPerformance[];
  hangingPieces: HangingPieceStats;
}
