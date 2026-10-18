// Affiche l'arbre d'un cours généré avec l'éval de chaque nœud (pour citer les chiffres des nœuds).
// usage: node --import tsx scripts/_tmp-dump-evals.mts op-<id>
import type { ChessMoveNode } from "@/core/chess/move-tree";
import type { CourseTree } from "@/core/curriculum/course-tree";
const mod = await import(`@/core/curriculum/course-trees/${process.argv[2]}`);
const tree = Object.values(mod).find((v): v is CourseTree => !!v && typeof v === "object" && "chapters" in v)!;
const ev = (n: ChessMoveNode) => (n.evaluationMate !== null ? `#${n.evaluationMate}` : n.evaluationScore?.toFixed(2));
tree.chapters.forEach((ch, i) => {
  console.log(`\n## ${i + 1}. ${ch.title}`);
  const walk = (node: ChessMoveNode, ind: string) => {
    let n = node; const parts: string[] = [];
    while (n.children.length) {
      const [m, ...vs] = n.children;
      parts.push(`${Math.ceil(m.ply / 2)}${m.ply % 2 ? "." : "..."}${m.san}(${ev(m)})`);
      for (const v of vs) { console.log(ind + parts.join(" ")); parts.length = 0; console.log(`${ind}  ( ${Math.ceil(v.ply / 2)}${v.ply % 2 ? "." : "..."}${v.san}(${ev(v)})`); walk(v, ind + "    "); }
      n = m;
    }
    if (parts.length) console.log(ind + parts.join(" "));
  };
  walk(ch.root, "");
});
