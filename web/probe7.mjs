import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await page.goto("http://localhost:3000/pieges", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);
await page.getByText("Scotch Game", { exact: false }).first().click();
await page.waitForTimeout(1000);
await page.getByText("Benima Defense", { exact: false }).first().click();

let lastFen = null;
for (let i = 0; i < 30; i++) {
  await page.waitForTimeout(2000);
  // Count pieces on board via data-piece attributes as a cheap "did it change" proxy
  const pieceCount = await page.locator('[data-piece]').count();
  const stillSetup = await page.getByText("Mise en place", { exact: false }).count();
  console.log(`t=${(i+1)*2}s pieces=${pieceCount} stillSetupText=${stillSetup}`);
  if (stillSetup === 0) { console.log("TRANSITIONED at", (i+1)*2, "s"); break; }
}
await page.screenshot({ path: "pieges-05.png" });
await browser.close();
