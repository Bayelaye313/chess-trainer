// Dérive « camp blanc mou » pour les chapitres surprise des cours côté Noirs : les Noirs jouent le meilleur coup,
// les Blancs jouent un coup sur deux un coup calme (ni prise ni échec) qui perd entre MIN et MAX pion, choisi
// parmi MultiPV 30 (le moins perdant d'abord) ; les autres coups blancs sont les meilleurs.
// usage: node --import tsx scripts/_tmp-drift-w.mts "<coups SAN>" <demi-coups> [prof=16] [min=0.55] [max=1.1] [premier coup blanc mou=1|0]
import { Chess } from "chess.js";
import { startEngine, whitePawns } from "./_tmp-sf-native.mjs";

const [moves, pliesArg, depthArg, minArg, maxArg, firstArg] = process.argv.slice(2);
const PLIES = Number(pliesArg ?? 16), DEPTH = Number(depthArg ?? 16);
const MIN = Number(minArg ?? 0.55), MAX = Number(maxArg ?? 1.1);
let softTurn = (firstArg ?? "1") === "1";
const sf = await startEngine({ multipv: 30 });
const c = new Chess();
for (const san of moves.trim().split(/\s+/).filter((t) => !/^\d+\.+$/.test(t))) c.move(san.replace(/^\d+\.+/, ""));
const out: string[] = [];
for (let i = 0; i < PLIES && !c.isGameOver(); i++) {
  const turn = c.turn();
  const lines = await sf.analyse(c.fen(), DEPTH);
  const evals = lines.map((l) => whitePawns(l, turn)!);
  let pick = 0;
  if (turn === "w") {
    if (softTurn) {
      const verbose = c.moves({ verbose: true });
      const cand = lines
        .map((l, k) => ({ k, loss: evals[0] - evals[k], mv: verbose.find((m) => m.from + m.to + (m.promotion ?? "") === l.pv[0]) }))
        .filter((x) => x.k > 0 && x.mv && !x.mv.captured && !x.mv.san.includes("+") && x.loss >= MIN && x.loss <= MAX)
        .sort((a, b) => a.loss - b.loss);
      if (cand.length) pick = cand[0].k;
    }
    softTurn = !softTurn;
  }
  const uci = lines[pick].pv[0];
  const mv = c.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
  const n = Math.ceil(c.history().length / 2);
  out.push(`${turn === "w" ? n + "." : n + "..."}${mv.san} (${evals[pick].toFixed(2)}${pick ? " ; meilleur " + lines[0].pv[0] + " " + evals[0].toFixed(2) : ""})`);
}
console.log(out.join("  "));
sf.quit();
