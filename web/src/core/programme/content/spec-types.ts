import type { ReconsolidationType } from "../types";

/**
 * Spécification rédigée à la main d'une phase : le TEXTE pédagogique et les
 * RÈGLES de sourcing. Le générateur (`scripts/programme/generate-phase.mts`)
 * la combine avec les puzzles Lichess filtrés et vérifiés pour produire le
 * JSON final (`phase-<n>.json`). Rien ici n'est une position : aucune FEN ne
 * s'écrit à la main, sauf `construites`, signalées comme telles.
 */

/** Filtres géométriques implémentés par le générateur (`scripts/programme/geometry.mts`). */
export type GeometryFilter =
  | "openFile"
  | "seventhRank"
  | "battery"
  | "semiOpenFile"
  | "pawnChain"
  | "isolatedPawn"
  | "doubledPawns"
  | "passedPawnPush"
  | "createPassedPawn"
  | "squareRule"
  | "activeKing"
  | "opposition"
  | "kingManoeuvre"
  | "outsidePasser"
  | "breakthrough"
  | "outpost"
  | "fianchetto"
  | "badBishop"
  | "bishopPair"
  | "knightVsBishop"
  | "pawnStorm"
  | "greekGift"
  | "rookBehindPasser"
  | "cutOff"
  | "lucenaLike"
  | "philidorLike"
  | "rookTradeToPawnEnding"
  | "rookEndingPasser";

export interface SourcingSpec {
  /** Au moins un de ces tags Lichess (vide = aucun filtre sur les tags). */
  anyThemes: string[];
  /** Tous ces tags Lichess. */
  allThemes?: string[];
  /** Aucun de ces tags. */
  noThemes?: string[];
  geometry?: GeometryFilter;
  /** Si le filtre géométrique ne fournit pas assez de candidats, repli sur les seuls tags. */
  fallbackThemes?: string[];
  /** Positions pédagogiques construites (vérifiées par la tablebase Syzygy). */
  construites?: string[];
}

export interface ConstructedPosition {
  id: string;
  fen: string;
  /** Ligne complète en UCI (solveur aux rangs pairs). */
  ligne: string[];
  description: string;
}

export interface DaySpec {
  semaine: number;
  jour: number;
  metaphore_id: string;
  theme_metaphore: string;
  concept: string;
  cours: string;
  ancrage_sensoriel: string;
  rappels: string[];
  /** Ce qu'on cherche dans la partie lente du bloc F. */
  focus_partie: string;
  reconsolidation: { type: ReconsolidationType; consigne: string };
  checklist: string[];
  /** Absent au jour 7 : le test de rétention rejoue des puzzles déjà vérifiés. */
  sourcing?: SourcingSpec;
  /** Tags Lichess du blindfold du jour 7 (thèmes de la semaine). */
  blindfoldThemes?: string[];
}
