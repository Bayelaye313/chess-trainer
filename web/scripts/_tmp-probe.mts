// Sonde d'annotation : pour chaque coup d'un PGN (variantes comprises), l'évaluation Stockfish
// avant/après, le meilleur coup, les 3 candidats avec leur suite, et le rang du coup joué.
// usage: npx tsx scripts/_tmp-probe.ts <fichier.pgn | -> [profondeur=18]   (FEN via [FEN "..."])
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { Chess } from "chess.js";
import { MOVE_TREE_START_FEN, parseMoveTree, type ChessMoveNode } from "@/core/chess/move-tree";

const require = createRequire(import.meta.url);
const [path, depthArg] = process.argv.slice(2);
const DEPTH = Number(depthArg ?? 18);
const text = readFileSync(path === "-" ? 0 : path, "utf8");
const fen = text.match(/^\[FEN "([^"]*)"\]/m)?.[1] ?? MOVE_TREE_START_FEN;
const body = text.replace(/^\[.*\]\s*$/gm, "").trim();

const fetchBackup = globalThis.fetch;
const sf = await require("stockfish")("lite-single");
if (!globalThis.fetch) globalThis.fetch = fetchBackup;
type Line = { kind: string; v: number; pv: string[] };
const wait = (pred: (l: string) => unknown) => new Promise<unknown>((res) => { sf.listener = (l: string) => { const r = pred(l); if (r !== undefined) { sf.listener = null; res(r); } }; });
const cmd = (c: string, p: (l: string) => unknown) => { const w = wait(p); sf.sendCommand(c); return w; };
await cmd("uci", (l) => (l === "uciok" ? true : undefined));
sf.sendCommand("setoption name MultiPV value 3");
await cmd("isready", (l) => (l === "readyok" ? true : undefined));

const cache = new Map<string, Line[]>();
async function analyse(f: string): Promise<Line[]> {
  if (cache.has(f)) return cache.get(f)!;
  await cmd("isready", (l) => (l === "readyok" ? true : undefined));
  const lines = new Map<number, Line>();
  const done = wait((l) => {
    const m = l.match(/ multipv (\d+) .*?score (cp|mate) (-?\d+).* pv (.+)$/);
    if (m) lines.set(+m[1], { kind: m[2], v: +m[3], pv: m[4].split(" ") });
    return l.startsWith("bestmove") ? true : undefined;
  });
  sf.sendCommand(`position fen ${f}`);
  sf.sendCommand(`go depth ${DEPTH}`);
  await done;
  const out = [...lines.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]);
  cache.set(f, out);
  return out;
}
/** Score POV Blancs, lisible. */
function fmt(l: Line | undefined, turn: "w" | "b"): string {
  if (!l) return "?";
  const s = turn === "w" ? l.v : -l.v;
  return l.kind === "mate" ? `#${s}` : `${s >= 0 ? "+" : ""}${(s / 100).toFixed(2)}`;
}
function pvSan(f: string, pv: string[], n = 6): string {
  const c = new Chess(f), out: string[] = [];
  for (const u of pv.slice(0, n)) { try { out.push(c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san); } catch { break; } }
  return out.join(" ");
}
async function walk(parent: ChessMoveNode, depth: number) {
  for (const [i, child] of parent.children.entries()) {
    const turn = parent.fen.split(" ")[1] as "w" | "b";
    const before = await analyse(parent.fen);
    const after = await analyse(child.fen);
    const num = Math.ceil(child.ply / 2) + (turn === "w" ? "." : "...");
    const rank = before.findIndex((l) => l.pv[0] === child.uci);
    const best = before[0] ? new Chess(parent.fen).move({ from: before[0].pv[0].slice(0, 2), to: before[0].pv[0].slice(2, 4), promotion: before[0].pv[0][4] }).san : "?";
    const pad = "  ".repeat(depth) + (i > 0 ? "(var) " : "");
    const afterTurn = child.fen.split(" ")[1] as "w" | "b";
    console.log(`${pad}${num}${child.san}  éval après ${fmt(after[0], afterTurn)}  | avant ${fmt(before[0], turn)}, meilleur ${best}${rank === 0 ? " ✓" : rank > 0 ? ` (joué = n°${rank + 1})` : " (joué hors top 3)"}`);
    console.log(`${pad}    candidats : ${before.map((l) => `${pvSan(parent.fen, l.pv, 1)} ${fmt(l, turn)} [${pvSan(parent.fen, l.pv)}]`).join(" ; ")}`);
    if (child.comment) console.log(`${pad}    source : ${child.comment.slice(0, 200)}`);
    await walk(child, depth + (i > 0 ? 1 : 0));
  }
}
const root = parseMoveTree(body, fen);
console.log(`FEN ${fen}\n  position : ${(await analyse(fen)).map((l) => `${pvSan(fen, l.pv, 1)} ${fmt(l, fen.split(" ")[1] as "w" | "b")} [${pvSan(fen, l.pv)}]`).join(" ; ")}`);
await walk(root, 0);
process.exit(0);
