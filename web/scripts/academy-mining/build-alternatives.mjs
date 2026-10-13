/**
 * Construit `src/core/curriculum/puzzle-alternatives.json` (coups équivalents
 * acceptés par le solveur) à partir des sorties de `analyse-alternatives.mts`.
 *
 *   node scripts/academy-mining/build-alternatives.mjs <dossier des out-*.jsonl>
 *
 * Un coup est accepté à un pli du joueur s'il garde au moins la valeur de la
 * solution (à 3 points de probabilité de gain près) ET celle du meilleur coup
 * (à 5 points près). Les tables existantes sont fusionnées : relancer sur un
 * nouveau lot n'efface pas les précédents.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Chess } from "chess.js";

const dir = process.argv[2];
const OUT = "src/core/curriculum/puzzle-alternatives.json";
const cp = (s) => (s.kind === "mate" ? (s.v > 0 ? 10000 - s.v : -10000 - s.v) : s.v);
// Probabilité de gain façon Lichess (centipions → %).
const wp = (c) => 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * Math.max(-2000, Math.min(2000, c)))) - 1);

const table = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
let puzzles = 0, moves = 0;
for (const f of readdirSync(dir).filter((f) => f.startsWith("out-") && f.endsWith(".jsonl"))) {
  for (const line of readFileSync(join(dir, f), "utf8").split("\n").filter(Boolean)) {
    const r = JSON.parse(line);
    const byPly = {};
    for (const p of r.plies) {
      if (!p.solLine || !p.lines.length) continue;
      const sol = wp(cp(p.solLine));
      const best = wp(cp(p.lines[0]));
      const legal = new Set(new Chess(p.fen).moves({ verbose: true }).map((m) => m.from + m.to + (m.promotion ?? "")));
      const alts = p.lines
        .filter((l) => l.move !== p.sol && legal.has(l.move))
        .filter((l) => wp(cp(l)) >= sol - 3 && wp(cp(l)) >= best - 5)
        // Solution qui force le mat : seul un mat au moins aussi rapide est équivalent
        // (près de 100 %, la probabilité de gain ne distingue plus « mate » de « gagne »).
        .filter((l) => p.solLine.kind !== "mate" || p.solLine.v < 0 || (l.kind === "mate" && l.v > 0 && l.v <= p.solLine.v))
        .map((l) => l.move);
      if (alts.length) byPly[String(p.i)] = alts;
    }
    const key = `${r.fen}|${r.solution.join(" ")}`;
    if (Object.keys(byPly).length) {
      table[key] = byPly;
      puzzles++;
      moves += Object.values(byPly).flat().length;
    } else delete table[key];
  }
}
const sorted = Object.fromEntries(Object.keys(table).sort().map((k) => [k, table[k]]));
writeFileSync(OUT, JSON.stringify(sorted, null, 0).replace(/\],"/g, '],\n"') + "\n");
console.log(`${puzzles} puzzles avec alternatives (${moves} coups) ; table : ${Object.keys(sorted).length} entrées`);
