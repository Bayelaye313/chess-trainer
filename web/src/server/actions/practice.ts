"use server";

/**
 * Pont client/serveur pour l'onglet « Entraîner » (voir le docstring de
 * `server/queries/spaced-repetition.ts`, qui annonçait ce fichier). Ne fait
 * que rediriger vers les fonctions pures des deux fichiers `server/queries/*`
 * concernés — aucune logique propre ici, comme `server/actions/play.ts` pour
 * son domaine.
 */
import type { DeckId } from "@/core/chess/decks";
import { getNextDuePuzzle, listDeckOverviews, type DeckOverview, type DeckPuzzle } from "@/server/queries/reviews";
import {
  submitPuzzleAnswer as submitPuzzleAnswerQuery,
  type SubmitPuzzleAnswerInput,
} from "@/server/queries/spaced-repetition";

export async function getDeckOverviews(): Promise<DeckOverview[]> {
  return listDeckOverviews();
}

export async function getNextPuzzle(deckId: DeckId): Promise<DeckPuzzle | null> {
  return getNextDuePuzzle(deckId);
}

export async function submitPuzzleAnswer(input: SubmitPuzzleAnswerInput): Promise<boolean> {
  return submitPuzzleAnswerQuery(input);
}
