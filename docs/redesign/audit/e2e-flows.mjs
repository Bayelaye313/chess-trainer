// Parcours complets : cours d'ouverture jusqu'à « Ligne terminée », deck de révision,
// drill de piège, revue de partie. Usage : node docs/redesign/audit/e2e-flows.mjs <baseUrl> <dossier>
import { join } from "node:path";
import { chromium } from "../../../web/node_modules/playwright/index.mjs";
import { Chess } from "../../../web/node_modules/chess.js/dist/esm/chess.js";

const [base = "http://localhost:3107", out = "/tmp", only] = process.argv.slice(2);
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.route("**/api/sync", (route) => route.fulfill({ status: 200, contentType: "application/json", body: '{"skipped":true,"results":[],"totalGamesImported":0}' }));
const page = await context.newPage();
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const results = {};

/** Position lue dans le DOM de react-chessboard (`<id>-piece-<wP>-<case>`), trait au camp du bas. */
async function readBoard(boardId) {
  return page.evaluate((id) => {
    const pieces = [...document.querySelectorAll(`[id^="${id}-piece-"]`)].map((el) => el.id.slice(`${id}-piece-`.length));
    const a1 = document.getElementById(`${id}-square-a1`)?.getBoundingClientRect();
    const a8 = document.getElementById(`${id}-square-a8`)?.getBoundingClientRect();
    return { pieces, whiteBottom: a1 && a8 ? a1.top > a8.top : true };
  }, boardId);
}

function fenFrom({ pieces, whiteBottom }) {
  const grid = Array.from({ length: 8 }, () => Array(8).fill(""));
  for (const entry of pieces) {
    const match = /^([wb])([PNBRQK])-([a-h][1-8])$/.exec(entry);
    if (!match) continue;
    const [, color, type, square] = match;
    grid[8 - Number(square[1])][square.charCodeAt(0) - 97] = color === "w" ? type : type.toLowerCase();
  }
  const rows = grid.map((row) => row.reduce((acc, cell) => (cell ? acc + cell : acc.replace(/(\d?)$/, (d) => String(Number(d || 0) + 1))), ""));
  return `${rows.join("/")} ${whiteBottom ? "w" : "b"} - - 0 1`;
}

async function drag(boardId, from, to) {
  const a = await page.locator(`#${boardId}-square-${from}`).boundingBox();
  const b = await page.locator(`#${boardId}-square-${to}`).boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 });
  await page.mouse.up();
}

/** Essaie les coups légaux un à un jusqu'à ce que l'échiquier en accepte un (coup attendu). */
async function playExpectedMove(boardId) {
  const fen = fenFrom(await readBoard(boardId));
  let moves;
  try {
    moves = new Chess(fen, { skipValidation: true }).moves({ verbose: true });
  } catch {
    return false;
  }
  for (const move of moves) {
    await drag(boardId, move.from, move.to);
    await page.waitForTimeout(500);
    const after = await readBoard(boardId);
    if (after.pieces.some((p) => p.endsWith(`-${move.to}`) && p.includes(move.piece.toUpperCase())) && !after.pieces.some((p) => p.endsWith(`-${move.from}`))) return move.san;
  }
  return false;
}

async function step(name, fn) {
  if (only && only !== name) return;
  try {
    results[name] = await fn();
    log("OK", name, results[name] ?? "");
  } catch (error) {
    results[name] = `ÉCHEC : ${String(error).slice(0, 160)}`;
    log("ÉCHEC", name, String(error).slice(0, 200));
  }
}

// 1. Cours d'ouverture jusqu'à « Ligne terminée ».
await step("cours", async () => {
  await page.goto(`${base}/ouvertures/scotch-game`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  await page.getByRole("link", { name: /Commencer le cours|Reprendre le cours/ }).click();
  await page.waitForURL(/\/cours/);
  await page.waitForTimeout(4000);
  await page.getByRole("radio", { name: "Jouer les coups" }).click();
  for (let i = 0; i < 120; i++) {
    if (await page.getByText("Ligne terminée.").count()) break;
    const reveal = page.getByRole("button", { name: "Voir le coup" });
    const next = page.getByRole("button", { name: /Suivant \(Espace\)/ });
    if (await reveal.count()) await reveal.click();
    else if (await next.count()) await next.click();
    await page.waitForTimeout(700);
  }
  await page.getByText("Ligne terminée.").waitFor({ timeout: 5000 });
  await page.screenshot({ path: join(out, "e2e-cours-ligne-terminee.png") });
  const stored = await page.evaluate(() => localStorage.getItem("chess-trainer:last-course"));
  return `« Ligne terminée. » affiché ; position mémorisée : ${stored}`;
});

// 1 bis. Reprise du cours depuis Aujourd'hui (1 clic).
await step("reprise-cours", async () => {
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  await page.getByRole("link", { name: /Reprendre le cours/ }).click();
  await page.waitForURL(/\/cours\?chapitre=/);
  return page.url();
});

// 2. Deck de révision : ouverture d'une session, coups légaux jusqu'à l'échec ou la réussite, notation, carte suivante.
await step("deck", async () => {
  await page.goto(`${base}/entrainer`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  await page.locator("[data-deck-start]").first().click();
  const board = page.locator("[id$='-square-a1']").first();
  await board.waitFor({ timeout: 30_000 });
  const boardId = (await board.getAttribute("id")).replace(/-square-a1$/, "");
  await page.waitForTimeout(2500);
  const before = await page.locator("main").innerText();
  for (let i = 0; i < 4; i++) {
    const fen = fenFrom(await readBoard(boardId));
    const legal = new Chess(fen, { skipValidation: true }).moves({ verbose: true });
    if (legal.length === 0) break;
    await drag(boardId, legal[0].from, legal[0].to);
    await page.waitForTimeout(1800);
    if (await page.getByRole("button", { name: "Révéler la solution" }).count()) break;
  }
  const reveal = page.getByRole("button", { name: "Révéler la solution" });
  if (await reveal.count()) await reveal.click();
  await page.waitForTimeout(3000);
  const grade = page.getByRole("button", { name: "Encore" });
  if (await grade.count()) await grade.click();
  await page.waitForTimeout(3000);
  const cont = page.getByRole("button", { name: /^Continuer$/ });
  if ((await cont.count()) && (await cont.first().isEnabled())) await cont.first().click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: join(out, "e2e-deck.png") });
  const after = await page.locator("main").innerText();
  const solved = /résolu/.test(after) ? after.match(/\d+ puzzles? résolus? cette session/)?.[0] : null;
  await page.getByRole("button", { name: "Quitter la session" }).click();
  return `session ouverte (${boardId}) ; ${solved ?? "aucun compteur"} ; écran changé : ${before !== after}`;
});

// 3. Drill de piège (Manche 1) : la réfutation est trouvée par essais de coups légaux.
await step("piege", async () => {
  await page.goto(`${base}/pieges`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  await page.getByRole("link", { name: /^Continuer/ }).click();
  await page.waitForURL(/\/pieges\//);
  await page.locator("#opening-trap-board-square-a1").waitFor({ timeout: 30_000 });
  await page.waitForFunction(() => !document.body.innerText.includes("Mise en place du piège"), null, { timeout: 60_000 });
  await page.waitForTimeout(1500);
  const played = [];
  for (let i = 0; i < 8; i++) {
    const text = await page.locator("main").innerText();
    if (/Manche 1 réussie|Piège maîtrisé/.test(text)) break;
    const san = await playExpectedMove("opening-trap-board");
    if (!san) break;
    played.push(san);
    await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: join(out, "e2e-piege.png") });
  const done = /Manche 1 réussie|Piège maîtrisé/.test(await page.locator("main").innerText());
  return `coups joués : ${played.join(" ")} ; ${done ? "Manche 1 réussie" : "manche non terminée"}`;
});

// 4. Revue de partie : navigation coup par coup et revue des erreurs.
await step("revue", async () => {
  await page.goto(`${base}/parties`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await page.locator("a[href^='/analyse/']").first().click();
  await page.waitForURL(/\/analyse\//);
  await page.waitForTimeout(6000);
  for (let i = 0; i < 5; i++) await page.getByRole("button", { name: "Coup suivant" }).click();
  const counter = await page.getByText(/^\d+ \/ \d+$/).first().textContent();
  const replay = page.getByRole("button", { name: "Rejouer mes erreurs" });
  const hasReplay = (await replay.count()) > 0;
  if (hasReplay) await replay.click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(out, "e2e-revue-erreurs.png") });
  return `compteur ${counter} ; « Rejouer mes erreurs » ${hasReplay ? "ouvert" : "absent (aucune erreur)"}`;
});

await browser.close();
console.log(JSON.stringify(results, null, 2));
