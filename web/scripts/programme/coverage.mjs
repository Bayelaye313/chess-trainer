// Couverture d'une phase en cours de vérification : les candidats déjà vérifiés suffisent-ils pour `build` ?
//
//   node scripts/programme/coverage.mjs <phase>        (depuis web/)
//
// Minimum pour construire la phase (aucune valeur chiffrée n'est écrite dans la spec, il est déduit du code) :
//   - 6 puzzles par jour de concept (PUZZLES_PER_DAY, core/programme/adaptive.ts) ;
//   - 1 blindfold par jour de concept, plus 1 par jour 7 (pris dans les blindfolds restants de la semaine) ;
//   - réserve minimale : 6 puzzles non vus par jour de concept. La porte de rétention J+7 (RETENTION_PASS)
//     fait REJOUER la semaine « avec des puzzles qu'on n'a pas encore vus » : il faut donc une séance
//     complète de rechange par jour.
// Soit 13 candidats validés par jour de concept (6 + 1 + 6), plus 1 blindfold par semaine.
// Décision : `build` directement si chaque jour a au moins 1,5 × 13 = 20 validés (constructions comprises)
// et chaque semaine au moins 2 blindfolds validés (1,5 × 1, arrondi) ; sinon, finir la vérification.
// Sortie : une ligne JSON, puis « BUILD » ou « VERIFY » (code de sortie 0 / 10).
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const WEB = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const n = Number(process.argv[2]);
if (!Number.isInteger(n)) { console.error("usage: coverage.mjs <phase>"); process.exit(1); }
const OUT = resolve(WEB, `data/programme/phase-${n}`);
const PER_DAY = 6, RESERVE_MIN = 6, BLIND = 1, MARGIN = 1.5;
const NEED_DAY = PER_DAY + BLIND + RESERVE_MIN;

const selected = JSON.parse(readFileSync(resolve(OUT, "selected.json"), "utf8"));
const results = new Map();
for (let i = 0; existsSync(resolve(OUT, `verify-${i}.jsonl`)); i++) {
  for (const l of readFileSync(resolve(OUT, `verify-${i}.jsonl`), "utf8").split("\n")) {
    if (!l) continue;
    try { const r = JSON.parse(l); results.set(r.key, r.ok); } catch { /* ligne tronquée */ }
  }
}
const total = JSON.parse(readFileSync(resolve(OUT, "verify-in.json"), "utf8")).length;
let ok = 0, ko = 0;
for (const v of results.values()) v ? ok++ : ko++;
const days = selected.map((d) => {
  const valid = d.picks.filter((p) => results.get(p.id) === true);
  const pending = d.picks.filter((p) => !results.has(p.id)).length;
  return { key: d.key, semaine: d.semaine, valid: valid.length + d.constructed.length, blind: valid.filter((p) => p.band === "blind").length, pending };
});
const weeks = [...new Set(days.map((d) => d.semaine))];
const weekBlind = weeks.map((w) => [w, days.filter((d) => d.semaine === w).reduce((s, d) => s + d.blind, 0)]);
const minimum = days.length * NEED_DAY + weeks.length;
const short = days.filter((d) => d.valid < Math.ceil(NEED_DAY * MARGIN));
const shortWeeks = weekBlind.filter(([, b]) => b < Math.ceil(MARGIN * 2));
const build = short.length === 0 && shortWeeks.length === 0 && ok >= minimum * MARGIN;
console.log(JSON.stringify({
  phase: n, verifies: results.size, total, valides: ok, rejetes: ko,
  joursConcept: days.length, minimum, minimumAvecMarge: Math.ceil(minimum * MARGIN),
  joursSousLeSeuil: short.map((d) => `${d.key}:${d.valid}(+${d.pending} à vérifier)`),
  blindfoldsParSemaine: Object.fromEntries(weekBlind),
}));
console.log(build ? "BUILD" : "VERIFY");
process.exit(build ? 0 : 10);
