import { describe, expect, it, vi } from "vitest";

// Base SQLite en mémoire, migrée avec les VRAIES migrations de `drizzle/`.
vi.mock("@/server/db", async () => (await import("@/test/test-db")).createTestDb());

const { applyDailyPlan, clearDailySession, getDailySessionState, listBotStartLines } = await import("./daily-plan");
const { getTrainingPreferences } = await import("./settings");
const { recordTrainingEvent } = await import("./training");
const { OFF_REPERTOIRE_COURSE_IDS } = await import("@/core/curriculum/opening-course-ids");

const { db } = await import("@/server/db");
const { seedUsers } = await import("@/test/test-db");
const USER = "user-daily";
await seedUsers(db, USER);

const APPLIED = new Date("2026-10-16T08:00:00Z");

describe("daily-plan queries", () => {
  it("persiste le plan appliqué et le retrouve après un rafraîchissement", async () => {
    const { preferences, state } = await applyDailyPlan(USER, { goals: ["openings", "tactics"], dailyLimit: 5 }, APPLIED);
    expect(preferences).toEqual({ goals: ["openings", "tactics"], dailyLimit: 5 });
    expect(state.session).toMatchObject({ day: "2026-10-16", goals: ["tactics", "openings"], effortPoints: 60 });
    expect(await getTrainingPreferences(USER)).toEqual(preferences);

    const reloaded = await getDailySessionState(USER, new Date("2026-10-16T18:00:00Z"));
    expect(reloaded?.session).toEqual(state.session);
    expect(reloaded?.completion.percent).toBe(0);
  });

  it("calcule la complétion depuis les training_events postérieurs à l'application", async () => {
    await recordTrainingEvent(USER, { kind: "puzzle", entityId: "avant", occurredAt: new Date("2026-10-16T07:00:00Z") });
    expect((await getDailySessionState(USER, new Date("2026-10-16T09:00:00Z")))?.completion.completedGoals).toEqual([]);

    await recordTrainingEvent(USER, { kind: "puzzle", entityId: "p1", occurredAt: new Date("2026-10-16T08:30:00Z") });
    const state = await getDailySessionState(USER, new Date("2026-10-16T09:00:00Z"));
    expect(state?.completion).toEqual({ completedGoals: ["tactics"], completedPoints: 35, percent: 58 });
  });

  it("expire le lendemain et se déverrouille sur demande", async () => {
    expect(await getDailySessionState(USER, new Date("2026-10-17T00:00:01Z"))).toBeNull();
    await applyDailyPlan(USER, { goals: ["review"], dailyLimit: 3 }, APPLIED);
    await clearDailySession(USER);
    expect(await getDailySessionState(USER, APPLIED)).toBeNull();
  });

  it("expose les lignes du répertoire seulement pour une session avec Ouvertures/Pièges", async () => {
    expect(listBotStartLines(null)).toEqual([]);
    const { state } = await applyDailyPlan(USER, { goals: ["openings", "traps"], dailyLimit: 3 }, APPLIED);
    const lines = listBotStartLines(state.session);
    const sourceIds = lines.map((line) => line.sourceId);
    expect(sourceIds).toEqual(expect.arrayContaining(["scotch-game", "berlin-black", "kings-indian"]));
    // Les cours hors répertoire restent sur leur fiche, mais le plan du jour ne les impose pas.
    for (const offRepertoire of OFF_REPERTOIRE_COURSE_IDS) expect(sourceIds).not.toContain(offRepertoire);
    expect(lines.some((line) => line.kind === "trap")).toBe(true);
    const { state: tacticsOnly } = await applyDailyPlan(USER, { goals: ["tactics"], dailyLimit: 3 }, APPLIED);
    expect(listBotStartLines(tacticsOnly.session)).toEqual([]);
  });
});
