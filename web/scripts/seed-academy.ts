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
 * Usage :
 *   npm run db:seed-academy
 *   npm run db:seed-academy -- --only=checkmate-patterns.pgn
 *   npm run db:seed-academy -- --dry-run
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { count, eq, inArray, max } from "drizzle-orm";
import {
  buildAcademyPuzzleFromGame,
  buildAcademyPuzzleFromJsonEntry,
  type AcademyJsonEntry,
  type AcademyPuzzleDraft,
} from "@/core/curriculum/academy-parser";
import { QUALITY_FILTERED_THEME_IDS, QUALITY_FILTER_MAX_PUZZLES } from "@/core/curriculum/catalog";
import { parsePgnGames } from "@/core/curriculum/traps-parser";
import { db } from "@/server/db";
import { curriculumPuzzles, curriculumThemes, type NewCurriculumPuzzle } from "@/server/db/schema";
import { ensureCurriculumSeeded } from "@/server/queries/curriculum";

const ACADEMY_DIR = join(process.cwd(), "data/import/academy");

interface SeedOptions {
  only?: string;
  dryRun?: boolean;
}

interface FileResult {
  file: string;
  found: number;
  built: number;
  skipped: number;
  /** Sous-ensemble de `skipped` écarté par le filtre qualité (voir le docstring de fichier), jamais par une erreur de parsing/légalité. */
  qualityFiltered: number;
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
    .filter((name) => !only || name === only)
    .sort();
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
  const touchedThemes: string[] = [];
  for (const [themeId, items] of itemsByTheme) {
    touchedThemes.push(themeId);
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

  for (const themeId of touchedThemes) {
    // Compte RÉEL de lignes, jamais `max(orderIndex)+1` — voir le docstring
    // de fichier : ce dernier peut dépasser le compte réel si l'orderIndex a
    // des trous (thème alimenté par plusieurs fichiers).
    const [{ total } = { total: 0 }] = await db
      .select({ total: count() })
      .from(curriculumPuzzles)
      .where(eq(curriculumPuzzles.themeId, themeId));
    await db.update(curriculumThemes).set({ totalPuzzles: total }).where(eq(curriculumThemes.id, themeId));
  }

  return builtByFile;
}

function parseArgs(argv: string[]): SeedOptions & { help?: boolean } {
  const options: SeedOptions & { help?: boolean } = {};
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--dry-run") options.dryRun = true;
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
    const qualityNote = r.qualityFiltered > 0 ? ` dont ${r.qualityFiltered} filtré(s) qualité (1 pli ou plafond de 50 dépassé)` : "";
    console.log(`  ${r.file} — ${r.built}/${r.found} importé(s)${r.skipped > 0 ? `, ${r.skipped} ignoré(s)${qualityNote}` : ""}`);
    totalBuilt += r.built;
    totalSkipped += r.skipped;
    totalQualityFiltered += r.qualityFiltered;
  }
  console.log(
    `  Total : ${totalBuilt} importé(s), ${totalSkipped} ignoré(s)${totalQualityFiltered > 0 ? ` (dont ${totalQualityFiltered} filtré(s) qualité)` : ""}.`,
  );
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
        "",
        "Lit data/import/academy/*.pgn et *.json — voir data/import/README.md.",
        "100% hors-ligne, idempotent (purge par fichier source avant réinsertion).",
        "Filtre qualité (thèmes tactiques/motifs de mat, sauf Mat en 1) : rejette les",
        "exercices à 1 pli et plafonne à 50/thème, priorité sacrifice puis Elo.",
      ].join("\n"),
    );
    return;
  }

  await ensureCurriculumSeeded();

  const dryRun = options.dryRun ?? false;
  const started = Date.now();

  const files = await listAcademyFiles(options.only);

  // Phase 1 (voir le docstring de fichier) : purger TOUS les fichiers avant
  // de réinsérer le moindre — jamais entrelacé fichier par fichier.
  if (!dryRun) for (const file of files) await purgeAcademyFile(file);

  // Phase 2 : parser TOUS les fichiers d'abord — le filtre qualité (voir le
  // docstring de fichier) doit voir, PAR THÈME, tout ce que ce run apporte
  // avant de décider quoi garder, jamais fichier par fichier.
  const parsedFiles = await parseAllFiles(files);
  // Résidu déjà en base pour les thèmes filtrés qualité (ex. l'exercice de
  // démonstration curaté, `sourceFile: null`, jamais purgé ci-dessus) — mesuré
  // uniquement pour un run réel (la purge de phase 1 doit avoir déjà eu lieu,
  // voir `countExistingByTheme`) ; un `--dry-run` n'a rien purgé, un budget
  // plein (50) reste la meilleure approximation pour l'aperçu.
  const preExistingByTheme = dryRun ? new Map<string, number>() : await countExistingByTheme([...QUALITY_FILTERED_THEME_IDS]);
  const { kept, qualityFilteredByFile } = applyQualityFilter(parsedFiles, preExistingByTheme);
  const builtByFile = dryRun ? countByFile(kept) : await insertKeptDrafts(kept);

  const results: FileResult[] = parsedFiles.map((pf) => ({
    file: pf.file,
    found: pf.found,
    built: builtByFile.get(pf.file) ?? 0,
    skipped: pf.skipped + (qualityFilteredByFile.get(pf.file) ?? 0),
    qualityFiltered: qualityFilteredByFile.get(pf.file) ?? 0,
  }));

  printSummary(results);
  console.log(`\n${dryRun ? "(dry-run, rien écrit en base)" : "Terminé"} en ${Date.now() - started} ms.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .then(() => process.exit(0))
    .catch((cause) => {
      console.error(cause);
      process.exit(1);
    });
}
