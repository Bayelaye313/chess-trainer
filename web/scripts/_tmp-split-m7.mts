import { readFileSync, writeFileSync } from "node:fs";
import { Chess } from "chess.js";
const [file, outDir] = process.argv.slice(2);
const starts: Record<string, number> = { "lasker-capa": 6, "johner-nimzo": 12, "haakanson-nimzo": 14, "nimzo-rosselli": 12, "botv-capa": 8, "fischer-euwe": 14 };
const ends: Record<string, number> = { "fischer-euwe": 49 };
for (const block of readFileSync(file, "utf8").split(/^## /m).slice(1)) {
  const [name, ...rest] = block.split("\n");
  const sans = rest.filter((l) => !l.startsWith("@")).join(" ").replace(/\d+\.(\.\.)?/g, " ").split(/\s+/).filter(Boolean);
  const c = new Chess(); const k = name.trim();
  sans.slice(0, starts[k]).forEach((s) => c.move(s));
  const fen = c.fen();
  const tail = sans.slice(starts[k], ends[k] ?? sans.length);
  const c2 = new Chess(fen); const out: string[] = [];
  tail.forEach((s) => { const n = c2.moveNumber(); if (c2.turn() === "w") out.push(`${n}.`); else if (!out.length) out.push(`${n}...`); out.push(c2.move(s).san); });
  writeFileSync(`${outDir}/${k}.pgn`, `[FEN "${fen}"]\n\n${out.join(" ")} *\n`);
  console.log(k, tail.length, fen);
}
