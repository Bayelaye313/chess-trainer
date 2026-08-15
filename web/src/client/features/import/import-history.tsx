"use client";

import type { ImportJob } from "@/server/actions/import";
import { IMPORT_SOURCE_LABEL, IMPORT_STATUS_LABEL } from "@/lib/labels";

const STATUS_CLASS: Record<ImportJob["status"], string> = {
  running: "text-inaccuracy",
  done: "text-excellent",
  error: "text-blunder",
  cancelled: "text-foreground-muted",
};

export function ImportHistory({ jobs }: { jobs: ImportJob[] }) {
  if (jobs.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-medium uppercase tracking-wide text-foreground-muted">
        Imports précédents
      </h2>
      <ul className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
        {jobs.map((job) => (
          <li key={job.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
            <div>
              <p className="font-medium">
                {IMPORT_SOURCE_LABEL[job.source]} — {job.username}
              </p>
              <p className="text-foreground-muted">
                {job.gamesProcessed} partie{job.gamesProcessed > 1 ? "s" : ""} analysée
                {job.gamesProcessed > 1 ? "s" : ""}
                {job.gamesSkipped > 0 ? `, ${job.gamesSkipped} ignorée(s)` : ""} —{" "}
                {job.mistakesFound} erreur{job.mistakesFound > 1 ? "s" : ""} trouvée
                {job.mistakesFound > 1 ? "s" : ""}
              </p>
            </div>
            <span className={`shrink-0 font-medium ${STATUS_CLASS[job.status]}`}>
              {IMPORT_STATUS_LABEL[job.status]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
