/**
 * Mat Roi + Dame contre Roi : positions pour `cm-mat-roi-et-dame-contre-roi`.
 *
 * Deux sources, au format de `book-positions.mts` (`[{ key, themeId, fen, line, source }]`) :
 *   1. les diagrammes K+D contre R du livre de Polgár (`polgar-positions.mjs`, filtre KQ-K),
 *      mat en 2 ou 3 (les mats en 1 sont écartés par le filtre qualité du seed) ;
 *   2. des positions COMPOSÉES — dernière phase de la méthode de la boîte : roi
 *      noir sur la 8e rangée, roi blanc à ≤ 2 cases, mat en 2 ou 3 — retenues
 *      seulement si elles contiennent un PIÈGE DE PAT (au moins un coup de dame
 *      qui pat le roi noir). Annoncées « composées » dans `source`, jamais
 *      attribuées à un livre.
 *
 * Distance au mat et ligne principale : Stockfish natif (même binaire que
 * `check-uniqueness.mts`), qui résout ces finales instantanément. La ligne
 * passe ensuite le contrôle d'unicité comme tout le reste (verdict « toleree »
 * admis pour ce thème, voir `BRUTE_FORCE_THEME_IDS`).
 *
 *   node scripts/academy-mining/kqk-positions.mjs <polgar-kqk.json> <sortie.json> [nombre composé, défaut 9]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { Chess } from "chess.js";

const BIN = "C:/Users/ab.gueye/Downloads/stockfish-windows-x86-64-avx2/stockfish/stockfish-windows-x86-64-avx2.exe";
const [polgarPath, outPath, nArg] = process.argv.slice(2);
const WANTED = Number(nArg ?? 9);
const THEME = "cm-mat-roi-et-dame-contre-roi";

const sf = spawn(BIN, [], { stdio: ["pipe", "pipe", "inherit"] });
const rl = createInterface({ input: sf.stdout });
let listener = null;
rl.on("line", (l) => listener?.(l));
const send = (c) => sf.stdin.write(c + "\n");
const until = (pred, on) => new Promise((res) => { listener = (l) => { on?.(l); if (pred(l)) { listener = null; res(); } }; });
let w = until((l) => l === "uciok");
send("uci");
await w;
w = until((l) => l === "readyok");
send("isready");
await w;

/** `{ mate, pv }` vu des Blancs (trait aux Blancs) ; mate = null si pas de mat trouvé. */
async function analyse(fen) {
  let mate = null;
  let pv = [];
  const done = until((l) => l.startsWith("bestmove"), (l) => {
    const m = l.match(/score mate (-?\d+).* pv (.+)$/);
    if (m) [mate, pv] = [Number(m[1]), m[2].split(" ")];
  });
  send("ucinewgame");
  send(`position fen ${fen}`);
  send("go depth 14");
  await done;
  return { mate, pv };
}

/** Ligne en SAN depuis la PV UCI de Stockfish, jusqu'au mat. */
function sanLine(fen, pv) {
  const c = new Chess(fen);
  const out = [];
  for (const u of pv) {
    out.push(c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san);
    if (c.isCheckmate()) break;
  }
  return c.isCheckmate() ? out : null;
}

function stalemateTraps(fen) {
  const c = new Chess(fen);
  return c.moves({ verbose: true }).filter((m) => m.piece === "q").filter((m) => {
    c.move(m);
    const s = c.isStalemate();
    c.undo();
    return s;
  }).map((m) => m.san);
}

const out = [];
for (const p of JSON.parse(readFileSync(polgarPath, "utf8"))) {
  const { mate, pv } = await analyse(p.fen);
  if (mate !== 2 && mate !== 3) continue;
  const line = sanLine(p.fen, pv);
  if (!line) continue;
  out.push({ key: `polgar-${p.no}`, themeId: THEME, fen: p.fen, line, source: `László Polgár, « Chess: 5334 Problems, Combinations and Games », n° ${p.no} — mat en ${mate}` });
}

// Compositions : énumération déterministe, roi noir a8-d8 (e8-h8 = symétriques).
const groups = new Set();
let composed = 0;
const toSq = (i) => "abcdefgh"[i % 8] + (Math.floor(i / 8) + 1);
outer: for (let bf = 0; bf < 4; bf++) {
  const bk = 56 + bf;
  for (let wk = 0; wk < 64; wk++) {
    if (Math.max(Math.abs((wk % 8) - bf), Math.abs(Math.floor(wk / 8) - 7)) > 2 || wk === bk) continue;
    for (let wq = 0; wq < 64; wq++) {
      if (wq === bk || wq === wk) continue;
      const c = new Chess();
      c.clear();
      c.put({ type: "k", color: "b" }, toSq(bk));
      c.put({ type: "k", color: "w" }, toSq(wk));
      c.put({ type: "q", color: "w" }, toSq(wq));
      const fen = c.fen().replace(/ [wb] .*/, " w - - 0 1");
      let board;
      try {
        board = new Chess(fen);
        if (new Chess(fen.replace(" w ", " b ")).inCheck()) continue; // Noirs en échec, trait aux Blancs : illégal
      } catch {
        continue;
      }
      if (board.isGameOver()) continue;
      const traps = stalemateTraps(fen);
      if (traps.length === 0) continue;
      const { mate, pv } = await analyse(fen);
      if (mate !== 2 && mate !== 3) continue;
      // Diversité : une position par (colonne du roi noir, distance au mat, nombre de pièges > 1).
      const group = `${bf}|${mate}|${traps.length > 1}`;
      if (groups.has(group)) continue;
      const line = sanLine(fen, pv);
      if (!line) continue;
      groups.add(group);
      out.push({ key: `kqk-${composed}`, themeId: THEME, fen, line, source: `Position composée (méthode de la boîte, dernière phase) — mat en ${mate} ; piège de pat : ${traps.join(", ")}` });
      composed += 1;
      if (composed >= WANTED) break outer;
    }
  }
}
send("quit");
writeFileSync(outPath, JSON.stringify(out, null, 1) + "\n");
console.log(JSON.stringify({ polgar: out.length - composed, composed }));
