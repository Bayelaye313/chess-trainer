// Vérif UI (redesign) d'un cours : bouton « Cours » de la fiche, chapitres (liste dans un <details>),
// lecture de chaque chapitre, surprises jouées jusqu'à « Ligne terminée », indices (3, sans préfixe doublé).
// usage: node scripts/_tmp-ui-c3.mjs <slug> <index surprises, ex. 1,5> [base]
import { chromium } from "playwright";
const [slug, surpriseArg, BASE = "http://localhost:3131"] = process.argv.slice(2);
const surprises = surpriseArg.split(",").map(Number);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
page.setDefaultTimeout(120000);
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror ${e.message}`));
page.on("console", (m) => { if (m.type() === "error") errors.push(`console ${m.text().slice(0, 160)}`); });
await page.goto(`${BASE}/ouvertures/${slug}`, { waitUntil: "load" });
const coursBtn = page.locator(`a[href="/ouvertures/${slug}/cours"]`).first();
await coursBtn.waitFor();
console.log("bouton Cours :", await coursBtn.isVisible(), JSON.stringify((await coursBtn.innerText()).trim()));
await coursBtn.click();
await page.waitForURL(`**/ouvertures/${slug}/cours`);
await page.waitForTimeout(1500);
const chapterButtons = () => page.locator('nav[aria-label="Chapitres"] button');
async function openChapter(i) {
  await page.evaluate(() => document.querySelectorAll("details").forEach((d) => { if (d.querySelector('nav[aria-label="Chapitres"]')) d.open = true; }));
  await page.evaluate((i) => document.querySelectorAll('nav[aria-label="Chapitres"] button')[i].click(), i);
  await page.waitForTimeout(400);
}
const n = await chapterButtons().count();
const titles = await chapterButtons().evaluateAll((bs) => bs.map((b) => b.innerText.replace(/\s+/g, " ").trim()));
console.log(`chapitres : ${n}`); titles.forEach((t) => console.log("  -", t.slice(0, 90)));
const next = page.getByRole("button", { name: "Coup suivant" });
for (let i = 0; i < n; i++) {
  await openChapter(i);
  await page.getByRole("radio", { name: "Lecture" }).click();
  let steps = 0;
  while ((await next.isEnabled()) && steps < 300) { await next.click(); steps++; }
  console.log(`ch.${i + 1} lecture : ${steps} coups`);
}
for (const i of surprises) {
  await openChapter(i);
  await page.getByRole("radio", { name: "Jouer les coups" }).click();
  let k = 0;
  for (; k < 600; k++) {
    if (await page.getByText("Ligne terminée").first().isVisible()) break;
    const voir = page.getByRole("button", { name: "Voir le coup" });
    const suiv = page.getByRole("button", { name: /^Suivant/ });
    if (await voir.isVisible()) await voir.click();
    else if (await suiv.first().isVisible()) await suiv.first().click();
    else await page.waitForTimeout(150);
  }
  console.log(`ch.${i + 1} jeu : ligne terminée = ${await page.getByText("Ligne terminée").first().isVisible()} (${k} actions)`);
}
let hintNodes = 0, complete = 0, doubled = 0;
for (let i = 0; i < n; i++) {
  await openChapter(i);
  await page.getByRole("radio", { name: "Lecture" }).click();
  const moves = page.locator("button.font-mono");
  const m = await moves.count();
  for (let j = 0; j < m; j++) {
    if (!(await moves.nth(j).isVisible())) continue;
    await moves.nth(j).click();
    if (!(await page.getByRole("button", { name: /^Indice 1\/\d$/ }).isVisible())) continue;
    hintNodes++;
    for (let k = 0; k < 3; k++) { const bk = page.getByRole("button", { name: /^Indice \d\/\d$/ }); if (await bk.isVisible()) await bk.click(); }
    const items = (await page.locator("main").innerText()).match(/Indice \d : [^\n]*/g) ?? [];
    if (items.length >= 3) complete++;
    if (items.some((t) => /^Indice \d : Indice/i.test(t))) doubled++;
  }
}
console.log(`indices : ${hintNodes} nœuds, ${complete} avec 3 indices, préfixe doublé ${doubled}`);
console.log("erreurs", errors.length, errors.slice(0, 5));
await browser.close();
