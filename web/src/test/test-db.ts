/**
 * Base SQLite en mémoire pour les tests, migrée avec les VRAIES migrations de
 * `drizzle/`, clés étrangères actives (comme en production).
 *
 *   vi.mock("@/server/db", async () => (await import("@/test/test-db")).createTestDb());
 *   const { db } = await import("@/server/db");
 *   await seedUsers(db, "user-a", "user-b");
 */
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "@/server/db/schema";

export function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = OFF");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: "drizzle" });
  sqlite.pragma("foreign_keys = ON");
  return { db, schema };
}

export type TestDb = ReturnType<typeof createTestDb>["db"];

export async function seedUsers(db: TestDb, ...ids: string[]): Promise<void> {
  for (const id of ids) {
    await db.insert(schema.users).values({ id, email: `${id}@test.local`, name: id }).onConflictDoNothing();
  }
}
