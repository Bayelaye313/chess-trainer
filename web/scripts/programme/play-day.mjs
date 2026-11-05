// Joue de bout en bout la séance du jour courant du Programme dans un navigateur (Playwright), /api/sync intercepté.
// Lancé par ui-check.sh (qui prépare la copie de base et le serveur) ; seul :
//
//   node scripts/programme/play-day.mjs <baseUrl> <préfixe des captures> [secondes d'inactivité à observer]
//
// Affiche : phases visibles sur /programme, libellés « difficulté des puzzles ~X à ~Y », déroulé de la séance
// (puzzles résolus en jouant la solution vérifiée, blindfold, blocs), bilan, jour courant après rechargement.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const WEB = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(`${WEB}/package.json`);
const { chromium } = require("playwright");

const [base, shot, idleArg = "0"] = process.argv.slice(2);
const byId = new Map();
for (const n of [1, 2, 3, 4, 5]) {
  let j;
  try { j = JSON.parse(readFileSync(`${WEB}/src/core/programme/content/phase-${n}.json`, "utf8")); } catch { continue; }
  (function walk(o) {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o && typeof o === "object") {
      if (o.puzzle_id && (o.solution_uci || o.fen_affichee_une_fois)) byId.set(String(o.puzzle_id), o);
      Object.values(o).forEach(walk);
    }
  })(j);
}
console.log("puzzles indexés", byId.size);

const browser = await chromium.launch({ args: ["--js-flags=--max-old-space-size=512"] });
const page = await browser.newPage({ viewport: { width: 1300, height: 1000 } });
const actions = new Map(); // action id -> count
const actionLog = [];
let syncCalls = 0;
page.on("request", (r) => {
  const a = r.headers()["next-action"];
  if (a) { actions.set(a, (actions.get(a) ?? 0) + 1); actionLog.push([Date.now(), a.slice(0, 10), r.url()]); }
});
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
await page.route("**/api/sync", (route) => { syncCalls++; return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ skipped: true, totalGamesImported: 0, results: [] }) }); });

const t0 = Date.now();
await page.goto(`${base}/programme`, { waitUntil: "load" });
await page.waitForTimeout(3000);
const body = await page.locator("main").innerText();
console.log("phases affichées:", [1, 2, 3, 4, 5].map((i) => body.includes(`Phase ${i} ·`)).join(","));
console.log("libellé difficulté:", (body.match(/difficulté des puzzles ~\d+ à ~\d+/g) ?? []).join(" | "));
console.log("en-tête:", body.split("\n").slice(0, 8).join(" / "));
await page.screenshot({ path: `${shot}-overview.png`, fullPage: true });

const idle = Number(idleArg);
if (idle > 0) {
  const before = actionLog.length;
  await page.waitForTimeout(idle * 1000);
  console.log(`actions serveur pendant ${idle}s d'inactivité :`, actionLog.length - before, "| /api/sync:", syncCalls);
}

const vis = async (loc) => (await loc.count()) > 0 && (await loc.first().isVisible());
const btn = (name) => page.getByRole("button", { name, exact: false });
const sq = (s) => page.locator(`[data-square="${s}"]`).first();
async function drag(from, to) {
  const a = await sq(from).boundingBox(); const b = await sq(to).boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2 + 5, a.y + a.height / 2 + 5, { steps: 3 });
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 });
  await page.mouse.up();
}
async function currentPuzzle() {
  const t = await page.locator("text=/Lichess #|Position pédagogique/").first().innerText().catch(() => "");
  const id = t.match(/Lichess #(\S+)/)?.[1];
  if (id) return byId.get(id);
  // position construite : retrouver par le jour d'origine + fen impossible ici ; on renverra null
  return null;
}

await (await vis(btn("Reprendre la séance")) ? btn("Reprendre la séance") : btn("Commencer la séance")).first().click();
await page.waitForTimeout(3000);
const head = await page.locator("aside").first().innerText().catch(() => "");
console.log("séance:", head.split("\n").slice(0, 3).join(" / "));
const stats = { puzzles: 0, solved: 0, revealed: 0, blocks: 0, blindfold: 0 };
for (let step = 0; step < 600; step++) {
  if (await vis(btn("Terminer la séance"))) {
    await page.locator('input[type="checkbox"]').evaluateAll((els) => els.slice(1).forEach((e) => e.checked || e.click()));
    await btn("Terminer la séance").first().click();
    await page.waitForTimeout(3000);
    break;
  }
  if (await vis(btn("Valider le squelette"))) {
    const p = await currentPuzzle();
    const core = p?.squelette_coeur ?? [];
    for (const s of core.length ? core : ["e4"]) await sq(s).click();
    await btn("Valider le squelette").click();
    await btn("Étape 2").click();
    await page.waitForTimeout(500);
    stats.puzzles++;
    let ok = false;
    if (p?.solution_uci) {
      try {
        for (let i = 0; i < p.solution_uci.length; i += 2) {
          const u = p.solution_uci[i];
          await page.waitForFunction(() => !document.body.innerText.includes("L'adversaire répond"), null, { timeout: 15000 });
          await page.waitForTimeout(400);
          await drag(u.slice(0, 2), u.slice(2, 4));
          await page.waitForTimeout(900);
        }
        await page.getByText("Résolu.", { exact: true }).waitFor({ timeout: 8000 });
        ok = true;
      } catch { /* révélation */ }
    }
    if (!ok && (await vis(btn("Voir la solution")))) { await btn("Voir la solution").click(); stats.revealed++; await page.waitForTimeout(1500); }
    if (ok) stats.solved++;
    await btn("Continuer").first().click({ timeout: 15000 });
    await page.waitForTimeout(700);
    continue;
  }
  if (await vis(btn("Afficher la position"))) {
    const t = await page.locator("main").innerText();
    await btn("Afficher la position").click();
    await page.getByText("Position masquée").waitFor({ timeout: 40000 });
    await page.locator("#blindfold-answer").fill("Dxh7#");
    await btn("Corriger").click();
    if (await vis(btn("Ma ligne était la bonne"))) await btn("Ma ligne était la bonne").click();
    await btn("Continuer").first().click();
    stats.blindfold++;
    await page.waitForTimeout(700);
    continue;
  }
  if (await vis(btn("J'ai parcouru le lieu"))) { await btn("J'ai parcouru le lieu").click(); stats.blocks++; continue; }
  if (await vis(btn("J'ai récité"))) { await btn("J'ai récité").click(); continue; }
  if (await vis(btn("Passer"))) { await btn("Passer").click(); stats.blocks++; continue; }
  if (await vis(btn("Partie terminée"))) { await btn("Partie terminée").click(); stats.blocks++; continue; }
  if (await vis(page.locator("textarea"))) { await page.locator("textarea").fill("Reconstruit de mémoire : test automatique."); }
  if (await vis(btn("Bloc suivant"))) { await btn("Bloc suivant").first().click(); stats.blocks++; await page.waitForTimeout(400); continue; }
  console.log("état inconnu:", (await page.locator("section").last().innerText()).slice(0, 300));
  await page.screenshot({ path: `${shot}-stuck.png`, fullPage: true });
  break;
}
console.log("stats", JSON.stringify(stats));
const outcome = await page.locator("section").last().innerText().catch(() => "");
console.log("bilan:", outcome.replace(/\n+/g, " / ").slice(0, 600));
await page.screenshot({ path: `${shot}-outcome.png`, fullPage: true });
await page.goto(`${base}/programme`, { waitUntil: "load" });
await page.waitForTimeout(2500);
const after = await page.locator("main").innerText();
console.log("après rechargement:", (after.match(/S\d+ · J\d+/) ?? [""])[0], "|", (after.match(/Heures\s*\n?\s*[^\n]+/) ?? [""])[0].replace(/\n/g, " "));
console.log("/api/sync interceptés:", syncCalls, "| actions serveur (id → n):", JSON.stringify([...actions].map(([k, v]) => [k.slice(0, 10), v])), "| durée", Math.round((Date.now() - t0) / 1000), "s");
await browser.close();
