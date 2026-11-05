import { describe, expect, it, vi } from "vitest";

/**
 * Programme 1000 Heures sur une base multi-utilisateurs neuve (vraies migrations) :
 * le contenu des 5 phases est partagé, la progression est propre à chaque compte.
 *
 * - A termine un jour de la phase 2 ; B reste au jour 1 de la phase 1 ;
 * - la séance enregistrée de A n'apparaît nulle part chez B ;
 * - supprimer le compte A n'efface aucune ligne de B.
 */
vi.mock("@/server/db", async () => (await import("@/test/test-db")).createTestDb());

const { db } = await import("@/server/db");
const schema = await import("@/server/db/schema");
const { seedUsers } = await import("@/test/test-db");
const { userScope, deleteUserAndData } = await import("@/server/db/user-scope");
const programmeQ = await import("./programme");
const { PHASES } = await import("@/core/programme/phases");

const A = "programme-a";
const B = "programme-b";
const PHASE_2 = PHASES[1];

async function programmeRows(userId: string) {
  const s = userScope(userId);
  return {
    state: await db.select().from(schema.programmeState).where(s.owns(schema.programmeState)),
    sessions: await db.select().from(schema.programmeSessions).where(s.owns(schema.programmeSessions)),
    results: await db.select().from(schema.programmePuzzleResults).where(s.owns(schema.programmePuzzleResults)),
  };
}

describe("Programme : progression cloisonnée par utilisateur", () => {
  let sessionA = "";
  let sessionB = "";

  it("chaque compte démarre au jour 1 de la phase 1, les 5 phases sont générées pour tous", async () => {
    await seedUsers(db, A, B);
    for (const user of [A, B]) {
      const overview = await programmeQ.getProgrammeOverview(user);
      expect([overview.semaine, overview.jour]).toEqual([1, 1]);
      expect(overview.phases).toHaveLength(5);
      expect(overview.phases.every((p) => p.joursGeneres === (p.semaineFin - p.semaineDebut + 1) * 7)).toBe(true);
    }
  });

  it("A termine un jour de la phase 2", async () => {
    // Place A au premier jour de la phase 2 (S8J1) : la progression ne se fabrique pas autrement en test.
    await db.update(schema.programmeState).set({ semaine: PHASE_2.semaineDebut, jour: 1 }).where(userScope(A).owns(schema.programmeState));

    const payload = await programmeQ.startOrResumeSession(A);
    expect(payload).not.toBeNull();
    expect(payload!.phaseId).toBe(PHASE_2.id);
    expect(payload!.puzzles.length).toBeGreaterThan(0);
    sessionA = payload!.sessionId;

    for (const p of payload!.puzzles) {
      await programmeQ.recordProgrammeResult(A, { sessionId: sessionA, puzzleId: p.puzzle.puzzle_id, sourceDayKey: p.sourceDayKey, role: p.role, skeletonOk: true, solved: true });
    }
    const outcome = await programmeQ.completeProgrammeSession(A, {
      sessionId: sessionA,
      checklist: ["fait"],
      reconsolidation: { note: "séance de A", selfRating: "reussi" },
    });
    expect(outcome.attempted).toBe(payload!.puzzles.length);
    expect(outcome.succeeded).toBe(payload!.puzzles.length);

    const overviewA = await programmeQ.getProgrammeOverview(A);
    expect([overviewA.semaine, overviewA.jour]).toEqual([PHASE_2.semaineDebut, 2]);
    expect(overviewA.phaseId).toBe(PHASE_2.id);
    expect(overviewA.stats.completedSessions).toBe(1);
    expect(overviewA.week[0].done).toBe(true);
    expect(overviewA.phases.map((p) => p.status)).toEqual(["validee", "en_cours", "verrouillee", "verrouillee", "verrouillee"]);
  });

  it("B reste au jour 1 de la phase 1 et ne voit pas la séance de A", async () => {
    const overviewB = await programmeQ.getProgrammeOverview(B);
    expect([overviewB.semaine, overviewB.jour, overviewB.repetition]).toEqual([1, 1, 0]);
    expect(overviewB.phaseId).toBe(PHASES[0].id);
    expect(overviewB.stats.completedSessions).toBe(0);
    expect(overviewB.stats.rollingSuccess).toBeNull();
    expect(overviewB.library).toEqual([]);
    expect(overviewB.inProgressSessionId).toBeNull();
    expect(overviewB.week.some((d) => d.done)).toBe(false);
    expect(overviewB.phases.map((p) => p.status)).toEqual(["en_cours", "verrouillee", "verrouillee", "verrouillee", "verrouillee"]);

    // B démarre son propre jour 1 : nouvelle séance, aucun résultat hérité de A.
    const payloadB = await programmeQ.startOrResumeSession(B);
    expect(payloadB!.dayKey).toBe("S1J1");
    expect(payloadB!.sessionId).not.toBe(sessionA);
    expect(payloadB!.done).toEqual([]);
    sessionB = payloadB!.sessionId;
    const first = payloadB!.puzzles[0];
    await programmeQ.recordProgrammeResult(B, { sessionId: sessionB, puzzleId: first.puzzle.puzzle_id, sourceDayKey: first.sourceDayKey, role: first.role, skeletonOk: true, solved: false });

    const rowsB = await programmeRows(B);
    expect(rowsB.sessions.map((s) => s.id)).toEqual([sessionB]);
    expect(rowsB.results.every((r) => r.sessionId === sessionB)).toBe(true);
  });

  it("B ne peut ni écrire dans la séance de A ni la terminer", async () => {
    await expect(
      programmeQ.recordProgrammeResult(B, { sessionId: sessionA, puzzleId: "intrus", sourceDayKey: "S8J1", role: "puzzle", skeletonOk: true, solved: true }),
    ).rejects.toThrow("Séance introuvable");
    await expect(
      programmeQ.completeProgrammeSession(B, { sessionId: sessionA, checklist: [], reconsolidation: { note: "", selfRating: null } }),
    ).rejects.toThrow("Séance introuvable");
    expect((await programmeRows(A)).results.some((r) => r.puzzleId === "intrus")).toBe(false);
  });

  it("supprimer le compte A n'efface rien chez B", async () => {
    const before = await programmeRows(B);
    expect(before.state).toHaveLength(1);
    expect(before.sessions).toHaveLength(1);
    expect(before.results).toHaveLength(1);

    deleteUserAndData(A);

    const afterA = await programmeRows(A);
    expect([afterA.state.length, afterA.sessions.length, afterA.results.length]).toEqual([0, 0, 0]);
    expect(await programmeRows(B)).toEqual(before);
    const resume = await programmeQ.startOrResumeSession(B);
    expect(resume!.sessionId).toBe(sessionB);
    expect(resume!.done).toHaveLength(1);
  });
});
