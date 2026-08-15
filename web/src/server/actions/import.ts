"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { importJobs, type ImportJob } from "@/server/db/schema";
import { cancelJob, isJobRunning } from "@/server/import/job-runner";
import { DEFAULT_MAX_GAMES, MAX_MAX_GAMES, MIN_MAX_GAMES } from "@/lib/import-limits";
import { runImportJob, type ImportSource } from "@/server/import/run-import";

// Réexportés : le client n'importe jamais directement de `server/db/*`,
// seulement le contrat public de cette Server Action.
export type { ImportJob, ImportSource };

export interface StartImportInput {
  source: ImportSource;
  username: string;
  maxGames?: number;
}

export type StartImportResult = { jobId: string } | { error: string };

export async function startImport(input: StartImportInput): Promise<StartImportResult> {
  const username = input.username.trim();
  if (!username) {
    return { error: "Indique un pseudo." };
  }
  if (input.source !== "chesscom" && input.source !== "lichess") {
    return { error: "Plateforme inconnue." };
  }
  if (isJobRunning()) {
    return { error: "Un import est déjà en cours — attends qu'il se termine." };
  }

  const maxGames = Math.max(
    MIN_MAX_GAMES,
    Math.min(MAX_MAX_GAMES, Math.round(input.maxGames ?? DEFAULT_MAX_GAMES)),
  );

  const jobId = crypto.randomUUID();
  const now = new Date();

  await db.insert(importJobs).values({
    id: jobId,
    source: input.source,
    username,
    status: "running",
    maxGames,
    gamesProcessed: 0,
    gamesSkipped: 0,
    mistakesFound: 0,
    startedAt: now,
  });

  // Non attendu à dessein : le job tourne en tâche de fond, voir run-import.ts.
  // Une erreur non rattrapée ici serait un bug de runImportJob lui-même (elle
  // catch déjà tout en interne) — .catch() reste un filet de sécurité.
  void runImportJob(jobId, input.source, username, maxGames).catch((cause) => {
    console.error("Import job crashed outside its own error handling:", cause);
  });

  return { jobId };
}

export async function getImportJob(jobId: string): Promise<ImportJob | null> {
  const [job] = await db.select().from(importJobs).where(eq(importJobs.id, jobId)).limit(1);
  return job ?? null;
}

export async function listImportJobs(limit = 10): Promise<ImportJob[]> {
  return db.select().from(importJobs).orderBy(desc(importJobs.startedAt)).limit(limit);
}

export async function cancelImport(jobId: string): Promise<{ cancelled: boolean }> {
  return { cancelled: cancelJob(jobId) };
}
