// Faits par coup (ligne principale) : cibles de la pièce jouée, pièces en prise, échecs.
import { readFileSync } from "node:fs";
import { Chess, type Square } from "chess.js";
import { mainLine, parseMoveTree, MOVE_TREE_START_FEN } from "@/core/chess/move-tree";
const text = readFileSync(process.argv[2], "utf8");
const fen = text.match(/^\[FEN "([^"]*)"\]/m)?.[1] ?? MOVE_TREE_START_FEN;
const nodes = mainLine(parseMoveTree(text.replace(/^\[.*\]\s*$/gm, "").trim(), fen));
const N: Record<string, string> = { p: "P", n: "C", b: "F", r: "T", q: "D", k: "R" };
const SQ = "abcdefgh".split("").flatMap((f) => "12345678".split("").map((r) => f + r)) as Square[];
for (let i = 1; i < nodes.length; i++) {
  const c = new Chess(nodes[i].fen), prev = new Chess(nodes[i - 1].fen);
  const me = prev.turn(), them = c.turn();
  const to = nodes[i].uci!.slice(2, 4) as Square;
  const targets = SQ.filter((s) => { const p = c.get(s); return p && p.color === them && c.attackers(s, me).includes(to); }).map((s) => N[c.get(s)!.type] + s);
  const hanging = (col: "w" | "b") => SQ.filter((s) => { const p = c.get(s); return p && p.color === col && p.type !== "k" && c.attackers(s, col === "w" ? "b" : "w").length > 0 && c.attackers(s, col).length === 0; }).map((s) => N[c.get(s)!.type] + s);
  const num = `${Math.ceil(nodes[i].ply / 2) + Math.floor((Number(fen.split(" ")[5]) - 1))}${me === "w" ? "." : "..."}`;
  console.log(`${num}${nodes[i].san}  vise: ${targets.join(" ") || "-"} | en prise ${them === "w" ? "Blancs" : "Noirs"}: ${hanging(them).join(" ") || "-"} | en prise ${me === "w" ? "Blancs" : "Noirs"}: ${hanging(me).join(" ") || "-"}`);
}
