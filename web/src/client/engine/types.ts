import type { AnalysisLimit, PositionAnalyser, PositionEvaluation } from "@/core/analysis/types";

/** Progression d'une analyse, émise à chaque approfondissement du moteur. */
export type AnalysisProgress = (evaluation: PositionEvaluation) => void;

export interface EngineOptions {
  /** Bride la force du moteur sur un ELO cible. */
  elo?: number;
  /** Nombre de threads (build multi-thread seulement). */
  threads?: number;
  /** Taille de la table de hachage, en Mo. */
  hashMb?: number;
}

/**
 * Moteur d'échecs. `PositionAnalyser` couvre l'analyse ; on y ajoute de quoi
 * jouer une partie et régler la force.
 */
export interface ChessEngine extends PositionAnalyser {
  /** Prêt à recevoir des commandes. */
  ready(): Promise<void>;
  configure(options: EngineOptions): Promise<void>;
  /** Signale une nouvelle partie (vide les tables du moteur). */
  newGame(): Promise<void>;
  /** Meilleur coup UCI dans la position, selon la force configurée. */
  play(fen: string, limit: AnalysisLimit): Promise<string | null>;
  /** Analyse avec retour de progression à chaque profondeur atteinte. */
  analyseWithProgress(
    fen: string,
    limit: AnalysisLimit,
    onProgress: AnalysisProgress,
  ): Promise<PositionEvaluation>;
  /** Interrompt la recherche en cours. */
  stop(): void;
  /** Libère le worker. */
  dispose(): void;
}

/** Bornes acceptées par l'option UCI_Elo de Stockfish. */
export const MIN_ENGINE_ELO = 1320;
export const MAX_ENGINE_ELO = 3190;

export function clampElo(elo: number): number {
  return Math.max(MIN_ENGINE_ELO, Math.min(MAX_ENGINE_ELO, Math.round(elo)));
}
