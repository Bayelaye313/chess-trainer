import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Préférences, en clé/valeur JSON.
 *
 * Une table typée par réglage vieillirait mal : les préférences bougent à
 * chaque étape. Les clés connues sont déclarées dans src/db/settings-keys.ts.
 */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type Setting = typeof settings.$inferSelect;
