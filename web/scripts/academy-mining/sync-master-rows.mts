/**
 * Aligne les lignes `<thème>::master:<n>` de `curriculum_puzzles` sur
 * `MASTER_PUZZLES_DATASET` (FEN, solution, source) par UPDATE en place.
 *
 * `npm run populate:puzzles` fait la même projection, mais purge la table et
 * remet à zéro `user_theme_progress` des thèmes visés : à utiliser ici quand
 * seules des entrées existantes du dataset ont été corrigées (même nombre
 * d'exercices par thème, progression conservée).
 *
 *   node --import tsx scripts/academy-mining/sync-master-rows.mts [--dry-run]
 */
import { createRequire } from "node:module";
import { MASTER_PUZZLES_DATASET } from "../../src/core/curriculum/master-puzzles-dataset";

const Database = createRequire(import.meta.url)("better-sqlite3");
const db = new Database("data/chess-trainer.db");
const dryRun = process.argv.includes("--dry-run");

const index = new Map<string, number>();
const update = db.prepare("update curriculum_puzzles set fen = ?, solution = ?, solution_san = ?, source_ref = ? where id = ?");
const get = db.prepare("select fen, solution, solution_san, source_ref from curriculum_puzzles where id = ?");
let changed = 0;
let missing = 0;
db.transaction(() => {
  for (const p of MASTER_PUZZLES_DATASET) {
    const n = index.get(p.themeId) ?? 0;
    index.set(p.themeId, n + 1);
    const id = `${p.themeId}::master:${n}`;
    const row = get.get(id);
    if (!row) {
      missing++;
      continue;
    }
    const next = [p.fen, JSON.stringify(p.solution), JSON.stringify(p.solutionSan), `${p.sourceRef} (${p.rating} Elo estimé)`];
    if (row.fen === next[0] && row.solution === next[1] && row.solution_san === next[2] && row.source_ref === next[3]) continue;
    changed++;
    console.log(`${id} : ${JSON.parse(row.solution_san).join(" ")} → ${p.solutionSan.join(" ")}`);
    if (!dryRun) update.run(...next, id);
  }
})();
console.log(`${changed} ligne(s) master ${dryRun ? "à mettre à jour" : "mises à jour"}, ${missing} absente(s) de la base.`);
