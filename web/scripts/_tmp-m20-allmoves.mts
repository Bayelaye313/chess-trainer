// Toutes les réponses légales d'une FEN, évaluées : <fen> [profondeur=14]
import { Chess } from "chess.js";
import { startEngine, whitePawns } from "./_tmp-sf-native.mjs";
const [fen, d] = process.argv.slice(2);
const sf = await startEngine();
const c = new Chess(fen);
const res: [string, number | null, string][] = [];
for (const m of c.moves({ verbose: true })) {
  const n = new Chess(fen); n.move(m);
  if (n.isCheckmate()) { res.push([m.san, n.turn() === "w" ? -99 : 99, "mat"]); continue; }
  const l = (await sf.analyse(n.fen(), Number(d ?? 14)))[0];
  const p = new Chess(n.fen()); const pv: string[] = [];
  for (const u of (l?.pv ?? []).slice(0, 8)) { try { pv.push(p.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san); } catch { break; } }
  res.push([m.san, whitePawns(l, n.turn() as "w" | "b"), pv.join(" ")]);
}
res.sort((a, b) => (c.turn() === "w" ? (b[1] ?? 0) - (a[1] ?? 0) : (a[1] ?? 0) - (b[1] ?? 0)));
for (const r of res) console.log(r[0], r[1], r[2]);
sf.quit();
