import { readFileSync } from "node:fs";
const t = readFileSync("data/import/academy/tactics.pgn", "utf8").replace(/\r/g, "");
let n = 0;
for (const g of t.split(/\n(?=\[Event )/)) {
  const fen = g.match(/\[FEN "([^"]*)"/)?.[1]; if (!fen) continue;
  const sol = g.replace(/^\[.*$/gm, "").trim();
  if (!sol.includes("#")) continue;
  const [board, turn] = fen.split(" ");
  const ranks = board.split("/");
  const r7 = turn === "w" ? ranks[1] : ranks[6];
  const R = turn === "w" ? "R" : "r";
  if ((r7.split(R).length - 1) < 2) continue;
  const plies = sol.split(/\s+/).filter((x) => /[a-zA-Z]/.test(x)).length;
  if (plies < 3) continue;
  console.log(fen, "|", sol); if (++n > 40) break;
}
