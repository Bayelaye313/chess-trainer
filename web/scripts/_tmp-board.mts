// Affiche l'échiquier ASCII après une ligne SAN, aux demi-coups demandés (liste séparée par des virgules, ou tout si vide).
// usage: node --import tsx scripts/_tmp-board.mts "<SAN...>" [plies]
import { Chess } from "chess.js";
const [line, at] = process.argv.slice(2);
const toks = line.trim().split(/\s+/).map((t) => t.replace(/^\d+\.+/, "")).filter(Boolean);
const want = at ? new Set(at.split(",").map(Number)) : new Set([toks.length]);
const c = new Chess();
toks.forEach((t, i) => { c.move(t); if (want.has(i + 1)) console.log(`après ${Math.ceil((i + 1) / 2)}${(i + 1) % 2 ? "." : "..."}${t}\n${c.ascii()}`); });
