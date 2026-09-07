import type { CurriculumCategory } from "@/server/db/schema/curriculum";

/** Pictogramme du NIVEAU 1 (grille de modules) — purement décoratif, même parti pris que `openings/trap-family-icon.ts`. */
const MODULE_ICON: Record<CurriculumCategory, string> = {
  positional_mastery: "🧠",
  jesper_hall_course: "📘",
  pawn_structures: "🧱",
  pawn_weaknesses: "🩹",
  checkmate_patterns: "👑",
  tactical_motifs: "⚡",
  sparring_positions: "🏆",
  endgame_mastery: "♟️",
  lichess_motifs: "🎯",
  lichess_advanced: "🧩",
  lichess_mate_in: "🔢",
  lichess_mate_themes: "☠️",
  lichess_special_moves: "✨",
  lichess_goals_origin: "🏛️",
};

export function moduleIcon(category: CurriculumCategory): string {
  return MODULE_ICON[category];
}
