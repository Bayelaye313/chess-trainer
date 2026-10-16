import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { platformLinks, type PlatformLink } from "@/server/db/schema";
import { getNodeStockfishAnalyser, type NodeStockfishAnalyser } from "@/server/engine/node-stockfish-analyser";
import { analyseImportedGame } from "./analyse-game";
import { IMPORT_ANALYSIS_DEPTH } from "./constants";
import { gameAlreadyImported, persistImportedGame } from "./persist";
import { extractPuzzlesFromGame } from "@/server/queries/spaced-repetition";
import { fetchNewGamesSince, INITIAL_SYNC_MAX_GAMES, SYNC_MAX_GAMES } from "./sync-platforms";

export interface PlatformSyncResult {
  source: PlatformLink["source"];
  username: string;
  gamesImported: number;
  puzzlesCreated: number;
  /** Message si cette plateforme a échoué — les autres plateformes liées continuent malgré tout. */
  error?: string;
}

export interface SyncSummary {
  results: PlatformSyncResult[];
  totalGamesImported: number;
  totalPuzzlesCreated: number;
}

/**
 * Verrou anti-chevauchement en mémoire : plusieurs onglets ouverts sondent
 * tous `/api/sync` sur le même intervalle, ce verrou évite qu'ils lancent
 * chacun leur propre passage. Survit au rechargement à chaud de Next en dev
 * via `globalThis`, comme `db/index.ts`.
 */
const globalForSync = globalThis as unknown as { __chessTrainerSyncing?: boolean };

export function isSyncRunning(): boolean {
  return globalForSync.__chessTrainerSyncing === true;
}

async function syncOnePlatform(
  link: PlatformLink,
  analyser: NodeStockfishAnalyser,
): Promise<PlatformSyncResult> {
  const result: PlatformSyncResult = {
    source: link.source,
    username: link.username,
    gamesImported: 0,
    puzzlesCreated: 0,
  };

  try {
    // Un compte tout juste lié (`lastSyncedAt` encore null) part avec un
    // historique plus généreux qu'un sondage régulier — voir la docstring de
    // `INITIAL_SYNC_MAX_GAMES`.
    const fetched = await fetchNewGamesSince(
      link.source,
      link.username,
      link.lastImportedPlayedAt,
      link.lastSyncedAt === null ? INITIAL_SYNC_MAX_GAMES : SYNC_MAX_GAMES,
    );

    let latestPlayedAt = link.lastImportedPlayedAt;

    for (const fetchedGame of fetched) {
      // Filet de sécurité : `since` borne déjà le résultat aux parties neuves,
      // mais une partie jouée localement puis aussi vue côté plateforme (ou
      // déjà remontée par un sondage précédent) ne doit pas être ré-analysée
      // pour autant — dédoublonnage exact par `externalId`.
      if (await gameAlreadyImported(link.source, fetchedGame.externalId)) continue;

      const analysed = await analyseImportedGame(
        analyser,
        fetchedGame.pgn,
        fetchedGame.externalId,
        link.username,
        IMPORT_ANALYSIS_DEPTH,
      );
      if (!analysed) continue;

      const persisted = await persistImportedGame(link.source, analysed);
      result.gamesImported += 1;
      if (!latestPlayedAt || analysed.playedAt > latestPlayedAt) {
        latestPlayedAt = analysed.playedAt;
      }

      // Une partie détectée en tâche de fond doit alimenter les decks sans
      // action supplémentaire de l'utilisateur.
      const extraction = await extractPuzzlesFromGame(persisted.gameId);
      result.puzzlesCreated += extraction.created;

      // Vide les tables de hachage entre deux parties : chacune repart neuve.
      await analyser.newGame();
    }

    await db
      .update(platformLinks)
      .set({ lastSyncedAt: new Date(), lastImportedPlayedAt: latestPlayedAt })
      .where(eq(platformLinks.source, link.source));
  } catch (cause) {
    result.error = cause instanceof Error ? cause.message : String(cause);
    // La date de dernière tentative avance quand même : une plateforme en
    // panne ne doit pas être re-sondée en boucle serrée par le client.
    await db
      .update(platformLinks)
      .set({ lastSyncedAt: new Date() })
      .where(eq(platformLinks.source, link.source));
  }

  return result;
}

/**
 * Synchronise toutes les plateformes liées : nouvelles parties → analyse →
 * persistance → puzzles, pour chacune. `null` si une synchro tourne déjà
 * (voir `isSyncRunning`) — le prochain sondage réessaiera.
 */
export async function runSync(): Promise<SyncSummary | null> {
  if (isSyncRunning()) return null;
  globalForSync.__chessTrainerSyncing = true;

  try {
    const links = await db.select().from(platformLinks);
    if (links.length === 0) {
      return { results: [], totalGamesImported: 0, totalPuzzlesCreated: 0 };
    }

    // Instance partagée, jamais recréée — voir node-stockfish-analyser.ts.
    const analyser = getNodeStockfishAnalyser();
    await analyser.newGame();

    const results: PlatformSyncResult[] = [];
    for (const link of links) {
      results.push(await syncOnePlatform(link, analyser));
    }

    return {
      results,
      totalGamesImported: results.reduce((sum, r) => sum + r.gamesImported, 0),
      totalPuzzlesCreated: results.reduce((sum, r) => sum + r.puzzlesCreated, 0),
    };
  } finally {
    globalForSync.__chessTrainerSyncing = false;
  }
}
