import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import type { SparringPolicy } from "@/server/db/schema";
import { sparringMoves, sparringSessions, trainingEvents, userScope } from "@/server/db/user-scope";

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
  userId: string,
  input: StartSparringInput,
): Promise<string> {
  const id = crypto.randomUUID();
  await db.insert(sparringSessions).values(userScope(userId).own({
    id,
    openingId: input.openingId,
    variationKey: input.variationKey,
    policy: input.policy,
    targetElo: input.targetElo,
    startedAt: input.startedAt ?? new Date(),
  }));
  return id;
}

/** Vrai si la séance existe ET appartient à cet utilisateur. */
async function ownsSparringSession(userId: string, sessionId: string): Promise<boolean> {
  const s = userScope(userId);
  const [row] = await db
    .select({ id: sparringSessions.id })
    .from(sparringSessions)
    .where(s.where(sparringSessions, eq(sparringSessions.id, sessionId)))
    .limit(1);
  return row !== undefined;
}

/** Ignoré (renvoie `false`) si la séance n'est pas à cet utilisateur : l'id vient du client. */
export async function recordSparringMove(userId: string, input: RecordSparringMoveInput): Promise<boolean> {
  if (!(await ownsSparringSession(userId, input.sessionId))) return false;
  await db.insert(sparringMoves).values(userScope(userId).own(input));
  return true;
}

export async function finishSparringSession(userId: string, input: FinishSparringInput): Promise<boolean> {
  const s = userScope(userId);
  if (!(await ownsSparringSession(userId, input.sessionId))) return false;
  const finishedAt = input.finishedAt ?? new Date();
  await db
    .update(sparringSessions)
    .set({
      result: input.result,
      theoryExitPly: input.theoryExitPly,
      finishedAt,
    })
    .where(s.where(sparringSessions, eq(sparringSessions.id, input.sessionId)));
  await db.insert(trainingEvents).values(
    s.own({
      id: crypto.randomUUID(),
      kind: "game" as const,
      entityId: input.sessionId,
      score: input.result === "win" ? 1 : input.result === "draw" ? 0.5 : 0,
      occurredAt: finishedAt,
    }),
  );
  return true;
}

export async function listRecentSparringSessions(userId: string) {
  return db
    .select()
    .from(sparringSessions)
    .where(userScope(userId).owns(sparringSessions))
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
  userId: string,
  input: SparringMoveBiasInput,
): Promise<SparringMoveBiasResult> {
  const s = userScope(userId);
  const rows = await db
    .select({ sessionId: sparringSessions.id, uci: sparringMoves.uci, result: sparringSessions.result })
    .from(sparringMoves)
    .innerJoin(sparringSessions, eq(sparringMoves.sessionId, sparringSessions.id))
    .where(
      and(
        s.owns(sparringMoves, sparringSessions),
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