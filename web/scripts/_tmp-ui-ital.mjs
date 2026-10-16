import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
const errors = []; p.on("pageerror", (e) => errors.push(e.message));
await p.goto("http://localhost:3001/ouvertures/italian-game/cours", { waitUntil: "networkidle" });
const chapters = p.locator('nav[aria-label="Chapitres"] button'); const n = await chapters.count();
let checked = 0, doubled = 0, total = 0;
for (let i = 0; i < n; i++) {
  await chapters.nth(i).click();
  const moves = p.locator("button.font-mono"); const m = await moves.count();
  for (let j = 0; j < m; j++) {
    await moves.nth(j).click();
    const btn = p.getByRole("button", { name: /^Indice 1\/\d$/ });
    if (!(await btn.isVisible())) continue;
    for (let k = 1; k <= 3; k++) { const bk = p.getByRole("button", { name: new RegExp(`^Indice ${k}/\d$`) }); if (await bk.isVisible()) await bk.click(); }
    const items = await p.locator("li", { hasText: /^Indice \d :/ }).allInnerTexts();
    checked++; if (items.some((t) => /^Indice \d : Indice/.test(t))) doubled++;
    if (checked === 1) console.log("exemple :", items[0]);
  }
}
console.log(`chapitres ${n}, nœuds à indices ouverts ${checked}, indices affichés ${total}, préfixe doublé ${doubled}, erreurs page ${errors.length}`);
await b.close();
