import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import type { PlatformLink } from "@/server/db/schema";
import { platformLinks, userScope } from "@/server/db/user-scope";
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
 * Verrous anti-chevauchement en mémoire (serveur Node persistant) :
 *
 * - par utilisateur : jamais deux imports concurrents pour le même compte
 *   (plusieurs onglets sondent tous `/api/sync`) ;
 * - global : le moteur Stockfish serveur est une instance unique partagée,
 *   donc un seul import à la fois pour toute l'instance. Les autres
 *   utilisateurs réessaient au sondage suivant.
 *
 * Ils survivent au rechargement à chaud de Next en dev via `globalThis`, comme
 * `db/index.ts`.
 */
const globalForSync = globalThis as unknown as { __chessTrainerSyncingUsers?: Set<string>; __chessTrainerEngineBusy?: boolean };
const syncingUsers = (globalForSync.__chessTrainerSyncingUsers ??= new Set<string>());

export function isSyncRunning(userId?: string): boolean {
  return userId === undefined ? globalForSync.__chessTrainerEngineBusy === true : syncingUsers.has(userId);
}

async function syncOnePlatform(
  userId: string,
  link: PlatformLink,
  analyser: NodeStockfishAnalyser,
): Promise<PlatformSyncResult> {
  const s = userScope(userId);
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
      if (await gameAlreadyImported(userId, link.source, fetchedGame.externalId)) continue;

      const analysed = await analyseImportedGame(
        analyser,
        fetchedGame.pgn,
        fetchedGame.externalId,
        link.username,
        IMPORT_ANALYSIS_DEPTH,
      );
      if (!analysed) continue;

      const persisted = await persistImportedGame(userId, link.source, analysed);
      result.gamesImported += 1;
      if (!latestPlayedAt || analysed.playedAt > latestPlayedAt) {
        latestPlayedAt = analysed.playedAt;
      }

      // Une partie détectée en tâche de fond doit alimenter les decks sans
      // action supplémentaire de l'utilisateur.
      const extraction = await extractPuzzlesFromGame(userId, persisted.gameId);
      result.puzzlesCreated += extraction.created;

      // Vide les tables de hachage entre deux parties : chacune repart neuve.
      await analyser.newGame();
    }

    await db
      .update(platformLinks)
      .set({ lastSyncedAt: new Date(), lastImportedPlayedAt: latestPlayedAt })
      .where(s.where(platformLinks, eq(platformLinks.source, link.source)));
  } catch (cause) {
    result.error = cause instanceof Error ? cause.message : String(cause);
    // La date de dernière tentative avance quand même : une plateforme en
    // panne ne doit pas être re-sondée en boucle serrée par le client.
    await db
      .update(platformLinks)
      .set({ lastSyncedAt: new Date() })
      .where(s.where(platformLinks, eq(platformLinks.source, link.source)));
  }

  return result;
}

/**
 * Synchronise les plateformes liées DE CET UTILISATEUR : nouvelles parties →
 * analyse → persistance → puzzles, pour chacune. `null` si une synchro tourne
 * déjà pour lui ou pour l'instance (voir `isSyncRunning`). Le prochain sondage
 * réessaiera.
 */
export async function runSync(userId: string): Promise<SyncSummary | null> {
  const s = userScope(userId);
  if (syncingUsers.has(userId) || globalForSync.__chessTrainerEngineBusy) return null;
  syncingUsers.add(userId);
  globalForSync.__chessTrainerEngineBusy = true;

  try {
    const links = await db.select().from(platformLinks).where(s.owns(platformLinks));
    if (links.length === 0) {
      return { results: [], totalGamesImported: 0, totalPuzzlesCreated: 0 };
    }

    // Instance partagée, jamais recréée — voir node-stockfish-analyser.ts.
    const analyser = getNodeStockfishAnalyser();
    await analyser.newGame();

    const results: PlatformSyncResult[] = [];
    for (const link of links) {
      results.push(await syncOnePlatform(userId, link, analyser));
    }

    return {
      results,
      totalGamesImported: results.reduce((sum, r) => sum + r.gamesImported, 0),
      totalPuzzlesCreated: results.reduce((sum, r) => sum + r.puzzlesCreated, 0),
    };
  } finally {
    syncingUsers.delete(userId);
    globalForSync.__chessTrainerEngineBusy = false;
  }
}
