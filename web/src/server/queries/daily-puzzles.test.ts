import { describe, expect, it, vi } from "vitest";

// Base SQLite en mémoire, migrée avec les VRAIES migrations de `drizzle/`.
vi.mock("@/server/db", async () => (await import("@/test/test-db")).createTestDb());

const { db } = await import("@/server/db");
const { puzzles, reviews, trainingRecommendations } = await import("@/server/db/schema");
const { initialReviewFields } = await import("@/server/srs/fsrs");
const { ensureDailySet, getDailyProgress, submitPuzzleAnswer } = await import("./spaced-repetition");
const { getNextDuePuzzle, listDeckOverviews } = await import("./reviews");
const { seedUsers } = await import("@/test/test-db");
const USER = "user-puzzles";
await seedUsers(db, USER);

const DAY1 = new Date("2026-10-16T08:00:00Z");
const DAY2 = new Date("2026-10-17T08:00:00Z");
const FEN = "4k3/8/8/8/8/8/8/4K2R w K - 0 1";

async function seedPuzzle(id: string, due: Date, lapses = 1) {
  await db.insert(puzzles).values({
    id,
    userId: USER,
    deck: "missed_tactics",
    fenBefore: FEN,
    solution: ["h1h8"],
    solutionSan: ["Rh8+"],
    source: "local",
    createdAt: DAY1,
  });
  // `state` 2 (Review) : une carte déjà apprise, échouée `lapses` fois.
  await db.insert(reviews).values({ ...initialReviewFields(DAY1), userId: USER, puzzleId: id, due, lapses, state: 2 });
}

describe("deck « Puzzles du jour »", () => {
  it("ne sélectionne que des cartes dues d'ici la fin du jour", async () => {
    await seedPuzzle("p-due", new Date("2026-08-14T00:00:00Z"), 3);
    await seedPuzzle("p-due-tonight", new Date("2026-10-16T22:00:00Z"), 1);
    await seedPuzzle("p-future", new Date("2026-11-30T00:00:00Z"), 9);
    expect(await ensureDailySet(USER, DAY1)).toEqual(["p-due", "p-due-tonight"]);
  });

  it("retire un puzzle noté aujourd'hui de la file et du compteur, sans jamais le resservir", async () => {
    expect((await listDeckOverviews(USER, DAY1)).find((deck) => deck.id === "daily")?.dueCount).toBe(2);
    expect((await getNextDuePuzzle(USER, "daily", DAY1))?.id).toBe("p-due");

    // Même un « Encore » (échéance FSRS à quelques minutes) compte comme fait.
    await submitPuzzleAnswer(USER, { puzzleId: "p-due", grade: "again", playedUci: null }, DAY1);
    expect(await getDailyProgress(USER, DAY1)).toMatchObject({ doneIds: ["p-due"], remainingIds: ["p-due-tonight"] });
    expect((await getNextDuePuzzle(USER, "daily", DAY1))?.id).toBe("p-due-tonight");
    expect((await listDeckOverviews(USER, DAY1)).find((deck) => deck.id === "daily")?.dueCount).toBe(1);

    await submitPuzzleAnswer(USER, { puzzleId: "p-due-tonight", grade: "good", playedUci: null }, DAY1);
    expect(await getNextDuePuzzle(USER, "daily", DAY1)).toBeNull();
    expect((await listDeckOverviews(USER, DAY1)).find((deck) => deck.id === "daily")?.dueCount).toBe(0);
  });

  it("ne reprend pas le lendemain un puzzle réussi la veille", async () => {
    const tomorrow = await ensureDailySet(USER, DAY2);
    expect(tomorrow).not.toContain("p-due-tonight");
    expect(tomorrow).not.toContain("p-future");
  });
});

describe("cartes puzzle de la Séance du jour", () => {
  it("chaque puzzle résolu ferme UNE carte : la sienne d'abord, sinon la plus prioritaire", async () => {
    const base = { userId: USER, entityType: "puzzle" as const, dueAt: DAY1, completedAt: null };
    await db.insert(trainingRecommendations).values([
      { ...base, id: "r-a", entityId: "p-due", reasonCode: "a", priority: 50 },
      { ...base, id: "r-b", entityId: "other-1", reasonCode: "b", priority: 90 },
      { ...base, id: "r-c", entityId: "other-2", reasonCode: "c", priority: 70 },
    ]);
    const openIds = async () =>
      (await db.select().from(trainingRecommendations)).filter((row) => row.completedAt === null).map((row) => row.id).sort();

    await submitPuzzleAnswer(USER, { puzzleId: "p-due", grade: "good", playedUci: null }, DAY2);
    expect(await openIds()).toEqual(["r-b", "r-c"]);

    await submitPuzzleAnswer(USER, { puzzleId: "p-future", grade: "good", playedUci: null }, DAY2);
    expect(await openIds()).toEqual(["r-c"]);
  });
});
