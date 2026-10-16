/**
 * Lot 7 — remplace dans `master-puzzles-dataset.ts` les exercices master ambigus
 * (plan `data/uniq-training/lot7-masters.json`, voir `_tmp-lot7-plan.mjs`) et
 * retire les droits de roque impossibles des FEN du dataset.
 *
 *   node --import tsx scripts/academy-mining/_tmp-lot7-apply-masters.mts <plan.json>...
 */
import { readFileSync, writeFileSync } from "node:fs";
import { sanitizeCastlingRights } from "../../src/core/curriculum/academy-parser";

const FILE = "src/core/curriculum/master-puzzles-dataset.ts";
type Plan = { themeId: string; masterIndex: number; oldFen: string; fen: string; solution: string[]; solutionSan: string[]; rating: number; sourceRef: string };
const plans: Plan[] = process.argv.slice(2).flatMap((p) => JSON.parse(readFileSync(p, "utf8")));

let src = readFileSync(FILE, "utf8");
const entryRe = /  \{\n    themeId: "([^"]+)",\n    fen: "([^"]+)",\n    solution: \[[^\]]*\],\n    solutionSan: \[[^\]]*\],\n    rating: \d+,\n    sourceRef: ("(?:[^"\\]|\\.)*"),\n  \}/g;

const seen = new Map<string, number>();
let replaced = 0;
let sanitized = 0;
src = src.replace(entryRe, (whole, themeId: string, fen: string) => {
  const n = seen.get(themeId) ?? 0;
  seen.set(themeId, n + 1);
  const plan = plans.find((p) => p.themeId === themeId && p.masterIndex === n);
  if (plan) {
    if (sanitizeCastlingRights(plan.oldFen) !== sanitizeCastlingRights(fen)) throw new Error(`${themeId}#${n} : FEN inattendue ${fen}`);
    replaced++;
    return [
      "  {",
      `    themeId: "${themeId}",`,
      `    fen: "${sanitizeCastlingRights(plan.fen)}",`,
      `    solution: ${JSON.stringify(plan.solution).replace(/,/g, ",")},`,
      `    solutionSan: ${JSON.stringify(plan.solutionSan)},`,
      `    rating: ${plan.rating},`,
      `    sourceRef: ${JSON.stringify(`${plan.sourceRef} — remplace en 2026-10 un exercice à plusieurs bonnes réponses (audit d'unicité, lot 7).`)},`,
      "  }",
    ].join("\n");
  }
  const clean = sanitizeCastlingRights(fen);
  if (clean === fen) return whole;
  sanitized++;
  return whole.replace(`fen: "${fen}"`, `fen: "${clean}"`);
});

const missing = plans.filter((p) => (seen.get(p.themeId) ?? 0) <= p.masterIndex);
if (replaced !== plans.length) throw new Error(`${replaced}/${plans.length} remplacés — introuvables : ${missing.map((p) => p.themeId).join(", ")}`);
writeFileSync(FILE, src);
console.log(`entrées lues ${[...seen.values()].reduce((a, b) => a + b, 0)}, remplacées ${replaced}, FEN roque corrigées ${sanitized}`);
