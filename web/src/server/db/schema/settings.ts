import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { users } from "./auth";

/**
 * Préférences, en clé/valeur JSON.
 *
 * Une table typée par réglage vieillirait mal : les préférences bougent à
 * chaque étape. Les clés connues sont déclarées dans `server/db/settings-keys.ts`.
 */
export const settings = sqliteTable(
  "settings",
  {
    /** Propriétaire (NULL = ligne de l'époque mono-utilisateur, voir user-scope.ts). */
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: text("value", { mode: "json" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [uniqueIndex("settings_user_key_idx").on(table.userId, table.key)],
);

export type Setting = typeof settings.$inferSelect;
