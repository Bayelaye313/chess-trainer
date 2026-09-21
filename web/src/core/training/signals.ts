import type { Motif } from "../chess/types";
import { MOTIFS } from "../chess/types";
import { encodeTrainingReason } from "./reasons";
import type { RecommendationCandidate } from "./recommendations";
import {
  daysSince,
  scoreMotifMiss,
  scoreTrapDue,
  scoreTrapFamilyPlayed,
  scoreTrapForgotten,
} from "./priority";

export interface MotifMissRow {
  motifs: readonly Motif[];
  motifFound: boolean;
  cpLoss: number | null;
  gameId: string;
  ply: number;
}

export interface MotifMissAggregate {
  motif: Motif;
  missCount: number;
  avgCpLoss: number;
  sampleGameId: string;
  samplePly: number;
}

export function aggregateMotifMisses(rows: readonly MotifMissRow[]): MotifMissAggregate[] {
  const buckets = new Map<Motif, { count: number; lossSum: number; sampleGameId: string; samplePly: number; sampleLoss: number }>();
  for (const row of rows) {
    if (row.motifFound || row.motifs.length === 0) continue;
    for (const motif of row.motifs) {
      if (!MOTIFS.includes(motif)) continue;
      const current = buckets.get(motif);
      const loss = row.cpLoss ?? 0;
      if (!current) {
        buckets.set(motif, {
          count: 1,
          lossSum: loss,
          sampleGameId: row.gameId,
          samplePly: row.ply,
          sampleLoss: loss,
        });
        continue;
      }
      current.count += 1;
      current.lossSum += loss;
      if (loss >= current.sampleLoss) {
        current.sampleLoss = loss;
        current.sampleGameId = row.gameId;
        current.samplePly = row.ply;
      }
    }
  }

  return [...buckets.entries()]
    .map(([motif, bucket]) => ({
      motif,
      missCount: bucket.count,
      avgCpLoss: bucket.count === 0 ? 0 : bucket.lossSum / bucket.count,
      sampleGameId: bucket.sampleGameId,
      samplePly: bucket.samplePly,
    }))
    .sort((left, right) => right.missCount - left.missCount || right.avgCpLoss - left.avgCpLoss);
}

export function motifMissCandidates(
  aggregates: readonly MotifMissAggregate[],
  duePuzzles: readonly { id: string; motifs: readonly Motif[]; due: Date }[],
  now: Date,
  limit = 2,
): RecommendationCandidate[] {
  const selected: RecommendationCandidate[] = [];
  for (const aggregate of aggregates) {
    if (selected.length >= limit) break;
    const puzzle = duePuzzles.find((item) => item.motifs.includes(aggregate.motif));
    const reasonCode = encodeTrainingReason("motif-missed", {
      motif: aggregate.motif,
      missCount: aggregate.missCount,
      avgCpLoss: aggregate.avgCpLoss,
    });
    const priority = scoreMotifMiss(aggregate.missCount, aggregate.avgCpLoss);
    if (puzzle) {
      selected.push({
        entityType: "puzzle",
        entityId: puzzle.id,
        reasonCode,
        priority,
        dueAt: puzzle.due,
      });
      continue;
    }
    selected.push({
      entityType: "review",
      entityId: `${aggregate.sampleGameId}:${aggregate.samplePly}`,
      reasonCode,
      priority,
      dueAt: now,
    });
  }
  return selected;
}

export interface TrapCatalogItem {
  id: string;
  name: string;
  family: string;
  eco: string;
}

export interface TrapEventSignal {
  entityId: string;
  lastScore: number;
  lastAt: Date;
  attempts: number;
  hintsUsed: number;
}

export interface RepertoireEco {
  eco: string;
  games: number;
}

export function summarizeTrapEvents(
  events: readonly { entityId: string; score: number | null; hintsUsed: number; occurredAt: Date }[],
): TrapEventSignal[] {
  const byId = new Map<string, TrapEventSignal>();
  for (const event of events) {
    const current = byId.get(event.entityId);
    if (!current) {
      byId.set(event.entityId, {
        entityId: event.entityId,
        lastScore: event.score ?? 0,
        lastAt: event.occurredAt,
        attempts: 1,
        hintsUsed: event.hintsUsed,
      });
      continue;
    }
    current.attempts += 1;
    if (event.occurredAt >= current.lastAt) {
      current.lastScore = event.score ?? 0;
      current.lastAt = event.occurredAt;
      current.hintsUsed = event.hintsUsed;
    }
  }
  return [...byId.values()];
}

export function ecoPrefix(eco: string): string {
  return eco.trim().slice(0, 3).toUpperCase();
}

export function trapMatchesRepertoire(trapEco: string, repertoire: readonly RepertoireEco[]): RepertoireEco | null {
  const prefix = ecoPrefix(trapEco);
  if (!prefix) return null;
  let best: RepertoireEco | null = null;
  for (const entry of repertoire) {
    if (ecoPrefix(entry.eco) !== prefix) continue;
    if (!best || entry.games > best.games) best = entry;
  }
  return best;
}

/**
 * Trois signaux distincts, comme Chess Trap Pro n'en a pas en local :
 * oubli de réfutation, entretien après 14 jours, et piège du répertoire joué.
 */
export function trapRecommendationCandidates(
  traps: readonly TrapCatalogItem[],
  events: readonly TrapEventSignal[],
  repertoire: readonly RepertoireEco[],
  now: Date,
): RecommendationCandidate[] {
  const byId = new Map(traps.map((trap) => [trap.id, trap]));
  const practiced = new Set(events.map((event) => event.entityId));
  const candidates: RecommendationCandidate[] = [];

  for (const event of events) {
    const trap = byId.get(event.entityId);
    if (!trap) continue;
    const ago = daysSince(event.lastAt, now);
    if (event.lastScore < 1) {
      candidates.push({
        entityType: "trap",
        entityId: trap.id,
        reasonCode: encodeTrainingReason("trap-refutation-forgotten", {
          trapName: trap.name,
          trapFamily: trap.family,
          hintsUsed: event.hintsUsed,
        }),
        priority: scoreTrapForgotten(event.lastScore, event.hintsUsed, ago),
        dueAt: now,
      });
      continue;
    }
    if (ago >= 14) {
      candidates.push({
        entityType: "trap",
        entityId: trap.id,
        reasonCode: encodeTrainingReason("trap-due", {
          trapName: trap.name,
          trapFamily: trap.family,
          daysOverdue: ago,
        }),
        priority: scoreTrapDue(ago),
        dueAt: now,
      });
    }
  }

  const unused = traps.filter((trap) => !practiced.has(trap.id));
  const rankedUnused = unused
    .map((trap) => {
      const match = trapMatchesRepertoire(trap.eco, repertoire);
      return match ? { trap, match } : null;
    })
    .filter((item): item is { trap: TrapCatalogItem; match: RepertoireEco } => item != null)
    .sort((left, right) => right.match.games - left.match.games);

  for (const item of rankedUnused.slice(0, 4)) {
    candidates.push({
      entityType: "trap",
      entityId: item.trap.id,
      reasonCode: encodeTrainingReason("trap-family-played", {
        trapName: item.trap.name,
        trapFamily: item.trap.family,
        eco: item.match.eco,
        gameCount: item.match.games,
      }),
      priority: scoreTrapFamilyPlayed(item.match.games),
      dueAt: now,
    });
  }

  return candidates;
}
