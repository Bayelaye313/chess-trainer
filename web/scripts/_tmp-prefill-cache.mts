// Pré-remplit le cache d'évals d'un cours à partir des caches des autres cours : seulement les FEN identiques à profondeur 16.
// usage: node --import tsx scripts/_tmp-prefill-cache.mts <source.pgn> <op-id.ts>
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { collectNodes, parseMoveTree } from "@/core/chess/move-tree";
const [src, out] = process.argv.slice(2);
const target = join(tmpdir(), `${out}.evalcache.json`);
const cache: Record<string, string> = existsSync(target) ? JSON.parse(readFileSync(target, "utf8")) : {};
const others: Record<string, string> = {};
for (const f of readdirSync(tmpdir()).filter((f) => f.endsWith(".evalcache.json") && f !== `${out}.evalcache.json`))
  Object.assign(others, JSON.parse(readFileSync(join(tmpdir(), f), "utf8")));
const fens = new Set<string>();
for (const block of readFileSync(src, "utf8").split(/^## /m).slice(1)) {
  const root = parseMoveTree(block.slice(block.indexOf("\n") + 1).trim());
  for (const n of [root, ...collectNodes(root)]) fens.add(n.fen);
}
let copied = 0;
for (const fen of fens) { const k = `${fen}|16`; if (!cache[k] && others[k]) { cache[k] = others[k]; copied++; } }
writeFileSync(target, JSON.stringify(cache));
console.log(`${fens.size} positions, ${copied} reprises d'autres cours, ${Object.keys(cache).length} en cache`);
