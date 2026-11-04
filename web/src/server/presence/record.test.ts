import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/db", async () => (await import("@/test/test-db")).createTestDb());

const { db } = await import("@/server/db");
const { userDailyActivity, userPresence, sessions } = await import("@/server/db/schema");
const { seedUsers } = await import("@/test/test-db");
const { recordHeartbeat } = await import("./record");
const { getDashboardStats, getOnlineSnapshot } = await import("@/server/admin/stats");

const T0 = new Date("2026-11-04T10:00:00Z");
const at = (seconds: number) => new Date(T0.getTime() + seconds * 1000);

describe("battements de présence", () => {
  it("cumule le temps actif par jour UTC, compte les sessions, garde la section", async () => {
    await seedUsers(db, "alice", "bob");
    recordHeartbeat("alice", "jouer", at(0));
    recordHeartbeat("alice", "jouer", at(60));
    recordHeartbeat("alice", "ouvertures", at(120));
    // 10 minutes de silence : nouvelle session, rien crédité.
    recordHeartbeat("alice", "ouvertures", at(720));
    recordHeartbeat("bob", "programme", at(700));

    const [alice] = await db.select().from(userDailyActivity).where((await import("drizzle-orm")).eq(userDailyActivity.userId, "alice"));
    expect(alice).toMatchObject({ day: "2026-11-04", activeSeconds: 120, sessionsCount: 2 });
    const presence = await db.select().from(userPresence);
    expect(presence.find((row) => row.userId === "alice")?.currentSection).toBe("ouvertures");

    // En ligne puis hors ligne après 2 minutes sans battement.
    expect((await getOnlineSnapshot(at(730))).onlineNow).toBe(2);
    expect((await getOnlineSnapshot(at(720 + 121))).onlineNow).toBe(0);
  });

  it("agrège le tableau de bord sans lire de contenu personnel", async () => {
    await db.insert(sessions).values({ sessionToken: "t1", userId: "alice", expires: at(3600) });
    await db.insert(sessions).values({ sessionToken: "t2", userId: "bob", expires: at(-1) });
    const stats = await getDashboardStats(at(730));
    expect(stats).toMatchObject({ onlineNow: 2, dau: 1, wau: 1, mau: 1, totalUsers: 2, activeSessions: 1 });
    expect(stats.onlineBySection).toEqual([
      { section: "ouvertures", count: 1 },
      { section: "programme", count: 1 },
    ]);
    expect(stats.activePerDay).toHaveLength(30);
    expect(stats.averageActiveSeconds7d).toBe(120);
  });
});
