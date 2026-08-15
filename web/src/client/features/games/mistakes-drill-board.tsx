"use client";

/**
 * Mode « Rejouer mes erreurs » : un entraînement séquentiel sur les gaffes et
 * imprécisions du joueur repérées à l'analyse (voir le filtre dans
 * `game-review-screen.tsx`, calqué sur `isReviewable` — même vocabulaire que
 * les decks de révision).
 *
 * Reprend le mécanisme de `RetryBoard` (repositionner sur `fenBefore`,
 * comparer le coup glissé à `bestUci`) mais l'enchaîne sur toute la liste au
 * lieu d'un essai isolé, avec le vocabulaire demandé (« Bien joué ! » /
 * « Essaye encore ! »). Volontairement un composant séparé plutôt qu'une
 * variante de `RetryBoard` : les deux parcours ont des textes et un rythme
 * différents, et `RetryBoard` reste utilisé tel quel ailleurs (Réessayer
 * ponctuel depuis le journal des coups) — pas de risque de régression croisée.
 *
 * Découpé en deux composants : `MistakesDrillBoard` ne possède que la
 * séquence (index courant, score cumulé) ; `DrillAttempt`, remonté à chaque
 * erreur via `key={index}` — exactement le pattern déjà utilisé par
 * `RetryBoard` — possède l'essai en cours. Ça évite un `useEffect` qui
 * réinitialiserait l'essai à coups de `setState` à chaque changement d'index.
 */
import { useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs } from "react-chessboard";
import { uciOf } from "@/core/analysis/evaluate-move";
import { qualitySquareColor } from "@/lib/labels";

export interface DrillMistake {
  ply: number;
  fenBefore: string;
  bestUci: string;
  bestSan: string;
}

interface DrillScore {
  correct: number;
  attempted: number;
}

export function MistakesDrillBoard({
  mistakes,
  playerColor,
  onExit,
}: {
  mistakes: DrillMistake[];
  playerColor: "w" | "b";
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState<DrillScore>({ correct: 0, attempted: 0 });

  const current = mistakes[index] ?? null;

  if (!current) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <p className="text-lg font-semibold">Entraînement terminé</p>
        <p className="mt-1 text-sm text-foreground-muted">
          {score.correct} / {score.attempted} coup{score.attempted > 1 ? "s" : ""} trouvé
          {score.correct > 1 ? "s" : ""} du premier coup.
        </p>
        <button
          type="button"
          onClick={onExit}
          className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Retour à la revue
        </button>
      </div>
    );
  }

  return (
    <DrillAttempt
      key={index}
      index={index}
      total={mistakes.length}
      mistake={current}
      playerColor={playerColor}
      onExit={onExit}
      onScored={(isCorrect) =>
        setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), attempted: s.attempted + 1 }))
      }
      onNext={() => setIndex((i) => i + 1)}
    />
  );
}

/** Un essai sur une erreur, remonté à neuf (voir `key={index}` ci-dessus) à chaque nouvelle erreur. */
function DrillAttempt({
  index,
  total,
  mistake,
  playerColor,
  onExit,
  onScored,
  onNext,
}: {
  index: number;
  total: number;
  mistake: DrillMistake;
  playerColor: "w" | "b";
  onExit: () => void;
  /** Un seul appel par erreur, voir `scoredRef` — « Réessayer » ne recompte pas le score. */
  onScored: (isCorrect: boolean) => void;
  onNext: () => void;
}) {
  const [fen, setFen] = useState(mistake.fenBefore);
  const [playedSan, setPlayedSan] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const scoredRef = useRef(false);

  function reset() {
    setFen(mistake.fenBefore);
    setPlayedSan(null);
    setResult(null);
  }

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean {
    if (result || !targetSquare) return false;
    const chess = new Chess(mistake.fenBefore);
    let move;
    try {
      move = chess.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    } catch {
      return false;
    }
    const isCorrect = uciOf(move) === mistake.bestUci;
    setFen(chess.fen());
    setPlayedSan(move.san);
    setResult(isCorrect ? "correct" : "incorrect");
    if (!scoredRef.current) {
      scoredRef.current = true;
      onScored(isCorrect);
    }
    return true;
  }

  function canDragPiece({ piece }: PieceHandlerArgs): boolean {
    return !result && piece.pieceType.startsWith(playerColor);
  }

  const hintSquares =
    result === "incorrect"
      ? {
          [mistake.bestUci.slice(0, 2)]: { backgroundColor: qualitySquareColor("best") },
          [mistake.bestUci.slice(2, 4)]: { backgroundColor: qualitySquareColor("best") },
        }
      : {};

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between text-sm text-foreground-muted">
        <span>
          Erreur {index + 1} / {total}
        </span>
        <button type="button" onClick={onExit} className="text-accent hover:underline">
          Quitter l&apos;entraînement
        </button>
      </div>

      <div className="mx-auto max-w-[480px]">
        <Chessboard
          options={{
            id: "mistakes-drill-board",
            position: fen,
            boardOrientation: playerColor === "w" ? "white" : "black",
            onPieceDrop,
            canDragPiece,
            squareStyles: hintSquares,
          }}
        />
      </div>

      <div className="mt-4 min-h-6 text-center text-sm">
        {result === null && <p className="text-foreground-muted">Trouve la meilleure alternative.</p>}
        {result === "correct" && <p className="font-medium text-best">Bien joué !</p>}
        {result === "incorrect" && (
          <p className="font-medium text-blunder">
            Essaye encore !{playedSan ? ` (${playedSan} n'était pas le meilleur coup` : ""}
            {playedSan ? ` — c'était ${mistake.bestSan})` : ""}
          </p>
        )}
      </div>

      <div className="mt-3 flex justify-center gap-3">
        {result === "incorrect" && (
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface-muted"
          >
            Réessayer
          </button>
        )}
        {result !== null && (
          <button
            type="button"
            onClick={onNext}
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            {index + 1 < total ? "Coup suivant" : "Terminer"}
          </button>
        )}
      </div>
    </div>
  );
}
