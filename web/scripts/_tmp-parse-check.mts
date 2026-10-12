import { readFileSync } from "node:fs";
import { collectNodes, parseMoveTree } from "@/core/chess/move-tree";
for (const f of process.argv.slice(2)) {
  for (const block of readFileSync(f, "utf8").split(/^## /m).slice(1)) {
    const nl = block.indexOf("\n");
    try {
      const root = parseMoveTree(block.slice(nl + 1));
      const nodes = collectNodes(root).filter((n) => n.san);
      const missing = nodes.filter((n) => !n.comment && !n.tip).map((n) => n.san);
      const quotes = nodes.filter((n) => (n.comment ?? "").includes('"') || (n.tip ?? "").includes('"')).length;
      console.log(`${block.slice(0, nl)} : ${nodes.length} coups, sans commentaire: ${missing.join(",") || "aucun"}, guillemets: ${quotes}, intro: ${root.comment ? "oui" : "NON"}`);
    } catch (e) { console.log(`${block.slice(0, nl)} : ERREUR ${(e as Error).message}`); }
  }
}
