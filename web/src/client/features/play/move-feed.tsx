"use client";

import { useEffect, useRef } from "react";
import { formatMotifs, QUALITY_LABEL, QUALITY_TEXT_CLASS } from "@/lib/labels";
import type { FeedEntry } from "./use-play-game";

export function MoveFeed({ feed }: { feed: FeedEntry[] }) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [feed.length]);

  return (
    <ol ref={listRef} aria-label="Coups joués" className="max-h-80 space-y-0.5 overflow-y-auto text-sm">
      {feed.map((entry, index) => (
        // L'index suffit : le journal n'est jamais réordonné ni filtré.
        <li key={index} className="rounded-md px-2 py-1.5 odd:bg-surface-muted">
          <div className="flex items-center gap-2">
            <span className="w-8 shrink-0 font-mono text-xs text-foreground-subtle">{Math.floor(index / 2) + 1}{index % 2 === 0 ? "." : "…"}</span>
            <span className={`font-mono ${entry.by === "ai" ? "text-foreground-muted" : ""}`}>
              {entry.san}
            </span>
            {entry.quality && (
              <span className={`text-xs font-medium ${QUALITY_TEXT_CLASS[entry.quality]}`}>
                {QUALITY_LABEL[entry.quality]}
                {entry.cpLoss != null && entry.cpLoss > 0 ? ` (-${entry.cpLoss})` : ""}
              </span>
            )}
          </div>
          {(entry.quality === "inaccuracy" || entry.quality === "blunder") && entry.bestSan && (
            <p className="mt-0.5 text-xs text-foreground-muted">
              Meilleur coup : {entry.bestSan}
              {entry.motifs && entry.motifs.length > 0
                ? ` (${formatMotifs(entry.motifs)})`
                : ""}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
