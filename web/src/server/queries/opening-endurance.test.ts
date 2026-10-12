import { describe, expect, it, vi } from "vitest";

// Base SQLite en mémoire, migrée avec les VRAIES migrations de `drizzle/` :
// le test vérifie le schéma livré, jamais un schéma recopié à la main.
vi.mock("@/server/db", async () => {
  const { default: Database } = await import("better-sqlite3");
  const { drizzle } = await import("drizzle-orm/better-sqlite3");
  const { migrate } = await import("drizzle-orm/better-sqlite3/migrator");
  const schema = await import("@/server/db/schema");
  const db = drizzle(new Database(":memory:"), { schema });
  migrate(db, { migrationsFolder: "drizzle" });
  return { db, schema };
});

const { listEnduranceSessions, recordEnduranceSession } = await import("./opening-endurance");

const base = {
  openingId: "sicilian-alapin",
  openingName: "Alapine",
  selection: { kind: "main-line" } as const,
  variationLabel: "Ligne principale",
};

describe("opening-endurance queries", () => {
  it("enregistre les sessions et les relit, la plus récente d'abord", async () => {
    await recordEnduranceSession({ ...base, firstMistakePly: 11, lastPly: 20, correct: 8, attempted: 10 }, "u1", new Date("2026-10-01T10:00:00Z"));
    await recordEnduranceSession({ ...base, firstMistakePly: null, lastPly: 20, correct: 10, attempted: 10 }, "u1", new Date("2026-10-05T10:00:00Z"));
    await recordEnduranceSession({ ...base, firstMistakePly: 23, lastPly: 30, correct: 14, attempted: 15 }, "u1", new Date("2026-10-03T10:00:00Z"));
    await recordEnduranceSession({ ...base, firstMistakePly: 3, lastPly: 20, correct: 1, attempted: 2 }, "u2", new Date("2026-10-09T10:00:00Z"));

    const sessions = await listEnduranceSessions("u1");
    expect(sessions.map((s) => s.playedAt)).toEqual([
      "2026-10-05T10:00:00.000Z",
      "2026-10-03T10:00:00.000Z",
      "2026-10-01T10:00:00.000Z",
    ]);
    expect(sessions[0]).toMatchObject({ openingId: "sicilian-alapin", openingName: "Alapine", firstMistakePly: null, lastPly: 20, accuracy: 100 });
    expect(sessions[1]).toMatchObject({ firstMistakePly: 23, accuracy: 93 });
  });

  it("n'écrit rien pour une manche sans coup du joueur", async () => {
    expect(await recordEnduranceSession({ ...base, firstMistakePly: null, lastPly: 0, correct: 0, attempted: 0 }, "u3")).toBeNull();
    expect(await listEnduranceSessions("u3")).toEqual([]);
  });
});
