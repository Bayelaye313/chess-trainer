// Liste les commentaires identiques dans un cours (règle : un commentaire unique par coup).
import { COURSE_TREES } from "@/core/curriculum/course-tree";
import type { ChessMoveNode } from "@/core/chess/move-tree";
const seen = new Map<string, string[]>();
function walk(n: ChessMoveNode, ch: number) { for (const c of n.children) { const k = (c.comment ?? "").trim(); seen.set(k, [...(seen.get(k) ?? []), `ch${ch} ${Math.ceil(c.ply / 2)}${c.ply % 2 ? "." : "..."}${c.san}`]); walk(c, ch); } }
COURSE_TREES[process.argv[2]].chapters.forEach((c, i) => walk(c.root, i + 1));
for (const [k, v] of seen) if (v.length > 1) console.log(v.join(", "), "=>", k.slice(0, 80));
