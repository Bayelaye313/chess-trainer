// Sonde rapide : une analyse multipv par nœud (éval après le coup + 3 meilleures réponses).
// usage: node --import tsx scripts/_tmp-lean-probe.mts <fichier.pgn> [profondeur=14]
import { readFileSync } from "node:fs";
import { Chess } from "chess.js";
import { MOVE_TREE_START_FEN, parseMoveTree, type ChessMoveNode } from "@/core/chess/move-tree";
import { startEngine, whitePawns, type Line } from "./_tmp-sf-native.mjs";
const [path, depthArg] = process.argv.slice(2);
const DEPTH = Number(depthArg ?? 14);
const sf = await startEngine({ multipv: 3 });
const fmt = (l: Line | undefined, turn: "w" | "b") => { const p = whitePawns(l, turn); if (p === null) return "?"; if (Math.abs(p) > 50) return `#`; return `${p >= 0 ? "+" : ""}${p.toFixed(2)}`; };
const pv = (f: string, m: string[], n = 6) => { const c = new Chess(f), o: string[] = []; for (const u of m.slice(0, n)) { try { o.push(c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san); } catch { break; } } return o.join(" "); };
async function walk(parent: ChessMoveNode, indent: string, skipTo: number) {
  for (const [i, child] of parent.children.entries()) {
    const turn = child.fen.split(" ")[1] as "w" | "b";
    const num = Math.ceil(child.ply / 2) + (turn === "b" ? "." : "...");
    if (child.ply >= skipTo || i > 0) {
      const ls = await sf.analyse(child.fen, DEPTH);
      console.log(`${indent}${i > 0 ? "(" : ""}${num}${child.san} => ${fmt(ls[0], turn)} | ${ls.map((l) => `${pv(child.fen, l.pv, 1)} ${fmt(l, turn)}`).join(" | ")} || ${pv(child.fen, ls[0]?.pv ?? [])}`);
    }
    await walk(child, i > 0 ? indent + "  " : indent, skipTo);
  }
}
const text = readFileSync(path, "utf8");
await walk(parseMoveTree(text.trim(), MOVE_TREE_START_FEN), "", 16);
sf.quit();
