import "server-only";

/**
 * Persistance du « Plan du jour » appliqué (`core/training/daily-plan.ts`) :
 * une ligne JSON de `settings` (aucune migration, même voie que
 * `training.preferences`), relue à chaque rendu de la page d'accueil — un
 * rafraîchissement ou un retour sur l'onglet retrouve la session active et sa
 * complétion, calculée depuis les vrais `training_events` du jour.
 */
import { eq, gte } from "drizzle-orm";
import {
  buildBotStartLines,
  computeDailyCompletion,
  createDailySession,
  normalizeDailySession,
  type BotStartLine,
  type DailyCompletion,
  type DailySession,
} from "@/core/training/daily-plan";
import type { TrainingPreferences } from "@/core/training/preferences";
import { OPENINGS } from "@/core/curriculum/openings";
import { OFF_REPERTOIRE_COURSE_IDS } from "@/core/curriculum/opening-course-ids";
import { OPENING_COURSE_TREES } from "@/core/curriculum/opening-course-trees";
import { OPENING_TRAPS } from "@/core/curriculum/traps";
import { db } from "@/server/db";
import { settings, trainingEvents, userScope } from "@/server/db/user-scope";
import { SETTING_KEYS } from "@/server/db/settings-keys";
import { saveTrainingPreferences } from "@/server/queries/settings";

export interface DailySessionState {
  session: DailySession;
  completion: DailyCompletion;
}

export async function getDailySession(userId: string, now: Date = new Date()): Promise<DailySession | null> {
  const s = userScope(userId);
  const [row] = await db.select().from(settings).where(s.where(settings, eq(settings.key, SETTING_KEYS.dailySession))).limit(1);
  return row ? normalizeDailySession(row.value, now) : null;
}

/** Session du jour + complétion, ou `null` hors session (jamais appliquée, ou appliquée un autre jour). */
export async function getDailySessionState(
  userId: string,
  now: Date = new Date(),
): Promise<DailySessionState | null> {
  const s = userScope(userId);
  const session = await getDailySession(userId, now);
  if (!session) return null;
  const rows = await db
    .select({ kind: trainingEvents.kind })
    .from(trainingEvents)
    .where(s.where(trainingEvents, gte(trainingEvents.occurredAt, new Date(session.appliedAt))));
  return { session, completion: computeDailyCompletion(session, rows.map((row) => row.kind)) };
}

/**
 * Clic sur « Appliquer » : enregistre les préférences (objectifs + nombre
 * d'actions) PUIS fige la session du jour à partir des objectifs normalisés —
 * jamais une session sur des objectifs que `normalizeTrainingPreferences`
 * aurait rejetés.
 */
export async function applyDailyPlan(
  userId: string,
  raw: unknown,
  now: Date = new Date(),
): Promise<{ preferences: TrainingPreferences; state: DailySessionState }> {
  const s = userScope(userId);
  const preferences = await saveTrainingPreferences(userId, raw);
  const session = createDailySession(preferences.goals, now);
  await db
    .insert(settings)
    .values(s.own({ key: SETTING_KEYS.dailySession, value: session, updatedAt: now }))
    .onConflictDoUpdate({ target: [settings.userId, settings.key], set: { value: session, updatedAt: now } });
  const state = await getDailySessionState(userId, now);
  // `state` ne peut être nul : la session vient d'être écrite pour ce jour.
  return { preferences, state: state ?? { session, completion: computeDailyCompletion(session, []) } };
}

/** « Modifier le plan » : déverrouille l'édition, la page repasse hors session. */
export async function clearDailySession(userId: string): Promise<void> {
  const s = userScope(userId);
  await db.delete(settings).where(s.where(settings, eq(settings.key, SETTING_KEYS.dailySession)));
}

/**
 * Lignes que le bot imposera pour la session — le répertoire est
 * `OPENINGS` restreint aux ouvertures dotées d'un cours `op-*.ts`
 * (`OPENING_COURSE_TREES`), hors cours sans lien avec les parties de
 * l'utilisateur (`OFF_REPERTOIRE_COURSE_IDS`) ; les pièges le socle statique
 * vérifié à la main.
 */
export function listBotStartLines(session: DailySession | null): BotStartLine[] {
  if (!session) return [];
  const repertoire = OPENINGS.filter((opening) => opening.id in OPENING_COURSE_TREES && !OFF_REPERTOIRE_COURSE_IDS.has(opening.id));
  return buildBotStartLines(session.goals, repertoire, OPENING_TRAPS);
}
