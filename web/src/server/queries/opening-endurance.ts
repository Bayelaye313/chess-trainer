import "server-only";

/**
 * Lecture/écriture de l'historique d'endurance « Sans Guide »
 * (`opening_endurance_sessions`). Écrit à la fin de chaque Manche 2 par
 * `use-opening-drill.ts` (via `server/actions/opening-endurance.ts`), lu par
 * l'écran `OpeningEnduranceHistory`.
 */
import { desc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { openingEnduranceSessions } from "@/server/db/schema";
import { LOCAL_USER_ID } from "@/server/queries/curriculum";
import { buildEnduranceSessionMetrics, type OpeningSessionHistory } from "@/core/curriculum/opening-endurance";
import { type TrackedDrillSelection, variationKeyFor } from "@/core/curriculum/opening-variation-key";

export interface RecordEnduranceSessionInput {
  openingId: string;
  openingName: string;
  selection: TrackedDrillSelection;
  variationLabel: string;
  /** Ply absolu du premier coup refusé de la manche, `null` si aucun. */
  firstMistakePly: number | null;
  /** Ply absolu atteint en fin de manche. */
  lastPly: number;
  /** Score de la manche (`score` du hook). */
  correct: number;
  attempted: number;
}

/**
 * Ajoute une session. Renvoie `null` (rien d'écrit) pour une manche sans aucun
 * coup du joueur — voir `buildEnduranceSessionMetrics`.
 */
export async function recordEnduranceSession(
  input: RecordEnduranceSessionInput,
  userId: string = LOCAL_USER_ID,
  now: Date = new Date(),
): Promise<OpeningSessionHistory | null> {
  const metrics = buildEnduranceSessionMetrics(input);
  if (!metrics) return null;

  const id = crypto.randomUUID();
  await db.insert(openingEnduranceSessions).values({
    id,
    userId,
    openingId: input.openingId,
    openingName: input.openingName,
    variationKey: variationKeyFor(input.selection),
    variationLabel: input.variationLabel,
    firstMistakePly: metrics.firstMistakePly,
    lastPly: metrics.lastPly,
    accuracy: metrics.accuracy,
    playedAt: now,
  });
  return { sessionId: id, openingId: input.openingId, openingName: input.openingName, playedAt: now.toISOString(), ...metrics };
}

/**
 * Historique complet, PLUS RÉCENT D'ABORD (tri fait par SQLite, sur l'index
 * `opening_endurance_user_time_idx`). `playedAt` est sérialisé en ISO : la
 * liste traverse telle quelle la frontière Server Component → client.
 */
export async function listEnduranceSessions(userId: string = LOCAL_USER_ID): Promise<OpeningSessionHistory[]> {
  const rows = await db
    .select()
    .from(openingEnduranceSessions)
    .where(eq(openingEnduranceSessions.userId, userId))
    .orderBy(desc(openingEnduranceSessions.playedAt), desc(openingEnduranceSessions.id));
  return rows.map((row) => ({
    sessionId: row.id,
    openingId: row.openingId,
    openingName: row.openingName,
    playedAt: row.playedAt.toISOString(),
    firstMistakePly: row.firstMistakePly,
    lastPly: row.lastPly,
    accuracy: row.accuracy,
  }));
}
