import "server-only";

/**
 * Importateur GÉANT pour des dumps PGN de pièges trouvés en ligne (ex. un
 * fichier massif type « Chess Trap Pro » récupéré par l'utilisateur) — voir
 * `data/import/README.md#import-en-masse-brut` pour le contexte complet de
 * cette décision : `npm run db:seed-pgn` reste la voie « contenu écrit/vérifié
 * à la main » (`data/import/traps/*.pgn`, nos tags déjà présents) ; celui-ci
 * est la voie « contenu brut, tags propriétaires absents, categories bruitées
 * (parfois abîmées par un scraping/OCR) » — voir `buildBulkTrapFromGame` dans
 * `core/curriculum/traps-parser.ts`.
 *
 * ## Pourquoi un DOSSIER séparé (`data/import/traps/bulk-raw/`) plutôt que
 * `data/import/traps/` directement, malgré la demande initiale
 *
 * `db:seed-pgn` fait un `readdir` PLAT (non récursif) de `data/import/traps/`
 * et traite CHAQUE `.pgn` qu'il y trouve avec `buildTrapFromGame`. Si ce
 * script scannait le même dossier, un fichier massif y atterrirait aussi dans
 * le champ de `db:seed-pgn` — les deux scripts partagent la même clé de purge
 * idempotente (`sourceFile` = nom du fichier, voir le docstring de
 * `seed-from-pgn.ts`), donc lancer l'un puis l'autre sur le même fichier
 * écraserait systématiquement le travail du premier (mauvais tags, ou pire,
 * suppression silencieuse). Un sous-dossier dédié, qu'un `readdir` non
 * récursif ignore nativement, élimine ce risque sans toucher au script
 * existant ni à ses tests. Déposez vos gros fichiers PGN bruts dans
 * `data/import/traps/bulk-raw/` — jamais directement dans `data/import/traps/`.
 *
 * Usage :
 *   npm run db:import-traps
 *   npm run db:import-traps -- --only=database-traps.pgn
 *   npm run db:import-traps -- --dry-run
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Chess } from "chess.js";
import { eq } from "drizzle-orm";
import { moveInputFromUci } from "@/core/analysis/evaluate-move";
import { buildBulkTrapFromGame, parsePgnGames, type LinearFallbackRefutationResolver } from "@/core/curriculum/traps-parser";
import { getNodeStockfishAnalyser } from "@/server/engine/node-stockfish-analyser";
import { db } from "@/server/db";
import { importedTraps, type NewImportedTrap } from "@/server/db/schema";

const BULK_TRAPS_DIR = join(process.cwd(), "data/import/traps/bulk-raw");

/**
 * Le repli « ligne linéaire » (voir `LinearFallbackRefutationResolver` dans
 * `traps-parser.ts`) n'interroge le moteur QU'UNE SEULE FOIS par partie (une
 * position, pas toute la partie à analyser coup par coup) — on peut donc se
 * permettre une recherche plus profonde que `IMPORT_ANALYSIS_DEPTH` (12, réglé
 * pour analyser des centaines de positions par partie synchronisée, voir
 * `server/import/constants.ts`) sans que le volume total ne devienne
 * ingérable.
 */
const BULK_TRAP_REFUTATION_DEPTH = 16;

/**
 * Construit le résolveur injecté dans `buildBulkTrapFromGame` — la seule
 * source fiable pour `refutationMoves[0]` quand un PGN brut n'a pas de
 * variation RAV exploitable (voir `validateLinearFallbackTrap` dans
 * `traps-parser.ts` : le dernier coup du PGN est la punition RÉELLE de
 * l'adversaire, jamais un coup licite pour la victime depuis la position
 * critique). Instance moteur PARTAGÉE (singleton, voir
 * `node-stockfish-analyser.ts`) — un seul appelant à la fois, garanti par la
 * file d'attente interne de l'analyseur.
 */
function makeLinearFallbackResolver(): LinearFallbackRefutationResolver {
  const analyser = getNodeStockfishAnalyser();
  return async (fen, trapMoveSan) => {
    const evaluation = await analyser.analyse(fen, { depth: BULK_TRAP_REFUTATION_DEPTH });
    if (!evaluation.bestMoveUci) return null;
    const board = new Chess(fen);
    try {
      return board.move(moveInputFromUci(evaluation.bestMoveUci)).san;
    } catch {
      // Coup UCI illisible depuis `fen` — ne devrait jamais arriver (le moteur a lui-même reçu
      // cette position), filet de sécurité plutôt qu'un crash de tout l'import.
      return null;
    }
  };
}

interface ImportOptions {
  only?: string;
  dryRun?: boolean;
}

interface FileResult {
  file: string;
  gamesFound: number;
  built: number;
  skipped: number;
  families: Set<string>;
}

/** `[]` si le dossier n'existe pas encore — un dossier `bulk-raw/` absent n'est jamais une erreur, juste « rien à importer pour l'instant ». */
async function listPgnFiles(only?: string): Promise<string[]> {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await readdir(BULK_TRAPS_DIR, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".pgn"))
    .map((entry) => entry.name)
    .filter((name) => !only || name === only)
    .sort();
}

/**
 * `sourceFile` stocké préfixé de `bulk-raw/` — distinct de la simple valeur
 * `<nom-de-fichier>` que `seed-from-pgn.ts` écrit pour `data/import/traps/*.pgn`,
 * pour qu'un fichier au même nom déposé par erreur dans les deux dossiers ne
 * partage jamais la même clé de purge idempotente.
 */
function sourceKeyFor(file: string): string {
  return `bulk-raw/${file}`;
}

export async function importBulkTrapsFile(
  file: string,
  dryRun: boolean,
  resolveLinearFallbackRefutation: LinearFallbackRefutationResolver,
): Promise<FileResult> {
  const text = await readFile(join(BULK_TRAPS_DIR, file), "utf8");
  const games = parsePgnGames(text);
  const rows: NewImportedTrap[] = [];
  const families = new Set<string>();
  let skipped = 0;
  const createdAt = new Date();
  const sourceFile = sourceKeyFor(file);

  for (const game of games) {
    // Séquentiel, jamais Promise.all : l'analyseur Stockfish partagé (singleton, voir
    // node-stockfish-analyser.ts) ne traite qu'une recherche à la fois de toute façon — paralléliser
    // ici n'accélérerait rien, seulement le sens de lecture des logs.
    const trap = await buildBulkTrapFromGame(game, { idPrefix: sourceFile, resolveLinearFallbackRefutation });
    if (!trap) {
      skipped += 1;
      console.warn(
        `  ⚠ ${file} — ignoré (aucune variante RAV ni repli linéaire exploitable, coup illégal, ou le moteur n'a rien trouvé de mieux que la gaffe) : ${game.tags.Event ?? "(sans [Event])"}`,
      );
      continue;
    }
    families.add(trap.family);
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
      sourceFile,
      createdAt,
    });
  }

  if (!dryRun) {
    await db.delete(importedTraps).where(eq(importedTraps.sourceFile, sourceFile));
    if (rows.length > 0) await db.insert(importedTraps).values(rows);
  }

  return { file, gamesFound: games.length, built: rows.length, skipped, families };
}

function parseArgs(argv: string[]): ImportOptions & { help?: boolean } {
  const options: ImportOptions & { help?: boolean } = {};
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg.startsWith("--only=")) options.only = arg.slice("--only=".length);
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(
      [
        "Usage: npm run db:import-traps -- [options]",
        "",
        "  --only=<fichier.pgn>   Ne traite qu'un seul fichier.",
        "  --dry-run              Parse et affiche le résultat sans rien écrire en base.",
        "",
        "Lit data/import/traps/bulk-raw/*.pgn — dumps PGN bruts (ex. Chess Trap Pro,",
        "365Chess, ChessTempo, « 700 Opening Traps » de Bill Wall) sans nos tags",
        "propriétaires. [Difficulty]/[Hint]/[Commentary] absents sont calculés",
        "automatiquement, et [Site]/[Opening] brut (\"Famille, Sous-variante\") est",
        "scindé pour nos 2 niveaux de filtre /pieges — voir buildBulkTrapFromGame",
        "dans core/curriculum/traps-parser.ts. 100% hors-ligne, idempotent (purge",
        "par fichier source avant réinsertion). Une partie SANS variation RAV (la",
        "grande majorité de ces dumps : une vraie partie qui s'arrête net au coup",
        "gagnant) interroge Stockfish une fois pour trouver le coup que la victime",
        "aurait dû jouer à la place de sa gaffe — voir le repli linéaire dans",
        "traps-parser.ts. Prévoir un import plus lent qu'un simple parsing : un",
        "appel moteur par partie sans variation.",
      ].join("\n"),
    );
    return;
  }

  const dryRun = options.dryRun ?? false;
  const started = Date.now();

  const resolveLinearFallbackRefutation = makeLinearFallbackResolver();
  const files = await listPgnFiles(options.only);
  const results: FileResult[] = [];
  for (const file of files) results.push(await importBulkTrapsFile(file, dryRun, resolveLinearFallbackRefutation));

  if (results.length === 0) {
    console.log(`🗃️  Import en masse (data/import/traps/bulk-raw) : aucun fichier .pgn trouvé.`);
    console.log(`   Déposez votre fichier volumineux dans data/import/traps/bulk-raw/ puis relancez.`);
  } else {
    console.log(`\n🗃️  Import en masse (data/import/traps/bulk-raw) :`);
    let totalBuilt = 0;
    let totalSkipped = 0;
    const allFamilies = new Set<string>();
    for (const r of results) {
      console.log(`  ${r.file} — ${r.built}/${r.gamesFound} importé(s)${r.skipped > 0 ? `, ${r.skipped} ignoré(s)` : ""}`);
      totalBuilt += r.built;
      totalSkipped += r.skipped;
      for (const family of r.families) allFamilies.add(family);
    }
    console.log(`  Total : ${totalBuilt} importé(s), ${totalSkipped} ignoré(s).`);

    if (allFamilies.size > 0) {
      console.log(`\n  ${allFamilies.size} famille(s) détectée(s) via [Site]/[Opening] (à relire — un nom bruité/OCR-cassé donnera un dossier bruité) :`);
      for (const family of Array.from(allFamilies).sort()) console.log(`    - ${family}`);
    }
  }

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
