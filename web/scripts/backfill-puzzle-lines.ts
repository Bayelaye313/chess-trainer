import { getNodeStockfishAnalyser } from "@/server/engine/node-stockfish-analyser";
import { backfillMoveBestPv, backfillPersonalPuzzleLines } from "@/server/queries/spaced-repetition";

/**
 * Rattrape, en une fois, les puzzles personnels créés avant l'ajout de la PV
 * moteur (`EvaluatedMove.bestPv`) : ils étaient limités à un seul coup à
 * trouver (bug utilisateur corrigé, voir `spaced-repetition.ts`). Deux étapes
 * dans l'ordre : recalcule `bestPv` pour les coups concernés (un appel moteur
 * chacun), puis étend les puzzles déjà créés avec cette PV désormais connue.
 */
async function main() {
	const analyser = getNodeStockfishAnalyser();
	const pv = await backfillMoveBestPv(analyser);
	console.log(`PV moteur recalculée : ${pv.updated}/${pv.scanned} coup(s) mis à jour.`);

	const lines = await backfillPersonalPuzzleLines();
	console.log(`Puzzle lines scanned: ${lines.scanned}; extended: ${lines.extended}`);
}

void main();
