import { describe, expect, it } from "vitest";
import { deduplicateCandidates, recommendationId, selectSessionCandidates } from "./recommendations";

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
});