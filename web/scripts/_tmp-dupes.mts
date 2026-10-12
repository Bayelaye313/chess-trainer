import { COURSE_TREES } from "@/core/curriculum/course-tree";
import type { ChessMoveNode } from "@/core/chess/move-tree";
const seen = new Map<string, string[]>();
COURSE_TREES[process.argv[2]].chapters.forEach((ch, i) => {
  const walk = (n: ChessMoveNode) => { for (const c of n.children) { const k = (c.comment ?? "").trim(); seen.set(k, [...(seen.get(k) ?? []), `${i + 1}:${c.san}`]); walk(c); } };
  walk(ch.root);
});
for (const [k, v] of seen) if (v.length > 1) console.log(JSON.stringify(k), v.join(" "));
