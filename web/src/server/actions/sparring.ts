"use server";

import { requireUser } from "@/server/auth/session";
import {
  finishSparringSession as finishSparringSessionQuery,
  getSparringMoveBias as getSparringMoveBiasQuery,
  recordSparringMove as recordSparringMoveQuery,
  startSparringSession as startSparringSessionQuery,
  type FinishSparringInput,
  type RecordSparringMoveInput,
  type StartSparringInput,
} from "@/server/queries/sparring";

export async function startSparringSession(input: StartSparringInput): Promise<string> {
  return startSparringSessionQuery((await requireUser()).id, input);
}

export async function recordSparringMove(input: RecordSparringMoveInput): Promise<void> {
  await recordSparringMoveQuery((await requireUser()).id, input);
}

export async function finishSparringSession(input: FinishSparringInput): Promise<void> {
  await finishSparringSessionQuery((await requireUser()).id, input);
}

export async function getSparringMoveBias(input: { openingId: string; variationKey: string }) {
  return getSparringMoveBiasQuery((await requireUser()).id, input);
}