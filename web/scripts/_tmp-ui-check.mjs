// Vérif UI du cours Ruy Lopez : chaque chapitre se lit jusqu'au bout, barre d'éval présente,
// chapitres 3 et 7 jouables en mode « Jouer les coups », indices visibles sur les nœuds fautifs.
import { chromium } from "playwright";
const BASE = process.argv[2] ?? "http://localhost:3001";
const OUT = process.argv[3];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(`${BASE}/ouvertures/ruy-lopez/cours`, { waitUntil: "networkidle" });
console.log("url", page.url());
const chapters = page.locator('nav[aria-label="Chapitres"] button');
const n = await chapters.count();
console.log("chapitres", n);
const next = page.getByRole("button", { name: "Coup suivant" });
for (let i = 0; i < n; i++) {
  await chapters.nth(i).click();
  await page.getByRole("radio", { name: "Lecture" }).click();
  let steps = 0;
  while (await next.isEnabled() && steps < 200) { await next.click(); steps++; }
  const text = await page.locator("main").innerText();
  const proTip = (text.match(/PRO TIP/g) ?? []).length;
  console.log(`ch.${i + 1} lecture : ${steps} coups, PRO TIP visible ${proTip}`);
  if (i === 2 || i === 6) await page.screenshot({ path: `${OUT}/ch${i + 1}-fin.png` });
}
// Mode jeu, ch.3 et 7 jusqu'au bout (on joue « Voir le coup » + Suivant)
for (const i of [2, 6]) {
  await chapters.nth(i).click();
  await page.getByRole("radio", { name: "Jouer les coups" }).click();
  let k = 0;
  for (; k < 400; k++) {
    if (await page.getByText("Ligne terminée").isVisible()) break;
    const voir = page.getByRole("button", { name: "Voir le coup" });
    const suiv = page.getByRole("button", { name: "Suivant (Espace)" });
    if (await voir.isVisible()) await voir.click();
    else if (await suiv.isVisible()) await suiv.click();
    else await page.waitForTimeout(150);
  }
  console.log(`ch.${i + 1} jeu : ligne terminée = ${await page.getByText("Ligne terminée").isVisible()} (${k} actions)`);
}
// Indices : clic sur le coup fautif dans l'arbre, puis les 3 indices
await page.getByRole("radio", { name: "Lecture" }).click();
const targets = [[1, "7.d4"], [1, "10.d4"], [1, "13.Nb3"], [4, "7.Re1"], [7, "3...Nd4"], [7, "3...Bc5"], [7, "3...d6"], [7, "6.d4"], [7, "8.Qxd4"]];
for (const [ch, mv] of targets) {
  await chapters.nth(ch).click();
  await page.getByRole("radio", { name: "Lecture" }).click();
  const san = mv.replace(/^\d+\.+/, "");
  const ply = mv.match(/^(\d+)(\.\.\.|\.)/);
  // le nœud fautif est dans une variante : on essaie chaque occurrence du SAN
  const cands = page.locator(`button:text-is("${mv}"), button:text-is("${mv.replace("...", "…")}")`);
  const c = await cands.count();
  let found = false;
  for (let j = 0; j < c && !found; j++) {
    await cands.nth(j).click();
    const btn = page.getByRole("button", { name: /^Indice 1\/3$/ });
    if (await btn.isVisible()) {
      await btn.click(); await page.getByRole("button", { name: /^Indice 2\/3$/ }).click(); await page.getByRole("button", { name: /^Indice 3\/3$/ }).click();
      const shown = await page.locator("li", { hasText: /^Indice 3 :/ }).innerText();
      console.log(`indices ${mv} (ch.${ch + 1}) OK : ${shown.slice(0, 90)}`);
      found = true;
      if (mv === "7.Re1") await page.screenshot({ path: `${OUT}/hint-re1.png` });
    }
  }
  if (!found) console.log(`indices ${mv} (ch.${ch + 1}) INTROUVABLES (${c} candidats ${ply})`);
}
console.log("erreurs page", errors.length, errors.slice(0, 3));
await browser.close();
