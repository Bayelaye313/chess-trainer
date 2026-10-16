/**
 * Étape 3 du pipeline (voir README.md) : vérifie avec Stockfish CHAQUE coup du
 * solveur (les réponses adverses sont imposées par la ligne Lichess). Un coup
 * passe s'il est le meilleur coup, ou s'il est aussi décisif que lui (même
 * mat, ou à 30 centipions près) ; sinon le puzzle est rejeté.
 *
 *   node scripts/academy-mining/verify-stockfish.mjs <verify-all-in.json> <vout-0.json> [profondeur=18]
 *
 * SHARD=i/n ne traite que la i-ème tranche sur n (0-indexée) : lancer n
 * processus en parallèle avec des sorties `vout-<i>.json` distinctes, que
 * `build-import.mjs` relit toutes.
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { Chess } from "chess.js";
const [inPath, outPath, depthArg] = process.argv.slice(2);
const DEPTH = Number(depthArg ?? 18);
const require = createRequire(import.meta.url);
const originalFetch = globalThis.fetch;
const handle = await require("stockfish")("lite-single");
if (!globalThis.fetch) globalThis.fetch = originalFetch;

function collect(pred) {
  return new Promise((resolve) => {
    handle.listener = (line) => { const r = pred(line); if (r !== undefined) { handle.listener = null; resolve(r); } };
  });
}
async function cmd(c, until) { const p = collect(until); handle.sendCommand(c); return p; }
await cmd("uci", (l) => (l === "uciok" ? true : undefined));
handle.sendCommand("setoption name MultiPV value 2");
await cmd("isready", (l) => (l === "readyok" ? true : undefined));

/** Analyse `fen` ; renvoie bestmove et les scores (POV camp au trait) des 2 meilleures lignes. */
async function analyse(fen, searchmoves) {
  handle.sendCommand("ucinewgame");
  await cmd("isready", (l) => (l === "readyok" ? true : undefined));
  const lines = new Map();
  const done = collect((l) => {
    const m = l.match(/ multipv (\d+) .*?score (cp|mate) (-?\d+).* pv (\S+)/);
    if (m) lines.set(+m[1], { kind: m[2], v: +m[3], move: m[4] });
    const b = l.match(/^bestmove (\S+)/);
    return b ? b[1] : undefined;
  });
  handle.sendCommand(`position fen ${fen}`);
  handle.sendCommand(`go depth ${DEPTH}${searchmoves ? ` searchmoves ${searchmoves}` : ""}`);
  const best = await done;
  return { best, l1: lines.get(1) ?? null, l2: lines.get(2) ?? null };
}
const fmt = (s) => (!s ? "?" : s.kind === "mate" ? `M${s.v}` : `${(s.v / 100).toFixed(2)}`);

const [shard, shards] = (process.env.SHARD ?? "0/1").split("/").map(Number);
const items = JSON.parse(readFileSync(inPath, "utf8")).filter((_, i) => i % shards === shard);
const report = [];
for (const it of items) {
  const c = new Chess(it.fen);
  const plies = [];
  let ok = true;
  for (let i = 0; i < it.solutionSan.length; i++) {
    const fen = c.fen();
    const mv = c.move(it.solutionSan[i]);
    if (i % 2 === 1) continue; // réponses adverses : imposées par la ligne Lichess
    const uci = mv.from + mv.to + (mv.promotion ?? "");
    const a = await analyse(fen);
    let verdict;
    if (a.best === uci) verdict = "best";
    else {
      const alt = await analyse(fen, uci); // le coup de la solution est-il lui aussi décisif ?
      const score = (s) => (!s ? -1e9 : s.kind === "mate" ? (s.v > 0 ? 1e6 - s.v : -1e6 - s.v) : s.v);
      const close = a.l1 && alt.l1 && ((a.l1.kind === "mate" && alt.l1.kind === "mate" && alt.l1.v > 0) || (a.l1.kind === "cp" && alt.l1.kind === "cp" && score(a.l1) - score(alt.l1) <= 30) || (a.l1.kind === "cp" && alt.l1.kind === "mate" && alt.l1.v > 0));
      verdict = close ? `alt-equal(${fmt(alt.l1)})` : `FAIL(sf ${a.best} ${fmt(a.l1)}, sol ${fmt(alt.l1)})`;
      if (verdict.startsWith("FAIL")) ok = false;
    }
    plies.push({ san: it.solutionSan[i], verdict, eval: fmt(a.l1), second: fmt(a.l2) });
  }
  report.push({ key: it.key, ok, firstEval: plies[0]?.eval, firstSecond: plies[0]?.second, plies });
  console.error(`${ok ? "OK  " : "FAIL"} ${it.key} — ${plies.map((p) => `${p.san}:${p.verdict}`).join(" ")} — éval ${plies[0]?.eval} (2e: ${plies[0]?.second})`);
}
writeFileSync(outPath, JSON.stringify(report, null, 2));
console.error(`${report.filter((r) => r.ok).length}/${report.length} validés par Stockfish (profondeur ${DEPTH})`);
process.exit(0);
