import { describe, expect, it } from "vitest";
import { goCommand, parseBestMove, parseInfoLine } from "./uci";

describe("parseInfoLine", () => {
  it("lit profondeur, score et variante", () => {
    const info = parseInfoLine(
      "info depth 14 seldepth 20 multipv 1 score cp 24 nodes 1200 nps 60000 pv e2e4 e7e5 g1f3",
    );
    expect(info).toEqual({
      depth: 14,
      multipv: 1,
      nodes: 1200,
      nps: 60000,
      scoreCp: 24,
      pv: ["e2e4", "e7e5", "g1f3"],
    });
  });

  it("lit un score de mat négatif", () => {
    const info = parseInfoLine("info depth 5 score mate -3 pv e1e2");
    expect(info?.scoreMate).toBe(-3);
    expect(info?.scoreCp).toBeUndefined();
  });

  it("ignore les lignes sans donnée exploitable", () => {
    expect(parseInfoLine("info string NNUE evaluation using nn-9067e33176e")).toBeNull();
    expect(parseInfoLine("info currmove e2e4 currmovenumber 1")).toBeNull();
    expect(parseInfoLine("bestmove e2e4")).toBeNull();
  });
});

describe("parseBestMove", () => {
  it("extrait le coup", () => {
    expect(parseBestMove("bestmove e2e4 ponder e7e5")).toEqual({ bestMove: "e2e4" });
  });

  it("gère l'absence de coup", () => {
    expect(parseBestMove("bestmove (none)")).toEqual({ bestMove: null });
    expect(parseBestMove("bestmove 0000")).toEqual({ bestMove: null });
  });

  it("renvoie null si ce n'est pas une ligne bestmove", () => {
    expect(parseBestMove("info depth 3")).toBeNull();
  });
});

describe("goCommand", () => {
  it("traduit une limite de profondeur", () => {
    expect(goCommand({ depth: 16 })).toBe("go depth 16");
  });

  it("traduit une limite de temps", () => {
    expect(goCommand({ movetimeMs: 600 })).toBe("go movetime 600");
  });

  it("applique une profondeur par défaut plutôt qu'une recherche infinie", () => {
    expect(goCommand({})).toBe("go depth 12");
  });
});
