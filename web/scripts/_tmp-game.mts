// Affiche la ligne principale d'une partie (n° dans le fichier) ; avec un intervalle, les FEN.
import { readFileSync } from "node:fs";
import { Chess } from "chess.js";
const [f, nStr, fromS, toS] = process.argv.slice(2);
const games = readFileSync(f, "utf8").replace(/\r/g, "").split(/\n(?=\[Event )/);
const g = games[Number(nStr) - 1];
function strip(s: string) { let out = "", d = 0, c = false; for (const ch of s) { if (c) { if (ch === "}") c = false; continue; } if (ch === "{") { c = true; continue; } if (ch === "(") { d++; continue; } if (ch === ")") { d--; continue; } if (!d) out += ch; } return out; }
console.log(g.split("\n").filter((l) => /^\[(White|Black|Date|Result|Event|Site) /.test(l)).join(" "));
const sans = strip(g.replace(/^\[.*\]$/gm, "")).replace(/\$\d+/g, " ").replace(/\d+\.(\.\.)?/g, " ").split(/\s+/).filter((t) => t && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(t));
const c = new Chess(); const out: string[] = [];
const from = Number(fromS ?? 0), to = Number(toS ?? 999);
for (const s of sans) {
  const mn = c.moveNumber(), w = c.turn() === "w";
  if (mn >= from && mn <= to && fromS) console.log(`${mn}${w ? "." : "..."} [${c.fen()}]`);
  c.move(s); out.push(w ? `${mn}. ${s}` : s);
}
if (!fromS) console.log(out.join(" "));
