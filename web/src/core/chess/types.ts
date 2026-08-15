/**
 * Vocabulaire du domaine échiquéen.
 *
 * Les valeurs sont des clés machine stables (anglais) : elles finissent en base
 * et dans les URL. La traduction vit dans la couche UI (src/lib/labels.ts),
 * jamais ici.
 */

/**
 * Qualité d'un coup joué, par ordre décroissant.
 *
 * Calquée sur la façon dont Lichess et Chess.com graduent un coup (benchmark
 * demandé explicitement) : `critical`/`best`/`okay`/`inaccuracy`/`blunder`
 * viennent d'une perte de probabilité de gain (voir `analysis/win-percent.ts`),
 * pas d'un seuil de centipions plat — un même écart de centipions ne pèse pas
 * pareil près de l'égalité qu'en position déjà décidée. `critical` est
 * l'équivalent du NAG $7 (« coup forcé ») : la position n'offrait qu'une seule
 * bonne option, et le joueur l'a trouvée.
 */
export type MoveQuality =
  | "brilliant"
  | "critical"
  | "best"
  | "okay"
  | "inaccuracy"
  | "blunder"
  /** Position hors évaluation : fin de partie atteinte, ou théorie. */
  | "book";

/** Ordre d'affichage, du plus fort au plus faible — légendes, répartitions. */
export const MOVE_QUALITY_ORDER = [
  "brilliant",
  "critical",
  "best",
  "okay",
  "inaccuracy",
  "blunder",
  "book",
] as const satisfies readonly MoveQuality[];

/** Une erreur assez grave pour alimenter un deck de révision. */
export const REVIEWABLE_QUALITIES = ["inaccuracy", "blunder"] as const satisfies readonly MoveQuality[];

export type ReviewableQuality = (typeof REVIEWABLE_QUALITIES)[number];

export function isReviewable(quality: MoveQuality): quality is ReviewableQuality {
  return (REVIEWABLE_QUALITIES as readonly MoveQuality[]).includes(quality);
}

/** Phase de jeu, déduite par heuristique (voir phase.ts). */
export type GamePhase = "opening" | "middlegame" | "endgame";

/** Résultat d'une partie terminée, notation standard. */
export type GameResult = "1-0" | "0-1" | "1/2-1/2";

/** Motifs tactiques détectables. Purement heuristique, pas une preuve formelle. */
export const MOTIFS = [
  "fork",
  "pin",
  "skewer",
  "discovered_attack",
  "back_rank_mate",
  "hanging_piece",
] as const;

export type Motif = (typeof MOTIFS)[number];
