import { NextResponse } from "next/server";
import { runSync } from "@/server/import/run-sync";
import { sessionUser } from "@/server/auth/session";
import { createRateLimiter } from "@/core/rate-limit";

/** Au plus 6 synchros par minute et par utilisateur (le client sonde toutes les 5 min). */
const globalForLimiter = globalThis as unknown as { __chessTrainerSyncLimiter?: ReturnType<typeof createRateLimiter> };
const limiter = (globalForLimiter.__chessTrainerSyncLimiter ??= createRateLimiter({ windowMs: 60_000, max: 6 }));

/**
 * Déclenche la synchronisation des plateformes liées DE L'UTILISATEUR CONNECTÉ
 * (`platform_links`, filtrées par `user_id`) : nouvelles parties → `analyseImportedGame` →
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
  const user = await sessionUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  const allowed = limiter.hit(user.id);
  if (!allowed.ok) {
    return NextResponse.json(
      { error: "Trop de synchronisations rapprochées." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(allowed.retryAfterMs / 1000)) } },
    );
  }

  const summary = await runSync(user.id);

  // `null` = une synchro tournait déjà (autre onglet de ce compte, ou import
  // d'un autre compte sur le moteur partagé) : pas une erreur, rien à rapporter.
  if (!summary) {
    return NextResponse.json({ skipped: true, results: [], totalGamesImported: 0, totalPuzzlesCreated: 0 });
  }

  return NextResponse.json({ skipped: false, ...summary });
}
