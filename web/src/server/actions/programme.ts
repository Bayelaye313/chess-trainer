"use server";

import { requireUser } from "@/server/auth/session";
import type {
  CompleteProgrammeSessionInput,
  ProgrammeSessionOutcome,
  ProgrammeSessionPayload,
  RecordProgrammeResultInput,
} from "@/core/programme/dto";
import { completeProgrammeSession, recordProgrammeResult, startOrResumeSession } from "@/server/queries/programme";

export async function startProgrammeSession(): Promise<ProgrammeSessionPayload | null> {
  return startOrResumeSession((await requireUser()).id);
}

export async function saveProgrammeResult(input: RecordProgrammeResultInput): Promise<void> {
  await recordProgrammeResult((await requireUser()).id, input);
}

export async function finishProgrammeSession(input: CompleteProgrammeSessionInput): Promise<ProgrammeSessionOutcome> {
  return completeProgrammeSession((await requireUser()).id, input);
}
