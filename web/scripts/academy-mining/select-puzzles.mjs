/**
 * Étape 2 du pipeline (voir README.md) : choisit, parmi les candidats du
 * mineur, jusqu'à 15 puzzles par thème — paliers de qualité Lichess
 * (popularité / nombre de parties), une seule position par partie, aucun
 * puzzle déjà présent dans l'Académie, quelques puzzles côté Noirs, et un
 * échantillonnage régulier sur l'Elo (difficulté croissante).
 *
 * Thèmes `tm-*` / `cm-*` : REMPLACÉS (15 neufs, importés via `.override.json`).
 * Autres thèmes : COMPLÉTÉS jusqu'à 15 sans rien effacer.
 *
 *   node scripts/academy-mining/select-puzzles.mjs <candidats.json> <outDir>
 *
 * Écrit `<outDir>/sel-all.json` et `<outDir>/verify-all-in.json` (entrée de
 * `verify-stockfish.mjs`). NEED='{"theme":n}' force le nombre voulu par thème.
 * MINPOP=85 : seuil de popularité STRICT, sans repli (un thème peut finir court).
 * Un candidat dont le détecteur a posé `info.preferred` passe en priorité,
 * tant qu'il y en a assez pour remplir le thème.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import Database from "better-sqlite3";
const [inPath, outDir] = process.argv.slice(2);
const db = new Database(resolve(process.cwd(), process.env.DATABASE_PATH ?? "data/chess-trainer.db"), { readonly: true });
const { out } = JSON.parse(readFileSync(inPath, "utf8"));

// Puzzles Lichess déjà présents n'importe où dans l'Académie : jamais réutilisés.
const used = new Set();
for (const r of db.prepare("select source_ref from curriculum_puzzles where source_ref like 'Lichess #%'").all()) used.add(r.source_ref.match(/#(\w+)/)[1]);
const existing = new Map(db.prepare("select theme_id t, count(*) n from curriculum_puzzles group by theme_id").all().map((r) => [r.t, r.n]));

const OVERRIDE = (id) => id.startsWith("tm-") || id.startsWith("cm-");
const TARGET = 15;
const NEED = process.env.NEED ? JSON.parse(process.env.NEED) : null;
const MINPOP = Number(process.env.MINPOP ?? 0);
const gameKey = (u) => u.split("#")[0].split("/").slice(0, 4).join("/");

function pick(list, need) {
  const tiers = [(p) => p.popularity >= 85 && p.nbPlays >= 300, (p) => p.popularity >= 80 && p.nbPlays >= 150, () => true];
  for (const tier of tiers) {
    const seenG = new Set(), seenF = new Set();
    let q = list.filter((p) => !used.has(p.id) && p.popularity >= MINPOP && tier(p)).filter((p) => {
      const g = gameKey(p.gameUrl), f = p.startFen.split(" ").slice(0, 4).join(" ");
      if (seenG.has(g) || seenF.has(f)) return false;
      seenG.add(g); seenF.add(f); return true;
    }).sort((a, b) => a.rating - b.rating);
    if (q.length < need && tier !== tiers.at(-1)) continue;
    const preferred = q.filter((p) => p.info?.preferred);
    if (preferred.length >= need) q = preferred;
    if (q.length <= need) return q;
    const black = q.filter((p) => p.startFen.split(" ")[1] === "b");
    const chosen = new Set();
    const nb = Math.min(3, black.length, Math.floor(need / 4));
    for (let i = 0; i < nb; i++) chosen.add(black[Math.floor(((i + 0.5) * black.length) / nb)]);
    const rest = q.filter((p) => !chosen.has(p));
    const k = need - chosen.size;
    for (let i = 0; i < k; i++) chosen.add(rest[Math.floor(((i + 0.5) * rest.length) / k)]);
    return [...chosen].sort((a, b) => a.rating - b.rating);
  }
  return [];
}

const selection = {}, report = [];
// Les thèmes les plus rares choisissent en premier : un puzzle partagé va au thème qui en a le plus besoin.
for (const theme of Object.keys(out).sort((a, b) => out[a].length - out[b].length)) {
  const have = existing.get(theme) ?? 0;
  const need = NEED?.[theme] ?? (OVERRIDE(theme) ? TARGET : Math.max(0, TARGET - have));
  const chosen = need > 0 ? pick(out[theme], need) : [];
  for (const p of chosen) used.add(p.id);
  selection[theme] = chosen;
  report.push({ theme, candidates: out[theme].length, had: have, mode: OVERRIDE(theme) ? "override" : "additif", need, picked: chosen.length, final: OVERRIDE(theme) ? chosen.length : have + chosen.length, elo: chosen.length ? `${chosen[0].rating}-${chosen.at(-1).rating}` : "-" });
}
writeFileSync(`${outDir}/sel-all.json`, JSON.stringify(selection, null, 2));
const verifyIn = Object.entries(selection).flatMap(([t, l]) => l.map((p) => ({ key: `${t}/${p.id}`, fen: p.startFen, solutionSan: p.solutionSan })));
writeFileSync(`${outDir}/verify-all-in.json`, JSON.stringify(verifyIn));
console.table(report.sort((a, b) => a.theme.localeCompare(b.theme)));
console.log("à vérifier :", verifyIn.length);
