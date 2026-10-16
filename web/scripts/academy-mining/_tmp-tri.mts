import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { Chess } from "chess.js";
import { describeMatePatterns } from "../../src/core/chess/mate-patterns";
const Database = createRequire(import.meta.url)("better-sqlite3");
const db = new Database("data/chess-trainer.db", { readonly: true });
const cls = new Map(JSON.parse(readFileSync("data/uniq-training/classified.json", "utf8")).map((c: any) => [c.id, c.cls]));
const [theme, pattern] = process.argv.slice(2);
for (const r of db.prepare("select * from curriculum_puzzles where theme_id=? and source_file is not null").all(theme) as any[]) {
  if (cls.get(r.id) !== "unique") continue;
  const c = new Chess(r.fen); for (const u of JSON.parse(r.solution)) c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });
  if (c.isCheckmate() && describeMatePatterns(c.fen()).includes(pattern as any)) console.log(JSON.parse(r.solution).length, (r.source_ref.match(/Elo (\d+)/) ?? [])[1], r.id, JSON.parse(r.solution_san).join(" "));
}
