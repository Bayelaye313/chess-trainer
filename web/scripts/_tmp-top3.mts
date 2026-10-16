import { Chess } from "chess.js";
import { startEngine, whitePawns } from "./_tmp-sf-native.mjs";
const sf = await startEngine({ multipv: 3 });
for (const line of process.argv.slice(2)) {
  const c = new Chess(); for (const m of line.split(/\s+/)) c.move(m);
  const res = await sf.analyse(c.fen(), 16);
  console.log(line.split(" ").slice(-3).join(" "), "=>", res.map((l: any) => { const t = new Chess(c.fen()); const san = t.move(l.pv[0]).san; return `${san} ${whitePawns(l, c.turn() as any)!.toFixed(2)}`; }).join(" | "));
}
sf.quit();
