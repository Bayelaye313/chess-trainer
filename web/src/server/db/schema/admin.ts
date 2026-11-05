import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Journal des actions d'administration (et de la reprise des données
 * mono-utilisateur). Pas de clé étrangère : l'entrée survit à la suppression
 * du compte visé ou de son auteur. On garde donc aussi leur email.
 */
export type AdminAuditAction = "suspend" | "reactivate" | "revoke-sessions" | "legacy-claim" | "delete-account";

export const adminAudit = sqliteTable(
  "admin_audit",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    actorId: text("actor_id"),
    actorEmail: text("actor_email"),
    action: text("action").$type<AdminAuditAction>().notNull(),
    targetId: text("target_id"),
    targetEmail: text("target_email"),
    /** Compteurs ou précisions (jamais de contenu personnel). */
    detail: text("detail", { mode: "json" }).$type<Record<string, number | string>>(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("admin_audit_created_idx").on(table.createdAt)],
);

export type AdminAuditRow = typeof adminAudit.$inferSelect;
