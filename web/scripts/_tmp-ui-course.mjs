// Vérif UI d'un cours d'ouverture : carte du catalogue, bouton « Cours », chaque chapitre lu jusqu'au bout
// avec barre d'éval, chapitres surprise joués jusqu'à « Ligne terminée », indices (3, sans préfixe doublé),
// erreurs console, et la ligne du cours dans la carte « Mes ouvertures face au cours » du rapport.
// usage: node scripts/_tmp-ui-course.mjs <slug> <index chapitres surprise, ex. 1,5> [base=http://localhost:3001]
import { chromium } from "playwright";
const [slug, surpriseArg, BASE = "http://localhost:3001"] = process.argv.slice(2);
const surprises = surpriseArg.split(",").map(Number);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
page.setDefaultTimeout(180000);
page.setDefaultNavigationTimeout(180000);
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror ${e.message}`));
page.on("console", (m) => { if (m.type() === "error") errors.push(`console ${m.text().slice(0, 160)}`); });

await page.goto(`${BASE}/ouvertures`, { waitUntil: "load" });
await page.locator(`a[href^="/ouvertures/"]`).first().waitFor();
console.log("carte catalogue :", (await page.locator(`a[href="/ouvertures/${slug}"]`).count()) > 0, "/ cartes", new Set(await page.locator(`a[href^="/ouvertures/"]`).evaluateAll((as) => as.map((a) => a.getAttribute("href")).filter((h) => h.split("/").length === 3))).size);
await page.goto(`${BASE}/ouvertures/${slug}`, { waitUntil: "load" });
const courseLink = page.getByText("Cours commenté coup par coup");
await courseLink.waitFor();
console.log("bouton Cours :", await courseLink.isVisible());
await courseLink.click();
await page.waitForURL(`**/ouvertures/${slug}/cours`);
await page.locator('nav[aria-label="Chapitres"] button').first().waitFor();

const chapters = page.locator('nav[aria-label="Chapitres"] button');
const n = await chapters.count();
const next = page.getByRole("button", { name: "Coup suivant" });
const evalBar = page.locator('[role="img"][aria-label^="Évaluation de la position"]');
for (let i = 0; i < n; i++) {
  await chapters.nth(i).click();
  await page.getByRole("radio", { name: "Lecture" }).click();
  let steps = 0, barSeen = 0;
  while ((await next.isEnabled()) && steps < 300) { await next.click(); steps++; if (await evalBar.first().isVisible()) barSeen++; }
  const text = await page.locator("main").innerText();
  console.log(`ch.${i + 1} lecture : ${steps} coups, barre visible sur ${barSeen}, conseil de fin ${/Conseil de GM/.test(text)}`);
}
for (const i of surprises) {
  await chapters.nth(i).click();
  await page.getByRole("radio", { name: "Jouer les coups" }).click();
  let k = 0;
  for (; k < 500; k++) {
    if (await page.getByText("Ligne terminée").isVisible()) break;
    const voir = page.getByRole("button", { name: "Voir le coup" });
    const suiv = page.getByRole("button", { name: "Suivant (Espace)" });
    if (await voir.isVisible()) await voir.click();
    else if (await suiv.isVisible()) await suiv.click();
    else await page.waitForTimeout(150);
  }
  console.log(`ch.${i + 1} jeu : ligne terminée = ${await page.getByText("Ligne terminée").isVisible()} (${k} actions)`);
}
await page.getByRole("radio", { name: "Lecture" }).click();
let hintNodes = 0, complete = 0, doubled = 0;
for (let i = 0; i < n; i++) {
  await chapters.nth(i).click();
  await page.getByRole("radio", { name: "Lecture" }).click();
  const moves = page.locator("button.font-mono");
  const m = await moves.count();
  for (let j = 0; j < m; j++) {
    await moves.nth(j).click();
    if (!(await page.getByRole("button", { name: /^Indice 1\/\d$/ }).isVisible())) continue;
    hintNodes++;
    for (let k = 0; k < 3; k++) { const bk = page.getByRole("button", { name: /^Indice \d\/\d$/ }); if (await bk.isVisible()) await bk.click(); }
    const items = (await page.locator("main").innerText()).match(/Indice \d : [^\n]*/g) ?? [];
    if (items.length >= 3) complete++;
    if (items.some((t) => /^Indice \d : Indice/.test(t))) doubled++;
  }
}
console.log(`indices : ${hintNodes} nœuds, ${complete} avec 3 indices, préfixe doublé ${doubled}`);

await page.goto(`${BASE}/rapport`, { waitUntil: "load" });
const row = page.locator(`a[href="/rapport/ouvertures/${slug}"]`);
console.log("rapport :", (await row.count()) ? (await row.first().innerText()).replace(/\s+/g, " ") : "ABSENT de la carte");
console.log("erreurs", errors.length, errors.slice(0, 5));
await browser.close();
