import { describe, expect, it } from "vitest";
import { BOT_PROFILES, getBotProfile, pickMoveLimit } from "./bot-profiles";

describe("getBotProfile", () => {
  it("retrouve chacun des 4 profils par id", () => {
    for (const profile of BOT_PROFILES) {
      expect(getBotProfile(profile.id)).toBe(profile);
    }
  });

  it("rejette un id inconnu", () => {
    // @ts-expect-error id volontairement invalide
    expect(() => getBotProfile("grand-maitre")).toThrow();
  });
});

describe("pickMoveLimit", () => {
  it("renvoie une profondeur fixe pour Stockfish, sans borne de temps", () => {
    const stockfish = getBotProfile("stockfish");
    const limit = pickMoveLimit(stockfish);
    expect(limit).toEqual({ depth: 16 });
  });

  it("tire un movetime dans la fenêtre du profil pour les bots bridés", () => {
    const club = getBotProfile("club");
    const [min, max] = club.thinkTimeRangeMs!;
    for (let i = 0; i < 50; i += 1) {
      const limit = pickMoveLimit(club);
      expect(limit.depth).toBeUndefined();
      expect(limit.movetimeMs).toBeGreaterThanOrEqual(min);
      expect(limit.movetimeMs).toBeLessThanOrEqual(max);
    }
  });
});
