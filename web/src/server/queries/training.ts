import "server-only";

import { and, asc, count, desc, eq, gte, isNotNull, isNull, lte, ne, sql } from "drizzle-orm";
import {
  recommendationId,
  selectSessionCandidates,
  type RecommendationCandidate,
} from "@/core/training/recommendations";
import { allowedEntityTypes, type TrainingPreferences } from "@/core/training/preferences";
import { encodeTrainingReason } from "@/core/training/reasons";
import {
  boundedCpLoss,
  daysOverdue,
  scoreGameError,
  scoreOpeningDue,
  scorePuzzleDue,
  scoreTheoryExit,
  startOfUtcDay,
} from "@/core/training/priority";
import {
  aggregateMotifMisses,
  motifMissCandidates,
  summarizeTrapEvents,
  trapRecommendationCandidates,
} from "@/core/training/signals";
import type { Motif } from "@/core/chess/types";
import { findOpening } from "@/core/curriculum/openings";
import { listOpeningFamilies } from "@/server/curriculum/imported-openings-index";
import { db } from "@/server/db";
import {
  games,
  moves,
  openingProgress,
  puzzles,
  reviews,
  trainingEvents,
  trainingRecommendations,
} from "@/server/db/schema";
import { LOCAL_USER_ID } from "@/server/queries/curriculum";
import { getTrainingPreferences } from "@/server/queries/settings";
import { listAllTraps } from "@/server/queries/traps";

export interface RecordTrainingEventInput {
  kind: "puzzle" | "opening" | "trap" | "review" | "game";
  entityId: string;
  sourceGameId?: string;
  score?: number;
  seconds?: number;
  hintsUsed?: number;
  occurredAt?: Date;
}

export interface TrainingRecommendationDto {
  id: string;
  entityType: "puzzle" | "opening" | "trap" | "review";
  entityId: string;
  reasonCode: string;
  priority: number;
  dueAt: string;
}

const EVENT_ENTITY_TYPE = {
  puzzle: "puzzle",
  opening: "opening",
  trap: "trap",
  review: "review",
} as const;

/**
 * Nom de famille affichable pour un `opening_progress.opening_id` — la preuve
 * citée par la carte « Séance du jour » (`formatTrainingProof`). Catalogue
 * curaté d'abord (`core/curriculum/openings.ts`), puis familles dynamiques
 * lichess (mémoïsées, même ordre que `resolveOpeningSlug`). `null` : id
 * inconnu, la carte retombe sur la seule variante.
 */
function openingDisplayName(openingId: string): string | null {
  const curated = findOpening(openingId);
  if (curated) return curated.name;
  return listOpeningFamilies().find((family) => family.id === openingId)?.name ?? null;
}

export async function recordTrainingEvent(
  input: RecordTrainingEventInput,
  userId: string = LOCAL_USER_ID,
): Promise<void> {
  const occurredAt = input.occurredAt ?? new Date();
  await db.insert(trainingEvents).values({
    id: crypto.randomUUID(),
    userId,
    kind: input.kind,
    entityId: input.entityId,
    sourceGameId: input.sourceGameId,
    score: input.score,
    seconds: input.seconds,
    hintsUsed: input.hintsUsed ?? 0,
    occurredAt,
  });
  await completeMatchingRecommendations(input, userId, occurredAt);
}

async function completeMatchingRecommendations(
  input: RecordTrainingEventInput,
  userId: string,
  completedAt: Date,
): Promise<void> {
  const entityType = input.kind === "game" ? null : EVENT_ENTITY_TYPE[input.kind];
  if (!entityType) return;

  const filters = [eq(trainingRecommendations.userId, userId), isNull(trainingRecommendations.completedAt)];
  if (input.kind === "puzzle") {
    await db
      .update(trainingRecommendations)
      .set({ completedAt })
      .where(and(...filters, eq(trainingRecommendations.entityType, "puzzle")));
    return;
  }

  await db
    .update(trainingRecommendations)
    .set({ completedAt })
    .where(and(...filters, eq(trainingRecommendations.entityType, entityType), eq(trainingRecommendations.entityId, input.entityId)));
}

export async function listTrainingRecommendations(
  now: Date = new Date(),
  limit?: number,
  userId: string = LOCAL_USER_ID,
  preferences?: TrainingPreferences,
): Promise<TrainingRecommendationDto[]> {
  const plan = preferences ?? (await getTrainingPreferences());
  const sessionSize = limit ?? plan.dailyLimit;
  const poolSize = Math.max(sessionSize * 4, 12);
  const dayStart = startOfUtcDay(now);

  const [
    duePuzzles,
    dueOpenings,
    recentErrors,
    theoryExits,
    motifRows,
    trapEventRows,
    repertoire,
    completedToday,
    traps,
  ] = await Promise.all([
    db
      .select({ id: puzzles.id, due: reviews.due, motifs: puzzles.motifs, deck: puzzles.deck })
      .from(reviews)
      .innerJoin(puzzles, eq(reviews.puzzleId, puzzles.id))
      .where(lte(reviews.due, now))
      .orderBy(asc(reviews.due))
      .limit(poolSize),
    db
      .select({
        openingId: openingProgress.openingId,
        variationKey: openingProgress.variationKey,
        variationLabel: openingProgress.variationLabel,
        due: openingProgress.nextReviewDate,
        lastAccuracy: openingProgress.lastAccuracy,
      })
      .from(openingProgress)
      .where(and(eq(openingProgress.userId, userId), lte(openingProgress.nextReviewDate, now)))
      .orderBy(asc(openingProgress.nextReviewDate))
      .limit(poolSize),
    db
      .select({
        id: moves.id,
        gameId: moves.gameId,
        ply: moves.ply,
        cpLoss: moves.cpLoss,
        openingName: games.openingName,
      })
      .from(moves)
      .innerJoin(games, eq(games.id, moves.gameId))
      .where(and(eq(moves.byPlayer, true), gte(moves.cpLoss, 80)))
      .orderBy(desc(moves.cpLoss))
      .limit(poolSize),
    db
      .select({
        gameId: moves.gameId,
        ply: moves.ply,
        cpLoss: moves.cpLoss,
        openingName: games.openingName,
      })
      .from(moves)
      .innerJoin(games, eq(games.id, moves.gameId))
      .where(
        and(
          eq(moves.byPlayer, true),
          eq(moves.phase, "opening"),
          ne(moves.quality, "book"),
          gte(moves.cpLoss, 40),
        ),
      )
      .orderBy(desc(moves.cpLoss))
      .limit(poolSize),
    db
      .select({
        motifs: moves.motifs,
        motifFound: moves.motifFound,
        cpLoss: moves.cpLoss,
        gameId: moves.gameId,
        ply: moves.ply,
      })
      .from(moves)
      .where(and(eq(moves.byPlayer, true), eq(moves.motifFound, false)))
      .orderBy(desc(moves.cpLoss))
      .limit(150),
    db
      .select({
        entityId: trainingEvents.entityId,
        score: trainingEvents.score,
        hintsUsed: trainingEvents.hintsUsed,
        occurredAt: trainingEvents.occurredAt,
      })
      .from(trainingEvents)
      .where(and(eq(trainingEvents.userId, userId), eq(trainingEvents.kind, "trap")))
      .orderBy(desc(trainingEvents.occurredAt))
      .limit(200),
    db
      .select({ eco: games.eco, games: count() })
      .from(games)
      .where(isNotNull(games.eco))
      .groupBy(games.eco)
      .orderBy(desc(count()))
      .limit(20),
    db
      .select({
        entityType: trainingRecommendations.entityType,
        entityId: trainingRecommendations.entityId,
      })
      .from(trainingRecommendations)
      .where(
        and(
          eq(trainingRecommendations.userId, userId),
          isNotNull(trainingRecommendations.completedAt),
          gte(trainingRecommendations.completedAt, dayStart),
        ),
      ),
    listAllTraps(),
  ]);

  const completedKeys = new Set(completedToday.map((row) => `${row.entityType}:${row.entityId}`));

  const candidates: RecommendationCandidate[] = [
    ...duePuzzles.map((puzzle) => ({
      entityType: "puzzle" as const,
      entityId: puzzle.id,
      // Preuve locale citée sur la carte : le motif raté (s'il est connu) et le
      // deck rangé — deux puzzles « en retard de X j » deviennent distincts.
      reasonCode: encodeTrainingReason("puzzle-due", {
        daysOverdue: daysOverdue(puzzle.due, now),
        motif: puzzle.motifs[0],
        deck: puzzle.deck,
      }),
      priority: scorePuzzleDue(daysOverdue(puzzle.due, now)),
      dueAt: puzzle.due,
    })),
    ...dueOpenings.map((opening) => ({
      entityType: "opening" as const,
      entityId: `${opening.openingId}:${opening.variationKey}`,
      // Preuve locale : famille + variante dénormalisées + dernier score du
      // drill — jamais un score moteur.
      reasonCode: encodeTrainingReason("opening-due", {
        daysOverdue: daysOverdue(opening.due, now),
        openingName: openingDisplayName(opening.openingId) ?? undefined,
        variation: opening.variationLabel,
        accuracy: Math.round(opening.lastAccuracy),
      }),
      priority: scoreOpeningDue(daysOverdue(opening.due, now), opening.lastAccuracy),
      dueAt: opening.due,
    })),
    ...recentErrors.map((move) => ({
      entityType: "review" as const,
      entityId: `${move.gameId}:${move.ply}`,
      reasonCode: encodeTrainingReason("game-error", {
        avgCpLoss: boundedCpLoss(move.cpLoss),
        openingName: move.openingName ?? undefined,
      }),
      priority: scoreGameError(move.cpLoss ?? 0),
      dueAt: now,
    })),
    ...theoryExits.map((move) => ({
      entityType: "review" as const,
      entityId: `${move.gameId}:${move.ply}`,
      reasonCode: encodeTrainingReason("theory-exit", {
        theoryExitPly: move.ply,
        openingName: move.openingName ?? undefined,
        avgCpLoss: boundedCpLoss(move.cpLoss),
      }),
      priority: scoreTheoryExit(move.cpLoss ?? 0, move.ply),
      dueAt: now,
    })),
    ...motifMissCandidates(
      aggregateMotifMisses(
        motifRows.map((row) => ({
          motifs: (row.motifs ?? []) as Motif[],
          motifFound: row.motifFound,
          cpLoss: row.cpLoss,
          gameId: row.gameId,
          ply: row.ply,
        })),
      ),
      duePuzzles,
      now,
    ),
    ...trapRecommendationCandidates(
      traps.map((trap) => ({ id: trap.id, name: trap.name, family: trap.family, eco: trap.eco })),
      summarizeTrapEvents(trapEventRows),
      repertoire.flatMap((row) => (row.eco ? [{ eco: row.eco, games: Number(row.games) }] : [])),
      now,
    ),
  ];

  const open = candidates.filter((candidate) => !completedKeys.has(`${candidate.entityType}:${candidate.entityId}`));
  const selected = selectSessionCandidates(open, sessionSize, allowedEntityTypes(plan.goals));
  if (selected.length === 0) return [];

  await db
    .insert(trainingRecommendations)
    .values(
      selected.map((candidate) => ({
        id: `${userId}:${recommendationId(candidate)}`,
        userId,
        entityType: candidate.entityType,
        entityId: candidate.entityId,
        reasonCode: candidate.reasonCode,
        priority: candidate.priority,
        dueAt: candidate.dueAt,
        completedAt: null,
      })),
    )
    .onConflictDoUpdate({
      target: trainingRecommendations.id,
      set: {
        priority: sql`excluded.priority`,
        dueAt: sql`excluded.due_at`,
        reasonCode: sql`excluded.reason_code`,
        completedAt: null,
      },
    });

  return selected.map((candidate) => ({
    id: `${userId}:${recommendationId(candidate)}`,
    entityType: candidate.entityType,
    entityId: candidate.entityId,
    reasonCode: candidate.reasonCode,
    priority: candidate.priority,
    dueAt: candidate.dueAt.toISOString(),
  }));
}
