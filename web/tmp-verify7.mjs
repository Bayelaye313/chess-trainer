import { Chess } from "chess.js";
function tryLine(name, fen, moves) {
  try {
    const chess = new Chess(fen);
    for (const uci of moves) {
      const move = chess.move({ from: uci.slice(0,2), to: uci.slice(2,4), promotion: uci.slice(4,5) || undefined });
      if (!move) throw new Error("illegal " + uci);
    }
    console.log(`${name}: OK — ${chess.fen()}`);
  } catch (e) {
    console.log(`${name}: FAIL - ${e.message}`);
  }
}

tryLine("1_isolani_blockade", "r2q1rk1/pp3ppp/2n5/3n4/3P4/5N2/PP3PPP/R2Q1RK1 w - - 0 1", ["f3e5"]);
tryLine("2_hanging_pawns_break", "r1bq1rk1/pp3ppp/2n2n2/2p5/2PP4/2N2N2/PP3PPP/R1BQ1RK1 w - - 0 1", ["d4d5"]);
tryLine("3_open_file_rook_lift", "r1bq1rk1/pp3ppp/2n2n2/4p3/3P4/2N2N2/PP3PPP/R1BQ1RK1 w - - 0 1", ["a1c1"]);
tryLine("4_minority_attack", "r1bq1rk1/1p3ppp/p1n2n2/8/1P6/2N2N2/P4PPP/R1BQ1RK1 w - - 0 1", ["b4b5"]);
tryLine("5_knight_outpost", "r1bq1rk1/pp3ppp/2n2n2/4p3/3PP3/2N2N2/PP3PPP/R1BQ1RK1 w - - 0 1", ["c3d5"]);
tryLine("6_prophylaxis", "r1bq1rk1/pp3ppp/2n2n2/2p5/3P4/2N2N2/PP3PPP/R1BQ1RK1 b - - 0 1", ["a7a6"]);
