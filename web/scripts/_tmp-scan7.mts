// Repère dans des PGN les épisodes « pièce lourde en 7e rangée » (2e pour les Noirs).
import { readFileSync } from "node:fs";
import { Chess } from "chess.js";
const files = process.argv.slice(2);
function strip(s: string) {
  let out = "", depth = 0, inC = false;
  for (const ch of s) {
    if (inC) { if (ch === "}") inC = false; continue; }
    if (ch === "{") { inC = true; continue; }
    if (ch === "(") { depth++; continue; }
    if (ch === ")") { depth--; continue; }
    if (depth === 0) out += ch;
  }
  return out;
}
for (const f of files) {
  const text = readFileSync(f, "utf8").replace(/\r/g, "");
  const games = text.split(/\n(?=\[Event )/);
  for (const g of games) {
    const tag = (t: string) => g.match(new RegExp("\\[" + t + ' "([^"]*)"'))?.[1] ?? "?";
    const fen = g.match(/\[FEN "([^"]*)"/)?.[1];
    const body = strip(g.replace(/^\[.*\]$/gm, "")).replace(/\$\d+/g, " ").replace(/\d+\.(\.\.)?/g, " ");
    const sans = body.split(/\s+/).filter((t) => t && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(t));
    let c: Chess; try { c = fen ? new Chess(fen) : new Chess(); } catch { continue; }
    const startMove = c.moveNumber();
    const ev: string[] = [];
    let wRun = 0, bRun = 0, wMax = 0, bMax = 0, wFirst = "", bFirst = "";
    let i = 0;
    for (const s of sans) {
      try { c.move(s); } catch { ev.push(`ILLEGAL@${s}`); break; }
      i++;
      const b = c.board();
      const w7 = b[1].filter((p) => p && p.color === "w" && (p.type === "r" || p.type === "q")).length;
      const b2 = b[6].filter((p) => p && p.color === "b" && (p.type === "r" || p.type === "q")).length;
      const mv = c.moveNumber() - (c.turn() === "w" ? 1 : 0);
      if (w7) { if (!wRun) wFirst = `${mv}`; wRun++; wMax = Math.max(wMax, w7); } else { if (wRun >= 6) ev.push(`W7 dès ${wFirst} (${wRun} ply, max ${wMax})`); wRun = 0; wMax = 0; }
      if (b2) { if (!bRun) bFirst = `${mv}`; bRun++; bMax = Math.max(bMax, b2); } else { if (bRun >= 6) ev.push(`B2 dès ${bFirst} (${bRun} ply, max ${bMax})`); bRun = 0; bMax = 0; }
    }
    if (wRun >= 6) ev.push(`W7 dès ${wFirst} (${wRun} ply, max ${wMax}) jusqu'à la fin`);
    if (bRun >= 6) ev.push(`B2 dès ${bFirst} (${bRun} ply, max ${bMax}) jusqu'à la fin`);
    if (ev.length) console.log(`${f.split(/[\/]/).pop()} | ${tag("White")} – ${tag("Black")} ${tag("Date").slice(0,4)} ${tag("Result")} [${sans.length} ply from ${startMove}] :: ${ev.join("; ")}`);
  }
}
