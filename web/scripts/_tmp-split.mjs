// Fragment d'une partie : <pgn-moves> <index du premier coup du fragment (pli, 0 = départ)> <sortie> [fen de départ]
import { Chess } from "chess.js";
import { writeFileSync } from "node:fs";
const [moves, start, out, fen0] = process.argv.slice(2);
const mv = moves.split(" "), c = fen0 ? new Chess(fen0) : new Chess();
for (const m of mv.slice(0, +start)) c.move(m);
const fen = c.fen(); let n = Number(fen.split(" ")[5]), white = fen.split(" ")[1] === "w", o = [];
mv.slice(+start).forEach((m, i) => { o.push(white ? `${n}. ${m}` : i === 0 ? `${n}... ${m}` : m); if (!white) n++; white = !white; });
writeFileSync(out, `[FEN "${fen}"]\n\n${o.join(" ")} *\n`); console.log(out.split("/").pop(), fen);
