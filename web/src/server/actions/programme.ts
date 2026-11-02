"use server";

import type {
  CompleteProgrammeSessionInput,
  ProgrammeSessionOutcome,
  ProgrammeSessionPayload,
  RecordProgrammeResultInput,
} from "@/core/programme/dto";
import { completeProgrammeSession, recordProgrammeResult, startOrResumeSession } from "@/server/queries/programme";

export async function startProgrammeSession(): Promise<ProgrammeSessionPayload | null> {
  return startOrResumeSession();
}

export async function saveProgrammeResult(input: RecordProgrammeResultInput): Promise<void> {
  await recordProgrammeResult(input);
}

export async function finishProgrammeSession(input: CompleteProgrammeSessionInput): Promise<ProgrammeSessionOutcome> {
  return completeProgrammeSession(input);
}
