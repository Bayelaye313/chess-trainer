/**
 * Positions de livres (études, finales commentées) → fichier `*.override.json`
 * de l'Académie, avec le même contrôle d'unicité que les puzzles Lichess.
 *
 * Source : une liste JSON `[{ key, themeId, fen, prelude?, line, source, note? }]`
 * transcrite à la main depuis un livre scanné (diagramme → FEN, solution du
 * texte en SAN). `prelude` rejoue des coups avant le début de l'exercice
 * (position citée plus haut dans le livre) ; `line` est la solution, coup du
 * solveur en premier.
 *
 *   node --import tsx scripts/academy-mining/book-positions.mts check <source.json> <check-in.json>
 *     rejoue chaque ligne (une erreur de transcription = coup illégal, signalé)
 *     et écrit l'entrée de `check-uniqueness.mts` (INPUT=…) ;
 *   node --import tsx scripts/academy-mining/book-positions.mts build <source.json> <dossier jsonl> <sortie.override.json> [min-plis]
 *     garde de chaque ligne le plus long préfixe dont TOUS les coups du solveur
 *     sont « unique », « toleree » ou « limite » (verdicts de
 *     `classify-uniqueness.mjs`), terminé sur un coup du solveur et d'au moins
 *     `min-plis` demi-coups (3 par défaut : le filtre qualité de
 *     `seed-academy.ts` écarte les exercices à 1 pli des thèmes tactiques).
 *
 * Un coup du solveur jugé « fausse » ou « ambigue » coupe la ligne. Si le
 * préfixe est trop court, l'exercice peut commencer plus loin dans la ligne
 * du livre (fenêtre sûre la plus longue, la plus proche du diagramme à
 * égalité) : typiquement une étude dont le 1er coup admet une transposition
 * mais dont la suite est forcée. Les coups sautés sont cités dans `sourceRef`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { Chess } from "chess.js";
import { sanitizeCastlingRights } from "../../src/core/curriculum/academy-parser";
import { classifyPlies, readRows } from "./classify-uniqueness.mjs";

interface BookPosition {
  key: string;
  themeId: string;
  fen: string;
  prelude?: string[];
  line: string[];
  source: string;
  note?: string;
}

const ACCEPTED = new Set(["unique", "toleree", "limite"]);

/** Position de départ de l'exercice (après le prélude) et solution en SAN canonique (avec +/#) — `null` + raison si la transcription ne se rejoue pas. */
function replay(p: BookPosition): { fen: string; san: string[] } | { error: string } {
  let board: Chess;
  try {
    board = new Chess(sanitizeCastlingRights(p.fen));
  } catch (cause) {
    return { error: `FEN invalide : ${(cause as Error).message}` };
  }
  for (const [i, san] of (p.prelude ?? []).entries()) {
    try {
      board.move(san);
    } catch {
      return { error: `prélude, coup ${i + 1} illégal : ${san}` };
    }
  }
  const fen = board.fen();
  const san: string[] = [];
  for (const [i, move] of p.line.entries()) {
    try {
      san.push(board.move(move).san);
    } catch {
      return { error: `solution, pli ${i} illégal : ${move} (après ${san.join(" ")})` };
    }
  }
  return { fen, san };
}

/** « 1.Nd5 b1=Q 2.b6+ Kb8 » depuis la FEN de départ (numéros de coups réels du diagramme). */
function movetext(fen: string, sans: readonly string[]): string {
  const [, turn, , , , full] = fen.split(" ");
  let n = Number(full) || 1;
  let white = turn === "w";
  const out: string[] = [];
  for (const [i, san] of sans.entries()) {
    if (white) out.push(`${n}.${san}`);
    else out.push(i === 0 ? `${n}...${san}` : san);
    if (!white) n += 1;
    white = !white;
  }
  return out.join(" ");
}

const [mode, sourcePath, ...rest] = process.argv.slice(2);
const positions = JSON.parse(readFileSync(sourcePath, "utf8")) as BookPosition[];

if (mode === "check") {
  const [inputPath] = rest;
  const input = [];
  for (const p of positions) {
    const r = replay(p);
    if ("error" in r) {
      console.log(JSON.stringify({ key: p.key, rejected: r.error }));
      continue;
    }
    input.push({ key: p.key, theme: p.themeId, fen: r.fen, solutionSan: r.san, sourceRef: p.source });
  }
  writeFileSync(inputPath, JSON.stringify(input));
  console.log(JSON.stringify({ positions: positions.length, replayed: input.length }));
} else if (mode === "build") {
  const [dir, outPath, minArg] = rest;
  const minPlies = Number(minArg ?? 3);
  const audited = new Map((readRows(dir) as { id: string }[]).map((r) => [r.id, r]));
  const entries = [];
  for (const p of positions) {
    const r = replay(p);
    const row = audited.get(p.key) as Parameters<typeof classifyPlies>[0] | undefined;
    if ("error" in r || !row) {
      console.log(JSON.stringify({ key: p.key, kept: false, reason: "error" in r ? r.error : "non audité" }));
      continue;
    }
    const plies = classifyPlies(row) as { i: number; cls: string }[];
    const verdicts = plies.map((ply) => `${r.san[ply.i]}:${ply.cls}`).join(" ");
    // Fenêtres [start, end) : start sur un coup du solveur, tous ses coups du solveur acceptés.
    let best = { start: 0, end: 0 };
    for (let s = 0; s < plies.length; s++) {
      let end = plies[s].i;
      for (let k = s; k < plies.length && ACCEPTED.has(plies[k].cls); k++) end = plies[k].i + 1;
      const start = plies[s].i;
      if (end - start > best.end - best.start) best = { start, end };
    }
    if (best.end - best.start < minPlies) {
      console.log(JSON.stringify({ key: p.key, kept: false, reason: `fenêtre sûre de ${best.end - best.start} pli(s) < ${minPlies}`, verdicts }));
      continue;
    }
    const board = new Chess(r.fen);
    const skipped = r.san.slice(0, best.start);
    for (const san of skipped) board.move(san);
    entries.push({
      themeId: p.themeId,
      fen: board.fen(),
      moves: r.san.slice(best.start, best.end),
      sourceRef: skipped.length ? `${p.source}, position après ${movetext(r.fen, skipped)}` : p.source,
      rating: 0,
      sacrifice: false,
    });
    console.log(JSON.stringify({ key: p.key, kept: true, from: best.start, plies: best.end - best.start, of: r.san.length, verdicts }));
  }
  writeFileSync(outPath, JSON.stringify(entries, null, 2) + "\n");
  console.log(JSON.stringify({ written: entries.length, file: outPath }));
} else {
  console.error("usage : book-positions.mts check|build …");
  process.exit(1);
}
