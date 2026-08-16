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
const reti = ["e4","c6","d4","d5","Nc3","dxe4","Nxe4","Nf6","Qd3","e5","dxe5","Qa5+","Bd2","Qxe5","O-O-O","Nxe4","Qd8+","Kxd8","Bg5+","Kc7","Rd8#"];
const r = replaySan("Reti vs Tartakower 1910", reti);
if (r) {
  const c2 = new Chess();
  for (const s of reti.slice(0,-1)) c2.move(s);
  console.log("  FEN:", c2.fen());
  const lm = c2.move(reti[reti.length-1]);
  console.log("  UCI:", lm.from+lm.to);
}
