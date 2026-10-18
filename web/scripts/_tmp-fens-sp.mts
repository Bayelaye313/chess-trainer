// Affiche la FEN avant chaque demi-coup demandé : <body-file> <ply,ply,...>
import { readFileSync } from "node:fs";
import { Chess } from "chess.js";
const [file, plies] = process.argv.slice(2);
const toks = readFileSync(file, "utf8").replace(/\d+\.+/g, " ").split(/\s+/).filter(t => t && t !== "*");
const want = new Set(plies.split(",").map(Number));
const c = new Chess();
toks.forEach((t, i) => { if (want.has(i + 1)) console.log(i + 1, t, c.fen()); c.move(t); });
