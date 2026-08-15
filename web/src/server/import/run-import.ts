import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { importJobs, type NewImportJob } from "@/server/db/schema";
import { getNodeStockfishAnalyser } from "@/server/engine/node-stockfish-analyser";
import { analyseImportedGame } from "./analyse-game";
import { chesscomFetcher } from "./chesscom";
import { IMPORT_ANALYSIS_DEPTH } from "./constants";
import { registerJob, unregisterJob } from "./job-runner";
import { lichessFetcher } from "./lichess";
import { gameAlreadyImported, persistImportedGame } from "./persist";
import type { GameFetcher } from "./types";

export type ImportSource = "chesscom" | "lichess";

const FETCHERS: Record<ImportSource, GameFetcher> = {
  chesscom: chesscomFetcher,
  lichess: lichessFetcher,
};

async function updateJob(jobId: string, patch: Partial<NewImportJob>): Promise<void> {
  await db.update(importJobs).set(patch).where(eq(importJobs.id, jobId));
}

/**
 * Exécute un import de bout en bout : récupère les parties, les analyse une
 * à une, persiste au fur et à mesure (une partie perdue en cours de route
 * n'efface pas celles déjà traitées).
 *
 * Volontairement **non attendue** par l'action qui la déclenche
 * (`server/actions/import.ts`) : elle continue de tourner en tâche de fond
 * dans le process Node du serveur. Ceci suppose un déploiement 100% local
 * (`next dev`/`next start`, process persistant) — sur une plateforme
 * serverless, la fonction serait suspendue dès la réponse HTTP envoyée et ce
 * pattern ne fonctionnerait plus.
 */
export async function runImportJob(
  jobId: string,
  source: ImportSource,
  username: string,
  maxGames: number,
): Promise<void> {
  const controller = registerJob(jobId);
  // Instance partagée, jamais recréée : voir le commentaire de classe dans
  // node-stockfish-analyser.ts. `newGame()` purge l'état laissé par le job
  // précédent, quel qu'il soit.
  const analyser = getNodeStockfishAnalyser();

  try {
    await analyser.newGame();
    const fetchedGames = await FETCHERS[source].fetchGames(username, maxGames);
    await updateJob(jobId, { gamesFound: fetchedGames.length });

    let processed = 0;
    let skipped = 0;
    let mistakesFound = 0;

    for (const fetched of fetchedGames) {
      if (controller.signal.aborted) break;

      if (await gameAlreadyImported(source, fetched.externalId)) {
        skipped += 1;
        await updateJob(jobId, { gamesSkipped: skipped });
        continue;
      }

      const analysed = await analyseImportedGame(
        analyser,
        fetched.pgn,
        fetched.externalId,
        username,
        IMPORT_ANALYSIS_DEPTH,
      );

      if (!analysed) {
        skipped += 1;
        await updateJob(jobId, { gamesSkipped: skipped });
        continue;
      }

      const persisted = await persistImportedGame(source, analysed);
      processed += 1;
      mistakesFound += persisted.mistakesFound;
      await updateJob(jobId, { gamesProcessed: processed, mistakesFound });

      // Vide les tables de hachage entre deux parties : chacune repart neuve.
      await analyser.newGame();
    }

    await updateJob(jobId, {
      status: controller.signal.aborted ? "cancelled" : "done",
      finishedAt: new Date(),
    });
  } catch (cause) {
    await updateJob(jobId, {
      status: "error",
      errorMessage: cause instanceof Error ? cause.message : String(cause),
      finishedAt: new Date(),
    });
  } finally {
    // Pas de dispose() : l'instance est partagée et doit survivre à ce job,
    // voir node-stockfish-analyser.ts.
    unregisterJob(jobId);
  }
}
