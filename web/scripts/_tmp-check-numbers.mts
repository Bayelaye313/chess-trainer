import { OP_SCOTCH_GAME } from "@/core/curriculum/course-trees/op-scotch-game";
import { collectNodes } from "@/core/chess/move-tree";
for (const ch of OP_SCOTCH_GAME.chapters) for (const n of collectNodes(ch.root)) {
  const txt = `${n.comment ?? ""} ${n.tip ?? ""}`;
  const nums = txt.match(/[+-]\d+\.\d+/g);
  if (nums && n.san) console.log(`${ch.title.slice(0, 14)} | ${n.san} eval=${n.evaluationScore ?? "#" + n.evaluationMate} | cité: ${nums.join(" ")}`);
}
