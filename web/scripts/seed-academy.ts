import "server-only";

/**
 * Ingestion en masse de l'Académie « Apprendre », 100% hors-ligne — lit tous
 * les fichiers `data/import/academy/*.pgn` et `*.json`, rattache chaque
 * exercice à l'un des 141 thèmes du catalogue (`core/curriculum/catalog.ts`),
 * valide sa légalité avec `chess.js` (`core/curriculum/academy-parser.ts`), et
 * bulk-insère le résultat dans `curriculum_puzzles`
 * (`server/db/schema/curriculum.ts`). Même patron que `seed-from-pgn.ts` pour
 * `/ouvertures` et `/pieges` — aucun appel réseau, aucune dépendance à un
 * service de cours distant.
 *
 * Un exercice dont le thème ne résout à rien dans le catalogue, ou dont le
 * moindre coup est illégal depuis sa position de départ, est IGNORÉ avec un
 * avertissement — jamais inséré à moitié fiable.
 *
 * ## Filtre qualité — thèmes tactiques et motifs de mat
 *
 * Avant insertion, TOUS les fichiers du run sont d'abord parsés puis regroupés
 * PAR THÈME (pas fichier par fichier — un thème comme `cm-mat-du-couloir` est
 * souvent alimenté à la fois par `tactics-checkmate-patterns.json` ET
 * `checkmate-patterns-lichess.json`, le plafond doit voir les deux sources à
 * la fois). Pour tout thème de `QUALITY_FILTERED_THEME_IDS` (`catalog.ts` —
 * checkmate_patterns, tactical_motifs, lichess_motifs, lichess_advanced,
 * lichess_mate_themes, lichess_mate_in, sauf "Mat en 1") : un exercice à un
 * seul pli (`draft.solutionSan.length === 1`) est écarté, puis le reste est
 * plafonné à `QUALITY_FILTER_MAX_PUZZLES` (50) en gardant en priorité les
 * exercices tagués `sacrifice`, puis à Elo décroissant (voir
 * `qualityPriorityScore`) — un exercice sans ces métadonnées (PGN écrit à la
 * main, ou recalculé depuis `tactics.pgn`, voir `academy-parser.ts`) est
 * neutre (Elo 0, non-sacrifice), donc conservé par défaut tant que le thème
 * ne déborde pas. Cette vue globale par thème suppose un run COMPLET
 * (`--only` ne voit que le(s) fichier(s) demandé(s), voir plus bas).
 *
 * Le plafond de 50 est un total, pas seulement un plafond sur les drafts de
 * CE run : certains thèmes curatés (`checkmate_patterns`/`tactical_motifs`)
 * portent un exercice de démonstration semé une fois pour toutes par
 * `ensureCurriculumSeeded`/`buildDemoCurriculumPuzzleRows`
 * (`sourceFile: null`, jamais purgé par `purgeAcademyFile`, qui ne cible que
 * les fichiers de `data/import/academy/`). `countExistingByTheme` mesure ce
 * résidu APRÈS la purge de phase 1 (donc uniquement ce qui va vraiment
 * survivre) et réduit d'autant le budget de ce run pour ces thèmes — sans ça,
 * un thème qui reçoit ses 50 exercices plafonnés PLUS 1 démo fixe afficherait
 * 51, en violation du plafond strict demandé.
 *
 * Idempotent d'un run COMPLET à l'autre, pas seulement fichier par fichier —
 * point important, une régression passée ici gonflait silencieusement
 * `totalPuzzles` à chaque relance du script (voir plus bas). Le run se fait
 * en DEUX PHASES strictement séparées : (1) purge de TOUS les fichiers
 * traités (`sourceFile` = leur nom, colonne indexée), puis seulement (2)
 * réinsertion de tous. Un thème alimenté par plusieurs fichiers (ex.
 * `checkmate-patterns.pgn` + `checkmate-patterns-lichess.json`) voit ainsi
 * TOUJOURS le même état final après un run complet, quel que soit le nombre
 * de fois qu'on le relance — sans cette séparation stricte, purger puis
 * réinsérer fichier par fichier fait lire à chaque fichier un
 * `max(orderIndex)` qui inclut les lignes PAS ENCORE repurgées des autres
 * fichiers du même run, et cet `orderIndex` grimpe un peu plus à chaque
 * relance complète du script — jusqu'à ce que `totalPuzzles` (recalculé
 * dessus) affiche des centaines d'exercices "annoncés" pour un thème qui
 * n'en contient réellement qu'une poignée, plafonnant sa progression sous
 * 100% pour toujours. `curriculum_themes.totalPuzzles` est donc recalculé
 * sur un COMPTE RÉEL de lignes (`count(*)`), jamais sur `max(orderIndex)+1`
 * — c'est le compte réel qui pilote "X/Y thèmes maîtrisés"
 * (`userThemeProgress`), l'orderIndex ne sert qu'à ordonner l'affichage.
 *
 * ## Fichiers de remplacement (`*.override.json`)
 *
 * Un fichier dont le nom se termine par `.override.json` est une sélection
 * curatée et vérifiée (géométrie du motif rejouée par chess.js, chaque coup du
 * solveur confirmé par Stockfish — voir le cahier des charges du 2026-10-09,
 * lot n°1 : sacrifice grec, canon d'Alekhine, mat de l'Opéra). Pour CHAQUE
 * thème qu'il couvre, il REMPLACE toutes les autres sources : les entrées des
 * autres fichiers pour ce thème sont écartées (« remplacé(s) » au résumé) et
 * l'exercice de démonstration `sourceFile: null` de ce thème est supprimé.
 * Sans ce mécanisme, un fichier généré en masse depuis un tag Lichess plus
 * large que le motif (ex. `operaMate`, qui accepte un roi maté au centre)
 * réimporterait à chaque run les positions hors motif qu'on a voulu retirer.
 *
 * ## Procédure finale (lot 7, 2026-10-16)
 *
 * Un run réel (ni `--dry-run`, ni `--audit-only`) enchaîne :
 *   1. sauvegarde `VACUUM INTO <base>.bak-<horodatage>-preseed`, puis
 *      instantané de la progression (`snapshotProgress`) ;
 *   2. suppression PHYSIQUE des lignes visées par les `*.exclude.json`
 *      (`purgeExcludedRows`) — imports, et masters pour `target: "master"` ;
 *   3. réimport (la réserve du filtre qualité comble les places libérées),
 *      alignement des masters sur `MASTER_PUZZLES_DATASET`, correction des
 *      droits de roque, `orderIndex` contigu, totaux, progression recalée ;
 *   4. tolérance des thèmes de force brute : portée par `classifyRow`
 *      (`BRUTE_FORCE_THEME_IDS`, `academy-mining/classify-uniqueness.mjs`) ;
 *   5. réaudit flash (`flashReaudit`) : structure et types de chaque ligne,
 *      verdict d'unicité de l'audit complet ou Stockfish 18 profondeur 16 pour
 *      les seules lignes nouvelles. Un import refusé rejoint
 *      `reaudit-auto.exclude.json` et une nouvelle passe le remplace (au plus
 *      `MAX_SEED_PASSES`). Code de sortie 1 si la base n'est pas propre.
 * Journal JSON complet dans `data/seed-logs/`.
 *
 * Usage :
 *   npm run db:seed-academy
 *   npm run db:seed-academy -- --only=checkmate-patterns.pgn
 *   npm run db:seed-academy -- --dry-run
 *   npm run db:seed-academy -- --audit-only [--no-stockfish]
 */
import { spawn } from "node:child_process";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Chess } from "chess.js";
import { and, count, eq, inArray, isNull, max } from "drizzle-orm";
import {
  buildAcademyPuzzleFromGame,
  buildAcademyPuzzleFromJsonEntry,
  sanitizeCastlingRights,
  type AcademyJsonEntry,
  type AcademyPuzzleDraft,
} from "@/core/curriculum/academy-parser";
import {
  CURRICULUM_THEMES,
  QUALITY_FILTERED_THEME_IDS,
  QUALITY_FILTER_MAX_PUZZLES,
  STRATEGIC_CURATED_ONLY_THEME_IDS,
} from "@/core/curriculum/catalog";
import { MASTER_PUZZLES_DATASET } from "@/core/curriculum/master-puzzles-dataset";
import { parsePgnGames } from "@/core/curriculum/traps-parser";
import { db } from "@/server/db";
import { curriculumPuzzles, curriculumThemes, userThemeProgress, type NewCurriculumPuzzle } from "@/server/db/schema";
import { ensureCurriculumSeeded } from "@/server/queries/curriculum";
import { classifyRow, readRows } from "./academy-mining/classify-uniqueness.mjs";

const ACADEMY_DIR = join(process.cwd(), "data/import/academy");
/** Sorties `*.jsonl` de l'audit d'unicité complet (`data/uniq-training/run.sh`) — la base des verdicts du réaudit flash. */
const AUDIT_DIR = join(process.cwd(), "data/uniq-training");
/** Verdicts Stockfish calculés par le réaudit flash pour les lignes absentes de l'audit complet (réserve promue, nouveaux overrides). */
const REAUDIT_DIR = join(AUDIT_DIR, "reaudit");
/** Journal JSON de chaque run réel — jamais de tableau, un objet par étape. */
const LOG_DIR = join(process.cwd(), "data/seed-logs");
/** Les exclusions découvertes par le réaudit flash, réappliquées à chaque run suivant comme tout `*.exclude.json`. */
const AUTO_EXCLUDE_FILE = "reaudit-auto.exclude.json";
/** En dessous, un thème est signalé « en déficit » (règle de remplissage de l'académie : 15 exercices par thème). */
const MIN_PUZZLES_PER_THEME = 15;
const REAUDIT_DEPTH = 16;
const REAUDIT_SHARDS = 4;
/** Passes seed → réaudit au plus : chacune exclut les imports refusés par Stockfish et laisse la réserve suivante les remplacer. */
const MAX_SEED_PASSES = 3;
/** Verdicts de `classify-uniqueness.mjs` qui bloquent le run. `limite` est admis (règle « compléter avec limite »), `toleree` aussi (thèmes de force brute). */
const REJECTED_VERDICTS = new Set(["ambigue", "fausse", "erreur"]);

interface SeedOptions {
  only?: string;
  dryRun?: boolean;
  /** Réaudit flash seul, sur la base telle quelle — aucune écriture dans `curriculum_puzzles`. */
  auditOnly?: boolean;
  /** Le réaudit ne lance pas Stockfish : une ligne absente de l'audit complet est alors une erreur « non auditée ». */
  noStockfish?: boolean;
}

interface FileResult {
  file: string;
  found: number;
  built: number;
  skipped: number;
  /** Sous-ensemble de `skipped` écarté par le filtre qualité (voir le docstring de fichier), jamais par une erreur de parsing/légalité. */
  qualityFiltered: number;
  /** Sous-ensemble de `skipped` écarté parce qu'un fichier `*.override.json` couvre son thème. */
  replaced: number;
  /** Sous-ensemble de `skipped` écarté par un fichier `*.exclude.json` (solution non unique). */
  excluded: number;
  /** Sous-ensemble de `skipped` écarté parce que la même position avec la même solution existe déjà dans le thème. */
  duplicates: number;
}

/** `[]` si le dossier n'existe pas encore — un dossier d'import absent n'est jamais une erreur, juste « rien à faire ». */
async function listAcademyFiles(only?: string): Promise<string[]> {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await readdir(ACADEMY_DIR, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((entry) => entry.isFile() && (entry.name.endsWith(".pgn") || entry.name.endsWith(".json")))
    .map((entry) => entry.name)
    .filter((name) => !isExcludeFile(name))
    .filter((name) => !only || name === only)
    .sort();
}

/**
 * Fichiers générés en masse par `scripts/convert-lichess-puzzles-csv.ts` (un
 * par catégorie, ex. `positional-mastery-lichess.json`) — par opposition aux
 * fichiers curatés à la main (`positional-studies-curated.json`,
 * `checkmate-patterns.pgn`…). Seul indice fiable : le suffixe `-lichess.json`,
 * imposé par ce même script (voir son en-tête).
 */
function isBulkLichessFile(file: string): boolean {
  return file.endsWith("-lichess.json");
}

/** Voir « Fichiers de remplacement » dans le docstring de fichier. */
function isOverrideFile(file: string): boolean {
  return file.endsWith(".override.json");
}

/**
 * Un fichier `*.exclude.json` n'apporte aucun exercice : c'est une liste
 * `[{ themeId, fen, moves, reason }]` de puzzles à NE PAS importer, quel que
 * soit leur fichier d'origine — ceux dont l'audit d'unicité
 * (`scripts/academy-mining/check-uniqueness.mts`) a trouvé plusieurs bonnes
 * réponses ou une solution réfutée. Contrairement à un `.override.json`, le
 * reste du thème est conservé : pour un thème plafonné (filtre qualité), le
 * premier exercice en réserve prend la place libérée.
 */
function isExcludeFile(file: string): boolean {
  return file.endsWith(".exclude.json");
}

/** Position (sans les compteurs de coups) + solution : stable d'un run à l'autre, contrairement à l'id (indexé sur le rang dans le fichier). */
export function exclusionKey(themeId: string, fen: string, solutionSan: readonly string[]): string {
  return `${themeId}|${sanitizeCastlingRights(fen).split(" ").slice(0, 4).join(" ")}|${solutionSan.join(" ")}`;
}

/**
 * `target` vaut `"import"` par défaut : l'entrée ne vise que les puzzles
 * importés (`sourceFile` non nul). `"master"` vise l'exercice master
 * (`sourceFile: null`) de même position — un master ambigu sans remplaçant
 * unique, que `MASTER_PUZZLES_DATASET` doit garder (au moins une entrée par
 * thème curaté) mais que la base ne doit plus servir. Jamais les deux à la
 * fois : une entrée « promu exercice master » porte la position du NOUVEAU
 * master et ne doit retirer que son doublon importé.
 */
interface ExclusionEntry {
  themeId: string;
  fen: string;
  moves: string[];
  reason?: string;
  target?: "import" | "master";
}

interface Exclusions {
  importKeys: Set<string>;
  masterKeys: Set<string>;
}

async function loadExclusions(): Promise<Exclusions> {
  const exclusions: Exclusions = { importKeys: new Set(), masterKeys: new Set() };
  let names: string[];
  try {
    names = (await readdir(ACADEMY_DIR)).filter(isExcludeFile).sort();
  } catch {
    return exclusions;
  }
  for (const name of names) {
    const entries = JSON.parse(await readFile(join(ACADEMY_DIR, name), "utf8")) as ExclusionEntry[];
    for (const entry of entries) {
      const keys = entry.target === "master" ? exclusions.masterKeys : exclusions.importKeys;
      keys.add(exclusionKey(entry.themeId, entry.fen, entry.moves));
    }
  }
  return exclusions;
}

/**
 * Une même position avec la même solution ne sert qu'une fois par thème : le
 * premier exemplaire gagne — une ligne déjà en base hors de ce run (master,
 * démo, fichier hors `--only`), sinon le premier fichier dans l'ordre du run.
 * Sans ce filtre, `tactics-checkmate-patterns.json` et un fichier curaté qui
 * reprennent le même puzzle Lichess le faisaient résoudre deux fois.
 */
function applyDeduplication(parsedFiles: readonly ParsedFile[], existingKeys: ReadonlySet<string>): { files: ParsedFile[]; duplicatesByFile: Map<string, number> } {
  const seen = new Set(existingKeys);
  const duplicatesByFile = new Map<string, number>();
  const files = parsedFiles.map((pf) => {
    const drafts = pf.drafts.filter((draft) => {
      const key = exclusionKey(draft.themeId, draft.fen, draft.solutionSan);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (drafts.length < pf.drafts.length) duplicatesByFile.set(pf.file, pf.drafts.length - drafts.length);
    return { ...pf, drafts };
  });
  return { files, duplicatesByFile };
}

function applyExclusions(parsedFiles: readonly ParsedFile[], keys: ReadonlySet<string>): { files: ParsedFile[]; excludedByFile: Map<string, number> } {
  const excludedByFile = new Map<string, number>();
  const files = parsedFiles.map((pf) => {
    const drafts = pf.drafts.filter((draft) => !keys.has(exclusionKey(draft.themeId, draft.fen, draft.solutionSan)));
    if (drafts.length < pf.drafts.length) excludedByFile.set(pf.file, pf.drafts.length - drafts.length);
    return { ...pf, drafts };
  });
  return { files, excludedByFile };
}

/**
 * Un thème « curated-only » (`STRATEGIC_CURATED_ONLY_THEME_IDS`, catalog.ts —
 * avant-poste du cavalier, case faible, structure Maroczy à ce jour) ne doit
 * JAMAIS recevoir de contenu d'un fichier généré en masse depuis les tags
 * génériques Lichess (`middlegame`, `sacrifice`…) : ces tags n'ont rien à voir
 * avec le thème stratégique précis et le polluaient de puzzles tactiques
 * hors-sujet (cahier des charges du 2026-09-06). Rejette silencieusement (le
 * fichier curaté correspondant reste, lui, intact) — purge un run précédent
 * du convertisseur CSV aussi bien qu'elle prévient toute pollution future.
 */
function isRejectedStrategicPollution(file: string, themeId: string): boolean {
  return isBulkLichessFile(file) && STRATEGIC_CURATED_ONLY_THEME_IDS.has(themeId);
}

async function parseAcademyFile(file: string): Promise<{ found: number; drafts: AcademyPuzzleDraft[]; skipped: number }> {
  const text = await readFile(join(ACADEMY_DIR, file), "utf8");
  const drafts: AcademyPuzzleDraft[] = [];
  let found = 0;
  let skipped = 0;

  if (file.endsWith(".json")) {
    let entries: AcademyJsonEntry[];
    try {
      const parsed: unknown = JSON.parse(text);
      entries = Array.isArray(parsed) ? (parsed as AcademyJsonEntry[]) : [];
    } catch (cause) {
      console.warn(`  ⚠ ${file} — JSON invalide, fichier ignoré (${(cause as Error).message})`);
      return { found: 0, drafts: [], skipped: 0 };
    }
    found = entries.length;
    entries.forEach((entry, index) => {
      const draft = buildAcademyPuzzleFromJsonEntry(entry, { idPrefix: `${file}:${index}` });
      if (!draft) {
        skipped += 1;
        console.warn(`  ⚠ ${file} — entrée #${index} ignorée (thème introuvable dans le catalogue, ou coup illégal)`);
        return;
      }
      if (isRejectedStrategicPollution(file, draft.themeId)) {
        skipped += 1;
        console.warn(`  ⚠ ${file} — entrée #${index} rejetée (thème "${draft.themeId}" curated-only, pas de contenu générique Lichess)`);
        return;
      }
      drafts.push(draft);
    });
    return { found, drafts, skipped };
  }

  const games = parsePgnGames(text);
  found = games.length;
  for (const game of games) {
    const draft = buildAcademyPuzzleFromGame(game, { idPrefix: file });
    if (!draft) {
      skipped += 1;
      console.warn(`  ⚠ ${file} — ignoré (thème introuvable dans le catalogue, ou coup illégal) : ${game.tags.Event ?? "(sans [Event])"}`);
      continue;
    }
    drafts.push(draft);
  }
  return { found, drafts, skipped };
}

/** Phase 1 — purge les lignes précédemment importées d'un fichier donné. TOUJOURS exécutée pour tous les fichiers avant la moindre réinsertion (voir le docstring de fichier). */
async function purgeAcademyFile(file: string): Promise<void> {
  await db.delete(curriculumPuzzles).where(eq(curriculumPuzzles.sourceFile, file));
}

interface ParsedFile {
  file: string;
  found: number;
  skipped: number;
  drafts: AcademyPuzzleDraft[];
}

/** Un draft encore relié à son fichier d'origine — nécessaire pour répartir le résumé par fichier après un regroupement PAR THÈME (voir `applyQualityFilter`). */
interface TaggedDraft {
  file: string;
  draft: AcademyPuzzleDraft;
}

/** Parse tous les fichiers du run — jamais d'insertion ici, seulement pour construire la vue globale par thème qu'exige le filtre qualité (voir le docstring de fichier). */
async function parseAllFiles(files: readonly string[]): Promise<ParsedFile[]> {
  const results: ParsedFile[] = [];
  for (const file of files) {
    const { found, drafts, skipped } = await parseAcademyFile(file);
    results.push({ file, found, skipped, drafts });
  }
  return results;
}

/**
 * Thèmes couverts par au moins un fichier `*.override.json` du run, et retrait
 * des entrées des AUTRES fichiers pour ces thèmes — voir « Fichiers de
 * remplacement » dans le docstring de fichier. Fonction pure sur les fichiers
 * parsés : ne touche jamais à la base.
 */
function applyOverrides(parsedFiles: readonly ParsedFile[]): {
  files: ParsedFile[];
  overrideThemeIds: Set<string>;
  replacedByFile: Map<string, number>;
} {
  const overrideThemeIds = new Set<string>();
  for (const pf of parsedFiles) if (isOverrideFile(pf.file)) for (const draft of pf.drafts) overrideThemeIds.add(draft.themeId);

  const replacedByFile = new Map<string, number>();
  const files = parsedFiles.map((pf) => {
    if (isOverrideFile(pf.file)) return pf;
    const drafts = pf.drafts.filter((draft) => !overrideThemeIds.has(draft.themeId));
    const replaced = pf.drafts.length - drafts.length;
    if (replaced > 0) replacedByFile.set(pf.file, replaced);
    return { ...pf, drafts };
  });
  return { files, overrideThemeIds, replacedByFile };
}

/** Supprime l'exercice de démonstration (`sourceFile: null`) des thèmes remplacés par un `*.override.json`. */
async function purgeDemoRowsOf(themeIds: ReadonlySet<string>): Promise<void> {
  if (themeIds.size === 0) return;
  await db.delete(curriculumPuzzles).where(and(inArray(curriculumPuzzles.themeId, [...themeIds]), isNull(curriculumPuzzles.sourceFile)));
}

/** Priorité absolue au tag `sacrifice`, puis à l'Elo décroissant — voir le docstring de fichier. Un draft sans métadonnées (PGN/JSON écrit à la main, ou recalculé depuis `tactics.pgn`) obtient le score neutre `0`. */
function qualityPriorityScore(draft: AcademyPuzzleDraft): number {
  return (draft.sacrifice ? 1_000_000 : 0) + (draft.rating ?? 0);
}

/**
 * Compte, PAR THÈME, les lignes de `curriculum_puzzles` déjà en base pour les
 * thèmes filtrés qualité — appelé après la purge de phase 1, donc ce compte
 * ne reflète que ce qui va réellement survivre à ce run (typiquement
 * l'exercice de démonstration `sourceFile: null`, voir le docstring de
 * fichier). Sert à réduire d'autant le budget de 50 pour que le TOTAL final
 * (résidu + nouveaux imports) ne dépasse jamais le plafond, jamais seulement
 * les nouveaux imports de ce run.
 */
async function countExistingByTheme(themeIds: readonly string[]): Promise<Map<string, number>> {
  if (themeIds.length === 0) return new Map();
  const rows = await db
    .select({ themeId: curriculumPuzzles.themeId, total: count() })
    .from(curriculumPuzzles)
    .where(inArray(curriculumPuzzles.themeId, themeIds))
    .groupBy(curriculumPuzzles.themeId);
  return new Map(rows.map((r) => [r.themeId, r.total]));
}

/**
 * Applique le filtre qualité (voir le docstring de fichier) PAR THÈME, à
 * travers tous les fichiers du run à la fois — un draft à un seul pli est
 * toujours écarté pour un thème de `QUALITY_FILTERED_THEME_IDS` (sauf "Mat en
 * 1", déjà exclu de cet ensemble), puis le reste plafonné à
 * `QUALITY_FILTER_MAX_PUZZLES` MOINS le résidu déjà en base
 * (`preExistingByTheme`, voir `countExistingByTheme`) par priorité
 * décroissante. Les thèmes hors filtre qualité passent intégralement,
 * inchangés.
 */
function applyQualityFilter(
  parsedFiles: readonly ParsedFile[],
  preExistingByTheme: ReadonlyMap<string, number>,
): {
  kept: TaggedDraft[];
  qualityFilteredByFile: Map<string, number>;
} {
  const byTheme = new Map<string, TaggedDraft[]>();
  for (const pf of parsedFiles) {
    for (const draft of pf.drafts) {
      const list = byTheme.get(draft.themeId) ?? [];
      list.push({ file: pf.file, draft });
      byTheme.set(draft.themeId, list);
    }
  }

  const kept: TaggedDraft[] = [];
  const qualityFilteredByFile = new Map<string, number>();
  const recordDropped = (item: TaggedDraft) =>
    qualityFilteredByFile.set(item.file, (qualityFilteredByFile.get(item.file) ?? 0) + 1);

  for (const [themeId, items] of byTheme) {
    if (!QUALITY_FILTERED_THEME_IDS.has(themeId)) {
      kept.push(...items);
      continue;
    }
    const budget = Math.max(0, QUALITY_FILTER_MAX_PUZZLES - (preExistingByTheme.get(themeId) ?? 0));
    const oneMove = items.filter((item) => item.draft.solutionSan.length <= 1);
    let survivors = items.filter((item) => item.draft.solutionSan.length > 1);
    let overflow: TaggedDraft[] = [];
    if (survivors.length > budget) {
      survivors = [...survivors].sort((a, b) => qualityPriorityScore(b.draft) - qualityPriorityScore(a.draft));
      overflow = survivors.slice(budget);
      survivors = survivors.slice(0, budget);
    }
    kept.push(...survivors);
    for (const item of oneMove) recordDropped(item);
    for (const item of overflow) recordDropped(item);
  }

  return { kept, qualityFilteredByFile };
}

function countByFile(items: readonly TaggedDraft[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) map.set(item.file, (map.get(item.file) ?? 0) + 1);
  return map;
}

/**
 * Phase 2 — insère tous les drafts déjà filtrés (tous les fichiers du run
 * déjà purgés, voir `main`), groupés par thème, avec un `orderIndex` qui
 * reprend après le maximum déjà en base pour chaque thème touché. Renvoie le
 * nombre de lignes effectivement insérées par fichier d'origine (résumé).
 */
async function insertKeptDrafts(kept: readonly TaggedDraft[]): Promise<Map<string, number>> {
  const builtByFile = new Map<string, number>();
  if (kept.length === 0) return builtByFile;

  const itemsByTheme = new Map<string, TaggedDraft[]>();
  for (const item of kept) {
    const list = itemsByTheme.get(item.draft.themeId) ?? [];
    list.push(item);
    itemsByTheme.set(item.draft.themeId, list);
  }

  const rows: NewCurriculumPuzzle[] = [];
  for (const [themeId, items] of itemsByTheme) {
    const [{ maxOrderIndex } = { maxOrderIndex: null }] = await db
      .select({ maxOrderIndex: max(curriculumPuzzles.orderIndex) })
      .from(curriculumPuzzles)
      .where(eq(curriculumPuzzles.themeId, themeId));
    let nextOrderIndex = maxOrderIndex === null ? 0 : maxOrderIndex + 1;
    for (const { file, draft } of items) {
      rows.push({
        id: draft.id,
        themeId: draft.themeId,
        orderIndex: nextOrderIndex,
        fen: draft.fen,
        solution: draft.solution,
        solutionSan: draft.solutionSan,
        sourceRef: draft.sourceRef,
        sourceFile: file,
      });
      nextOrderIndex += 1;
      builtByFile.set(file, (builtByFile.get(file) ?? 0) + 1);
    }
  }

  // SQLite plafonne le nombre de paramètres liés par requête — un fichier
  // massif (ex. le convertisseur Lichess, plusieurs milliers de lignes en un
  // seul fichier JSON) dépasse vite cette limite en un seul insert group by
  // group. Lots de 200 lignes (7 colonnes × 200 = 1400 paramètres), bien
  // en-dessous de toute limite réaliste, sans changer le résultat.
  const BATCH_SIZE = 200;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    if (batch.length > 0) await db.insert(curriculumPuzzles).values(batch);
  }

  return builtByFile;
}

/**
 * Recalcule `curriculum_themes.totalPuzzles` pour LES 211 THÈMES DU
 * CATALOGUE, jamais seulement ceux "touchés" par ce run (bug corrigé le
 * 2026-09-06 : un thème purgé de TOUTE sa pollution — voir
 * `STRATEGIC_CURATED_ONLY_THEME_IDS` — mais qui n'a reçu AUCUN draft de
 * remplacement n'apparaissait dans aucune des deux anciennes boucles de
 * recalcul, et gardait donc son ancien total, gonflé, comme si le contenu
 * pollué existait toujours). Compte RÉEL de lignes en base pour chaque thème,
 * jamais un objectif théorique ni un `max(orderIndex)+1` — cahier des
 * charges explicite : « Ne triche plus pour remplir les jauges », un thème à
 * 0 exercice réel doit afficher honnêtement 0.
 *
 * 211 requêtes `count()` indexées (`themeId`) : coût négligeable face aux
 * dizaines de secondes déjà passées à parser `tactics.pgn` — jamais sauté par
 * souci de performance.
 */
async function recalculateAllThemeTotals(): Promise<void> {
  for (const theme of CURRICULUM_THEMES) {
    const [{ total } = { total: 0 }] = await db
      .select({ total: count() })
      .from(curriculumPuzzles)
      .where(eq(curriculumPuzzles.themeId, theme.id));
    await db.update(curriculumThemes).set({ totalPuzzles: total }).where(eq(curriculumThemes.id, theme.id));
  }
}

// ─── Procédure finale (lot 7) ─────────────────────────────────────────────
// Voir « Procédure finale » dans le docstring de fichier. Chaque étape
// renvoie un objet JSON destiné au journal (`LOG_DIR`), jamais un tableau.

type PuzzleRow = Pick<NewCurriculumPuzzle, "id" | "themeId" | "orderIndex" | "fen" | "solution" | "solutionSan" | "sourceFile">;

async function selectAllPuzzleRows(): Promise<PuzzleRow[]> {
  return db
    .select({
      id: curriculumPuzzles.id,
      themeId: curriculumPuzzles.themeId,
      orderIndex: curriculumPuzzles.orderIndex,
      fen: curriculumPuzzles.fen,
      solution: curriculumPuzzles.solution,
      solutionSan: curriculumPuzzles.solutionSan,
      sourceFile: curriculumPuzzles.sourceFile,
    })
    .from(curriculumPuzzles);
}

function rowKey(row: Pick<PuzzleRow, "themeId" | "fen" | "solutionSan">): string {
  return exclusionKey(row.themeId, row.fen, row.solutionSan);
}

/**
 * Identité d'un exercice qui survit à un run : l'id pour un master/démo
 * (`<thème>::master:<n>`, `demo-<n>` — stables, et un master remplacé en place
 * garde la case que l'utilisateur a déjà franchie), la position + solution pour
 * un import (son id dépend de son rang dans le fichier, qui bouge dès qu'une
 * exclusion retire une entrée avant lui).
 */
function rowIdentity(row: PuzzleRow): string {
  return row.sourceFile == null ? `id:${row.id}` : `key:${rowKey(row)}`;
}

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

/**
 * Étape 1 — copie cohérente de la base, WAL compris (`VACUUM INTO` lit un
 * instantané transactionnel, contrairement à une copie du fichier `.db` seul).
 * Restauration : remplacer `chess-trainer.db` par la copie, app arrêtée, et
 * supprimer les `-wal`/`-shm` restants.
 */
function backupDatabase(stamp: string): string {
  const target = `${db.$client.name}.bak-${stamp}-preseed`;
  db.$client.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
  return target;
}

interface ProgressSnapshot {
  userId: string;
  themeId: string;
  completedCount: number;
  completedAt: Date | null;
  /** `rowIdentity` des exercices d'`orderIndex < completedCount` AVANT le run — ceux que l'utilisateur a déjà résolus. */
  passed: Set<string>;
}

/** Pris AVANT toute écriture : c'est la seule trace de quels exercices le curseur `completedCount` avait déjà franchis. */
async function snapshotProgress(): Promise<ProgressSnapshot[]> {
  const progress = await db.select().from(userThemeProgress);
  const rows = await selectAllPuzzleRows();
  return progress
    .filter((p) => p.completedCount > 0)
    .map((p) => ({
      userId: p.userId,
      themeId: p.themeId,
      completedCount: p.completedCount,
      completedAt: p.completedAt,
      passed: new Set(rows.filter((r) => r.themeId === p.themeId && r.orderIndex < p.completedCount).map(rowIdentity)),
    }));
}

/**
 * Étape 2 — suppression PHYSIQUE des lignes visées par un `*.exclude.json`,
 * toutes sources confondues : les imports d'un fichier hors de ce run
 * (`--only`) comme les masters (`target: "master"`). Les imports des fichiers
 * du run sont déjà purgés en phase 1 et ne seront pas réinsérés
 * (`applyExclusions`).
 */
async function purgeExcludedRows(exclusions: Exclusions): Promise<{ purged: number; masters: string[]; imports: number }> {
  const doomed = (await selectAllPuzzleRows()).filter((row) =>
    (row.sourceFile == null ? exclusions.masterKeys : exclusions.importKeys).has(rowKey(row)),
  );
  const ids = doomed.map((row) => row.id);
  for (let i = 0; i < ids.length; i += 500) await db.delete(curriculumPuzzles).where(inArray(curriculumPuzzles.id, ids.slice(i, i + 500)));
  const masters = doomed.filter((row) => row.sourceFile == null).map((row) => row.id);
  return { purged: ids.length, masters, imports: ids.length - masters.length };
}

/**
 * Étape 3b — aligne les lignes `<thème>::master:<n>` encore en base sur
 * `MASTER_PUZZLES_DATASET` par UPDATE en place (ex-`sync-master-rows.mts`) :
 * même id, même `orderIndex`, donc même case de progression. N'en recrée
 * jamais une absente — purgée par un override ou une exclusion `master`, elle
 * doit le rester. Même projection que `buildRow` de `populate-puzzles.ts`.
 */
function syncMasterRows(): { updated: string[]; absent: number } {
  const index = new Map<string, number>();
  const updated: string[] = [];
  let absent = 0;
  db.transaction((tx) => {
    for (const puzzle of MASTER_PUZZLES_DATASET) {
      const n = index.get(puzzle.themeId) ?? 0;
      index.set(puzzle.themeId, n + 1);
      const id = `${puzzle.themeId}::master:${n}`;
      const row = tx.select().from(curriculumPuzzles).where(eq(curriculumPuzzles.id, id)).get();
      if (!row) {
        absent += 1;
        continue;
      }
      const next = {
        fen: sanitizeCastlingRights(puzzle.fen),
        solution: [...puzzle.solution],
        solutionSan: [...puzzle.solutionSan],
        sourceRef: `${puzzle.sourceRef} (${puzzle.rating} Elo estimé)`,
      };
      const same =
        row.fen === next.fen &&
        JSON.stringify(row.solution) === JSON.stringify(next.solution) &&
        JSON.stringify(row.solutionSan) === JSON.stringify(next.solutionSan) &&
        row.sourceRef === next.sourceRef;
      if (same) continue;
      tx.update(curriculumPuzzles).set(next).where(eq(curriculumPuzzles.id, id)).run();
      updated.push(id);
    }
  });
  return { updated, absent };
}

/** Droits de roque impossibles encore en base, par droit retiré (K, Q, k, q). */
function castlingDefects(rows: readonly PuzzleRow[]): { rows: number; byRight: Record<string, number> } {
  const byRight: Record<string, number> = {};
  let defective = 0;
  for (const row of rows) {
    const clean = sanitizeCastlingRights(row.fen);
    if (clean === row.fen) continue;
    defective += 1;
    const kept = clean.split(" ")[2];
    for (const right of row.fen.split(" ")[2]) if (!kept.includes(right)) byRight[right] = (byRight[right] ?? 0) + 1;
  }
  return { rows: defective, byRight };
}

/** Étape 3c — corrige en place les FEN que ce run n'a pas réécrites (imports hors `--only`, démos). Les imports réinsérés passent déjà par `sanitizeCastlingRights` (`academy-parser.ts`). */
async function sanitizeStoredCastling(): Promise<number> {
  const rows = (await selectAllPuzzleRows()).filter((row) => sanitizeCastlingRights(row.fen) !== row.fen);
  db.transaction((tx) => {
    for (const row of rows) tx.update(curriculumPuzzles).set({ fen: sanitizeCastlingRights(row.fen) }).where(eq(curriculumPuzzles.id, row.id)).run();
  });
  return rows.length;
}

/**
 * Étape 3d — `orderIndex` contigu 0..n-1 dans chaque thème, ordre relatif
 * conservé. Une suppression physique laisse des trous ; or le curseur
 * `completedCount` sert l'exercice d'`orderIndex >= completedCount` et déclare
 * le thème maîtrisé à `completedCount >= totalPuzzles` (compte réel) : avec
 * un trou, le dernier exercice ne serait jamais servi.
 */
async function renumberOrderIndexes(): Promise<number> {
  const rows = (await selectAllPuzzleRows()).sort(
    (a, b) => a.themeId.localeCompare(b.themeId) || a.orderIndex - b.orderIndex || a.id.localeCompare(b.id),
  );
  let moved = 0;
  db.transaction((tx) => {
    let theme = "";
    let next = 0;
    for (const row of rows) {
      if (row.themeId !== theme) {
        theme = row.themeId;
        next = 0;
      }
      if (row.orderIndex !== next) {
        tx.update(curriculumPuzzles).set({ orderIndex: next }).where(eq(curriculumPuzzles.id, row.id)).run();
        moved += 1;
      }
      next += 1;
    }
  });
  return moved;
}

interface ProgressChange {
  themeId: string;
  before: number;
  after: number;
  total: number;
}

/**
 * Étape 3f — recale chaque curseur sur le nombre d'exercices DÉJÀ résolus qui
 * existent encore (identités du `snapshotProgress`). Un exercice purgé que
 * l'utilisateur avait passé ne compte plus, un remplaçant ajouté en fin de
 * thème reste à faire, un master remplacé en place reste acquis. Idempotent :
 * toujours recalculé depuis l'instantané d'avant le run.
 */
async function restoreProgress(snapshot: readonly ProgressSnapshot[]): Promise<ProgressChange[]> {
  const rows = await selectAllPuzzleRows();
  const changes: ProgressChange[] = [];
  for (const p of snapshot) {
    const themeRows = rows.filter((r) => r.themeId === p.themeId);
    const total = themeRows.length;
    const after = Math.min(total, themeRows.filter((r) => p.passed.has(rowIdentity(r))).length);
    const completedAt = total > 0 && after >= total ? (p.completedAt ?? new Date()) : null;
    await db
      .update(userThemeProgress)
      .set({ completedCount: after, completedAt, updatedAt: new Date() })
      .where(and(eq(userThemeProgress.userId, p.userId), eq(userThemeProgress.themeId, p.themeId)));
    if (after !== p.completedCount) changes.push({ themeId: p.themeId, before: p.completedCount, after, total });
  }
  return changes;
}

interface AuditJsonlRow {
  id: string;
  theme: string;
  fen: string;
  sans: string[];
  error: string | null;
  plies: unknown[];
}

function loadVerdicts(): { verdicts: Map<string, string>; auditedThemes: Set<string> } {
  const rows = [...(readRows(AUDIT_DIR) as AuditJsonlRow[]), ...readRowsIfAny(REAUDIT_DIR)];
  const verdicts = new Map<string, string>();
  const auditedThemes = new Set<string>();
  for (const row of rows) {
    auditedThemes.add(row.theme);
    // Le dernier verdict calculé l'emporte (réaudit après l'audit complet).
    verdicts.set(exclusionKey(row.theme, row.fen, row.sans), classifyRow(row));
  }
  return { verdicts, auditedThemes };
}

function readRowsIfAny(dir: string): AuditJsonlRow[] {
  try {
    return readRows(dir) as AuditJsonlRow[];
  } catch {
    return [];
  }
}

/** Lance `check-uniqueness.mts` (Stockfish 18, MultiPV 2) en `REAUDIT_SHARDS` processus sur les lignes sans verdict. */
async function runStockfishOn(rows: readonly PuzzleRow[], stamp: string): Promise<void> {
  await mkdir(REAUDIT_DIR, { recursive: true });
  const input = join(REAUDIT_DIR, `pending-${stamp}.json`);
  await writeFile(input, JSON.stringify(rows.map((r) => ({ key: r.id, theme: r.themeId, fen: r.fen, solutionSan: r.solutionSan }))));
  const script = join(process.cwd(), "scripts/academy-mining/check-uniqueness.mts");
  const shards = Math.min(REAUDIT_SHARDS, rows.length);
  await Promise.all(
    Array.from({ length: shards }, (_, i) =>
      new Promise<void>((resolve, reject) => {
        const child = spawn(process.execPath, ["--import", "tsx", script, join(REAUDIT_DIR, `reaudit-${stamp}-${i}.jsonl`), String(REAUDIT_DEPTH)], {
          env: { ...process.env, INPUT: input, SHARD: `${i}/${shards}` },
          stdio: ["ignore", "ignore", "inherit"],
        });
        child.on("error", reject);
        child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`check-uniqueness shard ${i} : code ${code}`))));
      }),
    ),
  );
}

interface ReauditFailure {
  id: string;
  themeId: string;
  fen: string;
  solutionSan: string[];
  sourceFile: string | null;
  problem: string;
}

interface ReauditReport {
  clean: boolean;
  rows: number;
  structuralErrors: ReauditFailure[];
  uniquenessFailures: ReauditFailure[];
  verdictCounts: Record<string, number>;
  unauditedThemes: number;
  themeErrors: string[];
  deficitThemes: { themeId: string; puzzles: number }[];
}

/** Rejoue la solution UCI depuis la FEN et la confronte au SAN stocké — `null` si tout est cohérent. */
function structuralProblem(row: PuzzleRow, catalogIds: ReadonlySet<string>): string | null {
  if (!catalogIds.has(row.themeId)) return "thème absent du catalogue";
  const { solution, solutionSan } = row;
  if (!Array.isArray(solution) || !solution.every((m) => typeof m === "string")) return "solution n'est pas une liste de chaînes UCI";
  if (!Array.isArray(solutionSan) || !solutionSan.every((m) => typeof m === "string")) return "solutionSan n'est pas une liste de chaînes SAN";
  if (solution.length === 0 || solution.length !== solutionSan.length) return `longueurs incohérentes (${solution.length} UCI, ${solutionSan.length} SAN)`;
  if (sanitizeCastlingRights(row.fen) !== row.fen) return "droits de roque impossibles";
  let board: Chess;
  try {
    board = new Chess(row.fen);
  } catch (cause) {
    return `FEN invalide (${(cause as Error).message})`;
  }
  for (let i = 0; i < solution.length; i++) {
    const uci = solution[i];
    try {
      const move = board.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
      if (move.san !== solutionSan[i]) return `pli ${i} : ${uci} donne ${move.san}, ${solutionSan[i]} attendu`;
    } catch {
      return `pli ${i} : ${uci} illégal`;
    }
  }
  return null;
}

/**
 * Étape 5 — réaudit flash de la base finale : structure et types de chaque
 * ligne (toutes catégories), unicité Stockfish des thèmes couverts par l'audit
 * (verdict de l'audit complet, sinon calcul immédiat des seules lignes
 * nouvelles), cohérence `totalPuzzles`/`orderIndex`/progression. Un `limite`
 * passe, un `toleree` aussi (`BRUTE_FORCE_THEME_IDS`, Étape 4).
 */
async function flashReaudit(options: { stamp: string; stockfish: boolean }): Promise<ReauditReport> {
  const catalogIds = new Set(CURRICULUM_THEMES.map((t) => t.id));
  let rows = await selectAllPuzzleRows();
  let { verdicts, auditedThemes } = loadVerdicts();
  const pending = () => rows.filter((r) => auditedThemes.has(r.themeId) && !verdicts.has(rowKey(r)));
  if (options.stockfish && pending().length > 0) {
    console.log(JSON.stringify({ step: "reaudit-stockfish", pending: pending().length, depth: REAUDIT_DEPTH, shards: REAUDIT_SHARDS }));
    await runStockfishOn(pending(), options.stamp);
    ({ verdicts, auditedThemes } = loadVerdicts());
    rows = await selectAllPuzzleRows();
  }

  const failure = (row: PuzzleRow, problem: string): ReauditFailure => ({
    id: row.id,
    themeId: row.themeId,
    fen: row.fen,
    solutionSan: row.solutionSan,
    sourceFile: row.sourceFile ?? null,
    problem,
  });
  const structuralErrors: ReauditFailure[] = [];
  const uniquenessFailures: ReauditFailure[] = [];
  const verdictCounts: Record<string, number> = {};
  const seenKeys = new Set<string>();
  for (const row of rows) {
    const problem = structuralProblem(row, catalogIds);
    if (problem) structuralErrors.push(failure(row, problem));
    const key = rowKey(row);
    if (seenKeys.has(key)) structuralErrors.push(failure(row, "doublon (même position, même solution) dans le thème"));
    seenKeys.add(key);
    if (!auditedThemes.has(row.themeId)) continue;
    const verdict = verdicts.get(key) ?? "non-audite";
    verdictCounts[verdict] = (verdictCounts[verdict] ?? 0) + 1;
    if (REJECTED_VERDICTS.has(verdict) || verdict === "non-audite") uniquenessFailures.push(failure(row, `verdict ${verdict}`));
  }

  const themeErrors: string[] = [];
  const countByTheme = new Map<string, number>();
  const maxIndexByTheme = new Map<string, number>();
  for (const row of rows) {
    countByTheme.set(row.themeId, (countByTheme.get(row.themeId) ?? 0) + 1);
    maxIndexByTheme.set(row.themeId, Math.max(maxIndexByTheme.get(row.themeId) ?? -1, row.orderIndex));
  }
  const themes = await db.select({ id: curriculumThemes.id, totalPuzzles: curriculumThemes.totalPuzzles }).from(curriculumThemes);
  const totals = new Map(themes.map((t) => [t.id, t.totalPuzzles]));
  for (const [themeId, n] of countByTheme) {
    if (totals.get(themeId) !== n) themeErrors.push(`${themeId} : totalPuzzles ${totals.get(themeId)} pour ${n} lignes`);
    if (maxIndexByTheme.get(themeId) !== n - 1) themeErrors.push(`${themeId} : orderIndex non contigu (max ${maxIndexByTheme.get(themeId)} pour ${n} lignes)`);
  }
  for (const p of await db.select().from(userThemeProgress)) {
    if (p.completedCount > (totals.get(p.themeId) ?? 0)) themeErrors.push(`${p.themeId} : progression ${p.completedCount} > ${totals.get(p.themeId)}`);
  }

  const deficitThemes = CURRICULUM_THEMES.map((t) => ({ themeId: t.id, puzzles: countByTheme.get(t.id) ?? 0 }))
    .filter((t) => t.puzzles < MIN_PUZZLES_PER_THEME)
    .sort((a, b) => a.puzzles - b.puzzles);

  return {
    clean: structuralErrors.length === 0 && uniquenessFailures.length === 0 && themeErrors.length === 0,
    rows: rows.length,
    structuralErrors,
    uniquenessFailures,
    verdictCounts,
    unauditedThemes: [...countByTheme.keys()].filter((t) => !auditedThemes.has(t)).length,
    themeErrors,
    deficitThemes,
  };
}

/**
 * Les imports refusés par le réaudit rejoignent `AUTO_EXCLUDE_FILE` : la passe
 * suivante les purge et laisse la réserve du filtre qualité les remplacer.
 * Renvoie le nombre d'entrées ajoutées — 0 quand il ne reste que des échecs
 * non corrigeables automatiquement (master, erreur structurelle).
 */
async function appendAutoExclusions(failures: readonly ReauditFailure[]): Promise<number> {
  const fixable = failures.filter((f) => f.sourceFile != null && f.problem !== "verdict non-audite");
  if (fixable.length === 0) return 0;
  const path = join(ACADEMY_DIR, AUTO_EXCLUDE_FILE);
  let entries: ExclusionEntry[] = [];
  try {
    entries = JSON.parse(await readFile(path, "utf8")) as ExclusionEntry[];
  } catch {
    entries = [];
  }
  const known = new Set(entries.map((e) => exclusionKey(e.themeId, e.fen, e.moves)));
  const added = fixable
    .filter((f) => !known.has(exclusionKey(f.themeId, f.fen, f.solutionSan)))
    .map((f) => ({ themeId: f.themeId, fen: f.fen, moves: f.solutionSan, reason: `réaudit flash ${new Date().toISOString().slice(0, 10)} — ${f.problem}` }));
  await writeFile(path, JSON.stringify([...entries, ...added], null, 1) + "\n");
  return added.length;
}

function parseArgs(argv: string[]): SeedOptions & { help?: boolean } {
  const options: SeedOptions & { help?: boolean } = {};
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--audit-only") options.auditOnly = true;
    else if (arg === "--no-stockfish") options.noStockfish = true;
    else if (arg.startsWith("--only=")) options.only = arg.slice("--only=".length);
  }
  return options;
}

function printSummary(results: FileResult[]): void {
  if (results.length === 0) {
    console.log("data/import/academy : aucun fichier .pgn/.json trouvé.");
    return;
  }
  console.log("\n🎓 Académie (data/import/academy) :");
  let totalBuilt = 0;
  let totalSkipped = 0;
  let totalQualityFiltered = 0;
  for (const r of results) {
    const notes = [
      r.qualityFiltered > 0 ? `${r.qualityFiltered} filtré(s) qualité (1 pli ou plafond de 50 dépassé)` : null,
      r.replaced > 0 ? `${r.replaced} remplacé(s) par un .override.json` : null,
      r.excluded > 0 ? `${r.excluded} exclu(s) par un .exclude.json` : null,
      r.duplicates > 0 ? `${r.duplicates} doublon(s) d'un exercice déjà présent dans le thème` : null,
    ].filter((note) => note !== null);
    const qualityNote = notes.length > 0 ? ` dont ${notes.join(", ")}` : "";
    console.log(`  ${r.file} — ${r.built}/${r.found} importé(s)${r.skipped > 0 ? `, ${r.skipped} ignoré(s)${qualityNote}` : ""}`);
    totalBuilt += r.built;
    totalSkipped += r.skipped;
    totalQualityFiltered += r.qualityFiltered;
  }
  console.log(
    `  Total : ${totalBuilt} importé(s), ${totalSkipped} ignoré(s)${totalQualityFiltered > 0 ? ` (dont ${totalQualityFiltered} filtré(s) qualité)` : ""}.`,
  );
}

/**
 * Phase 1 + 2 du run (voir le docstring de fichier) : purge des fichiers du
 * run, parse global, exclusions, overrides, filtre qualité, insertion. En
 * `--dry-run`, rien n'est écrit — même calcul, compté au lieu d'inséré.
 */
async function runImportPass(files: readonly string[], exclusions: Exclusions, dryRun: boolean): Promise<FileResult[]> {
  // Phase 1 : purger TOUS les fichiers avant de réinsérer le moindre — jamais
  // entrelacé fichier par fichier.
  if (!dryRun) for (const file of files) await purgeAcademyFile(file);

  // Phase 2 : parser TOUS les fichiers d'abord — le filtre qualité doit voir,
  // PAR THÈME, tout ce que ce run apporte avant de décider quoi garder.
  // Les `*.override.json` remplacent toute autre source pour leurs thèmes —
  // y compris l'exercice de démonstration, à retirer AVANT de mesurer le
  // résidu en base (sinon il amputerait le budget du filtre qualité).
  const { files: unexcludedFiles, excludedByFile } = applyExclusions(await parseAllFiles(files), exclusions.importKeys);
  const { files: overriddenFiles, overrideThemeIds, replacedByFile } = applyOverrides(unexcludedFiles);
  if (!dryRun) await purgeDemoRowsOf(overrideThemeIds);
  // Après la purge de phase 1 et des démos : ne restent que les lignes qui survivent au run.
  const runFiles = new Set(files);
  const survivingKeys = new Set(
    (await selectAllPuzzleRows()).filter((row) => row.sourceFile == null || !runFiles.has(row.sourceFile)).map(rowKey),
  );
  const { files: parsedFiles, duplicatesByFile } = applyDeduplication(overriddenFiles, survivingKeys);
  // Résidu déjà en base pour les thèmes filtrés qualité (ex. l'exercice de
  // démonstration curaté, `sourceFile: null`, jamais purgé ci-dessus) — mesuré
  // uniquement pour un run réel (la purge de phase 1 doit avoir déjà eu lieu,
  // voir `countExistingByTheme`) ; un `--dry-run` n'a rien purgé, un budget
  // plein (50) reste la meilleure approximation pour l'aperçu.
  const preExistingByTheme = dryRun ? new Map<string, number>() : await countExistingByTheme([...QUALITY_FILTERED_THEME_IDS]);
  const { kept, qualityFilteredByFile } = applyQualityFilter(parsedFiles, preExistingByTheme);
  const builtByFile = dryRun ? countByFile(kept) : await insertKeptDrafts(kept);

  return parsedFiles.map((pf) => ({
    file: pf.file,
    found: pf.found,
    built: builtByFile.get(pf.file) ?? 0,
    skipped:
      pf.skipped +
      (qualityFilteredByFile.get(pf.file) ?? 0) +
      (replacedByFile.get(pf.file) ?? 0) +
      (excludedByFile.get(pf.file) ?? 0) +
      (duplicatesByFile.get(pf.file) ?? 0),
    qualityFiltered: qualityFilteredByFile.get(pf.file) ?? 0,
    replaced: replacedByFile.get(pf.file) ?? 0,
    excluded: excludedByFile.get(pf.file) ?? 0,
    duplicates: duplicatesByFile.get(pf.file) ?? 0,
  }));
}

/** Résumé du réaudit pour la console — les listes d'échecs complètes vont dans le journal JSON. */
function reauditSummary(report: ReauditReport) {
  return {
    clean: report.clean,
    rows: report.rows,
    verdictCounts: report.verdictCounts,
    tolerated: report.verdictCounts.toleree ?? 0,
    unauditedThemes: report.unauditedThemes,
    structuralErrors: report.structuralErrors.length,
    uniquenessFailures: report.uniquenessFailures.length,
    themeErrors: report.themeErrors,
    deficitThemes: report.deficitThemes.length,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(
      [
        "Usage: npm run db:seed-academy -- [options]",
        "",
        "  --only=<fichier>   Ne traite qu'un seul fichier (.pgn ou .json) de data/import/academy/.",
        "  --dry-run          Parse et affiche le résultat sans rien écrire en base.",
        "  --audit-only       Réaudit flash seul de la base actuelle (aucune écriture de puzzle).",
        "  --no-stockfish     Le réaudit ne calcule pas les lignes sans verdict (erreur « non auditée »).",
        "",
        "Lit data/import/academy/*.pgn et *.json — voir data/import/README.md.",
        "100% hors-ligne, idempotent (purge par fichier source avant réinsertion).",
        "Filtre qualité (thèmes tactiques/motifs de mat, sauf Mat en 1) : rejette les",
        "exercices à 1 pli et plafonne à 50/thème, priorité sacrifice puis Elo.",
        "Un fichier *.override.json remplace toute autre source pour les thèmes qu'il couvre.",
        "Un fichier *.exclude.json retire des exercices précis (solution non unique), physiquement.",
        "Run réel : sauvegarde de la base, progression conservée, réaudit flash final.",
      ].join("\n"),
    );
    return;
  }

  await ensureCurriculumSeeded();

  const started = Date.now();
  const stamp = timestamp();

  if (options.auditOnly) {
    const report = await flashReaudit({ stamp, stockfish: !options.noStockfish });
    await mkdir(LOG_DIR, { recursive: true });
    const logFile = join(LOG_DIR, `reaudit-${stamp}.json`);
    await writeFile(logFile, JSON.stringify(report, null, 2) + "\n");
    console.log(JSON.stringify({ step: "5-reaudit", ...reauditSummary(report), logFile }, null, 2));
    if (!report.clean) process.exitCode = 1;
    return;
  }

  const files = await listAcademyFiles(options.only);

  if (options.dryRun) {
    printSummary(await runImportPass(files, await loadExclusions(), true));
    console.log(`\n(dry-run, rien écrit en base) en ${Date.now() - started} ms.`);
    return;
  }

  const log: Record<string, unknown>[] = [];
  const record = (entry: Record<string, unknown>) => {
    log.push(entry);
    console.log(JSON.stringify(entry, null, 2));
  };

  // Étape 1 — sauvegarde, puis instantané de ce que la progression a déjà franchi.
  const backup = backupDatabase(stamp);
  const initialRows = await selectAllPuzzleRows();
  record({ step: "1-sauvegarde", backup, rows: initialRows.length, castlingDefects: castlingDefects(initialRows) });
  const snapshot = await snapshotProgress();

  let report: ReauditReport | null = null;
  for (let pass = 1; pass <= MAX_SEED_PASSES; pass += 1) {
    const exclusions = await loadExclusions();

    // Étape 2 — purge physique des lignes exclues, AVANT la phase 1 de
    // `runImportPass` : le journal compte ainsi chaque import faux/ambigu
    // réellement supprimé, pas seulement ceux hors run.
    const purge = await purgeExcludedRows(exclusions);
    record({ step: "2-purge", pass, importKeys: exclusions.importKeys.size, masterKeys: exclusions.masterKeys.size, ...purge });

    // Étape 3 — injection, masters, roques, ordre, totaux, progression.
    const results = await runImportPass(files, exclusions, false);
    const masters = syncMasterRows();
    const castlingFixed = await sanitizeStoredCastling();
    const renumbered = await renumberOrderIndexes();
    // Toujours sur TOUS les thèmes du catalogue — voir `recalculateAllThemeTotals`.
    await recalculateAllThemeTotals();
    const progressChanges = await restoreProgress(snapshot);
    printSummary(results);
    record({
      step: "3-injection",
      pass,
      imported: results.reduce((sum, r) => sum + r.built, 0),
      excludedAtImport: results.reduce((sum, r) => sum + r.excluded, 0),
      replacedByOverride: results.reduce((sum, r) => sum + r.replaced, 0),
      duplicatesDropped: results.reduce((sum, r) => sum + r.duplicates, 0),
      mastersUpdated: masters.updated.length,
      mastersAbsent: masters.absent,
      castlingFixedInPlace: castlingFixed,
      castlingDefectsLeft: castlingDefects(await selectAllPuzzleRows()).rows,
      orderIndexRenumbered: renumbered,
      progressPreserved: snapshot.length,
      progressChanges,
    });

    // Étapes 4-5 — réaudit flash (la tolérance force brute est dans `classifyRow`).
    report = await flashReaudit({ stamp: `${stamp}-p${pass}`, stockfish: !options.noStockfish });
    record({ step: "5-reaudit", pass, ...reauditSummary(report) });
    if (report.clean) break;
    const added = await appendAutoExclusions(report.uniquenessFailures);
    record({ step: "5-exclusion-auto", pass, added, file: AUTO_EXCLUDE_FILE });
    if (added === 0) break;
  }

  await mkdir(LOG_DIR, { recursive: true });
  const logFile = join(LOG_DIR, `seed-academy-${stamp}.json`);
  await writeFile(logFile, JSON.stringify({ backup, steps: log, finalReport: report }, null, 2) + "\n");
  console.log(`\nJournal : ${logFile}`);
  if (!report?.clean) {
    process.exitCode = 1;
    console.error(`Réaudit NON propre — détail dans le journal. Restauration possible depuis ${backup}.`);
  }
  console.log(`Terminé en ${Date.now() - started} ms.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .then(() => process.exit(process.exitCode ?? 0))
    .catch((cause) => {
      console.error(cause);
      process.exit(1);
    });
}
