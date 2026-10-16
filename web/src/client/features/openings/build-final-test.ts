/**
 * Construction des manches du "Test Final" (Étape 3 du protocole façon Lotus
 * Chess, voir `opening-drill.tsx`) : pioche une position clé aléatoire dans
 * chaque variante déjà pratiquée par l'utilisateur, puis les enchaîne en une
 * seule session — voir le docstring de `use-opening-drill.ts` pour le
 * déroulé manche par manche (`DrillSelection.kind === "final-test"`).
 *
 * Module pur, sans dépendance React : testable indépendamment du hook.
 */
import { Chess } from "chess.js";
import { moveInputFromUci } from "@/core/analysis/evaluate-move";
import { MAIN_LINE_VARIATION_KEY, variationKeyFor } from "@/core/curriculum/opening-variation-key";
import type { OpeningLine } from "@/core/curriculum/openings";
import type { AnnotatedPly, OpeningVariation } from "@/server/queries/openings";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * Une manche de drill : position de départ + suite attendue DEPUIS cette
 * position (pas depuis le tout début de la partie). `startPly` : le ply
 * ABSOLU (1-based, aligné sur `opening.moves`) auquel `script` démarre — sert
 * `use-opening-drill.ts` à retrouver le bon commentaire pédagogique
 * (`core/curriculum/opening-commentary.ts`) même en plein milieu d'une
 * manche coupée avant sa fin.
 */
export interface DrillRound {
  startFen: string;
  script: readonly string[];
  label: string;
  startPly: number;
}

/** Une ligne (ligne principale ou variante nommée) déjà pratiquée, candidate pour une manche de Test Final. */
export interface PracticedEntry {
  key: string;
  label: string;
  uciMoves: readonly string[];
}

/**
 * Résout, parmi la ligne principale et les variantes nommées d'une ouverture,
 * celles dont la clé figure dans `practicedKeys` (`listPracticedVariationKeys`,
 * lecture serveur de `opening_progress` — voir son docstring) : le "vécu"
 * déclaré du joueur, jamais une simple présence dans le catalogue.
 */
export function resolvePracticedEntries(
  opening: OpeningLine,
  plies: readonly AnnotatedPly[],
  variations: readonly OpeningVariation[],
  practicedKeys: readonly string[],
): PracticedEntry[] {
  const keys = new Set(practicedKeys);
  const entries: PracticedEntry[] = [];
  if (keys.has(MAIN_LINE_VARIATION_KEY)) {
    entries.push({ key: MAIN_LINE_VARIATION_KEY, label: opening.name, uciMoves: plies.map((p) => p.uci) });
  }
  for (const variation of variations) {
    const key = variationKeyFor({ kind: "variation", eco: variation.eco, name: variation.name });
    if (keys.has(key)) entries.push({ key, label: variation.name, uciMoves: variation.uciMoves });
  }
  return entries;
}

/** Une "position clé" doit rester à au moins ce nombre de coups théoriques de son tout premier coup — sinon la manche ne teste presque rien. */
const MIN_LEAD_IN_PLIES = 2;
/** Il doit rester au moins ce nombre de coups à retrouver après la coupe — sinon la manche est triviale. */
const MIN_REMAINING_PLIES = 2;
/** Longueur minimale (en demi-coups) d'une ligne pour être éligible à une manche de Test Final — exporté pour que `OpeningDrill` puisse activer/désactiver son bouton sans dupliquer ce seuil. */
export const MIN_ROUND_PLIES = MIN_LEAD_IN_PLIES + MIN_REMAINING_PLIES;
/** Plafond de manches par session — au-delà, un "Test Final" devient un marathon plus qu'un contrôle de mémorisation. */
const MAX_ROUNDS = 6;

function fenAfterPrefix(uciMoves: readonly string[], count: number): string {
  const chess = new Chess();
  for (let i = 0; i < count; i += 1) chess.move(moveInputFromUci(uciMoves[i]));
  return chess.fen();
}

function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Une manche par entrée éligible (au moins `MIN_LEAD_IN_PLIES +
 * MIN_REMAINING_PLIES` coups), coupée à une position clé tirée au sort dans
 * sa portion centrale/finale — jamais au tout premier coup (trivial) ni trop
 * près de la fin (rien à tester). Au-delà de `MAX_ROUNDS` entrées éligibles,
 * un sous-ensemble aléatoire plutôt que les `MAX_ROUNDS` premières : chaque
 * variante pratiquée a la même chance d'être contrôlée d'une session à
 * l'autre.
 */
export function buildFinalTestRounds(entries: readonly PracticedEntry[]): DrillRound[] {
  const eligible = entries.filter((entry) => entry.uciMoves.length >= MIN_ROUND_PLIES);
  const picked = shuffled(eligible).slice(0, MAX_ROUNDS);

  return picked.map((entry) => {
    const maxCut = entry.uciMoves.length - MIN_REMAINING_PLIES;
    const cut = MIN_LEAD_IN_PLIES + Math.floor(Math.random() * (maxCut - MIN_LEAD_IN_PLIES + 1));
    return {
      startFen: cut === 0 ? START_FEN : fenAfterPrefix(entry.uciMoves, cut),
      script: entry.uciMoves.slice(cut),
      label: entry.label,
      startPly: cut,
    };
  });
}
