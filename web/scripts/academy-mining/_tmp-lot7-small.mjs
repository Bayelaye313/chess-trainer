/**
 * Lot 7 — thèmes à 15 (mg-*, ps-*) dont l'exercice master est ambigu : candidats
 * du mineur → contrôle d'unicité → plan de remplacement du master.
 *
 *   node scripts/academy-mining/_tmp-lot7-small.mjs select <candidats.json> <check-in.json>
 *   node scripts/academy-mining/_tmp-lot7-small.mjs build <check-in.json> <dossier jsonl> <plan.json>
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { Chess } from "chess.js";
import { classifyRow, readRows } from "./classify-uniqueness.mjs";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");
const db = new Database("data/chess-trainer.db", { readonly: true });
const PER_THEME = 8;
const key4 = (fen) => fen.split(" ").slice(0, 4).join(" ");

const cls = new Map(JSON.parse(readFileSync("data/uniq-training/classified.json", "utf8")).map((c) => [c.id, c.cls]));
const badMasters = db
  .prepare("select id, theme_id, fen, source_ref from curriculum_puzzles where source_file is null and (theme_id like 'mg-%' or theme_id like 'ps-%')")
  .all()
  .filter((r) => cls.get(r.id) === "ambigue" || cls.get(r.id) === "fausse");
const targetElo = (r) => Number(r.source_ref?.match(/\((\d+) Elo estimé\)/)?.[1] ?? 1800);

const [mode, ...args] = process.argv.slice(2);
if (mode === "select") {
  const [candPath, outPath] = args;
  const { out } = JSON.parse(readFileSync(candPath, "utf8"));
  const used = new Set(db.prepare("select fen from curriculum_puzzles").all().map((r) => key4(r.fen)));
  const input = [];
  for (const m of badMasters) {
    const seenGames = new Set();
    const picks = (out[m.theme_id] ?? [])
      .filter((x) => x.solutionSan.length >= 3 && x.solutionSan.length <= 7 && !used.has(key4(x.startFen)))
      .sort((a, b) => Math.abs(a.rating - targetElo(m)) - Math.abs(b.rating - targetElo(m)))
      .filter((x) => !seenGames.has(x.gameUrl.split("#")[0]) && seenGames.add(x.gameUrl.split("#")[0]))
      .slice(0, PER_THEME);
    console.log(`${m.theme_id.padEnd(40)} ${String((out[m.theme_id] ?? []).length).padStart(5)} candidats, ${picks.length} retenus (cible ${targetElo(m)} Elo)`);
    for (const x of picks) {
      used.add(key4(x.startFen));
      input.push({ key: x.id, theme: m.theme_id, fen: x.startFen, solutionSan: x.solutionSan, rating: x.rating, sourceRef: `Lichess #${x.id} · Elo ${x.rating} · ${x.gameUrl}` });
    }
  }
  writeFileSync(outPath, JSON.stringify(input));
} else if (mode === "build") {
  const [inPath, dir, planPath] = args;
  const input = new Map(JSON.parse(readFileSync(inPath, "utf8")).map((c) => [c.key, c]));
  const rows = readRows(dir).filter((r) => input.has(r.id));
  const plan = [];
  for (const m of badMasters) {
    const ok = rows
      .filter((r) => r.theme === m.theme_id && classifyRow(r) === "unique")
      .map((r) => input.get(r.id))
      .sort((a, b) => Math.abs(a.rating - targetElo(m)) - Math.abs(b.rating - targetElo(m)));
    if (!ok.length) {
      console.log(`${m.theme_id} : AUCUN candidat unique`);
      continue;
    }
    const c = ok[0];
    const board = new Chess(c.fen);
    const solution = c.solutionSan.map((san) => {
      const mv = board.move(san);
      return mv.from + mv.to + (mv.promotion ?? "");
    });
    plan.push({ themeId: m.theme_id, masterIndex: Number(m.id.split("::master:")[1]), oldFen: m.fen, fen: c.fen, solution, solutionSan: c.solutionSan, rating: c.rating, sourceRef: c.sourceRef });
    console.log(`${m.theme_id.padEnd(40)} ${ok.length} uniques → ${c.solutionSan.join(" ")} (${c.rating})`);
  }
  writeFileSync(planPath, JSON.stringify(plan, null, 1));
}
