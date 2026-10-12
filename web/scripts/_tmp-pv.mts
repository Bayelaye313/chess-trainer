// PV moteur (multipv 3) pour une FEN : <fen> [profondeur=18]
import { Chess } from "chess.js";
import { startEngine, whitePawns } from "./_tmp-sf-native.mjs";
const [fen, d] = process.argv.slice(2);
const sf = await startEngine();
const lines = await sf.analyse(fen, Number(d ?? 18));
for (const l of lines) {
  const c = new Chess(fen); const out: string[] = [];
  for (const u of l.pv.slice(0, 16)) { try { out.push(c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san); } catch { break; } }
  console.log(whitePawns(l, fen.split(" ")[1] as "w" | "b"), out.join(" "));
}
sf.quit();
