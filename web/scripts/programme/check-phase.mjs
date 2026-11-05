// Contrôles d'une phase générée (src/core/programme/content/phase-<n>.json), depuis web/ :
//
//   node scripts/programme/check-phase.mjs <phase>
//
// - 6 puzzles et un blindfold par jour de concept (jours 1 à 6) ;
// - aucun doublon : puzzle_id (puzzles, réserve, blindfolds) et partie d'origine Lichess, dans la phase
//   ET avec les phases précédentes (parties relues dans data/programme/phase-<k>/selected.json) ;
// - positions légales : FEN chargée par chess.js, solution_uci rejouée coup par coup, coup d'installation
//   cohérent avec la FEN affichée ;
// - difficulté croissante : elo_cible jamais décroissant, médiane hebdomadaire des ratings croissante ;
// - rating médian de la phase et jours dont la médiane s'écarte de plus de 150 de l'Elo cible.
// Code de sortie 1 s'il y a des erreurs.
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const WEB = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(`${WEB}/package.json`);
const { Chess } = require("chess.js");
const n = Number(process.argv[2]);
const load = (k) => JSON.parse(readFileSync(`${WEB}/src/core/programme/content/phase-${k}.json`, "utf8"));
const gameOf = new Map();
for (let k = 1; k <= n; k++) {
  const f = `${WEB}/data/programme/phase-${k}/selected.json`;
  if (!existsSync(f)) continue;
  for (const d of JSON.parse(readFileSync(f, "utf8"))) for (const p of d.picks) gameOf.set(p.id, /lichess\.org\/(?:game\/)?([A-Za-z0-9]{8})/.exec(p.row.gameUrl ?? "")?.[1] ?? p.row.gameUrl);
}
const all = (d) => [...d.puzzles.map((p) => ["puzzle", p]), ...(d.reserve ?? []).map((p) => ["reserve", p]), ...(d.exercice_blindfold ? [["blindfold", d.exercice_blindfold]] : [])];
const prevIds = new Set(), prevGames = new Set();
for (let k = 1; k < n; k++) for (const d of load(k).jours) for (const [, p] of all(d)) { prevIds.add(p.puzzle_id); const g = gameOf.get(p.puzzle_id); if (g) prevGames.add(g); }
const ph = load(n);
const errs = [];
const ids = new Map(), games = new Map();
let nPuzzles = 0, nReserve = 0, nBlind = 0, unknownGame = 0, constructed = 0;
const ratingsMain = [], dayMed = [];
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN; };
for (const d of ph.jours) {
  const key = `S${d.semaine}J${d.jour}`;
  if (d.jour !== 7 && d.puzzles.length !== 6) errs.push(`${key}: ${d.puzzles.length} puzzles`);
  if (d.jour !== 7 && !d.exercice_blindfold) errs.push(`${key}: pas de blindfold`);
  const r = [];
  for (const [role, p] of all(d)) {
    if (role === "puzzle") { nPuzzles++; if (p.rating_lichess) { ratingsMain.push(p.rating_lichess); r.push(p.rating_lichess); } }
    else if (role === "reserve") nReserve++; else nBlind++;
    if (p.source !== "lichess_puzzle_db") { constructed++; }
    const id = p.puzzle_id;
    if (ids.has(id)) errs.push(`doublon interne ${id} (${ids.get(id)} / ${key})`); else ids.set(id, key);
    if (prevIds.has(id)) errs.push(`doublon avec phase précédente ${id} ${key}`);
    if (p.source === "lichess_puzzle_db") {
      const g = gameOf.get(id);
      if (!g) unknownGame++;
      else { if (games.has(g)) errs.push(`partie d'origine en double ${g} (${games.get(g)} / ${key} ${id})`); else games.set(g, `${key} ${id}`); if (prevGames.has(g)) errs.push(`partie d'origine déjà utilisée avant ${g} ${key}`); }
    }
    const fen = p.fen ?? p.fen_affichee_une_fois;
    try {
      const c = new Chess(fen);
      for (const u of p.solution_uci) c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });
    } catch (e) { errs.push(`illégal ${key} ${id}: ${e.message.slice(0, 80)}`); }
    if (p.coup_installation) { try { const c = new Chess(p.coup_installation.fen_avant); const u = p.coup_installation.uci; c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }); if (c.fen().split(" ").slice(0, 4).join(" ") !== fen.split(" ").slice(0, 4).join(" ")) errs.push(`installation incohérente ${id}`); } catch (e) { errs.push(`installation illégale ${id}`); } }
  }
  if (d.jour !== 7) dayMed.push([key, d.elo_cible, median(r)]);
}
// difficulté croissante : elo_cible non décroissant, et médiane par semaine croissante
const weeks = [...new Set(ph.jours.map((d) => d.semaine))].sort((a, b) => a - b);
const wk = weeks.map((w) => [w, median(ph.jours.filter((d) => d.semaine === w).flatMap((d) => d.puzzles.map((p) => p.rating_lichess).filter(Boolean)))]);
let prev = -Infinity; for (const d of ph.jours) { if (d.elo_cible < prev) errs.push(`elo_cible décroît en S${d.semaine}J${d.jour}`); prev = d.elo_cible; }
for (let i = 1; i < wk.length; i++) if (wk[i][1] < wk[i - 1][1]) errs.push(`médiane hebdo décroît S${wk[i][0]} (${wk[i][1]} < ${wk[i - 1][1]})`);
const targets = ph.jours.map((d) => d.elo_cible);
// Cohérence avec la spec : la médiane des ratings doit rester à 50 points de la médiane des Elo cibles des jours de concept.
const targetMedian = median(ph.jours.filter((d) => d.jour !== 7).map((d) => d.elo_cible));
if (Math.abs(median(ratingsMain) - targetMedian) > 50) errs.push(`rating médian ${median(ratingsMain)} loin de la cible ${targetMedian}`);
console.log(JSON.stringify({ phase: n, jours: ph.jours.length, joursConcept: ph.jours.filter((d) => d.jour !== 7).length, puzzles: nPuzzles, reserve: nReserve, blindfolds: nBlind, construits: constructed, partieInconnue: unknownGame, ratingMedian: median(ratingsMain), ratingMin: Math.min(...ratingsMain), ratingMax: Math.max(...ratingsMain), eloCible: [Math.min(...targets), Math.max(...targets)], medianeCible: targetMedian, medianesHebdo: wk }));
const off = dayMed.filter(([, t, m]) => Math.abs(m - t) > 150);
if (off.length) console.log("jours dont la médiane s'écarte de >150 de la cible:", off.map((x) => x.join(":")).join(" "));
console.log(errs.length ? `ERREURS (${errs.length}):\n${errs.slice(0, 40).join("\n")}` : "aucune erreur");
process.exit(errs.length ? 1 : 0);
