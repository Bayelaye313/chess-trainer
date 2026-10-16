import Database from "better-sqlite3";

const db = new Database("data/chess-trainer.db", { readonly: true });

const themes = db.prepare("SELECT id, category, total_puzzles AS tp FROM curriculum_themes").all();
const counts = db.prepare("SELECT theme_id AS t, COUNT(*) AS c FROM curriculum_puzzles GROUP BY theme_id").all();
const byId = new Map(counts.map((r) => [r.t, r.c]));

console.log("themes_in_db", themes.length);
console.log("themes_with_puzzles", counts.length);

const empty = themes.filter((t) => !byId.has(t.id));
console.log("EMPTY_COUNT", empty.length);
console.log("EMPTY_BY_CATEGORY", JSON.stringify(countBy(empty)));

const lt12 = themes
  .filter((t) => (byId.get(t.id) ?? 0) < 12)
  .map((t) => ({ id: t.id, cat: t.category, n: byId.get(t.id) ?? 0 }));

console.log("LT12_COUNT", lt12.length);
console.log("LT12", JSON.stringify(lt12, null, 0));

function countBy(list) {
  const out = {};
  for (const t of list) out[t.category] = (out[t.category] ?? 0) + 1;
  return out;
}
