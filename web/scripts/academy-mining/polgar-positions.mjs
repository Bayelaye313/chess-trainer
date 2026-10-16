/**
 * Positions du livre de László Polgár, « Chess: 5334 Problems, Combinations
 * and Games » (`docs/laszlo_polgar_chess_5334_problems.pdf`) — le PDF est
 * composé avec une police d'échecs : chaque diagramme est du TEXTE exact
 * (8 rangées de 8 caractères), pas une image. Aucune transcription à l'œil.
 *
 * Police : case vide claire `0`, foncée `Z` ; pièces blanches sur case claire
 * `PNBRQK`, sur case foncée `OMASLJ` ; noires idem en minuscules.
 *
 *   python dump.py <pdf> polgar.txt        (texte brut du PDF, PyMuPDF)
 *   node scripts/academy-mining/polgar-positions.mjs <polgar.txt> <sortie.json> [filtre matériel, ex. KQ-K]
 *
 * Écrit `[{ no, fen, material }]` — le trait est aux Blancs (convention du livre,
 * tous les problèmes sont « les Blancs jouent ») ; vérifié ensuite par Stockfish.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { Chess } from "chess.js";

const [txtPath, outPath, filter] = process.argv.slice(2);
const DARK = { O: "P", M: "N", A: "B", S: "R", L: "Q", J: "K", o: "p", m: "n", a: "b", s: "r", l: "q", j: "k" };
const lines = readFileSync(txtPath, "utf8").split(/\r?\n/).map((l) => l.trim());

/** Signature matérielle « KQ-K » : pièces blanches puis noires, roi d'abord, pions en dernier. */
function material(board) {
  const order = "KQRBNP";
  const side = (re) => [...board.replace(/[^A-Za-z]/g, "")].filter((c) => re.test(c)).map((c) => c.toUpperCase()).sort((a, b) => order.indexOf(a) - order.indexOf(b)).join("");
  return `${side(/[A-Z]/)}-${side(/[a-z]/)}`;
}

const out = [];
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^No\. (\d+)/);
  if (!m) continue;
  // 8 rangées : « 8 », rangée, « 7 », rangée, … (chiffre de rang puis 8 caractères)
  const ranks = [];
  for (let j = i + 1; j < i + 40 && ranks.length < 8; j++) if (/^[0Z]?[0ZA-Za-z]{8}$/.test(lines[j]) && /^\d$/.test(lines[j - 1])) ranks.push(lines[j]);
  if (ranks.length < 8) continue;
  const rows = ranks.map((r) =>
    [...r]
      .map((c) => (c === "0" || c === "Z" ? "1" : DARK[c] ?? c))
      .join("")
      .replace(/1+/g, (s) => String(s.length)),
  );
  const placement = rows.join("/");
  const fen = `${placement} w - - 0 1`;
  try {
    new Chess(fen);
  } catch {
    continue;
  }
  const mat = material(placement);
  if (filter && mat !== filter) continue;
  out.push({ no: Number(m[1]), fen, material: mat });
}
writeFileSync(outPath, JSON.stringify(out, null, 1) + "\n");
console.log(JSON.stringify({ positions: out.length, filter: filter ?? null }));
