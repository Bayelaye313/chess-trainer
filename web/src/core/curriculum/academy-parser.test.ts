import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { parsePgnGames } from "./traps-parser";
import { buildAcademyPuzzleFromGame, buildAcademyPuzzleFromJsonEntry, resolveThemeId } from "./academy-parser";

const ANASTASIA_PGN = `[Event "Mat d'Anastasia"]
[Module "Checkmate Patterns"]
[Theme "Mat d'Anastasia"]
[Author "MI Jesper Hall"]
[Difficulty "intermediate"]
[FEN "7k/6p1/5N2/R7/8/8/6K1/8 w - - 0 1"]

1. Rh5# *`;

const UNKNOWN_THEME_PGN = `[Event "Un thème qui n'existe pas"]
[Module "Checkmate Patterns"]
[Theme "Mat de Nulle Part"]

1. e4 e5 *`;

const ILLEGAL_MOVE_PGN = `[Event "Mat cassé"]
[Module "Checkmate Patterns"]
[Theme "Mat d'Anastasia"]
[FEN "7k/6p1/5N2/R7/8/8/6K1/8 w - - 0 1"]

1. Zz9# *`;

const NO_FEN_MODULE_ID_PGN = `[Event "Mat de Legall démo"]
[Module "checkmate_patterns"]
[ThemeId "cm-mat-de-legall"]

1. e4 e5 2. Bc4 d6 3. Nf3 Bg4 4. Nc3 g6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5# *`;

describe("resolveThemeId", () => {
  it("résout via themeId direct s'il existe dans le catalogue", () => {
    expect(resolveThemeId({ themeId: "cm-mat-d-anastasia" })).toBe("cm-mat-d-anastasia");
  });

  it("renvoie null pour un themeId qui n'existe pas dans le catalogue", () => {
    expect(resolveThemeId({ themeId: "cm-nexiste-pas" })).toBeNull();
  });

  it("résout via module + titre exact, insensible à la casse et aux accents", () => {
    expect(resolveThemeId({ module: "checkmate patterns", theme: "mat d'anastasia" })).toBe("cm-mat-d-anastasia");
  });

  it("accepte l'id de catégorie comme alias du module", () => {
    expect(resolveThemeId({ module: "checkmate_patterns", theme: "Mat d'Anastasia" })).toBe("cm-mat-d-anastasia");
  });

  it("renvoie null si le module est inconnu", () => {
    expect(resolveThemeId({ module: "Module Fantôme", theme: "Mat d'Anastasia" })).toBeNull();
  });

  it("renvoie null si le titre ne correspond à aucun thème du module", () => {
    expect(resolveThemeId({ module: "Checkmate Patterns", theme: "Mat de Nulle Part" })).toBeNull();
  });
});

describe("buildAcademyPuzzleFromGame", () => {
  it("construit un exercice valide depuis une partie taguée", () => {
    const [game] = parsePgnGames(ANASTASIA_PGN);
    const puzzle = buildAcademyPuzzleFromGame(game, { idPrefix: "checkmate-patterns.pgn" });
    expect(puzzle).not.toBeNull();
    expect(puzzle!.themeId).toBe("cm-mat-d-anastasia");
    expect(puzzle!.fen).toBe("7k/6p1/5N2/R7/8/8/6K1/8 w - - 0 1");
    expect(puzzle!.solutionSan).toEqual(["Rh5#"]);
    expect(puzzle!.solution).toEqual(["a5h5"]);
    expect(puzzle!.sourceRef).toBe("MI Jesper Hall — intermediate");

    // La solution doit réellement mener au mat annoncé — jamais un exercice orphelin de sa propre prétention.
    const board = new Chess(puzzle!.fen);
    for (const uci of puzzle!.solution) {
      board.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.slice(4, 5) || undefined });
    }
    expect(board.isCheckmate()).toBe(true);
  });

  it("résout module par id de catégorie + ThemeId, et retombe sur la position de départ standard si [FEN] absent", () => {
    const [game] = parsePgnGames(NO_FEN_MODULE_ID_PGN);
    const puzzle = buildAcademyPuzzleFromGame(game, { idPrefix: "legall.pgn" });
    expect(puzzle).not.toBeNull();
    expect(puzzle!.themeId).toBe("cm-mat-de-legall");
    expect(puzzle!.fen).toBe(new Chess().fen());
    expect(puzzle!.solutionSan.at(-1)).toBe("Nd5#");
  });

  /**
   * Non-régression directe du bug signalé : un exercice de mat en PLUSIEURS
   * coups doit garder TOUTE la ligne (réponses adverses comprises) dans
   * `solution`, jamais seulement le coup de mat final — c'est cette suite
   * complète que `usePuzzleSolver`/`PuzzleBoard`
   * (`client/features/board/use-puzzle-solver.ts`) rejoue ensuite un pli à la
   * fois : coup du solveur, réponse adverse automatique, coup suivant…
   * jusqu'au mat. `NO_FEN_MODULE_ID_PGN` compte 13 demi-coups (7 blancs, 6
   * noirs) avant `Nd5#`.
   */
  it("garde l'intégralité de la séquence d'un mat en plusieurs coups, pas seulement le coup de mat final", () => {
    const [game] = parsePgnGames(NO_FEN_MODULE_ID_PGN);
    const puzzle = buildAcademyPuzzleFromGame(game, { idPrefix: "legall.pgn" });
    expect(puzzle).not.toBeNull();
    expect(puzzle!.solutionSan).toEqual(["e4", "e5", "Bc4", "d6", "Nf3", "Bg4", "Nc3", "g6", "Nxe5", "Bxd1", "Bxf7+", "Ke7", "Nd5#"]);
    expect(puzzle!.solution).toHaveLength(13);
  });

  it("renvoie null si aucun thème du catalogue ne correspond à Module+Theme", () => {
    const [game] = parsePgnGames(UNKNOWN_THEME_PGN);
    expect(buildAcademyPuzzleFromGame(game, { idPrefix: "test.pgn" })).toBeNull();
  });

  it("renvoie null si un coup de la ligne est illégal", () => {
    const [game] = parsePgnGames(ILLEGAL_MOVE_PGN);
    expect(buildAcademyPuzzleFromGame(game, { idPrefix: "test.pgn" })).toBeNull();
  });
});

describe("buildAcademyPuzzleFromJsonEntry", () => {
  it("construit un exercice valide depuis une entrée JSON", () => {
    const puzzle = buildAcademyPuzzleFromJsonEntry(
      {
        themeId: "cm-mat-d-anastasia",
        fen: "7k/6p1/5N2/R7/8/8/6K1/8 w - - 0 1",
        moves: ["Rh5#"],
        author: "MI Jesper Hall",
      },
      { idPrefix: "checkmate-patterns.json" },
    );
    expect(puzzle).not.toBeNull();
    expect(puzzle!.themeId).toBe("cm-mat-d-anastasia");
    expect(puzzle!.solution).toEqual(["a5h5"]);
    expect(puzzle!.sourceRef).toBe("MI Jesper Hall");
  });

  it("renvoie null pour une liste de coups vide", () => {
    const puzzle = buildAcademyPuzzleFromJsonEntry(
      { themeId: "cm-mat-d-anastasia", moves: [] },
      { idPrefix: "test.json" },
    );
    expect(puzzle).toBeNull();
  });

  it("renvoie null si le thème ne résout à rien", () => {
    const puzzle = buildAcademyPuzzleFromJsonEntry(
      { module: "Module Fantôme", theme: "Rien", moves: ["e4"] },
      { idPrefix: "test.json" },
    );
    expect(puzzle).toBeNull();
  });
});
