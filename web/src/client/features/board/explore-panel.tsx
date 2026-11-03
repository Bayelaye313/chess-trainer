"use client";

/** Bandeau + jauge d'évaluation du mode « Exploration libre » (voir `use-explore-mode.ts`). */
import { FlaskConical } from "lucide-react";
import type { Move } from "chess.js";
import { formatEvaluation, QUALITY_LABEL } from "@/lib/labels";
import type { ExploreEvaluation } from "./use-explore-mode";

export function ExplorePanel({
  explorerMoves,
  evaluation,
  onExit,
  exitLabel = "↩ Retourner à la revue réelle",
}: {
  explorerMoves: readonly Move[];
  evaluation: ExploreEvaluation;
  onExit: () => void;
  /** Libellé du bouton de sortie — le contexte varie (revue de partie, puzzle). */
  exitLabel?: string;
}) {
  const lastMove = explorerMoves[explorerMoves.length - 1] ?? null;
  const line = explorerMoves.map((m) => m.san).join(" ");

  return (
    <div className="rounded-lg border border-l-4 border-border border-l-accent bg-surface-muted p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground"><FlaskConical aria-hidden="true" className="size-4" />Exploration libre avec le moteur</p>
          {line && <p className="mt-0.5 font-mono text-sm text-foreground-muted">{line}</p>}
        </div>
        <button
          type="button"
          onClick={onExit}
          className="inline-flex min-h-11 shrink-0 items-center rounded-md border border-border-strong bg-surface px-3 text-sm hover:bg-surface-raised"
        >
          {exitLabel}
        </button>
      </div>

      <p className="mt-3 min-h-5 text-sm">
        {evaluation.status === "loading" && (
          <span className="text-foreground-muted">Analyse en cours…</span>
        )}
        {evaluation.status === "error" && (
          <span className="text-danger">Analyse indisponible — {evaluation.message}</span>
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
