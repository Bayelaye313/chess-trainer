// Contrôle standard des cours en arbre : tout chiffre cité dans un commentaire, un PRO TIP ou un
// indice doit égaler (à l'arrondi cité) l'évaluation d'un nœud de l'arbre — le nœud lui-même, son
// parent, un frère, ou un nœud du chapitre dont le coup est cité (« 10.c3 », « 8...c5 »).
// Jamais un recalcul séparé. Sortie attendue : 0 écart (code de sortie 1 sinon).
// usage: node --import tsx scripts/_tmp-check-cited-evals.mts <op-ruy-lopez> [<op-italian-game> ...]
//   (nom de fichier de course-trees/ ; l'export CourseTree du module est trouvé automatiquement)
import { collectNodes, type ChessMoveNode } from "@/core/chess/move-tree";
import type { CourseTree } from "@/core/curriculum/course-tree";

const close = (cited: string, v: number | null) => {
  if (v === null) return false;
  const dec = cited.split(".")[1].length;
  return Math.abs(Number(cited.replace("+", "")) - v) <= 0.5 * 10 ** -dec + 1e-9;
};

let totalGaps = 0;
for (const id of process.argv.slice(2)) {
  const mod = await import(`@/core/curriculum/course-trees/${id}`);
  const tree = Object.values(mod).find((v): v is CourseTree => !!v && typeof v === "object" && "chapters" in v);
  if (!tree) throw new Error(`aucun CourseTree exporté par ${id}`);
  let ok = 0;
  const gaps: string[] = [];
  for (const ch of tree.chapters) {
    const nodes = collectNodes(ch.root);
    const parentOf = new Map<ChessMoveNode, ChessMoveNode>();
    for (const n of [ch.root, ...nodes]) for (const c of n.children) parentOf.set(c, n);
    for (const n of new Set([ch.root, ...nodes])) {
      const txt = [n.comment, n.tip, ...(n.hints ?? [])].filter(Boolean).join(" ");
      // seulement les chiffres signés (+0.35, -2.04) ou à 2 décimales : « 1.5 » sans signe n'est pas une éval
      const nums = (txt.match(/(?<![\w.])[+-]?\d+\.\d+(?![\w.])/g) ?? []).filter((x) => /^[+-]/.test(x) || /\.\d{2}$/.test(x));
      if (!nums.length) continue;
      const refNodes: ChessMoveNode[] = [];
      const missing: string[] = [];
      for (const r of txt.matchAll(/(\d+)\.(\.\.)?\s?([KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?|O-O(?:-O)?)/g)) {
        const ply = (Number(r[1]) - 1) * 2 + (r[2] ? 2 : 1);
        const san = r[3].replace(/[+#]$/, "");
        const hit = nodes.filter((m) => m.ply === ply && m.san?.replace(/[+#]$/, "") === san);
        if (hit.length) refNodes.push(...hit);
        else missing.push(r[0]);
      }
      const p = parentOf.get(n);
      const cands = [n, p, ...(p?.children ?? []), ...refNodes].filter(Boolean) as ChessMoveNode[];
      const label = `${ch.title.slice(0, 28)} | ${n.san ? `${Math.ceil(n.ply / 2)}${n.ply % 2 ? "." : "..."}${n.san}` : "(intro)"} [nœud ${n.evaluationScore}]`;
      for (const x of nums) {
        if (cands.some((c) => close(x, c.evaluationScore))) { ok++; continue; }
        gaps.push(`${label} : ${x} ne correspond à aucun nœud (parent ${p?.evaluationScore ?? "-"})${missing.length ? " ; coups cités sans nœud : " + missing.join(", ") : ""}`);
      }
    }
  }
  console.log(`${id} : ${ok} chiffres conformes, ${gaps.length} écart(s)`);
  for (const g of gaps) console.log("- " + g);
  totalGaps += gaps.length;
}
process.exit(totalGaps ? 1 : 0);
