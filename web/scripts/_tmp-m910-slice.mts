// Découpe un fragment de partie en PGN de chapitre ([FEN] + coups SAN numérotés), sans commentaires.
// usage: node --import tsx scripts/_tmp-m910-slice.mts <pgn> <n° partie> <début ex. 12w> <fin incluse ex. 29w> <sortie.pgn>
import { readFileSync, writeFileSync } from "node:fs";
import { parseMoveTree, mainLine, MOVE_TREE_START_FEN } from "@/core/chess/move-tree";
const [file, nArg, from, to, out] = process.argv.slice(2);
const games = readFileSync(file, "utf8").split(/(?=\[Event )/).filter((g) => g.trim());
const g = games[Number(nArg) - 1];
let body = g.replace(/^\[.*\]\s*$/gm, "").replace(/\{[^}]*\}/g, " ").trim();
for (let prev = ""; prev !== body; ) { prev = body; body = body.replace(/\([^()]*\)/g, " "); }
const plyOf = (m: string) => (Number(m.slice(0, -1)) - 1) * 2 + (m.endsWith("w") ? 1 : 2);
const nodes = [parseMoveTree(body, MOVE_TREE_START_FEN)];
nodes.push(...mainLine(nodes[0]));
const a = plyOf(from), b = plyOf(to);
let s = "";
for (let p = a; p <= b && p < nodes.length; p++) {
  const mv = Math.ceil(p / 2);
  s += p % 2 ? `${mv}. ${nodes[p].san} ` : `${p === a ? `${mv}... ` : ""}${nodes[p].san}\n`;
}
writeFileSync(out, `[FEN "${nodes[a - 1].fen}"]\n\n${s.trim()} *\n`);
console.log(out, nodes[a - 1].fen);
