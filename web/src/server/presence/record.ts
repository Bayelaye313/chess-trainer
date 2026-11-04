import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { userDailyActivity, userPresence } from "@/server/db/schema";
import { creditHeartbeat, utcDay, type PresenceSection } from "@/core/presence/metrics";

/**
 * Un battement : présence (dernier passage + section) et temps actif du jour
 * UTC, en une transaction. Le compte vient TOUJOURS de la session (route
 * handler), jamais du corps de la requête.
 */
export function recordHeartbeat(userId: string, section: PresenceSection, now: Date = new Date()): void {
  db.transaction((tx) => {
    const previous = tx.select().from(userPresence).where(eq(userPresence.userId, userId)).get();
    const credit = creditHeartbeat(previous?.lastSeenAt, now);

    tx.insert(userPresence)
      .values({ userId, lastSeenAt: now, currentSection: section })
      .onConflictDoUpdate({ target: userPresence.userId, set: { lastSeenAt: now, currentSection: section } })
      .run();

    const day = utcDay(now);
    const existing = tx
      .select({ userId: userDailyActivity.userId })
      .from(userDailyActivity)
      .where(and(eq(userDailyActivity.userId, userId), eq(userDailyActivity.day, day)))
      .get();
    if (!existing) {
      tx.insert(userDailyActivity)
        .values({ userId, day, activeSeconds: credit.seconds, sessionsCount: 1, firstSeenAt: now, lastSeenAt: now })
        .run();
      return;
    }
    tx.update(userDailyActivity)
      .set({
        activeSeconds: sql`${userDailyActivity.activeSeconds} + ${credit.seconds}`,
        sessionsCount: sql`${userDailyActivity.sessionsCount} + ${credit.newSession ? 1 : 0}`,
        lastSeenAt: now,
      })
      .where(and(eq(userDailyActivity.userId, userId), eq(userDailyActivity.day, day)))
      .run();
  });
}
