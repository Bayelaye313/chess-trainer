import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { TrainingRecommendationType } from "@/core/training/recommendations";

export type TrainingEventKind = "puzzle" | "opening" | "trap" | "review" | "game";

/** Faits d'entraînement transversaux, indépendants du parcours UI qui les a produits. */
export const trainingEvents = sqliteTable(
  "training_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    kind: text("kind").$type<TrainingEventKind>().notNull(),
    entityId: text("entity_id").notNull(),
    sourceGameId: text("source_game_id"),
    score: real("score"),
    seconds: real("seconds"),
    hintsUsed: integer("hints_used").notNull().default(0),
    occurredAt: integer("occurred_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("training_events_user_time_idx").on(table.userId, table.occurredAt),
    index("training_events_entity_idx").on(table.kind, table.entityId),
  ],
);

/** File locale materialisee : la raison est explicite et inspectable. */
export const trainingRecommendations = sqliteTable(
  "training_recommendations",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    entityType: text("entity_type").$type<TrainingRecommendationType>().notNull(),
    entityId: text("entity_id").notNull(),
    reasonCode: text("reason_code").notNull(),
    priority: real("priority").notNull(),
    dueAt: integer("due_at", { mode: "timestamp" }).notNull(),
    completedAt: integer("completed_at", { mode: "timestamp" }),
  },
  (table) => [
    index("training_recommendations_due_idx").on(table.userId, table.dueAt, table.completedAt),
    index("training_recommendations_entity_idx").on(table.userId, table.entityType, table.entityId),
  ],
);

export type TrainingEvent = typeof trainingEvents.$inferSelect;
export type NewTrainingEvent = typeof trainingEvents.$inferInsert;
export type TrainingRecommendation = typeof trainingRecommendations.$inferSelect;
export type NewTrainingRecommendation = typeof trainingRecommendations.$inferInsert;