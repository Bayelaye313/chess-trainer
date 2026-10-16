// Générateur jetable d'un cours d'ouverture `course-trees/op-<id>.ts` à partir d'un source PGN commenté.
// Source : blocs « ## Titre du chapitre » suivis d'un PGN (commentaires en clair, [%csl]/[%cal] permis).
// Sortie : chaque commentaire enveloppé dans [%txt "…"] (gel du lecteur) + [%eval x] Stockfish sur CHAQUE nœud.
// usage: node --import tsx scripts/_tmp-build-opening-course.mts <source.pgn> <header.ts> <sortie.ts> [profondeur=16] [sortie.pgn]
// Le nom exporté dérive du fichier de sortie (op-caro-kann.ts -> OP_CARO_KANN) ; [sortie.pgn] écrit en plus le PGN compilé.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { parseMoveTree, type ChessMoveNode } from "@/core/chess/move-tree";
import { startEngine, whitePawns } from "./_tmp-sf-native.mjs";

const [srcPath, headerPath, outPath, depthArg, pgnOutPath] = process.argv.slice(2);
const DEPTH = Number(depthArg ?? 16);
const sf = await startEngine({ multipv: 1 });

// Cache disque FEN -> balise d'éval : une reconstruction ne recalcule que les nœuds nouveaux
// (dans le dossier temporaire du système, jamais à côté du fichier généré).
const CACHE_PATH = join(tmpdir(), `${basename(outPath)}.evalcache.json`);
const cache: Record<string, string> = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {};
const blocks = readFileSync(srcPath, "utf8").split(/^## /m).slice(1);

async function evalTag(node: ChessMoveNode): Promise<string> {
  const key = `${node.fen}|${DEPTH}`;
  if (!cache[key]) {
    cache[key] = await computeEvalTag(node);
    writeFileSync(CACHE_PATH, JSON.stringify(cache));
  }
  return cache[key];
}

async function computeEvalTag(node: ChessMoveNode): Promise<string> {
  const turn = node.fen.split(" ")[1] as "w" | "b";
  const [best] = await sf.analyse(node.fen, DEPTH);
  if (!best) {
    // Position terminale : mat (le camp au trait est maté) ou pat.
    return node.san?.endsWith("#") ? `[%eval #0]` : `[%eval 0.00]`;
  }
  const p = whitePawns(best, turn)!;
  if (best.kind === "mate") {
    const n = turn === "w" ? best.v : -best.v;
    return `[%eval #${n}]`;
  }
  return `[%eval ${p.toFixed(2)}]`;
}

function clean(text: string): string {
  if (text.includes('"')) throw new Error(`guillemet droit interdit dans un [%txt] : ${text.slice(0, 80)}`);
  return text.replace(/`/g, "'").replace(/\$\{/g, "$ {");
}

async function commentOf(node: ChessMoveNode): Promise<string> {
  const prose = [node.comment, node.tip ? `PRO TIP : ${node.tip}` : null].filter(Boolean).join("\n\n");
  const parts = [] as string[];
  if (prose) parts.push(`[%txt "${clean(prose)}"]`);
  for (const hint of node.hints) parts.push(`[%hint "${clean(hint)}"]`);
  if (node.hintHighlights.length) parts.push(`[%hintcsl ${node.hintHighlights.map((h) => (h.color === "red" ? "R" : "G") + h.square).join(",")}]`);
  parts.push(await evalTag(node));
  if (node.highlights.length) parts.push(`[%csl ${node.highlights.map((h) => (h.color === "red" ? "R" : "G") + h.square).join(",")}]`);
  if (node.arrows.length) parts.push(`[%cal ${node.arrows.map((a) => (a.color === "red" ? "R" : "G") + a.from + a.to).join(",")}]`);
  return `{ ${parts.join(" ")} }`;
}

function moveLabel(node: ChessMoveNode): string {
  const n = Math.ceil(node.ply / 2);
  return node.ply % 2 === 1 ? `${n}. ${node.san}` : `${n}... ${node.san}`;
}

let nodes = 0;
async function emit(parent: ChessMoveNode, out: string[], indent: string): Promise<void> {
  let node = parent;
  while (node.children.length > 0) {
    const [main, ...variations] = node.children;
    out.push(`${indent}${moveLabel(main)} ${await commentOf(main)}`);
    nodes++;
    for (const v of variations) {
      out.push(`${indent}(${moveLabel(v)} ${await commentOf(v)}`);
      nodes++;
      await emit(v, out, indent + "  ");
      out[out.length - 1] += ")";
    }
    node = main;
  }
}

const chapters: string[] = [];
const pgnGames: string[] = [];
for (const block of blocks) {
  const nl = block.indexOf("\n");
  const title = block.slice(0, nl).trim();
  const pgn = block.slice(nl + 1).trim();
  const root = parseMoveTree(pgn);
  const out: string[] = [await commentOf(root)];
  await emit(root, out, "");
  out[out.length - 1] += " *";
  pgnGames.push(`[Event ${JSON.stringify(title)}]\n[Result "*"]\n\n${out.join("\n")}\n`);
  chapters.push(`    chapter(\n      ${JSON.stringify(title)},\n      \`${out.join("\n")}\`,\n    ),`);
  console.error(`chapitre « ${title} » : ${nodes} nœuds cumulés`);
}
sf.quit();

const header = readFileSync(headerPath, "utf8");
const exportName = basename(outPath, ".ts").toUpperCase().replace(/-/g, "_");
writeFileSync(outPath, `${header.trimEnd()}\n\nexport const ${exportName}: CourseTree = {\n  chapters: [\n${chapters.join("\n")}\n  ],\n};\n`);
if (pgnOutPath) writeFileSync(pgnOutPath, pgnGames.join("\n"));
console.error(`écrit ${outPath} (${nodes} coups commentés)`);
