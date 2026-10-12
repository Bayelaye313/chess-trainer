// Dump ligne principale + FEN de parties Chernev choisies (par numéro).
// usage: node --import tsx scripts/_tmp-m910-dump.mts <pgn> <n...>   (env ALL=1 : FEN à chaque coup)
import { readFileSync } from "node:fs";
import { parseMoveTree, mainLine, MOVE_TREE_START_FEN } from "@/core/chess/move-tree";
const t = readFileSync(process.argv[2], "utf8");
const want = process.argv.slice(3).map(Number);
const games = t.split(/(?=\[Event )/).filter((g) => g.trim());
for (const n of want) {
  const g = games[n - 1];
  const hdr = (k: string) => (g.split("\n").find((l) => l.startsWith(`[${k} `)) ?? "").split('"')[1];
  let body = g.replace(/^\[.*\]\s*$/gm, "").replace(/\{[^}]*\}/g, (c) => c.replace(/[()]/g, " ")).trim();
  for (let prev = ""; prev !== body; ) { prev = body; body = body.replace(/\([^()]*\)/g, " "); }
  const nodes = mainLine(parseMoveTree(body, MOVE_TREE_START_FEN));
  console.log(`\n## ${n} ${hdr("White")} - ${hdr("Black")} ${hdr("Date")} ${hdr("Result")} (${nodes.length - 1} plies)`);
  let line = "";
  for (let i = 1; i < nodes.length; i++) {
    const nd = nodes[i];
    const mv = Math.ceil(nd.ply / 2);
    line += (nd.ply % 2 ? `${mv}.` : "") + nd.san + " ";
    const c = (nd.comment ?? "").replace(/\s+/g, " ");
    if (process.env.ALL || /open file|seventh|7th|second rank|file/i.test(c))
      line += `\n   [${mv}${nd.ply % 2 ? "w" : "b"}] ${c.slice(0, 200)}\n   FEN ${nd.fen}\n`;
  }
  console.log(line);
}
