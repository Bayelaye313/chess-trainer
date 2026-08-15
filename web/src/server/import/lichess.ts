import "server-only";
import { extractLichessId, splitPgnGames } from "@/core/chess/pgn";
import type { FetchedGame, GameFetcher } from "./types";

const REQUEST_TIMEOUT_MS = 30_000;

/** Variantes jouables sur Lichess dont les règles sont celles des échecs classiques. */
const STANDARD_PERF_TYPES = "bullet,blitz,rapid,classical,correspondence";

/**
 * Récupère les parties les plus récentes d'un joueur Lichess.
 *
 * Contrairement à Chess.com (archives mensuelles paginées), Lichess expose un
 * unique flux streamé déjà trié du plus récent au plus ancien — une seule
 * requête suffit.
 */
export const lichessFetcher: GameFetcher = {
  async fetchGames(username: string, maxGames: number): Promise<FetchedGame[]> {
    const url = new URL(`https://lichess.org/api/games/user/${encodeURIComponent(username)}`);
    url.searchParams.set("max", String(maxGames));
    url.searchParams.set("perfType", STANDARD_PERF_TYPES);
    url.searchParams.set("clocks", "false");
    url.searchParams.set("evals", "false");
    url.searchParams.set("opening", "false");

    const response = await fetch(url, {
      headers: { Accept: "application/x-chess-pgn" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`Lichess a répondu ${response.status} pour ${username}`);
    }

    const text = await response.text();
    return splitPgnGames(text).map((pgn, index) => ({
      pgn,
      externalId: extractLichessId(pgn) ?? `unknown-${index}`,
    }));
  },
};
