"use client";

import type { ImportJob } from "@/server/actions/import";
import { IMPORT_SOURCE_LABEL } from "@/lib/labels";

export function ImportProgress({ job, onCancel }: { job: ImportJob; onCancel: () => void }) {
  const total = job.gamesFound ?? null;
  const done = job.gamesProcessed + job.gamesSkipped;
  const percent = total && total > 0 ? Math.round((done / total) * 100) : null;

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">
          Import {IMPORT_SOURCE_LABEL[job.source]} — {job.username}
        </h2>
        {job.status === "running" && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-3 py-1 text-xs font-medium text-foreground-muted hover:text-foreground"
          >
            Annuler
          </button>
        )}
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full bg-accent transition-[width] duration-300"
          style={{ width: `${percent ?? (job.status === "running" ? 5 : 100)}%` }}
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-foreground-muted">Trouvées</dt>
          <dd className="mt-0.5 font-mono">{total ?? "…"}</dd>
        </div>
        <div>
          <dt className="text-foreground-muted">Analysées</dt>
          <dd className="mt-0.5 font-mono">{job.gamesProcessed}</dd>
        </div>
        <div>
          <dt className="text-foreground-muted">Ignorées</dt>
          <dd className="mt-0.5 font-mono">{job.gamesSkipped}</dd>
        </div>
        <div>
          <dt className="text-foreground-muted">Erreurs trouvées</dt>
          <dd className="mt-0.5 font-mono">{job.mistakesFound}</dd>
        </div>
      </dl>

      {job.status === "error" && job.errorMessage && (
        <p className="mt-4 text-sm text-blunder">{job.errorMessage}</p>
      )}
    </section>
  );
}
