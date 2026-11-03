/**
 * Ouvertures qui ont un cours commenté (`opening-course-trees.ts`). Liste
 * séparée et sans import des arbres : la fiche d'une ouverture
 * (`opening-explorer.tsx`, composant client) peut afficher le lien « Cours »
 * sans embarquer tous les cours dans son bundle. Le test de
 * `opening-course-trees.test.ts` garantit que les deux listes coïncident.
 */
export const OPENING_COURSE_IDS: ReadonlySet<string> = new Set(["scotch-game", "ruy-lopez", "caro-kann", "scotch-gambit", "slav-defense", "kings-indian", "sicilian-alapin", "italian-game", "sicilian-dragon", "sicilian-najdorf", "queens-gambit-declined", "anti-london-black", "berlin-black", "italian-game-black", "scotch-four-knights-black", "french-white", "caro-kann-white", "scandinavian-white", "kings-gambit-vienna-black", "bishops-center-black", "open-sicilian-white", "pirc-modern-white", "philidor-white"]);

/**
 * Cours hors du répertoire réel de l'utilisateur (Blancs : Écossaise ; Noirs :
 * 1...e5 contre 1.e4, 1...Nf6 contre 1.d4) : ouvertures qu'il ne joue pas, ou
 * cours écrits pour un camp avec lequel il ne les joue jamais (`ruy-lopez` et
 * `italian-game`, côté Blancs). Ils restent accessibles depuis leur fiche,
 * rangés dans « Autres ouvertures » (`isOffRepertoire`), et le plan du jour ne
 * les impose pas (`listBotStartLines`, `server/queries/daily-plan.ts`).
 */
export const OFF_REPERTOIRE_COURSE_IDS: ReadonlySet<string> = new Set(["slav-defense", "sicilian-dragon", "caro-kann", "sicilian-alapin", "sicilian-najdorf", "ruy-lopez", "italian-game"]);
