import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export type SparringPolicy = "stockfish" | "book" | "human";

export const sparringSessions = sqliteTable(
  "sparring_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    openingId: text("opening_id"),
    variationKey: text("variation_key"),
    policy: text("policy").$type<SparringPolicy>().notNull(),
    targetElo: integer("target_elo"),
    startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
    finishedAt: integer("finished_at", { mode: "timestamp" }),
    result: text("result"),
    theoryExitPly: integer("theory_exit_ply"),
  },
  (table) => [index("sparring_sessions_user_idx").on(table.userId, table.startedAt)],
);

export const sparringMoves = sqliteTable(
  "sparring_moves",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sessionId: text("session_id")
      .notNull()
      .references(() => sparringSessions.id, { onDelete: "cascade" }),
    ply: integer("ply").notNull(),
    fenBefore: text("fen_before").notNull(),
    uci: text("uci").notNull(),
    byPlayer: integer("by_player", { mode: "boolean" }).notNull(),
    policyScore: real("policy_score"),
    thinkMs: integer("think_ms"),
  },
  (table) => [index("sparring_moves_session_idx").on(table.sessionId, table.ply)],
);

export type SparringSession = typeof sparringSessions.$inferSelect;
export type NewSparringSession = typeof sparringSessions.$inferInsert;
export type SparringMove = typeof sparringMoves.$inferSelect;
export type NewSparringMove = typeof sparringMoves.$inferInsert;