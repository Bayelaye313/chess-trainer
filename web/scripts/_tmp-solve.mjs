// Retrouve un coup manquant : essaie chaque coup légal + variantes de lecture des coups ambigus.
import { Chess } from "chess.js";
const pre = "d4 Nf6 c4 e6 g3 Bb4+ Bd2 Bxd2+ Nxd2 d5 Bg2 O-O Ngf3 b6 O-O Bb7 Rc1 Nbd7 cxd5 exd5 Ne5 c5 Nxd7 Nxd7 dxc5 bxc5 Nb3 c4 Nd4".split(" ");
const c0 = new Chess(); for (const m of pre) c0.move(m);
const tails = [];
for (const a of ["Nf6", "Qf6"]) for (const b of ["Rc2", "Qc2", "Nc2"]) tails.push(["b3", "Rab8", "Nf5", a, b, "Rfd8", "Qc1", "h6", "Qf4", "cxb3", "axb3", "Qb6", "Rfc1", "d4", "Bxb7", "Rxb7", "Rc6", "Qxb3", "Rxf6", "gxf6", "Qxh6"]);
for (const m of c0.moves()) for (const t of tails) {
  const c = new Chess(c0.fen()); c.move(m); let ok = true;
  for (const x of t) { try { c.move(x); } catch { ok = false; break; } }
  if (ok) console.log("15..." + m, "|", t.slice(3, 5).join(" "), "| final mat-menace:", c.fen());
}
