// Sonde native : pour chaque coup d'un PGN (variantes comprises) l'éval après le coup, le meilleur
// coup de la position d'avant avec sa suite, les candidats et le rang du coup joué.
// usage: node --import tsx scripts/_tmp-probe-native.mts <fichier.pgn> [profondeur=20]
import { readFileSync } from "node:fs";
import { Chess } from "chess.js";
import { MOVE_TREE_START_FEN, parseMoveTree, type ChessMoveNode } from "@/core/chess/move-tree";
import { startEngine, whitePawns, type Line } from "./_tmp-sf-native.mjs";

const [path, depthArg] = process.argv.slice(2);
const DEPTH = Number(depthArg ?? 20);
const text = readFileSync(path, "utf8");
const fen = text.match(/^\[FEN "([^"]*)"\]/m)?.[1] ?? MOVE_TREE_START_FEN;
const body = text.replace(/^\[.*\]\s*$/gm, "").trim();
const sf = await startEngine();

const fmt = (l: Line | undefined, turn: "w" | "b") => {
  const p = whitePawns(l, turn);
  if (p === null) return "?";
  if (Math.abs(p) > 50) return `#${p > 0 ? 100 - p : -100 - p}`;
  return `${p >= 0 ? "+" : ""}${p.toFixed(2)}`;
};
function pvSan(f: string, pv: string[], n = 8): string {
  const c = new Chess(f), out: string[] = [];
  for (const u of pv.slice(0, n)) { try { out.push(c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san); } catch { break; } }
  return out.join(" ");
}
async function walk(parent: ChessMoveNode, indent: string) {
  for (const [i, child] of parent.children.entries()) {
    const turn = parent.fen.split(" ")[1] as "w" | "b";
    const before = await sf.analyse(parent.fen, DEPTH);
    const after = await sf.analyse(child.fen, DEPTH);
    const num = Math.ceil(child.ply / 2) + (turn === "w" ? "." : "...");
    const rank = before.findIndex((l) => l.pv[0] === child.uci);
    const cands = before.map((l) => `${pvSan(parent.fen, l.pv, 1)} ${fmt(l, turn)}`).join(" | ");
    const nextTurn = turn === "w" ? "b" : "w";
    console.log(`${indent}${i > 0 ? "(" : ""}${num}${child.san} => ${fmt(after[0], nextTurn)}  [rang ${rank < 0 ? "hors top3" : rank + 1}; top: ${cands}]  suite: ${pvSan(child.fen, after[0]?.pv ?? [])}`);
    await walk(child, i > 0 ? indent + "  " : indent);
  }
}
await walk(parseMoveTree(body, fen), "");
sf.quit();
