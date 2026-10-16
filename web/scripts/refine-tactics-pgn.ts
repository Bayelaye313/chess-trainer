import "server-only";

/**
 * Script de RAFFINAGE de `data/import/academy/tactics.pgn` (47 816 parties,
 * aucun tag Lichess — contrairement au CSV officiel converti par
 * `convert-lichess-puzzles-csv.ts`) — voir « Sécurisation du pipeline
 * d'importation » et « Saturation Lichess » dans `core/curriculum/catalog.ts`.
 *
 *   npm run db:refine-tactics
 *
 * ## Pourquoi ce script existe
 *
 * `tactics.pgn` n'a ni `[Module]`/`[Theme]`/`[ThemeId]` ni tag Lichess dans la
 * colonne `Themes` (il n'y a pas de colonne du tout) : `academy-parser.ts`
 * (`resolveThemeId`) ignore donc SILENCIEUSEMENT ses 47 816 parties depuis
 * toujours — aucune n'atteint jamais `curriculum_puzzles`. Ce script comble ce
 * trou en RECALCULANT les étiquettes depuis la position elle-même, avec les
 * mêmes outils déjà éprouvés du projet :
 *
 *  - `core/chess/mate-patterns.ts` (`describeMatePatterns`) reconnaît le motif
 *    de mat nommé sur la position finale — exactement l'outil qui vérifie déjà
 *    les 29 positions composées à la main de `master-puzzles-dataset.ts`.
 *  - Le nombre de coups du SOLVEUR jusqu'au mat donne la longueur
 *    (`mateIn1`..`mateIn5`) — thèmes `lichess_mate_in` de `catalog.ts`.
 *  - Les drapeaux `chess.js` de chaque coup JOUÉ PAR LE SOLVEUR (roque, prise
 *    en passant, promotion, sous-promotion) donnent les thèmes
 *    `lichess_special_moves`.
 *
 * Un motif de mat nommé, s'il est reconnu, a TOUJOURS priorité — il route vers
 * le thème CURATÉ `checkmate_patterns` (`cm-*`) correspondant (via `[ThemeId]`,
 * le plus fiable — voir `academy-parser.ts`), pour re-saturer de contenu réel
 * les 28 thèmes de mat nommé qui n'avaient jusqu'ici qu'un unique exercice de
 * démonstration. Repli sur `lichess_mate_in` (mat sans motif nommé reconnu),
 * puis sur `lichess_special_moves` (coup spécial du solveur, mat ou non),
 * jamais les deux : une partie n'alimente qu'UN SEUL thème, la doctrine déjà
 * en place dans `convert-lichess-puzzles-csv.ts` (`PRIORITY_LICHESS_TAGS`).
 *
 * ## Inversion du demi-coup — même convention que le CSV officiel
 *
 * `tactics.pgn` suit exactement la même convention que
 * `lichess_db_puzzle.csv` : `[FEN]` est la position juste AVANT le coup qui a
 * généré le puzzle, et le PREMIER coup de la ligne principale est ce coup —
 * celui du camp qui vient de se tromper, jamais une part de la solution (voir
 * `[White "solver"]`/`[Black "solver"]` : le camp qui joue en premier dans la
 * ligne n'est PRESQUE JAMAIS le solveur). Comme `toAcademyEntry` dans le
 * convertisseur CSV, ce script avance donc systématiquement d'un demi-coup
 * avant de retenir quoi que ce soit comme solution — sauf si la position de
 * départ est déjà au trait du solveur (repli défensif, jamais rencontré dans
 * le fichier réel mais pas supposé impossible).
 *
 * ## Séquence complète, jamais le dernier coup seul
 *
 * `moves` (sortie JSON, format `AcademyJsonEntry`) porte l'intégralité de la
 * suite du solveur ET les réponses adverses intercalées — la même convention
 * que partout ailleurs dans l'académie (voir `academy-parser.ts`). Rien ici
 * ne raccourcit un exercice de mat à son seul coup final : `PuzzleBoard`/
 * `usePuzzleSolver` (`client/features/board/`) rejouent déjà, de façon
 * générique, chaque pli de `solution` un par un — coup du solveur, réponse
 * adverse automatique, coup suivant — jusqu'au bout de la variante. Le risque
 * n'a jamais été dans le moteur de résolution mais dans la donnée : un
 * import qui n'aurait gardé que le mat final produirait un exercice à un seul
 * coup alors que la partie en réclame plusieurs — ce script ne le permet pas,
 * `moves` est toujours `game.mainline.slice(shift)` en entier.
 *
 * ## Sortie
 *
 * Trois fichiers, purgés/réimportés indépendamment par `db:seed-academy` (même
 * idempotence par nom de fichier que le reste du pipeline) :
 *   - `tactics-checkmate-patterns.json` — motif de mat nommé reconnu.
 *   - `tactics-mate-in.json` — mat sans motif nommé, classé par longueur.
 *   - `tactics-special-moves.json` — roque/en passant/promotion/sous-promotion
 *     joués par le solveur, hors des deux cas précédents.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Chess } from "chess.js";
import { describeMatePatterns, type MatePattern } from "@/core/chess/mate-patterns";
import { parsePgnGames, type RawPgnGame } from "@/core/curriculum/traps-parser";
import type { AcademyJsonEntry } from "@/core/curriculum/academy-parser";

const DEFAULT_START_FEN = new Chess().fen();

// ─────────────────────────────────────────────────────────────────────────
// Motif de mat nommé → thème curaté `cm-*` (checkmate_patterns, catalog.ts).
// Exhaustif sur `MATE_PATTERNS` — TypeScript refuse la compilation si un
// motif est ajouté à `mate-patterns.ts` sans être routé ici.
// ─────────────────────────────────────────────────────────────────────────
const CM_THEME_ID_BY_PATTERN: Record<MatePattern, string> = {
  back_rank: "cm-mat-du-couloir",
  ladder: "cm-mat-de-l-escalier",
  anastasia: "cm-mat-d-anastasia",
  arabian: "cm-mat-arabe",
  boden: "cm-mat-de-boden",
  damiano: "cm-mat-de-damiano",
  damiano_bishop: "cm-mat-du-fou-de-damiano",
  blackburne: "cm-mat-de-blackburne",
  epaulette: "cm-mat-de-l-epaulette",
  greco: "cm-mat-de-greco",
  hook: "cm-mat-du-crochet",
  legall: "cm-mat-de-legall",
  lolli: "cm-mat-de-lolli",
  morphy: "cm-mat-de-morphy",
  opera: "cm-mat-de-l-opera",
  pillsbury: "cm-mat-de-pillsbury",
  reti: "cm-mat-de-reti",
  smothered: "cm-mat-etouffe",
  dovetail: "cm-mat-de-la-queue-d-aronde",
  cozio: "cm-mat-de-cozio",
  vukovic: "cm-mat-de-vukovic",
  double_bishop: "cm-mat-des-deux-fous",
  box: "cm-mat-de-la-boite",
  triangle: "cm-mat-du-triangle",
  queen_rook: "cm-mat-dame-et-tour",
  two_rooks: "cm-mat-des-deux-tours",
  king_queen: "cm-mat-roi-et-dame-contre-roi",
  max_lange: "cm-mat-de-max-lange",
  net: "cm-mat-du-filet",
};

const MATE_IN_THEME_ID = ["lmi-mat-en-1", "lmi-mat-en-2", "lmi-mat-en-3", "lmi-mat-en-4", "lmi-mat-en-5-coups-et-plus"] as const;

const SPECIAL_MOVE_THEME_ID = {
  castling: "lsm-roque",
  enPassant: "lsm-prise-en-passant",
  promotion: "lsm-promotion",
  underPromotion: "lsm-sous-promotion",
} as const;

function turnOf(fen: string): "w" | "b" {
  return fen.split(" ")[1] === "b" ? "b" : "w";
}

interface RefinedEntry {
  bucket: "mate-pattern" | "mate-in" | "special-move";
  entry: AcademyJsonEntry;
}

/**
 * Rejoue une partie brute et la route vers AU PLUS un thème — même règle
 * « une seule cible, jamais d'ambiguïté » que `ThemeResolver` dans le
 * convertisseur CSV. `null` si la partie ne dit rien d'exploitable (pas de
 * camp solveur identifiable, coup illégal, ou aucun des trois critères ne
 * matche).
 */
function refineGame(game: RawPgnGame, sourceRef: string): RefinedEntry | null {
  const solverColor: "w" | "b" | null = game.tags.White === "solver" ? "w" : game.tags.Black === "solver" ? "b" : null;
  if (!solverColor) return null;

  const startFen = game.tags.FEN ?? DEFAULT_START_FEN;
  let chess: Chess;
  try {
    chess = new Chess(startFen);
  } catch {
    return null;
  }

  // Inversion du demi-coup — voir le docstring de fichier : la ligne ne
  // démarre au trait du solveur que si elle l'est déjà (repli défensif).
  const shift = turnOf(startFen) === solverColor ? 0 : 1;
  if (game.mainline.length <= shift) return null;

  if (shift === 1) {
    try {
      chess.move(game.mainline[0]);
    } catch {
      return null;
    }
  }
  const criticalFen = chess.fen();
  if (turnOf(criticalFen) !== solverColor) return null; // toujours vrai en pratique, filet de sécurité

  const solverMoves = game.mainline.slice(shift);
  if (solverMoves.length === 0) return null;

  const solutionSan: string[] = [];
  let specialTag: keyof typeof SPECIAL_MOVE_THEME_ID | null = null;
  for (let i = 0; i < solverMoves.length; i++) {
    let move: ReturnType<Chess["move"]>;
    try {
      move = chess.move(solverMoves[i]);
    } catch {
      return null;
    }
    solutionSan.push(move.san);
    // Seuls les coups DU SOLVEUR (indices pairs : 0, 2, 4… — voir la
    // convention `solution`, rangs impairs = réponses adverses) qualifient un
    // thème « coup spécial » : c'est ce que le solveur doit trouver et jouer,
    // jamais une réponse adverse rejouée automatiquement.
    if (i % 2 !== 0) continue;
    if (!specialTag && (move.flags.includes("k") || move.flags.includes("q"))) specialTag = "castling";
    if (!specialTag && move.flags.includes("e")) specialTag = "enPassant";
    if (move.flags.includes("p")) {
      if (move.promotion && move.promotion !== "q") specialTag = "underPromotion";
      else if (!specialTag) specialTag = "promotion";
    }
  }

  const finalFen = chess.fen();
  const isMate = chess.isCheckmate();

  if (isMate) {
    const patterns = describeMatePatterns(finalFen);
    const pattern = patterns[0];
    if (pattern) {
      return {
        bucket: "mate-pattern",
        entry: { themeId: CM_THEME_ID_BY_PATTERN[pattern], fen: criticalFen, moves: solutionSan, sourceRef },
      };
    }
    // Nombre de coups DU SOLVEUR jusqu'au mat (rangs pairs de `solverMoves`, 0-based) = la longueur affichée par Lichess.
    const solverPlyCount = Math.ceil(solverMoves.length / 2);
    const themeId = MATE_IN_THEME_ID[Math.min(solverPlyCount, MATE_IN_THEME_ID.length) - 1];
    return { bucket: "mate-in", entry: { themeId, fen: criticalFen, moves: solutionSan, sourceRef } };
  }

  if (specialTag) {
    return {
      bucket: "special-move",
      entry: { themeId: SPECIAL_MOVE_THEME_ID[specialTag], fen: criticalFen, moves: solutionSan, sourceRef },
    };
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────────────

interface Options {
  input: string;
  output: string;
  help?: boolean;
}

function parseArgs(argv: string[]): Options {
  const options: Options = { input: "data/import/academy/tactics.pgn", output: "data/import/academy" };
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg.startsWith("--input=")) options.input = arg.slice("--input=".length);
    else if (arg.startsWith("--output=")) options.output = arg.slice("--output=".length);
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(
      [
        "Usage: npm run db:refine-tactics -- [options]",
        "",
        "  --input=<fichier>   Fichier PGN brut à raffiner (défaut: data/import/academy/tactics.pgn)",
        "  --output=<dossier>  Dossier de sortie (défaut: data/import/academy)",
        "",
        "Recalcule motif de mat nommé / longueur de mat / coup spécial depuis la position",
        "elle-même (aucun tag Lichess dans tactics.pgn) et écrit 3 fichiers JSON prêts pour",
        "npm run db:seed-academy. 100% hors-ligne.",
      ].join("\n"),
    );
    return;
  }

  const started = Date.now();
  const text = await readFile(options.input, "utf8");
  const games = parsePgnGames(text);

  const buckets: Record<RefinedEntry["bucket"], AcademyJsonEntry[]> = {
    "mate-pattern": [],
    "mate-in": [],
    "special-move": [],
  };
  let unmatched = 0;

  games.forEach((game, index) => {
    const sourceRef = `tactics.pgn #${game.tags.Event ?? index}`;
    const refined = refineGame(game, sourceRef);
    if (!refined) {
      unmatched += 1;
      return;
    }
    buckets[refined.bucket].push(refined.entry);
  });

  await mkdir(options.output, { recursive: true });
  const outputs: [RefinedEntry["bucket"], string][] = [
    ["mate-pattern", "tactics-checkmate-patterns.json"],
    ["mate-in", "tactics-mate-in.json"],
    ["special-move", "tactics-special-moves.json"],
  ];
  let totalWritten = 0;
  for (const [bucket, filename] of outputs) {
    const entries = buckets[bucket];
    entries.sort((a, b) => (a.themeId ?? "").localeCompare(b.themeId ?? ""));
    const outPath = join(options.output, filename);
    await writeFile(outPath, JSON.stringify(entries, null, 2) + "\n", "utf8");
    console.log(`  ${filename} — ${entries.length} exercice(s)`);
    totalWritten += entries.length;
  }

  console.log(
    `\n${games.length} partie(s) lues, ${unmatched} non exploitables, ${totalWritten} exercice(s) écrit(s).`,
  );
  console.log(`Terminé en ${((Date.now() - started) / 1000).toFixed(1)} s. Lancez maintenant : npm run db:seed-academy`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .then(() => process.exit(0))
    .catch((cause) => {
      console.error(cause);
      process.exit(1);
    });
}
