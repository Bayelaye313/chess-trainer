// Prolonge une ligne SAN de N demi-coups avec le meilleur coup moteur ; imprime éval + top3 de chaque position.
// usage: node --import tsx scripts/_tmp-ext.mts "<SAN...>" <N> [prof=16] [from=?]
import { Chess } from "chess.js";
import { startEngine, whitePawns } from "./_tmp-sf-native.mjs";
const [line, nArg, dArg, fromArg] = process.argv.slice(2);
const N = Number(nArg ?? 10), D = Number(dArg ?? 16);
const sf = await startEngine({ multipv: 3 });
const c = new Chess();
const toks = line.trim().split(/\s+/).map((t) => t.replace(/^\d+\.+/, "")).filter(Boolean);
const FROM = Number(fromArg ?? toks.length);
const fmt = (v: number) => (Math.abs(v) > 50 ? (v > 0 ? "#+" : "#-") : (v >= 0 ? "+" : "") + v.toFixed(2));
const show = async (label: string) => {
  const turn = c.turn();
  const ls = await sf.analyse(c.fen(), D);
  const tops = ls.map((l) => { const t = new Chess(c.fen()); let s = "?"; try { s = t.move({ from: l.pv[0].slice(0, 2), to: l.pv[0].slice(2, 4), promotion: l.pv[0][4] }).san; } catch {} return `${s} ${fmt(whitePawns(l, turn)!)}`; });
  console.log(`${label}\t${ls[0] ? fmt(whitePawns(ls[0], turn)!) : "fin"}\t| ${tops.join(" | ")}`);
  return ls;
};
const lab = (san: string) => { const p = c.history().length; const n = Math.ceil(p / 2); return `${p % 2 ? n + "." : n + "..."}${san}`; };
for (const [i, san] of toks.entries()) {
  const mv = c.move(san);
  if (i + 1 >= FROM) await show(lab(mv.san));
}
for (let k = 0; k < N && !c.isGameOver(); k++) {
  const ls = await sf.analyse(c.fen(), D);
  const u = ls[0].pv[0];
  const mv = c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });
  await show(lab(mv.san));
}
sf.quit();
