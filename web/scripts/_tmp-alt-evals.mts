// Éval (profondeur 16, multipv 1, point de vue Blancs) de la position après chaque ligne SAN donnée.
// usage: node --import tsx scripts/_tmp-alt-evals.mts "e4 e5 Nf3 ..." "..."
import { Chess } from "chess.js";
import { startEngine, whitePawns } from "./_tmp-sf-native.mjs";
const sf = await startEngine({ multipv: 1 });
for (const line of process.argv.slice(2)) {
  const c = new Chess();
  for (const m of line.split(/\s+/)) c.move(m);
  const turn = c.turn();
  const [best] = await sf.analyse(c.fen(), 16);
  const v = best.kind === "mate" ? `#${turn === "w" ? best.v : -best.v}` : whitePawns(best, turn)!.toFixed(2);
  console.log(`${v}\t${line}`);
}
sf.quit();
