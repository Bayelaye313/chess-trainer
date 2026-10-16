import { chromium } from "playwright";

const SLUG = process.argv[2] || "ruy-lopez";
const OUT = process.argv[3] || "probe";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const logs = [];
page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on("pageerror", (err) => logs.push("pageerror: " + err.message));
page.on("requestfailed", (req) => logs.push("requestfailed: " + req.url() + " " + (req.failure()?.errorText ?? "")));

await page.goto(`http://localhost:3000/ouvertures/${SLUG}`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(1800);
await page.screenshot({ path: `${OUT}.png`, fullPage: false });

const bodyText = await page.locator("body").innerText();
console.log("=== HEADER AREA ===");
console.log(bodyText.split("\n").slice(0, 40).join("\n"));

console.log("=== SVG count in board area ===");
const svgCount = await page.locator("svg").count();
console.log("total svg on page:", svgCount);

// Look specifically for an arrow-like line/marker inside any svg (react-chessboard renders arrows via <line>/<marker>).
const lineCount = await page.locator("svg line").count();
const markerCount = await page.locator("svg marker").count();
console.log("svg <line> count:", lineCount, "svg <marker> count:", markerCount);

console.log("=== CONSOLE ===");
console.log(JSON.stringify(logs.filter(l => !/HMR|DevTools/.test(l)), null, 2));

await browser.close();
