import { OP_RUY_LOPEZ } from "@/core/curriculum/course-trees/op-ruy-lopez";
import type { ChessMoveNode } from "@/core/chess/move-tree";
const walk = (n: ChessMoveNode, ch: string, parent?: ChessMoveNode) => {
  if (n.san && /^(Na5|d4|Re1|b5|Nxf2|Bb3|axb3|Nxb3|Qxd4|exd4|Nxd4|d4|Bc2|a3|Nf6)$/.test(n.san) && ch.match(/Ferm|Ouverte|Anti-p/))
    console.log(ch.slice(0, 12), n.ply, n.san, n.evaluationScore, "parent", parent?.san, parent?.evaluationScore, "| hints", (n as any).hints?.length ?? 0);
  for (const c of n.children) walk(c, ch, n);
};
for (const ch of OP_RUY_LOPEZ.chapters) walk(ch.root, ch.title);
