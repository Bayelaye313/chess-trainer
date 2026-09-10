import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { uciSequenceToSan } from "@/core/chess/replay";
import { describeMatePatterns, type MatePattern } from "@/core/chess/mate-patterns";
import { CURRICULUM_THEMES } from "./catalog";
import { MASTER_PUZZLES_DATASET } from "./master-puzzles-dataset";

/**
 * Thèmes de mat nommé (`cm-*`) → le motif que `mate-patterns.ts` doit
 * RECALCULER sur la position finale. Filet de non-régression : une position
 * composée à la main pour "Mat de Boden" doit rester, coup après coup, un
 * vrai mat de Boden — jamais un mat générique déguisé en mat nommé.
 * `cm-mat-du-moulin` en est absent : ce thème repose sur `tactical-signals.ts`
 * (`windmill`), pas sur un `MatePattern`.
 */
const EXPECTED_MATE_PATTERN: Record<string, MatePattern> = {
  "cm-mat-du-couloir": "back_rank",
  "cm-mat-de-l-escalier": "ladder",
  "cm-mat-d-anastasia": "anastasia",
  "cm-mat-arabe": "arabian",
  "cm-mat-de-boden": "boden",
  "cm-mat-de-damiano": "damiano",
  "cm-mat-de-blackburne": "blackburne",
  "cm-mat-de-l-epaulette": "epaulette",
  "cm-mat-de-greco": "greco",
  "cm-mat-du-crochet": "hook",
  "cm-mat-de-legall": "legall",
  "cm-mat-de-lolli": "lolli",
  "cm-mat-de-morphy": "morphy",
  "cm-mat-de-l-opera": "opera",
  "cm-mat-de-pillsbury": "pillsbury",
  "cm-mat-de-reti": "reti",
  "cm-mat-etouffe": "smothered",
  "cm-mat-de-la-queue-d-aronde": "dovetail",
  "cm-mat-de-vukovic": "vukovic",
  "cm-mat-des-deux-fous": "double_bishop",
  "cm-mat-de-la-boite": "box",
  "cm-mat-du-triangle": "triangle",
  "cm-mat-dame-et-tour": "queen_rook",
  "cm-mat-des-deux-tours": "two_rooks",
  "cm-mat-roi-et-dame-contre-roi": "king_queen",
  "cm-mat-de-cozio": "cozio",
  "cm-mat-du-fou-de-damiano": "damiano_bishop",
  "cm-mat-de-max-lange": "max_lange",
  "cm-mat-du-filet": "net",
};

/**
 * Les 6 catégories `lichess_*` (`catalog.ts`, « Saturation Lichess ») sont des
 * réservoirs purs alimentés par le pipeline d'import, jamais par ce dataset
 * statique — voir leur docstring. La bijection stricte ci-dessous ne porte
 * donc que sur les 161 thèmes curatés (144 d'origine + les 9 `pawn_structures`
 * + le thème `pawn_weaknesses` + les 7 `middlegame`).
 */
const LICHESS_TAG_CATEGORIES = new Set([
  "lichess_motifs",
  "lichess_advanced",
  "lichess_mate_in",
  "lichess_mate_themes",
  "lichess_special_moves",
  "lichess_goals_origin",
]);
const CURATED_THEME_IDS = new Set(
  CURRICULUM_THEMES.filter((t) => !LICHESS_TAG_CATEGORIES.has(t.category)).map((t) => t.id),
);

describe("MASTER_PUZZLES_DATASET", () => {
  it("couvre les 161 thèmes CURATÉS du catalogue, au moins une entrée chacun", () => {
    // Depuis le 2026-09-10, `themeId` n'est plus forcément unique dans le
    // tableau : `pm-le-mauvais-fou` et `pm-l-avant-poste-du-cavalier` portent
    // chacun 8 entrées (une vague de puzzles, voir le docstring d'en-tête)
    // plutôt qu'1 — la COUVERTURE (chaque thème curaté représenté) reste
    // l'invariant, pas la longueur ligne-à-ligne.
    const datasetIds = new Set(MASTER_PUZZLES_DATASET.map((p) => p.themeId));
    expect(datasetIds.size).toBe(161);
    for (const id of CURATED_THEME_IDS) expect(datasetIds.has(id)).toBe(true);
    for (const id of datasetIds) expect(CURATED_THEME_IDS.has(id)).toBe(true);
  });

  it("247 entrées au total — 154 thèmes à 1 exercice + 7 vagues (2 de 8, 4 de 15, 1 de 17)", () => {
    // Vagues 2026-09-10 : `pm-le-mauvais-fou`/`pm-l-avant-poste-du-cavalier`
    // (8 chacun, voir plus haut) puis un 2e lot de 5 thèmes convertis « au
    // format Lichess » (tutoriel + vague de puzzles) — `pm-la-tour-a-la-7e-rangee`,
    // `pm-la-securite-du-roi-en-milieu-de-partie`, `pm-la-centralisation-des-pieces`
    // et `pm-la-paire-de-fous` (15 chacun), `pm-la-chaine-de-pions` (17, une
    // partie source plus riche en points de décision réels).
    expect(MASTER_PUZZLES_DATASET).toHaveLength(247);
    const expectedWaveSize: Record<string, number> = {
      "pm-le-mauvais-fou": 8,
      "pm-l-avant-poste-du-cavalier": 8,
      "pm-la-tour-a-la-7e-rangee": 15,
      "pm-la-securite-du-roi-en-milieu-de-partie": 15,
      "pm-la-centralisation-des-pieces": 15,
      "pm-la-chaine-de-pions": 17,
      "pm-la-paire-de-fous": 15,
    };
    for (const [themeId, size] of Object.entries(expectedWaveSize)) {
      const wave = MASTER_PUZZLES_DATASET.filter((p) => p.themeId === themeId);
      expect(wave, themeId).toHaveLength(size);
    }
  });

  it("n'a AUCUNE entrée pour les 56 thèmes `lichess_*` — réservoirs purs, alimentés seulement par le pipeline d'import", () => {
    const datasetIds = new Set(MASTER_PUZZLES_DATASET.map((p) => p.themeId));
    const lichessTagThemeIds = CURRICULUM_THEMES.filter((t) => LICHESS_TAG_CATEGORIES.has(t.category)).map((t) => t.id);
    // 58 tags Lichess officiels, mais 56 thèmes : 2 doublons volontairement
    // fusionnés (queue d'aronde/d'hirondelle, capture/élimination du
    // défenseur — voir catalog.ts, « Saturation Lichess »).
    expect(lichessTagThemeIds.length).toBe(56);
    for (const id of lichessTagThemeIds) expect(datasetIds.has(id)).toBe(false);
  });

  it("n'a aucune FEN dupliquée — 161 positions distinctes, pas de rotation d'une même base", () => {
    const fens = MASTER_PUZZLES_DATASET.map((p) => p.fen);
    expect(new Set(fens).size).toBe(fens.length);
  });

  it.each(MASTER_PUZZLES_DATASET.map((p) => [p.themeId, p] as const))(
    "%s : FEN légale, solution intégralement rejouable, solutionSan cohérent",
    (_themeId, puzzle) => {
      expect(() => new Chess(puzzle.fen)).not.toThrow();
      expect(puzzle.solution.length).toBeGreaterThanOrEqual(1);
      const sans = uciSequenceToSan(puzzle.fen, puzzle.solution);
      expect(sans).toEqual(puzzle.solutionSan);
    },
  );

  it.each(Object.entries(EXPECTED_MATE_PATTERN))(
    "%s : la position finale est un vrai mat, et RECONNUE comme %s par mate-patterns.ts",
    (themeId, pattern) => {
      const puzzle = MASTER_PUZZLES_DATASET.find((p) => p.themeId === themeId);
      expect(puzzle, `${themeId} absent du dataset`).toBeDefined();
      const board = new Chess(puzzle!.fen);
      for (const uci of puzzle!.solution) {
        board.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.slice(4, 5) || undefined });
      }
      expect(board.isCheckmate(), `${themeId} : la solution ne mate pas`).toBe(true);
      expect(describeMatePatterns(board.fen())).toContain(pattern);
    },
  );
});
