import type { PuzzleDifficulty, PuzzleTheme } from "@/server/actions/puzzle-bank";

/**
 * Sous-ensemble volontairement restreint des thèmes Lichess (`puzzle.themes`,
 * des dizaines au total) — les motifs les plus lisibles pour un joueur qui
 * parcourt la banque, pas une couverture exhaustive. Distinct du vocabulaire
 * `Motif` interne (`core/chess/types.ts`) : ce sont les clés Lichess telles
 * quelles, passées telles quelles en paramètre `angle` de `/api/puzzle/next`.
 */
export const PUZZLE_THEMES: readonly { id: PuzzleTheme; label: string }[] = [
  { id: "mix", label: "Tous thèmes" },
  { id: "fork", label: "Fourchette" },
  { id: "pin", label: "Clouage" },
  { id: "skewer", label: "Enfilade" },
  { id: "discoveredAttack", label: "Attaque à la découverte" },
  { id: "hangingPiece", label: "Pièce en prise" },
  { id: "backRankMate", label: "Mat du couloir" },
  { id: "sacrifice", label: "Sacrifice" },
  { id: "endgame", label: "Finale" },
  { id: "opening", label: "Ouverture" },
  { id: "middlegame", label: "Milieu de partie" },
];

export const PUZZLE_DIFFICULTIES: readonly { id: PuzzleDifficulty; label: string }[] = [
  { id: "easiest", label: "Très facile" },
  { id: "easier", label: "Facile" },
  { id: "normal", label: "Normal" },
  { id: "harder", label: "Difficile" },
  { id: "hardest", label: "Très difficile" },
];
