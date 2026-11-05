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

// Rendu logiciel (SwiftShader) : sans lui, le headless_shell de ce poste cesse souvent de produire des images
// (requestAnimationFrame jamais appelé, captures et clics bloqués « en attente de stabilité ») : relevé du 2026-11-05.
const ARGS = ["--js-flags=--max-old-space-size=512", "--disable-renderer-backgrounding", "--disable-background-timer-throttling", "--disable-backgrounding-occluded-windows", "--disable-gpu-compositing", "--use-gl=swiftshader", "--enable-unsafe-swiftshader"];
// Le rendu headless se bloque parfois sur ce poste (aucune image produite) : on vérifie que
// requestAnimationFrame tourne, sinon on relance le navigateur (5 essais).
let browser, page;
for (let attempt = 1; ; attempt++) {
  browser = await chromium.launch({ args: ARGS });
  page = await browser.newPage({ viewport: { width: 1300, height: 1000 } });
  await page.setContent("<p>test</p>");
  const raf = await Promise.race([page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(true)))), new Promise((r) => setTimeout(() => r(false), 5000))]);
  if (raf) break;
  console.log(`rendu headless bloqué (essai ${attempt}), relance du navigateur`);
  await browser.close().catch(() => {});
  if (attempt >= 5) throw new Error("rendu headless indisponible");
}
const actions = new Map(); // action id -> count
const actionLog = [];
let syncCalls = 0;
page.on("request", (r) => {
  const a = r.headers()["next-action"];
  if (a) { actions.set(a, (actions.get(a) ?? 0) + 1); actionLog.push([Date.now(), a.slice(0, 10), r.url()]); }
});
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
await page.route("**/api/sync", (route) => { syncCalls++; return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ skipped: true, totalGamesImported: 0, results: [] }) }); });

// Captures d'appoint : jamais bloquantes (une capture pleine page peut dépasser 30 s sur ce poste).
const snap = (path) => page.screenshot({ path, timeout: 10000 }).catch((e) => console.log("capture ignorée:", e.message.split("\n")[0]));
const t0 = Date.now();
await page.goto(`${base}/programme`, { waitUntil: "load" });
await page.waitForTimeout(3000);
const body = await page.locator("main").innerText();
console.log("phases affichées:", [1, 2, 3, 4, 5].map((i) => body.includes(`Phase ${i} ·`)).join(","));
console.log("libellé difficulté:", (body.match(/difficulté des puzzles ~\d+ à ~\d+/g) ?? []).join(" | "));
console.log("en-tête:", body.split("\n").slice(0, 8).join(" / "));
await snap(`${shot}-overview.png`);

const idle = Number(idleArg);
if (idle > 0) {
  const before = actionLog.length;
  await page.waitForTimeout(idle * 1000);
  console.log(`actions serveur pendant ${idle}s d'inactivité :`, actionLog.length - before, "| /api/sync:", syncCalls);
}

const vis = async (loc) => (await loc.count()) > 0 && (await loc.first().isVisible());
const btn = (name) => page.getByRole("button", { name, exact: false });
const sq = (s) => page.locator(`[data-square="${s}"]`).first();
// Glisser-déposer robuste : l'échiquier peut se décaler (message qui apparaît, réponse adverse animée) ;
// on attend qu'il soit immobile, et l'on remesure la case d'arrivée juste avant de lâcher.
async function stableBox(square) {
  let prev = await sq(square).boundingBox();
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(150);
    const cur = await sq(square).boundingBox();
    if (cur && prev && Math.abs(cur.x - prev.x) < 1 && Math.abs(cur.y - prev.y) < 1) return cur;
    prev = cur;
  }
  return prev;
}
async function drag(from, to) {
  const a = await stableBox(from);
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2 + 5, a.y + a.height / 2 + 5, { steps: 3 });
  let b = await sq(to).boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 });
  b = await sq(to).boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 2 });
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
          await page.waitForTimeout(1200);
          await drag(u.slice(0, 2), u.slice(2, 4));
          await page.waitForTimeout(900);
        }
        await page.getByText("Résolu.", { exact: true }).waitFor({ timeout: 8000 });
        ok = true;
      } catch { /* révélation */ }
    }
    if (!ok && (await vis(btn("Voir la solution")))) { await btn("Voir la solution").click(); stats.revealed++; await page.waitForTimeout(1500); }
    if (ok) stats.solved++;
    try {
      await btn("Continuer").first().click({ timeout: 15000 });
    } catch (e) {
      console.log("pas de « Continuer » après le puzzle", p?.puzzle_id ?? "(construit ou non indexé)", "ok=", ok, "| écran :", (await page.locator("main").innerText()).replace(/\n+/g, " / ").slice(-1500));
      throw e;
    }
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
  await snap(`${shot}-stuck.png`);
  break;
}
console.log("stats", JSON.stringify(stats));
const outcome = await page.locator("section").last().innerText().catch(() => "");
console.log("bilan:", outcome.replace(/\n+/g, " / ").slice(0, 600));
await snap(`${shot}-outcome.png`);
await page.goto(`${base}/programme`, { waitUntil: "load" });
await page.waitForTimeout(2500);
const after = await page.locator("main").innerText();
console.log("après rechargement:", (after.match(/S\d+ · J\d+/) ?? [""])[0], "|", (after.match(/Heures\s*\n?\s*[^\n]+/) ?? [""])[0].replace(/\n/g, " "));
console.log("/api/sync interceptés:", syncCalls, "| actions serveur (id → n):", JSON.stringify([...actions].map(([k, v]) => [k.slice(0, 10), v])), "| durée", Math.round((Date.now() - t0) / 1000), "s");
await browser.close();
