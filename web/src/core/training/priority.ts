const DAY_MS = 24 * 60 * 60 * 1000;
/** Au-delà, c'est un mat / une explosion d'éval, pas une perte en centipions lisible. */
export const CP_LOSS_DISPLAY_CAP = 1500;

export function boundedCpLoss(cpLoss: number | null | undefined): number {
  if (cpLoss == null || !Number.isFinite(cpLoss)) return 0;
  return Math.min(CP_LOSS_DISPLAY_CAP, Math.max(0, cpLoss));
}

/** UTC : le graphe local reste déterministe hors fuseau, testable à seed égal. */
export function startOfUtcDay(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function daysOverdue(due: Date, now: Date): number {
  return Math.max(0, Math.floor((startOfUtcDay(now).getTime() - startOfUtcDay(due).getTime()) / DAY_MS));
}

export function daysSince(at: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - at.getTime()) / DAY_MS));
}

function clampScore(value: number): number {
  return Math.max(1, Math.min(100, Math.round(value)));
}

/** Puzzle FSRS : l'urgence d'échéance bat un catalogue « nouveau ». */
export function scorePuzzleDue(overdueDays: number): number {
  return clampScore(78 + Math.min(22, overdueDays * 4));
}

/** Impact réel : fréquence × amplitude, pas un rang SQL plat. */
export function scoreMotifMiss(missCount: number, avgCpLoss: number): number {
  return clampScore(62 + Math.min(24, missCount * 6) + Math.min(14, avgCpLoss / 25));
}

export function scoreOpeningDue(overdueDays: number, lastAccuracy: number): number {
  const weakness = Math.max(0, 100 - lastAccuracy) / 12;
  return clampScore(72 + Math.min(18, overdueDays * 3) + weakness);
}

export function scoreTheoryExit(cpLoss: number, ply: number): number {
  const early = ply > 0 ? Math.max(0, 12 - ply) : 0;
  return clampScore(58 + Math.min(28, boundedCpLoss(cpLoss) / 12) + early);
}

export function scoreGameError(cpLoss: number): number {
  return clampScore(52 + Math.min(40, boundedCpLoss(cpLoss) / 10));
}

/** Réfutation vue mais pas consolidée (score < 1 ou indice utilisé). */
export function scoreTrapForgotten(lastScore: number, hintsUsed: number, daysAgo: number): number {
  const gap = (1 - Math.max(0, Math.min(1, lastScore))) * 28;
  const hintPenalty = hintsUsed > 0 ? 8 : 0;
  const recency = daysAgo <= 3 ? 6 : 0;
  return clampScore(70 + gap + hintPenalty + recency);
}

export function scoreTrapDue(daysAgo: number): number {
  return clampScore(55 + Math.min(20, Math.max(0, daysAgo - 14)));
}

/** Transfert : le piège appartient au répertoire réellement joué. */
export function scoreTrapFamilyPlayed(gameCount: number): number {
  return clampScore(64 + Math.min(20, gameCount * 2));
}
