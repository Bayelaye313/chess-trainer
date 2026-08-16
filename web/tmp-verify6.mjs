import { Chess } from "chess.js";
function replaySan(name, sanMoves) {
  const chess = new Chess();
  for (let i = 0; i < sanMoves.length; i++) {
    const move = chess.move(sanMoves[i]);
    if (!move) { console.log(`${name}: FAIL at move ${i+1} "${sanMoves[i]}" — ${chess.fen()}`); return null; }
  }
  console.log(`${name}: OK. Mat = ${chess.isCheckmate()}`);
  return chess;
}
const legall = ["e4","e5","Nf3","d6","Bc4","Bg4","Nc3","g6","Nxe5","Bxd1","Bxf7+","Ke7","Nd5#"];
const r = replaySan("Legall vs Saint Brie ~1750", legall);
if (r) {
  const c2 = new Chess();
  for (const s of legall.slice(0,-1)) c2.move(s);
  console.log("  FEN:", c2.fen());
  const lm = c2.move(legall[legall.length-1]);
  console.log("  UCI:", lm.from+lm.to);
}
