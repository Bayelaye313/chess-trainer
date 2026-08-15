"use client";

/**
 * Suit un import en tâche de fond par sondage.
 *
 * Pas de flux temps réel (SSE/WebSocket) : pour un outil local mono-
 * utilisateur, interroger `getImportJob` toutes les 1,5 s est largement
 * suffisant et beaucoup plus simple à raisonner.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  cancelImport,
  getImportJob,
  listImportJobs,
  startImport,
  type ImportJob,
  type ImportSource,
} from "@/server/actions/import";

const POLL_INTERVAL_MS = 1500;
const RUNNING_STATUSES = new Set<ImportJob["status"]>(["running"]);

export function useImport() {
  const [job, setJob] = useState<ImportJob | null>(null);
  const [history, setHistory] = useState<ImportJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    setHistory(await listImportJobs());
  }, []);

  useEffect(() => {
    // Pattern "ignore flag" recommandé par React : le setState arrive dans le
    // .then(), jamais pendant l'exécution synchrone du corps de l'effet.
    let ignore = false;
    listImportJobs().then((jobs) => {
      if (!ignore) setHistory(jobs);
    });
    return () => {
      ignore = true;
      stopPolling();
    };
  }, [stopPolling]);

  const pollJob = useCallback(
    (jobId: string) => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        const current = await getImportJob(jobId);
        setJob(current);
        if (!current || !RUNNING_STATUSES.has(current.status)) {
          stopPolling();
          void refreshHistory();
        }
      }, POLL_INTERVAL_MS);
    },
    [stopPolling, refreshHistory],
  );

  const start = useCallback(
    async (source: ImportSource, username: string, maxGames: number) => {
      setError(null);
      const result = await startImport({ source, username, maxGames });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      const created = await getImportJob(result.jobId);
      setJob(created);
      pollJob(result.jobId);
    },
    [pollJob],
  );

  const cancel = useCallback(async () => {
    if (!job) return;
    await cancelImport(job.id);
  }, [job]);

  return {
    job,
    history,
    error,
    running: job !== null && RUNNING_STATUSES.has(job.status),
    start,
    cancel,
  };
}
