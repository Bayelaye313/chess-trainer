// Génère une « dérive positionnelle » : les Blancs jouent le meilleur coup, les Noirs un coup calme
// (pas une prise, pas une gaffe) qui perd entre MIN et MAX pion — le joueur de club « mou ».
// usage: node --import tsx scripts/_tmp-drift.mts "<coups SAN depuis le départ>" <demi-coups> [prof=14] [min=0.15] [max=0.8]
import { Chess } from "chess.js";
import { startEngine, whitePawns } from "./_tmp-sf-native.mjs";

const [moves, pliesArg, depthArg, minArg, maxArg] = process.argv.slice(2);
const PLIES = Number(pliesArg ?? 16), DEPTH = Number(depthArg ?? 14);
const MIN = Number(minArg ?? 0.15), MAX = Number(maxArg ?? 0.8);
const sf = await startEngine({ multipv: 5 });
const c = new Chess();
for (const san of moves.trim().split(/\s+/).filter((t) => !/^\d+\.+$/.test(t))) c.move(san.replace(/^\d+\.+/, ""));
const out: string[] = [];
for (let i = 0; i < PLIES && !c.isGameOver(); i++) {
  const fen = c.fen();
  const turn = c.turn();
  const lines = await sf.analyse(fen, DEPTH);
  const evals = lines.map((l) => whitePawns(l, turn)!);
  let pick = 0;
  if (turn === "b") {
    const best = evals[0];
    const quiet = lines.map((l, k) => ({ l, k, loss: evals[k] - best, mv: c.moves({ verbose: true }).find((m) => m.from + m.to + (m.promotion ?? "") === l.pv[0]) }))
      .filter((x) => x.k > 0 && x.mv && !x.mv.captured && x.loss >= MIN && x.loss <= MAX);
    if (quiet.length) pick = quiet[0].k;
  }
  const uci = lines[pick].pv[0];
  const mv = c.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
  const num = Math.ceil(c.history().length / 2);
  out.push(`${turn === "w" ? num + "." : num + "..."}${mv.san} (${evals[pick] >= 0 ? "+" : ""}${evals[pick].toFixed(2)}${pick ? ", meilleur " + lines[0].pv[0] + " " + evals[0].toFixed(2) : ""})`);
}
console.log(out.join("\n"));
console.log("FEN finale:", c.fen());
sf.quit();
