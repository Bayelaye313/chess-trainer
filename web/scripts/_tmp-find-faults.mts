// Pour chaque position d'une ligne où le camp SIDE (w|b) joue : coups qui perdent entre MIN et MAX pion
// par rapport au meilleur (prof. 14, MultiPV = tous), avec la meilleure réponse adverse.
// usage: node --import tsx scripts/_tmp-find-faults.mts "<SAN...>" <à partir du demi-coup> [side=w] [min=0.5] [max=4]
import { Chess } from "chess.js";
import { startEngine, whitePawns } from "./_tmp-sf-native.mjs";
const [line, fromArg, side = "w", minA, maxA] = process.argv.slice(2);
const FROM = Number(fromArg ?? 1), MIN = Number(minA ?? 0.5), MAX = Number(maxA ?? 4);
const sf = await startEngine({ multipv: 60 });
const c = new Chess();
const toks = line.trim().split(/\s+/).map((t) => t.replace(/^\d+\.+/, "")).filter(Boolean);
const san = (fen: string, u?: string) => { if (!u) return ""; try { return new Chess(fen).move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san; } catch { return "?"; } };
for (let i = 0; i <= toks.length; i++) {
  if (i >= FROM - 1 && c.turn() === side) {
    const fen = c.fen(), turn = c.turn();
    const ls = await sf.analyse(fen, 14);
    const sg = turn === "w" ? 1 : -1;
    const best = whitePawns(ls[0], turn)!;
    const bad = ls.filter((l) => { const loss = sg * (best - whitePawns(l, turn)!); return loss >= MIN && loss <= MAX; })
      .map((l) => { const m = san(fen, l.pv[0]); const f2 = new Chess(fen); f2.move(m); return `${m} ${whitePawns(l, turn)!.toFixed(2)} (${san(f2.fen(), l.pv[1])})`; });
    const n = Math.floor(i / 2) + 1;
    console.log(`[${n}${turn === "w" ? "." : "..."}] meilleur ${san(fen, ls[0].pv[0])} ${best.toFixed(2)} || ${bad.join(" | ")}`);
  }
  if (i < toks.length) c.move(toks[i]);
}
sf.quit();
