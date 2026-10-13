/**
 * Reconstruit la vague d'un chapitre avec des puzzles à solution UNIQUE (lot 5,
 * 2026-10-12) — voir README.md, « Remplacer une vague ambiguë ».
 *
 * 1. select : garde les puzzles du thème jugés `unique` par l'audit
 *    (`check-uniqueness.mts` + `classify-uniqueness.mjs` sur la base), puis tire
 *    des candidats du mineur pour compléter jusqu'à TARGET (2,5× le besoin, car
 *    une partie échouera au contrôle d'unicité) : parties entre titrés d'abord
 *    (`info.preferred`), une position par partie, Elo réparti.
 *      THEMES=a,b node scripts/academy-mining/waves.mjs select <candidats.json> <audit-dir> <outDir>
 *    → <outDir>/waves-sel.json et <outDir>/waves-check-in.json (entrée INPUT= de check-uniqueness).
 *
 * 2. build : ne retient que les candidats classés `unique`, complète chaque
 *    thème dans l'ordre de difficulté et écrit un `.override.json` (il REMPLACE
 *    toutes les autres sources du thème au prochain `npm run db:seed-academy`).
 *      node scripts/academy-mining/waves.mjs build <outDir> <check-dir> <fichier.override.json>
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import Database from "better-sqlite3";
import { classifyRow, readRows } from "./classify-uniqueness.mjs";

const TARGET = Number(process.env.TARGET ?? 15);
const [cmd, ...args] = process.argv.slice(2);
const db = new Database(resolve(process.cwd(), process.env.DATABASE_PATH ?? "data/chess-trainer.db"), { readonly: true });
const gameKey = (u) => u.split("#")[0].split("/").slice(0, 4).join("/");
/** Elo d'un puzzle déjà en base : « Elo 1234 » (Lichess) ou « (1234 Elo estimé) » (partie de maître). */
const ratingOf = (ref) => Number(ref?.match(/Elo (\d+)/)?.[1] ?? ref?.match(/\((\d+) Elo/)?.[1] ?? 1500);

if (cmd === "select") {
  const [candPath, auditDir, outDir] = args;
  const themes = process.env.THEMES.split(",");
  const { out } = JSON.parse(readFileSync(candPath, "utf8"));
  const cls = new Map(JSON.parse(readFileSync(join(auditDir, "classified.json"), "utf8")).map((r) => [r.id, r.cls]));
  const used = new Set(db.prepare("select source_ref from curriculum_puzzles where source_ref like 'Lichess #%'").all().map((r) => r.source_ref.match(/#(\w+)/)[1]));
  const sel = {}, checkIn = [], report = [];
  for (const theme of themes) {
    const rows = db.prepare("select id, fen, solution_san, source_ref from curriculum_puzzles where theme_id = ? order by order_index").all(theme);
    const kept = rows.filter((r) => cls.get(r.id) === "unique").map((r) => ({ fen: r.fen, moves: JSON.parse(r.solution_san), sourceRef: r.source_ref, rating: ratingOf(r.source_ref) }));
    const need = Math.max(0, TARGET - kept.length);
    const seenG = new Set(), seenF = new Set();
    const pool = (out[theme] ?? [])
      .filter((p) => !used.has(p.id) && p.popularity >= 80 && p.nbPlays >= 150)
      .sort((a, b) => Number(Boolean(b.info?.preferred)) - Number(Boolean(a.info?.preferred)) || b.popularity - a.popularity)
      .filter((p) => {
        const g = gameKey(p.gameUrl), f = p.startFen.split(" ").slice(0, 4).join(" ");
        if (seenG.has(g) || seenF.has(f)) return false;
        seenG.add(g); seenF.add(f); return true;
      });
    // Les parties de maîtres d'abord, puis le reste ; Elo réparti dans chaque groupe.
    const want = Math.ceil(need * 2.5);
    const spread = (list, k) => { const s = [...list].sort((a, b) => a.rating - b.rating); return k >= s.length ? s : Array.from({ length: k }, (_, i) => s[Math.floor(((i + 0.5) * s.length) / k)]); };
    const masters = pool.filter((p) => p.info?.preferred);
    const picked = [...spread(masters, Math.min(want, masters.length))];
    if (picked.length < want) picked.push(...spread(pool.filter((p) => !p.info?.preferred), want - picked.length));
    sel[theme] = { kept, need, candidates: picked };
    for (const p of picked) checkIn.push({ key: `${theme}/${p.id}`, theme, fen: p.startFen, solutionSan: p.solutionSan });
    report.push({ theme, inDb: rows.length, keptUnique: kept.length, need, pool: pool.length, masters: masters.length, picked: picked.length });
  }
  writeFileSync(join(outDir, "waves-sel.json"), JSON.stringify(sel, null, 1));
  writeFileSync(join(outDir, "waves-check-in.json"), JSON.stringify(checkIn));
  console.table(report);
} else if (cmd === "build") {
  const [outDir, checkDir, overridePath] = args;
  const sel = JSON.parse(readFileSync(join(outDir, "waves-sel.json"), "utf8"));
  const verdict = new Map(readRows(checkDir).map((r) => [r.id, classifyRow(r)]));
  const entries = [], report = [];
  for (const [theme, { kept, need, candidates }] of Object.entries(sel)) {
    const ok = candidates.filter((p) => verdict.get(`${theme}/${p.id}`) === "unique");
    // Garder la répartition d'Elo : on échantillonne parmi les candidats validés.
    const s = ok.sort((a, b) => a.rating - b.rating);
    const chosen = need >= s.length ? s : Array.from({ length: need }, (_, i) => s[Math.floor(((i + 0.5) * s.length) / need)]);
    const fresh = chosen.map((p) => ({
      fen: p.startFen, moves: p.solutionSan, rating: p.rating,
      sourceRef: `Lichess #${p.id} · Elo ${p.rating}${p.info?.preferred ? " · partie entre joueurs titrés" : ""} · ${p.gameUrl}`,
    }));
    const wave = [...kept, ...fresh].sort((a, b) => a.rating - b.rating);
    for (const e of wave) entries.push({ themeId: theme, fen: e.fen, moves: e.moves, sourceRef: e.sourceRef, rating: e.rating, sacrifice: false });
    report.push({ theme, kept: kept.length, need, checked: candidates.length, unique: ok.length, added: fresh.length, final: wave.length });
  }
  writeFileSync(overridePath, JSON.stringify(entries, null, 1) + "\n");
  console.table(report);
} else {
  console.error("usage : waves.mjs select|build …");
  process.exit(1);
}
