import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { alternativesFor } from "./puzzle-alternatives";
import table from "./puzzle-alternatives.json";

const entries = Object.entries(table as Record<string, Record<string, string[]>>);
const uciOf = (m: { from: string; to: string; promotion?: string }) => m.from + m.to + (m.promotion ?? "");

describe("puzzle-alternatives.json", () => {
  it("n'est pas vide", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it("chaque alternative est un coup légal du joueur, au bon pli, distinct de la solution", () => {
    for (const [key, byPly] of entries) {
      const [fen, sol] = key.split("|");
      const solution = sol.split(" ");
      const chess = new Chess(fen);
      solution.forEach((uci, i) => {
        const alts = byPly[String(i)];
        if (alts) {
          expect(i % 2, `${key} : alternative sur un pli adverse`).toBe(0);
          const legal = new Set(chess.moves({ verbose: true }).map(uciOf));
          for (const alt of alts) {
            expect(legal.has(alt), `${key} pli ${i} : ${alt} illégal`).toBe(true);
            expect(alt).not.toBe(uci);
          }
        }
        chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
      });
    }
  }, 60_000);
});

describe("alternativesFor", () => {
  it("aligne les alternatives sur la solution, [] pour les plis sans alternative", () => {
    const [key, byPly] = entries[0];
    const [fen, sol] = key.split("|");
    const solution = sol.split(" ");
    const aligned = alternativesFor(fen, solution);
    expect(aligned).toHaveLength(solution.length);
    for (const [ply, alts] of Object.entries(byPly)) expect(aligned?.[Number(ply)]).toEqual(alts);
  });

  it("undefined pour un puzzle inconnu", () => {
    expect(alternativesFor("8/8/8/8/8/8/8/K6k w - - 0 1", ["a1a2"])).toBeUndefined();
  });
});
