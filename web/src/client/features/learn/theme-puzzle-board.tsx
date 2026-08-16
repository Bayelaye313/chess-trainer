"use client";

/**
 * Échiquier d'un exercice du curriculum — même mécanique que `PuzzleBoard`
 * (`client/features/reviews/`) et `BankPuzzleBoard` (`client/features/
 * puzzle-bank/`) : chess.js + react-chessboard, coups adverses (rangs
 * impairs de `solution`) rejoués automatiquement, indice discret sur erreur.
 *
 * Diffère des deux sur le même point qu'« Apprendre » diffère d'« Entraîner »
 * dans l'ensemble : pas de `GradePanel` FSRS à la fin. Juste "Résolu !" et un
 * bouton pour enchaîner — comme `BankPuzzleBoard`, mais `onSolved` ici
 * déclenche en plus l'incrément du compteur en base (voir `theme-session.tsx`).
 */
import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs } from "react-chessboard";
import { OPPONENT_MOVE_SQUARE_COLOR, qualitySquareColor } from "@/lib/labels";
import type { ThemePuzzle } from "@/server/queries/curriculum";

const OPPONENT_REPLY_DELAY_MS = 500;

type Status = "playing" | "wrong" | "solved";

export function ThemePuzzleBoard({ puzzle, onSolved }: { puzzle: ThemePuzzle; onSolved: () => void }) {
  const [chess] = useState(() => new Chess(puzzle.fen));
  const [fen, setFen] = useState(puzzle.fen);
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState<Status>("playing");
  const [pendingOpponentIndex, setPendingOpponentIndex] = useState<number | null>(null);
  const [lastMoveSquares, setLastMoveSquares] = useState<Record<string, { backgroundColor: string }>>({});
  // Un seul appel à `onSolved` par puzzle : le parent recharge le puzzle
  // suivant de façon asynchrone pendant que ce composant reste monté (même
  // `key`, voir `ThemeSession`) — verrou local contre un double clic, comme
  // `graded` dans `PuzzleBoard`.
  const [advancing, setAdvancing] = useState(false);

  const playerColor: "w" | "b" = puzzle.fen.split(" ")[1] === "b" ? "b" : "w";

  useEffect(() => {
    if (pendingOpponentIndex === null) return;
    const uci = puzzle.solution[pendingOpponentIndex];
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
      if (afterIndex >= puzzle.solution.length) setStatus("solved");
    }, OPPONENT_REPLY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pendingOpponentIndex, chess, puzzle.solution]);

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

    if (playedUci !== puzzle.solution[moveIndex]) {
      setStatus("wrong");
      return false; // laisse react-chessboard remettre la pièce en place
    }

    chess.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    setFen(chess.fen());
    setLastMoveSquares({});
    setStatus("playing");

    const nextIndex = moveIndex + 1;
    setMoveIndex(nextIndex);
    if (nextIndex >= puzzle.solution.length) {
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
          [puzzle.solution[moveIndex].slice(0, 2)]: { backgroundColor: qualitySquareColor("inaccuracy") },
          [puzzle.solution[moveIndex].slice(2, 4)]: { backgroundColor: qualitySquareColor("inaccuracy") },
        }
      : lastMoveSquares;

  function handleContinue() {
    if (advancing) return;
    setAdvancing(true);
    onSolved();
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="mx-auto max-w-[480px]">
        <Chessboard
          options={{
            id: "theme-puzzle-board",
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
        {status === "solved" && <p className="font-medium text-best">Résolu !</p>}
      </div>

      {status === "solved" && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={advancing}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-40"
          >
            {advancing ? "Enregistrement…" : "Continuer →"}
          </button>
        </div>
      )}
    </div>
  );
}
