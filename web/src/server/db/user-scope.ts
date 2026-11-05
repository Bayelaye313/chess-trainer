import "server-only";
import { and, eq, isNotNull, isNull, or, type SQL } from "drizzle-orm";
import { db } from "@/server/db";
import {
  adminAudit,
  botGameResults,
  dailySets,
  games,
  moves,
  openingEnduranceSessions,
  openingMistakeReview,
  openingProgress,
  platformLinks,
  programmePuzzleResults,
  programmeSessions,
  programmeState,
  puzzlePurges,
  puzzles,
  reviewLogs,
  reviews,
  settings,
  sparringMoves,
  sparringSessions,
  trainingEvents,
  trainingRecommendations,
  users,
  userThemeProgress,
} from "@/server/db/schema";

/**
 * POINT D'ENTRÉE UNIQUE des données personnelles.
 *
 * Toute requête sur une table personnelle passe par un `UserScope` :
 *
 *   const s = userScope(userId);
 *   db.select().from(games).where(s.where(games, eq(games.id, id)));
 *   db.insert(games).values(s.own({ ... }));
 *   db.select().from(reviews).innerJoin(puzzles, …).where(and(s.owns(reviews, puzzles), …));
 *
 * Les tables personnelles s'importent d'ICI, jamais de `@/server/db/schema`.
 * Le test `user-scope.enforcement.test.ts` vérifie, dans tout `src/`, que
 * chaque `from/join/update/delete` d'une table personnelle est filtré par
 * `s.where(table…)` ou `s.owns(…table…)`, et que chaque `insert` passe par
 * `s.own(…)` ou `s.ownAll(…)`.
 */
export const PERSONAL_TABLES = {
  platformLinks,
  settings,
  games,
  moves,
  botGameResults,
  puzzles,
  reviews,
  reviewLogs,
  dailySets,
  puzzlePurges,
  openingMistakeReview,
  openingProgress,
  openingEnduranceSessions,
  sparringSessions,
  sparringMoves,
  trainingEvents,
  trainingRecommendations,
  userThemeProgress,
  programmeState,
  programmeSessions,
  programmePuzzleResults,
} as const;

export {
  botGameResults,
  dailySets,
  games,
  moves,
  openingEnduranceSessions,
  openingMistakeReview,
  openingProgress,
  platformLinks,
  programmePuzzleResults,
  programmeSessions,
  programmeState,
  puzzlePurges,
  puzzles,
  reviewLogs,
  reviews,
  settings,
  sparringMoves,
  sparringSessions,
  trainingEvents,
  trainingRecommendations,
  userThemeProgress,
};

export type PersonalTable = (typeof PERSONAL_TABLES)[keyof typeof PERSONAL_TABLES];

/**
 * Lignes de l'époque mono-utilisateur, en attente de reprise : `user_id` NULL
 * (colonnes ajoutées par la migration 0018) ou `'local'` (colonnes `user_id`
 * qui existaient déjà, en clé primaire pour certaines, donc non nullables).
 */
export const LEGACY_USER_ID = "local";

export interface UserScope {
  readonly userId: string;
  /** `user_id = <userId>` pour chacune des tables (jointures). */
  owns(...tables: PersonalTable[]): SQL;
  /** `user_id = <userId> AND …conditions`. */
  where(table: PersonalTable, ...conditions: (SQL | undefined)[]): SQL;
  /** Valeurs d'insertion avec le propriétaire. */
  own<T extends object>(values: T): T & { userId: string };
  ownAll<T extends object>(values: readonly T[]): (T & { userId: string })[];
}

export function userScope(userId: string): UserScope {
  if (typeof userId !== "string" || userId.length === 0 || userId === LEGACY_USER_ID) {
    throw new Error("userScope : identifiant d'utilisateur manquant ou invalide.");
  }
  const owns = (...tables: PersonalTable[]): SQL => and(...tables.map((table) => eq(table.userId, userId)))!;
  return {
    userId,
    owns,
    where: (table, ...conditions) => and(owns(table), ...conditions)!,
    own: (values) => ({ ...values, userId }),
    ownAll: (values) => values.map((value) => ({ ...value, userId })),
  };
}

function legacyCondition(table: PersonalTable): SQL {
  return or(isNull(table.userId), eq(table.userId, LEGACY_USER_ID))!;
}

/**
 * Efface toutes les données personnelles puis le compte, en UNE transaction.
 * Les tables enfants partent d'abord : l'ordre ne dépend pas des cascades.
 */
export function deleteUserAndData(userId: string): Record<string, number> {
  const s = userScope(userId);
  const counts: Record<string, number> = {};
  const order: (keyof typeof PERSONAL_TABLES)[] = [
    "programmePuzzleResults",
    "programmeSessions",
    "programmeState",
    "sparringMoves",
    "sparringSessions",
    "reviewLogs",
    "reviews",
    "dailySets",
    "puzzles",
    "puzzlePurges",
    "botGameResults",
    "moves",
    "games",
    "platformLinks",
    "settings",
    "openingMistakeReview",
    "openingProgress",
    "openingEnduranceSessions",
    "trainingEvents",
    "trainingRecommendations",
    "userThemeProgress",
  ];
  db.transaction((tx) => {
    for (const name of order) {
      const table = PERSONAL_TABLES[name];
      counts[name] = tx.delete(table).where(s.owns(table)).run().changes;
    }
    tx.delete(users).where(eq(users.id, userId)).run();
  });
  return counts;
}

export interface LegacyClaimResult {
  claimed: boolean;
  counts: Record<string, number>;
}

/**
 * Reprise UNIQUE des données mono-utilisateur par le compte `LEGACY_CLAIM_EMAIL`.
 * En transaction. Elle ne se fait qu'une fois pour toute l'instance : si un
 * compte a déjà `legacy_claimed_at`, ou si celui-ci n'est pas le bon email, on
 * ne fait rien. Elle est journalisée dans `admin_audit`.
 */
export function claimLegacyData(userId: string, email: string, legacyEmail: string | undefined, now = new Date()): LegacyClaimResult {
  const none = { claimed: false, counts: {} };
  if (!legacyEmail || email.trim().toLowerCase() !== legacyEmail.trim().toLowerCase()) return none;

  return db.transaction((tx) => {
    const already = tx.select({ id: users.id }).from(users).where(isNotNull(users.legacyClaimedAt)).get();
    if (already) return none;
    const counts: Record<string, number> = {};
    for (const [name, table] of Object.entries(PERSONAL_TABLES)) {
      counts[name] = tx.update(table).set({ userId }).where(legacyCondition(table)).run().changes;
    }
    tx.update(users).set({ legacyClaimedAt: now }).where(eq(users.id, userId)).run();
    tx.insert(adminAudit)
      .values({ actorId: userId, actorEmail: email, action: "legacy-claim", targetId: userId, targetEmail: email, detail: counts, createdAt: now })
      .run();
    return { claimed: true, counts };
  });
}
