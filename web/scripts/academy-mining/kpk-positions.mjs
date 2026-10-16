/**
 * Roi + pion contre roi seul (`eg-face-au-roi-seul`) : positions COMPOSÉES où
 * un seul coup gagne (opposition, roi devant le pion). Annoncées « composées »
 * dans `source`. Stockfish évalue ces finales exactement : on garde une
 * position si le meilleur coup gagne (> +5) et le 2e annule (< +0,5), puis la
 * ligne principale (3 plis) passe le contrôle d'unicité comme le reste.
 *
 *   node scripts/academy-mining/kpk-positions.mjs <sortie.json> [nombre, défaut 4]
 */
import { writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { Chess } from "chess.js";

const BIN = "C:/Users/ab.gueye/Downloads/stockfish-windows-x86-64-avx2/stockfish/stockfish-windows-x86-64-avx2.exe";
const [outPath, nArg] = process.argv.slice(2);
const WANTED = Number(nArg ?? 4);

const sf = spawn(BIN, [], { stdio: ["pipe", "pipe", "inherit"] });
const rl = createInterface({ input: sf.stdout });
let listener = null;
rl.on("line", (l) => listener?.(l));
const send = (c) => sf.stdin.write(c + "\n");
const until = (pred, on) => new Promise((res) => { listener = (l) => { on?.(l); if (pred(l)) { listener = null; res(); } }; });
let w = until((l) => l === "uciok");
send("uci");
await w;
send("setoption name MultiPV value 2");
w = until((l) => l === "readyok");
send("isready");
await w;

async function analyse(fen) {
  const lines = new Map();
  const done = until((l) => l.startsWith("bestmove"), (l) => {
    const m = l.match(/ multipv (\d+) .*?score (cp|mate) (-?\d+).* pv (.+)$/);
    if (m) lines.set(+m[1], { cp: m[2] === "mate" ? (+m[3] > 0 ? 10000 : -10000) : +m[3], pv: m[4].split(" ") });
  });
  send(`position fen ${fen}`);
  send("go depth 20");
  await done;
  return [lines.get(1), lines.get(2)];
}

const sq = (f, r) => "abcdefgh"[f] + (r + 1);
const out = [];
const seen = new Set();
// Pion blanc sur les colonnes c-f, 3e à 5e rangée ; rois proches du pion (≤ 2 cases) : zone des oppositions.
search: for (const pf of [3, 4, 2, 5]) {
  for (const pr of [3, 4, 2]) {
    for (let wk = 0; wk < 64; wk++) {
      for (let bk = 0; bk < 64; bk++) {
        const [wf, wr, bf, br] = [wk % 8, Math.floor(wk / 8), bk % 8, Math.floor(bk / 8)];
        if (Math.max(Math.abs(wf - pf), Math.abs(wr - pr)) > 2 || Math.max(Math.abs(bf - pf), Math.abs(br - pr)) > 3) continue;
        if (br <= pr || Math.max(Math.abs(wf - bf), Math.abs(wr - br)) < 2) continue;
        const c = new Chess();
        c.clear();
        if (!c.put({ type: "p", color: "w" }, sq(pf, pr)) || !c.put({ type: "k", color: "w" }, sq(wf, wr)) || !c.put({ type: "k", color: "b" }, sq(bf, br))) continue;
        const fen = c.fen().replace(/ [wb] .*/, " w - - 0 1");
        try {
          if (new Chess(fen).isGameOver() || new Chess(fen.replace(" w ", " b ")).inCheck()) continue;
        } catch {
          continue;
        }
        const [a, b] = await analyse(fen);
        if (!a || !b || a.cp < 500 || b.cp > 50) continue;
        const board = new Chess(fen);
        const line = a.pv.slice(0, 3).map((u) => board.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san);
        const kind = board.history({ verbose: true })[0].piece === "k" ? "roi" : "pion";
        const group = `${pf}|${kind}`;
        if (seen.has(group)) continue;
        seen.add(group);
        out.push({ key: `kpk-${out.length}`, themeId: "eg-face-au-roi-seul", fen, line, source: "Position composée (roi et pion contre roi) — un seul coup gagne, tout autre annule (Stockfish)" });
        if (out.length >= WANTED) break search;
      }
    }
  }
}
send("quit");
writeFileSync(outPath, JSON.stringify(out, null, 1) + "\n");
console.log(JSON.stringify({ composed: out.length }));
