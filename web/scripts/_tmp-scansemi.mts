// Repère dans des PGN les épisodes « tour sur colonne semi-ouverte » et les sacrifices de qualité (T x pièce mineure).
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
    const tag = (t: string) => g.match(new RegExp("[\[]" + t + ' "([^"]*)"'))?.[1] ?? "?";
    const fen = g.match(/\[FEN "([^"]*)"/)?.[1];
    const body = strip(g.replace(/^\[.*\]$/gm, "")).replace(/\$\d+/g, " ").replace(/\d+\.(\.\.)?/g, " ");
    const sans = body.split(/\s+/).filter((t) => t && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(t));
    if (sans.length < 20) continue;
    let c: Chess; try { c = fen ? new Chess(fen) : new Chess(); } catch { continue; }
    const ev: string[] = [];
    const run: Record<string, number> = {}; const first: Record<string, string> = {};
    for (const s of sans) {
      let m; try { m = c.move(s); } catch { ev.push(`ILLEGAL@${s}`); break; }
      const mv = `${c.moveNumber() - (c.turn() === "w" ? 1 : 0)}${m.color === "w" ? "." : "..."}${m.san}`;
      if (m.piece === "r" && (m.captured === "n" || m.captured === "b")) ev.push(`QUALITÉ ${mv}`);
      const b = c.board();
      const seen = new Set<string>();
      for (let fi = 0; fi < 8; fi++) {
        const col = [0,1,2,3,4,5,6,7].map((r) => b[r][fi]);
        for (const side of ["w", "b"] as const) {
          const own = col.some((p) => p && p.type === "p" && p.color === side);
          const opp = col.some((p) => p && p.type === "p" && p.color !== side);
          const rook = col.some((p) => p && p.type === "r" && p.color === side);
          if (!own && opp && rook) seen.add(side + "abcdefgh"[fi]);
        }
      }
      for (const k of Object.keys(run)) if (!seen.has(k)) { if (run[k] >= 14) ev.push(`${k} dès ${first[k]} (${run[k]} ply)`); delete run[k]; }
      for (const k of seen) { if (!run[k]) { run[k] = 0; first[k] = mv; } run[k]++; }
    }
    for (const k of Object.keys(run)) if (run[k] >= 14) ev.push(`${k} dès ${first[k]} (${run[k]} ply, fin)`);
    if (ev.length) console.log(`${f.split(/[\/]/).pop()} | ${tag("White")} – ${tag("Black")} ${tag("Date").slice(0,4)} ${tag("Result")} [${sans.length}] :: ${ev.join("; ")}`);
  }
}
