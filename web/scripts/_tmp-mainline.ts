// Affiche la ligne principale (SAN numérotée) de chaque chapitre d'un PGN.
import { readFileSync } from "node:fs";
import { mainLine, parseMoveTree, MOVE_TREE_START_FEN } from "@/core/chess/move-tree";
for (const ch of readFileSync(process.argv[2], "utf8").split(/\r?\n(?=\[Event )/)) {
  const fen = ch.match(/^\[FEN "([^"]*)"\]/m)?.[1] ?? MOVE_TREE_START_FEN;
  const name = ch.match(/^\[(?:ChapterName|Event) "([^"]*)"\]/m)?.[1];
  const body = ch.replace(/^\[.*\]\s*$/gm, "").trim();
  if (!body) continue;
  const line = mainLine(parseMoveTree(body, fen)).slice(1);
  console.log(`## ${name} (${line.length} plis)\n` + line.map((n) => (n.ply % 2 ? `${(n.ply + 1) / 2}.` : "") + n.san).join(" ") + "\n");
}
