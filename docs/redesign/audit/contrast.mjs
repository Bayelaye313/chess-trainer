// Contraste AA des couples texte/fond des jetons de globals.css.
// Usage : node docs/redesign/audit/contrast.mjs web/src/app/globals.css
import { readFileSync } from "node:fs";
const css = readFileSync(process.argv[2] ?? "web/src/app/globals.css", "utf8");
const root = css.slice(css.indexOf(":root"), css.indexOf("}", css.indexOf(":root")));
const tokens = Object.fromEntries([...root.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));
const lum = (hex) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const texts = ["foreground", "foreground-muted", "foreground-subtle", "accent", "status-success", "status-warning", "status-danger", "status-info", "quality-brilliant", "quality-best", "quality-inaccuracy", "quality-book", "quality-critical"];
const bgs = ["background", "surface", "surface-muted", "surface-raised"];
let fail = 0;
console.log("| texte \\ fond | " + bgs.join(" | ") + " |\n|---|" + bgs.map(() => "---|").join(""));
for (const t of texts) {
  if (!tokens[t]) continue;
  const cells = bgs.map((b) => { const r = ratio(tokens[t], tokens[b]); if (r < 4.5) fail++; return `${r.toFixed(2)}${r < 4.5 ? " ✗" : ""}`; });
  console.log(`| ${t} | ${cells.join(" | ")} |`);
}
const pairs = [["accent-foreground", "accent"], ["accent-foreground", "accent-hover"]];
for (const [t, b] of pairs) { const r = ratio(tokens[t], tokens[b]); if (r < 4.5) fail++; console.log(`| ${t} sur ${b} | ${r.toFixed(2)} |`); }
console.log(fail ? `\n${fail} couple(s) sous 4,5:1 (les qualités de coup ne sont pas toutes utilisées en texte)` : "\nTous les couples ≥ 4,5:1");
