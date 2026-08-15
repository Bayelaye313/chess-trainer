import "server-only";
import type { FetchedGame, GameFetcher } from "./types";

/** Chess.com exige un User-Agent explicite sur son API publique. */
const HEADERS = {
  "User-Agent": "ChessTrainerLocal/1.0 (projet local personnel, sans finalité commerciale)",
};

const REQUEST_TIMEOUT_MS = 15_000;

interface ChesscomGame {
  pgn?: string;
  url?: string;
  rules?: string;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: HEADERS,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Chess.com a répondu ${response.status} pour ${url}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Récupère les parties les plus récentes d'un joueur Chess.com, tous
 * contrôles de temps confondus, en s'arrêtant à `maxGames`.
 *
 * L'API publique organise les parties par mois d'archive : on parcourt les
 * mois du plus récent au plus ancien, et l'intérieur de chaque mois de même,
 * pour obtenir les parties les plus récentes en premier sans tout charger.
 */
export const chesscomFetcher: GameFetcher = {
  async fetchGames(username: string, maxGames: number): Promise<FetchedGame[]> {
    const { archives } = await getJson<{ archives: string[] }>(
      `https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}/games/archives`,
    );

    const games: FetchedGame[] = [];

    for (const archiveUrl of [...archives].reverse()) {
      if (games.length >= maxGames) break;

      const { games: monthGames } = await getJson<{ games: ChesscomGame[] }>(archiveUrl);

      for (const game of [...monthGames].reverse()) {
        if (games.length >= maxGames) break;
        // rules absent = échecs classiques ; on écarte les variantes (Chess960 etc.).
        if (game.pgn && (game.rules ?? "chess") === "chess" && game.url) {
          games.push({ pgn: game.pgn, externalId: game.url });
        }
      }
    }

    return games;
  },
};
