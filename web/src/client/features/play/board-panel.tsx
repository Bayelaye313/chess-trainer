"use client";

import { Chessboard, type ChessboardOptions } from "react-chessboard";
import { describeGameResult, TERMINATION_LABEL } from "@/lib/labels";
import type { PlayStatus } from "./use-play-game";

const STATUS_LABEL: Record<Exclude<PlayStatus, "setup" | "over">, string> = {
  loading: "Préparation de la partie…",
  playing: "À toi de jouer",
  evaluating: "Analyse du coup…",
  thinking: "Le moteur réfléchit…",
};

export function BoardPanel({
  fen,
  status,
  playerColor,
  outcome,
  squareStyles,
  onPieceDrop,
  canDragPiece,
  onTakeback,
  onResign,
  canTakeback,
}: {
  fen: string;
  status: PlayStatus;
  playerColor: "w" | "b";
  outcome: { result: "1-0" | "0-1" | "1/2-1/2"; termination: keyof typeof TERMINATION_LABEL } | null;
  squareStyles: Record<string, { backgroundColor: string }>;
  onPieceDrop: ChessboardOptions["onPieceDrop"];
  canDragPiece: ChessboardOptions["canDragPiece"];
  onTakeback: () => void;
  onResign: () => void;
  canTakeback: boolean;
}) {
  let statusText = "";
  if (status === "over") {
    statusText = outcome
      ? `Partie terminée — ${describeGameResult(outcome.result)} (${TERMINATION_LABEL[outcome.termination]})`
      : "Partie terminée";
  } else if (status !== "setup") {
    statusText = STATUS_LABEL[status];
  }

  const gameActive = status !== "setup" && status !== "over" && status !== "loading";

  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="mx-auto max-w-[520px] overflow-hidden rounded-lg border-2 border-border/70">
        <Chessboard
          options={{
            id: "play-board",
            position: fen,
            boardOrientation: playerColor === "w" ? "white" : "black",
            squareStyles,
            onPieceDrop,
            canDragPiece,
            allowDragging: status === "playing",
          }}
        />
      </div>
      <p className="mt-4 min-h-5 text-center text-sm text-foreground-muted">{statusText}</p>

      {gameActive && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onTakeback}
            disabled={!canTakeback}
            className="rounded-xl border border-border bg-surface-muted/40 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-surface-muted disabled:opacity-40"
          >
            ↩️ Annuler le coup
          </button>
          <button
            type="button"
            onClick={onResign}
            className="rounded-xl border border-blunder/30 bg-blunder/5 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-blunder transition-colors hover:bg-blunder/10"
          >
            🏳️ Abandonner
          </button>
        </div>
      )}
    </section>
  );
}
