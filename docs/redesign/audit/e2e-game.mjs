// Parcours complet : Aujourd'hui → Jouer → partie contre Poussin → abandon → bilan → revue.
// Usage : node docs/redesign/audit/e2e-game.mjs <baseUrl> <dossier>
import { join } from "node:path";
import { chromium } from "../../../web/node_modules/playwright/index.mjs";

const [base = "http://localhost:3107", out = "/tmp"] = process.argv.slice(2);
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.route("**/api/sync", (route) => route.fulfill({ status: 200, contentType: "application/json", body: '{"skipped":true,"results":[],"totalGamesImported":0}' }));
const page = await context.newPage();
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

async function drag(from, to) {
  const a = await page.locator(`#play-board-square-${from}`).boundingBox();
  const b = await page.locator(`#play-board-square-${to}`).boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 });
  await page.mouse.up();
}

async function waitTurn() {
  await page.waitForFunction(() => document.body.innerText.includes("À toi de jouer"), null, { timeout: 120_000 });
}

await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);
await page.getByRole("link", { name: /^(Jouer|Rejouer)/ }).filter({ hasText: /Choisis|Blancs|Noirs/ }).first().click();
log("clic 1 : raccourci Jouer →", page.url());
await page.getByRole("radio", { name: /Poussin/ }).click();
await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent?.trim().startsWith("Commencer") && !b.disabled), null, { timeout: 120_000 });
await page.getByRole("button", { name: /^Commencer/ }).click();
log("clic 2 : Commencer");
await waitTurn();
for (const [from, to] of [["e2", "e4"], ["g1", "f3"], ["f1", "c4"], ["b1", "c3"]]) {
  await drag(from, to);
  await page.waitForTimeout(1500);
  await waitTurn().catch(() => {});
  log("coup", from, to);
}
await page.screenshot({ path: join(out, "e2e-partie-en-cours.png") });
await page.getByRole("button", { name: "Abandonner" }).click();
await page.getByRole("heading", { name: /Victoire|Défaite|Partie nulle|Partie terminée/ }).waitFor({ timeout: 60_000 });
log("bilan :", await page.getByRole("heading", { name: /Victoire|Défaite|Partie nulle|Partie terminée/ }).textContent());
await page.screenshot({ path: join(out, "e2e-bilan.png") });
const remembered = await page.evaluate(() => localStorage.getItem("chess-trainer:last-bot-setup"));
log("réglage mémorisé :", remembered);
await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);
const rejouer = await page.getByRole("link", { name: /Rejouer/ }).count();
log("raccourci « Rejouer » présent :", rejouer > 0);
const firstGame = page.locator("a[href^='/analyse/']").first();
log("partie la plus récente :", (await firstGame.textContent())?.trim().slice(0, 60));
await firstGame.click();
await page.waitForURL(/\/analyse\//, { timeout: 120_000 });
await page.waitForTimeout(6000);
log("revue :", page.url(), (await page.locator("main h1").first().textContent().catch(() => "?"))?.trim());
await page.screenshot({ path: join(out, "e2e-revue.png") });
await browser.close();
