/**
 * Puzzles de finales à partir de positions RÉELLES d'études (sortie de
 * `extract-endgame-positions.ts`) : une position n'est gardée que si Stockfish
 * ne trouve qu'UN seul bon coup à chaque pli du solveur.
 *   - KQ / KR / KRR / KBB / KBN contre roi seul : mat forcé, coup unique
 *     (au dernier pli, tout mat est accepté par l'app, voir `isAcceptedPlayerMove`).
 *   - Roi + 1-2 pions contre roi seul : seul coup gagnant (attaquant) ou seul
 *     coup qui annule (défenseur), sur 2 coups du solveur puis 1 en repli.
 *
 *   node scripts/academy-mining/endgame-puzzles.mjs <positions.json> <résultats.json>
 *
 * Écrit aussi `<résultats>.entries.json`, au format d'import de l'Académie.
 * SKIP_EGMATS=1 saute les mats à la tour / deux fous / fou et cavalier.
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { Chess } from "chess.js";
const [inPath, outPath] = process.argv.slice(2);
const require = createRequire(import.meta.url);
const originalFetch = globalThis.fetch;
const handle = await require("stockfish")("lite-single");
if (!globalThis.fetch) globalThis.fetch = originalFetch;
const collect = (pred) => new Promise((res) => { handle.listener = (l) => { const r = pred(l); if (r !== undefined) { handle.listener = null; res(r); } }; });
const cmd = (c, until) => { const p = collect(until); handle.sendCommand(c); return p; };
await cmd("uci", (l) => (l === "uciok" ? true : undefined));
handle.sendCommand("setoption name MultiPV value 2");
await cmd("isready", (l) => (l === "readyok" ? true : undefined));

async function analyse(fen, depth = 22) {
  handle.sendCommand("ucinewgame");
  await cmd("isready", (l) => (l === "readyok" ? true : undefined));
  const lines = new Map();
  const done = collect((l) => {
    const m = l.match(/ multipv (\d+) .*?score (cp|mate) (-?\d+).* pv (.+)$/);
    if (m) lines.set(+m[1], { kind: m[2], v: +m[3], pv: m[4].split(" ") });
    const b = l.match(/^bestmove (\S+)/);
    return b ? b[1] : undefined;
  });
  handle.sendCommand(`position fen ${fen}`);
  handle.sendCommand(`go depth ${depth} movetime 4000`);
  await done;
  return { l1: lines.get(1) ?? null, l2: lines.get(2) ?? null };
}
const sig = (c, col) => c.board().flat().filter((p) => p && p.color === col).map((p) => p.type).sort().join("");
const play = (c, uci) => c.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });

/** Mat forcé, coup UNIQUE (le 2e coup mate strictement plus lentement, ou pas du tout) à chaque pli du solveur. */
async function uniqueMate(fen, maxMate) {
  const c = new Chess(fen), san = [];
  const first = await analyse(fen);
  if (!first.l1 || first.l1.kind !== "mate" || first.l1.v <= 0 || first.l1.v > maxMate) return null;
  const mateIn = first.l1.v;
  for (let ply = 0; ply < 2 * mateIn; ply += 2) {
    const a = ply === 0 ? first : await analyse(c.fen());
    if (!a.l1 || a.l1.kind !== "mate" || a.l1.v <= 0) return null;
    // Mat en 1 : l'app accepte désormais tout coup qui mate au dernier pli (isAcceptedPlayerMove).
    const unique = a.l1.v === 1 || !a.l2 || a.l2.kind !== "mate" || a.l2.v <= 0 || a.l2.v > a.l1.v;
    if (!unique) return null;
    san.push(play(c, a.l1.pv[0]).san);
    if (c.isCheckmate()) return { san, mateIn };
    const reply = a.l1.pv[1]; // meilleure défense (la plus longue) selon Stockfish
    if (!reply) return null;
    san.push(play(c, reply).san);
  }
  return null;
}

/** Finale de pions : seul coup gagnant (attaquant) ou seul coup qui annule (défenseur), sur `plies` coups du solveur. */
async function uniquePawnLine(fen, attackerToMove, solverPlies = 2) {
  const c = new Chess(fen), san = [];
  const win = (s) => s && ((s.kind === "mate" && s.v > 0) || (s.kind === "cp" && s.v >= 400));
  const draw = (s) => s && s.kind === "cp" && Math.abs(s.v) <= 80;
  for (let k = 0; k < solverPlies; k++) {
    const a = await analyse(c.fen(), 24);
    if (!a.l1 || !a.l2) return null; // un seul coup légal : pas un exercice
    const ok = attackerToMove ? win(a.l1) && !win(a.l2) : draw(a.l1) && !draw(a.l2) && !win(a.l2);
    if (!ok) return null;
    san.push(play(c, a.l1.pv[0]).san);
    if (k < solverPlies - 1) { if (!a.l1.pv[1] || c.isGameOver()) return null; san.push(play(c, a.l1.pv[1]).san); }
  }
  return { san };
}

const positions = JSON.parse(readFileSync(inPath, "utf8"));
const res = { "cm-mat-roi-et-dame-contre-roi": [], "eg-mats-de-force-ecrasante": [], "eg-face-au-roi-seul": [] };
let i = 0;
for (const p of positions) {
  i++;
  const c = new Chess(p.fen);
  if (c.isGameOver()) continue;
  const me = c.turn(), them = me === "w" ? "b" : "w";
  const mine = sig(c, me), theirs = sig(c, them);
  try {
    if (theirs === "k" && mine === "kq") { const r = await uniqueMate(p.fen, 8); if (r) res["cm-mat-roi-et-dame-contre-roi"].push({ ...p, ...r }); }
    else if (theirs === "k" && ["kr", "krr", "bbk", "bkn"].includes(mine) && !process.env.SKIP_EGMATS) { const r = await uniqueMate(p.fen, 5); if (r) res["eg-mats-de-force-ecrasante"].push({ ...p, ...r, material: mine }); }
    else if (theirs === "k" && /^kp{1,2}$/.test(mine)) { const r = (await uniquePawnLine(p.fen, true)) ?? (await uniquePawnLine(p.fen, true, 1)); if (r) res["eg-face-au-roi-seul"].push({ ...p, ...r, role: "gagner" }); }
    else if (mine === "k" && /^kp{1,2}$/.test(theirs)) { const r = (await uniquePawnLine(p.fen, false)) ?? (await uniquePawnLine(p.fen, false, 1)); if (r) res["eg-face-au-roi-seul"].push({ ...p, ...r, role: "annuler" }); }
  } catch (e) { console.error("erreur", p.fen, e.message); }
  if (i % 50 === 0) console.error(`${i}/${positions.length} — ` + Object.entries(res).map(([k, v]) => `${k}=${v.length}`).join(" "));
}
writeFileSync(outPath, JSON.stringify(res, null, 2));
const seen = new Set();
const entries = Object.entries(res).flatMap(([themeId, list]) => list.filter((p) => !seen.has(p.fen) && seen.add(p.fen)).map((p) => ({
  themeId,
  fen: p.fen,
  moves: p.san,
  sourceRef: `${p.source} — ${p.mateIn ? `mat en ${p.mateIn}, coup unique à chaque étape (Stockfish)` : p.role === "annuler" ? "seul coup qui annule" : "seul coup gagnant"}`,
})));
writeFileSync(outPath.replace(/\.json$/, "") + ".entries.json", JSON.stringify(entries, null, 2));
console.error("FIN — " + Object.entries(res).map(([k, v]) => `${k}=${v.length}`).join(" "));
process.exit(0);
