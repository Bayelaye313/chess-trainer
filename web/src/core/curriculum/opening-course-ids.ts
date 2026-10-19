/**
 * Ouvertures qui ont un cours commenté (`opening-course-trees.ts`). Liste
 * séparée et sans import des arbres : la fiche d'une ouverture
 * (`opening-explorer.tsx`, composant client) peut afficher le lien « Cours »
 * sans embarquer tous les cours dans son bundle. Le test de
 * `opening-course-trees.test.ts` garantit que les deux listes coïncident.
 */
export const OPENING_COURSE_IDS: ReadonlySet<string> = new Set(["scotch-game", "ruy-lopez", "caro-kann", "scotch-gambit", "slav-defense", "kings-indian", "sicilian-alapin", "italian-game", "sicilian-dragon", "queens-gambit-declined", "anti-london-black"]);

/**
 * Cours qui ne correspondent à aucune partie de l'utilisateur : ils restent
 * accessibles depuis leur fiche, mais le plan du jour ne les impose pas
 * (`listBotStartLines`, `server/queries/daily-plan.ts`).
 */
export const OFF_REPERTOIRE_COURSE_IDS: ReadonlySet<string> = new Set(["slav-defense", "sicilian-dragon", "caro-kann", "sicilian-alapin"]);
