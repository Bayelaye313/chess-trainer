import { Chess } from "chess.js";
import type { GamePhase, Motif, MoveQuality } from "../chess/types";

/**
 * Vue allégée d'un coup analysé, indépendante du schéma de base — évite à ce
 * module de dépendre de `server/db`. Le mappeur (`server/queries/games.ts`)
 * traduit les lignes `moves` vers cette forme.
 */
export interface AnalysedPly {
  ply: number;
  /** Coup du joueur suivi (vs coup de l'adversaire, analysé aussi mais jamais compté dans ses propres statistiques). */
  byPlayer: boolean;
  quality: MoveQuality;
  cpLoss: number | null;
  cpBefore: number | null;
  mateBefore: number | null;
  cpAfter: number | null;
  mateAfter: number | null;
  bestUci: string | null;
  bestSan: string | null;
  mateMissed: boolean;
  motifs: Motif[];
  motifFound: boolean;
  phase: GamePhase;
}

/** Un demi-coup de la partie reconstituée depuis le PGN, les deux camps confondus. */
export interface TimelinePly {
  ply: number;
  side: "w" | "b";
  san: string;
  uci: string;
  fenBefore: string;
  fenAfter: string;
  /**
   * Les deux camps sont analysés à l'import (voir `byPlayer` sur `AnalysedPly`) —
   * `null` seulement si l'analyse a échoué sur ce coup précis ou n'a pas encore
   * tourné (partie live : seul le joueur est évalué en direct).
   */
  analysis: AnalysedPly | null;
}

/**
 * Reconstruit la partie complète (les deux camps) depuis le PGN, et superpose
 * l'analyse disponible sur les demi-coups du joueur.
 *
 * `moves` en base ne porte que les coups du joueur (voir §7 de l'architecture) ;
 * le PGN reste la seule source pour les coups de l'adversaire, nécessaires à
 * la navigation sur l'échiquier.
 */
export function buildGameTimeline(pgn: string, analysed: readonly AnalysedPly[]): TimelinePly[] {
  const chess = new Chess();
  chess.loadPgn(pgn);
  const history = chess.history({ verbose: true });

  const byPly = new Map(analysed.map((a) => [a.ply, a]));

  return history.map((move, index) => ({
    ply: index + 1,
    side: move.color,
    san: move.san,
    uci: move.from + move.to + (move.promotion ?? ""),
    fenBefore: move.before,
    fenAfter: move.after,
    analysis: byPly.get(index + 1) ?? null,
  }));
}

export type KeyMomentKind = "brilliant" | "critical" | "blunder" | "inaccuracy" | "missed_mate" | "missed_tactic";

export interface KeyMoment {
  ply: number;
  kind: KeyMomentKind;
}

/**
 * Moments à revoir en priorité, dans l'ordre de la partie. Un même coup peut
 * porter plusieurs étiquettes (une gaffe qui rate aussi un mat) : chacune
 * devient sa propre entrée, pour que le parcours guidé ne saute rien.
 *
 * Volontairement limité aux coups DU JOUEUR : l'adversaire est désormais
 * analysé aussi (visible sur l'échiquier et dans le journal), mais ce
 * parcours guidé reste celui de ses propres erreurs à corriger, pas un compte
 * rendu des gaffes de l'adversaire.
 */
export function findKeyMoments(timeline: readonly TimelinePly[]): KeyMoment[] {
  const moments: KeyMoment[] = [];

  for (const entry of timeline) {
    const a = entry.analysis;
    if (!a || !a.byPlayer) continue;

    if (a.mateMissed) moments.push({ ply: entry.ply, kind: "missed_mate" });
    if (a.quality === "brilliant") moments.push({ ply: entry.ply, kind: "brilliant" });
    if (a.quality === "critical") moments.push({ ply: entry.ply, kind: "critical" });
    if (a.quality === "blunder") moments.push({ ply: entry.ply, kind: "blunder" });
    if (a.quality === "inaccuracy") moments.push({ ply: entry.ply, kind: "inaccuracy" });
    // Tactique manquée : une occasion existait (motifs du meilleur coup) mais
    // le coup joué ne l'a pas saisie — distinct d'une gaffe/erreur classique.
    if (a.motifs.length > 0 && !a.motifFound && a.quality !== "blunder" && a.quality !== "inaccuracy") {
      moments.push({ ply: entry.ply, kind: "missed_tactic" });
    }
  }

  return moments;
}

/** Poids heuristique par qualité — approximation transparente, pas une formule officielle type CAPS. */
const ACCURACY_WEIGHT: Record<MoveQuality, number> = {
  brilliant: 100,
  critical: 100,
  best: 100,
  book: 100,
  okay: 85,
  inaccuracy: 65,
  blunder: 5,
};

/**
 * Précision approximative sur les coups analysés, en pourcentage. `null` sans
 * coup analysé. Volontairement simple : une moyenne pondérée par qualité, pas
 * une reproduction du CAPS de Chess.com — présentée comme telle dans l'UI.
 *
 * Ne prend que `quality` (pas tout `AnalysedPly`) : les vues résumées (liste
 * des parties) n'ont souvent que ça sous la main, pas l'analyse complète.
 */
export function computeAccuracy(qualities: readonly { quality: MoveQuality }[]): number | null {
  if (qualities.length === 0) return null;
  const total = qualities.reduce((sum, q) => sum + ACCURACY_WEIGHT[q.quality], 0);
  return Math.round(total / qualities.length);
}

/** Répartition des coups par qualité — le panneau « Aperçu de la partie » d'un camp. */
export type QualityTally = Record<MoveQuality, number>;

function emptyTally(): QualityTally {
  return { brilliant: 0, critical: 0, best: 0, okay: 0, inaccuracy: 0, blunder: 0, book: 0 };
}

/** Compte les coups par qualité — même entrée que `computeAccuracy`, un seul passage sur les données. */
export function tallyQualities(qualities: readonly { quality: MoveQuality }[]): QualityTally {
  const tally = emptyTally();
  for (const { quality } of qualities) tally[quality] += 1;
  return tally;
}

export interface EvalPoint {
  ply: number;
  /** `null` quand un mat est annoncé — voir `mate`. */
  cp: number | null;
  mate: number | null;
}

/**
 * Points pour le graphe d'évaluation : un point de départ (position initiale,
 * égalité) puis un point après chaque coup du joueur analysé. Les coups de
 * l'adversaire, jamais évalués, ne produisent pas de point intermédiaire — la
 * ligne les traverse par un simple segment entre deux coups du joueur.
 */
export function evalPoints(analysed: readonly AnalysedPly[]): EvalPoint[] {
  const sorted = [...analysed].sort((a, b) => a.ply - b.ply);
  return [
    { ply: 0, cp: 0, mate: null },
    ...sorted.map((a) => ({ ply: a.ply, cp: a.cpAfter, mate: a.mateAfter })),
  ];
}
