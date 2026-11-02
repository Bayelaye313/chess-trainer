/**
 * Lecture ligne à ligne du dump officiel des puzzles Lichess
 * (`lichess_db_puzzle.csv.zst`, CC0, https://database.lichess.org/#puzzles).
 *
 * Décompresseur zstd TOLÉRANT, repris de
 * `scripts/academy-mining/mine-lichess-puzzles.mjs` : il saute les trames
 * illisibles, et lit donc aussi un téléchargement interrompu (tout ce qui
 * précède la coupure).
 */
import { closeSync, fstatSync, openSync, readSync } from "node:fs";
import type { Transform } from "node:stream";
import * as zlib from "node:zlib";

/** Présent au runtime depuis Node 22.15, absent des typings `@types/node` ^20 (même cast que `scripts/convert-lichess-puzzles-csv.ts`). */
const createZstdDecompress = (zlib as unknown as { createZstdDecompress: () => Transform }).createZstdDecompress;

const MASK = 0xfffffff0, BASE = 0x184d2a50, REAL = [0x28, 0xb5, 0x2f, 0xfd], CHUNK = 65536, MARGIN = 4 * CHUNK;
function findSkipFrame(fd: number, size: number, start: number, end: number): number | null {
  const len = Math.min(end, size) - start;
  if (len <= 0) return null;
  const buf = Buffer.alloc(len);
  readSync(fd, buf, 0, len, start);
  for (let i = 0; i + 8 <= len; i++) {
    if ((buf.readUInt32LE(i) & MASK) >>> 0 !== BASE) continue;
    const after = start + i + 8 + buf.readUInt32LE(i + 4);
    if (after === size) return after;
    if (after + 4 > size) continue;
    const c = Buffer.alloc(4);
    readSync(fd, c, 0, 4, after);
    if (c[0] === REAL[0] && c[1] === REAL[1] && c[2] === REAL[2] && c[3] === REAL[3]) return after;
  }
  return null;
}
export async function eachLine(path: string, onLine: (line: string) => void): Promise<void> {
  const fd = openSync(path, "r");
  const size = fstatSync(fd).size;
  let abs = 0, leftover = "";
  while (abs < size) {
    const seg = abs;
    abs = await new Promise<number>((resolve, reject) => {
      const d = createZstdDecompress();
      let fed = 0, settled = false;
      d.on("data", (chunk: Buffer) => {
        leftover += chunk.toString("utf8");
        let i: number;
        while ((i = leftover.indexOf("\n")) !== -1) { const l = leftover.slice(0, i); leftover = leftover.slice(i + 1); try { onLine(l); } catch { /* ligne illisible : ignorée */ } }
      });
      d.on("error", (err: Error) => {
        if (settled) return;
        settled = true;
        const f = findSkipFrame(fd, size, seg, seg + fed + MARGIN);
        // Fin de fichier tronquée (téléchargement interrompu) : on garde tout ce qui précède.
        if (f === null) {
          if (/unexpected end of file/.test(String(err?.message))) { console.error("⚠ dump tronqué : lecture arrêtée à la coupure"); return resolve(size); }
          return reject(err);
        }
        leftover = "";
        resolve(f);
      });
      d.on("close", () => { if (!settled) { settled = true; resolve(size); } });
      (function feed(): void {
        if (settled) return;
        if (seg + fed >= size) {
          d.end();
          return;
        }
        const n = Math.min(CHUNK, size - seg - fed);
        const b = Buffer.alloc(n);
        fed += readSync(fd, b, 0, n, seg + fed);
        const ok = d.write(b);
        if (settled) return;
        if (ok) setImmediate(feed); else d.once("drain", feed);
      })();
    });
  }
  closeSync(fd);
}


export interface LichessPuzzleRow {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  ratingDeviation: number;
  popularity: number;
  nbPlays: number;
  themes: string[];
  gameUrl: string;
}

export function parseRow(line: string): LichessPuzzleRow | null {
  const cols = line.split(",");
  if (cols.length < 9 || cols[0] === "PuzzleId") return null;
  return {
    id: cols[0],
    fen: cols[1],
    moves: cols[2].split(" "),
    rating: Number(cols[3]),
    ratingDeviation: Number(cols[4]),
    popularity: Number(cols[5]),
    nbPlays: Number(cols[6]),
    themes: cols[7].split(" ").filter(Boolean),
    gameUrl: cols[8],
  };
}
