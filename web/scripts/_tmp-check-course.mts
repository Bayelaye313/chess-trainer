// Vérifie un cours : chaque nœud (hors racine) a un commentaire ; écrit chaque chapitre en PGN pour la sonde.
import { writeFileSync, mkdirSync } from "node:fs";
import { COURSE_TREES } from "@/core/curriculum/course-tree";
import type { ChessMoveNode } from "@/core/chess/move-tree";
const [id, outDir] = process.argv.slice(2);
const tree = COURSE_TREES[id];
mkdirSync(outDir, { recursive: true });
let missing = 0, total = 0;
function walk(n: ChessMoveNode, path: string) {
  for (const c of n.children) { total++; if (!c.comment) { missing++; console.log(`SANS COMMENTAIRE: ${path} ${c.san}`); } walk(c, `${path} ${c.san}`); }
}
function pgn(n: ChessMoveNode): string {
  const parts: string[] = [];
  let node = n;
  while (node.children.length) {
    const [main, ...vars] = node.children;
    parts.push(main.san!);
    for (const v of vars) parts.push(`(${[v.san, pgn(v)].join(" ")})`);
    node = main;
  }
  return parts.join(" ");
}
tree.chapters.forEach((ch, i) => {
  walk(ch.root, `[${i + 1}]`);
  writeFileSync(`${outDir}/c${String(i + 1).padStart(2, "0")}.pgn`, `[FEN "${ch.root.fen}"]\n\n${pgn(ch.root)} *\n`);
  console.log(`${i + 1}. ${ch.title} — ${ch.root.comment ? "intro ok" : "PAS D'INTRO"}`);
});
console.log(`${total - missing}/${total} coups commentés`);
