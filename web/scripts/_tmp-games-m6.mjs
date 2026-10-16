import { Chess } from "chess.js";
export const GAMES = {
  mecking: "d4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 d5 Nf3 c5 O-O cxd4 exd4 dxc4 Bxc4 b6 Qb3 Bxc3 bxc3 Bb7 Ba3 Re8 Bb5 Bc6 Be2 Nbd7 c4 Qc7 Rfe1 Rad8 Bb2 Nf8 Ne5 Ba8 Bf1 Ng6 f3 Nh4 Bd3 Nd7 Nxd7 Rxd7 Qc2 Kh8 Qf2 Qd8 d5 b5 Bc2 Rg8 dxe6 fxe6 Rad1 Rxd1 Rxd1 Qg5 Qg3 Qe7 Rd7",
  aronian: "c4 c5 Nf3 Nc6 Nc3 g6 e3 Nf6 d4 cxd4 exd4 d5 cxd5 Nxd5 Qb3 Nxc3 Bc4 e6 bxc3 Bg7 Ba3 Bf8 Bxf8 Kxf8 O-O Kg7 Bb5 Qc7 Be2 Rd8 Rfd1 b6 c4 Ne7 Qb2 Kg8 Ne5 h5 Rac1 Bb7 d5 exd5 cxd5 Qd6 Nc4 Qf4 d6 Nf5 d7 Qg5 g3",
  korobov: "d4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 c5 Nf3 d5 O-O cxd4 exd4 dxc4 Bxc4 Nbd7 Bd3 b6 a3 Bxc3 bxc3 Bb7 Re1 Re8 Bg5 Qc7 c4 Rac8 Ne5 Nxe5 dxe5 Nd7 Qh5 Nf8 Re3 Qc6 Rg3 Rc7 Bxh7+ Nxh7 Bf6 Qxc4 Rxg7+ Kf8 Qh6 Rec8 Rg8+",
  toth: "d4 Nf6 c4 e6 g3 Bb4+ Bd2 Bxd2+ Nxd2 d5 Bg2 O-O Ngf3 b6 O-O Bb7 Rc1 Nbd7 cxd5 exd5 Ne5 c5 Nxd7 Nxd7 dxc5 bxc5 Nb3 c4 Nd4 Qa5 b3 Rab8 Nf5 Nf6 Rc2 Rfd8 Qc1 h6 Qf4 cxb3 axb3 Qb6 Rfc1 d4 Bxb7 Rxb7 Rc6 Qxb3 Rxf6 gxf6 Qxh6",
  bachmann: "Nf3 d5 g3 c5 Bg2 Nc6 d4 Nf6 O-O e6 b3 Be7 Bb2 O-O Nbd2 b6 dxc5 bxc5 c4 Bb7 cxd5 exd5 Rc1 Qa5 a3 Rad8 Qc2 h6 Rfd1 Qb6 e3 Nd7 Qf5 Na5 Rb1 Nf6 Qc2 Bc8 Nh4 Be6 b4 Nb7 Nhf3 Ne4 Nxe4 dxe4 Ne5 cxb4 axb4 Rxd1+ Rxd1 f5 Bf1",
  madeja: "d4 Nf6 c4 e6 Nf3 Bb4+ Bd2 a5 g3 d5 Qc2 c5 cxd5 cxd4 Bg2 O-O Nxd4 Qb6 e3 exd5 O-O Nc6 Nxc6 bxc6 Rfc1 Bxd2 Nxd2 Bd7 Nb3 Rfb8 Nc5 Be8 b3 Qa7 e4 h6 Re1 dxe4 Bxe4 Rb5 Rac1 Nxe4 Rxe4 f6 Qc3 Bf7 Qe3 Qb8 Re7 Qf8 a4 Rb4 Nd7 Qd8 Rd1 Bd5 Rxd5 cxd5 Nxf6+ Kh8 Qxh6+ gxh6 Rh7#",
};
if (process.argv[2] === "run") for (const [k, s] of Object.entries(GAMES)) {
  const c = new Chess(); const mv = s.split(" "); let i = 0;
  try { for (; i < mv.length; i++) c.move(mv[i]); console.log("OK ", k, mv.length, "plis", c.isCheckmate() ? "(mat)" : ""); }
  catch { console.log("ERR", k, "pli", i + 1, `(${Math.floor(i / 2) + 1}${i % 2 ? "..." : "."}${mv[i]})`, "légaux:", c.moves().join(" ")); }
}
