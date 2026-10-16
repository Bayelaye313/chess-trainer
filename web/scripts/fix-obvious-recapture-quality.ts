import "server-only";

/**
 * Migration ponctuelle : recalcule la qualité des coups déjà stockés comme
 * `critical` en base pour leur appliquer le nouveau garde-fou
 * `isObviousRecapture` (`core/chess/classify.ts`) — sans aucun appel moteur,
 * puisque ce garde-fou ne dépend que du plateau (le coup adverse qui a
 * précédé, plus le coup joué), jamais de l'évaluation Stockfish.
 *
 * Corrige rétroactivement le bug utilisateur « une reprise évidente n'est pas
 * un coup critique » sur les parties importées AVANT ce correctif —
 * `server/import/analyse-game.ts` l'applique déjà à tout nouvel import, ce
 * script ne sert qu'à rattraper l'historique déjà en base.
 *
 * Usage :
 *   npm run db:fix-recapture-quality
 *   npm run db:fix-recapture-quality -- --dry-run
 */
import { Chess } from "chess.js";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/server/db";
import { games, moves } from "@/server/db/schema";

function parseArgs(): { dryRun: boolean } {
  return { dryRun: process.argv.includes("--dry-run") };
}

async function main(): Promise<void> {
  const { dryRun } = parseArgs();

  const criticalMoves = await db
    .select({ id: moves.id, gameId: moves.gameId, ply: moves.ply })
    .from(moves)
    .where(eq(moves.quality, "critical"));

  if (criticalMoves.length === 0) {
    console.log("Aucun coup 'critical' en base — rien à faire.");
    return;
  }

  const gameIds = [...new Set(criticalMoves.map((m) => m.gameId))];
  const gameRows = await db
    .select({ id: games.id, pgn: games.pgn })
    .from(games)
    .where(inArray(games.id, gameIds));
  const pgnByGame = new Map(gameRows.map((g) => [g.id, g.pgn]));

  let fixed = 0;
  let skipped = 0;

  for (const row of criticalMoves) {
    const pgn = pgnByGame.get(row.gameId);
    if (!pgn) {
      skipped += 1;
      continue;
    }

    const chess = new Chess();
    try {
      chess.loadPgn(pgn);
    } catch {
      skipped += 1;
      continue;
    }

    // `history` est indexée à 0 ; `ply` en base démarre à 1 (voir moves.ts).
    const history = chess.history({ verbose: true });
    const current = history[row.ply - 1];
    const previous = row.ply >= 2 ? history[row.ply - 2] : null;
    if (!current || !previous) {
      skipped += 1;
      continue;
    }

    const isObviousRecapture =
      Boolean(previous.captured) && Boolean(current.captured) && current.to === previous.to;
    if (!isObviousRecapture) continue;

    fixed += 1;
    console.log(
      `${dryRun ? "[dry-run] " : ""}Partie ${row.gameId}, coup ${row.ply} (${current.san}) : critical → best`,
    );
    if (!dryRun) {
      await db.update(moves).set({ quality: "best" }).where(eq(moves.id, row.id));
    }
  }

  console.log(
    `\n${fixed} coup(s) corrigé(s)${dryRun ? " (dry-run, rien n'a été écrit en base)" : ""}, ${skipped} ignoré(s) (PGN manquant/illisible ou ply hors historique).`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
