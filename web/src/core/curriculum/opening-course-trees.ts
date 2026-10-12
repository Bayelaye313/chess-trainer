import type { CourseTree } from "./course-tree";
import { OP_CARO_KANN } from "./course-trees/op-caro-kann";
import { OP_RUY_LOPEZ } from "./course-trees/op-ruy-lopez";
import { OP_SCOTCH_GAMBIT } from "./course-trees/op-scotch-gambit";
import { OP_SCOTCH_GAME } from "./course-trees/op-scotch-game";
import { OP_SLAV_DEFENSE } from "./course-trees/op-slav-defense";

/**
 * Cours d'ouverture « un commentaire par coup » (refonte de l'onglet
 * Ouvertures, 2026-10-10), au même format `CourseTree` que l'Académie et
 * affichables par le même `CourseTreeViewer`. Indexés par l'`id` d'une
 * ouverture de `OPENINGS` (`openings.ts`), pas par un thème du catalogue :
 * ils vivent donc à part de `COURSE_TREES`, dont le test exige des thèmes.
 * Chaque cours suit la trame en 5 parties : fiche d'identité, arbre
 * théorique (coup 10-12 minimum), anti-panique, feuille de route (PRO TIP de
 * fin de branche) ; la partie « architecture » relève du code.
 */
export const OPENING_COURSE_TREES: Record<string, CourseTree> = {
  "scotch-game": OP_SCOTCH_GAME,
  "ruy-lopez": OP_RUY_LOPEZ,
  "caro-kann": OP_CARO_KANN,
  "scotch-gambit": OP_SCOTCH_GAMBIT,
  "slav-defense": OP_SLAV_DEFENSE,
};

export function findOpeningCourseTree(openingId: string): CourseTree | null {
  return OPENING_COURSE_TREES[openingId] ?? null;
}
