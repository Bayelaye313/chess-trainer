// Signale les coups joués qui perdent >= 0,5 pion par rapport au meilleur (hors positions décisives).
import { readFileSync } from "node:fs";
for (const f of process.argv.slice(2)) {
  for (const line of readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*\(?(\S+?) => (\S+)\s+\[rang ([^;]+); top: (\S+) (\S+)/);
    if (!m || m[3] === "1") continue;
    const after = parseFloat(m[2]), best = parseFloat(m[5]);
    if (isNaN(after) || isNaN(best) || m[2].startsWith("#") || m[5].startsWith("#")) continue;
    const white = !m[1].includes("...");
    const loss = white ? best - after : after - best;
    if (loss >= 0.5 && Math.abs(best) < 3) console.log(f.split("/").pop(), line.trim().slice(0, 140));
  }
}
