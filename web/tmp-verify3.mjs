import { Chess } from "chess.js";

function replaySan(name, sanMoves) {
  const chess = new Chess();
  for (let i = 0; i < sanMoves.length; i++) {
    const san = sanMoves[i];
    const move = chess.move(san);
    if (!move) {
      console.log(`${name}: FAIL at move ${i + 1} "${san}" — position before: ${chess.fen()}`);
      return null;
    }
  }
  console.log(`${name}: OK, ${sanMoves.length} coups rejoués. Mat final = ${chess.isCheckmate()}`);
  return chess;
}

const evergreen = [
  "e4","e5","Nf3","Nc6","Bc4","Bc5","b4","Bxb4","c3","Ba5","d4","exd4",
  "O-O","d3","Qb3","Qf6","e5","Qg6","Re1","Nge7","Ba3","b5","Qxb5","Rb8",
  "Qa4","Bb6","Nbd2","Bb7","Ne4","Qf5","Bxd3","Qh5","Nf6+","gxf6","exf6","Rg8",
  "Rad1","Qxf3","Rxe7+","Nxe7","Qxd7+","Kxd7","Bf5+","Ke8","Bd7+","Kf8","Bxe7#",
];
const evergreenResult = replaySan("Evergreen Game (Anderssen-Dufresne 1852)", evergreen);
if (evergreenResult) {
  const chess2 = new Chess();
  for (const san of evergreen.slice(0, -1)) chess2.move(san);
  console.log("  FEN avant le dernier coup:", chess2.fen());
  const lastMove = chess2.move(evergreen[evergreen.length - 1]);
  console.log("  Dernier coup en UCI:", lastMove.from + lastMove.to);
}

console.log("---");

const gotc = [
  "Nf3","Nf6","c4","g6","Nc3","Bg7","d4","O-O","Bf4","d5","Qb3","dxc4",
  "Qxc4","c6","e4","Nbd7","Rd1","Nb6","Qc5","Bg4","Bg5","Na4","Qa3","Nxc3",
  "bxc3","Nxe4","Bxe7","Qb6","Bc4","Nxc3","Bc5","Rfe8+","Kf1","Be6","Bxb6","Bxc4+",
  "Kg1","Ne2+","Kf1","Nxd4+","Kg1","Ne2+","Kf1","Nc3+","Kg1","axb6","Qb4","Ra4",
  "Qxb6","Nxd1","h3","Rxa2","Kh2","Nxf2","Re1","Rxe1","Qd8+","Bf8","Nxe1","Bd5",
  "Nf3","Ne4","Qb8","b5","h4","h5","Ne5","Kg7","Kg1","Bc5+","Kf1","Ng3+",
  "Ke1","Bb4+","Kd1","Bb3+","Kc1","Ne2+","Kb1","Nc3+","Kc1","Rc2#",
];
const gotcResult = replaySan("Game of the Century (Byrne-Fischer 1956)", gotc);
if (gotcResult) {
  const chess2 = new Chess();
  for (const san of gotc.slice(0, -1)) chess2.move(san);
  console.log("  FEN avant le dernier coup:", chess2.fen());
  const lastMove = chess2.move(gotc[gotc.length - 1]);
  console.log("  Dernier coup en UCI:", lastMove.from + lastMove.to);
}
