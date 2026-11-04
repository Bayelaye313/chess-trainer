/**
 * Vérification Stockfish d'une tranche de candidats (un processus = un moteur).
 * Lancé par `generate-phase.mts` avec SHARD=i/n ; on peut aussi le lancer seul :
 *
 *   SHARD=0/3 node --import tsx scripts/programme/verify-worker.mts <candidats.json> <sortie.jsonl> [profondeur]
 *
 * Règle (reprise de `scripts/academy-mining/verify-stockfish.mjs`) : chaque coup
 * DU SOLVEUR doit être le meilleur coup, ou aussi décisif que lui (même mat, ou
 * à 30 centipions près) ; les réponses adverses sont celles de la ligne Lichess.
 * En plus, on relève les coups ÉQUIVALENTS (MultiPV 3, à 30 cp près) pour que
 * l'écran les accepte au lieu de les refuser.
 *
 * Reprise : la sortie n'est jamais vidée ; les clés déjà présentes dans
 * `<sortie.jsonl>` sont sautées. `LIMIT=<n>` arrête le processus après n
 * nouveaux candidats (un lot), pour mesurer la mémoire lot par lot et reprendre
 * sans rien refaire. Moteur en `Threads 1`, `Hash 64` (poste à 4 Go de RAM).
 */
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { Chess } from "chess.js";
import { uciMove } from "./geometry.mjs";

const [inPath, outPath, depthArg] = process.argv.slice(2);
const DEPTH = Number(depthArg ?? 18);
const TOLERANCE_CP = 30;

const require = createRequire(import.meta.url);
const originalFetch = globalThis.fetch;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handle: any = await require("stockfish")("lite-single");
if (!globalThis.fetch) globalThis.fetch = originalFetch;

function collect<T>(pred: (line: string) => T | undefined): Promise<T> {
  return new Promise((resolve) => {
    handle.listener = (line: string) => {
      const r = pred(line);
      if (r !== undefined) {
        handle.listener = null;
        resolve(r);
      }
    };
  });
}
async function cmd(c: string, until: (l: string) => true | undefined) {
  const p = collect(until);
  handle.sendCommand(c);
  return p;
}
await cmd("uci", (l) => (l === "uciok" ? true : undefined));
handle.sendCommand("setoption name Threads value 1");
handle.sendCommand(`setoption name Hash value ${Number(process.env.HASH ?? 64)}`);
handle.sendCommand("setoption name MultiPV value 3");
await cmd("isready", (l) => (l === "readyok" ? true : undefined));

interface Line { kind: "cp" | "mate"; v: number; move: string }

async function analyse(fen: string, searchmoves?: string) {
  handle.sendCommand("ucinewgame");
  await cmd("isready", (l) => (l === "readyok" ? true : undefined));
  const lines = new Map<number, Line>();
  const done = collect((l) => {
    const m = l.match(/ multipv (\d+) .*?score (cp|mate) (-?\d+).* pv (\S+)/);
    if (m) lines.set(Number(m[1]), { kind: m[2] as Line["kind"], v: Number(m[3]), move: m[4] });
    const b = l.match(/^bestmove (\S+)/);
    return b ? b[1] : undefined;
  });
  handle.sendCommand(`position fen ${fen}`);
  handle.sendCommand(`go depth ${DEPTH}${searchmoves ? ` searchmoves ${searchmoves}` : ""}`);
  const best = await done;
  return { best, lines: [...lines.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v) };
}

const score = (s: Line | undefined) => (!s ? -1e9 : s.kind === "mate" ? (s.v > 0 ? 1e6 - s.v : -1e6 - s.v) : s.v);
const fmt = (s: Line | undefined) => (!s ? "?" : s.kind === "mate" ? `M${s.v}` : `${s.v >= 0 ? "+" : ""}${(s.v / 100).toFixed(2)}`);
const equivalent = (a: Line, b: Line) =>
  (a.kind === "mate" && b.kind === "mate" && a.v > 0 && b.v > 0) || (a.kind === "cp" && b.kind === "cp" && Math.abs(a.v - b.v) <= TOLERANCE_CP);

export interface VerifyInput { key: string; fen: string; solutionUci: string[] }
export interface VerifyOutput {
  key: string;
  ok: boolean;
  firstEval: string;
  alternatives: string[][];
  plies: { uci: string; verdict: string; eval: string }[];
}

const [shard, shards] = (process.env.SHARD ?? "0/1").split("/").map(Number);
const already = new Set(
  existsSync(outPath)
    ? readFileSync(outPath, "utf8").split("\n").flatMap((l) => {
        // Une ligne tronquée (lot interrompu en pleine écriture) est ignorée : le candidat sera refait.
        try {
          return l ? [(JSON.parse(l) as VerifyOutput).key] : [];
        } catch {
          return [];
        }
      })
    : [],
);
const limit = Number(process.env.LIMIT ?? Infinity);
const items = (JSON.parse(readFileSync(inPath, "utf8")) as VerifyInput[])
  .filter((_, i) => i % shards === shard)
  .filter((it) => !already.has(it.key))
  .slice(0, limit);
console.error(`vérificateur ${shard}/${shards} : ${already.size} déjà faits, ${items.length} dans ce lot`);

for (const it of items) {
  const c = new Chess(it.fen);
  const plies: VerifyOutput["plies"] = [];
  const alternatives: string[][] = [];
  let ok = true;
  let firstEval = "?";
  for (let i = 0; i < it.solutionUci.length; i += 1) {
    const fen = c.fen();
    const uci = it.solutionUci[i];
    c.move(uciMove(uci));
    if (i % 2 === 1) {
      alternatives.push([]);
      continue;
    }
    const a = await analyse(fen);
    let solLine = a.lines.find((l) => l.move === uci);
    let verdict = "best";
    if (a.best !== uci) {
      const alt = await analyse(fen, uci);
      solLine = alt.lines[0];
      const close = !!a.lines[0] && !!solLine && (equivalent(a.lines[0], solLine) || score(solLine) >= score(a.lines[0]) || (a.lines[0].kind === "cp" && solLine.kind === "mate" && solLine.v > 0));
      verdict = close ? `equal(${fmt(solLine)})` : `FAIL(sf ${a.best} ${fmt(a.lines[0])}, sol ${fmt(solLine)})`;
      if (!close) ok = false;
    }
    if (i === 0) firstEval = fmt(solLine ?? a.lines[0]);
    alternatives.push(solLine ? a.lines.filter((l) => l.move !== uci && equivalent(l, solLine!)).map((l) => l.move) : []);
    plies.push({ uci, verdict, eval: fmt(solLine ?? a.lines[0]) });
    if (!ok) break;
  }
  const out: VerifyOutput = { key: it.key, ok, firstEval, alternatives, plies };
  appendFileSync(outPath, `${JSON.stringify(out)}\n`);
  console.error(`${ok ? "OK  " : "FAIL"} ${it.key} ${plies.map((p) => `${p.uci}:${p.verdict}`).join(" ")}`);
}
process.exit(0);
