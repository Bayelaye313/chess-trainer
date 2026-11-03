/**
 * Programme 1000 Heures — format d'un jour d'entraînement.
 *
 * Les clés reprennent TELLES QUELLES celles du cahier des charges (français,
 * accents compris) : le JSON généré par `scripts/programme/generate-phase.mts`
 * est le contrat entre le pipeline de sourcing et l'écran `/programme`, et doit
 * rester lisible par un humain qui relit le cahier des charges à côté.
 *
 * Deux extensions au format d'origine, toutes deux optionnelles pour un
 * lecteur qui ne connaît que le format de base :
 * - `puzzles[].squelette_cases` : la version STRUCTURÉE de `squelette_attendu`
 *   (cases à désigner), pour noter le chunking de l'utilisateur ;
 * - `reserve` : puzzles vérifiés hors fenêtre par défaut, dans lesquels la
 *   progression adaptative pioche (`core/programme/adaptive.ts`).
 */

export type PhaseId = "1500-1700" | "1700-1900" | "1900-2100" | "2100-2300" | "2300-2400";

export type BlockType = "cours" | "puzzles" | "blindfold" | "hack_visuel" | "pause" | "reconsolidation" | "partie" | "analyse";

export interface PlanningBlock {
  bloc: string;
  duree_min: number;
  type: BlockType;
  contenu?: string;
}

export type ReconsolidationType = "dessin_memoire" | "reconstruction_inverse" | "recitation" | "test_retention_j7";

export type PuzzleSource = "lichess_puzzle_api" | "lichess_puzzle_db" | "syzygy_tablebase" | "position_pedagogique";

/** Catégories du squelette à désigner AVANT la solution (chunking). */
export type SkeletonKind = "non_defendue" | "roi_expose" | "piece_clouee" | "ligne_de_force" | "case_faible" | "pion_passe" | "case_cle";

export interface SkeletonSquare {
  case: string;
  type: SkeletonKind;
}

/** Vérification moteur d'un puzzle, plie par plie du solveur. */
export interface PuzzleVerification {
  moteur: string;
  profondeur: number;
  /** Évaluation après le 1er coup de la solution, POV solveur (`M3`, `+2.40`). */
  eval_initiale: string;
  /** Tablebase Syzygy consultée (≤ 7 pièces) : catégorie exacte de la position. */
  tablebase?: "win" | "draw" | "loss";
  verifie_le: string;
}

export interface ProgrammePuzzle {
  source: PuzzleSource;
  puzzle_id: string;
  /** Lien vers la partie d'origine ou la page du puzzle — traçabilité. */
  url?: string;
  /** Position AU TRAIT DU SOLVEUR (le coup d'installation Lichess est déjà joué). */
  fen: string;
  /** Coup adverse d'installation et position d'avant, pour l'animer. */
  coup_installation?: { uci: string; san: string; fen_avant: string };
  theme_lichess: string[];
  rating_lichess: number;
  squelette_attendu: string;
  squelette_cases: SkeletonSquare[];
  /** Cases obligatoires du squelette : au moins une doit être désignée (`scoreSkeleton`). */
  squelette_coeur: string[];
  /** Ligne complète en SAN numérotée (`1. Rxe8+ Kh7 2. Qh5#`). */
  solution_pgn: string;
  /** Même ligne en UCI, coups adverses aux rangs impairs (convention `SolvablePuzzle`). */
  solution_uci: string[];
  /** Coups équivalents acceptés par pli (Stockfish), alignés sur `solution_uci`. */
  alternatives?: string[][];
  verification: PuzzleVerification;
}

export interface BlindfoldExercise {
  source: PuzzleSource;
  puzzle_id: string;
  url?: string;
  fen_affichee_une_fois: string;
  /** Durée d'affichage avant masquage, en secondes. */
  duree_affichage_s: number;
  consigne_calcul: string;
  solution: string;
  solution_uci: string[];
  rating_lichess: number;
  verification: PuzzleVerification;
}

export interface ProgrammeDay {
  phase: PhaseId;
  semaine: number;
  jour: number;
  theme_metaphore: string;
  /** Identifiant stable dans `METAPHOR_LIBRARY`. */
  metaphore_id: string;
  concept_echiquéen: string;
  /** Elo cible du jour, centre de la fenêtre de rating par défaut. */
  elo_cible: number;
  planning_4h: PlanningBlock[];
  cours_palais_memoire: {
    texte: string;
    ancrage_sensoriel: string;
    /** Métaphores déjà enseignées que ce cours réactive (interférence contextuelle). */
    rappels?: string[];
  };
  hack_visuel: {
    id: string;
    consigne: string;
    mecanisme_neuro: string;
  };
  puzzles: ProgrammePuzzle[];
  reserve?: ProgrammePuzzle[];
  exercice_blindfold: BlindfoldExercise | null;
  reconsolidation: {
    type: ReconsolidationType;
    consigne: string;
    /** Pour `test_retention_j7` : jours `S<n>J<m>` dont les puzzles sont rejoués. */
    jours_source?: string[];
  };
  checklist: string[];
}

export interface ProgrammePhaseContent {
  phase: PhaseId;
  genere_le: string;
  sources: string[];
  jours: ProgrammeDay[];
}

/** Clé stable d'un jour, `S3J5` = semaine 3, jour 5 (semaines numérotées sur tout le programme). */
export function dayKey(semaine: number, jour: number): string {
  return `S${semaine}J${jour}`;
}

export function parseDayKey(key: string): { semaine: number; jour: number } | null {
  const match = /^S(\d+)J([1-7])$/.exec(key);
  return match ? { semaine: Number(match[1]), jour: Number(match[2]) } : null;
}
