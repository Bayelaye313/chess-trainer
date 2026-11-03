import type { Metaphor } from "./metaphors";
import type { PlannedRole } from "./session-plan";
import type { BlindfoldExercise, PlanningBlock, ProgrammeDay, ProgrammePuzzle } from "./types";
import type { VisualHack } from "./visual-hacks";

/**
 * Formes échangées entre le serveur (`server/queries/programme.ts`) et l'écran
 * `/programme`. Le client ne reçoit jamais la réserve complète d'un jour, seulement
 * les puzzles de SA séance.
 */

export interface ProgrammeStats {
  /** Taux de réussite (squelette + solution) des 10 dernières séances, `null` sans donnée. */
  rollingSuccess: number | null;
  completedSessions: number;
  /** Heures d'entraînement validées (séances terminées × 4 h). */
  hoursDone: number;
  /** Elo actuel lu dans les parties importées (hook profil), `null` si aucune partie notée. */
  currentElo: number | null;
}

export interface ProgrammeOverview {
  semaine: number;
  jour: number;
  repetition: number;
  ratingOffset: number;
  phaseTitre: string;
  phaseId: string;
  finished: boolean;
  /** Le jour courant n'est pas encore généré (phase suivante à produire avec le pipeline). */
  contentMissing: boolean;
  today: Pick<ProgrammeDay, "theme_metaphore" | "concept_echiquéen" | "elo_cible"> | null;
  stats: ProgrammeStats;
  /** Les 7 jours de la semaine courante, pour la frise. */
  week: { jour: number; theme: string; concept: string; done: boolean }[];
  /** Métaphores déjà visitées, dans l'ordre (bibliothèque personnelle). */
  library: (Metaphor & { firstDayKey: string; visits: number })[];
  inProgressSessionId: string | null;
}

export interface SessionPuzzle {
  role: PlannedRole;
  sourceDayKey: string;
  puzzle: ProgrammePuzzle;
}

export interface ProgrammeSessionPayload {
  sessionId: string;
  dayKey: string;
  semaine: number;
  jour: number;
  repetition: number;
  phaseId: string;
  effectiveTarget: number;
  ratingOffset: number;
  theme_metaphore: string;
  concept: string;
  metaphor: Metaphor;
  rappels: Metaphor[];
  cours: { texte: string; ancrage_sensoriel: string };
  hack: VisualHack;
  planning: PlanningBlock[];
  puzzles: SessionPuzzle[];
  blindfold: BlindfoldExercise | null;
  reconsolidation: ProgrammeDay["reconsolidation"];
  checklist: string[];
  /** Résultats déjà enregistrés dans cette séance (reprise après rechargement). */
  done: { puzzleId: string; role: string; skeletonOk: boolean; solved: boolean }[];
}

export interface RecordProgrammeResultInput {
  sessionId: string;
  puzzleId: string;
  sourceDayKey: string;
  role: PlannedRole | "blindfold";
  skeletonOk: boolean;
  solved: boolean;
  markedSquares?: string[];
  seconds?: number;
}

export interface CompleteProgrammeSessionInput {
  sessionId: string;
  checklist: string[];
  reconsolidation: { note: string; selfRating: "reussi" | "partiel" | "rate" | null };
}

export interface ProgrammeSessionOutcome {
  attempted: number;
  succeeded: number;
  rollingSuccess: number | null;
  previousOffset: number;
  newOffset: number;
  retentionPassed: boolean | null;
  next: { semaine: number; jour: number; repetition: number; finished: boolean };
}
