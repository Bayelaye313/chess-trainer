import { BookOpen, CalendarDays, Crown, Flag, Puzzle, Swords, Target, type LucideIcon } from "lucide-react";
import type { DeckId } from "@/core/chess/decks";

/** Icône par deck (une seule bibliothèque : lucide). */
export const DECK_ICON: Record<DeckId, LucideIcon> = {
  daily: CalendarDays,
  opening_mistakes: BookOpen,
  missed_checkmates: Crown,
  endgame_mistakes: Flag,
  missed_tactics: Target,
  tactical_mistakes: Swords,
  positional_mistakes: Puzzle,
};
