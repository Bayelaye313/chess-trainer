// Écrit chaque partie à partir de sa position d'intérêt (FEN + suite numérotée).
import { Chess } from "chess.js";
import { writeFileSync } from "node:fs";
import { GAMES } from "./_tmp-games-m6.mjs";
const START = { mecking: 21, aronian: 26, korobov: 30, toth: 25, bachmann: 31, madeja: 25 };
for (const [k, s] of Object.entries(GAMES)) {
  const mv = s.split(" "), c = new Chess();
  for (const m of mv.slice(0, START[k])) c.move(m);
  const fen = c.fen(); let n = Number(fen.split(" ")[5]), white = fen.split(" ")[1] === "w", out = [];
  mv.slice(START[k]).forEach((m, i) => { out.push(white ? `${n}. ${m}` : i === 0 ? `${n}... ${m}` : m); if (!white) n++; white = !white; });
  writeFileSync(`${process.argv[2]}/${k}.pgn`, `[FEN "${fen}"]\n\n${out.join(" ")} *\n`);
  console.log(k, fen);
}
