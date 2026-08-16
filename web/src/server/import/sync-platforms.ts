import "server-only";
import { extractLichessId, splitPgnGames } from "@/core/chess/pgn";
import type { FetchedGame } from "./types";

/**
 * Fonctions pures d'interrogation des API publiques Chess.com et Lichess : la
 * synchro en tâche de fond s'arrête dès qu'elle retrouve une partie déjà vue
 * plutôt que de reparcourir tout l'historique à chaque appel. Aucune des deux
 * API ne demande d'OAuth — les profils de parties y sont publics par pseudo.
 *
 * "Pures" au sens : aucune écriture, aucune dépendance à la base ou à un job
 * — seul `since` (fourni par l'appelant, voir `platform-links.ts`) fait
 * varier le résultat pour un même pseudo.
 */

const HEADERS = {
  "User-Agent": "ChessTrainerLocal/1.0 (projet local personnel, sans finalité commerciale)",
};
const REQUEST_TIMEOUT_MS = 15_000;

/** Nombre de parties neuves ramenées par sondage — un sondage régulier n'en manque jamais autant d'un coup. */
export const SYNC_MAX_GAMES = 50;

/**
 * Nombre de parties ramenées lors du tout premier sondage d'un compte qui
 * vient d'être lié (`link.lastSyncedAt === null`, voir `run-sync.ts`) — plus
 * généreux qu'un sondage régulier pour donner un vrai historique de départ,
 * sans pour autant retélécharger des années d'archives comme le faisait
 * l'ancien import manuel en masse.
 */
export const INITIAL_SYNC_MAX_GAMES = 200;

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

interface ChesscomGame {
  pgn?: string;
  url?: string;
  rules?: string;
  /** Timestamp Unix (secondes) de fin de partie — absent seulement sur des parties en cours. */
  end_time?: number;
}

/**
 * Parties Chess.com jouées après `since` (exclu), les plus récentes en
 * premier. `since` null = pas encore synchronisé, se comporte comme un
 * import classique borné à `maxGames`.
 *
 * Les archives sont mensuelles et strictement chronologiques : dès qu'une
 * partie du mois courant est antérieure à `since`, tout le reste de ce mois
 * et des mois précédents l'est aussi — on s'arrête là plutôt que de
 * retélécharger des mois déjà vus à chaque sondage.
 */
export async function fetchNewChesscomGames(
  username: string,
  since: Date | null,
  maxGames: number = SYNC_MAX_GAMES,
): Promise<FetchedGame[]> {
  const { archives } = await getJson<{ archives: string[] }>(
    `https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}/games/archives`,
  );

  const sinceMs = since?.getTime() ?? 0;
  const result: FetchedGame[] = [];

  for (const archiveUrl of [...archives].reverse()) {
    if (result.length >= maxGames) break;

    const { games: monthGames } = await getJson<{ games: ChesscomGame[] }>(archiveUrl);

    let reachedOlderGame = false;
    for (const game of [...monthGames].reverse()) {
      if (result.length >= maxGames) break;
      const endMs = (game.end_time ?? 0) * 1000;
      if (endMs <= sinceMs) {
        reachedOlderGame = true;
        break;
      }
      // rules absent = échecs classiques ; on écarte les variantes (Chess960 etc.).
      if (game.pgn && (game.rules ?? "chess") === "chess" && game.url) {
        result.push({ pgn: game.pgn, externalId: game.url });
      }
    }
    if (reachedOlderGame) break;
  }

  return result;
}

/** Variantes jouables sur Lichess dont les règles sont celles des échecs classiques. */
const STANDARD_PERF_TYPES = "bullet,blitz,rapid,classical,correspondence";

/**
 * Parties Lichess jouées après `since` (exclu), les plus récentes en
 * premier. Contrairement à Chess.com, l'API Lichess accepte directement un
 * paramètre `since` (timestamp Unix ms) : une seule requête suffit, pas de
 * pagination à parcourir manuellement.
 */
export async function fetchNewLichessGames(
  username: string,
  since: Date | null,
  maxGames: number = SYNC_MAX_GAMES,
): Promise<FetchedGame[]> {
  const url = new URL(`https://lichess.org/api/games/user/${encodeURIComponent(username)}`);
  url.searchParams.set("max", String(maxGames));
  url.searchParams.set("perfType", STANDARD_PERF_TYPES);
  url.searchParams.set("clocks", "false");
  url.searchParams.set("evals", "false");
  url.searchParams.set("opening", "false");
  // +1ms : `since` est inclusif côté Lichess, la partie à la frontière est déjà importée.
  if (since) url.searchParams.set("since", String(since.getTime() + 1));

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
}

export type SyncPlatform = "chesscom" | "lichess";

const SYNC_FETCHERS: Record<
  SyncPlatform,
  (username: string, since: Date | null, maxGames?: number) => Promise<FetchedGame[]>
> = {
  chesscom: fetchNewChesscomGames,
  lichess: fetchNewLichessGames,
};

/** Point d'entrée unique, dispatché par plateforme — ce que `run-sync.ts` appelle réellement. */
export async function fetchNewGamesSince(
  source: SyncPlatform,
  username: string,
  since: Date | null,
  maxGames: number = SYNC_MAX_GAMES,
): Promise<FetchedGame[]> {
  return SYNC_FETCHERS[source](username, since, maxGames);
}
