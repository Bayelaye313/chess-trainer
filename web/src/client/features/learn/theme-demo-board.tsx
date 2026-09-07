"use client";

/**
 * Échiquier de cours VRAIMENT interactif, façon tutoriel Lichess — cahier des
 * charges du 2026-09-06 : « le joueur ne lit pas juste du texte, le cours lui
 * demande de jouer 2 ou 3 coups d'illustration directement sur l'échiquier de
 * démo ». Remplace l'ancienne version qui se contentait de rejouer la
 * séquence toute seule en boucle (l'utilisateur restait spectateur).
 *
 * Chaque étape (`core/curriculum/theme-demo.ts`) est soit :
 *  - EXPLICATIVE (`expectedMove` absent) : légende + flèches, un bouton
 *    « Suivant » fait avancer ;
 *  - INTERACTIVE (`expectedMove` défini) : le joueur doit DÉPLACER la pièce
 *    indiquée par la flèche verte — un autre coup ne touche jamais le
 *    plateau (retour `false`, la pièce revient à sa case, comme
 *    `usePuzzleSolver`), un petit indice ambre apparaît le temps du prochain
 *    essai.
 *
 * `onComplete` prévient le parent (`ThemeLesson`) une seule fois, dès que la
 * dernière étape est atteinte — c'est CE signal qui débloque le bouton
 * « Passer aux exercices » (jamais avant, cahier des charges explicite).
 */
import { useEffect, useRef, useState } from "react";
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs } from "react-chessboard";
import type { ThemeDemo } from "@/core/curriculum/theme-demo";

const THREAT_ARROW_COLOR = "var(--quality-blunder)";
const SOLUTION_ARROW_COLOR = "var(--quality-best)";

export function ThemeDemoBoard({ demo, onComplete }: { demo: ThemeDemo; onComplete?: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [wrongAttempt, setWrongAttempt] = useState(false);
  const step = demo.steps[stepIndex];
  const isLastStep = stepIndex === demo.steps.length - 1;

  // Un seul appel à `onComplete`, même si le joueur revoit la démonstration
  // ensuite (« Revoir » ci-dessous) — débloquer les exercices une fois ne se
  // reverrouille jamais.
  const notifiedRef = useRef(false);
  useEffect(() => {
    if (isLastStep && !notifiedRef.current) {
      notifiedRef.current = true;
      onComplete?.();
    }
  }, [isLastStep, onComplete]);

  function advance() {
    setWrongAttempt(false);
    setStepIndex((index) => Math.min(index + 1, demo.steps.length - 1));
  }

  function replay() {
    setWrongAttempt(false);
    setStepIndex(0);
  }

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean {
    if (!step.expectedMove || !targetSquare) return false;
    const matches = sourceSquare === step.expectedMove.from && targetSquare === step.expectedMove.to;
    if (matches) {
      advance();
      return true;
    }
    setWrongAttempt(true);
    return false;
  }

  function canDragPiece({ square }: PieceHandlerArgs): boolean {
    return step.expectedMove?.from === square;
  }

  const arrows = step.arrows.map((arrow) => ({
    startSquare: arrow.from,
    endSquare: arrow.to,
    color: arrow.kind === "threat" ? THREAT_ARROW_COLOR : SOLUTION_ARROW_COLOR,
  }));

  return (
    <div className="mx-auto w-full max-w-[280px]">
      <Chessboard
        options={{ id: "theme-demo-board", position: step.fen, canDragPiece, onPieceDrop, arrows }}
      />
      <p
        key={stepIndex}
        className="mt-2 min-h-16 rounded-md border border-border bg-surface-muted/40 p-2 text-center text-xs text-foreground animate-fade-up-in"
      >
        <span aria-hidden="true">🎓 </span>
        {step.caption}
      </p>
      {wrongAttempt && (
        <p className="mt-1 text-center text-xs font-medium text-inaccuracy">
          Pas ce coup — regarde la flèche verte 🟢 et déplace la pièce qu&apos;elle indique.
        </p>
      )}
      <div className="mt-2 flex justify-center gap-1.5" aria-hidden="true">
        {demo.steps.map((_, index) => (
          <span
            key={index}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${index === stepIndex ? "bg-accent" : "bg-border"}`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-center">
        {!step.expectedMove && !isLastStep && (
          <button
            type="button"
            onClick={advance}
            className="rounded-md border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-surface-muted"
          >
            Suivant →
          </button>
        )}
        {isLastStep && (
          <button
            type="button"
            onClick={replay}
            className="rounded-md border border-border px-3 py-1 text-xs text-foreground-muted hover:bg-surface-muted"
          >
            ↺ Revoir la démonstration
          </button>
        )}
      </div>
    </div>
  );
}
