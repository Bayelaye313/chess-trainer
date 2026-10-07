/**
 * Micro-animation vectorielle du coup adverse — constante partagée par
 * `PuzzleBoard` (Entraîner/Apprendre), `BoardPanel` (partie contre les bots)
 * et `BankPuzzleBoard` (banque tierce), feuille de route Zone 2 :
 *
 *  - La pièce adverse doit PARCOURIR sa trajectoire en 150-200 ms avec une
 *    interpolation fluide ease-in-out — on pilote la bibliothèque via son
 *    option `animationDurationInMs` (défaut 300 ms, trop lent pour un retour
 *    de jeu réactif) ;
 *  - ET le statut visuel des cases (surbrillance du dernier coup adverse)
 *    ne se met à jour qu'APRÈS cette animation : `usePuzzleSolver` diffère son
 *    dispatch `OPPONENT_REPLY_PLAYED` de cette même durée (second minutageur
 *    tracké par ref — jamais un `setState` synchrone en tête d'effet,
 *    `react-hooks/set-state-in-effect`), et `use-play-game` diffère son
 *    `setHighlight` de la même façon.
 *
 * L'easing ease-in-out est forcé côté CSS dans `globals.css`
 * (`[id*="-piece-"][style*="transition"]`) : la bibliothèque pose son
 * `transition: transform` en style inline sans timing-function, et une règle
 * stylesheet en `!important` est le seul levier propre pour l'écraser sans
 * fork du composant.
 */
export const OPPONENT_MOVE_ANIMATION_MS = 180;
