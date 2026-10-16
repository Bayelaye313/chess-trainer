import { describe, expect, it } from "vitest";
import { BookOpponentPolicy, type RandomSource } from "./opponent-policy";

function random(values: number[]): RandomSource {
  return { next: () => values.shift() ?? 0 };
}

describe("BookOpponentPolicy", () => {
  const candidates = [
    { uci: "e2e4", games: 100 },
    { uci: "d2d4", games: 20 },
  ];

  it("joue le coup humain le plus populaire sans deviation", () => {
    const policy = new BookOpponentPolicy({ temperature: 1, deviationRate: 0 }, random([0.99]));
    expect(policy.choose(candidates)).toBe("e2e4");
  });

  it("peut suivre une branche minoritaire quand la deviation est activee", () => {
    const policy = new BookOpponentPolicy({ temperature: 1, deviationRate: 1 }, random([0, 0.99]));
    expect(policy.choose(candidates)).toBe("d2d4");
  });

  it("reste deterministe pour une position sans popularite", () => {
    const policy = new BookOpponentPolicy({ temperature: 0.8, deviationRate: 1 }, random([0, 0.5]));
    expect(policy.choose([{ uci: "c2c4", games: 0 }, { uci: "g1f3", games: 0 }])).toBe("c2c4");
  });

  it("renforce une branche sur laquelle l'utilisateur a deja echoue", () => {
    const policy = new BookOpponentPolicy({ temperature: 0, deviationRate: 0 }, random([]));
    expect(
      policy.choose([
        { uci: "e2e4", games: 100, userBias: 0.5 },
        { uci: "d2d4", games: 20, userBias: 4 },
      ]),
    ).toBe("d2d4");
  });
});