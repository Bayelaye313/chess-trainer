"use server";

/**
 * Pont client/serveur pour l'onglet « Entraîner » (voir le docstring de
 * `server/queries/spaced-repetition.ts`, qui annonçait ce fichier). Ne fait
 * que rediriger vers les fonctions pures des deux fichiers `server/queries/*`
 * concernés — aucune logique propre ici, comme `server/actions/play.ts` pour
 * son domaine.
 */
import type { DeckId } from "@/core/chess/decks";
import type { GameResult } from "@/core/chess/types";
import { listRepertoireDeviationGames, type DeviationGameSummary } from "@/server/queries/opening-mistakes";
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

/**
 * DTO du journal d'erreurs d'ouverture (`OpeningMistakesHub`) — date convertie
 * en ISO (jamais un `Date` brut traversant la frontière RSC, même convention
 * que `recordOpeningDrillResult`/`DeckOverview`) ; `formatRelativeDate` la
 * reconstruit côté client.
 */
export interface DeviationGameSummaryDto extends Omit<DeviationGameSummary, "playedAt" | "result"> {
  playedAt: string;
  result: GameResult | null;
}

/**
 * Charge à la demande (jamais au chargement de `/entrainer`) : appelé quand le
 * joueur ouvre le journal depuis la carte du deck « Erreurs d'ouverture »
 * (`DeckDashboard`) — croise le catalogue théorique et les parties importées,
 * plus coûteux que le simple dénombrement de `listDeckOverviews`.
 */
export async function getOpeningMistakesHub(): Promise<DeviationGameSummaryDto[]> {
  const games = await listRepertoireDeviationGames();
  return games.map((game) => ({ ...game, playedAt: game.playedAt.toISOString() }));
}
