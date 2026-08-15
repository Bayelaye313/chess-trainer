/**
 * Vérifie le décodage UCI contre la vraie sortie de Stockfish, sous Node.
 *
 * Les tests unitaires de src/core/engine/uci.test.ts travaillent sur des lignes
 * figées ; ce script confronte les mêmes fonctions au moteur réel, dont le
 * format de sortie peut changer d'une version à l'autre.
 *
 *   npm run smoke:engine
 */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const initEngine = require("stockfish");

// Les fonctions à valider, chargées depuis les sources TypeScript via Node.
const uciUrl = pathToFileURL(join(process.cwd(), "src", "core", "engine", "uci.ts")).href;
const { parseBestMove, parseInfoLine, goCommand } = await import(uciUrl);

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const DEPTH = 14;

// Sous Node, le package expose `sendCommand` et un `listener` de sortie —
// pas l'interface Worker (postMessage) utilisée dans le navigateur.
const engine = await initEngine("lite-single");

let infoCount = 0;
let latest = null;

const finished = new Promise((resolve) => {
  engine.listener = (line) => {
    const info = parseInfoLine(line);
    if (info) {
      infoCount += 1;
      if (info.pv || info.scoreCp !== undefined || info.scoreMate !== undefined) {
        latest = info;
      }
      return;
    }
    const best = parseBestMove(line);
    if (best) resolve(best.bestMove);
  };
});

engine.sendCommand("uci");
engine.sendCommand("isready");
engine.sendCommand(`position fen ${START}`);
engine.sendCommand(goCommand({ depth: DEPTH }));

const bestMove = await finished;

console.log(`lignes info décodées : ${infoCount}`);
console.log(`dernière évaluation  : ${JSON.stringify(latest)}`);
console.log(`bestmove             : ${bestMove}`);

const problems = [];
if (infoCount === 0) problems.push("aucune ligne info décodée");
if (!latest?.depth) problems.push("profondeur absente");
if (latest?.scoreCp === undefined && latest?.scoreMate === undefined) {
  problems.push("score absent");
}
if (!latest?.pv?.length) problems.push("variante absente");
if (!bestMove) problems.push("bestmove absent");

if (problems.length > 0) {
  console.error(`\nÉCHEC : ${problems.join(", ")}`);
  process.exit(1);
}

console.log("\nOK — le décodage UCI colle à la sortie réelle du moteur.");
process.exit(0);
