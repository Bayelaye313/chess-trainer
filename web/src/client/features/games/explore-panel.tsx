"use client";

/** Bandeau + jauge d'évaluation du mode « Exploration libre » (voir `use-explore-mode.ts`). */
import type { Move } from "chess.js";
import { formatEvaluation, QUALITY_LABEL } from "@/lib/labels";
import type { ExploreEvaluation } from "./use-explore-mode";

export function ExplorePanel({
  explorerMoves,
  evaluation,
  onExit,
}: {
  explorerMoves: readonly Move[];
  evaluation: ExploreEvaluation;
  onExit: () => void;
}) {
  const lastMove = explorerMoves[explorerMoves.length - 1] ?? null;
  const line = explorerMoves.map((m) => m.san).join(" ");

  return (
    <div className="rounded-lg border border-accent/40 bg-accent/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-accent">🧪 Mode exploration actif</p>
          {line && <p className="mt-0.5 font-mono text-sm text-foreground-muted">{line}</p>}
        </div>
        <button
          type="button"
          onClick={onExit}
          className="shrink-0 rounded-md border border-border bg-surface px-3 py-1.5 text-sm hover:bg-surface-muted"
        >
          ↩ Retourner à la revue réelle
        </button>
      </div>

      <p className="mt-3 min-h-5 text-sm">
        {evaluation.status === "loading" && (
          <span className="text-foreground-muted">Analyse en cours…</span>
        )}
        {evaluation.status === "error" && (
          <span className="text-blunder">Analyse indisponible — {evaluation.message}</span>
        )}
        {evaluation.status === "ready" && lastMove && (
          <>
            Coup exploré : <span className="font-medium">{lastMove.san}</span> (
            {QUALITY_LABEL[evaluation.evaluated.quality]},{" "}
            {formatEvaluation(evaluation.evaluated.cpAfter, evaluation.evaluated.mateAfter)})
          </>
        )}
      </p>
    </div>
  );
}
