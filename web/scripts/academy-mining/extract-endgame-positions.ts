/**
 * Collecte les positions RÉELLES de finales à soumettre à `endgame-puzzles.mjs` :
 * chaque nœud (ligne principale ET variantes) des PGN d'études Lichess passés
 * en argument, plus chaque position des chapitres déjà présents dans
 * `COURSE_LESSONS` pour les thèmes de finales visés.
 *
 *   npx tsx scripts/academy-mining/extract-endgame-positions.ts <positions.json> [étude.pgn ...]
 *
 * THEMES=th1,th2 remplace la liste des cours relus (défaut : les trois thèmes
 * de finales élémentaires du lot 3). Positions dédoublonnées sur l'EPD.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { Chess } from "chess.js";
import { collectNodes, MOVE_TREE_START_FEN, parseMoveTree } from "@/core/chess/move-tree";
import { COURSE_LESSONS } from "@/core/curriculum/course-lesson";

const [outPath, ...pgnPaths] = process.argv.slice(2);
if (!outPath) {
  console.error("usage: npx tsx scripts/academy-mining/extract-endgame-positions.ts <positions.json> [étude.pgn ...]");
  process.exit(1);
}
const THEMES = process.env.THEMES?.split(",") ?? ["eg-mats-de-force-ecrasante", "eg-face-au-roi-seul", "eg-finales-de-pions-le-duel-des-rois"];

const out: { fen: string; source: string }[] = [];
const seen = new Set<string>();
const add = (fen: string, source: string) => {
  const epd = fen.split(" ").slice(0, 4).join(" ");
  if (seen.has(epd)) return;
  seen.add(epd);
  out.push({ fen, source });
};

for (const path of pgnPaths) {
  for (const chapter of readFileSync(path, "utf8").split(/\r?\n(?=\[Event )/)) {
    const tag = (name: string) => chapter.match(new RegExp(`^\\[${name} "([^"]*)"\\]`, "m"))?.[1];
    const fen = tag("FEN") ?? MOVE_TREE_START_FEN; // une partie complète peut finir en finale élémentaire
    if (!/\S/.test(chapter)) continue;
    const author = tag("Annotator")?.split("/@/")[1];
    const source = `Étude Lichess « ${tag("StudyName")} »${author ? ` (${author})` : ""}, chapitre « ${tag("ChapterName")} » · ${tag("ChapterURL")}`;
    const movetext = chapter.replace(/^\[.*\]\s*$/gm, "").trim();
    try {
      for (const node of collectNodes(parseMoveTree(movetext, fen))) add(node.fen, source);
    } catch (e) {
      console.error(`chapitre ignoré (${tag("ChapterName")}) : ${(e as Error).message}`);
    }
  }
}

for (const themeId of THEMES) {
  for (const step of COURSE_LESSONS[themeId]?.steps ?? []) {
    const source = `Cours ${themeId}, chapitre « ${step.title} »`;
    const c = new Chess(step.fen);
    add(c.fen(), source);
    for (const san of step.moveSan ?? []) {
      c.move(san);
      add(c.fen(), source);
    }
  }
}

writeFileSync(outPath, JSON.stringify(out, null, 2));
console.error(`${out.length} positions`);
