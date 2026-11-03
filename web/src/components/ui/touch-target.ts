/**
 * Zone de clic étendue à 44 px de haut (et 24 px de large au minimum) sur
 * mobile, sans toucher à la mise en page : un pseudo-élément centré sur le
 * bouton reçoit le toucher, le texte et les marges restent identiques.
 * Pour les coups de notation et les pastilles serrées, où agrandir le texte
 * casserait la lecture.
 */
export const TOUCH_HIT_AREA =
  "relative max-sm:before:absolute max-sm:before:left-1/2 max-sm:before:top-1/2 max-sm:before:h-11 max-sm:before:w-full max-sm:before:min-w-6 max-sm:before:-translate-x-1/2 max-sm:before:-translate-y-1/2 max-sm:before:content-['']";
