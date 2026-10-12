// Contrôle d'un cours généré : signale les coups BLANCS qui font chuter l'éval de plus de SEUIL pion
// (une réplique « recommandée » qui serait une erreur) et liste les grosses fautes noires.
// usage: node --import tsx scripts/_tmp-check-evals.mts <module.ts> [seuil=0.5]
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import type { ChessMoveNode } from "@/core/chess/move-tree";
import type { CourseTree } from "@/core/curriculum/course-tree";

const [file, seuilArg] = process.argv.slice(2);
const SEUIL = Number(seuilArg ?? 0.5);
const mod = await import(pathToFileURL(resolve(file)).href);
const tree = Object.values(mod).find((v) => (v as CourseTree)?.chapters) as CourseTree;
const score = (n: ChessMoveNode) =>
  n.evaluationMate === 0 ? (n.fen.split(" ")[1] === "b" ? 50 : -50) : n.evaluationMate !== null ? (n.evaluationMate > 0 ? 50 : -50) : n.evaluationScore ?? 0;
for (const ch of tree.chapters) {
  const walk = (node: ChessMoveNode, line: string[]) => {
    for (const child of node.children) {
      const l = [...line, child.san!];
      const delta = score(child) - score(node);
      const white = child.ply % 2 === 1;
      if (node.san !== null && white && delta < -SEUIL) console.log(`[BLANC ${delta.toFixed(2)}] ${ch.title} : ${l.slice(-6).join(" ")} (${score(node)} -> ${score(child)})`);
      if (node.san !== null && !white && delta > 1.5) console.log(`  (faute noire +${delta.toFixed(2)}) ${l.slice(-4).join(" ")}`);
      walk(child, l);
    }
  };
  walk(ch.root, []);
}
