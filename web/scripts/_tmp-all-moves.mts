// Toutes les réponses légales d'une position (après une ligne SAN), triées, éval POV Blancs, prof. donnée.
// usage: node --import tsx scripts/_tmp-all-moves.mts "<SAN...>" [prof=14]
import { Chess } from "chess.js";
import { startEngine, whitePawns } from "./_tmp-sf-native.mjs";
const [line, depthArg] = process.argv.slice(2);
const DEPTH = Number(depthArg ?? 14);
const c = new Chess();
for (const t of line.trim().split(/\s+/).map((t) => t.replace(/^\d+\.+/, "")).filter(Boolean)) c.move(t);
const n = c.moves().length;
const sf = await startEngine({ multipv: n });
const turn = c.turn();
const ls = await sf.analyse(c.fen(), DEPTH);
const out = ls.map((l) => { const t = new Chess(c.fen()); const s = t.move({ from: l.pv[0].slice(0, 2), to: l.pv[0].slice(2, 4), promotion: l.pv[0][4] }).san; const t2 = new Chess(t.fen()); let r = ""; try { r = t2.move({ from: l.pv[1].slice(0, 2), to: l.pv[1].slice(2, 4), promotion: l.pv[1][4] }).san; } catch {} return `${s} ${whitePawns(l, turn)!.toFixed(2)} (${r})`; });
console.log(out.join("  |  "));
sf.quit();
