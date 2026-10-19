import Database from "better-sqlite3";
import { Chess } from "chess.js";
import { writeFileSync } from "node:fs";
const db = new Database("data/chess-trainer.db", { readonly: true });
const rows = db.prepare("select id, pgn, player_color c, result, opening_name, source, termination from games where pgn is not null").all() as any[];
const out: any[] = [];
for (const r of rows) {
  const g = new Chess();
  try { g.loadPgn(r.pgn); } catch { continue; }
  const h = g.history();
  const res = r.result; // ex 1-0
  const me = r.c === "white" || r.c === "w" ? "w" : "b";
  let score = 0.5;
  if (res === "1-0") score = me === "w" ? 1 : 0; else if (res === "0-1") score = me === "b" ? 1 : 0;
  out.push({ id: r.id, me, score, res, name: r.opening_name, moves: h.slice(0, 30), src: r.source });
}
writeFileSync(process.argv[2], JSON.stringify(out));
console.log(out.length, rows.length, [...new Set(rows.map(r=>r.player_color))], [...new Set(rows.map(r=>r.result))]);
