import { describe, expect, it, vi } from "vitest";

// Base SQLite en mémoire, migrée avec les VRAIES migrations de `drizzle/`.
vi.mock("@/server/db", async () => {
  const { default: Database } = await import("better-sqlite3");
  const { drizzle } = await import("drizzle-orm/better-sqlite3");
  const { migrate } = await import("drizzle-orm/better-sqlite3/migrator");
  const schema = await import("@/server/db/schema");
  const db = drizzle(new Database(":memory:"), { schema });
  migrate(db, { migrationsFolder: "drizzle" });
  return { db, schema };
});

const { applyDailyPlan, clearDailySession, getDailySessionState, listBotStartLines } = await import("./daily-plan");
const { getTrainingPreferences } = await import("./settings");
const { recordTrainingEvent } = await import("./training");

const APPLIED = new Date("2026-10-16T08:00:00Z");

describe("daily-plan queries", () => {
  it("persiste le plan appliqué et le retrouve après un rafraîchissement", async () => {
    const { preferences, state } = await applyDailyPlan({ goals: ["openings", "tactics"], dailyLimit: 5 }, APPLIED);
    expect(preferences).toEqual({ goals: ["openings", "tactics"], dailyLimit: 5 });
    expect(state.session).toMatchObject({ day: "2026-10-16", goals: ["tactics", "openings"], effortPoints: 60 });
    expect(await getTrainingPreferences()).toEqual(preferences);

    const reloaded = await getDailySessionState(new Date("2026-10-16T18:00:00Z"));
    expect(reloaded?.session).toEqual(state.session);
    expect(reloaded?.completion.percent).toBe(0);
  });

  it("calcule la complétion depuis les training_events postérieurs à l'application", async () => {
    await recordTrainingEvent({ kind: "puzzle", entityId: "avant", occurredAt: new Date("2026-10-16T07:00:00Z") });
    expect((await getDailySessionState(new Date("2026-10-16T09:00:00Z")))?.completion.completedGoals).toEqual([]);

    await recordTrainingEvent({ kind: "puzzle", entityId: "p1", occurredAt: new Date("2026-10-16T08:30:00Z") });
    const state = await getDailySessionState(new Date("2026-10-16T09:00:00Z"));
    expect(state?.completion).toEqual({ completedGoals: ["tactics"], completedPoints: 35, percent: 58 });
  });

  it("expire le lendemain et se déverrouille sur demande", async () => {
    expect(await getDailySessionState(new Date("2026-10-17T00:00:01Z"))).toBeNull();
    await applyDailyPlan({ goals: ["review"], dailyLimit: 3 }, APPLIED);
    await clearDailySession();
    expect(await getDailySessionState(APPLIED)).toBeNull();
  });

  it("expose les lignes du répertoire seulement pour une session avec Ouvertures/Pièges", async () => {
    expect(listBotStartLines(null)).toEqual([]);
    const { state } = await applyDailyPlan({ goals: ["openings", "traps"], dailyLimit: 3 }, APPLIED);
    const lines = listBotStartLines(state.session);
    expect(lines.map((line) => line.sourceId)).toEqual(expect.arrayContaining(["scotch-game", "caro-kann", "slav-defense"]));
    expect(lines.some((line) => line.kind === "trap")).toBe(true);
    const { state: tacticsOnly } = await applyDailyPlan({ goals: ["tactics"], dailyLimit: 3 }, APPLIED);
    expect(listBotStartLines(tacticsOnly.session)).toEqual([]);
  });
});
