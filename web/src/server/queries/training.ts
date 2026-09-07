import "server-only";

import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { recommendationId, selectSessionCandidates, type RecommendationCandidate } from "@/core/training/recommendations";
import { db } from "@/server/db";
import { moves, openingProgress, puzzles, reviews, trainingEvents, trainingRecommendations } from "@/server/db/schema";
import { LOCAL_USER_ID } from "@/server/queries/curriculum";

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
}

export async function listTrainingRecommendations(
  now: Date = new Date(),
  limit = 3,
  userId: string = LOCAL_USER_ID,
): Promise<TrainingRecommendationDto[]> {
  const [duePuzzles, dueOpenings, recentErrors] = await Promise.all([
    db
      .select({ id: puzzles.id, due: reviews.due })
      .from(reviews)
      .innerJoin(puzzles, eq(reviews.puzzleId, puzzles.id))
      .where(lte(reviews.due, now))
      .orderBy(asc(reviews.due))
      .limit(limit),
    db
      .select({
        openingId: openingProgress.openingId,
        variationKey: openingProgress.variationKey,
        due: openingProgress.nextReviewDate,
      })
      .from(openingProgress)
      .where(and(eq(openingProgress.userId, userId), lte(openingProgress.nextReviewDate, now)))
      .orderBy(asc(openingProgress.nextReviewDate))
      .limit(limit),
    db
      .select({ id: moves.id, gameId: moves.gameId, ply: moves.ply, cpLoss: moves.cpLoss })
      .from(moves)
      .where(and(eq(moves.byPlayer, true), gte(moves.cpLoss, 80)))
      .orderBy(desc(moves.cpLoss))
      .limit(limit),
  ]);

  const candidates: RecommendationCandidate[] = [
    ...duePuzzles.map((puzzle, index) => ({
      entityType: "puzzle" as const,
      entityId: puzzle.id,
      reasonCode: "puzzle-due",
      priority: 100 - index,
      dueAt: puzzle.due,
    })),
    ...dueOpenings.map((opening, index) => ({
      entityType: "opening" as const,
      // `openingId` puis `variationKey` (jamais l'inverse) : la clé de variante
      // suit le format `${eco}|${name}` ou `main_line` (voir
      // `core/curriculum/opening-variation-key.ts`), jamais de ":" — un simple
      // split sur le PREMIER ":" (voir `recommendationHref`,
      // `training-recommendations-card.tsx`) retrouve les deux sans ambiguïté.
      entityId: `${opening.openingId}:${opening.variationKey}`,
      reasonCode: "opening-due",
      priority: 90 - index,
      dueAt: opening.due,
    })),
    ...recentErrors.map((move, index) => ({
      entityType: "review" as const,
      entityId: `${move.gameId}:${move.ply}`,
      reasonCode: "game-error",
      priority: 80 - index,
      dueAt: now,
    })),
  ];

  const selected = selectSessionCandidates(candidates, limit);
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
      })),
    )
    .onConflictDoNothing();

  return selected.map((candidate) => ({
    id: `${userId}:${recommendationId(candidate)}`,
    entityType: candidate.entityType,
    entityId: candidate.entityId,
    reasonCode: candidate.reasonCode,
    priority: candidate.priority,
    dueAt: candidate.dueAt.toISOString(),
  }));
}