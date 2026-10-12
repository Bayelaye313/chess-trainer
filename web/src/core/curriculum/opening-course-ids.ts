/**
 * Ouvertures qui ont un cours commenté (`opening-course-trees.ts`). Liste
 * séparée et sans import des arbres : la fiche d'une ouverture
 * (`opening-explorer.tsx`, composant client) peut afficher le lien « Cours »
 * sans embarquer tous les cours dans son bundle. Le test de
 * `opening-course-trees.test.ts` garantit que les deux listes coïncident.
 */
export const OPENING_COURSE_IDS: ReadonlySet<string> = new Set(["scotch-game", "ruy-lopez", "caro-kann", "scotch-gambit", "slav-defense"]);
