// Sonde d'une ligne SAN : éval (prof. 16, POV Blancs) après chaque demi-coup + 3 meilleurs coups de la position.
// usage: node --import tsx scripts/_tmp-line-probe.mts "<SAN...>" [à partir du demi-coup=1] [prof=16]
import { Chess } from "chess.js";
import { startEngine, whitePawns } from "./_tmp-sf-native.mjs";
const [line, fromArg, depthArg] = process.argv.slice(2);
const FROM = Number(fromArg ?? 1), DEPTH = Number(depthArg ?? 16);
const sf = await startEngine({ multipv: 3 });
const c = new Chess();
const toks = line.trim().split(/\s+/).map((t) => t.replace(/^\d+\.+/, "")).filter(Boolean);
const fmt = (v: number) => (Math.abs(v) > 50 ? (v > 0 ? "#+" : "#-") : (v >= 0 ? "+" : "") + v.toFixed(2));
for (const [i, san] of toks.entries()) {
  let mv;
  try { mv = c.move(san); } catch { console.log(`ILLÉGAL au demi-coup ${i + 1} : ${san}`); break; }
  if (i + 1 < FROM) continue;
  const turn = c.turn();
  const ls = await sf.analyse(c.fen(), DEPTH);
  const tops = ls.map((l) => { const t = new Chess(c.fen()); let s = "?"; try { s = t.move({ from: l.pv[0].slice(0, 2), to: l.pv[0].slice(2, 4), promotion: l.pv[0][4] }).san; } catch {} return `${s} ${fmt(whitePawns(l, turn)!)}`; });
  const n = Math.ceil((i + 1) / 2);
  console.log(`${(i + 1) % 2 ? n + "." : n + "..."}${mv.san}\t${ls[0] ? fmt(whitePawns(ls[0], turn)!) : "fin"}\t| ${tops.join(" | ")}`);
}
sf.quit();
