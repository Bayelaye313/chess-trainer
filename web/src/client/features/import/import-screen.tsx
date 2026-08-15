"use client";

import { ImportForm } from "./import-form";
import { ImportHistory } from "./import-history";
import { ImportProgress } from "./import-progress";
import { useImport } from "./use-import";

export function ImportScreen() {
  const { job, history, error, running, start, cancel } = useImport();

  return (
    <div className="space-y-6">
      <ImportForm disabled={running} onStart={start} />

      {error && (
        <p className="rounded-md border border-blunder/30 bg-blunder/10 px-4 py-2 text-sm text-blunder">
          {error}
        </p>
      )}

      {job && <ImportProgress job={job} onCancel={cancel} />}

      <ImportHistory jobs={history} />
    </div>
  );
}
