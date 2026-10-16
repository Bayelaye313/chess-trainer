/**
 * Lot 7 (2026-10-16) — onglet Entraînement : plan de nettoyage tiré de l'audit
 * d'unicité (`data/uniq-training/classified.json`).
 *
 *   node scripts/academy-mining/_tmp-lot7-plan.mjs
 *
 * Écrit :
 *   data/uniq-training/lot7-exclude.json   puzzles importés à ne plus importer
 *   data/uniq-training/lot7-masters.json   remplacement des exercices master ambigus
 *                                          des grands thèmes (puzzle unique importé d'Elo voisin)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");
const db = new Database("data/chess-trainer.db", { readonly: true });

// Thèmes laissés de côté : pas de remplaçant unique possible (KQK : tout mat se gagne
// de plusieurs façons) ou déjà suivis à part (eg-mats-de-force : lot dédié en attente).
const SKIP = new Set(["cm-mat-roi-et-dame-contre-roi", "eg-mats-de-force-ecrasante"]);
// Thèmes à 15 : le master est remplacé par un puzzle neuf du mineur (étape séparée).
const SMALL = (t) => t.startsWith("mg-") || t.startsWith("ps-");

const cls = new Map(JSON.parse(readFileSync("data/uniq-training/classified.json", "utf8")).map((c) => [c.id, c.cls]));
const rows = db.prepare("select id, theme_id, fen, solution, solution_san, source_ref, source_file from curriculum_puzzles").all();
const BAD = new Set(["ambigue", "fausse"]);
const elo = (r) => Number((r.source_ref ?? "").match(/Elo (\d+)/)?.[1] ?? 0);

const exclude = [];
const masters = [];
const byTheme = new Map();
for (const r of rows) {
  if (!cls.has(r.id)) continue;
  if (!byTheme.has(r.theme_id)) byTheme.set(r.theme_id, []);
  byTheme.get(r.theme_id).push(r);
}

for (const [theme, list] of byTheme) {
  if (SKIP.has(theme)) continue;
  for (const r of list) {
    if (!BAD.has(cls.get(r.id))) continue;
    if (r.source_file) {
      exclude.push({ themeId: theme, fen: r.fen, moves: JSON.parse(r.solution_san), reason: `lot7 ${cls.get(r.id)}` });
      continue;
    }
    if (SMALL(theme)) continue;
    // Master ambigu d'un grand thème : promu = puzzle importé unique de 3 à 7 plis dont l'Elo
    // est le plus proche de l'ancien master (c'est le premier exercice servi du thème).
    const target = Number((r.source_ref ?? "").match(/\((\d+) Elo estimé\)/)?.[1] ?? 1500);
    const plies = (x) => JSON.parse(x.solution).length;
    const pick = list
      .filter((x) => x.source_file && cls.get(x.id) === "unique" && plies(x) >= 3 && plies(x) <= 7 && elo(x) > 0)
      .sort((a, b) => Math.abs(elo(a) - target) - Math.abs(elo(b) - target))[0];
    if (!pick) throw new Error(`aucun remplaçant unique pour ${theme}`);
    const [, idx] = r.id.split("::master:");
    masters.push({
      themeId: theme,
      masterIndex: Number(idx),
      oldFen: r.fen,
      fen: pick.fen,
      solution: JSON.parse(pick.solution),
      solutionSan: JSON.parse(pick.solution_san),
      rating: elo(pick) || 1500,
      sourceRef: (pick.source_ref ?? "").trim(),
    });
    exclude.push({ themeId: theme, fen: pick.fen, moves: JSON.parse(pick.solution_san), reason: "lot7 promu exercice master" });
  }
}

writeFileSync("data/uniq-training/lot7-exclude.json", JSON.stringify(exclude, null, 1));
writeFileSync("data/uniq-training/lot7-masters.json", JSON.stringify(masters, null, 1));
console.log(`exclusions ${exclude.length} (dont ${masters.length} promus), masters remplacés ${masters.length}`);
