// Lot : pour chaque ligne SAN, éval après la ligne puis N demi-coups moteur (meilleur coup), sur une seule ligne de sortie.
// usage: node --import tsx scripts/_tmp-extb.mts <N> "<ligne1>" "<ligne2>" ...
import { Chess } from "chess.js";
import { startEngine, whitePawns } from "./_tmp-sf-native.mjs";
const [nArg, ...lines] = process.argv.slice(2);
const N = Number(nArg);
const sf = await startEngine({ multipv: 2 });
const fmt = (v: number) => (Math.abs(v) > 50 ? (v > 0 ? "#+" : "#-") : (v >= 0 ? "+" : "") + v.toFixed(2));
for (const line of lines) {
  const c = new Chess();
  const toks = line.trim().split(/\s+/);
  for (const t of toks) c.move(t);
  const out: string[] = [];
  let ls = await sf.analyse(c.fen(), 16);
  const alt = (l: typeof ls) => { if (!l[1]) return ""; const t = new Chess(c.fen()); return ` [2e ${t.move({ from: l[1].pv[0].slice(0, 2), to: l[1].pv[0].slice(2, 4), promotion: l[1].pv[0][4] }).san} ${fmt(whitePawns(l[1], c.turn())!)}]`; };
  out.push(`(${fmt(whitePawns(ls[0], c.turn())!)})`);
  for (let k = 0; k < N && ls[0]; k++) {
    const u = ls[0].pv[0];
    const a = alt(ls);
    const mv = c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });
    ls = await sf.analyse(c.fen(), 16);
    out.push(`${mv.san} ${ls[0] ? fmt(whitePawns(ls[0], c.turn())!) : "fin"}${a}`);
  }
  console.log(`${toks.slice(-3).join(" ")} => ${out.join(" ; ")}`);
}
sf.quit();
