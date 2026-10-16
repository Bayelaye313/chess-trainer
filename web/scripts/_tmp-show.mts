// Affiche l'échiquier après une suite de coups SAN : <fen> <coups...>
import { Chess } from "chess.js";
const [fen, ...moves] = process.argv.slice(2);
const c = new Chess(fen);
for (const m of moves.join(" ").split(/\s+/).filter(Boolean)) { try { c.move(m); } catch { console.log("ILLÉGAL:", m); break; } }
console.log(c.ascii()); console.log(c.fen(), c.isCheckmate() ? "MAT" : "");
