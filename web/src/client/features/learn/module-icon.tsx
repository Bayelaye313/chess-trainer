import {
  BookOpen,
  Brain,
  Castle,
  ChessKing,
  ChessPawn,
  Crown,
  Flag,
  Hash,
  Landmark,
  Puzzle,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { CurriculumCategory } from "@/server/db/schema/curriculum";

/** Pictogramme de chaque catégorie de l'Académie (une seule bibliothèque : lucide). */
const MODULE_ICON: Record<CurriculumCategory, LucideIcon> = {
  positional_mastery: Brain,
  jesper_hall_course: BookOpen,
  pawn_structures: Castle,
  pawn_weaknesses: ChessPawn,
  middlegame: Swords,
  checkmate_patterns: Crown,
  tactical_motifs: Zap,
  sparring_positions: Trophy,
  endgame_mastery: Flag,
  lichess_motifs: Target,
  lichess_advanced: Puzzle,
  lichess_mate_in: Hash,
  lichess_mate_themes: ChessKing,
  lichess_special_moves: Sparkles,
  lichess_goals_origin: Landmark,
};

export function moduleIcon(category: CurriculumCategory): LucideIcon {
  return MODULE_ICON[category];
}

/**
 * Libellés français des catégories (couche UI uniquement : les ids et
 * `catalog.ts` gardent leurs libellés d'origine).
 */
const CATEGORY_LABEL_FR: Partial<Record<CurriculumCategory, string>> = {
  positional_mastery: "Jeu positionnel",
  checkmate_patterns: "Schémas de mat",
  tactical_motifs: "Motifs tactiques",
  sparring_positions: "Positions à jouer",
  endgame_mastery: "Finales",
};

export function categoryLabel(category: CurriculumCategory, label: string): string {
  return CATEGORY_LABEL_FR[category] ?? label;
}

/** Icône de catégorie, décorative. */
export function ModuleIcon({ category, className = "size-5" }: { category: CurriculumCategory; className?: string }) {
  const Icon = MODULE_ICON[category];
  return <Icon aria-hidden="true" className={`inline-block shrink-0 align-[-0.15em] text-foreground-subtle ${className}`} />;
}
