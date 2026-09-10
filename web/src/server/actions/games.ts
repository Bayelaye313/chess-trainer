"use server";

/**
 * Pont client/serveur pour la recherche instantanée de la liste des parties
 * (`GamesSearchList`, onglet « Jouer contre le Bot ») — même patron que
 * `practice.ts` : aucune logique propre, juste une redirection vers la
 * lecture pure `searchGamesSummary`.
 */
import { searchGamesSummary, type GameSummary } from "@/server/queries/games";

export async function searchGames(query: string): Promise<GameSummary[]> {
  return searchGamesSummary(query);
}
