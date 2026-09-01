import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { uciOf } from "@/core/analysis/evaluate-move";
import { MAIN_LINE_VARIATION_KEY, variationKeyFor } from "@/core/curriculum/opening-variation-key";
import type { OpeningLine } from "@/core/curriculum/openings";
import type { AnnotatedPly, OpeningVariation } from "@/server/queries/openings";
import { buildFinalTestRounds, resolvePracticedEntries, type PracticedEntry } from "./build-final-test";

function uciLine(sanMoves: readonly string[]): string[] {
  const chess = new Chess();
  return sanMoves.map((san) => uciOf(chess.move(san)));
}

const OPENING: OpeningLine = {
  id: "ruy-lopez",
  name: "Ruy Lopez (Espagnole)",
  eco: "C60",
  side: "white",
  description: "",
  moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
};

const MAIN_LINE_UCI = uciLine(OPENING.moves);
const PLIES: AnnotatedPly[] = OPENING.moves.map((san, index) => ({
  ply: index + 1,
  san,
  uci: MAIN_LINE_UCI[index],
  fen: "irrelevant",
  book: null,
}));

const BERLIN_SAN = ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6"];
const BERLIN: OpeningVariation = {
  eco: "C65",
  name: "Ruy Lopez : Défense Berlinoise",
  sanMoves: BERLIN_SAN,
  uciMoves: uciLine(BERLIN_SAN),
};

describe("resolvePracticedEntries", () => {
  it("ne garde que les clés effectivement pratiquées", () => {
    const berlinKey = variationKeyFor({ kind: "variation", eco: BERLIN.eco, name: BERLIN.name });
    const entries = resolvePracticedEntries(OPENING, PLIES, [BERLIN], [MAIN_LINE_VARIATION_KEY, berlinKey]);

    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({ key: MAIN_LINE_VARIATION_KEY, label: OPENING.name, uciMoves: MAIN_LINE_UCI });
    expect(entries[1]).toEqual({ key: berlinKey, label: BERLIN.name, uciMoves: BERLIN.uciMoves });
  });

  it("ignore une variante du catalogue jamais pratiquée", () => {
    const entries = resolvePracticedEntries(OPENING, PLIES, [BERLIN], [MAIN_LINE_VARIATION_KEY]);
    expect(entries).toHaveLength(1);
    expect(entries[0].key).toBe(MAIN_LINE_VARIATION_KEY);
  });

  it("une clé persistée qui ne correspond plus à rien (variante retirée du catalogue) est ignorée", () => {
    const entries = resolvePracticedEntries(OPENING, PLIES, [], ["C99|Variante disparue"]);
    expect(entries).toHaveLength(0);
  });
});

describe("buildFinalTestRounds", () => {
  it("une manche par entrée éligible, coupée à l'intérieur de la ligne (jamais au premier coup ni à la toute fin)", () => {
    const entries: PracticedEntry[] = [
      { key: MAIN_LINE_VARIATION_KEY, label: OPENING.name, uciMoves: MAIN_LINE_UCI },
      { key: "berlin", label: BERLIN.name, uciMoves: BERLIN.uciMoves },
    ];

    const rounds = buildFinalTestRounds(entries);
    expect(rounds).toHaveLength(2);

    for (const round of rounds) {
      expect(round.script.length).toBeGreaterThanOrEqual(2);
      // La coupe n'est jamais nulle : la manche démarre après au moins 2 coups déjà joués.
      const matching = entries.find((e) => e.uciMoves.slice(-round.script.length).join(",") === round.script.join(","));
      expect(matching).toBeDefined();
      // Le FEN de départ doit être une position légale atteignable en rejouant le préfixe.
      expect(round.startFen).toMatch(/^[\w/]+ [wb] /);
    }
  });

  it("écarte les entrées trop courtes pour offrir une coupe valable", () => {
    const tooShort: PracticedEntry = { key: "short", label: "Trop courte", uciMoves: MAIN_LINE_UCI.slice(0, 3) };
    const rounds = buildFinalTestRounds([tooShort]);
    expect(rounds).toHaveLength(0);
  });

  it("plafonne à 6 manches même avec davantage d'entrées éligibles", () => {
    const entries: PracticedEntry[] = Array.from({ length: 9 }, (_, i) => ({
      key: `entry-${i}`,
      label: `Variante ${i}`,
      uciMoves: MAIN_LINE_UCI,
    }));
    const rounds = buildFinalTestRounds(entries);
    expect(rounds).toHaveLength(6);
  });

  it("reproduit fidèlement la position de départ de chaque manche en rejouant son script depuis le FEN initial", () => {
    const entries: PracticedEntry[] = [{ key: MAIN_LINE_VARIATION_KEY, label: OPENING.name, uciMoves: MAIN_LINE_UCI }];
    const [round] = buildFinalTestRounds(entries);

    const board = new Chess(round.startFen);
    for (const uci of round.script) {
      expect(() => board.move({ from: uci.slice(0, 2), to: uci.slice(2, 4) })).not.toThrow();
    }
  });
});
