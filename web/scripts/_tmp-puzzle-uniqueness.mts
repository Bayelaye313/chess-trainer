// Audit jetable : pour chaque puzzle des catégories pédagogiques, vérifie à chaque coup du
// solveur que la solution est le meilleur coup ET le seul (écart avec le 2e meilleur coup).
//   node --import tsx scripts/_tmp-puzzle-uniqueness.mts <out.jsonl> [depth=16]   (SHARD=i/n)
import { appendFileSync } from "node:fs";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { Chess } from "chess.js";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");
const BIN = "C:/Users/ab.gueye/Downloads/stockfish-windows-x86-64-avx2/stockfish/stockfish-windows-x86-64-avx2.exe";
const [outPath, depthArg] = process.argv.slice(2);
const DEPTH = Number(depthArg ?? 16);
const CATS = (process.env.CATS ?? "positional_mastery,jesper_hall_course,middlegame,pawn_structures,pawn_weaknesses,endgame_mastery").split(",");
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(",")) : null;

const db = new Database("data/chess-trainer.db", { readonly: true });
const rows = db
  .prepare(
    `select p.id, p.theme_id, p.order_index, p.fen, p.solution_san, p.source_ref from curriculum_puzzles p
     join curriculum_themes t on t.id = p.theme_id where t.category in (${CATS.map(() => "?").join(",")})
     order by t.category, t.order_index, p.order_index`,
  )
  .all(...CATS)
  .filter((r: any) => !ONLY || ONLY.has(r.theme_id));
const [shard, shards] = (process.env.SHARD ?? "0/1").split("/").map(Number);
const mine = rows.filter((_: unknown, i: number) => i % shards === shard);

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
send("setoption name MultiPV value 2");
w = until((l) => l === "readyok");
send("isready");
await w;

type S = { kind: "cp" | "mate"; v: number; move: string } | null;
async function analyse(fen: string, searchmoves?: string): Promise<{ l1: S; l2: S }> {
  const lines = new Map<number, S>();
  const done = until(
    (l) => l.startsWith("bestmove"),
    (l) => {
      const m = l.match(/ multipv (\d+) .*?score (cp|mate) (-?\d+).* pv (\S+)/);
      if (m) lines.set(+m[1], { kind: m[2] as "cp" | "mate", v: +m[3], move: m[4] });
    },
  );
  send(`position fen ${fen}`);
  send(`go depth ${DEPTH} movetime 8000${searchmoves ? ` searchmoves ${searchmoves}` : ""}`);
  await done;
  return { l1: lines.get(1) ?? null, l2: lines.get(2) ?? null };
}

for (const r of mine as any[]) {
  const sans: string[] = JSON.parse(r.solution_san);
  const c = new Chess(r.fen);
  const plies: unknown[] = [];
  let error: string | null = null;
  for (let i = 0; i < sans.length; i++) {
    const fen = c.fen();
    let mv;
    try {
      mv = c.move(sans[i]);
    } catch {
      error = `illegal ${sans[i]} @${i}`;
      break;
    }
    if (i % 2 === 1) continue; // réponse adverse imposée
    const uci = mv.from + mv.to + (mv.promotion ?? "");
    const legal = new Chess(fen).moves().length;
    const { l1, l2 } = await analyse(fen);
    let sol: S = l1?.move === uci ? l1 : l2?.move === uci ? l2 : null;
    if (!sol) sol = (await analyse(fen, uci)).l1;
    plies.push({ i, san: sans[i], uci, legal, best: l1, second: l2, sol });
  }
  appendFileSync(outPath, JSON.stringify({ id: r.id, theme: r.theme_id, idx: r.order_index, fen: r.fen, sans, ref: (r.source_ref ?? "").slice(0, 90), error, plies }) + "\n");
}
send("quit");
console.log(`shard ${shard}/${shards}: ${mine.length} puzzles`);
