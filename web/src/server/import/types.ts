/** Une partie brute récupérée d'une plateforme, avant tout parsing. */
export interface FetchedGame {
  pgn: string;
  /** Identifiant stable côté plateforme, pour le dédoublonnage (unique par source). */
  externalId: string;
}

export interface GameFetcher {
  fetchGames(username: string, maxGames: number): Promise<FetchedGame[]>;
}
