// Écrans capturés : mêmes noms que docs/screens/current/ (inventaire, section 8).
// Les identifiants de parties sont lus dans la base de travail (DATABASE_PATH).
import { createRequire } from "node:module";

const require = createRequire(new URL("../../../web/package.json", import.meta.url));
const Database = require("better-sqlite3");
const db = new Database(process.env.DATABASE_PATH, { readonly: true });
const one = (sql) => db.prepare(sql).get()?.id;
const chesscomGame = one("select id from games where source='chesscom' order by played_at desc limit 1");
const localWithPgn = one("select id from games where source not in ('chesscom','lichess') and pgn is not null and pgn!='' order by played_at desc limit 1") ?? chesscomGame;
const localWithoutPgn = one("select id from games where source not in ('chesscom','lichess') and (pgn is null or pgn='') limit 1") ?? "partie-sans-pgn-inexistante";
db.close();

async function clickFirst(page, selector) {
  const target = page.locator(selector).first();
  await target.waitFor({ state: "visible", timeout: 20_000 });
  await target.click();
}

export const SCREENS = [
  { name: "accueil", path: "/" },
  {
    name: "accueil-partie-en-cours",
    path: "/jouer",
    steps: async (page) => {
      await page.getByRole("button", { name: /^Commencer/ }).waitFor({ state: "visible" });
      await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => /^Commencer/.test(b.textContent ?? "") && !b.disabled), null, { timeout: 120_000 });
      await page.getByRole("button", { name: /^Commencer/ }).click();
    },
    settle: 5000,
  },
  { name: "rapport", path: "/rapport" },
  { name: "rapport-brillants", path: "/rapport/brillants" },
  { name: "rapport-ouvertures-scotch-game", path: "/rapport/ouvertures/scotch-game" },
  { name: "entrainer", path: "/entrainer" },
  {
    name: "entrainer-session-deck",
    path: "/entrainer",
    steps: (page) => clickFirst(page, "[data-deck-start]:not([disabled])"),
  },
  {
    name: "entrainer-hub-erreurs-ouverture",
    path: "/entrainer",
    steps: (page) => clickFirst(page, "[data-mistakes-hub]"),
    settle: 6000,
  },
  { name: "apprendre", path: "/apprendre" },
  { name: "apprendre-categorie-positional_mastery", path: "/apprendre?categoryId=positional_mastery" },
  { name: "apprendre-theme-pm-l-avant-poste-du-cavalier", path: "/apprendre?themeId=pm-l-avant-poste-du-cavalier" },
  { name: "ouvertures", path: "/ouvertures" },
  { name: "ouvertures-scotch-game", path: "/ouvertures/scotch-game" },
  { name: "ouvertures-lichess-modern-defense", path: "/ouvertures/lichess-modern-defense" },
  { name: "ouvertures-scotch-game-cours", path: "/ouvertures/scotch-game/cours" },
  { name: "ouvertures-queens-gambit-declined-cours", path: "/ouvertures/queens-gambit-declined/cours" },
  { name: "ouvertures-historique-endurance", path: "/ouvertures/historique-endurance" },
  { name: "pieges", path: "/pieges" },
  {
    name: "pieges-detail",
    path: "/pieges",
    steps: async (page) => {
      const href = await page.locator("a[href^='/pieges/']").first().getAttribute("href");
      await page.goto(page.url().replace(/\/pieges.*$/, href), { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(6000);
    },
  },
  { name: "plus", path: "/plus" },
  { name: "analyse-partie-chesscom", path: `/analyse/${chesscomGame}` },
  { name: "analyse-partie-locale-avec-pgn", path: `/analyse/${localWithPgn}` },
  { name: "analyse-partie-locale-sans-pgn", path: `/analyse/${localWithoutPgn}` },
  { name: "404", path: "/route-inconnue" },
];
