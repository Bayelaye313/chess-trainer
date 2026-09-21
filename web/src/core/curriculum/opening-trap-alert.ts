/**
 * Détection de piège documenté pendant le Mode Entraînement — pure, testable
 * hors React (même esprit que `drill-engine.ts`). Sert
 * `OpeningCoachingPanel` : le HUD d'alerte tactique décrit dans le cahier des
 * charges (« ATTENTION PIÈGE ») ne se déclenche QUE pour un coup refusé qui
 * correspond, à cette position EXACTE, à un piège du socle statique
 * `core/curriculum/traps.ts` — jamais une inférence heuristique ni un texte
 * générique inventé pour l'occasion.
 *
 * `use-opening-drill.ts#rejectMove` refuse déjà TOUT coup hors script/théorie
 * connue (la pièce revient immédiatement) — cette fonction n'ajoute rien à ce
 * refus, elle enrichit seulement son retour visuel quand le coup refusé se
 * trouve être, en plus, une chute documentée : le flash d'alerte ci-dessous
 * s'ajoute alors au tremblement générique (`useErrorShake`), il ne le
 * remplace jamais.
 */
import { OPENING_TRAPS, type OpeningTrap } from "./traps";

/**
 * `sanHistory` : les coups SAN déjà joués dans la partie interactive courante
 * (`drill.history`, AVANT le coup refusé). `attemptedSan` : le coup refusé
 * lui-même, en SAN. Exige une correspondance EXACTE de tout le préfixe avec
 * `trap.setupMoves` ET du coup refusé avec `trap.trapMove` — un piège n'est
 * documenté qu'à SA position précise, jamais par ressemblance partielle.
 */
export function findMatchingTrap(sanHistory: readonly string[], attemptedSan: string): OpeningTrap | null {
  return (
    OPENING_TRAPS.find(
      (trap) =>
        trap.trapMove === attemptedSan &&
        trap.setupMoves.length === sanHistory.length &&
        trap.setupMoves.every((san, index) => san === sanHistory[index]),
    ) ?? null
  );
}
