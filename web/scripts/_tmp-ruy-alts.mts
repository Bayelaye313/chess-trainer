import { Chess } from "chess.js";
import { startEngine, whitePawns } from "./_tmp-sf-native.mjs";
const sf = await startEngine({ multipv: 1 });
const lines: [string, string][] = [
  ["4.Bxc6 (ch.1)", "e4 e5 Nf3 Nc6 Bb5 a6 Bxc6"],
  ["8.c3 (ch.4 intro)", "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 O-O c3"],
  ["10.c3 (ch.4)", "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 O-O h3 Bb7 d3 d6 c3"],
  ["6.Re1 (ch.5)", "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Nxe4 Re1"],
  ["4.O-O (ch.6 intro)", "e4 e5 Nf3 Nc6 Bb5 Nf6 O-O"],
  ["4.Nxe5 (ch.8)", "e4 e5 Nf3 Nc6 Bb5 Nd4 Nxe5"],
  ["8.c3 (ch.8)", "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 d6 d4 b5 Bb3 Nxd4 Nxd4 exd4 c3"],
];
for (const [label, mv] of lines) {
  const c = new Chess(); for (const m of mv.split(" ")) c.move(m);
  const fen = c.fen(); const [best] = await sf.analyse(fen, 16);
  console.log(label, whitePawns(best, fen.split(" ")[1] as "w" | "b")?.toFixed(2));
}
sf.quit();
