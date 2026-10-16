"use client";

import type { KeyMoment } from "@/core/analysis/timeline";
import { KEY_MOMENT_LABEL, KEY_MOMENT_SYMBOL, KEY_MOMENT_TEXT_CLASS } from "@/lib/labels";

export function KeyMomentsNav({
  moments,
  onSelect,
}: {
  moments: KeyMoment[];
  onSelect: (ply: number) => void;
}) {
  if (moments.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-medium uppercase tracking-wide text-foreground-muted">
        Moments clés
      </h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {moments.map((moment) => (
          <button
            key={`${moment.ply}-${moment.kind}`}
            type="button"
            onClick={() => onSelect(moment.ply)}
            className={`inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-surface-muted ${KEY_MOMENT_TEXT_CLASS[moment.kind]}`}
          >
            <span className="font-bold">{KEY_MOMENT_SYMBOL[moment.kind]}</span>
            {KEY_MOMENT_LABEL[moment.kind]} · coup {moment.ply}
          </button>
        ))}
      </div>
    </div>
  );
}
