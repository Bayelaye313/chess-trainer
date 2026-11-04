import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./auth";

/**
 * Métadonnées d'usage, lues par l'espace admin : dernier battement et section
 * courante, puis temps actif par jour UTC. On n'y stocke jamais d'URL complète
 * ni de contenu, seulement une section parmi `PRESENCE_SECTIONS`
 * (`core/presence/metrics.ts`).
 */
export const userPresence = sqliteTable(
  "user_presence",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    lastSeenAt: integer("last_seen_at", { mode: "timestamp_ms" }).notNull(),
    currentSection: text("current_section").notNull(),
  },
  (table) => [index("user_presence_seen_idx").on(table.lastSeenAt)],
);

export const userDailyActivity = sqliteTable(
  "user_daily_activity",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Jour UTC « AAAA-MM-JJ ». */
    day: text("day").notNull(),
    activeSeconds: integer("active_seconds").notNull().default(0),
    sessionsCount: integer("sessions_count").notNull().default(0),
    firstSeenAt: integer("first_seen_at", { mode: "timestamp_ms" }).notNull(),
    lastSeenAt: integer("last_seen_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.day] }), index("user_daily_activity_day_idx").on(table.day)],
);

export type UserPresenceRow = typeof userPresence.$inferSelect;
export type UserDailyActivityRow = typeof userDailyActivity.$inferSelect;
