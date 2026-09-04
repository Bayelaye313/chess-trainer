"use client";

/**
 * Page de Cours — s'intercale désormais TOUJOURS entre la frise de thèmes
 * (`ThemePath`) et la résolution d'exercices (`ThemeSession`), voir
 * `LearnScreen` (`LearnView.kind === "lesson"`). Audit UX du 2026-09-02 :
 * l'utilisateur ne doit plus tomber directement sur l'échiquier sans qu'on
 * lui ait d'abord expliqué le concept — particulièrement criant pour les
 * thèmes stratégiques (Positional Mastery, structures de pions en finale).
 *
 * Contenu résolu par `resolveLessonContent` (`core/curriculum/lesson-content.ts`)
 * — une rédaction curatée pour les thèmes stratégiques, un gabarit généré
 * ailleurs, jamais de page vide. Le diagramme d'illustration réutilise le FEN
 * du premier exercice du thème (`getThemePuzzleSession`, même Server Action
 * que `ThemeSession`) — position de départ standard en repli tant qu'il
 * charge ou si le thème n'a encore aucun exercice importé.
 *
 * Ce diagramme est désormais un mini-tutoriel INTERACTIF façon Lichess
 * (`MotifIntroBoard`, cahier des charges du 2026-09-03) dès que la solution du
 * puzzle permet d'en dériver un (`buildMotifIntro`) — sinon repli sur le
 * diagramme statique historique (position seule, jamais de flèche inventée).
 */
import { useEffect, useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import { resolveLessonContent } from "@/core/curriculum/lesson-content";
import { buildMotifIntro } from "@/core/curriculum/motif-intro";
import { getThemePuzzleSession } from "@/server/actions/curriculum";
import type { CurriculumCategoryMeta } from "@/core/curriculum/catalog";
import type { CurriculumThemeOverview, ThemePuzzle } from "@/server/queries/curriculum";
import { MotifIntroBoard } from "./motif-intro-board";
import { moduleIcon } from "./module-icon";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/** Le diagramme statique (repli) n'est jamais interactif — pur repère visuel, comme le mini-échiquier du Rapport (`HallOfFame`). */
function neverDraggable(): boolean {
  return false;
}

export function ThemeLesson({
  theme,
  category,
  onStart,
  onExit,
}: {
  theme: CurriculumThemeOverview;
  category: CurriculumCategoryMeta;
  onStart: () => void;
  onExit: () => void;
}) {
  const lesson = resolveLessonContent(theme, category);
  const [diagramPuzzle, setDiagramPuzzle] = useState<ThemePuzzle | null>(null);

  // Jamais besoin de remettre `diagramPuzzle` à `null` en tête d'effet ici :
  // `LearnScreen` monte ce composant avec `key={theme.id}`, donc un
  // changement de thème remonte `ThemeLesson` à neuf plutôt que de réutiliser
  // cet état — voir le commentaire sur `<ThemeLesson key={...}>`.
  useEffect(() => {
    let cancelled = false;
    getThemePuzzleSession(theme.id).then((session) => {
      if (!cancelled && session?.puzzle) setDiagramPuzzle(session.puzzle);
    });
    return () => {
      cancelled = true;
    };
  }, [theme.id]);

  // `null` tant que le puzzle n'a pas encore chargé, hors théorie (aucune
  // solution utilisable), ou structurellement injouable (voir
  // `buildMotifIntro`) — le repli reste alors le diagramme statique.
  const motifIntro = useMemo(() => {
    if (!diagramPuzzle || diagramPuzzle.solution.length === 0 || diagramPuzzle.solutionSan.length === 0) return null;
    return buildMotifIntro(diagramPuzzle.fen, diagramPuzzle.solution[0], diagramPuzzle.solutionSan[0]);
  }, [diagramPuzzle]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">
            {moduleIcon(category.id)} {theme.title}
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">Module « {category.label} » — cours avant exercices.</p>
        </div>
        <button type="button" onClick={onExit} className="shrink-0 text-sm text-accent hover:underline">
          ← Retour aux thèmes
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-5 rounded-lg border border-border bg-surface p-5">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">🎯 Objectif</h2>
            <p className="mt-2 text-sm text-foreground">{lesson.objective}</p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">💡 Idées clés</h2>
            <ul className="mt-2 space-y-2">
              {lesson.keyIdeas.map((idea, index) => (
                <li key={index} className="flex gap-2 text-sm text-foreground">
                  <span aria-hidden="true" className="mt-0.5 shrink-0 text-accent">
                    ●
                  </span>
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[240px]">
          {motifIntro ? (
            <MotifIntroBoard intro={motifIntro} />
          ) : (
            <>
              <Chessboard
                options={{
                  id: `lesson-diagram-${theme.id}`,
                  position: diagramPuzzle?.fen ?? START_FEN,
                  canDragPiece: neverDraggable,
                }}
              />
              <p className="mt-2 text-center text-xs text-foreground-muted">Diagramme d&apos;illustration</p>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onStart}
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Passer aux exercices ➔
        </button>
      </div>
    </div>
  );
}
