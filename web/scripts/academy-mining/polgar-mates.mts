/**
 * Mats du livre de Polgár (`polgar-positions.mjs`) dont la position finale
 * relève d'un motif géométrique de `core/chess/mate-patterns.ts` — même
 * contrôle que les détecteurs Lichess (`describeMatePatterns`), appliqué à une
 * source exacte (diagrammes en police d'échecs, pas de transcription).
 *
 *   node --import tsx scripts/academy-mining/polgar-mates.mts <polgar-all.json> <motif> <themeId> <sortie.json> [mat max, défaut 3]
 *
 * Stockfish natif donne le mat le plus court et sa ligne ; un mat en 1 est
 * écarté (filtre qualité du seed). Sortie au format de `book-positions.mts`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { Chess } from "chess.js";
import { describeMatePatterns } from "../../src/core/chess/mate-patterns";

const BIN = "C:/Users/ab.gueye/Downloads/stockfish-windows-x86-64-avx2/stockfish/stockfish-windows-x86-64-avx2.exe";
const [inPath, pattern, themeId, outPath, maxArg] = process.argv.slice(2);
const MAX = Number(maxArg ?? 3);

const sf = spawn(BIN, [], { stdio: ["pipe", "pipe", "inherit"] });
const rl = createInterface({ input: sf.stdout });
let listener: ((l: string) => void) | null = null;
rl.on("line", (l) => listener?.(l));
const send = (c: string) => sf.stdin.write(c + "\n");
const until = (pred: (l: string) => boolean, on?: (l: string) => void) =>
  new Promise<void>((res) => {
    listener = (l) => {
      on?.(l);
      if (pred(l)) {
        listener = null;
        res();
      }
    };
  });
let w = until((l) => l === "uciok");
send("uci");
await w;
w = until((l) => l === "readyok");
send("isready");
await w;

async function analyse(fen: string): Promise<{ mate: number | null; pv: string[] }> {
  let mate: number | null = null;
  let pv: string[] = [];
  const done = until(
    (l) => l.startsWith("bestmove"),
    (l) => {
      const m = l.match(/score (cp|mate) (-?\d+).* pv (.+)$/);
      if (m) [mate, pv] = [m[1] === "mate" ? Number(m[2]) : null, m[3].split(" ")];
    },
  );
  send(`position fen ${fen}`);
  send(`go depth ${2 * MAX + 4}`);
  await done;
  return { mate, pv };
}

const positions = JSON.parse(readFileSync(inPath, "utf8")) as { no: number; fen: string }[];
const out = [];
let n = 0;
for (const p of positions) {
  if (++n % 500 === 0) console.error(`${n}/${positions.length} — ${out.length} retenus`);
  // Stockfish plante sur une position illégale (camp qui n'a pas le trait en échec) : écartée d'avance.
  const probe = new Chess(p.fen);
  if (probe.isGameOver() || new Chess(p.fen.replace(" w ", " b ")).inCheck()) continue;
  const { mate, pv } = await analyse(p.fen);
  if (mate === null || mate < 2 || mate > MAX) continue;
  const c = new Chess(p.fen);
  const line: string[] = [];
  for (const u of pv) {
    line.push(c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san);
    if (c.isCheckmate()) break;
  }
  if (!c.isCheckmate() || !describeMatePatterns(c.fen()).includes(pattern as never)) continue;
  out.push({ key: `polgar-${p.no}`, themeId, fen: p.fen, line, source: `László Polgár, « Chess: 5334 Problems, Combinations and Games », n° ${p.no} — mat en ${mate}` });
}
send("quit");
writeFileSync(outPath, JSON.stringify(out, null, 1) + "\n");
console.log(JSON.stringify({ scanned: positions.length, kept: out.length, pattern }));
