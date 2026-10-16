// Affiche l'échiquier ASCII après une ligne SAN. usage: node --import tsx scripts/_tmp-board.mts "<SAN>"
import { Chess } from "chess.js";
for (const line of process.argv.slice(2)) { const c = new Chess(); for (const m of line.split(/\s+/)) c.move(m); console.log(line.split(" ").slice(-2).join(" ")); console.log(c.ascii()); }
