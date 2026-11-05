import "server-only";
import { count, gt } from "drizzle-orm";
import { db } from "@/server/db";
import { sessions, userDailyActivity, userPresence, users } from "@/server/db/schema";
import {
  activeCounts,
  activeUsersPerDay,
  averageActiveSeconds,
  isOnline,
  lastDays,
  onlineBySection,
  retention,
  signupsPerDay,
  type DayPoint,
  type PresenceSection,
  type RetentionResult,
} from "@/core/presence/metrics";

/**
 * Statistiques d'usage AGRÉGÉES pour l'espace admin. On ne lit que les
 * métadonnées (`users`, `sessions`, `user_presence`, `user_daily_activity`),
 * jamais une table personnelle de contenu (parties, erreurs, révisions).
 * Les définitions sont dans `core/presence/metrics.ts`.
 */
export interface DashboardStats {
  generatedAt: string;
  onlineNow: number;
  onlineBySection: { section: PresenceSection; count: number }[];
  dau: number;
  wau: number;
  mau: number;
  totalUsers: number;
  newUsers7d: number;
  activeSessions: number;
  activePerDay: DayPoint[];
  signupsPerDay: DayPoint[];
  /** Temps actif moyen (secondes) par utilisateur actif, sur 7 jours glissants. */
  averageActiveSeconds7d: number;
  retention: RetentionResult;
}

export async function getOnlineSnapshot(now: Date = new Date()): Promise<{ onlineNow: number; onlineBySection: DashboardStats["onlineBySection"]; generatedAt: string }> {
  const since = new Date(now.getTime() - 2 * 60_000);
  const rows = await db.select().from(userPresence).where(gt(userPresence.lastSeenAt, since));
  return {
    onlineNow: rows.filter((row) => isOnline(row.lastSeenAt, now)).length,
    onlineBySection: onlineBySection(rows, now),
    generatedAt: now.toISOString(),
  };
}

export async function getDashboardStats(now: Date = new Date()): Promise<DashboardStats> {
  const [online, userRows, activityRows, [{ value: activeSessions }]] = await Promise.all([
    getOnlineSnapshot(now),
    db.select({ id: users.id, createdAt: users.createdAt }).from(users),
    // Toute l'activité (la rétention regarde au-delà de 30 jours). Volume borné :
    // une ligne par compte et par jour d'usage.
    db.select({ userId: userDailyActivity.userId, day: userDailyActivity.day, activeSeconds: userDailyActivity.activeSeconds }).from(userDailyActivity),
    db.select({ value: count() }).from(sessions).where(gt(sessions.expires, now)),
  ]);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    ...online,
    ...activeCounts(activityRows, now),
    totalUsers: userRows.length,
    newUsers7d: userRows.filter((user) => user.createdAt >= sevenDaysAgo).length,
    activeSessions,
    activePerDay: activeUsersPerDay(activityRows, now, 30),
    signupsPerDay: signupsPerDay(
      userRows.map((user) => user.createdAt),
      now,
      30,
    ),
    averageActiveSeconds7d: averageActiveSeconds(activityRows, lastDays(now, 7)),
    retention: retention(userRows, activityRows, now),
    generatedAt: now.toISOString(),
  };
}
