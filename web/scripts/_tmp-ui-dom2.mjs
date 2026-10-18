import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
await p.goto("http://localhost:3001/ouvertures/italian-game/cours", { waitUntil: "networkidle" });
await p.locator('nav[aria-label="Chapitres"] button').nth(0).click();
await p.locator("button.font-mono", { hasText: /^4\.Nc3$/ }).first().click();
for (let k = 0; k < 3; k++) { const bk = p.getByRole("button", { name: /^Indice \d\/\d$/ }); if (await bk.isVisible()) await bk.click(); }
const t = await p.locator("body").innerText(); const i = t.indexOf("Indice 1");
console.log(t.slice(i - 100, i + 700));
await b.close();
