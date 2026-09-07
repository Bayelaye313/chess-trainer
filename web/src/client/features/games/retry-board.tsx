"use client";

/**
 * Rejouer une position ratée : le meilleur coup est déjà connu (stocké en
 * base lors de l'analyse), donc aucune requête moteur ici — juste comparer
 * le coup tenté à `bestUci`. Instance chess.js propre à ce composant : le
 * parent le démonte/remonte (`key={ply}`) entre deux essais différents.
 */
import { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs } from "react-chessboard";
import { qualitySquareColor } from "@/lib/labels";

export function RetryBoard({
  fenBefore,
  playerColor,
  bestUci,
  bestSan,
  onResult,
  onExit,
}: {
  fenBefore: string;
  playerColor: "w" | "b";
  bestUci: string;
  bestSan: string;
  onResult?: (result: { correct: boolean; playedUci: string; playedSan: string }) => void;
  onExit: () => void;
}) {
  const [chess] = useState(() => new Chess(fenBefore));
  const [fen, setFen] = useState(fenBefore);
  const [playedSan, setPlayedSan] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);

  function reset() {
    chess.load(fenBefore);
    setFen(fenBefore);
    setPlayedSan(null);
    setResult(null);
  }

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean {
    if (result || !targetSquare) return false;
    let move;
    try {
      move = chess.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    } catch {
      return false;
    }
    const uci = move.from + move.to + (move.promotion ?? "");
    setFen(chess.fen());
    setPlayedSan(move.san);
    const correct = uci === bestUci;
    setResult(correct ? "correct" : "incorrect");
    onResult?.({ correct, playedUci: uci, playedSan: move.san });
    return true;
  }

  function canDragPiece({ piece }: PieceHandlerArgs): boolean {
    return !result && piece.pieceType.startsWith(playerColor);
  }

  const hintSquares =
    result === "incorrect"
      ? { [bestUci.slice(0, 2)]: { backgroundColor: qualitySquareColor("best") }, [bestUci.slice(2, 4)]: { backgroundColor: qualitySquareColor("best") } }
      : {};

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="mx-auto max-w-[480px]">
        <Chessboard
          options={{
            id: "retry-board",
            position: fen,
            boardOrientation: playerColor === "w" ? "white" : "black",
            onPieceDrop,
            canDragPiece,
            squareStyles: hintSquares,
          }}
        />
      </div>

      <div className="mt-4 min-h-6 text-center text-sm">
        {result === null && <p className="text-foreground-muted">Trouve le meilleur coup.</p>}
        {result === "correct" && (
          <p className="font-medium text-best">Correct — {playedSan} était le meilleur coup.</p>
        )}
        {result === "incorrect" && (
          <p className="font-medium text-blunder">
            Pas tout à fait{playedSan ? ` (${playedSan})` : ""} — le meilleur coup était {bestSan}.
          </p>
        )}
      </div>

      <div className="mt-3 flex justify-center gap-3">
        {result && (
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface-muted"
          >
            Réessayer
          </button>
        )}
        <button
          type="button"
          onClick={onExit}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface-muted"
        >
          Quitter l&apos;essai
        </button>
      </div>
    </div>
  );
}
