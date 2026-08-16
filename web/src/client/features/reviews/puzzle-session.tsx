"use client";

/**
 * Séance sur un deck : charge le premier puzzle dû, l'affiche via
 * `PuzzleBoard`, puis enchaîne sur le suivant après chaque réponse notée
 * (`submitPuzzleAnswer`). S'arrête quand `getNextPuzzle` ne renvoie plus rien
 * — le deck est à jour pour aujourd'hui.
 */
import { useEffect, useState } from "react";
import { DECKS, type DeckId } from "@/core/chess/decks";
import { getNextPuzzle, submitPuzzleAnswer } from "@/server/actions/practice";
import type { DeckPuzzle } from "@/server/queries/reviews";
import type { ReviewGrade } from "@/server/srs/fsrs";
import { PuzzleBoard } from "./puzzle-board";

type SessionState = { status: "loading" } | { status: "empty" } | { status: "puzzle"; puzzle: DeckPuzzle };

export function PuzzleSession({ deckId, onExit }: { deckId: DeckId; onExit: () => void }) {
  const [state, setState] = useState<SessionState>({ status: "loading" });
  const [solvedCount, setSolvedCount] = useState(0);

  const deckTitle = DECKS.find((deck) => deck.id === deckId)?.title ?? deckId;

  // `deckId` ne change jamais pour une instance montée : `ReviewsScreen`
  // démonte/remonte `PuzzleSession` en entier à chaque sélection de deck
  // (bascule dashboard ↔ session). L'état initial (`loading`, 0 résolu)
  // couvre donc déjà le cas « nouveau deck » — l'effet n'a que le chargement
  // asynchrone à faire.
  useEffect(() => {
    let cancelled = false;
    getNextPuzzle(deckId).then((puzzle) => {
      if (!cancelled) setState(puzzle ? { status: "puzzle", puzzle } : { status: "empty" });
    });
    return () => {
      cancelled = true;
    };
  }, [deckId]);

  async function handleGraded(
    puzzle: DeckPuzzle,
    grade: ReviewGrade,
    playedUci: string | null,
    solvedMs: number,
  ) {
    await submitPuzzleAnswer({ puzzleId: puzzle.id, grade, playedUci, solvedMs });
    setSolvedCount((count) => count + 1);
    const next = await getNextPuzzle(deckId);
    setState(next ? { status: "puzzle", puzzle: next } : { status: "empty" });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{deckTitle}</h1>
          {solvedCount > 0 && (
            <p className="text-sm text-foreground-muted">
              {solvedCount} puzzle{solvedCount > 1 ? "s" : ""} résolu{solvedCount > 1 ? "s" : ""} cette session.
            </p>
          )}
        </div>
        <button type="button" onClick={onExit} className="shrink-0 text-sm text-accent hover:underline">
          Quitter la session
        </button>
      </div>

      {state.status === "loading" && (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-foreground-muted">
          Chargement du puzzle…
        </p>
      )}

      {state.status === "empty" && (
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-lg font-semibold">Deck à jour ! 👍</p>
          <p className="mt-1 text-sm text-foreground-muted">
            {solvedCount > 0
              ? `${solvedCount} puzzle${solvedCount > 1 ? "s" : ""} résolu${solvedCount > 1 ? "s" : ""} — plus rien à réviser ici pour l'instant.`
              : "Aucune carte due dans ce deck pour l'instant."}
          </p>
          <button
            type="button"
            onClick={onExit}
            className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Retour aux decks
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
