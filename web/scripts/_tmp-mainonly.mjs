// Ligne principale seule (commentaires et variantes retirés) d'un ou plusieurs chapitres PGN.
import { readFileSync } from "node:fs";
import { Chess } from "chess.js";
const [file, filter] = process.argv.slice(2);
for (const ch of readFileSync(file, "utf8").split(/\r?\n(?=\[Event )/)) {
  const name = ch.match(/^\[ChapterName "([^"]*)"\]/m)?.[1] ?? ch.match(/^\[Event "([^"]*)"\]/m)?.[1];
  if (filter && !name?.includes(filter)) continue;
  let body = ch.replace(/^\[.*\]\s*$/gm, "").replace(/\{[^}]*\}/g, " ");
  let prev; do { prev = body; body = body.replace(/\([^()]*\)/g, " "); } while (body !== prev);
  const toks = body.split(/\s+/).filter((t) => t && !/^\d+\.+$/.test(t) && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(t) && !/^\$\d+$/.test(t)).map((t) => t.replace(/^\d+\.+/, "").replace(/[!?]+$/, ""));
  const fen = ch.match(/^\[FEN "([^"]*)"\]/m)?.[1];
  const c = fen ? new Chess(fen) : new Chess(); const ok = [];
  for (const t of toks) { try { c.move(t); ok.push(t); } catch { console.log(`  !! arrêt sur ${t}`); break; } }
  console.log(`## ${name} (${ok.length} plis)\n${ok.join(" ")}\n`);
}
