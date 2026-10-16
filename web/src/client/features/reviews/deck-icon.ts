import type { DeckId } from "@/core/chess/decks";

/**
 * Un repère visuel par deck, purement cosmétique — `core/chess/decks.ts` ne
 * porte que le vocabulaire du domaine (titre/sous-titre déjà en français,
 * voir son docstring), pas de préoccupation d'affichage.
 */
export const DECK_ICON: Record<DeckId, string> = {
  daily: "🗓️",
  opening_mistakes: "📖",
  missed_checkmates: "♚",
  endgame_mistakes: "🏁",
  missed_tactics: "🎯",
  tactical_mistakes: "⚔️",
  positional_mistakes: "🧩",
};
