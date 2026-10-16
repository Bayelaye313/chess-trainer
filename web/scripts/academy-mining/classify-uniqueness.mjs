/**
 * Lit les sorties `*.jsonl` de `check-uniqueness.mts` et classe chaque puzzle
 * par son PIRE coup du solveur (probabilité de gain façon Lichess) :
 *   unique  : la solution garde ≥ 10 points d'avance sur le 2e meilleur coup
 *             (ou seule à mater, ou coup forcé) ;
 *   limite  : 5 à 10 points ; ambigue : < 5 points (plusieurs bonnes réponses) ;
 *   fausse  : Stockfish préfère nettement un autre coup ; erreur : illisible.
 * Un dernier coup qui mate compte comme unique même s'il existe d'autres mats.
 *   toleree : thème de force brute (`BRUTE_FORCE_THEME_IDS`) où la solution est un
 *             mat forcé au plus court et l'autre coup un mat aussi rapide ou plus
 *             lent — l'ordre des coups transpose sans perte d'évaluation, ce
 *             n'est pas une seconde idée (Roi+Dame contre Roi, mats écrasants).
 *
 *   node scripts/academy-mining/classify-uniqueness.mjs <dossier> [--detail <motif de thème>]
 *
 * Écrit `<dossier>/classified.json` ([{ id, theme, idx, cls }]).
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const cp = (s) => (!s ? null : s.kind === "mate" ? (s.v > 0 ? 10000 - s.v : -10000 - s.v) : s.v);
const wp = (c) => 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * Math.max(-2000, Math.min(2000, c)))) - 1);
const RANK = { unique: 0, toleree: 1, limite: 2, ambigue: 3, fausse: 4, erreur: 5 };

/** Voir « toleree » ci-dessus — la solution y est forcément gagnante par mat, jamais une simple avance matérielle. */
export const BRUTE_FORCE_THEME_IDS = new Set(["cm-mat-roi-et-dame-contre-roi", "eg-mats-de-force-ecrasante"]);

function plyClass(p, isLast, bruteForce) {
  const best = cp(p.best), sol = cp(p.sol);
  if (best == null || sol == null) return "erreur";
  if (p.legal === 1) return "unique";
  // Dernier coup qui mate : le solveur accepte tout mat (`isAcceptedPlayerMove`).
  if (isLast && p.sol.kind === "mate" && p.sol.v === 1) return "unique";
  if (wp(best) - wp(sol) > 5 && best - sol > 40) return "fausse";
  const otherLine = p.best.move === p.uci ? p.second : p.best;
  const other = cp(otherLine);
  if (other == null) return "unique";
  const gap = wp(sol) - wp(other);
  const onlyMate = p.sol.kind === "mate" && p.sol.v > 0 && otherLine.kind !== "mate";
  if (gap >= 10 || onlyMate) return "unique";
  if (bruteForce && p.sol.kind === "mate" && p.sol.v > 0 && sol >= best) return "toleree";
  return gap >= 5 ? "limite" : "ambigue";
}

/** Classe d'un puzzle = celle de son pire coup du solveur. */
export function classifyRow(r) {
  if (r.error || !r.plies.length) return "erreur";
  let worst = "unique";
  const bruteForce = BRUTE_FORCE_THEME_IDS.has(r.theme);
  for (const p of r.plies) { const k = plyClass(p, p.i === r.sans.length - 1, bruteForce); if (RANK[k] > RANK[worst]) worst = k; }
  return worst;
}

export function readRows(dir) {
  return readdirSync(dir).filter((f) => f.endsWith(".jsonl")).flatMap((f) =>
    readFileSync(join(dir, f), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = process.argv[2];
  const detail = process.argv[3] === "--detail" ? process.argv[4] : null;
  const rows = readRows(dir);
  const byTheme = new Map();
  const tot = { unique: 0, toleree: 0, limite: 0, ambigue: 0, fausse: 0, erreur: 0 };
  for (const r of rows) {
    r.cls = classifyRow(r);
    tot[r.cls]++;
    if (!byTheme.has(r.theme)) byTheme.set(r.theme, []);
    byTheme.get(r.theme).push(r);
  }
  for (const [t, list] of byTheme) {
    const c = { unique: 0, toleree: 0, limite: 0, ambigue: 0, fausse: 0, erreur: 0 };
    for (const r of list) c[r.cls]++;
    console.log(`${t.padEnd(58)} n=${String(list.length).padStart(3)}  unique ${String(c.unique).padStart(3)}${c.toleree ? `  tolérée ${c.toleree}` : ""}  limite ${c.limite}  ambiguë ${String(c.ambigue).padStart(3)}  fausse ${c.fausse}${c.erreur ? "  erreur " + c.erreur : ""}`);
    if (detail && t.includes(detail)) for (const r of list.sort((a, b) => a.idx - b.idx))
      console.log(`   #${r.idx} ${r.cls.padEnd(7)} ${r.sans.join(" ")} | ${r.plies.map((p) => `${p.san}: best ${p.best?.move} ${cp(p.best)} 2e ${p.second?.move} ${cp(p.second)} sol ${cp(p.sol)}`).join(" ; ")} | ${r.ref.slice(0, 50)}`);
  }
  console.log("\nTOTAL", rows.length, JSON.stringify(tot));
  writeFileSync(join(dir, "classified.json"), JSON.stringify(rows.map((r) => ({ id: r.id, theme: r.theme, idx: r.idx, cls: r.cls }))));
}
