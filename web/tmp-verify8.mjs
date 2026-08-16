import { Chess } from "chess.js";
function tryLine(name, fen, moves) {
  try {
    const chess = new Chess(fen);
    for (const uci of moves) {
      const move = chess.move({ from: uci.slice(0,2), to: uci.slice(2,4), promotion: uci.slice(4,5) || undefined });
      if (!move) throw new Error("illegal " + uci);
    }
    console.log(`OK — ${chess.fen()}`);
  } catch (e) {
    console.log(`FAIL - ${e.message}`);
  }
}
tryLine("3_open_file_rook_lift_fixed", "r1bq1rk1/pp3ppp/2n2n2/4p1B1/3P4/2N2N2/PP3PPP/R2Q1RK1 w - - 0 1", ["a1c1"]);
