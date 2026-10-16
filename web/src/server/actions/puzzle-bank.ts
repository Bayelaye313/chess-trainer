"use server";

import {
  fetchDailyPuzzle,
  fetchRandomPuzzle,
  type BankPuzzle,
  type PuzzleDifficulty,
  type PuzzleTheme,
} from "@/server/puzzle-bank/lichess-puzzle-api";

// Réexportés : le client n'importe jamais directement de `server/puzzle-bank/*`.
export type { BankPuzzle, PuzzleDifficulty, PuzzleTheme };

export type GetPuzzleResult = { puzzle: BankPuzzle } | { error: string };

function toResult(promise: Promise<BankPuzzle>): Promise<GetPuzzleResult> {
  return promise
    .then((puzzle) => ({ puzzle }))
    .catch((cause: unknown) => ({
      error: cause instanceof Error ? cause.message : "Lichess est injoignable pour l'instant.",
    }));
}

export function getDailyPuzzle(): Promise<GetPuzzleResult> {
  return toResult(fetchDailyPuzzle());
}

export function getNextPuzzle(filters: {
  theme?: PuzzleTheme;
  difficulty?: PuzzleDifficulty;
}): Promise<GetPuzzleResult> {
  return toResult(fetchRandomPuzzle(filters));
}
