"use client";

/**
 * L'échiquier d'un puzzle de révision : l'utilisateur joue le camp qui a fait
 * l'erreur (déduit du trait sur `fenBefore`) et doit retrouver `solution`,
 * coup par coup — les coups adverses (rangs impairs du tableau, voir
 * `puzzles.ts`) sont rejoués automatiquement après un court délai.
 *
 * Même mécanique que `RetryBoard`/`MistakesDrillBoard` (chess.js + react-
 * chessboard, comparaison à un UCI de référence, indice sur les cases) mais
 * enchaînée sur plusieurs coups et sans révéler le coup attendu en cas
 * d'erreur — un indice discret sur l'échiquier, pas un SAN affiché en toutes
 * lettres. Remonté à neuf par le parent (`key={puzzle.id}`, voir
 * `PuzzleSession`) à chaque nouveau puzzle, comme `DrillAttempt` l'est déjà
 * pour chaque erreur.
 */
import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs } from "react-chessboard";
import { OPPONENT_MOVE_SQUARE_COLOR, qualitySquareColor } from "@/lib/labels";
import type { DeckPuzzle } from "@/server/queries/reviews";
import type { ReviewGrade } from "@/server/srs/fsrs";
import { GradePanel } from "./grade-panel";

const OPPONENT_REPLY_DELAY_MS = 500;

type Status = "playing" | "wrong" | "solved";

export function PuzzleBoard({
  puzzle,
  onGraded,
}: {
  puzzle: DeckPuzzle;
  onGraded: (grade: ReviewGrade, playedUci: string | null, solvedMs: number) => void;
}) {
  const [chess] = useState(() => new Chess(puzzle.fenBefore));
  const [fen, setFen] = useState(puzzle.fenBefore);
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState<Status>("playing");
  const [pendingOpponentIndex, setPendingOpponentIndex] = useState<number | null>(null);
  const [lastMoveSquares, setLastMoveSquares] = useState<Record<string, { backgroundColor: string }>>({});
  // Un seul appel à `onGraded` par puzzle : le parent recharge le puzzle
  // suivant de façon asynchrone, ce composant reste monté (même `key`)
  // pendant ce court instant — verrou local pour ignorer un double clic.
  const [graded, setGraded] = useState(false);

  const playerColor: "w" | "b" = puzzle.fenBefore.split(" ")[1] === "b" ? "b" : "w";
  const firstPlayedUciRef = useRef<string | null>(null);
  // `Date.now()` est impur (interdit pendant le rendu) : l'horodatage de
  // départ est pris dans un effet, pas dans l'initialiseur du ref.
  const startedAtRef = useRef<number>(0);
  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  // Rejoue automatiquement le coup adverse suivant, s'il y en a un.
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
    firstPlayedUciRef.current ??= playedUci;

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

  function handleGrade(grade: ReviewGrade) {
    if (graded) return;
    setGraded(true);
    onGraded(grade, firstPlayedUciRef.current, Date.now() - startedAtRef.current);
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="mx-auto max-w-[480px]">
        <Chessboard
          options={{
            id: "puzzle-review-board",
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
        <div className="mt-4">
          {graded ? (
            <p className="text-center text-sm text-foreground-muted">Enregistrement…</p>
          ) : (
            <GradePanel onGrade={handleGrade} />
          )}
        </div>
      )}
    </div>
  );
}
