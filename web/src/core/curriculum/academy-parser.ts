/**
 * Parseur pour l'ingestion de masse de l'Académie « Apprendre »
 * (`scripts/seed-academy.ts`) — lit un exercice académique déjà tagué (PGN
 * via `parsePgnGames`, voir `traps-parser.ts`, ou JSON structuré) et le
 * transforme en une ligne prête pour `curriculum_puzzles`. Module pur, aucune
 * dépendance serveur — testé indépendamment du script et de la DB (voir
 * `academy-parser.test.ts`), même schéma que `traps-parser.ts`.
 *
 * ## Convention « exercice académique »
 *
 * Contrairement à un piège (`traps-parser.ts`), un exercice de cours n'a pas
 * de variation RAV à interpréter : c'est une position de départ (`[FEN]`,
 * repli sur la position initiale si absent) suivie de la suite CORRECTE à
 * jouer, coups adverses inclus aux rangs impairs — exactement la convention
 * de `curriculum_puzzles.solution` (voir son docstring dans
 * `server/db/schema/curriculum.ts`) et de `MASTER_PUZZLES_DATASET`
 * (`master-puzzles-dataset.ts`).
 *
 * ## Mat en plusieurs coups : toute la séquence, jamais le dernier coup seul
 *
 * `replaySolution` (plus bas) rejoue et retient l'INTÉGRALITÉ de `mainline`/
 * `moves` — réponses adverses comprises aux rangs impairs, jusqu'au dernier
 * pli fourni. Pour un exercice de mat en 2/3/4 coups, ça veut dire que
 * `solution`/`solutionSan` porte bien tous les coups du solveur ET toutes les
 * réponses adverses intercalées, jamais seulement le coup de mat final —
 * c'est cette suite complète que `usePuzzleSolver`/`PuzzleBoard`
 * (`client/features/board/use-puzzle-solver.ts`) rejoue ensuite un pli à la
 * fois (coup du solveur → réponse adverse automatique → coup suivant…)
 * jusqu'au mat, voir `academy-parser.test.ts` pour la non-régression. Le seul
 * endroit où ça pouvait mal tourner était donc en AMONT, à l'ingestion : voir
 * `scripts/refine-tactics-pgn.ts`, qui garde lui aussi `game.mainline.slice(shift)`
 * en entier plutôt que le seul coup de mat.
 *
 * Le thème parent n'est jamais inventé : `resolveThemeId` ne rattache un
 * exercice qu'à un thème qui existe DÉJÀ dans `CURRICULUM_THEMES`
 * (`catalog.ts`, les 141 thèmes du catalogue) — soit par un `[ThemeId]`
 * explicite (le plus fiable, id direct du catalogue), soit par la paire
 * Module + Thème (labels humains, résolus par correspondance exacte de
 * titre, insensible à la casse/aux accents). Aucune correspondance trouvée =
 * `null`, jamais un exercice orphelin ou mal classé.
 */
import { Chess } from "chess.js";
import { CURRICULUM_CATEGORIES, CURRICULUM_THEMES } from "./catalog";
import type { CurriculumCategory } from "@/server/db/schema/curriculum";
import type { RawPgnGame } from "./traps-parser";

function normalizeKey(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Alias reconnus pour désigner un module : son label affiché ("Checkmate Patterns") OU son id de catalogue ("checkmate_patterns"), indifféremment. */
const CATEGORY_ID_BY_ALIAS = new Map<string, CurriculumCategory>();
for (const category of CURRICULUM_CATEGORIES) {
  CATEGORY_ID_BY_ALIAS.set(normalizeKey(category.label), category.id);
  CATEGORY_ID_BY_ALIAS.set(normalizeKey(category.id), category.id);
}

const THEME_IDS = new Set(CURRICULUM_THEMES.map((theme) => theme.id));
const THEME_ID_BY_CATEGORY_AND_TITLE = new Map<string, string>(
  CURRICULUM_THEMES.map((theme) => [`${theme.category}::${normalizeKey(theme.title)}`, theme.id]),
);

export interface ThemeIdentifiers {
  /** Id direct du catalogue (`catalog.ts`, ex. `"cm-mat-d-anastasia"`) — prioritaire sur `module`/`theme` s'il est présent. */
  themeId?: string;
  /** Label du module (ex. `"Checkmate Patterns"`) ou son id (`"checkmate_patterns"`). */
  module?: string;
  /** Titre exact du thème au sein de ce module (ex. `"Mat d'Anastasia"`). */
  theme?: string;
}

/** `null` si aucun thème du catalogue ne correspond — jamais un id inventé. */
export function resolveThemeId(input: ThemeIdentifiers): string | null {
  if (input.themeId) return THEME_IDS.has(input.themeId) ? input.themeId : null;
  if (!input.module || !input.theme) return null;
  const categoryId = CATEGORY_ID_BY_ALIAS.get(normalizeKey(input.module));
  if (!categoryId) return null;
  return THEME_ID_BY_CATEGORY_AND_TITLE.get(`${categoryId}::${normalizeKey(input.theme)}`) ?? null;
}

export interface AcademyPuzzleDraft {
  id: string;
  themeId: string;
  fen: string;
  /** Suite complète en UCI, coups adverses inclus aux rangs impairs. */
  solution: string[];
  solutionSan: string[];
  sourceRef: string | null;
  /**
   * Métadonnées optionnelles utilisées UNIQUEMENT par le filtre qualité de
   * `scripts/seed-academy.ts` (voir `QUALITY_FILTERED_THEME_IDS`,
   * `catalog.ts`) pour départager les puzzles d'un thème saturé — jamais
   * consommées par le solveur lui-même. `undefined` pour tout exercice écrit
   * à la main (PGN/JSON curatés) ou recalculé depuis `tactics.pgn`, qui n'ont
   * ni Elo ni tag Lichess d'origine.
   */
  rating?: number;
  sacrifice?: boolean;
}

export interface BuildAcademyPuzzleOptions {
  /** Utilisé pour préfixer un id stable et lisible — typiquement le nom du fichier source. */
  idPrefix: string;
}

const DEFAULT_START_FEN = new Chess().fen();

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Hash court et stable (djb2) — désambiguïse deux exercices qui produiraient le même préfixe d'id, sans dépendance externe. */
function shortHash(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) >>> 0;
  return hash.toString(36).slice(0, 6);
}

/**
 * Rejoue `sanMoves` depuis `startFen` et renvoie la solution en UCI ET en
 * SAN — `null` au premier coup illégal (FEN invalide comprise), jamais un
 * exercice à moitié rejouable inséré en base.
 */
function replaySolution(startFen: string, sanMoves: readonly string[]): { solution: string[]; solutionSan: string[] } | null {
  if (sanMoves.length === 0) return null;
  let chess: Chess;
  try {
    chess = new Chess(startFen);
  } catch {
    return null;
  }
  const solution: string[] = [];
  const solutionSan: string[] = [];
  for (const san of sanMoves) {
    let move: ReturnType<Chess["move"]>;
    try {
      move = chess.move(san);
    } catch {
      return null;
    }
    solution.push(`${move.from}${move.to}${move.promotion ?? ""}`);
    solutionSan.push(move.san);
  }
  return { solution, solutionSan };
}

/** Combine auteur/difficulté en une référence lisible faute de `[SourceRef]`/`sourceRef` explicite — `null` si rien de tout ça n'est fourni. */
function buildSourceRef(explicit: string | undefined, author: string | undefined, difficulty: string | undefined): string | null {
  if (explicit && explicit.trim()) return explicit.trim();
  const parts = [author, difficulty].filter((part): part is string => Boolean(part && part.trim()));
  return parts.length > 0 ? parts.join(" — ") : null;
}

/**
 * Construit un exercice depuis une partie PGN déjà parsée (`parsePgnGames`) —
 * `null` si aucun thème du catalogue ne correspond (`resolveThemeId`), ou si
 * le moindre coup de la ligne principale est illégal depuis `[FEN]` (ou la
 * position initiale si absente).
 *
 * Tags reconnus : `[ThemeId]` (le plus fiable), `[Module]`/`[Theme]` (labels
 * humains, repli sur `[Site]`/`[Event]` — mêmes noms de tags que
 * `traps-parser.ts` pour rester familier), `[FEN]`, `[Author]`,
 * `[Difficulty]`, `[SourceRef]`.
 */
export function buildAcademyPuzzleFromGame(game: RawPgnGame, options: BuildAcademyPuzzleOptions): AcademyPuzzleDraft | null {
  const tags = game.tags;
  const themeId = resolveThemeId({ themeId: tags.ThemeId, module: tags.Module ?? tags.Site, theme: tags.Theme ?? tags.Event });
  if (!themeId) return null;

  const fen = tags.FEN ?? DEFAULT_START_FEN;
  const replayed = replaySolution(fen, game.mainline);
  if (!replayed) return null;

  const id = `${slugify(options.idPrefix)}-${slugify(themeId)}-${shortHash(JSON.stringify(game))}`;
  return {
    id,
    themeId,
    fen,
    solution: replayed.solution,
    solutionSan: replayed.solutionSan,
    sourceRef: buildSourceRef(tags.SourceRef, tags.Author, tags.Difficulty),
  };
}

/** Une entrée d'un fichier `data/import/academy/*.json` — voir `data/import/README.md` pour le format complet. */
export interface AcademyJsonEntry {
  themeId?: string;
  module?: string;
  theme?: string;
  fen?: string;
  /** Suite correcte en SAN, coups adverses inclus aux rangs impairs — même convention que le PGN. */
  moves: string[];
  author?: string;
  difficulty?: string;
  sourceRef?: string;
  /** Elo du puzzle d'origine (Lichess) — voir `AcademyPuzzleDraft.rating`, absent pour tout contenu curated/tactics.pgn. */
  rating?: number;
  /** Le puzzle d'origine porte le tag Lichess `sacrifice` — voir `AcademyPuzzleDraft.sacrifice`. */
  sacrifice?: boolean;
}

/** Variante JSON de `buildAcademyPuzzleFromGame` — mêmes règles de résolution de thème et de légalité chess.js. */
export function buildAcademyPuzzleFromJsonEntry(entry: AcademyJsonEntry, options: BuildAcademyPuzzleOptions): AcademyPuzzleDraft | null {
  const themeId = resolveThemeId({ themeId: entry.themeId, module: entry.module, theme: entry.theme });
  if (!themeId) return null;
  if (!Array.isArray(entry.moves)) return null;

  const fen = entry.fen ?? DEFAULT_START_FEN;
  const replayed = replaySolution(fen, entry.moves);
  if (!replayed) return null;

  const id = `${slugify(options.idPrefix)}-${slugify(themeId)}-${shortHash(JSON.stringify(entry))}`;
  return {
    id,
    themeId,
    fen,
    solution: replayed.solution,
    solutionSan: replayed.solutionSan,
    sourceRef: buildSourceRef(entry.sourceRef, entry.author, entry.difficulty),
    rating: entry.rating,
    sacrifice: entry.sacrifice,
  };
}
