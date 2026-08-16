/**
 * Contenu de démonstration pour l'onglet « Apprendre ».
 *
 * Le catalogue (`core/curriculum/catalog.ts`) annonce 141 thèmes, mais un
 * thème n'a de contenu jouable que si des lignes `curriculum_puzzles` lui
 * sont associées — voir le docstring de `curriculumPuzzles` dans
 * `server/db/schema/curriculum.ts`. Fabriquer 141 thèmes de positions réelles
 * (parties de tournois 2026, cours sous licence) dépasse ce qu'on peut
 * produire ici de façon fiable ; ce fichier ne couvre donc que quelques
 * thèmes, avec des positions construites à la main et vérifiées coup par
 * coup — de quoi faire fonctionner le parcours de bout en bout (accordéon →
 * session → progression → puzzle suivant). Le reste du catalogue attend un
 * import (même logique que `server/puzzle-bank/lichess-puzzle-api.ts` pour
 * la banque tierce de l'ancien onglet Casse-têtes).
 *
 * Convention UCI/SAN identique à `puzzles.solution` : coups adverses inclus
 * aux rangs impairs, rejoués automatiquement par `theme-puzzle-board.tsx`.
 */
import type { NewCurriculumPuzzle } from "@/server/db/schema/curriculum";

interface DemoPuzzleSeed {
  themeId: string;
  orderIndex: number;
  fen: string;
  solution: string[];
  solutionSan: string[];
  sourceRef: string | null;
}

const DEMO_PUZZLES: readonly DemoPuzzleSeed[] = [
  // --- Checkmate Patterns : Mat du couloir (2 exercices) ---
  {
    themeId: "cm-mat-du-couloir",
    orderIndex: 0,
    fen: "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1",
    solution: ["a1a8"],
    solutionSan: ["Ra8#"],
    sourceRef: "Exercice de démonstration",
  },
  {
    themeId: "cm-mat-du-couloir",
    orderIndex: 1,
    fen: "6k1/5ppp/8/8/8/8/8/1R4K1 w - - 0 1",
    solution: ["b1b8"],
    solutionSan: ["Rb8#"],
    sourceRef: "Exercice de démonstration",
  },

  // --- Checkmate Patterns : Mat étouffé (Philidor's Legacy) ---
  {
    themeId: "cm-mat-etouffe",
    orderIndex: 0,
    fen: "5r1k/6pp/7N/3Q4/8/8/5PPP/6K1 w - - 0 1",
    solution: ["d5g8", "f8g8", "h6f7"],
    solutionSan: ["Qg8+", "Rxg8", "Nf7#"],
    sourceRef: "Motif classique — Philidor's Legacy",
  },

  // --- Tactical Motifs : La fourchette (fourchette royale cavalier) ---
  {
    themeId: "tm-la-fourchette",
    orderIndex: 0,
    fen: "1k1q4/p6p/8/N7/8/8/6PP/6K1 w - - 0 1",
    solution: ["a5c6", "b8a8", "c6d8"],
    solutionSan: ["Nc6+", "Ka8", "Nxd8"],
    sourceRef: "Exercice de démonstration",
  },

  // --- Tactical Motifs : Le clouage absolu (gagner la pièce clouée) ---
  {
    themeId: "tm-le-clouage-absolu",
    orderIndex: 0,
    fen: "4k3/p4ppp/2n5/1B6/3N4/8/P4PPP/4K3 w - - 0 1",
    solution: ["d4c6"],
    solutionSan: ["Nxc6"],
    sourceRef: "Exercice de démonstration",
  },
];

export function buildDemoCurriculumPuzzleRows(): NewCurriculumPuzzle[] {
  return DEMO_PUZZLES.map((puzzle, index) => ({
    id: `demo-${index}`,
    themeId: puzzle.themeId,
    orderIndex: puzzle.orderIndex,
    fen: puzzle.fen,
    solution: puzzle.solution,
    solutionSan: puzzle.solutionSan,
    sourceRef: puzzle.sourceRef,
  }));
}
