"use server";

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
  return startSparringSessionQuery(input);
}

export async function recordSparringMove(input: RecordSparringMoveInput): Promise<void> {
  await recordSparringMoveQuery(input);
}

export async function finishSparringSession(input: FinishSparringInput): Promise<void> {
  await finishSparringSessionQuery(input);
}

export async function getSparringMoveBias(input: { openingId: string; variationKey: string }) {
  return getSparringMoveBiasQuery(input);
}