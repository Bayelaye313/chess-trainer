import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push("pageerror: " + e.message));
await page.goto("http://localhost:3000/pieges", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);
await page.getByText("Scotch Game", { exact: false }).first().click();
await page.waitForTimeout(1000);
await page.getByText("Benima Defense", { exact: false }).first().click();

for (let i = 0; i < 6; i++) {
  await page.waitForTimeout(2000);
  const text = await page.locator("body").innerText();
  const statusLine = text.split("\n").find(l => l.includes("Mise en place") || l.includes("Coup") || l.includes("indice") || l.includes("Manche"));
  console.log(`t=${(i+1)*2}s:`, statusLine);
}
await page.screenshot({ path: "pieges-04.png" });
console.log("CONSOLE:", JSON.stringify(logs.filter(l => !/HMR|DevTools/.test(l)), null, 2));
await browser.close();
