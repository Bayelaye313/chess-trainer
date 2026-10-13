// MultiPV 5 sur chaque coup du solveur des puzzles listés (ids), pour calculer
// les coups équivalents acceptés par le solveur (voir build-alternatives.mjs).
//   node --import tsx scripts/academy-mining/analyse-alternatives.mts <ids.json> <out.jsonl> [depth=16]   (SHARD=i/n)
import { appendFileSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { Chess } from "chess.js";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");
const BIN = "C:/Users/ab.gueye/Downloads/stockfish-windows-x86-64-avx2/stockfish/stockfish-windows-x86-64-avx2.exe";
const [idsPath, outPath, depthArg] = process.argv.slice(2);
const DEPTH = Number(depthArg ?? 16);
const ids: string[] = JSON.parse(readFileSync(idsPath, "utf8"));
const [shard, shards] = (process.env.SHARD ?? "0/1").split("/").map(Number);
const mine = ids.filter((_, i) => i % shards === shard);
const db = new Database("data/chess-trainer.db", { readonly: true });
const get = db.prepare("select id, theme_id, fen, solution, solution_san from curriculum_puzzles where id = ?");

const proc = spawn(BIN, [], { stdio: ["pipe", "pipe", "inherit"] });
const rl = createInterface({ input: proc.stdout });
let listener: ((l: string) => void) | null = null;
rl.on("line", (l) => listener?.(l));
const send = (c: string) => proc.stdin.write(c + "\n");
const until = (pred: (l: string) => boolean, on?: (l: string) => void) =>
  new Promise<void>((res) => {
    listener = (l) => {
      on?.(l);
      if (pred(l)) {
        listener = null;
        res();
      }
    };
  });
let w = until((l) => l === "uciok");
send("uci");
await w;
send("setoption name Threads value 1");
send("setoption name Hash value 64");
send("setoption name MultiPV value 5");
w = until((l) => l === "readyok");
send("isready");
await w;

type S = { kind: "cp" | "mate"; v: number; move: string };
async function analyse(fen: string, searchmoves?: string): Promise<S[]> {
  const lines = new Map<number, S>();
  const done = until(
    (l) => l.startsWith("bestmove"),
    (l) => {
      const m = l.match(/ multipv (\d+) .*?score (cp|mate) (-?\d+).* pv (\S+)/);
      if (m) lines.set(+m[1], { kind: m[2] as "cp" | "mate", v: +m[3], move: m[4] });
    },
  );
  send(`position fen ${fen}`);
  send(`go depth ${DEPTH} movetime 10000${searchmoves ? ` searchmoves ${searchmoves}` : ""}`);
  await done;
  return [...lines.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]);
}

for (const id of mine) {
  const r = get.get(id);
  if (!r) continue;
  const sol: string[] = JSON.parse(r.solution);
  const c = new Chess(r.fen);
  const plies: unknown[] = [];
  for (let i = 0; i < sol.length; i++) {
    const fen = c.fen();
    if (i % 2 === 0) {
      const lines = await analyse(fen);
      let solLine = lines.find((l) => l.move === sol[i]);
      if (!solLine) solLine = (await analyse(fen, sol[i]))[0];
      plies.push({ i, fen, sol: sol[i], solLine, lines });
    }
    c.move({ from: sol[i].slice(0, 2), to: sol[i].slice(2, 4), promotion: sol[i][4] });
  }
  appendFileSync(outPath, JSON.stringify({ id, theme: r.theme_id, fen: r.fen, solution: sol, plies }) + "\n");
}
send("quit");
