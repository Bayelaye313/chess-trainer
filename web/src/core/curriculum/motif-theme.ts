import type { CurriculumCategory } from "@/server/db/schema/curriculum";
import type { Motif } from "../chess/types";
import { CURRICULUM_THEMES } from "./catalog";

/**
 * Pont entre un motif tactique repéré en Revue de partie (`Motif`,
 * `core/chess/types.ts` — 6 valeurs) et le thème d'Académie qui l'entraîne —
 * la matière première du bouton « 🎯 S'exercer sur… (Académie) » du Coach
 * (`coach-report.tsx`).
 *
 * Ne code AUCUN id de thème en dur : résout depuis `CURRICULUM_THEMES[].lichessThemes`,
 * seule source de vérité du mapping tag Lichess ↔ thème (voir le docstring de
 * `catalog.ts`, section « Saturation Lichess »). Un motif peut être couvert par
 * plusieurs thèmes (le module curaté "tactical_motifs"/"checkmate_patterns" ET
 * son équivalent `lichess_*`, voir `TACTICAL_MOTIF_LICHESS_TAGS`/
 * `CHECKMATE_PATTERN_LICHESS_TAGS`/`LICHESS_MOTIF_TAGS`) — `CATEGORY_PRIORITY`
 * choisit le module curaté quand il existe (contenu composé à la main, garanti
 * non-vide via `MASTER_PUZZLES_DATASET`), et retombe sur son équivalent
 * `lichess_*` sinon (ex. `hanging_piece`, qui n'a pas d'entrée curatée dédiée).
 */
const MOTIF_LICHESS_TAG: Record<Motif, string> = {
  fork: "fork",
  pin: "pin",
  skewer: "skewer",
  discovered_attack: "discoveredAttack",
  back_rank_mate: "backRankMate",
  hanging_piece: "hangingPiece",
};

const CATEGORY_PRIORITY: readonly CurriculumCategory[] = [
  "tactical_motifs",
  "checkmate_patterns",
  "lichess_motifs",
  "lichess_mate_themes",
  "lichess_advanced",
  "positional_mastery",
  "jesper_hall_course",
  "sparring_positions",
  "endgame_mastery",
  "lichess_mate_in",
  "lichess_special_moves",
  "lichess_goals_origin",
];

export interface MotifTheme {
  themeId: string;
  categoryId: CurriculumCategory;
  title: string;
}

/** Le thème d'Académie recommandé pour s'entraîner sur `motif` — `null` si aucun thème du catalogue ne le couvre (ne devrait pas arriver pour les 6 `Motif` connus, voir le test). */
export function themeForMotif(motif: Motif): MotifTheme | null {
  const tag = MOTIF_LICHESS_TAG[motif];
  const candidates = CURRICULUM_THEMES.filter((theme) => theme.lichessThemes?.includes(tag));
  if (candidates.length === 0) return null;

  const best = [...candidates].sort(
    (a, b) => CATEGORY_PRIORITY.indexOf(a.category) - CATEGORY_PRIORITY.indexOf(b.category),
  )[0];
  return { themeId: best.id, categoryId: best.category, title: best.title };
}
