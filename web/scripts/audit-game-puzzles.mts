/**
 * Audit Stockfish 19 des puzzles tirés des parties de l'utilisateur (onglet
 * Entraîner) — le pilote des verdicts PURS de `core/puzzle/game-puzzle-audit.ts`.
 *
 * Deux étapes, séparées pour que la décision (rapide, rejouable) ne relance
 * jamais le moteur (lent) :
 *
 *   1. ANALYSE — chaque puzzle est rejoué pli par pli avec chess.js ; à chaque
 *      pli, Stockfish (profondeur 16, MultiPV 5 aux plis du solveur, 3 aux
 *      plis adverses, `searchmoves` pour le coup attendu s'il n'est pas dans
 *      la MultiPV) ; plus la position APRÈS le coup réellement joué dans la
 *      partie, pour vérifier l'accusation. Sortie JSONL, reprise possible.
 *
 *        SHARD=0/3 node --import tsx scripts/audit-game-puzzles.mts analyse <lignes.jsonl>
 *
 *   2. DÉCISION — verdicts, rapport JSON ; `--apply` écrit dans la base dans
 *      UNE transaction, après une sauvegarde `<base>.bak-<date>-pre-audit` :
 *        - PURGE physique (puzzle, carte FSRS, journal, recommandation ouverte,
 *          sélection du jour) + pierre tombale `puzzle_purges` pour que
 *          l'extraction ne recrée jamais le puzzle ;
 *        - pour les puzzles gardés : deck recalibré, suite tronquée au dernier
 *          pli forcé, coups équivalents (mats), commentaire `[%txt]` du coach,
 *          `audited_at`. Les cartes FSRS ne sont pas touchées : compteurs dûs
 *          et nouveaux suivent le deck, la progression reste intacte.
 *
 *        node --import tsx scripts/audit-game-puzzles.mts decide <lignes.jsonl> <rapport.json> [--apply]
 *
 * Règles (voir `game-puzzle-audit.ts`) — un puzzle est PURGÉ si :
 *   - la position ou la suite ne se rejoue pas avec chess.js (`illegal`) ;
 *   - le 1er coup attendu n'est pas LE coup unique le plus fort (`not-best`,
 *     `ambiguous`, `no-line`), seule tolérance : plusieurs mats forcés ;
 *   - le moteur réfute la faute : le coup joué ne perd pas au moins
 *     `ACCUSATION_MIN_DROP` points de probabilité de gain (`accusation-refuted`),
 *     ou c'était justement le coup attendu, ou il n'est pas connu.
 * Un pli ULTÉRIEUR qui n'est pas forcé (réponse adverse non tenace, coup du
 * solveur non unique) tronque la suite au dernier coup du solveur validé.
 *
 * Base : `DATABASE_PATH` (défaut `data/chess-trainer.db`). L'application exige
 * la migration 0015 (`puzzle_purges`, `puzzles.coach_comment`…) : sur une base
 * antérieure au 2026-11-04, lancer d'abord `node scripts/db-align.mjs`.
 * Moteur : `SF_BIN` (défaut : Stockfish 19 de ~/.local/stockfish-dl), `SF_HASH`.
 * `ONLY_UNAUDITED=1` : ne reprend que les puzzles jamais audités (nouvelles parties).
 */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { Chess } from "chess.js";
import {
  buildGameErrorComment,
  flipLine,
  isAccusationRefuted,
  isForcedMateFor,
  isForcedReply,
  judgeSolverPly,
  materialSwingAlong,
  recalibrateGamePuzzleDeck,
  type EngineLine,
} from "../src/core/puzzle/game-puzzle-audit";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

const DEPTH = 16;
const SOLVER_MULTIPV = 5;
const REPLY_MULTIPV = 3;
const DB_PATH = resolve(process.cwd(), process.env.DATABASE_PATH ?? "data/chess-trainer.db");
const SF_BIN = process.env.SF_BIN ?? `${homedir()}/.local/stockfish-dl/stockfish/stockfish-linux-x86-64-universal`;

interface PuzzleRow {
  id: string;
  deck: string;
  game_id: string | null;
  move_id: number | null;
  fen_before: string;
  solution: string;
  solution_san: string;
  played_uci: string | null;
  audited_at: number | null;
  /** Propriétaire (bases multi-utilisateurs) — `null` sur une base mono-utilisateur. */
  user_id: string | null;
}

interface PlyRecord {
  i: number;
  fen: string;
  expected: string;
  lines: EngineLine[];
  /** Score du coup attendu (`searchmoves`) quand il n'est pas dans `lines`. */
  expectedLine: EngineLine | null;
}

interface AnalysisRecord {
  id: string;
  error: string | null;
  plies: PlyRecord[];
  /** Meilleure ligne après le coup joué dans la partie (POV de l'adversaire, au trait). */
  afterPlayed: EngineLine | null;
  /** Le coup joué matait : impossible d'y voir une faute. */
  playedMates: boolean;
}

function uciToMove(uci: string) {
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] };
}

function tryMove(board: Chess, uci: string): boolean {
  try {
    board.move(uciToMove(uci));
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- moteur UCI

class Engine {
  private proc = spawn(SF_BIN, [], { stdio: ["pipe", "pipe", "inherit"] });
  private listener: ((line: string) => void) | null = null;
  private multiPv = 0;

  constructor() {
    createInterface({ input: this.proc.stdout }).on("line", (line) => this.listener?.(line));
  }

  private send(command: string) {
    this.proc.stdin.write(command + "\n");
  }

  private until(predicate: (line: string) => boolean, onLine?: (line: string) => void): Promise<void> {
    return new Promise((done) => {
      this.listener = (line) => {
        onLine?.(line);
        if (predicate(line)) {
          this.listener = null;
          done();
        }
      };
    });
  }

  async init() {
    let wait = this.until((line) => line === "uciok");
    this.send("uci");
    await wait;
    this.send("setoption name Threads value 1");
    this.send(`setoption name Hash value ${process.env.SF_HASH ?? 64}`);
    wait = this.until((line) => line === "readyok");
    this.send("isready");
    await wait;
  }

  private async setMultiPv(n: number) {
    if (n === this.multiPv) return;
    this.send(`setoption name MultiPV value ${n}`);
    const wait = this.until((line) => line === "readyok");
    this.send("isready");
    await wait;
    this.multiPv = n;
  }

  /** Lignes triées (MultiPV 1 d'abord), score du point de vue du camp au trait. */
  async analyse(fen: string, multiPv: number, searchMove?: string): Promise<EngineLine[]> {
    await this.setMultiPv(multiPv);
    const lines = new Map<number, EngineLine>();
    const done = this.until(
      (line) => line.startsWith("bestmove"),
      (line) => {
        if (!line.startsWith("info") || line.includes("bound")) return;
        const match = line.match(/ multipv (\d+) .*?score (cp|mate) (-?\d+).*? pv (.+)$/);
        if (match) lines.set(Number(match[1]), { kind: match[2] as "cp" | "mate", v: Number(match[3]), pv: match[4].trim().split(/\s+/) });
      },
    );
    this.send(`position fen ${fen}`);
    this.send(`go depth ${DEPTH}${searchMove ? ` searchmoves ${searchMove}` : ""}`);
    await done;
    return [...lines.entries()].sort((a, b) => a[0] - b[0]).map(([, line]) => line);
  }

  quit() {
    this.send("quit");
  }
}

// ---------------------------------------------------------------- étape 1

async function analysePuzzle(engine: Engine, row: PuzzleRow): Promise<AnalysisRecord> {
  const record: AnalysisRecord = { id: row.id, error: null, plies: [], afterPlayed: null, playedMates: false };
  const solution: string[] = JSON.parse(row.solution);
  let board: Chess;
  try {
    board = new Chess(row.fen_before);
  } catch {
    return { ...record, error: "fen invalide" };
  }
  if (solution.length === 0) return { ...record, error: "solution vide" };

  // Coup joué dans la partie : légal ? matait-il ? sinon, meilleure réponse adverse.
  if (row.played_uci) {
    const played = new Chess(row.fen_before);
    if (!tryMove(played, row.played_uci)) return { ...record, error: `coup joué illégal ${row.played_uci}` };
    if (played.isCheckmate()) record.playedMates = true;
    else if (played.isDraw() || played.isStalemate()) record.afterPlayed = { kind: "cp", v: 0, pv: [] };
    else record.afterPlayed = (await engine.analyse(played.fen(), 1))[0] ?? null;
  }

  for (let i = 0; i < solution.length; i += 1) {
    const fen = board.fen();
    const expected = solution[i];
    const legal = board.moves({ verbose: true }).some((m) => m.from + m.to + (m.promotion ?? "") === expected);
    if (!legal) return { ...record, error: `coup ${expected} illégal au pli ${i}` };

    const solverPly = i % 2 === 0;
    const lines = await engine.analyse(fen, solverPly ? SOLVER_MULTIPV : REPLY_MULTIPV);
    const inLines = lines.some((line) => line.pv[0] === expected);
    const expectedLine = inLines ? null : ((await engine.analyse(fen, 1, expected))[0] ?? null);
    record.plies.push({ i, fen, expected, lines, expectedLine });

    // Arrêt dès le premier pli non forcé : la suite serait tronquée là de toute façon.
    const ok = solverPly ? judgeSolverPly(expected, lines, expectedLine).ok : isForcedReply(expected, lines, expectedLine);
    if (!ok) break;
    tryMove(board, expected);
    if (board.isGameOver()) break;
  }
  return record;
}

async function runAnalyse(outPath: string) {
  const db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  const rows: PuzzleRow[] = db.prepare(`SELECT ${puzzleColumns(db)} FROM puzzles WHERE source = 'local' ORDER BY created_at, id`).all();
  db.close();

  const [shard, shards] = (process.env.SHARD ?? "0/1").split("/").map(Number);
  const already = new Set(
    existsSync(outPath) ? readFileSync(outPath, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l).id) : [],
  );
  const mine = rows.filter(
    (row, index) => index % shards === shard && !already.has(row.id) && !(process.env.ONLY_UNAUDITED && row.audited_at !== null),
  );

  const engine = new Engine();
  await engine.init();
  const started = Date.now();
  for (const [index, row] of mine.entries()) {
    appendFileSync(outPath, JSON.stringify(await analysePuzzle(engine, row)) + "\n");
    if ((index + 1) % 25 === 0) {
      const perPuzzle = (Date.now() - started) / (index + 1) / 1000;
      console.log(`shard ${shard}/${shards} : ${index + 1}/${mine.length} (${perPuzzle.toFixed(1)} s/puzzle)`);
    }
  }
  engine.quit();
  console.log(`shard ${shard}/${shards} terminé : ${mine.length} puzzles analysés.`);
}

// ---------------------------------------------------------------- étape 2

type Decision =
  | { id: string; action: "purge"; reason: string; deck: string; moveId: number | null; gameId: string | null; fenBefore: string; userId: string | null }
  | {
      id: string;
      action: "keep";
      deckBefore: string;
      deck: string;
      solution: string[];
      solutionSan: string[];
      truncatedFrom: number | null;
      alternatives: string[][] | null;
      coachComment: string | null;
    };

function decide(row: PuzzleRow, record: AnalysisRecord): Decision {
  const purge = (reason: string): Decision => ({
    id: row.id,
    action: "purge",
    reason,
    deck: row.deck,
    moveId: row.move_id,
    gameId: row.game_id,
    fenBefore: row.fen_before,
    userId: row.user_id,
  });
  if (record.error) return purge(`illegal: ${record.error}`);

  const solution: string[] = JSON.parse(row.solution);
  const solutionSan: string[] = JSON.parse(row.solution_san);
  const [first] = record.plies;
  if (!first) return purge("no-line");
  const firstVerdict = judgeSolverPly(first.expected, first.lines, first.expectedLine);
  if (!firstVerdict.ok) return purge(firstVerdict.reason);

  // L'accusation : le coup joué dans la partie était-il vraiment une faute ?
  if (!row.played_uci) return purge("accusation-refuted: coup joué inconnu");
  if (row.played_uci === first.expected) return purge("accusation-refuted: coup joué = solution");
  if (record.playedMates) return purge("accusation-refuted: le coup joué matait");
  if (!record.afterPlayed) return purge("no-line");
  const expectedLine0 = first.lines.find((line) => line.pv[0] === first.expected) ?? first.expectedLine!;
  if (isAccusationRefuted(expectedLine0, record.afterPlayed)) return purge("accusation-refuted");

  // Suite : tronquée au dernier coup du solveur dont tout le chemin est forcé.
  let keep = 1;
  const alternatives: string[][] = [firstVerdict.alternatives];
  for (const ply of record.plies.slice(1)) {
    if (ply.i % 2 === 1) {
      if (!isForcedReply(ply.expected, ply.lines, ply.expectedLine)) break;
      alternatives.push([]);
      continue;
    }
    const verdict = judgeSolverPly(ply.expected, ply.lines, ply.expectedLine);
    if (!verdict.ok) break;
    alternatives.push(verdict.alternatives);
    keep = ply.i + 1;
  }
  // Une suite qui ne se termine pas sur un coup du solveur (pli adverse orphelin) est aussi tronquée.
  if (keep % 2 === 0) keep -= 1;
  const keptAlternatives = alternatives.slice(0, keep);

  const me = new Chess(row.fen_before).turn();
  const deck = recalibrateGamePuzzleDeck({
    fenBefore: row.fen_before,
    mateMissed: isForcedMateFor(expectedLine0) && !isForcedMateFor(flipLine(record.afterPlayed)),
    materialLostByPlayed: -materialSwingAlong(row.fen_before, [row.played_uci, ...record.afterPlayed.pv], me),
    materialWonByBest: materialSwingAlong(row.fen_before, expectedLine0.pv, me),
  });
  const comment = buildGameErrorComment({
    fenBefore: row.fen_before,
    playedUci: row.played_uci,
    best: expectedLine0,
    afterPlayed: record.afterPlayed,
    deck,
  });

  return {
    id: row.id,
    action: "keep",
    deckBefore: row.deck,
    deck,
    solution: solution.slice(0, keep),
    solutionSan: solutionSan.slice(0, keep),
    truncatedFrom: keep < solution.length ? solution.length : null,
    alternatives: keptAlternatives.some((list) => list.length > 0) ? keptAlternatives : null,
    coachComment: comment?.raw ?? null,
  };
}

function hasColumn(db: { prepare(sql: string): { all(): unknown[] } }, table: string, column: string): boolean {
  return (db.prepare(`PRAGMA table_info("${table}")`).all() as { name: string }[]).some((c) => c.name === column);
}

function puzzleColumns(db: { prepare(sql: string): { all(): unknown[] } }): string {
  return [
    "id, deck, game_id, move_id, fen_before, solution, solution_san, played_uci",
    hasColumn(db, "puzzles", "audited_at") ? "audited_at" : "NULL AS audited_at",
    hasColumn(db, "puzzles", "user_id") ? "user_id" : "NULL AS user_id",
  ].join(", ");
}

function hasTable(db: { prepare(sql: string): { get(...args: unknown[]): unknown } }, name: string): boolean {
  return db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(name) != null;
}

async function runDecide(inPath: string, reportPath: string, apply: boolean) {
  const records = new Map<string, AnalysisRecord>(
    readFileSync(inPath, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const record = JSON.parse(line) as AnalysisRecord;
        return [record.id, record];
      }),
  );

  const db = new Database(DB_PATH, { fileMustExist: true });
  if (apply && (!hasTable(db, "puzzle_purges") || !hasColumn(db, "puzzles", "coach_comment"))) {
    console.error("Migration 0015 absente (puzzle_purges, puzzles.coach_comment) : lancer d'abord `node scripts/db-align.mjs` (après sauvegarde).");
    process.exit(1);
  }
  const rows: PuzzleRow[] = db.prepare(`SELECT ${puzzleColumns(db)} FROM puzzles WHERE source = 'local'`).all();

  const decisions: Decision[] = [];
  let missing = 0;
  for (const row of rows) {
    const record = records.get(row.id);
    if (!record) {
      missing += 1;
      continue;
    }
    decisions.push(decide(row, record));
  }

  const purges = decisions.filter((d): d is Extract<Decision, { action: "purge" }> => d.action === "purge");
  const keeps = decisions.filter((d): d is Extract<Decision, { action: "keep" }> => d.action === "keep");
  const count = <T,>(items: T[], key: (item: T) => string) =>
    Object.fromEntries([...items.reduce((map, item) => map.set(key(item), (map.get(key(item)) ?? 0) + 1), new Map<string, number>())].sort((a, b) => b[1] - a[1]));

  const summary = {
    database: DB_PATH,
    audited: decisions.length,
    notAnalysed: missing,
    purged: purges.length,
    purgeReasons: count(purges, (d) => d.reason.replace(/:.*/, "")),
    purgedByDeck: count(purges, (d) => d.deck),
    kept: keeps.length,
    keptByDeck: count(keeps, (d) => d.deck),
    deckChanges: count(keeps.filter((d) => d.deck !== d.deckBefore), (d) => `${d.deckBefore} → ${d.deck}`),
    truncated: keeps.filter((d) => d.truncatedFrom !== null).length,
    withMateAlternatives: keeps.filter((d) => d.alternatives !== null).length,
    withCoachComment: keeps.filter((d) => d.coachComment !== null).length,
  };
  writeFileSync(reportPath, JSON.stringify({ summary, decisions }, null, 1));
  console.log(JSON.stringify(summary, null, 2));

  if (!apply) {
    console.log(`\nSimulation : rien n'est écrit. Rapport détaillé : ${reportPath}. Relancer avec --apply pour appliquer.`);
    db.close();
    return;
  }

  const backup = `${DB_PATH}.bak-${new Date().toISOString().slice(0, 10)}-pre-audit`;
  await db.backup(backup);
  console.log(`Sauvegarde : ${backup}`);

  const now = Math.floor(Date.now() / 1000);
  const purgedIds = new Set(purges.map((d) => d.id));
  // Base multi-utilisateurs : la pierre tombale appartient au propriétaire du puzzle.
  const scoped = hasColumn(db, "puzzle_purges", "user_id");
  const tombstone = db.prepare(
    scoped
      ? "INSERT OR IGNORE INTO puzzle_purges (move_id, game_id, fen_before, reason, purged_at, user_id) VALUES (?, ?, ?, ?, ?, ?)"
      : "INSERT OR IGNORE INTO puzzle_purges (move_id, game_id, fen_before, reason, purged_at) VALUES (?, ?, ?, ?, ?)",
  );
  const deleteLogs = db.prepare("DELETE FROM review_logs WHERE puzzle_id = ?");
  const deleteReview = db.prepare("DELETE FROM reviews WHERE puzzle_id = ?");
  const deleteRecommendation = db.prepare(
    "DELETE FROM training_recommendations WHERE entity_type = 'puzzle' AND entity_id = ? AND completed_at IS NULL",
  );
  const deletePuzzle = db.prepare("DELETE FROM puzzles WHERE id = ?");
  const update = db.prepare(
    `UPDATE puzzles SET deck = ?, solution = ?, solution_san = ?, alternatives = ?, coach_comment = ?, audited_at = ? WHERE id = ?`,
  );
  const dailySets = db.prepare("SELECT day, puzzle_ids FROM daily_sets").all() as { day: string; puzzle_ids: string }[];
  const updateDaily = db.prepare("UPDATE daily_sets SET puzzle_ids = ? WHERE day = ?");

  db.transaction(() => {
    for (const d of purges) {
      if (d.moveId !== null) tombstone.run(d.moveId, d.gameId, d.fenBefore, d.reason, now, ...(scoped ? [d.userId] : []));
      deleteLogs.run(d.id);
      deleteReview.run(d.id);
      deleteRecommendation.run(d.id);
      deletePuzzle.run(d.id);
    }
    for (const d of keeps) {
      update.run(
        d.deck,
        JSON.stringify(d.solution),
        JSON.stringify(d.solutionSan),
        d.alternatives ? JSON.stringify(d.alternatives) : null,
        d.coachComment,
        now,
        d.id,
      );
    }
    for (const set of dailySets) {
      const ids: string[] = JSON.parse(set.puzzle_ids);
      const kept = ids.filter((id) => !purgedIds.has(id));
      if (kept.length !== ids.length) updateDaily.run(JSON.stringify(kept), set.day);
    }
  })();
  const left = db.prepare("SELECT count(*) AS n FROM puzzles WHERE source = 'local'").get() as { n: number };
  console.log(`Appliqué : ${purges.length} puzzles purgés, ${keeps.length} mis à jour, ${left.n} puzzles de parties restants.`);
  db.close();
}

// ---------------------------------------------------------------- entrée

const [command, ...args] = process.argv.slice(2);
if (command === "analyse" && args[0]) await runAnalyse(args[0]);
else if (command === "decide" && args[0] && args[1]) await runDecide(args[0], args[1], args.includes("--apply"));
else {
  console.error(
    "Usage :\n  SHARD=i/n node --import tsx scripts/audit-game-puzzles.mts analyse <lignes.jsonl>\n  node --import tsx scripts/audit-game-puzzles.mts decide <lignes.jsonl> <rapport.json> [--apply]",
  );
  process.exit(1);
}
