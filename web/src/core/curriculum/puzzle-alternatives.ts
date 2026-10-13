/**
 * Coups équivalents acceptés pour les puzzles d'« Apprendre » tirés de parties
 * de maîtres (voir `SolvablePuzzle.alternatives`, `core/puzzle/solve-state.ts`).
 *
 * `puzzle-alternatives.json` est GÉNÉRÉ hors-ligne par Stockfish (MultiPV 5,
 * profondeur 16) — jamais écrit à la main : pour chaque pli du joueur, les
 * coups qui gardent au moins la valeur de la solution (à 3 points de
 * probabilité de gain près) et du meilleur coup (à 5 points près). Une
 * solution que le moteur réfute admet donc aussi le meilleur coup.
 *
 * Clé = position + solution complète (pas l'id DB, qui change au reseed) ;
 * valeur = `{ "<indice du pli>": [coups UCI] }`.
 */
import table from "./puzzle-alternatives.json";

const TABLE = table as Record<string, Record<string, string[]>>;

export function alternativesKey(fen: string, solution: readonly string[]): string {
  return `${fen}|${solution.join(" ")}`;
}

/** Alternatives alignées sur `solution` (indice = pli), ou `undefined` si le puzzle n'en a aucune. */
export function alternativesFor(fen: string, solution: readonly string[]): string[][] | undefined {
  const byPly = TABLE[alternativesKey(fen, solution)];
  if (!byPly) return undefined;
  return solution.map((_, i) => byPly[String(i)] ?? []);
}
