import { beforeAll, describe, expect, it, vi } from "vitest";

/**
 * Cloisonnement par utilisateur, de bout en bout sur une vraie base migrée :
 *
 * - A ne voit jamais les lignes de B, table personnelle par table personnelle ;
 * - A ne peut ni lire ni écrire les données de B en fournissant un identifiant
 *   de B (partie, carte, séance) à une requête ou à une server action ;
 * - la suppression de compte n'efface que les lignes du compte ;
 * - la reprise LEGACY_CLAIM_EMAIL ne s'applique qu'une fois.
 */
vi.mock("@/server/db", async () => (await import("@/test/test-db")).createTestDb());

// Session simulée : les server actions lisent l'utilisateur via requireUser().
const session = vi.hoisted(() => ({ current: { id: "", name: null as string | null, email: null as string | null, role: "user" as const } }));
vi.mock("@/server/auth/session", () => ({
  requireUser: async () => session.current,
  getCurrentUser: async () => session.current,
  sessionUser: async () => session.current,
  requireAdmin: async () => session.current,
}));
// Pas d'analyse ni de synchro réelle dans ce test.
vi.mock("@/server/import/run-sync", () => ({ runSync: async () => null, isSyncRunning: () => false }));

const { db } = await import("@/server/db");
const schema = await import("@/server/db/schema");
const { seedUsers } = await import("@/test/test-db");
const { PERSONAL_TABLES, userScope, deleteUserAndData, claimLegacyData, LEGACY_USER_ID } = await import("./user-scope");
const { initialReviewFields } = await import("@/server/srs/fsrs");
const games = await import("@/server/queries/games");
const reviewsQ = await import("@/server/queries/reviews");
const srs = await import("@/server/queries/spaced-repetition");
const settingsQ = await import("@/server/queries/settings");
const progressQ = await import("@/server/queries/progress");
const openingProgressQ = await import("@/server/queries/opening-progress");
const enduranceQ = await import("@/server/queries/opening-endurance");
const mistakeReviewQ = await import("@/server/queries/opening-mistake-review");
const sparringQ = await import("@/server/queries/sparring");
const trainingQ = await import("@/server/queries/training");
const curriculumQ = await import("@/server/queries/curriculum");
const programmeQ = await import("@/server/queries/programme");
const practiceActions = await import("@/server/actions/practice");
const playActions = await import("@/server/actions/play");
const linkActions = await import("@/server/actions/platform-link");
const sparringActions = await import("@/server/actions/sparring");

const A = "user-a";
const B = "user-b";
const NOW = new Date("2026-10-20T10:00:00Z");
const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const AFTER_E4 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";

function as(userId: string) {
  session.current = { id: userId, name: null, email: `${userId}@test.local`, role: "user" };
}

/** Une partie analysée, une carte FSRS, une séance de sparring, etc. pour `userId`. */
async function seedOwnData(userId: string, tag: string) {
  const s = userScope(userId);
  const gameId = `game-${tag}`;
  await db.insert(schema.games).values(
    s.own({
      id: gameId,
      source: "lichess" as const,
      externalId: "shared-external-id", // même partie importée par les deux comptes
      pgn: "1. e4 e5 *",
      initialFen: START,
      playerColor: "w" as const,
      playerRating: tag === "a" ? 1500 : 2400,
      opponentName: `adversaire-${tag}`,
      eco: "C20",
      playedAt: NOW,
      createdAt: NOW,
    }),
  );
  const [move] = await db
    .insert(schema.moves)
    .values(
      s.ownAll([
        { gameId, ply: 1, side: "w" as const, byPlayer: true, uci: "e2e4", san: "e4", fenBefore: START, quality: "brilliant" as const, phase: "opening" as const, cpLoss: 120, bestUci: "d2d4", bestSan: "d4" },
        { gameId, ply: 2, side: "b" as const, byPlayer: false, uci: "e7e5", san: "e5", fenBefore: AFTER_E4, quality: "best" as const, phase: "opening" as const },
      ]),
    )
    .returning();
  await db.insert(schema.botGameResults).values(s.own({ id: `bot-${tag}`, gameId, botProfile: "club" as never, botElo: 1500, performanceElo: 1500, createdAt: NOW }));
  const puzzleId = `puzzle-${tag}`;
  await db.insert(schema.puzzles).values(
    s.own({ id: puzzleId, deck: "missed_tactics" as const, gameId, moveId: move.id, fenBefore: START, solution: ["d2d4"], solutionSan: ["d4"], source: "local" as const, createdAt: NOW }),
  );
  await db.insert(schema.reviews).values(s.own({ ...initialReviewFields(new Date("2026-10-01T00:00:00Z")), puzzleId, lapses: 2, state: 2 }));
  await db.insert(schema.puzzlePurges).values(s.own({ moveId: 100_000 + move.id, gameId, fenBefore: START, reason: "test", purgedAt: NOW }));
  await settingsQ.saveTrainingPreferences(userId, { goals: tag === "a" ? ["tactics"] : ["openings"], dailyLimit: tag === "a" ? 3 : 7 });
  await db.insert(schema.platformLinks).values(s.own({ source: "lichess" as const, username: `pseudo-${tag}`, linkedAt: NOW }));
  await srs.ensureDailySet(userId, NOW);
  await srs.submitPuzzleAnswer(userId, { puzzleId, grade: "good", playedUci: "d2d4" }, NOW);
  await openingProgressQ.recordOpeningDrillResult(userId, { openingId: "scotch-game", selection: { kind: "main-line" }, variationLabel: "Principale", correct: 9, attempted: 10 }, NOW);
  await enduranceQ.recordEnduranceSession(userId, { openingId: "scotch-game", openingName: "Écossaise", selection: { kind: "main-line" }, variationLabel: "Principale", firstMistakePly: 9, lastPly: 20, correct: 8, attempted: 10 }, NOW);
  await mistakeReviewQ.markOpeningMistakeReviewed(userId, START, `uci-${tag}`, NOW);
  const sparringId = await sparringQ.startSparringSession(userId, { openingId: "scotch-game", variationKey: "main", policy: "stockfish" });
  await sparringQ.recordSparringMove(userId, { sessionId: sparringId, ply: 1, fenBefore: START, uci: `move-${tag}`, byPlayer: false });
  await sparringQ.finishSparringSession(userId, { sessionId: sparringId, result: "loss" });
  await db.insert(schema.trainingRecommendations).values(
    s.own({ id: `${userId}:reco`, entityType: "puzzle" as const, entityId: puzzleId, reasonCode: "x", priority: 10, dueAt: NOW, completedAt: null }),
  );
  await curriculumQ.ensureCurriculumSeeded();
  const [theme] = await db.select().from(schema.curriculumThemes).limit(1);
  await curriculumQ.completeThemePuzzle(userId, theme.id, NOW);
  const programme = await programmeQ.startOrResumeSession(userId);
  if (programme) {
    await programmeQ.recordProgrammeResult(userId, { sessionId: programme.sessionId, puzzleId: `pp-${tag}`, sourceDayKey: programme.dayKey, role: "puzzle", skeletonOk: true, solved: true });
  }
  return { gameId, puzzleId, sparringId, programmeSessionId: programme?.sessionId ?? null, themeId: theme.id };
}

let dataA: Awaited<ReturnType<typeof seedOwnData>>;
let dataB: Awaited<ReturnType<typeof seedOwnData>>;

async function countOwned(userId: string): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const [name, table] of Object.entries(PERSONAL_TABLES)) {
    counts[name] = (await db.select().from(table).where(userScope(userId).owns(table))).length;
  }
  return counts;
}

beforeAll(async () => {
  await seedUsers(db, A, B);
  dataA = await seedOwnData(A, "a");
  dataB = await seedOwnData(B, "b");
});

describe("chaque table personnelle est cloisonnée", () => {
  it("chacun des deux comptes possède au moins une ligne dans CHAQUE table personnelle", async () => {
    for (const userId of [A, B]) {
      const counts = await countOwned(userId);
      for (const [name, count] of Object.entries(counts)) expect({ name, ok: count > 0 }).toEqual({ name, ok: true });
    }
  });

  it("parties et coups : listes, recherche, détail, voisines, brillants, progrès", async () => {
    expect((await games.listGamesSummary(A)).games.map((g) => g.id)).toEqual([dataA.gameId]);
    expect((await games.searchGamesSummary(A, "adversaire")).map((g) => g.id)).toEqual([dataA.gameId]);
    expect(await games.getGameDetail(A, dataB.gameId)).toBeNull();
    expect((await games.getGameDetail(B, dataB.gameId))?.game.id).toBe(dataB.gameId);
    expect(await games.getAdjacentGameIds(A, dataB.gameId)).toEqual({ previousGameId: null, nextGameId: null });
    expect((await games.listMasterpieces(A)).map((m) => m.gameId)).toEqual([dataA.gameId]);
    expect((await progressQ.getMoveQualityTally(A)).brilliant).toBe(1);
    expect((await progressQ.getReportSummary(A)).gamesAnalysed ?? 1).toBeGreaterThan(0);
  });

  it("cartes FSRS, révisions et plan du jour", async () => {
    const decksA = await reviewsQ.listDeckOverviews(A, NOW);
    const total = decksA.filter((d) => d.id !== "daily").reduce((sum, d) => sum + d.dueCount + d.newCount, 0);
    expect(total).toBeLessThanOrEqual(1);
    expect(await reviewsQ.getPuzzleById(A, dataB.puzzleId)).toBeNull();
    expect((await reviewsQ.getPuzzleById(A, dataA.puzzleId))?.id).toBe(dataA.puzzleId);
    expect(await srs.ensureDailySet(A, NOW)).not.toContain(dataB.puzzleId);
    expect((await srs.getDailyProgress(B, NOW)).doneIds).toEqual([dataB.puzzleId]);
    expect(await settingsQ.getTrainingPreferences(A)).toMatchObject({ dailyLimit: 3 });
    expect(await settingsQ.getTrainingPreferences(B)).toMatchObject({ dailyLimit: 7 });
  });

  it("ouvertures, endurance, erreurs revues, sparring, Académie, Programme", async () => {
    expect(await openingProgressQ.listOpeningReviewSummaries(A)).toHaveLength(1);
    expect(await enduranceQ.listEnduranceSessions(A)).toHaveLength(1);
    expect([...(await mistakeReviewQ.listReviewedMistakeKeys(A))].some((key) => key.includes("uci-b"))).toBe(false);
    expect((await sparringQ.listRecentSparringSessions(A)).map((row) => row.id)).toEqual([dataA.sparringId]);
    expect(Object.keys((await sparringQ.getSparringMoveBias(A, { openingId: "scotch-game", variationKey: "main" })).bias)).toEqual(["move-a"]);
    const overview = await curriculumQ.listCurriculumOverview(A);
    const theme = overview.flatMap((c) => c.themes).find((t) => t.id === dataA.themeId);
    expect(theme?.completedCount).toBe(1);
    const programme = await programmeQ.getProgrammeOverview(A);
    expect(programme.stats.currentElo).toBe(1500);
  });

  it("un compte neuf démarre avec une base propre", async () => {
    await seedUsers(db, "user-new");
    expect((await games.listGamesSummary("user-new")).games).toEqual([]);
    expect(await trainingQ.listTrainingRecommendations("user-new", NOW)).toEqual([]);
    expect(await openingProgressQ.listDueReviews("user-new", NOW)).toEqual([]);
    expect((await programmeQ.getProgrammeOverview("user-new")).stats.currentElo).toBeNull();
  });
});

describe("un identifiant d'un autre compte ne donne accès à rien", () => {
  it("server actions : lire la carte de B, la noter, écrire dans sa partie", async () => {
    as(A);
    expect(await practiceActions.getPuzzle(dataB.puzzleId)).toBeNull();
    expect(await practiceActions.submitPuzzleAnswer({ puzzleId: dataB.puzzleId, grade: "again", playedUci: null })).toBe(false);
    const [reviewB] = await db.select().from(schema.reviews).where(userScope(B).where(schema.reviews));
    expect(reviewB.lapses).toBe(2);

    const movesBefore = (await db.select().from(schema.moves).where(userScope(B).owns(schema.moves))).length;
    await playActions.recordPlayerMove({
      gameId: dataB.gameId,
      ply: 3,
      side: "w",
      evaluated: { uci: "g1f3", san: "Nf3", fenBefore: START, quality: "best", phase: "opening", motifs: [], bestPv: [] } as never,
    });
    await playActions.deletePlayerMove({ gameId: dataB.gameId, ply: 1 });
    await playActions.finishGame({ gameId: dataB.gameId, finalFen: START, pgn: "piraté", outcome: null });
    await playActions.saveBotGameResult({ gameId: dataB.gameId, botProfile: "club" as never, botElo: 1, accuracy: null, performanceElo: 1, outcome: null });
    expect((await db.select().from(schema.moves).where(userScope(B).owns(schema.moves))).length).toBe(movesBefore);
    expect((await games.getGameDetail(B, dataB.gameId))?.game.pgn).toBe("1. e4 e5 *");
    expect((await db.select().from(schema.botGameResults).where(userScope(B).owns(schema.botGameResults))).length).toBe(1);
  });

  it("sparring et Programme : séances de B", async () => {
    as(A);
    await sparringActions.recordSparringMove({ sessionId: dataB.sparringId, ply: 2, fenBefore: START, uci: "intrus", byPlayer: false });
    await sparringActions.finishSparringSession({ sessionId: dataB.sparringId, result: "win" });
    const [sessionB] = await sparringQ.listRecentSparringSessions(B);
    expect(sessionB.result).toBe("loss");
    expect(Object.keys((await sparringQ.getSparringMoveBias(B, { openingId: "scotch-game", variationKey: "main" })).bias)).toEqual(["move-b"]);
    if (dataB.programmeSessionId) {
      await expect(
        programmeQ.recordProgrammeResult(A, { sessionId: dataB.programmeSessionId, puzzleId: "x", sourceDayKey: "s1j1", role: "puzzle", skeletonOk: true, solved: true }),
      ).rejects.toThrow("Séance introuvable");
      const resultsB = await db.select().from(schema.programmePuzzleResults).where(userScope(B).owns(schema.programmePuzzleResults));
      expect(resultsB.some((row) => row.puzzleId === "x")).toBe(false);
    }
  });

  it("comptes liés : propres à chaque utilisateur", async () => {
    as(A);
    expect((await linkActions.listPlatformLinks()).map((link) => link.username)).toEqual(["pseudo-a"]);
    await linkActions.unlinkPlatform("lichess");
    as(B);
    expect((await linkActions.listPlatformLinks()).map((link) => link.username)).toEqual(["pseudo-b"]);
    as(A);
    await linkActions.linkPlatform({ source: "lichess", username: "pseudo-a2" });
    expect((await linkActions.listPlatformLinks()).map((link) => link.username)).toEqual(["pseudo-a2"]);
  });

  it("écrire avec un userId vide ou l'identifiant historique est refusé", () => {
    expect(() => userScope("")).toThrow();
    expect(() => userScope(LEGACY_USER_ID)).toThrow();
  });
});

describe("suppression de compte", () => {
  it("efface toutes les lignes de A et aucune de B", async () => {
    const before = await countOwned(B);
    await seedUsers(db, "user-del");
    await seedOwnData("user-del", "del");
    deleteUserAndData("user-del");
    expect(Object.values(await countOwned("user-del")).every((n) => n === 0)).toBe(true);
    expect(await countOwned(B)).toEqual(before);
    const remaining = await db.query.users.findMany();
    expect(remaining.map((u) => u.id)).not.toContain("user-del");
  });
});

describe("reprise LEGACY_CLAIM_EMAIL", () => {
  it("rattache les lignes NULL / 'local' une seule fois", async () => {
    // Lignes de l'époque mono-utilisateur : colonnes ajoutées (NULL) et anciennes colonnes ('local').
    await db.insert(schema.games).values({ id: "legacy-game", source: "local", pgn: "1. e4 *", initialFen: START, playerColor: "w", playedAt: NOW, createdAt: NOW });
    // Les lignes 'local' précèdent la clé étrangère (migration 0019) : insérées ici FK coupées.
    db.$client.pragma("foreign_keys = OFF");
    await db.insert(schema.trainingRecommendations).values({ id: "legacy-reco", userId: LEGACY_USER_ID, entityType: "puzzle", entityId: "p", reasonCode: "x", priority: 1, dueAt: NOW });
    db.$client.pragma("foreign_keys = ON");

    await seedUsers(db, "owner", "other");
    expect(claimLegacyData("other", "other@test.local", "owner@test.local").claimed).toBe(false);
    const first = claimLegacyData("owner", "OWNER@test.local", "owner@test.local");
    expect(first.claimed).toBe(true);
    expect(first.counts.games).toBe(1);
    expect(first.counts.trainingRecommendations).toBe(1);
    expect((await games.listGamesSummary("owner")).games.map((g) => g.id)).toEqual(["legacy-game"]);

    // Une nouvelle ligne orpheline ne serait plus reprise : la reprise est unique.
    await db.insert(schema.games).values({ id: "late-legacy", source: "local", pgn: "1. d4 *", initialFen: START, playerColor: "w", playedAt: NOW, createdAt: NOW });
    expect(claimLegacyData("owner", "owner@test.local", "owner@test.local").claimed).toBe(false);
    expect((await games.listGamesSummary("owner")).games.map((g) => g.id)).toEqual(["legacy-game"]);
    const audit = await db.select().from(schema.adminAudit);
    expect(audit.filter((row) => row.action === "legacy-claim")).toHaveLength(1);
  });

  it("sans LEGACY_CLAIM_EMAIL, rien n'est repris", () => {
    expect(claimLegacyData("other", "other@test.local", undefined)).toEqual({ claimed: false, counts: {} });
  });
});
