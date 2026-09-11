"use client";

/**
 * Mode « Revoir les puzzles » — sprint de clôture du 2026-09-11 : rejeu
 * libre de la vague complète d'un thème, accessible depuis le tableau de
 * bord du cursus (thème déjà maîtrisé) ou depuis l'écran « Thème maîtrisé ! »
 * de `ThemeSession` juste après l'avoir terminé.
 *
 * Différence structurante avec `ThemeSession` : AUCUNE écriture serveur.
 * `getThemePuzzleReviewSession` (lecture pure, voir son docstring côté
 * `server/queries/curriculum.ts`) sert la vague entière en un seul appel ;
 * tout le reste — quel puzzle est affiché, combien sont « faits » dans CETTE
 * session — vit uniquement dans l'état local de ce composant. Le score
 * global (`userThemeProgress.completedCount`) n'est jamais touché : réussir
 * un puzzle ici ne fait JAMAIS avancer la vraie progression, seulement le
 * HUD segmenté de la session de révision courante (réutilise directement
 * `AcademyPuzzleArena`/`WaveHud`, avec `completedCount`/`totalPuzzles`
 * pointant sur `reviewIndex`/`puzzles.length` plutôt que sur la progression
 * serveur).
 *
 * Multi-coups : `AcademyPuzzleArena` enveloppe le même `PuzzleBoard`/
 * `usePuzzleSolver` que partout ailleurs dans l'appli (`client/features/board/`)
 * — la boucle `solving ↔ opponent-reply` qui rejoue la réponse adverse
 * scriptée et n'appelle `onComplete` (donc `handleSolved` ci-dessous, donc le
 * son `playFx("excellent")`) qu'une fois la totalité de `puzzle.solution`
 * consommée est DÉJÀ générique à N coups — rien de nouveau à écrire ici,
 * dupliquer cette machine à états dans ce fichier serait exactement le
 * risque de divergence de comportement que le cahier des charges du sprint
 * demande d'éviter.
 *
 * Pas de `useEffect` avec `setState` synchrone hors chargement initial :
 * `handleSolved` (callback pur déclenché par `PuzzleBoard.onComplete`) et
 * `handleRestart` (callback pur du bouton « Recommencer ») sont les deux
 * seuls points qui font avancer l'état local — même contrainte que
 * `academy-puzzle-arena.tsx` (`react-hooks/set-state-in-effect`).
 */
import { useEffect, useState } from "react";
import { getThemePuzzleReviewSession } from "@/server/actions/curriculum";
import type { ThemeReviewSession as ThemeReviewSessionData } from "@/server/queries/curriculum";
import { AcademyPuzzleArena } from "./academy-puzzle-arena";
import { CoachBubble } from "./coach-bubble";

type ReviewState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "session"; session: ThemeReviewSessionData };

interface LastSolved {
  solutionSan: readonly string[];
  sourceRef: string | null;
}

export function ThemeReviewSession({
  themeId,
  description,
  onExit,
}: {
  themeId: string;
  /** Description du thème, déjà connue de l'appelant — même contrat que `ThemeSession`. */
  description: string | null;
  onExit: () => void;
}) {
  const [state, setState] = useState<ReviewState>({ status: "loading" });
  // Curseur 100% local — jamais lu depuis `userThemeProgress`. `attempt`
  // change de valeur à chaque « Recommencer » pour forcer un remontage
  // complet de `AcademyPuzzleArena` (donc de `PuzzleBoard`/`usePuzzleSolver`)
  // même quand on revient au puzzle d'indice 0 (une vague à 1 seul puzzle
  // rejouerait sinon la même instance `chess.js`, déjà arrivée à sa position
  // finale, via `key` inchangée).
  const [reviewIndex, setReviewIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [lastSolved, setLastSolved] = useState<LastSolved | null>(null);

  // `themeId` ne change jamais pour une instance montée (même schéma que
  // `ThemeSession` — l'appelant démonte/remonte au lieu de faire varier la
  // prop) : l'effet n'a que le chargement asynchrone à faire, une seule fois.
  useEffect(() => {
    let cancelled = false;
    getThemePuzzleReviewSession(themeId).then((session) => {
      if (!cancelled) setState(session ? { status: "session", session } : { status: "not-found" });
    });
    return () => {
      cancelled = true;
    };
  }, [themeId]);

  function handleSolved() {
    if (state.status === "session") {
      const puzzle = state.session.puzzles[reviewIndex];
      if (puzzle) setLastSolved({ solutionSan: puzzle.solutionSan, sourceRef: puzzle.sourceRef });
    }
    setReviewIndex((index) => index + 1);
  }

  function handleRestart() {
    setReviewIndex(0);
    setAttempt((a) => a + 1);
    setLastSolved(null);
  }

  const title = state.status === "session" ? `Révision — ${state.session.title}` : "Chargement…";
  const puzzles = state.status === "session" ? state.session.puzzles : [];
  const currentPuzzle = puzzles[reviewIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold">{title}</h1>
          {state.status === "session" && (
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-accent">🔁 Mode Révision — le score global n&apos;est pas affecté</p>
          )}
        </div>
        <button type="button" onClick={onExit} className="shrink-0 text-sm text-accent hover:underline">
          ← Retour aux thèmes
        </button>
      </div>

      {description &&
        state.status === "session" &&
        currentPuzzle &&
        (lastSolved ? (
          <CoachBubble variant="debrief" description={description} solutionSan={lastSolved.solutionSan} sourceRef={lastSolved.sourceRef} />
        ) : (
          <CoachBubble variant="brief" description={description} />
        ))}

      {state.status === "loading" && (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-foreground-muted">
          Chargement de la vague…
        </p>
      )}

      {state.status === "not-found" && (
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-lg font-semibold">Thème introuvable</p>
          <button
            type="button"
            onClick={onExit}
            className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Retour aux thèmes
          </button>
        </div>
      )}

      {state.status === "session" && currentPuzzle && (
        <AcademyPuzzleArena
          key={`${currentPuzzle.id}-${attempt}`}
          puzzle={{
            id: currentPuzzle.id,
            fenBefore: currentPuzzle.fen,
            solution: currentPuzzle.solution,
            solutionSan: currentPuzzle.solutionSan,
          }}
          completedCount={reviewIndex}
          totalPuzzles={puzzles.length}
          onSolved={handleSolved}
        />
      )}

      {state.status === "session" && !currentPuzzle && puzzles.length > 0 && (
        <div className="animate-fade-up-in rounded-lg border border-border bg-surface p-8 text-center">
          <span aria-hidden="true" className="text-4xl">
            🔁
          </span>
          <p className="mt-2 text-lg font-semibold text-best">Session de révision terminée !</p>
          <p className="mt-1 text-sm text-foreground-muted">
            {puzzles.length} exercice{puzzles.length > 1 ? "s" : ""} revu{puzzles.length > 1 ? "s" : ""} — le score global du thème n&apos;a pas changé.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRestart}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              🔁 Revoir encore
            </button>
            <button
              type="button"
              onClick={onExit}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted"
            >
              Retour aux thèmes
            </button>
          </div>
        </div>
      )}

      {state.status === "session" && puzzles.length === 0 && (
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-lg font-semibold">Aucun exercice à revoir</p>
          <p className="mt-1 text-sm text-foreground-muted">Ce thème ne porte encore aucune position importée.</p>
          <button
            type="button"
            onClick={onExit}
            className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Retour aux thèmes
          </button>
        </div>
      )}
    </div>
  );
}
