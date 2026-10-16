import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { sparringMoves, sparringSessions, trainingEvents, type SparringPolicy } from "@/server/db/schema";
import { LOCAL_USER_ID } from "@/server/queries/curriculum";

export interface StartSparringInput {
  openingId?: string;
  variationKey?: string;
  policy: SparringPolicy;
  targetElo?: number;
  startedAt?: Date;
}

export interface RecordSparringMoveInput {
  sessionId: string;
  ply: number;
  fenBefore: string;
  uci: string;
  byPlayer: boolean;
  policyScore?: number;
  thinkMs?: number;
}

export interface FinishSparringInput {
  sessionId: string;
  result: string;
  theoryExitPly?: number;
  finishedAt?: Date;
}

export async function startSparringSession(
  input: StartSparringInput,
  userId: string = LOCAL_USER_ID,
): Promise<string> {
  const id = crypto.randomUUID();
  await db.insert(sparringSessions).values({
    id,
    userId,
    openingId: input.openingId,
    variationKey: input.variationKey,
    policy: input.policy,
    targetElo: input.targetElo,
    startedAt: input.startedAt ?? new Date(),
  });
  return id;
}

export async function recordSparringMove(input: RecordSparringMoveInput): Promise<void> {
  await db.insert(sparringMoves).values(input);
}

export async function finishSparringSession(input: FinishSparringInput): Promise<void> {
  const finishedAt = input.finishedAt ?? new Date();
  await db
    .update(sparringSessions)
    .set({
      result: input.result,
      theoryExitPly: input.theoryExitPly,
      finishedAt,
    })
    .where(eq(sparringSessions.id, input.sessionId));
  await db.insert(trainingEvents).values({
    id: crypto.randomUUID(),
    userId: LOCAL_USER_ID,
    kind: "game",
    entityId: input.sessionId,
    score: input.result === "win" ? 1 : input.result === "draw" ? 0.5 : 0,
    occurredAt: finishedAt,
  });
}

export async function listRecentSparringSessions(userId: string = LOCAL_USER_ID) {
  return db
    .select()
    .from(sparringSessions)
    .where(eq(sparringSessions.userId, userId))
    .orderBy(desc(sparringSessions.startedAt))
    .limit(20);
}

export interface SparringMoveBiasInput {
  openingId: string;
  variationKey: string;
}

export interface SparringMoveBiasResult {
  bias: Record<string, number>;
  sessions: number;
  losses: number;
  reinforcedMoves: number;
}

/** Apprentissage local : renforce les reponses des sessions que l'utilisateur a perdues. */
export async function getSparringMoveBias(
  input: SparringMoveBiasInput,
  userId: string = LOCAL_USER_ID,
): Promise<SparringMoveBiasResult> {
  const rows = await db
    .select({ sessionId: sparringSessions.id, uci: sparringMoves.uci, result: sparringSessions.result })
    .from(sparringMoves)
    .innerJoin(sparringSessions, eq(sparringMoves.sessionId, sparringSessions.id))
    .where(
      and(
        eq(sparringSessions.userId, userId),
        eq(sparringSessions.openingId, input.openingId),
        eq(sparringSessions.variationKey, input.variationKey),
        eq(sparringMoves.byPlayer, false),
      ),
    );

  const totals = new Map<string, { weighted: number; count: number }>();
  const sessions = new Set<string>();
  const losses = new Set<string>();
  for (const row of rows) {
    sessions.add(row.sessionId);
    if (row.result === "loss") losses.add(row.sessionId);
    const multiplier = row.result === "loss" ? 1.5 : row.result === "win" ? 0.75 : 1;
    const current = totals.get(row.uci) ?? { weighted: 0, count: 0 };
    current.weighted += multiplier;
    current.count += 1;
    totals.set(row.uci, current);
  }
  return {
    bias: Object.fromEntries(
      Array.from(totals, ([uci, value]) => [uci, Math.max(0.5, value.weighted / value.count)]),
    ),
    sessions: sessions.size,
    losses: losses.size,
    reinforcedMoves: Array.from(totals.values()).filter((value) => value.weighted / value.count > 1).length,
  };
}