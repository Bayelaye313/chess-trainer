import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/db", async () => (await import("@/test/test-db")).createTestDb());

const { db } = await import("@/server/db");
const { adminAudit, sessions, users } = await import("@/server/db/schema");
const { seedUsers } = await import("@/test/test-db");
const { runAdminAction } = await import("./actions-core");
const { listUsersForAdmin, getUserForAdmin } = await import("./users");
const { createAdapter } = await import("@/server/auth/adapter");
const { eq } = await import("drizzle-orm");

const FUTURE = new Date(Date.now() + 3_600_000);
const admin = { id: "admin", email: "admin@test.local" };

describe("actions d'administration", () => {
  it("un admin ne peut agir sur son propre compte", async () => {
    await seedUsers(db, "admin", "zoe", "yan");
    expect(runAdminAction(admin, "admin", "suspend")).toEqual({ ok: false, error: "Tu ne peux pas agir sur ton propre compte." });
    expect(runAdminAction(admin, "inconnu", "suspend").ok).toBe(false);
  });

  it("suspendre ferme les sessions, et une session d'un compte suspendu est refusée à la lecture", async () => {
    await db.insert(sessions).values([
      { sessionToken: "zoe-1", userId: "zoe", expires: FUTURE },
      { sessionToken: "zoe-2", userId: "zoe", expires: FUTURE },
    ]);
    const adapter = createAdapter();
    expect(await adapter.getSessionAndUser!("zoe-1")).not.toBeNull();

    expect(runAdminAction(admin, "zoe", "suspend")).toEqual({ ok: true, message: "Compte suspendu, 2 session(s) fermée(s)." });
    expect(await db.select().from(sessions).where(eq(sessions.userId, "zoe"))).toEqual([]);

    // Même une session qui aurait survécu est refusée, puis supprimée.
    await db.insert(sessions).values({ sessionToken: "zoe-3", userId: "zoe", expires: FUTURE });
    expect(await adapter.getSessionAndUser!("zoe-3")).toBeNull();
    expect(await db.select().from(sessions).where(eq(sessions.sessionToken, "zoe-3"))).toEqual([]);

    expect(runAdminAction(admin, "zoe", "reactivate").ok).toBe(true);
    expect((await db.select().from(users).where(eq(users.id, "zoe")))[0].status).toBe("active");
  });

  it("révoquer les sessions, et tout est journalisé (qui, quoi, sur qui, quand)", async () => {
    await db.insert(sessions).values({ sessionToken: "yan-1", userId: "yan", expires: FUTURE });
    expect(runAdminAction(admin, "yan", "revoke-sessions")).toEqual({ ok: true, message: "1 session(s) fermée(s)." });
    const audit = await db.select().from(adminAudit);
    expect(audit.map((row) => [row.actorId, row.action, row.targetId])).toEqual([
      ["admin", "suspend", "zoe"],
      ["admin", "reactivate", "zoe"],
      ["admin", "revoke-sessions", "yan"],
    ]);
    expect(audit.every((row) => row.createdAt instanceof Date)).toBe(true);
  });

  it("liste et fiche : recherche, pagination, métadonnées uniquement", async () => {
    const list = await listUsersForAdmin({ query: "zoe" });
    expect(list.rows.map((row) => row.id)).toEqual(["zoe"]);
    expect(Object.keys(list.rows[0]).sort()).toEqual(["activeSeconds7d", "createdAt", "email", "id", "lastActivityAt", "name", "role", "state"]);
    expect((await listUsersForAdmin({})).total).toBe(3);
    const detail = await getUserForAdmin("yan");
    expect(detail?.sessions).toEqual([]);
  });
});
