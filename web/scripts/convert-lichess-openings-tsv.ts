import "server-only";

/**
 * Convertit les fichiers `.tsv` de https://github.com/lichess-org/chess-openings
 * (CC0 — domaine public, voir son README) en fichiers `.pgn` prêts pour
 * `data/import/openings/` (voir `data/import/README.md` et
 * `scripts/seed-from-pgn.ts`).
 *
 * GitHub (`github.com`/`raw.githubusercontent.com`) n'est pas atteignable
 * depuis cet environnement (bloqué au niveau infrastructure, indépendamment
 * du réseau d'entreprise évoqué dans la conversation) — ce script ne
 * TÉLÉCHARGE donc rien lui-même. Récupérez les fichiers `a.tsv` à `e.tsv` du
 * dépôt (clone, ou téléchargement direct des fichiers bruts) sur une machine
 * qui atteint github.com, déposez-les n'importe où localement, puis lancez :
 *
 *   npm run db:convert-lichess -- --input=chemin/vers/dossier-tsv --output=data/import/openings
 *
 * Le format exact des colonnes n'a pas pu être vérifié en direct (même
 * blocage réseau) — la détection de colonnes ci-dessous est donc VOLONTAIREMENT
 * tolérante (plusieurs noms de colonnes acceptés, recherche insensible à la
 * casse) plutôt que figée sur un schéma supposé. Si aucune colonne de coups
 * n'est trouvée, le fichier est signalé et ignoré plutôt que de produire un
 * PGN vide silencieusement.
 *
 * Ce script ne fait AUCUNE validation chess.js lui-même (hormis un filet de
 * sécurité minimal ci-dessous) — c'est `npm run db:seed-pgn`
 * (`buildOpeningLineFromGame`) qui rejoue et valide réellement chaque ligne à
 * l'étape suivante ; une ligne malformée ici est simplement ignorée là-bas,
 * jamais une position à moitié fiable en base.
 */
import { Chess } from "chess.js";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, basename, extname } from "node:path";
import { pathToFileURL } from "node:url";

interface ColumnMap {
  eco: number;
  name: number;
  moves: number;
  /** `true` si la colonne de coups contient de l'UCI (`e2e4`) plutôt que du SAN (`e4`) — détecté à la volée sur la première ligne de données. */
  isUci: boolean;
}

const ECO_ALIASES = ["eco"];
const NAME_ALIASES = ["name", "opening", "opening_name", "title"];
const MOVES_ALIASES = ["pgn", "moves", "moves_san", "san", "line"];
const UCI_ALIASES = ["uci", "moves_uci"];

function findColumn(header: string[], aliases: string[]): number {
  const lower = header.map((h) => h.trim().toLowerCase());
  for (const alias of aliases) {
    const idx = lower.indexOf(alias);
    if (idx !== -1) return idx;
  }
  return -1;
}

function resolveColumns(header: string[]): ColumnMap | null {
  const eco = findColumn(header, ECO_ALIASES);
  const name = findColumn(header, NAME_ALIASES);
  let moves = findColumn(header, MOVES_ALIASES);
  let isUci = false;
  if (moves === -1) {
    moves = findColumn(header, UCI_ALIASES);
    isUci = moves !== -1;
  }
  if (eco === -1 || name === -1 || moves === -1) return null;
  return { eco, name, moves, isUci };
}

/** Convertit une liste de coups UCI (`e2e4 g8f6 ...`) en SAN, en rejouant chaque coup avec chess.js — un coup illégal interrompt et renvoie `null` (ligne ignorée). */
function uciToSan(uciMoves: string[]): string[] | null {
  const chess = new Chess();
  const sanMoves: string[] = [];
  for (const uci of uciMoves) {
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length > 4 ? uci.slice(4) : undefined;
    try {
      const move = chess.move({ from, to, promotion });
      sanMoves.push(move.san);
    } catch {
      return null;
    }
  }
  return sanMoves;
}

/** Numérote une liste SAN en movetext PGN standard (`1. e4 e5 2. Nf3 ...`). */
function toNumberedMovetext(sanMoves: string[]): string {
  const parts: string[] = [];
  sanMoves.forEach((san, i) => {
    if (i % 2 === 0) parts.push(`${i / 2 + 1}.`);
    parts.push(san);
  });
  return parts.join(" ");
}

function toPgnGame(name: string, eco: string, sanMoves: string[]): string {
  const escapedName = name.replace(/"/g, "'");
  return [
    `[Event "${escapedName}"]`,
    `[Site "Lichess Chess Openings (CC0 — github.com/lichess-org/chess-openings)"]`,
    `[ECO "${eco || "A00"}"]`,
    "",
    `${toNumberedMovetext(sanMoves)} *`,
  ].join("\n");
}

interface ConvertResult {
  file: string;
  rows: number;
  converted: number;
  skipped: number;
}

async function convertFile(inputPath: string, outputDir: string): Promise<ConvertResult> {
  const text = await readFile(inputPath, "utf8");
  const lines = text.split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length === 0) return { file: basename(inputPath), rows: 0, converted: 0, skipped: 0 };

  const header = lines[0].split("\t");
  const columns = resolveColumns(header);
  if (!columns) {
    console.warn(`  ⚠ ${basename(inputPath)} — colonnes reconnues introuvables (attendu: eco/name/pgn|uci), fichier ignoré.`);
    return { file: basename(inputPath), rows: lines.length - 1, converted: 0, skipped: lines.length - 1 };
  }

  const games: string[] = [];
  let skipped = 0;

  for (const line of lines.slice(1)) {
    const cols = line.split("\t");
    const eco = cols[columns.eco]?.trim() ?? "";
    const name = cols[columns.name]?.trim() ?? "";
    const rawMoves = cols[columns.moves]?.trim() ?? "";
    if (!rawMoves) {
      skipped += 1;
      continue;
    }

    const sanMoves = columns.isUci
      ? uciToSan(rawMoves.split(/\s+/))
      : rawMoves.split(/\s+/).map((tok) => tok.replace(/^\d+\.(\.\.)?/, "")).filter(Boolean);

    if (!sanMoves || sanMoves.length === 0) {
      skipped += 1;
      continue;
    }

    games.push(toPgnGame(name, eco, sanMoves));
  }

  await mkdir(outputDir, { recursive: true });
  const outputPath = join(outputDir, `lichess-${basename(inputPath, extname(inputPath))}.pgn`);
  await writeFile(outputPath, games.join("\n\n\n") + "\n", "utf8");

  return { file: basename(inputPath), rows: lines.length - 1, converted: games.length, skipped };
}

function parseArgs(argv: string[]): { input?: string; output: string; help?: boolean } {
  const options: { input?: string; output: string; help?: boolean } = { output: "data/import/openings" };
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg.startsWith("--input=")) options.input = arg.slice("--input=".length);
    else if (arg.startsWith("--output=")) options.output = arg.slice("--output=".length);
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help || !options.input) {
    console.log(
      [
        "Usage: npm run db:convert-lichess -- --input=<dossier ou fichier .tsv> [--output=data/import/openings]",
        "",
        "Convertit les .tsv de lichess-org/chess-openings (CC0) en .pgn pour data/import/openings/.",
        "Téléchargez d'abord a.tsv..e.tsv depuis github.com/lichess-org/chess-openings (non atteignable ici).",
        "Puis lancez : npm run db:seed-pgn pour les importer réellement en base (validation chess.js incluse).",
      ].join("\n"),
    );
    return;
  }

  const inputStat = await readdir(options.input, { withFileTypes: true }).catch(() => null);
  const files = inputStat
    ? inputStat.filter((e) => e.isFile() && e.name.endsWith(".tsv")).map((e) => join(options.input!, e.name))
    : [options.input];

  if (files.length === 0) {
    console.error(`Aucun fichier .tsv trouvé dans ${options.input}`);
    process.exitCode = 1;
    return;
  }

  const results: ConvertResult[] = [];
  for (const file of files) results.push(await convertFile(file, options.output));

  console.log(`\nRésultat (→ ${options.output}) :`);
  let totalConverted = 0;
  for (const r of results) {
    console.log(`  ${r.file} — ${r.converted}/${r.rows} converti(s)${r.skipped > 0 ? `, ${r.skipped} ignoré(s)` : ""}`);
    totalConverted += r.converted;
  }
  console.log(`\n${totalConverted} ligne(s) d'ouverture converties. Lancez maintenant : npm run db:seed-pgn`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .then(() => process.exit(0))
    .catch((cause) => {
      console.error(cause);
      process.exit(1);
    });
}
