import "server-only";

/**
 * Ingestion PGN en masse, 100% hors-ligne — lit tous les fichiers
 * `data/import/openings/*.pgn` et `data/import/traps/*.pgn`, valide CHAQUE
 * coup avec chess.js (`core/curriculum/traps-parser.ts`), et bulk-insère le
 * résultat dans `imported_opening_lines`/`imported_traps` (voir
 * `server/db/schema/traps.ts`). Aucun appel réseau, aucune dépendance à
 * l'API Lichess — voir `data/import/README.md` pour le format PGN attendu et
 * la convention « variante = piège ».
 *
 * Une partie dont le moindre coup est illégal, ou qui ne contient rien
 * d'exploitable (pas de variante pour un piège), est IGNORÉE avec un
 * avertissement — jamais insérée à moitié, jamais de crash qui interromprait
 * le reste du fichier.
 *
 * Idempotent : purge d'abord toutes les lignes déjà importées d'un fichier
 * source donné (`sourceFile` = son nom, colonne indexée) avant de réinsérer —
 * même patron que `populate-puzzles.ts#populateThemes` : relancer le script
 * sur un fichier mis à jour, ou plusieurs fois de suite, ne duplique jamais
 * rien.
 *
 * Usage :
 *   npm run db:seed-pgn
 *   npm run db:seed-pgn -- --only=starter-traps.pgn
 *   npm run db:seed-pgn -- --dry-run
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { eq } from "drizzle-orm";
import { buildOpeningLineFromGame, buildTrapFromGame, parsePgnGames } from "@/core/curriculum/traps-parser";
import { db } from "@/server/db";
import { importedOpeningLines, importedTraps, type NewImportedOpeningLine, type NewImportedTrap } from "@/server/db/schema";

const TRAPS_DIR = join(process.cwd(), "data/import/traps");
const OPENINGS_DIR = join(process.cwd(), "data/import/openings");

interface SeedOptions {
  only?: string;
  dryRun?: boolean;
}

interface FileResult {
  file: string;
  gamesFound: number;
  built: number;
  skipped: number;
}

/** `[]` si le dossier n'existe pas encore — un dossier d'import absent n'est jamais une erreur, juste « rien à faire ». */
async function listPgnFiles(dir: string, only?: string): Promise<string[]> {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".pgn"))
    .map((entry) => entry.name)
    .filter((name) => !only || name === only)
    .sort();
}

export async function seedTrapsFile(file: string, dryRun: boolean): Promise<FileResult> {
  const text = await readFile(join(TRAPS_DIR, file), "utf8");
  const games = parsePgnGames(text);
  const rows: NewImportedTrap[] = [];
  let skipped = 0;
  const createdAt = new Date();

  for (const game of games) {
    const trap = buildTrapFromGame(game, { idPrefix: file });
    if (!trap) {
      skipped += 1;
      console.warn(`  ⚠ ${file} — ignoré (pas de variante exploitable, ou coup illégal) : ${game.tags.Event ?? "(sans [Event])"}`);
      continue;
    }
    rows.push({
      id: trap.id,
      name: trap.name,
      family: trap.family,
      gambit: trap.gambit,
      eco: trap.eco,
      victimSide: trap.victimSide,
      difficulty: trap.difficulty,
      summary: trap.summary,
      setupMoves: [...trap.setupMoves],
      trapMove: trap.trapMove,
      trapExplanation: trap.trapExplanation,
      hint: trap.hint,
      refutationMoves: [...trap.refutationMoves],
      outcome: trap.outcome,
      commentary: trap.comments,
      sourceFile: file,
      createdAt,
    });
  }

  if (!dryRun) {
    await db.delete(importedTraps).where(eq(importedTraps.sourceFile, file));
    if (rows.length > 0) await db.insert(importedTraps).values(rows);
  }

  return { file, gamesFound: games.length, built: rows.length, skipped };
}

export async function seedOpeningsFile(file: string, dryRun: boolean): Promise<FileResult> {
  const text = await readFile(join(OPENINGS_DIR, file), "utf8");
  const games = parsePgnGames(text);
  const rows: NewImportedOpeningLine[] = [];
  let skipped = 0;
  const createdAt = new Date();

  for (const game of games) {
    const line = buildOpeningLineFromGame(game, { idPrefix: file });
    if (!line) {
      skipped += 1;
      console.warn(`  ⚠ ${file} — ignoré (coup illégal) : ${game.tags.Event ?? "(sans [Event])"}`);
      continue;
    }
    rows.push({ id: line.id, name: line.name, family: line.family, eco: line.eco, moves: line.moves, sourceFile: file, createdAt });
  }

  if (!dryRun) {
    await db.delete(importedOpeningLines).where(eq(importedOpeningLines.sourceFile, file));
    if (rows.length > 0) await db.insert(importedOpeningLines).values(rows);
  }

  return { file, gamesFound: games.length, built: rows.length, skipped };
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

function printSummary(label: string, results: FileResult[]): void {
  if (results.length === 0) {
    console.log(`${label} : aucun fichier .pgn trouvé.`);
    return;
  }
  console.log(`\n${label} :`);
  let totalBuilt = 0;
  let totalSkipped = 0;
  for (const r of results) {
    console.log(`  ${r.file} — ${r.built}/${r.gamesFound} importé(s)${r.skipped > 0 ? `, ${r.skipped} ignoré(s)` : ""}`);
    totalBuilt += r.built;
    totalSkipped += r.skipped;
  }
  console.log(`  Total : ${totalBuilt} importé(s), ${totalSkipped} ignoré(s).`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(
      [
        "Usage: npm run db:seed-pgn -- [options]",
        "",
        "  --only=<fichier.pgn>   Ne traite qu'un seul fichier (dans les deux dossiers).",
        "  --dry-run              Parse et affiche le résultat sans rien écrire en base.",
        "",
        "Lit data/import/openings/*.pgn et data/import/traps/*.pgn — voir data/import/README.md.",
        "100% hors-ligne, idempotent (purge par fichier source avant réinsertion).",
      ].join("\n"),
    );
    return;
  }

  const dryRun = options.dryRun ?? false;
  const started = Date.now();

  const trapFiles = await listPgnFiles(TRAPS_DIR, options.only);
  const trapResults: FileResult[] = [];
  for (const file of trapFiles) trapResults.push(await seedTrapsFile(file, dryRun));

  const openingFiles = await listPgnFiles(OPENINGS_DIR, options.only);
  const openingResults: FileResult[] = [];
  for (const file of openingFiles) openingResults.push(await seedOpeningsFile(file, dryRun));

  printSummary("⚔️  Pièges (data/import/traps)", trapResults);
  printSummary("📖 Ouvertures (data/import/openings)", openingResults);

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
