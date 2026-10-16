// Rejoue des parties (fichier : blocs "## nom" puis les coups SAN) ; signale le premier coup illégal,
// sinon affiche la FEN après chaque coup demandé (lignes "@ <coup>" ex. "@ 17w" = après le 17e coup blanc).
// usage: npx tsx scripts/_tmp-replay.mts <fichier>
import { readFileSync } from "node:fs";
import { Chess } from "chess.js";

const text = readFileSync(process.argv[2], "utf8");
for (const block of text.split(/^## /m).slice(1)) {
  const [name, ...rest] = block.split("\n");
  const marks = rest.filter((l) => l.startsWith("@")).map((l) => l.slice(1).trim());
  const body = rest.filter((l) => !l.startsWith("@")).join(" ").replace(/\{[^}]*\}/g, " ").replace(/\d+\.(\.\.)?/g, " ");
  const sans = body.split(/\s+/).filter((t) => t && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(t));
  const c = new Chess();
  let ok = true;
  const fens: string[] = [];
  for (const [i, san] of sans.entries()) {
    try { c.move(san); fens.push(c.fen()); } catch {
      console.log(`[${name.trim()}] ILLÉGAL au demi-coup ${i + 1} (${Math.floor(i / 2) + 1}${i % 2 ? "..." : "."}${san}) ; légaux: ${c.moves().join(" ")}`);
      ok = false; break;
    }
  }
  if (ok) console.log(`[${name.trim()}] OK ${sans.length} demi-coups, final: ${c.fen()}`);
  for (const m of marks) {
    const mm = m.match(/^(\d+)([wb])$/);
    if (!mm) continue;
    const ply = (+mm[1] - 1) * 2 + (mm[2] === "w" ? 1 : 2);
    console.log(`   après ${m}: ${fens[ply - 1] ?? "?"}`);
  }
}
