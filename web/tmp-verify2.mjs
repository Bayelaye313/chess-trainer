import { Chess } from "chess.js";

function replaySan(name, sanMoves) {
  const chess = new Chess();
  for (const san of sanMoves) {
    const move = chess.move(san);
    if (!move) {
      console.log(`${name}: FAIL at "${san}" — position: ${chess.fen()}`);
      return null;
    }
  }
  console.log(`${name}: OK, ${sanMoves.length} coups rejoués. Mat final = ${chess.isCheckmate()}`);
  return chess;
}

// Opera Game — Morphy vs Duke of Brunswick & Count Isouard, Paris 1858
const opera = [
  "e4","e5","Nf3","d6","d4","Bg4","dxe5","Bxf3","Qxf3","dxe5","Bc4","Nf6",
  "Qb3","Qe7","Nc3","c6","Bg5","b5","Nxb5","cxb5","Bxb5+","Nbd7","O-O-O","Rd8",
  "Rxd7","Rxd7","Rd1","Qe6","Bxd7+","Nxd7","Qb8+","Nxb8","Rd8#",
];
const operaResult = replaySan("Opera Game (Morphy 1858)", opera);
if (operaResult) {
  // Rejoue sans le dernier coup pour obtenir la FEN de départ du puzzle.
  const chess2 = new Chess();
  for (const san of opera.slice(0, -1)) chess2.move(san);
  console.log("  FEN avant le dernier coup:", chess2.fen());
  const lastMove = chess2.move(opera[opera.length - 1]);
  console.log("  Dernier coup en UCI:", lastMove.from + lastMove.to);
}

console.log("---");

// Immortal Game — Anderssen vs Kieseritzky, London 1851
const immortal = [
  "e4","e5","f4","exf4","Bc4","Qh4+","Kf1","b5","Bxb5","Nf6","Nf3","Qh6",
  "d3","Nh5","Nh4","Qg5","Nf5","c6","g4","Nf6","Rg1","cxb5","h4","Qg6",
  "h5","Qg5","Qf3","Ng8","Bxf4","Qf6","Nc3","Bc5","Nd5","Qxb2","Bd6","Bxg1",
  "e5","Qxa1+","Ke2","Na6","Nxg7+","Kd8","Qf6+","Nxf6","Be7#",
];
const immortalResult = replaySan("Immortal Game (Anderssen 1851)", immortal);
if (immortalResult) {
  const chess2 = new Chess();
  for (const san of immortal.slice(0, -1)) chess2.move(san);
  console.log("  FEN avant le dernier coup:", chess2.fen());
  const lastMove = chess2.move(immortal[immortal.length - 1]);
  console.log("  Dernier coup en UCI:", lastMove.from + lastMove.to);
}
