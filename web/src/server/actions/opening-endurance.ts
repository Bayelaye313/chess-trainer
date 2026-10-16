"use server";

/**
 * Pont client/serveur de l'historique d'endurance « Sans Guide » — appelé par
 * `use-opening-drill.ts` à la fin de chaque Manche 2. Renvoie `void` : le hook
 * n'affiche rien de cette sauvegarde, et une `Date` ne doit de toute façon
 * pas traverser vers le client (voir `server/actions/opening-progress.ts`).
 *
 * La LECTURE n'a pas d'action : un Server Component appelle directement
 * `listEnduranceSessions` (`server/queries/opening-endurance.ts`), comme
 * `app/ouvertures/page.tsx` le fait pour `opening-progress.ts`.
 */
import {
  recordEnduranceSession as recordEnduranceSessionQuery,
  type RecordEnduranceSessionInput,
} from "@/server/queries/opening-endurance";

export async function recordEnduranceSession(input: RecordEnduranceSessionInput): Promise<void> {
  await recordEnduranceSessionQuery(input);
}
