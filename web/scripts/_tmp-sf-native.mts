// Stockfish natif (binaire avx2 local) pour les scripts jetables `_tmp-*` — bien plus rapide que le wasm.
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

const BIN = process.env.SF_BIN ?? "C:/Users/ab.gueye/Downloads/stockfish-windows-x86-64-avx2/stockfish/stockfish-windows-x86-64-avx2.exe";

export type Line = { kind: "cp" | "mate"; v: number; pv: string[] };

export async function startEngine(opts: { threads?: number; hash?: number; multipv?: number } = {}) {
  const proc = spawn(BIN, [], { stdio: ["pipe", "pipe", "inherit"] });
  const rl = createInterface({ input: proc.stdout });
  let listener: ((l: string) => void) | null = null;
  rl.on("line", (l) => listener?.(l));
  const send = (c: string) => proc.stdin.write(c + "\n");
  const until = (pred: (l: string) => boolean, onLine?: (l: string) => void) =>
    new Promise<void>((res) => {
      listener = (l) => {
        onLine?.(l);
        if (pred(l)) {
          listener = null;
          res();
        }
      };
    });
  let w = until((l) => l === "uciok");
  send("uci");
  await w;
  send(`setoption name Threads value ${opts.threads ?? Number(process.env.SF_THREADS ?? 2)}`);
  send(`setoption name Hash value ${opts.hash ?? Number(process.env.SF_HASH ?? 256)}`);
  send(`setoption name MultiPV value ${opts.multipv ?? 3}`);
  w = until((l) => l === "readyok");
  send("isready");
  await w;
  const cache = new Map<string, Line[]>();
  /** Lignes triées par multipv, score du point de vue du camp au trait. */
  async function analyse(fen: string, depth: number): Promise<Line[]> {
    const key = `${fen}|${depth}`;
    if (cache.has(key)) return cache.get(key)!;
    const lines = new Map<number, Line>();
    const done = until(
      (l) => l.startsWith("bestmove"),
      (l) => {
        const m = l.match(/ multipv (\d+) .*?score (cp|mate) (-?\d+).* pv (.+)$/);
        if (m) lines.set(+m[1], { kind: m[2] as "cp" | "mate", v: +m[3], pv: m[4].split(" ") });
      },
    );
    send(`position fen ${fen}`);
    send(`go depth ${depth}`);
    await done;
    const out = [...lines.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]);
    cache.set(key, out);
    return out;
  }
  return { analyse, quit: () => { send("quit"); } };
}

/** Score POV Blancs en pions (mat = ±(100 - n) pour garder un nombre). */
export function whitePawns(l: Line | undefined, turn: "w" | "b"): number | null {
  if (!l) return null;
  const s = turn === "w" ? l.v : -l.v;
  if (l.kind === "mate") return s > 0 ? 100 - s : -100 - s;
  return Math.round(s) / 100;
}
