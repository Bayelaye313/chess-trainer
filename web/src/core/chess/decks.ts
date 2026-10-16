import { isReviewable, type GamePhase, type Motif, type MoveQuality } from "./types";

/**
 * Un deck = une file de révision thématique. `daily` est le seul deck qui ne
 * vient pas d'une catégorisation d'erreur : il est composé chaque jour à partir
 * des autres.
 */
export const DECK_IDS = [
  "daily",
  "opening_mistakes",
  "missed_checkmates",
  "endgame_mistakes",
  "missed_tactics",
  "tactical_mistakes",
  "positional_mistakes",
] as const;

export type DeckId = (typeof DECK_IDS)[number];

/** Decks dans lesquels une erreur peut être rangée automatiquement. */
export type MistakeDeckId = Exclude<DeckId, "daily">;

export function isDeckId(value: string): value is DeckId {
  return (DECK_IDS as readonly string[]).includes(value);
}

export interface DeckDefinition {
  id: DeckId;
  title: string;
  subtitle: string;
}

export const DECKS: readonly DeckDefinition[] = [
  {
    id: "daily",
    title: "Puzzles du jour",
    subtitle: "Rejoue tes anciens puzzles du jour",
  },
  {
    id: "opening_mistakes",
    title: "Erreurs d'ouverture",
    subtitle: "Erreurs d'ouverture de tes parties",
  },
  {
    id: "missed_checkmates",
    title: "Mats manqués",
    subtitle: "Mats manqués dans tes parties",
  },
  {
    id: "endgame_mistakes",
    title: "Erreurs de finale",
    subtitle: "Erreurs de finale de tes parties",
  },
  {
    id: "missed_tactics",
    title: "Tactiques manquées",
    subtitle: "Occasions manquées dans tes parties",
  },
  {
    id: "tactical_mistakes",
    title: "Erreurs tactiques",
    subtitle: "Erreurs tactiques de tes parties",
  },
  {
    id: "positional_mistakes",
    title: "Erreurs positionnelles",
    subtitle: "Erreurs positionnelles de tes parties",
  },
];

export interface DeckContext {
  quality: MoveQuality;
  phase: GamePhase;
  /** Un mat forcé était disponible et le coup joué l'a laissé filer. */
  mateMissed: boolean;
  /** Le meilleur coup exploitait au moins un motif tactique. */
  tactical: boolean;
}

/**
 * Range une erreur dans un seul deck, par ordre de priorité décroissante :
 * un mat manqué reste un mat manqué même en finale.
 *
 * Distinction tactique : rater l'occasion est une « tactique manquée », mais si
 * le coup joué est une gaffe franche c'est une « erreur tactique » — on n'a pas
 * seulement manqué quelque chose, on a donné quelque chose.
 */
export function categorizeDeck({
  quality,
  phase,
  mateMissed,
  tactical,
}: DeckContext): MistakeDeckId {
  if (mateMissed) return "missed_checkmates";
  if (phase === "opening") return "opening_mistakes";
  if (phase === "endgame") return "endgame_mistakes";
  if (tactical) return quality === "blunder" ? "tactical_mistakes" : "missed_tactics";
  return "positional_mistakes";
}

/** Ce qu'il faut savoir d'un coup pour décider s'il mérite de devenir un puzzle. */
export interface PuzzleCandidate {
  quality: MoveQuality;
  /** Un mat forcé était disponible et a disparu après ce coup. */
  mateMissed: boolean;
  /** Motifs que le MEILLEUR coup exploitait à cette position. */
  motifs: readonly Motif[];
  /** Le coup joué a-t-il exploité ces motifs (coup joué = meilleur coup) ? */
  motifFound: boolean;
}

/**
 * Un coup mérite-t-il de devenir une carte de révision ?
 *
 * Deux familles de déclencheurs, indépendantes : une vraie erreur
 * (`isReviewable` — gaffe ou imprécision, quel que soit le contexte), ou une
 * occasion manquée qui n'a pas fait chuter l'évaluation assez pour être
 * classée comme telle — un mat forcé qui s'évapore, ou un motif tactique
 * (fourchette, clouage...) que le meilleur coup exploitait sans que le joueur
 * ne le saisisse. Cette seconde famille est la même que le « missed_tactic »
 * de `findKeyMoments` (`analysis/timeline.ts`), appliquée ici à l'extraction
 * de puzzles plutôt qu'à la navigation des moments clés d'une partie.
 */
export function isPuzzleWorthy(move: PuzzleCandidate): boolean {
  if (isReviewable(move.quality)) return true;
  if (move.mateMissed) return true;
  return move.motifs.length > 0 && !move.motifFound;
}
