// Contrôle d'un cours côté Noirs : coups noirs qui font MONTER l'éval blanche de plus de SEUIL, et coups noirs sans [%csl]/[%cal].
// usage: node --import tsx scripts/_tmp-check-black.mts <module.ts> [seuil=0.4]
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import type { ChessMoveNode } from "@/core/chess/move-tree";
import type { CourseTree } from "@/core/curriculum/course-tree";
const [file, seuilArg] = process.argv.slice(2);
const SEUIL = Number(seuilArg ?? 0.4);
const mod = await import(pathToFileURL(resolve(file)).href);
const tree = Object.values(mod).find((v) => (v as CourseTree)?.chapters) as CourseTree;
const score = (n: ChessMoveNode) => n.evaluationMate === 0 ? (n.fen.split(" ")[1] === "b" ? 50 : -50) : n.evaluationMate !== null ? (n.evaluationMate > 0 ? 50 : -50) : n.evaluationScore ?? 0;
for (const ch of tree.chapters) {
  const walk = (node: ChessMoveNode, line: string[]) => {
    for (const child of node.children) {
      const l = [...line, child.san!];
      if (child.ply % 2 === 0) {
        const d = score(child) - score(node);
        if (d > SEUIL) console.log(`[NOIR +${d.toFixed(2)}] ${ch.title.slice(0, 30)} : ${l.slice(-5).join(" ")}`);
        if (!child.arrows.length && !child.highlights.length) console.log(`[SANS VISUEL] ${ch.title.slice(0, 30)} : ${l.slice(-4).join(" ")}`);
      }
      walk(child, l);
    }
  };
  walk(ch.root, []);
}
