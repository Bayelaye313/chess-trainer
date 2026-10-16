// Contrôle : chaque chiffre cité dans un commentaire du cours Ruy Lopez == l'évaluation d'un nœud.
// Un chiffre est OK s'il égale (à l'arrondi cité) l'éval du nœud, de son parent, ou d'un nœud du
// chapitre dont le coup est cité dans le commentaire (« 10.c3 », « 8...c5 »). Sinon : ÉCART, avec
// mention des coups cités qui n'existent pas comme nœud.
import { OP_RUY_LOPEZ } from "@/core/curriculum/course-trees/op-ruy-lopez";
import { collectNodes, type ChessMoveNode } from "@/core/chess/move-tree";

const close = (cited: string, v: number | null) => {
  if (v === null) return false;
  const dec = cited.split(".")[1].length;
  return Math.abs(Number(cited.replace("+", "")) - v) <= 0.5 * 10 ** -dec + 1e-9;
};
let ok = 0;
const gaps: string[] = [];
for (const ch of OP_RUY_LOPEZ.chapters) {
  const nodes = collectNodes(ch.root);
  const parentOf = new Map<ChessMoveNode, ChessMoveNode>();
  for (const n of [ch.root, ...nodes]) for (const c of n.children) parentOf.set(c, n);
  for (const n of [...new Set([ch.root, ...nodes])]) {
    const txt = [n.comment, n.tip, ...(n.hints ?? [])].filter(Boolean).join(" ");
    const nums = txt.match(/(?<![\w.])[+-]?\d+\.\d+(?![\w.])/g)?.filter((x) => !/^\d+\.\d$/.test(x) || /[+-]/.test(x) || true) ?? [];
    // refs « 10.c3 » / « 8...c5 » -> nœuds du chapitre
    const refs = [...txt.matchAll(/(\d+)\.(\.\.)?\s?([KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?|O-O(?:-O)?)/g)];
    const refNodes: ChessMoveNode[] = [];
    const missing: string[] = [];
    for (const r of refs) {
      const ply = (Number(r[1]) - 1) * 2 + (r[2] ? 2 : 1);
      const san = r[3].replace(/[+#]$/, "");
      const hit = nodes.filter((m) => m.ply === ply && m.san?.replace(/[+#]$/, "") === san);
      if (hit.length) refNodes.push(...hit);
      else missing.push(r[0]);
    }
    const label = `${ch.title.slice(0, 24)} | ${n.san ? `${Math.ceil(n.ply / 2)}${n.ply % 2 ? "." : "..."}${n.san}` : "(intro)"} [nœud ${n.evaluationScore}]`;
    for (const x of nums) {
      if (!/[+-]/.test(x) && !/\d\.\d{2}$/.test(x)) continue; // « 1.5 » sans signe : pas une éval
      const p = parentOf.get(n);
      const cands = [n, p, ...(p?.children ?? []), ...refNodes].filter(Boolean) as ChessMoveNode[];
      const m = cands.find((c) => close(x, c.evaluationScore));
      if (m) { ok++; continue; }
      gaps.push(`${label} : ${x} ne correspond à aucun nœud (parent ${p?.evaluationScore ?? "-"}${refNodes.length ? ", cités " + refNodes.map((r) => r.san + "=" + r.evaluationScore).join(" ") : ""})${missing.length ? " ; coups cités sans nœud : " + missing.join(", ") : ""}`);
    }
  }
}
console.log(`${ok} chiffres conformes, ${gaps.length} écart(s)`);
for (const g of gaps) console.log("- " + g);
