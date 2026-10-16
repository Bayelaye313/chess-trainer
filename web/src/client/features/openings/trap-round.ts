/**
 * Construit l'exercice de piège (`DrillSelection.kind === "mistake"`, voir
 * `use-opening-drill.ts`) depuis un `OpeningTrap` (`core/curriculum/traps.ts`)
 * — même parti pris que `opening-mistake-round.ts#buildMistakeRound` pour le
 * journal « Erreurs d'ouverture », mais la source est ici un piège CURATÉ
 * (SAN, statique) plutôt qu'une vraie partie importée : il faut donc rejouer
 * `setupMoves`/`refutationMoves` nous-mêmes avec chess.js pour produire le
 * `DrillRound` (`startFen`, `script` en UCI) et le `leadInUci` attendus par
 * le hook, au lieu de simplement les emballer tels quels.
 *
 * Module pur, sans dépendance React : testable indépendamment du hook (même
 * schéma que `build-final-test.ts`/`opening-mistake-round.ts`).
 */
import { Chess } from "chess.js";
import { uciOf } from "@/core/analysis/evaluate-move";
import type { OpeningTrap } from "@/core/curriculum/traps";
import type { DrillRound } from "./build-final-test";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/** Rejoue `sanMoves` SUR `chess` (mutation volontaire, en continuité — voir `buildTrapRound`) et renvoie leur notation UCI. */
function playAndCollectUci(chess: Chess, sanMoves: readonly string[]): string[] {
  return sanMoves.map((san) => uciOf(chess.move(san)));
}

export interface TrapRoundResult {
  round: DrillRound;
  /** Coups UCI de mise en place (`trap.setupMoves`), depuis le tout premier coup — rejoués en autoplay par `use-opening-drill.ts`. */
  leadInUci: readonly string[];
}

/**
 * `chess` continue SUR LA MÊME instance entre `setupMoves` et
 * `refutationMoves` — le script de réfutation doit reprendre EXACTEMENT là où
 * la mise en place s'arrête (`round.startFen`), jamais depuis une position
 * recalculée séparément.
 */
export function buildTrapRound(trap: OpeningTrap): TrapRoundResult {
  const chess = new Chess();
  const leadInUci = playAndCollectUci(chess, trap.setupMoves);
  const startFen = chess.fen();
  const script = playAndCollectUci(chess, trap.refutationMoves);

  return {
    round: { startFen: trap.setupMoves.length > 0 ? startFen : START_FEN, script, label: trap.name, startPly: trap.setupMoves.length },
    leadInUci,
  };
}

/**
 * Construit la démonstration « Pion Poison » (incarner la victime, voir
 * `OpeningTrapDrill`) : `trap.setupMoves` PUIS `trap.trapMove` (le coup
 * naturel mais perdant, ici volontairement JOUÉ plutôt qu'évité) PUIS
 * `trap.punishmentLine` — la suite qui démontre concrètement l'effondrement
 * de la position. `chess` continue sur la MÊME instance d'un bout à l'autre,
 * même précaution que `buildTrapRound` : la punition doit reprendre
 * EXACTEMENT là où `trapMove` s'arrête.
 *
 * `null` si `trap.punishmentLine` est absent (voir son docstring dans
 * `core/curriculum/traps.ts`) — les pièges importés en base n'ont pas encore
 * cette donnée ; l'appelant désactive alors l'option plutôt que d'appeler
 * cette fonction.
 */
export function buildPoisonPawnRound(trap: OpeningTrap): { startFen: string; leadInUci: readonly string[] } | null {
  if (!trap.punishmentLine) return null;
  const chess = new Chess();
  const setupUci = playAndCollectUci(chess, trap.setupMoves);
  const punishmentUci = playAndCollectUci(chess, [trap.trapMove, ...trap.punishmentLine]);

  return { startFen: START_FEN, leadInUci: [...setupUci, ...punishmentUci] };
}
