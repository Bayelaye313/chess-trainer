"use client";

import type { TimelinePly } from "@/core/analysis/timeline";
import { formatMotifs, QUALITY_BORDER_CLASS, QUALITY_LABEL, QUALITY_TEXT_CLASS } from "@/lib/labels";
import { QualityBadge } from "../board/quality-badge";

export function MoveList({
  timeline,
  currentPly,
  onSelectPly,
  onRetry,
}: {
  timeline: TimelinePly[];
  currentPly: number;
  onSelectPly: (ply: number) => void;
  onRetry: (ply: number) => void;
}) {
  return (
    <ol className="max-h-[480px] space-y-0.5 overflow-y-auto text-sm">
      {timeline.map((entry) => {
        const isCurrent = entry.ply === currentPly;
        const quality = entry.analysis?.quality;
        // Rejouer suppose que c'est au joueur de bouger dans `fenBefore` — pour
        // un coup adverse, l'échiquier de réessai (orienté et jouable côté
        // joueur) serait tout simplement faux.
        const canRetry =
          entry.analysis?.byPlayer &&
          (quality === "inaccuracy" || quality === "blunder") &&
          entry.analysis?.bestUci &&
          entry.analysis?.bestSan;
        // Étiquette texte réservée aux qualités qui méritent qu'on s'y arrête —
        // les autres se lisent d'un coup d'œil au glyphe seul, sans surcharger la liste.
        const showLabel = quality === "brilliant" || quality === "critical" || quality === "blunder";

        return (
          <li
            key={entry.ply}
            className={`rounded-md border-l-2 px-2 py-1 ${
              quality ? QUALITY_BORDER_CLASS[quality] : "border-transparent"
            } ${isCurrent ? "bg-surface-muted" : ""}`}
          >
            <div className="flex items-center gap-2">
              {entry.side === "w" && (
                <span className="w-6 shrink-0 font-mono text-xs text-foreground-muted">
                  {Math.ceil(entry.ply / 2)}.
                </span>
              )}
              <button
                type="button"
                onClick={() => onSelectPly(entry.ply)}
                className="flex flex-1 items-center gap-2 text-left hover:text-accent"
              >
                {quality && <QualityBadge quality={quality} />}
                <span className={quality ? QUALITY_TEXT_CLASS[quality] : undefined}>{entry.san}</span>
                {quality && showLabel && (
                  <span className={`text-xs font-medium ${QUALITY_TEXT_CLASS[quality]}`}>
                    {QUALITY_LABEL[quality]}
                  </span>
                )}
              </button>
              {canRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(entry.ply)}
                  className="shrink-0 rounded border border-border px-2 py-0.5 text-xs text-foreground-muted hover:text-foreground"
                >
                  Réessayer
                </button>
              )}
            </div>
            {(quality === "inaccuracy" || quality === "blunder") && entry.analysis?.bestSan && (
              <p className="pl-8 text-xs text-foreground-muted">
                Meilleur coup : {entry.analysis.bestSan}
                {entry.analysis.motifs.length > 0 ? ` (${formatMotifs(entry.analysis.motifs)})` : ""}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
