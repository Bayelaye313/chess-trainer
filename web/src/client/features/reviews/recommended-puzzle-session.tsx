"use client";

/**
 * Séance de puzzles à réviser lancée directement depuis la Séance recommandée
 * de l'accueil (`training-recommendations-card.tsx`, action « Puzzle à
 * réviser », priorité 100) — flux continu SANS redirection vers l'onglet
 * Entraîner (cahier des charges explicite) : cliquer sur la recommandation
 * remplace la grille d'actions par cet échiquier, « Continuer →/Suivant »
 * charge le puzzle dû suivant SUR PLACE, jusqu'à épuisement de la file.
 *
 * Mêmes briques que `PuzzleSession` (onglet Entraîner), tous decks confondus
 * (`getNextPuzzle()` sans `deckId` — voir `server/queries/reviews.ts`) : ce
 * composant ne fait que rejouer ce pont dans un contexte d'accueil, sans
 * jamais naviguer.
 */
import { useEffect, useState } from "react";
import { getNextPuzzle, submitPuzzleAnswer } from "@/server/actions/practice";
import type { DeckPuzzle } from "@/server/queries/reviews";
import type { ReviewGrade } from "@/server/srs/fsrs";
import { PuzzleBoard } from "../board/puzzle-board";

type SessionState = { status: "loading" } | { status: "empty" } | { status: "puzzle"; puzzle: DeckPuzzle };

export function RecommendedPuzzleSession({ onExit }: { onExit: () => void }) {
  const [state, setState] = useState<SessionState>({ status: "loading" });
  const [solvedCount, setSolvedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getNextPuzzle().then((puzzle) => {
      if (!cancelled) setState(puzzle ? { status: "puzzle", puzzle } : { status: "empty" });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleGraded(puzzle: DeckPuzzle, grade: ReviewGrade, playedUci: string | null, solvedMs: number) {
    await submitPuzzleAnswer({ puzzleId: puzzle.id, grade, playedUci, solvedMs });
    setSolvedCount((count) => count + 1);
    const next = await getNextPuzzle();
    setState(next ? { status: "puzzle", puzzle: next } : { status: "empty" });
  }

  return (
    <div className="space-y-4 sm:col-span-2 lg:col-span-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">🧩 Puzzle à réviser</h2>
          {solvedCount > 0 && (
            <p className="mt-0.5 text-xs text-foreground-muted">
              {solvedCount} puzzle{solvedCount > 1 ? "s" : ""} résolu{solvedCount > 1 ? "s" : ""} cette séance.
            </p>
          )}
        </div>
        <button type="button" onClick={onExit} className="shrink-0 text-xs text-accent hover:underline">
          ✕ Fermer
        </button>
      </div>

      {state.status === "loading" && (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-foreground-muted">
          Chargement du puzzle…
        </p>
      )}

      {state.status === "empty" && (
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-lg font-semibold">Tout est à jour ! 👍</p>
          <p className="mt-1 text-sm text-foreground-muted">
            {solvedCount > 0
              ? `${solvedCount} puzzle${solvedCount > 1 ? "s" : ""} résolu${solvedCount > 1 ? "s" : ""} — plus rien à réviser pour l'instant.`
              : "Aucun puzzle dû pour l'instant."}
          </p>
          <button
            type="button"
            onClick={onExit}
            className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Retour
          </button>
        </div>
      )}

      {state.status === "puzzle" && (
        <PuzzleBoard
          key={state.puzzle.id}
          puzzle={state.puzzle}
          onGraded={(grade, playedUci, solvedMs) => handleGraded(state.puzzle, grade, playedUci, solvedMs)}
        />
      )}
    </div>
  );
}
