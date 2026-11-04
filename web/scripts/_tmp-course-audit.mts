// Audit d'un cours : fautes à indices (perte >= 0.5 pour le camp adverse), 3 indices sans préfixe,
// coups du camp de l'élève qui perdent > 0.5 (hors variantes piégées), profondeur max des chapitres théoriques.
// usage: node --import tsx scripts/_tmp-course-audit.mts <op-id> <w|b>
import { collectNodes, type ChessMoveNode } from "@/core/chess/move-tree";
import type { CourseTree } from "@/core/curriculum/course-tree";
const [id, side] = process.argv.slice(2);
const mod = await import(`@/core/curriculum/course-trees/${id}`);
const tree = Object.values(mod).find((v): v is CourseTree => !!v && typeof v === "object" && "chapters" in v)!;
const sc = (n: ChessMoveNode) => n.evaluationMate !== null && n.evaluationMate !== undefined ? (n.evaluationMate === 0 ? (n.fen.split(" ")[1] === "b" ? 50 : -50) : n.evaluationMate > 0 ? 50 : -50) : n.evaluationScore ?? 0;
let faults = 0, problems = 0;
for (const ch of tree.chapters) {
  const parent = new Map<ChessMoveNode, ChessMoveNode>();
  for (const n of [ch.root, ...collectNodes(ch.root)]) for (const c of n.children) parent.set(c, n);
  let maxPly = 0, chFaults = 0, traps = 0, tips = 0;
  const surprise = ch.title.startsWith("Aléatoire");
  for (const n of collectNodes(ch.root)) {
    maxPly = Math.max(maxPly, n.ply);
    const p = parent.get(n);
    if (!p || n.san === null) continue;
    const white = n.ply % 2 === 1;
    const mover = white ? "w" : "b";
    const loss = (white ? -1 : 1) * (sc(n) - sc(p)); // perte pour le camp qui joue
    const txt = [n.comment, n.tip].filter(Boolean).join(" ");
    if (/PRO TIP/.test(txt) || n.tip) tips++;
    if (/VARIANTE PIÉGÉE/.test(txt)) traps++;
    if (n.hints.length) {
      chFaults++;
      if (n.hints.length !== 3) { problems++; console.log(`! ${ch.title} ${n.san}: ${n.hints.length} indices`); }
      if (n.hints.some((h) => /^\s*Indice/i.test(h))) { problems++; console.log(`! préfixe Indice: ${n.san}`); }
      if (mover === side) { problems++; console.log(`! indice sur un coup de l'élève ${n.san}`); }
      if (loss < 0.5) { problems++; console.log(`! ${ch.title.slice(0, 30)} ${n.san} faute à indices qui perd ${loss.toFixed(2)}`); }
    } else if (mover !== side && loss >= 0.5 && !/imprécision/i.test(txt) && p.san !== null) {
      console.log(`? ${ch.title.slice(0, 30)} ${n.ply}:${n.san} perd ${loss.toFixed(2)} sans indices`);
    }
    if (mover === side && loss > 0.5 && !/VARIANTE PIÉGÉE|…/.test(txt)) console.log(`? coup élève ${ch.title.slice(0, 30)} ${n.ply}:${n.san} perd ${loss.toFixed(2)}`);
    if (/"/.test(txt)) { problems++; console.log(`! guillemet droit ${n.san}`); }
  }
  if (!surprise && maxPly > 27) { problems++; console.log(`! ${ch.title} : demi-coup ${maxPly} > 27`); }
  faults += chFaults;
  console.log(`${ch.title.slice(0, 60)} | fautes à indices ${chFaults} | pièges ${traps} | PRO TIP ${tips} | demi-coup max ${maxPly}`);
}
console.log(`total fautes à indices ${faults}, problèmes ${problems}, nœuds ${tree.chapters.reduce((a, c) => a + collectNodes(c.root).length, 0)}`);
