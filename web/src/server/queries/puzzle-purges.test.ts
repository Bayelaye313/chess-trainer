import { describe, expect, it, vi } from "vitest";

// Base SQLite en mémoire, migrée avec les VRAIES migrations de `drizzle/`.
vi.mock("@/server/db", async () => (await import("@/test/test-db")).createTestDb());

const { db } = await import("@/server/db");
const { games, moves, puzzlePurges, puzzles } = await import("@/server/db/schema");
const { extractPuzzlesFromGame } = await import("./spaced-repetition");
const { getPuzzleById } = await import("./reviews");
const { seedUsers } = await import("@/test/test-db");
const USER = "user-audit";
await seedUsers(db, USER);

const NOW = new Date("2026-11-05T10:00:00Z");
const FEN = "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4";

async function seedGame(id: string) {
  await db.insert(games).values({ id, userId: USER, source: "local", initialFen: FEN, playerColor: "w", createdAt: NOW, playedAt: NOW } as never);
  const [row] = await db
    .insert(moves)
    .values({
      userId: USER,
      gameId: id,
      ply: 7,
      side: "w",
      byPlayer: true,
      uci: "d2d3",
      san: "d3",
      fenBefore: FEN,
      quality: "blunder",
      phase: "opening",
      cpLoss: 900,
      bestUci: "h5f7",
      bestSan: "Qxf7#",
      bestPv: ["h5f7"],
      mateMissed: true,
    } as never)
    .returning({ id: moves.id });
  return row.id;
}

describe("audit Stockfish des puzzles de parties", () => {
  it("un coup dont le puzzle a été purgé ne redevient jamais un puzzle", async () => {
    const moveId = await seedGame("game-purged");
    await db.insert(puzzlePurges).values({ moveId, userId: USER, gameId: "game-purged", fenBefore: FEN, reason: "ambiguous", purgedAt: NOW });

    const result = await extractPuzzlesFromGame(USER, "game-purged", NOW);

    expect(result).toEqual({ scanned: 1, created: 0 });
  });

  it("sans pierre tombale, le même coup donne un puzzle, servi avec son commentaire de coach", async () => {
    await seedGame("game-kept");
    expect((await extractPuzzlesFromGame(USER, "game-kept", NOW)).created).toBe(1);

    const [puzzle] = await db.select().from(puzzles);
    const comment = '[%txt "Il y avait mat en 1 : Qxf7#."] [%cal Rd2d3,Gh5f7]';
    await db.update(puzzles).set({ coachComment: comment, alternatives: [["c4f7"]] });

    const served = await getPuzzleById(USER, puzzle.id);
    expect(served?.coachComment).toBe(comment);
    expect(served?.alternatives).toEqual([["c4f7"]]);
  });
});
