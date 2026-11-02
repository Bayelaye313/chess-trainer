"use client";

import type { CSSProperties } from "react";
import { Chessboard, type ChessboardOptions } from "react-chessboard";
import { ESPORT_BOARD_OPTIONS } from "@/client/features/board/board-theme";
import { OPPONENT_MOVE_ANIMATION_MS } from "@/client/features/board/move-animation";
import { describeGameResult, TERMINATION_LABEL } from "@/lib/labels";
import type { PlayStatus } from "./use-play-game";
import { Flag, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  squareStyles: Record<string, CSSProperties>;
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
    <section aria-label="Échiquier de la partie">
      <div className="mx-auto w-full max-w-[560px]">
        <Chessboard
          options={{ ...ESPORT_BOARD_OPTIONS,
            id: "play-board",
            position: fen,
            boardOrientation: playerColor === "w" ? "white" : "black",
            squareStyles,
            onPieceDrop,
            canDragPiece,
            allowDragging: status === "playing",
            animationDurationInMs: OPPONENT_MOVE_ANIMATION_MS,
          }}
        />
      </div>
      <p role="status" aria-live="polite" className="mx-auto mt-3 min-h-5 max-w-[560px] text-sm text-foreground-muted">
        {statusText}
      </p>

      {gameActive && (
        <div className="mx-auto mt-3 grid max-w-[560px] grid-cols-2 gap-2">
          <Button onClick={onTakeback} disabled={!canTakeback}>
            <Undo2 aria-hidden="true" />
            Annuler le coup
          </Button>
          <Button variant="danger" onClick={onResign}>
            <Flag aria-hidden="true" />
            Abandonner
          </Button>
        </div>
      )}
    </section>
  );
}
