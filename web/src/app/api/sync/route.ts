import { NextResponse } from "next/server";
import { runSync } from "@/server/import/run-sync";

/**
 * Déclenche une synchronisation de toutes les plateformes liées
 * (`platform_links`) : nouvelles parties → `analyseImportedGame` →
 * `persistImportedGame` → `extractPuzzlesFromGame`.
 *
 * POST plutôt que GET : la requête a un effet de bord (écritures en base,
 * appels sortants). Appelée par `useSyncNotifier` (sondage périodique côté
 * client) — voir `client/features/sync/use-sync-notifier.ts`.
 *
 * Pas de file d'attente/CRON séparée : l'appli tourne en process Node
 * persistant (`next dev`/`next start`), pas sur une plateforme serverless —
 * seule hypothèse qui permette une tâche de fond fire-and-forget comme celle-ci.
 */
export async function POST() {
  const summary = await runSync();

  // `null` = une synchro tournait déjà (autre onglet, ou import manuel en
  // cours) : pas une erreur, juste rien à rapporter cette fois.
  if (!summary) {
    return NextResponse.json({ skipped: true, results: [], totalGamesImported: 0, totalPuzzlesCreated: 0 });
  }

  return NextResponse.json({ skipped: false, ...summary });
}
