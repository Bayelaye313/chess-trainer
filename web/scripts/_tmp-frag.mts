// Extrait un fragment de partie en PGN avec [FEN] : <fichier> <n> <coup de départ> <w|b> <dernier coup> <sortie>
import { readFileSync, writeFileSync } from "node:fs";
import { Chess } from "chess.js";
const [f, nStr, fromS, side, toS, out] = process.argv.slice(2);
const g = readFileSync(f, "utf8").replace(/\r/g, "").split(/\n(?=\[Event )/)[Number(nStr) - 1];
function strip(s: string) { let o = "", d = 0, c = false; for (const ch of s) { if (c) { if (ch === "}") c = false; continue; } if (ch === "{") { c = true; continue; } if (ch === "(") { d++; continue; } if (ch === ")") { d--; continue; } if (!d) o += ch; } return o; }
const sans = strip(g.replace(/^\[.*\]$/gm, "")).replace(/\$\d+/g, " ").replace(/\d+\.(\.\.)?/g, " ").split(/\s+/).filter((t) => t && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(t)).map((s) => s.replace(/[!?]+$/, ""));
const c = new Chess(); let fen = ""; const mv: string[] = [];
for (const s of sans) {
  const mn = c.moveNumber(), w = c.turn() === "w";
  if (!fen && mn === Number(fromS) && (w ? "w" : "b") === side) fen = c.fen();
  if (fen && mn > Number(toS)) break;
  if (fen) mv.push(w ? `${mn}. ${s}` : (mv.length ? s : `${mn}... ${s}`));
  c.move(s);
}
writeFileSync(out, `[FEN "${fen}"]\n\n${mv.join(" ")} *\n`);
console.log(out, fen, mv.length);
