import { describe, expect, it } from "vitest";
import { normalizeTrainingPreferences } from "./preferences";
import { encodeTrainingReason, parseTrainingReason } from "./reasons";
import { deduplicateCandidates, groupRecommendationCards, recommendationId, selectSessionCandidates } from "./recommendations";
import {
  aggregateMotifMisses,
  motifMissCandidates,
  summarizeTrapEvents,
  trapRecommendationCandidates,
} from "./signals";

describe("training recommendations", () => {
  const dueAt = new Date("2026-09-05T00:00:00.000Z");

  it("garde la candidate la plus prioritaire pour une meme cible et raison", () => {
    const result = deduplicateCandidates([
      { entityType: "puzzle", entityId: "p1", reasonCode: "motif-missed", priority: 2, dueAt },
      { entityType: "puzzle", entityId: "p1", reasonCode: "motif-missed", priority: 8, dueAt },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].priority).toBe(8);
  });

  it("trie par impact puis echeance et fabrique un identifiant stable", () => {
    const result = deduplicateCandidates([
      { entityType: "opening", entityId: "caro", reasonCode: "opening-due", priority: 4, dueAt },
      { entityType: "trap", entityId: "french", reasonCode: "trap-due", priority: 7, dueAt },
    ]);
    expect(result.map((candidate) => candidate.entityId)).toEqual(["french", "caro"]);
    expect(recommendationId(result[0])).toBe("trap:french:trap-due");
  });

  it("diversifie une seance avant de reprendre les priorites restantes", () => {
    const result = selectSessionCandidates(
      [
        { entityType: "puzzle", entityId: "p1", reasonCode: "puzzle-due", priority: 100, dueAt },
        { entityType: "puzzle", entityId: "p2", reasonCode: "puzzle-due", priority: 99, dueAt },
        { entityType: "opening", entityId: "o1", reasonCode: "opening-due", priority: 90, dueAt },
        { entityType: "review", entityId: "g1:12", reasonCode: "game-error", priority: 80, dueAt },
      ],
      3,
    );
    expect(result.map((candidate) => candidate.entityType)).toEqual(["puzzle", "opening", "review"]);
  });

  it("restreint la seance aux objectifs choisis et honore la charge quotidienne", () => {
    const result = selectSessionCandidates(
      [
        { entityType: "puzzle", entityId: "p1", reasonCode: "puzzle-due", priority: 100, dueAt },
        { entityType: "opening", entityId: "o1", reasonCode: "opening-due", priority: 90, dueAt },
        { entityType: "trap", entityId: "t1", reasonCode: "trap-due", priority: 95, dueAt },
        { entityType: "review", entityId: "g1:12", reasonCode: "game-error", priority: 80, dueAt },
      ],
      2,
      ["trap", "opening"],
    );
    expect(result.map((candidate) => candidate.entityType)).toEqual(["trap", "opening"]);
  });
});

describe("training preferences", () => {
  it("rejette un JSON corrompu vers un plan jouable", () => {
    expect(normalizeTrainingPreferences({ goals: ["nope", "traps"], dailyLimit: 99 })).toEqual({
      goals: ["traps"],
      dailyLimit: 8,
    });
    expect(normalizeTrainingPreferences(null).goals).toEqual(["tactics", "openings", "traps", "review"]);
  });
});

describe("training reasons", () => {
  it("encode et decode une preuve inspectable", () => {
    const raw = encodeTrainingReason("motif-missed", { motif: "fork", missCount: 2, avgCpLoss: 140.4 });
    expect(raw.startsWith("motif-missed|")).toBe(true);
    expect(parseTrainingReason(raw)).toEqual({
      code: "motif-missed",
      evidence: { motif: "fork", missCount: 2, avgCpLoss: 140 },
    });
    expect(parseTrainingReason("puzzle-due").code).toBe("puzzle-due");
  });

  it("transporte deck, variante et précision de la carte sans perte", () => {
    const puzzle = encodeTrainingReason("puzzle-due", { daysOverdue: 53, motif: "fork", deck: "missed_tactics" });
    expect(parseTrainingReason(puzzle).evidence).toEqual({
      daysOverdue: 53,
      motif: "fork",
      deck: "missed_tactics",
    });
    const opening = encodeTrainingReason("opening-due", {
      daysOverdue: 5,
      openingName: "Ruy Lopez (Espagnole)",
      variation: "Ligne principale",
      accuracy: 72.4,
    });
    expect(parseTrainingReason(opening).evidence).toEqual({
      daysOverdue: 5,
      openingName: "Ruy Lopez (Espagnole)",
      variation: "Ligne principale",
      accuracy: 72,
    });
  });
});

describe("training signals", () => {
  const now = new Date("2026-09-21T12:00:00.000Z");

  it("agrege les motifs manques et prefere un puzzle du meme motif", () => {
    const aggregates = aggregateMotifMisses([
      { motifs: ["fork"], motifFound: false, cpLoss: 120, gameId: "g1", ply: 18 },
      { motifs: ["fork", "pin"], motifFound: false, cpLoss: 80, gameId: "g2", ply: 22 },
      { motifs: ["pin"], motifFound: true, cpLoss: 0, gameId: "g3", ply: 10 },
    ]);
    expect(aggregates[0]).toMatchObject({ motif: "fork", missCount: 2 });
    const candidates = motifMissCandidates(
      aggregates,
      [{ id: "pz-fork", motifs: ["fork"], due: now }],
      now,
      1,
    );
    expect(candidates[0]).toMatchObject({ entityType: "puzzle", entityId: "pz-fork" });
    expect(candidates[0].reasonCode).toContain("motif-missed");
  });

  it("recommande un piege du repertoire et une refutation oubliee", () => {
    const events = summarizeTrapEvents([
      {
        entityId: "fried-liver",
        score: 0.5,
        hintsUsed: 1,
        occurredAt: new Date("2026-09-20T12:00:00.000Z"),
      },
    ]);
    const candidates = trapRecommendationCandidates(
      [
        { id: "fried-liver", name: "Fried Liver", family: "Italienne", eco: "C58" },
        { id: "najdorf-trap", name: "Najdorf", family: "Sicilienne", eco: "B90" },
      ],
      events,
      [{ eco: "B90", games: 12 }],
      now,
    );
    expect(candidates.some((candidate) => candidate.reasonCode.startsWith("trap-refutation-forgotten"))).toBe(true);
    expect(candidates.some((candidate) => candidate.entityId === "najdorf-trap")).toBe(true);
  });
});

describe("groupRecommendationCards", () => {
  it("fusionne les cartes puzzle à preuve identique, jamais les autres types", () => {
    const cards = groupRecommendationCards([
      { id: "1", entityType: "puzzle" as const, reasonCode: "puzzle-due|hanging" },
      { id: "2", entityType: "trap" as const, reasonCode: "trap|scotch" },
      { id: "3", entityType: "puzzle" as const, reasonCode: "puzzle-due|hanging" },
      { id: "4", entityType: "puzzle" as const, reasonCode: "puzzle-due|fork" },
      { id: "5", entityType: "review" as const, reasonCode: "same" },
      { id: "6", entityType: "review" as const, reasonCode: "same" },
    ]);
    expect(cards.map((card) => [card.item.id, card.count])).toEqual([
      ["1", 2],
      ["2", 1],
      ["4", 1],
      ["5", 1],
      ["6", 1],
    ]);
  });
});
