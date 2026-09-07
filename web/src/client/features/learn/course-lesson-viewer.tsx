"use client";

/**
 * Lecteur d'un `CourseLesson` (`core/curriculum/course-lesson.ts`) — la
 * version « étude Lichess complète » de `ThemeDemoBoard` : on ne joue pas un
 * coup, on TOURNE LES PAGES d'un vrai cours à plusieurs chapitres, chacun sa
 * position réelle, son commentaire, et ses coups clés affichés en texte sous
 * le diagramme (jamais rejoués case par case — voir le docstring de
 * `course-lesson.ts`). Échiquier en lecture seule : `canDragPiece` renvoie
 * toujours `false`, aucun coup n'est attendu du joueur ici.
 *
 * `onComplete` prévient le parent (`ThemeLesson`) une seule fois, dès que le
 * dernier chapitre est atteint — même contrat que `ThemeDemoBoard`, pour
 * débloquer le bouton « Passer aux exercices ».
 */
import { useEffect, useRef, useState } from "react";
import { Chessboard, type PieceHandlerArgs } from "react-chessboard";
import type { CourseLesson } from "@/core/curriculum/course-lesson";

const GREEN = "var(--quality-best)";
const RED = "var(--quality-blunder)";

function neverDraggable(_args: PieceHandlerArgs): boolean {
  return false;
}

export function CourseLessonViewer({ lesson, onComplete }: { lesson: CourseLesson; onComplete?: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = lesson.steps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === lesson.steps.length - 1;

  // Un seul appel à `onComplete`, même si le joueur revient en arrière ensuite
  // — même garde que `ThemeDemoBoard` (`notifiedRef`).
  const notifiedRef = useRef(false);
  useEffect(() => {
    if (isLastStep && !notifiedRef.current) {
      notifiedRef.current = true;
      onComplete?.();
    }
  }, [isLastStep, onComplete]);

  const arrows = (step.arrows ?? []).map((arrow) => ({
    startSquare: arrow.from,
    endSquare: arrow.to,
    color: arrow.color === "red" ? RED : GREEN,
  }));

  const squareStyles: Record<string, { backgroundColor: string }> = {};
  for (const highlight of step.highlights ?? []) {
    squareStyles[highlight.square] = { backgroundColor: highlight.color === "red" ? "rgba(239, 68, 68, 0.35)" : "rgba(34, 197, 94, 0.35)" };
  }

  return (
    <div className="mx-auto w-full max-w-[760px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="w-full shrink-0 sm:w-[360px]">
          <Chessboard
            options={{ id: "course-lesson-board", position: step.fen, canDragPiece: neverDraggable, arrows, squareStyles }}
          />
        </div>
        <div key={stepIndex} className="min-w-0 flex-1 animate-fade-up-in">
          <p className="text-sm font-semibold text-foreground">
            Chapitre {stepIndex + 1}/{lesson.steps.length} — {step.title}
          </p>
          <p className="mt-2 max-h-[26rem] overflow-y-auto rounded-md border border-border bg-surface-muted/40 p-3 text-sm leading-relaxed text-foreground">
            {step.text}
          </p>
          {step.moveSan && step.moveSan.length > 0 && (
            <p className="mt-1.5 text-sm text-foreground-muted">
              <span aria-hidden="true">♟ </span>
              Coup{step.moveSan.length > 1 ? "s" : ""} clé{step.moveSan.length > 1 ? "s" : ""} : {step.moveSan.join(" ")}
            </p>
          )}
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-1.5" aria-hidden="true">
        {lesson.steps.map((_, index) => (
          <span
            key={index}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${index === stepIndex ? "bg-accent" : "bg-border"}`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setStepIndex((index) => Math.max(index - 1, 0))}
          disabled={isFirstStep}
          className="rounded-md border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Précédent
        </button>
        <button
          type="button"
          onClick={() => setStepIndex((index) => Math.min(index + 1, lesson.steps.length - 1))}
          disabled={isLastStep}
          className="rounded-md border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
