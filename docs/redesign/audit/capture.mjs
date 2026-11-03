// Captures + mesures de la refonte (docs/redesign/audit/README.md).
// Usage : node docs/redesign/audit/capture.mjs <baseUrl> <dossier-captures> [filtre]
//  - 1440×900 (desktop) et 390×844 (mobile, isMobile, tactile), 6 s fixes après chargement ;
//  - POST /api/sync intercepté (aucun appel à Chess.com / Lichess) ;
//  - mesures : hauteur de page, défilement horizontal, cibles tactiles < 44 px (mobile,
//    hors cases d'échiquier), éléments interactifs visibles sans défiler (hors en-tête,
//    navigation et cases d'échiquier), action principale visible sans défiler.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "../../../web/node_modules/playwright/index.mjs";
import { SCREENS } from "./screens.mjs";

const [baseUrl = "http://localhost:3107", outDir = "docs/screens/redesign", filter] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });

const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 } },
  mobile: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
};

function measure() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const chrome = (el) => el.closest("header, nav[aria-label='Navigation principale'], [data-skip-audit]");
  const square = (el) => el.closest("[data-square]") || /-square-/.test(el.id || "");
  // Contenu d'un <details> fermé : Chrome lui garde une boîte (content-visibility), il n'est pas visible pour autant.
  const collapsed = (el) => {
    for (let d = el.parentElement?.closest("details"); d; d = d.parentElement?.closest("details")) {
      if (!d.open && !(el.tagName === "SUMMARY" && el.parentElement === d)) return true;
      el = d;
    }
    return false;
  };
  const visible = (el) => {
    if (el.closest('.sr-only') || el.classList.contains('sr-only')) return false;
    if (collapsed(el)) return false;
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const interactive = [...document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, summary, [role=tab], [role=button]")]
    .filter((el) => visible(el) && !el.closest("[inert]") && !el.disabled);
  const content = interactive.filter((el) => !chrome(el) && !square(el));
  const aboveFold = content.filter((el) => {
    const r = el.getBoundingClientRect();
    return r.top < vh && r.bottom > 0 && r.left < vw && r.right > 0;
  });
  // Zone de clic étendue par un pseudo-élément absolu (TOUCH_HIT_AREA) : c'est elle qui reçoit le toucher.
  const hitBox = (el) => {
    const r = el.getBoundingClientRect();
    let height = r.height;
    let width = r.width;
    for (const pseudo of ["::before", "::after"]) {
      const s = getComputedStyle(el, pseudo);
      if (s.content === "none" || s.position !== "absolute") continue;
      height = Math.max(height, parseFloat(s.height) || 0);
      width = Math.max(width, parseFloat(s.width) || 0, parseFloat(s.minWidth) || 0);
    }
    return { height, width };
  };
  const small = content.filter((el) => {
    const r = hitBox(el);
    if (el.matches("input[type=range], input[type=checkbox], input[type=radio]") && el.closest("label")) {
      const l = el.closest("label").getBoundingClientRect();
      return l.height < 44 && l.width < 44;
    }
    return r.height < 43.5 || r.width < 24;
  });
  const navSmall = interactive.filter((el) => chrome(el)).filter((el) => {
    const r = el.getBoundingClientRect();
    return r.height < 43.5 || r.width < 43.5;
  });
  const primary = document.querySelector("[data-primary-action]");
  const primaryVisible = primary ? primary.getBoundingClientRect().top < vh && primary.getBoundingClientRect().bottom > 0 : null;
  const header = document.querySelector("body > header, header.sticky");
  const h1 = document.querySelector("main h1");
  return {
    height: document.documentElement.scrollHeight,
    horizontalScroll: document.documentElement.scrollWidth > vw + 1,
    interactive: content.length,
    aboveFold: aboveFold.length,
    smallTargets: small.length,
    smallSamples: small.slice(0, 6).map((el) => `${el.tagName.toLowerCase()}:${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 30)}`),
    navSmallTargets: navSmall.length,
    primaryVisible,
    headerHeight: header ? Math.round(header.getBoundingClientRect().height) : null,
    h1Size: h1 ? parseFloat(getComputedStyle(h1).fontSize) : null,
    title: document.title,
  };
}

const browser = await chromium.launch();
const results = [];
for (const [device, options] of Object.entries(VIEWPORTS)) {
  const context = await browser.newContext({ ...options, locale: "fr-FR" });
  await context.route("**/api/sync", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ skipped: true, results: [], totalGamesImported: 0, totalPuzzlesCreated: 0 }) })
      : route.continue(),
  );
  for (const screen of SCREENS) {
    if (filter && !screen.name.includes(filter)) continue;
    const page = await context.newPage();
    const started = Date.now();
    let status = null;
    try {
      const response = await page.goto(baseUrl + screen.path, { waitUntil: "domcontentloaded", timeout: 240_000 });
      status = response?.status() ?? null;
      await page.waitForTimeout(6000);
      await page.addStyleTag({ content: "nextjs-portal{display:none!important}" }).catch(() => {});
      if (screen.steps) {
        await screen.steps(page, device);
        await page.waitForTimeout(screen.settle ?? 2000);
      }
      const metrics = await page.evaluate(measure);
      const file = `${screen.name}-${device}.png`;
      await page.screenshot({ path: join(outDir, file), fullPage: true, timeout: 120_000 });
      results.push({ screen: screen.name, device, path: screen.path, status, ms: Date.now() - started, ...metrics, file });
      console.log(`${screen.name} ${device} ${status} h=${metrics.height} fold=${metrics.aboveFold} small=${metrics.smallTargets} hscroll=${metrics.horizontalScroll} primary=${metrics.primaryVisible}`);
    } catch (error) {
      results.push({ screen: screen.name, device, path: screen.path, status, error: String(error).slice(0, 300) });
      console.log(`${screen.name} ${device} ERREUR ${String(error).slice(0, 200)}`);
    }
    await page.close();
  }
  await context.close();
}
await browser.close();
const reportFile = join(outDir, filter ? `mesures-${filter}.json` : "mesures.json");
writeFileSync(reportFile, JSON.stringify(results, null, 2));
console.log(`→ ${reportFile}`);
