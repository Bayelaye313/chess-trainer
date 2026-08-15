import { MAX_ENGINE_ELO, MIN_ENGINE_ELO } from "@/client/engine/types";

/** Profondeur de recherche pour qualifier un coup joué en direct. */
export const ANALYSIS_DEPTH = 16;

/** Temps de réflexion de l'IA par coup — un vrai temps de jeu, pas une analyse. */
export const AI_MOVE_TIME_MS = 600;

export const DEFAULT_ELO = 1500;

export { MIN_ENGINE_ELO, MAX_ENGINE_ELO };
