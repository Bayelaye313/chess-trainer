import "server-only";
import { and, count, desc, eq, gt, gte, like, or, sql, sum } from "drizzle-orm";
import { db } from "@/server/db";
import { adminAudit, sessions, userDailyActivity, userPresence, users, type AdminAuditRow, type UserRole, type UserStatus } from "@/server/db/schema";
import { isOnline, lastDays } from "@/core/presence/metrics";

/**
 * Lectures de l'espace admin : MÉTADONNÉES d'usage seulement (compte, sessions,
 * présence, temps actif). Jamais le contenu des parties, des erreurs ni des
 * révisions : aucune table de `PERSONAL_TABLES` n'est lue ici.
 */
export const ADMIN_PAGE_SIZE = 25;

export type AdminUserState = "online" | "inactive" | "suspended";

export interface AdminUserRow {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  createdAt: Date;
  lastActivityAt: Date | null;
  activeSeconds7d: number;
  state: AdminUserState;
}

function stateOf(status: UserStatus, lastSeenAt: Date | null, now: Date): AdminUserState {
  if (status === "suspended") return "suspended";
  return isOnline(lastSeenAt, now) ? "online" : "inactive";
}

export async function listUsersForAdmin(
  { query = "", page = 1 }: { query?: string; page?: number },
  now: Date = new Date(),
): Promise<{ rows: AdminUserRow[]; total: number; page: number; pageCount: number }> {
  const trimmed = query.trim().slice(0, 100);
  const filter = trimmed ? or(like(users.name, `%${trimmed}%`), like(users.email, `%${trimmed}%`)) : undefined;
  const [{ total }] = await db.select({ total: count() }).from(users).where(filter);
  const pageCount = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);

  const since = lastDays(now, 7)[0];
  const activity7d = db
    .select({ userId: userDailyActivity.userId, seconds: sum(userDailyActivity.activeSeconds).as("seconds") })
    .from(userDailyActivity)
    .where(gte(userDailyActivity.day, since))
    .groupBy(userDailyActivity.userId)
    .as("activity7d");
  const lastActivity = sql<number | null>`coalesce(${userPresence.lastSeenAt}, ${users.lastLoginAt})`;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
      lastSeenAt: userPresence.lastSeenAt,
      lastActivity,
      seconds: activity7d.seconds,
    })
    .from(users)
    .leftJoin(userPresence, eq(userPresence.userId, users.id))
    .leftJoin(activity7d, eq(activity7d.userId, users.id))
    .where(filter)
    .orderBy(sql`${lastActivity} IS NULL`, desc(lastActivity), desc(users.createdAt))
    .limit(ADMIN_PAGE_SIZE)
    .offset((current - 1) * ADMIN_PAGE_SIZE);

  return {
    rows: rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      createdAt: row.createdAt,
      lastActivityAt: row.lastActivity === null ? null : new Date(Number(row.lastActivity)),
      activeSeconds7d: Number(row.seconds ?? 0),
      state: stateOf(row.status, row.lastSeenAt, now),
    })),
    total,
    page: current,
    pageCount,
  };
}

export interface AdminUserDetail {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  lastLoginAt: Date | null;
  lastSeenAt: Date | null;
  state: AdminUserState;
  activeSeconds7d: number;
  activeSeconds30d: number;
  activeDays30d: number;
  sessions: { id: string; device: string | null; createdAt: Date | null; expires: Date }[];
}

export async function getUserForAdmin(userId: string, now: Date = new Date()): Promise<AdminUserDetail | null> {
  const user = await db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) return null;
  const presence = await db.select().from(userPresence).where(eq(userPresence.userId, userId)).get();
  const activity = await db
    .select({ day: userDailyActivity.day, seconds: userDailyActivity.activeSeconds })
    .from(userDailyActivity)
    .where(and(eq(userDailyActivity.userId, userId), gte(userDailyActivity.day, lastDays(now, 30)[0])));
  const since7 = lastDays(now, 7)[0];
  const activeSessions = await db
    .select({ token: sessions.sessionToken, device: sessions.device, createdAt: sessions.createdAt, expires: sessions.expires })
    .from(sessions)
    .where(and(eq(sessions.userId, userId), gt(sessions.expires, now)))
    .orderBy(desc(sessions.createdAt));

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    lastSeenAt: presence?.lastSeenAt ?? null,
    state: stateOf(user.status, presence?.lastSeenAt ?? null, now),
    activeSeconds7d: activity.filter((row) => row.day >= since7).reduce((total, row) => total + row.seconds, 0),
    activeSeconds30d: activity.reduce((total, row) => total + row.seconds, 0),
    activeDays30d: activity.filter((row) => row.seconds > 0).length,
    // Le jeton de session n'est jamais montré : seule une empreinte courte sert de clé d'affichage.
    sessions: activeSessions.map((row, index) => ({ id: `${index + 1}`, device: row.device, createdAt: row.createdAt, expires: row.expires })),
  };
}

export async function listAuditForAdmin(page = 1): Promise<{ rows: AdminAuditRow[]; page: number; pageCount: number }> {
  const [{ total }] = await db.select({ total: count() }).from(adminAudit);
  const pageCount = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  const rows = await db
    .select()
    .from(adminAudit)
    .orderBy(desc(adminAudit.createdAt), desc(adminAudit.id))
    .limit(ADMIN_PAGE_SIZE)
    .offset((current - 1) * ADMIN_PAGE_SIZE);
  return { rows, page: current, pageCount };
}
