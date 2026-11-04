import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { users } from "./auth";
import type { GameSource } from "./games";

/** Plateformes externes synchronisables — tout `GameSource` sauf les parties jouées ici même. */
export type SyncPlatform = Exclude<GameSource, "local">;

/**
 * Lien vers un compte Chess.com ou Lichess, posé une seule fois par
 * l'utilisateur puis réutilisé par la synchronisation en tâche de fond.
 *
 * Appli mono-utilisateur locale (voir `server/db/index.ts` : un seul fichier
 * SQLite, pas d'auth) : pas de table `users` à qui rattacher ce lien — la
 * plateforme suffit comme clé, un seul pseudo lié à la fois par plateforme.
 *
 * `lastImportedPlayedAt` est le curseur de synchronisation : `sync-
 * platforms.ts` ne redemande jamais aux API publiques les parties déjà vues.
 * Il se distingue de `games.externalId` (dédoublonnage exact, partie par
 * partie) en évitant en plus de re-télécharger des mois d'archives déjà
 * traités à chaque sondage.
 */
export const platformLinks = sqliteTable(
  "platform_links",
  {
    /** Propriétaire (NULL = ligne de l'époque mono-utilisateur, voir user-scope.ts). */
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    source: text("source").$type<SyncPlatform>().notNull(),
    username: text("username").notNull(),
    linkedAt: integer("linked_at", { mode: "timestamp" }).notNull(),
    /** Dernier passage de la synchro, réussi ou non — pour l'affichage ("il y a 2 min"). */
    lastSyncedAt: integer("last_synced_at", { mode: "timestamp" }),
    /** playedAt de la partie la plus récente déjà importée depuis cette plateforme. */
    lastImportedPlayedAt: integer("last_imported_played_at", { mode: "timestamp" }),
  },
  (table) => [uniqueIndex("platform_links_user_source_idx").on(table.userId, table.source)],
);

export type PlatformLink = typeof platformLinks.$inferSelect;
export type NewPlatformLink = typeof platformLinks.$inferInsert;
