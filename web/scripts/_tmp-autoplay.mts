// Prolonge une ligne au moteur : les deux camps jouent le meilleur coup, sauf le camp « mou » (SOFT=w|b)
// qui joue un coup calme perdant entre MIN et MAX pion.
// usage: node --import tsx scripts/_tmp-autoplay.mts "<coups SAN>" <demi-coups> [prof=16] [soft=none] [min=0.2] [max=0.8]
import { Chess } from "chess.js";
import { startEngine, whitePawns } from "./_tmp-sf-native.mjs";

const [moves, pliesArg, depthArg, soft = "none", minArg, maxArg] = process.argv.slice(2);
const PLIES = Number(pliesArg ?? 12), DEPTH = Number(depthArg ?? 16);
const MIN = Number(minArg ?? 0.2), MAX = Number(maxArg ?? 0.8);
const sf = await startEngine({ multipv: 5 });
const c = new Chess();
for (const san of moves.trim().split(/\s+/).filter((t) => !/^\d+\.+$/.test(t))) c.move(san.replace(/^\d+\.+/, ""));
const out: string[] = [];
for (let i = 0; i < PLIES && !c.isGameOver(); i++) {
  const turn = c.turn();
  const lines = await sf.analyse(c.fen(), DEPTH);
  const evals = lines.map((l) => whitePawns(l, turn)!);
  const sign = turn === "w" ? 1 : -1;
  let pick = 0;
  if (turn === soft) {
    const verbose = c.moves({ verbose: true });
    const cand = lines.map((l, k) => ({ k, loss: sign * (evals[0] - evals[k]), mv: verbose.find((m) => m.from + m.to + (m.promotion ?? "") === l.pv[0]) }))
      .filter((x) => x.k > 0 && x.mv && !x.mv.captured && x.loss >= MIN && x.loss <= MAX);
    if (cand.length) pick = cand[0].k;
  }
  const uci = lines[pick].pv[0];
  const mv = c.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
  const n = Math.ceil(c.history().length / 2);
  out.push(`${turn === "w" ? n + "." : n + "..."}${mv.san} (${evals[pick].toFixed(2)}${pick ? " ; meilleur " + lines[0].pv[0] + " " + evals[0].toFixed(2) : ""})`);
}
console.log(out.join("  "));
sf.quit();
