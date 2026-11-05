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
import { CircleCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getNextPuzzle, getPuzzle, submitPuzzleAnswer } from "@/server/actions/practice";
import type { DeckPuzzle } from "@/server/queries/reviews";
import type { ReviewGrade } from "@/server/srs/fsrs";
import { PuzzleBoard } from "../board/puzzle-board";

type SessionState = { status: "loading" } | { status: "empty" } | { status: "puzzle"; puzzle: DeckPuzzle };

/**
 * `initialPuzzleId` : le puzzle de la carte cliquée, servi en premier (sinon
 * deux cartes différentes ouvraient le même « plus en retard »). `onExit`
 * doit rafraîchir la page : les cartes et la complétion du Plan du jour sont
 * rendues côté serveur et ne voient les puzzles résolus qu'à ce moment-là.
 */
export function RecommendedPuzzleSession({
  initialPuzzleId,
  onExit,
}: {
  initialPuzzleId?: string;
  onExit: () => void;
}) {
  const [state, setState] = useState<SessionState>({ status: "loading" });
  const [solvedCount, setSolvedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const first = initialPuzzleId
      ? getPuzzle(initialPuzzleId).then((puzzle) => puzzle ?? getNextPuzzle())
      : getNextPuzzle();
    first.then((puzzle) => {
      if (!cancelled) setState(puzzle ? { status: "puzzle", puzzle } : { status: "empty" });
    });
    return () => {
      cancelled = true;
    };
  }, [initialPuzzleId]);

  async function handleGraded(puzzle: DeckPuzzle, grade: ReviewGrade, playedUci: string | null, solvedMs: number) {
    await submitPuzzleAnswer({ puzzleId: puzzle.id, grade, playedUci, solvedMs });
    setSolvedCount((count) => count + 1);
    const next = await getNextPuzzle();
    setState(next ? { status: "puzzle", puzzle: next } : { status: "empty" });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Séance du jour · puzzle</h2>
          {solvedCount > 0 && (
            <p className="mt-0.5 text-xs text-foreground-muted">
              {solvedCount} puzzle{solvedCount > 1 ? "s" : ""} résolu{solvedCount > 1 ? "s" : ""} cette séance.
            </p>
          )}
        </div>
        <Button variant="ghost" onClick={onExit} className="shrink-0">
          <X aria-hidden="true" />
          Fermer
        </Button>
      </div>

      {state.status === "loading" && (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-foreground-muted">
          Chargement du puzzle…
        </p>
      )}

      {state.status === "empty" && (
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <p className="flex items-center justify-center gap-2 text-lg font-semibold"><CircleCheck aria-hidden="true" className="size-5 text-success" />Tout est à jour</p>
          <p className="mt-1 text-sm text-foreground-muted">
            {solvedCount > 0
              ? `${solvedCount} puzzle${solvedCount > 1 ? "s" : ""} résolu${solvedCount > 1 ? "s" : ""} — plus rien à réviser pour l'instant.`
              : "Aucun puzzle dû pour l'instant."}
          </p>
          <Button variant="primary" onClick={onExit} className="mt-4">
            Continuer
          </Button>
        </div>
      )}

      {state.status === "puzzle" && (
        <PuzzleBoard
          key={state.puzzle.id}
          puzzle={state.puzzle}
          coachComment={state.puzzle.coachComment}
          onGraded={(grade, playedUci, solvedMs) => handleGraded(state.puzzle, grade, playedUci, solvedMs)}
        />
      )}
    </div>
  );
}
