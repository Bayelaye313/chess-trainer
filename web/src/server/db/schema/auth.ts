import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { AdapterAccountType } from "next-auth/adapters";

/**
 * Tables d'Auth.js (adaptateur Drizzle SQLite), aux noms du projet
 * (`users`, `accounts`, `sessions`, `verification_tokens`). L'adaptateur ne lit
 * que les objets colonnes : les noms SQL sont libres.
 *
 * Ajouts propres à l'application sur `users` : `role`, `status`, `created_at`,
 * `last_login_at`. Ils ont tous une valeur par défaut, parce que l'adaptateur
 * insère l'utilisateur sans les connaître.
 */
export type UserRole = "user" | "admin";
export type UserStatus = "active" | "suspended";

export const users = sqliteTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: integer("email_verified", { mode: "timestamp_ms" }),
    /** Enregistrée par l'adaptateur, jamais affichée (COEP bloque l'avatar distant, voir docs/auth/audit.md §4). */
    image: text("image"),
    role: text("role").$type<UserRole>().notNull().default("user"),
    status: text("status").$type<UserStatus>().notNull().default("active"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    lastLoginAt: integer("last_login_at", { mode: "timestamp_ms" }),
    /** Date de la reprise des données mono-utilisateur (`LEGACY_CLAIM_EMAIL`), une seule fois. */
    legacyClaimedAt: integer("legacy_claimed_at", { mode: "timestamp_ms" }),
  },
  (table) => [index("users_created_idx").on(table.createdAt)],
);

export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    // Colonnes du schéma de l'adaptateur. L'application n'appelle aucune API
    // Google : `linkAccount` (server/auth/adapter.ts) les laisse vides, aucun
    // jeton Google n'est donc conservé.
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
    index("accounts_user_idx").on(table.userId),
  ],
);

export const sessions = sqliteTable(
  "sessions",
  {
    sessionToken: text("session_token").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
    /** Appareil approximatif (« Chrome · Linux »), jamais l'en-tête User-Agent brut. */
    device: text("device"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).$defaultFn(() => new Date()),
  },
  (table) => [index("sessions_user_idx").on(table.userId), index("sessions_expires_idx").on(table.expires)],
);

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
);

export type UserRow = typeof users.$inferSelect;
export type SessionRow = typeof sessions.$inferSelect;
