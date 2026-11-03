import type { CourseTree } from "./course-tree";
import { OP_ANTI_LONDON_BLACK } from "./course-trees/op-anti-london-black";
import { OP_BERLIN_BLACK } from "./course-trees/op-berlin-black";
import { OP_CARO_KANN } from "./course-trees/op-caro-kann";
import { OP_BISHOPS_CENTER_BLACK } from "./course-trees/op-bishops-center-black";
import { OP_CARO_KANN_WHITE } from "./course-trees/op-caro-kann-white";
import { OP_FRENCH_WHITE } from "./course-trees/op-french-white";
import { OP_ITALIAN_GAME } from "./course-trees/op-italian-game";
import { OP_ITALIAN_GAME_BLACK } from "./course-trees/op-italian-game-black";
import { OP_KINGS_GAMBIT_VIENNA_BLACK } from "./course-trees/op-kings-gambit-vienna-black";
import { OP_KINGS_INDIAN } from "./course-trees/op-kings-indian";
import { OP_RUY_LOPEZ } from "./course-trees/op-ruy-lopez";
import { OP_OPEN_SICILIAN_WHITE } from "./course-trees/op-open-sicilian-white";
import { OP_PIRC_MODERN_WHITE } from "./course-trees/op-pirc-modern-white";
import { OP_QUEENS_GAMBIT_DECLINED } from "./course-trees/op-queens-gambit-declined";
import { OP_SCOTCH_GAMBIT } from "./course-trees/op-scotch-gambit";
import { OP_SCANDINAVIAN_WHITE } from "./course-trees/op-scandinavian-white";
import { OP_SCOTCH_FOUR_KNIGHTS_BLACK } from "./course-trees/op-scotch-four-knights-black";
import { OP_SCOTCH_GAME } from "./course-trees/op-scotch-game";
import { OP_SICILIAN_ALAPIN } from "./course-trees/op-sicilian-alapin";
import { OP_SICILIAN_DRAGON } from "./course-trees/op-sicilian-dragon";
import { OP_SICILIAN_NAJDORF } from "./course-trees/op-sicilian-najdorf";
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
  "kings-indian": OP_KINGS_INDIAN,
  "sicilian-alapin": OP_SICILIAN_ALAPIN,
  "sicilian-dragon": OP_SICILIAN_DRAGON,
  "italian-game": OP_ITALIAN_GAME,
  "sicilian-najdorf": OP_SICILIAN_NAJDORF,
  "queens-gambit-declined": OP_QUEENS_GAMBIT_DECLINED,
  "anti-london-black": OP_ANTI_LONDON_BLACK,
  "berlin-black": OP_BERLIN_BLACK,
  "italian-game-black": OP_ITALIAN_GAME_BLACK,
  "scotch-four-knights-black": OP_SCOTCH_FOUR_KNIGHTS_BLACK,
  "french-white": OP_FRENCH_WHITE,
  "caro-kann-white": OP_CARO_KANN_WHITE,
  "scandinavian-white": OP_SCANDINAVIAN_WHITE,
  "kings-gambit-vienna-black": OP_KINGS_GAMBIT_VIENNA_BLACK,
  "bishops-center-black": OP_BISHOPS_CENTER_BLACK,
  "open-sicilian-white": OP_OPEN_SICILIAN_WHITE,
  "pirc-modern-white": OP_PIRC_MODERN_WHITE,
};

export function findOpeningCourseTree(openingId: string): CourseTree | null {
  return OPENING_COURSE_TREES[openingId] ?? null;
}
