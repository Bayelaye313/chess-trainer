/**
 * Étape 4 du pipeline (voir README.md) : assemble les fichiers d'import de
 * l'Académie à partir de la sélection et de TOUS les `vout-*.json` de Stockfish
 * — seuls les puzzles validés à chaque coup du solveur sont gardés.
 *
 *   node scripts/academy-mining/build-import.mjs <sel-all.json> <dossier des vout-*.json> <outDir> <préfixe, ex. lot4>
 *
 * Écrit `<préfixe>-motifs-verifies.override.json` (thèmes `tm-*` / `cm-*`,
 * remplacés au seed) et `<préfixe>-strategie-verifiee.json` (autres thèmes,
 * ajoutés), à déposer dans `data/import/academy/` avant `npm run db:seed-academy`.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
const [selPath, vDir, outDir, prefix] = process.argv.slice(2);
const sel = JSON.parse(readFileSync(selPath, "utf8"));
const verdict = new Map();
for (const f of readdirSync(vDir).filter((f) => /^vout-.*\.json$/.test(f))) for (const r of JSON.parse(readFileSync(`${vDir}/${f}`, "utf8"))) verdict.set(r.key, r);

const override = [], additive = [], rejected = [], summary = {};
for (const [theme, list] of Object.entries(sel)) {
  let kept = 0;
  for (const p of list) {
    const v = verdict.get(`${theme}/${p.id}`);
    if (!v || !v.ok) { rejected.push({ theme, id: p.id, why: v ? v.plies.map((x) => `${x.san}:${x.verdict}`).join(" ") : "non vérifié" }); continue; }
    const entry = { themeId: theme, fen: p.startFen, moves: p.solutionSan, sourceRef: `Lichess #${p.id} · Elo ${p.rating} · ${p.gameUrl}`, rating: p.rating, sacrifice: /sacrifice/.test(p.themes) };
    (theme.startsWith("tm-") || theme.startsWith("cm-") ? override : additive).push(entry);
    kept++;
  }
  summary[theme] = kept;
}
writeFileSync(`${outDir}/${prefix}-motifs-verifies.override.json`, JSON.stringify(override, null, 2));
writeFileSync(`${outDir}/${prefix}-strategie-verifiee.json`, JSON.stringify(additive, null, 2));
console.log("override:", override.length, "additif:", additive.length, "rejetés:", rejected.length);
for (const r of rejected) console.log("REJET", r.theme, r.id, r.why);
console.log(JSON.stringify(summary));
