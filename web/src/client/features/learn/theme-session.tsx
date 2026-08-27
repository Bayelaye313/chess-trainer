"use client";

/**
 * Séance linéaire sur un thème — pendant équivalent de `PuzzleSession`
 * (`client/features/reviews/`) pour l'onglet « Apprendre » : charge le
 * puzzle courant du thème, l'affiche via le `PuzzleBoard` partagé
 * (`client/features/board/`, même échiquier, même hover, même jauge, même
 * réfutation active que « Entraîner »), incrémente la progression puis
 * enchaîne sur le suivant. Pas de FSRS, pas de deck : juste un curseur
 * linéaire (`completedCount`, voir `server/queries/curriculum.ts`) — d'où
 * `onComplete` plutôt que `onGraded` (voir le docstring de `PuzzleBoard`).
 */
import { useEffect, useState } from "react";
import { PuzzleBoard } from "@/client/features/board/puzzle-board";
import { getThemePuzzleSession, submitThemePuzzleSolved } from "@/server/actions/curriculum";
import type { ThemeSession as ThemeSessionData } from "@/server/queries/curriculum";
import { ProgressBar } from "./progress-bar";

type SessionState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "session"; session: ThemeSessionData };

export function ThemeSession({ themeId, onExit }: { themeId: string; onExit: () => void }) {
  const [state, setState] = useState<SessionState>({ status: "loading" });

  // `themeId` ne change jamais pour une instance montée : `LearnScreen`
  // démonte/remonte `ThemeSession` en entier à chaque sélection de thème
  // (bascule catalogue ↔ session, même schéma que `ReviewsScreen`/
  // `PuzzleSession`) — l'effet n'a que le chargement asynchrone à faire.
  useEffect(() => {
    let cancelled = false;
    getThemePuzzleSession(themeId).then((session) => {
      if (!cancelled) setState(session ? { status: "session", session } : { status: "not-found" });
    });
    return () => {
      cancelled = true;
    };
  }, [themeId]);

  async function handleSolved() {
    await submitThemePuzzleSolved(themeId);
    const next = await getThemePuzzleSession(themeId);
    setState(next ? { status: "session", session: next } : { status: "not-found" });
  }

  const title = state.status === "session" ? state.session.title : "Chargement…";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold">{title}</h1>
          {state.status === "session" && (
            <ProgressBar
              completed={state.session.completedCount}
              total={state.session.totalPuzzles}
              className="mt-2 max-w-xs"
            />
          )}
        </div>
        <button type="button" onClick={onExit} className="shrink-0 text-sm text-accent hover:underline">
          Retour à l&apos;académie
        </button>
      </div>

      {state.status === "loading" && (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-foreground-muted">
          Chargement de l&apos;exercice…
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
            Retour à l&apos;académie
          </button>
        </div>
      )}

      {state.status === "session" && state.session.puzzle && (
        <PuzzleBoard
          key={state.session.puzzle.id}
          puzzle={{
            id: state.session.puzzle.id,
            fenBefore: state.session.puzzle.fen,
            solution: state.session.puzzle.solution,
            solutionSan: state.session.puzzle.solutionSan,
          }}
          onComplete={handleSolved}
        />
      )}

      {state.status === "session" && !state.session.puzzle && (
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          {state.session.totalPuzzles === 0 ? (
            // Ne devrait plus survenir : `master-puzzles-dataset.ts` garantit
            // une entrée par thème du catalogue (voir son test). Gardé comme
            // filet défensif — jamais un puzzle « Thème maîtrisé » n'a de sens
            // ici, 0 exercice résolu sur 0 n'est pas une victoire.
            <>
              <p className="text-lg font-semibold">Aucun exercice disponible pour l&apos;instant</p>
              <p className="mt-1 text-sm text-foreground-muted">
                Le corpus actuel ne contient encore aucune position qui illustre vraiment ce thème —
                plutôt qu&apos;un exercice hors sujet, ce module attend d&apos;en recevoir un qui convienne.
              </p>
            </>
          ) : state.session.completedCount >= state.session.totalPuzzles ? (
            <>
              <p className="text-lg font-semibold text-best">Thème maîtrisé ! 🏆</p>
              <p className="mt-1 text-sm text-foreground-muted">
                {state.session.totalPuzzles} exercice{state.session.totalPuzzles > 1 ? "s" : ""} résolu
                {state.session.totalPuzzles > 1 ? "s" : ""} sur ce thème.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold">Suite du cours à venir</p>
              <p className="mt-1 text-sm text-foreground-muted">
                Les {state.session.totalPuzzles - state.session.completedCount} exercice
                {state.session.totalPuzzles - state.session.completedCount > 1 ? "s" : ""} restant
                {state.session.totalPuzzles - state.session.completedCount > 1 ? "s" : ""} de ce thème n&apos;ont
                pas encore été importés.
              </p>
            </>
          )}
          <button
            type="button"
            onClick={onExit}
            className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Retour à l&apos;académie
          </button>
        </div>
      )}
    </div>
  );
}
