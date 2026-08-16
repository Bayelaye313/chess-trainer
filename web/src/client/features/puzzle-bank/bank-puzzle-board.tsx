"use client";

/**
 * Échiquier d'un puzzle de la banque tierce — même mécanique que `PuzzleBoard`
 * (`client/features/reviews/`) : coups adverses (rangs impairs de `solutionUci`)
 * rejoués automatiquement, indice discret sur erreur, jamais le SAN affiché en
 * clair. Diffère sur un point : pas de notation FSRS à la fin (banque tierce,
 * hors file de révision) — juste "Résolu !" et un bouton pour enchaîner.
 */
import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs } from "react-chessboard";
import { OPPONENT_MOVE_SQUARE_COLOR, qualitySquareColor } from "@/lib/labels";
import type { BankPuzzle } from "@/server/actions/puzzle-bank";

const OPPONENT_REPLY_DELAY_MS = 500;

type Status = "playing" | "wrong" | "solved";

export function BankPuzzleBoard({ puzzle, onNext }: { puzzle: BankPuzzle; onNext: () => void }) {
  const [chess] = useState(() => new Chess(puzzle.fen));
  const [fen, setFen] = useState(puzzle.fen);
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState<Status>("playing");
  const [pendingOpponentIndex, setPendingOpponentIndex] = useState<number | null>(null);
  const [lastMoveSquares, setLastMoveSquares] = useState<Record<string, { backgroundColor: string }>>({});

  const playerColor: "w" | "b" = puzzle.fen.split(" ")[1] === "b" ? "b" : "w";

  useEffect(() => {
    if (pendingOpponentIndex === null) return;
    const uci = puzzle.solutionUci[pendingOpponentIndex];
    const timer = setTimeout(() => {
      const move = chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci.slice(4, 5) || undefined,
      });
      setFen(chess.fen());
      setLastMoveSquares({
        [move.from]: { backgroundColor: OPPONENT_MOVE_SQUARE_COLOR },
        [move.to]: { backgroundColor: OPPONENT_MOVE_SQUARE_COLOR },
      });
      const afterIndex = pendingOpponentIndex + 1;
      setMoveIndex(afterIndex);
      setPendingOpponentIndex(null);
      if (afterIndex >= puzzle.solutionUci.length) setStatus("solved");
    }, OPPONENT_REPLY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pendingOpponentIndex, chess, puzzle.solutionUci]);

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean {
    if (status === "solved" || pendingOpponentIndex !== null || !targetSquare) return false;

    const attempt = new Chess(chess.fen());
    let move;
    try {
      move = attempt.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    } catch {
      return false;
    }
    const playedUci = move.from + move.to + (move.promotion ?? "");

    if (playedUci !== puzzle.solutionUci[moveIndex]) {
      setStatus("wrong");
      return false; // laisse react-chessboard remettre la pièce en place
    }

    chess.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    setFen(chess.fen());
    setLastMoveSquares({});
    setStatus("playing");

    const nextIndex = moveIndex + 1;
    setMoveIndex(nextIndex);
    if (nextIndex >= puzzle.solutionUci.length) {
      setStatus("solved");
    } else {
      setPendingOpponentIndex(nextIndex);
    }
    return true;
  }

  function canDragPiece({ piece }: PieceHandlerArgs): boolean {
    return status !== "solved" && pendingOpponentIndex === null && piece.pieceType.startsWith(playerColor);
  }

  const hintSquares =
    status === "wrong"
      ? {
          [puzzle.solutionUci[moveIndex].slice(0, 2)]: { backgroundColor: qualitySquareColor("inaccuracy") },
          [puzzle.solutionUci[moveIndex].slice(2, 4)]: { backgroundColor: qualitySquareColor("inaccuracy") },
        }
      : lastMoveSquares;

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="mx-auto max-w-[480px]">
        <Chessboard
          options={{
            id: "bank-puzzle-board",
            position: fen,
            boardOrientation: playerColor === "w" ? "white" : "black",
            onPieceDrop,
            canDragPiece,
            squareStyles: hintSquares,
          }}
        />
      </div>

      <div className="mt-4 min-h-6 text-center text-sm">
        {status === "playing" && pendingOpponentIndex === null && (
          <p className="text-foreground-muted">Trouve le coup à jouer.</p>
        )}
        {status === "playing" && pendingOpponentIndex !== null && (
          <p className="text-foreground-muted">L&apos;adversaire répond…</p>
        )}
        {status === "wrong" && (
          <p className="font-medium text-inaccuracy">
            Pas tout à fait — un indice t&apos;attend sur l&apos;échiquier.
          </p>
        )}
        {status === "solved" && <p className="font-medium text-best">Puzzle résolu !</p>}
      </div>

      {status === "solved" && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={onNext}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Puzzle suivant →
          </button>
        </div>
      )}
    </div>
  );
}
