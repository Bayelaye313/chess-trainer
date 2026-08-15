import "server-only";
import type { AnalysedPly } from "@/core/analysis/timeline";
import type { EvaluatedMove } from "@/core/analysis/evaluate-move";
import type { MoveRow, NewMoveRow } from "./schema/moves";

/**
 * Traduit une évaluation de coup vers une ligne `moves` insérable.
 *
 * Partagé entre la partie live (`server/actions/play.ts`) et l'import en
 * masse (`server/import/`) : les deux persistent des coups évalués de la
 * même façon, seule la provenance change.
 */
export function evaluatedMoveToRow(
  gameId: string,
  ply: number,
  side: "w" | "b",
  evaluated: EvaluatedMove,
  byPlayer: boolean = true,
): NewMoveRow {
  return {
    gameId,
    ply,
    side,
    byPlayer,
    uci: evaluated.uci,
    san: evaluated.san,
    fenBefore: evaluated.fenBefore,
    cpBefore: evaluated.cpBefore,
    mateBefore: evaluated.mateBefore,
    cpAfter: evaluated.cpAfter,
    mateAfter: evaluated.mateAfter,
    cpLoss: evaluated.cpLoss,
    quality: evaluated.quality,
    phase: evaluated.phase,
    bestUci: evaluated.bestUci,
    bestSan: evaluated.bestSan,
    mateMissed: evaluated.mateMissed,
    motifs: evaluated.motifs,
    // A-t-on effectivement joué le coup qui exploitait le motif détecté ?
    motifFound: evaluated.tactical && evaluated.uci === evaluated.bestUci,
  };
}

/** Traduit une ligne `moves` vers la vue allégée que consomme `core/analysis/timeline`. */
export function moveRowToAnalysedPly(row: MoveRow): AnalysedPly {
  return {
    ply: row.ply,
    byPlayer: row.byPlayer,
    quality: row.quality,
    cpLoss: row.cpLoss,
    cpBefore: row.cpBefore,
    mateBefore: row.mateBefore,
    cpAfter: row.cpAfter,
    mateAfter: row.mateAfter,
    bestUci: row.bestUci,
    bestSan: row.bestSan,
    mateMissed: row.mateMissed,
    motifs: row.motifs,
    motifFound: row.motifFound,
    phase: row.phase,
  };
}
