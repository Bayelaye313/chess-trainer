// Extrait les lignes moteur (premier enfant de chaque nœud à variantes) d'un cours, en PGN à sonder.
import { writeFileSync } from "node:fs";
import { COURSE_TREES } from "@/core/curriculum/course-tree";
import type { ChessMoveNode } from "@/core/chess/move-tree";
const [id, out] = process.argv.slice(2);
let n = 0;
function walk(node: ChessMoveNode, ch: number) {
  if (node.children.length > 1) {
    const sans: string[] = []; let cur = node.children[0];
    while (cur) { sans.push(cur.san!); if (cur.children.length > 1 || sans.length >= 6) break; cur = cur.children[0]; }
    writeFileSync(`${out}/s${String(++n).padStart(2, "0")}-ch${ch}.pgn`, `[FEN "${node.fen}"]\n\n${sans.join(" ")} *\n`);
  }
  node.children.forEach((c) => walk(c, ch));
}
COURSE_TREES[id].chapters.forEach((c, i) => walk(c.root, i + 1));
console.log(n, "segments");
