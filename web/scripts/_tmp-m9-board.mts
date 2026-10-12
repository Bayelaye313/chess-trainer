// Affiche l'échiquier ASCII de la FEN de départ d'un PGN de chapitre, puis à chaque marque "@ <ply>" demandée.
// usage: node --import tsx scripts/_tmp-m9-board.mts <pgn> [plies...]
import { readFileSync } from "node:fs";
import { Chess } from "chess.js";
import { mainLine, parseMoveTree } from "@/core/chess/move-tree";
const [file, ...plies] = process.argv.slice(2);
const t = readFileSync(file, "utf8");
const fen = t.match(/FEN "([^"]*)"/)![1];
const nodes = mainLine(parseMoveTree(t.replace(/^\[.*\]\s*$/gm, "").trim(), fen));
for (const p of ["0", ...plies]) { const n = nodes[Number(p)]; console.log(`-- ply ${p} ${n.san ?? "départ"}  ${n.fen}`); console.log(new Chess(n.fen).ascii()); }
