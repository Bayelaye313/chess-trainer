/**
 * Complète au palier de 15 les thèmes de l'Académie qui en ont moins, avec des
 * puzzles Lichess du mineur (`mine-lichess-puzzles.mjs`) au solveur unique.
 *
 *   node scripts/academy-mining/top-up-themes.mjs select <candidats.json> <check-in.json> [thème,…]
 *     déficit = 15 − lignes en base ; pour chaque thème en déficit couvert par
 *     les candidats : jusqu'à 4 × déficit (min. 8) candidats de 3 à 7 plis,
 *     une position par partie, aucune position déjà en base, Elo le plus proche
 *     de la médiane du thème ;
 *   node scripts/academy-mining/top-up-themes.mjs build <check-in.json> <dossier jsonl> <sortie.json>
 *     garde, par thème, les `déficit` premiers candidats « unique » (Elo le plus
 *     proche d'abord), sinon « limite » (décision utilisateur du 2026-10-13) ;
 *     écrit un fichier d'import ADDITIF (pas un override : le reste du thème
 *     est conservé).
 *
 * Le contrôle d'unicité se lance entre les deux :
 *   for i in 0 1 2 3; do INPUT=<check-in.json> SHARD=$i/4 node --import tsx scripts/academy-mining/check-uniqueness.mts <dossier>/c-$i.jsonl 16 & done; wait
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { Chess } from "chess.js";
import { classifyRow, readRows } from "./classify-uniqueness.mjs";

const TARGET = 15;
const Database = createRequire(import.meta.url)("better-sqlite3");
const db = new Database("data/chess-trainer.db", { readonly: true });
const key4 = (fen) => fen.split(" ").slice(0, 4).join(" ");
const elo = (ref) => Number(ref?.match(/Elo (\d+)/)?.[1] ?? 0);

const counts = new Map(db.prepare("select theme_id, count(*) n from curriculum_puzzles group by theme_id").all().map((r) => [r.theme_id, r.n]));
const deficit = (theme) => Math.max(0, TARGET - (counts.get(theme) ?? 0));
const medianElo = (theme) => {
  const e = db.prepare("select source_ref from curriculum_puzzles where theme_id = ?").all(theme).map((r) => elo(r.source_ref)).filter(Boolean).sort((a, b) => a - b);
  return e.length ? e[Math.floor(e.length / 2)] : 1500;
};

const [mode, ...args] = process.argv.slice(2);
if (mode === "select") {
  const [candPath, outPath, only] = args;
  const raw = JSON.parse(readFileSync(candPath, "utf8"));
  const cands = raw.out ?? raw;
  const themes = (only ? only.split(",") : Object.keys(cands)).filter((t) => deficit(t) > 0);
  const used = new Set(db.prepare("select fen from curriculum_puzzles").all().map((r) => key4(r.fen)));
  const input = [];
  for (const theme of themes) {
    const target = medianElo(theme);
    const games = new Set();
    const picks = (cands[theme] ?? [])
      .filter((x) => x.solutionSan.length >= 3 && x.solutionSan.length <= 7 && !used.has(key4(x.startFen)))
      .sort((a, b) => Math.abs(a.rating - target) - Math.abs(b.rating - target))
      .filter((x) => {
        const g = x.gameUrl.split("#")[0].replace(/\/black$/, "");
        return !games.has(g) && games.add(g);
      })
      .slice(0, Math.max(8, 4 * deficit(theme)));
    for (const x of picks) {
      used.add(key4(x.startFen));
      input.push({ key: x.id, theme, fen: x.startFen, solutionSan: x.solutionSan, rating: x.rating, sourceRef: `Lichess #${x.id} · Elo ${x.rating} · ${x.gameUrl}` });
    }
    console.log(JSON.stringify({ theme, inDb: counts.get(theme) ?? 0, deficit: deficit(theme), candidates: (cands[theme] ?? []).length, checked: picks.length, medianElo: target }));
  }
  writeFileSync(outPath, JSON.stringify(input));
} else if (mode === "build") {
  const [inPath, dir, outPath] = args;
  const input = JSON.parse(readFileSync(inPath, "utf8"));
  const verdict = new Map(readRows(dir).map((r) => [r.id, classifyRow(r)]));
  const entries = [];
  for (const theme of [...new Set(input.map((c) => c.theme))]) {
    const target = medianElo(theme);
    const list = input.filter((c) => c.theme === theme).sort((a, b) => Math.abs(a.rating - target) - Math.abs(b.rating - target));
    const unique = list.filter((c) => verdict.get(c.key) === "unique");
    const limite = list.filter((c) => verdict.get(c.key) === "limite");
    const chosen = [...unique, ...limite].slice(0, deficit(theme));
    for (const c of chosen) {
      // Coups en SAN canonique, rejoués (le mineur stocke déjà du SAN, on vérifie la légalité).
      const board = new Chess(c.fen);
      const moves = c.solutionSan.map((san) => board.move(san).san);
      entries.push({ themeId: theme, fen: c.fen, moves, sourceRef: c.sourceRef, rating: c.rating, sacrifice: false });
    }
    console.log(JSON.stringify({ theme, deficit: deficit(theme), unique: unique.length, limite: limite.length, kept: chosen.length, picks: chosen.map((c) => `${c.key}:${verdict.get(c.key)}`) }));
  }
  writeFileSync(outPath, JSON.stringify(entries, null, 2) + "\n");
  console.log(JSON.stringify({ written: entries.length, file: outPath }));
}
