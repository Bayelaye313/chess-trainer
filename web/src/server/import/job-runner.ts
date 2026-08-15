import "server-only";

/**
 * Suivi en mémoire des jobs en cours, pour l'annulation.
 *
 * `import_jobs` en base porte l'état durable (progression, historique) ; ceci
 * n'existe que pour relier un `jobId` à son `AbortController` tant que le
 * process Node tourne. Survit au rechargement à chaud de Next en dev via le
 * même truc `globalThis` que `server/db/index.ts`.
 */
const globalForJobs = globalThis as unknown as {
  __chessTrainerImportJobs?: Map<string, AbortController>;
};

const activeJobs = globalForJobs.__chessTrainerImportJobs ?? new Map<string, AbortController>();

if (process.env.NODE_ENV !== "production") {
  globalForJobs.__chessTrainerImportJobs = activeJobs;
}

export function registerJob(jobId: string): AbortController {
  const controller = new AbortController();
  activeJobs.set(jobId, controller);
  return controller;
}

export function unregisterJob(jobId: string): void {
  activeJobs.delete(jobId);
}

export function isJobRunning(): boolean {
  return activeJobs.size > 0;
}

/** Demande l'annulation d'un job en cours. `false` s'il n'est pas (ou plus) actif. */
export function cancelJob(jobId: string): boolean {
  const controller = activeJobs.get(jobId);
  if (!controller) return false;
  controller.abort();
  return true;
}
