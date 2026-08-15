import { describe, expect, it } from "vitest";
import { extractLichessId, splitPgnGames } from "./pgn";

const GAME_A = '[Event "Rated Blitz game"]\n[Site "https://lichess.org/abcd1234"]\n\n1. e4 e5 *';
const GAME_B = '[Event "Rated Blitz game"]\n[Site "https://lichess.org/wxyz9876"]\n\n1. d4 d5 *';

describe("splitPgnGames", () => {
  it("sépare deux parties concaténées", () => {
    expect(splitPgnGames(`${GAME_A}\n\n${GAME_B}`)).toEqual([GAME_A, GAME_B]);
  });

  it("renvoie une seule partie telle quelle", () => {
    expect(splitPgnGames(GAME_A)).toEqual([GAME_A]);
  });

  it("renvoie un tableau vide pour un flux vide", () => {
    expect(splitPgnGames("")).toEqual([]);
    expect(splitPgnGames("   \n  ")).toEqual([]);
  });
});

describe("extractLichessId", () => {
  it("extrait l'identifiant depuis l'en-tête Site", () => {
    expect(extractLichessId(GAME_A)).toBe("abcd1234");
  });

  it("renvoie null sans en-tête Site reconnu", () => {
    expect(extractLichessId('[Event "test"]\n\n1. e4 *')).toBeNull();
  });
});
