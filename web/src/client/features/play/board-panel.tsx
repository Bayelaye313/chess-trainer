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
}: {
  fen: string;
  status: PlayStatus;
  playerColor: "w" | "b";
  outcome: { result: "1-0" | "0-1" | "1/2-1/2"; termination: keyof typeof TERMINATION_LABEL } | null;
  squareStyles: Record<string, { backgroundColor: string }>;
  onPieceDrop: ChessboardOptions["onPieceDrop"];
  canDragPiece: ChessboardOptions["canDragPiece"];
}) {
  let statusText = "";
  if (status === "over") {
    statusText = outcome
      ? `Partie terminée — ${describeGameResult(outcome.result)} (${TERMINATION_LABEL[outcome.termination]})`
      : "Partie terminée";
  } else if (status !== "setup") {
    statusText = STATUS_LABEL[status];
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="mx-auto max-w-[520px]">
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
    </section>
  );
}
