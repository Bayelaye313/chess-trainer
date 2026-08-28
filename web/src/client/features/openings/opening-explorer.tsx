"use client";

import Link from "next/link";
import { Chessboard } from "react-chessboard";
import { useEngine } from "@/client/engine/engine-context";
import { EvaluationBar } from "@/client/features/board/evaluation-bar";
import { QualityBadge } from "@/client/features/board/quality-badge";
import type { OpeningLine } from "@/core/curriculum/openings";
import { QUALITY_DESCRIPTION, QUALITY_LABEL, QUALITY_TEXT_CLASS } from "@/lib/labels";
import type { AnnotatedPly } from "@/server/queries/openings";
import { SIDE_LABEL, SideDot } from "./side-dot";
import { useOpeningExplorer } from "./use-opening-explorer";
import { VariationTree } from "./variation-tree";

function ControlButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-30"
    >
      {children}
    </button>
  );
}

export function OpeningExplorer({ opening, plies }: { opening: OpeningLine; plies: readonly AnnotatedPly[] }) {
  const { engine } = useEngine();
  const explorer = useOpeningExplorer({ engine, plies });

  const lastSandboxPly = explorer.sandboxLine[explorer.sandboxLine.length - 1] ?? null;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/ouvertures" className="text-sm text-foreground-muted hover:text-foreground">
          ← Toutes les ouvertures
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{opening.name}</h1>
          <span className="rounded-full border border-book/40 bg-book/10 px-2 py-0.5 text-xs font-medium text-book">
            {opening.eco}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-foreground-muted">
            <SideDot side={opening.side} />
            {SIDE_LABEL[opening.side]}
          </span>
        </div>
        <p className="mt-2 max-w-prose text-sm text-foreground-muted">{opening.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mx-auto flex max-w-[440px] items-stretch gap-2">
            <EvaluationBar score={explorer.score} />
            <div className="min-w-0 flex-1">
              <Chessboard
                options={{
                  id: "opening-explorer-board",
                  position: explorer.fen,
                  boardOrientation: opening.side === "white" ? "white" : "black",
                  onPieceDrop: explorer.onPieceDrop,
                  canDragPiece: explorer.canDragPiece,
                }}
              />
            </div>
          </div>

          <div className="mt-4 min-h-10 text-center text-sm">
            {explorer.isSandboxed && lastSandboxPly ? (
              lastSandboxPly.evaluation.status === "ready" ? (
                <div className="flex items-center justify-center gap-2">
                  <QualityBadge quality={lastSandboxPly.evaluation.evaluated.quality} />
                  <span className={`font-medium ${QUALITY_TEXT_CLASS[lastSandboxPly.evaluation.evaluated.quality]}`}>
                    {QUALITY_LABEL[lastSandboxPly.evaluation.evaluated.quality]}
                  </span>
                  <span className="text-foreground-muted">
                    — {QUALITY_DESCRIPTION[lastSandboxPly.evaluation.evaluated.quality]}
                  </span>
                </div>
              ) : lastSandboxPly.evaluation.status === "loading" ? (
                <p className="text-foreground-muted">Analyse du coup en cours…</p>
              ) : lastSandboxPly.evaluation.status === "error" ? (
                <p className="text-inaccuracy">{lastSandboxPly.evaluation.message}</p>
              ) : null
            ) : explorer.currentBook ? (
              <p className="text-foreground-muted">
                📖 {explorer.currentBook.eco} · {explorer.currentBook.name}
              </p>
            ) : explorer.viewPly === 0 ? (
              <p className="text-foreground-muted">Position de départ.</p>
            ) : (
              <p className="text-foreground-muted">Hors théorie cataloguée à partir d&apos;ici.</p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <ControlButton onClick={() => explorer.goToPly(0)} disabled={explorer.viewPly === 0 && !explorer.isSandboxed}>
              ⏮
            </ControlButton>
            <ControlButton onClick={() => explorer.goToPly(explorer.viewPly - 1)} disabled={!explorer.canGoPrevious}>
              ← Précédent
            </ControlButton>
            <span className="font-mono text-sm text-foreground-muted">
              {explorer.viewPly} / {explorer.totalPlies}
            </span>
            <ControlButton onClick={() => explorer.goToPly(explorer.viewPly + 1)} disabled={!explorer.canGoNext}>
              Suivant →
            </ControlButton>
            <ControlButton
              onClick={() => explorer.goToPly(explorer.totalPlies)}
              disabled={explorer.viewPly === explorer.totalPlies && !explorer.isSandboxed}
            >
              ⏭
            </ControlButton>
          </div>

          {explorer.isSandboxed && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={explorer.returnToLine}
                className="rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent/20"
              >
                ↩ Revenir à la ligne
              </button>
            </div>
          )}

          <p className="mt-4 text-center text-xs text-foreground-muted">
            Déplace une pièce à tout moment pour dévier de la ligne et explorer librement.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-foreground">Ligne de référence</h2>
            <ol className="mt-3 flex flex-wrap gap-x-1 gap-y-2 font-mono text-sm">
              {plies.map((ply, index) => (
                <li key={ply.ply}>
                  {ply.ply % 2 === 1 && <span className="mr-1 text-foreground-muted">{Math.ceil(ply.ply / 2)}.</span>}
                  <button
                    type="button"
                    onClick={() => explorer.goToPly(index + 1)}
                    className={`rounded px-1.5 py-0.5 transition-colors hover:bg-surface-muted ${
                      !explorer.isSandboxed && explorer.viewPly === index + 1
                        ? "bg-accent/15 text-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {ply.san}
                  </button>
                </li>
              ))}
            </ol>

            {explorer.isSandboxed && explorer.sandboxLine.length > 0 && (
              <>
                <h2 className="mt-5 text-sm font-semibold text-foreground">Exploration</h2>
                <ol className="mt-3 space-y-1.5">
                  {explorer.sandboxLine.map((ply, index) => (
                    <li key={`${ply.move.san}-${index}`} className="flex items-center gap-2 text-sm">
                      {ply.evaluation.status === "ready" && <QualityBadge quality={ply.evaluation.evaluated.quality} />}
                      {ply.evaluation.status === "loading" && (
                        <span className="inline-block h-5 w-5 shrink-0 animate-pulse rounded-full bg-surface-muted" />
                      )}
                      <span className="font-mono font-medium text-foreground">{ply.move.san}</span>
                      {ply.evaluation.status === "ready" && (
                        <span className={`text-xs ${QUALITY_TEXT_CLASS[ply.evaluation.evaluated.quality]}`}>
                          {QUALITY_LABEL[ply.evaluation.evaluated.quality]}
                        </span>
                      )}
                      {ply.evaluation.status === "error" && (
                        <span className="text-xs text-inaccuracy">{ply.evaluation.message}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </>
            )}

            <div className="mt-5 border-t border-border pt-4">
              <h2 className="text-sm font-semibold text-foreground">Théorie coup par coup</h2>
              <ul className="mt-2 space-y-1 text-xs text-foreground-muted">
                {plies.map((ply) => (
                  <li key={ply.ply} className={ply.book ? "text-book" : ""}>
                    {ply.ply}. {ply.san} — {ply.book ? `${ply.book.eco} ${ply.book.name}` : "position non cataloguée"}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5">
            <VariationTree fen={explorer.fen} onPlay={explorer.playMove} />
          </div>
        </div>
      </div>
    </div>
  );
}
